// 认知模型领域服务接口
import {
  CognitiveInsight,
  CognitiveProposal,
  CognitiveRelation,
  UserCognitiveModel
} from '../entities/user-cognitive-model';

/**
 * 认知模型领域服务接口
 * 负责处理认知模型的业务逻辑
 */
export interface CognitiveModelService {
  /**
   * 验证认知建议的有效性
   * @param proposal 认知建议
   * @returns 验证结果
   */
  validateProposal(proposal: CognitiveProposal): boolean;
  
  /**
   * 维护认知模型的一致性
   * @param model 认知模型
   */
  maintainConsistency(model: UserCognitiveModel): void;
  
  /**
   * 生成认知洞察
   * @param model 认知模型
   * @returns 认知洞察
   */
  generateInsight(model: UserCognitiveModel): CognitiveInsight;
  
  /**
   * 检测认知冲突
   * @param relations 认知关系集合
   * @returns 冲突的认知关系
   */
  detectConflicts(relations: CognitiveRelation[]): CognitiveRelation[];
  
  /**
   * 验证概念层次结构的正确性
   * @param model 认知模型
   * @returns 验证结果
   */
  validateConceptHierarchy(model: UserCognitiveModel): boolean;
  
  /**
   * 更新概念的置信度评分
   * @param model 认知模型
   */
  updateConceptConfidence(model: UserCognitiveModel): void;
}

// 认知模型领域服务实现类
export class CognitiveModelServiceImpl implements CognitiveModelService {
  /**
   * 验证认知建议的有效性
   * @param proposal 认知建议
   * @returns 验证结果
   */
  validateProposal(proposal: CognitiveProposal): boolean {
    // 业务规则：建议的置信度必须大于0.7，且至少包含一个概念
    return proposal.confidence > 0.7 && proposal.concepts.length > 0;
  }
  
  /**
   * 维护认知模型的一致性
   * @param model 认知模型
   */
  maintainConsistency(model: UserCognitiveModel): void {
    // 1. 检测并移除冲突关系
    const conflicts = this.detectConflicts(model.relations);
    conflicts.forEach(conflict => {
      model.removeRelation(conflict.id);
    });
    
    // 2. 确保概念层次结构的正确性
    this.validateConceptHierarchy(model);
    
    // 3. 更新概念的置信度评分
    this.updateConceptConfidence(model);
  }
  
  /**
   * 生成认知洞察
   * @param model 认知模型
   * @returns 认知洞察
   */
  generateInsight(model: UserCognitiveModel): CognitiveInsight {
    // 简化实现：基于模型生成基本洞察
    // 实际实现中，这可能需要调用AI服务
    
    // 计算核心主题（这里简化为使用前3个概念的语义标识）
    const coreThemes = model.concepts
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 3)
      .map(concept => concept.semanticIdentity);
    
    // 检测认知盲点（这里简化为概念数量少于5个则认为有盲点）
    const blindSpots: string[] = [];
    if (model.concepts.length < 5) {
      blindSpots.push('认知模型概念数量较少，建议增加更多概念');
    }
    
    // 检测概念缺口（这里简化为关系数量少于概念数量则认为有关系缺口）
    const conceptGaps: string[] = [];
    if (model.relations.length < model.concepts.length) {
      conceptGaps.push('认知模型关系数量较少，建议增加更多关系');
    }
    
    // 生成结构总结
    const structureSummary = `认知模型包含 ${model.concepts.length} 个概念和 ${model.relations.length} 个关系。`;
    
    // 生成洞察ID
    const insightId = `insight-${model.id}-${Date.now()}`;
    
    return {
      id: insightId,
      modelId: model.id,
      coreThemes,
      blindSpots,
      conceptGaps,
      structureSummary,
      createdAt: new Date(),
      confidence: 0.8 // 默认置信度
    };
  }
  
  /**
   * 检测认知冲突
   * @param relations 认知关系集合
   * @returns 冲突的认知关系
   */
  detectConflicts(relations: CognitiveRelation[]): CognitiveRelation[] {
    const conflicts: CognitiveRelation[] = [];
    
    // 简化实现：检测直接冲突的关系
    // 实际实现中，这可能需要更复杂的冲突检测逻辑
    
    // 检查是否存在相互矛盾的关系
    for (let i = 0; i < relations.length; i++) {
      for (let j = i + 1; j < relations.length; j++) {
        const relation1 = relations[i];
        const relation2 = relations[j];
        
        // 检查是否是相同的源概念和目标概念，但关系类型不同
        if (
          relation1.sourceConceptId === relation2.sourceConceptId &&
          relation1.targetConceptId === relation2.targetConceptId &&
          relation1.relationType !== relation2.relationType
        ) {
          // 将置信度较低的关系标记为冲突
          if (relation1.confidence < relation2.confidence) {
            conflicts.push(relation1);
          } else {
            conflicts.push(relation2);
          }
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * 验证概念层次结构的正确性
   * @param model 认知模型
   * @returns 验证结果
   */
  validateConceptHierarchy(model: UserCognitiveModel): boolean {
    // 简化实现：检查是否存在循环依赖
    // 实际实现中，这可能需要更复杂的层次结构验证
    
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    // 构建父-子映射
    const parentChildMap = new Map<string, string[]>();
    model.relations.forEach(relation => {
      if (relation.relationType === 'PARENT_CHILD') {
        const children = parentChildMap.get(relation.sourceConceptId) || [];
        children.push(relation.targetConceptId);
        parentChildMap.set(relation.sourceConceptId, children);
      }
    });
    
    // 检测循环依赖
    const hasCycle = (conceptId: string): boolean => {
      visited.add(conceptId);
      recursionStack.add(conceptId);
      
      const children = parentChildMap.get(conceptId) || [];
      for (const childId of children) {
        if (!visited.has(childId)) {
          if (hasCycle(childId)) {
            return true;
          }
        } else if (recursionStack.has(childId)) {
          return true;
        }
      }
      
      recursionStack.delete(conceptId);
      return false;
    };
    
    // 检查所有概念
    for (const concept of model.concepts) {
      if (!visited.has(concept.id)) {
        if (hasCycle(concept.id)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * 更新概念的置信度评分
   * @param model 认知模型
   */
  updateConceptConfidence(model: UserCognitiveModel): void {
    // 简化实现：根据关系数量更新概念的置信度
    // 实际实现中，这可能需要更复杂的置信度计算逻辑
    
    // 统计每个概念参与的关系数量
    const relationCountMap = new Map<string, number>();
    
    model.relations.forEach(relation => {
      // 更新源概念的关系计数
      const sourceCount = relationCountMap.get(relation.sourceConceptId) || 0;
      relationCountMap.set(relation.sourceConceptId, sourceCount + 1);
      
      // 更新目标概念的关系计数
      const targetCount = relationCountMap.get(relation.targetConceptId) || 0;
      relationCountMap.set(relation.targetConceptId, targetCount + 1);
    });
    
    // 更新概念的置信度评分
    model.concepts.forEach(concept => {
      const relationCount = relationCountMap.get(concept.id) || 0;
      
      // 根据关系数量调整置信度评分
      // 关系数量越多，置信度越高
      const confidenceAdjustment = Math.min(relationCount * 0.05, 0.2); // 最多增加0.2
      const newConfidence = Math.min(concept.confidenceScore + confidenceAdjustment, 1.0);
      
      // 更新概念的置信度
      // 注意：这里直接修改concept对象，因为在TypeScript中，接口属性默认是可变的
      // 在实际实现中，可能需要创建新的概念对象
      (concept as any).confidenceScore = newConfidence;
    });
  }
}