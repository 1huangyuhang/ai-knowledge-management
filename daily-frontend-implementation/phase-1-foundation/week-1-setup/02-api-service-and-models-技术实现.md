# Day 02: API服务和数据模型 - 代码实现文档

## 模块关联索引

### 所属环节
- **阶段**：第一阶段：基础架构搭建
- **周次**：第1周
- **天数**：第2天
- **开发主题**：API服务和数据模型

### 对应核心文档
- [前端架构设计](../../core-docs/architecture-design/frontend-architecture.md)
- [API集成规范](../../core-docs/core-features/api-integration-spec.md)
- [API文档](../../core-docs/core-features/api-documentation.md)

### 相关技术实现文档
- [第1天：项目初始化](01-project-initialization-技术实现.md)
- [第3天：路由和UI组件](03-routing-and-ui-components-技术实现.md)

### 关联模块
- [项目初始化](01-project-initialization-技术实现.md)
- [路由和UI组件](03-routing-and-ui-components-技术实现.md)

### 依赖关系
- [项目初始化](01-project-initialization-技术实现.md)

## 1. 项目概述

### 1.1 今日目标
- 实现API服务层，封装网络请求逻辑
- 定义核心数据模型
- 实现数据模型的JSON解析和序列化
- 创建基础的ViewModel基类

### 1.2 设计理念
- **抽象封装**：将网络请求逻辑封装到Service层，便于统一管理和测试
- **强类型安全**：使用Swift结构体定义数据模型，确保类型安全
- **可扩展性**：设计灵活的API服务层，便于添加新的API端点
- **响应式设计**：数据模型支持响应式更新，便于UI层监听数据变化

## 2. API服务层实现

### 2.1 APIService基础架构

#### 2.1.1 APIService协议
```swift
import Alamofire
import Combine
import SwiftyJSON

protocol APIServiceProtocol {
    func request<T: Decodable>(_ endpoint: APIEndpoint, responseType: T.Type) -> AnyPublisher<T, APIError>
    func request<T: Decodable>(_ url: String, method: HTTPMethod, parameters: [String: Any]?, headers: HTTPHeaders?, responseType: T.Type) -> AnyPublisher<T, APIError>
    func upload<T: Decodable>(_ endpoint: APIEndpoint, fileURL: URL, responseType: T.Type) -> AnyPublisher<T, APIError>
}
```

#### 2.1.2 APIEndpoint枚举
```swift
enum APIEndpoint {
    // 认证相关
    case login
    case register
    case refreshToken
    
    // 认知模型相关
    case cognitiveModels
    case cognitiveModel(id: String)
    
    // 语音交互相关
    case speechToText
    case textToSpeech
    
    // AI对话相关
    case aiConversation
    
    // 分析相关
    case multiDimensionalAnalysis(modelId: String)
    case thinkingTypeAnalysis(modelId: String)
    
    // 个性化设置相关
    case userPreferences
    
    // HTTP方法
    var method: HTTPMethod {
        switch self {
        case .login, .register, .refreshToken, .cognitiveModels, .speechToText, .textToSpeech, .aiConversation, .thinkingTypeAnalysis:
            return .post
        case .cognitiveModel(let id) where id.isEmpty:
            return .get
        case .cognitiveModel, .multiDimensionalAnalysis, .userPreferences:
            return .get
        }
    }
    
    // URL路径
    var path: String {
        switch self {
        case .login:
            return "/api/v1/sessions"
        case .register:
            return "/api/v1/users"
        case .refreshToken:
            return "/api/v1/tokens/refresh"
        case .cognitiveModels:
            return "/api/v1/models"
        case .cognitiveModel(let id):
            return "/api/v1/models/\(id)"
        case .speechToText:
            return "/api/v1/speech/transcriptions"
        case .textToSpeech:
            return "/api/v1/speech/syntheses"
        case .aiConversation:
            return "/api/v1/ai-tasks"
        case .multiDimensionalAnalysis(let modelId):
            return "/api/v1/models/\(modelId)/analyses"
        case .thinkingTypeAnalysis(let modelId):
            return "/api/v1/models/\(modelId)/analyses/thinking-type"
        case .userPreferences:
            return "/api/v1/users/me/preferences"
        }
    }
    
    // 基础URL
    var baseURL: String {
        return "https://api.example.com"
    }
    
    // 完整URL
    var url: String {
        return baseURL + path
    }
}
```

