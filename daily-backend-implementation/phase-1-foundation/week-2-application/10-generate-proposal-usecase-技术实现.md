# Day 10: GenerateProposalUseCase实现 - 代码实现文档

## 1. GenerateProposalUseCase概述

### 1.1 功能描述

GenerateProposalUseCase是系统的核心用例之一，负责根据用户的思维片段生成认知建议。它的主要功能包括：

- 从数据库中获取思维片段
- 调用AI服务生成认知建议
- 处理AI返回的结构化输出
- 将生成的认知建议保存到数据库
- 触发事件通知其他模块

### 1.2 依赖关系

| 依赖项 | 类型 | 用途 |
|--------|------|------|
| `ThoughtRepository` | 接口 | 负责获取思维片段 |
| `CognitiveProposalRepository` | 接口 | 负责保存认知建议 |
| `AIProposalService` | 接口 | 负责调用AI服务生成认知建议 |
| `EventBus` | 接口 | 负责事件的发布和订阅 |
| `InputValidator` | 服务 | 负责输入数据的验证 |
| `ErrorFactory` | 服务 | 负责创建标准化的错误对象 |

## 2. AI服务接口设计

### 2.1 核心AI服务接口

```typescript
// src/domain/interfaces/AIProposalService.ts
import { CognitiveProposal } from '../entities/CognitiveProposal';
import { ThoughtFragment } from '../entities/ThoughtFragment';

/**
 * AI建议服务接口，用于从思维片段生成认知建议
 */
export interface AIProposalService {
  /**
   * 从思维片段生成认知建议
   * @param thought 思维片段实体
   * @returns 生成的认知建议
   */
  generateProposal(thought: ThoughtFragment): Promise<CognitiveProposal>;
}
```

### 2.2 LLM客户端接口

```typescript
// src/domain/interfaces/LLMClient.ts
/**
 * LLM客户端接口，用于调用大型语言模型
 */
export interface LLMClient {
  /**
   * 调用LLM API
   * @param prompt 提示词
   * @param options 调用选项
   * @returns LLM返回的结果
   */
  call(prompt: string, options?: LLMCallOptions): Promise<LLMResponse>;
}

/**
 * LLM调用选项
 */
export interface LLMCallOptions {
  /**
   * 模型名称
   */
  model?: string;
  /**
   * 温度参数，控制输出的随机性
   */
  temperature?: number;
  /**
   * 最大输出token数
   */
  maxTokens?: number;
  /**
   * 是否返回结构化输出
   */
  structuredOutput?: boolean;
  /**
   * 结构化输出的schema
   */
  outputSchema?: any;
}

/**
 * LLM响应
 */
export interface LLMResponse {
  /**
   * 响应文本
   */
  text: string;
  /**
   * 结构化响应
   */
  structuredData?: any;
  /**
   * 调用耗时（毫秒）
   */
  latency?: number;
  /**
   * 消耗的token数
   */
  tokenUsage?: {
    /**
     * 输入token数
     */
    input: number;
    /**
     * 输出token数
     */
    output: number;
    /**
     * 总token数
     */
    total: number;
  };
}
```

## 3. AI服务实现

### 3.1 基础AI服务实现

```typescript
// src/infrastructure/ai/BaseAIService.ts
import { LLMClient } from '../../domain/interfaces/LLMClient';
import { AIProposalService } from '../../domain/interfaces/AIProposalService';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';
import { CognitiveProposal } from '../../domain/entities/CognitiveProposal';
import { ConceptCandidate } from '../../domain/value-objects/ConceptCandidate';
import { RelationCandidate } from '../../domain/value-objects/RelationCandidate';
import { RelationType } from '../../domain/value-objects/RelationType';

/**
 * 基础AI服务实现，提供了通用的AI服务功能
 */
export abstract class BaseAIService implements AIProposalService {
  /**
   * 构造函数
   * @param llmClient LLM客户端
   */
  protected constructor(
    protected readonly llmClient: LLMClient
  ) {}

  /**
   * 从思维片段生成认知建议
   * @param thought 思维片段实体
   * @returns 生成的认知建议
   */
  async generateProposal(thought: ThoughtFragment): Promise<CognitiveProposal> {
    // 1. 创建提示词
    const prompt = this.createPrompt(thought);

    // 2. 调用LLM
    const response = await this.llmClient.call(prompt, {
      structuredOutput: true,
      outputSchema: this.getOutputSchema(),
      temperature: 0.7,
      maxTokens: 2000
    });

    // 3. 处理响应
    if (!response.structuredData) {
      throw new Error('LLM did not return structured data');
    }

    // 4. 转换为认知建议实体
    return this.mapToCognitiveProposal(thought, response.structuredData);
  }

  /**
   * 创建提示词
   * @param thought 思维片段实体
   * @returns 生成的提示词
   */
  protected abstract createPrompt(thought: ThoughtFragment): string;

  /**
   * 获取输出schema
   * @returns 输出schema
   */
  protected abstract getOutputSchema(): any;

  /**
   * 将LLM响应映射为认知建议实体
   * @param thought 思维片段实体
   * @param data LLM响应的结构化数据
   * @returns 认知建议实体
   */
  protected abstract mapToCognitiveProposal(
    thought: ThoughtFragment,
    data: any
  ): CognitiveProposal;
}
```

