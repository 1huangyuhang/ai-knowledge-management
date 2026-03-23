# Day 42: 第二阶段 - AI融合期 - 第42天 - 关系推断技术实现

## 1. 功能概述

关系推断是认知结构建模的核心组件，负责从解析出的认知概念中推断出概念间的关系，构建完整的认知图结构。本模块基于已有的认知概念，通过规则引擎和AI辅助方法，自动推断出概念间的关联关系，并为每个关系分配置信度评分。

## 2. 核心接口定义

### 2.1 关系推断服务接口

```typescript
// src/domain/services/RelationInferenceService.ts

/**
 * 关系类型枚举
 */
export enum RelationType {
  /** 父子关系 - 概念A是概念B的子概念 */
  PARENT_CHILD = 'PARENT_CHILD',
  /** 关联关系 - 概念A与概念B相关联 */
  ASSOCIATION = 'ASSOCIATION',
  /** 因果关系 - 概念A导致概念B */
  CAUSAL = 'CAUSAL',
  /** 等价关系 - 概念A与概念B等价 */
  EQUIVALENCE = 'EQUIVALENCE',
  /** 属性关系 - 概念A具有属性B */
  ATTRIBUTE = 'ATTRIBUTE',
  /** 实例关系 - 概念A是概念B的实例 */
  INSTANCE_OF = 'INSTANCE_OF'
}

/**
 * 关系推断结果
 */
export interface InferredRelation {
  /** 源概念ID */
  sourceConceptId: string;
  /** 目标概念ID */
  targetConceptId: string;
  /** 关系类型 */
  relationType: RelationType;
  /** 置信度评分 (0-1) */
  confidence: number;
  /** 推断依据 */
  inferenceBasis: string;
  /** 推断时间 */
  inferredAt: Date;
}

/**
 * 关系推断上下文
 */
export interface RelationInferenceContext {
  /** 当前用户的认知模型ID */
  cognitiveModelId: string;
  /** 待推断关系的概念列表 */
  concepts: CognitiveConcept[];
  /** 已有的关系列表 */
  existingRelations: CognitiveRelation[];
  /** 关系推断配置 */
  config?: RelationInferenceConfig;
}

/**
 * 关系推断配置
 */
export interface RelationInferenceConfig {
  /** 最小置信度阈值 */
  minConfidenceThreshold: number;
  /** 是否启用AI辅助推断 */
  enableAIAssistedInference: boolean;
  /** 是否考虑现有关系 */
  considerExistingRelations: boolean;
  /** 推断深度 */
  inferenceDepth: number;
}

/**
 * 关系推断服务接口
 */
export interface RelationInferenceService {
  /**
   * 推断概念间的关系
   * @param context 关系推断上下文
   * @returns 推断出的关系列表
   */
  inferRelations(context: RelationInferenceContext): Promise<InferredRelation[]>;
  
  /**
   * 验证推断关系的有效性
   * @param relation 待验证的推断关系
   * @param context 关系推断上下文
   * @returns 验证结果
   */
  validateInferredRelation(relation: InferredRelation, context: RelationInferenceContext): Promise<boolean>;
  
  /**
   * 设置关系推断配置
   * @param config 关系推断配置
   */
  setConfig(config: RelationInferenceConfig): void;
  
  /**
   * 获取当前关系推断配置
   * @returns 当前配置
   */
  getConfig(): RelationInferenceConfig;
}
```

### 2.2 关系推断策略接口

```typescript
// src/application/services/cognitive/relation/RelationInferenceStrategy.ts

/**
 * 关系推断策略接口
 */
export interface RelationInferenceStrategy {
  /**
   * 策略名称
   */
  readonly name: string;
  
  /**
   * 策略优先级 (0-100, 数值越高优先级越高)
   */
  readonly priority: number;
  
  /**
   * 应用该策略推断关系
   * @param context 关系推断上下文
   * @returns 推断出的关系列表
   */
  infer(context: RelationInferenceContext): Promise<InferredRelation[]>;
  
  /**
   * 检查该策略是否适用于当前上下文
   * @param context 关系推断上下文
   * @returns 是否适用
   */
  isApplicable(context: RelationInferenceContext): boolean;
}
```

