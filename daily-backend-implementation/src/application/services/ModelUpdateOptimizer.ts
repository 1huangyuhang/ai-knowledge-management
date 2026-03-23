import { CognitiveModel } from '../../domain/entities/cognitive-model';
import { CognitiveConcept } from '../../domain/entities/cognitive-concept';
import { CognitiveRelation } from '../../domain/entities/cognitive-relation';
import { CacheService } from '../../domain/services/cache-service';

/**
 * 模型更新优化选项
 */
export interface ModelUpdateOptimizerOptions {
  incrementalUpdate?: boolean;
  batchSize?: number;
  useCache?: boolean;
  cacheTtl?: number;
}

/**
 * 模型更新优化器
 * 用于优化模型更新过程，减少不必要的计算和数据库操作
 */
export class ModelUpdateOptimizer {
  private readonly defaultOptions: ModelUpdateOptimizerOptions = {
    incrementalUpdate: true,
    batchSize: 100,
    useCache: true,
    cacheTtl: 3600000,
  };

  /**
   * 构造函数
   * @param cacheService 缓存服务
   */
  constructor(private readonly cacheService?: CacheService) {}

  /**
   * 优化模型更新
   * @param existingModel 现有模型
   * @param newConcepts 新概念列表
   * @param newRelations 新关系列表
   * @param options 优化选项
   * @returns 更新后的模型
   */
  public async optimizeModelUpdate(
    existingModel: CognitiveModel,
    newConcepts: CognitiveConcept[],
    newRelations: CognitiveRelation[],
    options: ModelUpdateOptimizerOptions = {}
  ): Promise<CognitiveModel> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // 检查缓存
    const cacheKey = `modelUpdate:${existingModel.id}:${JSON.stringify(newConcepts.map(c => c.id).sort())}:${JSON.stringify(newRelations.map(r => r.id).sort())}`;
    
    if (mergedOptions.useCache && this.cacheService) {
      const cachedResult = await this.cacheService.get<CognitiveModel>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    let updatedModel: CognitiveModel;
    
    if (mergedOptions.incrementalUpdate) {
      // 使用增量更新，只处理变化的部分
      updatedModel = await this.performIncrementalUpdate(
        existingModel,
        newConcepts,
        newRelations,
        mergedOptions
      );
    } else {
      // 完全更新，重新构建整个模型
      updatedModel = this.performFullUpdate(existingModel, newConcepts, newRelations);
    }

    // 缓存结果
    if (mergedOptions.useCache && this.cacheService) {
      await this.cacheService.set(cacheKey, updatedModel, mergedOptions.cacheTtl);
    }

    return updatedModel;
  }

