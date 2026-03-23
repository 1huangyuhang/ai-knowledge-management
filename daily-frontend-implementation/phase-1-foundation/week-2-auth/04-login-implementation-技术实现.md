# Day 04: 登录功能实现 - 代码实现文档

## 1. 项目概述

### 1.1 项目目标
- 实现AI语音交互应用的用户登录功能
- 提供安全可靠的认证机制
- 实现登录状态的持久化管理
- 确保用户体验流畅和直观

### 1.2 核心设计理念
- **安全优先**：使用Keychain存储敏感信息
- **响应式设计**：基于SwiftUI实现流畅的登录体验
- **MVVM架构**：清晰分离UI、业务逻辑和数据
- **可测试性**：核心逻辑可独立测试

## 2. 技术栈选型

### 2.1 核心技术
- **Swift 5.9+**：开发语言
- **SwiftUI 5.0+**：UI框架
- **Combine**：响应式编程
- **Keychain Services API**：安全存储
- **URLSession + Async/Await**：网络请求

### 2.2 第三方依赖
- **Alamofire 5.8.1**：网络请求封装
- **SwiftLint 0.54.0**：代码质量检查

## 3. 核心功能实现

### 3.1 登录页面UI设计

#### 3.1.1 登录页面结构
- 欢迎头部：应用Logo和名称
- 登录表单：邮箱输入框、密码输入框
- 操作按钮：登录按钮、忘记密码链接、注册链接
- 社交登录选项（预留）

#### 3.1.2 响应式布局
- 适配不同屏幕尺寸（iPhone SE到iPhone Pro Max）
- 支持横竖屏切换
- 遵循系统设计规范

### 3.2 登录ViewModel实现

#### 3.2.1 核心功能
- 表单验证逻辑
- 登录请求处理
- 状态管理（加载中、成功、失败）
- 错误处理

#### 3.2.2 数据流设计
```
用户输入 → View → ViewModel → API Service → 后端
                                     ↓
                                 状态更新 ← 错误处理
                                     ↓
                                 View 更新
```

### 3.3 登录API服务

#### 3.3.1 API端点设计
- **POST** `/api/v1/sessions`
- 请求参数：email, password
- 响应数据：token, userInfo

#### 3.3.2 认证流程
- 发送登录请求
- 验证响应
- 存储Token到Keychain
- 更新认证状态

## 4. 详细代码实现

### 4.1 LoginViewModel.swift
```swift
import SwiftUI
import Combine

@MainActor
class LoginViewModel: BaseViewModel, ObservableObject {
    @Published var email: String = ""
    @Published var password: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var showPassword: Bool = false
    
    private let authService: AuthServiceProtocol
    private let keychainService: KeychainServiceProtocol
    
    init(
        authService: AuthServiceProtocol = AuthService(),
        keychainService: KeychainServiceProtocol = KeychainService()
    ) {
        self.authService = authService
        self.keychainService = keychainService
    }
    
    var isValid: Bool {
        !email.isEmpty && email.contains("@") && !password.isEmpty && password.count >= 6
    }
    
    func login() async {
        guard isValid else {
            errorMessage = "请输入有效的邮箱和密码"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let loginResponse = try await authService.login(
                email: email,
                password: password
            )
            
            // 存储Token到Keychain
            try keychainService.save(
                value: loginResponse.token,
                forKey: KeychainKeys.authToken
            )
            
            // 存储用户信息
            try keychainService.save(
                value: loginResponse.user.id,
                forKey: KeychainKeys.userId
            )
            
            // 更新全局认证状态
            AuthManager.shared.login(with: loginResponse.user)
            
            // 触发登录成功事件
            NotificationCenter.default.post(name: .userLoggedIn, object: nil)
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "登录失败，请重试"
        } finally {
            isLoading = false
        }
    }
    
    func togglePasswordVisibility() {
        showPassword.toggle()
    }
}
```

### 4.2 LoginView.swift
```swift
import SwiftUI

struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    
    var body: some View {
        AppContainer {
            VStack(spacing: 24) {
                // 欢迎头部
                VStack(spacing: 12) {
                    Image(systemName: "mic.fill")
                        .resizable()
                        .frame(width: 64, height: 64)
                        .foregroundColor(.primary)
                    Text("AI Voice Interaction")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    Text("登录您的账户")
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 32)
                
                // 登录表单
                VStack(spacing: 16) {
                    // 邮箱输入框
                    AppTextField(
                        placeholder: "邮箱",
                        text: $viewModel.email,
                        keyboardType: .emailAddress,
                        isSecure: false
                    )
                    .autocapitalization(.none)
                    .autocorrectionDisabled()
                    
                    // 密码输入框
                    ZStack(alignment: .trailing) {
                        AppTextField(
                            placeholder: "密码",
                            text: $viewModel.password,
                            keyboardType: .default,
                            isSecure: !viewModel.showPassword
                        )
                        
                        Button(action: viewModel.togglePasswordVisibility) {
                            Image(systemName: viewModel.showPassword ? "eye.slash" : "eye")
                                .foregroundColor(.secondary)
                                .padding(.trailing, 16)
                        }
                    }
                    
                    // 忘记密码链接
                    HStack {
                        Spacer()
                        Button(action: { /* 导航到忘记密码页面 */ }) {
                            Text("忘记密码?")
                                .font(.body)
                                .foregroundColor(.primary)
                                .underline()
                        }
                    }
                    
                    // 登录按钮
                    PrimaryButton(
                        title: "登录",
                        isLoading: viewModel.isLoading,
                        isDisabled: !viewModel.isValid
                    ) {
                        Task {
                            await viewModel.login()
                        }
                    }
                    
                    // 错误提示
                    if let errorMessage = viewModel.errorMessage {
                        Text(errorMessage)
                            .font(.footnote)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.top, 16)
                
                Spacer()
                
                // 注册链接
                HStack {
                    Text("还没有账户?")
                        .font(.body)
                        .foregroundColor(.secondary)
                    Button(action: { appRouter.navigate(to: .register) }) {
                        Text("立即注册")
                            .font(.body)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                    }
                }
                .padding(.bottom, 32)
            }
            .padding(.horizontal, 24)
            .navigationTitle("")
            .navigationBarHidden(true)
        }
        .background(Color.background)
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
            .environmentObject(AppRouter())
    }
}
```

