# Day 22: 个性化设置页面实现 - 技术实现文档

## 核心任务概述

实现个性化设置页面，包括主题设置、语音设置、通知设置和分析偏好设置，创建设置项组件，并实现设置页面的导航结构。

## 技术实现细节

### 1. 个性化设置页面UI设计

#### 1.1 设置主页面

```swift
struct PersonalizationSettingsView: View {
    @EnvironmentObject var appRouter: AppRouter
    @StateObject private var viewModel = PersonalizationSettingsViewModel()
    
    var body: some View {
        NavigationStack(path: $appRouter.path) {
            ZStack {
                // 背景
                Color.appBackground
                    .ignoresSafeArea()
                
                // 主内容
                VStack(spacing: 0) {
                    // 顶部导航栏
                    SettingsTopBarView()
                    
                    // 设置列表
                    ScrollView {
                        VStack(spacing: 16) {
                            // 主题设置
                            SettingsSectionView(
                                title: "主题设置",
                                icon: "paintpalette",
                                items: [
                                    SettingItem(
                                        title: "外观模式",
                                        subtitle: viewModel.themeMode.displayName,
                                        icon: "moon.stars.fill",
                                        destination: SettingsDestination.theme
                                    ),
                                    SettingItem(
                                        title: "颜色方案",
                                        subtitle: viewModel.colorScheme.displayName,
                                        icon: "circle.fill",
                                        destination: SettingsDestination.colorScheme
                                    )
                                ]
                            )
                            
                            // 语音设置
                            SettingsSectionView(
                                title: "语音设置",
                                icon: "mic.fill",
                                items: [
                                    SettingItem(
                                        title: "语音识别",
                                        subtitle: viewModel.speechRecognitionEnabled ? "开启" : "关闭",
                                        icon: "mic.circle.fill",
                                        destination: SettingsDestination.speechRecognition
                                    ),
                                    SettingItem(
                                        title: "文本转语音",
                                        subtitle: viewModel.textToSpeechEnabled ? "开启" : "关闭",
                                        icon: "speaker.wave.2.fill",
                                        destination: SettingsDestination.textToSpeech
                                    )
                                ]
                            )
                            
                            // 通知设置
                            SettingsSectionView(
                                title: "通知设置",
                                icon: "bell.fill",
                                items: [
                                    SettingItem(
                                        title: "推送通知",
                                        subtitle: viewModel.pushNotificationsEnabled ? "开启" : "关闭",
                                        icon: "bell.circle.fill",
                                        destination: SettingsDestination.pushNotifications
                                    ),
                                    SettingItem(
                                        title: "提醒设置",
                                        subtitle: "个性化提醒",
                                        icon: "clock.fill",
                                        destination: SettingsDestination.reminders
                                    )
                                ]
                            )
                            
                            // 分析偏好设置
                            SettingsSectionView(
                                title: "分析偏好",
                                icon: "chart.bar.fill",
                                items: [
                                    SettingItem(
                                        title: "思维类型分析",
                                        subtitle: viewModel.thinkingTypeAnalysisEnabled ? "开启" : "关闭",
                                        icon: "brain.fill",
                                        destination: SettingsDestination.thinkingTypeAnalysis
                                    ),
                                    SettingItem(
                                        title: "认知结构分析",
                                        subtitle: viewModel.cognitiveStructureAnalysisEnabled ? "开启" : "关闭",
                                        icon: "network.fill",
                                        destination: SettingsDestination.cognitiveStructureAnalysis
                                    )
                                ]
                            )
                            
                            // 关于设置
                            SettingsSectionView(
                                title: "关于",
                                icon: "info.circle.fill",
                                items: [
                                    SettingItem(
                                        title: "版本信息",
                                        subtitle: "1.0.0",
                                        icon: "app.badge.fill",
                                        destination: SettingsDestination.about
                                    ),
                                    SettingItem(
                                        title: "隐私政策",
                                        subtitle: "查看隐私政策",
                                        icon: "shield.fill",
                                        destination: SettingsDestination.privacyPolicy
                                    )
                                ]
                            )
                        }
                        .padding(16)
                    }
                }
                
                // 加载状态
                if viewModel.isLoading {
                    LoadingOverlayView()
                }
                
                // 错误提示
                if let error = viewModel.error {
                    ErrorOverlayView(
                        error: error.localizedDescription,
                        onRetry: { viewModel.loadSettings() }
                    )
                }
            }
            .navigationBarHidden(true)
        }
        .onAppear {
            viewModel.loadSettings()
        }
    }
}
```

