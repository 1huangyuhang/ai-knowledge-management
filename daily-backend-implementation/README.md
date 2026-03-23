# AI认知辅助系统后端实现文档

本目录包含了AI认知辅助系统后端的完整实现文档，按开发阶段和功能模块组织。

## 项目概述

AI认知辅助系统是一个持续构建、更新、分析用户认知结构模型，并基于该模型给出结构性反馈与思考建议的系统。系统采用Clean Architecture设计理念，将核心业务逻辑与外部依赖分离，确保系统的可维护性和可扩展性。

## 目录结构

### 1. 核心文档（core-docs）
核心设计和实现文档，按功能模块分类组织。

- **architecture-design**: 架构设计相关文档，包括架构对齐、依赖对齐和功能模块对齐
- **core-features**: 核心功能设计文档，包括API设计、数据模型定义和安全策略
- **deployment-ops**: 部署与运维文档，包括配置管理、日志管理和多环境实现
- **dev-support**: 开发支持文档，包括开发环境设置、API使用示例和项目概述
- **doc-management**: 文档管理规范，包括文档模板和版本控制
- **layered-design**: 分层设计文档，包括各层设计和实现指南
- **test-quality**: 测试与质量保证文档，包括测试策略和质量保证计划
- **术语表**: AI认知辅助系统的关键术语和概念解释

### 2. 第一阶段：系统地基期（phase-1-foundation）
**核心目标**：构建系统基础架构，实现核心领域模型和功能模块
**时间范围**：第1-30天
**技术要点**：Clean Architecture、TypeScript、Fastify、SQLite

#### 主要功能实现
- 领域模型设计与实现（UserCognitiveModel、CognitiveConcept等）
- Application层用例实现（Ingest Thought、Generate Proposal等）
- Infrastructure层实现（数据库连接、Repository实现等）
- 最小系统集成与测试

#### 关键文档
- [领域层设计](core-docs/layered-design/domain-layer-design.md)
- [应用层设计](core-docs/layered-design/application-layer-design.md)
- [基础设施层设计](core-docs/layered-design/infrastructure-layer-design.md)
- [数据库连接实现](phase-1-foundation/week-3-infrastructure/15-database-connection.md)

#### 周计划
- **week-1-understanding**: 理解与建模，定义领域实体和关系
- **week-2-application**: Application层实现，编写核心用例
- **week-3-infrastructure**: Infrastructure层实现，集成数据库和外部服务
- **week-4-minimal-system**: 最小系统跑通，实现完整的功能流程

### 3. 第二阶段：AI融合期（phase-2-ai-integration）
**核心目标**：集成AI能力，实现认知解析和建议生成
**时间范围**：第31-60天
**技术要点**：LLM集成、嵌入向量、认知解析、向量数据库

#### 主要功能实现
- LLM客户端集成与API调用
- 嵌入向量生成与存储
- 认知关系推断与置信度评分
- 认知模型演化与一致性维护
- AI生成内容验证与结构化输出

#### 关键文档
- [AI能力层设计](core-docs/layered-design/ai-capability-layer-design.md)
- [LLM客户端实现](phase-2-ai-integration/llm-integration/31-llm-client.md)
- [嵌入服务实现](phase-2-ai-integration/embedding-vector/36-embedding-service.md)
- [认知解析器实现](phase-2-ai-integration/cognitive-relation/41-cognitive-parser.md)

#### 功能模块
- **llm-integration**: LLM集成，包括客户端、Prompt设计和API调用
- **embedding-vector**: 嵌入向量处理，包括向量生成、存储和相似度搜索
- **cognitive-relation**: 认知关系推断，包括关系识别、置信度评分和结构验证
- **model-evolution**: 认知模型演化，包括模型更新、版本管理和演化分析
- **cognitive-feedback**: 认知反馈生成，包括洞察生成、主题分析和盲点检测
- **system-integration-review**: 系统集成与复盘，包括模块集成、测试和优化

### 4. 第三阶段：认知辅助成型期（phase-3-cognitive-assistant）
**核心目标**：优化系统性能，完善用户体验，准备上线部署
**时间范围**：第61-90天
**技术要点**：PostgreSQL数据库、Apple服务集成、多输入处理、AI调度、系统优化

#### 主要功能实现
- 文件和语音输入处理
- AI资源调度与管理
- PostgreSQL数据库设计与优化
- Docker容器化部署
- Apple认证与推送通知集成
- 系统性能测试与优化

