# 53-思维盲点检测技术实现文档

## 1. 模块概述

### 1.1 功能定位
思维盲点检测模块是认知反馈系统的关键组成部分，负责识别用户认知结构中存在的缺失、矛盾、偏见或未充分考虑的领域。该模块通过分析用户的认知模型、思维模式和知识结构，检测出可能影响用户思考和决策的盲点，并生成有针对性的反馈，帮助用户拓展思维视角，完善认知结构。

### 1.2 设计原则
- 遵循 Clean Architecture 原则，核心业务逻辑与 AI 能力解耦
- 支持多种盲点检测算法，便于扩展和替换
- 高内聚、低耦合，与其他模块通过接口交互
- 支持实时和批量盲点检测
- 提供可配置的盲点检测参数
- 确保检测结果的准确性和可靠性

### 1.3 技术栈
- TypeScript
- Node.js
- Express.js (HTTP API)
- SQLite (结构化数据存储)
- Qdrant (向量数据存储)
- OpenAI API (AI 辅助盲点检测)
- 自然语言处理库 (如 NLP.js 或 spaCy)
- 图算法库 (如 graphology 或 neo4j-driver)

## 2. 架构设计

### 2.1 分层架构
```
┌─────────────────────────────────────────────────┐
│ Presentation Layer                              │
│ - REST API Controllers                          │
├─────────────────────────────────────────────────┤
│ Application Layer                               │
│ - BlindspotDetectionUseCase                     │
│ - BlindspotDetectionService (Interface)         │
├─────────────────────────────────────────────────┤
│ Domain Layer                                    │
│ - CognitiveBlindspot (Entity)                   │
│ - BlindspotType (Enum)                          │
│ - BlindspotDetectionRules                       │
├─────────────────────────────────────────────────┤
│ Infrastructure Layer                            │
│ - BlindspotRepository                           │
│ - VectorSimilarityService                       │
│ - GraphAnalysisService                          │
│ - CacheService                                  │
├─────────────────────────────────────────────────┤
│ AI Capability Layer                             │
│ - AIBllindspotDetector                          │
│ - NLPService                                    │
└─────────────────────────────────────────────────┘
```

### 2.2 核心组件

| 组件 | 职责 | 所在层 |
|------|------|--------|
| BlindspotDetectionService | 盲点检测核心服务接口 | Application |
| BlindspotDetectionServiceImpl | 盲点检测服务实现 | Application |
| BlindspotDetector | 盲点检测器接口 | Application |
| ContradictionBlindspotDetector | 矛盾型盲点检测器 | Application |
| GapBlindspotDetector | 缺口型盲点检测器 | Application |
| BiasBlindspotDetector | 偏见型盲点检测器 | Application |
| UnderRepresentationBlindspotDetector | 代表性不足盲点检测器 | Application |
| AIBllindspotDetector | AI 辅助盲点检测器 | AI Capability |
| BlindspotRepository | 盲点存储仓库 | Infrastructure |
| VectorSimilarityService | 向量相似度计算服务 | Infrastructure |
| GraphAnalysisService | 图分析服务 | Infrastructure |
| NLPService | 自然语言处理服务 | AI Capability |

## 3. 核心接口定义

### 3.1 BlindspotDetectionService
```typescript
/**
 * 思维盲点检测服务接口
 */
export interface BlindspotDetectionService {
  /**
   * 为用户检测思维盲点
   * @param userId 用户ID
   * @param options 盲点检测选项
   * @returns 检测出的思维盲点列表
   */
  detectBlindspots(userId: string, options: BlindspotDetectionOptions): Promise<CognitiveBlindspot[]>;

  /**
   * 为特定认知模型检测思维盲点
   * @param modelId 认知模型ID
   * @param options 盲点检测选项
   * @returns 检测出的思维盲点列表
   */
  detectBlindspotsForModel(modelId: string, options: BlindspotDetectionOptions): Promise<CognitiveBlindspot[]>;

  /**
   * 获取用户的历史盲点检测结果
   * @param userId 用户ID
   * @param filters 过滤条件
   * @returns 历史盲点检测结果列表
   */
  getHistoricalBlindspots(userId: string, filters: BlindspotFilters): Promise<BlindspotDetectionResult[]>;

  /**
   * 获取特定盲点的详细信息
   * @param blindspotId 盲点ID
   * @returns 盲点详细信息
   */
  getBlindspotDetails(blindspotId: string): Promise<CognitiveBlindspot>;

  /**
   * 更新盲点检测配置
   * @param userId 用户ID
   * @param config 盲点检测配置
   */
  updateBlindspotDetectionConfig(userId: string, config: BlindspotDetectionConfig): Promise<void>;

  /**
   * 标记盲点为已处理
   * @param blindspotId 盲点ID
   */
  markBlindspotAsResolved(blindspotId: string): Promise<void>;
}

/**
 * 盲点检测选项
 */
export interface BlindspotDetectionOptions {
  detectorTypes?: BlindspotDetectorType[];
  minSeverity?: number;
  maxBlindspots?: number;
  includeResolved?: boolean;
  refreshCache?: boolean;
}

/**
 * 盲点过滤条件
 */
export interface BlindspotFilters {
  startDate?: Date;
  endDate?: Date;
  minSeverity?: number;
  blindspotTypes?: BlindspotType[];
  isResolved?: boolean;
}

/**
 * 盲点检测配置
 */
export interface BlindspotDetectionConfig {
  defaultDetectors: BlindspotDetectorType[];
  minSeverity: number;
  maxBlindspots: number;
  autoUpdate: boolean;
}
```

