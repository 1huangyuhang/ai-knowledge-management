# Day 05: 注册功能实现 - 代码实现文档

## 1. 项目概述

### 1.1 项目目标
- 实现AI语音交互应用的用户注册功能
- 提供安全可靠的用户注册流程
- 实现注册表单验证和错误处理
- 确保注册成功后的流畅用户体验

### 1.2 核心设计理念
- **用户友好**：提供清晰的表单验证和错误提示
- **安全优先**：密码强度检测和安全存储
- **响应式设计**：适配不同屏幕尺寸
- **MVVM架构**：清晰分离UI、业务逻辑和数据

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

### 3.1 注册页面UI设计

#### 3.1.1 注册页面结构
- 欢迎头部：应用Logo和注册标题
- 注册表单：姓名输入框、邮箱输入框、密码输入框、确认密码输入框
- 密码强度指示器
- 操作按钮：注册按钮、已有账户登录链接
- 隐私政策和服务条款同意勾选

#### 3.1.2 响应式布局
- 适配不同屏幕尺寸（iPhone SE到iPhone Pro Max）
- 支持横竖屏切换
- 遵循系统设计规范

### 3.2 注册ViewModel实现

#### 3.2.1 核心功能
- 表单验证逻辑（姓名、邮箱、密码、确认密码）
- 密码强度检测
- 注册请求处理
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

### 3.3 注册API服务

#### 3.3.1 API端点设计
- **POST** `/api/v1/users`
- 请求参数：name, email, password
- 响应数据：token, userInfo

#### 3.3.2 注册流程
- 发送注册请求
- 验证响应
- 可选：自动登录或跳转到登录页
- 更新认证状态

## 4. 详细代码实现

### 4.1 RegisterViewModel.swift
```swift
import SwiftUI
import Combine

@MainActor
class RegisterViewModel: BaseViewModel, ObservableObject {
    @Published var name: String = ""
    @Published var email: String = ""
    @Published var password: String = ""
    @Published var confirmPassword: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var showPassword: Bool = false
    @Published var showConfirmPassword: Bool = false
    @Published var passwordStrength: PasswordStrength = .weak
    @Published var isTermsAccepted: Bool = false
    
    private let authService: AuthServiceProtocol
    private let keychainService: KeychainServiceProtocol
    
    init(
        authService: AuthServiceProtocol = AuthService(),
        keychainService: KeychainServiceProtocol = KeychainService()
    ) {
        self.authService = authService
        self.keychainService = keychainService
        super.init()
        
        // 监听密码变化，更新密码强度
        $password
            .map { self.calculatePasswordStrength($0) }
            .assign(to: &$passwordStrength)
    }
    
    var isValid: Bool {
        !name.isEmpty &&
        email.contains("@") &&
        !password.isEmpty &&
        password.count >= 6 &&
        password == confirmPassword &&
        isTermsAccepted
    }
    
    func calculatePasswordStrength(_ password: String) -> PasswordStrength {
        guard !password.isEmpty else {
            return .none
        }
        
        var strength = 0
        
        // 长度检查
        if password.count >= 8 {
            strength += 1
        }
        
        // 包含小写字母
        if password.range(of: "[a-z]", options: .regularExpression) != nil {
            strength += 1
        }
        
        // 包含大写字母
        if password.range(of: "[A-Z]", options: .regularExpression) != nil {
            strength += 1
        }
        
        // 包含数字
        if password.range(of: "[0-9]", options: .regularExpression) != nil {
            strength += 1
        }
        
        // 包含特殊字符
        if password.range(of: "[^a-zA-Z0-9]", options: .regularExpression) != nil {
            strength += 1
        }
        
        switch strength {
        case 0...1:
            return .weak
        case 2...3:
            return .medium
        case 4...5:
            return .strong
        default:
            return .none
        }
    }
    
    func register() async {
        guard isValid else {
            errorMessage = "请检查表单填写是否正确"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let registerResponse = try await authService.register(
                name: name,
                email: email,
                password: password
            )
            
            // 注册成功后自动登录
            try keychainService.save(
                value: registerResponse.token,
                forKey: KeychainKeys.authToken
            )
            
            try keychainService.save(
                value: registerResponse.user.id,
                forKey: KeychainKeys.userId
            )
            
            AuthManager.shared.login(with: registerResponse.user)
            
            // 触发注册成功事件
            NotificationCenter.default.post(name: .userRegistered, object: nil)
        } catch let error as APIError {
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = "注册失败，请重试"
        } finally {
            isLoading = false
        }
    }
    
    func togglePasswordVisibility() {
        showPassword.toggle()
    }
    
    func toggleConfirmPasswordVisibility() {
        showConfirmPassword.toggle()
    }
}

enum PasswordStrength {
    case none, weak, medium, strong
    
    var color: Color {
        switch self {
        case .none:
            return .gray
        case .weak:
            return .red
        case .medium:
            return .orange
        case .strong:
            return .green
        }
    }
    
    var text: String {
        switch self {
        case .none:
            return ""
        case .weak:
            return "弱"
        case .medium:
            return "中"
        case .strong:
            return "强"
        }
    }
}
```

