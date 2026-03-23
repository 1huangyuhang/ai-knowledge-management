# Day 39: 第二阶段 - AI融合期 - Week 6 - 第39天

## 今日目标
实现高级相似度搜索功能，包括搜索算法优化、结果排序、元数据过滤和混合搜索等。

## 代码实现

### 1. 高级搜索选项接口

```typescript
// src/application/vector/SearchOptions.ts

/**
 * 相似度搜索选项接口
 */
export interface SearchOptions {
  /** 返回结果数量 */
  limit?: number;
  /** 相似度阈值，低于该值的结果将被过滤 */
  similarityThreshold?: number;
  /** 元数据过滤条件 */
  filter?: Record<string, any>;
  /** 搜索类型 */
  searchType?: SearchType;
  /** 是否包含向量数据 */
  includeVectors?: boolean;
  /** 是否包含完整元数据 */
  includeFullMetadata?: boolean;
}

/**
 * 搜索类型枚举
 */
export enum SearchType {
  /** 仅向量搜索 */
  VectorOnly = 'vector_only',
  /** 仅文本搜索 */
  TextOnly = 'text_only',
  /** 混合搜索（向量+文本） */
  Hybrid = 'hybrid'
}

/**
 * 混合搜索权重配置
 */
export interface HybridSearchWeights {
  /** 向量搜索权重（0-1） */
  vectorWeight: number;
  /** 文本搜索权重（0-1） */
  textWeight: number;
}
```

### 2. 相似度搜索服务

```typescript
// src/application/vector/SimilaritySearchService.ts

import { VectorStore, VectorSearchResult } from './VectorStore';
import { EmbeddingService } from '../ai/embedding/EmbeddingService';
import { SearchOptions, SearchType } from './SearchOptions';
import { Logger } from '../logger/Logger';

/**
 * 相似度搜索服务，提供高级搜索功能
 */
export class SimilaritySearchService {
  constructor(
    private vectorStore: VectorStore,
    private embeddingService: EmbeddingService,
    private logger: Logger
  ) {}
  
  /**
   * 执行相似度搜索
   * @param query 查询文本或向量
   * @param options 搜索选项
   * @returns 相似度搜索结果
   */
  async search(
    query: string | number[],
    options: SearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    const {
      limit = 10,
      similarityThreshold = 0.1,
      filter = {},
      searchType = SearchType.VectorOnly
    } = options;
    
    let searchResults: VectorSearchResult[] = [];
    
    switch (searchType) {
      case SearchType.VectorOnly:
        // 仅向量搜索
        searchResults = await this.vectorSearch(query, limit, filter);
        break;
      case SearchType.TextOnly:
        // 仅文本搜索（预留）
        this.logger.warn('Text-only search not implemented yet, falling back to vector search');
        searchResults = await this.vectorSearch(query, limit, filter);
        break;
      case SearchType.Hybrid:
        // 混合搜索（预留）
        this.logger.warn('Hybrid search not implemented yet, falling back to vector search');
        searchResults = await this.vectorSearch(query, limit, filter);
        break;
      default:
        searchResults = await this.vectorSearch(query, limit, filter);
    }
    
    // 根据相似度阈值过滤结果
    return searchResults.filter(result => result.score >= similarityThreshold);
  }
  
  /**
   * 执行向量搜索
   * @param query 查询文本或向量
   * @param limit 返回结果数量
   * @param filter 过滤条件
   * @returns 向量搜索结果
   */
  private async vectorSearch(
    query: string | number[],
    limit: number,
    filter: Record<string, any>
  ): Promise<VectorSearchResult[]> {
    let searchVector: number[];
    
    // 如果查询是文本，生成 Embedding 向量
    if (typeof query === 'string') {
      const embedding = await this.embeddingService.generateEmbedding(query);
      searchVector = embedding.vector;
    } else {
      // 否则直接使用提供的向量
      searchVector = query;
    }
    
    // 执行向量搜索
    return this.vectorStore.search(searchVector, limit, filter);
  }
  
  /**
   * 批量执行相似度搜索
   * @param queries 查询文本或向量数组
   * @param options 搜索选项
   * @returns 批量搜索结果
   */
  async batchSearch(
    queries: Array<string | number[]>,
    options: SearchOptions = {}
  ): Promise<VectorSearchResult[][]> {
    const {
      limit = 10,
      similarityThreshold = 0.1,
      filter = {}
    } = options;
    
    // 处理所有查询，生成搜索向量
    const searchVectors: number[][] = await Promise.all(
      queries.map(async (query) => {
        if (typeof query === 'string') {
          const embedding = await this.embeddingService.generateEmbedding(query);
          return embedding.vector;
        } else {
          return query;
        }
      })
    );
    
    // 执行批量向量搜索
    const batchResults = await this.vectorStore.searchBatch(searchVectors, limit, filter);
    
    // 根据相似度阈值过滤结果
    return batchResults.map(results => 
      results.filter(result => result.score >= similarityThreshold)
    );
  }
  
  /**
   * 搜索相似概念
   * @param conceptId 概念 ID
   * @param options 搜索选项
   * @returns 相似概念搜索结果
   */
  async searchSimilarConcepts(
    conceptId: string,
    options: SearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    // 构建查询文本
    const query = `Similar concepts to ${conceptId}`;
    
    // 构建过滤条件，只搜索认知概念
    const filter = {
      ...options.filter,
      type: 'cognitive_concept'
    };
    
    return this.search(query, { ...options, filter });
  }
  
  /**
   * 搜索相关关系
   * @param conceptId 概念 ID
   * @param options 搜索选项
   * @returns 相关关系搜索结果
   */
  async searchRelatedRelations(
    conceptId: string,
    options: SearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    // 构建查询文本
    const query = `Relations related to ${conceptId}`;
    
    // 构建过滤条件，只搜索与该概念相关的认知关系
    const filter = {
      ...options.filter,
      type: 'cognitive_relation',
      $or: [
        { source: conceptId },
        { target: conceptId }
      ]
    };
    
    return this.search(query, { ...options, filter });
  }
  
  /**
   * 执行语义搜索
   * @param query 搜索查询
   * @param options 搜索选项
   * @returns 语义搜索结果
   */
  async semanticSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    // 语义搜索本质上是向量搜索，这里可以添加额外的处理逻辑
    return this.search(query, options);
  }
  
  /**
   * 优化搜索查询
   * @param query 原始查询
   * @returns 优化后的查询
   */
  private optimizeQuery(query: string): string {
    // 这里可以添加查询优化逻辑，如关键词提取、同义词替换等
    // 目前简单返回原始查询
    return query;
  }
}
```

