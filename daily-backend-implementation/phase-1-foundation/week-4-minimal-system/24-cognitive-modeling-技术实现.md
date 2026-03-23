# Day 24: 第一阶段 - 系统地基期 - Week 4 - 第24天 代码实现

## 认知建模实现

### 1. 认知模型更新服务

```typescript
// src/application/services/CognitiveModelUpdateService.ts
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';
import { CognitiveConcept } from '../../domain/entities/CognitiveConcept';
import { CognitiveRelation } from '../../domain/entities/CognitiveRelation';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';

/**
 * 认知模型更新选项
 */
export interface CognitiveModelUpdateOptions {
  updateConcepts?: boolean;
  updateRelations?: boolean;
  updateConfidence?: boolean;
  recalculateStructure?: boolean;
}

/**
 * 认知模型更新结果
 */
export interface CognitiveModelUpdateResult {
  model: UserCognitiveModel;
  changes: {
    addedConcepts: number;
    updatedConcepts: number;
    addedRelations: number;
    updatedRelations: number;
    confidenceChanges: number;
  };
  metadata: {
    processingTime: number;
    conceptCount: number;
    relationCount: number;
    averageConfidence: number;
  };
}

/**
 * 认知模型更新服务
 */
export class CognitiveModelUpdateService {
  /**
   * 更新认知模型
   * @param model 现有的认知模型
   * @param thoughtFragment 新的思维片段
   * @param options 更新选项
   * @returns 更新结果
   */
  public updateCognitiveModel(
    model: UserCognitiveModel,
    thoughtFragment: ThoughtFragment,
    options: CognitiveModelUpdateOptions = {}
  ): CognitiveModelUpdateResult {
    const startTime = Date.now();
    const changes = {
      addedConcepts: 0,
      updatedConcepts: 0,
      addedRelations: 0,
      updatedRelations: 0,
      confidenceChanges: 0,
    };

    // 默认更新选项
    const updateOptions = {
      updateConcepts: true,
      updateRelations: true,
      updateConfidence: true,
      recalculateStructure: true,
      ...options,
    };

    // 1. 更新概念
    if (updateOptions.updateConcepts) {
      const conceptChanges = this.updateConcepts(model, thoughtFragment);
      changes.addedConcepts = conceptChanges.added;
      changes.updatedConcepts = conceptChanges.updated;
    }

    // 2. 更新关系
    if (updateOptions.updateRelations) {
      const relationChanges = this.updateRelations(model, thoughtFragment);
      changes.addedRelations = relationChanges.added;
      changes.updatedRelations = relationChanges.updated;
    }

    // 3. 更新置信度
    if (updateOptions.updateConfidence) {
      changes.confidenceChanges = this.updateConfidence(model, thoughtFragment);
    }

    // 4. 重新计算结构
    if (updateOptions.recalculateStructure) {
      this.recalculateStructure(model);
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // 计算元数据
    const conceptCount = model.concepts.length;
    const relationCount = model.relations.length;
    const averageConfidence = relationCount > 0 
      ? model.relations.reduce((sum, rel) => sum + rel.confidence, 0) / relationCount
      : 0;

    return {
      model,
      changes,
      metadata: {
        processingTime,
        conceptCount,
        relationCount,
        averageConfidence,
      },
    };
  }

  /**
   * 更新概念
   * @param model 认知模型
   * @param thoughtFragment 思维片段
   * @returns 概念变更统计
   */
  private updateConcepts(
    model: UserCognitiveModel,
    thoughtFragment: ThoughtFragment
  ): { added: number; updated: number } {
    const changes = { added: 0, updated: 0 };
    const keywords = thoughtFragment.metadata.keywords || [];

    // 从关键词中提取概念
    for (const keyword of keywords) {
      // 检查概念是否已存在
      let concept = model.concepts.find(c => c.name.toLowerCase() === keyword.toLowerCase());

      if (concept) {
        // 更新现有概念
        concept.occurrenceCount += 1;
        concept.lastOccurrence = new Date();
        concept.confidence = Math.min(1, concept.confidence + 0.1);
        changes.updated++;
      } else {
        // 添加新概念
        concept = new CognitiveConcept({
          name: keyword,
          description: '',
          confidence: 0.5,
          occurrenceCount: 1,
          createdAt: new Date(),
          lastOccurrence: new Date(),
          metadata: {
            sourceThoughtId: thoughtFragment.id,
            sourceContent: thoughtFragment.content.substring(0, 100) + '...',
          },
        });
        model.concepts.push(concept);
        changes.added++;
      }
    }

    return changes;
  }

  /**
   * 更新关系
   * @param model 认知模型
   * @param thoughtFragment 思维片段
   * @returns 关系变更统计
   */
  private updateRelations(
    model: UserCognitiveModel,
    thoughtFragment: ThoughtFragment
  ): { added: number; updated: number } {
    const changes = { added: 0, updated: 0 };
    const keywords = thoughtFragment.metadata.keywords || [];

    // 生成概念对，创建关系
    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        const concept1 = model.concepts.find(c => c.name.toLowerCase() === keywords[i].toLowerCase());
        const concept2 = model.concepts.find(c => c.name.toLowerCase() === keywords[j].toLowerCase());

        if (concept1 && concept2) {
          // 检查关系是否已存在（双向检查）
          let relation = model.relations.find(
            r => (r.sourceConceptId === concept1.id && r.targetConceptId === concept2.id) ||
                 (r.sourceConceptId === concept2.id && r.targetConceptId === concept1.id)
          );

          if (relation) {
            // 更新现有关系
            relation.strength += 0.1;
            relation.confidence = Math.min(1, relation.confidence + 0.05);
            relation.occurrenceCount += 1;
            relation.lastOccurrence = new Date();
            changes.updated++;
          } else {
            // 添加新关系
            relation = new CognitiveRelation({
              sourceConceptId: concept1.id,
              targetConceptId: concept2.id,
              type: 'association',
              strength: 0.5,
              confidence: 0.5,
              occurrenceCount: 1,
              createdAt: new Date(),
              lastOccurrence: new Date(),
              metadata: {
                sourceThoughtId: thoughtFragment.id,
              },
            });
            model.relations.push(relation);
            changes.added++;
          }
        }
      }
    }

    return changes;
  }

  /**
   * 更新置信度
   * @param model 认知模型
   * @param thoughtFragment 思维片段
   * @returns 置信度变更数量
   */
  private updateConfidence(
    model: UserCognitiveModel,
    thoughtFragment: ThoughtFragment
  ): number {
    let changes = 0;
    const keywords = thoughtFragment.metadata.keywords || [];

    // 更新概念置信度
    for (const keyword of keywords) {
      const concept = model.concepts.find(c => c.name.toLowerCase() === keyword.toLowerCase());
      if (concept) {
        const oldConfidence = concept.confidence;
        concept.confidence = Math.min(1, concept.confidence + 0.1);
        if (concept.confidence !== oldConfidence) {
          changes++;
        }
      }
    }

    return changes;
  }

  /**
   * 重新计算认知模型结构
   * @param model 认知模型
   */
  private recalculateStructure(model: UserCognitiveModel): void {
    // 计算模型的中心度（简单实现）
    const conceptScores = new Map<string, number>();

    // 计算每个概念的度数中心性
    for (const relation of model.relations) {
      // 增加源概念分数
      const sourceScore = conceptScores.get(relation.sourceConceptId) || 0;
      conceptScores.set(relation.sourceConceptId, sourceScore + relation.strength);

      // 增加目标概念分数
      const targetScore = conceptScores.get(relation.targetConceptId) || 0;
      conceptScores.set(relation.targetConceptId, targetScore + relation.strength);
    }

    // 更新概念的中心度
    for (const concept of model.concepts) {
      const score = conceptScores.get(concept.id) || 0;
      concept.metadata = {
        ...concept.metadata,
        centrality: score,
      };
    }

    // 更新模型的更新时间
    model.updatedAt = new Date();
  }
}
```

