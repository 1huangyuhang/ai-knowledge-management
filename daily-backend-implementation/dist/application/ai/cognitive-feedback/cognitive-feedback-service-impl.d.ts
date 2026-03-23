import { CognitiveFeedbackService, InsightGenerationService, ThemeAnalysisService, BlindspotDetectionService, GapIdentificationService, FeedbackFormattingService, InsightGenerationResult, ThemeAnalysisResult, BlindspotDetectionResult, GapIdentificationResult, FeedbackFormattingResult, CoreTheme, ThemeRelation, Blindspot, Gap, FormattedFeedback, BlindspotType } from './cognitive-feedback-service';
import { UserCognitiveModel } from '@/domain/entities/user-cognitive-model';
import { CognitiveRelation as DomainCognitiveRelation } from '@/domain/entities/cognitive-concept';
import { CognitiveModelService } from '@/domain/services/cognitive-model.service';
import { CognitiveInsightRepository } from '@/domain/repositories/cognitive-insight-repository';
export declare class InsightGenerationServiceImpl implements InsightGenerationService {
    private cognitiveModelService;
    private cognitiveInsightRepository;
    constructor(cognitiveModelService: CognitiveModelService, cognitiveInsightRepository: CognitiveInsightRepository);
    generateInsights(userId: string, model: UserCognitiveModel): Promise<InsightGenerationResult>;
    generateInsightsByTheme(userId: string, model: UserCognitiveModel, themeId: string): Promise<InsightGenerationResult>;
    generateBatchInsights(userId: string, models: UserCognitiveModel[]): Promise<InsightGenerationResult[]>;
}
export declare class ThemeAnalysisServiceImpl implements ThemeAnalysisService {
    analyzeCoreThemes(userId: string, model: UserCognitiveModel): Promise<ThemeAnalysisResult>;
    buildThemeNetwork(userId: string, themes: CoreTheme[], relations: DomainCognitiveRelation[]): Promise<ThemeRelation[]>;
    updateThemeWeight(userId: string, themeId: string, weight: number): Promise<CoreTheme>;
}
export declare class BlindspotDetectionServiceImpl implements BlindspotDetectionService {
    private cognitiveModelService;
    constructor(cognitiveModelService: CognitiveModelService);
    detectBlindspots(userId: string, model: UserCognitiveModel): Promise<BlindspotDetectionResult>;
    detectSpecificBlindspot(userId: string, model: UserCognitiveModel, blindspotType: BlindspotType): Promise<BlindspotDetectionResult>;
    evaluateBlindspotImpact(userId: string, blindspot: Blindspot): Promise<{
        impactScore: number;
        impactDescription: string;
    }>;
    private detectConceptMissingBlindspot;
    private detectRelationMissingBlindspot;
    private detectHierarchyMissingBlindspot;
    private detectBalanceMissingBlindspot;
    private detectDepthMissingBlindspot;
    private hasHierarchyStructure;
    private isModelBalanced;
    private hasAdequateDepth;
}
export declare class GapIdentificationServiceImpl implements GapIdentificationService {
    private cognitiveModelService;
    constructor(cognitiveModelService: CognitiveModelService);
    identifyGaps(userId: string, model: UserCognitiveModel): Promise<GapIdentificationResult>;
    compareModelGaps(userId: string, sourceModel: UserCognitiveModel, targetModel: UserCognitiveModel): Promise<GapIdentificationResult>;
    evaluateGapMagnitude(userId: string, gap: Gap): Promise<{
        magnitudeScore: number;
        magnitudeDescription: string;
    }>;
    private identifyKnowledgeGap;
    private identifyUnderstandingGap;
    private identifyApplicationGap;
    private identifyConnectionGap;
    private identifyPerspectiveGap;
    private hasApplicationRelations;
    private hasDiverseRelations;
    private hasDiverseConcepts;
}
export declare class FeedbackFormattingServiceImpl implements FeedbackFormattingService {
    constructor();
    formatFeedback(userId: string, rawFeedback: any): Promise<FeedbackFormattingResult>;
    generateFeedbackReport(userId: string, formattedFeedback: FormattedFeedback): Promise<any>;
    exportFeedback(userId: string, formattedFeedback: FormattedFeedback, format: string): Promise<any>;
    private generateActionItems;
    private determineFeedbackType;
    private determinePriority;
    private generateFeedbackSummary;
    private generateTextReport;
    private generatePdfReport;
    private mapBlindspotTypeToActionItemType;
    private mapGapTypeToActionItemType;
    private mapSeverityToPriority;
}
export declare class CognitiveFeedbackServiceImpl implements CognitiveFeedbackService {
    insightGenerationService: InsightGenerationService;
    themeAnalysisService: ThemeAnalysisService;
    blindspotDetectionService: BlindspotDetectionService;
    gapIdentificationService: GapIdentificationService;
    feedbackFormattingService: FeedbackFormattingService;
    constructor(insightGenerationService: InsightGenerationService, themeAnalysisService: ThemeAnalysisService, blindspotDetectionService: BlindspotDetectionService, gapIdentificationService: GapIdentificationService, feedbackFormattingService: FeedbackFormattingService);
    generateCompleteFeedback(userId: string, model: UserCognitiveModel): Promise<FeedbackFormattingResult>;
}
//# sourceMappingURL=cognitive-feedback-service-impl.d.ts.map