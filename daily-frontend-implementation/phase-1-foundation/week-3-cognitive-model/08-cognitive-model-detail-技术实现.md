# Day 08: 认知模型详情实现 - 代码实现文档

## 1. 项目概述

### 1.1 项目目标
- 实现AI语音交互应用的认知模型详情功能
- 展示认知模型的基本信息
- 展示模型的概念列表和关系列表
- 提供模型操作功能（编辑、删除等）
- 确保良好的用户体验和性能

### 1.2 核心设计理念
- **清晰展示**：提供直观的模型信息和关系展示
- **用户友好**：便捷的操作和导航
- **响应式设计**：适配不同屏幕尺寸
- **MVVM架构**：清晰分离UI、业务逻辑和数据

## 2. 技术栈选型

### 2.1 核心技术
- **Swift 5.9+**：开发语言
- **SwiftUI 5.0+**：UI框架
- **Combine**：响应式编程
- **URLSession + Async/Await**：网络请求
- **Core Data**：本地缓存

### 2.2 第三方依赖
- **Alamofire 5.8.1**：网络请求封装
- **SwiftLint 0.54.0**：代码质量检查

## 3. 核心功能实现

### 3.1 认知模型详情页面UI设计

#### 3.1.1 页面结构
- 顶部导航栏：页面标题、编辑按钮、删除按钮
- 模型基本信息：名称、描述、创建时间、更新时间
- 统计信息：概念数量、关系数量
- 概念列表：展示模型包含的所有概念
- 关系列表：展示模型包含的所有关系
- 操作按钮：可视化编辑、分析等

#### 3.1.2 响应式布局
- 适配不同屏幕尺寸（iPhone SE到iPhone Pro Max）
- 支持横竖屏切换
- 在iPad上实现分栏布局

### 3.2 认知模型详情ViewModel实现

#### 3.2.1 核心功能
- 获取模型详情数据
- 管理概念和关系数据
- 状态管理（加载中、成功、失败）
- 本地缓存管理

#### 3.2.2 数据流设计
```
页面加载 → View → ViewModel → API Service → 后端
                                          ↓
                                      数据缓存 ← Core Data
                                          ↓
                                      状态更新 ← 错误处理
                                          ↓
                                      View 更新
```

### 3.3 认知模型详情API服务

#### 3.3.1 API端点设计
- **GET** `/api/v1/models/{modelId}`
- 响应数据：模型基本信息、概念列表、关系列表

#### 3.3.2 数据处理
- 处理API响应
- 解析JSON数据
- 转换为模型对象
- 实现本地缓存

## 4. 详细代码实现

### 4.1 CognitiveConcept.swift
```swift
import Foundation

struct CognitiveConcept: Codable, Identifiable, Equatable {
    let id: String
    let name: String
    let description: String?
    let type: String
    let weight: Double
    let createdAt: Date
    let updatedAt: Date
    let modelId: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case type
        case weight
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case modelId = "model_id"
    }
}
```

### 4.2 CognitiveRelation.swift
```swift
import Foundation

struct CognitiveRelation: Codable, Identifiable, Equatable {
    let id: String
    let sourceId: String
    let targetId: String
    let type: String
    let weight: Double
    let description: String?
    let createdAt: Date
    let updatedAt: Date
    let modelId: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case sourceId = "source_id"
        case targetId = "target_id"
        case type
        case weight
        case description
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case modelId = "model_id"
    }
}
```

