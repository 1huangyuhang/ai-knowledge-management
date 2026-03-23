# Day 23: 个性化设置功能实现 - 技术实现文档

## 核心任务概述

实现个性化设置功能，包括个性化设置ViewModel、API服务、本地缓存以及设置的实时生效。

## 技术实现细节

### 1. 个性化设置ViewModel增强

```swift
class PersonalizationSettingsViewModel: ObservableObject {
    // 分析偏好设置
    @Published var thinkingTypeAnalysisEnabled: Bool = true
    @Published var cognitiveStructureAnalysisEnabled: Bool = true
    @Published var analysisFrequency: AnalysisFrequency = .daily
    
    // 高级设置
    @Published var dataCollectionEnabled: Bool = true
    @Published var analyticsEnabled: Bool = true
    @Published var crashReportingEnabled: Bool = true
    
    // 服务
    private let settingsService: SettingsService
    private let analyticsService: AnalyticsService
    
    init(
        settingsService: SettingsService = AppContainer.shared.resolve(SettingsService.self)!,
        analyticsService: AnalyticsService = AppContainer.shared.resolve(AnalyticsService.self)!
    ) {
        self.settingsService = settingsService
        self.analyticsService = analyticsService
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
        // 主题设置
        themeMode = preferences.themeMode
        colorScheme = preferences.colorScheme
        followSystem = preferences.followSystem
        enhancedDarkMode = preferences.enhancedDarkMode
        
        // 语音设置
        speechRecognitionEnabled = preferences.speechRecognitionEnabled
        textToSpeechEnabled = preferences.textToSpeechEnabled
        
        // 通知设置
        pushNotificationsEnabled = preferences.pushNotificationsEnabled
        
        // 分析偏好设置
        thinkingTypeAnalysisEnabled = preferences.thinkingTypeAnalysisEnabled
        cognitiveStructureAnalysisEnabled = preferences.cognitiveStructureAnalysisEnabled
        analysisFrequency = preferences.analysisFrequency
        
        // 高级设置
        dataCollectionEnabled = preferences.dataCollectionEnabled
        analyticsEnabled = preferences.analyticsEnabled
        crashReportingEnabled = preferences.crashReportingEnabled
        
        // 应用设置到系统
        applySettingsToSystem(preferences)
    }
    
    // 应用设置到系统
    private func applySettingsToSystem(_ preferences: UserPreferences) {
        // 应用主题设置
        ThemeManager.shared.applyTheme(preferences.themeMode)
        ThemeManager.shared.applyColorScheme(preferences.colorScheme)
        ThemeManager.shared.updateFollowSystem(preferences.followSystem)
        ThemeManager.shared.updateEnhancedDarkMode(preferences.enhancedDarkMode)
        
        // 应用语音设置
        SpeechManager.shared.updateSpeechRecognitionEnabled(preferences.speechRecognitionEnabled)
        SpeechManager.shared.updateTextToSpeechEnabled(preferences.textToSpeechEnabled)
        
        // 应用通知设置
        NotificationManager.shared.updatePushNotificationsEnabled(preferences.pushNotificationsEnabled)
        
        // 应用分析设置
        AnalyticsManager.shared.updateAnalyticsEnabled(preferences.analyticsEnabled)
        AnalyticsManager.shared.updateCrashReportingEnabled(preferences.crashReportingEnabled)
        
        // 应用数据收集设置
        DataCollectionManager.shared.updateDataCollectionEnabled(preferences.dataCollectionEnabled)
    }
    
    // 更新分析偏好设置
    func updateThinkingTypeAnalysisEnabled(_ enabled: Bool) {
        thinkingTypeAnalysisEnabled = enabled
        saveSettings {
            [weak self] in
            self?.analyticsService.trackEvent(.settingChanged, properties: [
                "setting_name": "thinkingTypeAnalysis",
                "setting_value": enabled
            ])
        }
    }
    
    func updateCognitiveStructureAnalysisEnabled(_ enabled: Bool) {
        cognitiveStructureAnalysisEnabled = enabled
        saveSettings {
            [weak self] in
            self?.analyticsService.trackEvent(.settingChanged, properties: [
                "setting_name": "cognitiveStructureAnalysis",
                "setting_value": enabled
            ])
        }
    }
    
    func updateAnalysisFrequency(_ frequency: AnalysisFrequency) {
        analysisFrequency = frequency
        saveSettings {
            [weak self] in
            self?.analyticsService.trackEvent(.settingChanged, properties: [
                "setting_name": "analysisFrequency",
                "setting_value": frequency.rawValue
            ])
        }
    }
    
    // 更新高级设置
    func updateDataCollectionEnabled(_ enabled: Bool) {
        dataCollectionEnabled = enabled
        saveSettings {
            [weak self] in
            self?.analyticsService.trackEvent(.settingChanged, properties: [
                "setting_name": "dataCollection",
                "setting_value": enabled
            ])
            self?.DataCollectionManager.shared.updateDataCollectionEnabled(enabled)
        }
    }
    
    func updateAnalyticsEnabled(_ enabled: Bool) {
        analyticsEnabled = enabled
        saveSettings {
            [weak self] in
            self?.analyticsService.trackEvent(.settingChanged, properties: [
                "setting_name": "analytics",
                "setting_value": enabled
            ])
            self?.analyticsManager.shared.updateAnalyticsEnabled(enabled)
        }
    }
    
    func updateCrashReportingEnabled(_ enabled: Bool) {
        crashReportingEnabled = enabled
        saveSettings {
            [weak self] in
            self?.analyticsService.trackEvent(.settingChanged, properties: [
                "setting_name": "crashReporting",
                "setting_value": enabled
            ])
            self?.analyticsManager.shared.updateCrashReportingEnabled(enabled)
        }
    }
    
    // 保存设置
    private func saveSettings(completion: (() -> Void)? = nil) {
        let preferences = UserPreferences(
            // 主题设置
            themeMode: themeMode,
            colorScheme: colorScheme,
            followSystem: followSystem,
            enhancedDarkMode: enhancedDarkMode,
            
            // 语音设置
            speechRecognitionEnabled: speechRecognitionEnabled,
            textToSpeechEnabled: textToSpeechEnabled,
            
            // 通知设置
            pushNotificationsEnabled: pushNotificationsEnabled,
            
            // 分析偏好设置
            thinkingTypeAnalysisEnabled: thinkingTypeAnalysisEnabled,
            cognitiveStructureAnalysisEnabled: cognitiveStructureAnalysisEnabled,
            analysisFrequency: analysisFrequency,
            
            // 高级设置
            dataCollectionEnabled: dataCollectionEnabled,
            analyticsEnabled: analyticsEnabled,
            crashReportingEnabled: crashReportingEnabled
        )
        
        settingsService.updateUserPreferences(preferences) {
            [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    // 应用设置到系统
                    self?.applySettingsToSystem(preferences)
                    // 调用完成回调
                    completion?()
                case .failure(let error):
                    self?.error = error
                }
            }
        }
    }
}

// 分析频率
enum AnalysisFrequency: String, CaseIterable, Identifiable {
    case daily = "daily"
    case weekly = "weekly"
    case monthly = "monthly"
    case manual = "manual"
    
    var id: Self { self }
    
    var displayName: String {
        switch self {
        case .daily:
            return "每天"
        case .weekly:
            return "每周"
        case .monthly:
            return "每月"
        case .manual:
            return "手动"
        }
    }
}
```

