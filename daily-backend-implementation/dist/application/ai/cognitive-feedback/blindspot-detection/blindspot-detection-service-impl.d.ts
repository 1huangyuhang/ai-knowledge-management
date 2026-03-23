import { BlindspotDetectionService } from './blindspot-detection-service';
import { BlindspotDetectionResult, Blindspot, BlindspotDetectionOptions } from '@/domain/ai/cognitive-feedback/cognitive-feedback';
import { CognitiveModelRepository } from '@/domain/repositories/cognitive-model-repository';
import { CognitiveConceptRepository } from '@/domain/repositories/cognitive-concept-repository';
import { CognitiveRelationRepository } from '@/domain/repositories/cognitive-relation-repository';
import { EvolutionAnalysisService } from '../../model-evolution/evolution-analysis/evolution-analysis-service';
import { DataAnalysisService } from '@/infrastructure/analysis/data-analysis-service';
export declare class BlindspotDetectionServiceImpl implements BlindspotDetectionService {
    private cognitiveModelRepository;
    private cognitiveConceptRepository;
    private cognitiveRelationRepository;
    private evolutionAnalysisService;
    private dataAnalysisService;
    constructor(cognitiveModelRepository: CognitiveModelRepository, cognitiveConceptRepository: CognitiveConceptRepository, cognitiveRelationRepository: CognitiveRelationRepository, evolutionAnalysisService: EvolutionAnalysisService, dataAnalysisService: DataAnalysisService);
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
    private detectIsolatedConcepts;
    private detectLowDensityAreas;
    private detectModelGaps;
    private detectThemeCoverageGaps;
    private calculateModelDensity;
    private calculateBlindspotDistribution;
    private generateAnalysisSummary;
    private generateRecommendations;
}
//# sourceMappingURL=blindspot-detection-service-impl.d.ts.map