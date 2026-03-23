# Day 43: 第二阶段 - AI融合期 - 第43天 - 置信度评分技术实现

## 1. 功能概述

置信度评分是认知关系推断系统的关键组件，用于评估推断出的认知关系的可靠性和准确性。通过多维度的评分机制，可以筛选出高质量的关系，确保认知模型的准确性和一致性。置信度评分机制不仅考虑单一推断策略的输出，还会综合多种因素进行加权评估，为每个推断关系生成一个0-1之间的置信度分数。

## 2. 核心接口定义

### 2.1 置信度评分服务接口

```typescript
// src/domain/services/ConfidenceScoringService.ts

/**
 * 置信度评分因子类型
 */
export enum ConfidenceFactorType {
  /** 策略可靠性因子 - 基于推断策略的历史可靠性 */
  STRATEGY_RELIABILITY = 'STRATEGY_RELIABILITY',
  /** 语义相似度因子 - 基于概念间的语义相似度 */
  SEMANTIC_SIMILARITY = 'SEMANTIC_SIMILARITY',
  /** 规则匹配强度因子 - 基于规则匹配的精确程度 */
  RULE_MATCH_STRENGTH = 'RULE_MATCH_STRENGTH',
  /** 上下文一致性因子 - 基于与现有关系的一致性 */
  CONTEXT_CONSISTENCY = 'CONTEXT_CONSISTENCY',
  /** 频率因子 - 基于概念在用户输入中的出现频率 */
  FREQUENCY = 'FREQUENCY',
  /** AI置信度因子 - 基于AI模型返回的置信度 */
  AI_CONFIDENCE = 'AI_CONFIDENCE',
  /** 类型兼容性因子 - 基于关系类型与概念类型的兼容性 */
  TYPE_COMPATIBILITY = 'TYPE_COMPATIBILITY'
}

/**
 * 置信度评分因子
 */
export interface ConfidenceFactor {
  /** 因子类型 */
  type: ConfidenceFactorType;
  /** 因子权重 (0-1) */
  weight: number;
  /** 因子得分 (0-1) */
  score: number;
  /** 因子描述 */
  description: string;
}

/**
 * 置信度评分上下文
 */
export interface ConfidenceScoringContext {
  /** 待评分的推断关系 */
  relation: InferredRelation;
  /** 当前用户的认知模型 */
  cognitiveModel: UserCognitiveModel;
  /** 推断关系的源概念 */
  sourceConcept: CognitiveConcept;
  /** 推断关系的目标概念 */
  targetConcept: CognitiveConcept;
  /** 置信度评分配置 */
  config?: ConfidenceScoringConfig;
}

/**
 * 置信度评分配置
 */
export interface ConfidenceScoringConfig {
  /** 因子权重配置 */
  factorWeights: Record<ConfidenceFactorType, number>;
  /** 评分算法类型 */
  algorithmType: 'weighted_sum' | 'machine_learning' | 'hybrid';
  /** 是否启用动态权重调整 */
  enableDynamicWeights: boolean;
  /** 最小置信度阈值 */
  minConfidenceThreshold: number;
}

/**
 * 置信度评分结果
 */
export interface ConfidenceScoringResult {
  /** 最终置信度分数 (0-1) */
  confidenceScore: number;
  /** 各个因子的评分详情 */
  factors: ConfidenceFactor[];
  /** 评分算法类型 */
  algorithmType: string;
  /** 评分时间 */
  scoredAt: Date;
}

/**
 * 置信度评分服务接口
 */
export interface ConfidenceScoringService {
  /**
   * 为推断关系计算置信度评分
   * @param context 置信度评分上下文
   * @returns 置信度评分结果
   */
  scoreConfidence(context: ConfidenceScoringContext): Promise<ConfidenceScoringResult>;
  
  /**
   * 批量计算置信度评分
   * @param contexts 置信度评分上下文列表
   * @returns 置信度评分结果列表
   */
  batchScoreConfidence(contexts: ConfidenceScoringContext[]): Promise<ConfidenceScoringResult[]>;
  
  /**
   * 设置置信度评分配置
   * @param config 置信度评分配置
   */
  setConfig(config: ConfidenceScoringConfig): void;
  
  /**
   * 获取当前置信度评分配置
   * @returns 当前配置
   */
  getConfig(): ConfidenceScoringConfig;
  
  /**
   * 验证置信度评分是否有效
   * @param score 置信度评分
   * @returns 是否有效
   */
  isValidConfidenceScore(score: number): boolean;
}
```

### 2.2 置信度评分策略接口

```typescript
// src/application/services/cognitive/confidence/ConfidenceScoringStrategy.ts

/**
 * 置信度评分策略接口
 */
export interface ConfidenceScoringStrategy {
  /**
   * 策略名称
   */
  readonly name: string;
  
  /**
   * 策略适用的算法类型
   */
  readonly applicableAlgorithmTypes: Array<'weighted_sum' | 'machine_learning' | 'hybrid'>;
  
  /**
   * 应用该策略计算置信度评分
   * @param context 置信度评分上下文
   * @returns 置信度评分结果
   */
  score(context: ConfidenceScoringContext): Promise<ConfidenceScoringResult>;
  
  /**
   * 检查该策略是否适用于当前上下文
   * @param context 置信度评分上下文
   * @returns 是否适用
   */
  isApplicable(context: ConfidenceScoringContext): boolean;
}
```

## 3. 算法逻辑

### 3.1 置信度评分流程

