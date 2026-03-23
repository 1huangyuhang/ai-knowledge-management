/**
 * 洞察生成服务接口
 */
export interface InsightGenerationService {
  /**
   * 生成认知洞察
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param options 洞察生成选项
   * @returns 生成的认知洞察列表
   */
  generateInsights(
    userId: string,
    modelId: string,
    options?: InsightGenerationOptions
  ): Promise<CognitiveInsight[]>;

  /**
   * 从概念生成洞察
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param conceptIds 概念ID列表
   * @param options 洞察生成选项
   * @returns 生成的认知洞察列表
   */
  generateInsightsFromConcepts(
    userId: string,
    modelId: string,
    conceptIds: string[],
    options?: InsightGenerationOptions
  ): Promise<CognitiveInsight[]>;

  /**
   * 从关系生成洞察
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param relationIds 关系ID列表
   * @param options 洞察生成选项
   * @returns 生成的认知洞察列表
   */
  generateInsightsFromRelations(
    userId: string,
    modelId: string,
    relationIds: string[],
    options?: InsightGenerationOptions
  ): Promise<CognitiveInsight[]>;

  /**
   * 从演化数据生成洞察
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param evolutionData 演化数据
   * @param options 洞察生成选项
   * @returns 生成的认知洞察列表
   */
  generateInsightsFromEvolution(
    userId: string,
    modelId: string,
    evolutionData: any,
    options?: InsightGenerationOptions
  ): Promise<CognitiveInsight[]>;
}

/**
 * 洞察生成选项
 */
export interface InsightGenerationOptions {
  /**
   * 洞察类型
   */
  insightTypes?: CognitiveInsightType[];
  /**
   * 重要性阈值
   */
  importanceThreshold?: number;
  /**
   * 置信度阈值
   */
  confidenceThreshold?: number;
  /**
   * 最大洞察数量
   */
  maxInsights?: number;
  /**
   * 是否包含建议
   */
  includeSuggestions?: boolean;
}

/**
 * 认知洞察类型
 */
export enum CognitiveInsightType {
  /**
   * 概念洞察
   */
  CONCEPT_INSIGHT = 'CONCEPT_INSIGHT',
  /**
   * 关系洞察
   */
  RELATION_INSIGHT = 'RELATION_INSIGHT',
  /**
   * 结构洞察
   */
  STRUCTURE_INSIGHT = 'STRUCTURE_INSIGHT',
  /**
   * 演化洞察
   */
  EVOLUTION_INSIGHT = 'EVOLUTION_INSIGHT',
  /**
   * 主题洞察
   */
  THEME_INSIGHT = 'THEME_INSIGHT',
  /**
   * 盲点洞察
   */
  BLINDSPOT_INSIGHT = 'BLINDSPOT_INSIGHT',
  /**
   * 差距洞察
   */
  GAP_INSIGHT = 'GAP_INSIGHT'
}

/**
 * 认知洞察
 */
export interface CognitiveInsight {
  /**
   * 洞察ID
   */
  id: string;
  /**
   * 洞察类型
   */
  type: CognitiveInsightType;
  /**
   * 洞察标题
   */
  title: string;
  /**
   * 洞察描述
   */
  description: string;
  /**
   * 洞察重要性
   */
  importance: number;
  /**
   * 洞察置信度
   */
  confidence: number;
  /**
   * 相关概念ID列表
   */
  relatedConceptIds?: string[];
  /**
   * 相关关系ID列表
   */
  relatedRelationIds?: string[];
  /**
   * 建议
   */
  suggestions: string[];
  /**
   * 创建时间
   */
  createdAt: Date;
}
