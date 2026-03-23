import Foundation

/// 认知关系实体
public struct CognitiveRelation: Identifiable, Codable {
    /// 关系唯一标识符
    public let id: UUID
    /// 模型ID
    public let modelId: UUID
    /// 源概念ID
    public let sourceConceptId: UUID
    /// 目标概念ID
    public let targetConceptId: UUID
    /// 关系类型
    public let type: CognitiveRelationType
    /// 关系描述
    public let description: String?
    /// 强度评分 (0-10)
    public let strength: Int
    /// 置信度评分 (0-100)
    public let confidence: Int
    /// 创建时间
    public let createdAt: Date
    /// 更新时间
    public let updatedAt: Date
    
    /// 初始化认知关系实体
    /// - Parameters:
    ///   - id: 关系唯一标识符
    ///   - modelId: 模型ID
    ///   - sourceConceptId: 源概念ID
    ///   - targetConceptId: 目标概念ID
    ///   - type: 关系类型
    ///   - description: 关系描述
    ///   - strength: 强度评分
    ///   - confidence: 置信度评分
    ///   - createdAt: 创建时间
    ///   - updatedAt: 更新时间
    public init(id: UUID, modelId: UUID, sourceConceptId: UUID, targetConceptId: UUID, type: CognitiveRelationType, description: String? = nil, strength: Int, confidence: Int, createdAt: Date, updatedAt: Date) {
        self.id = id
        self.modelId = modelId
        self.sourceConceptId = sourceConceptId
        self.targetConceptId = targetConceptId
        self.type = type
        self.description = description
        self.strength = strength
        self.confidence = confidence
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

/// 认知关系类型枚举
public enum CognitiveRelationType: String, Codable, CaseIterable {
    /// 包含关系
    case contains = "CONTAINS"
    /// 因果关系
    case causes = "CAUSES"
    /// 关联关系
    case relatesTo = "RELATES_TO"
    /// 依赖关系
    case dependsOn = "DEPENDS_ON"
    /// 对比关系
    case contrastsWith = "CONTRASTS_WITH"
    /// 等价关系
    case equivalentTo = "EQUIVALENT_TO"
    
    /// 获取关系类型的显示名称
    /// - Returns: 关系类型的显示名称
    public var displayName: String {
        switch self {
        case .contains:
            return "包含"
        case .causes:
            return "导致"
        case .relatesTo:
            return "关联"
        case .dependsOn:
            return "依赖"
        case .contrastsWith:
            return "对比"
        case .equivalentTo:
            return "等价"
        }
    }
}
