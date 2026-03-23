# 58-性能优化技术实现文档

## 1. 性能优化概述

### 1.1 功能定位
性能优化模块负责识别和解决系统中的性能瓶颈，提高系统的响应速度、吞吐量和资源利用率，确保系统在高负载下仍能稳定运行。

### 1.2 设计原则
- **数据驱动**：基于实际性能数据进行优化决策
- **渐进式优化**：从瓶颈点开始，逐步优化整个系统
- **全面优化**：覆盖代码、数据库、缓存、网络等各个层面
- **可测量**：优化前后的性能变化可量化
- **可持续**：建立性能监控和调优的长效机制

### 1.3 核心组件
- 性能分析工具
- 代码优化框架
- 缓存系统
- 异步处理机制
- 性能监控与告警

## 2. 性能分析方法

### 2.1 性能指标定义

| 指标类型 | 具体指标 | 目标值 | 说明 |
|----------|----------|--------|------|
| 响应时间 | API响应时间 | < 200ms | 95%的请求响应时间 |
| 吞吐量 | QPS (Queries Per Second) | > 100 | 每秒处理的请求数 |
| 并发数 | 并发连接数 | > 500 | 同时处理的连接数 |
| 资源利用率 | CPU使用率 | < 70% | 平均CPU使用率 |
| 资源利用率 | 内存使用率 | < 80% | 平均内存使用率 |
| 错误率 | 请求错误率 | < 0.1% | 错误请求占总请求的比例 |

### 2.2 性能分析工具

| 工具 | 用途 | 版本 |
|------|------|------|
| Node.js Profiler | Node.js应用性能分析 | 内置 |
| Clinic.js | Node.js应用性能诊断 | ^12.0.0 |
| New Relic | 应用性能监控 | ^10.0.0 |
| Elastic APM | 分布式追踪和性能监控 | ^4.0.0 |
| PostgreSQL EXPLAIN | 数据库查询性能分析 | 内置 |
| Redis CLI | Redis性能监控 | 内置 |
| Qdrant Dashboard | 向量数据库性能监控 | 内置 |

### 2.3 性能分析流程

1. **确立性能基准**：测量当前系统的性能指标，建立基准线
2. **识别瓶颈**：使用性能分析工具定位性能瓶颈
3. **分析原因**：深入分析瓶颈产生的根本原因
4. **制定优化方案**：根据分析结果制定优化方案
5. **实施优化**：按照优化方案进行代码或配置修改
6. **验证效果**：重新测量性能指标，验证优化效果
7. **持续监控**：建立持续监控机制，防止性能退化

## 3. 各模块性能优化策略

### 3.1 认知关系模块优化

#### 3.1.1 概念提取优化

```typescript
// 优化前：同步提取概念
function extractConcepts(text: string): Concept[] {
  // 同步调用LLM，阻塞执行
  const response = openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `Extract concepts from: ${text}` }]
  });
  return JSON.parse(response.choices[0].message.content || "[]");
}

// 优化后：异步提取概念，支持批量处理
async function extractConcepts(texts: string[]): Promise<Concept[][]> {
  // 1. 批量处理，减少API调用次数
  // 2. 异步执行，不阻塞主线程
  // 3. 添加缓存，避免重复提取
  const batchSize = 5;
  const results: Concept[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const promises = batch.map(async (text) => {
      // 检查缓存
      const cacheKey = `concepts:${hash(text)}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // 调用LLM API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `Extract concepts from: ${text}` }],
        temperature: 0.1 // 降低随机性，提高缓存命中率
      });
      
      const concepts = JSON.parse(response.choices[0].message.content || "[]");
      
      // 缓存结果
      await cache.set(cacheKey, JSON.stringify(concepts), { ttl: 3600 });
      
      return concepts;
    });
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }
  
  return results;
}
```

#### 3.1.2 关系推断优化

```typescript
// 优化前：每次都重新计算关系
function inferRelations(concepts: Concept[]): Relation[] {
  // 计算所有概念对之间的相似度
  const relations: Relation[] = [];
  for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      const similarity = calculateSimilarity(concepts[i], concepts[j]);
      if (similarity > 0.5) {
        relations.push({
          sourceId: concepts[i].id,
          targetId: concepts[j].id,
          type: "related",
          confidence: similarity
        });
      }
    }
  }
  return relations;
}

