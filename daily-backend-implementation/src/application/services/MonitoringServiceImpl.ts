/**
 * 监控服务实现
 * 实现监控相关的核心业务逻辑
 */
import { MonitoringService } from '../../domain/services/MonitoringService';
import { MonitoringRepository } from '../../domain/repositories/MonitoringRepository';
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
} from '../../domain/entities/MonitoringConfig';

// 引入crypto模块生成UUID
import crypto from 'crypto';

/**
 * 监控服务实现类
 */
export class MonitoringServiceImpl implements MonitoringService {
  /**
   * 构造函数
   * @param monitoringRepository 监控仓库
   */
  constructor(
    private readonly monitoringRepository: MonitoringRepository
  ) {}

  /**
   * 获取监控配置列表
   * @returns 监控配置列表
   */
  async getMonitoringConfigs(): Promise<MonitoringConfig[]> {
    return await this.monitoringRepository.getMonitoringConfigs();
  }

  /**
   * 根据ID获取监控配置
   * @param configId 监控配置ID
   * @returns 监控配置
   */
  async getMonitoringConfigById(configId: string): Promise<MonitoringConfig> {
    const config = await this.monitoringRepository.getMonitoringConfigById(configId);
    if (!config) {
      throw new Error(`Monitoring config with id ${configId} not found`);
    }
    return config;
  }

