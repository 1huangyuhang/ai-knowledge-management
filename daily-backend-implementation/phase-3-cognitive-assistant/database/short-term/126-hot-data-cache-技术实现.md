# 126-热点数据缓存代码

## 1. 热点数据缓存概述

热点数据是指系统中访问频率高的数据，通常占总体数据的一小部分（20%），但却占据了大部分（80%）的访问量。对热点数据进行缓存可以显著提高系统性能，降低数据库负载。

### 1.1 热点数据特征

1. **高访问频率**：短时间内被多次访问
2. **相对稳定**：数据变化频率较低
3. **访问集中**：特定时间段内集中访问
4. **影响范围广**：缓存失效会导致数据库压力骤增

### 1.2 热点数据识别策略

1. **访问频率统计**：统计数据访问次数，超过阈值则判定为热点数据
2. **访问时间窗口**：在特定时间窗口内统计访问次数
3. **慢查询关联**：与慢查询日志关联，识别导致性能问题的热点数据
4. **业务特征分析**：根据业务特征识别潜在热点数据

## 2. 热点数据缓存设计

### 2.1 热点数据缓存架构

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
|  Event Bus     |<----|  Hot Data      |
|  (Infrastructure|     |  Monitor       |
|   Layer)       |     |                |
+----------------+     +----------------+
```

### 2.2 热点数据缓存策略

1. **Cache-Aside模式**：先检查缓存，缓存未命中则从数据库获取并更新缓存
2. **TTL策略**：为热点数据设置合理的过期时间
3. **缓存预热**：系统启动时加载热点数据到缓存
4. **缓存监控**：实时监控热点数据访问情况
5. **动态调整**：根据访问情况动态调整缓存策略

## 3. 热点数据缓存实现

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
        │   └── HotDataCacheService.ts    # 热点数据缓存服务
        ├── event-handlers/  # 事件处理器
        │   ├── CacheEventHandler.ts     # 基础缓存事件处理器
        │   └── HotDataEventHandler.ts    # 热点数据事件处理器
        ├── monitor/     # 热点数据监控
        │   └── HotDataMonitor.ts         # 热点数据监控器
        └── warmup/      # 缓存预热
            └── CacheWarmupService.ts     # 缓存预热服务
```

### 3.2 热点数据监控实现

```typescript
// src/infrastructure/cache/monitor/HotDataMonitor.ts
import { injectable, inject } from 'tsyringe';
import { CacheService } from '../service/CacheService';

/**
 * 热点数据监控配置
 */
export interface HotDataMonitorConfig {
  /**
   * 访问频率阈值（次/分钟）
   */
  frequencyThreshold: number;
  /**
   * 时间窗口（分钟）
   */
  timeWindow: number;
  /**
   * 热点数据缓存有效期（秒）
   */
  hotDataTtl: number;
}

/**
 * 热点数据统计信息
 */
export interface HotDataStats {
  /**
   * 数据键
   */
  key: string;
  /**
   * 访问次数
   */
  count: number;
  /**
   * 最后访问时间
   */
  lastAccessTime: Date;
  /**
   * 是否为热点数据
   */
  isHot: boolean;
}

/**
 * 热点数据监控器
 */
@injectable()
export class HotDataMonitor {
  private statsMap: Map<string, HotDataStats> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private hotDataKeys: Set<string> = new Set();

  constructor(
    @inject('HotDataMonitorConfig') private config: HotDataMonitorConfig,
    @inject(CacheService) private cacheService: CacheService
  ) {
    // 初始化清理定时器，定期清理过期统计信息
    this.cleanupInterval = setInterval(() => this.cleanupStats(), this.config.timeWindow * 60 * 1000);
  }

  /**
   * 记录数据访问
   * @param key 数据键
   */
  public recordAccess(key: string): void {
    const now = new Date();
    let stats = this.statsMap.get(key);

    if (stats) {
      // 更新统计信息
      stats.count += 1;
      stats.lastAccessTime = now;
      
      // 检查是否达到热点数据阈值
      if (stats.count >= this.config.frequencyThreshold && !stats.isHot) {
        stats.isHot = true;
        this.hotDataKeys.add(key);
        this.handleHotData(key);
      }
    } else {
      // 创建新的统计信息
      stats = {
        key,
        count: 1,
        lastAccessTime: now,
        isHot: false
      };
      this.statsMap.set(key, stats);
    }
  }

  /**
   * 处理热点数据
   * @param key 热点数据键
   */
  private async handleHotData(key: string): Promise<void> {
    try {
      // 获取数据值
      const value = await this.cacheService.get(key);
      if (value) {
        // 延长热点数据缓存时间
        await this.cacheService.set(key, value, this.config.hotDataTtl);
      }
    } catch (error) {
      console.error('处理热点数据失败:', error);
    }
  }

  /**
   * 清理过期统计信息
   */
  private cleanupStats(): void {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - this.config.timeWindow * 60 * 1000);

    // 清理过期统计信息
    for (const [key, stats] of this.statsMap.entries()) {
      if (stats.lastAccessTime < cutoffTime) {
        this.statsMap.delete(key);
        this.hotDataKeys.delete(key);
      } else if (stats.isHot && stats.count < this.config.frequencyThreshold) {
        // 不再是热点数据
        stats.isHot = false;
        this.hotDataKeys.delete(key);
      }
    }
  }

  /**
   * 获取热点数据列表
   */
  public getHotDataKeys(): string[] {
    return Array.from(this.hotDataKeys);
  }

  /**
   * 获取数据统计信息
   * @param key 数据键
   */
  public getStats(key: string): HotDataStats | undefined {
    return this.statsMap.get(key);
  }

  /**
   * 销毁监控器
   */
  public destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}
```

