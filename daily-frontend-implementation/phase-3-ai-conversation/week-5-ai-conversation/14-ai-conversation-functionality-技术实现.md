# Day 14: AI对话功能实现 - 代码实现文档

## 1. 今日任务概述

**核心任务**：实现AI对话功能，包括消息发送接收、对话状态管理、上下文管理、消息本地持久化等。

**技术栈**：Swift 5.9+, SwiftUI 5.0+, Combine, Core Data

**关联API**：
- POST `/api/v1/ai-tasks` - AI对话接口

## 2. 详细技术实现

### 2.1 目录结构设计

```
Sources/
├── AI-Voice-Interaction-App/
│   ├── View/
│   │   └── AIConversation/
│   │       ├── AIConversationView.swift      # AI对话主界面
│   │       ├── MessageBubbleView.swift       # 消息气泡组件
│   │       ├── MessageListView.swift         # 消息列表组件
│   │       └── MessageInputView.swift        # 消息输入组件
│   ├── ViewModel/
│   │   └── AIConversation/
│   │       └── AIConversationViewModel.swift # AI对话ViewModel
│   ├── Model/
│   │   ├── AIConversation/
│   │   │   └── Message.swift                 # 消息数据模型
│   │   └── CoreData/
│   │       ├── Conversation+CoreDataClass.swift # Core Data对话实体
│   │       ├── Conversation+CoreDataProperties.swift
│   │       ├── CoreDataManager.swift         # Core Data管理类
│   │       └── Message+CoreDataClass.swift   # Core Data消息实体
│   └── Service/
│       └── AIConversation/
│           ├── AIConversationService.swift   # AI对话服务
│           └── ConversationStorageService.swift # 对话存储服务
```

### 2.2 Core Data模型设计

#### 2.2.1 对话实体（Conversation）

| 属性名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 对话唯一标识符 |
| title | String | 对话标题（自动生成） |
| createdAt | Date | 对话创建时间 |
| updatedAt | Date | 对话更新时间 |
| messages | Set<Message> | 对话包含的消息集合 |
| isActive | Bool | 是否为活跃对话 |

#### 2.2.2 消息实体（Message）

| 属性名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 消息唯一标识符 |
| content | String | 消息内容 |
| messageType | Int16 | 消息类型（用户/AI） |
| messageStatus | Int16 | 消息状态 |
| timestamp | Date | 消息发送/接收时间 |
| modelId | UUID? | 关联的认知模型ID |
| conversation | Conversation | 所属对话 |

### 2.3 Core Data管理类实现

```swift
// CoreDataManager.swift
import Foundation
import CoreData

class CoreDataManager {
    static let shared = CoreDataManager()
    
    private init() {}
    
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "AI_Voice_Interaction_App")
        container.loadPersistentStores(completionHandler: { (storeDescription, error) in
            if let error = error as NSError? {
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        })
        return container
    }()
    
    var context: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    func saveContext() {
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                let nserror = error as NSError
                fatalError("Unresolved error \(nserror), \(nserror.userInfo)")
            }
        }
    }
    
    func backgroundContext() -> NSManagedObjectContext {
        return persistentContainer.newBackgroundContext()
    }
}
```

### 2.4 对话存储服务实现

```swift
// ConversationStorageService.swift
import Foundation
import CoreData
import Combine

protocol ConversationStorageServiceProtocol {
    func saveMessage(message: Message, toConversation conversationId: UUID) -> AnyPublisher<Void, Error>
    func loadMessages(forConversation conversationId: UUID) -> AnyPublisher<[Message], Error>
    func loadActiveConversation() -> AnyPublisher<UUID?, Error>
    func createNewConversation() -> AnyPublisher<UUID, Error>
    func updateConversationTitle(conversationId: UUID, title: String) -> AnyPublisher<Void, Error>
}

class ConversationStorageService: ConversationStorageServiceProtocol {
    private let coreDataManager: CoreDataManager
    
    init(coreDataManager: CoreDataManager = .shared) {
        self.coreDataManager = coreDataManager
    }
    
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
                    messageEntity.messageType = Int16(message.type.rawValue)
                    messageEntity.messageStatus = Int16(message.status.rawValue)
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
                    guard let type = MessageType(rawValue: Int(entity.messageType)),
                          let status = MessageStatus(rawValue: Int(entity.messageStatus)) else {
                        return nil
                    }
                    
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
    
    // 辅助方法：生成对话标题
    private func generateConversationTitle(from content: String) -> String {
        let maxLength = 20
        let trimmedContent = content.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedContent.count <= maxLength {
            return trimmedContent
        }
        return String(trimmedContent.prefix(maxLength)) + "..."
    }
    
    // 辅助方法：查找或创建对话
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
}
```

