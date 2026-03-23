import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
export interface ModelSummaryOptions {
    includeTopConcepts?: number;
    includeTopRelations?: number;
    includeConfidenceStats?: boolean;
    includeStructureStats?: boolean;
    includeGrowthStats?: boolean;
    summaryLength?: 'short' | 'medium' | 'long';
}
export interface ModelSummaryStats {
    conceptCount: number;
    relationCount: number;
    averageConceptConfidence: number;
    averageRelationConfidence: number;
    averageRelationStrength: number;
    topConcepts: Array<{
        name: string;
        confidence: number;
        occurrenceCount: number;
        centrality?: number;
    }>;
    topRelations: Array<{
        source: string;
        target: string;
        type: string;
        confidence: number;
        strength: number;
        occurrenceCount: number;
    }>;
    structureDensity: number;
    growthRate?: number;
}
export interface ModelSummary {
    id: string;
    modelId: string;
    title: string;
    summary: string;
    stats: ModelSummaryStats;
    generatedAt: string;
    metadata: {
        generationTime: number;
        options: ModelSummaryOptions;
    };
}
export declare class ModelSummaryGenerator {
    private readonly defaultOptions;
    generateModelSummary(model: UserCognitiveModel, options?: ModelSummaryOptions): ModelSummary;
    private calculateStats;
    private generateSummaryText;
}
//# sourceMappingURL=ModelSummaryGenerator.d.ts.map