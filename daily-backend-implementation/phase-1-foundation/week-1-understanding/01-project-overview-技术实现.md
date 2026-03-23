# Day 01: 项目概述与架构设计 - 代码实现文档

## 1. 项目概述

### 1.1 项目目标
- 构建一个认知辅助型AI软件，持续分析用户的认知结构模型
- 基于认知模型给出结构性反馈与思考建议
- 系统关注用户的思考模式、概念结构和认知空洞
- 帮助用户发现思维盲点和认知断裂

### 1.2 核心设计理念
- **Clean Architecture**：采用分层架构设计，确保系统的可维护性和可扩展性
- **Domain First**：认知模型优先于技术选型，业务逻辑与技术实现分离
- **AI作为依赖**：AI是外部能力，不是系统中心，系统核心是认知模型的构建和分析
- **高内聚低耦合**：模块功能单一，依赖关系清晰，便于维护和扩展

## 2. 分层架构设计

### 2.1 四层架构
```
┌──────────────────────────────┐
│ Presentation Layer            │
│  - HTTP API                    │
└───────────────▲──────────────┘
                │
┌───────────────┴──────────────┐
│ Application Layer              │
│  - Use Cases                    │
│  - Workflow Orchestration       │
└───────────────▲──────────────┘
                │
┌───────────────┴──────────────┐
│ Domain Layer                   │
│  - Cognitive Model              │
│  - Business Rules               │
└───────────────▲──────────────┘
                │
┌───────────────┴──────────────┐
│ Infrastructure Layer           │
│  - Persistence                 │
│  - AI Providers                │
│  - Message / Event             │
└───────────────▲──────────────┘
                │
┌───────────────┴──────────────┐
│ AI Capability Layer             │
│  - LLM                          │
│  - Embeddings                   │
│  - Reasoning                    │
└──────────────────────────────┘
```

### 2.2 各层核心职责

#### 2.2.1 Presentation Layer
- 负责接收和响应外部请求
- 处理HTTP请求和响应
- 数据格式转换（DTO）
- 不包含业务逻辑

#### 2.2.2 Application Layer
- 实现业务用例
- 协调Domain层和Infrastructure层
- 管理工作流和事务
- 实现用例之间的协作

#### 2.2.3 Domain Layer
- 核心业务逻辑
- 认知模型定义
- 业务规则和约束
- 实体和值对象

#### 2.2.4 Infrastructure Layer
- 数据持久化
- 外部服务集成
- 事件系统
- 日志和监控

#### 2.2.5 AI Capability Layer
- LLM调用
- 嵌入生成
- 向量搜索
- AI推理

## 3. 核心功能模块

### 3.1 输入模块（Thought Ingestion）
- 接受任意文本输入
- 记录为ThoughtFragment
- 简单HTTP API
- 原始文本存储

### 3.2 认知解析模块（Cognitive Parsing）
- AI提取概念候选
- AI提取潜在关系
- 输出Proposal（不直接生效）
- LLM Prompt Engineering

### 3.3 认知结构建模模块（Cognitive Modeling）
- 接收AI Proposal
- 根据规则更新UserCognitiveModel
- 保证模型一致性
- Domain Service

### 3.4 认知反馈模块（Cognitive Mirror）
- 定期分析认知模型
- 生成结构性反馈
- 核心主题识别
- 思维盲点检测

### 3.5 认知建议模块（Cognitive Coach）
- 基于模型生成“下一步思考建议”
- 不给答案，只给方向
- 个性化推荐
- 建议排序和合理性验证

## 4. 技术栈选型

### 4.1 后端技术栈
- **TypeScript**：类型安全，便于维护和扩展
- **Node.js 18+**：高性能，生态丰富
- **Fastify**：快速、低开销的Web框架
- **TypeORM**：TypeScript ORM框架，支持多种数据库

### 4.2 数据存储
- **SQLite**：轻量级，适合初期开发和测试
- **Qdrant**：向量数据库，用于存储和搜索嵌入向量

### 4.3 AI技术
- **LLM API**：云端模型（如OpenAI API）
- **Embedding API**：生成文本嵌入

### 4.4 开发工具
- **ESLint**：代码质量检查
- **Prettier**：代码格式化
- **Jest**：单元测试
- **Supertest**：API测试
- **Docker**：容器化部署

## 5. 代码结构规划