#### 1.2 顶部导航栏

```swift
struct SettingsTopBarView: View {
    var body: some View {
        HStack {
            Button(action: {
                // 返回上一页
                AppContainer.shared.resolve(AppRouter.self)?.pop()
            }) {
                Image(systemName: "chevron.left")
                    .foregroundColor(.appPrimary)
                    .font(.system(size: 18, weight: .semibold))
            }
            
            Spacer()
            
            Text("个性化设置")
                .font(.headline)
                .foregroundColor(.appTextPrimary)
            
            Spacer()
            
            Button(action: {
                // 重置设置
            }) {
                Image(systemName: "arrow.counterclockwise")
                    .foregroundColor(.appPrimary)
                    .font(.system(size: 18, weight: .semibold))
            }
        }
        .padding(16)
        .background(.appBackground)
        .frame(height: 56)
        .shadow(color: .black.opacity(0.1), radius: 2, y: 2)
    }
}
```

#### 1.3 设置分组组件

```swift
struct SettingsSectionView: View {
    let title: String
    let icon: String
    let items: [SettingItem]
    
    var body: some View {
        VStack(spacing: 0) {
            // 分组标题
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.appPrimary)
                    .font(.system(size: 18))
                Text(title)
                    .font(.headline)
                    .foregroundColor(.appTextPrimary)
                Spacer()
            }
            .padding(16)
            .background(.appBackgroundSecondary)
            
            // 设置项列表
            VStack(spacing: 1) {
                ForEach(items) { item in
                    SettingItemView(item: item)
                }
            }
            .background(.appBackground)
            .cornerRadius(8)
            .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
        }
    }
}

// 设置项数据模型
struct SettingItem: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let icon: String
    let destination: SettingsDestination
}

// 设置目的地
enum SettingsDestination {
    case theme
    case colorScheme
    case speechRecognition
    case textToSpeech
    case pushNotifications
    case reminders
    case thinkingTypeAnalysis
    case cognitiveStructureAnalysis
    case about
    case privacyPolicy
}
```

#### 1.4 设置项组件

```swift
struct SettingItemView: View {
    let item: SettingItem
    
    var body: some View {
        Button(action: {
            // 导航到对应设置页面
            navigateToDestination(item.destination)
        }) {
            HStack(spacing: 12) {
                // 图标
                Image(systemName: item.icon)
                    .foregroundColor(.appPrimary)
                    .font(.system(size: 24))
                    .frame(width: 32, height: 32)
                
                // 标题和副标题
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.title)
                        .font(.body)
                        .foregroundColor(.appTextPrimary)
                    Text(item.subtitle)
                        .font(.caption)
                        .foregroundColor(.appTextSecondary)
                }
                
                Spacer()
                
                // 箭头
                Image(systemName: "chevron.right")
                    .foregroundColor(.appTextSecondary)
                    .font(.system(size: 16))
            }
            .padding(16)
            .background(.appBackground)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    // 导航到对应设置页面
    private func navigateToDestination(_ destination: SettingsDestination) {
        let router = AppContainer.shared.resolve(AppRouter.self)
        
        switch destination {
        case .theme:
            router?.push("/settings/theme")
        case .colorScheme:
            router?.push("/settings/color-scheme")
        case .speechRecognition:
            router?.push("/settings/speech-recognition")
        case .textToSpeech:
            router?.push("/settings/text-to-speech")
        case .pushNotifications:
            router?.push("/settings/push-notifications")
        case .reminders:
            router?.push("/settings/reminders")
        case .thinkingTypeAnalysis:
            router?.push("/settings/thinking-type-analysis")
        case .cognitiveStructureAnalysis:
            router?.push("/settings/cognitive-structure-analysis")
        case .about:
            router?.push("/settings/about")
        case .privacyPolicy:
            router?.push("/settings/privacy-policy")
        }
    }
}
```

