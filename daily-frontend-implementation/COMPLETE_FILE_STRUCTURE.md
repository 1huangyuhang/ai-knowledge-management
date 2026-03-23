# AI Voice Interaction App 完整文件结构

## 1. 文档说明

### 1.1 文档目的
本文档详细描述AI Voice Interaction App的完整文件结构，遵循Clean Architecture和MVVM设计原则，确保各层之间的依赖关系和职责清晰。该文档将作为AI生成代码的参考，确保生成的代码符合整体架构设计，不偏离系统结构。

### 1.2 架构原则
- **Clean Architecture**：严格遵循分层架构，内层不依赖外层
- **MVVM**：Model-View-ViewModel设计模式
- **单向数据流**：数据从Model流向View，用户交互通过ViewModel处理
- **组件化设计**：将UI拆分为可复用的组件
- **响应式编程**：使用SwiftUI和Combine实现响应式UI
- **高内聚、低耦合**：模块内部高度相关，模块间松耦合

## 2. 完整文件结构

```
daily-frontend-implementation/
├── Sources/                          # 源代码目录
│   ├── Domain/                       # 领域层 - 核心业务模型和规则
│   │   ├── Models/                   # 领域实体
│   │   │   ├── User.swift            # 用户模型
│   │   │   ├── CognitiveModel.swift  # 认知模型
│   │   │   ├── CognitiveConcept.swift # 认知概念
│   │   │   ├── CognitiveRelation.swift # 认知关系
│   │   │   ├── ThoughtFragment.swift # 思想片段
│   │   │   ├── CognitiveInsight.swift # 认知洞察
│   │   │   └── AITask.swift          # AI任务
│   │   ├── Protocols/                # 领域服务协议
│   │   │   ├── AuthRepository.swift  # 认证服务协议
│   │   │   ├── CognitiveModelRepository.swift # 认知模型服务协议
│   │   │   ├── ThoughtRepository.swift # 思想片段服务协议
│   │   │   ├── AITaskRepository.swift # AI任务服务协议
│   │   │   └── SpeechService.swift   # 语音服务协议
│   │   ├── Enums/                    # 枚举类型
│   │   │   ├── UserRole.swift        # 用户角色
│   │   │   ├── CognitiveRelationType.swift # 认知关系类型
│   │   │   ├── AITaskStatus.swift    # AI任务状态
│   │   │   └── SpeechRecognitionStatus.swift # 语音识别状态
│   │   └── ValueObjects/             # 值对象
│   │       ├── Email.swift           # 邮箱
│   │       ├── Password.swift        # 密码
│   │       └── UUID.swift            # UUID
│   ├── Service/                      # 服务层 - 实现领域服务协议
│   │   ├── API/                      # API服务
│   │   │   ├── APIClient.swift       # API客户端
│   │   │   ├── APIRequest.swift      # API请求
│   │   │   ├── APIResponse.swift     # API响应
│   │   │   ├── Endpoints.swift       # API端点
│   │   │   └── MockAPIClient.swift   # Mock API客户端（测试用）
│   │   ├── Repositories/             # 仓库实现
│   │   │   ├── APIAuthRepository.swift # 认证服务实现
│   │   │   ├── APICognitiveModelRepository.swift # 认知模型服务实现
│   │   │   ├── APITthoughtRepository.swift # 思想片段服务实现
│   │   │   └── AIAITaskRepository.swift # AI任务服务实现
│   │   ├── Speech/                   # 语音服务
│   │   │   ├── SpeechRecognitionService.swift # 语音识别服务
│   │   │   └── TextToSpeechService.swift # 文本转语音服务
│   │   ├── WebSocket/                # WebSocket服务
│   │   │   └── WebSocketService.swift # WebSocket连接管理
│   │   └── CoreData/                 # 本地数据存储
│   │       ├── CoreDataManager.swift # CoreData管理
│   │       ├── CoreDataRepository.swift # CoreData仓库
│   │       └── Mappers/              # 数据映射
│   │           └── CoreDataMappers.swift # CoreData与领域模型映射
│   ├── ViewModel/                    # 视图模型层 - 状态管理和业务逻辑
│   │   ├── Auth/                     # 认证相关ViewModel
│   │   │   ├── LoginViewModel.swift  # 登录ViewModel
│   │   │   ├── RegisterViewModel.swift # 注册ViewModel
│   │   │   └── AuthStateViewModel.swift # 认证状态ViewModel
│   │   ├── Cognitive/                # 认知模型相关ViewModel
│   │   │   ├── CognitiveModelListViewModel.swift # 认知模型列表
│   │   │   ├── CognitiveModelDetailViewModel.swift # 认知模型详情
│   │   │   ├── CognitiveModelCreateViewModel.swift # 创建认知模型
│   │   │   └── CognitiveModelEditViewModel.swift # 编辑认知模型
│   │   ├── Thought/                  # 思想片段相关ViewModel
│   │   │   ├── ThoughtListViewModel.swift # 思想片段列表
│   │   │   └── ThoughtCreateViewModel.swift # 创建思想片段
│   │   ├── AITask/                   # AI任务相关ViewModel
│   │   │   ├── AITaskListViewModel.swift # AI任务列表
│   │   │   └── AITaskDetailViewModel.swift # AI任务详情
│   │   ├── Speech/                   # 语音相关ViewModel
│   │   │   └── SpeechViewModel.swift # 语音交互ViewModel
│   │   └── Shared/                   # 共享ViewModel
│   │       ├── LoadingViewModel.swift # 加载状态管理
│   │       └── ErrorViewModel.swift   # 错误状态管理
│   └── Presentation/                 # 表示层 - UI组件
│       ├── Screens/                  # 完整屏幕
│       │   ├── Auth/                 # 认证屏幕
│       │   │   ├── LoginView.swift   # 登录屏幕
│       │   │   └── RegisterView.swift # 注册屏幕
│       │   ├── Cognitive/            # 认知模型屏幕
│       │   │   ├── CognitiveModelListView.swift # 认知模型列表
│       │   │   ├── CognitiveModelDetailView.swift # 认知模型详情
│       │   │   ├── CognitiveModelCreateView.swift # 创建认知模型
│       │   │   └── CognitiveModelEditView.swift # 编辑认知模型
│       │   ├── Thought/              # 思想片段屏幕
│       │   │   ├── ThoughtListView.swift # 思想片段列表
│       │   │   └── ThoughtCreateView.swift # 创建思想片段
│       │   ├── AITask/               # AI任务屏幕
│       │   │   ├── AITaskListView.swift # AI任务列表
│       │   │   └── AITaskDetailView.swift # AI任务详情
│       │   ├── Speech/               # 语音交互屏幕
│       │   │   └── SpeechInteractionView.swift # 语音交互
│       │   ├── Settings/             # 设置屏幕
│       │   │   └── SettingsView.swift # 设置
│       │   └── Main/                 # 主屏幕
│       │       └── MainTabView.swift # 主标签页
│       ├── Components/               # 可复用组件
│       │   ├── Buttons/              # 按钮组件
│       │   │   ├── PrimaryButton.swift # 主要按钮
│       │   │   ├── SecondaryButton.swift # 次要按钮
│       │   │   └── SpeechButton.swift # 语音按钮
│       │   ├── Form/                 # 表单组件
│       │   │   ├── FormTextField.swift # 表单文本框
│       │   │   └── FormPicker.swift  # 表单选择器
│       │   ├── Lists/                # 列表组件
│       │   │   ├── CognitiveModelRow.swift # 认知模型行
│       │   │   ├── ThoughtRow.swift  # 思想片段行
│       │   │   └── AITaskRow.swift   # AI任务行
│       │   ├── Cards/                # 卡片组件
│       │   │   ├── CognitiveConceptCard.swift # 认知概念卡片
│       │   │   └── CognitiveInsightCard.swift # 认知洞察卡片
│       │   ├── Visualization/        # 可视化组件
│       │   │   └── CognitiveGraphView.swift # 认知图视图
│       │   └── Modals/               # 模态框组件
│       │       ├── LoadingModal.swift # 加载模态框
│       │       └── ErrorModal.swift  # 错误模态框
│       ├── Navigation/               # 导航组件
│       │   └── AppNavigator.swift    # 应用导航器
│       ├── Assets/                   # 资源文件
│       │   ├── Colors/               # 颜色定义
│       │   │   └── AppColors.swift   # 应用颜色
│       │   ├── Fonts/                # 字体定义
│       │   │   └── AppFonts.swift    # 应用字体
│       │   └── Images/               # 图片资源
│       │       └── AppImages.swift    # 应用图片
│       └── Utils/                    # 表示层工具
│           ├── ViewExtensions.swift   # 视图扩展
│           └── AnimationUtils.swift   # 动画工具
├── Tests/                            # 测试目录
│   ├── UnitTests/                    # 单元测试
│   │   ├── DomainTests/              # 领域层测试
│   │   │   ├── ModelsTests/          # 模型测试
│   │   │   └── ProtocolsTests/       # 协议测试
│   │   ├── ServiceTests/             # 服务层测试
│   │   │   ├── APITests/             # API服务测试
│   │   │   └── SpeechTests/          # 语音服务测试
│   │   └── ViewModelTests/           # 视图模型测试
│   └── IntegrationTests/             # 集成测试
│       ├── APITests/                 # API集成测试
│       └── CoreDataTests/            # CoreData集成测试
├── Resources/                        # 资源目录
│   ├── Localizable.strings           # 本地化字符串
│   ├── Assets.xcassets               # 资源文件包
│   │   ├── Colors.xcassets           # 颜色资源
│   │   ├── Fonts.xcassets            # 字体资源
│   │   └── Images.xcassets           # 图片资源
│   └── PromptDesigns/                # AI Prompt设计
│       ├── CognitiveParserPrompt.txt # 认知解析Prompt
│       └── InsightGeneratorPrompt.txt # 洞察生成Prompt
├── Config/                           # 配置目录
│   ├── APIConfig.swift               # API配置
│   ├── AppConfig.swift               # 应用配置
│   └── EnvironmentConfig.swift       # 环境配置
├── Core/                             # 核心功能目录
│   ├── DependencyInjection/          # 依赖注入
│   │   └── ServiceLocator.swift      # 服务定位器
│   ├── ErrorHandling/                # 错误处理
│   │   ├── AppError.swift            # 应用错误
│   │   └── ErrorHandler.swift        # 错误处理器
│   └── Logger/                       # 日志系统
│       └── AppLogger.swift           # 应用日志
├── core-docs/                        # 核心文档目录
│   ├── architecture-design/          # 架构设计文档
│   ├── core-features/                # 核心功能文档
│   ├── dev-support/                  # 开发支持文档
│   └── test-quality/                 # 测试质量文档
├── phase-1-foundation/               # 阶段1：基础架构搭建
│   ├── week-1-setup/                 # 第1周：项目初始化
│   ├── week-2-auth/                  # 第2周：认证功能
│   └── week-3-cognitive-model/       # 第3周：认知模型
├── phase-2-voice-interaction/        # 阶段2：语音交互
│   └── week-4-voice/                 # 第4周：语音功能
├── phase-3-ai-conversation/          # 阶段3：AI对话
│   └── week-5-ai-conversation/       # 第5周：AI对话
├── phase-4-multi-dimensional-analysis/ # 阶段4：多维分析
│   └── week-6-analysis/              # 第6周：分析功能
├── phase-5-cognitive-model-visualization/ # 阶段5：认知模型可视化
│   └── week-7-visualization/         # 第7周：可视化功能
├── phase-6-personalization/          # 阶段6：个性化
│   └── week-8-personalization/       # 第8周：个性化功能
├── phase-7-websocket/                # 阶段7：WebSocket
│   └── week-9-websocket/             # 第9周：WebSocket功能
├── phase-8-testing-optimization/     # 阶段8：测试优化
│   └── week-10-testing/              # 第10周：测试优化
├── CODE_GENERATION_GUIDE_PART1.md    # 代码生成指导 - 第一部分
├── CODE_GENERATION_GUIDE_PART2.md    # 代码生成指导 - 第二部分
├── CODE_GENERATION_GUIDE_PART3.md    # 代码生成指导 - 第三部分
├── CODE_GENERATION_GUIDE_PART4.md    # 代码生成指导 - 第四部分
├── CODE_GENERATION_PROGRESS.md       # 代码生成进度跟踪
├── COMPLETE_FILE_STRUCTURE.md        # 完整文件结构文档（本文件）
├── DOCUMENTATION_GUIDE.md            # 文档编写指南
├── README.md                         # 项目说明文档
├── SUMMARY.md                        # 项目总结文档
├── check-docs.sh                     # 文档检查脚本
├── frontend-development-plan.md      # 前端开发计划
├── 前端页面设计规范.md                # 前端页面设计规范
├── Package.swift                     # Swift Package配置
├── Xcode/                            # Xcode项目文件
│   ├── AIVoiceInteractionApp.xcodeproj # Xcode项目
│   └── AIVoiceInteractionApp.xcworkspace # Xcode工作区
├── .gitignore                        # Git忽略文件
├── .swiftlint.yml                    # SwiftLint配置
└── .github/                          # GitHub配置
    └── workflows/                    # CI/CD工作流
        └── ci.yml                    # CI配置
```

