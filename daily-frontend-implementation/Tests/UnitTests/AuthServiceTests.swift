import XCTest
import Combine
@testable import AI_Voice_Interaction_App

/// 认证服务单元测试
class AuthServiceTests: XCTestCase {
    
    // 模拟API客户端
    class MockAPIClient: APIClientProtocol {
        let responseSubject = PassthroughSubject<APIResponse<LoginResponse>, APIError>()
        
        func request<T>(_ request: APIRequest) -> AnyPublisher<APIResponse<T>, APIError> where T : Decodable {
            return responseSubject
                .map { response in
                    guard let typedResponse = response as? APIResponse<T> else {
                        throw APIError.invalidResponse
                    }
                    return typedResponse
                }
                .eraseToAnyPublisher()
        }
    }
    
    // 模拟Keychain服务
    class MockKeychainService: KeychainServiceProtocol {
        var storedToken: String?
        var storedRefreshToken: String?
        var storedUser: Data?
        
        func saveToken(_ token: String) -> Bool {
            storedToken = token
            return true
        }
        
        func saveRefreshToken(_ token: String) -> Bool {
            storedRefreshToken = token
            return true
        }
        
        func getToken() -> String? {
            return storedToken
        }
        
        func getRefreshToken() -> String? {
            return storedRefreshToken
        }
        
        func deleteToken() -> Bool {
            storedToken = nil
            return true
        }
        
        func deleteRefreshToken() -> Bool {
            storedRefreshToken = nil
            return true
        }
        
        func saveUser(_ user: Data) -> Bool {
            storedUser = user
            return true
        }
        
        func getUser() -> Data? {
            return storedUser
        }
        
        func deleteUser() -> Bool {
            storedUser = nil
            return true
        }
    }
    
    var authService: AuthService!
    var mockAPIClient: MockAPIClient!
    var mockKeychainService: MockKeychainService!
    var cancellables: Set<AnyCancellable> = []
    
    override func setUp() {
        super.setUp()
        mockAPIClient = MockAPIClient()
        mockKeychainService = MockKeychainService()
        authService = AuthService(apiClient: mockAPIClient, keychainService: mockKeychainService)
    }
    
    override func tearDown() {
        authService = nil
        mockAPIClient = nil
        mockKeychainService = nil
        cancellables.removeAll()
        super.tearDown()
    }
    
    /// 测试登录功能
    func testLogin() {
        // 预期
        let expectation = XCTestExpectation(description: "登录成功")
        
        // 模拟登录响应
        let loginResponse = LoginResponse(token: "test-token", refreshToken: "test-refresh-token", user: User(id: "1", name: "Test User", email: "test@example.com", role: "user"))
        let apiResponse = APIResponse(statusCode: 200, data: loginResponse)
        
        // 监听登录结果
        authService.login(email: "test@example.com", password: "password")
            .sink {completion in
                if case .failure(let error) = completion {
                    XCTFail("登录失败: \(error.localizedDescription)")
                }
            } receiveValue: { _ in
                expectation.fulfill()
            }
            .store(in: &cancellables)
        
        // 发送模拟响应
        DispatchQueue.main.async {
            self.mockAPIClient.responseSubject.send(apiResponse as! APIResponse<LoginResponse>)
        }
        
        wait(for: [expectation], timeout: 1.0)
        
        // 验证结果
        XCTAssertEqual(mockKeychainService.storedToken, "test-token")
        XCTAssertEqual(mockKeychainService.storedRefreshToken, "test-refresh-token")
    }
    
    /// 测试登出功能
    func testLogout() {
        // 先保存一些数据
        mockKeychainService.saveToken("test-token")
        mockKeychainService.saveRefreshToken("test-refresh-token")
        
        // 预期
        let expectation = XCTestExpectation(description: "登出成功")
        
        // 执行登出
        authService.logout()
            .sink {completion in
                if case .failure(let error) = completion {
                    XCTFail("登出失败: \(error.localizedDescription)")
                }
            } receiveValue: { _ in
                expectation.fulfill()
            }
            .store(in: &cancellables)
        
        wait(for: [expectation], timeout: 1.0)
        
        // 验证结果
        XCTAssertNil(mockKeychainService.storedToken)
        XCTAssertNil(mockKeychainService.storedRefreshToken)
        XCTAssertNil(mockKeychainService.storedUser)
    }
    
    /// 测试令牌有效性检查
    func testIsTokenValid() {
        // 无令牌时应该返回false
        XCTAssertFalse(authService.isTokenValid())
        
        // 有令牌时应该返回true
        mockKeychainService.saveToken("test-token")
        XCTAssertTrue(authService.isTokenValid())
    }
    
    /// 测试刷新令牌功能
    func testRefreshAccessToken() {
        // 预期
        let expectation = XCTestExpectation(description: "刷新令牌成功")
        
        // 模拟刷新令牌响应
        let refreshResponse = RefreshTokenResponse(token: "new-test-token", refreshToken: "new-test-refresh-token")
        let apiResponse = APIResponse(statusCode: 200, data: refreshResponse)
        
        // 先保存旧令牌
        mockKeychainService.saveToken("old-token")
        mockKeychainService.saveRefreshToken("old-refresh-token")
        
        // 监听刷新结果
        authService.refreshAccessToken()
            .sink {completion in
                if case .failure(let error) = completion {
                    XCTFail("刷新令牌失败: \(error.localizedDescription)")
                }
            } receiveValue: { token in
                XCTAssertEqual(token, "new-test-token")
                expectation.fulfill()
            }
            .store(in: &cancellables)
        
        // 发送模拟响应
        DispatchQueue.main.async {
            self.mockAPIClient.responseSubject.send(apiResponse as! APIResponse<LoginResponse>)
        }
        
        wait(for: [expectation], timeout: 1.0)
        
        // 验证结果
        XCTAssertEqual(mockKeychainService.storedToken, "new-test-token")
    }
}
