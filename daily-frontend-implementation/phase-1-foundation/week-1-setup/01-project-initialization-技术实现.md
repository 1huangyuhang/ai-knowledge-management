# Day 01: 项目初始化 - 代码实现文档

## 模块关联索引

### 所属环节
- **阶段**：第一阶段：基础架构搭建
- **周次**：第1周
- **天数**：第1天
- **开发主题**：项目初始化

### 对应核心文档
- [技术栈选型](../../core-docs/dev-support/tech-stack-selection.md)
- [第三方库使用规范](../../core-docs/dev-support/third-party-library-guidelines.md)
- [开发环境搭建](../../core-docs/dev-support/development-environment-setup.md)

### 相关技术实现文档
- [第2天：API服务和数据模型](02-api-service-and-models-技术实现.md)
- [第3天：路由和UI组件](03-routing-and-ui-components-技术实现.md)

### 关联模块
- [API服务和数据模型](02-api-service-and-models-技术实现.md)
- [路由和UI组件](03-routing-and-ui-components-技术实现.md)

### 依赖关系
- 无直接依赖，为后续模块提供基础架构

## 1. 项目概述

### 1.1 项目目标
- 构建一个基于iOS平台的AI语音交互应用
- 实现与后端认知辅助系统的无缝集成
- 提供直观的语音输入和输出功能
- 可视化展示用户认知模型和分析结果

### 1.2 核心设计理念
- **SwiftUI优先**：采用现代化的SwiftUI框架，提供流畅的用户体验
- **MVVM架构**：清晰的分层架构，便于维护和扩展
- **响应式编程**：使用Combine框架实现数据的响应式更新
- **模块化设计**：功能模块清晰，便于团队协作和代码复用

## 2. 技术栈选型

### 2.1 核心技术
- **开发语言**：Swift 5.9+
- **UI框架**：SwiftUI 5.0+
- **语音识别**：Speech Framework
- **网络请求**：URLSession + Async/Await
- **状态管理**：SwiftUI ObservableObject + Environment
- **WebSocket**：URLSessionWebSocketTask
- **数据持久化**：Core Data

### 2.2 第三方依赖
| 依赖 | 用途 | 版本 |
|------|------|------|
| Alamofire | 网络请求封装 | 5.8.1 |
| Combine | 响应式编程 | 内置 |
| SwiftyJSON | JSON解析 | 5.0.0 |
| SDWebImageSwiftUI | 图片加载与缓存 | 3.0.0 |
| SwiftLint | 代码质量检查 | 0.54.0 |

## 3. 项目结构设计

### 3.1 目录结构
```
Sources/
├── AI-Voice-Interaction-App/            # 主应用代码
│   ├── App/                             # 应用入口
│   │   └── App.swift                    # 应用主文件
│   ├── Model/                           # 数据模型层
│   │   ├── User.swift                   # 用户模型
│   │   ├── CognitiveModel.swift         # 认知模型
│   │   ├── CognitiveConcept.swift       # 认知概念
│   │   └── CognitiveRelation.swift      # 认知关系
│   ├── Service/                         # 服务层
│   │   ├── APIService.swift             # API服务
│   │   ├── WebSocketService.swift       # WebSocket服务
│   │   └── SpeechService.swift          # 语音服务
│   ├── ViewModel/                       # 视图模型层
│   │   ├── BaseViewModel.swift          # 基础ViewModel
│   │   └── AuthViewModel.swift          # 认证ViewModel
│   └── View/                            # 视图层
│       ├── ContentView.swift            # 内容视图
│       └── Auth/                        # 认证相关视图
│           ├── LoginView.swift          # 登录视图
│           └── RegisterView.swift       # 注册视图
└── AI-Voice-Interaction-AppTests/       # 测试代码
    └── AI_Voice_Interaction_AppTests.swift  # 测试主文件
```

### 3.2 Package.swift配置
```swift
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "AI-Voice-Interaction-App",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "AI-Voice-Interaction-App",
            targets: ["AI-Voice-Interaction-App"]),
    ],
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.1"),
        .package(url: "https://github.com/SwiftyJSON/SwiftyJSON.git", from: "5.0.0"),
        .package(url: "https://github.com/SDWebImage/SDWebImageSwiftUI.git", from: "3.0.0"),
        .package(url: "https://github.com/realm/SwiftLint.git", from: "0.54.0"),
    ],
    targets: [
        .target(
            name: "AI-Voice-Interaction-App",
            dependencies: [
                "Alamofire",
                "SwiftyJSON",
                "SDWebImageSwiftUI"
            ]),
        .testTarget(
            name: "AI-Voice-Interaction-AppTests",
            dependencies: ["AI-Voice-Interaction-App"]),
    ]
)
```

