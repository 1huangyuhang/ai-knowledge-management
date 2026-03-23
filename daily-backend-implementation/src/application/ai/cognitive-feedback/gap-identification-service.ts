/**
 * 差距识别服务接口
 * 用于识别认知模型中的差距
 */
import { Gap, GapIdentificationResult, GapIdentificationOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';

/**
 * 差距识别服务接口
 */
export interface GapIdentificationService {
  /**
   * 识别认知模型中的差距
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param options 识别选项
   * @returns 差距识别结果
   */
  identifyGaps(userId: string, modelId: string, options?: GapIdentificationOptions): Promise<GapIdentificationResult>;

  /**
   * 识别概念间的差距
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param conceptIds 概念ID列表
   * @param options 识别选项
   * @returns 差距识别结果
   */
  identifyGapsBetweenConcepts(userId: string, modelId: string, conceptIds: string[], options?: GapIdentificationOptions): Promise<GapIdentificationResult>;

  /**
   * 识别特定类型的差距
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param gapTypes 差距类型列表
   * @param options 识别选项
   * @returns 差距识别结果
   */
  identifyGapsByType(userId: string, modelId: string, gapTypes: string[], options?: GapIdentificationOptions): Promise<GapIdentificationResult>;

  /**
   * 识别与参考模型的差距
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param referenceModelId 参考模型ID
   * @param options 识别选项
   * @returns 差距识别结果
   */
  identifyGapsFromReferenceModel(userId: string, modelId: string, referenceModelId: string, options?: GapIdentificationOptions): Promise<GapIdentificationResult>;

  /**
   * 分析差距的影响
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param gapId 差距ID
   * @returns 差距影响分析
   */
  analyzeGapImpact(userId: string, modelId: string, gapId: string): Promise<{ size: number; improvementDirection: string; }>;
}
