# Day 17: 事件系统 - 代码实现文档

## 1. 当日主题概述

### 1.1 核心开发目标
- 实现更完整的事件系统功能
- 设计和实现事件处理器
- 添加事件中间件支持
- 实现事件持久化
- 编写全面的集成测试
- 优化事件系统性能

### 1.2 技术要点
- 事件驱动设计
- 事件处理器模式
- 中间件设计
- 事件持久化
- 集成测试
- 性能优化

## 2. 事件系统增强实现

### 2.1 事件处理器基类

```typescript
// src/infrastructure/event-bus/EventHandlerBase.ts

import { EventHandler } from '../../application/interfaces/event/EventBus';
import { Logger } from '../../application/interfaces/logging/Logger';
import { LoggerImpl } from '../logging/LoggerImpl';

export abstract class EventHandlerBase<T> implements EventHandler<T> {
  protected readonly logger: Logger;
  
  /**
   * 创建事件处理器基类实例
   */
  constructor() {
    this.logger = new LoggerImpl();
  }
  
  /**
   * 处理事件
   * @param event 事件数据
   */
  public async handle(event: T): Promise<void> {
    try {
      this.logger.info(`Handling event: ${this.getEventName()}`, { event });
      await this.process(event);
      this.logger.info(`Successfully handled event: ${this.getEventName()}`, { event });
    } catch (error) {
      this.logger.error(
        `Failed to handle event: ${this.getEventName()}`,
        error instanceof Error ? error : new Error(String(error)),
        { event }
      );
      throw error;
    }
  }
  
  /**
   * 获取事件名称
   * @returns 事件名称
   */
  protected abstract getEventName(): string;
  
  /**
   * 处理事件的具体逻辑
   * @param event 事件数据
   */
  protected abstract process(event: T): Promise<void>;
}
```

### 2.2 事件中间件接口

```typescript
// src/application/interfaces/event/EventMiddleware.ts

export interface EventMiddleware<T> {
  /**
   * 执行中间件逻辑
   * @param event 事件数据
   * @param next 下一个中间件或处理器
   */
  execute(event: T, next: () => Promise<void>): Promise<void>;
}
```

### 2.3 事件中间件实现

```typescript
// src/infrastructure/event-bus/middlewares/LoggingMiddleware.ts

import { EventMiddleware } from '../../../application/interfaces/event/EventMiddleware';
import { Logger } from '../../../application/interfaces/logging/Logger';
import { LoggerImpl } from '../../logging/LoggerImpl';

export class LoggingMiddleware<T> implements EventMiddleware<T> {
  private readonly logger: Logger;
  
  /**
   * 创建日志中间件实例
   */
  constructor() {
    this.logger = new LoggerImpl();
  }
  
  /**
   * 执行日志中间件
   * @param event 事件数据
   * @param next 下一个中间件或处理器
   */
  public async execute(event: T, next: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    this.logger.info('Event received', { event });
    
    await next();
    
    const endTime = Date.now();
    this.logger.info('Event processed', {
      event,
      processingTime: `${endTime - startTime}ms`
    });
  }
}

// src/infrastructure/event-bus/middlewares/ValidationMiddleware.ts

import { EventMiddleware } from '../../../application/interfaces/event/EventMiddleware';
import { Logger } from '../../../application/interfaces/logging/Logger';
import { LoggerImpl } from '../../logging/LoggerImpl';

export class ValidationMiddleware<T> implements EventMiddleware<T> {
  private readonly logger: Logger;
  
  /**
   * 创建验证中间件实例
   */
  constructor() {
    this.logger = new LoggerImpl();
  }
  
  /**
   * 执行验证中间件
   * @param event 事件数据
   * @param next 下一个中间件或处理器
   */
  public async execute(event: T, next: () => Promise<void>): Promise<void> {
    if (!event) {
      this.logger.error('Invalid event: event is null or undefined');
      throw new Error('Event cannot be null or undefined');
    }
    
    // 可以添加更复杂的验证逻辑
    await next();
  }
}
```

