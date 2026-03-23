# 64-建议依据技术实现文档

## 1. 模块概述

### 1.1 设计原则
- 遵循 Clean Architecture 分层设计
- 建议依据与核心业务逻辑分离
- 依据生成策略可扩展、可切换
- 依据内容清晰、可解释、可验证
- 支持多种依据类型和生成方式
- 依据生成过程可追溯、可审计

### 1.2 核心组件
- `JustificationService` - 建议依据生成服务
- `JustificationStrategy` - 依据生成策略接口
- `RuleBasedJustificationStrategy` - 基于规则的依据生成策略
- `AIBasedJustificationStrategy` - 基于 AI 的依据生成策略
- `HybridJustificationStrategy` - 混合依据生成策略
- `JustificationRepository` - 依据存储仓库

## 2. 系统架构

### 2.1 分层设计
```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │              JustificationController              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │                   JustificationService            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                       │
│  ┌─────────────────┐   ┌─────────────────────────────┐  │
│  │ Suggestion      │   │ JustificationStrategy       │  │
│  ├─────────────────┤   ├─────────────────────────────┤  │
│  │ Justification   │   │ RuleBasedJustification      │  │
│  └─────────────────┘   │ AIBasedJustification        │  │
│                        │ HybridJustification         │  │
│                        └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                  │
│  ┌─────────────────┐   ┌─────────────────────────────┐  │
│  │ Justification   │   │ JustificationCache          │  │
│  │ Repository      │   └─────────────────────────────┘  │
│  └─────────────────┘                                     │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   AI Capability Layer                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │                AIServiceAdapter                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 核心依赖关系
- `JustificationService` 依赖于 `JustificationStrategy` 和 `JustificationRepository`
- 依据生成策略实现依赖于 `Suggestion` 和 `UserCognitiveModel`
- `JustificationRepository` 负责持久化建议依据
- `JustificationCache` 用于缓存依据结果，提高性能

## 3. 核心功能

### 3.1 建议依据数据模型

#### 3.1.1 依据数据模型
```typescript
// domain/entities/Justification.ts
export interface Justification {
  id: string;
  suggestionId: string;
  userId: string;
  type: 'concept' | 'relation' | 'insight' | 'exercise';
  content: string;
  explanation: string;
  confidenceScore: number;
  sources: {
    type: 'cognitive-model' | 'user-history' | 'rule' | 'ai-generated' | 'external';
    reference: string;
    weight: number;
  }[];
  generationStrategy: 'rule-based' | 'ai-based' | 'hybrid';
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    context?: string;
    keywords?: string[];
    relevance?: number;
  };
}
```

#### 3.1.2 依据生成上下文
```typescript
// domain/entities/JustificationContext.ts
export interface JustificationContext {
  userId: string;
  suggestion: Suggestion;
  cognitiveModel?: UserCognitiveModel;
  userProfile?: UserProfile;
  interactionHistory?: Interaction[];
  additionalContext?: any;
}
```

### 3.2 依据生成策略设计

#### 3.2.1 依据生成策略接口
```typescript
// domain/strategies/JustificationStrategy.ts
export interface JustificationStrategy {
  generateJustification(
    context: JustificationContext
  ): Promise<Omit<Justification, 'id' | 'createdAt' | 'updatedAt'>>;
  getStrategyName(): string;
  getDescription(): string;
  validateJustification(justification: Justification): Promise<boolean>;
}
```

#### 3.2.2 基于规则的依据生成策略
```typescript
// domain/strategies/RuleBasedJustificationStrategy.ts
export class RuleBasedJustificationStrategy implements JustificationStrategy {
  constructor(private readonly ruleEngine: RuleEngine) {}

  async generateJustification(
    context: JustificationContext
  ): Promise<Omit<Justification, 'id' | 'createdAt' | 'updatedAt'>> {
    const { suggestion, cognitiveModel, userProfile, interactionHistory } = context;
    
    // 1. 应用规则引擎生成依据
    const ruleResults = await this.ruleEngine.evaluateRules({
      suggestion,
      cognitiveModel,
      userProfile,
      interactionHistory
    });
    
    // 2. 构建依据内容
    const content = this.buildJustificationContent(ruleResults);
    const explanation = this.buildJustificationExplanation(ruleResults);
    
    // 3. 计算置信度分数
    const confidenceScore = this.calculateConfidenceScore(ruleResults);
    
    // 4. 收集来源信息
    const sources = this.collectSources(ruleResults);
    
    return {
      suggestionId: suggestion.id,
      userId: context.userId,
      type: suggestion.type,
      content,
      explanation,
      confidenceScore,
      sources,
      generationStrategy: 'rule-based',
      metadata: {
        keywords: this.extractKeywords(ruleResults),
        relevance: this.calculateRelevance(ruleResults)
      }
    };
  }

  getStrategyName(): string {
    return 'rule-based';
  }

  getDescription(): string {
    return '基于预定义规则生成建议依据的策略';
  }

  async validateJustification(justification: Justification): Promise<boolean> {
    // 验证规则-based 依据的正确性和完整性
    return justification.sources.every(source => 
      source.type === 'rule' || source.type === 'cognitive-model' || source.type === 'user-history'
    );
  }

  private buildJustificationContent(ruleResults: RuleResult[]): string {
    // 基于规则结果构建依据内容
    return ruleResults
      .map(result => result.description)
      .join(' ')
      .trim();
  }

