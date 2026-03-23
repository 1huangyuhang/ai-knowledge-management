import { UserCognitiveModel } from '../../../domain/entities/cognitive-model';
import { ModelSnapshot } from './types/model-snapshot';
import { SnapshotQueryOptions } from './types/snapshot-query-options';
import { ModelSnapshotDiff } from './types/model-snapshot-diff';

/**
 * 模型快照服务接口
 * 负责管理模型的快照
 */
export interface ModelSnapshotService {
  /**
   * 创建模型快照
   * @param userId 用户ID
   * @param model 当前模型
   * @param versionId 版本ID
   * @returns 快照创建结果
   */
  createSnapshot(userId: string, model: UserCognitiveModel, versionId: string): Promise<ModelSnapshot>;

  /**
   * 获取模型快照
   * @param userId 用户ID
   * @param snapshotId 快照ID
   * @returns 模型快照
   */
  getSnapshot(userId: string, snapshotId: string): Promise<ModelSnapshot | null>;

  /**
   * 获取模型快照列表
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 快照列表
   */
  getSnapshots(userId: string, options?: SnapshotQueryOptions): Promise<ModelSnapshot[]>;

  /**
   * 删除模型快照
   * @param userId 用户ID
   * @param snapshotId 快照ID
   * @returns 删除结果
   */
  deleteSnapshot(userId: string, snapshotId: string): Promise<boolean>;

  /**
   * 比较两个模型快照
   * @param snapshot1 快照1
   * @param snapshot2 快照2
   * @returns 快照差异
   */
  compareSnapshots(snapshot1: ModelSnapshot, snapshot2: ModelSnapshot): Promise<ModelSnapshotDiff>;

  /**
   * 根据版本ID获取模型快照
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 模型快照
   */
  getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null>;
}