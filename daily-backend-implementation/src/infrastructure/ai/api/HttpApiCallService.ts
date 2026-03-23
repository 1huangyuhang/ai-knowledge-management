import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { LLMRequest, LLMResponse } from '../../../application/services/llm/LLMClient';
import { ApiCallService } from './ApiCallService';
import { LoggerService } from '../../../infrastructure/logging/logger.service';

/**
 * HTTP API 调用服务实现，使用 Axios 发送 HTTP 请求
 */
export class HttpApiCallService implements ApiCallService {
  private axiosInstance: AxiosInstance;
  private logger: LoggerService;
  
  /**
   * 构造函数
   * @param baseUrl API 基础 URL
   * @param apiKey API 密钥
   * @param logger 日志记录器
   * @param defaultTimeout 默认超时时间（毫秒）
   */
  constructor(
    baseUrl: string,
    apiKey: string,
    logger: LoggerService,
    private defaultTimeout: number = 30000
  ) {
    this.logger = logger;
    
    // 创建 Axios 实例
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: defaultTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    // 添加请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`Sending request to ${config.url}`, { method: config.method });
        return config;
      },
      (error) => {
        this.logger.error('Request configuration error', { error: error.message });
        return Promise.reject(error);
      }
    );
    
    // 添加响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`Received response from ${response.config.url}`, { status: response.status });
        return response;
      },
      (error) => {
        this.logger.error('Response error', { 
          error: error.message, 
          status: error.response?.status, 
          data: error.response?.data 
        });
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * 发送 API 请求
   * @param request LLM 请求对象
   * @returns LLM 响应对象
   */
  async sendRequest(request: LLMRequest): Promise<LLMResponse> {
    return this.sendRequestWithTimeout(request, this.defaultTimeout);
  }
  
  /**
   * 发送带超时的 API 请求
   * @param request LLM 请求对象
   * @param timeoutMs 超时时间（毫秒）
   * @returns LLM 响应对象
   */
  async sendRequestWithTimeout(request: LLMRequest, timeoutMs: number): Promise<LLMResponse> {
    try {
      const config: AxiosRequestConfig = {
        url: '/chat/completions',
        method: 'POST',
        data: {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          top_p: request.topP,
          frequency_penalty: request.frequencyPenalty,
          presence_penalty: request.presencePenalty,
          stream: request.stream
        },
        timeout: timeoutMs
      };
      
      const response: AxiosResponse = await this.axiosInstance(config);
      
      return this.mapResponse(response.data);
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  /**
   * 检查 API 服务状态
   * @returns API 服务是否可用
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      this.logger.error('API health check failed', { error: error.message });
      return false;
    }
  }
  
  /**
   * 映射 API 响应到 LLMResponse 对象
   * @param data API 响应数据
   * @returns LLMResponse 对象
   */
  private mapResponse(data: any): LLMResponse {
    return {
      id: data.id,
      object: data.object,
      created: data.created,
      model: data.model,
      choices: data.choices.map((choice: any) => ({
        index: choice.index,
        message: {
          role: choice.message.role,
          content: choice.message.content
        },
        finishReason: choice.finish_reason
      })),
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  }
  
  /**
   * 处理 API 错误
   * @param error 错误对象
   */
  private handleApiError(error: any): void {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        this.logger.error('API request timed out');
      } else if (error.response) {
        this.logger.error('API returned an error', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        this.logger.error('No response received from API');
      }
    } else {
      this.logger.error('Unexpected API error', { error: error.message });
    }
  }
}
