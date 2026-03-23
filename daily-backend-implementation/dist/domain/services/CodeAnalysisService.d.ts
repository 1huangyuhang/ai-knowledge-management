import { UUID } from '../value-objects/UUID';
import { CodeAnalysis } from '../entities/CodeAnalysis';
export interface CreateCodeAnalysisDto {
    projectId: string;
    filePath: string;
    analysisType?: string;
    configuration?: Record<string, any>;
}
export interface CodeAnalysisService {
    createAnalysis(dto: CreateCodeAnalysisDto): Promise<CodeAnalysis>;
    getAnalysisById(id: UUID): Promise<CodeAnalysis | null>;
    getAnalysesByProject(projectId: string): Promise<CodeAnalysis[]>;
    executeAnalysis(id: UUID): Promise<CodeAnalysis>;
    updateAnalysisResults(id: UUID, metrics: any[], issues: any[], status: string): Promise<CodeAnalysis>;
    deleteAnalysis(id: UUID): Promise<boolean>;
}
//# sourceMappingURL=CodeAnalysisService.d.ts.map