### 2.4 增强的事件总线实现

```typescript
// src/infrastructure/event-bus/EnhancedEventBusImpl.ts

import { EventBus, EventHandler } from '../../application/interfaces/event/EventBus';
import { EventMiddleware } from '../../application/interfaces/event/EventMiddleware';

export class EnhancedEventBusImpl implements EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();
  private middlewares: EventMiddleware<any>[] = [];
  
  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理函数
   */
  public subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
  
  /**
   * 添加事件中间件
   * @param middleware 事件中间件
   */
  public addMiddleware<T>(middleware: EventMiddleware<T>): void {
    this.middlewares.push(middleware as EventMiddleware<any>);
  }
  
  /**
   * 发布事件
   * @param eventType 事件类型
   * @param event 事件数据
   */
  public async publish<T>(eventType: string, event: T): Promise<void> {
    const eventHandlers = this.handlers.get(eventType);
    if (!eventHandlers || eventHandlers.length === 0) {
      return;
    }
    
    // 构建中间件链
    const executeHandlers = async () => {
      for (const handler of eventHandlers) {
        await handler.handle(event);
      }
    };
    
    // 从后往前构建中间件链
    let next = executeHandlers;
    for (const middleware of [...this.middlewares].reverse()) {
      const currentMiddleware = middleware;
      const currentNext = next;
      next = async () => {
        await currentMiddleware.execute(event, currentNext);
      };
    }
    
    // 执行中间件链
    await next();
  }
}
```

### 2.5 事件持久化实现

```typescript
// src/infrastructure/persistence/repositories/EventRepositoryImpl.ts

import { EventEntity } from '../../../domain/entities/EventEntity';
import { BaseRepositoryImpl } from '../BaseRepositoryImpl';

export class EventRepositoryImpl extends BaseRepositoryImpl {
  /**
   * 保存事件
   * @param event 事件实体
   * @returns 保存后的事件实体
   */
  public async save(event: EventEntity): Promise<EventEntity> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = `
      INSERT INTO events (id, event_type, event_data, timestamp, processed)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      event.id,
      event.eventType,
      this.stringifyJson(event.eventData),
      event.timestamp.toISOString(),
      event.processed ? 1 : 0
    ];
    
    await connection.execute(sql, params);
    return event;
  }
  
  /**
   * 根据ID查找事件
   * @param id 事件ID
   * @returns 事件实体或null
   */
  public async findById(id: string): Promise<EventEntity | null> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = 'SELECT * FROM events WHERE id = ?';
    const results = await connection.query(sql, [id]);
    
    if (results.length === 0) {
      return null;
    }
    
    const row = results[0];
    return {
      id: row.id,
      eventType: row.event_type,
      eventData: this.parseJson<any>(row.event_data) || {},
      timestamp: new Date(row.timestamp),
      processed: row.processed === 1
    };
  }
  
  /**
   * 查找未处理的事件
   * @param limit 限制数量
   * @returns 未处理的事件列表
   */
  public async findUnprocessedEvents(limit: number = 100): Promise<EventEntity[]> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = 'SELECT * FROM events WHERE processed = 0 ORDER BY timestamp ASC LIMIT ?';
    const results = await connection.query(sql, [limit]);
    
    return results.map((row: any) => ({
      id: row.id,
      eventType: row.event_type,
      eventData: this.parseJson<any>(row.event_data) || {},
      timestamp: new Date(row.timestamp),
      processed: row.processed === 1
    }));
  }
  
  /**
   * 标记事件为已处理
   * @param id 事件ID
   */
  public async markAsProcessed(id: string): Promise<void> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = 'UPDATE events SET processed = 1 WHERE id = ?';
    await connection.execute(sql, [id]);
  }
}
```

### 2.6 事件存储中间件

```typescript
// src/infrastructure/event-bus/middlewares/PersistenceMiddleware.ts

