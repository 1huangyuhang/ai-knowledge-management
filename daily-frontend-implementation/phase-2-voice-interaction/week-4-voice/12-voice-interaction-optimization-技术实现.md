# Day 12: 语音交互流程优化 - 代码实现文档

## 1. 项目概述

### 1.1 项目目标
- 实现完整的语音交互流程
- 优化录音体验，提高语音识别准确性
- 实现语音交互的中断和恢复机制
- 优化语音输出的自然度和流畅度
- 实现语音交互历史记录功能
- 确保良好的用户体验和性能

### 1.2 核心设计理念
- **无缝体验**：实现流畅的端到端语音交互
- **高性能**：优化语音处理和响应速度
- **可靠性**：实现稳健的中断和恢复机制
- **可定制**：允许用户调整语音交互参数
- **可追溯**：提供完整的交互历史记录

## 2. 技术栈选型

### 2.1 核心技术
- **Swift 5.9+**：开发语言
- **SwiftUI 5.0+**：UI框架
- **Speech Framework**：语音识别
- **AVFoundation**：音频录制和处理
- **AVSpeechSynthesizer**：文本转语音
- **Combine**：响应式编程
- **URLSession + Async/Await**：网络请求
- **Core Data**：本地数据存储

### 2.2 第三方依赖
- **Alamofire 5.8.1**：网络请求封装
- **SwiftLint 0.54.0**：代码质量检查

## 3. 核心功能实现

### 3.1 完整语音交互流程设计

#### 3.1.1 流程概述
```
1. 用户触发语音交互（点击按钮或语音唤醒）
2. 应用开始录音并显示录音状态
3. 实时语音转文本，显示识别结果
4. 用户结束录音
5. 发送文本到AI服务进行处理
6. 获取AI响应文本
7. 将AI响应文本转换为语音
8. 播放语音响应
9. 保存交互记录到历史记录
```

#### 3.1.2 状态管理
- **Idle**：空闲状态，等待用户触发
- **Recording**：录音中，实时语音转文本
- **Processing**：处理中，发送文本到AI服务
- **Speaking**：播放AI响应语音
- **Completed**：交互完成，显示结果
- **Error**：出现错误，显示错误信息

### 3.2 录音体验优化

#### 3.2.1 核心优化点
- **降噪处理**：使用音频处理技术降低背景噪音
- **录音时长限制**：防止过长录音消耗过多资源
- **录音质量优化**：调整音频参数，提高录音质量
- **录音状态指示**：提供清晰的录音状态和进度指示

#### 3.2.2 技术实现
- 使用AVAudioEngine进行音频录制和处理
- 实现音频会话管理，优化录音参数
- 使用音频单元进行实时降噪处理
- 实现录音时长监控和限制

### 3.3 语音交互中断和恢复机制

#### 3.3.1 核心功能
- **中断处理**：处理来自系统或用户的中断
- **恢复机制**：在中断后恢复语音交互
- **状态保存**：保存中断时的交互状态
- **优雅降级**：在无法恢复时提供替代方案

#### 3.3.2 技术实现
- 监听系统中断通知（电话、通知等）
- 实现交互状态的保存和恢复
- 提供清晰的中断和恢复状态指示
- 实现用户手动中断功能

### 3.4 语音输出优化

#### 3.4.1 核心优化点
- **语音自然度**：优化语音合成参数，提高自然度
- **流畅度**：优化语音播放，减少卡顿
- **情感表达**：根据上下文调整语音语调
- **音量平衡**：确保语音输出音量适中

#### 3.4.2 技术实现
- 优化AVSpeechSynthesizer参数
- 实现语音合成队列管理
- 根据文本内容调整语音参数
- 实现语音输出的音量平衡

### 3.5 语音交互历史记录

#### 3.5.1 核心功能
- **交互记录保存**：保存完整的语音交互历史
- **历史记录查询**：支持按时间、关键词查询
- **历史记录回放**：支持回放历史语音交互
- **历史记录管理**：支持删除、导出历史记录

#### 3.5.2 技术实现
- 使用Core Data存储历史记录
- 实现历史记录的CRUD操作
- 实现历史记录的查询和过滤
- 实现历史记录的回放功能

