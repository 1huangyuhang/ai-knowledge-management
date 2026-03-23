# Day 09: 认知模型创建和编辑 - 代码实现文档

## 1. 项目概述

### 1.1 项目目标
- 实现AI语音交互应用的认知模型创建功能
- 实现AI语音交互应用的认知模型编辑功能
- 提供清晰的表单设计和验证
- 确保良好的用户体验和性能
- 实现模型创建/编辑后的流程处理

### 1.2 核心设计理念
- **用户友好**：提供清晰的表单设计和验证提示
- **安全优先**：确保数据的完整性和安全性
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

### 3.1 认知模型创建/编辑页面UI设计

#### 3.1.1 页面结构
- 顶部导航栏：页面标题、保存按钮
- 表单区域：名称输入框、描述输入框
- 表单验证提示：实时显示验证结果
- 操作按钮：保存按钮、取消按钮
- 状态展示：加载中、成功、失败状态

#### 3.1.2 响应式布局
- 适配不同屏幕尺寸（iPhone SE到iPhone Pro Max）
- 支持横竖屏切换
- 在iPad上实现分栏布局

### 3.2 认知模型创建/编辑ViewModel实现

#### 3.2.1 核心功能
- 表单验证逻辑
- 模型创建/更新请求处理
- 状态管理（加载中、成功、失败）
- 本地缓存管理

#### 3.2.2 数据流设计
```
用户输入 → View → ViewModel → 表单验证 → API Service → 后端
                                      ↓
                                  状态更新 ← 错误处理
                                      ↓
                                  View 更新
```

### 3.3 认知模型API服务

#### 3.3.1 API端点设计
- **POST** `/api/v1/models`（创建）
- **PUT** `/api/v1/models/{modelId}`（更新）
- 请求参数：name, description
- 响应数据：创建/更新后的模型信息

#### 3.3.2 数据处理
- 处理API响应
- 解析JSON数据
- 转换为模型对象
- 实现本地缓存更新

## 4. 详细代码实现

### 4.1 CognitiveModelCreateEditViewModel.swift
```swift
import SwiftUI
import Combine

@MainActor
class CognitiveModelCreateEditViewModel: BaseViewModel, ObservableObject {
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
    private let isEditMode: Bool
    private let modelId: String?
    
    private let cognitiveModelService: CognitiveModelServiceProtocol
    private let cacheService: CacheServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    // 初始化
    init(
        modelId: String? = nil,
        cognitiveModelService: CognitiveModelServiceProtocol = CognitiveModelService(),
        cacheService: CacheServiceProtocol = CacheService()
    ) {
        self.modelId = modelId
        self.isEditMode = modelId != nil
        self.cognitiveModelService = cognitiveModelService
        self.cacheService = cacheService
        super.init()
        
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
    
    // 加载模型数据（编辑模式）
    private func loadModelData() async {
        guard let modelId = modelId else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let modelDetail = try await cognitiveModelService.getModelDetail(id: modelId)
            let model = modelDetail.model
            
            // 填充表单数据
            name = model.name
            description = model.description
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "加载模型数据失败，请重试"
        } finally {
            isLoading = false
        }
    }
    
    // 验证名称
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
    
    // 表单是否有效
    var isFormValid: Bool {
        isNameValid && !name.isEmpty
    }
    
    // 保存模型
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
            let modelRequest = CognitiveModelRequest(
                name: name,
                description: description
            )
            
            let model: CognitiveModel
            
            if isEditMode, let modelId = modelId {
                // 编辑模式：更新模型
                model = try await cognitiveModelService.updateModel(
                    id: modelId,
                    request: modelRequest
                )
                successMessage = "模型更新成功"
            } else {
                // 创建模式：创建新模型
                model = try await cognitiveModelService.createModel(request: modelRequest)
                successMessage = "模型创建成功"
            }
            
            // 更新缓存
            try updateCache(model: model)
            
            return true
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "保存模型失败，请重试"
        } finally {
            isLoading = false
        }
        
        return false
    }
    
    // 更新缓存
    private func updateCache(model: CognitiveModel) throws {
        // 清除相关缓存
        if isEditMode, let modelId = modelId {
            try cacheService.clearModelDetailCache(id: modelId)
        }
        try cacheService.clearModelsCache()
    }
    
    // 重置表单
    func resetForm() {
        name = ""
        description = ""
        isNameValid = true
        nameValidationMessage = ""
        errorMessage = nil
        successMessage = nil
    }
}

// 认知模型请求数据结构
struct CognitiveModelRequest: Codable {
    let name: String
    let description: String
}
```

