export interface CognitiveConcept {
    readonly id: string;
    modelId: string;
    semanticIdentity: string;
    abstractionLevel: number;
    confidenceScore: number;
    description: string;
    metadata: Record<string, any>;
    readonly createdAt: Date;
    updatedAt: Date;
    sourceThoughtIds: string[];
    update(updates: Partial<Omit<CognitiveConcept, 'id' | 'createdAt'>>): void;
    addSourceThought(thoughtId: string): void;
    removeSourceThought(thoughtId: string): void;
    updateConfidenceScore(score: number): void;
}
export declare class CognitiveConceptImpl implements CognitiveConcept {
    readonly id: string;
    modelId: string;
    semanticIdentity: string;
    abstractionLevel: number;
    confidenceScore: number;
    description: string;
    metadata: Record<string, any>;
    readonly createdAt: Date;
    updatedAt: Date;
    sourceThoughtIds: string[];
    constructor(id: string, modelId: string, semanticIdentity: string, abstractionLevel: number, confidenceScore: number, description: string, metadata?: Record<string, any>, sourceThoughtIds?: string[], createdAt?: Date);
    update(updates: Partial<Omit<CognitiveConcept, 'id' | 'createdAt'>>): void;
    addSourceThought(thoughtId: string): void;
    removeSourceThought(thoughtId: string): void;
    updateConfidenceScore(score: number): void;
}
//# sourceMappingURL=cognitive-concept.d.ts.map