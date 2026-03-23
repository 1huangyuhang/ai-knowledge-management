# 后端功能搭建实现指南

## 1. 项目初始化与架构设计（第1-7天）

### 1.1 项目概述

本项目是一个认知辅助型AI软件，核心目标是持续构建、更新、分析用户的「认知结构模型」，并基于该模型给出结构性反馈与思考建议。系统采用Clean Architecture设计理念，确保核心业务逻辑与外部依赖分离，提高系统的可维护性和可扩展性。

### 1.2 架构设计

#### 1.2.1 架构原则

- **Domain First**：认知模型优先于技术选型
- **AI is a Dependency**：AI是外部能力，不是系统中心
- **Replaceable by Design**：任何组件都能被替换，不绑定特定供应商
- **Single Responsibility**：每个模块只解决一个问题
- **高内聚、低耦合**：模块内部高内聚，模块间低耦合
- **依赖倒置**：上层模块依赖接口，不依赖具体实现

#### 1.2.2 分层设计

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

### 1.3 项目目录结构

根据第5天的计划，建立符合Clean Architecture的项目目录结构：

```
src/
├── domain/              # 领域层
│   ├── entities/        # 实体
│   ├── services/        # 领域服务
│   └── value-objects/   # 值对象
├── application/         # 应用层
│   ├── usecases/        # 用例
│   ├── ports/           # 接口定义
│   └── dtos/            # 数据传输对象
├── infrastructure/      # 基础设施层
│   ├── ai/              # AI 实现
│   ├── persistence/     # 持久化
│   └── event/           # 事件处理
└── interfaces/          # 交互层
    └── http/            # HTTP API
```

## 2. Domain层实现（第3-7天）

### 2.1 核心Domain对象定义

根据第3天的计划，定义核心Domain对象：

#### 2.1.1 UserCognitiveModel

**定义**：用户认知模型，包含概念图谱、关系集合和演化历史

**属性**：
- `id: string`：模型唯一标识
- `userId: string`：用户ID
- `concepts: CognitiveConcept[]`：概念集合
- `relations: CognitiveRelation[]`：关系集合
- `evolutionHistory: EvolutionHistory[]`：演化历史
- `createdAt: Date`：创建时间
- `updatedAt: Date`：更新时间

**方法**：
- `addConcept(concept: CognitiveConcept): void`：添加概念
- `removeConcept(conceptId: string): void`：移除概念
- `updateConcept(concept: CognitiveConcept): void`：更新概念
- `addRelation(relation: CognitiveRelation): void`：添加关系
- `removeRelation(relationId: string): void`：移除关系
- `updateRelation(relation: CognitiveRelation): void`：更新关系
- `applyProposal(proposal: CognitiveProposal): void`：应用认知建议

#### 2.1.2 CognitiveConcept

**定义**：认知概念，抽象思维单元

**属性**：
- `id: string`：概念唯一标识
- `semanticIdentity: string`：语义标识
- `abstractionLevel: number`：抽象级别（1-5）
- `confidenceScore: number`：置信度评分（0-1）
- `description: string`：概念描述
- `createdAt: Date`：创建时间
- `updatedAt: Date`：更新时间

#### 2.1.3 CognitiveRelation

**定义**：认知关系，概念间的逻辑关系

**属性**：
- `id: string`：关系唯一标识
- `sourceConceptId: string`：源概念ID
- `targetConceptId: string`：目标概念ID
- `relationType: RelationType`：关系类型（depends_on, generalizes, contradicts, is_a, related_to）
- `confidenceScore: number`：置信度评分（0-1）
- `createdAt: Date`：创建时间
- `updatedAt: Date`：更新时间

#### 2.1.4 ThoughtFragment

**定义**：思维片段，用户输入的原始文本

**属性**：
- `id: string`：思维片段唯一标识
- `content: string`：思维片段内容
- `metadata: Record<string, any>`：元数据，如标签、时间戳
- `userId: string`：用户ID
- `createdAt: Date`：创建时间

#### 2.1.5 CognitiveProposal

**定义**：认知建议，AI生成的认知结构建议

**属性**：
- `id: string`：建议唯一标识
- `thoughtId: string`：关联的思维片段ID
- `concepts: ConceptCandidate[]`：概念候选列表
- `relations: RelationCandidate[]`：关系候选列表
- `confidence: number`：整体置信度
- `reasoningTrace: string[]`：推理过程
- `createdAt: Date`：创建时间

#### 2.1.6 CognitiveInsight

