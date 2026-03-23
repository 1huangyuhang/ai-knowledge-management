import { DateRange } from '../../../../domain/value-objects/date-range';
import { ModelEvolutionEvent } from '../../../../domain/entities/model-evolution-event';
import { UserId } from '../../../../domain/value-objects/user-id';
import { UUID } from '../../../../domain/value-objects/uuid';

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
  id: UUID;
  /**
   * 用户ID
   */
  userId: UserId;
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
  timeRange: DateRange;
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
  id: UUID;
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
 * 演化事件
 */
export interface EvolutionEvent {
  /**
   * 事件ID
   */
  id: UUID;
  /**
   * 事件类型
   */
  type: string;
  /**
   * 事件时间戳
   */
  timestamp: Date;
  /**
   * 事件数据
   */
  data: any;
}

/**
 * 演化趋势分析选项
 */
export interface EvolutionTrendOptions {
  /**
   * 开始日期
   */
  startDate?: Date;
  /**
   * 结束日期
   */
  endDate?: Date;
  /**
   * 分析指标
   */
  metrics?: string[];
  /**
   * 分析算法
   */
  algorithm?: string;
}

/**
 * 概念演化分析选项
 */
export interface ConceptEvolutionOptions {
  /**
   * 概念ID
   */
  conceptId?: string;
  /**
   * 时间范围
   */
  timeRange?: DateRange;
  /**
   * 分析维度
   */
  dimensions?: string[];
}

/**
 * 关系演化分析选项
 */
export interface RelationEvolutionOptions {
  /**
   * 关系ID
   */
  relationId?: string;
  /**
   * 时间范围
   */
  timeRange?: DateRange;
}

/**
 * 模式识别选项
 */
export interface PatternRecognitionOptions {
  /**
   * 时间范围
   */
  timeRange?: DateRange;
  /**
   * 识别算法
   */
  algorithm?: string;
  /**
   * 最小置信度
   */
  minConfidence?: number;
}

/**
 * 影响评估选项
 */
export interface ImpactEvaluationOptions {
  /**
   * 基准版本
   */
  baseVersionId?: string;
  /**
   * 对比版本
   */
  compareVersionId?: string;
  /**
   * 影响评估维度
   */
  dimensions?: string[];
}

/**
 * 演化预测选项
 */
export interface EvolutionPredictionOptions {
  /**
   * 预测时间范围（天）
   */
  predictionDays?: number;
  /**
   * 预测算法
   */
  algorithm?: string;
}

/**
 * 演化分析报告
 */
export interface EvolutionAnalysisReport {
  /**
   * 报告ID
   */
  id: UUID;
  /**
   * 报告标题
   */
  title: string;
  /**
   * 报告生成时间
   */
  generatedAt: Date;
  /**
   * 报告内容
   */
  content: string;
  /**
   * 报告格式
   */
  format: string;
  /**
   * 报告摘要
   */
  summary: string;
  /**
   * 可视化数据
   */
  visualizationData: any;
}

/**
 * 演化分析服务接口
 * 负责分析模型的演化过程
 */
export interface EvolutionAnalysisService {
  /**
   * 分析模型演化趋势
   * @param userId 用户ID
   * @param options 分析选项
   * @returns 演化趋势分析结果
   */
  analyzeEvolutionTrends(userId: UserId, options?: EvolutionTrendOptions): Promise<EvolutionTrendResult>;

  /**
   * 分析概念演化
   * @param userId 用户ID
   * @param conceptId 概念ID
   * @param options 分析选项
   * @returns 概念演化分析结果
   */
  analyzeConceptEvolution(userId: UserId, conceptId: string, options?: ConceptEvolutionOptions): Promise<EvolutionAnalysisResult>;

  /**
   * 分析关系演化
   * @param userId 用户ID
   * @param relationId 关系ID
   * @param options 分析选项
   * @returns 关系演化分析结果
   */
  analyzeRelationEvolution(userId: UserId, relationId: string, options?: RelationEvolutionOptions): Promise<EvolutionAnalysisResult>;

  /**
   * 识别演化模式
   * @param userId 用户ID
   * @param options 分析选项
   * @returns 演化模式识别结果
   */
  identifyEvolutionPatterns(userId: UserId, options?: PatternRecognitionOptions): Promise<EvolutionPatternResult>;

  /**
   * 评估演化影响
   * @param userId 用户ID
   * @param versionId 版本ID
   * @param options 分析选项
   * @returns 演化影响评估结果
   */
  evaluateEvolutionImpact(userId: UserId, versionId: string, options?: ImpactEvaluationOptions): Promise<EvolutionAnalysisResult>;

  /**
   * 预测模型演化
   * @param userId 用户ID
   * @param options 分析选项
   * @returns 演化预测结果
   */
  predictModelEvolution(userId: UserId, options?: EvolutionPredictionOptions): Promise<EvolutionAnalysisResult>;

