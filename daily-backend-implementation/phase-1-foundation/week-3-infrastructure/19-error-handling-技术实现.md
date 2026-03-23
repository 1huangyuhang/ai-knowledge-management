# Day 19: 错误处理系统代码实现

## 核心设计

### 设计原则

- **集中式错误处理**：所有错误通过统一的错误处理机制处理，确保一致性
- **错误分类清晰**：根据错误类型进行分类，便于处理和调试
- **详细的错误信息**：包含错误代码、消息、上下文和堆栈跟踪
- **友好的错误响应**：对外部请求返回结构化、易理解的错误响应
- **错误日志记录**：自动记录错误信息，便于监控和调试
- **错误恢复机制**：提供错误恢复策略，确保系统稳定性

### 核心组件

1. **CustomError**：自定义错误基类，包含错误代码、消息和上下文
2. **ErrorTypes**：错误类型枚举，用于分类错误
3. **ErrorHandler**：错误处理器，负责处理和转换错误
4. **ErrorMiddleware**：错误处理中间件，用于Express等Web框架
5. **ErrorLogger**：错误日志记录器，负责记录错误信息
6. **ErrorResponse**：错误响应格式化器，用于生成结构化错误响应

## 实现细节

### 1. 错误类型和自定义错误类

```typescript
// 错误类型枚举
export enum ErrorType {
  // 系统错误
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  // 数据库错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  // 业务逻辑错误
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  // 授权错误
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  // 权限错误
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  // 资源未找到错误
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  // 第三方服务错误
  THIRD_PARTY_ERROR = 'THIRD_PARTY_ERROR'
}

// 错误代码枚举
export enum ErrorCode {
  // 系统错误
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  
  // 数据库错误
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DATABASE_TRANSACTION_ERROR = 'DATABASE_TRANSACTION_ERROR',
  
  // 验证错误
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_VALUE = 'INVALID_FIELD_VALUE',
  
  // 业务逻辑错误
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  
  // 授权错误
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  
  // 权限错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // 资源未找到错误
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // 第三方服务错误
  THIRD_PARTY_SERVICE_FAILURE = 'THIRD_PARTY_SERVICE_FAILURE'
}

// 自定义错误基类
export class CustomError extends Error {
  /** 错误类型 */
  public type: ErrorType;
  /** 错误代码 */
  public code: ErrorCode;
  /** 错误上下文信息 */
  public context?: Record<string, any>;
  /** HTTP状态码 */
  public statusCode: number;
  /** 是否为操作错误 */
  public isOperational: boolean;
  /** 时间戳 */
  public timestamp: Date;

  /**
   * 自定义错误构造函数
   * @param message 错误消息
   * @param type 错误类型
   * @param code 错误代码
   * @param statusCode HTTP状态码
   * @param context 错误上下文
   */
  constructor(
    message: string,
    type: ErrorType,
    code: ErrorCode,
    statusCode: number,
    context?: Record<string, any>
  ) {
    super(message);
    
    // 设置原型链
    Object.setPrototypeOf(this, CustomError.prototype);
    
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.isOperational = true;
    this.timestamp = new Date();
    
    // 捕获堆栈跟踪
    Error.captureStackTrace(this, this.constructor);
  }
}

// 系统错误类
export class SystemError extends CustomError {
  /**
   * 系统错误构造函数
   * @param message 错误消息
   * @param code 错误代码
   * @param context 错误上下文
   */
  constructor(message: string, code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR, context?: Record<string, any>) {
    super(message, ErrorType.SYSTEM_ERROR, code, 500, context);
  }
}

// 数据库错误类
export class DatabaseError extends CustomError {
  /**
   * 数据库错误构造函数
   * @param message 错误消息
   * @param code 错误代码
   * @param context 错误上下文
   */
  constructor(message: string, code: ErrorCode = ErrorCode.DATABASE_CONNECTION_ERROR, context?: Record<string, any>) {
    super(message, ErrorType.DATABASE_ERROR, code, 500, context);
  }
}

// 验证错误类
export class ValidationError extends CustomError {
  /**
   * 验证错误构造函数
   * @param message 错误消息
   * @param code 错误代码
   * @param context 错误上下文
   */
  constructor(message: string, code: ErrorCode = ErrorCode.INVALID_REQUEST, context?: Record<string, any>) {
    super(message, ErrorType.VALIDATION_ERROR, code, 400, context);
  }
}

// 业务逻辑错误类
export class BusinessError extends CustomError {
  /**
   * 业务逻辑错误构造函数
   * @param message 错误消息
   * @param code 错误代码
   * @param context 错误上下文
   */
  constructor(message: string, code: ErrorCode = ErrorCode.BUSINESS_RULE_VIOLATION, context?: Record<string, any>) {
    super(message, ErrorType.BUSINESS_ERROR, code, 400, context);
  }
}

// 授权错误类
export class AuthenticationError extends CustomError {
  /**
   * 授权错误构造函数
   * @param message 错误消息
   * @param code 错误代码
   * @param context 错误上下文
   */
  constructor(message: string, code: ErrorCode = ErrorCode.UNAUTHENTICATED, context?: Record<string, any>) {
    super(message, ErrorType.AUTHENTICATION_ERROR, code, 401, context);
  }
}

// 权限错误类
export class AuthorizationError extends CustomError {
  /**
   * 权限错误构造函数
   * @param message 错误消息
   * @param code 错误代码
   * @param context 错误上下文
   */
  constructor(message: string, code: ErrorCode = ErrorCode.UNAUTHORIZED, context?: Record<string, any>) {
    super(message, ErrorType.AUTHORIZATION_ERROR, code, 403, context);
  }
}

// 资源未找到错误类
export class NotFoundError extends CustomError {
  /**
   * 资源未找到错误构造函数
   * @param message 错误消息
   * @param code 错误代码
   * @param context 错误上下文
   */
  constructor(message: string, code: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND, context?: Record<string, any>) {
    super(message, ErrorType.NOT_FOUND_ERROR, code, 404, context);
  }
}

// 第三方服务错误类
export class ThirdPartyError extends CustomError {
  /**
   * 第三方服务错误构造函数
   * @param message 错误消息
   * @param code 错误代码
   * @param context 错误上下文
   */
  constructor(message: string, code: ErrorCode = ErrorCode.THIRD_PARTY_SERVICE_FAILURE, context?: Record<string, any>) {
    super(message, ErrorType.THIRD_PARTY_ERROR, code, 503, context);
  }
}
```

