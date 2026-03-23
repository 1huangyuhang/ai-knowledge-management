export declare enum CognitiveRelationType {
    SUBCONCEPT = "subconcept",
    SUPERCONCEPT = "superconcept",
    ASSOCIATION = "association",
    CAUSALITY = "causality",
    CONTRAST = "contrast",
    EXAMPLE = "example",
    COMPOSITION = "composition",
    PROPERTY = "property"
}
export interface CognitiveRelation {
    readonly id: string;
    modelId: string;
    sourceConceptId: string;
    targetConceptId: string;
    type: CognitiveRelationType;
    confidenceScore: number;
    description: string;
    metadata: Record<string, any>;
    readonly createdAt: Date;
    updatedAt: Date;
    sourceThoughtIds: string[];
    update(updates: Partial<Omit<CognitiveRelation, 'id' | 'createdAt'>>): void;
    addSourceThought(thoughtId: string): void;
    removeSourceThought(thoughtId: string): void;
    updateConfidenceScore(score: number): void;
}
export declare class CognitiveRelationImpl implements CognitiveRelation {
    readonly id: string;
    modelId: string;
    sourceConceptId: string;
    targetConceptId: string;
    type: CognitiveRelationType;
    confidenceScore: number;
    description: string;
    metadata: Record<string, any>;
    readonly createdAt: Date;
    updatedAt: Date;
    sourceThoughtIds: string[];
    constructor(id: string, modelId: string, sourceConceptId: string, targetConceptId: string, type: CognitiveRelationType, confidenceScore: number, description: string, metadata?: Record<string, any>, sourceThoughtIds?: string[], createdAt?: Date);
    update(updates: Partial<Omit<CognitiveRelation, 'id' | 'createdAt'>>): void;
    addSourceThought(thoughtId: string): void;
    removeSourceThought(thoughtId: string): void;
    updateConfidenceScore(score: number): void;
}
//# sourceMappingURL=cognitive-relation.d.ts.map