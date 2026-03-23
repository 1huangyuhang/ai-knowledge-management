import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
import { CognitiveConcept } from '../../domain/entities/cognitive-concept';
import { CognitiveRelation } from '../../domain/entities/cognitive-relation';
import { ThoughtFragment } from '../../domain/entities/thought-fragment';

/**
 * 认知模型更新选项
 */
export interface CognitiveModelUpdateOptions {
  updateConcepts?: boolean;
  updateRelations?: boolean;
  updateConfidence?: boolean;
  recalculateStructure?: boolean;
}

/**
 * 认知模型更新结果
 */
export interface CognitiveModelUpdateResult {
  model: UserCognitiveModel;
  changes: {
    addedConcepts: number;
    updatedConcepts: number;
    addedRelations: number;
    updatedRelations: number;
    confidenceChanges: number;
  };
  metadata: {
    processingTime: number;
    conceptCount: number;
    relationCount: number;
    averageConfidence: number;
  };
}

/**
 * 认知模型更新服务
 */
export class CognitiveModelUpdateService {
  /**
   * 更新认知模型
   * @param model 现有的认知模型
   * @param thoughtFragment 新的思维片段
   * @param options 更新选项
   * @returns 更新结果
   */
  public updateCognitiveModel(
    model: UserCognitiveModel,
    thoughtFragment: ThoughtFragment,
    options: CognitiveModelUpdateOptions = {}
  ): CognitiveModelUpdateResult {
    const startTime = Date.now();
    const changes = {
      addedConcepts: 0,
      updatedConcepts: 0,
      addedRelations: 0,
      updatedRelations: 0,
      confidenceChanges: 0,
    };

    // 默认更新选项
    const updateOptions = {
      updateConcepts: true,
      updateRelations: true,
      updateConfidence: true,
      recalculateStructure: true,
      ...options,
    };

    // 1. 更新概念
    if (updateOptions.updateConcepts) {
      const conceptChanges = this.updateConcepts(model, thoughtFragment);
      changes.addedConcepts = conceptChanges.added;
      changes.updatedConcepts = conceptChanges.updated;
    }

    // 2. 更新关系
    if (updateOptions.updateRelations) {
      const relationChanges = this.updateRelations(model, thoughtFragment);
      changes.addedRelations = relationChanges.added;
      changes.updatedRelations = relationChanges.updated;
    }

    // 3. 更新置信度
    if (updateOptions.updateConfidence) {
      changes.confidenceChanges = this.updateConfidence(model, thoughtFragment);
    }

    // 4. 重新计算结构
    if (updateOptions.recalculateStructure) {
      this.recalculateStructure(model);
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // 计算元数据
    const conceptCount = model.concepts.length;
    const relationCount = model.relations.length;
    const averageConfidence = relationCount > 0 
      ? model.relations.reduce((sum, rel) => sum + rel.confidence, 0) / relationCount
      : 0;

    return {
      model,
      changes,
      metadata: {
        processingTime,
        conceptCount,
        relationCount,
        averageConfidence,
      },
    };
  }

  /**
   * 更新概念
   * @param model 认知模型
   * @param thoughtFragment 思维片段
   * @returns 概念变更统计
   */
  private updateConcepts(
    model: UserCognitiveModel,
    thoughtFragment: ThoughtFragment
  ): { added: number; updated: number } {
    const changes = { added: 0, updated: 0 };
    const keywords = thoughtFragment.metadata.keywords || [];

    // 从关键词中提取概念
    for (const keyword of keywords) {
      // 检查概念是否已存在
      let concept = model.concepts.find(c => c.name.toLowerCase() === keyword.toLowerCase());

      if (concept) {
        // 更新现有概念
        concept.occurrenceCount += 1;
        concept.lastOccurrence = new Date();
        concept.confidence = Math.min(1, concept.confidence + 0.1);
        changes.updated++;
      } else {
        // 添加新概念
        concept = new CognitiveConcept({
          id: crypto.randomUUID(),
          modelId: model.id,
          name: keyword,
          description: '',
          confidence: 0.5,
          occurrenceCount: 1,
          createdAt: new Date(),
          lastOccurrence: new Date(),
          metadata: {
            sourceThoughtId: thoughtFragment.id,
            sourceContent: thoughtFragment.content.substring(0, 100) + '...',
          },
        });
        model.concepts.push(concept);
        changes.added++;
      }
    }

    return changes;
  }

  /**
   * 更新关系
   * @param model 认知模型
   * @param thoughtFragment 思维片段
   * @returns 关系变更统计
   */
  private updateRelations(
    model: UserCognitiveModel,
    thoughtFragment: ThoughtFragment
  ): { added: number; updated: number } {
    const changes = { added: 0, updated: 0 };
    const keywords = thoughtFragment.metadata.keywords || [];

    // 生成概念对，创建关系
    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        const concept1 = model.concepts.find(c => c.name.toLowerCase() === keywords[i].toLowerCase());
        const concept2 = model.concepts.find(c => c.name.toLowerCase() === keywords[j].toLowerCase());

        if (concept1 && concept2) {
          // 检查关系是否已存在（双向检查）
          let relation = model.relations.find(
            r => (r.sourceConceptId === concept1.id && r.targetConceptId === concept2.id) ||
                 (r.sourceConceptId === concept2.id && r.targetConceptId === concept1.id)
          );

          if (relation) {
            // 更新现有关系
            relation.strength += 0.1;
            relation.confidence = Math.min(1, relation.confidence + 0.05);
            relation.occurrenceCount += 1;
            relation.lastOccurrence = new Date();
            changes.updated++;
          } else {
            // 添加新关系
            relation = new CognitiveRelation({
              id: crypto.randomUUID(),
              modelId: model.id,
              sourceConceptId: concept1.id,
              targetConceptId: concept2.id,
              type: 'association',
              strength: 0.5,
              confidence: 0.5,
              occurrenceCount: 1,
              createdAt: new Date(),
              lastOccurrence: new Date(),
              metadata: {
                sourceThoughtId: thoughtFragment.id,
              },
            });
            model.relations.push(relation);
            changes.added++;
          }
        }
      }
    }

