# 127-缓存失效机制代码

## 1. 缓存失效机制概述

缓存失效是指缓存中的数据与数据源不一致的情况。在分布式系统中，缓存失效是一个常见的问题，需要合理的机制来确保缓存与数据源的一致性。

### 1.1 缓存失效类型

1. **时间过期失效**：缓存数据达到预设的过期时间后自动失效
2. **主动更新失效**：数据更新时主动删除或更新缓存
3. **被动失效**：缓存服务器故障或内存不足导致缓存数据丢失
4. **一致性失效**：由于并发写操作导致缓存与数据源不一致

### 1.2 缓存失效策略

1. **Cache-Aside模式**：先更新数据库，再删除缓存
2. **Write-Through模式**：先更新缓存，再更新数据库
3. **Write-Back模式**：先更新缓存，异步更新数据库
4. **事件驱动模式**：通过事件机制实现缓存失效

## 2. 缓存失效机制设计

### 2.1 缓存失效架构

```
+----------------+     +----------------+     +----------------+     +----------------+
|  Application   |     |  Cache Service |     |  Redis Cluster |     |  Database      |
|   Layer        |---->|  (Infrastructure|---->|                |<--->|  Layer         |
|                |     |   Layer)       |     |                |     |                |
+----------------+     +----------------+     +----------------+     +----------------+
          ^                        ^
          |                        |
          |                        |
+----------------+     +----------------+
|  Event Bus     |<----|  Cache Invalidation |
|  (Infrastructure|     |  Service       |
|   Layer)       |     |                |
+----------------+     +----------------+
```

### 2.2 缓存失效策略选择

| 策略 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Cache-Aside | 实现简单，一致性较好 | 可能存在短暂不一致 | 读多写少场景 |
| Write-Through | 数据一致性好 | 写入性能较低 | 写操作较少场景 |
| Write-Back | 写入性能高 | 数据一致性较差，可能丢失数据 | 写操作频繁场景 |
| 事件驱动 | 解耦性好，扩展性强 | 实现复杂，延迟较高 | 分布式系统场景 |

## 3. 缓存失效机制实现

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
        │   └── CacheInvalidationService.ts  # 缓存失效服务
        ├── event-handlers/  # 事件处理器
        │   ├── CacheEventHandler.ts     # 基础缓存事件处理器
        │   ├── HotDataEventHandler.ts    # 热点数据事件处理器
        │   └── CacheInvalidationEventHandler.ts  # 缓存失效事件处理器
        ├── invalidation/  # 缓存失效策略
        │   ├── CacheInvalidationStrategy.ts  # 缓存失效策略接口
        │   ├── TimeBasedInvalidation.ts  # 时间基于失效策略
        │   ├── EventBasedInvalidation.ts  # 事件基于失效策略
        │   └── WriteThroughInvalidation.ts  # 写穿失效策略
        └── warmup/      # 缓存预热
            └── CacheWarmupService.ts     # 缓存预热服务
```

### 3.2 缓存失效策略接口

```typescript
// src/infrastructure/cache/invalidation/CacheInvalidationStrategy.ts

/**
 * 缓存失效策略接口
 */
export interface CacheInvalidationStrategy {
  /**
   * 初始化失效策略
   */
  init(): void;
  
  /**
   * 处理缓存失效
   * @param key 缓存键
   * @param reason 失效原因
   */
  invalidate(key: string, reason?: string): Promise<void>;
  
  /**
   * 批量处理缓存失效
   * @param keys 缓存键列表
   * @param reason 失效原因
   */
  invalidateBatch(keys: string[], reason?: string): Promise<void>;
  
  /**
   * 销毁失效策略
   */
  destroy(): void;
}
```

### 3.3 基于时间的失效策略

```typescript
// src/infrastructure/cache/invalidation/TimeBasedInvalidation.ts
import { injectable, inject } from 'tsyringe';
import { CacheInvalidationStrategy } from './CacheInvalidationStrategy';
import { CacheService } from '../service/CacheService';

/**
 * 基于时间的缓存失效策略
 */
@injectable()
export class TimeBasedInvalidation implements CacheInvalidationStrategy {
  constructor(@inject(CacheService) private cacheService: CacheService) {}

  /**
   * 初始化失效策略
   */
  public init(): void {
    // 基于时间的失效策略不需要额外初始化，依赖Redis的TTL机制
  }

