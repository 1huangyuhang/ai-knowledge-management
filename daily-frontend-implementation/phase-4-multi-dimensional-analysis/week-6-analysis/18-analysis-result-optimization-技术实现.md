# Day 18: 分析结果优化和分享 - 代码实现文档

## 1. 今日任务概述

**核心任务**：优化分析结果展示和分享功能，包括可视化效果优化、分析结果导出和分享功能、分析历史管理等。

**技术栈**：Swift 5.9+, SwiftUI 5.0+, Combine, Charts, PDFKit

**关联API**：
- GET `/api/v1/models/{modelId}/analyses` - 获取多维度分析结果

## 2. 详细技术实现

### 2.1 目录结构设计

```
Sources/
├── AI-Voice-Interaction-App/
│   ├── View/
│   │   └── MultiDimensionalAnalysis/
│   │       ├── MultiDimensionalAnalysisView.swift # 多维度分析主界面
│   │       ├── AnalysisResultView.swift           # 分析结果展示组件（增强）
│   │       ├── ChartDetailView.swift             # 图表详情视图
│   │       ├── AnalysisExportView.swift          # 分析导出视图
│   │       └── AnimatedChartViews.swift          # 动画图表组件
│   ├── ViewModel/
│   │   └── MultiDimensionalAnalysis/
│   │       ├── MultiDimensionalAnalysisViewModel.swift # 多维度分析ViewModel（增强）
│   │       └── AnalysisExportViewModel.swift      # 分析导出ViewModel
│   ├── Model/
│   │   └── MultiDimensionalAnalysis/
│   │       └── AnalysisResult.swift               # 分析结果数据模型（增强）
│   └── Service/
│       ├── Analysis/
│       │   ├── MultiDimensionalAnalysisService.swift # 多维度分析服务
│       │   └── AnalysisCacheService.swift         # 分析结果缓存服务
│       └── Share/
│           └── AnalysisShareService.swift        # 分析分享服务
```

### 2.2 核心数据模型设计

#### 2.2.1 分析结果数据模型增强

```swift
// AnalysisResult.swift
import Foundation

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

extension AnalysisResult {
    // 计算属性：导出标题
    var exportTitle: String {
        return "\(analysisType.displayName)_\(formattedCreatedAt.replacingOccurrences(of: " ", with: "_"))"
    }
    
    // 计算属性：摘要文本
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
}
```

### 2.3 动画图表组件实现

