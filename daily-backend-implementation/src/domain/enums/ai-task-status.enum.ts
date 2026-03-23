/**
 * AI任务状态枚举
 * 定义AI任务的不同状态
 */
export enum AiTaskStatus {
  /** 任务待处理 */
  PENDING = 'pending',
  /** 任务正在执行 */
  IN_PROGRESS = 'in_progress',
  /** 任务执行成功 */
  SUCCEEDED = 'succeeded',
  /** 任务执行失败 */
  FAILED = 'failed',
  /** 任务已取消 */
  CANCELLED = 'cancelled',
  /** 任务超时 */
  TIMED_OUT = 'timed_out',
  /** 任务重试中 */
  RETRYING = 'retrying'
}