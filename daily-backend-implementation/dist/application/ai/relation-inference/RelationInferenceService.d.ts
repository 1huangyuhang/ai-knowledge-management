import { CognitiveConcept } from '../../../domain/entities';
import { CognitiveRelation, CognitiveRelationType } from '../../../domain/entities';
import { LLMClient } from '../../services/llm/LLMClient';
import { SimilaritySearchService } from '../../services/llm/embedding/SimilaritySearchService';
export interface RelationInferenceRequest {
    sourceConcept: CognitiveConcept;
    targetConcept: CognitiveConcept;
    context?: string;
}
export interface RelationInferenceResult {
    relationType: CognitiveRelationType;
    confidenceScore: number;
    description: string;
}
export interface RelationInferenceService {
    inferRelation(request: RelationInferenceRequest): Promise<RelationInferenceResult>;
    batchInferRelations(requests: RelationInferenceRequest[]): Promise<RelationInferenceResult[]>;
    inferConceptRelations(concept: CognitiveConcept, existingConcepts: CognitiveConcept[], context?: string): Promise<CognitiveRelation[]>;
}
export declare class LLMBasedRelationInferenceService implements RelationInferenceService {
    private readonly llmClient;
    private readonly similaritySearchService;
    constructor(llmClient: LLMClient, similaritySearchService: SimilaritySearchService);
    inferRelation(request: RelationInferenceRequest): Promise<RelationInferenceResult>;
    batchInferRelations(requests: RelationInferenceRequest[]): Promise<RelationInferenceResult[]>;
    inferConceptRelations(concept: CognitiveConcept, existingConcepts: CognitiveConcept[], context?: string): Promise<CognitiveRelation[]>;
    private generateRelationInferencePrompt;
}
//# sourceMappingURL=RelationInferenceService.d.ts.map