```swift
// AnimatedChartViews.swift
import SwiftUI
import Charts

// 动画雷达图组件
struct AnimatedRadarChartView: View {
    let data: [RadarChartDataPoint]
    let title: String
    @State private var animateData: [RadarChartDataPoint]
    @State private var isAnimating = false
    
    init(data: [RadarChartDataPoint], title: String) {
        self.data = data
        self.title = title
        // 初始化动画数据，所有值为0
        self._animateData = State(initialValue: data.map { 
            RadarChartDataPoint(
                id: $0.id,
                category: $0.category,
                value: 0,
                color: $0.color
            )
        })
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.headline)
                .foregroundColor(.primary)
            
            // 动画雷达图
            Chart {
                ForEach(animateData) { dataPoint in
                    AreaMark(
                        x: .value("Category", dataPoint.category),
                        y: .value("Value", dataPoint.value)
                    )
                    .foregroundStyle(LinearGradient(
                        gradient: Gradient(colors: [dataPoint.color, dataPoint.color.opacity(0.3)]),
                        startPoint: .top,
                        endPoint: .bottom
                    ))
                    .interpolationMethod(.catmullRom)
                    
                    LineMark(
                        x: .value("Category", dataPoint.category),
                        y: .value("Value", dataPoint.value)
                    )
                    .foregroundStyle(dataPoint.color)
                    .lineStyle(StrokeStyle(lineWidth: 2))
                    .interpolationMethod(.catmullRom)
                    
                    PointMark(
                        x: .value("Category", dataPoint.category),
                        y: .value("Value", dataPoint.value)
                    )
                    .foregroundStyle(dataPoint.color)
                    .symbolSize(80)
                }
            }
            .frame(height: 300)
            .chartLegend("hidden")
            .chartYScale(domain: 0...100)
            .onAppear {
                startAnimation()
            }
            .onChange(of: data) {
                startAnimation()
            }
            
            // 图例
            HStack(spacing: 12) {
                ForEach(data) { dataPoint in
                    LegendItemView(
                        color: dataPoint.color,
                        label: dataPoint.category,
                        value: String(format: "%.1f", dataPoint.value)
                    )
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, 16)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    // 开始动画
    private func startAnimation() {
        isAnimating = true
        
        // 动画时长
        let duration: Double = 1.5
        let startTime = Date()
        
        Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { timer in
            let elapsedTime = Date().timeIntervalSince(startTime)
            let progress = min(elapsedTime / duration, 1.0)
            
            // 使用缓动函数
            let easeOutProgress = 1.0 - pow(1.0 - progress, 3)
            
            // 更新动画数据
            animateData = data.enumerated().map { index, original in
                let animatedValue = original.value * easeOutProgress
                return RadarChartDataPoint(
                    id: original.id,
                    category: original.category,
                    value: animatedValue,
                    color: original.color
                )
            }
            
            // 动画结束
            if progress >= 1.0 {
                timer.invalidate()
                isAnimating = false
            }
        }
    }
}

// 动画柱状图组件
struct AnimatedBarChartView: View {
    let data: [BarChartDataPoint]
    let title: String
    @State private var animateData: [BarChartDataPoint]
    @State private var isAnimating = false
    
    init(data: [BarChartDataPoint], title: String) {
        self.data = data
        self.title = title
        // 初始化动画数据，所有值为0
        self._animateData = State(initialValue: data.map { 
            BarChartDataPoint(
                id: $0.id,
                category: $0.category,
                value: 0,
                color: $0.color
            )
        })
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.headline)
                .foregroundColor(.primary)
            
            // 动画柱状图
            Chart {
                ForEach(animateData) { dataPoint in
                    BarMark(
                        x: .value("Category", dataPoint.category),
                        y: .value("Value", dataPoint.value)
                    )
                    .foregroundStyle(dataPoint.color)
                    .cornerRadius(4, corners: [.topLeft, .topRight])
                    .annotation(position: .top, alignment: .center) {
                        Text(String(format: "%.1f", dataPoint.value))
                            .font(.caption)
                            .foregroundColor(.primary)
                    }
                }
            }
            .frame(height: 300)
            .chartLegend("hidden")
            .chartYScale(domain: 0...100)
            .onAppear {
                startAnimation()
            }
            .onChange(of: data) {
                startAnimation()
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    // 开始动画
    private func startAnimation() {
        isAnimating = true
        
        // 动画时长
        let duration: Double = 1.5
        let startTime = Date()
        
        Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { timer in
            let elapsedTime = Date().timeIntervalSince(startTime)
            let progress = min(elapsedTime / duration, 1.0)
            
            // 使用缓动函数
            let easeOutProgress = 1.0 - pow(1.0 - progress, 3)
            
            // 更新动画数据
            animateData = data.enumerated().map { index, original in
                let animatedValue = original.value * easeOutProgress
                return BarChartDataPoint(
                    id: original.id,
                    category: original.category,
                    value: animatedValue,
                    color: original.color
                )
            }
            
            // 动画结束
            if progress >= 1.0 {
                timer.invalidate()
                isAnimating = false
            }
        }
    }
}
```

### 2.3 分析结果展示组件增强

```swift
// AnalysisResultView.swift
import SwiftUI

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
                    .tooltip("查看图表详情")
                    
                    Button(action: onExport) {
                        Image(systemName: "square.and.arrow.up.on.square")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                    .tooltip("导出分析结果")
                    
                    Button(action: onShare) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                    .tooltip("分享分析结果")
                }
            }
            
            // 图表展示（使用动画图表）
            switch result.analysisType.chartType {
            case .radar:
                if let radarData = result.radarChartData, !radarData.isEmpty {
                    AnimatedRadarChartView(
                        data: radarData,
                        title: result.analysisType.displayName
                    )
                }
            case .bar:
                if let barData = result.barChartData, !barData.isEmpty {
                    AnimatedBarChartView(
                        data: barData,
                        title: result.analysisType.displayName
                    )
                }
            case .pie:
                if let pieData = result.pieChartData, !pieData.isEmpty {
                    // 计算百分比
                    let total = pieData.reduce(0) { $0 + $1.value }
                    let pieDataWithPercentage = pieData.map { dataPoint in
                        var data = dataPoint
                        data.percentage = (dataPoint.value / total) * 100
                        return data
                    }
                    
                    AnimatedPieChartView(
                        data: pieDataWithPercentage,
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
                            ForEach(result.recommendations.indices, id: \.self) {
                                HStack(spacing: 8) {
                                    Image(systemName: "lightbulb.fill")
                                        .font(.body)
                                        .foregroundColor(.yellow)
                                    Text(result.recommendations[$0])
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

// 可展开/折叠的章节视图
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
```