// 优化后：使用向量索引加速相似度计算
async function inferRelations(concepts: Concept[]): Promise<Relation[]> {
  // 1. 使用向量数据库索引加速相似度计算
  // 2. 只计算最相关的概念对
  // 3. 并行计算
  const relations: Relation[] = [];
  
  const promises = concepts.map(async (concept) => {
    // 从向量数据库中查询最相似的概念
    const similarConcepts = await vectorDB.query({
      vector: concept.embedding,
      limit: 5, // 只查询前5个最相似的概念
      scoreThreshold: 0.5
    });
    
    return similarConcepts.map((result) => ({
      sourceId: concept.id,
      targetId: result.id,
      type: "related",
      confidence: result.score
    }));
  });
  
  const results = await Promise.all(promises);
  return results.flat();
}
```

### 3.2 模型演化模块优化

#### 3.2.1 模型更新优化

```typescript
// 优化前：每次更新都重新构建整个模型
function updateModel(concepts: Concept[], relations: Relation[]): CognitiveModel {
  // 重新构建整个模型
  const model: CognitiveModel = {
    id: generateId(),
    version: "1.0.0",
    concepts,
    relations,
    timestamp: Date.now()
  };
  
  // 保存到数据库
  return saveModelToDatabase(model);
}

// 优化后：增量更新模型
async function updateModel(existingModel: CognitiveModel, newConcepts: Concept[], newRelations: Relation[]): Promise<CognitiveModel> {
  // 1. 增量更新，只处理变化的部分
  // 2. 异步执行，不阻塞主线程
  // 3. 使用事务确保数据一致性
  
  // 合并概念
  const conceptMap = new Map(existingModel.concepts.map(c => [c.id, c]));
  newConcepts.forEach(concept => conceptMap.set(concept.id, concept));
  
  // 合并关系
  const relationKey = (r: Relation) => `${r.sourceId}:${r.targetId}:${r.type}`;
  const relationMap = new Map(existingModel.relations.map(r => [relationKey(r), r]));
  newRelations.forEach(relation => relationMap.set(relationKey(relation), relation));
  
  // 创建新模型
  const updatedModel: CognitiveModel = {
    ...existingModel,
    id: generateId(),
    version: incrementVersion(existingModel.version),
    concepts: Array.from(conceptMap.values()),
    relations: Array.from(relationMap.values()),
    timestamp: Date.now()
  };
  
  // 使用事务保存到数据库
  await database.transaction(async (tx) => {
    await tx.saveModel(updatedModel);
    await tx.updateModelHistory(existingModel.id, updatedModel.id);
  });
  
  return updatedModel;
}
```

#### 3.2.2 版本管理优化

```typescript
// 优化前：每次查询都返回完整模型数据
function getModelVersion(versionId: string): CognitiveModel {
  // 查询并返回完整模型数据
  return database.getModelById(versionId);
}

