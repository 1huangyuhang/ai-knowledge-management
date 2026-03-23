# Day 07: 认知模型列表实现 - 代码实现文档

## 1. 项目概述

### 1.1 项目目标
- 实现AI语音交互应用的认知模型列表功能
- 提供清晰的模型卡片展示
- 实现搜索和筛选功能
- 支持分页加载
- 确保良好的用户体验和性能

### 1.2 核心设计理念
- **用户友好**：提供清晰的模型展示和便捷的搜索筛选
- **性能优先**：实现分页加载，优化大数据量展示
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

### 3.1 认知模型列表页面UI设计

#### 3.1.1 页面结构
- 顶部导航栏：页面标题、添加模型按钮
- 搜索和筛选栏：搜索输入框、筛选选项
- 模型卡片列表：展示模型基本信息
- 分页控件：加载更多按钮或无限滚动
- 状态展示：加载中、空状态、错误状态

#### 3.1.2 响应式布局
- 适配不同屏幕尺寸（iPhone SE到iPhone Pro Max）
- 支持横竖屏切换
- 在iPad上实现网格布局

### 3.2 认知模型列表ViewModel实现

#### 3.2.1 核心功能
- 获取模型列表数据
- 搜索和筛选逻辑
- 分页加载管理
- 状态管理（加载中、空状态、错误状态）
- 本地缓存管理

#### 3.2.2 数据流设计
```
用户交互 → View → ViewModel → API Service → 后端
                                          ↓
                                      数据缓存 ← Core Data
                                          ↓
                                      状态更新 ← 错误处理
                                          ↓
                                      View 更新
```

### 3.3 认知模型列表API服务

#### 3.3.1 API端点设计
- **GET** `/api/v1/models`
- 请求参数：page, limit, search, filter
- 响应数据：modelList, totalCount, pageInfo

#### 3.3.2 数据处理
- 处理API响应
- 解析JSON数据
- 转换为模型对象
- 实现本地缓存

## 4. 详细代码实现

### 4.1 CognitiveModel.swift
```swift
import Foundation

struct CognitiveModel: Codable, Identifiable, Equatable {
    let id: String
    let name: String
    let description: String
    let createdAt: Date
    let updatedAt: Date
    let conceptCount: Int
    let relationCount: Int
    let userId: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case conceptCount = "concept_count"
        case relationCount = "relation_count"
        case userId = "user_id"
    }
}
```

