import Foundation

/// API端点枚举
enum Endpoint {
    // MARK: - 认证相关
    case auth(AuthEndpoint)
    
    // MARK: - 认知模型相关
    case cognitiveModels
    case cognitiveModel(id: UUID)
    case cognitiveModelConcepts(modelId: UUID)
    case cognitiveModelRelations(modelId: UUID)
    case cognitiveModelInsights(modelId: UUID)
    
    // MARK: - 思想片段相关
    case thoughts
    case thought(id: UUID)
    case thoughtProcess(id: UUID)
    
    // MARK: - AI任务相关
    case aiTasks
    case aiTask(id: UUID)
    case aiTaskExecute
    
    // MARK: - 设置相关
    case settings
    case updateSettings
    
    // MARK: - 获取完整URL路径
    var path: String {
        switch self {
        // 认证相关
        case .auth(let endpoint):
            return endpoint.path
            
        // 认知模型相关
        case .cognitiveModels:
            return "/models"
        case .cognitiveModel(let id):
            return "/models/\(id.uuidString)"
        case .cognitiveModelConcepts(let modelId):
            return "/models/\(modelId.uuidString)/concepts"
        case .cognitiveModelRelations(let modelId):
            return "/models/\(modelId.uuidString)/relations"
        case .cognitiveModelInsights(let modelId):
            return "/models/\(modelId.uuidString)/insights"
            
        // 思想片段相关
        case .thoughts:
            return "/thoughts"
        case .thought(let id):
            return "/thoughts/\(id.uuidString)"
        case .thoughtProcess(let id):
            return "/thoughts/\(id.uuidString)/process"
            
        // AI任务相关
        case .aiTasks:
            return "/ai-tasks"
        case .aiTask(let id):
            return "/ai-tasks/\(id.uuidString)"
        case .aiTaskExecute:
            return "/ai-tasks/execute"
        
        // 设置相关
        case .settings:
            return "/settings"
        case .updateSettings:
            return "/settings"
        }
    }
    
    /// HTTP请求方法
    var method: HTTPMethod {
        switch self {
        // 认证相关
        case .auth(let endpoint):
            return endpoint.method
            
        // 认知模型相关
        case .cognitiveModels, .cognitiveModel, .cognitiveModelConcepts, .cognitiveModelRelations, .cognitiveModelInsights:
            return .get
            
        // 思想片段相关
        case .thoughts, .thought:
            return .get
        case .thoughtProcess:
            return .post
            
        // AI任务相关
        case .aiTasks, .aiTask:
            return .get
        case .aiTaskExecute:
            return .post
        
        // 设置相关
        case .settings:
            return .get
        case .updateSettings:
            return .put
        }
    }
}

/// 认证端点枚举
enum AuthEndpoint {
    case login
    case register
    case refreshToken
    case logout
    case me
    case validateToken
    
    /// 获取完整URL路径
    var path: String {
        switch self {
        case .login:
            return "/auth/login"
        case .register:
            return "/auth/register"
        case .refreshToken:
            return "/auth/refresh"
        case .logout:
            return "/auth/logout"
        case .me, .validateToken:
            return "/auth/me"
        }
    }
    
    /// HTTP请求方法
    var method: HTTPMethod {
        switch self {
        case .login, .register, .refreshToken:
            return .post
        case .logout:
            return .delete
        case .me, .validateToken:
            return .get
        }
    }
}

/// HTTP请求方法枚举
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
    case patch = "PATCH"
}
