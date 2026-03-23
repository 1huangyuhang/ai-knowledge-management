# Day 24: 个性化设置优化 - 技术实现文档

## 核心任务概述

优化个性化设置的体验和功能，包括实现设置的预览功能、导入和导出功能、重置功能以及性能优化。

## 技术实现细节

### 1. 设置的预览功能

#### 1.1 主题预览组件

```swift
struct ThemePreviewView: View {
    let themeMode: ThemeMode
    let colorScheme: ColorScheme
    @Binding var selectedTheme: ThemeMode
    @Binding var selectedColorScheme: ColorScheme
    
    var body: some View {
        VStack(spacing: 12) {
            // 预览标题
            Text("主题预览")
                .font(.headline)
                .foregroundColor(.appTextPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // 预览卡片
            ZStack {
                // 预览内容
                PreviewCardView(themeMode: themeMode, colorScheme: colorScheme)
                
                // 选择指示器
                if selectedTheme == themeMode && selectedColorScheme == colorScheme {
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.appPrimary, lineWidth: 3)
                        .shadow(color: Color.appPrimary.opacity(0.3), radius: 8, x: 0, y: 0)
                }
            }
            .onTapGesture {
                selectedTheme = themeMode
                selectedColorScheme = colorScheme
            }
        }
        .padding(16)
        .background(.appBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
    }
}

// 预览卡片组件
struct PreviewCardView: View {
    let themeMode: ThemeMode
    let colorScheme: ColorScheme
    
    var body: some View {
        VStack(spacing: 8) {
            // 顶部栏
            HStack {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 24))
                    .foregroundColor(colorScheme.accentColor)
                
                Spacer()
                
                HStack(spacing: 12) {
                    Image(systemName: "bell.fill")
                        .font(.system(size: 20))
                        .foregroundColor(colorScheme.secondaryColor)
                    
                    Image(systemName: "gearshape.fill")
                        .font(.system(size: 20))
                        .foregroundColor(colorScheme.secondaryColor)
                }
            }
            .padding(12)
            .background(colorScheme.primaryColor)
            .cornerRadius(8)
            
            // 内容区域
            VStack(spacing: 8) {
                // 标题
                Text("个性化设置")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(colorScheme.textPrimaryColor)
                
                // 描述
                Text("预览当前主题和颜色方案的效果")
                    .font(.body)
                    .foregroundColor(colorScheme.textSecondaryColor)
                    .multilineTextAlignment(.center)
                
                // 按钮组
                HStack(spacing: 12) {
                    Button(action: {})
                    {
                        Text("主要按钮")
                            .font(.body)
                            .foregroundColor(.white)
                            .padding(10)
                            .padding(.horizontal, 16)
                            .background(colorScheme.primaryColor)
                            .cornerRadius(8)
                    }
                    
                    Button(action: {})
                    {
                        Text("次要按钮")
                            .font(.body)
                            .foregroundColor(colorScheme.primaryColor)
                            .padding(10)
                            .padding(.horizontal, 16)
                            .background(colorScheme.secondaryColor)
                            .cornerRadius(8)
                    }
                }
            }
            .padding(16)
            .background(colorScheme.backgroundPrimaryColor)
            .cornerRadius(8)
        }
        .frame(width: 240, height: 280)
        .environment(\.colorScheme, themeMode == .dark ? .dark : .light)
    }
}
```

#### 1.2 语音预览功能

