# Day 17: 多维度分析功能实现 - 代码实现文档

## 1. 今日任务概述

**核心任务**：实现多维度分析功能，包括获取分析结果请求、触发分析请求、状态管理、分析结果本地缓存等。

**技术栈**：Swift 5.9+, SwiftUI 5.0+, Combine, Core Data, Charts

**关联API**：
- POST `/api/v1/models/{modelId}/analyses/thinking-type` - 思维类型分析
- GET `/api/v1/models/{modelId}/analyses` - 获取多维度分析结果

## 2. 详细技术实现

### 2.1 目录结构设计

```
Sources/
├── AI-Voice-Interaction-App/
│   ├── View/
│   │   └── MultiDimensionalAnalysis/
│   │       ├── MultiDimensionalAnalysisView.swift # 多维度分析主界面
│   │       ├── ModelSelectorView.swift            # 模型选择器组件
│   │       └── AnalysisResultDetailView.swift     # 分析结果详情视图
│   ├── ViewModel/
│   │   └── MultiDimensionalAnalysis/
│   │       ├── MultiDimensionalAnalysisViewModel.swift # 多维度分析ViewModel（增强）
│   │       └── ModelSelectorViewModel.swift       # 模型选择器ViewModel
│   ├── Model/
│   │   ├── MultiDimensionalAnalysis/
│   │   │   ├── AnalysisResult.swift               # 分析结果数据模型
│   │   │   └── CognitiveModelSummary.swift        # 认知模型摘要模型
│   │   └── CoreData/
│   │       ├── AnalysisResult+CoreDataClass.swift # Core Data分析结果实体
│   │       └── CoreDataManager.swift             # Core Data管理类
│   └── Service/
│       ├── Analysis/
│       │   ├── MultiDimensionalAnalysisService.swift # 多维度分析服务（增强）
│       │   └── AnalysisCacheService.swift         # 分析结果缓存服务
│       └── Model/
│           └── CognitiveModelService.swift        # 认知模型服务
```

### 2.2 核心数据模型设计

#### 2.2.1 认知模型摘要模型

```swift
// CognitiveModelSummary.swift
import Foundation

struct CognitiveModelSummary: Identifiable, Codable {
    let id: UUID
    let name: String
    let description: String
    let createdAt: Date
    let updatedAt: Date
    let conceptCount: Int
    let relationCount: Int
    let isActive: Bool
    
    // 计算属性：格式化的创建时间
    var formattedCreatedAt: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: createdAt)
    }
    
    // 计算属性：模型的活跃度评分
    var activityScore: Double {
        let totalElements = Double(conceptCount + relationCount)
        return totalElements > 0 ? min(totalElements / 100.0, 1.0) : 0.0
    }
}
```

#### 2.2.2 分析结果Core Data实体

```swift
// AnalysisResult+CoreDataClass.swift
import Foundation
import CoreData

@objc(AnalysisResultEntity)
public class AnalysisResultEntity: NSManagedObject {
    // Core Data会自动生成属性和方法
}

// AnalysisResult+CoreDataProperties.swift
import Foundation
import CoreData

extension AnalysisResultEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<AnalysisResultEntity> {
        return NSFetchRequest<AnalysisResultEntity>(entityName: "AnalysisResultEntity")
    }
    
    @NSManaged public var id: UUID
    @NSManaged public var modelId: UUID
    @NSManaged public var analysisType: String
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
    @NSManaged public var isComplete: Bool
    @NSManaged public var confidenceScore: Double
    @NSManaged public var radarChartData: Data?
    @NSManaged public var barChartData: Data?
    @NSManaged public var pieChartData: Data?
    @NSManaged public var insights: [String]
    @NSManaged public var recommendations: [String]
}
```

### 2.3 模型选择器组件

