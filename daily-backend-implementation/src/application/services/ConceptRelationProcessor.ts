import { CognitiveConcept } from '../../domain/entities/cognitive-concept';
import { CognitiveRelation } from '../../domain/entities/cognitive-relation';
import { CacheService } from '../../domain/services/cache-service';

/**
 * 概念关系处理选项
 */
export interface ConceptRelationProcessorOptions {
  relationType?: string;
  minimumConfidence?: number;
  minimumStrength?: number;
}

/**
 * 概念关系处理结果
 */
export interface ConceptRelationProcessorResult {
  concepts: CognitiveConcept[];
  relations: CognitiveRelation[];
  metadata: {
    processedConcepts: number;
    processedRelations: number;
    filteredConcepts: number;
    filteredRelations: number;
  };
}

/**
 * 概念关系处理器
 */
export class ConceptRelationProcessor {
  private readonly defaultOptions: ConceptRelationProcessorOptions = {
    relationType: 'association',
    minimumConfidence: 0.3,
    minimumStrength: 0.2,
  };

  /**
   * 构造函数
   * @param cacheService 缓存服务
   */
  constructor(private readonly cacheService?: CacheService) {}

  /**
   * 处理概念关系
   * @param concepts 概念列表
   * @param relations 关系列表
   * @param options 处理选项
   * @returns 处理结果
   */
  public async processConceptRelations(
    concepts: CognitiveConcept[],
    relations: CognitiveRelation[],
    options: ConceptRelationProcessorOptions = {}
  ): Promise<ConceptRelationProcessorResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const processedConcepts = [...concepts];
    let processedRelations = [...relations];

    // 过滤低置信度和低强度的关系
    const originalRelationCount = processedRelations.length;
    processedRelations = processedRelations.filter(relation => {
      return (
        relation.confidence >= mergedOptions.minimumConfidence &&
        relation.strength >= mergedOptions.minimumStrength
      );
    });

    // 过滤没有关系的概念
    const originalConceptCount = processedConcepts.length;
    const relatedConceptIds = new Set<string>();
    processedRelations.forEach(relation => {
      relatedConceptIds.add(relation.sourceConceptId);
      relatedConceptIds.add(relation.targetConceptId);
    });

    processedConcepts = processedConcepts.filter(concept => {
      return relatedConceptIds.has(concept.id);
    });

    // 更新关系类型
    processedRelations = processedRelations.map(relation => {
      return new CognitiveRelation({
        ...relation,
        type: mergedOptions.relationType,
      });
    });