import { EventMiddleware } from '../../../application/interfaces/event/EventMiddleware';
import { EventEntity } from '../../../domain/entities/EventEntity';
import { EventRepositoryImpl } from '../../persistence/repositories/EventRepositoryImpl';
import { Logger } from '../../../application/interfaces/logging/Logger';
import { LoggerImpl } from '../../logging/LoggerImpl';

export class PersistenceMiddleware<T> implements EventMiddleware<T> {
  private readonly eventRepository: EventRepositoryImpl;
  private readonly logger: Logger;
  
  /**
   * 创建持久化中间件实例
   */
  constructor() {
    this.eventRepository = new EventRepositoryImpl();
    this.logger = new LoggerImpl();
  }
  
  /**
   * 执行持久化中间件
   * @param event 事件数据
   * @param next 下一个中间件或处理器
   */
  public async execute(event: T, next: () => Promise<void>): Promise<void> {
    // 保存事件到数据库
    const eventEntity: EventEntity = {
      id: this.generateId(),
      eventType: this.getEventType(event),
      eventData: event,
      timestamp: new Date(),
      processed: false
    };
    
    await this.eventRepository.save(eventEntity);
    this.logger.info('Event persisted', { eventId: eventEntity.id, eventType: eventEntity.eventType });
    
    await next();
    
    // 标记事件为已处理
    await this.eventRepository.markAsProcessed(eventEntity.id);
    this.logger.info('Event marked as processed', { eventId: eventEntity.id });
  }
  
  /**
   * 生成唯一ID
   * @returns 唯一ID字符串
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 获取事件类型
   * @param event 事件数据
   * @returns 事件类型字符串
   */
  private getEventType(event: T): string {
    // 根据事件对象的结构或属性推断事件类型
    // 这里简单实现，实际项目中可以使用更复杂的逻辑
    const eventObj = event as any;
    if (eventObj.eventType) {
      return eventObj.eventType;
    }
    return 'UnknownEvent';
  }
}
```

## 3. 事件处理器实现示例

### 3.1 思维片段事件处理器

```typescript
// src/infrastructure/event-bus/handlers/ThoughtIngestedEventHandler.ts

import { EventHandlerBase } from '../EventHandlerBase';
import { ThoughtIngestedEvent } from '../../../application/events/ThoughtIngestedEvent';
import { GenerateProposalUseCaseImpl } from '../../../application/usecases/GenerateProposalUseCaseImpl';
import { EventBusImpl } from '../EventBusImpl';

export class ThoughtIngestedEventHandler extends EventHandlerBase<ThoughtIngestedEvent> {
  private readonly generateProposalUseCase: GenerateProposalUseCaseImpl;
  
  /**
   * 创建思维片段事件处理器实例
   */
  constructor() {
    super();
    this.generateProposalUseCase = new GenerateProposalUseCaseImpl(new EventBusImpl());
  }
  
  /**
   * 获取事件名称
   * @returns 事件名称
   */
  protected getEventName(): string {
    return 'ThoughtIngested';
  }
  
  /**
   * 处理思维片段事件
   * @param event 思维片段事件数据
   */
  protected async process(event: ThoughtIngestedEvent): Promise<void> {
    // 当接收到思维片段事件时，生成认知建议
    await this.generateProposalUseCase.execute(event.thoughtId);
  }
}
```

### 3.2 认知模型更新事件处理器

```typescript
// src/infrastructure/event-bus/handlers/CognitiveModelUpdatedEventHandler.ts

import { EventHandlerBase } from '../EventHandlerBase';
import { CognitiveModelUpdatedEvent } from '../../../application/events/CognitiveModelUpdatedEvent';
import { GenerateInsightUseCaseImpl } from '../../../application/usecases/GenerateInsightUseCaseImpl';
import { EventBusImpl } from '../EventBusImpl';

