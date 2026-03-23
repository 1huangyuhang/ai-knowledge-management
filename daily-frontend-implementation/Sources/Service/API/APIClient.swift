import Foundation
import Combine
import Alamofire
import SwiftyJSON

/// API客户端实现
class APIClient: APIClientProtocol {
    
    // 单例实例
    static let shared = APIClient()
    
    // Alamofire会话
    private let session: Session
    
    // 初始化
    private init() {
        // 配置Alamofire会话
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        
        // 添加认证头拦截器
        let interceptor = RequestInterceptor()
        
        self.session = Session(configuration: configuration, interceptor: interceptor)
    }
    
    // 实现request方法
    func request<T: Decodable>(_ endpoint: Endpoint, parameters: [String: Any]? = nil, headers: HTTPHeaders? = nil) -> AnyPublisher<T, APIError> {
        return request(endpoint.url, method: endpoint.method, parameters: parameters, headers: headers)
    }
    
    func request<T: Decodable>(_ url: String, method: HTTPMethod, parameters: [String: Any]?, headers: HTTPHeaders?) -> AnyPublisher<T, APIError> {
        return Future<T, APIError> { [weak self] promise in
            guard let self = self else { return }
            
            self.session.request(url, method: method, parameters: parameters, encoding: JSONEncoding.default, headers: headers)
                .responseJSON { response in
                    switch response.result {
                    case .success(let value):
                        do {
                            let json = JSON(value)
                            let data = try json.rawData()
                            let decoder = JSONDecoder()
                            decoder.dateDecodingStrategy = .iso8601
                            
                            // 先将响应解码为ApiResponse<T>
                            let apiResponse = try decoder.decode(ApiResponse<T>.self, from: data)
                            
                            // 检查meta中是否有错误
                            if let error = apiResponse.meta.error {
                                let errorCode = error["code"] as? String ?? "UNKNOWN_ERROR"
                                let errorMessage = error["message"] as? String ?? "未知错误"
                                promise(.failure(.apiError(code: errorCode, message: errorMessage, details: error)))
                            } else {
                                // 提取data字段
                                if let resultData = apiResponse.data {
                                    promise(.success(resultData))
                                } else {
                                    // 如果data为null，根据状态码判断是否为错误
                                    let statusCode = apiResponse.meta.code
                                    switch statusCode {
                                    case 200, 201, 204:
                                        // 对于某些成功操作（如删除），data可能为null
                                        // 这里需要特殊处理，根据responseType是否为Optional<T>来决定
                                        if T.self is Optional<Any>.Type {
                                            promise(.success(nil as! T))
                                        } else {
                                            promise(.failure(.decodingError(NSError(domain: "APIError", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "响应数据为空"]))))
                                        }
                                    default:
                                        promise(.failure(.serverError(statusCode: statusCode, message: apiResponse.meta.message ?? "未知错误")))
                                    }
                                }
                            }
                        } catch {
                            promise(.failure(.decodingError(error)))
                        }
                    case .failure(let error):
                        if let statusCode = response.response?.statusCode {
                            let message = response.data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
                            switch statusCode {
                            case 401:
                                promise(.failure(.unauthorized))
                            case 403:
                                promise(.failure(.forbidden))
                            case 404:
                                promise(.failure(.notFound))
                            default:
                                // 尝试解析错误响应中的meta.error字段
                                if let data = response.data {
                                    do {
                                        let decoder = JSONDecoder()
                                        let apiResponse = try decoder.decode(ApiResponse<EmptyResponse>.self, from: data)
                                        if let error = apiResponse.meta.error {
                                            let errorCode = error["code"] as? String ?? "UNKNOWN_ERROR"
                                            let errorMessage = error["message"] as? String ?? "未知错误"
                                            promise(.failure(.apiError(code: errorCode, message: errorMessage, details: error)))
                                            return
                                        }
                                    } catch {
                                        // 解析失败，使用默认错误处理
                                    }
                                }
                                promise(.failure(.serverError(statusCode: statusCode, message: message)))
                            }
                        } else {
                            promise(.failure(.networkError(error)))
                        }
                    }
                }
        }
        .eraseToAnyPublisher()
    }
    
    // 空响应模型，用于处理data为null的成功响应
    private struct EmptyResponse: Decodable {}

    
    // 实现upload方法
    func upload<T: Decodable>(_ endpoint: Endpoint, fileURL: URL) -> AnyPublisher<T, APIError> {
        return Future<T, APIError> { [weak self] promise in
            guard let self = self else { return }
            
            self.session.upload(multipartFormData: { multipartFormData in
                multipartFormData.append(fileURL, withName: "file", fileName: fileURL.lastPathComponent, mimeType: "application/octet-stream")
            }, to: endpoint.url, method: endpoint.method)
            .responseJSON { response in
                // 处理响应，与request方法类似
                switch response.result {
                case .success(let value):
                    do {
                        let json = JSON(value)
                        let data = try json.rawData()
                        let decoder = JSONDecoder()
                        decoder.dateDecodingStrategy = .iso8601
                        
                        // 先将响应解码为ApiResponse<T>
                        let apiResponse = try decoder.decode(ApiResponse<T>.self, from: data)
                        
                        // 检查meta中是否有错误
                        if let error = apiResponse.meta.error {
                            let errorCode = error["code"] as? String ?? "UNKNOWN_ERROR"
                            let errorMessage = error["message"] as? String ?? "未知错误"
                            promise(.failure(.apiError(code: errorCode, message: errorMessage, details: error)))
                        } else {
                            // 提取data字段
                            if let resultData = apiResponse.data {
                                promise(.success(resultData))
                            } else {
                                // 如果data为null，根据状态码判断是否为错误
                                let statusCode = apiResponse.meta.code
                                switch statusCode {
                                case 200, 201, 204:
                                    // 对于某些成功操作（如删除），data可能为null
                                    // 这里需要特殊处理，根据responseType是否为Optional<T>来决定
                                    if T.self is Optional<Any>.Type {
                                        promise(.success(nil as! T))
                                    } else {
                                        promise(.failure(.decodingError(NSError(domain: "APIError", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "响应数据为空"]))))
                                    }
                                default:
                                    promise(.failure(.serverError(statusCode: statusCode, message: apiResponse.meta.message ?? "未知错误")))
                                }
                            }
                        }
                    } catch {
                        promise(.failure(.decodingError(error)))
                    }
                case .failure(let error):
                    // 错误处理，与request方法类似
                    if let statusCode = response.response?.statusCode {
                        let message = response.data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
                        switch statusCode {
                        case 401:
                            promise(.failure(.unauthorized))
                        case 403:
                            promise(.failure(.forbidden))
                        case 404:
                            promise(.failure(.notFound))
                        default:
                            // 尝试解析错误响应中的meta.error字段
                            if let data = response.data {
                                do {
                                    let decoder = JSONDecoder()
                                    let apiResponse = try decoder.decode(ApiResponse<EmptyResponse>.self, from: data)
                                    if let error = apiResponse.meta.error {
                                        let errorCode = error["code"] as? String ?? "UNKNOWN_ERROR"
                                        let errorMessage = error["message"] as? String ?? "未知错误"
                                        promise(.failure(.apiError(code: errorCode, message: errorMessage, details: error)))
                                        return
                                    }
                                } catch {
                                    // 解析失败，使用默认错误处理
                                }
                            }
                            promise(.failure(.serverError(statusCode: statusCode, message: message)))
                        }
                    } else {
                        promise(.failure(.networkError(error)))
                    }
                }
            }
        }
        .eraseToAnyPublisher()
    }
}

