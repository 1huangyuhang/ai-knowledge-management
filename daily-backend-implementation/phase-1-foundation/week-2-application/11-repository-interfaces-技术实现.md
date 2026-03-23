# Day 11: Repository接口设计与实现 - 代码实现文档

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

## 4. 数据传输对象(DTO)设计

### 4.1 DTO设计原则

- **与领域模型分离**：DTO是Application层的概念，与领域模型解耦
- **扁平化结构**：避免嵌套过深，便于序列化和反序列化
- **仅包含必要字段**：只包含API请求和响应所需的字段
- **类型安全**：使用TypeScript接口定义，确保类型安全
- **命名一致**：与API文档保持一致的命名规范

### 4.2 核心DTO定义

```typescript
// src/application/dtos/index.ts

/**
 * 思维片段DTO
 */
export interface ThoughtDto {
  /**
   * 思维片段ID
   */
  id: string;
  /**
   * 思维片段内容
   */
  content: string;
  /**
   * 元数据
   */
  metadata?: Record<string, any>;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 创建时间
   */
  createdAt: Date;
  /**
   * 更新时间
   */
  updatedAt: Date;
}

/**
 * 认知概念DTO
 */
export interface CognitiveConceptDto {
  /**
   * 概念ID
   */
  id: string;
  /**
   * 语义标识
   */
  semanticIdentity: string;
  /**
   * 抽象级别
   */
  abstractionLevel: number;
  /**
   * 置信度评分
   */
  confidenceScore: number;
  /**
   * 概念描述
   */
  description: string;
  /**
   * 创建时间
   */
  createdAt: Date;
  /**
   * 更新时间
   */
  updatedAt: Date;
}

/**
 * 认知关系DTO
 */
export interface CognitiveRelationDto {
  /**
   * 关系ID
   */
  id: string;
  /**
   * 源概念ID
   */
  sourceConceptId: string;
  /**
   * 目标概念ID
   */
  targetConceptId: string;
  /**
   * 关系类型
   */
  relationType: string;
  /**
   * 置信度评分
   */
  confidenceScore: number;
  /**
   * 创建时间
   */
  createdAt: Date;
  /**
   * 更新时间
   */
  updatedAt: Date;
}

/**
 * 认知模型DTO
 */
export interface UserCognitiveModelDto {
  /**
   * 模型ID
   */
  id: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 概念列表
   */
  concepts: CognitiveConceptDto[];
  /**
   * 关系列表
   */
  relations: CognitiveRelationDto[];
  /**
   * 演化历史
   */
  evolutionHistory: EvolutionHistoryDto[];
  /**
   * 创建时间
   */
  createdAt: Date;
  /**
   * 更新时间
   */
  updatedAt: Date;
}

/**
 * 演化历史DTO
 */
export interface EvolutionHistoryDto {
  /**
   * 时间戳
   */
  timestamp: Date;
  /**
   * 变更类型
   */
  changeType: 'add' | 'update' | 'remove';
  /**
   * 概念ID（可选）
   */
  conceptId?: string;
  /**
   * 关系ID（可选）
   */
  relationId?: string;
  /**
   * 变更描述
   */
  description: string;
}

/**
 * 认知建议DTO
 */
export interface CognitiveProposalDto {
  /**
   * 建议ID
   */
  id: string;
  /**
   * 思维片段ID
   */
  thoughtId: string;
  /**
   * 概念候选列表
   */
  concepts: ConceptCandidateDto[];
  /**
   * 关系候选列表
   */
  relations: RelationCandidateDto[];
  /**
   * 整体置信度
   */
  confidence: number;
  /**
   * 推理过程
   */
  reasoningTrace: string[];
  /**
   * 创建时间
   */
  createdAt: Date;
}

/**
 * 概念候选DTO
 */
export interface ConceptCandidateDto {
  /**
   * 语义标识
   */
  semanticIdentity: string;
  /**
   * 抽象级别
   */
  abstractionLevel: number;
  /**
   * 置信度评分
   */
  confidenceScore: number;
  /**
   * 概念描述
   */
  description: string;
}

/**
 * 关系候选DTO
 */
export interface RelationCandidateDto {
  /**
   * 源概念语义标识
   */
  sourceSemanticIdentity: string;
  /**
   * 目标概念语义标识
   */
  targetSemanticIdentity: string;
  /**
   * 关系类型
   */
  relationType: string;
  /**
   * 置信度评分
   */
  confidenceScore: number;
}

/**
 * 认知洞察DTO
 */
export interface CognitiveInsightDto {
  /**
   * 洞察ID
   */
  id: string;
  /**
   * 认知模型ID
   */
  modelId: string;
  /**
   * 核心主题
   */
  coreThemes: string[];
  /**
   * 思维盲点
   */
  blindSpots: string[];
  /**
   * 概念空洞
   */
  conceptGaps: string[];
  /**
   * 结构摘要
   */
  structureSummary: string;
  /**
   * 创建时间
   */
  createdAt: Date;
}
```

