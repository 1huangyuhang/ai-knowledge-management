import SwiftUI

/// 认知模型创建编辑视图
struct CognitiveModelCreateEditView: View {
    /// 视图模型
    @StateObject private var viewModel: CognitiveModelCreateEditViewModel
    /// 导航器
    @EnvironmentObject private var navigator: AppNavigator
    /// 页面关闭环境变量
    @Environment(\.dismiss) private var dismiss
    
    /// 初始化
    /// - Parameter modelId: 模型ID（编辑模式时提供）
    init(modelId: UUID? = nil) {
        _viewModel = StateObject(wrappedValue: CognitiveModelCreateEditViewModel(modelId: modelId))
    }
    
    var body: some View {
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
                        Button(action: {
                            Task {
                                let success = await viewModel.saveModel()
                                if success {
                                    // 保存成功，返回上一页
                                    dismiss()
                                }
                            }
                        }) {
                            if viewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(.circular)
                                    .foregroundColor(.white)
                                    .padding(.vertical, 12)
                                    .frame(maxWidth: .infinity)
                            } else {
                                Text(viewModel.isEditMode ? "保存" : "创建")
                                    .font(.body)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .padding(.vertical, 12)
                                    .frame(maxWidth: .infinity)
                            }
                        }
                        .background(viewModel.isFormValid ? Color.blue : Color.gray)
                        .cornerRadius(12)
                        .disabled(!viewModel.isFormValid || viewModel.isLoading)
                        
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
                        ErrorBanner(message: errorMessage) { }
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
        }
    }
}

/// 表单字段视图
struct FormFieldView: View {
    /// 标题
    let title: String
    /// 占位符
    let placeholder: String
    /// 值绑定
    @Binding var value: String
    /// 是否有效绑定
    @Binding var isValid: Bool
    /// 验证消息绑定
    @Binding var validationMessage: String
    /// 键盘类型
    let keyboardType: UIKeyboardType = .default
    /// 是否安全输入
    let isSecure: Bool = false
    /// 最大长度
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
                    .onChange(of: value) {
                        // 限制输入长度
                        if $0.count > maxLength {
                            value = String($0.prefix(maxLength))
                        }
                    }
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

/// 表单文本视图（多行）
struct FormTextView: View {
    /// 标题
    let title: String
    /// 占位符
    let placeholder: String
    /// 值绑定
    @Binding var value: String
    /// 是否有效绑定
    @Binding var isValid: Bool?
    /// 验证消息绑定
    @Binding var validationMessage: String?
    /// 最大长度
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
                        .stroke((isValid ?? true) ? Color.clear : Color.red, lineWidth: 1)
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
                .onChange(of: value) {
                    // 限制输入长度
                    if $0.count > maxLength {
                        value = String($0.prefix(maxLength))
                    }
                }
            
            // 验证消息和字符计数
            HStack {
                if let validationMessage = validationMessage, !(isValid ?? true) {
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

/// 成功提示横幅
struct SuccessBanner: View {
    /// 成功消息
    let message: String
    
    var body: some View {
        HStack {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.white)
                .padding(.horizontal, 16)
            
            Text(message)
                .font(.body)
                .foregroundColor(.white)
                .padding(.vertical, 12)
            
            Spacer()
        }
        .background(Color.green)
        .frame(height: 44)
        .transition(.slide)
    }
}


