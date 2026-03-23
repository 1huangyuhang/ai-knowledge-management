import { ModelUpdateService, ModelUpdateStrategy } from '../interfaces/model-update.interface';
import { ModelUpdateResult, BatchModelUpdateResult, UpdateProposalValidationResult } from '../types/model-update.types';
export declare class ModelUpdateServiceImpl implements ModelUpdateService {
    private updateStrategy;
    private cognitiveModelRepository;
    private updateHistoryService;
    private consistencyValidator;
    constructor(cognitiveModelRepository: any, updateHistoryService: any);
    applyUpdate(updateProposal: any): Promise<ModelUpdateResult>;
    batchApplyUpdates(updateProposals: any[]): Promise<BatchModelUpdateResult>;
    validateUpdateProposal(updateProposal: any): Promise<UpdateProposalValidationResult>;
    setUpdateStrategy(strategy: ModelUpdateStrategy): void;
    getUpdateStrategy(): ModelUpdateStrategy;
    private generateNewVersion;
}
//# sourceMappingURL=model-update-service-impl.d.ts.map