## 5. 工作流框架实现

### 5.1 工作流核心接口

```typescript
// src/application/workflow/index.ts

/**
 * 工作流接口，定义了工作流的执行方法
 * @template I 输入类型
 * @template O 输出类型
 */
export interface Workflow<I, O> {
  /**
   * 执行工作流
   * @param input 输入数据
   * @returns 输出数据
   */
  execute(input: I): Promise<O>;
}

/**
 * 工作流步骤接口，定义了工作流步骤的执行方法
 * @template I 输入类型
 * @template O 输出类型
 */
export interface WorkflowStep<I, O> {
  /**
   * 执行工作流步骤
   * @param input 输入数据
   * @returns 输出数据
   */
  execute(input: I): Promise<O>;
}

/**
 * 工作流上下文接口，用于在工作流步骤之间传递数据
 */
export interface WorkflowContext {
  /**
   * 工作流ID
   */
  workflowId: string;
  /**
   * 执行ID
   */
  executionId: string;
  /**
   * 开始时间
   */
  startTime: Date;
  /**
   * 上下文数据
   */
  data: Record<string, any>;
}
```

### 5.2 线性工作流实现

```typescript
// src/application/workflow/LinearWorkflow.ts
import { Workflow, WorkflowStep, WorkflowContext } from './index';

/**
 * 线性工作流实现，按照顺序执行工作流步骤
 * @template I 输入类型
 * @template O 输出类型
 */
export class LinearWorkflow<I, O> implements Workflow<I, O> {
  /**
   * 工作流步骤列表
   */
  private steps: WorkflowStep<any, any>[] = [];

  /**
   * 构造函数
   * @param steps 工作流步骤列表
   */
  constructor(...steps: WorkflowStep<any, any>[]) {
    this.steps = steps;
  }

  /**
   * 执行工作流
   */
  async execute(input: I): Promise<O> {
    // 创建工作流上下文
    const context: WorkflowContext = {
      workflowId: this.constructor.name,
      executionId: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      data: {}
    };

    // 执行工作流步骤
    let result: any = input;
    for (const step of this.steps) {
      result = await step.execute(result);
    }

    return result as O;
  }
}
```

### 5.3 思维处理工作流实现

```typescript
// src/application/workflow/ThoughtProcessingWorkflow.ts
import { LinearWorkflow } from './LinearWorkflow';
import { WorkflowStep } from './index';
import { ThoughtDto, CognitiveInsightDto } from '../dtos';

/**
 * 思维处理工作流，包含多个步骤
 */
export class ThoughtProcessingWorkflow extends LinearWorkflow<ThoughtDto, CognitiveInsightDto> {
  /**
   * 构造函数
   * @param ingestStep 摄入思维片段步骤
   * @param generateProposalStep 生成认知建议步骤
   * @param updateModelStep 更新认知模型步骤
   * @param generateInsightStep 生成认知洞察步骤
   */
  constructor(
    ingestStep: WorkflowStep<ThoughtDto, string>,
    generateProposalStep: WorkflowStep<string, string>,
    updateModelStep: WorkflowStep<string, string>,
    generateInsightStep: WorkflowStep<string, CognitiveInsightDto>
  ) {
    super(
      ingestStep,
      generateProposalStep,
      updateModelStep,
      generateInsightStep
    );
  }
}
```

## 6. 单元测试设计

### 6.1 仓库接口测试

