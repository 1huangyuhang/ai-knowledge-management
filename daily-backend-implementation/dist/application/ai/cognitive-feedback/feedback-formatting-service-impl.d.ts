import { FeedbackFormattingService } from './feedback-formatting-service';
import { CognitiveFeedback, FeedbackFormat, FeedbackFormattingOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { CognitiveInsight } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { ThemeAnalysisResult } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { BlindspotDetectionResult } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { GapIdentificationResult } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
export declare class FeedbackFormattingServiceImpl implements FeedbackFormattingService {
    constructor();
    formatFeedback(data: {
        insights: CognitiveInsight[];
        themes: ThemeAnalysisResult[];
        blindspots: BlindspotDetectionResult[];
        gaps: GapIdentificationResult[];
    }, format?: FeedbackFormat): Promise<{
        text: string;
        structured: any;
        visual: any;
        interactive: any;
    }>;
    formatInsightsAsFeedback(userId: string, modelId: string, insights: CognitiveInsight[], options: FeedbackFormattingOptions): Promise<CognitiveFeedback>;
    formatThemeAnalysisAsFeedback(userId: string, modelId: string, themeAnalysisResult: ThemeAnalysisResult, options: FeedbackFormattingOptions): Promise<CognitiveFeedback>;
    formatBlindspotDetectionAsFeedback(userId: string, modelId: string, blindspotDetectionResult: BlindspotDetectionResult, options: FeedbackFormattingOptions): Promise<CognitiveFeedback>;
    formatGapIdentificationAsFeedback(userId: string, modelId: string, gapIdentificationResult: GapIdentificationResult, options: FeedbackFormattingOptions): Promise<CognitiveFeedback>;
    formatComprehensiveFeedback(userId: string, modelId: string, insights: CognitiveInsight[], themeAnalysisResult: ThemeAnalysisResult, blindspotDetectionResult: BlindspotDetectionResult, gapIdentificationResult: GapIdentificationResult, options: FeedbackFormattingOptions): Promise<CognitiveFeedback>;
    convertFeedbackFormat(feedback: CognitiveFeedback, format: FeedbackFormat): Promise<CognitiveFeedback>;
    private formatInsightsAsText;
    private formatInsightsAsStructured;
    private formatInsightsAsVisual;
    private formatInsightsAsInteractive;
    private formatThemeAnalysisAsText;
    private formatThemeAnalysisAsStructured;
    private formatThemeAnalysisAsVisual;
    private formatThemeAnalysisAsInteractive;
    private formatBlindspotDetectionAsText;
    private formatBlindspotDetectionAsStructured;
    private formatBlindspotDetectionAsVisual;
    private formatBlindspotDetectionAsInteractive;
    private formatGapIdentificationAsText;
    private formatGapIdentificationAsStructured;
    private formatGapIdentificationAsVisual;
    private formatGapIdentificationAsInteractive;
    private formatComprehensiveAsText;
    private formatComprehensiveAsStructured;
    private formatComprehensiveAsVisual;
    private formatComprehensiveAsInteractive;
    private groupInsightsByType;
    private getInsightTypeLabel;
    private getUniqueInsightTypes;
}
//# sourceMappingURL=feedback-formatting-service-impl.d.ts.map