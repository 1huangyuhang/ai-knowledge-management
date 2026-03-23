import { CognitiveInsight, UserCognitiveModel } from '@/domain/entities/user-cognitive-model';
import { CognitiveConcept, CognitiveRelation } from '@/domain/entities/cognitive-concept';
export interface InsightGenerationResult {
    id: string;
    insights: CognitiveInsight[];
    generatedAt: Date;
    confidence: number;
}
export interface ThemeAnalysisResult {
    id: string;
    coreThemes: CoreTheme[];
    themeNetwork: ThemeRelation[];
    analyzedAt: Date;
}
export interface CoreTheme {
    id: string;
    name: string;
    description: string;
    relatedConcepts: CognitiveConcept[];
    weight: number;
    confidence: number;
}
export interface ThemeRelation {
    sourceThemeId: string;
    targetThemeId: string;
    relationType: string;
    strength: number;
}
export interface BlindspotDetectionResult {
    id: string;
    blindspots: Blindspot[];
    detectedAt: Date;
    confidence: number;
}
export interface Blindspot {
    id: string;
    type: BlindspotType;
    description: string;
    relatedConcepts: CognitiveConcept[];
    impactScope: ImpactScope;
    severity: SeverityLevel;
    confidence: number;
    suggestions: string[];
}
export declare enum BlindspotType {
    CONCEPT_MISSING = "CONCEPT_MISSING",
    RELATION_MISSING = "RELATION_MISSING",
    HIERARCHY_MISSING = "HIERARCHY_MISSING",
    BALANCE_MISSING = "BALANCE_MISSING",
    DEPTH_MISSING = "DEPTH_MISSING"
}
export declare enum ImpactScope {
    LOCAL = "LOCAL",
    GLOBAL = "GLOBAL",
    CRITICAL = "CRITICAL"
}
export declare enum SeverityLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}
export interface GapIdentificationResult {
    id: string;
    gaps: Gap[];
    identifiedAt: Date;
    confidence: number;
}
export interface Gap {
    id: string;
    type: GapType;
    description: string;
    source: string;
    target: string;
    magnitude: number;
    impactScope: ImpactScope;
    severity: SeverityLevel;
    confidence: number;
    suggestions: string[];
}
export declare enum GapType {
    KNOWLEDGE_GAP = "KNOWLEDGE_GAP",
    UNDERSTANDING_GAP = "UNDERSTANDING_GAP",
    APPLICATION_GAP = "APPLICATION_GAP",
    CONNECTION_GAP = "CONNECTION_GAP",
    PERSPECTIVE_GAP = "PERSPECTIVE_GAP"
}
export interface FeedbackFormattingResult {
    id: string;
    rawFeedback: any;
    formattedFeedback: FormattedFeedback;
    formattedAt: Date;
}
export interface FormattedFeedback {
    title: string;
    summary: string;
    insights: CognitiveInsight[];
    themeAnalysis: ThemeAnalysisResult;
    blindspotDetection: BlindspotDetectionResult;
    gapIdentification: GapIdentificationResult;
    actionItems: ActionItem[];
    feedbackType: FeedbackType;
    priority: PriorityLevel;
    recommendedChannels: string[];
}
export declare enum FeedbackType {
    INSIGHT = "INSIGHT",
    SUGGESTION = "SUGGESTION",
    WARNING = "WARNING",
    SUMMARY = "SUMMARY"
}
export declare enum PriorityLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export interface ActionItem {
    id: string;
    description: string;
    type: ActionItemType;
    priority: PriorityLevel;
    suggestedTimeframe: string;
    expectedOutcome: string;
    relatedResources: string[];
}
export declare enum ActionItemType {
    EXPLORE = "EXPLORE",
    LEARN = "LEARN",
    CONNECT = "CONNECT",
    REFLECT = "REFLECT",
    APPLY = "APPLY"
}
export interface InsightGenerationService {
    generateInsights(userId: string, model: UserCognitiveModel): Promise<InsightGenerationResult>;
    generateInsightsByTheme(userId: string, model: UserCognitiveModel, themeId: string): Promise<InsightGenerationResult>;
    generateBatchInsights(userId: string, models: UserCognitiveModel[]): Promise<InsightGenerationResult[]>;
}
export interface ThemeAnalysisService {
    analyzeCoreThemes(userId: string, model: UserCognitiveModel): Promise<ThemeAnalysisResult>;
    buildThemeNetwork(userId: string, themes: CoreTheme[], relations: CognitiveRelation[]): Promise<ThemeRelation[]>;
    updateThemeWeight(userId: string, themeId: string, weight: number): Promise<CoreTheme>;
}
export interface BlindspotDetectionService {
    detectBlindspots(userId: string, model: UserCognitiveModel): Promise<BlindspotDetectionResult>;
    detectSpecificBlindspot(userId: string, model: UserCognitiveModel, blindspotType: BlindspotType): Promise<BlindspotDetectionResult>;
    evaluateBlindspotImpact(userId: string, blindspot: Blindspot): Promise<{
        impactScore: number;
        impactDescription: string;
    }>;
}
export interface GapIdentificationService {
    identifyGaps(userId: string, model: UserCognitiveModel): Promise<GapIdentificationResult>;
    compareModelGaps(userId: string, sourceModel: UserCognitiveModel, targetModel: UserCognitiveModel): Promise<GapIdentificationResult>;
    evaluateGapMagnitude(userId: string, gap: Gap): Promise<{
        magnitudeScore: number;
        magnitudeDescription: string;
    }>;
}
export interface FeedbackFormattingService {
    formatFeedback(userId: string, rawFeedback: any): Promise<FeedbackFormattingResult>;
    generateFeedbackReport(userId: string, formattedFeedback: FormattedFeedback): Promise<any>;
    exportFeedback(userId: string, formattedFeedback: FormattedFeedback, format: string): Promise<any>;
}
export interface CognitiveFeedbackService {
    insightGenerationService: InsightGenerationService;
    themeAnalysisService: ThemeAnalysisService;
    blindspotDetectionService: BlindspotDetectionService;
    gapIdentificationService: GapIdentificationService;
    feedbackFormattingService: FeedbackFormattingService;
    generateCompleteFeedback(userId: string, model: UserCognitiveModel): Promise<FeedbackFormattingResult>;
}
//# sourceMappingURL=cognitive-feedback-service.d.ts.map