### 3.3 热点数据缓存服务实现

```typescript
// src/infrastructure/cache/service/HotDataCacheService.ts
import { injectable, inject } from 'tsyringe';
import { CacheService } from './CacheService';
import { HotDataMonitor } from '../monitor/HotDataMonitor';

/**
 * 热点数据缓存服务
 */
@injectable()
export class HotDataCacheService {
  constructor(
    @inject(CacheService) private cacheService: CacheService,
    @inject(HotDataMonitor) private hotDataMonitor: HotDataMonitor
  ) {}

  /**
   * 获取热点数据（带监控）
   * @param key 缓存键
   * @param fetchFn 数据获取函数（缓存未命中时调用）
   * @param ttl 缓存过期时间（秒）
   */
  public async getWithHotDataMonitoring<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // 记录访问
    this.hotDataMonitor.recordAccess(key);

    // 尝试从缓存获取
    let value = await this.cacheService.get<T>(key);
    if (value) {
      return value;
    }

    // 缓存未命中，从数据源获取
    value = await fetchFn();

    // 设置缓存
    await this.cacheService.set(key, value, ttl);

    return value;
  }

  /**
   * 设置热点数据
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 缓存过期时间（秒）
   */
  public async setHotData<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheService.set(key, value, ttl);
    // 记录为热点数据
    this.hotDataMonitor.recordAccess(key);
  }

  /**
   * 删除热点数据
   * @param key 缓存键
   */
  public async deleteHotData(key: string): Promise<void> {
    await this.cacheService.delete(key);
  }

  /**
   * 批量获取热点数据
   * @param keys 缓存键列表
   */
  public async getHotDataBatch<T>(keys: string[]): Promise<Map<string, T>> {
    // 记录访问
    keys.forEach(key => this.hotDataMonitor.recordAccess(key));
    
    return this.cacheService.getBatch<T>(keys);
  }
}
```

### 3.4 缓存预热服务实现

```typescript
// src/infrastructure/cache/warmup/CacheWarmupService.ts
import { injectable, inject } from 'tsyringe';
import { CacheService } from '../service/CacheService';
import { HotDataCacheService } from '../service/HotDataCacheService';

/**
 * 缓存预热项
 */
export interface CacheWarmupItem {
  /**
   * 缓存键
   */
  key: string;
  /**
   * 数据获取函数
   */
  fetchFn: () => Promise<any>;
  /**
   * 缓存过期时间（秒）
   */
  ttl?: number;
}

/**
 * 缓存预热服务
 */
@injectable()
export class CacheWarmupService {
  constructor(
    @inject(HotDataCacheService) private hotDataCacheService: HotDataCacheService
  ) {}

  /**
   * 预热缓存
   * @param items 预热项列表
   */
  public async warmup(items: CacheWarmupItem[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    // 并行预热
    await Promise.all(
      items.map(async (item) => {
        try {
          const value = await item.fetchFn();
          await this.hotDataCacheService.setHotData(item.key, value, item.ttl);
          success++;
        } catch (error) {
          console.error(`预热缓存失败: ${item.key}`, error);
          failed++;
        }
      })
    );

    return { success, failed };
  }

  /**
   * 预热热点数据
   * @param keys 热点数据键列表
   * @param fetchFn 数据获取函数
   * @param ttl 缓存过期时间（秒）
   */
  public async warmupHotData<T>(
    keys: string[],
    fetchFn: (key: string) => Promise<T>,
    ttl?: number
  ): Promise<{ success: number; failed: number }> {
    const items: CacheWarmupItem[] = keys.map(key => ({
      key,
      fetchFn: () => fetchFn(key),
      ttl
    }));

    return this.warmup(items);
  }
}
```

