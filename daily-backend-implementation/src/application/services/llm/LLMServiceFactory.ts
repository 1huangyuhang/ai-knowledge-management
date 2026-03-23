import { LLMClient } from './LLMClient';
import { LLMClientImpl } from '../../../infrastructure/ai/LLMClientImpl';
import { LLMClientConfig } from './LLMClient';
import { LoggerService } from '../../../infrastructure/logging/logger.service';
import { ErrorHandler } from '../../../infrastructure/error/error-handler';

/**
 * LLM 服务工厂
 */
export class LLMServiceFactory {
  /**
   * 创建 LLM 客户端
   * @param config LLM 客户端配置
   * @param logger 日志系统
   * @param errorHandler 错误处理器
   * @returns LLM 客户端
   */
  public static createLLMClient(
    config: LLMClientConfig,
    logger: LoggerService,
    errorHandler: ErrorHandler
  ): LLMClient {
    return new LLMClientImpl(config, logger, errorHandler);
  }
}