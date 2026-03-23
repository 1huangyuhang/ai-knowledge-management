/**
 * 性能优化仓库实现（内存版本）
 * 用于管理性能优化相关数据的持久化操作
 */
import { 
  PerformanceBaseline, 
  OptimizationResult,
  OptimizationType,
  OptimizationStatus
} from '../../domain/entities/PerformanceOptimization';
import { PerformanceOptimizationRepository } from '../../domain/repositories/PerformanceOptimizationRepository';
import { LoggerService } from '../logging/LoggerService';

/**
 * 性能优化仓库实现（内存版本）
 */
export class PerformanceOptimizationRepositoryImpl implements PerformanceOptimizationRepository {
  private readonly performanceBaselines: Map<string, PerformanceBaseline> = new Map();
  private readonly optimizationResults: Map<string, OptimizationResult> = new Map();

  constructor(private readonly logger: LoggerService) {}

  /**
   * 保存性能基线
   */
  async savePerformanceBaseline(baseline: PerformanceBaseline): Promise<PerformanceBaseline> {
    this.logger.info('Saving performance baseline', { baselineId: baseline.id });
    this.performanceBaselines.set(baseline.id, baseline);
    return baseline;
  }

  /**
   * 获取性能基线
   */
  async getPerformanceBaseline(id: string): Promise<PerformanceBaseline | null> {
    this.logger.info('Getting performance baseline', { baselineId: id });
    return this.performanceBaselines.get(id) || null;
  }

  /**
   * 获取所有性能基线
   */
  async getAllPerformanceBaselines(limit: number, offset: number): Promise<PerformanceBaseline[]> {
    this.logger.info('Getting all performance baselines', { limit, offset });
    return Array.from(this.performanceBaselines.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  /**
   * 获取最新性能基线
   */
  async getLatestPerformanceBaseline(): Promise<PerformanceBaseline | null> {
    this.logger.info('Getting latest performance baseline');
    const baselines = Array.from(this.performanceBaselines.values());
    if (baselines.length === 0) {
      return null;
    }
    return baselines.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  /**
   * 保存优化结果
   */
  async saveOptimizationResult(result: OptimizationResult): Promise<OptimizationResult> {
    this.logger.info('Saving optimization result', { resultId: result.id });
    this.optimizationResults.set(result.id, result);
    return result;
  }

  /**
   * 获取优化结果
   */
  async getOptimizationResult(id: string): Promise<OptimizationResult | null> {
    this.logger.info('Getting optimization result', { resultId: id });
    return this.optimizationResults.get(id) || null;
  }

  /**
   * 获取所有优化结果
   */
  async getAllOptimizationResults(limit: number, offset: number): Promise<OptimizationResult[]> {
    this.logger.info('Getting all optimization results', { limit, offset });
    return Array.from(this.optimizationResults.values())
      .sort((a, b) => {
        const endTimeA = a.endTime?.getTime() || 0;
        const endTimeB = b.endTime?.getTime() || 0;
        return endTimeB - endTimeA;
      })
      .slice(offset, offset + limit);
  }

  /**
   * 按类型获取优化结果
   */
  async getOptimizationResultsByType(type: OptimizationType, limit: number, offset: number): Promise<OptimizationResult[]> {
    this.logger.info('Getting optimization results by type', { type, limit, offset });
    return Array.from(this.optimizationResults.values())
      .filter(result => result.type === type)
      .sort((a, b) => {
        const endTimeA = a.endTime?.getTime() || 0;
        const endTimeB = b.endTime?.getTime() || 0;
        return endTimeB - endTimeA;
      })
      .slice(offset, offset + limit);
  }

  /**
   * 更新优化结果状态
   */
  async updateOptimizationStatus(id: string, status: string): Promise<OptimizationResult | null> {
    this.logger.info('Updating optimization status', { resultId: id, status });
    const result = this.optimizationResults.get(id);
    if (!result) {
      return null;
    }

    const updatedResult: OptimizationResult = {
      ...result,
      status: status as OptimizationStatus,
      endTime: new Date()
    };

    this.optimizationResults.set(id, updatedResult);
    return updatedResult;
  }

  /**
   * 删除优化结果
   */
  async deleteOptimizationResult(id: string): Promise<boolean> {
    this.logger.info('Deleting optimization result', { resultId: id });
    return this.optimizationResults.delete(id);
  }

  /**
   * 删除性能基线
   */
  async deletePerformanceBaseline(id: string): Promise<boolean> {
    this.logger.info('Deleting performance baseline', { baselineId: id });
    return this.performanceBaselines.delete(id);
  }

  /**
   * 清除旧的性能数据
   */
  async cleanupOldData(days: number): Promise<number> {
    this.logger.info('Cleaning up old performance data', { days });
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let deletedCount = 0;

    // 清理旧的性能基线
    for (const [id, baseline] of this.performanceBaselines.entries()) {
      if (baseline.createdAt < cutoffDate) {
        this.performanceBaselines.delete(id);
        deletedCount++;
      }
    }

    // 清理旧的优化结果
    for (const [id, result] of this.optimizationResults.entries()) {
      const endTime = result.endTime || result.startTime;
      if (endTime < cutoffDate) {
        this.optimizationResults.delete(id);
        deletedCount++;
      }
    }

    this.logger.info('Cleanup completed', { deletedCount });
    return deletedCount;
  }
}
