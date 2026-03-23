/**
 * 盲点检测服务接口
 * 用于检测认知模型中的盲点
 */
import { Blindspot, BlindspotDetectionResult, BlindspotDetectionOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';

/**
 * 盲点检测服务接口
 */
export interface BlindspotDetectionService {
  /**
   * 检测认知模型中的盲点
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param options 检测选项
   * @returns 盲点检测结果
   */
  detectBlindspots(userId: string, modelId: string, options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;

  /**
   * 从主题中检测盲点
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param themeIds 主题ID列表
   * @param options 检测选项
   * @returns 盲点检测结果
   */
  detectBlindspotsFromThemes(userId: string, modelId: string, themeIds: string[], options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;

  /**
   * 从概念中检测盲点
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param conceptIds 概念ID列表
   * @param options 检测选项
   * @returns 盲点检测结果
   */
  detectBlindspotsFromConcepts(userId: string, modelId: string, conceptIds: string[], options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;

  /**
   * 检测特定类型的盲点
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param blindspotTypes 盲点类型列表
   * @param options 检测选项
   * @returns 盲点检测结果
   */
  detectBlindspotsByType(userId: string, modelId: string, blindspotTypes: string[], options?: BlindspotDetectionOptions): Promise<BlindspotDetectionResult>;

  /**
   * 分析盲点的影响
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param blindspotId 盲点ID
   * @returns 盲点影响分析
   */
  analyzeBlindspotImpact(userId: string, modelId: string, blindspotId: string): Promise<{ impact: number; potentialRisks: string[]; }>;
}
