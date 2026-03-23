/**
 * 备份恢复相关实体定义
 * 用于定义备份恢复模块的核心领域对象
 */

/**
 * 备份类型枚举
 */
export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
  LOG = 'log'
}

/**
 * 备份状态枚举
 */
export enum BackupStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 恢复状态枚举
 */
export enum RestoreStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 备份存储位置类型枚举
 */
export enum BackupStorageType {
  LOCAL = 'local',
  S3 = 's3',
  AZURE_BLOB = 'azure_blob',
  GCS = 'gcs',
  FTP = 'ftp',
  SFTP = 'sftp'
}

/**
 * 备份压缩类型枚举
 */
export enum BackupCompressionType {
  NONE = 'none',
  GZIP = 'gzip',
  BZIP2 = 'bzip2',
  ZIP = 'zip',
  LZMA = 'lzma'
}

/**
 * 备份加密类型枚举
 */
export enum BackupEncryptionType {
  NONE = 'none',
  AES_256 = 'aes_256',
  RSA = 'rsa',
  ECC = 'ecc'
}

/**
 * 备份策略枚举
 */
export enum BackupStrategy {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  HOURLY = 'hourly',
  CUSTOM = 'custom'
}

/**
 * 备份配置实体
 * 表示备份系统的配置信息
 */
export class BackupConfig {
  /** 配置ID */
  id: string;
  /** 配置名称 */
  name: string;
  /** 配置描述 */
  description?: string;
  /** 备份类型 */
  backupType: BackupType;
  /** 备份策略 */
  strategy: BackupStrategy;
  /** 备份计划（cron表达式） */
  schedule?: string;
  /** 备份存储位置 */
  storageLocation: string;
  /** 备份存储类型 */
  storageType: BackupStorageType;
  /** 备份压缩类型 */
  compressionType: BackupCompressionType;
  /** 备份加密类型 */
  encryptionType: BackupEncryptionType;
  /** 加密密钥ID */
  encryptionKeyId?: string;
  /** 备份保留策略（天数） */
  retentionDays: number;
  /** 是否启用备份 */
  enabled: boolean;
  /** 是否启用自动清理 */
  autoCleanupEnabled: boolean;
  /** 备份文件前缀 */
  filePrefix?: string;
  /** 备份包含的数据源 */
  includedDataSources: string[];
  /** 备份排除的数据源 */
  excludedDataSources?: string[];
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
   * @param backupType 备份类型
   * @param strategy 备份策略
   * @param storageLocation 备份存储位置
   * @param storageType 备份存储类型
   * @param compressionType 备份压缩类型
   * @param encryptionType 备份加密类型
   * @param retentionDays 备份保留策略（天数）
   * @param enabled 是否启用备份
   * @param autoCleanupEnabled 是否启用自动清理
   * @param includedDataSources 备份包含的数据源
   * @param createdAt 创建时间
   * @param updatedAt 更新时间
   * @param createdBy 创建人
   * @param updatedBy 更新人
   * @param description 配置描述
   * @param schedule 备份计划
   * @param encryptionKeyId 加密密钥ID
   * @param filePrefix 备份文件前缀
   * @param excludedDataSources 备份排除的数据源
   */
  constructor(
    id: string,
    name: string,
    backupType: BackupType,
    strategy: BackupStrategy,
    storageLocation: string,
    storageType: BackupStorageType,
    compressionType: BackupCompressionType,
    encryptionType: BackupEncryptionType,
    retentionDays: number,
    enabled: boolean,
    autoCleanupEnabled: boolean,
    includedDataSources: string[],
    createdAt: Date,
    updatedAt: Date,
    createdBy: string,
    updatedBy: string,
    description?: string,
    schedule?: string,
    encryptionKeyId?: string,
    filePrefix?: string,
    excludedDataSources?: string[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.backupType = backupType;
    this.strategy = strategy;
    this.schedule = schedule;
    this.storageLocation = storageLocation;
    this.storageType = storageType;
    this.compressionType = compressionType;
    this.encryptionType = encryptionType;
    this.encryptionKeyId = encryptionKeyId;
    this.retentionDays = retentionDays;
    this.enabled = enabled;
    this.autoCleanupEnabled = autoCleanupEnabled;
    this.filePrefix = filePrefix;
    this.includedDataSources = includedDataSources;
    this.excludedDataSources = excludedDataSources;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
  }
}

/**
 * 备份任务实体
 * 表示一个备份任务
 */
export class BackupTask {
  /** 任务ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 备份配置ID */
  backupConfigId: string;
  /** 备份类型 */
  backupType: BackupType;
  /** 备份状态 */
  status: BackupStatus;
  /** 备份开始时间 */
  startTime?: Date;
  /** 备份结束时间 */
  endTime?: Date;
  /** 备份文件路径 */
  backupFilePath?: string;
  /** 备份文件大小（字节） */
  fileSize?: number;
  /** 备份持续时间（秒） */
  durationSeconds?: number;
  /** 备份的数据源 */
  dataSources: string[];
  /** 备份进度（百分比） */
  progress?: number;
  /** 失败原因 */
  failureReason?: string;
  /** 创建时间 */
  createdAt: Date;
  /** 创建人 */
  createdBy: string;
  /** 关联的父备份ID（用于增量备份） */
  parentBackupId?: string;
  /** 备份校验和 */
  checksum?: string;