### 4.2 RegisterView.swift
```swift
import SwiftUI

struct RegisterView: View {
    @StateObject private var viewModel = RegisterViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    
    var body: some View {
        AppContainer {
            ScrollView {
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
                        Text("创建新账户")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 32)
                    
                    // 注册表单
                    VStack(spacing: 16) {
                        // 姓名输入框
                        AppTextField(
                            placeholder: "姓名",
                            text: $viewModel.name,
                            keyboardType: .default,
                            isSecure: false
                        )
                        
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
                        
                        // 密码强度指示器
                        HStack {
                            Text("密码强度：")
                                .font(.footnote)
                                .foregroundColor(.secondary)
                            Text(viewModel.passwordStrength.text)
                                .font(.footnote)
                                .foregroundColor(viewModel.passwordStrength.color)
                            Spacer()
                        }
                        
                        // 密码强度进度条
                        GeometryReader { geometry in
                            HStack(spacing: 4) {
                                ForEach(0..<5) { index in
                                    Rectangle()
                                        .frame(width: (geometry.size.width - 16) / 5)
                                        .height(4)
                                        .cornerRadius(2)
                                        .foregroundColor(
                                            index < viewModel.passwordStrength.rawValue ? 
                                            viewModel.passwordStrength.color : Color.gray.opacity(0.3)
                                        )
                                }
                            }
                        }
                        .frame(height: 4)
                        
                        // 确认密码输入框
                        ZStack(alignment: .trailing) {
                            AppTextField(
                                placeholder: "确认密码",
                                text: $viewModel.confirmPassword,
                                keyboardType: .default,
                                isSecure: !viewModel.showConfirmPassword
                            )
                            
                            Button(action: viewModel.toggleConfirmPasswordVisibility) {
                                Image(systemName: viewModel.showConfirmPassword ? "eye.slash" : "eye")
                                    .foregroundColor(.secondary)
                                    .padding(.trailing, 16)
                            }
                        }
                        
                        // 密码不匹配提示
                        if viewModel.password != viewModel.confirmPassword && !viewModel.confirmPassword.isEmpty {
                            Text("两次输入的密码不匹配")
                                .font(.footnote)
                                .foregroundColor(.red)
                        }
                        
                        // 隐私政策同意
                        HStack {
                            Button(action: { viewModel.isTermsAccepted.toggle() }) {
                                Image(systemName: viewModel.isTermsAccepted ? "checkmark.square.fill" : "square")
                                    .foregroundColor(viewModel.isTermsAccepted ? .primary : .secondary)
                            }
                            .buttonStyle(.plain)
                            
                            Text("我已阅读并同意")
                                .font(.body)
                                .foregroundColor(.secondary)
                            
                            Button(action: { /* 导航到隐私政策页面 */ }) {
                                Text("隐私政策")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                    .underline()
                            }
                            .buttonStyle(.plain)
                            
                            Text("和")
                                .font(.body)
                                .foregroundColor(.secondary)
                            
                            Button(action: { /* 导航到服务条款页面 */ }) {
                                Text("服务条款")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                    .underline()
                            }
                            .buttonStyle(.plain)
                        }
                        .padding(.vertical, 8)
                        
                        // 注册按钮
                        PrimaryButton(
                            title: "注册",
                            isLoading: viewModel.isLoading,
                            isDisabled: !viewModel.isValid
                        ) {
                            Task {
                                await viewModel.register()
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
                    
                    // 登录链接
                    HStack {
                        Text("已有账户?")
                            .font(.body)
                            .foregroundColor(.secondary)
                        Button(action: { appRouter.navigate(to: .login) }) {
                            Text("立即登录")
                                .font(.body)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                                .underline()
                        }
                    }
                    .padding(.bottom, 32)
                }
                .padding(.horizontal, 24)
            }
            .navigationTitle("")
            .navigationBarHidden(true)
        }
        .background(Color.background)
    }
}

struct RegisterView_Previews: PreviewProvider {
    static var previews: some View {
        RegisterView()
            .environmentObject(AppRouter())
    }
}
```