```swift
struct VoicePreviewView: View {
    @State private var isPlaying: Bool = false
    @State private var voice: AVSpeechSynthesisVoice = AVSpeechSynthesisVoice(language: "zh-CN")!
    @State private var previewText: String = "这是语音预览功能，用于预览文本转语音的效果。"
    
    // 语音合成器
    private let synthesizer = AVSpeechSynthesizer()
    
    var body: some View {
        VStack(spacing: 16) {
            // 预览文本输入
            TextField("预览文本", text: $previewText, axis: .vertical)
                .textFieldStyle(DefaultTextFieldStyle())
                .font(.body)
                .padding(12)
                .background(.appBackgroundSecondary)
                .cornerRadius(8)
                .lineLimit(3)
            
            // 语音选择
            Picker("语音", selection: $voice) {
                ForEach(getAvailableVoices(), id: \.self) {
                    voice in
                    Text(voice.name)
                }
            }
            .pickerStyle(MenuPickerStyle())
            .padding(12)
            .background(.appBackgroundSecondary)
            .cornerRadius(8)
            
            // 播放控制
            Button(action: togglePlayback) {
                HStack(spacing: 8) {
                    Image(systemName: isPlaying ? "stop.circle.fill" : "play.circle.fill")
                        .font(.system(size: 24))
                    Text(isPlaying ? "停止预览" : "播放预览")
                        .font(.body)
                }
                .foregroundColor(.appPrimary)
                .padding(12)
                .background(.appPrimary.opacity(0.1))
                .cornerRadius(8)
            }
            .disabled(previewText.isEmpty)
            
            // 音量控制
            VStack(spacing: 4) {
                HStack {
                    Text("音量")
                        .font(.body)
                        .foregroundColor(.appTextPrimary)
                    Spacer()
                }
                
                Slider(value: .constant(0.7), in: 0...1, step: 0.1)
                    .accentColor(.appPrimary)
            }
            
            // 语速控制
            VStack(spacing: 4) {
                HStack {
                    Text("语速")
                        .font(.body)
                        .foregroundColor(.appTextPrimary)
                    Spacer()
                }
                
                Slider(value: .constant(0.8), in: 0.5...2, step: 0.1)
                    .accentColor(.appPrimary)
            }
        }
        .padding(16)
        .background(.appBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
        .onDisappear {
            // 停止播放
            synthesizer.stopSpeaking(at: .immediate)
        }
    }
    
    // 切换播放状态
    private func togglePlayback() {
        if isPlaying {
            synthesizer.stopSpeaking(at: .immediate)
            isPlaying = false
        } else {
            let utterance = AVSpeechUtterance(string: previewText)
            utterance.voice = voice
            utterance.rate = 0.8
            utterance.pitchMultiplier = 1.0
            utterance.volume = 0.7
            
            synthesizer.speak(utterance)
            isPlaying = true
        }
    }
    
    // 获取可用语音列表
    private func getAvailableVoices() -> [AVSpeechSynthesisVoice] {
        return AVSpeechSynthesisVoice.speechVoices()
            .filter { $0.language.hasPrefix("zh-") || $0.language.hasPrefix("en-") }
            .sorted { $0.name < $1.name }
    }
}
```

### 2. 设置的导入和导出功能

#### 2.1 导入导出ViewModel

```swift
class SettingsImportExportViewModel: ObservableObject {
    // 状态
    @Published var isExporting: Bool = false
    @Published var isImporting: Bool = false
    @Published var error: Error? = nil
    @Published var successMessage: String? = nil
    
    // 服务
    private let settingsService: SettingsService
    private let fileManager: FileManager
    
    init(
        settingsService: SettingsService = AppContainer.shared.resolve(SettingsService.self)!,
        fileManager: FileManager = FileManager.default
    ) {
        self.settingsService = settingsService
        self.fileManager = fileManager
    }
    
    // 导出设置
    func exportSettings() {
        isExporting = true
        error = nil
        successMessage = nil
        
        settingsService.getUserPreferences {
            [weak self] result in
            DispatchQueue.main.async {
                self?.isExporting = false
                
                switch result {
                case .success(let preferences):
                    self?.savePreferencesToFile(preferences)
                case .failure(let error):
                    self?.error = error
                }
            }
        }
    }
    
    // 将设置保存到文件
    private func savePreferencesToFile(_ preferences: UserPreferences) {
        do {
            // 创建文件URL
            let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
            let fileName = "ai-voice-app-settings-\(Date().formatted(.iso8601.dateTime.hour().minute().second())).json"
            let fileURL = documentsDirectory.appendingPathComponent(fileName)
            
            // 编码设置
            let encoder = JSONEncoder()
            encoder.outputFormatting = .prettyPrinted
            let data = try encoder.encode(preferences)
            
            // 写入文件
            try data.write(to: fileURL)
            
            // 显示分享界面
            self?.showShareSheet(fileURL: fileURL)
            self?.successMessage = "设置已导出到文件: \(fileName)"
        } catch {
            self.error = error
        }
    }
    
    // 显示分享界面
    private func showShareSheet(fileURL: URL) {
        // 实现分享功能
        let activityViewController = UIActivityViewController(
            activityItems: [fileURL],
            applicationActivities: nil
        )
        
        // 获取当前窗口
        let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene
        let window = scene?.windows.first
        
        // 显示分享界面
        window?.rootViewController?.present(activityViewController, animated: true)
    }
    
    // 导入设置
    func importSettings(from fileURL: URL) {
        isImporting = true
        error = nil
        successMessage = nil
        
        do {
            // 读取文件内容
            let data = try Data(contentsOf: fileURL)
            
            // 解码设置
            let decoder = JSONDecoder()
            let preferences = try decoder.decode(UserPreferences.self, from: data)
            
            // 应用设置
            settingsService.updateUserPreferences(preferences) {
                [weak self] result in
                DispatchQueue.main.async {
                    self?.isImporting = false
                    
                    switch result {
                    case .success:
                        self?.successMessage = "设置已成功导入"
                    case .failure(let error):
                        self?.error = error
                    }
                }
            }
        } catch {
            DispatchQueue.main.async {
                self.isImporting = false
                self.error = error
            }
        }
    }
    
    // 重置设置
    func resetSettings() {
        isExporting = true
        error = nil
        successMessage = nil
        
        settingsService.resetUserPreferences {
            [weak self] result in
            DispatchQueue.main.async {
                self?.isExporting = false
                
                switch result {
                case .success:
                    self?.successMessage = "设置已重置为默认值"
                case .failure(let error):
                    self?.error = error
                }
            }
        }
    }
}
```