### 2. 错误处理器

```typescript
// 错误处理器配置接口
export interface ErrorHandlerConfig {
  /** 是否包含堆栈跟踪 */
  includeStackTrace: boolean;
  /** 是否记录错误 */
  logErrors: boolean;
  /** 错误日志记录器 */
  logger?: any;
}

// 错误处理器
export class ErrorHandler {
  private config: ErrorHandlerConfig;

  /**
   * 错误处理器构造函数
   * @param config 错误处理器配置
   */
  constructor(config: ErrorHandlerConfig = { includeStackTrace: false, logErrors: true }) {
    this.config = config;
  }

  /**
   * 处理错误，转换为标准化错误对象
   * @param error 错误对象
   * @returns 标准化错误对象
   */
  public handleError(error: any): CustomError {
    // 如果已经是自定义错误，直接返回
    if (error instanceof CustomError) {
      return error;
    }

    // 根据错误类型转换为自定义错误
    let customError: CustomError;

    // 处理不同类型的错误
    if (error.name === 'ValidationError') {
      // 处理验证库错误（如Joi、Yup等）
      customError = new ValidationError(
        '请求验证失败',
        ErrorCode.INVALID_REQUEST,
        { validationErrors: error.details }
      );
    } else if (error.name === 'UnauthorizedError') {
      // 处理授权错误（如JWT验证失败）
      customError = new AuthenticationError(
        '未授权访问',
        ErrorCode.INVALID_CREDENTIALS,
        { originalError: error.message }
      );
    } else if (error.code && error.code.startsWith('SQLITE_')) {
      // 处理SQLite数据库错误
      customError = new DatabaseError(
        '数据库操作失败',
        ErrorCode.DATABASE_QUERY_ERROR,
        { sqliteCode: error.code, originalError: error.message }
      );
    } else {
      // 其他错误视为系统错误
      customError = new SystemError(
        error.message || '内部服务器错误',
        ErrorCode.INTERNAL_SERVER_ERROR,
        { originalError: error.message, name: error.name }
      );
    }

    // 记录错误
    if (this.config.logErrors) {
      this.logError(customError);
    }

    return customError;
  }

  /**
   * 记录错误
   * @param error 错误对象
   */
  private logError(error: CustomError): void {
    try {
      const logData = {
        type: error.type,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        context: error.context,
        stack: this.config.includeStackTrace ? error.stack : undefined,
        timestamp: error.timestamp
      };

      if (this.config.logger) {
        // 使用外部日志记录器
        this.config.logger.error('系统错误', logData);
      } else {
        // 使用默认控制台日志
        console.error('系统错误:', logData);
      }
    } catch (logError) {
      // 避免日志记录错误导致系统崩溃
      console.error('错误日志记录失败:', logError);
    }
  }

  /**
   * 生成错误响应
   * @param error 错误对象
   * @returns 标准化错误响应
   */
  public generateErrorResponse(error: CustomError): {
    success: false;
    error: {
      type: string;
      code: string;
      message: string;
      context?: Record<string, any>;
      stack?: string;
    };
    timestamp: string;
  } {
    return {
      success: false,
      error: {
        type: error.type,
        code: error.code,
        message: error.message,
        context: error.context,
        stack: this.config.includeStackTrace ? error.stack : undefined
      },
      timestamp: error.timestamp.toISOString()
    };
  }
}
```

