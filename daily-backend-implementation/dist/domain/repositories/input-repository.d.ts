import { UUID } from '../value-objects/uuid';
import { FileInput } from '../entities/file-input';
import { SpeechInput } from '../entities/speech-input';
export interface InputRepository {
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
}
//# sourceMappingURL=input-repository.d.ts.map