#### 2.2 导入导出界面

```swift
struct SettingsImportExportView: View {
    @StateObject private var viewModel = SettingsImportExportViewModel()
    @State private var showFilePicker = false
    
    var body: some View {
        VStack(spacing: 16) {
            // 标题
            Text("设置导入导出")
                .font(.headline)
                .foregroundColor(.appTextPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // 说明文本
            Text("您可以导出当前设置到文件，或从文件导入设置。")
                .font(.body)
                .foregroundColor(.appTextSecondary)
                .multilineTextAlignment(.leading)
            
            // 按钮组
            VStack(spacing: 12) {
                // 导出按钮
                Button(action: {
                    viewModel.exportSettings()
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "square.and.arrow.up.fill")
                            .font(.system(size: 20))
                        Text("导出设置")
                            .font(.body)
                    }
                    .foregroundColor(.white)
                    .padding(12)
                    .frame(maxWidth: .infinity)
                    .background(.appPrimary)
                    .cornerRadius(8)
                }
                .disabled(viewModel.isExporting)
                
                // 导入按钮
                Button(action: {
                    showFilePicker = true
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "square.and.arrow.down.fill")
                            .font(.system(size: 20))
                        Text("导入设置")
                            .font(.body)
                    }
                    .foregroundColor(.appPrimary)
                    .padding(12)
                    .frame(maxWidth: .infinity)
                    .background(.appPrimary.opacity(0.1))
                    .cornerRadius(8)
                }
                .disabled(viewModel.isImporting)
                
                // 重置按钮
                Button(action: {
                    showResetConfirmation()
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.counterclockwise.circle.fill")
                            .font(.system(size: 20))
                        Text("重置设置")
                            .font(.body)
                    }
                    .foregroundColor(.appDanger)
                    .padding(12)
                    .frame(maxWidth: .infinity)
                    .background(.appDanger.opacity(0.1))
                    .cornerRadius(8)
                }
            }
            
            // 状态提示
            if viewModel.isExporting || viewModel.isImporting {
                ProgressView(viewModel.isExporting ? "正在导出设置..." : "正在导入设置...")
                    .padding(16)
            }
            
            // 错误提示
            if let error = viewModel.error {
                ErrorView(message: error.localizedDescription)
                    .padding(16)
            }
            
            // 成功提示
            if let successMessage = viewModel.successMessage {
                SuccessView(message: successMessage)
                    .padding(16)
            }
        }
        .padding(16)
        .background(.appBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
        .fileImporter(
            isPresented: $showFilePicker,
            allowedContentTypes: [.json],
            allowsMultipleSelection: false
        ) { result in
            switch result {
            case .success(let urls):
                if let fileURL = urls.first {
                    viewModel.importSettings(from: fileURL)
                }
            case .failure(let error):
                viewModel.error = error
            }
        }
    }
    
    // 显示重置确认
    private func showResetConfirmation() {
        // 实现确认弹窗
        let alertController = UIAlertController(
            title: "确认重置",
            message: "确定要将所有设置重置为默认值吗？此操作不可撤销。",
            preferredStyle: .alert
        )
        
        alertController.addAction(UIAlertAction(title: "取消", style: .cancel))
        alertController.addAction(UIAlertAction(title: "重置", style: .destructive) {
            _ in
            self.viewModel.resetSettings()
        })
        
        // 获取当前窗口
        let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene
        let window = scene?.windows.first
        
        // 显示弹窗
        window?.rootViewController?.present(alertController, animated: true)
    }
}

// 错误提示组件
struct ErrorView: View {
    let message: String
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.circle.fill")
                .font(.system(size: 20))
                .foregroundColor(.appDanger)
            
            Text(message)
                .font(.body)
                .foregroundColor(.appDanger)
                .multilineTextAlignment(.leading)
        }
        .padding(12)
        .background(.appDanger.opacity(0.1))
        .cornerRadius(8)
    }
}

// 成功提示组件
struct SuccessView: View {
    let message: String
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 20))
                .foregroundColor(.appSuccess)
            
            Text(message)
                .font(.body)
                .foregroundColor(.appSuccess)
                .multilineTextAlignment(.leading)
        }
        .padding(12)
        .background(.appSuccess.opacity(0.1))
        .cornerRadius(8)
    }
}
```

