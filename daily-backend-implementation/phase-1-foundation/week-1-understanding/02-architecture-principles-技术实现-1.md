# Day 02: 架构原则深入学习 - 代码实现文档（第一部分）

## 文档说明

本文件是 `02-architecture-principles-code.md` 的第一部分，包含Clean Architecture核心原则和分层设计。
- **原文件路径**：`week-1-understanding/02-architecture-principles-code.md`
- **拆分原因**：文件过长，超出AI最大上下文限制
- **拆分点**：按功能模块拆分为Clean Architecture原则和Domain First设计理念

## 1. 项目架构原则概述

### 1.1 核心设计理念
- **Clean Architecture**：采用分层架构设计，确保系统的可维护性和可扩展性
- **Domain First**：认知模型优先于技术选型，业务逻辑与技术实现分离
- **AI作为依赖**：AI是外部能力，不是系统中心，系统核心是认知模型的构建和分析
- **依赖倒置**：高层模块不依赖低层模块，通过接口实现依赖

### 1.2 架构原则在代码中的体现
- 代码结构遵循分层设计，每层职责清晰
- 业务逻辑集中在Domain层，不受技术实现影响
- AI能力通过接口注入，便于替换和扩展
- 模块间通过接口通信，降低耦合度

## 2. Clean Architecture六大原则详解

### 2.1 单一职责原则（SRP）

**定义**：一个类或模块只负责一项职责。

**代码示例**：
```typescript
// 遵循SRP：每个类只负责一项职责
// UserCognitiveModel类只负责管理认知模型
export class UserCognitiveModelImpl implements UserCognitiveModel {
  // 只包含认知模型相关的属性和方法
  private id: string;
  private userId: string;
  private concepts: CognitiveConcept[];
  private relations: CognitiveRelation[];
  private evolutionHistory: EvolutionHistory[];
  private createdAt: Date;
  private updatedAt: Date;
  
  constructor(id: string, userId: string) {
    this.id = id;
    this.userId = userId;
    this.concepts = [];
    this.relations = [];
    this.evolutionHistory = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
  
  // 只包含认知模型管理的方法
  addConcept(concept: CognitiveConcept): void {
    // 实现添加概念的逻辑
  }
  
  removeConcept(conceptId: string): void {
    // 实现移除概念的逻辑
  }
  
  updateConcept(concept: CognitiveConcept): void {
    // 实现更新概念的逻辑
  }
  
  // 其他认知模型管理方法...
}

// CognitiveModelService类只负责认知模型的业务逻辑
export class CognitiveModelServiceImpl implements CognitiveModelService {
  validateProposal(proposal: CognitiveProposal): boolean {
    // 验证认知建议的逻辑
  }
  
  maintainConsistency(model: UserCognitiveModel): void {
    // 维护认知模型一致性的逻辑
  }
  
  generateInsight(model: UserCognitiveModel): CognitiveInsight {
    // 生成认知洞察的逻辑
  }
}
```

**反例**：
```typescript
// 违反SRP：一个类负责多项职责
class CognitiveModelAndDatabase {
  // 认知模型属性...
  
  // 认知模型方法...
  
  // 数据库操作方法 - 违反SRP
  saveToDatabase(): void {
    // 保存到数据库的逻辑
  }
  
  loadFromDatabase(id: string): void {
    // 从数据库加载的逻辑
  }
}
```

### 2.2 开放封闭原则（OCP）

**定义**：对扩展开放，对修改封闭。

**代码示例**：
```typescript
// 遵循OCP：通过接口扩展，不修改现有代码
interface LLMService {
  generateProposal(thoughtContent: string): Promise<CognitiveProposal>;
  generateInsight(model: UserCognitiveModel): Promise<CognitiveInsight>;
}

// 实现1：OpenAI LLM服务
export class OpenAIService implements LLMService {
  generateProposal(thoughtContent: string): Promise<CognitiveProposal> {
    // 使用OpenAI API生成建议
  }
  
  generateInsight(model: UserCognitiveModel): Promise<CognitiveInsight> {
    // 使用OpenAI API生成洞察
  }
}

// 实现2：本地LLM服务
export class LocalLLMService implements LLMService {
  generateProposal(thoughtContent: string): Promise<CognitiveProposal> {
    // 使用本地LLM生成建议
  }
  
  generateInsight(model: UserCognitiveModel): Promise<CognitiveInsight> {
    // 使用本地LLM生成洞察
  }
}

// 在Application层使用LLMService接口，不依赖具体实现
export class GenerateProposalUseCaseImpl implements GenerateProposalUseCase {
  private llmService: LLMService;
  private proposalRepository: CognitiveProposalRepository;
  
  // 通过构造函数注入LLMService，便于替换
  constructor(llmService: LLMService, proposalRepository: CognitiveProposalRepository) {
    this.llmService = llmService;
    this.proposalRepository = proposalRepository;
  }
  
  async execute(thoughtId: string): Promise<CognitiveProposal> {
    // 使用LLMService接口，不关心具体实现
    // ...
  }
}
```

