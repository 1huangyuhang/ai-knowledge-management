import { CognitiveInsight, CognitiveInsightType, InsightGenerationOptions } from '@/domain/ai/cognitive-feedback/cognitive-feedback';
export interface InsightGenerationService {
    generateInsights(userId: string, modelId: string, options?: InsightGenerationOptions): Promise<CognitiveInsight[]>;
    generateConceptInsights(userId: string, modelId: string, conceptIds: string[]): Promise<CognitiveInsight[]>;
    generateRelationInsights(userId: string, modelId: string, relationIds: string[]): Promise<CognitiveInsight[]>;
    generateStructureInsights(userId: string, modelId: string): Promise<CognitiveInsight[]>;
    generateEvolutionInsights(userId: string, modelId: string): Promise<CognitiveInsight[]>;
    getInsights(userId: string, modelId: string, options?: {
        insightTypes?: CognitiveInsightType[];
        importanceThreshold?: number;
        confidenceThreshold?: number;
        limit?: number;
        offset?: number;
    }): Promise<CognitiveInsight[]>;
    getInsightById(userId: string, insightId: string): Promise<CognitiveInsight | null>;
    updateInsight(userId: string, insightId: string, updateData: Partial<CognitiveInsight>): Promise<CognitiveInsight>;
    deleteInsight(userId: string, insightId: string): Promise<boolean>;
}
//# sourceMappingURL=insight-generation-service.d.ts.map