import XCTest
import Combine
@testable import AI_Voice_Interaction_App

/// WebSocketService单元测试
class WebSocketServiceTests: XCTestCase {
    
    // 模拟认证服务
    class MockAuthService: AuthServiceProtocol {
        var getAccessTokenCalled = false
        var accessToken: String = "test-token"
        
        func getAccessToken() -> AnyPublisher<String, AuthError> {
            getAccessTokenCalled = true
            return Just(accessToken)
                .setFailureType(to: AuthError.self)
                .eraseToAnyPublisher()
        }
        
        func refreshAccessToken() -> AnyPublisher<String, AuthError> {
            return Just(accessToken)
                .setFailureType(to: AuthError.self)
                .eraseToAnyPublisher()
        }
        
        func isTokenValid() -> Bool {
            return true
        }
        
        func logout() -> AnyPublisher<Void, AuthError> {
            return Just(()).setFailureType(to: AuthError.self).eraseToAnyPublisher()
        }
    }
    
    // 模拟WebSocket客户端
    class MockWebSocketClient: WebSocketClientProtocol {
        // 模拟事件发布者
        let eventSubject = PassthroughSubject<WebSocketEvent, Never>()
        var eventPublisher: AnyPublisher<WebSocketEvent, Never> {
            eventSubject.eraseToAnyPublisher()
        }
        
        // 模拟连接状态
        @Published var isConnected: Bool = false
        
        // 模拟方法调用计数
        var connectCalled = false
        var disconnectCalled = false
        var sendMessageCalled = false
        
        // 模拟连接请求
        func connect(request: URLRequest) {
            connectCalled = true
            isConnected = true
            eventSubject.send(.connected)
        }
        
        // 模拟断开连接
        func disconnect(reason: String?) {
            disconnectCalled = true
            isConnected = false
            eventSubject.send(.disconnected(reason: reason))
        }
        
        // 模拟发送消息
        func sendMessage(_ message: String) -> AnyPublisher<Void, WebSocketError> {
            sendMessageCalled = true
            return Just(()).setFailureType(to: WebSocketError.self).eraseToAnyPublisher()
        }
        
        // 模拟发送带超时的消息
        func sendMessage(_ message: String, timeout: TimeInterval) -> AnyPublisher<Void, WebSocketError> {
            sendMessageCalled = true
            return Just(()).setFailureType(to: WebSocketError.self).eraseToAnyPublisher()
        }
        
        // 发送测试事件
        func sendTestEvent(_ event: WebSocketEvent) {
            eventSubject.send(event)
        }
    }
    
    // 测试用例
    var webSocketService: WebSocketService!
    var mockAuthService: MockAuthService!
    var mockWebSocketClient: MockWebSocketClient!
    var cancellables: Set<AnyCancellable> = []
    
    override func setUp() {
        super.setUp()
        
        // 创建模拟对象
        mockAuthService = MockAuthService()
        mockWebSocketClient = MockWebSocketClient()
        
        // 创建WebSocketService实例
        let url = URL(string: "ws://localhost:8080")!
        webSocketService = WebSocketService(
            url: url,
            authService: mockAuthService,
            client: mockWebSocketClient,
            reconnectStrategy: FixedDelayReconnectStrategy(maxAttempts: 3, delay: 1)
        )
    }
    
    override func tearDown() {
        webSocketService = nil
        mockAuthService = nil
        mockWebSocketClient = nil
        cancellables.removeAll()
        super.tearDown()
    }
    
    // MARK: - 测试连接功能
    
    /// 测试连接功能
    func testConnect() {
        // 预期
        let expectation = XCTestExpectation(description: "连接成功")
        
        // 监听连接事件
        webSocketService.eventPublisher
            .sink {event in
                if case .connected = event {
                    expectation.fulfill()
                }
            }
            .store(in: &cancellables)
        
        // 执行连接
        webSocketService.connect()
        
        // 等待结果
        wait(for: [expectation], timeout: 1.0)
        
        // 验证
        XCTAssertTrue(mockAuthService.getAccessTokenCalled)
        XCTAssertTrue(mockWebSocketClient.connectCalled)
        XCTAssertTrue(webSocketService.isConnected)
    }
    
