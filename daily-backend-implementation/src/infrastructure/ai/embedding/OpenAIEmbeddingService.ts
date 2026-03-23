import { EmbeddingService, EmbeddingServiceFactory } from '../../../application/services/llm/embedding/EmbeddingService';
import { Vector } from '../../../domain/entities';
import { APICaller } from '../api/APICaller';
import { EmbeddingError } from '../../../application/ai/embedding/EmbeddingError';

/**
 * OpenAI嵌入服务配置
 */
export interface OpenAIEmbeddingConfig {
  /**
   * OpenAI API密钥
   */
  apiKey: string;
  /**
   * 嵌入模型名称
   */
  model: string;
  /**
   * OpenAI API基础URL
   */
  baseUrl: string;
}

/**
 * OpenAI嵌入服务实现
 */
export class OpenAIEmbeddingService implements EmbeddingService {
  private readonly caller: APICaller;
  private readonly config: OpenAIEmbeddingConfig;

  /**
   * 创建OpenAI嵌入服务实例
   * @param caller API调用器
   * @param config 配置
   */
  constructor(caller: APICaller, config: OpenAIEmbeddingConfig) {
    this.caller = caller;
    this.config = config;
  }

  /**
   * 将单个文本转换为向量
   * @param text 要转换的文本
   * @returns 转换后的向量
   */
  async embedText(text: string): Promise<Vector> {
    const vectors = await this.embedTexts([text]);
    return vectors[0];
  }

  /**
   * 将多个文本转换为向量
   * @param texts 要转换的文本数组
   * @returns 转换后的向量数组
   */
  async embedTexts(texts: string[]): Promise<Vector[]> {
    try {
      const response = await this.caller.post<{
        data: Array<{
          embedding: number[];
          index: number;
        }>;
      }>({
        url: `${this.config.baseUrl}/embeddings`,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: this.config.model,
          input: texts
        }
      });

      return response.data.data.map(item => ({
        vector: item.embedding,
        metadata: {
          index: item.index
        }
      }));
    } catch (error) {
      throw new EmbeddingError(
        `Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'OPENAI_EMBEDDING_FAILED'
      );
    }
  }
}

/**
 * OpenAI嵌入服务工厂实现
 */
export class OpenAIEmbeddingServiceFactory implements EmbeddingServiceFactory {
  private readonly caller: APICaller;
  private readonly config: OpenAIEmbeddingConfig;

  /**
   * 创建OpenAI嵌入服务工厂实例
   * @param caller API调用器
   * @param config 配置
   */
  constructor(caller: APICaller, config: OpenAIEmbeddingConfig) {
    this.caller = caller;
    this.config = config;
  }

  /**
   * 创建嵌入服务实例
   * @returns 嵌入服务实例
   */
  create(): EmbeddingService {
    return new OpenAIEmbeddingService(this.caller, this.config);
  }
}
