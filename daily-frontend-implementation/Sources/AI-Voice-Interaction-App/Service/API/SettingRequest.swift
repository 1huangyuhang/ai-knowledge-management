import Foundation

/// 设置请求模型
struct SettingsRequest: Encodable {
    // 主题设置
    let isDarkMode: Bool
    let themeColor: String
    
    // 语音设置
    let voiceType: String
    let speechRate: Float
    let pitchMultiplier: Float
    
    // 通知设置
    let isPushNotificationsEnabled: Bool
    let isEmailNotificationsEnabled: Bool
    
    // AI设置
    let isAISuggestionsEnabled: Bool
    let isAIInsightsEnabled: Bool
    let aiModel: String
    
    // 隐私设置
    let isDataCollectionEnabled: Bool
    let isAnonymousModeEnabled: Bool
}
