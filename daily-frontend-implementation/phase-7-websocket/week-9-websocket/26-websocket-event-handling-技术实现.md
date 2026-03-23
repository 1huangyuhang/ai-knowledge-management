# Day 26: WebSocket事件处理 - 技术实现文档

## 核心任务
实现WebSocket事件的处理机制，包括事件类型定义、事件分发、业务事件处理、事件缓存和优先级管理。

## 技术实现细节

### 1. 事件处理机制设计

**核心功能**：实现WebSocket事件的接收、解析、分发和处理，支持不同类型业务事件的灵活扩展。

**技术选型**：基于Combine框架实现事件流处理，结合观察者模式实现事件分发，使用队列和优先级机制管理事件处理顺序。

**文件结构**：
```
Sources/
└── AI-Voice-Interaction-App/
    ├── Service/
    │   ├── WebSocket/
    │   │   ├── WebSocketEventManager.swift
    │   │   ├── WebSocketEventProcessor.swift
    │   │   └── WebSocketEventQueue.swift
    │   └── EventBus/
    │       ├── EventBus.swift
    │       └── EventSubscription.swift
    ├── Model/
    │   └── WebSocket/
    │       ├── WebSocketEventPayloads.swift
    │       └── WebSocketEventPriority.swift
    └── ViewModel/
        └── WebSocket/
            └── WebSocketEventViewModel.swift
```

### 2. 事件总线设计

**核心代码**：

```swift
// EventBus.swift - 实现全局事件总线
import Foundation
import Combine

class EventBus {
    static let shared = EventBus()
    
    private init() {}
    
    private var subscribers = [String: [AnyCancellable]]()
    private let queue = DispatchQueue(label: "com.aivoice.eventbus", qos: .userInteractive)
    
    // 发布事件
    func publish<T>(_ event: T) where T: Event {
        queue.async {
            // 获取事件类型的唯一标识符
            let eventType = String(describing: type(of: event))
            
            // 遍历该事件类型的所有订阅者
            if let cancellables = self.subscribers[eventType] {
                cancellables.forEach { cancellable in
                    // 发布事件到每个订阅者
                    // 这里使用Combine的Subject实现
                    if let subject = cancellable as? PassthroughSubject<T, Never> {
                        subject.send(event)
                    }
                }
            }
        }
    }
    
    // 订阅事件
    func subscribe<T>(_ eventType: T.Type, handler: @escaping (T) -> Void) -> AnyCancellable where T: Event {
        // 创建一个PassthroughSubject用于传递事件
        let subject = PassthroughSubject<T, Never>()
        
        // 订阅该Subject
        let cancellable = subject.sink(receiveValue: handler)
        
        // 获取事件类型的唯一标识符
        let eventTypeId = String(describing: eventType)
        
        // 将订阅者添加到订阅者列表
        if subscribers[eventTypeId] == nil {
            subscribers[eventTypeId] = []
        }
        subscribers[eventTypeId]?.append(cancellable as AnyCancellable)
        
        return cancellable
    }
    
    // 取消订阅
    func unsubscribe(_ cancellable: AnyCancellable) {
        queue.async {
            // 遍历所有事件类型的订阅者
            for (eventType, cancellables) in self.subscribers {
                // 过滤掉要取消的订阅者
                self.subscribers[eventType] = cancellables.filter { $0 !== cancellable }
            }
        }
    }
}

// Event.swift - 事件协议
protocol Event {
    var timestamp: Date { get }
    var priority: EventPriority { get }
}

// EventPriority.swift - 事件优先级枚举
enum EventPriority: Int, Comparable {
    case low = 0
    case medium = 1
    case high = 2
    case critical = 3
    
    static func < (lhs: EventPriority, rhs: EventPriority) -> Bool {
        return lhs.rawValue < rhs.rawValue
    }
}
```

### 3. WebSocket事件处理管理器

**核心代码**：

