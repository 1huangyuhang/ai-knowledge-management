# 核心文档导航

#文档导航 #系统架构 #技术文档 #索引标签 #项目概览

本目录包含了AI认知辅助系统前端的核心设计和实现文档，按功能模块分类组织。所有文档均遵循MVVM架构和SwiftUI最佳实践，便于系统理解和维护。

### 相关文档

- [开发环境搭建](dev-support/development-environment-setup.md)
- [技术栈选型](dev-support/tech-stack-selection.md)
- [前端项目文档目录](../SUMMARY.md)

## 文档结构

### 1. 架构设计（architecture-design）
- [前端架构设计](architecture-design/frontend-architecture.md) - 前端架构和设计原则
- [组件设计规范](architecture-design/component-design.md) - 组件设计和实现规范
- [状态管理设计](architecture-design/state-management.md) - 状态管理设计和实现

### 2. 核心功能（core-features）
- [语音交互功能设计](core-features/voice-interaction.md) - 语音交互功能的设计和实现
- [认知模型可视化设计](core-features/cognitive-model-visualization.md) - 认知模型可视化的设计和实现
- [多维度分析设计](core-features/multi-dimensional-analysis.md) - 多维度分析功能的设计和实现
- [个性化功能设计](core-features/personalization.md) - 个性化功能的设计和实现
- [API集成规范](core-features/api-integration-spec.md) - 与后端API集成的规范
- [API文档](core-features/api-documentation.md) - 前后端API契约文档
- [WebSocket集成设计](core-features/websocket-integration.md) - WebSocket集成设计和实现

### 3. 开发支持（dev-support）
- [技术栈选型](dev-support/tech-stack-selection.md) - 前端技术栈和依赖管理
- [第三方库使用规范](dev-support/third-party-library-guidelines.md) - 第三方库的使用规范
- [开发环境搭建](dev-support/development-environment-setup.md) - 前端开发环境配置
- [开发流程](dev-support/development-process.md) - 前端开发流程和规范
- [代码规范](dev-support/code-style-guide.md) - 前端代码风格和规范

### 4. 测试与质量（test-quality）
- [测试策略](test-quality/test-strategy.md) - 前端测试策略和方法
- [质量保证计划](test-quality/quality-assurance-plan.md) - 前端质量保证计划

## 索引标签使用

每个文档开头包含索引标签，格式如下：
```
索引标签：#标签1 #标签2 #标签3
```

常用标签：
- #架构设计 - 架构相关文档
- #组件设计 - 组件相关文档
- #状态管理 - 状态管理相关文档
- #语音交互 - 语音交互相关文档
- #认知模型 - 认知模型相关文档
- #可视化 - 可视化相关文档
- #多维度分析 - 多维度分析相关文档
- #个性化 - 个性化相关文档
- #API集成 - API集成相关文档
- #WebSocket - WebSocket相关文档
- #测试 - 测试相关文档
- #开发指南 - 开发指导相关文档

## 更新记录

- 最后更新：2026-01-10
- 文档版本：v1.0
- 维护者：AI认知辅助系统前端开发团队
- 更新内容：
  - 初始创建前端核心文档索引
  - 组织架构设计、核心功能、开发支持和测试与质量文档
  - 添加索引标签使用指南
  - 建立核心文档与阶段文档对应关系

## 核心文档与阶段文档对应关系

- **基础架构搭建**：参考 [第一阶段：基础架构搭建](../phase-1-foundation/)（第1-9天）
  - 第1-3天：项目初始化与基础架构搭建
  - 第4-6天：认证模块开发
  - 第7-9天：认知模型管理模块开发

- **语音交互**：参考 [第二阶段：语音交互模块](../phase-2-voice-interaction/)（第10-12天）
  - 第10天：语音识别功能实现
  - 第11天：文本转语音功能实现
  - 第12天：语音交互流程优化

- **AI对话**：参考 [第三阶段：AI对话模块](../phase-3-ai-conversation/)（第13-15天）
  - 第13天：AI对话界面实现
  - 第14天：AI对话功能实现
  - 第15天：AI对话优化

- **多维度分析**：参考 [第四阶段：多维度分析模块](../phase-4-multi-dimensional-analysis/)（第16-18天）
  - 第16天：多维度分析页面实现
  - 第17天：多维度分析功能实现
  - 第18天：分析结果优化和分享

- **认知模型可视化**：参考 [第五阶段：认知模型可视化模块](../phase-5-cognitive-model-visualization/)（第19-21天）
  - 第19天：认知模型可视化基础实现
  - 第20天：认知模型可视化优化
  - 第21天：认知模型编辑和更新

- **个性化配置**：参考 [第六阶段：个性化配置模块](../phase-6-personalization/)（第22-24天）
  - 第22天：个性化设置页面实现
  - 第23天：个性化设置功能实现
  - 第24天：个性化设置优化

- **WebSocket实时通信**：参考 [第七阶段：WebSocket实时通信模块](../phase-7-websocket/)（第25-27天）
  - 第25天：WebSocket连接实现
  - 第26天：WebSocket事件处理
  - 第27天：WebSocket优化和测试

- **测试、优化和部署**：参考 [第八阶段：测试、优化和部署](../phase-8-testing-optimization/)（第28-30天）
  - 第28天：单元测试和集成测试
  - 第29天：性能优化和bug修复
  - 第30天：部署和发布准备

## 详细文档使用指南

详细了解文档结构和使用技巧，请阅读 [文档编写指南](../DOCUMENTATION_GUIDE.md)