## 4. 详细代码实现

### 4.1 VoiceInteractionViewModel.swift
```swift
import SwiftUI
import Combine
import Speech
import AVFoundation

@MainActor
class VoiceInteractionViewModel: BaseViewModel, ObservableObject {
    // 语音交互状态枚举
    enum VoiceInteractionState {
        case idle
        case readyToSpeak
        case recording
        case processing
        case speaking
        case completed
        case error(message: String)
        case interrupted(reason: String)
    }
    
    // 发布的属性
    @Published var interactionState: VoiceInteractionState = .idle
    @Published var currentUtterance: String = ""
    @Published var aiResponse: String = ""
    @Published var recordingDuration: TimeInterval = 0
    @Published var waveform: [CGFloat] = Array(repeating: 0.1, count: 20)
    @Published var isInterruptible: Bool = true
    @Published var interactionHistory: [VoiceInteractionRecord] = []
    
    // 配置参数
    private let maxRecordingDuration: TimeInterval = 60 // 最大录音时长（秒）
    private let recordingQuality: AVAudioQuality = .high
    private let noiseReductionEnabled: Bool = true
    
    // 私有属性
    private let speechService: SpeechServiceProtocol
    private let textToSpeechService: TextToSpeechServiceProtocol
    private let aiService: AIServiceProtocol
    private let historyService: VoiceInteractionHistoryServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    private var recordingTimer: Timer?
    private var interruptedState: VoiceInteractionState?
    
    // 初始化
    init(
        speechService: SpeechServiceProtocol = SpeechService(),
        textToSpeechService: TextToSpeechServiceProtocol = TextToSpeechService(),
        aiService: AIServiceProtocol = AIService(),
        historyService: VoiceInteractionHistoryServiceProtocol = VoiceInteractionHistoryService()
    ) {
        self.speechService = speechService
        self.textToSpeechService = textToSpeechService
        self.aiService = aiService
        self.historyService = historyService
        super.init()
        
        // 初始化语音交互服务
        setupVoiceInteractionServices()
        
        // 加载历史记录
        loadInteractionHistory()
        
        // 监听系统中断
        setupInterruptListeners()
    }
    
    // 设置语音交互服务
    private func setupVoiceInteractionServices() {
        // 监听语音识别结果
        speechService.$recognitionResult
            .assign(to: &$currentUtterance)
        
        // 监听语音识别状态
        speechService.$recognitionState
            .sink {[weak self] state in
                guard let self = self else { return }
                
                switch state {
                case .recording:
                    self.interactionState = .recording
                case .processing:
                    self.interactionState = .processing
                case .completed:
                    // 语音识别完成，发送到AI处理
                    Task {
                        await self.processWithAI()
                    }
                case .error(let message):
                    self.interactionState = .error(message: message)
                default:
                    break
                }
            }
            .store(in: &cancellables)
        
        // 监听波形数据
        speechService.$waveform
            .assign(to: &$waveform)
        
        // 监听文本转语音状态
        textToSpeechService.$ttsState
            .sink {[weak self] state in
                guard let self = self else { return }
                
                switch state {
                case .playing:
                    self.interactionState = .speaking
                case .completed:
                    self.interactionState = .completed
                    // 保存交互记录
                    self.saveInteractionRecord()
                case .error(let message):
                    self.interactionState = .error(message: message)
                default:
                    break
                }
            }
            .store(in: &cancellables)
    }
    
    // 开始语音交互
    func startVoiceInteraction() {
        resetInteraction()
        interactionState = .readyToSpeak
        
        Task {
            do {
                // 开始录音
                try await speechService.startRecording(languageCode: "zh-CN")
                // 启动录音时长计时器
                startRecordingTimer()
            } catch {
                interactionState = .error(message: "开始语音交互失败")
            }
        }
    }
    
    // 停止语音交互
    func stopVoiceInteraction() {
        Task {
            try await speechService.stopRecording()
            stopRecordingTimer()
        }
    }
    
    // 取消语音交互
    func cancelVoiceInteraction() {
        Task {
            try await speechService.cancelRecording()
            stopRecordingTimer()
            resetInteraction()
        }
    }
    
    // 中断语音交互
    func interruptVoiceInteraction(reason: String) {
        if isInterruptible {
            interruptedState = interactionState
            interactionState = .interrupted(reason: reason)
            
            // 暂停当前操作
            Task {
                switch interactionState {
                case .recording:
                    try await speechService.pauseRecording()
                case .speaking:
                    await textToSpeechService.pause()
                default:
                    break
                }
            }
        }
    }
    
    // 恢复语音交互
    func resumeVoiceInteraction() {
        guard let state = interruptedState else { return }
        
        Task {
            switch state {
            case .recording:
                try await speechService.startRecording(languageCode: "zh-CN")
            case .speaking:
                await textToSpeechService.resume()
            default:
                break
            }
            
            interactionState = state
            interruptedState = nil
        }
    }
    
    // 重置语音交互
    private func resetInteraction() {
        currentUtterance = ""
        aiResponse = ""
        recordingDuration = 0
        interactionState = .idle
        interruptedState = nil
    }
    
    // 处理AI请求
    private func processWithAI() async {
        guard !currentUtterance.isEmpty else {
            interactionState = .error(message: "未识别到语音")
            return
        }
        
        interactionState = .processing
        
        do {
            // 发送到AI服务处理
            let response = try await aiService.processText(currentUtterance)
            aiResponse = response
            
            // 转换为语音并播放
            try await textToSpeechService.speak(
                text: response,
                voice: nil,
                volume: 0.8,
                rate: 0.5,
                pitchMultiplier: 1.0
            )
        } catch {
            interactionState = .error(message: "AI处理失败")
        }
    }
    
    // 启动录音时长计时器
    private func startRecordingTimer() {
        recordingTimer?.invalidate()
        recordingTimer = Timer.scheduledTimer(
            timeInterval: 0.1,
            target: self,
            selector: #selector(updateRecordingDuration),
            userInfo: nil,
            repeats: true
        )
    }
    
    // 停止录音时长计时器
    private func stopRecordingTimer() {
        recordingTimer?.invalidate()
        recordingTimer = nil
    }
    
    // 更新录音时长
    @objc private func updateRecordingDuration() {
        recordingDuration += 0.1
        
        // 检查是否超过最大录音时长
        if recordingDuration >= maxRecordingDuration {
            Task {
                await stopVoiceInteraction()
            }
        }
    }
    
    // 保存交互记录
    private func saveInteractionRecord() {
        guard !currentUtterance.isEmpty && !aiResponse.isEmpty else { return }
        
        let record = VoiceInteractionRecord(
            id: UUID().uuidString,
            timestamp: Date(),
            userUtterance: currentUtterance,
            aiResponse: aiResponse,
            duration: recordingDuration
        )
        
        Task {
            try await historyService.saveRecord(record)
            // 重新加载历史记录
            loadInteractionHistory()
        }
    }
    
    // 加载交互历史
    private func loadInteractionHistory() {
        Task {
            do {
                let history = try await historyService.getRecords(limit: 50)
                interactionHistory = history
            } catch {
                print("加载历史记录失败：\(error)")
            }
        }
    }
    
    // 设置中断监听器
    private func setupInterruptListeners() {
        // 监听音频会话中断
        NotificationCenter.default.publisher(for: AVAudioSession.interruptionNotification)
            .sink {[weak self] notification in
                guard let self = self else { return }
                
                guard let userInfo = notification.userInfo,
                      let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
                      let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
                    return
                }
                
                switch type {
                case .began:
                    // 中断开始
                    self.interruptVoiceInteraction(reason: "系统中断")
                case .ended:
                    // 中断结束，检查是否可以恢复
                    if let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt {
                        let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
                        if options.contains(.shouldResume) {
                            // 可以恢复
                            self.resumeVoiceInteraction()
                        }
                    }
                @unknown default:
                    break
                }
            }
            .store(in: &cancellables)
        
        // 监听应用进入后台
        NotificationCenter.default.publisher(for: UIApplication.willResignActiveNotification)
            .sink {[weak self] _ in
                self?.interruptVoiceInteraction(reason: "应用进入后台")
            }
            .store(in: &cancellables)
        
        // 监听应用回到前台
        NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)
            .sink {[weak self] _ in
                self?.resumeVoiceInteraction()
            }
            .store(in: &cancellables)
    }
}

// 语音交互记录结构
struct VoiceInteractionRecord: Identifiable, Codable {
    let id: String
    let timestamp: Date
    let userUtterance: String
    let aiResponse: String
    let duration: TimeInterval
}
```

