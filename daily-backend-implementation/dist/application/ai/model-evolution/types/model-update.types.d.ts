export declare enum ModelUpdateType {
    INCREMENTAL = "INCREMENTAL",
    FULL = "FULL",
    RESTRUCTURE = "RESTRUCTURE"
}
export declare enum UpdateSource {
    AI_GENERATED = "AI_GENERATED",
    USER_MANUAL = "USER_MANUAL",
    SYSTEM_AUTOMATIC = "SYSTEM_AUTOMATIC"
}
export declare enum ModelUpdateErrorType {
    MODEL_NOT_FOUND = "MODEL_NOT_FOUND",
    INVALID_UPDATE_PROPOSAL = "INVALID_UPDATE_PROPOSAL",
    VERSION_INCOMPATIBLE = "VERSION_INCOMPATIBLE",
    MODEL_INCONSISTENT = "MODEL_INCONSISTENT",
    DATABASE_ERROR = "DATABASE_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
export interface CognitiveModelUpdateProposal {
    id: string;
    userId: string;
    currentVersion: string;
    updateType: ModelUpdateType;
    conceptsToAdd?: any[];
    conceptsToUpdate?: {
        conceptId: string;
        updates: Partial<any>;
    }[];
    conceptIdsToRemove?: string[];
    relationsToAdd?: any[];
    relationsToUpdate?: {
        relationId: string;
        updates: Partial<any>;
    }[];
    relationIdsToRemove?: string[];
    confidenceScore: number;
    source: UpdateSource;
    timestamp: Date;
    relatedThoughtIds?: string[];
}
export interface ModelUpdateResult {
    success: boolean;
    newVersion: string;
    oldVersion: string;
    updateDetails: {
        conceptsAdded: number;
        conceptsUpdated: number;
        conceptsRemoved: number;
        relationsAdded: number;
        relationsUpdated: number;
        relationsRemoved: number;
    };
    timestamp: Date;
    error?: string;
}
export interface BatchModelUpdateResult {
    totalUpdates: number;
    successfulUpdates: number;
    failedUpdates: number;
    results: ModelUpdateResult[];
    timestamp: Date;
}
export interface ModelUpdateRecord {
    id: string;
    userId: string;
    fromVersion: string;
    toVersion: string;
    updateType: ModelUpdateType;
    source: UpdateSource;
    updateDetails: {
        conceptsAdded: number;
        conceptsUpdated: number;
        conceptsRemoved: number;
        relationsAdded: number;
        relationsUpdated: number;
        relationsRemoved: number;
    };
    confidenceScore: number;
    timestamp: Date;
    relatedThoughtIds?: string[];
}
export interface UpdateProposalValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    timestamp: Date;
}
export interface UpdateHistoryQueryOptions {
    page?: number;
    limit?: number;
    startTime?: Date;
    endTime?: Date;
    updateType?: ModelUpdateType;
    source?: UpdateSource;
}
export interface HistoryRetentionPolicy {
    retentionDays: number;
    keepLatestVersion: boolean;
    keepImportantUpdates: boolean;
}
export interface ModelUpdateServiceConfig {
    defaultUpdateStrategy: ModelUpdateType;
    confidenceThreshold: number;
    batchUpdateLimit: number;
    historyRetentionDays: number;
    enableConcurrencyControl: boolean;
    cacheExpirationSeconds: number;
}
//# sourceMappingURL=model-update.types.d.ts.map