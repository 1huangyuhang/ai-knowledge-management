import Foundation

enum MessageType: String, Codable {
    case user
    case ai
}

enum MessageStatus: String, Codable {
    case sending
    case sent
    case failed
    case received
    case processing
}

struct Message: Identifiable, Codable, Equatable {
    let id: UUID
    var content: String
    let type: MessageType
    var status: MessageStatus
    let timestamp: Date
    let modelId: UUID? // 关联的认知模型ID（可选）
    
    static func == (lhs: Message, rhs: Message) -> Bool {
        lhs.id == rhs.id
    }
}