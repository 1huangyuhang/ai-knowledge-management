import { Vector, VectorRepository } from '../../../../domain/entities';
import { EmbeddingService } from './EmbeddingService';

/**
 * 相似度搜索结果
 */
export interface SimilaritySearchResult {
  /**
   * 匹配的向量
   */
  vector: Vector;
  /**
   * 相似度分数
   */
  score: number;
  /**
   * 元数据
   */
  metadata: Record<string, any>;
}

/**
 * 相似度搜索服务接口
 */
export interface SimilaritySearchService {
  /**
   * 搜索相似向量
   * @param queryEmbedding 查询向量
   * @param limit 返回结果数量
   * @param filters 过滤条件
   * @returns 相似向量列表
   */
  searchSimilar(
    queryEmbedding: number[],
    limit: number,
    filters?: Record<string, any>
  ): Promise<SimilaritySearchResult[]>;

  /**
   * 基于内容搜索相似向量
   * @param content 搜索内容
   * @param limit 返回结果数量
   * @returns 相似向量列表
   */
  searchSimilarByContent(
    content: string,
    limit: number
  ): Promise<SimilaritySearchResult[]>;

  /**
   * 批量搜索相似向量
   * @param queryEmbeddings 查询向量数组
   * @param limit 每个查询返回结果数量
   * @returns 批量搜索结果
   */
  batchSearchSimilar(
    queryEmbeddings: number[][],
    limit: number
  ): Promise<SimilaritySearchResult[][]>;
}

/**
 * 相似度搜索服务实现
 */
export class SimilaritySearchServiceImpl implements SimilaritySearchService {
  private readonly vectorRepository: VectorRepository;
  private readonly embeddingService: EmbeddingService;

  /**
   * 创建相似度搜索服务实例
   * @param vectorRepository 向量仓库
   * @param embeddingService 嵌入服务
   */
  constructor(
    vectorRepository: VectorRepository,
    embeddingService: EmbeddingService
  ) {
    this.vectorRepository = vectorRepository;
    this.embeddingService = embeddingService;
  }

  /**
   * 搜索相似向量
   * @param queryEmbedding 查询向量
   * @param limit 返回结果数量
   * @param filters 过滤条件
   * @returns 相似向量列表
   */
  public async searchSimilar(
    queryEmbedding: number[],
    limit: number = 5,
    filters?: Record<string, any>
  ): Promise<SimilaritySearchResult[]> {
    try {
      // 目前VectorRepository的searchSimilar方法不支持过滤，后续可以扩展
      const similarVectorsWithScores = await this.vectorRepository.searchSimilar(queryEmbedding, limit);

      // 转换为相似度搜索结果格式
      return similarVectorsWithScores.map(({vector, score}) => ({
        vector,
        score,
        metadata: vector.metadata
      }));
    } catch (error) {
      throw new Error(`Failed to search similar vectors: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 基于内容搜索相似向量
   * @param content 搜索内容
   * @param limit 返回结果数量
   * @returns 相似向量列表
   */
  public async searchSimilarByContent(
    content: string,
    limit: number = 5
  ): Promise<SimilaritySearchResult[]> {
    try {
      // 1. 生成内容的嵌入向量
      const vector = await this.embeddingService.embedText(content);

      // 2. 使用嵌入向量搜索相似向量
      return this.searchSimilar(vector.embedding, limit);
    } catch (error) {
      throw new Error(`Failed to search similar vectors by content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 批量搜索相似向量
   * @param queryEmbeddings 查询向量数组
   * @param limit 每个查询返回结果数量
   * @returns 批量搜索结果
   */
  public async batchSearchSimilar(
    queryEmbeddings: number[][],
    limit: number = 5
  ): Promise<SimilaritySearchResult[][]> {
    try {
      // 并行处理批量查询
      const searchPromises = queryEmbeddings.map(embedding => 
        this.searchSimilar(embedding, limit)
      );

      return await Promise.all(searchPromises);
    } catch (error) {
      throw new Error(`Failed to batch search similar vectors: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