### 2.4 分析分享服务

```swift
// AnalysisShareService.swift
import Foundation
import UIKit
import PDFKit

protocol AnalysisShareServiceProtocol {
    func exportAnalysisResult(_ result: AnalysisResult, format: ExportFormat) -> AnyPublisher<URL, Error>
    func shareAnalysisResult(_ result: AnalysisResult, platforms: [SharePlatform]) -> AnyPublisher<Bool, Error>
    func generateChartImage(chartView: UIView) -> AnyPublisher<UIImage, Error>
    func generatePDF(_ result: AnalysisResult) -> AnyPublisher<URL, Error>
}

class AnalysisShareService: AnalysisShareServiceProtocol {
    func exportAnalysisResult(_ result: AnalysisResult, format: ExportFormat) -> AnyPublisher<URL, Error> {
        return Future<URL, Error> { [weak self] promise in
            guard let self = self else { return }
            
            do {
                var url: URL?
                
                switch format {
                case .image:
                    // 生成图表图片（简化实现，实际项目中应渲染真实图表）
                    let chartImage = UIImage(systemName: "chart.bar.fill") ?? UIImage()
                    url = try self.saveImageToTemporaryFile(chartImage, name: result.exportTitle)
                case .pdf:
                    url = try self.generatePDF(result).wait()
                case .text:
                    url = try self.saveTextToTemporaryFile(result.summaryText, name: result.exportTitle)
                }
                
                if let url = url {
                    promise(.success(url))
                } else {
                    promise(.failure(NSError(domain: "AnalysisShareService", code: -1, userInfo: [NSLocalizedDescriptionKey: "导出失败"])))
                }
            } catch {
                promise(.failure(error))
            }
        }.eraseToAnyPublisher()
    }
    
    func shareAnalysisResult(_ result: AnalysisResult, platforms: [SharePlatform]) -> AnyPublisher<Bool, Error> {
        return Future<Bool, Error> { [weak self] promise in
            guard let self = self else { return }
            
            // 生成分享内容
            let shareText = result.summaryText
            let activityViewController = UIActivityViewController(
                activityItems: [shareText],
                applicationActivities: nil
            )
            
            // 获取当前UIWindow
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                promise(.failure(NSError(domain: "AnalysisShareService", code: -1, userInfo: [NSLocalizedDescriptionKey: "无法获取当前视图控制器"])))
                return
            }
            
            // 显示分享界面
            activityViewController.completionWithItemsHandler = { (activityType, completed, returnedItems, error) in
                if let error = error {
                    promise(.failure(error))
                } else {
                    promise(.success(completed))
                }
            }
            
            rootViewController.present(activityViewController, animated: true, completion: nil)
        }.eraseToAnyPublisher()
    }
    
    func generateChartImage(chartView: UIView) -> AnyPublisher<UIImage, Error> {
        return Future<UIImage, Error> { promise in
            // 生成图表图片
            let renderer = UIGraphicsImageRenderer(bounds: chartView.bounds)
            let image = renderer.image { context in
                chartView.layer.render(in: context.cgContext)
            }
            promise(.success(image))
        }.eraseToAnyPublisher()
    }
    
    func generatePDF(_ result: AnalysisResult) -> AnyPublisher<URL, Error> {
        return Future<URL, Error> { [weak self] promise in
            guard let self = self else { return }
            
            do {
                // 创建PDF文档
                let pdfMetaData = [
                    kCGPDFContextCreator as String: "AI认知辅助系统",
                    kCGPDFContextAuthor as String: "AI认知辅助系统",
                    kCGPDFContextTitle as String: result.exportTitle
                ]
                
                // 创建PDF文件
                let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
                let pdfURL = documentsDirectory.appendingPathComponent("\(result.exportTitle).pdf")
                
                // 创建PDF渲染器
                let pdfRenderer = UIGraphicsPDFRenderer(bounds: CGRect(x: 0, y: 0, width: 842, height: 595), metadata: pdfMetaData)
                
                // 生成PDF内容
                try pdfRenderer.writePDF(to: pdfURL) { context in
                    // 开始PDF页面
                    context.beginPage()
                    
                    // 绘制标题
                    let titleFont = UIFont.boldSystemFont(ofSize: 24)
                    let titleAttributes: [NSAttributedString.Key: Any] = [
                        .font: titleFont,
                        .foregroundColor: UIColor.black
                    ]
                    let titleRect = CGRect(x: 50, y: 50, width: 742, height: 30)
                    result.analysisType.displayName.draw(in: titleRect, withAttributes: titleAttributes)
                    
                    // 绘制分析信息
                    let infoFont = UIFont.systemFont(ofSize: 14)
                    let infoAttributes: [NSAttributedString.Key: Any] = [
                        .font: infoFont,
                        .foregroundColor: UIColor.gray
                    ]
                    
                    let info1 = "分析时间: \(result.formattedCreatedAt)"
                    let info1Rect = CGRect(x: 50, y: 100, width: 300, height: 20)
                    info1.draw(in: info1Rect, withAttributes: infoAttributes)
                    
                    let info2 = "可信度: \(String(format: "%.1f%%", result.confidenceScore * 100))"
                    let info2Rect = CGRect(x: 50, y: 130, width: 300, height: 20)
                    info2.draw(in: info2Rect, withAttributes: infoAttributes)
                    
                    // 绘制摘要文本
                    let textFont = UIFont.systemFont(ofSize: 16)
                    let textAttributes: [NSAttributedString.Key: Any] = [
                        .font: textFont,
                        .foregroundColor: UIColor.black
                    ]
                    
                    let textRect = CGRect(x: 50, y: 180, width: 742, height: 300)
                    result.summaryText.draw(in: textRect, withAttributes: textAttributes)
                    
                    // 结束PDF页面
                    context.endPage()
                }
                
                promise(.success(pdfURL))
            } catch {
                promise(.failure(error))
            }
        }.eraseToAnyPublisher()
    }
    
    // 辅助方法：保存图片到临时文件
    private func saveImageToTemporaryFile(_ image: UIImage, name: String) throws -> URL {
        let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let fileURL = documentsDirectory.appendingPathComponent("\(name).png")
        
        if let data = image.pngData() {
            try data.write(to: fileURL)
            return fileURL
        } else {
            throw NSError(domain: "AnalysisShareService", code: -1, userInfo: [NSLocalizedDescriptionKey: "无法将图片转换为PNG数据"])
        }
    }
    
    // 辅助方法：保存文本到临时文件
    private func saveTextToTemporaryFile(_ text: String, name: String) throws -> URL {
        let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let fileURL = documentsDirectory.appendingPathComponent("\(name).txt")
        try text.write(to: fileURL, atomically: true, encoding: .utf8)
        return fileURL
    }
}
```