### 2.3 里式替换原则（LSP）

**定义**：子类可以替换父类，而不会影响程序的正确性。

**代码示例**：
```typescript
// 遵循LSP：子类可以替换父类
interface ThoughtRepository {
  save(thought: ThoughtFragment): Promise<ThoughtFragment>;
  findById(id: string): Promise<ThoughtFragment | null>;
  findByUserId(userId: string): Promise<ThoughtFragment[]>;
  delete(id: string): Promise<void>;
}

// SQLite实现
export class SQLiteThoughtRepository implements ThoughtRepository {
  save(thought: ThoughtFragment): Promise<ThoughtFragment> {
    // SQLite保存逻辑
  }
  
  findById(id: string): Promise<ThoughtFragment | null> {
    // SQLite查询逻辑
  }
  
  findByUserId(userId: string): Promise<ThoughtFragment[]> {
    // SQLite查询逻辑
  }
  
  delete(id: string): Promise<void> {
    // SQLite删除逻辑
  }
}

// 内存实现（用于测试）
export class InMemoryThoughtRepository implements ThoughtRepository {
  private thoughts: Map<string, ThoughtFragment> = new Map();
  
  save(thought: ThoughtFragment): Promise<ThoughtFragment> {
    // 内存保存逻辑
  }
  
  findById(id: string): Promise<ThoughtFragment | null> {
    // 内存查询逻辑
  }
  
  findByUserId(userId: string): Promise<ThoughtFragment[]> {
    // 内存查询逻辑
  }
  
  delete(id: string): Promise<void> {
    // 内存删除逻辑
  }
}

// 使用时可以替换，不影响程序正确性
const useCase = new IngestThoughtUseCaseImpl(
  new SQLiteThoughtRepository(), // 可以替换为InMemoryThoughtRepository
  new EventBusImpl()
);
```

### 2.4 接口隔离原则（ISP）

**定义**：客户端不应该依赖它不需要的接口。

**代码示例**：
```typescript
// 遵循ISP：接口小而专一

// 只包含LLM服务需要的方法
interface LLMService {
  generateProposal(thoughtContent: string): Promise<CognitiveProposal>;
  generateInsight(model: UserCognitiveModel): Promise<CognitiveInsight>;
}

// 只包含嵌入服务需要的方法
interface EmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
  storeEmbedding(id: string, embedding: number[], metadata: any): Promise<void>;
  searchSimilarEmbeddings(query: number[], limit: number): Promise<any[]>;
}

// 客户端只依赖它需要的接口
class GenerateProposalUseCaseImpl implements GenerateProposalUseCase {
  // 只依赖LLMService，不依赖EmbeddingService
  private llmService: LLMService;
  private proposalRepository: CognitiveProposalRepository;
  
  constructor(llmService: LLMService, proposalRepository: CognitiveProposalRepository) {
    this.llmService = llmService;
    this.proposalRepository = proposalRepository;
  }
  
  // 实现...
}

class VectorSearchUseCaseImpl implements VectorSearchUseCase {
  // 只依赖EmbeddingService，不依赖LLMService
  private embeddingService: EmbeddingService;
  
  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
  }
  
  // 实现...
}
```

**反例**：
```typescript
// 违反ISP：接口包含过多方法
interface AIService {
  // LLM相关方法
  generateProposal(thoughtContent: string): Promise<CognitiveProposal>;
  generateInsight(model: UserCognitiveModel): Promise<CognitiveInsight>;
  
  // 嵌入相关方法
  generateEmbedding(text: string): Promise<number[]>;
  storeEmbedding(id: string, embedding: number[], metadata: any): Promise<void>;
  searchSimilarEmbeddings(query: number[], limit: number): Promise<any[]>;
  
  // 其他AI相关方法
  generateImage(prompt: string): Promise<string>;
  translate(text: string, targetLanguage: string): Promise<string>;
}

// 客户端必须依赖它不需要的方法
class GenerateProposalUseCaseImpl implements GenerateProposalUseCase {
  // 只需要generateProposal方法，但必须依赖整个AIService接口
  private aiService: AIService;
  private proposalRepository: CognitiveProposalRepository;
  
  constructor(aiService: AIService, proposalRepository: CognitiveProposalRepository) {
    this.aiService = aiService;
    this.proposalRepository = proposalRepository;
  }
  
  // 实现...
}
```

