import SwiftUI
import Combine

/// 认知模型详情视图模型
@MainActor
class CognitiveModelDetailViewModel: ObservableObject {
    /// 认知模型
    @Published var model: CognitiveModel? = nil
    /// 概念列表
    @Published var concepts: [CognitiveConcept] = []
    /// 关系列表
    @Published var relations: [CognitiveRelation] = []
    /// 是否正在加载
    @Published var isLoading: Bool = false
    /// 错误信息
    @Published var errorMessage: String? = nil
    /// 当前选中的选项卡
    @Published var activeTab: DetailTab = .concepts
    
    /// 认知模型服务
    private let cognitiveModelService: CognitiveModelServiceProtocol
    /// 模型ID
    let modelId: UUID
    /// 取消订阅集合
    private var cancellables = Set<AnyCancellable>()
    
    /// 选项卡枚举
    enum DetailTab: String, CaseIterable, Identifiable {
        case concepts = "概念"
        case relations = "关系"
        case analysis = "分析"
        
        var id: String { rawValue }
        
        var title: String {
            rawValue
        }
    }
    
    /// 初始化
    /// - Parameters:
    ///   - modelId: 模型ID
    ///   - cognitiveModelService: 认知模型服务
    init(modelId: UUID, 
         cognitiveModelService: CognitiveModelServiceProtocol = CognitiveModelService()) {
        self.modelId = modelId
        self.cognitiveModelService = cognitiveModelService
    }
    
    /// 获取模型详情
    func fetchModelDetail() async {
        isLoading = true
        errorMessage = nil
        
        do {
            // 获取模型详情
            let model = try await cognitiveModelService.getModelDetail(id: modelId.uuidString)
            self.model = model
            
            // 获取模型的概念列表
            let concepts = try await cognitiveModelService.getModelConcepts(modelId: modelId.uuidString)
            self.concepts = concepts
            
            // 获取模型的关系列表
            let relations = try await cognitiveModelService.getModelRelations(modelId: modelId.uuidString)
            self.relations = relations
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "获取模型详情失败，请重试"
        }
        
        isLoading = false
    }
    
    /// 刷新模型详情
    func refreshModelDetail() async {
        await fetchModelDetail()
    }
    
    /// 切换选项卡
    /// - Parameter tab: 选项卡
    func toggleTab(_ tab: DetailTab) {
        activeTab = tab
    }
    
    /// 删除概念
    /// - Parameter concept: 概念
    func deleteConcept(_ concept: CognitiveConcept) async {
        do {
            try await cognitiveModelService.deleteConcept(id: concept.id.uuidString)
            // 从列表中移除删除的概念
            concepts.removeAll { $0.id == concept.id }
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "删除概念失败，请重试"
        }
    }
    
    /// 删除关系
    /// - Parameter relation: 关系
    func deleteRelation(_ relation: CognitiveRelation) async {
        do {
            try await cognitiveModelService.deleteRelation(id: relation.id.uuidString)
            // 从列表中移除删除的关系
            relations.removeAll { $0.id == relation.id }
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "删除关系失败，请重试"
        }
    }
}
