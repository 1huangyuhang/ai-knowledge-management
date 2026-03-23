# Day 25: WebSocket连接实现 - 技术实现文档

## 核心任务
实现WebSocket连接管理，包括连接建立、状态管理、认证机制和心跳机制。

## 技术实现细节

### 1. WebSocket服务设计

**核心功能**：管理WebSocket连接生命周期，处理连接状态，实现重连机制。

**技术选型**：使用`URLSessionWebSocketTask`实现WebSocket通信，结合`Combine`框架实现响应式状态管理。

**文件结构**：
```
Sources/
└── AI-Voice-Interaction-App/
    ├── Service/
    │   ├── WebSocket/
    │   │   ├── WebSocketService.swift
    │   │   ├── WebSocketMessage.swift
    │   │   ├── WebSocketState.swift
    │   │   └── WebSocketError.swift
    │   └── DependencyContainer.swift
    └── Model/
        └── WebSocket/
            ├── WebSocketEvent.swift
            └── WebSocketPayload.swift
```

### 2. WebSocketService实现

**核心代码**：

```swift
// WebSocketService.swift
import Foundation
import Combine

enum WebSocketState {
    case disconnected
    case connecting
    case connected
    case reconnecting
}

protocol WebSocketServiceProtocol {
    var state: CurrentValueSubject<WebSocketState, Never> { get }
    var messagePublisher: PassthroughSubject<WebSocketMessage, Never> { get }
    
    func connect()
    func disconnect()
    func send(message: WebSocketMessage)
}

class WebSocketService: WebSocketServiceProtocol {
    private let url: URL
    private let token: String
    private var webSocketTask: URLSessionWebSocketTask?
    private let session: URLSession
    private var reconnectTimer: Timer?
    private let reconnectDelay: TimeInterval = 5
    private var pingTimer: Timer?
    private let pingInterval: TimeInterval = 30
    
    // MARK: - Published Properties
    var state = CurrentValueSubject<WebSocketState, Never>(.disconnected)
    var messagePublisher = PassthroughSubject<WebSocketMessage, Never>()
    
    // MARK: - Initialization
    init(url: URL, token: String) {
        self.url = url
        self.token = token
        self.session = URLSession(configuration: .default)
    }
    
    // MARK: - Connection Management
    func connect() {
        guard state.value != .connected else { return }
        
        state.send(.connecting)
        
        // 创建WebSocket任务
        webSocketTask = session.webSocketTask(with: url)
        
        // 设置委托（如果需要）
        // webSocketTask?.delegate = self
        
        // 开始连接
        webSocketTask?.resume()
        
        // 开始接收消息
        receiveMessage()
        
        // 发送认证消息
        sendAuthMessage()
        
        // 启动心跳机制
        startPingTimer()
    }
    
    func disconnect() {
        state.send(.disconnected)
        stopPingTimer()
        stopReconnectTimer()
        webSocketTask?.cancel(with: .normalClosure, reason: nil)
        webSocketTask = nil
    }
    
    // MARK: - Message Handling
    func send(message: WebSocketMessage) {
        guard state.value == .connected else {
            print("WebSocket not connected, cannot send message")
            return
        }
        
        // 序列化消息为JSON
        do {
            let jsonData = try JSONEncoder().encode(message)
            let jsonString = String(data: jsonData, encoding: .utf8) ?? ""
            webSocketTask?.send(.string(jsonString)) { error in
                if let error = error {
                    print("Error sending WebSocket message: \(error)")
                    self.handleConnectionError(error)
                }
            }
        } catch {
            print("Error encoding WebSocket message: \(error)")
        }
    }
    
    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let message):
                // 处理接收到的消息
                self.handleReceivedMessage(message)
                // 继续接收下一条消息
                self.receiveMessage()
            case .failure(let error):
                // 处理接收错误
                self.handleConnectionError(error)
            }
        }
    }
    
    private func handleReceivedMessage(_ message: URLSessionWebSocketTask.Message) {
        switch message {
        case .string(let string):
            // 解析JSON字符串
            do {
                let jsonData = string.data(using: .utf8) ?? Data()
                let webSocketMessage = try JSONDecoder().decode(WebSocketMessage.self, from: jsonData)
                messagePublisher.send(webSocketMessage)
                
                // 处理特殊消息类型
                switch webSocketMessage.type {
                case .pong:
                    // 处理心跳响应
                    break
                case .authSuccess:
                    // 认证成功，更新状态
                    state.send(.connected)
                default:
                    // 其他消息类型由订阅者处理
                    break
                }
            } catch {
                print("Error decoding WebSocket message: \(error)")
            }
        case .data(let data):
            // 处理二进制消息（如果需要）
            print("Received binary message: \(data)")
        @unknown default:
            print("Received unknown message type")
        }
    }
    
    // MARK: - Authentication
    private func sendAuthMessage() {
        let authMessage = WebSocketMessage(
            type: .auth,
            payload: ["token": token]
        )
        send(message: authMessage)
    }
    
    // MARK: - Heartbeat Mechanism
    private func startPingTimer() {
        stopPingTimer()
        pingTimer = Timer.scheduledTimer(withTimeInterval: pingInterval, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            
            let pingMessage = WebSocketMessage(type: .ping, payload: [:])
            self.send(message: pingMessage)
        }
        RunLoop.main.add(pingTimer!, forMode: .common)
    }
    
    private func stopPingTimer() {
        pingTimer?.invalidate()
        pingTimer = nil
    }
    
    // MARK: - Reconnection Mechanism
    private func handleConnectionError(_ error: Error) {
        print("WebSocket connection error: \(error)")
        
        // 更新状态为断开连接
        state.send(.disconnected)
        
        // 停止心跳
        stopPingTimer()
        
        // 启动重连机制
        startReconnectTimer()
    }
    
    private func startReconnectTimer() {
        stopReconnectTimer()
        reconnectTimer = Timer.scheduledTimer(withTimeInterval: reconnectDelay, repeats: false) { [weak self] _ in
            guard let self = self else { return }
            self.state.send(.reconnecting)
            self.connect()
        }
        RunLoop.main.add(reconnectTimer!, forMode: .common)
    }
    
    private func stopReconnectTimer() {
        reconnectTimer?.invalidate()
        reconnectTimer = nil
    }
}
```