**定义**：认知洞察，系统生成的结构性反馈

**属性**：
- `id: string`：洞察唯一标识
- `modelId: string`：关联的认知模型ID
- `coreThemes: string[]`：核心主题
- `blindSpots: string[]`：思维盲点
- `conceptGaps: string[]`：概念空洞
- `structureSummary: string`：认知结构摘要
- `createdAt: Date`：创建时间

### 2.2 领域服务

#### 2.2.1 CognitiveModelService

**职责**：负责维护和更新用户的认知模型

**方法**：
- `validateProposal(proposal: CognitiveProposal): boolean`：验证认知建议的合法性
- `maintainConsistency(model: UserCognitiveModel): void`：维护认知模型的一致性
- `generateInsight(model: UserCognitiveModel): CognitiveInsight`：生成认知洞察

## 3. Application层实现（第8-14天）

### 3.1 Use Case设计

#### 3.1.1 IngestThoughtUseCase

**对应日计划**：第9天

**职责**：处理用户输入的思维片段

**流程**：
1. 接收用户输入的思维片段
2. 验证输入格式
3. 存储为ThoughtFragment
4. 触发ThoughtIngested事件

**输入**：
- `thoughtInput: ThoughtInputDto`：包含思维片段内容和元数据

**输出**：
- `thoughtId: string`：存储成功的思维片段ID

#### 3.1.2 GenerateProposalUseCase

**对应日计划**：第10-11天

**职责**：生成认知建议

**流程**：
1. 接收ThoughtIngested事件
2. 加载对应的ThoughtFragment
3. 调用AI服务解析思维片段
4. 生成CognitiveProposal
5. 存储CognitiveProposal

**输入**：
- `thoughtId: string`：思维片段ID

**输出**：
- `proposalId: string`：生成的认知建议ID

#### 3.1.3 UpdateCognitiveModelUseCase

**对应日计划**：第12-13天

**职责**：更新认知模型

**流程**：
1. 接收CognitiveProposal
2. 验证Proposal的合法性
3. 更新UserCognitiveModel
4. 保存演化历史
5. 触发CognitiveModelUpdated事件

**输入**：
- `proposalId: string`：认知建议ID

**输出**：
- `modelId: string`：更新后的认知模型ID

### 3.2 接口定义

#### 3.2.1 ThoughtRepository

**对应日计划**：第11天

**职责**：思维片段的持久化操作

**方法**：
- `save(thought: ThoughtFragment): Promise<ThoughtFragment>`：保存思维片段
- `findById(id: string): Promise<ThoughtFragment | null>`：根据ID查找思维片段
- `findByUserId(userId: string): Promise<ThoughtFragment[]>`：根据用户ID查找所有思维片段
- `delete(id: string): Promise<void>`：删除思维片段

#### 3.2.2 CognitiveModelRepository

**对应日计划**：第11天

**职责**：认知模型的持久化操作

**方法**：
- `save(model: UserCognitiveModel): Promise<UserCognitiveModel>`：保存认知模型
- `findById(id: string): Promise<UserCognitiveModel | null>`：根据ID查找认知模型
- `findByUserId(userId: string): Promise<UserCognitiveModel | null>`：根据用户ID查找认知模型

#### 3.2.3 CognitiveProposalRepository

**对应日计划**：第11天

**职责**：认知建议的持久化操作

**方法**：
- `save(proposal: CognitiveProposal): Promise<CognitiveProposal>`：保存认知建议
- `findById(id: string): Promise<CognitiveProposal | null>`：根据ID查找认知建议
- `findByThoughtId(thoughtId: string): Promise<CognitiveProposal[]>`：根据思维片段ID查找认知建议

#### 3.2.4 CognitiveInsightRepository

**对应日计划**：第11天

**职责**：认知洞察的持久化操作

**方法**：
- `save(insight: CognitiveInsight): Promise<CognitiveInsight>`：保存认知洞察
- `findById(id: string): Promise<CognitiveInsight | null>`：根据ID查找认知洞察
- `findByModelId(modelId: string): Promise<CognitiveInsight[]>`：根据认知模型ID查找认知洞察

### 3.3 数据传输对象（DTO）

#### 3.3.1 ThoughtInputDto

```typescript
interface ThoughtInputDto {
  content: string;
  metadata?: Record<string, any>;
  userId: string;
}
```

#### 3.3.2 ThoughtOutputDto

```typescript
interface ThoughtOutputDto {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  userId: string;
  createdAt: Date;
}
```

#### 3.3.3 CognitiveModelOutputDto

