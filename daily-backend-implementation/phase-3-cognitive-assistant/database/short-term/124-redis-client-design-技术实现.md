# 124-Redis客户端设计代码

## 1. Redis客户端设计概述

本文档描述了认知辅助系统中Redis缓存客户端的设计和实现。Redis客户端是应用程序与Redis服务器之间的桥梁，负责处理连接管理、数据序列化、缓存操作等功能。

### 1.1 设计目标

1. **易用性**：提供简单易用的API，便于开发人员使用
2. **高性能**：支持高效的缓存操作，减少网络开销
3. **可靠性**：具备连接池管理、自动重连、故障恢复等机制
4. **可扩展性**：支持单节点和集群模式，便于未来扩展
5. **可配置性**：支持灵活的配置，适应不同环境需求
6. **类型安全**：提供TypeScript类型支持，减少开发错误

### 1.2 技术选型

| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| Node.js | ≥18 | 运行环境 | 符合项目技术栈要求 |
| TypeScript | 严格模式 | 开发语言 | 提供类型安全，减少开发错误 |
| ioredis | 5.x | Redis客户端库 | 高性能、支持集群、功能丰富、社区活跃 |
| nanoid | 4.x | 生成唯一ID | 用于缓存键的生成 |

## 2. Redis客户端架构设计

### 2.1 架构层次

Redis客户端采用分层架构设计，分为以下层次：

1. **配置层**：负责加载和管理Redis配置
2. **连接层**：负责Redis连接管理、连接池、自动重连等
3. **核心层**：负责Redis命令的封装和执行
4. **业务层**：负责业务相关的缓存操作封装
5. **工具层**：提供缓存键生成、数据序列化、日志等工具函数

### 2.2 类设计

| 类名 | 职责 | 所属层次 |
|------|------|----------|
| RedisConfig | 管理Redis配置 | 配置层 |
| RedisConnection | 管理Redis连接 | 连接层 |
| RedisClient | 封装Redis核心操作 | 核心层 |
| CacheService | 封装业务缓存操作 | 业务层 |
| CacheKeyGenerator | 生成缓存键 | 工具层 |
| CacheSerializer | 数据序列化和反序列化 | 工具层 |
| CacheLogger | 缓存操作日志 | 工具层 |

## 3. Redis客户端实现

### 3.1 项目结构

```
src/
├── cache/
│   ├── config/           # 配置相关
│   │   └── RedisConfig.ts
│   ├── connection/       # 连接管理
│   │   └── RedisConnection.ts
│   ├── core/             # 核心操作
│   │   └── RedisClient.ts
│   ├── service/          # 业务服务
│   │   └── CacheService.ts
│   ├── utils/            # 工具函数
│   │   ├── CacheKeyGenerator.ts
│   │   ├── CacheSerializer.ts
│   │   └── CacheLogger.ts
│   └── index.ts          # 导出入口
└── index.ts              # 项目入口
```

### 3.2 配置层实现

#### 3.2.1 RedisConfig.ts

```typescript
/**
 * Redis配置类
 * 负责加载和管理Redis配置
 */
export interface RedisConfigOptions {
  /** Redis服务器地址 */
  host: string;
  /** Redis服务器端口 */
  port: number;
  /** Redis密码 */
  password?: string;
  /** Redis数据库索引 */
  db?: number;
  /** 连接超时时间（毫秒） */
  connectTimeout?: number;
  /** 连接池最大连接数 */
  maxRetriesPerRequest?: number;
  /** 重试策略 */
  retryStrategy?: (times: number) => number | null;
  /** 是否启用集群模式 */
  cluster?: boolean;
  /** 集群节点配置 */
  clusterNodes?: Array<{ host: string; port: number }>;
  /** 集群选项 */
  clusterOptions?: any;
}

export class RedisConfig {
  private static defaultConfig: RedisConfigOptions = {
    host: 'localhost',
    port: 6379,
    db: 0,
    connectTimeout: 10000,
    maxRetriesPerRequest: 3,
    cluster: false,
  };

  private config: RedisConfigOptions;

  /**
   * 构造函数
   * @param options Redis配置选项
   */
  constructor(options: Partial<RedisConfigOptions> = {}) {
    this.config = { ...RedisConfig.defaultConfig, ...options };
    this.validateConfig();
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    if (this.config.cluster && (!this.config.clusterNodes || this.config.clusterNodes.length === 0)) {
      throw new Error('Cluster nodes must be provided when cluster mode is enabled');
    }
  }

  /**
   * 获取配置
   */
  public getConfig(): RedisConfigOptions {
    return { ...this.config };
  }

  /**
   * 获取Redis连接选项
   */
  public getConnectionOptions(): any {
    const { cluster, clusterNodes, clusterOptions, ...connectionOptions } = this.config;
    return connectionOptions;
  }

  /**
   * 是否启用集群模式
   */
  public isCluster(): boolean {
    return this.config.cluster === true;
  }

  /**
   * 获取集群节点配置
   */
  public getClusterNodes(): Array<{ host: string; port: number }> {
    return this.config.clusterNodes || [];
  }

  /**
   * 获取集群选项
   */
  public getClusterOptions(): any {
    return this.config.clusterOptions || {};
  }
}
```

