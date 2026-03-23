export interface InsightGenerationService {
    generateInsights(userId: string, modelId: string, options?: InsightGenerationOptions): Promise<CognitiveInsight[]>;
    generateInsightsFromConcepts(userId: string, modelId: string, conceptIds: string[], options?: InsightGenerationOptions): Promise<CognitiveInsight[]>;
    generateInsightsFromRelations(userId: string, modelId: string, relationIds: string[], options?: InsightGenerationOptions): Promise<CognitiveInsight[]>;
    generateInsightsFromEvolution(userId: string, modelId: string, evolutionData: any, options?: InsightGenerationOptions): Promise<CognitiveInsight[]>;
}
export interface InsightGenerationOptions {
    insightTypes?: CognitiveInsightType[];
    importanceThreshold?: number;
    confidenceThreshold?: number;
    maxInsights?: number;
    includeSuggestions?: boolean;
}
export declare enum CognitiveInsightType {
    CONCEPT_INSIGHT = "CONCEPT_INSIGHT",
    RELATION_INSIGHT = "RELATION_INSIGHT",
    STRUCTURE_INSIGHT = "STRUCTURE_INSIGHT",
    EVOLUTION_INSIGHT = "EVOLUTION_INSIGHT",
    THEME_INSIGHT = "THEME_INSIGHT",
    BLINDSPOT_INSIGHT = "BLINDSPOT_INSIGHT",
    GAP_INSIGHT = "GAP_INSIGHT"
}
export interface CognitiveInsight {
    id: string;
    type: CognitiveInsightType;
    title: string;
    description: string;
    importance: number;
    confidence: number;
    relatedConceptIds?: string[];
    relatedRelationIds?: string[];
    suggestions: string[];
    createdAt: Date;
}
//# sourceMappingURL=insight-generation-service.d.ts.map