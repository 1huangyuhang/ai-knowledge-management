import SwiftUI

struct MessageBubbleView: View {
    let message: Message
    
    private var isUserMessage: Bool {
        message.type == .user
    }
    
    var body: some View {
        HStack {
            if isUserMessage {
                Spacer()
            }
            
            VStack(alignment: isUserMessage ? .trailing : .leading, spacing: 4) {
                // 消息内容气泡
                bubbleContent
                
                // 消息状态和时间
                bubbleFooter
            }
            .padding(isUserMessage ? .leading : .trailing, 50)
            
            if !isUserMessage {
                Spacer()
            }
        }
        .padding(.vertical, 4)
        .padding(.horizontal, 16)
    }
    
    private var bubbleContent: some View {
        Text(message.content)
            .padding(12)
            .background(isUserMessage ? Color.blue : Color.gray.opacity(0.2))
            .foregroundColor(isUserMessage ? .white : .black)
            .cornerRadius(18)
            .cornerRadius(4, corners: isUserMessage ? [.topLeft] : [.topRight])
    }
    
    private var bubbleFooter: some View {
        HStack(spacing: 4) {
            if !isUserMessage {
                switch message.status {
                case .processing:
                    ProgressView()
                        .scaleEffect(0.7)
                    Text("处理中...")
                        .font(.caption2)
                        .foregroundColor(.gray)
                default:
                    EmptyView()
                }
            }
            
            Text(formatTime(message.timestamp))
                .font(.caption2)
                .foregroundColor(.gray)
            
            if isUserMessage {
                switch message.status {
                case .sending:
                    ProgressView()
                        .scaleEffect(0.7)
                case .sent:
                    Image(systemName: "checkmark")
                        .resizable()
                        .frame(width: 12, height: 12)
                case .failed:
                    Image(systemName: "exclamationmark.circle")
                        .resizable()
                        .frame(width: 12, height: 12)
                        .foregroundColor(.red)
                default:
                    EmptyView()
                }
            }
        }
        .padding(.top, 2)
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// 扩展View以支持自定义圆角
struct CornerRadiusStyle: ViewModifier {
    var radius: CGFloat
    var corners: UIRectCorner
    
    func body(content: Content) -> some View {
        content
            .clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        ModifiedContent(content: self, modifier: CornerRadiusStyle(radius: radius, corners: corners))
    }
}