  private buildJustificationExplanation(ruleResults: RuleResult[]): string {
    // 基于规则结果构建详细解释
    return ruleResults
      .map(result => `${result.ruleName}: ${result.explanation}`)
      .join('\n')
      .trim();
  }

  private calculateConfidenceScore(ruleResults: RuleResult[]): number {
    // 基于规则匹配程度计算置信度分数
    const totalWeight = ruleResults.reduce((sum, result) => sum + result.weight, 0);
    const weightedScore = ruleResults.reduce((sum, result) => 
      sum + (result.score * result.weight), 0
    );
    
    return totalWeight > 0 ? weightedScore / totalWeight : 0.5;
  }

  private collectSources(ruleResults: RuleResult[]): Justification['sources'] {
    // 收集依据来源
    const sourcesMap = new Map<string, Justification['sources'][0]>();
    
    ruleResults.forEach(result => {
      result.sources.forEach(source => {
        if (!sourcesMap.has(source.reference)) {
          sourcesMap.set(source.reference, {
            type: source.type,
            reference: source.reference,
            weight: source.weight
          });
        }
      });
    });
    
    return Array.from(sourcesMap.values());
  }

  private extractKeywords(ruleResults: RuleResult[]): string[] {
    // 从规则结果中提取关键词
    const keywordsSet = new Set<string>();
    
    ruleResults.forEach(result => {
      if (result.keywords) {
        result.keywords.forEach(keyword => keywordsSet.add(keyword));
      }
    });
    
    return Array.from(keywordsSet);
  }

  private calculateRelevance(ruleResults: RuleResult[]): number {
    // 计算依据与建议的相关性
    const relevanceScores = ruleResults.map(result => result.relevance || 0);
    return relevanceScores.length > 0 
      ? relevanceScores.reduce((sum, score) => sum + score, 0) / relevanceScores.length
      : 0.5;
  }
}
```

#### 3.2.3 基于 AI 的依据生成策略
```typescript
// domain/strategies/AIBasedJustificationStrategy.ts
export class AIBasedJustificationStrategy implements JustificationStrategy {
  constructor(private readonly aiService: AIService) {}

  async generateJustification(
    context: JustificationContext
  ): Promise<Omit<Justification, 'id' | 'createdAt' | 'updatedAt'>> {
    const { suggestion, cognitiveModel, userProfile, interactionHistory } = context;
    
    // 1. 准备 AI 提示
    const prompt = this.buildAIPrompt(context);
    
    // 2. 调用 AI 服务生成依据
    const aiResponse = await this.aiService.generateJustification({
      prompt,
      context: {
        suggestion,
        cognitiveModel,
        userProfile,
        interactionHistory
      }
    });
    
    // 3. 解析 AI 响应
    const parsedResponse = this.parseAIResponse(aiResponse);
    
    // 4. 构建依据对象
    return {
      suggestionId: suggestion.id,
      userId: context.userId,
      type: suggestion.type,
      content: parsedResponse.content,
      explanation: parsedResponse.explanation,
      confidenceScore: parsedResponse.confidenceScore || 0.7,
      sources: parsedResponse.sources || [
        {
          type: 'ai-generated',
          reference: 'ai-service',
          weight: 1.0
        }
      ],
      generationStrategy: 'ai-based',
      metadata: {
        keywords: parsedResponse.keywords || [],
        relevance: parsedResponse.relevance || 0.7
      }
    };
  }

  getStrategyName(): string {
    return 'ai-based';
  }

  getDescription(): string {
    return '基于 AI 生成建议依据的策略';
  }

  async validateJustification(justification: Justification): Promise<boolean> {
    // 验证 AI-based 依据的质量和相关性
    if (justification.generationStrategy !== 'ai-based') {
      return false;
    }
    
    // 检查依据内容长度和相关性
    return justification.content.length > 50 && 
           justification.confidenceScore > 0.5 &&
           justification.sources.some(source => source.type === 'ai-generated');
  }

  private buildAIPrompt(context: JustificationContext): string {
    // 构建 AI 生成依据的提示
    const { suggestion, cognitiveModel, userProfile } = context;
    
    return `请为以下建议生成清晰、简洁的依据说明：

建议类型：${suggestion.type}
建议内容：${suggestion.content}
建议来源：${suggestion.source}

用户认知模型：
${JSON.stringify(cognitiveModel, null, 2)}

用户画像：
${JSON.stringify(userProfile, null, 2)}

要求：
1. 依据必须基于用户的认知模型和画像
2. 说明为什么这个建议对用户有帮助
3. 指出建议的具体依据来源
4. 保持语言简洁明了，易于理解
5. 包含置信度评分（0-1）
6. 列出相关关键词`;
  }

  private parseAIResponse(aiResponse: AIResponse): any {
    // 解析 AI 响应为依据结构
    try {
      return JSON.parse(aiResponse.content);
    } catch (error) {
      // 如果 AI 返回的不是 JSON，手动解析
      return {
        content: aiResponse.content.split('内容：')[1]?.split('\n')[0] || aiResponse.content,
        explanation: aiResponse.content,
        confidenceScore: 0.7,
        sources: [{ type: 'ai-generated', reference: 'ai-service', weight: 1.0 }],
        keywords: [],
        relevance: 0.7
      };
    }
  }
}
```

#### 3.2.4 混合依据生成策略
```typescript
// domain/strategies/HybridJustificationStrategy.ts
export class HybridJustificationStrategy implements JustificationStrategy {
  constructor(
    private readonly ruleBasedStrategy: RuleBasedJustificationStrategy,
    private readonly aiBasedStrategy: AIBasedJustificationStrategy,
    private readonly weights: {
      ruleBased: number;
      aiBased: number;
    } = { ruleBased: 0.6, aiBased: 0.4 }
  ) {}

