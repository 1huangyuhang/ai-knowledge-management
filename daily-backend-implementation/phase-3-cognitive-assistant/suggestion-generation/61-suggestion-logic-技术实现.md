# 61-建议生成逻辑技术实现文档

## 1. 概述

建议生成模块是AI认知辅助系统的核心功能之一，负责基于用户的认知模型和当前状态，生成个性化的思考建议和反馈。本模块通过分析用户的认知结构、识别盲点和差距，提供有针对性的改进建议，帮助用户优化思维方式和认知结构。

## 2. 架构设计

### 2.1 模块定位

建议生成模块位于系统的AI能力层，与认知解析、模型演化等模块紧密协作，接收来自领域层的认知模型数据，输出结构化的建议信息。

### 2.2 分层架构

```
┌─────────────────────────┐
│   Presentation Layer    │
└─────────────┬───────────┘
              │
┌─────────────▼───────────┐
│  Application Layer      │
└─────────────┬───────────┘
              │
┌─────────────▼───────────┐
│     Domain Layer        │
└─────────────┬───────────┘
              │
┌─────────────▼───────────┐
│    AI Capability Layer  │
│  ┌───────────────────┐  │
│  │ Suggestion        │  │
│  │ Generation        │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Cognitive         │  │
│  │ Analysis          │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Model Evolution   │  │
│  └───────────────────┘  │
└─────────────┬───────────┘
              │
┌─────────────▼───────────┐
│  Infrastructure Layer   │
└─────────────────────────┘
```

### 2.3 核心组件

| 组件名称 | 功能描述 |
|---------|---------|
| 建议引擎 | 核心决策逻辑，生成个性化建议 |
| 规则引擎 | 基于预定义规则筛选和排序建议 |
| 优先级计算器 | 计算建议的优先级和重要性 |
| 个性化适配器 | 根据用户历史调整建议风格 |
| 反馈收集器 | 收集用户对建议的反馈 |

## 3. 核心算法

### 3.1 建议生成流程

1. **输入收集**：获取用户认知模型、当前思考主题、历史交互记录
2. **认知分析**：识别认知盲点、概念缺口、关系薄弱点（详细的认知分析请参考 [认知解析器](../cognitive-relation/41-cognitive-parser.md) 相关文档）
3. **建议生成**：基于分析结果生成初始建议集
4. **规则过滤**：应用业务规则筛选不适合的建议
5. **优先级排序**：根据重要性、紧急性、用户偏好排序
6. **个性化调整**：根据用户历史反馈调整建议风格
7. **输出格式化**：生成结构化的建议输出

### 3.2 盲点识别算法

采用基于图论的算法识别认知结构中的盲点：

```
1. 构建认知概念图
2. 计算节点中心性和连接度
3. 识别孤立节点和弱连接区域
4. 分析概念间的路径长度
5. 确定潜在的认知盲点
```

### 3.3 建议优先级算法

建议优先级计算公式：

```
Priority = (Impact × Urgency × Relevance) + (UserPreference × HistoryWeight)
```

其中：
- **Impact**：建议对认知结构的影响程度 (0-10)
- **Urgency**：建议的紧急程度 (0-10)
- **Relevance**：建议与当前思考主题的相关性 (0-10)
- **UserPreference**：用户对类似建议的历史偏好 (0-10)
- **HistoryWeight**：历史反馈的权重系数 (0.1-1.0)

## 4. 实现细节

### 4.1 数据模型

#### 4.1.1 建议数据结构

```typescript
interface Suggestion {
  id: string;
  type: SuggestionType;
  content: string;
  description: string;
  priority: number;
  confidence: number;
  relatedConcepts: string[];
  actionItems: string[];
  category: SuggestionCategory;
  timestamp: Date;
  metadata: Record<string, any>;
}

enum SuggestionType {
  CONCEPT_EXPANSION = "concept_expansion",
  RELATION_STRENGTHENING = "relation_strengthening",
  BLINDSPOT_REVEAL = "blindspot_reveal",
  PERSPECTIVE_SHIFT = "perspective_shift",
  KNOWLEDGE_INTEGRATION = "knowledge_integration"
}

enum SuggestionCategory {
  STRUCTURAL = "structural",
  CONTENT = "content",
  PROCESS = "process",
  METACOGNITIVE = "metacognitive"
}
```

#### 4.1.2 反馈数据结构

