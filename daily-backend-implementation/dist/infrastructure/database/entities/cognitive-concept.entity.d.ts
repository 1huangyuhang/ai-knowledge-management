import { CognitiveModelEntity } from './cognitive-model.entity';
export declare class CognitiveConceptEntity {
    id: string;
    modelId: string;
    model: CognitiveModelEntity;
    semanticIdentity: string;
    abstractionLevel: number;
    confidenceScore: number;
    description: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    sourceThoughtIds: string;
}
//# sourceMappingURL=cognitive-concept.entity.d.ts.map