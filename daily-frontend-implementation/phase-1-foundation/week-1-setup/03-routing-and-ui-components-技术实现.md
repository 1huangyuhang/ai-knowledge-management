# Day 03: 路由和UI组件 - 代码实现文档

## 模块关联索引

### 所属环节
- **阶段**：第一阶段：基础架构搭建
- **周次**：第1周
- **天数**：第3天
- **开发主题**：路由和UI组件

### 对应核心文档
- [前端架构设计](../../core-docs/architecture-design/frontend-architecture.md)
- [组件设计规范](../../core-docs/architecture-design/component-design.md)
- [状态管理设计](../../core-docs/architecture-design/state-management.md)

### 相关技术实现文档
- [第1天：项目初始化](01-project-initialization-技术实现.md)
- [第2天：API服务和数据模型](02-api-service-and-models-技术实现.md)
- [第4天：登录功能实现](../week-2-auth/04-login-implementation-技术实现.md)

### 关联模块
- [项目初始化](01-project-initialization-技术实现.md)
- [API服务和数据模型](02-api-service-and-models-技术实现.md)
- [登录功能实现](../week-2-auth/04-login-implementation-技术实现.md)

### 依赖关系
- [项目初始化](01-project-initialization-技术实现.md)
- [API服务和数据模型](02-api-service-and-models-技术实现.md)

## 1. 项目概述

### 1.1 今日目标
- 实现路由管理（基于SwiftUI NavigationStack）
- 创建基础UI组件（按钮、输入框、加载指示器等）
- 实现主题管理（颜色、字体等）
- 创建基础布局组件（容器、行、列等）
- 实现基础的状态管理（使用@ObservableObject）

### 1.2 设计理念
- **组件化设计**：将UI拆分为可复用的组件，提高代码复用率和可维护性
- **响应式布局**：适配不同屏幕尺寸，提供良好的跨设备体验
- **主题支持**：实现主题切换，支持浅色和深色模式
- **统一的设计语言**：保持UI组件的风格一致性
- **易用性优先**：组件设计简单易用，降低开发复杂度

## 2. 路由管理实现

### 2.1 路由设计

#### 2.1.1 AppRouter协议
```swift
import SwiftUI

protocol AppRouterProtocol {
    associatedtype Route: Hashable
    var navigationPath: NavigationPath { get set }
    func navigate(to route: Route)
    func navigateBack()
    func navigateToRoot()
}
```

#### 2.1.2 AppRoute枚举
```swift
enum AppRoute: Hashable {
    // 认证相关
    case login
    case register
    
    // 主应用相关
    case home
    case cognitiveModels
    case cognitiveModelDetail(id: String)
    case voiceInteraction
    case aiConversation(modelId: String?)
    case multiDimensionalAnalysis(modelId: String)
    case thinkingTypeAnalysis(modelId: String)
    case analysisHistory(modelId: String)
    case userPreferences
    
    // 路由显示名称
    var displayName: String {
        switch self {
        case .login:
            return "登录"
        case .register:
            return "注册"
        case .home:
            return "主页"
        case .cognitiveModels:
            return "认知模型"
        case .cognitiveModelDetail(let id):
            return "认知模型详情"
        case .voiceInteraction:
            return "语音交互"
        case .aiConversation(let modelId):
            return "AI对话"
        case .multiDimensionalAnalysis(let modelId):
            return "多维度分析"
        case .thinkingTypeAnalysis(let modelId):
            return "思维类型分析"
        case .analysisHistory(let modelId):
            return "分析历史"
        case .userPreferences:
            return "设置"
        }
    }
}
```

#### 2.1.3 AppRouter实现
```swift
class AppRouter: ObservableObject, AppRouterProtocol {
    
    // 单例实例
    static let shared = AppRouter()
    
    // 导航路径
    @Published var navigationPath = NavigationPath()
    
    // 导航到指定路由
    func navigate(to route: AppRoute) {
        navigationPath.append(route)
    }
    
    // 返回上一页
    func navigateBack() {
        if !navigationPath.isEmpty {
            navigationPath.removeLast()
        }
    }
    
    // 返回根页面
    func navigateToRoot() {
        navigationPath.removeLast(navigationPath.count)
    }
    
    // 重置导航路径
    func reset() {
        navigationPath = NavigationPath()
    }
}
```

#### 2.1.4 RouteView协议
```swift
import SwiftUI

protocol RouteView: View {
    associatedtype Router: AppRouterProtocol
    var router: Router { get }
}
```

### 2.2 主应用导航实现

#### 2.2.1 AppNavigationView
```swift
import SwiftUI

struct AppNavigationView: View {
    
    // 路由管理器
    @StateObject private var router = AppRouter.shared
    
    // 认证状态
    @EnvironmentObject private var authViewModel: AuthViewModel
    
    var body: some View {
        NavigationStack(path: $router.navigationPath) {
            // 根据认证状态显示不同的根页面
            if authViewModel.isLoggedIn {
                HomeView()
                    .navigationDestination(for: AppRoute.self) { route in
                        routeDestination(for: route)
                    }
            } else {
                WelcomeView()
                    .navigationDestination(for: AppRoute.self) { route in
                        routeDestination(for: route)
                    }
            }
        }
        .environmentObject(router)
    }
    
    // 路由目标视图
    @ViewBuilder
    private func routeDestination(for route: AppRoute) -> some View {
        switch route {
        case .login:
            LoginView()
        case .register:
            RegisterView()
        case .home:
            HomeView()
        case .cognitiveModels:
            CognitiveModelsView()
        case .cognitiveModelDetail(let id):
            CognitiveModelDetailView(modelId: id)
        case .voiceInteraction:
            VoiceInteractionView()
        case .aiConversation(let modelId):
            AIConversationView(modelId: modelId)
        case .multiDimensionalAnalysis(let modelId):
            MultiDimensionalAnalysisView(modelId: modelId)
        case .thinkingTypeAnalysis(let modelId):
            ThinkingTypeAnalysisView(modelId: modelId)
        case .analysisHistory(let modelId):
            AnalysisHistoryView(modelId: modelId)
        case .userPreferences:
            UserPreferencesView()
        }
    }
}
```