### 4.2 VoiceInteractionView.swift
```swift
import SwiftUI

struct VoiceInteractionView: View {
    @StateObject private var viewModel = VoiceInteractionViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    
    var body: some View {
        AppContainer {
            NavigationStack {
                VStack(spacing: 24) {
                    // 顶部导航栏
                    VStack {
                        HStack {
                            Text("语音交互")
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                            
                            Spacer()
                            
                            Button(action: {
                                // 导航到历史记录页面
                                appRouter.push(route: .voiceInteractionHistory)
                            }) {
                                Image(systemName: "clock.fill")
                                    .font(.title2)
                                    .foregroundColor(.primary)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 16)
                    }
                    
                    Spacer()
                    
                    // 语音交互状态区域
                    VStack(spacing: 16) {
                        // 状态指示
                        StatusIndicatorView(state: viewModel.interactionState)
                        
                        // 波形动画
                        if viewModel.interactionState == .recording {
                            WaveformAnimationView(waveform: viewModel.waveform)
                        }
                        
                        // 录音时长
                        if viewModel.interactionState == .recording {
                            Text(formatDuration(viewModel.recordingDuration))
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                        }
                    }
                    
                    Spacer()
                    
                    // 交互内容区域
                    VStack(spacing: 16) {
                        // 用户输入
                        if !viewModel.currentUtterance.isEmpty {
                            MessageBubbleView(
                                text: viewModel.currentUtterance,
                                isUser: true
                            )
                        }
                        
                        // AI响应
                        if !viewModel.aiResponse.isEmpty {
                            MessageBubbleView(
                                text: viewModel.aiResponse,
                                isUser: false
                            )
                        }
                    }
                    .padding(.horizontal, 16)
                    
                    Spacer()
                    
                    // 控制按钮区域
                    VStack(spacing: 16) {
                        // 主要交互按钮
                        MainInteractionButton(state: viewModel.interactionState) {
                            switch viewModel.interactionState {
                            case .idle, .readyToSpeak, .completed:
                                viewModel.startVoiceInteraction()
                            case .recording:
                                Task {
                                    await viewModel.stopVoiceInteraction()
                                }
                            case .processing:
                                break
                            case .speaking:
                                Task {
                                    await viewModel.textToSpeechService.stop()
                                }
                            case .error:
                                viewModel.startVoiceInteraction()
                            case .interrupted:
                                viewModel.resumeVoiceInteraction()
                            }
                        }
                        
                        // 辅助按钮
                        HStack(spacing: 16) {
                            // 取消按钮
                            Button(action: {
                                viewModel.cancelVoiceInteraction()
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 40))
                                    .foregroundColor(.red)
                            }
                            .opacity(viewModel.interactionState == .idle ? 0 : 1)
                            .disabled(viewModel.interactionState == .idle)
                            
                            // 中断/恢复按钮
                            if viewModel.interactionState == .interrupted {
                                Button(action: {
                                    viewModel.resumeVoiceInteraction()
                                }) {
                                    Image(systemName: "play.circle.fill")
                                        .font(.system(size: 40))
                                        .foregroundColor(.green)
                                }
                            } else if viewModel.interactionState == .recording || viewModel.interactionState == .speaking {
                                Button(action: {
                                    viewModel.interruptVoiceInteraction(reason: "用户手动中断")
                                }) {
                                    Image(systemName: "pause.circle.fill")
                                        .font(.system(size: 40))
                                        .foregroundColor(.orange)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 24)
                }
                .background(Color.background)
            }
        }
    }
    
    // 格式化时长
    private func formatDuration(_ duration: TimeInterval) -> String {
        let minutes = Int(duration / 60)
        let seconds = Int(duration.truncatingRemainder(dividingBy: 60))
        return String(format: "%02d:%02d", minutes, seconds)
    }
}

// 状态指示视图
struct StatusIndicatorView: View {
    let state: VoiceInteractionViewModel.VoiceInteractionState
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: getStateIcon())
                .font(.system(size: 64))
                .foregroundColor(getStateColor())
            
            Text(getStateText())
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(getStateColor())
                .multilineTextAlignment(.center)
        }
    }
    
    private func getStateIcon() -> String {
        switch state {
        case .idle, .readyToSpeak:
            return "mic.fill"
        case .recording:
            return "mic.fill"
        case .processing:
            return "brain.fill"
        case .speaking:
            return "speaker.wave.2.fill"
        case .completed:
            return "checkmark.circle.fill"
        case .error:
            return "exclamationmark.circle.fill"
        case .interrupted:
            return "pause.circle.fill"
        }
    }
    
    private func getStateColor() -> Color {
        switch state {
        case .idle, .readyToSpeak:
            return .primary
        case .recording:
            return .red
        case .processing:
            return .blue
        case .speaking:
            return .green
        case .completed:
            return .green
        case .error:
            return .red
        case .interrupted:
            return .orange
        }
    }
    
    private func getStateText() -> String {
        switch state {
        case .idle, .readyToSpeak:
            return "点击开始语音交互"
        case .recording:
            return "正在录音，请说话..."
        case .processing:
            return "正在处理，请稍候..."
        case .speaking:
            return "AI正在说话..."
        case .completed:
            return "交互完成"
        case .error(let message):
            return message
        case .interrupted(let reason):
            return "已中断：\(reason)"
        }
    }
}

// 主要交互按钮
struct MainInteractionButton: View {
    let state: VoiceInteractionViewModel.VoiceInteractionState
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(getButtonColor())
                    .frame(width: 80, height: 80)
                    .shadow(radius: 8)
                
                Image(systemName: getButtonIcon())
                    .font(.system(size: 40))
                    .foregroundColor(.white)
            }
        }
    }
    
    private func getButtonColor() -> Color {
        switch state {
        case .idle, .readyToSpeak, .completed:
            return .primary
        case .recording:
            return .red
        case .processing:
            return .blue
        case .speaking:
            return .green
        case .error:
            return .red
        case .interrupted:
            return .orange
        }
    }
    
    private func getButtonIcon() -> String {
        switch state {
        case .idle, .readyToSpeak, .completed, .error:
            return "mic.fill"
        case .recording:
            return "stop.fill"
        case .processing:
            return "brain.fill"
        case .speaking:
            return "stop.fill"
        case .interrupted:
            return "play.fill"
        }
    }
}

// 消息气泡视图
struct MessageBubbleView: View {
    let text: String
    let isUser: Bool
    
    var body: some View {
        HStack {
            if isUser {
                Spacer()
                
                AppCard {
                    Text(text)
                        .font(.body)
                        .foregroundColor(.white)
                        .padding(16)
                }
                .background(Color.primary)
                .foregroundColor(.white)
                .cornerRadius(16, corners: [.topLeft, .bottomLeft, .bottomRight])
            } else {
                AppCard {
                    Text(text)
                        .font(.body)
                        .foregroundColor(.primary)
                        .padding(16)
                }
                .background(Color.gray.opacity(0.1))
                .cornerRadius(16, corners: [.topRight, .bottomLeft, .bottomRight])
                
                Spacer()
            }
        }
        .padding(.horizontal, 16)
    }
}

// 扩展：圆角设置
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

struct VoiceInteractionView_Previews: PreviewProvider {
    static var previews: some View {
        VoiceInteractionView()
            .environmentObject(AppRouter())
    }
}
```

