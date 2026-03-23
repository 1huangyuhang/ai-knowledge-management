import SwiftUI

/// 登录视图
struct LoginView: View {
    // 视图模型
    @StateObject var viewModel: LoginViewModel
    
    // 导航环境
    @EnvironmentObject var navigator: AppNavigator
    
    var body: some View {
        VStack(spacing: 20) {
            // 标题
            Text("AI Voice Interaction")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.primary)
                .padding(.bottom, 40)
            
            // 登录表单
            VStack(spacing: 16) {
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
                }
                
                // 忘记密码
                HStack {
                    Spacer()
                    Text("忘记密码？")
                        .font(.footnote)
                        .foregroundColor(.primary)
                        .onTapGesture {
                            // 实现忘记密码功能
                            print("忘记密码")
                        }
                }
                
                // 错误信息
                if let error = viewModel.error {
                    Text(error)
                        .font(.footnote)
                        .foregroundColor(.error)
                        .multilineTextAlignment(.center)
                }
                
                // 加载指示器
                if viewModel.isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                } else {
                    // 登录按钮
                    Button(action: {
                        viewModel.login()
                    }) {
                        Text("登录")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(viewModel.canLogin ? .primary : .gray)
                            .cornerRadius(8)
                    }
                    .disabled(!viewModel.canLogin)
                }
                
                // 注册链接
                HStack {
                    Text("还没有账号？")
                        .font(.footnote)
                        .foregroundColor(.textSecondary)
                    Button(action: {
                        navigator.navigate(to: .register)
                    }) {
                        Text("立即注册")
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
        .navigationTitle("登录")
        .navigationBarBackButtonHidden(true)
    }
}