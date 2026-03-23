/**
 * 全量更新策略
 * 替换整个模型，适用于模型结构发生重大变化的情况
 */
import { ModelUpdateStrategy } from '../../interfaces/model-update.interface';

export class FullUpdateStrategy implements ModelUpdateStrategy {
  name: string = 'FULL';

  /**
   * 应用全量更新
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 更新后的模型
   */
  async applyUpdate(currentModel: any, updateProposal: any): Promise<any> {
    // 全量更新直接替换整个模型
    // 但需要保留一些核心元数据
    const updatedModel = {
      ...updateProposal,
      id: currentModel.id,
      userId: currentModel.userId,
      createdAt: currentModel.createdAt,
      // 保留其他重要元数据
      metadata: {
        ...currentModel.metadata,
        lastFullUpdate: new Date().toISOString()
      }
    };

    return updatedModel;
  }

  /**
   * 验证更新建议与当前策略的兼容性
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 验证结果
   */
  async validateProposal(currentModel: any, updateProposal: any): Promise<boolean> {
    // 全量更新需要验证更新建议包含完整的模型结构
    if (!updateProposal.concepts || !Array.isArray(updateProposal.concepts)) {
      return false;
    }

    if (!updateProposal.relations || !Array.isArray(updateProposal.relations)) {
      return false;
    }

    // 验证概念和关系的基本结构
    for (const concept of updateProposal.concepts) {
      if (!concept.id || !concept.name) {
        return false;
      }
    }

    for (const relation of updateProposal.relations) {
      if (!relation.id || !relation.fromConceptId || !relation.toConceptId) {
        return false;
      }
    }

    return true;
  }
}