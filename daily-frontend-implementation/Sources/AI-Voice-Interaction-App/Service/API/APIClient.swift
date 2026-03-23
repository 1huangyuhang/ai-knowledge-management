import Foundation
import Alamofire
import Combine

/// API客户端实现类
class APIClient: APIClientProtocol {
    /// 共享实例
    static let shared = APIClient()
    
    /// 初始化器
    init() {
        // 配置Alamofire会话
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = APIConfig.timeoutInterval
        configuration.timeoutIntervalForResource = APIConfig.timeoutInterval
        
        // 为了简化，我们使用默认的Alamofire会话
    }
    
    /// 发送GET请求
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    func get<T: Decodable>(_ endpoint: Endpoint, headers: [String: String]?) -> AnyPublisher<T, APIError> {
        return request(endpoint, method: .get, headers: headers)
    }
    
    /// 发送POST请求
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - body: 请求体
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    func post<T: Decodable, B: Encodable>(_ endpoint: Endpoint, body: B, headers: [String: String]?) -> AnyPublisher<T, APIError> {
        return request(endpoint, method: .post, body: body, headers: headers)
    }
    
    /// 发送PUT请求
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - body: 请求体
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    func put<T: Decodable, B: Encodable>(_ endpoint: Endpoint, body: B, headers: [String: String]?) -> AnyPublisher<T, APIError> {
        return request(endpoint, method: .put, body: body, headers: headers)
    }
    
    /// 发送DELETE请求
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    func delete<T: Decodable>(_ endpoint: Endpoint, headers: [String: String]?) -> AnyPublisher<T, APIError> {
        return request(endpoint, method: .delete, headers: headers)
    }
    
    /// 发送带文件的POST请求
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - formData: 表单数据
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    func upload<T: Decodable>(_ endpoint: Endpoint, formData: [String: Any], headers: [String: String]?) -> AnyPublisher<T, APIError> {
        // 简化实现，实际项目中需要使用Alamofire的upload方法
        return Fail(error: APIError.unknown).eraseToAnyPublisher()
    }
    
    /// 刷新令牌
    /// - Parameter refreshToken: 刷新令牌
    /// - Returns: 包含新令牌的发布者
    func refreshToken(refreshToken: String) -> AnyPublisher<Tokens, APIError> {
        let endpoint = Endpoint.auth(.refreshToken)
        let body = RefreshTokenRequest(refreshToken: refreshToken)
        
        return request(endpoint, method: .post, body: body, headers: nil)
    }
    
