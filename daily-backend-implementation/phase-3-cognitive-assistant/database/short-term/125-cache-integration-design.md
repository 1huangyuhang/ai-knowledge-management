# 125-缓存集成设计

## 1. 缓存集成概述

本文档描述了认知辅助系统中缓存层与应用系统的集成设计方案。缓存层作为系统的重要组成部分，需要与应用系统的各个层级进行无缝集成，以提高系统性能、降低数据库负载、支持高并发访问。

### 1.1 集成目标

1. **无缝集成**：缓存层与应用系统无缝集成，对业务代码侵入性小
2. **高性能**：集成后系统性能显著提升，响应时间降低
3. **可靠性**：集成后系统可靠性不受影响，具备故障恢复机制
4. **可扩展性**：支持未来系统扩展，如集群部署、多数据中心等
5. **可监控性**：集成后可监控缓存使用情况，便于调优
6. **易用性**：开发人员易于使用，学习成本低

### 1.2 集成范围

缓存层需要与应用系统的以下层级进行集成：

1. **应用层**：与业务逻辑层集成，提供缓存服务
2. **数据访问层**：与数据库访问层集成，实现缓存与数据库的一致性
3. **API层**：与API层集成，支持缓存控制
4. **监控层**：与监控系统集成，提供缓存监控指标

## 2. 缓存集成架构

### 2.1 系统架构

认知辅助系统采用Clean Architecture架构，分为以下层级：

1. **Presentation层**：API接口层，处理HTTP请求和响应
2. **Application层**：业务逻辑层，实现业务规则
3. **Domain层**：领域模型层，定义核心业务实体和规则
4. **Infrastructure层**：基础设施层，包括数据库访问、缓存、外部服务等
5. **AI Capability层**：AI能力层，提供AI相关功能

### 2.2 缓存集成位置

根据Clean Architecture原则，缓存层属于Infrastructure层，应该与其他基础设施服务（如数据库、消息队列等）一起集成。具体集成位置如下：

1. **Infrastructure层**：实现缓存服务的具体代码，如Redis客户端、缓存策略等
2. **Application层**：通过依赖注入使用缓存服务，实现业务逻辑与缓存的结合
3. **Domain层**：不直接依赖缓存服务，保持领域模型的纯净
4. **Presentation层**：通过中间件或装饰器支持缓存控制

### 2.3 集成模式

缓存层与应用系统的集成采用以下模式：

1. **依赖注入模式**：通过依赖注入将缓存服务注入到业务组件中
2. **装饰器模式**：使用装饰器包装业务方法，实现缓存逻辑
3. **中间件模式**：在API层使用中间件实现缓存控制
4. **事件驱动模式**：通过事件机制实现缓存失效和更新

## 3. 缓存集成设计

### 3.1 依赖注入设计

#### 3.1.1 依赖注入容器

使用TypeScript的依赖注入容器，如InversifyJS、tsyringe等，将缓存服务注入到业务组件中。

```typescript
// 使用tsyringe进行依赖注入
import { container, injectable, inject } from 'tsyringe';
import { CacheService } from '../cache/service/CacheService';
import { UserRepository } from './user.repository';

@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(CacheService) private cacheService: CacheService
  ) {}

  // 业务方法
  async getUserCognitiveModel(userId: number, modelType: string) {
    // 尝试从缓存获取
    let model = await this.cacheService.getUserCognitiveModel(userId, modelType);
    
    if (!model) {
      // 缓存未命中，从数据库获取
      model = await this.userRepository.getCognitiveModel(userId, modelType);
      
      // 设置缓存
      await this.cacheService.setUserCognitiveModel(userId, modelType, model);
    }
    
    return model;
  }
}

// 注册服务
container.register(CacheService, { useValue: cacheService });
container.register(UserRepository, { useClass: UserRepository });
container.register(UserService, { useClass: UserService });
```

#### 3.1.2 缓存服务接口

定义缓存服务接口，便于依赖注入和测试。

