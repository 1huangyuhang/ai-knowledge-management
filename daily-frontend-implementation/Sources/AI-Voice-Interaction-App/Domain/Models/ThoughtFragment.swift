import Foundation

/// 思想片段实体
public struct ThoughtFragment: Identifiable, Codable {
    /// 思想片段唯一标识符
    public let id: UUID
    /// 用户ID
    public let userId: UUID
    /// 思想内容
    public let content: String
    /// 思想来源
    public let source: ThoughtSource
    /// 思想类型
    public let type: String
    /// 相关模型ID
    public let modelId: UUID?
    /// 创建时间
    public let createdAt: Date
    /// 更新时间
    public let updatedAt: Date
    /// 处理状态
    public let processingStatus: ProcessingStatus
    /// 关联的AI任务ID
    public let aiTaskId: UUID?
    
    /// 初始化思想片段实体
    /// - Parameters:
    ///   - id: 思想片段唯一标识符
    ///   - userId: 用户ID
    ///   - content: 思想内容
    ///   - source: 思想来源
    ///   - type: 思想类型
    ///   - modelId: 相关模型ID
    ///   - createdAt: 创建时间
    ///   - updatedAt: 更新时间
    ///   - processingStatus: 处理状态
    ///   - aiTaskId: 关联的AI任务ID
    public init(id: UUID, userId: UUID, content: String, source: ThoughtSource, type: String, modelId: UUID? = nil, createdAt: Date, updatedAt: Date, processingStatus: ProcessingStatus, aiTaskId: UUID? = nil) {
        self.id = id
        self.userId = userId
        self.content = content
        self.source = source
        self.type = type
        self.modelId = modelId
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.processingStatus = processingStatus
        self.aiTaskId = aiTaskId
    }
}

/// 思想来源枚举
public enum ThoughtSource: String, Codable, CaseIterable {
    /// 手动输入
    case manual = "MANUAL"
    /// 语音输入
    case voice = "VOICE"
    /// 文件导入
    case file = "FILE"
    /// 其他来源
    case other = "OTHER"
    
    /// 获取来源的显示名称
    /// - Returns: 来源的显示名称
    public var displayName: String {
        switch self {
        case .manual:
            return "手动输入"
        case .voice:
            return "语音输入"
        case .file:
            return "文件导入"
        case .other:
            return "其他来源"
        }
    }
}

/// 处理状态枚举
public enum ProcessingStatus: String, Codable, CaseIterable {
    /// 待处理
    case pending = "PENDING"
    /// 处理中
    case processing = "PROCESSING"
    /// 处理成功
    case completed = "COMPLETED"
    /// 处理失败
    case failed = "FAILED"
    
    /// 获取处理状态的显示名称
    /// - Returns: 处理状态的显示名称
    public var displayName: String {
        switch self {
        case .pending:
            return "待处理"
        case .processing:
            return "处理中"
        case .completed:
            return "处理成功"
        case .failed:
            return "处理失败"
        }
    }
}
