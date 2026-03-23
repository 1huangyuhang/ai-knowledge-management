# 基础设施层设计文档

索引标签：#分层设计 #基础设施 #数据库 #外部服务 #苹果集成

## 相关文档

- [领域层设计](domain-layer-design.md)：详细描述领域层的设计
- [应用层设计](application-layer-design.md)：详细描述应用层的设计
- [表示层设计](presentation-layer-design.md)：详细描述表示层的设计
- [Redis开发指南](redis-development-guide.md)：详细描述Redis的开发指南
- [仓库接口定义](repository-interface-definition.md)：详细描述仓库接口的定义
- [苹果后端集成架构设计](../architecture-design/apple-backend-integration.md)：苹果后端集成架构设计
- [苹果认证设计](../core-features/apple-authentication.md)：Sign in with Apple设计
- [苹果推送通知设计](../core-features/apple-push-notification.md)：APNs集成设计
- [架构对齐](../architecture-design/architecture-alignment.md)：描述基础设施层在系统架构中的位置和作用

## 1. 文档概述

本文档详细描述了认知辅助系统基础设施层的设计和实现，包括数据库、文件系统、消息队列、外部服务集成等核心组件。基础设施层是系统的底层，负责处理与外部系统的交互，实现领域层和应用层定义的接口，确保系统的可扩展性和可维护性。

## 2. 设计原则

### 2.1 核心原则

- **依赖倒置**：基础设施层实现领域层和应用层定义的接口，而不依赖于它们
- **可替换性**：基础设施组件可以轻松替换，不会影响上层业务逻辑
- **可配置性**：通过配置管理基础设施组件，便于不同环境部署
- **可测试性**：基础设施组件可以独立测试，支持Mock和Stub
- **性能优化**：针对不同的基础设施组件进行性能优化

### 2.2 设计目标

1. **灵活性**：便于更换不同的基础设施组件
2. **可靠性**：确保基础设施组件的高可用性和容错性
3. **可扩展性**：支持系统规模的扩展
4. **安全性**：保护基础设施组件的安全
5. **可监控性**：提供基础设施组件的监控和日志

## 3. 核心组件设计

### 3.1 数据库组件

#### 3.1.1 数据库选型

| 数据库类型 | 选型 | 用途 |
|------------|------|------|
| 关系型数据库 | PostgreSQL | 存储用户、认知模型、概念、关系等结构化数据 |
| 向量数据库 | Qdrant | 存储和搜索向量数据，用于相似性匹配 |
| 缓存数据库 | Redis | 缓存热点数据，提高系统性能 |
| 分析数据库 | ClickHouse | 存储和分析日志数据，用于监控和报表 |
| 本地开发数据库 | SQLite | 用于本地开发和测试 |

#### 3.1.2 数据库连接设计

**连接池配置**：

```typescript
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  poolSize: number;
  maxWaitTime: number;
  ssl: boolean;
}
```

**数据库连接管理**：

```typescript
export class DatabaseConnectionManager {
  private static connections: Map<string, DatabaseConnection> = new Map();
  
  static async getConnection(config: DatabaseConfig): Promise<DatabaseConnection> {
    const key = `${config.host}:${config.port}/${config.database}`;
    
    if (this.connections.has(key)) {
      return this.connections.get(key)!;
    }
    
    const connection = await this.createConnection(config);
    this.connections.set(key, connection);
    
    return connection;
  }
  
  private static async createConnection(config: DatabaseConfig): Promise<DatabaseConnection> {
    // 实现数据库连接创建逻辑
  }
  
  static async closeConnection(key: string): Promise<void> {
    const connection = this.connections.get(key);
    if (connection) {
      await connection.close();
      this.connections.delete(key);
    }
  }
}
```

#### 3.1.3 仓库实现

**PostgreSQL仓库实现示例**：

```typescript
import { UserCognitiveModelRepository } from '../../../domain/repositories/UserCognitiveModelRepository';
import { UserCognitiveModel } from '../../../domain/entities/UserCognitiveModel';
import { DatabaseConnection } from '../database/DatabaseConnection';

export class PostgreSQLUserCognitiveModelRepository implements UserCognitiveModelRepository {
  constructor(private readonly connection: DatabaseConnection) {}
  
  async findById(id: string): Promise<UserCognitiveModel | null> {
    const query = `
      SELECT id, user_id as userId, name, version, created_at as createdAt, updated_at as updatedAt
      FROM user_cognitive_models
      WHERE id = $1
    `;
    
    const result = await this.connection.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return new UserCognitiveModel(
      row.id,
      row.userId,
      row.name,
      row.version,
      new Date(row.createdAt),
      new Date(row.updatedAt)
    );
  }
  
  async findByUserId(userId: string): Promise<UserCognitiveModel[]> {
    const query = `
      SELECT id, user_id as userId, name, version, created_at as createdAt, updated_at as updatedAt
      FROM user_cognitive_models
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `;
    
    const result = await this.connection.query(query, [userId]);
    return result.rows.map(row => new UserCognitiveModel(
      row.id,
      row.userId,
      row.name,
      row.version,
      new Date(row.createdAt),
      new Date(row.updatedAt)
    ));
  }
  
  // 其他方法实现...
}
```

