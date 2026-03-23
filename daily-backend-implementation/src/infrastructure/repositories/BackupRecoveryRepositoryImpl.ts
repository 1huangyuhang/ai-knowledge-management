/**
 * 备份恢复仓库实现
 * 基于内存的备份恢复模块数据持久化和查询操作实现
 */
import { BackupRecoveryRepository } from '../../domain/repositories/BackupRecoveryRepository';
import {
  BackupConfig,
  BackupTask,
  RestoreTask,
  BackupStorageConfig,
  BackupValidationResult,
  BackupCleanupTask,
  BackupType,
  BackupStatus,
  RestoreStatus
} from '../../domain/entities/BackupConfig';

export class BackupRecoveryRepositoryImpl implements BackupRecoveryRepository {
  // 内存存储
  private backupConfigs: Map<string, BackupConfig> = new Map();
  private backupTasks: Map<string, BackupTask> = new Map();
  private restoreTasks: Map<string, RestoreTask> = new Map();
  private backupStorageConfigs: Map<string, BackupStorageConfig> = new Map();
  private backupValidationResults: Map<string, BackupValidationResult> = new Map();
  private backupCleanupTasks: Map<string, BackupCleanupTask> = new Map();

  /**
   * 保存备份配置
   * @param config 备份配置
   * @returns 保存后的备份配置
   */
  async saveBackupConfig(config: BackupConfig): Promise<BackupConfig> {
    this.backupConfigs.set(config.id, config);
    return config;
  }

  /**
   * 获取备份配置列表
   * @returns 备份配置列表
   */
  async getBackupConfigs(): Promise<BackupConfig[]> {
    return Array.from(this.backupConfigs.values());
  }

  /**
   * 根据ID获取备份配置
   * @param configId 配置ID
   * @returns 备份配置
   */
  async getBackupConfigById(configId: string): Promise<BackupConfig | null> {
    return this.backupConfigs.get(configId) || null;
  }

  /**
   * 删除备份配置
   * @param configId 配置ID
   * @returns 删除结果
   */
  async deleteBackupConfig(configId: string): Promise<boolean> {
    return this.backupConfigs.delete(configId);
  }

  /**
   * 保存备份任务
   * @param task 备份任务
   * @returns 保存后的备份任务
   */
  async saveBackupTask(task: BackupTask): Promise<BackupTask> {
    this.backupTasks.set(task.id, task);
    return task;
  }

  /**
   * 获取备份任务列表
   * @returns 备份任务列表
   */
  async getBackupTasks(): Promise<BackupTask[]> {
    return Array.from(this.backupTasks.values());
  }

  /**
   * 根据ID获取备份任务
   * @param taskId 任务ID
   * @returns 备份任务
   */
  async getBackupTaskById(taskId: string): Promise<BackupTask | null> {
    return this.backupTasks.get(taskId) || null;
  }

  /**
   * 根据状态获取备份任务
   * @param status 备份状态
   * @returns 备份任务列表
   */
  async getBackupTasksByStatus(status: BackupStatus): Promise<BackupTask[]> {
    return Array.from(this.backupTasks.values())
      .filter(task => task.status === status);
  }

  /**
   * 根据配置ID获取备份任务
   * @param configId 配置ID
   * @returns 备份任务列表
   */
  async getBackupTasksByConfigId(configId: string): Promise<BackupTask[]> {
    return Array.from(this.backupTasks.values())
      .filter(task => task.backupConfigId === configId);
  }

  /**
   * 删除备份任务
   * @param taskId 任务ID
   * @returns 删除结果
   */
  async deleteBackupTask(taskId: string): Promise<boolean> {
    return this.backupTasks.delete(taskId);
  }

  /**
   * 保存恢复任务
   * @param task 恢复任务
   * @returns 保存后的恢复任务
   */
  async saveRestoreTask(task: RestoreTask): Promise<RestoreTask> {
    this.restoreTasks.set(task.id, task);
    return task;
  }

  /**
   * 获取恢复任务列表
   * @returns 恢复任务列表
   */
  async getRestoreTasks(): Promise<RestoreTask[]> {
    return Array.from(this.restoreTasks.values());
  }

  /**
   * 根据ID获取恢复任务
   * @param taskId 任务ID
   * @returns 恢复任务
   */
  async getRestoreTaskById(taskId: string): Promise<RestoreTask | null> {
    return this.restoreTasks.get(taskId) || null;
  }

  /**
   * 根据状态获取恢复任务
   * @param status 恢复状态
   * @returns 恢复任务列表
   */
  async getRestoreTasksByStatus(status: RestoreStatus): Promise<RestoreTask[]> {
    return Array.from(this.restoreTasks.values())
      .filter(task => task.status === status);
  }

  /**
   * 根据备份任务ID获取恢复任务
   * @param backupTaskId 备份任务ID
   * @returns 恢复任务列表
   */
  async getRestoreTasksByBackupTaskId(backupTaskId: string): Promise<RestoreTask[]> {
    return Array.from(this.restoreTasks.values())
      .filter(task => task.backupTaskId === backupTaskId);
  }

  /**
   * 删除恢复任务
   * @param taskId 任务ID
   * @returns 删除结果
   */
  async deleteRestoreTask(taskId: string): Promise<boolean> {
    return this.restoreTasks.delete(taskId);
  }

  /**
   * 保存备份存储配置
   * @param config 备份存储配置
   * @returns 保存后的备份存储配置
   */
  async saveBackupStorageConfig(config: BackupStorageConfig): Promise<BackupStorageConfig> {
    this.backupStorageConfigs.set(config.id, config);
    return config;
  }

  /**
   * 获取备份存储配置列表
   * @returns 备份存储配置列表
   */
  async getBackupStorageConfigs(): Promise<BackupStorageConfig[]> {
    return Array.from(this.backupStorageConfigs.values());
  }

