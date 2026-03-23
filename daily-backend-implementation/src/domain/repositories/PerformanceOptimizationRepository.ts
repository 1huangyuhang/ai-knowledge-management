/**
 * 性能优化仓库接口
 * 定义性能优化相关数据的持久化操作
 */
import { 
  PerformanceBaseline, 
  OptimizationResult,
  OptimizationType
} from '../entities/PerformanceOptimization';

/**
 * 性能优化仓库接口
 */
export interface PerformanceOptimizationRepository {
  /**
   * 保存性能基线
   * @param baseline 性能基线
   * @returns 保存后的性能基线
   */
  savePerformanceBaseline(baseline: PerformanceBaseline): Promise<PerformanceBaseline>;

  /**
   * 获取性能基线
   * @param id 基线ID
   * @returns 性能基线
   */
  getPerformanceBaseline(id: string): Promise<PerformanceBaseline | null>;

  /**
   * 获取所有性能基线
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 性能基线列表
   */
  getAllPerformanceBaselines(limit: number, offset: number): Promise<PerformanceBaseline[]>;

  /**
   * 获取最新性能基线
   * @returns 最新性能基线
   */
  getLatestPerformanceBaseline(): Promise<PerformanceBaseline | null>;

  /**
   * 保存优化结果
   * @param result 优化结果
   * @returns 保存后的优化结果
   */
  saveOptimizationResult(result: OptimizationResult): Promise<OptimizationResult>;

  /**
   * 获取优化结果
   * @param id 优化ID
   * @returns 优化结果
   */
  getOptimizationResult(id: string): Promise<OptimizationResult | null>;

  /**
   * 获取所有优化结果
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 优化结果列表
   */
  getAllOptimizationResults(limit: number, offset: number): Promise<OptimizationResult[]>;

  /**
   * 按类型获取优化结果
   * @param type 优化类型
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 优化结果列表
   */
  getOptimizationResultsByType(type: OptimizationType, limit: number, offset: number): Promise<OptimizationResult[]>;

  /**
   * 更新优化结果状态
   * @param id 优化ID
   * @param status 优化状态
   * @returns 更新后的优化结果
   */
  updateOptimizationStatus(id: string, status: string): Promise<OptimizationResult | null>;

  /**
   * 删除优化结果
   * @param id 优化ID
   * @returns 是否删除成功
   */
  deleteOptimizationResult(id: string): Promise<boolean>;

  /**
   * 删除性能基线
   * @param id 基线ID
   * @returns 是否删除成功
   */
  deletePerformanceBaseline(id: string): Promise<boolean>;

  /**
   * 清除旧的性能数据
   * @param days 保留天数
   * @returns 清除的记录数量
   */
  cleanupOldData(days: number): Promise<number>;
}
