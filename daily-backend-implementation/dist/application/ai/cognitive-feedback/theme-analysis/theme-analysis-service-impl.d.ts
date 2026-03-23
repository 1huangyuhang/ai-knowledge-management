import { ThemeAnalysisService } from './theme-analysis-service';
import { ThemeAnalysisResult, Theme, ThemeAnalysisOptions } from '@/domain/ai/cognitive-feedback/cognitive-feedback';
import { CognitiveConceptRepository } from '@/domain/repositories/cognitive-concept-repository';
import { CognitiveRelationRepository } from '@/domain/repositories/cognitive-relation-repository';
import { CognitiveModelRepository } from '@/domain/repositories/cognitive-model-repository';
import { DataAnalysisService } from '@/infrastructure/analysis/data-analysis-service';
export declare class ThemeAnalysisServiceImpl implements ThemeAnalysisService {
    private cognitiveConceptRepository;
    private cognitiveRelationRepository;
    private cognitiveModelRepository;
    private dataAnalysisService;
    constructor(cognitiveConceptRepository: CognitiveConceptRepository, cognitiveRelationRepository: CognitiveRelationRepository, cognitiveModelRepository: CognitiveModelRepository, dataAnalysisService: DataAnalysisService);
    analyzeThemes(userId: string, modelId: string, options?: ThemeAnalysisOptions): Promise<ThemeAnalysisResult>;
    getThemeById(userId: string, themeId: string): Promise<Theme | null>;
    getThemesByModelId(userId: string, modelId: string): Promise<Theme[]>;
    analyzeConceptThemes(userId: string, modelId: string, conceptId: string): Promise<Theme[]>;
    analyzeRelationThemes(userId: string, modelId: string, relationId: string): Promise<Theme[]>;
    private generateThemesFromConcepts;
    private calculateThemeDistribution;
    private determineDominantTheme;
    private generateAnalysisSummary;
    private generateRecommendations;
}
//# sourceMappingURL=theme-analysis-service-impl.d.ts.map