### 3.3 连接层实现

#### 3.3.1 RedisConnection.ts

```typescript
import Redis, { Redis as RedisClientType } from 'ioredis';
import { RedisConfig } from '../config/RedisConfig';
import { CacheLogger } from '../utils/CacheLogger';

/**
 * Redis连接管理类
 * 负责Redis连接的创建、管理和关闭
 */
export class RedisConnection {
  private config: RedisConfig;
  private client: RedisClientType | null = null;
  private logger: CacheLogger;

  /**
   * 构造函数
   * @param config Redis配置
   */
  constructor(config: RedisConfig) {
    this.config = config;
    this.logger = new CacheLogger();
    this.initializeClient();
  }

  /**
   * 初始化Redis客户端
   */
  private initializeClient(): void {
    try {
      if (this.config.isCluster()) {
        // 集群模式
        this.client = new Redis.Cluster(this.config.getClusterNodes(), {
          redisOptions: this.config.getConnectionOptions(),
          ...this.config.getClusterOptions(),
        });
        this.logger.info('Redis cluster client initialized');
      } else {
        // 单节点模式
        this.client = new Redis(this.config.getConnectionOptions());
        this.logger.info('Redis single node client initialized');
      }

      // 监听连接事件
      this.setupEventListeners();
    } catch (error) {
      this.logger.error('Failed to initialize Redis client:', error);
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    // 连接成功事件
    this.client.on('connect', () => {
      this.logger.info('Redis client connected');
    });

    // 连接错误事件
    this.client.on('error', (error) => {
      this.logger.error('Redis client error:', error);
    });

    // 重新连接事件
    this.client.on('reconnecting', (times) => {
      this.logger.info(`Redis client reconnecting (attempt ${times})`);
    });

    // 连接关闭事件
    this.client.on('close', () => {
      this.logger.info('Redis client connection closed');
    });

    // 连接结束事件
    this.client.on('end', () => {
      this.logger.info('Redis client connection ended');
    });
  }

  /**
   * 获取Redis客户端实例
   */
  public getClient(): RedisClientType {
    if (!this.client) {
      this.logger.error('Redis client not initialized');
      throw new Error('Redis client not initialized');
    }
    return this.client;
  }

  /**
   * 测试Redis连接
   */
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.client?.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis connection test failed:', error);
      return false;
    }
  }

  /**
   * 关闭Redis连接
   */
  public async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
        this.logger.info('Redis client connection closed gracefully');
      }
    } catch (error) {
      this.logger.error('Failed to close Redis client connection:', error);
      // 强制关闭连接
      if (this.client) {
        this.client.disconnect();
      }
    } finally {
      this.client = null;
    }
  }

  /**
   * 检查连接是否可用
   */
  public isConnected(): boolean {
    return this.client?.status === 'ready';
  }
}
```

### 3.4 工具层实现

#### 3.4.1 CacheKeyGenerator.ts