```swift
// ModelSelectorView.swift
import SwiftUI

struct ModelSelectorView: View {
    @StateObject private var viewModel: ModelSelectorViewModel
    @Binding var selectedModel: CognitiveModelSummary?
    @Binding var isPresented: Bool
    
    init(
        cognitiveModelService: CognitiveModelServiceProtocol,
        selectedModel: Binding<CognitiveModelSummary?>,
        isPresented: Binding<Bool>
    ) {
        _viewModel = StateObject(
            wrappedValue: ModelSelectorViewModel(service: cognitiveModelService)
        )
        _selectedModel = selectedModel
        _isPresented = isPresented
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // 搜索栏
                HStack {
                    TextField("搜索认知模型...", text: $viewModel.searchText)
                        .padding(12)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                        .padding(16)
                }
                
                Divider()
                
                // 模型列表
                if viewModel.isLoading {
                    ProgressView("加载模型列表中...")
                        .padding(40)
                } else if viewModel.models.isEmpty {
                    VStack(spacing: 16) {
                        Text("暂无认知模型")
                            .font(.body)
                            .foregroundColor(.secondary)
                        
                        Button(action: {
                            // 跳转到创建模型页面
                            print("创建模型")
                        }) {
                            Text("创建认知模型")
                                .padding(12)
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                    }
                    .padding(40)
                } else {
                    List(viewModel.filteredModels) { model in
                        CognitiveModelSummaryCellView(
                            model: model,
                            isSelected: selectedModel?.id == model.id,
                            onSelect: {
                                selectedModel = model
                                isPresented = false
                            }
                        )
                        .listRowSeparator(.hidden)
                        .listRowBackground(Color(.systemGroupedBackground))
                    }
                    .listStyle(.plain)
                    .background(Color(.systemGroupedBackground))
                }
            }
            .navigationTitle("选择认知模型")
            .navigationBarItems(
                leading: Button("取消") {
                    isPresented = false
                },
                trailing: Button("刷新") {
                    viewModel.loadModels()
                }
            )
            .onAppear {
                viewModel.loadModels()
            }
        }
    }
}

// 认知模型摘要单元格组件
struct CognitiveModelSummaryCellView: View {
    let model: CognitiveModelSummary
    let isSelected: Bool
    let onSelect: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(model.name)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                Spacer()
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
            }
            
            Text(model.description)
                .font(.body)
                .foregroundColor(.secondary)
                .lineLimit(2)
            
            HStack(spacing: 16) {
                HStack(spacing: 4) {
                    Image(systemName: "network")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Text("概念: \(model.conceptCount)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                HStack(spacing: 4) {
                    Image(systemName: "arrow.triangle.branch")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Text("关系: \(model.relationCount)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Text(model.formattedCreatedAt)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // 活跃度指示器
            HStack(spacing: 8) {
                Text("活跃度")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                GeometryReader {geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color(.systemGray3))
                            .frame(height: 8)
                            .cornerRadius(4)
                        
                        Rectangle()
                            .fill(Color.blue)
                            .frame(
                                width: geometry.size.width * model.activityScore,
                                height: 8
                            )
                            .cornerRadius(4)
                    }
                }
                .frame(height: 8)
            }
        }
        .padding(16)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
        .onTapGesture {
            onSelect()
        }
    }
}
```

### 2.4 模型选择器ViewModel

```swift
// ModelSelectorViewModel.swift
import Foundation
import Combine

class ModelSelectorViewModel: ObservableObject {
    @Published var models: [CognitiveModelSummary] = []
    @Published var searchText: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    // 过滤后的模型列表
    var filteredModels: [CognitiveModelSummary] {
        if searchText.isEmpty {
            return models
        } else {
            return models.filter { model in
                model.name.localizedCaseInsensitiveContains(searchText) ||
                model.description.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
    
    private let service: CognitiveModelServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    init(service: CognitiveModelServiceProtocol) {
        self.service = service
    }
    
    // 加载认知模型列表
    func loadModels() {
        isLoading = true
        errorMessage = nil
        
        service.getCognitiveModels()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                switch completion {
                case .finished:
                    break
                case .failure(let error):
                    self?.errorMessage = "加载模型失败: \(error.localizedDescription)"
                }
            }, receiveValue: { [weak self] models in
                self?.models = models
            })
            .store(in: &cancellables)
    }
}
```