#### 2.2.2 更新App入口
```swift
import SwiftUI

@main
struct AIVoiceInteractionApp: App {
    
    // 认证视图模型
    @StateObject private var authViewModel = AuthViewModel()
    
    var body: some Scene {
        WindowGroup {
            AppNavigationView()
                .environmentObject(authViewModel)
                .environmentObject(AppTheme.shared)
        }
    }
}
```

## 3. 主题管理实现

### 3.1 主题定义

#### 3.1.1 AppTheme协议
```swift
import SwiftUI

protocol AppThemeProtocol {
    var colors: AppColors { get }
    var fonts: AppFonts { get }
    var spacing: AppSpacing { get }
    var borderRadius: AppBorderRadius { get }
    var shadows: AppShadows { get }
    
    func toggleTheme()
    func setTheme(to theme: ColorScheme)
}
```

#### 3.1.2 颜色定义
```swift
struct AppColors {
    // 主色调
    let primary: Color
    let primaryLight: Color
    let primaryDark: Color
    
    // 辅助色
    let secondary: Color
    let secondaryLight: Color
    let secondaryDark: Color
    
    // 功能色
    let success: Color
    let warning: Color
    let error: Color
    let info: Color
    
    // 中性色
    let background: Color
    let surface: Color
    let card: Color
    let textPrimary: Color
    let textSecondary: Color
    let textTertiary: Color
    let border: Color
    let separator: Color
    let overlay: Color
    
    // 状态色
    let disabled: Color
    let placeholder: Color
    let highlight: Color
}
```

#### 3.1.3 字体定义
```swift
struct AppFonts {
    let largeTitle: Font
    let title1: Font
    let title2: Font
    let title3: Font
    let headline: Font
    let body: Font
    let callout: Font
    let subheadline: Font
    let footnote: Font
    let caption1: Font
    let caption2: Font
}
```

#### 3.1.4 间距定义
```swift
struct AppSpacing {
    let xxs: CGFloat // 4pt
    let xs: CGFloat  // 8pt
    let sm: CGFloat  // 12pt
    let md: CGFloat  // 16pt
    let lg: CGFloat  // 24pt
    let xl: CGFloat  // 32pt
    let xxl: CGFloat // 48pt
    let xxxl: CGFloat // 64pt
}
```

#### 3.1.5 圆角定义
```swift
struct AppBorderRadius {
    let sm: CGFloat  // 4pt
    let md: CGFloat  // 8pt
    let lg: CGFloat  // 16pt
    let xl: CGFloat  // 24pt
    let full: CGFloat // 9999pt
}
```

#### 3.1.6 阴影定义
```swift
struct AppShadows {
    let sm: Shadow
    let md: Shadow
    let lg: Shadow
    let xl: Shadow
}
```

### 3.2 主题实现

