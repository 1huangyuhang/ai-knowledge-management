"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = exports.Metric = void 0;
exports.createPerformanceMiddleware = createPerformanceMiddleware;
class Metric {
    name;
    values = [];
    windowSize = 1000;
    constructor(name) {
        this.name = name;
    }
    addValue(value) {
        this.values.push(value);
        if (this.values.length > this.windowSize) {
            this.values.shift();
        }
    }
    getStats() {
        const count = this.values.length;
        const sum = this.values.reduce((a, b) => a + b, 0);
        const avg = count > 0 ? sum / count : 0;
        const min = count > 0 ? Math.min(...this.values) : 0;
        const max = count > 0 ? Math.max(...this.values) : 0;
        const sorted = [...this.values].sort((a, b) => a - b);
        const p50 = this.getPercentile(sorted, 50);
        const p95 = this.getPercentile(sorted, 95);
        const p99 = this.getPercentile(sorted, 99);
        return {
            name: this.name,
            count,
            sum,
            avg,
            min,
            max,
            p50,
            p95,
            p99,
            lastUpdated: Date.now()
        };
    }
    getPercentile(sorted, percentile) {
        if (sorted.length === 0)
            return 0;
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[index];
    }
}
exports.Metric = Metric;
class PerformanceMonitor {
    metrics = new Map();
    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, new Metric(name));
        }
        this.metrics.get(name).addValue(value);
    }
    getMetricStats(name) {
        const metric = this.metrics.get(name);
        return metric ? metric.getStats() : null;
    }
    getAllMetrics() {
        const result = {};
        for (const [name, metric] of this.metrics.entries()) {
            result[name] = metric.getStats();
        }
        return result;
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
function createPerformanceMiddleware(monitor) {
    return async (request, reply) => {
        const start = process.hrtime.bigint();
        reply.raw.on('finish', () => {
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1e6;
            monitor.recordMetric('response_time', duration);
            monitor.recordMetric(`response_time_${request.routeOptions.url}`, duration);
            monitor.recordMetric(`status_${reply.statusCode}`, 1);
        });
    };
}
//# sourceMappingURL=performance.middleware.js.map