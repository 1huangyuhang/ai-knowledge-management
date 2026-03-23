import { CodeAnalysisService, CreateCodeAnalysisDto } from '../../domain/services/CodeAnalysisService';
import { CodeAnalysis } from '../../domain/entities/CodeAnalysis';
import { UUID } from '../../domain/value-objects/UUID';
import { CodeIssue } from '../../domain/entities/CodeIssue';
import { CodeMetric } from '../../domain/entities/CodeMetric';
export declare class CodeAnalysisServiceImpl implements CodeAnalysisService {
    private readonly eslintAnalyzer;
    constructor();
    createAnalysis(dto: CreateCodeAnalysisDto): Promise<CodeAnalysis>;
    getAnalysisById(id: UUID): Promise<CodeAnalysis | null>;
    getAnalysesByProject(projectId: string): Promise<CodeAnalysis[]>;
    executeAnalysis(id: UUID): Promise<CodeAnalysis>;
    updateAnalysisResults(id: UUID, metrics: CodeMetric[], issues: CodeIssue[], status: string): Promise<CodeAnalysis>;
    deleteAnalysis(id: UUID): Promise<boolean>;
}
//# sourceMappingURL=CodeAnalysisServiceImpl.d.ts.map