```typescript
import { nanoid } from 'nanoid';

/**
 * 缓存键生成器
 * 负责生成唯一的缓存键
 */
export class CacheKeyGenerator {
  /**
   * 生成缓存键
   * @param prefix 缓存键前缀
   * @param parts 缓存键组成部分
   * @returns 生成的缓存键
   */
  public static generateKey(prefix: string, ...parts: Array<string | number>): string {
    const keyParts = [prefix, ...parts.map(part => String(part))];
    return keyParts.join(':');
  }

  /**
   * 生成唯一ID
   * @param prefix ID前缀
   * @returns 生成的唯一ID
   */
  public static generateUniqueId(prefix?: string): string {
    const id = nanoid(10);
    return prefix ? `${prefix}:${id}` : id;
  }

  /**
   * 生成用户相关缓存键
   * @param userId 用户ID
   * @param resource 资源名称
   * @param resourceId 资源ID
   * @returns 生成的缓存键
   */
  public static generateUserKey(userId: number, resource: string, resourceId?: number): string {
    return this.generateKey('user', String(userId), resource, resourceId ? String(resourceId) : '');
  }

  /**
   * 生成模型相关缓存键
   * @param modelId 模型ID
   * @param resource 资源名称
   * @param resourceId 资源ID
   * @returns 生成的缓存键
   */
  public static generateModelKey(modelId: number, resource: string, resourceId?: number): string {
    return this.generateKey('model', String(modelId), resource, resourceId ? String(resourceId) : '');
  }
}
```

#### 3.4.2 CacheSerializer.ts

```typescript
/**
 * 缓存序列化器
 * 负责数据的序列化和反序列化
 */
export class CacheSerializer {
  /**
   * 序列化数据
   * @param data 要序列化的数据
   * @returns 序列化后的字符串
   */
  public static serialize<T>(data: T): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      throw new Error(`Failed to serialize data: ${error.message}`);
    }
  }

  /**
   * 反序列化数据
   * @param data 要反序列化的字符串
   * @returns 反序列化后的对象
   */
  public static deserialize<T>(data: string): T {
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      throw new Error(`Failed to deserialize data: ${error.message}`);
    }
  }

  /**
   * 序列化对象为哈希表
   * @param data 要序列化的对象
   * @returns 序列化后的哈希表
   */
  public static serializeToHash<T extends Record<string, any>>(data: T): Record<string, string> {
    const hash: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      hash[key] = this.serialize(value);
    }
    return hash;
  }

  /**
   * 从哈希表反序列化对象
   * @param hash 要反序列化的哈希表
   * @returns 反序列化后的对象
   */
  public static deserializeFromHash<T extends Record<string, any>>(hash: Record<string, string>): T {
    const data: any = {};
    for (const [key, value] of Object.entries(hash)) {
      data[key] = this.deserialize(value);
    }
    return data as T;
  }
}
```

#### 3.4.3 CacheLogger.ts

```typescript
/**
 * 缓存日志记录器
 * 负责记录缓存操作日志
 */
export class CacheLogger {
  private enabled: boolean;

  /**
   * 构造函数
   * @param enabled 是否启用日志
   */
  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  /**
   * 记录信息日志
   * @param message 日志消息
   * @param data 附加数据
   */
  public info(message: string, data?: any): void {
    if (this.enabled) {
      this.log('INFO', message, data);
    }
  }

  /**
   * 记录错误日志
   * @param message 日志消息
   * @param error 错误对象
   */
  public error(message: string, error?: any): void {
    if (this.enabled) {
      this.log('ERROR', message, error);
    }
  }

  /**
   * 记录调试日志
   * @param message 日志消息
   * @param data 附加数据
   */
  public debug(message: string, data?: any): void {
    if (this.enabled) {
      this.log('DEBUG', message, data);
    }
  }

  /**
   * 记录警告日志
   * @param message 日志消息
   * @param data 附加数据
   */
  public warn(message: string, data?: any): void {
    if (this.enabled) {
      this.log('WARN', message, data);
    }
  }

  /**
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   * @param data 附加数据
   */
  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${timestamp}] [${level}] [CACHE] ${message}${logData}`);
  }

  /**
   * 启用日志
   */
  public enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用日志
   */
  public disable(): void {
    this.enabled = false;
  }

  /**
   * 检查日志是否启用
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}
```

### 3.5 核心层实现

#### 3.5.1 RedisClient.ts

```typescript
import { RedisClientType } from 'ioredis';
import { RedisConnection } from '../connection/RedisConnection';
import { CacheSerializer } from '../utils/CacheSerializer';
import { CacheLogger } from '../utils/CacheLogger';

/**
 * Redis核心客户端
 * 封装Redis核心操作
 */
export class RedisClient {
  private connection: RedisConnection;
  private client: RedisClientType;
  private logger: CacheLogger;

