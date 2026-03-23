import { ExponentialBackoffRetryStrategy } from '../../../application/ai/retry/ExponentialBackoffRetryStrategy';
import { ApiTimeoutError, ApiServiceUnavailableError } from '../../../infrastructure/ai/api/ApiCallError';

describe('ExponentialBackoffRetryStrategy', () => {
  const config = {
    maxRetries: 3,
    initialInterval: 1000,
    backoffFactor: 2,
    maxWaitTime: 30000
  };
  
  let strategy: ExponentialBackoffRetryStrategy;
  
  beforeEach(() => {
    strategy = new ExponentialBackoffRetryStrategy(config);
  });
  
  describe('getWaitTime', () => {
    it('should return initial interval for first attempt', () => {
      expect(strategy.getWaitTime(1)).toBe(1000);
    });
    
    it('should return exponential backoff time for subsequent attempts', () => {
      expect(strategy.getWaitTime(2)).toBe(2000); // 1000 * 2^(2-1)
      expect(strategy.getWaitTime(3)).toBe(4000); // 1000 * 2^(3-1)
      expect(strategy.getWaitTime(4)).toBe(8000); // 1000 * 2^(4-1)
    });
  });
  
  describe('shouldRetry', () => {
    it('should return true for retryable errors within max retries', () => {
      expect(strategy.shouldRetry(1, new ApiTimeoutError())).toBe(true);
      expect(strategy.shouldRetry(2, new ApiServiceUnavailableError())).toBe(true);
      expect(strategy.shouldRetry(3, new ApiTimeoutError())).toBe(true);
    });
    
    it('should return false when max retries exceeded', () => {
      expect(strategy.shouldRetry(4, new ApiTimeoutError())).toBe(false);
    });
  });
});
