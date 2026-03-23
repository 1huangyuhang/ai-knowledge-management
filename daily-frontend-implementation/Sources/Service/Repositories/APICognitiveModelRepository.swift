import Foundation
import Combine
import Alamofire

/// API认知模型服务实现
class APICognitiveModelRepository: CognitiveModelRepository {
    
    // 依赖注入：API客户端
    private let apiClient: APIClientProtocol
    
    // 初始化
    init(apiClient: APIClientProtocol = APIClient.shared) {
        self.apiClient = apiClient
    }
    
    // 获取认知模型列表
    func getCognitiveModels() -> AnyPublisher<[CognitiveModel], APIError> {
        return apiClient.request(Endpoint.cognitiveModels, parameters: nil, headers: nil)
    }
    
    // 获取单个认知模型
    func getCognitiveModel(id: String) -> AnyPublisher<CognitiveModel, APIError> {
        return apiClient.request(Endpoint.cognitiveModel(id: id), parameters: nil, headers: nil)
    }
    
    // 创建认知模型
    func createCognitiveModel(name: String, description: String?) -> AnyPublisher<CognitiveModel, APIError> {
        let request = CognitiveModelCreateRequest(name: name, description: description)
        return apiClient.request(Endpoint.cognitiveModelCreate, parameters: request.toDictionary(), headers: nil)
    }
    
    // 更新认知模型
    func updateCognitiveModel(id: String, name: String?, description: String?) -> AnyPublisher<CognitiveModel, APIError> {
        let request = CognitiveModelUpdateRequest(name: name, description: description)
        return apiClient.request(Endpoint.cognitiveModelUpdate(id: id), parameters: request.toDictionary(), headers: nil)
    }
    
    // 删除认知模型
    func deleteCognitiveModel(id: String) -> AnyPublisher<Void, APIError> {
        return Future<Void, APIError> { [weak self] promise in
            guard let self = self else { return }
            
            self.apiClient.request(Endpoint.cognitiveModelDelete(id: id), parameters: nil, headers: nil)
                .sink {completion in
                    if case .failure(let error) = completion {
                        promise(.failure(error))
                    } else {
                        promise(.success(()))
                    }
                } receiveValue: { (_: Any) in
                    promise(.success(()))
                }
                .store(in: &self.cancellables)
        }
        .eraseToAnyPublisher()
    }
    
    // 获取认知模型的概念列表
    func getCognitiveConcepts(modelId: String) -> AnyPublisher<[CognitiveConcept], APIError> {
        return apiClient.request(Endpoint.cognitiveConcepts(modelId: modelId), parameters: nil, headers: nil)
    }
    
    // 获取认知模型的关系列表
    func getCognitiveRelations(modelId: String) -> AnyPublisher<[CognitiveRelation], APIError> {
        return apiClient.request(Endpoint.cognitiveRelations(modelId: modelId), parameters: nil, headers: nil)
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