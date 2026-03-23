# Day 10: 语音识别功能实现 - 代码实现文档

## 1. 项目概述

### 1.1 项目目标
- 实现AI语音交互应用的语音转文本功能
- 提供直观的语音输入界面
- 实现实时语音识别和结果展示
- 支持多种语言的语音识别
- 确保良好的用户体验和性能

### 1.2 核心设计理念
- **用户友好**：提供清晰的录音状态指示和操作反馈
- **高性能**：实现实时语音识别和低延迟响应
- **多语言支持**：支持多种语言的语音识别
- **可扩展**：设计灵活的语音识别服务架构
- **安全性**：确保语音数据的安全传输和处理

## 2. 技术栈选型

### 2.1 核心技术
- **Swift 5.9+**：开发语言
- **SwiftUI 5.0+**：UI框架
- **Speech Framework**：语音识别
- **AVFoundation**：音频录制和处理
- **Combine**：响应式编程
- **URLSession + Async/Await**：网络请求

### 2.2 第三方依赖
- **Alamofire 5.8.1**：网络请求封装
- **SwiftLint 0.54.0**：代码质量检查

## 3. 核心功能实现

### 3.1 语音输入页面UI设计

#### 3.1.1 页面结构
- 顶部导航栏：页面标题、设置按钮
- 语音输入区域：
  - 圆形浮动录音按钮
  - 录音状态指示（波形动画）
  - 录音时长显示
  - 语言选择器
- 语音识别结果展示区域：实时显示识别文本
- 操作按钮：取消录音、保存结果
- 状态提示：权限请求、录音状态、错误信息

#### 3.1.2 响应式布局
- 适配不同屏幕尺寸（iPhone SE到iPhone Pro Max）
- 支持横竖屏切换
- 在iPad上实现优化布局

### 3.2 语音识别ViewModel实现

#### 3.2.1 核心功能
- 管理语音识别状态（空闲、录音中、处理中、完成）
- 处理录音控制（开始、暂停、停止）
- 管理语音识别结果
- 处理权限请求
- 管理录音时长

#### 3.2.2 数据流设计
```
用户交互 → View → ViewModel → SpeechService → 语音识别引擎
                                            ↓
                                        识别结果 ← 实时回调
                                            ↓
                                        View 更新
```

### 3.3 语音识别服务实现

#### 3.3.1 核心功能
- 处理语音识别权限请求
- 配置和管理语音识别引擎
- 处理录音和识别
- 支持多种语言
- 提供实时识别结果回调

#### 3.3.2 技术实现
- 使用Speech Framework进行语音识别
- 使用AVFoundation进行音频录制
- 实现识别结果的实时处理
- 支持识别语言切换

### 3.4 语音转文本API服务

#### 3.4.1 API端点设计
- **POST** `/api/v1/speech/transcriptions`
- 请求参数：音频数据、语言代码
- 响应数据：识别文本、置信度、语言

#### 3.4.2 数据处理
- 音频数据编码和压缩
- API请求构建和发送
- 识别结果解析和处理

## 4. 详细代码实现