```typescript
// 缓存服务接口
export interface ICacheService {
  // 用户认知模型相关
  getUserCognitiveModel(userId: number, modelType: string): Promise<any | null>;
  setUserCognitiveModel(userId: number, modelType: string, model: any, ttl?: number): Promise<void>;
  deleteUserCognitiveModel(userId: number, modelType: string): Promise<void>;
  // 其他缓存方法...
}

// 缓存服务实现
export class CacheService implements ICacheService {
  // 实现缓存方法...
}
```

### 3.2 装饰器设计

使用装饰器模式包装业务方法，实现缓存逻辑，减少重复代码。

```typescript
// 缓存装饰器
import { CacheService } from '../cache/service/CacheService';

// 缓存装饰器参数接口
interface CacheOptions {
  key: string; // 缓存键模板
  ttl?: number; // 过期时间（秒）
  method?: 'get' | 'set' | 'delete'; // 缓存方法
}

// 创建缓存服务实例
const cacheService = createCacheService();

// 缓存装饰器实现
export function Cache(options: CacheOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 生成缓存键
      const cacheKey = generateCacheKey(options.key, args);

      if (options.method === 'get' || !options.method) {
        // 获取缓存
        const cachedValue = await cacheService.get(cacheKey);
        if (cachedValue) {
          return cachedValue;
        }

        // 缓存未命中，执行原始方法
        const result = await originalMethod.apply(this, args);

        // 设置缓存
        await cacheService.set(cacheKey, result, options.ttl);
        return result;
      } else if (options.method === 'set') {
        // 执行原始方法
        const result = await originalMethod.apply(this, args);

        // 设置缓存
        await cacheService.set(cacheKey, result, options.ttl);
        return result;
      } else if (options.method === 'delete') {
        // 执行原始方法
        const result = await originalMethod.apply(this, args);

        // 删除缓存
        await cacheService.delete(cacheKey);
        return result;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// 生成缓存键
function generateCacheKey(keyTemplate: string, args: any[]): string {
  let cacheKey = keyTemplate;
  
  // 替换参数占位符
  for (let i = 0; i < args.length; i++) {
    cacheKey = cacheKey.replace(`{${i}}`, String(args[i]));
  }
  
  return cacheKey;
}

// 使用缓存装饰器
export class UserService {
  @Cache({ key: 'user:model:{0}:{1}', ttl: 3600 })
  async getUserCognitiveModel(userId: number, modelType: string) {
    // 从数据库获取模型
    return await this.userRepository.getCognitiveModel(userId, modelType);
  }
}
```

### 3.3 中间件设计

在API层使用中间件实现缓存控制，支持HTTP缓存头、缓存失效等。

```typescript
// 缓存中间件
import express from 'express';
import { CacheService } from '../cache/service/CacheService';

// 创建缓存服务实例
const cacheService = createCacheService();

// 缓存中间件
const cacheMiddleware = (options: { ttl?: number; keyPrefix?: string }) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // 生成缓存键
    const cacheKey = `${options.keyPrefix || 'api'}:${req.method}:${req.path}:${JSON.stringify(req.query)}`;

    // 检查是否需要缓存
    const cacheControl = req.header('Cache-Control');
    if (cacheControl === 'no-cache' || cacheControl === 'no-store') {
      return next();
    }

    // 尝试从缓存获取
    cacheService.get(cacheKey).then((cachedData) => {
      if (cachedData) {
        // 设置缓存头
        res.setHeader('Cache-Control', `max-age=${options.ttl || 3600}`);
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      // 缓存未命中，执行后续中间件
      const originalSend = res.send;
      res.send = function (data: any) {
        // 将响应数据存入缓存
        if (res.statusCode === 200) {
          cacheService.set(cacheKey, JSON.parse(data), options.ttl).catch(console.error);
        }
        res.setHeader('X-Cache', 'MISS');
        return originalSend.call(this, data);
      };

      next();
    }).catch((error) => {
      console.error('Cache middleware error:', error);
      next();
    });
  };
};

// 使用缓存中间件
const app = express();

// 应用缓存中间件
app.use('/api/users/:userId/models', cacheMiddleware({ ttl: 3600, keyPrefix: 'user-models' }));
```

