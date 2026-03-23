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
 * 演化趋势选项
 */
export interface EvolutionTrendOptions {
  /**
   * 时间范围
   */
  timeRange?: {
    start: Date;
    end: Date;
  };
  /**
   * 分析维度
   */
  dimensions?: string[];
  /**
   * 指标类型
   */
  metrics?: string[];
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
  keyEvents: any[];
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

/**
 * 概念演化模式
 */
export interface ConceptEvolutionPattern extends EvolutionPattern {
  /**
   * 概念ID
   */
  conceptId: string;
  /**
   * 概念名称
   */
  conceptName: string;
}

/**
 * 关系演化模式
 */
export interface RelationEvolutionPattern extends EvolutionPattern {
  /**
   * 关系ID
   */
  relationId: string;
  /**
   * 关系类型
   */
  relationType: string;
}

/**
 * 整体演化模式
 */
export interface OverallEvolutionPattern extends EvolutionPattern {
  /**
   * 覆盖范围
   */
  coverage: number;
}

/**
 * 演化模式识别选项
 */
export interface PatternRecognitionOptions {
  /**
   * 时间范围
   */
  timeRange?: {
    start: Date;
    end: Date;
  };
  /**
   * 模式类型
   */
  patternTypes?: EvolutionPatternType[];
  /**
   * 最小置信度
   */
  minConfidence?: number;
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
 * 概念演化选项
 */
export interface ConceptEvolutionOptions {
  /**
   * 时间范围
   */
  timeRange?: {
    start: Date;
    end: Date;
  };
  /**
   * 概念ID列表
   */
  conceptIds?: string[];
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
   * 概念演化详情
   */
  conceptDetails: any[];
  /**
   * 概念增长趋势
   */
  growthTrends: any[];
}

/**
 * 关系演化选项
 */
export interface RelationEvolutionOptions {
  /**
   * 时间范围
   */
  timeRange?: {
    start: Date;
    end: Date;
  };
  /**
   * 关系类型
   */
  relationTypes?: string[];
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
   * 关系演化详情
   */
  relationDetails: any[];
  /**
   * 关系增长趋势
   */
  growthTrends: any[];
}

/**
 * 影响评估选项
 */
export interface ImpactEvaluationOptions {
  /**
   * 影响范围
   */
  impactScope?: string[];
  /**
   * 评估方法
   */
  evaluationMethod?: string;
}

/**
 * 演化影响评估结果
 */
export interface EvolutionImpactResult extends EvolutionAnalysisResult {
  /**
   * 影响范围
   */
  impactScope: string[];
  /**
   * 影响程度
   */
  impactLevel: 'low' | 'medium' | 'high';
  /**
   * 影响指标
   */
  impactMetrics: Record<string, number>;
  /**
   * 受影响的概念
   */
  affectedConcepts: string[];
  /**
   * 受影响的关系
   */
  affectedRelations: string[];
}

/**
 * 演化预测选项
 */
export interface EvolutionPredictionOptions {
  /**
   * 预测时间范围
   */
  predictionTimeRange?: number;
  /**
   * 预测方法
   */
  predictionMethod?: string;
  /**
   * 预测指标
   */
  predictionMetrics?: string[];
}

/**
 * 演化预测结果
 */
export interface EvolutionPredictionResult extends EvolutionAnalysisResult {
  /**
   * 预测指标
   */
  predictionMetrics: any[];
  /**
   * 预测置信度
   */
  predictionConfidence: number;
  /**
   * 预测趋势
   */
  predictedTrends: any[];
  /**
   * 风险评估
   */
  riskAssessment: {
    risks: string[];
    riskLevels: Record<string, 'low' | 'medium' | 'high'>;
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
   * 综合建议
   */
  recommendations: string[];
  /**
   * 报告状态
   */
  status: 'draft' | 'completed' | 'archived';
  /**
   * 报告格式
   */
  format: 'pdf' | 'html' | 'json';
}

/**
 * 演化趋势可视化
 */
export interface EvolutionTrendVisualization {
  /**
   * 可视化ID
   */
  id: string;
  /**
   * 图表数据
   */
  chartData: any;
  /**
   * 事件标记
   */
  eventMarkers: any[];
  /**
   * 预测数据
   */
  predictions: any;
  /**
   * 建议
   */
  recommendations: string[];
}

/**
 * 概念演化可视化
 */
export interface ConceptEvolutionVisualization {
  /**
   * 可视化ID
   */
  id: string;
  /**
   * 概念演化图
   */
  conceptEvolutionGraph: any;
  /**
   * 概念增长趋势
   */
  growthTrends: any;
  /**
   * 关键事件
   */
  keyEvents: any[];
}

/**
 * 关系演化可视化
 */
export interface RelationEvolutionVisualization {
  /**
   * 可视化ID
   */
  id: string;
  /**
   * 关系演化图
   */
  relationEvolutionGraph: any;
  /**
   * 关系增长趋势
   */
  growthTrends: any;
  /**
   * 关系类型分布
   */
  relationTypeDistribution: any;
}

/**
 * 演化模式可视化
 */
export interface EvolutionPatternVisualization {
  /**
   * 可视化ID
   */
  id: string;
  /**
   * 模式分布图表
   */
  patternDistributionChart: any;
  /**
   * 模式详情
   */
  patternDetails: any[];
  /**
   * 主导模式可视化
   */
  dominantPatternVisualization: any;
}

/**
 * 演化图谱选项
 */
export interface EvolutionGraphOptions {
  /**
   * 时间范围
   */
  timeRange?: {
    start: Date;
    end: Date;
  };
  /**
   * 图谱类型
   */
  graphType?: 'concept' | 'relation' | 'overall';
  /**
   * 节点数量限制
   */
  maxNodes?: number;
  /**
   * 边数量限制
   */
  maxEdges?: number;
  /**
   * 是否包含预测
   */
  includePredictions?: boolean;
}

/**
 * 演化图谱
 */
export interface EvolutionGraph {
  /**
   * 图谱ID
   */
  id: string;
  /**
   * 节点列表
   */
  nodes: any[];
  /**
   * 边列表
   */
  edges: any[];
  /**
   * 时间范围
   */
  timeRange: {
    start: Date;
    end: Date;
  };
  /**
   * 图谱类型
   */
  graphType: 'concept' | 'relation' | 'overall';
  /**
   * 生成时间
   */
  generatedAt: Date;
  /**
   * 节点统计
   */
  nodeStats: {
    total: number;
    types: Record<string, number>;
  };
  /**
   * 边统计
   */
  edgeStats: {
    total: number;
    types: Record<string, number>;
  };
}