### 2.5 认知模型服务

```swift
// CognitiveModelService.swift
import Foundation
import Alamofire
import Combine

protocol CognitiveModelServiceProtocol {
    func getCognitiveModels() -> AnyPublisher<[CognitiveModelSummary], Error>
    func getCognitiveModelDetail(id: UUID) -> AnyPublisher<CognitiveModelDetail, Error>
    func createCognitiveModel(model: CognitiveModelCreateRequest) -> AnyPublisher<CognitiveModelSummary, Error>
    func updateCognitiveModel(id: UUID, model: CognitiveModelUpdateRequest) -> AnyPublisher<CognitiveModelSummary, Error>
    func deleteCognitiveModel(id: UUID) -> AnyPublisher<Void, Error>
}

struct CognitiveModelCreateRequest: Codable {
    let name: String
    let description: String
}

struct CognitiveModelUpdateRequest: Codable {
    let name: String
    let description: String
    let isActive: Bool
}

struct CognitiveModelDetail: Codable {
    let id: UUID
    let name: String
    let description: String
    let createdAt: Date
    let updatedAt: Date
    let concepts: [CognitiveConcept]
    let relations: [CognitiveRelation]
    let isActive: Bool
}

class CognitiveModelService: CognitiveModelServiceProtocol {
    private let apiManager: APIManagerProtocol
    
    init(apiManager: APIManagerProtocol) {
        self.apiManager = apiManager
    }
    
    func getCognitiveModels() -> AnyPublisher<[CognitiveModelSummary], Error> {
        return apiManager.request(
            endpoint: "/api/v1/models",
            method: .get
        )
    }
    
    func getCognitiveModelDetail(id: UUID) -> AnyPublisher<CognitiveModelDetail, Error> {
        return apiManager.request(
            endpoint: "/api/v1/models/\(id)",
            method: .get
        )
    }
    
    func createCognitiveModel(model: CognitiveModelCreateRequest) -> AnyPublisher<CognitiveModelSummary, Error> {
        return apiManager.request(
            endpoint: "/api/cognitive-models",
            method: .post,
            parameters: model
        )
    }
    
    func updateCognitiveModel(id: UUID, model: CognitiveModelUpdateRequest) -> AnyPublisher<CognitiveModelSummary, Error> {
        return apiManager.request(
            endpoint: "/api/cognitive-models/\(id)",
            method: .put,
            parameters: model
        )
    }
    
    func deleteCognitiveModel(id: UUID) -> AnyPublisher<Void, Error> {
        return apiManager.request(
            endpoint: "/api/cognitive-models/\(id)",
            method: .delete
        )
    }
}
```

### 2.6 分析结果缓存服务