```swift
// WebSocketEventManager.swift - WebSocket事件处理核心管理器
import Foundation
import Combine

class WebSocketEventManager {
    private let webSocketService: WebSocketServiceProtocol
    private let eventBus: EventBus
    private let eventQueue: WebSocketEventQueue
    private let eventProcessor: WebSocketEventProcessor
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    init(webSocketService: WebSocketServiceProtocol, 
         eventBus: EventBus = .shared, 
         eventQueue: WebSocketEventQueue = WebSocketEventQueue(),
         eventProcessor: WebSocketEventProcessor = WebSocketEventProcessor()) {
        self.webSocketService = webSocketService
        self.eventBus = eventBus
        self.eventQueue = eventQueue
        self.eventProcessor = eventProcessor
        
        setupEventSubscription()
    }
    
    // MARK: - Event Subscription Setup
    private func setupEventSubscription() {
        // 订阅WebSocket消息
        webSocketService.messagePublisher
            .sink { [weak self] message in
                guard let self = self else { return }
                self.processWebSocketMessage(message)
            }
            .store(in: &cancellables)
    }
    
    // MARK: - WebSocket Message Processing
    private func processWebSocketMessage(_ message: WebSocketMessage) {
        // 1. 将WebSocket消息转换为应用事件
        guard let appEvent = convertToAppEvent(message) else {
            print("Failed to convert WebSocket message to app event: \(message.type.rawValue)")
            return
        }
        
        // 2. 将事件加入优先级队列
        eventQueue.enqueue(event: appEvent)
        
        // 3. 处理队列中的事件
        processNextEvent()
    }
    
    // MARK: - WebSocket Message to App Event Conversion
    private func convertToAppEvent(_ message: WebSocketMessage) -> (any Event)? {
        do {
            switch message.type {
            case .modelUpdated:
                return try convertToModelUpdatedEvent(message)
            case .analysisResult:
                return try convertToAnalysisResultEvent(message)
            case .conversationMessage:
                return try convertToConversationMessageEvent(message)
            default:
                // 系统消息已在WebSocketService中处理
                return nil
            }
        } catch {
            print("Error converting WebSocket message to app event: \(error)")
            return nil
        }
    }
    
    // MARK: - Specific Event Conversions
    private func convertToModelUpdatedEvent(_ message: WebSocketMessage) throws -> ModelUpdatedEvent {
        let jsonData = try JSONSerialization.data(withJSONObject: message.payload, options: [])
        let payload = try JSONDecoder().decode(ModelUpdatedPayload.self, from: jsonData)
        return ModelUpdatedEvent(
            modelId: payload.modelId,
            updates: payload.updates,
            timestamp: message.timestamp,
            priority: .high
        )
    }
    
    private func convertToAnalysisResultEvent(_ message: WebSocketMessage) throws -> AnalysisResultEvent {
        let jsonData = try JSONSerialization.data(withJSONObject: message.payload, options: [])
        let payload = try JSONDecoder().decode(AnalysisResultPayload.self, from: jsonData)
        return AnalysisResultEvent(
            analysisId: payload.analysisId,
            modelId: payload.modelId,
            analysisType: payload.analysisType,
            result: payload.result,
            timestamp: message.timestamp,
            priority: .medium
        )
    }
    
    private func convertToConversationMessageEvent(_ message: WebSocketMessage) throws -> ConversationMessageEvent {
        let jsonData = try JSONSerialization.data(withJSONObject: message.payload, options: [])
        let payload = try JSONDecoder().decode(ConversationMessagePayload.self, from: jsonData)
        return ConversationMessageEvent(
            conversationId: payload.conversationId,
            message: payload.message,
            sender: payload.sender,
            timestamp: message.timestamp,
            priority: .medium
        )
    }
    
    // MARK: - Event Processing
    private func processNextEvent() {
        guard !eventQueue.isEmpty else { return }
        
        // 从队列中获取优先级最高的事件
        guard let event = eventQueue.dequeue() else { return }
        
        // 处理事件
        eventProcessor.process(event: event) { [weak self] success in
            if success {
                // 事件处理成功，发布到事件总线
                self?.eventBus.publish(event)
            } else {
                // 事件处理失败，根据策略处理（重试或丢弃）
                self?.handleEventProcessingFailure(event)
            }
            
            // 处理下一个事件
            self?.processNextEvent()
        }
    }
    
    // MARK: - Failure Handling
    private func handleEventProcessingFailure(_ event: any Event) {
        // 根据事件类型和优先级决定重试策略
        switch event.priority {
        case .critical, .high:
            // 高优先级事件，重试一次
            eventQueue.enqueue(event: event, retryCount: 1)
        case .medium:
            // 中优先级事件，根据类型决定是否重试
            if event is ModelUpdatedEvent {
                eventQueue.enqueue(event: event, retryCount: 1)
            }
        case .low:
            // 低优先级事件，直接丢弃
            print("Low priority event processing failed, discarding: \(type(of: event))")
        }
    }
}
```

