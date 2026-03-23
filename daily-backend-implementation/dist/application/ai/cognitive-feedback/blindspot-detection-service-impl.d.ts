import { BlindspotDetectionService } from './blindspot-detection-service';
import { BlindspotDetectionResult, BlindspotDetectionOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { CognitiveModelRepository } from '../../repositories/cognitive-model.repository';
export declare class BlindspotDetectionServiceImpl implements BlindspotDetectionService {
    private readonly cognitiveModelRepository;
    constructor(cognitiveModelRepository: CognitiveModelRepository);
    detectBlindspots(userId: string, modelId: string, options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;
    detectBlindspotsFromThemes(userId: string, modelId: string, themeIds: string[], options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;
    detectBlindspotsFromConcepts(userId: string, modelId: string, conceptIds: string[], options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;
    detectBlindspotsByType(userId: string, modelId: string, blindspotTypes: string[], options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;
    analyzeBlindspotImpact(userId: string, modelId: string, blindspotId: string): Promise<{
        impact: number;
        potentialRisks: string[];
    }>;
    private detectConceptConnectionBlindspots;
    private detectThemeCoverageBlindspots;
    private detectHierarchyBlindspots;
    private filterBlindspots;
    private calculateBlindspotDistribution;
    private generateDetectionSummary;
    private generateRecommendations;
}
//# sourceMappingURL=blindspot-detection-service-impl.d.ts.map