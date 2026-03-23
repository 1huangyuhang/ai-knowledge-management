import Foundation
import Combine
import Alamofire

/// API服务协议
protocol APIClientProtocol {
    func request<T: Decodable>(_ endpoint: Endpoint, parameters: [String: Any]?, headers: HTTPHeaders?) -> AnyPublisher<T, APIError>
    func request<T: Decodable>(_ url: String, method: HTTPMethod, parameters: [String: Any]?, headers: HTTPHeaders?) -> AnyPublisher<T, APIError>
    func upload<T: Decodable>(_ endpoint: Endpoint, fileURL: URL) -> AnyPublisher<T, APIError>
}