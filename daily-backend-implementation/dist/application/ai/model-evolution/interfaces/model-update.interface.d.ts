export interface ModelUpdateService {
    applyUpdate(updateProposal: any): Promise<any>;
    batchApplyUpdates(updateProposals: any[]): Promise<any>;
    validateUpdateProposal(updateProposal: any): Promise<any>;
    setUpdateStrategy(strategy: ModelUpdateStrategy): void;
    getUpdateStrategy(): ModelUpdateStrategy;
}
export interface ModelUpdateStrategy {
    name: string;
    applyUpdate(currentModel: any, updateProposal: any): Promise<any>;
    validateProposal(currentModel: any, updateProposal: any): Promise<boolean>;
}
export interface UpdateHistoryService {
    recordUpdate(updateRecord: any): Promise<boolean>;
    getUpdateHistory(userId: string, options?: any): Promise<any[]>;
    getModelByVersion(userId: string, versionId: string): Promise<any | null>;
    cleanupOldHistory(userId: string, retentionPolicy: any): Promise<number>;
}
export interface ModelConsistencyValidator {
    validate(model: any): Promise<ModelConsistencyValidationResult>;
}
export interface ModelConsistencyValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    timestamp: Date;
}
export interface ModelUpdateFactory {
    createModelUpdateService(): ModelUpdateService;
    createUpdateStrategy(type: string): ModelUpdateStrategy;
    createUpdateHistoryService(): UpdateHistoryService;
    createModelConsistencyValidator(): ModelConsistencyValidator;
}
//# sourceMappingURL=model-update.interface.d.ts.map