### 2.5 分析导出视图

```swift
// AnalysisExportView.swift
import SwiftUI

struct AnalysisExportView: View {
    @ObservedObject private var viewModel: AnalysisExportViewModel
    @Binding var isPresented: Bool
    
    init(
        result: AnalysisResult,
        shareService: AnalysisShareServiceProtocol,
        isPresented: Binding<Bool>
    ) {
        _viewModel = ObservedObject(
            wrappedValue: AnalysisExportViewModel(
                result: result,
                shareService: shareService
            )
        )
        _isPresented = isPresented
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // 导出格式选择
                VStack(alignment: .leading, spacing: 12) {
                    Text("选择导出格式")
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        ExportFormatButton(
                            format: .image,
                            isSelected: viewModel.selectedFormat == .image,
                            onSelect: { viewModel.selectedFormat = .image }
                        )
                        
                        ExportFormatButton(
                            format: .pdf,
                            isSelected: viewModel.selectedFormat == .pdf,
                            onSelect: { viewModel.selectedFormat = .pdf }
                        )
                        
                        ExportFormatButton(
                            format: .text,
                            isSelected: viewModel.selectedFormat == .text,
                            onSelect: { viewModel.selectedFormat = .text }
                        )
                    }
                }
                
                Spacer()
                
                // 导出按钮
                Button(action: {
                    viewModel.exportAnalysis()
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "square.and.arrow.up.on.square.fill")
                            .font(.title2)
                        Text("导出分析结果")
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                    .shadow(radius: 2)
                }
                .disabled(viewModel.isExporting)
                
                if viewModel.isExporting {
                    ProgressView("正在导出...")
                        .padding()
                }
                
                if let exportURL = viewModel.exportedURL {
                    HStack(spacing: 16) {
                        Text("导出成功！")
                            .font(.body)
                            .foregroundColor(.green)
                        
                        Button(action: {
                            // 打开导出文件
                            UIApplication.shared.open(exportURL)
                        }) {
                            Text("打开文件")
                                .font(.body)
                                .foregroundColor(.blue)
                        }
                        
                        Button(action: {
                            // 分享导出文件
                            viewModel.shareExportedFile()
                        }) {
                            Image(systemName: "square.and.arrow.up")
                                .font(.body)
                                .foregroundColor(.blue)
                        }
                    }
                    .padding()
                }
            }
            .padding()
            .navigationTitle("导出分析结果")
            .navigationBarItems(leading: Button("取消") {
                isPresented = false
            })
            .alert(isPresented: $viewModel.showError) {
                Alert(
                    title: Text("导出失败"),
                    message: Text(viewModel.errorMessage),
                    dismissButton: .default(Text("确定"))
                )
            }
        }
    }
}

// 导出格式按钮组件
struct ExportFormatButton: View {
    let format: ExportFormat
    let isSelected: Bool
    let onSelect: () -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: format.iconName)
                .font(.system(size: 48))
                .foregroundColor(isSelected ? .blue : .gray)
            
            Text(format.displayName)
                .font(.body)
                .fontWeight(.bold)
                .foregroundColor(isSelected ? .blue : .primary)
            
            Text(format.description)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(16)
        .background(isSelected ? Color.blue.opacity(0.1) : Color(.systemBackground))
        .cornerRadius(12)
        .border(isSelected ? Color.blue : Color.clear, width: 2)
        .shadow(radius: 2)
        .onTapGesture {
            onSelect()
        }
    }
}

extension ExportFormat {
    var displayName: String {
        switch self {
        case .image:
            return "图片"
        case .pdf:
            return "PDF"
        case .text:
            return "文本"
        }
    }
    
    var description: String {
        switch self {
        case .image:
            return "导出图表为图片文件"
        case .pdf:
            return "导出完整分析报告为PDF"
        case .text:
            return "导出分析摘要为文本文件"
        }
    }
    
    var iconName: String {
        switch self {
        case .image:
            return "photo.fill"
        case .pdf:
            return "doc.pdf.fill"
        case .text:
            return "doc.text.fill"
        }
    }
}
```