### 2. 主题设置页面

```swift
struct ThemeSettingsView: View {
    @StateObject private var viewModel = ThemeSettingsViewModel()
    
    var body: some View {
        VStack(spacing: 0) {
            // 顶部导航栏
            SettingsSubTopBarView(title: "外观模式")
            
            // 主内容
            ScrollView {
                VStack(spacing: 16) {
                    // 外观模式选择
                    SettingsOptionGroupView(
                        title: "外观模式",
                        options: ThemeMode.allCases,
                        selectedOption: $viewModel.themeMode,
                        onSelect: { viewModel.updateThemeMode($0) }
                    )
                    
                    // 颜色方案预览
                    ColorSchemePreviewView(
                        colorScheme: viewModel.colorScheme,
                        onSelect: { viewModel.updateColorScheme($0) }
                    )
                    
                    // 高级设置
                    VStack(spacing: 12) {
                        ToggleSettingItemView(
                            title: "跟随系统",
                            subtitle: "根据系统设置自动切换外观",
                            isOn: $viewModel.followSystem,
                            onToggle: { viewModel.updateFollowSystem($0) }
                        )
                        
                        ToggleSettingItemView(
                            title: "深色模式增强",
                            subtitle: "增强深色模式下的对比度",
                            isOn: $viewModel.enhancedDarkMode,
                            onToggle: { viewModel.updateEnhancedDarkMode($0) }
                        )
                    }
                    .padding(16)
                    .background(.appBackground)
                    .cornerRadius(8)
                    .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
                }
                .padding(16)
            }
        }
        .background(Color.appBackground)
        .ignoresSafeArea()
        .onAppear {
            viewModel.loadSettings()
        }
    }
}

// 主题模式
enum ThemeMode: CaseIterable, Identifiable {
    case light
    case dark
    case auto
    
    var id: Self { self }
    
    var displayName: String {
        switch self {
        case .light:
            return "浅色模式"
        case .dark:
            return "深色模式"
        case .auto:
            return "自动"
        }
    }
    
    var icon: String {
        switch self {
        case .light:
            return "sun.max.fill"
        case .dark:
            return "moon.stars.fill"
        case .auto:
            return "circle.lefthalf.fill"
        }
    }
}

// 设置选项组组件
struct SettingsOptionGroupView<Option: CaseIterable & Identifiable & CustomStringConvertible>: View {
    let title: String
    let options: [Option]
    @Binding var selectedOption: Option
    let onSelect: (Option) -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.headline)
                .foregroundColor(.appTextPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 8) {
                ForEach(options) { option in
                    SettingsOptionItemView(
                        option: option,
                        isSelected: selectedOption == option,
                        onSelect: { onSelect(option) }
                    )
                }
            }
        }
        .padding(16)
        .background(.appBackground)
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
    }
}

// 设置选项项组件
struct SettingsOptionItemView<Option: CustomStringConvertible>: View {
    let option: Option
    let isSelected: Bool
    let onSelect: () -> Void
    
    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: 12) {
                Text(option.description)
                    .font(.body)
                    .foregroundColor(isSelected ? .appPrimary : .appTextPrimary)
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.appPrimary)
                        .font(.system(size: 20))
                } else {
                    Image(systemName: "circle")
                        .foregroundColor(.appTextSecondary)
                        .font(.system(size: 20))
                }
            }
            .padding(12)
            .background(isSelected ? .appPrimary.opacity(0.1) : .appBackgroundSecondary)
            .cornerRadius(8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
```

### 3. 语音设置页面