### 3. 搜索结果后处理服务

```typescript
// src/application/vector/SearchResultPostProcessor.ts

import { VectorSearchResult } from './VectorStore';

/**
 * 搜索结果后处理器，用于对搜索结果进行后处理
 */
export class SearchResultPostProcessor {
  /**
   * 对搜索结果进行排序
   * @param results 搜索结果数组
   * @param sortBy 排序字段
   * @param ascending 是否升序排序
   * @returns 排序后的结果
   */
  static sortResults(
    results: VectorSearchResult[],
    sortBy: 'score' | 'id' = 'score',
    ascending: boolean = false
  ): VectorSearchResult[] {
    return [...results].sort((a, b) => {
      if (sortBy === 'score') {
        return ascending ? a.score - b.score : b.score - a.score;
      } else {
        return ascending 
          ? a.id.localeCompare(b.id)
          : b.id.localeCompare(a.id);
      }
    });
  }
  
  /**
   * 对搜索结果进行去重
   * @param results 搜索结果数组
   * @returns 去重后的结果
   */
  static deduplicateResults(results: VectorSearchResult[]): VectorSearchResult[] {
    const seenIds = new Set<string>();
    const uniqueResults: VectorSearchResult[] = [];
    
    for (const result of results) {
      if (!seenIds.has(result.id)) {
        seenIds.add(result.id);
        uniqueResults.push(result);
      }
    }
    
    return uniqueResults;
  }
  
  /**
   * 根据相似度阈值过滤结果
   * @param results 搜索结果数组
   * @param threshold 相似度阈值
   * @returns 过滤后的结果
   */
  static filterBySimilarityThreshold(
    results: VectorSearchResult[],
    threshold: number
  ): VectorSearchResult[] {
    return results.filter(result => result.score >= threshold);
  }
  
  /**
   * 合并多个搜索结果
   * @param resultSets 多个搜索结果数组
   * @param mergeStrategy 合并策略
   * @returns 合并后的结果
   */
  static mergeResults(
    resultSets: VectorSearchResult[][],
    mergeStrategy: MergeStrategy = MergeStrategy.ReciprocalRankFusion
  ): VectorSearchResult[] {
    switch (mergeStrategy) {
      case MergeStrategy.SimpleUnion:
        return this.simpleUnion(resultSets);
      case MergeStrategy.ReciprocalRankFusion:
        return this.reciprocalRankFusion(resultSets);
      default:
        return this.simpleUnion(resultSets);
    }
  }
  
  /**
   * 简单合并策略：取所有结果的并集
   * @param resultSets 多个搜索结果数组
   * @returns 合并后的结果
   */
  private static simpleUnion(resultSets: VectorSearchResult[][]): VectorSearchResult[] {
    const allResults = resultSets.flat();
    return this.deduplicateResults(allResults);
  }
  
  /**
   *  reciprocal rank fusion (RRF) 合并策略
   * @param resultSets 多个搜索结果数组
   * @param k RRF 参数，默认值为 60
   * @returns 合并后的结果
   */
  private static reciprocalRankFusion(resultSets: VectorSearchResult[][], k: number = 60): VectorSearchResult[] {
    const scores = new Map<string, number>();
    
    // 计算每个结果的 RRF 分数
    for (const results of resultSets) {
      results.forEach((result, rank) => {
        const currentScore = scores.get(result.id) || 0;
        scores.set(result.id, currentScore + 1 / (k + rank + 1));
      });
    }
    
    // 转换为结果数组并排序
    const mergedResults: VectorSearchResult[] = [];
    scores.forEach((score, id) => {
      // 找到该 ID 对应的第一个结果，用于获取元数据
      const firstResult = resultSets
        .flat()
        .find(result => result.id === id);
      
      if (firstResult) {
        mergedResults.push({
          id,
          score,
          metadata: firstResult.metadata
        });
      }
    });
    
    // 按分数降序排序
    return this.sortResults(mergedResults, 'score', false);
  }
  
  /**
   * 截断搜索结果
   * @param results 搜索结果数组
   * @param limit 结果数量限制
   * @returns 截断后的结果
   */
  static truncateResults(results: VectorSearchResult[], limit: number): VectorSearchResult[] {
    return results.slice(0, limit);
  }
}

/**
 * 结果合并策略枚举
 */
export enum MergeStrategy {
  /** 简单合并，取所有结果的并集 */
  SimpleUnion = 'simple_union',
  /** Reciprocal Rank Fusion，一种高级结果合并算法 */
  ReciprocalRankFusion = 'reciprocal_rank_fusion'
}
```

