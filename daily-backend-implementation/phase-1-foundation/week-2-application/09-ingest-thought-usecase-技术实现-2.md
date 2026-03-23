# Day 09: IngestThoughtUseCase实现 - 代码实现文档（第二部分）

## 5. 数据持久化实现

### 5.1 ThoughtRepository接口

```typescript
// src/domain/interfaces/ThoughtRepository.ts
import { ThoughtFragment } from '../entities/ThoughtFragment';

/**
 * 思维片段仓库接口，定义了思维片段的CRUD操作
 */
export interface ThoughtRepository {
  /**
   * 保存思维片段
   * @param thought 思维片段实体
   * @returns 保存后的思维片段实体
   */
  save(thought: ThoughtFragment): Promise<ThoughtFragment>;

  /**
   * 根据ID查找思维片段
   * @param id 思维片段ID
   * @returns 思维片段实体或null
   */
  findById(id: string): Promise<ThoughtFragment | null>;

  /**
   * 根据用户ID查找思维片段
   * @param userId 用户ID
   * @returns 思维片段实体数组
   */
  findByUserId(userId: string): Promise<ThoughtFragment[]>;

  /**
   * 删除思维片段
   * @param id 思维片段ID
   */
  delete(id: string): Promise<void>;
}
```

### 5.2 SQLite实现

