/**
 * 结构验证服务
 * 用于验证认知模型的结构一致性、完整性和逻辑连贯性
 */
import { CognitiveModel } from '../../../domain/entities';
import { CognitiveConcept } from '../../../domain/entities';
import { CognitiveRelation } from '../../../domain/entities';
import { LLMClient } from '../../services/llm/LLMClient';

/**
 * 结构验证结果
 */
export interface StructureValidationResult {
  /**
   * 验证是否通过
   */
  isValid: boolean;
  
  /**
   * 验证分数（0-1）
   */
  validationScore: number;
  
  /**
   * 发现的问题列表
   */
  issues: ValidationIssue[];
  
  /**
   * 验证的详细指标
   */
  metrics: {
    /**
     * 概念完整性得分（0-1）
     */
    conceptCompleteness: number;
    
    /**
     * 关系完整性得分（0-1）
     */
    relationCompleteness: number;
    
    /**
     * 结构一致性得分（0-1）
     */
    structuralConsistency: number;
    
    /**
     * 逻辑连贯性得分（0-1）
     */
    logicalCoherence: number;
    
    /**
     * 层级合理性得分（0-1）
     */
    hierarchicalReasonableness: number;
  };
}

/**
 * 验证问题
 */
export interface ValidationIssue {
  /**
   * 问题类型
   */
  type: ValidationIssueType;
  
  /**
   * 问题严重程度
   */
  severity: ValidationIssueSeverity;
  
  /**
   * 问题描述
   */
  description: string;
  
  /**
   * 相关实体ID列表
   */
  relatedEntityIds: string[];
  
  /**
   * 建议的修复方案
   */
  suggestedFix?: string;
}

/**
 * 验证问题类型
 */
export enum ValidationIssueType {
  /**
   * 概念缺失
   */
  CONCEPT_MISSING = 'concept_missing',
  
  /**
   * 关系缺失
   */
  RELATION_MISSING = 'relation_missing',
  
  /**
   * 结构不一致
   */
  STRUCTURAL_INCONSISTENCY = 'structural_inconsistency',
  
  /**
   * 逻辑矛盾
   */
  LOGICAL_CONTRADICTION = 'logical_contradiction',
  
  /**
   * 层级不合理
   */
  HIERARCHY_ISSUE = 'hierarchy_issue',
  
  /**
   * 冗余概念
   */
  REDUNDANT_CONCEPT = 'redundant_concept',
  
  /**
   * 冗余关系
   */
  REDUNDANT_RELATION = 'redundant_relation',
  
  /**
   * 置信度过低
   */
  LOW_CONFIDENCE = 'low_confidence',
}

/**
 * 验证问题严重程度
 */
export enum ValidationIssueSeverity {
  /**
   * 信息
   */
  INFO = 'info',
  
  /**
   * 警告
   */
  WARNING = 'warning',
  
  /**
   * 错误
   */
  ERROR = 'error',
  
  /**
   * 严重错误
   */
  CRITICAL = 'critical',
}

/**
 * 结构验证服务接口
 */
export interface StructureValidationService {
  /**
   * 验证认知模型的结构
   * @param model 要验证的认知模型
   * @param concepts 认知模型中的概念列表
   * @param relations 认知模型中的关系列表
   * @returns 结构验证结果
   */
  validateStructure(model: CognitiveModel, concepts: CognitiveConcept[], relations: CognitiveRelation[]): Promise<StructureValidationResult>;
  
  /**
   * 验证单个概念的结构合理性
   * @param concept 要验证的概念
   * @param model 所属认知模型
   * @param concepts 所有概念列表
   * @param relations 所有关系列表
   * @returns 结构验证结果
   */
  validateConceptStructure(concept: CognitiveConcept, model: CognitiveModel, concepts: CognitiveConcept[], relations: CognitiveRelation[]): Promise<StructureValidationResult>;
  
  /**
   * 验证单个关系的结构合理性
   * @param relation 要验证的关系
   * @param model 所属认知模型
   * @param concepts 所有概念列表
   * @param relations 所有关系列表
   * @returns 结构验证结果
   */
  validateRelationStructure(relation: CognitiveRelation, model: CognitiveModel, concepts: CognitiveConcept[], relations: CognitiveRelation[]): Promise<StructureValidationResult>;
  
  /**
   * 获取验证报告
   * @param results 验证结果列表
   * @returns 格式化的验证报告
   */
  generateValidationReport(results: StructureValidationResult[]): string;
}

/**
 * 基于规则和LLM的结构验证服务实现
 */
export class RuleAndLLMBasedStructureValidationService implements StructureValidationService {
  private readonly llmClient: LLMClient;
  
