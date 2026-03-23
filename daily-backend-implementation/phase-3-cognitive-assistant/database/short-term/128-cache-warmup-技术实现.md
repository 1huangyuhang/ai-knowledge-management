# 128-缓存预热代码

## 1. 缓存预热概述

缓存预热是指在系统启动或低峰期，提前将热点数据加载到缓存中的过程。这样可以避免系统在高并发情况下，大量请求同时穿透到数据库，导致数据库压力骤增。

### 1.1 缓存预热的好处

1. **降低系统启动延迟**：系统启动后即可提供缓存服务，无需等待第一次请求触发缓存加载
2. **减少数据库压力**：避免大量并发请求同时穿透到数据库
3. **提高系统稳定性**：减少数据库过载导致的系统崩溃风险
4. **优化用户体验**：用户无需等待缓存首次加载，获得更快的响应速度
5. **均衡系统负载**：可以在低峰期进行预热，避免高并发时段系统资源紧张

### 1.2 缓存预热的应用场景

1. **系统启动时**：系统重启或部署后，提前加载热点数据
2. **业务高峰期前**：在预期的业务高峰期（如促销活动）前，提前加载相关数据
3. **缓存失效后**：缓存大面积失效后，批量重新加载数据
4. **数据更新后**：重要数据更新后，重新加载到缓存
5. **新功能上线前**：新功能上线前，提前加载相关数据

## 2. 缓存预热设计

### 2.1 缓存预热架构

```
+----------------+     +----------------+     +----------------+     +----------------+
|  Application   |     |  Cache Warmup  |     |  Redis Cluster |     |  Database      |
|   Layer        |---->|  Service       |---->|                |<--->|  Layer         |
|                |     |  (Infrastructure|     |                |     |                |
+----------------+     +----------------+     +----------------+     +----------------+
          ^                        ^
          |                        |
          |                        |
+----------------+     +----------------+
|  Event Bus     |<----|  Cache Service |
|  (Infrastructure|     |                |
|   Layer)       |     |                |
+----------------+     +----------------+
```

### 2.2 缓存预热策略

| 策略 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 系统启动预热 | 实现简单，效果明显 | 延长系统启动时间 | 热点数据较少的场景 |
| 定时任务预热 | 可以在低峰期执行 | 需要额外的任务调度 | 热点数据较多的场景 |
| 事件驱动预热 | 响应实时，按需预热 | 实现复杂 | 数据更新频繁的场景 |
| 渐进式预热 | 避免系统资源过载 | 预热时间较长 | 大数据量场景 |

### 2.3 缓存预热流程

1. **预热触发**：系统启动、定时任务或事件触发缓存预热
2. **热点数据识别**：确定需要预热的热点数据范围
3. **数据加载**：从数据源批量加载热点数据
4. **缓存设置**：将加载的数据批量设置到缓存中
5. **预热监控**：监控预热进度和效果
6. **预热完成**：通知系统预热完成

## 3. 缓存预热实现

### 3.1 项目结构

```
src/
└── infrastructure/      # 基础设施层
    └── cache/           # 缓存服务
        ├── config/      # 缓存配置
        ├── connection/  # 缓存连接管理
        ├── core/        # 核心缓存操作
        ├── service/     # 业务缓存服务
        │   ├── CacheService.ts          # 基础缓存服务
        │   ├── HotDataCacheService.ts    # 热点数据缓存服务
        │   ├── CacheInvalidationService.ts  # 缓存失效服务
        │   └── CacheWarmupService.ts     # 缓存预热服务
        ├── event-handlers/  # 事件处理器
        │   ├── CacheEventHandler.ts     # 基础缓存事件处理器
        │   ├── HotDataEventHandler.ts    # 热点数据事件处理器
        │   ├── CacheInvalidationEventHandler.ts  # 缓存失效事件处理器
        │   └── CacheWarmupEventHandler.ts  # 缓存预热事件处理器
        ├── invalidation/  # 缓存失效策略
        ├── monitor/      # 热点数据监控
        ├── warmup/       # 缓存预热
        │   ├── CacheWarmupStrategy.ts    # 缓存预热策略接口
        │   ├── StartupWarmupStrategy.ts  # 启动预热策略
        │   ├── ScheduledWarmupStrategy.ts  # 定时预热策略
        │   └── EventDrivenWarmupStrategy.ts  # 事件驱动预热策略
        └── utils/        # 工具类
```

### 3.2 缓存预热策略接口