```typescript
interface SuggestionFeedback {
  suggestionId: string;
  userId: string;
  rating: number; // 1-5
  helpful: boolean;
  comment?: string;
  applied: boolean;
  impact?: number; // 1-5
  timestamp: Date;
}
```

### 4.2 核心功能实现

#### 4.2.1 建议引擎

建议引擎是模块的核心组件，负责协调各子组件生成建议：

```typescript
class SuggestionEngine {
  constructor(
    private cognitiveAnalyzer: CognitiveAnalyzer,
    private ruleEngine: RuleEngine,
    private priorityCalculator: PriorityCalculator,
    private personalizationAdapter: PersonalizationAdapter
  ) {}

  async generateSuggestions(
    userId: string,
    cognitiveModel: CognitiveModel,
    currentContext: Context
  ): Promise<Suggestion[]> {
    // 1. 认知分析
    const analysisResult = await this.cognitiveAnalyzer.analyze(cognitiveModel, currentContext);
    
    // 2. 生成初始建议集
    const initialSuggestions = this.generateInitialSuggestions(analysisResult, cognitiveModel);
    
    // 3. 规则过滤
    const filteredSuggestions = await this.ruleEngine.filter(initialSuggestions, userId);
    
    // 4. 优先级排序
    const prioritizedSuggestions = this.priorityCalculator.calculate(filteredSuggestions, userId);
    
    // 5. 个性化调整
    const personalizedSuggestions = await this.personalizationAdapter.adapt(prioritizedSuggestions, userId);
    
    return personalizedSuggestions;
  }
  
  // 其他方法...
}
```

#### 4.2.2 规则引擎

规则引擎负责应用预定义规则筛选和优化建议：

```typescript
class RuleEngine {
  private rules: SuggestionRule[];
  
  constructor(rules: SuggestionRule[]) {
    this.rules = rules;
  }
  
  async filter(suggestions: Suggestion[], userId: string): Promise<Suggestion[]> {
    let filteredSuggestions = [...suggestions];
    
    for (const rule of this.rules) {
      filteredSuggestions = await rule.apply(filteredSuggestions, userId);
    }
    
    return filteredSuggestions;
  }
  
  // 其他方法...
}
```

## 5. API设计

### 5.1 内部API

#### 5.1.1 生成建议

```typescript
interface GenerateSuggestionsParams {
  userId: string;
  cognitiveModel: CognitiveModel;
  currentContext: Context;
  limit?: number;
  categories?: SuggestionCategory[];
}

interface GenerateSuggestionsResult {
  suggestions: Suggestion[];
  analysisSummary: AnalysisSummary;
  timestamp: Date;
}
```

#### 5.1.2 记录反馈

```typescript
interface RecordFeedbackParams {
  suggestionId: string;
  userId: string;
  rating: number;
  helpful: boolean;
  comment?: string;
  applied: boolean;
  impact?: number;
}

interface RecordFeedbackResult {
  success: boolean;
  feedbackId: string;
  timestamp: Date;
}
```

### 5.2 外部API

#### 5.2.1 获取建议

```
GET /api/v1/suggestions
```

**参数：**
- `userId`: 用户ID
- `limit`: 建议数量限制（默认5）
- `categories`: 建议类别过滤
- `context`: 当前上下文信息