### 2. 概念关系处理器

```typescript
// src/application/services/ConceptRelationProcessor.ts
import { CognitiveConcept } from '../../domain/entities/CognitiveConcept';
import { CognitiveRelation } from '../../domain/entities/CognitiveRelation';

/**
 * 概念关系处理选项
 */
export interface ConceptRelationProcessorOptions {
  relationType?: string;
  minimumConfidence?: number;
  minimumStrength?: number;
}

/**
 * 概念关系处理结果
 */
export interface ConceptRelationProcessorResult {
  concepts: CognitiveConcept[];
  relations: CognitiveRelation[];
  metadata: {
    processedConcepts: number;
    processedRelations: number;
    filteredConcepts: number;
    filteredRelations: number;
  };
}

/**
 * 概念关系处理器
 */
export class ConceptRelationProcessor {
  private readonly defaultOptions: ConceptRelationProcessorOptions = {
    relationType: 'association',
    minimumConfidence: 0.3,
    minimumStrength: 0.2,
  };

  /**
   * 处理概念关系
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param options 处理选项
   * @returns 处理结果
   */
  public processConceptRelations(
    concepts: CognitiveConcept[],
    relations: CognitiveRelation[],
    options: ConceptRelationProcessorOptions = {}
  ): ConceptRelationProcessorResult {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const processedConcepts = [...concepts];
    let processedRelations = [...relations];

    // 过滤低置信度和低强度的关系
    const originalRelationCount = processedRelations.length;
    processedRelations = processedRelations.filter(relation => {
      return (
        relation.confidence >= mergedOptions.minimumConfidence &&
        relation.strength >= mergedOptions.minimumStrength
      );
    });

    // 过滤没有关系的概念
    const originalConceptCount = processedConcepts.length;
    const relatedConceptIds = new Set<string>();
    processedRelations.forEach(relation => {
      relatedConceptIds.add(relation.sourceConceptId);
      relatedConceptIds.add(relation.targetConceptId);
    });

    processedConcepts = processedConcepts.filter(concept => {
      return relatedConceptIds.has(concept.id);
    });

    // 更新关系类型
    processedRelations = processedRelations.map(relation => {
      return new CognitiveRelation({
        ...relation,
        type: mergedOptions.relationType,
      });
    });

    return {
      concepts: processedConcepts,
      relations: processedRelations,
      metadata: {
        processedConcepts: originalConceptCount,
        processedRelations: originalRelationCount,
        filteredConcepts: originalConceptCount - processedConcepts.length,
        filteredRelations: originalRelationCount - processedRelations.length,
      },
    };
  }

  /**
   * 计算概念之间的相似度（简单实现）
   * @param concept1 概念1
   * @param concept2 概念2
   * @returns 相似度分数（0-1）
   */
  public calculateConceptSimilarity(
    concept1: CognitiveConcept,
    concept2: CognitiveConcept
  ): number {
    // 简单的字符串相似度算法（Levenshtein距离）
    const a = concept1.name.toLowerCase();
    const b = concept2.name.toLowerCase();

    if (a.length === 0) return b.length === 0 ? 1 : 0;
    if (b.length === 0) return 0;

    const matrix: number[][] = [];

    // 初始化第一列
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    // 初始化第一行
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // 填充矩阵
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // 删除
          matrix[i][j - 1] + 1,      // 插入
          matrix[i - 1][j - 1] + cost // 替换
        );
      }
    }

    // 计算相似度（0-1）
    const maxLength = Math.max(a.length, b.length);
    const distance = matrix[b.length][a.length];
    return 1 - (distance / maxLength);
  }

  /**
   * 合并相似概念
   * @param concepts 概念列表
   * @param similarityThreshold 相似度阈值
   * @returns 合并后的概念列表
   */
  public mergeSimilarConcepts(
    concepts: CognitiveConcept[],
    similarityThreshold: number = 0.8
  ): CognitiveConcept[] {
    const mergedConcepts: CognitiveConcept[] = [];
    const processedIds = new Set<string>();

    for (let i = 0; i < concepts.length; i++) {
      if (processedIds.has(concepts[i].id)) continue;

      let mergedConcept = { ...concepts[i] };
      let mergedCount = 1;

      for (let j = i + 1; j < concepts.length; j++) {
        if (processedIds.has(concepts[j].id)) continue;

        const similarity = this.calculateConceptSimilarity(concepts[i], concepts[j]);
        if (similarity >= similarityThreshold) {
          // 合并概念属性
          mergedConcept.confidence = (mergedConcept.confidence * mergedCount + concepts[j].confidence) / (mergedCount + 1);
          mergedConcept.occurrenceCount += concepts[j].occurrenceCount;
          mergedConcept.metadata = {
            ...mergedConcept.metadata,
            mergedFrom: [
              ...(mergedConcept.metadata.mergedFrom || []),
              concepts[j].name
            ]
          };

          processedIds.add(concepts[j].id);
          mergedCount++;
        }
      }

      mergedConcepts.push(new CognitiveConcept(mergedConcept));
      processedIds.add(concepts[i].id);
    }

    return mergedConcepts;
  }
}
```

