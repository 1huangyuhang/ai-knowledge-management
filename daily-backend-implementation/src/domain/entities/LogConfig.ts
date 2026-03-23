/**
 * 日志配置相关实体定义
 * 用于定义日志管理模块的核心领域对象
 */

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * 日志源类型枚举
 */
export enum LogSourceType {
  APPLICATION = 'application',
  DATABASE = 'database',
  API = 'api',
  SYSTEM = 'system',
  EXTERNAL_SERVICE = 'external_service'
}

/**
 * 日志保留策略枚举
 */
export enum LogRetentionPolicy {
  SEVEN_DAYS = '7_days',
  THIRTY_DAYS = '30_days',
  NINETY_DAYS = '90_days',
  SIX_MONTHS = '6_months',
  ONE_YEAR = '1_year',
  INFINITE = 'infinite'
}

/**
 * 日志轮转策略枚举
 */
export enum LogRotationPolicy {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SIZE_BASED = 'size_based',
  HOURLY = 'hourly'
}

/**
 * 日志导出格式枚举
 */
export enum LogExportFormat {
  JSON = 'json',
  CSV = 'csv',
  TEXT = 'text',
  XML = 'xml'
}

/**
 * 日志实体
 * 表示一条完整的日志记录
 */
export class Log {
  /** 日志ID */
  id: string;
  /** 日志级别 */
  level: LogLevel;
  /** 日志来源 */
  source: string;
  /** 日志源类型 */
  sourceType: LogSourceType;
  /** 日志消息 */
  message: string;
  /** 日志详情 */
  details?: Record<string, any>;
  /** 跟踪ID，用于关联请求链 */
  traceId?: string;
  /** 相关资源ID */
  resourceId?: string;
  /** 日志时间戳 */
  timestamp: Date;
  /** 环境信息 */
  environment?: string;
  /** 服务名称 */
  serviceName?: string;
  /** 服务版本 */
  serviceVersion?: string;
  /** 主机名 */
  hostname?: string;
  /** 进程ID */
  pid?: number;
  /** 用户ID */
  userId?: string;

  /**
   * 构造函数
   * @param id 日志ID
   * @param level 日志级别
   * @param source 日志来源
   * @param sourceType 日志源类型
   * @param message 日志消息
   * @param timestamp 日志时间戳
   * @param details 日志详情
   * @param traceId 跟踪ID
   * @param resourceId 相关资源ID
   * @param environment 环境信息
   * @param serviceName 服务名称
   * @param serviceVersion 服务版本
   * @param hostname 主机名
   * @param pid 进程ID
   * @param userId 用户ID
   */
  constructor(
    id: string,
    level: LogLevel,
    source: string,
    sourceType: LogSourceType,
    message: string,
    timestamp: Date,
    details?: Record<string, any>,
    traceId?: string,
    resourceId?: string,
    environment?: string,
    serviceName?: string,
    serviceVersion?: string,
    hostname?: string,
    pid?: number,
    userId?: string
  ) {
    this.id = id;
    this.level = level;
    this.source = source;
    this.sourceType = sourceType;
    this.message = message;
    this.details = details;
    this.traceId = traceId;
    this.resourceId = resourceId;
    this.timestamp = timestamp;
    this.environment = environment;
    this.serviceName = serviceName;
    this.serviceVersion = serviceVersion;
    this.hostname = hostname;
    this.pid = pid;
    this.userId = userId;
  }
}

/**
 * 日志配置实体
 * 表示日志系统的配置信息
 */