#### 3.2.1 AppTheme类
```swift
import SwiftUI

class AppTheme: ObservableObject, AppThemeProtocol {
    
    // 单例实例
    static let shared = AppTheme()
    
    // 当前主题模式
    @Published var colorScheme: ColorScheme = .light
    
    // 计算属性：当前主题颜色
    var colors: AppColors {
        switch colorScheme {
        case .light:
            return lightColors
        case .dark:
            return darkColors
        @unknown default:
            return lightColors
        }
    }
    
    // 字体（不受主题影响）
    let fonts: AppFonts = AppFonts(
        largeTitle: .largeTitle,
        title1: .title,
        title2: .title2,
        title3: .title3,
        headline: .headline,
        body: .body,
        callout: .callout,
        subheadline: .subheadline,
        footnote: .footnote,
        caption1: .caption,
        caption2: .caption2
    )
    
    // 间距（不受主题影响）
    let spacing: AppSpacing = AppSpacing(
        xxs: 4,
        xs: 8,
        sm: 12,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        xxxl: 64
    )
    
    // 圆角（不受主题影响）
    let borderRadius: AppBorderRadius = AppBorderRadius(
        sm: 4,
        md: 8,
        lg: 16,
        xl: 24,
        full: 9999
    )
    
    // 阴影（不受主题影响）
    let shadows: AppShadows = AppShadows(
        sm: Shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1),
        md: Shadow(color: .black.opacity(0.15), radius: 4, x: 0, y: 2),
        lg: Shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4),
        xl: Shadow(color: .black.opacity(0.25), radius: 16, x: 0, y: 8)
    )
    
    // 浅色主题颜色
    private let lightColors = AppColors(
        // 主色调
        primary: Color(#colorLiteral(red: 0.2980392157, green: 0.5647058824, blue: 0.8862745098, alpha: 1)), // #4A90E2
        primaryLight: Color(#colorLiteral(red: 0.4509803922, green: 0.6470588235, blue: 0.9450980392, alpha: 1)), // #73A5F2
        primaryDark: Color(#colorLiteral(red: 0.1882352941, green: 0.4352941176, blue: 0.737254902, alpha: 1)), // #3171BC
        
        // 辅助色
        secondary: Color(#colorLiteral(red: 0.3137254902, green: 0.8862745098, blue: 0.768627451, alpha: 1)), // #50E3C2
        secondaryLight: Color(#colorLiteral(red: 0.4862745098, green: 0.9215686275, blue: 0.8392156863, alpha: 1)), // #7DF0D6
        secondaryDark: Color(#colorLiteral(red: 0.1921568627, green: 0.7058823529, blue: 0.6117647059, alpha: 1)), // #31B49C
        
        // 功能色
        success: Color(#colorLiteral(red: 0.3411764706, green: 0.7843137255, blue: 0.4784313725, alpha: 1)), // #57C87F
        warning: Color(#colorLiteral(red: 0.9607843137, green: 0.6509803922, blue: 0.1294117647, alpha: 1)), // #F5A623
        error: Color(#colorLiteral(red: 0.8156862745, green: 0.1215686275, blue: 0.1215686275, alpha: 1)), // #D01E1E
        info: Color(#colorLiteral(red: 0.2980392157, green: 0.5647058824, blue: 0.8862745098, alpha: 1)), // #4A90E2
        
        // 中性色
        background: Color(#colorLiteral(red: 0.9725490196, green: 0.9725490196, blue: 0.9725490196, alpha: 1)), // #F8F8F8
        surface: Color(#colorLiteral(red: 1, green: 1, blue: 1, alpha: 1)), // #FFFFFF
        card: Color(#colorLiteral(red: 1, green: 1, blue: 1, alpha: 1)), // #FFFFFF
        textPrimary: Color(#colorLiteral(red: 0.1215686275, green: 0.1215686275, blue: 0.1215686275, alpha: 1)), // #1F1F1F
        textSecondary: Color(#colorLiteral(red: 0.4549019608, green: 0.4549019608, blue: 0.4549019608, alpha: 1)), // #747474
        textTertiary: Color(#colorLiteral(red: 0.6588235294, green: 0.6588235294, blue: 0.6588235294, alpha: 1)), // #A8A8A8
        border: Color(#colorLiteral(red: 0.8274509804, green: 0.8274509804, blue: 0.8274509804, alpha: 1)), // #D3D3D3
        separator: Color(#colorLiteral(red: 0.8980392157, green: 0.8980392157, blue: 0.8980392157, alpha: 1)), // #E5E5E5
        overlay: Color(#colorLiteral(red: 0, green: 0, blue: 0, alpha: 0.5)), // #000000 50%
        
        // 状态色
        disabled: Color(#colorLiteral(red: 0.8274509804, green: 0.8274509804, blue: 0.8274509804, alpha: 1)), // #D3D3D3
        placeholder: Color(#colorLiteral(red: 0.6588235294, green: 0.6588235294, blue: 0.6588235294, alpha: 1)), // #A8A8A8
        highlight: Color(#colorLiteral(red: 0.2980392157, green: 0.5647058824, blue: 0.8862745098, alpha: 0.1)) // #4A90E2 10%
    )
    
    // 深色主题颜色
    private let darkColors = AppColors(
        // 主色调
        primary: Color(#colorLiteral(red: 0.4509803922, green: 0.6470588235, blue: 0.9450980392, alpha: 1)), // #73A5F2
        primaryLight: Color(#colorLiteral(red: 0.5803921569, green: 0.7450980392, blue: 0.9725490196, alpha: 1)), // #94C4F8
        primaryDark: Color(#colorLiteral(red: 0.3137254902, green: 0.5019607843, blue: 0.8588235294, alpha: 1)), // #5081DB
        
        // 辅助色
        secondary: Color(#colorLiteral(red: 0.4862745098, green: 0.9215686275, blue: 0.8392156863, alpha: 1)), // #7DF0D6
        secondaryLight: Color(#colorLiteral(red: 0.662745098, green: 0.9529411765, blue: 0.8980392157, alpha: 1)), // #A9F6E6
        secondaryDark: Color(#colorLiteral(red: 0.3333333333, green: 0.8117647059, blue: 0.7176470588, alpha: 1)), // #55D0B7
        
        // 功能色
        success: Color(#colorLiteral(red: 0.4549019608, green: 0.8549019608, blue: 0.5803921569, alpha: 1)), // #74D994
        warning: Color(#colorLiteral(red: 0.9764705882, green: 0.7411764706, blue: 0.2352941176, alpha: 1)), // #F9BD3D
        error: Color(#colorLiteral(red: 0.9215686275, green: 0.2352941176, blue: 0.2352941176, alpha: 1)), // #EA3C3C
        info: Color(#colorLiteral(red: 0.4509803922, green: 0.6470588235, blue: 0.9450980392, alpha: 1)), // #73A5F2
        
        // 中性色
        background: Color(#colorLiteral(red: 0.0862745098, green: 0.0862745098, blue: 0.0862745098, alpha: 1)), // #161616
        surface: Color(#colorLiteral(red: 0.1490196078, green: 0.1490196078, blue: 0.1490196078, alpha: 1)), // #262626
        card: Color(#colorLiteral(red: 0.1960784314, green: 0.1960784314, blue: 0.1960784314, alpha: 1)), // #323232
        textPrimary: Color(#colorLiteral(red: 0.9411764706, green: 0.9411764706, blue: 0.9411764706, alpha: 1)), // #F0F0F0
        textSecondary: Color(#colorLiteral(red: 0.6392156863, green: 0.6392156863, blue: 0.6392156863, alpha: 1)), // #A3A3A3
        textTertiary: Color(#colorLiteral(red: 0.4392156863, green: 0.4392156863, blue: 0.4392156863, alpha: 1)), // #707070
        border: Color(#colorLiteral(red: 0.3137254902, green: 0.3137254902, blue: 0.3137254902, alpha: 1)), // #505050
        separator: Color(#colorLiteral(red: 0.2392156863, green: 0.2392156863, blue: 0.2392156863, alpha: 1)), // #3E3E3E
        overlay: Color(#colorLiteral(red: 0, green: 0, blue: 0, alpha: 0.7)), // #000000 70%
        
        // 状态色
        disabled: Color(#colorLiteral(red: 0.3137254902, green: 0.3137254902, blue: 0.3137254902, alpha: 1)), // #505050
        placeholder: Color(#colorLiteral(red: 0.4392156863, green: 0.4392156863, blue: 0.4392156863, alpha: 1)), // #707070
        highlight: Color(#colorLiteral(red: 0.4509803922, green: 0.6470588235, blue: 0.9450980392, alpha: 0.2)) // #73A5F2 20%
    )
    
    // 切换主题
    func toggleTheme() {
        colorScheme = colorScheme == .light ? .dark : .light
    }
    
    // 设置主题
    func setTheme(to theme: ColorScheme) {
        colorScheme = theme
    }
}
```

