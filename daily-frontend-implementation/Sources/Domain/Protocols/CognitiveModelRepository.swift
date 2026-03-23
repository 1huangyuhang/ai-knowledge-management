import Foundation
import Combine

/// 认知模型服务协议
protocol CognitiveModelRepository {
    func getCognitiveModels() -> AnyPublisher<[CognitiveModel], APIError>
    func getCognitiveModel(id: String) -> AnyPublisher<CognitiveModel, APIError>
    func createCognitiveModel(name: String, description: String?) -> AnyPublisher<CognitiveModel, APIError>
    func updateCognitiveModel(id: String, name: String?, description: String?) -> AnyPublisher<CognitiveModel, APIError>
    func deleteCognitiveModel(id: String) -> AnyPublisher<Void, APIError>
    func getCognitiveConcepts(modelId: String) -> AnyPublisher<[CognitiveConcept], APIError>
    func getCognitiveRelations(modelId: String) -> AnyPublisher<[CognitiveRelation], APIError>
}