### 4. 向量搜索扩展接口

```typescript
// src/application/vector/ExtendedVectorStore.ts

import { VectorStore, VectorPoint, VectorSearchResult } from './VectorStore';
import { SearchOptions } from './SearchOptions';

/**
 * 扩展向量存储接口，提供高级搜索功能
 */
export interface ExtendedVectorStore extends VectorStore {
  /**
   * 高级搜索
   * @param vector 查询向量
   * @param options 搜索选项
   * @returns 搜索结果
   */
  advancedSearch(vector: number[], options: SearchOptions): Promise<VectorSearchResult[]>;
  
  /**
   * 文本搜索
   * @param query 文本查询
   * @param limit 返回结果数量
   * @param filter 过滤条件
   * @returns 搜索结果
   */
  textSearch(query: string, limit: number = 10, filter?: Record<string, any>): Promise<VectorSearchResult[]>;
  
  /**
   * 混合搜索
   * @param vector 查询向量
   * @param textQuery 文本查询
   * @param options 搜索选项
   * @returns 搜索结果
   */
  hybridSearch(vector: number[], textQuery: string, options: SearchOptions): Promise<VectorSearchResult[]>;
}
```

### 5. Qdrant 高级搜索实现

```typescript
// src/infrastructure/vector/qdrant/QdrantAdvancedVectorStore.ts

import { QdrantVectorStore, QdrantConfig } from './QdrantVectorStore';
import { ExtendedVectorStore, VectorSearchResult } from '../../../application/vector/ExtendedVectorStore';
import { SearchOptions } from '../../../application/vector/SearchOptions';
import { Logger } from '../../../application/logger/Logger';

/**
 * Qdrant 高级向量存储实现，提供高级搜索功能
 */
export class QdrantAdvancedVectorStore extends QdrantVectorStore implements ExtendedVectorStore {
  constructor(config: QdrantConfig, logger: Logger) {
    super(config, logger);
  }
  
  /**
   * 高级搜索
   * @param vector 查询向量
   * @param options 搜索选项
   * @returns 搜索结果
   */
  async advancedSearch(vector: number[], options: SearchOptions): Promise<VectorSearchResult[]> {
    const {
      limit = 10,
      filter = {},
      includeVectors = false,
      includeFullMetadata = true
    } = options;
    
    // 执行搜索
    const results = await this.search(vector, limit, filter);
    
    // 根据选项处理结果
    return results.map(result => {
      // 如果不需要完整元数据，可以在这里进行过滤
      if (!includeFullMetadata) {
        // 简化元数据，只保留关键字段
        result.metadata = {
          id: result.id,
          name: result.metadata.name,
          type: result.metadata.type
        };
      }
      
      return result;
    });
  }
  
  /**
   * 文本搜索
   * @param query 文本查询
   * @param limit 返回结果数量
   * @param filter 过滤条件
   * @returns 搜索结果
   */
  async textSearch(query: string, limit: number = 10, filter?: Record<string, any>): Promise<VectorSearchResult[]> {
    // 注意：Qdrant 支持基于元数据的文本搜索，但需要提前配置索引
    // 这里提供一个简化实现，实际项目中需要根据 Qdrant 配置进行调整
    
    // 构建过滤条件，假设我们在元数据中有一个 'text' 字段
    const textFilter = {
      ...filter,
      text: {
        $contains: query
      }
    };
    
    // 使用一个随机向量进行搜索，主要依赖过滤条件
    const randomVector = Array(this.config.vectorDimension).fill(0.1);
    return this.search(randomVector, limit, textFilter);
  }
  
  /**
   * 混合搜索
   * @param vector 查询向量
   * @param textQuery 文本查询
   * @param options 搜索选项
   * @returns 搜索结果
   */
  async hybridSearch(vector: number[], textQuery: string, options: SearchOptions): Promise<VectorSearchResult[]> {
    // 注意：Qdrant 目前不直接支持混合搜索
    // 这里提供一个简化实现，实际项目中需要根据 Qdrant 配置进行调整
    
    // 分别执行向量搜索和文本搜索
    const vectorResults = await this.advancedSearch(vector, options);
    const textResults = await this.textSearch(textQuery, options.limit || 10, options.filter);
    
    // 合并结果
    const allResults = [...vectorResults, ...textResults];
    
    // 去重
    const uniqueResults = Array.from(
      new Map(allResults.map(result => [result.id, result])).values()
    );
    
    // 按分数排序
    return uniqueResults.sort((a, b) => b.score - a.score);
  }
}
```

