/**
 * 历史保留策略
 */
export interface HistoryRetentionPolicy {
  /**
   * 事件保留天数
   */
  eventRetentionDays: number;
  /**
   * 快照保留天数
   */
  snapshotRetentionDays: number;
  /**
   * 是否保留最新版本的快照
   */
  keepLatestSnapshots: boolean;
  /**
   * 保留的最新快照数量
   */
  latestSnapshotsToKeep: number;
  /**
   * 是否保留特定版本的快照
   */
  keepVersionedSnapshots: boolean;
  /**
   * 保留特定版本的策略
   */
  versionedRetentionPolicy?: {
    /**
     * 主版本号保留策略
     */
    majorVersions?: number;
    /**
     * 次版本号保留策略
     */
    minorVersionsPerMajor?: number;
  };
}