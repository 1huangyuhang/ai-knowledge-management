/**
 * API 调用异常类
 */
export class ApiCallError extends Error {
  /**
   * API 状态码（如果有）
   */
  public statusCode?: number;
  
  /**
   * API 错误数据（如果有）
   */
  public errorData?: any;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param statusCode API 状态码
   * @param errorData API 错误数据
   */
  constructor(message: string, statusCode?: number, errorData?: any) {
    super(message);
    this.name = 'ApiCallError';
    this.statusCode = statusCode;
    this.errorData = errorData;
  }
}

/**
 * API 超时异常类
 */
export class ApiTimeoutError extends ApiCallError {
  /**
   * 构造函数
   * @param message 错误消息
   */
  constructor(message: string = 'API request timed out') {
    super(message);
    this.name = 'ApiTimeoutError';
  }
}

/**
 * API 服务不可用异常类
 */
export class ApiServiceUnavailableError extends ApiCallError {
  /**
   * 构造函数
   * @param message 错误消息
   */
  constructor(message: string = 'API service is unavailable') {
    super(message);
    this.name = 'ApiServiceUnavailableError';
  }
}