## 3. 算法逻辑

### 3.1 关系推断流程

```
+---------------------+
|  输入: 认知概念列表  |
+---------------------+
          |
          v
+---------------------+
|  初始化推断上下文   |
+---------------------+
          |
          v
+---------------------+
|  加载推断策略列表   |
+---------------------+
          |
          v
+---------------------+
|  按优先级排序策略   |
+---------------------+
          |
          v
+---------------------+
|  策略1: 规则引擎推断 |
|  - 基于预定义规则   |
|  - 语法分析        |
|  - 语义匹配        |
+---------------------+
          |
          v
+---------------------+
|  策略2: 向量相似度推断 |
|  - 计算概念向量相似度 |
|  - 基于阈值过滤      |
+---------------------+
          |
          v
+---------------------+
|  策略3: AI辅助推断   |
|  - 调用LLM生成关系   |
|  - 解析结构化输出    |
+---------------------+
          |
          v
+---------------------+
|  合并推断结果       |
|  - 去重处理        |
|  - 冲突解决        |
+---------------------+
          |
          v
+---------------------+
|  置信度评分        |
|  - 多维度评分       |
|  - 加权融合        |
+---------------------+
          |
          v
+---------------------+
|  关系验证          |
|  - 结构一致性检查    |
|  - 逻辑合理性验证    |
+---------------------+
          |
          v
+---------------------+
|  输出: 推断关系列表  |
+---------------------+
```

### 3.2 关系推断算法

#### 3.2.1 规则引擎推断算法

```typescript
// src/infrastructure/cognitive/relation/RuleBasedRelationInferenceStrategy.ts

/**
 * 规则引擎关系推断策略
 */
export class RuleBasedRelationInferenceStrategy implements RelationInferenceStrategy {
  readonly name = 'RuleBased';
  readonly priority = 90;
  
  private readonly relationRules: Array<{
    pattern: RegExp;
    relationType: RelationType;
    confidence: number;
  }>;
  
  constructor() {
    // 初始化规则库
    this.relationRules = [
      {
        pattern: /(?:是|属于|为)(?:\s+|_)([\w\s]+)的(?:\s+|_)([\w\s]+)/i,
        relationType: RelationType.INSTANCE_OF,
        confidence: 0.9
      },
      {
        pattern: /(?:导致|引起|造成)(?:\s+|_)([\w\s]+)/i,
        relationType: RelationType.CAUSAL,
        confidence: 0.85
      },
      {
        pattern: /(?:包含|包括)(?:\s+|_)([\w\s]+)/i,
        relationType: RelationType.PARENT_CHILD,
        confidence: 0.8
      },
      // 更多规则...
    ];
  }
  
  async infer(context: RelationInferenceContext): Promise<InferredRelation[]> {
    const inferredRelations: InferredRelation[] = [];
    
    // 对每对概念应用规则匹配
    for (let i = 0; i < context.concepts.length; i++) {
      for (let j = i + 1; j < context.concepts.length; j++) {
        const sourceConcept = context.concepts[i];
        const targetConcept = context.concepts[j];
        
        // 尝试匹配所有规则
        for (const rule of this.relationRules) {
          // 检查概念描述中的关系模式
          const sourceMatch = rule.pattern.test(sourceConcept.description);
          const targetMatch = rule.pattern.test(targetConcept.description);
          const combinedMatch = rule.pattern.test(`${sourceConcept.description} ${targetConcept.description}`);
          
          if (sourceMatch || targetMatch || combinedMatch) {
            inferredRelations.push({
              sourceConceptId: sourceConcept.id,
              targetConceptId: targetConcept.id,
              relationType: rule.relationType,
              confidence: rule.confidence,
              inferenceBasis: `Rule-based matching: ${rule.pattern.source}`,
              inferredAt: new Date()
            });
          }
        }
      }
    }
    
    return inferredRelations;
  }
  
  isApplicable(context: RelationInferenceContext): boolean {
    return context.concepts.length >= 2;
  }
}
```

#### 3.2.2 向量相似度推断算法