  /**
   * 构造函数
   * @param id 任务ID
   * @param name 任务名称
   * @param backupConfigId 备份配置ID
   * @param backupType 备份类型
   * @param status 备份状态
   * @param dataSources 备份的数据源
   * @param createdAt 创建时间
   * @param createdBy 创建人
   * @param startTime 备份开始时间
   * @param endTime 备份结束时间
   * @param backupFilePath 备份文件路径
   * @param fileSize 备份文件大小
   * @param durationSeconds 备份持续时间
   * @param progress 备份进度
   * @param failureReason 失败原因
   * @param parentBackupId 关联的父备份ID
   * @param checksum 备份校验和
   */
  constructor(
    id: string,
    name: string,
    backupConfigId: string,
    backupType: BackupType,
    status: BackupStatus,
    dataSources: string[],
    createdAt: Date,
    createdBy: string,
    startTime?: Date,
    endTime?: Date,
    backupFilePath?: string,
    fileSize?: number,
    durationSeconds?: number,
    progress?: number,
    failureReason?: string,
    parentBackupId?: string,
    checksum?: string
  ) {
    this.id = id;
    this.name = name;
    this.backupConfigId = backupConfigId;
    this.backupType = backupType;
    this.status = status;
    this.dataSources = dataSources;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.startTime = startTime;
    this.endTime = endTime;
    this.backupFilePath = backupFilePath;
    this.fileSize = fileSize;
    this.durationSeconds = durationSeconds;
    this.progress = progress;
    this.failureReason = failureReason;
    this.parentBackupId = parentBackupId;
    this.checksum = checksum;
  }
}

/**
 * 恢复任务实体
 * 表示一个恢复任务
 */
export class RestoreTask {
  /** 任务ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 关联的备份ID */
  backupTaskId: string;
  /** 恢复状态 */
  status: RestoreStatus;
  /** 恢复开始时间 */
  startTime?: Date;
  /** 恢复结束时间 */
  endTime?: Date;
  /** 恢复的目标位置 */
  targetLocation?: string;
  /** 恢复的数据源 */
  dataSources: string[];
  /** 恢复进度（百分比） */
  progress?: number;
  /** 失败原因 */
  failureReason?: string;
  /** 创建时间 */
  createdAt: Date;
  /** 创建人 */
  createdBy: string;
  /** 是否覆盖现有数据 */
  overwriteExisting: boolean;
  /** 恢复的备份时间点 */
  restorePoint?: Date;

  /**
   * 构造函数
   * @param id 任务ID
   * @param name 任务名称
   * @param backupTaskId 关联的备份ID
   * @param status 恢复状态
   * @param dataSources 恢复的数据源
   * @param overwriteExisting 是否覆盖现有数据
   * @param createdAt 创建时间
   * @param createdBy 创建人
   * @param startTime 恢复开始时间
   * @param endTime 恢复结束时间
   * @param targetLocation 恢复的目标位置
   * @param progress 恢复进度
   * @param failureReason 失败原因
   * @param restorePoint 恢复的备份时间点
   */
  constructor(
    id: string,
    name: string,
    backupTaskId: string,
    status: RestoreStatus,
    dataSources: string[],
    overwriteExisting: boolean,
    createdAt: Date,
    createdBy: string,
    startTime?: Date,
    endTime?: Date,
    targetLocation?: string,
    progress?: number,
    failureReason?: string,
    restorePoint?: Date
  ) {
    this.id = id;
    this.name = name;
    this.backupTaskId = backupTaskId;
    this.status = status;
    this.dataSources = dataSources;
    this.overwriteExisting = overwriteExisting;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.startTime = startTime;
    this.endTime = endTime;
    this.targetLocation = targetLocation;
    this.progress = progress;
    this.failureReason = failureReason;
    this.restorePoint = restorePoint;
  }
}

/**
 * 备份存储配置实体
 * 表示备份存储位置的配置信息
 */
export class BackupStorageConfig {
  /** 配置ID */
  id: string;
  /** 配置名称 */
  name: string;
  /** 存储类型 */
  storageType: BackupStorageType;
  /** 存储位置 */
  location: string;
  /** 访问密钥 */
  accessKey?: string;
  /** 秘密密钥 */
  secretKey?: string;
  /** 端点URL */
  endpointUrl?: string;
  /** 区域 */
  region?: string;
  /** 桶名称（S3/Azure/GCS） */
  bucketName?: string;
  /** 容器名称（Azure） */
  containerName?: string;
  /** 路径前缀 */
  pathPrefix?: string;
  /** 是否启用SSL */
  sslEnabled: boolean;
  /** 连接超时（秒） */
  connectionTimeoutSeconds: number;
  /** 描述 */
  description?: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;

