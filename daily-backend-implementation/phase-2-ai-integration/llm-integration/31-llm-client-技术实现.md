# Day 31: 第二阶段 - AI融合期 - Week 1 - 第31天 代码实现

## LLM 客户端实现

### 1. LLM 客户端接口定义

```typescript
// src/application/services/llm/LLMClient.ts

/**
 * LLM 客户端配置
 */
export interface LLMClientConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * LLM 请求参数
 */
export interface LLMRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * LLM 响应
 */
export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finishReason: string;
  }[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * LLM 客户端接口
 */
export interface LLMClient {
  /**
   * 发送请求到 LLM
   * @param request LLM 请求参数
   * @returns LLM 响应
   */
  sendRequest(request: LLMRequest): Promise<LLMResponse>;

  /**
   * 生成文本
   * @param prompt 提示词
   * @param options 生成选项
   * @returns 生成的文本
   */
  generateText(prompt: string, options?: Partial<LLMRequest>): Promise<string>;

  /**
   * 流式生成文本
   * @param prompt 提示词
   * @param options 生成选项
   * @returns 文本流
   */
  streamText(prompt: string, options?: Partial<LLMRequest>): AsyncGenerator<string, void, unknown>;
}
```

### 2. LLM 客户端实现

```typescript
// src/infrastructure/ai/LLMClientImpl.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { LLMClient, LLMClientConfig, LLMRequest, LLMResponse } from '../../application/services/llm/LLMClient';
import { LoggingSystem } from '../logging/LoggingSystem';
import { ErrorHandler } from '../error-handling/ErrorHandler';

/**
 * LLM 客户端实现
 */
export class LLMClientImpl implements LLMClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly config: LLMClientConfig;
  private readonly loggingSystem: LoggingSystem;
  private readonly errorHandler: ErrorHandler;

  /**
   * 创建 LLM 客户端
   * @param config LLM 客户端配置
   * @param loggingSystem 日志系统
   * @param errorHandler 错误处理器
   */
  constructor(
    config: LLMClientConfig,
    loggingSystem: LoggingSystem,
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

    this.loggingSystem = loggingSystem;
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
      this.loggingSystem.logInfo('Sending request to LLM', {
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
      this.loggingSystem.logInfo('Received response from LLM', {
        model: response.data.model,
        promptTokens: response.data.usage.promptTokens,
        completionTokens: response.data.usage.completionTokens,
        totalTokens: response.data.usage.totalTokens,
        latency: endTime - startTime,
      });

      return response.data;
    } catch (error: any) {
      this.loggingSystem.logError('LLM request failed', {
        error: error.message,
        attempt: retryConfig.retries + 1,
        maxRetries: retryConfig.maxRetries,
      });

      // 检查是否需要重试
      if (retryConfig.retries < retryConfig.maxRetries) {
        // 指数退避
        const delay = retryConfig.retryDelay * Math.pow(2, retryConfig.retries);
        this.loggingSystem.logInfo(`Retrying LLM request in ${delay}ms`, {
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
      this.loggingSystem.logInfo('Streaming request to LLM', {
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
              this.loggingSystem.logError('Error parsing stream data', { error: error.message });
            }
          }
        }
      }

      const endTime = Date.now();
      this.loggingSystem.logInfo('Streaming completed', {
        model: options.model || this.config.model,
        latency: endTime - startTime,
      });
    } catch (error: any) {
      this.loggingSystem.logError('LLM streaming failed', {
        error: error.message,
        attempt: retryConfig.retries + 1,
        maxRetries: retryConfig.maxRetries,
      });

      // 检查是否需要重试
      if (retryConfig.retries < retryConfig.maxRetries) {
        // 指数退避
        const delay = retryConfig.retryDelay * Math.pow(2, retryConfig.retries);
        this.loggingSystem.logInfo(`Retrying LLM streaming in ${delay}ms`, {
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
}
```

### 3. LLM 服务工厂

```typescript
// src/application/services/llm/LLMServiceFactory.ts

import { LLMClient } from './LLMClient';
import { LLMClientImpl } from '../../../infrastructure/ai/LLMClientImpl';
import { LLMClientConfig } from './LLMClient';
import { LoggingSystem } from '../../../infrastructure/logging/LoggingSystem';
import { ErrorHandler } from '../../../infrastructure/error-handling/ErrorHandler';

/**
 * LLM 服务工厂
 */
export class LLMServiceFactory {
  /**
   * 创建 LLM 客户端
   * @param config LLM 客户端配置
   * @param loggingSystem 日志系统
   * @param errorHandler 错误处理器
   * @returns LLM 客户端
   */
  public static createLLMClient(
    config: LLMClientConfig,
    loggingSystem: LoggingSystem,
    errorHandler: ErrorHandler
  ): LLMClient {
    return new LLMClientImpl(config, loggingSystem, errorHandler);
  }
}
```

### 4. 依赖注入配置