### 3.2 BlindspotDetector
```typescript
/**
 * 盲点检测器类型枚举
 */
export enum BlindspotDetectorType {
  CONTRADICTION = 'CONTRADICTION',               // 矛盾型盲点检测器
  GAP = 'GAP',                                   // 缺口型盲点检测器
  BIAS = 'BIAS',                                 // 偏见型盲点检测器
  UNDER_REPRESENTATION = 'UNDER_REPRESENTATION', // 代表性不足盲点检测器
  AI_ASSISTED = 'AI_ASSISTED'                    // AI 辅助盲点检测器
}

/**
 * 盲点检测器接口
 */
export interface BlindspotDetector {
  /**
   * 获取盲点检测器类型
   */
  getType(): BlindspotDetectorType;

  /**
   * 检测思维盲点
   * @param context 盲点检测上下文
   * @returns 检测出的思维盲点列表
   */
  detectBlindspots(context: BlindspotDetectionContext): Promise<CognitiveBlindspot[]>;
}

/**
 * 盲点检测上下文
 */
export interface BlindspotDetectionContext {
  userId: string;
  modelId?: string;
  cognitiveModel?: UserCognitiveModel;
  historicalBlindspots?: CognitiveBlindspot[];
  options: BlindspotDetectionOptions;
}
```

## 4. 数据结构设计

### 4.1 CognitiveBlindspot (实体)
```typescript
/**
 * 思维盲点类型枚举
 */
export enum BlindspotType {
  CONTRADICTION = 'CONTRADICTION',               // 矛盾型盲点：认知结构中存在矛盾的概念或关系
  GAP = 'GAP',                                   // 缺口型盲点：认知结构中缺少重要的概念或关系
  BIAS = 'BIAS',                                 // 偏见型盲点：认知结构中存在偏见或片面性
  UNDER_REPRESENTATION = 'UNDER_REPRESENTATION', // 代表性不足：某些重要领域在认知结构中代表性不足
  INCONSISTENCY = 'INCONSISTENCY',               // 不一致性：认知结构中存在不一致的模式
  STAGNATION = 'STAGNATION'                      // 停滞型：认知结构长期没有变化或发展
}

/**
 * 思维盲点实体
 */
export class CognitiveBlindspot {
  constructor(
    public id: string,
    public userId: string,
    public modelId: string,
    public type: BlindspotType,
    public severity: number,       // 1-10，盲点严重程度
    public confidence: number,     // 0-1，检测置信度
    public title: string,          // 盲点标题
    public description: string,    // 盲点描述
    public relatedConcepts: string[], // 相关概念ID列表
    public relatedRelations: string[], // 相关关系ID列表
    public evidence: string[],     // 支持盲点存在的证据
    public suggestedActions: string[], // 建议的改进措施
    public metadata: Record<string, any>, // 盲点元数据
    public isResolved: boolean = false, // 是否已解决
    public resolvedAt?: Date,       // 解决时间
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

/**
 * 盲点检测结果
 */
export class BlindspotDetectionResult {
  constructor(
    public id: string,
    public userId: string,
    public modelId: string,
    public blindspots: CognitiveBlindspot[],
    public detectorTypes: BlindspotDetectorType[],
    detectionDate: Date,
    metadata: Record<string, any>
  ) {}
}
```