### 3. 错误处理中间件

```typescript
import { Request, Response, NextFunction } from 'express';
import { CustomError, ErrorHandler } from './error-handler';

/**
 * Express错误处理中间件
 */
export class ErrorMiddleware {
  private errorHandler: ErrorHandler;

  /**
   * 错误中间件构造函数
   * @param errorHandler 错误处理器
   */
  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
  }

  /**
   * 中间件函数
   * @param err 错误对象
   * @param req 请求对象
   * @param res 响应对象
   * @param next 下一个中间件
   */
  public middleware(err: any, req: Request, res: Response, next: NextFunction): void {
    // 处理错误
    const customError = this.errorHandler.handleError(err);
    
    // 生成错误响应
    const errorResponse = this.errorHandler.generateErrorResponse(customError);
    
    // 设置HTTP状态码
    res.status(customError.statusCode);
    
    // 返回JSON响应
    res.json(errorResponse);
  }

  /**
   * 未捕获异常处理器
   */
  public handleUncaughtException(): void {
    process.on('uncaughtException', (error) => {
      const customError = this.errorHandler.handleError(error);
      console.error('未捕获的异常:', customError);
      // 可以选择退出进程，防止系统处于不稳定状态
      // process.exit(1);
    });
  }

  /**
   * 未处理的Promise拒绝处理器
   */
  public handleUnhandledRejection(): void {
    process.on('unhandledRejection', (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      const customError = this.errorHandler.handleError(error);
      console.error('未处理的Promise拒绝:', customError);
      // 可以选择退出进程，防止系统处于不稳定状态
      // process.exit(1);
    });
  }
}
```

### 4. 错误日志记录器

```typescript
import { CustomError } from './custom-errors';
import { Logger } from '../logging'; // 假设我们已经实现了日志系统

/**
 * 错误日志记录器
 */
export class ErrorLogger {
  private logger: Logger;

  /**
   * 错误日志记录器构造函数
   * @param logger 日志记录器
   */
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * 记录错误
   * @param error 错误对象
   * @param context 额外上下文信息
   */
  public logError(error: Error, context?: Record<string, any>): void {
    if (error instanceof CustomError) {
      // 记录自定义错误
      this.logger.error('系统错误', {
        type: error.type,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        context: { ...error.context, ...context },
        stack: error.stack
      });
    } else {
      // 记录普通错误
      this.logger.error('系统错误', {
        type: 'SYSTEM_ERROR',
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
        statusCode: 500,
        context,
        stack: error.stack,
        name: error.name
      });
    }
  }

  /**
   * 记录警告
   * @param message 警告消息
   * @param context 上下文信息
   */
  public logWarning(message: string, context?: Record<string, any>): void {
    this.logger.warn('系统警告', {
      message,
      context
    });
  }
}
```