### 4. WebSocket事件处理器

**核心代码**：

```swift
// WebSocketEventProcessor.swift - 具体事件处理器
import Foundation

class WebSocketEventProcessor {
    private let cognitiveModelService: CognitiveModelServiceProtocol
    private let analysisService: AnalysisServiceProtocol
    private let conversationService: ConversationServiceProtocol
    
    // MARK: - Initialization
    init(cognitiveModelService: CognitiveModelServiceProtocol = DependencyContainer.shared.resolveCognitiveModelService(),
         analysisService: AnalysisServiceProtocol = DependencyContainer.shared.resolveAnalysisService(),
         conversationService: ConversationServiceProtocol = DependencyContainer.shared.resolveConversationService()) {
        self.cognitiveModelService = cognitiveModelService
        self.analysisService = analysisService
        self.conversationService = conversationService
    }
    
    // MARK: - Event Processing
    func process(event: any Event, completion: @escaping (Bool) -> Void) {
        switch event {
        case let modelUpdatedEvent as ModelUpdatedEvent:
            processModelUpdatedEvent(event: modelUpdatedEvent, completion: completion)
        case let analysisResultEvent as AnalysisResultEvent:
            processAnalysisResultEvent(event: analysisResultEvent, completion: completion)
        case let conversationMessageEvent as ConversationMessageEvent:
            processConversationMessageEvent(event: conversationMessageEvent, completion: completion)
        default:
            print("Unknown event type: \(type(of: event))")
            completion(false)
        }
    }
    
    // MARK: - Model Updated Event Processing
    private func processModelUpdatedEvent(event: ModelUpdatedEvent, completion: @escaping (Bool) -> Void) {
        // 处理认知模型更新事件
        cognitiveModelService.applyModelUpdates(modelId: event.modelId, updates: event.updates) {
            result in
            switch result {
            case .success:
                print("Successfully processed model updated event for model: \(event.modelId)")
                completion(true)
            case .failure(let error):
                print("Failed to process model updated event: \(error)")
                completion(false)
            }
        }
    }
    
    // MARK: - Analysis Result Event Processing
    private func processAnalysisResultEvent(event: AnalysisResultEvent, completion: @escaping (Bool) -> Void) {
        // 处理分析结果推送事件
        analysisService.saveAnalysisResult(analysisResult: event.result) {
            result in
            switch result {
            case .success:
                print("Successfully processed analysis result event: \(event.analysisId)")
                completion(true)
            case .failure(let error):
                print("Failed to process analysis result event: \(error)")
                completion(false)
            }
        }
    }
    
    // MARK: - Conversation Message Event Processing
    private func processConversationMessageEvent(event: ConversationMessageEvent, completion: @escaping (Bool) -> Void) {
        // 处理对话消息事件
        conversationService.addMessageToConversation(conversationId: event.conversationId, message: event.message) {
            result in
            switch result {
            case .success:
                print("Successfully processed conversation message event: \(event.conversationId)")
                completion(true)
            case .failure(let error):
                print("Failed to process conversation message event: \(error)")
                completion(false)
            }
        }
    }
}
```

