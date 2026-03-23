import { AvailabilityOptimizationRepository } from '../../domain/repositories/AvailabilityOptimizationRepository';
import { AvailabilityConfig, AvailabilityMetric, AvailabilityEvent, AvailabilityReport, AvailabilityTestResult, HealthCheckResult } from '../../domain/entities/AvailabilityConfig';
export declare class AvailabilityOptimizationRepositoryImpl implements AvailabilityOptimizationRepository {
    private configs;
    private healthCheckResults;
    private metrics;
    private events;
    private reports;
    private testResults;
    getCurrentConfig(): Promise<AvailabilityConfig | null>;
    saveConfig(config: AvailabilityConfig): Promise<AvailabilityConfig>;
    getAllConfigs(): Promise<AvailabilityConfig[]>;
    getConfigById(id: string): Promise<AvailabilityConfig | null>;
    deleteConfig(id: string): Promise<boolean>;
    saveHealthCheckResult(result: HealthCheckResult): Promise<HealthCheckResult>;
    getHealthCheckResults(startTime: Date, endTime: Date, healthCheckConfigId?: string, limit?: number, offset?: number): Promise<HealthCheckResult[]>;
    saveMetric(metric: AvailabilityMetric): Promise<AvailabilityMetric>;
    getMetrics(startTime: Date, endTime: Date, metricType?: string, serviceName?: string, limit?: number, offset?: number): Promise<AvailabilityMetric[]>;
    saveEvent(event: AvailabilityEvent): Promise<AvailabilityEvent>;
    getEvents(startTime: Date, endTime: Date, eventType?: string, serviceName?: string, limit?: number, offset?: number): Promise<AvailabilityEvent[]>;
    markEventAsProcessed(eventId: string): Promise<boolean>;
    saveReport(report: AvailabilityReport): Promise<AvailabilityReport>;
    getReportHistory(limit: number, offset: number): Promise<AvailabilityReport[]>;
    saveTestResult(testResult: AvailabilityTestResult): Promise<AvailabilityTestResult>;
    getTestHistory(limit: number, offset: number): Promise<AvailabilityTestResult[]>;
    getTestResultById(id: string): Promise<AvailabilityTestResult | null>;
    getUnprocessedEvents(): Promise<AvailabilityEvent[]>;
    deleteExpiredHealthCheckResults(olderThan: Date): Promise<number>;
    deleteExpiredMetrics(olderThan: Date): Promise<number>;
    deleteExpiredEvents(olderThan: Date): Promise<number>;
}
//# sourceMappingURL=AvailabilityOptimizationRepositoryImpl.d.ts.map