### 3. 模型一致性检查器

```typescript
// src/application/services/ModelConsistencyChecker.ts
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';
import { CognitiveConcept } from '../../domain/entities/CognitiveConcept';
import { CognitiveRelation } from '../../domain/entities/CognitiveRelation';

/**
 * 一致性问题类型
 */
export enum ConsistencyIssueType {
  MISSING_CONCEPT = 'missingConcept',
  DUPLICATE_CONCEPT = 'duplicateConcept',
  SELF_REFERENTIAL_RELATION = 'selfReferentialRelation',
  INVALID_RELATION_TYPE = 'invalidRelationType',
  LOW_CONFIDENCE_CONCEPT = 'lowConfidenceConcept',
  LOW_CONFIDENCE_RELATION = 'lowConfidenceRelation',
  ISOLATED_CONCEPT = 'isolatedConcept',
}

/**
 * 一致性问题
 */
export interface ConsistencyIssue {
  type: ConsistencyIssueType;
  severity: 'low' | 'medium' | 'high';
  message: string;
  affectedEntityId?: string;
  suggestedFix?: string;
}

/**
 * 模型一致性检查结果
 */
export interface ModelConsistencyResult {
  isConsistent: boolean;
  issues: ConsistencyIssue[];
  metadata: {
    totalIssues: number;
    highSeverityIssues: number;
    mediumSeverityIssues: number;
    lowSeverityIssues: number;
    conceptCount: number;
    relationCount: number;
    processingTime: number;
  };
}

/**
 * 模型一致性检查器
 */
export class ModelConsistencyChecker {
  private readonly validRelationTypes = ['association', 'hierarchy', 'causality', 'similarity', 'dependency'];
  private readonly minimumConfidenceThreshold = 0.2;

  /**
   * 检查认知模型的一致性
   * @param model 认知模型
   * @returns 一致性检查结果
   */
  public checkConsistency(model: UserCognitiveModel): ModelConsistencyResult {
    const startTime = Date.now();
    const issues: ConsistencyIssue[] = [];

    // 检查概念一致性
    this.checkConceptConsistency(model, issues);
    
    // 检查关系一致性
    this.checkRelationConsistency(model, issues);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // 统计问题
    const highSeverityIssues = issues.filter(issue => issue.severity === 'high').length;
    const mediumSeverityIssues = issues.filter(issue => issue.severity === 'medium').length;
    const lowSeverityIssues = issues.filter(issue => issue.severity === 'low').length;

    return {
      isConsistent: issues.length === 0,
      issues,
      metadata: {
        totalIssues: issues.length,
        highSeverityIssues,
        mediumSeverityIssues,
        lowSeverityIssues,
        conceptCount: model.concepts.length,
        relationCount: model.relations.length,
        processingTime,
      },
    };
  }

  /**
   * 检查概念一致性
   * @param model 认知模型
   * @param issues 问题列表
   */
  private checkConceptConsistency(model: UserCognitiveModel, issues: ConsistencyIssue[]): void {
    const conceptNames = new Map<string, string>();
    const conceptIds = new Set<string>();

    for (const concept of model.concepts) {
      // 检查重复概念ID
      if (conceptIds.has(concept.id)) {
        issues.push({
          type: ConsistencyIssueType.DUPLICATE_CONCEPT,
          severity: 'high',
          message: `发现重复概念ID: ${concept.id}`,
          affectedEntityId: concept.id,
          suggestedFix: '删除重复概念或重新生成唯一ID',
        });
      } else {
        conceptIds.add(concept.id);
      }

      // 检查重复概念名称
      const lowercaseName = concept.name.toLowerCase();
      if (conceptNames.has(lowercaseName)) {
        issues.push({
          type: ConsistencyIssueType.DUPLICATE_CONCEPT,
          severity: 'medium',
          message: `发现重复概念名称: ${concept.name} (与 ${conceptNames.get(lowercaseName)} 重复)`,
          affectedEntityId: concept.id,
          suggestedFix: '合并相似概念或重命名概念',
        });
      } else {
        conceptNames.set(lowercaseName, concept.id);
      }

      // 检查低置信度概念
      if (concept.confidence < this.minimumConfidenceThreshold) {
        issues.push({
          type: ConsistencyIssueType.LOW_CONFIDENCE_CONCEPT,
          severity: 'low',
          message: `概念 ${concept.name} 置信度过低: ${concept.confidence.toFixed(2)}`,
          affectedEntityId: concept.id,
          suggestedFix: '增加概念的出现次数或提高其置信度',
        });
      }
    }
  }

  /**
   * 检查关系一致性
   * @param model 认知模型
   * @param issues 问题列表
   */
  private checkRelationConsistency(model: UserCognitiveModel, issues: ConsistencyIssue[]): void {
    const conceptIds = new Set(model.concepts.map(c => c.id));
    const usedConceptIds = new Set<string>();

    for (const relation of model.relations) {
      // 检查关系引用的概念是否存在
      if (!conceptIds.has(relation.sourceConceptId)) {
        issues.push({
          type: ConsistencyIssueType.MISSING_CONCEPT,
          severity: 'high',
          message: `关系引用了不存在的源概念: ${relation.sourceConceptId}`,
          affectedEntityId: relation.id,
          suggestedFix: '删除该关系或添加缺失的概念',
        });
      } else {
        usedConceptIds.add(relation.sourceConceptId);
      }

      if (!conceptIds.has(relation.targetConceptId)) {
        issues.push({
          type: ConsistencyIssueType.MISSING_CONCEPT,
          severity: 'high',
          message: `关系引用了不存在的目标概念: ${relation.targetConceptId}`,
          affectedEntityId: relation.id,
          suggestedFix: '删除该关系或添加缺失的概念',
        });
      } else {
        usedConceptIds.add(relation.targetConceptId);
      }

      // 检查自引用关系
      if (relation.sourceConceptId === relation.targetConceptId) {
        issues.push({
          type: ConsistencyIssueType.SELF_REFERENTIAL_RELATION,
          severity: 'medium',
          message: `关系是自引用的: ${relation.sourceConceptId} -> ${relation.targetConceptId}`,
          affectedEntityId: relation.id,
          suggestedFix: '删除自引用关系',
        });
      }

      // 检查无效关系类型
      if (!this.validRelationTypes.includes(relation.type)) {
        issues.push({
          type: ConsistencyIssueType.INVALID_RELATION_TYPE,
          severity: 'medium',
          message: `关系类型无效: ${relation.type}`,
          affectedEntityId: relation.id,
          suggestedFix: `将关系类型改为有效类型之一: ${this.validRelationTypes.join(', ')}`,
        });
      }

      // 检查低置信度关系
      if (relation.confidence < this.minimumConfidenceThreshold) {
        issues.push({
          type: ConsistencyIssueType.LOW_CONFIDENCE_RELATION,
          severity: 'low',
          message: `关系置信度过低: ${relation.confidence.toFixed(2)}`,
          affectedEntityId: relation.id,
          suggestedFix: '增加关系的出现次数或提高其置信度',
        });
      }
    }

    // 检查孤立概念（没有任何关系的概念）
    for (const concept of model.concepts) {
      if (!usedConceptIds.has(concept.id)) {
        issues.push({
          type: ConsistencyIssueType.ISOLATED_CONCEPT,
          severity: 'low',
          message: `概念 ${concept.name} 是孤立的，没有任何关系`,
          affectedEntityId: concept.id,
          suggestedFix: '为该概念添加相关关系',
        });
      }
    }
  }

  /**
   * 自动修复一致性问题
   * @param model 认知模型
   * @param issues 一致性问题列表
   * @returns 修复后的模型和修复结果
   */
  public autoFixConsistencyIssues(
    model: UserCognitiveModel,
    issues: ConsistencyIssue[]
  ): {
    model: UserCognitiveModel;
    fixedIssues: number;
    remainingIssues: ConsistencyIssue[];
  } {
    let fixedIssues = 0;
    const remainingIssues: ConsistencyIssue[] = [];

    // 创建模型副本
    const fixedModel = new UserCognitiveModel({
      ...model,
      concepts: [...model.concepts],
      relations: [...model.relations],
    });

    for (const issue of issues) {
      let isFixed = false;

      switch (issue.type) {
        case ConsistencyIssueType.MISSING_CONCEPT:
          // 删除引用不存在概念的关系
          fixedModel.relations = fixedModel.relations.filter(r => r.id !== issue.affectedEntityId);
          isFixed = true;
          break;

        case ConsistencyIssueType.DUPLICATE_CONCEPT:
          // 保留第一个出现的概念，删除后续重复概念
          if (fixedModel.concepts.findIndex(c => c.id === issue.affectedEntityId) > 0) {
            fixedModel.concepts = fixedModel.concepts.filter(c => c.id !== issue.affectedEntityId);
            isFixed = true;
          }
          break;

        case ConsistencyIssueType.SELF_REFERENTIAL_RELATION:
          // 删除自引用关系
          fixedModel.relations = fixedModel.relations.filter(r => r.id !== issue.affectedEntityId);
          isFixed = true;
          break;

        case ConsistencyIssueType.LOW_CONFIDENCE_CONCEPT:
          // 删除低置信度概念及其相关关系
          fixedModel.concepts = fixedModel.concepts.filter(c => c.id !== issue.affectedEntityId);
          fixedModel.relations = fixedModel.relations.filter(
            r => r.sourceConceptId !== issue.affectedEntityId && r.targetConceptId !== issue.affectedEntityId
          );
          isFixed = true;
          break;

        case ConsistencyIssueType.LOW_CONFIDENCE_RELATION:
          // 删除低置信度关系
          fixedModel.relations = fixedModel.relations.filter(r => r.id !== issue.affectedEntityId);
          isFixed = true;
          break;

        default:
          // 其他问题需要人工修复
          remainingIssues.push(issue);
          break;
      }

      if (isFixed) {
        fixedIssues++;
      }
    }

    return {
      model: fixedModel,
      fixedIssues,
      remainingIssues,
    };
  }
}
```

