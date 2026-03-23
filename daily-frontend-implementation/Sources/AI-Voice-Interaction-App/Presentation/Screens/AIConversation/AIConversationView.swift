import SwiftUI

struct AIConversationView: View {
    @ObservedObject var viewModel: AIConversationViewModel
    @State private var messageText: String = ""
    @State private var showingNewConversationAlert = false
    
    init(viewModel: AIConversationViewModel) {
        self.viewModel = viewModel
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // 导航栏
            navigationBar
            
            // 消息列表
            MessageListView(messages: $viewModel.messages)
            
            // 加载状态指示器
            if viewModel.isLoading {
                ProgressView("AI正在思考...")
                    .padding()
                    .background(Color(.systemBackground))
            }
            
            // 消息输入框
            MessageInputView(
                messageText: $messageText,
                onSend: {
                    guard !messageText.isEmpty else { return }
                    viewModel.sendMessage(content: messageText)
                    messageText = ""
                },
                onVoiceInput: {
                    // 语音输入功能，后续集成
                    print("Voice input tapped")
                }
            )
        }
        .background(Color(.systemGroupedBackground))
        .onAppear {
            if viewModel.messages.isEmpty {
                viewModel.loadMessages()
            }
        }
        .alert(isPresented: $showingNewConversationAlert) {
            Alert(
                title: Text("开始新对话"),
                message: Text("当前对话将被保存，是否确定开始新对话？"),
                primaryButton: .default(Text("确定")) {
                    viewModel.createNewConversation()
                },
                secondaryButton: .cancel()
            )
        }
    }
    
    private var navigationBar: some View {
        HStack {
            Text("AI对话")
                .font(.title2)
                .fontWeight(.bold)
            Spacer()
            HStack(spacing: 16) {
                Button(action: {
                    showingNewConversationAlert = true
                }) {
                    Image(systemName: "square.and.pencil")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
                Button(action: {
                    // 更多功能按钮
                    print("More tapped")
                }) {
                    Image(systemName: "ellipsis.circle")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(16)
        .background(Color(.systemBackground))
    }
}