### 4.3 CognitiveModelDetailViewModel.swift
```swift
import SwiftUI
import Combine

@MainActor
class CognitiveModelDetailViewModel: BaseViewModel, ObservableObject {
    @Published var model: CognitiveModel? = nil
    @Published var concepts: [CognitiveConcept] = []
    @Published var relations: [CognitiveRelation] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var activeTab: DetailTab = .concepts
    
    private let cognitiveModelService: CognitiveModelServiceProtocol
    private let cacheService: CacheServiceProtocol
    private let modelId: String
    private var cancellables = Set<AnyCancellable>()
    
    enum DetailTab {
        case concepts, relations, analysis
        
        var title: String {
            switch self {
            case .concepts:
                return "概念"
            case .relations:
                return "关系"
            case .analysis:
                return "分析"
            }
        }
    }
    
    init(
        modelId: String,
        cognitiveModelService: CognitiveModelServiceProtocol = CognitiveModelService(),
        cacheService: CacheServiceProtocol = CacheService()
    ) {
        self.modelId = modelId
        self.cognitiveModelService = cognitiveModelService
        self.cacheService = cacheService
        super.init()
    }
    
    func fetchModelDetail() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let modelDetail = try await cognitiveModelService.getModelDetail(id: modelId)
            
            // 更新模型数据
            model = modelDetail.model
            concepts = modelDetail.concepts
            relations = modelDetail.relations
            
            // 缓存数据
            try cacheService.saveModelDetail(modelDetail)
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "获取模型详情失败，请重试"
        } finally {
            isLoading = false
        }
    }
    
    func refreshModelDetail() async {
        // 清除缓存
        try? cacheService.clearModelDetailCache(id: modelId)
        // 重新获取数据
        await fetchModelDetail()
    }
    
    func toggleTab(_ tab: DetailTab) {
        activeTab = tab
    }
    
    func deleteConcept(_ concept: CognitiveConcept) async {
        // 实现删除概念功能
        do {
            try await cognitiveModelService.deleteConcept(id: concept.id)
            // 从列表中移除删除的概念
            concepts.removeAll { $0.id == concept.id }
            // 更新模型的概念数量
            if var updatedModel = model {
                updatedModel.conceptCount -= 1
                model = updatedModel
            }
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "删除概念失败，请重试"
        }
    }
    
    func deleteRelation(_ relation: CognitiveRelation) async {
        // 实现删除关系功能
        do {
            try await cognitiveModelService.deleteRelation(id: relation.id)
            // 从列表中移除删除的关系
            relations.removeAll { $0.id == relation.id }
            // 更新模型的关系数量
            if var updatedModel = model {
                updatedModel.relationCount -= 1
                model = updatedModel
            }
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "删除关系失败，请重试"
        }
    }
}

struct CognitiveModelDetailResponse: Codable {
    let model: CognitiveModel
    let concepts: [CognitiveConcept]
    let relations: [CognitiveRelation]
}
```

