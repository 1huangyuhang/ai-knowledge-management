# Day 19: 错误处理模块 - 代码实现（第一部分）

## 错误类型定义

```typescript
/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 系统错误 */
  SYSTEM = 'system',
  /** 数据库错误 */
  DATABASE = 'database',
  /** 网络错误 */
  NETWORK = 'network',
  /** 业务逻辑错误 */
  BUSINESS = 'business',
  /** 参数错误 */
  VALIDATION = 'validation',
  /** 授权错误 */
  AUTH = 'auth',
  /** 资源未找到错误 */
  NOT_FOUND = 'notFound',
}
```

## 错误码定义

```typescript
/**
 * 错误码定义
 */
export enum ErrorCode {
  // 系统错误 (1000-1999)
  SYSTEM_ERROR = 'E1000',
  INTERNAL_SERVER_ERROR = 'E1001',
  SERVICE_UNAVAILABLE = 'E1002',
  
  // 数据库错误 (2000-2999)
  DATABASE_ERROR = 'E2000',
  DATABASE_CONNECTION_ERROR = 'E2001',
  DATABASE_QUERY_ERROR = 'E2002',
  DATABASE_TRANSACTION_ERROR = 'E2003',
  
  // 业务逻辑错误 (3000-3999)
  BUSINESS_ERROR = 'E3000',
  INVALID_OPERATION = 'E3001',
  
  // 参数错误 (4000-4999)
  VALIDATION_ERROR = 'E4000',
  MISSING_REQUIRED_FIELD = 'E4001',
  INVALID_FIELD_VALUE = 'E4002',
  
  // 授权错误 (5000-5999)
  AUTH_ERROR = 'E5000',
  UNAUTHORIZED = 'E5001',
  FORBIDDEN = 'E5002',
  
  // 资源未找到错误 (6000-6999)
  NOT_FOUND_ERROR = 'E6000',
  RESOURCE_NOT_FOUND = 'E6001',
}
```

## 基础错误类实现

```typescript
/**
 * 自定义错误基类
 */
export class CustomError extends Error {
  /** 错误类型 */
  public readonly type: ErrorType;
  /** 错误码 */
  public readonly code: ErrorCode;
  /** HTTP状态码 */
  public readonly statusCode: number;
  /** 错误上下文信息 */
  public readonly context?: Record<string, any>;
  /** 原始错误 */
  public readonly cause?: Error;

  /**
   * 创建自定义错误
   * @param message 错误信息
   * @param type 错误类型
   * @param code 错误码
   * @param statusCode HTTP状态码
   * @param context 错误上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    type: ErrorType,
    code: ErrorCode,
    statusCode: number,
    context?: Record<string, any>,
    cause?: Error
  ) {
    super(message);
    this.name = 'CustomError';
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.cause = cause;
    
    // 确保错误堆栈正确
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 格式化错误为JSON格式
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      stack: process.env.NODE_ENV === 'production' ? undefined : this.stack,
    };
  }
}
```

## 系统错误类

```typescript
/**
 * 系统错误类
 */
export class SystemError extends CustomError {
  /**
   * 创建系统错误
   * @param message 错误信息
   * @param code 错误码
   * @param context 错误上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.SYSTEM_ERROR,
    context?: Record<string, any>,
    cause?: Error
  ) {
    super(
      message,
      ErrorType.SYSTEM,
      code,
      500,
      context,
      cause
    );
    this.name = 'SystemError';
  }
}
```

## 数据库错误类

```typescript
/**
 * 数据库错误类
 */
export class DatabaseError extends CustomError {
  /**
   * 创建数据库错误
   * @param message 错误信息
   * @param code 错误码
   * @param context 错误上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.DATABASE_ERROR,
    context?: Record<string, any>,
    cause?: Error
  ) {
    super(
      message,
      ErrorType.DATABASE,
      code,
      500,
      context,
      cause
    );
    this.name = 'DatabaseError';
  }
}
```

## 业务逻辑错误类

```typescript
/**
 * 业务逻辑错误类
 */
export class BusinessError extends CustomError {
  /**
   * 创建业务逻辑错误
   * @param message 错误信息
   * @param code 错误码
   * @param context 错误上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.BUSINESS_ERROR,
    context?: Record<string, any>,
    cause?: Error
  ) {
    super(
      message,
      ErrorType.BUSINESS,
      code,
      400,
      context,
      cause
    );
    this.name = 'BusinessError';
  }
}
```

## 参数验证错误类

```typescript
/**
 * 参数验证错误类
 */
export class ValidationError extends CustomError {
  /**
   * 创建参数验证错误
   * @param message 错误信息
   * @param code 错误码
   * @param context 错误上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.VALIDATION_ERROR,
    context?: Record<string, any>,
    cause?: Error
  ) {
    super(
      message,
      ErrorType.VALIDATION,
      code,
      400,
      context,
      cause
    );
    this.name = 'ValidationError';
  }
}
```

