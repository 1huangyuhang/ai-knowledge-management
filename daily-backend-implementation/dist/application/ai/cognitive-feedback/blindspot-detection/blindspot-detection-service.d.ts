import { BlindspotDetectionResult, Blindspot, BlindspotDetectionOptions } from '@/domain/ai/cognitive-feedback/cognitive-feedback';
export interface BlindspotDetectionService {
    detectBlindspots(userId: string, modelId: string, options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;
    getBlindspotById(userId: string, blindspotId: string): Promise<Blindspot | null>;
    getBlindspotsByModelId(userId: string, modelId: string, options?: {
        blindspotTypes?: string[];
        impactThreshold?: number;
        limit?: number;
        offset?: number;
    }): Promise<Blindspot[]>;
    updateBlindspot(userId: string, blindspotId: string, updateData: Partial<Blindspot>): Promise<Blindspot>;
    deleteBlindspot(userId: string, blindspotId: string): Promise<boolean>;
}
//# sourceMappingURL=blindspot-detection-service.d.ts.map