```typescript
// src/infrastructure/cache/warmup/CacheWarmupStrategy.ts

/**
 * 缓存预热任务
 */
export interface CacheWarmupTask {
  /**
   * 任务ID
   */
  id: string;
  /**
   * 任务名称
   */
  name: string;
  /**
   * 缓存键模板
   */
  keyTemplate: string;
  /**
   * 数据获取函数
   */
  dataProvider: () => Promise<any[]>;
  /**
   * 缓存过期时间（秒）
   */
  ttl?: number;
  /**
   * 批量大小
   */
  batchSize?: number;
}

/**
 * 缓存预热结果
 */
export interface CacheWarmupResult {
  /**
   * 任务ID
   */
  taskId: string;
  /**
   * 预热数据数量
   */
  count: number;
  /**
   * 预热成功数量
   */
  successCount: number;
  /**
   * 预热失败数量
   */
  failedCount: number;
  /**
   * 预热耗时（毫秒）
   */
  duration: number;
  /**
   * 预热状态
   */
  status: 'success' | 'failed' | 'partial';
  /**
   * 失败原因（如果有）
   */
  error?: string;
}

/**
 * 缓存预热策略接口
 */
export interface CacheWarmupStrategy {
  /**
   * 策略名称
   */
  name: string;
  
  /**
   * 初始化预热策略
   */
  init(): void;
  
  /**
   * 执行缓存预热
   * @param tasks 预热任务列表
   */
  execute(tasks: CacheWarmupTask[]): Promise<CacheWarmupResult[]>;
  
  /**
   * 执行单个预热任务
   * @param task 预热任务
   */
  executeTask(task: CacheWarmupTask): Promise<CacheWarmupResult>;
  
  /**
   * 销毁预热策略
   */
  destroy(): void;
}
```

### 3.3 启动预热策略

```typescript
// src/infrastructure/cache/warmup/StartupWarmupStrategy.ts
import { injectable, inject } from 'tsyringe';
import { CacheWarmupStrategy, CacheWarmupTask, CacheWarmupResult } from './CacheWarmupStrategy';
import { CacheService } from '../service/CacheService';

/**
 * 启动缓存预热策略
 */
@injectable()
export class StartupWarmupStrategy implements CacheWarmupStrategy {
  public name = 'startup';
  
  constructor(@inject(CacheService) private cacheService: CacheService) {}

  /**
   * 初始化预热策略
   */
  public init(): void {
    // 启动预热策略不需要额外初始化
  }

  /**
   * 执行缓存预热
   * @param tasks 预热任务列表
   */
  public async execute(tasks: CacheWarmupTask[]): Promise<CacheWarmupResult[]> {
    const results: CacheWarmupResult[] = [];
    
    // 串行执行所有任务
    for (const task of tasks) {
      const result = await this.executeTask(task);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 执行单个预热任务
   * @param task 预热任务
   */
  public async executeTask(task: CacheWarmupTask): Promise<CacheWarmupResult> {
    const startTime = Date.now();
    let successCount = 0;
    let failedCount = 0;
    
    try {
      // 获取数据
      const data = await task.dataProvider();
      const totalCount = data.length;
      
      if (totalCount === 0) {
        return {
          taskId: task.id,
          count: 0,
          successCount: 0,
          failedCount: 0,
          duration: Date.now() - startTime,
          status: 'success'
        };
      }
      
      // 批量处理
      const batchSize = task.batchSize || 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        // 并行处理批量数据
        const batchResults = await Promise.all(
          batch.map(async (item, index) => {
            try {
              // 生成缓存键
              const cacheKey = this.generateCacheKey(task.keyTemplate, item, index);
              // 设置缓存
              await this.cacheService.set(cacheKey, item, task.ttl);
              return true;
            } catch (error) {
              console.error(`预热任务 ${task.id} 数据项 ${i + index} 失败:`, error);
              return false;
            }
          })
        );
        
        // 统计结果
        const batchSuccess = batchResults.filter(result => result).length;
        successCount += batchSuccess;
        failedCount += batchResults.length - batchSuccess;
      }
      
      // 确定状态
      let status: 'success' | 'failed' | 'partial' = 'success';
      if (failedCount > 0) {
        status = successCount > 0 ? 'partial' : 'failed';
      }
      
      return {
        taskId: task.id,
        count: totalCount,
        successCount,
        failedCount,
        duration: Date.now() - startTime,
        status
      };
    } catch (error) {
      console.error(`预热任务 ${task.id} 执行失败:`, error);
      
      return {
        taskId: task.id,
        count: 0,
        successCount: 0,
        failedCount: 0,
        duration: Date.now() - startTime,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 生成缓存键
   * @param template 缓存键模板
   * @param item 数据项
   * @param index 索引
   */
  private generateCacheKey(template: string, item: any, index: number): string {
    // 简单实现：替换模板中的占位符
    let key = template;
    
    // 替换{id}占位符
    if (item.id !== undefined) {
      key = key.replace('{id}', String(item.id));
    }
    
    // 替换{index}占位符
    key = key.replace('{index}', String(index));
    
    // 替换其他属性占位符
    for (const [prop, value] of Object.entries(item)) {
      const placeholder = `{${prop}}`;
      if (key.includes(placeholder)) {
        key = key.replace(placeholder, String(value));
      }
    }
    
    return key;
  }

  /**
   * 销毁预热策略
   */
  public destroy(): void {
    // 启动预热策略不需要额外销毁
  }
}
```

### 3.4 定时预热策略

