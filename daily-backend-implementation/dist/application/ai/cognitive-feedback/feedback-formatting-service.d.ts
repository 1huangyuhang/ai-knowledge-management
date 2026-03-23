import { CognitiveFeedback, FeedbackFormat, FeedbackFormattingOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { CognitiveInsight } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { ThemeAnalysisResult } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { BlindspotDetectionResult } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { GapIdentificationResult } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
export interface FeedbackFormattingService {
    formatInsightsAsFeedback(userId: string, modelId: string, insights: CognitiveInsight[], options: FeedbackFormattingOptions): Promise<CognitiveFeedback>;
    formatThemeAnalysisAsFeedback(userId: string, modelId: string, themeAnalysisResult: ThemeAnalysisResult, options: FeedbackFormattingOptions): Promise<CognitiveFeedback>;
    formatBlindspotDetectionAsFeedback(userId: string, modelId: string, blindspotDetectionResult: BlindspotDetectionResult, options: FeedbackFormattingOptions): Promise<CognitiveFeedback>;
    formatGapIdentificationAsFeedback(userId: string, modelId: string, gapIdentificationResult: GapIdentificationResult, options: FeedbackFormattingOptions): Promise<CognitiveFeedback>;
    formatComprehensiveFeedback(userId: string, modelId: string, insights: CognitiveInsight[], themeAnalysisResult: ThemeAnalysisResult, blindspotDetectionResult: BlindspotDetectionResult, gapIdentificationResult: GapIdentificationResult, options: FeedbackFormattingOptions): Promise<CognitiveFeedback>;
    convertFeedbackFormat(feedback: CognitiveFeedback, format: FeedbackFormat): Promise<CognitiveFeedback>;
}
//# sourceMappingURL=feedback-formatting-service.d.ts.map