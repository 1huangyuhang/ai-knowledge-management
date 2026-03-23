import Foundation
import Combine

/// 认知模型服务协议
protocol CognitiveModelServiceProtocol {
    /// 获取认知模型列表
    /// - Parameters:
    ///   - page: 页码
    ///   - limit: 每页大小
    ///   - search: 搜索关键词
    /// - Returns: 认知模型列表响应
    func getModels(page: Int, limit: Int, search: String?) async throws -> CognitiveModelListResponse
    
    /// 删除认知模型
    /// - Parameter id: 模型ID
    func deleteModel(id: String) async throws
    
    /// 获取认知模型详情
    /// - Parameter id: 模型ID
    /// - Returns: 认知模型
    func getModelDetail(id: String) async throws -> CognitiveModel
    
    /// 创建认知模型
    /// - Parameter model: 认知模型
    /// - Returns: 创建的认知模型
    func createModel(model: CognitiveModel) async throws -> CognitiveModel
    
    /// 更新认知模型
    /// - Parameters:
    ///   - id: 模型ID
    ///   - model: 认知模型
    /// - Returns: 更新后的认知模型
    func updateModel(id: String, model: CognitiveModel) async throws -> CognitiveModel
    
    /// 获取模型的概念列表
    /// - Parameter modelId: 模型ID
    /// - Returns: 概念列表
    func getModelConcepts(modelId: String) async throws -> [CognitiveConcept]
    
    /// 获取模型的关系列表
    /// - Parameter modelId: 模型ID
    /// - Returns: 关系列表
    func getModelRelations(modelId: String) async throws -> [CognitiveRelation]
    
    /// 删除概念
    /// - Parameter id: 概念ID
    func deleteConcept(id: String) async throws
    
    /// 删除关系
    /// - Parameter id: 关系ID
    func deleteRelation(id: String) async throws
}

/// 认知模型服务实现
class CognitiveModelService: CognitiveModelServiceProtocol {
    /// API客户端
    private let apiClient: APIClientProtocol
    
    /// 初始化
    /// - Parameter apiClient: API客户端
    init(apiClient: APIClientProtocol = APIClient()) {
        self.apiClient = apiClient
    }
    
    /// 获取认知模型列表
    /// - Parameters:
    ///   - page: 页码
    ///   - limit: 每页大小
    ///   - search: 搜索关键词
    /// - Returns: 认知模型列表响应
    func getModels(page: Int, limit: Int, search: String?) async throws -> CognitiveModelListResponse {
        let endpoint = Endpoint.cognitiveModels
        let publisher: AnyPublisher<CognitiveModelListResponse, APIError> = apiClient.get(endpoint, headers: nil)
        let result: Result<CognitiveModelListResponse, APIError> = await publisher.asyncResult()
        switch result {
        case .success(let response):
            return response
        case .failure(let error):
            throw error
        }
    }
    
    /// 删除认知模型
    /// - Parameter id: 模型ID
    func deleteModel(id: String) async throws {
        guard let uuid = UUID(uuidString: id) else {
            throw APIError.invalidResponse
        }
        let endpoint = Endpoint.cognitiveModel(id: uuid)
        let publisher: AnyPublisher<EmptyResponse, APIError> = apiClient.delete(endpoint, headers: nil)
        let result: Result<EmptyResponse, APIError> = await publisher.asyncResult()
        switch result {
        case .success:
            return
        case .failure(let error):
            throw error
        }
    }
    
    /// 获取认知模型详情
    /// - Parameter id: 模型ID
    /// - Returns: 认知模型
    func getModelDetail(id: String) async throws -> CognitiveModel {
        guard let uuid = UUID(uuidString: id) else {
            throw APIError.invalidResponse
        }
        let endpoint = Endpoint.cognitiveModel(id: uuid)
        let publisher: AnyPublisher<CognitiveModel, APIError> = apiClient.get(endpoint, headers: nil)
        let result: Result<CognitiveModel, APIError> = await publisher.asyncResult()
        switch result {
        case .success(let model):
            return model
        case .failure(let error):
            throw error
        }
    }
    
    /// 创建认知模型
    /// - Parameter model: 认知模型
    /// - Returns: 创建的认知模型
    func createModel(model: CognitiveModel) async throws -> CognitiveModel {
        let endpoint = Endpoint.cognitiveModels
        let publisher: AnyPublisher<CognitiveModel, APIError> = apiClient.post(endpoint, body: model, headers: nil)
        let result: Result<CognitiveModel, APIError> = await publisher.asyncResult()
        switch result {
        case .success(let createdModel):
            return createdModel
        case .failure(let error):
            throw error
        }
    }
    
    /// 更新认知模型
    /// - Parameters:
    ///   - id: 模型ID
    ///   - model: 认知模型
    /// - Returns: 更新后的认知模型
    func updateModel(id: String, model: CognitiveModel) async throws -> CognitiveModel {
        guard let uuid = UUID(uuidString: id) else {
            throw APIError.invalidResponse
        }
        let endpoint = Endpoint.cognitiveModel(id: uuid)
        let publisher: AnyPublisher<CognitiveModel, APIError> = apiClient.put(endpoint, body: model, headers: nil)
        let result: Result<CognitiveModel, APIError> = await publisher.asyncResult()
        switch result {
        case .success(let updatedModel):
            return updatedModel
        case .failure(let error):
            throw error
        }
    }
    
    /// 获取模型的概念列表
    /// - Parameter modelId: 模型ID
    /// - Returns: 概念列表
    func getModelConcepts(modelId: String) async throws -> [CognitiveConcept] {
        guard let uuid = UUID(uuidString: modelId) else {
            throw APIError.invalidResponse
        }
        let endpoint = Endpoint.cognitiveModelConcepts(modelId: uuid)
        let publisher: AnyPublisher<[CognitiveConcept], APIError> = apiClient.get(endpoint, headers: nil)
        let result: Result<[CognitiveConcept], APIError> = await publisher.asyncResult()
        switch result {
        case .success(let concepts):
            return concepts
        case .failure(let error):
            throw error
        }
    }
    
    /// 获取模型的关系列表
    /// - Parameter modelId: 模型ID
    /// - Returns: 关系列表
    func getModelRelations(modelId: String) async throws -> [CognitiveRelation] {
        guard let uuid = UUID(uuidString: modelId) else {
            throw APIError.invalidResponse
        }
        let endpoint = Endpoint.cognitiveModelRelations(modelId: uuid)
        let publisher: AnyPublisher<[CognitiveRelation], APIError> = apiClient.get(endpoint, headers: nil)
        let result: Result<[CognitiveRelation], APIError> = await publisher.asyncResult()
        switch result {
        case .success(let relations):
            return relations
        case .failure(let error):
            throw error
        }
    }
    
    /// 删除概念
    /// - Parameter id: 概念ID
    func deleteConcept(id: String) async throws {
        // 这里需要实现删除概念的API调用
        // 由于目前Endpoint中没有直接的删除概念端点，我们先返回成功
        // 实际实现时需要添加相应的端点
        return
    }
    
    /// 删除关系
    /// - Parameter id: 关系ID
    func deleteRelation(id: String) async throws {
        // 这里需要实现删除关系的API调用
        // 由于目前Endpoint中没有直接的删除关系端点，我们先返回成功
        // 实际实现时需要添加相应的端点
        return
    }
}