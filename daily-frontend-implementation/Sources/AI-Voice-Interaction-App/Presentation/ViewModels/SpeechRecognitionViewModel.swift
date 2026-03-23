//
//  SpeechRecognitionViewModel.swift
//  AI-Voice-Interaction-App
//
//  Created by Huang Yuhang on 2026/01/13.
//

import Foundation
import Combine
import Speech

/// 语音识别状态枚举
enum SpeechRecognitionViewState: Equatable {
    case idle
    case requestingPermission
    case readyToRecord
    case recording
    case processing
    case completed(String)
    case error(String)
}

/// 语音识别ViewModel
@MainActor
class SpeechRecognitionViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    @Published var state: SpeechRecognitionViewState = .idle
    @Published var recognizedText: String = ""
    @Published var isRecording: Bool = false
    @Published var waveformData: [Float] = Array(repeating: 0.0, count: 100)
    @Published var isPermissionGranted: Bool = false
    
    // MARK: - Private Properties
    
    private let speechService: SpeechServiceProtocol
    private let speechToTextService: SpeechToTextServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    /// 初始化语音识别ViewModel
    /// - Parameters:
    ///   - speechService: 语音服务
    ///   - speechToTextService: 语音转文本服务
    init(
        speechService: SpeechServiceProtocol,
        speechToTextService: SpeechToTextServiceProtocol
    ) {
        self.speechService = speechService
        self.speechToTextService = speechToTextService
        
        // 设置语音服务回调
        setupSpeechServiceCallbacks()
    }
    
    // MARK: - Public Methods
    
    /// 请求语音识别权限
    func requestPermission() {
        state = .requestingPermission
        
        Task {
            do {
                let granted = try await speechService.requestPermission()
                DispatchQueue.main.async {
                    self.isPermissionGranted = granted
                    self.state = granted ? .readyToRecord : .error("语音识别权限被拒绝")
                }
            } catch {
                DispatchQueue.main.async {
                    self.state = .error(error.localizedDescription)
                }
            }
        }
    }
    
    /// 开始录音
    func startRecording() {
        state = .recording
        isRecording = true
        recognizedText = ""
        
        Task {
            do {
                try await speechService.startRecording(languageCode: "zh-CN")
                // 监听语音识别结果的变化
                // 这里需要根据实际实现来处理，可能需要添加Combine订阅或其他方式
            } catch {
                DispatchQueue.main.async {
                    self.state = .error(error.localizedDescription)
                    self.isRecording = false
                }
            }
        }
    }
    
    /// 停止录音
    func stopRecording() {
        state = .processing
        isRecording = false
        
        Task {
            do {
                try await speechService.stopRecording()
                // 根据实际实现，可能需要获取录音结果
                // 这里假设语音服务会通过其他方式（如Combine）更新recognitionResult
                DispatchQueue.main.async {
                    self.state = .completed(self.speechService.recognitionResult)
                    self.recognizedText = self.speechService.recognitionResult
                }
            } catch {
                DispatchQueue.main.async {
                    self.state = .error(error.localizedDescription)
                }
            }
        }
    }
    
    /// 取消录音
    func cancelRecording() {
        state = .readyToRecord
        isRecording = false
        recognizedText = ""
        
        Task {
            do {
                try await speechService.cancelRecording()
            } catch {
                DispatchQueue.main.async {
                    self.state = .error(error.localizedDescription)
                }
            }
        }
    }
    
    // MARK: - Private Methods
    
    /// 设置语音服务回调
    private func setupSpeechServiceCallbacks() {
        // 移除了对不存在的属性的访问
        // 语音服务回调将通过其他方式实现，例如Combine订阅
    }
    
    /// 处理语音转文本
    /// - Parameter audioData: 音频数据
    private func processSpeechToText(audioData: Data) {
        state = .processing
        
        Task {
            do {
                let result = try await speechToTextService.getSpeechToTextResult(audioData: audioData, languageCode: "zh-CN")
                DispatchQueue.main.async {
                    self.recognizedText = result.text
                    self.state = .completed(result.text)
                }
            } catch {
                DispatchQueue.main.async {
                    self.state = .error(error.localizedDescription)
                }
            }
        }
    }
    
    /// 重置状态
    func reset() {
        state = .readyToRecord
        recognizedText = ""
        waveformData = Array(repeating: 0.0, count: 100)
    }
}
