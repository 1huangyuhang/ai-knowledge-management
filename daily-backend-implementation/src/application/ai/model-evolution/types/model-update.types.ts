/**
 * 模型更新类型枚举
 */
export enum ModelUpdateType {
  /**
   * 增量更新
   */
  INCREMENTAL = 'INCREMENTAL',
  /**
   * 全量更新
   */
  FULL = 'FULL',
  /**
   * 重构更新
   */
  RESTRUCTURE = 'RESTRUCTURE'
}

/**
 * 更新来源枚举
 */
export enum UpdateSource {
  /**
   * AI生成
   */
  AI_GENERATED = 'AI_GENERATED',
  /**
   * 用户手动更新
   */
  USER_MANUAL = 'USER_MANUAL',
  /**
   * 系统自动更新
   */
  SYSTEM_AUTOMATIC = 'SYSTEM_AUTOMATIC'
}

/**
 * 模型更新错误类型
 */
export enum ModelUpdateErrorType {
  /**
   * 模型不存在错误
   */
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  /**
   * 更新建议无效错误
   */
  INVALID_UPDATE_PROPOSAL = 'INVALID_UPDATE_PROPOSAL',
  /**
   * 版本不兼容错误
   */
  VERSION_INCOMPATIBLE = 'VERSION_INCOMPATIBLE',
  /**
   * 模型一致性错误
   */
  MODEL_INCONSISTENT = 'MODEL_INCONSISTENT',
  /**
   * 数据库操作错误
   */
  DATABASE_ERROR = 'DATABASE_ERROR',
  /**
   * 未知错误
   */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 认知模型更新建议
 */
export interface CognitiveModelUpdateProposal {
  /**
   * 更新建议ID
   */
  id: string;

  /**
   * 用户ID
   */
  userId: string;

  /**
   * 当前模型版本
   */
  currentVersion: string;

  /**
   * 更新类型
   */
  updateType: ModelUpdateType;

  /**
   * 建议添加的概念
   */
  conceptsToAdd?: any[];

  /**
   * 建议更新的概念
   */
  conceptsToUpdate?: { conceptId: string; updates: Partial<any> }[];

  /**
   * 建议删除的概念ID
   */
  conceptIdsToRemove?: string[];

  /**
   * 建议添加的关系
   */
  relationsToAdd?: any[];

  /**
   * 建议更新的关系
   */
  relationsToUpdate?: { relationId: string; updates: Partial<any> }[];

  /**
   * 建议删除的关系ID
   */
  relationIdsToRemove?: string[];

  /**
   * 更新置信度
   */
  confidenceScore: number;

  /**
   * 更新来源
   */
  source: UpdateSource;

  /**
   * 更新时间
   */
  timestamp: Date;

  /**
   * 相关的思维片段ID
   */
  relatedThoughtIds?: string[];
}

/**
 * 模型更新结果
 */
export interface ModelUpdateResult {
  /**
   * 更新是否成功
   */
  success: boolean;

  /**
   * 更新后的模型版本
   */
  newVersion: string;

  /**
   * 更新前的模型版本
   */
  oldVersion: string;

  /**
   * 更新详情
   */
  updateDetails: {
    /**
     * 成功添加的概念数量
     */
    conceptsAdded: number;
    /**
     * 成功更新的概念数量
     */
    conceptsUpdated: number;
    /**
     * 成功删除的概念数量
     */
    conceptsRemoved: number;
    /**
     * 成功添加的关系数量
     */
    relationsAdded: number;
    /**
     * 成功更新的关系数量
     */
    relationsUpdated: number;
    /**
     * 成功删除的关系数量
     */
    relationsRemoved: number;
  };

  /**
   * 更新时间
   */
  timestamp: Date;

  /**
   * 错误信息（如果更新失败）
   */
  error?: string;
}

/**
 * 批量模型更新结果
 */
export interface BatchModelUpdateResult {
  /**
   * 总更新数量
   */
  totalUpdates: number;
  /**
   * 成功更新数量
   */
  successfulUpdates: number;
  /**
   * 失败更新数量
   */
  failedUpdates: number;
  /**
   * 详细更新结果
   */
  results: ModelUpdateResult[];
  /**
   * 批量更新时间
   */
  timestamp: Date;
}

/**
 * 模型更新记录
 */
export interface ModelUpdateRecord {
  /**
   * 记录ID
   */
  id: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 更新前版本
   */
  fromVersion: string;
  /**
   * 更新后版本
   */
  toVersion: string;
  /**
   * 更新类型
   */
  updateType: ModelUpdateType;
  /**
   * 更新来源
   */
  source: UpdateSource;
  /**
   * 更新详情
   */
  updateDetails: {
    conceptsAdded: number;
    conceptsUpdated: number;
    conceptsRemoved: number;
    relationsAdded: number;
    relationsUpdated: number;
    relationsRemoved: number;
  };
  /**
   * 更新置信度
   */
  confidenceScore: number;
  /**
   * 更新时间
   */
  timestamp: Date;
  /**
   * 相关的思维片段ID
   */
  relatedThoughtIds?: string[];
}

/**
 * 更新建议验证结果
 */
export interface UpdateProposalValidationResult {
  /**
   * 验证是否通过
   */
  isValid: boolean;
  /**
   * 错误信息列表
   */
  errors: string[];
  /**
   * 警告信息列表
   */
  warnings: string[];
  /**
   * 验证时间
   */
  timestamp: Date;
}

/**
 * 更新历史查询选项
 */
export interface UpdateHistoryQueryOptions {
  /**
   * 页码
   */
  page?: number;
  /**
   * 每页数量
   */
  limit?: number;
  /**
   * 开始时间
   */
  startTime?: Date;
  /**
   * 结束时间
   */
  endTime?: Date;
  /**
   * 更新类型
   */
  updateType?: ModelUpdateType;
  /**
   * 更新来源
   */
  source?: UpdateSource;
}

/**
 * 历史保留策略
 */
export interface HistoryRetentionPolicy {
  /**
   * 保留天数
   */
  retentionDays: number;
  /**
   * 是否保留最新版本
   */
  keepLatestVersion: boolean;
  /**
   * 是否保留重要更新
   */
  keepImportantUpdates: boolean;
}

/**
 * 模型更新服务配置
 */
export interface ModelUpdateServiceConfig {
  /**
   * 默认更新策略
   */
  defaultUpdateStrategy: ModelUpdateType;
  /**
   * 更新建议置信度阈值
   */
  confidenceThreshold: number;
  /**
   * 批量更新最大数量
   */
  batchUpdateLimit: number;
  /**
   * 更新历史保留天数
   */
  historyRetentionDays: number;
  /**
   * 是否启用并发控制
   */
  enableConcurrencyControl: boolean;
  /**
   * 缓存过期时间（秒）
   */
  cacheExpirationSeconds: number;
}