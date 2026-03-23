# AI认知辅助系统后端完整文件结构

## 1. 文档说明

### 1.1 文档目的
本文档详细描述AI认知辅助系统后端的完整文件结构，遵循Clean Architecture设计原则，确保各层之间的依赖关系和职责清晰。该文档将作为AI生成代码的参考，确保生成的代码符合整体架构设计，不偏离系统结构。

### 1.2 架构原则
- **Clean Architecture**：严格遵循分层架构，内层不依赖外层
- **依赖倒置**：高层模块不依赖低层模块，两者都依赖抽象
- **单一职责**：每个文件和模块只负责一个明确的功能
- **接口分离**：使用接口定义模块间的通信
- **高内聚、低耦合**：模块内部高度相关，模块间松耦合

## 2. 完整文件结构

```
daily-backend-implementation/
├── src/                               # 源代码目录
│   ├── presentation/                  # 表示层 - 处理外部请求和响应
│   │   ├── controllers/               # API控制器
│   │   │   ├── auth.controller.ts     # 认证相关API
│   │   │   ├── cognitive.controller.ts # 认知模型相关API
│   │   │   ├── thought.controller.ts  # 思想片段相关API
│   │   │   ├── ai-task.controller.ts  # AI任务相关API
│   │   │   └── index.ts               # 控制器导出
│   │   ├── middlewares/               # 中间件
│   │   │   ├── auth.middleware.ts     # 认证中间件
│   │   │   ├── error.middleware.ts    # 错误处理中间件
│   │   │   ├── logger.middleware.ts   # 日志中间件
│   │   │   └── validation.middleware.ts # 请求验证中间件
│   │   └── routes/                    # 路由定义
│   │       ├── auth.routes.ts         # 认证路由
│   │       ├── cognitive.routes.ts    # 认知模型路由
│   │       ├── thought.routes.ts      # 思想片段路由
│   │       ├── ai-task.routes.ts      # AI任务路由
│   │       └── index.ts               # 路由注册
│   ├── application/                   # 应用层 - 协调各层交互
│   │   ├── services/                  # 应用服务
│   │   │   ├── auth.service.ts        # 认证服务
│   │   │   ├── cognitive.service.ts   # 认知模型服务
│   │   │   ├── thought.service.ts     # 思想片段服务
│   │   │   ├── ai-task.service.ts     # AI任务服务
│   │   │   └── index.ts               # 服务导出
│   │   ├── use-cases/                 # 业务用例
│   │   │   ├── auth/                  # 认证用例
│   │   │   │   ├── login.use-case.ts  # 登录用例
│   │   │   │   ├── register.use-case.ts # 注册用例
│   │   │   │   └── refresh-token.use-case.ts # 刷新Token用例
│   │   │   ├── cognitive/             # 认知模型用例
│   │   │   │   ├── create-model.use-case.ts # 创建认知模型用例
│   │   │   │   ├── update-model.use-case.ts # 更新认知模型用例
│   │   │   │   ├── get-model.use-case.ts # 获取认知模型用例
│   │   │   │   └── analyze-model.use-case.ts # 分析认知模型用例
│   │   │   ├── thought/               # 思想片段用例
│   │   │   │   ├── create-thought.use-case.ts # 创建思想片段用例
│   │   │   │   └── get-thoughts.use-case.ts # 获取思想片段用例
│   │   │   └── ai/                    # AI相关用例
│   │   │       ├── generate-proposal.use-case.ts # 生成建议用例
│   │   │       └── analyze-relation.use-case.ts # 分析关系用例
│   │   └── workflows/                 # 工作流编排
│   │       └── cognitive-model.workflow.ts # 认知模型处理工作流
│   ├── domain/                        # 领域层 - 核心业务逻辑
│   │   ├── entities/                  # 领域实体
│   │   │   ├── user.ts                # 用户实体
│   │   │   ├── cognitive-model.ts     # 认知模型实体
│   │   │   ├── cognitive-concept.ts   # 认知概念实体
│   │   │   ├── cognitive-relation.ts  # 认知关系实体
│   │   │   ├── thought-fragment.ts    # 思想片段实体
│   │   │   └── cognitive-insight.ts   # 认知洞察实体
│   │   ├── repositories/              # 仓库接口定义
│   │   │   ├── user-repository.ts     # 用户仓库接口
│   │   │   ├── cognitive-model-repository.ts # 认知模型仓库接口
│   │   │   ├── thought-fragment-repository.ts # 思想片段仓库接口
│   │   │   └── cognitive-insight-repository.ts # 认知洞察仓库接口
│   │   ├── value-objects/             # 值对象
│   │   │   ├── email.ts               # 邮箱值对象
│   │   │   ├── password.ts            # 密码值对象
│   │   │   ├── uuid.ts                # UUID值对象
│   │   │   └── cognitive-relation-type.ts # 认知关系类型值对象
│   │   ├── enums/                     # 枚举类型
│   │   │   ├── user-role.enum.ts      # 用户角色枚举
│   │   │   ├── cognitive-relation-type.enum.ts # 认知关系类型枚举
│   │   │   └── ai-task-status.enum.ts # AI任务状态枚举
│   │   └── errors/                    # 领域错误
│   │       ├── domain-error.ts        # 领域错误基类
│   │       ├── auth-error.ts          # 认证相关错误
│   │       └── cognitive-error.ts     # 认知模型相关错误
│   ├── infrastructure/                # 基础设施层 - 外部依赖实现
│   │   ├── config/                    # 配置管理
│   │   │   ├── config.service.ts      # 配置服务接口
│   │   │   └── environment-config.service.ts # 环境变量配置实现
│   │   ├── database/                  # 数据库相关
│   │   │   ├── connection/            # 数据库连接
│   │   │   │   ├── sqlite.connection.ts # SQLite连接
│   │   │   │   └── postgresql.connection.ts # PostgreSQL连接
│   │   │   ├── repositories/          # 仓库实现
│   │   │   │   ├── user-repository-implementation.ts # 用户仓库实现
│   │   │   │   ├── cognitive-model-repository-implementation.ts # 认知模型仓库实现
│   │   │   │   ├── thought-fragment-repository-implementation.ts # 思想片段仓库实现
│   │   │   │   └── cognitive-insight-repository-implementation.ts # 认知洞察仓库实现
│   │   │   ├── migrations/            # 数据库迁移
│   │   │   │   ├── 001-create-users.ts # 创建用户表
│   │   │   │   ├── 002-create-cognitive-models.ts # 创建认知模型表
│   │   │   │   └── index.ts           # 迁移导出
│   │   │   └── models/                # 数据库模型定义
│   │   │       ├── user.model.ts      # 用户模型
│   │   │       ├── cognitive-model.model.ts # 认知模型模型
│   │   │       └── thought-fragment.model.ts # 思想片段模型
│   │   ├── logging/                   # 日志系统
│   │   │   ├── logger.service.ts      # 日志服务接口
│   │   │   └── pino-logger.service.ts # Pino日志实现
│   │   ├── external/                  # 外部服务集成
│   │   │   ├── apple/                 # Apple服务集成
│   │   │   │   ├── apple-auth.service.ts # Apple认证服务
│   │   │   │   └── apple-push.service.ts # Apple推送服务
│   │   │   └── redis/                 # Redis集成
│   │   │       └── redis.service.ts   # Redis服务
│   │   └── cache/                     # 缓存实现
│   │       ├── cache.service.ts       # 缓存服务接口
│   │       ├── redis-cache.service.ts # Redis缓存实现
│   │       └── memory-cache.service.ts # 内存缓存实现
│   ├── ai/                            # AI能力层 - AI相关功能
│   │   ├── llm/                       # 大语言模型集成
│   │   │   ├── llm.client.ts          # LLM客户端接口
│   │   │   ├── openai.client.ts       # OpenAI客户端实现
│   │   │   ├── prompt/                # Prompt设计
│   │   │   │   ├── cognitive-parser.prompt.ts # 认知解析Prompt
│   │   │   │   └── insight-generator.prompt.ts # 洞察生成Prompt
│   │   │   └── retry/                 # 重试机制
│   │   │       └── retry.strategy.ts  # 重试策略
│   │   ├── embedding/                 # 嵌入向量服务
│   │   │   ├── embedding.service.ts   # 嵌入服务接口
│   │   │   ├── openai-embedding.service.ts # OpenAI嵌入服务实现
│   │   │   └── qdrant/                # Qdrant向量数据库集成
│   │   │       ├── qdrant.client.ts   # Qdrant客户端
│   │   │       └── vector-repository.ts # 向量仓库
│   │   └── cognitive/                 # 认知分析算法
│   │       ├── cognitive-parser.ts    # 认知解析器
│   │       ├── relation-inference.ts  # 关系推断
│   │       ├── confidence-scoring.ts  # 置信度评分
│   │       └── structure-validation.ts # 结构验证
│   ├── common/                        # 公共工具和常量
│   │   ├── constants/                 # 常量定义
│   │   │   ├── auth.constants.ts      # 认证相关常量
│   │   │   ├── ai.constants.ts        # AI相关常量
│   │   │   └── database.constants.ts  # 数据库相关常量
│   │   ├── utils/                     # 工具函数
│   │   │   ├── jwt.utils.ts           # JWT工具
│   │   │   ├── password.utils.ts      # 密码工具
│   │   │   ├── date.utils.ts          # 日期工具
│   │   │   └── validation.utils.ts    # 验证工具
│   │   └── types/                     # 公共类型定义
│   │       ├── api.types.ts           # API相关类型
│   │       └── common.types.ts        # 公共类型
│   ├── di/                            # 依赖注入配置
│   │   └── container.ts               # 依赖注入容器配置
│   └── index.ts                       # 应用入口文件
├── __tests__/                         # 测试目录
│   ├── unit/                          # 单元测试
│   │   ├── domain/                    # 领域层测试
│   │   │   ├── entities/              # 实体测试
│   │   │   └── services/              # 领域服务测试
│   │   ├── application/               # 应用层测试
│   │   │   └── use-cases/             # 用例测试
│   │   └── common/                    # 公共工具测试
│   └── integration/                   # 集成测试
│       ├── api/                       # API集成测试
│       └── database/                  # 数据库集成测试
├── core-docs/                         # 核心文档目录
│   ├── architecture-design/           # 架构设计文档
│   ├── core-features/                 # 核心功能文档
│   ├── deployment-ops/                # 部署运维文档
│   ├── dev-support/                   # 开发支持文档
│   ├── layered-design/                # 分层设计文档
│   └── test-quality/                  # 测试质量文档
├── phase-1-foundation/                # 阶段1：系统地基期文档
│   ├── week-1-understanding/         # 第1周：理解与建模
│   ├── week-2-application/           # 第2周：应用层实现
│   ├── week-3-infrastructure/        # 第3周：基础设施层实现
│   └── week-4-minimal-system/        # 第4周：最小系统集成
├── phase-2-ai-integration/           # 阶段2：AI融合期文档
│   ├── cognitive-feedback/            # 认知反馈生成
│   ├── cognitive-relation/            # 认知关系推断
│   ├── embedding-vector/              # 嵌入向量处理
│   ├── llm-integration/               # LLM集成
│   ├── model-evolution/               # 认知模型演化
│   └── system-integration-review/     # 系统集成与复盘
├── phase-3-cognitive-assistant/       # 阶段3：认知辅助成型期文档
│   ├── ai-scheduling/                 # AI调度
│   ├── database/                      # 数据库设计与优化
│   ├── deployment-operations/         # 部署与运维
│   ├── input-processing/              # 输入处理
│   ├── integration-design/            # 集成设计
│   ├── suggestion-generation/         # 建议生成
│   └── system-optimization/           # 系统优化
├── CODE_GENERATION_GUIDE_PART1.md     # 代码生成指导 - 第一部分
├── CODE_GENERATION_GUIDE_PART2.md     # 代码生成指导 - 第二部分
├── CODE_GENERATION_GUIDE_PART3.md     # 代码生成指导 - 第三部分
├── CODE_GENERATION_GUIDE_PART4.md     # 代码生成指导 - 第四部分
├── CODE_GENERATION_PROGRESS.md        # 代码生成进度跟踪
├── COMPLETE_FILE_STRUCTURE.md         # 完整文件结构文档（本文件）
├── DOCUMENTATION_GUIDE.md             # 文档编写指南
├── README.md                          # 项目说明文档
├── SUMMARY.md                         # 项目总结文档
├── check-docs.sh                      # 文档检查脚本
├── code-generation-log.md             # 代码生成日志
├── code-generation-progress.json      # 代码生成进度JSON
├── tsconfig.json                      # TypeScript配置
├── package.json                       # 项目依赖配置
├── package-lock.json                  # 依赖锁定文件
├── .env.example                       # 环境变量示例
├── .env.development                   # 开发环境变量
├── .env.production                    # 生产环境变量
├── .eslintrc.json                     # ESLint配置
├── .prettierrc                        # Prettier配置
└── Dockerfile                         # Docker构建文件
```

