# 技术栈集成文档

## 模块关联索引

### 所属环节
- **阶段**：文档优化
- **开发主题**：技术栈集成

### 相关核心文档
- [前端架构设计](../architecture-design/frontend-architecture.md)
- [API集成规范](../core-features/api-integration-spec.md)
- [WebSocket集成](../core-features/websocket-integration.md)
- [数据持久化策略](data-persistence-strategy.md)

## 1. 概述

本文档详细说明AI认知辅助系统前端各技术栈之间的集成方式，包括URLSession与WebSocket的配合使用、Core Data与API数据的同步策略、SwiftUI与状态管理的集成等，确保各技术组件能够无缝协作。

## 2. URLSession与WebSocket集成

### 2.1 URLSession基本配置

#### 2.1.1 全局URLSession配置

```swift
class APIClient {
    static let shared = APIClient()
    
    let session: URLSession
    
    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        configuration.httpMaximumConnectionsPerHost = 5
        
        // 配置缓存
        configuration.urlCache = URLCache(memoryCapacity: 50 * 1024 * 1024, diskCapacity: 200 * 1024 * 1024, diskPath: "apiCache")
        configuration.requestCachePolicy = .returnCacheDataElseLoad
        
        // 配置Cookie策略
        configuration.httpShouldSetCookies = true
        configuration.httpCookieAcceptPolicy = .always
        
        session = URLSession(configuration: configuration)
    }
    
    // API请求方法...
}
```

### 2.2 WebSocket集成

#### 2.2.1 WebSocket连接管理

```swift
class WebSocketManager: ObservableObject {
    @Published var isConnected = false
    @Published var connectionError: Error?
    
    private var webSocketTask: URLSessionWebSocketTask?
    private let urlSession: URLSession
    private let apiClient: APIClient
    
    init(urlSession: URLSession, apiClient: APIClient) {
        self.urlSession = urlSession
        self.apiClient = apiClient
    }
    
    func connect() {
        guard let url = URL(string: "ws://localhost:3000/ws") else { return }
        
        webSocketTask = urlSession.webSocketTask(with: url)
        webSocketTask?.resume()
        
        receiveMessages()
        setupConnectionMonitoring()
    }
    
    func disconnect() {
        webSocketTask?.cancel(with: .normalClosure, reason: nil)
        webSocketTask = nil
        isConnected = false
    }
    
    private func receiveMessages() {
        webSocketTask?.receive {
            [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let message):
                self.handleReceivedMessage(message)
                // 继续接收下一条消息
                self.receiveMessages()
            case .failure(let error):
                self.handleConnectionError(error)
            }
        }
    }
    
    private func handleReceivedMessage(_ message: URLSessionWebSocketTask.Message) {
        // 处理接收到的WebSocket消息
        switch message {
        case .string(let text):
            // 处理文本消息
            if let data = text.data(using: .utf8) {
                // 解析JSON消息
                do {
                    let webSocketMessage = try JSONDecoder().decode(WebSocketMessage.self, from: data)
                    // 处理不同类型的消息
                    self.handleWebSocketEvent(webSocketMessage)
                } catch {
                    print("Error parsing WebSocket message: \(error)")
                }
            }
        case .data(let data):
            // 处理二进制消息
            print("Received binary message: \(data)")
        @unknown default:
            print("Received unknown WebSocket message type")
        }
    }
    
    // 其他WebSocket相关方法...
}
```

### 2.3 URLSession与WebSocket协作

#### 2.3.1 共享URLSession配置

- **优势**：共享Cookie、缓存策略和认证信息
- **实现方式**：WebSocketManager和APIClient使用同一个URLSession实例

```swift
// 应用启动时配置
let apiClient = APIClient()
let webSocketManager = WebSocketManager(urlSession: apiClient.session, apiClient: apiClient)
```

#### 2.3.2 认证信息共享

- **JWT令牌**：通过URLSession的httpAdditionalHeaders共享JWT令牌
- **WebSocket认证**：建立WebSocket连接后立即发送JWT令牌

```swift
// 在WebSocket连接建立后发送认证信息
func authenticateWebSocket() {
    guard let token = KeychainService.shared.getToken(forKey: "accessToken") else {
        disconnect()
        return
    }
    
    let authMessage = WebSocketMessage(
        event: .auth,
        data: ["token": token],
        timestamp: Date().iso8601String
    )
    
    sendMessage(authMessage)
}
```

#### 2.3.3 状态同步

