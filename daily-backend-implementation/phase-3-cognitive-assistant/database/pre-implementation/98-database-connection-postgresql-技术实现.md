# 98-数据库连接PostgreSQL代码实现文档

## 1. 数据库连接设计

### 1.1 通用数据库连接接口

```typescript
// src/infrastructure/persistence/interfaces/DatabaseConnection.ts

export interface DatabaseConnection {
  /**
   * 执行查询操作
   * @param sql SQL查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  query(sql: string, params?: any[]): Promise<any[]>;
  
  /**
   * 执行非查询操作（插入、更新、删除）
   * @param sql SQL语句
   * @param params 查询参数
   * @returns 影响的行数
   */
  execute(sql: string, params?: any[]): Promise<number>;
  
  /**
   * 执行事务操作
   * @param callback 事务回调函数
   * @returns 事务执行结果
   */
  transaction<T>(callback: (connection: DatabaseConnection) => Promise<T>): Promise<T>;
  
  /**
   * 关闭数据库连接
   */
  close(): Promise<void>;
}
```

### 1.2 PostgreSQL连接实现

```typescript
// src/infrastructure/persistence/PostgreSQLConnectionImpl.ts

import { Pool, Client } from 'pg';
import { DatabaseConnection } from './interfaces/DatabaseConnection';

export class PostgreSQLConnectionImpl implements DatabaseConnection {
  private readonly pool: Pool;
  private client: Client | null = null;

  /**
   * 创建PostgreSQL连接实例
   * @param config PostgreSQL连接配置
   */
  constructor(config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  /**
   * 初始化数据库连接
   */
  public async initialize(): Promise<void> {
    // 测试连接
    try {
      await this.pool.connect();
      console.log('Connected to PostgreSQL database');
    } catch (error: any) {
      throw new Error(`Failed to connect to PostgreSQL: ${error.message}`);
    }
  }

  /**
   * 执行查询操作
   * @param sql SQL查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  public async query(sql: string, params: any[] = []): Promise<any[]> {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error: any) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }

  /**
   * 执行非查询操作（插入、更新、删除）
   * @param sql SQL语句
   * @param params 查询参数
   * @returns 影响的行数
   */
  public async execute(sql: string, params: any[] = []): Promise<number> {
    try {
      const result = await this.pool.query(sql, params);
      return result.rowCount || 0;
    } catch (error: any) {
      throw new Error(`Execute failed: ${error.message}`);
    }
  }

  /**
   * 执行事务操作
   * @param callback 事务回调函数
   * @returns 事务执行结果
   */
  public async transaction<T>(callback: (connection: DatabaseConnection) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    this.client = client;

    try {
      await client.query('BEGIN');
      const result = await callback(this);
      await client.query('COMMIT');
      return result;
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
      this.client = null;
    }
  }

  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('PostgreSQL database connection closed');
    } catch (error: any) {
      throw new Error(`Failed to close database connection: ${error.message}`);
    }
  }
}
```

### 1.3 数据库连接池

```typescript
// src/infrastructure/persistence/DatabaseConnectionPool.ts

import { DatabaseConnection } from './interfaces/DatabaseConnection';
import { PostgreSQLConnectionImpl } from './PostgreSQLConnectionImpl';

export class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool;
  private connection: DatabaseConnection | null = null;
  private readonly config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  
  /**
   * 创建数据库连接池实例
   * @param config PostgreSQL连接配置
   */
  private constructor(config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }) {
    this.config = config;
  }
  
  /**
   * 获取数据库连接池单例
   * @param config PostgreSQL连接配置
   * @returns 数据库连接池实例
   */
  public static getInstance(config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool(config);
    }
    return DatabaseConnectionPool.instance;
  }
  
  /**
   * 获取数据库连接
   * @returns 数据库连接实例
   */
  public async getConnection(): Promise<DatabaseConnection> {
    if (!this.connection) {
      this.connection = new PostgreSQLConnectionImpl(this.config);
      await this.connection.initialize();
    }
    return this.connection;
  }
  
  /**
   * 关闭数据库连接池
   */
  public async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}
```

