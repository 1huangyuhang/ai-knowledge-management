import { UserCognitiveModel } from '../../../domain/entities/cognitive-model';
import { ModelSnapshot } from './types/model-snapshot';
import { SnapshotQueryOptions } from './types/snapshot-query-options';
import { ModelSnapshotDiff } from './types/model-snapshot-diff';
export interface ModelSnapshotService {
    createSnapshot(userId: string, model: UserCognitiveModel, versionId: string): Promise<ModelSnapshot>;
    getSnapshot(userId: string, snapshotId: string): Promise<ModelSnapshot | null>;
    getSnapshots(userId: string, options?: SnapshotQueryOptions): Promise<ModelSnapshot[]>;
    deleteSnapshot(userId: string, snapshotId: string): Promise<boolean>;
    compareSnapshots(snapshot1: ModelSnapshot, snapshot2: ModelSnapshot): Promise<ModelSnapshotDiff>;
    getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null>;
}
//# sourceMappingURL=model-snapshot-service.d.ts.map