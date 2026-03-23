import { ModelEvolutionEventType } from './model-evolution-event';

/**
 * 演化事件统计
 */
export interface EvolutionEventStats {
  /**
   * 事件类型
   */
  eventType: ModelEvolutionEventType;
  /**
   * 事件数量
   */
  count: number;
  /**
   * 百分比
   */
  percentage: number;
}

/**
 * 概念统计
 */
export interface ConceptStats {
  /**
   * 总概念数
   */
  totalCount: number;
  /**
   * 新增概念数
   */
  addedCount: number;
  /**
   * 更新概念数
   */
  updatedCount: number;
  /**
   * 删除概念数
   */
  removedCount: number;
  /**
   * 概念增长率
   */
  growthRate: number;
}

/**
 * 关系统计
 */
export interface RelationStats {
  /**
   * 总关系数
   */
  totalCount: number;
  /**
   * 新增关系数
   */
  addedCount: number;
  /**
   * 更新关系数
   */
  updatedCount: number;
  /**
   * 删除关系数
   */
  removedCount: number;
  /**
   * 关系增长率
   */
  growthRate: number;
}

/**
 * 演化统计信息
 */
export interface EvolutionStatistics {
  /**
   * 统计ID
   */
  statsId: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 统计时间范围
   */
  timeRange: {
    /**
     * 开始时间
     */
    startTime: Date;
    /**
     * 结束时间
     */
    endTime: Date;
  };
  /**
   * 统计生成时间
   */
  generatedAt: Date;
  /**
   * 总事件数
   */
  totalEvents: number;
  /**
   * 事件类型统计
   */
  eventTypeStats: EvolutionEventStats[];
  /**
   * 版本数量
   */
  versionCount: number;
  /**
   * 快照数量
   */
  snapshotCount: number;
  /**
   * 概念统计
   */
  conceptStats: ConceptStats;
  /**
   * 关系统计
   */
  relationStats: RelationStats;
  /**
   * 平均变化频率（天）
   */
  averageChangeFrequency: number;
  /**
   * 最大连续无变化天数
   */
  maxDaysWithoutChange: number;
  /**
   * 模型复杂度趋势
   */
  modelComplexityTrend: {
    /**
     * 日期
     */
    date: Date;
    /**
     * 复杂度值
     */
    complexity: number;
  }[];
}