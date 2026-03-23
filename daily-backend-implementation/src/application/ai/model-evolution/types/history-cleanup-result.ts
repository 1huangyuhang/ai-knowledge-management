/**
 * 历史清理结果
 */
export interface HistoryCleanupResult {
  /**
   * 清理的事件数量
   */
  eventsCleaned: number;
  /**
   * 清理的快照数量
   */
  snapshotsCleaned: number;
  /**
   * 释放的存储空间（字节）
   */
  storageFreed: number;
  /**
   * 清理时间
   */
  cleanupTime: Date;
  /**
   * 清理前的事件数量
   */
  eventsBefore: number;
  /**
   * 清理前的快照数量
   */
  snapshotsBefore: number;
  /**
   * 清理后的事件数量
   */
  eventsAfter: number;
  /**
   * 清理后的快照数量
   */
  snapshotsAfter: number;
}