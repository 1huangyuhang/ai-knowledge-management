import Foundation
import Speech
import AVFoundation
import Combine

// 语音识别状态枚举
enum SpeechRecognitionState: Equatable {
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
        let status = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }
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