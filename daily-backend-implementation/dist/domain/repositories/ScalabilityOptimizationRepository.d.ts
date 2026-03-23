import { ScalabilityConfig, ScalabilityMetric, ScalabilityEvent, ScalabilityReport, ScalabilityTestResult } from '../entities/ScalabilityConfig';
export interface ScalabilityOptimizationRepository {
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
//# sourceMappingURL=ScalabilityOptimizationRepository.d.ts.map