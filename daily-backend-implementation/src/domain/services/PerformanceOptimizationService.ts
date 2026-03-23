/**
 * 性能优化服务接口
 * 定义性能优化模块的核心业务逻辑
 */
import { 
  OptimizationType, 
  OptimizationConfig, 
  PerformanceBaseline, 
  OptimizationResult, 
  OptimizationStatus,
  OptimizationMetric 
} from '../entities/PerformanceOptimization';

/**
 * 性能优化服务接口
 */
export interface PerformanceOptimizationService {
  /**
   * 创建性能基线
   * @returns 性能基线
   */
  createPerformanceBaseline(): Promise<PerformanceBaseline>;

  /**
   * 获取当前性能基线
   * @returns 性能基线
   */
  getCurrentPerformanceBaseline(): Promise<PerformanceBaseline | null>;

  /**
   * 获取性能基线历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 性能基线列表
   */
  getPerformanceBaselineHistory(limit: number, offset: number): Promise<PerformanceBaseline[]>;

  /**
   * 执行性能优化
   * @param type 优化类型
   * @param config 优化配置
   * @returns 优化结果
   */
  executeOptimization(type: OptimizationType, config: OptimizationConfig): Promise<OptimizationResult>;

  /**
   * 批量执行性能优化
   * @param optimizations 优化配置列表
   * @returns 优化结果列表
   */
  executeBulkOptimization(optimizations: Array<{ type: OptimizationType; config: OptimizationConfig }>): Promise<OptimizationResult[]>;

  /**
   * 获取优化结果
   * @param id 优化ID
   * @returns 优化结果
   */
  getOptimizationResult(id: string): Promise<OptimizationResult | null>;

  /**
   * 获取优化结果历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 优化结果列表
   */
  getOptimizationResultHistory(limit: number, offset: number): Promise<OptimizationResult[]>;

  /**
   * 获取优化结果历史（按类型）
   * @param type 优化类型
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 优化结果列表
   */
  getOptimizationResultsByType(type: OptimizationType, limit: number, offset: number): Promise<OptimizationResult[]>;

  /**
   * 更新优化配置
   * @param id 优化ID
   * @param config 优化配置
   * @returns 优化结果
   */
  updateOptimizationConfig(id: string, config: OptimizationConfig): Promise<OptimizationResult | null>;

  /**
   * 获取优化状态
   * @param id 优化ID
   * @returns 优化状态
   */
  getOptimizationStatus(id: string): Promise<OptimizationStatus | null>;

  /**
   * 取消优化
   * @param id 优化ID
   * @returns 是否取消成功
   */
  cancelOptimization(id: string): Promise<boolean>;

  /**
   * 获取系统性能指标
   * @returns 性能指标列表
   */
  getSystemMetrics(): Promise<OptimizationMetric[]>;

  /**
   * 获取优化建议
   * @returns 优化建议列表
   */
  getOptimizationSuggestions(): Promise<Array<{ type: OptimizationType; recommendation: string; priority: number }>>;

  /**
   * 验证优化配置
   * @param type 优化类型
   * @param config 优化配置
   * @returns 是否验证通过
   */
  validateOptimizationConfig(type: OptimizationType, config: OptimizationConfig): Promise<boolean>;

  /**
   * 重置优化
   * @param id 优化ID
   * @returns 是否重置成功
   */
  resetOptimization(id: string): Promise<boolean>;

  /**
   * 批量重置优化
   * @param ids 优化ID列表
   * @returns 重置结果映射
   */
  resetBulkOptimization(ids: string[]): Promise<Record<string, boolean>>;
}
