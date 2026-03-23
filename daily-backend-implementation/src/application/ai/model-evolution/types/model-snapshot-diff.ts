import { ModelSnapshot } from './model-snapshot';
import { ModelVersionDiff } from './model-version-diff';

/**
 * 模型快照差异
 */
export interface ModelSnapshotDiff {
  /**
   * 差异ID
   */
  id: string;
  /**
   * 快照1信息
   */
  snapshot1: Pick<ModelSnapshot, 'id' | 'version' | 'createdAt'>;
  /**
   * 快照2信息
   */
  snapshot2: Pick<ModelSnapshot, 'id' | 'version' | 'createdAt'>;
  /**
   * 版本差异
   */
  versionDiff: ModelVersionDiff;
  /**
   * 差异计算时间
   */
  calculatedAt: Date;
}