# Day 15: 数据库连接 - 代码实现文档（第二部分）

## 4. 数据库操作实现

### 4.1 基础仓库抽象类

```typescript
// src/infrastructure/persistence/BaseRepositoryImpl.ts

import { SQLiteConnectionPool } from './SQLiteConnectionPool';

export abstract class BaseRepositoryImpl {
  protected readonly connectionPool: SQLiteConnectionPool;
  
  /**
   * 创建基础仓库实例
   */
  constructor() {
    this.connectionPool = SQLiteConnectionPool.getInstance();
  }
  
  /**
   * 生成唯一ID
   * @returns 唯一ID字符串
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 解析JSON字符串
   * @param json JSON字符串
   * @returns 解析后的对象
   */
  protected parseJson<T>(json: string | null): T | null {
    if (!json) {
      return null;
    }
    try {
      return JSON.parse(json) as T;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return null;
    }
  }
  
  /**
   * 将对象转换为JSON字符串
   * @param obj 要转换的对象
   * @returns JSON字符串
   */
  protected stringifyJson(obj: any): string {
    return JSON.stringify(obj);
  }
}
```

### 4.2 思维片段仓库实现

```typescript
// src/infrastructure/persistence/repositories/ThoughtRepositoryImpl.ts

import { ThoughtRepository } from '../../../application/interfaces/repository/ThoughtRepository';
import { ThoughtFragment } from '../../../domain/entities/ThoughtFragment';
import { BaseRepositoryImpl } from '../BaseRepositoryImpl';

export class ThoughtRepositoryImpl extends BaseRepositoryImpl implements ThoughtRepository {
  /**
   * 保存思维片段
   * @param thought 思维片段实体
   * @returns 保存后的思维片段实体
   */
  public async save(thought: ThoughtFragment): Promise<ThoughtFragment> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = `
      INSERT INTO thought_fragments (id, content, metadata, user_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      thought.id,
      thought.content,
      this.stringifyJson(thought.metadata),
      thought.userId,
      thought.createdAt.toISOString()
    ];
    
    await connection.execute(sql, params);
    return thought;
  }
  
  /**
   * 根据ID查找思维片段
   * @param id 思维片段ID
   * @returns 思维片段实体或null
   */
  public async findById(id: string): Promise<ThoughtFragment | null> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = 'SELECT * FROM thought_fragments WHERE id = ?';
    const params = [id];
    
    const results = await connection.query(sql, params);
    
    if (results.length === 0) {
      return null;
    }
    
    const row = results[0];
    return this.mapToThoughtFragment(row);
  }
  
  /**
   * 根据用户ID查找思维片段
   * @param userId 用户ID
   * @returns 思维片段列表
   */
  public async findByUserId(userId: string): Promise<ThoughtFragment[]> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = 'SELECT * FROM thought_fragments WHERE user_id = ? ORDER BY created_at DESC';
    const params = [userId];
    
    const results = await connection.query(sql, params);
    
    return results.map(row => this.mapToThoughtFragment(row));
  }
  
  /**
   * 删除思维片段
   * @param id 思维片段ID
   */
  public async delete(id: string): Promise<void> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = 'DELETE FROM thought_fragments WHERE id = ?';
    const params = [id];
    
    await connection.execute(sql, params);
  }
  
  /**
   * 将数据库行映射为思维片段实体
   * @param row 数据库行
   * @returns 思维片段实体
   */
  private mapToThoughtFragment(row: any): ThoughtFragment {
    return {
      id: row.id,
      content: row.content,
      metadata: this.parseJson<Record<string, any>>(row.metadata) || {},
      userId: row.user_id,
      createdAt: new Date(row.created_at)
    };
  }
}
```

## 5. 错误处理机制

### 5.1 数据库错误类型

```typescript
// src/infrastructure/errors/DatabaseError.ts

export class DatabaseError extends Error {
  private readonly errorCode: string;
  private readonly sql: string | undefined;
  private readonly params: any[] | undefined;
  
  /**
   * 创建数据库错误
   * @param message 错误信息
   * @param errorCode 错误代码
   * @param sql SQL语句（可选）
   * @param params 查询参数（可选）
   */
  constructor(message: string, errorCode: string, sql?: string, params?: any[]) {
    super(message);
    this.name = 'DatabaseError';
    this.errorCode = errorCode;
    this.sql = sql;
    this.params = params;
  }
  
  /**
   * 获取错误代码
   * @returns 错误代码
   */
  public getErrorCode(): string {
    return this.errorCode;
  }
  