### 4. 认知图生成器

```typescript
// src/application/services/CognitiveGraphGenerator.ts
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';
import { CognitiveConcept } from '../../domain/entities/CognitiveConcept';
import { CognitiveRelation } from '../../domain/entities/CognitiveRelation';

/**
 * 认知图节点
 */
export interface CognitiveGraphNode {
  id: string;
  label: string;
  type: 'concept';
  properties: {
    name: string;
    confidence: number;
    occurrenceCount: number;
    centrality?: number;
    createdAt: string;
    lastOccurrence: string;
  };
}

/**
 * 认知图边
 */
export interface CognitiveGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: {
    strength: number;
    confidence: number;
    occurrenceCount: number;
    createdAt: string;
    lastOccurrence: string;
  };
}

/**
 * 认知图
 */
export interface CognitiveGraph {
  nodes: CognitiveGraphNode[];
  edges: CognitiveGraphEdge[];
  metadata: {
    nodeCount: number;
    edgeCount: number;
    averageNodeConfidence: number;
    averageEdgeConfidence: number;
    averageEdgeStrength: number;
    generatedAt: string;
  };
}

/**
 * 认知图生成选项
 */
export interface CognitiveGraphGenerationOptions {
  includeLowConfidenceNodes?: boolean;
  includeLowConfidenceEdges?: boolean;
  minimumNodeConfidence?: number;
  minimumEdgeConfidence?: number;
  minimumEdgeStrength?: number;
  maxNodes?: number;
  maxEdges?: number;
  sortNodesBy?: 'confidence' | 'occurrence' | 'centrality' | 'name';
  sortEdgesBy?: 'confidence' | 'strength' | 'occurrence';
}

/**
 * 认知图生成器
 */
export class CognitiveGraphGenerator {
  private readonly defaultOptions: CognitiveGraphGenerationOptions = {
    includeLowConfidenceNodes: false,
    includeLowConfidenceEdges: false,
    minimumNodeConfidence: 0.3,
    minimumEdgeConfidence: 0.3,
    minimumEdgeStrength: 0.2,
    maxNodes: 100,
    maxEdges: 200,
    sortNodesBy: 'confidence',
    sortEdgesBy: 'strength',
  };

  /**
   * 从认知模型生成认知图
   * @param model 认知模型
   * @param options 生成选项
   * @returns 认知图
   */
  public generateCognitiveGraph(
    model: UserCognitiveModel,
    options: CognitiveGraphGenerationOptions = {}
  ): CognitiveGraph {
    const mergedOptions = { ...this.defaultOptions, ...options };
    let nodes: CognitiveGraphNode[] = [];
    let edges: CognitiveGraphEdge[] = [];

    // 生成节点
    nodes = model.concepts
      .filter(concept => {
        // 过滤低置信度节点
        if (!mergedOptions.includeLowConfidenceNodes) {
          return concept.confidence >= mergedOptions.minimumNodeConfidence;
        }
        return true;
      })
      .map(concept => ({
        id: concept.id,
        label: concept.name,
        type: 'concept',
        properties: {
          name: concept.name,
          confidence: concept.confidence,
          occurrenceCount: concept.occurrenceCount,
          centrality: concept.metadata.centrality,
          createdAt: concept.createdAt.toISOString(),
          lastOccurrence: concept.lastOccurrence.toISOString(),
        },
      }));

    // 生成边
    edges = model.relations
      .filter(relation => {
        // 过滤低置信度和低强度的边
        if (!mergedOptions.includeLowConfidenceEdges) {
          return (
            relation.confidence >= mergedOptions.minimumEdgeConfidence &&
            relation.strength >= mergedOptions.minimumEdgeStrength
          );
        }
        return true;
      })
      .map(relation => ({
        id: relation.id,
        source: relation.sourceConceptId,
        target: relation.targetConceptId,
        type: relation.type,
        properties: {
          strength: relation.strength,
          confidence: relation.confidence,
          occurrenceCount: relation.occurrenceCount,
          createdAt: relation.createdAt.toISOString(),
          lastOccurrence: relation.lastOccurrence.toISOString(),
        },
      }));

    // 排序节点
    this.sortNodes(nodes, mergedOptions.sortNodesBy!);
    
    // 排序边
    this.sortEdges(edges, mergedOptions.sortEdgesBy!);

    // 限制节点和边的数量
    if (mergedOptions.maxNodes && nodes.length > mergedOptions.maxNodes) {
      nodes = nodes.slice(0, mergedOptions.maxNodes);
    }

    if (mergedOptions.maxEdges && edges.length > mergedOptions.maxEdges) {
      edges = edges.slice(0, mergedOptions.maxEdges);
    }

    // 计算统计数据
    const averageNodeConfidence = nodes.length > 0
      ? nodes.reduce((sum, node) => sum + node.properties.confidence, 0) / nodes.length
      : 0;

    const averageEdgeConfidence = edges.length > 0
      ? edges.reduce((sum, edge) => sum + edge.properties.confidence, 0) / edges.length
      : 0;

    const averageEdgeStrength = edges.length > 0
      ? edges.reduce((sum, edge) => sum + edge.properties.strength, 0) / edges.length
      : 0;

    // 构建认知图
    const graph: CognitiveGraph = {
      nodes,
      edges,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        averageNodeConfidence,
        averageEdgeConfidence,
        averageEdgeStrength,
        generatedAt: new Date().toISOString(),
      },
    };

    return graph;
  }

  /**
   * 排序节点
   * @param nodes 节点列表
   * @param sortBy 排序依据
   */
  private sortNodes(nodes: CognitiveGraphNode[], sortBy: 'confidence' | 'occurrence' | 'centrality' | 'name'): void {
    switch (sortBy) {
      case 'confidence':
        nodes.sort((a, b) => b.properties.confidence - a.properties.confidence);
        break;
      case 'occurrence':
        nodes.sort((a, b) => b.properties.occurrenceCount - a.properties.occurrenceCount);
        break;
      case 'centrality':
        nodes.sort((a, b) => (b.properties.centrality || 0) - (a.properties.centrality || 0));
        break;
      case 'name':
        nodes.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
        break;
    }
  }

  /**
   * 排序边
   * @param edges 边列表
   * @param sortBy 排序依据
   */
  private sortEdges(edges: CognitiveGraphEdge[], sortBy: 'confidence' | 'strength' | 'occurrence'): void {
    switch (sortBy) {
      case 'confidence':
        edges.sort((a, b) => b.properties.confidence - a.properties.confidence);
        break;
      case 'strength':
        edges.sort((a, b) => b.properties.strength - a.properties.strength);
        break;
      case 'occurrence':
        edges.sort((a, b) => b.properties.occurrenceCount - a.properties.occurrenceCount);
        break;
    }
  }

  /**
   * 导出认知图为JSON格式
   * @param graph 认知图
   * @returns JSON字符串
   */
  public exportGraphToJSON(graph: CognitiveGraph): string {
    return JSON.stringify(graph, null, 2);
  }

  /**
   * 导出认知图为GraphML格式
   * @param graph 认知图
   * @returns GraphML字符串
   */
  public exportGraphToGraphML(graph: CognitiveGraph): string {
    let graphML = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="d0" for="node" attr.name="name" attr.type="string"/>
  <key id="d1" for="node" attr.name="confidence" attr.type="double"/>
  <key id="d2" for="node" attr.name="occurrenceCount" attr.type="int"/>
  <key id="d3" for="node" attr.name="centrality" attr.type="double"/>
  <key id="d4" for="node" attr.name="createdAt" attr.type="string"/>
  <key id="d5" for="node" attr.name="lastOccurrence" attr.type="string"/>
  <key id="d6" for="edge" attr.name="strength" attr.type="double"/>
  <key id="d7" for="edge" attr.name="confidence" attr.type="double"/>
  <key id="d8" for="edge" attr.name="occurrenceCount" attr.type="int"/>
  <key id="d9" for="edge" attr.name="createdAt" attr.type="string"/>
  <key id="d10" for="edge" attr.name="lastOccurrence" attr.type="string"/>
  <graph id="G" edgedefault="undirected">
`;

    // 添加节点
    for (const node of graph.nodes) {
      graphML += `    <node id="${node.id}">
`;
      graphML += `      <data key="d0">${node.properties.name}</data>
`;
      graphML += `      <data key="d1">${node.properties.confidence}</data>
`;
      graphML += `      <data key="d2">${node.properties.occurrenceCount}</data>
`;
      if (node.properties.centrality !== undefined) {
        graphML += `      <data key="d3">${node.properties.centrality}</data>
`;
      }
      graphML += `      <data key="d4">${node.properties.createdAt}</data>
`;
      graphML += `      <data key="d5">${node.properties.lastOccurrence}</data>
`;
      graphML += `    </node>
`;
    }

    // 添加边
    for (const edge of graph.edges) {
      graphML += `    <edge id="${edge.id}" source="${edge.source}" target="${edge.target}">
`;
      graphML += `      <data key="d6">${edge.properties.strength}</data>
`;
      graphML += `      <data key="d7">${edge.properties.confidence}</data>
`;
      graphML += `      <data key="d8">${edge.properties.occurrenceCount}</data>
`;
      graphML += `      <data key="d9">${edge.properties.createdAt}</data>
`;
      graphML += `      <data key="d10">${edge.properties.lastOccurrence}</data>
`;
      graphML += `    </edge>
`;
    }

    graphML += `  </graph>
</graphml>`;

    return graphML;
  }
}
```

### 5. 认知建模工作流

```typescript
// src/application/workflows/CognitiveModelingWorkflow.ts
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';
import { CognitiveModelUpdateService } from '../services/CognitiveModelUpdateService';
import { ConceptRelationProcessor } from '../services/ConceptRelationProcessor';
import { ModelConsistencyChecker } from '../services/ModelConsistencyChecker';
import { CognitiveGraphGenerator } from '../services/CognitiveGraphGenerator';

