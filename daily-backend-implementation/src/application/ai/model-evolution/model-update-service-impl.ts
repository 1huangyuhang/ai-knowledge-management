/**
 * 模型更新服务实现类
 */
import { ModelUpdateService, ModelUpdateStrategy, UpdateHistoryService, ModelConsistencyValidator } from './interfaces/model-update-service.interface';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { CognitiveModelUpdateProposal, ModelUpdateResult, BatchModelUpdateResult, UpdateProposalValidationResult, ModelUpdateRecord } from './types/model-update.types';
import { IncrementalUpdateStrategy } from './model-update/strategies/incremental-update-strategy';
import { v4 as uuidv4 } from 'uuid';

export class ModelUpdateServiceImpl implements ModelUpdateService {
  private updateStrategy: ModelUpdateStrategy;
  private cognitiveModelRepository: CognitiveModelRepository;
  private updateHistoryService: UpdateHistoryService;
  private consistencyValidator: ModelConsistencyValidator;

  /**
   * 构造函数
   * @param cognitiveModelRepository 认知模型仓库
   * @param updateHistoryService 更新历史服务
   * @param consistencyValidator 模型一致性验证器
   */
  constructor(
    cognitiveModelRepository: CognitiveModelRepository,
    updateHistoryService: UpdateHistoryService,
    consistencyValidator: ModelConsistencyValidator
  ) {
    this.cognitiveModelRepository = cognitiveModelRepository;
    this.updateHistoryService = updateHistoryService;
    this.consistencyValidator = consistencyValidator;
    // 默认使用增量更新策略
    this.updateStrategy = new IncrementalUpdateStrategy();
  }

  /**
   * 应用单个模型更新建议
   * @param updateProposal 模型更新建议
   * @returns 更新结果
   */
  async applyUpdate(updateProposal: CognitiveModelUpdateProposal): Promise<ModelUpdateResult> {
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
        newVersion: updateProposal.currentVersion,
        oldVersion: updateProposal.currentVersion,
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
  async batchApplyUpdates(updateProposals: CognitiveModelUpdateProposal[]): Promise<BatchModelUpdateResult> {
    const results: ModelUpdateResult[] = [];
    let successfulUpdates = 0;
    let failedUpdates = 0;

    for (const proposal of updateProposals) {
      const result = await this.applyUpdate(proposal);
      results.push(result);
      if (result.success) {
        successfulUpdates++;
      } else {
        failedUpdates++;
      }
    }

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
  async validateUpdateProposal(updateProposal: CognitiveModelUpdateProposal): Promise<UpdateProposalValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 验证必填字段
    if (!updateProposal.id) {
      errors.push('Update proposal ID is required');
    }
    if (!updateProposal.userId) {
      errors.push('User ID is required');
    }
    if (!updateProposal.currentVersion) {
      errors.push('Current version is required');
    }
    if (!updateProposal.updateType) {
      errors.push('Update type is required');
    }
    if (!updateProposal.source) {
      errors.push('Update source is required');
    }
    if (updateProposal.confidenceScore < 0 || updateProposal.confidenceScore > 1) {
      errors.push('Confidence score must be between 0 and 1');
    }

    // 2. 验证模型存在
    const currentModel = await this.cognitiveModelRepository.getById(updateProposal.userId);
    if (!currentModel) {
      errors.push(`Cognitive model not found for user: ${updateProposal.userId}`);
    } else {
      // 3. 验证版本兼容性
      if (currentModel.version !== updateProposal.currentVersion) {
        errors.push(`Version mismatch. Current model version: ${currentModel.version}, Proposal version: ${updateProposal.currentVersion}`);
      }

      // 4. 验证概念更新
      if (updateProposal.conceptsToUpdate) {
        for (const conceptUpdate of updateProposal.conceptsToUpdate) {
          const conceptExists = currentModel.concepts.some(c => c.id === conceptUpdate.conceptId);
          if (!conceptExists) {
            errors.push(`Concept not found: ${conceptUpdate.conceptId}`);
          }
        }
      }

      // 5. 验证概念删除
      if (updateProposal.conceptIdsToRemove) {
        for (const conceptId of updateProposal.conceptIdsToRemove) {
          const conceptExists = currentModel.concepts.some(c => c.id === conceptId);
          if (!conceptExists) {
            errors.push(`Concept not found: ${conceptId}`);
          }
        }
      }

      // 6. 验证关系更新
      if (updateProposal.relationsToUpdate) {
        for (const relationUpdate of updateProposal.relationsToUpdate) {
          const relationExists = currentModel.relations.some(r => r.id === relationUpdate.relationId);
          if (!relationExists) {
            errors.push(`Relation not found: ${relationUpdate.relationId}`);
          }
        }
      }

      // 7. 验证关系删除
      if (updateProposal.relationIdsToRemove) {
        for (const relationId of updateProposal.relationIdsToRemove) {
          const relationExists = currentModel.relations.some(r => r.id === relationId);
          if (!relationExists) {
            errors.push(`Relation not found: ${relationId}`);
          }
        }
      }

      // 8. 验证新增关系的概念存在性
      if (updateProposal.relationsToAdd) {
        for (const relation of updateProposal.relationsToAdd) {
          const sourceConceptExists = currentModel.concepts.some(c => c.id === relation.sourceConceptId) ||
                                      (updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.some(c => c.id === relation.sourceConceptId));
          const targetConceptExists = currentModel.concepts.some(c => c.id === relation.targetConceptId) ||
                                      (updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.some(c => c.id === relation.targetConceptId));
          
          if (!sourceConceptExists) {
            errors.push(`Source concept not found for relation: ${relation.sourceConceptId}`);
          }
          if (!targetConceptExists) {
            errors.push(`Target concept not found for relation: ${relation.targetConceptId}`);
          }
        }
      }
    }

    // 9. 验证置信度阈值
    if (updateProposal.confidenceScore < 0.5) {
      warnings.push('Low confidence score. Consider reviewing this update proposal carefully.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
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
    // 简单的版本号生成逻辑：使用时间戳
    // 实际项目中可以使用更复杂的版本号策略，如语义化版本号
    return `${Date.now()}`;
  }
}