```
+---------------------+
|  输入: 推断关系      |
+---------------------+
          |
          v
+---------------------+
|  初始化评分上下文   |
+---------------------+
          |
          v
+---------------------+
|  加载评分因子       |
+---------------------+
          |
          v
+---------------------+
|  计算各因子得分      |
|  - 策略可靠性因子    |
|  - 语义相似度因子    |
|  - 规则匹配强度因子   |
|  - 上下文一致性因子   |
|  - 频率因子          |
|  - AI置信度因子      |
|  - 类型兼容性因子     |
+---------------------+
          |
          v
+---------------------+
|  应用评分算法        |
|  - 加权求和算法      |
|  - 机器学习算法      |
|  - 混合算法          |
+---------------------+
          |
          v
+---------------------+
|  生成最终评分        |
+---------------------+
          |
          v
+---------------------+
|  输出: 置信度评分结果 |
+---------------------+
```

### 3.2 核心评分算法

#### 3.2.1 加权求和算法

```typescript
// src/infrastructure/cognitive/confidence/WeightedSumConfidenceScoringStrategy.ts

/**
 * 加权求和置信度评分策略
 */
export class WeightedSumConfidenceScoringStrategy implements ConfidenceScoringStrategy {
  readonly name = 'WeightedSum';
  readonly applicableAlgorithmTypes = ['weighted_sum', 'hybrid'];
  
  private readonly embeddingService: EmbeddingService;
  private readonly strategyReliabilityHistory: Map<string, number>;
  
  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
    this.strategyReliabilityHistory = new Map();
    // 初始化策略可靠性历史数据
    this.initializeStrategyReliability();
  }
  
  async score(context: ConfidenceScoringContext): Promise<ConfidenceScoringResult> {
    const factors: ConfidenceFactor[] = [];
    
    // 获取配置，使用默认配置如果没有提供
    const config = context.config || this.getDefaultConfig();
    
    // 1. 计算策略可靠性因子
    const strategyReliabilityFactor = this.calculateStrategyReliabilityFactor(context, config);
    factors.push(strategyReliabilityFactor);
    
    // 2. 计算语义相似度因子
    const semanticSimilarityFactor = await this.calculateSemanticSimilarityFactor(context, config);
    factors.push(semanticSimilarityFactor);
    
    // 3. 计算规则匹配强度因子
    const ruleMatchStrengthFactor = this.calculateRuleMatchStrengthFactor(context, config);
    factors.push(ruleMatchStrengthFactor);
    
    // 4. 计算上下文一致性因子
    const contextConsistencyFactor = this.calculateContextConsistencyFactor(context, config);
    factors.push(contextConsistencyFactor);
    
    // 5. 计算频率因子
    const frequencyFactor = this.calculateFrequencyFactor(context, config);
    factors.push(frequencyFactor);
    
    // 6. 计算AI置信度因子
    const aiConfidenceFactor = this.calculateAIConfidenceFactor(context, config);
    factors.push(aiConfidenceFactor);
    
    // 7. 计算类型兼容性因子
    const typeCompatibilityFactor = this.calculateTypeCompatibilityFactor(context, config);
    factors.push(typeCompatibilityFactor);
    
    // 应用加权求和算法计算最终评分
    const confidenceScore = this.calculateWeightedSum(factors, config);
    
    return {
      confidenceScore,
      factors,
      algorithmType: 'weighted_sum',
      scoredAt: new Date()
    };
  }
  
  private calculateWeightedSum(factors: ConfidenceFactor[], config: ConfidenceScoringConfig): number {
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const factor of factors) {
      const weight = config.factorWeights[factor.type] || 0;
      weightedSum += factor.score * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
  
  private calculateStrategyReliabilityFactor(
    context: ConfidenceScoringContext, 
    config: ConfidenceScoringConfig
  ): ConfidenceFactor {
    // 从推断依据中提取策略名称
    const strategyName = this.extractStrategyName(context.relation.inferenceBasis);
    // 获取策略可靠性分数
    const reliabilityScore = this.strategyReliabilityHistory.get(strategyName) || 0.7;
    
    return {
      type: ConfidenceFactorType.STRATEGY_RELIABILITY,
      weight: config.factorWeights[ConfidenceFactorType.STRATEGY_RELIABILITY] || 0.2,
      score: reliabilityScore,
      description: `策略 ${strategyName} 的历史可靠性评分为 ${reliabilityScore}`
    };
  }
  
  private async calculateSemanticSimilarityFactor(
    context: ConfidenceScoringContext, 
    config: ConfidenceScoringConfig
  ): Promise<ConfidenceFactor> {
    try {
      // 生成概念嵌入
      const sourceEmbedding = await this.embeddingService.generateEmbedding({
        text: `${context.sourceConcept.name} ${context.sourceConcept.description}`,
        model: 'text-embedding-ada-002'
      });
      
      const targetEmbedding = await this.embeddingService.generateEmbedding({
        text: `${context.targetConcept.name} ${context.targetConcept.description}`,
        model: 'text-embedding-ada-002'
      });
      
      // 计算余弦相似度
      const similarity = this.cosineSimilarity(sourceEmbedding.vector, targetEmbedding.vector);
      
      return {
        type: ConfidenceFactorType.SEMANTIC_SIMILARITY,
        weight: config.factorWeights[ConfidenceFactorType.SEMANTIC_SIMILARITY] || 0.2,
        score: similarity,
        description: `源概念与目标概念的语义相似度为 ${similarity.toFixed(3)}`
      };
    } catch (error) {
      console.error('Failed to calculate semantic similarity:', error);
      return {
        type: ConfidenceFactorType.SEMANTIC_SIMILARITY,
        weight: config.factorWeights[ConfidenceFactorType.SEMANTIC_SIMILARITY] || 0.2,
        score: 0.5, // 默认值
        description: '语义相似度计算失败，使用默认值'
      };
    }
  }
  
  private calculateRuleMatchStrengthFactor(
    context: ConfidenceScoringContext, 
    config: ConfidenceScoringConfig
  ): ConfidenceFactor {
    // 从推断依据中提取规则匹配强度
    const matchStrength = this.extractRuleMatchStrength(context.relation.inferenceBasis);
    
    return {
      type: ConfidenceFactorType.RULE_MATCH_STRENGTH,
      weight: config.factorWeights[ConfidenceFactorType.RULE_MATCH_STRENGTH] || 0.15,
      score: matchStrength,
      description: `规则匹配强度为 ${matchStrength}`
    };
  }
  
  private calculateContextConsistencyFactor(
    context: ConfidenceScoringContext, 
    config: ConfidenceScoringConfig
  ): ConfidenceFactor {
    // 检查与现有关系的一致性
    const consistencyScore = this.calculateContextConsistency(context.relation, context.cognitiveModel);
    
    return {
      type: ConfidenceFactorType.CONTEXT_CONSISTENCY,
      weight: config.factorWeights[ConfidenceFactorType.CONTEXT_CONSISTENCY] || 0.15,
      score: consistencyScore,
      description: `与现有关系的一致性评分为 ${consistencyScore}`
    };
  }
  
  private calculateFrequencyFactor(
    context: ConfidenceScoringContext, 
    config: ConfidenceScoringConfig
  ): ConfidenceFactor {
    // 计算概念出现频率
    const sourceFrequency = this.calculateConceptFrequency(context.sourceConcept, context.cognitiveModel);
    const targetFrequency = this.calculateConceptFrequency(context.targetConcept, context.cognitiveModel);
    const frequencyScore = (sourceFrequency + targetFrequency) / 2;
    
    return {
      type: ConfidenceFactorType.FREQUENCY,
      weight: config.factorWeights[ConfidenceFactorType.FREQUENCY] || 0.1,
      score: frequencyScore,
      description: `源概念频率为 ${sourceFrequency}，目标概念频率为 ${targetFrequency}`
    };
  }
  
  private calculateAIConfidenceFactor(
    context: ConfidenceScoringContext, 
    config: ConfidenceScoringConfig
  ): ConfidenceFactor {
    // 从推断关系中提取AI置信度
    const aiConfidence = this.extractAIConfidence(context.relation.inferenceBasis) || 0.7;
    
    return {
      type: ConfidenceFactorType.AI_CONFIDENCE,
      weight: config.factorWeights[ConfidenceFactorType.AI_CONFIDENCE] || 0.15,
      score: aiConfidence,
      description: `AI模型返回的置信度为 ${aiConfidence}`
    };
  }
  
  private calculateTypeCompatibilityFactor(
    context: ConfidenceScoringContext, 
    config: ConfidenceScoringConfig
  ): ConfidenceFactor {
    // 检查关系类型与概念类型的兼容性
    const compatibilityScore = this.checkTypeCompatibility(
      context.relation.relationType, 
      context.sourceConcept, 
      context.targetConcept
    );
    
    return {
      type: ConfidenceFactorType.TYPE_COMPATIBILITY,
      weight: config.factorWeights[ConfidenceFactorType.TYPE_COMPATIBILITY] || 0.05,
      score: compatibilityScore,
      description: `关系类型与概念类型的兼容性评分为 ${compatibilityScore}`
    };
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
  
  private initializeStrategyReliability(): void {
    // 初始化策略可靠性历史数据
    this.strategyReliabilityHistory.set('RuleBased', 0.9);
    this.strategyReliabilityHistory.set('VectorSimilarity', 0.85);
    this.strategyReliabilityHistory.set('AIAssisted', 0.8);
  }
  
  private extractStrategyName(inferenceBasis: string): string {
    // 从推断依据中提取策略名称
    const match = inferenceBasis.match(/^(\w+)/);
    return match ? match[1] : 'Unknown';
  }
  
  private extractRuleMatchStrength(inferenceBasis: string): number {
    // 从推断依据中提取规则匹配强度
    // 实际实现中可能需要更复杂的逻辑
    return 0.8;
  }
  
  private calculateContextConsistency(
    relation: InferredRelation, 
    cognitiveModel: UserCognitiveModel
  ): number {
    // 计算与现有关系的一致性
    // 实际实现中可能需要更复杂的逻辑
    return 0.9;
  }
  
  private calculateConceptFrequency(
    concept: CognitiveConcept, 
    cognitiveModel: UserCognitiveModel
  ): number {
    // 计算概念出现频率
    // 实际实现中可能需要更复杂的逻辑
    return 0.7;
  }
  
  private extractAIConfidence(inferenceBasis: string): number | undefined {
    // 从推断依据中提取AI置信度
    const match = inferenceBasis.match(/confidence: (0\.\d+)/);
    return match ? parseFloat(match[1]) : undefined;
  }
  
  private checkTypeCompatibility(
    relationType: RelationType, 
    sourceConcept: CognitiveConcept, 
    targetConcept: CognitiveConcept
  ): number {
    // 检查关系类型与概念类型的兼容性
    // 实际实现中可能需要更复杂的逻辑
    return 1.0;
  }
  
  private getDefaultConfig(): ConfidenceScoringConfig {
    return {
      factorWeights: {
        [ConfidenceFactorType.STRATEGY_RELIABILITY]: 0.2,
        [ConfidenceFactorType.SEMANTIC_SIMILARITY]: 0.2,
        [ConfidenceFactorType.RULE_MATCH_STRENGTH]: 0.15,
        [ConfidenceFactorType.CONTEXT_CONSISTENCY]: 0.15,
        [ConfidenceFactorType.FREQUENCY]: 0.1,
        [ConfidenceFactorType.AI_CONFIDENCE]: 0.15,
        [ConfidenceFactorType.TYPE_COMPATIBILITY]: 0.05
      },
      algorithmType: 'weighted_sum',
      enableDynamicWeights: false,
      minConfidenceThreshold: 0.6
    };
  }
  
  isApplicable(context: ConfidenceScoringContext): boolean {
    const algorithmType = context.config?.algorithmType || 'weighted_sum';
    return this.applicableAlgorithmTypes.includes(algorithmType);
  }
}
```

