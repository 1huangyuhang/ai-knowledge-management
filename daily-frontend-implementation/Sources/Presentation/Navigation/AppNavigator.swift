import SwiftUI

/// 应用导航状态枚举
enum AppScreen {
    case splash
    case login
    case register
    case main
    case cognitiveModels
    case cognitiveModelDetail(id: String)
    case cognitiveModelCreate
    case cognitiveModelEdit(id: String)
    case cognitiveModelVisualization(id: String)
    case aiConversation
    case aiTasks
    case aiTaskDetail(id: String)
    case multiDimensionalAnalysis(modelId: String)
    case speechRecognition
    case textToSpeech
    case settings
    case personalizationSettings
}

/// 应用导航器，管理应用的导航状态
class AppNavigator: ObservableObject {
    // 导航路径
    @Published var path = NavigationPath()
    
    // 当前屏幕
    @Published var currentScreen: AppScreen = .login
    
    // 是否需要显示登录屏幕
    @Published var isAuthenticated: Bool = false
    
    // 初始化
    init() {
        // 检查认证状态
        checkAuthStatus()
        
        // 监听认证状态变化
        NotificationCenter.default.publisher(for: .userLoggedIn)
            .sink {[weak self] _ in
                self?.isAuthenticated = true
                self?.navigate(to: .main)
            }
            .store(in: &cancellables)
        
        NotificationCenter.default.publisher(for: .userLoggedOut)
            .sink {[weak self] _ in
                self?.isAuthenticated = false
                self?.resetNavigation()
                self?.navigate(to: .login)
            }
            .store(in: &cancellables)
    }
    
    // 检查认证状态
    func checkAuthStatus() {
        isAuthenticated = KeychainService.shared.accessToken != nil
        if isAuthenticated {
            currentScreen = .main
        } else {
            currentScreen = .login
        }
    }
    
    // 导航到指定屏幕
    func navigate(to screen: AppScreen) {
        currentScreen = screen
        path.append(screen)
    }
    
    // 弹出到上一个屏幕
    func pop() {
        if !path.isEmpty {
            path.removeLast()
        }
    }
    
    // 弹出到根屏幕
    func popToRoot() {
        path.removeLast(path.count)
    }
    
    // 重置导航
    func resetNavigation() {
        path.removeLast(path.count)
        checkAuthStatus()
    }
    
    // 根据屏幕获取对应的视图
    @ViewBuilder
    func getView(for screen: AppScreen) -> some View {
        switch screen {
        case .splash:
            Text("Splash Screen")
        case .login:
            LoginView(viewModel: LoginViewModel())
        case .register:
            RegisterView(viewModel: RegisterViewModel())
        case .main:
            MainTabView(navigator: self)
        case .cognitiveModels:
            Text("Cognitive Models")
        case .cognitiveModelDetail(let id):
            Text("Cognitive Model Detail: \(id)")
        case .cognitiveModelCreate:
            Text("Create Cognitive Model")
        case .cognitiveModelEdit(let id):
            Text("Edit Cognitive Model: \(id)")
        case .cognitiveModelVisualization(let id):
            Text("Visualize Cognitive Model: \(id)")
        case .aiConversation:
            Text("AI Conversation")
        case .aiTasks:
            Text("AI Tasks")
        case .aiTaskDetail(let id):
            Text("AI Task Detail: \(id)")
        case .multiDimensionalAnalysis(let modelId):
            Text("Multi-dimensional Analysis: \(modelId)")
        case .speechRecognition:
            Text("Speech Recognition")
        case .textToSpeech:
            Text("Text to Speech")
        case .settings:
            Text("Settings")
        case .personalizationSettings:
            Text("Personalization Settings")
        }
    }
    
    // 取消令牌，用于取消Combine订阅
    private var cancellables = Set<AnyCancellable>()
}

/// 应用导航视图，作为应用的根视图
struct AppNavigationView: View {
    // 导航器
    @StateObject var navigator = AppNavigator()
    
    var body: some View {
        NavigationStack(path: $navigator.path) {
            if navigator.isAuthenticated {
                navigator.getView(for: .main)
            } else {
                navigator.getView(for: .login)
            }
        }
        .environmentObject(navigator)
    }
}