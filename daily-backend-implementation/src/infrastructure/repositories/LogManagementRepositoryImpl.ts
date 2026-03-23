/**
 * 日志管理仓库实现
 * 基于内存的日志管理模块数据持久化和查询操作实现
 */
import { LogManagementRepository } from '../../domain/repositories/LogManagementRepository';
import {
  Log,
  LogConfig,
  LogQuery,
  LogExportTask,
  LogCleanupTask,
  LogLevel,
  LogRetentionPolicy,
  LogSourceType
} from '../../domain/entities/LogConfig';

export class LogManagementRepositoryImpl implements LogManagementRepository {
  // 内存存储
  private logs: Map<string, Log> = new Map();
  private logConfigs: Map<string, LogConfig> = new Map();
  private exportTasks: Map<string, LogExportTask> = new Map();
  private cleanupTasks: Map<string, LogCleanupTask> = new Map();
  
  // 日志来源集合
  private logSources: Set<string> = new Set();

  /**
   * 保存日志记录
   * @param log 日志记录
   * @returns 保存后的日志记录
   */
  async saveLog(log: Log): Promise<Log> {
    this.logs.set(log.id, log);
    // 添加到日志来源集合
    this.logSources.add(log.source);
    return log;
  }

  /**
   * 批量保存日志记录
   * @param logs 日志记录列表
   * @returns 保存结果
   */
  async saveLogs(logs: Log[]): Promise<boolean> {
    for (const log of logs) {
      await this.saveLog(log);
    }
    return true;
  }

  /**
   * 根据ID获取日志记录
   * @param logId 日志ID
   * @returns 日志记录
   */
  async getLogById(logId: string): Promise<Log | null> {
    return this.logs.get(logId) || null;
  }

  /**
   * 查询日志记录
   * @param query 查询条件
   * @returns 日志记录列表和总数
   */
  async queryLogs(query: LogQuery): Promise<{
    logs: Log[];
    total: number;
  }> {
    let result = Array.from(this.logs.values());

    // 应用过滤条件
    if (query.levels) {
      result = result.filter(log => query.levels!.includes(log.level));
    }
    
    if (query.sources) {
      result = result.filter(log => query.sources!.includes(log.source));
    }
    
    if (query.sourceTypes) {
      result = result.filter(log => query.sourceTypes!.includes(log.sourceType));
    }
    
    if (query.traceId) {
      result = result.filter(log => log.traceId === query.traceId);
    }
    
    if (query.resourceId) {
      result = result.filter(log => log.resourceId === query.resourceId);
    }
    
    if (query.userId) {
      result = result.filter(log => log.userId === query.userId);
    }
    
    if (query.startTime) {
      result = result.filter(log => log.timestamp >= query.startTime!);
    }
    
    if (query.endTime) {
      result = result.filter(log => log.timestamp <= query.endTime!);
    }
    
    if (query.environment) {
      result = result.filter(log => log.environment === query.environment);
    }
    
    if (query.serviceName) {
      result = result.filter(log => log.serviceName === query.serviceName);
    }
    
    if (query.hostname) {
      result = result.filter(log => log.hostname === query.hostname);
    }
    
    // 按时间降序排序
    result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const total = result.length;
    
    // 应用分页
    if (query.page && query.pageSize) {
      const startIndex = (query.page - 1) * query.pageSize;
      const endIndex = startIndex + query.pageSize;
      result = result.slice(startIndex, endIndex);
    }
    
    return {
      logs: result,
      total
    };
  }

