import Foundation
import Combine

/// 认证服务协议
protocol AuthRepository {
    func login(email: String, password: String) -> AnyPublisher<LoginResponse, APIError>
    func register(username: String, email: String, password: String) -> AnyPublisher<User, APIError>
    func logout() -> AnyPublisher<Void, APIError>
    func refreshToken() -> AnyPublisher<String, APIError>
    func isAuthenticated() -> Bool
    func getCurrentUser() -> User?
    func saveUser(_ user: User)
    func clearUser()
}