### 3.4 事件驱动设计

通过事件机制实现缓存失效和更新，确保缓存与数据库的一致性。

```typescript
// 事件总线
class EventBus {
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  // 订阅事件
  subscribe(event: string, listener: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(listener);
  }

  // 发布事件
  publish(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  // 取消订阅
  unsubscribe(event: string, listener: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(l => l !== listener));
    }
  }
}

// 创建事件总线实例
export const eventBus = new EventBus();

// 缓存事件处理器
class CacheEventHandler {
  constructor(private cacheService: CacheService) {
    // 订阅用户相关事件
    eventBus.subscribe('user:model:created', this.handleUserModelCreated.bind(this));
    eventBus.subscribe('user:model:updated', this.handleUserModelUpdated.bind(this));
    eventBus.subscribe('user:model:deleted', this.handleUserModelDeleted.bind(this));
    
    // 订阅认知概念相关事件
    eventBus.subscribe('cognitive:concept:created', this.handleCognitiveConceptCreated.bind(this));
    eventBus.subscribe('cognitive:concept:updated', this.handleCognitiveConceptUpdated.bind(this));
    eventBus.subscribe('cognitive:concept:deleted', this.handleCognitiveConceptDeleted.bind(this));
    
    // 订阅认知关系相关事件
    eventBus.subscribe('cognitive:relation:created', this.handleCognitiveRelationCreated.bind(this));
    eventBus.subscribe('cognitive:relation:updated', this.handleCognitiveRelationUpdated.bind(this));
    eventBus.subscribe('cognitive:relation:deleted', this.handleCognitiveRelationDeleted.bind(this));
  }

  // 处理用户模型创建事件
  private async handleUserModelCreated(data: any): Promise<void> {
    const { userId, modelType, model } = data;
    await this.cacheService.setUserCognitiveModel(userId, modelType, model);
  }

  // 处理用户模型更新事件
  private async handleUserModelUpdated(data: any): Promise<void> {
    const { userId, modelType, model } = data;
    await this.cacheService.setUserCognitiveModel(userId, modelType, model);
  }

  // 处理用户模型删除事件
  private async handleUserModelDeleted(data: any): Promise<void> {
    const { userId, modelType } = data;
    await this.cacheService.deleteUserCognitiveModel(userId, modelType);
  }

  // 其他事件处理方法...
}

// 在业务服务中发布事件
export class UserService {
  async updateCognitiveModel(userId: number, modelType: string, model: any) {
    // 更新数据库
    const updatedModel = await this.userRepository.updateCognitiveModel(userId, modelType, model);
    
    // 发布更新事件
    eventBus.publish('user:model:updated', { userId, modelType, model: updatedModel });
    
    return updatedModel;
  }
}
```

## 4. 缓存一致性设计

### 4.1 一致性策略

采用以下策略确保缓存与数据库的一致性：

1. **写操作策略**：先更新数据库，再删除缓存（Cache-Aside模式）
2. **事件驱动策略**：通过事件机制实现缓存失效和更新
3. **TTL策略**：为缓存设置合理的过期时间，确保最终一致性
4. **版本控制策略**：使用版本号机制确保缓存数据的新鲜度

### 4.2 写操作流程

写操作流程如下：

1. 接收写操作请求
2. 开始数据库事务
3. 更新数据库记录
4. 提交数据库事务
5. 发布缓存更新事件
6. 事件处理器删除或更新缓存
7. 返回响应

### 4.3 事件驱动一致性

通过事件机制实现缓存一致性，流程如下：

1. 业务服务执行写操作，更新数据库
2. 业务服务发布缓存更新事件
3. 事件总线将事件分发给订阅者
4. 缓存事件处理器接收事件
5. 缓存事件处理器根据事件类型执行相应的缓存操作（删除或更新）
6. 缓存更新完成