### 3.2 认知建议AI服务实现

```typescript
// src/infrastructure/ai/CognitiveProposalService.ts
import { BaseAIService } from './BaseAIService';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';
import { CognitiveProposal } from '../../domain/entities/CognitiveProposal';
import { ConceptCandidate } from '../../domain/value-objects/ConceptCandidate';
import { RelationCandidate } from '../../domain/value-objects/RelationCandidate';
import { RelationType } from '../../domain/value-objects/RelationType';

/**
 * 认知建议AI服务实现，用于生成认知建议
 */
export class CognitiveProposalServiceImpl extends BaseAIService {
  /**
   * 创建提示词
   * @param thought 思维片段实体
   * @returns 生成的提示词
   */
  protected createPrompt(thought: ThoughtFragment): string {
    return `
      请分析以下思维片段，提取其中的认知概念和概念之间的关系：

      思维片段：${thought.content}

      请按照以下格式输出：
      {
        "concepts": [
          {
            "semanticIdentity": "概念的语义标识",
            "abstractionLevel": 概念的抽象级别（1-5）,
            "confidenceScore": 置信度（0-1）,
            "description": "概念的描述"
          }
        ],
        "relations": [
          {
            "sourceSemanticIdentity": "源概念的语义标识",
            "targetSemanticIdentity": "目标概念的语义标识",
            "relationType": "关系类型（depends_on, generalizes, contradicts, is_a, related_to）",
            "confidenceScore": 置信度（0-1）
          }
        ],
        "confidence": 整体置信度（0-1）,
        "reasoningTrace": ["推理步骤1", "推理步骤2"]
      }

      注意事项：
      1. 只输出JSON格式，不要包含其他内容
      2. 概念的抽象级别1表示最具体，5表示最抽象
      3. 关系类型必须从指定的选项中选择
      4. 置信度必须是0-1之间的数字
      5. 推理步骤要简洁明了
    `;
  }

  /**
   * 获取输出schema
   * @returns 输出schema
   */
  protected getOutputSchema(): any {
    return {
      type: 'object',
      properties: {
        concepts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              semanticIdentity: { type: 'string' },
              abstractionLevel: { type: 'number', minimum: 1, maximum: 5 },
              confidenceScore: { type: 'number', minimum: 0, maximum: 1 },
              description: { type: 'string' }
            },
            required: ['semanticIdentity', 'abstractionLevel', 'confidenceScore', 'description']
          }
        },
        relations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sourceSemanticIdentity: { type: 'string' },
              targetSemanticIdentity: { type: 'string' },
              relationType: {
                type: 'string',
                enum: ['depends_on', 'generalizes', 'contradicts', 'is_a', 'related_to']
              },
              confidenceScore: { type: 'number', minimum: 0, maximum: 1 }
            },
            required: ['sourceSemanticIdentity', 'targetSemanticIdentity', 'relationType', 'confidenceScore']
          }
        },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        reasoningTrace: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['concepts', 'relations', 'confidence', 'reasoningTrace']
    };
  }

  /**
   * 将LLM响应映射为认知建议实体
   * @param thought 思维片段实体
   * @param data LLM响应的结构化数据
   * @returns 认知建议实体
   */
  protected mapToCognitiveProposal(
    thought: ThoughtFragment,
    data: any
  ): CognitiveProposal {
    // 转换概念候选
    const conceptCandidates: ConceptCandidate[] = data.concepts.map((concept: any) => ({
      semanticIdentity: concept.semanticIdentity,
      abstractionLevel: concept.abstractionLevel,
      confidenceScore: concept.confidenceScore,
      description: concept.description
    }));

    // 转换关系候选
    const relationCandidates: RelationCandidate[] = data.relations.map((relation: any) => ({
      sourceSemanticIdentity: relation.sourceSemanticIdentity,
      targetSemanticIdentity: relation.targetSemanticIdentity,
      relationType: relation.relationType as RelationType,
      confidenceScore: relation.confidenceScore
    }));

    // 创建认知建议实体
    return new CognitiveProposal(
      crypto.randomUUID(),
      thought.id,
      conceptCandidates,
      relationCandidates,
      data.confidence,
      data.reasoningTrace
    );
  }
}
```

