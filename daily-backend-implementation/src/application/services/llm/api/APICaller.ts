/**
 * API调用配置
 */
export interface APICallerConfig {
  /**
   * 最大重试次数
   */
  maxRetries?: number;
  /**
   * 重试延迟（毫秒）
   */
  retryDelay?: number;
  /**
   * 请求超时时间（毫秒）
   */
  timeout?: number;
}

/**
 * API调用请求
 */
export interface APICallRequest {
  /**
   * API端点
   */
  endpoint: string;
  /**
   * 请求方法
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /**
   * 请求体
   */
  body?: any;
  /**
   * 请求头
   */
  headers?: Record<string, string>;
  /**
   * 请求参数
   */
  params?: Record<string, any>;
}

/**
 * API调用响应
 */
export interface APICallResponse<T = any> {
  /**
   * 状态码
   */
  statusCode: number;
  /**
   * 响应体
   */
  body: T;
  /**
   * 响应头
   */
  headers: Record<string, string>;
  /**
   * 请求耗时（毫秒）
   */
  latency: number;
}

/**
 * API调用错误
 */
export interface APICallError {
  /**
   * 错误信息
   */
  message: string;
  /**
   * 状态码
   */
  statusCode?: number;
  /**
   * 错误类型
   */
  type: string;
  /**
   * 原始错误
   */
  originalError?: any;
}

/**
 * API调用器接口
 */
export interface APICaller {
  /**
   * 执行API调用
   * @param request API调用请求
   * @returns API调用响应
   */
  call<T = any>(request: APICallRequest): Promise<APICallResponse<T>>;

  /**
   * 执行GET请求
   * @param endpoint API端点
   * @param params 请求参数
   * @param headers 请求头
   * @returns API调用响应
   */
  get<T = any>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;

  /**
   * 执行POST请求
   * @param endpoint API端点
   * @param body 请求体
   * @param params 请求参数
   * @param headers 请求头
   * @returns API调用响应
   */
  post<T = any>(endpoint: string, body?: any, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;

  /**
   * 执行PUT请求
   * @param endpoint API端点
   * @param body 请求体
   * @param params 请求参数
   * @param headers 请求头
   * @returns API调用响应
   */
  put<T = any>(endpoint: string, body?: any, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;

  /**
   * 执行DELETE请求
   * @param endpoint API端点
   * @param params 请求参数
   * @param headers 请求头
   * @returns API调用响应
   */
  delete<T = any>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;

  /**
   * 获取当前配置
   * @returns API调用配置
   */
  getConfig(): APICallerConfig;

  /**
   * 健康检查
   * @returns 是否健康
   */
  healthCheck(): boolean;
}