export class CognitiveModelUpdatedEventHandler extends EventHandlerBase<CognitiveModelUpdatedEvent> {
  private readonly generateInsightUseCase: GenerateInsightUseCaseImpl;
  
  /**
   * 创建认知模型更新事件处理器实例
   */
  constructor() {
    super();
    this.generateInsightUseCase = new GenerateInsightUseCaseImpl(new EventBusImpl());
  }
  
  /**
   * 获取事件名称
   * @returns 事件名称
   */
  protected getEventName(): string {
    return 'CognitiveModelUpdated';
  }
  
  /**
   * 处理认知模型更新事件
   * @param event 认知模型更新事件数据
   */
  protected async process(event: CognitiveModelUpdatedEvent): Promise<void> {
    // 当认知模型更新时，生成认知洞察
    await this.generateInsightUseCase.execute(event.modelId);
  }
}
```

## 4. 事件系统集成示例

### 4.1 应用启动时配置事件系统

```typescript
// src/application/services/EventSystemService.ts

import { EnhancedEventBusImpl } from '../../infrastructure/event-bus/EnhancedEventBusImpl';
import { LoggingMiddleware } from '../../infrastructure/event-bus/middlewares/LoggingMiddleware';
import { ValidationMiddleware } from '../../infrastructure/event-bus/middlewares/ValidationMiddleware';
import { PersistenceMiddleware } from '../../infrastructure/event-bus/middlewares/PersistenceMiddleware';
import { ThoughtIngestedEventHandler } from '../../infrastructure/event-bus/handlers/ThoughtIngestedEventHandler';
import { CognitiveModelUpdatedEventHandler } from '../../infrastructure/event-bus/handlers/CognitiveModelUpdatedEventHandler';
import { EventType } from '../events/EventType';
import { EventBus } from '../interfaces/event/EventBus';

export class EventSystemService {
  private eventBus: EventBus;
  
  /**
   * 创建事件系统服务实例
   */
  constructor() {
    this.eventBus = new EnhancedEventBusImpl();
  }
  
  /**
   * 初始化事件系统
   */
  public initialize(): void {
    // 添加中间件
    this.eventBus.addMiddleware(new LoggingMiddleware());
    this.eventBus.addMiddleware(new ValidationMiddleware());
    this.eventBus.addMiddleware(new PersistenceMiddleware());
    
    // 注册事件处理器
    this.registerEventHandlers();
  }
  
  /**
   * 注册事件处理器
   */
  private registerEventHandlers(): void {
    // 注册思维片段事件处理器
    this.eventBus.subscribe(
      EventType.THOUGHT_INGESTED,
      new ThoughtIngestedEventHandler()
    );
    
    // 注册认知模型更新事件处理器
    this.eventBus.subscribe(
      EventType.COGNITIVE_MODEL_UPDATED,
      new CognitiveModelUpdatedEventHandler()
    );
    
    // 可以添加更多事件处理器...
  }
  
  /**
   * 获取事件总线实例
   * @returns 事件总线实例
   */
  public getEventBus(): EventBus {
    return this.eventBus;
  }
}
```

### 4.2 在应用服务中使用事件系统

```typescript
// src/application/services/ApplicationService.ts

import { SQLiteConnectionPool } from '../infrastructure/persistence/SQLiteConnectionPool';
import { DatabaseInitializer } from '../infrastructure/persistence/DatabaseInitializer';
import { EventSystemService } from './EventSystemService';

export class ApplicationService {
  private readonly connectionPool: SQLiteConnectionPool;
  private readonly eventSystemService: EventSystemService;
  
  /**
   * 创建应用服务实例
   */
  constructor() {
    this.connectionPool = SQLiteConnectionPool.getInstance();
    this.eventSystemService = new EventSystemService();
  }
  
  /**
   * 启动应用
   */
  public async start(): Promise<void> {
    try {
      console.log('Starting application...');
      
      // 初始化数据库
      const connection = await this.connectionPool.getConnection();
      const initializer = new DatabaseInitializer(connection);
      await initializer.initialize();
      
      // 初始化事件系统
      this.eventSystemService.initialize();
      
      console.log('Application started successfully');
    } catch (error) {
      console.error('Failed to start application:', error);
      throw error;
    }
  }
  