### 6. 集成到依赖注入容器

```typescript
// src/infrastructure/container/DependencyContainer.ts

import { SimpleDependencyContainer } from '../../../../phase-1-foundation/week-4-minimal-system/26-system-integration-code.md';
import { SimilaritySearchService } from '../../application/vector/SimilaritySearchService';
import { ExtendedVectorStore } from '../../application/vector/ExtendedVectorStore';
import { QdrantAdvancedVectorStore, DEFAULT_QDRANT_CONFIG } from '../vector/qdrant/QdrantAdvancedVectorStore';
import { VectorStore } from '../../application/vector/VectorStore';
import { EmbeddingService } from '../../application/ai/embedding/EmbeddingService';
import { Logger } from '../../application/logger/Logger';

/**
 * 配置相似度搜索相关依赖
 * @param container 依赖注入容器
 */
export function configureSimilaritySearchDependencies(container: SimpleDependencyContainer): void {
  // 注册扩展向量存储（替换原有向量存储）
  container.registerSingleton(ExtendedVectorStore, (c) => {
    const logger = c.resolve<Logger>(Logger);
    const config = {
      url: process.env.QDRANT_URL || DEFAULT_QDRANT_CONFIG.url,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: process.env.QDRANT_COLLECTION_NAME || DEFAULT_QDRANT_CONFIG.collectionName
    };
    
    return new QdrantAdvancedVectorStore(config, logger);
  });
  
  // 同时注册为 VectorStore 类型，以便兼容原有代码
  container.registerSingleton(VectorStore, (c) => {
    return c.resolve<ExtendedVectorStore>(ExtendedVectorStore);
  });
  
  // 注册相似度搜索服务
  container.registerSingleton(SimilaritySearchService, (c) => {
    const vectorStore = c.resolve<VectorStore>(VectorStore);
    const embeddingService = c.resolve<EmbeddingService>(EmbeddingService);
    const logger = c.resolve<Logger>(Logger);
    return new SimilaritySearchService(vectorStore, embeddingService, logger);
  });
}
```

### 7. 测试代码

