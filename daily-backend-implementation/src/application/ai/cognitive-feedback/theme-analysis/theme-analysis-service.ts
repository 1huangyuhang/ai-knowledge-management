/**
 * 主题分析服务接口定义
 */
import {
  ThemeAnalysisResult,
  Theme,
  ThemeAnalysisOptions
} from '@/domain/ai/cognitive-feedback/cognitive-feedback';

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
   * 获取指定主题的详细信息
   * @param userId 用户ID
   * @param themeId 主题ID
   * @returns 主题详情
   */
  getThemeById(
    userId: string,
    themeId: string
  ): Promise<Theme | null>;

  /**
   * 获取认知模型的主题列表
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @returns 主题列表
   */
  getThemesByModelId(
    userId: string,
    modelId: string
  ): Promise<Theme[]>;

  /**
   * 分析概念的主题关联
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param conceptId 概念ID
   * @returns 主题列表
   */
  analyzeConceptThemes(
    userId: string,
    modelId: string,
    conceptId: string
  ): Promise<Theme[]>;

  /**
   * 分析关系的主题关联
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param relationId 关系ID
   * @returns 主题列表
   */
  analyzeRelationThemes(
    userId: string,
    modelId: string,
    relationId: string
  ): Promise<Theme[]>;
}