```swift
struct SpeechRecognitionSettingsView: View {
    @StateObject private var viewModel = SpeechRecognitionSettingsViewModel()
    
    var body: some View {
        VStack(spacing: 0) {
            // 顶部导航栏
            SettingsSubTopBarView(title: "语音识别设置")
            
            // 主内容
            ScrollView {
                VStack(spacing: 16) {
                    // 语音识别开关
                    ToggleSettingItemView(
                        title: "语音识别",
                        subtitle: "开启后可以使用语音输入",
                        isOn: $viewModel.enabled,
                        onToggle: { viewModel.updateEnabled($0) }
                    )
                    
                    // 语言选择
                    SettingsOptionGroupView(
                        title: "语音识别语言",
                        options: SpeechLanguage.allCases,
                        selectedOption: $viewModel.language,
                        onSelect: { viewModel.updateLanguage($0) }
                    )
                    
                    // 灵敏度设置
                    SliderSettingItemView(
                        title: "识别灵敏度",
                        value: $viewModel.sensitivity,
                        range: 0.1...1.0,
                        step: 0.1,
                        onValueChange: { viewModel.updateSensitivity($0) }
                    )
                    
                    // 高级设置
                    VStack(spacing: 12) {
                        ToggleSettingItemView(
                            title: "实时识别",
                            subtitle: "实时转换语音为文本",
                            isOn: $viewModel.realTimeRecognition,
                            onToggle: { viewModel.updateRealTimeRecognition($0) }
                        )
                        
                        ToggleSettingItemView(
                            title: "自动标点",
                            subtitle: "自动添加标点符号",
                            isOn: $viewModel.autoPunctuation,
                            onToggle: { viewModel.updateAutoPunctuation($0) }
                        )
                    }
                    .padding(16)
                    .background(.appBackground)
                    .cornerRadius(8)
                    .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
                }
                .padding(16)
            }
        }
        .background(Color.appBackground)
        .ignoresSafeArea()
        .onAppear {
            viewModel.loadSettings()
        }
    }
}

// 语音识别语言
enum SpeechLanguage: CaseIterable, Identifiable {
    case chineseSimplified
    case chineseTraditional
    case englishUS
    case englishUK
    case japanese
    case korean
    
    var id: Self { self }
    
    var description: String {
        switch self {
        case .chineseSimplified:
            return "中文 (简体)"
        case .chineseTraditional:
            return "中文 (繁体)"
        case .englishUS:
            return "English (US)"
        case .englishUK:
            return "English (UK)"
        case .japanese:
            return "日本語"
        case .korean:
            return "한국어"
        }
    }
}
```

### 4. 通知设置页面

```swift
struct PushNotificationSettingsView: View {
    @StateObject private var viewModel = PushNotificationSettingsViewModel()
    
    var body: some View {
        VStack(spacing: 0) {
            // 顶部导航栏
            SettingsSubTopBarView(title: "推送通知")
            
            // 主内容
            ScrollView {
                VStack(spacing: 16) {
                    // 推送通知开关
                    ToggleSettingItemView(
                        title: "允许推送通知",
                        subtitle: "接收应用通知和提醒",
                        isOn: $viewModel.enabled,
                        onToggle: { viewModel.updateEnabled($0) }
                    )
                    
                    // 通知类型设置
                    VStack(spacing: 12) {
                        ToggleSettingItemView(
                            title: "新消息通知",
                            subtitle: "收到新消息时通知",
                            isOn: $viewModel.messageNotifications,
                            onToggle: { viewModel.updateMessageNotifications($0) }
                        )
                        
                        ToggleSettingItemView(
                            title: "提醒通知",
                            subtitle: "接收个性化提醒",
                            isOn: $viewModel.reminderNotifications,
                            onToggle: { viewModel.updateReminderNotifications($0) }
                        )
                        
                        ToggleSettingItemView(
                            title: "分析结果通知",
                            subtitle: "收到新的分析结果时通知",
                            isOn: $viewModel.analysisNotifications,
                            onToggle: { viewModel.updateAnalysisNotifications($0) }
                        )
                        
                        ToggleSettingItemView(
                            title: "系统通知",
                            subtitle: "接收系统更新和维护通知",
                            isOn: $viewModel.systemNotifications,
                            onToggle: { viewModel.updateSystemNotifications($0) }
                        )
                    }
                    .padding(16)
                    .background(.appBackground)
                    .cornerRadius(8)
                    .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
                    
                    // 通知样式
                    SettingsOptionGroupView(
                        title: "通知样式",
                        options: NotificationStyle.allCases,
                        selectedOption: $viewModel.notificationStyle,
                        onSelect: { viewModel.updateNotificationStyle($0) }
                    )
                }
                .padding(16)
            }
        }
        .background(Color.appBackground)
        .ignoresSafeArea()
        .onAppear {
            viewModel.loadSettings()
        }
    }
}

// 通知样式
enum NotificationStyle: CaseIterable, Identifiable {
    case banners
    case alerts
    case none
    
    var id: Self { self }
    
    var description: String {
        switch self {
        case .banners:
            return "横幅"
        case .alerts:
            return "弹窗"
        case .none:
            return "无"
        }
    }
}
```

