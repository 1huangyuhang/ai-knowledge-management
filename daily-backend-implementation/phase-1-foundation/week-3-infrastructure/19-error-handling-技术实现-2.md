# Day 19: 错误处理模块 - 代码实现（第二部分）

## Express错误中间件

```typescript
import { Request, Response, NextFunction } from 'express';
import { CustomError } from './custom-error';
import { ErrorHandler } from './error-handler';

/**
 * 创建Express错误中间件
 * @param errorHandler 错误处理器
 */
export function createErrorMiddleware(errorHandler: ErrorHandler) {
  return (error: Error, req: Request, res: Response, next: NextFunction): void => {
    // 处理错误
    errorHandler.handle(error, {
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params,
      },
      user: req.user,
      timestamp: new Date().toISOString(),
    });
    
    // 获取客户端响应
    const response = errorHandler.getClientResponse(error);
    
    // 获取HTTP状态码
    const statusCode = error instanceof CustomError 
      ? error.statusCode 
      : 500;
    
    // 返回错误响应
    res.status(statusCode).json(response);
  };
}
```

## 全局错误捕获

```typescript
import { ErrorHandler } from './error-handler';

/**
 * 设置全局错误捕获
 * @param errorHandler 错误处理器
 */
export function setupGlobalErrorHandling(errorHandler: ErrorHandler): void {
  // 捕获未处理的Promise拒绝
  process.on('unhandledRejection', (reason: any) => {
    errorHandler.handle(reason instanceof Error ? reason : new Error(String(reason)));
  });
  
  // 捕获未捕获的异常
  process.on('uncaughtException', (error: Error) => {
    errorHandler.handle(error);
    // 对于未捕获的异常，退出进程
    process.exit(1);
  });
}
```

## 重试机制

```typescript
/**
 * 重试选项
 */
export interface RetryOptions {
  /** 最大重试次数 */
  maxAttempts: number;
  /** 初始重试延迟（毫秒） */
  initialDelay: number;
  /** 重试延迟乘数 */
  delayMultiplier: number;
  /** 最大重试延迟（毫秒） */
  maxDelay?: number;
  /** 重试条件 */
  retryCondition?: (error: Error) => boolean;
}

/**
 * 重试装饰器
 * @param options 重试选项
 */
export function retry(options: RetryOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): void {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]): Promise<any> {
      let lastError: Error;
      
      for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          
          // 检查是否应该重试
          const shouldRetry = options.retryCondition 
            ? options.retryCondition(lastError)
            : true;
          
          if (!shouldRetry || attempt === options.maxAttempts - 1) {
            throw lastError;
          }
          
          // 计算重试延迟
          const delay = Math.min(
            options.initialDelay * Math.pow(options.delayMultiplier, attempt),
            options.maxDelay || Infinity
          );
          
          // 等待重试延迟
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw lastError;
    };
  };
}
```

## 熔断机制

```typescript
/**
 * 熔断状态
 */
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

/**
 * 熔断选项
 */
export interface CircuitBreakerOptions {
  /** 失败阈值 */
  failureThreshold: number;
  /** 重置时间窗口（毫秒） */
  resetTimeout: number;
  /** 半开状态下的测试请求数 */
  halfOpenTestCount: number;
}

/**
 * 熔断装饰器
 * @param options 熔断选项
 */
export function circuitBreaker(options: CircuitBreakerOptions) {
  let state = CircuitState.CLOSED;
  let failureCount = 0;
  let lastFailureTime = Date.now();
  let halfOpenSuccessCount = 0;
  
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): void {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]): Promise<any> {
      // 检查熔断状态
      this.checkCircuitState();
      
      if (state === CircuitState.OPEN) {
        throw new SystemError(
          'Service unavailable due to circuit breaker',
          ErrorCode.SERVICE_UNAVAILABLE
        );
      }
      
      try {
        const result = await originalMethod.apply(this, args);
        
        // 处理成功情况
        if (state === CircuitState.HALF_OPEN) {
          halfOpenSuccessCount++;
          
          if (halfOpenSuccessCount >= options.halfOpenTestCount) {
            // 重置熔断状态
            state = CircuitState.CLOSED;
            failureCount = 0;
            halfOpenSuccessCount = 0;
          }
        }
        
        return result;
      } catch (error) {
        // 处理失败情况
        failureCount++;
        lastFailureTime = Date.now();
        
        if (state === CircuitState.HALF_OPEN) {
          // 半开状态下的任何失败都会重新打开熔断
          state = CircuitState.OPEN;
          halfOpenSuccessCount = 0;
        } else if (state === CircuitState.CLOSED && failureCount >= options.failureThreshold) {
          // 关闭状态下达到失败阈值，打开熔断
          state = CircuitState.OPEN;
        }
        
        throw error;
      }
    };
    
    // 添加检查熔断状态的方法
    target.checkCircuitState = function (): void {
      if (state === CircuitState.OPEN) {
        const timeSinceLastFailure = Date.now() - lastFailureTime;
        
        if (timeSinceLastFailure >= options.resetTimeout) {
          // 重置超时，进入半开状态
          state = CircuitState.HALF_OPEN;
          halfOpenSuccessCount = 0;
        }
      }
    };
  };
}
```

