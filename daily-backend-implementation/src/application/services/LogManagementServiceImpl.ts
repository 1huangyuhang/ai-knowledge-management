/**
 * 日志管理服务实现
 * 实现日志管理模块的核心业务逻辑
 */
import { LogManagementService } from '../../domain/services/LogManagementService';
import { LogManagementRepository } from '../../domain/repositories/LogManagementRepository';
import {
  Log,
  LogConfig,
  LogQuery,
  LogExportTask,
  LogStatistics,
  LogCleanupTask,
  LogLevel,
  LogRetentionPolicy
} from '../../domain/entities/LogConfig';

export class LogManagementServiceImpl implements LogManagementService {
  /**
   * 构造函数
   * @param logRepository 日志管理仓库
   */
  constructor(private readonly logRepository: LogManagementRepository) {}

  /**
   * 保存日志记录
   * @param log 日志记录
   * @returns 保存后的日志记录
   */
  async saveLog(log: Log): Promise<Log> {
    return this.logRepository.saveLog(log);
  }

  /**
   * 批量保存日志记录
   * @param logs 日志记录列表
   * @returns 保存结果
   */
  async saveLogs(logs: Log[]): Promise<boolean> {
    return this.logRepository.saveLogs(logs);
  }

  /**
   * 根据ID获取日志记录
   * @param logId 日志ID
   * @returns 日志记录
   */
  async getLogById(logId: string): Promise<Log | null> {
    return this.logRepository.getLogById(logId);
  }

