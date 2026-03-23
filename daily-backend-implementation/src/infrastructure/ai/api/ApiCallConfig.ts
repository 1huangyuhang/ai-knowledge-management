/**
 * API 调用配置接口
 */
export interface ApiCallConfig {
  /** API 基础 URL */
  baseUrl: string;
  /** API 密钥 */
  apiKey: string;
  /** 默认超时时间（毫秒） */
  defaultTimeout: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试间隔（毫秒） */
  retryInterval: number;
}

/**
 * API 调用配置默认值
 */
export const DEFAULT_API_CALL_CONFIG: ApiCallConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  defaultTimeout: 30000,
  maxRetries: 3,
  retryInterval: 1000
};
