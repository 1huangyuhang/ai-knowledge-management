import { ModelEvolutionEventType } from './model-evolution-event';

/**
 * 导出选项
 */
export interface ExportOptions {
  /**
   * 是否包含事件数据
   */
  includeEvents: boolean;
  /**
   * 是否包含快照数据
   */
  includeSnapshots: boolean;
  /**
   * 事件类型过滤
   */
  eventTypes?: ModelEvolutionEventType[];
  /**
   * 开始时间
   */
  startTime?: Date;
  /**
   * 结束时间
   */
  endTime?: Date;
  /**
   * 是否包含统计信息
   */
  includeStatistics: boolean;
  /**
   * 是否包含版本差异
   */
  includeVersionDiffs: boolean;
  /**
   * 版本范围
   */
  versionRange?: {
    /**
     * 起始版本
     */
    fromVersion?: string;
    /**
     * 结束版本
     */
    toVersion?: string;
  };
}