- **API请求状态**：通过WebSocket实时获取API请求的处理状态
- **数据更新**：当API数据发生变化时，通过WebSocket推送更新

## 3. Core Data与API数据同步

### 3.1 数据转换层

#### 3.1.1 数据转换协议

```swift
protocol CoreDataConvertible {
    associatedtype CoreDataType: NSManagedObject
    
    func toCoreData(in context: NSManagedObjectContext) -> CoreDataType
    static func fromCoreData(_ coreDataObject: CoreDataType) -> Self
}

// 认知模型数据转换示例
extension CognitiveModel: CoreDataConvertible {
    typealias CoreDataType = CoreDataCognitiveModel
    
    func toCoreData(in context: NSManagedObjectContext) -> CoreDataCognitiveModel {
        let coreDataModel = CoreDataCognitiveModel(context: context)
        coreDataModel.id = id
        coreDataModel.userId = userId
        coreDataModel.name = name
        coreDataModel.descriptionText = description
        coreDataModel.createdAt = createdAt
        coreDataModel.updatedAt = updatedAt
        
        // 转换概念和关系
        coreDataModel.concepts = Set(concepts.map { $0.toCoreData(in: context) } as! Set<CoreDataConcept>)
        coreDataModel.relations = Set(relations.map { $0.toCoreData(in: context) } as! Set<CoreDataRelation>)
        
        return coreDataModel
    }
    
    static func fromCoreData(_ coreDataObject: CoreDataCognitiveModel) -> CognitiveModel {
        return CognitiveModel(
            id: coreDataObject.id ?? "",
            userId: coreDataObject.userId ?? "",
            name: coreDataObject.name ?? "",
            description: coreDataObject.descriptionText,
            concepts: coreDataObject.concepts?.map { CognitiveConcept.fromCoreData($0 as! CoreDataConcept) } ?? [],
            relations: coreDataObject.relations?.map { CognitiveRelation.fromCoreData($0 as! CoreDataRelation) } ?? [],
            createdAt: coreDataObject.createdAt ?? Date(),
            updatedAt: coreDataObject.updatedAt ?? Date()
        )
    }
}
```

### 3.2 数据同步策略

#### 3.2.1 API优先策略

- **适用场景**：需要实时获取最新数据的场景
- **实现方式**：
  1. 优先从API获取最新数据
  2. 将数据保存到Core Data
  3. 从Core Data加载数据进行显示

```swift
class CognitiveModelRepository {
    private let apiClient: APIClient
    private let coreDataManager: CoreDataManager
    
    init(apiClient: APIClient, coreDataManager: CoreDataManager) {
        self.apiClient = apiClient
        self.coreDataManager = coreDataManager
    }
    
    func getModel(id: String) async throws -> CognitiveModel {
        do {
            // 优先从API获取最新数据
            let model = try await apiClient.getModel(id: id)
            
            // 保存到Core Data
            let context = coreDataManager.newBackgroundContext()
            context.performAndWait {
                let coreDataModel = model.toCoreData(in: context)
                do {
                    try context.save()
                } catch {
                    print("Error saving model to Core Data: \(error)")
                }
            }
            
            return model
        } catch {
            // API请求失败时，从Core Data加载数据
            print("Error fetching model from API: \(error)")
            return try getModelFromLocal(id: id)
        }
    }
    
    private func getModelFromLocal(id: String) throws -> CognitiveModel {
        let context = coreDataManager.viewContext
        let fetchRequest: NSFetchRequest<CoreDataCognitiveModel> = CoreDataCognitiveModel.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", id)
        
        if let coreDataModel = try context.fetch(fetchRequest).first {
            return CognitiveModel.fromCoreData(coreDataModel)
        } else {
            throw RepositoryError.modelNotFound
        }
    }
}
```

#### 3.2.2 本地优先策略

- **适用场景**：网络不稳定或离线状态下
- **实现方式**：
  1. 优先从Core Data加载数据进行显示
  2. 异步从API获取最新数据
  3. 更新Core Data并刷新UI

```swift
func getModelLocalFirst(id: String) async throws -> CognitiveModel {
    // 1. 优先从本地加载
    do {
        let localModel = try getModelFromLocal(id: id)
        
        // 2. 异步从API获取最新数据
        Task {
            do {
                let remoteModel = try await apiClient.getModel(id: id)
                
                // 3. 更新本地数据
                let context = coreDataManager.newBackgroundContext()
                context.performAndWait {
                    let coreDataModel = remoteModel.toCoreData(in: context)
                    do {
                        try context.save()
                        // 4. 通知UI更新
                        NotificationCenter.default.post(name: .cognitiveModelUpdated, object: remoteModel)
                    } catch {
                        print("Error saving model to Core Data: \(error)")
                    }
                }
            } catch {
                print("Error fetching model from API: \(error)")
            }
        }
        
        return localModel
    } catch {
        // 本地没有数据，从API获取
        let model = try await apiClient.getModel(id: id)
        // 保存到本地
        saveModelToLocal(model)
        return model
    }
}
```

