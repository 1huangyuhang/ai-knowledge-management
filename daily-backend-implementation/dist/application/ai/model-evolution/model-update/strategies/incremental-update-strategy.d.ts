import { ModelUpdateStrategy } from '../../interfaces/model-update.interface';
export declare class IncrementalUpdateStrategy implements ModelUpdateStrategy {
    name: string;
    applyUpdate(currentModel: any, updateProposal: any): Promise<any>;
    validateProposal(currentModel: any, updateProposal: any): Promise<boolean>;
}
//# sourceMappingURL=incremental-update-strategy.d.ts.map