  /**
   * 处理缓存失效
   * @param key 缓存键
   * @param reason 失效原因
   */
  public async invalidate(key: string, reason?: string): Promise<void> {
    // 基于时间的失效策略直接删除缓存
    await this.cacheService.delete(key);
    console.log(`基于时间的缓存失效: ${key}, 原因: ${reason || '未知'}`);
  }

  /**
   * 批量处理缓存失效
   * @param keys 缓存键列表
   * @param reason 失效原因
   */
  public async invalidateBatch(keys: string[], reason?: string): Promise<void> {
    // 批量删除缓存
    await this.cacheService.deleteBatch(keys);
    console.log(`基于时间的批量缓存失效: ${keys.length}个键, 原因: ${reason || '未知'}`);
  }

  /**
   * 销毁失效策略
   */
  public destroy(): void {
    // 基于时间的失效策略不需要额外销毁
  }
}
```

### 3.4 基于事件的失效策略

```typescript
// src/infrastructure/cache/invalidation/EventBasedInvalidation.ts
import { injectable, inject } from 'tsyringe';
import { CacheInvalidationStrategy } from './CacheInvalidationStrategy';
import { CacheService } from '../service/CacheService';
import { eventBus } from '../../event-bus/event-bus';

/**
 * 基于事件的缓存失效策略
 */
@injectable()
export class EventBasedInvalidation implements CacheInvalidationStrategy {
  private eventListeners: Map<string, (data: any) => void> = new Map();

  constructor(@inject(CacheService) private cacheService: CacheService) {}

  /**
   * 初始化失效策略
   */
  public init(): void {
    // 订阅缓存失效事件
    this.subscribeToEvents();
  }

  /**
   * 订阅事件
   */
  private subscribeToEvents(): void {
    const cacheInvalidateListener = (data: { key: string; reason?: string }) => {
      this.invalidate(data.key, data.reason);
    };
    
    const cacheInvalidateBatchListener = (data: { keys: string[]; reason?: string }) => {
      this.invalidateBatch(data.keys, data.reason);
    };
    
    eventBus.subscribe('cache:invalidate', cacheInvalidateListener);
    eventBus.subscribe('cache:invalidate:batch', cacheInvalidateBatchListener);
    
    this.eventListeners.set('cache:invalidate', cacheInvalidateListener);
    this.eventListeners.set('cache:invalidate:batch', cacheInvalidateBatchListener);
  }

  /**
   * 处理缓存失效
   * @param key 缓存键
   * @param reason 失效原因
   */
  public async invalidate(key: string, reason?: string): Promise<void> {
    // 基于事件的失效策略直接删除缓存
    await this.cacheService.delete(key);
    console.log(`基于事件的缓存失效: ${key}, 原因: ${reason || '未知'}`);
  }

  /**
   * 批量处理缓存失效
   * @param keys 缓存键列表
   * @param reason 失效原因
   */
  public async invalidateBatch(keys: string[], reason?: string): Promise<void> {
    // 批量删除缓存
    await this.cacheService.deleteBatch(keys);
    console.log(`基于事件的批量缓存失效: ${keys.length}个键, 原因: ${reason || '未知'}`);
  }

  /**
   * 销毁失效策略
   */
  public destroy(): void {
    // 取消订阅事件
    for (const [event, listener] of this.eventListeners.entries()) {
      eventBus.unsubscribe(event, listener);
    }
    this.eventListeners.clear();
  }
}
```

### 3.5 写穿失效策略

```typescript
// src/infrastructure/cache/invalidation/WriteThroughInvalidation.ts
import { injectable, inject } from 'tsyringe';
import { CacheInvalidationStrategy } from './CacheInvalidationStrategy';
import { CacheService } from '../service/CacheService';

/**
 * 写穿缓存失效策略
 */
@injectable()
export class WriteThroughInvalidation implements CacheInvalidationStrategy {
  constructor(@inject(CacheService) private cacheService: CacheService) {}

  /**
   * 初始化失效策略
   */
  public init(): void {
    // 写穿失效策略不需要额外初始化
  }

  /**
   * 处理缓存失效
   * @param key 缓存键
   * @param reason 失效原因
   */
  public async invalidate(key: string, reason?: string): Promise<void> {
    // 写穿失效策略直接删除缓存
    await this.cacheService.delete(key);
    console.log(`写穿缓存失效: ${key}, 原因: ${reason || '未知'}`);
  }