### 3.3 LLM客户端实现

```typescript
// src/infrastructure/ai/OpenAILLMClient.ts
import { LLMClient, LLMCallOptions, LLMResponse } from '../../domain/interfaces/LLMClient';

/**
 * OpenAI LLM客户端实现
 */
export class OpenAILLMClient implements LLMClient {
  /**
   * 构造函数
   * @param apiKey OpenAI API密钥
   * @param baseUrl OpenAI API基础URL
   */
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = 'https://api.openai.com/v1'
  ) {}

  /**
   * 调用LLM API
   * @param prompt 提示词
   * @param options 调用选项
   * @returns LLM返回的结果
   */
  async call(prompt: string, options: LLMCallOptions = {}): Promise<LLMResponse> {
    const startTime = Date.now();

    // 构建请求体
    const requestBody = {
      model: options.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes text and extracts cognitive concepts and relationships.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      response_format: options.structuredOutput ? {
        type: 'json_object'
      } : undefined
    };

    // 发送请求
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const responseData = await response.json();
    const endTime = Date.now();

    // 处理响应
    const content = responseData.choices[0].message.content;
    let structuredData = undefined;

    if (options.structuredOutput && content) {
      try {
        structuredData = JSON.parse(content);
      } catch (error) {
        throw new Error(`Failed to parse LLM response as JSON: ${content}`);
      }
    }

    return {
      text: content || '',
      structuredData,
      latency: endTime - startTime,
      tokenUsage: {
        input: responseData.usage.prompt_tokens,
        output: responseData.usage.completion_tokens,
        total: responseData.usage.total_tokens
      }
    };
  }
}
```

## 4. GenerateProposalUseCase实现

### 4.1 核心实现

```typescript
// src/application/usecases/GenerateProposalUseCaseImpl.ts
import { GenerateProposalUseCase } from './GenerateProposalUseCase';
import { ThoughtRepository } from '../../domain/interfaces/ThoughtRepository';
import { CognitiveProposalRepository } from '../../domain/interfaces/CognitiveProposalRepository';
import { AIProposalService } from '../../domain/interfaces/AIProposalService';
import { EventBus } from '../../domain/interfaces/EventBus';
import { InputValidator } from '../../shared/validators/InputValidator';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { CognitiveProposal } from '../../domain/entities/CognitiveProposal';

/**
 * 生成认知建议用例的实现
 */
export class GenerateProposalUseCaseImpl implements GenerateProposalUseCase {
  /**
   * 构造函数，通过依赖注入获取所需的服务
   */
  constructor(
    private readonly thoughtRepository: ThoughtRepository,
    private readonly cognitiveProposalRepository: CognitiveProposalRepository,
    private readonly aiProposalService: AIProposalService,
    private readonly eventBus: EventBus,
    private readonly inputValidator: InputValidator
  ) {}

  /**
   * 执行用例
   * @param thoughtId 思维片段ID
   * @returns 生成的认知建议
   * @throws ValidationError 如果输入数据无效
   * @throws NotFoundError 如果思维片段不存在
   * @throws Error 如果执行过程中发生其他错误
   */
  async execute(thoughtId: string): Promise<CognitiveProposal> {
    try {
      // 1. 验证输入数据
      if (!thoughtId) {
        throw new ValidationError('INVALID_INPUT', 'thoughtId is required');
      }

      // 2. 获取思维片段
      const thought = await this.thoughtRepository.findById(thoughtId);
      if (!thought) {
        throw new NotFoundError(`Thought with id ${thoughtId} not found`);
      }

      // 3. 调用AI服务生成认知建议
      const proposal = await this.aiProposalService.generateProposal(thought);

      // 4. 保存认知建议到数据库
      const savedProposal = await this.cognitiveProposalRepository.save(proposal);

      // 5. 发布事件
      this.eventBus.publish('CognitiveProposalGenerated', {
        proposalId: savedProposal.id,
        thoughtId: savedProposal.thoughtId,
        timestamp: new Date()
      });

      // 6. 返回结果
      return savedProposal;
    } catch (error) {
      // 处理错误
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(`Failed to generate proposal: ${error.message}`);
    }
  }
}
```

