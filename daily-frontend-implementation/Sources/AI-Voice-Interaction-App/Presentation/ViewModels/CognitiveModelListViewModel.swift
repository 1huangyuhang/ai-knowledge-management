import SwiftUI
import Combine

/// 认知模型列表视图模型
@MainActor
class CognitiveModelListViewModel: ObservableObject {
    /// 认知模型列表
    @Published var models: [CognitiveModel] = []
    /// 搜索文本
    @Published var searchText: String = ""
    /// 是否正在加载
    @Published var isLoading: Bool = false
    /// 是否正在加载更多
    @Published var isLoadingMore: Bool = false
    /// 错误信息
    @Published var errorMessage: String? = nil
    /// 当前页码
    @Published var currentPage: Int = 1
    /// 总页数
    @Published var totalPages: Int = 1
    /// 是否有更多数据
    @Published var hasMoreData: Bool = true
    
    /// 认知模型服务
    private let cognitiveModelService: CognitiveModelServiceProtocol
    /// 取消订阅集合
    private var cancellables = Set<AnyCancellable>()
    /// 每页大小
    private let pageSize: Int = 10
    
    /// 初始化
    /// - Parameter cognitiveModelService: 认知模型服务
    init(cognitiveModelService: CognitiveModelServiceProtocol = CognitiveModelService()) {
        self.cognitiveModelService = cognitiveModelService
        
        // 监听搜索文本变化，实现防抖搜索
        $searchText
            .debounce(for: .seconds(0.5), scheduler: RunLoop.main)
            .sink {[weak self] _ in
                self?.resetAndFetchModels()
            }
            .store(in: &cancellables)
    }
    
    /// 获取模型列表
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
            
            // 增加当前页码
            currentPage += 1
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "获取模型列表失败，请重试"
        }
        
        isLoading = false
        isLoadingMore = false
    }
    
    /// 加载更多模型
    func loadMoreModels() async {
        guard hasMoreData && !isLoadingMore else {
            return
        }
        await fetchModels()
    }
    
    /// 重置并获取模型列表
    func resetAndFetchModels() {
        currentPage = 1
        totalPages = 1
        hasMoreData = true
        models = []
        Task {
            await fetchModels()
        }
    }
    
    /// 刷新模型列表
    func refreshModels() async {
        resetAndFetchModels()
    }
    
    /// 删除模型
    /// - Parameter model: 要删除的模型
    func deleteModel(_ model: CognitiveModel) async {
        do {
            try await cognitiveModelService.deleteModel(id: model.id.uuidString)
            // 从列表中移除删除的模型
            models.removeAll { $0.id == model.id }
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "删除模型失败，请重试"
        }
    }
}

/// 认知模型列表响应
struct CognitiveModelListResponse: Codable {
    /// 模型列表
    let models: [CognitiveModel]
    /// 总数量
    let totalCount: Int
    /// 当前页码
    let currentPage: Int
    /// 总页数
    let totalPages: Int
    /// 每页大小
    let pageSize: Int
    
    enum CodingKeys: String, CodingKey {
        case models
        case totalCount = "total_count"
        case currentPage = "current_page"
        case totalPages = "total_pages"
        case pageSize = "page_size"
    }
}