### 4.2 CognitiveModelCreateEditView.swift
```swift
import SwiftUI

struct CognitiveModelCreateEditView: View {
    @StateObject private var viewModel: CognitiveModelCreateEditViewModel
    @EnvironmentObject private var appRouter: AppRouter
    @Environment(\.dismiss) private var dismiss
    
    // 编辑模式初始化
    init(modelId: String? = nil) {
        _viewModel = StateObject(wrappedValue: CognitiveModelCreateEditViewModel(modelId: modelId))
    }
    
    var body: some View {
        AppContainer {
            NavigationStack {
                ScrollView {
                    VStack(spacing: 24) {
                        // 表单标题
                        Text(viewModel.isEditMode ? "编辑认知模型" : "创建认知模型")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                            .multilineTextAlignment(.center)
                            .padding(.top, 16)
                        
                        // 表单区域
                        VStack(spacing: 20) {
                            // 名称输入框
                            FormFieldView(
                                title: "模型名称",
                                placeholder: "请输入模型名称",
                                value: $viewModel.name,
                                isValid: $viewModel.isNameValid,
                                validationMessage: $viewModel.nameValidationMessage,
                                keyboardType: .default,
                                isSecure: false,
                                maxLength: 50
                            )
                            
                            // 描述输入框
                            FormTextView(
                                title: "模型描述",
                                placeholder: "请输入模型描述（可选）",
                                value: $viewModel.description,
                                isValid: .constant(true),
                                validationMessage: .constant(""),
                                maxLength: 200
                            )
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 24)
                        
                        // 操作按钮
                        VStack(spacing: 12) {
                            // 保存按钮
                            PrimaryButton(
                                title: viewModel.isEditMode ? "保存" : "创建",
                                isLoading: viewModel.isLoading,
                                isDisabled: !viewModel.isFormValid
                            ) {
                                Task {
                                    let success = await viewModel.saveModel()
                                    if success {
                                        // 保存成功，返回上一页
                                        dismiss()
                                    }
                                }
                            }
                            
                            // 取消按钮
                            Button(action: {
                                dismiss()
                            }) {
                                Text("取消")
                                    .font(.body)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.primary)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(Color.gray.opacity(0.1))
                                    .cornerRadius(12)
                            }
                            .disabled(viewModel.isLoading)
                        }
                        .padding(.horizontal, 16)
                        
                        // 成功提示
                        if let successMessage = viewModel.successMessage {
                            SuccessBanner(message: successMessage)
                        }
                        
                        // 错误提示
                        if let errorMessage = viewModel.errorMessage {
                            ErrorBanner(message: errorMessage)
                        }
                    }
                }
                .navigationTitle(viewModel.isEditMode ? "编辑模型" : "创建模型")
                .toolbar {
                    // 保存按钮（导航栏）
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button(action: {
                            Task {
                                let success = await viewModel.saveModel()
                                if success {
                                    dismiss()
                                }
                            }
                        }) {
                            Text(viewModel.isEditMode ? "保存" : "创建")
                                .font(.body)
                                .fontWeight(.bold)
                        }
                        .disabled(!viewModel.isFormValid || viewModel.isLoading)
                    }
                }
                .background(Color.background)
            }
        }
    }
}

// 表单字段视图
struct FormFieldView: View {
    let title: String
    let placeholder: String
    @Binding var value: String
    @Binding var isValid: Bool
    @Binding var validationMessage: String
    let keyboardType: UIKeyboardType
    let isSecure: Bool
    let maxLength: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            if isSecure {
                SecureField(placeholder, text: $value)
                    .font(.body)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(isValid ? Color.clear : Color.red, lineWidth: 1)
                    )
            } else {
                TextField(placeholder, text: $value)
                    .font(.body)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(isValid ? Color.clear : Color.red, lineWidth: 1)
                    )
                    .keyboardType(keyboardType)
                    .autocapitalization(.words)
            }
            
            // 验证消息和字符计数
            HStack {
                if !isValid {
                    Text(validationMessage)
                        .font(.footnote)
                        .foregroundColor(.red)
                }
                
                Spacer()
                
                Text("\(value.count)/\(maxLength)")
                    .font(.footnote)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// 表单文本视图（多行）
struct FormTextView: View {
    let title: String
    let placeholder: String
    @Binding var value: String
    @Binding var isValid: Bool
    @Binding var validationMessage: String
    let maxLength: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            TextEditor(text: $value)
                .font(.body)
                .padding(.horizontal, 12)
                .padding(.vertical, 12)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isValid ? Color.clear : Color.red, lineWidth: 1)
                )
                .frame(height: 120)
                .scrollContentBackground(.hidden)
                .overlay(
                    Text(placeholder)
                        .font(.body)
                        .foregroundColor(.gray)
                        .opacity(value.isEmpty ? 1 : 0)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 18),
                    alignment: .topLeading
                )
            
            // 验证消息和字符计数
            HStack {
                if !isValid {
                    Text(validationMessage)
                        .font(.footnote)
                        .foregroundColor(.red)
                }
                
                Spacer()
                
                Text("\(value.count)/\(maxLength)")
                    .font(.footnote)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// 成功提示横幅
struct SuccessBanner: View {
    let message: String
    
    var body: some View {
        HStack {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.green)
                .padding(.horizontal, 16)
            
            Text(message)
                .font(.body)
                .foregroundColor(.white)
                .padding(.vertical, 12)
            
            Spacer()
        }
        .background(Color.green)
        .frame(height: 44)
        .animation(.slide, value: message)
    }
}

struct CognitiveModelCreateEditView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            // 创建模式预览
            CognitiveModelCreateEditView()
                .environmentObject(AppRouter())
            
            // 编辑模式预览
            CognitiveModelCreateEditView(modelId: "test-model-id")
                .environmentObject(AppRouter())
        }
    }
}
```