  /**
   * 获取SQL语句
   * @returns SQL语句
   */
  public getSql(): string | undefined {
    return this.sql;
  }
  
  /**
   * 获取查询参数
   * @returns 查询参数
   */
  public getParams(): any[] | undefined {
    return this.params;
  }
}
```

### 5.2 错误处理中间件

```typescript
// src/infrastructure/errors/DatabaseErrorHandler.ts

import { DatabaseError } from './DatabaseError';

export class DatabaseErrorHandler {
  /**
   * 处理数据库错误
   * @param error 原始错误
   * @param sql SQL语句（可选）
   * @param params 查询参数（可选）
   * @returns 处理后的数据库错误
   */
  public static handle(error: any, sql?: string, params?: any[]): DatabaseError {
    let errorCode = 'DATABASE_ERROR';
    let message = 'An unexpected database error occurred';
    
    if (error instanceof DatabaseError) {
      return error;
    }
    
    if (error.message) {
      message = error.message;
      
      // 根据错误信息确定错误代码
      if (error.message.includes('UNIQUE constraint failed')) {
        errorCode = 'UNIQUE_CONSTRAINT_VIOLATION';
      } else if (error.message.includes('FOREIGN KEY constraint failed')) {
        errorCode = 'FOREIGN_KEY_CONSTRAINT_VIOLATION';
      } else if (error.message.includes('NOT NULL constraint failed')) {
        errorCode = 'NOT_NULL_CONSTRAINT_VIOLATION';
      } else if (error.message.includes('no such table')) {
        errorCode = 'TABLE_NOT_FOUND';
      }
    }
    
    return new DatabaseError(message, errorCode, sql, params);
  }
}
```

## 6. 单元测试设计

### 6.1 数据库连接测试

```typescript
// src/infrastructure/persistence/__tests__/SQLiteConnectionImpl.test.ts

import { SQLiteConnectionImpl } from '../SQLiteConnectionImpl';
import { unlinkSync, existsSync } from 'fs';

