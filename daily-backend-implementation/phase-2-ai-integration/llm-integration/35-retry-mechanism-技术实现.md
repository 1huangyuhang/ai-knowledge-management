# Day 35: 第二阶段 - AI融合期 - Week 5 - 第35天

## 今日目标
实现重试机制功能，用于提高 LLM API 调用的可靠性，处理临时错误和超时情况。

## 代码实现

### 1. 重试策略接口定义

```typescript
// src/application/ai/retry/RetryStrategy.ts

/**
 * 重试策略接口，定义重试逻辑
 */
export interface RetryStrategy {
  /**
   * 获取下一次重试的等待时间（毫秒）
   * @param attempt 当前重试次数（从 1 开始）
   * @returns 等待时间（毫秒）
   */
  getWaitTime(attempt: number): number;
  
  /**
   * 检查是否应该重试
   * @param attempt 当前重试次数（从 1 开始）
   * @param error 错误对象
   * @returns 是否应该重试
   */
  shouldRetry(attempt: number, error: any): boolean;
}
```

### 2. 指数退避重试策略实现

```typescript
// src/application/ai/retry/ExponentialBackoffRetryStrategy.ts

import { RetryStrategy } from './RetryStrategy';
import { ApiCallError, ApiTimeoutError, ApiServiceUnavailableError } from '../../../infrastructure/ai/api/ApiCallError';

/**
 * 指数退避重试策略配置
 */
export interface ExponentialBackoffConfig {
  /** 最大重试次数 */
  maxRetries: number;
  /** 初始重试间隔（毫秒） */
  initialInterval: number;
  /** 退避因子 */
  backoffFactor: number;
  /** 最大等待时间（毫秒） */
  maxWaitTime: number;
}

/**
 * 指数退避重试策略，每次重试等待时间呈指数增长
 */
export class ExponentialBackoffRetryStrategy implements RetryStrategy {
  constructor(private config: ExponentialBackoffConfig) {}
  
  /**
   * 获取下一次重试的等待时间（毫秒）
   * @param attempt 当前重试次数（从 1 开始）
   * @returns 等待时间（毫秒）
   */
  getWaitTime(attempt: number): number {
    // 计算指数退避时间：initialInterval * (backoffFactor ^ (attempt - 1))
    const waitTime = this.config.initialInterval * Math.pow(this.config.backoffFactor, attempt - 1);
    // 限制最大等待时间
    return Math.min(waitTime, this.config.maxWaitTime);
  }
  
  /**
   * 检查是否应该重试
   * @param attempt 当前重试次数（从 1 开始）
   * @param error 错误对象
   * @returns 是否应该重试
   */
  shouldRetry(attempt: number, error: any): boolean {
    // 检查是否超过最大重试次数
    if (attempt > this.config.maxRetries) {
      return false;
    }
    
    // 检查是否是可重试的错误类型
    return this.isRetryableError(error);
  }
  
  /**
   * 检查错误是否可重试
   * @param error 错误对象
   * @returns 是否可重试
   */
  private isRetryableError(error: any): boolean {
    // 可重试的错误类型
    const retryableErrors = [
      ApiTimeoutError,
      ApiServiceUnavailableError,
      // 添加其他可重试的错误类型
    ];
    
    // 检查错误实例类型
    if (retryableErrors.some(errorType => error instanceof errorType)) {
      return true;
    }
    
    // 检查 HTTP 状态码
    if (error instanceof ApiCallError && error.statusCode) {
      // 5xx 错误通常是可重试的
      return error.statusCode >= 500 && error.statusCode < 600;
    }
    
    // 检查错误代码
    if (error.code) {
      const retryableCodes = ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'];
      return retryableCodes.includes(error.code);
    }
    
    return false;
  }
}
```

### 3. 重试服务接口

```typescript
// src/application/ai/retry/RetryService.ts

/**
 * 重试服务接口，提供重试功能
 */
export interface RetryService {
  /**
   * 执行带重试机制的异步操作
   * @param operation 要执行的异步操作
   * @param strategy 重试策略
   * @returns 操作结果
   */
  executeWithRetry<T>(operation: () => Promise<T>, strategy: RetryStrategy): Promise<T>;
}
```

### 4. 重试服务实现

```typescript
// src/application/ai/retry/DefaultRetryService.ts

import { RetryService } from './RetryService';
import { RetryStrategy } from './RetryStrategy';
import { Logger } from '../../logger/Logger';

/**
 * 默认重试服务实现
 */
export class DefaultRetryService implements RetryService {
  constructor(private logger: Logger) {}
  
  /**
   * 执行带重试机制的异步操作
   * @param operation 要执行的异步操作
   * @param strategy 重试策略
   * @returns 操作结果
   */
  async executeWithRetry<T>(operation: () => Promise<T>, strategy: RetryStrategy): Promise<T> {
    let attempt = 0;
    
    while (true) {
      attempt++;
      
      try {
        this.logger.debug(`Executing operation, attempt ${attempt}`);
        const result = await operation();
        this.logger.debug(`Operation succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        this.logger.debug(`Operation failed on attempt ${attempt}`, { error: error instanceof Error ? error.message : 'Unknown error' });
        
        // 检查是否应该重试
        if (!strategy.shouldRetry(attempt, error)) {
          this.logger.debug(`Retries exhausted, giving up after ${attempt} attempts`);
          throw error;
        }
        
        // 计算等待时间
        const waitTime = strategy.getWaitTime(attempt);
        this.logger.debug(`Waiting ${waitTime}ms before next retry`);
        
        // 等待
        await this.wait(waitTime);
      }
    }
  }
  
  /**
   * 等待指定时间
   * @param ms 等待时间（毫秒）
   * @returns Promise
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 5. 重试配置默认值

```typescript
// src/application/ai/retry/RetryDefaults.ts

import { ExponentialBackoffConfig } from './ExponentialBackoffRetryStrategy';

/**
 * 重试配置默认值
 */