```typescript
// src/infrastructure/cognitive/relation/VectorSimilarityRelationInferenceStrategy.ts

/**
 * 向量相似度关系推断策略
 */
export class VectorSimilarityRelationInferenceStrategy implements RelationInferenceStrategy {
  readonly name = 'VectorSimilarity';
  readonly priority = 80;
  
  private readonly similarityThreshold = 0.7;
  private readonly embeddingService: EmbeddingService;
  
  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
  }
  
  async infer(context: RelationInferenceContext): Promise<InferredRelation[]> {
    const inferredRelations: InferredRelation[] = [];
    
    // 计算所有概念的向量表示
    const conceptEmbeddings = await Promise.all(
      context.concepts.map(async (concept) => ({
        concept,
        embedding: await this.embeddingService.generateEmbedding({
          text: `${concept.name} ${concept.description}`,
          model: 'text-embedding-ada-002'
        })
      }))
    );
    
    // 计算概念间的相似度
    for (let i = 0; i < conceptEmbeddings.length; i++) {
      for (let j = i + 1; j < conceptEmbeddings.length; j++) {
        const source = conceptEmbeddings[i];
        const target = conceptEmbeddings[j];
        
        // 计算余弦相似度
        const similarity = this.cosineSimilarity(source.embedding.vector, target.embedding.vector);
        
        // 如果相似度超过阈值，推断关联关系
        if (similarity >= this.similarityThreshold) {
          inferredRelations.push({
            sourceConceptId: source.concept.id,
            targetConceptId: target.concept.id,
            relationType: RelationType.ASSOCIATION,
            confidence: similarity,
            inferenceBasis: `Vector similarity: ${similarity.toFixed(3)}`,
            inferredAt: new Date()
          });
        }
      }
    }
    
    return inferredRelations;
  }
  
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    // 计算余弦相似度
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
  
  isApplicable(context: RelationInferenceContext): boolean {
    return context.concepts.length >= 2;
  }
}
```

#### 3.2.3 AI辅助推断算法

```typescript
// src/infrastructure/cognitive/relation/AIAssistedRelationInferenceStrategy.ts

/**
 * AI辅助关系推断策略
 */
export class AIAssistedRelationInferenceStrategy implements RelationInferenceStrategy {
  readonly name = 'AIAssisted';
  readonly priority = 70;
  
  private readonly llmClient: LLMClient;
  private readonly maxBatchSize = 5;
  
  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }
  
  async infer(context: RelationInferenceContext): Promise<InferredRelation[]> {
    if (!context.config?.enableAIAssistedInference) {
      return [];
    }
    
    const inferredRelations: InferredRelation[] = [];
    
    // 准备AI提示
    const prompt = this.buildPrompt(context);
    
    try {
      // 调用LLM获取关系推断结果
      const response = await this.llmClient.generate({
        prompt,
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 1000,
        format: 'json'
      });
      
      // 解析AI输出
      const aiResults = JSON.parse(response.content) as Array<{
        source: string;
        target: string;
        type: string;
        confidence: number;
        basis: string;
      }>;
      
      // 转换为标准推断关系格式
      for (const aiResult of aiResults) {
        const sourceConcept = context.concepts.find(c => c.name === aiResult.source);
        const targetConcept = context.concepts.find(c => c.name === aiResult.target);
        
        if (sourceConcept && targetConcept) {
          inferredRelations.push({
            sourceConceptId: sourceConcept.id,
            targetConceptId: targetConcept.id,
            relationType: RelationType[aiResult.type as keyof typeof RelationType],
            confidence: aiResult.confidence,
            inferenceBasis: `AI-assisted: ${aiResult.basis}`,
            inferredAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('AI-assisted relation inference failed:', error);
      // 失败时返回空列表，不影响其他策略
    }
    
    return inferredRelations;
  }
  
  private buildPrompt(context: RelationInferenceContext): string {
    const conceptDescriptions = context.concepts.map(concept => 
      `${concept.name}: ${concept.description}`
    ).join('\n');
    
    return `
你是一个认知关系推断专家，请分析以下概念列表，推断出概念之间的关系。

