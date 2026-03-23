# Day 06: Domain层空代码实现 - 代码实现文档（第一部分）

## 文档说明

本文件是 `06-domain-layer-technical-implementation.md` 的第一部分，包含值对象和实体实现。
- **原文件路径**：`week-1-understanding/06-domain-layer-technical-implementation.md`
- **拆分原因**：文件过长，超出AI最大上下文限制
- **拆分点**：按功能模块拆分为值对象和实体实现

## 1. 值对象实现

### 1.1 RelationType 枚举

**实现文件**：`src/domain/value-objects/RelationType.ts`

```typescript
/**
 * 关系类型枚举
 */
export enum RelationType {
  /**
   * 依赖关系：A依赖于B
   */
  DEPENDS_ON = 'depends_on',
  
  /**
   * 泛化关系：A是B的泛化（A包含B）
   */
  GENERALIZES = 'generalizes',
  
  /**
   * 矛盾关系：A与B矛盾
   */
  CONTRADICTS = 'contradicts',
  
  /**
   * 是一种关系：A是B的一种
   */
  IS_A = 'is_a',
  
  /**
   * 相关关系：A与B相关
   */
  RELATED_TO = 'related_to'
}
```

### 1.2 EvolutionHistory 值对象

**实现文件**：`src/domain/value-objects/EvolutionHistory.ts`

```typescript
/**
 * 演化历史值对象
 */
export interface EvolutionHistory {
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
 * 演化历史实现类
 */
export class EvolutionHistoryImpl implements EvolutionHistory {
  constructor(
    public readonly timestamp: Date,
    public readonly changeType: 'add' | 'update' | 'remove',
    public readonly description: string,
    public readonly conceptId?: string,
    public readonly relationId?: string
  ) {}
  
  /**
   * 创建演化历史实例的工厂方法
   */
  public static create(
    changeType: 'add' | 'update' | 'remove',
    description: string,
    conceptId?: string,
    relationId?: string
  ): EvolutionHistory {
    return new EvolutionHistoryImpl(
      new Date(),
      changeType,
      description,
      conceptId,
      relationId
    );
  }
}
```

### 1.3 ConceptCandidate 值对象

**实现文件**：`src/domain/value-objects/ConceptCandidate.ts`

```typescript
/**
 * 概念候选值对象
 */
export interface ConceptCandidate {
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
 * 概念候选实现类
 */
export class ConceptCandidateImpl implements ConceptCandidate {
  constructor(
    public readonly semanticIdentity: string,
    public readonly abstractionLevel: number,
    public readonly confidenceScore: number,
    public readonly description: string
  ) {
    // 验证抽象级别范围
    if (abstractionLevel < 1 || abstractionLevel > 5) {
      throw new Error('Abstraction level must be between 1 and 5');
    }
    
    // 验证置信度范围
    if (confidenceScore < 0 || confidenceScore > 1) {
      throw new Error('Confidence score must be between 0 and 1');
    }
  }
  
  /**
   * 创建概念候选实例的工厂方法
   */
  public static create(
    semanticIdentity: string,
    abstractionLevel: number,
    confidenceScore: number,
    description: string
  ): ConceptCandidate {
    return new ConceptCandidateImpl(
      semanticIdentity,
      abstractionLevel,
      confidenceScore,
      description
    );
  }
  
  /**
   * 更新置信度，返回新实例（不可变性）
   */
  public withConfidenceScore(confidenceScore: number): ConceptCandidate {
    return new ConceptCandidateImpl(
      this.semanticIdentity,
      this.abstractionLevel,
      confidenceScore,
      this.description
    );
  }
}
```

### 1.4 RelationCandidate 值对象

**实现文件**：`src/domain/value-objects/RelationCandidate.ts`

```typescript
import { RelationType } from './RelationType';

/**
 * 关系候选值对象
 */
export interface RelationCandidate {
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
  relationType: RelationType;
  
  /**
   * 置信度评分
   */
  confidenceScore: number;
}

/**
 * 关系候选实现类
 */
export class RelationCandidateImpl implements RelationCandidate {
  constructor(
    public readonly sourceSemanticIdentity: string,
    public readonly targetSemanticIdentity: string,
    public readonly relationType: RelationType,
    public readonly confidenceScore: number
  ) {
    // 验证源和目标概念不同
    if (sourceSemanticIdentity === targetSemanticIdentity) {
      throw new Error('Source and target concept identities cannot be the same');
    }
    
    // 验证置信度范围
    if (confidenceScore < 0 || confidenceScore > 1) {
      throw new Error('Confidence score must be between 0 and 1');
    }
  }
  
  /**
   * 创建关系候选实例的工厂方法
   */
  public static create(
    sourceSemanticIdentity: string,
    targetSemanticIdentity: string,
    relationType: RelationType,
    confidenceScore: number
  ): RelationCandidate {
    return new RelationCandidateImpl(
      sourceSemanticIdentity,
      targetSemanticIdentity,
      relationType,
      confidenceScore
    );
  }
  
  /**
   * 更新置信度，返回新实例（不可变性）
   */
  public withConfidenceScore(confidenceScore: number): RelationCandidate {
    return new RelationCandidateImpl(
      this.sourceSemanticIdentity,
      this.targetSemanticIdentity,
      this.relationType,
      confidenceScore
    );
  }
}
```