```typescript
// src/infrastructure/cache/warmup/ScheduledWarmupStrategy.ts
import { injectable, inject } from 'tsyringe';
import { CacheWarmupStrategy, CacheWarmupTask, CacheWarmupResult } from './CacheWarmupStrategy';
import { CacheService } from '../service/CacheService';

/**
 * 定时缓存预热配置
 */
export interface ScheduledWarmupConfig {
  /**
   * 预热时间间隔（毫秒）
   */
  interval: number;
  /**
   * 预热开始时间
   */
  startTime?: Date;
  /**
   * 是否启用
   */
  enabled: boolean;
}

/**
 * 定时缓存预热策略
 */
@injectable()
export class ScheduledWarmupStrategy implements CacheWarmupStrategy {
  public name = 'scheduled';
  private intervalId?: NodeJS.Timeout;
  private tasks: CacheWarmupTask[] = [];

  constructor(
    @inject(CacheService) private cacheService: CacheService,
    @inject('ScheduledWarmupConfig') private config: ScheduledWarmupConfig
  ) {}

  /**
   * 初始化预热策略
   */
  public init(): void {
    if (!this.config.enabled) {
      return;
    }
    
    // 计算初始延迟
    let initialDelay = this.config.interval;
    if (this.config.startTime) {
      const now = new Date();
      const startTime = this.config.startTime;
      initialDelay = startTime.getTime() - now.getTime();
      if (initialDelay < 0) {
        // 如果开始时间已过，计算下一次执行时间
        initialDelay = this.config.interval - (now.getTime() - startTime.getTime()) % this.config.interval;
      }
    }
    
    // 设置定时任务
    this.intervalId = setInterval(
      () => this.execute(this.tasks),
      this.config.interval,
      initialDelay
    );
    
    console.log(`定时缓存预热策略已初始化，间隔：${this.config.interval}ms`);
  }

  /**
   * 添加预热任务
   * @param task 预热任务
   */
  public addTask(task: CacheWarmupTask): void {
    this.tasks.push(task);
  }

  /**
   * 移除预热任务
   * @param taskId 任务ID
   */
  public removeTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
  }

  /**
   * 执行缓存预热
   * @param tasks 预热任务列表
   */
  public async execute(tasks: CacheWarmupTask[]): Promise<CacheWarmupResult[]> {
    console.log(`开始定时预热，共${tasks.length}个任务`);
    const results = await Promise.all(
      tasks.map(task => this.executeTask(task))
    );
    
    // 统计结果
    const totalSuccess = results.reduce((sum, result) => sum + result.successCount, 0);
    const totalFailed = results.reduce((sum, result) => sum + result.failedCount, 0);
    console.log(`定时预热完成，成功：${totalSuccess}，失败：${totalFailed}`);
    
    return results;
  }

  /**
   * 执行单个预热任务
   * @param task 预热任务
   */
  public async executeTask(task: CacheWarmupTask): Promise<CacheWarmupResult> {
    const startTime = Date.now();
    let successCount = 0;
    let failedCount = 0;
    
    try {
      // 获取数据
      const data = await task.dataProvider();
      const totalCount = data.length;
      
      if (totalCount === 0) {
        return {
          taskId: task.id,
          count: 0,
          successCount: 0,
          failedCount: 0,
          duration: Date.now() - startTime,
          status: 'success'
        };
      }
      
      // 批量处理
      const batchSize = task.batchSize || 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        // 并行处理批量数据
        const batchResults = await Promise.all(
          batch.map(async (item, index) => {
            try {
              // 生成缓存键
              const cacheKey = this.generateCacheKey(task.keyTemplate, item, index);
              // 设置缓存
              await this.cacheService.set(cacheKey, item, task.ttl);
              return true;
            } catch (error) {
              console.error(`定时预热任务 ${task.id} 数据项 ${i + index} 失败:`, error);
              return false;
            }
          })
        );
        
        // 统计结果
        const batchSuccess = batchResults.filter(result => result).length;
        successCount += batchSuccess;
        failedCount += batchResults.length - batchSuccess;
      }
      
      // 确定状态
      let status: 'success' | 'failed' | 'partial' = 'success';
      if (failedCount > 0) {
        status = successCount > 0 ? 'partial' : 'failed';
      }
      
      return {
        taskId: task.id,
        count: totalCount,
        successCount,
        failedCount,
        duration: Date.now() - startTime,
        status
      };
    } catch (error) {
      console.error(`定时预热任务 ${task.id} 执行失败:`, error);
      
      return {
        taskId: task.id,
        count: 0,
        successCount: 0,
        failedCount: 0,
        duration: Date.now() - startTime,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 生成缓存键
   * @param template 缓存键模板
   * @param item 数据项
   * @param index 索引
   */
  private generateCacheKey(template: string, item: any, index: number): string {
    // 简单实现：替换模板中的占位符
    let key = template;
    
    // 替换{id}占位符
    if (item.id !== undefined) {
      key = key.replace('{id}', String(item.id));
    }
    
    // 替换{index}占位符
    key = key.replace('{index}', String(index));
    
    // 替换其他属性占位符
    for (const [prop, value] of Object.entries(item)) {
      const placeholder = `{${prop}}`;
      if (key.includes(placeholder)) {
        key = key.replace(placeholder, String(value));
      }
    }
    
    return key;
  }

  /**
   * 销毁预热策略
   */
  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log('定时缓存预热策略已销毁');
  }
}
```

### 3.5 事件驱动预热策略

