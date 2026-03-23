import Foundation

/// 认知概念实体
public struct CognitiveConcept: Identifiable, Codable {
    /// 概念唯一标识符
    public let id: UUID
    /// 模型ID
    public let modelId: UUID
    /// 概念名称
    public let name: String
    /// 概念描述
    public let description: String?
    /// 概念类型
    public let type: String
    /// 重要性评分 (0-10)
    public let importance: Int
    /// 置信度评分 (0-100)
    public let confidence: Int
    /// 创建时间
    public let createdAt: Date
    /// 更新时间
    public let updatedAt: Date
    /// 关联的洞察列表
    public var insights: [CognitiveInsight]?
    
    /// 初始化认知概念实体
    /// - Parameters:
    ///   - id: 概念唯一标识符
    ///   - modelId: 模型ID
    ///   - name: 概念名称
    ///   - description: 概念描述
    ///   - type: 概念类型
    ///   - importance: 重要性评分
    ///   - confidence: 置信度评分
    ///   - createdAt: 创建时间
    ///   - updatedAt: 更新时间
    ///   - insights: 关联的洞察列表
    public init(id: UUID, modelId: UUID, name: String, description: String? = nil, type: String, importance: Int, confidence: Int, createdAt: Date, updatedAt: Date, insights: [CognitiveInsight]? = nil) {
        self.id = id
        self.modelId = modelId
        self.name = name
        self.description = description
        self.type = type
        self.importance = importance
        self.confidence = confidence
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.insights = insights
    }
}