### 4.2 BlindspotMetadata (元数据)
```typescript
/**
 * 矛盾型盲点元数据
 */
export interface ContradictionBlindspotMetadata {
  contradictionType: 'CONCEPT' | 'RELATION' | 'RULE';
  conflictingElements: Array<{ id: string; type: string; value: any }>;
  contradictionScore: number;
  resolutionSuggestions: string[];
}

/**
 * 缺口型盲点元数据
 */
export interface GapBlindspotMetadata {
  gapType: 'CONCEPT' | 'RELATION' | 'DOMAIN';
  missingElements: string[];
  expectedElements: string[];
  gapSize: number;
  impactScore: number;
}

/**
 * 偏见型盲点元数据
 */
export interface BiasBlindspotMetadata {
  biasType: 'CONFIRMATION' | 'ANCHORING' | 'AVAILABILITY' | 'OTHER';
  biasedConcepts: string[];
  biasEvidence: string[];
  biasScore: number;
}

/**
 * 代表性不足盲点元数据
 */
export interface UnderRepresentationBlindspotMetadata {
  underRepresentedDomain: string;
  expectedRepresentation: number;
  actualRepresentation: number;
  relatedDomains: string[];
  representationGap: number;
}

/**
 * AI 辅助盲点元数据
 */
export interface AIAssistedBlindspotMetadata {
  aiModel: string;
  aiConfidence: number;
  aiGeneratedDescription: string;
  aiSuggestedActions: string[];
}
```

## 5. 实现细节

### 5.1 BlindspotDetectionServiceImpl
```typescript
/**
 * 思维盲点检测服务实现
 */
export class BlindspotDetectionServiceImpl implements BlindspotDetectionService {
  private readonly blindspotDetectors: Map<BlindspotDetectorType, BlindspotDetector>;
  private readonly cacheService: CacheService;
  private readonly blindspotRepository: BlindspotRepository;
  private readonly cognitiveModelService: CognitiveModelService;
  private readonly configRepository: ConfigRepository;

  constructor(
    cacheService: CacheService,
    blindspotRepository: BlindspotRepository,
    cognitiveModelService: CognitiveModelService,
    configRepository: ConfigRepository,
    ...detectors: BlindspotDetector[]
  ) {
    this.cacheService = cacheService;
    this.blindspotRepository = blindspotRepository;
    this.cognitiveModelService = cognitiveModelService;
    this.configRepository = configRepository;
    this.blindspotDetectors = new Map(detectors.map(detector => [detector.getType(), detector]));
  }

  async detectBlindspots(userId: string, options: BlindspotDetectionOptions): Promise<CognitiveBlindspot[]> {
    // 获取用户最新认知模型
    const latestModel = await this.cognitiveModelService.getLatestModel(userId);
    if (!latestModel) {
      return [];
    }

    return this.detectBlindspotsForModel(latestModel.id, options);
  }

  async detectBlindspotsForModel(modelId: string, options: BlindspotDetectionOptions): Promise<CognitiveBlindspot[]> {
    const cacheKey = `blindspots:${modelId}:${JSON.stringify(options)}`;
    
    // 检查缓存
    if (!options.refreshCache) {
      const cachedBlindspots = await this.cacheService.get<CognitiveBlindspot[]>(cacheKey);
      if (cachedBlindspots) {
        return cachedBlindspots;
      }
    }

    // 获取认知模型
    const model = await this.cognitiveModelService.getModelById(modelId);
    if (!model) {
      throw new Error(`Cognitive model not found: ${modelId}`);
    }

    // 获取历史盲点检测结果
    const historicalBlindspots = await this.blindspotRepository.getBlindspotsByModelId(modelId);

    // 生成盲点检测上下文
    const context: BlindspotDetectionContext = {
      userId: model.userId,
      modelId: model.id,
      cognitiveModel: model,
      historicalBlindspots,
      options
    };

    // 获取要使用的盲点检测器
    const detectorTypes = options.detectorTypes || Object.values(BlindspotDetectorType);
    const activeDetectors = detectorTypes
      .map(type => this.blindspotDetectors.get(type))
      .filter(detector => detector !== undefined);

    // 并行运行所有盲点检测器
    const blindspotResults = (await Promise.all(activeDetectors.map(detector => detector.detectBlindspots(context)))).flat();

    // 合并和优化盲点结果
    const mergedBlindspots = this.mergeAndOptimizeBlindspots(blindspotResults, options);

    // 保存盲点检测结果
    await Promise.all(mergedBlindspots.map(blindspot => this.blindspotRepository.saveBlindspot(blindspot)));

    // 创建盲点检测结果记录
    const detectionResult = new BlindspotDetectionResult(
      uuidv4(),
      model.userId,
      model.id,
      mergedBlindspots,
      detectorTypes,
      new Date(),
      {
        detectionOptions: options,
        blindspotCount: mergedBlindspots.length,
        totalConcepts: model.concepts.length,
        totalRelations: model.relations.length
      }
    );
    await this.blindspotRepository.saveBlindspotDetectionResult(detectionResult);

    // 缓存结果
    await this.cacheService.set(cacheKey, mergedBlindspots, 3600); // 缓存1小时

    return mergedBlindspots;
  }

  private mergeAndOptimizeBlindspots(blindspots: CognitiveBlindspot[], options: BlindspotDetectionOptions): CognitiveBlindspot[] {
    // 1. 去重相似盲点
    const deduplicatedBlindspots = this.deduplicateSimilarBlindspots(blindspots);
    
    // 2. 计算盲点严重程度
    const weightedBlindspots = this.calculateBlindspotSeverity(deduplicatedBlindspots);
    
    // 3. 过滤低严重程度盲点
    const filteredBlindspots = weightedBlindspots.filter(blindspot => 
      blindspot.severity >= (options.minSeverity || 1)
    );
    
    // 4. 排序盲点
    const sortedBlindspots = filteredBlindspots.sort((a, b) => b.severity - a.severity);
    
    // 5. 限制盲点数量
    const limitedBlindspots = sortedBlindspots.slice(0, options.maxBlindspots || 10);
    
    return limitedBlindspots;
  }

  private deduplicateSimilarBlindspots(blindspots: CognitiveBlindspot[]): CognitiveBlindspot[] {
    // 实现盲点去重逻辑，合并相似盲点
    // ...
    return blindspots;
  }

  private calculateBlindspotSeverity(blindspots: CognitiveBlindspot[]): CognitiveBlindspot[] {
    // 实现盲点严重程度计算逻辑
    // ...
    return blindspots;
  }

  // 其他方法实现...
}
```

