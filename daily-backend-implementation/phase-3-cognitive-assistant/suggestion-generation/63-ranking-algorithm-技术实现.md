# 63-排序算法技术实现文档

## 1. 模块概述

### 1.1 设计原则
- 遵循 Clean Architecture 分层设计
- 排序算法与核心业务逻辑分离
- 支持多种排序策略的灵活切换
- 排序权重可配置，支持动态调整
- 排序结果可解释、可追溯
- 高性能设计，支持大规模数据排序

### 1.2 核心组件
- `RankingService` - 排序服务核心组件
- `RankingStrategy` - 排序策略接口
- `RelevanceRankingStrategy` - 相关性排序策略
- `RecencyRankingStrategy` - 时效性排序策略
- `PersonalizedRankingStrategy` - 个性化排序策略
- `HybridRankingStrategy` - 混合排序策略
- `RankingWeightConfig` - 排序权重配置管理

## 2. 系统架构

### 2.1 分层设计
```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │                 RankingController                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │                   RankingService                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                       │
│  ┌─────────────────┐   ┌─────────────────────────────┐  │
│  │ Suggestion      │   │ RankingStrategy             │  │
│  ├─────────────────┤   ├─────────────────────────────┤  │
│  │ RankingResult   │   │ RelevanceRanking            │  │
│  └─────────────────┘   │ RecencyRanking              │  │
│                        │ PersonalizedRanking         │  │
│                        │ HybridRanking               │  │
│                        └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                  │
│  ┌─────────────────┐   ┌─────────────────────────────┐  │
│  │ RankingCache    │   │ RankingWeightRepository     │  │
│  └─────────────────┘   └─────────────────────────────┘  │
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
- `RankingService` 依赖于 `RankingStrategy` 和 `RankingWeightRepository`
- 排序策略实现依赖于 `Suggestion` 和 `UserProfile`
- `RankingWeightRepository` 负责持久化排序权重配置
- `RankingCache` 用于缓存排序结果，提高性能

## 3. 核心功能

### 3.1 排序数据模型

#### 3.1.1 建议数据模型
```typescript
// domain/entities/Suggestion.ts
export interface Suggestion {
  id: string;
  type: 'concept' | 'relation' | 'insight' | 'exercise';
  content: string;
  relevanceScore: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    conceptId?: string;
    relationType?: string;
    insightDepth?: 'low' | 'medium' | 'high';
    difficulty?: 'easy' | 'medium' | 'hard';
    tags: string[];
  };
  source: 'rule-based' | 'ai-generated' | 'hybrid';
}
```

#### 3.1.2 排序结果数据模型
```typescript
// domain/entities/RankingResult.ts
export interface RankingResult {
  suggestionId: string;
  finalScore: number;
  componentScores: {
    relevance: number;
    recency: number;
    personalization: number;
    quality: number;
  };
  rankingFactors: {
    factor: string;
    weight: number;
    score: number;
  }[];
  rank: number;
}
```

### 3.2 排序策略设计

#### 3.2.1 排序策略接口
```typescript
// domain/strategies/RankingStrategy.ts
export interface RankingStrategy {
  rankSuggestions(
    suggestions: Suggestion[],
    userId?: string,
    context?: any
  ): Promise<RankingResult[]>;
  getStrategyName(): string;
  getDescription(): string;
}
```

#### 3.2.2 相关性排序策略
```typescript
// domain/strategies/RelevanceRankingStrategy.ts
export class RelevanceRankingStrategy implements RankingStrategy {
  private readonly relevanceWeight: number = 1.0;

  constructor(weight?: number) {
    if (weight) this.relevanceWeight = weight;
  }

