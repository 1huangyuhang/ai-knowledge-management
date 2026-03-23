import { CognitiveModelEntity } from './cognitive-model.entity';
import { CognitiveConceptEntity } from './cognitive-concept.entity';
export declare class CognitiveRelationEntity {
    id: string;
    modelId: string;
    model: CognitiveModelEntity;
    sourceConceptId: string;
    sourceConcept: CognitiveConceptEntity;
    targetConceptId: string;
    targetConcept: CognitiveConceptEntity;
    type: string;
    confidenceScore: number;
    description: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    sourceThoughtIds: string;
}
//# sourceMappingURL=cognitive-relation.entity.d.ts.map