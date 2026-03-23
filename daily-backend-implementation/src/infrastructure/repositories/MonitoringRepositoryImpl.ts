/**
 * 监控仓库实现
 * 基于内存的监控相关数据持久化和查询操作实现
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
} from '../../domain/entities/MonitoringConfig';
import { MonitoringRepository } from '../../domain/repositories/MonitoringRepository';

export class MonitoringRepositoryImpl implements MonitoringRepository {
  // 内存存储
  private monitoringConfigs: Map<string, MonitoringConfig> = new Map();
  private monitorMetrics: Map<string, MonitorMetric> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private monitoringReports: Map<string, MonitoringReport> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private monitoringAgents: Map<string, MonitoringAgent> = new Map();

  /**
   * 保存监控配置
   * @param config 监控配置
   * @returns 保存后的监控配置
   */
  async saveMonitoringConfig(config: MonitoringConfig): Promise<MonitoringConfig> {
    this.monitoringConfigs.set(config.id, config);
    return config;
  }

  /**
   * 获取监控配置列表
   * @returns 监控配置列表
   */
  async getMonitoringConfigs(): Promise<MonitoringConfig[]> {
    return Array.from(this.monitoringConfigs.values());
  }

  /**
   * 根据ID获取监控配置
   * @param configId 监控配置ID
   * @returns 监控配置
   */
  async getMonitoringConfigById(configId: string): Promise<MonitoringConfig | null> {
    return this.monitoringConfigs.get(configId) || null;
  }

  /**
   * 删除监控配置
   * @param configId 监控配置ID
   * @returns 删除结果
   */
  async deleteMonitoringConfig(configId: string): Promise<boolean> {
    return this.monitoringConfigs.delete(configId);
  }

  /**
   * 保存监控指标
   * @param metric 监控指标
   * @returns 保存后的监控指标
   */
  async saveMonitorMetric(metric: MonitorMetric): Promise<MonitorMetric> {
    this.monitorMetrics.set(metric.id, metric);
    return metric;
  }

  /**
   * 批量保存监控指标
   * @param metrics 监控指标列表
   * @returns 保存结果
   */
  async saveMonitorMetrics(metrics: MonitorMetric[]): Promise<boolean> {
    for (const metric of metrics) {
      this.monitorMetrics.set(metric.id, metric);
    }
    return true;
  }

  /**
   * 获取监控指标列表
   * @param filters 过滤条件
   * @returns 监控指标列表
   */
  async getMonitorMetrics(filters?: {
    monitorType?: MonitorType;
    metricName?: string;
    startTime?: Date;
    endTime?: Date;
    moduleName?: string;
    instanceId?: string;
    limit?: number;
  }): Promise<MonitorMetric[]> {
    let result = Array.from(this.monitorMetrics.values());

    // 应用过滤条件
    if (filters) {
      if (filters.monitorType) {
        result = result.filter(metric => metric.monitorType === filters.monitorType);
      }
      if (filters.metricName) {
        result = result.filter(metric => metric.metricName === filters.metricName);
      }
      if (filters.startTime) {
        result = result.filter(metric => metric.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        result = result.filter(metric => metric.timestamp <= filters.endTime!);
      }
      if (filters.moduleName) {
        result = result.filter(metric => metric.moduleName === filters.moduleName);
      }
      if (filters.instanceId) {
        result = result.filter(metric => metric.instanceId === filters.instanceId);
      }
    }

    // 按时间降序排序
    result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // 应用限制
    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }

    return result;
  }

  /**
   * 清理过期监控指标
   * @param days 保留天数
   * @returns 清理结果
   */
  async cleanupOldMetrics(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    let deletedCount = 0;

    for (const [id, metric] of this.monitorMetrics.entries()) {
      if (metric.timestamp < cutoffDate) {
        this.monitorMetrics.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * 保存告警规则
   * @param rule 告警规则
   * @returns 保存后的告警规则
   */
  async saveAlertRule(rule: AlertRule): Promise<AlertRule> {
    this.alertRules.set(rule.id, rule);
    return rule;
  }

  /**
   * 获取告警规则列表
   * @param monitorType 监控类型（可选）
   * @returns 告警规则列表
   */
  async getAlertRules(monitorType?: MonitorType): Promise<AlertRule[]> {
    let result = Array.from(this.alertRules.values());

    if (monitorType) {
      result = result.filter(rule => rule.monitorType === monitorType);
    }

    return result;
  }

  /**
   * 根据ID获取告警规则
   * @param ruleId 告警规则ID
   * @returns 告警规则
   */
  async getAlertRuleById(ruleId: string): Promise<AlertRule | null> {
    return this.alertRules.get(ruleId) || null;
  }

  /**
   * 删除告警规则
   * @param ruleId 告警规则ID
   * @returns 删除结果
   */
  async deleteAlertRule(ruleId: string): Promise<boolean> {
    return this.alertRules.delete(ruleId);
  }

  /**
   * 保存告警
   * @param alert 告警
   * @returns 保存后的告警
   */
  async saveAlert(alert: Alert): Promise<Alert> {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  /**
   * 获取告警列表
   * @param filters 过滤条件
   * @returns 告警列表
   */
  async getAlerts(filters?: {
    level?: AlertLevel;
    status?: AlertStatus;
    monitorType?: MonitorType;
    startTime?: Date;
    endTime?: Date;
    moduleName?: string;
  }): Promise<Alert[]> {
    let result = Array.from(this.alerts.values());

    // 应用过滤条件
    if (filters) {
      if (filters.level) {
        result = result.filter(alert => alert.level === filters.level);
      }
      if (filters.status) {
        result = result.filter(alert => alert.status === filters.status);
      }
      if (filters.monitorType) {
        result = result.filter(alert => alert.monitorType === filters.monitorType);
      }
      if (filters.startTime) {
        result = result.filter(alert => alert.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        result = result.filter(alert => alert.timestamp <= filters.endTime!);
      }
      if (filters.moduleName) {
        result = result.filter(alert => alert.moduleName === filters.moduleName);
      }
    }

    // 按时间降序排序
    result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return result;
  }

  /**
   * 根据ID获取告警
   * @param alertId 告警ID
   * @returns 告警
   */
  async getAlertById(alertId: string): Promise<Alert | null> {
    return this.alerts.get(alertId) || null;
  }

  /**
   * 更新告警状态
   * @param alertId 告警ID
   * @param status 告警状态
   * @param updatedBy 更新人
   * @returns 更新后的告警
   */
  async updateAlertStatus(alertId: string, status: AlertStatus, updatedBy: string): Promise<Alert> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    alert.status = status;
    alert.updatedBy = updatedBy;
    alert.updatedAt = new Date();
    this.alerts.set(alertId, alert);

    return alert;
  }

  /**
   * 保存仪表板
   * @param dashboard 仪表板
   * @returns 保存后的仪表板
   */
  async saveDashboard(dashboard: Dashboard): Promise<Dashboard> {
    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  /**
   * 获取仪表板列表
   * @returns 仪表板列表
   */
  async getDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values());
  }

  /**
   * 根据ID获取仪表板
   * @param dashboardId 仪表板ID
   * @returns 仪表板
   */
  async getDashboardById(dashboardId: string): Promise<Dashboard | null> {
    return this.dashboards.get(dashboardId) || null;
  }

  /**
   * 删除仪表板
   * @param dashboardId 仪表板ID
   * @returns 删除结果
   */
  async deleteDashboard(dashboardId: string): Promise<boolean> {
    return this.dashboards.delete(dashboardId);
  }

  /**
   * 保存监控报告
   * @param report 监控报告
   * @returns 保存后的监控报告
   */
  async saveMonitoringReport(report: MonitoringReport): Promise<MonitoringReport> {
    this.monitoringReports.set(report.id, report);
    return report;
  }

  /**
   * 获取监控报告列表
   * @returns 监控报告列表
   */
  async getMonitoringReports(): Promise<MonitoringReport[]> {
    return Array.from(this.monitoringReports.values());
  }

  /**
   * 根据ID获取监控报告
   * @param reportId 报告ID
   * @returns 监控报告
   */
  async getMonitoringReportById(reportId: string): Promise<MonitoringReport | null> {
    return this.monitoringReports.get(reportId) || null;
  }

  /**
   * 删除监控报告
   * @param reportId 报告ID
   * @returns 删除结果
   */
  async deleteMonitoringReport(reportId: string): Promise<boolean> {
    return this.monitoringReports.delete(reportId);
  }

  /**
   * 保存健康检查
   * @param healthCheck 健康检查
   * @returns 保存后的健康检查
   */
  async saveHealthCheck(healthCheck: HealthCheck): Promise<HealthCheck> {
    this.healthChecks.set(healthCheck.id, healthCheck);
    return healthCheck;
  }

  /**
   * 获取健康检查列表
   * @returns 健康检查列表
   */
  async getHealthChecks(): Promise<HealthCheck[]> {
    return Array.from(this.healthChecks.values());
  }

  /**
   * 根据ID获取健康检查
   * @param checkId 健康检查ID
   * @returns 健康检查
   */
  async getHealthCheckById(checkId: string): Promise<HealthCheck | null> {
    return this.healthChecks.get(checkId) || null;
  }

  /**
   * 删除健康检查
   * @param checkId 健康检查ID
   * @returns 删除结果
   */
  async deleteHealthCheck(checkId: string): Promise<boolean> {
    return this.healthChecks.delete(checkId);
  }

  /**
   * 保存监控代理
   * @param agent 监控代理
   * @returns 保存后的监控代理
   */
  async saveMonitoringAgent(agent: MonitoringAgent): Promise<MonitoringAgent> {
    this.monitoringAgents.set(agent.id, agent);
    return agent;
  }

  /**
   * 获取监控代理列表
   * @returns 监控代理列表
   */
  async getMonitoringAgents(): Promise<MonitoringAgent[]> {
    return Array.from(this.monitoringAgents.values());
  }

  /**
   * 根据ID获取监控代理
   * @param agentId 代理ID
   * @returns 监控代理
   */
  async getMonitoringAgentById(agentId: string): Promise<MonitoringAgent | null> {
    return this.monitoringAgents.get(agentId) || null;
  }

  /**
   * 删除监控代理
   * @param agentId 代理ID
   * @returns 删除结果
   */
  async deleteMonitoringAgent(agentId: string): Promise<boolean> {
    return this.monitoringAgents.delete(agentId);
  }

  /**
   * 更新监控代理心跳
   * @param agentId 代理ID
   * @returns 更新后的监控代理
   */
  async updateAgentHeartbeat(agentId: string): Promise<MonitoringAgent> {
    const agent = this.monitoringAgents.get(agentId);
    if (!agent) {
      throw new Error(`Monitoring agent with ID ${agentId} not found`);
    }

    agent.lastHeartbeat = new Date();
    this.monitoringAgents.set(agentId, agent);

    return agent;
  }
}