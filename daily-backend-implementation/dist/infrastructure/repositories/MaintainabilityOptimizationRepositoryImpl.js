"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintainabilityOptimizationRepositoryImpl = void 0;
class MaintainabilityOptimizationRepositoryImpl {
    maintainabilityConfig = null;
    codeQualityReports = [];
    codeQualityIssues = [];
    techDebts = [];
    documentationStatuses = [];
    maintainabilityMetrics = [];
    maintainabilityEvents = [];
    async saveMaintainabilityConfig(config) {
        this.maintainabilityConfig = config;
        return config;
    }
    async getMaintainabilityConfig() {
        if (!this.maintainabilityConfig) {
            throw new Error('Maintainability config not found');
        }
        return this.maintainabilityConfig;
    }
    async saveCodeQualityReport(report) {
        this.codeQualityReports.push(report);
        return report;
    }
    async getCodeQualityReports(limit, moduleName) {
        let reports = [...this.codeQualityReports];
        reports.sort((a, b) => b.reportTime.getTime() - a.reportTime.getTime());
        if (limit) {
            reports = reports.slice(0, limit);
        }
        return reports;
    }
    async saveCodeQualityIssue(issue) {
        this.codeQualityIssues.push(issue);
        return issue;
    }
    async saveCodeQualityIssues(issues) {
        this.codeQualityIssues.push(...issues);
        return true;
    }
    async getCodeQualityIssues(filters) {
        let issues = [...this.codeQualityIssues];
        if (filters) {
            if (filters.severity) {
                issues = issues.filter(issue => issue.severity === filters.severity);
            }
            if (filters.fixed !== undefined) {
                issues = issues.filter(issue => issue.fixed === filters.fixed);
            }
        }
        return issues;
    }
    async updateCodeQualityIssue(issue) {
        const index = this.codeQualityIssues.findIndex(i => i.id === issue.id);
        if (index !== -1) {
            this.codeQualityIssues[index] = issue;
        }
        return issue;
    }
    async saveTechDebt(techDebt) {
        this.techDebts.push(techDebt);
        return techDebt;
    }
    async getTechDebtItems(filters) {
        let techDebts = [...this.techDebts];
        if (filters) {
            if (filters.severity) {
                techDebts = techDebts.filter(td => td.severity === filters.severity);
            }
            if (filters.status) {
                techDebts = techDebts.filter(td => td.status === filters.status);
            }
            if (filters.type) {
                techDebts = techDebts.filter(td => td.type === filters.type);
            }
        }
        return techDebts;
    }
    async updateTechDebt(techDebt) {
        const index = this.techDebts.findIndex(td => td.id === techDebt.id);
        if (index !== -1) {
            this.techDebts[index] = techDebt;
        }
        return techDebt;
    }
    async saveDocumentationStatus(status) {
        const existingIndex = this.documentationStatuses.findIndex(s => s.type === status.type);
        if (existingIndex !== -1) {
            this.documentationStatuses[existingIndex] = status;
        }
        else {
            this.documentationStatuses.push(status);
        }
        return status;
    }
    async saveDocumentationStatuses(statuses) {
        for (const status of statuses) {
            await this.saveDocumentationStatus(status);
        }
        return true;
    }
    async getDocumentationStatuses() {
        return [...this.documentationStatuses];
    }
    async saveMaintainabilityMetric(metric) {
        this.maintainabilityMetrics.push(metric);
        return metric;
    }
    async saveMaintainabilityMetrics(metrics) {
        this.maintainabilityMetrics.push(...metrics);
        return true;
    }
    async getMaintainabilityMetrics(filters) {
        let metrics = [...this.maintainabilityMetrics];
        if (filters) {
            if (filters.type) {
                metrics = metrics.filter(metric => metric.type === filters.type);
            }
            if (filters.moduleName) {
                metrics = metrics.filter(metric => metric.moduleName === filters.moduleName);
            }
            if (filters.startTime) {
                metrics = metrics.filter(metric => metric.timestamp >= filters.startTime);
            }
            if (filters.endTime) {
                metrics = metrics.filter(metric => metric.timestamp <= filters.endTime);
            }
        }
        return metrics;
    }
    async saveMaintainabilityEvent(event) {
        this.maintainabilityEvents.push(event);
        return event;
    }
    async getMaintainabilityEvents(filters) {
        let events = [...this.maintainabilityEvents];
        if (filters) {
            if (filters.type) {
                events = events.filter(event => event.type === filters.type);
            }
            if (filters.processed !== undefined) {
                events = events.filter(event => event.processed === filters.processed);
            }
            if (filters.moduleName) {
                events = events.filter(event => event.moduleName === filters.moduleName);
            }
            if (filters.startTime) {
                events = events.filter(event => event.timestamp >= filters.startTime);
            }
            if (filters.endTime) {
                events = events.filter(event => event.timestamp <= filters.endTime);
            }
        }
        return events;
    }
    async updateMaintainabilityEvent(event) {
        const index = this.maintainabilityEvents.findIndex(e => e.id === event.id);
        if (index !== -1) {
            this.maintainabilityEvents[index] = event;
        }
        return event;
    }
    async clearAllData() {
        this.maintainabilityConfig = null;
        this.codeQualityReports = [];
        this.codeQualityIssues = [];
        this.techDebts = [];
        this.documentationStatuses = [];
        this.maintainabilityMetrics = [];
        this.maintainabilityEvents = [];
        return true;
    }
}
exports.MaintainabilityOptimizationRepositoryImpl = MaintainabilityOptimizationRepositoryImpl;
//# sourceMappingURL=MaintainabilityOptimizationRepositoryImpl.js.map