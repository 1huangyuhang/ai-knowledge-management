import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
import { CognitiveConcept } from '../../domain/entities/cognitive-concept';
import { CognitiveRelation } from '../../domain/entities/cognitive-relation';

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

    // 从模型中获取概念和关系
    const concepts = model.concepts;
    const relations = model.relations;

    // 检查概念一致性
    this.checkConceptConsistency(model, issues);
    
    // 检查关系一致性
    this.checkRelationConsistency(model, issues);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

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
        conceptCount: concepts.length,
        relationCount: relations.length,
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
    const concepts = model.concepts;
    const conceptIds = new Set<string>();
    const conceptNames = new Map<string, string[]>(); // 名称 -> 概念ID列表

    // 检查缺失概念、重复概念和低置信度概念
    concepts.forEach((concept, index) => {
      // 检查重复概念ID
      if (conceptIds.has(concept.id)) {
        issues.push({
          type: ConsistencyIssueType.DUPLICATE_CONCEPT,
          severity: 'medium',
          message: `概念ID重复: ${concept.id}`,
          affectedEntityId: concept.id,
          suggestedFix: `移除重复的概念或为其分配唯一ID`,
        });
      } else {
        conceptIds.add(concept.id);
      }

      // 检查重复概念名称
      const existingIds = conceptNames.get(concept.name) || [];
      existingIds.push(concept.id);
      conceptNames.set(concept.name, existingIds);

      // 检查低置信度概念
      if (concept.confidence && concept.confidence < this.minimumConfidenceThreshold) {
        issues.push({
          type: ConsistencyIssueType.LOW_CONFIDENCE_CONCEPT,
          severity: 'low',
          message: `概念置信度低: ${concept.name} (${concept.confidence.toFixed(2)})`,
          affectedEntityId: concept.id,
          suggestedFix: `考虑删除或重新评估该概念`,
        });
      }
    });

    // 检查重复概念名称
    conceptNames.forEach((ids, name) => {
      if (ids.length > 1) {
        issues.push({
          type: ConsistencyIssueType.DUPLICATE_CONCEPT,
          severity: 'medium',
          message: `概念名称重复: ${name}`,
          suggestedFix: `为重复名称的概念添加更具体的名称或描述`,
        });
      }
    });
  }

  /**
   * 检查关系一致性
   * @param model 认知模型
   * @param issues 问题列表
   */
  private checkRelationConsistency(model: UserCognitiveModel, issues: ConsistencyIssue[]): void {
    const concepts = model.concepts;
    const relations = model.relations;
    const conceptIds = new Set(concepts.map(c => c.id));
    
    // 检查关系
    relations.forEach((relation, index) => {
      // 检查自引用关系
      if (relation.sourceConceptId === relation.targetConceptId) {
        issues.push({
          type: ConsistencyIssueType.SELF_REFERENTIAL_RELATION,
          severity: 'medium',
          message: `自引用关系: ${relation.sourceConceptId} -> ${relation.targetConceptId}`,
          affectedEntityId: relation.id,
          suggestedFix: `移除自引用关系或检查关系定义是否正确`,
        });
      }

      // 检查无效关系类型
      if (!this.validRelationTypes.includes(relation.type)) {
        issues.push({
          type: ConsistencyIssueType.INVALID_RELATION_TYPE,
          severity: 'high',
          message: `无效关系类型: ${relation.type}`,
          affectedEntityId: relation.id,
          suggestedFix: `使用有效的关系类型: ${this.validRelationTypes.join(', ')}`,
        });
      }

      // 检查关系引用的概念是否存在
      if (!conceptIds.has(relation.sourceConceptId)) {
        issues.push({
          type: ConsistencyIssueType.MISSING_CONCEPT,
          severity: 'high',
          message: `关系引用了不存在的源概念: ${relation.sourceConceptId}`,
          affectedEntityId: relation.id,
          suggestedFix: `添加缺失的源概念或修正关系引用`,
        });
      }

      if (!conceptIds.has(relation.targetConceptId)) {
        issues.push({
          type: ConsistencyIssueType.MISSING_CONCEPT,
          severity: 'high',
          message: `关系引用了不存在的目标概念: ${relation.targetConceptId}`,
          affectedEntityId: relation.id,
          suggestedFix: `添加缺失的目标概念或修正关系引用`,
        });
      }

      // 检查低置信度关系
      if (relation.confidence && relation.confidence < this.minimumConfidenceThreshold) {
        issues.push({
          type: ConsistencyIssueType.LOW_CONFIDENCE_RELATION,
          severity: 'low',
          message: `关系置信度低: ${relation.sourceConceptId} -> ${relation.targetConceptId} (${relation.confidence.toFixed(2)})`,
          affectedEntityId: relation.id,
          suggestedFix: `考虑删除或重新评估该关系`,
        });
      }
    });

    // 检查孤立概念
    this.checkIsolatedConcepts(concepts, relations, issues);
  }

  /**
   * 检查孤立概念
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param issues 问题列表
   */
  private checkIsolatedConcepts(concepts: CognitiveConcept[], relations: CognitiveRelation[], issues: ConsistencyIssue[]): void {
    const conceptIdsInRelations = new Set<string>();

    // 收集所有在关系中出现的概念ID
    relations.forEach(relation => {
      conceptIdsInRelations.add(relation.sourceConceptId);
      conceptIdsInRelations.add(relation.targetConceptId);
    });

    // 检查孤立概念
    concepts.forEach(concept => {
      if (!conceptIdsInRelations.has(concept.id)) {
        issues.push({
          type: ConsistencyIssueType.ISOLATED_CONCEPT,
          severity: 'low',
          message: `孤立概念: ${concept.name}`,
          affectedEntityId: concept.id,
          suggestedFix: `为该概念添加关系或考虑删除`,
        });
      }
    });
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

    // 创建模型的深拷贝
    const fixedModel = {
      ...model,
      concepts: [...model.concepts],
      relations: [...model.relations],
    };

    // 处理可以自动修复的问题
    issues.forEach(issue => {
      switch (issue.type) {
        // 目前只处理低置信度概念和关系，其他问题需要人工干预
        case ConsistencyIssueType.LOW_CONFIDENCE_CONCEPT:
          // 移除低置信度概念
          fixedModel.concepts = fixedModel.concepts.filter(c => c.id !== issue.affectedEntityId);
          fixedIssues++;
          break;
        case ConsistencyIssueType.LOW_CONFIDENCE_RELATION:
          // 移除低置信度关系
          fixedModel.relations = fixedModel.relations.filter(r => r.id !== issue.affectedEntityId);
          fixedIssues++;
          break;
        case ConsistencyIssueType.ISOLATED_CONCEPT:
          // 移除孤立概念
          fixedModel.concepts = fixedModel.concepts.filter(c => c.id !== issue.affectedEntityId);
          fixedIssues++;
          break;
        default:
          // 其他问题需要人工干预
          remainingIssues.push(issue);
          break;
      }
    });

    return {
      model: fixedModel,
      fixedIssues,
      remainingIssues,
    };
  }
}