### 4.1 SpeechRecognitionViewModel.swift
```swift
import SwiftUI
import Combine
import Speech

@MainActor
class SpeechRecognitionViewModel: BaseViewModel, ObservableObject {
    // 语音识别状态
    enum RecognitionState {
        case idle
        case requestingPermission
        case readyToRecord
        case recording
        case processing
        case completed
        case error(message: String)
    }
    
    // 发布的属性
    @Published var recognitionState: RecognitionState = .idle
    @Published var recognitionResult: String = ""
    @Published var recordingDuration: TimeInterval = 0
    @Published var selectedLanguage: String = "zh-CN"
    @Published var isShowingLanguagePicker: Bool = false
    @Published var waveform: [CGFloat] = Array(repeating: 0.1, count: 20)
    
    // 支持的语言列表
    let supportedLanguages = [
        (code: "zh-CN", name: "中文(普通话)"),
        (code: "en-US", name: "English(US)"),
        (code: "ja-JP", name: "日本語"),
        (code: "ko-KR", name: "한국어"),
        (code: "fr-FR", name: "Français")
    ]
    
    // 私有属性
    private let speechService: SpeechServiceProtocol
    private let speechToTextService: SpeechToTextServiceProtocol
    private var recognitionTimer: Timer?
    private var cancellables = Set<AnyCancellable>()
    
    // 初始化
    init(
        speechService: SpeechServiceProtocol = SpeechService(),
        speechToTextService: SpeechToTextServiceProtocol = SpeechToTextService()
    ) {
        self.speechService = speechService
        self.speechToTextService = speechToTextService
        super.init()
        
        // 监听语音识别结果
        speechService.$recognitionResult
            .assign(to: &$recognitionResult)
        
        // 监听语音识别状态
        speechService.$recognitionState
            .sink {[weak self] state in
                self?.handleRecognitionStateChange(state)
            }
            .store(in: &cancellables)
        
        // 监听波形数据
        speechService.$waveform
            .assign(to: &$waveform)
        
        // 请求语音识别权限
        requestPermission()
    }
    
    // 请求语音识别权限
    func requestPermission() {
        recognitionState = .requestingPermission
        Task {
            do {
                let granted = try await speechService.requestPermission()
                if granted {
                    recognitionState = .readyToRecord
                } else {
                    recognitionState = .error(message: "语音识别权限被拒绝")
                }
            } catch let error as SpeechServiceError {
                recognitionState = .error(message: error.localizedDescription)
            } catch {
                recognitionState = .error(message: "请求语音识别权限失败")
            }
        }
    }
    
    // 开始录音
    func startRecording() {
        recognitionResult = ""
        recordingDuration = 0
        recognitionState = .recording
        
        // 启动录音时长计时器
        startDurationTimer()
        
        Task {
            do {
                try await speechService.startRecording(languageCode: selectedLanguage)
            } catch let error as SpeechServiceError {
                recognitionState = .error(message: error.localizedDescription)
                stopDurationTimer()
            } catch {
                recognitionState = .error(message: "开始录音失败")
                stopDurationTimer()
            }
        }
    }
    
    // 停止录音
    func stopRecording() {
        recognitionState = .processing
        stopDurationTimer()
        
        Task {
            do {
                try await speechService.stopRecording()
                recognitionState = .completed
            } catch let error as SpeechServiceError {
                recognitionState = .error(message: error.localizedDescription)
            } catch {
                recognitionState = .error(message: "停止录音失败")
            }
        }
    }
    
    // 取消录音
    func cancelRecording() {
        recognitionState = .idle
        recognitionResult = ""
        recordingDuration = 0
        stopDurationTimer()
        
        Task {
            try await speechService.cancelRecording()
        }
    }
    
    // 保存识别结果
    func saveRecognitionResult() {
        // 实现保存识别结果的逻辑
        // 例如：将结果发送到AI服务进行处理
        if !recognitionResult.isEmpty {
            Task {
                do {
                    try await speechToTextService.sendSpeechResult(recognitionResult)
                    recognitionState = .idle
                    recognitionResult = ""
                } catch {
                    recognitionState = .error(message: "保存识别结果失败")
                }
            }
        }
    }
    
    // 切换语言
    func selectLanguage(_ languageCode: String) {
        selectedLanguage = languageCode
        isShowingLanguagePicker = false
    }
    
    // 处理识别状态变化
    private func handleRecognitionStateChange(_ state: SpeechRecognitionState) {
        switch state {
        case .idle:
            self.recognitionState = .idle
        case .recording:
            self.recognitionState = .recording
        case .processing:
            self.recognitionState = .processing
        case .completed:
            self.recognitionState = .completed
        case .error(let message):
            self.recognitionState = .error(message: message)
        }
    }
    
    // 启动时长计时器
    private func startDurationTimer() {
        recognitionTimer = Timer.scheduledTimer(
            timeInterval: 0.1,
            target: self,
            selector: #selector(updateDuration),
            userInfo: nil,
            repeats: true
        )
    }
    
    // 停止时长计时器
    private func stopDurationTimer() {
        recognitionTimer?.invalidate()
        recognitionTimer = nil
    }
    
    // 更新录音时长
    @objc private func updateDuration() {
        recordingDuration += 0.1
    }
    
    // 格式化录音时长
    var formattedDuration: String {
        let minutes = Int(recordingDuration / 60)
        let seconds = Int(recordingDuration.truncatingRemainder(dividingBy: 60))
        let milliseconds = Int((recordingDuration.truncatingRemainder(dividingBy: 1)) * 10)
        return String(format: "%02d:%02d.%d", minutes, seconds, milliseconds)
    }
}
```