  /**
   * 批量处理缓存失效
   * @param keys 缓存键列表
   * @param reason 失效原因
   */
  public async invalidateBatch(keys: string[], reason?: string): Promise<void> {
    // 批量删除缓存
    await this.cacheService.deleteBatch(keys);
    console.log(`写穿批量缓存失效: ${keys.length}个键, 原因: ${reason || '未知'}`);
  }

  /**
   * 销毁失效策略
   */
  public destroy(): void {
    // 写穿失效策略不需要额外销毁
  }
}
```

### 3.6 缓存失效服务

```typescript
// src/infrastructure/cache/service/CacheInvalidationService.ts
import { injectable, inject } from 'tsyringe';
import { CacheService } from './CacheService';
import { CacheInvalidationStrategy } from '../invalidation/CacheInvalidationStrategy';
import { TimeBasedInvalidation } from '../invalidation/TimeBasedInvalidation';
import { EventBasedInvalidation } from '../invalidation/EventBasedInvalidation';
import { WriteThroughInvalidation } from '../invalidation/WriteThroughInvalidation';
import { eventBus } from '../../event-bus/event-bus';

/**
 * 缓存失效服务
 */
@injectable()
export class CacheInvalidationService {
  private strategies: Map<string, CacheInvalidationStrategy> = new Map();
  private defaultStrategy: CacheInvalidationStrategy;

  constructor(@inject(CacheService) private cacheService: CacheService) {
    // 初始化失效策略
    this.initStrategies();
    
    // 设置默认策略
    this.defaultStrategy = this.strategies.get('event-based')!;
  }

  /**
   * 初始化失效策略
   */
  private initStrategies(): void {
    // 创建失效策略实例
    const timeBasedStrategy = new TimeBasedInvalidation(this.cacheService);
    const eventBasedStrategy = new EventBasedInvalidation(this.cacheService);
    const writeThroughStrategy = new WriteThroughInvalidation(this.cacheService);
    
    // 初始化策略
    timeBasedStrategy.init();
    eventBasedStrategy.init();
    writeThroughStrategy.init();
    
    // 注册策略
    this.strategies.set('time-based', timeBasedStrategy);
    this.strategies.set('event-based', eventBasedStrategy);
    this.strategies.set('write-through', writeThroughStrategy);
  }

  /**
   * 设置默认失效策略
   * @param strategyName 策略名称
   */
  public setDefaultStrategy(strategyName: string): void {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`无效的失效策略: ${strategyName}`);
    }
    this.defaultStrategy = strategy;
  }

  /**
   * 处理缓存失效
   * @param key 缓存键
   * @param reason 失效原因
   * @param strategyName 策略名称
   */
  public async invalidate(key: string, reason?: string, strategyName?: string): Promise<void> {
    const strategy = strategyName ? this.strategies.get(strategyName) : this.defaultStrategy;
    if (!strategy) {
      throw new Error(`无效的失效策略: ${strategyName}`);
    }
    
    await strategy.invalidate(key, reason);
  }

  /**
   * 批量处理缓存失效
   * @param keys 缓存键列表
   * @param reason 失效原因
   * @param strategyName 策略名称
   */
  public async invalidateBatch(keys: string[], reason?: string, strategyName?: string): Promise<void> {
    const strategy = strategyName ? this.strategies.get(strategyName) : this.defaultStrategy;
    if (!strategy) {
      throw new Error(`无效的失效策略: ${strategyName}`);
    }
    
    await strategy.invalidateBatch(keys, reason);
  }

  /**
   * 通过事件处理缓存失效
   * @param key 缓存键
   * @param reason 失效原因
   */
  public invalidateByEvent(key: string, reason?: string): void {
    eventBus.publish('cache:invalidate', { key, reason });
  }

  /**
   * 通过事件批量处理缓存失效
   * @param keys 缓存键列表
   * @param reason 失效原因
   */
  public invalidateBatchByEvent(keys: string[], reason?: string): void {
    eventBus.publish('cache:invalidate:batch', { keys, reason });
  }

  /**
   * 销毁缓存失效服务
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

### 3.7 缓存失效事件处理器

```typescript
// src/infrastructure/cache/event-handlers/CacheInvalidationEventHandler.ts
import { injectable, inject } from 'tsyringe';
import { eventBus } from '../../event-bus/event-bus';
import { CacheInvalidationService } from '../service/CacheInvalidationService';

/**
 * 缓存失效事件处理器
 */
