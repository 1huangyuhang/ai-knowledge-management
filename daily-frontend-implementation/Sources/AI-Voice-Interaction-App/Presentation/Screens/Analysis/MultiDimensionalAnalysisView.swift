//
//  MultiDimensionalAnalysisView.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import SwiftUI

/// 多维分析主视图
struct MultiDimensionalAnalysisView: View {
    /// 视图模型
    @StateObject private var viewModel: MultiDimensionalAnalysisViewModel
    /// 当前选择的分析类型
    @State private var selectedAnalysisType: AnalysisType = .thinkingType
    
    /// 初始化
    init() {
        _viewModel = StateObject(wrappedValue: MultiDimensionalAnalysisViewModel())
    }
    
    /// 图表大小
    private let chartSize = CGSize(width: 350, height: 300)
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // 标题和描述
                    VStack(alignment: .leading, spacing: 8) {
                        Text("多维分析")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        Text("深入了解您的认知结构和思考模式")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 10)
                    
                    // 分析类型选择器
                    Picker("分析类型", selection: $selectedAnalysisType) {
                        ForEach(AnalysisType.allCases) {
                            analysisType in
                            Text(analysisType.displayName)
                                .tag(analysisType)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, 20)
                    
                    // 分析描述
                    VStack(alignment: .leading, spacing: 8) {
                        Text(selectedAnalysisType.displayName)
                            .font(.headline)
                        Text(selectedAnalysisType.description)
                            .font(.body)
                            .foregroundColor(.gray)
                    }
                    .padding(.horizontal, 20)
                    
                    // 图表容器
                    VStack(spacing: 20) {
                        // 根据分析类型显示不同的图表
                        switch selectedAnalysisType.chartType {
                        case .radar:
                            if let radarData = viewModel.radarChartData {
                                RadarChartView(data: radarData, size: chartSize)
                            } else {
                                ProgressView("加载数据中...")
                                    .frame(height: chartSize.height)
                            }
                        case .bar:
                            if let barData = viewModel.barChartData {
                                BarChartView(data: barData, size: chartSize)
                            } else {
                                ProgressView("加载数据中...")
                                    .frame(height: chartSize.height)
                            }
                        case .pie:
                            if let pieData = viewModel.pieChartData {
                                PieChartView(data: pieData, size: chartSize)
                            } else {
                                ProgressView("加载数据中...")
                                    .frame(height: chartSize.height)
                            }
                        case .network:
                            Text("网络图功能开发中")
                                .frame(height: chartSize.height)
                                .foregroundColor(.gray)
                        case .line:
                            Text("折线图功能开发中")
                                .frame(height: chartSize.height)
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 20)
                    .background(Color(.systemGray6))
                    .cornerRadius(16)
                    .padding(.horizontal, 20)
                    
                    // 分析结果摘要
                    VStack(alignment: .leading, spacing: 12) {
                        Text("分析结果摘要")
                            .font(.headline)
                        
                        // 摘要卡片
                        VStack(alignment: .leading, spacing: 8) {
                            Text(viewModel.analysisSummary)
                                .font(.body)
                            
                            // 关键指标
                            HStack(spacing: 16) {
                                ForEach(viewModel.keyMetrics, id: \.name) {
                                    metric in
                                    VStack {
                                        Text(metric.value)
                                            .font(.headline)
                                            .fontWeight(.bold)
                                        Text(metric.name)
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color(.systemGray6))
                                    .cornerRadius(8)
                                }
                            }
                        }
                        .padding(16)
                        .background(Color(.systemGray6))
                        .cornerRadius(16)
                    }
                    .padding(.horizontal, 20)
                    
                    // 操作按钮
                    HStack(spacing: 12) {
                        Button(action: {
                            viewModel.exportAnalysisAsPDF()
                        }) {
                            HStack(spacing: 8) {
                                Image(systemName: "square.and.arrow.up")
                                Text("导出分析")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        
                        Button(action: {
                            viewModel.shareAnalysis()
                        }) {
                            HStack(spacing: 8) {
                                Image(systemName: "square.and.arrow.up.on.square")
                                Text("分享")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
            }
            .navigationTitle("多维分析")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                viewModel.loadAnalysisData(for: selectedAnalysisType)
            }
            .onChange(of: selectedAnalysisType) {
                newValue in
                viewModel.loadAnalysisData(for: newValue)
            }
        }
    }
}

/// 预览
struct MultiDimensionalAnalysisView_Previews: PreviewProvider {
    static var previews: some View {
        MultiDimensionalAnalysisView()
    }
}