#### 3.2.2 主题环境键
```swift
environment(colorScheme, AppTheme.shared.colorScheme)
```

## 4. 基础UI组件实现

### 4.1 按钮组件

#### 4.1.1 PrimaryButton
```swift
import SwiftUI

struct PrimaryButton: View {
    let title: String
    let action: () -> Void
    let isLoading: Bool
    let isDisabled: Bool
    let variant: ButtonVariant
    let size: ButtonSize
    
    // 按钮变体
    enum ButtonVariant {
        case primary
        case secondary
        case outline
        case text
        case success
        case warning
        case error
        case info
    }
    
    // 按钮尺寸
    enum ButtonSize {
        case small
        case medium
        case large
    }
    
    // 初始化
    init(
        _ title: String,
        action: @escaping () -> Void,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        variant: ButtonVariant = .primary,
        size: ButtonSize = .medium
    ) {
        self.title = title
        self.action = action
        self.isLoading = isLoading
        self.isDisabled = isDisabled
        self.variant = variant
        self.size = size
    }
    
    // 主题
    @EnvironmentObject private var theme: AppTheme
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: theme.spacing.xs) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(textColor)
                }
                Text(title)
                    .font(font)
                    .fontWeight(.medium)
                    .foregroundColor(textColor)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .padding(padding)
            .frame(maxWidth: .infinity, minHeight: height, alignment: .center)
            .background(backgroundColor)
            .border(borderColor, width: borderWidth)
            .cornerRadius(theme.borderRadius.md)
            .shadow(shadow)
        }
        .disabled(isLoading || isDisabled)
        .buttonStyle(.plain)
    }
    
    // 计算属性：背景色
    private var backgroundColor: Color {
        guard !isDisabled else {
            return theme.colors.disabled
        }
        
        switch variant {
        case .primary:
            return theme.colors.primary
        case .secondary:
            return theme.colors.secondary
        case .outline, .text:
            return .clear
        case .success:
            return theme.colors.success
        case .warning:
            return theme.colors.warning
        case .error:
            return theme.colors.error
        case .info:
            return theme.colors.info
        }
    }
    
    // 计算属性：文本色
    private var textColor: Color {
        guard !isDisabled else {
            return theme.colors.textSecondary
        }
        
        switch variant {
        case .primary, .secondary, .success, .warning, .error, .info:
            return .white
        case .outline:
            return theme.colors.primary
        case .text:
            return theme.colors.primary
        }
    }
    
    // 计算属性：边框色
    private var borderColor: Color {
        guard !isDisabled else {
            return theme.colors.disabled
        }
        
        switch variant {
        case .outline:
            return theme.colors.primary
        default:
            return .clear
        }
    }
    
    // 计算属性：边框宽度
    private var borderWidth: CGFloat {
        switch variant {
        case .outline:
            return 1
        default:
            return 0
        }
    }
    
    // 计算属性：内边距
    private var padding: EdgeInsets {
        switch size {
        case .small:
            return EdgeInsets(top: theme.spacing.xs, leading: theme.spacing.sm, bottom: theme.spacing.xs, trailing: theme.spacing.sm)
        case .medium:
            return EdgeInsets(top: theme.spacing.sm, leading: theme.spacing.md, bottom: theme.spacing.sm, trailing: theme.spacing.md)
        case .large:
            return EdgeInsets(top: theme.spacing.md, leading: theme.spacing.lg, bottom: theme.spacing.md, trailing: theme.spacing.lg)
        }
    }
    
    // 计算属性：高度
    private var height: CGFloat {
        switch size {
        case .small:
            return 32
        case .medium:
            return 44
        case .large:
            return 56
        }
    }
    
    // 计算属性：字体
    private var font: Font {
        switch size {
        case .small:
            return theme.fonts.callout
        case .medium:
            return theme.fonts.body
        case .large:
            return theme.fonts.headline
        }
    }
    
    // 计算属性：阴影
    private var shadow: Shadow {
        guard !isDisabled else {
            return .init()
        }
        
        switch variant {
        case .primary, .secondary, .success, .warning, .error, .info:
            return theme.shadows.sm
        default:
            return .init()
        }
    }
}

// 预览
struct PrimaryButton_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 16) {
            PrimaryButton("Primary Button", action: {})
            PrimaryButton("Secondary Button", action: {}, variant: .secondary)
            PrimaryButton("Outline Button", action: {}, variant: .outline)
            PrimaryButton("Text Button", action: {}, variant: .text)
            PrimaryButton("Success Button", action: {}, variant: .success)
            PrimaryButton("Warning Button", action: {}, variant: .warning)
            PrimaryButton("Error Button", action: {}, variant: .error)
            PrimaryButton("Info Button", action: {}, variant: .info)
            PrimaryButton("Loading Button", action: {}, isLoading: true)
            PrimaryButton("Disabled Button", action: {}, isDisabled: true)
        }
        .padding()
        .environmentObject(AppTheme.shared)
        .previewLayout(.sizeThatFits)
    }
}
```

### 4.2 输入框组件

