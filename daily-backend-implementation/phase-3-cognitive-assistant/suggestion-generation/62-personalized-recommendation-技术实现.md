# 62-个性化推荐技术实现文档

## 1. 模块概述

### 1.1 设计原则
- 遵循 Clean Architecture 分层设计
- 个性化推荐逻辑与核心业务逻辑分离
- 基于用户认知模型提供精准推荐
- 支持多种推荐策略的灵活切换
- 推荐结果可解释、可追溯

### 1.2 核心组件
- `PersonalizedRecommendationService` - 个性化推荐服务
- `UserProfileRepository` - 用户画像数据访问
- `RecommendationStrategy` - 推荐策略接口
- `CollaborativeFilteringStrategy` - 协同过滤策略
- `ContentBasedFilteringStrategy` - 基于内容的过滤策略
- `HybridRecommendationStrategy` - 混合推荐策略

## 2. 系统架构

### 2.1 分层设计
```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │              RecommendationController             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │         PersonalizedRecommendationService         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                       │
│  ┌─────────────────┐   ┌─────────────────────────────┐  │
│  │ UserProfile     │   │ RecommendationStrategy      │  │
│  ├─────────────────┤   ├─────────────────────────────┤  │
│  │ CognitiveModel  │   │ CollaborativeFiltering      │  │
│  └─────────────────┘   │ ContentBasedFiltering       │  │
│                        │ HybridRecommendation        │  │
│                        └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                  │
│  ┌─────────────────┐   ┌─────────────────────────────┐  │
│  │ UserProfileRepo │   │ RecommendationCache         │  │
│  │                 │   └─────────────────────────────┘  │
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
- `PersonalizedRecommendationService` 依赖于 `RecommendationStrategy` 和 `UserProfileRepository`
- 推荐策略实现依赖于 `CognitiveModel` 和 `UserProfile`
- `UserProfileRepository` 负责持久化用户画像数据
- `RecommendationCache` 用于缓存推荐结果，提高性能

## 3. 核心功能

### 3.1 用户画像管理

#### 3.1.1 数据模型
```typescript
// domain/entities/UserProfile.ts
export interface UserProfile {
  userId: string;
  cognitivePreferences: {
    preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    preferredDepth: 'surface' | 'deep' | 'critical';
    preferredFormat: 'text' | 'diagram' | 'video' | 'interactive';
  };
  interactionHistory: {
    conceptId: string;
    action: 'view' | 'edit' | 'connect' | 'feedback';
    timestamp: Date;
    duration?: number;
  }[];
  feedbackHistory: {
    suggestionId: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment?: string;
    timestamp: Date;
  }[];
  cognitiveStrengths: string[];
  cognitiveWeaknesses: string[];
  lastUpdated: Date;
}
```

#### 3.1.2 用户画像仓库接口
```typescript
// application/repositories/UserProfileRepository.ts
export interface UserProfileRepository {
  getUserProfile(userId: string): Promise<UserProfile>;
  updateUserProfile(profile: UserProfile): Promise<void>;
  incrementInteraction(
    userId: string,
    conceptId: string,
    action: UserProfile['interactionHistory'][0]['action'],
    duration?: number
  ): Promise<void>;
  addFeedback(
    userId: string,
    suggestionId: string,
    rating: UserProfile['feedbackHistory'][0]['rating'],
    comment?: string
  ): Promise<void>;
}
```

### 3.2 推荐策略设计

#### 3.2.1 推荐策略接口
```typescript
// domain/strategies/RecommendationStrategy.ts
export interface Recommendation {
  suggestionId: string;
  type: 'concept' | 'relation' | 'insight' | 'exercise';
  relevanceScore: number;
  personalizationFactors: {
    factor: string;
    weight: number;
  }[];
  explanation: string;
}

export interface RecommendationStrategy {
  generateRecommendations(
    userId: string,
    cognitiveModel: CognitiveModel,
    limit: number
  ): Promise<Recommendation[]>;
  getStrategyName(): string;
}
```

#### 3.2.2 协同过滤策略
```typescript
// domain/strategies/CollaborativeFilteringStrategy.ts
export class CollaborativeFilteringStrategy implements RecommendationStrategy {
  constructor(
    private readonly userProfileRepo: UserProfileRepository,
    private readonly cognitiveModelService: CognitiveModelService
  ) {}

