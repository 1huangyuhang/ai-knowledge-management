/**
 * 更新历史服务实现类
 * 负责记录和管理模型更新历史
 */
import { UpdateHistoryService } from '../interfaces/model-update.interface';
import { ModelUpdateRecord } from '../types/model-update.types';

export class UpdateHistoryServiceImpl implements UpdateHistoryService {
  private updateHistoryRepository: any;

  /**
   * 构造函数
   * @param updateHistoryRepository 更新历史仓库
   */
  constructor(updateHistoryRepository: any) {
    this.updateHistoryRepository = updateHistoryRepository;
  }

  /**
   * 记录模型更新历史
   * @param updateRecord 更新记录
   * @returns 记录结果
   */
  async recordUpdate(updateRecord: ModelUpdateRecord): Promise<boolean> {
    try {
      await this.updateHistoryRepository.save(updateRecord);
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
  async getUpdateHistory(userId: string, options?: any): Promise<ModelUpdateRecord[]> {
    try {
      // 构建查询条件
      const query = {
        userId,
        ...(options?.startTime && { timestamp: { $gte: options.startTime } }),
        ...(options?.endTime && { timestamp: { ...(query?.timestamp || {}), $lte: options.endTime } }),
        ...(options?.updateType && { updateType: options.updateType }),
        ...(options?.source && { source: options.source })
      };

      // 构建分页选项
      const pagination = {
        page: options?.page || 1,
        limit: options?.limit || 10
      };

      // 执行查询
      const result = await this.updateHistoryRepository.find(query, pagination);
      return result;
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
  async getModelByVersion(userId: string, versionId: string): Promise<any | null> {
    try {
      // 1. 查找包含该版本的更新记录
      const updateRecord = await this.updateHistoryRepository.findOne({
        userId,
        $or: [
          { fromVersion: versionId },
          { toVersion: versionId }
        ]
      });

      if (!updateRecord) {
        return null;
      }

      // 2. 根据更新记录获取模型
      // 这里需要与认知模型仓库交互，获取特定版本的模型
      // 实际实现中可能需要版本存储或快照机制
      // 简化实现，返回当前模型
      return await this.updateHistoryRepository.getModelByVersion(userId, versionId);
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
  async cleanupOldHistory(userId: string, retentionPolicy: any): Promise<number> {
    try {
      // 计算保留的时间界限
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionPolicy.retentionDays);

      // 构建查询条件
      const query = {
        userId,
        timestamp: { $lt: cutoffDate }
      };

      // 如果需要保留最新版本，先获取最新版本
      if (retentionPolicy.keepLatestVersion) {
        const latestRecord = await this.updateHistoryRepository.findOne({
          userId
        }, {
          sort: { timestamp: -1 }
        });

        if (latestRecord) {
          // 确保不删除最新版本的记录
          query.$and = [
            query.$and || [],
            {
              $not: {
                toVersion: latestRecord.toVersion
              }
            }
          ];
        }
      }

      // 执行清理
      const result = await this.updateHistoryRepository.deleteMany(query);
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Failed to cleanup old history:', error);
      return 0;
    }
  }
}