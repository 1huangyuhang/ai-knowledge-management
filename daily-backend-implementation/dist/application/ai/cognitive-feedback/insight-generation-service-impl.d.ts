import { InsightGenerationService, CognitiveInsight, InsightGenerationOptions } from './insight-generation-service';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { EvolutionAnalysisService } from '../../ai/model-evolution/evolution-analysis/evolution-analysis-service';
import { CognitiveModel, CognitiveConcept, CognitiveRelation } from '../../../domain/entities/cognitive-model';
import { CacheService } from '../../../domain/services/cache-service';
export declare class InsightGenerationServiceImpl implements InsightGenerationService {
    private readonly cognitiveModelRepository;
    private readonly evolutionAnalysisService;
    private readonly cacheService;
    constructor(cognitiveModelRepository: CognitiveModelRepository, evolutionAnalysisService: EvolutionAnalysisService, cacheService: CacheService);
    generateInsights(userId: string, modelId: string, options?: InsightGenerationOptions): Promise<CognitiveInsight[]>;
    generateInsights(model: CognitiveModel, concepts: CognitiveConcept[], relations: CognitiveRelation[]): Promise<CognitiveInsight[]>;
    generateInsightsFromConcepts(userId: string, modelId: string, conceptIds: string[], options?: InsightGenerationOptions): Promise<CognitiveInsight[]>;
    generateInsightsFromRelations(userId: string, modelId: string, relationIds: string[], options?: InsightGenerationOptions): Promise<CognitiveInsight[]>;
    generateInsightsFromEvolution(userId: string, modelId: string, evolutionData: any, options?: InsightGenerationOptions): Promise<CognitiveInsight[]>;
    private generateConceptInsights;
    private generateRelationInsights;
    private generateStructureInsights;
    private generateEvolutionInsights;
    private filterAndSortInsights;
}
//# sourceMappingURL=insight-generation-service-impl.d.ts.map