@injectable()
export class CacheInvalidationEventHandler {
  constructor(@inject(CacheInvalidationService) private invalidationService: CacheInvalidationService) {
    // 订阅业务事件
    this.subscribeToBusinessEvents();
  }

  /**
   * 订阅业务事件
   */
  private subscribeToBusinessEvents(): void {
    // 订阅用户模型更新事件
    eventBus.subscribe('user:model:updated', this.handleUserModelUpdated.bind(this));
    eventBus.subscribe('user:model:deleted', this.handleUserModelDeleted.bind(this));
    
    // 订阅认知概念更新事件
    eventBus.subscribe('cognitive:concept:updated', this.handleCognitiveConceptUpdated.bind(this));
    eventBus.subscribe('cognitive:concept:deleted', this.handleCognitiveConceptDeleted.bind(this));
    
    // 订阅认知关系更新事件
    eventBus.subscribe('cognitive:relation:updated', this.handleCognitiveRelationUpdated.bind(this));
    eventBus.subscribe('cognitive:relation:deleted', this.handleCognitiveRelationDeleted.bind(this));
  }

  /**
   * 处理用户模型更新事件
   * @param data 事件数据
   */
  private async handleUserModelUpdated(data: { userId: number; modelType: string; model: any }): Promise<void> {
    const { userId, modelType } = data;
    await this.invalidationService.invalidate(
      `user:model:${userId}:${modelType}`,
      '用户模型更新'
    );
  }

  /**
   * 处理用户模型删除事件
   * @param data 事件数据
   */
  private async handleUserModelDeleted(data: { userId: number; modelType: string }): Promise<void> {
    const { userId, modelType } = data;
    await this.invalidationService.invalidate(
      `user:model:${userId}:${modelType}`,
      '用户模型删除'
    );
  }

  /**
   * 处理认知概念更新事件
   * @param data 事件数据
   */
  private async handleCognitiveConceptUpdated(data: { modelId: string; concept: any }): Promise<void> {
    const { modelId } = data;
    await this.invalidationService.invalidateBatch(
      [
        `cognitive:concepts:${modelId}`,
        `cognitive:model:${modelId}:concepts`
      ],
      '认知概念更新'
    );
  }

  /**
   * 处理认知概念删除事件
   * @param data 事件数据
   */
  private async handleCognitiveConceptDeleted(data: { modelId: string; conceptId: string }): Promise<void> {
    const { modelId, conceptId } = data;
    await this.invalidationService.invalidateBatch(
      [
        `cognitive:concepts:${modelId}`,
        `cognitive:model:${modelId}:concepts`,
        `cognitive:concept:${conceptId}`
      ],
      '认知概念删除'
    );
  }

  /**
   * 处理认知关系更新事件
   * @param data 事件数据
   */
  private async handleCognitiveRelationUpdated(data: { modelId: string; relation: any }): Promise<void> {
    const { modelId } = data;
    await this.invalidationService.invalidateBatch(
      [
        `cognitive:relations:${modelId}`,
        `cognitive:model:${modelId}:relations`
      ],
      '认知关系更新'
    );
  }