/**
 * 认知建模工作流配置
 */
export interface CognitiveModelingWorkflowConfig {
  updateModel: boolean;
  processRelations: boolean;
  checkConsistency: boolean;
  autoFixConsistency: boolean;
  generateGraph: boolean;
  updateOptions?: any;
  relationProcessorOptions?: any;
  consistencyCheckerOptions?: any;
  graphGeneratorOptions?: any;
}

/**
 * 认知建模工作流结果
 */
export interface CognitiveModelingWorkflowResult {
  model: UserCognitiveModel;
  isConsistent: boolean;
  consistencyIssues: any[];
  graph?: any;
  metadata: {
    processingTime: number;
    updateChanges: any;
    relationProcessingChanges: any;
    consistencyFixes: any;
    graphStats: any;
  };
}

/**
 * 认知建模工作流
 */
export class CognitiveModelingWorkflow {
  private readonly cognitiveModelUpdateService: CognitiveModelUpdateService;
  private readonly conceptRelationProcessor: ConceptRelationProcessor;
  private readonly modelConsistencyChecker: ModelConsistencyChecker;
  private readonly cognitiveGraphGenerator: CognitiveGraphGenerator;

  private readonly defaultConfig: CognitiveModelingWorkflowConfig = {
    updateModel: true,
    processRelations: true,
    checkConsistency: true,
    autoFixConsistency: true,
    generateGraph: true,
  };

