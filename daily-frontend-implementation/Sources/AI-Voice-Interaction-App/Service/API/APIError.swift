import Foundation

/// API错误枚举
enum APIError: Error, LocalizedError, Identifiable {
    case unknown
    case invalidURL
    case invalidResponse
    case decodingError
    case networkError(Error)
    case serverError(statusCode: Int, message: String?)
    case authenticationError(message: String?)
    case forbidden
    case notFound
    case rateLimitExceeded
    case requestMerged
    
    /// 错误ID
    var id: String {
        return self.errorDescription ?? "unknown"
    }
    
    /// 本地化错误描述
    var errorDescription: String? {
        switch self {
        case .unknown:
            return "发生未知错误"
        case .invalidURL:
            return "无效的请求URL"
        case .invalidResponse:
            return "无效的服务器响应"
        case .decodingError:
            return "数据解析失败"
        case .networkError(let error):
            return "网络错误: \(error.localizedDescription)"
        case .serverError(let statusCode, let message):
            return "服务器错误 (\(statusCode)): \(message ?? "未知错误")"
        case .authenticationError(let message):
            return "认证失败: \(message ?? "请重新登录")"
        case .forbidden:
            return "禁止访问此资源"
        case .notFound:
            return "请求的资源不存在"
        case .rateLimitExceeded:
            return "请求频率过高，请稍后重试"
        case .requestMerged:
            return "请求已合并处理"
        }
    }
    
    /// 根据HTTP状态码创建API错误
    /// - Parameters:
    ///   - statusCode: HTTP状态码
    ///   - message: 错误消息
    /// - Returns: APIError实例
    static func fromStatusCode(_ statusCode: Int, message: String? = nil) -> APIError {
        switch statusCode {
        case 400:
            return .serverError(statusCode: statusCode, message: message)
        case 401:
            return .authenticationError(message: message)
        case 403:
            return .forbidden
        case 404:
            return .notFound
        case 429:
            return .rateLimitExceeded
        case 500...599:
            return .serverError(statusCode: statusCode, message: message)
        default:
            return .serverError(statusCode: statusCode, message: message)
        }
    }
}
