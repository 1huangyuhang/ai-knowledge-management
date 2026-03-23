import { ModelVersion, VersionQueryOptions } from '../version-management/version-management-service';
export interface VersionRepository {
    find(userId: string, options?: VersionQueryOptions): Promise<ModelVersion[]>;
    findById(userId: string, versionId: string): Promise<ModelVersion | null>;
    save(version: ModelVersion): Promise<ModelVersion>;
    delete(userId: string, versionId: string): Promise<boolean>;
    findLatest(userId: string): Promise<ModelVersion | null>;
    findByModelId(userId: string, modelId: string): Promise<ModelVersion[]>;
    findByTimeRange(userId: string, startDate: Date, endDate: Date): Promise<ModelVersion[]>;
}
//# sourceMappingURL=version-repository.interface.d.ts.map