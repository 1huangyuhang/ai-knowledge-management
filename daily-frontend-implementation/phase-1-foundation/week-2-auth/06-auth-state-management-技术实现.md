# Day 06: 认证状态管理和路由守卫 - 代码实现文档

## 1. 项目概述

### 1.1 项目目标
- 实现全局认证状态管理
- 实现路由守卫，保护需要登录的页面
- 实现Token刷新机制
- 实现登出功能
- 确保认证状态的持久化

### 1.2 核心设计理念
- **集中式状态管理**：统一管理认证状态，便于维护和扩展
- **路由守卫**：保护需要登录的页面，自动重定向未登录用户
- **Token自动刷新**：提高用户体验，避免频繁登录
- **安全优先**：确保认证状态的安全性和可靠性

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

### 3.1 全局认证状态管理

#### 3.1.1 核心功能
- 集中管理用户认证状态
- 提供全局访问点
- 支持状态变化监听
- 实现认证状态持久化

#### 3.1.2 设计思路
- 使用单例模式实现全局访问
- 使用@Published属性实现响应式状态更新
- 结合Keychain实现状态持久化
- 提供清晰的登录/登出API

### 3.2 路由守卫实现

#### 3.2.1 核心功能
- 保护需要登录的页面
- 自动重定向未登录用户到登录页
- 支持自定义重定向规则
- 提供清晰的路由配置API

#### 3.2.2 设计思路
- 基于NavigationStack实现
- 使用EnvironmentObject共享认证状态
- 实现自定义路由栈管理
- 支持动态路由权限检查

### 3.3 Token刷新机制

#### 3.3.1 核心功能
- 自动检测Token过期
- 实现Token自动刷新
- 处理刷新失败情况
- 确保请求队列的正确性

#### 3.3.2 设计思路
- 拦截网络请求
- 检查Token过期时间
- 实现刷新请求队列
- 确保刷新过程的线程安全

### 3.4 登出功能实现

#### 3.4.1 核心功能
- 清除本地认证状态
- 调用后端登出API
- 清除本地缓存数据
- 重定向到登录页

#### 3.4.2 设计思路
- 实现统一的登出流程
- 确保所有相关数据被清除
- 提供优雅的用户体验

## 4. 详细代码实现

### 4.1 AuthManager.swift（扩展）
```swift
import Foundation
import Combine

class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var currentUser: User? = nil
    @Published var isRefreshingToken: Bool = false
    
    private var cancellables = Set<AnyCancellable>()
    private let keychainService: KeychainServiceProtocol
    private let authService: AuthServiceProtocol
    private var tokenRefreshService: TokenRefreshServiceProtocol
    
    private init() {
        self.keychainService = KeychainService()
        self.authService = AuthService()
        self.tokenRefreshService = TokenRefreshService(
            keychainService: keychainService,
            authService: authService
        )
        
        // 初始化时检查是否已有登录状态
        loadUserFromKeychain()
        
        // 监听Token过期，自动刷新
        tokenRefreshService.$isRefreshing
            .assign(to: &$isRefreshingToken)
        
        // 监听Token刷新失败，自动登出
        tokenRefreshService.$refreshFailed
            .sink {[weak self] refreshFailed in
                if refreshFailed {
                    self?.logout()
                }
            }
            .store(in: &cancellables)
    }
    
    func login(with user: User) {
        currentUser = user
        tokenRefreshService.startTokenRefreshTimer()
    }
    
    func logout() {
        Task {
            // 调用后端登出API
            try? await authService.logout()
            
            // 清除本地认证状态
            await MainActor.run {
                currentUser = nil
                tokenRefreshService.stopTokenRefreshTimer()
            }
            
            // 清除Keychain中的Token
            try? keychainService.delete(forKey: KeychainKeys.authToken)
            try? keychainService.delete(forKey: KeychainKeys.userId)
            try? keychainService.delete(forKey: KeychainKeys.refreshToken)
            
            // 清除本地缓存数据
            try? UserDefaults.standard.removePersistentDomain(forName: Bundle.main.bundleIdentifier!)
            
            // 触发登出事件
            NotificationCenter.default.post(name: .userLoggedOut, object: nil)
        }
    }
    
    var isLoggedIn: Bool {
        currentUser != nil
    }
    
    private func loadUserFromKeychain() {
        Task {
            do {
                // 从Keychain加载Token
                let token = try keychainService.getValue(forKey: KeychainKeys.authToken) as? String
                let userId = try keychainService.getValue(forKey: KeychainKeys.userId) as? String
                
                if let token = token, let userId = userId {
                    // 调用后端获取用户信息
                    let user = try await authService.getUserInfo()
                    await MainActor.run {
                        currentUser = user
                        tokenRefreshService.startTokenRefreshTimer()
                    }
                }
            } catch {
                // 清除无效的Token
                try? keychainService.delete(forKey: KeychainKeys.authToken)
                try? keychainService.delete(forKey: KeychainKeys.userId)
                try? keychainService.delete(forKey: KeychainKeys.refreshToken)
            }
        }
    }
}

extension Notification.Name {
    static let userLoggedOut = Notification.Name("userLoggedOut")
}
```

