"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMonitor = void 0;
class SystemMonitor {
    loggingSystem;
    metrics;
    requestStartTimeMap = new Map();
    constructor(loggingSystem) {
        this.loggingSystem = loggingSystem;
        this.metrics = {
            timestamp: new Date().toISOString(),
            uptime: 0,
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            database: {
                connected: false,
                queryCount: 0,
                errorCount: 0,
            },
            events: {
                published: 0,
                processed: 0,
                failed: 0,
            },
            requests: {
                total: 0,
                errors: 0,
                averageResponseTime: 0,
            },
        };
        this.startMetricsUpdate();
    }
    startMetricsUpdate() {
        setInterval(() => {
            this.updateMetrics();
        }, 10000);
    }
    updateMetrics() {
        this.metrics.timestamp = new Date().toISOString();
        this.metrics.uptime = process.uptime();
        this.metrics.memory = process.memoryUsage();
        this.metrics.cpu = process.cpuUsage();
    }
    recordRequestStart(requestId) {
        this.metrics.requests.total++;
        this.requestStartTimeMap.set(requestId, Date.now());
    }
    recordRequestEnd(requestId, error = false) {
        const startTime = this.requestStartTimeMap.get(requestId);
        if (startTime) {
            const responseTime = Date.now() - startTime;
            this.metrics.requests.averageResponseTime =
                (this.metrics.requests.averageResponseTime * (this.metrics.requests.total - 1) + responseTime) / this.metrics.requests.total;
            this.requestStartTimeMap.delete(requestId);
        }
        if (error) {
            this.metrics.requests.errors++;
        }
    }
    getMetrics() {
        this.updateMetrics();
        return { ...this.metrics };
    }
    logSystemEvent(eventName, data = {}) {
        this.loggingSystem.info(`System Event: ${eventName}`, data);
    }
    async checkHealth() {
        const databaseStatus = 'ok';
        const eventsStatus = 'ok';
        const memoryStatus = this.checkMemoryUsage();
        const cpuStatus = this.checkCpuUsage();
        let overallStatus = 'ok';
        if (memoryStatus === 'error' || cpuStatus === 'error') {
            overallStatus = 'degraded';
        }
        else if (memoryStatus === 'warning' || cpuStatus === 'warning') {
            overallStatus = 'degraded';
        }
        return {
            status: overallStatus,
            components: {
                database: databaseStatus,
                events: eventsStatus,
                memory: memoryStatus,
                cpu: cpuStatus,
            },
        };
    }
    checkMemoryUsage() {
        const memoryUsage = process.memoryUsage();
        const rssMB = memoryUsage.rss / 1024 / 1024;
        if (rssMB > 1024) {
            return 'error';
        }
        else if (rssMB > 512) {
            return 'warning';
        }
        return 'ok';
    }
    checkCpuUsage() {
        return 'ok';
    }
}
exports.SystemMonitor = SystemMonitor;
//# sourceMappingURL=SystemMonitor.js.map