// 优化后：支持部分字段查询和懒加载
async function getModelVersion(versionId: string, fields?: string[]): Promise<Partial<CognitiveModel>> {
  // 1. 支持部分字段查询，减少数据传输
  // 2. 大型字段（如向量）懒加载
  // 3. 缓存常用版本
  
  // 检查缓存
  const cacheKey = `model:${versionId}:${fields?.join(',') || 'all'}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 查询数据库，只获取指定字段
  const model = await database.getModelById(versionId, fields);
  
  // 缓存结果
  await cache.set(cacheKey, JSON.stringify(model), { ttl: 7200 });
  
  return model;
}
```

### 3.3 认知反馈模块优化

#### 3.3.1 洞察生成优化

```typescript
// 优化前：同步生成所有洞察
function generateInsights(model: CognitiveModel): Insight[] {
  const insights: Insight[] = [];
  
  // 生成各种类型的洞察
  insights.push(...generateThemeInsights(model));
  insights.push(...generateBlindspotInsights(model));
  insights.push(...generateGapInsights(model));
  
  return insights;
}

// 优化后：异步并行生成洞察，支持缓存
async function generateInsights(model: CognitiveModel): Promise<Insight[]> {
  // 1. 异步并行生成不同类型的洞察
  // 2. 缓存生成结果
  // 3. 支持洞察类型过滤
  
  // 检查缓存
  const cacheKey = `insights:${model.id}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 并行生成不同类型的洞察
  const [themeInsights, blindspotInsights, gapInsights] = await Promise.all([
    generateThemeInsights(model),
    generateBlindspotInsights(model),
    generateGapInsights(model)
  ]);
  
  const insights = [...themeInsights, ...blindspotInsights, ...gapInsights];
  
  // 缓存结果
  await cache.set(cacheKey, JSON.stringify(insights), { ttl: 1800 });
  
  return insights;
}
```

#### 3.3.2 反馈格式化优化

```typescript
// 优化前：同步格式化所有反馈
function formatFeedback(insights: Insight[], format: FeedbackFormat): string {
  switch (format) {
    case FeedbackFormat.MARKDOWN:
      return formatAsMarkdown(insights);
    case FeedbackFormat.HTML:
      return formatAsHtml(insights);
    case FeedbackFormat.JSON:
      return JSON.stringify(insights);
    default:
      return formatAsPlainText(insights);
  }
}

// 优化后：使用模板缓存和异步格式化
async function formatFeedback(insights: Insight[], format: FeedbackFormat): string {
  // 1. 缓存格式化模板
  // 2. 异步执行，支持大型反馈生成
  // 3. 预编译常用格式的模板
  
  // 获取预编译的模板
  const template = await getTemplate(format);
  
  // 使用模板引擎格式化
  return template.render({ insights });
}

// 模板管理
class TemplateManager {
  private templates: Map<FeedbackFormat, any> = new Map();
  private templateCache: Map<string, string> = new Map();
  
  async getTemplate(format: FeedbackFormat): Promise<any> {
    if (this.templates.has(format)) {
      return this.templates.get(format);
    }
    
    // 加载并编译模板
    const templateContent = await this.loadTemplate(format);
    const template = compileTemplate(templateContent);
    
    this.templates.set(format, template);
    return template;
  }
  
  private async loadTemplate(format: FeedbackFormat): Promise<string> {
    const cacheKey = `template:${format}`;
    
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }
    
    // 从文件或数据库加载模板
    const templateContent = await fs.readFile(`templates/${format}.hbs`, 'utf-8');
    this.templateCache.set(cacheKey, templateContent);
    
    return templateContent;
  }
}
```

## 4. 代码级优化

### 4.1 算法优化

#### 4.1.1 复杂度优化

```typescript
// 优化前：O(n^2)复杂度的嵌套循环
function findDuplicateConcepts(concepts: Concept[]): Concept[] {
  const duplicates: Concept[] = [];
  
  for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      if (concepts[i].name === concepts[j].name) {
        duplicates.push(concepts[j]);
      }
    }
  }
  
  return duplicates;
}

// 优化后：O(n)复杂度的哈希表查找
function findDuplicateConcepts(concepts: Concept[]): Concept[] {
  const nameMap = new Map<string, Concept>();
  const duplicates: Concept[] = [];
  
  for (const concept of concepts) {
    if (nameMap.has(concept.name)) {
      duplicates.push(concept);
    } else {
      nameMap.set(concept.name, concept);
    }
  }
  
  return duplicates;
}
```

#### 4.1.2 内存优化

```typescript
// 优化前：创建大量临时对象
function processLargeDataset(data: any[]): any[] {
  return data.map(item => {
    return {
      id: item.id,
      name: item.name,
      processed: true,
      timestamp: Date.now(),
      // 其他派生字段
    };
  });
}

// 优化后：复用对象，减少内存分配
function processLargeDataset(data: any[]): any[] {
  const result: any[] = [];
  const timestamp = Date.now(); // 只计算一次
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    // 直接修改原对象或复用对象池中的对象
    result.push({
      id: item.id,
      name: item.name,
      processed: true,
      timestamp
    });
  }
  
  return result;
}
```

### 4.2 异步编程优化

#### 4.2.1 Promise优化

```typescript
// 优化前：串行执行异步操作
async function processItems(items: any[]): Promise<any[]> {
  const results: any[] = [];
  
  for (const item of items) {
    const result = await processItem(item);
    results.push(result);
  }
  
  return results;
}

// 优化后：并行执行异步操作，控制并发数
async function processItems(items: any[], concurrency: number = 5): Promise<any[]> {
  const results: any[] = [];
  const executing: Promise<any>[] = [];
  
  for (const item of items) {
    const promise = processItem(item);
    results.push(promise);
    
    const execute = promise.then(() => {
      executing.splice(executing.indexOf(execute), 1);
    });
    
    executing.push(execute);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}
```

#### 4.2.2 使用Stream处理大数据

```typescript
// 优化前：一次性加载整个文件
function processLargeFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        return reject(err);
      }
      
      const lines = data.split('\n');
      const results = lines.map(line => JSON.parse(line));
      resolve(results);
    });
  });
}

// 优化后：使用Stream逐行处理
function processLargeFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const reader = readline.createInterface({ input: stream });
    
    reader.on('line', (line) => {
      try {
        const data = JSON.parse(line);
        results.push(data);
      } catch (err) {
        console.error('Error parsing line:', err);
      }
    });
    
    reader.on('close', () => {
      resolve(results);
    });
    
    reader.on('error', (err) => {
      reject(err);
    });
  });
}
```

## 5. 数据库优化

### 5.1 SQLite优化

#### 5.1.1 索引优化

```sql
-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_concepts_name ON concepts(name);
CREATE INDEX IF NOT EXISTS idx_relations_source_target ON relations(source_id, target_id);
CREATE INDEX IF NOT EXISTS idx_models_timestamp ON models(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(type);
```

#### 5.1.2 查询优化

```typescript
// 优化前：多次查询数据库
async function getModelWithDetails(modelId: string): Promise<any> {
  const model = await database.getModelById(modelId);
  const concepts = await database.getConceptsByModelId(modelId);
  const relations = await database.getRelationsByModelId(modelId);
  const insights = await database.getInsightsByModelId(modelId);
  
  return {
    ...model,
    concepts,
    relations,
    insights
  };
}

// 优化后：使用JOIN减少查询次数
async function getModelWithDetails(modelId: string): Promise<any> {
  // 使用JOIN查询一次性获取所有相关数据
  const result = await database.query(`
    SELECT m.*, c.*, r.*, i.*
    FROM models m
    LEFT JOIN concepts c ON m.id = c.model_id
    LEFT JOIN relations r ON m.id = r.model_id
    LEFT JOIN insights i ON m.id = i.model_id
    WHERE m.id = ?
  `, [modelId]);
  
  // 处理查询结果，构建完整模型
  return buildModelFromQueryResult(result);
}
```

### 5.2 向量数据库优化

#### 5.2.1 索引优化

```typescript
// 创建优化的向量索引
await vectorDB.createIndex({
  collectionName: 'concepts',
  indexConfig: {
    metric: 'cosine', // 相似度度量
    hnswConfig: {
      m: 16, // 每个节点的邻居数
      efConstruction: 100, // 构建索引时的搜索范围
      efSearch: 50 // 查询时的搜索范围
    }
  }
});
```

#### 5.2.2 查询优化

```typescript
// 优化前：返回所有匹配结果
async function searchSimilarConcepts(vector: number[], limit: number = 10): Promise<any[]> {
  return vectorDB.query({
    vector,
    limit,
    scoreThreshold: 0.0
  });
}

// 优化后：设置合理的相似度阈值，减少返回结果
async function searchSimilarConcepts(vector: number[], limit: number = 10): Promise<any[]> {
  return vectorDB.query({
    vector,
    limit,
    scoreThreshold: 0.5, // 只返回相似度大于0.5的结果
    includeVectors: false // 不返回向量数据，减少网络传输
  });
}
```

## 6. 缓存策略

### 6.1 多级缓存设计

```typescript
// 多级缓存实现
class MultiLevelCache {
  private localCache: Map<string, { value: any; timestamp: number }>;
  private redisCache: RedisClient;
  private ttl: number;
  
  constructor(redisCache: RedisClient, ttl: number = 3600) {
    this.localCache = new Map();
    this.redisCache = redisCache;
    this.ttl = ttl;
  }
  
  async get(key: string): Promise<any | null> {
    // 1. 先查询本地缓存
    const localValue = this.localCache.get(key);
    if (localValue && Date.now() - localValue.timestamp < this.ttl) {
      return localValue.value;
    }
    
    // 2. 本地缓存未命中，查询Redis缓存
    const redisValue = await this.redisCache.get(key);
    if (redisValue) {
      const parsedValue = JSON.parse(redisValue);
      // 更新本地缓存
      this.localCache.set(key, { value: parsedValue, timestamp: Date.now() });
      return parsedValue;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const effectiveTtl = ttl || this.ttl;
    
    // 1. 更新本地缓存
    this.localCache.set(key, { value, timestamp: Date.now() });
    
    // 2. 更新Redis缓存
    await this.redisCache.set(key, JSON.stringify(value), 'EX', effectiveTtl);
  }
  
  async delete(key: string): Promise<void> {
    // 1. 删除本地缓存
    this.localCache.delete(key);
    
    // 2. 删除Redis缓存
    await this.redisCache.del(key);
  }
}
```

### 6.2 缓存失效策略

```typescript
// 实现缓存失效策略
class CacheInvalidator {
  private cache: MultiLevelCache;
  
  constructor(cache: MultiLevelCache) {
    this.cache = cache;
  }
  
  // 直接失效
  async invalidate(key: string): Promise<void> {
    await this.cache.delete(key);
  }
  
  // 批量失效
  async invalidateBatch(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.cache.delete(key)));
  }
  
  // 模式匹配失效
  async invalidatePattern(pattern: string): Promise<void> {
    // 实现基于模式的缓存失效
    // 例如：invalidatePattern('model:*') 失效所有模型相关缓存
  }
  
  // 定时失效
  scheduleInvalidation(key: string, delay: number): NodeJS.Timeout {
    return setTimeout(() => {
      this.cache.delete(key);
    }, delay);
  }
}
```

## 7. 异步处理机制

### 7.1 消息队列集成

```typescript
// 消息队列配置与使用
class MessageQueue {
  private client: any;
  private queues: Set<string> = new Set();
  
  constructor() {
    this.client = new MessageQueueClient({
      url: process.env.MESSAGE_QUEUE_URL || 'amqp://localhost'
    });
  }
  
  async connect(): Promise<void> {
    await this.client.connect();
  }
  
  async createQueue(queueName: string): Promise<void> {
    if (this.queues.has(queueName)) {
      return;
    }
    
    await this.client.createQueue(queueName, {
      durable: true, // 持久化队列
      autoDelete: false
    });
    
    this.queues.add(queueName);
  }
  
  async publish(queueName: string, message: any): Promise<void> {
    await this.createQueue(queueName);
    
    await this.client.publish(queueName, JSON.stringify(message), {
      persistent: true // 持久化消息
    });
  }
  
  async subscribe(queueName: string, handler: (message: any) => Promise<void>): Promise<void> {
    await this.createQueue(queueName);
    
    await this.client.subscribe(queueName, async (msg: any) => {
      try {
        const message = JSON.parse(msg.content.toString());
        await handler(message);
        await msg.ack();
      } catch (error) {
        console.error('Error handling message:', error);
        await msg.nack(); // 重新排队
      }
    }, {
      prefetch: 5 // 每次只获取5条消息，控制并发
    });
  }
  
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
}

// 使用示例
const messageQueue = new MessageQueue();
await messageQueue.connect();

// 发布消息
await messageQueue.publish('concept-extraction', {
  text: '测试文本',
  userId: 'user123'
});

// 订阅消息
await messageQueue.subscribe('concept-extraction', async (message) => {
  const concepts = await extractConcepts(message.text);
  await saveConcepts(concepts, message.userId);
});
```

### 7.2 使用Worker Thread处理CPU密集型任务

```typescript
// 创建Worker Thread处理CPU密集型任务
class ConceptExtractorWorker {
  private worker: Worker;
  
  constructor() {
    this.worker = new Worker('./workers/concept-extractor.js');
  }
  
  extractConcepts(text: string): Promise<Concept[]> {
    return new Promise((resolve, reject) => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
        this.worker.removeEventListener('message', handleMessage);
        this.worker.removeEventListener('error', handleError);
      };
      
      const handleError = (error: ErrorEvent) => {
        reject(error.error);
        this.worker.removeEventListener('message', handleMessage);
        this.worker.removeEventListener('error', handleError);
      };
      
      this.worker.addEventListener('message', handleMessage);
      this.worker.addEventListener('error', handleError);
      
      this.worker.postMessage({ text });
    });
  }
  
  terminate(): void {
    this.worker.terminate();
  }
}

// Worker Thread实现 (workers/concept-extractor.js)
self.onmessage = async (event) => {
  try {
    const { text } = event.data;
    // 执行CPU密集型的概念提取
    const concepts = await extractConcepts(text);
    self.postMessage({ result: concepts });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
```

## 8. 性能监控与调优

### 8.1 应用性能监控

```typescript
// 集成APM监控
class APMMonitor {
  private apm: any;
  
  constructor() {
    this.apm = require('elastic-apm-node').start({
      serviceName: 'cognitive-modeling-service',
      secretToken: process.env.APM_SECRET_TOKEN,
      serverUrl: process.env.APM_SERVER_URL,
      environment: process.env.NODE_ENV || 'development',
      transactionSampleRate: 0.1, // 采样率
      captureBody: 'errors', // 只在错误时捕获请求体
      captureHeaders: true
    });
  }
  
  // 开始事务
  startTransaction(name: string, type: string): any {
    return this.apm.startTransaction(name, type);
  }
  
  // 结束事务
  endTransaction(): void {
    this.apm.endTransaction();
  }
  
  // 捕获错误
  captureError(error: Error, context?: any): void {
    this.apm.captureError(error, { context });
  }
  
  // 设置自定义标签
  setTag(key: string, value: string): void {
    this.apm.setTag(key, value);
  }
  
  // 记录自定义指标
  recordMetric(name: string, value: number): void {
    this.apm.metrics.registerGauge(name, () => value);
  }
}

// 使用示例
const apmMonitor = new APMMonitor();

app.use((req, res, next) => {
  const transaction = apmMonitor.startTransaction(req.path, 'request');
  
  res.on('finish', () => {
    apmMonitor.endTransaction();
  });
  
  next();
});
```

### 8.2 自定义性能监控

```typescript
// 自定义性能监控中间件
class PerformanceMonitor {
  private metrics: Map<string, Metric> = new Map();
  
  // 记录性能指标
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, new Metric(name));
    }
    
    this.metrics.get(name)!.addValue(value);
  }
  
  // 获取指标统计信息
  getMetricStats(name: string): MetricStats | null {
    const metric = this.metrics.get(name);
    return metric ? metric.getStats() : null;
  }
  
  // 获取所有指标
  getAllMetrics(): Record<string, MetricStats> {
    const result: Record<string, MetricStats> = {};
    
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = metric.getStats();
    }
    
    return result;
  }
}

