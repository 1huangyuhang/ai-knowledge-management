import { UserCognitiveModel } from '../../../domain/entities/cognitive-model';
import { ModelSnapshotService } from './model-snapshot-service';
import { ModelSnapshot } from './types/model-snapshot';
import { SnapshotQueryOptions } from './types/snapshot-query-options';
import { ModelSnapshotDiff } from './types/model-snapshot-diff';
interface SnapshotRepository {
    save(snapshot: ModelSnapshot): Promise<void>;
    findById(snapshotId: string, userId: string): Promise<ModelSnapshot | null>;
    findByVersion(versionId: string, userId: string): Promise<ModelSnapshot | null>;
    findByUserId(userId: string, options?: SnapshotQueryOptions): Promise<ModelSnapshot[]>;
    delete(snapshotId: string, userId: string): Promise<boolean>;
    countByUserId(userId: string): Promise<number>;
}
interface CompressionService {
    compress(data: string): Promise<string>;
    decompress(data: string): Promise<string>;
}
interface EncryptionService {
    encrypt(data: string): Promise<string>;
    decrypt(data: string): Promise<string>;
}
interface CognitiveModelRepository {
    findById(id: string, userId: string): Promise<UserCognitiveModel | null>;
}
export declare class ModelSnapshotServiceImpl implements ModelSnapshotService {
    private snapshotRepository;
    private compressionService;
    private encryptionService;
    private cognitiveModelRepository;
    constructor(snapshotRepository: SnapshotRepository, compressionService: CompressionService, encryptionService: EncryptionService, cognitiveModelRepository: CognitiveModelRepository);
    createSnapshot(userId: string, model: UserCognitiveModel, versionId: string): Promise<ModelSnapshot>;
    getSnapshot(userId: string, snapshotId: string): Promise<ModelSnapshot | null>;
    getSnapshots(userId: string, options?: SnapshotQueryOptions): Promise<ModelSnapshot[]>;
    deleteSnapshot(userId: string, snapshotId: string): Promise<boolean>;
    compareSnapshots(snapshot1: ModelSnapshot, snapshot2: ModelSnapshot): Promise<ModelSnapshotDiff>;
    getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null>;
    private calculateModelHash;
    private compareConcepts;
    private compareRelations;
    private findUpdatedFields;
}
export {};
//# sourceMappingURL=model-snapshot-service-impl.d.ts.map