### 4.4 版本控制一致性

使用版本号机制确保缓存数据的新鲜度，流程如下：

1. 数据库记录包含版本号字段
2. 缓存数据包含版本号信息
3. 读取数据时，比较缓存版本号与数据库版本号
4. 如果缓存版本号低于数据库版本号，则更新缓存
5. 否则，使用缓存数据

## 5. 缓存集成实现

### 5.1 项目结构

```
src/
├── application/          # 应用层
│   ├── services/        # 业务服务
│   ├── use-cases/       # 用例
│   └── decorators/      # 装饰器
├── domain/              # 领域层
│   ├── entities/        # 实体
│   ├── repositories/    # 仓库接口
│   └── services/        # 领域服务
├── infrastructure/      # 基础设施层
│   ├── cache/           # 缓存服务
│   ├── database/        # 数据库访问
│   ├── event-bus/       # 事件总线
│   └── external/        # 外部服务
├── presentation/        # 表示层
│   ├── controllers/     # 控制器
│   ├── middlewares/     # 中间件
│   └── routes/          # 路由
└── index.ts            # 入口文件
```

### 5.2 依赖注入实现

使用tsyringe实现依赖注入：

```typescript
// src/infrastructure/cache/cache.module.ts
import { container } from 'tsyringe';
import { RedisConfig } from './config/RedisConfig';
import { RedisConnection } from './connection/RedisConnection';
import { RedisClient } from './core/RedisClient';
import { CacheService } from './service/CacheService';

// 注册缓存服务
container.register(RedisConfig, { useValue: new RedisConfig() });
container.register(RedisConnection, { useClass: RedisConnection });
container.register(RedisClient, { useClass: RedisClient });
container.register(CacheService, { useClass: CacheService });

export { CacheService };

// src/application/services/user.service.ts
import { injectable, inject } from 'tsyringe';
import { CacheService } from '../../infrastructure/cache';
import { UserRepository } from '../../domain/repositories/user.repository';

@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(CacheService) private cacheService: CacheService
  ) {}

  async getUserCognitiveModel(userId: number, modelType: string) {
    // 尝试从缓存获取
    let model = await this.cacheService.getUserCognitiveModel(userId, modelType);
    
    if (!model) {
      // 缓存未命中，从数据库获取
      model = await this.userRepository.getCognitiveModel(userId, modelType);
      
      // 设置缓存
      await this.cacheService.setUserCognitiveModel(userId, modelType, model);
    }
    
    return model;
  }
}
```

### 5.3 装饰器实现

使用TypeScript装饰器实现缓存逻辑：

```typescript
// src/application/decorators/cache.decorator.ts
import { injectable, inject } from 'tsyringe';
import { CacheService } from '../../infrastructure/cache';

interface CacheOptions {
  key: string;
  ttl?: number;
  method?: 'get' | 'set' | 'delete';
}

@injectable()
export class CacheDecorator {
  constructor(@inject(CacheService) private cacheService: CacheService) {}

  Cache(options: CacheOptions) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        // 生成缓存键
        const cacheKey = generateCacheKey(options.key, args);

        if (options.method === 'get' || !options.method) {
          // 获取缓存
          const cachedValue = await this.cacheService.get(cacheKey);
          if (cachedValue) {
            return cachedValue;
          }

          // 缓存未命中，执行原始方法
          const result = await originalMethod.apply(this, args);

          // 设置缓存
          await this.cacheService.set(cacheKey, result, options.ttl);
          return result;
        } else if (options.method === 'set') {
          // 执行原始方法
          const result = await originalMethod.apply(this, args);

          // 设置缓存
          await this.cacheService.set(cacheKey, result, options.ttl);
          return result;
        } else if (options.method === 'delete') {
          // 执行原始方法
          const result = await originalMethod.apply(this, args);

          // 删除缓存
          await this.cacheService.delete(cacheKey);
          return result;
        }

        return originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }
}

// 生成缓存键
function generateCacheKey(keyTemplate: string, args: any[]): string {
  let cacheKey = keyTemplate;
  
  // 替换参数占位符
  for (let i = 0; i < args.length; i++) {
    cacheKey = cacheKey.replace(`{${i}}`, String(args[i]));
  }
  
  return cacheKey;
}

// 使用装饰器
@injectable()
export class UserService {
  @Cache({ key: 'user:model:{0}:{1}', ttl: 3600 })
  async getUserCognitiveModel(userId: number, modelType: string) {
    return await this.userRepository.getCognitiveModel(userId, modelType);
  }
}
```

