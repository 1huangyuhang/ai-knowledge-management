# Day 33: 第二阶段 - AI融合期 - Week 5 - 第33天

## 今日目标
实现 LLM API 调用服务，负责与外部 LLM 服务进行通信，处理响应和错误。

## 代码实现

### 1. API 调用服务接口定义

```typescript
// src/infrastructure/ai/api/ApiCallService.ts

import { LLMRequest, LLMResponse } from '../../../../phase-1-foundation/week-4-minimal-system/22-http-api-code.md';

/**
 * API 调用服务接口，负责与外部 LLM 服务进行通信
 */
export interface ApiCallService {
  /**
   * 发送 API 请求
   * @param request LLM 请求对象
   * @returns LLM 响应对象
   */
  sendRequest(request: LLMRequest): Promise<LLMResponse>;
  
  /**
   * 发送带超时的 API 请求
   * @param request LLM 请求对象
   * @param timeoutMs 超时时间（毫秒）
   * @returns LLM 响应对象
   */
  sendRequestWithTimeout(request: LLMRequest, timeoutMs: number): Promise<LLMResponse>;
  
  /**
   * 检查 API 服务状态
   * @returns API 服务是否可用
   */
  checkServiceHealth(): Promise<boolean>;
}
```

### 2. HTTP API 调用服务实现

```typescript
// src/infrastructure/ai/api/HttpApiCallService.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { LLMRequest, LLMResponse } from '../../../../phase-1-foundation/week-4-minimal-system/22-http-api-code.md';
import { ApiCallService } from './ApiCallService';
import { Logger } from '../../../application/logger/Logger';

/**
 * HTTP API 调用服务实现，使用 Axios 发送 HTTP 请求
 */
export class HttpApiCallService implements ApiCallService {
  private axiosInstance: AxiosInstance;
  private logger: Logger;
  
  /**
   * 构造函数
   * @param baseUrl API 基础 URL
   * @param apiKey API 密钥
   * @param logger 日志记录器
   * @param defaultTimeout 默认超时时间（毫秒）
   */
  constructor(
    baseUrl: string,
    apiKey: string,
    logger: Logger,
    private defaultTimeout: number = 30000
  ) {
    this.logger = logger;
    
    // 创建 Axios 实例
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: defaultTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    // 添加请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`Sending request to ${config.url}`, { method: config.method });
        return config;
      },
      (error) => {
        this.logger.error('Request configuration error', { error: error.message });
        return Promise.reject(error);
      }
    );
    
    // 添加响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`Received response from ${response.config.url}`, { status: response.status });
        return response;
      },
      (error) => {
        this.logger.error('Response error', { 
          error: error.message, 
          status: error.response?.status, 
          data: error.response?.data 
        });
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * 发送 API 请求
   * @param request LLM 请求对象
   * @returns LLM 响应对象
   */
  async sendRequest(request: LLMRequest): Promise<LLMResponse> {
    return this.sendRequestWithTimeout(request, this.defaultTimeout);
  }
  
  /**
   * 发送带超时的 API 请求
   * @param request LLM 请求对象
   * @param timeoutMs 超时时间（毫秒）
   * @returns LLM 响应对象
   */
  async sendRequestWithTimeout(request: LLMRequest, timeoutMs: number): Promise<LLMResponse> {
    try {
      const config: AxiosRequestConfig = {
        url: '/chat/completions', // 根据实际 API 端点调整
        method: 'POST',
        data: {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          top_p: request.topP,
          frequency_penalty: request.frequencyPenalty,
          presence_penalty: request.presencePenalty,
          stream: request.stream
        },
        timeout: timeoutMs
      };
      
      const response: AxiosResponse = await this.axiosInstance(config);
      
      return this.mapResponse(response.data);
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  /**
   * 检查 API 服务状态
   * @returns API 服务是否可用
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      this.logger.error('API health check failed', { error: error.message });
      return false;
    }
  }
  
  /**
   * 映射 API 响应到 LLMResponse 对象
   * @param data API 响应数据
   * @returns LLMResponse 对象
   */
  private mapResponse(data: any): LLMResponse {
    return {
      id: data.id,
      object: data.object,
      created: data.created,
      model: data.model,
      choices: data.choices.map((choice: any) => ({
        index: choice.index,
        message: {
          role: choice.message.role,
          content: choice.message.content
        },
        finishReason: choice.finish_reason
      })),
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  }
  
  /**
   * 处理 API 错误
   * @param error 错误对象
   */
  private handleApiError(error: any): void {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        this.logger.error('API request timed out');
      } else if (error.response) {
        this.logger.error('API returned an error', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        this.logger.error('No response received from API');
      }
    } else {
      this.logger.error('Unexpected API error', { error: error.message });
    }
  }
}
```

### 3. API 调用配置

```typescript
// src/infrastructure/ai/api/ApiCallConfig.ts

/**
 * API 调用配置接口
 */
export interface ApiCallConfig {
  /** API 基础 URL */
  baseUrl: string;
  /** API 密钥 */
  apiKey: string;
  /** 默认超时时间（毫秒） */
  defaultTimeout: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试间隔（毫秒） */
  retryInterval: number;
}

/**
 * API 调用配置默认值
 */
export const DEFAULT_API_CALL_CONFIG: ApiCallConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  defaultTimeout: 30000,
  maxRetries: 3,
  retryInterval: 1000
};
```

### 4. API 调用异常定义

