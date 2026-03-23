import Foundation
import Combine

/// API认证服务实现
class APIAuthRepository: AuthRepository {
    
    // 依赖注入：API客户端
    private let apiClient: APIClientProtocol
    
    // 初始化
    init(apiClient: APIClientProtocol = APIClient.shared) {
        self.apiClient = apiClient
    }
    
    // 登录功能实现
    func login(email: String, password: String) -> AnyPublisher<LoginResponse, APIError> {
        let request = LoginRequest(email: email, password: password)
        return apiClient.request(Endpoint.login, parameters: request.toDictionary(), headers: nil)
    }
    
    // 注册功能实现
    func register(username: String, email: String, password: String) -> AnyPublisher<User, APIError> {
        let request = RegisterRequest(username: username, email: email, password: password)
        return apiClient.request(Endpoint.register, parameters: request.toDictionary(), headers: nil)
    }
    
    // 注销功能实现
    func logout() -> AnyPublisher<Void, APIError> {
        return Future<Void, APIError> { [weak self] promise in
            // 清除本地存储的令牌和用户信息
            KeychainService.shared.clearTokens()
            self?.clearUser()
            
            // 发送注销成功通知
            NotificationCenter.default.post(name: .userLoggedOut, object: nil)
            
            promise(.success(()))
        }
        .eraseToAnyPublisher()
    }
    
    // 刷新令牌功能实现
    func refreshToken() -> AnyPublisher<String, APIError> {
        return Future<String, APIError> { [weak self] promise in
            guard let refreshToken = KeychainService.shared.refreshToken else {
                promise(.failure(.unauthorized))
                return
            }
            
            let parameters = ["refreshToken": refreshToken]
            
            self?.apiClient.request(Endpoint.refreshToken, parameters: parameters, headers: nil)
                .sink {completion in
                    if case .failure(let error) = completion {
                        promise(.failure(error))
                    }
                } receiveValue: { (response: LoginResponse) in
                    // 保存新的访问令牌
                    KeychainService.shared.accessToken = response.accessToken
                    KeychainService.shared.refreshToken = response.refreshToken
                    
                    promise(.success(response.accessToken))
                }
                .store(in: &self?.cancellables ?? [])
        }
        .eraseToAnyPublisher()
    }
    
    // 检查是否已认证
    func isAuthenticated() -> Bool {
        return KeychainService.shared.accessToken != nil
    }
    
    // 获取当前用户
    func getCurrentUser() -> User? {
        guard let userData = UserDefaults.standard.data(forKey: "currentUser"),
              let user = try? JSONDecoder().decode(User.self, from: userData)
        else {
            return nil
        }
        return user
    }
    
    // 保存用户信息
    func saveUser(_ user: User) {
        if let userData = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(userData, forKey: "currentUser")
            NotificationCenter.default.post(name: .userLoggedIn, object: nil)
        }
    }
    
    // 清除用户信息
    func clearUser() {
        UserDefaults.standard.removeObject(forKey: "currentUser")
    }
    
    // 取消令牌，用于取消Combine订阅
    private var cancellables = Set<AnyCancellable>()
}

/// 扩展Encodable，添加toDictionary方法
fileprivate extension Encodable {
    func toDictionary() -> [String: Any]? {
        do {
            let data = try JSONEncoder().encode(self)
            let dictionary = try JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String: Any]
            return dictionary
        } catch {
            return nil
        }
    }
}