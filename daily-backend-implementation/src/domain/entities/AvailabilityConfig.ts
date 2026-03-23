/**
 * 可用性配置实体
 * 表示系统的可用性配置和策略
 */

export enum AvailabilityLevel {
  /** 低可用性级别 */
  LOW = 'LOW',
  /** 中可用性级别 */
  MEDIUM = 'MEDIUM',
  /** 高可用性级别 */
  HIGH = 'HIGH',
  /** 极高可用性级别 */
  CRITICAL = 'CRITICAL'
}

export enum AvailabilityStrategy {
  /** 主动冗余 */
  ACTIVE_REDUNDANCY = 'ACTIVE_REDUNDANCY',
  /** 被动冗余 */
  PASSIVE_REDUNDANCY = 'PASSIVE_REDUNDANCY',
  /** 混合冗余 */
  HYBRID_REDUNDANCY = 'HYBRID_REDUNDANCY',
  /** 无冗余 */
  NO_REDUNDANCY = 'NO_REDUNDANCY'
}

export enum HealthCheckType {
  /** HTTP健康检查 */
  HTTP = 'HTTP',
  /** TCP健康检查 */
  TCP = 'TCP',
  /** 命令行健康检查 */
  COMMAND = 'COMMAND',
  /** 自定义健康检查 */
  CUSTOM = 'CUSTOM'
}

export interface HealthCheckConfig {
  /** 健康检查类型 */
  type: HealthCheckType;
  /** 健康检查目标 */
  target: string;
  /** 健康检查间隔（秒） */
  interval: number;
  /** 超时时间（秒） */
  timeout: number;
  /** 失败阈值 */
  failureThreshold: number;
  /** 成功阈值 */
  successThreshold: number;
  /** 健康检查路径（仅HTTP类型） */
  path?: string;
  /** 健康检查端口（仅TCP类型） */
  port?: number;
  /** 健康检查命令（仅COMMAND类型） */
  command?: string;
}

export interface FailoverConfig {
  /** 是否启用故障转移 */
  enabled: boolean;
  /** 故障转移延迟（秒） */
  delay: number;
  /** 故障恢复延迟（秒） */
  recoveryDelay: number;
  /** 自动故障恢复启用状态 */
  autoRecoveryEnabled: boolean;
}

export interface LoadBalancingConfig {
  /** 是否启用负载均衡 */
  enabled: boolean;
  /** 负载均衡算法 */
  algorithm: 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'IP_HASH' | 'WEIGHTED_ROUND_ROBIN';
  /** 会话持久性启用状态 */
  sessionPersistenceEnabled: boolean;
  /** 会话超时时间（秒） */
  sessionTimeout: number;
}