### 5. WebSocket事件队列

**核心代码**：

```swift
// WebSocketEventQueue.swift - 事件队列，支持优先级和重试
import Foundation

class WebSocketEventQueue {
    private var queue: [QueuedEvent] = []
    private let queueLock = NSLock()
    private let maxRetryCount = 3
    
    // MARK: - Queue Operations
    var isEmpty: Bool {
        queueLock.lock()
        defer { queueLock.unlock() }
        return queue.isEmpty
    }
    
    func enqueue(event: any Event, retryCount: Int = 0) {
        queueLock.lock()
        defer { queueLock.unlock() }
        
        // 创建队列事件
        let queuedEvent = QueuedEvent(event: event, retryCount: retryCount)
        
        // 根据优先级插入到队列中
        // 优先级高的事件排在前面
        let insertIndex = queue.firstIndex { $0.event.priority < event.priority } ?? queue.endIndex
        queue.insert(queuedEvent, at: insertIndex)
        
        print("Enqueued event: \(type(of: event)), priority: \(event.priority), retryCount: \(retryCount)")
    }
    
    func dequeue() -> (any Event)? {
        queueLock.lock()
        defer { queueLock.unlock() }
        
        guard !queue.isEmpty else { return nil }
        
        // 取出队列头部的事件
        let queuedEvent = queue.removeFirst()
        return queuedEvent.event
    }
    
    func clear() {
        queueLock.lock()
        defer { queueLock.unlock() }
        queue.removeAll()
    }
    
    // MARK: - Private Helper Class
    private class QueuedEvent {
        let event: any Event
        var retryCount: Int
        
        init(event: any Event, retryCount: Int) {
            self.event = event
            self.retryCount = retryCount
        }
    }
}
```

### 6. WebSocket事件类型定义

**核心代码**：

```swift
// WebSocketEventTypes.swift - WebSocket业务事件类型定义
import Foundation

// MARK: - Model Updated Event
struct ModelUpdatedEvent: Event {
    let modelId: String
    let updates: [ModelUpdate]
    let timestamp: Date
    let priority: EventPriority = .high
}

// MARK: - Analysis Result Event
struct AnalysisResultEvent: Event {
    let analysisId: String
    let modelId: String
    let analysisType: AnalysisType
    let result: AnalysisResult
    let timestamp: Date
    let priority: EventPriority = .medium
}

enum AnalysisType: String, Codable {
    case thinkingType = "thinking_type"
    case cognitiveStructure = "cognitive_structure"
    case knowledgeDomain = "knowledge_domain"
    case cognitiveInsight = "cognitive_insight"
}

// MARK: - Conversation Message Event
struct ConversationMessageEvent: Event {
    let conversationId: String
    let message: ConversationMessage
    let sender: MessageSender
    let timestamp: Date
    let priority: EventPriority = .medium
}

enum MessageSender: String, Codable {
    case user = "user"
    case ai = "ai"
}

// MARK: - Event Payload Definitions
struct ModelUpdatedPayload: Codable {
    let modelId: String
    let updates: [ModelUpdate]
}

struct AnalysisResultPayload: Codable {
    let analysisId: String
    let modelId: String
    let analysisType: AnalysisType
    let result: AnalysisResult
}

struct ConversationMessagePayload: Codable {
    let conversationId: String
    let message: ConversationMessage
    let sender: MessageSender
}
```

### 7. WebSocket事件本地缓存

**核心代码**：

