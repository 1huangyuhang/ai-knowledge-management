# 前端项目文档目录

## 快速导航

> **提示**：快速导航提供了文档的整体结构概览，详细内容请查看下方完整目录

### 核心文档
- [前端页面设计规范](前端页面设计规范.md) - iOS App前端设计规范
- [核心文档索引](core-docs/index.md) - 前端项目核心文档索引
- [开发规划文档](frontend-development-plan.md) - 30天前端开发规划

## 文档结构

### 1. 架构设计
- [前端架构设计](core-docs/architecture-design/frontend-architecture.md) - 前端架构和设计原则
- [组件设计规范](core-docs/architecture-design/component-design.md) - 组件设计和实现规范
- [状态管理设计](core-docs/architecture-design/state-management.md) - 状态管理设计和实现

### 2. 核心功能
- [语音交互功能设计](core-docs/core-features/voice-interaction.md) - 语音交互功能的设计和实现
- [认知模型可视化设计](core-docs/core-features/cognitive-model-visualization.md) - 认知模型可视化的设计和实现
- [多维度分析设计](core-docs/core-features/multi-dimensional-analysis.md) - 多维度分析功能的设计和实现
- [个性化功能设计](core-docs/core-features/personalization.md) - 个性化功能的设计和实现

### 3. 技术栈
- [技术栈选型](core-docs/dev-support/tech-stack-selection.md) - 前端技术栈和依赖管理
- [第三方库使用规范](core-docs/dev-support/third-party-library-guidelines.md) - 第三方库的使用规范

### 4. 开发指南
- [开发环境搭建](core-docs/dev-support/development-environment-setup.md) - 前端开发环境配置
- [开发流程](core-docs/dev-support/development-process.md) - 前端开发流程和规范
- [代码规范](core-docs/dev-support/code-style-guide.md) - 前端代码风格和规范

### 5. API集成
- [API集成规范](core-docs/core-features/api-integration-spec.md) - 与后端API集成的规范
- [API文档](core-docs/core-features/api-documentation.md) - 前后端API契约文档
- [WebSocket集成设计](core-docs/core-features/websocket-integration.md) - WebSocket集成设计和实现

### 6. 测试与质量
- [测试策略](core-docs/test-quality/test-strategy.md) - 前端测试策略和方法
- [质量保证计划](core-docs/test-quality/quality-assurance-plan.md) - 前端质量保证计划

### 7. 30天技术实现文档

#### 第一阶段：基础架构搭建（第1-9天）

##### 第1周：项目初始化与基础架构
- [第1天：项目初始化](phase-1-foundation/week-1-setup/01-project-initialization-技术实现.md) - 初始化iOS项目，配置开发环境
- [第2天：API服务和数据模型](phase-1-foundation/week-1-setup/02-api-service-and-models-技术实现.md) - 实现API服务层和数据模型
- [第3天：路由和UI组件](phase-1-foundation/week-1-setup/03-routing-and-ui-components-技术实现.md) - 实现路由管理和基础UI组件

##### 第2周：认证模块开发
- [第4天：登录功能实现](phase-1-foundation/week-2-auth/04-login-implementation-技术实现.md) - 实现用户登录功能
- [第5天：注册功能实现](phase-1-foundation/week-2-auth/05-register-implementation-技术实现.md) - 实现用户注册功能
- [第6天：认证状态管理](phase-1-foundation/week-2-auth/06-auth-state-management-技术实现.md) - 实现认证状态管理和路由守卫

##### 第3周：认知模型管理
- [第7天：认知模型列表实现](phase-1-foundation/week-3-cognitive-model/07-cognitive-model-list-技术实现.md) - 实现认知模型列表功能
- [第8天：认知模型详情实现](phase-1-foundation/week-3-cognitive-model/08-cognitive-model-detail-技术实现.md) - 实现认知模型详情功能
- [第9天：认知模型创建和编辑](phase-1-foundation/week-3-cognitive-model/09-cognitive-model-create-edit-技术实现.md) - 实现认知模型创建和编辑功能

#### 第二阶段：语音交互模块（第10-12天）

##### 第4周：语音交互
- [第10天：语音识别功能实现](phase-2-voice-interaction/week-4-voice/10-speech-recognition-技术实现.md) - 实现语音转文本功能
- [第11天：文本转语音功能实现](phase-2-voice-interaction/week-4-voice/11-text-to-speech-技术实现.md) - 实现文本转语音功能
- [第12天：语音交互流程优化](phase-2-voice-interaction/week-4-voice/12-voice-interaction-optimization-技术实现.md) - 优化语音交互流程和用户体验

