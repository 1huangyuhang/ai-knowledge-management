import { APIService } from './APIService';

/**
 * 可重试的API服务接口
 */
export interface RetryableAPIService extends APIService {
  /**
   * 设置重试策略
   * @param maxRetries 最大重试次数
   * @param retryDelay 重试延迟（毫秒）
   */
  setRetryStrategy(maxRetries: number, retryDelay: number): void;

  /**
   * 获取当前重试策略
   * @returns 重试策略配置
   */
  getRetryStrategy(): { maxRetries: number; retryDelay: number };
}

/**
 * 可重试的API服务实现
 */
export class RetryableAPIServiceImpl implements RetryableAPIService {
  private readonly apiService: APIService;
  private maxRetries: number;
  private retryDelay: number;

  /**
   * 创建可重试的API服务实例
   * @param apiService API服务
   * @param maxRetries 最大重试次数
   * @param retryDelay 重试延迟（毫秒）
   */
  constructor(
    apiService: APIService,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ) {
    this.apiService = apiService;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * 执行LLM请求
   * @param endpoint API端点
   * @param body 请求体
   * @param params 请求参数
   * @returns API响应
   */
  public async executeLLMRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T> {
    return this.executeWithRetry<T>(() => this.apiService.executeLLMRequest(endpoint, body, params));
  }

  /**
   * 执行Embedding请求
   * @param endpoint API端点
   * @param body 请求体
   * @param params 请求参数
   * @returns API响应
   */
  public async executeEmbeddingRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T> {
    return this.executeWithRetry<T>(() => this.apiService.executeEmbeddingRequest(endpoint, body, params));
  }

  /**
   * 健康检查
   * @returns 是否健康
   */
  public healthCheck(): boolean {
    return this.apiService.healthCheck();
  }

  /**
   * 设置重试策略
   * @param maxRetries 最大重试次数
   * @param retryDelay 重试延迟（毫秒）
   */
  public setRetryStrategy(maxRetries: number, retryDelay: number): void {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * 获取当前重试策略
   * @returns 重试策略配置
   */
  public getRetryStrategy(): { maxRetries: number; retryDelay: number } {
    return {
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
    };
  }

  /**
   * 带重试机制的执行
   * @param operation 操作函数
   * @returns 操作结果
   */
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < this.maxRetries) {
          // 指数退避
          const delay = this.retryDelay * Math.pow(2, attempt);
          await this.delay(delay);
        }
      }
    }

    throw lastError;
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
