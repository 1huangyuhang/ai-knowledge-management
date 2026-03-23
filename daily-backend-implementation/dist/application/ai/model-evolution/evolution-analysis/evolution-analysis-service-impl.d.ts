import { EvolutionAnalysisService, EvolutionPatternRecognitionService, EvolutionVisualizationService } from './evolution-analysis-service';
import { EvolutionHistoryService } from '../evolution-history/evolution-history-service';
import { VersionManagementService } from '../version-management/version-management-service';
import { EvolutionAnalysisResult, EvolutionAnalysisReport, EvolutionTrendResult, EvolutionPatternResult, ConceptEvolutionResult, RelationEvolutionResult, EvolutionImpactResult, EvolutionPredictionResult, EvolutionTrendOptions, ConceptEvolutionOptions, RelationEvolutionOptions, PatternRecognitionOptions, ImpactEvaluationOptions, EvolutionPredictionOptions, EvolutionPattern } from '../../../../domain/ai/model-evolution/evolution-analysis';
import { ModelEvolutionEvent } from '../../../../domain/ai/model-evolution/evolution-history';
export declare class EvolutionAnalysisServiceImpl implements EvolutionAnalysisService {
    private evolutionHistoryService;
    private versionManagementService;
    private evolutionPatternService;
    private dataAnalysisService;
    constructor(evolutionHistoryService: EvolutionHistoryService, versionManagementService: VersionManagementService, evolutionPatternService: EvolutionPatternRecognitionService, dataAnalysisService: any);
    analyzeEvolutionTrends(userId: string, options?: EvolutionTrendOptions): Promise<EvolutionTrendResult>;
    analyzeConceptEvolution(userId: string, conceptId: string, options?: ConceptEvolutionOptions): Promise<ConceptEvolutionResult>;
    analyzeRelationEvolution(userId: string, relationId: string, options?: RelationEvolutionOptions): Promise<RelationEvolutionResult>;
    identifyEvolutionPatterns(userId: string, options?: PatternRecognitionOptions): Promise<EvolutionPatternResult>;
    evaluateEvolutionImpact(userId: string, versionId: string, options?: ImpactEvaluationOptions): Promise<EvolutionImpactResult>;
    predictModelEvolution(userId: string, options?: EvolutionPredictionOptions): Promise<EvolutionPredictionResult>;
    generateAnalysisReport(userId: string, analysisResults: EvolutionAnalysisResult[]): Promise<EvolutionAnalysisReport>;
    private calculateTrendMetrics;
    private identifyKeyEvents;
    private predictFutureTrends;
    private generateTrendRecommendations;
    private generateTrendSummary;
    private calculateConceptMetrics;
    private generateConceptEvolutionPath;
    private generateConceptRecommendations;
    private generateConceptSummary;
    private calculateRelationMetrics;
    private generateRelationEvolutionPath;
    private generateRelationRecommendations;
    private generateRelationSummary;
    private calculatePatternDistribution;
    private determineDominantPattern;
    private generatePatternRecommendations;
    private generatePatternSummary;
    private calculateImpactMetrics;
    private analyzeImpactDetails;
    private generateImpactRecommendations;
    private generateImpactSummary;
    private calculatePredictionMetrics;
    private predictTrends;
    private assessPredictionRisks;
    private generatePredictionRecommendations;
    private generatePredictionSummary;
    private generateReportSummary;
    private generateReportConclusions;
    private generateReportRecommendations;
}
export declare class EvolutionPatternRecognitionServiceImpl implements EvolutionPatternRecognitionService {
    private machineLearningService;
    constructor(machineLearningService: any);
    recognizeConceptPatterns(evolutionEvents: ModelEvolutionEvent[]): Promise<EvolutionPattern[]>;
    recognizeRelationPatterns(evolutionEvents: ModelEvolutionEvent[]): Promise<EvolutionPattern[]>;
    recognizeOverallPatterns(evolutionEvents: ModelEvolutionEvent[]): Promise<EvolutionPattern[]>;
    getAvailablePatterns(): EvolutionPattern[];
}
export declare class EvolutionVisualizationServiceImpl implements EvolutionVisualizationService {
    visualizeTrends(trendResult: EvolutionTrendResult): Promise<any>;
    visualizeConceptEvolution(conceptResult: ConceptEvolutionResult): Promise<any>;
    visualizeRelationEvolution(relationResult: RelationEvolutionResult): Promise<any>;
    visualizePatterns(patternResult: EvolutionPatternResult): Promise<any>;
    generateEvolutionGraph(userId: string, options?: any): Promise<any>;
}
//# sourceMappingURL=evolution-analysis-service-impl.d.ts.map