// 指标类
class Metric {
  private name: string;
  private values: number[] = [];
  private windowSize: number = 1000;
  
  constructor(name: string) {
    this.name = name;
  }
  
  addValue(value: number): void {
    this.values.push(value);
    
    // 保持固定窗口大小
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }
  }
  
  getStats(): MetricStats {
    const count = this.values.length;
    const sum = this.values.reduce((a, b) => a + b, 0);
    const avg = count > 0 ? sum / count : 0;
    const min = count > 0 ? Math.min(...this.values) : 0;
    const max = count > 0 ? Math.max(...this.values) : 0;
    
    // 计算百分位数
    const sorted = [...this.values].sort((a, b) => a - b);
    const p50 = this.getPercentile(sorted, 50);
    const p95 = this.getPercentile(sorted, 95);
    const p99 = this.getPercentile(sorted, 99);
    
    return {
      name: this.name,
      count,
      sum,
      avg,
      min,
      max,
      p50,
      p95,
      p99,
      lastUpdated: Date.now()
    };
  }
  
  private getPercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

interface MetricStats {
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  lastUpdated: number;
}

// Express中间件
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e6; // 转换为毫秒
    
    // 记录响应时间指标
    performanceMonitor.recordMetric('response_time', duration);
    performanceMonitor.recordMetric(`response_time_${req.path}`, duration);
    
    // 记录状态码指标
    performanceMonitor.recordMetric(`status_${res.statusCode}`, 1);
  });
  
  next();
});
```

## 9. 性能测试

### 9.1 负载测试

```yaml
# Artillery负载测试配置
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: Warm up
    - duration: 120
      arrivalRate: 5
      rampTo: 20
      name: Ramp up load
    - duration: 60
      arrivalRate: 20
      name: Sustained load
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - flow:
      - post:
          url: "/api/input/thoughts"
          json:
            content: "测试性能优化效果"
            timestamp: "{{ $timestamp }}"
          capture:
            json: "$.id"
            as: "thoughtId"
      - post:
          url: "/api/cognitive-parsing/parse/{{ thoughtId }}"
      - get:
          url: "/api/cognitive-model/latest"
      - post:
          url: "/api/cognitive-feedback/generate"
      - get:
          url: "/api/cognitive-feedback/latest"
```

### 9.2 基准测试

```typescript
// 使用Benchmark.js进行基准测试
const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;