**响应：**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "id": "sug-12345",
        "type": "blindspot_reveal",
        "content": "考虑将'系统思维'概念与您现有的'认知模型'概念建立更紧密的联系",
        "description": "您的认知模型中，'系统思维'与'认知模型'之间的连接较弱，这可能导致您在分析复杂问题时缺乏整体视角。",
        "priority": 8.5,
        "confidence": 0.92,
        "relatedConcepts": ["系统思维", "认知模型"],
        "actionItems": ["阅读关于系统思维与认知模型关系的文献", "尝试用系统思维分析一个复杂问题"],
        "category": "structural",
        "timestamp": "2026-01-09T14:30:00Z"
      }
      // 更多建议...
    ],
    "analysisSummary": {
      "blindspotsIdentified": 3,
      "weakRelations": 5,
      "suggestionsGenerated": 10
    }
  },
  "timestamp": "2026-01-09T14:30:00Z"
}
```

#### 5.2.2 提交反馈

```
POST /api/v1/suggestions/:suggestionId/feedback
```

**请求体：**
```json
{
  "userId": "user-12345",
  "rating": 5,
  "helpful": true,
  "comment": "这个建议很有启发性，帮助我看到了自己认知中的盲点。",
  "applied": true,
  "impact": 4
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "feedbackId": "fb-67890",
    "timestamp": "2026-01-09T14:35:00Z"
  },
  "timestamp": "2026-01-09T14:35:00Z"
}
```

## 6. 测试策略

### 6.1 单元测试

- **测试范围**：核心算法、数据模型、工具函数
- **测试框架**：Jest
- **覆盖率目标**：≥90%

### 6.2 集成测试

- **测试范围**：组件间协作、API接口
- **测试框架**：Jest + Supertest
- **覆盖率目标**：≥80%

### 6.3 端到端测试

- **测试范围**：完整的建议生成流程
- **测试框架**：Cypress
- **测试场景**：
  - 生成个性化建议
  - 提交反馈后建议调整
  - 不同上下文下的建议变化

### 6.4 性能测试

- **测试目标**：建议生成响应时间 < 500ms
- **测试工具**：Artillery
- **测试场景**：
  - 高并发请求
  - 大规模认知模型处理
  - 长时间运行稳定性

## 7. 性能优化

### 7.1 缓存策略

- 缓存认知分析结果，减少重复计算
- 缓存高频建议模板，加速生成过程
- 使用Redis实现分布式缓存

### 7.2 异步处理

- 采用异步IO处理外部依赖
- 使用消息队列处理耗时操作
- 实现建议预生成机制

### 7.3 算法优化

- 优化认知图算法，降低时间复杂度
- 实现增量更新机制，避免全量计算
- 使用近似算法处理大规模数据

## 8. 部署说明

### 8.1 依赖要求

| 依赖 | 版本 | 用途 |
|------|------|------|
| Node.js | ≥18.0.0 | 运行环境 |
| TypeScript | ≥5.0.0 | 开发语言 |
| Redis | ≥7.0.0 | 缓存服务 |
| PostgreSQL | ≥14.0.0 | 数据存储 |

### 8.2 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  API Gateway    │───▶│  Suggestion     │───▶│  Cognitive      │
│                 │    │  Generation     │    │  Model DB       │
└─────────────────┘    │  Service        │    └─────────────────┘
                        └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Redis Cache    │
                        └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Feedback DB    │
                        └─────────────────┘
```

### 8.3 环境配置

| 环境变量 | 描述 | 默认值 |
|---------|------|-------|
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 服务端口 | `3000` |
| `REDIS_URL` | Redis连接URL | `redis://localhost:6379` |
| `DB_URL` | 数据库连接URL | `postgres://localhost:5432/suggestions` |
| `LOG_LEVEL` | 日志级别 | `info` |
| `SUGGESTION_LIMIT` | 默认建议数量 | `5` |

## 9. 监控与维护

### 9.1 监控指标

- 建议生成成功率
- 建议生成响应时间
- 建议采纳率
- 系统资源使用率
- 错误率和异常情况

### 9.2 日志记录

- 使用Pino实现结构化日志
- 记录关键操作和决策点
- 实现日志分级和采样机制
- 集成ELK或类似日志分析平台

### 9.3 维护流程

- 定期更新建议规则和模板
- 分析用户反馈，优化算法
- 监控系统性能，及时调整配置
- 定期备份数据，确保数据安全

## 10. 未来演进

### 10.1 功能增强

- 支持多模态建议输出
- 实现实时建议生成
- 增加建议的可解释性
- 支持建议的个性化定制

### 10.2 技术演进

- 探索使用强化学习优化建议生成
- 实现自适应算法，自动调整策略
- 支持分布式部署，提高系统可扩展性
- 集成更多外部知识源，丰富建议内容

## 11. 总结

建议生成模块通过先进的算法和架构设计，实现了个性化、高质量的思考建议生成。该模块具有以下特点：

- **个性化**：基于用户认知模型生成定制化建议
- **高质量**：经过多轮筛选和优化的建议内容
- **高效性**：快速响应，支持高并发请求
- **可扩展**：模块化设计，便于功能扩展
- **可维护**：清晰的架构和详细的文档

通过不断优化和演进，建议生成模块将成为AI认知辅助系统的核心竞争力，帮助用户持续优化认知结构，提升思维能力。

## 12. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |
