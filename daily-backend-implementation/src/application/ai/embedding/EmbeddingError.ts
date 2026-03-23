import { DomainError } from '../../../domain/errors/domain-error';

/**
 * 嵌入服务错误基类
 */
export class EmbeddingError extends DomainError {
  /**
   * 创建嵌入服务错误
   * @param message 错误消息
   * @param code 错误代码
   * @param cause 原始错误
   */
  constructor(message: string, code: string, cause?: Error) {
    super(message, code, cause);
    this.name = 'EmbeddingError';
  }
}

/**
 * 嵌入服务配置错误
 */
export class EmbeddingConfigError extends EmbeddingError {
  /**
   * 创建嵌入服务配置错误
   * @param message 错误消息
   * @param cause 原始错误
   */
  constructor(message: string, cause?: Error) {
    super(message, 'EMBEDDING_CONFIG_ERROR', cause);
    this.name = 'EmbeddingConfigError';
  }
}

/**
 * 嵌入服务API调用错误
 */
export class EmbeddingAPICallError extends EmbeddingError {
  /**
   * 创建嵌入服务API调用错误
   * @param message 错误消息
   * @param cause 原始错误
   */
  constructor(message: string, cause?: Error) {
    super(message, 'EMBEDDING_API_CALL_ERROR', cause);
    this.name = 'EmbeddingAPICallError';
  }
}

/**
 * 嵌入服务文本处理错误
 */
export class EmbeddingTextProcessingError extends EmbeddingError {
  /**
   * 创建嵌入服务文本处理错误
   * @param message 错误消息
   * @param cause 原始错误
   */
  constructor(message: string, cause?: Error) {
    super(message, 'EMBEDDING_TEXT_PROCESSING_ERROR', cause);
    this.name = 'EmbeddingTextProcessingError';
  }
}
