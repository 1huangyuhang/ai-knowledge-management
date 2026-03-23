import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
import { ThoughtFragment } from '../../domain/entities/thought-fragment';
export interface CognitiveModelUpdateOptions {
    updateConcepts?: boolean;
    updateRelations?: boolean;
    updateConfidence?: boolean;
    recalculateStructure?: boolean;
}
export interface CognitiveModelUpdateResult {
    model: UserCognitiveModel;
    changes: {
        addedConcepts: number;
        updatedConcepts: number;
        addedRelations: number;
        updatedRelations: number;
        confidenceChanges: number;
    };
    metadata: {
        processingTime: number;
        conceptCount: number;
        relationCount: number;
        averageConfidence: number;
    };
}
export declare class CognitiveModelUpdateService {
    updateCognitiveModel(model: UserCognitiveModel, thoughtFragment: ThoughtFragment, options?: CognitiveModelUpdateOptions): CognitiveModelUpdateResult;
    private updateConcepts;
    private updateRelations;
    private updateConfidence;
    private recalculateStructure;
}
//# sourceMappingURL=CognitiveModelUpdateService.d.ts.map