### 4.3 AuthService.swift
```swift
import Foundation

protocol AuthServiceProtocol {
    func login(email: String, password: String) async throws -> LoginResponse
    func logout() async throws
}

enum AuthServiceError: LocalizedError {
    case invalidCredentials
    case serverError
    case networkError
    
    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "邮箱或密码错误"
        case .serverError:
            return "服务器错误，请稍后重试"
        case .networkError:
            return "网络错误，请检查您的网络连接"
        }
    }
}

struct AuthService: AuthServiceProtocol {
    private let apiService: APIServiceProtocol
    
    init(apiService: APIServiceProtocol = APIService()) {
        self.apiService = apiService
    }
    
    func login(email: String, password: String) async throws -> LoginResponse {
        let endpoint = APIEndpoint.login
        let requestBody = [
            "email": email,
            "password": password
        ]
        
        do {
            return try await apiService.request(
                endpoint: endpoint,
                method: .post,
                body: requestBody,
                responseType: LoginResponse.self
            )
        } catch let error as APIError {
            if error.statusCode == 401 {
                throw AuthServiceError.invalidCredentials
            } else {
                throw error
            }
        } catch {
            throw AuthServiceError.networkError
        }
    }
    
    func logout() async throws {
        let endpoint = APIEndpoint.logout
        try await apiService.request(
            endpoint: endpoint,
            method: .post,
            responseType: EmptyResponse.self
        )
    }
}
```

### 4.4 APIEndpoint.swift（扩展）
```swift
enum APIEndpoint {
    // 现有端点...
    case login
    case logout
    // 其他认证端点...
    
    var path: String {
        switch self {
        // 现有路径...
        case .login:
            return "/api/v1/sessions"
        case .logout:
            return "/api/v1/sessions/logout"
        // 其他路径...
        }
    }
}
```

### 4.5 AuthManager.swift
```swift
import Foundation

class AuthManager {
    static let shared = AuthManager()
    
    @Published var currentUser: User? = nil
    
    private init() {
        // 初始化时检查是否已有登录状态
        loadUserFromKeychain()
    }
    
    func login(with user: User) {
        currentUser = user
    }
    
    func logout() {
        currentUser = nil
        // 清除Keychain中的Token
        KeychainService().delete(forKey: KeychainKeys.authToken)
        KeychainService().delete(forKey: KeychainKeys.userId)
    }
    
    var isLoggedIn: Bool {
        currentUser != nil
    }
    
    private func loadUserFromKeychain() {
        // 从Keychain加载用户信息（如果需要）
        // 这里简化处理，实际应用中可能需要从服务器获取最新用户信息
    }
}
```

## 5. 开发环境配置

### 5.1 Xcode设置
1. 确保Xcode版本为15.0+
2. 配置好Keychain共享权限
3. 配置好网络请求权限

### 5.2 Keychain共享配置
1. 在Xcode中，选择项目 > Targets > AI Voice Interaction App > Signing & Capabilities
2. 点击"+"号，添加"Keychain Sharing" capability
3. 添加访问组：`$(AppIdentifierPrefix)com.example.AIVoiceInteractionApp`

### 5.3 Info.plist配置
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

## 6. 代码规范与最佳实践

### 6.1 命名规范
- ViewModel类名：大驼峰 + ViewModel后缀（LoginViewModel）
- Service类名：大驼峰 + Service后缀（AuthService）
- 协议名：大驼峰 + Protocol后缀（AuthServiceProtocol）
- 常量名：大驼峰 + 描述性名称（KeychainKeys）

### 6.2 SwiftUI最佳实践
- 使用@StateObject管理ViewModel实例
- 使用@EnvironmentObject共享全局状态
- 实现PreviewProvider便于预览
- 使用ViewModifier封装可复用样式

### 6.3 安全最佳实践
- 敏感信息（如Token）必须存储在Keychain中
- 密码输入框必须使用安全文本输入
- 登录请求必须使用HTTPS
- 实现Token过期自动刷新机制

### 6.4 错误处理
- 使用自定义错误类型（AuthServiceError）
- 提供用户友好的错误提示
- 记录详细的错误日志
- 实现错误恢复机制

## 7. 项目开发规划

### 7.1 认证模块开发计划
- **第4天**：登录功能实现（当前文档）
- **第5天**：注册功能实现
- **第6天**：认证状态管理和路由守卫

### 7.2 后续开发重点
- 实现注册功能
- 实现认证状态的持久化管理
- 实现路由守卫，保护需要登录的页面
- 实现Token刷新机制

## 8. 总结

Day 04的核心任务是完成登录功能的实现，包括：
- 登录页面UI设计和实现
- 登录ViewModel的业务逻辑
- 登录API服务的实现
- 认证状态管理
- Keychain安全存储

通过这一天的工作，我们实现了用户登录的完整流程，从UI到业务逻辑再到API服务，形成了一个完整的认证体系。登录功能是应用的基础，为后续的核心功能提供了安全保障。

在后续的开发中，我们将继续完善认证模块，实现注册功能、认证状态管理和路由守卫，确保应用的安全性和用户体验。