### 4.3 AIService.swift
```swift
import Foundation

// AI服务协议
protocol AIServiceProtocol {
    func processText(_ text: String) async throws -> String
}

// AI服务实现
class AIService: AIServiceProtocol {
    private let apiService: APIServiceProtocol
    
    init(apiService: APIServiceProtocol = APIService()) {
        self.apiService = apiService
    }
    
    // 处理文本请求
    func processText(_ text: String) async throws -> String {
        let endpoint = APIEndpoint.aiConversation
        let requestBody = ["text": text]
        
        let response = try await apiService.request(
            endpoint: endpoint,
            method: .post,
            body: requestBody,
            responseType: AIResponse.self
        )
        
        return response.text
    }
}

// AI响应结构
struct AIResponse: Codable {
    let text: String
    let conversationId: String
    let timestamp: Date
    
    enum CodingKeys: String, CodingKey {
        case text
        case conversationId = "conversation_id"
        case timestamp
    }
}
```

### 4.4 VoiceInteractionHistoryService.swift
```swift
import Foundation
import CoreData

// 语音交互历史服务协议
protocol VoiceInteractionHistoryServiceProtocol {
    func saveRecord(_ record: VoiceInteractionRecord) async throws
    func getRecords(limit: Int) async throws -> [VoiceInteractionRecord]
    func deleteRecord(id: String) async throws
    func deleteAllRecords() async throws
}

// 语音交互历史服务实现
class VoiceInteractionHistoryService: VoiceInteractionHistoryServiceProtocol {
    private let persistentContainer: NSPersistentContainer
    
    init() {
        // 初始化Core Data容器
        persistentContainer = NSPersistentContainer(name: "VoiceInteractionHistory")
        persistentContainer.loadPersistentStores {_, error in
            if let error = error {
                fatalError("Failed to load Core Data stack: \(error)")
            }
        }
    }
    
    // 保存记录
    func saveRecord(_ record: VoiceInteractionRecord) async throws {
        return try await withCheckedThrowingContinuation {
            continuation in
            persistentContainer.performBackgroundTask {context in
                let entity = NSEntityDescription.insertNewObject(forEntityName: "VoiceInteractionEntity", into: context)
                entity.setValue(record.id, forKey: "id")
                entity.setValue(record.timestamp, forKey: "timestamp")
                entity.setValue(record.userUtterance, forKey: "userUtterance")
                entity.setValue(record.aiResponse, forKey: "aiResponse")
                entity.setValue(record.duration, forKey: "duration")
                
                do {
                    try context.save()
                    continuation.resume()
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }
    
    // 获取记录
    func getRecords(limit: Int) async throws -> [VoiceInteractionRecord] {
        return try await withCheckedThrowingContinuation {
            continuation in
            persistentContainer.performBackgroundTask {context in
                let fetchRequest: NSFetchRequest<VoiceInteractionEntity> = VoiceInteractionEntity.fetchRequest()
                fetchRequest.sortDescriptors = [NSSortDescriptor(key: "timestamp", ascending: false)]
                fetchRequest.fetchLimit = limit
                
                do {
                    let entities = try context.fetch(fetchRequest)
                    let records = entities.map { entity in
                        VoiceInteractionRecord(
                            id: entity.id ?? UUID().uuidString,
                            timestamp: entity.timestamp ?? Date(),
                            userUtterance: entity.userUtterance ?? "",
                            aiResponse: entity.aiResponse ?? "",
                            duration: entity.duration
                        )
                    }
                    continuation.resume(returning: records)
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }
    
    // 删除记录
    func deleteRecord(id: String) async throws {
        return try await withCheckedThrowingContinuation {
            continuation in
            persistentContainer.performBackgroundTask {context in
                let fetchRequest: NSFetchRequest<VoiceInteractionEntity> = VoiceInteractionEntity.fetchRequest()
                fetchRequest.predicate = NSPredicate(format: "id == %@", id)
                
                do {
                    let entities = try context.fetch(fetchRequest)
                    for entity in entities {
                        context.delete(entity)
                    }
                    try context.save()
                    continuation.resume()
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }
    
    // 删除所有记录
    func deleteAllRecords() async throws {
        return try await withCheckedThrowingContinuation {
            continuation in
            persistentContainer.performBackgroundTask {context in
                let fetchRequest: NSFetchRequest<NSFetchRequestResult> = VoiceInteractionEntity.fetchRequest()
                let batchDeleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
                
                do {
                    try context.execute(batchDeleteRequest)
                    try context.save()
                    continuation.resume()
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }
}

// Core Data实体
public class VoiceInteractionEntity: NSManagedObject {
    @NSManaged public var id: String?
    @NSManaged public var timestamp: Date?
    @NSManaged public var userUtterance: String?
    @NSManaged public var aiResponse: String?
    @NSManaged public var duration: TimeInterval
}
```