#### 3.2.2 机器学习评分算法

```typescript
// src/infrastructure/cognitive/confidence/MachineLearningConfidenceScoringStrategy.ts

/**
 * 机器学习置信度评分策略
 */
export class MachineLearningConfidenceScoringStrategy implements ConfidenceScoringStrategy {
  readonly name = 'MachineLearning';
  readonly applicableAlgorithmTypes = ['machine_learning', 'hybrid'];
  
  private readonly model: ConfidenceModel;
  private readonly featureExtractor: ConfidenceFeatureExtractor;
  
  constructor(model: ConfidenceModel, featureExtractor: ConfidenceFeatureExtractor) {
    this.model = model;
    this.featureExtractor = featureExtractor;
  }
  
  async score(context: ConfidenceScoringContext): Promise<ConfidenceScoringResult> {
    try {
      // 提取特征
      const features = await this.featureExtractor.extractFeatures(context);
      
      // 使用机器学习模型预测置信度
      const prediction = await this.model.predict(features);
      
      // 生成因子详情
      const factors = this.generateFactorsFromPrediction(prediction, features);
      
      return {
        confidenceScore: prediction.confidence,
        factors,
        algorithmType: 'machine_learning',
        scoredAt: new Date()
      };
    } catch (error) {
      console.error('Machine learning confidence scoring failed:', error);
      // 失败时返回默认评分
      return {
        confidenceScore: 0.5,
        factors: [],
        algorithmType: 'machine_learning',
        scoredAt: new Date()
      };
    }
  }
  
  private generateFactorsFromPrediction(
    prediction: ConfidencePrediction,
    features: ConfidenceFeatures
  ): ConfidenceFactor[] {
    // 从预测结果和特征生成因子详情
    // 实际实现中可能需要更复杂的逻辑
    return [
      {
        type: ConfidenceFactorType.STRATEGY_RELIABILITY,
        weight: 0.2,
        score: features.strategyReliability,
        description: `策略可靠性特征值: ${features.strategyReliability}`
      },
      {
        type: ConfidenceFactorType.SEMANTIC_SIMILARITY,
        weight: 0.2,
        score: features.semanticSimilarity,
        description: `语义相似度特征值: ${features.semanticSimilarity}`
      },
      // 更多因子...
    ];
  }
  
  isApplicable(context: ConfidenceScoringContext): boolean {
    const algorithmType = context.config?.algorithmType || 'weighted_sum';
    return this.applicableAlgorithmTypes.includes(algorithmType);
  }
}
```

