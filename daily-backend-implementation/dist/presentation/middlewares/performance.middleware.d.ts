import { FastifyMiddleware } from 'fastify';
export interface MetricStats {
    name: string;
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
    lastUpdated: number;
}
export declare class Metric {
    private name;
    private values;
    private windowSize;
    constructor(name: string);
    addValue(value: number): void;
    getStats(): MetricStats;
    private getPercentile;
}
export declare class PerformanceMonitor {
    private metrics;
    recordMetric(name: string, value: number): void;
    getMetricStats(name: string): MetricStats | null;
    getAllMetrics(): Record<string, MetricStats>;
}
export declare function createPerformanceMiddleware(monitor: PerformanceMonitor): FastifyMiddleware;
//# sourceMappingURL=performance.middleware.d.ts.map