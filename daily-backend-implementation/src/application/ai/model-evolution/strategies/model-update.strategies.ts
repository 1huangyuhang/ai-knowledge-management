/**
 * 增量更新策略
 * 只更新模型的差异部分，保持原有结构不变
 */
export class IncrementalUpdateStrategy implements ModelUpdateStrategy {
  name: string = 'INCREMENTAL';

  /**
   * 应用增量更新
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 更新后的模型
   */
  async applyUpdate(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<UserCognitiveModel> {
    // 创建模型副本
    const updatedModel = {
      ...currentModel,
      concepts: [...currentModel.concepts],
      relations: [...currentModel.relations]
    };
    
    // 处理概念添加
    if (updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.length > 0) {
      updatedModel.concepts = [...updatedModel.concepts, ...updateProposal.conceptsToAdd];
    }
    
    // 处理概念更新
    if (updateProposal.conceptsToUpdate && updateProposal.conceptsToUpdate.length > 0) {
      for (const conceptUpdate of updateProposal.conceptsToUpdate) {
        const conceptIndex = updatedModel.concepts.findIndex(c => c.id === conceptUpdate.conceptId);
        if (conceptIndex !== -1) {
          updatedModel.concepts[conceptIndex] = {
            ...updatedModel.concepts[conceptIndex],
            ...conceptUpdate.updates
          };
        }
      }
    }
    
    // 处理概念删除
    if (updateProposal.conceptIdsToRemove && updateProposal.conceptIdsToRemove.length > 0) {
      updatedModel.concepts = updatedModel.concepts.filter(c => 
        !updateProposal.conceptIdsToRemove!.includes(c.id)
      );
      
      // 同时删除相关关系
      updatedModel.relations = updatedModel.relations.filter(r => 
        !updateProposal.conceptIdsToRemove!.includes(r.sourceConceptId) &&
        !updateProposal.conceptIdsToRemove!.includes(r.targetConceptId)
      );
    }
    
    // 处理关系添加
    if (updateProposal.relationsToAdd && updateProposal.relationsToAdd.length > 0) {
      updatedModel.relations = [...updatedModel.relations, ...updateProposal.relationsToAdd];
    }
    
    // 处理关系更新
    if (updateProposal.relationsToUpdate && updateProposal.relationsToUpdate.length > 0) {
      for (const relationUpdate of updateProposal.relationsToUpdate) {
        const relationIndex = updatedModel.relations.findIndex(r => r.id === relationUpdate.relationId);
        if (relationIndex !== -1) {
          updatedModel.relations[relationIndex] = {
            ...updatedModel.relations[relationIndex],
            ...relationUpdate.updates
          };
        }
      }
    }
    
    // 处理关系删除
    if (updateProposal.relationIdsToRemove && updateProposal.relationIdsToRemove.length > 0) {
      updatedModel.relations = updatedModel.relations.filter(r => 
        !updateProposal.relationIdsToRemove!.includes(r.id)
      );
    }
    
    return updatedModel;
  }

  /**
   * 验证更新建议与增量更新策略的兼容性
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 验证结果
   */
  async validateProposal(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<boolean> {
    // 增量更新策略只支持增量更新类型
    if (updateProposal.updateType !== ModelUpdateType.INCREMENTAL) {
      return false;
    }
    
    // 验证要更新的概念是否存在
    if (updateProposal.conceptsToUpdate) {
      for (const conceptUpdate of updateProposal.conceptsToUpdate) {
        const conceptExists = currentModel.concepts.some(c => c.id === conceptUpdate.conceptId);
        if (!conceptExists) {
          return false;
        }
      }
    }
    
    // 验证要删除的概念是否存在
    if (updateProposal.conceptIdsToRemove) {
      for (const conceptId of updateProposal.conceptIdsToRemove) {
        const conceptExists = currentModel.concepts.some(c => c.id === conceptId);
        if (!conceptExists) {
          return false;
        }
      }
    }
    
    // 验证要更新的关系是否存在
    if (updateProposal.relationsToUpdate) {
      for (const relationUpdate of updateProposal.relationsToUpdate) {
        const relationExists = currentModel.relations.some(r => r.id === relationUpdate.relationId);
        if (!relationExists) {
          return false;
        }
      }
    }
    
    // 验证要删除的关系是否存在
    if (updateProposal.relationIdsToRemove) {
      for (const relationId of updateProposal.relationIdsToRemove) {
        const relationExists = currentModel.relations.some(r => r.id === relationId);
        if (!relationExists) {
          return false;
        }
      }
    }
    
    return true;
  }
}

/**
 * 全量更新策略
 * 替换整个模型，适用于模型结构发生重大变化的情况
 */
export class FullUpdateStrategy implements ModelUpdateStrategy {
  name: string = 'FULL';

  /**
   * 应用全量更新
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 更新后的模型
   */
  async applyUpdate(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<UserCognitiveModel> {
    // 全量更新策略要求概念和关系都必须提供
    if (!updateProposal.conceptsToAdd || !updateProposal.relationsToAdd) {
      throw new Error('Full update requires both conceptsToAdd and relationsToAdd to be provided');
    }
    
    // 替换整个模型
    return {
      ...currentModel,
      concepts: [...updateProposal.conceptsToAdd],
      relations: [...updateProposal.relationsToAdd]
    };
  }

  /**
   * 验证更新建议与全量更新策略的兼容性
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 验证结果
   */
  async validateProposal(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<boolean> {
    // 全量更新策略只支持全量更新类型
    if (updateProposal.updateType !== ModelUpdateType.FULL) {
      return false;
    }
    
    // 全量更新必须提供完整的概念和关系
    return !!(updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.length > 0 &&
            updateProposal.relationsToAdd && updateProposal.relationsToAdd.length > 0);
  }
}

/**
 * 重构更新策略
 * 对模型进行结构性调整，优化模型组织
 */
export class RestructureUpdateStrategy implements ModelUpdateStrategy {
  name: string = 'RESTRUCTURE';

  /**
   * 应用重构更新
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 更新后的模型
   */
  async applyUpdate(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<UserCognitiveModel> {
    // 创建模型副本
    const updatedModel = {
      ...currentModel,
      concepts: [...currentModel.concepts],
      relations: [...currentModel.relations]
    };
    
    // 重构更新策略结合了增量更新和结构优化
    
    // 1. 先应用增量更新
    if (updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.length > 0) {
      updatedModel.concepts = [...updatedModel.concepts, ...updateProposal.conceptsToAdd];
    }
    
    if (updateProposal.conceptsToUpdate && updateProposal.conceptsToUpdate.length > 0) {
      for (const conceptUpdate of updateProposal.conceptsToUpdate) {
        const conceptIndex = updatedModel.concepts.findIndex(c => c.id === conceptUpdate.conceptId);
        if (conceptIndex !== -1) {
          updatedModel.concepts[conceptIndex] = {
            ...updatedModel.concepts[conceptIndex],
            ...conceptUpdate.updates
          };
        }
      }
    }
    
    if (updateProposal.conceptIdsToRemove && updateProposal.conceptIdsToRemove.length > 0) {
      updatedModel.concepts = updatedModel.concepts.filter(c => 
        !updateProposal.conceptIdsToRemove!.includes(c.id)
      );
      
      // 同时删除相关关系
      updatedModel.relations = updatedModel.relations.filter(r => 
        !updateProposal.conceptIdsToRemove!.includes(r.sourceConceptId) &&
        !updateProposal.conceptIdsToRemove!.includes(r.targetConceptId)
      );
    }
    
    if (updateProposal.relationsToAdd && updateProposal.relationsToAdd.length > 0) {
      updatedModel.relations = [...updatedModel.relations, ...updateProposal.relationsToAdd];
    }
    
    if (updateProposal.relationsToUpdate && updateProposal.relationsToUpdate.length > 0) {
      for (const relationUpdate of updateProposal.relationsToUpdate) {
        const relationIndex = updatedModel.relations.findIndex(r => r.id === relationUpdate.relationId);
        if (relationIndex !== -1) {
          updatedModel.relations[relationIndex] = {
            ...updatedModel.relations[relationIndex],
            ...relationUpdate.updates
          };
        }
      }
    }
    
    if (updateProposal.relationIdsToRemove && updateProposal.relationIdsToRemove.length > 0) {
      updatedModel.relations = updatedModel.relations.filter(r => 
        !updateProposal.relationIdsToRemove!.includes(r.id)
      );
    }
    
    // 2. 执行结构优化 - 这里可以添加更复杂的结构优化逻辑
    // 例如：识别孤立概念、优化关系层级、合并相似概念等
    
    return updatedModel;
  }

  /**
   * 验证更新建议与重构更新策略的兼容性
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 验证结果
   */
  async validateProposal(currentModel: UserCognitiveModel, updateProposal: CognitiveModelUpdateProposal): Promise<boolean> {
    // 重构更新策略只支持重构更新类型
    if (updateProposal.updateType !== ModelUpdateType.RESTRUCTURE) {
      return false;
    }
    
    // 重构更新可以接受部分更新，但至少需要有一项更新内容
    return !!(updateProposal.conceptsToAdd?.length || 
            updateProposal.conceptsToUpdate?.length || 
            updateProposal.conceptIdsToRemove?.length || 
            updateProposal.relationsToAdd?.length || 
            updateProposal.relationsToUpdate?.length || 
            updateProposal.relationIdsToRemove?.length);
  }
}

/**
 * 更新策略工厂
 * 用于创建不同类型的更新策略实例
 */
export class UpdateStrategyFactory {
  /**
   * 根据更新类型创建对应的更新策略
   * @param updateType 更新类型
   * @returns 更新策略实例
   */
  static createStrategy(updateType: ModelUpdateType): ModelUpdateStrategy {
    switch (updateType) {
      case ModelUpdateType.INCREMENTAL:
        return new IncrementalUpdateStrategy();
      case ModelUpdateType.FULL:
        return new FullUpdateStrategy();
      case ModelUpdateType.RESTRUCTURE:
        return new RestructureUpdateStrategy();
      default:
        return new IncrementalUpdateStrategy();
    }
  }
}
