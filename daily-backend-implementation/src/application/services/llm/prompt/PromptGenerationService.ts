import { PromptTemplateManager } from './PromptTemplate';
import { LLMClient } from '../LLMClient';
import { LoggerService } from '../../../infrastructure/logging/logger.service';

/**
 * Prompt 生成服务配置
 */
export interface PromptGenerationServiceConfig {
  defaultTemplate?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Prompt 生成服务
 */
export class PromptGenerationService {
  private readonly promptTemplateManager: PromptTemplateManager;
  private readonly llmClient: LLMClient;
  private readonly logger: LoggerService;
  private readonly config: PromptGenerationServiceConfig;

  /**
   * 创建 Prompt 生成服务
   * @param promptTemplateManager Prompt 模板管理器
   * @param llmClient LLM 客户端
   * @param logger 日志系统
   * @param config 配置
   */
  constructor(
    promptTemplateManager: PromptTemplateManager,
    llmClient: LLMClient,
    logger: LoggerService,
    config: PromptGenerationServiceConfig = {}
  ) {
    this.promptTemplateManager = promptTemplateManager;
    this.llmClient = llmClient;
    this.logger = logger;
    this.config = {
      defaultTemplate: 'default',
      temperature: 0.7,
      maxTokens: 1000,
      ...config,
    };
  }

  /**
   * 生成并执行 Prompt
   * @param options 生成选项
   * @returns LLM 响应
   */
  public async generateAndExecutePrompt(options: any): Promise<string> {
    // 生成 Prompt
    const prompt = this.promptTemplateManager.generatePrompt(options);

    // 执行 Prompt
    const response = await this.llmClient.generateText(prompt, {
      temperature: options.temperature || this.config.temperature,
      maxTokens: options.maxTokens || this.config.maxTokens,
    });

    return response;
  }

  /**
   * 生成并流式执行 Prompt
   * @param options 生成选项
   * @returns 文本流
   */
  public async *generateAndStreamPrompt(options: any): AsyncGenerator<string, void, unknown> {
    // 生成 Prompt
    const prompt = this.promptTemplateManager.generatePrompt(options);

    // 流式执行 Prompt
    yield* this.llmClient.streamText(prompt, {
      temperature: options.temperature || this.config.temperature,
      maxTokens: options.maxTokens || this.config.maxTokens,
    });
  }

  /**
   * 获取模板管理器
   * @returns 模板管理器
   */
  public getPromptTemplateManager(): PromptTemplateManager {
    return this.promptTemplateManager;
  }
}