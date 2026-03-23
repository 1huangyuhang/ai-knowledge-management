import { Vector, VectorRepository as IVectorRepository } from '../../../../domain/entities';
import { QdrantClient, QdrantCollectionConfig, QdrantPoint } from './QdrantClient';
import { VectorStoreError } from '../VectorStoreError';

/**
 * 向量仓库配置
 */
export interface VectorRepositoryConfig {
  /**
   * 集合名称
   */
  collectionName: string;
  /**
   * 向量维度
   */
  vectorSize: number;
  /**
   * 距离度量方式
   */
  distance: 'Cosine' | 'Euclid' | 'Dot';
}

/**
 * Qdrant向量仓库实现
 */
export class VectorRepository implements IVectorRepository {
  private readonly client: QdrantClient;
  private readonly config: VectorRepositoryConfig;

  /**
   * 创建向量仓库实例
   * @param client Qdrant客户端
   * @param config 仓库配置
   */
  constructor(client: QdrantClient, config: VectorRepositoryConfig) {
    this.client = client;
    this.config = config;
    
    // 初始化集合
    this.initializeCollection();
  }

  /**
   * 初始化集合
   */
  private async initializeCollection(): Promise<void> {
    try {
      const exists = await this.client.collectionExists(this.config.collectionName);
      if (!exists) {
        await this.client.createCollection({
          name: this.config.collectionName,
          vectorSize: this.config.vectorSize,
          distance: this.config.distance,
        });
      }
    } catch (error) {
      throw new VectorStoreError(
        `Failed to initialize vector collection: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 保存向量
   * @param vector 向量数据
   */
  async saveVector(vector: Vector): Promise<void> {
    try {
      const point: QdrantPoint = {
        id: vector.id,
        vector: vector.embedding,
        payload: {
          ...vector.metadata,
          content: vector.content,
        },
      };

      await this.client.insertPoint(this.config.collectionName, point);
    } catch (error) {
      throw new VectorStoreError(
        `Failed to save vector: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 批量保存向量
   * @param vectors 向量数据数组
   */
  async saveVectors(vectors: Vector[]): Promise<void> {
    try {
      const points: QdrantPoint[] = vectors.map((vector) => ({
        id: vector.id,
        vector: vector.embedding,
        payload: {
          ...vector.metadata,
          content: vector.content,
        },
      }));

      await this.client.insertPoints(this.config.collectionName, points);
    } catch (error) {
      throw new VectorStoreError(
        `Failed to save vectors: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 删除向量
   * @param id 向量ID
   */
  async deleteVector(id: string): Promise<void> {
    try {
      await this.client.deletePoint(this.config.collectionName, id);
    } catch (error) {
      throw new VectorStoreError(
        `Failed to delete vector: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 根据ID获取向量
   * @param id 向量ID
   * @returns 向量数据
   */
  async getVectorById(id: string): Promise<Vector | null> {
    try {
      const point = await this.client.getPointById(this.config.collectionName, id);
      if (!point) {
        return null;
      }

      return this.mapToVector(point);
    } catch (error) {
      throw new VectorStoreError(
        `Failed to get vector by id: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 搜索相似向量
   * @param embedding 搜索向量
   * @param limit 返回结果数量
   * @returns 相似向量列表
   */
  async searchSimilar(embedding: number[], limit: number = 5): Promise<Array<{vector: Vector; score: number}>> {
    try {
      const results = await this.client.searchSimilar(
        this.config.collectionName,
        embedding,
        limit
      );

      return results.map((result) => ({
        vector: this.mapToVector(result),
        score: result.score || 0.0
      }));
    } catch (error) {
      throw new VectorStoreError(
        `Failed to search similar vectors: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 将Qdrant点转换为向量实体
   * @param point Qdrant点数据
   * @returns 向量实体
   */
  private mapToVector(point: any): Vector {
    // 提取payload中的content和其他metadata
    const payload = point.payload || {};
    const { content, ...metadata } = payload;

    return new Vector({
      id: String(point.id),
      content: content || '',
      embedding: point.vector,
      metadata,
    });
  }
}

/**
 * 向量仓库工厂
 */
export class VectorRepositoryFactory {
  private readonly client: QdrantClient;
  private readonly config: VectorRepositoryConfig;

  /**
   * 创建向量仓库工厂实例
   * @param client Qdrant客户端
   * @param config 仓库配置
   */
  constructor(client: QdrantClient, config: VectorRepositoryConfig) {
    this.client = client;
    this.config = config;
  }

  /**
   * 创建向量仓库实例
   * @returns 向量仓库实例
   */
  create(): IVectorRepository {
    return new VectorRepository(this.client, this.config);
  }
}