### 2. 分析偏好设置页面

```swift
struct AnalysisPreferencesView: View {
    @StateObject private var viewModel = AnalysisPreferencesViewModel()
    
    var body: some View {
        VStack(spacing: 0) {
            // 顶部导航栏
            SettingsSubTopBarView(title: "分析偏好")
            
            // 主内容
            ScrollView {
                VStack(spacing: 16) {
                    // 分析类型设置
                    VStack(spacing: 12) {
                        ToggleSettingItemView(
                            title: "思维类型分析",
                            subtitle: "开启后将分析您的思维类型",
                            isOn: $viewModel.thinkingTypeAnalysisEnabled,
                            onToggle: { viewModel.updateThinkingTypeAnalysisEnabled($0) }
                        )
                        
                        ToggleSettingItemView(
                            title: "认知结构分析",
                            subtitle: "开启后将分析您的认知结构",
                            isOn: $viewModel.cognitiveStructureAnalysisEnabled,
                            onToggle: { viewModel.updateCognitiveStructureAnalysisEnabled($0) }
                        )
                    }
                    
                    // 分析频率设置
                    SettingsOptionGroupView(
                        title: "分析频率",
                        options: AnalysisFrequency.allCases,
                        selectedOption: $viewModel.analysisFrequency,
                        onSelect: { viewModel.updateAnalysisFrequency($0) }
                    )
                    
                    // 分析结果通知
                    ToggleSettingItemView(
                        title: "分析结果通知",
                        subtitle: "收到新的分析结果时通知您",
                        isOn: $viewModel.analysisNotificationsEnabled,
                        onToggle: { viewModel.updateAnalysisNotificationsEnabled($0) }
                    )
                    
                    // 分析结果分享
                    ToggleSettingItemView(
                        title: "自动分享分析结果",
                        subtitle: "自动分享分析结果到您的设备",
                        isOn: $viewModel.autoShareAnalysisEnabled,
                        onToggle: { viewModel.updateAutoShareAnalysisEnabled($0) }
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
```

