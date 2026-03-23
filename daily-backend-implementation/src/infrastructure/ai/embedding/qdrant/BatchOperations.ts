import { Vector } from '../../../../domain/entities';
import { QdrantClient, QdrantPoint } from './QdrantClient';
import { VectorStoreError } from '../VectorStoreError';

/**
 * Qdrant批量操作服务
 */
export class QdrantBatchOperations {
  private readonly client: QdrantClient;
  private readonly collectionName: string;

  /**
   * 创建批量操作服务实例
   * @param client Qdrant客户端
   * @param collectionName 集合名称
   */
  constructor(client: QdrantClient, collectionName: string) {
    this.client = client;
    this.collectionName = collectionName;
  }

  /**
   * 批量插入向量
   * @param vectors 向量数组
   * @param batchSize 每批大小
   */
  public async batchInsert(vectors: Vector[], batchSize: number = 100): Promise<void> {
    if (vectors.length === 0) {
      return;
    }

    try {
      // 将向量转换为Qdrant点格式
      const points: QdrantPoint[] = vectors.map(vector => ({
        id: vector.id,
        vector: vector.embedding,
        payload: {
          ...vector.metadata,
          content: vector.content
        }
      }));

      // 分批次插入
      for (let i = 0; i < points.length; i += batchSize) {
        const batch = points.slice(i, i + batchSize);
        await this.client.insertPoints(this.collectionName, batch);
      }
    } catch (error) {
      throw new VectorStoreError(
        `Failed to batch insert vectors: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 批量删除向量
   * @param ids 向量ID数组
   * @param batchSize 每批大小
   */
  public async batchDelete(ids: string[], batchSize: number = 100): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    try {
      // 分批次删除
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        await Promise.all(
          batch.map(id => this.client.deletePoint(this.collectionName, id))
        );
      }
    } catch (error) {
      throw new VectorStoreError(
        `Failed to batch delete vectors: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 批量更新向量
   * @param vectors 向量数组
   * @param batchSize 每批大小
   */
  public async batchUpdate(vectors: Vector[], batchSize: number = 100): Promise<void> {
    if (vectors.length === 0) {
      return;
    }

    try {
      // 分批次更新
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await Promise.all(
          batch.map(vector => {
            const point: QdrantPoint = {
              id: vector.id,
              vector: vector.embedding,
              payload: {
                ...vector.metadata,
                content: vector.content
              }
            };
            return this.client.updatePoint(this.collectionName, point);
          })
        );
      }
    } catch (error) {
      throw new VectorStoreError(
        `Failed to batch update vectors: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 批量搜索相似向量
   * @param embeddings 搜索向量数组
   * @param limit 每个查询返回结果数量
   * @param batchSize 每批大小
   * @returns 批量搜索结果
   */
  public async batchSearch(
    embeddings: number[][],
    limit: number = 5,
    batchSize: number = 10
  ): Promise<Array<Array<{vector: Vector; score: number}>>> {
    if (embeddings.length === 0) {
      return [];
    }

    try {
      const results: Array<Array<{vector: Vector; score: number}>> = [];

      // 分批次搜索
      for (let i = 0; i < embeddings.length; i += batchSize) {
        const batch = embeddings.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(embedding => this.client.searchSimilar(this.collectionName, embedding, limit))
        );

        // 转换结果格式
        for (const searchResults of batchResults) {
          const mappedResults = searchResults.map(result => {
            const payload = result.payload || {};
            const { content, ...metadata } = payload;

            return {
              vector: new Vector({
                id: String(result.id),
                content: content || '',
                embedding: result.vector,
                metadata
              }),
              score: result.score || 0.0
            };
          });
          results.push(mappedResults);
        }
      }

      return results;
    } catch (error) {
      throw new VectorStoreError(
        `Failed to batch search vectors: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * 批量操作服务工厂
 */
export class QdrantBatchOperationsFactory {
  private readonly client: QdrantClient;

  /**
   * 创建批量操作服务工厂实例
   * @param client Qdrant客户端
   */
  constructor(client: QdrantClient) {
    this.client = client;
  }

  /**
   * 创建批量操作服务实例
   * @param collectionName 集合名称
   * @returns 批量操作服务实例
   */
  create(collectionName: string): QdrantBatchOperations {
    return new QdrantBatchOperations(this.client, collectionName);
  }
}
