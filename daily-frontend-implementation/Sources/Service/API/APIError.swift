import Foundation
import Alamofire

/// API错误模型
typealias ApiErrorModel = [String: Any]

/// API元数据模型
struct ApiMeta: Decodable {
    let code: Int
    let message: String?
    let error: ApiErrorModel?
    let page: Int?
    let limit: Int?
    let total: Int?
    let requestId: String?
    let timestamp: String?
    
    enum CodingKeys: String, CodingKey {
        case code
        case message
        case error
        case page
        case limit
        case total
        case requestId
        case timestamp
    }
}

/// API统一响应模型
struct ApiResponse<T: Decodable>: Decodable {
    let data: T?
    let meta: ApiMeta
    
    enum CodingKeys: String, CodingKey {
        case data
        case meta
    }
}

/// API错误枚举
enum APIError: Error, LocalizedError {
    case invalidURL
    case networkError(Error)
    case decodingError(Error)
    case serverError(statusCode: Int, message: String)
    case apiError(code: String, message: String, details: ApiErrorModel?)
    case unauthorized
    case forbidden
    case notFound
    case unknown(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "无效的URL"
        case .networkError(let error):
            return "网络错误：\(error.localizedDescription)"
        case .decodingError(let error):
            return "数据解析错误：\(error.localizedDescription)"
        case .serverError(let statusCode, let message):
            return "服务器错误（\(statusCode)）：\(message)"
        case .apiError(let code, let message, _):
            return "API错误（\(code)）：\(message)"
        case .unauthorized:
            return "未授权，请重新登录"
        case .forbidden:
            return "禁止访问"
        case .notFound:
            return "资源未找到"
        case .unknown(let error):
            return "未知错误：\(error.localizedDescription)"
        }
    }
}