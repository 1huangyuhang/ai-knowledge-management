export interface DataAnalysisService {
    calculateTrendMetrics(data: any[], options?: TrendAnalysisOptions): Promise<TrendMetrics>;
    identifyKeyEvents(events: any[], options?: KeyEventOptions): Promise<KeyEvent[]>;
    predictFutureTrends(metrics: TrendMetrics, options?: PredictionOptions): Promise<PredictionResult>;
    generateRecommendations(metrics: TrendMetrics, predictions: PredictionResult, options?: RecommendationOptions): Promise<string[]>;
    calculateImpactMetrics(events: any[], options?: ImpactAnalysisOptions): Promise<ImpactMetrics>;
    analyzeImpactDetails(events: any[], options?: ImpactAnalysisOptions): Promise<ImpactDetails>;
    calculatePatternDistribution(patterns: any[]): Promise<PatternDistribution>;
    determineDominantPattern(patterns: any[]): Promise<any>;
}
export interface TrendAnalysisOptions {
    timeWindow?: number;
    metrics?: string[];
    samplingRate?: number;
}
export interface KeyEventOptions {
    eventTypes?: string[];
    impactThreshold?: number;
}
export interface PredictionOptions {
    predictionHorizon?: number;
    algorithm?: string;
    confidenceLevel?: number;
}
export interface RecommendationOptions {
    recommendationCount?: number;
    recommendationTypes?: string[];
}
export interface ImpactAnalysisOptions {
    impactDimensions?: string[];
    impactThreshold?: number;
}
export interface TrendMetrics {
    conceptCountTrend: {
        labels: string[];
        values: number[];
    };
    relationCountTrend: {
        labels: string[];
        values: number[];
    };
    modelSizeTrend: {
        labels: string[];
        values: number[];
    };
    evolutionSpeedTrend: {
        labels: string[];
        values: number[];
    };
    consistencyScoreTrend: {
        labels: string[];
        values: number[];
    };
}
export interface KeyEvent {
    id: string;
    type: string;
    timestamp: Date;
    description: string;
    impact: number;
    relatedEntities: string[];
}
export interface PredictionResult {
    conceptCount: number;
    relationCount: number;
    modelSize: number;
    evolutionSpeed: number;
    consistencyScore: number;
    confidenceInterval: {
        lower: number;
        upper: number;
    };
}
export interface ImpactMetrics {
    impactScope: number;
    impactDegree: number;
    impactDuration: number;
    impactSpreadSpeed: number;
}
export interface ImpactDetails {
    affectedConcepts: string[];
    affectedRelations: string[];
    affectedVersions: string[];
    impactSpreadPath: string[];
}
export interface PatternDistribution {
    [patternType: string]: number;
}
//# sourceMappingURL=data-analysis-service.d.ts.map