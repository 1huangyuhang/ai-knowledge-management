//
//  SpeechRecognitionViewWrapper.swift
//  AI-Voice-Interaction-App
//
//  Created by Huang Yuhang on 2026/01/13.
//

import SwiftUI

/// 语音识别视图包装器，用于处理依赖注入
struct SpeechRecognitionViewWrapper: View {
    
    var body: some View {
        // 初始化依赖项
        let speechService = SpeechService()
        let speechToTextService = SpeechToTextService()
        let viewModel = SpeechRecognitionViewModel(
            speechService: speechService,
            speechToTextService: speechToTextService
        )
        
        // 返回带有依赖项的语音识别视图
        SpeechRecognitionView(viewModel: viewModel)
    }
}
