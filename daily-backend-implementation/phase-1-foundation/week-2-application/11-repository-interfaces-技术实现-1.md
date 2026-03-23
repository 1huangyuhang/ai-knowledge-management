# Day 11: Repository接口设计与实现 - 代码实现文档（第一部分）

## 1. 仓库接口设计概述

### 1.1 设计原则

仓库模式是领域驱动设计(DDD)中的核心概念，它提供了一种将领域模型与数据持久化技术分离的方式。在设计仓库接口时，我们遵循以下原则：

- **依赖倒置**：领域层依赖抽象的仓库接口，而不是具体的实现
- **单一职责**：每个仓库只负责一个聚合根的持久化
- **清晰的API**：提供直观、一致的方法命名
- **事务边界**：在应用层控制事务，而不是仓库层
- **可测试性**：便于模拟和测试

### 1.2 仓库接口层次结构

```
┌─────────────────────────┐
│ 领域层仓库接口           │
└─────────────▲───────────┘
              │
┌─────────────┴───────────┐
│ 基础设施层实现           │
└─────────────▲───────────┘
              │
┌─────────────┴───────────┐
│ 数据库访问层             │
└─────────────────────────┘
```

## 2. 核心仓库接口定义

### 2.1 基础仓库接口

```typescript
// src/domain/interfaces/BaseRepository.ts
import { BaseEntity } from '../entities/BaseEntity';

/**
 * 基础仓库接口，定义了所有仓库必须实现的通用方法
 * @template T 实体类型
 * @template ID 实体ID类型
 */
export interface BaseRepository<T extends BaseEntity<any>, ID> {
  /**
   * 保存实体
   * @param entity 要保存的实体
   * @returns 保存后的实体
   */
  save(entity: T): Promise<T>;

  /**
   * 根据ID查找实体
   * @param id 实体ID
   * @returns 找到的实体或null
   */
  findById(id: ID): Promise<T | null>;

  /**
   * 查找所有实体
   * @returns 所有实体的数组
   */
  findAll(): Promise<T[]>;

  /**
   * 删除实体
   * @param entity 要删除的实体
   * @returns 布尔值，表示是否删除成功
   */
  delete(entity: T): Promise<boolean>;

  /**
   * 根据ID删除实体
   * @param id 实体ID
   * @returns 布尔值，表示是否删除成功
   */
  deleteById(id: ID): Promise<boolean>;

  /**
   * 统计实体数量
   * @returns 实体数量
   */
  count(): Promise<number>;
}
```

### 2.2 思维片段仓库接口

```typescript
// src/domain/interfaces/ThoughtRepository.ts
import { BaseRepository } from './BaseRepository';
import { ThoughtFragment } from '../entities/ThoughtFragment';

/**
 * 思维片段仓库接口，继承自基础仓库接口
 */
export interface ThoughtRepository extends BaseRepository<ThoughtFragment, string> {
  /**
   * 根据用户ID查找思维片段
   * @param userId 用户ID
   * @returns 思维片段数组
   */
  findByUserId(userId: string): Promise<ThoughtFragment[]>;

  /**
   * 根据创建时间范围查找思维片段
   * @param startDate 开始时间
   * @param endDate 结束时间
   * @returns 思维片段数组
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<ThoughtFragment[]>;

  /**
   * 根据用户ID和创建时间范围查找思维片段
   * @param userId 用户ID
   * @param startDate 开始时间
   * @param endDate 结束时间
   * @returns 思维片段数组
   */
  findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<ThoughtFragment[]>;
}
```

### 2.3 认知模型仓库接口

```typescript
// src/domain/interfaces/CognitiveModelRepository.ts
import { BaseRepository } from './BaseRepository';
import { UserCognitiveModel } from '../entities/UserCognitiveModel';

/**
 * 认知模型仓库接口，继承自基础仓库接口
 */
export interface CognitiveModelRepository extends BaseRepository<UserCognitiveModel, string> {
  /**
   * 根据用户ID查找认知模型
   * @param userId 用户ID
   * @returns 认知模型或null
   */
  findByUserId(userId: string): Promise<UserCognitiveModel | null>;

  /**
   * 根据用户ID查找最新的认知模型
   * @param userId 用户ID
   * @returns 最新的认知模型或null
   */
  findLatestByUserId(userId: string): Promise<UserCognitiveModel | null>;
}
```

### 2.4 认知建议仓库接口

```typescript
// src/domain/interfaces/CognitiveProposalRepository.ts
import { BaseRepository } from './BaseRepository';
import { CognitiveProposal } from '../entities/CognitiveProposal';

/**
 * 认知建议仓库接口，继承自基础仓库接口
 */
export interface CognitiveProposalRepository extends BaseRepository<CognitiveProposal, string> {
  /**
   * 根据思维片段ID查找认知建议
   * @param thoughtId 思维片段ID
   * @returns 认知建议数组
   */
  findByThoughtId(thoughtId: string): Promise<CognitiveProposal[]>;

  /**
   * 根据置信度范围查找认知建议
   * @param minConfidence 最小置信度
   * @param maxConfidence 最大置信度
   * @returns 认知建议数组
   */
  findByConfidenceRange(minConfidence: number, maxConfidence: number): Promise<CognitiveProposal[]>;
}
```

### 2.5 认知洞察仓库接口

