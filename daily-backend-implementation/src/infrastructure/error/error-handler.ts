/**
 * 错误处理服务
 * 统一处理系统中的错误
 */
import { LoggerService } from '../logging/logger.service';
// 从domain-error.ts中导入所有错误类型
import { AuthError, CognitiveError, DomainError, InternalServerError, NotFoundError, ValidationError } from '../../domain/errors/domain-error';

/**
 * 错误处理服务接口
 */
export interface ErrorHandler {
  /**
   * 处理错误
   * @param error 错误对象
   * @returns 标准化的错误响应
   */
  handleError(error: Error): ErrorResponse;
}

/**
 * 标准化的错误响应
 */
export interface ErrorResponse {
  /**
   * 错误状态码
   */
  statusCode: number;
  /**
   * 错误消息
   */
  message: string;
  /**
   * 错误代码
   */
  errorCode: string;
  /**
   * 错误详情（仅在开发环境中返回）
   */
  details?: any;
}

/**
 * 默认错误处理服务实现
 */
export class DefaultErrorHandler implements ErrorHandler {
  private logger: LoggerService;
  private isDevelopment: boolean;

  /**
   * 创建DefaultErrorHandler实例
   * @param logger 日志服务
   * @param isDevelopment 是否为开发环境
   */
  constructor(logger: LoggerService, isDevelopment: boolean = false) {
    this.logger = logger;
    this.isDevelopment = isDevelopment;
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @returns 标准化的错误响应
   */
  handleError(error: Error): ErrorResponse {
    // 记录错误
    this.logger.error('An error occurred', error);

    // 根据错误类型返回不同的响应
    if (error instanceof AuthError) {
      return this.handleAuthError(error);
    } else if (error instanceof CognitiveError) {
      return this.handleCognitiveError(error);
    } else if (error instanceof DomainError) {
      return this.handleDomainError(error);
    } else {
      return this.handleGenericError(error);
    }
  }

  /**
   * 处理认证错误
   * @param error 认证错误对象
   * @returns 标准化的错误响应
   */
  private handleAuthError(error: AuthError): ErrorResponse {
    let statusCode = 401;

    // 根据具体的认证错误类型返回不同的状态码
    switch (error.code) {
      case 'INVALID_INPUT':
        statusCode = 400;
        break;
      case 'EMAIL_ALREADY_EXISTS':
        statusCode = 409;
        break;
      case 'USER_NOT_FOUND':
      case 'INVALID_PASSWORD':
      case 'INVALID_REFRESH_TOKEN':
        statusCode = 401;
        break;
      case 'USER_NOT_ACTIVE':
        statusCode = 403;
        break;
    }

    return {
      statusCode,
      message: error.message,
      errorCode: error.code,
      details: this.isDevelopment ? { stack: error.stack } : undefined,
    };
  }

  /**
   * 处理认知模型错误
   * @param error 认知模型错误对象
   * @returns 标准化的错误响应
   */
  private handleCognitiveError(error: CognitiveError): ErrorResponse {
    let statusCode = 400;

    // 根据具体的认知模型错误类型返回不同的状态码
    switch (error.code) {
      case 'MODEL_NOT_FOUND':
      case 'THOUGHT_FRAGMENT_NOT_FOUND':
        statusCode = 404;
        break;
      case 'UNAUTHORIZED':
        statusCode = 403;
        break;
    }

    return {
      statusCode,
      message: error.message,
      errorCode: error.code,
      details: this.isDevelopment ? { stack: error.stack } : undefined,
    };
  }

  /**
   * 处理领域错误
   * @param error 领域错误对象
   * @returns 标准化的错误响应
   */
  private handleDomainError(error: DomainError): ErrorResponse {
    return {
      statusCode: 400,
      message: error.message,
      errorCode: error.code,
      details: this.isDevelopment ? { stack: error.stack } : undefined,
    };
  }

  /**
   * 处理通用错误
   * @param error 通用错误对象
   * @returns 标准化的错误响应
   */
  private handleGenericError(error: Error): ErrorResponse {
    return {
      statusCode: 500,
      message: 'An unexpected error occurred',
      errorCode: 'INTERNAL_SERVER_ERROR',
      details: this.isDevelopment ? { message: error.message, stack: error.stack } : undefined,
    };
  }
}
