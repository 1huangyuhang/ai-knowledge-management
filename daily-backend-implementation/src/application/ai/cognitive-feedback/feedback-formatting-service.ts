/**
 * 反馈格式化服务接口
 * 用于将认知反馈结果格式化为不同格式
 */
import { CognitiveFeedback, FeedbackFormat, FeedbackFormattingOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { CognitiveInsight } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { ThemeAnalysisResult } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { BlindspotDetectionResult } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { GapIdentificationResult } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';

/**
 * 反馈格式化服务接口
 */
export interface FeedbackFormattingService {
  /**
   * 格式化认知洞察为反馈
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param insights 认知洞察列表
   * @param options 格式化选项
   * @returns 格式化后的反馈
   */
  formatInsightsAsFeedback(
    userId: string,
    modelId: string,
    insights: CognitiveInsight[],
    options: FeedbackFormattingOptions
  ): Promise<CognitiveFeedback>;

  /**
   * 格式化主题分析结果为反馈
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param themeAnalysisResult 主题分析结果
   * @param options 格式化选项
   * @returns 格式化后的反馈
   */
  formatThemeAnalysisAsFeedback(
    userId: string,
    modelId: string,
    themeAnalysisResult: ThemeAnalysisResult,
    options: FeedbackFormattingOptions
  ): Promise<CognitiveFeedback>;

  /**
   * 格式化盲点检测结果为反馈
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param blindspotDetectionResult 盲点检测结果
   * @param options 格式化选项
   * @returns 格式化后的反馈
   */
  formatBlindspotDetectionAsFeedback(
    userId: string,
    modelId: string,
    blindspotDetectionResult: BlindspotDetectionResult,
    options: FeedbackFormattingOptions
  ): Promise<CognitiveFeedback>;

  /**
   * 格式化差距识别结果为反馈
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param gapIdentificationResult 差距识别结果
   * @param options 格式化选项
   * @returns 格式化后的反馈
   */
  formatGapIdentificationAsFeedback(
    userId: string,
    modelId: string,
    gapIdentificationResult: GapIdentificationResult,
    options: FeedbackFormattingOptions
  ): Promise<CognitiveFeedback>;

  /**
   * 格式化综合反馈
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param insights 认知洞察列表
   * @param themeAnalysisResult 主题分析结果
   * @param blindspotDetectionResult 盲点检测结果
   * @param gapIdentificationResult 差距识别结果
   * @param options 格式化选项
   * @returns 格式化后的综合反馈
   */
  formatComprehensiveFeedback(
    userId: string,
    modelId: string,
    insights: CognitiveInsight[],
    themeAnalysisResult: ThemeAnalysisResult,
    blindspotDetectionResult: BlindspotDetectionResult,
    gapIdentificationResult: GapIdentificationResult,
    options: FeedbackFormattingOptions
  ): Promise<CognitiveFeedback>;

  /**
   * 将反馈转换为不同格式
   * @param feedback 认知反馈
   * @param format 目标格式
   * @returns 转换后的反馈
   */
  convertFeedbackFormat(feedback: CognitiveFeedback, format: FeedbackFormat): Promise<CognitiveFeedback>;
}
