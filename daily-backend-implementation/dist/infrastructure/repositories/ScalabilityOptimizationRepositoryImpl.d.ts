import { ScalabilityOptimizationRepository } from '../../domain/repositories/ScalabilityOptimizationRepository';
import { ScalabilityConfig, ScalabilityMetric, ScalabilityEvent, ScalabilityReport, ScalabilityTestResult } from '../../domain/entities/ScalabilityConfig';
export declare class ScalabilityOptimizationRepositoryImpl implements ScalabilityOptimizationRepository {
    private configs;
    private metrics;
    private events;
    private reports;
    private testResults;
    getCurrentConfig(): Promise<ScalabilityConfig | null>;
    saveConfig(config: ScalabilityConfig): Promise<ScalabilityConfig>;
    getAllConfigs(): Promise<ScalabilityConfig[]>;
    getConfigById(id: string): Promise<ScalabilityConfig | null>;
    deleteConfig(id: string): Promise<boolean>;
    saveMetric(metric: ScalabilityMetric): Promise<ScalabilityMetric>;
    getMetrics(startTime: Date, endTime: Date, resourceType?: string, limit?: number, offset?: number): Promise<ScalabilityMetric[]>;
    saveEvent(event: ScalabilityEvent): Promise<ScalabilityEvent>;
    getEvents(startTime: Date, endTime: Date, eventType?: string, limit?: number, offset?: number): Promise<ScalabilityEvent[]>;
    markEventAsProcessed(eventId: string): Promise<boolean>;
    saveReport(report: ScalabilityReport): Promise<ScalabilityReport>;
    getReportHistory(limit: number, offset: number): Promise<ScalabilityReport[]>;
    saveTestResult(testResult: ScalabilityTestResult): Promise<ScalabilityTestResult>;
    getTestHistory(limit: number, offset: number): Promise<ScalabilityTestResult[]>;
    getTestResultById(id: string): Promise<ScalabilityTestResult | null>;
    getUnprocessedEvents(): Promise<ScalabilityEvent[]>;
    deleteExpiredMetrics(olderThan: Date): Promise<number>;
    deleteExpiredEvents(olderThan: Date): Promise<number>;
}
//# sourceMappingURL=ScalabilityOptimizationRepositoryImpl.d.ts.map