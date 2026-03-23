# Day 38: 第二阶段 - AI融合期 - Week 6 - 第38天

## 今日目标
实现向量存储逻辑，包括向量存储服务层、索引管理和与认知模型的集成。

## 代码实现

### 1. 向量存储服务层

```typescript
// src/application/vector/VectorStorageService.ts

import { VectorStore, VectorPoint, VectorSearchResult } from './VectorStore';
import { EmbeddingService } from '../ai/embedding/EmbeddingService';
import { Logger } from '../logger/Logger';

/**
 * 向量存储服务，封装向量存储的业务逻辑
 */
export class VectorStorageService {
  constructor(
    private vectorStore: VectorStore,
    private embeddingService: EmbeddingService,
    private logger: Logger
  ) {}
  
  /**
   * 初始化向量存储
   */
  async initialize(): Promise<void> {
    await this.vectorStore.initialize();
    this.logger.info('Vector storage initialized successfully');
  }
  
  /**
   * 存储文本向量
   * @param id 唯一标识符
   * @param text 要存储的文本
   * @param metadata 元数据
   */
  async storeTextVector(id: string, text: string, metadata: Record<string, any>): Promise<void> {
    // 生成 Embedding 向量
    const embedding = await this.embeddingService.generateEmbedding(text);
    
    // 创建向量点
    const vectorPoint: VectorPoint = {
      id,
      vector: embedding.vector,
      metadata,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // 存储向量点
    await this.vectorStore.insertPoint(vectorPoint);
    this.logger.debug(`Stored vector for ${id}`, { metadata });
  }
  
  /**
   * 批量存储文本向量
   * @param items 要存储的文本项数组
   */
  async batchStoreTextVectors(items: Array<{ id: string; text: string; metadata: Record<string, any> }>): Promise<void> {
    // 提取所有文本
    const texts = items.map(item => item.text);
    
    // 批量生成 Embedding 向量
    const embeddings = await this.embeddingService.generateEmbeddings(texts);
    
    // 创建向量点数组
    const vectorPoints: VectorPoint[] = items.map((item, index) => ({
      id: item.id,
      vector: embeddings[index].vector,
      metadata: item.metadata,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
    
    // 批量存储向量点
    await this.vectorStore.insertPoints(vectorPoints);
    this.logger.debug(`Batch stored ${vectorPoints.length} vectors`);
  }
  
  /**
   * 根据 ID 获取向量
   * @param id 向量 ID
   * @returns 向量点，不存在则返回 null
   */
  async getVectorById(id: string): Promise<VectorPoint | null> {
    return this.vectorStore.getPointById(id);
  }
  
  /**
   * 根据 ID 数组获取向量
   * @param ids 向量 ID 数组
   * @returns 向量点数组
   */
  async getVectorsByIds(ids: string[]): Promise<VectorPoint[]> {
    return this.vectorStore.getPointsByIds(ids);
  }
  
  /**
   * 更新向量
   * @param id 向量 ID
   * @param text 新文本（可选）
   * @param metadata 新元数据（可选）
   */
  async updateVector(id: string, text?: string, metadata?: Record<string, any>): Promise<void> {
    const updateData: Partial<VectorPoint> = {
      updatedAt: Date.now()
    };
    
    // 如果提供了新文本，重新生成 Embedding 向量
    if (text) {
      const embedding = await this.embeddingService.generateEmbedding(text);
      updateData.vector = embedding.vector;
    }
    
    // 如果提供了新元数据，更新元数据
    if (metadata) {
      updateData.metadata = metadata;
    }
    
    // 更新向量点
    await this.vectorStore.updatePoint(id, updateData);
    this.logger.debug(`Updated vector ${id}`);
  }
  
  /**
   * 删除向量
   * @param id 向量 ID
   */
  async deleteVector(id: string): Promise<void> {
    await this.vectorStore.deletePoint(id);
    this.logger.debug(`Deleted vector ${id}`);
  }
  
  /**
   * 批量删除向量
   * @param ids 向量 ID 数组
   */
  async batchDeleteVectors(ids: string[]): Promise<void> {
    await this.vectorStore.deletePoints(ids);
    this.logger.debug(`Batch deleted ${ids.length} vectors`);
  }
  
  /**
   * 搜索相似向量
   * @param query 查询文本或向量
   * @param limit 返回结果数量
   * @param filter 过滤条件
   * @returns 相似度搜索结果
   */
  async searchSimilarVectors(query: string | number[], limit: number = 10, filter?: Record<string, any>): Promise<VectorSearchResult[]> {
    let searchVector: number[];
    
    // 如果查询是文本，生成 Embedding 向量
    if (typeof query === 'string') {
      const embedding = await this.embeddingService.generateEmbedding(query);
      searchVector = embedding.vector;
    } else {
      // 否则直接使用提供的向量
      searchVector = query;
    }
    
    // 执行相似度搜索
    const results = await this.vectorStore.search(searchVector, limit, filter);
    this.logger.debug(`Search returned ${results.length} results`, { query: typeof query === 'string' ? query : 'vector' });
    
    return results;
  }
  
  /**
   * 批量搜索相似向量
   * @param queries 查询文本或向量数组
   * @param limit 每个查询返回结果数量
   * @param filter 过滤条件
   * @returns 相似度搜索结果数组
   */
  async batchSearchSimilarVectors(queries: Array<string | number[]>, limit: number = 10, filter?: Record<string, any>): Promise<VectorSearchResult[][]> {
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
    
    // 执行批量相似度搜索
    const results = await this.vectorStore.searchBatch(searchVectors, limit, filter);
    this.logger.debug(`Batch search completed for ${queries.length} queries`);
    
    return results;
  }
  
  /**
   * 获取向量存储统计信息
   * @returns 统计信息
   */
  async getStatistics(): Promise<any> {
    const collectionInfo = await this.vectorStore.getCollectionInfo();
    return {
      collectionName: collectionInfo.name,
      vectorCount: collectionInfo.vectors_count,
      dimension: collectionInfo.config.params.vectors.size,
      distance: collectionInfo.config.params.vectors.distance
    };
  }
}
```

