import { CognitiveConcept } from '../../domain/entities/cognitive-concept';
import { CognitiveRelation } from '../../domain/entities/cognitive-relation';
import { CacheService } from '../../domain/services/cache-service';
export interface ConceptRelationProcessorOptions {
    relationType?: string;
    minimumConfidence?: number;
    minimumStrength?: number;
}
export interface ConceptRelationProcessorResult {
    concepts: CognitiveConcept[];
    relations: CognitiveRelation[];
    metadata: {
        processedConcepts: number;
        processedRelations: number;
        filteredConcepts: number;
        filteredRelations: number;
    };
}
export declare class ConceptRelationProcessor {
    private readonly cacheService?;
    private readonly defaultOptions;
    constructor(cacheService?: CacheService | undefined);
    processConceptRelations(concepts: CognitiveConcept[], relations: CognitiveRelation[], options?: ConceptRelationProcessorOptions): Promise<ConceptRelationProcessorResult>;
    calculateConceptSimilarity(concept1: CognitiveConcept, concept2: CognitiveConcept): Promise<number>;
    private generateNGrams;
    mergeSimilarConcepts(concepts: CognitiveConcept[], similarityThreshold?: number): Promise<CognitiveConcept[]>;
}
//# sourceMappingURL=ConceptRelationProcessor.d.ts.map