概念列表：
${conceptDescriptions}

请按照以下JSON格式输出推断结果：
[
  {
    "source": "概念A名称",
    "target": "概念B名称",
    "type": "关系类型(PARENT_CHILD/ASSOCIATION/CAUSAL/EQUIVALENCE/ATTRIBUTE/INSTANCE_OF)",
    "confidence": 0.9, // 0-1之间的置信度评分
    "basis": "推断依据"
  }
]

请只输出JSON格式，不要添加任何其他说明。
`;
  }
  
  isApplicable(context: RelationInferenceContext): boolean {
    return context.config?.enableAIAssistedInference && context.concepts.length >= 2;
  }
}
```

## 4. 实现步骤

### 4.1 实现关系推断服务

```typescript
// src/application/services/cognitive/relation/RelationInferenceServiceImpl.ts

/**
 * 关系推断服务实现
 */
export class RelationInferenceServiceImpl implements RelationInferenceService {
  private strategies: RelationInferenceStrategy[] = [];
  private config: RelationInferenceConfig;
  
  constructor(
    strategies: RelationInferenceStrategy[],
    defaultConfig?: Partial<RelationInferenceConfig>
  ) {
    // 按优先级排序策略
    this.strategies = strategies.sort((a, b) => b.priority - a.priority);
    
    // 初始化默认配置
    this.config = {
      minConfidenceThreshold: 0.6,
      enableAIAssistedInference: true,
      considerExistingRelations: true,
      inferenceDepth: 2,
      ...defaultConfig
    };
  }
  
  async inferRelations(context: RelationInferenceContext): Promise<InferredRelation[]> {
    // 合并配置
    const inferenceContext = {
      ...context,
      config: {
        ...this.config,
        ...context.config
      }
    };
    
    let allInferredRelations: InferredRelation[] = [];
    
    // 应用所有适用的策略
    for (const strategy of this.strategies) {
      if (strategy.isApplicable(inferenceContext)) {
        const relations = await strategy.infer(inferenceContext);
        allInferredRelations = [...allInferredRelations, ...relations];
      }
    }
    
    // 去重和合并重复关系
    const uniqueRelations = this.deduplicateRelations(allInferredRelations);
    
    // 过滤掉置信度低于阈值的关系
    const filteredRelations = uniqueRelations.filter(
      relation => relation.confidence >= inferenceContext.config.minConfidenceThreshold
    );
    
    // 验证关系有效性
    const validRelations = await Promise.all(
      filteredRelations.map(async relation => {
        const isValid = await this.validateInferredRelation(relation, inferenceContext);
        return isValid ? relation : null;
      })
    );
    
    return validRelations.filter((relation): relation is InferredRelation => relation !== null);
  }
  
  async validateInferredRelation(relation: InferredRelation, context: RelationInferenceContext): Promise<boolean> {
    // 检查关系是否存在循环依赖
    if (await this.hasCircularDependency(relation, context)) {
      return false;
    }
    
    // 检查关系类型是否兼容
    if (!this.isRelationTypeCompatible(relation, context)) {
      return false;
    }
    
    // 检查是否与现有关系冲突
    if (context.config?.considerExistingRelations && await this.conflictsWithExistingRelation(relation, context)) {
      return false;
    }
    
    return true;
  }
  
  private deduplicateRelations(relations: InferredRelation[]): InferredRelation[] {
    const relationMap = new Map<string, InferredRelation>();
    
    for (const relation of relations) {
      const key = `${relation.sourceConceptId}-${relation.targetConceptId}-${relation.relationType}`;
      
      if (!relationMap.has(key) || relation.confidence > relationMap.get(key)!.confidence) {
        relationMap.set(key, relation);
      }
    }
    
    return Array.from(relationMap.values());
  }
  
  private async hasCircularDependency(relation: InferredRelation, context: RelationInferenceContext): Promise<boolean> {
    // 实现循环依赖检测逻辑
    // ...
    return false;
  }
  
  private isRelationTypeCompatible(relation: InferredRelation, context: RelationInferenceContext): boolean {
    // 实现关系类型兼容性检查逻辑
    // ...
    return true;
  }
  
  private async conflictsWithExistingRelation(relation: InferredRelation, context: RelationInferenceContext): Promise<boolean> {
    // 检查是否与现有关系冲突
    return context.existingRelations.some(existingRelation => {
      return existingRelation.sourceConceptId === relation.sourceConceptId &&
             existingRelation.targetConceptId === relation.targetConceptId &&
             existingRelation.relationType !== relation.relationType;
    });
  }
  
  setConfig(config: RelationInferenceConfig): void {
    this.config = config;
  }
  
  getConfig(): RelationInferenceConfig {
    return { ...this.config };
  }
}
```