```typescript
// src/infrastructure/cache/warmup/EventDrivenWarmupStrategy.ts
import { injectable, inject } from 'tsyringe';
import { CacheWarmupStrategy, CacheWarmupTask, CacheWarmupResult } from './CacheWarmupStrategy';
import { CacheService } from '../service/CacheService';
import { eventBus } from '../../event-bus/event-bus';

/**
 * 事件驱动缓存预热策略
 */
@injectable()
export class EventDrivenWarmupStrategy implements CacheWarmupStrategy {
  public name = 'event-driven';
  private eventListeners: Map<string, (data: any) => void> = new Map();

  constructor(@inject(CacheService) private cacheService: CacheService) {}

  /**
   * 初始化预热策略
   */
  public init(): void {
    // 订阅预热事件
    const warmupEventListener = (data: { task: CacheWarmupTask }) => {
      this.executeTask(data.task);
    };
    
    const warmupBatchEventListener = (data: { tasks: CacheWarmupTask[] }) => {
      this.execute(data.tasks);
    };
    
    eventBus.subscribe('cache:warmup', warmupEventListener);
    eventBus.subscribe('cache:warmup:batch', warmupBatchEventListener);
    
    this.eventListeners.set('cache:warmup', warmupEventListener);
    this.eventListeners.set('cache:warmup:batch', warmupBatchEventListener);
    
    console.log('事件驱动缓存预热策略已初始化');
  }

  /**
   * 执行缓存预热
   * @param tasks 预热任务列表
   */
  public async execute(tasks: CacheWarmupTask[]): Promise<CacheWarmupResult[]> {
    console.log(`事件驱动预热开始，共${tasks.length}个任务`);
    
    const results = await Promise.all(
      tasks.map(task => this.executeTask(task))
    );
    
    // 统计结果
    const totalSuccess = results.reduce((sum, result) => sum + result.successCount, 0);
    const totalFailed = results.reduce((sum, result) => sum + result.failedCount, 0);
    console.log(`事件驱动预热完成，成功：${totalSuccess}，失败：${totalFailed}`);
    
    return results;
  }

  /**
   * 执行单个预热任务
   * @param task 预热任务
   */
  public async executeTask(task: CacheWarmupTask): Promise<CacheWarmupResult> {
    const startTime = Date.now();
    let successCount = 0;
    let failedCount = 0;
    
    try {
      // 获取数据
      const data = await task.dataProvider();
      const totalCount = data.length;
      
      if (totalCount === 0) {
        return {
          taskId: task.id,
          count: 0,
          successCount: 0,
          failedCount: 0,
          duration: Date.now() - startTime,
          status: 'success'
        };
      }
      
      // 批量处理
      const batchSize = task.batchSize || 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        // 并行处理批量数据
        const batchResults = await Promise.all(
          batch.map(async (item, index) => {
            try {
              // 生成缓存键
              const cacheKey = this.generateCacheKey(task.keyTemplate, item, index);
              // 设置缓存
              await this.cacheService.set(cacheKey, item, task.ttl);
              return true;
            } catch (error) {
              console.error(`事件驱动预热任务 ${task.id} 数据项 ${i + index} 失败:`, error);
              return false;
            }
          })
        );
        
        // 统计结果
        const batchSuccess = batchResults.filter(result => result).length;
        successCount += batchSuccess;
        failedCount += batchResults.length - batchSuccess;
      }
      
      // 确定状态
      let status: 'success' | 'failed' | 'partial' = 'success';
      if (failedCount > 0) {
        status = successCount > 0 ? 'partial' : 'failed';
      }
      
      return {
        taskId: task.id,
        count: totalCount,
        successCount,
        failedCount,
        duration: Date.now() - startTime,
        status
      };
    } catch (error) {
      console.error(`事件驱动预热任务 ${task.id} 执行失败:`, error);
      
      return {
        taskId: task.id,
        count: 0,
        successCount: 0,
        failedCount: 0,
        duration: Date.now() - startTime,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 生成缓存键
   * @param template 缓存键模板
   * @param item 数据项
   * @param index 索引
   */
  private generateCacheKey(template: string, item: any, index: number): string {
    // 简单实现：替换模板中的占位符
    let key = template;
    
    // 替换{id}占位符
    if (item.id !== undefined) {
      key = key.replace('{id}', String(item.id));
    }
    
    // 替换{index}占位符
    key = key.replace('{index}', String(index));
    
    // 替换其他属性占位符
    for (const [prop, value] of Object.entries(item)) {
      const placeholder = `{${prop}}`;
      if (key.includes(placeholder)) {
        key = key.replace(placeholder, String(value));
      }
    }
    
    return key;
  }

  /**
   * 销毁预热策略
   */
  public destroy(): void {
    // 取消订阅事件
    for (const [event, listener] of this.eventListeners.entries()) {
      eventBus.unsubscribe(event, listener);
    }
    this.eventListeners.clear();
    
    console.log('事件驱动缓存预热策略已销毁');
  }
}
```

### 3.6 缓存预热服务

