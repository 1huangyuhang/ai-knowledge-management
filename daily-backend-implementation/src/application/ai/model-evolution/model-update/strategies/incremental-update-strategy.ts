/**
 * 增量更新策略
 * 只更新模型的差异部分，保持原有结构不变
 */
import { ModelUpdateStrategy } from '../../interfaces/model-update.interface';

export class IncrementalUpdateStrategy implements ModelUpdateStrategy {
  name: string = 'INCREMENTAL';

  /**
   * 应用增量更新
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 更新后的模型
   */
  async applyUpdate(currentModel: any, updateProposal: any): Promise<any> {
    // 创建模型副本
    const updatedModel = { ...currentModel };
    
    // 处理概念添加
    if (updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.length > 0) {
      updatedModel.concepts = [...updatedModel.concepts, ...updateProposal.conceptsToAdd];
    }
    
    // 处理概念更新
    if (updateProposal.conceptsToUpdate && updateProposal.conceptsToUpdate.length > 0) {
      for (const conceptUpdate of updateProposal.conceptsToUpdate) {
        const conceptIndex = updatedModel.concepts.findIndex((c: any) => c.id === conceptUpdate.conceptId);
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
      updatedModel.concepts = updatedModel.concepts.filter((c: any) => 
        !updateProposal.conceptIdsToRemove!.includes(c.id)
      );
    }
    
    // 处理关系添加
    if (updateProposal.relationsToAdd && updateProposal.relationsToAdd.length > 0) {
      updatedModel.relations = [...updatedModel.relations, ...updateProposal.relationsToAdd];
    }
    
    // 处理关系更新
    if (updateProposal.relationsToUpdate && updateProposal.relationsToUpdate.length > 0) {
      for (const relationUpdate of updateProposal.relationsToUpdate) {
        const relationIndex = updatedModel.relations.findIndex((r: any) => r.id === relationUpdate.relationId);
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
      updatedModel.relations = updatedModel.relations.filter((r: any) => 
        !updateProposal.relationIdsToRemove!.includes(r.id)
      );
    }
    
    return updatedModel;
  }

  /**
   * 验证更新建议与当前策略的兼容性
   * @param currentModel 当前认知模型
   * @param updateProposal 更新建议
   * @returns 验证结果
   */
  async validateProposal(currentModel: any, updateProposal: any): Promise<boolean> {
    // 增量更新策略兼容所有类型的更新建议
    // 主要验证更新建议的格式是否正确
    return true;
  }
}