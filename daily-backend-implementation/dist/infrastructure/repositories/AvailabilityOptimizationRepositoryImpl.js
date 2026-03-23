"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityOptimizationRepositoryImpl = void 0;
class AvailabilityOptimizationRepositoryImpl {
    configs = new Map();
    healthCheckResults = [];
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
    async saveHealthCheckResult(result) {
        this.healthCheckResults.push(result);
        return result;
    }
    async getHealthCheckResults(startTime, endTime, healthCheckConfigId, limit, offset) {
        let filteredResults = this.healthCheckResults.filter(result => {
            const resultTime = new Date(result.checkTime);
            const inTimeRange = resultTime >= startTime && resultTime <= endTime;
            const matchesConfigId = !healthCheckConfigId || result.healthCheckConfigId === healthCheckConfigId;
            return inTimeRange && matchesConfigId;
        });
        filteredResults = filteredResults.sort((a, b) => new Date(b.checkTime).getTime() - new Date(a.checkTime).getTime());
        if (offset !== undefined) {
            filteredResults = filteredResults.slice(offset);
        }
        if (limit !== undefined) {
            filteredResults = filteredResults.slice(0, limit);
        }
        return filteredResults;
    }
    async saveMetric(metric) {
        this.metrics.push(metric);
        return metric;
    }
    async getMetrics(startTime, endTime, metricType, serviceName, limit, offset) {
        let filteredMetrics = this.metrics.filter(metric => {
            const metricTime = new Date(metric.timestamp);
            const inTimeRange = metricTime >= startTime && metricTime <= endTime;
            const matchesMetricType = !metricType || metric.type === metricType;
            const matchesServiceName = !serviceName || metric.serviceName === serviceName;
            return inTimeRange && matchesMetricType && matchesServiceName;
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
    async getEvents(startTime, endTime, eventType, serviceName, limit, offset) {
        let filteredEvents = Array.from(this.events.values()).filter(event => {
            const eventTime = new Date(event.timestamp);
            const inTimeRange = eventTime >= startTime && eventTime <= endTime;
            const matchesEventType = !eventType || event.type === eventType;
            const matchesServiceName = !serviceName || event.serviceName === serviceName;
            return inTimeRange && matchesEventType && matchesServiceName;
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
    async deleteExpiredHealthCheckResults(olderThan) {
        const initialCount = this.healthCheckResults.length;
        this.healthCheckResults = this.healthCheckResults.filter(result => new Date(result.checkTime) >= olderThan);
        return initialCount - this.healthCheckResults.length;
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
exports.AvailabilityOptimizationRepositoryImpl = AvailabilityOptimizationRepositoryImpl;
//# sourceMappingURL=AvailabilityOptimizationRepositoryImpl.js.map