```typescript
// src/infrastructure/cache/service/CacheWarmupService.ts
import { injectable, inject } from 'tsyringe';
import { CacheService } from './CacheService';
import { CacheWarmupStrategy, CacheWarmupTask, CacheWarmupResult } from '../warmup/CacheWarmupStrategy';
import { StartupWarmupStrategy } from '../warmup/StartupWarmupStrategy';
import { ScheduledWarmupStrategy } from '../warmup/ScheduledWarmupStrategy';
import { EventDrivenWarmupStrategy } from '../warmup/EventDrivenWarmupStrategy';
import { eventBus } from '../../event-bus/event-bus';

/**
 * 缓存预热服务
 */
@injectable()
export class CacheWarmupService {
  private strategies: Map<string, CacheWarmupStrategy> = new Map();
  private defaultStrategy: CacheWarmupStrategy;

  constructor(@inject(CacheService) private cacheService: CacheService) {
    // 初始化预热策略
    this.initStrategies();
    
    // 设置默认策略
    this.defaultStrategy = this.strategies.get('startup')!;
  }

  /**
   * 初始化预热策略
   */
  private initStrategies(): void {
    // 创建预热策略实例
    const startupStrategy = new StartupWarmupStrategy(this.cacheService);
    const scheduledStrategy = new ScheduledWarmupStrategy(this.cacheService, {
      interval: 3600000, // 1小时
      enabled: true
    });
    const eventDrivenStrategy = new EventDrivenWarmupStrategy(this.cacheService);
    
    // 初始化策略
    startupStrategy.init();
    scheduledStrategy.init();
    eventDrivenStrategy.init();
    
    // 注册策略
    this.strategies.set('startup', startupStrategy);
    this.strategies.set('scheduled', scheduledStrategy);
    this.strategies.set('event-driven', eventDrivenStrategy);
  }

  /**
   * 设置默认预热策略
   * @param strategyName 策略名称
   */
  public setDefaultStrategy(strategyName: string): void {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`无效的预热策略: ${strategyName}`);
    }
    this.defaultStrategy = strategy;
  }

  /**
   * 执行缓存预热
   * @param tasks 预热任务列表
   * @param strategyName 策略名称
   */
  public async warmup(tasks: CacheWarmupTask[], strategyName?: string): Promise<CacheWarmupResult[]> {
    const strategy = strategyName ? this.strategies.get(strategyName) : this.defaultStrategy;
    if (!strategy) {
      throw new Error(`无效的预热策略: ${strategyName}`);
    }
    
    console.log(`开始缓存预热，策略：${strategy.name}，任务数：${tasks.length}`);
    const results = await strategy.execute(tasks);
    
    // 发布预热完成事件
    eventBus.publish('cache:warmup:completed', { results });
    
    return results;
  }

  /**
   * 执行单个预热任务
   * @param task 预热任务
   * @param strategyName 策略名称
   */
  public async warmupTask(task: CacheWarmupTask, strategyName?: string): Promise<CacheWarmupResult> {
    const strategy = strategyName ? this.strategies.get(strategyName) : this.defaultStrategy;
    if (!strategy) {
      throw new Error(`无效的预热策略: ${strategyName}`);
    }
    
    const result = await strategy.executeTask(task);
    
    // 发布预热完成事件
    eventBus.publish('cache:warmup:task:completed', { result });
    
    return result;
  }

  /**
   * 通过事件触发预热
   * @param task 预热任务
   */
  public warmupByEvent(task: CacheWarmupTask): void {
    eventBus.publish('cache:warmup', { task });
  }

  /**
   * 通过事件触发批量预热
   * @param tasks 预热任务列表
   */
  public warmupBatchByEvent(tasks: CacheWarmupTask[]): void {
    eventBus.publish('cache:warmup:batch', { tasks });
  }

  /**
   * 销毁缓存预热服务
   */
  public destroy(): void {
    // 销毁所有策略
    for (const strategy of this.strategies.values()) {
      strategy.destroy();
    }
    this.strategies.clear();
  }
}
```

### 3.7 缓存预热事件处理器

```typescript
// src/infrastructure/cache/event-handlers/CacheWarmupEventHandler.ts
import { injectable, inject } from 'tsyringe';
import { eventBus } from '../../event-bus/event-bus';
import { CacheWarmupService } from '../service/CacheWarmupService';
import { CacheWarmupTask } from '../warmup/CacheWarmupStrategy';

/**
 * 缓存预热事件处理器
 */
@injectable()
export class CacheWarmupEventHandler {
  constructor(@inject(CacheWarmupService) private warmupService: CacheWarmupService) {
    // 订阅预热完成事件
    this.subscribeToEvents();
  }

  /**
   * 订阅事件
   */
  private subscribeToEvents(): void {
    // 订阅预热完成事件
    eventBus.subscribe('cache:warmup:completed', this.handleWarmupCompleted.bind(this));
    eventBus.subscribe('cache:warmup:task:completed', this.handleWarmupTaskCompleted.bind(this));
  }

  /**
   * 处理预热完成事件
   * @param data 事件数据
   */
  private handleWarmupCompleted(data: { results: any[] }): void {
    const { results } = data;
    const totalTasks = results.length;
    const successTasks = results.filter(result => result.status === 'success').length;
    const partialTasks = results.filter(result => result.status === 'partial').length;
    const failedTasks = results.filter(result => result.status === 'failed').length;
    
    console.log(`缓存预热完成：共 ${totalTasks} 个任务，成功 ${successTasks} 个，部分成功 ${partialTasks} 个，失败 ${failedTasks} 个`);
    
    // 可以在这里添加预热完成后的处理逻辑，如发送通知、更新监控等
  }

  /**
   * 处理单个预热任务完成事件
   * @param data 事件数据
   */
  private handleWarmupTaskCompleted(data: { result: any }): void {
    const { result } = data;
    
    console.log(`预热任务 ${result.taskId} 完成：状态 ${result.status}，成功 ${result.successCount} 条，失败 ${result.failedCount} 条，耗时 ${result.duration}ms`);
    
    // 可以在这里添加单个任务完成后的处理逻辑
  }
}
```