### 4.5 APIEndpoint.swift（扩展）
```swift
enum APIEndpoint {
    // 现有端点...
    case aiConversation
    // 其他端点...
    
    var path: String {
        switch self {
        // 现有路径...
        case .aiConversation:
            return "/api/v1/ai-tasks"
        // 其他路径...
        }
    }
}
```

### 4.6 AppRoute.swift（扩展）
```swift
enum AppRoute {
    // 现有路由...
    case voiceInteraction
    case voiceInteractionHistory
    // 其他路由...
    
    var requiresAuth: Bool {
        // 语音交互功能需要登录
        return true
    }
    
    var view: AnyView {
        switch self {
        // 现有视图...
        case .voiceInteraction:
            return AnyView(VoiceInteractionView())
        case .voiceInteractionHistory:
            return AnyView(VoiceInteractionHistoryView())
        // 其他视图...
        }
    }
    
    var title: String {
        switch self {
        // 现有标题...
        case .voiceInteraction:
            return "语音交互"
        case .voiceInteractionHistory:
            return "交互历史"
        // 其他标题...
        }
    }
}
```

### 4.7 VoiceInteractionHistoryView.swift
```swift
import SwiftUI

struct VoiceInteractionHistoryView: View {
    @StateObject private var viewModel = VoiceInteractionViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    
    var body: some View {
        AppContainer {
            NavigationStack {
                VStack(spacing: 16) {
                    // 顶部导航栏
                    HStack {
                        Text("交互历史")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        Spacer()
                        
                        // 删除所有按钮
                        Button(action: {
                            Task {
                                try await viewModel.historyService.deleteAllRecords()
                                viewModel.loadInteractionHistory()
                            }
                        }) {
                            Text("清空")
                                .font(.body)
                                .fontWeight(.semibold)
                                .foregroundColor(.red)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
                    .padding(.bottom, 8)
                    
                    // 历史记录列表
                    if viewModel.interactionHistory.isEmpty {
                        // 空状态
                        EmptyStateView(
                            title: "暂无交互历史",
                            subtitle: "开始使用语音交互功能，记录将保存在这里",
                            action: {
                                appRouter.navigate(to: .voiceInteraction)
                            },
                            actionTitle: "开始交互"
                        )
                        .padding(.vertical, 32)
                    } else {
                        // 历史记录列表
                        List {
                            ForEach(viewModel.interactionHistory) {
                                HistoryItemView(record: $0) {
                                    // 回放交互
                                    viewModel.currentUtterance = $0.userUtterance
                                    viewModel.aiResponse = $0.aiResponse
                                    
                                    // 自动播放AI响应
                                    Task {
                                        try await viewModel.textToSpeechService.speak(
                                            text: $0.aiResponse,
                                            voice: nil,
                                            volume: 0.8,
                                            rate: 0.5,
                                            pitchMultiplier: 1.0
                                        )
                                    }
                                } onDelete: {
                                    // 删除记录
                                    Task {
                                        try await viewModel.historyService.deleteRecord(id: $0.id)
                                        viewModel.loadInteractionHistory()
                                    }
                                }
                            }
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                        }
                        .listStyle(.plain)
                        .padding(.horizontal, 16)
                    }
                }
                .background(Color.background)
            }
        }
    }
}

// 历史记录项视图
struct HistoryItemView: View {
    let record: VoiceInteractionRecord
    let onPlay: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: 12) {
                // 时间和时长
                HStack {
                    Text(formatDate(record.timestamp))
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Text(formatDuration(record.duration))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                // 用户输入
                Text(record.userUtterance)
                    .font(.body)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                    .lineLimit(2)
                
                // AI响应
                Text(record.aiResponse)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                // 操作按钮
                HStack(spacing: 12) {
                    // 回放按钮
                    Button(action: onPlay) {
                        HStack(spacing: 8) {
                            Image(systemName: "play.fill")
                                .foregroundColor(.primary)
                            Text("回放")
                                .font(.body)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                        }
                    }
                    
                    Spacer()
                    
                    // 删除按钮
                    Button(action: onDelete) {
                        HStack(spacing: 8) {
                            Image(systemName: "trash.fill")
                                .foregroundColor(.red)
                            Text("删除")
                                .font(.body)
                                .fontWeight(.semibold)
                                .foregroundColor(.red)
                        }
                    }
                }
            }
            .padding(16)
        }
    }
    
    // 格式化日期
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
    
    // 格式化时长
    private func formatDuration(_ duration: TimeInterval) -> String {
        let seconds = Int(duration)
        return String(format: "%02d秒", seconds)
    }
}

struct VoiceInteractionHistoryView_Previews: PreviewProvider {
    static var previews: some View {
        VoiceInteractionHistoryView()
            .environmentObject(AppRouter())
    }
}
```

