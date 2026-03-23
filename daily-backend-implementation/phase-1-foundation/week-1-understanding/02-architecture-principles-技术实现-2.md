# Day 02: 架构原则深入学习 - 代码实现文档（第二部分）

## 文档说明

本文件是 `02-architecture-principles-code.md` 的第二部分，包含Domain First设计理念、AI定位设计和依赖倒置原则实践应用。
- **原文件路径**：`week-1-understanding/02-architecture-principles-code.md`
- **拆分原因**：文件过长，超出AI最大上下文限制
- **拆分点**：按功能模块拆分为Domain First设计理念和其他内容

## 3. Domain First设计理念实践

### 3.1 Domain层核心地位

**代码示例**：
```typescript
// Domain层是系统的核心，包含业务逻辑和实体定义

// 实体定义
export interface UserCognitiveModel {
  // 属性...
  
  // 方法...
}

export interface CognitiveConcept {
  // 属性...
}

export interface CognitiveRelation {
  // 属性...
}

// 领域服务
export interface CognitiveModelService {
  validateProposal(proposal: CognitiveProposal): boolean;
  maintainConsistency(model: UserCognitiveModel): void;
  generateInsight(model: UserCognitiveModel): CognitiveInsight;
}

// 领域事件
export interface ThoughtIngestedEvent {
  thoughtId: string;
  content: string;
  timestamp: Date;
}

export interface CognitiveModelUpdatedEvent {
  modelId: string;
  timestamp: Date;
  changes: any;
}
```

### 3.2 业务逻辑与技术实现分离

**代码示例**：
```typescript
// Domain层：只包含业务逻辑，不依赖技术实现
class CognitiveModelServiceImpl implements CognitiveModelService {
  validateProposal(proposal: CognitiveProposal): boolean {
    // 业务逻辑：验证建议的有效性
    return proposal.confidence > 0.7 && proposal.concepts.length > 0;
  }
  
  maintainConsistency(model: UserCognitiveModel): void {
    // 业务逻辑：维护认知模型的一致性
    // 1. 检测并移除冲突关系
    const conflicts = this.detectConflicts(model.relations);
    conflicts.forEach(conflict => {
      model.removeRelation(conflict.id);
    });
    
    // 2. 确保概念层次结构的正确性
    this.validateConceptHierarchy(model);
    
    // 3. 更新概念的置信度评分
    this.updateConceptConfidence(model);
  }
  
  // 其他业务逻辑方法...
}

// Infrastructure层：实现技术细节，不包含业务逻辑
class SQLiteThoughtRepository implements ThoughtRepository {
  private connection: SQLiteConnection;
  
  constructor(connection: SQLiteConnection) {
    this.connection = connection;
  }
  
  async save(thought: ThoughtFragment): Promise<ThoughtFragment> {
    // 技术实现：保存到SQLite数据库
    const sql = `
      INSERT INTO thought_fragments (id, content, metadata, user_id, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        content = excluded.content,
        metadata = excluded.metadata,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await this.connection.execute(sql, [
      thought.id,
      thought.content,
      JSON.stringify(thought.metadata),
      thought.userId,
      thought.createdAt.toISOString()
    ]);
    
    return thought;
  }
  
  // 其他技术实现方法...
}
```

## 4. AI在系统中的定位设计

### 4.1 AI作为依赖而非核心

**代码示例**：
```typescript
// AI服务通过接口注入，不是系统核心
class GenerateProposalUseCaseImpl implements GenerateProposalUseCase {
  // AI服务作为依赖注入
  private llmService: LLMService;
  private proposalRepository: CognitiveProposalRepository;
  
  constructor(llmService: LLMService, proposalRepository: CognitiveProposalRepository) {
    this.llmService = llmService;
    this.proposalRepository = proposalRepository;
  }
  
  async execute(thoughtId: string): Promise<CognitiveProposal> {
    // 1. 查找思维片段（核心业务逻辑）
    const thought = await this.thoughtRepository.findById(thoughtId);
    if (!thought) {
      throw new Error(`Thought with id ${thoughtId} not found`);
    }
    
    // 2. 使用AI服务生成建议（AI作为依赖）
    const proposal = await this.llmService.generateProposal(thought.content);
    
    // 3. 保存建议（核心业务逻辑）
    const savedProposal = await this.proposalRepository.save(proposal);
    
    // 4. 触发事件（核心业务逻辑）
    this.eventBus.publish('CognitiveProposalGenerated', {
      proposalId: savedProposal.id,
      thoughtId: thought.id,
      timestamp: new Date()
    });
    
    return savedProposal;
  }
}
```

### 4.2 可替换的AI组件

**代码示例**：
```typescript
// 定义AI服务接口
interface LLMService {
  generateProposal(thoughtContent: string): Promise<CognitiveProposal>;
  generateInsight(model: UserCognitiveModel): Promise<CognitiveInsight>;
}

