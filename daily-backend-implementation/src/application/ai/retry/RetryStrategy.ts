/**
 * 重试策略接口，定义重试逻辑
 */
export interface RetryStrategy {
  /**
   * 获取下一次重试的等待时间（毫秒）
   * @param attempt 当前重试次数（从 1 开始）
   * @returns 等待时间（毫秒）
   */
  getWaitTime(attempt: number): number;
  
  /**
   * 检查是否应该重试
   * @param attempt 当前重试次数（从 1 开始）
   * @param error 错误对象
   * @returns 是否应该重试
   */
  shouldRetry(attempt: number, error: any): boolean;
}