### 3.5 热点数据事件处理器实现

```typescript
// src/infrastructure/cache/event-handlers/HotDataEventHandler.ts
import { injectable, inject } from 'tsyringe';
import { eventBus } from '../../event-bus/event-bus';
import { CacheService } from '../service/CacheService';
import { HotDataCacheService } from '../service/HotDataCacheService';

/**
 * 热点数据事件处理器
 */
@injectable()
export class HotDataEventHandler {
  constructor(
    @inject(CacheService) private cacheService: CacheService,
    @inject(HotDataCacheService) private hotDataCacheService: HotDataCacheService
  ) {
    // 订阅热点数据相关事件
    this.subscribeToEvents();
  }

  /**
   * 订阅事件
   */
  private subscribeToEvents(): void {
    // 订阅热点数据识别事件
    eventBus.subscribe('hot:data:identified', this.handleHotDataIdentified.bind(this));
    // 订阅热点数据更新事件
    eventBus.subscribe('hot:data:updated', this.handleHotDataUpdated.bind(this));
    // 订阅热点数据删除事件
    eventBus.subscribe('hot:data:deleted', this.handleHotDataDeleted.bind(this));
  }

  /**
   * 处理热点数据识别事件
   * @param data 事件数据
   */
  private async handleHotDataIdentified(data: { key: string; value: any; ttl?: number }): Promise<void> {
    try {
      await this.hotDataCacheService.setHotData(data.key, data.value, data.ttl);
      console.log(`热点数据已缓存: ${data.key}`);
    } catch (error) {
      console.error('处理热点数据识别事件失败:', error);
    }
  }

  /**
   * 处理热点数据更新事件
   * @param data 事件数据
   */
  private async handleHotDataUpdated(data: { key: string; value: any; ttl?: number }): Promise<void> {
    try {
      await this.hotDataCacheService.setHotData(data.key, data.value, data.ttl);
      console.log(`热点数据已更新: ${data.key}`);
    } catch (error) {
      console.error('处理热点数据更新事件失败:', error);
    }
  }

  /**
   * 处理热点数据删除事件
   * @param data 事件数据
   */
  private async handleHotDataDeleted(data: { key: string }): Promise<void> {
    try {
      await this.hotDataCacheService.deleteHotData(data.key);
      console.log(`热点数据已删除: ${data.key}`);
    } catch (error) {
      console.error('处理热点数据删除事件失败:', error);
    }
  }
}
```

### 3.6 依赖注入配置

```typescript
// src/infrastructure/cache/cache.module.ts
import { container } from 'tsyringe';
import { RedisConfig } from './config/RedisConfig';
import { RedisConnection } from './connection/RedisConnection';
import { RedisClient } from './core/RedisClient';
import { CacheService } from './service/CacheService';
import { HotDataCacheService } from './service/HotDataCacheService';
import { HotDataMonitor, HotDataMonitorConfig } from './monitor/HotDataMonitor';
import { CacheWarmupService } from './warmup/CacheWarmupService';
import { CacheEventHandler } from './event-handlers/CacheEventHandler';
import { HotDataEventHandler } from './event-handlers/HotDataEventHandler';

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
container.register(HotDataMonitor, { useClass: HotDataMonitor });
container.register(CacheWarmupService, { useClass: CacheWarmupService });
container.register(CacheEventHandler, { useClass: CacheEventHandler });
container.register(HotDataEventHandler, { useClass: HotDataEventHandler });

export { CacheService, HotDataCacheService, CacheWarmupService };
```

## 4. 热点数据缓存使用示例

### 4.1 在业务服务中使用热点数据缓存

```typescript
// src/application/services/user.service.ts
import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { HotDataCacheService } from '../../infrastructure/cache/service/HotDataCacheService';
import { eventBus } from '../../infrastructure/event-bus/event-bus';

@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(HotDataCacheService) private hotDataCacheService: HotDataCacheService
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
    
    // 发布更新事件
    eventBus.publish('user:model:updated', { userId, modelType, model: updatedModel });
    eventBus.publish('hot:data:updated', { 
      key: `user:model:${userId}:${modelType}`, 
      value: updatedModel 
    });
    
    return updatedModel;
  }
}
```

### 4.2 缓存预热使用示例