### 5. 错误响应格式化器

```typescript
import { CustomError } from './custom-errors';

/**
 * 错误响应格式化器
 */
export class ErrorResponseFormatter {
  /**
   * 格式化错误响应
   * @param error 错误对象
   * @param includeStackTrace 是否包含堆栈跟踪
   * @returns 格式化后的错误响应
   */
  public static formatErrorResponse(error: CustomError, includeStackTrace: boolean = false): {
    success: false;
    error: {
      type: string;
      code: string;
      message: string;
      context?: Record<string, any>;
      stack?: string;
    };
    timestamp: string;
  } {
    return {
      success: false,
      error: {
        type: error.type,
        code: error.code,
        message: error.message,
        context: error.context,
        stack: includeStackTrace ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 格式化验证错误响应
   * @param errors 验证错误数组
   * @returns 格式化后的验证错误响应
   */
  public static formatValidationErrors(errors: Array<{ field: string; message: string }>): {
    success: false;
    error: {
      type: string;
      code: string;
      message: string;
      context?: Record<string, any>;
    };
    timestamp: string;
  } {
    return {
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        code: 'INVALID_REQUEST',
        message: '请求验证失败',
        context: { validationErrors: errors }
      },
      timestamp: new Date().toISOString()
    };
  }
}
```

### 6. 错误恢复机制

```typescript
/**
 * 错误恢复策略接口
 */
export interface ErrorRecoveryStrategy {
  /**
   * 执行错误恢复
   * @param error 错误对象
   * @returns 是否恢复成功
   */
  recover(error: Error): Promise<boolean>;
}

/**
 * 重试恢复策略
 */
export class RetryRecoveryStrategy implements ErrorRecoveryStrategy {
  private maxRetries: number;
  private delay: number;

  /**
   * 重试恢复策略构造函数
   * @param maxRetries 最大重试次数
   * @param delay 重试延迟（毫秒）
   */
  constructor(maxRetries: number = 3, delay: number = 1000) {
    this.maxRetries = maxRetries;
    this.delay = delay;
  }

  /**
   * 执行重试恢复
   * @param error 错误对象
   * @returns 是否恢复成功
   */
  public async recover(error: Error): Promise<boolean> {
    // 只对特定类型的错误进行重试
    if (error instanceof CustomError && 
        (error.type === ErrorType.DATABASE_ERROR || 
         error.type === ErrorType.THIRD_PARTY_ERROR)) {
      
      for (let i = 0; i < this.maxRetries; i++) {
        try {
          // 这里可以根据实际情况实现具体的重试逻辑
          // 例如，重新连接数据库或重新调用第三方服务
          console.log(`正在重试... (${i + 1}/${this.maxRetries})`);
          
          // 模拟重试延迟
          await new Promise(resolve => setTimeout(resolve, this.delay));
          
          // 假设重试成功
          return true;
        } catch (retryError) {
          console.log(`重试失败: ${retryError.message}`);
        }
      }
    }
    
    // 恢复失败
    return false;
  }
}

/**
 * 降级恢复策略
 */
export class FallbackRecoveryStrategy implements ErrorRecoveryStrategy {
  private fallbackFunction: () => Promise<any>;

  /**
   * 降级恢复策略构造函数
   * @param fallbackFunction 降级函数
   */
  constructor(fallbackFunction: () => Promise<any>) {
    this.fallbackFunction = fallbackFunction;
  }

  /**
   * 执行降级恢复
   * @param error 错误对象
   * @returns 是否恢复成功
   */
  public async recover(error: Error): Promise<boolean> {
    try {
      // 执行降级函数
      await this.fallbackFunction();
      return true;
    } catch (fallbackError) {
      console.log(`降级失败: ${fallbackError.message}`);
      return false;
    }
  }
}

/**
 * 错误恢复管理器
 */
export class ErrorRecoveryManager {
  private strategies: Map<string, ErrorRecoveryStrategy> = new Map();

  /**
   * 注册恢复策略
   * @param errorType 错误类型
   * @param strategy 恢复策略
   */
  public registerStrategy(errorType: string, strategy: ErrorRecoveryStrategy): void {
    this.strategies.set(errorType, strategy);
  }

  /**
   * 执行错误恢复
   * @param error 错误对象
   * @returns 是否恢复成功
   */
  public async executeRecovery(error: Error): Promise<boolean> {
    if (error instanceof CustomError) {
      const strategy = this.strategies.get(error.type);
      if (strategy) {
        return await strategy.recover(error);
      }
    }
    
    // 没有找到对应的恢复策略
    return false;
  }
}
```

