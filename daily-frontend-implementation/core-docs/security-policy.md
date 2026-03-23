# 安全策略文档

## 模块关联索引

### 所属环节
- **阶段**：文档优化
- **开发主题**：前后端统一安全策略

### 相关核心文档
- [前端架构设计](architecture-design/frontend-architecture.md)
- [API集成规范](core-features/api-integration-spec.md)
- [业务术语表](business-terminology-glossary.md)

## 1. 概述

本文档定义了AI认知辅助系统的统一安全策略，涵盖前端和后端的安全实现、数据保护、认证授权、通信安全等方面，确保系统的安全性和可靠性。

## 2. 安全原则

- **最小权限原则**：只授予必要的权限，避免过度授权
- **深度防御**：采用多层次安全措施，如加密、认证、授权等
- **数据保护**：敏感数据在传输和存储时必须加密
- **安全设计**：安全措施应在系统设计阶段考虑，而非事后添加
- **定期审计**：定期进行安全审计和测试，发现并修复安全漏洞

## 3. 认证与授权

### 3.1 JWT认证

#### 3.1.1 前端实现
- **JWT存储**：使用Keychain安全存储JWT令牌，避免存储在UserDefaults中
- **认证状态管理**：使用ObservableObject管理认证状态，包括accessToken和refreshToken
- **自动刷新机制**：当accessToken过期时，使用refreshToken自动获取新的accessToken
- **过期处理**：当refreshToken也过期时，提示用户重新登录

```swift
// JWT存储示例
class KeychainService {
    func saveToken(_ token: String, forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: token.data(using: .utf8)!,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        
        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }
    
    // 其他方法：获取令牌、删除令牌等
}
```

#### 3.1.2 后端实现
- **JWT生成**：使用安全的算法（如HS256）生成JWT令牌
- **JWT验证**：使用Passport.js中间件验证JWT令牌
- **令牌过期设置**：accessToken过期时间设置为1小时，refreshToken过期时间设置为7天
- **黑名单机制**：实现JWT黑名单，用于吊销已颁发的令牌

### 3.2 苹果认证

#### 3.2.1 前端实现
- **Apple Sign In**：集成Apple Sign In SDK，支持使用Apple ID登录
- **令牌处理**：将Apple授权码发送到后端，获取系统JWT令牌
- **用户信息保护**：仅获取必要的用户信息，如姓名和邮箱

#### 3.2.2 后端实现
- **Apple认证验证**：验证Apple授权码，获取用户信息
- **用户关联**：将Apple用户与系统用户关联，支持跨平台登录

## 4. 数据保护

### 4.1 传输加密

- **HTTPS**：所有API请求和WebSocket通信必须使用HTTPS/WSS加密
- **证书验证**：前端实现严格的证书验证，防止中间人攻击
- **API请求签名**：关键API请求可考虑添加签名机制，防止请求篡改

### 4.2 存储加密

#### 4.2.1 前端存储加密
- **敏感数据**：所有敏感数据（如JWT令牌、用户凭证）必须存储在Keychain中
- **Core Data加密**：启用Core Data的加密功能，保护本地存储的数据
- **数据清理**：用户登出时，清理所有本地存储的敏感数据

#### 4.2.2 后端存储加密
- **数据库加密**：SQLite数据库启用加密，Qdrant向量库配置加密
- **密码哈希**：用户密码使用bcrypt等安全算法进行哈希存储
- **敏感字段加密**：数据库中敏感字段（如邮箱、手机号）进行加密存储

## 5. 通信安全

### 5.1 API安全

#### 5.1.1 请求限流
- **前端实现**：实现API请求限流，避免频繁请求导致服务压力
- **后端实现**：使用中间件实现API请求限流，防止恶意攻击

#### 5.1.2 错误处理
- **前端实现**：统一处理API错误，避免泄露敏感信息
- **后端实现**：返回通用错误信息，不泄露系统内部细节

### 5.2 WebSocket安全

#### 5.2.1 认证机制
- **连接认证**：WebSocket连接建立后，立即发送JWT令牌进行认证
- **认证失败处理**：认证失败时，关闭WebSocket连接