### 2.6 分析导出ViewModel

```swift
// AnalysisExportViewModel.swift
import Foundation
import Combine

class AnalysisExportViewModel: ObservableObject {
    @Published var selectedFormat: ExportFormat = .pdf
    @Published var isExporting: Bool = false
    @Published var exportedURL: URL?
    @Published var showError: Bool = false
    @Published var errorMessage: String = ""
    
    private let result: AnalysisResult
    private let shareService: AnalysisShareServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    init(
        result: AnalysisResult,
        shareService: AnalysisShareServiceProtocol
    ) {
        self.result = result
        self.shareService = shareService
    }
    
    // 导出分析结果
    func exportAnalysis() {
        isExporting = true
        exportedURL = nil
        showError = false
        
        shareService.exportAnalysisResult(result, format: selectedFormat)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isExporting = false
                switch completion {
                case .finished:
                    break
                case .failure(let error):
                    self?.showError = true
                    self?.errorMessage = error.localizedDescription
                }
            }, receiveValue: { [weak self] url in
                self?.exportedURL = url
            })
            .store(in: &cancellables)
    }
    
    // 分享导出文件
    func shareExportedFile() {
        guard let url = exportedURL else { return }
        
        let activityViewController = UIActivityViewController(
            activityItems: [url],
            applicationActivities: nil
        )
        
        // 获取当前UIWindow
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            return
        }
        
        rootViewController.present(activityViewController, animated: true, completion: nil)
    }
}
```

### 2.7 多维度分析ViewModel增强