  async rankSuggestions(
    suggestions: Suggestion[],
    userId?: string,
    context?: any
  ): Promise<RankingResult[]> {
    // 基于建议的相关性分数进行排序
    return suggestions
      .map(suggestion => ({
        suggestionId: suggestion.id,
        finalScore: suggestion.relevanceScore * this.relevanceWeight,
        componentScores: {
          relevance: suggestion.relevanceScore,
          recency: 0,
          personalization: 0,
          quality: 0
        },
        rankingFactors: [
          {
            factor: 'relevance',
            weight: this.relevanceWeight,
            score: suggestion.relevanceScore
          }
        ],
        rank: 0 // 临时值，后续统一计算
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));
  }

  getStrategyName(): string {
    return 'relevance';
  }

  getDescription(): string {
    return '基于相关性分数的排序策略';
  }
}
```

#### 3.2.3 时效性排序策略
```typescript
// domain/strategies/RecencyRankingStrategy.ts
export class RecencyRankingStrategy implements RankingStrategy {
  private readonly recencyWeight: number = 1.0;

  constructor(weight?: number) {
    if (weight) this.recencyWeight = weight;
  }

  async rankSuggestions(
    suggestions: Suggestion[],
    userId?: string,
    context?: any
  ): Promise<RankingResult[]> {
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    return suggestions
      .map(suggestion => {
        // 计算时效性分数 (0-1)，越新分数越高
        const ageMs = now.getTime() - suggestion.createdAt.getTime();
        const ageDays = ageMs / oneDayMs;
        // 使用指数衰减函数计算时效性分数
        const recencyScore = Math.exp(-ageDays / 7); // 7天半衰期
        
        return {
          suggestionId: suggestion.id,
          finalScore: recencyScore * this.recencyWeight,
          componentScores: {
            relevance: 0,
            recency: recencyScore,
            personalization: 0,
            quality: 0
          },
          rankingFactors: [
            {
              factor: 'recency',
              weight: this.recencyWeight,
              score: recencyScore
            }
          ],
          rank: 0
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));
  }

  getStrategyName(): string {
    return 'recency';
  }

  getDescription(): string {
    return '基于时效性的排序策略';
  }
}
```

#### 3.2.4 个性化排序策略
```typescript
// domain/strategies/PersonalizedRankingStrategy.ts
export class PersonalizedRankingStrategy implements RankingStrategy {
  private readonly personalizationWeight: number = 1.0;

  constructor(
    private readonly userProfileRepo: UserProfileRepository,
    weight?: number
  ) {
    if (weight) this.personalizationWeight = weight;
  }

  async rankSuggestions(
    suggestions: Suggestion[],
    userId?: string,
    context?: any
  ): Promise<RankingResult[]> {
    if (!userId) {
      // 没有用户ID时，返回默认排序
      return suggestions
        .map((suggestion, index) => ({
          suggestionId: suggestion.id,
          finalScore: 1.0 / (index + 1),
          componentScores: {
            relevance: 0,
            recency: 0,
            personalization: 0,
            quality: 0
          },
          rankingFactors: [],
          rank: index + 1
        }));
    }
    
    // 获取用户画像
    const userProfile = await this.userProfileRepo.getUserProfile(userId);
    
    return suggestions
      .map(suggestion => {
        // 基于用户偏好计算个性化分数
        const personalizationScore = this.calculatePersonalizationScore(
          suggestion,
          userProfile
        );
        
        return {
          suggestionId: suggestion.id,
          finalScore: personalizationScore * this.personalizationWeight,
          componentScores: {
            relevance: 0,
            recency: 0,
            personalization: personalizationScore,
            quality: 0
          },
          rankingFactors: [
            {
              factor: 'personalization',
              weight: this.personalizationWeight,
              score: personalizationScore
            }
          ],
          rank: 0
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));
  }

  getStrategyName(): string {
    return 'personalization';
  }

  getDescription(): string {
    return '基于用户个性化偏好的排序策略';
  }

  private calculatePersonalizationScore(
    suggestion: Suggestion,
    userProfile: UserProfile
  ): number {
    // 基于用户偏好和建议属性计算匹配分数
    // 实现个性化匹配逻辑，例如标签匹配、难度匹配、深度匹配等
    let score = 0.0;
    
    // 标签匹配
    const matchingTags = suggestion.metadata.tags.filter(tag => 
      userProfile.cognitiveStrengths.includes(tag) || 
      userProfile.cognitiveWeaknesses.includes(tag)
    );
    score += (matchingTags.length / suggestion.metadata.tags.length) * 0.4;
    
    // 难度匹配（示例）
    // 根据用户历史交互调整难度偏好
    score += 0.3;
    
    // 深度匹配
    if (suggestion.metadata.insightDepth) {
      const depthMap = { low: 0.3, medium: 0.6, high: 1.0 };
      score += depthMap[suggestion.metadata.insightDepth] * 0.3;
    }
    
    return Math.min(1.0, score);
  }
}
```

#### 3.2.5 混合排序策略
```typescript
// domain/strategies/HybridRankingStrategy.ts
export class HybridRankingStrategy implements RankingStrategy {
  constructor(
    private readonly relevanceStrategy: RelevanceRankingStrategy,
    private readonly recencyStrategy: RecencyRankingStrategy,
    private readonly personalizationStrategy: PersonalizedRankingStrategy,
    private readonly weights: {
      relevance: number;
      recency: number;
      personalization: number;
    } = { relevance: 0.4, recency: 0.2, personalization: 0.4 }
  ) {}