## 3. 各层职责说明

### 3.1 领域层 (Domain Layer)
- **职责**：定义核心业务模型和规则
- **依赖**：无外部依赖，只依赖自身
- **文件位置**：`Sources/Domain/`
- **主要组件**：
  - 模型：包含业务数据的核心对象
  - 协议：定义服务接口，实现依赖倒置
  - 枚举：业务相关的枚举类型
  - 值对象：不可变的值类型，如Email、Password等

### 3.2 服务层 (Service Layer)
- **职责**：实现领域服务协议，处理API请求和数据转换
- **依赖**：依赖领域层，不依赖表示层
- **文件位置**：`Sources/Service/`
- **主要组件**：
  - API服务：处理与后端的HTTP通信
  - 仓库实现：实现领域服务协议
  - 语音服务：处理语音识别和文本转语音
  - WebSocket服务：处理实时通信
  - CoreData服务：处理本地数据存储

### 3.3 视图模型层 (ViewModel Layer)
- **职责**：管理视图状态，调用服务层，转换数据格式
- **依赖**：依赖领域层和服务层，不依赖表示层
- **文件位置**：`Sources/ViewModel/`
- **主要组件**：
  - 屏幕ViewModel：对应每个屏幕的状态管理
  - 共享ViewModel：管理跨屏幕的共享状态
  - 状态管理：使用ObservableObject实现响应式状态

