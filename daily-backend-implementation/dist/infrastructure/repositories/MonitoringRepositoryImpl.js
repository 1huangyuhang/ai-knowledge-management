"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringRepositoryImpl = void 0;
class MonitoringRepositoryImpl {
    monitoringConfigs = new Map();
    monitorMetrics = new Map();
    alertRules = new Map();
    alerts = new Map();
    dashboards = new Map();
    monitoringReports = new Map();
    healthChecks = new Map();
    monitoringAgents = new Map();
    async saveMonitoringConfig(config) {
        this.monitoringConfigs.set(config.id, config);
        return config;
    }
    async getMonitoringConfigs() {
        return Array.from(this.monitoringConfigs.values());
    }
    async getMonitoringConfigById(configId) {
        return this.monitoringConfigs.get(configId) || null;
    }
    async deleteMonitoringConfig(configId) {
        return this.monitoringConfigs.delete(configId);
    }
    async saveMonitorMetric(metric) {
        this.monitorMetrics.set(metric.id, metric);
        return metric;
    }
    async saveMonitorMetrics(metrics) {
        for (const metric of metrics) {
            this.monitorMetrics.set(metric.id, metric);
        }
        return true;
    }
    async getMonitorMetrics(filters) {
        let result = Array.from(this.monitorMetrics.values());
        if (filters) {
            if (filters.monitorType) {
                result = result.filter(metric => metric.monitorType === filters.monitorType);
            }
            if (filters.metricName) {
                result = result.filter(metric => metric.metricName === filters.metricName);
            }
            if (filters.startTime) {
                result = result.filter(metric => metric.timestamp >= filters.startTime);
            }
            if (filters.endTime) {
                result = result.filter(metric => metric.timestamp <= filters.endTime);
            }
            if (filters.moduleName) {
                result = result.filter(metric => metric.moduleName === filters.moduleName);
            }
            if (filters.instanceId) {
                result = result.filter(metric => metric.instanceId === filters.instanceId);
            }
        }
        result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        if (filters?.limit) {
            result = result.slice(0, filters.limit);
        }
        return result;
    }
    async cleanupOldMetrics(days) {
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
    async saveAlertRule(rule) {
        this.alertRules.set(rule.id, rule);
        return rule;
    }
    async getAlertRules(monitorType) {
        let result = Array.from(this.alertRules.values());
        if (monitorType) {
            result = result.filter(rule => rule.monitorType === monitorType);
        }
        return result;
    }
    async getAlertRuleById(ruleId) {
        return this.alertRules.get(ruleId) || null;
    }
    async deleteAlertRule(ruleId) {
        return this.alertRules.delete(ruleId);
    }
    async saveAlert(alert) {
        this.alerts.set(alert.id, alert);
        return alert;
    }
    async getAlerts(filters) {
        let result = Array.from(this.alerts.values());
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
                result = result.filter(alert => alert.timestamp >= filters.startTime);
            }
            if (filters.endTime) {
                result = result.filter(alert => alert.timestamp <= filters.endTime);
            }
            if (filters.moduleName) {
                result = result.filter(alert => alert.moduleName === filters.moduleName);
            }
        }
        result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return result;
    }
    async getAlertById(alertId) {
        return this.alerts.get(alertId) || null;
    }
    async updateAlertStatus(alertId, status, updatedBy) {
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
    async saveDashboard(dashboard) {
        this.dashboards.set(dashboard.id, dashboard);
        return dashboard;
    }
    async getDashboards() {
        return Array.from(this.dashboards.values());
    }
    async getDashboardById(dashboardId) {
        return this.dashboards.get(dashboardId) || null;
    }
    async deleteDashboard(dashboardId) {
        return this.dashboards.delete(dashboardId);
    }
    async saveMonitoringReport(report) {
        this.monitoringReports.set(report.id, report);
        return report;
    }
    async getMonitoringReports() {
        return Array.from(this.monitoringReports.values());
    }
    async getMonitoringReportById(reportId) {
        return this.monitoringReports.get(reportId) || null;
    }
    async deleteMonitoringReport(reportId) {
        return this.monitoringReports.delete(reportId);
    }
    async saveHealthCheck(healthCheck) {
        this.healthChecks.set(healthCheck.id, healthCheck);
        return healthCheck;
    }
    async getHealthChecks() {
        return Array.from(this.healthChecks.values());
    }
    async getHealthCheckById(checkId) {
        return this.healthChecks.get(checkId) || null;
    }
    async deleteHealthCheck(checkId) {
        return this.healthChecks.delete(checkId);
    }
    async saveMonitoringAgent(agent) {
        this.monitoringAgents.set(agent.id, agent);
        return agent;
    }
    async getMonitoringAgents() {
        return Array.from(this.monitoringAgents.values());
    }
    async getMonitoringAgentById(agentId) {
        return this.monitoringAgents.get(agentId) || null;
    }
    async deleteMonitoringAgent(agentId) {
        return this.monitoringAgents.delete(agentId);
    }
    async updateAgentHeartbeat(agentId) {
        const agent = this.monitoringAgents.get(agentId);
        if (!agent) {
            throw new Error(`Monitoring agent with ID ${agentId} not found`);
        }
        agent.lastHeartbeat = new Date();
        this.monitoringAgents.set(agentId, agent);
        return agent;
    }
}
exports.MonitoringRepositoryImpl = MonitoringRepositoryImpl;
//# sourceMappingURL=MonitoringRepositoryImpl.js.map