  /**
   * 构造函数
   * @param connection Redis连接
   */
  constructor(connection: RedisConnection) {
    this.connection = connection;
    this.client = connection.getClient();
    this.logger = new CacheLogger();
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒）
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = CacheSerializer.serialize(value);
      if (ttl) {
        await this.client.set(key, serializedValue, 'EX', ttl);
      } else {
        await this.client.set(key, serializedValue);
      }
      this.logger.debug(`Set cache: ${key} (TTL: ${ttl || 'none'})`);
    } catch (error) {
      this.logger.error(`Failed to set cache: ${key}`, error);
      throw error;
    }
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在则返回null
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value) {
        const deserializedValue = CacheSerializer.deserialize<T>(value);
        this.logger.debug(`Get cache: ${key} (Hit)`);
        return deserializedValue;
      } else {
        this.logger.debug(`Get cache: ${key} (Miss)`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to get cache: ${key}`, error);
      return null;
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   * @returns 删除的键数量
   */
  public async del(key: string): Promise<number> {
    try {
      const result = await this.client.del(key);
      this.logger.debug(`Delete cache: ${key} (Deleted: ${result})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete cache: ${key}`, error);
      return 0;
    }
  }

  /**
   * 批量删除缓存
   * @param keys 缓存键数组
   * @returns 删除的键数量
   */
  public async delBatch(keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0;
      const result = await this.client.del(...keys);
      this.logger.debug(`Delete batch cache: ${keys.length} keys (Deleted: ${result})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete batch cache: ${keys.length} keys`, error);
      return 0;
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      const exists = result > 0;
      this.logger.debug(`Exists cache: ${key} (${exists ? 'Yes' : 'No'})`);
      return exists;
    } catch (error) {
      this.logger.error(`Failed to check cache exists: ${key}`, error);
      return false;
    }
  }

  /**
   * 设置缓存过期时间
   * @param key 缓存键
   * @param ttl 过期时间（秒）
   * @returns 是否设置成功
   */
  public async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      const success = result === 1;
      this.logger.debug(`Set expire: ${key} (TTL: ${ttl}, Success: ${success})`);
      return success;
    } catch (error) {
      this.logger.error(`Failed to set expire: ${key}`, error);
      return false;
    }
  }

  /**
   * 获取缓存剩余过期时间
   * @param key 缓存键
   * @returns 剩余过期时间（秒），如果不存在或无过期时间则返回-1
   */
  public async ttl(key: string): Promise<number> {
    try {
      const result = await this.client.ttl(key);
      this.logger.debug(`Get TTL: ${key} (TTL: ${result})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get TTL: ${key}`, error);
      return -1;
    }
  }

  /**
   * 递增数值
   * @param key 缓存键
   * @param increment 递增步长，默认为1
   * @returns 递增后的值
   */
  public async incr(key: string, increment: number = 1): Promise<number> {
    try {
      let result: number;
      if (increment === 1) {
        result = await this.client.incr(key);
      } else {
        result = await this.client.incrby(key, increment);
      }
      this.logger.debug(`Increment: ${key} (Increment: ${increment}, Result: ${result})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to increment: ${key}`, error);
      throw error;
    }
  }

  /**
   * 递减数值
   * @param key 缓存键
   * @param decrement 递减步长，默认为1
   * @returns 递减后的值
   */
  public async decr(key: string, decrement: number = 1): Promise<number> {
    try {
      let result: number;
      if (decrement === 1) {
        result = await this.client.decr(key);
      } else {
        result = await this.client.decrby(key, decrement);
      }
      this.logger.debug(`Decrement: ${key} (Decrement: ${decrement}, Result: ${result})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to decrement: ${key}`, error);
      throw error;
    }
  }

  /**
   * 哈希表设置字段
   * @param key 缓存键
   * @param field 字段名
   * @param value 字段值
   */
  public async hset<T>(key: string, field: string, value: T): Promise<void> {
    try {
      const serializedValue = CacheSerializer.serialize(value);
      await this.client.hset(key, field, serializedValue);
      this.logger.debug(`Hash set: ${key}:${field}`);
    } catch (error) {
      this.logger.error(`Failed to hash set: ${key}:${field}`, error);
      throw error;
    }
  }

  /**
   * 哈希表获取字段
   * @param key 缓存键
   * @param field 字段名
   * @returns 字段值，如果不存在则返回null
   */
  public async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hget(key, field);
      if (value) {
        const deserializedValue = CacheSerializer.deserialize<T>(value);
        this.logger.debug(`Hash get: ${key}:${field} (Hit)`);
        return deserializedValue;
      } else {
        this.logger.debug(`Hash get: ${key}:${field} (Miss)`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to hash get: ${key}:${field}`, error);
      return null;
    }
  }

  /**
   * 删除哈希表字段
   * @param key 缓存键
   * @param field 字段名
   * @returns 是否删除成功
   */
  public async hdel(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.client.hdel(key, field);
      const success = result === 1;
      this.logger.debug(`Hash delete: ${key}:${field} (Success: ${success})`);
      return success;
    } catch (error) {
      this.logger.error(`Failed to hash delete: ${key}:${field}`, error);
      return false;
    }
  }

  /**
   * 清除所有缓存
   */
  public async flushAll(): Promise<void> {
    try {
      await this.client.flushAll();
      this.logger.info('Flush all cache');
    } catch (error) {
      this.logger.error('Failed to flush all cache', error);
      throw error;
    }
  }

  /**
   * 关闭客户端
   */
  public async close(): Promise<void> {
    await this.connection.close();
    this.logger.info('Redis client closed');
  }
}
```

### 3.6 业务层实现

#### 3.6.1 CacheService.ts

```typescript
import { RedisClient } from '../core/RedisClient';
import { CacheKeyGenerator } from '../utils/CacheKeyGenerator';
import { CacheLogger } from '../utils/CacheLogger';

