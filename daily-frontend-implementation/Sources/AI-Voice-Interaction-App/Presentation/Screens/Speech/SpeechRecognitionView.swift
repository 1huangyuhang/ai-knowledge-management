//
//  SpeechRecognitionView.swift
//  AI-Voice-Interaction-App
//
//  Created by Huang Yuhang on 2026/01/13.
//

import SwiftUI
import AVFoundation

/// 语音识别视图
struct SpeechRecognitionView: View {
    
    // MARK: - State Properties
    
    @StateObject private var viewModel: SpeechRecognitionViewModel
    @State private var showPermissionAlert = false
    @State private var permissionAlertMessage = ""
    
    // MARK: - Initialization
    
    /// 初始化语音识别视图
    /// - Parameter viewModel: 语音识别ViewModel
    init(viewModel: SpeechRecognitionViewModel) {
        self._viewModel = StateObject(wrappedValue: viewModel)
    }
    
    // MARK: - Body
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // 标题
                    Text("语音识别")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .padding(.top, 16)
                    
                    // 识别结果显示
                    recognizedTextSection
                    
                    // 波形可视化
                    waveformVisualization
                    
                    // 状态显示
                    statusSection
                    
                    // 控制按钮
                    controlButtons
                    
                    // 操作历史
                    if !viewModel.recognizedText.isEmpty {
                        recentActivitySection
                    }
                }
                .padding()
                .background(Color(UIColor.systemGroupedBackground))
            }
            .navigationTitle("语音交互")
            .navigationBarTitleDisplayMode(.inline)
            .alert(isPresented: $showPermissionAlert) {
                Alert(
                    title: Text("权限请求"),
                    message: Text(permissionAlertMessage),
                    primaryButton: .default(Text("设置")) {
                        openSettings()
                    },
                    secondaryButton: .cancel()
                )
            }
            .onAppear {
                viewModel.requestPermission()
            }
        }
    }
    
    // MARK: - View Sections
    
    /// 识别结果显示区域
    private var recognizedTextSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("识别结果")
                .font(.headline)
            
            Text(viewModel.recognizedText.isEmpty ? "点击开始录音进行语音识别" : viewModel.recognizedText)
                .font(.body)
                .foregroundColor(viewModel.recognizedText.isEmpty ? .secondary : .primary)
                .padding()
                .background(Color.white)
                .cornerRadius(12)
                .shadow(radius: 2)
                .frame(minHeight: 100)
                .multilineTextAlignment(.leading)
        }
    }
    
    /// 波形可视化区域
    private var waveformVisualization: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("音频波形")
                .font(.headline)
            
            ZStack {
                Rectangle()
                    .fill(Color.white)
                    .cornerRadius(12)
                    .shadow(radius: 2)
                
                HStack(spacing: 2) {
                    ForEach(0..<viewModel.waveformData.count, id: \.self) {
                        index in
                        BarView(
                            height: CGFloat(viewModel.waveformData[index] * 100),
                            isRecording: viewModel.isRecording
                        )
                        .animation(.linear(duration: 0.1), value: viewModel.waveformData[index])
                    }
                }
                .padding()
            }
            .frame(height: 150)
        }
    }
    
    /// 状态显示区域
    private var statusSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("状态")
                .font(.headline)
            
            HStack {
                StatusIndicator(
                    isRecording: viewModel.isRecording,
                    status: viewModel.state
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
    
    /// 控制按钮区域
    private var controlButtons: some View {
        VStack(spacing: 16) {
            HStack(spacing: 16) {
                // 开始录音按钮
                if !viewModel.isRecording {
                    Button(action: {
                        viewModel.startRecording()
                    }) {
                        ButtonContent(
                            title: "开始录音",
                            imageName: "mic",
                            color: .green
                        )
                    }
                    .disabled(viewModel.state != .readyToRecord)
                    
                    // 取消按钮
                    Button(action: {
                        viewModel.cancelRecording()
                    }) {
                        ButtonContent(
                            title: "取消",
                            imageName: "xmark.circle",
                            color: .gray
                        )
                    }
                    .disabled(viewModel.state != .readyToRecord)
                } else {
                    // 停止录音按钮
                    Button(action: {
                        viewModel.stopRecording()
                    }) {
                        ButtonContent(
                            title: "停止录音",
                            imageName: "stop.circle",
                            color: .red
                        )
                    }
                    
                    // 取消录音按钮
                    Button(action: {
                        viewModel.cancelRecording()
                    }) {
                        ButtonContent(
                            title: "取消录音",
                            imageName: "xmark.circle",
                            color: .orange
                        )
                    }
                }
            }
            
            // 重置按钮
            Button(action: {
                viewModel.reset()
            }) {
                Text("重置")
                    .font(.body)
                    .foregroundColor(.primary)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(radius: 2)
            }
            .disabled(viewModel.state == .idle)
        }
    }
    
    /// 最近活动区域
    private var recentActivitySection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("最近活动")
                .font(.headline)
            
            HStack {
                Text("识别完成时间")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text(formatDate(Date()))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(radius: 2)
        }
    }
    
    // MARK: - Helper Views
    
    /// 波形柱形视图
    private struct BarView: View {
        let height: CGFloat
        let isRecording: Bool
        
        var body: some View {
            Rectangle()
                .fill(isRecording ? Color.blue : Color.gray.opacity(0.3))
                .frame(height: height)
                .cornerRadius(2)
        }
    }
    
    /// 状态指示器视图
    private struct StatusIndicator: View {
        let isRecording: Bool
        let status: SpeechRecognitionViewState
        
        var body: some View {
            Circle()
                .fill(color)
                .frame(width: 12, height: 12)
        }
        
        private var color: Color {
            switch status {
            case .idle, .readyToRecord:
                return .green
            case .recording, .processing:
                return .red
            case .completed(_):
                return .blue
            case .error(_), .requestingPermission:
                return .orange
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
        case .requestingPermission:
            return "请求权限中"
        case .readyToRecord:
            return "准备开始录音"
        case .recording:
            return "正在录音..."
        case .processing:
            return "处理中..."
        case .completed(_):
            return "识别完成"
        case .error(let message):
            return "错误: \(message)"
        }
    }
    
    /// 格式化日期
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .medium
        return formatter.string(from: date)
    }
    
    /// 打开系统设置
    private func openSettings() {
        guard let url = URL(string: UIApplication.openSettingsURLString) else {
            return
        }
        UIApplication.shared.open(url)
    }
}

/// 预览
struct SpeechRecognitionView_Previews: PreviewProvider {
    static var previews: some View {
        let speechService = SpeechService()
        let speechToTextService = SpeechToTextService()
        let viewModel = SpeechRecognitionViewModel(
            speechService: speechService,
            speechToTextService: speechToTextService
        )
        SpeechRecognitionView(viewModel: viewModel)
    }
}