### 4.2 集成到认知建模流程

```typescript
// src/application/services/cognitive/model/CognitiveModelingService.ts

/**
 * 认知建模服务
 */
export class CognitiveModelingService {
  private relationInferenceService: RelationInferenceService;
  private cognitiveModelRepository: CognitiveModelRepository;
  
  constructor(
    relationInferenceService: RelationInferenceService,
    cognitiveModelRepository: CognitiveModelRepository
  ) {
    this.relationInferenceService = relationInferenceService;
    this.cognitiveModelRepository = cognitiveModelRepository;
  }
  
  async updateCognitiveModel(userId: string, parsedConcepts: CognitiveConcept[]): Promise<UserCognitiveModel> {
    // 获取或创建用户认知模型
    let cognitiveModel = await this.cognitiveModelRepository.findByUserId(userId);
    
    if (!cognitiveModel) {
      cognitiveModel = await this.cognitiveModelRepository.create({
        userId,
        concepts: [],
        relations: [],
        lastUpdatedAt: new Date()
      });
    }
    
    // 合并新解析的概念
    const mergedConcepts = this.mergeConcepts(cognitiveModel.concepts, parsedConcepts);
    
    // 推断概念间的关系
    const inferenceContext: RelationInferenceContext = {
      cognitiveModelId: cognitiveModel.id,
      concepts: mergedConcepts,
      existingRelations: cognitiveModel.relations
    };
    
    const inferredRelations = await this.relationInferenceService.inferRelations(inferenceContext);
    
    // 合并新推断的关系
    const mergedRelations = this.mergeRelations(cognitiveModel.relations, inferredRelations);
    
    // 更新认知模型
    cognitiveModel = await this.cognitiveModelRepository.update({
      ...cognitiveModel,
      concepts: mergedConcepts,
      relations: mergedRelations,
      lastUpdatedAt: new Date()
    });
    
    return cognitiveModel;
  }
  
  private mergeConcepts(existing: CognitiveConcept[], newConcepts: CognitiveConcept[]): CognitiveConcept[] {
    // 实现概念合并逻辑
    // ...
    return [...existing, ...newConcepts];
  }
  
  private mergeRelations(existing: CognitiveRelation[], newRelations: InferredRelation[]): CognitiveRelation[] {
    // 实现关系合并逻辑
    // ...
    return [...existing, ...newRelations.map(rel => ({
      id: `rel-${uuidv4()}`,
      sourceConceptId: rel.sourceConceptId,
      targetConceptId: rel.targetConceptId,
      type: rel.relationType,
      confidence: rel.confidence,
      inferredAt: rel.inferredAt,
      inferenceBasis: rel.inferenceBasis
    }))];
  }
}
```

## 5. 错误处理机制

### 5.1 策略级错误处理

每个关系推断策略都实现了独立的错误处理机制，确保单个策略失败不会影响整个推断流程：

```typescript
// 在策略推断方法中添加错误处理
try {
  const relations = await strategy.infer(context);
  allInferredRelations = [...allInferredRelations, ...relations];
} catch (error) {
  console.error(`Strategy ${strategy.name} failed:`, error);
  // 继续执行其他策略
}
```

### 5.2 服务级错误处理

```typescript
// src/application/services/cognitive/relation/RelationInferenceServiceImpl.ts

async inferRelations(context: RelationInferenceContext): Promise<InferredRelation[]> {
  try {
    // 关系推断逻辑...
    return validRelations;
  } catch (error) {
    // 记录详细错误信息
    console.error('Relation inference service failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        cognitiveModelId: context.cognitiveModelId,
        conceptCount: context.concepts.length,
        config: context.config
      }
    });
    
    // 返回空列表而非抛出异常，确保上层服务可用性
    return [];
  }
}
```

