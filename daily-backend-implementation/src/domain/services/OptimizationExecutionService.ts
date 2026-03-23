import { UUID } from '../value-objects/UUID';
import { Optimization } from '../entities/Optimization';

export interface OptimizationExecutionService {
  /**
   * 执行优化建议
   */
  executeOptimization(suggestionId: UUID): Promise<Optimization>;

  /**
   * 获取优化执行详情
   */
  getOptimizationById(id: UUID): Promise<Optimization | null>;

  /**
   * 获取建议的优化执行记录
   */
  getOptimizationsBySuggestion(suggestionId: UUID): Promise<Optimization[]>;

  /**
   * 获取项目的优化执行记录
   */
  getOptimizationsByProject(projectId: string): Promise<Optimization[]>;

  /**
   * 批量执行优化建议
   */
  batchExecuteOptimizations(suggestionIds: UUID[]): Promise<Optimization[]>;

  /**
   * 回滚优化
   */
  rollbackOptimization(id: UUID): Promise<Optimization>;

  /**
   * 验证优化执行
   */
  validateOptimization(id: UUID): Promise<Optimization>;

  /**
   * 获取优化执行状态
   */
  getOptimizationStatus(id: UUID): Promise<string>;

  /**
   * 取消优化执行
   */
  cancelOptimization(id: UUID): Promise<boolean>;
}