### 2.5 依赖倒置原则（DIP）

**定义**：高层模块不应依赖低层模块，两者都应依赖抽象；抽象不应依赖细节，细节应依赖抽象。

**代码示例**：
```typescript
// 遵循DIP：高层模块和低层模块都依赖抽象

// 抽象接口（Application层定义）
export interface ThoughtRepository {
  save(thought: ThoughtFragment): Promise<ThoughtFragment>;
  findById(id: string): Promise<ThoughtFragment | null>;
  findByUserId(userId: string): Promise<ThoughtFragment[]>;
  delete(id: string): Promise<void>;
}

// 高层模块（Application层）依赖抽象
class IngestThoughtUseCaseImpl implements IngestThoughtUseCase {
  private thoughtRepository: ThoughtRepository; // 依赖抽象
  private eventBus: EventBus; // 依赖抽象
  
  constructor(thoughtRepository: ThoughtRepository, eventBus: EventBus) {
    this.thoughtRepository = thoughtRepository;
    this.eventBus = eventBus;
  }
  
  async execute(input: ThoughtInputDto): Promise<ThoughtOutputDto> {
    // 使用抽象接口，不依赖具体实现
    const thought = new ThoughtFragmentImpl(
      uuidv4(),
      input.content,
      input.metadata || {},
      input.userId,
      new Date()
    );
    
    const savedThought = await this.thoughtRepository.save(thought);
    
    this.eventBus.publish('ThoughtIngested', {
      thoughtId: savedThought.id,
      content: savedThought.content,
      timestamp: new Date()
    });
    
    return {
      id: savedThought.id,
      content: savedThought.content,
      metadata: savedThought.metadata,
      userId: savedThought.userId,
      createdAt: savedThought.createdAt
    };
  }
}

// 低层模块（Infrastructure层）实现抽象
class SQLiteThoughtRepository implements ThoughtRepository {
  private connection: SQLiteConnection;
  
  constructor(connection: SQLiteConnection) {
    this.connection = connection;
  }
  
  async save(thought: ThoughtFragment): Promise<ThoughtFragment> {
    // 实现SQLite保存逻辑
  }
  
  // 其他方法实现...
}
```

### 2.6 迪米特法则（LoD）

**定义**：一个对象应该对其他对象有最少的了解。

**代码示例**：
```typescript
// 遵循LoD：每个对象只与直接朋友通信
class UpdateCognitiveModelUseCaseImpl implements UpdateCognitiveModelUseCase {
  private proposalRepository: CognitiveProposalRepository;
  private cognitiveModelRepository: CognitiveModelRepository;
  private cognitiveModelService: CognitiveModelService;
  private eventBus: EventBus;
  
  // 只依赖直接朋友：proposalRepository, cognitiveModelRepository, cognitiveModelService, eventBus
  constructor(
    proposalRepository: CognitiveProposalRepository,
    cognitiveModelRepository: CognitiveModelRepository,
    cognitiveModelService: CognitiveModelService,
    eventBus: EventBus
  ) {
    this.proposalRepository = proposalRepository;
    this.cognitiveModelRepository = cognitiveModelRepository;
    this.cognitiveModelService = cognitiveModelService;
    this.eventBus = eventBus;
  }
  
  async execute(proposalId: string): Promise<UserCognitiveModel> {
    // 只与直接朋友通信，不访问朋友的朋友
    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with id ${proposalId} not found`);
    }
    
    const model = await this.cognitiveModelRepository.findByUserId(proposal.userId);
    if (!model) {
      // 创建新模型
      const newModel = new UserCognitiveModelImpl(uuidv4(), proposal.userId);
      model = newModel;
    }
    
    // 使用CognitiveModelService处理模型更新（直接朋友）
    model.applyProposal(proposal);
    this.cognitiveModelService.maintainConsistency(model);
    
    const updatedModel = await this.cognitiveModelRepository.save(model);
    
    this.eventBus.publish('CognitiveModelUpdated', {
      modelId: updatedModel.id,
      timestamp: new Date(),
      changes: {
        proposalId: proposal.id,
        addedConcepts: proposal.concepts.length,
        addedRelations: proposal.relations.length
      }
    });
    
    return updatedModel;
  }
}
```