/**
 * 模型更新服务实现类
 * 负责接收和处理认知模型更新建议
 */
import { v4 as uuidv4 } from 'uuid';
import { ModelUpdateService, ModelUpdateStrategy } from '../interfaces/model-update.interface';
import { IncrementalUpdateStrategy } from './strategies/incremental-update-strategy';
import { ModelConsistencyValidatorImpl } from './model-consistency-validator';

// 导入类型定义
import {
  ModelUpdateResult,
  BatchModelUpdateResult,
  UpdateProposalValidationResult,
  ModelUpdateRecord
} from '../types/model-update.types';

export class ModelUpdateServiceImpl implements ModelUpdateService {
  private updateStrategy: ModelUpdateStrategy;
  private cognitiveModelRepository: any;
  private updateHistoryService: any;
  private consistencyValidator: ModelConsistencyValidatorImpl;

  /**
   * 构造函数
   * @param cognitiveModelRepository 认知模型仓库
   * @param updateHistoryService 更新历史服务
   */
  constructor(
    cognitiveModelRepository: any,
    updateHistoryService: any
  ) {
    this.cognitiveModelRepository = cognitiveModelRepository;
    this.updateHistoryService = updateHistoryService;
    this.consistencyValidator = new ModelConsistencyValidatorImpl();
    // 默认使用增量更新策略
    this.updateStrategy = new IncrementalUpdateStrategy();
  }