## 测试

### 1. 单元测试

```typescript
import {
  CustomError,
  SystemError,
  DatabaseError,
  ValidationError,
  BusinessError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ThirdPartyError,
  ErrorType,
  ErrorCode
} from './custom-errors';
import { ErrorHandler } from './error-handler';
import { ErrorResponseFormatter } from './error-response-formatter';

// 模拟日志记录器
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

describe('错误处理系统单元测试', () => {
  describe('自定义错误类', () => {
    test('SystemError 应该正确创建', () => {
      const error = new SystemError('测试系统错误');
      expect(error).toBeInstanceOf(SystemError);
      expect(error).toBeInstanceOf(CustomError);
      expect(error.type).toBe(ErrorType.SYSTEM_ERROR);
      expect(error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('测试系统错误');
    });

    test('DatabaseError 应该正确创建', () => {
      const error = new DatabaseError('测试数据库错误', ErrorCode.DATABASE_CONNECTION_ERROR);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.type).toBe(ErrorType.DATABASE_ERROR);
      expect(error.code).toBe(ErrorCode.DATABASE_CONNECTION_ERROR);
      expect(error.statusCode).toBe(500);
    });

    test('ValidationError 应该正确创建', () => {
      const error = new ValidationError('测试验证错误', ErrorCode.MISSING_REQUIRED_FIELD, { field: 'name' });
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(error.code).toBe(ErrorCode.MISSING_REQUIRED_FIELD);
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ field: 'name' });
    });
  });

  describe('错误处理器', () => {
    test('handleError 应该处理普通错误', () => {
      const errorHandler = new ErrorHandler({ includeStackTrace: true, logErrors: false });
      const originalError = new Error('普通错误');
      const customError = errorHandler.handleError(originalError);
      
      expect(customError).toBeInstanceOf(SystemError);
      expect(customError.type).toBe(ErrorType.SYSTEM_ERROR);
      expect(customError.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(customError.message).toBe('普通错误');
    });

    test('handleError 应该处理SQLite错误', () => {
      const errorHandler = new ErrorHandler({ includeStackTrace: true, logErrors: false });
      const sqliteError = { code: 'SQLITE_ERROR', message: 'SQL语法错误' };
      const customError = errorHandler.handleError(sqliteError);
      
      expect(customError).toBeInstanceOf(DatabaseError);
      expect(customError.type).toBe(ErrorType.DATABASE_ERROR);
      expect(customError.code).toBe(ErrorCode.DATABASE_QUERY_ERROR);
      expect(customError.context).toHaveProperty('sqliteCode', 'SQLITE_ERROR');
    });

    test('generateErrorResponse 应该生成正确的响应格式', () => {
      const errorHandler = new ErrorHandler({ includeStackTrace: false, logErrors: false });
      const customError = new SystemError('测试错误');
      const response = errorHandler.generateErrorResponse(customError);
      
      expect(response).toEqual({
        success: false,
        error: {
          type: ErrorType.SYSTEM_ERROR,
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: '测试错误',
          context: undefined
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('错误响应格式化器', () => {
    test('formatErrorResponse 应该生成正确的响应格式', () => {
      const customError = new ValidationError('测试验证错误');
      const response = ErrorResponseFormatter.formatErrorResponse(customError);
      
      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error');
      expect(response.error).toHaveProperty('type', ErrorType.VALIDATION_ERROR);
      expect(response).toHaveProperty('timestamp');
    });

    test('formatValidationErrors 应该生成正确的验证错误响应', () => {
      const validationErrors = [
        { field: 'name', message: '名称不能为空' },
        { field: 'age', message: '年龄必须是数字' }
      ];
      const response = ErrorResponseFormatter.formatValidationErrors(validationErrors);
      
      expect(response).toHaveProperty('success', false);
      expect(response.error).toHaveProperty('type', 'VALIDATION_ERROR');
      expect(response.error).toHaveProperty('code', 'INVALID_REQUEST');
      expect(response.error.context).toHaveProperty('validationErrors', validationErrors);
    });
  });
});
```

