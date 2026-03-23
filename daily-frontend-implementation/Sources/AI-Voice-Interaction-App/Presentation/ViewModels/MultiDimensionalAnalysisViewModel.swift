//
//  MultiDimensionalAnalysisViewModel.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import Foundation
import Combine

/// 多维分析服务协议
protocol MultiDimensionalAnalysisServiceProtocol {
    func getAnalysisHistory() -> AnyPublisher<[AnalysisHistoryItem], Error>
    func analyzeModel(modelId: UUID, analysisType: AnalysisType) -> AnyPublisher<AnalysisResult, Error>
    func getAnalysisResultById(_ analysisId: UUID) -> AnyPublisher<AnalysisResult, Error>
    func deleteAnalysisHistoryItem(_ analysisId: UUID) -> AnyPublisher<Bool, Error>
}

/// 分析缓存服务协议
protocol AnalysisCacheServiceProtocol {
    func getCachedAnalysisResult(for modelId: UUID, type: AnalysisType) -> AnalysisResult?
    func cacheAnalysisResult(_ result: AnalysisResult)
}

/// 多维分析服务实现
class MultiDimensionalAnalysisService: MultiDimensionalAnalysisServiceProtocol {
    func getAnalysisHistory() -> AnyPublisher<[AnalysisHistoryItem], Error> {
        // 实现分析历史获取逻辑
        return Empty().eraseToAnyPublisher()
    }
    
    func analyzeModel(modelId: UUID, analysisType: AnalysisType) -> AnyPublisher<AnalysisResult, Error> {
        // 实现模型分析逻辑
        return Empty().eraseToAnyPublisher()
    }
    
    func getAnalysisResultById(_ analysisId: UUID) -> AnyPublisher<AnalysisResult, Error> {
        // 实现分析结果获取逻辑
        return Empty().eraseToAnyPublisher()
    }
    
    func deleteAnalysisHistoryItem(_ analysisId: UUID) -> AnyPublisher<Bool, Error> {
        // 实现分析历史删除逻辑
        return Empty().eraseToAnyPublisher()
    }
}

/// 分析缓存服务实现
class AnalysisCacheService: AnalysisCacheServiceProtocol {
    private var cache: [String: AnalysisResult] = [:]
    
    func getCachedAnalysisResult(for modelId: UUID, type: AnalysisType) -> AnalysisResult? {
        let key = "\(modelId)-\(type.rawValue)"
        return cache[key]
    }
    
    func cacheAnalysisResult(_ result: AnalysisResult) {
        let key = "\(result.modelId)-\(result.analysisType.rawValue)"
        cache[key] = result
    }
}

/// 关键指标结构体
struct KeyMetric {
    let name: String
    let value: String
}

/// 多维分析视图模型
class MultiDimensionalAnalysisViewModel: ObservableObject {
    /// 当前分析结果
    @Published var currentResult: AnalysisResult?
    /// 雷达图数据
    @Published var radarChartData: RadarChartData?
    /// 柱状图数据
    @Published var barChartData: BarChartData?
    /// 饼图数据
    @Published var pieChartData: PieChartData?
    /// 分析结果摘要
    @Published var analysisSummary: String = ""
    /// 关键指标
    @Published var keyMetrics: [KeyMetric] = []
    /// 当前选择的模型
    @Published var selectedModel: CognitiveModelSummary?
    /// 分析历史记录
    @Published var historyItems: [AnalysisHistoryItem] = []
    /// 是否正在加载
    @Published var isLoading: Bool = false
    /// 错误信息
    @Published var errorMessage: String?
    
    /// 服务依赖
    private let multiDimensionalAnalysisService: MultiDimensionalAnalysisServiceProtocol
    private let cognitiveModelService: CognitiveModelServiceProtocol
    private let cacheService: AnalysisCacheServiceProtocol
    private let shareService: AnalysisShareServiceProtocol
    
    /// 取消订阅集合
    private var cancellables = Set<AnyCancellable>()
    
    /// 初始化
    init(
        multiDimensionalAnalysisService: MultiDimensionalAnalysisServiceProtocol = MultiDimensionalAnalysisService(),
        cognitiveModelService: CognitiveModelServiceProtocol = CognitiveModelService(),
        cacheService: AnalysisCacheServiceProtocol = AnalysisCacheService(),
        shareService: AnalysisShareServiceProtocol = AnalysisShareService()
    ) {
        self.multiDimensionalAnalysisService = multiDimensionalAnalysisService
        self.cognitiveModelService = cognitiveModelService
        self.cacheService = cacheService
        self.shareService = shareService
        
        loadAnalysisHistory()
    }
    
