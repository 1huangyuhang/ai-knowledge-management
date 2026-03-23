import Foundation
import Combine

/// 认证视图模型，管理登录和注册状态
class AuthViewModel: ObservableObject {
    // 依赖注入：认证仓库
    private let authRepository: AuthRepository
    
    // 登录表单字段
    @Published var email: String = ""
    @Published var password: String = ""
    
    // 注册表单字段
    @Published var username: String = ""
    @Published var confirmPassword: String = ""
    
    // 状态字段
    @Published var isLoading: Bool = false
    @Published var error: String? = nil
    @Published var successMessage: String? = nil
    
    // 表单验证
    @Published var isEmailValid: Bool = false
    @Published var isPasswordValid: Bool = false
    @Published var isUsernameValid: Bool = false
    @Published var doPasswordsMatch: Bool = false
    
    // 取消令牌，用于取消Combine订阅
    private var cancellables = Set<AnyCancellable>()
    
    // 初始化
    init(authRepository: AuthRepository = APIAuthRepository()) {
        self.authRepository = authRepository
        
        // 设置表单验证
        setupValidation()
    }
    
    // 设置表单验证
    private func setupValidation() {
        // 邮箱验证
        $email
            .map { email in
                return !email.isEmpty && email.contains("@")
            }
            .assign(to: &$isEmailValid)
        
        // 密码验证
        $password
            .map { password in
                return password.count >= 6
            }
            .assign(to: &$isPasswordValid)
        
        // 用户名验证
        $username
            .map { username in
                return username.count >= 3
            }
            .assign(to: &$isUsernameValid)
        
        // 密码匹配验证
        Publishers.CombineLatest($password, $confirmPassword)
            .map { password, confirmPassword in
                return !password.isEmpty && password == confirmPassword
            }
            .assign(to: &$doPasswordsMatch)
    }
    
    // 登录功能
    func login() {
        // 重置状态
        resetState()
        
        // 表单验证
        guard isEmailValid && isPasswordValid else {
            error = "请输入有效的邮箱和密码"
            return
        }
        
        // 设置加载状态
        isLoading = true
        
        // 调用登录API
        authRepository.login(email: email, password: password)
            .receive(on: DispatchQueue.main)
            .sink {[weak self] completion in
                self?.isLoading = false
                
                switch completion {
                case .finished:
                    break
                case .failure(let apiError):
                    self?.error = apiError.errorDescription
                }
            } receiveValue: { [weak self] response in
                // 保存认证信息
                KeychainService.shared.accessToken = response.accessToken
                KeychainService.shared.refreshToken = response.refreshToken
                self?.authRepository.saveUser(response.user)
                
                // 发送登录成功通知
                NotificationCenter.default.post(name: .userLoggedIn, object: nil)
            }
            .store(in: &cancellables)
    }
    
    // 注册功能
    func register() {
        // 重置状态
        resetState()
        
        // 表单验证
        guard isUsernameValid && isEmailValid && isPasswordValid && doPasswordsMatch else {
            error = "请检查表单输入"
            return
        }
        
        // 设置加载状态
        isLoading = true
        
        // 调用注册API
        authRepository.register(username: username, email: email, password: password)
            .receive(on: DispatchQueue.main)
            .sink {[weak self] completion in
                self?.isLoading = false
                
                switch completion {
                case .finished:
                    break
                case .failure(let apiError):
                    self?.error = apiError.errorDescription
                }
            } receiveValue: { [weak self] user in
                // 注册成功后自动登录
                self?.successMessage = "注册成功，正在自动登录..."
                
                // 延迟执行登录
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                    self?.login()
                }
            }
            .store(in: &cancellables)
    }
    
    // 重置状态
    func resetState() {
        error = nil
        successMessage = nil
    }
    
    // 重置表单
    func resetForm() {
        email = ""
        password = ""
        username = ""
        confirmPassword = ""
        resetState()
    }
}

/// 登录视图模型，继承自AuthViewModel
class LoginViewModel: AuthViewModel {
    // 初始化
    init(authRepository: AuthRepository = APIAuthRepository()) {
        super.init(authRepository: authRepository)
    }
    
    // 登录专用验证
    var canLogin: Bool {
        return isEmailValid && isPasswordValid
    }
}

/// 注册视图模型，继承自AuthViewModel
class RegisterViewModel: AuthViewModel {
    // 初始化
    init(authRepository: AuthRepository = APIAuthRepository()) {
        super.init(authRepository: authRepository)
    }
    
    // 注册专用验证
    var canRegister: Bool {
        return isUsernameValid && isEmailValid && isPasswordValid && doPasswordsMatch
    }
}