  /**
   * 处理认知关系删除事件
   * @param data 事件数据
   */
  private async handleCognitiveRelationDeleted(data: { modelId: string; relationId: string }): Promise<void> {
    const { modelId, relationId } = data;
    await this.invalidationService.invalidateBatch(
      [
        `cognitive:relations:${modelId}`,
        `cognitive:model:${modelId}:relations`,
        `cognitive:relation:${relationId}`
      ],
      '认知关系删除'
    );
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
import { HotDataMonitor, HotDataMonitorConfig } from './monitor/HotDataMonitor';
import { CacheWarmupService } from './warmup/CacheWarmupService';
import { CacheEventHandler } from './event-handlers/CacheEventHandler';
import { HotDataEventHandler } from './event-handlers/HotDataEventHandler';
import { CacheInvalidationEventHandler } from './event-handlers/CacheInvalidationEventHandler';

// 注册热点数据监控配置
container.register(HotDataMonitorConfig, {
  useValue: {
    frequencyThreshold: 100,  // 100次/分钟
    timeWindow: 5,            // 5分钟时间窗口
    hotDataTtl: 3600 * 24     // 热点数据缓存24小时
  }
});

// 注册缓存服务
container.register(RedisConfig, { useValue: new RedisConfig() });
container.register(RedisConnection, { useClass: RedisConnection });
container.register(RedisClient, { useClass: RedisClient });
container.register(CacheService, { useClass: CacheService });
container.register(HotDataCacheService, { useClass: HotDataCacheService });
container.register(CacheInvalidationService, { useClass: CacheInvalidationService });
container.register(HotDataMonitor, { useClass: HotDataMonitor });
container.register(CacheWarmupService, { useClass: CacheWarmupService });
container.register(CacheEventHandler, { useClass: CacheEventHandler });
container.register(HotDataEventHandler, { useClass: HotDataEventHandler });
container.register(CacheInvalidationEventHandler, { useClass: CacheInvalidationEventHandler });

export { CacheService, HotDataCacheService, CacheInvalidationService, CacheWarmupService };
```

## 4. 缓存失效机制使用示例

### 4.1 在业务服务中使用缓存失效

```typescript
// src/application/services/user.service.ts
import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { HotDataCacheService } from '../../infrastructure/cache/service/HotDataCacheService';
import { CacheInvalidationService } from '../../infrastructure/cache/service/CacheInvalidationService';
import { eventBus } from '../../infrastructure/event-bus/event-bus';

@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(HotDataCacheService) private hotDataCacheService: HotDataCacheService,
    @inject(CacheInvalidationService) private invalidationService: CacheInvalidationService
  ) {}

  /**
   * 获取用户认知模型（带热点数据缓存）
   * @param userId 用户ID
   * @param modelType 模型类型
   */
  async getUserCognitiveModel(userId: number, modelType: string) {
    const cacheKey = `user:model:${userId}:${modelType}`;
    
    return this.hotDataCacheService.getWithHotDataMonitoring(
      cacheKey,
      () => this.userRepository.getCognitiveModel(userId, modelType),
      3600 // 普通缓存1小时，热点数据会自动延长
    );
  }

  /**
   * 更新用户认知模型
   * @param userId 用户ID
   * @param modelType 模型类型
   * @param model 模型数据
   */
  async updateCognitiveModel(userId: number, modelType: string, model: any) {
    // 更新数据库
    const updatedModel = await this.userRepository.updateCognitiveModel(userId, modelType, model);
    
    // 直接调用缓存失效服务
    await this.invalidationService.invalidate(
      `user:model:${userId}:${modelType}`,
      '用户模型更新'
    );
    
    // 或者通过事件发布缓存失效
    // eventBus.publish('user:model:updated', { userId, modelType, model: updatedModel });
    
    return updatedModel;
  }

  /**
   * 删除用户认知模型
   * @param userId 用户ID
   * @param modelType 模型类型
   */
  async deleteCognitiveModel(userId: number, modelType: string) {
    // 删除数据库记录
    await this.userRepository.deleteCognitiveModel(userId, modelType);
    
    // 批量失效相关缓存
    await this.invalidationService.invalidateBatch(
      [
        `user:model:${userId}:${modelType}`,
        `user:models:${userId}`,
        `user:stats:${userId}`
      ],
      '用户模型删除'
    );
    
    return true;
  }
}
```

### 4.2 在控制器中使用缓存失效

```typescript
// src/presentation/controllers/user.controller.ts
import { injectable, inject } from 'tsyringe';
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../../application/services/user.service';
import { CacheInvalidationService } from '../../infrastructure/cache/service/CacheInvalidationService';

@injectable()
export class UserController {
  constructor(
    @inject(UserService) private userService: UserService,
    @inject(CacheInvalidationService) private invalidationService: CacheInvalidationService
  ) {}

  /**
   * 获取用户认知模型
   * @param request FastifyRequest
   * @param reply FastifyReply
   */
  async getCognitiveModel(request: FastifyRequest<{ Params: { userId: string; modelType: string } }>, reply: FastifyReply) {
    const { userId, modelType } = request.params;
    const model = await this.userService.getUserCognitiveModel(parseInt(userId), modelType);
    return reply.send(model);
  }