```typescript
interface CognitiveModelOutputDto {
  id: string;
  userId: string;
  concepts: CognitiveConcept[];
  relations: CognitiveRelation[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 4. Infrastructure层实现（第15-21天）

### 4.1 数据库连接

**对应日计划**：第15天

**技术要点**：
- 使用SQLite存储结构化数据
- 使用Qdrant存储语义向量
- 实现数据库连接池
- 支持事务管理

**配置**：
```typescript
// src/infrastructure/persistence/sqlite/SQLiteConnection.ts
class SQLiteConnection {
  private db: Database;

  constructor() {
    this.db = new Database('cognitive-assistant.db');
  }

  public async query(sql: string, params?: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  public async execute(sql: string, params?: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
```

### 4.2 Repository实现

#### 4.2.1 ThoughtRepositoryImpl

**对应日计划**：第16天

**职责**：实现ThoughtRepository接口，使用SQLite存储思维片段

**实现**：
```typescript
// src/infrastructure/persistence/sqlite/ThoughtRepositoryImpl.ts
class ThoughtRepositoryImpl implements ThoughtRepository {
  private connection: SQLiteConnection;

  constructor(connection: SQLiteConnection) {
    this.connection = connection;
  }

  public async save(thought: ThoughtFragment): Promise<ThoughtFragment> {
    const sql = `
      INSERT INTO thought_fragments (id, content, metadata, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await this.connection.execute(sql, [
      thought.id,
      thought.content,
      JSON.stringify(thought.metadata),
      thought.userId,
      thought.createdAt.toISOString(),
      thought.updatedAt.toISOString()
    ]);
    return thought;
  }

  // 其他方法实现...
}
```

#### 4.2.2 CognitiveModelRepositoryImpl

**对应日计划**：第16天

**职责**：实现CognitiveModelRepository接口，使用SQLite存储认知模型

### 4.3 事件系统

**对应日计划**：第17天

**职责**：实现模块间的松耦合通信

**核心事件类型**：

| 事件类型 | 触发时机 | 包含数据 |
|----------|----------|----------|
| ThoughtIngested | 思维片段存储成功 | thoughtId, content, timestamp |
| CognitiveModelUpdated | 认知模型更新成功 | modelId, timestamp, changes |
| InsightGenerated | 认知反馈生成成功 | insightId, modelId, timestamp |
| SuggestionsGenerated | 生成思考建议成功 | suggestionId, modelId, timestamp |
| AIProcessingFailed | AI 处理失败 | error, context, timestamp |

**实现**：
```typescript
// src/infrastructure/event/EventBus.ts
interface EventHandler<T> {
  handle(event: T): void;
}

class EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  public subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  public publish<T>(eventType: string, event: T): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.forEach(handler => handler.handle(event));
    }
  }
}
```

## 5. Presentation层实现（第22-30天）

### 5.1 HTTP API实现

**对应日计划**：第22-24天

**技术要点**：
- 使用Fastify框架实现HTTP API
- 支持RESTful风格
- 实现请求验证
- 支持API版本管理

**核心API接口**：

#### 5.1.1 思维片段管理

| 方法 | 路径 | 功能描述 | 认证要求 |
|------|------|----------|----------|
| POST | /api/v1/thoughts | 提交新的思维片段 | 需要 |
| GET | /api/v1/thoughts | 获取所有思维片段 | 需要 |
| GET | /api/v1/thoughts/:id | 获取特定思维片段 | 需要 |
| DELETE | /api/v1/thoughts/:id | 删除特定思维片段 | 需要 |

**请求示例**：
```http
POST /api/v1/thoughts
Content-Type: application/json
X-API-Key: your-api-key

{
  "content": "这是一个思维片段示例",
  "metadata": {
    "tags": ["学习", "AI"]
  }
}
```

**响应示例**：
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "success",
  "message": "思维片段已保存"
}
```

#### 5.1.2 认知模型管理

| 方法 | 路径 | 功能描述 | 认证要求 |
|------|------|----------|----------|
| GET | /api/v1/model | 获取当前认知模型 | 需要 |
| GET | /api/v1/model/concepts | 获取所有概念 | 需要 |
| GET | /api/v1/model/relations | 获取所有关系 | 需要 |
| POST | /api/v1/model/refresh | 手动刷新认知模型 | 需要 |

#### 5.1.3 认知反馈管理

| 方法 | 路径 | 功能描述 | 认证要求 |
|------|------|----------|----------|
| GET | /api/v1/insights | 获取所有认知反馈 | 需要 |
| GET | /api/v1/insights/:id | 获取特定认知反馈 | 需要 |
| POST | /api/v1/insights/generate | 手动生成认知反馈 | 需要 |

### 5.2 错误处理

**对应日计划**：第19天

**统一错误格式**：
```json
{
  "status": "error",
  "code": "INVALID_INPUT",
  "message": "输入格式无效",
  "details": {
    "field": "content",
    "reason": "内容不能为空"
  }
}
```

**常见错误码**：

| 错误码 | 描述 | HTTP 状态码 |
|--------|------|-------------|
| INVALID_INPUT | 输入格式无效 | 400 |
| UNAUTHORIZED | 认证失败 | 401 |
| FORBIDDEN | 没有权限 | 403 |
| NOT_FOUND | 资源不存在 | 404 |
| INTERNAL_ERROR | 内部服务器错误 | 500 |
| AI_ERROR | AI 处理错误 | 500 |

### 5.3 日志系统

**对应日计划**：第18天

**技术要点**：
- 使用结构化日志
- 支持日志分级
- 包含上下文信息
- 不记录敏感信息

**实现**：
```typescript
// src/infrastructure/logging/Logger.ts
enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

class Logger {
  private moduleName: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  public error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, { ...context, stack: error?.stack });
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.moduleName,
      message,
      context
    };
    console.log(JSON.stringify(logEntry));
  }
}
```

## 6. AI能力集成（第31-60天）

### 6.1 LLM集成

**对应日计划**：第31-35天

**职责**：调用云端LLM API解析思维片段

**技术要点**：
- 支持多种LLM提供商
- 实现重试机制
- 支持超时处理
- 实现Prompt版本管理

**实现**：
```typescript
// src/infrastructure/ai/LLMClient.ts
class LLMClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  public async callApi(prompt: string, context: any): Promise<any> {
    // 实现LLM API调用逻辑
    // 包含重试机制和超时处理
  }
}
```

### 6.2 向量存储

**对应日计划**：第36-40天

**职责**：存储和检索语义向量

**技术要点**：
- 使用Qdrant存储向量
- 支持多种向量索引算法
- 实现向量相似度搜索
- 支持批量操作

**实现**：
```typescript
// src/infrastructure/ai/EmbeddingService.ts
class EmbeddingService {
  private client: QdrantClient;
  private embeddingModel: string;