## 2. 实体实现

### 2.1 CognitiveConcept 实体

**实现文件**：`src/domain/entities/CognitiveConcept.ts`

```typescript
/**
 * 认知概念实体
 */
export interface CognitiveConcept {
  /**
   * 概念唯一标识
   */
  id: string;
  
  /**
   * 语义标识
   */
  semanticIdentity: string;
  
  /**
   * 抽象级别（1-5）
   */
  abstractionLevel: number;
  
  /**
   * 置信度评分（0-1）
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
 * 认知概念实现类
 */
export class CognitiveConceptImpl implements CognitiveConcept {
  constructor(
    public readonly id: string,
    public readonly semanticIdentity: string,
    public readonly abstractionLevel: number,
    public readonly confidenceScore: number,
    public readonly description: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    // 验证抽象级别范围
    if (abstractionLevel < 1 || abstractionLevel > 5) {
      throw new Error('Abstraction level must be between 1 and 5');
    }
    
    // 验证置信度范围
    if (confidenceScore < 0 || confidenceScore > 1) {
      throw new Error('Confidence score must be between 0 and 1');
    }
  }
  
  /**
   * 创建认知概念实例的工厂方法
   */
  public static create(
    id: string,
    semanticIdentity: string,
    abstractionLevel: number,
    confidenceScore: number,
    description: string
  ): CognitiveConcept {
    return new CognitiveConceptImpl(
      id,
      semanticIdentity,
      abstractionLevel,
      confidenceScore,
      description
    );
  }
  
  /**
   * 更新概念，返回新实例（不可变性）
   */
  public update(
    updates: Partial<Omit<CognitiveConcept, 'id' | 'createdAt' | 'updatedAt'>>
  ): CognitiveConcept {
    return new CognitiveConceptImpl(
      this.id,
      updates.semanticIdentity || this.semanticIdentity,
      updates.abstractionLevel || this.abstractionLevel,
      updates.confidenceScore || this.confidenceScore,
      updates.description || this.description,
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 更新置信度，返回新实例（不可变性）
   */
  public withConfidenceScore(confidenceScore: number): CognitiveConcept {
    return this.update({ confidenceScore });
  }
  
  /**
   * 更新描述，返回新实例（不可变性）
   */
  public withDescription(description: string): CognitiveConcept {
    return this.update({ description });
  }
}
```

### 2.2 CognitiveRelation 实体

**实现文件**：`src/domain/entities/CognitiveRelation.ts`

```typescript
import { RelationType } from '../value-objects/RelationType';

/**
 * 认知关系实体
 */
export interface CognitiveRelation {
  /**
   * 关系唯一标识
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
  relationType: RelationType;
  
  /**
   * 置信度评分（0-1）
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
 * 认知关系实现类
 */
export class CognitiveRelationImpl implements CognitiveRelation {
  constructor(
    public readonly id: string,
    public readonly sourceConceptId: string,
    public readonly targetConceptId: string,
    public readonly relationType: RelationType,
    public readonly confidenceScore: number,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    // 验证源和目标概念不同
    if (sourceConceptId === targetConceptId) {
      throw new Error('Source and target concept IDs cannot be the same');
    }
    
    // 验证置信度范围
    if (confidenceScore < 0 || confidenceScore > 1) {
      throw new Error('Confidence score must be between 0 and 1');
    }
  }
  
  /**
   * 创建认知关系实例的工厂方法
   */
  public static create(
    id: string,
    sourceConceptId: string,
    targetConceptId: string,
    relationType: RelationType,
    confidenceScore: number
  ): CognitiveRelation {
    return new CognitiveRelationImpl(
      id,
      sourceConceptId,
      targetConceptId,
      relationType,
      confidenceScore
    );
  }
  
  /**
   * 更新关系，返回新实例（不可变性）
   */
  public update(
    updates: Partial<Omit<CognitiveRelation, 'id' | 'createdAt' | 'updatedAt'>>
  ): CognitiveRelation {
    return new CognitiveRelationImpl(
      this.id,
      updates.sourceConceptId || this.sourceConceptId,
      updates.targetConceptId || this.targetConceptId,
      updates.relationType || this.relationType,
      updates.confidenceScore || this.confidenceScore,
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 更新置信度，返回新实例（不可变性）
   */
  public withConfidenceScore(confidenceScore: number): CognitiveRelation {
    return this.update({ confidenceScore });
  }
}
```

