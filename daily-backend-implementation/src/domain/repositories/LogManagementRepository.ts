/**
 * 日志管理仓库接口
 * 定义日志管理模块的数据持久化和查询操作
 */
import {
  Log,
  LogConfig,
  LogQuery,
  LogExportTask,
  LogCleanupTask,
  LogLevel,
  LogRetentionPolicy
} from '../entities/LogConfig';

export interface LogManagementRepository {
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
   * @returns 日志记录列表和总数
   */
  queryLogs(query: LogQuery): Promise<{
    logs: Log[];
    total: number;
  }>;

  /**
   * 根据跟踪ID获取相关日志
   * @param traceId 跟踪ID
   * @returns 相关日志列表
   */
  getLogsByTraceId(traceId: string): Promise<Log[]>;

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
  }>;

  /**
   * 获取日志来源列表
   * @returns 日志来源列表
   */
  getLogSources(): Promise<string[]>;

  /**
   * 清理过期日志
   * @param retentionPolicy 保留策略
   * @param sources 日志来源列表（可选）
   * @returns 清理日志数量和释放空间
   */
  cleanupOldLogs(retentionPolicy: LogRetentionPolicy, sources?: string[]): Promise<{
    cleanedCount: number;
    freedSpace: number;
  }>;

  /**
   * 保存日志配置
   * @param config 日志配置
   * @returns 保存后的日志配置
   */
  saveLogConfig(config: LogConfig): Promise<LogConfig>;

  /**
   * 获取日志配置列表
   * @returns 日志配置列表
   */
  getLogConfigs(): Promise<LogConfig[]>;

  /**
   * 根据ID获取日志配置
   * @param configId 配置ID
   * @returns 日志配置
   */
  getLogConfigById(configId: string): Promise<LogConfig | null>;

  /**
   * 删除日志配置
   * @param configId 配置ID
   * @returns 删除结果
   */
  deleteLogConfig(configId: string): Promise<boolean>;

  /**
   * 保存日志导出任务
   * @param task 日志导出任务
   * @returns 保存后的日志导出任务
   */
  saveExportTask(task: LogExportTask): Promise<LogExportTask>;

  /**
   * 获取日志导出任务列表
   * @returns 日志导出任务列表
   */
  getExportTasks(): Promise<LogExportTask[]>;

  /**
   * 根据ID获取日志导出任务
   * @param taskId 任务ID
   * @returns 日志导出任务
   */
  getExportTaskById(taskId: string): Promise<LogExportTask | null>;

  /**
   * 删除日志导出任务
   * @param taskId 任务ID
   * @returns 删除结果
   */
  deleteExportTask(taskId: string): Promise<boolean>;

  /**
   * 保存日志清理任务
   * @param task 日志清理任务
   * @returns 保存后的日志清理任务
   */
  saveCleanupTask(task: LogCleanupTask): Promise<LogCleanupTask>;

  /**
   * 获取日志清理任务列表
   * @returns 日志清理任务列表
   */
  getCleanupTasks(): Promise<LogCleanupTask[]>;

  /**
   * 根据ID获取日志清理任务
   * @param taskId 任务ID
   * @returns 日志清理任务
   */
  getCleanupTaskById(taskId: string): Promise<LogCleanupTask | null>;

  /**
   * 删除日志清理任务
   * @param taskId 任务ID
   * @returns 删除结果
   */
  deleteCleanupTask(taskId: string): Promise<boolean>;

  /**
   * 更新日志级别
   * @param source 日志来源
   * @param level 日志级别
   * @returns 更新结果
   */
  updateLogLevel(source: string, level: LogLevel): Promise<boolean>;

  /**
   * 获取日志计数统计
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 按级别统计的日志数量
   */
  getLogCountByLevel(startTime: Date, endTime: Date): Promise<Record<string, number>>;

  /**
   * 获取日志来源统计
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 按来源统计的日志数量
   */
  getLogCountBySource(startTime: Date, endTime: Date): Promise<Record<string, number>>;

  /**
   * 获取日志源类型统计
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 按源类型统计的日志数量
   */
  getLogCountBySourceType(startTime: Date, endTime: Date): Promise<Record<string, number>>;

  /**
   * 获取日志小时分布
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 按小时统计的日志数量
   */
  getLogCountByHour(startTime: Date, endTime: Date): Promise<Record<string, number>>;

  /**
   * 获取日志趋势数据
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param interval 时间间隔（分钟）
   * @returns 按时间间隔统计的日志数据
   */
  getLogTrend(startTime: Date, endTime: Date, interval: number): Promise<{
    timestamp: Date;
    count: number;
    byLevel: Record<LogLevel, number>;
  }[]>;
}