  constructor(client: QdrantClient, embeddingModel: string) {
    this.client = client;
    this.embeddingModel = embeddingModel;
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    // 调用Embedding API生成向量
  }

  public async storeEmbedding(id: string, embedding: number[], metadata: any): Promise<void> {
    // 存储向量到Qdrant
  }

  public async searchSimilarEmbeddings(query: number[], limit: number = 10): Promise<any[]> {
    // 搜索相似向量
  }
}
```

### 6.3 认知解析

**对应日计划**：第41-45天

**职责**：解析思维片段，生成认知建议

**技术要点**：
- 使用Prompt Engineering确保AI输出结构化数据
- 使用JSON Schema验证AI输出
- 实现置信度评分

**实现**：
```typescript
// src/infrastructure/ai/CognitiveParser.ts
class CognitiveParser {
  private llmClient: LLMClient;
  private promptTemplates: PromptTemplates;

  constructor(llmClient: LLMClient, promptTemplates: PromptTemplates) {
    this.llmClient = llmClient;
    this.promptTemplates = promptTemplates;
  }

  public async parseThought(thought: ThoughtFragment): Promise<CognitiveProposal> {
    // 获取Prompt模板
    const prompt = this.promptTemplates.get('cognitive-parsing');
    
    // 调用LLM解析思维片段
    const result = await this.llmClient.callApi(prompt, {
      thought: thought.content
    });
    
    // 验证结果格式
    // 生成CognitiveProposal
    
    return proposal;
  }
}
```

## 7. 认知辅助功能实现（第61-90天）

### 7.1 认知反馈生成

**对应日计划**：第51-55天

**职责**：分析认知模型，生成结构性反馈

**技术要点**：
- 分析概念频率和关系强度
- 识别核心主题和思维模式
- 检测概念空洞和断裂
- 生成可可视化的认知结构数据

**实现**：
```typescript
// src/infrastructure/ai/CognitiveAnalyzer.ts
class CognitiveAnalyzer {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  public async analyzeCoreThemes(model: UserCognitiveModel): Promise<string[]> {
    // 分析核心主题
  }

