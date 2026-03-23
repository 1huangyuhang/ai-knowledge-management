/**
 * 备份恢复服务接口
 * 定义备份恢复模块的核心业务逻辑
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

export interface BackupRecoveryService {
  /**
   * 创建备份配置
   * @param config 备份配置
   * @returns 创建后的备份配置
   */
  createBackupConfig(config: BackupConfig): Promise<BackupConfig>;

  /**
   * 更新备份配置
   * @param configId 配置ID
   * @param config 备份配置
   * @returns 更新后的备份配置
   */
  updateBackupConfig(configId: string, config: Partial<BackupConfig>): Promise<BackupConfig>;

  /**
   * 获取备份配置
   * @param configId 配置ID
   * @returns 备份配置
   */
  getBackupConfig(configId: string): Promise<BackupConfig | null>;

  /**
   * 获取所有备份配置
   * @returns 备份配置列表
   */
  getAllBackupConfigs(): Promise<BackupConfig[]>;

  /**
   * 删除备份配置
   * @param configId 配置ID
   * @returns 删除结果
   */
  deleteBackupConfig(configId: string): Promise<boolean>;

  /**
   * 创建备份任务
   * @param backupTask 备份任务
   * @returns 创建后的备份任务
   */
  createBackupTask(backupTask: BackupTask): Promise<BackupTask>;

  /**
   * 执行备份任务
   * @param taskId 任务ID
   * @returns 执行中的备份任务
   */
  executeBackupTask(taskId: string): Promise<BackupTask>;

  /**
   * 取消备份任务
   * @param taskId 任务ID
   * @returns 取消后的备份任务
   */
  cancelBackupTask(taskId: string): Promise<BackupTask>;

  /**
   * 获取备份任务
   * @param taskId 任务ID
   * @returns 备份任务
   */
  getBackupTask(taskId: string): Promise<BackupTask | null>;

  /**
   * 获取所有备份任务
   * @returns 备份任务列表
   */
  getAllBackupTasks(): Promise<BackupTask[]>;

  /**
   * 根据状态获取备份任务
   * @param status 备份状态
   * @returns 备份任务列表
   */
  getBackupTasksByStatus(status: BackupStatus): Promise<BackupTask[]>;

  /**
   * 创建恢复任务
   * @param restoreTask 恢复任务
   * @returns 创建后的恢复任务
   */
  createRestoreTask(restoreTask: RestoreTask): Promise<RestoreTask>;

  /**
   * 执行恢复任务
   * @param taskId 任务ID
   * @returns 执行中的恢复任务
   */
  executeRestoreTask(taskId: string): Promise<RestoreTask>;

  /**
   * 取消恢复任务
   * @param taskId 任务ID
   * @returns 取消后的恢复任务
   */
  cancelRestoreTask(taskId: string): Promise<RestoreTask>;

  /**
   * 获取恢复任务
   * @param taskId 任务ID
   * @returns 恢复任务
   */
  getRestoreTask(taskId: string): Promise<RestoreTask | null>;

  /**
   * 获取所有恢复任务
   * @returns 恢复任务列表
   */
  getAllRestoreTasks(): Promise<RestoreTask[]>;

  /**
   * 根据状态获取恢复任务
   * @param status 恢复状态
   * @returns 恢复任务列表
   */
  getRestoreTasksByStatus(status: RestoreStatus): Promise<RestoreTask[]>;

  /**
   * 创建备份存储配置
   * @param storageConfig 备份存储配置
   * @returns 创建后的备份存储配置
   */
  createBackupStorageConfig(storageConfig: BackupStorageConfig): Promise<BackupStorageConfig>;

  /**
   * 更新备份存储配置
   * @param configId 配置ID
   * @param storageConfig 备份存储配置
   * @returns 更新后的备份存储配置
   */
  updateBackupStorageConfig(configId: string, storageConfig: Partial<BackupStorageConfig>): Promise<BackupStorageConfig>;

  /**
   * 获取备份存储配置
   * @param configId 配置ID
   * @returns 备份存储配置
   */
  getBackupStorageConfig(configId: string): Promise<BackupStorageConfig | null>;

  /**
   * 获取所有备份存储配置
   * @returns 备份存储配置列表
   */
  getAllBackupStorageConfigs(): Promise<BackupStorageConfig[]>;

  /**
   * 删除备份存储配置
   * @param configId 配置ID
   * @returns 删除结果
   */
  deleteBackupStorageConfig(configId: string): Promise<boolean>;

  /**
   * 验证备份文件
   * @param backupTaskId 备份任务ID
   * @param filePath 备份文件路径
   * @param validatedBy 验证者
   * @returns 验证结果
   */
  validateBackup(backupTaskId: string, filePath: string, validatedBy: string): Promise<BackupValidationResult>;

  /**
   * 获取备份验证结果
   * @param backupTaskId 备份任务ID
   * @returns 验证结果列表
   */
  getBackupValidationResults(backupTaskId: string): Promise<BackupValidationResult[]>;

  /**
   * 创建备份清理任务
   * @param cleanupTask 备份清理任务
   * @returns 创建后的备份清理任务
   */
  createBackupCleanupTask(cleanupTask: BackupCleanupTask): Promise<BackupCleanupTask>;

  /**
   * 执行备份清理任务
   * @param taskId 任务ID
   * @returns 执行中的备份清理任务
   */
  executeBackupCleanupTask(taskId: string): Promise<BackupCleanupTask>;

  /**
   * 取消备份清理任务
   * @param taskId 任务ID
   * @returns 取消后的备份清理任务
   */
  cancelBackupCleanupTask(taskId: string): Promise<BackupCleanupTask>;

  /**
   * 获取备份清理任务
   * @param taskId 任务ID
   * @returns 备份清理任务
   */
  getBackupCleanupTask(taskId: string): Promise<BackupCleanupTask | null>;

  /**
   * 获取所有备份清理任务
   * @returns 备份清理任务列表
   */
  getAllBackupCleanupTasks(): Promise<BackupCleanupTask[]>;

  /**
   * 手动触发备份
   * @param configId 备份配置ID
   * @param backupType 备份类型
   * @returns 创建的备份任务
   */
  triggerBackup(configId: string, backupType: BackupType): Promise<BackupTask>;

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