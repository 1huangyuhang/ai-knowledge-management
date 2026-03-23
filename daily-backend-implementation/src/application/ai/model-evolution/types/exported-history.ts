import { ModelEvolutionEvent } from './model-evolution-event';
import { ModelSnapshot } from './model-snapshot';
import { EvolutionStatistics } from './evolution-statistics';

/**
 * 导出历史
 */
export interface ExportedHistory {
  /**
   * 导出ID
   */
  exportId: string;
  /**
   * 导出时间
   */
  exportTime: Date;
  /**
   * 导出格式
   */
  format: string;
  /**
   * 导出的用户ID
   */
  userId: string;
  /**
   * 导出的事件数量
   */
  eventCount: number;
  /**
   * 导出的快照数量
   */
  snapshotCount: number;
  /**
   * 数据大小（字节）
   */
  dataSize: number;
  /**
   * 演化事件数据
   */
  events?: ModelEvolutionEvent[];
  /**
   * 模型快照数据
   */
  snapshots?: ModelSnapshot[];
  /**
   * 演化统计信息
   */
  statistics?: EvolutionStatistics;
  /**
   * 导出元数据
   */
  metadata: {
    /**
     * 系统版本
     */
    systemVersion: string;
    /**
     * 导出配置
     */
    exportConfig: {
      /**
       * 是否包含事件
       */
      includeEvents: boolean;
      /**
       * 是否包含快照
       */
      includeSnapshots: boolean;
      /**
       * 是否包含统计信息
       */
      includeStatistics: boolean;
      /**
       * 时间范围
       */
      timeRange?: {
        /**
         * 开始时间
         */
        startTime?: Date;
        /**
         * 结束时间
         */
        endTime?: Date;
      };
    };
  };
}