### 5. ViewModel实现

```swift
class PersonalizationSettingsViewModel: ObservableObject {
    // 主题设置
    @Published var themeMode: ThemeMode = .auto
    @Published var colorScheme: ColorScheme = .default
    @Published var followSystem: Bool = true
    @Published var enhancedDarkMode: Bool = false
    
    // 语音设置
    @Published var speechRecognitionEnabled: Bool = true
    @Published var textToSpeechEnabled: Bool = true
    
    // 通知设置
    @Published var pushNotificationsEnabled: Bool = true
    
    // 状态
    @Published var isLoading: Bool = false
    @Published var error: Error? = nil
    
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
        themeMode = preferences.themeMode
        colorScheme = preferences.colorScheme
        followSystem = preferences.followSystem
        enhancedDarkMode = preferences.enhancedDarkMode
        speechRecognitionEnabled = preferences.speechRecognitionEnabled
        textToSpeechEnabled = preferences.textToSpeechEnabled
        pushNotificationsEnabled = preferences.pushNotificationsEnabled
    }
}

// 主题设置ViewModel
class ThemeSettingsViewModel: ObservableObject {
    // 主题设置
    @Published var themeMode: ThemeMode = .auto
    @Published var colorScheme: ColorScheme = .default
    @Published var followSystem: Bool = true
    @Published var enhancedDarkMode: Bool = false
    
    // 状态
    @Published var isLoading: Bool = false
    @Published var error: Error? = nil
    
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
                    self?.themeMode = preferences.themeMode
                    self?.colorScheme = preferences.colorScheme
                    self?.followSystem = preferences.followSystem
                    self?.enhancedDarkMode = preferences.enhancedDarkMode
                case .failure(let error):
                    self?.error = error
                }
            }
        }
    }
    
    // 更新主题模式
    func updateThemeMode(_ mode: ThemeMode) {
        themeMode = mode
        saveSettings()
        // 应用主题变化
        ThemeManager.shared.applyTheme(mode)
    }
    
    // 更新颜色方案
    func updateColorScheme(_ scheme: ColorScheme) {
        colorScheme = scheme
        saveSettings()
        // 应用颜色方案变化
        ThemeManager.shared.applyColorScheme(scheme)
    }
    
    // 更新跟随系统设置
    func updateFollowSystem(_ follow: Bool) {
        followSystem = follow
        saveSettings()
        if follow {
            // 跟随系统时更新主题
            ThemeManager.shared.applySystemTheme()
        }
    }
    
    // 更新深色模式增强
    func updateEnhancedDarkMode(_ enhanced: Bool) {
        enhancedDarkMode = enhanced
        saveSettings()
        // 应用深色模式增强
        ThemeManager.shared.updateEnhancedDarkMode(enhanced)
    }
    
    // 保存设置
    private func saveSettings() {
        let preferences = UserPreferences(
            themeMode: themeMode,
            colorScheme: colorScheme,
            followSystem: followSystem,
            enhancedDarkMode: enhancedDarkMode
            // 其他设置...
        )
        
        settingsService.updateUserPreferences(preferences) {
            [weak self] result in
            if case .failure(let error) = result {
                DispatchQueue.main.async {
                    self?.error = error
                }
            }
        }
    }
}
```

### 6. 设置项组件库