  /**
   * 生成演化分析报告
   * @param userId 用户ID
   * @param analysisResults 分析结果列表
   * @returns 演化分析报告
   */
  generateAnalysisReport(userId: UserId, analysisResults: EvolutionAnalysisResult[]): Promise<EvolutionAnalysisReport>;
}

/**
 * 演化模式识别服务接口
 * 负责识别模型演化的模式
 */
export interface EvolutionPatternRecognitionService {
  /**
   * 识别概念演化模式
   * @param evolutionEvents 演化事件列表
   * @returns 概念演化模式
   */
  recognizeConceptPatterns(evolutionEvents: ModelEvolutionEvent[]): Promise<EvolutionPattern[]>;

  /**
   * 识别关系演化模式
   * @param evolutionEvents 演化事件列表
   * @returns 关系演化模式
   */
  recognizeRelationPatterns(evolutionEvents: ModelEvolutionEvent[]): Promise<EvolutionPattern[]>;

  /**
   * 识别整体演化模式
   * @param evolutionEvents 演化事件列表
   * @returns 整体演化模式
   */
  recognizeOverallPatterns(evolutionEvents: ModelEvolutionEvent[]): Promise<EvolutionPattern[]>;

  /**
   * 获取所有可用的演化模式
   * @returns 演化模式列表
   */
  getAvailablePatterns(): EvolutionPatternType[];
}

/**
 * 演化趋势可视化结果
 */
export interface EvolutionTrendVisualization {
  /**
   * 可视化ID
   */
  id: UUID;
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
 * 概念演化可视化结果
 */
export interface ConceptEvolutionVisualization {
  /**
   * 可视化ID
   */
  id: UUID;
  /**
   * 概念ID
   */
  conceptId: string;
  /**
   * 概念名称
   */
  conceptName: string;
  /**
   * 可视化数据
   */
  visualizationData: any;
  /**
   * 演化路径
   */
  evolutionPath: any[];
  /**
   * 关键事件
   */
  keyEvents: any[];
}

/**
 * 关系演化可视化结果
 */
export interface RelationEvolutionVisualization {
  /**
   * 可视化ID
   */
  id: UUID;
  /**
   * 关系ID
   */
  relationId: string;
  /**
   * 可视化数据
   */
  visualizationData: any;
  /**
   * 关系变化
   */
  relationChanges: any[];
}

/**
 * 演化模式可视化结果
 */
export interface EvolutionPatternVisualization {
  /**
   * 可视化ID
   */
  id: UUID;
  /**
   * 模式数据
   */
  patternData: any;
  /**
   * 模式分布
   */
  patternDistribution: any;
  /**
   * 主导模式
   */
  dominantPattern: any;
}

/**
 * 演化图谱
 */
export interface EvolutionGraph {
  /**
   * 图谱ID
   */
  id: UUID;
  /**
   * 节点数据
   */
  nodes: any[];
  /**
   * 边数据
   */
  edges: any[];
  /**
   * 时间范围
   */
  timeRange: DateRange;
  /**
   * 演化事件
   */
  events: any[];
}

/**
 * 演化图谱选项
 */
export interface EvolutionGraphOptions {
  /**
   * 时间范围
   */
  timeRange?: DateRange;
  /**
   * 图谱类型
   */
  graphType?: string;
  /**
   * 是否显示概念
   */
  showConcepts?: boolean;
  /**
   * 是否显示关系
   */
  showRelations?: boolean;
  /**
   * 是否显示演化事件
   */
  showEvents?: boolean;
}

/**
 * 演化可视化服务接口
 * 负责可视化演化分析结果
 */
export interface EvolutionVisualizationService {
  /**
   * 可视化演化趋势
   * @param trendResult 演化趋势分析结果
   * @returns 可视化数据
   */
  visualizeTrends(trendResult: EvolutionTrendResult): Promise<EvolutionTrendVisualization>;

  /**
   * 可视化概念演化
   * @param conceptResult 概念演化分析结果
   * @returns 可视化数据
   */
  visualizeConceptEvolution(conceptResult: EvolutionAnalysisResult): Promise<ConceptEvolutionVisualization>;

  /**
   * 可视化关系演化
   * @param relationResult 关系演化分析结果
   * @returns 可视化数据
   */
  visualizeRelationEvolution(relationResult: EvolutionAnalysisResult): Promise<RelationEvolutionVisualization>;

  /**
   * 可视化演化模式
   * @param patternResult 演化模式识别结果
   * @returns 可视化数据
   */
  visualizePatterns(patternResult: EvolutionPatternResult): Promise<EvolutionPatternVisualization>;

  /**
   * 生成演化图谱
   * @param userId 用户ID
   * @param options 图谱生成选项
   * @returns 演化图谱数据
   */
  generateEvolutionGraph(userId: UserId, options?: EvolutionGraphOptions): Promise<EvolutionGraph>;
}
