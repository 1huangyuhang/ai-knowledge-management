import Foundation
import Alamofire

/// API端点枚举
enum Endpoint {
    // 认证相关
    case login
    case register
    case refreshToken
    
    // 认知模型相关
    case cognitiveModels
    case cognitiveModel(id: String)
    case cognitiveModelCreate
    case cognitiveModelUpdate(id: String)
    case cognitiveModelDelete(id: String)
    
    // 认知概念相关
    case cognitiveConcepts(modelId: String)
    case cognitiveConcept(modelId: String, conceptId: String)
    
    // 认知关系相关
    case cognitiveRelations(modelId: String)
    case cognitiveRelation(modelId: String, relationId: String)
    
    // 语音交互相关
    case speechToText
    case textToSpeech
    
    // AI对话相关
    case aiConversation
    case aiTasks
    case aiTask(id: String)
    
    // 分析相关
    case multiDimensionalAnalysis(modelId: String)
    case thinkingTypeAnalysis(modelId: String)
    
    // 个性化设置相关
    case userPreferences
    case userPreferencesUpdate
    
    // HTTP方法
    var method: HTTPMethod {
        switch self {
        case .login, .register, .refreshToken, .cognitiveModelCreate, .speechToText, .textToSpeech, .aiConversation, .thinkingTypeAnalysis, .userPreferencesUpdate:
            return .post
        case .cognitiveModels, .cognitiveConcepts, .cognitiveRelations, .aiTasks, .multiDimensionalAnalysis, .userPreferences:
            return .get
        case .cognitiveModel(let id), .cognitiveConcept, .cognitiveRelation, .aiTask:
            return .get
        case .cognitiveModelUpdate(let id):
            return .put
        case .cognitiveModelDelete(let id):
            return .delete
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
        case .cognitiveModelCreate:
            return "/api/v1/models"
        case .cognitiveModelUpdate(let id):
            return "/api/v1/models/\(id)"
        case .cognitiveModelDelete(let id):
            return "/api/v1/models/\(id)"
        case .cognitiveConcepts(let modelId):
            return "/api/v1/models/\(modelId)/concepts"
        case .cognitiveConcept(let modelId, let conceptId):
            return "/api/v1/models/\(modelId)/concepts/\(conceptId)"
        case .cognitiveRelations(let modelId):
            return "/api/v1/models/\(modelId)/relations"
        case .cognitiveRelation(let modelId, let relationId):
            return "/api/v1/models/\(modelId)/relations/\(relationId)"
        case .speechToText:
            return "/api/v1/speech/transcriptions"
        case .textToSpeech:
            return "/api/v1/speech/syntheses"
        case .aiConversation:
            return "/api/v1/ai-tasks"
        case .aiTasks:
            return "/api/v1/ai-tasks"
        case .aiTask(let id):
            return "/api/v1/ai-tasks/\(id)"
        case .multiDimensionalAnalysis(let modelId):
            return "/api/v1/models/\(modelId)/analyses"
        case .thinkingTypeAnalysis(let modelId):
            return "/api/v1/models/\(modelId)/analyses/thinking-type"
        case .userPreferences, .userPreferencesUpdate:
            return "/api/v1/users/me/preferences"
        }
    }
    
    // 基础URL
    var baseURL: String {
        return "https://api.example.com" // 实际使用时替换为真实API地址
    }
    
    // 完整URL
    var url: String {
        return baseURL + path
    }
}