import { PromptTemplateImpl } from '../../ai/prompt/PromptTemplateImpl';
import { PromptTemplateManagerImpl } from '../../ai/prompt/PromptTemplateManagerImpl';
import { PromptGenerationService } from '../../../application/services/llm/prompt/PromptGenerationService';
import { Container } from '../Container';
import { PromptServiceFactory } from '../../../application/services/llm/prompt/PromptServiceFactory';

/**
 * Prompt 相关依赖配置
 */
export class PromptDependencyConfig {
  /**
   * 配置 Prompt 相关依赖
   * @param container 依赖注入容器
   */
  public static configure(container: Container): void {
    // 注册 Prompt 模板实现
    container.register('PromptTemplate', () => new PromptTemplateImpl());

    // 注册 Prompt 模板管理器
    container.register('PromptTemplateManager', () => {
      const logger = container.get('LoggerService');
      return new PromptTemplateManagerImpl(logger);
    });

    // 注册 Prompt 服务工厂
    container.register('PromptServiceFactory', () => {
      const logger = container.get('LoggerService');
      return new PromptServiceFactory(logger);
    });

    // 注册 Prompt 生成服务
    container.register('PromptGenerationService', () => {
      const promptTemplateManager = container.get('PromptTemplateManager');
      const llmClient = container.get('LLMClient');
      const logger = container.get('LoggerService');
      
      return new PromptGenerationService(promptTemplateManager, llmClient, logger);
    });
  }
}
