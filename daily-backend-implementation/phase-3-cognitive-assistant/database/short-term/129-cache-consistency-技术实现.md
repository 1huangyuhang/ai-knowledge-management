# 129-缓存一致性代码

## 1. 缓存一致性概述

缓存一致性是指缓存中的数据与数据源（如数据库）中的数据保持一致的状态。在分布式系统中，由于缓存和数据库是独立的存储系统，当数据发生变化时，需要合理的机制来确保两者的数据一致性。

### 1.1 缓存一致性的挑战

1. **并发写操作**：多个客户端同时更新同一数据，可能导致缓存与数据库不一致
2. **网络延迟**：缓存和数据库操作之间的网络延迟可能导致数据不一致
3. **系统故障**：缓存或数据库故障可能导致数据丢失或不一致
4. **缓存失效策略**：不同的缓存失效策略会影响一致性
5. **分布式环境**：在分布式环境中，一致性问题更加复杂

### 1.2 缓存一致性模型

| 一致性模型 | 描述 | 实现难度 | 性能影响 |
|-----------|------|---------|---------|
| 强一致性 | 缓存和数据库始终保持一致 | 高 | 大 |
| 弱一致性 | 缓存和数据库可能暂时不一致，但最终会一致 | 低 | 小 |
| 最终一致性 | 缓存和数据库在一定时间内会达到一致 | 中 | 中 |

### 1.3 缓存一致性策略

1. **Cache-Aside模式**：先更新数据库，再删除缓存
2. **Write-Through模式**：先更新缓存，再更新数据库
3. **Write-Back模式**：先更新缓存，异步更新数据库
4. **Read-Through模式**：缓存未命中时，自动从数据库加载数据
5. **事件驱动模式**：通过事件机制实现缓存与数据库的同步
6. **版本控制模式**：使用版本号确保缓存数据的新鲜度
7. **双写一致性**：同时更新缓存和数据库，确保一致性

## 2. 缓存一致性设计

### 2.1 缓存一致性架构

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
|  Event Bus     |<----|  Consistency   |
|  (Infrastructure|     |  Service       |
|   Layer)       |     |                |
+----------------+     +----------------+
```

### 2.2 缓存一致性流程

1. **读操作流程**：
   - 客户端请求数据
   - 缓存服务检查缓存
   - 缓存命中：返回缓存数据
   - 缓存未命中：从数据库获取数据，更新缓存，返回数据

2. **写操作流程**：
   - 客户端请求更新数据
   - 缓存服务开始事务
   - 更新数据库
   - 更新或删除缓存
   - 提交事务
   - 返回响应

### 2.3 一致性策略选择

| 策略 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Cache-Aside | 实现简单，性能较好 | 可能存在短暂不一致 | 读多写少场景 |
| Write-Through | 数据一致性好 | 写入性能较低 | 数据一致性要求高的场景 |
| Write-Back | 写入性能高 | 可能丢失数据 | 写操作频繁，对一致性要求不高的场景 |
| 事件驱动 | 解耦性好，扩展性强 | 实现复杂，延迟较高 | 分布式系统场景 |
| 版本控制 | 确保数据新鲜度 | 增加系统复杂度 | 对数据一致性要求高的场景 |

## 3. 缓存一致性实现

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
        │   ├── CacheWarmupService.ts     # 缓存预热服务
        │   └── CacheConsistencyService.ts  # 缓存一致性服务
        ├── event-handlers/  # 事件处理器
        │   ├── CacheEventHandler.ts     # 基础缓存事件处理器
        │   ├── HotDataEventHandler.ts    # 热点数据事件处理器
        │   ├── CacheInvalidationEventHandler.ts  # 缓存失效事件处理器
        │   ├── CacheWarmupEventHandler.ts  # 缓存预热事件处理器
        │   └── CacheConsistencyEventHandler.ts  # 缓存一致性事件处理器
        ├── invalidation/  # 缓存失效策略
        ├── monitor/      # 热点数据监控
        ├── warmup/       # 缓存预热
        └── consistency/  # 缓存一致性
            ├── CacheConsistencyStrategy.ts  # 缓存一致性策略接口
            ├── CacheAsideStrategy.ts  # Cache-Aside策略
            ├── WriteThroughStrategy.ts  # Write-Through策略
            ├── WriteBackStrategy.ts  # Write-Back策略
            └── VersionControlStrategy.ts  # 版本控制策略
```

### 3.2 缓存一致性策略接口

```typescript
// src/infrastructure/cache/consistency/CacheConsistencyStrategy.ts

/**
 * 缓存一致性操作类型
 */
export type ConsistencyOperation = 'read' | 'write' | 'delete';

/**
 * 缓存一致性上下文
 */
export interface ConsistencyContext {
  /**
   * 缓存键
   */
  key: string;
  /**
   * 操作类型
   */
  operation: ConsistencyOperation;
  /**
   * 数据值
   */
  value?: any;
  /**
   * 数据库操作函数
   */
  dbOperation?: () => Promise<any>;
  /**
   * 缓存过期时间（秒）
   */
  ttl?: number;
  /**
   * 版本号
   */
  version?: number;
}

/**
 * 缓存一致性结果
 */
export interface ConsistencyResult {
  /**
   * 操作是否成功
   */
  success: boolean;
  /**
   * 返回数据
   */
  data?: any;
  /**
   * 错误信息
   */
  error?: string;
  /**
   * 一致性状态
   */
  consistencyStatus: 'consistent' | 'inconsistent' | 'unknown';
}

/**
 * 缓存一致性策略接口
 */
export interface CacheConsistencyStrategy {
  /**
   * 策略名称
   */
  name: string;
  
  /**
   * 初始化策略
   */
  init(): void;
  
  /**
   * 处理一致性操作
   * @param context 一致性上下文
   */
  handle(context: ConsistencyContext): Promise<ConsistencyResult>;
  
  /**
   * 销毁策略
   */
  destroy(): void;
}
```