## 3. 各层职责说明

### 3.1 表示层 (Presentation Layer)
- **职责**：处理外部请求和响应
- **依赖**：依赖应用层和基础设施层
- **文件位置**：`src/presentation/`
- **主要组件**：
  - 控制器：处理HTTP请求，调用应用层服务
  - 中间件：实现横切关注点（认证、日志、错误处理等）
  - 路由：定义API端点和请求处理

### 3.2 应用层 (Application Layer)
- **职责**：协调各层交互，实现业务流程
- **依赖**：依赖领域层和AI能力层
- **文件位置**：`src/application/`
- **主要组件**：
  - 服务：封装复杂业务逻辑，协调多个用例
  - 用例：实现单个业务功能
  - 工作流：编排多个用例，实现复杂业务流程

### 3.3 领域层 (Domain Layer)
- **职责**：核心业务逻辑和规则
- **依赖**：无外部依赖，只依赖自身
- **文件位置**：`src/domain/`
- **主要组件**：
  - 实体：包含业务规则的核心对象
  - 仓库接口：定义数据访问方式
  - 值对象：不可变的业务概念
  - 枚举：业务相关的枚举类型
  - 错误：领域特定的错误类型

### 3.4 基础设施层 (Infrastructure Layer)
- **职责**：实现外部依赖，如数据库、日志、缓存等
- **依赖**：无内层依赖
- **文件位置**：`src/infrastructure/`
- **主要组件**：
  - 配置：管理应用配置
  - 数据库：实现数据库连接和访问
  - 日志：实现日志系统
  - 外部服务：集成外部服务（Apple、Redis等）
  - 缓存：实现缓存功能