### 4.2 AuthService.swift（扩展）
```swift
extension AuthServiceProtocol {
    func getUserInfo() async throws -> User
    func refreshToken() async throws -> TokenResponse
}

extension AuthService {
    func getUserInfo() async throws -> User {
        let endpoint = APIEndpoint.userInfo
        return try await apiService.request(
            endpoint: endpoint,
            method: .get,
            responseType: User.self
        )
    }
    
    func refreshToken() async throws -> TokenResponse {
        let endpoint = APIEndpoint.refreshToken
        return try await apiService.request(
            endpoint: endpoint,
            method: .post,
            responseType: TokenResponse.self
        )
    }
}
```

### 4.3 TokenRefreshService.swift
```swift
import Foundation
import Combine

protocol TokenRefreshServiceProtocol {
    var isRefreshing: Bool { get }
    var refreshFailed: Bool { get }
    func startTokenRefreshTimer()
    func stopTokenRefreshTimer()
}

class TokenRefreshService: TokenRefreshServiceProtocol, ObservableObject {
    @Published private(set) var isRefreshing: Bool = false
    @Published private(set) var refreshFailed: Bool = false
    
    private var refreshTimer: Timer?
    private let refreshInterval: TimeInterval = 30 * 60 // 30分钟
    private let keychainService: KeychainServiceProtocol
    private let authService: AuthServiceProtocol
    
    init(
        keychainService: KeychainServiceProtocol,
        authService: AuthServiceProtocol
    ) {
        self.keychainService = keychainService
        self.authService = authService
    }
    
    func startTokenRefreshTimer() {
        // 清除现有定时器
        stopTokenRefreshTimer()
        
        // 创建新定时器
        refreshTimer = Timer.scheduledTimer(
            timeInterval: refreshInterval,
            target: self,
            selector: #selector(refreshToken),
            userInfo: nil,
            repeats: true
        )
        
        // 立即执行一次刷新
        refreshToken()
    }
    
    func stopTokenRefreshTimer() {
        refreshTimer?.invalidate()
        refreshTimer = nil
    }
    
    @objc private func refreshToken() {
        Task {
            await refreshTokenAsync()
        }
    }
    
    @MainActor
    private func refreshTokenAsync() {
        guard !isRefreshing else { return }
        
        isRefreshing = true
        refreshFailed = false
        
        Task {
            do {
                let tokenResponse = try await authService.refreshToken()
                
                // 更新Keychain中的Token
                try keychainService.save(
                    value: tokenResponse.accessToken,
                    forKey: KeychainKeys.authToken
                )
                
                if let refreshToken = tokenResponse.refreshToken {
                    try keychainService.save(
                        value: refreshToken,
                        forKey: KeychainKeys.refreshToken
                    )
                }
                
                await MainActor.run {
                    isRefreshing = false
                }
            } catch {
                await MainActor.run {
                    isRefreshing = false
                    refreshFailed = true
                }
            }
        }
    }
}

struct TokenResponse: Codable {
    let accessToken: String
    let refreshToken: String?
    let expiresIn: Int
}
```

