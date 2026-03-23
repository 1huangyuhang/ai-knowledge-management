/**
 * Embedding 向量接口
 */
export interface EmbeddingVector {
  /** 向量数据 */
  vector: number[];
  /** 向量维度 */
  dimension: number;
  /** 生成时间戳 */
  createdAt: number;
}

/**
 * Embedding 服务接口，负责将文本转换为向量表示
 */
export interface EmbeddingService {
  /**
   * 生成单个文本的 Embedding 向量
   * @param text 要生成向量的文本
   * @param model 要使用的 Embedding 模型名称
   * @returns Embedding 向量
   */
  generateEmbedding(text: string, model?: string): Promise<EmbeddingVector>;
  
  /**
   * 批量生成文本的 Embedding 向量
   * @param texts 要生成向量的文本数组
   * @param model 要使用的 Embedding 模型名称
   * @returns Embedding 向量数组
   */
  generateEmbeddings(texts: string[], model?: string): Promise<EmbeddingVector[]>;
  
  /**
   * 获取模型信息
   * @param model 模型名称
   * @returns 模型信息
   */
  getModelInfo(model: string): Promise<EmbeddingModelInfo>;
  
  /**
   * 列出可用的 Embedding 模型
   * @returns 可用模型列表
   */
  listModels(): Promise<string[]>;
}

/**
 * Embedding 模型信息接口
 */
export interface EmbeddingModelInfo {
  /** 模型名称 */
  name: string;
  /** 向量维度 */
  dimension: number;
  /** 模型描述 */
  description: string;
  /** 模型是否可用 */
  available: boolean;
}