```typescript
// src/domain/interfaces/__tests__/BaseRepository.test.ts
import { BaseRepository } from '../BaseRepository';
import { BaseEntity } from '../../entities/BaseEntity';

// 模拟实体类
class TestEntity extends BaseEntity<{ id: string }> {
  constructor(
    id: string,
    public readonly name: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, createdAt, updatedAt);
  }
}

// 模拟仓库实现
class MockRepository implements BaseRepository<TestEntity, string> {
  private entities: Map<string, TestEntity> = new Map();

  async save(entity: TestEntity): Promise<TestEntity> {
    this.entities.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<TestEntity | null> {
    return this.entities.get(id) || null;
  }

  async findAll(): Promise<TestEntity[]> {
    return Array.from(this.entities.values());
  }

  async delete(entity: TestEntity): Promise<boolean> {
    return this.entities.delete(entity.id);
  }

  async deleteById(id: string): Promise<boolean> {
    return this.entities.delete(id);
  }

  async count(): Promise<number> {
    return this.entities.size;
  }
}

describe('BaseRepository', () => {
  let repository: BaseRepository<TestEntity, string>;

  beforeEach(() => {
    repository = new MockRepository();
  });

  it('should save an entity', async () => {
    const entity = new TestEntity('1', 'Test Entity');
    const savedEntity = await repository.save(entity);
    
    expect(savedEntity).toBeDefined();
    expect(savedEntity.id).toBe('1');
    expect(savedEntity.name).toBe('Test Entity');
  });

  it('should find an entity by id', async () => {
    const entity = new TestEntity('1', 'Test Entity');
    await repository.save(entity);
    
    const foundEntity = await repository.findById('1');
    
    expect(foundEntity).toBeDefined();
    expect(foundEntity?.id).toBe('1');
  });

  it('should return null for non-existent entity', async () => {
    const foundEntity = await repository.findById('non-existent-id');
    
    expect(foundEntity).toBeNull();
  });

  it('should find all entities', async () => {
    await repository.save(new TestEntity('1', 'Test Entity 1'));
    await repository.save(new TestEntity('2', 'Test Entity 2'));
    
    const entities = await repository.findAll();
    
    expect(entities).toHaveLength(2);
  });

  it('should delete an entity', async () => {
    const entity = new TestEntity('1', 'Test Entity');
    await repository.save(entity);
    
    const result = await repository.delete(entity);
    const foundEntity = await repository.findById('1');
    
    expect(result).toBe(true);
    expect(foundEntity).toBeNull();
  });

  it('should delete an entity by id', async () => {
    await repository.save(new TestEntity('1', 'Test Entity'));
    
    const result = await repository.deleteById('1');
    const foundEntity = await repository.findById('1');
    
    expect(result).toBe(true);
    expect(foundEntity).toBeNull();
  });

  it('should count entities', async () => {
    await repository.save(new TestEntity('1', 'Test Entity 1'));
    await repository.save(new TestEntity('2', 'Test Entity 2'));
    
    const count = await repository.count();
    
    expect(count).toBe(2);
  });
});
```

### 6.2 工作流测试

```typescript
// src/application/workflow/__tests__/LinearWorkflow.test.ts
import { LinearWorkflow, WorkflowStep } from '../index';

describe('LinearWorkflow', () => {
  it('should execute workflow steps in order', async () => {
    // 模拟工作流步骤
    const step1: WorkflowStep<number, number> = {
      execute: jest.fn((input) => Promise.resolve(input + 1))
    };
    
    const step2: WorkflowStep<number, number> = {
      execute: jest.fn((input) => Promise.resolve(input * 2))
    };
    
    const step3: WorkflowStep<number, string> = {
      execute: jest.fn((input) => Promise.resolve(`Result: ${input}`))
    };
    
    // 创建工作流
    const workflow = new LinearWorkflow(step1, step2, step3);
    
    // 执行工作流
    const result = await workflow.execute(5);
    
    // 验证结果
    expect(result).toBe('Result: 12');
    expect(step1.execute).toHaveBeenCalledWith(5);
    expect(step2.execute).toHaveBeenCalledWith(6);
    expect(step3.execute).toHaveBeenCalledWith(12);
  });
  
  it('should handle errors in workflow steps', async () => {
    // 模拟工作流步骤，其中step2会抛出错误
    const step1: WorkflowStep<number, number> = {
      execute: jest.fn((input) => Promise.resolve(input + 1))
    };
    
    const step2: WorkflowStep<number, number> = {
      execute: jest.fn(() => Promise.reject(new Error('Step 2 failed')))
    };
    
    const step3: WorkflowStep<number, string> = {
      execute: jest.fn((input) => Promise.resolve(`Result: ${input}`))
    };
    
    // 创建工作流
    const workflow = new LinearWorkflow(step1, step2, step3);
    
    // 执行工作流并验证是否抛出错误
    await expect(workflow.execute(5)).rejects.toThrow('Step 2 failed');
    expect(step1.execute).toHaveBeenCalled();
    expect(step2.execute).toHaveBeenCalled();
    expect(step3.execute).not.toHaveBeenCalled();
  });
});
```

## 7. 总结

Day 11的核心任务是设计和实现仓库接口，这是Application层和Domain层之间的重要桥梁。通过今天的开发，我们完成了以下工作：

1. 设计了基础仓库接口，定义了所有仓库必须实现的通用方法
2. 实现了核心仓库接口，包括思维片段、认知模型、认知建议和认知洞察仓库
3. 实现了基础仓库实现类，提供了通用方法的默认实现
4. 设计了完整的数据传输对象体系，用于API请求和响应
5. 实现了工作流框架，支持线性工作流的执行
6. 编写了单元测试，验证仓库接口和工作流的正确性

今天的实现遵循了Clean Architecture和DDD原则，确保了代码的可维护性、可扩展性和可测试性。我们使用了依赖注入模式，将仓库接口与具体实现分离，使得系统更容易测试和扩展。

在后续的开发中，我们将继续实现其他Use Case，并将仓库接口与具体的数据库实现结合起来，构建完整的应用系统。