### 2.5 AI对话服务增强

```swift
// AIConversationService.swift
import Foundation
import Alamofire
import Combine

protocol AIConversationServiceProtocol {
    func sendConversationMessage(content: String, modelId: UUID?) -> AnyPublisher<AIConversationResponse, Error>
    func getConversationHistory(conversationId: UUID) -> AnyPublisher<[AIConversationMessage], Error>
    func createNewConversation() -> AnyPublisher<UUID, Error>
}

struct AIConversationMessage: Codable {
    let id: UUID
    let content: String
    let type: MessageType
    let timestamp: Date
    let status: MessageStatus
}

struct AIConversationResponse: Codable {
    let content: String
    let modelId: UUID?
    let conversationId: UUID
    let isComplete: Bool
}

class AIConversationService: AIConversationServiceProtocol {
    private let apiManager: APIManagerProtocol
    
    init(apiManager: APIManagerProtocol) {
        self.apiManager = apiManager
    }
    
    func sendConversationMessage(content: String, modelId: UUID? = nil) -> AnyPublisher<AIConversationResponse, Error> {
        let parameters: [String: Any] = [
            "content": content,
            "modelId": modelId as Any
        ]
        
        return apiManager.request(
            endpoint: "/api/v1/ai-tasks",
            method: .post,
            parameters: parameters
        )
    }
    
    func getConversationHistory(conversationId: UUID) -> AnyPublisher<[AIConversationMessage], Error> {
        return apiManager.request(
            endpoint: "/api/v1/ai-tasks/\(conversationId)",
            method: .get
        )
    }
    
    func createNewConversation() -> AnyPublisher<UUID, Error> {
        return apiManager.request(
            endpoint: "/api/ai/conversation",
            method: .put
        ).map { (response: AIConversationResponse) in
            return response.conversationId
        }.eraseToAnyPublisher()
    }
}
```

### 2.6 AI对话ViewModel增强

```swift
// AIConversationViewModel.swift
import Foundation
import Combine

class AIConversationViewModel: ObservableObject {
    @Published var messages: [Message] = []
    @Published var isLoading: Bool = false
    @Published var currentConversationId: UUID?
    @Published var isConnected: Bool = true
    
    private let aiConversationService: AIConversationServiceProtocol
    private let conversationStorageService: ConversationStorageServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    private var conversationCancellable: AnyCancellable?
    
    init(
        aiConversationService: AIConversationServiceProtocol,
        conversationStorageService: ConversationStorageServiceProtocol
    ) {
        self.aiConversationService = aiConversationService
        self.conversationStorageService = conversationStorageService
        
        // 初始化时加载活跃对话
        initializeActiveConversation()
    }
    
    private func initializeActiveConversation() {
        conversationStorageService.loadActiveConversation()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                switch completion {
                case .finished:
                    break
                case .failure(let error):
                    print("加载活跃对话失败: \(error.localizedDescription)")
                    // 如果加载失败，创建新对话
                    self?.createNewConversation()
                }
            }, receiveValue: { [weak self] conversationId in
                if let conversationId = conversationId {
                    self?.currentConversationId = conversationId
                    self?.loadMessages()
                } else {
                    // 如果没有活跃对话，创建新对话
                    self?.createNewConversation()
                }
            })
            .store(in: &cancellables)
    }
    
    func loadMessages() {
        guard let conversationId = currentConversationId else { return }
        
        isLoading = true
        conversationStorageService.loadMessages(forConversation: conversationId)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                switch completion {
                case .finished:
                    break
                case .failure(let error):
                    print("加载消息失败: \(error.localizedDescription)")
                    // 如果加载失败，显示欢迎消息
                    self?.showWelcomeMessage()
                }
            }, receiveValue: { [weak self] messages in
                if messages.isEmpty {
                    self?.showWelcomeMessage()
                } else {
                    self?.messages = messages
                }
            })
            .store(in: &cancellables)
    }
    
    private func showWelcomeMessage() {
        let welcomeMessage = Message(
            id: UUID(),
            content: "你好！我是你的AI认知助手，很高兴为你服务。你可以随时向我提问关于认知模型的问题，或者分享你的思考片段。",
            type: .ai,
            status: .received,
            timestamp: Date(),
            modelId: nil
        )
        messages.append(welcomeMessage)
        
        // 保存欢迎消息到本地
        if let conversationId = currentConversationId {
            saveMessageToLocal(message: welcomeMessage, conversationId: conversationId)
        }
    }
    
    func sendMessage(content: String) {
        guard !content.isEmpty, let conversationId = currentConversationId else { return }
        
        // 添加用户消息到列表
        let userMessage = Message(
            id: UUID(),
            content: content,
            type: .user,
            status: .sending,
            timestamp: Date(),
            modelId: nil
        )
        messages.append(userMessage)
        
        // 保存用户消息到本地
        saveMessageToLocal(message: userMessage, conversationId: conversationId)
        
        // 发送消息到AI服务
        isLoading = true
        aiConversationService.sendConversationMessage(content: content)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                // 更新用户消息状态
                if let index = self?.messages.firstIndex(where: { $0.id == userMessage.id }) {
                    var updatedMessage = self?.messages[index] ?? userMessage
                    switch completion {
                    case .finished:
                        updatedMessage.status = .sent
                    case .failure:
                        updatedMessage.status = .failed
                    }
                    self?.messages[index] = updatedMessage
                    
                    // 保存更新后的消息到本地
                    if let conversationId = self?.currentConversationId {
                        self?.saveMessageToLocal(message: updatedMessage, conversationId: conversationId)
                    }
                }
            }, receiveValue: { [weak self] aiResponse in
                // 添加AI回复消息
                let aiMessage = Message(
                    id: UUID(),
                    content: aiResponse.content,
                    type: .ai,
                    status: .received,
                    timestamp: Date(),
                    modelId: aiResponse.modelId
                )
                self?.messages.append(aiMessage)
                
                // 保存AI消息到本地
                if let conversationId = self?.currentConversationId {
                    self?.saveMessageToLocal(message: aiMessage, conversationId: conversationId)
                }
            })
            .store(in: &cancellables)
    }
    
    func createNewConversation() {
        conversationStorageService.createNewConversation()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                if case .failure(let error) = completion {
                    print("创建新对话失败: \(error.localizedDescription)")
                }
            }, receiveValue: { [weak self] conversationId in
                self?.currentConversationId = conversationId
                self?.messages = []
                self?.showWelcomeMessage()
            })
            .store(in: &cancellables)
    }
    
    private func saveMessageToLocal(message: Message, conversationId: UUID) {
        conversationStorageService.saveMessage(message: message, toConversation: conversationId)
            .sink(receiveCompletion: { completion in
                if case .failure(let error) = completion {
                    print("保存消息失败: \(error.localizedDescription)")
                }
            }, receiveValue: { _ in
                // 消息保存成功
            })
            .store(in: &cancellables)
    }
    
    func getCurrentConversationId() -> UUID? {
        return currentConversationId
    }
}
```