export class LogConfig {
  /** 配置ID */
  id: string;
  /** 配置名称 */
  name: string;
  /** 配置描述 */
  description?: string;
  /** 默认日志级别 */
  defaultLogLevel: LogLevel;
  /** 日志保留策略 */
  retentionPolicy: LogRetentionPolicy;
  /** 日志轮转策略 */
  rotationPolicy: LogRotationPolicy;
  /** 日志轮转大小（仅当rotationPolicy为SIZE_BASED时有效，单位：MB） */
  rotationSizeMB?: number;
  /** 是否启用日志压缩 */
  compressionEnabled: boolean;
  /** 是否启用结构化日志 */
  structuredLoggingEnabled: boolean;
  /** 是否启用追踪日志 */
  traceLoggingEnabled: boolean;
  /** 日志来源配置 */
  sourceConfigs: LogSourceConfig[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 创建人 */
  createdBy: string;
  /** 更新人 */
  updatedBy: string;

  /**
   * 构造函数
   * @param id 配置ID
   * @param name 配置名称
   * @param defaultLogLevel 默认日志级别
   * @param retentionPolicy 日志保留策略
   * @param rotationPolicy 日志轮转策略
   * @param compressionEnabled 是否启用日志压缩
   * @param structuredLoggingEnabled 是否启用结构化日志
   * @param traceLoggingEnabled 是否启用追踪日志
   * @param sourceConfigs 日志来源配置
   * @param createdAt 创建时间
   * @param updatedAt 更新时间
   * @param createdBy 创建人
   * @param updatedBy 更新人
   * @param description 配置描述
   * @param rotationSizeMB 日志轮转大小
   */
  constructor(
    id: string,
    name: string,
    defaultLogLevel: LogLevel,
    retentionPolicy: LogRetentionPolicy,
    rotationPolicy: LogRotationPolicy,
    compressionEnabled: boolean,
    structuredLoggingEnabled: boolean,
    traceLoggingEnabled: boolean,
    sourceConfigs: LogSourceConfig[],
    createdAt: Date,
    updatedAt: Date,
    createdBy: string,
    updatedBy: string,
    description?: string,
    rotationSizeMB?: number
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.defaultLogLevel = defaultLogLevel;
    this.retentionPolicy = retentionPolicy;
    this.rotationPolicy = rotationPolicy;
    this.rotationSizeMB = rotationSizeMB;
    this.compressionEnabled = compressionEnabled;
    this.structuredLoggingEnabled = structuredLoggingEnabled;
    this.traceLoggingEnabled = traceLoggingEnabled;
    this.sourceConfigs = sourceConfigs;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
  }
}

/**
 * 日志来源配置实体
 * 表示特定日志来源的配置信息
 */
export class LogSourceConfig {
  /** 来源名称 */
  source: string;
  /** 来源类型 */
  sourceType: LogSourceType;
  /** 日志级别 */
  logLevel: LogLevel;
  /** 是否启用 */
  enabled: boolean;
  /** 自定义字段 */
  customFields?: Record<string, any>;

  /**
   * 构造函数
   * @param source 来源名称
   * @param sourceType 来源类型
   * @param logLevel 日志级别
   * @param enabled 是否启用
   * @param customFields 自定义字段
   */
  constructor(
    source: string,
    sourceType: LogSourceType,
    logLevel: LogLevel,
    enabled: boolean,
    customFields?: Record<string, any>
  ) {
    this.source = source;
    this.sourceType = sourceType;
    this.logLevel = logLevel;
    this.enabled = enabled;
    this.customFields = customFields;
  }
}

/**
 * 日志查询条件实体
 * 用于定义日志查询的过滤条件
 */
export class LogQuery {
  /** 日志级别列表 */
  levels?: LogLevel[];
  /** 日志来源列表 */
  sources?: string[];
  /** 日志源类型列表 */
  sourceTypes?: LogSourceType[];
  /** 关键字 */
  keywords?: string[];
  /** 跟踪ID */
  traceId?: string;
  /** 资源ID */
  resourceId?: string;
  /** 用户ID */
  userId?: string;
  /** 开始时间 */
  startTime?: Date;
  /** 结束时间 */
  endTime?: Date;
  /** 环境 */
  environment?: string;
  /** 服务名称 */
  serviceName?: string;
  /** 主机名 */
  hostname?: string;
  /** 分页页码 */
  page?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: 'asc' | 'desc';

  /**
   * 构造函数
   * @param levels 日志级别列表
   * @param sources 日志来源列表
   * @param sourceTypes 日志源类型列表
   * @param keywords 关键字
   * @param traceId 跟踪ID
   * @param resourceId 资源ID
   * @param userId 用户ID
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param environment 环境
   * @param serviceName 服务名称
   * @param hostname 主机名
   * @param page 分页页码
   * @param pageSize 每页大小
   * @param sortField 排序字段
   * @param sortDirection 排序方向
   */
  constructor(
    levels?: LogLevel[],
    sources?: string[],
    sourceTypes?: LogSourceType[],
    keywords?: string[],
    traceId?: string,
    resourceId?: string,
    userId?: string,
    startTime?: Date,
    endTime?: Date,
    environment?: string,
    serviceName?: string,
    hostname?: string,
    page?: number,
    pageSize?: number,
    sortField?: string,
    sortDirection?: 'asc' | 'desc'
  ) {
    this.levels = levels;
    this.sources = sources;
    this.sourceTypes = sourceTypes;
    this.keywords = keywords;
    this.traceId = traceId;
    this.resourceId = resourceId;
    this.userId = userId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.environment = environment;
    this.serviceName = serviceName;
    this.hostname = hostname;
    this.page = page;
    this.pageSize = pageSize;
    this.sortField = sortField;
    this.sortDirection = sortDirection;
  }
}

/**
 * 日志导出任务实体
 * 表示一个日志导出任务
 */
export class LogExportTask {
  /** 任务ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 查询条件 */
  query: LogQuery;
  /** 导出格式 */
  format: LogExportFormat;
  /** 导出文件路径 */
  exportPath?: string;
  /** 任务状态 */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** 进度百分比 */
  progress?: number;
  /** 导出文件大小（字节） */
  fileSize?: number;
  /** 创建时间 */
  createdAt: Date;
  /** 开始时间 */
  startedAt?: Date;
  /** 完成时间 */
  completedAt?: Date;
  /** 创建人 */
  createdBy: string;
  /** 失败原因 */
  failureReason?: string;