### 4.2 CognitiveModelListViewModel.swift
```swift
import SwiftUI
import Combine

@MainActor
class CognitiveModelListViewModel: BaseViewModel, ObservableObject {
    @Published var models: [CognitiveModel] = []
    @Published var searchText: String = ""
    @Published var isLoading: Bool = false
    @Published var isLoadingMore: Bool = false
    @Published var errorMessage: String? = nil
    @Published var currentPage: Int = 1
    @Published var totalPages: Int = 1
    @Published var hasMoreData: Bool = true
    
    private let cognitiveModelService: CognitiveModelServiceProtocol
    private let cacheService: CacheServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    private let pageSize: Int = 10
    
    init(
        cognitiveModelService: CognitiveModelServiceProtocol = CognitiveModelService(),
        cacheService: CacheServiceProtocol = CacheService()
    ) {
        self.cognitiveModelService = cognitiveModelService
        self.cacheService = cacheService
        super.init()
        
        // 监听搜索文本变化，实现防抖搜索
        $searchText
            .debounce(for: .seconds(0.5), scheduler: RunLoop.main)
            .sink {[weak self] _ in
                self?.resetAndFetchModels()
            }
            .store(in: &cancellables)
    }
    
    func fetchModels() async {
        guard !isLoading && hasMoreData else {
            return
        }
        
        isLoading = currentPage == 1 ? true : false
        isLoadingMore = currentPage > 1 ? true : false
        errorMessage = nil
        
        do {
            let response = try await cognitiveModelService.getModels(
                page: currentPage,
                limit: pageSize,
                search: searchText
            )
            
            // 更新模型列表
            if currentPage == 1 {
                models = response.models
            } else {
                models.append(contentsOf: response.models)
            }
            
            // 更新分页信息
            totalPages = response.totalPages
            hasMoreData = currentPage < totalPages
            
            // 缓存数据
            try cacheService.saveModels(response.models)
            
            // 增加当前页码
            currentPage += 1
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "获取模型列表失败，请重试"
        } finally {
            isLoading = false
            isLoadingMore = false
        }
    }
    
    func loadMoreModels() async {
        guard hasMoreData && !isLoadingMore else {
            return
        }
        await fetchModels()
    }
    
    func resetAndFetchModels() {
        currentPage = 1
        totalPages = 1
        hasMoreData = true
        models = []
        Task {
            await fetchModels()
        }
    }
    
    func refreshModels() async {
        // 清除缓存
        try? cacheService.clearModelsCache()
        // 重新获取数据
        resetAndFetchModels()
    }
    
    func deleteModel(_ model: CognitiveModel) async {
        do {
            try await cognitiveModelService.deleteModel(id: model.id)
            // 从列表中移除删除的模型
            models.removeAll { $0.id == model.id }
            // 清除缓存
            try cacheService.removeModel(id: model.id)
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "删除模型失败，请重试"
        }
    }
}

struct CognitiveModelListResponse: Codable {
    let models: [CognitiveModel]
    let totalCount: Int
    let currentPage: Int
    let totalPages: Int
    let pageSize: Int
    
    enum CodingKeys: String, CodingKey {
        case models
        case totalCount = "total_count"
        case currentPage = "current_page"
        case totalPages = "total_pages"
        case pageSize = "page_size"
    }
}
```