#### 4.2.1 AppTextField
```swift
import SwiftUI

struct AppTextField: View {
    let title: String
    let placeholder: String
    @Binding var text: String
    let error: String?
    let isDisabled: Bool
    let isSecure: Bool
    let keyboardType: UIKeyboardType
    let returnKeyType: UIReturnKeyType
    let onReturn: (() -> Void)?
    let leadingIcon: Image?
    let trailingIcon: Image?
    let onTrailingIconTap: (() -> Void)?
    
    // 初始化
    init(
        _ title: String,
        placeholder: String,
        text: Binding<String>,
        error: String? = nil,
        isDisabled: Bool = false,
        isSecure: Bool = false,
        keyboardType: UIKeyboardType = .default,
        returnKeyType: UIReturnKeyType = .default,
        onReturn: (() -> Void)? = nil,
        leadingIcon: Image? = nil,
        trailingIcon: Image? = nil,
        onTrailingIconTap: (() -> Void)? = nil
    ) {
        self.title = title
        self.placeholder = placeholder
        self._text = text
        self.error = error
        self.isDisabled = isDisabled
        self.isSecure = isSecure
        self.keyboardType = keyboardType
        self.returnKeyType = returnKeyType
        self.onReturn = onReturn
        self.leadingIcon = leadingIcon
        self.trailingIcon = trailingIcon
        self.onTrailingIconTap = onTrailingIconTap
    }
    
    // 主题
    @EnvironmentObject private var theme: AppTheme
    
    // 状态
    @State private var isSecureTextVisible = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: theme.spacing.xxs) {
            Text(title)
                .font(theme.fonts.caption1)
                .fontWeight(.medium)
                .foregroundColor(theme.colors.textSecondary)
                .padding(.leading, theme.spacing.xs)
            
            HStack(spacing: theme.spacing.xs) {
                // 左侧图标
                if let leadingIcon = leadingIcon {
                    leadingIcon
                        .resizable()
                        .scaledToFit()
                        .frame(width: 20, height: 20)
                        .foregroundColor(theme.colors.textSecondary)
                }
                
                // 文本框
                Group {
                    if isSecure {
                        if isSecureTextVisible {
                            TextField(
                                placeholder,
                                text: $text,
                                onCommit: {
                                    onReturn?()
                                }
                            )
                            .keyboardType(keyboardType)
                            .returnKeyType(returnKeyType)
                        } else {
                            SecureField(
                                placeholder,
                                text: $text,
                                onCommit: {
                                    onReturn?()
                                }
                            )
                            .keyboardType(keyboardType)
                            .returnKeyType(returnKeyType)
                        }
                    } else {
                        TextField(
                            placeholder,
                            text: $text,
                            onCommit: {
                                onReturn?()
                            }
                        )
                        .keyboardType(keyboardType)
                        .returnKeyType(returnKeyType)
                    }
                }
                .font(theme.fonts.body)
                .foregroundColor(theme.colors.textPrimary)
                .disabled(isDisabled)
                .autocapitalization(.none)
                .autocorrectionDisabled()
                
                // 右侧图标
                if isSecure {
                    Button(action: {
                        isSecureTextVisible.toggle()
                    }) {
                        Image(systemName: isSecureTextVisible ? "eye.slash.fill" : "eye.fill")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 20, height: 20)
                            .foregroundColor(theme.colors.textSecondary)
                    }
                    .buttonStyle(.plain)
                } else if let trailingIcon = trailingIcon {
                    Button(action: {
                        onTrailingIconTap?()
                    }) {
                        trailingIcon
                            .resizable()
                            .scaledToFit()
                            .frame(width: 20, height: 20)
                            .foregroundColor(theme.colors.textSecondary)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(theme.spacing.md)
            .background(theme.colors.card)
            .border(
                error != nil ? theme.colors.error : (isDisabled ? theme.colors.disabled : theme.colors.border),
                width: 1
            )
            .cornerRadius(theme.borderRadius.md)
            
            // 错误信息
            if let error = error {
                Text(error)
                    .font(theme.fonts.caption2)
                    .foregroundColor(theme.colors.error)
                    .padding(.leading, theme.spacing.xs)
            }
        }
    }
}

// 预览
struct AppTextField_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 16) {
            AppTextField(
                "Email",
                placeholder: "Enter your email",
                text: .constant(""),
                leadingIcon: Image(systemName: "envelope.fill")
            )
            AppTextField(
                "Password",
                placeholder: "Enter your password",
                text: .constant(""),
                isSecure: true,
                leadingIcon: Image(systemName: "lock.fill")
            )
            AppTextField(
                "Username",
                placeholder: "Enter your username",
                text: .constant("john_doe"),
                leadingIcon: Image(systemName: "person.fill")
            )
            AppTextField(
                "Error Field",
                placeholder: "Enter value",
                text: .constant(""),
                error: "This field is required",
                leadingIcon: Image(systemName: "exclamationmark.circle.fill")
            )
            AppTextField(
                "Disabled Field",
                placeholder: "Enter value",
                text: .constant("Disabled"),
                isDisabled: true,
                leadingIcon: Image(systemName: "info.circle.fill")
            )
        }
        .padding()
        .environmentObject(AppTheme.shared)
        .previewLayout(.sizeThatFits)
    }
}
```

### 4.3 加载指示器组件

#### 4.3.1 AppLoadingIndicator
```swift
import SwiftUI

struct AppLoadingIndicator: View {
    let isLoading: Bool
    let message: String?
    let fullScreen: Bool
    let size: LoadingSize
    
    // 加载尺寸
    enum LoadingSize {
        case small
        case medium
        case large
    }
    
    // 初始化
    init(
        isLoading: Bool,
        message: String? = nil,
        fullScreen: Bool = false,
        size: LoadingSize = .medium
    ) {
        self.isLoading = isLoading
        self.message = message
        self.fullScreen = fullScreen
        self.size = size
    }
    
    // 主题
    @EnvironmentObject private var theme: AppTheme
    
    var body: some View {
        if isLoading {
            if fullScreen {
                ZStack {
                    theme.colors.overlay
                        .ignoresSafeArea()
                    content
                }
            } else {
                content
            }
        }
    }
    
    // 内容
    private var content: some View {
        VStack(spacing: theme.spacing.md) {
            ProgressView()
                .progressViewStyle(.circular)
                .scaleEffect(scale)
                .tint(theme.colors.primary)
            
            if let message = message {
                Text(message)
                    .font(theme.fonts.body)
                    .foregroundColor(theme.colors.textPrimary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, theme.spacing.lg)
            }
        }
        .padding(theme.spacing.lg)
        .background(theme.colors.surface)
        .cornerRadius(theme.borderRadius.lg)
        .shadow(theme.shadows.lg)
    }
    
    // 缩放比例
    private var scale: CGFloat {
        switch size {
        case .small:
            return 0.75
        case .medium:
            return 1.0
        case .large:
            return 1.5
        }
    }
}

// 预览
struct AppLoadingIndicator_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 16) {
            AppLoadingIndicator(isLoading: true, message: "Loading...", size: .small)
            AppLoadingIndicator(isLoading: true, message: "Loading...", size: .medium)
            AppLoadingIndicator(isLoading: true, message: "Loading...", size: .large)
            AppLoadingIndicator(isLoading: true, fullScreen: true, message: "Loading data...")
        }
        .padding()
        .environmentObject(AppTheme.shared)
        .previewLayout(.sizeThatFits)
    }
}
```

