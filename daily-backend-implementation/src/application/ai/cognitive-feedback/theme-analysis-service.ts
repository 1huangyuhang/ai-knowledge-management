/**
 * 主题分析服务接口
 */
export interface ThemeAnalysisService {
  /**
   * 分析认知模型的主题
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param options 主题分析选项
   * @returns 主题分析结果
   */
  analyzeThemes(
    userId: string,
    modelId: string,
    options?: ThemeAnalysisOptions
  ): Promise<ThemeAnalysisResult>;

  /**
   * 从概念生成主题
   * @param concepts 概念列表
   * @param options 主题分析选项
   * @returns 生成的主题列表
   */
  generateThemesFromConcepts(
    concepts: any[],
    options?: ThemeAnalysisOptions
  ): Theme[];

  /**
   * 从关系生成主题
   * @param relations 关系列表
   * @param concepts 概念列表
   * @param options 主题分析选项
   * @returns 生成的主题列表
   */
  generateThemesFromRelations(
    relations: any[],
    concepts: any[],
    options?: ThemeAnalysisOptions
  ): Theme[];

  /**
   * 获取主题分布
   * @param themes 主题列表
   * @returns 主题分布数据
   */
  getThemeDistribution(themes: Theme[]): Record<string, number>;

  /**
   * 识别主导主题
   * @param themes 主题列表
   * @returns 主导主题
   */
  identifyDominantTheme(themes: Theme[]): Theme | null;
}

/**
 * 主题分析选项
 */
export interface ThemeAnalysisOptions {
  /**
   * 最大主题数量
   */
  maxThemes?: number;
  /**
   * 主题强度阈值
   */
  themeStrengthThreshold?: number;
  /**
   * 是否包含相关概念
   */
  includeRelatedConcepts?: boolean;
  /**
   * 是否包含主题分布
   */
  includeThemeDistribution?: boolean;
  /**
   * 是否识别主导主题
   */
  identifyDominantTheme?: boolean;
}

/**
 * 主题
 */
export interface Theme {
  /**
   * 主题ID
   */
  id: string;
  /**
   * 主题名称
   */
  name: string;
  /**
   * 主题描述
   */
  description: string;
  /**
   * 主题强度
   */
  strength: number;
  /**
   * 相关概念
   */
  relatedConcepts: string[];
  /**
   * 主题类型
   */
  type: string;
  /**
   * 主题关键词
   */
  keywords: string[];
}

/**
 * 主题分析结果
 */
export interface ThemeAnalysisResult {
  /**
   * 分析ID
   */
  id: string;
  /**
   * 主题列表
   */
  themes: Theme[];
  /**
   * 主题分布
   */
  themeDistribution: Record<string, number>;
  /**
   * 主导主题
   */
  dominantTheme: Theme | null;
  /**
   * 分析摘要
   */
  summary: string;
  /**
   * 分析建议
   */
  recommendations: string[];
  /**
   * 创建时间
   */
  createdAt: Date;
}