### 4.3 CognitiveModelListView.swift
```swift
import SwiftUI

struct CognitiveModelListView: View {
    @StateObject private var viewModel = CognitiveModelListViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    
    var body: some View {
        AppContainer {
            NavigationStack {
                VStack {
                    // 搜索和筛选栏
                    SearchBar(text: $viewModel.searchText)
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                    
                    // 模型列表
                    List {
                        ForEach(viewModel.models) { model in
                            CognitiveModelCard(model: model) {
                                // 导航到模型详情
                                appRouter.push(route: .cognitiveModelDetail(id: model.id))
                            } onDelete: {
                                Task {
                                    await viewModel.deleteModel(model)
                                }
                            }
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                            .padding(.vertical, 8)
                        }
                        
                        // 加载更多
                        if viewModel.hasMoreData {
                            LoadMoreView(isLoading: viewModel.isLoadingMore) {
                                Task {
                                    await viewModel.loadMoreModels()
                                }
                            }
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                        }
                        
                        // 空状态
                        if viewModel.models.isEmpty && !viewModel.isLoading {
                            EmptyStateView(
                                title: "暂无认知模型",
                                subtitle: "点击右上角按钮创建您的第一个认知模型",
                                action: {
                                    appRouter.push(route: .cognitiveModelCreate)
                                },
                                actionTitle: "创建模型"
                            )
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                            .frame(maxWidth: .infinity, minHeight: 300)
                        }
                    }
                    .listStyle(.plain)
                    .refreshable {
                        await viewModel.refreshModels()
                    }
                    
                    // 错误提示
                    if let errorMessage = viewModel.errorMessage {
                        ErrorBanner(message: errorMessage) {
                            Task {
                                await viewModel.fetchModels()
                            }
                        }
                    }
                }
                .navigationTitle("认知模型")
                .toolbar {
                    // 添加模型按钮
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button(action: {
                            appRouter.push(route: .cognitiveModelCreate)
                        }) {
                            Image(systemName: "plus")
                                .font(.title2)
                        }
                    }
                }
                .onAppear {
                    Task {
                        // 先加载缓存数据
                        if let cachedModels = try? CacheService().getModels() {
                            viewModel.models = cachedModels
                        }
                        // 再从服务器获取最新数据
                        await viewModel.fetchModels()
                    }
                }
            }
        }
        .background(Color.background)
    }
}

// 搜索栏组件
struct SearchBar: View {
    @Binding var text: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
                .padding(.leading, 16)
            
            TextField("搜索认知模型...", text: $text)
                .padding(.vertical, 12)
                .padding(.trailing, 16)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                .autocapitalization(.none)
                .autocorrectionDisabled()
            
            if !text.isEmpty {
                Button(action: {
                    text = ""
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                        .padding(.trailing, 16)
                }
            }
        }
        .background(Color.background)
    }
}

// 认知模型卡片组件
struct CognitiveModelCard: View {
    let model: CognitiveModel
    let onTap: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(model.name)
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        Text(model.description)
                            .font(.body)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
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
                    // 概念数量
                    HStack(spacing: 4) {
                        Image(systemName: "circle.fill")
                            .foregroundColor(.blue)
                            .font(.caption)
                        Text("\(model.conceptCount) 概念")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    // 关系数量
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.forward.circle.fill")
                            .foregroundColor(.green)
                            .font(.caption)
                        Text("\(model.relationCount) 关系")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    // 更新时间
                    Text(model.updatedAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(16)
        }
        .onTapGesture {
            onTap()
        }
    }
}

// 加载更多视图
struct LoadMoreView: View {
    let isLoading: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                if isLoading {
                    ProgressView()
                        .padding(.trailing, 8)
                    Text("加载中...")
                } else {
                    Text("加载更多")
                }
            }
            .padding(.vertical, 16)
            .foregroundColor(.primary)
        }
        .disabled(isLoading)
    }
}

// 空状态视图
struct EmptyStateView: View {
    let title: String
    let subtitle: String
    let action: () -> Void
    let actionTitle: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "cube.transparent")
                .font(.system(size: 64))
                .foregroundColor(.secondary)
            
            Text(title)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text(subtitle)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 48)
            
            PrimaryButton(title: actionTitle, isDisabled: false) {
                action()
            }
            .padding(.top, 16)
        }
    }
}

// 错误提示横幅
struct ErrorBanner: View {
    let message: String
    let action: () -> Void
    
    var body: some View {
        HStack {
            Text(message)
                .font(.body)
                .foregroundColor(.white)
                .padding(.horizontal, 16)
            
            Spacer()
            
            Button(action: action) {
                Text("重试")
                    .font(.body)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
            }
        }
        .background(Color.red)
        .frame(height: 44)
        .animation(.slide, value: message)
    }
}

struct CognitiveModelListView_Previews: PreviewProvider {
    static var previews: some View {
        CognitiveModelListView()
            .environmentObject(AppRouter())
    }
}
```

### 4.4 CognitiveModelService.swift
```swift
import Foundation

protocol CognitiveModelServiceProtocol {
    func getModels(page: Int, limit: Int, search: String?) async throws -> CognitiveModelListResponse
    func deleteModel(id: String) async throws
}

class CognitiveModelService: CognitiveModelServiceProtocol {
    private let apiService: APIServiceProtocol
    
    init(apiService: APIServiceProtocol = APIService()) {
        self.apiService = apiService
    }
    
    func getModels(page: Int, limit: Int, search: String?) async throws -> CognitiveModelListResponse {
        let endpoint = APIEndpoint.cognitiveModels
        var parameters: [String: Any] = [
            "page": page,
            "limit": limit
        ]
        
        if let search = search, !search.isEmpty {
            parameters["search"] = search
        }
        
        return try await apiService.request(
            endpoint: endpoint,
            method: .get,
            parameters: parameters,
            responseType: CognitiveModelListResponse.self
        )
    }
    
    func deleteModel(id: String) async throws {
        let endpoint = APIEndpoint.cognitiveModel(id: id)
        try await apiService.request(
            endpoint: endpoint,
            method: .delete,
            responseType: EmptyResponse.self
        )
    }
}
```

