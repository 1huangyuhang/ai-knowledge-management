import { CognitiveInsight, CognitiveProposal, CognitiveRelation, UserCognitiveModel } from '../entities/user-cognitive-model';
export interface CognitiveModelService {
    validateProposal(proposal: CognitiveProposal): boolean;
    maintainConsistency(model: UserCognitiveModel): void;
    generateInsight(model: UserCognitiveModel): CognitiveInsight;
    detectConflicts(relations: CognitiveRelation[]): CognitiveRelation[];
    validateConceptHierarchy(model: UserCognitiveModel): boolean;
    updateConceptConfidence(model: UserCognitiveModel): void;
}
export declare class CognitiveModelServiceImpl implements CognitiveModelService {
    validateProposal(proposal: CognitiveProposal): boolean;
    maintainConsistency(model: UserCognitiveModel): void;
    generateInsight(model: UserCognitiveModel): CognitiveInsight;
    detectConflicts(relations: CognitiveRelation[]): CognitiveRelation[];
    validateConceptHierarchy(model: UserCognitiveModel): boolean;
    updateConceptConfidence(model: UserCognitiveModel): void;
}
//# sourceMappingURL=cognitive-model.service.d.ts.map