```typescript
// test/application/vector/SimilaritySearchService.test.ts

import { SimilaritySearchService } from '../../../src/application/vector/SimilaritySearchService';
import { VectorStore } from '../../../src/application/vector/VectorStore';
import { EmbeddingService } from '../../../src/application/ai/embedding/EmbeddingService';
import { Logger } from '../../../src/application/logger/Logger';
import { SearchOptions, SearchType } from '../../../src/application/vector/SearchOptions';

// 模拟 Logger
class MockLogger implements Logger {
  debug(message: string, metadata?: any): void {
    console.log(`DEBUG: ${message}`, metadata);
  }
  
  info(message: string, metadata?: any): void {
    console.log(`INFO: ${message}`, metadata);
  }
  
  warn(message: string, metadata?: any): void {
    console.log(`WARN: ${message}`, metadata);
  }
  
  error(message: string, metadata?: any): void {
    console.log(`ERROR: ${message}`, metadata);
  }
}

describe('SimilaritySearchService', () => {
  let similaritySearchService: SimilaritySearchService;
  let mockVectorStore: jest.Mocked<VectorStore>;
  let mockEmbeddingService: jest.Mocked<EmbeddingService>;
  let logger: Logger;
  
  beforeEach(() => {
    // 创建模拟对象
    mockVectorStore = {
      initialize: jest.fn().mockResolvedValue(undefined),
      insertPoint: jest.fn().mockResolvedValue(undefined),
      insertPoints: jest.fn().mockResolvedValue(undefined),
      getPointById: jest.fn().mockResolvedValue(null),
      getPointsByIds: jest.fn().mockResolvedValue([]),
      updatePoint: jest.fn().mockResolvedValue(undefined),
      deletePoint: jest.fn().mockResolvedValue(undefined),
      deletePoints: jest.fn().mockResolvedValue(undefined),
      search: jest.fn().mockResolvedValue([
        { id: '1', score: 0.95, metadata: { name: 'Concept 1', type: 'cognitive_concept' } },
        { id: '2', score: 0.85, metadata: { name: 'Concept 2', type: 'cognitive_concept' } },
        { id: '3', score: 0.75, metadata: { name: 'Concept 3', type: 'cognitive_concept' } }
      ]),
      searchBatch: jest.fn().mockResolvedValue([[]]),
      getCollectionInfo: jest.fn().mockResolvedValue({}),
      deleteCollection: jest.fn().mockResolvedValue(undefined)
    } as any;
    
    mockEmbeddingService = {
      generateEmbedding: jest.fn().mockResolvedValue({
        vector: Array(1536).fill(0.1),
        dimension: 1536,
        createdAt: Date.now()
      }),
      generateEmbeddings: jest.fn().mockResolvedValue([{
        vector: Array(1536).fill(0.1),
        dimension: 1536,
        createdAt: Date.now()
      }]),
      getModelInfo: jest.fn().mockResolvedValue({}),
      listModels: jest.fn().mockResolvedValue([])
    } as any;
    
    logger = new MockLogger();
    
    // 创建相似度搜索服务实例
    similaritySearchService = new SimilaritySearchService(
      mockVectorStore,
      mockEmbeddingService,
      logger
    );
  });
  
  describe('search', () => {
    it('should return search results with default options', async () => {
      const query = 'Test query';
      const results = await similaritySearchService.search(query);
      
      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalledWith(query);
      expect(mockVectorStore.search).toHaveBeenCalled();
      expect(results.length).toBe(3);
    });
    
    it('should filter results by similarity threshold', async () => {
      const query = 'Test query';
      const options: SearchOptions = {
        similarityThreshold: 0.9
      };
      
      const results = await similaritySearchService.search(query, options);
      
      expect(results.length).toBe(1);
      expect(results[0].score).toBeGreaterThanOrEqual(0.9);
    });
    
    it('should use vector-only search by default', async () => {
      const query = 'Test query';
      const results = await similaritySearchService.search(query);
      
      expect(results.length).toBe(3);
    });
  });
  
  describe('searchSimilarConcepts', () => {
    it('should search for similar concepts', async () => {
      const conceptId = 'concept-1';
      const results = await similaritySearchService.searchSimilarConcepts(conceptId);
      
      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalled();
      expect(mockVectorStore.search).toHaveBeenCalled();
      expect(results.length).toBe(3);
    });
  });
});

// 测试搜索结果后处理器
describe('SearchResultPostProcessor', () => {
  const mockResults: any[] = [
    { id: '3', score: 0.75, metadata: { name: 'Concept 3' } },
    { id: '1', score: 0.95, metadata: { name: 'Concept 1' } },
    { id: '2', score: 0.85, metadata: { name: 'Concept 2' } }
  ];
  
  it('should sort results by score', () => {
    const sortedResults = require('../../../src/application/vector/SearchResultPostProcessor').SearchResultPostProcessor.sortResults(mockResults, 'score', false);
    
    expect(sortedResults[0].id).toBe('1');
    expect(sortedResults[1].id).toBe('2');
    expect(sortedResults[2].id).toBe('3');
  });
  
  it('should deduplicate results', () => {
    const duplicateResults = [...mockResults, mockResults[0]];
    const deduplicatedResults = require('../../../src/application/vector/SearchResultPostProcessor').SearchResultPostProcessor.deduplicateResults(duplicateResults);
    
    expect(deduplicatedResults.length).toBe(3);
  });
  
  it('should filter by similarity threshold', () => {
    const filteredResults = require('../../../src/application/vector/SearchResultPostProcessor').SearchResultPostProcessor.filterBySimilarityThreshold(mockResults, 0.8);
    
    expect(filteredResults.length).toBe(2);
    expect(filteredResults[0].score).toBeGreaterThanOrEqual(0.8);
  });
});
```