  async generateRecommendations(
    userId: string,
    cognitiveModel: CognitiveModel,
    limit: number
  ): Promise<Recommendation[]> {
    // 1. 获取当前用户画像
    const currentUserProfile = await this.userProfileRepo.getUserProfile(userId);
    
    // 2. 查找相似用户
    const similarUsers = await this.findSimilarUsers(currentUserProfile);
    
    // 3. 获取相似用户的高评分建议
    const recommendedSuggestions = await this.getRecommendationsFromSimilarUsers(
      similarUsers,
      cognitiveModel,
      limit
    );
    
    // 4. 排序并返回结果
    return recommendedSuggestions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  getStrategyName(): string {
    return 'collaborative-filtering';
  }

  private async findSimilarUsers(
    currentProfile: UserProfile
  ): Promise<UserProfile[]> {
    // 实现用户相似度计算逻辑
    // 使用余弦相似度或皮尔逊相关系数
  }

  private async getRecommendationsFromSimilarUsers(
    similarUsers: UserProfile[],
    cognitiveModel: CognitiveModel,
    limit: number
  ): Promise<Recommendation[]> {
    // 从相似用户的反馈中获取推荐
  }
}
```

#### 3.2.3 基于内容的过滤策略
```typescript
// domain/strategies/ContentBasedFilteringStrategy.ts
export class ContentBasedFilteringStrategy implements RecommendationStrategy {
  constructor(
    private readonly userProfileRepo: UserProfileRepository,
    private readonly cognitiveModelService: CognitiveModelService
  ) {}

  async generateRecommendations(
    userId: string,
    cognitiveModel: CognitiveModel,
    limit: number
  ): Promise<Recommendation[]> {
    // 1. 获取用户画像
    const userProfile = await this.userProfileRepo.getUserProfile(userId);
    
    // 2. 分析用户偏好
    const preferences = this.analyzeUserPreferences(userProfile);
    
    // 3. 基于认知模型生成推荐
    const recommendations = await this.generateContentBasedRecommendations(
      cognitiveModel,
      preferences,
      limit
    );
    
    // 4. 排序并返回
    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  getStrategyName(): string {
    return 'content-based-filtering';
  }

  private analyzeUserPreferences(userProfile: UserProfile) {
    // 分析用户学习风格、深度偏好等
  }

  private async generateContentBasedRecommendations(
    cognitiveModel: CognitiveModel,
    preferences: any,
    limit: number
  ): Promise<Recommendation[]> {
    // 基于认知模型内容和用户偏好生成推荐
  }
}
```

#### 3.2.4 混合推荐策略
```typescript
// domain/strategies/HybridRecommendationStrategy.ts
export class HybridRecommendationStrategy implements RecommendationStrategy {
  constructor(
    private readonly collaborativeStrategy: CollaborativeFilteringStrategy,
    private readonly contentBasedStrategy: ContentBasedFilteringStrategy,
    private readonly weights: {
      collaborative: number;
      contentBased: number;
    } = { collaborative: 0.5, contentBased: 0.5 }
  ) {}