  public async detectBlindSpots(model: UserCognitiveModel): Promise<string[]> {
    // 检测思维盲点
  }

  public async identifyGaps(model: UserCognitiveModel): Promise<string[]> {
    // 识别概念空洞
  }

  public async generateInsight(model: UserCognitiveModel): Promise<CognitiveInsight> {
    // 生成认知洞察
  }
}
```

### 7.2 思考建议生成

**对应日计划**：第66-70天

**职责**：基于认知模型生成思考建议

**技术要点**：
- 结合AI能力生成高质量建议
- 基于用户的认知模型生成定制化建议
- 只提供思考方向，不提供具体答案
- 说明建议的依据和理由

**实现**：
```typescript
// src/infrastructure/ai/SuggestionGenerator.ts
class SuggestionGenerator {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  public async generateSuggestions(model: UserCognitiveModel): Promise<CognitiveSuggestion[]> {
    // 生成思考建议
  }

  public async rankSuggestions(suggestions: CognitiveSuggestion[]): Promise<CognitiveSuggestion[]> {
    // 排序建议
  }
}
```

## 8. 系统集成与测试（第56-60天，第71-80天）

### 8.1 集成测试

**对应日计划**：第20天

**职责**：测试模块间的交互

**测试范围**：
- 思维片段输入到认知模型更新的完整流程
- API接口的正确性和稳定性
- 事件系统的可靠性
- 数据库操作的正确性

**工具**：
- Jest + Supertest

### 8.2 性能测试

**对应日计划**：第71-75天

**职责**：测试系统在高负载下的性能

**测试指标**：
- API响应时间
- 系统吞吐量
- 资源使用率（CPU、内存）
- 数据库查询性能

**工具**：
- Artillery

### 8.3 安全测试

**对应日计划**：第76-80天

**职责**：测试系统的安全性

**测试范围**：
- 认证机制的安全性
- 输入验证的完整性
- 数据加密的正确性
- 防止SQL注入和XSS攻击

**工具**：
- OWASP ZAP

## 9. 部署与运维（第81-90天）

### 9.1 部署环境

**对应日计划**：第81-85天

**开发环境**：
- macOS / Linux / Windows
- Node.js 18+
- npm 或 yarn
- SQLite（内置）
- Qdrant 向量数据库（本地或云端）

**生产环境**：
- Docker 容器化部署
- 云服务器或本地服务器
- 内存要求：至少 4GB
- 存储空间：根据数据量而定，建议至少 10GB
- 网络要求：稳定的网络连接，支持 HTTPS

### 9.2 部署流程

**对应日计划**：第86-90天

1. **构建镜像**：使用Dockerfile构建应用镜像
2. **部署容器**：使用Docker Compose或Kubernetes部署应用容器
3. **配置环境变量**：设置必要的环境变量，如API密钥、数据库连接信息等
4. **初始化数据库**：执行数据库迁移脚本，创建必要的表和索引
5. **启动服务**：启动应用服务和依赖服务
6. **验证部署**：检查服务是否正常运行，测试核心API接口

### 9.3 运维方案

#### 9.3.1 监控与告警

- **系统监控**：监控CPU、内存、磁盘等系统资源使用情况
- **应用监控**：监控API响应时间、错误率、请求量等指标
- **数据库监控**：监控数据库连接数、查询性能、存储空间等
- **AI服务监控**：监控AI API调用成功率、延迟等
- **告警机制**：设置合理的告警阈值，支持邮件、短信等告警方式

#### 9.3.2 日志管理

- **集中日志**：使用ELK Stack或类似工具集中管理日志
- **日志分析**：定期分析日志，识别系统问题和优化机会
- **日志保留**：根据法规要求，设置合理的日志保留期限

#### 9.3.3 备份与恢复

- **数据备份**：定期备份数据库和向量数据库
- **备份策略**：采用增量备份和全量备份相结合的策略
- **恢复测试**：定期进行恢复测试，确保备份数据可用

## 10. 总结

本文档详细描述了认知辅助型AI软件后端系统的搭建方案，包括Domain层、Application层、Infrastructure层和Presentation层的实现，以及AI能力集成、认知辅助功能实现、系统集成与测试、部署与运维等内容。

文档内容与日计划中的功能部分一一对应，确保功能描述准确且详尽，避免了模糊不清的描述，提升了文档的专业性和可实施性。

通过遵循本文档的指导，可以有序、高效地完成后端系统的开发，确保系统符合技术规范要求，具有良好的可维护性和可扩展性。