  /**
   * 更新用户认知模型
   * @param request FastifyRequest
   * @param reply FastifyReply
   */
  async updateCognitiveModel(request: FastifyRequest<{ Params: { userId: string; modelType: string }; Body: any }>, reply: FastifyReply) {
    const { userId, modelType } = request.params;
    const model = await this.userService.updateCognitiveModel(parseInt(userId), modelType, request.body);
    return reply.send(model);
  }

  /**
   * 手动失效用户认知模型缓存
   * @param request FastifyRequest
   * @param reply FastifyReply
   */
  async invalidateCognitiveModelCache(request: FastifyRequest<{ Params: { userId: string; modelType: string } }>, reply: FastifyReply) {
    const { userId, modelType } = request.params;
    
    // 手动失效缓存
    await this.invalidationService.invalidate(
      `user:model:${userId}:${modelType}`,
      '手动失效'
    );
    
    return reply.send({ message: '缓存已失效' });
  }
}
```

## 5. 缓存失效机制测试

### 5.1 单元测试

```typescript
// tests/infrastructure/cache/service/CacheInvalidationService.test.ts
import { container } from 'tsyringe';
import { CacheInvalidationService } from '../../../src/infrastructure/cache/service/CacheInvalidationService';
import { CacheService } from '../../../src/infrastructure/cache/service/CacheService';

// 模拟缓存服务
const mockCacheService = {
  delete: jest.fn(),
  deleteBatch: jest.fn()
};

describe('CacheInvalidationService', () => {
  let invalidationService: CacheInvalidationService;

  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
    
    // 注册模拟服务
    container.register(CacheService, { useValue: mockCacheService });
    
    // 获取服务实例
    invalidationService = container.resolve(CacheInvalidationService);
  });

  test('should invalidate cache with default strategy', async () => {
    const cacheKey = 'test:key';
    
    await invalidationService.invalidate(cacheKey, '测试失效');
    
    expect(mockCacheService.delete).toHaveBeenCalledWith(cacheKey);
  });

  test('should invalidate cache with specified strategy', async () => {
    const cacheKey = 'test:key';
    
    await invalidationService.invalidate(cacheKey, '测试失效', 'time-based');
    
    expect(mockCacheService.delete).toHaveBeenCalledWith(cacheKey);
  });

  test('should invalidate batch cache with default strategy', async () => {
    const cacheKeys = ['test:key1', 'test:key2', 'test:key3'];
    
    await invalidationService.invalidateBatch(cacheKeys, '测试批量失效');
    
    expect(mockCacheService.deleteBatch).toHaveBeenCalledWith(cacheKeys);
  });

  test('should invalidate batch cache with specified strategy', async () => {
    const cacheKeys = ['test:key1', 'test:key2', 'test:key3'];
    
    await invalidationService.invalidateBatch(cacheKeys, '测试批量失效', 'write-through');
    
    expect(mockCacheService.deleteBatch).toHaveBeenCalledWith(cacheKeys);
  });
});
```

### 5.2 集成测试

```typescript
// tests/integration/cache-invalidation.integration.test.ts
import 'reflect-metadata';
import { container } from 'tsyringe';
import { CacheInvalidationService } from '../../src/infrastructure/cache/service/CacheInvalidationService';
import { CacheService } from '../../src/infrastructure/cache/service/CacheService';
import { eventBus } from '../../src/infrastructure/event-bus/event-bus';

describe('Cache Invalidation Integration', () => {
  let invalidationService: CacheInvalidationService;
  let cacheService: CacheService;

  beforeAll(() => {
    // 解析服务实例
    invalidationService = container.resolve(CacheInvalidationService);
    cacheService = container.resolve(CacheService);
  });

  afterAll(async () => {
    // 清理测试数据
    await cacheService.delete('test:integration:key');
    invalidationService.destroy();
  });

  test('should invalidate cache through event', async () => {
    const cacheKey = 'test:integration:key';
    const testValue = { data: 'test' };
    
    // 设置缓存
    await cacheService.set(cacheKey, testValue);
    
    // 验证缓存设置成功
    let cachedValue = await cacheService.get(cacheKey);
    expect(cachedValue).toEqual(testValue);
    
    // 通过事件失效缓存
    invalidationService.invalidateByEvent(cacheKey, '集成测试失效');
    
    // 等待事件处理完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 验证缓存已失效
    cachedValue = await cacheService.get(cacheKey);
    expect(cachedValue).toBeNull();
  });
});
```

## 6. 缓存失效机制监控

### 6.1 监控指标

| 指标名称 | 类型 | 描述 | 单位 |
|---------|------|------|------|
| cache.invalidation.count | Counter | 缓存失效次数 | 次 |
| cache.invalidation.batch_count | Counter | 批量缓存失效次数 | 次 |
| cache.invalidation.time | Histogram | 缓存失效处理时间 | 毫秒 |
| cache.invalidation.error_count | Counter | 缓存失效错误次数 | 次 |
| cache.invalidation.strategy_usage | Counter | 各失效策略使用次数 | 次 |

### 6.2 监控实现

```typescript
// src/infrastructure/cache/monitor/CacheInvalidationMetrics.ts
import { injectable, inject } from 'tsyringe';

