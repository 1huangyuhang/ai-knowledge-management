import SwiftUI

public struct AITasksView: View {
    /// 导航器
    @EnvironmentObject private var navigator: AppNavigator
    
    public var body: some View {
        NavigationStack {
            VStack {
                Text("AI任务列表")
                    .navigationTitle("AI任务")
                    .toolbar {
                        // 添加AI对话按钮
                        ToolbarItem(placement: .navigationBarTrailing) {
                            Button(action: {
                                navigator.navigate(to: .aiConversation)
                            }) {
                                Image(systemName: "message.fill")
                                    .foregroundColor(.blue)
                                    .font(.title2)
                            }
                        }
                    }
            }
        }
    }
}