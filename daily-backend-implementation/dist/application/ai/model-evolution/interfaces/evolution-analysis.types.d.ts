export declare enum EvolutionAnalysisType {
    TREND_ANALYSIS = "TREND_ANALYSIS",
    CONCEPT_EVOLUTION = "CONCEPT_EVOLUTION",
    RELATION_EVOLUTION = "RELATION_EVOLUTION",
    PATTERN_RECOGNITION = "PATTERN_RECOGNITION",
    IMPACT_EVALUATION = "IMPACT_EVALUATION",
    EVOLUTION_PREDICTION = "EVOLUTION_PREDICTION"
}
export interface EvolutionAnalysisResult {
    id: string;
    userId: string;
    type: EvolutionAnalysisType;
    analyzedAt: Date;
    timeRange: {
        start: Date;
        end: Date;
    };
    data: any;
    summary: string;
    recommendations: string[];
}
export interface EvolutionTrendMetrics {
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
export interface EvolutionTrendOptions {
    timeRange?: {
        start: Date;
        end: Date;
    };
    dimensions?: string[];
    metrics?: string[];
}
export interface EvolutionTrendResult extends EvolutionAnalysisResult {
    metrics: EvolutionTrendMetrics;
    keyEvents: any[];
    predictions: {
        conceptCount: number;
        relationCount: number;
        modelSize: number;
        evolutionSpeed: number;
        consistencyScore: number;
    };
}
export declare enum EvolutionPatternType {
    LINEAR_GROWTH = "LINEAR_GROWTH",
    EXPONENTIAL_GROWTH = "EXPONENTIAL_GROWTH",
    PHASED_GROWTH = "PHASED_GROWTH",
    FLUCTUATING_GROWTH = "FLUCTUATING_GROWTH",
    STABLE_EVOLUTION = "STABLE_EVOLUTION",
    RESTRUCTURING_EVOLUTION = "RESTRUCTURING_EVOLUTION",
    DECLINING_EVOLUTION = "DECLINING_EVOLUTION"
}
export interface EvolutionPattern {
    id: string;
    name: string;
    type: EvolutionPatternType;
    description: string;
    confidence: number;
    features: {
        startTime: Date;
        endTime: Date;
        durationDays: number;
        keyMetricChanges: Record<string, number>;
    };
}
export interface ConceptEvolutionPattern extends EvolutionPattern {
    conceptId: string;
    conceptName: string;
}
export interface RelationEvolutionPattern extends EvolutionPattern {
    relationId: string;
    relationType: string;
}
export interface OverallEvolutionPattern extends EvolutionPattern {
    coverage: number;
}
export interface PatternRecognitionOptions {
    timeRange?: {
        start: Date;
        end: Date;
    };
    patternTypes?: EvolutionPatternType[];
    minConfidence?: number;
}
export interface EvolutionPatternResult extends EvolutionAnalysisResult {
    patterns: EvolutionPattern[];
    patternDistribution: Record<EvolutionPatternType, number>;
    dominantPattern: EvolutionPattern;
}
export interface ConceptEvolutionOptions {
    timeRange?: {
        start: Date;
        end: Date;
    };
    conceptIds?: string[];
    dimensions?: string[];
}
export interface ConceptEvolutionResult extends EvolutionAnalysisResult {
    conceptDetails: any[];
    growthTrends: any[];
}
export interface RelationEvolutionOptions {
    timeRange?: {
        start: Date;
        end: Date;
    };
    relationTypes?: string[];
    dimensions?: string[];
}
export interface RelationEvolutionResult extends EvolutionAnalysisResult {
    relationDetails: any[];
    growthTrends: any[];
}
export interface ImpactEvaluationOptions {
    impactScope?: string[];
    evaluationMethod?: string;
}
export interface EvolutionImpactResult extends EvolutionAnalysisResult {
    impactScope: string[];
    impactLevel: 'low' | 'medium' | 'high';
    impactMetrics: Record<string, number>;
    affectedConcepts: string[];
    affectedRelations: string[];
}
export interface EvolutionPredictionOptions {
    predictionTimeRange?: number;
    predictionMethod?: string;
    predictionMetrics?: string[];
}
export interface EvolutionPredictionResult extends EvolutionAnalysisResult {
    predictionMetrics: any[];
    predictionConfidence: number;
    predictedTrends: any[];
    riskAssessment: {
        risks: string[];
        riskLevels: Record<string, 'low' | 'medium' | 'high'>;
    };
}
export interface EvolutionAnalysisReport {
    id: string;
    userId: string;
    generatedAt: Date;
    title: string;
    summary: string;
    analysisResults: EvolutionAnalysisResult[];
    recommendations: string[];
    status: 'draft' | 'completed' | 'archived';
    format: 'pdf' | 'html' | 'json';
}
export interface EvolutionTrendVisualization {
    id: string;
    chartData: any;
    eventMarkers: any[];
    predictions: any;
    recommendations: string[];
}
export interface ConceptEvolutionVisualization {
    id: string;
    conceptEvolutionGraph: any;
    growthTrends: any;
    keyEvents: any[];
}
export interface RelationEvolutionVisualization {
    id: string;
    relationEvolutionGraph: any;
    growthTrends: any;
    relationTypeDistribution: any;
}
export interface EvolutionPatternVisualization {
    id: string;
    patternDistributionChart: any;
    patternDetails: any[];
    dominantPatternVisualization: any;
}
export interface EvolutionGraphOptions {
    timeRange?: {
        start: Date;
        end: Date;
    };
    graphType?: 'concept' | 'relation' | 'overall';
    maxNodes?: number;
    maxEdges?: number;
    includePredictions?: boolean;
}
export interface EvolutionGraph {
    id: string;
    nodes: any[];
    edges: any[];
    timeRange: {
        start: Date;
        end: Date;
    };
    graphType: 'concept' | 'relation' | 'overall';
    generatedAt: Date;
    nodeStats: {
        total: number;
        types: Record<string, number>;
    };
    edgeStats: {
        total: number;
        types: Record<string, number>;
    };
}
//# sourceMappingURL=evolution-analysis.types.d.ts.map