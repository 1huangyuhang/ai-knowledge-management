//
//  AnalysisResultView.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import SwiftUI

/// 可展开/折叠的章节视图
struct ExpandableSectionView<Content: View>: View {
    let title: String
    @State var isExpanded: Bool
    let content: () -> Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Button(action: {
                    withAnimation {
                        isExpanded.toggle()
                    }
                }) {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            if isExpanded {
                content()
            }
        }
    }
}

/// 分析结果展示组件
struct AnalysisResultView: View {
    let result: AnalysisResult
    let onExport: () -> Void
    let onShare: () -> Void
    let onChartDetail: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // 分析基本信息和操作按钮
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("分析时间: \(result.formattedCreatedAt)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundColor(.yellow)
                        Text("可信度: \(String(format: "%.1f%%", result.confidenceScore * 100))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                // 操作按钮
                HStack(spacing: 8) {
                    Button(action: onChartDetail) {
                        Image(systemName: "chart.bar.xaxis")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                    .help("查看图表详情")
                    
                    Button(action: onExport) {
                        Image(systemName: "square.and.arrow.up.on.square")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                    .help("导出分析结果")
                    
                    Button(action: onShare) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                    .help("分享分析结果")
                }
            }
            
            // 图表展示（使用动画图表）
            switch result.analysisType.chartType {
            case .radar:
                if let radarData = result.radarChartData, !radarData.datasets.isEmpty {
                    // 将RadarChartData转换为[RadarChartDataPoint]
                    let chartDataPoints = radarData.datasets.flatMap { dataset in
                        radarData.categories.enumerated().map {
                            RadarChartDataPoint(
                                id: UUID(),
                                category: $1,
                                value: dataset.values[$0],
                                color: Color(dataset.color)
                            )
                        }
                    }
                    AnimatedRadarChartView(
                        data: chartDataPoints,
                        title: result.analysisType.displayName
                    )
                }
            case .bar:
                if let barData = result.barChartData, !barData.datasets.isEmpty {
                    // 将BarChartData转换为[BarChartDataPoint]
                    let chartDataPoints = barData.datasets.flatMap { dataset in
                        barData.categories.enumerated().map {
                            BarChartDataPoint(
                                id: UUID(),
                                category: $1,
                                value: dataset.values[$0],
                                color: Color(dataset.color)
                            )
                        }
                    }
                    AnimatedBarChartView(
                        data: chartDataPoints,
                        title: result.analysisType.displayName
                    )
                }
            case .pie:
                if let pieData = result.pieChartData, !pieData.datasets.isEmpty {
                    // 将PieChartData转换为[PieChartDataPoint]
                    let total = pieData.datasets.reduce(0) { $0 + $1.value }
                    let chartDataPoints = pieData.datasets.map {
                        PieChartDataPoint(
                            id: UUID(),
                            category: $0.label,
                            value: $0.value,
                            color: Color($0.color),
                            percentage: ($0.value / total) * 100
                        )
                    }
                    
                    AnimatedPieChartView(
                        data: chartDataPoints,
                        title: result.analysisType.displayName
                    )
                }
            case .network:
                // 网络图实现
                Text("网络图功能开发中")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 2)
            case .line:
                // 线图实现
                Text("线图功能开发中")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 2)
            }
            
            // 分析洞察（可展开/折叠）
            if !result.insights.isEmpty {
                ExpandableSectionView(
                    title: "分析洞察",
                    isExpanded: true,
                    content: {
                        VStack(spacing: 12) {
                            ForEach(result.insights.indices, id: \.self) {
                                Text("\($0 + 1). \(result.insights[$0])")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                    .padding(12)
                                    .background(Color(.systemBackground))
                                    .cornerRadius(8)
                                    .shadow(radius: 1)
                                    .animation(.easeInOut, value: result.insights)
                            }
                        }
                    }
                )
            }
            
            // 改进建议（可展开/折叠）
            if !result.recommendations.isEmpty {
                ExpandableSectionView(
                    title: "改进建议",
                    isExpanded: true,
                    content: {
                        VStack(spacing: 12) {
                            ForEach(result.recommendations.indices, id: \.self) { index in
                                HStack(spacing: 8) {
                                    Image(systemName: "lightbulb.fill")
                                        .font(.body)
                                        .foregroundColor(.yellow)
                                    Text(result.recommendations[index])
                                        .font(.body)
                                        .foregroundColor(.primary)
                                }
                                .padding(12)
                                .background(Color(.systemBackground))
                                .cornerRadius(8)
                                .shadow(radius: 1)
                                .animation(.easeInOut, value: result.recommendations)
                            }
                        }
                    }
                )
            }
        }
        .padding()
        .animation(.easeInOut, value: result)
    }
}