  async rankSuggestions(
    suggestions: Suggestion[],
    userId?: string,
    context?: any
  ): Promise<RankingResult[]> {
    // 并行执行各排序策略
    const [
      relevanceResults,
      recencyResults,
      personalizationResults
    ] = await Promise.all([
      this.relevanceStrategy.rankSuggestions(suggestions, userId, context),
      this.recencyStrategy.rankSuggestions(suggestions, userId, context),
      this.personalizationStrategy.rankSuggestions(suggestions, userId, context)
    ]);
    
    // 构建结果映射
    const relevanceMap = new Map(relevanceResults.map(r => [r.suggestionId, r]));
    const recencyMap = new Map(recencyResults.map(r => [r.suggestionId, r]));
    const personalizationMap = new Map(personalizationResults.map(r => [r.suggestionId, r]));
    
    // 合并结果并计算最终分数
    const mergedResults = suggestions.map(suggestion => {
      const relevanceResult = relevanceMap.get(suggestion.id)!;
      const recencyResult = recencyMap.get(suggestion.id)!;
      const personalizationResult = personalizationMap.get(suggestion.id)!;
      
      const finalScore = 
        (relevanceResult.componentScores.relevance * this.weights.relevance) +
        (recencyResult.componentScores.recency * this.weights.recency) +
        (personalizationResult.componentScores.personalization * this.weights.personalization);
      
      return {
        suggestionId: suggestion.id,
        finalScore,
        componentScores: {
          relevance: relevanceResult.componentScores.relevance,
          recency: recencyResult.componentScores.recency,
          personalization: personalizationResult.componentScores.personalization,
          quality: 0 // 后续可添加质量评分
        },
        rankingFactors: [
          {
            factor: 'relevance',
            weight: this.weights.relevance,
            score: relevanceResult.componentScores.relevance
          },
          {
            factor: 'recency',
            weight: this.weights.recency,
            score: recencyResult.componentScores.recency
          },
          {
            factor: 'personalization',
            weight: this.weights.personalization,
            score: personalizationResult.componentScores.personalization
          }
        ],
        rank: 0
      };
    });
    
    // 排序并分配排名
    return mergedResults
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));
  }

  getStrategyName(): string {
    return 'hybrid';
  }