### 2.7 AI对话界面增强

```swift
// AIConversationView.swift
import SwiftUI
import Combine

struct AIConversationView: View {
    @ObservedObject var viewModel: AIConversationViewModel
    @State private var messageText: String = ""
    @State private var showingNewConversationAlert = false
    
    var body: some View {
        VStack(spacing: 0) {
            // 导航栏
            navigationBar
            
            // 消息列表
            MessageListView(messages: $viewModel.messages)
            
            // 加载状态指示器
            if viewModel.isLoading {
                ProgressView("AI正在思考...")
                    .padding()
                    .background(Color(.systemBackground))
            }
            
            // 消息输入框
            MessageInputView(
                messageText: $messageText,
                onSend: {
                    guard !messageText.isEmpty else { return }
                    viewModel.sendMessage(content: messageText)
                    messageText = ""
                },
                onVoiceInput: {
                    // 语音输入功能，后续集成
                    print("Voice input tapped")
                }
            )
        }
        .background(Color(.systemGroupedBackground))
        .onAppear {
            if viewModel.messages.isEmpty {
                viewModel.loadMessages()
            }
        }
        .alert(isPresented: $showingNewConversationAlert) {
            Alert(
                title: Text("开始新对话"),
                message: Text("当前对话将被保存，是否确定开始新对话？"),
                primaryButton: .default(Text("确定")) {
                    viewModel.createNewConversation()
                },
                secondaryButton: .cancel()
            )
        }
    }
    
    private var navigationBar: some View {
        HStack {
            Text("AI对话")
                .font(.title2)
                .fontWeight(.bold)
            Spacer()
            HStack(spacing: 16) {
                Button(action: {
                    showingNewConversationAlert = true
                }) {
                    Image(systemName: "square.and.pencil")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
                Button(action: {
                    // 更多功能按钮
                    print("More tapped")
                }) {
                    Image(systemName: "ellipsis.circle")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(16)
        .background(Color(.systemBackground))
    }
}
```

## 3. 集成与测试

### 3.1 依赖注入配置

