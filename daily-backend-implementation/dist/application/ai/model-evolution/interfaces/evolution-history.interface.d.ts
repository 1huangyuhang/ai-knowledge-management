import { ModelEvolutionEvent, EvolutionHistoryQueryOptions, ModelSnapshot, ModelVersionDiff, HistoryRetentionPolicy, HistoryCleanupResult, ExportFormat, ExportOptions, ExportedHistory, TimeRange, EvolutionStatistics, VersionComparisonReport, ConceptDiff, RelationDiff, ModelSnapshotDiff, SnapshotQueryOptions } from '../types/evolution-history.types';
export interface EvolutionEventRepository {
    save(event: ModelEvolutionEvent): Promise<void>;
    find(query: any): Promise<ModelEvolutionEvent[]>;
    findById(id: string): Promise<ModelEvolutionEvent | null>;
    findByUserIdAndVersion(userId: string, version: string): Promise<ModelEvolutionEvent[]>;
    deleteByTimeRange(startTime: Date, endTime: Date): Promise<number>;
    deleteByUserId(userId: string): Promise<number>;
}
export interface SnapshotRepository {
    save(snapshot: ModelSnapshot): Promise<void>;
    findById(id: string): Promise<ModelSnapshot | null>;
    findByUserIdAndVersion(userId: string, version: string): Promise<ModelSnapshot | null>;
    find(query: any): Promise<ModelSnapshot[]>;
    deleteByTimeRange(startTime: Date, endTime: Date): Promise<number>;
    deleteByUserId(userId: string): Promise<number>;
}
export interface CompressionService {
    compress(data: string): Promise<string>;
    decompress(compressedData: string): Promise<string>;
}
export interface EncryptionService {
    encrypt(data: string): Promise<string>;
    decrypt(encryptedData: string): Promise<string>;
}
export interface EvolutionHistoryService {
    recordEvolutionEvent(event: ModelEvolutionEvent): Promise<boolean>;
    getEvolutionHistory(userId: string, options?: EvolutionHistoryQueryOptions): Promise<ModelEvolutionEvent[]>;
    getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null>;
    getVersionDiff(userId: string, fromVersion: string, toVersion: string): Promise<ModelVersionDiff>;
    cleanupOldHistory(userId: string, retentionPolicy: HistoryRetentionPolicy): Promise<HistoryCleanupResult>;
    exportEvolutionHistory(userId: string, format: ExportFormat, options?: ExportOptions): Promise<ExportedHistory>;
    getEvolutionStatistics(userId: string, timeRange: TimeRange): Promise<EvolutionStatistics>;
}
export interface ModelSnapshotService {
    createSnapshot(userId: string, model: any, versionId: string): Promise<ModelSnapshot>;
    getSnapshot(userId: string, snapshotId: string): Promise<ModelSnapshot | null>;
    getSnapshots(userId: string, options?: SnapshotQueryOptions): Promise<ModelSnapshot[]>;
    deleteSnapshot(userId: string, snapshotId: string): Promise<boolean>;
    compareSnapshots(snapshot1: ModelSnapshot, snapshot2: ModelSnapshot): Promise<ModelSnapshotDiff>;
    getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null>;
    restoreModelFromSnapshot(snapshot: ModelSnapshot): Promise<any>;
}
export interface VersionComparisonService {
    compareVersions(userId: string, version1: string, version2: string): Promise<ModelVersionDiff>;
    getConceptDiff(userId: string, version1: string, version2: string): Promise<ConceptDiff>;
    getRelationDiff(userId: string, version1: string, version2: string): Promise<RelationDiff>;
    generateComparisonReport(userId: string, version1: string, version2: string): Promise<VersionComparisonReport>;
}
export interface EvolutionHistoryServiceFactory {
    create(): EvolutionHistoryService;
}
export interface ModelSnapshotServiceFactory {
    create(): ModelSnapshotService;
}
export interface VersionComparisonServiceFactory {
    create(): VersionComparisonService;
}
//# sourceMappingURL=evolution-history.interface.d.ts.map