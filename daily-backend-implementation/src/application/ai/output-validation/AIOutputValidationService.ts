/**
 * AI输出验证服务
 * 用于验证AI生成的认知模型数据的正确性、一致性和可靠性
 */
import { CognitiveConcept } from '../../../domain/entities';
import { CognitiveRelation } from '../../../domain/entities';
import { LLMClient } from '../../services/llm/LLMClient';
import { ConfidenceScoringService } from '../confidence-scoring/ConfidenceScoringService';
import { StructureValidationService } from '../structure-validation/StructureValidationService';

/**
 * AI输出验证请求
 */
export interface AIOutputValidationRequest {
  /**
   * AI生成的认知概念列表
   */
  concepts: CognitiveConcept[];
  
  /**
   * AI生成的认知关系列表
   */
  relations: CognitiveRelation[];
  
  /**
   * 原始输入文本
   */
  originalInput: string;
  
  /**
   * 可选的上下文信息
   */
  context?: string;
}

/**
 * AI输出验证结果
 */
export interface AIOutputValidationResult {
  /**
   * 验证是否通过
   */
  isValid: boolean;
  
  /**
   * 验证总分（0-1）
   */
  overallScore: number;
  
  /**
   * 各维度的验证分数
   */
  dimensionScores: {
    /**
     * 概念验证分数（0-1）
     */
    conceptValidation: number;
    
    /**
     * 关系验证分数（0-1）
     */
    relationValidation: number;
    
    /**
     * 结构一致性分数（0-1）
     */
    structuralConsistency: number;
    
    /**
     * 逻辑连贯性分数（0-1）
     */
    logicalCoherence: number;
    
    /**
     * 语义准确性分数（0-1）
     */
    semanticAccuracy: number;
    
    /**
     * 置信度分数（0-1）
     */
    confidenceScore: number;
  };
  
  /**
   * 验证中发现的问题列表
   */
  issues: ValidationProblem[];
  
  /**
   * 建议的改进措施
   */
  recommendations: string[];
}

/**
 * 验证问题
 */
export interface ValidationProblem {
  /**
   * 问题类型
   */
  type: ValidationProblemType;
  
  /**
   * 问题严重程度
   */
  severity: ValidationProblemSeverity;
  
  /**
   * 问题描述
   */
  description: string;
  
  /**
   * 相关实体ID列表
   */
  relatedEntityIds: string[];
}

/**
 * 验证问题类型
 */
export enum ValidationProblemType {
  /**
   * 概念语义不准确
   */
  INACCURATE_CONCEPT_SEMANTICS = 'inaccurate_concept_semantics',
  
  /**
   * 关系类型错误
   */
  INCORRECT_RELATION_TYPE = 'incorrect_relation_type',
  
  /**
   * 逻辑矛盾
   */
  LOGICAL_CONTRADICTION = 'logical_contradiction',
  
  /**
   * 结构不一致
   */
  STRUCTURAL_INCONSISTENCY = 'structural_inconsistency',
  
  /**
   * 置信度过低
   */
  LOW_CONFIDENCE = 'low_confidence',
  
  /**
   * 冗余信息
   */
  REDUNDANT_INFORMATION = 'redundant_information',
  
  /**
   * 信息缺失
   */
  MISSING_INFORMATION = 'missing_information',
  
  /**
   * 与输入不符
   */
  INPUT_MISMATCH = 'input_mismatch',
}

/**
 * 验证问题严重程度
 */
export enum ValidationProblemSeverity {
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
 * AI输出验证服务接口
 */
export interface AIOutputValidationService {
  /**
   * 验证AI生成的认知模型输出
   * @param request AI输出验证请求
   * @returns AI输出验证结果
   */
  validateAIOutput(request: AIOutputValidationRequest): Promise<AIOutputValidationResult>;
  
  /**
   * 批量验证多个AI输出
   * @param requests AI输出验证请求数组
   * @returns AI输出验证结果数组，每个元素对应一个请求的结果
   */
  batchValidateAIOutput(requests: AIOutputValidationRequest[]): Promise<AIOutputValidationResult[]>;
  
  /**
   * 生成验证报告
   * @param results 验证结果列表
   * @returns 格式化的验证报告
   */
  generateValidationReport(results: AIOutputValidationResult[]): string;
}

/**
 * 基于多维度的AI输出验证服务实现
 */
export class MultiDimensionalAIOutputValidationService implements AIOutputValidationService {
  private readonly llmClient: LLMClient;
  private readonly confidenceScoringService: ConfidenceScoringService;
  private readonly structureValidationService: StructureValidationService;
  
