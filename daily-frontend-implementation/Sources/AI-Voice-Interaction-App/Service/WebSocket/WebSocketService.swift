import Foundation
import Combine

/// WebSocket事件类型
enum WebSocketEvent {
    case connected
    case disconnected(reason: String?)
    case messageReceived(String)
    case error(Error)
    case ping
    case pong
}

/// WebSocket错误类型
enum WebSocketError: Error, LocalizedError {
    case connectionFailed(reason: String?)
    case messageSendingFailed(message: String)
    case invalidURL
    case networkError(Error)
    case authenticationFailed
    case unexpectedDisconnect
    case timeout
    case unknown(Error?)
    
    var errorDescription: String? {
        switch self {
        case .connectionFailed(let reason):
            let reasonText = reason ?? "未知原因"
            return "WebSocket连接失败: " + reasonText
        case .messageSendingFailed(let message):
            return "消息发送失败: " + message
        case .invalidURL:
            return "无效的WebSocket URL"
        case .networkError(let error):
            return "网络错误: " + error.localizedDescription
        case .authenticationFailed:
            return "认证失败"
        case .unexpectedDisconnect:
            return "意外断开连接"
        case .timeout:
            return "连接超时"
        case .unknown(let error):
            let errorText = error?.localizedDescription ?? "无详细信息"
            return "未知错误: " + errorText
        }
    }
}

/// 认证服务协议
protocol AuthServiceProtocol {
    /// 获取访问令牌
    /// - Returns: 包含访问令牌的发布者
    func getAccessToken() -> AnyPublisher<String, Error>
    
    /// 获取刷新令牌
    /// - Returns: 包含刷新令牌的发布者
    func getRefreshToken() -> AnyPublisher<String, Error>
}

/// WebSocket服务协议
protocol WebSocketServiceProtocol {
    /// WebSocket事件发布者
    var eventPublisher: AnyPublisher<WebSocketEvent, Never> { get }
    
    /// 连接状态
    var isConnected: Bool { get }
    
    /// 连接WebSocket
    func connect()
    
    /// 断开WebSocket连接
    func disconnect(reason: String?)
    
    /// 发送消息
    func sendMessage(_ message: String) -> AnyPublisher<Void, WebSocketError>
    
    /// 发送带超时的消息
    func sendMessage(_ message: String, timeout: TimeInterval) -> AnyPublisher<Void, WebSocketError>
}

/// WebSocket服务实现
class WebSocketService: WebSocketServiceProtocol {
    // MARK: - Properties
    
    /// WebSocket事件发布者
    private let eventSubject = PassthroughSubject<WebSocketEvent, Never>()
    var eventPublisher: AnyPublisher<WebSocketEvent, Never> {
        eventSubject.eraseToAnyPublisher()
    }
    
    /// 连接状态
    @Published private(set) var isConnected: Bool = false
    
    /// WebSocket客户端
    private let client: WebSocketClientProtocol
    
    /// 重连策略
    private let reconnectStrategy: WebSocketReconnectStrategy
    
    /// 重连定时器
    private var reconnectTimer: Timer?
    
    /// 认证服务
    private let authService: AuthServiceProtocol
    
    /// 连接URL
    private let url: URL
    
    /// 取消标记
    private var cancellables = Set<AnyCancellable>()
    
    /// 心跳定时器
    private var heartbeatTimer: Timer?
    
    /// 心跳间隔
    private let heartbeatInterval: TimeInterval = 30
    
    /// 消息队列，用于在断开连接时缓存消息
    private var messageQueue: [String] = []
    
    /// 消息队列锁
    private let messageQueueLock = NSLock()
    
    /// 是否正在处理消息队列
    private var isProcessingMessageQueue = false
    
    // MARK: - Initialization
    