### 2. 向量索引管理

```typescript
// src/application/vector/VectorIndexManager.ts

import { VectorStore } from './VectorStore';
import { Logger } from '../logger/Logger';

/**
 * 向量索引配置
 */
export interface VectorIndexConfig {
  /** 索引名称 */
  name: string;
  /** 向量维度 */
  dimension: number;
  /** 距离度量方式 */
  distance: 'Cosine' | 'Euclidean' | 'Dot';
  /** 索引类型 */
  indexType: 'hnsw' | 'ivf' | 'flat';
  /** 索引参数 */
  params: Record<string, any>;
}

/**
 * 向量索引管理器，负责索引的创建、更新和删除
 */
export class VectorIndexManager {
  constructor(private vectorStore: VectorStore, private logger: Logger) {}
  
  /**
   * 创建向量索引
   * @param config 索引配置
   */
  async createIndex(config: VectorIndexConfig): Promise<void> {
    // 注意：实际的索引创建逻辑依赖于具体的向量数据库
    // 这里提供一个抽象实现，具体实现需要根据向量数据库的 API 进行调整
    this.logger.info(`Creating index ${config.name}`, { config });
    
    // 对于 Qdrant，索引是在创建集合时自动创建的
    // 这里我们可以添加额外的索引配置逻辑
  }
  
  /**
   * 更新向量索引
   * @param name 索引名称
   * @param params 新的索引参数
   */
  async updateIndex(name: string, params: Record<string, any>): Promise<void> {
    this.logger.info(`Updating index ${name}`, { params });
    // 实际的索引更新逻辑
  }
  
  /**
   * 删除向量索引
   * @param name 索引名称
   */
  async deleteIndex(name: string): Promise<void> {
    this.logger.info(`Deleting index ${name}`);
    // 实际的索引删除逻辑
  }
  
  /**
   * 获取索引信息
   * @param name 索引名称
   * @returns 索引信息
   */
  async getIndexInfo(name: string): Promise<any> {
    this.logger.debug(`Getting info for index ${name}`);
    // 实际的索引信息获取逻辑
    return { name };
  }
  
  /**
   * 重建向量索引
   * @param name 索引名称
   */
  async rebuildIndex(name: string): Promise<void> {
    this.logger.info(`Rebuilding index ${name}`);
    // 实际的索引重建逻辑
  }
}
```

