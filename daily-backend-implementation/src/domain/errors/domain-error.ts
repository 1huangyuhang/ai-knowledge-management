/**
 * 领域错误基类
 * 所有领域相关的错误都应该继承自此类
 */
export abstract class DomainError extends Error {
  /**
   * 错误代码，用于识别特定错误
   */
  public abstract readonly code: string;

  /**
   * 错误的HTTP状态码
   */
  public abstract readonly statusCode: number;

  /**
   * 创建领域错误实例
   * @param message 错误消息
   * @param cause 原始错误（可选）
   */
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * 认证相关错误
 */
export class AuthError extends DomainError {
  public readonly code: string;
  public readonly statusCode: number = 401;

  /**
   * 创建认证错误实例
   * @param message 错误消息
   * @param code 错误代码
   * @param cause 原始错误（可选）
   */
  constructor(message: string, code: string = 'AUTH_ERROR', cause?: Error) {
    super(message, cause);
    this.code = code;
  }
}

/**
 * 认知模型相关错误
 */
export class CognitiveError extends DomainError {
  public readonly code: string;
  public readonly statusCode: number = 400;

  /**
   * 创建认知模型错误实例
   * @param message 错误消息
   * @param code 错误代码
   * @param cause 原始错误（可选）
   */
  constructor(message: string, code: string = 'COGNITIVE_ERROR', cause?: Error) {
    super(message, cause);
    this.code = code;
  }
}

/**
 * 验证错误
 */
export class ValidationError extends DomainError {
  public readonly code: string = 'VALIDATION_ERROR';
  public readonly statusCode: number = 400;

  /**
   * 验证错误详情
   */
  constructor(message: string, public readonly details?: Record<string, string[]>, cause?: Error) {
    super(message, cause);
  }
}

/**
 * 资源未找到错误
 */
export class NotFoundError extends DomainError {
  public readonly code: string;
  public readonly statusCode: number = 404;

  /**
   * 创建资源未找到错误实例
   * @param message 错误消息
   * @param code 错误代码
   * @param cause 原始错误（可选）
   */
  constructor(message: string, code: string = 'NOT_FOUND_ERROR', cause?: Error) {
    super(message, cause);
    this.code = code;
  }
}

/**
 * 内部服务器错误
 */
export class InternalServerError extends DomainError {
  public readonly code: string = 'INTERNAL_SERVER_ERROR';
  public readonly statusCode: number = 500;

  /**
   * 创建内部服务器错误实例
   * @param message 错误消息
   * @param cause 原始错误（可选）
   */
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}