```typescript
// src/infrastructure/cache/index.ts
import { container } from 'tsyringe';
import { CacheWarmupService } from './warmup/CacheWarmupService';
import { UserRepository } from '../database/repositories/user.repository';

/**
 * 初始化缓存预热
 */
export async function initCacheWarmup(): Promise<void> {
  const warmupService = container.resolve(CacheWarmupService);
  const userRepository = container.resolve(UserRepository);

  try {
    // 获取需要预热的热点数据（示例：获取活跃用户列表）
    const activeUsers = await userRepository.getActiveUsers(100); // 获取前100个活跃用户
    
    // 预热用户认知模型
    await warmupService.warmupHotData(
      activeUsers.map(user => `user:model:${user.id}:personal`),
      async (key) => {
        const parts = key.split(':');
        const userId = parseInt(parts[2]);
        return userRepository.getCognitiveModel(userId, 'personal');
      },
      3600
    );

    console.log('缓存预热完成');
  } catch (error) {
    console.error('缓存预热失败:', error);
  }
}
```

### 4.3 应用启动时初始化

```typescript
// src/index.ts
import 'reflect-metadata'; // tsyringe依赖
import express from 'express';
import { container } from 'tsyringe';
import { userRoutes } from './presentation/routes/user.routes';
import { initCacheWarmup } from './infrastructure/cache';

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化中间件
app.use(express.json());

// 注册路由
app.use('/api/users', userRoutes);

// 启动服务器
app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  
  // 初始化缓存预热
  await initCacheWarmup();
});
```

## 5. 热点数据缓存测试

### 5.1 单元测试

```typescript
// tests/infrastructure/cache/service/HotDataCacheService.test.ts
import { container } from 'tsyringe';
import { HotDataCacheService } from '../../../src/infrastructure/cache/service/HotDataCacheService';
import { HotDataMonitor } from '../../../src/infrastructure/cache/monitor/HotDataMonitor';
import { CacheService } from '../../../src/infrastructure/cache/service/CacheService';

// 模拟缓存服务
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  getBatch: jest.fn()
};

// 模拟热点数据监控器
const mockHotDataMonitor = {
  recordAccess: jest.fn()
};

describe('HotDataCacheService', () => {
  let hotDataCacheService: HotDataCacheService;

  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
    
    // 注册模拟服务
    container.register(CacheService, { useValue: mockCacheService });
    container.register(HotDataMonitor, { useValue: mockHotDataMonitor });
    
    // 获取服务实例
    hotDataCacheService = container.resolve(HotDataCacheService);
  });

  test('should record access when getting data', async () => {
    const cacheKey = 'test:key';
    const mockValue = { data: 'test' };
    
    // 模拟缓存命中
    mockCacheService.get.mockResolvedValue(mockValue);
    
    const result = await hotDataCacheService.getWithHotDataMonitoring(
      cacheKey,
      () => Promise.resolve(mockValue)
    );
    
    expect(mockHotDataMonitor.recordAccess).toHaveBeenCalledWith(cacheKey);
    expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(result).toEqual(mockValue);
  });

  test('should fetch data from source when cache miss', async () => {
    const cacheKey = 'test:key';
    const mockValue = { data: 'test' };
    const fetchFn = jest.fn().mockResolvedValue(mockValue);
    
    // 模拟缓存未命中
    mockCacheService.get.mockResolvedValue(null);
    
    const result = await hotDataCacheService.getWithHotDataMonitoring(
      cacheKey,
      fetchFn
    );
    
    expect(mockHotDataMonitor.recordAccess).toHaveBeenCalledWith(cacheKey);
    expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(fetchFn).toHaveBeenCalled();
    expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, mockValue, undefined);
    expect(result).toEqual(mockValue);
  });
});
```

### 5.2 集成测试

```typescript
// tests/integration/hot-data-cache.integration.test.ts
import 'reflect-metadata';
import { container } from 'tsyringe';
import { HotDataCacheService } from '../../src/infrastructure/cache/service/HotDataCacheService';
import { HotDataMonitor } from '../../src/infrastructure/cache/monitor/HotDataMonitor';
import { CacheService } from '../../src/infrastructure/cache/service/CacheService';

describe('Hot Data Cache Integration', () => {
  let hotDataCacheService: HotDataCacheService;
  let hotDataMonitor: HotDataMonitor;
  let cacheService: CacheService;

  beforeAll(() => {
    // 解析服务实例
    hotDataCacheService = container.resolve(HotDataCacheService);
    hotDataMonitor = container.resolve(HotDataMonitor);
    cacheService = container.resolve(CacheService);
  });

  afterAll(async () => {
    // 清理测试数据
    await cacheService.delete('test:hot:data');
    hotDataMonitor.destroy();
  });

  test('should identify hot data after multiple accesses', async () => {
    const cacheKey = 'test:hot:data';
    const mockValue = { id: 1, name: 'Test Data' };
    
    // 模拟多次访问
    for (let i = 0; i < 150; i++) {
      await hotDataCacheService.getWithHotDataMonitoring(
        cacheKey,
        () => Promise.resolve(mockValue)
      );
    }
    
    // 检查是否被识别为热点数据
    const stats = hotDataMonitor.getStats(cacheKey);
    expect(stats).toBeDefined();
    expect(stats?.count).toBeGreaterThanOrEqual(150);
    expect(stats?.isHot).toBe(true);
  });
});
```