```typescript
// src/domain/interfaces/CognitiveInsightRepository.ts
import { BaseRepository } from './BaseRepository';
import { CognitiveInsight } from '../entities/CognitiveInsight';

/**
 * 认知洞察仓库接口，继承自基础仓库接口
 */
export interface CognitiveInsightRepository extends BaseRepository<CognitiveInsight, string> {
  /**
   * 根据认知模型ID查找认知洞察
   * @param modelId 认知模型ID
   * @returns 认知洞察数组
   */
  findByModelId(modelId: string): Promise<CognitiveInsight[]>;

  /**
   * 根据用户ID查找认知洞察
   * @param userId 用户ID
   * @returns 认知洞察数组
   */
  findByUserId(userId: string): Promise<CognitiveInsight[]>;

  /**
   * 根据用户ID查找最新的认知洞察
   * @param userId 用户ID
   * @returns 最新的认知洞察或null
   */
  findLatestByUserId(userId: string): Promise<CognitiveInsight | null>;
}
```

## 3. 仓库接口实现

### 3.1 基础仓库实现

```typescript
// src/infrastructure/persistence/repositories/BaseRepositoryImpl.ts
import { BaseRepository } from '../../../domain/interfaces/BaseRepository';
import { BaseEntity } from '../../../domain/entities/BaseEntity';
import { SQLiteConnection } from '../SQLiteConnection';

/**
 * 基础仓库实现，提供了通用方法的默认实现
 * @template T 实体类型
 * @template ID 实体ID类型
 */
export abstract class BaseRepositoryImpl<T extends BaseEntity<any>, ID> implements BaseRepository<T, ID> {
  /**
   * 构造函数
   * @param connection SQLite连接
   * @param tableName 表名
   */
  protected constructor(
    protected readonly connection: SQLiteConnection,
    protected readonly tableName: string
  ) {}

  /**
   * 保存实体
   */
  async save(entity: T): Promise<T> {
    // 检查实体是否已存在
    const existingEntity = await this.findById(entity.id as unknown as ID);
    
    if (existingEntity) {
      // 更新现有实体
      return this.update(entity);
    } else {
      // 创建新实体
      return this.create(entity);
    }
  }

  /**
   * 根据ID查找实体
   */
  async findById(id: ID): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const rows = await this.connection.query(sql, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return this.mapRowToEntity(rows[0]);
  }

  /**
   * 查找所有实体
   */
  async findAll(): Promise<T[]> {
    const sql = `SELECT * FROM ${this.tableName}`;
    const rows = await this.connection.query(sql);
    
    return rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * 删除实体
   */
  async delete(entity: T): Promise<boolean> {
    return this.deleteById(entity.id as unknown as ID);
  }

  /**
   * 根据ID删除实体
   */
  async deleteById(id: ID): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    await this.connection.execute(sql, [id]);
    return true;
  }

  /**
   * 统计实体数量
   */
  async count(): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const rows = await this.connection.query(sql);
    return rows[0].count;
  }

  /**
   * 创建实体
   * @param entity 要创建的实体
   * @returns 创建后的实体
   */
  protected abstract create(entity: T): Promise<T>;

  /**
   * 更新实体
   * @param entity 要更新的实体
   * @returns 更新后的实体
   */
  protected abstract update(entity: T): Promise<T>;

  /**
   * 将数据库行映射为实体
   * @param row 数据库行
   * @returns 映射后的实体
   */
  protected abstract mapRowToEntity(row: any): T;
}
```

### 3.2 思维片段仓库实现

```typescript
// src/infrastructure/persistence/repositories/SQLiteThoughtRepository.ts
import { BaseRepositoryImpl } from './BaseRepositoryImpl';
import { ThoughtRepository } from '../../../domain/interfaces/ThoughtRepository';
import { ThoughtFragment } from '../../../domain/entities/ThoughtFragment';
import { SQLiteConnection } from '../SQLiteConnection';

/**
 * SQLite思维片段仓库实现，继承自基础仓库实现
 */
export class SQLiteThoughtRepository extends BaseRepositoryImpl<ThoughtFragment, string> implements ThoughtRepository {
  /**
   * 构造函数
   * @param connection SQLite连接
   */
  constructor(connection: SQLiteConnection) {
    super(connection, 'thought_fragments');
  }

  /**
   * 根据用户ID查找思维片段
   */
  async findByUserId(userId: string): Promise<ThoughtFragment[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY created_at DESC`;
    const rows = await this.connection.query(sql, [userId]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * 根据创建时间范围查找思维片段
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<ThoughtFragment[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC`;
    const rows = await this.connection.query(sql, [
      startDate.toISOString(),
      endDate.toISOString()
    ]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * 根据用户ID和创建时间范围查找思维片段
   */
  async findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<ThoughtFragment[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE user_id = ? AND created_at BETWEEN ? AND ? ORDER BY created_at DESC`;
    const rows = await this.connection.query(sql, [
      userId,
      startDate.toISOString(),
      endDate.toISOString()
    ]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * 创建思维片段
   */
  protected async create(entity: ThoughtFragment): Promise<ThoughtFragment> {
    const sql = `
      INSERT INTO ${this.tableName} (id, content, metadata, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await this.connection.execute(sql, [
      entity.id,
      entity.content,
      JSON.stringify(entity.metadata),
      entity.userId,
      entity.createdAt.toISOString(),
      entity.updatedAt.toISOString()
    ]);
    
    return entity;
  }

  /**
   * 更新思维片段
   */
  protected async update(entity: ThoughtFragment): Promise<ThoughtFragment> {
    const sql = `
      UPDATE ${this.tableName} 
      SET content = ?, metadata = ?, updated_at = ? 
      WHERE id = ?
    `;
    
    await this.connection.execute(sql, [
      entity.content,
      JSON.stringify(entity.metadata),
      new Date().toISOString(),
      entity.id
    ]);
    
    return entity;
  }

  /**
   * 将数据库行映射为思维片段实体
   */
  protected mapRowToEntity(row: any): ThoughtFragment {
    return new ThoughtFragment(
      row.id,
      row.content,
      JSON.parse(row.metadata),
      row.user_id,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
```