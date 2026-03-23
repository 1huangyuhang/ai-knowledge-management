import { MaintainabilityOptimizationService } from '../../domain/services/MaintainabilityOptimizationService';
import { MaintainabilityOptimizationRepository } from '../../domain/repositories/MaintainabilityOptimizationRepository';
import { MaintainabilityConfig, CodeQualityIssue, CodeQualityReport, TechDebtItem, DocumentationStatus, MaintainabilityMetric, MaintainabilityEvent } from '../../domain/entities/MaintainabilityConfig';
export declare class MaintainabilityOptimizationServiceImpl implements MaintainabilityOptimizationService {
    private readonly maintainabilityRepository;
    constructor(maintainabilityRepository: MaintainabilityOptimizationRepository);
    getMaintainabilityConfig(): Promise<MaintainabilityConfig>;
    updateMaintainabilityConfig(config: MaintainabilityConfig): Promise<MaintainabilityConfig>;
    applyMaintainabilityConfig(configId: string): Promise<boolean>;
    runStaticCodeAnalysis(moduleName?: string): Promise<CodeQualityReport>;
    getCodeQualityIssues(filters?: {
        severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        fixed?: boolean;
        moduleName?: string;
    }): Promise<CodeQualityIssue[]>;
    fixCodeQualityIssue(issueId: string, fixedBy: string): Promise<boolean>;
    getCodeQualityReportHistory(limit?: number, moduleName?: string): Promise<CodeQualityReport[]>;
    addTechDebt(techDebt: Omit<TechDebtItem, 'id' | 'createdAt'>): Promise<TechDebtItem>;
    getTechDebtItems(filters?: {
        severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
        type?: 'CODE' | 'ARCHITECTURE' | 'DEPENDENCY' | 'DOCUMENTATION' | 'TESTING' | 'OPERATION';
    }): Promise<TechDebtItem[]>;
    updateTechDebtStatus(techDebtId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED', resolvedBy?: string): Promise<TechDebtItem>;
    getDocumentationStatus(): Promise<DocumentationStatus[]>;
    updateDocumentationStatus(documentationStatus: DocumentationStatus): Promise<DocumentationStatus>;
    checkDependencyUpdates(): Promise<Record<string, any>[]>;
    getMaintainabilityMetrics(filters?: {
        type?: 'CODE_QUALITY' | 'DOCUMENTATION' | 'TECH_DEBT' | 'TEST_COVERAGE' | 'BUILD_TIME' | 'DEPENDENCY_AGE';
        moduleName?: string;
        startTime?: Date;
        endTime?: Date;
    }): Promise<MaintainabilityMetric[]>;
    recordMaintainabilityEvent(event: Omit<MaintainabilityEvent, 'id' | 'timestamp' | 'processed'>): Promise<MaintainabilityEvent>;
    getMaintainabilityEvents(filters?: {
        type?: 'CODE_QUALITY_SCAN' | 'DOCUMENTATION_UPDATE' | 'TECH_DEBT_ADDED' | 'TECH_DEBT_RESOLVED' | 'DEPENDENCY_UPDATED' | 'BUILD_SUCCESS' | 'BUILD_FAILURE' | 'TEST_RUN' | 'TEST_FAILURE';
        processed?: boolean;
        moduleName?: string;
        startTime?: Date;
        endTime?: Date;
    }): Promise<MaintainabilityEvent[]>;
    markEventAsProcessed(eventId: string): Promise<boolean>;
    generateMaintainabilityReport(period: number): Promise<Record<string, any>>;
    getTechDebtEstimate(): Promise<{
        totalHours: number;
        breakdown: Record<string, number>;
    }>;
    optimizeCodeQualityRules(): Promise<Record<string, any>>;
    checkArchitectureCompliance(): Promise<Record<string, any>>;
}
//# sourceMappingURL=MaintainabilityOptimizationServiceImpl.d.ts.map