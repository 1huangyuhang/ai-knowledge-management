import Foundation

/// 认知洞察实体
public struct CognitiveInsight: Identifiable, Codable {
    /// 洞察唯一标识符
    public let id: UUID
    /// 模型ID
    public let modelId: UUID
    /// 相关概念ID
    public let conceptId: UUID?
    /// 洞察类型
    public let type: String
    /// 洞察内容
    public let content: String
    /// 洞察描述
    public let description: String?
    /// 重要性评分 (0-10)
    public let importance: Int
    /// 置信度评分 (0-100)
    public let confidence: Int
    /// 创建时间
    public let createdAt: Date
    /// 更新时间
    public let updatedAt: Date
    /// 关联的AI任务ID
    public let aiTaskId: UUID
    /// 是否已读
    public let isRead: Bool
    
    /// 初始化认知洞察实体
    /// - Parameters:
    ///   - id: 洞察唯一标识符
    ///   - modelId: 模型ID
    ///   - conceptId: 相关概念ID
    ///   - type: 洞察类型
    ///   - content: 洞察内容
    ///   - description: 洞察描述
    ///   - importance: 重要性评分
    ///   - confidence: 置信度评分
    ///   - createdAt: 创建时间
    ///   - updatedAt: 更新时间
    ///   - aiTaskId: 关联的AI任务ID
    ///   - isRead: 是否已读
    public init(id: UUID, modelId: UUID, conceptId: UUID? = nil, type: String, content: String, description: String? = nil, importance: Int, confidence: Int, createdAt: Date, updatedAt: Date, aiTaskId: UUID, isRead: Bool) {
        self.id = id
        self.modelId = modelId
        self.conceptId = conceptId
        self.type = type
        self.content = content
        self.description = description
        self.importance = importance
        self.confidence = confidence
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.aiTaskId = aiTaskId
        self.isRead = isRead
    }
}
