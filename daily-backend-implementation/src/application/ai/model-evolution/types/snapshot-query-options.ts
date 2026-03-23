import { SnapshotType } from './model-snapshot';

/**
 * 快照查询选项
 */
export interface SnapshotQueryOptions {
  /**
   * 快照类型过滤
   */
  types?: SnapshotType[];
  /**
   * 开始时间
   */
  startTime?: Date;
  /**
   * 结束时间
   */
  endTime?: Date;
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
}