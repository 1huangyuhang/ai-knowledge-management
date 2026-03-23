export interface UserCognitiveModel {
    id: string;
    userId: string;
    concepts: CognitiveConcept[];
    relations: CognitiveRelation[];
    evolutionHistory: EvolutionHistory[];
    createdAt: Date;
    updatedAt: Date;
    addConcept(concept: CognitiveConcept): void;
    removeConcept(conceptId: string): void;
    updateConcept(concept: CognitiveConcept): void;
    addRelation(relation: CognitiveRelation): void;
    removeRelation(relationId: string): void;
    applyProposal(proposal: CognitiveProposal): void;
}
export interface CognitiveConcept {
    id: string;
    semanticIdentity: string;
    abstractionLevel: number;
    confidenceScore: number;
    description: string;
    metadata?: Record<string, any>;
}
export interface CognitiveRelation {
    id: string;
    sourceConceptId: string;
    targetConceptId: string;
    relationType: CognitiveRelationType;
    strength: number;
    confidence: number;
    description?: string;
}
export declare enum CognitiveRelationType {
    PARENT_CHILD = "PARENT_CHILD",
    ASSOCIATION = "ASSOCIATION",
    CAUSAL = "CAUSAL",
    CONTRAST = "CONTRAST",
    DEPENDENCY = "DEPENDENCY"
}
export interface EvolutionHistory {
    id: string;
    changeType: string;
    changeContent: Record<string, any>;
    changedAt: Date;
    trigger: string;
}
export interface CognitiveProposal {
    id: string;
    thoughtId: string;
    concepts: CognitiveConcept[];
    relations: CognitiveRelation[];
    confidence: number;
    reasoningTrace: string[];
    createdAt: Date;
    userId: string;
}
export interface CognitiveInsight {
    id: string;
    modelId: string;
    coreThemes: string[];
    blindSpots: string[];
    conceptGaps: string[];
    structureSummary: string;
    createdAt: Date;
    confidence: number;
}
export interface ThoughtFragment {
    id: string;
    content: string;
    metadata: Record<string, any>;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=user-cognitive-model.d.ts.map