//
//  AnalysisExportView.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import SwiftUI

/// 分析导出视图
struct AnalysisExportView: View {
    
    // MARK: - 属性
    
    /// 视图模型
    @ObservedObject var viewModel: AnalysisExportViewModel
    
    /// 关闭回调
    let onClose: () -> Void
    
    // MARK: - 主体视图
    
    var body: some View {
        VStack(spacing: 24) {
            // 标题
            HStack {
                Text("导出分析结果")
                    .font(.headline)
                    .foregroundColor(.primary)
                Spacer()
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .font(.title2)
                        .foregroundColor(.secondary)
                }
            }
            
            // 导出格式选择
            VStack(alignment: .leading, spacing: 12) {
                Text("选择导出格式")
                    .font(.subheadline)
                    .foregroundColor(.primary)
                
                // 格式选择器
                HStack(spacing: 12) {
                    ForEach(AnalysisExportViewModel.ExportFormat.allCases) {
                        format in
                        Button(action: {
                            viewModel.selectedFormat = format
                        }) {
                            VStack(spacing: 8) {
                                Image(systemName: format.iconName)
                                    .font(.title2)
                                    .foregroundColor(viewModel.selectedFormat == format ? .blue : .secondary)
                                Text(format.displayName)
                                    .font(.caption)
                                    .foregroundColor(viewModel.selectedFormat == format ? .blue : .secondary)
                            }
                            .padding()
                            .background(viewModel.selectedFormat == format ? Color.blue.opacity(0.1) : Color(.systemBackground))
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(viewModel.selectedFormat == format ? .blue : .gray.opacity(0.3), lineWidth: 1)
                            )
                        }
                    }
                }
            }
            
            // 导出状态
            VStack(alignment: .leading, spacing: 8) {
                Text("导出状态")
                    .font(.subheadline)
                    .foregroundColor(.primary)
                
                Text(viewModel.statusDescription)
                    .font(.body)
                    .foregroundColor(viewModel.statusTextColor)
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    )
            }
            
            // 导出按钮
            Button(action: {
                viewModel.startExport()
            }) {
                HStack(spacing: 8) {
                    Image(systemName: "square.and.arrow.up.on.square")
                        .font(.body)
                    Text(viewModel.exportButtonTitle)
                        .font(.body)
                        .fontWeight(.medium)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(viewModel.canExport ? .blue : .gray.opacity(0.5))
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(!viewModel.canExport)
            
            // 成功操作
            if case .success(let url) = viewModel.exportStatus {
                VStack(spacing: 12) {
                    Divider()
                    
                    HStack(spacing: 12) {
                        Button(action: {
                            // 打开文件位置
                            UIApplication.shared.open(url)
                        }) {
                            Text("打开文件")
                                .font(.body)
                                .padding()
                                .frame(maxWidth: .infinity)
                                .background(Color(.systemBackground))
                                .foregroundColor(.blue)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(.blue, lineWidth: 1)
                                )
                        }
                        
                        Button(action: {
                            // 分享文件
                            let shareService = AnalysisShareService()
                            shareService.shareAnalysisResult(viewModel.analysisResult) { success, error in
                                if success {
                                    print("分享成功")
                                } else {
                                    print("分享失败: \(error?.localizedDescription ?? "未知错误")")
                                }
                            }
                        }) {
                            Text("分享文件")
                                .font(.body)
                                .padding()
                                .frame(maxWidth: .infinity)
                                .background(.blue)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGroupedBackground))
        .cornerRadius(16)
        .shadow(radius: 20)
        .frame(maxWidth: 400)
    }
}

// MARK: - 扩展

extension AnalysisExportViewModel.ExportFormat {
    /// 获取格式对应的图标名称
    var iconName: String {
        switch self {
        case .pdf:
            return "doc.text.fill"
        case .image:
            return "photo.fill"
        case .text:
            return "text.alignleft"
        }
    }
}

extension AnalysisExportViewModel {
    /// 获取状态文本颜色
    var statusTextColor: Color {
        switch exportStatus {
        case .idle:
            return .secondary
        case .exporting:
            return .primary
        case .success:
            return .green
        case .failure:
            return .red
        }
    }
}

// MARK: - 预览

struct AnalysisExportView_Previews: PreviewProvider {
    static var previews: some View {
        // 创建一个模拟的分析结果
        let mockResult = AnalysisResult(
            id: UUID(),
            modelId: UUID(),
            analysisType: .thinkingType,
            createdAt: Date(),
            updatedAt: Date(),
            isComplete: true,
            confidenceScore: 0.85,
            radarChartData: RadarChartData(
                title: "测试分析",
                description: "测试分析描述",
                categories: ["测试1", "测试2", "测试3", "测试4"],
                datasets: [
                    RadarDataset(
                        label: "测试数据",
                        values: [85.5, 75.5, 65.5, 95.5],
                        color: "#4F46E5",
                        fillColor: "#4F46E5"
                    )
                ]
            ),
            barChartData: nil,
            pieChartData: nil,
            lineChartData: nil,
            networkNodes: nil,
            networkEdges: nil,
            insights: ["这是一个测试洞察1", "这是一个测试洞察2"],
            recommendations: ["这是一个测试建议1", "这是一个测试建议2"]
        )
        
        // 创建视图模型
        let viewModel = AnalysisExportViewModel(analysisResult: mockResult)
        
        // 预览
        AnalysisExportView(viewModel: viewModel, onClose: {})
            .padding()
            .background(Color(.systemBackground))
    }
}