### 5.1 项目目录结构
```
src/
├── domain/              # 领域层
│   ├── entities/        # 实体
│   ├── value-objects/   # 值对象
│   ├── services/        # 领域服务
│   └── interfaces/      # 领域接口
├── application/         # 应用层
│   ├── usecases/        # 用例
│   ├── dtos/            # 数据传输对象
│   ├── interfaces/      # 应用接口
│   └── events/          # 事件定义
├── infrastructure/      # 基础设施层
│   ├── persistence/     # 数据持久化
│   ├── ai/              # AI服务
│   ├── http/            # HTTP API
│   ├── event-bus/       # 事件总线
│   └── logging/         # 日志系统
├── presentation/        # 表现层
│   ├── controllers/     # 控制器
│   ├── routes/          # 路由
│   └── middleware/      # 中间件
└── shared/              # 共享组件
    ├── utils/           # 工具函数
    ├── errors/          # 错误定义
    └── types/           # 共享类型
```

### 5.2 核心文件规划

#### 5.2.1 Domain层核心文件
- `src/domain/entities/UserCognitiveModel.ts`：用户认知模型实体
- `src/domain/entities/CognitiveConcept.ts`：认知概念实体
- `src/domain/entities/CognitiveRelation.ts`：认知关系实体
- `src/domain/entities/ThoughtFragment.ts`：思维片段实体
- `src/domain/entities/CognitiveProposal.ts`：认知建议实体
- `src/domain/entities/CognitiveInsight.ts`：认知洞察实体
- `src/domain/services/CognitiveModelService.ts`：认知模型服务

#### 5.2.2 Application层核心文件
- `src/application/usecases/IngestThoughtUseCase.ts`：输入思维片段用例
- `src/application/usecases/GenerateProposalUseCase.ts`：生成认知建议用例
- `src/application/usecases/UpdateCognitiveModelUseCase.ts`：更新认知模型用例
- `src/application/usecases/GenerateInsightUseCase.ts`：生成认知洞察用例

#### 5.2.3 Infrastructure层核心文件
- `src/infrastructure/persistence/SQLiteConnection.ts`：SQLite连接
- `src/infrastructure/persistence/Repositories/`：各种仓库实现
- `src/infrastructure/ai/LLMService.ts`：LLM服务
- `src/infrastructure/ai/EmbeddingService.ts`：嵌入服务
- `src/infrastructure/event-bus/EventBusImpl.ts`：事件总线实现
- `src/infrastructure/logging/LoggerImpl.ts`：日志实现

#### 5.2.4 Presentation层核心文件
- `src/presentation/controllers/ThoughtController.ts`：思维片段控制器
- `src/presentation/controllers/ModelController.ts`：认知模型控制器
- `src/presentation/controllers/InsightController.ts`：认知洞察控制器
- `src/presentation/routes/index.ts`：路由定义

## 6. 代码规范与最佳实践

### 6.1 命名规范
- 类名：大驼峰（CognitiveModelService）
- 函数名：小驼峰（ingestThought）
- 变量名：小驼峰（thoughtContent）
- 常量：全大写（MAX_RETRY_ATTEMPTS）
- 接口名：大驼峰，使用I前缀（IThoughtRepository）

### 6.2 代码风格
- 使用TypeScript严格模式
- 遵循ESLint和Prettier规则
- 每个函数都有清晰的JSDoc注释
- 代码结构清晰，避免深度嵌套
- 优先使用接口而非具体类
- 避免魔术数字，使用常量代替

### 6.3 设计原则
- 单一职责原则：每个函数只做一件事
- 开放封闭原则：对扩展开放，对修改封闭
- 依赖倒置原则：依赖抽象，不依赖具体实现
- 里式替换原则：子类可以替换父类
- 接口隔离原则：接口应该小而专一
- 迪米特法则：只与直接朋友通信

## 7. 项目开发规划

### 7.1 第一阶段（第1-30天）：系统地基期
- 目标：架构正确、能跑
- 重点：Domain层设计、Application层用例实现、基础Infrastructure层

### 7.2 第二阶段（第31-60天）：AI融合期
- 目标：AI真正进入系统核心
- 重点：LLM集成、嵌入生成和向量搜索、认知模型演化

### 7.3 第三阶段（第61-90天）：认知辅助成型期
- 目标：系统开始“反过来帮助你思考”
- 重点：认知镜像报告生成、思考建议生成、使用体验优化

## 8. 总结

Day 01的核心任务是理解项目的整体架构和设计理念，为后续开发打下基础。通过学习Clean Architecture和分层架构设计，我们建立了项目开发的整体认知框架。接下来的开发将严格按照这个架构设计进行，确保系统的可维护性、可扩展性和可测试性。

在后续的开发中，我们将逐步实现各个功能模块，从Domain层开始，然后是Application层，最后是Infrastructure层和Presentation层。每个模块的实现都将遵循设计原则和代码规范，确保代码质量和系统的整体一致性。