  async generateJustification(
    context: JustificationContext
  ): Promise<Omit<Justification, 'id' | 'createdAt' | 'updatedAt'>> {
    // 1. 并行执行两种策略
    const [ruleBasedResult, aiBasedResult] = await Promise.all([
      this.ruleBasedStrategy.generateJustification(context),
      this.aiBasedStrategy.generateJustification(context)
    ]);
    
    // 2. 合并结果
    return this.mergeJustificationResults(
      ruleBasedResult,
      aiBasedResult
    );
  }

  getStrategyName(): string {
    return 'hybrid';
  }

  getDescription(): string {
    return '结合规则-based 和 AI-based 的混合依据生成策略';
  }

  async validateJustification(justification: Justification): Promise<boolean> {
    // 验证混合依据包含来自两种策略的来源
    if (justification.generationStrategy !== 'hybrid') {
      return false;
    }
    
    const hasRuleBasedSource = justification.sources.some(source => 
      source.type === 'rule' || source.type === 'cognitive-model' || source.type === 'user-history'
    );
    
    const hasAIBasedSource = justification.sources.some(source => 
      source.type === 'ai-generated'
    );
    
    return hasRuleBasedSource && hasAIBasedSource;
  }

  private mergeJustificationResults(
    ruleBasedResult: Omit<Justification, 'id' | 'createdAt' | 'updatedAt'>,
    aiBasedResult: Omit<Justification, 'id' | 'createdAt' | 'updatedAt'>
  ): Omit<Justification, 'id' | 'createdAt' | 'updatedAt'> {
    // 合并两种策略的结果
    
    // 1. 合并内容和解释
    const content = this.mergeContent(ruleBasedResult.content, aiBasedResult.content);
    const explanation = this.mergeExplanation(ruleBasedResult.explanation, aiBasedResult.explanation);
    
    // 2. 加权计算置信度
    const confidenceScore = 
      (ruleBasedResult.confidenceScore * this.weights.ruleBased) +
      (aiBasedResult.confidenceScore * this.weights.aiBased);
    
    // 3. 合并来源
    const sources = this.mergeSources(ruleBasedResult.sources, aiBasedResult.sources);
    
    // 4. 合并关键词
    const keywords = this.mergeKeywords(
      ruleBasedResult.metadata.keywords || [],
      aiBasedResult.metadata.keywords || []
    );
    
    // 5. 计算相关性
    const relevance = 
      ((ruleBasedResult.metadata.relevance || 0) * this.weights.ruleBased) +
      ((aiBasedResult.metadata.relevance || 0) * this.weights.aiBased);
    
    return {
      ...ruleBasedResult,
      content,
      explanation,
      confidenceScore,
      sources,
      generationStrategy: 'hybrid',
      metadata: {
        keywords,
        relevance
      }
    };
  }

  private mergeContent(ruleBasedContent: string, aiBasedContent: string): string {
    // 合并依据内容
    if (ruleBasedContent.length > aiBasedContent.length) {
      return ruleBasedContent;
    }
    return aiBasedContent;
  }

  private mergeExplanation(ruleBasedExplanation: string, aiBasedExplanation: string): string {
    // 合并详细解释
    return `${ruleBasedExplanation}\n\nAI 补充说明：\n${aiBasedExplanation}`;
  }

  private mergeSources(
    ruleBasedSources: Justification['sources'],
    aiBasedSources: Justification['sources']
  ): Justification['sources'] {
    // 合并来源并去重
    const sourceMap = new Map<string, Justification['sources'][0]>();
    
    // 添加规则-based 来源，应用权重
    ruleBasedSources.forEach(source => {
      sourceMap.set(source.reference, {
        ...source,
        weight: source.weight * this.weights.ruleBased
      });
    });
    
    // 添加 AI-based 来源，应用权重
    aiBasedSources.forEach(source => {
      if (sourceMap.has(source.reference)) {
        const existingSource = sourceMap.get(source.reference)!;
        sourceMap.set(source.reference, {
          ...existingSource,
          weight: existingSource.weight + (source.weight * this.weights.aiBased)
        });
      } else {
        sourceMap.set(source.reference, {
          ...source,
          weight: source.weight * this.weights.aiBased
        });
      }
    });
    
    return Array.from(sourceMap.values());
  }

