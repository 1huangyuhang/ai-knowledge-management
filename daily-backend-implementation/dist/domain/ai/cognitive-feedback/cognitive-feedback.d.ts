export declare enum CognitiveInsightType {
    CONCEPT_INSIGHT = "CONCEPT_INSIGHT",
    RELATION_INSIGHT = "RELATION_INSIGHT",
    STRUCTURE_INSIGHT = "STRUCTURE_INSIGHT",
    EVOLUTION_INSIGHT = "EVOLUTION_INSIGHT",
    THEME_INSIGHT = "THEME_INSIGHT",
    BLINDSPOT_INSIGHT = "BLINDSPOT_INSIGHT",
    GAP_INSIGHT = "GAP_INSIGHT"
}
export interface CognitiveInsight {
    id: string;
    type: CognitiveInsightType;
    title: string;
    description: string;
    importance: number;
    confidence: number;
    relatedConceptIds?: string[];
    relatedRelationIds?: string[];
    suggestions: string[];
    createdAt: Date;
}
export interface ThemeAnalysisResult {
    id: string;
    themes: Theme[];
    themeDistribution: Record<string, number>;
    dominantTheme: Theme;
    summary: string;
    recommendations: string[];
    createdAt: Date;
}
export interface Theme {
    id: string;
    name: string;
    description: string;
    strength: number;
    relatedConcepts: string[];
    type: string;
}
export interface BlindspotDetectionResult {
    id: string;
    blindspots: Blindspot[];
    blindspotDistribution: Record<string, number>;
    summary: string;
    recommendations: string[];
    createdAt: Date;
}
export interface Blindspot {
    id: string;
    description: string;
    type: string;
    impact: number;
    relatedThemes: string[];
    potentialRisks: string[];
}
export interface GapIdentificationResult {
    id: string;
    gaps: Gap[];
    gapDistribution: Record<string, number>;
    summary: string;
    recommendations: string[];
    createdAt: Date;
}
export interface Gap {
    id: string;
    description: string;
    type: string;
    size: number;
    relatedConcepts: string[];
    relatedRelations: string[];
    improvementDirection: string;
}
export interface CognitiveFeedback {
    id: string;
    title: string;
    type: string;
    content: string;
    format: FeedbackFormat;
    relatedInsightIds: string[];
    createdAt: Date;
}
export declare enum FeedbackFormat {
    TEXT = "TEXT",
    STRUCTURED = "STRUCTURED",
    VISUAL = "VISUAL",
    INTERACTIVE = "INTERACTIVE"
}
export interface InsightGenerationOptions {
    insightTypes?: CognitiveInsightType[];
    importanceThreshold?: number;
    confidenceThreshold?: number;
    maxInsights?: number;
    includeSuggestions?: boolean;
}
export interface ThemeAnalysisOptions {
    maxThemes?: number;
    themeStrengthThreshold?: number;
    includeRelatedConcepts?: boolean;
}
export interface BlindspotDetectionOptions {
    blindspotTypes?: string[];
    impactThreshold?: number;
    includePotentialRisks?: boolean;
}
export interface GapIdentificationOptions {
    gapTypes?: string[];
    gapSizeThreshold?: number;
    includeImprovementDirection?: boolean;
}
export interface FeedbackFormattingOptions {
    format: FeedbackFormat;
    language?: string;
    complexityLevel?: string;
    includeVisualization?: boolean;
    includeInteractiveElements?: boolean;
}
//# sourceMappingURL=cognitive-feedback.d.ts.map