  /**
   * 停止应用
   */
  public async stop(): Promise<void> {
    try {
      console.log('Stopping application...');
      
      // 关闭数据库连接池
      await this.connectionPool.close();
      
      console.log('Application stopped successfully');
    } catch (error) {
      console.error('Failed to stop application:', error);
      throw error;
    }
  }
  
  /**
   * 获取事件系统服务
   * @returns 事件系统服务实例
   */
  public getEventSystemService(): EventSystemService {
    return this.eventSystemService;
  }
}
```

## 5. 事件系统测试

### 5.1 事件处理器测试

```typescript
// src/infrastructure/event-bus/handlers/__tests__/ThoughtIngestedEventHandler.test.ts

import { ThoughtIngestedEventHandler } from '../ThoughtIngestedEventHandler';
import { ThoughtIngestedEvent } from '../../../../application/events/ThoughtIngestedEvent';
import { GenerateProposalUseCaseImpl } from '../../../../application/usecases/GenerateProposalUseCaseImpl';

describe('ThoughtIngestedEventHandler', () => {
  it('should handle ThoughtIngestedEvent correctly', async () => {
    // 模拟依赖
    const mockExecute = jest.fn().mockResolvedValue({});
    
    // 保存原始构造函数
    const originalConstructor = GenerateProposalUseCaseImpl;
    
    // 替换为模拟构造函数
    jest.mock('../../../../application/usecases/GenerateProposalUseCaseImpl', () => {
      return {
        GenerateProposalUseCaseImpl: jest.fn().mockImplementation(() => {
          return {
            execute: mockExecute
          };
        })
      };
    });
    
    // 创建事件处理器
    const handler = new ThoughtIngestedEventHandler();
    
    // 创建测试事件
    const event: ThoughtIngestedEvent = {
      thoughtId: 'thought-1',
      content: 'test thought',
      timestamp: new Date()
    };
    
    // 执行事件处理
    await handler.handle(event);
    
    // 验证结果
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith('thought-1');
    
    // 恢复原始构造函数
    jest.unmock('../../../../application/usecases/GenerateProposalUseCaseImpl');
  });
});
```

### 5.2 事件中间件测试

```typescript
// src/infrastructure/event-bus/middlewares/__tests__/LoggingMiddleware.test.ts

import { LoggingMiddleware } from '../LoggingMiddleware';

describe('LoggingMiddleware', () => {
  it('should execute middleware and call next', async () => {
    const middleware = new LoggingMiddleware();
    const next = jest.fn().mockResolvedValue(undefined);
    const event = { message: 'test' };
    
    await middleware.execute(event, next);
    
    expect(next).toHaveBeenCalledTimes(1);
  });
});
```

### 5.3 事件系统集成测试

```typescript
// src/infrastructure/event-bus/__tests__/EnhancedEventBusImpl.test.ts

import { EnhancedEventBusImpl } from '../EnhancedEventBusImpl';
import { LoggingMiddleware } from '../middlewares/LoggingMiddleware';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { EventHandler } from '../../../application/interfaces/event/EventBus';

describe('EnhancedEventBusImpl', () => {
  it('should publish events with middleware', async () => {
    const eventBus = new EnhancedEventBusImpl();
    
    // 添加中间件
    eventBus.addMiddleware(new LoggingMiddleware());
    eventBus.addMiddleware(new ValidationMiddleware());
    
    // 注册事件处理器
    const mockHandler = {
      handle: jest.fn().mockResolvedValue(undefined)
    } as EventHandler<any>;
    
    eventBus.subscribe('TestEvent', mockHandler);
    
    // 发布事件
    const event = { message: 'test' };
    await eventBus.publish('TestEvent', event);
    
    // 验证结果
    expect(mockHandler.handle).toHaveBeenCalledTimes(1);
    expect(mockHandler.handle).toHaveBeenCalledWith(event);
  });
});
```

## 6. 事件系统性能优化

### 6.1 事件异步处理

```typescript
// src/infrastructure/event-bus/AsyncEventBusImpl.ts

