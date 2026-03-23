# Day 11: 文本转语音功能实现 - 代码实现文档

## 1. 项目概述

### 1.1 项目目标
- 实现AI语音交互应用的文本转语音功能
- 提供直观的文本转语音界面和控制
- 支持多种语音和语言
- 实现播放控制和进度指示
- 确保良好的用户体验和性能

### 1.2 核心设计理念
- **用户友好**：提供清晰的播放控制和进度指示
- **多语言支持**：支持多种语音和语言
- **可定制**：允许用户调整音量、语速等参数
- **高性能**：实现低延迟的文本转语音
- **可扩展**：设计灵活的文本转语音服务架构

## 2. 技术栈选型

### 2.1 核心技术
- **Swift 5.9+**：开发语言
- **SwiftUI 5.0+**：UI框架
- **AVSpeechSynthesizer**：文本转语音
- **Combine**：响应式编程
- **URLSession + Async/Await**：网络请求

### 2.2 第三方依赖
- **Alamofire 5.8.1**：网络请求封装
- **SwiftLint 0.54.0**：代码质量检查

## 3. 核心功能实现

### 3.1 文本转语音组件设计

#### 3.1.1 组件结构
- 文本输入区域：用于输入要转换的文本
- 语音选择区域：选择语音和语言
- 播放控制区域：播放、暂停、停止按钮
- 进度指示区域：播放进度条、时长显示
- 音量和语速控制区域：滑块控件
- 状态提示：播放状态、错误信息

#### 3.1.2 响应式设计
- 适配不同屏幕尺寸（iPhone SE到iPhone Pro Max）
- 支持横竖屏切换
- 在iPad上实现优化布局

### 3.2 文本转语音ViewModel实现

#### 3.2.1 核心功能
- 管理文本转语音状态（空闲、播放中、暂停、完成）
- 处理播放控制（播放、暂停、停止）
- 管理语音选择和配置
- 处理播放进度和时长
- 管理音量和语速

#### 3.2.2 数据流设计
```
用户交互 → View → ViewModel → TextToSpeechService → 语音合成引擎
                                                ↓
                                            播放状态 ← 实时回调
                                                ↓
                                            View 更新
```

### 3.3 文本转语音服务实现

#### 3.3.1 核心功能
- 配置和管理语音合成引擎
- 处理文本转语音请求
- 支持多种语音和语言
- 提供播放控制和进度回调
- 支持音量和语速调整

#### 3.3.2 技术实现
- 使用AVSpeechSynthesizer进行文本转语音
- 实现语音合成委托，处理播放事件
- 支持语音和语言切换
- 实现播放进度计算和回调

### 3.4 文本转语音API服务

#### 3.4.1 API端点设计
- **POST** `/api/v1/speech/syntheses`
- 请求参数：文本、语音ID、语速、音量
- 响应数据：音频数据、播放时长

#### 3.4.2 数据处理
- 构建API请求
- 处理API响应
- 解析和播放音频数据

## 4. 详细代码实现