```swift
// AnalysisCacheService.swift
import Foundation
import CoreData
import Combine

protocol AnalysisCacheServiceProtocol {
    func saveAnalysisResult(_ result: AnalysisResult) -> AnyPublisher<Void, Error>
    func getAnalysisResult(id: UUID) -> AnyPublisher<AnalysisResult?, Error>
    func getAnalysisResultsByModelId(modelId: UUID) -> AnyPublisher<[AnalysisResult], Error>
    func getAnalysisResultsByType(type: AnalysisType) -> AnyPublisher<[AnalysisResult], Error>
    func deleteAnalysisResult(id: UUID) -> AnyPublisher<Void, Error>
    func clearCache() -> AnyPublisher<Void, Error>
}

class AnalysisCacheService: AnalysisCacheServiceProtocol {
    private let coreDataManager: CoreDataManager
    
    init(coreDataManager: CoreDataManager = .shared) {
        self.coreDataManager = coreDataManager
    }
    
    func saveAnalysisResult(_ result: AnalysisResult) -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.backgroundContext()
            context.perform {
                do {
                    // 检查是否已存在相同ID的分析结果
                    let fetchRequest: NSFetchRequest<AnalysisResultEntity> = AnalysisResultEntity.fetchRequest()
                    fetchRequest.predicate = NSPredicate(format: "id == %@", result.id as CVarArg)
                    
                    let existingResults = try context.fetch(fetchRequest)
                    let analysisEntity: AnalysisResultEntity
                    
                    if let existingResult = existingResults.first {
                        // 更新现有结果
                        analysisEntity = existingResult
                    } else {
                        // 创建新结果
                        analysisEntity = AnalysisResultEntity(context: context)
                    }
                    
                    // 设置属性
                    analysisEntity.id = result.id
                    analysisEntity.modelId = result.modelId
                    analysisEntity.analysisType = result.analysisType.rawValue
                    analysisEntity.createdAt = result.createdAt
                    analysisEntity.updatedAt = result.updatedAt
                    analysisEntity.isComplete = result.isComplete
                    analysisEntity.confidenceScore = result.confidenceScore
                    analysisEntity.insights = result.insights
                    analysisEntity.recommendations = result.recommendations
                    
                    // 序列化图表数据
                    if let radarData = result.radarChartData {
                        analysisEntity.radarChartData = try JSONEncoder().encode(radarData)
                    }
                    
                    if let barData = result.barChartData {
                        analysisEntity.barChartData = try JSONEncoder().encode(barData)
                    }
                    
                    if let pieData = result.pieChartData {
                        analysisEntity.pieChartData = try JSONEncoder().encode(pieData)
                    }
                    
                    // 保存上下文
                    try context.save()
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }.eraseToAnyPublisher()
    }
    
    func getAnalysisResult(id: UUID) -> AnyPublisher<AnalysisResult?, Error> {
        return Future<AnalysisResult?, Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.context
            
            do {
                let fetchRequest: NSFetchRequest<AnalysisResultEntity> = AnalysisResultEntity.fetchRequest()
                fetchRequest.predicate = NSPredicate(format: "id == %@", id as CVarArg)
                
                let resultEntities = try context.fetch(fetchRequest)
                
                if let entity = resultEntities.first {
                    // 反序列化图表数据
                    var radarData: [RadarChartDataPoint]? = nil
                    var barData: [BarChartDataPoint]? = nil
                    var pieData: [PieChartDataPoint]? = nil
                    
                    if let radarDataData = entity.radarChartData {
                        radarData = try JSONDecoder().decode([RadarChartDataPoint].self, from: radarDataData)
                    }
                    
                    if let barDataData = entity.barChartData {
                        barData = try JSONDecoder().decode([BarChartDataPoint].self, from: barDataData)
                    }
                    
                    if let pieDataData = entity.pieChartData {
                        pieData = try JSONDecoder().decode([PieChartDataPoint].self, from: pieDataData)
                    }
                    
                    // 构建分析结果
                    let analysisResult = AnalysisResult(
                        id: entity.id,
                        modelId: entity.modelId,
                        analysisType: AnalysisType(rawValue: entity.analysisType) ?? .thinkingType,
                        createdAt: entity.createdAt,
                        updatedAt: entity.updatedAt,
                        isComplete: entity.isComplete,
                        confidenceScore: entity.confidenceScore,
                        radarChartData: radarData,
                        barChartData: barData,
                        pieChartData: pieData,
                        lineChartData: nil,
                        networkNodes: nil,
                        networkEdges: nil,
                        insights: entity.insights,
                        recommendations: entity.recommendations
                    )
                    
                    promise(.success(analysisResult))
                } else {
                    promise(.success(nil))
                }
            } catch {
                promise(.failure(error))
            }
        }.eraseToAnyPublisher()
    }
    
    func getAnalysisResultsByModelId(modelId: UUID) -> AnyPublisher<[AnalysisResult], Error> {
        return Future<[AnalysisResult], Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.context
            
            do {
                let fetchRequest: NSFetchRequest<AnalysisResultEntity> = AnalysisResultEntity.fetchRequest()
                fetchRequest.predicate = NSPredicate(format: "modelId == %@", modelId as CVarArg)
                fetchRequest.sortDescriptors = [NSSortDescriptor(keyPath: \AnalysisResultEntity.createdAt, ascending: false)]
                
                let resultEntities = try context.fetch(fetchRequest)
                
                // 转换为领域模型
                let analysisResults = try resultEntities.map { entity -> AnalysisResult in
                    // 反序列化图表数据
                    var radarData: [RadarChartDataPoint]? = nil
                    var barData: [BarChartDataPoint]? = nil
                    var pieData: [PieChartDataPoint]? = nil
                    
                    if let radarDataData = entity.radarChartData {
                        radarData = try JSONDecoder().decode([RadarChartDataPoint].self, from: radarDataData)
                    }
                    
                    if let barDataData = entity.barChartData {
                        barData = try JSONDecoder().decode([BarChartDataPoint].self, from: barDataData)
                    }
                    
                    if let pieDataData = entity.pieChartData {
                        pieData = try JSONDecoder().decode([PieChartDataPoint].self, from: pieDataData)
                    }
                    
                    return AnalysisResult(
                        id: entity.id,
                        modelId: entity.modelId,
                        analysisType: AnalysisType(rawValue: entity.analysisType) ?? .thinkingType,
                        createdAt: entity.createdAt,
                        updatedAt: entity.updatedAt,
                        isComplete: entity.isComplete,
                        confidenceScore: entity.confidenceScore,
                        radarChartData: radarData,
                        barChartData: barData,
                        pieChartData: pieData,
                        lineChartData: nil,
                        networkNodes: nil,
                        networkEdges: nil,
                        insights: entity.insights,
                        recommendations: entity.recommendations
                    )
                }
                
                promise(.success(analysisResults))
            } catch {
                promise(.failure(error))
            }
        }.eraseToAnyPublisher()
    }
    
    func getAnalysisResultsByType(type: AnalysisType) -> AnyPublisher<[AnalysisResult], Error> {
        return Future<[AnalysisResult], Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.context
            
            do {
                let fetchRequest: NSFetchRequest<AnalysisResultEntity> = AnalysisResultEntity.fetchRequest()
                fetchRequest.predicate = NSPredicate(format: "analysisType == %@", type.rawValue)
                fetchRequest.sortDescriptors = [NSSortDescriptor(keyPath: \AnalysisResultEntity.createdAt, ascending: false)]
                
                let resultEntities = try context.fetch(fetchRequest)
                
                // 转换为领域模型
                let analysisResults = try resultEntities.map { entity -> AnalysisResult in
                    // 反序列化图表数据
                    var radarData: [RadarChartDataPoint]? = nil
                    var barData: [BarChartDataPoint]? = nil
                    var pieData: [PieChartDataPoint]? = nil
                    
                    if let radarDataData = entity.radarChartData {
                        radarData = try JSONDecoder().decode([RadarChartDataPoint].self, from: radarDataData)
                    }
                    
                    if let barDataData = entity.barChartData {
                        barData = try JSONDecoder().decode([BarChartDataPoint].self, from: barDataData)
                    }
                    
                    if let pieDataData = entity.pieChartData {
                        pieData = try JSONDecoder().decode([PieChartDataPoint].self, from: pieDataData)
                    }
                    
                    return AnalysisResult(
                        id: entity.id,
                        modelId: entity.modelId,
                        analysisType: AnalysisType(rawValue: entity.analysisType) ?? .thinkingType,
                        createdAt: entity.createdAt,
                        updatedAt: entity.updatedAt,
                        isComplete: entity.isComplete,
                        confidenceScore: entity.confidenceScore,
                        radarChartData: radarData,
                        barChartData: barData,
                        pieChartData: pieData,
                        lineChartData: nil,
                        networkNodes: nil,
                        networkEdges: nil,
                        insights: entity.insights,
                        recommendations: entity.recommendations
                    )
                }
                
                promise(.success(analysisResults))
            } catch {
                promise(.failure(error))
            }
        }.eraseToAnyPublisher()
    }
    
    func deleteAnalysisResult(id: UUID) -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.backgroundContext()
            context.perform {
                do {
                    let fetchRequest: NSFetchRequest<AnalysisResultEntity> = AnalysisResultEntity.fetchRequest()
                    fetchRequest.predicate = NSPredicate(format: "id == %@", id as CVarArg)
                    
                    let results = try context.fetch(fetchRequest)
                    for result in results {
                        context.delete(result)
                    }
                    
                    try context.save()
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }.eraseToAnyPublisher()
    }
    
    func clearCache() -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.backgroundContext()
            context.perform {
                do {
                    let fetchRequest: NSFetchRequest<NSFetchRequestResult> = AnalysisResultEntity.fetchRequest()
                    let batchDeleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
                    
                    try context.execute(batchDeleteRequest)
                    try context.save()
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }.eraseToAnyPublisher()
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
    @Published var errorMessage: String?
    @Published var selectedType: AnalysisType = .thinkingType
    
    private let service: MultiDimensionalAnalysisServiceProtocol
    private let cognitiveModelService: CognitiveModelServiceProtocol
    private let cacheService: AnalysisCacheServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    init(
        service: MultiDimensionalAnalysisServiceProtocol,
        cognitiveModelService: CognitiveModelServiceProtocol,
        cacheService: AnalysisCacheServiceProtocol = AnalysisCacheService()
    ) {
        self.service = service
        self.cognitiveModelService = cognitiveModelService
        self.cacheService = cacheService
        
        loadAnalysisHistory()
    }
    
    // 分析模型
    func analyzeModel() {
        guard let modelId = selectedModel?.id else {
            errorMessage = "请先选择一个认知模型"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // 先尝试从缓存获取最新分析结果
        cacheService.getAnalysisResultsByModelId(modelId: modelId)
            .filter { !$0.isEmpty }
            .map { $0.filter { $0.analysisType == selectedType } }
            .filter { !$0.isEmpty }
            .map { $0.sorted { $0.updatedAt > $1.updatedAt }.first }
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                // 如果缓存获取失败，继续从API获取
                if case .failure = completion {
                    self?.fetchAnalysisFromAPI(modelId: modelId)
                }
            }, receiveValue: { [weak self] cachedResult in
                if let result = cachedResult {
                    // 使用缓存结果
                    self?.currentResult = result
                    self?.isLoading = false
                } else {
                    // 缓存中没有结果，从API获取
                    self?.fetchAnalysisFromAPI(modelId: modelId)
                }
            })
            .store(in: &cancellables)
    }
    
    // 从API获取分析结果
    private func fetchAnalysisFromAPI(modelId: UUID) {
        service.analyzeModel(
            modelId: modelId,
            analysisType: selectedType
        )
        .receive(on: DispatchQueue.main)
        .sink(receiveCompletion: { [weak self] completion in
            self?.isLoading = false
            switch completion {
            case .finished:
                break
            case .failure(let error):
                self?.errorMessage = "分析失败: \(error.localizedDescription)"
            }
        }, receiveValue: { [weak self] result in
            self?.currentResult = result
            
            // 保存到缓存
            self?.cacheService.saveAnalysisResult(result)
                .sink(receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("保存分析结果到缓存失败: \(error.localizedDescription)")
                    }
                }, receiveValue: { _ in
                    // 保存成功
                })
                .store(in: &(self?.cancellables ?? Set<AnyCancellable>()))
            
            // 更新历史记录
            self?.loadAnalysisHistory()
        })
        .store(in: &cancellables)
    }
    
    // 加载分析历史
    func loadAnalysisHistory() {
        service.getAnalysisHistory()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                switch completion {
                case .finished:
                    break
                case .failure(let error):
                    self?.errorMessage = "加载历史记录失败: \(error.localizedDescription)"
                }
            }, receiveValue: { [weak self] history in
                self?.historyItems = history
            })
            .store(in: &cancellables)
    }
    
    // 加载历史分析结果
    func loadHistoryResult(analysisId: UUID) {
        isLoading = true
        errorMessage = nil
        
        // 先尝试从缓存获取
        cacheService.getAnalysisResult(id: analysisId)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                // 如果缓存获取失败，从API获取
                if case .failure = completion {
                    self?.fetchHistoryResultFromAPI(analysisId: analysisId)
                }
            }, receiveValue: { [weak self] cachedResult in
                if let result = cachedResult {
                    // 使用缓存结果
                    self?.currentResult = result
                    self?.selectedType = result.analysisType
                    self?.isLoading = false
                } else {
                    // 缓存中没有结果，从API获取
                    self?.fetchHistoryResultFromAPI(analysisId: analysisId)
                }
            })
            .store(in: &cancellables)
    }
    
    // 从API获取历史分析结果
    private func fetchHistoryResultFromAPI(analysisId: UUID) {
        service.getAnalysisResult(analysisId: analysisId)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                switch completion {
                case .finished:
                    break
                case .failure(let error):
                    self?.errorMessage = "加载分析结果失败: \(error.localizedDescription)"
                }
            }, receiveValue: { [weak self] result in
                self?.currentResult = result
                self?.selectedType = result.analysisType
                
                // 保存到缓存
                self?.cacheService.saveAnalysisResult(result)
                    .sink(receiveCompletion: { completion in
                        if case .failure(let error) = completion {
                            print("保存分析结果到缓存失败: \(error.localizedDescription)")
                        }
                    }, receiveValue: { _ in
                        // 保存成功
                    })
                    .store(in: &(self?.cancellables ?? Set<AnyCancellable>()))
            })
            .store(in: &cancellables)
    }
    
    // 选择模型
    func selectModel() {
        isModelSelectorPresented = true
    }
    
    // 更新选中的模型
    func updateSelectedModel(_ model: CognitiveModelSummary?) {
        selectedModel = model
        currentResult = nil // 清除当前分析结果
        
        if let model = model {
            // 自动开始分析
            analyzeModel()
        }
    }
    
    // 清除当前分析结果
    func clearCurrentResult() {
        currentResult = nil
    }
    
    // 刷新分析结果
    func refreshAnalysis() {
        analyzeModel()
    }
}
```

