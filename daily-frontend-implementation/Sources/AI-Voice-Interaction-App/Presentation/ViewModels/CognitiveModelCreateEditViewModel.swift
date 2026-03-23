import SwiftUI
import Combine

/// 认知模型创建编辑视图模型
@MainActor
class CognitiveModelCreateEditViewModel: ObservableObject {
    // 表单数据
    @Published var name: String = ""
    @Published var description: String = ""
    
    // 验证状态
    @Published var isNameValid: Bool = true
    @Published var nameValidationMessage: String = ""
    
    // 页面状态
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var successMessage: String? = nil
    
    // 编辑模式
    let isEditMode: Bool
    private let modelId: UUID?
    
    private let cognitiveModelService: CognitiveModelServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    /// 初始化
    /// - Parameters:
    ///   - modelId: 模型ID（编辑模式时提供）
    ///   - cognitiveModelService: 认知模型服务
    init(modelId: UUID? = nil, 
         cognitiveModelService: CognitiveModelServiceProtocol = CognitiveModelService()) {
        self.modelId = modelId
        self.isEditMode = modelId != nil
        self.cognitiveModelService = cognitiveModelService
        
        // 监听表单变化，进行验证
        $name
            .debounce(for: .seconds(0.3), scheduler: RunLoop.main)
            .sink {[weak self] name in
                self?.validateName(name)
            }
            .store(in: &cancellables)
        
        // 如果是编辑模式，加载模型数据
        if isEditMode {
            Task {
                await loadModelData()
            }
        }
    }
    
    /// 加载模型数据（编辑模式）
    private func loadModelData() async {
        guard let modelId = modelId else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let model = try await cognitiveModelService.getModelDetail(id: modelId.uuidString)
            
            // 填充表单数据
            name = model.name
            description = model.description ?? ""
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "加载模型数据失败，请重试"
        }
        
        isLoading = false
    }
    
    /// 验证名称
    /// - Parameter name: 模型名称
    private func validateName(_ name: String) {
        if name.isEmpty {
            isNameValid = false
            nameValidationMessage = "名称不能为空"
        } else if name.count < 2 {
            isNameValid = false
            nameValidationMessage = "名称长度不能少于2个字符"
        } else if name.count > 50 {
            isNameValid = false
            nameValidationMessage = "名称长度不能超过50个字符"
        } else {
            isNameValid = true
            nameValidationMessage = ""
        }
    }
    
    /// 表单是否有效
    var isFormValid: Bool {
        isNameValid && !name.isEmpty
    }
    
    /// 保存模型
    func saveModel() async -> Bool {
        // 验证表单
        validateName(name)
        
        guard isFormValid else {
            errorMessage = "请检查表单填写是否正确"
            return false
        }
        
        isLoading = true
        errorMessage = nil
        successMessage = nil
        
        do {
            if isEditMode, let modelId = modelId {
                // 编辑模式：更新模型
                _ = try await cognitiveModelService.updateModel(
                    id: modelId.uuidString,
                    model: CognitiveModel(
                        id: modelId,
                        userId: UUID(),
                        name: name,
                        description: description,
                        version: 1,
                        status: .active,
                        createdAt: Date(),
                        updatedAt: Date(),
                        concepts: [],
                        relations: []
                    )
                )
                successMessage = "模型更新成功"
            } else {
                // 创建模式：创建新模型
                _ = try await cognitiveModelService.createModel(
                    model: CognitiveModel(
                        id: UUID(),
                        userId: UUID(),
                        name: name,
                        description: description,
                        version: 1,
                        status: .active,
                        createdAt: Date(),
                        updatedAt: Date(),
                        concepts: [],
                        relations: []
                    )
                )
                successMessage = "模型创建成功"
            }
            
            return true
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "保存模型失败，请重试"
        }
        
        isLoading = false
        return false
    }
    
    /// 重置表单
    func resetForm() {
        name = ""
        description = ""
        isNameValid = true
        nameValidationMessage = ""
        errorMessage = nil
        successMessage = nil
    }
}

/// 认知模型请求数据结构
struct CognitiveModelRequest: Codable {
    let name: String
    let description: String
}
