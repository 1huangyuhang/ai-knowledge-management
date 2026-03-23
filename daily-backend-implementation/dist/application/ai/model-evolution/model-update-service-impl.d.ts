import { ModelUpdateService, ModelUpdateStrategy, UpdateHistoryService, ModelConsistencyValidator } from './interfaces/model-update-service.interface';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { CognitiveModelUpdateProposal, ModelUpdateResult, BatchModelUpdateResult, UpdateProposalValidationResult } from './types/model-update.types';
export declare class ModelUpdateServiceImpl implements ModelUpdateService {
    private updateStrategy;
    private cognitiveModelRepository;
    private updateHistoryService;
    private consistencyValidator;
    constructor(cognitiveModelRepository: CognitiveModelRepository, updateHistoryService: UpdateHistoryService, consistencyValidator: ModelConsistencyValidator);
    applyUpdate(updateProposal: CognitiveModelUpdateProposal): Promise<ModelUpdateResult>;
    batchApplyUpdates(updateProposals: CognitiveModelUpdateProposal[]): Promise<BatchModelUpdateResult>;
    validateUpdateProposal(updateProposal: CognitiveModelUpdateProposal): Promise<UpdateProposalValidationResult>;
    setUpdateStrategy(strategy: ModelUpdateStrategy): void;
    getUpdateStrategy(): ModelUpdateStrategy;
    private generateNewVersion;
}
//# sourceMappingURL=model-update-service-impl.d.ts.map