### 3. API服务实现

```swift
class SettingsService {
    // 服务
    private let apiClient: APIClient
    private let cacheService: CacheService
    
    init(
        apiClient: APIClient = AppContainer.shared.resolve(APIClient.self)!,
        cacheService: CacheService = AppContainer.shared.resolve(CacheService.self)!
    ) {
        self.apiClient = apiClient
        self.cacheService = cacheService
    }
    
    // 获取用户偏好设置
    func getUserPreferences(completion: @escaping (Result<UserPreferences, Error>) -> Void) {
        // 先从缓存获取
        if let cachedPreferences = cacheService.get(UserPreferences.self, forKey: .userPreferences) {
            completion(.success(cachedPreferences))
        }
        
        // 从API获取最新设置
        apiClient.get(
            endpoint: "/api/v1/users/me/preferences"
        ) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let response):
                    do {
                        let preferences = try JSONDecoder().decode(UserPreferences.self, from: response.data)
                        // 缓存设置
                        self?.cacheService.set(preferences, forKey: .userPreferences)
                        completion(.success(preferences))
                    } catch {
                        completion(.failure(error))
                    }
                case .failure(let error):
                    // 如果API请求失败，但有缓存，不返回错误
                    if self?.cacheService.get(UserPreferences.self, forKey: .userPreferences) != nil {
                        // 已经返回了缓存数据，不再处理
                    } else {
                        completion(.failure(error))
                    }
                }
            }
        }
    }
    
    // 更新用户偏好设置
    func updateUserPreferences(_ preferences: UserPreferences, completion: @escaping (Result<Void, Error>) -> Void) {
        // 发送API请求
        apiClient.put(
            endpoint: "/api/v1/users/me/preferences",
            body: preferences
        ) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(_):
                    // 更新缓存
                    self?.cacheService.set(preferences, forKey: .userPreferences)
                    completion(.success(()))
                case .failure(let error):
                    completion(.failure(error))
                }
            }
        }
    }
    
    // 重置用户偏好设置到默认值
    func resetUserPreferences(completion: @escaping (Result<Void, Error>) -> Void) {
        // 发送API请求
        apiClient.delete(
            endpoint: "/api/user/preferences"
        ) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(_):
                    // 清除缓存
                    self?.cacheService.remove(.userPreferences)
                    // 获取默认设置
                    let defaultPreferences = UserPreferences.default
                    // 应用默认设置
                    self?.cacheService.set(defaultPreferences, forKey: .userPreferences)
                    completion(.success(()))
                case .failure(let error):
                    completion(.failure(error))
                }
            }
        }
    }
}

// 用户偏好设置数据模型
struct UserPreferences: Codable {
    // 主题设置
    let themeMode: ThemeMode
    let colorScheme: ColorScheme
    let followSystem: Bool
    let enhancedDarkMode: Bool
    
    // 语音设置
    let speechRecognitionEnabled: Bool
    let textToSpeechEnabled: Bool
    
    // 通知设置
    let pushNotificationsEnabled: Bool
    
    // 分析偏好设置
    let thinkingTypeAnalysisEnabled: Bool
    let cognitiveStructureAnalysisEnabled: Bool
    let analysisFrequency: AnalysisFrequency
    let analysisNotificationsEnabled: Bool
    let autoShareAnalysisEnabled: Bool
    
    // 高级设置
    let dataCollectionEnabled: Bool
    let analyticsEnabled: Bool
    let crashReportingEnabled: Bool
    
    // 默认值
    static var `default`: UserPreferences {
        return UserPreferences(
            // 主题设置
            themeMode: .auto,
            colorScheme: .default,
            followSystem: true,
            enhancedDarkMode: false,
            
            // 语音设置
            speechRecognitionEnabled: true,
            textToSpeechEnabled: true,
            
            // 通知设置
            pushNotificationsEnabled: true,
            
            // 分析偏好设置
            thinkingTypeAnalysisEnabled: true,
            cognitiveStructureAnalysisEnabled: true,
            analysisFrequency: .daily,
            analysisNotificationsEnabled: true,
            autoShareAnalysisEnabled: false,
            
            // 高级设置
            dataCollectionEnabled: true,
            analyticsEnabled: true,
            crashReportingEnabled: true
        )
    }
}
```