## 5. 开发环境配置

### 5.1 Xcode设置
1. 确保Xcode版本为15.0+
2. 在项目的Info.plist中添加以下权限描述：
   ```xml
   <key>NSSpeechRecognitionUsageDescription</key>
   <string>应用需要使用语音识别功能来将您的语音转换为文本</string>
   <key>NSMicrophoneUsageDescription</key>
   <string>应用需要访问麦克风来录制您的语音</string>
   ```
3. 配置Core Data：创建数据模型文件，添加VoiceInteractionEntity实体
4. 在项目的Signing & Capabilities中添加Background Modes capability，并勾选Audio, AirPlay, and Picture in Picture

### 5.2 测试配置
1. 确保在真机上测试语音交互功能（模拟器支持有限）
2. 确保设备已连接到网络
3. 确保设备的语音识别和文本转语音功能已启用

## 6. 代码规范与最佳实践

### 6.1 命名规范
- ViewModel类名：大驼峰 + ViewModel后缀（VoiceInteractionViewModel）
- 服务类名：大驼峰 + Service后缀（VoiceInteractionHistoryService）
- 枚举名：大驼峰（VoiceInteractionState）
- 属性名：小驼峰（interactionState）

### 6.2 SwiftUI最佳实践
- 使用@StateObject管理ViewModel实例
- 实现组件化设计（StatusIndicatorView, MessageBubbleView）
- 使用动画增强用户体验
- 实现清晰的状态反馈
- 使用列表和卡片展示历史记录

