//
//  TextToSpeechViewModel.swift
//  AI-Voice-Interaction-App
//
//  Created by Huang Yuhang on 2026/01/13.
//

import Foundation
import Combine
import AVFoundation

/// 文本转语音状态枚举
enum TextToSpeechViewState {
    case idle
    case synthesizing
    case paused
    case completed
    case error(String)
}

/// 文本转语音配置结构体
struct TextToSpeechConfig {
    var text: String = ""
    var voiceIdentifier: String = "zh-CN"
    var rate: Float = 0.5
    var pitchMultiplier: Float = 1.0
    var volume: Float = 1.0
}

/// 文本转语音ViewModel
@MainActor
class TextToSpeechViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    @Published var state: TextToSpeechViewState = .idle
    @Published var config: TextToSpeechConfig = TextToSpeechConfig()
    @Published var availableVoices: [AVSpeechSynthesisVoice] = []
    @Published var isSpeaking: Bool = false
    @Published var isPaused: Bool = false
    
    // MARK: - Private Properties
    
    private let textToSpeechService: TextToSpeechServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    /// 初始化文本转语音ViewModel
    /// - Parameter textToSpeechService: 文本转语音服务
    init(textToSpeechService: TextToSpeechServiceProtocol) {
        self.textToSpeechService = textToSpeechService
        
        // 设置服务回调
        setupServiceCallbacks()
        
        // 加载可用语音
        loadAvailableVoices()
    }
    
    // MARK: - Public Methods
    
    /// 合成语音
    func synthesizeSpeech() {
        guard !config.text.isEmpty else {
            state = .error("请输入要合成的文本")
            return
        }
        
        state = .synthesizing
        
        textToSpeechService.synthesizeSpeech(
            text: config.text,
            voiceIdentifier: config.voiceIdentifier,
            rate: config.rate,
            pitchMultiplier: config.pitchMultiplier,
            volume: config.volume
        ) { [weak self] (result: Result<Void, Error>) in
            switch result {
            case .success():
                self?.state = .synthesizing
            case .failure(let error):
                DispatchQueue.main.async {
                    self?.state = .error(error.localizedDescription)
                }
            }
        }
    }
    
    /// 暂停语音合成
    func pause() {
        textToSpeechService.pause()
    }
    
    /// 继续语音合成
    func resume() {
        textToSpeechService.resume()
    }
    
    /// 停止语音合成
    func stop() {
        textToSpeechService.stop()
        state = .idle
    }
    
    /// 重置状态
    func reset() {
        stop()
        config = TextToSpeechConfig()
        state = .idle
    }
    
    /// 更新文本
    func updateText(_ text: String) {
        config.text = text
    }
    
    /// 更新语音
    func updateVoice(_ voiceIdentifier: String) {
        config.voiceIdentifier = voiceIdentifier
    }
    
    /// 更新语速
    func updateRate(_ rate: Float) {
        config.rate = rate
    }
    
    /// 更新音调
    func updatePitchMultiplier(_ pitchMultiplier: Float) {
        config.pitchMultiplier = pitchMultiplier
    }
    
    /// 更新音量
    func updateVolume(_ volume: Float) {
        config.volume = volume
    }
    
    // MARK: - Private Methods
    
    /// 设置服务回调
    private func setupServiceCallbacks() {
        // 监听状态变化
        textToSpeechService.onStateChange = { [weak self] (state: SpeechSynthesizerState) in
            DispatchQueue.main.async {
                self?.updateState(state)
            }
        }
    }
    
    /// 更新状态
    private func updateState(_ state: SpeechSynthesizerState) {
        switch state {
        case .idle:
            self.isSpeaking = false
            self.isPaused = false
            self.state = .completed
        case .speaking:
            self.isSpeaking = true
            self.isPaused = false
            self.state = .synthesizing
        case .paused:
            self.isSpeaking = false
            self.isPaused = true
            self.state = .paused
        }
    }
    
    /// 加载可用语音
    private func loadAvailableVoices() {
        availableVoices = textToSpeechService.getAvailableVoices()
            // 过滤出中文语音
            .filter { $0.language.contains("zh") }
    }
    
    /// 获取语音名称
    /// - Parameter voice: 语音对象
    /// - Returns: 语音名称
    func getVoiceName(_ voice: AVSpeechSynthesisVoice) -> String {
        let name = voice.name
        let language = voice.language
        return "\(name) (\(language))"
    }
}