```swift
// 开关设置项组件
struct ToggleSettingItemView: View {
    let title: String
    let subtitle: String
    @Binding var isOn: Bool
    let onToggle: (Bool) -> Void
    
    var body: some View {
        VStack(spacing: 4) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.body)
                        .foregroundColor(.appTextPrimary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.appTextSecondary)
                }
                
                Spacer()
                
                Toggle(isOn: $isOn) {
                    EmptyView()
                }
                .toggleStyle(SwitchToggleStyle(tint: .appPrimary))
                .onChange(of: isOn) {
                    onToggle($0)
                }
            }
            .padding(16)
            .background(.appBackground)
        }
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
    }
}

// 滑块设置项组件
struct SliderSettingItemView: View {
    let title: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let step: Double
    let onValueChange: (Double) -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text(title)
                    .font(.body)
                    .foregroundColor(.appTextPrimary)
                Spacer()
                Text(String(format: "%.1f", value))
                    .font(.caption)
                    .foregroundColor(.appTextSecondary)
            }
            
            Slider(
                value: $value,
                in: range,
                step: step
            )
            .accentColor(.appPrimary)
            .onChange(of: value) {
                onValueChange($0)
            }
        }
        .padding(16)
        .background(.appBackground)
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
    }
}

// 颜色方案预览组件
struct ColorSchemePreviewView: View {
    let colorScheme: ColorScheme
    let onSelect: (ColorScheme) -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            Text("颜色方案")
                .font(.headline)
                .foregroundColor(.appTextPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            HStack(spacing: 12) {
                ForEach(ColorScheme.allCases, id: \.self) {
                    scheme in
                    ColorSchemeOptionView(
                        scheme: scheme,
                        isSelected: colorScheme == scheme,
                        onSelect: { onSelect(scheme) }
                    )
                }
            }
        }
        .padding(16)
        .background(.appBackground)
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 2)
    }
}

// 颜色方案选项组件
struct ColorSchemeOptionView: View {
    let scheme: ColorScheme
    let isSelected: Bool
    let onSelect: () -> Void
    
    var body: some View {
        Button(action: onSelect) {
            VStack(spacing: 8) {
                // 颜色预览
                ZStack {
                    // 背景
                    Rectangle()
                        .fill(scheme.primaryColor)
                        .cornerRadius(8)
                        .frame(width: 80, height: 80)
                    
                    // 前景元素
                    VStack(spacing: 4) {
                        Circle()
                            .fill(scheme.secondaryColor)
                            .frame(width: 20, height: 20)
                        
                        Rectangle()
                            .fill(scheme.accentColor)
                            .frame(width: 40, height: 8)
                            .cornerRadius(4)
                    }
                }
                
                // 标签
                Text(scheme.displayName)
                    .font(.caption)
                    .foregroundColor(isSelected ? .appPrimary : .appTextPrimary)
            }
            .padding(8)
            .background(isSelected ? .appPrimary.opacity(0.1) : .appBackgroundSecondary)
            .cornerRadius(8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
```

## 测试与验证

1. **单元测试**：
   - 测试设置项组件的正确性
   - 测试ViewModel的状态管理
   - 测试主题和颜色方案的应用

2. **UI测试**：
   - 测试设置页面的布局和导航
   - 测试主题模式的切换
   - 测试语音设置的开关和配置
   - 测试通知设置的开关和配置

3. **集成测试**：
   - 测试从API获取设置到应用的完整流程
   - 测试设置更新后的持久化
   - 测试主题变化对整个应用的影响

## 性能优化

1. **设置缓存**：
   - 实现设置的本地缓存，减少API调用
   - 定期更新缓存，确保设置的最新性

2. **主题应用优化**：
   - 实现主题的懒加载
   - 优化主题切换的动画效果

3. **组件复用**：
   - 创建可复用的设置项组件库
   - 减少代码重复，提高维护性

## 总结

第22天的开发实现了个性化设置页面，包括：

1. 创建了完整的设置页面UI，包括主题设置、语音设置、通知设置和分析偏好设置
2. 实现了丰富的设置项组件，包括开关、选项组、滑块等
3. 实现了主题模式和颜色方案的切换和预览
4. 构建了完整的ViewModel和服务层
5. 创建了可复用的设置项组件库

这些实现为用户提供了一个直观、易用的个性化设置界面，允许用户根据自己的偏好定制应用的外观、语音和通知等设置。明天将继续实现个性化设置的功能逻辑。