  /**
   * 构造函数
   * @param id 任务ID
   * @param name 任务名称
   * @param query 查询条件
   * @param format 导出格式
   * @param status 任务状态
   * @param createdAt 创建时间
   * @param createdBy 创建人
   * @param progress 进度百分比
   * @param exportPath 导出文件路径
   * @param fileSize 导出文件大小
   * @param startedAt 开始时间
   * @param completedAt 完成时间
   * @param failureReason 失败原因
   */
  constructor(
    id: string,
    name: string,
    query: LogQuery,
    format: LogExportFormat,
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    createdAt: Date,
    createdBy: string,
    progress?: number,
    exportPath?: string,
    fileSize?: number,
    startedAt?: Date,
    completedAt?: Date,
    failureReason?: string
  ) {
    this.id = id;
    this.name = name;
    this.query = query;
    this.format = format;
    this.status = status;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.progress = progress;
    this.exportPath = exportPath;
    this.fileSize = fileSize;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.failureReason = failureReason;
  }
}

/**
 * 日志统计实体
 * 表示日志统计结果
 */
export class LogStatistics {
  /** 时间范围开始 */
  startTime: Date;
  /** 时间范围结束 */
  endTime: Date;
  /** 日志总数 */
  totalCount: number;
  /** 按级别统计 */
  byLevel: Record<LogLevel, number>;
  /** 按来源统计 */
  bySource: Record<string, number>;
  /** 按来源类型统计 */
  bySourceType: Record<LogSourceType, number>;
  /** 按时间分布（小时） */
  hourlyDistribution: Record<string, number>;
  /** 错误日志总数 */
  errorCount: number;
  /** 警告日志总数 */
  warningCount: number;
  /** 信息日志总数 */
  infoCount: number;

  /**
   * 构造函数
   * @param startTime 时间范围开始
   * @param endTime 时间范围结束
   * @param totalCount 日志总数
   * @param byLevel 按级别统计
   * @param bySource 按来源统计
   * @param bySourceType 按来源类型统计
   * @param hourlyDistribution 按时间分布
   * @param errorCount 错误日志总数
   * @param warningCount 警告日志总数
   * @param infoCount 信息日志总数
   */
  constructor(
    startTime: Date,
    endTime: Date,
    totalCount: number,
    byLevel: Record<LogLevel, number>,
    bySource: Record<string, number>,
    bySourceType: Record<LogSourceType, number>,
    hourlyDistribution: Record<string, number>,
    errorCount: number,
    warningCount: number,
    infoCount: number
  ) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.totalCount = totalCount;
    this.byLevel = byLevel;
    this.bySource = bySource;
    this.bySourceType = bySourceType;
    this.hourlyDistribution = hourlyDistribution;
    this.errorCount = errorCount;
    this.warningCount = warningCount;
    this.infoCount = infoCount;
  }
}

/**
 * 日志清理任务实体
 * 表示一个日志清理任务
 */
export class LogCleanupTask {
  /** 任务ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 保留策略 */
  retentionPolicy: LogRetentionPolicy;
  /** 清理日志来源列表 */
  sources?: string[];
  /** 任务状态 */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** 清理日志数量 */
  cleanedCount?: number;
  /** 释放空间（字节） */
  freedSpace?: number;
  /** 创建时间 */
  createdAt: Date;
  /** 开始时间 */
  startedAt?: Date;
  /** 完成时间 */
  completedAt?: Date;
  /** 创建人 */
  createdBy: string;
  /** 失败原因 */
  failureReason?: string;

  /**
   * 构造函数
   * @param id 任务ID
   * @param name 任务名称
   * @param retentionPolicy 保留策略
   * @param status 任务状态
   * @param createdAt 创建时间
   * @param createdBy 创建人
   * @param sources 清理日志来源列表
   * @param cleanedCount 清理日志数量
   * @param freedSpace 释放空间
   * @param startedAt 开始时间
   * @param completedAt 完成时间
   * @param failureReason 失败原因
   */
  constructor(
    id: string,
    name: string,
    retentionPolicy: LogRetentionPolicy,
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    createdAt: Date,
    createdBy: string,
    sources?: string[],
    cleanedCount?: number,
    freedSpace?: number,
    startedAt?: Date,
    completedAt?: Date,
    failureReason?: string
  ) {
    this.id = id;
    this.name = name;
    this.retentionPolicy = retentionPolicy;
    this.status = status;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.sources = sources;
    this.cleanedCount = cleanedCount;
    this.freedSpace = freedSpace;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.failureReason = failureReason;
  }
}
