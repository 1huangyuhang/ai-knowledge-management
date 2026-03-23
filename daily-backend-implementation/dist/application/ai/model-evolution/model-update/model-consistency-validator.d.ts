import { ModelConsistencyValidator, ModelConsistencyValidationResult } from '../interfaces/model-update.interface';
export declare class ModelConsistencyValidatorImpl implements ModelConsistencyValidator {
    validate(model: any): Promise<ModelConsistencyValidationResult>;
    private validateBasicStructure;
    private validateConcepts;
    private validateRelations;
    private validateConceptHierarchy;
    private detectCircularDependencies;
    private detectDeepHierarchy;
    private validateRelationWeights;
}
//# sourceMappingURL=model-consistency-validator.d.ts.map