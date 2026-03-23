# 前端架构设计

索引标签：#架构设计 #SwiftUI #MVVM #Clean Architecture #DDD

## 模块关联索引

### 所属环节
- **阶段**：第一阶段：基础架构搭建
- **周次**：第1周
- **天数**：第2-3天
- **开发主题**：API服务和数据模型、路由和UI组件

### 对应文档
- [第2天：API服务和数据模型](../../phase-1-foundation/week-1-setup/02-api-service-and-models-技术实现.md)
- [第3天：路由和UI组件](../../phase-1-foundation/week-1-setup/03-routing-and-ui-components-技术实现.md)

### 相关核心文档
- [组件设计规范](component-design.md)
- [状态管理设计](state-management.md)
- [技术栈选型](../dev-support/tech-stack-selection.md)

### 关联模块
- [组件设计规范](component-design.md)
- [状态管理设计](state-management.md)

### 依赖关系
- [技术栈选型](../dev-support/tech-stack-selection.md)

## 1. 概述

基于AI认知辅助系统后端，设计开发一款iOS平台的AI Voice Interaction App，实现用户与AI系统的语音交互，帮助用户管理和优化认知结构。

## 2. 架构原则

前端架构遵循与后端一致的**Clean Architecture**和**领域驱动设计(DDD)**原则，确保系统的可维护性、可扩展性和可测试性。

### 2.1 Clean Architecture原则

- **依赖规则**：内层不依赖外层，所有依赖都指向内部
- **关注点分离**：将业务逻辑与基础设施分离
- **可测试性**：核心业务逻辑不依赖外部框架
- **可扩展性**：便于添加新功能和适应变化

### 2.2 领域驱动设计(DDD)原则

- **领域模型**：聚焦核心业务领域
- **统一语言**：与后端保持一致的业务术语
- **边界上下文**：清晰划分业务模块
- **聚合根**：明确领域对象关系

## 3. 技术栈

### 3.1 核心技术
- **开发语言**：Swift 5.9+
- **UI框架**：SwiftUI 5.0+
- **语音识别**：Speech Framework
- **网络请求**：URLSession + Async/Await
- **状态管理**：SwiftUI ObservableObject + Environment
- **WebSocket**：URLSessionWebSocketTask
- **数据持久化**：Core Data

### 2.2 第三方依赖
| 依赖 | 用途 |
|------|------|
| Alamofire | 网络请求封装 |
| Combine | 响应式编程 |
| SwiftyJSON | JSON解析 |
| SDWebImageSwiftUI | 图片加载与缓存 |
| SwiftLint | 代码质量检查 |

## 3. 分层架构

### 3.1 SwiftUI中Clean Architecture的具体实现

前端架构遵循Clean Architecture原则，在SwiftUI中具体实现为以下分层：

```
┌─────────────────┐    # 最外层 - 依赖于内部层
│ Presentation   │    # SwiftUI视图层，仅负责UI渲染
├─────────────────┤
│ ViewModel      │    # 业务逻辑与状态管理，连接视图与服务层
├─────────────────┤
│ Service        │    # 服务层，处理API请求、WebSocket通信和数据处理
├─────────────────┤
│ Domain         │    # 领域层，核心业务逻辑和数据模型
└─────────────────┘    # 最内层 - 不依赖于外部层
```

### 3.2 各层详细实现

#### 3.2.1 Domain层
- **职责**：定义核心业务模型和业务规则
- **实现方式**：使用Swift结构体和协议
- **文件位置**：`Sources/Domain/`
- **示例代码**：
  ```swift
  // 认知模型领域模型
  struct CognitiveModel {
      let id: String
      let userId: String
      let name: String
      let description: String?
      let concepts: [CognitiveConcept]
      let relations: [CognitiveRelation]
      let createdAt: Date
      let updatedAt: Date
  }
  
  // 领域服务协议（不依赖于外部实现）
  protocol CognitiveModelRepository {
      func createModel(_ model: CognitiveModel) async throws -> CognitiveModel
      func getModel(id: String) async throws -> CognitiveModel
      func updateModel(_ model: CognitiveModel) async throws -> CognitiveModel
      func deleteModel(id: String) async throws
      func listModels() async throws -> [CognitiveModel]
  }
  ```

#### 3.2.2 Service层
- **职责**：实现领域服务协议，处理API请求和数据转换
- **实现方式**：使用Swift类，依赖注入领域服务协议
- **文件位置**：`Sources/Service/`
- **示例代码**：
  ```swift
  // API服务实现
  class APICognitiveModelRepository: CognitiveModelRepository {
      private let apiClient: APIClient
      
      init(apiClient: APIClient) {
          self.apiClient = apiClient
      }
      
      func createModel(_ model: CognitiveModel) async throws -> CognitiveModel {
          let request = APIRequest(
              endpoint: "/api/v1/models",
              method: .post,
              body: model
          )
          let response = try await apiClient.send(request)
          return try response.decode(CognitiveModel.self)
      }
      
      // 其他方法实现...
  }
  ```