  private mergeKeywords(
    ruleBasedKeywords: string[],
    aiBasedKeywords: string[]
  ): string[] {
    // 合并关键词并去重
    return Array.from(new Set([...ruleBasedKeywords, ...aiBasedKeywords]));
  }
}
```

### 3.3 依据服务设计

#### 3.3.1 依据服务接口
```typescript
// application/services/JustificationService.ts
export interface JustificationService {
  generateJustification(
    context: JustificationContext,
    strategy?: string
  ): Promise<Justification>;
  getJustificationById(justificationId: string): Promise<Justification | null>;
  getJustificationBySuggestionId(suggestionId: string): Promise<Justification | null>;
  updateJustification(justification: Justification): Promise<Justification>;
  deleteJustification(justificationId: string): Promise<void>;
  validateJustification(justification: Justification): Promise<boolean>;
  getJustificationStrategies(): Promise<{ name: string; description: string }[]>;
  regenerateJustification(justificationId: string, strategy?: string): Promise<Justification>;
}
```

#### 3.3.2 依据服务实现
```typescript
// application/services/JustificationServiceImpl.ts
export class JustificationServiceImpl implements JustificationService {
  constructor(
    private readonly strategyFactory: JustificationStrategyFactory,
    private readonly justificationRepo: JustificationRepository,
    private readonly justificationCache: JustificationCache,
    private readonly idGenerator: IdGenerator
  ) {}

  async generateJustification(
    context: JustificationContext,
    strategy: string = 'hybrid'
  ): Promise<Justification> {
    // 1. 检查缓存
    const cacheKey = this.generateCacheKey(context, strategy);
    const cachedJustification = await this.justificationCache.getJustification(cacheKey);
    if (cachedJustification) {
      return cachedJustification;
    }
    
    // 2. 获取依据生成策略
    const justificationStrategy = this.strategyFactory.getStrategy(strategy);
    
    // 3. 生成依据
    const justificationData = await justificationStrategy.generateJustification(context);
    
    // 4. 创建依据对象
    const justification: Justification = {
      id: this.idGenerator.generate(),
      ...justificationData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 5. 保存依据
    await this.justificationRepo.saveJustification(justification);
    
    // 6. 缓存结果
    await this.justificationCache.setJustification(cacheKey, justification);
    
    // 7. 返回结果
    return justification;
  }

  async getJustificationById(justificationId: string): Promise<Justification | null> {
    // 1. 检查缓存
    const cachedJustification = await this.justificationCache.getJustificationById(justificationId);
    if (cachedJustification) {
      return cachedJustification;
    }
    
    // 2. 从数据库获取
    const justification = await this.justificationRepo.getJustificationById(justificationId);
    
    // 3. 缓存结果
    if (justification) {
      await this.justificationCache.setJustificationById(justificationId, justification);
    }
    
    // 4. 返回结果
    return justification;
  }

  async getJustificationBySuggestionId(suggestionId: string): Promise<Justification | null> {
    // 1. 检查缓存
    const cachedJustification = await this.justificationCache.getJustificationBySuggestionId(suggestionId);
    if (cachedJustification) {
      return cachedJustification;
    }
    
    // 2. 从数据库获取
    const justification = await this.justificationRepo.getJustificationBySuggestionId(suggestionId);
    
    // 3. 缓存结果
    if (justification) {
      await this.justificationCache.setJustificationBySuggestionId(suggestionId, justification);
    }
    
    // 4. 返回结果
    return justification;
  }

  async updateJustification(justification: Justification): Promise<Justification> {
    // 1. 更新时间戳
    justification.updatedAt = new Date();
    
    // 2. 保存更新
    const updatedJustification = await this.justificationRepo.updateJustification(justification);
    
    // 3. 清除相关缓存
    await this.justificationCache.clearJustification(updatedJustification.id);
    await this.justificationCache.clearJustificationBySuggestionId(updatedJustification.suggestionId);
    
    // 4. 返回更新后的依据
    return updatedJustification;
  }

  async deleteJustification(justificationId: string): Promise<void> {
    // 1. 获取依据信息
    const justification = await this.justificationRepo.getJustificationById(justificationId);
    
    // 2. 删除依据
    await this.justificationRepo.deleteJustification(justificationId);
    
    // 3. 清除相关缓存
    await this.justificationCache.clearJustification(justificationId);
    if (justification) {
      await this.justificationCache.clearJustificationBySuggestionId(justification.suggestionId);
    }
  }

  async validateJustification(justification: Justification): Promise<boolean> {
    // 1. 获取对应的策略
    const justificationStrategy = this.strategyFactory.getStrategy(justification.generationStrategy);
    
    // 2. 验证依据
    return justificationStrategy.validateJustification(justification);
  }

  async getJustificationStrategies(): Promise<{ name: string; description: string }[]> {
    const strategies = this.strategyFactory.getAllStrategies();
    return strategies.map(strategy => ({
      name: strategy.getStrategyName(),
      description: strategy.getDescription()
    }));
  }

  async regenerateJustification(justificationId: string, strategy?: string): Promise<Justification> {
    // 1. 获取当前依据
    const currentJustification = await this.justificationRepo.getJustificationById(justificationId);
    if (!currentJustification) {
      throw new JustificationNotFoundError(justificationId);
    }
    
    // 2. 构建上下文
    const context: JustificationContext = {
      userId: currentJustification.userId,
      suggestion: {} as Suggestion, // 需要从其他服务获取完整建议信息
      // 其他上下文信息需要从相关服务获取
    };
    
    // 3. 生成新依据
    return this.generateJustification(
      context,
      strategy || currentJustification.generationStrategy
    );
  }

  private generateCacheKey(context: JustificationContext, strategy: string): string {
    // 生成唯一缓存键
    return `${strategy}-${context.userId}-${context.suggestion.id}-${JSON.stringify(context.additionalContext || {})}`;
  }
}
```

### 3.4 依据策略工厂
```typescript
// application/factories/JustificationStrategyFactory.ts
export class JustificationStrategyFactory {
  constructor(
    private readonly ruleBasedStrategy: RuleBasedJustificationStrategy,
    private readonly aiBasedStrategy: AIBasedJustificationStrategy
  ) {}