### 4.4 卡片组件

#### 4.4.1 AppCard
```swift
import SwiftUI

struct AppCard<Content: View>: View {
    let content: Content
    let padding: EdgeInsets
    let showShadow: Bool
    let showBorder: Bool
    
    // 初始化
    init(
        padding: EdgeInsets = EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 16),
        showShadow: Bool = true,
        showBorder: Bool = false,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.padding = padding
        self.showShadow = showShadow
        self.showBorder = showBorder
    }
    
    // 主题
    @EnvironmentObject private var theme: AppTheme
    
    var body: some View {
        content
            .padding(padding)
            .background(theme.colors.card)
            .border(showBorder ? theme.colors.border : .clear, width: 1)
            .cornerRadius(theme.borderRadius.md)
            .shadow(showShadow ? theme.shadows.sm : .init())
    }
}

// 预览
struct AppCard_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 16) {
            AppCard {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Card Title")
                        .font(theme.fonts.headline)
                        .foregroundColor(theme.colors.textPrimary)
                    Text("This is a sample card content. It demonstrates the card component with text content.")
                        .font(theme.fonts.body)
                        .foregroundColor(theme.colors.textSecondary)
                }
            }
            AppCard(showShadow: false) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Card Without Shadow")
                        .font(theme.fonts.headline)
                        .foregroundColor(theme.colors.textPrimary)
                    Text("This card doesn't have a shadow.")
                        .font(theme.fonts.body)
                        .foregroundColor(theme.colors.textSecondary)
                }
            }
            AppCard(showBorder: true) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Card With Border")
                        .font(theme.fonts.headline)
                        .foregroundColor(theme.colors.textPrimary)
                    Text("This card has a border.")
                        .font(theme.fonts.body)
                        .foregroundColor(theme.colors.textSecondary)
                }
            }
        }
        .padding()
        .environmentObject(AppTheme.shared)
        .previewLayout(.sizeThatFits)
    }
}
```

## 5. 基础布局组件

### 5.1 容器组件

#### 5.1.1 AppContainer
```swift
import SwiftUI

struct AppContainer<Content: View>: View {
    let content: Content
    let padding: EdgeInsets
    let backgroundColor: Color?
    let maxWidth: CGFloat?
    let alignment: Alignment
    
    // 初始化
    init(
        padding: EdgeInsets = EdgeInsets(top: 0, leading: 16, bottom: 0, trailing: 16),
        backgroundColor: Color? = nil,
        maxWidth: CGFloat? = nil,
        alignment: Alignment = .topLeading,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.padding = padding
        self.backgroundColor = backgroundColor
        self.maxWidth = maxWidth
        self.alignment = alignment
    }
    
    // 主题
    @EnvironmentObject private var theme: AppTheme
    
    var body: some View {
        HStack {
            Spacer()
            content
                .frame(maxWidth: maxWidth)
                .padding(padding)
                .background(backgroundColor ?? .clear)
            Spacer()
        }
        .frame(maxWidth: .infinity, alignment: alignment)
    }
}

// 预览
struct AppContainer_Previews: PreviewProvider {
    static var previews: some View {
        AppContainer {
            VStack(spacing: 16) {
                Text("Container Content")
                    .font(theme.fonts.headline)
                AppCard {
                    Text("This is a card inside a container.")
                }
            }
        }
        .environmentObject(AppTheme.shared)
        .previewLayout(.sizeThatFits)
    }
}
```

### 5.2 行组件

#### 5.2.1 AppRow
```swift
import SwiftUI

struct AppRow<LeadingContent: View, TrailingContent: View>: View {
    let leadingContent: LeadingContent
    let trailingContent: TrailingContent
    let spacing: CGFloat
    let alignment: VerticalAlignment
    let showDivider: Bool
    
    // 初始化
    init(
        spacing: CGFloat = 16,
        alignment: VerticalAlignment = .center,
        showDivider: Bool = false,
        @ViewBuilder leadingContent: () -> LeadingContent,
        @ViewBuilder trailingContent: () -> TrailingContent
    ) {
        self.leadingContent = leadingContent()
        self.trailingContent = trailingContent()
        self.spacing = spacing
        self.alignment = alignment
        self.showDivider = showDivider
    }
    
    // 主题
    @EnvironmentObject private var theme: AppTheme
    
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: spacing) {
                leadingContent
                    .frame(maxWidth: .infinity, alignment: .leading)
                trailingContent
                    .frame(alignment: .trailing)
            }
            if showDivider {
                Divider()
                    .background(theme.colors.separator)
            }
        }
    }
}

// 便捷初始化：只有文本
struct AppRow_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 16) {
            AppRow(
                leadingContent: {
                    Text("Label")
                        .font(theme.fonts.body)
                        .foregroundColor(theme.colors.textPrimary)
                },
                trailingContent: {
                    Text("Value")
                        .font(theme.fonts.body)
                        .foregroundColor(theme.colors.textSecondary)
                }
            )
            AppRow(
                showDivider: true,
                leadingContent: {
                    HStack(spacing: 8) {
                        Image(systemName: "person.fill")
                            .foregroundColor(theme.colors.primary)
                        Text("User Profile")
                            .font(theme.fonts.body)
                            .foregroundColor(theme.colors.textPrimary)
                    }
                },
                trailingContent: {
                    Image(systemName: "chevron.right")
                        .foregroundColor(theme.colors.textSecondary)
                }
            )
        }
        .padding()
        .environmentObject(AppTheme.shared)
        .previewLayout(.sizeThatFits)
    }
}
```

