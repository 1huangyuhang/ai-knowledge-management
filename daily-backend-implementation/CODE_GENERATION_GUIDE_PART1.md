# AI认知辅助系统后端代码生成指导文档 - 第一部分

## 文档说明

### 文档目的
本指导文档用于指导AI根据项目目录结构生成所有代码功能，确保代码生成过程顺利进行，并解决生成过程中可能遇到的上下文中断问题。

### 文档结构
- **第一部分**：项目总览、项目结构、核心功能模块
- **第二部分**：模块关联索引（阶段1：系统地基期）
- **第三部分**：模块关联索引（阶段2-3：AI融合期和认知辅助成型期）
- **第四部分**：代码生成指南、进度跟踪机制、测试生成策略

### 文档使用说明
1. AI应按照文档顺序阅读和执行代码生成任务
2. 每次生成前检查模块的生成状态，从上次中断处继续
3. 生成完成后更新模块状态和生成日志
4. 生成过程中遇到问题可参考相关文档

## 1. 项目总览

### 1.1 项目背景和目标
AI认知辅助系统是一个持续构建、更新、分析用户认知结构模型，并基于该模型给出结构性反馈与思考建议的系统。系统采用Clean Architecture设计理念，将核心业务逻辑与外部依赖分离，确保系统的可维护性和可扩展性。

### 1.2 技术栈
- **后端**：Node.js LTS（≥18）、TypeScript（严格模式）、Fastify、Zod
- **数据库**：SQLite（阶段1）→ PostgreSQL（阶段3）
- **AI能力**：LLM + Embedding（接口封装）
- **认证**：JWT + Apple Authentication
- **测试**：Jest或Vitest

### 1.3 核心功能模块
- **认证模块**：用户注册、登录、Token管理、Apple认证
- **认知模型模块**：创建、查询、更新、删除认知模型
- **思想片段模块**：收集、分析用户思想片段
- **AI对话模块**：与AI进行自然语言对话
- **认知分析模块**：分析用户认知结构
- **洞察生成模块**：生成认知洞察和建议
- **可视化模块**：生成认知模型可视化数据
- **推送通知模块**：Apple推送通知

## 2. 项目结构

### 2.1 目录结构
```
daily-backend-implementation/
├── core-docs/                    # 核心文档目录
│   ├── architecture-design/      # 架构设计文档
│   ├── core-features/            # 核心功能文档
│   ├── deployment-ops/           # 部署运维文档
│   ├── dev-support/             # 开发支持文档
│   ├── doc-management/          # 文档管理文档
│   ├── layered-design/          # 分层设计文档
│   └── test-quality/            # 测试质量文档
├── phase-1-foundation/           # 第一阶段：系统地基期
│   ├── week-1-understanding/    # 第1周：理解与建模
│   ├── week-2-application/      # 第2周：应用层实现
│   ├── week-3-infrastructure/   # 第3周：基础设施层实现
│   └── week-4-minimal-system/   # 第4周：最小系统集成
├── phase-2-ai-integration/      # 第二阶段：AI融合期
│   ├── cognitive-feedback/       # 认知反馈生成
│   ├── cognitive-relation/       # 认知关系推断
│   ├── embedding-vector/         # 嵌入向量处理
│   ├── llm-integration/          # LLM集成
│   ├── model-evolution/          # 认知模型演化
│   └── system-integration-review/# 系统集成与复盘
└── phase-3-cognitive-assistant/  # 第三阶段：认知辅助成型期
    ├── ai-scheduling/            # AI调度
    ├── database/                 # 数据库设计与优化
    ├── deployment-operations/    # 部署与运维
    ├── input-processing/         # 输入处理
    ├── integration-design/       # 集成设计
    ├── suggestion-generation/    # 建议生成
    └── system-optimization/      # 系统优化
```

### 2.2 目录功能说明
- **core-docs**：包含项目的核心文档，如架构设计、核心功能、开发支持等
- **phase-1-foundation**：第一阶段，构建系统基础架构，实现核心领域模型和功能模块
- **phase-2-ai-integration**：第二阶段，集成AI能力，实现认知解析和建议生成
- **phase-3-cognitive-assistant**：第三阶段，优化系统性能，完善用户体验，准备上线部署

## 3. 核心功能模块

