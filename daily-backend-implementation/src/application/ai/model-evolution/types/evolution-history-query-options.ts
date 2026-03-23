import { ModelEvolutionEventType } from './model-evolution-event';

/**
 * 演化历史查询选项
 */
export interface EvolutionHistoryQueryOptions {
  /**
   * 开始时间
   */
  startTime?: Date;
  /**
   * 结束时间
   */
  endTime?: Date;
  /**
   * 事件类型过滤
   */
  eventTypes?: ModelEvolutionEventType[];
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
  /**
   * 分页选项
   */
  pagination?: {
    /**
     * 页码
     */
    page: number;
    /**
     * 每页数量
     */
    pageSize: number;
  };
  /**
   * 排序选项
   */
  sort?: {
    /**
     * 排序字段
     */
    field: string;
    /**
     * 排序方向
     */
    direction: 'asc' | 'desc';
  };
  /**
   * 相关概念ID过滤
   */
  conceptIds?: string[];
  /**
   * 相关关系ID过滤
   */
  relationIds?: string[];
}