  /**
   * 创建MultiDimensionalAIOutputValidationService实例
   * @param llmClient LLM客户端
   * @param confidenceScoringService 置信度评分服务
   * @param structureValidationService 结构验证服务
   */
  constructor(
    llmClient: LLMClient,
    confidenceScoringService: ConfidenceScoringService,
    structureValidationService: StructureValidationService
  ) {
    this.llmClient = llmClient;
    this.confidenceScoringService = confidenceScoringService;
    this.structureValidationService = structureValidationService;
  }
  
  /**
   * 验证AI生成的认知模型输出
   * @param request AI输出验证请求
   * @returns AI输出验证结果
   */
  async validateAIOutput(request: AIOutputValidationRequest): Promise<AIOutputValidationResult> {
    const { concepts, relations, originalInput, context } = request;
    
    // 初始化验证结果
    const result: AIOutputValidationResult = {
      isValid: true,
      overallScore: 0,
      dimensionScores: {
        conceptValidation: 0,
        relationValidation: 0,
        structuralConsistency: 0,
        logicalCoherence: 0,
        semanticAccuracy: 0,
        confidenceScore: 0
      },
      issues: [],
      recommendations: []
    };
    
    // 1. 验证概念
    const conceptValidationResult = await this.validateConcepts(concepts, originalInput);
    result.dimensionScores.conceptValidation = conceptValidationResult.score;
    result.issues.push(...conceptValidationResult.issues);
    
    // 2. 验证关系
    const relationValidationResult = await this.validateRelations(relations, concepts, originalInput);
    result.dimensionScores.relationValidation = relationValidationResult.score;
    result.issues.push(...relationValidationResult.issues);
    
    // 3. 验证语义准确性
    const semanticAccuracy = await this.validateSemanticAccuracy(concepts, relations, originalInput);
    result.dimensionScores.semanticAccuracy = semanticAccuracy;
    
    // 4. 验证结构一致性
    // TODO: 需要创建一个临时的认知模型来进行结构验证
    // const structureValidation = await this.validateStructuralConsistency(concepts, relations);
    // result.dimensionScores.structuralConsistency = structureValidation;
    
    // 5. 验证逻辑连贯性
    const logicalCoherence = await this.validateLogicalCoherence(concepts, relations, originalInput);
    result.dimensionScores.logicalCoherence = logicalCoherence;
    
    // 6. 验证置信度
    const confidenceScore = await this.validateConfidence(concepts, relations);
    result.dimensionScores.confidenceScore = confidenceScore;
    
    // 计算总分
    result.overallScore = this.calculateOverallScore(result.dimensionScores);
    
    // 确定是否通过验证
    result.isValid = result.overallScore > 0.6 && 
                   result.issues.every(issue => issue.severity < ValidationProblemSeverity.ERROR);
    
    // 生成建议
    result.recommendations = this.generateRecommendations(result);
    
    return result;
  }
  
  /**
   * 批量验证多个AI输出
   * @param requests AI输出验证请求数组
   * @returns AI输出验证结果数组，每个元素对应一个请求的结果
   */
  async batchValidateAIOutput(requests: AIOutputValidationRequest[]): Promise<AIOutputValidationResult[]> {
    // 并发验证多个请求
    return Promise.all(requests.map(request => this.validateAIOutput(request)));
  }
  