/**
 * 缓存服务接口
 */
export interface ICacheService {
  // 用户认知模型相关
  getUserCognitiveModel(userId: number, modelType: string): Promise<any | null>;
  setUserCognitiveModel(userId: number, modelType: string, model: any, ttl?: number): Promise<void>;
  deleteUserCognitiveModel(userId: number, modelType: string): Promise<void>;
  deleteUserCognitiveModels(userId: number): Promise<void>;

  // 认知概念相关
  getCognitiveConcepts(modelId: number, type?: string): Promise<any[] | null>;
  setCognitiveConcepts(modelId: number, concepts: any[], type?: string, ttl?: number): Promise<void>;
  deleteCognitiveConcepts(modelId: number): Promise<void>;

  // 认知关系相关
  getCognitiveRelations(modelId: number, relationType?: string): Promise<any[] | null>;
  setCognitiveRelations(modelId: number, relations: any[], relationType?: string, ttl?: number): Promise<void>;
  deleteCognitiveRelations(modelId: number): Promise<void>;

  // 思考片段相关
  getUserThoughtFragments(userId: number, limit?: number, offset?: number): Promise<any[] | null>;
  setUserThoughtFragments(userId: number, fragments: any[], limit?: number, offset?: number, ttl?: number): Promise<void>;
  deleteUserThoughtFragments(userId: number): Promise<void>;

  // 认知洞察相关
  getCognitiveInsights(modelId: number, insightType?: string): Promise<any[] | null>;
  setCognitiveInsights(modelId: number, insights: any[], insightType?: string, ttl?: number): Promise<void>;
  deleteCognitiveInsights(modelId: number): Promise<void>;

  // 通用方法
  get(key: string): Promise<any | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deleteBatch(keys: string[]): Promise<number>;
}

/**
 * 缓存服务
 * 封装业务相关的缓存操作
 */
export class CacheService implements ICacheService {
  private redisClient: RedisClient;
  private logger: CacheLogger;

  // 缓存过期时间（秒）
  private static readonly DEFAULT_TTL = 3600; // 1小时
  private static readonly SHORT_TTL = 600; // 10分钟
  private static readonly LONG_TTL = 86400; // 24小时

  /**
   * 构造函数
   * @param redisClient Redis客户端
   */
  constructor(redisClient: RedisClient) {
    this.redisClient = redisClient;
    this.logger = new CacheLogger();
  }

  // 用户认知模型相关

  /**
   * 获取用户认知模型
   * @param userId 用户ID
   * @param modelType 模型类型
   */
  public async getUserCognitiveModel(userId: number, modelType: string): Promise<any | null> {
    const key = CacheKeyGenerator.generateUserKey(userId, 'model', modelType);
    return this.redisClient.get<any>(key);
  }