export const DEFAULT_RETRY_CONFIG: ExponentialBackoffConfig = {
  maxRetries: 3,
  initialInterval: 1000,
  backoffFactor: 2,
  maxWaitTime: 30000
};
```

### 6. 与 API 调用服务集成

```typescript
// src/infrastructure/ai/api/RetryableApiCallService.ts

import { ApiCallService } from './ApiCallService';
import { LLMRequest, LLMResponse } from '../../../../phase-1-foundation/week-4-minimal-system/22-http-api-code.md';
import { RetryService } from '../../../application/ai/retry/RetryService';
import { RetryStrategy } from '../../../application/ai/retry/RetryStrategy';
import { ExponentialBackoffRetryStrategy } from '../../../application/ai/retry/ExponentialBackoffRetryStrategy';
import { DEFAULT_RETRY_CONFIG } from '../../../application/ai/retry/RetryDefaults';

/**
 * 可重试的 API 调用服务，包装了原有 API 调用服务，添加重试机制
 */
export class RetryableApiCallService implements ApiCallService {
  private retryStrategy: RetryStrategy;
  
  constructor(
    private apiCallService: ApiCallService,
    private retryService: RetryService,
    retryConfig?: any
  ) {
    this.retryStrategy = new ExponentialBackoffRetryStrategy({
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig
    });
  }
  
  /**
   * 发送 API 请求（带重试机制）
   * @param request LLM 请求对象
   * @returns LLM 响应对象
   */
  async sendRequest(request: LLMRequest): Promise<LLMResponse> {
    return this.retryService.executeWithRetry(
      () => this.apiCallService.sendRequest(request),
      this.retryStrategy
    );
  }
  
  /**
   * 发送带超时的 API 请求（带重试机制）
   * @param request LLM 请求对象
   * @param timeoutMs 超时时间（毫秒）
   * @returns LLM 响应对象
   */
  async sendRequestWithTimeout(request: LLMRequest, timeoutMs: number): Promise<LLMResponse> {
    return this.retryService.executeWithRetry(
      () => this.apiCallService.sendRequestWithTimeout(request, timeoutMs),
      this.retryStrategy
    );
  }
  
  /**
   * 检查 API 服务状态
   * @returns API 服务是否可用
   */
  async checkServiceHealth(): Promise<boolean> {
    return this.apiCallService.checkServiceHealth();
  }
}
```

### 7. 集成到依赖注入容器

```typescript
// src/infrastructure/container/DependencyContainer.ts

import { SimpleDependencyContainer } from '../../../../phase-1-foundation/week-4-minimal-system/26-system-integration-code.md';
import { ApiCallService } from '../ai/api/ApiCallService';
import { ApiCallServiceFactory } from '../ai/api/ApiCallServiceFactory';
import { RetryableApiCallService } from '../ai/api/RetryableApiCallService';
import { RetryService } from '../../application/ai/retry/RetryService';
import { DefaultRetryService } from '../../application/ai/retry/DefaultRetryService';
import { Logger } from '../../application/logger/Logger';

/**
 * 配置重试机制相关依赖
 * @param container 依赖注入容器
 */
export function configureRetryDependencies(container: SimpleDependencyContainer): void {
  // 注册重试服务
  container.registerSingleton(RetryService, (c) => {
    const logger = c.resolve<Logger>(Logger);
    return new DefaultRetryService(logger);
  });
  
  // 重新注册 API 调用服务，包装为可重试版本
  container.registerSingleton(ApiCallService, (c) => {
    const logger = c.resolve<Logger>(Logger);
    const retryService = c.resolve<RetryService>(RetryService);
    
    const config = {
      apiKey: process.env.OPENAI_API_KEY || ''
    };
    
    // 创建原始 API 调用服务
    const originalApiCallService = ApiCallServiceFactory.createService(config, logger);
    
    // 包装为可重试版本
    return new RetryableApiCallService(originalApiCallService, retryService);
  });
}
```

### 8. 测试代码

```typescript
// test/application/ai/retry/ExponentialBackoffRetryStrategy.test.ts

import { ExponentialBackoffRetryStrategy } from '../../../../src/application/ai/retry/ExponentialBackoffRetryStrategy';
import { ApiTimeoutError, ApiServiceUnavailableError } from '../../../../src/infrastructure/ai/api/ApiCallError';