### 5.2 ContradictionBlindspotDetector
```typescript
/**
 * 矛盾型盲点检测器
 */
export class ContradictionBlindspotDetector implements BlindspotDetector {
  private readonly graphAnalysisService: GraphAnalysisService;

  constructor(graphAnalysisService: GraphAnalysisService) {
    this.graphAnalysisService = graphAnalysisService;
  }

  getType(): BlindspotDetectorType {
    return BlindspotDetectorType.CONTRADICTION;
  }

  async detectBlindspots(context: BlindspotDetectionContext): Promise<CognitiveBlindspot[]> {
    const { cognitiveModel } = context;
    if (!cognitiveModel) {
      return [];
    }

    const blindspots: CognitiveBlindspot[] = [];
    
    // 1. 构建认知图
    const cognitiveGraph = this.buildCognitiveGraph(cognitiveModel);
    
    // 2. 检测图中的矛盾关系
    const contradictionResults = await this.graphAnalysisService.detectContradictions(cognitiveGraph);
    
    // 3. 生成矛盾型盲点
    for (const contradiction of contradictionResults) {
      const blindspot = new CognitiveBlindspot(
        uuidv4(),
        context.userId,
        context.modelId!,
        BlindspotType.CONTRADICTION,
        contradiction.score || 5,
        contradiction.confidence || 0.8,
        `矛盾型盲点: ${contradiction.description}`,
        contradiction.details || '您的认知结构中存在矛盾的概念或关系',
        contradiction.relatedConcepts || [],
        contradiction.relatedRelations || [],
        contradiction.evidence || [],
        contradiction.resolutionSuggestions || [],
        {
          contradictionType: contradiction.type || 'RELATION',
          conflictingElements: contradiction.conflictingElements || [],
          contradictionScore: contradiction.score || 5,
          resolutionSuggestions: contradiction.resolutionSuggestions || []
        } as ContradictionBlindspotMetadata,
        false,
        undefined,
        new Date(),
        new Date()
      );
      
      blindspots.push(blindspot);
    }
    
    return blindspots;
  }

  private buildCognitiveGraph(model: UserCognitiveModel): any {
    // 构建认知图，用于图分析
    // ...
    return {};
  }
}
```

### 5.3 GapBlindspotDetector
```typescript
/**
 * 缺口型盲点检测器
 */
export class GapBlindspotDetector implements BlindspotDetector {
  private readonly vectorService: VectorSimilarityService;
  private readonly relationInferenceService: RelationInferenceService;

  constructor(vectorService: VectorSimilarityService, relationInferenceService: RelationInferenceService) {
    this.vectorService = vectorService;
    this.relationInferenceService = relationInferenceService;
  }

  getType(): BlindspotDetectorType {
    return BlindspotDetectorType.GAP;
  }

  async detectBlindspots(context: BlindspotDetectionContext): Promise<CognitiveBlindspot[]> {
    const { cognitiveModel } = context;
    if (!cognitiveModel) {
      return [];
    }

    const blindspots: CognitiveBlindspot[] = [];
    
    // 1. 检测缺失的关键概念
    const missingConcepts = await this.detectMissingConcepts(cognitiveModel);
    
    // 2. 检测缺失的重要关系
    const missingRelations = await this.detectMissingRelations(cognitiveModel);
    
    // 3. 生成缺口型盲点
    for (const missingConcept of missingConcepts) {
      const blindspot = new CognitiveBlindspot(
        uuidv4(),
        context.userId,
        context.modelId!,
        BlindspotType.GAP,
        missingConcept.impactScore || 5,
        missingConcept.confidence || 0.7,
        `缺口型盲点: 缺少重要概念 "${missingConcept.name}"`,
        `您的认知结构中缺少重要概念 "${missingConcept.name}"，该概念与您已有的核心概念密切相关。`,
        missingConcept.relatedConcepts || [],
        [],
        missingConcept.evidence || [],
        [`考虑添加概念 "${missingConcept.name}" 到您的认知结构中`, `探索 "${missingConcept.name}" 与现有概念的关系`],
        {
          gapType: 'CONCEPT',
          missingElements: [missingConcept.id],
          expectedElements: missingConcept.expectedElements || [],
          gapSize: missingConcept.gapSize || 1,
          impactScore: missingConcept.impactScore || 5
        } as GapBlindspotMetadata,
        false,
        undefined,
        new Date(),
        new Date()
      );
      
      blindspots.push(blindspot);
    }
    
    // 生成缺失关系的盲点...
    
    return blindspots;
  }

  private async detectMissingConcepts(model: UserCognitiveModel): Promise<any[]> {
    // 检测缺失的关键概念
    // ...
    return [];
  }

  private async detectMissingRelations(model: UserCognitiveModel): Promise<any[]> {
    // 检测缺失的重要关系
    // ...
    return [];
  }
}
```