#### 3.1.4 苹果后端数据库设计

**设备令牌表**：

| 字段名 | 类型 | 描述 |
|--------|------|------|
| `id` | `UUID` | 主键 |
| `user_id` | `UUID` | 用户ID（外键） |
| `device_token` | `VARCHAR(255)` | 设备令牌 |
| `device_type` | `VARCHAR(50)` | 设备类型（iOS/Android） |
| `device_model` | `VARCHAR(100)` | 设备型号 |
| `os_version` | `VARCHAR(50)` | 操作系统版本 |
| `is_active` | `BOOLEAN` | 是否活跃 |
| `created_at` | `TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | 更新时间 |

**苹果认证表**：

| 字段名 | 类型 | 描述 |
|--------|------|------|
| `id` | `UUID` | 主键 |
| `user_id` | `UUID` | 用户ID（外键） |
| `apple_user_id` | `VARCHAR(255)` | 苹果用户ID |
| `email` | `VARCHAR(255)` | 用户邮箱 |
| `full_name` | `JSONB` | 用户全名（JSON格式） |
| `identity_token` | `TEXT` | 身份令牌 |
| `refresh_token` | `TEXT` | 刷新令牌 |
| `expires_at` | `TIMESTAMP` | 令牌过期时间 |
| `created_at` | `TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | 更新时间 |

### 3.2 文件系统组件

#### 3.2.1 文件存储设计

| 存储类型 | 选型 | 用途 |
|----------|------|------|
| 本地文件系统 | Local File System | 用于本地开发和测试 |
| 对象存储 | AWS S3 / MinIO | 用于生产环境的文件存储 |

#### 3.2.2 文件服务接口

```typescript
export interface FileStorageService {
  storeFile(file: Buffer, filename: string, mimeType: string): Promise<string>;
  getFile(filePath: string): Promise<Buffer>;
  deleteFile(filePath: string): Promise<void>;
  getFileMetadata(filePath: string): Promise<FileMetadata>;
  listFiles(directory: string): Promise<string[]>;
}

export interface FileMetadata {
  filename: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3.2.3 文件服务实现

**Local File Storage Service示例**：

```typescript
import { FileStorageService, FileMetadata } from './FileStorageService';
import * as fs from 'fs';
import * as path from 'path';

export class LocalFileStorageService implements FileStorageService {
  constructor(private readonly basePath: string) {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }
  
  async storeFile(file: Buffer, filename: string, mimeType: string): Promise<string> {
    const filePath = path.join(this.basePath, filename);
    await fs.promises.writeFile(filePath, file);
    return filePath;
  }
  
  async getFile(filePath: string): Promise<Buffer> {
    return fs.promises.readFile(filePath);
  }
  
  async deleteFile(filePath: string): Promise<void> {
    await fs.promises.unlink(filePath);
  }
  
  async getFileMetadata(filePath: string): Promise<FileMetadata> {
    const stats = await fs.promises.stat(filePath);
    return {
      filename: path.basename(filePath),
      size: stats.size,
      mimeType: this.getMimeType(filePath),
      createdAt: stats.birthtime,
      updatedAt: stats.mtime
    };
  }
  
  async listFiles(directory: string): Promise<string[]> {
    const dirPath = path.join(this.basePath, directory);
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    
    const files = await fs.promises.readdir(dirPath);
    return files.map(file => path.join(dirPath, file));
  }
  
