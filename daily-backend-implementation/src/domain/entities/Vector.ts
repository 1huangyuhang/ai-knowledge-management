/**
 * 向量元数据
 */
export interface VectorMetadata {
  /**
   * 元数据键值对
   */
  [key: string]: any;
}

/**
 * 向量创建参数
 */
export interface VectorCreateParams {
  /**
   * 向量ID
   */
  id: string;
  /**
   * 向量对应的文本内容
   */
  content: string;
  /**
   * 向量嵌入数据
   */
  embedding: number[];
  /**
   * 向量元数据
   */
  metadata?: VectorMetadata;
}

/**
 * 向量实体
 */
export class Vector {
  /**
   * 向量ID
   */
  public readonly id: string;
  /**
   * 向量对应的文本内容
   */
  public readonly content: string;
  /**
   * 向量嵌入数据
   */
  public readonly embedding: number[];
  /**
   * 向量元数据
   */
  public readonly metadata: VectorMetadata;

  /**
   * 创建向量实例
   * @param params 向量创建参数
   */
  constructor(params: VectorCreateParams) {
    this.id = params.id;
    this.content = params.content;
    this.embedding = params.embedding;
    this.metadata = params.metadata || {};
  }
}

/**
 * 向量仓库接口
 */
export interface VectorRepository {
  /**
   * 保存向量
   * @param vector 向量数据
   */
  saveVector(vector: Vector): Promise<void>;

  /**
   * 批量保存向量
   * @param vectors 向量数据数组
   */
  saveVectors(vectors: Vector[]): Promise<void>;

  /**
   * 删除向量
   * @param id 向量ID
   */
  deleteVector(id: string): Promise<void>;

  /**
   * 根据ID获取向量
   * @param id 向量ID
   * @returns 向量数据
   */
  getVectorById(id: string): Promise<Vector | null>;

  /**
   * 搜索相似向量
   * @param embedding 搜索向量
   * @param limit 返回结果数量
   * @returns 相似向量列表，包含相似度分数
   */
  searchSimilar(embedding: number[], limit?: number): Promise<Array<{vector: Vector; score: number}>>;
}