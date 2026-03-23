import { CognitiveConcept } from '../../../domain/entities';
import { CognitiveRelation } from '../../../domain/entities';
import { SimilaritySearchService } from '../../services/llm/embedding/SimilaritySearchService';
import { LLMClient } from '../../services/llm/LLMClient';
export interface ConfidenceScoringRequest {
    entity: CognitiveConcept | CognitiveRelation;
    context?: string;
    relatedEntities?: (CognitiveConcept | CognitiveRelation)[];
}
export interface ConfidenceScoringResult {
    originalScore: number;
    adjustedScore: number;
    adjustmentReason: string;
    metrics: {
        semanticConsistency: number;
        structuralConsistency: number;
        sourceReliability: number;
        contextRelevance: number;
    };
}
export interface ConfidenceScoringService {
    scoreConfidence(request: ConfidenceScoringRequest): Promise<ConfidenceScoringResult>;
    batchScoreConfidence(requests: ConfidenceScoringRequest[]): Promise<ConfidenceScoringResult[]>;
    isConfidenceThresholdMet(score: number, threshold?: number): boolean;
}
export declare class MultiFactorConfidenceScoringService implements ConfidenceScoringService {
    private readonly similarityService;
    private readonly llmClient;
    constructor(similarityService: SimilaritySearchService, llmClient: LLMClient);
    scoreConfidence(request: ConfidenceScoringRequest): Promise<ConfidenceScoringResult>;
    batchScoreConfidence(requests: ConfidenceScoringRequest[]): Promise<ConfidenceScoringResult[]>;
    isConfidenceThresholdMet(score: number, threshold?: number): boolean;
    private calculateMetrics;
    private adjustScore;
}
//# sourceMappingURL=ConfidenceScoringService.d.ts.map