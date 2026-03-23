# 65-用户反馈技术实现文档

## 1. 模块概述

### 1.1 设计原则
- 遵循 Clean Architecture 分层设计
- 用户反馈与核心业务逻辑分离
- 支持多种反馈类型和收集渠道
- 反馈处理流程可扩展、可配置
- 反馈数据可分析、可应用
- 保护用户隐私，符合数据保护法规
- 反馈收集过程简单、直观，减少用户摩擦

### 1.2 核心组件
- `FeedbackService` - 用户反馈服务
- `FeedbackCollector` - 反馈收集器接口
- `DirectFeedbackCollector` - 直接反馈收集器
- `InAppFeedbackCollector` - 应用内反馈收集器
- `EmailFeedbackCollector` - 邮件反馈收集器
- `FeedbackProcessor` - 反馈处理器接口
- `FeedbackRepository` - 反馈存储仓库
- `FeedbackAnalyzer` - 反馈分析器

## 2. 系统架构

### 2.1 分层设计
```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │               FeedbackController                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │                   FeedbackService                │  │
│  ├───────────────────────────────────────────────────┤  │
│  │                   FeedbackAnalyzer               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                       │
│  ┌─────────────────┐   ┌─────────────────────────────┐  │
│  │ Feedback        │   │ FeedbackCollector           │  │
│  ├─────────────────┤   ├─────────────────────────────┤  │
│  │ FeedbackType    │   │ DirectFeedbackCollector     │  │
│  ├─────────────────┤   │ InAppFeedbackCollector      │  │
│  │ FeedbackStatus  │   │ EmailFeedbackCollector      │  │
│  └─────────────────┘   └─────────────────────────────┘  │
│                        ┌─────────────────────────────┐  │
│                        │ FeedbackProcessor           │  │
│                        ├─────────────────────────────┤  │
│                        │ ValidationProcessor         │  │
│                        │ ClassificationProcessor     │  │
│                        │ AnalysisProcessor           │  │
│                        └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                  │
│  ┌─────────────────┐   ┌─────────────────────────────┐  │
│  │ Feedback        │   │ FeedbackCache               │  │
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
- `FeedbackService` 依赖于 `FeedbackCollector`、`FeedbackProcessor` 和 `FeedbackRepository`
- `FeedbackCollector` 实现负责收集不同渠道的反馈
- `FeedbackProcessor` 实现负责处理和分析反馈
- `FeedbackRepository` 负责持久化反馈数据
- `FeedbackAnalyzer` 依赖于 `FeedbackRepository` 和 `AIServiceAdapter`

## 3. 核心功能

### 3.1 用户反馈数据模型

#### 3.1.1 反馈数据模型
```typescript
// domain/entities/Feedback.ts
export type FeedbackType = 
  | 'suggestion-quality' 
  | 'ui-ux' 
  | 'bug-report' 
  | 'feature-request' 
  | 'general-feedback' 
  | 'other';

export type FeedbackStatus = 
  | 'new' 
  | 'validated' 
  | 'classified' 
  | 'analyzed' 
  | 'resolved' 
  | 'closed';

