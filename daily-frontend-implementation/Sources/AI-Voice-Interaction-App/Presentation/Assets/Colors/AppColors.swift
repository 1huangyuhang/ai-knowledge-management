import SwiftUI

/// 应用程序自定义颜色扩展
public extension Color {
    // 主色调
    static let appPrimary = Color(red: 0.298, green: 0.565, blue: 0.886) // #4A90E2
    
    // 辅助色
    static let appSecondary = Color(red: 0.314, green: 0.890, blue: 0.761) // #50E3C2
    
    // 强调色
    static let appAccent = Color(red: 0.922, green: 0.388, blue: 0.388) // #EB6363
    
    // 成功色
    static let appSuccess = Color(red: 0.345, green: 0.784, blue: 0.271) // #58C641
    
    // 背景色
    static let appBackground = Color(red: 0.973, green: 0.973, blue: 0.973) // #F8F8F8
    
    // 文本颜色
    static let appTextPrimary = Color(red: 0.102, green: 0.102, blue: 0.102) // #1A1A1A
    static let appTextSecondary = Color(red: 0.455, green: 0.455, blue: 0.455) // #747474
    static let appTextTertiary = Color(red: 0.659, green: 0.659, blue: 0.659) // #A8A8A8
    
    // 边框颜色
    static let appBorder = Color(red: 0.827, green: 0.827, blue: 0.827) // #D3D3D3
    
    // 卡片背景色
    static let appCardBackground = Color(red: 1.0, green: 1.0, blue: 1.0) // #FFFFFF
    
    // 阴影颜色
    static let appShadow = Color(red: 0.0, green: 0.0, blue: 0.0, opacity: 0.1) // 半透明黑色
}

/// 应用程序自定义形状样式扩展（用于支持ShapeStyle类型使用自定义颜色）
public extension ShapeStyle where Self == Color {
    // 背景色
    static var appBackground: Color {
        Color.appBackground
    }
    
    // 主色调
    static var appPrimary: Color {
        Color.appPrimary
    }
}

/// 颜色扩展，支持十六进制颜色
public extension Color {
    /// 使用十六进制字符串初始化颜色
    /// - Parameter hex: 十六进制颜色字符串，支持3位、6位或8位格式
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