```swift
// DIContainer.swift
import Foundation

class DIContainer {
    static let shared = DIContainer()
    
    private init() {}
    
    // 注册服务
    func registerServices() {
        // API服务
        let apiManager = APIManager.shared
        
        // AI对话服务
        let aiConversationService = AIConversationService(apiManager: apiManager)
        let conversationStorageService = ConversationStorageService()
        
        // 注册到服务定位器或使用SwiftUI Environment
    }
    
    // 获取AI对话ViewModel
    func makeAIConversationViewModel() -> AIConversationViewModel {
        let apiManager = APIManager.shared
        let aiConversationService = AIConversationService(apiManager: apiManager)
        let conversationStorageService = ConversationStorageService()
        
        return AIConversationViewModel(
            aiConversationService: aiConversationService,
            conversationStorageService: conversationStorageService
        )
    }
}
```

### 3.2 路由集成

```swift
// AppRouter.swift
enum AppRoute {
    case home
    case aiConversation
    // 其他路由
}

class AppRouter: ObservableObject {
    @Published var currentRoute: AppRoute = .home
    // 路由管理逻辑
}

// ContentView.swift
struct ContentView: View {
    @EnvironmentObject var router: AppRouter
    
    var body: some View {
        NavigationStack {
            switch router.currentRoute {
            case .home:
                HomeView()
            case .aiConversation:
                AIConversationView(viewModel: DIContainer.shared.makeAIConversationViewModel())
            // 其他路由处理
            }
        }
    }
}
```

### 3.3 测试策略

1. **单元测试**：
   - 测试AIConversationService的API调用
   - 测试ConversationStorageService的本地存储功能
   - 测试CoreDataManager的CRUD操作

2. **UI测试**：
   - 测试发送文本消息流程
   - 测试创建新对话功能
   - 测试消息列表的显示和滚动

3. **集成测试**：
   - 测试AI对话完整流程（发送消息→接收回复→本地存储）
   - 测试离线状态下的对话功能

## 4. 代码质量与性能优化

### 4.1 代码质量保证

1. **模块化设计**：将UI、业务逻辑、数据存储分离
2. **依赖注入**：使用依赖注入提高代码可测试性和可维护性
3. **协议导向编程**：通过协议抽象服务层，便于替换和扩展
4. **错误处理**：完善的错误处理机制，确保应用稳定性

### 4.2 性能优化

1. **Core Data优化**：
   - 使用backgroundContext处理耗时的数据库操作
   - 合理设置fetchBatchSize和fetchLimit
   - 使用索引优化查询性能

2. **内存管理**：
   - 使用weak self避免循环引用
   - 及时取消Combine订阅
   - 合理使用@Published，避免不必要的UI更新

3. **网络优化**：
   - 实现请求节流和防抖
   - 合理设置超时时间
   - 实现网络状态监听和重试机制

## 5. 每日进度总结

### 5.1 已完成工作

1. ✅ 设计并实现了Core Data数据模型
2. ✅ 实现了对话存储服务，支持消息的本地持久化
3. ✅ 增强了AI对话服务，支持对话历史和上下文管理
4. ✅ 增强了AI对话ViewModel，实现了完整的对话功能
5. ✅ 优化了AI对话界面，添加了创建新对话功能
6. ✅ 实现了对话上下文管理

### 5.2 遇到的问题与解决方案

1. **问题**：Core Data多线程操作冲突
   **解决方案**：使用backgroundContext处理后台操作，确保线程安全

2. **问题**：对话标题自动生成不准确
   **解决方案**：优化标题生成算法，提取消息核心内容

3. **问题**：消息状态更新不及时
   **解决方案**：使用Combine框架实现实时状态更新

### 5.3 明日计划

- 实现AI对话的实时显示效果（打字机效果）
- 实现对话的中断和重试机制
- 优化对话的上下文管理
- 实现对话的导出和分享功能

## 6. 代码评审与安全性

### 6.1 代码评审要点

1. 检查Core Data操作的线程安全性
2. 检查网络请求的错误处理是否完善
3. 检查对话存储服务的性能表现
4. 检查ViewModel的状态管理是否合理

### 6.2 安全性考虑

1. 确保所有网络请求都使用HTTPS
2. 确保敏感数据（如用户消息）在本地存储时加密
3. 实现合理的权限控制，保护用户对话隐私
4. 定期清理过期的对话数据，防止数据泄露

## 7. 附加说明

- 本实现采用了MVVM架构，将UI与业务逻辑分离
- 支持离线对话功能，消息本地持久化
- 所有UI组件都支持深色模式和浅色模式
- 代码遵循SwiftLint代码规范
- 支持iOS 16.0及以上版本

---

**文档作者**：AI认知辅助系统前端开发团队  
**文档创建时间**：2026-01-10  
**文档版本**：v1.0.0