### 3.1 认证模块
- **功能**：用户注册、登录、Token管理、Apple认证
- **API**：/api/v1/auth/register, /api/v1/auth/login, /api/v1/auth/refresh, /api/v1/auth/apple/*
- **依赖**：Keycloak或JWT、Apple Authentication API
- **相关文档**：
  - core-docs/core-features/api-design.md
  - core-docs/core-features/apple-authentication.md
  - core-docs/core-features/security-strategy.md

### 3.2 认知模型模块
- **功能**：创建、查询、更新、删除认知模型
- **API**：/api/v1/models, /api/v1/models/{modelId}
- **依赖**：数据库、认证模块
- **相关文档**：
  - core-docs/core-features/api-design.md
  - core-docs/core-features/data-model-definition.md
  - core-docs/layered-design/domain-layer-design.md

### 3.3 思想片段模块
- **功能**：收集、分析用户思想片段
- **API**：/api/v1/thoughts
- **依赖**：数据库、认证模块、认知模型模块
- **相关文档**：
  - core-docs/core-features/api-design.md
  - core-docs/layered-design/domain-layer-design.md

### 3.4 AI对话模块
- **功能**：与AI进行自然语言对话
- **API**：/api/v1/ai-tasks
- **依赖**：数据库、认证模块、AI能力服务
- **相关文档**：
  - core-docs/core-features/api-design.md
  - core-docs/layered-design/ai-capability-layer-design.md

### 3.5 认知分析模块
- **功能**：分析用户认知结构
- **API**：/api/v1/models/{modelId}/analyses
- **依赖**：数据库、认证模块、认知模型模块
- **相关文档**：
  - core-docs/core-features/api-design.md
  - core-docs/core-features/multi-dimensional-analysis-design.md

### 3.6 洞察生成模块
- **功能**：生成认知洞察和建议
- **API**：/api/v1/models/{modelId}/insights, /api/v1/models/{modelId}/suggestions
- **依赖**：数据库、认证模块、认知模型模块、AI能力服务
- **相关文档**：
  - core-docs/core-features/api-design.md
  - core-docs/layered-design/ai-capability-layer-design.md

### 3.7 可视化模块
- **功能**：生成认知模型可视化数据
- **API**：/api/v1/models/{modelId}/visualization
- **依赖**：数据库、认证模块、认知模型模块
- **相关文档**：
  - core-docs/core-features/api-design.md
  - core-docs/core-features/cognitive-model-visualization.md

### 3.8 推送通知模块
- **功能**：Apple推送通知
- **API**：/api/v1/apns/tokens, /api/v1/apns/notifications
- **依赖**：数据库、认证模块、Apple Push Notification Service
- **相关文档**：
  - core-docs/core-features/api-design.md
  - core-docs/core-features/apple-push-notification.md

## 4. 代码生成工具和环境

### 4.1 开发工具
- Node.js 18+
- TypeScript 5.0+
- Fastify 4.0+
- Zod 3.0+

### 4.2 依赖管理
- 使用npm或yarn管理第三方依赖
- 主要依赖：
  - fastify 4.0+
  - zod 3.0+
  - @fastify/jwt
  - @fastify/cors
  - @fastify/swagger

### 4.3 代码规范
- 遵循TypeScript严格模式
- 遵循Clean Architecture设计原则
- 采用ESLint和Prettier进行代码格式化
- 函数和类必须添加JSDoc注释

## 5. 进度跟踪机制

### 5.1 模块生成状态
每个模块包含以下生成状态：
- **未开始**：模块尚未开始生成
- **进行中**：模块正在生成中
- **已完成**：模块生成完成

### 5.2 生成日志格式
```
[生成时间] [模块ID] [模块名称] [生成状态] [详细信息]
```

### 5.3 断点恢复机制
1. AI生成代码前检查模块状态
2. 如状态为"进行中"，检查已生成的文件
3. 从上次中断的文件或函数继续生成
4. 生成完成后更新状态为"已完成"

## 6. 第一部分结束

### 后续内容
- **第二部分**：模块关联索引（阶段1：系统地基期）
- **第三部分**：模块关联索引（阶段2-3：AI融合期和认知辅助成型期）
- **第四部分**：代码生成指南、详细进度跟踪机制、测试生成策略

### 生成提示
AI应继续阅读第二部分文档，按照模块关联索引开始生成代码。