import { UUID } from '../value-objects/UUID';
import { InputAnalysis } from '../entities/InputAnalysis';
import { AnalysisStatus, AnalysisType } from '../entities/InputAnalysis';
export interface InputAnalysisRepository {
    save(analysis: InputAnalysis): Promise<InputAnalysis>;
    getById(id: UUID): Promise<InputAnalysis | null>;
    getByInputId(inputId: UUID): Promise<InputAnalysis[]>;
    getByStatus(status: AnalysisStatus, limit: number, offset: number): Promise<InputAnalysis[]>;
    getByType(type: AnalysisType, limit: number, offset: number): Promise<InputAnalysis[]>;
    updateStatus(id: UUID, status: AnalysisStatus): Promise<InputAnalysis>;
    delete(id: UUID): Promise<boolean>;
    deleteByInputId(inputId: UUID): Promise<number>;
    getByIds(ids: UUID[]): Promise<InputAnalysis[]>;
}
//# sourceMappingURL=InputAnalysisRepository.d.ts.map