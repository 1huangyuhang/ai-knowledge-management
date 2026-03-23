import { CognitiveProposal, CognitiveInsight, UserCognitiveModel } from '../entities/user-cognitive-model';
import { CognitiveModelService } from './cognitive-model.service';
export declare class CognitiveModelServiceImpl implements CognitiveModelService {
    validateProposal(proposal: CognitiveProposal): boolean;
    maintainConsistency(model: UserCognitiveModel): void;
    generateInsight(model: UserCognitiveModel): CognitiveInsight;
    detectConflicts(model: UserCognitiveModel): string[];
    validateConceptHierarchy(model: UserCognitiveModel): void;
    updateConceptConfidence(model: UserCognitiveModel): void;
    private extractCoreThemes;
    private detectBlindSpots;
    private identifyConceptGaps;
    private generateStructureSummary;
}
//# sourceMappingURL=cognitive-model.service.impl.d.ts.map