### 2. 集成测试

```typescript
import express from 'express';
import request from 'supertest';
import { ErrorHandler } from './error-handler';
import { ErrorMiddleware } from './error-middleware';
import { DatabaseError, NotFoundError } from './custom-errors';

// 模拟日志记录器
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

describe('错误处理中间件集成测试', () => {
  let app: express.Application;
  
  beforeEach(() => {
    // 创建Express应用
    app = express();
    app.use(express.json());
    
    // 初始化错误处理器和中间件
    const errorHandler = new ErrorHandler({ includeStackTrace: true, logErrors: true, logger: mockLogger });
    const errorMiddleware = new ErrorMiddleware(errorHandler);
    
    // 注册路由
    app.get('/test-database-error', (req, res, next) => {
      next(new DatabaseError('数据库连接失败'));
    });
    
    app.get('/test-not-found-error', (req, res, next) => {
      next(new NotFoundError('资源未找到'));
    });
    
    app.get('/test-normal-error', (req, res, next) => {
      throw new Error('普通错误');
    });
    
    // 注册错误中间件
    app.use(errorMiddleware.middleware);
  });
  
  test('应该正确处理数据库错误', async () => {
    const response = await request(app).get('/test-database-error');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('type', 'DATABASE_ERROR');
    expect(response.body.error).toHaveProperty('code', 'DATABASE_CONNECTION_ERROR');
    expect(response.body.error).toHaveProperty('message', '数据库连接失败');
  });
  
  test('应该正确处理资源未找到错误', async () => {
    const response = await request(app).get('/test-not-found-error');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('type', 'NOT_FOUND_ERROR');
    expect(response.body.error).toHaveProperty('code', 'RESOURCE_NOT_FOUND');
    expect(response.body.error).toHaveProperty('message', '资源未找到');
  });
  
  test('应该正确处理普通错误', async () => {
    const response = await request(app).get('/test-normal-error');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('type', 'SYSTEM_ERROR');
    expect(response.body.error).toHaveProperty('code', 'INTERNAL_SERVER_ERROR');
    expect(response.body.error).toHaveProperty('message', '普通错误');
  });
  
  test('应该返回404错误给未定义的路由', async () => {
    const response = await request(app).get('/undefined-route');
    
    // Express默认404处理
    expect(response.status).toBe(404);
  });
});
```

## 集成示例

### 1. 在Express应用中集成

```typescript
import express from 'express';
import { ErrorHandler } from './error-handler';
import { ErrorMiddleware } from './error-middleware';
import { Logger, LoggerFactory } from '../logging';
import { NotFoundError, ValidationError } from './custom-errors';

// 初始化日志系统
const logger = LoggerFactory.getLogger('error-handling-example');

// 初始化错误处理器
const errorHandler = new ErrorHandler({
  includeStackTrace: process.env.NODE_ENV !== 'production',
  logErrors: true,
  logger
});

// 初始化错误中间件
const errorMiddleware = new ErrorMiddleware(errorHandler);

// 创建Express应用
const app = express();
app.use(express.json());

// 注册路由
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Hello World!' });
});

// 测试错误路由
app.get('/error/system', (req, res, next) => {
  throw new Error('系统错误测试');
});

app.get('/error/not-found', (req, res, next) => {
  next(new NotFoundError('资源未找到测试'));
});

app.post('/error/validation', (req, res, next) => {
  if (!req.body.name) {
    next(new ValidationError('名称不能为空', 'MISSING_REQUIRED_FIELD', { field: 'name' }));
  }
  res.json({ success: true, message: '验证通过' });
});

// 404处理中间件
app.use((req, res, next) => {
  next(new NotFoundError(`未找到路径: ${req.originalUrl}`));
});

// 注册错误中间件
app.use(errorMiddleware.middleware);

// 注册未捕获异常和未处理Promise拒绝处理器
errorMiddleware.handleUncaughtException();
errorMiddleware.handleUnhandledRejection();

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`服务器启动在 http://localhost:${port}`);
});
```

### 2. 在业务逻辑中使用

```typescript
import { Repository } from '../repository';
import { UserCognitiveModel } from '../domain';
import { DatabaseError, NotFoundError, ValidationError } from './custom-errors';
import { Logger } from '../logging';

