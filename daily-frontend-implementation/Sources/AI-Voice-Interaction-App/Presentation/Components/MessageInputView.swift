import SwiftUI

struct MessageInputView: View {
    @Binding var messageText: String
    var onSend: () -> Void
    var onVoiceInput: () -> Void
    
    @State private var isExpanded = false
    
    var body: some View {
        VStack(spacing: 8) {
            Divider()
            HStack(spacing: 8) {
                // 语音输入按钮
                Button(action: onVoiceInput) {
                    Image(systemName: "mic.fill")
                        .font(.title2)
                        .foregroundColor(.blue)
                        .frame(width: 48, height: 48)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(24)
                }
                
                // 消息输入框
                TextField("输入消息...", text: $messageText, axis: .vertical)
                    .padding(12)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(20)
                    .lineLimit(1...5)
                    .onChange(of: messageText) {newValue in
                        isExpanded = newValue.contains("\n") || newValue.count > 50
                    }
                
                // 发送按钮
                Button(action: onSend) {
                    Image(systemName: "paperplane.fill")
                        .font(.title2)
                        .foregroundColor(messageText.isEmpty ? .gray : .blue)
                        .frame(width: 48, height: 48)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(24)
                }
                .disabled(messageText.isEmpty)
            }
            .padding(8)
        }
        .background(Color(.systemBackground))
    }
}