### 4.5 APIEndpoint.swift（扩展）
```swift
enum APIEndpoint {
    // 现有端点...
    case cognitiveModels
    case cognitiveModel(id: String)
    case cognitiveModelCreate
    case cognitiveModelUpdate(id: String)
    // 其他端点...
    
    var path: String {
        switch self {
        // 现有路径...
        case .cognitiveModels:
            return "/api/v1/models"
        case .cognitiveModel(let id):
            return "/api/v1/models/\(id)"
        case .cognitiveModelCreate:
            return "/api/cognitive-models"
        case .cognitiveModelUpdate(let id):
            return "/api/cognitive-models/\(id)"
        // 其他路径...
        }
    }
}
```

### 4.6 CacheService.swift（扩展）
```swift
extension CacheServiceProtocol {
    func saveModels(_ models: [CognitiveModel]) throws
    func getModels() throws -> [CognitiveModel]
    func removeModel(id: String) throws
    func clearModelsCache() throws
}

extension CacheService {
    func saveModels(_ models: [CognitiveModel]) throws {
        // 使用Core Data保存模型列表
        // 这里简化处理，实际应用中需要实现完整的Core Data逻辑
        let encoder = JSONEncoder()
        let data = try encoder.encode(models)
        UserDefaults.standard.set(data, forKey: CacheKeys.cognitiveModels)
    }
    
    func getModels() throws -> [CognitiveModel] {
        // 从Core Data获取模型列表
        // 这里简化处理，实际应用中需要实现完整的Core Data逻辑
        guard let data = UserDefaults.standard.data(forKey: CacheKeys.cognitiveModels) else {
            return []
        }
        let decoder = JSONDecoder()
        return try decoder.decode([CognitiveModel].self, from: data)
    }
    
    func removeModel(id: String) throws {
        // 从Core Data移除指定模型
        // 这里简化处理，实际应用中需要实现完整的Core Data逻辑
        var models = try getModels()
        models.removeAll { $0.id == id }
        try saveModels(models)
    }
    
    func clearModelsCache() throws {
        // 清除Core Data中的模型缓存
        // 这里简化处理，实际应用中需要实现完整的Core Data逻辑
        UserDefaults.standard.removeObject(forKey: CacheKeys.cognitiveModels)
    }
}

extension CacheKeys {
    static let cognitiveModels = "cognitiveModels"
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
- ViewModel类名：大驼峰 + ViewModel后缀（CognitiveModelListViewModel）
- 服务类名：大驼峰 + Service后缀（CognitiveModelService）
- 组件名：大驼峰 + 功能描述（CognitiveModelCard）
- 属性名：小驼峰（searchText）

### 6.2 SwiftUI最佳实践
- 使用@StateObject管理ViewModel实例
- 实现刷新功能（refreshable）
- 实现空状态和错误状态处理
- 使用List的plain style
- 实现组件化设计

### 6.3 性能最佳实践
- 实现分页加载，避免一次性加载大量数据
- 实现防抖搜索，减少不必要的网络请求
- 实现本地缓存，提高离线体验
- 使用懒加载和延迟加载

### 6.4 错误处理
- 使用自定义错误类型
- 提供用户友好的错误提示
- 实现错误恢复机制
- 记录详细的错误日志

## 7. 项目开发规划

### 7.1 认知模型管理模块开发计划
- **第7天**：认知模型列表实现（当前文档）
- **第8天**：认知模型详情实现
- **第9天**：认知模型创建和编辑

### 7.2 后续开发重点
- **第10-12天**：语音交互模块开发
- **第13-15天**：AI对话模块开发

## 8. 总结

Day 07的核心任务是完成认知模型列表功能的实现，包括：
- 认知模型列表页面UI设计和实现
- 认知模型列表ViewModel的业务逻辑
- 认知模型列表API服务的实现
- 搜索和筛选功能
- 分页加载逻辑
- 空状态和错误状态处理
- 本地缓存机制

通过这一天的工作，我们实现了认知模型的列表展示功能，为用户提供了清晰的模型管理界面。用户可以查看、搜索、筛选和删除认知模型，同时享受到良好的性能和用户体验。

在后续的开发中，我们将继续完善认知模型管理模块，实现认知模型详情、创建和编辑功能，为用户提供完整的认知模型管理体验。