#### 第三阶段：AI对话模块（第13-15天）

##### 第5周：AI对话
- [第13天：AI对话界面实现](phase-3-ai-conversation/week-5-ai-conversation/13-ai-conversation-ui-技术实现.md) - 实现AI对话界面
- [第14天：AI对话功能实现](phase-3-ai-conversation/week-5-ai-conversation/14-ai-conversation-functionality-技术实现.md) - 实现AI对话功能
- [第15天：AI对话优化](phase-3-ai-conversation/week-5-ai-conversation/15-ai-conversation-optimization-技术实现.md) - 优化AI对话功能和用户体验

#### 第四阶段：多维度分析模块（第16-18天）

##### 第6周：多维度分析
- [第16天：多维度分析页面实现](phase-4-multi-dimensional-analysis/week-6-analysis/16-multi-dimensional-analysis-ui-技术实现.md) - 实现多维度分析页面
- [第17天：多维度分析功能实现](phase-4-multi-dimensional-analysis/week-6-analysis/17-multi-dimensional-analysis-functionality-技术实现.md) - 实现多维度分析功能
- [第18天：分析结果优化和分享](phase-4-multi-dimensional-analysis/week-6-analysis/18-analysis-result-optimization-技术实现.md) - 优化分析结果展示和分享功能

#### 第五阶段：认知模型可视化模块（第19-21天）

##### 第7周：认知模型可视化
- [第19天：认知模型可视化基础实现](phase-5-cognitive-model-visualization/week-7-visualization/19-cognitive-model-visualization-basic-技术实现.md) - 实现认知模型可视化的基础功能
- [第20天：认知模型可视化优化](phase-5-cognitive-model-visualization/week-7-visualization/20-cognitive-model-visualization-optimization-技术实现.md) - 优化认知模型可视化的效果和交互
- [第21天：认知模型编辑和更新](phase-5-cognitive-model-visualization/week-7-visualization/21-cognitive-model-editing-技术实现.md) - 实现认知模型的可视化编辑和更新

#### 第六阶段：个性化配置模块（第22-24天）

##### 第8周：个性化配置
- [第22天：个性化设置页面实现](phase-6-personalization/week-8-personalization/22-personalization-settings-page-技术实现.md) - 实现个性化设置页面
- [第23天：个性化设置功能实现](phase-6-personalization/week-8-personalization/23-personalization-settings-functionality-技术实现.md) - 实现个性化设置功能
- [第24天：个性化设置优化](phase-6-personalization/week-8-personalization/24-personalization-settings-optimization-技术实现.md) - 优化个性化设置的体验和功能

#### 第七阶段：WebSocket实时通信模块（第25-27天）

##### 第9周：WebSocket实时通信
- [第25天：WebSocket连接实现](phase-7-websocket/week-9-websocket/25-websocket-connection-技术实现.md) - 实现WebSocket连接管理
- [第26天：WebSocket事件处理](phase-7-websocket/week-9-websocket/26-websocket-event-handling-技术实现.md) - 实现WebSocket事件的处理
- [第27天：WebSocket优化和测试](phase-7-websocket/week-9-websocket/27-websocket-optimization-and-testing-技术实现.md) - 优化WebSocket通信和测试

#### 第八阶段：测试、优化和部署（第28-30天）

##### 第10周：测试、优化和部署
- [第28天：单元测试和集成测试](phase-8-testing-optimization/week-10-testing/28-unit-testing-and-integration-testing-技术实现.md) - 编写和运行测试
- [第29天：性能优化和bug修复](phase-8-testing-optimization/week-10-testing/29-performance-optimization-and-bug-fixing-技术实现.md) - 优化应用性能和修复bug
- [第30天：部署和发布准备](phase-8-testing-optimization/week-10-testing/30-deployment-and-release-preparation-技术实现.md) - 准备应用部署和发布

### 8. 文档管理
- [文档编写指南](DOCUMENTATION_GUIDE.md) - 文档编写规范和模板
- [文档链接检查脚本](check-docs.sh) - 用于检查文档链接有效性的脚本

## 相关链接

- [后端项目文档](../daily-backend-implementation/SUMMARY.md) - 后端项目文档目录