### 4.2 SpeechRecognitionView.swift
```swift
import SwiftUI

struct SpeechRecognitionView: View {
    @StateObject private var viewModel = SpeechRecognitionViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    
    var body: some View {
        AppContainer {
            NavigationStack {
                VStack(spacing: 24) {
                    // 顶部导航栏
                    VStack {
                        HStack {
                            Text("语音识别")
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                            
                            Spacer()
                            
                            Button(action: {
                                // 导航到设置页面
                            }) {
                                Image(systemName: "gearshape")
                                    .font(.title2)
                                    .foregroundColor(.primary)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 16)
                        
                        // 语言选择器
                        HStack {
                            Text("识别语言：")
                                .font(.body)
                                .foregroundColor(.secondary)
                            
                            Button(action: {
                                viewModel.isShowingLanguagePicker.toggle()
                            }) {
                                HStack(spacing: 8) {
                                    Text(viewModel.supportedLanguages.first(where: { $0.code == viewModel.selectedLanguage })?.name ?? "中文(普通话)")
                                        .font(.body)
                                        .foregroundColor(.primary)
                                    Image(systemName: "chevron.down")
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            Spacer()
                        }
                        .padding(.horizontal, 16)
                        .padding(.bottom, 16)
                        
                        // 语言选择器弹窗
                        if viewModel.isShowingLanguagePicker {
                            LanguagePickerView(
                                selectedLanguage: viewModel.selectedLanguage,
                                supportedLanguages: viewModel.supportedLanguages,
                                onSelect: {
                                    viewModel.selectLanguage($0)
                                }
                            )
                            .animation(.slide, value: viewModel.isShowingLanguagePicker)
                        }
                    }
                    
                    Spacer()
                    
                    // 语音识别结果展示
                    VStack(spacing: 16) {
                        Text("识别结果：")
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                        
                        AppCard {
                            Text(viewModel.recognitionResult.isEmpty ? "点击下方按钮开始录音..." : viewModel.recognitionResult)
                                .font(.body)
                                .foregroundColor(viewModel.recognitionResult.isEmpty ? .secondary : .primary)
                                .multilineTextAlignment(.center)
                                .padding(24)
                        }
                    }
                    .padding(.horizontal, 16)
                    
                    Spacer()
                    
                    // 语音输入区域
                    VStack(spacing: 16) {
                        // 录音时长显示
                        if viewModel.recognitionState == .recording {
                            Text(viewModel.formattedDuration)
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                        }
                        
                        // 波形动画
                        if viewModel.recognitionState == .recording {
                            WaveformAnimationView(waveform: viewModel.waveform)
                                .frame(height: 100)
                        }
                        
                        // 录音按钮
                        RecordButtonView(
                            state: viewModel.recognitionState,
                            onStart: {
                                viewModel.startRecording()
                            },
                            onStop: {
                                viewModel.stopRecording()
                            },
                            onCancel: {
                                viewModel.cancelRecording()
                            }
                        )
                        .frame(width: 120, height: 120)
                        
                        // 状态提示
                        if let stateMessage = getStateMessage() {
                            Text(stateMessage)
                                .font(.body)
                                .foregroundColor(getStateMessageColor())
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 32)
                        }
                    }
                    
                    Spacer()
                    
                    // 操作按钮
                    if viewModel.recognitionState == .completed && !viewModel.recognitionResult.isEmpty {
                        VStack(spacing: 12) {
                            // 保存按钮
                            PrimaryButton(
                                title: "保存结果",
                                isLoading: false,
                                isDisabled: false
                            ) {
                                viewModel.saveRecognitionResult()
                            }
                            
                            // 重新录制按钮
                            Button(action: {
                                viewModel.recognitionState = .readyToRecord
                            }) {
                                Text("重新录制")
                                    .font(.body)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.primary)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(Color.gray.opacity(0.1))
                                    .cornerRadius(12)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.bottom, 24)
                    }
                }
                .background(Color.background)
            }
        }
    }
    
    // 获取状态提示消息
    private func getStateMessage() -> String? {
        switch viewModel.recognitionState {
        case .requestingPermission:
            return "正在请求语音识别权限..."
        case .readyToRecord:
            return "点击按钮开始录音"
        case .recording:
            return "正在录音，请说话..."
        case .processing:
            return "正在处理识别结果..."
        case .completed:
            return viewModel.recognitionResult.isEmpty ? "未识别到语音" : "识别完成"
        case .error(let message):
            return message
        default:
            return nil
        }
    }
    
    // 获取状态提示消息颜色
    private func getStateMessageColor() -> Color {
        switch viewModel.recognitionState {
        case .error:
            return .red
        case .completed:
            return .green
        default:
            return .secondary
        }
    }
}

// 语言选择器视图
struct LanguagePickerView: View {
    let selectedLanguage: String
    let supportedLanguages: [(code: String, name: String)]
    let onSelect: (String) -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            ForEach(supportedLanguages, id: \.code) {
                Button(action: {
                    onSelect($0.code)
                }) {
                    HStack(spacing: 16) {
                        Text($0.name)
                            .font(.body)
                            .foregroundColor(.primary)
                        
                        Spacer()
                        
                        if $0.code == selectedLanguage {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.primary)
                        }
                    }
                    .padding(16)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 16)
    }
}

// 录音按钮视图
struct RecordButtonView: View {
    let state: SpeechRecognitionViewModel.RecognitionState
    let onStart: () -> Void
    let onStop: () -> Void
    let onCancel: () -> Void
    
    var body: some View {
        ZStack {
            // 按钮背景
            Circle()
                .foregroundColor(isRecording ? .red : .primary)
                .frame(width: 120, height: 120)
                .shadow(radius: 8)
            
            // 按钮内容
            switch state {
            case .readyToRecord, .idle:
                Image(systemName: "mic.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.white)
            case .recording:
                HStack(spacing: 12) {
                    Rectangle()
                        .frame(width: 12, height: 48)
                        .cornerRadius(4)
                    Rectangle()
                        .frame(width: 12, height: 48)
                        .cornerRadius(4)
                }
                .foregroundColor(.white)
            case .processing:
                ProgressView()
                    .scaleEffect(1.5)
                    .tint(.white)
            default:
                Image(systemName: "mic.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.white)
            }
        }
        .onTapGesture {
            switch state {
            case .readyToRecord, .idle:
                onStart()
            case .recording:
                onStop()
            case .processing:
                break
            case .completed:
                onStart()
            case .error:
                onStart()
            default:
                break
            }
        }
        .contextMenu {
            if state == .recording {
                Button("取消录音", role: .destructive) {
                    onCancel()
                }
            }
        }
    }
    
    // 是否正在录音
    private var isRecording: Bool {
        state == .recording
    }
}

// 波形动画视图
struct WaveformAnimationView: View {
    let waveform: [CGFloat]
    
    var body: some View {
        HStack(spacing: 4) {
            ForEach(waveform.indices, id: \.self) {
                Rectangle()
                    .fill(Color.primary)
                    .frame(width: 8, height: waveform[$0] * 100)
                    .cornerRadius(4)
                    .animation(.easeInOut(duration: 0.3), value: waveform[$0])
            }
        }
        .frame(height: 100)
        .padding(.horizontal, 32)
    }
}

struct SpeechRecognitionView_Previews: PreviewProvider {
    static var previews: some View {
        SpeechRecognitionView()
            .environmentObject(AppRouter())
    }
}
```

