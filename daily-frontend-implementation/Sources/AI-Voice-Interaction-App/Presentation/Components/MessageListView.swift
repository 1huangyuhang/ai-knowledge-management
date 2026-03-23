import SwiftUI

struct MessageListView: View {
    @Binding var messages: [Message]
    @State private var scrollViewProxy: ScrollViewProxy?
    @State private var scrollToBottom = false
    
    var body: some View {
        ScrollViewReader {proxy in
            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(messages) { message in
                        MessageBubbleView(message: message)
                            .id(message.id)
                    }
                    // 底部占位符，确保最后一条消息可见
                    Color.clear
                        .frame(height: 80)
                        .id("bottom")
                }
                .padding(.top, 16)
            }
            .onAppear {
                scrollViewProxy = proxy
                scrollToBottom = true
            }
            .onChange(of: messages) {_ in
                scrollToBottom = true
            }
            .onChange(of: scrollToBottom) {newValue in
                if newValue {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        withAnimation {
                            proxy.scrollTo("bottom", anchor: .bottom)
                        }
                        scrollToBottom = false
                    }
                }
            }
        }
    }
}