/**
 * 演化分析类型
 */
export enum EvolutionAnalysisType {
  /**
   * 趋势分析
   */
  TREND_ANALYSIS = 'TREND_ANALYSIS',
  /**
   * 概念演化分析
   */
  CONCEPT_EVOLUTION = 'CONCEPT_EVOLUTION',
  /**
   * 关系演化分析
   */
  RELATION_EVOLUTION = 'RELATION_EVOLUTION',
  /**
   * 模式识别
   */
  PATTERN_RECOGNITION = 'PATTERN_RECOGNITION',
  /**
   * 影响评估
   */
  IMPACT_EVALUATION = 'IMPACT_EVALUATION',
  /**
   * 演化预测
   */
  EVOLUTION_PREDICTION = 'EVOLUTION_PREDICTION'
}

/**
 * 演化分析结果
 */
export interface EvolutionAnalysisResult {
  /**
   * 分析结果ID
   */
  id: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 分析类型
   */
  type: EvolutionAnalysisType;
  /**
   * 分析时间
   */
  analyzedAt: Date;
  /**
   * 分析周期
   */
  timeRange: {
    start: Date;
    end: Date;
  };
  /**
   * 分析结果数据
   */
  data: any;
  /**
   * 分析结果摘要
   */
  summary: string;
  /**
   * 分析建议
   */
  recommendations: string[];
}

/**
 * 演化趋势选项
 */
export interface EvolutionTrendOptions {
  /**
   * 起始时间
   */
  startDate?: Date;
  /**
   * 结束时间
   */
  endDate?: Date;
  /**
   * 分析维度
   */
  dimensions?: string[];
  /**
   * 是否包含预测
   */
  includePredictions?: boolean;
}

/**
 * 演化趋势指标
 */
export interface EvolutionTrendMetrics {
  /**
   * 概念数量趋势
   */
  conceptCountTrend: {
    labels: string[];
    values: number[];
  };
  /**
   * 关系数量趋势
   */
  relationCountTrend: {
    labels: string[];
    values: number[];
  };
  /**
   * 模型大小趋势
   */
  modelSizeTrend: {
    labels: string[];
    values: number[];
  };
  /**
   * 演化速度趋势
   */
  evolutionSpeedTrend: {
    labels: string[];
    values: number[];
  };
  /**
   * 一致性得分趋势
   */
  consistencyScoreTrend: {
    labels: string[];
    values: number[];
  };
}

/**
 * 演化事件
 */
export interface EvolutionEvent {
  /**
   * 事件ID
   */
  id: string;
  /**
   * 事件类型
   */
  type: string;
  /**
   * 事件时间
   */
  timestamp: Date;
  /**
   * 事件数据
   */
  data: any;
  /**
   * 事件影响
   */
  impact: string;
}

/**
 * 演化趋势结果
 */
export interface EvolutionTrendResult extends EvolutionAnalysisResult {
  /**
   * 趋势指标
   */
  metrics: EvolutionTrendMetrics;
  /**
   * 关键演化事件
   */
  keyEvents: EvolutionEvent[];
  /**
   * 趋势预测
   */
  predictions: {
    conceptCount: number;
    relationCount: number;
    modelSize: number;
    evolutionSpeed: number;
    consistencyScore: number;
  };
}

/**
 * 概念演化选项
 */
export interface ConceptEvolutionOptions {
  /**
   * 起始时间
   */
  startDate?: Date;
  /**
   * 结束时间
   */
  endDate?: Date;
  /**
   * 分析维度
   */
  dimensions?: string[];
}

/**
 * 概念演化结果
 */
export interface ConceptEvolutionResult extends EvolutionAnalysisResult {
  /**
   * 概念ID
   */
  conceptId: string;
  /**
   * 概念名称
   */
  conceptName: string;
  /**
   * 演化指标
   */
  metrics: {
    /**
     * 概念出现频率
     */
    appearanceFrequency: number;
    /**
     * 关系数量变化
     */
    relationCountChange: number;
    /**
     * 重要性得分变化
     */
    importanceScoreChange: number;
    /**
     * 关联概念数量变化
     */
    relatedConceptsChange: number;
  };
  /**
   * 演化路径
   */
  evolutionPath: {
    timestamp: Date;
    state: any;
  }[];
}

/**
 * 关系演化选项
 */
export interface RelationEvolutionOptions {
  /**
   * 起始时间
   */
  startDate?: Date;
  /**
   * 结束时间
   */
  endDate?: Date;
  /**
   * 分析维度
   */
  dimensions?: string[];
}

/**
 * 关系演化结果
 */
export interface RelationEvolutionResult extends EvolutionAnalysisResult {
  /**
   * 关系ID
   */
  relationId: string;
  /**
   * 关系类型
   */
  relationType: string;
  /**
   * 演化指标
   */
  metrics: {
    /**
     * 关系强度变化
     */
    strengthChange: number;
    /**
     * 关系出现频率
     */
    appearanceFrequency: number;
    /**
     * 关联概念变化
     */
    relatedConceptsChange: number;
  };
  /**
   * 演化路径
   */
  evolutionPath: {
    timestamp: Date;
    state: any;
  }[];
}

/**
 * 模式识别选项
 */