```swift
// MultiDimensionalAnalysisViewModel.swift
import Foundation
import Combine

class MultiDimensionalAnalysisViewModel: ObservableObject {
    @Published var currentResult: AnalysisResult?
    @Published var selectedModel: CognitiveModelSummary?
    @Published var historyItems: [AnalysisHistoryItem] = []
    @Published var isLoading: Bool = false
    @Published var isModelSelectorPresented: Bool = false
    @Published var isExportViewPresented: Bool = false
    @Published var errorMessage: String?
    @Published var selectedType: AnalysisType = .thinkingType
    
    private let service: MultiDimensionalAnalysisServiceProtocol
    private let cognitiveModelService: CognitiveModelServiceProtocol
    private let cacheService: AnalysisCacheServiceProtocol
    private let shareService: AnalysisShareServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    init(
        service: MultiDimensionalAnalysisServiceProtocol,
        cognitiveModelService: CognitiveModelServiceProtocol,
        cacheService: AnalysisCacheServiceProtocol = AnalysisCacheService(),
        shareService: AnalysisShareServiceProtocol = AnalysisShareService()
    ) {
        self.service = service
        self.cognitiveModelService = cognitiveModelService
        self.cacheService = cacheService
        self.shareService = shareService
        
        loadAnalysisHistory()
    }
    
    // 分享分析结果
    func shareAnalysis() {
        guard let result = currentResult else { return }
        
        shareService.shareAnalysisResult(result, platforms: [.other])
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { completion in
                if case .failure(let error) = completion {
                    print("分享失败: \(error.localizedDescription)")
                }
            }, receiveValue: { _ in
                // 分享成功
            })
            .store(in: &cancellables)
    }
    
    // 删除分析历史
    func deleteAnalysisHistory(_ historyItem: AnalysisHistoryItem) {
        // 删除本地缓存
        cacheService.deleteAnalysisResult(id: historyItem.analysisId)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { _ in
                // 更新历史列表
                self.loadAnalysisHistory()
            }, receiveValue: { _ in
                // 删除成功
            })
            .store(in: &cancellables)
    }
    
    // 清除所有分析历史
    func clearAllAnalysisHistory() {
        cacheService.clearCache()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { _ in
                // 更新历史列表
                self.loadAnalysisHistory()
            }, receiveValue: { _ in
                // 清除成功
            })
            .store(in: &cancellables)
    }
    
    // 其他方法...
}
```

### 2.8 多维度分析主界面增强

