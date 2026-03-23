import { GapIdentificationResult, GapIdentificationOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
export interface GapIdentificationService {
    identifyGaps(userId: string, modelId: string, options?: GapIdentificationOptions): Promise<GapIdentificationResult>;
    identifyGapsBetweenConcepts(userId: string, modelId: string, conceptIds: string[], options?: GapIdentificationOptions): Promise<GapIdentificationResult>;
    identifyGapsByType(userId: string, modelId: string, gapTypes: string[], options?: GapIdentificationOptions): Promise<GapIdentificationResult>;
    identifyGapsFromReferenceModel(userId: string, modelId: string, referenceModelId: string, options?: GapIdentificationOptions): Promise<GapIdentificationResult>;
    analyzeGapImpact(userId: string, modelId: string, gapId: string): Promise<{
        size: number;
        improvementDirection: string;
    }>;
}
//# sourceMappingURL=gap-identification-service.d.ts.map