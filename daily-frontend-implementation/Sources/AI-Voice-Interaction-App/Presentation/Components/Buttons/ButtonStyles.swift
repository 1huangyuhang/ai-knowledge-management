import SwiftUI

/// 主要按钮样式
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Color.appPrimary)
            .foregroundColor(.white)
            .cornerRadius(8)
            .shadow(radius: configuration.isPressed ? 0 : 2)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .transition(.opacity)
            .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}

/// 次要按钮样式
struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Color.white)
            .foregroundColor(Color.appPrimary)
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.appPrimary, lineWidth: 1)
            )
            .shadow(radius: configuration.isPressed ? 0 : 2)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .transition(.opacity)
            .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}

/// 危险按钮样式
struct DangerButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Color.red)
            .foregroundColor(.white)
            .cornerRadius(8)
            .shadow(radius: configuration.isPressed ? 0 : 2)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .transition(.opacity)
            .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}

/// 按钮样式扩展，方便使用
public extension Button {
    /// 使用主要按钮样式
    func primaryStyle() -> some View {
        self.buttonStyle(PrimaryButtonStyle())
    }
    
    /// 使用次要按钮样式
    func secondaryStyle() -> some View {
        self.buttonStyle(SecondaryButtonStyle())
    }
    
    /// 使用危险按钮样式
    func dangerStyle() -> some View {
        self.buttonStyle(DangerButtonStyle())
    }
}
