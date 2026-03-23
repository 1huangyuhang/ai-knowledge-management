export interface EvolutionAnalysisService {
    analyzeEvolutionTrends(userId: string, options?: any): Promise<any>;
    analyzeConceptEvolution(userId: string, conceptId: string, options?: any): Promise<any>;
    analyzeRelationEvolution(userId: string, relationId: string, options?: any): Promise<any>;
    identifyEvolutionPatterns(userId: string, options?: any): Promise<any>;
    evaluateEvolutionImpact(userId: string, versionId: string, options?: any): Promise<any>;
    predictModelEvolution(userId: string, options?: any): Promise<any>;
    generateAnalysisReport(userId: string, analysisResults: any[]): Promise<any>;
}
export interface EvolutionPatternRecognitionService {
    recognizeConceptPatterns(evolutionEvents: any[]): Promise<any[]>;
    recognizeRelationPatterns(evolutionEvents: any[]): Promise<any[]>;
    recognizeOverallPatterns(evolutionEvents: any[]): Promise<any[]>;
    getAvailablePatterns(): any[];
}
export interface EvolutionVisualizationService {
    visualizeTrends(trendResult: any): Promise<any>;
    visualizeConceptEvolution(conceptResult: any): Promise<any>;
    visualizeRelationEvolution(relationResult: any): Promise<any>;
    visualizePatterns(patternResult: any): Promise<any>;
    generateEvolutionGraph(userId: string, options?: any): Promise<any>;
}
//# sourceMappingURL=evolution-analysis.interface.d.ts.map