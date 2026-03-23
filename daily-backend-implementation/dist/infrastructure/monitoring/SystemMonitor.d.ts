import { LoggerService } from '../logging/logger.service';
export interface SystemMetrics {
    timestamp: string;
    uptime: number;
    memory: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
    };
    cpu: {
        user: number;
        system: number;
    };
    database: {
        connected: boolean;
        queryCount: number;
        errorCount: number;
    };
    events: {
        published: number;
        processed: number;
        failed: number;
    };
    requests: {
        total: number;
        errors: number;
        averageResponseTime: number;
    };
}
export declare class SystemMonitor {
    private readonly loggingSystem;
    private readonly metrics;
    private requestStartTimeMap;
    constructor(loggingSystem: LoggerService);
    private startMetricsUpdate;
    private updateMetrics;
    recordRequestStart(requestId: string): void;
    recordRequestEnd(requestId: string, error?: boolean): void;
    getMetrics(): SystemMetrics;
    logSystemEvent(eventName: string, data?: any): void;
    checkHealth(): Promise<{
        status: 'ok' | 'degraded' | 'error';
        components: {
            database: 'ok' | 'error';
            events: 'ok' | 'error';
            memory: 'ok' | 'warning' | 'error';
            cpu: 'ok' | 'warning' | 'error';
        };
    }>;
    private checkMemoryUsage;
    private checkCpuUsage;
}
//# sourceMappingURL=SystemMonitor.d.ts.map