class CognitiveModelService {
  private repository: Repository<UserCognitiveModel>;
  private logger: Logger;

  constructor(repository: Repository<UserCognitiveModel>, logger: Logger) {
    this.repository = repository;
    this.logger = logger;
  }

  public async getModelById(id: string): Promise<UserCognitiveModel> {
    try {
      // 验证输入
      if (!id || typeof id !== 'string') {
        throw new ValidationError('无效的模型ID', 'INVALID_FIELD_VALUE', { id });
      }

      // 从仓库获取模型
      const model = await this.repository.findById(id);
      
      // 检查模型是否存在
      if (!model) {
        throw new NotFoundError(`未找到ID为${id}的认知模型`);
      }

      return model;
    } catch (error) {
      // 记录错误
      this.logger.error('获取认知模型失败', { id, error });
      // 重新抛出错误，由上层处理
      throw error;
    }
  }

  public async saveModel(model: UserCognitiveModel): Promise<UserCognitiveModel> {
    try {
      // 验证模型
      if (!model || !model.name) {
        throw new ValidationError('认知模型名称不能为空', 'MISSING_REQUIRED_FIELD', { model });
      }

      // 保存模型
      const savedModel = await this.repository.save(model);
      return savedModel;
    } catch (error) {
      this.logger.error('保存认知模型失败', { model, error });
      throw error;
    }
  }
}
```

## 最佳实践

1. **使用自定义错误类**：始终使用自定义错误类而不是普通Error对象，以便包含更多上下文信息
2. **错误分类清晰**：根据错误类型进行分类，便于处理和调试
3. **集中处理错误**：使用统一的错误处理机制，确保错误处理的一致性
4. **记录所有错误**：确保所有错误都被记录，便于监控和调试
5. **友好的错误响应**：对外部请求返回结构化、易理解的错误响应
6. **避免泄露敏感信息**：在生产环境中，不要在错误响应中包含敏感信息
7. **使用适当的HTTP状态码**：根据错误类型使用适当的HTTP状态码
8. **实现错误恢复机制**：对关键业务流程实现错误恢复机制，确保系统稳定性
9. **监控错误率**：监控系统错误率，及时发现和解决问题
10. **定期分析错误日志**：定期分析错误日志，找出系统瓶颈和潜在问题

## 扩展建议

1. **添加错误监控**：集成错误监控工具（如Sentry、New Relic等），实时监控系统错误
2. **实现错误告警**：当错误率超过阈值时，发送告警通知
3. **添加错误统计**：统计不同类型错误的发生频率，找出系统薄弱环节
4. **实现错误追踪**：为每个错误添加唯一标识符，便于追踪和调试
5. **添加错误文档**：为每个错误代码添加文档，说明错误原因和解决方法
6. **实现错误重试机制**：对特定类型的错误（如网络错误、数据库连接错误）实现自动重试机制
7. **添加错误降级策略**：在系统出现严重错误时，实现服务降级策略，确保核心功能可用

## 总结

本错误处理系统实现了一个全面、可扩展的错误处理框架，遵循了Clean Architecture原则，具有以下特点：

- **清晰的错误分类**：将错误分为系统错误、数据库错误、验证错误等多种类型，便于处理和调试
- **详细的错误信息**：包含错误代码、消息、上下文和堆栈跟踪，便于定位问题
- **统一的错误处理机制**：所有错误通过统一的错误处理器处理，确保一致性
- **友好的错误响应**：对外部请求返回结构化、易理解的错误响应
- **全面的错误日志记录**：自动记录错误信息，便于监控和调试
- **灵活的错误恢复机制**：支持多种错误恢复策略，确保系统稳定性
- **易于集成**：提供了Express中间件，便于在Web应用中集成

该错误处理系统可以满足不同规模应用的错误处理需求，从简单的API服务到复杂的分布式系统，都能轻松应对。