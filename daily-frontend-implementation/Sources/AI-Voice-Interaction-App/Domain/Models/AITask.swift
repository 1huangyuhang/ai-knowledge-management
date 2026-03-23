//
//  AITask.swift
//  AIVoiceInteraction
//
//  Created by AI Assistant on 2026-01-13.
//

import Foundation

/// AI任务模型
public struct AITask: Identifiable {
    /// 任务ID
    public let id: UUID
    /// 任务类型
    public let type: AITaskType
    /// 任务状态
    public var status: AITaskStatus
    /// 任务输入
    public let input: String
    /// 任务输出
    public var output: String?
    /// 任务创建时间
    public let createdAt: Date
    /// 任务更新时间
    public var updatedAt: Date
    /// 任务完成时间
    public var completedAt: Date?
    /// 相关认知模型ID
    public let cognitiveModelId: UUID
    /// 错误信息（如果任务失败）
    public var error: String?
    /// 任务优先级
    public let priority: AITaskPriority
    /// 任务元数据
    public var metadata: [String: Any]?
    
    /// 初始化AI任务
    /// - Parameters:
    ///   - id: 任务ID，默认生成新ID
    ///   - type: 任务类型
    ///   - status: 任务状态，默认创建
    ///   - input: 任务输入
    ///   - output: 任务输出，默认nil
    ///   - createdAt: 创建时间，默认当前时间
    ///   - updatedAt: 更新时间，默认当前时间
    ///   - completedAt: 完成时间，默认nil
    ///   - cognitiveModelId: 相关认知模型ID
    ///   - error: 错误信息，默认nil
    ///   - priority: 任务优先级，默认中等
    ///   - metadata: 任务元数据，默认nil
    public init(
        id: UUID = UUID(),
        type: AITaskType,
        status: AITaskStatus = .created,
        input: String,
        output: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        completedAt: Date? = nil,
        cognitiveModelId: UUID,
        error: String? = nil,
        priority: AITaskPriority = .medium,
        metadata: [String: Any]? = nil
    ) {
        self.id = id
        self.type = type
        self.status = status
        self.input = input
        self.output = output
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.completedAt = completedAt
        self.cognitiveModelId = cognitiveModelId
        self.error = error
        self.priority = priority
        self.metadata = metadata
    }
    
    /// 更新任务状态
    /// - Parameter status: 新状态
    /// - Returns: 更新后的任务
    public func updatingStatus(_ status: AITaskStatus) -> AITask {
        var updated = self
        updated.status = status
        updated.updatedAt = Date()
        if status == .completed {
            updated.completedAt = Date()
        }
        return updated
    }
    
    /// 更新任务输出
    /// - Parameter output: 新输出
    /// - Returns: 更新后的任务
    public func updatingOutput(_ output: String) -> AITask {
        var updated = self
        updated.output = output
        updated.updatedAt = Date()
        if updated.status != .completed {
            updated.status = .completed
            updated.completedAt = Date()
        }
        return updated
    }
    
    /// 更新任务错误
    /// - Parameter error: 错误信息
    /// - Returns: 更新后的任务
    public func updatingError(_ error: String) -> AITask {
        var updated = self
        updated.error = error
        updated.status = .failed
        updated.updatedAt = Date()
        updated.completedAt = Date()
        return updated
    }
    
    /// 检查任务是否已完成
    public var isCompleted: Bool {
        status == .completed || status == .failed
    }
    
    /// 检查任务是否正在进行中
    public var isInProgress: Bool {
        status == .inProgress
    }
    
    /// 检查任务是否失败
    public var isFailed: Bool {
        status == .failed
    }
}

/// AI任务类型枚举
public enum AITaskType: String, Codable, CaseIterable {
    /// 生成建议
    case generateSuggestion = "GENERATE_SUGGESTION"
    /// 分析关系
    case analyzeRelation = "ANALYZE_RELATION"
    /// 生成洞察
    case generateInsight = "GENERATE_INSIGHT"
    /// 对话
    case conversation = "CONVERSATION"
    /// 文本分析
    case textAnalysis = "TEXT_ANALYSIS"
    /// 认知模型更新
    case updateCognitiveModel = "UPDATE_COGNITIVE_MODEL"
    
