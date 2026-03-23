import { VersionManagementService, ModelVersion, VersionQueryOptions, VersionCreateOptions, VersionComparisonResult } from './version-management-service';
import { VersionRepository } from '../interfaces/version-repository.interface';
import { ModelSnapshotService } from '../interfaces/evolution-history.interface';
export declare class VersionManagementServiceImpl implements VersionManagementService {
    private versionRepository;
    private modelSnapshotService;
    constructor(versionRepository: VersionRepository, modelSnapshotService: ModelSnapshotService);
    getVersions(userId: string, options?: VersionQueryOptions): Promise<ModelVersion[]>;
    getVersionById(userId: string, versionId: string): Promise<ModelVersion | null>;
    createVersion(userId: string, model: any, options?: VersionCreateOptions): Promise<ModelVersion>;
    updateVersion(userId: string, versionId: string, updates: Partial<ModelVersion>): Promise<ModelVersion | null>;
    deleteVersion(userId: string, versionId: string): Promise<boolean>;
    compareVersions(userId: string, version1: string, version2: string): Promise<VersionComparisonResult>;
    getLatestVersion(userId: string): Promise<ModelVersion | null>;
    getVersionHistory(userId: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<ModelVersion[]>;
    private generateVersionNumber;
    private calculateModelSize;
    private compareConcepts;
    private compareRelations;
    private getRelationKey;
    private generateChangeSummary;
}
//# sourceMappingURL=version-management-service-impl.d.ts.map