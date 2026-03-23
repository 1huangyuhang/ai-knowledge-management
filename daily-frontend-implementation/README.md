# AI Voice Interaction App - 前端项目

## 项目概述

AI Voice Interaction App是一款基于Swift和SwiftUI开发的iOS应用，与AI认知辅助系统后端配合使用，实现用户与AI系统的语音交互，帮助用户管理和优化认知结构。

## 核心功能

- **语音交互**：支持用户通过语音与AI系统进行交互
- **认知模型可视化**：直观展示用户的认知模型和概念关系
- **多维度分析**：提供用户认知结构的多维度分析结果
- **个性化定制**：允许用户自定义应用的外观和行为
- **历史记录**：保存用户与AI的交互历史

## 技术栈

### 核心技术
- **开发语言**：Swift 5.9+
- **UI框架**：SwiftUI 5.0+
- **语音识别**：Speech Framework
- **网络请求**：URLSession + Async/Await
- **状态管理**：SwiftUI ObservableObject + Environment
- **WebSocket**：URLSessionWebSocketTask
- **数据持久化**：Core Data

### 第三方依赖
| 依赖 | 用途 |
|------|------|
| Alamofire | 网络请求封装 |
| Combine | 响应式编程 |
| SwiftyJSON | JSON解析 |
| SDWebImageSwiftUI | 图片加载与缓存 |
| SwiftLint | 代码质量检查 |

## 架构设计

### 分层架构
```
┌─────────────────┐
│ Presentation   │  # SwiftUI视图层
├─────────────────┤
│ ViewModel      │  # 业务逻辑与状态管理
├─────────────────┤
│ Service        │  # API服务与数据处理
├─────────────────┤
│ Model          │  # 数据模型
└─────────────────┘
```

### 设计原则
- **组件化设计**：将UI拆分为可复用的组件
- **响应式编程**：使用SwiftUI和Combine实现响应式UI
- **单向数据流**：数据从Model流向View，用户交互通过ViewModel处理
- **松耦合**：各层之间通过清晰的接口通信，便于测试和维护

## 项目结构

```
├── daily-frontend-implementation/
│   ├── README.md                # 项目概述
│   ├── SUMMARY.md               # 文档目录
│   ├── 前端页面设计规范.md         # 前端设计规范
│   ├── Sources/                 # 源代码
│   │   ├── AI-Voice-Interaction-App/  # 主应用代码
│   │   └── AI-Voice-Interaction-AppTests/  # 测试代码
│   └── Documentation/           # 其他文档
└── daily-backend-implementation/  # 后端项目（独立目录）
```

## 开发流程

1. **需求分析**：理解产品需求和设计规范
2. **UI设计**：根据设计规范实现UI组件
3. **业务逻辑**：实现ViewModel和Service层
4. **API集成**：与后端API进行集成
5. **测试**：编写单元测试和UI测试
6. **代码审查**：进行代码质量检查和审查
7. **部署**：构建、测试和发布应用

## API集成

前端通过RESTful API与后端进行通信，同时使用WebSocket实现实时数据推送。API契约基于OpenAPI/Swagger规范，确保前后端开发基于同一套API文档。

## 测试策略

- **单元测试**：测试核心业务逻辑
- **UI测试**：测试页面交互和用户流程
- **集成测试**：测试API集成和组件交互
- **性能测试**：测试应用的响应时间和内存使用

## 部署与交付

- **开发环境**：Debug配置
- **测试环境**：Ad Hoc配置
- **生产环境**：Release配置
- **发布平台**：App Store

## 相关文档

- [前端页面设计规范](前端页面设计规范.md) - 详细的前端设计规范
- [后端项目文档](../daily-backend-implementation/SUMMARY.md) - 后端项目文档

## 贡献指南

欢迎对项目提出建议和贡献代码。贡献前请阅读以下指南：

1. 遵循项目的代码规范
2. 编写清晰的提交信息
3. 为新功能添加测试
4. 更新相关文档
5. 提交Pull Request进行代码审查

## 联系方式

如有任何问题或建议，请联系项目团队。

## 版权信息

© 2026 AI认知辅助系统开发团队