  /**
   * 生成验证报告
   * @param results 验证结果列表
   * @returns 格式化的验证报告
   */
  generateValidationReport(results: AIOutputValidationResult[]): string {
    let report = '# AI输出验证报告\n\n';
    
    // 汇总统计
    const totalScore = results.reduce((sum, result) => sum + result.overallScore, 0) / results.length;
    const validResults = results.filter(result => result.isValid).length;
    const invalidResults = results.length - validResults;
    
    report += `## 总体统计\n\n`;
    report += `| 指标 | 数值 |\n`;
    report += `|------|------|\n`;
    report += `| 验证总数 | ${results.length} |\n`;
    report += `| 通过验证 | ${validResults} |\n`;
    report += `| 未通过验证 | ${invalidResults} |\n`;
    report += `| 平均分数 | ${totalScore.toFixed(2)} |\n\n`;
    
    // 详细结果
    report += `## 详细验证结果\n\n`;
    results.forEach((result, index) => {
      report += `### 验证结果 ${index + 1}\n\n`;
      report += `**总体状态**: ${result.isValid ? '通过' : '未通过'}\n`;
      report += `**总体分数**: ${result.overallScore.toFixed(2)}\n\n`;
      
      report += `#### 维度分数\n\n`;
      report += `| 维度 | 分数 |\n`;
      report += `|------|------|\n`;
      report += `| 概念验证 | ${result.dimensionScores.conceptValidation.toFixed(2)} |\n`;
      report += `| 关系验证 | ${result.dimensionScores.relationValidation.toFixed(2)} |\n`;
      report += `| 结构一致性 | ${result.dimensionScores.structuralConsistency.toFixed(2)} |\n`;
      report += `| 逻辑连贯性 | ${result.dimensionScores.logicalCoherence.toFixed(2)} |\n`;
      report += `| 语义准确性 | ${result.dimensionScores.semanticAccuracy.toFixed(2)} |\n`;
      report += `| 置信度分数 | ${result.dimensionScores.confidenceScore.toFixed(2)} |\n\n`;
      
      if (result.issues.length > 0) {
        report += `#### 发现的问题\n\n`;
        result.issues.forEach(issue => {
          report += `- **[${issue.severity}] ${issue.type}**: ${issue.description}\n`;
          if (issue.relatedEntityIds.length > 0) {
            report += `  - 相关实体: ${issue.relatedEntityIds.join(', ')}\n`;
          }
        });
        report += `\n`;
      }
      
      if (result.recommendations.length > 0) {
        report += `#### 改进建议\n\n`;
        result.recommendations.forEach((recommendation, recIndex) => {
          report += `${recIndex + 1}. ${recommendation}\n`;
        });
        report += `\n`;
      }
    });
    
    return report;
  }
  
  /**
   * 验证概念
   * @param concepts 要验证的概念列表
   * @param originalInput 原始输入文本
   * @returns 概念验证结果
   */
  private async validateConcepts(
    concepts: CognitiveConcept[],
    originalInput: string
  ): Promise<{ score: number; issues: ValidationProblem[] }> {
    const issues: ValidationProblem[] = [];
    
    // 检查概念数量是否合理
    if (concepts.length === 0) {
      issues.push({
        type: ValidationProblemType.MISSING_INFORMATION,
        severity: ValidationProblemSeverity.ERROR,
        description: 'No concepts were generated',
        relatedEntityIds: []
      });
      return { score: 0, issues };
    }
    
    // 检查每个概念的基本属性
    concepts.forEach(concept => {
      if (!concept.getSemanticIdentity() || concept.getSemanticIdentity().trim() === '') {
        issues.push({
          type: ValidationProblemType.INACCURATE_CONCEPT_SEMANTICS,
          severity: ValidationProblemSeverity.ERROR,
          description: `Concept has empty semantic identity`,
          relatedEntityIds: [concept.getId()]
        });
      }
      
      if (concept.getConfidenceScore() < 0.3) {
        issues.push({
          type: ValidationProblemType.LOW_CONFIDENCE,
          severity: ValidationProblemSeverity.WARNING,
          description: `Concept has low confidence score (${concept.getConfidenceScore().toFixed(2)})`,
          relatedEntityIds: [concept.getId()]
        });
      }
    });
    
    // 计算分数
    const score = Math.max(0, 1 - (issues.length / concepts.length));
    
    return { score, issues };
  }
  
  /**
   * 验证关系
   * @param relations 要验证的关系列表
   * @param concepts 相关概念列表
   * @param originalInput 原始输入文本
   * @returns 关系验证结果
   */
  private async validateRelations(
    relations: CognitiveRelation[],
    concepts: CognitiveConcept[],
    originalInput: string
  ): Promise<{ score: number; issues: ValidationProblem[] }> {
    const issues: ValidationProblem[] = [];
    const conceptIds = new Set(concepts.map(concept => concept.getId()));
    
    // 检查关系是否引用了不存在的概念
    relations.forEach(relation => {
      if (!conceptIds.has(relation.getSourceConceptId()) || 
          !conceptIds.has(relation.getTargetConceptId())) {
        issues.push({
          type: ValidationProblemType.STRUCTURAL_INCONSISTENCY,
          severity: ValidationProblemSeverity.ERROR,
          description: `Relation references non-existent concepts`,
          relatedEntityIds: [relation.getId()]
        });
      }
      
      if (relation.getConfidenceScore() < 0.3) {
        issues.push({
          type: ValidationProblemType.LOW_CONFIDENCE,
          severity: ValidationProblemSeverity.WARNING,
          description: `Relation has low confidence score (${relation.getConfidenceScore().toFixed(2)})`,
          relatedEntityIds: [relation.getId()]
        });
      }
    });
    
    // 计算分数
    const score = relations.length > 0 
      ? Math.max(0, 1 - (issues.length / relations.length)) 
      : 0.5; // 如果没有关系，给予中等分数
    
    return { score, issues };
  }
  