### 3.8 依赖注入配置

```typescript
// src/infrastructure/cache/cache.module.ts
import { container } from 'tsyringe';
import { RedisConfig } from './config/RedisConfig';
import { RedisConnection } from './connection/RedisConnection';
import { RedisClient } from './core/RedisClient';
import { CacheService } from './service/CacheService';
import { HotDataCacheService } from './service/HotDataCacheService';
import { CacheInvalidationService } from './service/CacheInvalidationService';
import { CacheWarmupService } from './service/CacheWarmupService';
import { HotDataMonitor, HotDataMonitorConfig } from './monitor/HotDataMonitor';
import { CacheEventHandler } from './event-handlers/CacheEventHandler';
import { HotDataEventHandler } from './event-handlers/HotDataEventHandler';
import { CacheInvalidationEventHandler } from './event-handlers/CacheInvalidationEventHandler';
import { CacheWarmupEventHandler } from './event-handlers/CacheWarmupEventHandler';
import { ScheduledWarmupConfig } from './warmup/ScheduledWarmupStrategy';

// 注册热点数据监控配置
container.register(HotDataMonitorConfig, {
  useValue: {
    frequencyThreshold: 100,  // 100次/分钟
    timeWindow: 5,            // 5分钟时间窗口
    hotDataTtl: 3600 * 24     // 热点数据缓存24小时
  }
});

// 注册定时预热配置
container.register(ScheduledWarmupConfig, {
  useValue: {
    interval: 3600000,  // 1小时
    enabled: true
  }
});

// 注册缓存服务
container.register(RedisConfig, { useValue: new RedisConfig() });
container.register(RedisConnection, { useClass: RedisConnection });
container.register(RedisClient, { useClass: RedisClient });
container.register(CacheService, { useClass: CacheService });
container.register(HotDataCacheService, { useClass: HotDataCacheService });
container.register(CacheInvalidationService, { useClass: CacheInvalidationService });
container.register(CacheWarmupService, { useClass: CacheWarmupService });
container.register(HotDataMonitor, { useClass: HotDataMonitor });
container.register(CacheEventHandler, { useClass: CacheEventHandler });
container.register(HotDataEventHandler, { useClass: HotDataEventHandler });
container.register(CacheInvalidationEventHandler, { useClass: CacheInvalidationEventHandler });
container.register(CacheWarmupEventHandler, { useClass: CacheWarmupEventHandler });

export { CacheService, HotDataCacheService, CacheInvalidationService, CacheWarmupService };
```

## 4. 缓存预热使用示例

### 4.1 在系统启动时使用缓存预热

```typescript
// src/infrastructure/cache/index.ts
import { container } from 'tsyringe';
import { CacheWarmupService } from './service/CacheWarmupService';
import { UserRepository } from '../database/repositories/user.repository';

/**
 * 初始化缓存预热
 */
export async function initCacheWarmup(): Promise<void> {
  const warmupService = container.resolve(CacheWarmupService);
  const userRepository = container.resolve(UserRepository);

  try {
    // 定义预热任务
    const warmupTasks = [
      {
        id: 'active-users',
        name: '活跃用户预热',
        keyTemplate: 'user:active:{id}',
        dataProvider: async () => {
          // 获取活跃用户列表
          return userRepository.getActiveUsers(100);
        },
        ttl: 3600 * 24, // 缓存24小时
        batchSize: 50 // 每次处理50条数据
      },
      {
        id: 'popular-concepts',
        name: '热门概念预热',
        keyTemplate: 'concept:popular:{id}',
        dataProvider: async () => {
          // 获取热门概念列表
          return userRepository.getPopularConcepts(200);
        },
        ttl: 3600 * 12, // 缓存12小时
        batchSize: 100 // 每次处理100条数据
      }
    ];

    // 执行预热
    const results = await warmupService.warmup(warmupTasks, 'startup');
    
    // 输出预热结果
    console.log('缓存预热结果:', results);
  } catch (error) {
    console.error('缓存预热失败:', error);
  }
}
```

### 4.2 在应用入口初始化缓存预热

```typescript
// src/index.ts
import 'reflect-metadata'; // tsyringe依赖
import fastify from 'fastify';
import { container } from 'tsyringe';
import { userRoutes } from './presentation/routes/user.routes';
import { initCacheWarmup } from './infrastructure/cache';

const app = fastify({
  logger: true
});

const PORT = process.env.PORT || 3000;

// 初始化中间件
app.register(import('@fastify/cors'));
app.register(import('@fastify/swagger'));

// 注册路由
app.register(userRoutes, { prefix: '/api/users' });

// 启动服务器
app.listen({ port: PORT as number }, async (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  
  app.log.info(`服务器运行在 ${address}`);
  
  // 初始化缓存预热（异步执行，不阻塞服务器启动）
  initCacheWarmup().catch(error => {
    app.log.error('缓存预热失败:', error);
  });
});
```