### 3. 设置的重置功能

#### 3.1 重置设置确认界面

```swift
struct SettingsResetConfirmationView: View {
    @Binding var isPresented: Bool
    let onConfirm: () -> Void
    let onCancel: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            // 图标
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 64))
                .foregroundColor(.appWarning)
            
            // 标题
            Text("确认重置设置")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.appTextPrimary)
                .multilineTextAlignment(.center)
            
            // 描述
            Text("确定要将所有个性化设置重置为默认值吗？此操作不可撤销，当前的所有自定义设置都将丢失。")
                .font(.body)
                .foregroundColor(.appTextSecondary)
                .multilineTextAlignment(.center)
            
            // 按钮组
            HStack(spacing: 12) {
                Button(action: onCancel) {
                    Text("取消")
                        .font(.body)
                        .foregroundColor(.appTextPrimary)
                        .padding(12)
                        .frame(maxWidth: .infinity)
                        .background(.appBackgroundSecondary)
                        .cornerRadius(8)
                }
                
                Button(action: {
                    onConfirm()
                    isPresented = false
                }) {
                    Text("重置")
                        .font(.body)
                        .foregroundColor(.white)
                        .padding(12)
                        .frame(maxWidth: .infinity)
                        .background(.appDanger)
                        .cornerRadius(8)
                }
            }
        }
        .padding(24)
        .background(.appBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.2), radius: 20, x: 0, y: 10)
        .padding(24)
    }
}
```

### 4. 性能优化

#### 4.1 设置缓存优化