  getStrategy(strategyName: string): JustificationStrategy {
    switch (strategyName) {
      case 'rule-based':
        return this.ruleBasedStrategy;
      
      case 'ai-based':
        return this.aiBasedStrategy;
      
      case 'hybrid':
      default:
        return new HybridJustificationStrategy(
          this.ruleBasedStrategy,
          this.aiBasedStrategy
        );
    }
  }

  getAllStrategies(): JustificationStrategy[] {
    return [
      this.ruleBasedStrategy,
      this.aiBasedStrategy,
      new HybridJustificationStrategy(
        this.ruleBasedStrategy,
        this.aiBasedStrategy
      )
    ];
  }
}
```

## 4. 核心 API 设计

### 4.1 依据控制器
```typescript
// presentation/controllers/JustificationController.ts
export class JustificationController {
  constructor(private readonly justificationService: JustificationService) {}

  // POST /api/justifications
  async generateJustification(req: Request, res: Response): Promise<void> {
    try {
      const { context, strategy } = req.body;
      
      if (!context || !context.userId || !context.suggestion) {
        res.status(400).json({
          success: false,
          message: 'Invalid justification context'
        });
        return;
      }
      
      const justification = await this.justificationService.generateJustification(context, strategy);
      
      res.json({
        success: true,
        data: justification,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate justification',
        error: error.message
      });
    }
  }

  // GET /api/justifications/:id
  async getJustificationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const justification = await this.justificationService.getJustificationById(id);
      if (!justification) {
        res.status(404).json({
          success: false,
          message: 'Justification not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: justification,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get justification',
        error: error.message
      });
    }
  }

  // GET /api/justifications/suggestion/:suggestionId
  async getJustificationBySuggestionId(req: Request, res: Response): Promise<void> {
    try {
      const { suggestionId } = req.params;
      
      const justification = await this.justificationService.getJustificationBySuggestionId(suggestionId);
      if (!justification) {
        res.status(404).json({
          success: false,
          message: 'Justification not found for this suggestion'
        });
        return;
      }
      
      res.json({
        success: true,
        data: justification,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get justification by suggestion ID',
        error: error.message
      });
    }
  }

  // PUT /api/justifications/:id
  async updateJustification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const justificationData = req.body;
      
      const updatedJustification = await this.justificationService.updateJustification({
        id,
        ...justificationData
      });
      