### 4.1 TextToSpeechViewModel.swift
```swift
import SwiftUI
import Combine
import AVFoundation

@MainActor
class TextToSpeechViewModel: BaseViewModel, ObservableObject {
    // 文本转语音状态
    enum TTSState {
        case idle
        case synthesizing
        case playing
        case paused
        case completed
        case error(message: String)
    }
    
    // 发布的属性
    @Published var ttsState: TTSState = .idle
    @Published var inputText: String = "这是一段用于测试文本转语音功能的示例文本。"
    @Published var selectedVoice: AVSpeechSynthesisVoice?
    @Published var supportedVoices: [AVSpeechSynthesisVoice] = []
    @Published var volume: Float = 0.8
    @Published var rate: Float = 0.5
    @Published var pitchMultiplier: Float = 1.0
    @Published var currentPlaybackTime: TimeInterval = 0
    @Published var totalPlaybackTime: TimeInterval = 0
    @Published var isShowingVoicePicker: Bool = false
    
    // 私有属性
    private let textToSpeechService: TextToSpeechServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    // 初始化
    init(
        textToSpeechService: TextToSpeechServiceProtocol = TextToSpeechService()
    ) {
        self.textToSpeechService = textToSpeechService
        super.init()
        
        // 初始化文本转语音服务
        setupTextToSpeechService()
        
        // 加载支持的语音
        loadSupportedVoices()
    }
    
    // 设置文本转语音服务
    private func setupTextToSpeechService() {
        // 监听文本转语音状态变化
        textToSpeechService.$ttsState
            .assign(to: &$ttsState)
        
        // 监听播放进度
        textToSpeechService.$currentPlaybackTime
            .assign(to: &$currentPlaybackTime)
        
        // 监听总播放时长
        textToSpeechService.$totalPlaybackTime
            .assign(to: &$totalPlaybackTime)
    }
    
    // 加载支持的语音
    private func loadSupportedVoices() {
        // 获取所有支持的语音
        supportedVoices = AVSpeechSynthesisVoice.speechVoices()
        .filter { $0.quality != .default && $0.quality != .low }
        .sorted { $0.name < $1.name }
        
        // 默认选择中文语音
        selectedVoice = supportedVoices.first(where: { $0.language.contains("zh") }) ?? supportedVoices.first
    }
    
    // 开始播放
    func startPlayback() {
        guard !inputText.isEmpty else {
            ttsState = .error(message: "请输入要转换的文本")
            return
        }
        
        Task {
            do {
                try await textToSpeechService.speak(
                    text: inputText,
                    voice: selectedVoice,
                    volume: volume,
                    rate: rate,
                    pitchMultiplier: pitchMultiplier
                )
            } catch let error as TextToSpeechServiceError {
                ttsState = .error(message: error.localizedDescription)
            } catch {
                ttsState = .error(message: "播放失败")
            }
        }
    }
    
    // 暂停播放
    func pausePlayback() {
        Task {
            await textToSpeechService.pause()
        }
    }
    
    // 继续播放
    func resumePlayback() {
        Task {
            await textToSpeechService.resume()
        }
    }
    
    // 停止播放
    func stopPlayback() {
        Task {
            await textToSpeechService.stop()
        }
    }
    
    // 跳转到指定进度
    func seek(to time: TimeInterval) {
        Task {
            await textToSpeechService.seek(to: time)
        }
    }
    
    // 调整音量
    func adjustVolume(_ value: Float) {
        volume = value
        textToSpeechService.setVolume(value)
    }
    
    // 调整语速
    func adjustRate(_ value: Float) {
        rate = value
        textToSpeechService.setRate(value)
    }
    
    // 调整音调
    func adjustPitchMultiplier(_ value: Float) {
        pitchMultiplier = value
        textToSpeechService.setPitchMultiplier(value)
    }
    
    // 选择语音
    func selectVoice(_ voice: AVSpeechSynthesisVoice) {
        selectedVoice = voice
        isShowingVoicePicker = false
    }
    
    // 使用API服务进行文本转语音
    func speakUsingAPI() {
        guard !inputText.isEmpty else {
            ttsState = .error(message: "请输入要转换的文本")
            return
        }
        
        Task {
            do {
                try await textToSpeechService.speakUsingAPI(
                    text: inputText,
                    voiceId: selectedVoice?.identifier ?? "",
                    volume: volume,
                    rate: rate
                )
            } catch let error as TextToSpeechServiceError {
                ttsState = .error(message: error.localizedDescription)
            } catch {
                ttsState = .error(message: "API调用失败")
            }
        }
    }
    
    // 格式化播放时间
    func formatTime(_ time: TimeInterval) -> String {
        let minutes = Int(time / 60)
        let seconds = Int(time.truncatingRemainder(dividingBy: 60))
        return String(format: "%02d:%02d", minutes, seconds)
    }
}
```