#### 关键文档
- [Docker部署实现](phase-3-cognitive-assistant/deployment-operations/81-docker-deployment.md)
- [数据库优化设计](phase-3-cognitive-assistant/database/pre-implementation/96-database-design-technical-implementation.md)
- [文件处理实现](phase-3-cognitive-assistant/input-processing/91-file-processing-technical-implementation.md)
- [系统优化指南](core-docs/deployment-ops/performance-optimization-guide.md)

#### 功能模块
- **input-processing**: 输入处理，包括文件处理和语音处理
- **ai-scheduling**: AI调度，管理和调度AI资源使用
- **database**: 数据库设计与优化，包括监控、备份恢复和性能优化
- **deployment-operations**: 部署与运维，包括Docker部署、监控告警和可扩展性设计
- **integration-design**: 集成设计，包括综合系统设计
- **suggestion-generation**: 建议生成，包括建议逻辑实现
- **system-optimization**: 系统优化，包括性能优化和系统稳定性改进

## 如何使用这些文档

1. **按阶段阅读**：从第一阶段开始，逐步了解系统的构建过程
2. **按功能查阅**：根据需要查找特定功能模块的实现文档
3. **核心文档优先**：先阅读core-docs目录下的设计文档，了解系统整体架构
4. **术语表参考**：遇到不熟悉的术语，可参考术语表获取解释
5. **导航使用**：通过SUMMARY.md或core-docs/index.md的导航快速定位所需文档
6. **参考文档使用指南**：详细了解文档结构和使用技巧，请阅读[文档使用指南](DOCUMENTATION_GUIDE.md)

## 快速开始

### 环境要求

- Node.js LTS (≥18)
- npm 或 yarn
- SQLite (阶段1)

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制示例环境变量文件并根据需要修改：

```bash
cp .env.example .env
```

### 启动开发服务器

```bash
npm run dev
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## API 概述

### 主要API端点

- **认证**：`/api/v1/auth/*` - 登录、注册、Token刷新
- **认知模型**：`/api/v1/models/*` - 创建、查询、更新认知模型
- **思想片段**：`/api/v1/thoughts/*` - 创建、查询思想片段
- **AI任务**：`/api/v1/ai-tasks/*` - AI生成提案、分析关系

## 核心功能

1. **认知模型管理**：创建、查询、更新用户认知模型
2. **思想片段处理**：收集和分析用户思想片段
3. **AI辅助分析**：使用LLM生成认知提案和分析关系
4. **认知洞察生成**：生成认知洞察和建议
5. **模型可视化**：生成认知模型可视化数据

## 技术栈

- **核心框架**：Node.js LTS, TypeScript, Fastify
- **数据库**：SQLite (阶段1) → PostgreSQL (阶段3)
- **AI能力**：LLM + Embedding (接口封装)
- **认证**：JWT + Apple Authentication
- **测试**：Jest
- **日志**：Pino
- **容器化**：Docker

## 项目结构

```
daily-backend-implementation/
├── src/                   # 源代码目录
│   ├── presentation/      # 表示层 - 处理外部请求和响应
│   ├── application/       # 应用层 - 协调各层交互
│   ├── domain/            # 领域层 - 核心业务逻辑
│   ├── infrastructure/    # 基础设施层 - 外部依赖实现
│   ├── ai/                # AI能力层 - AI相关功能
│   ├── common/            # 公共工具和常量
│   ├── di/                # 依赖注入配置
│   └── index.ts           # 应用入口文件
├── __tests__/             # 测试目录
│   ├── unit/              # 单元测试
│   └── integration/       # 集成测试
├── core-docs/             # 核心文档目录
├── phase-1-foundation/    # 阶段1：系统地基期文档
├── phase-2-ai-integration/ # 阶段2：AI融合期文档
├── phase-3-cognitive-assistant/ # 阶段3：认知辅助成型期文档
└── ...                    # 配置文件和其他文档
```

## 文档命名规范

- **阶段目录**：phase-[数字]-[描述]
- **周目录**：week-[数字]-[描述]
- **功能目录**：[功能]-[描述]
- **文档文件**：[编号]-[功能]-[类型].md

## 贡献指南

1. 所有文档使用Markdown格式
2. 遵循统一的命名规范
3. 保持文档内容的准确性和完整性
4. 定期更新文档，确保与代码同步

## 版本历史

| 版本 | 日期 | 描述 |
|------|------|------|
| v1.1 | 2026-01-10 | 更新文档，添加Apple服务集成和PostgreSQL数据库相关信息 |
| v1.0 | 2026-01-09 | 初始版本，包含所有开发阶段的实现文档 |

## 联系我们

如有任何问题或建议，请联系AI认知辅助系统开发团队。