### 5.4 BiasBlindspotDetector
```typescript
/**
 * 偏见型盲点检测器
 */
export class BiasBlindspotDetector implements BlindspotDetector {
  private readonly nlpService: NLPService;
  private readonly vectorService: VectorSimilarityService;

  constructor(nlpService: NLPService, vectorService: VectorSimilarityService) {
    this.nlpService = nlpService;
    this.vectorService = vectorService;
  }

  getType(): BlindspotDetectorType {
    return BlindspotDetectorType.BIAS;
  }

  async detectBlindspots(context: BlindspotDetectionContext): Promise<CognitiveBlindspot[]> {
    const { cognitiveModel } = context;
    if (!cognitiveModel) {
      return [];
    }

    const blindspots: CognitiveBlindspot[] = [];
    
    // 1. 分析概念的情感倾向
    const conceptSentiments = await this.analyzeConceptSentiments(cognitiveModel);
    
    // 2. 检测概念间的偏见模式
    const biasPatterns = this.detectBiasPatterns(conceptSentiments, cognitiveModel);
    
    // 3. 生成偏见型盲点
    for (const biasPattern of biasPatterns) {
      const blindspot = new CognitiveBlindspot(
        uuidv4(),
        context.userId,
        context.modelId!,
        BlindspotType.BIAS,
        biasPattern.biasScore || 5,
        biasPattern.confidence || 0.7,
        `偏见型盲点: ${biasPattern.biasType} 偏见`,
        `您的认知结构中可能存在 ${biasPattern.biasType} 偏见，影响了您对某些概念的理解。`,
        biasPattern.biasedConcepts || [],
        [],
        biasPattern.evidence || [],
        biasPattern.suggestions || [],
        {
          biasType: biasPattern.biasType || 'OTHER',
          biasedConcepts: biasPattern.biasedConcepts || [],
          biasEvidence: biasPattern.evidence || [],
          biasScore: biasPattern.biasScore || 5
        } as BiasBlindspotMetadata,
        false,
        undefined,
        new Date(),
        new Date()
      );
      
      blindspots.push(blindspot);
    }
    
    return blindspots;
  }

  private async analyzeConceptSentiments(model: UserCognitiveModel): Promise<any[]> {
    // 分析概念的情感倾向
    // ...
    return [];
  }

  private detectBiasPatterns(sentiments: any[], model: UserCognitiveModel): any[] {
    // 检测概念间的偏见模式
    // ...
    return [];
  }
}
```

