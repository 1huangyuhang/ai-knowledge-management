import SwiftUI

struct PersonalizationSettingsView: View {
    @StateObject private var viewModel = PersonalizationSettingsViewModel()
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("主题设置")) {
                    Toggle("暗色模式", isOn: $viewModel.isDarkMode)
                    Picker("主题颜色", selection: $viewModel.themeColor) {
                        ForEach(ThemeColor.allCases, id: \.self) {
                            Text($0.displayName)
                        }
                    }
                }
                
                Section(header: Text("语音设置")) {
                    Picker("语音类型", selection: $viewModel.voiceType) {
                        ForEach(VoiceType.allCases, id: \.self) {
                            Text($0.displayName)
                        }
                    }
                    
                    HStack {
                        Text("语速")
                        Slider(value: $viewModel.speechRate, in: 0.5...2.0, step: 0.1)
                        Text(String(format: "%.1f", viewModel.speechRate))
                    }
                    
                    HStack {
                        Text("音调")
                        Slider(value: $viewModel.pitchMultiplier, in: 0.5...2.0, step: 0.1)
                        Text(String(format: "%.1f", viewModel.pitchMultiplier))
                    }
                }
                
                Section(header: Text("通知设置")) {
                    Toggle("启用推送通知", isOn: $viewModel.isPushNotificationsEnabled)
                    Toggle("启用邮件通知", isOn: $viewModel.isEmailNotificationsEnabled)
                }
                
                Section(header: Text("AI设置")) {
                    Toggle("AI建议", isOn: $viewModel.isAISuggestionsEnabled)
                    Toggle("AI洞察生成", isOn: $viewModel.isAIInsightsEnabled)
                    Picker("AI模型", selection: $viewModel.aiModel) {
                        ForEach(AIModel.allCases, id: \.self) {
                            Text($0.displayName)
                        }
                    }
                }
                
                Section(header: Text("隐私设置")) {
                    Toggle("数据收集", isOn: $viewModel.isDataCollectionEnabled)
                    Toggle("匿名模式", isOn: $viewModel.isAnonymousModeEnabled)
                }
                
                Section {
                    Button("保存设置") {
                        viewModel.saveSettings()
                    }
                    .foregroundColor(.blue)
                    
                    Button("重置为默认值") {
                        viewModel.resetToDefaults()
                    }
                    .foregroundColor(.red)
                }
            }
            .navigationTitle("个性化设置")
            .navigationBarTitleDisplayMode(.inline)
            .alert(item: $viewModel.alertItem) {
                Alert(title: Text($0.title), message: Text($0.message), dismissButton: .default(Text("确定")))
            }
        }
    }
}

enum ThemeColor: String, CaseIterable, Identifiable {
    case blue
    case green
    case purple
    case orange
    case red
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .blue: return "蓝色"
        case .green: return "绿色"
        case .purple: return "紫色"
        case .orange: return "橙色"
        case .red: return "红色"
        }
    }
}

enum VoiceType: String, CaseIterable, Identifiable {
    case male
    case female
    case neutral
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .male: return "男声"
        case .female: return "女声"
        case .neutral: return "中性"
        }
    }
}

enum AIModel: String, CaseIterable, Identifiable {
    case gpt35
    case gpt4
    case claude2
    case llama3
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .gpt35: return "GPT-3.5"
        case .gpt4: return "GPT-4"
        case .claude2: return "Claude 2"
        case .llama3: return "Llama 3"
        }
    }
}

struct PersonalizationSettingsView_Previews: PreviewProvider {
    static var previews: some View {
        PersonalizationSettingsView()
    }
}