```swift
// WebSocketEventCache.swift - 事件本地缓存
import Foundation
import CoreData

class WebSocketEventCache {
    private let persistentContainer: NSPersistentContainer
    private let maxCacheSize: Int = 1000
    private let cacheExpiryTime: TimeInterval = 7 * 24 * 60 * 60 // 7天
    
    // MARK: - Initialization
    init(persistentContainer: NSPersistentContainer = CoreDataStack.shared.persistentContainer) {
        self.persistentContainer = persistentContainer
        
        // 初始化时清理过期事件
        cleanupExpiredEvents()
    }
    
    // MARK: - Cache Operations
    func cache(event: any Event) -> Bool {
        let context = persistentContainer.newBackgroundContext()
        
        do {
            // 创建事件缓存实体
            let eventCache = WebSocketEventCacheEntity(context: context)
            eventCache.id = UUID().uuidString
            eventCache.eventType = String(describing: type(of: event))
            eventCache.timestamp = event.timestamp
            eventCache.priority = Int16(event.priority.rawValue)
            
            // 序列化事件数据
            let encoder = JSONEncoder()
            let eventData = try encoder.encode(event)
            eventCache.eventData = eventData
            
            // 保存到数据库
            try context.save()
            
            // 检查缓存大小，超过限制则清理旧事件
            checkAndTrimCache()
            
            return true
        } catch {
            print("Error caching WebSocket event: \(error)")
            return false
        }
    }
    
    func getEvents(ofType eventType: Any.Type, limit: Int = 100) -> [any Event] {
        let context = persistentContainer.newBackgroundContext()
        let fetchRequest: NSFetchRequest<WebSocketEventCacheEntity> = WebSocketEventCacheEntity.fetchRequest()
        
        // 设置查询条件
        fetchRequest.predicate = NSPredicate(format: "eventType == %@", String(describing: eventType))
        
        // 设置排序方式（按时间倒序）
        fetchRequest.sortDescriptors = [NSSortDescriptor(key: "timestamp", ascending: false)]
        
        // 设置限制
        fetchRequest.fetchLimit = limit
        
        do {
            let cacheEntities = try context.fetch(fetchRequest)
            return cacheEntities.compactMap { entity in
                // 反序列化事件
                guard let eventData = entity.eventData else { return nil }
                
                let decoder = JSONDecoder()
                return try? decoder.decode(eventType as! Decodable.Type, from: eventData) as? any Event
            }
        } catch {
            print("Error fetching cached WebSocket events: \(error)")
            return []
        }
    }
    
    func clearCache() {
        let context = persistentContainer.newBackgroundContext()
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = WebSocketEventCacheEntity.fetchRequest()
        let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
        
        do {
            try context.execute(deleteRequest)
            try context.save()
        } catch {
            print("Error clearing WebSocket event cache: \(error)")
        }
    }
    
    // MARK: - Cache Management
    private func checkAndTrimCache() {
        let context = persistentContainer.newBackgroundContext()
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = WebSocketEventCacheEntity.fetchRequest()
        
        do {
            let count = try context.count(for: fetchRequest as! NSFetchRequest<NSFetchRequestResult & NSManagedObject>)
            
            if count > maxCacheSize {
                // 计算需要删除的数量
                let deleteCount = count - maxCacheSize / 2
                
                // 查询最旧的事件
                let trimFetchRequest: NSFetchRequest<WebSocketEventCacheEntity> = WebSocketEventCacheEntity.fetchRequest()
                trimFetchRequest.sortDescriptors = [NSSortDescriptor(key: "timestamp", ascending: true)]
                trimFetchRequest.fetchLimit = deleteCount
                
                let oldEvents = try context.fetch(trimFetchRequest)
                
                // 删除旧事件
                oldEvents.forEach { context.delete($0) }
                try context.save()
            }
        } catch {
            print("Error trimming WebSocket event cache: \(error)")
        }
    }
    
    private func cleanupExpiredEvents() {
        let context = persistentContainer.newBackgroundContext()
        let expiryDate = Date().addingTimeInterval(-cacheExpiryTime)
        
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = WebSocketEventCacheEntity.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "timestamp < %@", expiryDate as NSDate)
        
        let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
        
        do {
            let result = try context.execute(deleteRequest) as? NSBatchDeleteResult
            if let deletedCount = result?.result as? Int {
                print("Cleaned up \(deletedCount) expired WebSocket events")
            }
            try context.save()
        } catch {
            print("Error cleaning up expired WebSocket events: \(error)")
        }
    }
}

// WebSocketEventCacheEntity+CoreDataClass.swift - Core Data实体
@objc(WebSocketEventCacheEntity)
public class WebSocketEventCacheEntity: NSManagedObject {
    // Core Data自动生成的属性
    @NSManaged public var id: String?
    @NSManaged public var eventType: String?
    @NSManaged public var eventData: Data?
    @NSManaged public var timestamp: Date
    @NSManaged public var priority: Int16
}
```

