import { Vector } from '../../../../domain/entities';

/**
 * 嵌入服务接口
 * 负责将文本转换为向量表示
 */
export interface EmbeddingService {
  /**
   * 将单个文本转换为向量
   * @param text 要转换的文本
   * @returns 转换后的向量
   */
  embedText(text: string): Promise<Vector>;

  /**
   * 将多个文本转换为向量
   * @param texts 要转换的文本数组
   * @returns 转换后的向量数组
   */
  embedTexts(texts: string[]): Promise<Vector[]>;
}

/**
 * 嵌入服务工厂接口
 * 负责创建嵌入服务实例
 */
export interface EmbeddingServiceFactory {
  /**
   * 创建嵌入服务实例
   * @returns 嵌入服务实例
   */
  create(): EmbeddingService;
}