  async generateRecommendations(
    userId: string,
    cognitiveModel: CognitiveModel,
    limit: number
  ): Promise<Recommendation[]> {
    // 1. 并行获取两种策略的推荐结果
    const [collaborativeRecs, contentBasedRecs] = await Promise.all([
      this.collaborativeStrategy.generateRecommendations(userId, cognitiveModel, limit * 2),
      this.contentBasedStrategy.generateRecommendations(userId, cognitiveModel, limit * 2)
    ]);
    
    // 2. 合并并加权评分
    const mergedRecommendations = this.mergeAndWeightRecommendations(
      collaborativeRecs,
      contentBasedRecs
    );
    
    // 3. 排序并返回结果
    return mergedRecommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  getStrategyName(): string {
    return 'hybrid-recommendation';
  }

  private mergeAndWeightRecommendations(
    collaborativeRecs: Recommendation[],
    contentBasedRecs: Recommendation[]
  ): Recommendation[] {
    // 合并推荐结果并应用加权评分
    const recMap = new Map<string, Recommendation>();
    
    // 添加协同过滤推荐
    collaborativeRecs.forEach(rec => {
      recMap.set(rec.suggestionId, {
        ...rec,
        relevanceScore: rec.relevanceScore * this.weights.collaborative
      });
    });
    
    // 添加基于内容的推荐
    contentBasedRecs.forEach(rec => {
      if (recMap.has(rec.suggestionId)) {
        const existingRec = recMap.get(rec.suggestionId)!;
        recMap.set(rec.suggestionId, {
          ...existingRec,
          relevanceScore: existingRec.relevanceScore + (rec.relevanceScore * this.weights.contentBased),
          personalizationFactors: [...existingRec.personalizationFactors, ...rec.personalizationFactors]
        });
      } else {
        recMap.set(rec.suggestionId, {
          ...rec,
          relevanceScore: rec.relevanceScore * this.weights.contentBased
        });
      }
    });
    
    return Array.from(recMap.values());
  }
}
```

### 3.3 个性化推荐服务

#### 3.3.1 服务接口
```typescript
// application/services/PersonalizedRecommendationService.ts
export interface PersonalizedRecommendationService {
  getPersonalizedRecommendations(
    userId: string,
    limit?: number,
    strategy?: string
  ): Promise<Recommendation[]>;
  updateRecommendationPreferences(
    userId: string,
    preferences: Partial<UserProfile['cognitivePreferences']>
  ): Promise<void>;
  getRecommendationExplanation(
    userId: string,
    suggestionId: string
  ): Promise<string>;
}
```

#### 3.3.2 服务实现
```typescript
// application/services/PersonalizedRecommendationServiceImpl.ts
export class PersonalizedRecommendationServiceImpl implements PersonalizedRecommendationService {
  constructor(
    private readonly userProfileRepo: UserProfileRepository,
    private readonly cognitiveModelService: CognitiveModelService,
    private readonly strategyFactory: RecommendationStrategyFactory,
    private readonly recommendationCache: RecommendationCache
  ) {}

  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10,
    strategy: string = 'hybrid'
  ): Promise<Recommendation[]> {
    // 1. 检查缓存
    const cachedRecs = await this.recommendationCache.getRecommendations(userId, strategy);
    if (cachedRecs) {
      return cachedRecs.slice(0, limit);
    }
    
    // 2. 获取用户认知模型
    const cognitiveModel = await this.cognitiveModelService.getCognitiveModel(userId);
    
    // 3. 获取推荐策略
    const recommendationStrategy = this.strategyFactory.getStrategy(strategy);
    
    // 4. 生成推荐
    const recommendations = await recommendationStrategy.generateRecommendations(
      userId,
      cognitiveModel,
      limit
    );
    
    // 5. 缓存结果
    await this.recommendationCache.setRecommendations(userId, strategy, recommendations);
    
    // 6. 返回结果
    return recommendations;
  }

  async updateRecommendationPreferences(
    userId: string,
    preferences: Partial<UserProfile['cognitivePreferences']>
  ): Promise<void> {
    // 1. 获取当前用户画像
    const profile = await this.userProfileRepo.getUserProfile(userId);
    
    // 2. 更新偏好
    profile.cognitivePreferences = {
      ...profile.cognitivePreferences,
      ...preferences
    };
    profile.lastUpdated = new Date();
    
    // 3. 保存更新
    await this.userProfileRepo.updateUserProfile(profile);
    
    // 4. 清除相关缓存
    await this.recommendationCache.clearRecommendations(userId);
  }

  async getRecommendationExplanation(
    userId: string,
    suggestionId: string
  ): Promise<string> {
    // 实现推荐解释逻辑
    // 分析推荐的个性化因素并生成解释
  }
}
```

### 3.4 推荐策略工厂

```typescript
// application/factories/RecommendationStrategyFactory.ts
export class RecommendationStrategyFactory {
  constructor(
    private readonly userProfileRepo: UserProfileRepository,
    private readonly cognitiveModelService: CognitiveModelService
  ) {}

  getStrategy(strategyName: string): RecommendationStrategy {
    const collaborativeStrategy = new CollaborativeFilteringStrategy(
      this.userProfileRepo,
      this.cognitiveModelService
    );
    
    const contentBasedStrategy = new ContentBasedFilteringStrategy(
      this.userProfileRepo,
      this.cognitiveModelService
    );
    
    switch (strategyName) {
      case 'collaborative':
        return collaborativeStrategy;
      case 'content-based':
        return contentBasedStrategy;
      case 'hybrid':
      default:
        return new HybridRecommendationStrategy(collaborativeStrategy, contentBasedStrategy);
    }
  }
}
```

## 4. 核心 API 设计

### 4.1 推荐控制器

```typescript
// presentation/controllers/RecommendationController.ts
export class RecommendationController {
  constructor(
    private readonly recommendationService: PersonalizedRecommendationService
  ) {}

