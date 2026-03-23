import Foundation
import Combine

/// API客户端协议
protocol APIClientProtocol {
    /// 发送GET请求
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    func get<T: Decodable>(_ endpoint: Endpoint, headers: [String: String]?) -> AnyPublisher<T, APIError>
    
    /// 发送POST请求
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - body: 请求体
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    func post<T: Decodable, B: Encodable>(_ endpoint: Endpoint, body: B, headers: [String: String]?) -> AnyPublisher<T, APIError>
    
    /// 发送PUT请求
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - body: 请求体
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    func put<T: Decodable, B: Encodable>(_ endpoint: Endpoint, body: B, headers: [String: String]?) -> AnyPublisher<T, APIError>
    
    /// 发送DELETE请求
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    func delete<T: Decodable>(_ endpoint: Endpoint, headers: [String: String]?) -> AnyPublisher<T, APIError>
    
    /// 发送带文件的POST请求
    /// - Parameters:
    ///   - endpoint: API端点
    ///   - formData: 表单数据
    ///   - headers: 自定义请求头
    /// - Returns: 泛型类型的发布者，包含解码后的响应数据或错误
    func upload<T: Decodable>(_ endpoint: Endpoint, formData: [String: Any], headers: [String: String]?) -> AnyPublisher<T, APIError>
    
    /// 刷新令牌
    /// - Parameter refreshToken: 刷新令牌
    /// - Returns: 包含新令牌的发布者
    func refreshToken(refreshToken: String) -> AnyPublisher<Tokens, APIError>
}