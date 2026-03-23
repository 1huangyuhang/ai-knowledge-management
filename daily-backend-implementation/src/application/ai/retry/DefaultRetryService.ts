import { RetryService } from './RetryService';
import { RetryStrategy } from './RetryStrategy';
import { LoggerService } from '../../../infrastructure/logging/logger.service';

/**
 * 默认重试服务实现
 */
export class DefaultRetryService implements RetryService {
  constructor(private logger: LoggerService) {}
  
  /**
   * 执行带重试机制的异步操作
   * @param operation 要执行的异步操作
   * @param strategy 重试策略
   * @returns 操作结果
   */
  async executeWithRetry<T>(operation: () => Promise<T>, strategy: RetryStrategy): Promise<T> {
    let attempt = 0;
    
    while (true) {
      attempt++;
      
      try {
        this.logger.debug(`Executing operation, attempt ${attempt}`);
        const result = await operation();
        this.logger.debug(`Operation succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        this.logger.debug(`Operation failed on attempt ${attempt}`, { error: error instanceof Error ? error.message : 'Unknown error' });
        
        // 检查是否应该重试
        if (!strategy.shouldRetry(attempt, error)) {
          this.logger.debug(`Retries exhausted, giving up after ${attempt} attempts`);
          throw error;
        }
        
        // 计算等待时间
        const waitTime = strategy.getWaitTime(attempt);
        this.logger.debug(`Waiting ${waitTime}ms before next retry`);
        
        // 等待
        await this.wait(waitTime);
      }
    }
  }
  
  /**
   * 等待指定时间
   * @param ms 等待时间（毫秒）
   * @returns Promise
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
