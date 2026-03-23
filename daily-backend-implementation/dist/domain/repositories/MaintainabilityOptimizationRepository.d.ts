import { MaintainabilityConfig, CodeQualityIssue, CodeQualityReport, TechDebtItem, DocumentationStatus, MaintainabilityMetric, MaintainabilityEvent } from '../entities/MaintainabilityConfig';
export interface MaintainabilityOptimizationRepository {
    saveMaintainabilityConfig(config: MaintainabilityConfig): Promise<MaintainabilityConfig>;
    getMaintainabilityConfig(): Promise<MaintainabilityConfig>;
    saveCodeQualityReport(report: CodeQualityReport): Promise<CodeQualityReport>;
    getCodeQualityReports(limit?: number, moduleName?: string): Promise<CodeQualityReport[]>;
    saveCodeQualityIssue(issue: CodeQualityIssue): Promise<CodeQualityIssue>;
    saveCodeQualityIssues(issues: CodeQualityIssue[]): Promise<boolean>;
    getCodeQualityIssues(filters?: {
        severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        fixed?: boolean;
        moduleName?: string;
    }): Promise<CodeQualityIssue[]>;
    updateCodeQualityIssue(issue: CodeQualityIssue): Promise<CodeQualityIssue>;
    saveTechDebt(techDebt: TechDebtItem): Promise<TechDebtItem>;
    getTechDebtItems(filters?: {
        severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
        type?: 'CODE' | 'ARCHITECTURE' | 'DEPENDENCY' | 'DOCUMENTATION' | 'TESTING' | 'OPERATION';
    }): Promise<TechDebtItem[]>;
    updateTechDebt(techDebt: TechDebtItem): Promise<TechDebtItem>;
    saveDocumentationStatus(status: DocumentationStatus): Promise<DocumentationStatus>;
    saveDocumentationStatuses(statuses: DocumentationStatus[]): Promise<boolean>;
    getDocumentationStatuses(): Promise<DocumentationStatus[]>;
    saveMaintainabilityMetric(metric: MaintainabilityMetric): Promise<MaintainabilityMetric>;
    saveMaintainabilityMetrics(metrics: MaintainabilityMetric[]): Promise<boolean>;
    getMaintainabilityMetrics(filters?: {
        type?: 'CODE_QUALITY' | 'DOCUMENTATION' | 'TECH_DEBT' | 'TEST_COVERAGE' | 'BUILD_TIME' | 'DEPENDENCY_AGE';
        moduleName?: string;
        startTime?: Date;
        endTime?: Date;
    }): Promise<MaintainabilityMetric[]>;
    saveMaintainabilityEvent(event: MaintainabilityEvent): Promise<MaintainabilityEvent>;
    getMaintainabilityEvents(filters?: {
        type?: 'CODE_QUALITY_SCAN' | 'DOCUMENTATION_UPDATE' | 'TECH_DEBT_ADDED' | 'TECH_DEBT_RESOLVED' | 'DEPENDENCY_UPDATED' | 'BUILD_SUCCESS' | 'BUILD_FAILURE' | 'TEST_RUN' | 'TEST_FAILURE';
        processed?: boolean;
        moduleName?: string;
        startTime?: Date;
        endTime?: Date;
    }): Promise<MaintainabilityEvent[]>;
    updateMaintainabilityEvent(event: MaintainabilityEvent): Promise<MaintainabilityEvent>;
    clearAllData(): Promise<boolean>;
}
//# sourceMappingURL=MaintainabilityOptimizationRepository.d.ts.map