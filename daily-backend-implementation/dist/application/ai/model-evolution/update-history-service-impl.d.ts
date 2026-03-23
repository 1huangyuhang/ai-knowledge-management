import { UpdateHistoryService } from './interfaces/model-update-service.interface';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { ModelSnapshotService } from './model-snapshot-service';
import { ModelUpdateRecord, UpdateHistoryQueryOptions, HistoryRetentionPolicy } from './types/model-update.types';
import { UserCognitiveModel } from '../../../domain/entities/user-cognitive-model';
export declare class UpdateHistoryServiceImpl implements UpdateHistoryService {
    private cognitiveModelRepository;
    private modelSnapshotService;
    constructor(cognitiveModelRepository: CognitiveModelRepository, modelSnapshotService: ModelSnapshotService);
    recordUpdate(updateRecord: ModelUpdateRecord): Promise<boolean>;
    getUpdateHistory(userId: string, options?: UpdateHistoryQueryOptions): Promise<ModelUpdateRecord[]>;
    getModelByVersion(userId: string, versionId: string): Promise<UserCognitiveModel | null>;
    cleanupOldHistory(userId: string, retentionPolicy: HistoryRetentionPolicy): Promise<number>;
    private isCriticalUpdate;
}
//# sourceMappingURL=update-history-service-impl.d.ts.map