/// 请求拦截器，用于添加认证头和处理重试
class RequestInterceptor: Alamofire.RequestInterceptor {
    
    // 为每个请求添加认证头
    func adapt(_ urlRequest: URLRequest, for session: Session, completion: @escaping (Result<URLRequest, Error>) -> Void) {
        var urlRequest = urlRequest
        
        // 从Keychain获取Token
        if let token = KeychainService.shared.accessToken {
            urlRequest.headers.add(.authorization(bearerToken: token))
        }
        
        // 添加Content-Type头
        if !urlRequest.headers.contains(name: "Content-Type") {
            urlRequest.headers.add(.contentType("application/json"))
        }
        
        completion(.success(urlRequest))
    }
    
    // 处理重试逻辑
    func retry(_ request: Request, for session: Session, dueTo error: Error, completion: @escaping (RetryResult) -> Void) {
        guard let statusCode = request.response?.statusCode else {
            completion(.doNotRetry)
            return
        }
        
        // 如果是401错误，尝试刷新Token
        if statusCode == 401 {
            refreshToken { success in
                if success {
                    completion(.retryWithDelay(0.5))
                } else {
                    // 刷新Token失败，通知应用需要重新登录
                    NotificationCenter.default.post(name: .authTokenExpired, object: nil)
                    completion(.doNotRetry)
                }
            }
        } else {
            completion(.doNotRetry)
        }
    }
    
    // 刷新Token
    private func refreshToken(completion: @escaping (Bool) -> Void) {
        // 实现Token刷新逻辑
        guard let refreshToken = KeychainService.shared.refreshToken else {
            completion(false)
            return
        }
        
        let parameters = ["refreshToken": refreshToken]
        
        AF.request(Endpoint.refreshToken.url, method: .post, parameters: parameters, encoding: JSONEncoding.default)
            .validate(statusCode: 200..<300)
            .responseJSON { response in
                switch response.result {
                case .success(let value):
                    let json = JSON(value)
                    if let accessToken = json["data"]["accessToken"].string {
                        KeychainService.shared.accessToken = accessToken
                        completion(true)
                    } else {
                        completion(false)
                    }
                case .failure:
                    completion(false)
                }
            }
    }
}