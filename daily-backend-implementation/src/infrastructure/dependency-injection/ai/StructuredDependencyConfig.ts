import { DependencyContainer } from '../DependencyContainer';
import { StructuredOutputGenerator } from '../../../../application/services/llm/structured/StructuredOutputGenerator';
import { StructuredOutputGeneratorImpl } from '../../../ai/structured/StructuredOutputGeneratorImpl';
import { LLMClient } from '../../../../application/services/llm/LLMClient';
import { LoggerService } from '../../../logging/logger.service';
import { ErrorHandler } from '../../../error/error-handler';

/**
 * 结构化输出相关依赖配置
 */
export class StructuredDependencyConfig {
  /**
   * 配置结构化输出相关依赖
   * @param container 依赖注入容器
   */
  static configure(container: DependencyContainer): void {
    // 注册结构化输出生成器
    container.registerSingleton<StructuredOutputGenerator>('StructuredOutputGenerator', () => {
      const llmClient = container.resolve<LLMClient>('LLMClient');
      const loggerService = container.resolve<LoggerService>('LoggerService');
      const errorHandler = container.resolve<ErrorHandler>('ErrorHandler');
      
      return new StructuredOutputGeneratorImpl(llmClient, loggerService, errorHandler);
    });
  }
}
