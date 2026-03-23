import Foundation

/// API配置
enum APIConfig {
    /// 基础URL
    static let baseURL = URL(string: "http://localhost:3000/api/v1")! // 开发环境URL
    
    /// 请求超时时间（秒）
    static let timeoutInterval: TimeInterval = 30
    
    /// API版本
    static let apiVersion = "v1"
    
    /// 认证头部
    static let authHeader = "Authorization"
    
    /// 内容类型
    static let contentType = "Content-Type"
    
    /// JSON内容类型
    static let jsonContentType = "application/json"
    
    /// 表单内容类型
    static let formContentType = "application/x-www-form-urlencoded"
    
    /// 分页默认大小
    static let defaultPageSize = 20
    
    /// 最大重试次数
    static let maxRetryCount = 3
}