    /// 任务类型的显示名称
    public var displayName: String {
        switch self {
        case .generateSuggestion:
            return "生成建议"
        case .analyzeRelation:
            return "分析关系"
        case .generateInsight:
            return "生成洞察"
        case .conversation:
            return "对话"
        case .textAnalysis:
            return "文本分析"
        case .updateCognitiveModel:
            return "更新认知模型"
        }
    }
}

/// AI任务状态枚举
public enum AITaskStatus: String, Codable, CaseIterable {
    /// 已创建
    case created = "CREATED"
    /// 进行中
    case inProgress = "IN_PROGRESS"
    /// 已完成
    case completed = "COMPLETED"
    /// 失败
    case failed = "FAILED"
    /// 已取消
    case cancelled = "CANCELLED"
    
    /// 状态的显示名称
    public var displayName: String {
        switch self {
        case .created:
            return "已创建"
        case .inProgress:
            return "进行中"
        case .completed:
            return "已完成"
        case .failed:
            return "失败"
        case .cancelled:
            return "已取消"
        }
    }
    
    /// 状态对应的颜色
    public var color: String {
        switch self {
        case .created:
            return "gray"
        case .inProgress:
            return "blue"
        case .completed:
            return "green"
        case .failed:
            return "red"
        case .cancelled:
            return "orange"
        }
    }
}

/// AI任务优先级枚举
public enum AITaskPriority: String, Codable, CaseIterable {
    /// 紧急
    case urgent = "URGENT"
    /// 高
    case high = "HIGH"
    /// 中等
    case medium = "MEDIUM"
    /// 低
    case low = "LOW"
    
    /// 优先级的显示名称
    public var displayName: String {
        switch self {
        case .urgent:
            return "紧急"
        case .high:
            return "高"
        case .medium:
            return "中等"
        case .low:
            return "低"
        }
    }
    
    /// 优先级对应的数值，用于排序
    public var value: Int {
        switch self {
        case .urgent:
            return 4
        case .high:
            return 3
        case .medium:
            return 2
        case .low:
            return 1
        }
    }
}

/// AI对话消息模型
public struct AIChatMessage: Equatable, Identifiable {
    /// 消息ID
    public let id: UUID
    /// 消息内容
    public let content: String
    /// 消息发送者类型
    public let sender: AIChatMessageSender
    /// 消息发送时间
    public let sentAt: Date
    /// 相关AI任务ID
    public let aiTaskId: UUID?
    /// 消息状态
    public var status: AIChatMessageStatus
    
    /// 初始化AI对话消息
    /// - Parameters:
    ///   - id: 消息ID，默认生成新ID
    ///   - content: 消息内容
    ///   - sender: 消息发送者类型
    ///   - sentAt: 消息发送时间，默认当前时间
    ///   - aiTaskId: 相关AI任务ID，默认nil
    ///   - status: 消息状态，默认已发送
    public init(
        id: UUID = UUID(),
        content: String,
        sender: AIChatMessageSender,
        sentAt: Date = Date(),
        aiTaskId: UUID? = nil,
        status: AIChatMessageStatus = .sent
    ) {
        self.id = id
        self.content = content
        self.sender = sender
        self.sentAt = sentAt
        self.aiTaskId = aiTaskId
        self.status = status
    }
    
    /// 更新消息状态
    /// - Parameter status: 新状态
    /// - Returns: 更新后的消息
    public func updatingStatus(_ status: AIChatMessageStatus) -> AIChatMessage {
        var updated = self
        updated.status = status
        return updated
    }
}

/// AI对话消息发送者类型
public enum AIChatMessageSender: Equatable {
    /// 用户
    case user
    /// AI
    case ai
    
    /// 发送者的显示名称
    public var displayName: String {
        switch self {
        case .user:
            return "你"
        case .ai:
            return "AI"
        }
    }
}

/// AI对话消息状态
public enum AIChatMessageStatus: Equatable {
    /// 发送中
    case sending
    /// 已发送
    case sent
    /// 发送失败
    case failed
    /// 已读
    case read
    
    /// 状态的显示名称
    public var displayName: String {
        switch self {
        case .sending:
            return "发送中"
        case .sent:
            return "已发送"
        case .failed:
            return "发送失败"
        case .read:
            return "已读"
        }
    }
}
