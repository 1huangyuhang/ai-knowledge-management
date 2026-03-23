import Foundation
import Combine

class PersonalizationSettingsViewModel: ObservableObject {
    // 主题设置
    @Published var isDarkMode: Bool = false
    @Published var themeColor: ThemeColor = .blue
    
    // 语音设置
    @Published var voiceType: VoiceType = .neutral
    @Published var speechRate: Float = 1.0
    @Published var pitchMultiplier: Float = 1.0
    
    // 通知设置
    @Published var isPushNotificationsEnabled: Bool = true
    @Published var isEmailNotificationsEnabled: Bool = false
    
    // AI设置
    @Published var isAISuggestionsEnabled: Bool = true
    @Published var isAIInsightsEnabled: Bool = true
    @Published var aiModel: AIModel = .gpt35
    
    // 隐私设置
    @Published var isDataCollectionEnabled: Bool = true
    @Published var isAnonymousModeEnabled: Bool = false
    
    // 状态管理
    @Published var alertItem: AlertItem?
    @Published var isLoading: Bool = false
    @Published var hasChanges: Bool = false
    
    // 私有属性
    private let userDefaults: UserDefaults
    private var cancellables = Set<AnyCancellable>()
    private var originalSettings: [String: Any] = [:]
    
    // 默认设置值
    private let defaultSettings: [String: Any] = [
        "isDarkMode": false,
        "themeColor": "blue",
        "voiceType": "neutral",
        "speechRate": 1.0,
        "pitchMultiplier": 1.0,
        "isPushNotificationsEnabled": true,
        "isEmailNotificationsEnabled": false,
        "isAISuggestionsEnabled": true,
        "isAIInsightsEnabled": true,
        "aiModel": "gpt35",
        "isDataCollectionEnabled": true,
        "isAnonymousModeEnabled": false
    ]
    