  /**
   * 设置用户认知模型
   * @param userId 用户ID
   * @param modelType 模型类型
   * @param model 模型数据
   * @param ttl 过期时间（秒）
   */
  public async setUserCognitiveModel(userId: number, modelType: string, model: any, ttl: number = CacheService.DEFAULT_TTL): Promise<void> {
    const key = CacheKeyGenerator.generateUserKey(userId, 'model', modelType);
    await this.redisClient.set(key, model, ttl);
  }

  /**
   * 删除用户认知模型
   * @param userId 用户ID
   * @param modelType 模型类型
   */
  public async deleteUserCognitiveModel(userId: number, modelType: string): Promise<void> {
    const key = CacheKeyGenerator.generateUserKey(userId, 'model', modelType);
    await this.redisClient.del(key);
  }

  /**
   * 删除用户所有认知模型
   * @param userId 用户ID
   */
  public async deleteUserCognitiveModels(userId: number): Promise<void> {
    // 这里简化处理，实际项目中可能需要使用键模式匹配删除
    const key = CacheKeyGenerator.generateUserKey(userId, 'model');
    // 注意：在生产环境中，应避免使用KEYS命令，这里仅作示例
    await this.redisClient.del(key);
  }

  // 认知概念相关

  /**
   * 获取认知概念
   * @param modelId 模型ID
   * @param type 概念类型
   */
  public async getCognitiveConcepts(modelId: number, type?: string): Promise<any[] | null> {
    const key = CacheKeyGenerator.generateModelKey(modelId, 'concepts', type ? type : 'all');
    return this.redisClient.get<any[]>(key);
  }

  /**
   * 设置认知概念
   * @param modelId 模型ID
   * @param concepts 概念数据
   * @param type 概念类型
   * @param ttl 过期时间（秒）
   */
  public async setCognitiveConcepts(modelId: number, concepts: any[], type?: string, ttl: number = CacheService.DEFAULT_TTL): Promise<void> {
    const key = CacheKeyGenerator.generateModelKey(modelId, 'concepts', type ? type : 'all');
    await this.redisClient.set(key, concepts, ttl);
  }

  /**
   * 删除认知概念
   * @param modelId 模型ID
   */
  public async deleteCognitiveConcepts(modelId: number): Promise<void> {
    // 这里简化处理，实际项目中可能需要使用键模式匹配删除
    const key = CacheKeyGenerator.generateModelKey(modelId, 'concepts');
    await this.redisClient.del(key);
  }

  // 认知关系相关

  /**
   * 获取认知关系
   * @param modelId 模型ID
   * @param relationType 关系类型
   */
  public async getCognitiveRelations(modelId: number, relationType?: string): Promise<any[] | null> {
    const key = CacheKeyGenerator.generateModelKey(modelId, 'relations', relationType ? relationType : 'all');
    return this.redisClient.get<any[]>(key);
  }

  /**
   * 设置认知关系
   * @param modelId 模型ID
   * @param relations 关系数据
   * @param relationType 关系类型
   * @param ttl 过期时间（秒）
   */
  public async setCognitiveRelations(modelId: number, relations: any[], relationType?: string, ttl: number = CacheService.DEFAULT_TTL): Promise<void> {
    const key = CacheKeyGenerator.generateModelKey(modelId, 'relations', relationType ? relationType : 'all');
    await this.redisClient.set(key, relations, ttl);
  }

  /**
   * 删除认知关系
   * @param modelId 模型ID
   */
  public async deleteCognitiveRelations(modelId: number): Promise<void> {
    // 这里简化处理，实际项目中可能需要使用键模式匹配删除
    const key = CacheKeyGenerator.generateModelKey(modelId, 'relations');
    await this.redisClient.del(key);
  }

  // 思考片段相关

  /**
   * 获取用户思考片段
   * @param userId 用户ID
   * @param limit 限制数量
   * @param offset 偏移量
   */
  public async getUserThoughtFragments(userId: number, limit: number = 10, offset: number = 0): Promise<any[] | null> {
    const key = CacheKeyGenerator.generateUserKey(userId, 'thoughts', `${limit}:${offset}`);
    return this.redisClient.get<any[]>(key);
  }

  /**
   * 设置用户思考片段
   * @param userId 用户ID
   * @param fragments 思考片段数据
   * @param limit 限制数量
   * @param offset 偏移量
   * @param ttl 过期时间（秒）
   */
  public async setUserThoughtFragments(
    userId: number,
    fragments: any[],
    limit: number = 10,
    offset: number = 0,
    ttl: number = CacheService.SHORT_TTL
  ): Promise<void> {
    const key = CacheKeyGenerator.generateUserKey(userId, 'thoughts', `${limit}:${offset}`);
    await this.redisClient.set(key, fragments, ttl);
  }