## 4. 实现步骤

### 4.1 实现置信度评分服务

```typescript
// src/application/services/cognitive/confidence/ConfidenceScoringServiceImpl.ts

/**
 * 置信度评分服务实现
 */
export class ConfidenceScoringServiceImpl implements ConfidenceScoringService {
  private strategies: ConfidenceScoringStrategy[] = [];
  private config: ConfidenceScoringConfig;
  
  constructor(
    strategies: ConfidenceScoringStrategy[],
    defaultConfig?: Partial<ConfidenceScoringConfig>
  ) {
    this.strategies = strategies;
    
    // 初始化默认配置
    this.config = {
      factorWeights: {
        [ConfidenceFactorType.STRATEGY_RELIABILITY]: 0.2,
        [ConfidenceFactorType.SEMANTIC_SIMILARITY]: 0.2,
        [ConfidenceFactorType.RULE_MATCH_STRENGTH]: 0.15,
        [ConfidenceFactorType.CONTEXT_CONSISTENCY]: 0.15,
        [ConfidenceFactorType.FREQUENCY]: 0.1,
        [ConfidenceFactorType.AI_CONFIDENCE]: 0.15,
        [ConfidenceFactorType.TYPE_COMPATIBILITY]: 0.05
      },
      algorithmType: 'weighted_sum',
      enableDynamicWeights: false,
      minConfidenceThreshold: 0.6,
      ...defaultConfig
    };
  }
  
  async scoreConfidence(context: ConfidenceScoringContext): Promise<ConfidenceScoringResult> {
    // 合并配置
    const scoringContext = {
      ...context,
      config: {
        ...this.config,
        ...context.config
      }
    };
    
    // 选择适用的策略
    const applicableStrategies = this.strategies.filter(strategy => 
      strategy.isApplicable(scoringContext)
    );
    
    if (applicableStrategies.length === 0) {
      throw new Error('No applicable confidence scoring strategy found');
    }
    
    // 应用第一个适用的策略
    const strategy = applicableStrategies[0];
    const result = await strategy.score(scoringContext);
    
    return result;
  }
  
  async batchScoreConfidence(contexts: ConfidenceScoringContext[]): Promise<ConfidenceScoringResult[]> {
    // 批量处理置信度评分
    const results = await Promise.all(
      contexts.map(context => this.scoreConfidence(context))
    );
    
    return results;
  }
  
  setConfig(config: ConfidenceScoringConfig): void {
    this.config = config;
  }
  
  getConfig(): ConfidenceScoringConfig {
    return { ...this.config };
  }
  
  isValidConfidenceScore(score: number): boolean {
    return typeof score === 'number' && 
           !isNaN(score) && 
           score >= 0 && 
           score <= 1 && 
           score >= this.config.minConfidenceThreshold;
  }
}
```