### 3. 与认知模型的集成

```typescript
// src/application/cognitive/CognitiveVectorService.ts

import { VectorStorageService } from '../vector/VectorStorageService';
import { CognitiveConcept } from '../../domain/cognitive/CognitiveConcept';
import { CognitiveRelation } from '../../domain/cognitive/CognitiveRelation';
import { Logger } from '../logger/Logger';

/**
 * 认知向量服务，负责认知模型与向量存储的集成
 */
export class CognitiveVectorService {
  constructor(
    private vectorStorageService: VectorStorageService,
    private logger: Logger
  ) {}
  
  /**
   * 存储认知概念向量
   * @param concept 认知概念
   */
  async storeConceptVector(concept: CognitiveConcept): Promise<void> {
    // 构建概念文本表示
    const text = `${concept.name}: ${concept.description || ''}`;
    
    // 存储概念向量
    await this.vectorStorageService.storeTextVector(
      concept.id,
      text,
      {
        type: 'cognitive_concept',
        name: concept.name,
        category: concept.category,
        importance: concept.importance,
        createdAt: concept.createdAt,
        updatedAt: concept.updatedAt
      }
    );
  }
  
  /**
   * 批量存储认知概念向量
   * @param concepts 认知概念数组
   */
  async batchStoreConceptVectors(concepts: CognitiveConcept[]): Promise<void> {
    const items = concepts.map(concept => {
      const text = `${concept.name}: ${concept.description || ''}`;
      return {
        id: concept.id,
        text,
        metadata: {
          type: 'cognitive_concept',
          name: concept.name,
          category: concept.category,
          importance: concept.importance,
          createdAt: concept.createdAt,
          updatedAt: concept.updatedAt
        }
      };
    });
    
    await this.vectorStorageService.batchStoreTextVectors(items);
  }
  
  /**
   * 搜索相似的认知概念
   * @param query 查询文本
   * @param limit 返回结果数量
   * @param category 概念类别过滤
   * @returns 相似概念搜索结果
   */
  async searchSimilarConcepts(query: string, limit: number = 5, category?: string): Promise<any[]> {
    // 构建过滤条件
    const filter: Record<string, any> = { type: 'cognitive_concept' };
    if (category) {
      filter.category = category;
    }
    
    // 搜索相似向量
    const results = await this.vectorStorageService.searchSimilarVectors(query, limit, filter);
    
    // 转换为概念格式
    return results.map(result => ({
      id: result.id,
      name: result.metadata.name,
      category: result.metadata.category,
      importance: result.metadata.importance,
      similarityScore: result.score
    }));
  }
  
  /**
   * 存储认知关系向量
   * @param relation 认知关系
   */
  async storeRelationVector(relation: CognitiveRelation): Promise<void> {
    // 构建关系文本表示
    const text = `${relation.sourceConceptId} ${relation.type} ${relation.targetConceptId}: ${relation.description || ''}`;
    
    // 存储关系向量
    await this.vectorStorageService.storeTextVector(
      relation.id,
      text,
      {
        type: 'cognitive_relation',
        source: relation.sourceConceptId,
        target: relation.targetConceptId,
        relationType: relation.type,
        strength: relation.strength,
        confidence: relation.confidence,
        createdAt: relation.createdAt,
        updatedAt: relation.updatedAt
      }
    );
  }
  
  /**
   * 搜索相关的认知关系
   * @param conceptId 概念 ID
   * @param limit 返回结果数量
   * @returns 相关关系搜索结果
   */
  async searchRelatedRelations(conceptId: string, limit: number = 10): Promise<any[]> {
    // 构建查询文本
    const query = `Concept ${conceptId} related relations`;
    
    // 构建过滤条件，搜索与该概念相关的关系
    const filter: Record<string, any> = {
      type: 'cognitive_relation',
      $or: [
        { source: conceptId },
        { target: conceptId }
      ]
    };
    
    // 搜索相似向量
    const results = await this.vectorStorageService.searchSimilarVectors(query, limit, filter);
    
    // 转换为关系格式
    return results.map(result => ({
      id: result.id,
      source: result.metadata.source,
      target: result.metadata.target,
      relationType: result.metadata.relationType,
      strength: result.metadata.strength,
      confidence: result.metadata.confidence,
      similarityScore: result.score
    }));
  }
}
```