    /// 测试断开连接功能
    func testDisconnect() {
        // 预期
        let expectation = XCTestExpectation(description: "断开连接成功")
        
        // 先连接
        webSocketService.connect()
        
        // 监听断开连接事件
        webSocketService.eventPublisher
            .sink {event in
                if case .disconnected = event {
                    expectation.fulfill()
                }
            }
            .store(in: &cancellables)
        
        // 执行断开连接
        webSocketService.disconnect(reason: "测试断开")
        
        // 等待结果
        wait(for: [expectation], timeout: 1.0)
        
        // 验证
        XCTAssertTrue(mockWebSocketClient.disconnectCalled)
        XCTAssertFalse(webSocketService.isConnected)
    }
    
    // MARK: - 测试消息发送
    
    /// 测试消息发送功能
    func testSendMessage() {
        // 先连接
        webSocketService.connect()
        
        // 发送消息
        webSocketService.sendMessage("test-message")
            .sink { _ in }
            receiveValue: { _ in
                // 验证
                XCTAssertTrue(self.mockWebSocketClient.sendMessageCalled)
            }
            .store(in: &cancellables)
    }
    
    /// 测试断开连接时消息加入队列
    func testMessageQueueWhenDisconnected() {
        // 确保未连接
        XCTAssertFalse(webSocketService.isConnected)
        
        // 发送消息，应该加入队列
        webSocketService.sendMessage("queued-message")
            .sink {completion in
                if case .failure(let error) = completion {
                    XCTAssertEqual(error.localizedDescription, "WebSocket连接失败: 未连接，消息已加入队列")
                }
            }
            receiveValue: { _ in
                XCTFail("消息发送不应成功")
            }
            .store(in: &cancellables)
        
        // 现在连接，应该处理队列中的消息
        let expectation = XCTestExpectation(description: "消息队列处理成功")
        
        webSocketService.eventPublisher
            .sink {event in
                if case .connected = event {
                    // 连接成功后，应该处理消息队列
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        expectation.fulfill()
                    }
                }
            }
            .store(in: &cancellables)
        
        webSocketService.connect()
        
        wait(for: [expectation], timeout: 1.0)
    }
    
    // MARK: - 测试心跳机制
    
    /// 测试心跳机制
    func testHeartbeat() {
        // 预期心跳定时器会启动
        let expectation = XCTestExpectation(description: "心跳发送")
        expectation.isInverted = true // 我们不希望在短时间内看到心跳发送，因为定时器需要时间
        
        // 连接
        webSocketService.connect()
        
        // 等待一小段时间，心跳定时器应该启动，但还没到发送时间
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 1.0)
    }
    
    // MARK: - 测试重连策略
    
    /// 测试重连策略
    func testReconnectStrategy() {
        // 预期会尝试重连
        let expectation = XCTestExpectation(description: "重连尝试")
        expectation.expectedFulfillmentCount = 2 // 连接成功和断开连接两个事件
        
        var eventCount = 0
        webSocketService.eventPublisher
            .sink {event in
                eventCount += 1
                if eventCount == 2 {
                    expectation.fulfill()
                }
            }
            .store(in: &cancellables)
        
        // 连接
        webSocketService.connect()
        
        // 发送断开连接事件，应该触发重连
        mockWebSocketClient.sendTestEvent(.disconnected(reason: "测试断开"))
        
        wait(for: [expectation], timeout: 2.0)
    }
    
    // MARK: - 测试事件处理
    
    /// 测试消息接收事件
    func testMessageReceivedEvent() {
        // 预期
        let expectation = XCTestExpectation(description: "消息接收")
        
        // 监听消息接收事件
        webSocketService.eventPublisher
            .sink {event in
                if case .messageReceived(let message) = event {
                    XCTAssertEqual(message, "test-message")
                    expectation.fulfill()
                }
            }
            .store(in: &cancellables)
        
        // 发送测试消息
        mockWebSocketClient.sendTestEvent(.messageReceived("test-message"))
        
        wait(for: [expectation], timeout: 1.0)
    }
    
    /// 测试错误事件
    func testErrorEvent() {
        // 预期
        let expectation = XCTestExpectation(description: "错误事件")
        
        // 监听错误事件
        webSocketService.eventPublisher
            .sink {event in
                if case .error(let error) = event {
                    XCTAssertNotNil(error)
                    expectation.fulfill()
                }
            }
            .store(in: &cancellables)
        
        // 发送测试错误
        let testError = WebSocketError.connectionFailed(reason: "测试错误")
        mockWebSocketClient.sendTestEvent(.error(testError))
        
        wait(for: [expectation], timeout: 1.0)
    }
}
