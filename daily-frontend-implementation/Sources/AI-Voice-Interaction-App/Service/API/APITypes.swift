import Foundation

/// 令牌信息
struct Tokens: Codable {
    let accessToken: String
    let refreshToken: String
}

/// 空响应
struct EmptyResponse: Codable {
    // 空响应，用于不需要返回数据的请求
}

/// AI任务请求体
struct AITaskRequest: Codable {
    let content: String
    let modelId: UUID?
    let stream: Bool
}