### 4. 集成到依赖注入容器

```typescript
// src/infrastructure/container/DependencyContainer.ts

import { SimpleDependencyContainer } from '../../../../phase-1-foundation/week-4-minimal-system/26-system-integration-code.md';
import { VectorStorageService } from '../../application/vector/VectorStorageService';
import { VectorIndexManager } from '../../application/vector/VectorIndexManager';
import { CognitiveVectorService } from '../../application/cognitive/CognitiveVectorService';
import { VectorStore } from '../../application/vector/VectorStore';
import { EmbeddingService } from '../../application/ai/embedding/EmbeddingService';
import { Logger } from '../../application/logger/Logger';

/**
 * 配置向量存储服务相关依赖
 * @param container 依赖注入容器
 */
export function configureVectorStorageDependencies(container: SimpleDependencyContainer): void {
  // 注册向量存储服务
  container.registerSingleton(VectorStorageService, (c) => {
    const vectorStore = c.resolve<VectorStore>(VectorStore);
    const embeddingService = c.resolve<EmbeddingService>(EmbeddingService);
    const logger = c.resolve<Logger>(Logger);
    return new VectorStorageService(vectorStore, embeddingService, logger);
  });
  
  // 注册向量索引管理器
  container.registerSingleton(VectorIndexManager, (c) => {
    const vectorStore = c.resolve<VectorStore>(VectorStore);
    const logger = c.resolve<Logger>(Logger);
    return new VectorIndexManager(vectorStore, logger);
  });
  
  // 注册认知向量服务
  container.registerSingleton(CognitiveVectorService, (c) => {
    const vectorStorageService = c.resolve<VectorStorageService>(VectorStorageService);
    const logger = c.resolve<Logger>(Logger);
    return new CognitiveVectorService(vectorStorageService, logger);
  });
}
```

### 5. 测试代码

```typescript
// test/application/vector/VectorStorageService.test.ts

import { VectorStorageService } from '../../../src/application/vector/VectorStorageService';
import { VectorStore } from '../../../src/application/vector/VectorStore';
import { EmbeddingService } from '../../../src/application/ai/embedding/EmbeddingService';
import { Logger } from '../../../src/application/logger/Logger';

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

describe('VectorStorageService', () => {
  let vectorStorageService: VectorStorageService;
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
      search: jest.fn().mockResolvedValue([]),
      searchBatch: jest.fn().mockResolvedValue([[]]),
      getCollectionInfo: jest.fn().mockResolvedValue({
        name: 'test_collection',
        vectors_count: 100,
        config: {
          params: {
            vectors: {
              size: 1536,
              distance: 'Cosine'
            }
          }
        }
      }),
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
      getModelInfo: jest.fn().mockResolvedValue({
        name: 'test-model',
        dimension: 1536,
        description: 'Test model',
        available: true
      }),
      listModels: jest.fn().mockResolvedValue(['test-model'])
    } as any;
    
    logger = new MockLogger();
    
    // 创建向量存储服务实例
    vectorStorageService = new VectorStorageService(
      mockVectorStore,
      mockEmbeddingService,
      logger
    );
  });
  
  describe('initialize', () => {
    it('should initialize vector store', async () => {
      await vectorStorageService.initialize();
      expect(mockVectorStore.initialize).toHaveBeenCalled();
    });
  });
  
  describe('storeTextVector', () => {
    it('should generate embedding and store vector', async () => {
      const id = 'test-id';
      const text = 'Test text';
      const metadata = { type: 'test' };
      
      await vectorStorageService.storeTextVector(id, text, metadata);
      
      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalledWith(text);
      expect(mockVectorStore.insertPoint).toHaveBeenCalled();
    });
  });
  
  describe('searchSimilarVectors', () => {
    it('should search for similar vectors', async () => {
      const query = 'Test query';
      const results = await vectorStorageService.searchSimilarVectors(query, 5);
      
      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalledWith(query);
      expect(mockVectorStore.search).toHaveBeenCalled();
      expect(results).toEqual([]);
    });
  });
  
  describe('getStatistics', () => {
    it('should return vector store statistics', async () => {
      const stats = await vectorStorageService.getStatistics();
      
      expect(mockVectorStore.getCollectionInfo).toHaveBeenCalled();
      expect(stats).toEqual({
        collectionName: 'test_collection',
        vectorCount: 100,
        dimension: 1536,
        distance: 'Cosine'
      });
    });
  });
});
```

