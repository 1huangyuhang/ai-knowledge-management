"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringServiceImpl = void 0;
const tslib_1 = require("tslib");
const MonitoringConfig_1 = require("../../domain/entities/MonitoringConfig");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class MonitoringServiceImpl {
    monitoringRepository;
    constructor(monitoringRepository) {
        this.monitoringRepository = monitoringRepository;
    }
    async getMonitoringConfigs() {
        return await this.monitoringRepository.getMonitoringConfigs();
    }
    async getMonitoringConfigById(configId) {
        const config = await this.monitoringRepository.getMonitoringConfigById(configId);
        if (!config) {
            throw new Error(`Monitoring config with id ${configId} not found`);
        }
        return config;
    }
    async createMonitoringConfig(config) {
        const newConfig = {
            ...config,
            id: crypto_1.default.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return await this.monitoringRepository.saveMonitoringConfig(newConfig);
    }
    async updateMonitoringConfig(configId, config) {
        const existingConfig = await this.getMonitoringConfigById(configId);
        const updatedConfig = {
            ...existingConfig,
            ...config,
            updatedAt: new Date()
        };
        return await this.monitoringRepository.saveMonitoringConfig(updatedConfig);
    }
    async deleteMonitoringConfig(configId) {
        return await this.monitoringRepository.deleteMonitoringConfig(configId);
    }
    async collectMetrics(metrics) {
        const metricsToSave = metrics.map(metric => ({
            ...metric,
            id: crypto_1.default.randomUUID(),
            timestamp: new Date()
        }));
        return await this.monitoringRepository.saveMonitorMetrics(metricsToSave);
    }
    async getMetrics(filters) {
        return await this.monitoringRepository.getMonitorMetrics(filters);
    }
    async getMetricTrend(metricName, monitorType, interval, duration) {
        const endTime = new Date();
        const startTime = new Date();
        startTime.setHours(endTime.getHours() - duration);
        const metrics = await this.monitoringRepository.getMonitorMetrics({
            metricName,
            monitorType,
            startTime,
            endTime
        });
        const groupedMetrics = {};
        metrics.forEach(metric => {
            const intervalKey = this.getIntervalKey(metric.timestamp, interval);
            if (!groupedMetrics[intervalKey]) {
                groupedMetrics[intervalKey] = [];
            }
            groupedMetrics[intervalKey].push(metric.value);
        });
        const trendData = Object.entries(groupedMetrics).map(([timestamp, values]) => {
            const avgValue = values.reduce((sum, value) => sum + value, 0) / values.length;
            return {
                timestamp,
                value: avgValue
            };
        });
        trendData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return {
            metricName,
            monitorType,
            interval,
            duration,
            data: trendData
        };
    }
    getIntervalKey(timestamp, interval) {
        const date = new Date(timestamp.getTime());
        date.setMinutes(Math.floor(date.getMinutes() / interval) * interval);
        date.setSeconds(0, 0);
        return date.toISOString();
    }
    async createAlertRule(rule) {
        const newRule = {
            ...rule,
            id: crypto_1.default.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return await this.monitoringRepository.saveAlertRule(newRule);
    }
    async getAlertRules(monitorType) {
        return await this.monitoringRepository.getAlertRules(monitorType);
    }
    async getAlertRuleById(ruleId) {
        const rule = await this.monitoringRepository.getAlertRuleById(ruleId);
        if (!rule) {
            throw new Error(`Alert rule with id ${ruleId} not found`);
        }
        return rule;
    }
    async updateAlertRule(ruleId, rule) {
        const existingRule = await this.getAlertRuleById(ruleId);
        const updatedRule = {
            ...existingRule,
            ...rule,
            updatedAt: new Date()
        };
        return await this.monitoringRepository.saveAlertRule(updatedRule);
    }
    async deleteAlertRule(ruleId) {
        return await this.monitoringRepository.deleteAlertRule(ruleId);
    }
    async triggerAlert(alert) {
        const newAlert = {
            ...alert,
            id: crypto_1.default.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const savedAlert = await this.monitoringRepository.saveAlert(newAlert);
        await this.sendAlertNotification(savedAlert);
        return savedAlert;
    }
    async getAlerts(filters) {
        return await this.monitoringRepository.getAlerts(filters);
    }
    async getAlertById(alertId) {
        const alert = await this.monitoringRepository.getAlertById(alertId);
        if (!alert) {
            throw new Error(`Alert with id ${alertId} not found`);
        }
        return alert;
    }
    async updateAlertStatus(alertId, status, updatedBy) {
        return await this.monitoringRepository.updateAlertStatus(alertId, status, updatedBy);
    }
    async acknowledgeAlert(alertId, acknowledgedBy) {
        const alert = await this.getAlertById(alertId);
        return await this.monitoringRepository.updateAlertStatus(alertId, MonitoringConfig_1.AlertStatus.ACKNOWLEDGED, acknowledgedBy);
    }
    async resolveAlert(alertId, resolvedBy, resolutionDetails) {
        const alert = await this.getAlertById(alertId);
        return await this.monitoringRepository.updateAlertStatus(alertId, MonitoringConfig_1.AlertStatus.RESOLVED, resolvedBy);
    }
    async closeAlert(alertId, closedBy) {
        const alert = await this.getAlertById(alertId);
        return await this.monitoringRepository.updateAlertStatus(alertId, MonitoringConfig_1.AlertStatus.CLOSED, closedBy);
    }
    async createDashboard(dashboard) {
        const newDashboard = {
            ...dashboard,
            id: crypto_1.default.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return await this.monitoringRepository.saveDashboard(newDashboard);
    }
    async getDashboards() {
        return await this.monitoringRepository.getDashboards();
    }
    async getDashboardById(dashboardId) {
        const dashboard = await this.monitoringRepository.getDashboardById(dashboardId);
        if (!dashboard) {
            throw new Error(`Dashboard with id ${dashboardId} not found`);
        }
        return dashboard;
    }
    async updateDashboard(dashboardId, dashboard) {
        const existingDashboard = await this.getDashboardById(dashboardId);
        const updatedDashboard = {
            ...existingDashboard,
            ...dashboard,
            updatedAt: new Date()
        };
        return await this.monitoringRepository.saveDashboard(updatedDashboard);
    }
    async deleteDashboard(dashboardId) {
        return await this.monitoringRepository.deleteDashboard(dashboardId);
    }
    async addDashboardWidget(dashboardId, widget) {
        const dashboard = await this.getDashboardById(dashboardId);
        const newWidget = {
            ...widget,
            id: crypto_1.default.randomUUID()
        };
        dashboard.widgets.push(newWidget);
        dashboard.updatedAt = new Date();
        return await this.monitoringRepository.saveDashboard(dashboard);
    }
    async updateDashboardWidget(dashboardId, widgetId, widget) {
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
    async deleteDashboardWidget(dashboardId, widgetId) {
        const dashboard = await this.getDashboardById(dashboardId);
        dashboard.widgets = dashboard.widgets.filter(w => w.id !== widgetId);
        dashboard.updatedAt = new Date();
        return await this.monitoringRepository.saveDashboard(dashboard);
    }
    async createMonitoringReport(report) {
        const newReport = {
            ...report,
            id: crypto_1.default.randomUUID(),
            status: 'PENDING',
            createdAt: new Date()
        };
        return await this.monitoringRepository.saveMonitoringReport(newReport);
    }
    async getMonitoringReports() {
        return await this.monitoringRepository.getMonitoringReports();
    }
    async getMonitoringReportById(reportId) {
        const report = await this.monitoringRepository.getMonitoringReportById(reportId);
        if (!report) {
            throw new Error(`Monitoring report with id ${reportId} not found`);
        }
        return report;
    }
    async generateMonitoringReport(reportId) {
        const report = await this.getMonitoringReportById(reportId);
        console.log(`Generating monitoring report ${reportId} for period ${report.period.start} to ${report.period.end}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
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
        const updatedReport = {
            ...report,
            status: 'GENERATED',
            content: reportContent,
            generatedAt: new Date()
        };
        await this.monitoringRepository.saveMonitoringReport(updatedReport);
        return true;
    }
    async deleteMonitoringReport(reportId) {
        return await this.monitoringRepository.deleteMonitoringReport(reportId);
    }
    async createHealthCheck(healthCheck) {
        const now = new Date();
        const nextCheckAt = new Date(now.getTime() + 60000);
        const newHealthCheck = {
            ...healthCheck,
            id: crypto_1.default.randomUUID(),
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
    async getHealthChecks() {
        return await this.monitoringRepository.getHealthChecks();
    }
    async getHealthCheckById(checkId) {
        const healthCheck = await this.monitoringRepository.getHealthCheckById(checkId);
        if (!healthCheck) {
            throw new Error(`Health check with id ${checkId} not found`);
        }
        return healthCheck;
    }
    async updateHealthCheck(checkId, healthCheck) {
        const existingHealthCheck = await this.getHealthCheckById(checkId);
        const updatedHealthCheck = {
            ...existingHealthCheck,
            ...healthCheck,
            updatedAt: new Date()
        };
        return await this.monitoringRepository.saveHealthCheck(updatedHealthCheck);
    }
    async deleteHealthCheck(checkId) {
        return await this.monitoringRepository.deleteHealthCheck(checkId);
    }
    async runHealthCheck(checkId) {
        const healthCheck = await this.getHealthCheckById(checkId);
        console.log(`Running health check ${checkId} for ${healthCheck.target}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const isHealthy = Math.random() > 0.1;
        const responseTime = Math.floor(Math.random() * 500);
        const updatedHealthCheck = {
            ...healthCheck,
            status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
            responseTime,
            lastCheckedAt: new Date(),
            nextCheckAt: new Date(Date.now() + 60000),
            result: {
                healthy: isHealthy,
                responseTime,
                checkedAt: new Date().toISOString()
            },
            updatedAt: new Date()
        };
        const savedHealthCheck = await this.monitoringRepository.saveHealthCheck(updatedHealthCheck);
        if (!isHealthy) {
            await this.triggerAlert({
                ruleId: 'system-health-check',
                ruleName: 'System Health Check',
                level: MonitoringConfig_1.AlertLevel.ERROR,
                status: MonitoringConfig_1.AlertStatus.PENDING,
                monitorType: MonitoringConfig_1.MonitorType.APP_PERFORMANCE,
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
    async registerMonitoringAgent(agent) {
        const now = new Date();
        const newAgent = {
            ...agent,
            id: crypto_1.default.randomUUID(),
            registeredAt: now,
            updatedAt: now,
            lastHeartbeatAt: now,
            status: 'ONLINE'
        };
        return await this.monitoringRepository.saveMonitoringAgent(newAgent);
    }
    async getMonitoringAgents() {
        return await this.monitoringRepository.getMonitoringAgents();
    }
    async getMonitoringAgentById(agentId) {
        const agent = await this.monitoringRepository.getMonitoringAgentById(agentId);
        if (!agent) {
            throw new Error(`Monitoring agent with id ${agentId} not found`);
        }
        return agent;
    }
    async updateAgentHeartbeat(agentId) {
        return await this.monitoringRepository.updateAgentHeartbeat(agentId);
    }
    async deleteMonitoringAgent(agentId) {
        return await this.monitoringRepository.deleteMonitoringAgent(agentId);
    }
    async sendAlertNotification(alert) {
        console.log(`Sending alert notification for ${alert.id}: ${alert.description}`);
        console.log(`Alert level: ${alert.level}, Status: ${alert.status}`);
        return true;
    }
    async cleanupOldMonitoringData(days) {
        return await this.monitoringRepository.cleanupOldMetrics(days);
    }
    async getSystemHealthStatus() {
        const healthChecks = await this.getHealthChecks();
        const checkResults = await Promise.all(healthChecks.map(check => this.runHealthCheck(check.id)));
        const cpuMetrics = await this.getMetrics({
            monitorType: MonitoringConfig_1.MonitorType.CPU,
            metricName: 'usage',
            limit: 10
        });
        const memoryMetrics = await this.getMetrics({
            monitorType: MonitoringConfig_1.MonitorType.MEMORY,
            metricName: 'usage',
            limit: 10
        });
        const activeAlerts = await this.getAlerts({
            status: MonitoringConfig_1.AlertStatus.PENDING
        });
        const criticalAlerts = activeAlerts.filter(alert => alert.level === MonitoringConfig_1.AlertLevel.CRITICAL);
        const errorAlerts = activeAlerts.filter(alert => alert.level === MonitoringConfig_1.AlertLevel.ERROR);
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
                warning: activeAlerts.filter(alert => alert.level === MonitoringConfig_1.AlertLevel.WARNING).length,
                info: activeAlerts.filter(alert => alert.level === MonitoringConfig_1.AlertLevel.INFO).length
            },
            agents: {
                total: agents.length,
                online: onlineAgents.length,
                offline: agents.filter(agent => agent.status === 'OFFLINE').length,
                degraded: agents.filter(agent => agent.status === 'DEGRADED').length
            }
        };
    }
    async getAlertStatistics() {
        const allAlerts = await this.getAlerts();
        const activeAlerts = allAlerts.filter(alert => alert.status === MonitoringConfig_1.AlertStatus.PENDING);
        const acknowledgedAlerts = allAlerts.filter(alert => alert.status === MonitoringConfig_1.AlertStatus.ACKNOWLEDGED);
        const resolvedAlerts = allAlerts.filter(alert => alert.status === MonitoringConfig_1.AlertStatus.RESOLVED);
        const closedAlerts = allAlerts.filter(alert => alert.status === MonitoringConfig_1.AlertStatus.CLOSED);
        const byLevel = allAlerts.reduce((acc, alert) => {
            acc[alert.level] = (acc[alert.level] || 0) + 1;
            return acc;
        }, {});
        const byMonitorType = allAlerts.reduce((acc, alert) => {
            acc[alert.monitorType] = (acc[alert.monitorType] || 0) + 1;
            return acc;
        }, {});
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
exports.MonitoringServiceImpl = MonitoringServiceImpl;
//# sourceMappingURL=MonitoringServiceImpl.js.map