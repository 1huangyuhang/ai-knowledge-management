import SwiftUI

public struct TypingIndicatorView: View {
    private let animationDuration = 1.5
    private let delayOffset = 0.2
    
    // 使用Timer来驱动动画
    @State private var animate = false
    
    public var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<3) { index in
                Circle()
                    .frame(width: 8, height: 8)
                    .foregroundColor(.gray)
                    .opacity(0.6)
                    .scaleEffect(animate ? 0.3 : 1.0)
                    .animation(
                        Animation.easeInOut(duration: animationDuration)
                            .repeatForever(autoreverses: true)
                            .delay(Double(index) * delayOffset),
                        value: animate
                    )
            }
        }
        .padding(12)
        .background(Color.gray.opacity(0.2))
        .cornerRadius(18)
        .onAppear {
            animate.toggle()
        }
    }
}