```swift
// MultiDimensionalAnalysisView.swift
import SwiftUI

struct MultiDimensionalAnalysisView: View {
    @StateObject private var viewModel: MultiDimensionalAnalysisViewModel
    @State private var isExportViewPresented: Bool = false
    @State private var isChartDetailViewPresented: Bool = false
    
    init(
        multiDimensionalAnalysisService: MultiDimensionalAnalysisServiceProtocol,
        cognitiveModelService: CognitiveModelServiceProtocol
    ) {
        _viewModel = StateObject(
            wrappedValue: MultiDimensionalAnalysisViewModel(
                service: multiDimensionalAnalysisService,
                cognitiveModelService: cognitiveModelService
            )
        )
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // 分析类型选择
                AnalysisTypeSelectorView(selectedType: $viewModel.selectedType)
                
                Divider()
                
                // 模型选择栏
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("当前模型")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        if let selectedModel = viewModel.selectedModel {
                            Text(selectedModel.name)
                                .font(.body)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                        } else {
                            Text("未选择模型")
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        viewModel.selectModel()
                    }) {
                        HStack(spacing: 8) {
                            Text("选择模型")
                                .font(.body)
                                .foregroundColor(.blue)
                            
                            Image(systemName: "chevron.down")
                                .font(.caption)
                                .foregroundColor(.blue)
                        }
                    }
                }
                .padding(16)
                .background(Color(.systemGroupedBackground))
                
                Divider()
                
                // 分析结果和历史记录
                ScrollView {
                    VStack(spacing: 20) {
                        // 分析结果展示
                        if let result = viewModel.currentResult {
                            AnalysisResultView(
                                result: result,
                                onExport: { isExportViewPresented = true },
                                onShare: { viewModel.shareAnalysis() },
                                onChartDetail: { isChartDetailViewPresented = true }
                            )
                        } else if viewModel.isLoading {
                            ProgressView("正在分析中...")
                                .padding(40)
                        } else {
                            VStack(spacing: 16) {
                                Text("请选择一个认知模型进行分析")
                                    .font(.body)
                                    .foregroundColor(.secondary)
                                
                                Button(action: {
                                    viewModel.selectModel()
                                }) {
                                    Text("选择认知模型")
                                        .padding(12)
                                        .background(Color.blue)
                                        .foregroundColor(.white)
                                        .cornerRadius(8)
                                }
                            }
                            .padding(40)
                            .background(Color(.systemBackground))
                            .cornerRadius(12)
                            .shadow(radius: 2)
                        }
                        
                        // 分析历史记录
                        if !viewModel.historyItems.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Text("分析历史")
                                        .font(.headline)
                                        .foregroundColor(.primary)
                                    Spacer()
                                    Button(action: {
                                        // 清除所有历史记录
                                        viewModel.clearAllAnalysisHistory()
                                    }) {
                                        Text("清除全部")
                                            .font(.caption)
                                            .foregroundColor(.red)
                                    }
                                }
                                
                                ForEach(viewModel.historyItems) { historyItem in
                                    HStack(spacing: 16) {
                                        VStack(alignment: .leading, spacing: 8) {
                                            Text(historyItem.analysisType.displayName)
                                                .font(.body)
                                                .fontWeight(.bold)
                                                .foregroundColor(.primary)
                                            
                                            Text(historyItem.formattedCreatedAt)
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                        }
                                        
                                        Spacer()
                                        
                                        HStack(spacing: 8) {
                                            HStack(spacing: 4) {
                                                Image(systemName: "star.fill")
                                                    .font(.caption2)
                                                    .foregroundColor(.yellow)
                                                Text("\(String(format: "%.1f%%", historyItem.confidenceScore * 100))")
                                                    .font(.caption)
                                                    .foregroundColor(.secondary)
                                            }
                                            
                                            Button(action: {
                                                viewModel.loadHistoryResult(analysisId: historyItem.analysisId)
                                            }) {
                                                Image(systemName: "chevron.right")
                                                    .font(.caption)
                                                    .foregroundColor(.secondary)
                                            }
                                            
                                            Button(action: {
                                                viewModel.deleteAnalysisHistory(historyItem)
                                            }) {
                                                Image(systemName: "trash.fill")
                                                    .font(.caption)
                                                    .foregroundColor(.red)
                                            }
                                        }
                                    }
                                    .padding(16)
                                    .background(Color(.systemBackground))
                                    .cornerRadius(12)
                                    .shadow(radius: 2)
                                }
                            }
                            .padding()
                            .background(Color(.systemGroupedBackground))
                            .cornerRadius(12)
                            .shadow(radius: 2)
                        }
                    }
                    .padding(16)
                }
            }
            .navigationTitle("多维度分析")
            .navigationBarItems(trailing: HStack(spacing: 16) { 
                if viewModel.currentResult != nil {
                    Button("清除") { 
                        viewModel.clearCurrentResult()
                    }
                }
                
                Button("刷新") { 
                    viewModel.refreshAnalysis()
                }
            })
            .sheet(isPresented: $isExportViewPresented) { 
                if let result = viewModel.currentResult {
                    AnalysisExportView(
                        result: result,
                        shareService: AnalysisShareService(),
                        isPresented: $isExportViewPresented
                    )
                }
            }
            .sheet(isPresented: $isChartDetailViewPresented) { 
                // 图表详情视图（简化实现）
                if let result = viewModel.currentResult {
                    VStack {
                        Text("图表详情")
                            .font(.title)
                            .fontWeight(.bold)
                        // 实际项目中应实现完整的图表详情
                        Text("\(result.analysisType.displayName) - 详细数据")
                            .font(.body)
                            .padding()
                    }
                    .padding()
                }
            }
        }
    }
}
```

## 3. 集成与测试

### 3.1 依赖注入配置

```swift
// DIContainer.swift
import Foundation

class DIContainer {
    static let shared = DIContainer()
    
    private init() {}
    
    // 获取分析分享服务
    func makeAnalysisShareService() -> AnalysisShareServiceProtocol {
        return AnalysisShareService()
    }
    
    // 获取多维度分析ViewModel
    func makeMultiDimensionalAnalysisViewModel() -> MultiDimensionalAnalysisViewModel {
        return MultiDimensionalAnalysisViewModel(
            service: makeMultiDimensionalAnalysisService(),
            cognitiveModelService: makeCognitiveModelService(),
            shareService: makeAnalysisShareService()
        )
    }
    
    // 其他服务方法...
}
```