#### 2.1.3 API统一响应模型

```swift
/// API错误模型
typealias ApiErrorModel = [String: Any]

/// API元数据模型
struct ApiMeta: Decodable {
    let code: Int
    let message: String?
    let error: ApiErrorModel?
    let page: Int?
    let limit: Int?
    let total: Int?
    let requestId: String?
    let timestamp: String?
    
    enum CodingKeys: String, CodingKey {
        case code
        case message
        case error
        case page
        case limit
        case total
        case requestId
        case timestamp
    }
}

/// API统一响应模型
struct ApiResponse<T: Decodable>: Decodable {
    let data: T?
    let meta: ApiMeta
    
    enum CodingKeys: String, CodingKey {
        case data
        case meta
    }
}
```

#### 2.1.4 APIError枚举
```swift
enum APIError: Error, LocalizedError {
    case invalidURL
    case networkError(Error)
    case decodingError(Error)
    case serverError(statusCode: Int, message: String)
    case apiError(code: String, message: String, details: ApiErrorModel?)
    case unauthorized
    case forbidden
    case notFound
    case unknown(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "无效的URL"
        case .networkError(let error):
            return "网络错误：\(error.localizedDescription)"
        case .decodingError(let error):
            return "数据解析错误：\(error.localizedDescription)"
        case .serverError(let statusCode, let message):
            return "服务器错误（\(statusCode)）：\(message)"
        case .apiError(let code, let message, _):
            return "API错误（\(code)）：\(message)"
        case .unauthorized:
            return "未授权，请重新登录"
        case .forbidden:
            return "禁止访问"
        case .notFound:
            return "资源未找到"
        case .unknown(let error):
            return "未知错误：\(error.localizedDescription)"
        }
    }
}
```