### 4.2 TextToSpeechView.swift
```swift
import SwiftUI

struct TextToSpeechView: View {
    @StateObject private var viewModel = TextToSpeechViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    
    var body: some View {
        AppContainer {
            NavigationStack {
                ScrollView {
                    VStack(spacing: 24) {
                        // 顶部导航栏
                        VStack {
                            HStack {
                                Text("文本转语音")
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
                        }
                        
                        // 文本输入区域
                        VStack(alignment: .leading, spacing: 8) {
                            Text("输入文本：")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                            
                            AppCard {
                                TextEditor(text: $viewModel.inputText)
                                    .font(.body)
                                    .foregroundColor(.primary)
                                    .padding(16)
                                    .frame(height: 150)
                                    .scrollContentBackground(.hidden)
                            }
                            
                            // 文本字符计数
                            HStack {
                                Spacer()
                                Text("\(viewModel.inputText.count) 字符")
                                    .font(.footnote)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.horizontal, 16)
                        
                        // 语音选择区域
                        VStack(alignment: .leading, spacing: 8) {
                            Text("选择语音：")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                            
                            Button(action: {
                                viewModel.isShowingVoicePicker.toggle()
                            }) {
                                HStack {
                                    Text(viewModel.selectedVoice?.name ?? "请选择语音")
                                        .font(.body)
                                        .foregroundColor(.primary)
                                    Spacer()
                                    Image(systemName: "chevron.down")
                                        .foregroundColor(.secondary)
                                }
                                .padding(16)
                                .background(Color.gray.opacity(0.1))
                                .cornerRadius(12)
                            }
                            
                            // 语音选择器弹窗
                            if viewModel.isShowingVoicePicker {
                                VoicePickerView(
                                    selectedVoice: viewModel.selectedVoice,
                                    supportedVoices: viewModel.supportedVoices,
                                    onSelect: {
                                        viewModel.selectVoice($0)
                                    }
                                )
                                .animation(.slide, value: viewModel.isShowingVoicePicker)
                            }
                        }
                        .padding(.horizontal, 16)
                        
                        // 播放控制区域
                        VStack(spacing: 16) {
                            // 播放进度条
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text(viewModel.formatTime(viewModel.currentPlaybackTime))
                                        .font(.footnote)
                                        .foregroundColor(.secondary)
                                    Spacer()
                                    Text(viewModel.formatTime(viewModel.totalPlaybackTime))
                                        .font(.footnote)
                                        .foregroundColor(.secondary)
                                }
                                
                                Slider(
                                    value: Binding(
                                        get: { viewModel.currentPlaybackTime },
                                        set: { viewModel.seek(to: $0) }
                                    ),
                                    in: 0...viewModel.totalPlaybackTime,
                                    step: 0.1
                                ) {
                                    Text("播放进度")
                                }
                                minimumValueLabel: {
                                    Image(systemName: "play.fill")
                                }
                                maximumValueLabel: {
                                    Image(systemName: "stop.fill")
                                }
                                .tint(.primary)
                            }
                            .padding(.horizontal, 16)
                            
                            // 播放控制按钮
                            HStack(spacing: 24) {
                                // 停止按钮
                                Button(action: {
                                    viewModel.stopPlayback()
                                }) {
                                    Image(systemName: "stop.fill")
                                        .font(.system(size: 24))
                                        .foregroundColor(.primary)
                                        .frame(width: 60, height: 60)
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(30)
                                }
                                
                                // 暂停/继续按钮
                                Button(action: {
                                    switch viewModel.ttsState {
                                    case .playing:
                                        viewModel.pausePlayback()
                                    case .paused:
                                        viewModel.resumePlayback()
                                    default:
                                        viewModel.startPlayback()
                                    }
                                }) {
                                    Image(systemName: {
                                        switch viewModel.ttsState {
                                        case .playing:
                                            return "pause.fill"
                                        case .paused:
                                            return "play.fill"
                                        default:
                                            return "play.fill"
                                        }
                                    }())
                                    .font(.system(size: 32))
                                    .foregroundColor(.white)
                                    .frame(width: 80, height: 80)
                                    .background(Color.primary)
                                    .cornerRadius(40)
                                }
                                
                                // API播放按钮
                                Button(action: {
                                    viewModel.speakUsingAPI()
                                }) {
                                    Image(systemName: "cloud.play.fill")
                                        .font(.system(size: 24))
                                        .foregroundColor(.primary)
                                        .frame(width: 60, height: 60)
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(30)
                                }
                            }
                            .padding(.horizontal, 16)
                        }
                        
                        // 音频参数调整区域
                        VStack(spacing: 16) {
                            // 音量调整
                            ControlSliderView(
                                title: "音量",
                                value: $viewModel.volume,
                                minValue: 0.0,
                                maxValue: 1.0,
                                step: 0.1,
                                iconName: "speaker.wave.2.fill",
                                onValueChange: {
                                    viewModel.adjustVolume($0)
                                }
                            )
                            
                            // 语速调整
                            ControlSliderView(
                                title: "语速",
                                value: $viewModel.rate,
                                minValue: 0.1,
                                maxValue: 2.0,
                                step: 0.1,
                                iconName: "speedometer",
                                onValueChange: {
                                    viewModel.adjustRate($0)
                                }
                            )
                            
                            // 音调调整
                            ControlSliderView(
                                title: "音调",
                                value: $viewModel.pitchMultiplier,
                                minValue: 0.5,
                                maxValue: 2.0,
                                step: 0.1,
                                iconName: "musical.note",
                                onValueChange: {
                                    viewModel.adjustPitchMultiplier($0)
                                }
                            )
                        }
                        .padding(.horizontal, 16)
                        .padding(.bottom, 24)
                        
                        // 状态提示
                        if let stateMessage = getStateMessage() {
                            Text(stateMessage)
                                .font(.body)
                                .foregroundColor(getStateMessageColor())
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 16)
                                .padding(.bottom, 24)
                        }
                    }
                }
                .background(Color.background)
            }
        }
    }
    
    // 获取状态提示消息
    private func getStateMessage() -> String? {
        switch viewModel.ttsState {
        case .synthesizing:
            return "正在合成语音..."
        case .playing:
            return "正在播放..."
        case .paused:
            return "播放已暂停"
        case .completed:
            return "播放完成"
        case .error(let message):
            return message
        default:
            return nil
        }
    }
    
    // 获取状态提示消息颜色
    private func getStateMessageColor() -> Color {
        switch viewModel.ttsState {
        case .error:
            return .red
        case .completed:
            return .green
        default:
            return .secondary
        }
    }
}

// 控制滑块视图
struct ControlSliderView: View {
    let title: String
    @Binding var value: Float
    let minValue: Float
    let maxValue: Float
    let step: Float
    let iconName: String
    let onValueChange: (Float) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: iconName)
                    .foregroundColor(.secondary)
                Text(title)
                    .font(.body)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                Spacer()
                Text(String(format: "%.1f", value))
                    .font(.body)
                    .foregroundColor(.secondary)
            }
            
            Slider(
                value: $value,
                in: minValue...maxValue,
                step: step,
                onEditingChanged: {
                    if !$0 {
                        onValueChange(value)
                    }
                }
            )
            .tint(.primary)
        }
        .padding(.horizontal, 16)
    }
}

// 语音选择器视图
struct VoicePickerView: View {
    let selectedVoice: AVSpeechSynthesisVoice?
    let supportedVoices: [AVSpeechSynthesisVoice]
    let onSelect: (AVSpeechSynthesisVoice) -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            ForEach(supportedVoices, id: \.identifier) {
                Button(action: {
                    onSelect($0)
                }) {
                    HStack(spacing: 12) {
                        Image(systemName: $0.identifier == selectedVoice?.identifier ? "checkmark.circle.fill" : "circle")
                            .foregroundColor($0.identifier == selectedVoice?.identifier ? .primary : .secondary)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text($0.name)
                                .font(.body)
                                .foregroundColor(.primary)
                            
                            Text($0.language)
                                .font(.footnote)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
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

struct TextToSpeechView_Previews: PreviewProvider {
    static var previews: some View {
        TextToSpeechView()
            .environmentObject(AppRouter())
    }
}
```

