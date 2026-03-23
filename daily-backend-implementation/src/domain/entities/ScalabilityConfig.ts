/**
 * 可扩展性配置实体
 * 表示系统的可扩展性配置和策略
 */

export enum ScalabilityLevel {
  /** 低可扩展性级别 */
  LOW = 'LOW',
  /** 中可扩展性级别 */
  MEDIUM = 'MEDIUM',
  /** 高可扩展性级别 */
  HIGH = 'HIGH',
  /** 极高可扩展性级别 */
  CRITICAL = 'CRITICAL'
}

export enum ScalingStrategy {
  /** 手动扩展 */
  MANUAL = 'MANUAL',
  /** 自动扩展 */
  AUTOMATIC = 'AUTOMATIC',
  /** 混合扩展 */
  HYBRID = 'HYBRID'
}

export enum ResourceType {
  /** 计算资源 */
  COMPUTE = 'COMPUTE',
  /** 内存资源 */
  MEMORY = 'MEMORY',
  /** 存储资源 */
  STORAGE = 'STORAGE',
  /** 网络资源 */
  NETWORK = 'NETWORK',
  /** 数据库资源 */
  DATABASE = 'DATABASE'
}

export interface ScalabilityThreshold {
  /** 资源类型 */
  resourceType: ResourceType;
  /** 阈值百分比（0-100） */
  threshold: number;
  /** 持续时间（秒） */
  duration: number;
}

export interface ScalabilityConfig {
  /** 可扩展性配置ID */
  id: string;
  /** 可扩展性级别 */
  scalabilityLevel: ScalabilityLevel;
  /** 扩展策略 */
  scalingStrategy: ScalingStrategy;
  /** 扩展阈值 */
  scalingThresholds: ScalabilityThreshold[];
  /** 最小实例数 */
  minInstances: number;
  /** 最大实例数 */
  maxInstances: number;
  /** 实例增量 */
  instanceIncrement: number;
  /** 冷却时间（秒） */
  coolDownPeriod: number;
  /** 自动扩展启用状态 */
  autoScalingEnabled: boolean;
  /** 负载均衡启用状态 */
  loadBalancingEnabled: boolean;
  /** 水平扩展启用状态 */
  horizontalScalingEnabled: boolean;
  /** 垂直扩展启用状态 */
  verticalScalingEnabled: boolean;
  /** 弹性伸缩组配置 */
  autoScalingGroupConfig?: {
    /** 弹性伸缩组名称 */
    name: string;
    /** 启动配置ID */
    launchConfigurationId: string;
    /** 可用区列表 */
    availabilityZones: string[];
  };
  /** 负载均衡器配置 */
  loadBalancerConfig?: {
    /** 负载均衡器名称 */
    name: string;
    /** 负载均衡器类型 */
    type: 'ALB' | 'CLB' | 'NLB';
    /** 监听配置 */
    listeners: {
      /** 端口 */
      port: number;
      /** 协议 */
      protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP';
      /** 目标组ARN */
      targetGroupArn: string;
    }[];
  };
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 最后应用时间 */
  lastAppliedAt?: Date;
  /** 应用状态 */
  applied: boolean;
}

export interface ScalabilityMetric {
  /** 指标ID */
  id: string;
  /** 资源类型 */
  resourceType: ResourceType;
  /** 指标名称 */
  name: string;
  /** 指标值 */
  value: number;
  /** 指标单位 */
  unit: string;
  /** 时间戳 */
  timestamp: Date;
  /** 实例ID */
  instanceId?: string;
  /** 资源ID */
  resourceId?: string;
}

export interface ScalabilityEvent {
  /** 事件ID */
  id: string;
  /** 事件类型 */
  type: 'SCALE_UP' | 'SCALE_DOWN' | 'SCALE_FAILED' | 'THRESHOLD_EXCEEDED' | 'COOL_DOWN_STARTED' | 'COOL_DOWN_ENDED' | 'CONFIGURATION_UPDATED';
  /** 事件时间 */
  timestamp: Date;
  /** 事件详情 */
  details: Record<string, any>;
  /** 事件来源 */
  source: string;
  /** 影响范围 */
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** 是否已处理 */
  processed: boolean;
}

export interface ScalabilityReport {
  /** 报告ID */
  id: string;
  /** 报告时间 */
  reportTime: Date;
  /** 报告期间（秒） */
  reportPeriod: number;
  /** 资源利用率统计 */
  resourceUtilization: {
    /** 资源类型 */
    resourceType: ResourceType;
    /** 平均利用率 */
    average: number;
    /** 峰值利用率 */
    peak: number;
    /** 最小值利用率 */
    minimum: number;
    /** 95分位利用率 */
    p95: number;
    /** 99分位利用率 */
    p99: number;
  }[];
  /** 扩展事件统计 */
  scalingEvents: {
    /** 扩展类型 */
    type: 'SCALE_UP' | 'SCALE_DOWN' | 'SCALE_FAILED';
    /** 事件数量 */
    count: number;
  }[];
  /** 实例数统计 */
  instanceStatistics: {
    /** 平均实例数 */
    averageInstances: number;
    /** 峰值实例数 */
    peakInstances: number;
    /** 最小值实例数 */
    minimumInstances: number;
  };
  /** 可扩展性得分 */
  scalabilityScore: number;
  /** 优化建议 */
  recommendations: string[];
}

export interface ScalabilityTestResult {
  /** 测试结果ID */
  id: string;
  /** 测试名称 */
  testName: string;
  /** 测试描述 */
  testDescription: string;
  /** 测试开始时间 */
  startTime: Date;
  /** 测试结束时间 */
  endTime: Date;
  /** 测试状态 */
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS';
  /** 测试负载配置 */
  loadConfig: {
    /** 初始用户数 */
    initialUsers: number;
    /** 目标用户数 */
    targetUsers: number;
    /** 负载增长速率（用户/秒） */
    rampUpRate: number;
    /** 测试持续时间（秒） */
    duration: number;
  };
  /** 测试结果指标 */
  metrics: {
    /** 平均响应时间（毫秒） */
    averageResponseTime: number;
    /** 峰值响应时间（毫秒） */
    peakResponseTime: number;
    /** 吞吐量（请求/秒） */
    throughput: number;
    /** 错误率（0-100） */
    errorRate: number;
    /** 最大并发用户数 */
    maxConcurrentUsers: number;
    /** 资源利用率 */
    resourceUtilization: {
      /** 资源类型 */
      resourceType: ResourceType;
      /** 平均利用率 */
      average: number;
      /** 峰值利用率 */
      peak: number;
    }[];
  };
  /** 测试结论 */
  conclusion: string;
  /** 优化建议 */
  recommendations: string[];
}