## 4. 核心文件实现

### 4.1 App.swift - 应用入口
```swift
import SwiftUI

@main
struct AIVoiceInteractionApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### 4.2 ContentView.swift - 初始视图
```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "mic.fill")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("AI Voice Interaction App")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Welcome to your AI cognitive assistant")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.background)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
```

### 4.3 SwiftLint配置
```yaml
# .swiftlint.yml
disabled_rules: # 禁用的规则
  - trailing_whitespace
  - line_length
  - type_name
  - function_body_length

opt_in_rules: # 启用的规则
  - empty_count
  - explicit_init
  - fatal_error_message
  - implicit_return
  - unused_import

included: # 包含的目录
  - Sources

excluded: # 排除的目录
  - .git
  - .build
  - Packages
  - Tests

line_length: # 行长度配置
  warning: 120
  error: 160

identifier_name: # 标识符命名规则
  min_length:
    warning: 2
  max_length:
    warning: 40
```

## 5. 开发环境配置

### 5.1 Xcode设置
1. 打开Xcode 15+，创建新项目
2. 选择"iOS App"模板
3. 配置项目信息：
   - Product Name: AI Voice Interaction App
   - Team: 选择您的开发团队
   - Organization Identifier: com.example
   - Language: Swift
   - Interface: SwiftUI
   - Life Cycle: SwiftUI App
   - Storage: Core Data

### 5.2 Swift Package Manager配置
1. 在Xcode中，选择File > Add Packages...
2. 分别添加以下依赖：
   - Alamofire: https://github.com/Alamofire/Alamofire.git
   - SwiftyJSON: https://github.com/SwiftyJSON/SwiftyJSON.git
   - SDWebImageSwiftUI: https://github.com/SDWebImage/SDWebImageSwiftUI.git
3. 选择适当的版本并添加到项目中

### 5.3 SwiftLint配置
1. 使用Homebrew安装SwiftLint：
   ```bash
   brew install swiftlint
   ```
2. 在Xcode中添加Run Script Phase：
   - 选择项目 > Targets > AI Voice Interaction App > Build Phases
   - 点击"+"号，选择"New Run Script Phase"
   - 输入以下脚本：
     ```bash
     if which swiftlint > /dev/null; then
         swiftlint
     else
         echo "warning: SwiftLint not installed, download from https://github.com/realm/SwiftLint"
     fi
     ```

## 6. 代码规范与最佳实践

### 6.1 命名规范
- 类名：大驼峰（LoginViewModel）
- 结构体名：大驼峰（UserModel）
- 枚举名：大驼峰（AuthState）
- 属性名：小驼峰（userName）
- 方法名：小驼峰（loginUser）
- 常量：大驼峰（MaxRetryCount）

### 6.2 SwiftUI最佳实践
- 使用ViewModifier封装可复用的UI样式
- 优先使用@StateObject和@ObservedObject管理状态
- 使用@EnvironmentObject共享全局状态
- 实现PreviewProvider便于预览UI

### 6.3 错误处理
- 使用Swift的Result类型处理异步操作结果
- 实现统一的错误处理机制
- 为用户提供清晰的错误提示

## 7. 项目开发规划

### 7.1 第一阶段（第1-3天）：基础架构搭建
- 项目初始化和环境配置
- API服务层实现
- 核心数据模型定义
- 基础UI组件开发

### 7.2 第二阶段（第4-6天）：认证模块开发
- 登录和注册功能
- 认证状态管理
- 路由守卫实现

### 7.3 第三阶段（第7-15天）：核心功能开发
- 语音交互功能
- AI对话功能
- 认知模型可视化
- 多维度分析展示

### 7.4 第四阶段（第16-25天）：功能优化和测试
- 性能优化
- UI/UX改进
- 单元测试和UI测试
- Bug修复

### 7.5 第五阶段（第26-30天）：部署和发布准备
- 多环境配置
- 应用打包和签名
- App Store提交准备

## 8. 总结

Day 01的核心任务是完成项目的初始化和基础配置，包括：
- 创建Xcode项目并配置基本信息
- 安装和配置第三方依赖
- 设计项目目录结构
- 配置代码规范和开发工具

通过这一天的工作，我们建立了项目的基础框架，为后续的功能开发奠定了坚实的基础。接下来，我们将按照开发计划，逐步实现各个功能模块，确保项目的顺利进行。

在后续的开发中，我们将严格遵循SwiftUI最佳实践和MVVM架构原则，确保代码的质量和可维护性。同时，我们将注重用户体验，提供流畅、直观的语音交互界面，实现与后端认知辅助系统的无缝集成。