### 4.4 AppRouter.swift（扩展）
```swift
enum AppRoute {
    // 公共路由
    case welcome
    case login
    case register
    case forgotPassword
    
    // 需要登录的路由
    case home
    case cognitiveModelList
    case cognitiveModelDetail(id: String)
    case voiceInteraction
    case aiChat
    case analysis
    case settings
    
    // 路由属性
    var requiresAuth: Bool {
        switch self {
        case .welcome, .login, .register, .forgotPassword:
            return false
        default:
            return true
        }
    }
    
    var view: AnyView {
        switch self {
        case .welcome:
            return AnyView(WelcomeView())
        case .login:
            return AnyView(LoginView())
        case .register:
            return AnyView(RegisterView())
        case .forgotPassword:
            return AnyView(ForgotPasswordView())
        case .home:
            return AnyView(HomeView())
        case .cognitiveModelList:
            return AnyView(CognitiveModelListView())
        case .cognitiveModelDetail(let id):
            return AnyView(CognitiveModelDetailView(modelId: id))
        case .voiceInteraction:
            return AnyView(VoiceInteractionView())
        case .aiChat:
            return AnyView(AIChatView())
        case .analysis:
            return AnyView(AnalysisView())
        case .settings:
            return AnyView(SettingsView())
        }
    }
    
    var title: String {
        switch self {
        case .welcome:
            return "欢迎"
        case .login:
            return "登录"
        case .register:
            return "注册"
        case .forgotPassword:
            return "忘记密码"
        case .home:
            return "首页"
        case .cognitiveModelList:
            return "认知模型列表"
        case .cognitiveModelDetail:
            return "认知模型详情"
        case .voiceInteraction:
            return "语音交互"
        case .aiChat:
            return "AI对话"
        case .analysis:
            return "分析结果"
        case .settings:
            return "设置"
        }
    }
}

extension AppRouter {
    func navigateToInitialRoute() {
        if AuthManager.shared.isLoggedIn {
            navigate(to: .home)
        } else {
            navigate(to: .welcome)
        }
    }
    
    func navigate(to route: AppRoute) {
        // 检查路由是否需要登录
        if route.requiresAuth && !AuthManager.shared.isLoggedIn {
            // 未登录用户尝试访问需要登录的页面，重定向到登录页
            setRoutes([.login])
            return
        }
        
        // 已登录用户尝试访问登录相关页面，重定向到首页
        if !route.requiresAuth && AuthManager.shared.isLoggedIn && route != .welcome {
            setRoutes([.home])
            return
        }
        
        // 正常导航
        setRoutes([route])
    }
    
    func push(route: AppRoute) {
        // 检查路由是否需要登录
        if route.requiresAuth && !AuthManager.shared.isLoggedIn {
            // 未登录用户尝试访问需要登录的页面，重定向到登录页
            setRoutes([.login])
            return
        }
        
        // 正常推送
        addRoute(route)
    }
}
```

### 4.5 NavigationStackWithGuard.swift
```swift
import SwiftUI

struct NavigationStackWithGuard: View {
    @EnvironmentObject private var appRouter: AppRouter
    @EnvironmentObject private var authManager: AuthManager
    
    var body: some View {
        NavigationStack(path: $appRouter.routes) {
            // 路由视图
            ForEach(appRouter.routes, id: \.self) {route in
                route.view
                    .navigationTitle(route.title)
                    .navigationBarTitleDisplayMode(.inline)
            }
            
            // 路由目的地
            .navigationDestination(for: AppRoute.self) { route in
                route.view
                    .navigationTitle(route.title)
                    .navigationBarTitleDisplayMode(.inline)
            }
        }
        .onChange(of: authManager.isLoggedIn) {isLoggedIn in
            // 认证状态变化时，更新路由
            if isLoggedIn {
                appRouter.navigate(to: .home)
            } else {
                appRouter.navigate(to: .welcome)
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .userLoggedOut)) {_ in
            // 监听登出事件，更新路由
            appRouter.navigate(to: .welcome)
        }
    }
}
```

### 4.6 App.swift（扩展）
```swift
import SwiftUI

@main
struct AIVoiceInteractionApp: App {
    @StateObject private var appRouter = AppRouter()
    @StateObject private var authManager = AuthManager.shared
    
    var body: some Scene {
        WindowGroup {
            NavigationStackWithGuard()
                .environmentObject(appRouter)
                .environmentObject(authManager)
                .onAppear {
                    // 初始化路由
                    appRouter.navigateToInitialRoute()
                }
        }
    }
}
```

