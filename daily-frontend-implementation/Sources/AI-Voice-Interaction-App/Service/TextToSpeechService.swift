//
//  TextToSpeechService.swift
//  AI-Voice-Interaction-App
//
//  Created by Huang Yuhang on 2026/01/13.
//

import AVFoundation

/// 语音合成器状态枚举
enum SpeechSynthesizerState {
    case idle
    case speaking
    case paused
}

/// 文本转语音服务协议
@MainActor
protocol TextToSpeechServiceProtocol: AnyObject {
    /// 合成语音
    /// - Parameters:
    ///   - text: 要合成的文本
    ///   - voiceIdentifier: 语音标识符
    ///   - rate: 语速
    ///   - pitchMultiplier: 音调倍数
    ///   - volume: 音量
    ///   - completion: 完成回调
    func synthesizeSpeech(
        text: String,
        voiceIdentifier: String,
        rate: Float,
        pitchMultiplier: Float,
        volume: Float,
        completion: @escaping (Result<Void, Error>) -> Void
    )
    
    /// 暂停语音合成
    func pause()
    
    /// 继续语音合成
    func resume()
    
    /// 停止语音合成
    func stop()
    
    /// 获取可用语音列表
    /// - Returns: 可用语音列表
    func getAvailableVoices() -> [AVSpeechSynthesisVoice]
    
    /// 语音合成状态变化回调
    var onStateChange: ((SpeechSynthesizerState) -> Void)? { get set }
    
    /// 当前合成状态
    var state: SpeechSynthesizerState { get }
}

/// 文本转语音服务
final class TextToSpeechService: NSObject, TextToSpeechServiceProtocol, AVSpeechSynthesizerDelegate {
    // MARK: - Sendable conformance
    // 由于AVSpeechSynthesizer不是Sendable类型，我们需要手动确保并发安全
    // 这个类的使用模式确保了合成器只会在主线程上使用
    
    // MARK: - Properties
    
    /// 语音合成器
    private let synthesizer: AVSpeechSynthesizer
    
    /// 语音合成状态变化回调
    var onStateChange: ((SpeechSynthesizerState) -> Void)?
    
    /// 当前合成状态
    var state: SpeechSynthesizerState {
        if synthesizer.isSpeaking {
            return .speaking
        } else if synthesizer.isPaused {
            return .paused
        } else {
            return .idle
        }
    }
    
    // MARK: - Initialization
    
    /// 初始化语音合成器
    override init() {
        self.synthesizer = AVSpeechSynthesizer()
        super.init()
        self.synthesizer.delegate = self
    }
    
    // MARK: - Public Methods
    
    /// 合成语音
    /// - Parameters:
    ///   - text: 要合成的文本
    ///   - voiceIdentifier: 语音标识符
    ///   - rate: 语速
    ///   - pitchMultiplier: 音调倍数
    ///   - volume: 音量
    ///   - completion: 完成回调
    func synthesizeSpeech(
        text: String,
        voiceIdentifier: String,
        rate: Float,
        pitchMultiplier: Float,
        volume: Float,
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        // 检查文本是否为空
        guard !text.isEmpty else {
            completion(.failure(NSError(domain: "TextToSpeechService", code: 0, userInfo: [NSLocalizedDescriptionKey: "文本不能为空"])))
            return
        }
        
        // 创建语音 utterance
        let utterance = AVSpeechUtterance(string: text)
        
        // 设置语音参数
        utterance.rate = rate
        utterance.pitchMultiplier = pitchMultiplier
        utterance.volume = volume
        
        // 设置语音
        if let voice = AVSpeechSynthesisVoice(identifier: voiceIdentifier) {
            utterance.voice = voice
        } else {
            // 如果指定的语音不可用，使用默认语音
            utterance.voice = AVSpeechSynthesisVoice(language: "zh-CN")
        }
        
        // 开始合成
        synthesizer.speak(utterance)
        completion(.success(()))
    }
    
    /// 暂停语音合成
    func pause() {
        if synthesizer.isSpeaking {
            synthesizer.pauseSpeaking(at: .word)
        }
    }
    
    /// 继续语音合成
    func resume() {
        if synthesizer.isPaused {
            synthesizer.continueSpeaking()
        }
    }
    
    /// 停止语音合成
    func stop() {
        if synthesizer.isSpeaking || synthesizer.isPaused {
            synthesizer.stopSpeaking(at: .immediate)
        }
    }
    
    /// 获取可用语音列表
    /// - Returns: 可用语音列表
    func getAvailableVoices() -> [AVSpeechSynthesisVoice] {
        return AVSpeechSynthesisVoice.speechVoices()
    }
    
    // MARK: - AVSpeechSynthesizerDelegate
    
    /// 语音合成开始
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.onStateChange?(.speaking)
        }
    }
    
    /// 语音合成暂停
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didPause utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.onStateChange?(.paused)
        }
    }
    
    /// 语音合成继续
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didContinue utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.onStateChange?(.speaking)
        }
    }
    
    /// 语音合成完成
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.onStateChange?(.idle)
        }
    }
    
    /// 语音合成取消
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.onStateChange?(.idle)
        }
    }
    
    /// 语音合成进度
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, willSpeakRangeOfSpeechString characterRange: NSRange, utterance: AVSpeechUtterance) {
        // 可以在这里处理语音合成进度
    }
}
