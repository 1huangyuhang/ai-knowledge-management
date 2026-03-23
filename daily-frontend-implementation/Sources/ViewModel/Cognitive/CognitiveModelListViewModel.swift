import Foundation
import Combine

/// 认知模型列表视图模型
class CognitiveModelListViewModel: ObservableObject {
    // 依赖注入：认知模型仓库
    private let cognitiveModelRepository: CognitiveModelRepository
    
    // 状态字段
    @Published var cognitiveModels: [CognitiveModel] = []
    @Published var isLoading: Bool = false
    @Published var error: String? = nil
    @Published var searchText: String = ""
    @Published var isRefreshing: Bool = false
    
    // 过滤后的认知模型列表
    var filteredCognitiveModels: [CognitiveModel] {
        if searchText.isEmpty {
            return cognitiveModels
        } else {
            return cognitiveModels.filter { model in
                return model.name.localizedCaseInsensitiveContains(searchText) || 
                       model.description?.localizedCaseInsensitiveContains(searchText) ?? false
            }
        }
    }
    
    // 取消令牌，用于取消Combine订阅
    private var cancellables = Set<AnyCancellable>()
    
    // 初始化
    init(cognitiveModelRepository: CognitiveModelRepository = APICognitiveModelRepository()) {
        self.cognitiveModelRepository = cognitiveModelRepository
        
        // 加载认知模型列表
        loadCognitiveModels()
    }
    
    // 加载认知模型列表
    func loadCognitiveModels() {
        isLoading = true
        error = nil
        
        cognitiveModelRepository.getCognitiveModels()
            .receive(on: DispatchQueue.main)
            .sink {[weak self] completion in
                self?.isLoading = false
                self?.isRefreshing = false
                
                switch completion {
                case .finished:
                    break
                case .failure(let apiError):
                    self?.error = apiError.errorDescription
                }
            } receiveValue: { [weak self] models in
                self?.cognitiveModels = models
            }
            .store(in: &cancellables)
    }
    
    // 刷新认知模型列表
    func refreshCognitiveModels() {
        isRefreshing = true
        loadCognitiveModels()
    }
    
    // 删除认知模型
    func deleteCognitiveModel(id: String) {
        isLoading = true
        error = nil
        
        cognitiveModelRepository.deleteCognitiveModel(id: id)
            .receive(on: DispatchQueue.main)
            .sink {[weak self] completion in
                self?.isLoading = false
                
                switch completion {
                case .finished:
                    // 删除成功，从列表中移除
                    self?.cognitiveModels.removeAll { $0.id == id }
                case .failure(let apiError):
                    self?.error = apiError.errorDescription
                }
            } receiveValue: { [weak self] _ in
                // 不需要处理返回值
            }
            .store(in: &cancellables)
    }
    
    // 创建新认知模型
    func createCognitiveModel(name: String, description: String?) {
        isLoading = true
        error = nil
        
        cognitiveModelRepository.createCognitiveModel(name: name, description: description)
            .receive(on: DispatchQueue.main)
            .sink {[weak self] completion in
                self?.isLoading = false
                
                switch completion {
                case .finished:
                    // 创建成功，重新加载列表
                    self?.loadCognitiveModels()
                case .failure(let apiError):
                    self?.error = apiError.errorDescription
                }
            } receiveValue: { [weak self] model in
                // 不需要处理返回值
            }
            .store(in: &cancellables)
    }
}