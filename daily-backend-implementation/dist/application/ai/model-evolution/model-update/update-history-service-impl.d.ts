import { UpdateHistoryService } from '../interfaces/model-update.interface';
import { ModelUpdateRecord } from '../types/model-update.types';
export declare class UpdateHistoryServiceImpl implements UpdateHistoryService {
    private updateHistoryRepository;
    constructor(updateHistoryRepository: any);
    recordUpdate(updateRecord: ModelUpdateRecord): Promise<boolean>;
    getUpdateHistory(userId: string, options?: any): Promise<ModelUpdateRecord[]>;
    getModelByVersion(userId: string, versionId: string): Promise<any | null>;
    cleanupOldHistory(userId: string, retentionPolicy: any): Promise<number>;
}
//# sourceMappingURL=update-history-service-impl.d.ts.map