### 5.3 重试机制

对于AI辅助推断等依赖外部服务的策略，实现了重试机制：

```typescript
// src/infrastructure/cognitive/relation/AIAssistedRelationInferenceStrategy.ts

async infer(context: RelationInferenceContext): Promise<InferredRelation[]> {
  // ...
  
  try {
    // 使用带重试机制的LLM客户端
    const response = await this.llmClient.generateWithRetry({
      prompt,
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1000,
      format: 'json',
      retryConfig: {
        maxAttempts: 3,
        initialDelay: 1000,
        multiplier: 2
      }
    });
    
    // 解析和处理响应...
  } catch (error) {
    console.error('AI-assisted relation inference failed after retries:', error);
    return [];
  }
}
```

## 6. 性能优化策略

### 6.1 批量处理

```typescript
// 批量处理概念对，减少API调用次数
const batches = this.chunkArray(context.concepts, this.maxBatchSize);
for (const batch of batches) {
  const batchContext = { ...context, concepts: batch };
  const batchRelations = await this.inferBatchRelations(batchContext);
  inferredRelations.push(...batchRelations);
}
```

### 6.2 缓存机制

```typescript
// 实现概念嵌入缓存
const embeddingCache = new Map<string, EmbeddingVector>();

// 检查缓存
let embedding = embeddingCache.get(conceptText);
if (!embedding) {
  // 生成嵌入并缓存
  embedding = await this.embeddingService.generateEmbedding({
    text: conceptText,
    model: 'text-embedding-ada-002'
  });
  embeddingCache.set(conceptText, embedding);
}
```

### 6.3 并行处理

```typescript
// 并行应用多个策略
const strategyPromises = this.strategies
  .filter(strategy => strategy.isApplicable(context))
  .map(strategy => strategy.infer(context));

const strategyResults = await Promise.all(strategyPromises);
const allInferredRelations = strategyResults.flat();
```

### 6.4 增量推断

```typescript
// 仅对新增概念进行关系推断
const newConcepts = parsedConcepts.filter(
  concept => !existingConcepts.some(existing => existing.id === concept.id)
);

if (newConcepts.length > 0) {
  // 仅对新概念进行关系推断
  const inferenceContext: RelationInferenceContext = {
    cognitiveModelId: cognitiveModel.id,
    concepts: newConcepts,
    existingRelations: cognitiveModel.relations
  };
  
  const inferredRelations = await this.relationInferenceService.inferRelations(inferenceContext);
  // 合并新推断的关系
}
```

## 7. 测试策略

### 7.1 单元测试

```typescript
// test/application/services/cognitive/relation/RelationInferenceService.test.ts

describe('RelationInferenceService', () => {
  let relationInferenceService: RelationInferenceService;
  let mockStrategy1: jest.Mocked<RelationInferenceStrategy>;
  let mockStrategy2: jest.Mocked<RelationInferenceStrategy>;
  
  beforeEach(() => {
    // 初始化模拟策略
    mockStrategy1 = {
      name: 'MockStrategy1',
      priority: 90,
      infer: jest.fn(),
      isApplicable: jest.fn().mockReturnValue(true)
    };
    
    mockStrategy2 = {
      name: 'MockStrategy2',
      priority: 80,
      infer: jest.fn(),
      isApplicable: jest.fn().mockReturnValue(true)
    };
    
    // 创建关系推断服务
    relationInferenceService = new RelationInferenceServiceImpl([mockStrategy1, mockStrategy2]);
  });
  
  test('should infer relations using all applicable strategies', async () => {
    // 准备测试数据
    const context: RelationInferenceContext = {
      cognitiveModelId: 'test-model-1',
      concepts: [
        { id: 'c1', name: '概念1', description: '描述1', createdAt: new Date() },
        { id: 'c2', name: '概念2', description: '描述2', createdAt: new Date() }
      ],
      existingRelations: []
    };
    
    // 设置模拟返回值
    mockStrategy1.infer.mockResolvedValue([{
      sourceConceptId: 'c1',
      targetConceptId: 'c2',
      relationType: RelationType.ASSOCIATION,
      confidence: 0.9,
      inferenceBasis: 'Strategy1',
      inferredAt: new Date()
    }]);
    
    mockStrategy2.infer.mockResolvedValue([{
      sourceConceptId: 'c1',
      targetConceptId: 'c2',
      relationType: RelationType.PARENT_CHILD,
      confidence: 0.8,
      inferenceBasis: 'Strategy2',
      inferredAt: new Date()
    }]);
    
    // 执行测试
    const result = await relationInferenceService.inferRelations(context);
    
    // 验证结果
    expect(result).toHaveLength(2);
    expect(mockStrategy1.infer).toHaveBeenCalledWith(context);
    expect(mockStrategy2.infer).toHaveBeenCalledWith(context);
  });
  
  // 更多测试用例...
});
```

