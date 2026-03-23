import { ExponentialBackoffConfig } from './ExponentialBackoffRetryStrategy';

/**
 * 重试配置默认值
 */
export const DEFAULT_RETRY_CONFIG: ExponentialBackoffConfig = {
  maxRetries: 3,
  initialInterval: 1000,
  backoffFactor: 2,
  maxWaitTime: 30000
};