```swift
class CacheService {
    // 缓存过期时间（24小时）
    private let cacheExpirationTime: TimeInterval = 24 * 60 * 60
    
    // 缓存元数据
    private var cacheMetadata: [CacheKey: CacheMetadata] = [:]
    
    // 缓存元数据结构
    private struct CacheMetadata: Codable {
        let timestamp: Date
        let version: Int
    }
    
    // 保存对象到缓存，并记录元数据
    func set<T: Codable>(_ object: T, forKey key: CacheKey, version: Int = 1) {
        do {
            // 保存到内存缓存
            let data = try JSONEncoder().encode(object)
            cache.setObject(data as NSData, forKey: key.rawValue as NSString)
            
            // 保存到磁盘缓存
            let fileURL = cacheDirectory.appendingPathComponent(key.rawValue)
            try data.write(to: fileURL)
            
            // 保存元数据
            let metadata = CacheMetadata(timestamp: Date(), version: version)
            let metadataData = try JSONEncoder().encode(metadata)
            let metadataFileURL = cacheDirectory.appendingPathComponent("\(key.rawValue).metadata")
            try metadataData.write(to: metadataFileURL)
            
            // 更新内存中的元数据
            cacheMetadata[key] = metadata
        } catch {
            print("缓存保存失败: \(error)")
        }
    }
    
    // 从缓存获取对象，检查过期时间
    func get<T: Codable>(_ type: T.Type, forKey key: CacheKey) -> T? {
        // 检查内存缓存
        if let data = cache.object(forKey: key.rawValue as NSString) as Data?, let metadata = cacheMetadata[key] {
            if !isCacheExpired(metadata) {
                do {
                    return try JSONDecoder().decode(type, from: data)
                } catch {
                    print("内存缓存读取失败: \(error)")
                }
            }
        }
        
        // 检查磁盘缓存
        let fileURL = cacheDirectory.appendingPathComponent(key.rawValue)
        let metadataFileURL = cacheDirectory.appendingPathComponent("\(key.rawValue).metadata")
        
        if let data = try? Data(contentsOf: fileURL), let metadataData = try? Data(contentsOf: metadataFileURL) {
            do {
                let metadata = try JSONDecoder().decode(CacheMetadata.self, from: metadataData)
                
                if !isCacheExpired(metadata) {
                    let object = try JSONDecoder().decode(type, from: data)
                    
                    // 更新内存缓存
                    cache.setObject(data as NSData, forKey: key.rawValue as NSString)
                    cacheMetadata[key] = metadata
                    
                    return object
                }
            } catch {
                print("磁盘缓存读取失败: \(error)")
            }
        }
        
        return nil
    }
    
    // 检查缓存是否过期
    private func isCacheExpired(_ metadata: CacheMetadata) -> Bool {
        return Date().timeIntervalSince(metadata.timestamp) > cacheExpirationTime
    }
    
    // 清除过期缓存
    func clearExpiredCache() {
        // 清除内存中的过期缓存
        for (key, metadata) in cacheMetadata {
            if isCacheExpired(metadata) {
                cache.removeObject(forKey: key.rawValue as NSString)
                cacheMetadata.removeValue(forKey: key)
            }
        }
        
        // 清除磁盘中的过期缓存
        let cacheKeys = CacheKey.allCases
        for key in cacheKeys {
            let metadataFileURL = cacheDirectory.appendingPathComponent("\(key.rawValue).metadata")
            if let metadataData = try? Data(contentsOf: metadataFileURL) {
                do {
                    let metadata = try JSONDecoder().decode(CacheMetadata.self, from: metadataData)
                    if isCacheExpired(metadata) {
                        // 移除缓存文件
                        let fileURL = cacheDirectory.appendingPathComponent(key.rawValue)
                        try? fileManager.removeItem(at: fileURL)
                        try? fileManager.removeItem(at: metadataFileURL)
                    }
                } catch {
                    print("清除过期缓存失败: \(error)")
                }
            }
        }
    }
}
```

#### 4.2 设置应用优化

```swift
class ThemeManager {
    // 主题应用队列
    private let themeApplyQueue = DispatchQueue(label: "com.ai-voice-app.theme-apply", qos: .userInteractive)
    
    // 应用主题，使用队列确保线程安全
    func applyTheme(_ theme: ThemeMode) {
        themeApplyQueue.async {
            self.currentTheme = theme
            
            // 应用主题到系统
            self.applyThemeToSystem(theme)
            
            // 发送主题变化通知
            DispatchQueue.main.async {
                NotificationCenter.default.post(name: self.themeChangedNotification, object: nil)
            }
        }
    }
    
    // 批量应用设置
    func applySettingsBatch(_ preferences: UserPreferences) {
        themeApplyQueue.async {
            // 应用主题设置
            self.currentTheme = preferences.themeMode
            self.currentColorScheme = preferences.colorScheme
            self.followSystem = preferences.followSystem
            self.enhancedDarkMode = preferences.enhancedDarkMode
            
            // 应用主题到系统
            self.applyThemeToSystem(preferences.themeMode)
            self.applyColorSchemeToSystem(preferences.colorScheme)
            
            // 发送主题变化通知
            DispatchQueue.main.async {
                NotificationCenter.default.post(name: self.themeChangedNotification, object: nil)
            }
        }
    }
}
```

### 5. 高级设置页面