## 授权错误类

```typescript
/**
 * 授权错误类
 */
export class AuthError extends CustomError {
  /**
   * 创建授权错误
   * @param message 错误信息
   * @param code 错误码
   * @param context 错误上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.AUTH_ERROR,
    context?: Record<string, any>,
    cause?: Error
  ) {
    super(
      message,
      ErrorType.AUTH,
      code,
      401,
      context,
      cause
    );
    this.name = 'AuthError';
  }
}
```

## 资源未找到错误类

```typescript
/**
 * 资源未找到错误类
 */
export class NotFoundError extends CustomError {
  /**
   * 创建资源未找到错误
   * @param message 错误信息
   * @param code 错误码
   * @param context 错误上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND,
    context?: Record<string, any>,
    cause?: Error
  ) {
    super(
      message,
      ErrorType.NOT_FOUND,
      code,
      404,
      context,
      cause
    );
    this.name = 'NotFoundError';
  }
}
```

## 错误处理器配置

```typescript
/**
 * 错误处理器配置选项
 */
export interface ErrorHandlerOptions {
  /** 是否启用错误日志记录 */
  enableLogging?: boolean;
  /** 是否启用错误通知 */
  enableNotification?: boolean;
  /** 是否在生产环境中隐藏详细错误信息 */
  hideDetailsInProduction?: boolean;
  /** 自定义错误日志记录器 */
  logger?: any;
  /** 自定义错误通知器 */
  notifier?: any;
}
```

## 错误处理器类

```typescript
import { CustomError, ErrorType } from './custom-error';

/**
 * 错误处理器
 */
export class ErrorHandler {
  private readonly options: ErrorHandlerOptions;

  /**
   * 创建错误处理器
   * @param options 错误处理器配置
   */
  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      enableLogging: true,
      enableNotification: false,
      hideDetailsInProduction: true,
      ...options,
    };
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @param context 错误上下文信息
   */
  public handle(error: Error, context?: Record<string, any>): void {
    // 如果不是自定义错误，转换为系统错误
    const customError = this.normalizeError(error, context);
    
    // 记录错误日志
    if (this.options.enableLogging) {
      this.logError(customError);
    }
    
    // 发送错误通知
    if (this.options.enableNotification) {
      this.notifyError(customError);
    }
  }

  /**
   * 将普通错误转换为自定义错误
   * @param error 错误对象
   * @param context 错误上下文信息
   */
  public normalizeError(error: Error, context?: Record<string, any>): CustomError {
    if (error instanceof CustomError) {
      // 如果已经是自定义错误，合并上下文信息
      return new (error.constructor as any)(
        error.message,
        error.type,
        error.code,
        error.statusCode,
        { ...error.context, ...context },
        error.cause
      );
    }
    
    // 转换为系统错误
    return new SystemError(
      error.message || 'Internal Server Error',
      ErrorCode.INTERNAL_SERVER_ERROR,
      context,
      error
    );
  }

  /**
   * 记录错误日志
   * @param error 自定义错误
   */
  private logError(error: CustomError): void {
    // 使用自定义日志器或控制台
    const logger = this.options.logger || console;
    
    const logData = {
      name: error.name,
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
    
    // 根据错误类型使用不同的日志级别
    if (error.type === ErrorType.SYSTEM || error.type === ErrorType.DATABASE) {
      logger.error('SYSTEM_ERROR', logData);
    } else if (error.type === ErrorType.AUTH) {
      logger.warn('AUTH_ERROR', logData);
    } else {
      logger.error('BUSINESS_ERROR', logData);
    }
  }

  /**
   * 发送错误通知
   * @param error 自定义错误
   */
  private notifyError(error: CustomError): void {
    // 实现错误通知逻辑，例如发送邮件、短信或推送通知
    // 这里仅作为示例
    const notifier = this.options.notifier;
    if (notifier) {
      notifier.send({
        title: `Error: ${error.code} - ${error.message}`,
        body: JSON.stringify(error.toJSON(), null, 2),
        level: error.type === ErrorType.SYSTEM ? 'critical' : 'warning',
      });
    }
  }

  /**
   * 获取客户端错误响应
   * @param error 错误对象
   */
  public getClientResponse(error: Error): Record<string, any> {
    const customError = this.normalizeError(error);
    
    const response = {
      success: false,
      error: {
        message: customError.message,
        code: customError.code,
        type: customError.type,
      },
    };
    
    // 在开发环境中返回详细错误信息
    if (process.env.NODE_ENV !== 'production' && !this.options.hideDetailsInProduction) {
      response.error = {
        ...response.error,
        stack: customError.stack,
        context: customError.context,
      };
    }
    
    return response;
  }
}
```