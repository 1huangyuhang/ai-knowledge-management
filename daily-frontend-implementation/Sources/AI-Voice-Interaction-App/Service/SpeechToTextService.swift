import Foundation
import Combine

// 语音转文本服务协议
protocol SpeechToTextServiceProtocol {
    func sendSpeechResult(_ text: String) async throws
    func getSpeechToTextResult(audioData: Data, languageCode: String) async throws -> SpeechToTextResult
}

// 语音转文本结果结构
struct SpeechToTextResult: Codable {
    let text: String
    let confidence: Double
    let language: String
    
    enum CodingKeys: String, CodingKey {
        case text
        case confidence
        case language
    }
}

// 语音转文本服务实现
class SpeechToTextService: SpeechToTextServiceProtocol {
    private let apiClient: APIClientProtocol
    
    init(apiClient: APIClientProtocol = APIClient.shared) {
        self.apiClient = apiClient
    }
    
    // 发送语音识别结果到服务器
    func sendSpeechResult(_ text: String) async throws {
        // 简化实现，实际项目中需要使用正确的端点和请求格式
        let endpoint = Endpoint.aiTasks
        let requestBody = ["text": text]
        
        // 使用apiClient发送请求
        let publisher: AnyPublisher<EmptyResponse, APIError> = apiClient.post(endpoint, body: requestBody, headers: nil)
        let result: Result<EmptyResponse, APIError> = await publisher.asyncResult()
        switch result {
        case .success:
            return
        case .failure(let error):
            throw error
        }
    }
    
    // 获取语音转文本结果（将音频数据发送到服务器进行识别）
    func getSpeechToTextResult(audioData: Data, languageCode: String) async throws -> SpeechToTextResult {
        // 简化实现，实际项目中需要使用正确的端点和请求格式
        let endpoint = Endpoint.aiTasks
        
        // 使用apiClient发送请求
        // 注意：APIClientProtocol的upload方法接受[String: Any]类型的formData
        // 这里我们简化实现，实际项目中需要处理文件上传
        let formData: [String: Any] = [
            "audio": audioData,
            "languageCode": languageCode
        ]
        
        // 使用asyncResult()转换结果
        let publisher: AnyPublisher<SpeechToTextResult, APIError> = apiClient.upload(endpoint, formData: formData, headers: nil)
        let result: Result<SpeechToTextResult, APIError> = await publisher.asyncResult()
        switch result {
        case .success(let speechResult):
            return speechResult
        case .failure(let error):
            throw error
        }
    }
}

// 多部分表单数据结构
struct MultipartFormData {
    private var parts: [(data: Data, name: String, fileName: String?, mimeType: String?)] = []
    
    mutating func append(_ data: Data, withName name: String, fileName: String? = nil, mimeType: String? = nil) {
        parts.append((data: data, name: name, fileName: fileName, mimeType: mimeType))
    }
    
    var count: Int {
        return parts.count
    }
    
    func part(at index: Int) -> (data: Data, name: String, fileName: String?, mimeType: String?) {
        return parts[index]
    }
}