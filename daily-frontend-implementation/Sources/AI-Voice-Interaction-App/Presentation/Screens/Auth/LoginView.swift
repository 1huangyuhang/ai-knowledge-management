import SwiftUI

/// 登录视图
struct LoginView: View {
    /// 认证状态管理
    @EnvironmentObject private var authViewModel: AuthViewModel
    /// 导航器
    @EnvironmentObject private var navigator: AppNavigator
    
    /// 登录表单数据
    @State private var username: String = ""
    @State private var password: String = ""
    @State private var isLoading: Bool = false
    @State private var errorMessage: String? = nil
    
    var body: some View {
        VStack(spacing: 20) {
            // 应用标题
            Text("AI 语音交互应用")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding(.top, 60)
                .padding(.bottom, 40)
            
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
            
            // 密码输入框
            SecureField("密码", text: $password)
                .textFieldStyle(.roundedBorder)
                .autocapitalization(.none)
                .disableAutocorrection(true)
            
            // 登录按钮
            Button(action: { login() }) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .foregroundColor(.white)
                } else {
                    Text("登录")
                        .foregroundColor(.white)
                }
            }
            .frame(maxWidth: .infinity, minHeight: 44)
            .background(Color.blue)
            .cornerRadius(8)
            .disabled(isLoading || username.isEmpty || password.isEmpty)
            
            // 注册链接
            HStack {
                Text("还没有账号？")
                    .font(.caption)
                    .foregroundColor(.gray)
                
                Button(action: { navigator.navigate(to: .register) }) {
                    Text("立即注册")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
            
            Spacer()
        }
        .padding(.horizontal, 24)
        .navigationTitle("登录")
        .navigationBarBackButtonHidden(true)
        .onAppear {
            // 清除之前的错误信息
            errorMessage = nil
        }
    }
    
    /// 登录操作
    private func login() {
        isLoading = true
        errorMessage = nil
        
        // 使用authViewModel进行登录
        Task {
            // 先将用户名和密码传递给authViewModel
            authViewModel.username = username
            authViewModel.password = password
            
            // 调用登录方法
            await authViewModel.login()
            
            // 检查登录结果
            if authViewModel.errorMessage != nil {
                errorMessage = authViewModel.errorMessage
            }
            
            isLoading = false
        }
    }
}
