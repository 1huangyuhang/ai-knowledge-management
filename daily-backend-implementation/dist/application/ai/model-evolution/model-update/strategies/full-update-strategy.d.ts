import { ModelUpdateStrategy } from '../../interfaces/model-update.interface';
export declare class FullUpdateStrategy implements ModelUpdateStrategy {
    name: string;
    applyUpdate(currentModel: any, updateProposal: any): Promise<any>;
    validateProposal(currentModel: any, updateProposal: any): Promise<boolean>;
}
//# sourceMappingURL=full-update-strategy.d.ts.map