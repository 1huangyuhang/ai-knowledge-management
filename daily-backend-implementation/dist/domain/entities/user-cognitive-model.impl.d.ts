import { CognitiveConcept, CognitiveInsight, CognitiveProposal, CognitiveRelation, CognitiveRelationType, EvolutionHistory, ThoughtFragment, UserCognitiveModel } from './user-cognitive-model';
export declare class UserCognitiveModelImpl implements UserCognitiveModel {
    id: string;
    userId: string;
    concepts: CognitiveConcept[];
    relations: CognitiveRelation[];
    evolutionHistory: EvolutionHistory[];
    createdAt: Date;
    updatedAt: Date;
    constructor(id: string, userId: string);
    addConcept(concept: CognitiveConcept): void;
    removeConcept(conceptId: string): void;
    updateConcept(concept: CognitiveConcept): void;
    addRelation(relation: CognitiveRelation): void;
    removeRelation(relationId: string): void;
    applyProposal(proposal: CognitiveProposal): void;
}
export declare class CognitiveConceptImpl implements CognitiveConcept {
    id: string;
    semanticIdentity: string;
    abstractionLevel: number;
    confidenceScore: number;
    description: string;
    metadata?: Record<string, any>;
    constructor(id: string, semanticIdentity: string, abstractionLevel: number, confidenceScore: number, description: string, metadata?: Record<string, any>);
}
export declare class CognitiveRelationImpl implements CognitiveRelation {
    id: string;
    sourceConceptId: string;
    targetConceptId: string;
    relationType: CognitiveRelationType;
    strength: number;
    confidence: number;
    description?: string;
    constructor(id: string, sourceConceptId: string, targetConceptId: string, relationType: CognitiveRelationType, strength: number, confidence: number, description?: string);
}
export declare class ThoughtFragmentImpl implements ThoughtFragment {
    id: string;
    content: string;
    metadata: Record<string, any>;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(id: string, content: string, metadata: Record<string, any>, userId: string, createdAt?: Date, updatedAt?: Date);
}
export declare class CognitiveProposalImpl implements CognitiveProposal {
    id: string;
    thoughtId: string;
    concepts: CognitiveConcept[];
    relations: CognitiveRelation[];
    confidence: number;
    reasoningTrace: string[];
    createdAt: Date;
    userId: string;
    constructor(id: string, thoughtId: string, concepts: CognitiveConcept[], relations: CognitiveRelation[], confidence: number, reasoningTrace: string[], userId: string, createdAt?: Date);
}
export declare class CognitiveInsightImpl implements CognitiveInsight {
    id: string;
    modelId: string;
    coreThemes: string[];
    blindSpots: string[];
    conceptGaps: string[];
    structureSummary: string;
    createdAt: Date;
    confidence: number;
    constructor(id: string, modelId: string, coreThemes: string[], blindSpots: string[], conceptGaps: string[], structureSummary: string, confidence: number, createdAt?: Date);
}
export declare class EvolutionHistoryImpl implements EvolutionHistory {
    id: string;
    changeType: string;
    changeContent: Record<string, any>;
    changedAt: Date;
    trigger: string;
    constructor(id: string, changeType: string, changeContent: Record<string, any>, changedAt: Date, trigger: string);
}
//# sourceMappingURL=user-cognitive-model.impl.d.ts.map