### 5.5 UnderRepresentationBlindspotDetector
```typescript
/**
 * 代表性不足盲点检测器
 */
export class UnderRepresentationBlindspotDetector implements BlindspotDetector {
  private readonly domainClassificationService: DomainClassificationService;

  constructor(domainClassificationService: DomainClassificationService) {
    this.domainClassificationService = domainClassificationService;
  }

  getType(): BlindspotDetectorType {
    return BlindspotDetectorType.UNDER_REPRESENTATION;
  }

  async detectBlindspots(context: BlindspotDetectionContext): Promise<CognitiveBlindspot[]> {
    const { cognitiveModel } = context;
    if (!cognitiveModel) {
      return [];
    }

    const blindspots: CognitiveBlindspot[] = [];
    
    // 1. 对概念进行领域分类
    const conceptDomains = await this.classifyConceptDomains(cognitiveModel);
    
    // 2. 分析领域分布
    const domainDistribution = this.analyzeDomainDistribution(conceptDomains);
    
    // 3. 检测代表性不足的领域
    const underRepresentedDomains = this.detectUnderRepresentedDomains(domainDistribution);
    
    // 4. 生成代表性不足盲点
    for (const domain of underRepresentedDomains) {
      const blindspot = new CognitiveBlindspot(
        uuidv4(),
        context.userId,
        context.modelId!,
        BlindspotType.UNDER_REPRESENTATION,
        domain.impactScore || 4,
        domain.confidence || 0.6,
        `代表性不足: ${domain.domainName} 领域`,
        `您的认知结构中 ${domain.domainName} 领域的代表性不足，可能影响您对相关问题的全面理解。`,
        domain.relatedConcepts || [],
        [],
        domain.evidence || [],
        domain.suggestions || [],
        {
          underRepresentedDomain: domain.domainName,
          expectedRepresentation: domain.expectedRepresentation || 0.1,
          actualRepresentation: domain.actualRepresentation || 0,
          relatedDomains: domain.relatedDomains || [],
          representationGap: domain.representationGap || 0.1
        } as UnderRepresentationBlindspotMetadata,
        false,
        undefined,
        new Date(),
        new Date()
      );
      
      blindspots.push(blindspot);
    }
    
    return blindspots;
  }

  private async classifyConceptDomains(model: UserCognitiveModel): Promise<any[]> {
    // 对概念进行领域分类
    // ...
    return [];
  }

  private analyzeDomainDistribution(conceptDomains: any[]): any {
    // 分析领域分布
    // ...
    return {};
  }

  private detectUnderRepresentedDomains(domainDistribution: any): any[] {
    // 检测代表性不足的领域
    // ...
    return [];
  }
}
```

### 5.6 AIBllindspotDetector
```typescript
/**
 * AI 辅助盲点检测器
 */
export class AIBllindspotDetector implements BlindspotDetector {
  private readonly openaiService: OpenAIService;
  private readonly cognitiveModelService: CognitiveModelService;

  constructor(openaiService: OpenAIService, cognitiveModelService: CognitiveModelService) {
    this.openaiService = openaiService;
    this.cognitiveModelService = cognitiveModelService;
  }

  getType(): BlindspotDetectorType {
    return BlindspotDetectorType.AI_ASSISTED;
  }

  async detectBlindspots(context: BlindspotDetectionContext): Promise<CognitiveBlindspot[]> {
    const { cognitiveModel } = context;
    if (!cognitiveModel) {
      return [];
    }

    // 1. 准备认知模型摘要
    const modelSummary = this.prepareModelSummary(cognitiveModel);

    // 2. 构建 AI 提示词
    const aiPrompt = this.buildAIPrompt(modelSummary);
    
    // 3. 调用 OpenAI API 检测盲点
    const aiResponse = await this.openaiService.complete({
      model: 'gpt-4',
      prompt: aiPrompt,
      maxTokens: 1500,
      temperature: 0.7,
      responseFormat: {
        type: 'json_object'
      }
    });

    // 4. 解析 AI 响应
    const aiBlindspots = this.parseAIResponse(aiResponse, context);

    return aiBlindspots;
  }

  private prepareModelSummary(model: UserCognitiveModel): string {
    // 准备认知模型摘要，包含概念和关系信息
    const conceptDescriptions = model.concepts.map(concept => 
      `${concept.id}: ${concept.name} (权重: ${concept.weight}) - ${concept.description || ''}`
    ).join('\n');
    
    const relationDescriptions = model.relations.map(relation => 
      `${relation.fromConceptId} ${relation.type} ${relation.toConceptId} (强度: ${relation.strength})`
    ).join('\n');
    
    return `认知模型摘要:\n\n概念列表:\n${conceptDescriptions}\n\n关系列表:\n${relationDescriptions}`;
  }

  private buildAIPrompt(modelSummary: string): string {
    return `