```swift
struct AdvancedSettingsView: View {
    @StateObject private var viewModel = AdvancedSettingsViewModel()
    
    var body: some View {
        VStack(spacing: 0) {
            // 顶部导航栏
            SettingsSubTopBarView(title: "高级设置")
            
            // 主内容
            ScrollView {
                VStack(spacing: 16) {
                    // 数据收集设置
                    VStack(spacing: 12) {
                        SectionHeaderView(title: "数据收集")
                        
                        ToggleSettingItemView(
                            title: "允许数据收集",
                            subtitle: "帮助我们改进应用体验",
                            isOn: $viewModel.dataCollectionEnabled,
                            onToggle: { viewModel.updateDataCollectionEnabled($0) }
                        )
                        
                        ToggleSettingItemView(
                            title: "允许分析",
                            subtitle: "收集应用使用数据以改进功能",
                            isOn: $viewModel.analyticsEnabled,
                            onToggle: { viewModel.updateAnalyticsEnabled($0) }
                        )
                        
                        ToggleSettingItemView(
                            title: "允许崩溃报告",
                            subtitle: "自动发送崩溃报告以帮助我们修复问题",
                            isOn: $viewModel.crashReportingEnabled,
                            onToggle: { viewModel.updateCrashReportingEnabled($0) }
                        )
                    }
                    
                    // 性能设置
                    VStack(spacing: 12) {
                        SectionHeaderView(title: "性能设置")
                        
                        ToggleSettingItemView(
                            title: "启用硬件加速",
                            subtitle: "使用设备硬件加速提高应用性能",
                            isOn: $viewModel.hardwareAccelerationEnabled,
                            onToggle: { viewModel.updateHardwareAccelerationEnabled($0) }
                        )
                        
                        ToggleSettingItemView(
                            title: "启用后台刷新",
                            subtitle: "允许应用在后台刷新数据",
                            isOn: $viewModel.backgroundRefreshEnabled,
                            onToggle: { viewModel.updateBackgroundRefreshEnabled($0) }
                        )
                    }
                    
                    // 导入导出设置
                    SettingsImportExportView()
                    
                    // 重置设置
                    Button(action: {
                        viewModel.showResetConfirmation = true
                    }) {
                        HStack(spacing: 12) {
                            Image(systemName: "arrow.counterclockwise.circle.fill")
                                .foregroundColor(.appDanger)
                                .font(.system(size: 24))
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("重置所有设置")
                                    .font(.body)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.appDanger)
                                Text("将所有设置恢复为默认值")
                                    .font(.caption)
                                    .foregroundColor(.appTextSecondary)
                            }
                            
                            Spacer()
                            
                            Image(systemName: "chevron.right")
                                .foregroundColor(.appTextSecondary)
                        }
                        .padding(16)
                        .background(.appBackground)
                        .cornerRadius(8)
                        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                .padding(16)
            }
            
            // 重置确认弹窗
            if viewModel.showResetConfirmation {
                SettingsResetConfirmationView(
                    isPresented: $viewModel.showResetConfirmation,
                    onConfirm: { viewModel.resetSettings() },
                    onCancel: { viewModel.showResetConfirmation = false }
                )
            }
        }
        .background(Color.appBackground)
        .ignoresSafeArea()
        .onAppear {
            viewModel.loadSettings()
        }
    }
}

// 高级设置ViewModel
class AdvancedSettingsViewModel: ObservableObject {
    // 数据收集设置
    @Published var dataCollectionEnabled: Bool = true
    @Published var analyticsEnabled: Bool = true
    @Published var crashReportingEnabled: Bool = true
    
    // 性能设置
    @Published var hardwareAccelerationEnabled: Bool = true
    @Published var backgroundRefreshEnabled: Bool = true
    
    // 状态
    @Published var isLoading: Bool = false
    @Published var error: Error? = nil
    @Published var showResetConfirmation: Bool = false
    
    // 服务
    private let settingsService: SettingsService
    
    init(settingsService: SettingsService = AppContainer.shared.resolve(SettingsService.self)!) {
        self.settingsService = settingsService
    }
    
    // 加载设置
    func loadSettings() {
        isLoading = true
        error = nil
        
        settingsService.getUserPreferences {
            [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false
                
                switch result {
                case .success(let preferences):
                    self?.applyPreferences(preferences)
                case .failure(let error):
                    self?.error = error
                }
            }
        }
    }
    
    // 应用设置
    private func applyPreferences(_ preferences: UserPreferences) {
        dataCollectionEnabled = preferences.dataCollectionEnabled
        analyticsEnabled = preferences.analyticsEnabled
        crashReportingEnabled = preferences.crashReportingEnabled
        // 其他设置...
    }
    
    // 更新数据收集设置
    func updateDataCollectionEnabled(_ enabled: Bool) {
        dataCollectionEnabled = enabled
        saveSettings()
    }
    
    // 更新分析设置
    func updateAnalyticsEnabled(_ enabled: Bool) {
        analyticsEnabled = enabled
        saveSettings()
    }
    
    // 更新崩溃报告设置
    func updateCrashReportingEnabled(_ enabled: Bool) {
        crashReportingEnabled = enabled
        saveSettings()
    }
    
    // 更新硬件加速设置
    func updateHardwareAccelerationEnabled(_ enabled: Bool) {
        hardwareAccelerationEnabled = enabled
        saveSettings()
    }
    
    // 更新后台刷新设置
    func updateBackgroundRefreshEnabled(_ enabled: Bool) {
        backgroundRefreshEnabled = enabled
        saveSettings()
    }
    
    // 重置设置
    func resetSettings() {
        settingsService.resetUserPreferences {
            [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    self?.loadSettings()
                case .failure(let error):
                    self?.error = error
                }
            }
        }
    }
    
    // 保存设置
    private func saveSettings() {
        settingsService.getUserPreferences {
            [weak self] result in
            switch result {
            case .success(var preferences):
                // 更新设置
                preferences.dataCollectionEnabled = self?.dataCollectionEnabled ?? true
                preferences.analyticsEnabled = self?.analyticsEnabled ?? true
                preferences.crashReportingEnabled = self?.crashReportingEnabled ?? true
                
                // 保存设置
                self?.settingsService.updateUserPreferences(preferences) {
                    [weak self] result in
                    if case .failure(let error) = result {
                        DispatchQueue.main.async {
                            self?.error = error
                        }
                    }
                }
            case .failure(let error):
                DispatchQueue.main.async {
                    self?.error = error
                }
            }
        }
    }
}

// 部分头部组件
struct SectionHeaderView: View {
    let title: String
    
    var body: some View {
        HStack {
            Text(title)
                .font(.headline)
                .foregroundColor(.appTextPrimary)
            Spacer()
        }
        .padding(.horizontal, 16)
    }
}
```