  /**
   * 构造函数
   * @param id 配置ID
   * @param name 配置名称
   * @param storageType 存储类型
   * @param location 存储位置
   * @param sslEnabled 是否启用SSL
   * @param connectionTimeoutSeconds 连接超时
   * @param createdAt 创建时间
   * @param updatedAt 更新时间
   * @param accessKey 访问密钥
   * @param secretKey 秘密密钥
   * @param endpointUrl 端点URL
   * @param region 区域
   * @param bucketName 桶名称
   * @param containerName 容器名称
   * @param pathPrefix 路径前缀
   * @param description 描述
   */
  constructor(
    id: string,
    name: string,
    storageType: BackupStorageType,
    location: string,
    sslEnabled: boolean,
    connectionTimeoutSeconds: number,
    createdAt: Date,
    updatedAt: Date,
    accessKey?: string,
    secretKey?: string,
    endpointUrl?: string,
    region?: string,
    bucketName?: string,
    containerName?: string,
    pathPrefix?: string,
    description?: string
  ) {
    this.id = id;
    this.name = name;
    this.storageType = storageType;
    this.location = location;
    this.sslEnabled = sslEnabled;
    this.connectionTimeoutSeconds = connectionTimeoutSeconds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.endpointUrl = endpointUrl;
    this.region = region;
    this.bucketName = bucketName;
    this.containerName = containerName;
    this.pathPrefix = pathPrefix;
    this.description = description;
  }
}

/**
 * 备份验证结果实体
 * 表示备份验证的结果
 */
export class BackupValidationResult {
  /** 验证ID */
  id: string;
  /** 关联的备份ID */
  backupTaskId: string;
  /** 验证状态 */
  status: 'passed' | 'failed' | 'warning';
  /** 验证时间 */
  validatedAt: Date;
  /** 验证消息 */
  message?: string;
  /** 验证的文件路径 */
  filePath: string;
  /** 验证的校验和 */
  validatedChecksum?: string;
  /** 预期的校验和 */
  expectedChecksum?: string;
  /** 验证者 */
  validatedBy: string;

  /**
   * 构造函数
   * @param id 验证ID
   * @param backupTaskId 关联的备份ID
   * @param status 验证状态
   * @param validatedAt 验证时间
   * @param filePath 验证的文件路径
   * @param validatedBy 验证者
   * @param message 验证消息
   * @param validatedChecksum 验证的校验和
   * @param expectedChecksum 预期的校验和
   */
  constructor(
    id: string,
    backupTaskId: string,
    status: 'passed' | 'failed' | 'warning',
    validatedAt: Date,
    filePath: string,
    validatedBy: string,
    message?: string,
    validatedChecksum?: string,
    expectedChecksum?: string
  ) {
    this.id = id;
    this.backupTaskId = backupTaskId;
    this.status = status;
    this.validatedAt = validatedAt;
    this.filePath = filePath;
    this.validatedBy = validatedBy;
    this.message = message;
    this.validatedChecksum = validatedChecksum;
    this.expectedChecksum = expectedChecksum;
  }
}

/**
 * 备份清理任务实体
 * 表示一个备份清理任务
 */
export class BackupCleanupTask {
  /** 任务ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 清理的备份配置ID */
  backupConfigId: string;
  /** 清理策略（天数） */
  retentionDays: number;
  /** 任务状态 */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** 清理的备份数量 */
  cleanedBackupCount?: number;
  /** 释放的空间（字节） */
  freedSpace?: number;
  /** 开始时间 */
  startTime?: Date;
  /** 结束时间 */
  endTime?: Date;
  /** 失败原因 */
  failureReason?: string;
  /** 创建时间 */
  createdAt: Date;
  /** 创建人 */
  createdBy: string;

  /**
   * 构造函数
   * @param id 任务ID
   * @param name 任务名称
   * @param backupConfigId 清理的备份配置ID
   * @param retentionDays 清理策略
   * @param status 任务状态
   * @param createdAt 创建时间
   * @param createdBy 创建人
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param cleanedBackupCount 清理的备份数量
   * @param freedSpace 释放的空间
   * @param failureReason 失败原因
   */
  constructor(
    id: string,
    name: string,
    backupConfigId: string,
    retentionDays: number,
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    createdAt: Date,
    createdBy: string,
    startTime?: Date,
    endTime?: Date,
    cleanedBackupCount?: number,
    freedSpace?: number,
    failureReason?: string
  ) {
    this.id = id;
    this.name = name;
    this.backupConfigId = backupConfigId;
    this.retentionDays = retentionDays;
    this.status = status;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.startTime = startTime;
    this.endTime = endTime;
    this.cleanedBackupCount = cleanedBackupCount;
    this.freedSpace = freedSpace;
    this.failureReason = failureReason;
  }
}
