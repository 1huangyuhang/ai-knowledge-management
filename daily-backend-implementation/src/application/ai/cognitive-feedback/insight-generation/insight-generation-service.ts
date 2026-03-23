/**
 * 洞察生成服务接口定义
 */
import {
  CognitiveInsight,
  CognitiveInsightType,
  InsightGenerationOptions
} from '@/domain/ai/cognitive-feedback/cognitive-feedback';

/**
 * 洞察生成服务接口
 */
export interface InsightGenerationService {
  /**
   * 生成认知洞察
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param options 洞察生成选项
   * @returns 认知洞察列表
   */
  generateInsights(
    userId: string,
    modelId: string,
    options?: InsightGenerationOptions
  ): Promise<CognitiveInsight[]>;

  /**
   * 生成概念洞察
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param conceptIds 概念ID列表
   * @returns 概念洞察列表
   */
  generateConceptInsights(
    userId: string,
    modelId: string,
    conceptIds: string[]
  ): Promise<CognitiveInsight[]>;

  /**
   * 生成关系洞察
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param relationIds 关系ID列表
   * @returns 关系洞察列表
   */
  generateRelationInsights(
    userId: string,
    modelId: string,
    relationIds: string[]
  ): Promise<CognitiveInsight[]>;

  /**
   * 生成结构洞察
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @returns 结构洞察列表
   */
  generateStructureInsights(
    userId: string,
    modelId: string
  ): Promise<CognitiveInsight[]>;

  /**
   * 生成演化洞察
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @returns 演化洞察列表
   */
  generateEvolutionInsights(
    userId: string,
    modelId: string
  ): Promise<CognitiveInsight[]>;

  /**
   * 获取用户的认知洞察
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param options 筛选选项
   * @returns 认知洞察列表
   */
  getInsights(
    userId: string,
    modelId: string,
    options?: {
      insightTypes?: CognitiveInsightType[];
      importanceThreshold?: number;
      confidenceThreshold?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<CognitiveInsight[]>;

  /**
   * 获取指定ID的认知洞察
   * @param userId 用户ID
   * @param insightId 洞察ID
   * @returns 认知洞察
   */
  getInsightById(
    userId: string,
    insightId: string
  ): Promise<CognitiveInsight | null>;

  /**
   * 更新认知洞察
   * @param userId 用户ID
   * @param insightId 洞察ID
   * @param updateData 更新数据
   * @returns 更新后的认知洞察
   */
  updateInsight(
    userId: string,
    insightId: string,
    updateData: Partial<CognitiveInsight>
  ): Promise<CognitiveInsight>;

  /**
   * 删除认知洞察
   * @param userId 用户ID
   * @param insightId 洞察ID
   * @returns 删除结果
   */
  deleteInsight(
    userId: string,
    insightId: string
  ): Promise<boolean>;
}