## 4. SwiftUI与状态管理集成

### 4.1 ObservableObject与Environment

#### 4.1.1 状态管理基类

```swift
class ViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var error: Error?
    
    // 处理异步操作的通用方法
    func performAsyncOperation<T>(operation: @escaping () async throws -> T, 
                                 onSuccess: @escaping (T) -> Void) {
        Task {
            await MainActor.run {
                isLoading = true
                error = nil
            }
            
            do {
                let result = try await operation()
                await MainActor.run {
                    onSuccess(result)
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.error = error
                    isLoading = false
                }
            }
        }
    }
}
```

#### 4.1.2 SwiftUI与ViewModel集成

```swift
struct CognitiveModelListView: View {
    @StateObject private var viewModel = CognitiveModelListViewModel()
    
    var body: some View {
        NavigationStack {
            ZStack {
                List(viewModel.models) { model in
                    NavigationLink(value: model) {
                        CognitiveModelRow(model: model)
                    }
                }
                .navigationTitle("认知模型")
                
                if viewModel.isLoading {
                    ProgressView()
                }
                
                if let error = viewModel.error {
                    ErrorView(error: error, retryAction: viewModel.loadModels)
                }
            }
            .task {
                await viewModel.loadModels()
            }
        }
    }
}
```

### 4.2 SwiftUI与WebSocket集成

#### 4.2.1 实时数据更新

```swift
struct CognitiveModelDetailView: View {
    let modelId: String
    @StateObject private var webSocketManager = WebSocketManager.shared
    @StateObject private var viewModel: CognitiveModelDetailViewModel
    
    init(modelId: String) {
        self.modelId = modelId
        _viewModel = StateObject(wrappedValue: CognitiveModelDetailViewModel(modelId: modelId))
    }
    
    var body: some View {
        VStack {
            // 模型详情显示
            Text(viewModel.model?.name ?? "加载中...")
                .font(.largeTitle)
            
            // 概念和关系可视化
            CognitiveModelVisualizationView(concepts: viewModel.model?.concepts ?? [], 
                                           relations: viewModel.model?.relations ?? [])
        }
        .onAppear {
            // 订阅模型更新
            webSocketManager.subscribeToModel(modelId: modelId)
        }
        .onDisappear {
            // 取消订阅
            webSocketManager.unsubscribeFromModel(modelId: modelId)
        }
        .onReceive(NotificationCenter.default.publisher(for: .modelUpdated)) { notification in
            if let updatedModel = notification.object as? CognitiveModel,
               updatedModel.id == modelId {
                // 更新本地模型
                viewModel.updateModel(updatedModel)
            }
        }
    }
}
```

## 5. 语音处理集成

### 5.1 Speech Framework与API集成

#### 5.1.1 语音识别集成

```swift
class VoiceRecognitionService {
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "zh-CN"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    private let apiClient: APIClient
    
    @Published var isRecording = false
    @Published var recognizedText = ""
    @Published var error: Error?
    
    init(apiClient: APIClient) {
        self.apiClient = apiClient
        speechRecognizer?.delegate = self
    }
    
    func startRecording() throws {
        // 1. 检查权限
        guard await SFSpeechRecognizer.requestAuthorization() == .authorized else {
            throw RecognitionError.permissionDenied
        }
        
        // 2. 配置音频会话
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        
        // 3. 配置识别请求
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        recognitionRequest?.shouldReportPartialResults = true
        
        // 4. 配置音频输入
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, when in
            self.recognitionRequest?.append(buffer)
        }
        
        // 5. 启动音频引擎
        audioEngine.prepare()
        try audioEngine.start()
        
        // 6. 开始识别任务
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest!) { result, error in
            if let result = result {
                self.recognizedText = result.bestTranscription.formattedString
            }
            
            if let error = error {
                self.handleRecognitionError(error)
            }
        }
        
        isRecording = true
    }
    
    func stopRecording() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        
        recognitionTask?.cancel()
        recognitionTask = nil
        
        isRecording = false
        
        // 发送识别结果到API
        Task {
            try await apiClient.processVoiceInput(text: recognizedText)
        }
    }
    
    // 其他语音处理方法...
}
```