### 4.2 集成到关系推断流程

```typescript
// src/application/services/cognitive/relation/RelationInferenceServiceImpl.ts

/**
 * 关系推断服务实现
 */
export class RelationInferenceServiceImpl implements RelationInferenceService {
  // ... 现有代码 ...
  
  private readonly confidenceScoringService: ConfidenceScoringService;
  private readonly cognitiveModelRepository: CognitiveModelRepository;
  
  constructor(
    strategies: RelationInferenceStrategy[],
    confidenceScoringService: ConfidenceScoringService,
    cognitiveModelRepository: CognitiveModelRepository,
    defaultConfig?: Partial<RelationInferenceConfig>
  ) {
    // ... 现有代码 ...
    this.confidenceScoringService = confidenceScoringService;
    this.cognitiveModelRepository = cognitiveModelRepository;
  }
  
  async inferRelations(context: RelationInferenceContext): Promise<InferredRelation[]> {
    // ... 现有代码 ...
    
    // 为每个推断关系计算置信度评分
    const relationsWithConfidence: InferredRelation[] = [];
    
    for (const relation of validRelations) {
      // 获取认知模型
      const cognitiveModel = await this.cognitiveModelRepository.findById(context.cognitiveModelId);
      
      if (!cognitiveModel) {
        continue;
      }
      
      // 获取源概念和目标概念
      const sourceConcept = context.concepts.find(c => c.id === relation.sourceConceptId);
      const targetConcept = context.concepts.find(c => c.id === relation.targetConceptId);
      
      if (!sourceConcept || !targetConcept) {
        continue;
      }
      
      // 计算置信度评分
      const scoringContext: ConfidenceScoringContext = {
        relation,
        cognitiveModel,
        sourceConcept,
        targetConcept
      };
      
      const scoringResult = await this.confidenceScoringService.scoreConfidence(scoringContext);
      
      // 更新关系的置信度
      const relationWithConfidence = {
        ...relation,
        confidence: scoringResult.confidenceScore
      };
      
      relationsWithConfidence.push(relationWithConfidence);
    }
    
    return relationsWithConfidence;
  }
  
  // ... 现有代码 ...
}
```

## 5. 错误处理机制

### 5.1 服务级错误处理

```typescript
// src/application/services/cognitive/confidence/ConfidenceScoringServiceImpl.ts

async scoreConfidence(context: ConfidenceScoringContext): Promise<ConfidenceScoringResult> {
  try {
    // 置信度评分逻辑...
    return result;
  } catch (error) {
    // 记录详细错误信息
    console.error('Confidence scoring service failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        relation: {
          source: context.relation.sourceConceptId,
          target: context.relation.targetConceptId,
          type: context.relation.relationType
        },
        cognitiveModelId: context.cognitiveModel.id
      }
    });
    
    // 返回默认评分结果而非抛出异常，确保上层服务可用性
    return {
      confidenceScore: 0.5,
      factors: [],
      algorithmType: 'default',
      scoredAt: new Date()
    };
  }
}
```

### 5.2 策略级错误处理

```typescript
// 在策略评分方法中添加错误处理
try {
  const result = await strategy.score(scoringContext);
  return result;
} catch (error) {
  console.error(`Strategy ${strategy.name} failed:`, error);
  // 尝试使用下一个适用策略
  if (applicableStrategies.length > 1) {
    const nextStrategy = applicableStrategies[1];
    return nextStrategy.score(scoringContext);
  }
  // 所有策略都失败时返回默认结果
  return {
    confidenceScore: 0.5,
    factors: [],
    algorithmType: 'default',
    scoredAt: new Date()
  };
}
```

### 5.3 降级机制

```typescript
// 实现降级机制，当复杂算法失败时使用简单算法
async score(context: ConfidenceScoringContext): Promise<ConfidenceScoringResult> {
  try {
    // 尝试使用复杂算法
    const result = await this.complexAlgorithmScore(context);
    return result;
  } catch (error) {
    console.error('Complex algorithm failed, falling back to simple algorithm:', error);
    // 使用简单算法作为降级方案
    return this.simpleAlgorithmScore(context);
  }
}

private simpleAlgorithmScore(context: ConfidenceScoringContext): ConfidenceScoringResult {
  // 简单算法实现，例如直接返回策略提供的基础置信度
  return {
    confidenceScore: context.relation.confidence || 0.5,
    factors: [],
    algorithmType: 'simple',
    scoredAt: new Date()
  };
}
```

