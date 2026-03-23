export declare enum HealthStatusType {
    UP = "UP",
    DOWN = "DOWN",
    DEGRADED = "DEGRADED"
}
export interface HealthCheckResult {
    status: HealthStatusType;
    details?: Record<string, any>;
    timestamp: string;
}
export interface HealthIndicator {
    check(): Promise<HealthCheckResult>;
}
export interface HealthStatus {
    status: HealthStatusType;
    timestamp: number;
    modules: Record<string, HealthCheckResult>;
    metrics?: {
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
    };
}
export interface HealthChecker {
    checkHealth(): Promise<HealthStatus>;
    registerHealthIndicator(moduleId: string, indicator: HealthIndicator): Promise<void>;
    removeHealthIndicator(moduleId: string): Promise<void>;
}
export declare class DefaultHealthChecker implements HealthChecker {
    private healthIndicators;
    checkHealth(): Promise<HealthStatus>;
    registerHealthIndicator(moduleId: string, indicator: HealthIndicator): Promise<void>;
    removeHealthIndicator(moduleId: string): Promise<void>;
}
export declare const healthChecker: DefaultHealthChecker;
//# sourceMappingURL=HealthChecker.d.ts.map