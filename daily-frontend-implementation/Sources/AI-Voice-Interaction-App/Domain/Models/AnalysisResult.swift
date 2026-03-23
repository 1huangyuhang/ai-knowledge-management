//
//  AnalysisResult.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import Foundation

/// 分析结果数据模型
enum ExportFormat {
    case image
    case pdf
    case text
}

enum SharePlatform {
    case messages
    case mail
    case airdrop
    case other
}

/// 分析结果数据模型
struct AnalysisResult: Identifiable, Codable, Equatable {
    /// 分析结果ID
    let id: UUID
    /// 模型ID
    let modelId: UUID
    /// 分析类型
    let analysisType: AnalysisType
    /// 创建时间
    let createdAt: Date
    /// 更新时间
    let updatedAt: Date
    /// 是否完成
    let isComplete: Bool
    /// 置信度分数
    let confidenceScore: Double
    /// 雷达图数据
    let radarChartData: RadarChartData?
    /// 柱状图数据
    let barChartData: BarChartData?
    /// 饼图数据
    let pieChartData: PieChartData?
    /// 折线图数据
    let lineChartData: LineChartData?
    /// 网络节点数据
    let networkNodes: [NetworkNode]?
    /// 网络边数据
    let networkEdges: [NetworkEdge]?
    /// 洞察列表
    let insights: [String]
    /// 建议列表
    let recommendations: [String]
    
    /// 导出标题
    var exportTitle: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        let formattedDate = formatter.string(from: createdAt)
        return "\(analysisType.displayName)分析_\(formattedDate)".replacingOccurrences(of: " ", with: "_")
    }
    
    /// 摘要文本
    var summaryText: String {
        var text = "# \(analysisType.displayName)\n\n"
        text += "## 分析时间：\(formattedCreatedAt)\n"
        text += "## 可信度：\(String(format: "%.1f%%", confidenceScore * 100))\n\n"
        
        if !insights.isEmpty {
            text += "## 分析洞察\n"
            for (index, insight) in insights.enumerated() {
                text += "\(index + 1). \(insight)\n"
            }
            text += "\n"
        }
        
        if !recommendations.isEmpty {
            text += "## 改进建议\n"
            for (index, recommendation) in recommendations.enumerated() {
                text += "\(index + 1). \(recommendation)\n"
            }
        }
        
        return text
    }
    
    /// 格式化的创建时间
    var formattedCreatedAt: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: createdAt)
    }
}

/// 分析历史项
struct AnalysisHistoryItem: Identifiable, Codable {
    /// 历史项ID
    let id: UUID
    /// 分析结果ID
    let analysisId: UUID
    /// 模型ID
    let modelId: UUID
    /// 模型名称
    let modelName: String
    /// 分析类型
    let analysisType: AnalysisType
    /// 分析时间
    let analyzedAt: Date
    /// 置信度分数
    let confidenceScore: Double
    /// 是否有新洞察
    let hasNewInsights: Bool
}
