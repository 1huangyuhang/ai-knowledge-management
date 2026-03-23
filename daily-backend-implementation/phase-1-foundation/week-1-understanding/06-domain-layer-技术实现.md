# Day 06: Domain层空代码实现 - 代码实现文档

## 文档说明

本文件已被拆分为两个部分，以适应AI最大上下文限制：
- **第一部分**：`06-domain-layer-technical-implementation-1.md` - 包含值对象和实体实现
- **第二部分**：`06-domain-layer-technical-implementation-2.md` - 包含领域服务、统一导出文件和代码验证

## 内容总览

1. **值对象实现**：RelationType、EvolutionHistory、ConceptCandidate、RelationCandidate
2. **实体实现**：CognitiveConcept、CognitiveRelation、ThoughtFragment、CognitiveProposal、CognitiveInsight、UserCognitiveModel
3. **领域服务实现**：CognitiveModelService
4. **统一导出文件**：方便其他层使用Domain层的组件
5. **单元测试**：验证实体的基本功能

## 代码文件链接

- **第一部分**：[06-domain-layer-technical-implementation-1.md](06-domain-layer-technical-implementation-1.md)
- **第二部分**：[06-domain-layer-technical-implementation-2.md](06-domain-layer-technical-implementation-2.md)

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

## 3. 领域服务实现

### 3.1 CognitiveModelService 领域服务

**实现文件**：`src/domain/services/CognitiveModelService.ts`