### 8. WebSocket事件集成到应用

**核心代码**：

```swift
// 在App入口集成WebSocket事件处理
@main
struct AIVoiceInteractionApp: App {
    @EnvironmentObject private var appState: AppState
    private let dependencyContainer = DependencyContainer.shared
    private var cancellables = Set<AnyCancellable>()
    private var webSocketEventManager: WebSocketEventManager?
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(dependencyContainer.resolveAuthService())
                // 其他环境对象...
        }
    }
    
    init() {
        // 初始化WebSocket服务
        let webSocketService = dependencyContainer.resolveWebSocketService()
        
        // 初始化WebSocket事件管理器
        webSocketEventManager = WebSocketEventManager(webSocketService: webSocketService)
        
        // 启动WebSocket连接
        webSocketService.connect()
        
        // 订阅WebSocket事件
        subscribeToWebSocketEvents()
    }
    
    private func subscribeToWebSocketEvents() {
        // 订阅认知模型更新事件
        EventBus.shared.subscribe(ModelUpdatedEvent.self) { event in
            print("Received ModelUpdatedEvent for model: \(event.modelId)")
            // 可以在这里更新UI或执行其他操作
        }
        .store(in: &cancellables)
        
        // 订阅分析结果事件
        EventBus.shared.subscribe(AnalysisResultEvent.self) { event in
            print("Received AnalysisResultEvent: \(event.analysisId), type: \(event.analysisType)")
            // 可以在这里更新UI或执行其他操作
        }
        .store(in: &cancellables)
        
        // 订阅对话消息事件
        EventBus.shared.subscribe(ConversationMessageEvent.self) { event in
            print("Received ConversationMessageEvent: \(event.conversationId), sender: \(event.sender)")
            // 可以在这里更新UI或执行其他操作
        }
        .store(in: &cancellables)
    }
}
```

### 9. 事件处理测试

**核心代码**：