### 3.3 Cache-Aside策略实现

```typescript
// src/infrastructure/cache/consistency/CacheAsideStrategy.ts
import { injectable, inject } from 'tsyringe';
import { CacheConsistencyStrategy, ConsistencyContext, ConsistencyResult } from './CacheConsistencyStrategy';
import { CacheService } from '../service/CacheService';

/**
 * Cache-Aside缓存一致性策略
 * 先更新数据库，再删除缓存
 */
@injectable()
export class CacheAsideStrategy implements CacheConsistencyStrategy {
  public name = 'cache-aside';
  
  constructor(@inject(CacheService) private cacheService: CacheService) {}

  /**
   * 初始化策略
   */
  public init(): void {
    // Cache-Aside策略不需要额外初始化
  }

  /**
   * 处理一致性操作
   * @param context 一致性上下文
   */
  public async handle(context: ConsistencyContext): Promise<ConsistencyResult> {
    try {
      switch (context.operation) {
        case 'read':
          return await this.handleRead(context);
        case 'write':
          return await this.handleWrite(context);
        case 'delete':
          return await this.handleDelete(context);
        default:
          return {
            success: false,
            error: `无效的操作类型: ${context.operation}`,
            consistencyStatus: 'unknown'
          };
      }
    } catch (error) {
      console.error(`Cache-Aside策略处理失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        consistencyStatus: 'inconsistent'
      };
    }
  }

  /**
   * 处理读操作
   * @param context 一致性上下文
   */
  private async handleRead(context: ConsistencyContext): Promise<ConsistencyResult> {
    // 尝试从缓存获取数据
    const cachedValue = await this.cacheService.get(context.key);
    
    if (cachedValue !== null) {
      // 缓存命中，返回数据
      return {
        success: true,
        data: cachedValue,
        consistencyStatus: 'consistent'
      };
    }
    
    // 缓存未命中，从数据库获取
    if (!context.dbOperation) {
      return {
        success: false,
        error: '数据库操作函数未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    const dbValue = await context.dbOperation();
    
    // 更新缓存
    if (dbValue !== null) {
      await this.cacheService.set(context.key, dbValue, context.ttl);
    }
    
    return {
      success: true,
      data: dbValue,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 处理写操作
   * @param context 一致性上下文
   */
  private async handleWrite(context: ConsistencyContext): Promise<ConsistencyResult> {
    if (!context.dbOperation) {
      return {
        success: false,
        error: '数据库操作函数未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    // 先更新数据库
    const dbResult = await context.dbOperation();
    
    // 再删除缓存（Cache-Aside模式）
    await this.cacheService.delete(context.key);
    
    return {
      success: true,
      data: dbResult,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 处理删除操作
   * @param context 一致性上下文
   */
  private async handleDelete(context: ConsistencyContext): Promise<ConsistencyResult> {
    if (!context.dbOperation) {
      return {
        success: false,
        error: '数据库操作函数未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    // 先删除数据库记录
    const dbResult = await context.dbOperation();
    
    // 再删除缓存
    await this.cacheService.delete(context.key);
    
    return {
      success: true,
      data: dbResult,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 销毁策略
   */
  public destroy(): void {
    // Cache-Aside策略不需要额外销毁
  }
}
```

### 3.4 Write-Through策略实现

```typescript
// src/infrastructure/cache/consistency/WriteThroughStrategy.ts
import { injectable, inject } from 'tsyringe';
import { CacheConsistencyStrategy, ConsistencyContext, ConsistencyResult } from './CacheConsistencyStrategy';
import { CacheService } from '../service/CacheService';

/**
 * Write-Through缓存一致性策略
 * 先更新缓存，再更新数据库
 */
@injectable()
export class WriteThroughStrategy implements CacheConsistencyStrategy {
  public name = 'write-through';
  
  constructor(@inject(CacheService) private cacheService: CacheService) {}

  /**
   * 初始化策略
   */
  public init(): void {
    // Write-Through策略不需要额外初始化
  }

  /**
   * 处理一致性操作
   * @param context 一致性上下文
   */
  public async handle(context: ConsistencyContext): Promise<ConsistencyResult> {
    try {
      switch (context.operation) {
        case 'read':
          return await this.handleRead(context);
        case 'write':
          return await this.handleWrite(context);
        case 'delete':
          return await this.handleDelete(context);
        default:
          return {
            success: false,
            error: `无效的操作类型: ${context.operation}`,
            consistencyStatus: 'unknown'
          };
      }
    } catch (error) {
      console.error(`Write-Through策略处理失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        consistencyStatus: 'inconsistent'
      };
    }
  }

  /**
   * 处理读操作
   * @param context 一致性上下文
   */
  private async handleRead(context: ConsistencyContext): Promise<ConsistencyResult> {
    // 尝试从缓存获取数据
    const cachedValue = await this.cacheService.get(context.key);
    
    if (cachedValue !== null) {
      // 缓存命中，返回数据
      return {
        success: true,
        data: cachedValue,
        consistencyStatus: 'consistent'
      };
    }
    
    // 缓存未命中，从数据库获取
    if (!context.dbOperation) {
      return {
        success: false,
        error: '数据库操作函数未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    const dbValue = await context.dbOperation();
    
    // 更新缓存
    if (dbValue !== null) {
      await this.cacheService.set(context.key, dbValue, context.ttl);
    }
    
    return {
      success: true,
      data: dbValue,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 处理写操作
   * @param context 一致性上下文
   */
  private async handleWrite(context: ConsistencyContext): Promise<ConsistencyResult> {
    if (!context.dbOperation || context.value === undefined) {
      return {
        success: false,
        error: '数据库操作函数或值未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    // 先更新缓存
    await this.cacheService.set(context.key, context.value, context.ttl);
    
    // 再更新数据库
    const dbResult = await context.dbOperation();
    
    return {
      success: true,
      data: dbResult,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 处理删除操作
   * @param context 一致性上下文
   */
  private async handleDelete(context: ConsistencyContext): Promise<ConsistencyResult> {
    if (!context.dbOperation) {
      return {
        success: false,
        error: '数据库操作函数未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    // 先删除缓存
    await this.cacheService.delete(context.key);
    
    // 再删除数据库记录
    const dbResult = await context.dbOperation();
    
    return {
      success: true,
      data: dbResult,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 销毁策略
   */
  public destroy(): void {
    // Write-Through策略不需要额外销毁
  }
}
```

### 3.5 Write-Back策略实现

```typescript
// src/infrastructure/cache/consistency/WriteBackStrategy.ts
import { injectable, inject } from 'tsyringe';
import { CacheConsistencyStrategy, ConsistencyContext, ConsistencyResult } from './CacheConsistencyStrategy';
import { CacheService } from '../service/CacheService';

/**
 * Write-Back缓存一致性配置
 */
export interface WriteBackConfig {
  /**
   * 批量更新间隔（毫秒）
   */
  batchInterval: number;
  /**
   * 批量更新大小
   */
  batchSize: number;
  /**
   * 是否启用
   */
  enabled: boolean;
}

/**
 * Write-Back缓存一致性策略
 * 先更新缓存，异步更新数据库
 */
@injectable()
export class WriteBackStrategy implements CacheConsistencyStrategy {
  public name = 'write-back';
  private dirtyData: Map<string, any> = new Map();
  private intervalId?: NodeJS.Timeout;
  private isFlushing = false;

  constructor(
    @inject(CacheService) private cacheService: CacheService,
    @inject('WriteBackConfig') private config: WriteBackConfig
  ) {}

  /**
   * 初始化策略
   */
  public init(): void {
    if (!this.config.enabled) {
      return;
    }
    
    // 设置定时刷新任务
    this.intervalId = setInterval(
      () => this.flushDirtyData(),
      this.config.batchInterval
    );
    
    console.log(`Write-Back策略已初始化，批量更新间隔：${this.config.batchInterval}ms`);
  }

  /**
   * 处理一致性操作
   * @param context 一致性上下文
   */
  public async handle(context: ConsistencyContext): Promise<ConsistencyResult> {
    try {
      switch (context.operation) {
        case 'read':
          return await this.handleRead(context);
        case 'write':
          return await this.handleWrite(context);
        case 'delete':
          return await this.handleDelete(context);
        default:
          return {
            success: false,
            error: `无效的操作类型: ${context.operation}`,
            consistencyStatus: 'unknown'
          };
      }
    } catch (error) {
      console.error(`Write-Back策略处理失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        consistencyStatus: 'inconsistent'
      };
    }
  }

  /**
   * 处理读操作
   * @param context 一致性上下文
   */
  private async handleRead(context: ConsistencyContext): Promise<ConsistencyResult> {
    // 尝试从缓存获取数据
    const cachedValue = await this.cacheService.get(context.key);
    
    if (cachedValue !== null) {
      // 缓存命中，返回数据
      return {
        success: true,
        data: cachedValue,
        consistencyStatus: 'consistent'
      };
    }
    
    // 缓存未命中，从数据库获取
    if (!context.dbOperation) {
      return {
        success: false,
        error: '数据库操作函数未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    const dbValue = await context.dbOperation();
    
    // 更新缓存
    if (dbValue !== null) {
      await this.cacheService.set(context.key, dbValue, context.ttl);
    }
    
    return {
      success: true,
      data: dbValue,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 处理写操作
   * @param context 一致性上下文
   */
  private async handleWrite(context: ConsistencyContext): Promise<ConsistencyResult> {
    if (context.value === undefined) {
      return {
        success: false,
        error: '值未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    // 先更新缓存
    await this.cacheService.set(context.key, context.value, context.ttl);
    
    // 将数据标记为脏数据
    this.dirtyData.set(context.key, {
      value: context.value,
      dbOperation: context.dbOperation,
      ttl: context.ttl
    });
    
    // 如果脏数据达到阈值，立即刷新
    if (this.dirtyData.size >= this.config.batchSize) {
      this.flushDirtyData();
    }
    
    return {
      success: true,
      data: context.value,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 处理删除操作
   * @param context 一致性上下文
   */
  private async handleDelete(context: ConsistencyContext): Promise<ConsistencyResult> {
    // 先删除缓存
    await this.cacheService.delete(context.key);
    
    // 将删除操作标记为脏数据
    this.dirtyData.set(context.key, {
      value: null,
      dbOperation: context.dbOperation,
      isDelete: true
    });
    
    // 如果脏数据达到阈值，立即刷新
    if (this.dirtyData.size >= this.config.batchSize) {
      this.flushDirtyData();
    }
    
    return {
      success: true,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 刷新脏数据到数据库
   */
  private async flushDirtyData(): Promise<void> {
    if (this.isFlushing || this.dirtyData.size === 0) {
      return;
    }
    
    this.isFlushing = true;
    
    try {
      // 获取当前脏数据并清空
      const dirtyDataToFlush = new Map(this.dirtyData);
      this.dirtyData.clear();
      
      console.log(`开始刷新脏数据，共${dirtyDataToFlush.size}条`);
      
      // 批量更新数据库
      for (const [key, data] of dirtyDataToFlush.entries()) {
        try {
          if (data.dbOperation) {
            if (data.isDelete) {
              // 执行删除操作
              await data.dbOperation();
            } else {
              // 执行更新操作
              await data.dbOperation();
            }
          }
        } catch (error) {
          console.error(`刷新脏数据失败，键：${key}`, error);
          // 将失败的数据重新加入脏数据列表
          this.dirtyData.set(key, data);
        }
      }
      
      console.log(`脏数据刷新完成`);
    } catch (error) {
      console.error(`批量刷新脏数据失败:`, error);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * 销毁策略
   */
  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    
    // 刷新剩余脏数据
    this.flushDirtyData();
    
    console.log('Write-Back策略已销毁');
  }
}
```

### 3.6 版本控制策略实现

```typescript
// src/infrastructure/cache/consistency/VersionControlStrategy.ts
import { injectable, inject } from 'tsyringe';
import { CacheConsistencyStrategy, ConsistencyContext, ConsistencyResult } from './CacheConsistencyStrategy';
import { CacheService } from '../service/CacheService';

/**
 * 版本控制缓存一致性策略
 * 使用版本号确保缓存数据的新鲜度
 */
@injectable()
export class VersionControlStrategy implements CacheConsistencyStrategy {
  public name = 'version-control';
  
  constructor(@inject(CacheService) private cacheService: CacheService) {}

  /**
   * 初始化策略
   */
  public init(): void {
    // 版本控制策略不需要额外初始化
  }

  /**
   * 处理一致性操作
   * @param context 一致性上下文
   */
  public async handle(context: ConsistencyContext): Promise<ConsistencyResult> {
    try {
      switch (context.operation) {
        case 'read':
          return await this.handleRead(context);
        case 'write':
          return await this.handleWrite(context);
        case 'delete':
          return await this.handleDelete(context);
        default:
          return {
            success: false,
            error: `无效的操作类型: ${context.operation}`,
            consistencyStatus: 'unknown'
          };
      }
    } catch (error) {
      console.error(`版本控制策略处理失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        consistencyStatus: 'inconsistent'
      };
    }
  }

  /**
   * 处理读操作
   * @param context 一致性上下文
   */
  private async handleRead(context: ConsistencyContext): Promise<ConsistencyResult> {
    // 尝试从缓存获取数据（包含版本号）
    const cachedData = await this.cacheService.get<{ value: any; version: number }>(context.key);
    
    if (cachedData) {
      // 缓存命中，检查版本号
      if (context.version !== undefined && cachedData.version < context.version) {
        // 缓存版本过期，从数据库获取
        return this.fetchFromDbAndUpdateCache(context);
      }
      
      // 缓存版本有效，返回数据
      return {
        success: true,
        data: cachedData.value,
        consistencyStatus: 'consistent'
      };
    }
    
    // 缓存未命中，从数据库获取
    return this.fetchFromDbAndUpdateCache(context);
  }

  /**
   * 从数据库获取数据并更新缓存
   * @param context 一致性上下文
   */
  private async fetchFromDbAndUpdateCache(context: ConsistencyContext): Promise<ConsistencyResult> {
    if (!context.dbOperation) {
      return {
        success: false,
        error: '数据库操作函数未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    // 从数据库获取数据
    const dbResult = await context.dbOperation();
    
    // 更新缓存（包含版本号）
    if (dbResult !== null) {
      await this.cacheService.set(context.key, {
        value: dbResult,
        version: context.version || Date.now() // 使用时间戳作为版本号
      }, context.ttl);
    }
    
    return {
      success: true,
      data: dbResult,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 处理写操作
   * @param context 一致性上下文
   */
  private async handleWrite(context: ConsistencyContext): Promise<ConsistencyResult> {
    if (!context.dbOperation || context.value === undefined) {
      return {
        success: false,
        error: '数据库操作函数或值未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    // 生成新的版本号
    const newVersion = Date.now();
    
    // 先更新数据库
    const dbResult = await context.dbOperation();
    
    // 再更新缓存（包含新版本号）
    await this.cacheService.set(context.key, {
      value: context.value,
      version: newVersion
    }, context.ttl);
    
    return {
      success: true,
      data: { ...dbResult, version: newVersion },
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 处理删除操作
   * @param context 一致性上下文
   */
  private async handleDelete(context: ConsistencyContext): Promise<ConsistencyResult> {
    if (!context.dbOperation) {
      return {
        success: false,
        error: '数据库操作函数未提供',
        consistencyStatus: 'unknown'
      };
    }
    
    // 先删除数据库记录
    const dbResult = await context.dbOperation();
    
    // 再删除缓存
    await this.cacheService.delete(context.key);
    
    return {
      success: true,
      data: dbResult,
      consistencyStatus: 'consistent'
    };
  }

  /**
   * 销毁策略
   */
  public destroy(): void {
    // 版本控制策略不需要额外销毁
  }
}
```

### 3.7 缓存一致性服务

```typescript
// src/infrastructure/cache/service/CacheConsistencyService.ts
import { injectable, inject } from 'tsyringe';
import { CacheService } from './CacheService';
import { CacheConsistencyStrategy, ConsistencyContext, ConsistencyResult } from '../consistency/CacheConsistencyStrategy';
import { CacheAsideStrategy } from '../consistency/CacheAsideStrategy';
import { WriteThroughStrategy } from '../consistency/WriteThroughStrategy';
import { WriteBackStrategy } from '../consistency/WriteBackStrategy';
import { VersionControlStrategy } from '../consistency/VersionControlStrategy';
import { eventBus } from '../../event-bus/event-bus';

/**
 * 缓存一致性服务
 */
@injectable()
export class CacheConsistencyService {
  private strategies: Map<string, CacheConsistencyStrategy> = new Map();
  private defaultStrategy: CacheConsistencyStrategy;

  constructor(@inject(CacheService) private cacheService: CacheService) {
    // 初始化一致性策略
    this.initStrategies();
    
    // 设置默认策略（Cache-Aside）
    this.defaultStrategy = this.strategies.get('cache-aside')!;
  }

  /**
   * 初始化一致性策略
   */
  private initStrategies(): void {
    // 创建一致性策略实例
    const cacheAsideStrategy = new CacheAsideStrategy(this.cacheService);
    const writeThroughStrategy = new WriteThroughStrategy(this.cacheService);
    const writeBackStrategy = new WriteBackStrategy(this.cacheService, {
      batchInterval: 5000, // 5秒
      batchSize: 100, // 100条
      enabled: true
    });
    const versionControlStrategy = new VersionControlStrategy(this.cacheService);
    
    // 初始化策略
    cacheAsideStrategy.init();
    writeThroughStrategy.init();
    writeBackStrategy.init();
    versionControlStrategy.init();
    
    // 注册策略
    this.strategies.set('cache-aside', cacheAsideStrategy);
    this.strategies.set('write-through', writeThroughStrategy);
    this.strategies.set('write-back', writeBackStrategy);
    this.strategies.set('version-control', versionControlStrategy);
  }

  /**
   * 设置默认一致性策略
   * @param strategyName 策略名称
   */
  public setDefaultStrategy(strategyName: string): void {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`无效的一致性策略: ${strategyName}`);
    }
    this.defaultStrategy = strategy;
  }

  /**
   * 处理一致性操作
   * @param context 一致性上下文
   * @param strategyName 策略名称
   */
  public async handleConsistency(
    context: ConsistencyContext,
    strategyName?: string
  ): Promise<ConsistencyResult> {
    const strategy = strategyName ? this.strategies.get(strategyName) : this.defaultStrategy;
    if (!strategy) {
      throw new Error(`无效的一致性策略: ${strategyName}`);
    }
    
    const result = await strategy.handle(context);
    
    // 发布一致性事件
    eventBus.publish('cache:consistency:handled', {
      context,
      result,
      strategy: strategy.name
    });
    
    return result;
  }

  /**
   * 执行读操作（带一致性保证）
   * @param key 缓存键
   * @param dbOperation 数据库操作函数
   * @param ttl 缓存过期时间（秒）
   * @param version 版本号
   * @param strategyName 策略名称
   */
  public async readWithConsistency<T>(
    key: string,
    dbOperation: () => Promise<T>,
    ttl?: number,
    version?: number,
    strategyName?: string
  ): Promise<T> {
    const context: ConsistencyContext = {
      key,
      operation: 'read',
      dbOperation,
      ttl,
      version
    };
    
    const result = await this.handleConsistency(context, strategyName);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.data as T;
  }

  /**
   * 执行写操作（带一致性保证）
   * @param key 缓存键
   * @param value 数据值
   * @param dbOperation 数据库操作函数
   * @param ttl 缓存过期时间（秒）
   * @param strategyName 策略名称
   */
  public async writeWithConsistency<T>(
    key: string,
    value: T,
    dbOperation: () => Promise<any>,
    ttl?: number,
    strategyName?: string
  ): Promise<T> {
    const context: ConsistencyContext = {
      key,
      operation: 'write',
      value,
      dbOperation,
      ttl
    };
    
    const result = await this.handleConsistency(context, strategyName);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.data as T;
  }

  /**
   * 执行删除操作（带一致性保证）
   * @param key 缓存键
   * @param dbOperation 数据库操作函数
   * @param strategyName 策略名称
   */
  public async deleteWithConsistency(
    key: string,
    dbOperation: () => Promise<any>,
    strategyName?: string
  ): Promise<void> {
    const context: ConsistencyContext = {
      key,
      operation: 'delete',
      dbOperation
    };
    
    const result = await this.handleConsistency(context, strategyName);
    
    if (!result.success) {
      throw new Error(result.error);
    }
  }

  /**
   * 销毁缓存一致性服务
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

### 3.8 缓存一致性事件处理器

```typescript
// src/infrastructure/cache/event-handlers/CacheConsistencyEventHandler.ts
import { injectable, inject } from 'tsyringe';
import { eventBus } from '../../event-bus/event-bus';
import { CacheConsistencyService } from '../service/CacheConsistencyService';

/**
 * 缓存一致性事件处理器
 */
@injectable()
export class CacheConsistencyEventHandler {
  constructor(@inject(CacheConsistencyService) private consistencyService: CacheConsistencyService) {
    // 订阅一致性相关事件
    this.subscribeToEvents();
  }

  /**
   * 订阅事件
   */
  private subscribeToEvents(): void {
    // 订阅一致性处理事件
    eventBus.subscribe('cache:consistency:handled', this.handleConsistencyHandled.bind(this));
    // 订阅一致性检查事件
    eventBus.subscribe('cache:consistency:check', this.handleConsistencyCheck.bind(this));
  }

  /**
   * 处理一致性处理事件
   * @param data 事件数据
   */
  private handleConsistencyHandled(data: { context: any; result: any; strategy: string }): void {
    const { context, result, strategy } = data;
    
    if (result.consistencyStatus === 'inconsistent') {
      console.warn(`缓存一致性处理失败，键：${context.key}，策略：${strategy}，错误：${result.error}`);
      // 可以在这里添加告警逻辑
    } else {
      console.debug(`缓存一致性处理成功，键：${context.key}，策略：${strategy}`);
    }
  }

  /**
   * 处理一致性检查事件
   * @param data 事件数据
   */
  private async handleConsistencyCheck(data: { key: string; expectedValue: any }): Promise<void> {
    const { key, expectedValue } = data;
    
    try {
      // 这里可以添加一致性检查逻辑
      // 例如：检查缓存值与数据库值是否一致
      console.log(`执行一致性检查，键：${key}，期望值：${JSON.stringify(expectedValue)}`);
    } catch (error) {
      console.error(`一致性检查失败，键：${key}`, error);
    }
  }
}
```

### 3.9 依赖注入配置

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
import { CacheConsistencyService } from './service/CacheConsistencyService';
import { HotDataMonitor, HotDataMonitorConfig } from './monitor/HotDataMonitor';
import { CacheEventHandler } from './event-handlers/CacheEventHandler';
import { HotDataEventHandler } from './event-handlers/HotDataEventHandler';
import { CacheInvalidationEventHandler } from './event-handlers/CacheInvalidationEventHandler';
import { CacheWarmupEventHandler } from './event-handlers/CacheWarmupEventHandler';
import { CacheConsistencyEventHandler } from './event-handlers/CacheConsistencyEventHandler';
import { ScheduledWarmupConfig } from './warmup/ScheduledWarmupStrategy';
import { WriteBackConfig } from './consistency/WriteBackStrategy';

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

// 注册Write-Back配置
container.register(WriteBackConfig, {
  useValue: {
    batchInterval: 5000,  // 5秒
    batchSize: 100,       // 100条
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
container.register(CacheConsistencyService, { useClass: CacheConsistencyService });
container.register(HotDataMonitor, { useClass: HotDataMonitor });
container.register(CacheEventHandler, { useClass: CacheEventHandler });
container.register(HotDataEventHandler, { useClass: HotDataEventHandler });
container.register(CacheInvalidationEventHandler, { useClass: CacheInvalidationEventHandler });
container.register(CacheWarmupEventHandler, { useClass: CacheWarmupEventHandler });
container.register(CacheConsistencyEventHandler, { useClass: CacheConsistencyEventHandler });

export { CacheService, HotDataCacheService, CacheInvalidationService, CacheWarmupService, CacheConsistencyService };
```

## 4. 缓存一致性使用示例

### 4.1 在业务服务中使用缓存一致性

```typescript
// src/application/services/user.service.ts
import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { CacheConsistencyService } from '../../infrastructure/cache/service/CacheConsistencyService';

@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(CacheConsistencyService) private consistencyService: CacheConsistencyService
  ) {}

  /**
   * 获取用户认知模型（带一致性保证）
   * @param userId 用户ID
   * @param modelType 模型类型
   */
  async getUserCognitiveModel(userId: number, modelType: string) {
    const cacheKey = `user:model:${userId}:${modelType}`;
    
    return this.consistencyService.readWithConsistency(
      cacheKey,
      () => this.userRepository.getCognitiveModel(userId, modelType),
      3600, // 缓存1小时
      undefined, // 不使用版本控制
      'cache-aside' // 使用Cache-Aside策略
    );
  }

  /**
   * 更新用户认知模型（带一致性保证）
   * @param userId 用户ID
   * @param modelType 模型类型
   * @param model 模型数据
   */
  async updateCognitiveModel(userId: number, modelType: string, model: any) {
    const cacheKey = `user:model:${userId}:${modelType}`;
    
    return this.consistencyService.writeWithConsistency(
      cacheKey,
      model,
      () => this.userRepository.updateCognitiveModel(userId, modelType, model),
      3600, // 缓存1小时
      'cache-aside' // 使用Cache-Aside策略
    );
  }

  /**
   * 删除用户认知模型（带一致性保证）
   * @param userId 用户ID
   * @param modelType 模型类型
   */
  async deleteCognitiveModel(userId: number, modelType: string) {
    const cacheKey = `user:model:${userId}:${modelType}`;
    
    await this.consistencyService.deleteWithConsistency(
      cacheKey,
      () => this.userRepository.deleteCognitiveModel(userId, modelType),
      'cache-aside' // 使用Cache-Aside策略
    );
    
    return true;
  }
}
```

### 4.2 在控制器中使用缓存一致性

```typescript
// src/presentation/controllers/user.controller.ts
import { injectable, inject } from 'tsyringe';
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../../application/services/user.service';

@injectable()
export class UserController {
  constructor(@inject(UserService) private userService: UserService) {}

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
}
```

## 5. 缓存一致性测试

### 5.1 单元测试

```typescript
// tests/infrastructure/cache/service/CacheConsistencyService.test.ts
import { container } from 'tsyringe';
import { CacheConsistencyService } from '../../../src/infrastructure/cache/service/CacheConsistencyService';
import { CacheService } from '../../../src/infrastructure/cache/service/CacheService';

// 模拟缓存服务
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn()
};

describe('CacheConsistencyService', () => {
  let consistencyService: CacheConsistencyService;

  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
    
    // 注册模拟服务
    container.register(CacheService, { useValue: mockCacheService });
    
    // 获取服务实例
    consistencyService = container.resolve(CacheConsistencyService);
  });

  test('should read with cache-aside strategy', async () => {
    const cacheKey = 'test:key';
    const mockData = { id: 1, name: 'Test Data' };
    
    // 模拟缓存未命中
    mockCacheService.get.mockResolvedValue(null);
    
    // 执行读操作
    const result = await consistencyService.readWithConsistency(
      cacheKey,
      async () => mockData,
      3600,
      undefined,
      'cache-aside'
    );
    
    // 验证结果
    expect(result).toEqual(mockData);
    expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, mockData, 3600);
  });

  test('should write with cache-aside strategy', async () => {
    const cacheKey = 'test:key';
    const mockValue = { id: 1, name: 'Test Data' };
    const mockDbResult = { id: 1, name: 'Test Data', updatedAt: new Date() };
    
    // 执行写操作
    const result = await consistencyService.writeWithConsistency(
      cacheKey,
      mockValue,
      async () => mockDbResult,
      3600,
      'cache-aside'
    );
    
    // 验证结果
    expect(result).toEqual(mockDbResult);
    expect(mockCacheService.delete).toHaveBeenCalledWith(cacheKey);
  });
});
```

### 5.2 集成测试

```typescript
// tests/integration/cache-consistency.integration.test.ts
import 'reflect-metadata';
import { container } from 'tsyringe';
import { CacheConsistencyService } from '../../src/infrastructure/cache/service/CacheConsistencyService';
import { CacheService } from '../../src/infrastructure/cache/service/CacheService';
import { UserRepository } from '../../src/infrastructure/database/repositories/user.repository';

describe('Cache Consistency Integration', () => {
  let consistencyService: CacheConsistencyService;
  let cacheService: CacheService;
  let userRepository: UserRepository;

  beforeAll(() => {
    // 解析服务实例
    consistencyService = container.resolve(CacheConsistencyService);
    cacheService = container.resolve(CacheService);
    userRepository = container.resolve(UserRepository);
  });

  afterAll(async () => {
    // 清理测试数据
    await cacheService.delete('integration:test:1');
    consistencyService.destroy();
  });

  test('should maintain consistency with cache-aside strategy', async () => {
    const cacheKey = 'integration:test:1';
    const testData = { id: 1, name: 'Integration Test' };
    const updatedData = { id: 1, name: 'Updated Integration Test' };
    
    // 模拟数据库操作
    const mockGet = jest.spyOn(userRepository, 'getCognitiveModel').mockResolvedValue(testData as any);
    const mockUpdate = jest.spyOn(userRepository, 'updateCognitiveModel').mockResolvedValue(updatedData as any);
    
    // 第一次读取：缓存未命中，从数据库获取并写入缓存
    const result1 = await consistencyService.readWithConsistency(
      cacheKey,
      () => userRepository.getCognitiveModel(1, 'test') as any,
      3600,
      undefined,
      'cache-aside'
    );
    expect(result1).toEqual(testData);
    
    // 第二次读取：缓存命中，直接返回缓存数据
    const result2 = await consistencyService.readWithConsistency(
      cacheKey,
      () => userRepository.getCognitiveModel(1, 'test') as any,
      3600,
      undefined,
      'cache-aside'
    );
    expect(result2).toEqual(testData);
    expect(mockGet).toHaveBeenCalledTimes(1); // 只调用一次数据库
    
    // 更新数据：更新数据库并删除缓存
    await consistencyService.writeWithConsistency(
      cacheKey,
      updatedData,
      () => userRepository.updateCognitiveModel(1, 'test', updatedData) as any,
      3600,
      'cache-aside'
    );
    
    // 第三次读取：缓存未命中，从数据库获取新数据并写入缓存
    const result3 = await consistencyService.readWithConsistency(
      cacheKey,
      () => userRepository.getCognitiveModel(1, 'test') as any,
      3600,
      undefined,
      'cache-aside'
    );
    expect(result3).toEqual(updatedData);
    expect(mockGet).toHaveBeenCalledTimes(2); // 再次调用数据库
    
    // 恢复原始方法
    mockGet.mockRestore();
    mockUpdate.mockRestore();
  });
});
```

## 6. 缓存一致性监控

### 6.1 监控指标

| 指标名称 | 类型 | 描述 | 单位 |
|---------|------|------|------|
| cache.consistency.operations | Counter | 一致性操作次数 | 次 |
| cache.consistency.reads | Counter | 一致性读操作次数 | 次 |
| cache.consistency.writes | Counter | 一致性写操作次数 | 次 |
| cache.consistency.deletes | Counter | 一致性删除操作次数 | 次 |
| cache.consistency.inconsistent | Counter | 一致性不一致次数 | 次 |
| cache.consistency.latency | Histogram | 一致性处理延迟 | 毫秒 |
| cache.consistency.strategy.usage | Counter | 各策略使用次数 | 次 |

### 6.2 监控实现

```typescript
// src/infrastructure/cache/monitor/CacheConsistencyMetrics.ts
import { injectable, inject } from 'tsyringe';

/**
 * 缓存一致性监控指标
 */
@injectable()
export class CacheConsistencyMetrics {
  private totalOperations = 0;
  private readOperations = 0;
  private writeOperations = 0;
  private deleteOperations = 0;
  private inconsistentCount = 0;
  private operationLatencies: Map<string, number[]> = new Map();
  private strategyUsage: Map<string, number> = new Map();

  /**
   * 记录一致性操作
   * @param operation 操作类型
   * @param strategy 策略名称
   * @param duration 耗时（毫秒）
   * @param isConsistent 是否一致
   */
  public recordConsistencyOperation(
    operation: 'read' | 'write' | 'delete',
    strategy: string,
    duration: number,
    isConsistent: boolean
  ): void {
    this.totalOperations++;
    
    // 更新操作类型计数
    switch (operation) {
      case 'read':
        this.readOperations++;
        break;
      case 'write':
        this.writeOperations++;
        break;
      case 'delete':
        this.deleteOperations++;
        break;
    }
    
    // 更新策略使用计数
    const currentStrategyCount = this.strategyUsage.get(strategy) || 0;
    this.strategyUsage.set(strategy, currentStrategyCount + 1);
    
    // 更新延迟统计
    const latencies = this.operationLatencies.get(operation) || [];
    latencies.push(duration);
    if (latencies.length > 1000) {
      latencies.shift();
    }
    this.operationLatencies.set(operation, latencies);
    
    // 更新不一致计数
    if (!isConsistent) {
      this.inconsistentCount++;
    }
  }

  /**
   * 获取平均延迟
   * @param operation 操作类型
   */
  public getAverageLatency(operation: 'read' | 'write' | 'delete'): number {
    const latencies = this.operationLatencies.get(operation) || [];
    if (latencies.length === 0) {
      return 0;
    }
    const sum = latencies.reduce((a, b) => a + b, 0);
    return sum / latencies.length;
  }

  /**
   * 获取不一致率
   */
  public getInconsistentRate(): number {
    if (this.totalOperations === 0) {
      return 0;
    }
    return (this.inconsistentCount / this.totalOperations) * 100;
  }

  /**
   * 获取监控统计信息
   */
  public getStats(): {
    totalOperations: number;
    readOperations: number;
    writeOperations: number;
    deleteOperations: number;
    inconsistentCount: number;
    inconsistentRate: number;
    averageReadLatency: number;
    averageWriteLatency: number;
    averageDeleteLatency: number;
    strategyUsage: Record<string, number>;
  } {
    return {
      totalOperations: this.totalOperations,
      readOperations: this.readOperations,
      writeOperations: this.writeOperations,
      deleteOperations: this.deleteOperations,
      inconsistentCount: this.inconsistentCount,
      inconsistentRate: this.getInconsistentRate(),
      averageReadLatency: this.getAverageLatency('read'),
      averageWriteLatency: this.getAverageLatency('write'),
      averageDeleteLatency: this.getAverageLatency('delete'),
      strategyUsage: Object.fromEntries(this.strategyUsage)
    };
  }

  /**
   * 重置监控指标
   */
  public reset(): void {
    this.totalOperations = 0;
    this.readOperations = 0;
    this.writeOperations = 0;
    this.deleteOperations = 0;
    this.inconsistentCount = 0;
    this.operationLatencies.clear();
    this.strategyUsage.clear();
  }
}
```

## 7. 总结

本文档实现了缓存一致性的核心功能，包括：

1. **多种一致性策略**：实现了Cache-Aside、Write-Through、Write-Back和版本控制四种一致性策略
2. **灵活的一致性服务**：提供了统一的缓存一致性服务，支持多种一致性策略
3. **事件驱动架构**：通过事件机制实现了缓存一致性的解耦
4. **完整的监控指标**：提供了缓存一致性相关的监控指标，便于系统运维和调优
5. **详细的使用示例**：提供了在业务服务和控制器中使用缓存一致性的示例
6. **全面的测试方案**：包括单元测试和集成测试

缓存一致性实现遵循了Clean Architecture原则，将缓存一致性逻辑与业务逻辑分离，通过依赖注入实现解耦，便于测试和扩展。同时，支持多种一致性策略，可以根据不同的业务场景选择合适的策略，平衡一致性和性能需求。