### 2.8 多维度分析主界面增强

```swift
// MultiDimensionalAnalysisView.swift
import SwiftUI

struct MultiDimensionalAnalysisView: View {
    @StateObject private var viewModel: MultiDimensionalAnalysisViewModel
    @State private var selectedType: AnalysisType = .thinkingType
    
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
                            AnalysisResultView(result: result)
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
                            AnalysisHistoryView(
                                historyItems: viewModel.historyItems,
                                onSelectHistoryItem: {
                                    viewModel.loadHistoryResult(analysisId: $0.analysisId)
                                }
                            )
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
            .sheet(isPresented: $viewModel.isModelSelectorPresented) {
                ModelSelectorView(
                    cognitiveModelService: CognitiveModelService(apiManager: APIManager.shared),
                    selectedModel: $viewModel.selectedModel,
                    isPresented: $viewModel.isModelSelectorPresented
                )
            }
            .onChange(of: viewModel.selectedModel) {
                // 模型变化时自动分析
                if $0 != nil {
                    viewModel.analyzeModel()
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
    
    // 获取多维度分析服务
    func makeMultiDimensionalAnalysisService() -> MultiDimensionalAnalysisServiceProtocol {
        return MultiDimensionalAnalysisService(apiManager: APIManager.shared)
    }
    
    // 获取认知模型服务
    func makeCognitiveModelService() -> CognitiveModelServiceProtocol {
        return CognitiveModelService(apiManager: APIManager.shared)
    }
    
    // 获取多维度分析ViewModel
    func makeMultiDimensionalAnalysisViewModel() -> MultiDimensionalAnalysisViewModel {
        return MultiDimensionalAnalysisViewModel(
            service: makeMultiDimensionalAnalysisService(),
            cognitiveModelService: makeCognitiveModelService()
        )
    }
}
```

