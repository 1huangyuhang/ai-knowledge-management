"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalabilityOptimizationRepositoryImpl = void 0;
class ScalabilityOptimizationRepositoryImpl {
    configs = new Map();
    metrics = [];
    events = new Map();
    reports = [];
    testResults = new Map();
    async getCurrentConfig() {
        const sortedConfigs = Array.from(this.configs.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return sortedConfigs[0] || null;
    }
    async saveConfig(config) {
        this.configs.set(config.id, config);
        return config;
    }
    async getAllConfigs() {
        return Array.from(this.configs.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    async getConfigById(id) {
        return this.configs.get(id) || null;
    }
    async deleteConfig(id) {
        return this.configs.delete(id);
    }
    async saveMetric(metric) {
        this.metrics.push(metric);
        return metric;
    }
    async getMetrics(startTime, endTime, resourceType, limit, offset) {
        let filteredMetrics = this.metrics.filter(metric => {
            const metricTime = new Date(metric.timestamp);
            const inTimeRange = metricTime >= startTime && metricTime <= endTime;
            const matchesResourceType = !resourceType || metric.resourceType === resourceType;
            return inTimeRange && matchesResourceType;
        });
        filteredMetrics = filteredMetrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (offset !== undefined) {
            filteredMetrics = filteredMetrics.slice(offset);
        }
        if (limit !== undefined) {
            filteredMetrics = filteredMetrics.slice(0, limit);
        }
        return filteredMetrics;
    }
    async saveEvent(event) {
        this.events.set(event.id, event);
        return event;
    }
    async getEvents(startTime, endTime, eventType, limit, offset) {
        let filteredEvents = Array.from(this.events.values()).filter(event => {
            const eventTime = new Date(event.timestamp);
            const inTimeRange = eventTime >= startTime && eventTime <= endTime;
            const matchesEventType = !eventType || event.type === eventType;
            return inTimeRange && matchesEventType;
        });
        filteredEvents = filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (offset !== undefined) {
            filteredEvents = filteredEvents.slice(offset);
        }
        if (limit !== undefined) {
            filteredEvents = filteredEvents.slice(0, limit);
        }
        return filteredEvents;
    }
    async markEventAsProcessed(eventId) {
        const event = this.events.get(eventId);
        if (!event) {
            return false;
        }
        event.processed = true;
        this.events.set(eventId, event);
        return true;
    }
    async saveReport(report) {
        this.reports.push(report);
        return report;
    }
    async getReportHistory(limit, offset) {
        const sortedReports = [...this.reports].sort((a, b) => new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime());
        return sortedReports.slice(offset, offset + limit);
    }
    async saveTestResult(testResult) {
        this.testResults.set(testResult.id, testResult);
        return testResult;
    }
    async getTestHistory(limit, offset) {
        const sortedTestResults = Array.from(this.testResults.values()).sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
        return sortedTestResults.slice(offset, offset + limit);
    }
    async getTestResultById(id) {
        return this.testResults.get(id) || null;
    }
    async getUnprocessedEvents() {
        return Array.from(this.events.values()).filter(event => !event.processed);
    }
    async deleteExpiredMetrics(olderThan) {
        const initialCount = this.metrics.length;
        this.metrics = this.metrics.filter(metric => new Date(metric.timestamp) >= olderThan);
        return initialCount - this.metrics.length;
    }
    async deleteExpiredEvents(olderThan) {
        const initialCount = this.events.size;
        for (const [id, event] of this.events.entries()) {
            if (new Date(event.timestamp) < olderThan) {
                this.events.delete(id);
            }
        }
        return initialCount - this.events.size;
    }
}
exports.ScalabilityOptimizationRepositoryImpl = ScalabilityOptimizationRepositoryImpl;
//# sourceMappingURL=ScalabilityOptimizationRepositoryImpl.js.map