### 4.2 CognitiveProposal实体

```typescript
// src/domain/entities/CognitiveProposal.ts
import { BaseEntity } from './BaseEntity';
import { ConceptCandidate } from '../value-objects/ConceptCandidate';
import { RelationCandidate } from '../value-objects/RelationCandidate';

/**
 * 认知建议实体，代表AI生成的认知建议
 */
export class CognitiveProposal extends BaseEntity {
  /**
   * 构造函数
   * @param id 唯一标识符
   * @param thoughtId 关联的思维片段ID
   * @param concepts 概念候选列表
   * @param relations 关系候选列表
   * @param confidence 整体置信度
   * @param reasoningTrace 推理过程
   * @param createdAt 创建时间
   */
  constructor(
    id: string,
    public readonly thoughtId: string,
    public readonly concepts: ConceptCandidate[],
    public readonly relations: RelationCandidate[],
    public readonly confidence: number,
    public readonly reasoningTrace: string[],
    createdAt: Date = new Date()
  ) {
    super(id, createdAt);
  }
}
```

### 4.3 值对象定义

```typescript
// src/domain/value-objects/ConceptCandidate.ts
/**
 * 概念候选值对象，代表AI提取的概念候选
 */
export interface ConceptCandidate {
  /**
   * 语义标识
   */
  semanticIdentity: string;
  /**
   * 抽象级别，1-5
   */
  abstractionLevel: number;
  /**
   * 置信度，0-1
   */
  confidenceScore: number;
  /**
   * 描述
   */
  description: string;
}

// src/domain/value-objects/RelationCandidate.ts
import { RelationType } from './RelationType';

/**
 * 关系候选值对象，代表AI提取的关系候选
 */
export interface RelationCandidate {
  /**
   * 源概念语义标识
   */
  sourceSemanticIdentity: string;
  /**
   * 目标概念语义标识
   */
  targetSemanticIdentity: string;
  /**
   * 关系类型
   */
  relationType: RelationType;
  /**
   * 置信度，0-1
   */
  confidenceScore: number;
}

// src/domain/value-objects/RelationType.ts
/**
 * 关系类型枚举
 */
export enum RelationType {
  /**
   * 依赖关系
   */
  DEPENDS_ON = 'depends_on',
  /**
   * 泛化关系
   */
  GENERALIZES = 'generalizes',
  /**
   * 矛盾关系
   */
  CONTRADICTS = 'contradicts',
  /**
   * 是一种关系
   */
  IS_A = 'is_a',
  /**
   * 相关关系
   */
  RELATED_TO = 'related_to'
}
```

## 5. 数据持久化实现

### 5.1 CognitiveProposalRepository接口

```typescript
// src/domain/interfaces/CognitiveProposalRepository.ts
import { CognitiveProposal } from '../entities/CognitiveProposal';

/**
 * 认知建议仓库接口，定义了认知建议的CRUD操作
 */
export interface CognitiveProposalRepository {
  /**
   * 保存认知建议
   * @param proposal 认知建议实体
   * @returns 保存后的认知建议实体
   */
  save(proposal: CognitiveProposal): Promise<CognitiveProposal>;

  /**
   * 根据ID查找认知建议
   * @param id 认知建议ID
   * @returns 认知建议实体或null
   */
  findById(id: string): Promise<CognitiveProposal | null>;

  /**
   * 根据思维片段ID查找认知建议
   * @param thoughtId 思维片段ID
   * @returns 认知建议实体数组
   */
  findByThoughtId(thoughtId: string): Promise<CognitiveProposal[]>;
}
```

### 5.2 SQLite实现