您是一位认知科学专家，请分析以下用户的认知结构模型，并识别出可能存在的思维盲点:\n\n${modelSummary}\n\n请按照以下要求输出结果:\n1. 识别 3-8 个可能的思维盲点\n2. 每个盲点包含:\n   - type: 盲点类型 (CONTRADICTION, GAP, BIAS, UNDER_REPRESENTATION, INCONSISTENCY, STAGNATION)\n   - severity: 盲点严重程度 (1-10)\n   - confidence: 检测置信度 (0-1)\n   - title: 盲点标题\n   - description: 盲点详细描述\n   - relatedConcepts: 相关概念ID列表\n   - evidence: 支持盲点存在的证据\n   - suggestedActions: 建议的改进措施\n3. 请以JSON格式输出，不要包含其他文本\n4. 确保盲点描述准确、具体，并提供可行的改进建议\n`;
  }

  private parseAIResponse(response: string, context: BlindspotDetectionContext): CognitiveBlindspot[] {
    try {
      const aiResult = JSON.parse(response);
      const blindspots: CognitiveBlindspot[] = [];
      
      if (Array.isArray(aiResult.blindspots)) {
        for (const aiBlindspot of aiResult.blindspots) {
          const blindspot = new CognitiveBlindspot(
            uuidv4(),
            context.userId,
            context.modelId!,
            BlindspotType[aiBlindspot.type as keyof typeof BlindspotType] || BlindspotType.INCONSISTENCY,
            aiBlindspot.severity || 5,
            aiBlindspot.confidence || 0.8,
            aiBlindspot.title,
            aiBlindspot.description,
            aiBlindspot.relatedConcepts || [],
            [],
            aiBlindspot.evidence || [],
            aiBlindspot.suggestedActions || [],
            {
              aiModel: 'gpt-4',
              aiConfidence: aiBlindspot.confidence || 0.8,
              aiGeneratedDescription: aiBlindspot.description,
              aiSuggestedActions: aiBlindspot.suggestedActions || []
            } as AIAssistedBlindspotMetadata,
            false,
            undefined,
            new Date(),
            new Date()
          );
          
          blindspots.push(blindspot);
        }
      }
      
      return blindspots;
    } catch (error) {
      console.error('Failed to parse AI blindspot detection response:', error);
      return [];
    }
  }
}
```

## 6. 错误处理

### 6.1 异常类型
```typescript
/**
 * 盲点检测异常
 */
export class BlindspotDetectionError extends ApplicationError {
  constructor(message: string, cause?: Error) {
    super(message, 'BLINDSPOT_DETECTION_ERROR', cause);
  }
}

/**
 * 盲点检测器异常
 */
export class BlindspotDetectorError extends ApplicationError {
  constructor(detectorType: BlindspotDetectorType, message: string, cause?: Error) {
    super(`${detectorType} failed: ${message}`, 'BLINDSPOT_DETECTOR_ERROR', cause);
  }
}

/**
 * AI 盲点检测异常
 */
export class AIBllindspotDetectionError extends ApplicationError {
  constructor(message: string, cause?: Error) {
    super(`AI blindspot detection failed: ${message}`, 'AI_BLINDSPOT_DETECTION_ERROR', cause);
  }
}

/**
 * 盲点合并异常
 */
export class BlindspotMergeError extends ApplicationError {
  constructor(message: string, cause?: Error) {
    super(`Blindspot merge failed: ${message}`, 'BLINDSPOT_MERGE_ERROR', cause);
  }
}
```

### 6.2 错误处理策略

| 错误类型 | 处理策略 | 重试机制 | 日志级别 |
|----------|----------|----------|----------|
| BlindspotDetectionError | 返回500错误，记录详细日志 | 否 | ERROR |
| BlindspotDetectorError | 跳过该检测器，继续使用其他检测器 | 否 | WARN |
| AIBllindspotDetectionError | 回退到传统检测器，记录警告日志 | 是（最多3次） | WARN |
| BlindspotMergeError | 使用原始盲点结果，记录警告日志 | 否 | WARN |
| 数据库连接错误 | 重试连接，返回503错误 | 是（最多5次，指数退避） | ERROR |
| 缓存服务错误 | 跳过缓存，继续执行 | 否 | INFO |
| 向量服务错误 | 回退到规则基础检测器 | 否 | WARN |
| 图分析服务错误 | 跳过图相关检测，继续使用其他检测方法 | 否 | WARN |

## 7. 性能优化

### 7.1 缓存策略
- 盲点检测结果缓存1小时，减少重复计算
- 使用 Redis 或内存缓存存储热点盲点
- 支持手动刷新缓存
- 缓存概念向量和图分析结果，减少计算开销

### 7.2 并行处理
- 多个盲点检测器并行执行
- 批量处理数据库操作
- AI 调用异步执行，不阻塞主线程
- 并行计算概念情感和领域分类

### 7.3 增量检测
- 仅对认知模型的变化部分进行增量检测
- 复用之前的盲点检测结果
- 支持按需检测特定类型的盲点

### 7.4 资源限制
- 限制 AI 调用频率和并发数
- 限制单个用户的盲点检测频率
- 对大数据集进行采样处理
- 优化图算法，减少计算复杂度

### 7.5 算法优化
- 使用近似算法加速图分析
- 优化向量相似度计算，减少计算时间
- 使用增量学习算法处理动态更新的认知模型

## 8. 测试策略

### 8.1 单元测试
- 测试每个盲点检测器的核心逻辑
- 测试盲点合并和优化算法
- 测试盲点严重程度计算
- 测试错误处理

### 8.2 集成测试
- 测试盲点检测服务与其他服务的集成
- 测试 AI 辅助盲点检测流程
- 测试盲点存储和检索
- 测试盲点检测配置更新