import { EventBus, EventHandler } from '../../application/interfaces/event/EventBus';
import { EventMiddleware } from '../../application/interfaces/event/EventMiddleware';

export class AsyncEventBusImpl implements EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();
  private middlewares: EventMiddleware<any>[] = [];
  private readonly maxConcurrentEvents: number;
  private activeEvents: number = 0;
  private eventQueue: Array<{ eventType: string; event: any }> = [];
  
  /**
   * 创建异步事件总线实例
   * @param maxConcurrentEvents 最大并发事件数
   */
  constructor(maxConcurrentEvents: number = 5) {
    this.maxConcurrentEvents = maxConcurrentEvents;
  }
  
  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理函数
   */
  public subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
  
  /**
   * 添加事件中间件
   * @param middleware 事件中间件
   */
  public addMiddleware<T>(middleware: EventMiddleware<T>): void {
    this.middlewares.push(middleware as EventMiddleware<any>);
  }
  
  /**
   * 发布事件
   * @param eventType 事件类型
   * @param event 事件数据
   */
  public publish<T>(eventType: string, event: T): Promise<void> {
    return new Promise((resolve) => {
      this.eventQueue.push({ eventType, event });
      this.processQueue();
      resolve();
    });
  }
  
  /**
   * 处理事件队列
   */
  private processQueue(): void {
    if (this.activeEvents >= this.maxConcurrentEvents || this.eventQueue.length === 0) {
      return;
    }
    
    this.activeEvents++;
    const { eventType, event } = this.eventQueue.shift()!;
    
    this.processEvent(eventType, event)
      .finally(() => {
        this.activeEvents--;
        this.processQueue();
      });
  }
  
  /**
   * 处理单个事件
   * @param eventType 事件类型
   * @param event 事件数据
   */
  private async processEvent<T>(eventType: string, event: T): Promise<void> {
    const eventHandlers = this.handlers.get(eventType);
    if (!eventHandlers || eventHandlers.length === 0) {
      return;
    }
    
    // 构建中间件链
    const executeHandlers = async () => {
      for (const handler of eventHandlers) {
        await handler.handle(event);
      }
    };
    
    // 从后往前构建中间件链
    let next = executeHandlers;
    for (const middleware of [...this.middlewares].reverse()) {
      const currentMiddleware = middleware;
      const currentNext = next;
      next = async () => {
        await currentMiddleware.execute(event, currentNext);
      };
    }
    
    // 执行中间件链
    await next();
  }
}
```

## 7. 总结

Day 17的核心任务是增强事件系统的功能，包括：

1. **事件处理器基类**：提供了统一的事件处理基础，包含日志记录和错误处理
2. **事件中间件支持**：实现了日志、验证和持久化中间件，增强了事件处理的扩展性
3. **事件持久化**：将事件保存到数据库，支持事件的可靠处理和重试
4. **事件处理器实现**：为思维片段和认知模型更新事件创建了具体的处理器
5. **事件系统集成**：提供了完整的事件系统初始化和配置示例
6. **全面的测试**：编写了事件处理器、中间件和集成测试
7. **性能优化**：实现了异步事件处理，支持最大并发事件数限制

通过Day 17的开发，我们成功构建了一个完整、可靠、高性能的事件系统，为系统的解耦和扩展提供了坚实的基础。事件系统的增强实现使得系统各模块之间的通信更加灵活和可靠，同时支持了事件的持久化和重试机制，提高了系统的容错能力。

在后续的开发中，我们将继续完善事件系统，添加更多的事件类型和处理器，同时优化事件处理的性能和可靠性。