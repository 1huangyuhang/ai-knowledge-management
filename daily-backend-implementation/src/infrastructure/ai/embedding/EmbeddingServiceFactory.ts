import { EmbeddingService } from '../../../application/ai/embedding/EmbeddingService';
import { OpenAIEmbeddingService, OpenAIEmbeddingConfig, DEFAULT_OPENAI_EMBEDDING_CONFIG } from './OpenAIEmbeddingService';
import { LoggerService } from '../../logging/logger.service';

/**
 * Embedding 服务类型
 */
export enum EmbeddingServiceType {
  OpenAI = 'openai',
  Local = 'local'
}

/**
 * Embedding 服务工厂，用于创建 Embedding 服务实例
 */
export class EmbeddingServiceFactory {
  /**
   * 创建 Embedding 服务实例
   * @param type 服务类型
   * @param config 服务配置
   * @param logger 日志记录器
   * @returns Embedding 服务实例
   */
  static createService(
    type: EmbeddingServiceType,
    config: Partial<OpenAIEmbeddingConfig>,
    logger: LoggerService
  ): EmbeddingService {
    const fullConfig = { ...DEFAULT_OPENAI_EMBEDDING_CONFIG, ...config };
    
    switch (type) {
      case EmbeddingServiceType.OpenAI:
        return new OpenAIEmbeddingService(fullConfig, logger);
      case EmbeddingServiceType.Local:
        // 本地 Embedding 服务实现（预留）
        logger.warn('Local Embedding service not implemented yet, falling back to OpenAI');
        return new OpenAIEmbeddingService(fullConfig, logger);
      default:
        logger.warn(`Unknown Embedding service type: ${type}, falling back to OpenAI`);
        return new OpenAIEmbeddingService(fullConfig, logger);
    }
  }
}
