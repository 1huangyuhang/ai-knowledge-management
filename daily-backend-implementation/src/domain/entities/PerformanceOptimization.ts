/**
 * 性能优化实体
 * 表示系统性能优化的配置和状态
 */

export enum OptimizationType {
  /** 缓存优化 */
  CACHE = 'CACHE',
  /** 数据库优化 */
  DATABASE = 'DATABASE',
  /** API优化 */
  API = 'API',
  /** 内存优化 */
  MEMORY = 'MEMORY',
  /** CPU优化 */
  CPU = 'CPU',
  /** 网络优化 */
  NETWORK = 'NETWORK',
  /** 代码优化 */
  CODE = 'CODE'
}

export enum OptimizationStatus {
  /** 未优化 */
  NOT_OPTIMIZED = 'NOT_OPTIMIZED',
  /** 优化中 */
  OPTIMIZING = 'OPTIMIZING',
  /** 已优化 */
  OPTIMIZED = 'OPTIMIZED',
  /** 优化失败 */
  FAILED = 'FAILED'
}

export interface OptimizationConfig {
  /** 优化类型 */
  type: OptimizationType;
  /** 优化参数 */
  parameters: Record<string, any>;
  /** 是否启用 */
  enabled: boolean;
  /** 优先级 */
  priority: number;
}

export interface OptimizationMetric {
  /** 指标名称 */
  name: string;
  /** 指标值 */
  value: number;
  /** 指标单位 */
  unit: string;
  /** 指标描述 */
  description: string;
  /** 指标时间 */
  timestamp: Date;
}

export interface PerformanceBaseline {
  /** 基线ID */
  id: string;
  /** 创建时间 */
  createdAt: Date;
  /** 指标集合 */
  metrics: OptimizationMetric[];
}

export interface OptimizationResult {
  /** 优化ID */
  id: string;
  /** 优化类型 */
  type: OptimizationType;
  /** 优化配置 */
  config: OptimizationConfig;
  /** 优化前基线 */
  baseline: PerformanceBaseline;
  /** 优化后指标 */
  optimizedMetrics: OptimizationMetric[];
  /** 优化状态 */
  status: OptimizationStatus;
  /** 优化开始时间 */
  startTime: Date;
  /** 优化结束时间 */
  endTime?: Date;
  /** 优化效果百分比 */
  improvementPercentage?: number;
  /** 优化日志 */
  logs: string[];
}

export class PerformanceOptimization {
  /** 优化ID */
  private readonly _id: string;
  /** 优化类型 */
  private _type: OptimizationType;
  /** 优化配置 */
  private _config: OptimizationConfig;
  /** 优化状态 */
  private _status: OptimizationStatus;
  /** 优化结果 */
  private _result?: OptimizationResult;
  /** 创建时间 */
  private readonly _createdAt: Date;
  /** 更新时间 */
  private _updatedAt: Date;

  /**
   * 构造函数
   * @param id 优化ID
   * @param type 优化类型
   * @param config 优化配置
   */
  constructor(
    id: string,
    type: OptimizationType,
    config: OptimizationConfig
  ) {
    this._id = id;
    this._type = type;
    this._config = config;
    this._status = OptimizationStatus.NOT_OPTIMIZED;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 开始优化
   * @returns 优化实例
   */
  startOptimization(): this {
    this._status = OptimizationStatus.OPTIMIZING;
    this._updatedAt = new Date();
    return this;
  }

  /**
   * 完成优化
   * @param result 优化结果
   * @returns 优化实例
   */
  completeOptimization(result: OptimizationResult): this {
    this._status = OptimizationStatus.OPTIMIZED;
    this._result = result;
    this._updatedAt = new Date();
    return this;
  }

  /**
   * 优化失败
   * @param error 错误信息
   * @returns 优化实例
   */
  failOptimization(error: string): this {
    this._status = OptimizationStatus.FAILED;
    this._updatedAt = new Date();
    return this;
  }

  /**
   * 更新优化配置
   * @param config 优化配置
   * @returns 优化实例
   */
  updateConfig(config: Partial<OptimizationConfig>): this {
    this._config = {
      ...this._config,
      ...config
    };
    this._updatedAt = new Date();
    return this;
  }

  /**
   * 获取优化ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * 获取优化类型
   */
  get type(): OptimizationType {
    return this._type;
  }

  /**
   * 获取优化配置
   */
  get config(): OptimizationConfig {
    return { ...this._config };
  }

  /**
   * 获取优化状态
   */
  get status(): OptimizationStatus {
    return this._status;
  }

  /**
   * 获取优化结果
   */
  get result(): OptimizationResult | undefined {
    return this._result;
  }

  /**
   * 获取创建时间
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 获取更新时间
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
