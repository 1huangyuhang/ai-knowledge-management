import { LLMRequest, LLMResponse } from '../../../application/services/llm/LLMClient';

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
