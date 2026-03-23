import { EvolutionAnalysisService } from './evolution-analysis-service';
import { EvolutionHistoryService } from '../interfaces/evolution-history.interface';
import { VersionManagementService } from '../version-management/version-management-service';
import { EvolutionPatternRecognitionService } from '../interfaces/evolution-analysis.interface';
import { DataAnalysisService } from '../data-analysis/data-analysis-service';
export declare class EvolutionAnalysisServiceImpl implements EvolutionAnalysisService {
    private evolutionHistoryService;
    private versionManagementService;
    private evolutionPatternService;
    private dataAnalysisService;
    constructor(evolutionHistoryService: EvolutionHistoryService, versionManagementService: VersionManagementService, evolutionPatternService: EvolutionPatternRecognitionService, dataAnalysisService: DataAnalysisService);
    analyzeEvolutionTrends(userId: string, options?: any): Promise<any>;
    analyzeConceptEvolution(userId: string, conceptId: string, options?: any): Promise<any>;
    analyzeRelationEvolution(userId: string, relationId: string, options?: any): Promise<any>;
    identifyEvolutionPatterns(userId: string, options?: any): Promise<any>;
    evaluateEvolutionImpact(userId: string, versionId: string, options?: any): Promise<any>;
    predictModelEvolution(userId: string, options?: any): Promise<any>;
    generateAnalysisReport(userId: string, analysisResults: any[]): Promise<any>;
    private generateTrendSummary;
    private generateConceptEvolutionSummary;
    private generateRelationEvolutionSummary;
    private generatePatternRecognitionSummary;
    private generateImpactEvaluationSummary;
    private generatePredictionSummary;
    private generateReportSummary;
    private generatePatternRecommendations;
    private generateImpactRecommendations;
    private generateRiskAssessment;
    private getTrendDirection;
}
//# sourceMappingURL=evolution-analysis-service-impl.d.ts.map