## 6. 性能优化策略

### 6.1 缓存机制

```typescript
// 实现置信度评分缓存
const scoringCache = new Map<string, ConfidenceScoringResult>();

// 生成缓存键
const cacheKey = this.generateCacheKey(context);

// 检查缓存
const cachedResult = scoringCache.get(cacheKey);
if (cachedResult) {
  return cachedResult;
}

// 计算评分并缓存
const result = await this.calculateConfidenceScore(context);
scoringCache.set(cacheKey, result);

// 设置缓存过期时间
setTimeout(() => {
  scoringCache.delete(cacheKey);
}, 3600000); // 1小时后过期

return result;
```

### 6.2 并行处理

```typescript
// 并行处理批量评分请求
async batchScoreConfidence(contexts: ConfidenceScoringContext[]): Promise<ConfidenceScoringResult[]> {
  // 限制并行度，避免资源耗尽
  const concurrencyLimit = 10;
  const results: ConfidenceScoringResult[] = [];
  
  // 分批次处理
  for (let i = 0; i < contexts.length; i += concurrencyLimit) {
    const batch = contexts.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(
      batch.map(context => this.scoreConfidence(context))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

### 6.3 延迟计算

```typescript
// 实现延迟计算，只在需要时计算置信度评分
class LazyConfidenceScore {
  private _score: number | null = null;
  private readonly calculationFn: () => Promise<number>;
  
  constructor(calculationFn: () => Promise<number>) {
    this.calculationFn = calculationFn;
  }
  
  async getScore(): Promise<number> {
    if (this._score === null) {
      this._score = await this.calculationFn();
    }
    return this._score;
  }
}

// 使用延迟计算
const lazyScore = new LazyConfidenceScore(async () => {
  return this.confidenceScoringService.scoreConfidence(context).then(result => result.confidenceScore);
});

// 只在需要时获取评分
const score = await lazyScore.getScore();
```

### 6.4 特征复用

```typescript
// 复用已计算的特征，避免重复计算
class FeatureCache {
  private cache: Map<string, any> = new Map();
  
  get(key: string): any | undefined {
    return this.cache.get(key);
  }
  
  set(key: string, value: any): void {
    this.cache.set(key, value);
  }
  
  has(key: string): boolean {
    return this.cache.has(key);
  }
}

// 在特征提取器中使用缓存
async extractFeatures(context: ConfidenceScoringContext): Promise<ConfidenceFeatures> {
  const cache = new FeatureCache();
  
  // 检查语义相似度是否已计算
  const similarityKey = `similarity:${context.sourceConcept.id}:${context.targetConcept.id}`;
  let semanticSimilarity = cache.get(similarityKey);
  
  if (!semanticSimilarity) {
    // 计算语义相似度并缓存
    semanticSimilarity = await this.calculateSemanticSimilarity(
      context.sourceConcept, 
      context.targetConcept
    );
    cache.set(similarityKey, semanticSimilarity);
  }
  
  // 其他特征提取...
  
  return {
    semanticSimilarity,
    // 其他特征...
  };
}
```

## 7. 测试策略

### 7.1 单元测试

```typescript
// test/application/services/cognitive/confidence/ConfidenceScoringService.test.ts

describe('ConfidenceScoringService', () => {
  let confidenceScoringService: ConfidenceScoringService;
  let mockStrategy: jest.Mocked<ConfidenceScoringStrategy>;
  
  beforeEach(() => {
    // 初始化模拟策略
    mockStrategy = {
      name: 'MockStrategy',
      applicableAlgorithmTypes: ['weighted_sum'],
      score: jest.fn(),
      isApplicable: jest.fn().mockReturnValue(true)
    };
    
    // 创建置信度评分服务
    confidenceScoringService = new ConfidenceScoringServiceImpl([mockStrategy]);
  });
  
  test('should calculate confidence score using applicable strategy', async () => {
    // 准备测试数据
    const context: ConfidenceScoringContext = {
      relation: {
        sourceConceptId: 'c1',
        targetConceptId: 'c2',
        relationType: RelationType.ASSOCIATION,
        confidence: 0.8,
        inferenceBasis: 'Test basis',
        inferredAt: new Date()
      },
      cognitiveModel: {
        id: 'model-1',
        userId: 'user-1',
        concepts: [],
        relations: [],
        lastUpdatedAt: new Date()
      },
      sourceConcept: {
        id: 'c1',
        name: '概念1',
        description: '描述1',
        createdAt: new Date()
      },
      targetConcept: {
        id: 'c2',
        name: '概念2',
        description: '描述2',
        createdAt: new Date()
      }
    };
    
    // 设置模拟返回值
    mockStrategy.score.mockResolvedValue({
      confidenceScore: 0.85,
      factors: [],
      algorithmType: 'weighted_sum',
      scoredAt: new Date()
    });
    
    // 执行测试
    const result = await confidenceScoringService.scoreConfidence(context);
    
    // 验证结果
    expect(result).toBeInstanceOf(Object);
    expect(result.confidenceScore).toBe(0.85);
    expect(mockStrategy.score).toHaveBeenCalledWith(context);
  });
  
  test('should return default score when no applicable strategy found', async () => {
    // 准备测试数据
    const context: ConfidenceScoringContext = {
      relation: {
        sourceConceptId: 'c1',
        targetConceptId: 'c2',
        relationType: RelationType.ASSOCIATION,
        confidence: 0.8,
        inferenceBasis: 'Test basis',
        inferredAt: new Date()
      },
      cognitiveModel: {
        id: 'model-1',
        userId: 'user-1',
        concepts: [],
        relations: [],
        lastUpdatedAt: new Date()
      },
      sourceConcept: {
        id: 'c1',
        name: '概念1',
        description: '描述1',
        createdAt: new Date()
      },
      targetConcept: {
        id: 'c2',
        name: '概念2',
        description: '描述2',
        createdAt: new Date()
      },
      config: {
        algorithmType: 'machine_learning'
      }
    };
    
    // 设置模拟策略不适用
    mockStrategy.isApplicable.mockReturnValue(false);
    
    // 执行测试并验证异常
    await expect(confidenceScoringService.scoreConfidence(context))
      .rejects
      .toThrow('No applicable confidence scoring strategy found');
  });
  
  test('should validate confidence score correctly', () => {
    // 设置最小置信度阈值为0.6
    confidenceScoringService.setConfig({
      factorWeights: {},
      algorithmType: 'weighted_sum',
      enableDynamicWeights: false,
      minConfidenceThreshold: 0.6
    });
    
    // 测试有效评分
    expect(confidenceScoringService.isValidConfidenceScore(0.7)).toBe(true);
    expect(confidenceScoringService.isValidConfidenceScore(1.0)).toBe(true);
    
    // 测试无效评分
    expect(confidenceScoringService.isValidConfidenceScore(0.5)).toBe(false);
    expect(confidenceScoringService.isValidConfidenceScore(-0.1)).toBe(false);
    expect(confidenceScoringService.isValidConfidenceScore(1.1)).toBe(false);
    expect(confidenceScoringService.isValidConfidenceScore(NaN)).toBe(false);
  });
  
  // 更多测试用例...
});
```

### 7.2 集成测试

```typescript
// test/integration/services/cognitive/confidence/ConfidenceScoringService.integration.test.ts

