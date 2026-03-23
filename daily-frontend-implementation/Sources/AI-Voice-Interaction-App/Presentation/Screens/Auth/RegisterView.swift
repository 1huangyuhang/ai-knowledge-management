import SwiftUI

/// 注册视图
struct RegisterView: View {
    /// 认证状态管理
    @EnvironmentObject private var authViewModel: AuthViewModel
    /// 导航器
    @EnvironmentObject private var navigator: AppNavigator
    
    /// 注册表单数据
    @State private var username: String = ""
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var confirmPassword: String = ""
    @State private var isLoading: Bool = false
    @State private var errorMessage: String? = nil
    
    var body: some View {
        VStack(spacing: 20) {
            // 应用标题
            Text("AI 语音交互应用")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding(.top, 40)
                .padding(.bottom, 30)
            
            // 错误信息显示
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            
            // 用户名输入框
            TextField("用户名", text: $username)
                .textFieldStyle(.roundedBorder)
                .autocapitalization(.none)
                .disableAutocorrection(true)
            
            // 邮箱输入框
            TextField("邮箱", text: $email)
                .textFieldStyle(.roundedBorder)
                .autocapitalization(.none)
                .disableAutocorrection(true)
            
            // 密码输入框
            SecureField("密码", text: $password)
                .textFieldStyle(.roundedBorder)
                .autocapitalization(.none)
                .disableAutocorrection(true)
            
            // 确认密码输入框
            SecureField("确认密码", text: $confirmPassword)
                .textFieldStyle(.roundedBorder)
                .autocapitalization(.none)
                .disableAutocorrection(true)
            
            // 注册按钮
            Button(action: { register() }) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .foregroundColor(.white)
                } else {
                    Text("注册")
                        .foregroundColor(.white)
                }
            }
            .frame(maxWidth: .infinity, minHeight: 44)
            .background(Color.blue)
            .cornerRadius(8)
            .disabled(isLoading || !isFormValid)
            
            // 登录链接
            HStack {
                Text("已有账号？")
                    .font(.caption)
                    .foregroundColor(.gray)
                
                Button(action: { navigator.pop() }) {
                    Text("立即登录")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
            
            Spacer()
        }
        .padding(.horizontal, 24)
        .navigationTitle("注册")
        .onAppear {
            // 清除之前的错误信息
            errorMessage = nil
        }
    }
    
    /// 表单是否有效
    private var isFormValid: Bool {
        !username.isEmpty &&
        !email.isEmpty &&
        !password.isEmpty &&
        !confirmPassword.isEmpty &&
        password == confirmPassword &&
        password.count >= 6
    }
    
    /// 注册操作
    private func register() {
        isLoading = true
        errorMessage = nil
        
        // 使用authViewModel进行注册
        Task {
            await authViewModel.register()
            
            if authViewModel.isAuthenticated {
                // 注册成功，返回登录页面
                navigator.pop()
            } else if let errorMessage = authViewModel.errorMessage {
                // 注册失败，显示错误信息
                self.errorMessage = errorMessage
            }
            
            isLoading = false
        }
    }
}