#### 2.1.4 APIService实现
```swift
class APIService: APIServiceProtocol {
    
    // 单例实例
    static let shared = APIService()
    
    // Alamofire会话
    private let session: Session
    
    // 初始化
    private init() {
        // 配置Alamofire会话
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        
        // 添加认证头拦截器
        let interceptor = RequestInterceptor()
        
        self.session = Session(configuration: configuration, interceptor: interceptor)
    }
    
    // 实现request方法
    func request<T: Decodable>(_ endpoint: APIEndpoint, responseType: T.Type) -> AnyPublisher<T, APIError> {
        return request(endpoint.url, method: endpoint.method, parameters: nil, headers: nil, responseType: responseType)
    }
    
    func request<T: Decodable>(_ url: String, method: HTTPMethod, parameters: [String: Any]?, headers: HTTPHeaders?, responseType: T.Type) -> AnyPublisher<T, APIError> {
        return Future<T, APIError> { [weak self] promise in
            guard let self = self else { return }
            
            self.session.request(url, method: method, parameters: parameters, encoding: JSONEncoding.default, headers: headers)
                .responseJSON { response in
                    switch response.result {
                    case .success(let value):
                        do {
                            let json = JSON(value)
                            let data = try json.rawData()
                            let decoder = JSONDecoder()
                            decoder.dateDecodingStrategy = .iso8601
                            
                            // 先将响应解码为ApiResponse<T>
                            let apiResponse = try decoder.decode(ApiResponse<T>.self, from: data)
                            
                            // 检查meta中是否有错误
                            if let error = apiResponse.meta.error {
                                let errorCode = error["code"] as? String ?? "UNKNOWN_ERROR"
                                let errorMessage = error["message"] as? String ?? "未知错误"
                                promise(.failure(.apiError(code: errorCode, message: errorMessage, details: error)))
                            } else {
                                // 提取data字段
                                if let resultData = apiResponse.data {
                                    promise(.success(resultData))
                                } else {
                                    // 如果data为null，根据状态码判断是否为错误
                                    let statusCode = apiResponse.meta.code
                                    switch statusCode {
                                    case 200, 201, 204:
                                        // 对于某些成功操作（如删除），data可能为null
                                        // 这里需要特殊处理，根据responseType是否为Optional<T>来决定
                                        if T.self is Optional<Any>.Type {
                                            promise(.success(nil as! T))
                                        } else {
                                            promise(.failure(.decodingError(NSError(domain: "APIError", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "响应数据为空"]))))
                                        }
                                    default:
                                        promise(.failure(.serverError(statusCode: statusCode, message: apiResponse.meta.message ?? "未知错误")))
                                    }
                                }
                            }
                        } catch {
                            promise(.failure(.decodingError(error)))
                        }
                    case .failure(let error):
                        if let statusCode = response.response?.statusCode {
                            let message = response.data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
                            switch statusCode {
                            case 401:
                                promise(.failure(.unauthorized))
                            case 403:
                                promise(.failure(.forbidden))
                            case 404:
                                promise(.failure(.notFound))
                            default:
                                // 尝试解析错误响应中的meta.error字段
                                if let data = response.data {
                                    do {
                                        let decoder = JSONDecoder()
                                        let apiResponse = try decoder.decode(ApiResponse<EmptyResponse>.self, from: data)
                                        if let error = apiResponse.meta.error {
                                            let errorCode = error["code"] as? String ?? "UNKNOWN_ERROR"
                                            let errorMessage = error["message"] as? String ?? "未知错误"
                                            promise(.failure(.apiError(code: errorCode, message: errorMessage, details: error)))
                                            return
                                        }
                                    } catch {
                                        // 解析失败，使用默认错误处理
                                    }
                                }
                                promise(.failure(.serverError(statusCode: statusCode, message: message)))
                            }
                        } else {
                            promise(.failure(.networkError(error)))
                        }
                    }
                }
        }
        .eraseToAnyPublisher()
    }
    
    // 空响应模型，用于处理data为null的成功响应
    private struct EmptyResponse: Decodable {}

    
    // 实现upload方法
    func upload<T: Decodable>(_ endpoint: APIEndpoint, fileURL: URL, responseType: T.Type) -> AnyPublisher<T, APIError> {
        return Future<T, APIError> { [weak self] promise in
            guard let self = self else { return }
            
            self.session.upload(multipartFormData: { multipartFormData in
                multipartFormData.append(fileURL, withName: "file", fileName: fileURL.lastPathComponent, mimeType: "application/octet-stream")
            }, to: endpoint.url, method: endpoint.method)
            .responseJSON { response in
                // 处理响应，与request方法类似
                switch response.result {
                case .success(let value):
                    do {
                        let json = JSON(value)
                        let data = try json.rawData()
                        let decoder = JSONDecoder()
                        decoder.dateDecodingStrategy = .iso8601
                        
                        // 先将响应解码为ApiResponse<T>
                        let apiResponse = try decoder.decode(ApiResponse<T>.self, from: data)
                        
                        // 检查meta中是否有错误
                        if let error = apiResponse.meta.error {
                            let errorCode = error["code"] as? String ?? "UNKNOWN_ERROR"
                            let errorMessage = error["message"] as? String ?? "未知错误"
                            promise(.failure(.apiError(code: errorCode, message: errorMessage, details: error)))
                        } else {
                            // 提取data字段
                            if let resultData = apiResponse.data {
                                promise(.success(resultData))
                            } else {
                                // 如果data为null，根据状态码判断是否为错误
                                let statusCode = apiResponse.meta.code
                                switch statusCode {
                                case 200, 201, 204:
                                    // 对于某些成功操作（如删除），data可能为null
                                    // 这里需要特殊处理，根据responseType是否为Optional<T>来决定
                                    if T.self is Optional<Any>.Type {
                                        promise(.success(nil as! T))
                                    } else {
                                        promise(.failure(.decodingError(NSError(domain: "APIError", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "响应数据为空"]))))
                                    }
                                default:
                                    promise(.failure(.serverError(statusCode: statusCode, message: apiResponse.meta.message ?? "未知错误")))
                                }
                            }
                        }
                    } catch {
                        promise(.failure(.decodingError(error)))
                    }
                case .failure(let error):
                    // 错误处理，与request方法类似
                    if let statusCode = response.response?.statusCode {
                        let message = response.data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
                        switch statusCode {
                        case 401:
                            promise(.failure(.unauthorized))
                        case 403:
                            promise(.failure(.forbidden))
                        case 404:
                            promise(.failure(.notFound))
                        default:
                            // 尝试解析错误响应中的meta.error字段
                            if let data = response.data {
                                do {
                                    let decoder = JSONDecoder()
                                    let apiResponse = try decoder.decode(ApiResponse<EmptyResponse>.self, from: data)
                                    if let error = apiResponse.meta.error {
                                        let errorCode = error["code"] as? String ?? "UNKNOWN_ERROR"
                                        let errorMessage = error["message"] as? String ?? "未知错误"
                                        promise(.failure(.apiError(code: errorCode, message: errorMessage, details: error)))
                                        return
                                    }
                                } catch {
                                    // 解析失败，使用默认错误处理
                                }
                            }
                            promise(.failure(.serverError(statusCode: statusCode, message: message)))
                        }
                    } else {
                        promise(.failure(.networkError(error)))
                    }
                }
            }
        }
        .eraseToAnyPublisher()
    }
}
```

