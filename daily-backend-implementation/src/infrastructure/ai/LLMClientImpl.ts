import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LLMClient, LLMClientConfig, LLMRequest, LLMResponse } from '../../application/services/llm/LLMClient';
import { LoggerService } from '../logging/logger.service';
import { ErrorHandler } from '../error/error-handler';

/**
 * LLM 客户端实现
 */
export class LLMClientImpl implements LLMClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly config: LLMClientConfig;
  private readonly logger: LoggerService;
  private readonly errorHandler: ErrorHandler;

  /**
   * 创建 LLM 客户端
   * @param config LLM 客户端配置
   * @param logger 日志系统
   * @param errorHandler 错误处理器
   */
  constructor(
    config: LLMClientConfig,
    logger: LoggerService,
    errorHandler: ErrorHandler
  ) {
    this.config = {
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    this.logger = logger;
    this.errorHandler = errorHandler;

    // 创建 Axios 实例
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });
  }

  /**
   * 发送请求到 LLM
   * @param request LLM 请求参数
   * @returns LLM 响应
   */
  public async sendRequest(request: LLMRequest): Promise<LLMResponse> {
    const retryConfig = {
      retries: 0,
      maxRetries: this.config.maxRetries || 3,
      retryDelay: this.config.retryDelay || 1000,
    };

    return this.sendRequestWithRetry(request, retryConfig);
  }

  /**
   * 带重试机制的请求发送
   * @param request LLM 请求参数
   * @param retryConfig 重试配置
   * @returns LLM 响应
   */
  private async sendRequestWithRetry(
    request: LLMRequest,
    retryConfig: { retries: number; maxRetries: number; retryDelay: number }
  ): Promise<LLMResponse> {
    try {
      this.logger.info('Sending request to LLM', {
        model: request.model || this.config.model,
        promptLength: request.prompt.length,
        attempt: retryConfig.retries + 1,
      });

      const startTime = Date.now();
      const response: AxiosResponse<LLMResponse> = await this.axiosInstance.post(
        '/chat/completions',
        {
          model: request.model || this.config.model,
          messages: [
            { role: 'user', content: request.prompt },
          ],
          temperature: request.temperature || this.config.temperature,
          max_tokens: request.maxTokens || this.config.maxTokens,
          stop: request.stop,
          top_p: request.topP,
          frequency_penalty: request.frequencyPenalty,
          presence_penalty: request.presencePenalty,
        }
      );

      const endTime = Date.now();
      this.logger.info('Received response from LLM', {
        model: response.data.model,
        promptTokens: response.data.usage.promptTokens,
        completionTokens: response.data.usage.completionTokens,
        totalTokens: response.data.usage.totalTokens,
        latency: endTime - startTime,
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('LLM request failed', {
        error: error.message,
        attempt: retryConfig.retries + 1,
        maxRetries: retryConfig.maxRetries,
      });

      // 检查是否需要重试
      if (retryConfig.retries < retryConfig.maxRetries) {
        // 指数退避
        const delay = retryConfig.retryDelay * Math.pow(2, retryConfig.retries);
        this.logger.info(`Retrying LLM request in ${delay}ms`, {
          attempt: retryConfig.retries + 1,
          maxRetries: retryConfig.maxRetries,
        });

        await this.delay(delay);
        return this.sendRequestWithRetry(request, {
          ...retryConfig,
          retries: retryConfig.retries + 1,
        });
      }

      // 重试次数耗尽，抛出错误
      this.errorHandler.handle(error, { context: 'llm-request' });
      throw new Error(`LLM request failed after ${retryConfig.maxRetries} attempts: ${error.message}`);
    }
  }

  /**
   * 生成文本
   * @param prompt 提示词
   * @param options 生成选项
   * @returns 生成的文本
   */
  public async generateText(prompt: string, options?: Partial<LLMRequest>): Promise<string> {
    const response = await this.sendRequest({
      prompt,
      ...options,
    });

    return response.choices[0]?.message.content || '';
  }

  /**
   * 流式生成文本
   * @param prompt 提示词
   * @param options 生成选项
   * @returns 文本流
   */
  public async *streamText(prompt: string, options?: Partial<LLMRequest>): AsyncGenerator<string, void, unknown> {
    const retryConfig = {
      retries: 0,
      maxRetries: this.config.maxRetries || 3,
      retryDelay: this.config.retryDelay || 1000,
    };

    yield* this.streamTextWithRetry(prompt, options || {}, retryConfig);
  }

  /**
   * 带重试机制的流式文本生成
   * @param prompt 提示词
   * @param options 生成选项
   * @param retryConfig 重试配置
   * @returns 文本流
   */
  private async *streamTextWithRetry(
    prompt: string,
    options: Partial<LLMRequest>,
    retryConfig: { retries: number; maxRetries: number; retryDelay: number }
  ): AsyncGenerator<string, void, unknown> {
    try {
      this.logger.info('Streaming request to LLM', {
        model: options.model || this.config.model,
        promptLength: prompt.length,
        attempt: retryConfig.retries + 1,
      });

      const startTime = Date.now();
      const response = await this.axiosInstance.post(
        '/chat/completions',
        {
          model: options.model || this.config.model,
          messages: [
            { role: 'user', content: prompt },
          ],
          temperature: options.temperature || this.config.temperature,
          max_tokens: options.maxTokens || this.config.maxTokens,
          stop: options.stop,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      // 处理流式响应
      const stream = response.data;
      let buffer = '';

      for await (const chunk of stream) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }
            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (error) {
              this.logger.error('Error parsing stream data', { error: error.message });
            }
          }
        }
      }

      const endTime = Date.now();
      this.logger.info('Streaming completed', {
        model: options.model || this.config.model,
        latency: endTime - startTime,
      });
    } catch (error: any) {
      this.logger.error('LLM streaming failed', {
        error: error.message,
        attempt: retryConfig.retries + 1,
        maxRetries: retryConfig.maxRetries,
      });

      // 检查是否需要重试
      if (retryConfig.retries < retryConfig.maxRetries) {
        // 指数退避
        const delay = retryConfig.retryDelay * Math.pow(2, retryConfig.retries);
        this.logger.info(`Retrying LLM streaming in ${delay}ms`, {
          attempt: retryConfig.retries + 1,
          maxRetries: retryConfig.maxRetries,
        });

        await this.delay(delay);
        yield* this.streamTextWithRetry(prompt, options, {
          ...retryConfig,
          retries: retryConfig.retries + 1,
        });
      } else {
        // 重试次数耗尽，抛出错误
        this.errorHandler.handle(error, { context: 'llm-streaming' });
        throw new Error(`LLM streaming failed after ${retryConfig.maxRetries} attempts: ${error.message}`);
      }
    }
  }

  /**
   * 延迟函数
   * @param ms 延迟毫秒数
   * @returns Promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取当前使用的模型
   * @returns 模型名称
   */
  getModel(): string {
    return this.config.model;
  }

  /**
   * 获取当前配置
   * @returns LLM配置
   */
  getConfig(): LLMClientConfig {
    return this.config;
  }

  /**
   * 健康检查
   * @returns 是否健康
   */
  healthCheck(): boolean {
    return !!this.config.apiKey && !!this.config.baseUrl && !!this.config.model;
  }
}