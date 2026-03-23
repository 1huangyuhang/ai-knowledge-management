import SwiftUI

/// 注册视图
struct RegisterView: View {
    // 视图模型
    @StateObject var viewModel: RegisterViewModel
    
    // 导航环境
    @EnvironmentObject var navigator: AppNavigator
    
    var body: some View {
        VStack(spacing: 20) {
            // 标题
            Text("创建账号")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.primary)
                .padding(.bottom, 40)
            
            // 注册表单
            VStack(spacing: 16) {
                // 用户名输入框
                VStack(alignment: .leading, spacing: 8) {
                    Text("用户名")
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                    TextField("请输入用户名", text: $viewModel.username)
                        .padding()
                        .background(Color.border)
                        .cornerRadius(8)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(viewModel.isUsernameValid ? .success : .error, lineWidth: 2)
                        )
                }
                
                // 邮箱输入框
                VStack(alignment: .leading, spacing: 8) {
                    Text("邮箱")
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                    TextField("请输入邮箱", text: $viewModel.email)
                        .padding()
                        .background(Color.border)
                        .cornerRadius(8)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(viewModel.isEmailValid ? .success : .error, lineWidth: 2)
                        )
                }
                
                // 密码输入框
                VStack(alignment: .leading, spacing: 8) {
                    Text("密码")
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                    SecureField("请输入密码", text: $viewModel.password)
                        .padding()
                        .background(Color.border)
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(viewModel.isPasswordValid ? .success : .error, lineWidth: 2)
                        )
                    Text("密码长度至少6个字符")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }
                
                // 确认密码输入框
                VStack(alignment: .leading, spacing: 8) {
                    Text("确认密码")
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                    SecureField("请再次输入密码", text: $viewModel.confirmPassword)
                        .padding()
                        .background(Color.border)
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(viewModel.doPasswordsMatch ? .success : .error, lineWidth: 2)
                        )
                    Text(viewModel.doPasswordsMatch ? "密码匹配" : "密码不匹配")
                        .font(.caption)
                        .foregroundColor(viewModel.doPasswordsMatch ? .success : .error)
                }
                
                // 错误信息
                if let error = viewModel.error {
                    Text(error)
                        .font(.footnote)
                        .foregroundColor(.error)
                        .multilineTextAlignment(.center)
                }
                
                // 成功信息
                if let successMessage = viewModel.successMessage {
                    Text(successMessage)
                        .font(.footnote)
                        .foregroundColor(.success)
                        .multilineTextAlignment(.center)
                }
                
                // 加载指示器
                if viewModel.isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                } else {
                    // 注册按钮
                    Button(action: {
                        viewModel.register()
                    }) {
                        Text("注册")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(viewModel.canRegister ? .primary : .gray)
                            .cornerRadius(8)
                    }
                    .disabled(!viewModel.canRegister)
                }
                
                // 登录链接
                HStack {
                    Text("已有账号？")
                        .font(.footnote)
                        .foregroundColor(.textSecondary)
                    Button(action: {
                        navigator.pop()
                    }) {
                        Text("立即登录")
                            .font(.footnote)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                    }
                }
            }
            
            Spacer()
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.background)
        .navigationTitle("注册")
    }
}