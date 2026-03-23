import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { APICaller, APICallerConfig, APICallRequest, APICallResponse, APICallError } from '../../../application/services/llm/api/APICaller';
import { LoggerService } from '../../logging/logger.service';
import { ErrorHandler } from '../../error/error-handler';

/**
 * API调用器实现
 */
export class APICallerImpl implements APICaller {
  private readonly axiosInstance: AxiosInstance;
  private readonly config: APICallerConfig;
  private readonly logger: LoggerService;
  private readonly errorHandler: ErrorHandler;

  /**
   * 创建API调用器
   * @param config API调用器配置
   * @param logger 日志系统
   * @param errorHandler 错误处理器
   */
  constructor(
    config: APICallerConfig,
    logger: LoggerService,
    errorHandler: ErrorHandler
  ) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...config,
    };

    this.logger = logger;
    this.errorHandler = errorHandler;

    // 创建Axios实例
    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 执行API调用
   * @param request API调用请求
   * @returns API调用响应
   */
  public async call<T = any>(request: APICallRequest): Promise<APICallResponse<T>> {
    const retryConfig = {
      retries: 0,
      maxRetries: this.config.maxRetries!,
      retryDelay: this.config.retryDelay!,
    };

    return this.callWithRetry<T>(request, retryConfig);
  }

  /**
   * 带重试机制的API调用
   * @param request API调用请求
   * @param retryConfig 重试配置
   * @returns API调用响应
   */
  private async callWithRetry<T = any>(
    request: APICallRequest,
    retryConfig: { retries: number; maxRetries: number; retryDelay: number }
  ): Promise<APICallResponse<T>> {
    try {
      this.logger.info('Executing API call', {
        endpoint: request.endpoint,
        method: request.method || 'GET',
        attempt: retryConfig.retries + 1,
      });

      const startTime = Date.now();
      
      // 准备Axios请求配置
      const axiosConfig: AxiosRequestConfig = {
        url: request.endpoint,
        method: request.method || 'GET',
        data: request.body,
        headers: request.headers,
        params: request.params,
      };

      // 执行请求
      const response: AxiosResponse<T> = await this.axiosInstance.request(axiosConfig);
      
      const endTime = Date.now();
      const latency = endTime - startTime;

      this.logger.info('API call successful', {
        endpoint: request.endpoint,
        method: request.method || 'GET',
        statusCode: response.status,
        latency,
      });

      // 转换为统一响应格式
      return {
        statusCode: response.status,
        body: response.data,
        headers: this.convertHeaders(response.headers),
        latency,
      };
    } catch (error: any) {
      this.logger.error('API call failed', {
        endpoint: request.endpoint,
        method: request.method || 'GET',
        error: error.message,
        attempt: retryConfig.retries + 1,
        maxRetries: retryConfig.maxRetries,
      });

      // 检查是否需要重试
      if (retryConfig.retries < retryConfig.maxRetries) {
        // 指数退避
        const delay = retryConfig.retryDelay * Math.pow(2, retryConfig.retries);
        this.logger.info(`Retrying API call in ${delay}ms`, {
          endpoint: request.endpoint,
          method: request.method || 'GET',
          attempt: retryConfig.retries + 1,
          maxRetries: retryConfig.maxRetries,
        });

        await this.delay(delay);
        return this.callWithRetry<T>(request, {
          ...retryConfig,
          retries: retryConfig.retries + 1,
        });
      }

      // 重试次数耗尽，抛出错误
      const apiError: APICallError = {
        message: error.message || 'API call failed',
        statusCode: error.response?.status,
        type: error.code || 'api_error',
        originalError: error,
      };

      this.errorHandler.handle(error, { context: 'api-call' });
      throw apiError;
    }
  }

  /**
   * 执行GET请求
   * @param endpoint API端点
   * @param params 请求参数
   * @param headers 请求头
   * @returns API调用响应
   */
  public async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<APICallResponse<T>> {
    return this.call<T>({
      endpoint,
      method: 'GET',
      params,
      headers,
    });
  }

  /**
   * 执行POST请求
   * @param endpoint API端点
   * @param body 请求体
   * @param params 请求参数
   * @param headers 请求头
   * @returns API调用响应
   */
  public async post<T = any>(
    endpoint: string,
    body?: any,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<APICallResponse<T>> {
    return this.call<T>({
      endpoint,
      method: 'POST',
      body,
      params,
      headers,
    });
  }

  /**
   * 执行PUT请求
   * @param endpoint API端点
   * @param body 请求体
   * @param params 请求参数
   * @param headers 请求头
   * @returns API调用响应
   */
  public async put<T = any>(
    endpoint: string,
    body?: any,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<APICallResponse<T>> {
    return this.call<T>({
      endpoint,
      method: 'PUT',
      body,
      params,
      headers,
    });
  }

  /**
   * 执行DELETE请求
   * @param endpoint API端点
   * @param params 请求参数
   * @param headers 请求头
   * @returns API调用响应
   */
  public async delete<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<APICallResponse<T>> {
    return this.call<T>({
      endpoint,
      method: 'DELETE',
      params,
      headers,
    });
  }

  /**
   * 获取当前配置
   * @returns API调用配置
   */
  public getConfig(): APICallerConfig {
    return this.config;
  }

  /**
   * 健康检查
   * @returns 是否健康
   */
  public healthCheck(): boolean {
    return !!this.axiosInstance;
  }

  /**
   * 延迟函数
   * @param ms 延迟毫秒数
   * @returns Promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 转换Axios响应头为标准格式
   * @param headers Axios响应头
   * @returns 标准响应头格式
   */
  private convertHeaders(headers: any): Record<string, string> {
    const convertedHeaders: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        convertedHeaders[key] = value;
      } else if (value !== undefined && value !== null) {
        convertedHeaders[key] = String(value);
      }
    }
    
    return convertedHeaders;
  }
}