      res.json({
        success: true,
        data: updatedJustification,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update justification',
        error: error.message
      });
    }
  }

  // DELETE /api/justifications/:id
  async deleteJustification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.justificationService.deleteJustification(id);
      
      res.json({
        success: true,
        message: 'Justification deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete justification',
        error: error.message
      });
    }
  }

  // POST /api/justifications/:id/validate
  async validateJustification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const justification = await this.justificationService.getJustificationById(id);
      
      if (!justification) {
        res.status(404).json({
          success: false,
          message: 'Justification not found'
        });
        return;
      }
      
      const isValid = await this.justificationService.validateJustification(justification);
      
      res.json({
        success: true,
        data: { isValid },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to validate justification',
        error: error.message
      });
    }
  }

  // GET /api/justifications/strategies
  async getJustificationStrategies(req: Request, res: Response): Promise<void> {
    try {
      const strategies = await this.justificationService.getJustificationStrategies();
      
      res.json({
        success: true,
        data: strategies,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get justification strategies',
        error: error.message
      });
    }
  }

  // POST /api/justifications/:id/regenerate
  async regenerateJustification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { strategy } = req.body;
      
      const regeneratedJustification = await this.justificationService.regenerateJustification(id, strategy);
      
      res.json({
        success: true,
        data: regeneratedJustification,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate justification',
        error: error.message
      });
    }
  }
}
```

## 5. 数据持久化

### 5.1 数据库表设计

```sql
-- 建议依据表
CREATE TABLE IF NOT EXISTS justifications (
  id TEXT PRIMARY KEY,
  suggestion_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('concept', 'relation', 'insight', 'exercise')),
  content TEXT NOT NULL,
  explanation TEXT NOT NULL,
  confidence_score REAL NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  sources JSONB NOT NULL,
  generation_strategy TEXT NOT NULL CHECK (generation_strategy IN ('rule-based', 'ai-based', 'hybrid')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB NOT NULL DEFAULT '{}',
  FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_justifications_suggestion_id ON justifications(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_justifications_user_id ON justifications(user_id);
CREATE INDEX IF NOT EXISTS idx_justifications_created_at ON justifications(created_at);
CREATE INDEX IF NOT EXISTS idx_justifications_generation_strategy ON justifications(generation_strategy);
```

### 5.2 依据仓库实现

```typescript
// infrastructure/repositories/JustificationRepository.ts
export interface JustificationRepository {
  saveJustification(justification: Justification): Promise<Justification>;
  getJustificationById(id: string): Promise<Justification | null>;
  getJustificationBySuggestionId(suggestionId: string): Promise<Justification | null>;
  updateJustification(justification: Justification): Promise<Justification>;
  deleteJustification(id: string): Promise<void>;
  listJustificationsByUserId(userId: string, limit?: number, offset?: number): Promise<Justification[]>;
  listJustificationsByStrategy(strategy: string, limit?: number, offset?: number): Promise<Justification[]>;
  countJustificationsByUserId(userId: string): Promise<number>;
}

// infrastructure/repositories/JustificationRepositoryImpl.ts
export class JustificationRepositoryImpl implements JustificationRepository {
  constructor(private readonly db: Database) {}

  async saveJustification(justification: Justification): Promise<Justification> {
    await this.db.run(
      `INSERT INTO justifications 
       (id, suggestion_id, user_id, type, content, explanation, confidence_score, sources, generation_strategy, created_at, updated_at, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        justification.id,
        justification.suggestionId,
        justification.userId,
        justification.type,
        justification.content,
        justification.explanation,
        justification.confidenceScore,
        JSON.stringify(justification.sources),
        justification.generationStrategy,
        justification.createdAt,
        justification.updatedAt,
        JSON.stringify(justification.metadata)
      ]
    );
    
    return justification;
  }

  async getJustificationById(id: string): Promise<Justification | null> {
    const result = await this.db.get<{
      id: string;
      suggestion_id: string;
      user_id: string;
      type: string;
      content: string;
      explanation: string;
      confidence_score: number;
      sources: string;
      generation_strategy: string;
      created_at: Date;
      updated_at: Date;
      metadata: string;
    }>(
      'SELECT * FROM justifications WHERE id = ?',
      [id]
    );
    
    if (!result) {
      return null;
    }
    
    return this.mapDbResultToJustification(result);
  }

  async getJustificationBySuggestionId(suggestionId: string): Promise<Justification | null> {
    const result = await this.db.get<{
      id: string;
      suggestion_id: string;
      user_id: string;
      type: string;
      content: string;
      explanation: string;
      confidence_score: number;
      sources: string;
      generation_strategy: string;
      created_at: Date;
      updated_at: Date;
      metadata: string;
    }>(
      'SELECT * FROM justifications WHERE suggestion_id = ? ORDER BY created_at DESC LIMIT 1',
      [suggestionId]
    );
    
    if (!result) {
      return null;
    }
    
    return this.mapDbResultToJustification(result);
  }

  async updateJustification(justification: Justification): Promise<Justification> {
    await this.db.run(
      `UPDATE justifications 
       SET content = ?, explanation = ?, confidence_score = ?, sources = ?, generation_strategy = ?, updated_at = ?, metadata = ? 
       WHERE id = ?`,
      [
        justification.content,
        justification.explanation,
        justification.confidenceScore,
        JSON.stringify(justification.sources),
        justification.generationStrategy,
        justification.updatedAt,
        JSON.stringify(justification.metadata),
        justification.id
      ]
    );
    
    return justification;
  }

  async deleteJustification(id: string): Promise<void> {
    await this.db.run(
      'DELETE FROM justifications WHERE id = ?',
      [id]
    );
  }

  async listJustificationsByUserId(userId: string, limit: number = 10, offset: number = 0): Promise<Justification[]> {
    const results = await this.db.all<{
      id: string;
      suggestion_id: string;
      user_id: string;
      type: string;
      content: string;
      explanation: string;
      confidence_score: number;
      sources: string;
      generation_strategy: string;
      created_at: Date;
      updated_at: Date;
      metadata: string;
    }>(
      'SELECT * FROM justifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    
    return results.map(result => this.mapDbResultToJustification(result));
  }

  async listJustificationsByStrategy(strategy: string, limit: number = 10, offset: number = 0): Promise<Justification[]> {
    const results = await this.db.all<{
      id: string;
      suggestion_id: string;
      user_id: string;
      type: string;
      content: string;
      explanation: string;
      confidence_score: number;
      sources: string;
      generation_strategy: string;
      created_at: Date;
      updated_at: Date;
      metadata: string;
    }>(
      'SELECT * FROM justifications WHERE generation_strategy = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [strategy, limit, offset]
    );
    
    return results.map(result => this.mapDbResultToJustification(result));
  }

  async countJustificationsByUserId(userId: string): Promise<number> {
    const result = await this.db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM justifications WHERE user_id = ?',
      [userId]
    );
    
    return result?.count || 0;
  }

  private mapDbResultToJustification(result: any): Justification {
    return {
      id: result.id,
      suggestionId: result.suggestion_id,
      userId: result.user_id,
      type: result.type as Justification['type'],
      content: result.content,
      explanation: result.explanation,
      confidenceScore: result.confidence_score,
      sources: JSON.parse(result.sources) as Justification['sources'],
      generationStrategy: result.generation_strategy as Justification['generationStrategy'],
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      metadata: JSON.parse(result.metadata) as Justification['metadata']
    };
  }
}
```

## 6. 测试策略

### 6.1 单元测试

```typescript
// test/unit/domain/strategies/HybridJustificationStrategy.test.ts
describe('HybridJustificationStrategy', () => {
  let strategy: HybridJustificationStrategy;
  let ruleBasedStrategy: jest.Mocked<RuleBasedJustificationStrategy>;
  let aiBasedStrategy: jest.Mocked<AIBasedJustificationStrategy>;

  beforeEach(() => {
    ruleBasedStrategy = {
      generateJustification: jest.fn(),
      getStrategyName: jest.fn().mockReturnValue('rule-based'),
      getDescription: jest.fn().mockReturnValue('Rule-based justification'),
      validateJustification: jest.fn().mockResolvedValue(true)
    } as any;
    
    aiBasedStrategy = {
      generateJustification: jest.fn(),
      getStrategyName: jest.fn().mockReturnValue('ai-based'),
      getDescription: jest.fn().mockReturnValue('AI-based justification'),
      validateJustification: jest.fn().mockResolvedValue(true)
    } as any;
    
    strategy = new HybridJustificationStrategy(
      ruleBasedStrategy,
      aiBasedStrategy,
      { ruleBased: 0.6, aiBased: 0.4 }
    );
  });

  it('should merge results from both strategies with correct weights', async () => {
    // Arrange
    const context: JustificationContext = {
      userId: 'test-user',
      suggestion: {
        id: 'test-suggestion',
        type: 'concept',
        content: 'Test suggestion',
        relevanceScore: 0.8,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { tags: ['test'] },
        source: 'ai-generated'
      } as Suggestion
    };
    
    ruleBasedStrategy.generateJustification.mockResolvedValue({
      suggestionId: 'test-suggestion',
      userId: 'test-user',
      type: 'concept',
      content: 'Rule-based justification content',
      explanation: 'Rule-based explanation',
      confidenceScore: 0.9,
      sources: [
        { type: 'rule', reference: 'rule-1', weight: 0.8 },
        { type: 'cognitive-model', reference: 'model-1', weight: 0.2 }
      ],
      generationStrategy: 'rule-based',
      metadata: { keywords: ['rule', 'model'], relevance: 0.9 }
    });
    
    aiBasedStrategy.generateJustification.mockResolvedValue({
      suggestionId: 'test-suggestion',
      userId: 'test-user',
      type: 'concept',
      content: 'AI-based justification content',
      explanation: 'AI-based explanation',
      confidenceScore: 0.7,
      sources: [
        { type: 'ai-generated', reference: 'ai-1', weight: 1.0 }
      ],
      generationStrategy: 'ai-based',
      metadata: { keywords: ['ai', 'generated'], relevance: 0.7 }
    });
    
    // Act
    const result = await strategy.generateJustification(context);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.generationStrategy).toBe('hybrid');
    
    // 检查置信度加权计算 (0.9 * 0.6 + 0.7 * 0.4 = 0.54 + 0.28 = 0.82)
    expect(result.confidenceScore).toBeCloseTo(0.82);
    
    // 检查来源合并
    expect(result.sources).toHaveLength(3);
    expect(result.sources[0].weight).toBeCloseTo(0.48); // 0.8 * 0.6
    expect(result.sources[1].weight).toBeCloseTo(0.12); // 0.2 * 0.6
    expect(result.sources[2].weight).toBeCloseTo(0.4); // 1.0 * 0.4
    
    // 检查关键词合并
    expect(result.metadata.keywords).toEqual(expect.arrayContaining(['rule', 'model', 'ai', 'generated']));
  });
});
```

### 6.2 集成测试

```typescript
// test/integration/services/JustificationService.test.ts
describe('JustificationService Integration', () => {
  let service: JustificationService;
  let db: Database;

  beforeAll(async () => {
    // 初始化数据库连接
    db = await initializeTestDatabase();
    
    // 创建依赖
    const ruleEngine = new RuleEngineImpl();
    const aiService = new AIServiceAdapterImpl();
    const justificationRepo = new JustificationRepositoryImpl(db);
    const justificationCache = new JustificationCacheImpl(db);
    const idGenerator = new UUIDGenerator();
    
    // 创建策略
    const ruleBasedStrategy = new RuleBasedJustificationStrategy(ruleEngine);
    const aiBasedStrategy = new AIBasedJustificationStrategy(aiService);
    
    // 创建策略工厂
    const strategyFactory = new JustificationStrategyFactoryImpl(
      ruleBasedStrategy,
      aiBasedStrategy
    );
    
    // 创建服务
    service = new JustificationServiceImpl(
      strategyFactory,
      justificationRepo,
      justificationCache,
      idGenerator
    );
  });

  afterAll(async () => {
    // 清理数据库
    await db.close();
  });

  it('should generate and retrieve justification', async () => {
    // Arrange
    const context: JustificationContext = {
      userId: 'test-user-1',
      suggestion: {
        id: 'test-suggestion-1',
        type: 'insight',
        content: 'Test insight suggestion',
        relevanceScore: 0.85,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { tags: ['test', 'insight'], insightDepth: 'high' },
        source: 'hybrid'
      } as Suggestion
    };
    
    // Act
    const generatedJustification = await service.generateJustification(context);
    const retrievedJustification = await service.getJustificationById(generatedJustification.id);
    
    // Assert
    expect(generatedJustification).toBeDefined();
    expect(retrievedJustification).toBeDefined();
    expect(retrievedJustification?.id).toBe(generatedJustification.id);
    expect(retrievedJustification?.suggestionId).toBe(context.suggestion.id);
    expect(retrievedJustification?.userId).toBe(context.userId);
    expect(retrievedJustification?.content).not.toBeEmpty();
    expect(retrievedJustification?.explanation).not.toBeEmpty();
    expect(retrievedJustification?.confidenceScore).toBeGreaterThan(0);
    expect(retrievedJustification?.sources).toBeInstanceOf(Array);
    expect(retrievedJustification?.sources.length).toBeGreaterThan(0);
  });
});
```

## 7. 性能优化

### 7.1 缓存策略
- 依据结果缓存 1 小时
- 基于用户 ID、建议 ID 和策略的组合键缓存
- 依据更新时自动清除相关缓存
- 支持批量缓存操作

### 7.2 生成优化
- 并行执行多种依据生成策略
- 优化规则引擎性能，减少规则匹配时间
- AI 生成依据时使用流式处理
- 对频繁请求的依据进行预生成

### 7.3 数据处理优化
- 使用索引加速数据库查询
- 分页查询大结果集
- 批量操作减少数据库连接
- 异步处理非关键路径操作

## 8. 错误处理和日志

### 8.1 错误处理

```typescript
// application/errors/JustificationErrors.ts
export class JustificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JustificationError';
  }
}

export class JustificationNotFoundError extends JustificationError {
  constructor(id: string) {
    super(`Justification not found: ${id}`);
    this.name = 'JustificationNotFoundError';
  }
}

export class InvalidJustificationContextError extends JustificationError {
  constructor(message: string) {
    super(`Invalid justification context: ${message}`);
    this.name = 'InvalidJustificationContextError';
  }
}

export class JustificationGenerationError extends JustificationError {
  constructor(strategy: string, cause: Error) {
    super(`Failed to generate justification using ${strategy} strategy: ${cause.message}`);
    this.name = 'JustificationGenerationError';
    this.cause = cause;
  }
}

export class JustificationValidationError extends JustificationError {
  constructor(message: string) {
    super(`Justification validation failed: ${message}`);
    this.name = 'JustificationValidationError';
  }
}
```

### 8.2 日志记录

```typescript
// application/middleware/JustificationLoggingMiddleware.ts
export class JustificationLoggingMiddleware {
  constructor(private readonly logger: Logger) {}

  logJustificationRequest(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { strategy } = req.body;
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.info('Justification request processed', {
        strategy,
        status: res.statusCode,
        duration: `${duration}ms`,
        method: req.method,
        url: req.originalUrl
      });
    });
    
    next();
  }

  logJustificationError(err: Error, req: Request, res: Response, next: NextFunction) {
    const { strategy } = req.body;
    
    this.logger.error('Justification error', {
      strategy,
      error: err.name,
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl
    });
    
    next(err);
  }
}
```

## 9. 部署和监控

### 9.1 部署配置

```yaml
# docker-compose.yml
version: '3.8'
services:
  justification-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=sqlite:///app/data/justification.db
      - CACHE_TTL=3600000 # 1小时
      - LOG_LEVEL=info
      - AI_SERVICE_URL=http://ai-service:5000
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    depends_on:
      - database
      - ai-service

  database:
    image: sqlite:latest
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  ai-service:
    image: ai-service:latest
    ports:
      - "5000:5000"
    restart: unless-stopped
```

### 9.2 监控指标

```typescript
// application/metrics/JustificationMetrics.ts
export class JustificationMetrics {
  constructor(private readonly metricsClient: MetricsClient) {}

  recordJustificationGeneration(
    strategy: string,
    duration: number,
    userId: string,
    success: boolean
  ) {
    this.metricsClient.histogram('justification.generation.duration', duration, {
      strategy,
      userId,
      success: success.toString()
    });
    
    this.metricsClient.counter('justification.generation.count', 1, {
      strategy,
      success: success.toString()
    });
  }

  recordJustificationCacheHit(strategy: string) {
    this.metricsClient.counter('justification.cache.hit', 1, {
      strategy
    });
  }

  recordJustificationCacheMiss(strategy: string) {
    this.metricsClient.counter('justification.cache.miss', 1, {
      strategy
    });
  }

  recordJustificationValidation(
    strategy: string,
    isValid: boolean
  ) {
    this.metricsClient.counter('justification.validation.count', 1, {
      strategy,
      isValid: isValid.toString()
    });
  }

  recordJustificationConfidence(
    strategy: string,
    confidenceScore: number
  ) {
    this.metricsClient.histogram('justification.confidence.score', confidenceScore, {
      strategy
    });
  }
}
```

## 10. 结论

### 10.1 设计亮点
- 遵循 Clean Architecture 原则，实现了清晰的分层设计
- 采用策略模式，支持多种依据生成策略的灵活切换
- 实现了混合依据生成策略，结合规则-based 和 AI-based 的优势
- 依据内容清晰、可解释、可验证
- 支持依据的生成、更新、删除、验证和重新生成
- 集成了缓存机制，提高了系统性能
- 提供了详细的测试策略，确保系统质量
- 实现了完善的错误处理和日志记录
- 支持依据的版本控制和审计

### 10.2 未来扩展方向
- 支持更多依据生成策略，如基于案例的推理
- 实现依据的自动优化和迭代
- 支持多语言依据生成
- 增加依据的可视化展示
- 实现依据的社交共享功能
- 支持依据的个性化调整

### 10.3 关键成功因素
- 依据内容的清晰度和可理解性
- 依据生成的准确性和相关性
- 系统的性能和可扩展性
- 良好的用户体验
- 持续的优化和改进

通过本技术实现文档，我们构建了一个完整的建议依据生成系统，能够为用户提供清晰、可解释的建议依据，帮助用户理解为什么会收到这些建议，提高用户对系统的信任度和满意度。该系统具有良好的扩展性和可维护性，能够支持未来的功能扩展和性能优化。