### 3. WebSocket消息模型

**核心代码**：

```swift
// WebSocketMessage.swift
import Foundation

enum WebSocketMessageType: String, Codable {
    // 系统消息
    case auth = "auth"           // 认证
    case authSuccess = "auth_success"  // 认证成功
    case authFailed = "auth_failed"    // 认证失败
    case ping = "ping"           // 心跳请求
    case pong = "pong"           // 心跳响应
    
    // 业务消息
    case modelUpdated = "model_updated"  // 认知模型更新
    case analysisResult = "analysis_result"  // 分析结果推送
    case conversationMessage = "conversation_message"  // 对话消息
}

struct WebSocketMessage: Codable {
    let type: WebSocketMessageType
    let payload: [String: AnyCodable]
    let timestamp: Date = Date()
}

// AnyCodable.swift - 用于处理动态JSON数据
struct AnyCodable: Codable {
    let value: Any
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        
        if let boolValue = try? container.decode(Bool.self) {
            value = boolValue
        } else if let intValue = try? container.decode(Int.self) {
            value = intValue
        } else if let doubleValue = try? container.decode(Double.self) {
            value = doubleValue
        } else if let stringValue = try? container.decode(String.self) {
            value = stringValue
        } else if let arrayValue = try? container.decode([AnyCodable].self) {
            value = arrayValue.map { $0.value }
        } else if let dictionaryValue = try? container.decode([String: AnyCodable].self) {
            value = dictionaryValue.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode value")
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        
        switch value {
        case let boolValue as Bool:
            try container.encode(boolValue)
        case let intValue as Int:
            try container.encode(intValue)
        case let doubleValue as Double:
            try container.encode(doubleValue)
        case let stringValue as String:
            try container.encode(stringValue)
        case let arrayValue as [Any]:
            let codableArray = arrayValue.map { AnyCodable(value: $0) }
            try container.encode(codableArray)
        case let dictionaryValue as [String: Any]:
            let codableDictionary = dictionaryValue.mapValues { AnyCodable(value: $0) }
            try container.encode(codableDictionary)
        default:
            throw EncodingError.invalidValue(value, EncodingError.Context(codingPath: container.codingPath, debugDescription: "Cannot encode value"))
        }
    }
}
```

