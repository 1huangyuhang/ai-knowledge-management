import { UUID } from '../value-objects/UUID';
import { OptimizationSuggestion } from '../entities/OptimizationSuggestion';
import { CodeAnalysis } from '../entities/CodeAnalysis';

export interface OptimizationSuggestionService {
  /**
   * 为代码分析生成优化建议
   */
  generateSuggestions(analysisId: UUID): Promise<OptimizationSuggestion[]>;

  /**
   * 获取优化建议详情
   */
  getSuggestionById(id: UUID): Promise<OptimizationSuggestion | null>;

  /**
   * 获取分析的优化建议列表
   */
  getSuggestionsByAnalysis(analysisId: UUID): Promise<OptimizationSuggestion[]>;

  /**
   * 获取项目的优化建议列表
   */
  getSuggestionsByProject(projectId: string): Promise<OptimizationSuggestion[]>;

  /**
   * 根据类型过滤优化建议
   */
  getSuggestionsByType(type: string, projectId?: string): Promise<OptimizationSuggestion[]>;

  /**
   * 根据影响程度排序优化建议
   */
  getSuggestionsByImpact(threshold?: number, projectId?: string): Promise<OptimizationSuggestion[]>;

  /**
   * 删除优化建议
   */
  deleteSuggestion(id: UUID): Promise<boolean>;

  /**
   * 批量生成优化建议
   */
  batchGenerateSuggestions(analysisIds: UUID[]): Promise<Map<UUID, OptimizationSuggestion[]>>;
}