### 2.3 ThoughtFragment 实体

**实现文件**：`src/domain/entities/ThoughtFragment.ts`

```typescript
/**
 * 思维片段实体
 */
export interface ThoughtFragment {
  /**
   * 思维片段唯一标识
   */
  id: string;
  
  /**
   * 思维片段内容
   */
  content: string;
  
  /**
   * 元数据
   */
  metadata: Record<string, any>;
  
  /**
   * 用户ID
   */
  userId: string;
  
  /**
   * 创建时间
   */
  createdAt: Date;
}

/**
 * 思维片段实现类
 */
export class ThoughtFragmentImpl implements ThoughtFragment {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly metadata: Record<string, any>,
    public readonly userId: string,
    public readonly createdAt: Date = new Date()
  ) {}
  
  /**
   * 创建思维片段实例的工厂方法
   */
  public static create(
    id: string,
    content: string,
    userId: string,
    metadata: Record<string, any> = {}
  ): ThoughtFragment {
    return new ThoughtFragmentImpl(
      id,
      content,
      metadata,
      userId
    );
  }
}
```

### 2.4 CognitiveProposal 实体

**实现文件**：`src/domain/entities/CognitiveProposal.ts`

```typescript
import { ConceptCandidate } from '../value-objects/ConceptCandidate';
import { RelationCandidate } from '../value-objects/RelationCandidate';

/**
 * 认知建议实体
 */
export interface CognitiveProposal {
  /**
   * 建议唯一标识
   */
  id: string;
  
  /**
   * 关联的思维片段ID
   */
  thoughtId: string;
  
  /**
   * 概念候选列表
   */
  concepts: ConceptCandidate[];
  
  /**
   * 关系候选列表
   */
  relations: RelationCandidate[];
  
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
 * 认知建议实现类
 */
export class CognitiveProposalImpl implements CognitiveProposal {
  constructor(
    public readonly id: string,
    public readonly thoughtId: string,
    public readonly concepts: ConceptCandidate[],
    public readonly relations: RelationCandidate[],
    public readonly confidence: number,
    public readonly reasoningTrace: string[],
    public readonly createdAt: Date = new Date()
  ) {
    // 验证置信度范围
    if (confidence < 0 || confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
    
    // 验证思维片段ID不能为空
    if (!thoughtId) {
      throw new Error('Thought ID cannot be empty');
    }
  }
  
  /**
   * 创建认知建议实例的工厂方法
   */
  public static create(
    id: string,
    thoughtId: string,
    concepts: ConceptCandidate[],
    relations: RelationCandidate[],
    confidence: number,
    reasoningTrace: string[] = []
  ): CognitiveProposal {
    return new CognitiveProposalImpl(
      id,
      thoughtId,
      concepts,
      relations,
      confidence,
      reasoningTrace
    );
  }
}
```

### 2.5 CognitiveInsight 实体

**实现文件**：`src/domain/entities/CognitiveInsight.ts`

```typescript
/**
 * 认知洞察实体
 */
export interface CognitiveInsight {
  /**
   * 洞察唯一标识
   */
  id: string;
  
  /**
   * 关联的认知模型ID
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
   * 认知结构摘要
   */
  structureSummary: string;
  
  /**
   * 创建时间
   */
  createdAt: Date;
}

/**
 * 认知洞察实现类
 */
export class CognitiveInsightImpl implements CognitiveInsight {
  constructor(
    public readonly id: string,
    public readonly modelId: string,
    public readonly coreThemes: string[],
    public readonly blindSpots: string[],
    public readonly conceptGaps: string[],
    public readonly structureSummary: string,
    public readonly createdAt: Date = new Date()
  ) {}
  
  /**
   * 创建认知洞察实例的工厂方法
   */
  public static create(
    id: string,
    modelId: string,
    coreThemes: string[],
    blindSpots: string[] = [],
    conceptGaps: string[] = [],
    structureSummary: string = ''
  ): CognitiveInsight {
    return new CognitiveInsightImpl(
      id,
      modelId,
      coreThemes,
      blindSpots,
      conceptGaps,
      structureSummary
    );
  }
}
```

