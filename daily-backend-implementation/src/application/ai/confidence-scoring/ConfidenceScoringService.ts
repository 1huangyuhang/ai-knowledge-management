/**
 * 置信度评分服务
 * 用于评估认知概念和关系的置信度
 */
import { CognitiveConcept } from '../../../domain/entities';
import { CognitiveRelation } from '../../../domain/entities';
import { SimilaritySearchService } from '../../services/llm/embedding/SimilaritySearchService';
import { LLMClient } from '../../services/llm/LLMClient';

/**
 * 置信度评分请求
 */
export interface ConfidenceScoringRequest {
  /**
   * 要评分的实体（概念或关系）
   */
  entity: CognitiveConcept | CognitiveRelation;
  
  /**
   * 可选的上下文信息
   */
  context?: string;
  
  /**
   * 可选的相关实体列表
   */
  relatedEntities?: (CognitiveConcept | CognitiveRelation)[];
}

/**
 * 置信度评分结果
 */
export interface ConfidenceScoringResult {
  /**
   * 原始置信度评分
   */
  originalScore: number;
  
  /**
   * 调整后的置信度评分（0-1）
   */
  adjustedScore: number;
  
  /**
   * 评分调整的原因
   */
  adjustmentReason: string;
  
  /**
   * 评分的详细指标
   */
  metrics: {
    /**
     * 语义一致性得分（0-1）
     */
    semanticConsistency: number;
    
    /**
     * 结构一致性得分（0-1）
     */
    structuralConsistency: number;
    
    /**
     * 来源可信度得分（0-1）
     */
    sourceReliability: number;
    
    /**
     * 上下文相关性得分（0-1）
     */
    contextRelevance: number;
  };
}

/**
 * 置信度评分服务接口
 */
export interface ConfidenceScoringService {
  /**
   * 评估单个实体的置信度
   * @param request 置信度评分请求
   * @returns 置信度评分结果
   */
  scoreConfidence(request: ConfidenceScoringRequest): Promise<ConfidenceScoringResult>;
  
  /**
   * 批量评估多个实体的置信度
   * @param requests 置信度评分请求数组
   * @returns 置信度评分结果数组，每个元素对应一个请求的结果
   */
  batchScoreConfidence(requests: ConfidenceScoringRequest[]): Promise<ConfidenceScoringResult[]>;
  
  /**
   * 验证置信度评分是否达到阈值
   * @param score 要验证的置信度评分
   * @param threshold 阈值（默认0.5）
   * @returns 评分是否达到阈值
   */
  isConfidenceThresholdMet(score: number, threshold?: number): boolean;
}

/**
 * 基于多因素的置信度评分服务实现
 * 考虑语义一致性、结构一致性、来源可信度和上下文相关性等因素
 */
export class MultiFactorConfidenceScoringService implements ConfidenceScoringService {
  private readonly similarityService: SimilaritySearchService;
  private readonly llmClient: LLMClient;
  
  /**
   * 创建MultiFactorConfidenceScoringService实例
   * @param similarityService 相似度搜索服务
   * @param llmClient LLM客户端
   */
  constructor(similarityService: SimilaritySearchService, llmClient: LLMClient) {
    this.similarityService = similarityService;
    this.llmClient = llmClient;
  }
  
  /**
   * 评估单个实体的置信度
   * @param request 置信度评分请求
   * @returns 置信度评分结果
   */
  async scoreConfidence(request: ConfidenceScoringRequest): Promise<ConfidenceScoringResult> {
    const { entity, context, relatedEntities = [] } = request;
    
    // 获取实体的原始置信度评分
    const originalScore = entity.getConfidenceScore();
    
    // 计算各项指标
    const metrics = await this.calculateMetrics(entity, context, relatedEntities);
    
    // 基于指标调整置信度评分
    const { adjustedScore, adjustmentReason } = this.adjustScore(originalScore, metrics);
    
    return {
      originalScore,
      adjustedScore,
      adjustmentReason,
      metrics
    };
  }
  
  /**
   * 批量评估多个实体的置信度
   * @param requests 置信度评分请求数组
   * @returns 置信度评分结果数组，每个元素对应一个请求的结果
   */
  async batchScoreConfidence(requests: ConfidenceScoringRequest[]): Promise<ConfidenceScoringResult[]> {
    // 并发处理多个请求
    return Promise.all(requests.map(request => this.scoreConfidence(request)));
  }
  
  /**
   * 验证置信度评分是否达到阈值
   * @param score 要验证的置信度评分
   * @param threshold 阈值（默认0.5）
   * @returns 评分是否达到阈值
   */
  isConfidenceThresholdMet(score: number, threshold: number = 0.5): boolean {
    return score >= threshold;
  }
  
  /**
   * 计算置信度评分的各项指标
   * @param entity 要评分的实体
   * @param context 可选的上下文信息
   * @param relatedEntities 相关实体列表
   * @returns 计算得到的各项指标
   */
  private async calculateMetrics(
    entity: CognitiveConcept | CognitiveRelation, 
    context?: string, 
    relatedEntities: (CognitiveConcept | CognitiveRelation)[] = []
  ): Promise<ConfidenceScoringResult['metrics']> {
    // 初始化为默认值
    const metrics: ConfidenceScoringResult['metrics'] = {
      semanticConsistency: 0.5,
      structuralConsistency: 0.5,
      sourceReliability: 0.7,
      contextRelevance: 0.6
    };
    
    // TODO: 实现各项指标的具体计算逻辑
    // 1. 语义一致性：使用相似度搜索服务比较实体与相关实体的语义相似性
    // 2. 结构一致性：分析实体在认知模型中的结构位置和关系
    // 3. 来源可信度：评估实体来源的可信度
    // 4. 上下文相关性：分析实体与提供的上下文的相关性
    
    return metrics;
  }
  
  /**
   * 基于各项指标调整置信度评分
   * @param originalScore 原始置信度评分
   * @param metrics 计算得到的各项指标
   * @returns 调整后的评分和调整原因
   */
  private adjustScore(
    originalScore: number, 
    metrics: ConfidenceScoringResult['metrics']
  ): { adjustedScore: number; adjustmentReason: string } {
    // 各项指标的权重
    const weights = {
      semanticConsistency: 0.3,
      structuralConsistency: 0.3,
      sourceReliability: 0.2,
      contextRelevance: 0.2
    };
    
    // 计算加权平均分
    const weightedAverage = 
      metrics.semanticConsistency * weights.semanticConsistency +
      metrics.structuralConsistency * weights.structuralConsistency +
      metrics.sourceReliability * weights.sourceReliability +
      metrics.contextRelevance * weights.contextRelevance;
    
    // 结合原始评分和加权平均分，使用加权平均法调整评分
    const adjustedScore = Math.max(0, Math.min(1, originalScore * 0.6 + weightedAverage * 0.4));
    
    // 生成调整原因
    let adjustmentReason = `Adjusted from original score ${originalScore.toFixed(2)} based on: `;
    adjustmentReason += `semantic consistency (${metrics.semanticConsistency.toFixed(2)}, weight ${weights.semanticConsistency}), `;
    adjustmentReason += `structural consistency (${metrics.structuralConsistency.toFixed(2)}, weight ${weights.structuralConsistency}), `;
    adjustmentReason += `source reliability (${metrics.sourceReliability.toFixed(2)}, weight ${weights.sourceReliability}), `;
    adjustmentReason += `context relevance (${metrics.contextRelevance.toFixed(2)}, weight ${weights.contextRelevance})`;
    
    return { adjustedScore, adjustmentReason };
  }
}