### 3.4 表示层 (Presentation Layer)
- **职责**：渲染UI，响应用户交互
- **依赖**：依赖视图模型层，不依赖服务层和领域层
- **文件位置**：`Sources/Presentation/`
- **主要组件**：
  - 屏幕：完整的用户界面屏幕
  - 组件：可复用的UI组件
  - 导航：应用导航管理
  - 资源：颜色、字体、图片等资源定义
  - 工具：视图扩展和动画工具

## 4. 文件命名规范

### 4.1 文件名格式
- **大驼峰命名法**：使用大写字母开头，单词间无分隔符
- **功能明确**：文件名应清晰反映文件的功能
- **分层标识**：根据文件所属层，放置在相应的目录中

### 4.2 示例
- 模型：`User.swift`、`CognitiveModel.swift`
- 协议：`AuthRepository.swift`、`SpeechService.swift`
- 服务实现：`APIAuthRepository.swift`、`SpeechRecognitionService.swift`
- 视图模型：`LoginViewModel.swift`、`CognitiveModelListViewModel.swift`
- 视图：`LoginView.swift`、`CognitiveModelListView.swift`
- 组件：`PrimaryButton.swift`、`CognitiveConceptCard.swift`

## 5. 依赖关系规则

### 5.1 层间依赖
- **表示层** → **视图模型层**：表示层使用视图模型进行状态管理
- **视图模型层** → **服务层**：视图模型调用服务层实现业务逻辑
- **服务层** → **领域层**：服务层实现领域服务协议
- **领域层** → **无外部依赖**：领域层只依赖自身

