import { InputRepository } from '../../domain/repositories/input-repository';
import { FileInput } from '../../domain/entities/file-input';
import { SpeechInput } from '../../domain/entities/speech-input';
import { UUID } from '../../domain/value-objects/uuid';
import { DatabaseConnection } from '../database/connection/DatabaseConnection';
export declare class InputRepositoryImpl implements InputRepository {
    private readonly databaseConnection;
    constructor(databaseConnection: DatabaseConnection);
    private initFileInputTable;
    private initSpeechInputTable;
    saveFileInput(fileInput: FileInput): Promise<FileInput>;
    saveSpeechInput(speechInput: SpeechInput): Promise<SpeechInput>;
    getFileInputById(id: UUID): Promise<FileInput | null>;
    getSpeechInputById(id: UUID): Promise<SpeechInput | null>;
    getUserInputHistory(userId: UUID, limit: number, offset: number): Promise<Array<FileInput | SpeechInput>>;
    getUserFileInputHistory(userId: UUID, limit: number, offset: number): Promise<FileInput[]>;
    getUserSpeechInputHistory(userId: UUID, limit: number, offset: number): Promise<SpeechInput[]>;
    getUserInputStatistics(userId: UUID): Promise<{
        totalInputs: number;
        fileInputs: number;
        speechInputs: number;
        totalSize: number;
        averageInputSize: number;
        latestInputAt: Date | null;
    }>;
    deleteInput(id: UUID): Promise<boolean>;
    deleteInputs(ids: UUID[]): Promise<number>;
    searchUserInputs(userId: UUID, keyword: string, limit: number, offset: number): Promise<Array<FileInput | SpeechInput>>;
    private mapRowToFileInput;
    private mapRowToSpeechInput;
}
//# sourceMappingURL=InputRepositoryImpl.d.ts.map