  private getMimeType(filePath: string): string {
    // 简单的MIME类型检测
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
```

### 3.3 消息队列组件

#### 3.3.1 消息队列选型

| 消息队列 | 选型 | 用途 |
|----------|------|------|
| 任务队列 | Bull | 处理异步任务，如文件处理、音频转文字等 |
| 事件总线 | Redis Pub/Sub | 实现事件驱动架构，用于系统内部通信 |

#### 3.3.2 任务队列设计

**任务定义**：

```typescript
export interface Task {
  id: string;
  type: string;
  data: any;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
```

**任务队列实现**：

```typescript
export class TaskQueue {
  private queue: Bull.Queue;
  
  constructor(name: string, options: Bull.QueueOptions) {
    this.queue = new Bull(name, options);
  }
  
  async addTask(task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const job = await this.queue.add(task.type, task.data, {
      priority: this.getPriorityValue(task.priority),
      jobId: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    return job.id;
  }
  
  async getTask(id: string): Promise<Task | null> {
    const job = await this.queue.getJob(id);
    if (!job) {
      return null;
    }
    
    const jobState = await job.getState();
    return {
      id: job.id!,
      type: job.name,
      data: job.data,
      priority: this.getPriorityFromValue(job.opts.priority || 0),
      status: this.getTaskStatus(jobState),
      createdAt: job.timestamp,
      updatedAt: job.updatedAt || job.timestamp,
      completedAt: job.finishedOn || undefined,
      failedAt: job.failedOn || undefined,
      error: job.failedReason || undefined
    };
  }
  
  // 其他方法实现...
  
  private getPriorityValue(priority: TaskPriority): number {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      default: return 2;
    }
  }
  
  private getPriorityFromValue(value: number): TaskPriority {
    switch (value) {
      case 1: return 'high';
      case 2: return 'medium';
      case 3: return 'low';
      default: return 'medium';
    }
  }
  
  private getTaskStatus(jobState: Bull.JobStatus): TaskStatus {
    switch (jobState) {
      case 'waiting': return 'pending';
      case 'active': return 'processing';
      case 'completed': return 'completed';
      case 'failed': return 'failed';
      case 'delayed': return 'pending';
      case 'paused': return 'pending';
      case 'stalled': return 'failed';
      default: return 'pending';
    }
  }
}
```

### 3.4 缓存组件

#### 3.4.1 缓存设计

**缓存接口**：

```typescript
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  getKeys(pattern: string): Promise<string[]>;
}
```

**Redis缓存实现**：

```typescript
export class RedisCacheService implements CacheService {
  constructor(private readonly client: Redis.RedisClientType) {}
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as T;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, stringValue, { EX: ttl });
    } else {
      await this.client.set(key, stringValue);
    }
  }
  
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
  
  async clear(): Promise<void> {
    await this.client.flushdb();
  }
  
  async getKeys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }
}
```

### 3.5 日志组件

#### 3.5.1 日志设计

**日志级别**：

```typescript
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}
```

**日志接口**：

```typescript
export interface Logger {
  trace(message: string, metadata?: any): void;
  debug(message: string, metadata?: any): void;
  info(message: string, metadata?: any): void;
  warn(message: string, metadata?: any): void;
  error(message: string, metadata?: any): void;
  fatal(message: string, metadata?: any): void;
  child(metadata: any): Logger;
}
```

**Pino日志实现**：

```typescript
export class PinoLogger implements Logger {
  private logger: pino.Logger;
  
  constructor(options: pino.LoggerOptions) {
    this.logger = pino(options);
  }
  
  trace(message: string, metadata?: any): void {
    this.logger.trace(metadata, message);
  }
  
  debug(message: string, metadata?: any): void {
    this.logger.debug(metadata, message);
  }
  
  info(message: string, metadata?: any): void {
    this.logger.info(metadata, message);
  }
  
  warn(message: string, metadata?: any): void {
    this.logger.warn(metadata, message);
  }
  
  error(message: string, metadata?: any): void {
    this.logger.error(metadata, message);
  }
  
  fatal(message: string, metadata?: any): void {
    this.logger.fatal(metadata, message);
  }
  
  child(metadata: any): Logger {
    return new PinoLogger(this.logger.child(metadata));
  }
}
```

### 3.6 配置组件

#### 3.6.1 配置管理设计

**配置接口**：

```typescript
export interface ConfigService {
  get<T>(key: string, defaultValue?: T): T;
  has(key: string): boolean;
  getConfig(): Record<string, any>;
}
```

**配置实现**：

```typescript
export class EnvironmentConfigService implements ConfigService {
  private config: Record<string, any>;
  