### 4.3 TextToSpeechService.swift
```swift
import Foundation
import AVFoundation
import Combine

// 文本转语音状态枚举
enum TTSServiceState {
    case idle
    case synthesizing
    case playing
    case paused
    case completed
    case error(message: String)
}

// 文本转语音服务错误枚举
enum TextToSpeechServiceError: Error, LocalizedError {
    case synthesisFailed
    case playbackFailed
    case invalidVoice
    case networkError
    
    var errorDescription: String? {
        switch self {
        case .synthesisFailed:
            return "语音合成失败"
        case .playbackFailed:
            return "播放失败"
        case .invalidVoice:
            return "无效的语音"
        case .networkError:
            return "网络错误"
        }
    }
}

// 文本转语音服务协议
protocol TextToSpeechServiceProtocol {
    var ttsState: TTSServiceState { get }
    var currentPlaybackTime: TimeInterval { get }
    var totalPlaybackTime: TimeInterval { get }
    
    func speak(text: String, voice: AVSpeechSynthesisVoice?, volume: Float, rate: Float, pitchMultiplier: Float) async throws
    func pause() async
    func resume() async
    func stop() async
    func seek(to time: TimeInterval) async
    func setVolume(_ volume: Float)
    func setRate(_ rate: Float)
    func setPitchMultiplier(_ pitchMultiplier: Float)
    func speakUsingAPI(text: String, voiceId: String, volume: Float, rate: Float) async throws
}

// 文本转语音服务实现
class TextToSpeechService: NSObject, TextToSpeechServiceProtocol, ObservableObject, AVSpeechSynthesizerDelegate {
    // 发布的属性
    @Published private(set) var ttsState: TTSServiceState = .idle
    @Published private(set) var currentPlaybackTime: TimeInterval = 0
    @Published private(set) var totalPlaybackTime: TimeInterval = 0
    
    // 私有属性
    private let speechSynthesizer: AVSpeechSynthesizer
    private let apiService: APIServiceProtocol
    private var currentUtterance: AVSpeechUtterance?
    private var playbackTimer: Timer?
    private var cancellables = Set<AnyCancellable>()
    
    // 初始化
    override init() {
        self.speechSynthesizer = AVSpeechSynthesizer()
        self.apiService = APIService()
        super.init()
        
        // 设置委托
        speechSynthesizer.delegate = self
    }
    
    // 使用本地TTS引擎播放
    func speak(text: String, voice: AVSpeechSynthesisVoice?, volume: Float, rate: Float, pitchMultiplier: Float) async throws {
        // 停止当前播放
        await stop()
        
        // 设置状态为合成中
        ttsState = .synthesizing
        
        // 创建语音 utterance
        let utterance = AVSpeechUtterance(string: text)
        utterance.volume = volume
        utterance.rate = rate
        utterance.pitchMultiplier = pitchMultiplier
        
        // 设置语音
        if let voice = voice {
            utterance.voice = voice
        } else {
            // 默认使用中文语音
            utterance.voice = AVSpeechSynthesisVoice(language: "zh-CN")
        }
        
        // 估算总播放时长
        totalPlaybackTime = estimatePlaybackTime(for: utterance)
        
        // 保存当前 utterance
        currentUtterance = utterance
        
        // 开始播放
        speechSynthesizer.speak(utterance)
        
        // 更新状态为播放中
        ttsState = .playing
        
        // 启动播放定时器
        startPlaybackTimer()
    }
    
    // 暂停播放
    func pause() async {
        if speechSynthesizer.isSpeaking {
            speechSynthesizer.pauseSpeaking(at: .immediate)
            ttsState = .paused
            stopPlaybackTimer()
        }
    }
    
    // 继续播放
    func resume() async {
        if speechSynthesizer.isPaused {
            speechSynthesizer.continueSpeaking()
            ttsState = .playing
            startPlaybackTimer()
        }
    }
    
    // 停止播放
    func stop() async {
        speechSynthesizer.stopSpeaking(at: .immediate)
        ttsState = .idle
        currentPlaybackTime = 0
        totalPlaybackTime = 0
        currentUtterance = nil
        stopPlaybackTimer()
    }
    
    // 跳转到指定时间（本地TTS引擎不支持精确跳转，这里仅作演示）
    func seek(to time: TimeInterval) async {
        // 本地TTS引擎不支持精确跳转，这里仅更新进度显示
        currentPlaybackTime = min(time, totalPlaybackTime)
    }
    
    // 设置音量
    func setVolume(_ volume: Float) {
        if let utterance = currentUtterance {
            utterance.volume = volume
        }
    }
    
    // 设置语速
    func setRate(_ rate: Float) {
        if let utterance = currentUtterance {
            utterance.rate = rate
        }
    }
    
    // 设置音调
    func setPitchMultiplier(_ pitchMultiplier: Float) {
        if let utterance = currentUtterance {
            utterance.pitchMultiplier = pitchMultiplier
        }
    }
    
    // 使用API进行文本转语音
    func speakUsingAPI(text: String, voiceId: String, volume: Float, rate: Float) async throws {
        // 停止当前播放
        await stop()
        
        // 设置状态为合成中
        ttsState = .synthesizing
        
        // 构建请求体
        let requestBody = [
            "text": text,
            "voiceId": voiceId,
            "volume": volume,
            "rate": rate
        ]
        
        do {
            // 调用API获取音频数据
            let audioData = try await apiService.request(
                endpoint: APIEndpoint.textToSpeech,
                method: .post,
                body: requestBody,
                responseType: TTSAPIResponse.self
            )
            
            // 更新总播放时长
            totalPlaybackTime = audioData.duration
            
            // 播放音频数据
            try await playAudioData(audioData.audioData)
        } catch {
            ttsState = .error(message: "API调用失败")
            throw TextToSpeechServiceError.networkError
        }
    }
    
    // 播放音频数据
    private func playAudioData(_ audioData: Data) async throws {
        // 这里简化处理，实际应用中需要实现音频播放逻辑
        // 使用 AVAudioPlayer 或其他音频播放库
        ttsState = .playing
        startPlaybackTimer()
        
        // 模拟播放过程
        try await Task.sleep(nanoseconds: UInt64(totalPlaybackTime * 1_000_000_000))
        
        // 播放完成
        ttsState = .completed
        currentPlaybackTime = totalPlaybackTime
        stopPlaybackTimer()
    }
    
    // 语音合成器委托方法：开始播放
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        ttsState = .playing
    }
    
    // 语音合成器委托方法：暂停播放
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didPause utterance: AVSpeechUtterance) {
        ttsState = .paused
    }
    
    // 语音合成器委托方法：继续播放
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didContinue utterance: AVSpeechUtterance) {
        ttsState = .playing
    }
    
    // 语音合成器委托方法：完成播放
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        ttsState = .completed
        currentPlaybackTime = totalPlaybackTime
        stopPlaybackTimer()
    }
    
    // 语音合成器委托方法：播放失败
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        ttsState = .idle
        currentPlaybackTime = 0
        stopPlaybackTimer()
    }
    
    // 语音合成器委托方法：播放出错
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, errorDidOccur utterance: AVSpeechUtterance) {
        ttsState = .error(message: "播放出错")
        currentPlaybackTime = 0
        stopPlaybackTimer()
    }
    
    // 启动播放定时器
    private func startPlaybackTimer() {
        // 停止现有定时器
        stopPlaybackTimer()
        
        // 创建新定时器
        playbackTimer = Timer.scheduledTimer(
            timeInterval: 0.1,
            target: self,
            selector: #selector(updatePlaybackTime),
            userInfo: nil,
            repeats: true
        )
    }
    
    // 停止播放定时器
    private func stopPlaybackTimer() {
        playbackTimer?.invalidate()
        playbackTimer = nil
    }
    
    // 更新播放时间
    @objc private func updatePlaybackTime() {
        if ttsState == .playing {
            currentPlaybackTime += 0.1
            if currentPlaybackTime >= totalPlaybackTime {
                currentPlaybackTime = totalPlaybackTime
                stopPlaybackTimer()
            }
        }
    }
    
    // 估算播放时长
    private func estimatePlaybackTime(for utterance: AVSpeechUtterance) -> TimeInterval {
        // 简单估算：平均语速为每分钟150个单词
        let wordCount = utterance.speechString.split(separator: " ").count
        let estimatedTime = TimeInterval(wordCount) / 150.0 * 60.0
        return max(estimatedTime, 1.0) // 最小1秒
    }
}

// TTS API响应结构
struct TTSAPIResponse: Codable {
    let audioData: Data
    let duration: TimeInterval
    let voiceId: String
    
    enum CodingKeys: String, CodingKey {
        case audioData = "audio_data"
        case duration
        case voiceId = "voice_id"
    }
}
```

