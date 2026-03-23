export declare class IncrementalUpdateStrategy implements ModelUpdateStrategy {
    name: string;
    applyUpdate(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<UserCognitiveModel>;
    validateProposal(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<boolean>;
}
export declare class FullUpdateStrategy implements ModelUpdateStrategy {
    name: string;
    applyUpdate(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<UserCognitiveModel>;
    validateProposal(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<boolean>;
}
export declare class RestructureUpdateStrategy implements ModelUpdateStrategy {
    name: string;
    applyUpdate(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<UserCognitiveModel>;
    validateProposal(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<boolean>;
}
export declare class UpdateStrategyFactory {
    static createStrategy(updateType: ModelUpdateType): ModelUpdateStrategy;
}
//# sourceMappingURL=model-update.strategies.d.ts.map