  /**
   * 删除用户思考片段
   * @param userId 用户ID
   */
  public async deleteUserThoughtFragments(userId: number): Promise<void> {
    // 这里简化处理，实际项目中可能需要使用键模式匹配删除
    const key = CacheKeyGenerator.generateUserKey(userId, 'thoughts');
    await this.redisClient.del(key);
  }

  // 认知洞察相关

  /**
   * 获取认知洞察
   * @param modelId 模型ID
   * @param insightType 洞察类型
   */
  public async getCognitiveInsights(modelId: number, insightType?: string): Promise<any[] | null> {
    const key = CacheKeyGenerator.generateModelKey(modelId, 'insights', insightType ? insightType : 'all');
    return this.redisClient.get<any[]>(key);
  }

  /**
   * 设置认知洞察
   * @param modelId 模型ID
   * @param insights 洞察数据
   * @param insightType 洞察类型
   * @param ttl 过期时间（秒）
   */
  public async setCognitiveInsights(
    modelId: number,
    insights: any[],
    insightType?: string,
    ttl: number = CacheService.DEFAULT_TTL
  ): Promise<void> {
    const key = CacheKeyGenerator.generateModelKey(modelId, 'insights', insightType ? insightType : 'all');
    await this.redisClient.set(key, insights, ttl);
  }

  /**
   * 删除认知洞察
   * @param modelId 模型ID
   */
  public async deleteCognitiveInsights(modelId: number): Promise<void> {
    // 这里简化处理，实际项目中可能需要使用键模式匹配删除
    const key = CacheKeyGenerator.generateModelKey(modelId, 'insights');
    await this.redisClient.del(key);
  }

  // 通用方法

