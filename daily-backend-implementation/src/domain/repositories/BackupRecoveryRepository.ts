/**
 * 备份恢复仓库接口
 * 定义备份恢复模块的数据持久化和查询操作
 */
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
} from '../entities/BackupConfig';

export interface BackupRecoveryRepository {
  /**
   * 保存备份配置
   * @param config 备份配置
   * @returns 保存后的备份配置
   */
  saveBackupConfig(config: BackupConfig): Promise<BackupConfig>;

  /**
   * 获取备份配置列表
   * @returns 备份配置列表
   */
  getBackupConfigs(): Promise<BackupConfig[]>;

  /**
   * 根据ID获取备份配置
   * @param configId 配置ID
   * @returns 备份配置
   */
  getBackupConfigById(configId: string): Promise<BackupConfig | null>;

  /**
   * 删除备份配置
   * @param configId 配置ID
   * @returns 删除结果
   */
  deleteBackupConfig(configId: string): Promise<boolean>;

  /**
   * 保存备份任务
   * @param task 备份任务
   * @returns 保存后的备份任务
   */
  saveBackupTask(task: BackupTask): Promise<BackupTask>;

  /**
   * 获取备份任务列表
   * @returns 备份任务列表
   */
  getBackupTasks(): Promise<BackupTask[]>;

  /**
   * 根据ID获取备份任务
   * @param taskId 任务ID
   * @returns 备份任务
   */
  getBackupTaskById(taskId: string): Promise<BackupTask | null>;

  /**
   * 根据状态获取备份任务
   * @param status 备份状态
   * @returns 备份任务列表
   */
  getBackupTasksByStatus(status: BackupStatus): Promise<BackupTask[]>;

  /**
   * 根据配置ID获取备份任务
   * @param configId 配置ID
   * @returns 备份任务列表
   */
  getBackupTasksByConfigId(configId: string): Promise<BackupTask[]>;

  /**
   * 删除备份任务
   * @param taskId 任务ID
   * @returns 删除结果
   */
  deleteBackupTask(taskId: string): Promise<boolean>;

  /**
   * 保存恢复任务
   * @param task 恢复任务
   * @returns 保存后的恢复任务
   */
  saveRestoreTask(task: RestoreTask): Promise<RestoreTask>;

  /**
   * 获取恢复任务列表
   * @returns 恢复任务列表
   */
  getRestoreTasks(): Promise<RestoreTask[]>;

  /**
   * 根据ID获取恢复任务
   * @param taskId 任务ID
   * @returns 恢复任务
   */
  getRestoreTaskById(taskId: string): Promise<RestoreTask | null>;

  /**
   * 根据状态获取恢复任务
   * @param status 恢复状态
   * @returns 恢复任务列表
   */
  getRestoreTasksByStatus(status: RestoreStatus): Promise<RestoreTask[]>;

  /**
   * 根据备份任务ID获取恢复任务
   * @param backupTaskId 备份任务ID
   * @returns 恢复任务列表
   */
  getRestoreTasksByBackupTaskId(backupTaskId: string): Promise<RestoreTask[]>;

  /**
   * 删除恢复任务
   * @param taskId 任务ID
   * @returns 删除结果
   */
  deleteRestoreTask(taskId: string): Promise<boolean>;

  /**
   * 保存备份存储配置
   * @param config 备份存储配置
   * @returns 保存后的备份存储配置
   */
  saveBackupStorageConfig(config: BackupStorageConfig): Promise<BackupStorageConfig>;

  /**
   * 获取备份存储配置列表
   * @returns 备份存储配置列表
   */
  getBackupStorageConfigs(): Promise<BackupStorageConfig[]>;

  /**
   * 根据ID获取备份存储配置
   * @param configId 配置ID
   * @returns 备份存储配置
   */
  getBackupStorageConfigById(configId: string): Promise<BackupStorageConfig | null>;

  /**
   * 删除备份存储配置
   * @param configId 配置ID
   * @returns 删除结果
   */
  deleteBackupStorageConfig(configId: string): Promise<boolean>;

  /**
   * 保存备份验证结果
   * @param result 备份验证结果
   * @returns 保存后的备份验证结果
   */
  saveBackupValidationResult(result: BackupValidationResult): Promise<BackupValidationResult>;

  /**
   * 获取备份验证结果列表
   * @param backupTaskId 备份任务ID
   * @returns 验证结果列表
   */
  getBackupValidationResults(backupTaskId: string): Promise<BackupValidationResult[]>;

  /**
   * 获取备份验证结果
   * @param resultId 验证结果ID
   * @returns 验证结果
   */
  getBackupValidationResultById(resultId: string): Promise<BackupValidationResult | null>;

  /**
   * 删除备份验证结果
   * @param resultId 验证结果ID
   * @returns 删除结果
   */
  deleteBackupValidationResult(resultId: string): Promise<boolean>;

  /**
   * 保存备份清理任务
   * @param task 备份清理任务
   * @returns 保存后的备份清理任务
   */
  saveBackupCleanupTask(task: BackupCleanupTask): Promise<BackupCleanupTask>;

  /**
   * 获取备份清理任务列表
   * @returns 备份清理任务列表
   */
  getBackupCleanupTasks(): Promise<BackupCleanupTask[]>;

  /**
   * 根据ID获取备份清理任务
   * @param taskId 任务ID
   * @returns 备份清理任务
   */
  getBackupCleanupTaskById(taskId: string): Promise<BackupCleanupTask | null>;

  /**
   * 根据配置ID获取备份清理任务
   * @param configId 配置ID
   * @returns 备份清理任务列表
   */
  getBackupCleanupTasksByConfigId(configId: string): Promise<BackupCleanupTask[]>;

  /**
   * 删除备份清理任务
   * @param taskId 任务ID
   * @returns 删除结果
   */
  deleteBackupCleanupTask(taskId: string): Promise<boolean>;

  /**
   * 获取最新的备份任务
   * @param configId 配置ID
   * @returns 最新的备份任务
   */
  getLatestBackupTask(configId: string): Promise<BackupTask | null>;

  /**
   * 获取指定类型的备份任务
   * @param configId 配置ID
   * @param backupType 备份类型
   * @returns 备份任务列表
   */
  getBackupTasksByType(configId: string, backupType: BackupType): Promise<BackupTask[]>;

  /**
   * 获取备份统计信息
   * @param days 统计天数
   * @returns 备份统计信息
   */
  getBackupStatistics(days: number): Promise<{
    totalBackups: number;
    successfulBackups: number;
    failedBackups: number;
    averageBackupSize: number;
    averageBackupDuration: number;
    backupTypeDistribution: Record<BackupType, number>;
  }>;
}