## 错误统计信息接口

```typescript
/**
 * 错误统计信息
 */
export interface ErrorStats {
  /** 总错误数 */
  total: number;
  /** 按错误类型统计 */
  byType: Record<string, number>;
  /** 按错误码统计 */
  byCode: Record<string, number>;
  /** 最近的错误列表 */
  recentErrors: Array<{
    error: CustomError;
    timestamp: Date;
  }>;
  /** 错误趋势（按分钟） */
  trends: Array<{
    timestamp: Date;
    count: number;
  }>;
}
```

## 错误统计器

```typescript
/**
 * 错误统计器
 */
export class ErrorStatsCollector {
  private readonly stats: ErrorStats = {
    total: 0,
    byType: {},
    byCode: {},
    recentErrors: [],
    trends: [],
  };
  
  private readonly maxRecentErrors = 100;
  private readonly maxTrendPoints = 60; // 60分钟
  private lastTrendUpdate = Date.now();

  /**
   * 记录错误
   * @param error 自定义错误
   */
  public recordError(error: CustomError): void {
    // 更新总错误数
    this.stats.total++;
    
    // 更新按类型统计
    this.stats.byType[error.type] = (this.stats.byType[error.type] || 0) + 1;
    
    // 更新按错误码统计
    this.stats.byCode[error.code] = (this.stats.byCode[error.code] || 0) + 1;
    
    // 添加到最近错误列表
    this.stats.recentErrors.unshift({
      error,
      timestamp: new Date(),
    });
    
    // 限制最近错误列表长度
    if (this.stats.recentErrors.length > this.maxRecentErrors) {
      this.stats.recentErrors.pop();
    }
    
    // 更新错误趋势
    this.updateTrends();
  }
  
  /**
   * 更新错误趋势
   */
  private updateTrends(): void {
    const now = Date.now();
    const minute = 60 * 1000;
    
    // 检查是否需要添加新的趋势点
    if (now - this.lastTrendUpdate >= minute) {
      this.stats.trends.push({
        timestamp: new Date(this.lastTrendUpdate),
        count: 1,
      });
      
      this.lastTrendUpdate = now;
      
      // 限制趋势点数量
      if (this.stats.trends.length > this.maxTrendPoints) {
        this.stats.trends.shift();
      }
    } else {
      // 更新当前趋势点的计数
      const lastTrend = this.stats.trends[this.stats.trends.length - 1];
      if (lastTrend) {
        lastTrend.count++;
      }
    }
  }
  
  /**
   * 获取错误统计信息
   */
  public getStats(): ErrorStats {
    return { ...this.stats };
  }
  
  /**
   * 重置错误统计
   */
  public reset(): void {
    this.stats.total = 0;
    this.stats.byType = {};
    this.stats.byCode = {};
    this.stats.recentErrors = [];
    this.stats.trends = [];
    this.lastTrendUpdate = Date.now();
  }
}
```

## 错误处理模块导出

```typescript
// src/infrastructure/error-handling/index.ts

export * from './custom-error';
export * from './error-handler';
export * from './error-middleware';
export * from './error-recovery';
export * from './error-monitoring';

/**
 * 创建错误处理模块实例
 */
export function createErrorHandlingModule() {
  const errorHandler = new ErrorHandler();
  const errorMiddleware = createErrorMiddleware(errorHandler);
  const errorStatsCollector = new ErrorStatsCollector();
  
  // 设置全局错误处理
  setupGlobalErrorHandling(errorHandler);
  
  return {
    errorHandler,
    errorMiddleware,
    errorStatsCollector,
  };
}
```

## 与Express应用集成

```typescript
// src/application/app.ts
import express from 'express';
import { createErrorHandlingModule } from '../infrastructure/error-handling';

const app = express();
const { errorMiddleware } = createErrorHandlingModule();

// 注册路由
// ...

// 注册错误中间件（必须在所有路由之后）
app.use(errorMiddleware);

// 启动服务器
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

## 单元测试

```typescript
// src/infrastructure/error-handling/tests/custom-error.test.ts
import { CustomError, SystemError, DatabaseError, ErrorType, ErrorCode } from '../custom-error';

describe('CustomError', () => {
  test('should create a custom error with correct properties', () => {
    const error = new CustomError(
      'Test error',
      ErrorType.SYSTEM,
      ErrorCode.SYSTEM_ERROR,
      500,
      { test: 'context' }
    );
    
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('CustomError');
    expect(error.message).toBe('Test error');
    expect(error.type).toBe(ErrorType.SYSTEM);
    expect(error.code).toBe(ErrorCode.SYSTEM_ERROR);
    expect(error.statusCode).toBe(500);
    expect(error.context).toEqual({ test: 'context' });
  });
  
  test('should create a SystemError with correct properties', () => {
    const error = new SystemError('System error');
    
    expect(error).toBeInstanceOf(CustomError);
    expect(error.name).toBe('SystemError');
    expect(error.type).toBe(ErrorType.SYSTEM);
    expect(error.code).toBe(ErrorCode.SYSTEM_ERROR);
    expect(error.statusCode).toBe(500);
  });
  
  test('should create a DatabaseError with correct properties', () => {
    const error = new DatabaseError('Database error');
    
    expect(error).toBeInstanceOf(CustomError);
    expect(error.name).toBe('DatabaseError');
    expect(error.type).toBe(ErrorType.DATABASE);
    expect(error.code).toBe(ErrorCode.DATABASE_ERROR);
    expect(error.statusCode).toBe(500);
  });
  
  test('should format error to JSON correctly', () => {
    const error = new SystemError('Test error', ErrorCode.INTERNAL_SERVER_ERROR, { test: 'context' });
    const json = error.toJSON();
    
    expect(json).toEqual({
      name: 'SystemError',
      message: 'Test error',
      type: ErrorType.SYSTEM,
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      statusCode: 500,
      context: { test: 'context' },
      stack: expect.any(String),
    });
  });
});
```

## 集成测试

```typescript
// src/infrastructure/error-handling/tests/error-middleware.test.ts
import request from 'supertest';
import express from 'express';
import { createErrorHandlingModule } from '../index';
import { SystemError, ErrorCode } from '../custom-error';

describe('Error Middleware', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    const { errorMiddleware } = createErrorHandlingModule();
    
    // 测试路由，抛出错误
    app.get('/error', (req, res, next) => {
      next(new SystemError('Test error', ErrorCode.INTERNAL_SERVER_ERROR));
    });
    
    // 测试路由，抛出普通错误
    app.get('/regular-error', (req, res, next) => {
      next(new Error('Regular error'));
    });
    
    // 注册错误中间件
    app.use(errorMiddleware);
  });
  
  test('should handle custom errors correctly', async () => {
    const response = await request(app).get('/error');
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        message: 'Test error',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        type: 'system',
      },
    });
  });
  
  test('should handle regular errors correctly', async () => {
    const response = await request(app).get('/regular-error');
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        message: 'Regular error',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        type: 'system',
      },
    });
  });
});
```

## 错误恢复机制测试

```typescript
// src/infrastructure/error-handling/tests/error-recovery.test.ts
import { retry, RetryOptions } from '../error-recovery';

class TestService {
  private callCount = 0;
  
  @retry({
    maxAttempts: 3,
    initialDelay: 10,
    delayMultiplier: 2,
  })
  public async flakyMethod(): Promise<string> {
    this.callCount++;
    
    if (this.callCount < 3) {
      throw new Error('Flaky error');
    }
    
    return 'Success';
  }
  
  public getCallCount(): number {
    return this.callCount;
  }
}

describe('Retry Mechanism', () => {
  test('should retry failed method calls', async () => {
    const service = new TestService();
    
    const result = await service.flakyMethod();
    
    expect(result).toBe('Success');
    expect(service.getCallCount()).toBe(3);
  });
  
  test('should fail after max attempts', async () => {
    const service = new TestService();
    
    // 重写方法，总是失败
    (service as any).flakyMethod = async () => {
      throw new Error('Always fails');
    };
    
    await expect(service.flakyMethod()).rejects.toThrow('Always fails');
  });
});
```