describe('SQLiteConnectionImpl', () => {
  const testDbPath = './test-db.sqlite';
  let connection: SQLiteConnectionImpl;
  
  beforeEach(async () => {
    // 清理测试数据库文件
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    
    connection = new SQLiteConnectionImpl(testDbPath);
    await connection.initialize();
  });
  
  afterEach(async () => {
    await connection.close();
    // 清理测试数据库文件
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });
  
  it('should initialize database connection correctly', async () => {
    expect(connection).toBeDefined();
  });
  
  it('should execute query correctly', async () => {
    // 创建测试表
    await connection.execute('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    
    // 插入测试数据
    await connection.execute('INSERT INTO test (name) VALUES (?)', ['test']);
    
    // 查询测试数据
    const results = await connection.query('SELECT * FROM test');
    
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('test');
  });
  
  it('should execute transaction correctly', async () => {
    // 创建测试表
    await connection.execute('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    
    // 执行事务
    await connection.transaction(async (tx) => {
      await tx.execute('INSERT INTO test (name) VALUES (?)', ['tx1']);
      await tx.execute('INSERT INTO test (name) VALUES (?)', ['tx2']);
    });
    
    // 查询测试数据
    const results = await connection.query('SELECT * FROM test');
    
    expect(results).toBeDefined();
    expect(results.length).toBe(2);
  });
  
  it('should rollback transaction on error', async () => {
    // 创建测试表
    await connection.execute('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    
    // 执行事务，期望失败
    await expect(connection.transaction(async (tx) => {
      await tx.execute('INSERT INTO test (name) VALUES (?)', ['tx1']);
      // 故意引发错误
      await tx.execute('INSERT INTO non_existent_table (name) VALUES (?)', ['tx2']);
    })).rejects.toThrow();
    
    // 查询测试数据，应该只插入了一条记录
    const results = await connection.query('SELECT * FROM test');
    
    expect(results).toBeDefined();
    expect(results.length).toBe(0); // 事务回滚，没有插入任何记录
  });
});
```

### 6.2 数据库初始化测试

```typescript
// src/infrastructure/persistence/__tests__/DatabaseInitializer.test.ts

import { SQLiteConnectionImpl } from '../SQLiteConnectionImpl';
import { DatabaseInitializer } from '../DatabaseInitializer';
import { unlinkSync, existsSync } from 'fs';

describe('DatabaseInitializer', () => {
  const testDbPath = './test-db-init.sqlite';
  let connection: SQLiteConnectionImpl;
  let initializer: DatabaseInitializer;
  
  beforeEach(async () => {
    // 清理测试数据库文件
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    
    connection = new SQLiteConnectionImpl(testDbPath);
    await connection.initialize();
    initializer = new DatabaseInitializer(connection);
  });
  
  afterEach(async () => {
    await connection.close();
    // 清理测试数据库文件
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });
  
  it('should initialize database schema correctly', async () => {
    await initializer.initialize();
    
    // 检查表是否创建成功
    const tables = await connection.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    expect(tables).toBeDefined();
    expect(tables.length).toBeGreaterThan(0);
    
    // 检查关键表是否存在
    const tableNames = tables.map((table: any) => table.name);
    expect(tableNames).toContain('thought_fragments');
    expect(tableNames).toContain('cognitive_concepts');
    expect(tableNames).toContain('user_cognitive_models');
  });
});
```

## 7. 集成与使用示例

### 7.1 应用启动时初始化数据库

```typescript
// src/application/services/ApplicationService.ts

import { SQLiteConnectionPool } from '../infrastructure/persistence/SQLiteConnectionPool';
import { DatabaseInitializer } from '../infrastructure/persistence/DatabaseInitializer';

export class ApplicationService {
  private readonly connectionPool: SQLiteConnectionPool;
  
  /**
   * 创建应用服务实例
   */
  constructor() {
    this.connectionPool = SQLiteConnectionPool.getInstance();
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
}
```

### 7.2 仓库使用示例

```typescript
// src/application/usecases/IngestThoughtUseCaseImpl.ts

import { IngestThoughtUseCase } from './IngestThoughtUseCase';
import { ThoughtInputDto } from '../dtos/ThoughtInputDto';
import { ThoughtOutputDto } from '../dtos/ThoughtOutputDto';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';
import { ThoughtRepository } from '../interfaces/repository/ThoughtRepository';
import { EventBus } from '../interfaces/event/EventBus';
import { ThoughtRepositoryImpl } from '../../infrastructure/persistence/repositories/ThoughtRepositoryImpl';

export class IngestThoughtUseCaseImpl implements IngestThoughtUseCase {
  private readonly thoughtRepository: ThoughtRepository;
  private readonly eventBus: EventBus;
  
  /**
   * 创建输入思维片段用例实例
   * @param eventBus 事件总线实例
   */
  constructor(eventBus: EventBus) {
    // 使用具体的仓库实现
    this.thoughtRepository = new ThoughtRepositoryImpl();
    this.eventBus = eventBus;
  }
  
  /**
   * 执行输入思维片段用例
   * @param input 思维片段输入数据
   * @returns 思维片段输出结果
   */
  public async execute(input: ThoughtInputDto): Promise<ThoughtOutputDto> {
    // 1. 创建思维片段实体
    const thought: ThoughtFragment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: input.content,
      metadata: input.metadata || {},
      userId: input.userId,
      createdAt: new Date()
    };
    
    // 2. 存储思维片段
    const savedThought = await this.thoughtRepository.save(thought);
    
    // 3. 发布事件
    this.eventBus.publish('ThoughtIngested', {
      thoughtId: savedThought.id,
      content: savedThought.content,
      timestamp: new Date()
    });
    
    // 4. 返回结果
    return {
      id: savedThought.id,
      content: savedThought.content,
      metadata: savedThought.metadata,
      userId: savedThought.userId,
      createdAt: savedThought.createdAt
    };
  }
}
```

## 8. 总结

Day 15的核心任务是实现数据库连接，包括：

1. **数据库连接设计**：定义了SQLite连接接口和实现，支持查询、执行、事务和关闭操作
2. **数据库连接池**：实现了单例模式的数据库连接池，管理数据库连接的创建和释放
3. **数据库表结构设计**：设计了完整的表结构，包括思维片段、认知概念、认知模型等
4. **数据库初始化**：实现了数据库初始化逻辑，自动创建表结构和索引
5. **基础仓库实现**：创建了基础仓库抽象类，提供了通用的数据库操作方法
6. **思维片段仓库**：实现了思维片段的CRUD操作
7. **错误处理机制**：定义了数据库错误类型和错误处理中间件
8. **单元测试**：编写了全面的单元测试，验证数据库连接和初始化功能

通过Day 15的开发，我们成功实现了数据库连接和基础的仓库功能，为后续的Repository实现和系统集成奠定了基础。在后续的开发中，我们将继续实现其他仓库接口，完善Infrastructure层的功能。