## 测试与验证

1. **单元测试**：
   - 测试导入导出功能的正确性
   - 测试重置功能的正确性
   - 测试缓存优化的效果
   - 测试主题预览的正确性

2. **UI测试**：
   - 测试主题预览的效果
   - 测试语音预览的效果
   - 测试导入导出的流程
   - 测试重置设置的流程

3. **集成测试**：
   - 测试从导出到导入的完整流程
   - 测试重置设置后的效果
   - 测试缓存优化的性能提升
   - 测试批量应用设置的效果

## 性能优化

1. **缓存优化**：
   - 实现缓存的过期机制，自动清除过期缓存
   - 优化缓存的读写性能，减少磁盘I/O
   - 实现缓存的大小限制，防止占用过多存储空间

2. **设置应用优化**：
   - 实现设置的批量应用，减少UI更新次数
   - 优化主题切换的动画效果，减少卡顿
   - 使用后台队列处理设置应用，提高主线程响应速度

3. **UI渲染优化**：
   - 实现设置项的懒加载，减少初始加载时间
   - 优化预览组件的渲染，减少资源占用
   - 使用SwiftUI的性能优化API，如`EquatableView`和`StateObject`

## 总结

第24天的开发优化了个性化设置的体验和功能，包括：

1. 实现了设置的预览功能，包括主题预览和语音预览
2. 实现了设置的导入和导出功能，支持备份和恢复设置
3. 实现了设置的重置功能，支持一键恢复默认设置
4. 优化了设置的缓存机制，提高了设置的加载速度
5. 优化了设置的应用机制，减少了UI更新次数
6. 创建了高级设置页面，支持数据收集、分析和性能设置

这些优化使个性化设置更加易用、高效和可靠，提高了用户体验和应用性能。通过这四天的开发，我们完成了个性化配置模块的全部功能，为用户提供了一个强大、灵活的个性化设置系统。