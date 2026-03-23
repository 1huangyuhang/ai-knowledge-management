import { DataAnalysisService, TrendMetrics, KeyEvent, PredictionResult, ImpactMetrics, ImpactDetails, PatternDistribution, TrendAnalysisOptions, KeyEventOptions, PredictionOptions, RecommendationOptions, ImpactAnalysisOptions } from './data-analysis-service';
export declare class DataAnalysisServiceImpl implements DataAnalysisService {
    calculateTrendMetrics(data: any[], options?: TrendAnalysisOptions): Promise<TrendMetrics>;
    identifyKeyEvents(events: any[], options?: KeyEventOptions): Promise<KeyEvent[]>;
    predictFutureTrends(metrics: TrendMetrics, options?: PredictionOptions): Promise<PredictionResult>;
    generateRecommendations(metrics: TrendMetrics, predictions: PredictionResult, options?: RecommendationOptions): Promise<string[]>;
    calculateImpactMetrics(events: any[], options?: ImpactAnalysisOptions): Promise<ImpactMetrics>;
    analyzeImpactDetails(events: any[], options?: ImpactAnalysisOptions): Promise<ImpactDetails>;
    calculatePatternDistribution(patterns: any[]): Promise<PatternDistribution>;
    determineDominantPattern(patterns: any[]): Promise<any>;
    private calculateConceptCountTrend;
    private calculateRelationCountTrend;
    private calculateModelSizeTrend;
    private calculateEvolutionSpeedTrend;
    private calculateConsistencyScoreTrend;
    private calculateAverageGrowth;
    private calculateImpactDuration;
    private calculateImpactSpreadSpeed;
}
//# sourceMappingURL=data-analysis-service-impl.d.ts.map