export interface ModelUpdateService {
    applyUpdate(updateProposal: CognitiveModelUpdateProposal): Promise<ModelUpdateResult>;
    batchApplyUpdates(updateProposals: CognitiveModelUpdateProposal[]): Promise<BatchModelUpdateResult>;
    validateUpdateProposal(updateProposal: CognitiveModelUpdateProposal): Promise<UpdateProposalValidationResult>;
    setUpdateStrategy(strategy: ModelUpdateStrategy): void;
    getUpdateStrategy(): ModelUpdateStrategy;
}
export interface ModelUpdateStrategy {
    name: string;
    applyUpdate(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<UserCognitiveModel>;
    validateProposal(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<boolean>;
}
export interface ModelConsistencyValidator {
    validate(model: UserCognitiveModel): Promise<ModelConsistencyValidationResult>;
}
export interface ModelConsistencyValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface CognitiveModelUpdateProposal {
    id: string;
    userId: string;
    currentVersion: string;
    updateType: ModelUpdateType;
    conceptsToAdd?: CognitiveConcept[];
    conceptsToUpdate?: {
        conceptId: string;
        updates: Partial<CognitiveConcept>;
    }[];
    conceptIdsToRemove?: string[];
    relationsToAdd?: CognitiveRelation[];
    relationsToUpdate?: {
        relationId: string;
        updates: Partial<CognitiveRelation>;
    }[];
    relationIdsToRemove?: string[];
    confidenceScore: number;
    source: UpdateSource;
    timestamp: Date;
    relatedThoughtIds?: string[];
}
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
export interface UpdateProposalValidationResult {
    isValid: boolean;
    errors: string[];
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
export interface UpdateHistoryQueryOptions {
    startTime?: Date;
    endTime?: Date;
    limit?: number;
    offset?: number;
    updateType?: ModelUpdateType;
    source?: UpdateSource;
}
export interface HistoryRetentionPolicy {
    retentionDays: number;
    keepImportantUpdates: boolean;
}
export interface UpdateHistoryService {
    recordUpdate(updateRecord: ModelUpdateRecord): Promise<boolean>;
    getUpdateHistory(userId: string, options?: UpdateHistoryQueryOptions): Promise<ModelUpdateRecord[]>;
    getModelByVersion(userId: string, versionId: string): Promise<UserCognitiveModel | null>;
    cleanupOldHistory(userId: string, retentionPolicy: HistoryRetentionPolicy): Promise<number>;
}
export declare enum ModelUpdateErrorType {
    MODEL_NOT_FOUND = "MODEL_NOT_FOUND",
    INVALID_UPDATE_PROPOSAL = "INVALID_UPDATE_PROPOSAL",
    VERSION_INCOMPATIBLE = "VERSION_INCOMPATIBLE",
    MODEL_INCONSISTENT = "MODEL_INCONSISTENT",
    DATABASE_ERROR = "DATABASE_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
import { CognitiveConcept, CognitiveRelation, UserCognitiveModel } from '../../../domain/entities/user-cognitive-model';
//# sourceMappingURL=model-update-service.d.ts.map