### 4. WebSocket事件处理

**核心代码**：

```swift
// WebSocketEvent.swift
import Foundation

enum WebSocketEvent {
    case connected
    case disconnected(error: Error?)
    case messageReceived(WebSocketMessage)
    case error(Error)
}

// WebSocketPayload.swift - 业务消息 payload 定义
struct ModelUpdatedPayload: Codable {
    let modelId: String
    let updates: [ModelUpdate]
}

struct ModelUpdate: Codable {
    let type: UpdateType
    let content: [String: AnyCodable]
}

enum UpdateType: String, Codable {
    case nodeAdded = "node_added"
    case nodeUpdated = "node_updated"
    case nodeDeleted = "node_deleted"
    case edgeAdded = "edge_added"
    case edgeUpdated = "edge_updated"
    case edgeDeleted = "edge_deleted"
}
```

### 5. WebSocket集成到应用架构

**核心代码**：

```swift
// 在DependencyContainer中注册WebSocketService
class DependencyContainer {
    // 其他服务...
    
    private lazy var webSocketService: WebSocketServiceProtocol = {
        guard let token = keychainService.getAuthToken() else {
            fatalError("No auth token available for WebSocket connection")
        }
        
        // 从配置中获取WebSocket URL
        let wsUrlString = configurationService.getWebSocketUrl()
        guard let wsUrl = URL(string: wsUrlString) else {
            fatalError("Invalid WebSocket URL")
        }
        
        return WebSocketService(url: wsUrl, token: token)
    }()
    
    func resolveWebSocketService() -> WebSocketServiceProtocol {
        return webSocketService
    }
}

// 在App入口初始化并启动WebSocket连接
@main
struct AIVoiceInteractionApp: App {
    @EnvironmentObject private var appState: AppState
    private let dependencyContainer = DependencyContainer()
    private var cancellables = Set<AnyCancellable>()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(dependencyContainer.resolveAuthService())
                // 其他环境对象...
        }
    }
    
    init() {
        // 初始化服务
        let webSocketService = dependencyContainer.resolveWebSocketService()
        
        // 监听WebSocket状态变化
        webSocketService.state
            .sink {[weak appState] state in
                appState?.updateWebSocketState(state)
            }
            .store(in: &cancellables)
        
        // 监听WebSocket消息
        webSocketService.messagePublisher
            .sink {message in
                // 分发消息到相应的处理器
                handleWebSocketMessage(message)
            }
            .store(in: &cancellables)
        
        // 启动WebSocket连接
        webSocketService.connect()
    }
    
    private func handleWebSocketMessage(_ message: WebSocketMessage) {
        switch message.type {
        case .modelUpdated:
            // 处理认知模型更新
            NotificationCenter.default.post(name: .cognitiveModelUpdated, object: message.payload)
        case .analysisResult:
            // 处理分析结果推送
            NotificationCenter.default.post(name: .analysisResultReceived, object: message.payload)
        case .conversationMessage:
            // 处理对话消息
            NotificationCenter.default.post(name: .conversationMessageReceived, object: message.payload)
        default:
            // 其他系统消息已在WebSocketService中处理
            break
        }
    }
}
```

### 6. WebSocket连接状态管理

**核心代码**：

```swift
// 在AppState中添加WebSocket状态管理
class AppState: ObservableObject {
    // 其他状态...
    
    @Published var webSocketState: WebSocketState = .disconnected
    
    func updateWebSocketState(_ state: WebSocketState) {
        self.webSocketState = state
        
        // 根据状态更新UI或执行相应操作
        switch state {
        case .connected:
            print("WebSocket connected")
        case .disconnected:
            print("WebSocket disconnected")
        case .connecting:
            print("WebSocket connecting...")
        case .reconnecting:
            print("WebSocket reconnecting...")
        }
    }
}

// 扩展WebSocketState以支持UI显示
extension WebSocketState {
    var displayText: String {
        switch self {
        case .disconnected:
            return "已断开"
        case .connecting:
            return "连接中..."
        case .connected:
            return "已连接"
        case .reconnecting:
            return "重连中..."
        }
    }
    
    var isConnected: Bool {
        return self == .connected
    }
}
```