  /**
   * 应用单个模型更新建议
   * @param updateProposal 模型更新建议
   * @returns 更新结果
   */
  async applyUpdate(updateProposal: any): Promise<ModelUpdateResult> {
    try {
      // 1. 获取当前模型
      const currentModel = await this.cognitiveModelRepository.getById(updateProposal.userId);
      if (!currentModel) {
        throw new Error(`Cognitive model not found for user: ${updateProposal.userId}`);
      }

      // 2. 验证更新建议
      const validationResult = await this.validateUpdateProposal(updateProposal);
      if (!validationResult.isValid) {
        throw new Error(`Invalid update proposal: ${validationResult.errors.join(', ')}`);
      }

      // 3. 验证更新策略兼容性
      const strategyCompatible = await this.updateStrategy.validateProposal(currentModel, updateProposal);
      if (!strategyCompatible) {
        throw new Error(`Update proposal incompatible with current strategy: ${this.updateStrategy.name}`);
      }

      // 4. 应用更新
      const updatedModel = await this.updateStrategy.applyUpdate(currentModel, updateProposal);

      // 5. 验证更新后模型一致性
      const consistencyResult = await this.consistencyValidator.validate(updatedModel);
      if (!consistencyResult.isValid) {
        throw new Error(`Updated model inconsistent: ${consistencyResult.errors.join(', ')}`);
      }

      // 6. 生成新版本号
      const newVersion = this.generateNewVersion(currentModel.version);
      updatedModel.version = newVersion;
      updatedModel.updatedAt = new Date();

      // 7. 保存更新后的模型
      await this.cognitiveModelRepository.save(updatedModel);

      // 8. 记录更新历史
      const updateRecord: ModelUpdateRecord = {
        id: uuidv4(),
        userId: updateProposal.userId,
        fromVersion: currentModel.version,
        toVersion: newVersion,
        updateType: updateProposal.updateType,
        source: updateProposal.source,
        updateDetails: {
          conceptsAdded: updateProposal.conceptsToAdd?.length || 0,
          conceptsUpdated: updateProposal.conceptsToUpdate?.length || 0,
          conceptsRemoved: updateProposal.conceptIdsToRemove?.length || 0,
          relationsAdded: updateProposal.relationsToAdd?.length || 0,
          relationsUpdated: updateProposal.relationsToUpdate?.length || 0,
          relationsRemoved: updateProposal.relationIdsToRemove?.length || 0
        },
        confidenceScore: updateProposal.confidenceScore,
        timestamp: new Date(),
        relatedThoughtIds: updateProposal.relatedThoughtIds
      };
      await this.updateHistoryService.recordUpdate(updateRecord);

      // 9. 返回更新结果
      return {
        success: true,
        newVersion: newVersion,
        oldVersion: currentModel.version,
        updateDetails: updateRecord.updateDetails,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        newVersion: updateProposal.currentVersion || 'unknown',
        oldVersion: updateProposal.currentVersion || 'unknown',
        updateDetails: {
          conceptsAdded: 0,
          conceptsUpdated: 0,
          conceptsRemoved: 0,
          relationsAdded: 0,
          relationsUpdated: 0,
          relationsRemoved: 0
        },
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 批量应用模型更新建议
   * @param updateProposals 模型更新建议列表
   * @returns 批量更新结果
   */
  async batchApplyUpdates(updateProposals: any[]): Promise<BatchModelUpdateResult> {
    const results: ModelUpdateResult[] = [];

    for (const updateProposal of updateProposals) {
      const result = await this.applyUpdate(updateProposal);
      results.push(result);
    }

    const successfulUpdates = results.filter(r => r.success).length;
    const failedUpdates = results.filter(r => !r.success).length;

    return {
      totalUpdates: updateProposals.length,
      successfulUpdates,
      failedUpdates,
      results,
      timestamp: new Date()
    };
  }

  /**
   * 验证更新建议的合法性
   * @param updateProposal 模型更新建议
   * @returns 验证结果
   */
  async validateUpdateProposal(updateProposal: any): Promise<UpdateProposalValidationResult> {
    const errors: string[] = [];

    // 1. 验证基本字段
    if (!updateProposal.id) {
      errors.push('Update proposal missing required field: id');
    }

    if (!updateProposal.userId) {
      errors.push('Update proposal missing required field: userId');
    }

    if (!updateProposal.updateType) {
      errors.push('Update proposal missing required field: updateType');
    }

    if (updateProposal.confidenceScore === undefined || updateProposal.confidenceScore === null) {
      errors.push('Update proposal missing required field: confidenceScore');
    } else if (typeof updateProposal.confidenceScore !== 'number' || updateProposal.confidenceScore < 0 || updateProposal.confidenceScore > 1) {
      errors.push('Update proposal confidenceScore must be a number between 0 and 1');
    }

    if (!updateProposal.source) {
      errors.push('Update proposal missing required field: source');
    }

    if (!updateProposal.timestamp) {
      errors.push('Update proposal missing required field: timestamp');
    }

    // 2. 验证概念相关字段
    if (updateProposal.conceptsToAdd && !Array.isArray(updateProposal.conceptsToAdd)) {
      errors.push('Update proposal conceptsToAdd must be an array');
    }

    if (updateProposal.conceptsToUpdate && !Array.isArray(updateProposal.conceptsToUpdate)) {
      errors.push('Update proposal conceptsToUpdate must be an array');
    }

    if (updateProposal.conceptIdsToRemove && !Array.isArray(updateProposal.conceptIdsToRemove)) {
      errors.push('Update proposal conceptIdsToRemove must be an array');
    }

    // 3. 验证关系相关字段
    if (updateProposal.relationsToAdd && !Array.isArray(updateProposal.relationsToAdd)) {
      errors.push('Update proposal relationsToAdd must be an array');
    }

    if (updateProposal.relationsToUpdate && !Array.isArray(updateProposal.relationsToUpdate)) {
      errors.push('Update proposal relationsToUpdate must be an array');
    }

    if (updateProposal.relationIdsToRemove && !Array.isArray(updateProposal.relationIdsToRemove)) {
      errors.push('Update proposal relationIdsToRemove must be an array');
    }

    // 4. 验证相关思维片段ID
    if (updateProposal.relatedThoughtIds && !Array.isArray(updateProposal.relatedThoughtIds)) {
      errors.push('Update proposal relatedThoughtIds must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors,
      timestamp: new Date()
    };
  }

  /**
   * 设置模型更新策略
   * @param strategy 模型更新策略
   */
  setUpdateStrategy(strategy: ModelUpdateStrategy): void {
    this.updateStrategy = strategy;
  }

  /**
   * 获取当前模型更新策略
   * @returns 当前模型更新策略
   */
  getUpdateStrategy(): ModelUpdateStrategy {
    return this.updateStrategy;
  }

  /**
   * 生成新版本号
   * @param currentVersion 当前版本号
   * @returns 新版本号
   */
  private generateNewVersion(currentVersion: string): string {
    // 简单的版本号生成逻辑：基于当前时间戳
    // 实际项目中可以采用更复杂的版本号策略
    return `v${Date.now()}`;
  }
}