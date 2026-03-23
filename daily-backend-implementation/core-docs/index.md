# 核心文档导航

#文档导航 #系统架构 #技术文档 #索引标签 #项目概览

本目录包含了AI认知辅助系统后端的核心设计和实现文档，按功能模块分类组织。所有文档均遵循Clean Architecture和领域驱动设计(DDD)原则，便于系统理解和维护。

### 相关文档

- [项目概述](dev-support/project-overview.md)
- [系统架构设计](deployment-ops/multi-environment-implementation.md)
- [AI认知辅助系统术语表](terminology.md)

## 文档结构

### 1. 架构设计（architecture-design）
- [苹果后端集成](architecture-design/apple-backend-integration.md) - 苹果后端集成架构设计
- [架构对齐](architecture-design/architecture-alignment.md) - 系统架构对齐设计
- [架构设置指南](architecture-design/architecture-setup-guide.md) - 架构设置和配置指南
- [依赖对齐](architecture-design/dependency-alignment.md) - 依赖管理和对齐
- [功能模块对齐](architecture-design/feature-module-alignment.md) - 功能模块设计和对齐

### 2. 核心功能（core-features）
- [API设计](core-features/api-design.md) - API设计规范和实现
- [API规范](core-features/api-specification.md) - 详细的API规范文档
- [苹果认证](core-features/apple-authentication.md) - Sign in with Apple设计
- [苹果推送通知](core-features/apple-push-notification.md) - APNs集成设计
- [数据模型定义](core-features/data-model-definition.md) - 系统数据模型定义
- [前端集成设计](core-features/frontend-integration-design.md) - 前端与后端集成设计
- [多维度分析设计](core-features/multi-dimensional-analysis-design.md) - 多维度分析功能设计
- [个性化设计](core-features/personalization-design.md) - 个性化定制功能设计
- [安全策略](core-features/security-strategy.md) - 系统安全策略和实现

### 3. 部署与运维（deployment-ops）
- [配置管理](deployment-ops/config-management.md) - 系统配置管理
- [数据迁移指南](deployment-ops/data-migration-guide.md) - 数据迁移流程和指南
- [部署指南](deployment-ops/deployment-guide.md) - 系统部署流程和指南
- [事件处理流程](deployment-ops/incident-handling-process.md) - 事件处理和响应流程
- [日志管理](deployment-ops/logging-management.md) - 日志管理和分析
- [日志系统设计](deployment-ops/logging-system-design.md) - 日志系统架构设计
- [监控配置](deployment-ops/monitoring-configuration.md) - 监控系统配置
- [多环境实现](deployment-ops/multi-environment-implementation.md) - 多环境部署实现
- [性能优化指南](deployment-ops/performance-optimization-guide.md) - 性能优化策略和指南

### 4. 开发支持（dev-support）
- [API使用示例](dev-support/api-usage-examples.md) - API调用示例和最佳实践
- [数据库设计实现](dev-support/database-design-implementation.md) - 数据库设计和实现
- [开发环境设置](dev-support/development-environment-setup.md) - 开发环境搭建指南
- [开发标准](dev-support/development-standards.md) - 开发规范和标准
- [项目概述](dev-support/project-overview.md) - 项目总体概述
- [快速入门指南](dev-support/quick-start-guide.md) - 快速开始开发指南
- [package-json-example](dev-support/package-json-example.md) - package.json配置示例
- [tsconfig-example](dev-support/tsconfig-example.md) - tsconfig.json配置示例

### 5. 开发指南（development-guides）
- [苹果后端开发](development-guides/apple-backend-development.md) - 苹果后端开发指南

### 6. 文档管理（doc-management）
- [文档模板](doc-management/document-template.md) - 文档编写模板
- [文档版本控制](doc-management/document-version-control.md) - 文档版本控制规范

### 7. 集成指南（integration-guides）
- [苹果端到端集成](integration-guides/apple-end-to-end-integration.md) - 苹果端到端集成流程
- [iOS客户端集成](integration-guides/ios-client-integration.md) - iOS客户端集成指南

### 8. 分层设计（layered-design）
- [AI能力层设计](layered-design/ai-capability-layer-design.md) - AI能力层架构设计
- [应用层设计](layered-design/application-layer-design.md) - 应用层业务逻辑设计
- [领域层设计](layered-design/domain-layer-design.md) - 领域层模型和服务设计
- [领域模型设计](layered-design/domain-model-design.md) - 详细的领域模型设计
- [领域服务实现](layered-design/domain-service-implementation.md) - 领域服务实现
- [基础设施层设计](layered-design/infrastructure-layer-design.md) - 基础设施层设计和实现
- [表示层设计](layered-design/presentation-layer-design.md) - 表示层API设计
- [Redis开发指南](layered-design/redis-development-guide.md) - Redis使用和开发指南
- [仓库接口定义](layered-design/repository-interface-definition.md) - 仓库接口设计
- [WebSocket服务设计](layered-design/websocket-service-design.md) - WebSocket服务设计

### 9. 测试与质量（test-quality）
- [质量保证计划](test-quality/quality-assurance-plan.md) - 质量保证计划
- [测试用例](test-quality/test-cases.md) - 系统测试用例
- [测试策略](test-quality/test-strategy.md) - 测试策略和方法

### 10. 测试（testing）
- [苹果后端测试策略](testing/apple-backend-testing-strategy.md) - 苹果后端测试策略

### 11. 术语表
- [AI认知辅助系统术语表](terminology.md) - 系统核心术语定义

## 索引标签使用

每个文档开头包含索引标签，格式如下：
```
索引标签：#标签1 #标签2 #标签3
```

常用标签：
- #架构设计 - 架构相关文档
- #苹果集成 - 苹果生态相关文档
- #API设计 - API相关文档
- #分层设计 - 分层架构相关文档
- #部署运维 - 部署和运维相关文档
- #测试 - 测试相关文档
- #开发指南 - 开发指导相关文档

## 更新记录

- 最后更新：2026-01-10
- 文档版本：v1.1
- 维护者：AI认知辅助系统开发团队
- 更新内容：
  - 添加缺失的文档分类和完整文档列表
  - 优化文档结构和排序
  - 增强文档间的关联和索引
  - 添加索引标签使用指南
  - 修复重复内容

## 核心文档与阶段文档对应关系

- **基础架构搭建**：参考 [第一阶段：系统地基期](../phase-1-foundation/)
- **核心功能实现**：参考 [第一阶段：系统地基期](../phase-1-foundation/)
- **AI能力集成**：参考 [第二阶段：AI融合期](../phase-2-ai-integration/)
- **API开发与测试**：参考 [第二阶段：AI融合期](../phase-2-ai-integration/)
- **部署与运维**：参考 [第三阶段：认知辅助成型期](../phase-3-cognitive-assistant/)
- **系统优化**：参考 [第三阶段：认知辅助成型期](../phase-3-cognitive-assistant/)

## 详细文档使用指南

详细了解文档结构和使用技巧，请阅读 [文档使用指南](../../DOCUMENTATION_GUIDE.md)