  /**
   * 创建监控配置
   * @param config 监控配置
   * @returns 创建的监控配置
   */
  async createMonitoringConfig(config: Omit<MonitoringConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonitoringConfig> {
    const newConfig: MonitoringConfig = {
      ...config,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.monitoringRepository.saveMonitoringConfig(newConfig);
  }

  /**
   * 更新监控配置
   * @param configId 监控配置ID
   * @param config 监控配置更新内容
   * @returns 更新后的监控配置
   */
  async updateMonitoringConfig(configId: string, config: Partial<MonitoringConfig>): Promise<MonitoringConfig> {
    const existingConfig = await this.getMonitoringConfigById(configId);
    
    const updatedConfig: MonitoringConfig = {
      ...existingConfig,
      ...config,
      updatedAt: new Date()
    };

    return await this.monitoringRepository.saveMonitoringConfig(updatedConfig);
  }

  /**
   * 删除监控配置
   * @param configId 监控配置ID
   * @returns 删除结果
   */
  async deleteMonitoringConfig(configId: string): Promise<boolean> {
    return await this.monitoringRepository.deleteMonitoringConfig(configId);
  }

  /**
   * 收集监控指标
   * @param metrics 监控指标列表
   * @returns 收集结果
   */
  async collectMetrics(metrics: Omit<MonitorMetric, 'id' | 'timestamp'>[]): Promise<boolean> {
    const metricsToSave: MonitorMetric[] = metrics.map(metric => ({
      ...metric,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }));

    return await this.monitoringRepository.saveMonitorMetrics(metricsToSave);
  }

  /**
   * 获取监控指标列表
   * @param filters 过滤条件
   * @returns 监控指标列表
   */
  async getMetrics(filters?: {
    monitorType?: MonitorType;
    metricName?: string;
    startTime?: Date;
    endTime?: Date;
    moduleName?: string;
    instanceId?: string;
  }): Promise<MonitorMetric[]> {
    return await this.monitoringRepository.getMonitorMetrics(filters);
  }

  /**
   * 获取监控指标趋势
   * @param metricName 指标名称
   * @param monitorType 监控类型
   * @param interval 时间间隔（分钟）
   * @param duration 持续时间（小时）
   * @returns 指标趋势数据
   */
  async getMetricTrend(metricName: string, monitorType: MonitorType, interval: number, duration: number): Promise<Record<string, any>> {
    // 计算开始时间
    const endTime = new Date();
    const startTime = new Date();
    startTime.setHours(endTime.getHours() - duration);

    // 获取指标数据
    const metrics = await this.monitoringRepository.getMonitorMetrics({
      metricName,
      monitorType,
      startTime,
      endTime
    });

    // 按时间间隔分组
    const groupedMetrics: Record<string, number[]> = {};
    metrics.forEach(metric => {
      const intervalKey = this.getIntervalKey(metric.timestamp, interval);
      if (!groupedMetrics[intervalKey]) {
        groupedMetrics[intervalKey] = [];
      }
      groupedMetrics[intervalKey].push(metric.value);
    });

    // 计算每个时间间隔的平均值
    const trendData = Object.entries(groupedMetrics).map(([timestamp, values]) => {
      const avgValue = values.reduce((sum, value) => sum + value, 0) / values.length;
      return {
        timestamp,
        value: avgValue
      };
    });

    // 按时间排序
    trendData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return {
      metricName,
      monitorType,
      interval,
      duration,
      data: trendData
    };
  }

  /**
   * 获取时间间隔键
   * @param timestamp 时间戳
   * @param interval 时间间隔（分钟）
   * @returns 时间间隔键
   */
  private getIntervalKey(timestamp: Date, interval: number): string {
    const date = new Date(timestamp.getTime());
    // 按指定间隔对齐时间
    date.setMinutes(Math.floor(date.getMinutes() / interval) * interval);
    date.setSeconds(0, 0);
    return date.toISOString();
  }

  /**
   * 创建告警规则
   * @param rule 告警规则
   * @returns 创建的告警规则
   */
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule> {
    const newRule: AlertRule = {
      ...rule,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.monitoringRepository.saveAlertRule(newRule);
  }

  /**
   * 获取告警规则列表
   * @param monitorType 监控类型（可选）
   * @returns 告警规则列表
   */
  async getAlertRules(monitorType?: MonitorType): Promise<AlertRule[]> {
    return await this.monitoringRepository.getAlertRules(monitorType);
  }

  /**
   * 根据ID获取告警规则
   * @param ruleId 告警规则ID
   * @returns 告警规则
   */
  async getAlertRuleById(ruleId: string): Promise<AlertRule> {
    const rule = await this.monitoringRepository.getAlertRuleById(ruleId);
    if (!rule) {
      throw new Error(`Alert rule with id ${ruleId} not found`);
    }
    return rule;
  }

  /**
   * 更新告警规则
   * @param ruleId 告警规则ID
   * @param rule 告警规则更新内容
   * @returns 更新后的告警规则
   */
  async updateAlertRule(ruleId: string, rule: Partial<AlertRule>): Promise<AlertRule> {
    const existingRule = await this.getAlertRuleById(ruleId);
    
    const updatedRule: AlertRule = {
      ...existingRule,
      ...rule,
      updatedAt: new Date()
    };

    return await this.monitoringRepository.saveAlertRule(updatedRule);
  }

  /**
   * 删除告警规则
   * @param ruleId 告警规则ID
   * @returns 删除结果
   */
  async deleteAlertRule(ruleId: string): Promise<boolean> {
    return await this.monitoringRepository.deleteAlertRule(ruleId);
  }

  /**
   * 触发告警
   * @param alert 告警信息
   * @returns 触发的告警
   */
  async triggerAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedAlert = await this.monitoringRepository.saveAlert(newAlert);

    // 发送告警通知
    await this.sendAlertNotification(savedAlert);

    return savedAlert;
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
    return await this.monitoringRepository.getAlerts(filters);
  }

  /**
   * 根据ID获取告警
   * @param alertId 告警ID
   * @returns 告警
   */
  async getAlertById(alertId: string): Promise<Alert> {
    const alert = await this.monitoringRepository.getAlertById(alertId);
    if (!alert) {
      throw new Error(`Alert with id ${alertId} not found`);
    }
    return alert;
  }

  /**
   * 更新告警状态
   * @param alertId 告警ID
   * @param status 告警状态
   * @param updatedBy 更新人
   * @returns 更新后的告警
   */
  async updateAlertStatus(alertId: string, status: AlertStatus, updatedBy: string): Promise<Alert> {
    return await this.monitoringRepository.updateAlertStatus(alertId, status, updatedBy);
  }

  /**
   * 确认告警
   * @param alertId 告警ID
   * @param acknowledgedBy 确认人
   * @returns 确认后的告警
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<Alert> {
    const alert = await this.getAlertById(alertId);
    
    return await this.monitoringRepository.updateAlertStatus(
      alertId, 
      AlertStatus.ACKNOWLEDGED, 
      acknowledgedBy
    );
  }

  /**
   * 解决告警
   * @param alertId 告警ID
   * @param resolvedBy 解决人
   * @param resolutionDetails 解决详情
   * @returns 解决后的告警
   */
  async resolveAlert(alertId: string, resolvedBy: string, resolutionDetails?: string): Promise<Alert> {
    const alert = await this.getAlertById(alertId);
    
    return await this.monitoringRepository.updateAlertStatus(
      alertId, 
      AlertStatus.RESOLVED, 
      resolvedBy
    );
  }

  /**
   * 关闭告警
   * @param alertId 告警ID
   * @param closedBy 关闭人
   * @returns 关闭后的告警
   */
  async closeAlert(alertId: string, closedBy: string): Promise<Alert> {
    const alert = await this.getAlertById(alertId);
    
    return await this.monitoringRepository.updateAlertStatus(
      alertId, 
      AlertStatus.CLOSED, 
      closedBy
    );
  }

  /**
   * 创建仪表板
   * @param dashboard 仪表板
   * @returns 创建的仪表板
   */
  async createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const newDashboard: Dashboard = {
      ...dashboard,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.monitoringRepository.saveDashboard(newDashboard);
  }

  /**
   * 获取仪表板列表
   * @returns 仪表板列表
   */
  async getDashboards(): Promise<Dashboard[]> {
    return await this.monitoringRepository.getDashboards();
  }

  /**
   * 根据ID获取仪表板
   * @param dashboardId 仪表板ID
   * @returns 仪表板
   */
  async getDashboardById(dashboardId: string): Promise<Dashboard> {
    const dashboard = await this.monitoringRepository.getDashboardById(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard with id ${dashboardId} not found`);
    }
    return dashboard;
  }

  /**
   * 更新仪表板
   * @param dashboardId 仪表板ID
   * @param dashboard 仪表板更新内容
   * @returns 更新后的仪表板
   */
  async updateDashboard(dashboardId: string, dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const existingDashboard = await this.getDashboardById(dashboardId);
    
    const updatedDashboard: Dashboard = {
      ...existingDashboard,
      ...dashboard,
      updatedAt: new Date()
    };

    return await this.monitoringRepository.saveDashboard(updatedDashboard);
  }

  /**
   * 删除仪表板
   * @param dashboardId 仪表板ID
   * @returns 删除结果
   */
  async deleteDashboard(dashboardId: string): Promise<boolean> {
    return await this.monitoringRepository.deleteDashboard(dashboardId);
  }

  /**
   * 添加仪表板组件
   * @param dashboardId 仪表板ID
   * @param widget 仪表板组件
   * @returns 更新后的仪表板
   */
  async addDashboardWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id'>): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(dashboardId);
    
    const newWidget: DashboardWidget = {
      ...widget,
      id: crypto.randomUUID()
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = new Date();

    return await this.monitoringRepository.saveDashboard(dashboard);
  }

  /**
   * 更新仪表板组件
   * @param dashboardId 仪表板ID
   * @param widgetId 组件ID
   * @param widget 组件更新内容
   * @returns 更新后的仪表板
   */
  async updateDashboardWidget(dashboardId: string, widgetId: string, widget: Partial<DashboardWidget>): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(dashboardId);
    
    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) {
      throw new Error(`Widget with id ${widgetId} not found in dashboard ${dashboardId}`);
    }

    dashboard.widgets[widgetIndex] = {
      ...dashboard.widgets[widgetIndex],
      ...widget
    };
    dashboard.updatedAt = new Date();

    return await this.monitoringRepository.saveDashboard(dashboard);
  }

  /**
   * 删除仪表板组件
   * @param dashboardId 仪表板ID
   * @param widgetId 组件ID
   * @returns 更新后的仪表板
   */
  async deleteDashboardWidget(dashboardId: string, widgetId: string): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(dashboardId);
    
    dashboard.widgets = dashboard.widgets.filter(w => w.id !== widgetId);
    dashboard.updatedAt = new Date();

    return await this.monitoringRepository.saveDashboard(dashboard);
  }

  /**
   * 创建监控报告
   * @param report 监控报告
   * @returns 创建的监控报告
   */
  async createMonitoringReport(report: Omit<MonitoringReport, 'id' | 'createdAt' | 'status' | 'generatedAt'>): Promise<MonitoringReport> {
    const newReport: MonitoringReport = {
      ...report,
      id: crypto.randomUUID(),
      status: 'PENDING',
      createdAt: new Date()
    };

    return await this.monitoringRepository.saveMonitoringReport(newReport);
  }

  /**
   * 获取监控报告列表
   * @returns 监控报告列表
   */
  async getMonitoringReports(): Promise<MonitoringReport[]> {
    return await this.monitoringRepository.getMonitoringReports();
  }

  /**
   * 根据ID获取监控报告
   * @param reportId 报告ID
   * @returns 监控报告
   */
  async getMonitoringReportById(reportId: string): Promise<MonitoringReport> {
    const report = await this.monitoringRepository.getMonitoringReportById(reportId);
    if (!report) {
      throw new Error(`Monitoring report with id ${reportId} not found`);
    }
    return report;
  }

  /**
   * 生成监控报告
   * @param reportId 报告ID
   * @returns 生成结果
   */
  async generateMonitoringReport(reportId: string): Promise<boolean> {
    const report = await this.getMonitoringReportById(reportId);
    
    // 模拟生成报告过程
    console.log(`Generating monitoring report ${reportId} for period ${report.period.start} to ${report.period.end}`);
    
    // 模拟生成延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟生成报告内容
    const reportContent = {
      summary: {
        totalAlerts: Math.floor(Math.random() * 100),
        criticalAlerts: Math.floor(Math.random() * 20),
        averageCPUUsage: Math.floor(Math.random() * 100),
        averageMemoryUsage: Math.floor(Math.random() * 100),
        uptimePercentage: 99.9 + Math.random() * 0.1
      },
      details: {
        alerts: {
          byLevel: {
            CRITICAL: Math.floor(Math.random() * 20),
            ERROR: Math.floor(Math.random() * 30),
            WARNING: Math.floor(Math.random() * 40),
            INFO: Math.floor(Math.random() * 60)
          }
        },
        metrics: {
          cpu: {
            average: Math.floor(Math.random() * 100),
            peak: Math.floor(Math.random() * 100)
          },
          memory: {
            average: Math.floor(Math.random() * 100),
            peak: Math.floor(Math.random() * 100)
          }
        }
      },
      recommendations: [
        '优化数据库查询性能',
        '增加服务器内存',
        '优化应用代码以降低CPU使用率',
        '增加监控告警规则'
      ]
    };

    // 更新报告状态
    const updatedReport: MonitoringReport = {
      ...report,
      status: 'GENERATED',
      content: reportContent,
      generatedAt: new Date()
    };

    await this.monitoringRepository.saveMonitoringReport(updatedReport);
    return true;
  }

  /**
   * 删除监控报告
   * @param reportId 报告ID
   * @returns 删除结果
   */
  async deleteMonitoringReport(reportId: string): Promise<boolean> {
    return await this.monitoringRepository.deleteMonitoringReport(reportId);
  }

  /**
   * 创建健康检查
   * @param healthCheck 健康检查
   * @returns 创建的健康检查
   */
  async createHealthCheck(healthCheck: Omit<HealthCheck, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckedAt' | 'nextCheckAt' | 'status' | 'responseTime' | 'result'>): Promise<HealthCheck> {
    const now = new Date();
    const nextCheckAt = new Date(now.getTime() + 60000); // 默认1分钟后检查
    
    const newHealthCheck: HealthCheck = {
      ...healthCheck,
      id: crypto.randomUUID(),
      status: 'HEALTHY',
      responseTime: 0,
      lastCheckedAt: now,
      nextCheckAt,
      result: {},
      createdAt: now,
      updatedAt: now
    };

    return await this.monitoringRepository.saveHealthCheck(newHealthCheck);
  }

  /**
   * 获取健康检查列表
   * @returns 健康检查列表
   */
  async getHealthChecks(): Promise<HealthCheck[]> {
    return await this.monitoringRepository.getHealthChecks();
  }

  /**
   * 根据ID获取健康检查
   * @param checkId 健康检查ID
   * @returns 健康检查
   */
  async getHealthCheckById(checkId: string): Promise<HealthCheck> {
    const healthCheck = await this.monitoringRepository.getHealthCheckById(checkId);
    if (!healthCheck) {
      throw new Error(`Health check with id ${checkId} not found`);
    }
    return healthCheck;
  }

  /**
   * 更新健康检查
   * @param checkId 健康检查ID
   * @param healthCheck 健康检查更新内容
   * @returns 更新后的健康检查
   */
  async updateHealthCheck(checkId: string, healthCheck: Partial<HealthCheck>): Promise<HealthCheck> {
    const existingHealthCheck = await this.getHealthCheckById(checkId);
    
    const updatedHealthCheck: HealthCheck = {
      ...existingHealthCheck,
      ...healthCheck,
      updatedAt: new Date()
    };

    return await this.monitoringRepository.saveHealthCheck(updatedHealthCheck);
  }

  /**
   * 删除健康检查
   * @param checkId 健康检查ID
   * @returns 删除结果
   */
  async deleteHealthCheck(checkId: string): Promise<boolean> {
    return await this.monitoringRepository.deleteHealthCheck(checkId);
  }

  /**
   * 执行健康检查
   * @param checkId 健康检查ID
   * @returns 检查结果
   */
  async runHealthCheck(checkId: string): Promise<HealthCheck> {
    const healthCheck = await this.getHealthCheckById(checkId);
    
    // 模拟执行健康检查
    console.log(`Running health check ${checkId} for ${healthCheck.target}`);
    
    // 模拟检查延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟检查结果
    const isHealthy = Math.random() > 0.1; // 90%健康概率
    const responseTime = Math.floor(Math.random() * 500);
    
    const updatedHealthCheck: HealthCheck = {
      ...healthCheck,
      status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
      responseTime,
      lastCheckedAt: new Date(),
      nextCheckAt: new Date(Date.now() + 60000), // 1分钟后下次检查
      result: {
        healthy: isHealthy,
        responseTime,
        checkedAt: new Date().toISOString()
      },
      updatedAt: new Date()
    };

    const savedHealthCheck = await this.monitoringRepository.saveHealthCheck(updatedHealthCheck);

    // 如果检查失败，触发告警
    if (!isHealthy) {
      await this.triggerAlert({
        ruleId: 'system-health-check',
        ruleName: 'System Health Check',
        level: AlertLevel.ERROR,
        status: AlertStatus.PENDING,
        monitorType: MonitorType.APP_PERFORMANCE,
        metricName: 'health-check',
        metricValue: isHealthy ? 1 : 0,
        threshold: 1,
        description: `Health check failed for ${healthCheck.target}`,
        details: {
          healthCheckId: checkId,
          target: healthCheck.target,
          responseTime,
          type: healthCheck.type
        },
        triggeredAt: new Date(),
        moduleName: 'system'
      });
    }

    return savedHealthCheck;
  }

  /**
   * 注册监控代理
   * @param agent 监控代理
   * @returns 注册的监控代理
   */
  async registerMonitoringAgent(agent: Omit<MonitoringAgent, 'id' | 'registeredAt' | 'updatedAt' | 'lastHeartbeatAt'>): Promise<MonitoringAgent> {
    const now = new Date();
    
    const newAgent: MonitoringAgent = {
      ...agent,
      id: crypto.randomUUID(),
      registeredAt: now,
      updatedAt: now,
      lastHeartbeatAt: now,
      status: 'ONLINE'
    };

    return await this.monitoringRepository.saveMonitoringAgent(newAgent);
  }

  /**
   * 获取监控代理列表
   * @returns 监控代理列表
   */
  async getMonitoringAgents(): Promise<MonitoringAgent[]> {
    return await this.monitoringRepository.getMonitoringAgents();
  }

  /**
   * 根据ID获取监控代理
   * @param agentId 代理ID
   * @returns 监控代理
   */
  async getMonitoringAgentById(agentId: string): Promise<MonitoringAgent> {
    const agent = await this.monitoringRepository.getMonitoringAgentById(agentId);
    if (!agent) {
      throw new Error(`Monitoring agent with id ${agentId} not found`);
    }
    return agent;
  }

  /**
   * 更新监控代理心跳
   * @param agentId 代理ID
   * @returns 更新后的监控代理
   */
  async updateAgentHeartbeat(agentId: string): Promise<MonitoringAgent> {
    return await this.monitoringRepository.updateAgentHeartbeat(agentId);
  }

  /**
   * 删除监控代理
   * @param agentId 代理ID
   * @returns 删除结果
   */
  async deleteMonitoringAgent(agentId: string): Promise<boolean> {
    return await this.monitoringRepository.deleteMonitoringAgent(agentId);
  }

  /**
   * 发送告警通知
   * @param alert 告警信息
   * @returns 发送结果
   */
  async sendAlertNotification(alert: Alert): Promise<boolean> {
    // 模拟发送告警通知
    console.log(`Sending alert notification for ${alert.id}: ${alert.description}`);
    console.log(`Alert level: ${alert.level}, Status: ${alert.status}`);
    
    // 这里可以添加实际的通知发送逻辑，如邮件、短信、Webhook等
    return true;
  }

  /**
   * 清理过期监控数据
   * @param days 保留天数
   * @returns 清理结果
   */
  async cleanupOldMonitoringData(days: number): Promise<number> {
    return await this.monitoringRepository.cleanupOldMetrics(days);
  }

  /**
   * 获取系统健康状态
   * @returns 系统健康状态
   */
  async getSystemHealthStatus(): Promise<Record<string, any>> {
    // 执行健康检查
    const healthChecks = await this.getHealthChecks();
    const checkResults = await Promise.all(
      healthChecks.map(check => this.runHealthCheck(check.id))
    );
    
    // 获取关键指标
    const cpuMetrics = await this.getMetrics({
      monitorType: MonitorType.CPU,
      metricName: 'usage',
      limit: 10
    });
    
    const memoryMetrics = await this.getMetrics({
      monitorType: MonitorType.MEMORY,
      metricName: 'usage',
      limit: 10
    });
    
    // 获取活跃告警
    const activeAlerts = await this.getAlerts({
      status: AlertStatus.PENDING
    });
    
    const criticalAlerts = activeAlerts.filter(alert => alert.level === AlertLevel.CRITICAL);
    const errorAlerts = activeAlerts.filter(alert => alert.level === AlertLevel.ERROR);
    
    // 获取监控代理状态
    const agents = await this.getMonitoringAgents();
    const onlineAgents = agents.filter(agent => agent.status === 'ONLINE');
    
    return {
      timestamp: new Date().toISOString(),
      overallStatus: criticalAlerts.length > 0 ? 'UNHEALTHY' : errorAlerts.length > 0 ? 'DEGRADED' : 'HEALTHY',
      healthChecks: {
        total: checkResults.length,
        healthy: checkResults.filter(check => check.status === 'HEALTHY').length,
        degraded: checkResults.filter(check => check.status === 'DEGRADED').length,
        unhealthy: checkResults.filter(check => check.status === 'UNHEALTHY').length
      },
      metrics: {
        cpu: {
          latest: cpuMetrics.length > 0 ? cpuMetrics[cpuMetrics.length - 1].value : 0,
          average: cpuMetrics.length > 0 ? 
            cpuMetrics.reduce((sum, metric) => sum + metric.value, 0) / cpuMetrics.length : 0
        },
        memory: {
          latest: memoryMetrics.length > 0 ? memoryMetrics[memoryMetrics.length - 1].value : 0,
          average: memoryMetrics.length > 0 ? 
            memoryMetrics.reduce((sum, metric) => sum + metric.value, 0) / memoryMetrics.length : 0
        }
      },
      alerts: {
        critical: criticalAlerts.length,
        error: errorAlerts.length,
        warning: activeAlerts.filter(alert => alert.level === AlertLevel.WARNING).length,
        info: activeAlerts.filter(alert => alert.level === AlertLevel.INFO).length
      },
      agents: {
        total: agents.length,
        online: onlineAgents.length,
        offline: agents.filter(agent => agent.status === 'OFFLINE').length,
        degraded: agents.filter(agent => agent.status === 'DEGRADED').length
      }
    };
  }

  /**
   * 获取告警统计信息
   * @returns 告警统计信息
   */
  async getAlertStatistics(): Promise<Record<string, any>> {
    const allAlerts = await this.getAlerts();
    const activeAlerts = allAlerts.filter(alert => alert.status === AlertStatus.PENDING);
    const acknowledgedAlerts = allAlerts.filter(alert => alert.status === AlertStatus.ACKNOWLEDGED);
    const resolvedAlerts = allAlerts.filter(alert => alert.status === AlertStatus.RESOLVED);
    const closedAlerts = allAlerts.filter(alert => alert.status === AlertStatus.CLOSED);
    
    // 按级别统计
    const byLevel = allAlerts.reduce((acc, alert) => {
      acc[alert.level] = (acc[alert.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 按监控类型统计
    const byMonitorType = allAlerts.reduce((acc, alert) => {
      acc[alert.monitorType] = (acc[alert.monitorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: allAlerts.length,
      active: activeAlerts.length,
      acknowledged: acknowledgedAlerts.length,
      resolved: resolvedAlerts.length,
      closed: closedAlerts.length,
      byLevel,
      byMonitorType
    };
  }
}
