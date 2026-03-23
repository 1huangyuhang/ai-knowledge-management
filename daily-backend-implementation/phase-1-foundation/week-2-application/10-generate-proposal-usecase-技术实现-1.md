# Day 10: GenerateProposalUseCase实现 - 代码实现文档 (Part 1)

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