  constructor() {
    this.config = {
      // 从环境变量加载配置
      PORT: parseInt(process.env.PORT || '3000'),
      NODE_ENV: process.env.NODE_ENV || 'development',
      
      // 数据库配置
      DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
      DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '5432'),
      DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'postgres',
      DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'password',
      DATABASE_NAME: process.env.DATABASE_NAME || 'cognitive_assistant',
      
      // Redis配置
      REDIS_HOST: process.env.REDIS_HOST || 'localhost',
      REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
      REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
      
      // Qdrant配置
      QDRANT_HOST: process.env.QDRANT_HOST || 'localhost',
      QDRANT_PORT: parseInt(process.env.QDRANT_PORT || '6333'),
      
      // JWT配置
      JWT_SECRET: process.env.JWT_SECRET || 'secret',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
      
      // 日志配置
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      
      // 文件存储配置
      FILE_STORAGE_TYPE: process.env.FILE_STORAGE_TYPE || 'local',
      FILE_STORAGE_PATH: process.env.FILE_STORAGE_PATH || './uploads',
      
      // S3配置
      S3_ENDPOINT: process.env.S3_ENDPOINT || '',
      S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '',
      S3_SECRET_KEY: process.env.S3_SECRET_KEY || '',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || '',
      S3_REGION: process.env.S3_REGION || 'us-east-1',
      
      // 苹果认证配置
      APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID || '',
      APPLE_TEAM_ID: process.env.APPLE_TEAM_ID || '',
      APPLE_KEY_ID: process.env.APPLE_KEY_ID || '',
      APPLE_PRIVATE_KEY: process.env.APPLE_PRIVATE_KEY || '',
      APPLE_REDIRECT_URI: process.env.APPLE_REDIRECT_URI || '',
      
      // APNs配置
      APNs_KEY_ID: process.env.APNs_KEY_ID || '',
      APNs_TEAM_ID: process.env.APNs_TEAM_ID || '',
      APNs_PRIVATE_KEY: process.env.APNs_PRIVATE_KEY || '',
      APNs_BUNDLE_ID: process.env.APNs_BUNDLE_ID || '',
      APNs_ENV: process.env.APNs_ENV || 'development'
    };
  }
  
  get<T>(key: string, defaultValue?: T): T {
    if (this.has(key)) {
      return this.config[key] as T;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Config key '${key}' not found`);
  }
  
  has(key: string): boolean {
    return key in this.config;
  }
  
  getConfig(): Record<string, any> {
    return { ...this.config };
  }
}
```

## 4. 外部服务集成

### 4.1 AI服务集成

#### 4.1.1 LLM服务集成

**LLM服务接口**：

```typescript
export interface LLMService {
  generateCompletion(prompt: string, options?: LLMOptions): Promise<string>;
  generateChatCompletion(messages: ChatMessage[], options?: LLMOptions): Promise<string>;
  generateStructuredOutput<T>(prompt: string, schema: any, options?: LLMOptions): Promise<T>;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

**OpenAI LLM服务实现**：

```typescript
export class OpenAILLMService implements LLMService {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }
  
  async generateCompletion(prompt: string, options?: LLMOptions): Promise<string> {
    const response = await this.openai.completions.create({
      model: options?.model || 'gpt-3.5-turbo-instruct',
      prompt,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 1000,
      top_p: options?.topP || 1,
      frequency_penalty: options?.frequencyPenalty || 0,
      presence_penalty: options?.presencePenalty || 0
    });
    
    return response.choices[0].text || '';
  }
  
  async generateChatCompletion(messages: ChatMessage[], options?: LLMOptions): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: options?.model || 'gpt-3.5-turbo',
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 1000,
      top_p: options?.topP || 1,
      frequency_penalty: options?.frequencyPenalty || 0,
      presence_penalty: options?.presencePenalty || 0
    });
    
    return response.choices[0].message.content || '';
  }
  
  async generateStructuredOutput<T>(prompt: string, schema: any, options?: LLMOptions): Promise<T> {
    const response = await this.openai.chat.completions.create({
      model: options?.model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `You are a structured output generator. Please output JSON that matches the following schema: ${JSON.stringify(schema)}` },
        { role: 'user', content: prompt }
      ],
      temperature: options?.temperature || 0.3,
      max_tokens: options?.maxTokens || 1000,
      response_format: { type: 'json_object' }
    });
    
    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content) as T;
  }
}
```

### 4.2 嵌入服务集成

**嵌入服务接口**：

```typescript
export interface EmbeddingService {
  generateEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]>;
  generateBatchEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<number[][]>;
}

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}
```

**OpenAI嵌入服务实现**：

```typescript
export class OpenAIEmbeddingService implements EmbeddingService {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }
  
  async generateEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: options?.model || 'text-embedding-ada-002',
      input: text,
      dimensions: options?.dimensions
    });
    
    return response.data[0].embedding;
  }
  
  async generateBatchEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: options?.model || 'text-embedding-ada-002',
      input: texts,
      dimensions: options?.dimensions
    });
    
    return response.data.map(item => item.embedding);
  }
}
```

### 4.3 外部API集成

**HTTP客户端设计**：

```typescript
export interface HttpClient {
  get<T>(url: string, options?: HttpRequestOptions): Promise<T>;
  post<T>(url: string, data: any, options?: HttpRequestOptions): Promise<T>;
  put<T>(url: string, data: any, options?: HttpRequestOptions): Promise<T>;
  delete<T>(url: string, options?: HttpRequestOptions): Promise<T>;
}

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retry?: number;
}
```

**Axios HTTP客户端实现**：

```typescript
export class AxiosHttpClient implements HttpClient {
  private axios: AxiosInstance;
  
  constructor(options?: AxiosInstanceConfig) {
    this.axios = axios.create(options);
  }
  