    /// 通用请求方法 - 无请求体
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - method: HTTP请求方法
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    private func request<T: Decodable>(_ endpoint: Endpoint, method: HTTPMethod, headers: [String: String]?) -> AnyPublisher<T, APIError> {
        let url = APIConfig.baseURL.appendingPathComponent(endpoint.path)
        
        // 构建请求头
        var combinedHeaders: HTTPHeaders = [
            APIConfig.contentType: APIConfig.jsonContentType
        ]
        
        // 添加自定义请求头
        if let headers = headers {
            headers.forEach { key, value in
                combinedHeaders.add(name: key, value: value)
            }
        }
        
        // 添加认证令牌（如果有）
        if let token = KeychainService.shared.accessToken {
            combinedHeaders.add(name: APIConfig.authHeader, value: "Bearer \(token)")
        }
        
        return Future<T, APIError> { promise in
            // 创建请求
            let afMethod = Alamofire.HTTPMethod(rawValue: method.rawValue)
            AF.request(
                url,
                method: afMethod,
                headers: combinedHeaders
            )
            .responseDecodable(of: APIResponse<T>.self) { response in
                switch response.result {
                case .success(let apiResponse):
                    if apiResponse.success {
                        if let data = apiResponse.data {
                            promise(.success(data))
                        } else {
                            // 如果API返回成功但没有数据，尝试直接解码响应
                            do {
                                let decoder = JSONDecoder()
                                if let data = response.data {
                                    let decodedData = try decoder.decode(T.self, from: data)
                                    promise(.success(decodedData))
                                } else {
                                    promise(.failure(.decodingError))
                                }
                            } catch {
                                promise(.failure(.decodingError))
                            }
                        }
                    } else {
                        let errorMessage = apiResponse.message ?? "请求失败"
                        if let statusCode = response.response?.statusCode {
                            promise(.failure(APIError.fromStatusCode(statusCode, message: errorMessage)))
                        } else {
                            promise(.failure(.serverError(statusCode: 0, message: errorMessage)))
                        }
                    }
                case .failure(let afError):
                    switch afError {
                    case .invalidURL(url: _):
                        promise(.failure(.invalidURL))
                    case .responseSerializationFailed(reason: _):
                        promise(.failure(.decodingError))
                    case .sessionTaskFailed(error: let underlyingError):
                        promise(.failure(.networkError(underlyingError)))
                    default:
                        promise(.failure(.unknown))
                    }
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    /// 通用请求方法 - 带请求体
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - method: HTTP请求方法
    ///   - body: 请求体
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    private func request<T: Decodable, B: Encodable>(_ endpoint: Endpoint, method: HTTPMethod, body: B, headers: [String: String]?) -> AnyPublisher<T, APIError> {
        let url = APIConfig.baseURL.appendingPathComponent(endpoint.path)
        
        // 构建请求头
        var combinedHeaders: HTTPHeaders = [
            APIConfig.contentType: APIConfig.jsonContentType
        ]
        
        // 添加自定义请求头
        if let headers = headers {
            headers.forEach { key, value in
                combinedHeaders.add(name: key, value: value)
            }
        }
        
        // 添加认证令牌（如果有）
        if let token = KeychainService.shared.accessToken {
            combinedHeaders.add(name: APIConfig.authHeader, value: "Bearer \(token)")
        }
        
        return Future<T, APIError> { promise in
            // 创建请求
            let afMethod = Alamofire.HTTPMethod(rawValue: method.rawValue)
            AF.request(
                url,
                method: afMethod,
                parameters: body,
                encoder: JSONParameterEncoder.default,
                headers: combinedHeaders
            )
            .responseDecodable(of: APIResponse<T>.self) { response in
                switch response.result {
                case .success(let apiResponse):
                    if apiResponse.success {
                        if let data = apiResponse.data {
                            promise(.success(data))
                        } else {
                            // 如果API返回成功但没有数据，尝试直接解码响应
                            do {
                                let decoder = JSONDecoder()
                                if let data = response.data {
                                    let decodedData = try decoder.decode(T.self, from: data)
                                    promise(.success(decodedData))
                                } else {
                                    promise(.failure(.decodingError))
                                }
                            } catch {
                                promise(.failure(.decodingError))
                            }
                        }
                    } else {
                        let errorMessage = apiResponse.message ?? "请求失败"
                        if let statusCode = response.response?.statusCode {
                            promise(.failure(APIError.fromStatusCode(statusCode, message: errorMessage)))
                        } else {
                            promise(.failure(.serverError(statusCode: 0, message: errorMessage)))
                        }
                    }
                case .failure(let afError):
                    switch afError {
                    case .invalidURL(url: _):
                        promise(.failure(.invalidURL))
                    case .responseSerializationFailed(reason: _):
                        promise(.failure(.decodingError))
                    case .sessionTaskFailed(error: let underlyingError):
                        promise(.failure(.networkError(underlyingError)))
                    default:
                        promise(.failure(.unknown))
                    }
                }
            }
        }
        .eraseToAnyPublisher()
    }
}

/// API响应模型
struct APIResponse<T: Decodable>: Decodable {
    /// 是否成功
    let success: Bool
    /// 响应消息
    let message: String?
    /// 响应数据
    let data: T?
    /// 分页信息
    let pagination: PaginationInfo?
}

/// 分页信息
struct PaginationInfo: Decodable {
    /// 当前页码
    let page: Int
    /// 每页大小
    let pageSize: Int
    /// 总页数
    let totalPages: Int
    /// 总记录数
    let totalItems: Int
}

// MARK: - 请求模型

/// 登录请求模型
struct LoginRequest: Encodable {
    let email: String
    let password: String
}

/// 注册请求模型
struct RegisterRequest: Encodable {
    let email: String
    let password: String
    let username: String
}

/// 刷新令牌请求模型
struct RefreshTokenRequest: Encodable {
    let refreshToken: String
}