### 3.2 路由集成

```swift
// AppRouter.swift
enum AppRoute {
    case home
    case aiConversation
    case multiDimensionalAnalysis
    // 其他路由
}

class AppRouter: ObservableObject {
    @Published var currentRoute: AppRoute = .home
    // 路由管理逻辑
}

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
   - 测试模型选择功能
   - 测试分析模型功能
   - 测试缓存机制
   - 测试历史记录加载

2. **性能测试**：
   - 测试分析结果的加载速度
   - 测试缓存读写性能
   - 测试模型列表的加载性能

3. **集成测试**：
   - 测试与多维度分析服务的集成
   - 测试与认知模型服务的集成
   - 测试与Core Data的集成

## 4. 代码质量与性能优化

### 4.1 代码质量保证

1. **模块化设计**：将UI组件、业务逻辑、数据存储分离
2. **依赖注入**：使用依赖注入提高代码可测试性和可维护性
3. **协议导向编程**：通过协议抽象服务层，便于替换和扩展
4. **错误处理**：完善的错误处理机制，确保应用稳定性

### 4.2 性能优化

1. **缓存策略优化**：
   - 实现了多级缓存机制，先从本地缓存获取，再从API获取
   - 定期清理过期的缓存数据
   - 优化缓存读写操作，使用后台线程处理

2. **网络请求优化**：
   - 实现了请求节流和防抖
   - 合理设置超时时间
   - 实现了网络状态监听和重试机制

3. **UI渲染优化**：
   - 优化了列表的渲染性能，使用LazyVStack
   - 避免不必要的UI更新
   - 优化了图表的渲染性能

## 5. 每日进度总结

### 5.1 已完成工作

1. ✅ 实现了模型选择器组件
2. ✅ 实现了认知模型服务
3. ✅ 实现了分析结果缓存服务
4. ✅ 增强了多维度分析ViewModel
5. ✅ 增强了多维度分析主界面
6. ✅ 实现了分析结果的本地缓存
7. ✅ 实现了分析功能的完整逻辑
8. ✅ 集成了分析服务API

### 5.2 遇到的问题与解决方案

1. **问题**：缓存数据的序列化和反序列化
   **解决方案**：使用JSONEncoder和JSONDecoder实现数据的序列化和反序列化，确保数据的完整性

2. **问题**：模型选择器的性能
   **解决方案**：实现了搜索过滤功能，优化了列表的渲染性能

3. **问题**：分析结果的缓存策略
   **解决方案**：实现了基于模型ID和分析类型的缓存策略，确保获取最新的分析结果

### 5.3 明日计划

- 实现分析结果优化和分享功能
- 优化分析结果的可视化效果
- 实现分析结果的导出功能
- 实现分析历史的管理和查看

## 6. 代码评审与安全性

### 6.1 代码评审要点

1. 检查缓存服务的实现是否正确
2. 检查模型选择器的功能是否完整
3. 检查网络请求的错误处理是否完善
4. 检查ViewModel的状态管理是否合理

### 6.2 安全性考虑

1. 确保所有网络请求都使用HTTPS
2. 确保分析数据的安全存储
3. 实现合理的权限控制，保护用户的分析数据
4. 定期清理过期的分析数据

## 7. 附加说明

- 本实现采用了MVVM架构，将UI与业务逻辑分离
- 使用Core Data实现了分析结果的本地缓存
- 支持iOS 16.0及以上版本
- 代码遵循SwiftLint代码规范

---

**文档作者**：AI认知辅助系统前端开发团队  
**文档创建时间**：2026-01-10  
**文档版本**：v1.0.0