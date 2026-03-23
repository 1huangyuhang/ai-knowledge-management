import Foundation
import CoreData
import Combine

/// 对话存储服务协议
protocol ConversationStorageServiceProtocol {
    /// 保存消息到指定对话
    /// - Parameters:
    ///   - message: 消息对象
    ///   - conversationId: 对话ID
    /// - Returns: 发布者
    func saveMessage(message: Message, toConversation conversationId: UUID) -> AnyPublisher<Void, Error>
    
    /// 加载指定对话的消息
    /// - Parameter conversationId: 对话ID
    /// - Returns: 发布者
    func loadMessages(forConversation conversationId: UUID) -> AnyPublisher<[Message], Error>
    
    /// 加载活跃对话
    /// - Returns: 发布者
    func loadActiveConversation() -> AnyPublisher<UUID?, Error>
    
    /// 创建新对话
    /// - Returns: 发布者
    func createNewConversation() -> AnyPublisher<UUID, Error>
    
    /// 更新对话标题
    /// - Parameters:
    ///   - conversationId: 对话ID
    ///   - title: 新标题
    /// - Returns: 发布者
    func updateConversationTitle(conversationId: UUID, title: String) -> AnyPublisher<Void, Error>
}

/// 对话存储服务实现
class ConversationStorageService: ConversationStorageServiceProtocol {
    /// Core Data管理类
    private let coreDataManager: CoreDataManager
    
    /// 初始化方法
    /// - Parameter coreDataManager: Core Data管理类实例
    init(coreDataManager: CoreDataManager = .shared) {
        self.coreDataManager = coreDataManager
    }
    
    /// 保存消息到指定对话
    /// - Parameters:
    ///   - message: 消息对象
    ///   - conversationId: 对话ID
    /// - Returns: 发布者
    func saveMessage(message: Message, toConversation conversationId: UUID) -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.backgroundContext()
            context.perform {
                do {
                    // 查找或创建对话
                    let conversation = try self.findOrCreateConversation(by: conversationId, in: context)
                    
                    // 创建Core Data消息实体
                    let messageEntity = MessageEntity(context: context)
                    messageEntity.id = message.id
                    messageEntity.content = message.content
                    messageEntity.messageType = NSNumber(value: message.type == .user ? 0 : 1)
                    messageEntity.messageStatus = NSNumber(value: self.statusToInt(message.status))
                    messageEntity.timestamp = message.timestamp
                    messageEntity.modelId = message.modelId
                    messageEntity.conversation = conversation
                    
                    // 更新对话时间
                    conversation.updatedAt = Date()
                    
                    // 如果是第一条消息，生成对话标题
                    if conversation.title == nil || conversation.title == "" {
                        conversation.title = self.generateConversationTitle(from: message.content)
                    }
                    
                    try context.save()
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }.eraseToAnyPublisher()
    }
    