```typescript
// src/infrastructure/ai/api/ApiCallError.ts

/**
 * API 调用异常类
 */
export class ApiCallError extends Error {
  /**
   * API 状态码（如果有）
   */
  public statusCode?: number;
  
  /**
   * API 错误数据（如果有）
   */
  public errorData?: any;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param statusCode API 状态码
   * @param errorData API 错误数据
   */
  constructor(message: string, statusCode?: number, errorData?: any) {
    super(message);
    this.name = 'ApiCallError';
    this.statusCode = statusCode;
    this.errorData = errorData;
  }
}

/**
 * API 超时异常类
 */
export class ApiTimeoutError extends ApiCallError {
  /**
   * 构造函数
   * @param message 错误消息
   */
  constructor(message: string = 'API request timed out') {
    super(message);
    this.name = 'ApiTimeoutError';
  }
}

/**
 * API 服务不可用异常类
 */
export class ApiServiceUnavailableError extends ApiCallError {
  /**
   * 构造函数
   * @param message 错误消息
   */
  constructor(message: string = 'API service is unavailable') {
    super(message);
    this.name = 'ApiServiceUnavailableError';
  }
}
```

### 5. API 调用服务工厂

```typescript
// src/infrastructure/ai/api/ApiCallServiceFactory.ts

import { ApiCallService } from './ApiCallService';
import { HttpApiCallService } from './HttpApiCallService';
import { ApiCallConfig, DEFAULT_API_CALL_CONFIG } from './ApiCallConfig';
import { Logger } from '../../../application/logger/Logger';

/**
 * API 调用服务工厂，用于创建 API 调用服务实例
 */
export class ApiCallServiceFactory {
  /**
   * 创建 API 调用服务实例
   * @param config API 调用配置
   * @param logger 日志记录器
   * @returns API 调用服务实例
   */
  static createService(config: Partial<ApiCallConfig>, logger: Logger): ApiCallService {
    const fullConfig = { ...DEFAULT_API_CALL_CONFIG, ...config };
    
    return new HttpApiCallService(
      fullConfig.baseUrl,
      fullConfig.apiKey,
      logger,
      fullConfig.defaultTimeout
    );
  }
}
```

### 6. 集成到依赖注入容器

```typescript
// src/infrastructure/container/DependencyContainer.ts

import { SimpleDependencyContainer } from '../../../../phase-1-foundation/week-4-minimal-system/26-system-integration-code.md';
import { ApiCallService } from '../ai/api/ApiCallService';
import { ApiCallServiceFactory } from '../ai/api/ApiCallServiceFactory';
import { Logger } from '../../application/logger/Logger';

/**
 * 配置 AI API 相关依赖
 * @param container 依赖注入容器
 */
export function configureApiDependencies(container: SimpleDependencyContainer): void {
  // 注册 API 调用服务
  container.registerSingleton(ApiCallService, (c) => {
    const logger = c.resolve<Logger>(Logger);
    const config = {
      apiKey: process.env.OPENAI_API_KEY || ''
    };
    
    return ApiCallServiceFactory.createService(config, logger);
  });
}
```

### 7. 测试代码

```typescript
// test/infrastructure/ai/api/HttpApiCallService.test.ts

import { HttpApiCallService } from '../../../../src/infrastructure/ai/api/HttpApiCallService';
import { LLMRequest } from '../../../../phase-1-foundation/week-4-minimal-system/22-http-api-code.md';
import { Logger } from '../../../../src/application/logger/Logger';

// 模拟 Logger
class MockLogger implements Logger {
  debug(message: string, metadata?: any): void {
    console.log(`DEBUG: ${message}`, metadata);
  }
  
  info(message: string, metadata?: any): void {
    console.log(`INFO: ${message}`, metadata);
  }
  
  warn(message: string, metadata?: any): void {
    console.log(`WARN: ${message}`, metadata);
  }
  
  error(message: string, metadata?: any): void {
    console.log(`ERROR: ${message}`, metadata);
  }
}

describe('HttpApiCallService', () => {
  let apiCallService: HttpApiCallService;
  let logger: Logger;
  
  beforeEach(() => {
    logger = new MockLogger();
    apiCallService = new HttpApiCallService(
      'https://api.openai.com/v1',
      'test-api-key',
      logger
    );
  });
  
  describe('checkServiceHealth', () => {
    it('should return false when API is unreachable', async () => {
      // 由于是测试环境，API 可能无法访问，所以预期返回 false
      const result = await apiCallService.checkServiceHealth();
      expect(result).toBe(false);
    });
  });
  
  describe('sendRequest', () => {
    it('should throw error when API key is invalid', async () => {
      const request: LLMRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
        maxTokens: 100,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stream: false
      };
      
      await expect(apiCallService.sendRequest(request)).rejects.toThrow();
    });
  });
});
```

## 设计说明

1. **接口抽象**：通过 `ApiCallService` 接口抽象 API 调用逻辑，便于后续扩展和替换实现。

2. **HTTP 实现**：基于 Axios 实现 HTTP API 调用，包含请求和响应拦截器，用于日志记录和错误处理。

3. **配置管理**：通过 `ApiCallConfig` 接口和默认配置，便于集中管理 API 调用相关配置。

4. **异常处理**：定义了专门的异常类，如 `ApiCallError`、`ApiTimeoutError` 和 `ApiServiceUnavailableError`，便于区分不同类型的 API 调用错误。

5. **依赖注入**：集成到现有的依赖注入容器中，便于在其他服务中使用。

6. **测试支持**：编写了测试代码，便于验证 API 调用服务的功能。

## 今日总结

今天实现了 LLM API 调用服务，包括：

1. 定义了 `ApiCallService` 接口，抽象了 API 调用逻辑
2. 实现了 `HttpApiCallService`，基于 Axios 进行 HTTP 通信
3. 配置了 API 调用参数和默认值
4. 定义了专门的 API 调用异常类
5. 实现了 API 调用服务工厂
6. 集成到了依赖注入容器中
7. 编写了测试代码

该服务将用于后续与外部 LLM 服务的通信，为认知解析和其他 AI 功能提供基础支持。
