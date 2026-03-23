import Foundation

/// 认知模型实体
public struct CognitiveModel: Identifiable, Codable {
    /// 模型唯一标识符
    public let id: UUID
    /// 用户ID
    public let userId: UUID
    /// 模型名称
    public let name: String
    /// 模型描述
    public let description: String?
    /// 模型版本
    public let version: Int
    /// 模型状态
    public let status: CognitiveModelStatus
    /// 创建时间
    public let createdAt: Date
    /// 更新时间
    public let updatedAt: Date
    /// 模型的认知概念列表
    public var concepts: [CognitiveConcept]?
    /// 模型的认知关系列表
    public var relations: [CognitiveRelation]?
    
    /// 初始化认知模型实体
    /// - Parameters:
    ///   - id: 模型唯一标识符
    ///   - userId: 用户ID
    ///   - name: 模型名称
    ///   - description: 模型描述
    ///   - version: 模型版本
    ///   - status: 模型状态
    ///   - createdAt: 创建时间
    ///   - updatedAt: 更新时间
    ///   - concepts: 模型的认知概念列表
    ///   - relations: 模型的认知关系列表
    public init(id: UUID, userId: UUID, name: String, description: String? = nil, version: Int, status: CognitiveModelStatus, createdAt: Date, updatedAt: Date, concepts: [CognitiveConcept]? = nil, relations: [CognitiveRelation]? = nil) {
        self.id = id
        self.userId = userId
        self.name = name
        self.description = description
        self.version = version
        self.status = status
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.concepts = concepts
        self.relations = relations
    }
}

/// 认知模型状态枚举
public enum CognitiveModelStatus: String, Codable, CaseIterable {
    /// 活跃状态
    case active = "ACTIVE"
    /// 草稿状态
    case draft = "DRAFT"
    /// 已归档
    case archived = "ARCHIVED"
    
    /// 获取状态的显示名称
    /// - Returns: 状态的显示名称
    public var displayName: String {
        switch self {
        case .active:
            return "活跃"
        case .draft:
            return "草稿"
        case .archived:
            return "已归档"
        }
    }
}