### 5.4 中间件实现

使用Express中间件实现API缓存：

```typescript
// src/presentation/middlewares/cache.middleware.ts
import express from 'express';
import { CacheService } from '../../infrastructure/cache';

interface CacheMiddlewareOptions {
  ttl?: number;
  keyPrefix?: string;
}

export function createCacheMiddleware(cacheService: CacheService) {
  return (options: CacheMiddlewareOptions = {}) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      // 生成缓存键
      const cacheKey = `${options.keyPrefix || 'api'}:${req.method}:${req.path}:${JSON.stringify(req.query)}`;

      // 检查是否需要缓存
      const cacheControl = req.header('Cache-Control');
      if (cacheControl === 'no-cache' || cacheControl === 'no-store') {
        return next();
      }

      // 尝试从缓存获取
      cacheService.get(cacheKey).then((cachedData) => {
        if (cachedData) {
          // 设置缓存头
          res.setHeader('Cache-Control', `max-age=${options.ttl || 3600}`);
          res.setHeader('X-Cache', 'HIT');
          return res.json(cachedData);
        }

        // 缓存未命中，执行后续中间件
        const originalSend = res.send;
        res.send = function (data: any) {
          // 将响应数据存入缓存
          if (res.statusCode === 200) {
            cacheService.set(cacheKey, JSON.parse(data), options.ttl).catch(console.error);
          }
          res.setHeader('X-Cache', 'MISS');
          return originalSend.call(this, data);
        };

        next();
      }).catch((error) => {
        console.error('Cache middleware error:', error);
        next();
      });
    };
  };
}

// 使用中间件
// src/presentation/routes/user.routes.ts
import express from 'express';
import { UserController } from '../controllers/user.controller';
import { createCacheMiddleware } from '../middlewares/cache.middleware';
import { CacheService } from '../../infrastructure/cache';

const router = express.Router();
const userController = new UserController();
const cacheService = new CacheService();
const cacheMiddleware = createCacheMiddleware(cacheService);

// 应用缓存中间件
router.get('/:userId/models/:modelType', cacheMiddleware({ ttl: 3600 }), userController.getCognitiveModel);

export { router as userRoutes };
```

### 5.5 事件驱动实现

使用事件总线实现缓存一致性：

