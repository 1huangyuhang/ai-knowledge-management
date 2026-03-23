import { UserCognitiveModel } from '../../../domain/entities/user-cognitive-model';
import { CognitiveModelUpdateProposal, ModelUpdateResult, BatchModelUpdateResult, UpdateProposalValidationResult, UpdateHistoryQueryOptions, HistoryRetentionPolicy, ModelUpdateRecord } from '../types/model-update.types';
export interface ModelUpdateStrategy {
    name: string;
    applyUpdate(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<UserCognitiveModel>;
    validateProposal(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<boolean>;
}
export interface ModelUpdateService {
    applyUpdate(updateProposal: CognitiveModelUpdateProposal): Promise<ModelUpdateResult>;
    batchApplyUpdates(updateProposals: CognitiveModelUpdateProposal[]): Promise<BatchModelUpdateResult>;
    validateUpdateProposal(updateProposal: CognitiveModelUpdateProposal): Promise<UpdateProposalValidationResult>;
    setUpdateStrategy(strategy: ModelUpdateStrategy): void;
    getUpdateStrategy(): ModelUpdateStrategy;
}
export interface UpdateHistoryService {
    recordUpdate(updateRecord: ModelUpdateRecord): Promise<boolean>;
    getUpdateHistory(userId: string, options?: UpdateHistoryQueryOptions): Promise<ModelUpdateRecord[]>;
    getModelByVersion(userId: string, versionId: string): Promise<UserCognitiveModel | null>;
    cleanupOldHistory(userId: string, retentionPolicy: HistoryRetentionPolicy): Promise<number>;
}
export interface ModelConsistencyValidator {
    validate(model: UserCognitiveModel): Promise<ModelConsistencyValidationResult>;
}
export interface ModelConsistencyValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    timestamp: Date;
}
//# sourceMappingURL=model-update-service.interface.d.ts.map