/**
 * 快照类型
 */
export enum SnapshotType {
  /**
   * 自动创建的快照
   */
  AUTO = 'AUTO',
  /**
   * 用户手动创建的快照
   */
  MANUAL = 'MANUAL',
  /**
   * 版本化快照
   */
  VERSIONED = 'VERSIONED',
  /**
   * 备份快照
   */
  BACKUP = 'BACKUP'
}

/**
 * 模型快照
 */
export interface ModelSnapshot {
  /**
   * 快照ID
   */
  id: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 模型版本
   */
  version: string;
  /**
   * 快照创建时间
   */
  createdAt: Date;
  /**
   * 快照类型
   */
  type: SnapshotType;
  /**
   * 快照数据
   */
  data: {
    /**
     * 概念数量
     */
    conceptCount: number;
    /**
     * 关系数量
     */
    relationCount: number;
    /**
     * 模型大小（字节）
     */
    sizeInBytes: number;
    /**
     * 压缩后的模型数据
     */
    compressedModelData: string;
    /**
     * 模型哈希值（用于完整性校验）
     */
    modelHash: string;
  };
  /**
   * 快照元数据
   */
  metadata: {
    /**
     * 快照描述
     */
    description?: string;
    /**
     * 创建原因
     */
    creationReason?: string;
    /**
     * 系统版本
     */
    systemVersion: string;
  };
}