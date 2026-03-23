import Foundation

/// 用户实体
struct User: Identifiable, Codable {
    /// 用户唯一标识符
    let id: UUID
    /// 用户名
    let username: String
    /// 邮箱地址
    let email: String
    /// 用户角色
    let role: UserRole
    /// 创建时间
    let createdAt: Date
    /// 更新时间
    let updatedAt: Date
    /// 用户的当前认知模型ID
    let currentCognitiveModelId: UUID?
    
    /// 初始化用户实体
    /// - Parameters:
    ///   - id: 用户唯一标识符
    ///   - username: 用户名
    ///   - email: 邮箱地址
    ///   - role: 用户角色
    ///   - createdAt: 创建时间
    ///   - updatedAt: 更新时间
    ///   - currentCognitiveModelId: 用户的当前认知模型ID
    init(id: UUID, username: String, email: String, role: UserRole, createdAt: Date, updatedAt: Date, currentCognitiveModelId: UUID? = nil) {
        self.id = id
        self.username = username
        self.email = email
        self.role = role
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.currentCognitiveModelId = currentCognitiveModelId
    }
}