export interface AvailabilityConfig {
  /** 可用性配置ID */
  id: string;
  /** 可用性级别 */
  availabilityLevel: AvailabilityLevel;
  /** 可用性策略 */
  availabilityStrategy: AvailabilityStrategy;
  /** 健康检查配置 */
  healthCheckConfigs: HealthCheckConfig[];
  /** 故障转移配置 */
  failoverConfig: FailoverConfig;
  /** 负载均衡配置 */
  loadBalancingConfig: LoadBalancingConfig;
  /** 冗余实例数 */
  redundancyInstances: number;
  /** 最大故障实例数 */
  maxFailureInstances: number;
  /** 自动恢复启用状态 */
  autoRecoveryEnabled: boolean;
  /** 监控启用状态 */
  monitoringEnabled: boolean;
  /** 告警启用状态 */
  alertingEnabled: boolean;
  /** 维护窗口配置 */
  maintenanceWindowConfig?: {
    /** 维护窗口开始时间（格式：HH:MM） */
    startTime: string;
    /** 维护窗口结束时间（格式：HH:MM） */
    endTime: string;
    /** 维护窗口时区 */
    timezone: string;
    /** 维护窗口星期几（1-7，1表示星期一） */
    daysOfWeek: number[];
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

export enum HealthStatus {
  /** 健康 */
  HEALTHY = 'HEALTHY',
  /** 不健康 */
  UNHEALTHY = 'UNHEALTHY',
  /** 警告 */
  WARNING = 'WARNING',
  /** 未知 */
  UNKNOWN = 'UNKNOWN'
}

export interface HealthCheckResult {
  /** 健康检查结果ID */
  id: string;
  /** 健康检查配置ID */
  healthCheckConfigId: string;
  /** 检查时间 */
  checkTime: Date;
  /** 健康状态 */
  status: HealthStatus;
  /** 响应时间（毫秒） */
  responseTime: number;
  /** 响应消息 */
  message: string;
  /** 检查目标 */
  target: string;
  /** 检查类型 */
  type: HealthCheckType;
}

export interface AvailabilityMetric {
  /** 指标ID */
  id: string;
  /** 指标名称 */
  name: string;
  /** 指标值 */
  value: number;
  /** 指标单位 */
  unit: string;
  /** 时间戳 */
  timestamp: Date;
  /** 指标类型 */
  type: 'UPTIME' | 'DOWNTIME' | 'AVAILABILITY_PERCENTAGE' | 'RESPONSE_TIME' | 'ERROR_RATE';
  /** 服务名称 */
  serviceName?: string;
}

export interface AvailabilityEvent {
  /** 事件ID */
  id: string;
  /** 事件类型 */
  type: 'SERVICE_UP' | 'SERVICE_DOWN' | 'SERVICE_WARNING' | 'FAILOVER_TRIGGERED' | 'FAILOVER_COMPLETED' | 'RECOVERY_TRIGGERED' | 'RECOVERY_COMPLETED' | 'MAINTENANCE_STARTED' | 'MAINTENANCE_ENDED';
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
  /** 服务名称 */
  serviceName?: string;
}

export interface AvailabilityReport {
  /** 报告ID */
  id: string;
  /** 报告时间 */
  reportTime: Date;
  /** 报告期间（秒） */
  reportPeriod: number;
  /** 可用性统计 */
  availabilityStats: {
    /** 总运行时间（秒） */
    uptime: number;
    /** 总停机时间（秒） */
    downtime: number;
    /** 可用性百分比 */
    availabilityPercentage: number;
    /** 平均响应时间（毫秒） */
    averageResponseTime: number;
    /** 峰值响应时间（毫秒） */
    peakResponseTime: number;
    /** 错误率（0-100） */
    errorRate: number;
  };
  /** 事件统计 */
  eventStats: {
    /** 事件类型 */
    type: string;
    /** 事件数量 */
    count: number;
  }[];
  /** 健康检查统计 */
  healthCheckStats: {
    /** 健康检查配置ID */
    healthCheckConfigId: string;
    /** 总检查次数 */
    totalChecks: number;
    /** 成功检查次数 */
    successfulChecks: number;
    /** 失败检查次数 */
    failedChecks: number;
    /** 警告检查次数 */
    warningChecks: number;
    /** 健康检查成功率 */
    successRate: number;
  }[];
  /** 可用性得分 */
  availabilityScore: number;
  /** 优化建议 */
  recommendations: string[];
}

export interface AvailabilityTestResult {
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
  /** 测试配置 */
  testConfig: {
    /** 测试类型 */
    type: 'FAILURE_SIMULATION' | 'LOAD_TEST' | 'STRESS_TEST' | 'RECOVERY_TEST';
    /** 测试参数 */
    parameters: Record<string, any>;
  };
  /** 测试结果指标 */
  metrics: {
    /** 可用性百分比 */
    availabilityPercentage: number;
    /** 平均恢复时间（秒） */
    averageRecoveryTime: number;
    /** 最大恢复时间（秒） */
    maxRecoveryTime: number;
    /** 故障转移成功率 */
    failoverSuccessRate: number;
    /** 测试期间错误数量 */
    errorCount: number;
  };
  /** 测试结论 */
  conclusion: string;
  /** 优化建议 */
  recommendations: string[];
}