### 4.3 动态添加定时预热任务

```typescript
// src/application/services/admin.service.ts
import { injectable, inject } from 'tsyringe';
import { CacheWarmupService } from '../../infrastructure/cache/service/CacheWarmupService';
import { CacheWarmupTask } from '../../infrastructure/cache/warmup/CacheWarmupStrategy';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';

@injectable()
export class AdminService {
  constructor(
    @inject(CacheWarmupService) private warmupService: CacheWarmupService,
    @inject(UserRepository) private userRepository: UserRepository
  ) {}

  /**
   * 添加定时预热任务
   * @param task 预热任务
   */
  async addScheduledWarmupTask() {
    // 定义预热任务
    const warmupTask: CacheWarmupTask = {
      id: 'daily-report',
      name: '每日报表数据预热',
      keyTemplate: 'report:daily:{date}:{id}',
      dataProvider: async () => {
        // 获取每日报表数据
        const today = new Date().toISOString().split('T')[0];
        return this.userRepository.getDailyReportData(today);
      },
      ttl: 3600 * 24, // 缓存24小时
      batchSize: 200 // 每次处理200条数据
    };
    
    // 通过事件添加定时预热任务
    this.warmupService.warmupByEvent(warmupTask);
    
    return { message: '定时预热任务已添加' };
  }
}
```

## 5. 缓存预热测试

### 5.1 单元测试

```typescript
// tests/infrastructure/cache/service/CacheWarmupService.test.ts
import { container } from 'tsyringe';
import { CacheWarmupService } from '../../../src/infrastructure/cache/service/CacheWarmupService';
import { CacheService } from '../../../src/infrastructure/cache/service/CacheService';

// 模拟缓存服务
const mockCacheService = {
  set: jest.fn()
};

describe('CacheWarmupService', () => {
  let warmupService: CacheWarmupService;

  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
    
    // 注册模拟服务
    container.register(CacheService, { useValue: mockCacheService });
    
    // 获取服务实例
    warmupService = container.resolve(CacheWarmupService);
  });

  test('should execute warmup task with startup strategy', async () => {
    // 定义测试数据
    const testData = [{ id: 1, name: 'Test User 1' }, { id: 2, name: 'Test User 2' }];
    
    // 定义预热任务
    const warmupTask = {
      id: 'test-task',
      name: '测试预热任务',
      keyTemplate: 'test:key:{id}',
      dataProvider: async () => testData,
      ttl: 3600
    };
    
    // 执行预热
    const result = await warmupService.warmupTask(warmupTask, 'startup');
    
    // 验证结果
    expect(result.taskId).toBe('test-task');
    expect(result.count).toBe(2);
    expect(result.successCount).toBe(2);
    expect(result.failedCount).toBe(0);
    expect(result.status).toBe('success');
    
    // 验证缓存设置调用
    expect(mockCacheService.set).toHaveBeenCalledTimes(2);
    expect(mockCacheService.set).toHaveBeenCalledWith('test:key:1', testData[0], 3600);
    expect(mockCacheService.set).toHaveBeenCalledWith('test:key:2', testData[1], 3600);
  });

  test('should handle warmup task failure', async () => {
    // 模拟缓存服务失败
    mockCacheService.set.mockRejectedValue(new Error('缓存设置失败'));
    
    // 定义测试数据
    const testData = [{ id: 1, name: 'Test User 1' }];
    
    // 定义预热任务
    const warmupTask = {
      id: 'test-task',
      name: '测试预热任务',
      keyTemplate: 'test:key:{id}',
      dataProvider: async () => testData,
      ttl: 3600
    };
    
    // 执行预热
    const result = await warmupService.warmupTask(warmupTask, 'startup');
    
    // 验证结果
    expect(result.taskId).toBe('test-task');
    expect(result.count).toBe(1);
    expect(result.successCount).toBe(0);
    expect(result.failedCount).toBe(1);
    expect(result.status).toBe('failed');
  });
});
```

### 5.2 集成测试

```typescript
// tests/integration/cache-warmup.integration.test.ts
import 'reflect-metadata';
import { container } from 'tsyringe';
import { CacheWarmupService } from '../../src/infrastructure/cache/service/CacheWarmupService';
import { CacheService } from '../../src/infrastructure/cache/service/CacheService';

describe('Cache Warmup Integration', () => {
  let warmupService: CacheWarmupService;
  let cacheService: CacheService;

  beforeAll(() => {
    // 解析服务实例
    warmupService = container.resolve(CacheWarmupService);
    cacheService = container.resolve(CacheService);
  });

  afterAll(async () => {
    // 清理测试数据
    await cacheService.delete('integration:test:1');
    await cacheService.delete('integration:test:2');
    warmupService.destroy();
  });

  test('should warmup cache successfully', async () => {
    // 定义测试数据
    const testData = [
      { id: 1, name: 'Integration Test 1' },
      { id: 2, name: 'Integration Test 2' }
    ];
    
    // 定义预热任务
    const warmupTasks = [{
      id: 'integration-test',
      name: '集成测试预热任务',
      keyTemplate: 'integration:test:{id}',
      dataProvider: async () => testData,
      ttl: 3600
    }];
    
    // 执行预热
    const results = await warmupService.warmup(warmupTasks, 'startup');
    
    // 验证预热结果
    expect(results.length).toBe(1);
    expect(results[0].status).toBe('success');
    expect(results[0].successCount).toBe(2);
    
    // 验证缓存数据
    const cachedData1 = await cacheService.get('integration:test:1');
    const cachedData2 = await cacheService.get('integration:test:2');
    
    expect(cachedData1).toEqual(testData[0]);
    expect(cachedData2).toEqual(testData[1]);
  });
});
```