#### 2.1.5 RequestInterceptor实现
```swift
class RequestInterceptor: Alamofire.RequestInterceptor {
    
    // 为每个请求添加认证头
    func adapt(_ urlRequest: URLRequest, for session: Session, completion: @escaping (Result<URLRequest, Error>) -> Void) {
        var urlRequest = urlRequest
        
        // 从Keychain获取Token
        if let token = KeychainService.shared.accessToken {
            urlRequest.headers.add(.authorization(bearerToken: token))
        }
        
        // 添加Content-Type头
        if !urlRequest.headers.contains(name: "Content-Type") {
            urlRequest.headers.add(.contentType("application/json"))
        }
        
        completion(.success(urlRequest))
    }
    
    // 处理重试逻辑
    func retry(_ request: Request, for session: Session, dueTo error: Error, completion: @escaping (RetryResult) -> Void) {
        guard let statusCode = request.response?.statusCode else {
            completion(.doNotRetry)
            return
        }
        
        // 如果是401错误，尝试刷新Token
        if statusCode == 401 {
            refreshToken { success in
                if success {
                    completion(.retryWithDelay(0.5))
                } else {
                    // 刷新Token失败，通知应用需要重新登录
                    NotificationCenter.default.post(name: .authTokenExpired, object: nil)
                    completion(.doNotRetry)
                }
            }
        } else {
            completion(.doNotRetry)
        }
    }
    
    // 刷新Token
    private func refreshToken(completion: @escaping (Bool) -> Void) {
        // 实现Token刷新逻辑
        guard let refreshToken = KeychainService.shared.refreshToken else {
            completion(false)
            return
        }
        
        let parameters = ["refreshToken": refreshToken]
        
        AF.request(APIEndpoint.refreshToken.url, method: .post, parameters: parameters, encoding: JSONEncoding.default)
            .validate(statusCode: 200..<300)
            .responseJSON { response in
                switch response.result {
                case .success(let value):
                    let json = JSON(value)
                    if let accessToken = json["data"]["accessToken"].string {
                        KeychainService.shared.accessToken = accessToken
                        completion(true)
                    } else {
                        completion(false)
                    }
                case .failure:
                    completion(false)
                }
            }
    }
}
```

## 3. 核心数据模型定义

### 3.1 User模型
```swift
import Foundation

struct User: Decodable, Identifiable, Equatable {
    let id: String
    let username: String
    let email: String
    let avatar: String?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case email
        case avatar
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    static func == (lhs: User, rhs: User) -> Bool {
        return lhs.id == rhs.id
    }
}

// 登录请求模型
struct LoginRequest: Encodable {
    let email: String
    let password: String
}

// 注册请求模型
struct RegisterRequest: Encodable {
    let username: String
    let email: String
    let password: String
}

// 登录响应模型
struct LoginResponse: Decodable {
    let accessToken: String
    let refreshToken: String
    let user: User
    
    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case user
    }
}
```