## 6. 基础状态管理实现

### 6.1 认证状态管理

#### 6.1.1 AuthViewModel
```swift
import Combine
import SwiftUI

class AuthViewModel: BaseViewModel {
    
    // 用户信息
    @Published var user: User?
    
    // 认证状态
    @Published var isLoggedIn: Bool = false
    
    // 登录表单
    @Published var loginEmail: String = ""
    @Published var loginPassword: String = ""
    
    // 注册表单
    @Published var registerName: String = ""
    @Published var registerEmail: String = ""
    @Published var registerPassword: String = ""
    @Published var registerConfirmPassword: String = ""
    
    // 登录错误
    @Published var loginEmailError: String? = nil
    @Published var loginPasswordError: String? = nil
    
    // 注册错误
    @Published var registerNameError: String? = nil
    @Published var registerEmailError: String? = nil
    @Published var registerPasswordError: String? = nil
    @Published var registerConfirmPasswordError: String? = nil
    
    // 初始化
    override init() {
        super.init()
        
        // 检查登录状态
        checkLoginStatus()
        
        // 监听认证相关通知
        NotificationCenter.default.publisher(for: .authTokenExpired)
            .sink {[weak self] _ in
                self?.handleTokenExpired()
            }
            .store(in: &cancellables)
    }
    
    // 检查登录状态
    private func checkLoginStatus() {
        // 从Keychain检查是否有有效令牌
        if KeychainService.shared.accessToken != nil {
            // 这里可以添加验证令牌有效性的逻辑
            isLoggedIn = true
            
            // 加载用户信息
            loadUserInfo()
        } else {
            isLoggedIn = false
        }
    }
    
    // 加载用户信息
    private func loadUserInfo() {
        // 实现加载用户信息的逻辑
        // 这里可以调用API获取用户信息
    }
    
    // 处理令牌过期
    private func handleTokenExpired() {
        // 清除认证状态
        logout()
    }
    
    // 登录
    func login() {
        // 重置错误
        loginEmailError = nil
        loginPasswordError = nil
        
        // 表单验证
        var isValid = true
        
        if loginEmail.isEmpty {
            loginEmailError = "Email is required"
            isValid = false
        } else if !isValidEmail(loginEmail) {
            loginEmailError = "Please enter a valid email"
            isValid = false
        }
        
        if loginPassword.isEmpty {
            loginPasswordError = "Password is required"
            isValid = false
        } else if loginPassword.count < 6 {
            loginPasswordError = "Password must be at least 6 characters"
            isValid = false
        }
        
        guard isValid else {
            return
        }
        
        // 执行登录请求
        let request = LoginRequest(email: loginEmail, password: loginPassword)
        
        handleResponse(
            APIService.shared.request(
                APIEndpoint.login,
                parameters: request.dictionary,
                responseType: LoginResponse.self
            )
        ) { response in
            // 保存令牌
            KeychainService.shared.accessToken = response.accessToken
            KeychainService.shared.refreshToken = response.refreshToken
            
            // 更新用户信息
            user = response.user
            isLoggedIn = true
            
            // 发送登录成功通知
            NotificationCenter.default.post(name: .userLoggedIn, object: nil)
            
            // 导航到主页
            AppRouter.shared.navigateToRoot()
        }
    }
    
    // 注册
    func register() {
        // 重置错误
        registerNameError = nil
        registerEmailError = nil
        registerPasswordError = nil
        registerConfirmPasswordError = nil
        
        // 表单验证
        var isValid = true
        
        if registerName.isEmpty {
            registerNameError = "Name is required"
            isValid = false
        }
        
        if registerEmail.isEmpty {
            registerEmailError = "Email is required"
            isValid = false
        } else if !isValidEmail(registerEmail) {
            registerEmailError = "Please enter a valid email"
            isValid = false
        }
        
        if registerPassword.isEmpty {
            registerPasswordError = "Password is required"
            isValid = false
        } else if registerPassword.count < 6 {
            registerPasswordError = "Password must be at least 6 characters"
            isValid = false
        }
        
        if registerConfirmPassword.isEmpty {
            registerConfirmPasswordError = "Please confirm your password"
            isValid = false
        } else if registerConfirmPassword != registerPassword {
            registerConfirmPasswordError = "Passwords do not match"
            isValid = false
        }
        
        guard isValid else {
            return
        }
        
        // 执行注册请求
        let request = RegisterRequest(name: registerName, email: registerEmail, password: registerPassword)
        
        handleResponse(
            APIService.shared.request(
                APIEndpoint.register,
                parameters: request.dictionary,
                responseType: User.self
            )
        ) { response in
            // 注册成功后自动登录
            loginEmail = registerEmail
            loginPassword = registerPassword
            login()
        }
    }
    
    // 登出
    func logout() {
        // 清除令牌
        KeychainService.shared.clearTokens()
        
        // 清除用户信息
        user = nil
        isLoggedIn = false
        
        // 发送登出成功通知
        NotificationCenter.default.post(name: .userLoggedOut, object: nil)
        
        // 导航到登录页
        AppRouter.shared.reset()
    }
    
    // 验证邮箱格式
    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$".r
        return emailRegex.matches(email)
    }
}

// 扩展Encodable，添加dictionary属性
fileprivate extension Encodable {
    var dictionary: [String: Any]? {
        guard let data = try? JSONEncoder().encode(self) else {
            return nil
        }
        return (try? JSONSerialization.jsonObject(with: data, options: .allowFragments)) as? [String: Any]
    }
}
```

## 7. 示例页面实现