    /// 初始化WebSocket服务
    /// - Parameters:
    ///   - url: WebSocket连接URL
    ///   - authService: 认证服务
    ///   - client: WebSocket客户端（可选，用于测试）
    ///   - reconnectStrategy: 重连策略（可选）
    init(
        url: URL,
        authService: AuthServiceProtocol,
        client: WebSocketClientProtocol? = nil,
        reconnectStrategy: WebSocketReconnectStrategy? = nil
    ) {
        self.url = url
        self.authService = authService
        self.reconnectStrategy = reconnectStrategy ?? ExponentialBackoffReconnectStrategy()
        self.client = client ?? WebSocketClient(url: url)
        
        setupClientEventHandling()
    }
    
    /// 配置客户端事件处理
    private func setupClientEventHandling() {
        client.eventPublisher
            .sink {
                switch $0 {
                case .connected:
                    self.handleConnected()
                case .disconnected(let reason):
                    self.handleDisconnected(reason: reason)
                case .messageReceived(let message):
                    self.handleMessageReceived(message)
                case .error(let error):
                    self.handleError(error)
                case .ping:
                    self.handlePing()
                case .pong:
                    self.handlePong()
                }
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Event Handlers
    
    /// 处理连接成功
    private func handleConnected() {
        isConnected = true
        reconnectStrategy.reset()
        eventSubject.send(.connected)
        
        // 启动心跳
        startHeartbeat()
        
        // 处理消息队列
        processMessageQueue()
    }
    
    /// 处理连接断开
    /// - Parameter reason: 断开原因
    private func handleDisconnected(reason: String?) {
        isConnected = false
        eventSubject.send(.disconnected(reason: reason))
        attemptReconnect()
        
        // 停止心跳
        stopHeartbeat()
    }
    
    /// 处理消息接收
    /// - Parameter message: 接收到的消息
    private func handleMessageReceived(_ message: String) {
        eventSubject.send(.messageReceived(message))
    }
    
    /// 处理错误
    /// - Parameter error: 错误信息
    private func handleError(_ error: Error) {
        eventSubject.send(.error(error))
        
        // 如果连接断开，尝试重连
        if !isConnected {
            attemptReconnect()
        }
    }
    
    /// 处理Ping
    private func handlePing() {
        eventSubject.send(.ping)
    }
    
    /// 处理Pong
    private func handlePong() {
        eventSubject.send(.pong)
    }
    
    // MARK: - Connection Management
    
    /// 连接WebSocket
    func connect() {
        guard !isConnected else {
            return
        }
        
        // 获取认证令牌
        authService.getAccessToken()
            .sink {[weak self] completion in
                guard let self = self else { return }
                
                switch completion {
                case .finished:
                    break
                case .failure(let error):
                    self.eventSubject.send(.error(WebSocketError.authenticationFailed))
                    print("WebSocket认证失败: \(error)")
                }
            } receiveValue: {[weak self] token in
                guard let self = self else { return }
                
                // 创建带认证头的请求
                var request = URLRequest(url: self.url)
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                
                // 连接WebSocket
                self.client.connect(request: request)
            }
            .store(in: &cancellables)
    }
    
    /// 断开WebSocket连接
    /// - Parameter reason: 断开原因
    func disconnect(reason: String?) {
        // 取消重连
        cancelReconnect()
        
        // 断开连接
        client.disconnect(reason: reason)
    }
    
    // MARK: - Message Sending
    
    /// 发送消息
    /// - Parameter message: 要发送的消息
    /// - Returns: 发送结果发布者
    func sendMessage(_ message: String) -> AnyPublisher<Void, WebSocketError> {
        // 如果连接已断开，将消息加入队列
        guard isConnected else {
            messageQueueLock.lock()
            messageQueue.append(message)
            messageQueueLock.unlock()
            return Fail(error: WebSocketError.connectionFailed(reason: "未连接，消息已加入队列")).eraseToAnyPublisher()
        }
        
        return client.sendMessage(message)
    }
    
    /// 发送带超时的消息
    /// - Parameters:
    ///   - message: 要发送的消息
    ///   - timeout: 超时时间
    /// - Returns: 发送结果发布者
    func sendMessage(_ message: String, timeout: TimeInterval) -> AnyPublisher<Void, WebSocketError> {
        // 如果连接已断开，将消息加入队列
        guard isConnected else {
            messageQueueLock.lock()
            messageQueue.append(message)
            messageQueueLock.unlock()
            return Fail(error: WebSocketError.connectionFailed(reason: "未连接，消息已加入队列")).eraseToAnyPublisher()
        }
        
        return client.sendMessage(message, timeout: timeout)
    }
    
    // MARK: - Heartbeat
    
    /// 启动心跳
    private func startHeartbeat() {
        stopHeartbeat()
        
        // 创建心跳定时器
        heartbeatTimer = Timer(
            timeInterval: heartbeatInterval,
            repeats: true
        ) { [weak self] _ in
            self?.sendHeartbeat()
        }
        
        RunLoop.main.add(heartbeatTimer!, forMode: .common)
    }
    
    /// 停止心跳
    private func stopHeartbeat() {
        heartbeatTimer?.invalidate()
        heartbeatTimer = nil
    }
    
    /// 发送心跳
    private func sendHeartbeat() {
        sendMessage("ping")
            .sink {
                if case .failure(let error) = $0 {
                    print("WebSocket心跳发送失败: \(error)")
                }
            } receiveValue: { _ in
                // 心跳发送成功
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Message Queue
    
    /// 处理消息队列
    private func processMessageQueue() {
        guard isConnected, !messageQueue.isEmpty, !isProcessingMessageQueue else {
            return
        }
        
        isProcessingMessageQueue = true
        
        // 复制当前消息队列，避免在处理过程中修改
        let messagesToProcess: [String]
        messageQueueLock.lock()
        messagesToProcess = messageQueue
        messageQueue.removeAll()
        messageQueueLock.unlock()
        
        // 按顺序发送消息
        var index = 0
        
        // 使用var声明闭包，允许递归引用
        var sendNextMessage: (() -> Void)! // 隐式解包，确保初始化前不会被访问
        
        sendNextMessage = { [weak self] in
            guard let self = self, index < messagesToProcess.count else {
                self?.isProcessingMessageQueue = false
                return
            }
            
            let message = messagesToProcess[index]
            index += 1
            
            self.sendMessage(message)
                .sink {
                    if case .failure(let error) = $0 {
                        print("WebSocket队列消息发送失败: \(error)")
                        // 将失败的消息重新加入队列
                        self.messageQueueLock.lock()
                        self.messageQueue.append(message)
                        self.messageQueueLock.unlock()
                    }
                    // 继续处理下一条消息
                    sendNextMessage()
                } receiveValue: {
                    // 消息发送成功，继续处理下一条
                    sendNextMessage()
                }
                .store(in: &self.cancellables)
        }
        
        sendNextMessage()
    }
    
    // MARK: - Reconnection Logic
    
    /// 尝试重连
    private func attemptReconnect() {
        guard !isConnected, reconnectStrategy.shouldReconnect else {
            return
        }
        
        let delay = reconnectStrategy.nextReconnectDelay()
        print("WebSocket尝试重连，延迟 \(delay) 秒")
        
        // 取消现有的重连定时器
        cancelReconnect()
        
        // 创建新的重连定时器
        let timer = Timer(
            timeInterval: delay,
            repeats: false
        ) { [weak self] _ in
            self?.connect()
        }
        
        RunLoop.main.add(timer, forMode: .common)
        reconnectTimer = timer
    }
    
    /// 取消重连
    private func cancelReconnect() {
        reconnectTimer?.invalidate()
        reconnectTimer = nil
    }
}

/// WebSocket客户端协议
protocol WebSocketClientProtocol {
    /// WebSocket事件发布者
    var eventPublisher: AnyPublisher<WebSocketEvent, Never> { get }
    
    /// 连接状态
    var isConnected: Bool { get }
    
    /// 连接WebSocket
    func connect(request: URLRequest)
    
    /// 断开WebSocket连接
    func disconnect(reason: String?)
    
    /// 发送消息
    func sendMessage(_ message: String) -> AnyPublisher<Void, WebSocketError>
    
    /// 发送带超时的消息
    func sendMessage(_ message: String, timeout: TimeInterval) -> AnyPublisher<Void, WebSocketError>
}

/// WebSocket客户端实现
class WebSocketClient: NSObject, WebSocketClientProtocol, URLSessionWebSocketDelegate {
    // MARK: - Properties
    
    /// WebSocket事件发布者
    private let eventSubject = PassthroughSubject<WebSocketEvent, Never>()
    var eventPublisher: AnyPublisher<WebSocketEvent, Never> {
        eventSubject.eraseToAnyPublisher()
    }
    
    /// 连接状态
    @Published private(set) var isConnected: Bool = false
    
    /// WebSocket连接
    private var webSocket: URLSessionWebSocketTask?
    
    /// URL会话
    private let session: URLSession
    
    /// 连接URL
    private let url: URL
    
    /// 取消标记
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    /// 初始化WebSocket客户端
    /// - Parameters:
    ///   - url: WebSocket连接URL
    ///   - session: URL会话（可选，用于测试）
    init(url: URL, session: URLSession? = nil) {
        self.url = url
        self.session = session ?? URLSession(configuration: .default, delegate: nil, delegateQueue: nil)
        super.init()
    }
    
    // MARK: - Connection Management
    
    /// 连接WebSocket
    /// - Parameter request: WebSocket连接请求
    func connect(request: URLRequest) {
        guard !isConnected else {
            return
        }
        
        webSocket = session.webSocketTask(with: request)
        webSocket?.resume()
        
        // 开始接收消息
        receiveMessages()
        
        // 发送连接成功事件
        isConnected = true
        eventSubject.send(.connected)
    }
    
    /// 断开WebSocket连接
    /// - Parameter reason: 断开原因
    func disconnect(reason: String?) {
        guard isConnected else {
            return
        }
        
        webSocket?.cancel(with: .goingAway, reason: reason?.data(using: .utf8))
        webSocket = nil
        
        // 发送断开连接事件
        isConnected = false
        eventSubject.send(.disconnected(reason: reason))
    }
    
    // MARK: - Message Handling
    
    /// 持续接收消息
    private func receiveMessages() {
        guard let webSocket = webSocket else {
            return
        }
        
        webSocket.receive {[weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let message):
                switch message {
                case .string(let string):
                    self.handleMessage(string)
                case .data(let data):
                    if let string = String(data: data, encoding: .utf8) {
                        self.handleMessage(string)
                    } else {
                        self.eventSubject.send(.error(WebSocketError.connectionFailed(reason: "无法解析二进制消息")))
                    }
                @unknown default:
                    self.eventSubject.send(.error(WebSocketError.connectionFailed(reason: "未知消息类型")))
                }
                
                // 继续接收下一条消息
                self.receiveMessages()
                
            case .failure(let error):
                self.handleError(error)
            }
        }
    }
    
    /// 处理接收到的消息
    /// - Parameter message: 接收到的消息
    private func handleMessage(_ message: String) {
        eventSubject.send(.messageReceived(message))
    }
    
    /// 处理错误
    /// - Parameter error: 错误信息
    private func handleError(_ error: Error) {
        let webSocketError = WebSocketError.networkError(error)
        eventSubject.send(.error(webSocketError))
        
        // 如果连接断开，发送断开连接事件
        if !isConnected {
            eventSubject.send(.disconnected(reason: error.localizedDescription))
        }
    }
    
    // MARK: - Message Sending
    
    /// 发送消息
    /// - Parameter message: 要发送的消息
    /// - Returns: 发送结果发布者
    func sendMessage(_ message: String) -> AnyPublisher<Void, WebSocketError> {
        Future {[weak self] promise in
            guard let self = self, let webSocket = self.webSocket else {
                promise(.failure(.connectionFailed(reason: "未连接")))
                return
            }
            
            webSocket.send(.string(message)) { error in
                if let error = error {
                    promise(.failure(.messageSendingFailed(message: error.localizedDescription)))
                } else {
                    promise(.success(()))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    /// 发送带超时的消息
    /// - Parameters:
    ///   - message: 要发送的消息
    ///   - timeout: 超时时间
    /// - Returns: 发送结果发布者
    func sendMessage(_ message: String, timeout: TimeInterval) -> AnyPublisher<Void, WebSocketError> {
        sendMessage(message)
            .timeout(
                .seconds(timeout),
                scheduler: RunLoop.main,
                options: nil,
                customError: { .timeout }
            )
            .eraseToAnyPublisher()
    }
    
    // MARK: - URLSessionWebSocketDelegate
    
    /// 处理WebSocket任务关闭
    /// - Parameters:
    ///   - session: URL会话
    ///   - webSocketTask: WebSocket任务
    ///   - closeCode: 关闭代码
    ///   - reason: 关闭原因
    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didCloseWith closeCode: URLSessionWebSocketTask.CloseCode, reason: Data?) {
        let reasonString = reason.flatMap { String(data: $0, encoding: .utf8) }
        
        // 发送断开连接事件
        isConnected = false
        eventSubject.send(.disconnected(reason: reasonString))
    }
}

// MARK: - Reconnection Strategies

/// WebSocket重连策略协议
protocol WebSocketReconnectStrategy {
    /// 是否应该重连
    var shouldReconnect: Bool { get }
    
    /// 获取下一次重连延迟
    func nextReconnectDelay() -> TimeInterval
    
    /// 重置重连策略
    func reset()
}

/// 指数退避重连策略
class ExponentialBackoffReconnectStrategy: WebSocketReconnectStrategy {
    /// 最大重连次数
    private let maxAttempts: Int
    
    /// 初始延迟（秒）
    private let initialDelay: TimeInterval
    
    /// 最大延迟（秒）
    private let maxDelay: TimeInterval
    
    /// 重试次数
    private var attempts: Int = 0
    
    /// 是否应该重连
    var shouldReconnect: Bool {
        attempts < maxAttempts
    }
    
    /// 初始化指数退避重连策略
    /// - Parameters:
    ///   - maxAttempts: 最大重连次数
    ///   - initialDelay: 初始延迟（秒）
    ///   - maxDelay: 最大延迟（秒）
    init(maxAttempts: Int = 5, initialDelay: TimeInterval = 1, maxDelay: TimeInterval = 30) {
        self.maxAttempts = maxAttempts
        self.initialDelay = initialDelay
        self.maxDelay = maxDelay
    }
    
    /// 获取下一次重连延迟
    /// - Returns: 重连延迟（秒）
    func nextReconnectDelay() -> TimeInterval {
        let delay = min(
            initialDelay * pow(2, Double(attempts)),
            maxDelay
        )
        attempts += 1
        return delay
    }
    
    /// 重置重连策略
    func reset() {
        attempts = 0
    }
}

/// 固定延迟重连策略
class FixedDelayReconnectStrategy: WebSocketReconnectStrategy {
    /// 最大重连次数
    private let maxAttempts: Int
    
    /// 固定延迟（秒）
    private let delay: TimeInterval
    
    /// 重试次数
    private var attempts: Int = 0
    
    /// 是否应该重连
    var shouldReconnect: Bool {
        attempts < maxAttempts
    }
    
    /// 初始化固定延迟重连策略
    /// - Parameters:
    ///   - maxAttempts: 最大重连次数
    ///   - delay: 固定延迟（秒）
    init(maxAttempts: Int = 5, delay: TimeInterval = 5) {
        self.maxAttempts = maxAttempts
        self.delay = delay
    }
    
    /// 获取下一次重连延迟
    /// - Returns: 重连延迟（秒）
    func nextReconnectDelay() -> TimeInterval {
        attempts += 1
        return delay
    }
    
    /// 重置重连策略
    func reset() {
        attempts = 0
    }
}