    return {
      concepts: processedConcepts,
      relations: processedRelations,
      metadata: {
        processedConcepts: originalConceptCount,
        processedRelations: originalRelationCount,
        filteredConcepts: originalConceptCount - processedConcepts.length,
        filteredRelations: originalRelationCount - processedRelations.length,
      },
    };
  }

  /**
   * 计算概念之间的相似度（优化实现，带缓存）
   * @param concept1 概念1
   * @param concept2 概念2
   * @returns 相似度分数（0-1）
   */
  public async calculateConceptSimilarity(
    concept1: CognitiveConcept,
    concept2: CognitiveConcept
  ): Promise<number> {
    // 生成缓存键，确保顺序一致
    const [name1, name2] = [concept1.name, concept2.name].sort();
    const cacheKey = `similarity:${name1.toLowerCase()}:${name2.toLowerCase()}`;

    // 检查缓存
    if (this.cacheService) {
      const cachedSimilarity = await this.cacheService.get<number>(cacheKey);
      if (cachedSimilarity !== null) {
        return cachedSimilarity;
      }
    }

    // 使用更高效的Jaccard相似度算法（适用于短字符串）
    const a = concept1.name.toLowerCase();
    const b = concept2.name.toLowerCase();

    let similarity = 0.0;
    if (a === b) {
      similarity = 1.0;
    } else if (a.length === 0 || b.length === 0) {
      similarity = 0.0;
    } else if (a.length <= 2 || b.length <= 2) {
      // 对于极短字符串，使用简化的相似度计算
      const matches = Array.from(a).filter(char => b.includes(char)).length;
      const union = new Set([...a, ...b]).size;
      similarity = matches / union;
    } else {
      // 对于普通长度字符串，使用n-gram相似度
      const n = 2; // 2-gram
      const aGrams = this.generateNGrams(a, n);
      const bGrams = this.generateNGrams(b, n);

      const intersection = new Set([...aGrams].filter(gram => bGrams.has(gram))).size;
      const union = aGrams.size + bGrams.size - intersection;

      similarity = union === 0 ? 0.0 : intersection / union;
    }

    // 缓存结果，有效期1小时
    if (this.cacheService) {
      await this.cacheService.set(cacheKey, similarity, 3600000);
    }

    return similarity;
  }

  /**
   * 生成n-gram集合
   * @param str 输入字符串
   * @param n n-gram的n值
   * @returns n-gram集合
   */
  private generateNGrams(str: string, n: number): Set<string> {
    const nGrams = new Set<string>();
    for (let i = 0; i <= str.length - n; i++) {
      nGrams.add(str.substring(i, i + n));
    }
    return nGrams;
  }

  /**
   * 合并相似概念（异步优化版本）
   * @param concepts 概念列表
   * @param similarityThreshold 相似度阈值
   * @returns 合并后的概念列表
   */
  public async mergeSimilarConcepts(
    concepts: CognitiveConcept[],
    similarityThreshold: number = 0.8
  ): Promise<CognitiveConcept[]> {
    // 生成缓存键
    const cacheKey = `mergedConcepts:${JSON.stringify(concepts.map(c => c.id).sort())}:${similarityThreshold}`;

    // 检查缓存
    if (this.cacheService) {
      const cachedResult = await this.cacheService.get<CognitiveConcept[]>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    const mergedConcepts: CognitiveConcept[] = [];
    const processedIds = new Set<string>();
    const nameToConceptMap = new Map<string, { concept: CognitiveConcept; count: number; mergedFrom: string[] }>();

    // 第一遍：按名称分组，初步合并完全相同的概念
    for (const concept of concepts) {
      const name = concept.name.toLowerCase();
      if (nameToConceptMap.has(name)) {
        const existing = nameToConceptMap.get(name)!;
        existing.count++;
        existing.concept.confidence = (existing.concept.confidence * (existing.count - 1) + concept.confidence) / existing.count;
        existing.concept.occurrenceCount += concept.occurrenceCount;
        existing.mergedFrom.push(concept.name);
      } else {
        nameToConceptMap.set(name, {
          concept: { ...concept },
          count: 1,
          mergedFrom: []
        });
      }
    }

    // 转换为数组以便处理
    const uniqueConcepts = Array.from(nameToConceptMap.values()).map(item => {
      if (item.mergedFrom.length > 0) {
        item.concept.metadata = {
          ...item.concept.metadata,
          mergedFrom: item.mergedFrom
        };
      }
      return item.concept;
    });

    // 第二遍：处理相似概念（使用更高效的相似度计算）
    for (let i = 0; i < uniqueConcepts.length; i++) {
      if (processedIds.has(uniqueConcepts[i].id)) continue;

      let mergedConcept = { ...uniqueConcepts[i] };
      let mergedCount = 1;
      let mergedFrom: string[] = [];

      // 使用Promise.all并行处理相似概念匹配，提高性能
      const similarityPromises = [];
      for (let j = i + 1; j < uniqueConcepts.length; j++) {
        if (processedIds.has(uniqueConcepts[j].id)) continue;

        // 优化：先检查长度差异，如果差异太大则直接跳过
        const lenDiff = Math.abs(uniqueConcepts[i].name.length - uniqueConcepts[j].name.length);
        const maxLen = Math.max(uniqueConcepts[i].name.length, uniqueConcepts[j].name.length);
        if (lenDiff / maxLen > (1 - similarityThreshold)) {
          continue;
        }

        similarityPromises.push({
          index: j,
          promise: this.calculateConceptSimilarity(uniqueConcepts[i], uniqueConcepts[j])
        });
      }

      // 并行计算相似度
      const similarityResults = await Promise.all(
        similarityPromises.map(p => p.promise.then(similarity => ({ index: p.index, similarity })))
      );

      // 处理相似度结果
      for (const result of similarityResults) {
        if (result.similarity >= similarityThreshold) {
          const j = result.index;
          // 合并概念属性
          mergedConcept.confidence = (mergedConcept.confidence * mergedCount + uniqueConcepts[j].confidence) / (mergedCount + 1);
          mergedConcept.occurrenceCount += uniqueConcepts[j].occurrenceCount;
          mergedFrom.push(uniqueConcepts[j].name);

          processedIds.add(uniqueConcepts[j].id);
          mergedCount++;
        }
      }

      if (mergedFrom.length > 0) {
        mergedConcept.metadata = {
          ...mergedConcept.metadata,
          mergedFrom: [
            ...(mergedConcept.metadata.mergedFrom || []),
            ...mergedFrom
          ]
        };
      }

      mergedConcepts.push(new CognitiveConcept(mergedConcept));
      processedIds.add(uniqueConcepts[i].id);
    }

    // 缓存结果，有效期1小时
    if (this.cacheService) {
      await this.cacheService.set(cacheKey, mergedConcepts, 3600000);
    }

    return mergedConcepts;
  }
}