  // GET /api/recommendations
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const strategy = req.query.strategy as string || 'hybrid';
      
      const recommendations = await this.recommendationService.getPersonalizedRecommendations(
        userId,
        limit,
        strategy
      );
      
      res.json({
        success: true,
        data: recommendations,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate recommendations',
        error: error.message
      });
    }
  }

  // POST /api/recommendations/preferences
  async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const preferences = req.body;
      
      await this.recommendationService.updateRecommendationPreferences(userId, preferences);
      
      res.json({
        success: true,
        message: 'Preferences updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences',
        error: error.message
      });
    }
  }

  // GET /api/recommendations/:suggestionId/explanation
  async getExplanation(req: Request, res: Response): Promise<void> {
    try {
      const { userId, suggestionId } = req.params;
      
      const explanation = await this.recommendationService.getRecommendationExplanation(
        userId,
        suggestionId
      );
      
      res.json({
        success: true,
        data: { explanation },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendation explanation',
        error: error.message
      });
    }
  }
}
```

## 5. 数据持久化

### 5.1 数据库表设计

```sql
-- 用户画像表
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  cognitive_preferences JSONB NOT NULL,
  interaction_history JSONB NOT NULL DEFAULT '[]',
  feedback_history JSONB NOT NULL DEFAULT '[]',
  cognitive_strengths JSONB NOT NULL DEFAULT '[]',
  cognitive_weaknesses JSONB NOT NULL DEFAULT '[]',
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 推荐缓存表
CREATE TABLE IF NOT EXISTS recommendation_cache (
  user_id TEXT NOT NULL,
  strategy TEXT NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  PRIMARY KEY (user_id, strategy)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_updated ON user_profiles(last_updated);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_expires_at ON recommendation_cache(expires_at);
```

### 5.2 缓存实现

```typescript
// infrastructure/cache/RecommendationCache.ts
export interface RecommendationCache {
  getRecommendations(userId: string, strategy: string): Promise<Recommendation[] | null>;
  setRecommendations(userId: string, strategy: string, recommendations: Recommendation[]): Promise<void>;
  clearRecommendations(userId: string, strategy?: string): Promise<void>;
  clearExpiredRecommendations(): Promise<void>;
}

// infrastructure/cache/RecommendationCacheImpl.ts
export class RecommendationCacheImpl implements RecommendationCache {
  constructor(
    private readonly db: Database,
    private readonly cacheTTL: number = 3600000 // 默认1小时
  ) {}

  async getRecommendations(userId: string, strategy: string): Promise<Recommendation[] | null> {
    const result = await this.db.get<{
      recommendations: string;
      expires_at: Date;
    }>(
      'SELECT recommendations, expires_at FROM recommendation_cache WHERE user_id = ? AND strategy = ?',
      [userId, strategy]
    );
    
    if (!result) {
      return null;
    }
    
    // 检查是否过期
    if (new Date() > result.expires_at) {
      await this.clearRecommendations(userId, strategy);
      return null;
    }
    
    return JSON.parse(result.recommendations);
  }

  async setRecommendations(userId: string, strategy: string, recommendations: Recommendation[]): Promise<void> {
    const expiresAt = new Date(Date.now() + this.cacheTTL);
    
    await this.db.run(
      `INSERT OR REPLACE INTO recommendation_cache 
       (user_id, strategy, recommendations, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [userId, strategy, JSON.stringify(recommendations), expiresAt]
    );
  }

  async clearRecommendations(userId: string, strategy?: string): Promise<void> {
    if (strategy) {
      await this.db.run(
        'DELETE FROM recommendation_cache WHERE user_id = ? AND strategy = ?',
        [userId, strategy]
      );
    } else {
      await this.db.run(
        'DELETE FROM recommendation_cache WHERE user_id = ?',
        [userId]
      );
    }
  }

  async clearExpiredRecommendations(): Promise<void> {
    await this.db.run(
      'DELETE FROM recommendation_cache WHERE expires_at < ?',
      [new Date()]
    );
  }
}
```

## 6. 测试策略

### 6.1 单元测试

```typescript
// test/unit/domain/strategies/HybridRecommendationStrategy.test.ts
describe('HybridRecommendationStrategy', () => {
  let strategy: HybridRecommendationStrategy;
  let collaborativeStrategy: jest.Mocked<CollaborativeFilteringStrategy>;
  let contentBasedStrategy: jest.Mocked<ContentBasedFilteringStrategy>;

  beforeEach(() => {
    collaborativeStrategy = {
      generateRecommendations: jest.fn(),
      getStrategyName: jest.fn().mockReturnValue('collaborative-filtering')
    } as any;
    
    contentBasedStrategy = {
      generateRecommendations: jest.fn(),
      getStrategyName: jest.fn().mockReturnValue('content-based-filtering')
    } as any;
    
    strategy = new HybridRecommendationStrategy(collaborativeStrategy, contentBasedStrategy);
  });

  it('should merge recommendations from both strategies with weighted scores', async () => {
    // Arrange
    const userId = 'test-user';
    const cognitiveModel = {} as CognitiveModel;
    const limit = 5;
    
    collaborativeStrategy.generateRecommendations.mockResolvedValue([
      { suggestionId: 'rec1', type: 'concept', relevanceScore: 0.8, personalizationFactors: [], explanation: '' },
      { suggestionId: 'rec2', type: 'insight', relevanceScore: 0.6, personalizationFactors: [], explanation: '' }
    ]);
    
    contentBasedStrategy.generateRecommendations.mockResolvedValue([
      { suggestionId: 'rec2', type: 'insight', relevanceScore: 0.9, personalizationFactors: [], explanation: '' },
      { suggestionId: 'rec3', type: 'exercise', relevanceScore: 0.7, personalizationFactors: [], explanation: '' }
    ]);
    
    // Act
    const result = await strategy.generateRecommendations(userId, cognitiveModel, limit);
    
    // Assert
    expect(result).toHaveLength(3);
    expect(result[0].suggestionId).toBe('rec2');
    expect(result[0].relevanceScore).toBeCloseTo(0.75); // (0.6*0.5 + 0.9*0.5)
    expect(result[1].suggestionId).toBe('rec3');
    expect(result[1].relevanceScore).toBeCloseTo(0.35); // 0.7*0.5
    expect(result[2].suggestionId).toBe('rec1');
    expect(result[2].relevanceScore).toBeCloseTo(0.4); // 0.8*0.5
  });
});
```

### 6.2 集成测试

```typescript
// test/integration/services/PersonalizedRecommendationService.test.ts
describe('PersonalizedRecommendationService Integration', () => {
  let service: PersonalizedRecommendationService;
  let userProfileRepo: UserProfileRepository;
  let cognitiveModelService: CognitiveModelService;
  let db: Database;

  beforeAll(async () => {
    // 初始化数据库连接
    db = await initializeTestDatabase();
    
    // 创建依赖
    userProfileRepo = new UserProfileRepositoryImpl(db);
    cognitiveModelService = new CognitiveModelServiceImpl(db);
    
    // 创建策略工厂
    const strategyFactory = new RecommendationStrategyFactoryImpl(
      userProfileRepo,
      cognitiveModelService
    );
    
    // 创建缓存
    const recommendationCache = new RecommendationCacheImpl(db);
    
    // 创建服务
    service = new PersonalizedRecommendationServiceImpl(
      userProfileRepo,
      cognitiveModelService,
      strategyFactory,
      recommendationCache
    );
  });

  afterAll(async () => {
    // 清理数据库
    await db.close();
  });

  it('should generate personalized recommendations for a user', async () => {
    // Arrange
    const userId = 'test-user-1';
    
    // 创建测试用户画像
    await userProfileRepo.updateUserProfile({
      userId,
      cognitivePreferences: {
        preferredLearningStyle: 'visual',
        preferredDepth: 'deep',
        preferredFormat: 'diagram'
      },
      interactionHistory: [],
      feedbackHistory: [],
      cognitiveStrengths: [],
      cognitiveWeaknesses: [],
      lastUpdated: new Date()
    });
    
    // Act
    const recommendations = await service.getPersonalizedRecommendations(userId, 5);
    
    // Assert
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeLessThanOrEqual(5);
    recommendations.forEach(rec => {
      expect(rec).toHaveProperty('suggestionId');
      expect(rec).toHaveProperty('type');
      expect(rec).toHaveProperty('relevanceScore');
      expect(rec).toHaveProperty('explanation');
    });
  });
});
```

## 7. 性能优化

### 7.1 缓存策略
- 推荐结果缓存 1 小时
- 定期清理过期缓存
- 用户偏好更新时自动失效相关缓存

### 7.2 并行处理
- 并行获取用户画像和认知模型
- 并行执行多种推荐策略
- 异步更新用户交互历史

### 7.3 算法优化
- 采用增量协同过滤减少计算量
- 使用近似最近邻算法加速相似用户查找
- 实现推荐结果的分页加载

### 7.4 数据库优化
- 合理设计索引
- 使用批量操作减少数据库连接
- 定期清理旧数据

## 8. 错误处理和日志

### 8.1 错误处理

```typescript
// application/errors/RecommendationErrors.ts
export class RecommendationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecommendationError';
  }
}

export class UserProfileNotFoundError extends RecommendationError {
  constructor(userId: string) {
    super(`User profile not found for user: ${userId}`);
    this.name = 'UserProfileNotFoundError';
  }
}

export class InvalidRecommendationStrategyError extends RecommendationError {
  constructor(strategy: string) {
    super(`Invalid recommendation strategy: ${strategy}`);
    this.name = 'InvalidRecommendationStrategyError';
  }
}

export class RecommendationGenerationError extends RecommendationError {
  constructor(cause: Error) {
    super(`Failed to generate recommendations: ${cause.message}`);
    this.name = 'RecommendationGenerationError';
    this.cause = cause;
  }
}
```

### 8.2 日志记录

```typescript
// application/middleware/LoggingMiddleware.ts
export class LoggingMiddleware {
  constructor(private readonly logger: Logger) {}

  logRecommendationRequest(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { userId, strategy } = req.params;
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.info('Recommendation request processed', {
        userId,
        strategy,
        status: res.statusCode,
        duration: `${duration}ms`,
        method: req.method,
        url: req.originalUrl
      });
    });
    
    next();
  }

  logRecommendationError(err: Error, req: Request, res: Response, next: NextFunction) {
    const { userId, strategy } = req.params;
    
    this.logger.error('Recommendation error', {
      userId,
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
  recommendation-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=sqlite:///app/data/recommendation.db
      - CACHE_TTL=3600000
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

### 9.2 监控指标

```typescript
// application/metrics/RecommendationMetrics.ts
export class RecommendationMetrics {
  constructor(private readonly metricsClient: MetricsClient) {}

  recordRecommendationGeneration(
    userId: string,
    strategy: string,
    duration: number,
    recommendationCount: number
  ) {
    this.metricsClient.histogram('recommendation.generation.duration', duration, {
      userId,
      strategy
    });
    
    this.metricsClient.counter('recommendation.generation.count', 1, {
      userId,
      strategy
    });
    
    this.metricsClient.gauge('recommendation.count.per.request', recommendationCount, {
      userId,
      strategy
    });
  }

  recordRecommendationCacheHit(userId: string, strategy: string) {
    this.metricsClient.counter('recommendation.cache.hit', 1, {
      userId,
      strategy
    });
  }

  recordRecommendationCacheMiss(userId: string, strategy: string) {
    this.metricsClient.counter('recommendation.cache.miss', 1, {
      userId,
      strategy
    });
  }

  recordRecommendationFeedback(
    userId: string,
    suggestionId: string,
    rating: number
  ) {
    this.metricsClient.counter('recommendation.feedback.count', 1, {
      userId,
      rating: rating.toString()
    });
    
    this.metricsClient.histogram('recommendation.feedback.rating', rating, {
      userId
    });
  }
}
```

## 10. 结论

### 10.1 设计亮点
- 遵循 Clean Architecture 原则，实现了清晰的分层设计
- 采用策略模式，支持多种推荐算法的灵活切换
- 实现了完整的个性化推荐流程，包括用户画像、推荐生成、结果解释
- 集成了缓存机制，提高了系统性能
- 提供了详细的测试策略，确保系统质量
- 实现了完善的错误处理和日志记录

### 10.2 未来扩展方向
- 支持更多推荐策略，如深度学习推荐模型
- 实现实时推荐更新机制
- 支持多语言推荐
- 增加推荐多样性控制
- 实现推荐结果的 A/B 测试

### 10.3 关键成功因素
- 准确的用户画像数据
- 高质量的认知模型
- 有效的推荐算法
- 良好的用户反馈机制
- 持续的模型优化和更新

通过本技术实现文档，我们构建了一个完整的个性化推荐系统，能够根据用户的认知模型和偏好生成精准、个性化的建议。该系统具有良好的扩展性和可维护性，能够支持未来的功能扩展和性能优化。