import { ApiCallService } from './ApiCallService';
import { LLMRequest, LLMResponse } from '../../../application/services/llm/LLMClient';
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