export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  targetId?: string; // 反馈针对的对象ID，如建议ID、页面ID等
  targetType?: string; // 反馈针对的对象类型，如suggestion、page等
  content: string;
  rating?: number; // 评分，1-5
  metadata: {
    channel: 'direct' | 'in-app' | 'email' | 'other';
    timestamp: Date;
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    additionalData?: any;
  };
  status: FeedbackStatus;
  classification?: {
    category: string;
    subcategory?: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    priority: 'low' | 'medium' | 'high';
  };
  analysis?: {
    keyInsights: string[];
    actionItems: string[];
    relatedFeedbacks: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3.1.2 反馈统计数据模型
```typescript
// domain/entities/FeedbackStats.ts
export interface FeedbackStats {
  totalFeedbacks: number;
  feedbacksByType: Record<FeedbackType, number>;
  feedbacksByStatus: Record<FeedbackStatus, number>;
  averageRating: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  recentFeedbacks: number; // 最近7天的反馈数量
  resolutionTime: {
    average: number; // 平均解决时间（小时）
    median: number; // 中位数解决时间（小时）
  };
}
```

### 3.2 反馈收集设计

#### 3.2.1 反馈收集器接口
```typescript
// domain/collectors/FeedbackCollector.ts
export interface FeedbackCollector {
  collectFeedback(
    feedbackData: Omit<Feedback, 'id' | 'status' | 'classification' | 'analysis' | 'createdAt' | 'updatedAt'>
  ): Promise<Feedback>;
  getCollectorName(): string;
  getSupportedFeedbackTypes(): FeedbackType[];
}
```

#### 3.2.2 直接反馈收集器
```typescript
// domain/collectors/DirectFeedbackCollector.ts
export class DirectFeedbackCollector implements FeedbackCollector {
  constructor(
    private readonly feedbackRepo: FeedbackRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async collectFeedback(
    feedbackData: Omit<Feedback, 'id' | 'status' | 'classification' | 'analysis' | 'createdAt' | 'updatedAt'>
  ): Promise<Feedback> {
    // 创建反馈对象
    const feedback: Feedback = {
      id: this.idGenerator.generate(),
      ...feedbackData,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 保存反馈
    await this.feedbackRepo.saveFeedback(feedback);
    
    return feedback;
  }

  getCollectorName(): string {
    return 'direct';
  }

  getSupportedFeedbackTypes(): FeedbackType[] {
    return ['suggestion-quality', 'ui-ux', 'bug-report', 'feature-request', 'general-feedback', 'other'];
  }
}
```

#### 3.2.3 应用内反馈收集器
```typescript
// domain/collectors/InAppFeedbackCollector.ts
export class InAppFeedbackCollector implements FeedbackCollector {
  constructor(
    private readonly feedbackRepo: FeedbackRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async collectFeedback(
    feedbackData: Omit<Feedback, 'id' | 'status' | 'classification' | 'analysis' | 'createdAt' | 'updatedAt'>
  ): Promise<Feedback> {
    // 增强反馈数据，添加应用内特有的元数据
    const enhancedFeedbackData = {
      ...feedbackData,
      metadata: {
        ...feedbackData.metadata,
        channel: 'in-app',
        timestamp: new Date()
      }
    };
    
    // 创建反馈对象
    const feedback: Feedback = {
      id: this.idGenerator.generate(),
      ...enhancedFeedbackData,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 保存反馈
    await this.feedbackRepo.saveFeedback(feedback);
    
    return feedback;
  }

  getCollectorName(): string {
    return 'in-app';
  }

  getSupportedFeedbackTypes(): FeedbackType[] {
    return ['suggestion-quality', 'ui-ux', 'bug-report', 'feature-request', 'general-feedback'];
  }
}
```

### 3.3 反馈处理设计

#### 3.3.1 反馈处理器接口
```typescript
// domain/processors/FeedbackProcessor.ts
export interface FeedbackProcessor {
  processFeedback(feedback: Feedback): Promise<Feedback>;
  getProcessorName(): string;
  getSupportedStatuses(): FeedbackStatus[];
}
```

#### 3.3.2 验证处理器
```typescript
// domain/processors/ValidationProcessor.ts
export class ValidationProcessor implements FeedbackProcessor {
  async processFeedback(feedback: Feedback): Promise<Feedback> {
    // 验证反馈内容是否有效
    if (!this.isValidFeedback(feedback)) {
      throw new InvalidFeedbackError(`Invalid feedback: ${feedback.id}`);
    }
    
    // 更新反馈状态
    const updatedFeedback: Feedback = {
      ...feedback,
      status: 'validated',
      updatedAt: new Date()
    };
    
    return updatedFeedback;
  }

  getProcessorName(): string {
    return 'validation';
  }

  getSupportedStatuses(): FeedbackStatus[] {
    return ['new'];
  }

  private isValidFeedback(feedback: Feedback): boolean {
    // 验证逻辑
    if (!feedback.content || feedback.content.trim().length < 5) {
      return false;
    }
    
    if (feedback.rating && (feedback.rating < 1 || feedback.rating > 5)) {
      return false;
    }
    
    return true;
  }
}
```

#### 3.3.3 分类处理器
```typescript
// domain/processors/ClassificationProcessor.ts
export class ClassificationProcessor implements FeedbackProcessor {
  constructor(private readonly aiService: AIService) {}

  async processFeedback(feedback: Feedback): Promise<Feedback> {
    // 使用 AI 服务进行分类和情感分析
    const classificationResult = await this.aiService.classifyFeedback(feedback.content);
    
    // 更新反馈分类信息
    const updatedFeedback: Feedback = {
      ...feedback,
      status: 'classified',
      classification: {
        category: classificationResult.category,
        subcategory: classificationResult.subcategory,
        sentiment: classificationResult.sentiment,
        priority: this.calculatePriority(feedback, classificationResult)
      },
      updatedAt: new Date()
    };
    
    return updatedFeedback;
  }

  getProcessorName(): string {
    return 'classification';
  }

  getSupportedStatuses(): FeedbackStatus[] {
    return ['validated'];
  }

  private calculatePriority(feedback: Feedback, classification: any): 'low' | 'medium' | 'high' {
    // 基于反馈类型、情感和内容计算优先级
    if (feedback.type === 'bug-report') {
      return 'high';
    }
    
    if (feedback.type === 'feature-request' && classification.sentiment === 'negative') {
      return 'medium';
    }
    
    if (feedback.rating && feedback.rating <= 2) {
      return 'high';
    }
    
    return 'low';
  }
}
```

### 3.4 反馈服务设计

#### 3.4.1 反馈服务接口
```typescript
// application/services/FeedbackService.ts
export interface FeedbackService {
  submitFeedback(
    feedbackData: Omit<Feedback, 'id' | 'status' | 'classification' | 'analysis' | 'createdAt' | 'updatedAt'>
  ): Promise<Feedback>;
  getFeedbackById(id: string): Promise<Feedback | null>;
  updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<Feedback>;
  listFeedbacks(filter?: {
    type?: FeedbackType;
    status?: FeedbackStatus;
    userId?: string;
    targetId?: string;
    targetType?: string;
  }, limit?: number, offset?: number): Promise<Feedback[]>;
  getFeedbackStats(): Promise<FeedbackStats>;
  processFeedback(id: string): Promise<Feedback>;
  analyzeFeedbackTrends(timeRange?: 'week' | 'month' | 'quarter' | 'year'): Promise<any>;
  deleteFeedback(id: string): Promise<void>;
}
```

#### 3.4.2 反馈服务实现
```typescript
// application/services/FeedbackServiceImpl.ts
export class FeedbackServiceImpl implements FeedbackService {
  constructor(
    private readonly feedbackCollector: FeedbackCollector,
    private readonly feedbackProcessors: FeedbackProcessor[],
    private readonly feedbackRepo: FeedbackRepository,
    private readonly feedbackAnalyzer: FeedbackAnalyzer
  ) {}

  async submitFeedback(
    feedbackData: Omit<Feedback, 'id' | 'status' | 'classification' | 'analysis' | 'createdAt' | 'updatedAt'>
  ): Promise<Feedback> {
    // 1. 收集反馈
    const feedback = await this.feedbackCollector.collectFeedback(feedbackData);
    
    // 2. 自动处理反馈
    return this.processFeedback(feedback.id);
  }

  async getFeedbackById(id: string): Promise<Feedback | null> {
    return this.feedbackRepo.getFeedbackById(id);
  }

  async updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<Feedback> {
    const feedback = await this.feedbackRepo.getFeedbackById(id);
    if (!feedback) {
      throw new FeedbackNotFoundError(`Feedback not found: ${id}`);
    }
    
    const updatedFeedback = {
      ...feedback,
      status,
      updatedAt: new Date()
    };
    
    await this.feedbackRepo.updateFeedback(updatedFeedback);
    return updatedFeedback;
  }

  async listFeedbacks(filter?: {
    type?: FeedbackType;
    status?: FeedbackStatus;
    userId?: string;
    targetId?: string;
    targetType?: string;
  }, limit: number = 10, offset: number = 0): Promise<Feedback[]> {
    return this.feedbackRepo.listFeedbacks(filter, limit, offset);
  }

  async getFeedbackStats(): Promise<FeedbackStats> {
    return this.feedbackRepo.getFeedbackStats();
  }

  async processFeedback(id: string): Promise<Feedback> {
    let feedback = await this.feedbackRepo.getFeedbackById(id);
    if (!feedback) {
      throw new FeedbackNotFoundError(`Feedback not found: ${id}`);
    }
    
    // 按顺序执行所有适用的处理器
    for (const processor of this.feedbackProcessors) {
      if (processor.getSupportedStatuses().includes(feedback.status)) {
        feedback = await processor.processFeedback(feedback);
        // 保存中间结果
        await this.feedbackRepo.updateFeedback(feedback);
      }
    }
    
    return feedback;
  }

  async analyzeFeedbackTrends(timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<any> {
    return this.feedbackAnalyzer.analyzeTrends(timeRange);
  }

  async deleteFeedback(id: string): Promise<void> {
    await this.feedbackRepo.deleteFeedback(id);
  }
}
```

### 3.5 反馈分析设计

#### 3.5.1 反馈分析器接口
```typescript
// domain/analyzers/FeedbackAnalyzer.ts
export interface FeedbackAnalyzer {
  analyzeTrends(timeRange: 'week' | 'month' | 'quarter' | 'year'): Promise<any>;
  analyzeSentiment(): Promise<any>;
  identifyCommonIssues(): Promise<any>;
  generateInsights(): Promise<any>;
}
```

#### 3.5.2 反馈分析器实现
```typescript
// domain/analyzers/FeedbackAnalyzerImpl.ts
export class FeedbackAnalyzerImpl implements FeedbackAnalyzer {
  constructor(
    private readonly feedbackRepo: FeedbackRepository,
    private readonly aiService: AIService
  ) {}

  async analyzeTrends(timeRange: 'week' | 'month' | 'quarter' | 'year'): Promise<any> {
    // 获取指定时间范围的反馈数据
    const feedbacks = await this.feedbackRepo.getFeedbacksByTimeRange(timeRange);
    
    // 分析趋势
    const trends = {
      totalFeedbacks: feedbacks.length,
      feedbacksByType: this.groupByType(feedbacks),
      feedbacksByStatus: this.groupByStatus(feedbacks),
      sentimentTrend: this.analyzeSentimentTrend(feedbacks),
      averageRating: this.calculateAverageRating(feedbacks),
      resolutionTimeTrend: this.analyzeResolutionTimeTrend(feedbacks)
    };
    
    return trends;
  }

  async analyzeSentiment(): Promise<any> {
    // 使用 AI 服务分析所有反馈的情感
    const feedbacks = await this.feedbackRepo.listFeedbacks();
    
    const sentimentAnalysis = await this.aiService.analyzeFeedbackSentiment(feedbacks);
    
    return sentimentAnalysis;
  }

  async identifyCommonIssues(): Promise<any> {
    // 使用 AI 服务识别常见问题
    const feedbacks = await this.feedbackRepo.listFeedbacks({ status: 'analyzed' });
    
    const commonIssues = await this.aiService.identifyCommonIssues(feedbacks);
    
    return commonIssues;
  }

  async generateInsights(): Promise<any> {
    // 使用 AI 服务生成洞察
    const trends = await this.analyzeTrends('month');
    const sentiment = await this.analyzeSentiment();
    const commonIssues = await this.identifyCommonIssues();
    
    const insights = await this.aiService.generateFeedbackInsights({
      trends,
      sentiment,
      commonIssues
    });
    
    return insights;
  }

  private groupByType(feedbacks: Feedback[]): Record<FeedbackType, number> {
    return feedbacks.reduce((acc, feedback) => {
      acc[feedback.type] = (acc[feedback.type] || 0) + 1;
      return acc;
    }, {} as Record<FeedbackType, number>);
  }

  private groupByStatus(feedbacks: Feedback[]): Record<FeedbackStatus, number> {
    return feedbacks.reduce((acc, feedback) => {
      acc[feedback.status] = (acc[feedback.status] || 0) + 1;
      return acc;
    }, {} as Record<FeedbackStatus, number>);
  }

  private analyzeSentimentTrend(feedbacks: Feedback[]): any {
    // 实现情感趋势分析
    return {};
  }

  private calculateAverageRating(feedbacks: Feedback[]): number {
    const ratedFeedbacks = feedbacks.filter(f => f.rating !== undefined);
    if (ratedFeedbacks.length === 0) {
      return 0;
    }
    
    const sum = ratedFeedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    return sum / ratedFeedbacks.length;
  }

  private analyzeResolutionTimeTrend(feedbacks: Feedback[]): any {
    // 实现解决时间趋势分析
    return {};
  }
}
```

## 4. 核心 API 设计

### 4.1 反馈控制器
```typescript
// presentation/controllers/FeedbackController.ts
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // POST /api/feedback
  async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      const feedbackData = req.body;
      
      if (!feedbackData || !feedbackData.content) {
        res.status(400).json({
          success: false,
          message: 'Invalid feedback data'
        });
        return;
      }
      
      const feedback = await this.feedbackService.submitFeedback(feedbackData);
      
      res.status(201).json({
        success: true,
        data: feedback,
        message: 'Feedback submitted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        error: error.message
      });
    }
  }

  // GET /api/feedback/:id
  async getFeedbackById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const feedback = await this.feedbackService.getFeedbackById(id);
      if (!feedback) {
        res.status(404).json({
          success: false,
          message: 'Feedback not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: feedback,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get feedback',
        error: error.message
      });
    }
  }

  // PUT /api/feedback/:id/status
  async updateFeedbackStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required'
        });
        return;
      }
      
      const updatedFeedback = await this.feedbackService.updateFeedbackStatus(id, status);
      
      res.json({
        success: true,
        data: updatedFeedback,
        message: 'Feedback status updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update feedback status',
        error: error.message
      });
    }
  }

  // GET /api/feedback
  async listFeedbacks(req: Request, res: Response): Promise<void> {
    try {
      const filter = req.query as any;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const feedbacks = await this.feedbackService.listFeedbacks(filter, limit, offset);
      
      res.json({
        success: true,
        data: feedbacks,
        pagination: {
          limit,
          offset,
          total: await this.feedbackService.getFeedbackStats().then(stats => stats.totalFeedbacks)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to list feedbacks',
        error: error.message
      });
    }
  }

  // GET /api/feedback/stats
  async getFeedbackStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.feedbackService.getFeedbackStats();
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get feedback stats',
        error: error.message
      });
    }
  }

  // POST /api/feedback/:id/process
  async processFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const processedFeedback = await this.feedbackService.processFeedback(id);
      
      res.json({
        success: true,
        data: processedFeedback,
        message: 'Feedback processed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to process feedback',
        error: error.message
      });
    }
  }

  // GET /api/feedback/trends
  async analyzeFeedbackTrends(req: Request, res: Response): Promise<void> {
    try {
      const timeRange = req.query.timeRange as 'week' | 'month' | 'quarter' | 'year' || 'month';
      
      const trends = await this.feedbackService.analyzeFeedbackTrends(timeRange);
      
      res.json({
        success: true,
        data: trends,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to analyze feedback trends',
        error: error.message
      });
    }
  }

  // DELETE /api/feedback/:id
  async deleteFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.feedbackService.deleteFeedback(id);
      
      res.json({
        success: true,
        message: 'Feedback deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete feedback',
        error: error.message
      });
    }
  }
}
```

## 5. 数据持久化

### 5.1 数据库表设计

```sql
-- 用户反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('suggestion-quality', 'ui-ux', 'bug-report', 'feature-request', 'general-feedback', 'other')),
  target_id TEXT,
  target_type TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  metadata JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'validated', 'classified', 'analyzed', 'resolved', 'closed')),
  classification JSONB,
  analysis JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 反馈统计视图
CREATE VIEW feedback_stats AS
SELECT
  COUNT(*) AS total_feedbacks,
  AVG(rating) AS average_rating,
  COUNT(CASE WHEN status = 'new' THEN 1 END) AS new_feedbacks,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) AS resolved_feedbacks,
  COUNT(CASE WHEN classification->>'sentiment' = 'positive' THEN 1 END) AS positive_feedbacks,
  COUNT(CASE WHEN classification->>'sentiment' = 'negative' THEN 1 END) AS negative_feedbacks,
  COUNT(CASE WHEN classification->>'sentiment' = 'neutral' THEN 1 END) AS neutral_feedbacks
FROM feedbacks;

-- 索引
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_type ON feedbacks(type);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_target_id ON feedbacks(target_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_updated_at ON feedbacks(updated_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON feedbacks(rating);
```

### 5.2 反馈仓库实现

```typescript
// infrastructure/repositories/FeedbackRepository.ts
export interface FeedbackRepository {
  saveFeedback(feedback: Feedback): Promise<Feedback>;
  getFeedbackById(id: string): Promise<Feedback | null>;
  updateFeedback(feedback: Feedback): Promise<Feedback>;
  deleteFeedback(id: string): Promise<void>;
  listFeedbacks(filter?: {
    type?: FeedbackType;
    status?: FeedbackStatus;
    userId?: string;
    targetId?: string;
    targetType?: string;
  }, limit?: number, offset?: number): Promise<Feedback[]>;
  getFeedbackStats(): Promise<FeedbackStats>;
  getFeedbacksByTimeRange(timeRange: 'week' | 'month' | 'quarter' | 'year'): Promise<Feedback[]>;
}

// infrastructure/repositories/FeedbackRepositoryImpl.ts
export class FeedbackRepositoryImpl implements FeedbackRepository {
  constructor(private readonly db: Database) {}

  async saveFeedback(feedback: Feedback): Promise<Feedback> {
    await this.db.run(
      `INSERT INTO feedbacks 
       (id, user_id, type, target_id, target_type, content, rating, metadata, status, classification, analysis, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        feedback.id,
        feedback.userId,
        feedback.type,
        feedback.targetId || null,
        feedback.targetType || null,
        feedback.content,
        feedback.rating || null,
        JSON.stringify(feedback.metadata),
        feedback.status,
        JSON.stringify(feedback.classification || null),
        JSON.stringify(feedback.analysis || null),
        feedback.createdAt,
        feedback.updatedAt
      ]
    );
    
    return feedback;
  }

  async getFeedbackById(id: string): Promise<Feedback | null> {
    const result = await this.db.get<{
      id: string;
      user_id: string;
      type: string;
      target_id: string;
      target_type: string;
      content: string;
      rating: number;
      metadata: string;
      status: string;
      classification: string;
      analysis: string;
      created_at: Date;
      updated_at: Date;
    }>(
      'SELECT * FROM feedbacks WHERE id = ?',
      [id]
    );
    
    if (!result) {
      return null;
    }
    
    return this.mapDbResultToFeedback(result);
  }

  async updateFeedback(feedback: Feedback): Promise<Feedback> {
    await this.db.run(
      `UPDATE feedbacks 
       SET type = ?, target_id = ?, target_type = ?, content = ?, rating = ?, metadata = ?, status = ?, classification = ?, analysis = ?, updated_at = ? 
       WHERE id = ?`,
      [
        feedback.type,
        feedback.targetId || null,
        feedback.targetType || null,
        feedback.content,
        feedback.rating || null,
        JSON.stringify(feedback.metadata),
        feedback.status,
        JSON.stringify(feedback.classification || null),
        JSON.stringify(feedback.analysis || null),
        feedback.updatedAt,
        feedback.id
      ]
    );
    
    return feedback;
  }

  async deleteFeedback(id: string): Promise<void> {
    await this.db.run(
      'DELETE FROM feedbacks WHERE id = ?',
      [id]
    );
  }

  async listFeedbacks(filter?: {
    type?: FeedbackType;
    status?: FeedbackStatus;
    userId?: string;
    targetId?: string;
    targetType?: string;
  }, limit: number = 10, offset: number = 0): Promise<Feedback[]> {
    let query = 'SELECT * FROM feedbacks WHERE 1=1';
    const params: any[] = [];
    
    // 构建过滤条件
    if (filter?.type) {
      query += ' AND type = ?';
      params.push(filter.type);
    }
    
    if (filter?.status) {
      query += ' AND status = ?';
      params.push(filter.status);
    }
    
    if (filter?.userId) {
      query += ' AND user_id = ?';
      params.push(filter.userId);
    }
    
    if (filter?.targetId) {
      query += ' AND target_id = ?';
      params.push(filter.targetId);
    }
    
    if (filter?.targetType) {
      query += ' AND target_type = ?';
      params.push(filter.targetType);
    }
    
    // 添加排序和分页
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const results = await this.db.all<{
      id: string;
      user_id: string;
      type: string;
      target_id: string;
      target_type: string;
      content: string;
      rating: number;
      metadata: string;
      status: string;
      classification: string;
      analysis: string;
      created_at: Date;
      updated_at: Date;
    }>(query, params);
    
    return results.map(result => this.mapDbResultToFeedback(result));
  }

  async getFeedbackStats(): Promise<FeedbackStats> {
    const result = await this.db.get<{
      total_feedbacks: number;
      average_rating: number;
      new_feedbacks: number;
      resolved_feedbacks: number;
      positive_feedbacks: number;
      negative_feedbacks: number;
      neutral_feedbacks: number;
    }>('SELECT * FROM feedback_stats');
    
    if (!result) {
      return {
        totalFeedbacks: 0,
        feedbacksByType: {},
        feedbacksByStatus: {},
        averageRating: 0,
        sentimentDistribution: {
          positive: 0,
          negative: 0,
          neutral: 0
        },
        recentFeedbacks: 0,
        resolutionTime: {
          average: 0,
          median: 0
        }
      };
    }
    
    // 获取更多统计信息
    const feedbacksByType = await this.db.all<{
      type: string;
      count: number;
    }>('SELECT type, COUNT(*) as count FROM feedbacks GROUP BY type');
    
    const feedbacksByStatus = await this.db.all<{
      status: string;
      count: number;
    }>('SELECT status, COUNT(*) as count FROM feedbacks GROUP BY status');
    
    // 获取最近7天的反馈数量
    const recentFeedbacks = await this.db.get<{
      count: number;
    }>('SELECT COUNT(*) as count FROM feedbacks WHERE created_at >= datetime('now', '-7 days')');
    
    return {
      totalFeedbacks: result.total_feedbacks,
      feedbacksByType: feedbacksByType.reduce((acc, item) => {
        acc[item.type as FeedbackType] = item.count;
        return acc;
      }, {} as Record<FeedbackType, number>),
      feedbacksByStatus: feedbacksByStatus.reduce((acc, item) => {
        acc[item.status as FeedbackStatus] = item.count;
        return acc;
      }, {} as Record<FeedbackStatus, number>),
      averageRating: result.average_rating || 0,
      sentimentDistribution: {
        positive: result.positive_feedbacks || 0,
        negative: result.negative_feedbacks || 0,
        neutral: result.neutral_feedbacks || 0
      },
      recentFeedbacks: recentFeedbacks?.count || 0,
      resolutionTime: {
        average: 0, // 需要额外计算
        median: 0 // 需要额外计算
      }
    };
  }

  async getFeedbacksByTimeRange(timeRange: 'week' | 'month' | 'quarter' | 'year'): Promise<Feedback[]> {
    let timeExpr = '';
    switch (timeRange) {
      case 'week':
        timeExpr = '-7 days';
        break;
      case 'month':
        timeExpr = '-1 month';
        break;
      case 'quarter':
        timeExpr = '-3 months';
        break;
      case 'year':
        timeExpr = '-1 year';
        break;
    }
    
    const query = `SELECT * FROM feedbacks WHERE created_at >= datetime('now', ?) ORDER BY created_at DESC`;
    const results = await this.db.all<{
      id: string;
      user_id: string;
      type: string;
      target_id: string;
      target_type: string;
      content: string;
      rating: number;
      metadata: string;
      status: string;
      classification: string;
      analysis: string;
      created_at: Date;
      updated_at: Date;
    }>(query, [timeExpr]);
    
    return results.map(result => this.mapDbResultToFeedback(result));
  }

  private mapDbResultToFeedback(result: any): Feedback {
    return {
      id: result.id,
      userId: result.user_id,
      type: result.type as FeedbackType,
      targetId: result.target_id,
      targetType: result.target_type,
      content: result.content,
      rating: result.rating,
      metadata: JSON.parse(result.metadata),
      status: result.status as FeedbackStatus,
      classification: result.classification ? JSON.parse(result.classification) : undefined,
      analysis: result.analysis ? JSON.parse(result.analysis) : undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
  }
}
```

## 6. 测试策略

### 6.1 单元测试

```typescript
// test/unit/domain/collectors/DirectFeedbackCollector.test.ts
describe('DirectFeedbackCollector', () => {
  let collector: DirectFeedbackCollector;
  let feedbackRepo: jest.Mocked<FeedbackRepository>;
  let idGenerator: jest.Mocked<IdGenerator>;

  beforeEach(() => {
    feedbackRepo = {
      saveFeedback: jest.fn(),
      getFeedbackById: jest.fn(),
      updateFeedback: jest.fn(),
      deleteFeedback: jest.fn(),
      listFeedbacks: jest.fn(),
      getFeedbackStats: jest.fn(),
      getFeedbacksByTimeRange: jest.fn()
    } as any;
    
    idGenerator = {
      generate: jest.fn().mockReturnValue('test-feedback-id')
    } as any;
    
    collector = new DirectFeedbackCollector(feedbackRepo, idGenerator);
  });

  it('should collect and save feedback', async () => {
    // Arrange
    const feedbackData = {
      userId: 'test-user',
      type: 'suggestion-quality' as FeedbackType,
      targetId: 'test-suggestion',
      targetType: 'suggestion',
      content: 'This suggestion is very helpful!',
      rating: 5,
      metadata: {
        channel: 'direct',
        timestamp: new Date()
      }
    };
    
    const expectedFeedback: Feedback = {
      id: 'test-feedback-id',
      ...feedbackData,
      status: 'new',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    };
    
    feedbackRepo.saveFeedback.mockResolvedValue(expectedFeedback);
    
    // Act
    const result = await collector.collectFeedback(feedbackData);
    
    // Assert
    expect(feedbackRepo.saveFeedback).toHaveBeenCalledWith(expectedFeedback);
    expect(result).toEqual(expectedFeedback);
    expect(result.id).toBe('test-feedback-id');
    expect(result.status).toBe('new');
  });

  it('should return correct collector name', () => {
    expect(collector.getCollectorName()).toBe('direct');
  });

  it('should support all feedback types', () => {
    const supportedTypes = collector.getSupportedFeedbackTypes();
    expect(supportedTypes).toHaveLength(6);
    expect(supportedTypes).toContain('suggestion-quality');
    expect(supportedTypes).toContain('ui-ux');
    expect(supportedTypes).toContain('bug-report');
    expect(supportedTypes).toContain('feature-request');
    expect(supportedTypes).toContain('general-feedback');
    expect(supportedTypes).toContain('other');
  });
});
```

### 6.2 集成测试

```typescript
// test/integration/services/FeedbackService.test.ts
describe('FeedbackService Integration', () => {
  let service: FeedbackService;
  let db: Database;

  beforeAll(async () => {
    // 初始化数据库连接
    db = await initializeTestDatabase();
    
    // 创建依赖
    const idGenerator = new UUIDGenerator();
    const feedbackRepo = new FeedbackRepositoryImpl(db);
    const aiService = new AIServiceAdapterImpl();
    
    // 创建收集器
    const feedbackCollector = new DirectFeedbackCollector(feedbackRepo, idGenerator);
    
    // 创建处理器
    const processors: FeedbackProcessor[] = [
      new ValidationProcessor(),
      new ClassificationProcessor(aiService)
    ];
    
    // 创建分析器
    const feedbackAnalyzer = new FeedbackAnalyzerImpl(feedbackRepo, aiService);
    
    // 创建服务
    service = new FeedbackServiceImpl(
      feedbackCollector,
      processors,
      feedbackRepo,
      feedbackAnalyzer
    );
  });

  afterAll(async () => {
    // 清理数据库
    await db.close();
  });

  it('should submit and process feedback', async () => {
    // Arrange
    const feedbackData = {
      userId: 'test-user-1',
      type: 'suggestion-quality' as FeedbackType,
      targetId: 'test-suggestion-1',
      targetType: 'suggestion',
      content: 'This is a test feedback about a suggestion.',
      rating: 4,
      metadata: {
        channel: 'direct',
        timestamp: new Date()
      }
    };
    
    // Act
    const result = await service.submitFeedback(feedbackData);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.userId).toBe('test-user-1');
    expect(result.type).toBe('suggestion-quality');
    expect(result.content).toBe('This is a test feedback about a suggestion.');
    expect(result.rating).toBe(4);
    expect(result.status).toBe('classified'); // 经过验证和分类处理
    expect(result.classification).toBeDefined();
  });

  it('should retrieve feedback by id', async () => {
    // Arrange
    const feedbackData = {
      userId: 'test-user-2',
      type: 'ui-ux' as FeedbackType,
      content: 'Test UI/UX feedback',
      metadata: {
        channel: 'direct',
        timestamp: new Date()
      }
    };
    
    const submittedFeedback = await service.submitFeedback(feedbackData);
    
    // Act
    const retrievedFeedback = await service.getFeedbackById(submittedFeedback.id);
    
    // Assert
    expect(retrievedFeedback).toBeDefined();
    expect(retrievedFeedback?.id).toBe(submittedFeedback.id);
    expect(retrievedFeedback?.content).toBe('Test UI/UX feedback');
  });
});
```

## 7. 性能优化

### 7.1 缓存策略
- 反馈统计数据缓存 15 分钟
- 热门反馈趋势缓存 1 小时
- 使用 Redis 缓存频繁访问的反馈数据
- 缓存失效策略：当有新反馈提交或状态更新时，清除相关缓存

### 7.2 数据库优化
- 合理设计索引，加速查询
- 对大文本内容进行压缩存储
- 使用分页查询，避免一次返回大量数据
- 定期归档旧反馈数据，提高查询性能

### 7.3 异步处理
- 使用消息队列处理反馈的验证、分类和分析
- 异步发送反馈确认通知
- 批量处理反馈分析任务

### 7.4 反馈提交优化
- 客户端侧验证，减少无效请求
- 支持离线反馈提交
- 反馈内容自动保存草稿
- 优化表单提交体验，减少用户等待时间

## 8. 错误处理和日志

### 8.1 错误处理

```typescript
// application/errors/FeedbackErrors.ts
export class FeedbackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedbackError';
  }
}