  /**
   * 根据跟踪ID获取相关日志
   * @param traceId 跟踪ID
   * @returns 相关日志列表
   */
  async getLogsByTraceId(traceId: string): Promise<Log[]> {
    return Array.from(this.logs.values())
      .filter(log => log.traceId === traceId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
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
  }> {
    let result = Array.from(this.logs.values());
    
    // 应用时间过滤
    result = result.filter(log => {
      const logTime = log.timestamp;
      return logTime >= startTime && logTime <= endTime;
    });
    
    // 应用关键字过滤
    result = result.filter(log => {
      const searchText = `${log.message} ${JSON.stringify(log.details || {})}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    });
    
    const total = result.length;
    
    // 应用分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    result = result.slice(startIndex, endIndex);
    
    return {
      logs: result,
      total
    };
  }

  /**
   * 获取日志来源列表
   * @returns 日志来源列表
   */
  async getLogSources(): Promise<string[]> {
    return Array.from(this.logSources);
  }

  /**
   * 计算保留天数
   * @param retentionPolicy 保留策略
   * @returns 保留天数
   */
  private calculateRetentionDays(retentionPolicy: LogRetentionPolicy): number {
    switch (retentionPolicy) {
      case LogRetentionPolicy.SEVEN_DAYS:
        return 7;
      case LogRetentionPolicy.THIRTY_DAYS:
        return 30;
      case LogRetentionPolicy.NINETY_DAYS:
        return 90;
      case LogRetentionPolicy.SIX_MONTHS:
        return 180;
      case LogRetentionPolicy.ONE_YEAR:
        return 365;
      case LogRetentionPolicy.INFINITE:
        return Infinity;
      default:
        return 30;
    }
  }

  /**
   * 清理过期日志
   * @param retentionPolicy 保留策略
   * @param sources 日志来源列表（可选）
   * @returns 清理日志数量和释放空间
   */
  async cleanupOldLogs(retentionPolicy: LogRetentionPolicy, sources?: string[]): Promise<{
    cleanedCount: number;
    freedSpace: number;
  }> {
    const retentionDays = this.calculateRetentionDays(retentionPolicy);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    let cleanedCount = 0;
    let freedSpace = 0;
    
    for (const [id, log] of this.logs.entries()) {
      // 检查日志是否过期
      if (log.timestamp < cutoffDate) {
        // 检查是否需要按来源过滤
        if (!sources || sources.includes(log.source)) {
          this.logs.delete(id);
          cleanedCount++;
          // 模拟释放空间（每条日志约1KB）
          freedSpace += 1024;
        }
      }
    }
    
    return {
      cleanedCount,
      freedSpace
    };
  }

  /**
   * 保存日志配置
   * @param config 日志配置
   * @returns 保存后的日志配置
   */
  async saveLogConfig(config: LogConfig): Promise<LogConfig> {
    this.logConfigs.set(config.id, config);
    return config;
  }

  /**
   * 获取日志配置列表
   * @returns 日志配置列表
   */
  async getLogConfigs(): Promise<LogConfig[]> {
    return Array.from(this.logConfigs.values());
  }

  /**
   * 根据ID获取日志配置
   * @param configId 配置ID
   * @returns 日志配置
   */
  async getLogConfigById(configId: string): Promise<LogConfig | null> {
    return this.logConfigs.get(configId) || null;
  }

  /**
   * 删除日志配置
   * @param configId 配置ID
   * @returns 删除结果
   */
  async deleteLogConfig(configId: string): Promise<boolean> {
    return this.logConfigs.delete(configId);
  }

  /**
   * 保存日志导出任务
   * @param task 日志导出任务
   * @returns 保存后的日志导出任务
   */
  async saveExportTask(task: LogExportTask): Promise<LogExportTask> {
    this.exportTasks.set(task.id, task);
    return task;
  }

  /**
   * 获取日志导出任务列表
   * @returns 日志导出任务列表
   */
  async getExportTasks(): Promise<LogExportTask[]> {
    return Array.from(this.exportTasks.values());
  }

  /**
   * 根据ID获取日志导出任务
   * @param taskId 任务ID
   * @returns 日志导出任务
   */
  async getExportTaskById(taskId: string): Promise<LogExportTask | null> {
    return this.exportTasks.get(taskId) || null;
  }

  /**
   * 删除日志导出任务
   * @param taskId 任务ID
   * @returns 删除结果
   */
  async deleteExportTask(taskId: string): Promise<boolean> {
    return this.exportTasks.delete(taskId);
  }

  /**
   * 保存日志清理任务
   * @param task 日志清理任务
   * @returns 保存后的日志清理任务
   */
  async saveCleanupTask(task: LogCleanupTask): Promise<LogCleanupTask> {
    this.cleanupTasks.set(task.id, task);
    return task;
  }

  /**
   * 获取日志清理任务列表
   * @returns 日志清理任务列表
   */
  async getCleanupTasks(): Promise<LogCleanupTask[]> {
    return Array.from(this.cleanupTasks.values());
  }

  /**
   * 根据ID获取日志清理任务
   * @param taskId 任务ID
   * @returns 日志清理任务
   */
  async getCleanupTaskById(taskId: string): Promise<LogCleanupTask | null> {
    return this.cleanupTasks.get(taskId) || null;
  }

  /**
   * 删除日志清理任务
   * @param taskId 任务ID
   * @returns 删除结果
   */
  async deleteCleanupTask(taskId: string): Promise<boolean> {
    return this.cleanupTasks.delete(taskId);
  }

  /**
   * 更新日志级别
   * @param source 日志来源
   * @param level 日志级别
   * @returns 更新结果
   */
  async updateLogLevel(source: string, level: LogLevel): Promise<boolean> {
    // 这里简化处理，实际应该更新对应配置
    // 遍历所有日志配置，更新匹配的来源配置
    let updated = false;
    
    for (const [id, config] of this.logConfigs.entries()) {
      const sourceConfigIndex = config.sourceConfigs.findIndex(sc => sc.source === source);
      if (sourceConfigIndex !== -1) {
        config.sourceConfigs[sourceConfigIndex].logLevel = level;
        this.logConfigs.set(id, config);
        updated = true;
      }
    }
    
    return updated;
  }

  /**
   * 获取日志计数统计
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 按级别统计的日志数量
   */
  async getLogCountByLevel(startTime: Date, endTime: Date): Promise<Record<string, number>> {
    const result: Record<string, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.FATAL]: 0
    };
    
    for (const log of this.logs.values()) {
      if (log.timestamp >= startTime && log.timestamp <= endTime) {
        result[log.level]++;
      }
    }
    
    return result;
  }

  /**
   * 获取日志来源统计
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 按来源统计的日志数量
   */
  async getLogCountBySource(startTime: Date, endTime: Date): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    
    for (const log of this.logs.values()) {
      if (log.timestamp >= startTime && log.timestamp <= endTime) {
        if (!result[log.source]) {
          result[log.source] = 0;
        }
        result[log.source]++;
      }
    }
    
    return result;
  }

  /**
   * 获取日志源类型统计
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 按源类型统计的日志数量
   */
  async getLogCountBySourceType(startTime: Date, endTime: Date): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    
    for (const log of this.logs.values()) {
      if (log.timestamp >= startTime && log.timestamp <= endTime) {
        if (!result[log.sourceType]) {
          result[log.sourceType] = 0;
        }
        result[log.sourceType]++;
      }
    }
    
    return result;
  }

  /**
   * 获取日志小时分布
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 按小时统计的日志数量
   */
  async getLogCountByHour(startTime: Date, endTime: Date): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    
    for (const log of this.logs.values()) {
      if (log.timestamp >= startTime && log.timestamp <= endTime) {
        const hourKey = log.timestamp.toISOString().slice(0, 13); // YYYY-MM-DDTHH
        if (!result[hourKey]) {
          result[hourKey] = 0;
        }
        result[hourKey]++;
      }
    }
    
    return result;
  }

  /**
   * 获取日志趋势数据
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param interval 时间间隔（分钟）
   * @returns 按时间间隔统计的日志数据
   */
  async getLogTrend(startTime: Date, endTime: Date, interval: number): Promise<{
    timestamp: Date;
    count: number;
    byLevel: Record<LogLevel, number>;
  }[]> {
    const result: {
      timestamp: Date;
      count: number;
      byLevel: Record<LogLevel, number>;
    }[] = [];
    
    // 初始化时间间隔
    const currentTime = new Date(startTime.getTime());
    
    while (currentTime <= endTime) {
      const nextTime = new Date(currentTime.getTime() + interval * 60 * 1000);
      
      // 统计当前时间间隔内的日志
      const intervalLogs = Array.from(this.logs.values()).filter(log => {
        return log.timestamp >= currentTime && log.timestamp < nextTime;
      });
      
      // 计算按级别统计
      const byLevel: Record<LogLevel, number> = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
        [LogLevel.FATAL]: 0
      };
      
      for (const log of intervalLogs) {
        byLevel[log.level]++;
      }
      
      result.push({
        timestamp: new Date(currentTime.getTime()),
        count: intervalLogs.length,
        byLevel
      });
      
      // 移动到下一个时间间隔
      currentTime.setTime(nextTime.getTime());
    }
    
    return result;
  }
}