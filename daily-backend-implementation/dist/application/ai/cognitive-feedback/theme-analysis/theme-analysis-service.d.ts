import { ThemeAnalysisResult, Theme, ThemeAnalysisOptions } from '@/domain/ai/cognitive-feedback/cognitive-feedback';
export interface ThemeAnalysisService {
    analyzeThemes(userId: string, modelId: string, options?: ThemeAnalysisOptions): Promise<ThemeAnalysisResult>;
    getThemeById(userId: string, themeId: string): Promise<Theme | null>;
    getThemesByModelId(userId: string, modelId: string): Promise<Theme[]>;
    analyzeConceptThemes(userId: string, modelId: string, conceptId: string): Promise<Theme[]>;
    analyzeRelationThemes(userId: string, modelId: string, relationId: string): Promise<Theme[]>;
}
//# sourceMappingURL=theme-analysis-service.d.ts.map