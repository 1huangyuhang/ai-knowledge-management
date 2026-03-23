import Foundation
import Security

/// Keychain服务，用于安全存储认证令牌
class KeychainService {
    // 单例实例
    static let shared = KeychainService()
    
    // 常量
    private let serviceName = "AI-Voice-Interaction-App"
    private let accessTokenKey = "accessToken"
    private let refreshTokenKey = "refreshToken"
    
    // 访问令牌
    var accessToken: String? {
        get {
            return getString(forKey: accessTokenKey)
        }
        set {
            if let newValue = newValue {
                saveString(newValue, forKey: accessTokenKey)
            } else {
                deleteString(forKey: accessTokenKey)
            }
        }
    }
    
    // 刷新令牌
    var refreshToken: String? {
        get {
            return getString(forKey: refreshTokenKey)
        }
        set {
            if let newValue = newValue {
                saveString(newValue, forKey: refreshTokenKey)
            } else {
                deleteString(forKey: refreshTokenKey)
            }
        }
    }
    
    // 保存字符串到Keychain
    private func saveString(_ value: String, forKey key: String) {
        guard let data = value.data(using: .utf8) else {
            return
        }
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlocked
        ]
        
        // 删除已存在的项
        SecItemDelete(query as CFDictionary)
        
        // 添加新项
        SecItemAdd(query as CFDictionary, nil)
    }
    
    // 从Keychain获取字符串
    private func getString(forKey key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecReturnData as String: kCFBooleanTrue,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        
        guard status == errSecSuccess, let data = item as? Data else {
            return nil
        }
        
        return String(data: data, encoding: .utf8)
    }
    
    // 从Keychain删除字符串
    private func deleteString(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
    }
    
    // 清除所有令牌
    func clearTokens() {
        accessToken = nil
        refreshToken = nil
    }
}