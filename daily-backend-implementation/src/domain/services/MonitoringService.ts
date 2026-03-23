/**
 * 监控服务接口
 * 定义监控相关的核心业务逻辑
 */
import {
  MonitoringConfig,
  MonitorMetric,
  AlertRule,
  Alert,
  Dashboard,
  DashboardWidget,
  MonitoringReport,
  HealthCheck,
  MonitoringAgent,
  MonitorType,
  AlertLevel,
  AlertStatus,
  AlertChannel
} from '../entities/MonitoringConfig';

export interface MonitoringService {
  /**
   * 获取监控配置列表
   * @returns 监控配置列表
   */
  getMonitoringConfigs(): Promise<MonitoringConfig[]>;

  /**
   * 根据ID获取监控配置
   * @param configId 监控配置ID
   * @returns 监控配置
   */
  getMonitoringConfigById(configId: string): Promise<MonitoringConfig>;

  /**
   * 创建监控配置
   * @param config 监控配置
   * @returns 创建的监控配置
   */
  createMonitoringConfig(config: Omit<MonitoringConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonitoringConfig>;

  /**
   * 更新监控配置
   * @param configId 监控配置ID
   * @param config 监控配置更新内容
   * @returns 更新后的监控配置
   */
  updateMonitoringConfig(configId: string, config: Partial<MonitoringConfig>): Promise<MonitoringConfig>;

  /**
   * 删除监控配置
   * @param configId 监控配置ID
   * @returns 删除结果
   */
  deleteMonitoringConfig(configId: string): Promise<boolean>;

  /**
   * 收集监控指标
   * @param metrics 监控指标列表
   * @returns 收集结果
   */
  collectMetrics(metrics: Omit<MonitorMetric, 'id' | 'timestamp'>[]): Promise<boolean>;

  /**
   * 获取监控指标列表
   * @param filters 过滤条件
   * @returns 监控指标列表
   */
  getMetrics(filters?: {
    monitorType?: MonitorType;
    metricName?: string;
    startTime?: Date;
    endTime?: Date;
    moduleName?: string;
    instanceId?: string;
  }): Promise<MonitorMetric[]>;

  /**
   * 获取监控指标趋势
   * @param metricName 指标名称
   * @param monitorType 监控类型
   * @param interval 时间间隔（分钟）
   * @param duration 持续时间（小时）
   * @returns 指标趋势数据
   */
  getMetricTrend(metricName: string, monitorType: MonitorType, interval: number, duration: number): Promise<Record<string, any>>;

  /**
   * 创建告警规则
   * @param rule 告警规则
   * @returns 创建的告警规则
   */
  createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule>;

  /**
   * 获取告警规则列表
   * @param monitorType 监控类型（可选）
   * @returns 告警规则列表
   */
  getAlertRules(monitorType?: MonitorType): Promise<AlertRule[]>;

  /**
   * 根据ID获取告警规则
   * @param ruleId 告警规则ID
   * @returns 告警规则
   */
  getAlertRuleById(ruleId: string): Promise<AlertRule>;

  /**
   * 更新告警规则
   * @param ruleId 告警规则ID
   * @param rule 告警规则更新内容
   * @returns 更新后的告警规则
   */
  updateAlertRule(ruleId: string, rule: Partial<AlertRule>): Promise<AlertRule>;

  /**
   * 删除告警规则
   * @param ruleId 告警规则ID
   * @returns 删除结果
   */
  deleteAlertRule(ruleId: string): Promise<boolean>;

  /**
   * 触发告警
   * @param alert 告警信息
   * @returns 触发的告警
   */
  triggerAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert>;

  /**
   * 获取告警列表
   * @param filters 过滤条件
   * @returns 告警列表
   */
  getAlerts(filters?: {
    level?: AlertLevel;
    status?: AlertStatus;
    monitorType?: MonitorType;
    startTime?: Date;
    endTime?: Date;
    moduleName?: string;
  }): Promise<Alert[]>;

  /**
   * 根据ID获取告警
   * @param alertId 告警ID
   * @returns 告警
   */
  getAlertById(alertId: string): Promise<Alert>;

  /**
   * 更新告警状态
   * @param alertId 告警ID
   * @param status 告警状态
   * @param updatedBy 更新人
   * @returns 更新后的告警
   */
  updateAlertStatus(alertId: string, status: AlertStatus, updatedBy: string): Promise<Alert>;

  /**
   * 确认告警
   * @param alertId 告警ID
   * @param acknowledgedBy 确认人
   * @returns 确认后的告警
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<Alert>;

  /**
   * 解决告警
   * @param alertId 告警ID
   * @param resolvedBy 解决人
   * @param resolutionDetails 解决详情
   * @returns 解决后的告警
   */
  resolveAlert(alertId: string, resolvedBy: string, resolutionDetails?: string): Promise<Alert>;

  /**
   * 关闭告警
   * @param alertId 告警ID
   * @param closedBy 关闭人
   * @returns 关闭后的告警
   */
  closeAlert(alertId: string, closedBy: string): Promise<Alert>;

  /**
   * 创建仪表板
   * @param dashboard 仪表板
   * @returns 创建的仪表板
   */
  createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard>;

  /**
   * 获取仪表板列表
   * @returns 仪表板列表
   */
  getDashboards(): Promise<Dashboard[]>;

  /**
   * 根据ID获取仪表板
   * @param dashboardId 仪表板ID
   * @returns 仪表板
   */
  getDashboardById(dashboardId: string): Promise<Dashboard>;

  /**
   * 更新仪表板
   * @param dashboardId 仪表板ID
   * @param dashboard 仪表板更新内容
   * @returns 更新后的仪表板
   */
  updateDashboard(dashboardId: string, dashboard: Partial<Dashboard>): Promise<Dashboard>;

  /**
   * 删除仪表板
   * @param dashboardId 仪表板ID
   * @returns 删除结果
   */
  deleteDashboard(dashboardId: string): Promise<boolean>;

  /**
   * 添加仪表板组件
   * @param dashboardId 仪表板ID
   * @param widget 仪表板组件
   * @returns 更新后的仪表板
   */
  addDashboardWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id'>): Promise<Dashboard>;

  /**
   * 更新仪表板组件
   * @param dashboardId 仪表板ID
   * @param widgetId 组件ID
   * @param widget 组件更新内容
   * @returns 更新后的仪表板
   */
  updateDashboardWidget(dashboardId: string, widgetId: string, widget: Partial<DashboardWidget>): Promise<Dashboard>;

  /**
   * 删除仪表板组件
   * @param dashboardId 仪表板ID
   * @param widgetId 组件ID
   * @returns 更新后的仪表板
   */
  deleteDashboardWidget(dashboardId: string, widgetId: string): Promise<Dashboard>;

  /**
   * 创建监控报告
   * @param report 监控报告
   * @returns 创建的监控报告
   */
  createMonitoringReport(report: Omit<MonitoringReport, 'id' | 'createdAt' | 'status' | 'generatedAt'>): Promise<MonitoringReport>;

  /**
   * 获取监控报告列表
   * @returns 监控报告列表
   */
  getMonitoringReports(): Promise<MonitoringReport[]>;

  /**
   * 根据ID获取监控报告
   * @param reportId 报告ID
   * @returns 监控报告
   */
  getMonitoringReportById(reportId: string): Promise<MonitoringReport>;

  /**
   * 生成监控报告
   * @param reportId 报告ID
   * @returns 生成结果
   */
  generateMonitoringReport(reportId: string): Promise<boolean>;

  /**
   * 删除监控报告
   * @param reportId 报告ID
   * @returns 删除结果
   */
  deleteMonitoringReport(reportId: string): Promise<boolean>;

  /**
   * 创建健康检查
   * @param healthCheck 健康检查
   * @returns 创建的健康检查
   */
  createHealthCheck(healthCheck: Omit<HealthCheck, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckedAt' | 'nextCheckAt' | 'status' | 'responseTime' | 'result'>): Promise<HealthCheck>;

  /**
   * 获取健康检查列表
   * @returns 健康检查列表
   */
  getHealthChecks(): Promise<HealthCheck[]>;

  /**
   * 根据ID获取健康检查
   * @param checkId 健康检查ID
   * @returns 健康检查
   */
  getHealthCheckById(checkId: string): Promise<HealthCheck>;

  /**
   * 更新健康检查
   * @param checkId 健康检查ID
   * @param healthCheck 健康检查更新内容
   * @returns 更新后的健康检查
   */
  updateHealthCheck(checkId: string, healthCheck: Partial<HealthCheck>): Promise<HealthCheck>;

  /**
   * 删除健康检查
   * @param checkId 健康检查ID
   * @returns 删除结果
   */
  deleteHealthCheck(checkId: string): Promise<boolean>;

  /**
   * 执行健康检查
   * @param checkId 健康检查ID
   * @returns 检查结果
   */
  runHealthCheck(checkId: string): Promise<HealthCheck>;

  /**
   * 注册监控代理
   * @param agent 监控代理
   * @returns 注册的监控代理
   */
  registerMonitoringAgent(agent: Omit<MonitoringAgent, 'id' | 'registeredAt' | 'updatedAt' | 'lastHeartbeatAt'>): Promise<MonitoringAgent>;

  /**
   * 获取监控代理列表
   * @returns 监控代理列表
   */
  getMonitoringAgents(): Promise<MonitoringAgent[]>;

  /**
   * 根据ID获取监控代理
   * @param agentId 代理ID
   * @returns 监控代理
   */
  getMonitoringAgentById(agentId: string): Promise<MonitoringAgent>;

  /**
   * 更新监控代理心跳
   * @param agentId 代理ID
   * @returns 更新后的监控代理
   */
  updateAgentHeartbeat(agentId: string): Promise<MonitoringAgent>;

  /**
   * 删除监控代理
   * @param agentId 代理ID
   * @returns 删除结果
   */
  deleteMonitoringAgent(agentId: string): Promise<boolean>;

  /**
   * 发送告警通知
   * @param alert 告警信息
   * @returns 发送结果
   */
  sendAlertNotification(alert: Alert): Promise<boolean>;

  /**
   * 清理过期监控数据
   * @param days 保留天数
   * @returns 清理结果
   */
  cleanupOldMonitoringData(days: number): Promise<number>;

  /**
   * 获取系统健康状态
   * @returns 系统健康状态
   */
  getSystemHealthStatus(): Promise<Record<string, any>>;

  /**
   * 获取告警统计信息
   * @returns 告警统计信息
   */
  getAlertStatistics(): Promise<Record<string, any>>;
}