```swift
// WebSocketEventHandlingTests.swift - 事件处理测试
import XCTest
import Combine

class WebSocketEventHandlingTests: XCTestCase {
    var cancellables = Set<AnyCancellable>()
    
    func testEventBusPublishSubscribe() {
        // 创建测试事件
        struct TestEvent: Event {
            let timestamp: Date = Date()
            let priority: EventPriority = .medium
            let testData: String
        }
        
        let expectation = XCTestExpectation(description: "Event bus publish subscribe test")
        let testEvent = TestEvent(testData: "test")
        
        // 订阅事件
        EventBus.shared.subscribe(TestEvent.self) { receivedEvent in
            XCTAssertEqual(receivedEvent.testData, testEvent.testData)
            expectation.fulfill()
        }
        .store(in: &cancellables)
        
        // 发布事件
        EventBus.shared.publish(testEvent)
        
        // 等待事件处理
        wait(for: [expectation], timeout: 1.0)
    }
    
    func testWebSocketEventQueuePriority() {
        // 创建不同优先级的测试事件
        struct LowPriorityEvent: Event {
            let timestamp: Date = Date()
            let priority: EventPriority = .low
        }
        
        struct HighPriorityEvent: Event {
            let timestamp: Date = Date()
            let priority: EventPriority = .high
        }
        
        let queue = WebSocketEventQueue()
        
        // 先入队低优先级事件
        queue.enqueue(event: LowPriorityEvent())
        
        // 再入队高优先级事件
        queue.enqueue(event: HighPriorityEvent())
        
        // 验证高优先级事件先出队
        let firstEvent = queue.dequeue()
        XCTAssertTrue(firstEvent is HighPriorityEvent)
        
        let secondEvent = queue.dequeue()
        XCTAssertTrue(secondEvent is LowPriorityEvent)
    }
    
    func testWebSocketEventProcessor() {
        // 创建模拟服务
        let mockCognitiveModelService = CognitiveModelServiceMock()
        let mockAnalysisService = AnalysisServiceMock()
        let mockConversationService = ConversationServiceMock()
        
        // 创建事件处理器
        let eventProcessor = WebSocketEventProcessor(
            cognitiveModelService: mockCognitiveModelService,
            analysisService: mockAnalysisService,
            conversationService: mockConversationService
        )
        
        // 创建测试事件
        let modelUpdatedEvent = ModelUpdatedEvent(
            modelId: "test-model-id",
            updates: [],
            timestamp: Date()
        )
        
        let expectation = XCTestExpectation(description: "Event processor test")
        
        // 处理事件
        eventProcessor.process(event: modelUpdatedEvent) { success in
            XCTAssertTrue(success)
            expectation.fulfill()
        }
        
        // 等待事件处理
        wait(for: [expectation], timeout: 1.0)
    }
}
```

## 核心功能与技术亮点

1. **灵活的事件处理机制**：基于Combine框架实现事件流处理，支持多种事件类型的灵活扩展。

2. **优先级事件队列**：实现了基于优先级的事件队列，确保高优先级事件优先处理，提高系统响应性。

3. **可靠的事件处理**：支持事件重试机制，根据事件优先级自动决定重试策略，提高事件处理可靠性。

4. **事件本地缓存**：使用Core Data实现事件本地持久化，支持事件的持久化存储和查询，提高系统容错能力。

5. **解耦的事件架构**：通过事件总线实现事件的发布订阅，降低模块间耦合，提高系统可扩展性。

6. **完整的事件生命周期管理**：实现了从事件接收到处理完成的完整生命周期管理，包括事件转换、排队、处理、发布和失败处理。

7. **易于测试的设计**：通过接口抽象和依赖注入，便于进行单元测试和集成测试，提高代码质量。

## 性能优化考虑

1. **事件批处理**：对于高频相似事件，实现批处理机制，减少数据库操作和UI更新频率。

2. **异步事件处理**：所有事件处理都在后台线程异步执行，避免阻塞主线程，提高UI响应性。

3. **缓存大小控制**：实现了缓存大小自动管理，定期清理过期事件，避免缓存过大导致的性能问题。

4. **事件去重**：对于重复的事件（如多次收到相同的模型更新），实现去重机制，避免重复处理。

5. **优先级动态调整**：根据系统负载动态调整事件优先级，优化系统资源分配。

## 总结

第26天成功实现了WebSocket事件处理机制，包括事件总线、事件队列、事件处理器和事件缓存等核心组件。该实现支持优先级事件处理、可靠的事件传递、灵活的事件扩展和完整的事件生命周期管理。

WebSocket事件处理机制作为实时通信的核心组件，将为应用提供高效、可靠的实时数据处理能力，支持认知模型更新、分析结果推送和对话消息等业务场景。

接下来的第27天，将基于此事件处理机制，进行WebSocket通信的优化和测试，包括连接稳定性优化、性能监控和测试用例编写等，确保WebSocket通信的可靠性和性能。