### 3.5 AI能力层 (AI Capability Layer)
- **职责**：AI相关功能实现
- **依赖**：无内层依赖
- **文件位置**：`src/ai/`
- **主要组件**：
  - LLM：大语言模型集成和Prompt设计
  - Embedding：嵌入向量生成和向量数据库集成
  - Cognitive：认知分析算法实现

## 4. 文件命名规范

### 4.1 文件名格式
- **小写蛇形命名法**：使用小写字母和下划线分隔单词
- **功能明确**：文件名应清晰反映文件的功能
- **分层标识**：根据文件所属层，放置在相应的目录中

### 4.2 示例
- 控制器：`auth.controller.ts`
- 服务：`auth.service.ts`
- 中间件：`auth.middleware.ts`
- 实体：`user.ts`
- 仓库接口：`user-repository.ts`
- 仓库实现：`user-repository-implementation.ts`

## 5. 依赖关系规则

### 5.1 层间依赖
- **表示层** → **应用层**：表示层调用应用层服务
- **应用层** → **领域层**：应用层使用领域实体和仓库接口
- **应用层** → **AI能力层**：应用层调用AI相关功能
- **基础设施层** → **无内层依赖**：基础设施层只实现接口，不依赖内层
- **AI能力层** → **无内层依赖**：AI能力层只提供服务，不依赖内层

### 5.2 禁止的依赖
- 领域层依赖外层
- 应用层依赖基础设施层具体实现
- 内层依赖外层的具体实现

## 6. 代码生成规则

### 6.1 生成顺序
1. **领域层**：先实现核心业务逻辑和实体
2. **AI能力层**：实现AI相关功能
3. **基础设施层**：实现外部依赖
4. **应用层**：实现业务流程
5. **表示层**：实现API和路由

### 6.2 生成规范
- 严格按照文件结构生成代码
- 每个文件只实现一个明确的功能
- 遵循TypeScript严格模式
- 为核心代码添加JSDoc注释
- 实现适当的错误处理
- 遵循命名规范

## 7. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-10 | 创建完整文件结构文档 | AI Assistant |

## 8. 参考文档

- [架构搭建指南](core-docs/architecture-design/architecture-setup-guide.md)
- [分层设计](core-docs/layered-design/)
- [代码生成指导](CODE_GENERATION_GUIDE_PART1.md)

## 9. 联系方式和支持

如有任何问题或需要支持，请参考项目的README.md文件或联系项目负责人。