/**
 * 重试服务接口，提供重试功能
 */
export interface RetryService {
  /**
   * 执行带重试机制的异步操作
   * @param operation 要执行的异步操作
   * @param strategy 重试策略
   * @returns 操作结果
   */
  executeWithRetry<T>(operation: () => Promise<T>, strategy: any): Promise<T>;
}
