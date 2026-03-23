import SwiftUI

/// 应用导航器
class AppNavigator: ObservableObject {
    /// 导航栈
    @Published var path = NavigationPath()
    
    /// 共享实例
    static let shared = AppNavigator()
    
    /// 初始化器
    init() {}
    
    /// 导航到指定目的地
    /// - Parameter destination: 目的地枚举
    func navigate(to destination: Destination) {
        path.append(destination)
    }
    
    /// 导航到认知模型详情
    /// - Parameter modelId: 认知模型ID
    func navigateToCognitiveModelDetail(modelId: UUID) {
        navigate(to: .cognitiveModelDetail(modelId: modelId))
    }
    
    /// 导航到思想片段详情
    /// - Parameter thoughtId: 思想片段ID
    func navigateToThoughtDetail(thoughtId: UUID) {
        navigate(to: .thoughtDetail(thoughtId: thoughtId))
    }
    
    /// 导航到AI任务详情
    /// - Parameter taskId: AI任务ID
    func navigateToAITaskDetail(taskId: UUID) {
        navigate(to: .aiTaskDetail(taskId: taskId))
    }
    
    /// 弹出到上一个页面
    func pop() {
        if !path.isEmpty {
            path.removeLast()
        }
    }
    
    /// 弹出到根页面
    func popToRoot() {
        path.removeLast(path.count)
    }
}

/// 导航目的地枚举
enum Destination: Hashable {
    case login
    case register
    case home
    case cognitiveModels
    case cognitiveModelDetail(modelId: UUID)
    case cognitiveModelCreate
    case cognitiveModelEdit(modelId: UUID)
    case thoughts
    case thoughtDetail(thoughtId: UUID)
    case thoughtCreate
    case aiTasks
    case aiTaskDetail(taskId: UUID)
    case aiTaskCreate
    case aiConversation
    case insights
    case settings
    case profile
    case speechRecognition
}