  async get<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    const response = await this.axios.get<T>(url, this.getAxiosOptions(options));
    return response.data;
  }
  
  async post<T>(url: string, data: any, options?: HttpRequestOptions): Promise<T> {
    const response = await this.axios.post<T>(url, data, this.getAxiosOptions(options));
    return response.data;
  }
  
  async put<T>(url: string, data: any, options?: HttpRequestOptions): Promise<T> {
    const response = await this.axios.put<T>(url, data, this.getAxiosOptions(options));
    return response.data;
  }
  
  async delete<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    const response = await this.axios.delete<T>(url, this.getAxiosOptions(options));
    return response.data;
  }
  
  private getAxiosOptions(options?: HttpRequestOptions): AxiosRequestConfig {
    return {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
      retry: options?.retry
    };
  }
}
```

### 4.4 苹果认证服务集成

**苹果认证服务接口**：

```typescript
export interface AppleAuthService {
  generateAuthURL(state: string): Promise<string>;
  exchangeCodeForToken(code: string): Promise<AppleTokenResponse>;
  verifyIDToken(idToken: string): Promise<AppleIDTokenPayload>;
  generateClientSecret(): string;
  refreshAccessToken(refreshToken: string): Promise<AppleTokenResponse>;
}

export interface AppleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  id_token: string;
}

export interface AppleIDTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email?: string;
  email_verified?: string;
  is_private_email?: string;
  auth_time?: number;
  nonce?: string;
}
```

**苹果认证服务实现**：

```typescript
export class AppleAuthServiceImpl implements AppleAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpClient: HttpClient
  ) {}
  
  async generateAuthURL(state: string): Promise<string> {
    const clientId = this.configService.get('APPLE_CLIENT_ID');
    const redirectUri = this.configService.get('APPLE_REDIRECT_URI');
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      scope: 'email name',
      response_mode: 'form_post'
    });
    
    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }
  
  async exchangeCodeForToken(code: string): Promise<AppleTokenResponse> {
    const url = 'https://appleid.apple.com/auth/token';
    const clientId = this.configService.get('APPLE_CLIENT_ID');
    const clientSecret = this.generateClientSecret();
    
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: this.configService.get('APPLE_REDIRECT_URI')
    });
    
    return this.httpClient.post<AppleTokenResponse>(url, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }
  
  async verifyIDToken(idToken: string): Promise<AppleIDTokenPayload> {
    // 使用jwt.verify验证ID token，省略具体实现
    // 实际实现会使用Apple的公钥验证签名
  }
  
  generateClientSecret(): string {
    const teamId = this.configService.get('APPLE_TEAM_ID');
    const clientId = this.configService.get('APPLE_CLIENT_ID');
    const keyId = this.configService.get('APPLE_KEY_ID');
    const privateKey = this.configService.get('APPLE_PRIVATE_KEY');
    
    const now = Math.floor(Date.now() / 1000);
    const expires = now + 3600 * 24 * 180; // 6个月
    
    const payload = {
      iss: teamId,
      iat: now,
      exp: expires,
      aud: 'https://appleid.apple.com',
      sub: clientId
    };
    
    // 使用jsonwebtoken库生成JWT，省略具体实现
    // 实际实现会使用RS256算法和苹果私钥签名
  }
  
  async refreshAccessToken(refreshToken: string): Promise<AppleTokenResponse> {
    const url = 'https://appleid.apple.com/auth/token';
    const clientId = this.configService.get('APPLE_CLIENT_ID');
    const clientSecret = this.generateClientSecret();
    
    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    });
    
    return this.httpClient.post<AppleTokenResponse>(url, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }
}
```

### 4.5 APNs服务集成

**APNs服务接口**：

```typescript
export interface APNsService {
  sendNotification(
    deviceToken: string,
    payload: APNsPayload,
    options?: APNsOptions
  ): Promise<APNsResponse>;
  sendBatchNotifications(
    notifications: Array<{
      deviceToken: string;
      payload: APNsPayload;
      options?: APNsOptions;
    }>
  ): Promise<APNsBatchResponse>;
  verifyDeviceToken(deviceToken: string): Promise<boolean>;
}

export interface APNsPayload {
  aps: {
    alert?: string | APNsAlert;
    badge?: number;
    sound?: string;
    contentAvailable?: boolean;
    mutableContent?: boolean;
    category?: string;
    threadId?: string;
  };
  [key: string]: any;
}

export interface APNsAlert {
  title?: string;
  subtitle?: string;
  body?: string;
  titleLocKey?: string;
  titleLocArgs?: string[];
  subtitleLocKey?: string;
  subtitleLocArgs?: string[];
  locKey?: string;
  locArgs?: string[];
  actionLocKey?: string;
  launchImage?: string;
}

export interface APNsOptions {
  expiration?: number;
  priority?: 5 | 10;
  collapseId?: string;
  topic?: string;
  pushType?: 'alert' | 'background' | 'voip' | 'complication' | 'fileprovider' | 'mdm';
}

export interface APNsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface APNsBatchResponse {
  successCount: number;
  failureCount: number;
  results: Array<{
    deviceToken: string;
    response: APNsResponse;
  }>;
}
```

**APNs服务实现**：

```typescript
export class APNsServiceImpl implements APNsService {
  private apnProvider: any;
  