### 2.6 UserCognitiveModel 实体

**实现文件**：`src/domain/entities/UserCognitiveModel.ts`

```typescript
import { CognitiveConcept } from './CognitiveConcept';
import { CognitiveRelation } from './CognitiveRelation';
import { EvolutionHistory } from '../value-objects/EvolutionHistory';
import { CognitiveProposal } from './CognitiveProposal';
import { EvolutionHistoryImpl } from '../value-objects/EvolutionHistory';

/**
 * 用户认知模型实体
 */
export interface UserCognitiveModel {
  /**
   * 模型唯一标识
   */
  id: string;
  
  /**
   * 用户ID
   */
  userId: string;
  
  /**
   * 概念集合
   */
  concepts: CognitiveConcept[];
  
  /**
   * 关系集合
   */
  relations: CognitiveRelation[];
  
  /**
   * 演化历史
   */
  evolutionHistory: EvolutionHistory[];
  
  /**
   * 创建时间
   */
  createdAt: Date;
  
  /**
   * 更新时间
   */
  updatedAt: Date;
  
  /**
   * 添加概念
   * @param concept 要添加的概念
   */
  addConcept(concept: CognitiveConcept): UserCognitiveModel;
  
  /**
   * 移除概念
   * @param conceptId 要移除的概念ID
   */
  removeConcept(conceptId: string): UserCognitiveModel;
  
  /**
   * 更新概念
   * @param concept 要更新的概念
   */
  updateConcept(concept: CognitiveConcept): UserCognitiveModel;
  
  /**
   * 添加关系
   * @param relation 要添加的关系
   */
  addRelation(relation: CognitiveRelation): UserCognitiveModel;
  
  /**
   * 移除关系
   * @param relationId 要移除的关系ID
   */
  removeRelation(relationId: string): UserCognitiveModel;
  
  /**
   * 更新关系
   * @param relation 要更新的关系
   */
  updateRelation(relation: CognitiveRelation): UserCognitiveModel;
  
  /**
   * 应用认知建议
   * @param proposal 认知建议
   */
  applyProposal(proposal: CognitiveProposal): UserCognitiveModel;
  
  /**
   * 查询与指定概念相关的所有关系
   * @param conceptId 概念ID
   * @returns 相关关系列表
   */
  getRelationsForConcept(conceptId: string): CognitiveRelation[];
}

/**
 * 用户认知模型实现类
 */
export class UserCognitiveModelImpl implements UserCognitiveModel {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly concepts: CognitiveConcept[] = [],
    public readonly relations: CognitiveRelation[] = [],
    public readonly evolutionHistory: EvolutionHistory[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
  
  /**
   * 创建用户认知模型实例的工厂方法
   */
  public static create(id: string, userId: string): UserCognitiveModel {
    return new UserCognitiveModelImpl(id, userId);
  }
  
  /**
   * 添加概念（不可变性）
   */
  public addConcept(concept: CognitiveConcept): UserCognitiveModel {
    // 验证概念不存在
    const existingConcept = this.concepts.find(c => c.id === concept.id);
    if (existingConcept) {
      throw new Error(`Concept with id ${concept.id} already exists`);
    }
    
    // 创建新的概念数组
    const updatedConcepts = [...this.concepts, concept];
    
    // 创建演化历史记录
    const history = EvolutionHistoryImpl.create(
      'add',
      `Added concept: ${concept.semanticIdentity}`,
      concept.id
    );
    
    // 返回新的实体实例
    return new UserCognitiveModelImpl(
      this.id,
      this.userId,
      updatedConcepts,
      this.relations,
      [...this.evolutionHistory, history],
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 移除概念（不可变性）
   */
  public removeConcept(conceptId: string): UserCognitiveModel {
    // 验证概念存在
    const existingConcept = this.concepts.find(c => c.id === conceptId);
    if (!existingConcept) {
      throw new Error(`Concept with id ${conceptId} not found`);
    }
    
    // 移除概念
    const updatedConcepts = this.concepts.filter(c => c.id !== conceptId);
    
    // 移除与该概念相关的所有关系
    const updatedRelations = this.relations.filter(
      r => r.sourceConceptId !== conceptId && r.targetConceptId !== conceptId
    );
    
    // 创建演化历史记录
    const history = EvolutionHistoryImpl.create(
      'remove',
      `Removed concept: ${existingConcept.semanticIdentity}`,
      conceptId
    );
    
    // 返回新的实体实例
    return new UserCognitiveModelImpl(
      this.id,
      this.userId,
      updatedConcepts,
      updatedRelations,
      [...this.evolutionHistory, history],
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 更新概念（不可变性）
   */
  public updateConcept(concept: CognitiveConcept): UserCognitiveModel {
    // 验证概念存在
    const existingConceptIndex = this.concepts.findIndex(c => c.id === concept.id);
    if (existingConceptIndex === -1) {
      throw new Error(`Concept with id ${concept.id} not found`);
    }
    
    // 创建新的概念数组，更新指定概念
    const updatedConcepts = [...this.concepts];
    updatedConcepts[existingConceptIndex] = concept;
    
    // 创建演化历史记录
    const history = EvolutionHistoryImpl.create(
      'update',
      `Updated concept: ${concept.semanticIdentity}`,
      concept.id
    );
    
    // 返回新的实体实例
    return new UserCognitiveModelImpl(
      this.id,
      this.userId,
      updatedConcepts,
      this.relations,
      [...this.evolutionHistory, history],
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 添加关系（不可变性）
   */
  public addRelation(relation: CognitiveRelation): UserCognitiveModel {
    // 验证关系不存在
    const existingRelation = this.relations.find(r => r.id === relation.id);
    if (existingRelation) {
      throw new Error(`Relation with id ${relation.id} already exists`);
    }
    
    // 验证源和目标概念存在
    const sourceConcept = this.concepts.find(c => c.id === relation.sourceConceptId);
    const targetConcept = this.concepts.find(c => c.id === relation.targetConceptId);
    
    if (!sourceConcept) {
      throw new Error(`Source concept with id ${relation.sourceConceptId} not found`);
    }
    
    if (!targetConcept) {
      throw new Error(`Target concept with id ${relation.targetConceptId} not found`);
    }
    
    // 创建新的关系数组
    const updatedRelations = [...this.relations, relation];
    
    // 创建演化历史记录
    const history = EvolutionHistoryImpl.create(
      'add',
      `Added relation: ${sourceConcept.semanticIdentity} ${relation.relationType} ${targetConcept.semanticIdentity}`,
      undefined,
      relation.id
    );
    
    // 返回新的实体实例
    return new UserCognitiveModelImpl(
      this.id,
      this.userId,
      this.concepts,
      updatedRelations,
      [...this.evolutionHistory, history],
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 移除关系（不可变性）
   */
  public removeRelation(relationId: string): UserCognitiveModel {
    // 验证关系存在
    const existingRelation = this.relations.find(r => r.id === relationId);
    if (!existingRelation) {
      throw new Error(`Relation with id ${relationId} not found`);
    }
    
    // 移除关系
    const updatedRelations = this.relations.filter(r => r.id !== relationId);
    
    // 创建演化历史记录
    const history = EvolutionHistoryImpl.create(
      'remove',
      `Removed relation with id ${relationId}`,
      undefined,
      relationId
    );
    
    // 返回新的实体实例
    return new UserCognitiveModelImpl(
      this.id,
      this.userId,
      this.concepts,
      updatedRelations,
      [...this.evolutionHistory, history],
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 更新关系（不可变性）
   */
  public updateRelation(relation: CognitiveRelation): UserCognitiveModel {
    // 验证关系存在
    const existingRelationIndex = this.relations.findIndex(r => r.id === relation.id);
    if (existingRelationIndex === -1) {
      throw new Error(`Relation with id ${relation.id} not found`);
    }
    
    // 更新关系
    const updatedRelations = [...this.relations];
    updatedRelations[existingRelationIndex] = relation;
    
    // 创建演化历史记录
    const history = EvolutionHistoryImpl.create(
      'update',
      `Updated relation with id ${relation.id}`,
      undefined,
      relation.id
    );
    
    // 返回新的实体实例
    return new UserCognitiveModelImpl(
      this.id,
      this.userId,
      this.concepts,
      updatedRelations,
      [...this.evolutionHistory, history],
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 应用认知建议（不可变性）
   */
  public applyProposal(proposal: CognitiveProposal): UserCognitiveModel {
    // 这里简化实现，实际应用中需要更复杂的逻辑
    // 1. 将概念候选转换为实际概念
    // 2. 将关系候选转换为实际关系
    // 3. 应用到认知模型
    
    // 简化实现：直接返回当前实例
    return this;
  }
  
  /**
   * 查询与指定概念相关的所有关系
   */
  public getRelationsForConcept(conceptId: string): CognitiveRelation[] {
    return this.relations.filter(
      r => r.sourceConceptId === conceptId || r.targetConceptId === conceptId
    );
  }
}
```