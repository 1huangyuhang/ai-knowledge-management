export interface VersionManagementService {
    getVersions(userId: string, options?: VersionQueryOptions): Promise<ModelVersion[]>;
    getVersionById(userId: string, versionId: string): Promise<ModelVersion | null>;
    createVersion(userId: string, model: any, options?: VersionCreateOptions): Promise<ModelVersion>;
    updateVersion(userId: string, versionId: string, updates: Partial<ModelVersion>): Promise<ModelVersion | null>;
    deleteVersion(userId: string, versionId: string): Promise<boolean>;
    compareVersions(userId: string, version1: string, version2: string): Promise<VersionComparisonResult>;
    getLatestVersion(userId: string): Promise<ModelVersion | null>;
    getVersionHistory(userId: string, timeRange?: TimeRange): Promise<ModelVersion[]>;
}
export interface VersionQueryOptions {
    createdAtRange?: {
        start: Date;
        end: Date;
    };
    name?: string;
    tags?: string[];
    pagination?: {
        page: number;
        limit: number;
    };
}
export interface VersionCreateOptions {
    name?: string;
    tags?: string[];
    description?: string;
    isMajor?: boolean;
}
export interface ModelVersion {
    id: string;
    name: string;
    version: string;
    userId: string;
    modelId: string;
    description?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    isMajor: boolean;
    status: VersionStatus;
    statistics?: VersionStatistics;
}
export declare enum VersionStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
    DEPRECATED = "DEPRECATED"
}
export interface VersionStatistics {
    conceptCount: number;
    relationCount: number;
    modelSize: number;
    creationTime: number;
}
export interface VersionComparisonResult {
    id: string;
    version1: string;
    version2: string;
    comparedAt: Date;
    conceptDiff: ConceptDifference;
    relationDiff: RelationDifference;
    statistics: ComparisonStatistics;
    changeSummary: string;
}
export interface ConceptDifference {
    added: string[];
    updated: string[];
    removed: string[];
    renamed: Array<{
        oldName: string;
        newName: string;
    }>;
}
export interface RelationDifference {
    added: string[];
    updated: string[];
    removed: string[];
}
export interface ComparisonStatistics {
    totalChanges: number;
    conceptChanges: number;
    relationChanges: number;
    changePercentage: number;
}
export interface TimeRange {
    start: Date;
    end: Date;
}
//# sourceMappingURL=version-management-service.d.ts.map