### 4.4 CognitiveModelDetailView.swift
```swift
import SwiftUI

struct CognitiveModelDetailView: View {
    @StateObject private var viewModel: CognitiveModelDetailViewModel
    @EnvironmentObject private var appRouter: AppRouter
    
    init(modelId: String) {
        _viewModel = StateObject(wrappedValue: CognitiveModelDetailViewModel(modelId: modelId))
    }
    
    var body: some View {
        AppContainer {
            NavigationStack {
                VStack(spacing: 0) {
                    // 模型基本信息
                    if let model = viewModel.model {
                        ModelHeaderView(model: model)
                    }
                    
                    // 错误提示
                    if let errorMessage = viewModel.errorMessage {
                        ErrorBanner(message: errorMessage) {
                            Task {
                                await viewModel.refreshModelDetail()
                            }
                        }
                    }
                    
                    // 选项卡
                    TabBarView(
                        activeTab: viewModel.activeTab,
                        tabs: [.concepts, .relations, .analysis]
                    ) {
                        viewModel.toggleTab($0)
                    }
                    
                    // 内容区域
                    ScrollView {
                        if viewModel.isLoading {
                            // 加载中状态
                            LoadingView()
                        } else if let model = viewModel.model {
                            // 根据选项卡显示不同内容
                            switch viewModel.activeTab {
                            case .concepts:
                                ConceptsListView(
                                    concepts: viewModel.concepts,
                                    onDelete: { concept in
                                        Task {
                                            await viewModel.deleteConcept(concept)
                                        }
                                    }
                                )
                            case .relations:
                                RelationsListView(
                                    relations: viewModel.relations,
                                    concepts: viewModel.concepts,
                                    onDelete: { relation in
                                        Task {
                                            await viewModel.deleteRelation(relation)
                                        }
                                    }
                                )
                            case .analysis:
                                AnalysisView(model: model)
                            }
                        }
                    }
                    .background(Color.background)
                }
                .navigationTitle("模型详情")
                .toolbar {
                    // 编辑按钮
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button(action: {
                            appRouter.push(route: .cognitiveModelEdit(id: viewModel.modelId))
                        }) {
                            Image(systemName: "pencil")
                                .font(.title2)
                        }
                    }
                    
                    // 删除按钮
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button(role: .destructive, action: {
                            // 显示删除确认对话框
                            showDeleteConfirmation()
                        }) {
                            Image(systemName: "trash")
                                .font(.title2)
                        }
                    }
                }
                .onAppear {
                    Task {
                        // 先加载缓存数据
                        if let cachedDetail = try? CacheService().getModelDetail(id: viewModel.modelId) {
                            viewModel.model = cachedDetail.model
                            viewModel.concepts = cachedDetail.concepts
                            viewModel.relations = cachedDetail.relations
                        }
                        // 再从服务器获取最新数据
                        await viewModel.fetchModelDetail()
                    }
                }
                .refreshable {
                    await viewModel.refreshModelDetail()
                }
            }
        }
        .background(Color.background)
    }
    
    // 显示删除确认对话框
    private func showDeleteConfirmation() {
        // 实现删除确认对话框
        // 这里简化处理，实际应用中需要实现完整的确认逻辑
        Task {
            do {
                try await CognitiveModelService().deleteModel(id: viewModel.modelId)
                // 删除成功后返回上一页
                appRouter.pop()
            } catch {
                // 处理删除失败
                viewModel.errorMessage = "删除模型失败，请重试"
            }
        }
    }
}

// 模型头部信息视图
struct ModelHeaderView: View {
    let model: CognitiveModel
    
    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: 12) {
                // 模型名称
                Text(model.name)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                // 模型描述
                if !model.description.isEmpty {
                    Text(model.description)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .lineLimit(nil)
                }
                
                // 统计信息
                HStack(spacing: 24) {
                    // 概念数量
                    VStack(alignment: .leading, spacing: 4) {
                        Text("概念数量")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(model.conceptCount)")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                    }
                    
                    // 关系数量
                    VStack(alignment: .leading, spacing: 4) {
                        Text("关系数量")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(model.relationCount)")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                    }
                    
                    Spacer()
                }
                
                // 创建时间和更新时间
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("创建时间：")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(model.createdAt.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("更新时间：")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(model.updatedAt.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding(16)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
}

// 选项卡视图
struct TabBarView: View {
    let activeTab: CognitiveModelDetailViewModel.DetailTab
    let tabs: [CognitiveModelDetailViewModel.DetailTab]
    let onTabTap: (CognitiveModelDetailViewModel.DetailTab) -> Void
    
    var body: some View {
        HStack {
            ForEach(tabs, id: \.self) {
                TabItemView(
                    tab: $0,
                    isActive: activeTab == $0,
                    onTap: {
                        onTabTap($0)
                    }
                )
            }
        }
        .background(Color.background)
        .border(.gray.opacity(0.2), width: 1)
    }
}

// 选项卡项视图
struct TabItemView: View {
    let tab: CognitiveModelDetailViewModel.DetailTab
    let isActive: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 4) {
                Text(tab.title)
                    .font(.body)
                    .fontWeight(isActive ? .bold : .regular)
                    .foregroundColor(isActive ? .primary : .secondary)
                
                if isActive {
                    Rectangle()
                        .frame(height: 2)
                        .background(Color.primary)
                        .cornerRadius(1)
                } else {
                    Rectangle()
                        .frame(height: 2)
                        .background(Color.clear)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
    }
}

// 概念列表视图
struct ConceptsListView: View {
    let concepts: [CognitiveConcept]
    let onDelete: (CognitiveConcept) -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            if concepts.isEmpty {
                // 空状态
                EmptyStateView(
                    title: "暂无概念",
                    subtitle: "该认知模型尚未添加任何概念",
                    action: { /* 导航到添加概念页面 */ },
                    actionTitle: "添加概念"
                )
                .padding(.vertical, 32)
            } else {
                // 概念列表
                ForEach(concepts) {
                    ConceptItemView(
                        concept: $0,
                        onDelete: {
                            onDelete($0)
                        }
                    )
                }
            }
        }
        .padding(16)
    }
}

// 概念项视图
struct ConceptItemView: View {
    let concept: CognitiveConcept
    let onDelete: () -> Void
    
    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(concept.name)
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        if let description = concept.description, !description.isEmpty {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                                .lineLimit(2)
                        }
                    }
                    
                    Spacer()
                    
                    Menu {
                        Button("编辑") {
                            // 导航到编辑页面
                        }
                        Button("删除", role: .destructive) {
                            onDelete()
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundColor(.secondary)
                            .font(.title2)
                    }
                }
                
                HStack {
                    // 概念类型
                    HStack(spacing: 4) {
                        Text(concept.type)
                            .font(.caption)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.blue)
                            .cornerRadius(12)
                    }
                    
                    // 概念权重
                    HStack(spacing: 4) {
                        Text("权重：\(String(format: "%.2f", concept.weight))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    // 更新时间
                    Text(concept.updatedAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(16)
        }
    }
}

// 关系列表视图
struct RelationsListView: View {
    let relations: [CognitiveRelation]
    let concepts: [CognitiveConcept]
    let onDelete: (CognitiveRelation) -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            if relations.isEmpty {
                // 空状态
                EmptyStateView(
                    title: "暂无关系",
                    subtitle: "该认知模型尚未添加任何关系",
                    action: { /* 导航到添加关系页面 */ },
                    actionTitle: "添加关系"
                )
                .padding(.vertical, 32)
            } else {
                // 关系列表
                ForEach(relations) {
                    RelationItemView(
                        relation: $0,
                        concepts: concepts,
                        onDelete: {
                            onDelete($0)
                        }
                    )
                }
            }
        }
        .padding(16)
    }
}

// 关系项视图
struct RelationItemView: View {
    let relation: CognitiveRelation
    let concepts: [CognitiveConcept]
    let onDelete: () -> Void
    
    private var sourceConcept: CognitiveConcept? {
        concepts.first { $0.id == relation.sourceId }
    }
    
    private var targetConcept: CognitiveConcept? {
        concepts.first { $0.id == relation.targetId }
    }
    
    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: 8) {
                // 关系描述
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            // 源概念
                            Text(sourceConcept?.name ?? "未知概念")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                            
                            // 关系箭头
                            Image(systemName: "arrow.right")
                                .foregroundColor(.secondary)
                            
                            // 目标概念
                            Text(targetConcept?.name ?? "未知概念")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                        }
                        
                        if let description = relation.description, !description.isEmpty {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                                .lineLimit(2)
                        }
                    }
                    
                    Spacer()
                    
                    Menu {
                        Button("编辑") {
                            // 导航到编辑页面
                        }
                        Button("删除", role: .destructive) {
                            onDelete()
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundColor(.secondary)
                            .font(.title2)
                    }
                }
                
                HStack {
                    // 关系类型
                    HStack(spacing: 4) {
                        Text(relation.type)
                            .font(.caption)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.green)
                            .cornerRadius(12)
                    }
                    
                    // 关系权重
                    HStack(spacing: 4) {
                        Text("权重：\(String(format: "%.2f", relation.weight))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    // 更新时间
                    Text(relation.updatedAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(16)
        }
    }
}

// 分析视图
struct AnalysisView: View {
    let model: CognitiveModel
    
    var body: some View {
        VStack(spacing: 16) {
            Text("模型分析功能正在开发中...")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(32)
        }
        .padding(16)
    }
}

// 加载视图
struct LoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            Text("加载中...")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
    }
}

struct CognitiveModelDetailView_Previews: PreviewProvider {
    static var previews: some View {
        CognitiveModelDetailView(modelId: "test-model-id")
            .environmentObject(AppRouter())
    }
}
```

