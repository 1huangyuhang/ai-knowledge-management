import { Vector } from '../../../../domain/entities';
import { APICaller } from '../../api/APICaller';

/**
 * Qdrant集合配置
 */
export interface QdrantCollectionConfig {
  /**
   * 集合名称
   */
  name: string;
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
 * Qdrant点数据
 */
export interface QdrantPoint {
  /**
   * 点ID
   */
  id: string;
  /**
   * 向量数据
   */
  vector: number[];
  /**
   * 负载数据
   */
  payload?: Record<string, any>;
}

/**
 * Qdrant搜索结果
 */
export interface QdrantSearchResult {
  /**
   * 点ID
   */
  id: string;
  /**
   * 相似度分数
   */
  score: number;
  /**
   * 向量数据
   */
  vector?: number[];
  /**
   * 负载数据
   */
  payload?: Record<string, any>;
}

/**
 * Qdrant客户端接口
 */
export interface QdrantClient {
  /**
   * 创建集合
   * @param config 集合配置
   */
  createCollection(config: QdrantCollectionConfig): Promise<void>;
  
  /**
   * 删除集合
   * @param collectionName 集合名称
   */
  deleteCollection(collectionName: string): Promise<void>;
  
  /**
   * 检查集合是否存在
   * @param collectionName 集合名称
   * @returns 是否存在
   */
  collectionExists(collectionName: string): Promise<boolean>;
  
  /**
   * 插入点
   * @param collectionName 集合名称
   * @param point 点数据
   */
  insertPoint(collectionName: string, point: QdrantPoint): Promise<void>;
  
  /**
   * 批量插入点
   * @param collectionName 集合名称
   * @param points 点数据数组
   */
  insertPoints(collectionName: string, points: QdrantPoint[]): Promise<void>;
  
  /**
   * 删除点
   * @param collectionName 集合名称
   * @param id 点ID
   */
  deletePoint(collectionName: string, id: string): Promise<void>;
  
  /**
   * 搜索相似点
   * @param collectionName 集合名称
   * @param vector 搜索向量
   * @param limit 返回结果数量
   * @returns 搜索结果
   */
  searchSimilar(collectionName: string, vector: number[], limit: number): Promise<QdrantSearchResult[]>;
  
  /**
   * 根据ID获取点
   * @param collectionName 集合名称
   * @param id 点ID
   * @returns 点数据
   */
  getPointById(collectionName: string, id: string): Promise<QdrantPoint | null>;
}

/**
 * Qdrant客户端配置
 */
export interface QdrantClientConfig {
  /**
   * Qdrant API基础URL
   */
  baseUrl: string;
  /**
   * API密钥
   */
  apiKey?: string;
  /**
   * 默认向量维度
   */
  defaultVectorSize: number;
}

/**
 * Qdrant客户端实现
 */
export class QdrantClientImpl implements QdrantClient {
  private readonly caller: APICaller;
  private readonly config: QdrantClientConfig;

  /**
   * 创建Qdrant客户端实例
   * @param caller API调用器
   * @param config 客户端配置
   */
  constructor(caller: APICaller, config: QdrantClientConfig) {
    this.caller = caller;
    this.config = config;
  }

  /**
   * 创建集合
   * @param config 集合配置
   */
  async createCollection(config: QdrantCollectionConfig): Promise<void> {
    await this.caller.put({
      url: `${this.config.baseUrl}/collections/${config.name}`,
      headers: this.getHeaders(),
      data: {
        vectors: {
          size: config.vectorSize,
          distance: config.distance,
        },
      },
    });
  }

  /**
   * 删除集合
   * @param collectionName 集合名称
   */
  async deleteCollection(collectionName: string): Promise<void> {
    await this.caller.delete({
      url: `${this.config.baseUrl}/collections/${collectionName}`,
      headers: this.getHeaders(),
    });
  }

  /**
   * 检查集合是否存在
   * @param collectionName 集合名称
   * @returns 是否存在
   */
  async collectionExists(collectionName: string): Promise<boolean> {
    try {
      await this.caller.get({
        url: `${this.config.baseUrl}/collections/${collectionName}`,
        headers: this.getHeaders(),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 插入点
   * @param collectionName 集合名称
   * @param point 点数据
   */
  async insertPoint(collectionName: string, point: QdrantPoint): Promise<void> {
    await this.insertPoints(collectionName, [point]);
  }

  /**
   * 批量插入点
   * @param collectionName 集合名称
   * @param points 点数据数组
   */
  async insertPoints(collectionName: string, points: QdrantPoint[]): Promise<void> {
    await this.caller.post({
      url: `${this.config.baseUrl}/collections/${collectionName}/points`,
      headers: this.getHeaders(),
      data: {
        points,
      },
    });
  }

  /**
   * 删除点
   * @param collectionName 集合名称
   * @param id 点ID
   */
  async deletePoint(collectionName: string, id: string): Promise<void> {
    await this.caller.delete({
      url: `${this.config.baseUrl}/collections/${collectionName}/points/${id}`,
      headers: this.getHeaders(),
    });
  }

  /**
   * 搜索相似点
   * @param collectionName 集合名称
   * @param vector 搜索向量
   * @param limit 返回结果数量
   * @returns 搜索结果
   */
  async searchSimilar(collectionName: string, vector: number[], limit: number): Promise<QdrantSearchResult[]> {
    const response = await this.caller.post<{
      result: QdrantSearchResult[];
    }>({
      url: `${this.config.baseUrl}/collections/${collectionName}/points/search`,
      headers: this.getHeaders(),
      data: {
        vector,
        limit,
        with_payload: true,
        with_vector: false,
      },
    });

    return response.data.result;
  }

  /**
   * 根据ID获取点
   * @param collectionName 集合名称
   * @param id 点ID
   * @returns 点数据
   */
  async getPointById(collectionName: string, id: string): Promise<QdrantPoint | null> {
    try {
      const response = await this.caller.get<{
        result: QdrantPoint;
      }>({
        url: `${this.config.baseUrl}/collections/${collectionName}/points/${id}`,
        headers: this.getHeaders(),
      });

      return response.data.result;
    } catch {
      return null;
    }
  }

  /**
   * 获取请求头
   * @returns 请求头
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['api-key'] = this.config.apiKey;
    }

    return headers;
  }
}

/**
 * Qdrant客户端工厂
 */
export class QdrantClientFactory {
  private readonly caller: APICaller;
  private readonly config: QdrantClientConfig;

  /**
   * 创建Qdrant客户端工厂实例
   * @param caller API调用器
   * @param config 客户端配置
   */
  constructor(caller: APICaller, config: QdrantClientConfig) {
    this.caller = caller;
    this.config = config;
  }

  /**
   * 创建Qdrant客户端
   * @returns Qdrant客户端实例
   */
  create(): QdrantClient {
    return new QdrantClientImpl(this.caller, this.config);
  }
}
