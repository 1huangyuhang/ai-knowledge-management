import XCTest
import Combine
@testable import AI_Voice_Interaction_App

/// 认证集成测试
class AuthIntegrationTests: XCTestCase {
    
    var authService: AuthService!
    var apiClient: APIClient!
    var keychainService: KeychainService!
    var cancellables: Set<AnyCancellable> = []
    
    override func setUp() {
        super.setUp()
        // 使用实际的KeychainService进行集成测试
        keychainService = KeychainService()
        // 使用实际的APIClient，但会被网络拦截或模拟
        apiClient = APIClient()
        authService = AuthService(apiClient: apiClient, keychainService: keychainService)
    }
    
    override func tearDown() {
        // 清理Keychain数据
        keychainService.deleteToken()
        keychainService.deleteRefreshToken()
        keychainService.deleteUser()
        
        authService = nil
        apiClient = nil
        keychainService = nil
        cancellables.removeAll()
        super.tearDown()
    }
    
    /// 测试认证流程集成
    func testAuthFlowIntegration() {
        // 预期
        let expectation = XCTestExpectation(description: "认证流程集成测试")
        expectation.isInverted = true // 这个测试主要是验证依赖注入和基本架构，不实际发送网络请求
        
        // 测试AuthService初始化
        XCTAssertNotNil(authService)
        
        // 测试初始状态
        XCTAssertFalse(authService.isTokenValid())
        XCTAssertNil(keychainService.getToken())
        XCTAssertNil(keychainService.getRefreshToken())
        XCTAssertNil(keychainService.getUser())
        
        // 测试令牌保存和获取
        let testToken = "test-integration-token"
        XCTAssertTrue(keychainService.saveToken(testToken))
        XCTAssertEqual(keychainService.getToken(), testToken)
        XCTAssertTrue(authService.isTokenValid())
        
        // 测试令牌删除
        XCTAssertTrue(keychainService.deleteToken())
        XCTAssertFalse(authService.isTokenValid())
        
        expectation.fulfill()
        wait(for: [expectation], timeout: 1.0)
    }
    
    /// 测试认证服务和API客户端的依赖注入
    func testDependencyInjection() {
        // 预期
        let expectation = XCTestExpectation(description: "依赖注入测试")
        
        // 创建模拟API客户端
        class MockAPIClient: APIClientProtocol {
            func request<T>(_ request: APIRequest) -> AnyPublisher<APIResponse<T>, APIError> where T : Decodable {
                return Fail(error: APIError.invalidResponse)
                    .eraseToAnyPublisher()
            }
        }
        
        // 创建模拟Keychain服务
        class MockKeychainService: KeychainServiceProtocol {
            var storedToken: String?
            
            func saveToken(_ token: String) -> Bool {
                storedToken = token
                return true
            }
            
            func saveRefreshToken(_ token: String) -> Bool { return true }
            func getToken() -> String? { return storedToken }
            func getRefreshToken() -> String? { return nil }
            func deleteToken() -> Bool { storedToken = nil; return true }
            func deleteRefreshToken() -> Bool { return true }
            func saveUser(_ user: Data) -> Bool { return true }
            func getUser() -> Data? { return nil }
            func deleteUser() -> Bool { return true }
        }
        
        let mockAPIClient = MockAPIClient()
        let mockKeychainService = MockKeychainService()
        
        // 测试依赖注入
        let authService = AuthService(apiClient: mockAPIClient, keychainService: mockKeychainService)
        XCTAssertNotNil(authService)
        
        expectation.fulfill()
        wait(for: [expectation], timeout: 1.0)
    }
}