```typescript
// src/infrastructure/event-bus/event-bus.ts
class EventBus {
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  // 订阅事件
  subscribe(event: string, listener: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(listener);
  }

  // 发布事件
  publish(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  // 取消订阅
  unsubscribe(event: string, listener: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(l => l !== listener));
    }
  }
}

export const eventBus = new EventBus();

// src/infrastructure/cache/event-handlers/cache-event-handler.ts
import { CacheService } from '../service/CacheService';
import { eventBus } from '../../event-bus/event-bus';

export class CacheEventHandler {
  constructor(private cacheService: CacheService) {
    // 订阅用户相关事件
    eventBus.subscribe('user:model:created', this.handleUserModelCreated.bind(this));
    eventBus.subscribe('user:model:updated', this.handleUserModelUpdated.bind(this));
    eventBus.subscribe('user:model:deleted', this.handleUserModelDeleted.bind(this));
    
    // 订阅认知概念相关事件
    eventBus.subscribe('cognitive:concept:created', this.handleCognitiveConceptCreated.bind(this));
    eventBus.subscribe('cognitive:concept:updated', this.handleCognitiveConceptUpdated.bind(this));
    eventBus.subscribe('cognitive:concept:deleted', this.handleCognitiveConceptDeleted.bind(this));
    
    // 订阅认知关系相关事件
    eventBus.subscribe('cognitive:relation:created', this.handleCognitiveRelationCreated.bind(this));
    eventBus.subscribe('cognitive:relation:updated', this.handleCognitiveRelationUpdated.bind(this));
    eventBus.subscribe('cognitive:relation:deleted', this.handleCognitiveRelationDeleted.bind(this));
  }

  // 处理用户模型创建事件
  private async handleUserModelCreated(data: any): Promise<void> {
    const { userId, modelType, model } = data;
    await this.cacheService.setUserCognitiveModel(userId, modelType, model);
  }

  // 处理用户模型更新事件
  private async handleUserModelUpdated(data: any): Promise<void> {
    const { userId, modelType, model } = data;
    await this.cacheService.setUserCognitiveModel(userId, modelType, model);
  }

  // 处理用户模型删除事件
  private async handleUserModelDeleted(data: any): Promise<void> {
    const { userId, modelType } = data;
    await this.cacheService.deleteUserCognitiveModel(userId, modelType);
  }

  // 处理认知概念创建事件
  private async handleCognitiveConceptCreated(data: any): Promise<void> {
    const { modelId, concept } = data;
    // 清除相关缓存
    await this.cacheService.deleteCognitiveConcepts(modelId);
  }

  // 处理认知概念更新事件
  private async handleCognitiveConceptUpdated(data: any): Promise<void> {
    const { modelId, concept } = data;
    // 清除相关缓存
    await this.cacheService.deleteCognitiveConcepts(modelId);
  }

  // 处理认知概念删除事件
  private async handleCognitiveConceptDeleted(data: any): Promise<void> {
    const { modelId, conceptId } = data;
    // 清除相关缓存
    await this.cacheService.deleteCognitiveConcepts(modelId);
  }

  // 处理认知关系创建事件
  private async handleCognitiveRelationCreated(data: any): Promise<void> {
    const { modelId, relation } = data;
    // 清除相关缓存
    await this.cacheService.deleteCognitiveRelations(modelId);
  }

  // 处理认知关系更新事件
  private async handleCognitiveRelationUpdated(data: any): Promise<void> {
    const { modelId, relation } = data;
    // 清除相关缓存
    await this.cacheService.deleteCognitiveRelations(modelId);
  }

  // 处理认知关系删除事件
  private async handleCognitiveRelationDeleted(data: any): Promise<void> {
    const { modelId, relationId } = data;
    // 清除相关缓存
    await this.cacheService.deleteCognitiveRelations(modelId);
  }
}

// 初始化事件处理器
// src/infrastructure/cache/index.ts
import { CacheService } from './service/CacheService';
import { CacheEventHandler } from './event-handlers/cache-event-handler';

// 创建缓存服务实例
const cacheService = new CacheService();

// 创建事件处理器实例
const cacheEventHandler = new CacheEventHandler(cacheService);

export { cacheService as CacheService };

// 在业务服务中发布事件
// src/application/services/user.service.ts
import { eventBus } from '../../infrastructure/event-bus/event-bus';

export class UserService {
  async createCognitiveModel(userId: number, modelType: string, model: any) {
    // 创建模型
    const createdModel = await this.userRepository.createCognitiveModel(userId, modelType, model);
    
    // 发布创建事件
    eventBus.publish('user:model:created', { userId, modelType, model: createdModel });
    
    return createdModel;
  }
  
  async updateCognitiveModel(userId: number, modelType: string, model: any) {
    // 更新模型
    const updatedModel = await this.userRepository.updateCognitiveModel(userId, modelType, model);
    
    // 发布更新事件
    eventBus.publish('user:model:updated', { userId, modelType, model: updatedModel });
    
    return updatedModel;
  }
  
  async deleteCognitiveModel(userId: number, modelType: string) {
    // 删除模型
    await this.userRepository.deleteCognitiveModel(userId, modelType);
    
    // 发布删除事件
    eventBus.publish('user:model:deleted', { userId, modelType });
  }
}
```

