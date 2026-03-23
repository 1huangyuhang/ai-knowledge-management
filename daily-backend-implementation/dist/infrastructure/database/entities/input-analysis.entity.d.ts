import { AnalysisStatus } from '../../../domain/entities/InputAnalysis';
export declare class InputAnalysisEntity {
    id: string;
    inputId: string;
    type: string;
    result: Record<string, any>;
    status: AnalysisStatus;
    confidence: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=input-analysis.entity.d.ts.map