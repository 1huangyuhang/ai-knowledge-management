import { DefaultRetryService } from '../../../application/ai/retry/DefaultRetryService';
import { ExponentialBackoffRetryStrategy } from '../../../application/ai/retry/ExponentialBackoffRetryStrategy';
import { LoggerService } from '../../../infrastructure/logging/logger.service';

// 模拟 LoggerService
class MockLogger implements LoggerService {
  debug(message: string, metadata?: Record<string, any>): void {
    console.log(`DEBUG: ${message}`, metadata);
  }
  
  info(message: string, metadata?: Record<string, any>): void {
    console.log(`INFO: ${message}`, metadata);
  }
  
  warn(message: string, metadata?: Record<string, any>): void {
    console.log(`WARN: ${message}`, metadata);
  }
  
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    console.log(`ERROR: ${message}`, error, metadata);
  }
  
  fatal(message: string, error?: Error, metadata?: Record<string, any>): void {
    console.log(`FATAL: ${message}`, error, metadata);
  }
}

describe('DefaultRetryService', () => {
  let retryService: DefaultRetryService;
  let logger: LoggerService;
  
  beforeEach(() => {
    logger = new MockLogger();
    retryService = new DefaultRetryService(logger);
  });
  
  it('should succeed on first attempt', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    const strategy = new ExponentialBackoffRetryStrategy({
      maxRetries: 3,
      initialInterval: 100,
      backoffFactor: 2,
      maxWaitTime: 1000
    });
    
    const result = await retryService.executeWithRetry(mockOperation, strategy);
    
    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });
  
  it('should retry on failure and succeed', async () => {
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');
    
    const strategy = new ExponentialBackoffRetryStrategy({
      maxRetries: 3,
      initialInterval: 100,
      backoffFactor: 2,
      maxWaitTime: 1000
    });
    
    const result = await retryService.executeWithRetry(mockOperation, strategy);
    
    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(3);
  });
  
  it('should fail after max retries', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));
    
    const strategy = new ExponentialBackoffRetryStrategy({
      maxRetries: 3,
      initialInterval: 100,
      backoffFactor: 2,
      maxWaitTime: 1000
    });
    
    await expect(retryService.executeWithRetry(mockOperation, strategy))
      .rejects.toThrow('Persistent failure');
    
    expect(mockOperation).toHaveBeenCalledTimes(4); // 1 initial attempt + 3 retries
  });
});
