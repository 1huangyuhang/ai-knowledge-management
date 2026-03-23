import Foundation

/// 用户角色枚举
enum UserRole: String, Codable, CaseIterable {
    /// 普通用户
    case user = "USER"
    /// 管理员
    case admin = "ADMIN"
    
    /// 获取角色的显示名称
    /// - Returns: 角色的显示名称
    public var displayName: String {
        switch self {
        case .user:
            return "普通用户"
        case .admin:
            return "管理员"
        }
    }
}
