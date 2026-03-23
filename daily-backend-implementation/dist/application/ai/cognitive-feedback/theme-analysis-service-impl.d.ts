import { ThemeAnalysisService, Theme, ThemeAnalysisResult, ThemeAnalysisOptions } from './theme-analysis-service';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { CognitiveConcept, CognitiveRelation } from '../../../domain/entities/cognitive-model';
export declare class ThemeAnalysisServiceImpl implements ThemeAnalysisService {
    private readonly cognitiveModelRepository;
    constructor(cognitiveModelRepository: CognitiveModelRepository);
    analyzeThemes(userId: string, modelId: string, options?: ThemeAnalysisOptions): Promise<ThemeAnalysisResult>;
    analyzeThemes(concepts: CognitiveConcept[], relations: CognitiveRelation[], options?: ThemeAnalysisOptions): Promise<ThemeAnalysisResult>;
    generateThemesFromConcepts(concepts: any[], options?: ThemeAnalysisOptions): Theme[];
    generateThemesFromRelations(relations: any[], concepts: any[], options?: ThemeAnalysisOptions): Theme[];
    getThemeDistribution(themes: Theme[]): Record<string, number>;
    identifyDominantTheme(themes: Theme[]): Theme | null;
    private mergeSimilarThemes;
    private areThemesSimilar;
    private mergeThemes;
    private filterThemes;
    private extractKeywords;
    private generateThemeName;
    private generateThemeDescription;
    private generateRelationThemeName;
    private generateRelationThemeDescription;
    private generateMergedThemeDescription;
    private calculateThemeStrength;
    private calculateRelationThemeStrength;
    private generateAnalysisSummary;
    private generateRecommendations;
}
//# sourceMappingURL=theme-analysis-service-impl.d.ts.map