### 7.2 集成测试

```typescript
// test/integration/services/cognitive/relation/RelationInferenceService.integration.test.ts

describe('RelationInferenceService Integration', () => {
  let relationInferenceService: RelationInferenceService;
  let testContainer: Container;
  
  beforeAll(async () => {
    // 初始化测试容器
    testContainer = await createTestContainer();
    relationInferenceService = testContainer.resolve<RelationInferenceService>(RelationInferenceService);
  });
  
  afterAll(async () => {
    // 清理测试资源
    await testContainer.dispose();
  });
  
  test('should correctly infer relations from real concepts', async () => {
    // 准备真实测试数据
    const context: RelationInferenceContext = {
      cognitiveModelId: 'test-model-1',
      concepts: [
        {
          id: 'c1',
          name: '人工智能',
          description: '人工智能是模拟人类智能的计算机系统',
          createdAt: new Date()
        },
        {
          id: 'c2',
          name: '机器学习',
          description: '机器学习是人工智能的一个分支，使计算机能够从数据中学习',
          createdAt: new Date()
        },
        {
          id: 'c3',
          name: '深度学习',
          description: '深度学习是机器学习的一个分支，使用神经网络模型',
          createdAt: new Date()
        }
      ],
      existingRelations: [],
      config: {
        minConfidenceThreshold: 0.7,
        enableAIAssistedInference: false,
        considerExistingRelations: false,
        inferenceDepth: 1
      }
    };
    
    // 执行关系推断
    const result = await relationInferenceService.inferRelations(context);
    
    // 验证结果
    expect(result).toBeInstanceOf(Array);
    // 应该推断出父子关系
    const parentChildRelations = result.filter(r => r.relationType === RelationType.PARENT_CHILD);
    expect(parentChildRelations.length).toBeGreaterThan(0);
  });
  
  // 更多集成测试用例...
});
```

## 8. 部署与监控

### 8.1 部署配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: .
    environment:
      # 关系推断服务配置
      RELATION_INFERENCE_MIN_CONFIDENCE: 0.6
      RELATION_INFERENCE_ENABLE_AI_ASSISTED: true
      RELATION_INFERENCE_MAX_BATCH_SIZE: 10
      RELATION_INFERENCE_CACHE_TTL: 3600
    # 其他配置...
```

### 8.2 监控指标

```typescript
// src/application/services/cognitive/relation/RelationInferenceServiceImpl.ts