### 4. 本地缓存实现

```swift
class CacheService {
    // 缓存键
    enum CacheKey: String {
        case userPreferences = "user_preferences"
        case cognitiveModels = "cognitive_models"
        case analysisResults = "analysis_results"
        case apiCache = "api_cache"
    }
    
    // 缓存服务
    private let cache: NSCache<NSString, NSData>
    private let fileManager: FileManager
    private let cacheDirectory: URL
    
    init() {
        self.cache = NSCache()
        self.fileManager = FileManager.default
        
        // 获取缓存目录
        let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
        self.cacheDirectory = documentsDirectory.appendingPathComponent("cache")
        
        // 创建缓存目录
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }
    
    // 保存对象到缓存
    func set<T: Codable>(_ object: T, forKey key: CacheKey) {
        do {
            // 保存到内存缓存
            let data = try JSONEncoder().encode(object)
            cache.setObject(data as NSData, forKey: key.rawValue as NSString)
            
            // 保存到磁盘缓存
            let fileURL = cacheDirectory.appendingPathComponent(key.rawValue)
            try data.write(to: fileURL)
        } catch {
            print("缓存保存失败: \(error)")
        }
    }
    
    // 从缓存获取对象
    func get<T: Codable>(_ type: T.Type, forKey key: CacheKey) -> T? {
        // 先从内存缓存获取
        if let data = cache.object(forKey: key.rawValue as NSString) as Data? {
            do {
                return try JSONDecoder().decode(type, from: data)
            } catch {
                print("内存缓存读取失败: \(error)")
            }
        }
        
        // 从磁盘缓存获取
        let fileURL = cacheDirectory.appendingPathComponent(key.rawValue)
        if let data = try? Data(contentsOf: fileURL) {
            do {
                let object = try JSONDecoder().decode(type, from: data)
                // 更新内存缓存
                cache.setObject(data as NSData, forKey: key.rawValue as NSString)
                return object
            } catch {
                print("磁盘缓存读取失败: \(error)")
            }
        }
        
        return nil
    }
    
    // 从缓存移除对象
    func remove(_ key: CacheKey) {
        // 从内存缓存移除
        cache.removeObject(forKey: key.rawValue as NSString)
        
        // 从磁盘缓存移除
        let fileURL = cacheDirectory.appendingPathComponent(key.rawValue)
        try? fileManager.removeItem(at: fileURL)
    }
    
    // 清除所有缓存
    func clear() {
        // 清除内存缓存
        cache.removeAllObjects()
        
        // 清除磁盘缓存
        try? fileManager.removeItem(at: cacheDirectory)
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }
}
```

