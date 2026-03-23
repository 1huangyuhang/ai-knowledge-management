# Day 03: 第一阶段 - 系统地基期 - Week 1 - 第03天 代码实现

## 领域对象定义

### 1. 认知模型核心对象

```typescript
// src/domain/entities/UserCognitiveModel.ts

/**
 * 用户认知模型
 */
export class UserCognitiveModel {
  /**
   * 构造函数
   * @param id 模型ID
   * @param userId 用户ID
   * @param concepts 认知概念集合
   * @param relations 认知关系集合
   * @param createdAt 创建时间
   * @param updatedAt 更新时间
   */
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly concepts: Map<string, CognitiveConcept>,
    public readonly relations: Map<string, CognitiveRelation>,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
```

### 2. 认知概念

```typescript
// src/domain/entities/CognitiveConcept.ts

/**
 * 认知概念类型
 */
export enum ConceptType {
  /** 具体实物 */
  CONCRETE = 'concrete',
  /** 抽象概念 */
  ABSTRACT = 'abstract',
  /** 过程 */
  PROCESS = 'process',
  /** 属性 */
  PROPERTY = 'property',
  /** 关系类型 */
  RELATION_TYPE = 'relation_type'
}

/**
 * 认知概念
 */
export class CognitiveConcept {
  /**
   * 构造函数
   * @param id 概念ID
   * @param name 概念名称
   * @param type 概念类型
   * @param description 概念描述
   * @param importance 重要性（0-1）
   * @param certainty 确定性（0-1）
   * @param metadata 元数据
   * @param createdAt 创建时间
   * @param updatedAt 更新时间
   */
  constructor(
    public readonly id: string,
    public name: string,
    public type: ConceptType,
    public description: string,
    public importance: number,
    public certainty: number,
    public metadata: Record<string, any>,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
```

### 3. 认知关系

```typescript
// src/domain/entities/CognitiveRelation.ts

/**
 * 认知关系类型
 */
export enum RelationType {
  /** 父子关系 */
  PARENT_CHILD = 'parent_child',
  /** 关联关系 */
  ASSOCIATION = 'association',
  /** 因果关系 */
  CAUSAL = 'causal',
  /** 相似关系 */
  SIMILARITY = 'similarity',
  /** 对比关系 */
  CONTRAST = 'contrast',
  /** 部分整体关系 */
  PART_WHOLE = 'part_whole',
  /** 属性关系 */
  PROPERTY = 'property',
  /** 实例关系 */
  INSTANCE = 'instance'
}

/**
 * 认知关系
 */
export class CognitiveRelation {
  /**
   * 构造函数
   * @param id 关系ID
   * @param sourceId 源概念ID
   * @param targetId 目标概念ID
   * @param type 关系类型
   * @param strength 关系强度（0-1）
   * @param description 关系描述
   * @param certainty 确定性（0-1）
   * @param metadata 元数据
   * @param createdAt 创建时间
   * @param updatedAt 更新时间
   */
  constructor(
    public readonly id: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public type: RelationType,
    public strength: number,
    public description: string,
    public certainty: number,
    public metadata: Record<string, any>,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
```

### 4. 思维片段

```typescript
// src/domain/entities/ThoughtFragment.ts

/**
 * 思维片段
 */
export class ThoughtFragment {
  /**
   * 构造函数
   * @param props 思维片段属性
   */
  constructor(props: {
    id?: string;
    content: string;
    tags: string[];
    metadata: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    const now = new Date();
    this.id = props.id || crypto.randomUUID();
    this.content = props.content;
    this.tags = props.tags;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt || now;
    this.updatedAt = props.updatedAt || now;
  }

  public readonly id: string;
  public content: string;
  public tags: string[];
  public metadata: Record<string, any>;
  public readonly createdAt: Date;
  public updatedAt: Date;

  /**
   * 更新思维片段
   * @param updates 更新内容
   */
  public update(updates: {
    content?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }): void {
    if (updates.content !== undefined) {
      this.content = updates.content;
    }
    if (updates.tags !== undefined) {
      this.tags = updates.tags;
    }
    if (updates.metadata !== undefined) {
      this.metadata = {
        ...this.metadata,
        ...updates.metadata
      };
    }
    this.updatedAt = new Date();
  }
}
```

### 5. 认知洞察