## 6. 缓存预热监控

### 6.1 监控指标

| 指标名称 | 类型 | 描述 | 单位 |
|---------|------|------|------|
| cache.warmup.task.count | Counter | 预热任务数量 | 个 |
| cache.warmup.data.count | Counter | 预热数据总量 | 条 |
| cache.warmup.success.count | Counter | 预热成功数量 | 条 |
| cache.warmup.failed.count | Counter | 预热失败数量 | 条 |
| cache.warmup.duration | Histogram | 预热耗时 | 毫秒 |
| cache.warmup.status | Gauge | 预热状态（0: 未开始, 1: 进行中, 2: 完成） | - |

### 6.2 监控实现

```typescript
// src/infrastructure/cache/monitor/CacheWarmupMetrics.ts
import { injectable, inject } from 'tsyringe';

/**
 * 缓存预热监控指标
 */
@injectable()
export class CacheWarmupMetrics {
  private taskCount = 0;
  private dataCount = 0;
  private successCount = 0;
  private failedCount = 0;
  private warmupDurations: number[] = [];
  private warmupStatus = 0; // 0: 未开始, 1: 进行中, 2: 完成

  /**
   * 记录预热开始
   */
  public recordWarmupStart(): void {
    this.warmupStatus = 1;
  }

  /**
   * 记录预热完成
   */
  public recordWarmupComplete(): void {
    this.warmupStatus = 2;
  }

  /**
   * 记录预热任务
   * @param taskCount 任务数量
   */
  public recordWarmupTasks(taskCount: number): void {
    this.taskCount += taskCount;
  }

  /**
   * 记录预热数据
   * @param dataCount 数据数量
   * @param successCount 成功数量
   * @param failedCount 失败数量
   */
  public recordWarmupData(dataCount: number, successCount: number, failedCount: number): void {
    this.dataCount += dataCount;
    this.successCount += successCount;
    this.failedCount += failedCount;
  }

  /**
   * 记录预热耗时
   * @param duration 耗时（毫秒）
   */
  public recordWarmupDuration(duration: number): void {
    this.warmupDurations.push(duration);
    // 保持数组大小在合理范围内
    if (this.warmupDurations.length > 1000) {
      this.warmupDurations.shift();
    }
  }

  /**
   * 获取平均预热耗时
   */
  public getAverageWarmupDuration(): number {
    if (this.warmupDurations.length === 0) {
      return 0;
    }
    const sum = this.warmupDurations.reduce((a, b) => a + b, 0);
    return sum / this.warmupDurations.length;
  }

  /**
   * 获取预热成功率
   */
  public getWarmupSuccessRate(): number {
    if (this.dataCount === 0) {
      return 0;
    }
    return (this.successCount / this.dataCount) * 100;
  }

  /**
   * 获取预热监控统计信息
   */
  public getStats(): {
    taskCount: number;
    dataCount: number;
    successCount: number;
    failedCount: number;
    averageDuration: number;
    successRate: number;
    status: number;
  } {
    return {
      taskCount: this.taskCount,
      dataCount: this.dataCount,
      successCount: this.successCount,
      failedCount: this.failedCount,
      averageDuration: this.getAverageWarmupDuration(),
      successRate: this.getWarmupSuccessRate(),
      status: this.warmupStatus
    };
  }

  /**
   * 重置监控指标
   */
  public reset(): void {
    this.taskCount = 0;
    this.dataCount = 0;
    this.successCount = 0;
    this.failedCount = 0;
    this.warmupDurations = [];
    this.warmupStatus = 0;
  }
}
```

## 7. 总结

本文档实现了缓存预热的核心功能，包括：

1. **多种预热策略**：实现了启动预热、定时预热和事件驱动预热三种策略
2. **灵活的预热服务**：提供了统一的缓存预热服务，支持多种预热策略
3. **批量处理机制**：支持批量加载和设置缓存数据，提高预热效率
4. **事件驱动架构**：通过事件机制实现了缓存预热的解耦
5. **完整的测试方案**：包括单元测试和集成测试
6. **监控指标**：提供了缓存预热相关的监控指标

缓存预热实现遵循了Clean Architecture原则，将缓存预热逻辑与业务逻辑分离，通过依赖注入实现解耦，便于测试和扩展。同时，采用异步处理和批量操作，确保预热过程不会阻塞系统启动，提高了系统的可靠性和可用性。