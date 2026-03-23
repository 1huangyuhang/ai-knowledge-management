export declare enum HealthStatusType {
    UP = "UP",
    DOWN = "DOWN",
    DEGRADED = "DEGRADED"
}
export interface HealthCheckResult {
    status: HealthStatusType;
    details?: Record<string, any>;
    error?: string;
}
export interface HealthStatus {
    status: HealthStatusType;
    timestamp: number;
    modules: Record<string, HealthCheckResult>;
    systemInfo?: Record<string, any>;
}
export interface HealthIndicator {
    moduleId: string;
    check(): Promise<HealthCheckResult>;
}
export interface HealthChecker {
    checkHealth(): Promise<HealthStatus>;
    registerHealthIndicator(indicator: HealthIndicator): Promise<void>;
    unregisterHealthIndicator(moduleId: string): Promise<void>;
    checkModuleHealth(moduleId: string): Promise<HealthCheckResult | null>;
}
export declare class DefaultHealthChecker implements HealthChecker {
    private indicators;
    checkHealth(): Promise<HealthStatus>;
    registerHealthIndicator(indicator: HealthIndicator): Promise<void>;
    unregisterHealthIndicator(moduleId: string): Promise<void>;
    checkModuleHealth(moduleId: string): Promise<HealthCheckResult | null>;
}
export declare const healthChecker: DefaultHealthChecker;
//# sourceMappingURL=HealthChecker.d.ts.map