### 3.2 认知模型相关模型

#### 3.2.1 CognitiveModel模型
```swift
struct CognitiveModel: Decodable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let concepts: [CognitiveConcept]
    let relations: [CognitiveRelation]
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case concepts
        case relations
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// 认知模型创建请求
struct CognitiveModelCreateRequest: Encodable {
    let name: String
    let description: String?
}

// 认知模型更新请求
struct CognitiveModelUpdateRequest: Encodable {
    let name: String?
    let description: String?
}
```

#### 3.2.2 CognitiveConcept模型
```swift
struct CognitiveConcept: Decodable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let importance: Double
    let type: String
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case importance
        case type
        case createdAt = "created_at"
    }
}
```

#### 3.2.3 CognitiveRelation模型
```swift
struct CognitiveRelation: Decodable, Identifiable {
    let id: String
    let sourceId: String
    let targetId: String
    let type: String
    let strength: Double
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case sourceId = "source_id"
        case targetId = "target_id"
        case type
        case strength
        case createdAt = "created_at"
    }
}
```

### 3.3 语音交互相关模型

#### 3.3.1 SpeechToText模型
```swift
struct SpeechToTextRequest: Encodable {
    let audio: String // base64编码的音频数据
    let language: String
}

struct SpeechToTextResponse: Decodable {
    let text: String
}
```

#### 3.3.2 TextToSpeech模型
```swift
struct TextToSpeechRequest: Encodable {
    let text: String
    let voice: String
}

struct TextToSpeechResponse: Decodable {
    let audio: String // base64编码的音频数据
}
```

### 3.4 AI对话相关模型
```swift
struct AIConversationRequest: Encodable {
    let input: String
    let context: [String: Any]?
    let modelId: String
}

struct AIConversationResponse: Decodable {
    let response: String
    let context: [String: Any]
    let analysis: [String: Any]
}
```

### 3.5 分析相关模型

#### 3.5.1 MultiDimensionalAnalysis模型
```swift
struct MultiDimensionalAnalysis: Decodable, Identifiable {
    let id: String
    let modelId: String
    let thinkingTypes: ThinkingTypes
    let cognitiveStructure: CognitiveStructure
    let knowledgeDomains: [KnowledgeDomain]
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id = "analysisId"
        case modelId
        case thinkingTypes
        case cognitiveStructure
        case knowledgeDomains
        case createdAt
    }
}

struct ThinkingTypes: Decodable {
    let logical: Double
    let creative: Double
    let critical: Double
    let systematic: Double
}

struct CognitiveStructure: Decodable {
    let conceptDensity: Double
    let relationStrength: Double
    let hierarchyDepth: Double
    let connectivity: Double
}

struct KnowledgeDomain: Decodable {
    let domain: String
    let percentage: Double
    let depth: Double
}
```

#### 3.5.2 ThinkingTypeAnalysis模型
```swift
struct ThinkingTypeAnalysis: Decodable, Identifiable {
    let id: String
    let modelId: String
    let result: ThinkingTypeResult
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id = "analysisId"
        case modelId
        case result
        case createdAt
    }
}

struct ThinkingTypeResult: Decodable {
    let dominantType: String
    let types: ThinkingTypes
    let confidenceScores: ThinkingTypes
}
```

### 3.6 个性化设置模型
```swift
struct UserPreferences: Decodable, Encodable {
    var theme: String
    var fontSize: String
    var voiceSettings: VoiceSettings
    var notificationSettings: NotificationSettings
    var analysisPreferences: AnalysisPreferences
    
    struct VoiceSettings: Decodable, Encodable {
        var language: String
        var voice: String
    }
    
    struct NotificationSettings: Decodable, Encodable {
        var enabled: Bool
        var frequency: String
    }
    
    struct AnalysisPreferences: Decodable, Encodable {
        var preferredDimensions: [String]
        var reportFormat: String
    }
}
```