## 6. 缓存集成测试

### 6.1 单元测试

```typescript
// tests/application/services/user.service.test.ts
import { UserService } from '../../../src/application/services/user.service';
import { CacheService } from '../../../src/infrastructure/cache';
import { UserRepository } from '../../../src/infrastructure/database/repositories/user.repository';

// 模拟缓存服务
const mockCacheService = {
  getUserCognitiveModel: jest.fn(),
  setUserCognitiveModel: jest.fn(),
  deleteUserCognitiveModel: jest.fn(),
};

// 模拟用户仓库
const mockUserRepository = {
  getCognitiveModel: jest.fn(),
  createCognitiveModel: jest.fn(),
  updateCognitiveModel: jest.fn(),
  deleteCognitiveModel: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockUserRepository as any, mockCacheService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should get cognitive model from cache if available', async () => {
    // 模拟缓存命中
    const mockModel = { id: 1, name: 'Test Model' };
    mockCacheService.getUserCognitiveModel.mockResolvedValue(mockModel);

    const result = await userService.getUserCognitiveModel(1, 'personal');

    expect(mockCacheService.getUserCognitiveModel).toHaveBeenCalledWith(1, 'personal');
    expect(mockUserRepository.getCognitiveModel).not.toHaveBeenCalled();
    expect(result).toEqual(mockModel);
  });

  test('should get cognitive model from database if cache miss', async () => {
    // 模拟缓存未命中
    mockCacheService.getUserCognitiveModel.mockResolvedValue(null);
    const mockModel = { id: 1, name: 'Test Model' };
    mockUserRepository.getCognitiveModel.mockResolvedValue(mockModel);

    const result = await userService.getUserCognitiveModel(1, 'personal');

    expect(mockCacheService.getUserCognitiveModel).toHaveBeenCalledWith(1, 'personal');
    expect(mockUserRepository.getCognitiveModel).toHaveBeenCalledWith(1, 'personal');
    expect(mockCacheService.setUserCognitiveModel).toHaveBeenCalledWith(1, 'personal', mockModel);
    expect(result).toEqual(mockModel);
  });
});
```

### 6.2 集成测试

```typescript
// tests/integration/cache.integration.test.ts
import { createCacheService } from '../../../src/infrastructure/cache';
import { UserRepository } from '../../../src/infrastructure/database/repositories/user.repository';
import { UserService } from '../../../src/application/services/user.service';

// 集成测试
// 注意：需要启动Redis服务才能运行此测试
describe('Cache Integration', () => {
  let cacheService: any;
  let userRepository: any;
  let userService: any;

  beforeAll(() => {
    cacheService = createCacheService();
    userRepository = new UserRepository();
    userService = new UserService(userRepository, cacheService);
  });

  afterAll(async () => {
    // 清除测试数据
    await cacheService.deleteBatch(['user:1:model:personal']);
  });

  test('should cache user cognitive model', async () => {
    // 模拟数据库查询
    const mockModel = { id: 1, name: 'Test Model' };
    jest.spyOn(userRepository, 'getCognitiveModel').mockResolvedValue(mockModel);

    // 第一次调用，缓存未命中
    const result1 = await userService.getUserCognitiveModel(1, 'personal');
    expect(result1).toEqual(mockModel);
    expect(userRepository.getCognitiveModel).toHaveBeenCalledTimes(1);

    // 第二次调用，缓存命中
    const result2 = await userService.getUserCognitiveModel(1, 'personal');
    expect(result2).toEqual(mockModel);
    expect(userRepository.getCognitiveModel).toHaveBeenCalledTimes(1);
  });
});
```

## 7. 缓存集成监控

### 7.1 监控指标