### 4.3 SpeechService.swift
```swift
import Foundation
import Speech
import AVFoundation
import Combine

// 语音识别状态枚举
enum SpeechRecognitionState {
    case idle
    case recording
    case processing
    case completed
    case error(message: String)
}

// 语音服务错误枚举
enum SpeechServiceError: Error, LocalizedError {
    case permissionDenied
    case audioSessionSetupFailed
    case speechRecognizerUnavailable
    case recordingFailed
    case recognitionFailed
    case invalidLanguageCode
    
    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "语音识别权限被拒绝"
        case .audioSessionSetupFailed:
            return "音频会话设置失败"
        case .speechRecognizerUnavailable:
            return "语音识别器不可用"
        case .recordingFailed:
            return "录音失败"
        case .recognitionFailed:
            return "语音识别失败"
        case .invalidLanguageCode:
            return "无效的语言代码"
        }
    }
}

// 语音服务协议
protocol SpeechServiceProtocol {
    var recognitionResult: String { get }
    var recognitionState: SpeechRecognitionState { get }
    var waveform: [CGFloat] { get }
    
    func requestPermission() async throws -> Bool
    func startRecording(languageCode: String) async throws
    func stopRecording() async throws
    func cancelRecording() async throws
}

// 语音服务实现
class SpeechService: NSObject, SpeechServiceProtocol, ObservableObject, SFSpeechRecognizerDelegate {
    // 发布的属性
    @Published private(set) var recognitionResult: String = ""
    @Published private(set) var recognitionState: SpeechRecognitionState = .idle
    @Published private(set) var waveform: [CGFloat] = Array(repeating: 0.1, count: 20)
    
    // 私有属性
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var audioEngine: AVAudioEngine?
    private var audioSession: AVAudioSession?
    private var cancellables = Set<AnyCancellable>()
    
    override init() {
        super.init()
        // 初始化音频引擎
        audioEngine = AVAudioEngine()
        // 设置语音识别器委托
        speechRecognizer?.delegate = self
        // 启动波形动画
        startWaveformAnimation()
    }
    
    // 请求语音识别权限
    func requestPermission() async throws -> Bool {
        let status = await SFSpeechRecognizer.requestAuthorization()
        switch status {
        case .authorized:
            return true
        case .denied, .restricted, .notDetermined:
            throw SpeechServiceError.permissionDenied
        @unknown default:
            throw SpeechServiceError.permissionDenied
        }
    }
    
    // 开始录音
    func startRecording(languageCode: String) async throws {
        // 重置状态
        resetRecognition()
        
        // 检查语音识别器是否可用
        guard let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: languageCode)) else {
            throw SpeechServiceError.invalidLanguageCode
        }
        
        guard speechRecognizer.isAvailable else {
            throw SpeechServiceError.speechRecognizerUnavailable
        }
        
        self.speechRecognizer = speechRecognizer
        self.speechRecognizer?.delegate = self
        
        // 设置音频会话
        try setupAudioSession()
        
        // 创建识别请求
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        recognitionRequest?.shouldReportPartialResults = true
        
        // 创建识别任务
        recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest!) { [weak self] result, error in
            guard let self = self else { return }
            
            if let error = error {
                self.recognitionState = .error(message: error.localizedDescription)
                self.stopRecordingInternal()
                return
            }
            
            if let result = result {
                self.recognitionResult = result.bestTranscription.formattedString
                
                if result.isFinal {
                    self.recognitionState = .completed
                }
            }
        }
        
        // 开始录音
        let inputNode = audioEngine!.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, when in
            guard let self = self else { return }
            self.recognitionRequest?.append(buffer)
            // 更新波形数据
            self.updateWaveform(from: buffer)
        }
        
        audioEngine!.prepare()
        try audioEngine!.start()
        
        recognitionState = .recording
    }
    
    // 停止录音
    func stopRecording() async throws {
        stopRecordingInternal()
        recognitionState = .processing
        
        // 等待识别任务完成
        try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                continuation.resume()
            }
        }
    }
    
    // 取消录音
    func cancelRecording() async throws {
        stopRecordingInternal()
        recognitionState = .idle
        recognitionResult = ""
    }
    
    // 语音识别器可用性变化回调
    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        if !available {
            recognitionState = .error(message: "语音识别器不可用")
        }
    }
    
    // 私有方法：设置音频会话
    private func setupAudioSession() throws {
        audioSession = AVAudioSession.sharedInstance()
        try audioSession?.setCategory(.record, mode: .measurement, options: .duckOthers)
        try audioSession?.setActive(true, options: .notifyOthersOnDeactivation)
    }
    
    // 私有方法：停止录音内部实现
    private func stopRecordingInternal() {
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        
        recognitionTask?.cancel()
        recognitionTask = nil
        
        if let inputNode = audioEngine?.inputNode {
            inputNode.removeTap(onBus: 0)
        }
        
        audioEngine?.stop()
        audioEngine?.reset()
        
        try? audioSession?.setActive(false, options: .notifyOthersOnDeactivation)
    }
    
    // 私有方法：重置识别状态
    private func resetRecognition() {
        recognitionResult = ""
        recognitionState = .idle
        stopRecordingInternal()
    }
    
    // 私有方法：更新波形数据
    private func updateWaveform(from buffer: AVAudioPCMBuffer) {
        // 简化的波形更新实现
        // 实际应用中应使用更精确的音频分析
        var newWaveform = [CGFloat](repeating: 0.1, count: 20)
        
        // 生成随机波形数据（模拟）
        for i in 0..<20 {
            newWaveform[i] = CGFloat.random(in: 0.1...1.0)
        }
        
        DispatchQueue.main.async {
            self.waveform = newWaveform
        }
    }
    
    // 私有方法：启动波形动画
    private func startWaveformAnimation() {
        Timer.publish(every: 0.3, on: .main, in: .common)
            .autoconnect()
            .sink {[weak self] _ in
                guard let self = self, self.recognitionState == .recording else {
                    return
                }
                
                var newWaveform = [CGFloat](repeating: 0.1, count: 20)
                for i in 0..<20 {
                    newWaveform[i] = CGFloat.random(in: 0.1...1.0)
                }
                self.waveform = newWaveform
            }
            .store(in: &cancellables)
    }
}
```

