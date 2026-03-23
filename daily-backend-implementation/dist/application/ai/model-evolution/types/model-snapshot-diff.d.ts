import { ModelSnapshot } from './model-snapshot';
import { ModelVersionDiff } from './model-version-diff';
export interface ModelSnapshotDiff {
    id: string;
    snapshot1: Pick<ModelSnapshot, 'id' | 'version' | 'createdAt'>;
    snapshot2: Pick<ModelSnapshot, 'id' | 'version' | 'createdAt'>;
    versionDiff: ModelVersionDiff;
    calculatedAt: Date;
}
//# sourceMappingURL=model-snapshot-diff.d.ts.map