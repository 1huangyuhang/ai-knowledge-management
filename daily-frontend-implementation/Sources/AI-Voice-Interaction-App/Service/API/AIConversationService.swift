import Foundation
import Combine

protocol AIConversationServiceProtocol {
    func sendConversationMessage(content: String, modelId: UUID?) -> AnyPublisher<AIConversationResponse, Error>
    func interruptConversation(conversationId: UUID) -> AnyPublisher<Void, Error>
    func getConversationHistory(conversationId: UUID) -> AnyPublisher<[Message], Error>
    func createNewConversation() -> AnyPublisher<UUID, Error>
    func getConversationList() -> AnyPublisher<[AIConversationSummary], Error>
}

struct AIConversationSummary: Codable {
    let id: UUID
    let title: String
    let createdAt: Date
    let updatedAt: Date
    let messageCount: Int
}

struct AIConversationResponse: Codable {
    let content: String
    let modelId: UUID?
    let conversationId: UUID
    let isComplete: Bool
    let isStreaming: Bool
}

class AIConversationService: AIConversationServiceProtocol {
    private let apiClient: APIClientProtocol
    
    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }
    
    func sendConversationMessage(content: String, modelId: UUID? = nil) -> AnyPublisher<AIConversationResponse, Error> {
        // 使用具体的结构体作为请求体，确保Encodable协议符合
        struct SendMessageRequest: Encodable {
            let content: String
            let modelId: UUID?
            let stream: Bool
        }
        
        let requestBody = SendMessageRequest(
            content: content,
            modelId: modelId,
            stream: true
        )
        
        return apiClient.post(
            Endpoint.aiTaskExecute,
            body: requestBody,
            headers: [:]
        )
        .mapError { $0 as Error }
        .eraseToAnyPublisher()
    }
    
    func interruptConversation(conversationId: UUID) -> AnyPublisher<Void, Error> {
        let endpoint = Endpoint.aiTask(id: conversationId)
        return apiClient.post(
            endpoint,
            body: EmptyResponse(),
            headers: [:]
        )
        .map { (response: EmptyResponse) in () }
        .mapError { $0 as Error }
        .eraseToAnyPublisher()
    }
    
    func getConversationHistory(conversationId: UUID) -> AnyPublisher<[Message], Error> {
        let endpoint = Endpoint.aiTask(id: conversationId)
        return apiClient.get(
            endpoint,
            headers: [:]
        )
        .mapError { $0 as Error }
        .eraseToAnyPublisher()
    }
    
    func createNewConversation() -> AnyPublisher<UUID, Error> {
        return apiClient.post(
            Endpoint.aiTasks,
            body: EmptyResponse(),
            headers: [:]
        )
        .map { (response: AIConversationResponse) in
            return response.conversationId
        }
        .mapError { $0 as Error }
        .eraseToAnyPublisher()
    }
    
    func getConversationList() -> AnyPublisher<[AIConversationSummary], Error> {
        return apiClient.get(
            Endpoint.aiTasks,
            headers: [:]
        )
        .mapError { $0 as Error }
        .eraseToAnyPublisher()
    }
}