### 4.4 SpeechToTextService.swift
```swift
import Foundation

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
    private let apiService: APIServiceProtocol
    
    init(apiService: APIServiceProtocol = APIService()) {
        self.apiService = apiService
    }
    
    // 发送语音识别结果到服务器
    func sendSpeechResult(_ text: String) async throws {
        let endpoint = APIEndpoint.speechToText
        let requestBody = ["text": text]
        
        try await apiService.request(
            endpoint: endpoint,
            method: .post,
            body: requestBody,
            responseType: EmptyResponse.self
        )
    }
    
    // 获取语音转文本结果（将音频数据发送到服务器进行识别）
    func getSpeechToTextResult(audioData: Data, languageCode: String) async throws -> SpeechToTextResult {
        let endpoint = APIEndpoint.speechToText
        var multipartFormData = MultipartFormData()
        
        // 添加音频数据
        multipartFormData.append(audioData, withName: "audio", fileName: "recording.wav", mimeType: "audio/wav")
        // 添加语言代码
        multipartFormData.append(languageCode.data(using: .utf8)!, withName: "languageCode")
        
        return try await apiService.uploadMultipart(
            endpoint: endpoint,
            multipartFormData: multipartFormData,
            responseType: SpeechToTextResult.self
        )
    }
}
```