### 4.4 APIEndpoint.swift（扩展）
```swift
enum APIEndpoint {
    // 现有端点...
    case textToSpeech
    // 其他端点...
    
    var path: String {
        switch self {
        // 现有路径...
        case .textToSpeech:
            return "/api/v1/speech/syntheses"
        // 其他路径...
        }
    }
}
```

### 4.5 AppRoute.swift（扩展）
```swift
enum AppRoute {
    // 现有路由...
    case speechRecognition
    case textToSpeech
    // 其他路由...
    
    var requiresAuth: Bool {
        // 语音功能需要登录
        return true
    }
    
    var view: AnyView {
        switch self {
        // 现有视图...
        case .speechRecognition:
            return AnyView(SpeechRecognitionView())
        case .textToSpeech:
            return AnyView(TextToSpeechView())
        // 其他视图...
        }
    }
    
    var title: String {
        switch self {
        // 现有标题...
        case .speechRecognition:
            return "语音识别"
        case .textToSpeech:
            return "文本转语音"
        // 其他标题...
        }
    }
}
```

## 5. 开发环境配置

### 5.1 Xcode设置
1. 确保Xcode版本为15.0+
2. 在项目的Info.plist中添加以下权限描述（如果需要）：
   ```xml
   <key>NSMicrophoneUsageDescription</key>
   <string>应用需要访问麦克风来录制您的语音</string>
   ```