    /// 加载分析历史
    func loadAnalysisHistory() {
        multiDimensionalAnalysisService.getAnalysisHistory()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        self.errorMessage = "加载分析历史失败: \(error.localizedDescription)"
                    }
                },
                receiveValue: { historyItems in
                    self.historyItems = historyItems
                }
            )
            .store(in: &cancellables)
    }
    
    /// 加载认知模型列表
    func loadCognitiveModels() -> AnyPublisher<[CognitiveModelSummary], Error> {
        return Future { promise in
            Task {
                do {
                    let response = try await self.cognitiveModelService.getModels(page: 1, limit: 100, search: nil)
                    // 将CognitiveModel转换为CognitiveModelSummary
                    let summaries = response.models.map { model in
                        CognitiveModelSummary(
                            id: model.id,
                            name: model.name,
                            description: model.description ?? "",
                            createdAt: model.createdAt,
                            updatedAt: model.updatedAt,
                            conceptCount: model.concepts?.count ?? 0,
                            relationCount: model.relations?.count ?? 0,
                            isActive: model.status == .active
                        )
                    }
                    promise(.success(summaries))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    /// 选择模型
    func selectModel(_ model: CognitiveModelSummary) {
        selectedModel = model
    }
    
    /// 加载分析数据
    func loadAnalysisData(for analysisType: AnalysisType) {
        guard let modelId = selectedModel?.id else {
            errorMessage = "请先选择一个认知模型"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // 先尝试从缓存获取
        if let cachedResult = cacheService.getCachedAnalysisResult(for: modelId, type: analysisType) {
            updateUI(with: cachedResult)
            isLoading = false
        }
        
        // 从API获取最新数据
        multiDimensionalAnalysisService.analyzeModel(modelId: modelId, analysisType: analysisType)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    self.isLoading = false
                    if case .failure(let error) = completion {
                        self.errorMessage = "加载分析数据失败: \(error.localizedDescription)"
                    }
                },
                receiveValue: { result in
                    self.cacheService.cacheAnalysisResult(result)
                    self.updateUI(with: result)
                }
            )
            .store(in: &cancellables)
    }
    
    /// 更新UI
    private func updateUI(with result: AnalysisResult) {
        currentResult = result
        
        // 更新图表数据
        switch result.analysisType.chartType {
        case .radar:
            radarChartData = result.radarChartData
            barChartData = nil
            pieChartData = nil
            
        case .bar:
            barChartData = result.barChartData
            radarChartData = nil
            pieChartData = nil
            
        case .pie:
            pieChartData = result.pieChartData
            radarChartData = nil
            barChartData = nil
            
        default:
            radarChartData = nil
            barChartData = nil
            pieChartData = nil
        }
        
        // 更新摘要和关键指标
        analysisSummary = result.insights.joined(separator: "\n")
        generateKeyMetrics(from: result)
    }
    
    /// 生成关键指标
    private func generateKeyMetrics(from result: AnalysisResult) {
        var metrics: [KeyMetric] = []
        
        // 添加置信度指标
        metrics.append(
            KeyMetric(
                name: "置信度", 
                value: "\(String(format: "%.1f%%", result.confidenceScore * 100))"
            )
        )
        
        // 根据分析类型添加特定指标
        switch result.analysisType {
        case .thinkingType:
            if let radarData = result.radarChartData, let firstDataset = radarData.datasets.first {
                let values = firstDataset.values
                if !values.isEmpty {
                    let avgValue = values.reduce(0.0, +) / Double(values.count)
                    metrics.append(KeyMetric(name: "平均得分", value: "\(String(format: "%.1f", avgValue))"))
                    
                    // 获取最大值和最小值的索引，然后根据索引获取对应的类别
                    if let maxIndex = values.indices.max(by: { values[$0] < values[$1] }), 
                       let minIndex = values.indices.min(by: { values[$0] < values[$1] }) {
                        if !radarData.categories.isEmpty && maxIndex < radarData.categories.count {
                            metrics.append(KeyMetric(name: "最强项", value: radarData.categories[maxIndex]))
                        }
                        if !radarData.categories.isEmpty && minIndex < radarData.categories.count {
                            metrics.append(KeyMetric(name: "提升空间", value: radarData.categories[minIndex]))
                        }
                    }
                }
            }
            
        case .cognitiveStructure:
            if let barData = result.barChartData, let firstDataset = barData.datasets.first {
                let values = firstDataset.values
                if !values.isEmpty {
                    let avgValue = values.reduce(0.0, +) / Double(values.count)
                    metrics.append(KeyMetric(name: "平均掌握度", value: "\(String(format: "%.1f", avgValue))"))
                }
            }
            
        case .knowledgeDomain:
            if let pieData = result.pieChartData {
                let datasetCount = pieData.datasets.count
                metrics.append(KeyMetric(name: "领域数量", value: "\(datasetCount)"))
                
                if let strongest = pieData.datasets.max(by: { $0.value < $1.value }) {
                    metrics.append(KeyMetric(name: "最强领域", value: strongest.label))
                }
                
                if let weakest = pieData.datasets.min(by: { $0.value < $1.value }) {
                    metrics.append(KeyMetric(name: "最弱领域", value: weakest.label))
                }
            }
            
        case .conceptConnection:
            metrics.append(KeyMetric(name: "概念数量", value: "\(result.networkNodes?.count ?? 0)"))
            metrics.append(KeyMetric(name: "连接数量", value: "\(result.networkEdges?.count ?? 0)"))
            
        case .learningProgress:
            if let lineData = result.lineChartData, let firstDataset = lineData.datasets.first {
                let totalPoints = firstDataset.values.count
                metrics.append(KeyMetric(name: "数据点数量", value: "\(totalPoints)"))
            }
        }
        
        keyMetrics = metrics
    }
    
    /// 导出分析结果为PDF
    func exportAnalysisAsPDF() {
        guard let result = currentResult else {
            errorMessage = "没有可导出的分析结果"
            return
        }
        
        isLoading = true
        shareService.exportToPDF(result) { [weak self] data, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let data = data {
                    // 保存文件到本地
                    self?.saveExportedFile(data: data, filename: "分析结果.pdf")
                } else {
                    self?.errorMessage = "导出PDF失败: \(error?.localizedDescription ?? "未知错误")"
                }
            }
        }
    }
    
    /// 导出分析结果为图片
    func exportAnalysisAsImage() {
        guard let result = currentResult else {
            errorMessage = "没有可导出的分析结果"
            return
        }
        
        isLoading = true
        shareService.exportToImage(result) { [weak self] data, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let data = data {
                    // 保存文件到本地
                    self?.saveExportedFile(data: data, filename: "分析结果.png")
                } else {
                    self?.errorMessage = "导出图片失败: \(error?.localizedDescription ?? "未知错误")"
                }
            }
        }
    }
    
    /// 导出分析结果为文本
    func exportAnalysisAsText() {
        guard let result = currentResult else {
            errorMessage = "没有可导出的分析结果"
            return
        }
        
        isLoading = true
        shareService.exportToText(result) { [weak self] data, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let data = data {
                    // 保存文件到本地
                    self?.saveExportedFile(data: data, filename: "分析结果.txt")
                } else {
                    self?.errorMessage = "导出文本失败: \(error?.localizedDescription ?? "未知错误")"
                }
            }
        }
    }
    
    /// 保存导出的文件
    private func saveExportedFile(data: Data, filename: String) {
        do {
            // 获取文档目录
            let documentsDirectory = try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
            let fileURL = documentsDirectory.appendingPathComponent(filename)
            
            // 写入文件
            try data.write(to: fileURL)
            
            // 显示成功信息
            print("文件已保存到: \(fileURL)")
        } catch {
            errorMessage = "保存文件失败: \(error.localizedDescription)"
        }
    }
    
    /// 分享分析结果
    func shareAnalysis() {
        guard let result = currentResult else {
            errorMessage = "没有可分享的分析结果"
            return
        }
        
        shareService.shareAnalysisResult(result) { [weak self] success, error in
            DispatchQueue.main.async {
                if !success {
                    self?.errorMessage = "分享分析结果失败: \(error?.localizedDescription ?? "未知错误")"
                }
            }
        }
    }
    
    /// 从历史记录中加载分析结果
    func loadFromHistory(_ historyItem: AnalysisHistoryItem) {
        isLoading = true
        errorMessage = nil
        
        multiDimensionalAnalysisService.getAnalysisResultById(historyItem.analysisId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    self.isLoading = false
                    if case .failure(let error) = completion {
                        self.errorMessage = "加载历史分析结果失败: \(error.localizedDescription)"
                    }
                },
                receiveValue: { result in
                    self.updateUI(with: result)
                    self.isLoading = false
                }
            )
            .store(in: &cancellables)
    }
    
    /// 删除历史记录
    func deleteHistoryItem(_ historyItem: AnalysisHistoryItem) {
        multiDimensionalAnalysisService.deleteAnalysisHistoryItem(historyItem.analysisId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        self.errorMessage = "删除历史记录失败: \(error.localizedDescription)"
                    }
                },
                receiveValue: { success in
                    if success {
                        // 从本地列表中删除
                        self.historyItems.removeAll { $0.analysisId == historyItem.analysisId }
                    }
                }
            )
            .store(in: &cancellables)
    }
}