// 实现1：OpenAI服务
export class OpenAIService implements LLMService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateProposal(thoughtContent: string): Promise<CognitiveProposal> {
    // 调用OpenAI API
  }
  
  async generateInsight(model: UserCognitiveModel): Promise<CognitiveInsight> {
    // 调用OpenAI API
  }
}

// 实现2：本地LLM服务
export class LocalLLMService implements LLMService {
  private modelPath: string;
  
  constructor(modelPath: string) {
    this.modelPath = modelPath;
  }
  
  async generateProposal(thoughtContent: string): Promise<CognitiveProposal> {
    // 调用本地LLM
  }
  
  async generateInsight(model: UserCognitiveModel): Promise<CognitiveInsight> {
    // 调用本地LLM
  }
}

// 实现3：模拟AI服务（用于测试）
export class MockLLMService implements LLMService {
  async generateProposal(thoughtContent: string): Promise<CognitiveProposal> {
    // 返回模拟数据
    return {
      id: uuidv4(),
      thoughtId: uuidv4(),
      concepts: [{ semanticIdentity: 'test', abstractionLevel: 3, confidenceScore: 0.9, description: 'test' }],
      relations: [],
      confidence: 0.9,
      reasoningTrace: ['reasoning'],
      createdAt: new Date()
    };
  }
  
  async generateInsight(model: UserCognitiveModel): Promise<CognitiveInsight> {
    // 返回模拟数据
    return {
      id: uuidv4(),
      modelId: model.id,
      coreThemes: ['test theme'],
      blindSpots: [],
      conceptGaps: [],
      structureSummary: 'test summary',
      createdAt: new Date()
    };
  }
}

// 应用程序入口：根据配置选择AI服务
class App {
  private llmService: LLMService;
  
  constructor(config: AppConfig) {
    if (config.ai.provider === 'openai') {
      this.llmService = new OpenAIService(config.ai.apiKey);
    } else if (config.ai.provider === 'local') {
      this.llmService = new LocalLLMService(config.ai.modelPath);
    } else {
      this.llmService = new MockLLMService();
    }
    
    // 初始化其他服务...
  }
  
  // 启动应用...
}
```

## 5. 依赖倒置原则实践应用

### 5.1 高层模块与低层模块通过接口通信

**代码示例**：
```typescript
// 高层模块（Application层）
class GenerateInsightUseCaseImpl implements GenerateInsightUseCase {
  // 依赖抽象接口，不依赖具体实现
  private cognitiveModelRepository: CognitiveModelRepository;
  private cognitiveModelService: CognitiveModelService;
  private llmService: LLMService;
  private cognitiveInsightRepository: CognitiveInsightRepository;
  private eventBus: EventBus;
  
  constructor(
    cognitiveModelRepository: CognitiveModelRepository,
    cognitiveModelService: CognitiveModelService,
    llmService: LLMService,
    cognitiveInsightRepository: CognitiveInsightRepository,
    eventBus: EventBus
  ) {
    this.cognitiveModelRepository = cognitiveModelRepository;
    this.cognitiveModelService = cognitiveModelService;
    this.llmService = llmService;
    this.cognitiveInsightRepository = cognitiveInsightRepository;
    this.eventBus = eventBus;
  }
  
  async execute(modelId: string): Promise<CognitiveInsight> {
    // 1. 查找认知模型
    const model = await this.cognitiveModelRepository.findById(modelId);
    if (!model) {
      throw new Error(`Cognitive model with id ${modelId} not found`);
    }
    
    // 2. 使用领域服务维护模型一致性
    this.cognitiveModelService.maintainConsistency(model);
    
    // 3. 使用AI服务生成洞察
    const insight = await this.llmService.generateInsight(model);
    
    // 4. 保存洞察
    const savedInsight = await this.cognitiveInsightRepository.save(insight);
    
    // 5. 触发事件
    this.eventBus.publish('InsightGenerated', {
      insightId: savedInsight.id,
      modelId: model.id,
      timestamp: new Date()
    });
    
    return savedInsight;
  }
}

// 低层模块（Infrastructure层）实现接口
class QdrantEmbeddingService implements EmbeddingService {
  private client: QdrantClient;
  