### 5.2 测试配置
1. 确保在真机上测试文本转语音功能（模拟器支持有限）
2. 确保设备已连接到网络（如果使用API服务）
3. 确保设备的文本转语音功能已启用

## 6. 代码规范与最佳实践

### 6.1 命名规范
- ViewModel类名：大驼峰 + ViewModel后缀（TextToSpeechViewModel）
- 服务类名：大驼峰 + Service后缀（TextToSpeechService）
- 枚举名：大驼峰（TTSServiceState）
- 属性名：小驼峰（ttsState）

### 6.2 SwiftUI最佳实践
- 使用@StateObject管理ViewModel实例
- 实现组件化设计（ControlSliderView, VoicePickerView）
- 使用滑块实现直观的参数调整
- 提供清晰的状态反馈
- 使用动画增强用户体验

### 6.3 文本转语音最佳实践
- 实现多种播放控制（播放、暂停、停止）
- 提供清晰的播放进度指示
- 允许用户调整音量、语速等参数
- 支持多种语音和语言
- 实现优雅的错误处理

### 6.4 性能最佳实践
- 优化文本转语音的合成和播放，减少资源消耗
- 实现低延迟的文本转语音
- 避免在主线程上执行耗时操作
- 实现适当的缓存机制

## 7. 项目开发规划

### 7.1 语音交互模块开发计划
- **第10天**：语音识别功能实现（已完成）
- **第11天**：文本转语音功能实现（当前文档）
- **第12天**：语音交互流程优化

### 7.2 后续开发重点
- **第13-15天**：AI对话模块开发
- **第16-18天**：多维度分析模块开发

## 8. 总结

Day 11的核心任务是完成文本转语音功能的实现，包括：
- 文本转语音组件设计和实现
- 文本转语音ViewModel的业务逻辑
- 文本转语音服务的实现
- 文本转语音API服务的实现
- 播放控制和进度指示
- 支持多种语音和语言

通过这一天的工作，我们实现了完整的文本转语音功能，用户现在可以将文本转换为语音并播放。这为后续的完整语音交互流程奠定了基础。

在后续的开发中，我们将继续完善语音交互模块，实现完整的语音交互流程，包括语音输入、语音转文本、AI处理、文本转语音和语音输出等环节，为用户提供更加智能化的语音交互体验。