#### 5.2.2 消息验证
- **消息格式验证**：验证接收到的WebSocket消息格式，防止恶意消息
- **消息内容加密**：敏感WebSocket消息内容进行加密传输

## 6. 前端安全实现细节

### 6.1 Keychain使用规范

- **访问控制**：设置适当的访问控制属性，如`kSecAttrAccessibleWhenUnlockedThisDeviceOnly`
- **错误处理**：妥善处理Keychain操作错误，避免应用崩溃
- **密钥管理**：定期更新和轮换密钥，增强安全性

### 6.2 HTTPS配置

- **ATS配置**：在Info.plist中启用ATS（App Transport Security），强制使用HTTPS
- **证书固定**：实现证书固定，防止证书替换攻击

```xml
<!-- Info.plist中ATS配置示例 -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSAllowsArbitraryLoadsInWebContent</key>
    <true/>
</dict>
```

### 6.3 输入验证

- **客户端验证**：对所有用户输入进行验证，如格式、长度等
- **类型安全**：使用Swift的类型安全特性，避免类型转换错误
- **防止注入攻击**：对SQL和其他查询语句进行参数化处理

### 6.4 安全编码实践

- **避免硬编码**：敏感信息（如API密钥、URL）避免硬编码，使用配置文件或环境变量
- **代码审查**：定期进行安全代码审查，发现并修复安全漏洞
- **使用安全库**：使用经过安全验证的第三方库，避免使用存在安全漏洞的库

## 7. 安全测试策略

### 7.1 前端安全测试

#### 7.1.1 静态代码分析
- **工具**：使用SwiftLint进行代码质量检查，配置安全规则
- **频率**：每次代码提交前运行静态代码分析
- **规则**：重点检查硬编码敏感信息、不安全的加密算法等

#### 7.1.2 动态测试
- **模拟攻击**：模拟常见攻击，如SQL注入、XSS等
- **安全扫描**：使用安全扫描工具扫描应用，发现安全漏洞
- **渗透测试**：定期进行渗透测试，评估系统安全性

#### 7.1.3 依赖检查
- **工具**：使用Carthage或CocoaPods的依赖检查功能
- **频率**：每次更新依赖时，检查依赖库的安全漏洞
- **修复策略**：及时更新存在安全漏洞的依赖库

### 7.2 后端安全测试

#### 7.2.1 API安全测试
- **工具**：使用Postman或专门的API安全测试工具
- **测试内容**：认证授权、输入验证、错误处理等
- **频率**：每次API更新后进行安全测试

#### 7.2.2 数据库安全测试
- **工具**：使用数据库安全扫描工具
- **测试内容**：权限配置、加密设置、敏感数据保护等
- **频率**：定期进行数据库安全测试

## 8. 安全事件处理

### 8.1 事件响应流程

1. **事件检测**：通过日志监控、安全扫描等方式检测安全事件
2. **事件分析**：分析事件的严重程度和影响范围
3. **事件响应**：采取适当的响应措施，如修复漏洞、吊销令牌等
4. **事件报告**：向相关人员报告安全事件，包括事件详情、影响范围和修复措施
5. **事件复盘**：分析事件原因，总结经验教训，改进安全策略

### 8.2 应急响应计划

- **联系方式**：建立安全事件应急响应团队，明确联系方式
- **响应流程**：制定详细的安全事件响应流程，确保快速有效处理
- **恢复计划**：制定系统恢复计划，确保系统在安全事件后能够快速恢复

## 9. 安全策略维护

- **定期更新**：每年至少更新一次安全策略，适应新的安全威胁
- **培训**：定期对开发团队进行安全培训，提高安全意识
- **审计**：定期进行安全审计，确保安全策略的执行情况
- **反馈机制**：建立安全反馈机制，鼓励员工报告安全问题

## 10. 参考资料

- OWASP Mobile Top 10
- Apple Security Documentation
- JWT Best Practices
- HTTPS/TLS Best Practices
