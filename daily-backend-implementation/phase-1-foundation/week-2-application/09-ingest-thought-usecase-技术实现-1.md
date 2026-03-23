# Day 09: IngestThoughtUseCase实现 - 代码实现文档（第一部分）

## 1. IngestThoughtUseCase概述

### 1.1 功能描述

IngestThoughtUseCase是系统的核心用例之一，负责接收和处理用户输入的思维片段。它的主要功能包括：

- 接收用户输入的思维片段内容
- 验证输入数据的有效性
- 将思维片段存储到数据库
- 触发ThoughtIngested事件，通知其他模块进行后续处理
- 返回处理结果给调用者

### 1.2 依赖关系

| 依赖项 | 类型 | 用途 |
|--------|------|------|
| `ThoughtRepository` | 接口 | 负责思维片段的数据持久化 |
| `EventBus` | 接口 | 负责事件的发布和订阅 |
| `InputValidator` | 服务 | 负责输入数据的验证 |
| `ErrorFactory` | 服务 | 负责创建标准化的错误对象 |

## 2. 输入验证实现

### 2.1 验证策略

为了确保输入数据的有效性和安全性，我们采用以下验证策略：

- 使用`zod`库进行类型安全的输入验证
- 验证所有必填字段是否存在
- 验证字段类型是否正确
- 验证字段长度是否符合要求
- 验证元数据格式是否合法

### 2.2 验证器实现

```typescript
// src/shared/validators/InputValidator.ts
import { z } from 'zod';
import { ValidationError } from '../errors';

/**
 * 输入验证器，用于验证各种输入数据
 */
export class InputValidator {
  /**
   * 思维片段输入验证模式
   */
  private static readonly thoughtInputSchema = z.object({
    /**
     * 思维片段内容，必填，长度在1-10000字符之间
     */
    content: z.string().min(1).max(10000),
    /**
     * 元数据，可选，必须是对象
     */
    metadata: z.record(z.any()).optional(),
    /**
     * 用户ID，必填，格式为UUID
     */
    userId: z.string().uuid()
  });

  /**
   * 验证思维片段输入
   * @param input 输入数据
   * @returns 验证后的输入数据
   * @throws ValidationError 如果输入数据无效
   */
  public validateThoughtInput(input: any): z.infer<typeof InputValidator.thoughtInputSchema> {
    try {
      return InputValidator.thoughtInputSchema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new ValidationError('INVALID_INPUT', errorMessage);
      }
      throw error;
    }
  }
}
```

### 2.3 错误定义

```typescript
// src/shared/errors/index.ts
import { BaseError } from './BaseError';

/**
 * 验证错误，用于表示输入数据验证失败
 */
export class ValidationError extends BaseError {
  constructor(code: string, message: string) {
    super(code, message, 400);
  }
}

/**
 * 基础错误类，所有自定义错误都继承自此类
 */
export class BaseError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

## 3. IngestThoughtUseCase实现

### 3.1 核心实现

```typescript
// src/application/usecases/IngestThoughtUseCaseImpl.ts
import { IngestThoughtUseCase, ThoughtInputDto, ThoughtOutputDto } from './IngestThoughtUseCase';
import { ThoughtRepository } from '../../domain/interfaces/ThoughtRepository';
import { EventBus } from '../../domain/interfaces/EventBus';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';
import { InputValidator } from '../../shared/validators/InputValidator';
import { ValidationError } from '../../shared/errors';

/**
 * 输入思维片段用例的实现
 */
export class IngestThoughtUseCaseImpl implements IngestThoughtUseCase {
  /**
   * 构造函数，通过依赖注入获取所需的服务
   */
  constructor(
    private readonly thoughtRepository: ThoughtRepository,
    private readonly eventBus: EventBus,
    private readonly inputValidator: InputValidator
  ) {}