  /**
   * 查询日志记录
   * @param query 查询条件
   * @returns 日志记录列表
   */
  async queryLogs(query: LogQuery): Promise<{
    logs: Log[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // 设置默认分页参数
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    
    // 更新查询条件的分页参数
    const updatedQuery = { ...query, page, pageSize };
    
    const { logs, total } = await this.logRepository.queryLogs(updatedQuery);
    
    return {
      logs,
      total,
      page,
      pageSize
    };
  }

  /**
   * 获取日志统计信息
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 日志统计信息
   */
  async getLogStatistics(startTime: Date, endTime: Date): Promise<LogStatistics> {
    // 获取按级别统计
    const byLevel = await this.logRepository.getLogCountByLevel(startTime, endTime);
    
    // 获取按来源统计
    const bySource = await this.logRepository.getLogCountBySource(startTime, endTime);
    
    // 获取按源类型统计
    const bySourceType = await this.logRepository.getLogCountBySourceType(startTime, endTime);
    
    // 获取按小时分布
    const hourlyDistribution = await this.logRepository.getLogCountByHour(startTime, endTime);
    
    // 计算总日志数
    const totalCount = Object.values(byLevel).reduce((sum, count) => sum + count, 0);
    
    // 计算各类型日志数
    const errorCount = byLevel[LogLevel.ERROR] || 0 + byLevel[LogLevel.FATAL] || 0;
    const warningCount = byLevel[LogLevel.WARN] || 0;
    const infoCount = byLevel[LogLevel.INFO] || 0 + byLevel[LogLevel.DEBUG] || 0;
    
    return new LogStatistics(
      startTime,
      endTime,
      totalCount,
      byLevel as Record<LogLevel, number>,
      bySource,
      bySourceType as any,
      hourlyDistribution,
      errorCount,
      warningCount,
      infoCount
    );
  }

  /**
   * 创建日志配置
   * @param config 日志配置
   * @returns 创建后的日志配置
   */
  async createLogConfig(config: LogConfig): Promise<LogConfig> {
    return this.logRepository.saveLogConfig(config);
  }

  /**
   * 更新日志配置
   * @param configId 配置ID
   * @param config 日志配置
   * @returns 更新后的日志配置
   */
  async updateLogConfig(configId: string, config: Partial<LogConfig>): Promise<LogConfig> {
    // 获取现有配置
    const existingConfig = await this.logRepository.getLogConfigById(configId);
    if (!existingConfig) {
      throw new Error(`Log configuration with ID ${configId} not found`);
    }
    
    // 更新配置
    const updatedConfig = new LogConfig(
      existingConfig.id,
      config.name || existingConfig.name,
      config.defaultLogLevel || existingConfig.defaultLogLevel,
      config.retentionPolicy || existingConfig.retentionPolicy,
      config.rotationPolicy || existingConfig.rotationPolicy,
      config.compressionEnabled !== undefined ? config.compressionEnabled : existingConfig.compressionEnabled,
      config.structuredLoggingEnabled !== undefined ? config.structuredLoggingEnabled : existingConfig.structuredLoggingEnabled,
      config.traceLoggingEnabled !== undefined ? config.traceLoggingEnabled : existingConfig.traceLoggingEnabled,
      config.sourceConfigs || existingConfig.sourceConfigs,
      existingConfig.createdAt,
      new Date(),
      existingConfig.createdBy,
      config.updatedBy || existingConfig.updatedBy,
      config.description || existingConfig.description,
      config.rotationSizeMB || existingConfig.rotationSizeMB
    );
    
    return this.logRepository.saveLogConfig(updatedConfig);
  }

  /**
   * 获取日志配置
   * @param configId 配置ID
   * @returns 日志配置
   */
  async getLogConfig(configId: string): Promise<LogConfig | null> {
    return this.logRepository.getLogConfigById(configId);
  }

  /**
   * 获取所有日志配置
   * @returns 日志配置列表
   */
  async getAllLogConfigs(): Promise<LogConfig[]> {
    return this.logRepository.getLogConfigs();
  }

  /**
   * 删除日志配置
   * @param configId 配置ID
   * @returns 删除结果
   */
  async deleteLogConfig(configId: string): Promise<boolean> {
    return this.logRepository.deleteLogConfig(configId);
  }

  /**
   * 创建日志导出任务
   * @param task 日志导出任务
   * @returns 创建后的日志导出任务
   */
  async createExportTask(task: LogExportTask): Promise<LogExportTask> {
    return this.logRepository.saveExportTask(task);
  }

  /**
   * 获取日志导出任务
   * @param taskId 任务ID
   * @returns 日志导出任务
   */
  async getExportTask(taskId: string): Promise<LogExportTask | null> {
    return this.logRepository.getExportTaskById(taskId);
  }

  /**
   * 获取所有日志导出任务
   * @returns 日志导出任务列表
   */
  async getAllExportTasks(): Promise<LogExportTask[]> {
    return this.logRepository.getExportTasks();
  }

  /**
   * 取消日志导出任务
   * @param taskId 任务ID
   * @returns 取消后的日志导出任务
   */
  async cancelExportTask(taskId: string): Promise<LogExportTask> {
    // 获取现有任务
    const existingTask = await this.logRepository.getExportTaskById(taskId);
    if (!existingTask) {
      throw new Error(`Log export task with ID ${taskId} not found`);
    }
    
    // 只有pending或running状态的任务可以取消
    if (existingTask.status !== 'pending' && existingTask.status !== 'running') {
      throw new Error(`Log export task with ID ${taskId} is in ${existingTask.status} status and cannot be cancelled`);
    }
    
    // 更新任务状态
    const updatedTask = new LogExportTask(
      existingTask.id,
      existingTask.name,
      existingTask.query,
      existingTask.format,
      'cancelled',
      existingTask.createdAt,
      existingTask.createdBy,
      existingTask.progress,
      existingTask.exportPath,
      existingTask.fileSize,
      existingTask.startedAt,
      new Date(),
      'Task cancelled by user'
    );
    
    return this.logRepository.saveExportTask(updatedTask);
  }

  /**
   * 执行日志导出任务
   * @param taskId 任务ID
   * @returns 执行后的日志导出任务
   */
  async executeExportTask(taskId: string): Promise<LogExportTask> {
    // 获取现有任务
    const existingTask = await this.logRepository.getExportTaskById(taskId);
    if (!existingTask) {
      throw new Error(`Log export task with ID ${taskId} not found`);
    }
    
    // 只有pending状态的任务可以执行
    if (existingTask.status !== 'pending') {
      throw new Error(`Log export task with ID ${taskId} is in ${existingTask.status} status and cannot be executed`);
    }
    
    // 更新任务状态为running
    let updatedTask = new LogExportTask(
      existingTask.id,
      existingTask.name,
      existingTask.query,
      existingTask.format,
      'running',
      existingTask.createdAt,
      existingTask.createdBy,
      0,
      existingTask.exportPath,
      existingTask.fileSize,
      new Date(),
      existingTask.completedAt,
      existingTask.failureReason
    );
    
    updatedTask = await this.logRepository.saveExportTask(updatedTask);
    
    try {
      // 模拟导出过程
      // 在实际实现中，这里应该执行真正的日志导出逻辑
      
      // 更新任务状态为completed
      updatedTask = new LogExportTask(
        updatedTask.id,
        updatedTask.name,
        updatedTask.query,
        updatedTask.format,
        'completed',
        updatedTask.createdAt,
        updatedTask.createdBy,
        100,
        `/exports/logs/${updatedTask.id}.${updatedTask.format}`,
        Math.floor(Math.random() * 1024 * 1024), // 模拟文件大小
        updatedTask.startedAt,
        new Date(),
        updatedTask.failureReason
      );
      
      return this.logRepository.saveExportTask(updatedTask);
    } catch (error) {
      // 更新任务状态为failed
      updatedTask = new LogExportTask(
        updatedTask.id,
        updatedTask.name,
        updatedTask.query,
        updatedTask.format,
        'failed',
        updatedTask.createdAt,
        updatedTask.createdBy,
        updatedTask.progress,
        updatedTask.exportPath,
        updatedTask.fileSize,
        updatedTask.startedAt,
        new Date(),
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      return this.logRepository.saveExportTask(updatedTask);
    }
  }

  /**
   * 创建日志清理任务
   * @param task 日志清理任务
   * @returns 创建后的日志清理任务
   */
  async createCleanupTask(task: LogCleanupTask): Promise<LogCleanupTask> {
    return this.logRepository.saveCleanupTask(task);
  }

  /**
   * 获取日志清理任务
   * @param taskId 任务ID
   * @returns 日志清理任务
   */
  async getCleanupTask(taskId: string): Promise<LogCleanupTask | null> {
    return this.logRepository.getCleanupTaskById(taskId);
  }

  /**
   * 获取所有日志清理任务
   * @returns 日志清理任务列表
   */
  async getAllCleanupTasks(): Promise<LogCleanupTask[]> {
    return this.logRepository.getCleanupTasks();
  }

  /**
   * 取消日志清理任务
   * @param taskId 任务ID
   * @returns 取消后的日志清理任务
   */
  async cancelCleanupTask(taskId: string): Promise<LogCleanupTask> {
    // 获取现有任务
    const existingTask = await this.logRepository.getCleanupTaskById(taskId);
    if (!existingTask) {
      throw new Error(`Log cleanup task with ID ${taskId} not found`);
    }
    
    // 只有pending或running状态的任务可以取消
    if (existingTask.status !== 'pending' && existingTask.status !== 'running') {
      throw new Error(`Log cleanup task with ID ${taskId} is in ${existingTask.status} status and cannot be cancelled`);
    }
    
    // 更新任务状态
    const updatedTask = new LogCleanupTask(
      existingTask.id,
      existingTask.name,
      existingTask.retentionPolicy,
      'cancelled',
      existingTask.createdAt,
      existingTask.createdBy,
      existingTask.sources,
      existingTask.cleanedCount,
      existingTask.freedSpace,
      existingTask.startedAt,
      new Date(),
      'Task cancelled by user'
    );
    
    return this.logRepository.saveCleanupTask(updatedTask);
  }

  /**
   * 执行日志清理任务
   * @param taskId 任务ID
   * @returns 执行后的日志清理任务
   */
  async executeCleanupTask(taskId: string): Promise<LogCleanupTask> {
    // 获取现有任务
    const existingTask = await this.logRepository.getCleanupTaskById(taskId);
    if (!existingTask) {
      throw new Error(`Log cleanup task with ID ${taskId} not found`);
    }
    
    // 只有pending状态的任务可以执行
    if (existingTask.status !== 'pending') {
      throw new Error(`Log cleanup task with ID ${taskId} is in ${existingTask.status} status and cannot be executed`);
    }
    
    // 更新任务状态为running
    let updatedTask = new LogCleanupTask(
      existingTask.id,
      existingTask.name,
      existingTask.retentionPolicy,
      'running',
      existingTask.createdAt,
      existingTask.createdBy,
      existingTask.sources,
      existingTask.cleanedCount,
      existingTask.freedSpace,
      new Date(),
      existingTask.completedAt,
      existingTask.failureReason
    );
    
    updatedTask = await this.logRepository.saveCleanupTask(updatedTask);
    
    try {
      // 执行日志清理
      const cleanupResult = await this.logRepository.cleanupOldLogs(
        existingTask.retentionPolicy,
        existingTask.sources
      );
      
      // 更新任务状态为completed
      updatedTask = new LogCleanupTask(
        updatedTask.id,
        updatedTask.name,
        updatedTask.retentionPolicy,
        'completed',
        updatedTask.createdAt,
        updatedTask.createdBy,
        updatedTask.sources,
        cleanupResult.cleanedCount,
        cleanupResult.freedSpace,
        updatedTask.startedAt,
        new Date(),
        updatedTask.failureReason
      );
      
      return this.logRepository.saveCleanupTask(updatedTask);
    } catch (error) {
      // 更新任务状态为failed
      updatedTask = new LogCleanupTask(
        updatedTask.id,
        updatedTask.name,
        updatedTask.retentionPolicy,
        'failed',
        updatedTask.createdAt,
        updatedTask.createdBy,
        updatedTask.sources,
        updatedTask.cleanedCount,
        updatedTask.freedSpace,
        updatedTask.startedAt,
        new Date(),
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      return this.logRepository.saveCleanupTask(updatedTask);
    }
  }

  /**
   * 清理过期日志
   * @param retentionPolicy 保留策略
   * @param sources 日志来源列表（可选）
   * @returns 清理结果
   */
  async cleanupOldLogs(retentionPolicy: LogRetentionPolicy, sources?: string[]): Promise<{
    cleanedCount: number;
    freedSpace: number;
  }> {
    return this.logRepository.cleanupOldLogs(retentionPolicy, sources);
  }

  /**
   * 更新日志级别
   * @param source 日志来源
   * @param level 日志级别
   * @returns 更新结果
   */
  async updateLogLevel(source: string, level: LogLevel): Promise<boolean> {
    return this.logRepository.updateLogLevel(source, level);
  }

  /**
   * 获取日志趋势分析
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param interval 时间间隔（分钟）
   * @returns 日志趋势数据
   */
  async getLogTrend(startTime: Date, endTime: Date, interval: number): Promise<{
    timestamp: Date;
    count: number;
    byLevel: Record<LogLevel, number>;
  }[]> {
    return this.logRepository.getLogTrend(startTime, endTime, interval);
  }

  /**
   * 搜索日志中的关键字
   * @param keywords 关键字列表
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param page 页码
   * @param pageSize 每页大小
   * @returns 搜索结果
   */
  async searchLogsByKeywords(keywords: string[], startTime: Date, endTime: Date, page: number, pageSize: number): Promise<{
    logs: Log[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { logs, total } = await this.logRepository.searchLogsByKeywords(
      keywords,
      startTime,
      endTime,
      page,
      pageSize
    );
    
    return {
      logs,
      total,
      page,
      pageSize
    };
  }

  /**
   * 根据跟踪ID获取相关日志
   * @param traceId 跟踪ID
   * @returns 相关日志列表
   */
  async getLogsByTraceId(traceId: string): Promise<Log[]> {
    return this.logRepository.getLogsByTraceId(traceId);
  }

  /**
   * 获取日志来源列表
   * @returns 日志来源列表
   */
  async getLogSources(): Promise<string[]> {
    return this.logRepository.getLogSources();
  }
}