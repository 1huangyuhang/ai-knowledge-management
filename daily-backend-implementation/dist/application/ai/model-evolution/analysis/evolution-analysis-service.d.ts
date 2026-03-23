export interface EvolutionAnalysisService {
    analyzeEvolutionTrends(userId: string, options?: any): Promise<any>;
    analyzeConceptEvolution(userId: string, conceptId: string, options?: any): Promise<any>;
    analyzeRelationEvolution(userId: string, relationId: string, options?: any): Promise<any>;
    identifyEvolutionPatterns(userId: string, options?: any): Promise<any>;
    evaluateEvolutionImpact(userId: string, versionId: string, options?: any): Promise<any>;
    predictModelEvolution(userId: string, options?: any): Promise<any>;
    generateAnalysisReport(userId: string, analysisResults: any[]): Promise<any>;
}
//# sourceMappingURL=evolution-analysis-service.d.ts.map