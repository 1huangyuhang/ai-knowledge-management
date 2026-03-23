import { InsightGenerationService } from './insight-generation-service';
import { CognitiveInsight, CognitiveInsightType, InsightGenerationOptions } from '@/domain/ai/cognitive-feedback/cognitive-feedback';
import { CognitiveModelRepository } from '@/domain/repositories/cognitive-model-repository';
import { CognitiveConceptRepository } from '@/domain/repositories/cognitive-concept-repository';
import { CognitiveRelationRepository } from '@/domain/repositories/cognitive-relation-repository';
import { EvolutionAnalysisService } from '../../model-evolution/evolution-analysis/evolution-analysis-service';
import { DataAnalysisService } from '@/infrastructure/analysis/data-analysis-service';
export declare class InsightGenerationServiceImpl implements InsightGenerationService {
    private cognitiveModelRepository;
    private cognitiveConceptRepository;
    private cognitiveRelationRepository;
    private evolutionAnalysisService;
    private dataAnalysisService;
    constructor(cognitiveModelRepository: CognitiveModelRepository, cognitiveConceptRepository: CognitiveConceptRepository, cognitiveRelationRepository: CognitiveRelationRepository, evolutionAnalysisService: EvolutionAnalysisService, dataAnalysisService: DataAnalysisService);
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
    private calculateModelDensity;
}
//# sourceMappingURL=insight-generation-service-impl.d.ts.map