    /// 加载指定对话的消息
    /// - Parameter conversationId: 对话ID
    /// - Returns: 发布者
    func loadMessages(forConversation conversationId: UUID) -> AnyPublisher<[Message], Error> {
        return Future<[Message], Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.context
            
            do {
                // 构建查询请求
                let fetchRequest: NSFetchRequest<MessageEntity> = MessageEntity.fetchRequest()
                fetchRequest.predicate = NSPredicate(
                    format: "conversation.id == %@", conversationId as CVarArg
                )
                fetchRequest.sortDescriptors = [NSSortDescriptor(keyPath: \MessageEntity.timestamp, ascending: true)]
                
                // 执行查询
                let messageEntities = try context.fetch(fetchRequest)
                
                // 转换为领域模型
                let messages = messageEntities.compactMap { entity -> Message? in
                    guard let messageType = entity.messageType as? Int,
                          let messageStatus = entity.messageStatus as? Int else { return nil }
                    
                    let type = messageType == 0 ? MessageType.user : MessageType.ai
                    let status = self.intToStatus(messageStatus)
                    
                    return Message(
                        id: entity.id ?? UUID(),
                        content: entity.content ?? "",
                        type: type,
                        status: status,
                        timestamp: entity.timestamp ?? Date(),
                        modelId: entity.modelId
                    )
                }
                
                promise(.success(messages))
            } catch {
                promise(.failure(error))
            }
        }.eraseToAnyPublisher()
    }
    
    /// 加载活跃对话
    /// - Returns: 发布者
    func loadActiveConversation() -> AnyPublisher<UUID?, Error> {
        return Future<UUID?, Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.context
            
            do {
                // 查找活跃对话
                let fetchRequest: NSFetchRequest<ConversationEntity> = ConversationEntity.fetchRequest()
                fetchRequest.predicate = NSPredicate(format: "isActive == %@", NSNumber(value: true))
                fetchRequest.fetchLimit = 1
                
                let conversations = try context.fetch(fetchRequest)
                promise(.success(conversations.first?.id))
            } catch {
                promise(.failure(error))
            }
        }.eraseToAnyPublisher()
    }
    
    /// 创建新对话
    /// - Returns: 发布者
    func createNewConversation() -> AnyPublisher<UUID, Error> {
        return Future<UUID, Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.backgroundContext()
            context.perform {
                do {
                    // 先将所有对话设置为非活跃
                    let fetchRequest: NSFetchRequest<ConversationEntity> = ConversationEntity.fetchRequest()
                    let conversations = try context.fetch(fetchRequest)
                    conversations.forEach { $0.isActive = false }
                    
                    // 创建新对话
                    let conversation = ConversationEntity(context: context)
                    conversation.id = UUID()
                    conversation.title = "新对话"
                    conversation.createdAt = Date()
                    conversation.updatedAt = Date()
                    conversation.isActive = true
                    
                    try context.save()
                    promise(.success(conversation.id!))
                } catch {
                    promise(.failure(error))
                }
            }
        }.eraseToAnyPublisher()
    }
    
    /// 更新对话标题
    /// - Parameters:
    ///   - conversationId: 对话ID
    ///   - title: 新标题
    /// - Returns: 发布者
    func updateConversationTitle(conversationId: UUID, title: String) -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { [weak self] promise in
            guard let self = self else { return }
            
            let context = self.coreDataManager.backgroundContext()
            context.perform {
                do {
                    let fetchRequest: NSFetchRequest<ConversationEntity> = ConversationEntity.fetchRequest()
                    fetchRequest.predicate = NSPredicate(format: "id == %@", conversationId as CVarArg)
                    
                    if let conversation = try context.fetch(fetchRequest).first {
                        conversation.title = title
                        conversation.updatedAt = Date()
                        try context.save()
                    }
                    
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }.eraseToAnyPublisher()
    }
    
    // MARK: - 辅助方法
    
    /// 生成对话标题
    /// - Parameter content: 消息内容
    /// - Returns: 对话标题
    private func generateConversationTitle(from content: String) -> String {
        let maxLength = 20
        let trimmedContent = content.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedContent.count <= maxLength {
            return trimmedContent
        }
        return String(trimmedContent.prefix(maxLength)) + "..."
    }
    
    /// 查找或创建对话
    /// - Parameters:
    ///   - id: 对话ID
    ///   - context: 上下文
    /// - Returns: 对话实体
    /// - Throws: 错误
    private func findOrCreateConversation(by id: UUID, in context: NSManagedObjectContext) throws -> ConversationEntity {
        let fetchRequest: NSFetchRequest<ConversationEntity> = ConversationEntity.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", id as CVarArg)
        
        if let conversation = try context.fetch(fetchRequest).first {
            return conversation
        } else {
            let conversation = ConversationEntity(context: context)
            conversation.id = id
            conversation.title = "新对话"
            conversation.createdAt = Date()
            conversation.updatedAt = Date()
            conversation.isActive = true
            return conversation
        }
    }
    
    /// 将 MessageStatus 转换为整数
    /// - Parameter status: 消息状态
    /// - Returns: 对应的整数
    private func statusToInt(_ status: MessageStatus) -> Int {
        switch status {
        case .sending:
            return 0
        case .sent:
            return 1
        case .failed:
            return 2
        case .received:
            return 3
        case .processing:
            return 4
        }
    }
    
    /// 将整数转换为 MessageStatus
    /// - Parameter intValue: 整数值
    /// - Returns: 对应的消息状态
    private func intToStatus(_ intValue: Int) -> MessageStatus {
        switch intValue {
        case 0:
            return .sending
        case 1:
            return .sent
        case 2:
            return .failed
        case 3:
            return .received
        case 4:
            return .processing
        default:
            return .received
        }
    }
}

// MARK: - Core Data实体类

/// 对话实体类
@objc(ConversationEntity)
public class ConversationEntity: NSManagedObject {
    @NSManaged public var id: UUID?
    @NSManaged public var title: String?
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
    @NSManaged public var isActive: Bool
    @NSManaged public var messages: Set<MessageEntity>?
}

/// 消息实体类
@objc(MessageEntity)
public class MessageEntity: NSManagedObject {
    @NSManaged public var id: UUID?
    @NSManaged public var content: String?
    @NSManaged public var messageType: NSNumber?
    @NSManaged public var messageStatus: NSNumber?
    @NSManaged public var timestamp: Date?
    @NSManaged public var modelId: UUID?
    @NSManaged public var conversation: ConversationEntity?
}

extension ConversationEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<ConversationEntity> {
        return NSFetchRequest<ConversationEntity>(entityName: "ConversationEntity")
    }
}

extension MessageEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<MessageEntity> {
        return NSFetchRequest<MessageEntity>(entityName: "MessageEntity")
    }
}