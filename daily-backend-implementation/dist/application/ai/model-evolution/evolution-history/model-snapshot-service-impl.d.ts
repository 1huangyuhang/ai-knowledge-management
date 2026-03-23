import { ModelSnapshotService, SnapshotRepository, CompressionService, EncryptionService } from '../interfaces/evolution-history.interface';
import { ModelSnapshot, ModelSnapshotDiff } from '../types/evolution-history.types';
export declare class ModelSnapshotServiceImpl implements ModelSnapshotService {
    private snapshotRepository;
    private compressionService;
    private encryptionService;
    constructor(snapshotRepository: SnapshotRepository, compressionService: CompressionService, encryptionService: EncryptionService);
    createSnapshot(userId: string, model: any, versionId: string): Promise<ModelSnapshot>;
    getSnapshot(userId: string, snapshotId: string): Promise<ModelSnapshot | null>;
    getSnapshots(userId: string, options?: any): Promise<ModelSnapshot[]>;
    deleteSnapshot(userId: string, snapshotId: string): Promise<boolean>;
    compareSnapshots(snapshot1: ModelSnapshot, snapshot2: ModelSnapshot): Promise<ModelSnapshotDiff>;
    getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null>;
    restoreModelFromSnapshot(snapshot: ModelSnapshot): Promise<any>;
    private calculateModelHash;
    private compareConcepts;
    private compareRelations;
    private getChangedFields;
}
//# sourceMappingURL=model-snapshot-service-impl.d.ts.map