export interface PatternRecognitionOptions {
  /**
   * 起始时间
   */
  startDate?: Date;
  /**
   * 结束时间
   */
  endDate?: Date;
  /**
   * 模式类型
   */
  patternTypes?: string[];
  /**
   * 置信度阈值
   */
  confidenceThreshold?: number;
}

/**
 * 演化模式类型
 */
export enum EvolutionPatternType {
  /**
   * 线性增长
   */
  LINEAR_GROWTH = 'LINEAR_GROWTH',
  /**
   * 指数增长
   */
  EXPONENTIAL_GROWTH = 'EXPONENTIAL_GROWTH',
  /**
   * 阶段性增长
   */
  PHASED_GROWTH = 'PHASED_GROWTH',
  /**
   * 波动增长
   */
  FLUCTUATING_GROWTH = 'FLUCTUATING_GROWTH',
  /**
   * 稳定演化
   */
  STABLE_EVOLUTION = 'STABLE_EVOLUTION',
  /**
   * 重构演化
   */
  RESTRUCTURING_EVOLUTION = 'RESTRUCTURING_EVOLUTION',
  /**
   * 衰退演化
   */
  DECLINING_EVOLUTION = 'DECLINING_EVOLUTION'
}



/**
 * 演化模式识别结果
 */
export interface EvolutionPatternResult extends EvolutionAnalysisResult {
  /**
   * 识别出的模式
   */
  patterns: EvolutionPattern[];
  /**
   * 模式分布
   */
  patternDistribution: Record<EvolutionPatternType, number>;
  /**
   * 主导模式
   */
  dominantPattern: EvolutionPattern;
}

/**
 * 影响评估选项
 */
export interface ImpactEvaluationOptions {
  /**
   * 分析深度
   */
  analysisDepth?: number;
  /**
   * 影响范围
   */
  impactScope?: string[];
}

/**
 * 演化影响评估结果
 */
export interface EvolutionImpactResult extends EvolutionAnalysisResult {
  /**
   * 版本ID
   */
  versionId: string;
  /**
   * 影响评估指标
   */
  metrics: {
    /**
     * 概念影响数量
     */
    affectedConcepts: number;
    /**
     * 关系影响数量
     */
    affectedRelations: number;
    /**
     * 模型一致性变化
     */
    consistencyChange: number;
    /**
     * 影响程度
     */
    impactScore: number;
  };
  /**
   * 影响分析详情
   */
  impactDetails: {
    /**
     * 正面影响
     */
    positiveImpacts: string[];
    /**
     * 负面影响
     */
    negativeImpacts: string[];
    /**
     * 中性影响
     */
    neutralImpacts: string[];
  };
}

/**
 * 演化预测选项
 */
export interface EvolutionPredictionOptions {
  /**
   * 预测周期（天）
   */
  predictionPeriodDays?: number;
  /**
   * 预测算法
   */
  predictionAlgorithm?: string;
  /**
   * 预测维度
   */
  predictionDimensions?: string[];
}

/**
 * 演化预测结果
 */
export interface EvolutionPredictionResult extends EvolutionAnalysisResult {
  /**
   * 预测指标
   */
  metrics: {
    /**
     * 预测概念数量
     */
    predictedConceptCount: number;
    /**
     * 预测关系数量
     */
    predictedRelationCount: number;
    /**
     * 预测模型大小
     */
    predictedModelSize: number;
    /**
     * 预测演化速度
     */
    predictedEvolutionSpeed: number;
    /**
     * 预测一致性得分
     */
    predictedConsistencyScore: number;
  };
  /**
   * 预测趋势
   */
  predictedTrends: {
    /**
     * 趋势类型
     */
    type: string;
    /**
     * 置信度
     */
    confidence: number;
    /**
     * 描述
     */
    description: string;
  }[];
  /**
   * 风险评估
   */
  riskAssessment: {
    /**
     * 风险等级
     */
    riskLevel: string;
    /**
     * 风险描述
     */
    riskDescription: string;
    /**
     * 风险缓解建议
     */
    mitigationSuggestions: string[];
  };
}

/**
 * 演化分析报告
 */
export interface EvolutionAnalysisReport {
  /**
   * 报告ID
   */
  id: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 报告生成时间
   */
  generatedAt: Date;
  /**
   * 报告标题
   */
  title: string;
  /**
   * 报告摘要
   */
  summary: string;
  /**
   * 分析结果列表
   */
  analysisResults: EvolutionAnalysisResult[];
  /**
   * 综合结论
   */
  conclusions: string[];
  /**
   * 综合建议
   */
  recommendations: string[];
  /**
   * 报告版本
   */
  version: string;
}

/**
 * 演化模式
 */
export interface EvolutionPattern {
  /**
   * 模式ID
   */
  id: string;
  /**
   * 模式名称
   */
  name: string;
  /**
   * 模式类型
   */
  type: EvolutionPatternType;
  /**
   * 模式描述
   */
  description: string;
  /**
   * 模式置信度
   */
  confidence: number;
  /**
   * 模式特征
   */
  features: {
    /**
     * 起始时间
     */
    startTime: Date;
    /**
     * 结束时间
     */
    endTime: Date;
    /**
     * 持续时间（天）
     */
    durationDays: number;
    /**
     * 关键指标变化
     */
    keyMetricChanges: Record<string, number>;
  };
}