```typescript
import { UserCognitiveModel } from '../entities/UserCognitiveModel';
import { CognitiveProposal } from '../entities/CognitiveProposal';
import { CognitiveInsight } from '../entities/CognitiveInsight';
import { CognitiveRelation } from '../entities/CognitiveRelation';
import { RelationType } from '../value-objects/RelationType';
import { CognitiveInsightImpl } from '../entities/CognitiveInsight';

/**
 * 认知模型服务接口
 */
export interface CognitiveModelService {
  /**
   * 验证认知建议的有效性
   * @param proposal 认知建议
   * @returns 是否有效
   */
  validateProposal(proposal: CognitiveProposal): boolean;
  
  /**
   * 维护认知模型的一致性
   * @param model 认知模型
   * @returns 更新后的认知模型
   */
  maintainConsistency(model: UserCognitiveModel): UserCognitiveModel;
  
  /**
   * 生成认知洞察
   * @param model 认知模型
   * @returns 认知洞察
   */
  generateInsight(model: UserCognitiveModel): CognitiveInsight;
}

/**
 * 认知模型服务实现类
 */
export class CognitiveModelServiceImpl implements CognitiveModelService {
  /**
   * 验证认知建议的有效性
   */
  public validateProposal(proposal: CognitiveProposal): boolean {
    // 1. 验证建议的置信度
    if (proposal.confidence < 0.5) {
      return false;
    }
    
    // 2. 验证建议包含至少一个概念或关系
    if (proposal.concepts.length === 0 && proposal.relations.length === 0) {
      return false;
    }
    
    // 3. 验证关系候选的源和目标概念不同
    for (const relation of proposal.relations) {
      if (relation.sourceSemanticIdentity === relation.targetSemanticIdentity) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 维护认知模型的一致性
   */
  public maintainConsistency(model: UserCognitiveModel): UserCognitiveModel {
    // 1. 检测并移除冲突关系
    const conflicts = this._detectConflicts(model.relations);
    let updatedModel = model;
    
    // 移除冲突关系
    for (const conflict of conflicts) {
      updatedModel = updatedModel.removeRelation(conflict.id);
    }
    
    // 2. 确保关系指向存在的概念
    updatedModel = this._validateRelationConcepts(updatedModel);
    
    // 3. 确保概念层次结构的正确性
    updatedModel = this._validateConceptHierarchy(updatedModel);
    
    return updatedModel;
  }
  
  /**
   * 生成认知洞察
   */
  public generateInsight(model: UserCognitiveModel): CognitiveInsight {
    // 简化实现：生成基本的认知洞察
    const coreThemes = this._extractCoreThemes(model);
    const blindSpots = this._detectBlindSpots(model);
    const conceptGaps = this._identifyConceptGaps(model);
    
    return CognitiveInsightImpl.create(
      `insight-${Date.now()}`,
      model.id,
      coreThemes,
      blindSpots,
      conceptGaps,
      `Cognitive model with ${model.concepts.length} concepts and ${model.relations.length} relations`
    );
  }
  
  /**
   * 私有方法：检测冲突关系
   */
  private _detectConflicts(relations: CognitiveRelation[]): CognitiveRelation[] {
    const conflicts: CognitiveRelation[] = [];
    const relationMap = new Map<string, CognitiveRelation[]>();
    
    // 按源和目标概念分组
    for (const relation of relations) {
      const key = `${relation.sourceConceptId}-${relation.targetConceptId}`;
      if (!relationMap.has(key)) {
        relationMap.set(key, []);
      }
      relationMap.get(key)!.push(relation);
    }
    
    // 检测冲突关系
    for (const [key, rels] of relationMap.entries()) {
      if (rels.length > 1) {
        // 存在多个关系，检测冲突类型
        const hasContradicts = rels.some(r => r.relationType === RelationType.CONTRADICTS);
        const hasOtherTypes = rels.some(r => r.relationType !== RelationType.CONTRADICTS);
        
        if (hasContradicts && hasOtherTypes) {
          // 存在矛盾关系和其他关系，移除置信度较低的关系
          const sortedRels = [...rels].sort((a, b) => b.confidenceScore - a.confidenceScore);
          // 保留置信度最高的关系，其余标记为冲突
          conflicts.push(...sortedRels.slice(1));
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * 私有方法：验证关系指向存在的概念
   */
  private _validateRelationConcepts(model: UserCognitiveModel): UserCognitiveModel {
    const conceptIds = new Set(model.concepts.map(c => c.id));
    let updatedModel = model;
    
    // 检查所有关系的源和目标概念是否存在
    for (const relation of model.relations) {
      if (!conceptIds.has(relation.sourceConceptId) || !conceptIds.has(relation.targetConceptId)) {
        // 关系指向不存在的概念，移除该关系
        updatedModel = updatedModel.removeRelation(relation.id);
      }
    }
    
    return updatedModel;
  }
  
  /**
   * 私有方法：验证概念层次结构
   */
  private _validateConceptHierarchy(model: UserCognitiveModel): UserCognitiveModel {
    // 简化实现：直接返回原模型
    // 实际实现中需要验证泛化关系不形成循环等
    return model;
  }
  
  /**
   * 私有方法：提取核心主题
   */
  private _extractCoreThemes(model: UserCognitiveModel): string[] {
    // 简化实现：返回前3个概念的语义标识
    return model.concepts
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 3)
      .map(c => c.semanticIdentity);
  }
  
  /**
   * 私有方法：检测思维盲点
   */
  private _detectBlindSpots(model: UserCognitiveModel): string[] {
    // 简化实现：返回空数组
    return [];
  }
  
  /**
   * 私有方法：识别概念空洞
   */
  private _identifyConceptGaps(model: UserCognitiveModel): string[] {
    // 简化实现：返回空数组
    return [];
  }
}
```

## 4. 统一导出文件

**实现文件**：`src/domain/interfaces/index.ts`

