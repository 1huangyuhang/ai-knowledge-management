import XCTest
import Combine
@testable import AI_Voice_Interaction_App

/// API客户端单元测试
class APIClientTests: XCTestCase {
    
    var apiClient: APIClient!
    var cancellables: Set<AnyCancellable> = []
    
    override func setUp() {
        super.setUp()
        apiClient = APIClient()
    }
    
    override func tearDown() {
        apiClient = nil
        cancellables.removeAll()
        super.tearDown()
    }
    
    /// 测试API请求构建
    func testRequestBuilding() {
        // 创建测试请求
        let endpoint = Endpoint.auth.login
        let params: [String: Any] = ["email": "test@example.com", "password": "password"]
        let request = APIRequest(endpoint: endpoint, method: .post, parameters: params)
        
        // 验证请求URL
        XCTAssertEqual(request.url?.scheme, "https")
        XCTAssertEqual(request.url?.host, "api.example.com")
        XCTAssertEqual(request.url?.path, "/api/v1/auth/login")
        
        // 验证请求方法
        XCTAssertEqual(request.method, .post)
        
        // 验证请求头
        XCTAssertEqual(request.headers["Content-Type"], "application/json")
        XCTAssertEqual(request.headers["Accept"], "application/json")
    }
    
    /// 测试成功响应处理
    func testSuccessResponse() {
        // 预期
        let expectation = XCTestExpectation(description: "API请求成功")
        
        // 创建模拟响应
        let mockResponse = LoginResponse(token: "test-token", refreshToken: "test-refresh-token", user: User(id: "1", name: "Test User", email: "test@example.com", role: "user"))
        let jsonData = try! JSONEncoder().encode(mockResponse)
        
        // 创建测试请求
        let endpoint = Endpoint.auth.login
        let params: [String: Any] = ["email": "test@example.com", "password": "password"]
        let request = APIRequest(endpoint: endpoint, method: .post, parameters: params)
        
        // 模拟URLSession
        let mockURLSession = MockURLSession(data: jsonData, response: HTTPURLResponse(url: URL(string: "https://api.example.com/api/v1/auth/login")!, statusCode: 200, httpVersion: nil, headerFields: nil)!, error: nil)
        
        // 使用模拟URLSession创建APIClient
        let mockAPIClient = APIClient(session: mockURLSession)
        
        // 发送请求
        mockAPIClient.request(request)
            .sink {completion in
                if case .failure(let error) = completion {
                    XCTFail("API请求失败: \(error.localizedDescription)")
                }
            } receiveValue: { response in
                XCTAssertEqual(response.statusCode, 200)
                XCTAssertEqual(response.data.token, "test-token")
                expectation.fulfill()
            }
            .store(in: &self.cancellables)
        
        wait(for: [expectation], timeout: 1.0)
    }
    
    /// 测试错误响应处理
    func testErrorResponse() {
        // 预期
        let expectation = XCTestExpectation(description: "API请求失败")
        
        // 创建测试请求
        let endpoint = Endpoint.auth.login
        let params: [String: Any] = ["email": "invalid@example.com", "password": "wrongpassword"]
        let request = APIRequest(endpoint: endpoint, method: .post, parameters: params)
        
        // 模拟错误响应
        let errorResponse = APIErrorResponse(error: "Invalid credentials", message: "Invalid email or password")
        let jsonData = try! JSONEncoder().encode(errorResponse)
        
        // 模拟URLSession
        let mockURLSession = MockURLSession(data: jsonData, response: HTTPURLResponse(url: URL(string: "https://api.example.com/api/v1/auth/login")!, statusCode: 401, httpVersion: nil, headerFields: nil)!, error: nil)
        
        // 使用模拟URLSession创建APIClient
        let mockAPIClient = APIClient(session: mockURLSession)
        
        // 发送请求
        mockAPIClient.request(request)
            .sink {completion in
                if case .failure(let error) = completion {
                    XCTAssertEqual(error.localizedDescription, "Invalid credentials: Invalid email or password")
                    expectation.fulfill()
                }
            } receiveValue: { _ in
                XCTFail("API请求不应成功")
            }
            .store(in: &self.cancellables)
        
        wait(for: [expectation], timeout: 1.0)
    }
    
    /// 测试网络错误处理
    func testNetworkError() {
        // 预期
        let expectation = XCTestExpectation(description: "网络错误处理")
        
        // 创建测试请求
        let endpoint = Endpoint.auth.login
        let params: [String: Any] = ["email": "test@example.com", "password": "password"]
        let request = APIRequest(endpoint: endpoint, method: .post, parameters: params)
        
        // 模拟网络错误
        let networkError = NSError(domain: NSURLErrorDomain, code: NSURLErrorNotConnectedToInternet, userInfo: [NSLocalizedDescriptionKey: "Not connected to the internet"])
        let mockURLSession = MockURLSession(data: nil, response: nil, error: networkError)
        
        // 使用模拟URLSession创建APIClient
        let mockAPIClient = APIClient(session: mockURLSession)
        
        // 发送请求
        mockAPIClient.request(request)
            .sink {completion in
                if case .failure(let error) = completion {
                    XCTAssertEqual(error.localizedDescription, "网络错误: Not connected to the internet")
                    expectation.fulfill()
                }
            } receiveValue: { _ in
                XCTFail("API请求不应成功")
            }
            .store(in: &self.cancellables)
        
        wait(for: [expectation], timeout: 1.0)
    }
}

/// 模拟URLSession用于测试
class MockURLSession: URLSessionProtocol {
    private let data: Data?
    private let response: URLResponse?
    private let error: Error?
    
    init(data: Data?, response: URLResponse?, error: Error?) {
        self.data = data
        self.response = response
        self.error = error
    }
    
    func dataTask(with request: URLRequest, completionHandler: @escaping (Data?, URLResponse?, Error?) -> Void) -> URLSessionDataTask {
        return MockURLSessionDataTask { [weak self] in
            completionHandler(self?.data, self?.response, self?.error)
        }
    }
}

/// 模拟URLSessionDataTask用于测试
class MockURLSessionDataTask: URLSessionDataTask {
    private let completion: () -> Void
    
    init(completion: @escaping () -> Void) {
        self.completion = completion
    }
    
    override func resume() {
        completion()
    }
}