### 5. 设置的实时生效

#### 5.1 主题管理器

```swift
class ThemeManager {
    // 单例
    static let shared = ThemeManager()
    
    // 当前主题
    var currentTheme: ThemeMode = .auto
    var currentColorScheme: ColorScheme = .default
    var followSystem: Bool = true
    var enhancedDarkMode: Bool = false
    
    // 主题变化通知
    let themeChangedNotification = Notification.Name("ThemeChangedNotification")
    
    private init() {
        // 监听系统主题变化
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(systemThemeChanged),
            name: .init("AppleInterfaceThemeChangedNotification"),
            object: nil
        )
    }
    
    // 应用主题
    func applyTheme(_ theme: ThemeMode) {
        currentTheme = theme
        
        // 应用主题到系统
        applyThemeToSystem(theme)
        
        // 发送主题变化通知
        NotificationCenter.default.post(name: themeChangedNotification, object: nil)
    }
    
    // 应用颜色方案
    func applyColorScheme(_ scheme: ColorScheme) {
        currentColorScheme = scheme
        
        // 应用颜色方案到系统
        applyColorSchemeToSystem(scheme)
        
        // 发送主题变化通知
        NotificationCenter.default.post(name: themeChangedNotification, object: nil)
    }
    
    // 更新跟随系统设置
    func updateFollowSystem(_ follow: Bool) {
        followSystem = follow
        
        if follow {
            // 跟随系统主题
            applySystemTheme()
        } else {
            // 应用当前主题
            applyTheme(currentTheme)
        }
    }
    
    // 应用系统主题
    func applySystemTheme() {
        if followSystem {
            // 获取系统主题
            let isDarkMode = UserInterfaceStyleManager.isDarkMode
            let systemTheme = isDarkMode ? ThemeMode.dark : ThemeMode.light
            applyThemeToSystem(systemTheme)
        }
    }
    
    // 应用主题到系统
    private func applyThemeToSystem(_ theme: ThemeMode) {
        switch theme {
        case .light:
            UserInterfaceStyleManager.setLightMode()
        case .dark:
            UserInterfaceStyleManager.setDarkMode()
        case .auto:
            applySystemTheme()
        }
    }
    
    // 应用颜色方案到系统
    private func applyColorSchemeToSystem(_ scheme: ColorScheme) {
        // 应用颜色方案到全局颜色变量
        ColorManager.shared.applyColorScheme(scheme)
    }
    
    // 系统主题变化回调
    @objc private func systemThemeChanged() {
        applySystemTheme()
    }
}

// 用户界面样式管理器
class UserInterfaceStyleManager {
    // 获取当前是否为深色模式
    static var isDarkMode: Bool {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene else {
            return false
        }
        
        return windowScene.interfaceStyle == .dark
    }
    
    // 设置浅色模式
    static func setLightMode() {
        for window in UIApplication.shared.windows {
            window.overrideUserInterfaceStyle = .light
        }
    }
    
    // 设置深色模式
    static func setDarkMode() {
        for window in UIApplication.shared.windows {
            window.overrideUserInterfaceStyle = .dark
        }
    }
    
    // 设置自动模式
    static func setAutoMode() {
        for window in UIApplication.shared.windows {
            window.overrideUserInterfaceStyle = .unspecified
        }
    }
}

// 颜色管理器
class ColorManager {
    // 单例
    static let shared = ColorManager()
    
    // 当前颜色方案
    var currentColorScheme: ColorScheme = .default
    
    // 应用颜色方案
    func applyColorScheme(_ scheme: ColorScheme) {
        currentColorScheme = scheme
        
        // 更新全局颜色变量
        updateGlobalColorVariables(scheme)
    }
    
    // 更新全局颜色变量
    private func updateGlobalColorVariables(_ scheme: ColorScheme) {
        // 更新应用的颜色资源
        // 这部分需要根据实际的颜色管理方案实现
    }
}
```