```typescript
// 实体接口
export * from '../entities/UserCognitiveModel';
export * from '../entities/CognitiveConcept';
export * from '../entities/CognitiveRelation';
export * from '../entities/ThoughtFragment';
export * from '../entities/CognitiveProposal';
export * from '../entities/CognitiveInsight';

// 实体实现
export { UserCognitiveModelImpl } from '../entities/UserCognitiveModel';
export { CognitiveConceptImpl } from '../entities/CognitiveConcept';
export { CognitiveRelationImpl } from '../entities/CognitiveRelation';
export { ThoughtFragmentImpl } from '../entities/ThoughtFragment';
export { CognitiveProposalImpl } from '../entities/CognitiveProposal';
export { CognitiveInsightImpl } from '../entities/CognitiveInsight';

// 值对象
export * from '../value-objects/RelationType';
export * from '../value-objects/EvolutionHistory';
export * from '../value-objects/ConceptCandidate';
export * from '../value-objects/RelationCandidate';

// 值对象实现
export { EvolutionHistoryImpl } from '../value-objects/EvolutionHistory';
export { ConceptCandidateImpl } from '../value-objects/ConceptCandidate';
export { RelationCandidateImpl } from '../value-objects/RelationCandidate';

// 领域服务
export * from '../services/CognitiveModelService';
export { CognitiveModelServiceImpl } from '../services/CognitiveModelService';
```

## 5. 代码验证

### 5.1 编译验证

```bash
# 编译项目
npm run build
```

### 5.2 单元测试

**实现文件**：`test/unit/domain/entities/CognitiveConcept.test.ts`

```typescript
import { CognitiveConceptImpl } from '../../../src/domain/entities/CognitiveConcept';

describe('CognitiveConcept', () => {
  it('should create a valid concept', () => {
    const concept = CognitiveConceptImpl.create(
      'concept-1',
      'Test Concept',
      3,
      0.8,
      'Test Description'
    );
    
    expect(concept.id).toBe('concept-1');
    expect(concept.semanticIdentity).toBe('Test Concept');
    expect(concept.abstractionLevel).toBe(3);
    expect(concept.confidenceScore).toBe(0.8);
    expect(concept.description).toBe('Test Description');
  });
  
  it('should throw error for invalid abstraction level', () => {
    expect(() => {
      CognitiveConceptImpl.create(
        'concept-1',
        'Test Concept',
        6, // Invalid abstraction level
        0.8,
        'Test Description'
      );
    }).toThrow('Abstraction level must be between 1 and 5');
  });
  
  it('should update concept with new values', () => {
    const concept = CognitiveConceptImpl.create(
      'concept-1',
      'Test Concept',
      3,
      0.8,
      'Test Description'
    );
    
    const updatedConcept = concept.update({
      description: 'Updated Description',
      confidenceScore: 0.9
    });
    
    expect(updatedConcept.id).toBe(concept.id);
    expect(updatedConcept.description).toBe('Updated Description');
    expect(updatedConcept.confidenceScore).toBe(0.9);
    expect(updatedConcept.updatedAt).not.toEqual(concept.updatedAt);
  });
  
  it('should create new instance when updating (immutability)', () => {
    const concept = CognitiveConceptImpl.create(
      'concept-1',
      'Test Concept',
      3,
      0.8,
      'Test Description'
    );
    
    const updatedConcept = concept.update({
      description: 'Updated Description'
    });
    
    expect(updatedConcept).not.toBe(concept);
    expect(updatedConcept.id).toBe(concept.id);
  });
});
```

**运行测试**：

```bash
npm run test:unit
```

## 6. 总结

Day 06的核心任务是实现Domain层的基础代码框架，包括实体、值对象和领域服务。通过今天的实现，我们已经完成了：

1. **值对象实现**：RelationType、EvolutionHistory、ConceptCandidate、RelationCandidate
2. **实体实现**：CognitiveConcept、CognitiveRelation、ThoughtFragment、CognitiveProposal、CognitiveInsight、UserCognitiveModel
3. **领域服务实现**：CognitiveModelService
4. **统一导出文件**：方便其他层使用Domain层的组件
5. **单元测试**：验证实体的基本功能

所有实现都遵循了DDD原则，包括：
- 实体具有唯一标识
- 值对象是不可变的
- 实体实现了不可变性设计
- 领域服务处理跨实体的业务逻辑
- 代码结构清晰，易于维护

这些实现为后续开发打下了坚实的基础，确保了系统的可维护性、可扩展性和可测试性。在后续的开发中，我们将基于这些实现，继续开发Application层和Infrastructure层的代码。