  /**
   * 执行增量更新
   * @param existingModel 现有模型
   * @param newConcepts 新概念列表
   * @param newRelations 新关系列表
   * @param options 优化选项
   * @returns 更新后的模型
   */
  private async performIncrementalUpdate(
    existingModel: CognitiveModel,
    newConcepts: CognitiveConcept[],
    newRelations: CognitiveRelation[],
    options: ModelUpdateOptimizerOptions
  ): Promise<CognitiveModel> {
    // 合并概念（使用Map提高查找效率）
    const conceptMap = new Map<string, CognitiveConcept>(
      existingModel.concepts.map(c => [c.id, c])
    );

    // 统计新增、更新和删除的概念
    let addedConcepts = 0;
    let updatedConcepts = 0;
    let deletedConcepts = 0;

    // 批量处理新概念
    for (let i = 0; i < newConcepts.length; i += options.batchSize!) {
      const batch = newConcepts.slice(i, i + options.batchSize!);
      
      for (const concept of batch) {
        if (conceptMap.has(concept.id)) {
          // 更新现有概念
          const existingConcept = conceptMap.get(concept.id)!;
          conceptMap.set(concept.id, this.mergeConcepts(existingConcept, concept));
          updatedConcepts++;
        } else {
          // 添加新概念
          conceptMap.set(concept.id, concept);
          addedConcepts++;
        }
      }
    }

    // 合并关系（使用Map提高查找效率）
    const relationKey = (r: CognitiveRelation) => `${r.sourceConceptId}:${r.targetConceptId}:${r.type}`;
    const relationMap = new Map<string, CognitiveRelation>(
      existingModel.relations.map(r => [relationKey(r), r])
    );

    // 统计新增、更新和删除的关系
    let addedRelations = 0;
    let updatedRelations = 0;
    let deletedRelations = 0;

    // 批量处理新关系
    for (let i = 0; i < newRelations.length; i += options.batchSize!) {
      const batch = newRelations.slice(i, i + options.batchSize!);
      
      for (const relation of batch) {
        const key = relationKey(relation);
        if (relationMap.has(key)) {
          // 更新现有关系
          const existingRelation = relationMap.get(key)!;
          relationMap.set(key, this.mergeRelations(existingRelation, relation));
          updatedRelations++;
        } else {
          // 添加新关系
          relationMap.set(key, relation);
          addedRelations++;
        }
      }
    }

    // 创建更新后的模型
    const updatedModel: CognitiveModel = {
      ...existingModel,
      concepts: Array.from(conceptMap.values()),
      relations: Array.from(relationMap.values()),
      updatedAt: new Date(),
      version: this.incrementVersion(existingModel.version),
      metadata: {
        ...existingModel.metadata,
        updateStats: {
          addedConcepts,
          updatedConcepts,
          deletedConcepts,
          addedRelations,
          updatedRelations,
          deletedRelations,
          updateType: 'incremental',
          timestamp: new Date(),
        },
      },
    };

    return updatedModel;
  }

  /**
   * 执行完全更新
   * @param existingModel 现有模型
   * @param newConcepts 新概念列表
   * @param newRelations 新关系列表
   * @returns 更新后的模型
   */
  private performFullUpdate(
    existingModel: CognitiveModel,
    newConcepts: CognitiveConcept[],
    newRelations: CognitiveRelation[]
  ): CognitiveModel {
    // 完全替换模型内容
    return {
      ...existingModel,
      concepts: newConcepts,
      relations: newRelations,
      updatedAt: new Date(),
      version: this.incrementVersion(existingModel.version),
      metadata: {
        ...existingModel.metadata,
        updateStats: {
          addedConcepts: newConcepts.length,
          updatedConcepts: 0,
          deletedConcepts: existingModel.concepts.length,
          addedRelations: newRelations.length,
          updatedRelations: 0,
          deletedRelations: existingModel.relations.length,
          updateType: 'full',
          timestamp: new Date(),
        },
      },
    };
  }

  /**
   * 合并两个概念
   * @param existing 现有概念
   * @param update 更新概念
   * @returns 合并后的概念
   */
  private mergeConcepts(
    existing: CognitiveConcept,
    update: CognitiveConcept
  ): CognitiveConcept {
    // 合并概念属性，使用加权平均处理置信度和重要性
    return {
      ...existing,
      ...update,
      confidence: (existing.confidence + update.confidence) / 2,
      importance: (existing.importance + update.importance) / 2,
      occurrenceCount: existing.occurrenceCount + update.occurrenceCount,
      updatedAt: new Date(),
    };
  }

  /**
   * 合并两个关系
   * @param existing 现有关系
   * @param update 更新关系
   * @returns 合并后的关系
   */
  private mergeRelations(
    existing: CognitiveRelation,
    update: CognitiveRelation
  ): CognitiveRelation {
    // 合并关系属性，使用加权平均处理置信度和强度
    return {
      ...existing,
      ...update,
      confidence: (existing.confidence + update.confidence) / 2,
      strength: (existing.strength + update.strength) / 2,
      updatedAt: new Date(),
    };
  }

  /**
   * 版本号递增
   * @param currentVersion 当前版本号
   * @returns 递增后的版本号
   */
  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.').map(Number);
    parts[2]++;
    return parts.join('.');
  }
}