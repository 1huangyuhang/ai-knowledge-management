//
//  TextToSpeechView.swift
//  AI-Voice-Interaction-App
//
//  Created by Huang Yuhang on 2026/01/13.
//

import SwiftUI

/// 文本转语音视图
struct TextToSpeechView: View {
    
    // MARK: - State Properties
    
    @StateObject private var viewModel: TextToSpeechViewModel
    @State private var text: String = "这是一个AI语音交互应用，用于持续建模并分析用户认知结构，输出结构反馈与思考方向。"
    
    // MARK: - Initialization
    
    /// 初始化文本转语音视图
    /// - Parameter viewModel: 文本转语音ViewModel
    init(viewModel: TextToSpeechViewModel) {
        self._viewModel = StateObject(wrappedValue: viewModel)
    }
    
    // MARK: - Body
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // 标题
                    Text("文本转语音")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .padding(.top, 16)
                    
                    // 文本输入区域
                    textInputSection
                    
                    // 语音设置区域
                    voiceSettingsSection
                    
                    // 控制按钮区域
                    controlButtonsSection
                    
                    // 状态显示区域
                    statusSection
                }
                .padding()
                .background(Color(UIColor.systemGroupedBackground))
            }
            .navigationTitle("文本转语音")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                // 初始化文本
                viewModel.updateText(text)
            }
        }
    }
    
    // MARK: - View Sections
    
    /// 文本输入区域
    private var textInputSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("输入文本")
                .font(.headline)
            
            TextEditor(text: $text)
                .font(.body)
                .foregroundColor(.primary)
                .padding()
                .background(Color.white)
                .cornerRadius(12)
                .shadow(radius: 2)
                .frame(minHeight: 150)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
            
            HStack {
                Text("\(text.count) 字符")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Button(action: {
                    text = ""
                    viewModel.updateText(text)
                }) {
                    Text("清空")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
        }
    }
    
    /// 语音设置区域
    private var voiceSettingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("语音设置")
                .font(.headline)
            
            // 语音选择
            voiceSelectionSection
            
            // 语速设置
            sliderSection(
                title: "语速",
                value: $viewModel.config.rate,
                range: 0.1...1.0,
                step: 0.1,
                label: "\(String(format: "%.1f", viewModel.config.rate))"
            )
            
            // 音调设置
            sliderSection(
                title: "音调",
                value: $viewModel.config.pitchMultiplier,
                range: 0.5...2.0,
                step: 0.1,
                label: "\(String(format: "%.1f", viewModel.config.pitchMultiplier))"
            )
            
            // 音量设置
            sliderSection(
                title: "音量",
                value: $viewModel.config.volume,
                range: 0.0...1.0,
                step: 0.1,
                label: "\(String(format: "%.1f", viewModel.config.volume))"
            )
        }
    }
    
    /// 语音选择区域
    private var voiceSelectionSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("选择语音")
                .font(.subheadline)
                .fontWeight(.semibold)
            
            Menu {
                ForEach(viewModel.availableVoices, id: \.identifier) { voice in
                    Button {
                        viewModel.updateVoice(voice.identifier)
                    } label: {
                        HStack {
                            Text(viewModel.getVoiceName(voice))
                            
                            if voice.identifier == viewModel.config.voiceIdentifier {
                                Spacer()
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
            } label: {
                HStack {
                    if let selectedVoice = viewModel.availableVoices.first(where: { $0.identifier == viewModel.config.voiceIdentifier }) {
                        Text(viewModel.getVoiceName(selectedVoice))
                            .foregroundColor(.primary)
                    } else {
                        Text("选择语音")
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.down")
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color.white)
                .cornerRadius(12)
                .shadow(radius: 2)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
            }
        }
    }
    
    /// 滑块设置区域
    private func sliderSection(
        title: String,
        value: Binding<Float>,
        range: ClosedRange<Float>,
        step: Float,
        label: String
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Slider(
                value: value,
                in: range,
                step: step
            )
            .padding(.horizontal, 4)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    /// 控制按钮区域
    private var controlButtonsSection: some View {
        VStack(spacing: 16) {
            HStack(spacing: 16) {
                // 播放/暂停按钮
                Button(action: {
                    if viewModel.isSpeaking {
                        viewModel.pause()
                    } else if viewModel.isPaused {
                        viewModel.resume()
                    } else {
                        viewModel.updateText(text)
                        viewModel.synthesizeSpeech()
                    }
                }) {
                    ButtonContent(
                        title: viewModel.isSpeaking ? "暂停" : viewModel.isPaused ? "继续" : "播放",
                        imageName: viewModel.isSpeaking ? "pause.circle.fill" : viewModel.isPaused ? "play.circle.fill" : "play.circle.fill",
                        color: viewModel.isSpeaking ? .yellow : viewModel.isPaused ? .green : .green
                    )
                }
                
                // 停止按钮
                Button(action: {
                    viewModel.stop()
                }) {
                    ButtonContent(
                        title: "停止",
                        imageName: "stop.circle.fill",
                        color: .red
                    )
                }
                
                // 重置按钮
                Button(action: {
                    viewModel.reset()
                    text = "这是一个AI语音交互应用，用于持续建模并分析用户认知结构，输出结构反馈与思考方向。"
                    viewModel.updateText(text)
                }) {
                    ButtonContent(
                        title: "重置",
                        imageName: "arrow.counterclockwise.circle.fill",
                        color: .gray
                    )
                }
            }
        }
    }
    
    /// 状态显示区域
    private var statusSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("当前状态")
                .font(.headline)
            
            HStack {
                StatusIndicator(
                    isSpeaking: viewModel.isSpeaking,
                    isPaused: viewModel.isPaused,
                    state: viewModel.state
                )
                
                Text(statusText)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .padding(.leading, 8)
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(radius: 2)
        }
    }
    
    // MARK: - Helper Views
    
    /// 状态指示器视图
    private struct StatusIndicator: View {
        let isSpeaking: Bool
        let isPaused: Bool
        let state: TextToSpeechViewState
        
        var body: some View {
            Circle()
                .fill(color)
                .frame(width: 12, height: 12)
        }
        
        private var color: Color {
            if isSpeaking {
                return .green
            } else if isPaused {
                return .yellow
            } else {
                switch state {
                case .completed:
                    return .blue
                case .error(_):
                    return .red
                default:
                    return .gray
                }
            }
        }
    }
    
    /// 按钮内容视图
    private struct ButtonContent: View {
        let title: String
        let imageName: String
        let color: Color
        
        var body: some View {
            VStack(spacing: 4) {
                Image(systemName: imageName)
                    .font(.title)
                    .foregroundColor(color)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.primary)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.white)
            .cornerRadius(12)
            .shadow(radius: 2)
        }
    }
    
    // MARK: - Helper Methods
    
    /// 获取状态文本
    private var statusText: String {
        switch viewModel.state {
        case .idle:
            return "准备就绪"
        case .synthesizing:
            return "正在合成语音..."
        case .paused:
            return "语音合成已暂停"
        case .completed:
            return "语音合成已完成"
        case .error(let message):
            return "错误: \(message)"
        }
    }
}

/// 预览
struct TextToSpeechView_Previews: PreviewProvider {
    static var previews: some View {
        let textToSpeechService = TextToSpeechService()
        let viewModel = TextToSpeechViewModel(textToSpeechService: textToSpeechService)
        TextToSpeechView(viewModel: viewModel)
    }
}
