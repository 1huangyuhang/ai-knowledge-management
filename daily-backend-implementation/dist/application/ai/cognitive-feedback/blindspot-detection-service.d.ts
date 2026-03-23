import { BlindspotDetectionResult, BlindspotDetectionOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
export interface BlindspotDetectionService {
    detectBlindspots(userId: string, modelId: string, options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;
    detectBlindspotsFromThemes(userId: string, modelId: string, themeIds: string[], options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;
    detectBlindspotsFromConcepts(userId: string, modelId: string, conceptIds: string[], options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;
    detectBlindspotsByType(userId: string, modelId: string, blindspotTypes: string[], options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;
    analyzeBlindspotImpact(userId: string, modelId: string, blindspotId: string): Promise<{
        impact: number;
        potentialRisks: string[];
    }>;
}
//# sourceMappingURL=blindspot-detection-service.d.ts.map