  getDescription(): string {
    return '结合相关性、时效性和个性化的混合排序策略';
  }
}
```

### 3.3 排序服务设计

#### 3.3.1 排序服务接口
```typescript
// application/services/RankingService.ts
export interface RankingService {
  rankSuggestions(
    suggestions: Suggestion[],
    userId?: string,
    strategy?: string,
    context?: any
  ): Promise<RankingResult[]>;
  getRankingStrategies(): Promise<{ name: string; description: string }[]>;
  updateRankingWeights(
    strategy: string,
    weights: Record<string, number>
  ): Promise<void>;
  getRankingExplanation(
    rankingResult: RankingResult
  ): Promise<string>;
}
```

#### 3.3.2 排序服务实现
```typescript
// application/services/RankingServiceImpl.ts
export class RankingServiceImpl implements RankingService {
  constructor(
    private readonly strategyFactory: RankingStrategyFactory,
    private readonly rankingCache: RankingCache,
    private readonly rankingWeightRepo: RankingWeightRepository
  ) {}

  async rankSuggestions(
    suggestions: Suggestion[],
    userId?: string,
    strategy: string = 'hybrid',
    context?: any
  ): Promise<RankingResult[]> {
    // 检查缓存
    const cacheKey = this.generateCacheKey(suggestions, userId, strategy, context);
    const cachedResults = await this.rankingCache.getRankingResults(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }
    
    // 获取排序策略
    const rankingStrategy = this.strategyFactory.getStrategy(strategy);
    
    // 执行排序
    const rankingResults = await rankingStrategy.rankSuggestions(
      suggestions,
      userId,
      context
    );
    
    // 缓存结果
    await this.rankingCache.setRankingResults(cacheKey, rankingResults);
    
    // 返回结果
    return rankingResults;
  }

  async getRankingStrategies(): Promise<{ name: string; description: string }[]> {
    const strategies = this.strategyFactory.getAllStrategies();
    return strategies.map(strategy => ({
      name: strategy.getStrategyName(),
      description: strategy.getDescription()
    }));
  }

  async updateRankingWeights(
    strategy: string,
    weights: Record<string, number>
  ): Promise<void> {
    await this.rankingWeightRepo.updateWeights(strategy, weights);
    // 清除相关缓存
    await this.rankingCache.clearCacheByStrategy(strategy);
  }

  async getRankingExplanation(rankingResult: RankingResult): Promise<string> {
    // 生成排序解释
    const factors = rankingResult.rankingFactors
      .map(factor => `${factor.factor}: ${(factor.score * 100).toFixed(1)}% (权重: ${(factor.weight * 100).toFixed(1)}%)`)
      .join(', ');
    
    return `建议ID: ${rankingResult.suggestionId} 最终得分: ${(rankingResult.finalScore * 100).toFixed(1)}%，排名: ${rankingResult.rank}。排序因素: ${factors}。`;
  }

  private generateCacheKey(
    suggestions: Suggestion[],
    userId?: string,
    strategy?: string,
    context?: any
  ): string {
    // 生成唯一缓存键
    const suggestionIds = suggestions.map(s => s.id).sort().join(',');
    const contextStr = context ? JSON.stringify(context) : '';
    return `${strategy || 'hybrid'}-${userId || 'anonymous'}-${suggestionIds}-${contextStr}`;
  }
}
```

### 3.4 排序策略工厂
```typescript
// application/factories/RankingStrategyFactory.ts
export class RankingStrategyFactory {
  constructor(
    private readonly userProfileRepo: UserProfileRepository,
    private readonly rankingWeightRepo: RankingWeightRepository
  ) {}

  async getStrategy(strategyName: string): Promise<RankingStrategy> {
    // 获取当前权重配置
    const weights = await this.rankingWeightRepo.getWeights(strategyName) || {};
    
    switch (strategyName) {
      case 'relevance':
        return new RelevanceRankingStrategy(weights.relevance || 1.0);
      
      case 'recency':
        return new RecencyRankingStrategy(weights.recency || 1.0);
      
      case 'personalization':
        return new PersonalizedRankingStrategy(
          this.userProfileRepo,
          weights.personalization || 1.0
        );
      
      case 'hybrid':
      default:
        return new HybridRankingStrategy(
          new RelevanceRankingStrategy(weights.relevance || 0.4),
          new RecencyRankingStrategy(weights.recency || 0.2),
          new PersonalizedRankingStrategy(this.userProfileRepo, weights.personalization || 0.4),
          {
            relevance: weights.relevance || 0.4,
            recency: weights.recency || 0.2,
            personalization: weights.personalization || 0.4
          }
        );
    }
  }

