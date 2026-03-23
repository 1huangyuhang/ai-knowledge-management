import { GapIdentificationService } from './gap-identification-service';
import { GapIdentificationResult, GapIdentificationOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { CognitiveModelRepository } from '../../repositories/cognitive-model.repository';
export declare class GapIdentificationServiceImpl implements GapIdentificationService {
    private readonly cognitiveModelRepository;
    constructor(cognitiveModelRepository: CognitiveModelRepository);
    identifyGaps(userId: string, modelId: string, options?: GapIdentificationOptions): Promise<GapIdentificationResult>;
    identifyGapsBetweenConcepts(userId: string, modelId: string, conceptIds: string[], options?: GapIdentificationOptions): Promise<GapIdentificationResult>;
    identifyGapsByType(userId: string, modelId: string, gapTypes: string[], options?: GapIdentificationOptions): Promise<GapIdentificationResult>;
    identifyGapsFromReferenceModel(userId: string, modelId: string, referenceModelId: string, options?: GapIdentificationOptions): Promise<GapIdentificationResult>;
    analyzeGapImpact(userId: string, modelId: string, gapId: string): Promise<{
        size: number;
        improvementDirection: string;
    }>;
    private detectConceptCoverageGaps;
    private detectRelationGaps;
    private detectHierarchyGaps;
    private detectEvolutionGaps;
    private detectConceptCoverageGapWithReference;
    private filterGaps;
    private calculateGapDistribution;
    private generateIdentificationSummary;
    private generateRecommendations;
}
//# sourceMappingURL=gap-identification-service-impl.d.ts.map