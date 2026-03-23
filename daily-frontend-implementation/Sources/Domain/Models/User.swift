import Foundation

/// 用户角色枚举
enum UserRole: String, Decodable {
    case admin = "admin"
    case user = "user"
}

/// 用户模型
struct User: Decodable, Identifiable, Equatable {
    let id: String
    let username: String
    let email: String
    let avatar: String?
    let role: UserRole
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case email
        case avatar
        case role
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    static func == (lhs: User, rhs: User) -> Bool {
        return lhs.id == rhs.id
    }
}

/// 登录请求模型
struct LoginRequest: Encodable {
    let email: String
    let password: String
}

/// 注册请求模型
struct RegisterRequest: Encodable {
    let username: String
    let email: String
    let password: String
}

/// 登录响应模型
struct LoginResponse: Decodable {
    let accessToken: String
    let refreshToken: String
    let user: User
    
    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case user
    }
}