    // 初始化
    init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults
        loadSettings()
        setupChangeDetection()
    }
    
    // 设置变化检测
    private func setupChangeDetection() {
        // 监听所有设置属性的变化
        $isDarkMode
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $themeColor
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $voiceType
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $speechRate
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $pitchMultiplier
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $isPushNotificationsEnabled
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $isEmailNotificationsEnabled
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $isAISuggestionsEnabled
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $isAIInsightsEnabled
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $aiModel
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $isDataCollectionEnabled
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
        
        $isAnonymousModeEnabled
            .sink { [weak self] _ in self?.checkForChanges() }
            .store(in: &cancellables)
    }
    
    // 检查设置是否有变化
    private func checkForChanges() {
        let currentSettings = getCurrentSettings()
        hasChanges = !settingsAreEqual(currentSettings, originalSettings)
    }
    
    // 比较两个设置字典是否相等
    private func settingsAreEqual(_ settings1: [String: Any], _ settings2: [String: Any]) -> Bool {
        guard settings1.count == settings2.count else { return false }
        
        for (key, value1) in settings1 {
            guard let value2 = settings2[key] else { return false }
            
            // 特殊处理不同类型的比较
            if let double1 = value1 as? Double, let float2 = value2 as? Float {
                if double1 != Double(float2) { return false }
            } else if let float1 = value1 as? Float, let double2 = value2 as? Double {
                if Double(float1) != double2 { return false }
            } else {
                // 对于其他类型，尝试直接比较
                if "\(value1)" != "\(value2)" { return false }
            }
        }
        
        return true
    }
    
    // 获取当前设置
    private func getCurrentSettings() -> [String: Any] {
        return [
            "isDarkMode": isDarkMode,
            "themeColor": themeColor.rawValue,
            "voiceType": voiceType.rawValue,
            "speechRate": speechRate,
            "pitchMultiplier": pitchMultiplier,
            "isPushNotificationsEnabled": isPushNotificationsEnabled,
            "isEmailNotificationsEnabled": isEmailNotificationsEnabled,
            "isAISuggestionsEnabled": isAISuggestionsEnabled,
            "isAIInsightsEnabled": isAIInsightsEnabled,
            "aiModel": aiModel.rawValue,
            "isDataCollectionEnabled": isDataCollectionEnabled,
            "isAnonymousModeEnabled": isAnonymousModeEnabled
        ]
    }
    
    // 保存设置
    func saveSettings() {
        // 验证设置
        guard validateSettings() else {
            return
        }
        
        isLoading = true
        
        // 保存到UserDefaults
        saveSettingsToUserDefaults()
        
        // 发送API请求保存设置
        saveSettingsToAPI()
    }
    
    // 验证设置
    private func validateSettings() -> Bool {
        // 验证语音速率范围
        guard speechRate >= 0.5 && speechRate <= 2.0 else {
            alertItem = AlertItem(title: "验证失败", message: "语速必须在0.5到2.0之间")
            return false
        }
        
        // 验证音调范围
        guard pitchMultiplier >= 0.5 && pitchMultiplier <= 2.0 else {
            alertItem = AlertItem(title: "验证失败", message: "音调必须在0.5到2.0之间")
            return false
        }
        
        // 如果启用匿名模式，则必须禁用数据收集
        if isAnonymousModeEnabled && isDataCollectionEnabled {
            alertItem = AlertItem(title: "验证失败", message: "启用匿名模式时必须禁用数据收集")
            return false
        }
        
        return true
    }
    
    // 重置为默认值
    func resetToDefaults() {
        // 重置所有设置为默认值
        isDarkMode = defaultSettings["isDarkMode"] as? Bool ?? false
        themeColor = ThemeColor(rawValue: defaultSettings["themeColor"] as? String ?? "blue") ?? .blue
        voiceType = VoiceType(rawValue: defaultSettings["voiceType"] as? String ?? "neutral") ?? .neutral
        speechRate = defaultSettings["speechRate"] as? Float ?? 1.0
        pitchMultiplier = defaultSettings["pitchMultiplier"] as? Float ?? 1.0
        isPushNotificationsEnabled = defaultSettings["isPushNotificationsEnabled"] as? Bool ?? true
        isEmailNotificationsEnabled = defaultSettings["isEmailNotificationsEnabled"] as? Bool ?? false
        isAISuggestionsEnabled = defaultSettings["isAISuggestionsEnabled"] as? Bool ?? true
        isAIInsightsEnabled = defaultSettings["isAIInsightsEnabled"] as? Bool ?? true
        aiModel = AIModel(rawValue: defaultSettings["aiModel"] as? String ?? "gpt35") ?? .gpt35
        isDataCollectionEnabled = defaultSettings["isDataCollectionEnabled"] as? Bool ?? true
        isAnonymousModeEnabled = defaultSettings["isAnonymousModeEnabled"] as? Bool ?? false
        
        // 保存默认值
        saveSettings()
    }
    
    // 从UserDefaults加载设置
    private func loadSettings() {
        isDarkMode = userDefaults.bool(forKey: "isDarkMode")
        themeColor = ThemeColor(rawValue: userDefaults.string(forKey: "themeColor") ?? "blue") ?? .blue
        voiceType = VoiceType(rawValue: userDefaults.string(forKey: "voiceType") ?? "neutral") ?? .neutral
        speechRate = userDefaults.float(forKey: "speechRate") != 0 ? userDefaults.float(forKey: "speechRate") : 1.0
        pitchMultiplier = userDefaults.float(forKey: "pitchMultiplier") != 0 ? userDefaults.float(forKey: "pitchMultiplier") : 1.0
        isPushNotificationsEnabled = userDefaults.bool(forKey: "isPushNotificationsEnabled")
        isEmailNotificationsEnabled = userDefaults.bool(forKey: "isEmailNotificationsEnabled")
        isAISuggestionsEnabled = userDefaults.bool(forKey: "isAISuggestionsEnabled")
        isAIInsightsEnabled = userDefaults.bool(forKey: "isAIInsightsEnabled")
        aiModel = AIModel(rawValue: userDefaults.string(forKey: "aiModel") ?? "gpt35") ?? .gpt35
        isDataCollectionEnabled = userDefaults.bool(forKey: "isDataCollectionEnabled")
        isAnonymousModeEnabled = userDefaults.bool(forKey: "isAnonymousModeEnabled")
        
        // 保存原始设置用于检测变化
        originalSettings = getCurrentSettings()
    }
    
    // 保存设置到UserDefaults
    private func saveSettingsToUserDefaults() {
        userDefaults.set(isDarkMode, forKey: "isDarkMode")
        userDefaults.set(themeColor.rawValue, forKey: "themeColor")
        userDefaults.set(voiceType.rawValue, forKey: "voiceType")
        userDefaults.set(speechRate, forKey: "speechRate")
        userDefaults.set(pitchMultiplier, forKey: "pitchMultiplier")
        userDefaults.set(isPushNotificationsEnabled, forKey: "isPushNotificationsEnabled")
        userDefaults.set(isEmailNotificationsEnabled, forKey: "isEmailNotificationsEnabled")
        userDefaults.set(isAISuggestionsEnabled, forKey: "isAISuggestionsEnabled")
        userDefaults.set(isAIInsightsEnabled, forKey: "isAIInsightsEnabled")
        userDefaults.set(aiModel.rawValue, forKey: "aiModel")
        userDefaults.set(isDataCollectionEnabled, forKey: "isDataCollectionEnabled")
        userDefaults.set(isAnonymousModeEnabled, forKey: "isAnonymousModeEnabled")
        
        // 更新原始设置
        originalSettings = getCurrentSettings()
    }
    
    // 保存设置到API
    private func saveSettingsToAPI() {
        // 创建API请求模型
        let request = SettingsRequest(
            isDarkMode: isDarkMode,
            themeColor: themeColor.rawValue,
            voiceType: voiceType.rawValue,
            speechRate: speechRate,
            pitchMultiplier: pitchMultiplier,
            isPushNotificationsEnabled: isPushNotificationsEnabled,
            isEmailNotificationsEnabled: isEmailNotificationsEnabled,
            isAISuggestionsEnabled: isAISuggestionsEnabled,
            isAIInsightsEnabled: isAIInsightsEnabled,
            aiModel: aiModel.rawValue,
            isDataCollectionEnabled: isDataCollectionEnabled,
            isAnonymousModeEnabled: isAnonymousModeEnabled
        )
        
        // 发送API请求
        let publisher: AnyPublisher<EmptyResponse, APIError> = APIClient.shared.put(Endpoint.updateSettings, body: request, headers: nil)
        Task {
            do {
                _ = try await publisher.asyncResult().get()
                self.isLoading = false
                self.alertItem = AlertItem(title: "成功", message: "设置已成功保存")
                self.hasChanges = false
            } catch {
                self.isLoading = false
                self.handleAPIError(error)
            }
        }
    }
    
    // 处理API错误
    private func handleAPIError(_ error: Error) {
        var errorMessage: String
        
        switch error {
        case let apiError as APIError:
            switch apiError {
            case .networkError(let underlyingError):
                errorMessage = "网络错误：\(underlyingError.localizedDescription)"
            case .serverError(let statusCode, let message):
                errorMessage = "服务器错误 (\(statusCode))：\(message ?? "请稍后重试")"
            case .decodingError:
                errorMessage = "数据解析错误：请更新应用"
            case .authenticationError(let message):
                errorMessage = "认证失败：\(message ?? "请重新登录")"
            default:
                errorMessage = "API错误：\(apiError.localizedDescription)"
            }
        default:
            errorMessage = "未知错误：\(error.localizedDescription)"
        }
        
        alertItem = AlertItem(title: "保存失败", message: errorMessage)
    }
    
    // 切换主题
    func toggleTheme() {
        isDarkMode.toggle()
        // 这里可以添加实际的主题切换逻辑
    }
}

// 警报项
struct AlertItem: Identifiable {
    let id = UUID()
    let title: String
    let message: String
    let action: (() -> Void)?
    
    init(title: String, message: String, action: (() -> Void)? = nil) {
        self.title = title
        self.message = message
        self.action = action
    }
}