```typescript
// src/domain/entities/CognitiveInsight.ts

/**
 * 认知洞察类型
 */
export enum InsightType {
  /** 概念缺失 */
  CONCEPT_GAP = 'concept_gap',
  /** 关系缺失 */
  RELATION_GAP = 'relation_gap',
  /** 矛盾冲突 */
  CONTRADICTION = 'contradiction',
  /** 概念冗余 */
  REDUNDANCY = 'redundancy',
  /** 结构优化建议 */
  STRUCTURE_OPTIMIZATION = 'structure_optimization',
  /** 新关系发现 */
  NEW_RELATION = 'new_relation'
}

/**
 * 认知洞察
 */
export class CognitiveInsight {
  /**
   * 构造函数
   * @param id 洞察ID
   * @param modelId 模型ID
   * @param type 洞察类型
   * @param description 洞察描述
   * @param severity 严重程度（0-1）
   * @param confidence 置信度（0-1）
   * @param relatedConcepts 相关概念ID列表
   * @param relatedRelations 相关关系ID列表
   * @param metadata 元数据
   * @param createdAt 创建时间
   */
  constructor(
    public readonly id: string,
    public readonly modelId: string,
    public type: InsightType,
    public description: string,
    public severity: number,
    public confidence: number,
    public relatedConcepts: string[],
    public relatedRelations: string[],
    public metadata: Record<string, any>,
    public readonly createdAt: Date
  ) {}
}
```

### 6. 文件输入

```typescript
// src/domain/entities/FileInput.ts

/**
 * 文件输入
 */
export class FileInput {
  /**
   * 构造函数
   * @param props 文件输入属性
   */
  constructor(props: {
    id?: string;
    name: string;
    type: string;
    size: number;
    content: string;
    metadata: Record<string, any>;
    createdAt?: Date;
  }) {
    const now = new Date();
    this.id = props.id || crypto.randomUUID();
    this.name = props.name;
    this.type = props.type;
    this.size = props.size;
    this.content = props.content;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt || now;
  }

  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public readonly size: number;
  public readonly content: string;
  public readonly metadata: Record<string, any>;
  public readonly createdAt: Date;
}
```

### 7. 语音输入

```typescript
// src/domain/entities/SpeechInput.ts

/**
 * 语音输入
 */
export class SpeechInput {
  /**
   * 构造函数
   * @param props 语音输入属性
   */
  constructor(props: {
    id?: string;
    audioUrl: string;
    transcription: string;
    confidence: number;
    language: string;
    duration: number;
    metadata: Record<string, any>;
    createdAt?: Date;
  }) {
    const now = new Date();
    this.id = props.id || crypto.randomUUID();
    this.audioUrl = props.audioUrl;
    this.transcription = props.transcription;
    this.confidence = props.confidence;
    this.language = props.language;
    this.duration = props.duration;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt || now;
  }

  public readonly id: string;
  public readonly audioUrl: string;
  public readonly transcription: string;
  public readonly confidence: number;
  public readonly language: string;
  public readonly duration: number;
  public readonly metadata: Record<string, any>;
  public readonly createdAt: Date;
}
```

### 8. AI任务

```typescript
// src/domain/entities/AITask.ts

/**
 * AI任务状态
 */
export enum AITaskStatus {
  /** 待执行 */
  PENDING = 'pending',
  /** 执行中 */
  RUNNING = 'running',
  /** 成功 */
  SUCCESS = 'success',
  /** 失败 */
  FAILED = 'failed',
  /** 取消 */
  CANCELLED = 'cancelled'
}

/**
 * AI任务优先级
 */
export enum AITaskPriority {
  /** 低优先级 */
  LOW = 'low',
  /** 中优先级 */
  MEDIUM = 'medium',
  /** 高优先级 */
  HIGH = 'high',
  /** 紧急 */
  URGENT = 'urgent'
}

/**
 * AI任务
 */
export class AITask {
  /**
   * 构造函数
   * @param props AI任务属性
   */
  constructor(props: {
    id?: string;
    type: string;
    status: AITaskStatus;
    priority: AITaskPriority;
    input: any;
    output?: any;
    error?: any;
    createdAt?: Date;
    updatedAt?: Date;
    completedAt?: Date;
  }) {
    const now = new Date();
    this.id = props.id || crypto.randomUUID();
    this.type = props.type;
    this.status = props.status;
    this.priority = props.priority;
    this.input = props.input;
    this.output = props.output;
    this.error = props.error;
    this.createdAt = props.createdAt || now;
    this.updatedAt = props.updatedAt || now;
    this.completedAt = props.completedAt;
  }

  public readonly id: string;
  public readonly type: string;
  public status: AITaskStatus;
  public priority: AITaskPriority;
  public input: any;
  public output?: any;
  public error?: any;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public completedAt?: Date;

  /**
   * 更新任务状态为运行中
   */
  public start(): void {
    this.status = AITaskStatus.RUNNING;
    this.updatedAt = new Date();
  }

  /**
   * 更新任务状态为成功
   * @param output 任务输出
   */
  public succeed(output: any): void {
    this.status = AITaskStatus.SUCCESS;
    this.output = output;
    this.completedAt = new Date();
    this.updatedAt = this.completedAt;
  }

  /**
   * 更新任务状态为失败
   * @param error 错误信息
   */
  public fail(error: any): void {
    this.status = AITaskStatus.FAILED;
    this.error = error;
    this.completedAt = new Date();
    this.updatedAt = this.completedAt;
  }

  /**
   * 更新任务状态为取消
   */
  public cancel(): void {
    this.status = AITaskStatus.CANCELLED;
    this.updatedAt = new Date();
  }
}
```