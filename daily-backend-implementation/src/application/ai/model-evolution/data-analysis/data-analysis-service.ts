/**
 * 数据分析服务接口
 * 负责提供数据分析功能，支持演化分析模块
 */

/**
 * 数据分析服务接口
 */
export interface DataAnalysisService {
  /**
   * 计算趋势指标
   * @param data 输入数据
   * @param options 分析选项
   * @returns 趋势指标
   */
  calculateTrendMetrics(data: any[], options?: TrendAnalysisOptions): Promise<TrendMetrics>;

  /**
   * 识别关键事件
   * @param events 事件列表
   * @param options 分析选项
   * @returns 关键事件列表
   */
  identifyKeyEvents(events: any[], options?: KeyEventOptions): Promise<KeyEvent[]>;

  /**
   * 预测未来趋势
   * @param metrics 趋势指标
   * @param options 预测选项
   * @returns 预测结果
   */
  predictFutureTrends(metrics: TrendMetrics, options?: PredictionOptions): Promise<PredictionResult>;

  /**
   * 生成建议
   * @param metrics 趋势指标
   * @param predictions 预测结果
   * @param options 建议生成选项
   * @returns 建议列表
   */
  generateRecommendations(metrics: TrendMetrics, predictions: PredictionResult, options?: RecommendationOptions): Promise<string[]>;

  /**
   * 计算影响指标
   * @param events 事件列表
   * @param options 分析选项
   * @returns 影响指标
   */
  calculateImpactMetrics(events: any[], options?: ImpactAnalysisOptions): Promise<ImpactMetrics>;

  /**
   * 分析影响详情
   * @param events 事件列表
   * @param options 分析选项
   * @returns 影响详情
   */
  analyzeImpactDetails(events: any[], options?: ImpactAnalysisOptions): Promise<ImpactDetails>;

  /**
   * 计算模式分布
   * @param patterns 模式列表
   * @returns 模式分布
   */
  calculatePatternDistribution(patterns: any[]): Promise<PatternDistribution>;

  /**
   * 确定主导模式
   * @param patterns 模式列表
   * @returns 主导模式
   */
  determineDominantPattern(patterns: any[]): Promise<any>;
}

/**
 * 趋势分析选项
 */
export interface TrendAnalysisOptions {
  /**
   * 时间窗口大小
   */
  timeWindow?: number;
  /**
   * 分析指标
   */
  metrics?: string[];
  /**
   * 采样率
   */
  samplingRate?: number;
}

/**
 * 关键事件选项
 */
export interface KeyEventOptions {
  /**
   * 事件类型过滤
   */
  eventTypes?: string[];
  /**
   * 影响阈值
   */
  impactThreshold?: number;
}

/**
 * 预测选项
 */
export interface PredictionOptions {
  /**
   * 预测时间范围
   */
  predictionHorizon?: number;
  /**
   * 预测算法
   */
  algorithm?: string;
  /**
   * 置信水平
   */
  confidenceLevel?: number;
}

/**
 * 建议生成选项
 */
export interface RecommendationOptions {
  /**
   * 建议数量
   */
  recommendationCount?: number;
  /**
   * 建议类型
   */
  recommendationTypes?: string[];
}

/**
 * 影响分析选项
 */
export interface ImpactAnalysisOptions {
  /**
   * 影响维度
   */
  impactDimensions?: string[];
  /**
   * 影响阈值
   */
  impactThreshold?: number;
}

/**
 * 趋势指标
 */
export interface TrendMetrics {
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
 * 关键事件
 */
export interface KeyEvent {
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
   * 事件描述
   */
  description: string;
  /**
   * 影响程度
   */
  impact: number;
  /**
   * 相关实体
   */
  relatedEntities: string[];
}

/**
 * 预测结果
 */
export interface PredictionResult {
  /**
   * 概念数量预测
   */
  conceptCount: number;
  /**
   * 关系数量预测
   */
  relationCount: number;
  /**
   * 模型大小预测
   */
  modelSize: number;
  /**
   * 演化速度预测
   */
  evolutionSpeed: number;
  /**
   * 一致性得分预测
   */
  consistencyScore: number;
  /**
   * 置信区间
   */
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

/**
 * 影响指标
 */
export interface ImpactMetrics {
  /**
   * 影响范围
   */
  impactScope: number;
  /**
   * 影响程度
   */
  impactDegree: number;
  /**
   * 影响持续时间
   */
  impactDuration: number;
  /**
   * 影响扩散速度
   */
  impactSpreadSpeed: number;
}

/**
 * 影响详情
 */
export interface ImpactDetails {
  /**
   * 影响的概念
   */
  affectedConcepts: string[];
  /**
   * 影响的关系
   */
  affectedRelations: string[];
  /**
   * 影响的版本
   */
  affectedVersions: string[];
  /**
   * 影响传播路径
   */
  impactSpreadPath: string[];
}

/**
 * 模式分布
 */
export interface PatternDistribution {
  /**
   * 模式类型分布
   */
  [patternType: string]: number;
}
