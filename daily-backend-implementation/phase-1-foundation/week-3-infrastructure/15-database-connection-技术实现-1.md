# Day 15: 数据库连接 - 代码实现文档（第一部分）

## 1. 当日主题概述

### 1.1 核心开发目标
- 实现SQLite数据库连接
- 设计数据库表结构
- 实现数据库初始化逻辑
- 管理数据库连接池
- 实现数据库操作接口

### 1.2 技术要点
- SQLite数据库
- 数据库连接池
- 表结构设计
- 数据库初始化
- 错误处理

## 2. 数据库连接设计

### 2.1 数据库连接接口

```typescript
// src/infrastructure/persistence/interfaces/SQLiteConnection.ts

export interface SQLiteConnection {
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
  transaction<T>(callback: (connection: SQLiteConnection) => Promise<T>): Promise<T>;
  
  /**
   * 关闭数据库连接
   */
  close(): Promise<void>;
}
```

### 2.2 数据库连接实现

```typescript
// src/infrastructure/persistence/SQLiteConnectionImpl.ts

import sqlite3 from 'sqlite3';
import { Database, verbose } from 'sqlite3';
import { SQLiteConnection } from './interfaces/SQLiteConnection';

// 使用verbose模式获取详细日志
const sqlite3Verbose = verbose();

export class SQLiteConnectionImpl implements SQLiteConnection {
  private db: Database | null = null;
  private readonly dbPath: string;
  
  /**
   * 创建SQLite连接实例
   * @param dbPath 数据库文件路径
   */
  constructor(dbPath: string = './database.sqlite') {
    this.dbPath = dbPath;
  }
  
  /**
   * 初始化数据库连接
   */
  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3Verbose.Database(this.dbPath, (err) => {
        if (err) {
          reject(new Error(`Failed to connect to database: ${err.message}`));
        } else {
          console.log(`Connected to SQLite database at ${this.dbPath}`);
          resolve();
        }
      });
    });
  }
  
  /**
   * 执行查询操作
   * @param sql SQL查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  public async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }
    
    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) {
          reject(new Error(`Query failed: ${err.message}`));
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  /**
   * 执行非查询操作（插入、更新、删除）
   * @param sql SQL语句
   * @param params 查询参数
   * @returns 影响的行数
   */
  public async execute(sql: string, params: any[] = []): Promise<number> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }
    
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) {
          reject(new Error(`Execute failed: ${err.message}`));
        } else {
          resolve(this.changes);
        }
      });
    });
  }
  
  /**
   * 执行事务操作
   * @param callback 事务回调函数
   * @returns 事务执行结果
   */
  public async transaction<T>(callback: (connection: SQLiteConnection) => Promise<T>): Promise<T> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }
    
    try {
      // 开始事务
      await this.execute('BEGIN TRANSACTION');
      
      // 执行回调函数
      const result = await callback(this);
      
      // 提交事务
      await this.execute('COMMIT');
      
      return result;
    } catch (error) {
      // 回滚事务
      await this.execute('ROLLBACK');
      throw error;
    }
  }
  
  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    if (!this.db) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) {
          reject(new Error(`Failed to close database connection: ${err.message}`));
        } else {
          console.log('Database connection closed');
          this.db = null;
          resolve();
        }
      });
    });
  }
}
```

### 2.3 数据库连接池

```typescript
// src/infrastructure/persistence/SQLiteConnectionPool.ts

import { SQLiteConnection } from './interfaces/SQLiteConnection';
import { SQLiteConnectionImpl } from './SQLiteConnectionImpl';

export class SQLiteConnectionPool {
  private static instance: SQLiteConnectionPool;
  private connection: SQLiteConnection | null = null;
  private readonly dbPath: string;
  
  /**
   * 创建数据库连接池实例
   * @param dbPath 数据库文件路径
   */
  private constructor(dbPath: string = './database.sqlite') {
    this.dbPath = dbPath;
  }
  
  /**
   * 获取数据库连接池单例
   * @param dbPath 数据库文件路径
   * @returns 数据库连接池实例
   */
  public static getInstance(dbPath?: string): SQLiteConnectionPool {
    if (!SQLiteConnectionPool.instance) {
      SQLiteConnectionPool.instance = new SQLiteConnectionPool(dbPath);
    }
    return SQLiteConnectionPool.instance;
  }
  
  /**
   * 获取数据库连接
   * @returns 数据库连接实例
   */
  public async getConnection(): Promise<SQLiteConnection> {
    if (!this.connection) {
      this.connection = new SQLiteConnectionImpl(this.dbPath);
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

## 3. 数据库表结构设计

### 3.1 表结构定义

```typescript
// src/infrastructure/persistence/migrations/001_initial_schema.sql

export const INITIAL_SCHEMA = `
-- 思维片段表
CREATE TABLE IF NOT EXISTS thought_fragments (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  metadata TEXT,
  user_id TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 认知概念表
CREATE TABLE IF NOT EXISTS cognitive_concepts (
  id TEXT PRIMARY KEY,
  semantic_identity TEXT NOT NULL,
  abstraction_level INTEGER NOT NULL,
  confidence_score REAL NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 认知关系表
CREATE TABLE IF NOT EXISTS cognitive_relations (
  id TEXT PRIMARY KEY,
  source_concept_id TEXT NOT NULL,
  target_concept_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  confidence_score REAL NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_concept_id) REFERENCES cognitive_concepts(id),
  FOREIGN KEY (target_concept_id) REFERENCES cognitive_concepts(id)
);

-- 用户认知模型表
CREATE TABLE IF NOT EXISTS user_cognitive_models (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES user_cognitive_models(id)
);

-- 演化历史表
CREATE TABLE IF NOT EXISTS evolution_history (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  change_type TEXT NOT NULL,
  concept_id TEXT,
  relation_id TEXT,
  description TEXT,
  FOREIGN KEY (model_id) REFERENCES user_cognitive_models(id),
  FOREIGN KEY (concept_id) REFERENCES cognitive_concepts(id),
  FOREIGN KEY (relation_id) REFERENCES cognitive_relations(id)
);

-- 索引创建
CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON thought_fragments(user_id);
CREATE INDEX IF NOT EXISTS idx_concepts_semantic ON cognitive_concepts(semantic_identity);
CREATE INDEX IF NOT EXISTS idx_models_user_id ON user_cognitive_models(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_thought_id ON cognitive_proposals(thought_id);
CREATE INDEX IF NOT EXISTS idx_insights_model_id ON cognitive_insights(model_id);
CREATE INDEX IF NOT EXISTS idx_history_model_id ON evolution_history(model_id);
`;
```

### 3.2 数据库初始化

```typescript
// src/infrastructure/persistence/DatabaseInitializer.ts

import { SQLiteConnection } from './interfaces/SQLiteConnection';
import { INITIAL_SCHEMA } from './migrations/001_initial_schema.sql';

export class DatabaseInitializer {
  private readonly connection: SQLiteConnection;
  
  /**
   * 创建数据库初始化实例
   * @param connection 数据库连接实例
   */
  constructor(connection: SQLiteConnection) {
    this.connection = connection;
  }
  
  /**
   * 初始化数据库
   */
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing database...');
      
      // 执行初始 schema
      await this.connection.execute(INITIAL_SCHEMA);
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
}
```