  /**
   * 根据ID获取备份存储配置
   * @param configId 配置ID
   * @returns 备份存储配置
   */
  async getBackupStorageConfigById(configId: string): Promise<BackupStorageConfig | null> {
    return this.backupStorageConfigs.get(configId) || null;
  }

  /**
   * 删除备份存储配置
   * @param configId 配置ID
   * @returns 删除结果
   */
  async deleteBackupStorageConfig(configId: string): Promise<boolean> {
    return this.backupStorageConfigs.delete(configId);
  }

  /**
   * 保存备份验证结果
   * @param result 备份验证结果
   * @returns 保存后的备份验证结果
   */
  async saveBackupValidationResult(result: BackupValidationResult): Promise<BackupValidationResult> {
    this.backupValidationResults.set(result.id, result);
    return result;
  }

  /**
   * 获取备份验证结果列表
   * @param backupTaskId 备份任务ID
   * @returns 验证结果列表
   */
  async getBackupValidationResults(backupTaskId: string): Promise<BackupValidationResult[]> {
    return Array.from(this.backupValidationResults.values())
      .filter(result => result.backupTaskId === backupTaskId);
  }

  /**
   * 获取备份验证结果
   * @param resultId 验证结果ID
   * @returns 验证结果
   */
  async getBackupValidationResultById(resultId: string): Promise<BackupValidationResult | null> {
    return this.backupValidationResults.get(resultId) || null;
  }

  /**
   * 删除备份验证结果
   * @param resultId 验证结果ID
   * @returns 删除结果
   */
  async deleteBackupValidationResult(resultId: string): Promise<boolean> {
    return this.backupValidationResults.delete(resultId);
  }

  /**
   * 保存备份清理任务
   * @param task 备份清理任务
   * @returns 保存后的备份清理任务
   */
  async saveBackupCleanupTask(task: BackupCleanupTask): Promise<BackupCleanupTask> {
    this.backupCleanupTasks.set(task.id, task);
    return task;
  }

  /**
   * 获取备份清理任务列表
   * @returns 备份清理任务列表
   */
  async getBackupCleanupTasks(): Promise<BackupCleanupTask[]> {
    return Array.from(this.backupCleanupTasks.values());
  }

  /**
   * 根据ID获取备份清理任务
   * @param taskId 任务ID
   * @returns 备份清理任务
   */
  async getBackupCleanupTaskById(taskId: string): Promise<BackupCleanupTask | null> {
    return this.backupCleanupTasks.get(taskId) || null;
  }

  /**
   * 根据配置ID获取备份清理任务
   * @param configId 配置ID
   * @returns 备份清理任务列表
   */
  async getBackupCleanupTasksByConfigId(configId: string): Promise<BackupCleanupTask[]> {
    return Array.from(this.backupCleanupTasks.values())
      .filter(task => task.backupConfigId === configId);
  }

  /**
   * 删除备份清理任务
   * @param taskId 任务ID
   * @returns 删除结果
   */
  async deleteBackupCleanupTask(taskId: string): Promise<boolean> {
    return this.backupCleanupTasks.delete(taskId);
  }

  /**
   * 获取最新的备份任务
   * @param configId 配置ID
   * @returns 最新的备份任务
   */
  async getLatestBackupTask(configId: string): Promise<BackupTask | null> {
    return Array.from(this.backupTasks.values())
      .filter(task => task.backupConfigId === configId)
      .sort((a, b) => {
        const timeA = a.createdAt.getTime();
        const timeB = b.createdAt.getTime();
        return timeB - timeA;
      })[0] || null;
  }

  /**
   * 获取指定类型的备份任务
   * @param configId 配置ID
   * @param backupType 备份类型
   * @returns 备份任务列表
   */
  async getBackupTasksByType(configId: string, backupType: BackupType): Promise<BackupTask[]> {
    return Array.from(this.backupTasks.values())
      .filter(task => task.backupConfigId === configId && task.backupType === backupType);
  }

  /**
   * 获取备份统计信息
   * @param days 统计天数
   * @returns 备份统计信息
   */
  async getBackupStatistics(days: number): Promise<{
    totalBackups: number;
    successfulBackups: number;
    failedBackups: number;
    averageBackupSize: number;
    averageBackupDuration: number;
    backupTypeDistribution: Record<BackupType, number>;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // 过滤指定天数内的备份任务
    const recentBackups = Array.from(this.backupTasks.values())
      .filter(task => task.createdAt >= cutoffDate);
    
    // 计算统计数据
    const totalBackups = recentBackups.length;
    const successfulBackups = recentBackups.filter(task => task.status === BackupStatus.COMPLETED).length;
    const failedBackups = recentBackups.filter(task => task.status === BackupStatus.FAILED).length;
    
    // 计算平均备份大小
    const totalSize = recentBackups.reduce((sum, task) => sum + (task.fileSize || 0), 0);
    const averageBackupSize = totalBackups > 0 ? totalSize / totalBackups : 0;
    
    // 计算平均备份持续时间
    const totalDuration = recentBackups.reduce((sum, task) => sum + (task.durationSeconds || 0), 0);
    const averageBackupDuration = totalBackups > 0 ? totalDuration / totalBackups : 0;
    
    // 计算备份类型分布
    const backupTypeDistribution: Record<BackupType, number> = {
      [BackupType.FULL]: 0,
      [BackupType.INCREMENTAL]: 0,
      [BackupType.DIFFERENTIAL]: 0,
      [BackupType.LOG]: 0
    };
    
    recentBackups.forEach(task => {
      backupTypeDistribution[task.backupType]++;
    });
    
    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      averageBackupSize,
      averageBackupDuration,
      backupTypeDistribution
    };
  }
}