  /**
   * 创建RuleAndLLMBasedStructureValidationService实例
   * @param llmClient LLM客户端
   */
  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }
  
  /**
   * 验证认知模型的结构
   * @param model 要验证的认知模型
   * @param concepts 认知模型中的概念列表
   * @param relations 认知模型中的关系列表
   * @returns 结构验证结果
   */
  async validateStructure(
    model: CognitiveModel, 
    concepts: CognitiveConcept[], 
    relations: CognitiveRelation[]
  ): Promise<StructureValidationResult> {
    // 初始化验证结果
    const result: StructureValidationResult = {
      isValid: true,
      validationScore: 1.0,
      issues: [],
      metrics: {
        conceptCompleteness: 1.0,
        relationCompleteness: 1.0,
        structuralConsistency: 1.0,
        logicalCoherence: 1.0,
        hierarchicalReasonableness: 1.0
      }
    };
    
    // 执行各项验证
    this.validateConceptCompleteness(concepts, relations, result);
    this.validateRelationCompleteness(concepts, relations, result);
    this.validateStructuralConsistency(concepts, relations, result);
    await this.validateLogicalCoherence(model, concepts, relations, result);
    this.validateHierarchicalReasonableness(concepts, relations, result);
    this.validateConfidenceLevels(concepts, relations, result);
    
    // 计算总体验证分数
    result.validationScore = this.calculateValidationScore(result.metrics);
    
    // 确定验证是否通过
    result.isValid = result.validationScore > 0.7 && 
                   result.issues.every(issue => issue.severity !== ValidationIssueSeverity.CRITICAL);
    
    return result;
  }
  
  /**
   * 验证单个概念的结构合理性
   * @param concept 要验证的概念
   * @param model 所属认知模型
   * @param concepts 所有概念列表
   * @param relations 所有关系列表
   * @returns 结构验证结果
   */
  async validateConceptStructure(
    concept: CognitiveConcept, 
    model: CognitiveModel, 
    concepts: CognitiveConcept[], 
    relations: CognitiveRelation[]
  ): Promise<StructureValidationResult> {
    // 过滤出与该概念相关的关系
    const relatedRelations = relations.filter(relation => 
      relation.getSourceConceptId() === concept.getId() || 
      relation.getTargetConceptId() === concept.getId()
    );
    
    // 创建仅包含该概念和相关关系的子模型
    const subConcepts = [concept];
    
    // 使用完整验证方法验证子模型
    return this.validateStructure(model, subConcepts, relatedRelations);
  }
  
  /**
   * 验证单个关系的结构合理性
   * @param relation 要验证的关系
   * @param model 所属认知模型
   * @param concepts 所有概念列表
   * @param relations 所有关系列表
   * @returns 结构验证结果
   */
  async validateRelationStructure(
    relation: CognitiveRelation, 
    model: CognitiveModel, 
    concepts: CognitiveConcept[], 
    relations: CognitiveRelation[]
  ): Promise<StructureValidationResult> {
    // 找出关系的源概念和目标概念
    const sourceConcept = concepts.find(c => c.getId() === relation.getSourceConceptId());
    const targetConcept = concepts.find(c => c.getId() === relation.getTargetConceptId());
    
    if (!sourceConcept || !targetConcept) {
      return {
        isValid: false,
        validationScore: 0.0,
        issues: [{
          type: ValidationIssueType.RELATION_MISSING,
          severity: ValidationIssueSeverity.ERROR,
          description: 'Relation references non-existent concepts',
          relatedEntityIds: [relation.getId()]
        }],
        metrics: {
          conceptCompleteness: 0.0,
          relationCompleteness: 0.0,
          structuralConsistency: 0.0,
          logicalCoherence: 0.0,
          hierarchicalReasonableness: 0.0
        }
      };
    }
    
    // 创建仅包含相关概念和关系的子模型
    const subConcepts = [sourceConcept, targetConcept];
    const subRelations = [relation];
    
    // 使用完整验证方法验证子模型
    return this.validateStructure(model, subConcepts, subRelations);
  }
  
  /**
   * 获取验证报告
   * @param results 验证结果列表
   * @returns 格式化的验证报告
   */
  generateValidationReport(results: StructureValidationResult[]): string {
    let report = '# 认知模型结构验证报告\n\n';
    
    // 汇总统计
    const totalScore = results.reduce((sum, result) => sum + result.validationScore, 0) / results.length;
    const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);
    const criticalIssues = results.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === ValidationIssueSeverity.CRITICAL).length, 0
    );
    const errorIssues = results.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === ValidationIssueSeverity.ERROR).length, 0
    );
    const warningIssues = results.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === ValidationIssueSeverity.WARNING).length, 0
    );
    
    report += `## 总体统计\n\n`;
    report += `| 指标 | 数值 |\n`;
    report += `|------|------|\n`;
    report += `| 平均验证分数 | ${totalScore.toFixed(2)} |\n`;
    report += `| 总问题数 | ${totalIssues} |\n`;
    report += `| 严重问题数 | ${criticalIssues} |\n`;
    report += `| 错误问题数 | ${errorIssues} |\n`;
    report += `| 警告问题数 | ${warningIssues} |\n\n`;
    
    // 问题详情
    report += `## 问题详情\n\n`;
    results.forEach((result, index) => {
      if (result.issues.length > 0) {
        report += `### 验证结果 ${index + 1} (分数: ${result.validationScore.toFixed(2)})\n\n`;
        result.issues.forEach(issue => {
          report += `- **[${issue.severity}] ${issue.type}**: ${issue.description}\n`;
          if (issue.suggestedFix) {
            report += `  - 建议修复: ${issue.suggestedFix}\n`;
          }
        });
        report += `\n`;
      }
    });
    
    return report;
  }
  
  /**
   * 验证概念完整性
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param result 验证结果
   */
  private validateConceptCompleteness(
    concepts: CognitiveConcept[], 
    relations: CognitiveRelation[], 
    result: StructureValidationResult
  ): void {
    // 检查是否有孤立概念（没有任何关系的概念）
    const isolatedConcepts = concepts.filter(concept => {
      const hasRelation = relations.some(relation => 
        relation.getSourceConceptId() === concept.getId() || 
        relation.getTargetConceptId() === concept.getId()
      );
      return !hasRelation;
    });
    
    if (isolatedConcepts.length > 0) {
      result.metrics.conceptCompleteness = Math.max(0, 1 - (isolatedConcepts.length / concepts.length));
      
      isolatedConcepts.forEach(concept => {
        result.issues.push({
          type: ValidationIssueType.CONCEPT_MISSING,
          severity: ValidationIssueSeverity.WARNING,
          description: `Concept "${concept.getSemanticIdentity()}" is isolated (no relations)`,
          relatedEntityIds: [concept.getId()],
          suggestedFix: `Add relations to connect this concept with others in the model`
        });
      });
    }
  }
  
  /**
   * 验证关系完整性
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param result 验证结果
   */
  private validateRelationCompleteness(
    concepts: CognitiveConcept[], 
    relations: CognitiveRelation[], 
    result: StructureValidationResult
  ): void {
    // 检查是否有关系引用了不存在的概念
    const conceptIds = new Set(concepts.map(concept => concept.getId()));
    
    const invalidRelations = relations.filter(relation => {
      return !conceptIds.has(relation.getSourceConceptId()) || 
             !conceptIds.has(relation.getTargetConceptId());
    });
    
    if (invalidRelations.length > 0) {
      result.metrics.relationCompleteness = Math.max(0, 1 - (invalidRelations.length / relations.length));
      
      invalidRelations.forEach(relation => {
        result.issues.push({
          type: ValidationIssueType.RELATION_MISSING,
          severity: ValidationIssueSeverity.ERROR,
          description: `Relation references non-existent concepts`,
          relatedEntityIds: [relation.getId()],
          suggestedFix: `Update relation to reference existing concepts`
        });
      });
    }
  }
  
  /**
   * 验证结构一致性
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param result 验证结果
   */
  private validateStructuralConsistency(
    concepts: CognitiveConcept[], 
    relations: CognitiveRelation[], 
    result: StructureValidationResult
  ): void {
    // 检查是否有循环关系
    const cycles = this.detectCycles(concepts, relations);
    if (cycles.length > 0) {
      result.metrics.structuralConsistency = Math.max(0, 1 - (cycles.length / relations.length));
      
      cycles.forEach(cycle => {
        result.issues.push({
          type: ValidationIssueType.STRUCTURAL_INCONSISTENCY,
          severity: ValidationIssueSeverity.WARNING,
          description: `Detected cyclic relationship: ${cycle.join(' -> ')}`,
          relatedEntityIds: cycle,
          suggestedFix: `Consider refactoring the model to remove cyclic dependencies`
        });
      });
    }
  }
  
  /**
   * 验证逻辑连贯性
   * @param model 认知模型
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param result 验证结果
   */
  private async validateLogicalCoherence(
    model: CognitiveModel, 
    concepts: CognitiveConcept[], 
    relations: CognitiveRelation[], 
    result: StructureValidationResult
  ): Promise<void> {
    // 使用LLM验证逻辑连贯性
    // TODO: 实现基于LLM的逻辑连贯性验证
    result.metrics.logicalCoherence = 0.8; // 暂时使用默认值
  }
  
  /**
   * 验证层级合理性
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param result 验证结果
   */
  private validateHierarchicalReasonableness(
    concepts: CognitiveConcept[], 
    relations: CognitiveRelation[], 
    result: StructureValidationResult
  ): void {
    // 检查概念的抽象级别是否合理
    // 计算每个概念的入度和出度
    const conceptStats = new Map<string, { 
      inDegree: number; 
      outDegree: number; 
      abstractionLevel: number;
    }>();
    
    concepts.forEach(concept => {
      conceptStats.set(concept.getId(), {
        inDegree: 0,
        outDegree: 0,
        abstractionLevel: concept.getAbstractionLevel()
      });
    });
    
    // 统计关系的入度和出度
    relations.forEach(relation => {
      const sourceStats = conceptStats.get(relation.getSourceConceptId());
      const targetStats = conceptStats.get(relation.getTargetConceptId());
      
      if (sourceStats && targetStats) {
        sourceStats.outDegree++;
        targetStats.inDegree++;
      }
    });
    
    // 检查抽象级别与连接度的合理性
    let不合理概念数量 = 0;
    conceptStats.forEach((stats, conceptId) => {
      const concept = concepts.find(c => c.getId() === conceptId);
      if (!concept) return;
      
      // 高抽象级别概念应该有更多的出度（作为父概念）
      if (stats.abstractionLevel > 3 && stats.outDegree < 2) {
        不合理概念数量++;
        result.issues.push({
          type: ValidationIssueType.HIERARCHY_ISSUE,
          severity: ValidationIssueSeverity.WARNING,
          description: `High abstraction concept "${concept.getSemanticIdentity()}" has few outgoing relations`,
          relatedEntityIds: [conceptId],
          suggestedFix: `Add more subconcepts or examples to this high-level concept`
        });
      }
      
      // 低抽象级别概念应该有更多的入度（作为子概念或示例）
      if (stats.abstractionLevel < 2 && stats.inDegree < 1) {
        不合理概念数量++;
        result.issues.push({
          type: ValidationIssueType.HIERARCHY_ISSUE,
          severity: ValidationIssueSeverity.WARNING,
          description: `Low abstraction concept "${concept.getSemanticIdentity()}" has few incoming relations`,
          relatedEntityIds: [conceptId],
          suggestedFix: `Connect this concept to higher-level concepts`
        });
      }
    });
    
    result.metrics.hierarchicalReasonableness = Math.max(0, 1 - (不合理概念数量 / concepts.length));
  }
  
  /**
   * 验证置信度水平
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param result 验证结果
   */
  private validateConfidenceLevels(
    concepts: CognitiveConcept[], 
    relations: CognitiveRelation[], 
    result: StructureValidationResult
  ): void {
    // 检查低置信度的概念和关系
    const lowConfidenceConcepts = concepts.filter(c => c.getConfidenceScore() < 0.3);
    const lowConfidenceRelations = relations.filter(r => r.getConfidenceScore() < 0.3);
    
    lowConfidenceConcepts.forEach(concept => {
      result.issues.push({
        type: ValidationIssueType.LOW_CONFIDENCE,
        severity: ValidationIssueSeverity.WARNING,
        description: `Concept "${concept.getSemanticIdentity()}" has low confidence score (${concept.getConfidenceScore().toFixed(2)})`,
        relatedEntityIds: [concept.getId()],
        suggestedFix: `Consider reviewing and updating this concept with more reliable information`
      });
    });
    
    lowConfidenceRelations.forEach(relation => {
      result.issues.push({
        type: ValidationIssueType.LOW_CONFIDENCE,
        severity: ValidationIssueSeverity.WARNING,
        description: `Relation has low confidence score (${relation.getConfidenceScore().toFixed(2)})`,
        relatedEntityIds: [relation.getId()],
        suggestedFix: `Consider verifying or updating this relation with more reliable information`
      });
    });
  }
  
  /**
   * 检测循环关系
   * @param concepts 概念列表
   * @param relations 关系列表
   * @returns 检测到的循环列表
   */
  private detectCycles(
    concepts: CognitiveConcept[], 
    relations: CognitiveRelation[]
  ): string[][] {
    // TODO: 实现循环检测算法
    return []; // 暂时返回空数组
  }
  
  /**
   * 计算验证分数
   * @param metrics 验证指标
   * @returns 计算得到的验证分数
   */
  private calculateValidationScore(metrics: StructureValidationResult['metrics']): number {
    const weights = {
      conceptCompleteness: 0.2,
      relationCompleteness: 0.2,
      structuralConsistency: 0.2,
      logicalCoherence: 0.2,
      hierarchicalReasonableness: 0.2
    };
    
    return 
      metrics.conceptCompleteness * weights.conceptCompleteness +
      metrics.relationCompleteness * weights.relationCompleteness +
      metrics.structuralConsistency * weights.structuralConsistency +
      metrics.logicalCoherence * weights.logicalCoherence +
      metrics.hierarchicalReasonableness * weights.hierarchicalReasonableness;
  }
}