### 3.2 路由集成

```swift
// ContentView.swift
struct ContentView: View {
    @EnvironmentObject var router: AppRouter
    
    var body: some View {
        NavigationStack {
            switch router.currentRoute {
            case .home:
                HomeView()
            case .aiConversation:
                AIConversationView(viewModel: DIContainer.shared.makeAIConversationViewModel())
            case .multiDimensionalAnalysis:
                MultiDimensionalAnalysisView(
                    multiDimensionalAnalysisService: DIContainer.shared.makeMultiDimensionalAnalysisService(),
                    cognitiveModelService: DIContainer.shared.makeCognitiveModelService()
                )
            // 其他路由处理
            }
        }
    }
}
```

### 3.3 测试策略

1. **功能测试**：
   - 测试动画图表的显示效果
   - 测试分析结果的导出功能
   - 测试分析结果的分享功能
   - 测试分析历史的管理功能

2. **性能测试**：
   - 测试动画图表的性能
   - 测试导出功能的响应速度
   - 测试分享功能的性能

3. **集成测试**：
   - 测试与分析服务的集成
   - 测试与分享服务的集成
   - 测试与Core Data的集成

## 4. 代码质量与性能优化

### 4.1 代码质量保证

1. **模块化设计**：将UI组件、业务逻辑、数据存储分离
2. **依赖注入**：使用依赖注入提高代码可测试性和可维护性
3. **协议导向编程**：通过协议抽象服务层，便于替换和扩展
4. **错误处理**：完善的错误处理机制，确保应用稳定性

### 4.2 性能优化

1. **动画优化**：
   - 优化了动画图表的性能，使用缓动函数
   - 避免了不必要的动画重绘
   - 使用了高效的动画更新机制

2. **导出功能优化**：
   - 实现了异步导出，避免阻塞主线程
   - 优化了PDF生成过程
   - 使用了临时文件管理，避免内存占用过高

3. **分享功能优化**：
   - 实现了异步分享，避免阻塞主线程
   - 优化了分享内容的生成过程

## 5. 每日进度总结

### 5.1 已完成工作

1. ✅ 实现了动画图表组件（动画雷达图、动画柱状图）
2. ✅ 增强了分析结果展示组件，添加了可展开/折叠功能
3. ✅ 实现了分析分享服务，支持多种导出格式
4. ✅ 实现了分析导出视图
5. ✅ 增强了多维度分析ViewModel，添加了分享和历史管理功能
6. ✅ 增强了多维度分析主界面，添加了导出和分享按钮
7. ✅ 实现了分析历史的管理功能
8. ✅ 优化了分析结果的可视化效果

### 5.2 遇到的问题与解决方案

1. **问题**：动画图表的性能优化
   **解决方案**：使用了缓动函数和高效的动画更新机制，避免了不必要的重绘

2. **问题**：PDF生成的复杂性
   **解决方案**：使用了UIGraphicsPDFRenderer简化PDF生成过程

3. **问题**：分享功能的平台兼容性
   **解决方案**：使用了UIActivityViewController，支持多种分享平台

### 5.3 明日计划

- 开始认知模型可视化模块开发
- 实现认知模型可视化的基础功能
- 实现认知模型的可视化算法
- 实现可视化组件的基本交互

## 6. 代码评审与安全性

### 6.1 代码评审要点

1. 检查动画图表的实现是否正确
2. 检查分析导出功能的实现是否完整
3. 检查分享功能的实现是否安全
4. 检查分析历史管理功能的实现是否正确

### 6.2 安全性考虑

1. 确保所有导出文件都存储在安全的位置
2. 确保分享内容不包含敏感信息
3. 实现合理的权限控制，保护用户的分析数据
4. 定期清理临时导出文件，防止数据泄露

## 7. 附加说明

- 本实现采用了MVVM架构，将UI与业务逻辑分离
- 使用了SwiftUI的动画系统，实现了流畅的图表动画
- 支持多种导出格式，满足不同用户需求
- 代码遵循SwiftLint代码规范

---

**文档作者**：AI认知辅助系统前端开发团队  
**文档创建时间**：2026-01-10  
**文档版本**：v1.0.0