  constructor(private readonly configService: ConfigService) {
    const env = this.configService.get('APNs_ENV') as 'development' | 'production';
    const keyId = this.configService.get('APNs_KEY_ID');
    const teamId = this.configService.get('APNs_TEAM_ID');
    const privateKey = this.configService.get('APNs_PRIVATE_KEY');
    const bundleId = this.configService.get('APNs_BUNDLE_ID');
    
    // 使用node-apn库创建APNs提供者，省略具体实现
    // 实际实现会根据环境配置开发或生产服务器
  }
  
  async sendNotification(
    deviceToken: string,
    payload: APNsPayload,
    options?: APNsOptions
  ): Promise<APNsResponse> {
    try {
      // 使用apnProvider发送通知，省略具体实现
      return {
        success: true,
        messageId: 'unique-message-id'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async sendBatchNotifications(
    notifications: Array<{
      deviceToken: string;
      payload: APNsPayload;
      options?: APNsOptions;
    }>
  ): Promise<APNsBatchResponse> {
    const results: Array<{
      deviceToken: string;
      response: APNsResponse;
    }> = [];
    
    for (const notification of notifications) {
      const response = await this.sendNotification(
        notification.deviceToken,
        notification.payload,
        notification.options
      );
      results.push({
        deviceToken: notification.deviceToken,
        response
      });
    }
    
    return {
      successCount: results.filter(r => r.response.success).length,
      failureCount: results.filter(r => !r.response.success).length,
      results
    };
  }
  
  async verifyDeviceToken(deviceToken: string): Promise<boolean> {
    // 简单验证设备令牌格式，实际实现可能更复杂
    return /^[0-9a-f]{64}$/i.test(deviceToken);
  }
}

## 5. 依赖管理

### 5.1 依赖注入配置

**使用tsyringe进行依赖注入**：

```typescript
import { container } from 'tsyringe';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { PostgreSQLUserRepository } from '../database/repositories/PostgreSQLUserRepository';
import { DatabaseConnectionManager } from '../database/DatabaseConnectionManager';
import { DatabaseConfig } from '../database/DatabaseConfig';
import { ConfigService } from '../config/ConfigService';
import { EnvironmentConfigService } from '../config/EnvironmentConfigService';
import { FileStorageService } from '../file/FileStorageService';
import { LocalFileStorageService } from '../file/LocalFileStorageService';
import { Logger } from '../logging/Logger';
import { PinoLogger } from '../logging/PinoLogger';
import { CacheService } from '../cache/CacheService';
import { RedisCacheService } from '../cache/RedisCacheService';
import { LLMService } from '../ai/LLMService';
import { OpenAILLMService } from '../ai/OpenAILLMService';
import { EmbeddingService } from '../ai/EmbeddingService';
import { OpenAIEmbeddingService } from '../ai/OpenAIEmbeddingService';

// 注册配置服务
container.registerSingleton<ConfigService>(EnvironmentConfigService);

// 注册数据库连接
container.register<DatabaseConnection>('DatabaseConnection', {
  useFactory: async (c) => {
    const config = c.resolve<ConfigService>(ConfigService);
    const dbConfig: DatabaseConfig = {
      host: config.get('DATABASE_HOST'),
      port: config.get('DATABASE_PORT'),
      username: config.get('DATABASE_USERNAME'),
      password: config.get('DATABASE_PASSWORD'),
      database: config.get('DATABASE_NAME'),
      poolSize: 10,
      maxWaitTime: 30000,
      ssl: config.get('NODE_ENV') === 'production'
    };
    return DatabaseConnectionManager.getConnection(dbConfig);
  }
});

// 注册仓库
container.registerSingleton<UserRepository, PostgreSQLUserRepository>();

// 注册文件存储服务
container.registerSingleton<FileStorageService>({
  useFactory: (c) => {
    const config = c.resolve<ConfigService>(ConfigService);
    const storageType = config.get('FILE_STORAGE_TYPE');
    
    if (storageType === 's3') {
      // 实现S3文件存储服务
      throw new Error('S3 file storage not implemented yet');
    } else {
      return new LocalFileStorageService(config.get('FILE_STORAGE_PATH'));
    }
  }
});

// 注册日志服务
container.registerSingleton<Logger>({
  useFactory: (c) => {
    const config = c.resolve<ConfigService>(ConfigService);
    return new PinoLogger({
      level: config.get('LOG_LEVEL'),
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          timestampKey: 'time',
          levelKey: 'level',
          messageKey: 'message'
        }
      }
    });
  }
});

// 注册缓存服务
container.registerSingleton<CacheService>({
  useFactory: (c) => {
    const config = c.resolve<ConfigService>(ConfigService);
    const redis = new Redis({
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD')
    });
    return new RedisCacheService(redis);
  }
});

// 注册LLM服务
container.registerSingleton<LLMService>({
  useFactory: (c) => {
    const config = c.resolve<ConfigService>(ConfigService);
    const apiKey = config.get('OPENAI_API_KEY');
    return new OpenAILLMService(apiKey);
  }
});

// 注册嵌入服务
container.registerSingleton<EmbeddingService>({
  useFactory: (c) => {
    const config = c.resolve<ConfigService>(ConfigService);
    const apiKey = config.get('OPENAI_API_KEY');
    return new OpenAIEmbeddingService(apiKey);
  }
});

// 注册HTTP客户端
container.registerSingleton<HttpClient, AxiosHttpClient>();

// 注册苹果认证服务
container.registerSingleton<AppleAuthService, AppleAuthServiceImpl>();

// 注册APNs服务
container.registerSingleton<APNsService, APNsServiceImpl>();
```

## 6. 错误处理

### 6.1 基础设施层错误类型

| 错误类型 | 描述 |
|----------|------|
| `DatabaseConnectionError` | 数据库连接失败 |
| `DatabaseQueryError` | 数据库查询失败 |
| `FileStorageError` | 文件存储操作失败 |
| `CacheError` | 缓存操作失败 |
| `TaskQueueError` | 任务队列操作失败 |
| `AIAPIError` | AI API调用失败 |
| `EmbeddingError` | 嵌入生成失败 |
| `ConfigError` | 配置错误 |
| `AppleAuthError` | 苹果认证失败 |
| `APNsError` | 苹果推送通知失败 |
| `AppleTokenError` | 苹果令牌验证失败 |

### 6.2 错误处理示例

```typescript
export class DatabaseConnectionError extends Error {
  constructor(message: string, public readonly host: string, public readonly port: number) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

export class DatabaseQueryError extends Error {
  constructor(message: string, public readonly query: string, public readonly params?: any[]) {
    super(message);
    this.name = 'DatabaseQueryError';
  }
}

export class FileStorageError extends Error {
  constructor(message: string, public readonly filePath?: string) {
    super(message);
    this.name = 'FileStorageError';
  }
}

export class AppleAuthError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'AppleAuthError';
  }
}

export class APNsError extends Error {
  constructor(message: string, public readonly deviceToken?: string, public readonly errorCode?: string) {
    super(message);
    this.name = 'APNsError';
  }
}

export class AppleTokenError extends Error {
  constructor(message: string, public readonly token?: string) {
    super(message);
    this.name = 'AppleTokenError';
  }
}
```

## 7. 测试策略

### 7.1 单元测试

- **数据库组件测试**：测试数据库连接、查询、事务等功能
- **文件系统组件测试**：测试文件存储、读取、删除等功能
- **消息队列组件测试**：测试任务添加、执行、状态查询等功能
- **缓存组件测试**：测试缓存设置、获取、删除等功能
- **日志组件测试**：测试日志记录、格式化等功能
- **配置组件测试**：测试配置加载、获取等功能
- **苹果认证服务测试**：测试认证URL生成、令牌交换、客户端密钥生成等功能
- **APNs服务测试**：测试通知发送、批量通知、设备令牌验证等功能

### 7.2 集成测试

- **数据库集成测试**：测试数据库与应用程序的集成
- **文件系统集成测试**：测试文件系统与应用程序的集成
- **消息队列集成测试**：测试消息队列与应用程序的集成
- **缓存集成测试**：测试缓存与应用程序的集成
- **外部服务集成测试**：测试外部服务与应用程序的集成
- **苹果认证集成测试**：测试完整的苹果认证流程
- **APNs集成测试**：测试完整的推送通知流程

### 7.3 测试示例

**PostgreSQLUserRepository测试**：

```typescript
import { PostgreSQLUserRepository } from '../database/repositories/PostgreSQLUserRepository';
import { User } from '../../domain/entities/User';
import { DatabaseConnection } from '../database/DatabaseConnection';

// Mock数据库连接
const mockConnection = {
  query: jest.fn().mockImplementation((query: string, params: any[]) => {
    if (query.includes('INSERT INTO users')) {
      return Promise.resolve({
        rows: [{ 
          id: 'user-123', 
          username: params[0], 
          email: params[1], 
          password_hash: params[2], 
          created_at: new Date() 
        }]
      });
    } else if (query.includes('SELECT * FROM users WHERE id')) {
      return Promise.resolve({
        rows: [{ 
          id: params[0], 
          username: 'testuser', 
          email: 'test@example.com', 
          password_hash: 'hashed_password', 
          created_at: new Date() 
        }]
      });
    }
    return Promise.resolve({ rows: [] });
  })
} as unknown as DatabaseConnection;

describe('PostgreSQLUserRepository', () => {
  let repository: PostgreSQLUserRepository;
  
  beforeEach(() => {
    repository = new PostgreSQLUserRepository(mockConnection);
  });
  
  it('should save user correctly', async () => {
    const user = User.create('testuser', 'test@example.com', 'hashed_password');
    const savedUser = await repository.save(user);
    
    expect(savedUser).toBeInstanceOf(User);
    expect(savedUser.id).toBeDefined();
  });
  
  it('should find user by id', async () => {
    const userId = 'user-123';
    const user = await repository.findById(userId);
    
    expect(user).toBeInstanceOf(User);
    expect(user?.id).toBe(userId);
  });
});
```

**AppleAuthServiceImpl测试**：

```typescript
import { AppleAuthServiceImpl } from '../apple/AppleAuthServiceImpl';
import { ConfigService } from '../config/ConfigService';
import { HttpClient } from '../http/HttpClient';

// Mock配置服务和HTTP客户端
const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const configs = {
      'APPLE_CLIENT_ID': 'com.example.app',
      'APPLE_TEAM_ID': 'TEAM123',
      'APPLE_KEY_ID': 'KEY123',
      'APPLE_PRIVATE_KEY': '-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----',
      'APPLE_REDIRECT_URI': 'https://example.com/auth/apple/callback'
    };
    return configs[key as keyof typeof configs] || '';
  })
} as unknown as ConfigService;

const mockHttpClient = {
  post: jest.fn().mockResolvedValue({
    access_token: 'access-token-123',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'refresh-token-123',
    id_token: 'id-token-123'
  })
} as unknown as HttpClient;

describe('AppleAuthServiceImpl', () => {
  let service: AppleAuthServiceImpl;
  
  beforeEach(() => {
    service = new AppleAuthServiceImpl(mockConfigService, mockHttpClient);
  });
  
  it('should generate auth URL correctly', async () => {
    const state = 'test-state-123';
    const url = await service.generateAuthURL(state);
    
    expect(url).toContain('appleid.apple.com/auth/authorize');
    expect(url).toContain('client_id=com.example.app');
    expect(url).toContain(`state=${state}`);
  });
  
  it('should exchange code for token', async () => {
    const code = 'test-code-123';
    const response = await service.exchangeCodeForToken(code);
    
    expect(response).toHaveProperty('access_token');
    expect(response).toHaveProperty('refresh_token');
    expect(response).toHaveProperty('id_token');
  });
});
```

## 8. 实现步骤

### 8.1 阶段1：基础基础设施组件

1. **实现配置服务**：
   - EnvironmentConfigService
   - ConfigService接口

2. **实现日志服务**：
   - PinoLogger
   - Logger接口

3. **实现数据库连接管理**：
   - DatabaseConnectionManager
   - DatabaseConfig

4. **实现基础仓库**：
   - PostgreSQLUserRepository
   - PostgreSQLUserCognitiveModelRepository
   - PostgreSQLCognitiveConceptRepository

### 8.2 阶段2：高级基础设施组件

1. **实现文件存储服务**：
   - LocalFileStorageService
   - FileStorageService接口

2. **实现缓存服务**：
   - RedisCacheService
   - CacheService接口

3. **实现任务队列服务**：
   - TaskQueue
   - Task接口

4. **实现AI服务集成**：
   - OpenAILLMService
   - OpenAIEmbeddingService
   - LLMService和EmbeddingService接口

### 8.3 阶段3：集成和测试

1. **集成基础设施组件**：
   - 使用tsyringe配置依赖注入
   - 测试组件之间的集成

2. **编写单元测试**：
   - 为所有基础设施组件编写单元测试
   - 实现代码覆盖率报告

3. **编写集成测试**：
   - 测试基础设施组件与应用程序的集成

4. **优化性能**：
   - 优化数据库查询
   - 优化缓存策略
   - 优化文件存储

### 8.4 阶段4：苹果后端集成

1. **实现苹果认证服务**：
   - AppleAuthServiceImpl
   - AppleAuthService接口
   - 配置苹果认证相关环境变量

2. **实现APNs服务**：
   - APNsServiceImpl
   - APNsService接口
   - 配置APNs相关环境变量

3. **实现苹果相关仓库**：
   - PostgreSQLAppleAuthRepository
   - PostgreSQLDeviceTokenRepository

4. **集成苹果服务到应用程序**：
   - 在依赖注入容器中注册苹果服务
   - 测试苹果认证流程
   - 测试APNs推送流程

### 8.5 阶段5：部署和监控

1. **配置监控**：
   - 实现Prometheus指标收集
   - 配置Grafana仪表板

2. **配置日志收集**：
   - 实现日志集中收集
   - 配置日志分析

3. **部署基础设施组件**：
   - 部署数据库
   - 部署缓存
   - 部署消息队列
   - 部署AI服务
   - 配置苹果服务相关证书和密钥

## 9. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2024-01-08 | 初始创建 | 系统架构师 |
| 2026-01-09 | 添加苹果后端基础设施组件，包括数据库设计、配置、外部服务集成、错误处理和测试策略 | 系统架构师 |
