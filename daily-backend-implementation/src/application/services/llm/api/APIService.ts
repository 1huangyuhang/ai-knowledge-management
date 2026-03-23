import { APICaller } from './APICaller';

/**
 * API服务接口
 * 封装应用层的API调用业务逻辑
 */
export interface APIService {
  /**
   * 执行LLM请求
   * @param endpoint API端点
   * @param body 请求体
   * @param params 请求参数
   * @returns API响应
   */
  executeLLMRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T>;

  /**
   * 执行Embedding请求
   * @param endpoint API端点
   * @param body 请求体
   * @param params 请求参数
   * @returns API响应
   */
  executeEmbeddingRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T>;

  /**
   * 健康检查
   * @returns 是否健康
   */
  healthCheck(): boolean;
}

/**
 * API服务实现
 */
export class APIServiceImpl implements APIService {
  private readonly apiCaller: APICaller;

  /**
   * 创建API服务实例
   * @param apiCaller API调用器
   */
  constructor(apiCaller: APICaller) {
    this.apiCaller = apiCaller;
  }

  /**
   * 执行LLM请求
   * @param endpoint API端点
   * @param body 请求体
   * @param params 请求参数
   * @returns API响应
   */
  public async executeLLMRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.apiCaller.post<T>(endpoint, body, params);
      return response.body;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 执行Embedding请求
   * @param endpoint API端点
   * @param body 请求体
   * @param params 请求参数
   * @returns API响应
   */
  public async executeEmbeddingRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.apiCaller.post<T>(endpoint, body, params);
      return response.body;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 健康检查
   * @returns 是否健康
   */
  public healthCheck(): boolean {
    return this.apiCaller.healthCheck();
  }
}
