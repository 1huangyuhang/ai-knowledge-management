/**
 * 更新历史服务实现类
 * 负责记录和管理模型更新历史
 */
import { UpdateHistoryService } from './interfaces/model-update-service.interface';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { ModelSnapshotService } from './model-snapshot-service';
import { ModelUpdateRecord, UpdateHistoryQueryOptions, HistoryRetentionPolicy } from './types/model-update.types';
import { ModelSnapshot } from './types/model-snapshot';
import { ModelUpdateType } from './types/model-update.types';
import { UserCognitiveModel } from '../../../domain/entities/user-cognitive-model';

export class UpdateHistoryServiceImpl implements UpdateHistoryService {
  private cognitiveModelRepository: CognitiveModelRepository;
  private modelSnapshotService: ModelSnapshotService;

  /**
   * 构造函数
   * @param cognitiveModelRepository 认知模型仓库
   * @param modelSnapshotService 模型快照服务
   */
  constructor(
    cognitiveModelRepository: CognitiveModelRepository,
    modelSnapshotService: ModelSnapshotService
  ) {
    this.cognitiveModelRepository = cognitiveModelRepository;
    this.modelSnapshotService = modelSnapshotService;
  }

  /**
   * 记录模型更新历史
   * @param updateRecord 更新记录
   * @returns 记录结果
   */
  async recordUpdate(updateRecord: ModelUpdateRecord): Promise<boolean> {
    try {
      // 1. 获取当前模型
      const currentModel = await this.cognitiveModelRepository.getById(updateRecord.userId);
      if (!currentModel) {
        throw new Error(`Cognitive model not found for user: ${updateRecord.userId}`);
      }

      // 2. 创建模型快照
      await this.modelSnapshotService.createSnapshot(
        updateRecord.userId,
        currentModel,
        updateRecord.toVersion
      );

      // 3. 这里可以添加将更新记录保存到数据库的逻辑
      // 例如：await this.updateHistoryRepository.save(updateRecord);

      return true;
    } catch (error) {
      console.error('Failed to record update history:', error);
      return false;
    }
  }

  /**
   * 获取模型更新历史
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 更新历史列表
   */
  async getUpdateHistory(userId: string, options?: UpdateHistoryQueryOptions): Promise<ModelUpdateRecord[]> {
    try {
      // 1. 这里可以添加从数据库获取更新历史的逻辑
      // 例如：const records = await this.updateHistoryRepository.findByUserId(userId, options);
      
      // 暂时返回空数组，实际项目中需要实现数据库查询
      return [];
    } catch (error) {
      console.error('Failed to get update history:', error);
      return [];
    }
  }

  /**
   * 获取特定版本的模型
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 特定版本的模型
   */
  async getModelByVersion(userId: string, versionId: string): Promise<UserCognitiveModel | null> {
    try {
      // 1. 获取模型快照
      const snapshot = await this.modelSnapshotService.getSnapshot(userId, versionId);
      if (!snapshot) {
        return null;
      }

      // 2. 恢复模型
      return snapshot.model;
    } catch (error) {
      console.error('Failed to get model by version:', error);
      return null;
    }
  }

  /**
   * 清理旧的更新历史
   * @param userId 用户ID
   * @param retentionPolicy 保留策略
   * @returns 清理结果
   */
  async cleanupOldHistory(userId: string, retentionPolicy: HistoryRetentionPolicy): Promise<number> {
    try {
      // 1. 计算清理日期
      const cleanupDate = new Date();
      cleanupDate.setDate(cleanupDate.getDate() - retentionPolicy.retentionDays);

      // 2. 获取所有快照
      const snapshots = await this.modelSnapshotService.getSnapshots(userId);
      let cleanedCount = 0;

      // 3. 清理旧快照
      for (const snapshot of snapshots) {
        // 跳过最新版本
        if (retentionPolicy.keepLatestVersion && snapshot.isLatest) {
          continue;
        }

        // 跳过关键更新（这里可以根据业务逻辑判断）
        if (retentionPolicy.keepCriticalUpdates && this.isCriticalUpdate(snapshot)) {
          continue;
        }

        // 清理指定日期之前的快照
        if (snapshot.createdAt < cleanupDate) {
          await this.modelSnapshotService.deleteSnapshot(userId, snapshot.id);
          cleanedCount++;
        }
      }

      // 4. 清理旧的更新记录（这里可以添加清理数据库记录的逻辑）
      // 例如：await this.updateHistoryRepository.deleteBeforeDate(userId, cleanupDate);

      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup old history:', error);
      return 0;
    }
  }

  /**
   * 判断是否为关键更新
   * @param snapshot 模型快照
   * @returns 是否为关键更新
   */
  private isCriticalUpdate(snapshot: ModelSnapshot): boolean {
    // 这里可以添加判断关键更新的逻辑
    // 例如：根据快照的更新类型、影响范围等判断
    return snapshot.updateType === ModelUpdateType.FULL || 
           snapshot.updateType === ModelUpdateType.RESTRUCTURE;
  }
}