### 7. 使用示例

```typescript
// src/application/use-cases/vector/AdvancedSearchUseCase.ts

import { SimilaritySearchService } from '../../vector/SimilaritySearchService';
import { SearchOptions, SearchType } from '../../vector/SearchOptions';

/**
 * 高级搜索用例
 */
export class AdvancedSearchUseCase {
  constructor(private searchService: SimilaritySearchService) {}
  
  /**
   * 执行高级搜索
   * @param query 搜索查询
   * @param options 搜索选项
   */
  async execute(query: string, options: SearchOptions = {}) {
    // 配置高级搜索选项
    const searchOptions: SearchOptions = {
      limit: 10,
      similarityThreshold: 0.7,
      searchType: SearchType.VectorOnly,
      includeFullMetadata: true,
      ...options
    };
    
    // 执行搜索
    const results = await this.searchService.search(query, searchOptions);
    
    return {
      query,
      results,
      totalResults: results.length,
      options: searchOptions
    };
  }
}

/**
 * 概念相似度搜索用例
 */
export class ConceptSimilaritySearchUseCase {
  constructor(private searchService: SimilaritySearchService) {}
  
  /**
   * 执行概念相似度搜索
   * @param conceptId 概念 ID
   * @param limit 返回结果数量
   */
  async execute(conceptId: string, limit: number = 5) {
    return this.searchService.searchSimilarConcepts(conceptId, {
      limit,
      similarityThreshold: 0.6
    });
  }
}
```

## 设计说明

1. **高级搜索选项**：定义了 `SearchOptions` 接口，支持配置搜索结果数量、相似度阈值、过滤条件、搜索类型等。

2. **多种搜索类型**：支持向量搜索、文本搜索和混合搜索（预留），满足不同场景的搜索需求。

3. **搜索结果后处理**：实现了 `SearchResultPostProcessor`，提供结果排序、去重、过滤、合并等功能，特别是实现了 Reciprocal Rank Fusion (RRF) 算法，用于合并多个搜索结果。

4. **扩展向量存储接口**：定义了 `ExtendedVectorStore` 接口，扩展了基础向量存储功能，支持高级搜索、文本搜索和混合搜索。

5. **Qdrant 高级实现**：基于 Qdrant 实现了高级向量存储，提供了高级搜索功能的具体实现。

6. **相似度搜索服务**：封装了相似度搜索的业务逻辑，提供了语义搜索、相似概念搜索、相关关系搜索等高级功能。

7. **依赖注入**：所有服务都集成到了依赖注入容器中，便于在其他服务和用例中使用。

8. **测试支持**：编写了测试代码，便于验证相似度搜索服务和搜索结果后处理器的功能。

## 今日总结

今天实现了高级相似度搜索功能，包括：

1. 定义了 `SearchOptions` 接口，支持配置各种搜索参数
2. 实现了 `SimilaritySearchService`，提供了高级搜索功能
3. 实现了 `SearchResultPostProcessor`，用于搜索结果的后处理
4. 定义了 `ExtendedVectorStore` 接口，扩展了向量存储功能
5. 实现了 `QdrantAdvancedVectorStore`，基于 Qdrant 提供高级搜索功能
6. 更新了依赖注入容器配置
7. 编写了测试代码
8. 提供了使用示例

这些功能将为认知模型的构建和演进提供强大的相似度搜索支持，便于实现概念和关系的相似性搜索、相关关系发现等高级功能。
