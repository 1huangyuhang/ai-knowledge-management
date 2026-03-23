import { DependencyContainer } from '../DependencyContainer';
import { LLMClientImpl } from '../../../ai/LLMClientImpl';
import { ConfigManager } from '../../../system/ConfigManager';
import { LoggerService } from '../../../logging/logger.service';
import { PromptDependencyConfig } from './PromptDependencyConfig';
import { APIDependencyConfig } from './APIDependencyConfig';
import { StructuredDependencyConfig } from './StructuredDependencyConfig';
import { RetryDependencyConfig } from './RetryDependencyConfig';
import { EmbeddingDependencyConfig } from './EmbeddingDependencyConfig';

/**
 * AI相关依赖配置
 * 负责将AI相关的服务注册到依赖注入容器中
 */
export class AiDependencyConfig {
  /**
   * 配置AI相关依赖
   * @param container 依赖注入容器
   */
  static configure(container: DependencyContainer): void {
    // 注册LLM客户端
    container.registerSingleton('LLMClient', () => {
      const configManager = container.resolve<ConfigManager>('ConfigManager');
      const loggerService = container.resolve<LoggerService>('LoggerService');
      const config = configManager.getLLMConfig();
      
      return new LLMClientImpl(config, loggerService);
    });

    // 配置API调用相关依赖
    APIDependencyConfig.configure(container);

    // 配置Prompt相关依赖
    PromptDependencyConfig.configure(container);

    // 配置结构化输出相关依赖
    StructuredDependencyConfig.configure(container);

    // 配置重试机制相关依赖
    RetryDependencyConfig.configure(container);

    // 配置Embedding相关依赖
    EmbeddingDependencyConfig.configure(container);
  }
}
