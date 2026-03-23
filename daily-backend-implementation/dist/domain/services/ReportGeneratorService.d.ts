import { UUID } from '../value-objects/UUID';
import { OptimizationReport } from '../entities/OptimizationReport';
export interface ReportOptions {
    format: 'html' | 'json' | 'console' | 'pdf';
    includeDetails?: boolean;
    includeMetrics?: boolean;
    includeSuggestions?: boolean;
    includeOptimizations?: boolean;
    includeTrends?: boolean;
    dateRange?: {
        start: Date;
        end: Date;
    };
    sortBy?: 'severity' | 'impact' | 'date';
    filterBy?: {
        severity?: string[];
        type?: string[];
        status?: string[];
    };
}
export interface ReportGeneratorService {
    generateReport(projectId: string, options?: ReportOptions): Promise<OptimizationReport>;
    generateAnalysisReport(analysisId: UUID, options?: ReportOptions): Promise<OptimizationReport>;
    getReportById(id: UUID): Promise<OptimizationReport | null>;
    getReportsByProject(projectId: string): Promise<OptimizationReport[]>;
    exportReport(reportId: UUID, format: string): Promise<Buffer>;
    generateTrendReport(projectId: string, options?: ReportOptions): Promise<OptimizationReport>;
    deleteReport(id: UUID): Promise<boolean>;
    batchGenerateReports(projectIds: string[], options?: ReportOptions): Promise<OptimizationReport[]>;
}
//# sourceMappingURL=ReportGeneratorService.d.ts.map