import { Repository } from 'typeorm';
import { InputAnalysis } from '../../../domain/entities/InputAnalysis';
import { InputAnalysisRepository } from '../../../domain/repositories/InputAnalysisRepository';
import { InputAnalysisEntity } from '../entities/input-analysis.entity';
import { UUID } from '../../../domain/value-objects/UUID';
import { AnalysisStatus } from '../../../domain/entities/InputAnalysis';
export declare class InputAnalysisRepositoryImpl implements InputAnalysisRepository {
    private readonly inputAnalysisEntityRepository;
    constructor(inputAnalysisEntityRepository: Repository<InputAnalysisEntity>);
    private toEntity;
    private toDomain;
    save(analysis: InputAnalysis): Promise<InputAnalysis>;
    getById(id: UUID): Promise<InputAnalysis | null>;
    getByInputId(inputId: UUID): Promise<InputAnalysis[]>;
    getByStatus(status: AnalysisStatus, limit: number, offset: number): Promise<InputAnalysis[]>;
    getByType(type: string, limit: number, offset: number): Promise<InputAnalysis[]>;
    updateStatus(id: UUID, status: AnalysisStatus): Promise<InputAnalysis>;
    delete(id: UUID): Promise<boolean>;
    deleteByInputId(inputId: UUID): Promise<number>;
    getByIds(ids: UUID[]): Promise<InputAnalysis[]>;
}
//# sourceMappingURL=input-analysis-repository-implementation.d.ts.map