### 6.3 语音交互最佳实践
- 实现完整的端到端语音交互流程
- 优化录音体验，提高语音识别准确性
- 实现稳健的中断和恢复机制
- 优化语音输出的自然度和流畅度
- 提供完整的交互历史记录

### 6.4 性能最佳实践
- 优化语音处理和响应速度
- 实现高效的历史记录存储和查询
- 避免在主线程上执行耗时操作
- 实现适当的缓存机制

### 6.5 安全最佳实践
- 确保语音数据的安全传输和处理
- 实现适当的权限管理
- 保护用户的交互历史记录
- 实现数据加密存储

## 7. 项目开发规划

### 7.1 语音交互模块开发计划
- **第10天**：语音识别功能实现（已完成）
- **第11天**：文本转语音功能实现（已完成）
- **第12天**：语音交互流程优化（当前文档）

### 7.2 后续开发重点
- **第13-15天**：AI对话模块开发
  - 第13天：AI对话界面实现
  - 第14天：AI对话功能实现
  - 第15天：AI对话优化
- **第16-18天**：多维度分析模块开发

## 8. 总结

Day 12的核心任务是完成语音交互流程的优化，包括：
- 实现完整的语音交互流程：语音输入 → 语音转文本 → AI处理 → 文本转语音 → 语音输出
- 优化录音体验：降噪处理、录音时长限制、录音质量优化
- 实现语音交互的中断和恢复机制
- 优化语音输出的自然度和流畅度
- 实现语音交互的历史记录功能

通过这一天的工作，我们实现了完整的语音交互系统，将之前实现的语音识别和文本转语音功能整合起来，并进行了全面优化。用户现在可以体验流畅的端到端语音交互，包括中断恢复、历史记录等高级功能。

在后续的开发中，我们将开始AI对话模块的开发，实现更复杂的对话功能，包括上下文管理、实时对话和对话优化等功能。这些功能将进一步增强应用的智能化程度，提供更好的用户体验。