  /**
   * 验证语义准确性
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param originalInput 原始输入文本
   * @returns 语义准确性分数（0-1）
   */
  private async validateSemanticAccuracy(
    concepts: CognitiveConcept[],
    relations: CognitiveRelation[],
    originalInput: string
  ): Promise<number> {
    // TODO: 实现基于LLM的语义准确性验证
    return 0.8; // 暂时使用默认值
  }
  
  /**
   * 验证逻辑连贯性
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param originalInput 原始输入文本
   * @returns 逻辑连贯性分数（0-1）
   */
  private async validateLogicalCoherence(
    concepts: CognitiveConcept[],
    relations: CognitiveRelation[],
    originalInput: string
  ): Promise<number> {
    // TODO: 实现基于LLM的逻辑连贯性验证
    return 0.75; // 暂时使用默认值
  }
  
  /**
   * 验证置信度
   * @param concepts 概念列表
   * @param relations 关系列表
   * @returns 置信度分数（0-1）
   */
  private async validateConfidence(
    concepts: CognitiveConcept[],
    relations: CognitiveRelation[]
  ): Promise<number> {
    // 计算平均置信度分数
    let totalScore = 0;
    let totalEntities = 0;
    
    // 计算概念的平均置信度
    concepts.forEach(concept => {
      totalScore += concept.getConfidenceScore();
      totalEntities++;
    });
    
    // 计算关系的平均置信度
    relations.forEach(relation => {
      totalScore += relation.getConfidenceScore();
      totalEntities++;
    });
    
    return totalEntities > 0 ? totalScore / totalEntities : 0;
  }
  
  /**
   * 计算总体验证分数
   * @param dimensionScores 各维度分数
   * @returns 总体验证分数
   */
  private calculateOverallScore(dimensionScores: AIOutputValidationResult['dimensionScores']): number {
    const weights = {
      conceptValidation: 0.2,
      relationValidation: 0.2,
      structuralConsistency: 0.15,
      logicalCoherence: 0.15,
      semanticAccuracy: 0.15,
      confidenceScore: 0.15
    };
    
    return 
      dimensionScores.conceptValidation * weights.conceptValidation +
      dimensionScores.relationValidation * weights.relationValidation +
      dimensionScores.structuralConsistency * weights.structuralConsistency +
      dimensionScores.logicalCoherence * weights.logicalCoherence +
      dimensionScores.semanticAccuracy * weights.semanticAccuracy +
      dimensionScores.confidenceScore * weights.confidenceScore;
  }
  
  /**
   * 生成改进建议
   * @param result 验证结果
   * @returns 改进建议列表
   */
  private generateRecommendations(result: AIOutputValidationResult): string[] {
    const recommendations: string[] = [];
    
    if (result.dimensionScores.conceptValidation < 0.6) {
      recommendations.push('Improve the quality and relevance of generated concepts');
    }
    
    if (result.dimensionScores.relationValidation < 0.6) {
      recommendations.push('Enhance the accuracy of relation types between concepts');
    }
    
    if (result.dimensionScores.structuralConsistency < 0.6) {
      recommendations.push('Optimize the structural consistency of the cognitive model');
    }
    
    if (result.dimensionScores.logicalCoherence < 0.6) {
      recommendations.push('Improve the logical coherence of concept relationships');
    }
    
    if (result.dimensionScores.semanticAccuracy < 0.6) {
      recommendations.push('Enhance the semantic accuracy of generated content');
    }
    
    if (result.dimensionScores.confidenceScore < 0.6) {
      recommendations.push('Increase the confidence scores of generated entities');
    }
    
    return recommendations;
  }
}
