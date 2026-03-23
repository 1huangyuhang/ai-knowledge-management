import { InputAnalysisRepository } from '../../../domain/repositories/InputAnalysisRepository';
import { InputAnalysis, AnalysisStatus } from '../../../domain/entities/InputAnalysis';
import { UUID } from '../../../domain/value-objects/UUID';
import { DatabaseConnection } from '../connection/SQLiteConnection';
import { LoggerService } from '../../logging/LoggerService';
export declare class InputAnalysisRepositoryImpl implements InputAnalysisRepository {
    private readonly dbConnection;
    private readonly logger;
    constructor(dbConnection: DatabaseConnection, logger: LoggerService);
    private initializeTable;
    save(analysis: InputAnalysis): Promise<InputAnalysis>;
    getById(id: UUID): Promise<InputAnalysis | null>;
    getByInputId(inputId: UUID): Promise<InputAnalysis[]>;
    getByStatus(status: AnalysisStatus, limit: number, offset: number): Promise<InputAnalysis[]>;
    getByType(type: string, limit: number, offset: number): Promise<InputAnalysis[]>;
    updateStatus(id: UUID, status: AnalysisStatus): Promise<InputAnalysis>;
    delete(id: UUID): Promise<boolean>;
    deleteByInputId(inputId: UUID): Promise<number>;
    getByIds(ids: UUID[]): Promise<InputAnalysis[]>;
    private mapRowToEntity;
}
//# sourceMappingURL=InputAnalysisRepositoryImpl.d.ts.map