### 4.7 APIInterceptor.swift
```swift
import Alamofire

class APIInterceptor: RequestInterceptor {
    private let keychainService: KeychainServiceProtocol
    private let authService: AuthServiceProtocol
    private let authManager: AuthManager
    
    init(
        keychainService: KeychainServiceProtocol = KeychainService(),
        authService: AuthServiceProtocol = AuthService()
    ) {
        self.keychainService = keychainService
        self.authService = authService
        self.authManager = AuthManager.shared
    }
    
    // 请求适配器：添加认证Token
    func adapt(
        _ urlRequest: URLRequest,
        for session: Session,
        completion: @escaping (Result<URLRequest, Error>) -> Void
    ) {
        var adaptedRequest = urlRequest
        
        // 添加认证Token
        if let token = keychainService.getValue(forKey: KeychainKeys.authToken) as? String {
            adaptedRequest.headers.add(name: "Authorization", value: "Bearer token)")
        }
        
        completion(.success(adaptedRequest))
    }
    
    // 请求重试器：处理Token过期
    func retry(
        _ request: Request,
        for session: Session,
        dueTo error: Error,
        completion: @escaping (RetryResult) -> Void
    ) {
        guard let response = request.task?.response as? HTTPURLResponse,
              response.statusCode == 401 else {
            // 不是401错误，不重试
            completion(.doNotRetry)
            return
        }
        
        guard let originalRequest = request.originalRequest,
              !originalRequest.url?.path.contains("/refresh-token") ?? false else {
            // 是刷新Token的请求，不重试
            completion(.doNotRetry)
            return
        }
        
        // Token过期，尝试刷新
        Task {
            do {
                let tokenResponse = try await authService.refreshToken()
                
                // 更新Keychain中的Token
                try keychainService.save(
                    value: tokenResponse.accessToken,
                    forKey: KeychainKeys.authToken
                )
                
                if let refreshToken = tokenResponse.refreshToken {
                    try keychainService.save(
                        value: refreshToken,
                        forKey: KeychainKeys.refreshToken
                    )
                }
                
                // 重试请求
                completion(.retryWithDelay(0.1))
            } catch {
                // 刷新Token失败，登出
                authManager.logout()
                completion(.doNotRetry)
            }
        }
    }
}
```

### 4.8 APIService.swift（扩展）
```swift
extension APIService {
    convenience init(interceptor: RequestInterceptor? = nil) {
        let defaultInterceptor = interceptor ?? APIInterceptor()
        let session = Session(interceptor: defaultInterceptor)
        self.init(session: session)
    }
}
```

## 5. 开发环境配置

### 5.1 Xcode设置
1. 确保Xcode版本为15.0+
2. 配置好Keychain共享权限
3. 配置好网络请求权限

### 5.2 Info.plist配置
- 保持与之前相同的Info.plist配置

## 6. 代码规范与最佳实践

### 6.1 命名规范
- 服务类名：大驼峰 + Service后缀（TokenRefreshService）
- 拦截器类名：大驼峰 + Interceptor后缀（APIInterceptor）
- 路由枚举：大驼峰（AppRoute）
- 属性名：小驼峰（requiresAuth）

### 6.2 SwiftUI最佳实践
- 使用@EnvironmentObject共享全局状态
- 实现自定义路由栈管理
- 使用NavigationStackWithGuard包装导航栈
- 监听认证状态变化，自动更新路由

### 6.3 安全最佳实践
- 确保Token的安全存储（Keychain）
- 实现Token自动刷新机制
- 处理Token刷新失败情况
- 确保登出时清除所有敏感数据

### 6.4 错误处理
- 实现统一的错误处理机制
- 提供清晰的错误提示
- 记录详细的错误日志
- 实现优雅的错误恢复机制

## 7. 项目开发规划

### 7.1 认证模块开发计划
- **第4天**：登录功能实现（已完成）
- **第5天**：注册功能实现（已完成）
- **第6天**：认证状态管理和路由守卫（当前文档）

### 7.2 后续开发重点
- **第7-9天**：认知模型管理模块开发
  - 认知模型列表实现
  - 认知模型详情实现
  - 认知模型创建和编辑
- **第10-12天**：语音交互模块开发
  - 语音识别功能实现
  - 文本转语音功能实现
  - 语音交互流程优化

## 8. 总结

Day 06的核心任务是完成认证状态管理和路由守卫的实现，包括：
- 全局认证状态管理
- 路由守卫实现
- Token刷新机制
- 登出功能
- 认证状态持久化

通过这一天的工作，我们实现了完整的认证体系，包括：
- 使用AuthManager统一管理认证状态
- 使用NavigationStackWithGuard实现路由守卫
- 使用TokenRefreshService实现Token自动刷新
- 使用APIInterceptor处理网络请求的认证
- 实现了完整的登录/登出流程

认证模块是应用的基础，为后续的核心功能提供了安全保障。通过实现全局认证状态管理和路由守卫，我们确保了需要登录的页面只能被已登录用户访问，提高了应用的安全性。

在后续的开发中，我们将开始开发核心功能模块，包括认知模型管理和语音交互功能。这些功能将建立在我们已经实现的认证体系之上，为用户提供完整的AI语音交互体验。