### 6. 使用示例

```typescript
// src/application/use-cases/cognitive/UpdateConceptVectorUseCase.ts

import { CognitiveVectorService } from '../../cognitive/CognitiveVectorService';
import { CognitiveConceptRepository } from '../../../domain/cognitive/CognitiveConceptRepository';

/**
 * 更新概念向量的用例
 */
export class UpdateConceptVectorUseCase {
  constructor(
    private cognitiveVectorService: CognitiveVectorService,
    private conceptRepository: CognitiveConceptRepository
  ) {}
  
  /**
   * 执行用例
   * @param conceptId 概念 ID
   */
  async execute(conceptId: string) {
    // 获取概念
    const concept = await this.conceptRepository.findById(conceptId);
    if (!concept) {
      throw new Error(`Concept ${conceptId} not found`);
    }
    
    // 更新概念向量
    await this.cognitiveVectorService.storeConceptVector(concept);
  }
}

/**
 * 搜索相似概念的用例
 */
export class SearchSimilarConceptsUseCase {
  constructor(private cognitiveVectorService: CognitiveVectorService) {}
  
  /**
   * 执行用例
   * @param query 搜索查询
   * @param limit 返回结果数量
   * @param category 概念类别过滤
   */
  async execute(query: string, limit: number = 5, category?: string) {
    return this.cognitiveVectorService.searchSimilarConcepts(query, limit, category);
  }
}
```

## 设计说明

1. **服务分层**：设计了清晰的服务分层结构，包括：
   - VectorStore：向量数据库的抽象接口
   - VectorStorageService：向量存储的业务逻辑封装
   - VectorIndexManager：向量索引的管理
   - CognitiveVectorService：认知模型与向量存储的集成

2. **业务逻辑封装**：将向量存储的业务逻辑封装在 VectorStorageService 中，提供了简洁易用的 API，隐藏了底层向量数据库的复杂性。

3. **批量处理**：支持单个和批量操作，提高处理效率。

4. **认知模型集成**：通过 CognitiveVectorService 实现了认知模型与向量存储的深度集成，便于存储和搜索认知概念和关系的向量表示。

5. **索引管理**：提供了 VectorIndexManager 用于管理向量索引，支持索引的创建、更新、删除和重建。

6. **依赖注入**：所有服务都集成到了依赖注入容器中，便于在其他服务和用例中使用。

7. **测试支持**：编写了测试代码，便于验证向量存储服务的功能。

## 今日总结

今天实现了向量存储逻辑，包括：

1. 实现了 VectorStorageService，封装了向量存储的业务逻辑
2. 实现了 VectorIndexManager，用于管理向量索引
3. 实现了 CognitiveVectorService，实现了认知模型与向量存储的集成
4. 更新了依赖注入容器配置
5. 编写了测试代码
6. 提供了使用示例

这些功能将为认知模型的构建和演进提供强大的向量存储支持，便于实现概念和关系的相似性搜索、相关关系发现等高级功能。