### 7.1 WelcomeView
```swift
import SwiftUI

struct WelcomeView: View {
    
    // 路由管理器
    @EnvironmentObject private var router: AppRouter
    
    // 主题
    @EnvironmentObject private var theme: AppTheme
    
    var body: some View {
        AppContainer {
            VStack(spacing: theme.spacing.xxl) {
                // 应用图标和标题
                VStack(spacing: theme.spacing.md) {
                    Image(systemName: "mic.fill")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 80, height: 80)
                        .foregroundColor(theme.colors.primary)
                    Text("AI Voice Interaction App")
                        .font(theme.fonts.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(theme.colors.textPrimary)
                        .multilineTextAlignment(.center)
                    Text("Your AI cognitive assistant")
                        .font(theme.fonts.body)
                        .foregroundColor(theme.colors.textSecondary)
                        .multilineTextAlignment(.center)
                }
                
                // 操作按钮
                VStack(spacing: theme.spacing.md) {
                    PrimaryButton(
                        "Log In",
                        action: {
                            router.navigate(to: .login)
                        },
                        isLoading: false,
                        isDisabled: false
                    )
                    PrimaryButton(
                        "Sign Up",
                        action: {
                            router.navigate(to: .register)
                        },
                        isLoading: false,
                        isDisabled: false,
                        variant: .outline
                    )
                }
                .frame(maxWidth: 320)
            }
            .padding(theme.spacing.xl)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(theme.colors.background)
    }
}

// 预览
struct WelcomeView_Previews: PreviewProvider {
    static var previews: some View {
        WelcomeView()
            .environmentObject(AppRouter.shared)
            .environmentObject(AppTheme.shared)
            .previewLayout(.sizeThatFits)
    }
}
```

### 7.2 LoginView
```swift
import SwiftUI

struct LoginView: View {
    
    // 认证视图模型
    @EnvironmentObject private var authViewModel: AuthViewModel
    
    // 路由管理器
    @EnvironmentObject private var router: AppRouter
    
    // 主题
    @EnvironmentObject private var theme: AppTheme
    
    var body: some View {
        AppContainer {
            VStack(spacing: theme.spacing.xl) {
                // 标题
                VStack(spacing: theme.spacing.xs) {
                    Text("Welcome Back")
                        .font(theme.fonts.title1)
                        .fontWeight(.bold)
                        .foregroundColor(theme.colors.textPrimary)
                    Text("Log in to continue")
                        .font(theme.fonts.body)
                        .foregroundColor(theme.colors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // 登录表单
                VStack(spacing: theme.spacing.lg) {
                    AppTextField(
                        "Email",
                        placeholder: "Enter your email",
                        text: $authViewModel.loginEmail,
                        error: authViewModel.loginEmailError,
                        leadingIcon: Image(systemName: "envelope.fill")
                    )
                    AppTextField(
                        "Password",
                        placeholder: "Enter your password",
                        text: $authViewModel.loginPassword,
                        error: authViewModel.loginPasswordError,
                        isSecure: true,
                        leadingIcon: Image(systemName: "lock.fill")
                    )
                    
                    // 忘记密码
                    Button(action: {
                        // 实现忘记密码功能
                    }) {
                        Text("Forgot Password?")
                            .font(theme.fonts.body)
                            .foregroundColor(theme.colors.primary)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                    }
                    .buttonStyle(.plain)
                    
                    // 登录按钮
                    PrimaryButton(
                        "Log In",
                        action: {
                            authViewModel.login()
                        },
                        isLoading: authViewModel.isLoading,
                        isDisabled: false
                    )
                    
                    // 切换到注册
                    HStack(spacing: theme.spacing.xs) {
                        Text("Don't have an account?")
                            .font(theme.fonts.body)
                            .foregroundColor(theme.colors.textSecondary)
                        Button(action: {
                            router.navigate(to: .register)
                        }) {
                            Text("Sign Up")
                                .font(theme.fonts.body)
                                .fontWeight(.medium)
                                .foregroundColor(theme.colors.primary)
                        }
                        .buttonStyle(.plain)
                    }
                    .frame(maxWidth: .infinity, alignment: .center)
                }
                .frame(maxWidth: 320)
            }
            .padding(theme.spacing.xl)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(theme.colors.background)
        .navigationTitle("Log In")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// 预览
struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
            .environmentObject(AuthViewModel())
            .environmentObject(AppRouter.shared)
            .environmentObject(AppTheme.shared)
            .previewLayout(.sizeThatFits)
    }
}
```

## 8. 总结

### 8.1 今日完成
- ✅ 实现了路由管理（基于SwiftUI NavigationStack）
- ✅ 创建了基础UI组件（按钮、输入框、加载指示器、卡片等）
- ✅ 实现了主题管理（颜色、字体、间距、圆角、阴影）
- ✅ 创建了基础布局组件（容器、行、列等）
- ✅ 实现了基础的状态管理（使用@ObservableObject）
- ✅ 实现了示例页面（WelcomeView、LoginView）

### 8.2 明日计划
- 开始实现认证模块的完整功能
- 实现登录和注册功能
- 实现认证状态管理
- 实现路由守卫

### 8.3 设计亮点
- **组件化设计**：将UI拆分为可复用的组件，提高代码复用率和可维护性
- **响应式布局**：适配不同屏幕尺寸，提供良好的跨设备体验
- **主题支持**：实现主题切换，支持浅色和深色模式
- **统一的设计语言**：保持UI组件的风格一致性
- **易用性优先**：组件设计简单易用，降低开发复杂度
- **完整的路由系统**：基于NavigationStack实现了灵活的路由管理
- **安全的状态管理**：使用ObservableObject和EnvironmentObject实现了响应式状态管理

通过今日的实现，我们建立了应用的基础UI框架和路由系统，为后续的功能开发奠定了坚实的基础。基础UI组件和布局组件将在整个应用开发过程中被广泛使用，主题管理系统将支持应用的个性化定制，路由系统将确保应用的导航流畅性。