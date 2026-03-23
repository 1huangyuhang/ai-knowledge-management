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
  /** 是否对所有错误重试，默认true */
  retryAllErrors?: boolean;
}

/**
 * 指数退避重试策略，每次重试等待时间呈指数增长
 */
export class ExponentialBackoffRetryStrategy implements RetryStrategy {
  private readonly retryAllErrors: boolean;
  
  constructor(private config: ExponentialBackoffConfig) {
    this.retryAllErrors = config.retryAllErrors ?? true;
  }
  
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
    
    // 如果配置为对所有错误重试，直接返回true
    if (this.retryAllErrors) {
      return true;
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
