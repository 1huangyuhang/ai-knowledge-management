import { ModelEvolutionEvent } from './types/model-evolution-event';
import { ModelSnapshot } from './types/model-snapshot';
import { ModelVersionDiff } from './types/model-version-diff';
import { EvolutionHistoryQueryOptions } from './types/evolution-history-query-options';
import { HistoryRetentionPolicy } from './types/history-retention-policy';
import { HistoryCleanupResult } from './types/history-cleanup-result';
import { ExportFormat } from './types/export-format';
import { ExportOptions } from './types/export-options';
import { ExportedHistory } from './types/exported-history';
import { TimeRange } from './types/time-range';
import { EvolutionStatistics } from './types/evolution-statistics';

/**
 * 演化历史记录服务接口
 * 负责记录和管理模型演化历史
 */
export interface EvolutionHistoryService {
  /**
   * 记录模型演化事件
   * @param event 演化事件
   * @returns 记录结果
   */
  recordEvolutionEvent(event: ModelEvolutionEvent): Promise<boolean>;

  /**
   * 获取模型演化历史
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 演化事件列表
   */
  getEvolutionHistory(userId: string, options?: EvolutionHistoryQueryOptions): Promise<ModelEvolutionEvent[]>;

  /**
   * 获取特定版本的模型快照
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 模型快照
   */
  getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null>;

  /**
   * 获取模型版本之间的差异
   * @param userId 用户ID
   * @param fromVersion 起始版本
   * @param toVersion 结束版本
   * @returns 版本差异
   */
  getVersionDiff(userId: string, fromVersion: string, toVersion: string): Promise<ModelVersionDiff>;

  /**
   * 清理旧的演化历史
   * @param userId 用户ID
   * @param retentionPolicy 保留策略
   * @returns 清理结果
   */
  cleanupOldHistory(userId: string, retentionPolicy: HistoryRetentionPolicy): Promise<HistoryCleanupResult>;

  /**
   * 导出演化历史
   * @param userId 用户ID
   * @param format 导出格式
   * @param options 导出选项
   * @returns 导出数据
   */
  exportEvolutionHistory(userId: string, format: ExportFormat, options?: ExportOptions): Promise<ExportedHistory>;

  /**
   * 获取模型演化统计信息
   * @param userId 用户ID
   * @param timeRange 时间范围
   * @returns 统计信息
   */
  getEvolutionStatistics(userId: string, timeRange: TimeRange): Promise<EvolutionStatistics>;
}