### 7. 测试与调试

**核心实现**：

```swift
// WebSocketServiceMock.swift - 用于测试
class WebSocketServiceMock: WebSocketServiceProtocol {
    var state = CurrentValueSubject<WebSocketState, Never>(.connected)
    var messagePublisher = PassthroughSubject<WebSocketMessage, Never>()
    
    func connect() {
        state.send(.connected)
    }
    
    func disconnect() {
        state.send(.disconnected)
    }
    
    func send(message: WebSocketMessage) {
        // 模拟发送消息
        print("Mock WebSocket send: \(message.type.rawValue)")
        
        // 模拟服务器响应
        if message.type == .ping {
            let pongMessage = WebSocketMessage(type: .pong, payload: [:])
            messagePublisher.send(pongMessage)
        }
    }
    
    // 模拟接收消息
    func simulateMessage(_ message: WebSocketMessage) {
        messagePublisher.send(message)
    }
}

// WebSocket连接测试
func testWebSocketConnection() {
    let mockService = WebSocketServiceMock()
    var receivedMessages: [WebSocketMessage] = []
    
    // 订阅消息
    mockService.messagePublisher
        .sink { message in
            receivedMessages.append(message)
        }
        .store(in: &cancellables)
    
    // 测试连接
    mockService.connect()
    XCTAssertEqual(mockService.state.value, .connected)
    
    // 测试发送消息
    let testMessage = WebSocketMessage(type: .ping, payload: [:])
    mockService.send(message: testMessage)
    
    // 验证接收消息
    XCTAssertEqual(receivedMessages.count, 1)
    XCTAssertEqual(receivedMessages[0].type, .pong)
    
    // 测试断开连接
    mockService.disconnect()
    XCTAssertEqual(mockService.state.value, .disconnected)
}
```

## 核心功能与技术亮点

1. **可靠的连接管理**：实现了完整的WebSocket连接生命周期管理，包括连接、断开、重连机制。

2. **安全的认证机制**：通过发送认证token确保WebSocket连接的安全性。

3. **健壮的心跳机制**：使用ping/pong消息检测连接状态，确保实时通信的可靠性。

4. **响应式状态管理**：结合Combine框架实现WebSocket状态的响应式更新，便于UI层监听和展示。

5. **灵活的消息处理**：使用泛型和AnyCodable处理不同类型的WebSocket消息，支持业务扩展。

6. **易于测试的设计**：通过协议抽象和Mock实现，便于进行单元测试和集成测试。

7. **与应用架构深度集成**：WebSocket服务作为核心服务集成到应用架构中，便于各模块使用。

## 性能优化考虑

1. **连接状态缓存**：避免频繁创建和销毁WebSocket连接，提高资源利用率。

2. **消息批处理**：对于高频消息，考虑实现批处理机制，减少UI更新频率。

3. **断线重连策略**：实现指数退避重连策略，避免在网络不稳定时频繁重连导致的资源消耗。

4. **内存管理**：确保WebSocket相关的订阅和定时器在适当的时候被取消，避免内存泄漏。

5. **后台连接管理**：处理应用前后台切换时的WebSocket连接状态，优化资源使用。

## 总结

第25天成功实现了WebSocket连接管理的核心功能，包括连接建立、状态管理、认证机制、心跳机制和重连逻辑。WebSocket服务作为实时通信的基础，将为后续的实时数据同步和推送功能提供可靠支持。

该实现遵循了高内聚、低耦合的设计原则，通过协议抽象和依赖注入，便于测试和扩展。结合Combine框架实现的响应式设计，使WebSocket状态和消息能够高效地传递到应用的各个模块。

接下来的第26天，将基于此WebSocket连接实现，开发事件处理机制，处理具体的业务消息类型，实现认知模型更新、分析结果推送等实时功能。