describe('ConfidenceScoringService Integration', () => {
  let confidenceScoringService: ConfidenceScoringService;
  let testContainer: Container;
  
  beforeAll(async () => {
    // 初始化测试容器
    testContainer = await createTestContainer();
    confidenceScoringService = testContainer.resolve<ConfidenceScoringService>(ConfidenceScoringService);
  });
  
  afterAll(async () => {
    // 清理测试资源
    await testContainer.dispose();
  });
  
  test('should correctly calculate confidence score for inferred relation', async () => {
    // 准备真实测试数据
    const cognitiveModel: UserCognitiveModel = {
      id: 'test-model-1',
      userId: 'test-user-1',
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
        }
      ],
      relations: [],
      lastUpdatedAt: new Date()
    };
    
    const inferredRelation: InferredRelation = {
      sourceConceptId: 'c2',
      targetConceptId: 'c1',
      relationType: RelationType.PARENT_CHILD,
      confidence: 0.8,
      inferenceBasis: 'Rule-based matching: (?:是|属于|为)(?:\\s+|_)([\\w\\s]+)的(?:\\s+|_)([\\w\\s]+)',
      inferredAt: new Date()
    };
    
    const context: ConfidenceScoringContext = {
      relation: inferredRelation,
      cognitiveModel,
      sourceConcept: cognitiveModel.concepts[1],
      targetConcept: cognitiveModel.concepts[0]
    };
    
    // 执行置信度评分
    const result = await confidenceScoringService.scoreConfidence(context);
    
    // 验证结果
    expect(result).toBeInstanceOf(Object);
    expect(result.confidenceScore).toBeGreaterThan(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(1);
    expect(result.factors).toBeInstanceOf(Array);
    expect(result.factors.length).toBeGreaterThan(0);
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
      # 置信度评分服务配置
      CONFIDENCE_SCORING_ALGORITHM: 'weighted_sum'
      CONFIDENCE_SCORING_MIN_THRESHOLD: 0.6
      CONFIDENCE_SCORING_ENABLE_DYNAMIC_WEIGHTS: false
      # 各因子权重配置
      CONFIDENCE_FACTOR_STRATEGY_RELIABILITY: 0.2
      CONFIDENCE_FACTOR_SEMANTIC_SIMILARITY: 0.2
      CONFIDENCE_FACTOR_RULE_MATCH_STRENGTH: 0.15
      CONFIDENCE_FACTOR_CONTEXT_CONSISTENCY: 0.15
      CONFIDENCE_FACTOR_FREQUENCY: 0.1
      CONFIDENCE_FACTOR_AI_CONFIDENCE: 0.15
      CONFIDENCE_FACTOR_TYPE_COMPATIBILITY: 0.05
    # 其他配置...
```

### 8.2 监控指标

```typescript
// src/application/services/cognitive/confidence/ConfidenceScoringServiceImpl.ts

async scoreConfidence(context: ConfidenceScoringContext): Promise<ConfidenceScoringResult> {
  const startTime = Date.now();
  
  try {
    // 置信度评分逻辑...
    const result = await strategy.score(scoringContext);
    
    // 记录监控指标
    metricsService.record({
      name: 'confidence_scoring_duration',
      value: Date.now() - startTime,
      tags: {
        strategy: strategy.name,
        algorithmType: result.algorithmType,
        success: true,
        confidenceScore: result.confidenceScore
      }
    });
    
    // 记录因子分布
    for (const factor of result.factors) {
      metricsService.record({
        name: 'confidence_factor_score',
        value: factor.score,
        tags: {
          factorType: factor.type,
          weight: factor.weight
        }
      });
    }
    
    return result;
  } catch (error) {
    // 记录错误指标
    metricsService.record({
      name: 'confidence_scoring_duration',
      value: Date.now() - startTime,
      tags: {
        strategy: applicableStrategies[0]?.name || 'unknown',
        algorithmType: context.config?.algorithmType || 'unknown',
        success: false,
        errorType: error instanceof Error ? error.name : 'Unknown'
      }
    });
    
    throw error;
  }
}
```

## 9. 未来增强方向

1. **动态权重调整**：基于历史数据和反馈自动调整各因子权重
2. **自适应阈值**：根据不同场景自动调整最小置信度阈值
3. **多模型融合**：结合多个机器学习模型的预测结果
4. **解释性增强**：提供更详细的置信度评分解释，帮助理解评分依据
5. **用户反馈机制**：允许用户反馈关系的正确性，用于优化评分模型
6. **领域特定评分**：为不同领域提供定制化的评分配置
7. **实时更新**：支持在认知模型更新时重新计算相关关系的置信度
8. **异常检测**：检测异常的置信度评分，及时发现系统问题
9. **可视化仪表盘**：提供置信度评分分布和趋势的可视化展示
10. **A/B测试框架**：支持不同评分算法和配置的A/B测试

## 10. 输入输出示例

### 10.1 输入示例

```typescript
const context: ConfidenceScoringContext = {
  relation: {
    sourceConceptId: 'c2',
    targetConceptId: 'c1',
    relationType: RelationType.PARENT_CHILD,
    confidence: 0.8,
    inferenceBasis: 'Rule-based matching: (?:是|属于|为)(?:\\s+|_)([\\w\\s]+)的(?:\\s+|_)([\\w\\s]+)',
    inferredAt: new Date('2023-01-05T10:30:00.000Z')
  },
  cognitiveModel: {
    id: 'test-model-1',
    userId: 'test-user-1',
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
      }
    ],
    relations: [],
    lastUpdatedAt: new Date('2023-01-05')
  },
  sourceConcept: {
    id: 'c2',
    name: '机器学习',
    description: '机器学习是人工智能的一个分支，使计算机能够从数据中学习',
    createdAt: new Date('2023-01-02')
  },
  targetConcept: {
    id: 'c1',
    name: '人工智能',
    description: '人工智能是模拟人类智能的计算机系统',
    createdAt: new Date('2023-01-01')
  },
  config: {
    factorWeights: {
      [ConfidenceFactorType.STRATEGY_RELIABILITY]: 0.2,
      [ConfidenceFactorType.SEMANTIC_SIMILARITY]: 0.2,
      [ConfidenceFactorType.RULE_MATCH_STRENGTH]: 0.15,
      [ConfidenceFactorType.CONTEXT_CONSISTENCY]: 0.15,
      [ConfidenceFactorType.FREQUENCY]: 0.1,
      [ConfidenceFactorType.AI_CONFIDENCE]: 0.15,
      [ConfidenceFactorType.TYPE_COMPATIBILITY]: 0.05
    },
    algorithmType: 'weighted_sum',
    enableDynamicWeights: false,
    minConfidenceThreshold: 0.6
  }
};
```

### 10.2 输出示例

```typescript
{
  "confidenceScore": 0.92,
  "factors": [
    {
      "type": "STRATEGY_RELIABILITY",
      "weight": 0.2,
      "score": 0.9,
      "description": "策略 RuleBased 的历史可靠性评分为 0.9"
    },
    {
      "type": "SEMANTIC_SIMILARITY",
      "weight": 0.2,
      "score": 0.95,
      "description": "源概念与目标概念的语义相似度为 0.95"
    },
    {
      "type": "RULE_MATCH_STRENGTH",
      "weight": 0.15,
      "score": 0.9,
      "description": "规则匹配强度为 0.9"
    },
    {
      "type": "CONTEXT_CONSISTENCY",
      "weight": 0.15,
      "score": 1.0,
      "description": "与现有关系的一致性评分为 1.0"
    },
    {
      "type": "FREQUENCY",
      "weight": 0.1,
      "score": 0.8,
      "description": "源概念频率为 0.8，目标概念频率为 0.8"
    },
    {
      "type": "AI_CONFIDENCE",
      "weight": 0.15,
      "score": 0.85,
      "description": "AI模型返回的置信度为 0.85"
    },
    {
      "type": "TYPE_COMPATIBILITY",
      "weight": 0.05,
      "score": 1.0,
      "description": "关系类型与概念类型的兼容性评分为 1.0"
    }
  ],
  "algorithmType": "weighted_sum",
  "scoredAt": "2023-01-05T10:30:01.000Z"
}
```

## 11. 总结

置信度评分是认知关系推断系统的重要组成部分，通过多维度的评分机制确保推断关系的质量。本实现采用了模块化设计，支持多种评分策略和算法，包括加权求和算法和机器学习算法。系统实现了完善的错误处理机制，确保在各种情况下都能稳定运行，并通过缓存、并行处理、延迟计算和特征复用等性能优化策略提高了系统的响应速度和吞吐量。

该模块遵循了Clean Architecture原则，将核心业务逻辑与外部依赖分离，确保了系统的可维护性、可扩展性和可测试性。通过配置化的设计，支持根据不同场景调整评分参数，适应不同的使用需求。置信度评分服务的实现为认知模型的准确性和可靠性提供了重要保障，是构建高质量认知辅助系统的关键组件。