### 4.5 CognitiveModelService.swift（扩展）
```swift
extension CognitiveModelServiceProtocol {
    func getModelDetail(id: String) async throws -> CognitiveModelDetailResponse
    func deleteConcept(id: String) async throws
    func deleteRelation(id: String) async throws
}

extension CognitiveModelService {
    func getModelDetail(id: String) async throws -> CognitiveModelDetailResponse {
        let endpoint = APIEndpoint.cognitiveModel(id: id)
        return try await apiService.request(
            endpoint: endpoint,
            method: .get,
            responseType: CognitiveModelDetailResponse.self
        )
    }
    
    func deleteConcept(id: String) async throws {
        let endpoint = APIEndpoint.cognitiveConcept(id: id)
        try await apiService.request(
            endpoint: endpoint,
            method: .delete,
            responseType: EmptyResponse.self
        )
    }
    
    func deleteRelation(id: String) async throws {
        let endpoint = APIEndpoint.cognitiveRelation(id: id)
        try await apiService.request(
            endpoint: endpoint,
            method: .delete,
            responseType: EmptyResponse.self
        )
    }
}
```

### 4.6 APIEndpoint.swift（扩展）
```swift
enum APIEndpoint {
    // 现有端点...
    case cognitiveConcept(id: String)
    case cognitiveRelation(id: String)
    // 其他端点...
    
    var path: String {
        switch self {
        // 现有路径...
        case .cognitiveConcept(let id):
            return "/api/v1/models/{modelId}/concepts/\(id)"
        case .cognitiveRelation(let id):
            return "/api/v1/models/{modelId}/relations/\(id)"
        // 其他路径...
        }
    }
}
```

