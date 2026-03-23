# AI认知辅助系统代码生成计划

## 1. 生成策略

按照统一代码生成指南和Clean Architecture原则，采用**分层生成策略**，从内层向外层逐步构建：

1. **领域层** → 2. **AI能力层** → 3. **基础设施层** → 4. **应用层** → 5. **表示层**

## 2. 阶段1：系统地基期（P1）

### 2.1 第1周：理解与建模

#### P1W1M1 - 项目总览与架构原则
- 生成项目基础配置文件
- 实现核心架构原则
- 建立项目目录结构

#### P1W1M2 - 领域对象定义
- 生成领域实体：User、CognitiveModel、CognitiveConcept、CognitiveRelation、ThoughtFragment、CognitiveInsight
- 生成值对象：Email、Password、UUID、CognitiveRelationType
- 生成枚举类型：UserRole、CognitiveRelationTypeEnum、AiTaskStatus

#### P1W1M3 - 对象关系与约束
- 生成领域错误类：DomainError、AuthError、CognitiveError
- 定义实体间关系和约束

#### P1W1M4 - 项目结构搭建
- 生成基础目录结构
- 配置TypeScript和依赖管理

#### P1W1M5 - 领域层实现
- 生成仓库接口：UserRepository、CognitiveModelRepository、ThoughtFragmentRepository、CognitiveInsightRepository

### 2.2 第2周：应用层实现

#### P1W2M1 - 用例设计
- 定义核心用例接口

#### P1W2M2 - 思想片段摄入用例
- 实现CreateThoughtUseCase
- 实现GetThoughtsUseCase

#### P1W2M3 - 建议生成用例
- 实现GenerateProposalUseCase

#### P1W2M4 - 仓库接口定义
- 完善仓库接口设计

#### P1W2M5 - 工作流编排
- 实现CognitiveModelWorkflow

### 2.3 第3周：基础设施层实现

#### P1W3M1 - 数据库连接实现
- 实现SQLite连接
- 配置数据库连接管理

#### P1W3M2 - 仓库实现
- 实现UserRepositoryImpl
- 实现CognitiveModelRepositoryImpl
- 实现ThoughtFragmentRepositoryImpl

#### P1W3M3 - 事件系统
- 实现基础事件系统

#### P1W3M4 - 日志系统
- 实现LoggerService和PinoLoggerService

#### P1W3M5 - 错误处理
- 实现全局错误处理机制

### 2.4 第4周：最小系统集成

#### P1W4M1 - HTTP API实现
- 配置Fastify框架
- 实现基础API路由

#### P1W4M2 - 输入处理
- 实现输入验证和处理

#### P1W4M3 - 认知建模
- 实现认知模型核心功能

#### P1W4M4 - 模型输出
- 实现模型输出格式化

#### P1W4M5 - 系统集成
- 集成各层组件
- 实现完整的请求处理流程

## 3. 执行计划

### 3.1 第一步：初始化项目结构
- 生成package.json、tsconfig.json、.env文件
- 创建src目录和各层子目录

### 3.2 第二步：实现领域层核心
- 生成所有领域实体和值对象
- 实现领域错误和枚举
- 定义仓库接口

### 3.3 第三步：实现基础设施层基础组件
- 实现日志系统
- 实现数据库连接
- 实现配置管理

### 3.4 第四步：实现应用层核心用例
- 实现思想片段相关用例
- 实现认知模型相关用例

### 3.5 第五步：实现表示层API
- 配置Fastify路由
- 实现控制器和中间件

### 3.6 第六步：测试与集成
- 生成单元测试
- 进行集成测试
- 优化和修复bug

## 4. 生成规范

- 严格遵循TypeScript严格模式
- 每个文件只实现一个明确功能
- 遵循Clean Architecture依赖规则
- 添加必要的JSDoc注释
- 实现适当的错误处理
- 保持代码风格一致性

## 5. 进度跟踪

- 每次生成后更新CODE_GENERATION_PROGRESS.md
- 记录生成日志
- 确保模块间依赖正确

## 6. 预期产出

- 完整的领域层实现
- 基础的基础设施层组件
- 核心应用层用例
- 可运行的HTTP API
- 完善的测试用例

通过以上计划，我们将按照统一代码生成指南，从领域层开始逐步构建整个AI认知辅助系统，确保代码质量和架构一致性。