  getAllStrategies(): RankingStrategy[] {
    // 返回所有可用策略实例
    return [
      new RelevanceRankingStrategy(),
      new RecencyRankingStrategy(),
      new PersonalizedRankingStrategy(this.userProfileRepo),
      new HybridRankingStrategy(
        new RelevanceRankingStrategy(),
        new RecencyRankingStrategy(),
        new PersonalizedRankingStrategy(this.userProfileRepo)
      )
    ];
  }
}
```

## 4. 核心 API 设计

### 4.1 排序控制器
```typescript
// presentation/controllers/RankingController.ts
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  // POST /api/ranking
  async rankSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { suggestions, userId, strategy, context } = req.body;
      
      if (!suggestions || !Array.isArray(suggestions)) {
        res.status(400).json({
          success: false,
          message: 'Invalid suggestions format'
        });
        return;
      }
      
      const rankingResults = await this.rankingService.rankSuggestions(
        suggestions,
        userId,
        strategy,
        context
      );
      
      res.json({
        success: true,
        data: rankingResults,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to rank suggestions',
        error: error.message
      });
    }
  }

  // GET /api/ranking/strategies
  async getRankingStrategies(req: Request, res: Response): Promise<void> {
    try {
      const strategies = await this.rankingService.getRankingStrategies();
      
      res.json({
        success: true,
        data: strategies,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get ranking strategies',
        error: error.message
      });
    }
  }

  // PUT /api/ranking/weights/:strategy
  async updateRankingWeights(req: Request, res: Response): Promise<void> {
    try {
      const { strategy } = req.params;
      const weights = req.body;
      
      await this.rankingService.updateRankingWeights(strategy, weights);
      
      res.json({
        success: true,
        message: 'Ranking weights updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update ranking weights',
        error: error.message
      });
    }
  }

  // POST /api/ranking/explanation
  async getRankingExplanation(req: Request, res: Response): Promise<void> {
    try {
      const { rankingResult } = req.body;
      
      if (!rankingResult) {
        res.status(400).json({
          success: false,
          message: 'Invalid ranking result format'
        });
        return;
      }
      
      const explanation = await this.rankingService.getRankingExplanation(rankingResult);
      
      res.json({
        success: true,
        data: { explanation },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get ranking explanation',
        error: error.message
      });
    }
  }
}
```

## 5. 数据持久化

### 5.1 数据库表设计

```sql
-- 排序权重配置表
CREATE TABLE IF NOT EXISTS ranking_weights (
  strategy TEXT PRIMARY KEY,
  weights JSONB NOT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 排序缓存表
CREATE TABLE IF NOT EXISTS ranking_cache (
  cache_key TEXT PRIMARY KEY,
  ranking_results JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ranking_weights_last_updated ON ranking_weights(last_updated);
CREATE INDEX IF NOT EXISTS idx_ranking_cache_expires_at ON ranking_cache(expires_at);
```

### 5.2 排序权重仓库实现

```typescript
// infrastructure/repositories/RankingWeightRepository.ts
export interface RankingWeightRepository {
  getWeights(strategy: string): Promise<Record<string, number> | null>;
  updateWeights(strategy: string, weights: Record<string, number>): Promise<void>;
  getAllWeights(): Promise<Record<string, Record<string, number>>>;
}

// infrastructure/repositories/RankingWeightRepositoryImpl.ts
export class RankingWeightRepositoryImpl implements RankingWeightRepository {
  constructor(private readonly db: Database) {}

  async getWeights(strategy: string): Promise<Record<string, number> | null> {
    const result = await this.db.get<{
      weights: string;
    }>(
      'SELECT weights FROM ranking_weights WHERE strategy = ?',
      [strategy]
    );
    
    if (!result) {
      return null;
    }
    
    return JSON.parse(result.weights);
  }

  async updateWeights(strategy: string, weights: Record<string, number>): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO ranking_weights 
       (strategy, weights, last_updated) 
       VALUES (?, ?, ?)`,
      [strategy, JSON.stringify(weights), new Date()]
    );
  }

  async getAllWeights(): Promise<Record<string, Record<string, number>>> {
    const results = await this.db.all<{
      strategy: string;
      weights: string;
    }>('SELECT strategy, weights FROM ranking_weights');
    
    const weightsMap: Record<string, Record<string, number>> = {};
    results.forEach(result => {
      weightsMap[result.strategy] = JSON.parse(result.weights);
    });
    
    return weightsMap;
  }
}
```

## 6. 测试策略

### 6.1 单元测试

```typescript
// test/unit/domain/strategies/HybridRankingStrategy.test.ts
describe('HybridRankingStrategy', () => {
  let strategy: HybridRankingStrategy;
  let relevanceStrategy: jest.Mocked<RelevanceRankingStrategy>;
  let recencyStrategy: jest.Mocked<RecencyRankingStrategy>;
  let personalizationStrategy: jest.Mocked<PersonalizedRankingStrategy>;

  beforeEach(() => {
    relevanceStrategy = {
      rankSuggestions: jest.fn(),
      getStrategyName: jest.fn().mockReturnValue('relevance'),
      getDescription: jest.fn().mockReturnValue('Relevance ranking')
    } as any;
    
    recencyStrategy = {
      rankSuggestions: jest.fn(),
      getStrategyName: jest.fn().mockReturnValue('recency'),
      getDescription: jest.fn().mockReturnValue('Recency ranking')
    } as any;
    
    personalizationStrategy = {
      rankSuggestions: jest.fn(),
      getStrategyName: jest.fn().mockReturnValue('personalization'),
      getDescription: jest.fn().mockReturnValue('Personalization ranking')
    } as any;
    
    strategy = new HybridRankingStrategy(
      relevanceStrategy,
      recencyStrategy,
      personalizationStrategy,
      { relevance: 0.4, recency: 0.2, personalization: 0.4 }
    );
  });

  it('should combine scores from multiple strategies with correct weights', async () => {
    // Arrange
    const suggestions: Suggestion[] = [
      { id: 's1', type: 'concept', content: 'Test 1', relevanceScore: 0.9, createdAt: new Date(), updatedAt: new Date(), metadata: { tags: ['test'] }, source: 'ai-generated' },
      { id: 's2', type: 'insight', content: 'Test 2', relevanceScore: 0.7, createdAt: new Date(), updatedAt: new Date(), metadata: { tags: ['test'], insightDepth: 'high' }, source: 'hybrid' }
    ];
    
    relevanceStrategy.rankSuggestions.mockResolvedValue([
      { suggestionId: 's1', finalScore: 0.9, componentScores: { relevance: 0.9, recency: 0, personalization: 0, quality: 0 }, rankingFactors: [], rank: 1 },
      { suggestionId: 's2', finalScore: 0.7, componentScores: { relevance: 0.7, recency: 0, personalization: 0, quality: 0 }, rankingFactors: [], rank: 2 }
    ]);
    
    recencyStrategy.rankSuggestions.mockResolvedValue([
      { suggestionId: 's1', finalScore: 0.8, componentScores: { relevance: 0, recency: 0.8, personalization: 0, quality: 0 }, rankingFactors: [], rank: 1 },
      { suggestionId: 's2', finalScore: 1.0, componentScores: { relevance: 0, recency: 1.0, personalization: 0, quality: 0 }, rankingFactors: [], rank: 2 }
    ]);
    
    personalizationStrategy.rankSuggestions.mockResolvedValue([
      { suggestionId: 's1', finalScore: 0.6, componentScores: { relevance: 0, recency: 0, personalization: 0.6, quality: 0 }, rankingFactors: [], rank: 2 },
      { suggestionId: 's2', finalScore: 0.9, componentScores: { relevance: 0, recency: 0, personalization: 0.9, quality: 0 }, rankingFactors: [], rank: 1 }
    ]);
    
    // Act
    const result = await strategy.rankSuggestions(suggestions, 'test-user');
    
    // Assert
    expect(result).toHaveLength(2);
    
    // 计算预期分数
    // s1: (0.9 * 0.4) + (0.8 * 0.2) + (0.6 * 0.4) = 0.36 + 0.16 + 0.24 = 0.76
    // s2: (0.7 * 0.4) + (1.0 * 0.2) + (0.9 * 0.4) = 0.28 + 0.2 + 0.36 = 0.84
    expect(result[0].suggestionId).toBe('s2');
    expect(result[0].finalScore).toBeCloseTo(0.84);
    expect(result[0].rank).toBe(1);
    
    expect(result[1].suggestionId).toBe('s1');
    expect(result[1].finalScore).toBeCloseTo(0.76);
    expect(result[1].rank).toBe(2);
  });
});
```

### 6.2 集成测试

```typescript
// test/integration/services/RankingService.test.ts
describe('RankingService Integration', () => {
  let service: RankingService;
  let db: Database;

  beforeAll(async () => {
    // 初始化数据库连接
    db = await initializeTestDatabase();
    
    // 创建依赖
    const userProfileRepo = new UserProfileRepositoryImpl(db);
    const rankingWeightRepo = new RankingWeightRepositoryImpl(db);
    const rankingCache = new RankingCacheImpl(db);
    
    // 创建策略工厂
    const strategyFactory = new RankingStrategyFactoryImpl(
      userProfileRepo,
      rankingWeightRepo
    );
    
    // 创建服务
    service = new RankingServiceImpl(
      strategyFactory,
      rankingCache,
      rankingWeightRepo
    );
  });

  afterAll(async () => {
    // 清理数据库
    await db.close();
  });

  it('should rank suggestions using hybrid strategy', async () => {
    // Arrange
    const suggestions: Suggestion[] = [
      { id: 's1', type: 'concept', content: 'Test 1', relevanceScore: 0.9, createdAt: new Date(), updatedAt: new Date(), metadata: { tags: ['test'] }, source: 'ai-generated' },
      { id: 's2', type: 'insight', content: 'Test 2', relevanceScore: 0.7, createdAt: new Date(), updatedAt: new Date(), metadata: { tags: ['test'], insightDepth: 'high' }, source: 'hybrid' },
      { id: 's3', type: 'exercise', content: 'Test 3', relevanceScore: 0.8, createdAt: new Date(), updatedAt: new Date(), metadata: { tags: ['test'], difficulty: 'medium' }, source: 'rule-based' }
    ];
    
    // Act
    const result = await service.rankSuggestions(suggestions, 'test-user');
    
    // Assert
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(3);
    
    // 检查排名是否正确
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
    expect(result[2].rank).toBe(3);
    
    // 检查每个结果的结构
    result.forEach(item => {
      expect(item).toHaveProperty('suggestionId');
      expect(item).toHaveProperty('finalScore');
      expect(item).toHaveProperty('componentScores');
      expect(item).toHaveProperty('rankingFactors');
      expect(item).toHaveProperty('rank');
    });
  });
});
```

## 6. 性能优化

### 6.1 缓存策略
- 排序结果缓存 30 分钟
- 基于缓存键自动失效
- 策略权重更新时清除相关缓存

### 6.2 算法优化
- 使用高效的排序算法（JavaScript Array.sort 为 O(n log n)）
- 并行执行多个排序策略
- 避免不必要的计算和重复操作

### 6.3 数据处理优化
- 只排序必要的字段
- 使用索引优化数据库查询
- 批量处理数据减少 I/O 操作

## 7. 错误处理和日志

### 7.1 错误处理

```typescript
// application/errors/RankingErrors.ts
export class RankingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RankingError';
  }
}

export class InvalidRankingStrategyError extends RankingError {
  constructor(strategy: string) {
    super(`Invalid ranking strategy: ${strategy}`);
    this.name = 'InvalidRankingStrategyError';
  }
}

export class RankingWeightsNotFoundError extends RankingError {
  constructor(strategy: string) {
    super(`Ranking weights not found for strategy: ${strategy}`);
    this.name = 'RankingWeightsNotFoundError';
  }
}

export class RankingGenerationError extends RankingError {
  constructor(cause: Error) {
    super(`Failed to generate ranking: ${cause.message}`);
    this.name = 'RankingGenerationError';
    this.cause = cause;
  }
}
```

### 7.2 日志记录

```typescript
// application/middleware/RankingLoggingMiddleware.ts
export class RankingLoggingMiddleware {
  constructor(private readonly logger: Logger) {}

  logRankingRequest(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { strategy } = req.body;
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.info('Ranking request processed', {
        strategy,
        status: res.statusCode,
        duration: `${duration}ms`,
        method: req.method,
        url: req.originalUrl
      });
    });
    
    next();
  }

  logRankingError(err: Error, req: Request, res: Response, next: NextFunction) {
    const { strategy } = req.body;
    
    this.logger.error('Ranking error', {
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

## 8. 部署和监控

### 8.1 部署配置

```yaml
# docker-compose.yml
version: '3.8'
services:
  ranking-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=sqlite:///app/data/ranking.db
      - CACHE_TTL=1800000 # 30分钟
      - LOG_LEVEL=info
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    depends_on:
      - database

  database:
    image: sqlite:latest
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### 8.2 监控指标

```typescript
// application/metrics/RankingMetrics.ts
export class RankingMetrics {
  constructor(private readonly metricsClient: MetricsClient) {}

  recordRankingGeneration(
    strategy: string,
    duration: number,
    suggestionCount: number,
    userId?: string
  ) {
    this.metricsClient.histogram('ranking.generation.duration', duration, {
      strategy,
      userId: userId || 'anonymous'
    });
    
    this.metricsClient.counter('ranking.generation.count', 1, {
      strategy
    });
    
    this.metricsClient.gauge('ranking.suggestions.per.request', suggestionCount, {
      strategy
    });
  }

  recordRankingCacheHit(strategy: string) {
    this.metricsClient.counter('ranking.cache.hit', 1, {
      strategy
    });
  }

  recordRankingCacheMiss(strategy: string) {
    this.metricsClient.counter('ranking.cache.miss', 1, {
      strategy
    });
  }

  recordWeightUpdate(strategy: string) {
    this.metricsClient.counter('ranking.weight.update', 1, {
      strategy
    });
  }
}
```

## 9. 结论

### 9.1 设计亮点
- 遵循 Clean Architecture 原则，实现了清晰的分层设计
- 采用策略模式，支持多种排序算法的灵活切换
- 实现了混合排序策略，结合多种排序因素
- 排序权重可配置，支持动态调整
- 提供了排序结果解释功能，增强透明度
- 集成了缓存机制，提高了系统性能
- 提供了详细的测试策略，确保系统质量
- 实现了完善的错误处理和日志记录

### 9.2 未来扩展方向
- 支持更多排序因素，如社交影响力、流行度等
- 实现实时排序更新机制
- 支持 A/B 测试不同排序策略
- 增加排序结果的多样性控制
- 实现自适应排序，根据用户反馈自动调整权重

### 9.3 关键成功因素
- 准确的相关性评分
- 合理的排序权重配置
- 高效的排序算法实现
- 良好的缓存策略
- 持续的性能监控和优化

通过本技术实现文档，我们构建了一个完整的排序系统，能够根据不同策略对建议进行高效、准确的排序。该系统具有良好的扩展性和可维护性，能够支持未来的功能扩展和性能优化。