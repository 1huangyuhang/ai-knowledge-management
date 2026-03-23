import Foundation
import Security

/// Keychain服务协议
protocol KeychainServiceProtocol {
    /// 获取访问令牌
    var accessToken: String? { get }
    
    /// 设置访问令牌
    /// - Parameter token: 访问令牌
    func setAccessToken(_ token: String)
    
    /// 获取刷新令牌
    var refreshToken: String? { get }
    
    /// 设置刷新令牌
    /// - Parameter token: 刷新令牌
    func setRefreshToken(_ token: String)
    
    /// 清除所有令牌
    func clearTokens()
}

/// Keychain服务实现类
class KeychainService: KeychainServiceProtocol {
    /// 共享实例
    static let shared = KeychainService()
    
    /// 服务标识符
    private let service = "AI-Voice-Interaction-App"
    
    /// 初始化器
    public init() {}
    
    /// 获取访问令牌
    var accessToken: String? {
        return getValue(forKey: "accessToken")
    }
    
    /// 设置访问令牌
    /// - Parameter token: 访问令牌
    func setAccessToken(_ token: String) {
        setValue(token, forKey: "accessToken")
    }
    
    /// 获取刷新令牌
    var refreshToken: String? {
        return getValue(forKey: "refreshToken")
    }
    
    /// 设置刷新令牌
    /// - Parameter token: 刷新令牌
    func setRefreshToken(_ token: String) {
        setValue(token, forKey: "refreshToken")
    }
    
    /// 清除所有令牌
    func clearTokens() {
        removeValue(forKey: "accessToken")
        removeValue(forKey: "refreshToken")
    }
    
    /// 从Keychain获取值
    /// - Parameter key: 键名
    /// - Returns: 存储的值，如果不存在或出错则返回nil
    private func getValue(forKey key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: kCFBooleanTrue as Any,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        guard status == errSecSuccess, let data = dataTypeRef as? Data else {
            return nil
        }
        
        return String(data: data, encoding: .utf8)
    }
    
    /// 将值存储到Keychain
    /// - Parameters:
    ///   - value: 要存储的值
    ///   - key: 键名
    private func setValue(_ value: String, forKey key: String) {
        // 先检查是否已经存在
        if getValue(forKey: key) != nil {
            // 如果存在，更新它
            let query: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: service,
                kSecAttrAccount as String: key
            ]
            
            let attributes: [String: Any] = [
                kSecValueData as String: value.data(using: .utf8)!
            ]
            
            SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        } else {
            // 如果不存在，创建它
            let query: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: service,
                kSecAttrAccount as String: key,
                kSecValueData as String: value.data(using: .utf8)!,
                kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlocked
            ]
            
            SecItemAdd(query as CFDictionary, nil)
        }
    }
    
    /// 从Keychain删除值
    /// - Parameter key: 键名
    private func removeValue(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
    }
}