#### 3.2.3 ViewModel层
- **职责**：管理视图状态，调用领域服务，转换数据格式
- **实现方式**：使用SwiftUI ObservableObject，依赖注入领域服务协议
- **文件位置**：`Sources/ViewModel/`
- **示例代码**：
  ```swift
  // 认知模型列表视图模型
  @MainActor
  class CognitiveModelListViewModel: ObservableObject {
      @Published var models: [CognitiveModel] = []
      @Published var isLoading: Bool = false
      @Published var error: Error?
      
      private let cognitiveModelRepository: CognitiveModelRepository
      
      init(cognitiveModelRepository: CognitiveModelRepository) {
          self.cognitiveModelRepository = cognitiveModelRepository
      }
      
      func loadModels() async {
          isLoading = true
          error = nil
          
          do {
              models = try await cognitiveModelRepository.listModels()
          } catch {
              self.error = error
          } finally {
              isLoading = false
          }
      }
  }
  ```

#### 3.2.4 Presentation层
- **职责**：渲染UI，响应用户交互
- **实现方式**：使用SwiftUI View，依赖注入ViewModel
- **文件位置**：`Sources/Presentation/`
- **示例代码**：
  ```swift
  // 认知模型列表视图
  struct CognitiveModelListView: View {
      @StateObject private var viewModel: CognitiveModelListViewModel
      
      init(viewModel: CognitiveModelListViewModel) {
          _viewModel = StateObject(wrappedValue: viewModel)
      }
      
      var body: some View {
          NavigationStack {
              List(viewModel.models) { model in
                  NavigationLink(value: model) {
                      CognitiveModelRow(model: model)
                  }
              }
              .navigationTitle("认知模型")
              .navigationDestination(for: CognitiveModel.self) {
                  CognitiveModelDetailView(
                      viewModel: CognitiveModelDetailViewModel(
                          model: $0,
                          repository: viewModel.cognitiveModelRepository
                      )
                  )
              }
              .overlay {
                  if viewModel.isLoading {
                      ProgressView()
                  }
              }
              .alert(item: $viewModel.error) {
                  Alert(
                      title: Text("错误"),
                      message: Text($0.localizedDescription),
                      dismissButton: .default(Text("确定"))
                  )
              }
              .task {
                  await viewModel.loadModels()
              }
          }
      }
  }
  ```

### 3.3 依赖注入实现

为了实现Clean Architecture的依赖规则，我们使用依赖注入模式，确保内层不依赖于外层：

- 使用Swift结构体和协议定义领域模型和服务
- 通过构造函数注入依赖，而非直接实例化
- 使用服务定位器或工厂模式简化依赖管理

### 3.4 数据流

遵循单向数据流原则：
1. 用户与UI交互
2. 视图通知ViewModel
3. ViewModel调用Service层
4. Service层与外部API通信并转换数据
5. Service层返回结果给ViewModel
6. ViewModel更新状态
7. SwiftUI自动更新UI

### 3.5 测试策略

- **Domain层**：纯单元测试，不依赖外部框架
- **Service层**：使用Mock API客户端进行集成测试
- **ViewModel层**：使用Mock领域服务进行单元测试
- **Presentation层**：使用SwiftUI预览和UI测试

## 4. 与后端架构对应关系

| 后端分层 | 前端对应层 |
|----------|------------|
| Presentation（API层） | Service层 |
| Application层 | ViewModel层 |
| Domain层 | Model层 |
| Infrastructure层 | Service层 |
| AI Capability层 | Service层 |

## 5. 设计原则

- **组件化设计**：将UI拆分为可复用的组件
- **响应式编程**：使用SwiftUI和Combine实现响应式UI
- **单向数据流**：数据从Model流向View，用户交互通过ViewModel处理
- **松耦合**：各层之间通过清晰的接口通信，便于测试和维护

## 6. 核心数据模型

### 6.1 用户模型
- id: String
- name: String
- email: String
- avatar: String?
- createdAt: Date

### 6.2 认知模型
- id: String
- userId: String
- name: String
- description: String?
- concepts: [CognitiveConcept]
- relations: [CognitiveRelation]
- createdAt: Date
- updatedAt: Date

### 6.3 认知概念
- id: String
- name: String
- description: String?
- importance: Double
- type: String
- createdAt: Date

### 6.4 认知关系
- id: String
- sourceId: String
- targetId: String
- type: String
- strength: Double
- createdAt: Date

### 6.5 分析结果
- id: String
- modelId: String
- analysisType: String
- analysisData: [String: Any]
- dominantTypes: [String: String]
- confidenceScores: [String: Double]
- createdAt: Date
