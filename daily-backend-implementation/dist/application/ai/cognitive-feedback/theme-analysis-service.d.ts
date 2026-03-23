export interface ThemeAnalysisService {
    analyzeThemes(userId: string, modelId: string, options?: ThemeAnalysisOptions): Promise<ThemeAnalysisResult>;
    generateThemesFromConcepts(concepts: any[], options?: ThemeAnalysisOptions): Theme[];
    generateThemesFromRelations(relations: any[], concepts: any[], options?: ThemeAnalysisOptions): Theme[];
    getThemeDistribution(themes: Theme[]): Record<string, number>;
    identifyDominantTheme(themes: Theme[]): Theme | null;
}
export interface ThemeAnalysisOptions {
    maxThemes?: number;
    themeStrengthThreshold?: number;
    includeRelatedConcepts?: boolean;
    includeThemeDistribution?: boolean;
    identifyDominantTheme?: boolean;
}
export interface Theme {
    id: string;
    name: string;
    description: string;
    strength: number;
    relatedConcepts: string[];
    type: string;
    keywords: string[];
}
export interface ThemeAnalysisResult {
    id: string;
    themes: Theme[];
    themeDistribution: Record<string, number>;
    dominantTheme: Theme | null;
    summary: string;
    recommendations: string[];
    createdAt: Date;
}
//# sourceMappingURL=theme-analysis-service.d.ts.map