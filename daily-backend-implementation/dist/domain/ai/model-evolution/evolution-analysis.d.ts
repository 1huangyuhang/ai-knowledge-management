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
export interface EvolutionTrendOptions {
    startDate?: Date;
    endDate?: Date;
    dimensions?: string[];
    includePredictions?: boolean;
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
export interface EvolutionEvent {
    id: string;
    type: string;
    timestamp: Date;
    data: any;
    impact: string;
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
export interface ConceptEvolutionOptions {
    startDate?: Date;
    endDate?: Date;
    dimensions?: string[];
}
export interface ConceptEvolutionResult extends EvolutionAnalysisResult {
    conceptId: string;
    conceptName: string;
    metrics: {
        appearanceFrequency: number;
        relationCountChange: number;
        importanceScoreChange: number;
        relatedConceptsChange: number;
    };
    evolutionPath: {
        timestamp: Date;
        state: any;
    }[];
}
export interface RelationEvolutionOptions {
    startDate?: Date;
    endDate?: Date;
    dimensions?: string[];
}
export interface RelationEvolutionResult extends EvolutionAnalysisResult {
    relationId: string;
    relationType: string;
    metrics: {
        strengthChange: number;
        appearanceFrequency: number;
        relatedConceptsChange: number;
    };
    evolutionPath: {
        timestamp: Date;
        state: any;
    }[];
}
export interface PatternRecognitionOptions {
    startDate?: Date;
    endDate?: Date;
    patternTypes?: string[];
    confidenceThreshold?: number;
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
export interface EvolutionPatternResult extends EvolutionAnalysisResult {
    patterns: EvolutionPattern[];
    patternDistribution: Record<EvolutionPatternType, number>;
    dominantPattern: EvolutionPattern;
}
export interface ImpactEvaluationOptions {
    analysisDepth?: number;
    impactScope?: string[];
}
export interface EvolutionImpactResult extends EvolutionAnalysisResult {
    versionId: string;
    metrics: {
        affectedConcepts: number;
        affectedRelations: number;
        consistencyChange: number;
        impactScore: number;
    };
    impactDetails: {
        positiveImpacts: string[];
        negativeImpacts: string[];
        neutralImpacts: string[];
    };
}
export interface EvolutionPredictionOptions {
    predictionPeriodDays?: number;
    predictionAlgorithm?: string;
    predictionDimensions?: string[];
}
export interface EvolutionPredictionResult extends EvolutionAnalysisResult {
    metrics: {
        predictedConceptCount: number;
        predictedRelationCount: number;
        predictedModelSize: number;
        predictedEvolutionSpeed: number;
        predictedConsistencyScore: number;
    };
    predictedTrends: {
        type: string;
        confidence: number;
        description: string;
    }[];
    riskAssessment: {
        riskLevel: string;
        riskDescription: string;
        mitigationSuggestions: string[];
    };
}
export interface EvolutionAnalysisReport {
    id: string;
    userId: string;
    generatedAt: Date;
    title: string;
    summary: string;
    analysisResults: EvolutionAnalysisResult[];
    conclusions: string[];
    recommendations: string[];
    version: string;
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
//# sourceMappingURL=evolution-analysis.d.ts.map