  /**
   * 执行用例
   * @param input 输入数据
   * @returns 输出数据
   * @throws ValidationError 如果输入数据无效
   * @throws Error 如果执行过程中发生其他错误
   */
  async execute(input: ThoughtInputDto): Promise<ThoughtOutputDto> {
    try {
      // 1. 验证输入数据
      const validatedInput = this.inputValidator.validateThoughtInput(input);

      // 2. 创建ThoughtFragment实体
      const thought = new ThoughtFragment(
        this.generateId(),
        validatedInput.content,
        validatedInput.metadata || {},
        validatedInput.userId
      );

      // 3. 保存到数据库
      const savedThought = await this.thoughtRepository.save(thought);

      // 4. 发布事件
      this.eventBus.publish('ThoughtIngested', {
        thoughtId: savedThought.id,
        content: savedThought.content,
        userId: savedThought.userId,
        timestamp: new Date()
      });

      // 5. 转换为DTO返回
      return this.toOutputDto(savedThought);
    } catch (error) {
      // 6. 处理错误
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Failed to ingest thought: ${error.message}`);
    }
  }

  /**
   * 生成唯一ID
   * @returns 唯一ID
   */
  private generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * 将实体转换为DTO
   * @param thought 思维片段实体
   * @returns 思维片段DTO
   */
  private toOutputDto(thought: ThoughtFragment): ThoughtOutputDto {
    return {
      id: thought.id,
      content: thought.content,
      metadata: thought.metadata,
      userId: thought.userId,
      createdAt: thought.createdAt
    };
  }
}
```

### 3.2 实体类实现

```typescript
// src/domain/entities/ThoughtFragment.ts
import { BaseEntity } from './BaseEntity';

/**
 * 思维片段实体，代表用户的一个思维片段
 */
export class ThoughtFragment extends BaseEntity {
  /**
   * 构造函数
   * @param id 唯一标识符
   * @param content 思维片段内容
   * @param metadata 元数据
   * @param userId 用户ID
   * @param createdAt 创建时间
   */
  constructor(
    id: string,
    public readonly content: string,
    public readonly metadata: Record<string, any>,
    public readonly userId: string,
    createdAt: Date = new Date()
  ) {
    super(id, createdAt);
  }
}
```

### 3.3 基础实体类

```typescript
// src/domain/entities/BaseEntity.ts
/**
 * 基础实体类，所有实体都继承自此类
 */
export abstract class BaseEntity {
  /**
   * 构造函数
   * @param id 唯一标识符
   * @param createdAt 创建时间
   * @param updatedAt 更新时间
   */
  protected constructor(
    public readonly id: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
}
```

## 4. 事件触发机制实现

### 4.1 事件总线实现

```typescript
// src/infrastructure/event-bus/EventBusImpl.ts
import { EventBus } from '../../domain/interfaces/EventBus';

/**
 * 事件总线实现，基于内存的事件发布订阅系统
 */
export class EventBusImpl implements EventBus {
  /**
   * 事件处理器映射，键为事件类型，值为该事件类型的所有处理器
   */
  private handlers: Map<string, Array<(event: any) => void>> = new Map();

  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理器
   */
  subscribe<T>(eventType: string, handler: (event: T) => void): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler as (event: any) => void);
  }

  /**
   * 发布事件
   * @param eventType 事件类型
   * @param event 事件数据
   */
  publish<T>(eventType: string, event: T): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error handling event ${eventType}:`, error);
        }
      });
    }
  }
}
```

### 4.2 事件监听器实现

```typescript
// src/infrastructure/event-listeners/ThoughtIngestedListener.ts
import { EventBus } from '../../domain/interfaces/EventBus';
import { GenerateProposalUseCase } from '../../application/usecases/GenerateProposalUseCase';

/**
 * 思维片段摄入事件监听器，用于在思维片段被摄入后生成认知建议
 */
export class ThoughtIngestedListener {
  /**
   * 构造函数
   * @param eventBus 事件总线
   * @param generateProposalUseCase 生成认知建议用例
   */
  constructor(
    eventBus: EventBus,
    private readonly generateProposalUseCase: GenerateProposalUseCase
  ) {
    // 订阅ThoughtIngested事件
    eventBus.subscribe('ThoughtIngested', this.handle.bind(this));
  }

  /**
   * 处理ThoughtIngested事件
   * @param event 事件数据
   */
  private async handle(event: { thoughtId: string }): Promise<void> {
    try {
      // 调用生成认知建议用例
      await this.generateProposalUseCase.execute(event.thoughtId);
    } catch (error) {
      console.error(`Error generating proposal for thought ${event.thoughtId}:`, error);
    }
  }
}
```