export class FeedbackNotFoundError extends FeedbackError {
  constructor(id: string) {
    super(`Feedback not found: ${id}`);
    this.name = 'FeedbackNotFoundError';
  }
}

export class InvalidFeedbackError extends FeedbackError {
  constructor(message: string) {
    super(`Invalid feedback: ${message}`);
    this.name = 'InvalidFeedbackError';
  }
}

export class FeedbackProcessingError extends FeedbackError {
  constructor(id: string, cause: Error) {
    super(`Failed to process feedback ${id}: ${cause.message}`);
    this.name = 'FeedbackProcessingError';
    this.cause = cause;
  }
}

export class FeedbackAnalysisError extends FeedbackError {
  constructor(cause: Error) {
    super(`Failed to analyze feedback: ${cause.message}`);
    this.name = 'FeedbackAnalysisError';
    this.cause = cause;
  }
}
```

### 8.2 日志记录

```typescript
// application/middleware/FeedbackLoggingMiddleware.ts
export class FeedbackLoggingMiddleware {
  constructor(private readonly logger: Logger) {}

  logFeedbackRequest(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { type } = req.body;
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.info('Feedback request processed', {
        type,
        status: res.statusCode,
        duration: `${duration}ms`,
        method: req.method,
        url: req.originalUrl
      });
    });
    
    next();
  }

  logFeedbackError(err: Error, req: Request, res: Response, next: NextFunction) {
    const { type } = req.body;
    
    this.logger.error('Feedback error', {
      type,
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
  feedback-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=sqlite:///app/data/feedback.db
      - CACHE_TTL=900000 # 15分钟
      - LOG_LEVEL=info
      - AI_SERVICE_URL=http://ai-service:5000
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    depends_on:
      - database
      - ai-service
      - redis

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

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
    restart: unless-stopped
```

### 9.2 监控指标

```typescript
// application/metrics/FeedbackMetrics.ts
export class FeedbackMetrics {
  constructor(private readonly metricsClient: MetricsClient) {}

  recordFeedbackSubmission(
    type: FeedbackType,
    channel: string,
    duration: number,
    success: boolean
  ) {
    this.metricsClient.histogram('feedback.submission.duration', duration, {
      type,
      channel,
      success: success.toString()
    });
    
    this.metricsClient.counter('feedback.submission.count', 1, {
      type,
      channel,
      success: success.toString()
    });
  }

  recordFeedbackProcessing(
    processorName: string,
    duration: number,
    success: boolean
  ) {
    this.metricsClient.histogram('feedback.processing.duration', duration, {
      processor: processorName,
      success: success.toString()
    });
    
    this.metricsClient.counter('feedback.processing.count', 1, {
      processor: processorName,
      success: success.toString()
    });
  }

  recordFeedbackAnalysis(
    analysisType: string,
    duration: number,
    success: boolean
  ) {
    this.metricsClient.histogram('feedback.analysis.duration', duration, {
      type: analysisType,
      success: success.toString()
    });
    
    this.metricsClient.counter('feedback.analysis.count', 1, {
      type: analysisType,
      success: success.toString()
    });
  }

  recordFeedbackStatsCacheHit() {
    this.metricsClient.counter('feedback.stats.cache.hit', 1);
  }

  recordFeedbackStatsCacheMiss() {
    this.metricsClient.counter('feedback.stats.cache.miss', 1);
  }
}
```

## 10. 结论

### 10.1 设计亮点
- 遵循 Clean Architecture 原则，实现了清晰的分层设计
- 采用策略模式，支持多种反馈收集渠道和处理流程
- 实现了完整的反馈生命周期管理：收集、验证、分类、分析、应用
- 支持实时反馈分析和趋势洞察
- 提供了丰富的 API 接口，方便集成和扩展
- 实现了完善的错误处理和日志记录
- 支持性能优化和监控

### 10.2 未来扩展方向
- 支持更多反馈收集渠道，如社交媒体、聊天机器人等
- 实现更高级的反馈分析功能，如主题建模、情感分析等
- 支持反馈的自动路由和分配
- 实现反馈的可视化仪表盘
- 支持反馈的 A/B 测试
- 实现反馈的自动化响应
- 支持反馈的预测分析

### 10.3 关键成功因素
- 反馈收集流程的易用性和便捷性
- 反馈处理的及时性和准确性
- 反馈分析的深度和实用性
- 反馈结果的有效应用和闭环
- 系统的性能和可靠性
- 良好的用户体验

通过本技术实现文档，我们构建了一个完整的用户反馈系统，能够有效收集、处理、分析和应用用户反馈。该系统具有良好的扩展性和可维护性，能够支持未来的功能扩展和性能优化，有助于持续改进产品和服务质量。