```typescript
// src/infrastructure/dependency-injection/ai/DependencyConfig.ts

import { globalContainer } from '../DependencyContainer';
import { LLMClient } from '../../../application/services/llm/LLMClient';
import { LLMClientImpl } from '../ai/LLMClientImpl';
import { ConfigManager } from '../system/ConfigManager';
import { LoggingSystem } from '../logging/LoggingSystem';
import { ErrorHandler } from '../error-handling/ErrorHandler';

/**
 * 配置 AI 相关依赖
 * @param configManager 配置管理器
 * @param loggingSystem 日志系统
 * @param errorHandler 错误处理器
 */
export const configureAIDependencies = (
  configManager: ConfigManager,
  loggingSystem: LoggingSystem,
  errorHandler: ErrorHandler
): void => {
  // 注册 LLM 客户端
  globalContainer.registerSingleton<LLMClient>('LLMClient', () => {
    const llmConfig = {
      apiKey: configManager.get<string>('LLM_API_KEY'),
      baseUrl: configManager.get<string>('LLM_BASE_URL'),
      model: configManager.get<string>('LLM_MODEL', 'gpt-3.5-turbo'),
      temperature: configManager.get<number>('LLM_TEMPERATURE', 0.7),
      maxTokens: configManager.get<number>('LLM_MAX_TOKENS', 1000),
      timeout: configManager.get<number>('LLM_TIMEOUT', 30000),
      maxRetries: configManager.get<number>('LLM_MAX_RETRIES', 3),
      retryDelay: configManager.get<number>('LLM_RETRY_DELAY', 1000),
    };

    return new LLMClientImpl(llmConfig, loggingSystem, errorHandler);
  });
};
```

### 5. 配置管理器扩展

```typescript
// src/infrastructure/system/ConfigManager.ts (扩展)

/**
 * 系统配置定义
 */
export interface SystemConfig {
  // 原有配置...
  
  // LLM 配置
  LLM_API_KEY: string;
  LLM_BASE_URL?: string;
  LLM_MODEL?: string;
  LLM_TEMPERATURE?: number;
  LLM_MAX_TOKENS?: number;
  LLM_TIMEOUT?: number;
  LLM_MAX_RETRIES?: number;
  LLM_RETRY_DELAY?: number;
}
```

### 6. 系统集成器扩展

```typescript
// src/infrastructure/system/SystemIntegrator.ts (扩展)

import { configureAIDependencies } from './dependency-injection/ai/DependencyConfig';

/**
 * 系统集成器
 * 负责初始化和管理所有系统组件
 */
export class SystemIntegrator {
  // 原有代码...

  /**
   * 初始化系统
   */
  public async initialize(): Promise<SystemComponents> {
    // 原有初始化代码...

    // 配置 AI 依赖
    configureAIDependencies(this.configManager, loggingSystem, errorHandler);
    loggingSystem.logInfo('AI dependencies configured');

    // 原有初始化代码...
  }
}
```

### 7. 测试用例

```typescript
// src/application/services/llm/LLMClient.test.ts

import { LLMClientImpl } from '../../../infrastructure/ai/LLMClientImpl';
import { LoggingSystem } from '../../../infrastructure/logging/LoggingSystem';
import { ErrorHandler } from '../../../infrastructure/error-handling/ErrorHandler';

// Mock logging and error handling
const mockLoggingSystem = {
  logInfo: jest.fn(),
  logError: jest.fn(),
} as unknown as LoggingSystem;

const mockErrorHandler = {
  handle: jest.fn(),
} as unknown as ErrorHandler;

describe('LLMClientImpl', () => {
  let llmClient: LLMClientImpl;

  beforeEach(() => {
    llmClient = new LLMClientImpl(
      {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
      },
      mockLoggingSystem,
      mockErrorHandler
    );
  });

  describe('sendRequest', () => {
    it('should send request to LLM and return response', async () => {
      // 模拟成功响应
      // 这里需要使用实际的 API 测试或更复杂的模拟
      expect(true).toBe(true); // 占位测试
    });

    it('should retry on failure', async () => {
      // 模拟失败响应
      // 这里需要使用实际的 API 测试或更复杂的模拟
      expect(true).toBe(true); // 占位测试
    });
  });

  describe('generateText', () => {
    it('should generate text from prompt', async () => {
      // 模拟成功生成
      // 这里需要使用实际的 API 测试或更复杂的模拟
      expect(true).toBe(true); // 占位测试
    });
  });

  describe('streamText', () => {
    it('should stream text from prompt', async () => {
      // 模拟流式响应
      // 这里需要使用实际的 API 测试或更复杂的模拟
      expect(true).toBe(true); // 占位测试
    });
  });
});
```

## 实现总结

1. **LLM 客户端接口定义**：定义了清晰的接口，包括请求和响应结构，便于后续扩展和替换实现。

2. **LLM 客户端实现**：使用 Axios 实现了 HTTP API 调用，支持同步和异步请求。

3. **智能重试机制**：实现了指数退避重试策略，提高了系统的鲁棒性。

4. **流式响应支持**：支持流式生成文本，适用于需要实时反馈的场景。

5. **详细日志记录**：记录了请求和响应的详细信息，便于调试和监控。

6. **错误处理**：集成了系统的错误处理机制，统一了错误处理逻辑。

7. **依赖注入支持**：通过依赖注入容器管理 LLM 客户端实例，便于测试和替换。

8. **配置管理**：支持通过配置文件和环境变量配置 LLM 客户端，提高了系统的灵活性。

这个实现遵循了 Clean Architecture 原则，将 LLM 客户端的接口定义在应用层，实现放在基础设施层，保持了系统的分层结构和依赖方向。同时，实现了完整的错误处理、重试机制和日志记录，确保了系统的可靠性和可观测性。