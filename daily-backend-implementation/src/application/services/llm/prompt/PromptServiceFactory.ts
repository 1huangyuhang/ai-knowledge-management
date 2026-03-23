import { PromptTemplateManager } from './PromptTemplate';
import { PromptTemplateManagerImpl } from '../../../infrastructure/ai/prompt/PromptTemplateManagerImpl';
import { LoggerService } from '../../../infrastructure/logging/logger.service';

/**
 * Prompt 服务工厂
 */
export class PromptServiceFactory {
  /**
   * 创建 Prompt 模板管理器
   * @param logger 日志系统
   * @returns Prompt 模板管理器
   */
  public static createPromptTemplateManager(
    logger: LoggerService
  ): PromptTemplateManager {
    return new PromptTemplateManagerImpl(logger);
  }
}