describe('ExponentialBackoffRetryStrategy', () => {
  const config = {
    maxRetries: 3,
    initialInterval: 1000,
    backoffFactor: 2,
    maxWaitTime: 30000
  };
  
  let strategy: ExponentialBackoffRetryStrategy;
  
  beforeEach(() => {
    strategy = new ExponentialBackoffRetryStrategy(config);
  });
  
  describe('getWaitTime', () => {
    it('should return initial interval for first attempt', () => {
      expect(strategy.getWaitTime(1)).toBe(1000);
    });
    
    it('should return exponential backoff time for subsequent attempts', () => {
      expect(strategy.getWaitTime(2)).toBe(2000); // 1000 * 2^(2-1)
      expect(strategy.getWaitTime(3)).toBe(4000); // 1000 * 2^(3-1)
      expect(strategy.getWaitTime(4)).toBe(8000); // 1000 * 2^(4-1)
    });
  });
  
  describe('shouldRetry', () => {
    it('should return true for retryable errors within max retries', () => {
      expect(strategy.shouldRetry(1, new ApiTimeoutError())).toBe(true);
      expect(strategy.shouldRetry(2, new ApiServiceUnavailableError())).toBe(true);
      expect(strategy.shouldRetry(3, new ApiTimeoutError())).toBe(true);
    });
    
    it('should return false when max retries exceeded', () => {
      expect(strategy.shouldRetry(4, new ApiTimeoutError())).toBe(false);
    });
  });
});
```

```typescript
// test/application/ai/retry/DefaultRetryService.test.ts

import { DefaultRetryService } from '../../../../src/application/ai/retry/DefaultRetryService';
import { ExponentialBackoffRetryStrategy } from '../../../../src/application/ai/retry/ExponentialBackoffRetryStrategy';
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

describe('DefaultRetryService', () => {
  let retryService: DefaultRetryService;
  let logger: Logger;
  
  beforeEach(() => {
    logger = new MockLogger();
    retryService = new DefaultRetryService(logger);
  });
  
  it('should succeed on first attempt', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    const strategy = new ExponentialBackoffRetryStrategy({
      maxRetries: 3,
      initialInterval: 100,
      backoffFactor: 2,
      maxWaitTime: 1000
    });
    
    const result = await retryService.executeWithRetry(mockOperation, strategy);
    
    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });
  
  it('should retry on failure and succeed', async () => {
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');
    
    const strategy = new ExponentialBackoffRetryStrategy({
      maxRetries: 3,
      initialInterval: 100,
      backoffFactor: 2,
      maxWaitTime: 1000
    });
    
    const result = await retryService.executeWithRetry(mockOperation, strategy);
    
    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(3);
  });
  
  it('should fail after max retries', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));
    
    const strategy = new ExponentialBackoffRetryStrategy({
      maxRetries: 3,
      initialInterval: 100,
      backoffFactor: 2,
      maxWaitTime: 1000
    });
    
    await expect(retryService.executeWithRetry(mockOperation, strategy))
      .rejects.toThrow('Persistent failure');
    
    expect(mockOperation).toHaveBeenCalledTimes(4); // 1 initial attempt + 3 retries
  });
});
```

## 设计说明

1. **接口抽象**：通过 `RetryStrategy` 接口抽象重试逻辑，便于后续扩展和替换实现。

2. **指数退避策略**：实现了指数退避重试策略，每次重试等待时间呈指数增长，避免在短时间内对 API 服务造成过大压力。

3. **可配置性**：重试策略支持灵活配置，包括最大重试次数、初始间隔、退避因子和最大等待时间。

4. **智能重试条件**：只对特定类型的错误进行重试，如超时错误、服务不可用错误和 5xx 错误，避免对无法重试的错误进行无效重试。

5. **集成性**：通过包装原有 API 调用服务，添加重试机制，实现了对原有代码的最小侵入。

6. **依赖注入**：集成到现有的依赖注入容器中，便于在其他服务中使用。

7. **测试支持**：编写了测试代码，便于验证重试策略和重试服务的功能。

## 今日总结

今天实现了重试机制功能，包括：

1. 定义了 `RetryStrategy` 接口，抽象了重试逻辑
2. 实现了 `ExponentialBackoffRetryStrategy`，采用指数退避算法
3. 定义了 `RetryService` 接口，提供重试执行功能
4. 实现了 `DefaultRetryService`，执行带重试机制的异步操作
5. 配置了默认重试参数
6. 实现了 `RetryableApiCallService`，将重试机制集成到 API 调用服务中
7. 更新了依赖注入配置，使用可重试的 API 调用服务
8. 编写了测试代码

该重试机制将提高 LLM API 调用的可靠性，特别是在网络不稳定或 API 服务暂时不可用的情况下，能够自动重试请求，提高系统的容错能力。

至此，第二阶段第 5 周（Day 31-35）的 LLM 集成工作已完成，包括：

1. LLM 客户端实现
2. Prompt 设计系统
3. API 调用服务
4. 结构化输出处理
5. 重试机制

这些功能将为后续的 AI 融合工作提供基础支持，包括认知解析、概念提取、关系推断等。