#### 5.2 语音管理器

```swift
class SpeechManager {
    // 单例
    static let shared = SpeechManager()
    
    // 语音识别状态
    var speechRecognitionEnabled: Bool = true
    var textToSpeechEnabled: Bool = true
    
    // 语音识别服务
    private let speechRecognitionService: SpeechRecognitionService
    private let textToSpeechService: TextToSpeechService
    
    init(
        speechRecognitionService: SpeechRecognitionService = AppContainer.shared.resolve(SpeechRecognitionService.self)!,
        textToSpeechService: TextToSpeechService = AppContainer.shared.resolve(TextToSpeechService.self)!
    ) {
        self.speechRecognitionService = speechRecognitionService
        self.textToSpeechService = textToSpeechService
    }
    
    // 更新语音识别启用状态
    func updateSpeechRecognitionEnabled(_ enabled: Bool) {
        speechRecognitionEnabled = enabled
        speechRecognitionService.setEnabled(enabled)
    }
    
    // 更新文本转语音启用状态
    func updateTextToSpeechEnabled(_ enabled: Bool) {
        textToSpeechEnabled = enabled
        textToSpeechService.setEnabled(enabled)
    }
}
```

#### 5.3 通知管理器

```swift
class NotificationManager {
    // 单例
    static let shared = NotificationManager()
    
    // 通知状态
    var pushNotificationsEnabled: Bool = true
    
    // 通知中心
    private let notificationCenter = UNUserNotificationCenter.current()
    
    private init() {
        // 请求通知权限
        requestNotificationPermissions()
    }
    
    // 请求通知权限
    func requestNotificationPermissions(completion: @escaping (Bool) -> Void) {
        notificationCenter.requestAuthorization(options: [.alert, .badge, .sound]) {
            granted, error in
            if let error = error {
                print("请求通知权限失败: \(error)")
                completion(false)
            } else {
                completion(granted)
            }
        }
    }
    
    // 更新推送通知启用状态
    func updatePushNotificationsEnabled(_ enabled: Bool) {
        pushNotificationsEnabled = enabled
        
        if enabled {
            // 启用通知
            notificationCenter.setNotificationCategories(getNotificationCategories())
        } else {
            // 禁用通知
            notificationCenter.removeAllPendingNotificationRequests()
        }
    }
    
    // 获取通知分类
    private func getNotificationCategories() -> Set<UNNotificationCategory> {
        // 定义通知分类
        let messageCategory = UNNotificationCategory(
            identifier: "message",
            actions: [],
            intentIdentifiers: [],
            options: []
        )
        
        let reminderCategory = UNNotificationCategory(
            identifier: "reminder",
            actions: [],
            intentIdentifiers: [],
            options: []
        )
        
        let analysisCategory = UNNotificationCategory(
            identifier: "analysis",
            actions: [],
            intentIdentifiers: [],
            options: []
        )
        
        return [messageCategory, reminderCategory, analysisCategory]
    }
}
```

### 6. 分析偏好设置ViewModel