### 8.3 端到端测试
- 测试完整的盲点检测流程
- 测试不同用户场景下的盲点检测
- 测试性能和响应时间
- 测试盲点检测结果的准确性和相关性

### 8.4 测试工具
- Jest: 单元测试和集成测试
- Supertest: API 测试
- MockServiceWorker: 模拟外部服务
- LoadTest: 性能测试
- 人工评估: 盲点检测结果的准确性评估

## 9. 部署与监控

### 9.1 部署策略
- 容器化部署（Docker）
- 支持水平扩展
- 配置化的资源分配
- 支持蓝绿部署和滚动更新

### 9.2 监控指标
- 盲点检测成功率
- 盲点检测平均时间
- 每个检测器的贡献度
- 缓存命中率
- AI 调用成功率和响应时间
- 错误率和错误类型分布
- 盲点检测结果的用户满意度（通过反馈收集）

### 9.3 日志记录
- 结构化日志，包含盲点检测类型、用户ID、生成时间等
- 支持日志级别配置
- 日志集中存储和分析
- 记录盲点检测结果的关键指标

## 10. 扩展与演进

### 10.1 新增盲点检测器
- 实现 BlindspotDetector 接口
- 在 BlindspotDetectionServiceImpl 中注册
- 配置检测器优先级和资源分配

### 10.2 AI 模型升级
- 支持多 AI 模型切换
- 实现 AI 模型评估机制
- 支持模型版本管理
- 实现模型微调功能，提高盲点检测准确性

### 10.3 盲点类型扩展
- 在 BlindspotType 枚举中添加新类型
- 实现对应的盲点处理逻辑
- 更新前端展示逻辑

### 10.4 个性化盲点检测
- 基于用户反馈调整盲点检测策略
- 学习用户偏好的盲点类型和严重程度
- 支持用户自定义盲点检测规则

### 10.5 多语言支持
- 扩展盲点检测器，支持多语言概念和关系
- 集成多语言 NLP 库
- 支持跨语言盲点检测

## 11. 代码结构

```
src/
├── application/
│   ├── services/
│   │   ├── blindspot-detection/
│   │   │   ├── BlindspotDetectionService.ts
│   │   │   ├── BlindspotDetectionServiceImpl.ts
│   │   │   ├── detectors/
│   │   │   │   ├── BlindspotDetector.ts
│   │   │   │   ├── ContradictionBlindspotDetector.ts
│   │   │   │   ├── GapBlindspotDetector.ts
│   │   │   │   ├── BiasBlindspotDetector.ts
│   │   │   │   ├── UnderRepresentationBlindspotDetector.ts
│   │   │   │   └── AIBllindspotDetector.ts
│   │   │   └── BlindspotDetectionUseCase.ts
│   │   └── BlindspotMergeService.ts
│   └── dtos/
│       └── blindspot-detection/
│           ├── BlindspotDetectionOptions.ts
│           ├── BlindspotFilters.ts
│           └── BlindspotDetectionConfig.ts
├── domain/
│   ├── entities/
│   │   ├── CognitiveBlindspot.ts
│   │   └── BlindspotDetectionResult.ts
│   ├── enums/
│   │   ├── BlindspotType.ts
│   │   └── BlindspotDetectorType.ts
│   └── rules/
│       └── BlindspotDetectionRules.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── BlindspotRepository.ts
│   │   └── ConfigRepository.ts
│   └── services/
│       ├── CacheService.ts
│       ├── VectorSimilarityService.ts
│       ├── GraphAnalysisService.ts
│       └── DomainClassificationService.ts
├── ai/
│   └── services/
│       ├── AIBllindspotDetector.ts
│       ├── OpenAIService.ts
│       └── NLPService.ts
└── presentation/
    └── controllers/
        └── BlindspotDetectionController.ts
```

## 12. 总结

思维盲点检测模块是认知反馈系统的关键组成部分，通过多种检测算法识别用户认知结构中存在的矛盾、缺口、偏见和代表性不足等问题。该模块采用了插件化设计，支持多种盲点检测器，包括矛盾型检测器、缺口型检测器、偏见型检测器、代表性不足检测器和 AI 辅助检测器。

该实现严格遵循了 Clean Architecture 原则，实现了核心业务逻辑与 AI 能力的解耦，确保了系统的可维护性和可扩展性。通过缓存、并行处理和增量检测等优化策略，保证了系统的性能和响应速度。

这个技术实现文档为 AI 代码生成提供了清晰的指导，包括接口定义、数据结构、实现细节、错误处理、性能优化和测试策略等方面，确保生成的代码符合生产级质量要求。思维盲点检测模块的实现将为认知反馈系统提供强大的盲点识别和分析能力，帮助用户更好地理解和完善自己的认知结构。