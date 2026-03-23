# Day 16: 仓库实现 - 代码实现文档 (Part 2)

## 4. 日志系统实现

### 4.1 日志接口

```typescript
// src/application/interfaces/logging/Logger.ts

export interface Logger {
  /**
   * 记录调试信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  debug(message: string, context?: any): void;
  
  /**
   * 记录信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  info(message: string, context?: any): void;
  
  /**
   * 记录警告
   * @param message 日志消息
   * @param context 日志上下文
   */
  warn(message: string, context?: any): void;
  
  /**
   * 记录错误
   * @param message 日志消息
   * @param error 错误对象
   * @param context 日志上下文
   */
  error(message: string, error?: Error, context?: any): void;
}
```

### 4.2 日志实现

```typescript
// src/infrastructure/logging/LoggerImpl.ts

import { Logger } from '../../application/interfaces/logging/Logger';

export class LoggerImpl implements Logger {
  private readonly logLevel: string;
  
  /**
   * 创建日志实例
   * @param logLevel 日志级别（debug, info, warn, error）
   */
  constructor(logLevel: string = 'info') {
    this.logLevel = logLevel;
  }
  
  /**
   * 记录调试信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  public debug(message: string, context?: any): void {
    if (this.shouldLog('debug')) {
      this.log('DEBUG', message, context);
    }
  }
  
  /**
   * 记录信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  public info(message: string, context?: any): void {
    if (this.shouldLog('info')) {
      this.log('INFO', message, context);
    }
  }
  
  /**
   * 记录警告
   * @param message 日志消息
   * @param context 日志上下文
   */
  public warn(message: string, context?: any): void {
    if (this.shouldLog('warn')) {
      this.log('WARN', message, context);
    }
  }
  
  /**
   * 记录错误
   * @param message 日志消息
   * @param error 错误对象
   * @param context 日志上下文
   */
  public error(message: string, error?: Error, context?: any): void {
    if (this.shouldLog('error')) {
      this.log('ERROR', message, context, error);
    }
  }
  
  /**
   * 判断是否应该记录该级别的日志
   * @param level 日志级别
   * @returns 是否应该记录
   */
  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }
  
  /**
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   * @param context 日志上下文
   * @param error 错误对象
   */
  private log(level: string, message: string, context?: any, error?: Error): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : undefined
    };
    
    console.log(JSON.stringify(logEntry));
  }
}
```

## 5. 单元测试设计

### 5.1 认知模型仓库测试

```typescript
// src/infrastructure/persistence/__tests__/CognitiveModelRepositoryImpl.test.ts

import { CognitiveModelRepositoryImpl } from '../repositories/CognitiveModelRepositoryImpl';
import { UserCognitiveModel } from '../../../domain/entities/UserCognitiveModel';
import { CognitiveConcept } from '../../../domain/entities/CognitiveConcept';
import { CognitiveRelation } from '../../../domain/entities/CognitiveRelation';
import { SQLiteConnectionPool } from '../SQLiteConnectionPool';
import { DatabaseInitializer } from '../DatabaseInitializer';
import { unlinkSync, existsSync } from 'fs';

describe('CognitiveModelRepositoryImpl', () => {
  const testDbPath = './test-model-db.sqlite';
  let repository: CognitiveModelRepositoryImpl;
  
  beforeEach(async () => {
    // 清理测试数据库文件
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    
    // 初始化数据库
    const connectionPool = SQLiteConnectionPool.getInstance(testDbPath);
    const connection = await connectionPool.getConnection();
    const initializer = new DatabaseInitializer(connection);
    await initializer.initialize();
    
    repository = new CognitiveModelRepositoryImpl();
  });
  
  afterEach(async () => {
    // 关闭连接池
    const connectionPool = SQLiteConnectionPool.getInstance();
    await connectionPool.close();
    
    // 清理测试数据库文件
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    
    // 重置单例
    (SQLiteConnectionPool as any).instance = null;
  });
  
  it('should save and find cognitive model by id', async () => {
    // 创建测试模型
    const model: UserCognitiveModel = {
      id: 'model-1',
      userId: 'user-1',
      concepts: [
        {
          id: 'concept-1',
          semanticIdentity: 'test concept',
          abstractionLevel: 3,
          confidenceScore: 0.8,
          description: 'test description',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      relations: [],
      evolutionHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 保存模型
    await repository.save(model);
    
    // 查找模型
    const foundModel = await repository.findById('model-1');
    
    expect(foundModel).toBeDefined();
    expect(foundModel!.id).toBe('model-1');
    expect(foundModel!.concepts.length).toBe(1);
    expect(foundModel!.concepts[0].id).toBe('concept-1');
  });
  
  it('should find cognitive model by user id', async () => {
    // 创建测试模型
    const model: UserCognitiveModel = {
      id: 'model-2',
      userId: 'user-2',
      concepts: [],
      relations: [],
      evolutionHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 保存模型
    await repository.save(model);
    
    // 查找模型
    const foundModel = await repository.findByUserId('user-2');
    
    expect(foundModel).toBeDefined();
    expect(foundModel!.id).toBe('model-2');
    expect(foundModel!.userId).toBe('user-2');
  });
});
```