### 4.3 CognitiveModelService.swift（扩展）
```swift
extension CognitiveModelServiceProtocol {
    func createModel(request: CognitiveModelRequest) async throws -> CognitiveModel
    func updateModel(id: String, request: CognitiveModelRequest) async throws -> CognitiveModel
}

extension CognitiveModelService {
    func createModel(request: CognitiveModelRequest) async throws -> CognitiveModel {
        let endpoint = APIEndpoint.cognitiveModelCreate
        return try await apiService.request(
            endpoint: endpoint,
            method: .post,
            body: request,
            responseType: CognitiveModel.self
        )
    }
    
    func updateModel(id: String, request: CognitiveModelRequest) async throws -> CognitiveModel {
        let endpoint = APIEndpoint.cognitiveModelUpdate(id: id)
        return try await apiService.request(
            endpoint: endpoint,
            method: .put,
            body: request,
            responseType: CognitiveModel.self
        )
    }
}
```

### 4.4 APIEndpoint.swift（扩展）
```swift
enum AppRoute {
    // 现有路由...
    case cognitiveModelCreate
    case cognitiveModelEdit(id: String)
    // 其他路由...
    
    var requiresAuth: Bool {
        // 所有认知模型相关路由都需要登录
        return true
    }
    
    var view: AnyView {
        switch self {
        // 现有视图...
        case .cognitiveModelCreate:
            return AnyView(CognitiveModelCreateEditView())
        case .cognitiveModelEdit(let id):
            return AnyView(CognitiveModelCreateEditView(modelId: id))
        // 其他视图...
        }
    }
    
    var title: String {
        switch self {
        // 现有标题...
        case .cognitiveModelCreate:
            return "创建认知模型"
        case .cognitiveModelEdit:
            return "编辑认知模型"
        // 其他标题...
        }
    }
}
```

### 4.5 AppRouter.swift（扩展）
```swift
extension AppRouter {
    // 现有代码...
    
    // 导航到创建认知模型页面
    func navigateToCreateModel() {
        navigate(to: .cognitiveModelCreate)
    }
    
    // 导航到编辑认知模型页面
    func navigateToEditModel(id: String) {
        navigate(to: .cognitiveModelEdit(id: id))
    }
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
- ViewModel类名：大驼峰 + ViewModel后缀（CognitiveModelCreateEditViewModel）
- 服务类名：大驼峰 + Service后缀（CognitiveModelService）
- 组件名：大驼峰 + 功能描述（FormFieldView）
- 属性名：小驼峰（isNameValid）

### 6.2 SwiftUI最佳实践
- 使用@StateObject管理ViewModel实例
- 实现组件化设计（FormFieldView, FormTextView）
- 实现实时表单验证
- 提供清晰的验证提示
- 使用环境变量（@Environment(\.dismiss)）实现页面关闭

### 6.3 表单设计最佳实践
- 提供清晰的字段标题和占位符
- 实现实时验证和错误提示
- 限制输入长度
- 提供清晰的提交按钮和状态
- 实现取消按钮功能

### 6.4 错误处理
- 使用自定义错误类型
- 提供用户友好的错误提示
- 实现成功状态反馈
- 记录详细的错误日志

## 7. 项目开发规划

### 7.1 认知模型管理模块开发计划
- **第7天**：认知模型列表实现（已完成）
- **第8天**：认知模型详情实现（已完成）
- **第9天**：认知模型创建和编辑（当前文档）

### 7.2 后续开发重点
- **第10-12天**：语音交互模块开发
  - 第10天：语音识别功能实现
  - 第11天：文本转语音功能实现
  - 第12天：语音交互流程优化
- **第13-15天**：AI对话模块开发
  - 第13天：AI对话界面实现
  - 第14天：AI对话功能实现
  - 第15天：AI对话优化

## 8. 总结

Day 09的核心任务是完成认知模型创建和编辑功能的实现，包括：
- 认知模型创建/编辑页面UI设计和实现
- 认知模型创建/编辑ViewModel的业务逻辑
- 表单验证和错误处理
- 认知模型API服务的创建和更新功能
- 模型创建/编辑后的流程处理

通过这一天的工作，我们实现了认知模型管理模块的完整功能，包括模型列表、详情、创建和编辑。用户现在可以方便地管理自己的认知模型，为后续的语音交互和AI对话功能奠定了基础。

在后续的开发中，我们将开始语音交互模块的开发，实现语音识别、文本转语音和语音交互流程优化等功能。这些功能将使应用更加智能化，提供更好的用户体验。