## 4. 基础ViewModel基类

### 4.1 BaseViewModel实现
```swift
import Combine
import Foundation

class BaseViewModel: ObservableObject {
    
    // 加载状态
    @Published var isLoading: Bool = false
    
    // 错误信息
    @Published var error: String? = nil
    
    // 空状态
    @Published var isEmpty: Bool = false
    
    // 成功信息
    @Published var successMessage: String? = nil
    
    // 取消令牌，用于取消Combine订阅
    private var cancellables = Set<AnyCancellable>()
    
    // 重置状态
    func resetState() {
        isLoading = false
        error = nil
        isEmpty = false
        successMessage = nil
    }
    
    // 处理API响应
    func handleResponse<T>(_ response: AnyPublisher<T, APIError>, completion: @escaping (T) -> Void) {
        isLoading = true
        error = nil
        
        response
            .receive(on: DispatchQueue.main)
            .sink {[weak self] completionResult in
                self?.isLoading = false
                
                switch completionResult {
                case .finished:
                    break
                case .failure(let apiError):
                    self?.error = apiError.errorDescription
                }
            } receiveValue: { [weak self] value in
                completion(value)
            }
            .store(in: &cancellables)
    }
    
    // 处理API错误
    func handleError(_ error: Error) {
        self.isLoading = false
        
        if let apiError = error as? APIError {
            self.error = apiError.errorDescription
        } else {
            self.error = error.localizedDescription
        }
    }
    
    // 处理成功信息
    func handleSuccess(_ message: String) {
        self.isLoading = false
        self.successMessage = message
        
        // 3秒后自动清除成功信息
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            self.successMessage = nil
        }
    }
    
    // 清理资源
    deinit {
        cancellables.forEach { $0.cancel() }
        cancellables.removeAll()
    }
}
```

## 5. KeychainService实现

```swift
import Foundation
import Security

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
```

## 6. 通知扩展
```swift
import Foundation

extension Notification.Name {
    static let authTokenExpired = Notification.Name("authTokenExpired")
    static let userLoggedIn = Notification.Name("userLoggedIn")
    static let userLoggedOut = Notification.Name("userLoggedOut")
    static let cognitiveModelUpdated = Notification.Name("cognitiveModelUpdated")
    static let analysisResultAvailable = Notification.Name("analysisResultAvailable")
}
```

## 7. 总结

### 7.1 今日完成
- ✅ 实现了API服务层，封装了网络请求逻辑
- ✅ 定义了核心数据模型，包括User、CognitiveModel、CognitiveConcept等
- ✅ 实现了数据模型的JSON解析和序列化
- ✅ 创建了基础的ViewModel基类，提供通用的状态管理和错误处理
- ✅ 实现了KeychainService，用于安全存储认证令牌
- ✅ 定义了应用级别的通知，用于组件间通信

### 7.2 明日计划
- 实现路由管理（基于SwiftUI NavigationStack）
- 创建基础UI组件（按钮、输入框、加载指示器等）
- 实现主题管理（颜色、字体等）
- 创建基础布局组件（容器、行、列等）
- 实现基础的状态管理（使用@ObservableObject）

### 7.3 设计亮点
- **模块化设计**：API服务层、数据模型和ViewModel基类相互独立，便于维护和扩展
- **强类型安全**：使用Swift结构体和枚举定义数据模型和API端点，确保类型安全
- **响应式编程**：结合Combine框架，实现数据的响应式更新
- **统一的错误处理**：集中处理API错误，提供清晰的错误信息
- **安全的令牌管理**：使用Keychain安全存储认证令牌，防止令牌泄露
- **可测试性**：API服务层采用协议设计，便于进行单元测试

通过今日的实现，我们建立了应用的基础架构，为后续的功能开发奠定了坚实的基础。API服务层提供了灵活、可扩展的网络请求能力，核心数据模型定义了应用的数据结构，ViewModel基类提供了通用的状态管理和错误处理逻辑。这些组件将在整个应用开发过程中扮演重要角色，确保应用的可维护性和可扩展性。
