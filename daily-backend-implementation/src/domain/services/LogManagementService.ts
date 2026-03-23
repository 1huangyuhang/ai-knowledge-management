/**
 * 日志管理服务接口
 * 定义日志管理模块的核心业务逻辑
 */
import {
  Log,
  LogConfig,
  LogQuery,
  LogExportTask,
  LogStatistics,
  LogCleanupTask,
  LogLevel,
  LogRetentionPolicy
} from '../entities/LogConfig';

export interface LogManagementService {
  /**
   * 保存日志记录
   * @param log 日志记录
   * @returns 保存后的日志记录
   */
  saveLog(log: Log): Promise<Log>;

  /**
   * 批量保存日志记录
   * @param logs 日志记录列表
   * @returns 保存结果
   */
  saveLogs(logs: Log[]): Promise<boolean>;

  /**
   * 根据ID获取日志记录
   * @param logId 日志ID
   * @returns 日志记录
   */
  getLogById(logId: string): Promise<Log | null>;

  /**
   * 查询日志记录
   * @param query 查询条件
   * @returns 日志记录列表
   */
  queryLogs(query: LogQuery): Promise<{
    logs: Log[];
    total: number;
    page: number;
    pageSize: number;
  }>;

  /**
   * 获取日志统计信息
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 日志统计信息
   */
  getLogStatistics(startTime: Date, endTime: Date): Promise<LogStatistics>;

  /**
   * 创建日志配置
   * @param config 日志配置
   * @returns 创建后的日志配置
   */
  createLogConfig(config: LogConfig): Promise<LogConfig>;

  /**
   * 更新日志配置
   * @param configId 配置ID
   * @param config 日志配置
   * @returns 更新后的日志配置
   */
  updateLogConfig(configId: string, config: Partial<LogConfig>): Promise<LogConfig>;

  /**
   * 获取日志配置
   * @param configId 配置ID
   * @returns 日志配置
   */
  getLogConfig(configId: string): Promise<LogConfig | null>;

  /**
   * 获取所有日志配置
   * @returns 日志配置列表
   */
  getAllLogConfigs(): Promise<LogConfig[]>;

  /**
   * 删除日志配置
   * @param configId 配置ID
   * @returns 删除结果
   */
  deleteLogConfig(configId: string): Promise<boolean>;

  /**
   * 创建日志导出任务
   * @param task 日志导出任务
   * @returns 创建后的日志导出任务
   */
  createExportTask(task: LogExportTask): Promise<LogExportTask>;

  /**
   * 获取日志导出任务
   * @param taskId 任务ID
   * @returns 日志导出任务
   */
  getExportTask(taskId: string): Promise<LogExportTask | null>;

  /**
   * 获取所有日志导出任务
   * @returns 日志导出任务列表
   */
  getAllExportTasks(): Promise<LogExportTask[]>;

  /**
   * 取消日志导出任务
   * @param taskId 任务ID
   * @returns 取消后的日志导出任务
   */
  cancelExportTask(taskId: string): Promise<LogExportTask>;

  /**
   * 执行日志导出任务
   * @param taskId 任务ID
   * @returns 执行后的日志导出任务
   */
  executeExportTask(taskId: string): Promise<LogExportTask>;

  /**
   * 创建日志清理任务
   * @param task 日志清理任务
   * @returns 创建后的日志清理任务
   */
  createCleanupTask(task: LogCleanupTask): Promise<LogCleanupTask>;

  /**
   * 获取日志清理任务
   * @param taskId 任务ID
   * @returns 日志清理任务
   */
  getCleanupTask(taskId: string): Promise<LogCleanupTask | null>;

  /**
   * 获取所有日志清理任务
   * @returns 日志清理任务列表
   */
  getAllCleanupTasks(): Promise<LogCleanupTask[]>;

  /**
   * 取消日志清理任务
   * @param taskId 任务ID
   * @returns 取消后的日志清理任务
   */
  cancelCleanupTask(taskId: string): Promise<LogCleanupTask>;

  /**
   * 执行日志清理任务
   * @param taskId 任务ID
   * @returns 执行后的日志清理任务
   */
  executeCleanupTask(taskId: string): Promise<LogCleanupTask>;

  /**
   * 清理过期日志
   * @param retentionPolicy 保留策略
   * @param sources 日志来源列表（可选）
   * @returns 清理结果
   */
  cleanupOldLogs(retentionPolicy: LogRetentionPolicy, sources?: string[]): Promise<{
    cleanedCount: number;
    freedSpace: number;
  }>;

  /**
   * 更新日志级别
   * @param source 日志来源
   * @param level 日志级别
   * @returns 更新结果
   */
  updateLogLevel(source: string, level: LogLevel): Promise<boolean>;

  /**
   * 获取日志趋势分析
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param interval 时间间隔（分钟）
   * @returns 日志趋势数据
   */
  getLogTrend(startTime: Date, endTime: Date, interval: number): Promise<{
    timestamp: Date;
    count: number;
    byLevel: Record<LogLevel, number>;
  }[]>;

  /**
   * 搜索日志中的关键字
   * @param keywords 关键字列表
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param page 页码
   * @param pageSize 每页大小
   * @returns 搜索结果
   */
  searchLogsByKeywords(keywords: string[], startTime: Date, endTime: Date, page: number, pageSize: number): Promise<{
    logs: Log[];
    total: number;
    page: number;
    pageSize: number;
  }>;

  /**
   * 根据跟踪ID获取相关日志
   * @param traceId 跟踪ID
   * @returns 相关日志列表
   */
  getLogsByTraceId(traceId: string): Promise<Log[]>;

  /**
   * 获取日志来源列表
   * @returns 日志来源列表
   */
  getLogSources(): Promise<string[]>;
}