## 2. 数据库初始化器

```typescript
// src/infrastructure/persistence/DatabaseInitializer.ts

import { DatabaseConnection } from './interfaces/DatabaseConnection';
import { INITIAL_SCHEMA } from './migrations/001_initial_schema.sql';
import { POSTGRESQL_SCHEMA } from './migrations/002_postgresql_schema.sql';

export class DatabaseInitializer {
  private readonly connection: DatabaseConnection;
  
  /**
   * 创建数据库初始化实例
   * @param connection 数据库连接实例
   */
  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }
  
  /**
   * 初始化数据库
   */
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing database...');
      
      // 执行PostgreSQL特定的schema
      await this.connection.execute(POSTGRESQL_SCHEMA);
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
}
```

## 3. PostgreSQL特定Schema

```typescript
// src/infrastructure/persistence/migrations/002_postgresql_schema.sql

export const POSTGRESQL_SCHEMA = `
-- 思维片段表
CREATE TABLE IF NOT EXISTS thought_fragments (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 认知概念表
CREATE TABLE IF NOT EXISTS cognitive_concepts (
  id TEXT PRIMARY KEY,
  semantic_identity TEXT NOT NULL,
  abstraction_level INTEGER NOT NULL,
  confidence_score REAL NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 认知关系表
CREATE TABLE IF NOT EXISTS cognitive_relations (
  id TEXT PRIMARY KEY,
  source_concept_id TEXT NOT NULL,
  target_concept_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  confidence_score REAL NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_concept_id) REFERENCES cognitive_concepts(id),
  FOREIGN KEY (target_concept_id) REFERENCES cognitive_concepts(id)
);

-- 用户认知模型表
CREATE TABLE IF NOT EXISTS user_cognitive_models (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 模型概念关联表
CREATE TABLE IF NOT EXISTS model_concepts (
  model_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  PRIMARY KEY (model_id, concept_id),
  FOREIGN KEY (model_id) REFERENCES user_cognitive_models(id),
  FOREIGN KEY (concept_id) REFERENCES cognitive_concepts(id)
);

-- 模型关系关联表
CREATE TABLE IF NOT EXISTS model_relations (
  model_id TEXT NOT NULL,
  relation_id TEXT NOT NULL,
  PRIMARY KEY (model_id, relation_id),
  FOREIGN KEY (model_id) REFERENCES user_cognitive_models(id),
  FOREIGN KEY (relation_id) REFERENCES cognitive_relations(id)
);

-- 认知建议表
CREATE TABLE IF NOT EXISTS cognitive_proposals (
  id TEXT PRIMARY KEY,
  thought_id TEXT NOT NULL,
  confidence REAL NOT NULL,
  reasoning_trace TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thought_id) REFERENCES thought_fragments(id)
);

-- 建议概念候选表
CREATE TABLE IF NOT EXISTS proposal_concept_candidates (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  semantic_identity TEXT NOT NULL,
  abstraction_level INTEGER NOT NULL,
  confidence_score REAL NOT NULL,
  description TEXT,
  FOREIGN KEY (proposal_id) REFERENCES cognitive_proposals(id)
);

-- 建议关系候选表
CREATE TABLE IF NOT EXISTS proposal_relation_candidates (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  source_semantic_identity TEXT NOT NULL,
  target_semantic_identity TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  confidence_score REAL NOT NULL,
  FOREIGN KEY (proposal_id) REFERENCES cognitive_proposals(id)
);

-- 认知洞察表
CREATE TABLE IF NOT EXISTS cognitive_insights (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL,
  core_themes TEXT,
  blind_spots TEXT,
  concept_gaps TEXT,
  structure_summary TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES user_cognitive_models(id)
);

-- 演化历史表
CREATE TABLE IF NOT EXISTS evolution_history (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  change_type TEXT NOT NULL,
  concept_id TEXT,
  relation_id TEXT,
  description TEXT,
  FOREIGN KEY (model_id) REFERENCES user_cognitive_models(id),
  FOREIGN KEY (concept_id) REFERENCES cognitive_concepts(id),
  FOREIGN KEY (relation_id) REFERENCES cognitive_relations(id)
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 文件输入表
CREATE TABLE IF NOT EXISTS file_inputs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 语音输入表
CREATE TABLE IF NOT EXISTS speech_inputs (
  id TEXT PRIMARY KEY,
  audio_url TEXT NOT NULL,
  transcription TEXT NOT NULL,
  confidence REAL NOT NULL,
  language TEXT NOT NULL,
  duration INTEGER NOT NULL,
  metadata JSONB,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI任务表
CREATE TABLE IF NOT EXISTS ai_tasks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  input JSONB NOT NULL,
  output JSONB,
  error TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 输入关联表
CREATE TABLE IF NOT EXISTS input_relations (
  id TEXT PRIMARY KEY,
  source_input_id TEXT NOT NULL,
  source_input_type TEXT NOT NULL,
  target_input_id TEXT NOT NULL,
  target_input_type TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 报表模板表
CREATE TABLE IF NOT EXISTS report_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 报表表
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES report_templates(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  result JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 报表计划表
CREATE TABLE IF NOT EXISTS report_schedules (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES report_templates(id),
  schedule_cron TEXT NOT NULL,
  next_run_time TIMESTAMP NOT NULL,
  last_run_time TIMESTAMP,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引创建
CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON thought_fragments(user_id);
CREATE INDEX IF NOT EXISTS idx_thoughts_content ON thought_fragments USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_concepts_semantic ON cognitive_concepts USING gin(to_tsvector('english', semantic_identity));
CREATE INDEX IF NOT EXISTS idx_relations_source_target ON cognitive_relations(source_concept_id, target_concept_id);
CREATE INDEX IF NOT EXISTS idx_models_user_id ON user_cognitive_models(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_thought_id ON cognitive_proposals(thought_id);
CREATE INDEX IF NOT EXISTS idx_insights_model_id ON cognitive_insights(model_id);
CREATE INDEX IF NOT EXISTS idx_history_model_id ON evolution_history(model_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_file_inputs_user_id ON file_inputs(user_id);
CREATE INDEX IF NOT EXISTS idx_file_inputs_created_at ON file_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_speech_inputs_user_id ON speech_inputs(user_id);
CREATE INDEX IF NOT EXISTS idx_speech_inputs_created_at ON speech_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_priority ON ai_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_created_at ON ai_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_input_relations_source ON input_relations(source_input_id, source_input_type);
CREATE INDEX IF NOT EXISTS idx_input_relations_target ON input_relations(target_input_id, target_input_type);
CREATE INDEX IF NOT EXISTS idx_reports_template_id ON reports(template_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_template_id ON report_schedules(template_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run_time);
`;
```

## 4. 基础仓库抽象类

```typescript
// src/infrastructure/persistence/BaseRepositoryImpl.ts

import { DatabaseConnectionPool } from './DatabaseConnectionPool';

export abstract class BaseRepositoryImpl {
  protected readonly connectionPool: DatabaseConnectionPool;
  
  /**
   * 创建基础仓库实例
   */
  constructor() {
    // 从环境变量获取数据库配置
    this.connectionPool = DatabaseConnectionPool.getInstance({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cognitive_assistant',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    });
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
  protected parseJson<T>(json: any): T | null {
    if (!json) {
      return null;
    }
    // PostgreSQL返回的JSONB已经是对象，不需要解析
    return json as T;
  }
  
  /**
   * 将对象转换为JSON字符串
   * @param obj 要转换的对象
   * @returns JSON字符串
   */
  protected stringifyJson(obj: any): any {
    // PostgreSQL直接支持JSONB类型，不需要转换为字符串
    return obj;
  }
}
```

## 5. 应用服务修改

```typescript
// src/application/services/ApplicationService.ts

import { DatabaseConnectionPool } from '../infrastructure/persistence/DatabaseConnectionPool';
import { DatabaseInitializer } from '../infrastructure/persistence/DatabaseInitializer';

export class ApplicationService {
  private readonly connectionPool: DatabaseConnectionPool;
  
  /**
   * 创建应用服务实例
   */
  constructor() {
    // 从环境变量获取数据库配置
    this.connectionPool = DatabaseConnectionPool.getInstance({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cognitive_assistant',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    });
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

## 6. 环境变量配置

```env
# .env

# PostgreSQL数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cognitive_assistant
DB_USER=postgres
DB_PASSWORD=password

# 其他配置...
```

## 7. 单元测试设计

```typescript
// src/infrastructure/persistence/__tests__/PostgreSQLConnectionImpl.test.ts

import { PostgreSQLConnectionImpl } from '../PostgreSQLConnectionImpl';

describe('PostgreSQLConnectionImpl', () => {
  let connection: PostgreSQLConnectionImpl;
  
  beforeEach(() => {
    // 使用测试数据库配置
    connection = new PostgreSQLConnectionImpl({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'test_cognitive_assistant',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    });
  });
  
  afterEach(async () => {
    await connection.close();
  });
  
  it('should initialize database connection correctly', async () => {
    await connection.initialize();
    expect(connection).toBeDefined();
  });
  
  it('should execute query correctly', async () => {
    await connection.initialize();
    
    // 创建测试表
    await connection.execute('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
    
    // 插入测试数据
    await connection.execute('INSERT INTO test (name) VALUES ($1)', ['test']);
    
    // 查询测试数据
    const results = await connection.query('SELECT * FROM test');
    
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('test');
    
    // 清理测试表
    await connection.execute('DROP TABLE test');
  });
  
  it('should execute transaction correctly', async () => {
    await connection.initialize();
    
    // 创建测试表
    await connection.execute('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
    
    // 执行事务
    await connection.transaction(async (tx) => {
      await tx.execute('INSERT INTO test (name) VALUES ($1)', ['tx1']);
      await tx.execute('INSERT INTO test (name) VALUES ($1)', ['tx2']);
    });
    
    // 查询测试数据
    const results = await connection.query('SELECT * FROM test');
    
    expect(results).toBeDefined();
    expect(results.length).toBe(2);
    
    // 清理测试表
    await connection.execute('DROP TABLE test');
  });
  
  it('should rollback transaction on error', async () => {
    await connection.initialize();
    
    // 创建测试表
    await connection.execute('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
    
    // 执行事务，期望失败
    await expect(connection.transaction(async (tx) => {
      await tx.execute('INSERT INTO test (name) VALUES ($1)', ['tx1']);
      // 故意引发错误
      await tx.execute('INSERT INTO non_existent_table (name) VALUES ($1)', ['tx2']);
    })).rejects.toThrow();
    
    // 查询测试数据，应该没有插入任何记录
    const results = await connection.query('SELECT * FROM test');
    
    expect(results).toBeDefined();
    expect(results.length).toBe(0);
    
    // 清理测试表
    await connection.execute('DROP TABLE test');
  });
});
```

## 8. 总结

本次修改将数据库连接从SQLite迁移到了PostgreSQL，主要包含以下内容：

1. 创建了通用的`DatabaseConnection`接口，替换了原有的`SQLiteConnection`接口
2. 实现了`PostgreSQLConnectionImpl`类，支持PostgreSQL数据库连接
3. 创建了`DatabaseConnectionPool`连接池，替换了原有的`SQLiteConnectionPool`
4. 更新了数据库初始化器，支持PostgreSQL特定的Schema
5. 修改了基础仓库抽象类，使用新的连接池和JSONB支持
6. 更新了应用服务，使用新的连接池
7. 添加了环境变量配置
8. 编写了PostgreSQL连接的单元测试

这些修改确保了系统能够使用PostgreSQL作为数据库，提高了系统的可扩展性和可维护性，支持后续数据报表增加的需求。