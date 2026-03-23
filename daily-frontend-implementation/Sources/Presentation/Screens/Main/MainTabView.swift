import SwiftUI

/// 主标签页视图，包含应用的主要功能入口
struct MainTabView: View {
    // 导航器
    @EnvironmentObject var navigator: AppNavigator
    
    var body: some View {
        TabView {
            // 认知模型管理
            NavigationStack {
                CognitiveModelListView()
            }
            .tabItem {
                Label("认知模型", systemImage: "brain.fill")
            }
            
            // AI对话
            NavigationStack {
                AIConversationView()
            }
            .tabItem {
                Label("AI对话", systemImage: "message.fill")
            }
            
            // 语音交互
            NavigationStack {
                SpeechRecognitionView()
            }
            .tabItem {
                Label("语音交互", systemImage: "mic.fill")
            }
            
            // 分析结果
            NavigationStack {
                Text("分析结果")
            }
            .tabItem {
                Label("分析", systemImage: "chart.bar.fill")
            }
            
            // 设置
            NavigationStack {
                PersonalizationSettingsView()
            }
            .tabItem {
                Label("设置", systemImage: "gearshape.fill")
            }
        }
        .navigationTitle("AI Voice Interaction")
        .navigationBarBackButtonHidden(true)
    }
}

/// 认知模型列表视图（占位符）
struct CognitiveModelListView: View {
    var body: some View {
        VStack {
            Text("认知模型列表")
                .font(.largeTitle)
                .fontWeight(.bold)
            Spacer()
        }
        .padding()
        .navigationTitle("认知模型")
    }
}

/// AI对话视图（占位符）
struct AIConversationView: View {
    var body: some View {
        VStack {
            Text("AI对话")
                .font(.largeTitle)
                .fontWeight(.bold)
            Spacer()
        }
        .padding()
        .navigationTitle("AI对话")
    }
}

/// 语音识别视图（占位符）
struct SpeechRecognitionView: View {
    var body: some View {
        VStack {
            Text("语音识别")
                .font(.largeTitle)
                .fontWeight(.bold)
            Spacer()
        }
        .padding()
        .navigationTitle("语音交互")
    }
}

/// 个性化设置视图（占位符）
struct PersonalizationSettingsView: View {
    var body: some View {
        VStack {
            Text("个性化设置")
                .font(.largeTitle)
                .fontWeight(.bold)
            Spacer()
        }
        .padding()
        .navigationTitle("设置")
    }
}