    return changes;
  }

  /**
   * 更新置信度
   * @param model 认知模型
   * @param thoughtFragment 思维片段
   * @returns 置信度变更数量
   */
  private updateConfidence(
    model: UserCognitiveModel,
    thoughtFragment: ThoughtFragment
  ): number {
    let changes = 0;
    const keywords = thoughtFragment.metadata.keywords || [];

    // 更新概念置信度
    for (const keyword of keywords) {
      const concept = model.concepts.find(c => c.name.toLowerCase() === keyword.toLowerCase());
      if (concept) {
        const oldConfidence = concept.confidence;
        concept.confidence = Math.min(1, concept.confidence + 0.1);
        if (concept.confidence !== oldConfidence) {
          changes++;
        }
      }
    }

    return changes;
  }

  /**
   * 重新计算认知模型结构
   * @param model 认知模型
   */
  private recalculateStructure(model: UserCognitiveModel): void {
    // 计算模型的中心度（简单实现）
    const conceptScores = new Map<string, number>();

    // 计算每个概念的度数中心性
    for (const relation of model.relations) {
      // 增加源概念分数
      const sourceScore = conceptScores.get(relation.sourceConceptId) || 0;
      conceptScores.set(relation.sourceConceptId, sourceScore + relation.strength);

      // 增加目标概念分数
      const targetScore = conceptScores.get(relation.targetConceptId) || 0;
      conceptScores.set(relation.targetConceptId, targetScore + relation.strength);
    }

    // 更新概念的中心度
    for (const concept of model.concepts) {
      const score = conceptScores.get(concept.id) || 0;
      concept.metadata = {
        ...concept.metadata,
        centrality: score,
      };
    }

    // 更新模型的更新时间
    model.updatedAt = new Date();
  }
}