  /**
   * 获取缓存
   * @param key 缓存键
   */
  public async get(key: string): Promise<any | null> {
    return this.redisClient.get<any>(key);
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒）
   */
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.redisClient.set(key, value, ttl);
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  public async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  /**
   * 批量删除缓存
   * @param keys 缓存键数组
   */
  public async deleteBatch(keys: string[]): Promise<number> {
    return this.redisClient.delBatch(keys);
  }
}
```

### 3.7 入口文件

#### 3.7.1 index.ts

```typescript
import { RedisConfig } from './config/RedisConfig';
import { RedisConnection } from './connection/RedisConnection';
import { RedisClient } from './core/RedisClient';
import { CacheService } from './service/CacheService';

/**
 * 缓存模块入口
 */
export {
  RedisConfig,
  RedisConnection,
  RedisClient,
  CacheService,
};

/**
 * 创建缓存服务
 * @param config Redis配置选项
 * @returns 缓存服务实例
 */
export function createCacheService(config: any = {}): CacheService {
  const redisConfig = new RedisConfig(config);
  const connection = new RedisConnection(redisConfig);
  const redisClient = new RedisClient(connection);
  return new CacheService(redisClient);
}
```

## 4. Redis客户端使用示例

### 4.1 基本使用

```typescript
import { createCacheService } from './src/cache';

// 创建缓存服务
const cacheService = createCacheService({
  host: 'localhost',
  port: 6379,
  password: 'your_password',
  db: 0,
});

// 设置缓存
await cacheService.set('test_key', { foo: 'bar' }, 3600);

// 获取缓存
const value = await cacheService.get('test_key');
console.log(value); // { foo: 'bar' }

// 删除缓存
await cacheService.delete('test_key');

// 使用业务方法
await cacheService.setUserCognitiveModel(1, 'personal', { name: 'Test Model' });
const model = await cacheService.getUserCognitiveModel(1, 'personal');
console.log(model); // { name: 'Test Model' }
```

### 4.2 在Express应用中使用

```typescript
import express from 'express';
import { createCacheService } from './src/cache';

const app = express();
const port = 3000;

// 创建缓存服务
const cacheService = createCacheService({
  host: 'localhost',
  port: 6379,
  password: 'your_password',
});

// 示例路由：获取用户认知模型
app.get('/api/users/:userId/models/:modelType', async (req, res) => {
  const { userId, modelType } = req.params;
  
  try {
    // 尝试从缓存获取
    let model = await cacheService.getUserCognitiveModel(Number(userId), modelType);
    
    if (!model) {
      // 缓存未命中，从数据库获取
      model = await fetchModelFromDatabase(Number(userId), modelType);
      
      // 设置缓存
      await cacheService.setUserCognitiveModel(Number(userId), modelType, model);
    }
    
    res.json(model);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cognitive model' });
  }
});

// 模拟从数据库获取模型
async function fetchModelFromDatabase(userId: number, modelType: string) {
  // 实际项目中这里会调用数据库
  return {
    id: 1,
    userId,
    modelType,
    name: 'Test Model',
    createdAt: new Date(),
  };
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

## 5. 测试和验证

### 5.1 单元测试

```typescript
import { RedisConfig } from '../src/cache/config/RedisConfig';
import { RedisConnection } from '../src/cache/connection/RedisConnection';
import { RedisClient } from '../src/cache/core/RedisClient';
import { CacheService } from '../src/cache/service/CacheService';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeAll(async () => {
    const config = new RedisConfig({
      host: 'localhost',
      port: 6379,
      password: 'your_password',
      db: 1, // 使用测试数据库
    });
    const connection = new RedisConnection(config);
    const redisClient = new RedisClient(connection);
    cacheService = new CacheService(redisClient);
  });

  afterAll(async () => {
    // 清除测试数据
    await cacheService.deleteBatch(['test_key', 'user:1:model:personal']);
  });

  test('should set and get cache', async () => {
    const testData = { foo: 'bar', number: 42 };
    await cacheService.set('test_key', testData, 60);
    
    const result = await cacheService.get('test_key');
    expect(result).toEqual(testData);
  });

  test('should return null for non-existent key', async () => {
    const result = await cacheService.get('non_existent_key');
    expect(result).toBeNull();
  });

  test('should delete cache', async () => {
    await cacheService.set('test_key', 'test_value', 60);
    await cacheService.delete('test_key');
    
    const result = await cacheService.get('test_key');
    expect(result).toBeNull();
  });

  test('should handle user cognitive model', async () => {
    const model = { name: 'Test Model', type: 'personal' };
    await cacheService.setUserCognitiveModel(1, 'personal', model);
    
    const result = await cacheService.getUserCognitiveModel(1, 'personal');
    expect(result).toEqual(model);
    
    await cacheService.deleteUserCognitiveModel(1, 'personal');
    const deletedResult = await cacheService.getUserCognitiveModel(1, 'personal');
    expect(deletedResult).toBeNull();
  });
});
```

## 6. 性能优化

### 6.1 连接池优化

- 合理配置连接池大小，根据业务需求调整
- 使用连接池复用连接，减少连接创建开销
- 启用自动重连机制，提高可靠性

### 6.2 序列化优化

- 使用高效的序列化方式，如MessagePack（可选）
- 对于大型对象，考虑拆分存储
- 避免存储过大的数据，超过1MB的数据应考虑其他存储方式

### 6.3 缓存键优化

- 保持缓存键简洁，避免过长
- 使用统一的命名规范，便于管理和调试
- 避免使用复杂的键生成逻辑，影响性能

### 6.4 批量操作

- 对于多个相关操作，使用批量命令减少网络开销
- 合理使用管道（pipeline）机制，提高并发处理能力

## 7. 监控和日志

- 集成Prometheus和Grafana，监控Redis性能指标
- 记录缓存操作日志，便于调试和分析
- 监控缓存命中率，优化缓存策略
- 监控缓存大小和内存使用情况

## 8. 总结

本文档设计和实现了一个高性能、可靠、易用的Redis缓存客户端，包含以下核心功能：

1. **连接管理**：支持单节点和集群模式，具备连接池管理、自动重连等机制
2. **核心操作**：封装了Redis的核心操作，如set、get、del等
3. **业务封装**：提供了业务相关的缓存操作方法，如用户认知模型、认知概念等
4. **工具函数**：提供了缓存键生成、数据序列化、日志等工具函数
5. **类型安全**：使用TypeScript开发，提供了完整的类型支持

该缓存客户端设计遵循了分层架构原则，各层职责清晰，便于扩展和维护。同时，提供了详细的使用示例和测试用例，便于开发人员使用和验证。

通过使用该缓存客户端，可以有效地提高系统的响应速度，降低数据库负载，支持高并发访问，为认知辅助系统提供可靠的缓存支持。