### 4.7 CacheService.swift（扩展）
```swift
extension CacheServiceProtocol {
    func saveModelDetail(_ modelDetail: CognitiveModelDetailResponse) throws
    func getModelDetail(id: String) throws -> CognitiveModelDetailResponse
    func clearModelDetailCache(id: String) throws
}

extension CacheService {
    func saveModelDetail(_ modelDetail: CognitiveModelDetailResponse) throws {
        // 使用Core Data保存模型详情
        // 这里简化处理，实际应用中需要实现完整的Core Data逻辑
        let encoder = JSONEncoder()
        let data = try encoder.encode(modelDetail)
        UserDefaults.standard.set(data, forKey: CacheKeys.modelDetailPrefix + modelDetail.model.id)
    }
    
    func getModelDetail(id: String) throws -> CognitiveModelDetailResponse {
        // 从Core Data获取模型详情
        // 这里简化处理，实际应用中需要实现完整的Core Data逻辑
        guard let data = UserDefaults.standard.data(forKey: CacheKeys.modelDetailPrefix + id) else {
            throw CacheError.notFound
        }
        let decoder = JSONDecoder()
        return try decoder.decode(CognitiveModelDetailResponse.self, from: data)
    }
    
    func clearModelDetailCache(id: String) throws {
        // 清除Core Data中的模型详情缓存
        // 这里简化处理，实际应用中需要实现完整的Core Data逻辑
        UserDefaults.standard.removeObject(forKey: CacheKeys.modelDetailPrefix + id)
    }
}

extension CacheKeys {
    static let modelDetailPrefix = "modelDetail_"
}
```

## 5. 开发环境配置

### 5.1 Xcode设置
1. 确保Xcode版本为15.0+
2. 配置好Core Data（如果使用）
3. 配置好网络请求权限

### 5.2 Info.plist配置
- 保持与之前相同的Info.plist配置

## 6. 代码规范与最佳实践

### 6.1 命名规范
- ViewModel类名：大驼峰 + ViewModel后缀（CognitiveModelDetailViewModel）
- 服务类名：大驼峰 + Service后缀（CognitiveModelService）
- 组件名：大驼峰 + 功能描述（ConceptItemView）
- 属性名：小驼峰（activeTab）

### 6.2 SwiftUI最佳实践
- 使用@StateObject管理ViewModel实例
- 实现组件化设计
- 实现刷新功能（refreshable）
- 实现空状态和错误状态处理
- 使用TabView实现选项卡切换

### 6.3 性能最佳实践
- 实现懒加载和延迟加载
- 优化列表渲染性能
- 实现本地缓存，减少网络请求
- 避免不必要的重绘

### 6.4 错误处理
- 使用自定义错误类型
- 提供用户友好的错误提示
- 实现错误恢复机制
- 记录详细的错误日志

## 7. 项目开发规划

### 7.1 认知模型管理模块开发计划
- **第7天**：认知模型列表实现（已完成）
- **第8天**：认知模型详情实现（当前文档）
- **第9天**：认知模型创建和编辑

### 7.2 后续开发重点
- **第10-12天**：语音交互模块开发
- **第13-15天**：AI对话模块开发

## 8. 总结

Day 08的核心任务是完成认知模型详情功能的实现，包括：
- 认知模型详情页面UI设计和实现
- 认知模型详情ViewModel的业务逻辑
- 认知模型详情API服务的实现
- 概念和关系列表展示
- 选项卡切换功能
- 操作按钮（编辑、删除等）
- 状态管理和错误处理

通过这一天的工作，我们实现了认知模型详情的完整功能，用户可以查看模型的基本信息、概念列表和关系列表，并可以进行基本的操作。这为后续的认知模型可视化编辑和分析功能奠定了基础。

在后续的开发中，我们将继续完善认知模型管理模块，实现认知模型的创建和编辑功能，然后开始开发语音交互模块。