### 5.2 事件总线测试

```typescript
// src/infrastructure/event-bus/__tests__/EventBusImpl.test.ts

import { EventBusImpl } from '../EventBusImpl';
import { EventHandler } from '../../../application/interfaces/event/EventBus';

describe('EventBusImpl', () => {
  let eventBus: EventBusImpl;
  
  beforeEach(() => {
    eventBus = new EventBusImpl();
  });
  
  it('should publish and subscribe to events', () => {
    const mockHandler = {
      handle: jest.fn()
    } as EventHandler<any>;
    
    // 订阅事件
    eventBus.subscribe('TestEvent', mockHandler);
    
    // 发布事件
    const eventData = { message: 'test' };
    eventBus.publish('TestEvent', eventData);
    
    // 验证事件处理函数被调用
    expect(mockHandler.handle).toHaveBeenCalledTimes(1);
    expect(mockHandler.handle).toHaveBeenCalledWith(eventData);
  });
  
  it('should handle multiple handlers for the same event', () => {
    const mockHandler1 = { handle: jest.fn() } as EventHandler<any>;
    const mockHandler2 = { handle: jest.fn() } as EventHandler<any>;
    
    // 订阅事件
    eventBus.subscribe('TestEvent', mockHandler1);
    eventBus.subscribe('TestEvent', mockHandler2);
    
    // 发布事件
    const eventData = { message: 'test' };
    eventBus.publish('TestEvent', eventData);
    
    // 验证所有事件处理函数被调用
    expect(mockHandler1.handle).toHaveBeenCalledTimes(1);
    expect(mockHandler2.handle).toHaveBeenCalledTimes(1);
    expect(mockHandler1.handle).toHaveBeenCalledWith(eventData);
    expect(mockHandler2.handle).toHaveBeenCalledWith(eventData);
  });
  
  it('should only call handlers for the subscribed event type', () => {
    const mockHandler1 = { handle: jest.fn() } as EventHandler<any>;
    const mockHandler2 = { handle: jest.fn() } as EventHandler<any>;
    
    // 订阅不同事件
    eventBus.subscribe('Event1', mockHandler1);
    eventBus.subscribe('Event2', mockHandler2);
    
    // 发布事件1
    eventBus.publish('Event1', { message: 'event1' });
    
    // 验证只有事件1的处理函数被调用
    expect(mockHandler1.handle).toHaveBeenCalledTimes(1);
    expect(mockHandler2.handle).not.toHaveBeenCalled();
  });
});
```

## 6. 集成与使用示例

### 6.1 仓库工厂

```typescript
// src/infrastructure/persistence/RepositoryFactory.ts

import { ThoughtRepository } from '../../application/interfaces/repository/ThoughtRepository';
import { CognitiveModelRepository } from '../../application/interfaces/repository/CognitiveModelRepository';
import { CognitiveProposalRepository } from '../../application/interfaces/repository/CognitiveProposalRepository';
import { CognitiveInsightRepository } from '../../application/interfaces/repository/CognitiveInsightRepository';
import { ThoughtRepositoryImpl } from './repositories/ThoughtRepositoryImpl';
import { CognitiveModelRepositoryImpl } from './repositories/CognitiveModelRepositoryImpl';
import { CognitiveProposalRepositoryImpl } from './repositories/CognitiveProposalRepositoryImpl';
import { CognitiveInsightRepositoryImpl } from './repositories/CognitiveInsightRepositoryImpl';

export class RepositoryFactory {
  /**
   * 创建思维片段仓库实例
   * @returns 思维片段仓库实例
   */
  public static createThoughtRepository(): ThoughtRepository {
    return new ThoughtRepositoryImpl();
  }
  
  /**
   * 创建认知模型仓库实例
   * @returns 认知模型仓库实例
   */
  public static createCognitiveModelRepository(): CognitiveModelRepository {
    return new CognitiveModelRepositoryImpl();
  }
  
  /**
   * 创建认知建议仓库实例
   * @returns 认知建议仓库实例
   */
  public static createCognitiveProposalRepository(): CognitiveProposalRepository {
    return new CognitiveProposalRepositoryImpl();
  }
  
  /**
   * 创建认知洞察仓库实例
   * @returns 认知洞察仓库实例
   */
  public static createCognitiveInsightRepository(): CognitiveInsightRepository {
    return new CognitiveInsightRepositoryImpl();
  }
}
```