// 添加测试用例
suite
  .add('原始算法', () => {
    // 原始算法实现
    findDuplicateConceptsOriginal(concepts);
  })
  .add('优化算法', () => {
    // 优化算法实现
    findDuplicateConceptsOptimized(concepts);
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
```

## 10. 性能优化最佳实践

### 10.1 代码层面

1. **减少不必要的计算**：缓存计算结果，避免重复计算
2. **优化数据结构**：选择合适的数据结构，如Map、Set等
3. **减少内存分配**：复用对象，避免频繁创建和销毁对象
4. **使用异步编程**：避免阻塞主线程，提高并发处理能力
5. **优化循环和递归**：减少循环嵌套，优化递归算法

### 10.2 数据库层面

1. **创建合适的索引**：根据查询模式创建索引
2. **优化查询语句**：使用JOIN减少查询次数，避免SELECT *
3. **批量操作**：批量插入、更新和删除数据
4. **分区表**：对大表进行分区，提高查询性能
5. **定期优化数据库**：执行VACUUM、ANALYZE等操作

### 10.3 缓存层面

1. **使用多级缓存**：本地缓存 + 分布式缓存
2. **合理设置缓存失效时间**：根据数据更新频率设置TTL
3. **缓存预热**：在系统启动时加载常用数据到缓存
4. **缓存穿透保护**：使用布隆过滤器防止缓存穿透
5. **缓存雪崩预防**：设置随机的缓存失效时间

### 10.4 网络层面

1. **减少HTTP请求**：合并请求，使用HTTP/2
2. **压缩数据**：使用gzip、br等压缩算法
3. **CDN加速**：使用CDN分发静态资源
4. **优化API设计**：使用GraphQL减少过度获取和不足获取
5. **使用WebSocket**：减少HTTP握手开销

### 10.5 部署层面

1. **水平扩展**：使用负载均衡器扩展应用实例
2. **垂直扩展**：优化服务器资源配置
3. **容器化部署**：使用Docker、Kubernetes提高部署效率
4. **自动缩放**：根据负载自动调整实例数量
5. **就近部署**：使用CDN或边缘计算节点

## 11. 总结与展望

### 11.1 已完成工作

- 设计了各模块的性能优化策略
- 实现了代码级优化，包括算法和异步编程优化
- 设计了数据库和向量数据库的优化方案
- 实现了多级缓存系统和缓存失效策略
- 集成了消息队列和Worker Thread处理异步任务
- 设计了性能监控和调优机制
- 制定了性能测试和基准测试方案

### 11.2 后续改进方向

- 实现自动性能监控和告警系统
- 开发性能优化的自动化工具
- 探索机器学习辅助的性能优化
- 优化分布式系统的性能
- 研究服务器less架构的性能优化

## 12. 参考资料

- Node.js Performance Optimization: https://nodejs.org/en/docs/guides/simple-profiling/
- Clinic.js: https://clinicjs.org/
- Elastic APM: https://www.elastic.co/apm
- Redis Best Practices: https://redis.io/topics/best-practices
- Qdrant Documentation: https://qdrant.tech/documentation/
- Artillery: https://artillery.io/
- Benchmark.js: https://benchmarkjs.com/
- Performance Optimization Patterns: https://martinfowler.com/articles/performance.html

## 13. 附录

### 13.1 性能优化 checklist

- [ ] 已分析系统性能瓶颈
- [ ] 已优化核心算法复杂度
- [ ] 已优化数据库查询和索引
- [ ] 已实现缓存机制
- [ ] 已优化异步处理
- [ ] 已集成性能监控
- [ ] 已进行负载测试
- [ ] 已建立性能基准
- [ ] 已制定性能优化计划
- [ ] 已定期监控和调优

### 13.2 常用性能优化命令

```bash
# 使用Node.js内置profiler进行性能分析
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# 使用Clinic.js进行性能诊断
clinic doctor -- node app.js
clinic flame -- node app.js
clinic bubble -- node app.js

# 使用Artillery进行负载测试
artillery run performance-test.yml

# 使用Redis性能监控
redis-cli --stat
redis-cli info stats

# 使用SQLite性能分析
EXPLAIN QUERY PLAN SELECT * FROM concepts WHERE name = 'test';
```

### 13.3 性能监控指标参考

| 指标 | 良好值 | 警告值 | 临界值 |
|------|--------|--------|--------|
| CPU使用率 | < 50% | 50-70% | > 70% |
| 内存使用率 | < 60% | 60-80% | > 80% |
| 响应时间 | < 100ms | 100-200ms | > 200ms |
| QPS | > 100 | 50-100 | < 50 |
| 错误率 | < 0.1% | 0.1-1% | > 1% |
| 数据库连接数 | < 50% | 50-80% | > 80% |
| 缓存命中率 | > 90% | 70-90% | < 70% |