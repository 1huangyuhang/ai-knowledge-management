/**
 * 模型更新服务接口
 * 负责接收和处理认知模型更新建议
 */
export interface ModelUpdateService {
  /**
   * 应用单个模型更新建议
   * @param updateProposal 模型更新建议
   * @returns 更新结果
   */
  applyUpdate(updateProposal: CognitiveModelUpdateProposal): Promise<ModelUpdateResult>;

  /**
   * 批量应用模型更新建议
   * @param updateProposals 模型更新建议列表
   * @returns 批量更新结果
   */
  batchApplyUpdates(updateProposals: CognitiveModelUpdateProposal[]): Promise<BatchModelUpdateResult>;

  /**
   * 验证更新建议的合法性
   * @param updateProposal 模型更新建议
   * @returns 验证结果
   */
  validateUpdateProposal(updateProposal: CognitiveModelUpdateProposal): Promise<UpdateProposalValidationResult>;

  /**
   * 设置模型更新策略
   * @param strategy 模型更新策略
   */
  setUpdateStrategy(strategy: ModelUpdateStrategy): void;

  /**
   * 获取当前模型更新策略
   * @returns 当前模型更新策略
   */
  getUpdateStrategy(): ModelUpdateStrategy;
}

/**
 * 模型更新策略接口
 * 定义不同的模型更新算法
 */
export interface ModelUpdateStrategy {
  /**
   * 策略名称
   */
  name: string;

  /**
   * 应用更新到模型
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 更新后的模型
   */
  applyUpdate(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<UserCognitiveModel>;

  /**
   * 验证更新建议与当前策略的兼容性
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 验证结果
   */
  validateProposal(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<boolean>;
}

/**
 * 模型一致性验证器接口
 */
export interface ModelConsistencyValidator {
  /**
   * 验证模型的一致性
   * @param model 认知模型
   * @returns 验证结果
   */
  validate(model: UserCognitiveModel): Promise<ModelConsistencyValidationResult>;
}

/**
 * 模型一致性验证结果
 */
export interface ModelConsistencyValidationResult {
  /**
   * 是否有效
   */
  isValid: boolean;
  /**
   * 错误信息
   */
  errors: string[];
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
  conceptsToAdd?: CognitiveConcept[];

  /**
   * 建议更新的概念
   */
  conceptsToUpdate?: { conceptId: string; updates: Partial<CognitiveConcept> }[];

  /**
   * 建议删除的概念ID
   */
  conceptIdsToRemove?: string[];

  /**
   * 建议添加的关系
   */
  relationsToAdd?: CognitiveRelation[];

  /**
   * 建议更新的关系
   */
  relationsToUpdate?: { relationId: string; updates: Partial<CognitiveRelation> }[];

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
 * 更新建议验证结果
 */
export interface UpdateProposalValidationResult {
  /**
   * 是否有效
   */
  isValid: boolean;
  /**
   * 错误信息
   */
  errors: string[];
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
 * 更新历史查询选项
 */
export interface UpdateHistoryQueryOptions {
  /**
   * 起始时间
   */
  startTime?: Date;
  /**
   * 结束时间
   */
  endTime?: Date;
  /**
   * 限制数量
   */
  limit?: number;
  /**
   * 偏移量
   */
  offset?: number;
  /**
   * 更新类型过滤
   */
  updateType?: ModelUpdateType;
  /**
   * 更新来源过滤
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
   * 是否保留重要更新
   */
  keepImportantUpdates: boolean;
}

/**
 * 更新历史记录服务接口
 * 负责记录和管理模型更新历史
 */
export interface UpdateHistoryService {
  /**
   * 记录模型更新历史
   * @param updateRecord 更新记录
   * @returns 记录结果
   */
  recordUpdate(updateRecord: ModelUpdateRecord): Promise<boolean>;

  /**
   * 获取模型更新历史
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 更新历史列表
   */
  getUpdateHistory(userId: string, options?: UpdateHistoryQueryOptions): Promise<ModelUpdateRecord[]>;

  /**
   * 获取特定版本的模型
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 特定版本的模型
   */
  getModelByVersion(userId: string, versionId: string): Promise<UserCognitiveModel | null>;

  /**
   * 清理旧的更新历史
   * @param userId 用户ID
   * @param retentionPolicy 保留策略
   * @returns 清理结果
   */
  cleanupOldHistory(userId: string, retentionPolicy: HistoryRetentionPolicy): Promise<number>;
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

// 导入外部类型
import { CognitiveConcept, CognitiveRelation, UserCognitiveModel } from '../../../domain/entities/user-cognitive-model';