```typescript
// src/infrastructure/persistence/repositories/SQLiteThoughtRepository.ts
import { ThoughtRepository } from '../../../domain/interfaces/ThoughtRepository';
import { ThoughtFragment } from '../../../domain/entities/ThoughtFragment';
import { SQLiteConnection } from '../SQLiteConnection';

/**
 * SQLite实现的思维片段仓库
 */
export class SQLiteThoughtRepository implements ThoughtRepository {
  /**
   * 构造函数
   * @param connection SQLite连接
   */
  constructor(private readonly connection: SQLiteConnection) {}

  /**
   * 保存思维片段
   */
  async save(thought: ThoughtFragment): Promise<ThoughtFragment> {
    const sql = `
      INSERT INTO thought_fragments (id, content, metadata, user_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await this.connection.execute(sql, [
      thought.id,
      thought.content,
      JSON.stringify(thought.metadata),
      thought.userId,
      thought.createdAt.toISOString()
    ]);
    
    return thought;
  }

  /**
   * 根据ID查找思维片段
   */
  async findById(id: string): Promise<ThoughtFragment | null> {
    const sql = `
      SELECT * FROM thought_fragments WHERE id = ?
    `;
    
    const rows = await this.connection.query(sql, [id]);
    if (rows.length === 0) {
      return null;
    }
    
    return this.mapRowToEntity(rows[0]);
  }

  /**
   * 根据用户ID查找思维片段
   */
  async findByUserId(userId: string): Promise<ThoughtFragment[]> {
    const sql = `
      SELECT * FROM thought_fragments WHERE user_id = ? ORDER BY created_at DESC
    `;
    
    const rows = await this.connection.query(sql, [userId]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * 删除思维片段
   */
  async delete(id: string): Promise<void> {
    const sql = `
      DELETE FROM thought_fragments WHERE id = ?
    `;
    
    await this.connection.execute(sql, [id]);
  }

  /**
   * 将数据库行映射为实体
   * @param row 数据库行
   * @returns 思维片段实体
   */
  private mapRowToEntity(row: any): ThoughtFragment {
    return new ThoughtFragment(
      row.id,
      row.content,
      JSON.parse(row.metadata),
      row.user_id,
      new Date(row.created_at)
    );
  }
}
```

### 5.3 SQLite连接实现

```typescript
// src/infrastructure/persistence/SQLiteConnection.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

/**
 * SQLite连接实现
 */
export class SQLiteConnection {
  private db: Database | null = null;

  /**
   * 构造函数
   * @param dbPath 数据库文件路径
   */
  constructor(private readonly dbPath: string = './database.sqlite') {}

  /**
   * 初始化数据库连接
   */
  async init(): Promise<void> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    // 创建思维片段表
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS thought_fragments (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        metadata TEXT NOT NULL DEFAULT '{}',
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON thought_fragments(user_id);
    `);
  }

  /**
   * 执行查询
   * @param sql SQL语句
   * @param params 参数
   * @returns 查询结果
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }
    return this.db.all(sql, params);
  }

  /**
   * 执行SQL语句
   * @param sql SQL语句
   * @param params 参数
   */
  async execute(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }
    await this.db.run(sql, params);
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}
```

## 6. 错误处理机制

### 6.1 全局错误处理

```typescript
// src/presentation/middleware/ErrorMiddleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseError, ValidationError } from '../../shared/errors';

/**
 * 全局错误处理中间件
 * @param error 错误对象
 * @param request 请求对象
 * @param reply 响应对象
 */
export const errorMiddleware = async (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  // 记录错误日志
  console.error(`Error processing request ${request.method} ${request.url}:`, error);

  // 处理不同类型的错误
  if (error instanceof BaseError) {
    // 自定义错误，返回标准化的错误响应
    reply.status(error.statusCode).send({
      status: 'error',
      code: error.code,
      message: error.message
    });
  } else {
    // 其他错误，返回500内部服务器错误
    reply.status(500).send({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    });
  }
};
```

### 6.2 错误工厂

```typescript
// src/shared/errors/ErrorFactory.ts
import { ValidationError } from './ValidationError';
import { NotFoundError } from './NotFoundError';
import { InternalError } from './InternalError';

/**
 * 错误工厂，用于创建各种类型的错误
 */
export class ErrorFactory {
  /**
   * 创建验证错误
   * @param message 错误消息
   * @returns 验证错误实例
   */
  public createValidationError(message: string): ValidationError {
    return new ValidationError('INVALID_INPUT', message);
  }

  /**
   * 创建资源未找到错误
   * @param resource 资源名称
   * @param id 资源ID
   * @returns 资源未找到错误实例
   */
  public createNotFoundError(resource: string, id: string): NotFoundError {
    return new NotFoundError(`${resource} with id ${id} not found`);
  }

  /**
   * 创建内部错误
   * @param message 错误消息
   * @returns 内部错误实例
   */
  public createInternalError(message: string): InternalError {
    return new InternalError(message);
  }
}
```

## 7. 测试策略

### 7.1 单元测试

```typescript
// src/application/usecases/__tests__/IngestThoughtUseCaseImpl.test.ts
import { IngestThoughtUseCaseImpl } from '../IngestThoughtUseCaseImpl';
import { InputValidator } from '../../../shared/validators/InputValidator';
import { ValidationError } from '../../../shared/errors';

// 模拟依赖
const mockThoughtRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  delete: jest.fn()
};

const mockEventBus = {
  subscribe: jest.fn(),
  publish: jest.fn()
};

const mockInputValidator = {
  validateThoughtInput: jest.fn(input => input)
};

describe('IngestThoughtUseCaseImpl', () => {
  let useCase: IngestThoughtUseCaseImpl;

  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    // 创建Use Case实例
    useCase = new IngestThoughtUseCaseImpl(
      mockThoughtRepository,
      mockEventBus,
      mockInputValidator as any
    );
  });

  it('should ingest a thought correctly', async () => {
    // 准备测试数据
    const input = {
      content: '测试思维片段',
      userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' // 有效的UUID
    };

    // 设置模拟返回值
    mockThoughtRepository.save.mockResolvedValue({
      id: 'thought-1',
      content: '测试思维片段',
      metadata: {},
      userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      createdAt: new Date()
    });

    // 执行Use Case
    const result = await useCase.execute(input);

    // 验证结果
    expect(result).toBeDefined();
    expect(result.content).toBe(input.content);
    expect(mockThoughtRepository.save).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalledWith('ThoughtIngested', expect.any(Object));
  });

  it('should throw ValidationError for invalid input', async () => {
    // 准备测试数据 - 无效的用户ID（不是UUID）
    const input = {
      content: '测试思维片段',
      userId: 'invalid-user-id' // 无效的UUID
    };

    // 设置模拟抛出验证错误
    mockInputValidator.validateThoughtInput.mockImplementation(() => {
      throw new ValidationError('INVALID_INPUT', 'userId: Invalid uuid');
    });

    // 执行Use Case并验证是否抛出错误
    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });

  it('should throw ValidationError for empty content', async () => {
    // 准备测试数据 - 空内容
    const input = {
      content: '', // 空内容
      userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    };

    // 设置模拟抛出验证错误
    mockInputValidator.validateThoughtInput.mockImplementation(() => {
      throw new ValidationError('INVALID_INPUT', 'content: String must contain at least 1 character(s)');
    });

    // 执行Use Case并验证是否抛出错误
    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });
});
```

### 7.2 集成测试

```typescript
// src/integration-tests/ingest-thought.test.ts
import { FastifyInstance } from 'fastify';
import request from 'supertest';
import { createApp } from '../presentation/app';

describe('Ingest Thought Integration Test', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    // 创建Fastify应用实例
    app = await createApp();
  });

  afterEach(async () => {
    // 关闭应用实例
    await app.close();
  });

  it('should ingest a thought and return 200', async () => {
    // 发送POST请求到/api/v1/thoughts端点
    const response = await request(app.server)
      .post('/api/v1/thoughts')
      .send({
        content: '集成测试思维片段',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      })
      .set('Accept', 'application/json');

    // 验证响应
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.content).toBe('集成测试思维片段');
  });

  it('should return 400 for invalid input', async () => {
    // 发送POST请求到/api/v1/thoughts端点，使用无效的用户ID
    const response = await request(app.server)
      .post('/api/v1/thoughts')
      .send({
        content: '无效输入测试',
        userId: 'invalid-user-id' // 无效的UUID
      })
      .set('Accept', 'application/json');

    // 验证响应
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_INPUT');
  });
});
```

## 8. API接口实现

### 8.1 控制器实现

```typescript
// src/presentation/controllers/ThoughtController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { IngestThoughtUseCase } from '../../application/usecases/IngestThoughtUseCase';

/**
 * 思维片段控制器，处理与思维片段相关的HTTP请求
 */
export class ThoughtController {
  /**
   * 构造函数
   * @param ingestThoughtUseCase 输入思维片段用例
   */
  constructor(private readonly ingestThoughtUseCase: IngestThoughtUseCase) {}

  /**
   * 处理POST /api/v1/thoughts请求，用于创建思维片段
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async createThought(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // 调用输入思维片段用例
      const result = await this.ingestThoughtUseCase.execute(request.body as any);
      // 返回201 Created响应
      reply.status(201).send(result);
    } catch (error) {
      // 错误会被全局错误处理中间件捕获
      throw error;
    }
  }
}
```

### 8.2 路由配置

```typescript
// src/presentation/routes/thoughtRoutes.ts
import { FastifyInstance } from 'fastify';
import { ThoughtController } from '../controllers/ThoughtController';

/**
 * 思维片段路由配置
 * @param app Fastify实例
 * @param thoughtController 思维片段控制器
 */
export const thoughtRoutes = (app: FastifyInstance, thoughtController: ThoughtController): void => {
  // 创建思维片段
  app.post('/api/v1/thoughts', (request, reply) => 
    thoughtController.createThought(request, reply)
  );
};
```

### 8.3 应用初始化

```typescript
// src/presentation/app.ts
import fastify from 'fastify';
import { thoughtRoutes } from './routes/thoughtRoutes';
import { ThoughtController } from './controllers/ThoughtController';
import { IngestThoughtUseCaseImpl } from '../application/usecases/IngestThoughtUseCaseImpl';
import { SQLiteThoughtRepository } from '../infrastructure/persistence/repositories/SQLiteThoughtRepository';
import { SQLiteConnection } from '../infrastructure/persistence/SQLiteConnection';
import { EventBusImpl } from '../infrastructure/event-bus/EventBusImpl';
import { InputValidator } from '../shared/validators/InputValidator';
import { errorMiddleware } from './middleware/ErrorMiddleware';

/**
 * 创建Fastify应用实例
 * @returns Fastify应用实例
 */
export async function createApp(): Promise<ReturnType<typeof fastify>> {
  // 创建Fastify应用
  const app = fastify({
    logger: true
  });

  // 注册全局错误处理中间件
  app.setErrorHandler(errorMiddleware);

  // 初始化依赖
  const sqliteConnection = new SQLiteConnection();
  await sqliteConnection.init();

  const thoughtRepository = new SQLiteThoughtRepository(sqliteConnection);
  const eventBus = new EventBusImpl();
  const inputValidator = new InputValidator();

  // 创建Use Case实例
  const ingestThoughtUseCase = new IngestThoughtUseCaseImpl(
    thoughtRepository,
    eventBus,
    inputValidator
  );

  // 创建控制器实例
  const thoughtController = new ThoughtController(ingestThoughtUseCase);

  // 注册路由
  thoughtRoutes(app, thoughtController);

  return app;
}

/**
 * 启动应用
 */
async function startApp(): Promise<void> {
  const app = await createApp();
  
  // 启动服务器
  const PORT = process.env.PORT || 3000;
  await app.listen({ port: parseInt(PORT as string), host: '0.0.0.0' });
  
  console.log(`Server running on http://localhost:${PORT}`);
}

// 只有当直接运行此文件时才启动应用
if (require.main === module) {
  startApp().catch(error => {
    console.error('Failed to start app:', error);
    process.exit(1);
  });
}
```

## 9. 总结

Day 09的核心任务是实现IngestThoughtUseCase，这是系统的第一个核心用例。通过今天的开发，我们完成了以下工作：

1. 实现了IngestThoughtUseCase的核心逻辑
2. 添加了输入验证机制，确保输入数据的有效性和安全性
3. 实现了事件触发机制，当思维片段被摄入时触发ThoughtIngested事件
4. 实现了数据持久化，将思维片段存储到SQLite数据库
5. 添加了完善的错误处理机制，包括自定义错误类型和全局错误处理中间件
6. 编写了单元测试和集成测试，确保用例的正确性和可靠性
7. 实现了API接口，允许外部系统通过HTTP请求摄入思维片段

今天的实现遵循了Clean Architecture和DDD设计原则，确保了代码的可维护性、可扩展性和可测试性。我们使用了依赖注入模式，将Use Case与具体的实现细节解耦，使得系统更容易测试和扩展。

在后续的开发中，我们将继续实现其他Use Case，如GenerateProposalUseCase和UpdateCognitiveModelUseCase，逐步构建完整的认知辅助系统。
