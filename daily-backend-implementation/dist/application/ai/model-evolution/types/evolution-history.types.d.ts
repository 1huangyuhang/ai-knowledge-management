export declare enum ModelEvolutionEventType {
    MODEL_CREATED = "MODEL_CREATED",
    MODEL_UPDATED = "MODEL_UPDATED",
    CONCEPT_ADDED = "CONCEPT_ADDED",
    CONCEPT_UPDATED = "CONCEPT_UPDATED",
    CONCEPT_REMOVED = "CONCEPT_REMOVED",
    RELATION_ADDED = "RELATION_ADDED",
    RELATION_UPDATED = "RELATION_UPDATED",
    RELATION_REMOVED = "RELATION_REMOVED",
    MODEL_RESTRUCTURED = "MODEL_RESTRUCTURED",
    MODEL_VERSIONED = "MODEL_VERSIONED"
}
export declare enum SnapshotType {
    AUTO = "AUTO",
    MANUAL = "MANUAL",
    VERSIONED = "VERSIONED",
    BACKUP = "BACKUP"
}
export declare enum EvolutionHistoryErrorType {
    INVALID_EVENT_DATA = "INVALID_EVENT_DATA",
    SNAPSHOT_CREATION_FAILED = "SNAPSHOT_CREATION_FAILED",
    SNAPSHOT_RECOVERY_FAILED = "SNAPSHOT_RECOVERY_FAILED",
    VERSION_COMPARISON_FAILED = "VERSION_COMPARISON_FAILED",
    HISTORY_QUERY_FAILED = "HISTORY_QUERY_FAILED",
    DATA_CLEANUP_FAILED = "DATA_CLEANUP_FAILED",
    DATA_EXPORT_FAILED = "DATA_EXPORT_FAILED"
}
export interface EvolutionHistoryQueryOptions {
    eventTypes?: ModelEvolutionEventType[];
    startTime?: Date;
    endTime?: Date;
    versions?: string[];
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'version';
    sortOrder?: 'asc' | 'desc';
}
export interface SnapshotQueryOptions {
    snapshotTypes?: SnapshotType[];
    startTime?: Date;
    endTime?: Date;
    versions?: string[];
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'version';
    sortOrder?: 'asc' | 'desc';
}
export interface HistoryRetentionPolicy {
    retentionDays: number;
    archiveOldData: boolean;
    archivePath?: string;
}
export interface HistoryCleanupResult {
    eventsCleaned: number;
    snapshotsCleaned: number;
    eventsArchived: number;
    snapshotsArchived: number;
    cleanupTime: Date;
}
export declare enum ExportFormat {
    JSON = "JSON",
    CSV = "CSV",
    XML = "XML"
}
export interface ExportOptions {
    includeSnapshots?: boolean;
    startTime?: Date;
    endTime?: Date;
    eventTypes?: ModelEvolutionEventType[];
}
export interface ExportedHistory {
    id: string;
    exportTime: Date;
    format: ExportFormat;
    data: string;
    metadata: {
        eventCount: number;
        snapshotCount: number;
        sizeInBytes: number;
    };
}
export interface TimeRange {
    startTime: Date;
    endTime: Date;
}
export interface EvolutionStatistics {
    id: string;
    userId: string;
    timeRange: TimeRange;
    eventStats: {
        totalEvents: number;
        eventTypeDistribution: Record<ModelEvolutionEventType, number>;
        dailyAverage: number;
    };
    snapshotStats: {
        totalSnapshots: number;
        snapshotTypeDistribution: Record<SnapshotType, number>;
        modelSizeChange: {
            startSize: number;
            endSize: number;
            change: number;
            changePercentage: number;
        };
    };
    structureStats: {
        conceptCountChange: {
            startCount: number;
            endCount: number;
            change: number;
            changePercentage: number;
        };
        relationCountChange: {
            startCount: number;
            endCount: number;
            change: number;
            changePercentage: number;
        };
    };
}
export interface ConceptUpdate {
    conceptId: string;
    oldConcept: any;
    newConcept: any;
    changedFields: string[];
}
export interface RelationUpdate {
    relationId: string;
    oldRelation: any;
    newRelation: any;
    changedFields: string[];
}
export interface ConceptDiff {
    added: any[];
    updated: ConceptUpdate[];
    removed: string[];
}
export interface RelationDiff {
    added: any[];
    updated: RelationUpdate[];
    removed: string[];
}
export interface ModelVersionDiff {
    id: string;
    userId: string;
    fromVersion: string;
    toVersion: string;
    calculatedAt: Date;
    conceptDiff: ConceptDiff;
    relationDiff: RelationDiff;
    statistics: {
        totalChanges: number;
        conceptChanges: number;
        relationChanges: number;
        changePercentage: number;
    };
}
export interface VersionComparisonReport {
    id: string;
    userId: string;
    comparedVersions: {
        version1: string;
        version2: string;
    };
    generatedAt: Date;
    versionDiff: ModelVersionDiff;
    summary: {
        keyChanges: string[];
        changeImpact: string;
        recommendations: string[];
    };
}
export interface ModelSnapshot {
    id: string;
    userId: string;
    version: string;
    createdAt: Date;
    type: SnapshotType;
    data: {
        conceptCount: number;
        relationCount: number;
        sizeInBytes: number;
        compressedModelData: string;
        modelHash: string;
    };
    metadata: {
        description?: string;
        creationReason?: string;
        systemVersion: string;
    };
}
export interface ModelSnapshotDiff {
    id: string;
    snapshotId1: string;
    snapshotId2: string;
    calculatedAt: Date;
    conceptDiff: ConceptDiff;
    relationDiff: RelationDiff;
    statistics: {
        totalChanges: number;
        conceptChanges: number;
        relationChanges: number;
        changePercentage: number;
    };
}
export interface ModelEvolutionEvent {
    id: string;
    userId: string;
    type: ModelEvolutionEventType;
    version: string;
    timestamp: Date;
    data: {
        conceptIds?: string[];
        relationIds?: string[];
        fromVersion?: string;
        toVersion?: string;
        source?: string;
        confidenceScore?: number;
        relatedThoughtIds?: string[];
        description?: string;
    };
    metadata: {
        systemVersion: string;
        nodeId: string;
        isSystemEvent: boolean;
    };
}
export interface EvolutionHistoryServiceConfig {
    eventRetentionDays: number;
    snapshotRetentionDays: number;
    enableEventCompression: boolean;
    enableSnapshotCompression: boolean;
    enableEncryption: boolean;
    queryCacheExpirationSeconds: number;
    maxQueryResults: number;
    cleanupIntervalHours: number;
    autoSnapshotConditions: {
        versionChangeThreshold: number;
        timeIntervalHours: number;
    };
}
//# sourceMappingURL=evolution-history.types.d.ts.map