## 6. 第三方库集成

### 6.1 Alamofire与URLSession

#### 6.1.1 Alamofire配置

```swift
import Alamofire

class AlamofireAPIClient {
    static let shared = AlamofireAPIClient()
    
    let session: Session
    
    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        
        // 配置Alamofire会话
        session = Session(configuration: configuration)
    }
    
    // 使用Alamofire发送请求的示例
    func getCognitiveModels() async throws -> [CognitiveModel] {
        let response = try await session.request("https://api.example.com/api/v1/models")
            .validate()
            .responseDecodable(of: [CognitiveModel].self)
        
        return response.value ?? []
    }
}
```

### 6.2 Combine与Async/Await

#### 6.2.1 Combine与Async/Await互操作

```swift
// Combine转Async/Await
func getModelsWithCombine() async throws -> [CognitiveModel] {
    let publisher = APIClient.shared.getModels() // 返回AnyPublisher<[CognitiveModel], Error>
    
    return try await withCheckedThrowingContinuation { continuation in
        publisher
            .sink(receiveCompletion: { completion in
                switch completion {
                case .finished:
                    break
                case .failure(let error):
                    continuation.resume(throwing: error)
                }
            }, receiveValue: { models in
                continuation.resume(returning: models)
            })
    }
}

// Async/Await转Combine
func getModelsPublisher() -> AnyPublisher<[CognitiveModel], Error> {
    return Future {
        promise in
        Task {
            do {
                let models = try await APIClient.shared.getModels()
                promise(.success(models))
            } catch {
                promise(.failure(error))
            }
        }
    }
    .eraseToAnyPublisher()
}
```

## 7. 集成测试策略

### 7.1 单元测试

- **测试目标**：测试单个组件或模块的功能
- **工具**：XCTest
- **示例**：
  ```swift
  class APIClientTests: XCTestCase {
      func testLogin() async throws {
          let apiClient = APIClient()
          let loginRequest = LoginRequest(email: "test@example.com", password: "password123")
          
          let loginResponse = try await apiClient.login(loginRequest)
          
          XCTAssertNotNil(loginResponse.accessToken)
          XCTAssertNotNil(loginResponse.refreshToken)
          XCTAssertNotNil(loginResponse.user)
      }
  }
  ```

### 7.2 集成测试

- **测试目标**：测试多个组件或模块之间的集成
- **工具**：XCTest + Mock
- **示例**：
  ```swift
  class CognitiveModelRepositoryTests: XCTestCase {
      func testGetModel() async throws {
          // 创建Mock API客户端
          let mockAPIClient = MockAPIClient()
          let coreDataManager = TestCoreDataManager()
          let repository = CognitiveModelRepository(apiClient: mockAPIClient, coreDataManager: coreDataManager)
          
          // 设置Mock返回值
          let mockModel = CognitiveModel(id: "test-id", name: "Test Model", ...)
          mockAPIClient.expectedModel = mockModel
          
          // 测试从API获取模型
          let model = try await repository.getModel(id: "test-id")
          
          XCTAssertEqual(model.id, mockModel.id)
          XCTAssertEqual(model.name, mockModel.name)
          
          // 测试从本地获取模型
          let localModel = try await repository.getModelLocalFirst(id: "test-id")
          XCTAssertEqual(localModel.id, mockModel.id)
      }
  }
  ```

## 8. 性能优化与监控

### 8.1 网络请求优化

- **请求合并**：合并多个相似的API请求
- **缓存策略**：合理使用HTTP缓存和本地缓存
- **延迟加载**：按需加载数据，避免一次性加载大量数据
- **请求优先级**：设置请求优先级，确保关键请求优先处理

### 8.2 内存监控

- **使用Instruments**：使用Xcode Instruments监控内存使用
- **泄漏检测**：使用Memory Graph Debugger检测内存泄漏
- **自动释放池**：在处理大量数据时使用自动释放池

### 8.3 性能监控工具

- **Firebase Performance Monitoring**：监控应用性能
- **New Relic Mobile**：实时监控应用性能和崩溃
- **AppDynamics Mobile Real User Monitoring**：监控真实用户体验

## 9. 参考资料

- Apple Developer Documentation
- URLSession Programming Guide
- WebSocket Programming Guide
- Core Data Programming Guide
- SwiftUI Essentials
- Speech Framework Documentation
