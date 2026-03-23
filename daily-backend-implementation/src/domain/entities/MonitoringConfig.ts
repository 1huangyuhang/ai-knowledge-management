/**
 * 监控配置实体
 * 表示系统的监控配置和策略
 */

export enum MonitorType {
  /** CPU监控 */
  CPU = 'CPU',
  /** 内存监控 */
  MEMORY = 'MEMORY',
  /** 磁盘监控 */
  DISK = 'DISK',
  /** 网络监控 */
  NETWORK = 'NETWORK',
  /** 应用性能监控 */
  APP_PERFORMANCE = 'APP_PERFORMANCE',
  /** 数据库监控 */
  DATABASE = 'DATABASE',
  /** API监控 */
  API = 'API',
  /** 错误监控 */
  ERROR = 'ERROR',
  /** 业务指标监控 */
  BUSINESS = 'BUSINESS'
}

export enum AlertLevel {
  /** 信息级别 */
  INFO = 'INFO',
  /** 警告级别 */
  WARNING = 'WARNING',
  /** 错误级别 */
  ERROR = 'ERROR',
  /** 严重级别 */
  CRITICAL = 'CRITICAL'
}

export enum AlertStatus {
  /** 待处理 */
  PENDING = 'PENDING',
  /** 已确认 */
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  /** 已解决 */
  RESOLVED = 'RESOLVED',
  /** 已关闭 */
  CLOSED = 'CLOSED'
}

export enum AlertChannel {
  /** 邮件通知 */
  EMAIL = 'EMAIL',
  /** SMS通知 */
  SMS = 'SMS',
  /** Webhook通知 */
  WEBHOOK = 'WEBHOOK',
  /** Slack通知 */
  SLACK = 'SLACK',
  /** Teams通知 */
  TEAMS = 'TEAMS',
  /** 自定义通知 */
  CUSTOM = 'CUSTOM'
}

export interface MonitoringConfig {
  /** 监控配置ID */
  id: string;
  /** 监控配置名称 */
  name: string;
  /** 监控配置描述 */
  description?: string;
  /** 监控类型 */
  monitorTypes: MonitorType[];
  /** 是否启用 */
  enabled: boolean;
  /** 采样间隔（秒） */
  samplingInterval: number;
  /** 数据保留时间（天） */
  dataRetentionDays: number;
  /** 是否启用告警 */
  alertsEnabled: boolean;
  /** 默认告警级别 */
  defaultAlertLevel: AlertLevel;
  /** 默认告警渠道 */
  defaultAlertChannels: AlertChannel[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 配置参数 */
  configParams?: Record<string, any>;
}

export interface MonitorMetric {
  /** 指标ID */
  id: string;
  /** 指标名称 */
  name: string;
  /** 指标类型 */
  type: MonitorType;
  /** 指标值 */
  value: number;
  /** 指标单位 */
  unit: string;
  /** 指标标签 */
  tags?: Record<string, string>;
  /** 采集时间 */
  timestamp: Date;
  /** 模块名称 */
  moduleName?: string;
  /** 实例ID */
  instanceId?: string;
}

export interface AlertRule {
  /** 告警规则ID */
  id: string;
  /** 告警规则名称 */
  name: string;
  /** 告警规则描述 */
  description?: string;
  /** 监控类型 */
  monitorType: MonitorType;
  /** 指标名称 */
  metricName: string;
  /** 比较操作符 */
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'in' | 'not_in';
  /** 阈值 */
  threshold: number | number[];
  /** 告警级别 */
  alertLevel: AlertLevel;
  /** 持续时间（秒） */
  duration: number;
  /** 告警渠道 */
  alertChannels: AlertChannel[];
  /** 是否启用 */
  enabled: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 规则参数 */
  ruleParams?: Record<string, any>;
}

export interface Alert {
  /** 告警ID */
  id: string;
  /** 告警规则ID */
  ruleId: string;
  /** 告警规则名称 */
  ruleName: string;
  /** 告警级别 */
  level: AlertLevel;
  /** 告警状态 */
  status: AlertStatus;
  /** 告警类型 */
  monitorType: MonitorType;
  /** 指标名称 */
  metricName: string;
  /** 指标值 */
  metricValue: number;
  /** 阈值 */
  threshold: number | number[];
  /** 告警描述 */
  description: string;
  /** 告警详情 */
  details?: Record<string, any>;
  /** 触发时间 */
  triggeredAt: Date;
  /** 确认时间 */
  acknowledgedAt?: Date;
  /** 确认人 */
  acknowledgedBy?: string;
  /** 解决时间 */
  resolvedAt?: Date;
  /** 解决人 */
  resolvedBy?: string;
  /** 关闭时间 */
  closedAt?: Date;
  /** 关闭人 */
  closedBy?: string;
  /** 模块名称 */
  moduleName?: string;
  /** 实例ID */
  instanceId?: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

export interface Dashboard {
  /** 仪表板ID */
  id: string;
  /** 仪表板名称 */
  name: string;
  /** 仪表板描述 */
  description?: string;
  /** 仪表板布局 */
  layout: Record<string, any>;
  /** 仪表板组件 */
  widgets: DashboardWidget[];
  /** 是否公开 */
  isPublic: boolean;
  /** 创建者 */
  createdBy: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 访问权限 */
  permissions?: string[];
}

export interface DashboardWidget {
  /** 组件ID */
  id: string;
  /** 组件名称 */
  name: string;
  /** 组件类型 */
  type: 'CHART' | 'GAUGE' | 'COUNTER' | 'TABLE' | 'TEXT' | 'MAP';
  /** 组件配置 */
  config: Record<string, any>;
  /** 组件位置 */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** 监控类型 */
  monitorType: MonitorType;
  /** 指标名称 */
  metricName: string;
  /** 刷新间隔（秒） */
  refreshInterval: number;
}

export interface MonitoringReport {
  /** 报告ID */
  id: string;
  /** 报告名称 */
  name: string;
  /** 报告类型 */
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  /** 报告周期 */
  period: {
    start: Date;
    end: Date;
  };
  /** 报告内容 */
  content: Record<string, any>;
  /** 报告状态 */
  status: 'GENERATED' | 'FAILED' | 'PENDING';
  /** 生成时间 */
  generatedAt?: Date;
  /** 生成者 */
  generatedBy: string;
  /** 创建时间 */
  createdAt: Date;
  /** 报告URL */
  reportUrl?: string;
}

export interface HealthCheck {
  /** 健康检查ID */
  id: string;
  /** 检查名称 */
  name: string;
  /** 检查类型 */
  type: 'HTTP' | 'TCP' | 'PING' | 'CUSTOM';
  /** 检查目标 */
  target: string;
  /** 检查状态 */
  status: 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED';
  /** 检查结果 */
  result: Record<string, any>;
  /** 响应时间（毫秒） */
  responseTime: number;
  /** 上次检查时间 */
  lastCheckedAt: Date;
  /** 下次检查时间 */
  nextCheckAt: Date;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 检查配置 */
  config?: Record<string, any>;
}

export interface MonitoringAgent {
  /** 代理ID */
  id: string;
  /** 代理名称 */
  name: string;
  /** 代理状态 */
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  /** 代理类型 */
  type: 'HOST' | 'CONTAINER' | 'K8S' | 'CUSTOM';
  /** 代理版本 */
  version: string;
  /** 主机名 */
  hostname: string;
  /** IP地址 */
  ipAddress: string;
  /** 最后心跳时间 */
  lastHeartbeatAt: Date;
  /** 注册时间 */
  registeredAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 代理配置 */
  config?: Record<string, any>;
}
