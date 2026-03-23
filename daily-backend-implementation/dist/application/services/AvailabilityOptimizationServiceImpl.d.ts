import { AvailabilityOptimizationService } from '../../domain/services/AvailabilityOptimizationService';
import { AvailabilityOptimizationRepository } from '../../domain/repositories/AvailabilityOptimizationRepository';
import { AvailabilityConfig, AvailabilityMetric, AvailabilityEvent, AvailabilityReport, AvailabilityTestResult, AvailabilityLevel, HealthCheckResult } from '../../domain/entities/AvailabilityConfig';
export declare class AvailabilityOptimizationServiceImpl implements AvailabilityOptimizationService {
    private repository;
    constructor(repository: AvailabilityOptimizationRepository);
    getCurrentAvailabilityConfig(): Promise<AvailabilityConfig>;
    updateAvailabilityConfig(config: Partial<AvailabilityConfig>): Promise<AvailabilityConfig>;
    applyAvailabilityConfig(configId: string): Promise<boolean>;
    runHealthChecks(healthCheckConfigId?: string): Promise<HealthCheckResult[]>;
    getHealthCheckResults(startTime: Date, endTime: Date, healthCheckConfigId?: string, limit?: number, offset?: number): Promise<HealthCheckResult[]>;
    getAvailabilityMetrics(startTime: Date, endTime: Date, metricType?: string, serviceName?: string, limit?: number, offset?: number): Promise<AvailabilityMetric[]>;
    recordAvailabilityMetric(metric: AvailabilityMetric): Promise<boolean>;
    getAvailabilityEvents(startTime: Date, endTime: Date, eventType?: string, serviceName?: string, limit?: number, offset?: number): Promise<AvailabilityEvent[]>;
    recordAvailabilityEvent(event: AvailabilityEvent): Promise<boolean>;
    markAvailabilityEventAsProcessed(eventId: string): Promise<boolean>;
    generateAvailabilityReport(reportPeriod: number): Promise<AvailabilityReport>;
    getAvailabilityReportHistory(limit: number, offset: number): Promise<AvailabilityReport[]>;
    runAvailabilityTest(testName: string, testDescription: string, testConfig: {
        type: 'FAILURE_SIMULATION' | 'LOAD_TEST' | 'STRESS_TEST' | 'RECOVERY_TEST';
        parameters: Record<string, any>;
    }): Promise<AvailabilityTestResult>;
    getAvailabilityTestHistory(limit: number, offset: number): Promise<AvailabilityTestResult[]>;
    optimizeAvailabilityConfig(targetLevel: AvailabilityLevel): Promise<{
        optimizedConfig: AvailabilityConfig;
        changes: string[];
    }>;
    getAvailabilityRecommendations(): Promise<string[]>;
    checkAvailabilityCompliance(): Promise<{
        compliant: boolean;
        issues: string[];
    }>;
    triggerFailover(serviceName?: string): Promise<boolean>;
    triggerRecovery(serviceName?: string): Promise<boolean>;
    getCurrentServiceStatus(): Promise<{
        serviceName: string;
        status: 'UP' | 'DOWN' | 'WARNING' | 'UNKNOWN';
        availabilityPercentage: number;
        lastCheckTime: Date;
    }[]>;
    private createDefaultAvailabilityConfig;
    private createHealthCheckConfigs;
    private simulateHealthCheck;
    private calculateAvailabilityStats;
    private calculateAvailabilityScore;
}
//# sourceMappingURL=AvailabilityOptimizationServiceImpl.d.ts.map