/**
 * 向量存储错误类
 */
import { EmbeddingError } from '../../../application/ai/embedding/EmbeddingError';

/**
 * 向量存储错误类，用于处理向量存储相关的错误
 */
export class VectorStoreError extends EmbeddingError {
  /**
   * 创建向量存储错误
   * @param message 错误消息
   * @param cause 原始错误
   */
  constructor(message: string, cause?: Error) {
    super(message, 'VECTOR_STORE_ERROR', cause);
    this.name = 'VectorStoreError';
  }
}