```typescript
// src/infrastructure/persistence/repositories/SQLiteCognitiveProposalRepository.ts
import { CognitiveProposalRepository } from '../../../domain/interfaces/CognitiveProposalRepository';
import { CognitiveProposal } from '../../../domain/entities/CognitiveProposal';
import { SQLiteConnection } from '../SQLiteConnection';
import { ConceptCandidate } from '../../../domain/value-objects/ConceptCandidate';
import { RelationCandidate } from '../../../domain/value-objects/RelationCandidate';

/**
 * SQLite实现的认知建议仓库
 */
export class SQLiteCognitiveProposalRepository implements CognitiveProposalRepository {
  /**
   * 构造函数
   * @param connection SQLite连接
   */
  constructor(private readonly connection: SQLiteConnection) {}

  /**
   * 保存认知建议
   */
  async save(proposal: CognitiveProposal): Promise<CognitiveProposal> {
    const sql = `
      INSERT INTO cognitive_proposals (
        id, 
        thought_id, 
        concepts, 
        relations, 
        confidence, 
        reasoning_trace, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.connection.execute(sql, [
      proposal.id,
      proposal.thoughtId,
      JSON.stringify(proposal.concepts),
      JSON.stringify(proposal.relations),
      proposal.confidence,
      JSON.stringify(proposal.reasoningTrace),
      proposal.createdAt.toISOString()
    ]);
    
    return proposal;
  }

  /**
   * 根据ID查找认知建议
   */
  async findById(id: string): Promise<CognitiveProposal | null> {
    const sql = `
      SELECT * FROM cognitive_proposals WHERE id = ?
    `;
    
    const rows = await this.connection.query(sql, [id]);
    if (rows.length === 0) {
      return null;
    }
    
    return this.mapRowToEntity(rows[0]);
  }

  /**
   * 根据思维片段ID查找认知建议
   */
  async findByThoughtId(thoughtId: string): Promise<CognitiveProposal[]> {
    const sql = `
      SELECT * FROM cognitive_proposals WHERE thought_id = ? ORDER BY created_at DESC
    `;
    
    const rows = await this.connection.query(sql, [thoughtId]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * 将数据库行映射为实体
   * @param row 数据库行
   * @returns 认知建议实体
   */
  private mapRowToEntity(row: any): CognitiveProposal {
    return new CognitiveProposal(
      row.id,
      row.thought_id,
      JSON.parse(row.concepts) as ConceptCandidate[],
      JSON.parse(row.relations) as RelationCandidate[],
      row.confidence,
      JSON.parse(row.reasoning_trace),
      new Date(row.created_at)
    );
  }
}
```

### 5.3 数据库初始化

```typescript
// src/infrastructure/persistence/SQLiteConnection.ts
// 扩展init方法，添加cognitive_proposals表的创建
async init(): Promise<void> {
  this.db = await open({
    filename: this.dbPath,
    driver: sqlite3.Database
  });

  // 创建表
  await this.db.exec(`
    -- 创建思维片段表
    CREATE TABLE IF NOT EXISTS thought_fragments (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 创建认知建议表
    CREATE TABLE IF NOT EXISTS cognitive_proposals (
      id TEXT PRIMARY KEY,
      thought_id TEXT NOT NULL,
      concepts TEXT NOT NULL,
      relations TEXT NOT NULL,
      confidence REAL NOT NULL,
      reasoning_trace TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (thought_id) REFERENCES thought_fragments(id)
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON thought_fragments(user_id);
    CREATE INDEX IF NOT EXISTS idx_cognitive_proposals_thought_id ON cognitive_proposals(thought_id);
  `);
}
```

## 6. 事件触发机制

### 6.1 事件监听器实现

```typescript
// src/infrastructure/event-listeners/CognitiveProposalGeneratedListener.ts
import { EventBus } from '../../domain/interfaces/EventBus';
import { UpdateCognitiveModelUseCase } from '../../application/usecases/UpdateCognitiveModelUseCase';

/**
 * 认知建议生成事件监听器，用于在认知建议生成后更新认知模型
 */
export class CognitiveProposalGeneratedListener {
  /**
   * 构造函数
   * @param eventBus 事件总线
   * @param updateCognitiveModelUseCase 更新认知模型用例
   */
  constructor(
    eventBus: EventBus,
    private readonly updateCognitiveModelUseCase: UpdateCognitiveModelUseCase
  ) {
    // 订阅CognitiveProposalGenerated事件
    eventBus.subscribe('CognitiveProposalGenerated', this.handle.bind(this));
  }

  /**
   * 处理CognitiveProposalGenerated事件
   * @param event 事件数据
   */
  private async handle(event: { proposalId: string }): Promise<void> {
    try {
      // 调用更新认知模型用例
      await this.updateCognitiveModelUseCase.execute(event.proposalId);
    } catch (error) {
      console.error(`Error updating cognitive model for proposal ${event.proposalId}:`, error);
    }
  }
}
```

## 7. 测试策略

### 7.1 单元测试

```typescript
// src/application/usecases/__tests__/GenerateProposalUseCaseImpl.test.ts
import { GenerateProposalUseCaseImpl } from '../GenerateProposalUseCaseImpl';
import { AIProposalService } from '../../../domain/interfaces/AIProposalService';
import { NotFoundError, ValidationError } from '../../../shared/errors';

// 模拟依赖
const mockThoughtRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  delete: jest.fn()
};

const mockCognitiveProposalRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByThoughtId: jest.fn()
};

const mockAIProposalService: jest.Mocked<AIProposalService> = {
  generateProposal: jest.fn()
};

const mockEventBus = {
  subscribe: jest.fn(),
  publish: jest.fn()
};

const mockInputValidator = {
  validateThoughtInput: jest.fn(input => input)
};

describe('GenerateProposalUseCaseImpl', () => {
  let useCase: GenerateProposalUseCaseImpl;

  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    // 创建Use Case实例
    useCase = new GenerateProposalUseCaseImpl(
      mockThoughtRepository,
      mockCognitiveProposalRepository,
      mockAIProposalService,
      mockEventBus,
      mockInputValidator as any
    );
  });

  it('should generate a proposal correctly', async () => {
    // 准备测试数据
    const thoughtId = 'thought-1';
    const mockThought = {
      id: thoughtId,
      content: '测试思维片段',
      metadata: {},
      userId: 'user-1',
      createdAt: new Date()
    };

    const mockProposal = {
      id: 'proposal-1',
      thoughtId,
      concepts: [],
      relations: [],
      confidence: 0.9,
      reasoningTrace: ['reasoning'],
      createdAt: new Date()
    };

    // 设置模拟返回值
    mockThoughtRepository.findById.mockResolvedValue(mockThought as any);
    mockAIProposalService.generateProposal.mockResolvedValue(mockProposal as any);
    mockCognitiveProposalRepository.save.mockResolvedValue(mockProposal as any);

    // 执行Use Case
    const result = await useCase.execute(thoughtId);

    // 验证结果
    expect(result).toBeDefined();
    expect(mockThoughtRepository.findById).toHaveBeenCalledWith(thoughtId);
    expect(mockAIProposalService.generateProposal).toHaveBeenCalledWith(mockThought);
    expect(mockCognitiveProposalRepository.save).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalledWith('CognitiveProposalGenerated', expect.any(Object));
  });

  it('should throw ValidationError for empty thoughtId', async () => {
    // 执行Use Case并验证是否抛出错误
    await expect(useCase.execute('')).rejects.toThrow(ValidationError);
  });

  it('should throw NotFoundError for non-existent thought', async () => {
    // 设置模拟返回null
    mockThoughtRepository.findById.mockResolvedValue(null);

    // 执行Use Case并验证是否抛出错误
    await expect(useCase.execute('non-existent-id')).rejects.toThrow(NotFoundError);
  });
});
```

### 7.2 集成测试

```typescript
// src/integration-tests/generate-proposal.test.ts
import { FastifyInstance } from 'fastify';
import request from 'supertest';
import { createApp } from '../presentation/app';

