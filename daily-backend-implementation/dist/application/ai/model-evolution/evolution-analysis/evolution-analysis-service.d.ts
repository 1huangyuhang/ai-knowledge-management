import { DateRange } from '../../../../domain/value-objects/date-range';
import { ModelEvolutionEvent } from '../../../../domain/entities/model-evolution-event';
import { UserId } from '../../../../domain/value-objects/user-id';
import { UUID } from '../../../../domain/value-objects/uuid';
export declare enum EvolutionAnalysisType {
    TREND_ANALYSIS = "TREND_ANALYSIS",
    CONCEPT_EVOLUTION = "CONCEPT_EVOLUTION",
    RELATION_EVOLUTION = "RELATION_EVOLUTION",
    PATTERN_RECOGNITION = "PATTERN_RECOGNITION",
    IMPACT_EVALUATION = "IMPACT_EVALUATION",
    EVOLUTION_PREDICTION = "EVOLUTION_PREDICTION"
}
export interface EvolutionAnalysisResult {
    id: UUID;
    userId: UserId;
    type: EvolutionAnalysisType;
    analyzedAt: Date;
    timeRange: DateRange;
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
export interface EvolutionTrendResult extends EvolutionAnalysisResult {
    metrics: EvolutionTrendMetrics;
    keyEvents: EvolutionEvent[];
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
    id: UUID;
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
export interface EvolutionPatternResult extends EvolutionAnalysisResult {
    patterns: EvolutionPattern[];
    patternDistribution: Record<EvolutionPatternType, number>;
    dominantPattern: EvolutionPattern;
}
export interface EvolutionEvent {
    id: UUID;
    type: string;
    timestamp: Date;
    data: any;
}
export interface EvolutionTrendOptions {
    startDate?: Date;
    endDate?: Date;
    metrics?: string[];
    algorithm?: string;
}
export interface ConceptEvolutionOptions {
    conceptId?: string;
    timeRange?: DateRange;
    dimensions?: string[];
}
export interface RelationEvolutionOptions {
    relationId?: string;
    timeRange?: DateRange;
}
export interface PatternRecognitionOptions {
    timeRange?: DateRange;
    algorithm?: string;
    minConfidence?: number;
}
export interface ImpactEvaluationOptions {
    baseVersionId?: string;
    compareVersionId?: string;
    dimensions?: string[];
}
export interface EvolutionPredictionOptions {
    predictionDays?: number;
    algorithm?: string;
}
export interface EvolutionAnalysisReport {
    id: UUID;
    title: string;
    generatedAt: Date;
    content: string;
    format: string;
    summary: string;
    visualizationData: any;
}
export interface EvolutionAnalysisService {
    analyzeEvolutionTrends(userId: UserId, options?: EvolutionTrendOptions): Promise<EvolutionTrendResult>;
    analyzeConceptEvolution(userId: UserId, conceptId: string, options?: ConceptEvolutionOptions): Promise<EvolutionAnalysisResult>;
    analyzeRelationEvolution(userId: UserId, relationId: string, options?: RelationEvolutionOptions): Promise<EvolutionAnalysisResult>;
    identifyEvolutionPatterns(userId: UserId, options?: PatternRecognitionOptions): Promise<EvolutionPatternResult>;
    evaluateEvolutionImpact(userId: UserId, versionId: string, options?: ImpactEvaluationOptions): Promise<EvolutionAnalysisResult>;
    predictModelEvolution(userId: UserId, options?: EvolutionPredictionOptions): Promise<EvolutionAnalysisResult>;
    generateAnalysisReport(userId: UserId, analysisResults: EvolutionAnalysisResult[]): Promise<EvolutionAnalysisReport>;
}
export interface EvolutionPatternRecognitionService {
    recognizeConceptPatterns(evolutionEvents: ModelEvolutionEvent[]): Promise<EvolutionPattern[]>;
    recognizeRelationPatterns(evolutionEvents: ModelEvolutionEvent[]): Promise<EvolutionPattern[]>;
    recognizeOverallPatterns(evolutionEvents: ModelEvolutionEvent[]): Promise<EvolutionPattern[]>;
    getAvailablePatterns(): EvolutionPatternType[];
}
export interface EvolutionTrendVisualization {
    id: UUID;
    chartData: any;
    eventMarkers: any[];
    predictions: any;
    recommendations: string[];
}
export interface ConceptEvolutionVisualization {
    id: UUID;
    conceptId: string;
    conceptName: string;
    visualizationData: any;
    evolutionPath: any[];
    keyEvents: any[];
}
export interface RelationEvolutionVisualization {
    id: UUID;
    relationId: string;
    visualizationData: any;
    relationChanges: any[];
}
export interface EvolutionPatternVisualization {
    id: UUID;
    patternData: any;
    patternDistribution: any;
    dominantPattern: any;
}
export interface EvolutionGraph {
    id: UUID;
    nodes: any[];
    edges: any[];
    timeRange: DateRange;
    events: any[];
}
export interface EvolutionGraphOptions {
    timeRange?: DateRange;
    graphType?: string;
    showConcepts?: boolean;
    showRelations?: boolean;
    showEvents?: boolean;
}
export interface EvolutionVisualizationService {
    visualizeTrends(trendResult: EvolutionTrendResult): Promise<EvolutionTrendVisualization>;
    visualizeConceptEvolution(conceptResult: EvolutionAnalysisResult): Promise<ConceptEvolutionVisualization>;
    visualizeRelationEvolution(relationResult: EvolutionAnalysisResult): Promise<RelationEvolutionVisualization>;
    visualizePatterns(patternResult: EvolutionPatternResult): Promise<EvolutionPatternVisualization>;
    generateEvolutionGraph(userId: UserId, options?: EvolutionGraphOptions): Promise<EvolutionGraph>;
}
//# sourceMappingURL=evolution-analysis-service.d.ts.map