async inferRelations(context: RelationInferenceContext): Promise<InferredRelation[]> {
  const startTime = Date.now();
  
  try {
    // 关系推断逻辑...
    
    // 记录监控指标
    metricsService.record({
      name: 'relation_inference_duration',
      value: Date.now() - startTime,
      tags: {
        strategyCount: this.strategies.length,
        conceptCount: context.concepts.length,
        resultCount: validRelations.length,
        success: true
      }
    });
    
    return validRelations;
  } catch (error) {
    // 记录错误指标
    metricsService.record({
      name: 'relation_inference_duration',
      value: Date.now() - startTime,
      tags: {
        strategyCount: this.strategies.length,
        conceptCount: context.concepts.length,
        resultCount: 0,
        success: false,
        errorType: error instanceof Error ? error.name : 'Unknown'
      }
    });
    
    return [];
  }
}
```

## 9. 未来增强方向

1. **动态策略选择**：根据上下文自动选择最适合的推断策略
2. **关系演化跟踪**：记录关系随时间的变化，支持关系历史查询
3. **多语言支持**：扩展关系推断能力，支持多语言概念
4. **图可视化**：提供认知图的可视化接口，便于前端展示
5. **交互式关系修正**：允许用户手动修正推断的关系，反馈到模型中
6. **领域特定规则扩展**：支持根据不同领域动态加载特定规则
7. **关系强度动态调整**：根据用户反馈和使用情况动态调整关系置信度
8. **大规模概念处理**：优化算法，支持处理数千个概念的大规模认知图

## 10. 输入输出示例

### 10.1 输入示例

```typescript
const context: RelationInferenceContext = {
  cognitiveModelId: 'user-123',
  concepts: [
    {
      id: 'c1',
      name: '人工智能',
      description: '人工智能是模拟人类智能的计算机系统',
      createdAt: new Date('2023-01-01')
    },
    {
      id: 'c2',
      name: '机器学习',
      description: '机器学习是人工智能的一个分支，使计算机能够从数据中学习',
      createdAt: new Date('2023-01-02')
    },
    {
      id: 'c3',
      name: '深度学习',
      description: '深度学习是机器学习的一个分支，使用神经网络模型',
      createdAt: new Date('2023-01-03')
    },
    {
      id: 'c4',
      name: '神经网络',
      description: '神经网络是模仿生物神经网络的计算模型',
      createdAt: new Date('2023-01-04')
    }
  ],
  existingRelations: [],
  config: {
    minConfidenceThreshold: 0.7,
    enableAIAssistedInference: true,
    considerExistingRelations: false,
    inferenceDepth: 2
  }
};
```

### 10.2 输出示例

```typescript
[
  {
    "sourceConceptId": "c2",
    "targetConceptId": "c1",
    "relationType": "PARENT_CHILD",
    "confidence": 0.95,
    "inferenceBasis": "Rule-based matching: (?:是|属于|为)(?:\\s+|_)([\\w\\s]+)的(?:\\s+|_)([\\w\\s]+)",
    "inferredAt": "2023-01-05T10:30:00.000Z"
  },
  {
    "sourceConceptId": "c3",
    "targetConceptId": "c2",
    "relationType": "PARENT_CHILD",
    "confidence": 0.95,
    "inferenceBasis": "Rule-based matching: (?:是|属于|为)(?:\\s+|_)([\\w\\s]+)的(?:\\s+|_)([\\w\\s]+)",
    "inferredAt": "2023-01-05T10:30:00.000Z"
  },
  {
    "sourceConceptId": "c3",
    "targetConceptId": "c4",
    "relationType": "ASSOCIATION",
    "confidence": 0.9,
    "inferenceBasis": "Vector similarity: 0.923",
    "inferredAt": "2023-01-05T10:30:01.000Z"
  },
  {
    "sourceConceptId": "c4",
    "targetConceptId": "c3",
    "relationType": "ATTRIBUTE",
    "confidence": 0.85,
    "inferenceBasis": "AI-assisted: 深度学习使用神经网络模型",
    "inferredAt": "2023-01-05T10:30:02.000Z"
  }
]
```

## 11. 总结

关系推断是认知结构建模的核心组件，通过规则引擎、向量相似度和AI辅助等多种策略，实现了从认知概念到关系网络的自动构建。本实现采用了模块化设计，支持多种推断策略的灵活组合和扩展，同时实现了完善的错误处理、性能优化和测试策略。

该模块遵循了Clean Architecture原则，将核心业务逻辑与外部依赖分离，确保了系统的可维护性、可扩展性和可测试性。通过配置化的设计，支持根据不同场景调整推断参数，适应不同的使用需求。

关系推断服务的实现为后续认知模型演化、认知反馈生成等模块奠定了基础，是构建完整认知辅助系统的重要组成部分。