```swift
class AnalysisPreferencesViewModel: ObservableObject {
    // 分析偏好设置
    @Published var thinkingTypeAnalysisEnabled: Bool = true
    @Published var cognitiveStructureAnalysisEnabled: Bool = true
    @Published var analysisFrequency: AnalysisFrequency = .daily
    @Published var analysisNotificationsEnabled: Bool = true
    @Published var autoShareAnalysisEnabled: Bool = false
    
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
                    self?.thinkingTypeAnalysisEnabled = preferences.thinkingTypeAnalysisEnabled
                    self?.cognitiveStructureAnalysisEnabled = preferences.cognitiveStructureAnalysisEnabled
                    self?.analysisFrequency = preferences.analysisFrequency
                    self?.analysisNotificationsEnabled = preferences.analysisNotificationsEnabled
                    self?.autoShareAnalysisEnabled = preferences.autoShareAnalysisEnabled
                case .failure(let error):
                    self?.error = error
                }
            }
        }
    }
    
    // 更新思维类型分析启用状态
    func updateThinkingTypeAnalysisEnabled(_ enabled: Bool) {
        thinkingTypeAnalysisEnabled = enabled
        saveSettings()
    }
    
    // 更新认知结构分析启用状态
    func updateCognitiveStructureAnalysisEnabled(_ enabled: Bool) {
        cognitiveStructureAnalysisEnabled = enabled
        saveSettings()
    }
    
    // 更新分析频率
    func updateAnalysisFrequency(_ frequency: AnalysisFrequency) {
        analysisFrequency = frequency
        saveSettings()
    }
    
    // 更新分析结果通知启用状态
    func updateAnalysisNotificationsEnabled(_ enabled: Bool) {
        analysisNotificationsEnabled = enabled
        saveSettings()
    }
    
    // 更新自动分享分析结果启用状态
    func updateAutoShareAnalysisEnabled(_ enabled: Bool) {
        autoShareAnalysisEnabled = enabled
        saveSettings()
    }
    
    // 保存设置
    private func saveSettings() {
        settingsService.getUserPreferences {
            [weak self] result in
            switch result {
            case .success(var preferences):
                // 更新设置
                preferences.thinkingTypeAnalysisEnabled = self?.thinkingTypeAnalysisEnabled ?? true
                preferences.cognitiveStructureAnalysisEnabled = self?.cognitiveStructureAnalysisEnabled ?? true
                preferences.analysisFrequency = self?.analysisFrequency ?? .daily
                preferences.analysisNotificationsEnabled = self?.analysisNotificationsEnabled ?? true
                preferences.autoShareAnalysisEnabled = self?.autoShareAnalysisEnabled ?? false
                
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
```

## 测试与验证

1. **单元测试**：
   - 测试API服务的正确性
   - 测试本地缓存的读写功能
   - 测试ViewModel的状态管理
   - 测试设置的实时生效

2. **UI测试**：
   - 测试设置页面的交互
   - 测试设置更新后的实时效果
   - 测试主题切换的效果
   - 测试语音设置的开关效果

3. **集成测试**：
   - 测试从API获取设置到应用的完整流程
   - 测试设置更新后的持久化
   - 测试缓存机制的正确性
   - 测试系统主题变化的响应

## 性能优化

1. **缓存优化**：
   - 实现缓存的过期机制
   - 优化缓存的读写性能
   - 实现缓存的大小限制

2. **设置应用优化**：
   - 实现设置的批量应用
   - 优化主题切换的动画效果
   - 减少设置变化时的重新渲染

3. **API调用优化**：
   - 实现API请求的合并
   - 优化API请求的时机
   - 实现API请求的重试机制

## 总结

第23天的开发实现了个性化设置功能，包括：

1. 增强了个性化设置ViewModel，支持更多设置项
2. 实现了完整的API服务，支持获取、更新和重置用户偏好设置
3. 实现了本地缓存机制，提高设置的加载速度
4. 实现了设置的实时生效，包括主题、语音和通知设置
5. 创建了分析偏好设置页面和ViewModel

这些实现使用户能够方便地定制应用的各种设置，并确保设置能够实时生效，提高了应用的个性化程度和用户体验。明天将继续实现个性化设置的优化功能。