### 4.3 AuthService.swift（扩展）
```swift
extension AuthServiceProtocol {
    func register(name: String, email: String, password: String) async throws -> LoginResponse
}

extension AuthService {
    func register(name: String, email: String, password: String) async throws -> LoginResponse {
        let endpoint = APIEndpoint.register
        let requestBody = [
            "name": name,
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
            if error.statusCode == 409 {
                throw AuthServiceError.emailAlreadyExists
            } else {
                throw error
            }
        } catch {
            throw AuthServiceError.networkError
        }
    }
}

extension AuthServiceError {
    case emailAlreadyExists
    
    var errorDescription: String? {
        switch self {
        // 现有错误描述...
        case .emailAlreadyExists:
            return "该邮箱已被注册"
        // 其他错误描述...
        }
    }
}
```

### 4.4 APIEndpoint.swift（扩展）
```swift
enum APIEndpoint {
    // 现有端点...
    case register
    // 其他认证端点...
    
    var path: String {
        switch self {
        // 现有路径...
        case .register:
            return "/api/v1/users"
        // 其他路径...
        }
    }
}
```

### 4.5 NotificationName.swift（扩展）
```swift
extension Notification.Name {
    static let userRegistered = Notification.Name("userRegistered")
}
```

### 4.6 AppRouter.swift（扩展）
```swift
enum AppRoute {
    // 现有路由...
    case register
    // 其他路由...
    
    var view: AnyView {
        switch self {
        // 现有视图...
        case .register:
            return AnyView(RegisterView())
        // 其他视图...
        }
    }
}
```

## 5. 开发环境配置

### 5.1 Xcode设置
1. 确保Xcode版本为15.0+
2. 配置好Keychain共享权限（与登录功能相同）
3. 配置好网络请求权限

### 5.2 Info.plist配置
- 保持与登录功能相同的Info.plist配置

## 6. 代码规范与最佳实践

### 6.1 命名规范
- ViewModel类名：大驼峰 + ViewModel后缀（RegisterViewModel）
- 枚举类型：大驼峰（PasswordStrength）
- 属性名：小驼峰（passwordStrength）
- 方法名：小驼峰（calculatePasswordStrength）

### 6.2 SwiftUI最佳实践
- 使用@StateObject管理ViewModel实例
- 使用ScrollView处理长表单
- 实现实时表单验证和错误提示
- 提供清晰的视觉反馈（密码强度指示器）

### 6.3 安全最佳实践
- 实现密码强度检测
- 确保密码和确认密码匹配
- 使用HTTPS进行注册请求
- 不在客户端存储敏感信息（除了Keychain）

### 6.4 错误处理
- 使用自定义错误类型（AuthServiceError.emailAlreadyExists）
- 提供用户友好的错误提示
- 记录详细的错误日志

## 7. 项目开发规划

### 7.1 认证模块开发计划
- **第4天**：登录功能实现（已完成）
- **第5天**：注册功能实现（当前文档）
- **第6天**：认证状态管理和路由守卫

### 7.2 后续开发重点
- 实现认证状态的持久化管理
- 实现路由守卫，保护需要登录的页面
- 实现Token刷新机制
- 实现忘记密码功能

## 8. 总结

Day 05的核心任务是完成注册功能的实现，包括：
- 注册页面UI设计和实现
- 注册ViewModel的业务逻辑
- 注册API服务的实现
- 密码强度检测
- 表单验证和错误处理
- 注册成功后的自动登录流程

通过这一天的工作，我们实现了用户注册的完整流程，从UI到业务逻辑再到API服务，形成了一个完整的用户注册体系。注册功能是应用的重要入口，为新用户提供了便捷的注册方式。

在后续的开发中，我们将继续完善认证模块，实现认证状态管理和路由守卫，确保应用的安全性和用户体验。同时，我们将开始开发核心功能模块，包括语音交互和AI对话功能。