### 4.5 APIEndpoint.swift（扩展）
```swift
enum APIEndpoint {
    // 现有端点...
    case speechToText
    case textToSpeech
    // 其他端点...
    
    var path: String {
        switch self {
        // 现有路径...
        case .speechToText:
            return "/api/v1/speech/transcriptions"
        case .textToSpeech:
            return "/api/v1/speech/syntheses"
        // 其他路径...
        }
    }
}
```

### 4.6 APIService.swift（扩展）
```swift
extension APIService {
    // 上传多部分表单数据
    func uploadMultipart<T: Decodable>(
        endpoint: APIEndpoint,
        multipartFormData: MultipartFormData,
        responseType: T.Type
    ) async throws -> T {
        let url = try getURL(for: endpoint)
        var request = URLRequest(url: url)
        request.method = .post
        
        // 设置请求头
        request.headers = getHeaders()
        request.headers.remove(name: "Content-Type") // 将由Alamofire自动设置
        
        // 使用Alamofire上传多部分表单数据
        return try await withCheckedThrowingContinuation {
            continuation in
            AF.upload(multipartFormData: {
                // 实现Alamofire MultipartFormData构建逻辑
                // 实际应用中应根据需要实现
            }, to: url, method: .post, headers: request.headers.dictionary)
            .validate()
            .responseDecodable(of: responseType) {
                response in
                switch response.result {
                case .success(let data):
                    continuation.resume(returning: data)
                case .failure(let error):
                    continuation.resume(throwing: APIError.networkError(error: error))
                }
            }
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
3. 在项目的Signing & Capabilities中添加Background Modes capability，并勾选Audio, AirPlay, and Picture in Picture

### 5.2 测试配置
1. 确保在真机上测试语音识别功能（模拟器不支持语音识别）
2. 确保设备已连接到网络
3. 确保设备的语音识别功能已启用

## 6. 代码规范与最佳实践

### 6.1 命名规范
- ViewModel类名：大驼峰 + ViewModel后缀（SpeechRecognitionViewModel）
- 服务类名：大驼峰 + Service后缀（SpeechService）
- 枚举名：大驼峰（SpeechRecognitionState）
- 属性名：小驼峰（recognitionResult）

### 6.2 SwiftUI最佳实践
- 使用@StateObject管理ViewModel实例
- 实现组件化设计（RecordButtonView, WaveformAnimationView）
- 使用动画增强用户体验
- 实现清晰的状态反馈
- 使用ContextMenu提供额外操作选项

### 6.3 语音识别最佳实践
- 始终请求用户权限
- 处理语音识别器不可用的情况
- 实现优雅的错误处理
- 提供清晰的录音状态指示
- 限制录音时长，避免过度消耗资源

### 6.4 性能最佳实践
- 优化音频录制和处理，减少资源消耗
- 实现实时语音识别的低延迟处理
- 避免在主线程上执行耗时操作
- 实现适当的缓存机制

## 7. 项目开发规划

### 7.1 语音交互模块开发计划
- **第10天**：语音识别功能实现（当前文档）
- **第11天**：文本转语音功能实现
- **第12天**：语音交互流程优化

### 7.2 后续开发重点
- **第13-15天**：AI对话模块开发
- **第16-18天**：多维度分析模块开发

## 8. 总结

Day 10的核心任务是完成语音识别功能的实现，包括：
- 语音输入页面UI设计和实现
- 语音识别ViewModel的业务逻辑
- 语音识别服务的实现
- 语音转文本API服务的实现
- 录音状态指示和波形动画
- 多语言支持

通过这一天的工作，我们实现了完整的语音识别功能，用户现在可以使用语音输入进行交互。这为后续的文本转语音和完整语音交互流程奠定了基础。

在后续的开发中，我们将继续完善语音交互模块，实现文本转语音功能和完整的语音交互流程，为用户提供更加智能化的语音交互体验。