### 5.2 禁止的依赖
- 领域层依赖外层
- 服务层依赖表示层
- 视图模型层依赖表示层具体实现

## 6. 代码生成规则

### 6.1 生成顺序
1. **领域层**：先实现核心业务模型和协议
2. **服务层**：实现领域服务协议
3. **视图模型层**：实现视图状态管理
4. **表示层**：实现UI组件和屏幕

### 6.2 生成规范
- 严格按照文件结构生成代码
- 每个文件只实现一个明确的功能
- 遵循Swift编码规范
- 为核心代码添加文档注释
- 实现适当的错误处理
- 使用SwiftUI和Combine实现响应式UI
- 遵循单向数据流原则

## 7. 数据流说明

遵循单向数据流原则：
1. 用户与UI交互
2. 视图通知ViewModel
3. ViewModel调用Service层
4. Service层与外部API或本地存储通信
5. Service层返回结果给ViewModel
6. ViewModel更新状态（使用@Published属性）
7. SwiftUI自动更新UI

## 8. 测试策略

- **领域层**：纯单元测试，不依赖外部框架
- **服务层**：使用Mock对象进行集成测试
- **视图模型层**：使用Mock服务进行单元测试
- **表示层**：使用SwiftUI预览和UI测试

## 9. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-10 | 创建完整文件结构文档 | AI Assistant |

## 10. 参考文档

- [前端架构设计](core-docs/architecture-design/frontend-architecture.md)
- [组件设计规范](core-docs/architecture-design/component-design.md)
- [状态管理设计](core-docs/architecture-design/state-management.md)
- [技术栈选型](core-docs/dev-support/tech-stack-selection.md)

## 11. 联系方式和支持

如有任何问题或需要支持，请参考项目的README.md文件或联系项目负责人。