import Foundation
import Combine

class AIConversationViewModel: ObservableObject {
    @Published var messages: [Message] = []
    @Published var isLoading: Bool = false
    @Published var currentConversationId: UUID?
    @Published var isConnected: Bool = true
    @Published var isInterrupting: Bool = false
    @Published var selectedConversationId: UUID?
    
    private let aiConversationService: AIConversationServiceProtocol
    private let conversationStorageService: ConversationStorageServiceProtocol
    private let webSocketService: WebSocketServiceProtocol? // WebSocket服务
    private var cancellables = Set<AnyCancellable>()
    private var streamingCancellable: AnyCancellable?
    private var contextCache: [String: Any] = [:] // 上下文缓存
    
    init(
        aiConversationService: AIConversationServiceProtocol,
        conversationStorageService: ConversationStorageServiceProtocol,
        webSocketService: WebSocketServiceProtocol? = nil
    ) {
        self.aiConversationService = aiConversationService
        self.conversationStorageService = conversationStorageService
        self.webSocketService = webSocketService
        
        // 初始化时加载活跃对话
        initializeActiveConversation()
        
        // 设置WebSocket事件监听
        setupWebSocketEventHandling()
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
                    self?.loadContextCache()
                } else {
                    // 如果没有活跃对话，创建新对话
                    self?.createNewConversation()
                }
            })
            .store(in: &cancellables)
    }
    
    public func loadMessages() {
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
    
    // 加载上下文缓存
    private func loadContextCache() {
        // 实现上下文缓存加载逻辑
        contextCache.removeAll()
        
        // 只保留最近10条消息作为上下文
        let recentMessages = messages.suffix(10)
        
        // 构建上下文
        for message in recentMessages {
            if message.type == .user {
                contextCache["lastUserMessage"] = message.content
            } else {
                contextCache["lastAIMessage"] = message.content
            }
        }
    }
    
    // 发送消息（支持流式响应）
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
        
        // 更新上下文缓存
        contextCache["lastUserMessage"] = content
        
        // 发送消息到AI服务
        isLoading = true
        
        // 创建AI回复消息（流式）
        let aiMessageId = UUID()
        let aiMessage = Message(
            id: aiMessageId,
            content: "",
            type: .ai,
            status: .processing,
            timestamp: Date(),
            modelId: nil
        )
        messages.append(aiMessage)
        
        // 保存AI消息到本地
        saveMessageToLocal(message: aiMessage, conversationId: conversationId)
        
        // 发送请求
        streamingCancellable = aiConversationService.sendConversationMessage(content: content, modelId: nil)
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
                
                // 更新AI消息状态
                if let index = self?.messages.firstIndex(where: { $0.id == aiMessageId }) {
                    var updatedAIMessage = self?.messages[index] ?? aiMessage
                    updatedAIMessage.status = .received
                    
                    self?.messages[index] = updatedAIMessage
                    
                    // 保存更新后的AI消息到本地
                    if let conversationId = self?.currentConversationId {
                        self?.saveMessageToLocal(message: updatedAIMessage, conversationId: conversationId)
                    }
                }
                
                // 更新上下文缓存
                if let aiResponseMessage = self?.messages.first(where: { $0.id == aiMessageId }) {
                    self?.contextCache["lastAIMessage"] = aiResponseMessage.content
                }
            }, receiveValue: { [weak self] aiResponse in
                // 处理流式响应
                guard let self = self else { return }
                
                if let index = self.messages.firstIndex(where: { $0.id == aiMessageId }) {
                    var updatedAIMessage = self.messages[index]
                    
                    // 更新消息内容
                    if aiResponse.isStreaming {
                        // 对于流式响应，直接更新content
                        updatedAIMessage.content = aiResponse.content
                    } else {
                        updatedAIMessage.content = aiResponse.content
                        updatedAIMessage.status = .received
                    }
                    
                    self.messages[index] = updatedAIMessage
                    
                    // 保存更新后的AI消息到本地
                    self.saveMessageToLocal(message: updatedAIMessage, conversationId: conversationId)
                }
            })
        
        streamingCancellable?.store(in: &cancellables)
    }
    
    // 中断对话
    func interruptConversation() {
        guard let conversationId = currentConversationId else { return }
        
        isInterrupting = true
        
        // 中断API请求
        streamingCancellable?.cancel()
        
        // 调用中断API
        aiConversationService.interruptConversation(conversationId: conversationId)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isInterrupting = false
                switch completion {
                case .finished:
                    // 更新AI消息状态为中断
                    if let index = self?.messages.lastIndex(where: { $0.type == .ai && $0.status == .processing }), let self = self {
                        var updatedMessage = self.messages[index]
                        // 直接更新现有消息的状态，使用正确的MessageStatus成员
                        updatedMessage.status = .received
                        // 移除对不存在成员的访问
                        // updatedMessage.streamingStatus = .completed
                        // updatedMessage.content = updatedMessage.partialContent
                        self.messages[index] = updatedMessage
                        
                        // 保存更新后的消息到本地
                        if let conversationId = self.currentConversationId {
                            self.saveMessageToLocal(message: updatedMessage, conversationId: conversationId)
                        }
                    }
                case .failure(let error):
                    print("中断对话失败: \(error.localizedDescription)")
                }
            }, receiveValue: { _ in
                // 中断成功
            })
            .store(in: &cancellables)
    }
    
    // 重试发送消息
    func retryMessage(_ message: Message) {
        guard message.type == .user, message.status == .failed else { return }
        
        // 更新消息状态为发送中
        if let index = messages.firstIndex(where: { $0.id == message.id }) {
            var updatedMessage = messages[index]
            updatedMessage.status = .sending
            messages[index] = updatedMessage
            
            // 保存更新后的消息到本地
            if let conversationId = currentConversationId {
                saveMessageToLocal(message: updatedMessage, conversationId: conversationId)
            }
        }
        
        // 重新发送消息
        sendMessage(content: message.content)
    }
    
    func createNewConversation() {
        conversationStorageService.createNewConversation()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { completion in
                if case .failure(let error) = completion {
                    print("创建新对话失败: \(error.localizedDescription)")
                }
            }, receiveValue: { [weak self] conversationId in
                self?.currentConversationId = conversationId
                self?.messages = []
                self?.contextCache.removeAll()
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
    
    // MARK: - WebSocket Event Handling
    
    /// 设置WebSocket事件处理
    private func setupWebSocketEventHandling() {
        guard let webSocketService = webSocketService else {
            return
        }
        
        // 监听WebSocket连接状态
        webSocketService.eventPublisher
            .receive(on: DispatchQueue.main)
            .sink { [weak self] event in
                self?.handleWebSocketEvent(event)
            }
            .store(in: &cancellables)
        
        // 连接WebSocket
        webSocketService.connect()
    }
    
    /// 处理WebSocket事件
    /// - Parameter event: WebSocket事件
    private func handleWebSocketEvent(_ event: WebSocketEvent) {
        switch event {
        case .connected:
            isConnected = true
            print("WebSocket连接成功")
        case .disconnected(let reason):
            isConnected = false
            print("WebSocket连接断开: \(reason ?? "未知原因")")
        case .messageReceived(let message):
            handleWebSocketMessage(message)
        case .error(let error):
            print("WebSocket错误: \(error.localizedDescription)")
        case .ping:
            // 处理ping事件
            print("WebSocket Ping")
        case .pong:
            // 处理pong事件
            print("WebSocket Pong")
        }
    }
    
    /// 处理WebSocket消息
    /// - Parameter message: 接收到的消息
    private func handleWebSocketMessage(_ message: String) {
        guard let conversationId = currentConversationId else {
            return
        }
        
        // 解析消息
        if let messageData = message.data(using: .utf8),
           let json = try? JSONSerialization.jsonObject(with: messageData, options: []),
           let dict = json as? [String: Any] {
            
            if let type = dict["type"] as? String {
                switch type {
                case "ai_message":
                    // 处理AI消息
                    if let content = dict["content"] as? String {
                        handleAIMessage(content, conversationId: conversationId)
                    }
                case "system_notification":
                    // 处理系统通知
                    if let content = dict["content"] as? String {
                        handleSystemNotification(content)
                    }
                case "model_updated":
                    // 处理模型更新通知
                    if let modelId = dict["modelId"] as? String {
                        handleModelUpdatedNotification(modelId)
                    }
                default:
                    print("未知的WebSocket消息类型: \(type)")
                }
            }
        }
    }
    
    /// 处理AI消息
    /// - Parameters:
    ///   - content: 消息内容
    ///   - conversationId: 对话ID
    private func handleAIMessage(_ content: String, conversationId: UUID) {
        // 创建AI消息
        let aiMessage = Message(
            id: UUID(),
            content: content,
            type: .ai,
            status: .received,
            timestamp: Date(),
            modelId: nil
        )
        
        // 添加到消息列表
        messages.append(aiMessage)
        
        // 保存到本地
        saveMessageToLocal(message: aiMessage, conversationId: conversationId)
        
        // 更新上下文缓存
        contextCache["lastAIMessage"] = content
    }
    
    /// 处理系统通知
    /// - Parameter content: 通知内容
    private func handleSystemNotification(_ content: String) {
        // 创建系统消息，使用AI类型替代不存在的system类型
        let systemMessage = Message(
            id: UUID(),
            content: content,
            type: .ai,
            status: .received,
            timestamp: Date(),
            modelId: nil
        )
        
        // 添加到消息列表
        messages.append(systemMessage)
    }
    
    /// 处理模型更新通知
    /// - Parameter modelId: 模型ID
    private func handleModelUpdatedNotification(_ modelId: String) {
        // 这里可以实现模型更新的处理逻辑
        // 例如：刷新认知模型数据、显示通知等
        print("模型更新通知: \(modelId)")
        
        // 创建系统消息，使用AI类型替代不存在的system类型
        let systemMessage = Message(
            id: UUID(),
            content: "你的认知模型已更新，建议查看最新分析结果。",
            type: .ai,
            status: .received,
            timestamp: Date(),
            modelId: nil
        )
        
        // 添加到消息列表
        messages.append(systemMessage)
        
        // 如果有当前对话，保存到本地
        if let conversationId = currentConversationId {
            saveMessageToLocal(message: systemMessage, conversationId: conversationId)
        }
    }
    
    func getCurrentConversationId() -> UUID? {
        return currentConversationId
    }
}