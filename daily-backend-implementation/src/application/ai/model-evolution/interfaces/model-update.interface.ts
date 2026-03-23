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
  applyUpdate(updateProposal: any): Promise<any>;

  /**
   * 批量应用模型更新建议
   * @param updateProposals 模型更新建议列表
   * @returns 批量更新结果
   */
  batchApplyUpdates(updateProposals: any[]): Promise<any>;

  /**
   * 验证更新建议的合法性
   * @param updateProposal 模型更新建议
   * @returns 验证结果
   */
  validateUpdateProposal(updateProposal: any): Promise<any>;

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
  applyUpdate(currentModel: any, updateProposal: any): Promise<any>;

  /**
   * 验证更新建议与当前策略的兼容性
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 验证结果
   */
  validateProposal(currentModel: any, updateProposal: any): Promise<boolean>;
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
  recordUpdate(updateRecord: any): Promise<boolean>;

  /**
   * 获取模型更新历史
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 更新历史列表
   */
  getUpdateHistory(userId: string, options?: any): Promise<any[]>;

  /**
   * 获取特定版本的模型
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 特定版本的模型
   */
  getModelByVersion(userId: string, versionId: string): Promise<any | null>;

  /**
   * 清理旧的更新历史
   * @param userId 用户ID
   * @param retentionPolicy 保留策略
   * @returns 清理结果
   */
  cleanupOldHistory(userId: string, retentionPolicy: any): Promise<number>;
}

/**
 * 模型一致性验证器接口
 * 负责验证模型的一致性和完整性
 */
export interface ModelConsistencyValidator {
  /**
   * 验证模型一致性
   * @param model 认知模型
   * @returns 验证结果
   */
  validate(model: any): Promise<ModelConsistencyValidationResult>;
}

/**
 * 模型一致性验证结果
 */
export interface ModelConsistencyValidationResult {
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
 * 模型更新工厂接口
 * 负责创建模型更新相关的服务和组件
 */
export interface ModelUpdateFactory {
  /**
   * 创建模型更新服务
   * @returns 模型更新服务实例
   */
  createModelUpdateService(): ModelUpdateService;

  /**
   * 创建更新策略
   * @param type 更新策略类型
   * @returns 更新策略实例
   */
  createUpdateStrategy(type: string): ModelUpdateStrategy;

  /**
   * 创建更新历史服务
   * @returns 更新历史服务实例
   */
  createUpdateHistoryService(): UpdateHistoryService;

  /**
   * 创建模型一致性验证器
   * @returns 模型一致性验证器实例
   */
  createModelConsistencyValidator(): ModelConsistencyValidator;
}