  constructor(client: QdrantClient) {
    this.client = client;
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    // 实现嵌入生成逻辑
  }
  
  async storeEmbedding(id: string, embedding: number[], metadata: any): Promise<void> {
    // 实现嵌入存储逻辑
  }
  
  async searchSimilarEmbeddings(query: number[], limit: number): Promise<any[]> {
    // 实现相似嵌入搜索逻辑
  }
}
```

### 5.2 依赖注入容器

**代码示例**：
```typescript
// 使用依赖注入容器管理依赖关系
class DIContainer {
  private registry: Map<string, any> = new Map();
  
  // 注册依赖
  register<T>(key: string, factory: () => T): void {
    this.registry.set(key, factory);
  }
  
  // 获取依赖
  resolve<T>(key: string): T {
    const factory = this.registry.get(key);
    if (!factory) {
      throw new Error(`Dependency ${key} not registered`);
    }
    return factory();
  }
}

// 初始化依赖注入容器
const container = new DIContainer();

// 注册依赖
container.register('sqliteConnection', () => new SQLiteConnectionImpl());
container.register('thoughtRepository', () => 
  new SQLiteThoughtRepository(container.resolve('sqliteConnection'))
);
container.register('cognitiveModelRepository', () => 
  new SQLiteCognitiveModelRepository(container.resolve('sqliteConnection'))
);
container.register('cognitiveProposalRepository', () => 
  new SQLiteCognitiveProposalRepository(container.resolve('sqliteConnection'))
);
container.register('cognitiveInsightRepository', () => 
  new SQLiteCognitiveInsightRepository(container.resolve('sqliteConnection'))
);
container.register('eventBus', () => new EventBusImpl());
container.register('llmService', () => new OpenAIService(process.env.OPENAI_API_KEY!));
container.register('embeddingService', () => new QdrantEmbeddingService(new QdrantClient()));
container.register('cognitiveModelService', () => new CognitiveModelServiceImpl());

// 注册用例
container.register('ingestThoughtUseCase', () => 
  new IngestThoughtUseCaseImpl(
    container.resolve('thoughtRepository'),
    container.resolve('eventBus')
  )
);

container.register('generateProposalUseCase', () => 
  new GenerateProposalUseCaseImpl(
    container.resolve('thoughtRepository'),
    container.resolve('llmService'),
    container.resolve('cognitiveProposalRepository'),
    container.resolve('eventBus')
  )
);

// 使用依赖注入容器获取实例
const ingestThoughtUseCase = container.resolve<IngestThoughtUseCase>('ingestThoughtUseCase');
const generateProposalUseCase = container.resolve<GenerateProposalUseCase>('generateProposalUseCase');
```

## 6. 架构原则检查清单

### 6.1 代码设计检查清单
- [ ] 每个类或模块只负责一项职责（SRP）
- [ ] 对扩展开放，对修改封闭（OCP）
- [ ] 子类可以替换父类，不影响程序正确性（LSP）
- [ ] 接口小而专一，客户端只依赖它需要的方法（ISP）
- [ ] 高层模块和低层模块都依赖抽象，不依赖具体实现（DIP）
- [ ] 每个对象只与直接朋友通信，不访问朋友的朋友（LoD）
- [ ] Domain层只包含业务逻辑，不依赖技术实现
- [ ] AI作为依赖注入，不是系统核心
- [ ] 模块间通过接口通信，降低耦合度

### 6.2 架构一致性检查清单
- [ ] 遵循分层架构设计
- [ ] 依赖关系符合Clean Architecture原则（内层不依赖外层）
- [ ] 业务逻辑集中在Domain层
- [ ] 技术实现集中在Infrastructure层
- [ ] 所有模块都遵循相同的命名规范和代码风格
- [ ] 所有核心功能都有清晰的接口定义

## 7. 总结

Day 02的核心任务是深入学习Clean Architecture的六大原则、Domain First设计理念、AI在系统中的定位以及依赖倒置原则的实践应用。通过今天的学习，我们建立了符合架构原则的开发思维，为后续开发打下了坚实的基础。

在后续的开发中，我们将严格遵循这些架构原则，确保系统的可维护性、可扩展性和可测试性。我们将坚持Domain First设计理念，将认知模型放在系统的核心位置，AI作为依赖而非核心，通过依赖倒置原则实现模块间的低耦合通信。

通过遵循这些架构原则，我们将构建一个高质量、易维护、可扩展的认知辅助型AI软件，为用户提供有价值的认知反馈和思考建议。