### 6.2 Use Case与Repository集成

```typescript
// src/application/usecases/UpdateCognitiveModelUseCaseImpl.ts

import { UpdateCognitiveModelUseCase } from './UpdateCognitiveModelUseCase';
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';
import { CognitiveModelRepository } from '../interfaces/repository/CognitiveModelRepository';
import { CognitiveProposalRepository } from '../interfaces/repository/CognitiveProposalRepository';
import { EventBus } from '../interfaces/event/EventBus';
import { EventType } from '../events/EventType';
import { CognitiveModelUpdatedEvent } from '../events/CognitiveModelUpdatedEvent';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';

export class UpdateCognitiveModelUseCaseImpl implements UpdateCognitiveModelUseCase {
  private readonly cognitiveModelRepository: CognitiveModelRepository;
  private readonly cognitiveProposalRepository: CognitiveProposalRepository;
  private readonly eventBus: EventBus;
  
  /**
   * 创建更新认知模型用例实例
   * @param eventBus 事件总线实例
   */
  constructor(eventBus: EventBus) {
    // 使用仓库工厂创建仓库实例
    this.cognitiveModelRepository = RepositoryFactory.createCognitiveModelRepository();
    this.cognitiveProposalRepository = RepositoryFactory.createCognitiveProposalRepository();
    this.eventBus = eventBus;
  }
  
  /**
   * 执行更新认知模型用例
   * @param proposalId 认知建议ID
   * @returns 更新后的认知模型
   */
  public async execute(proposalId: string): Promise<UserCognitiveModel> {
    // 1. 查找认知建议
    const proposal = await this.cognitiveProposalRepository.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with id ${proposalId} not found`);
    }
    
    // 2. 查找或创建用户认知模型
    let model = await this.cognitiveModelRepository.findByUserId('user-1');
    if (!model) {
      // 创建新模型
      model = {
        id: `model-${Date.now()}`,
        userId: 'user-1',
        concepts: [],
        relations: [],
        evolutionHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    // 3. 应用建议到模型（简化实现）
    // 实际应用中，这里需要更复杂的逻辑来验证和应用建议
    model.updatedAt = new Date();
    
    // 4. 保存更新后的模型
    const updatedModel = await this.cognitiveModelRepository.save(model);
    
    // 5. 发布事件
    const event: CognitiveModelUpdatedEvent = {
      modelId: updatedModel.id,
      userId: updatedModel.userId,
      timestamp: new Date(),
      changes: { proposalId }
    };
    this.eventBus.publish(EventType.COGNITIVE_MODEL_UPDATED, event);
    
    return updatedModel;
  }
}
```

## 7. 总结

Day 16的核心任务是实现各种Repository接口，包括：

1. **认知模型仓库**：实现了认知模型的保存、查询和更新功能，支持概念和关系的关联存储
2. **认知建议仓库**：实现了认知建议的保存和查询功能，支持概念候选和关系候选的存储
3. **认知洞察仓库**：实现了认知洞察的保存和查询功能
4. **事件系统**：实现了事件总线和事件处理机制，支持事件的发布和订阅
5. **日志系统**：实现了基本的日志记录功能，支持不同级别的日志输出

通过Day 16的开发，我们成功实现了Infrastructure层的核心功能，为Application层提供了必要的支持。在后续的开发中，我们将继续完善Infrastructure层的功能，包括事件处理、日志管理和错误处理等，同时开始系统的集成测试和优化工作。