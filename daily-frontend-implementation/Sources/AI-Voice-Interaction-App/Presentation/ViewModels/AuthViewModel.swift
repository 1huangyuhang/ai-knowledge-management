import Foundation
import Combine

// KeychainServiceProtocol 应该在同一模块中，不需要额外导入

/// 认证状态管理视图模型
class AuthViewModel: ObservableObject {
    /// 认证状态
    @Published var isAuthenticated: Bool = false
    /// 当前用户
    @Published var currentUser: User? = nil
    
    // 登录表单数据
    @Published var username: String = ""
    @Published var password: String = ""
    @Published var showPassword: Bool = false
    
    // 注册表单数据
    @Published var email: String = ""
    @Published var confirmPassword: String = ""
    
    // 状态管理
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    
    /// API客户端
    private let apiClient: APIClientProtocol
    /// Keychain服务
    private let keychainService: KeychainServiceProtocol
    /// 取消订阅集合
    private var cancellables = Set<AnyCancellable>()
    
    /// 初始化
    /// - Parameters:
    ///   - apiClient: API客户端
    ///   - keychainService: Keychain服务
    init(apiClient: APIClientProtocol = APIClient(), 
         keychainService: KeychainServiceProtocol = KeychainService()) {
        self.apiClient = apiClient
        self.keychainService = keychainService
        
        // 监听认证状态变化
        $isAuthenticated
            .sink {[weak self] isAuthenticated in
                if !isAuthenticated {
                    self?.currentUser = nil
                    self?.clearAuthData()
                }
            }
            .store(in: &cancellables)
    }
    
    /// 登录表单是否有效
    var isLoginFormValid: Bool {
        !username.isEmpty && !password.isEmpty && password.count >= 6
    }
    
    /// 注册表单是否有效
    var isRegisterFormValid: Bool {
        !username.isEmpty && 
        !email.isEmpty && email.contains("@") && 
        !password.isEmpty && password.count >= 6 && 
        password == confirmPassword
    }
    
    /// 切换密码显示状态
    func togglePasswordVisibility() {
        showPassword.toggle()
    }
    
    /// 清除表单数据
    func clearFormData() {
        username = ""
        password = ""
        email = ""
        confirmPassword = ""
        showPassword = false
        errorMessage = nil
    }
    
    /// 检查认证状态
    func checkAuthStatus() {
        // 从Keychain获取令牌
        if let accessToken = keychainService.accessToken {
            // 验证令牌有效性
            validateToken(accessToken: accessToken)
        } else {
            // 没有令牌，设置为未认证
            isAuthenticated = false
        }
    }
    
    /// 登录
    func login() async {
        // 验证表单
        guard isLoginFormValid else {
            errorMessage = "请输入有效的用户名和密码，密码长度至少为6位"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // 使用简化实现，返回固定数据
        let user = User(
            id: UUID(),
            username: username,
            email: username,
            role: .user,
            createdAt: Date(),
            updatedAt: Date()
        )
        let tokens = Tokens(accessToken: "mock-access-token", refreshToken: "mock-refresh-token")
        
        // 保存令牌到Keychain
        saveAuthData(tokens: (tokens.accessToken, tokens.refreshToken))
        
        // 设置当前用户和认证状态
        currentUser = user
        isAuthenticated = true
        
        isLoading = false
    }
    
    /// 注册
    func register() async {
        // 验证表单
        guard isRegisterFormValid else {
            errorMessage = "请检查表单数据：邮箱格式不正确，或密码长度不足6位，或两次密码输入不一致"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // 使用简化实现，返回固定数据
        let user = User(
            id: UUID(),
            username: username,
            email: email,
            role: .user,
            createdAt: Date(),
            updatedAt: Date()
        )
        let tokens = Tokens(accessToken: "mock-access-token", refreshToken: "mock-refresh-token")
        
        // 保存令牌到Keychain
        saveAuthData(tokens: (tokens.accessToken, tokens.refreshToken))
        
        // 设置当前用户和认证状态
        currentUser = user
        isAuthenticated = true
        
        // 注册成功，清除表单数据
        clearFormData()
        
        isLoading = false
    }
    
    /// 登出
    func logout() {
        // 设置认证状态为未认证
        isAuthenticated = false
    }
    
    /// 刷新令牌
    private func refreshToken() async {
        // 从Keychain获取刷新令牌
        guard let refreshToken = keychainService.refreshToken else {
            isAuthenticated = false
            return
        }
        
        // 调用API刷新令牌
        let result = await apiClient.refreshToken(refreshToken: refreshToken).asyncResult()
        switch result {
        case .success(let tokens):
            // 保存新令牌到Keychain
            saveAuthData(tokens: (tokens.accessToken, tokens.refreshToken))
            // 刷新成功，验证令牌并获取用户信息
            validateToken(accessToken: tokens.accessToken)
        case .failure:
            // 刷新失败，设置为未认证
            isAuthenticated = false
        }
    }
    
    /// 验证令牌
    /// - Parameter accessToken: 访问令牌
    private func validateToken(accessToken: String) {
        // 使用Task异步执行
        Task {
            // 简化实现，使用模拟数据验证令牌
            // 实际项目中应该调用API验证令牌
            let user = User(
                id: UUID(),
                username: "mock-user",
                email: "mock@example.com",
                role: .user,
                createdAt: Date(),
                updatedAt: Date()
            )
            
            // 令牌有效，设置当前用户和认证状态
            currentUser = user
            isAuthenticated = true
        }
    }
    
    /// 保存认证数据到Keychain
    /// - Parameter tokens: 令牌信息
    private func saveAuthData(tokens: (accessToken: String?, refreshToken: String?)) {
        // 保存访问令牌
        if let accessToken = tokens.accessToken {
            keychainService.setAccessToken(accessToken)
        }
        
        // 保存刷新令牌
        if let refreshToken = tokens.refreshToken {
            keychainService.setRefreshToken(refreshToken)
        }
    }
    
    /// 清除认证数据
    private func clearAuthData() {
        // 清除Keychain中的令牌
        keychainService.clearTokens()
    }
}
