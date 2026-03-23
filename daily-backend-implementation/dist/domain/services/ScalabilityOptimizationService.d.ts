import { ScalabilityConfig, ScalabilityMetric, ScalabilityEvent, ScalabilityReport, ScalabilityTestResult, ScalabilityLevel } from '../entities/ScalabilityConfig';
export interface ScalabilityOptimizationService {
    getCurrentScalabilityConfig(): Promise<ScalabilityConfig>;
    updateScalabilityConfig(config: Partial<ScalabilityConfig>): Promise<ScalabilityConfig>;
    applyScalabilityConfig(configId: string): Promise<boolean>;
    getScalabilityMetrics(startTime: Date, endTime: Date, resourceType?: string, limit?: number, offset?: number): Promise<ScalabilityMetric[]>;
    recordScalabilityMetric(metric: ScalabilityMetric): Promise<boolean>;
    getScalabilityEvents(startTime: Date, endTime: Date, eventType?: string, limit?: number, offset?: number): Promise<ScalabilityEvent[]>;
    recordScalabilityEvent(event: ScalabilityEvent): Promise<boolean>;
    markScalabilityEventAsProcessed(eventId: string): Promise<boolean>;
    generateScalabilityReport(reportPeriod: number): Promise<ScalabilityReport>;
    getScalabilityReportHistory(limit: number, offset: number): Promise<ScalabilityReport[]>;
    runScalabilityTest(testName: string, testDescription: string, loadConfig: {
        initialUsers: number;
        targetUsers: number;
        rampUpRate: number;
        duration: number;
    }): Promise<ScalabilityTestResult>;
    getScalabilityTestHistory(limit: number, offset: number): Promise<ScalabilityTestResult[]>;
    optimizeScalabilityConfig(targetLevel: ScalabilityLevel): Promise<{
        optimizedConfig: ScalabilityConfig;
        changes: string[];
    }>;
    getScalabilityRecommendations(): Promise<string[]>;
    checkScalabilityCompliance(): Promise<{
        compliant: boolean;
        issues: string[];
    }>;
    triggerManualScaling(scaleDirection: 'UP' | 'DOWN', instanceCount: number): Promise<boolean>;
    getCurrentInstanceStatus(): Promise<{
        instanceCount: number;
        activeInstances: number;
        pendingInstances: number;
        scalingInProgress: boolean;
    }>;
}
//# sourceMappingURL=ScalabilityOptimizationService.d.ts.map