describe('Generate Proposal Integration Test', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    // 创建Fastify应用实例
    app = await createApp();
  });

  afterEach(async () => {
    // 关闭应用实例
    await app.close();
  });

  it('should generate a proposal for a thought', async () => {
    // 1. 首先创建一个思维片段
    const thoughtResponse = await request(app.server)
      .post('/api/v1/thoughts')
      .send({
        content: '集成测试思维片段',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      })
      .set('Accept', 'application/json');

    expect(thoughtResponse.status).toBe(201);
    const thoughtId = thoughtResponse.body.id;

    // 2. 然后生成认知建议
    const proposalResponse = await request(app.server)
      .post(`/api/v1/proposals/generate?thoughtId=${thoughtId}`)
      .set('Accept', 'application/json');

    // 验证响应
    expect(proposalResponse.status).toBe(200);
    expect(proposalResponse.body).toHaveProperty('id');
    expect(proposalResponse.body.thoughtId).toBe(thoughtId);
  });

  it('should return 404 for non-existent thought', async () => {
    // 发送请求，使用不存在的思维片段ID
    const response = await request(app.server)
      .post(`/api/v1/proposals/generate?thoughtId=non-existent-id`)
      .set('Accept', 'application/json');

    // 验证响应
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
  });
});
```

## 8. API接口实现

### 8.1 控制器实现

```typescript
// src/presentation/controllers/CognitiveProposalController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { GenerateProposalUseCase } from '../../application/usecases/GenerateProposalUseCase';

/**
 * 认知建议控制器，处理与认知建议相关的HTTP请求
 */
export class CognitiveProposalController {
  /**
   * 构造函数
   * @param generateProposalUseCase 生成认知建议用例
   */
  constructor(private readonly generateProposalUseCase: GenerateProposalUseCase) {}

  /**
   * 处理POST /api/v1/proposals/generate请求，用于生成认知建议
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async generateProposal(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // 获取思维片段ID
      const { thoughtId } = request.query as { thoughtId: string };
      // 调用生成认知建议用例
      const result = await this.generateProposalUseCase.execute(thoughtId);
      // 返回200 OK响应
      reply.status(200).send(result);
    } catch (error) {
      // 错误会被全局错误处理中间件捕获
      throw error;
    }
  }
}
```

### 8.2 路由配置

```typescript
// src/presentation/routes/cognitiveProposalRoutes.ts
import { FastifyInstance } from 'fastify';
import { CognitiveProposalController } from '../controllers/CognitiveProposalController';

/**
 * 认知建议路由配置
 * @param app Fastify实例
 * @param cognitiveProposalController 认知建议控制器
 */
export const cognitiveProposalRoutes = (
  app: FastifyInstance,
  cognitiveProposalController: CognitiveProposalController
): void => {
  // 生成认知建议
  app.post('/api/v1/proposals/generate', (request, reply) => 
    cognitiveProposalController.generateProposal(request, reply)
  );
};
```

### 8.3 应用初始化

```typescript
// src/presentation/app.ts
// 扩展createApp函数，添加认知建议相关的依赖和路由

export async function createApp(): Promise<ReturnType<typeof fastify>> {
  // ... 现有代码 ...

  // 初始化AI服务依赖
  const llmClient = new OpenAILLMClient(process.env.OPENAI_API_KEY || '');
  const aiProposalService = new CognitiveProposalServiceImpl(llmClient);

  // 创建认知建议仓库
  const cognitiveProposalRepository = new SQLiteCognitiveProposalRepository(sqliteConnection);

  // 创建Use Case实例
  const generateProposalUseCase = new GenerateProposalUseCaseImpl(
    thoughtRepository,
    cognitiveProposalRepository,
    aiProposalService,
    eventBus,
    inputValidator
  );

  // 创建控制器实例
  const cognitiveProposalController = new CognitiveProposalController(generateProposalUseCase);

  // 注册路由
  thoughtRoutes(app, thoughtController);
  cognitiveProposalRoutes(app, cognitiveProposalController);

  return app;
}
```

## 9. 总结

Day 10的核心任务是实现GenerateProposalUseCase，这是系统中连接AI服务和认知模型的关键用例。通过今天的开发，我们完成了以下工作：

1. 设计了AI服务接口，包括AIProposalService和LLMClient
2. 实现了基于OpenAI的LLM客户端
3. 实现了认知建议生成服务，包括提示词设计和结构化输出处理
4. 实现了GenerateProposalUseCase的核心逻辑
5. 实现了认知建议的数据持久化
6. 添加了事件触发机制，在认知建议生成后通知其他模块
7. 编写了单元测试和集成测试
8. 实现了API接口

今天的实现遵循了Clean Architecture和DDD设计原则，确保了代码的可维护性、可扩展性和可测试性。我们使用了依赖注入模式，将Use Case与具体的实现细节解耦，使得系统更容易测试和扩展。

在后续的开发中，我们将继续实现UpdateCognitiveModelUseCase，用于将生成的认知建议应用到用户的认知模型中。