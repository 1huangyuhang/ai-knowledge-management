/**
 * 监控仓库接口
 * 定义监控相关数据的持久化和查询操作
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
  AlertStatus
} from '../entities/MonitoringConfig';

export interface MonitoringRepository {
  /**
   * 保存监控配置
   * @param config 监控配置
   * @returns 保存后的监控配置
   */
  saveMonitoringConfig(config: MonitoringConfig): Promise<MonitoringConfig>;

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
  getMonitoringConfigById(configId: string): Promise<MonitoringConfig | null>;

  /**
   * 删除监控配置
   * @param configId 监控配置ID
   * @returns 删除结果
   */
  deleteMonitoringConfig(configId: string): Promise<boolean>;

  /**
   * 保存监控指标
   * @param metric 监控指标
   * @returns 保存后的监控指标
   */
  saveMonitorMetric(metric: MonitorMetric): Promise<MonitorMetric>;

  /**
   * 批量保存监控指标
   * @param metrics 监控指标列表
   * @returns 保存结果
   */
  saveMonitorMetrics(metrics: MonitorMetric[]): Promise<boolean>;

  /**
   * 获取监控指标列表
   * @param filters 过滤条件
   * @returns 监控指标列表
   */
  getMonitorMetrics(filters?: {
    monitorType?: MonitorType;
    metricName?: string;
    startTime?: Date;
    endTime?: Date;
    moduleName?: string;
    instanceId?: string;
    limit?: number;
  }): Promise<MonitorMetric[]>;

  /**
   * 清理过期监控指标
   * @param days 保留天数
   * @returns 清理结果
   */
  cleanupOldMetrics(days: number): Promise<number>;

  /**
   * 保存告警规则
   * @param rule 告警规则
   * @returns 保存后的告警规则
   */
  saveAlertRule(rule: AlertRule): Promise<AlertRule>;

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
  getAlertRuleById(ruleId: string): Promise<AlertRule | null>;

  /**
   * 删除告警规则
   * @param ruleId 告警规则ID
   * @returns 删除结果
   */
  deleteAlertRule(ruleId: string): Promise<boolean>;

  /**
   * 保存告警
   * @param alert 告警
   * @returns 保存后的告警
   */
  saveAlert(alert: Alert): Promise<Alert>;

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
  getAlertById(alertId: string): Promise<Alert | null>;

  /**
   * 更新告警状态
   * @param alertId 告警ID
   * @param status 告警状态
   * @param updatedBy 更新人
   * @returns 更新后的告警
   */
  updateAlertStatus(alertId: string, status: AlertStatus, updatedBy: string): Promise<Alert>;

  /**
   * 保存仪表板
   * @param dashboard 仪表板
   * @returns 保存后的仪表板
   */
  saveDashboard(dashboard: Dashboard): Promise<Dashboard>;

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
  getDashboardById(dashboardId: string): Promise<Dashboard | null>;

  /**
   * 删除仪表板
   * @param dashboardId 仪表板ID
   * @returns 删除结果
   */
  deleteDashboard(dashboardId: string): Promise<boolean>;

  /**
   * 保存监控报告
   * @param report 监控报告
   * @returns 保存后的监控报告
   */
  saveMonitoringReport(report: MonitoringReport): Promise<MonitoringReport>;

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
  getMonitoringReportById(reportId: string): Promise<MonitoringReport | null>;

  /**
   * 删除监控报告
   * @param reportId 报告ID
   * @returns 删除结果
   */
  deleteMonitoringReport(reportId: string): Promise<boolean>;

  /**
   * 保存健康检查
   * @param healthCheck 健康检查
   * @returns 保存后的健康检查
   */
  saveHealthCheck(healthCheck: HealthCheck): Promise<HealthCheck>;

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
  getHealthCheckById(checkId: string): Promise<HealthCheck | null>;

  /**
   * 删除健康检查
   * @param checkId 健康检查ID
   * @returns 删除结果
   */
  deleteHealthCheck(checkId: string): Promise<boolean>;

  /**
   * 保存监控代理
   * @param agent 监控代理
   * @returns 保存后的监控代理
   */
  saveMonitoringAgent(agent: MonitoringAgent): Promise<MonitoringAgent>;

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
  getMonitoringAgentById(agentId: string): Promise<MonitoringAgent | null>;

  /**
   * 删除监控代理
   * @param agentId 代理ID
   * @returns 删除结果
   */
  deleteMonitoringAgent(agentId: string): Promise<boolean>;

  /**
   * 更新监控代理心跳
   * @param agentId 代理ID
   * @returns 更新后的监控代理
   */
  updateAgentHeartbeat(agentId: string): Promise<MonitoringAgent>;
}
