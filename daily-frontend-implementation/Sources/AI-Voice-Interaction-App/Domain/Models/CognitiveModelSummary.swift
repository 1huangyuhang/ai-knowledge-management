//
//  CognitiveModelSummary.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import Foundation

/// 认知模型摘要数据模型
struct CognitiveModelSummary: Identifiable, Codable {
    /// 模型ID
    let id: UUID
    /// 模型名称
    let name: String
    /// 模型描述
    let description: String
    /// 创建时间
    let createdAt: Date
    /// 更新时间
    let updatedAt: Date
    /// 概念数量
    let conceptCount: Int
    /// 关系数量
    let relationCount: Int
    /// 是否激活
    let isActive: Bool
    
    /// 格式化的创建时间
    var formattedCreatedAt: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: createdAt)
    }
    
    /// 模型的活跃度评分
    var activityScore: Double {
        let totalElements = Double(conceptCount + relationCount)
        return totalElements > 0 ? min(totalElements / 100.0, 1.0) : 0.0
    }
}