| 指标 | 单位 | 监控频率 | 告警阈值 |
|------|------|----------|----------|
| 缓存命中率 | % | 每秒 | < 90% |
| 缓存使用率 | % | 每分钟 | > 80% |
| 缓存读写延迟 | ms | 每秒 | > 5ms |
| 缓存操作次数 | 次/秒 | 每秒 | - |
| 缓存错误率 | % | 每分钟 | > 0.1% |
| 缓存键数量 | 个 | 每分钟 | - |

### 7.2 监控集成

集成Prometheus和Grafana监控缓存指标：

1. 使用Redis Exporter监控Redis服务器指标
2. 使用自定义指标监控应用层缓存指标
3. 使用Grafana创建缓存监控仪表盘

### 7.3 日志集成

记录缓存操作日志，便于调试和分析：

```typescript
// src/infrastructure/cache/utils/cache-logger.ts
export class CacheLogger {
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  public info(message: string, data?: any): void {
    if (this.enabled) {
      this.log('INFO', message, data);
    }
  }

  public error(message: string, error?: any): void {
    if (this.enabled) {
      this.log('ERROR', message, error);
    }
  }

  public debug(message: string, data?: any): void {
    if (this.enabled) {
      this.log('DEBUG', message, data);
    }
  }

  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${timestamp}] [${level}] [CACHE] ${message}${logData}`);
  }
}
```

## 8. 缓存集成最佳实践

### 8.1 设计最佳实践

1. **保持缓存与数据库的一致性**：使用Cache-Aside模式或事件驱动模式
2. **设置合理的TTL**：根据数据变化频率设置合理的过期时间
3. **使用统一的缓存键命名规范**：便于管理和调试
4. **避免缓存雪崩**：使用随机TTL或分布式锁
5. **避免缓存穿透**：使用布隆过滤器或空值缓存
6. **避免缓存击穿**：使用互斥锁或热点数据预加载
7. **使用装饰器或中间件减少重复代码**：提高代码复用性
8. **使用依赖注入**：便于测试和扩展
9. **监控缓存使用情况**：及时发现问题
10. **定期清理无效缓存**：减少内存占用

### 8.2 开发最佳实践

1. **优先使用业务缓存**：为频繁访问的业务数据添加缓存
2. **避免缓存过大的数据**：超过1MB的数据应考虑其他存储方式
3. **使用批量操作减少网络开销**：使用管道或批量命令
4. **使用异步操作减少阻塞**：缓存操作应异步执行
5. **处理缓存错误**：缓存不可用时应降级到数据库
6. **测试缓存功能**：编写单元测试和集成测试
7. **文档化缓存策略**：便于其他开发人员理解
8. **定期审查缓存使用情况**：优化缓存策略

### 8.3 部署最佳实践

1. **独立部署Redis服务**：避免与应用服务器共享资源
2. **使用高可用Redis集群**：确保缓存服务的可用性
3. **监控Redis性能**：及时发现性能瓶颈
4. **定期备份Redis数据**：防止数据丢失
5. **使用SSL/TLS加密Redis连接**：提高安全性
6. **限制Redis连接数**：防止连接泄露
7. **优化Redis配置**：根据实际情况调整配置参数
8. **使用Redis Sentinel或Cluster**：实现高可用性

## 9. 总结

本文档设计了认知辅助系统中缓存层与应用系统的集成方案，包括：

1. **集成架构**：缓存层与Clean Architecture的集成设计
2. **集成模式**：依赖注入、装饰器、中间件、事件驱动等模式
3. **一致性设计**：Cache-Aside模式、事件驱动、TTL策略、版本控制等
4. **实现细节**：依赖注入实现、装饰器实现、中间件实现、事件驱动实现等
5. **测试方案**：单元测试和集成测试
6. **监控方案**：监控指标、监控集成、日志集成等
7. **最佳实践**：设计、开发、部署最佳实践

通过本方案的实施，可以将缓存层与应用系统无缝集成，提高系统性能、降低数据库负载、支持高并发访问，同时保持系统的可靠性和可扩展性。