/**
 * 缓存失效监控指标
 */
@injectable()
export class CacheInvalidationMetrics {
  private invalidationCount = 0;
  private batchInvalidationCount = 0;
  private invalidationErrors = 0;
  private invalidationTimes: number[] = [];
  private strategyUsage: Map<string, number> = new Map();

  /**
   * 记录缓存失效
   * @param strategy 失效策略
   * @param time 处理时间（毫秒）
   */
  public recordInvalidation(strategy: string, time: number): void {
    this.invalidationCount++;
    this.invalidationTimes.push(time);
    this.updateStrategyUsage(strategy);
    
    // 保持数组大小在合理范围内
    if (this.invalidationTimes.length > 1000) {
      this.invalidationTimes.shift();
    }
  }

  /**
   * 记录批量缓存失效
   * @param strategy 失效策略
   * @param count 失效数量
   * @param time 处理时间（毫秒）
   */
  public recordBatchInvalidation(strategy: string, count: number, time: number): void {
    this.batchInvalidationCount++;
    this.invalidationCount += count;
    this.invalidationTimes.push(time);
    this.updateStrategyUsage(strategy);
    
    // 保持数组大小在合理范围内
    if (this.invalidationTimes.length > 1000) {
      this.invalidationTimes.shift();
    }
  }

  /**
   * 记录缓存失效错误
   */
  public recordInvalidationError(): void {
    this.invalidationErrors++;
  }

  /**
   * 更新策略使用情况
   * @param strategy 失效策略
   */
  private updateStrategyUsage(strategy: string): void {
    const currentCount = this.strategyUsage.get(strategy) || 0;
    this.strategyUsage.set(strategy, currentCount + 1);
  }

  /**
   * 获取平均失效处理时间
   */
  public getAverageInvalidationTime(): number {
    if (this.invalidationTimes.length === 0) {
      return 0;
    }
    const sum = this.invalidationTimes.reduce((a, b) => a + b, 0);
    return sum / this.invalidationTimes.length;
  }

  /**
   * 获取失效错误率
   */
  public getInvalidationErrorRate(): number {
    if (this.invalidationCount === 0) {
      return 0;
    }
    return (this.invalidationErrors / this.invalidationCount) * 100;
  }

  /**
   * 获取监控统计信息
   */
  public getStats(): {
    invalidationCount: number;
    batchInvalidationCount: number;
    averageInvalidationTime: number;
    invalidationErrorRate: number;
    strategyUsage: Record<string, number>;
  } {
    return {
      invalidationCount: this.invalidationCount,
      batchInvalidationCount: this.batchInvalidationCount,
      averageInvalidationTime: this.getAverageInvalidationTime(),
      invalidationErrorRate: this.getInvalidationErrorRate(),
      strategyUsage: Object.fromEntries(this.strategyUsage)
    };
  }
}
```

## 7. 总结

本文档实现了缓存失效机制的核心功能，包括：

1. **多种失效策略**：实现了基于时间、基于事件和写穿三种缓存失效策略
2. **灵活的失效服务**：提供了统一的缓存失效服务，支持多种失效策略
3. **事件驱动架构**：通过事件机制实现了缓存与业务逻辑的解耦
4. **完整的测试方案**：包括单元测试和集成测试
5. **监控指标**：提供了缓存失效相关的监控指标

缓存失效机制实现遵循了Clean Architecture原则，将缓存失效逻辑与业务逻辑分离，通过依赖注入实现解耦，便于测试和扩展。同时，采用事件驱动架构确保缓存与数据库的一致性，提高了系统的可靠性和可维护性。