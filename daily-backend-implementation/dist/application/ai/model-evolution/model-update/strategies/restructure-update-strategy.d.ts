import { ModelUpdateStrategy } from '../../interfaces/model-update.interface';
export declare class RestructureUpdateStrategy implements ModelUpdateStrategy {
    name: string;
    applyUpdate(currentModel: any, updateProposal: any): Promise<any>;
    private updateConceptHierarchy;
    private updateRelationTypes;
    private mergeConcepts;
    private splitConcepts;
    private restructureRelations;
    validateProposal(currentModel: any, updateProposal: any): Promise<boolean>;
}
//# sourceMappingURL=restructure-update-strategy.d.ts.map