  /**
   * 创建认知建模工作流
   */
  constructor() {
    this.cognitiveModelUpdateService = new CognitiveModelUpdateService();
    this.conceptRelationProcessor = new ConceptRelationProcessor();
    this.modelConsistencyChecker = new ModelConsistencyChecker();
    this.cognitiveGraphGenerator = new CognitiveGraphGenerator();
  }

  /**
   * 执行认知建模工作流
   * @param model 认知模型
   * @param thoughtFragment 思维片段
   * @param config 工作流配置
   * @returns 工作流结果
   */
  public async execute(
    model: UserCognitiveModel,
    thoughtFragment: ThoughtFragment,
    config: Partial<CognitiveModelingWorkflowConfig> = {}
  ): Promise<CognitiveModelingWorkflowResult> {
    const startTime = Date.now();
    const workflowConfig = { ...this.defaultConfig, ...config };
    const metadata: CognitiveModelingWorkflowResult['metadata'] = {
      processingTime: 0,
      updateChanges: {},
      relationProcessingChanges: {},
      consistencyFixes: {},
      graphStats: {},
    };

    let updatedModel = model;
    let isConsistent = true;
    let consistencyIssues: any[] = [];
    let graph: any;

    // 1. 更新认知模型
    if (workflowConfig.updateModel) {
      const updateResult = this.cognitiveModelUpdateService.updateCognitiveModel(
        updatedModel,
        thoughtFragment,
        workflowConfig.updateOptions
      );
      updatedModel = updateResult.model;
      metadata.updateChanges = updateResult.changes;
    }

    // 2. 处理概念关系
    if (workflowConfig.processRelations) {
      const relationProcessingResult = this.conceptRelationProcessor.processConceptRelations(
        updatedModel.concepts,
        updatedModel.relations,
        workflowConfig.relationProcessorOptions
      );
      updatedModel.concepts = relationProcessingResult.concepts;
      updatedModel.relations = relationProcessingResult.relations;
      metadata.relationProcessingChanges = relationProcessingResult.metadata;
    }

    // 3. 检查模型一致性
    if (workflowConfig.checkConsistency) {
      const consistencyResult = this.modelConsistencyChecker.checkConsistency(updatedModel);
      isConsistent = consistencyResult.isConsistent;
      consistencyIssues = consistencyResult.issues;

      // 4. 自动修复一致性问题
      if (workflowConfig.autoFixConsistency && !isConsistent) {
        const fixResult = this.modelConsistencyChecker.autoFixConsistencyIssues(
          updatedModel,
          consistencyIssues
        );
        updatedModel = fixResult.model;
        consistencyIssues = fixResult.remainingIssues;
        isConsistent = consistencyIssues.length === 0;
        metadata.consistencyFixes = {
          fixedIssues: fixResult.fixedIssues,
          remainingIssues: fixResult.remainingIssues.length,
        };
      }
    }

    // 5. 生成认知图
    if (workflowConfig.generateGraph) {
      graph = this.cognitiveGraphGenerator.generateCognitiveGraph(
        updatedModel,
        workflowConfig.graphGeneratorOptions
      );
      metadata.graphStats = graph.metadata;
    }

    const endTime = Date.now();
    metadata.processingTime = endTime - startTime;

    return {
      model: updatedModel,
      isConsistent,
      consistencyIssues,
      graph,
      metadata,
    };
  }
}
```