## 6. 热点数据缓存监控

### 6.1 监控指标

| 指标名称 | 类型 | 描述 | 单位 |
|---------|------|------|------|
| cache.hot_data.count | Counter | 热点数据数量 | 个 |
| cache.hot_data.access | Counter | 热点数据访问次数 | 次 |
| cache.hot_data.hit_rate | Gauge | 热点数据命中率 | % |
| cache.hot_data.eviction | Counter | 热点数据驱逐次数 | 次 |
| cache.hot_data.load_time | Histogram | 热点数据加载时间 | 毫秒 |

### 6.2 监控实现

```typescript
// src/infrastructure/cache/monitor/HotDataMetrics.ts
import { injectable, inject } from 'tsyringe';
import { HotDataMonitor } from './HotDataMonitor';

/**
 * 热点数据监控指标
 */
@injectable()
export class HotDataMetrics {
  private hotDataAccessCount = 0;
  private hotDataHitCount = 0;
  private hotDataEvictionCount = 0;
  private hotDataLoadTimes: number[] = [];

  constructor(@inject(HotDataMonitor) private hotDataMonitor: HotDataMonitor) {}

  /**
   * 记录热点数据访问
   * @param hit 是否命中缓存
   */
  public recordHotDataAccess(hit: boolean): void {
    this.hotDataAccessCount++;
    if (hit) {
      this.hotDataHitCount++;
    }
  }

  /**
   * 记录热点数据驱逐
   */
  public recordHotDataEviction(): void {
    this.hotDataEvictionCount++;
  }

  /**
   * 记录热点数据加载时间
   * @param time 加载时间（毫秒）
   */
  public recordHotDataLoadTime(time: number): void {
    this.hotDataLoadTimes.push(time);
    // 保持数组大小在合理范围内
    if (this.hotDataLoadTimes.length > 1000) {
      this.hotDataLoadTimes.shift();
    }
  }

  /**
   * 获取热点数据命中率
   */
  public getHitRate(): number {
    if (this.hotDataAccessCount === 0) {
      return 0;
    }
    return (this.hotDataHitCount / this.hotDataAccessCount) * 100;
  }

  /**
   * 获取热点数据平均加载时间
   */
  public getAverageLoadTime(): number {
    if (this.hotDataLoadTimes.length === 0) {
      return 0;
    }
    const sum = this.hotDataLoadTimes.reduce((a, b) => a + b, 0);
    return sum / this.hotDataLoadTimes.length;
  }

  /**
   * 获取热点数据统计信息
   */
  public getStats(): {
    hotDataCount: number;
    accessCount: number;
    hitRate: number;
    evictionCount: number;
    averageLoadTime: number;
  } {
    return {
      hotDataCount: this.hotDataMonitor.getHotDataKeys().length,
      accessCount: this.hotDataAccessCount,
      hitRate: this.getHitRate(),
      evictionCount: this.hotDataEvictionCount,
      averageLoadTime: this.getAverageLoadTime()
    };
  }
}
```

## 7. 总结

本文档实现了热点数据缓存的核心功能，包括：

1. **热点数据监控**：实时监控数据访问情况，自动识别热点数据
2. **热点数据缓存服务**：提供带热点数据监控的缓存操作
3. **缓存预热**：系统启动时加载热点数据，避免冷启动问题
4. **事件驱动架构**：通过事件机制实现热点数据的实时更新和删除
5. **完整的测试方案**：包括单元测试和集成测试
6. **监控指标**：提供热点数据相关的监控指标

热点数据缓存实现遵循了Clean Architecture原则，将缓存逻辑与业务逻辑分离，通过依赖注入实现解耦，便于测试和扩展。同时，采用事件驱动架构确保缓存与数据库的一致性，提高了系统的可靠性和可维护性。