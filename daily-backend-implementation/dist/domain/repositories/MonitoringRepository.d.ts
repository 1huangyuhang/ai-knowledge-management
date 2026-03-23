import { MonitoringConfig, MonitorMetric, AlertRule, Alert, Dashboard, MonitoringReport, HealthCheck, MonitoringAgent, MonitorType, AlertLevel, AlertStatus } from '../entities/MonitoringConfig';
export interface MonitoringRepository {
    saveMonitoringConfig(config: MonitoringConfig): Promise<MonitoringConfig>;
    getMonitoringConfigs(): Promise<MonitoringConfig[]>;
    getMonitoringConfigById(configId: string): Promise<MonitoringConfig | null>;
    deleteMonitoringConfig(configId: string): Promise<boolean>;
    saveMonitorMetric(metric: MonitorMetric): Promise<MonitorMetric>;
    saveMonitorMetrics(metrics: MonitorMetric[]): Promise<boolean>;
    getMonitorMetrics(filters?: {
        monitorType?: MonitorType;
        metricName?: string;
        startTime?: Date;
        endTime?: Date;
        moduleName?: string;
        instanceId?: string;
        limit?: number;
    }): Promise<MonitorMetric[]>;
    cleanupOldMetrics(days: number): Promise<number>;
    saveAlertRule(rule: AlertRule): Promise<AlertRule>;
    getAlertRules(monitorType?: MonitorType): Promise<AlertRule[]>;
    getAlertRuleById(ruleId: string): Promise<AlertRule | null>;
    deleteAlertRule(ruleId: string): Promise<boolean>;
    saveAlert(alert: Alert): Promise<Alert>;
    getAlerts(filters?: {
        level?: AlertLevel;
        status?: AlertStatus;
        monitorType?: MonitorType;
        startTime?: Date;
        endTime?: Date;
        moduleName?: string;
    }): Promise<Alert[]>;
    getAlertById(alertId: string): Promise<Alert | null>;
    updateAlertStatus(alertId: string, status: AlertStatus, updatedBy: string): Promise<Alert>;
    saveDashboard(dashboard: Dashboard): Promise<Dashboard>;
    getDashboards(): Promise<Dashboard[]>;
    getDashboardById(dashboardId: string): Promise<Dashboard | null>;
    deleteDashboard(dashboardId: string): Promise<boolean>;
    saveMonitoringReport(report: MonitoringReport): Promise<MonitoringReport>;
    getMonitoringReports(): Promise<MonitoringReport[]>;
    getMonitoringReportById(reportId: string): Promise<MonitoringReport | null>;
    deleteMonitoringReport(reportId: string): Promise<boolean>;
    saveHealthCheck(healthCheck: HealthCheck): Promise<HealthCheck>;
    getHealthChecks(): Promise<HealthCheck[]>;
    getHealthCheckById(checkId: string): Promise<HealthCheck | null>;
    deleteHealthCheck(checkId: string): Promise<boolean>;
    saveMonitoringAgent(agent: MonitoringAgent): Promise<MonitoringAgent>;
    getMonitoringAgents(): Promise<MonitoringAgent[]>;
    getMonitoringAgentById(agentId: string): Promise<MonitoringAgent | null>;
    deleteMonitoringAgent(agentId: string): Promise<boolean>;
    updateAgentHeartbeat(agentId: string): Promise<MonitoringAgent>;
}
//# sourceMappingURL=MonitoringRepository.d.ts.map