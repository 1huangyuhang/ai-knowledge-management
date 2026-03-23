import { injectable } from 'inversify';
import { AITask } from '../../domain/entities/ai-task';

@injectable()
export class AITaskMonitor {
  private readonly taskTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly MAX_EXECUTION_TIME = 300000; // 5分钟
  private readonly MAX_RETRIES = 3;

  /**
   * 监控任务
   * @param task AI任务
   */
  public monitorTask(task: AITask): void {
    // 设置任务超时计时器
    const timer = setTimeout(() => {
      this.onTaskTimeout(task);
    }, this.MAX_EXECUTION_TIME);

    this.taskTimers.set(task.id, timer);
  }

  /**
   * 任务完成回调
   * @param task AI任务
   */
  public onTaskComplete(task: AITask): void {
    // 清除任务超时计时器
    this.clearTaskTimer(task.id);
    // TODO: 实现任务完成后的处理逻辑
    console.log(`Task completed: ${task.id}`);
  }

  /**
   * 任务失败回调
   * @param task AI任务
   */
  public onTaskFailed(task: AITask): void {
    // 清除任务超时计时器
    this.clearTaskTimer(task.id);
    // TODO: 实现任务失败后的处理逻辑
    console.error(`Task failed: ${task.id}, Error: ${task.error}`);
  }

  /**
   * 任务超时回调
   * @param task AI任务
   */
  public onTaskTimeout(task: AITask): void {
    // 清除任务超时计时器
    this.clearTaskTimer(task.id);
    // TODO: 实现任务超时后的处理逻辑
    console.error(`Task timed out: ${task.id}`);
  }

  /**
   * 重试任务
   * @param task AI任务
   * @returns 是否可以重试
   */
  public canRetry(task: AITask): boolean {
    if (!task.retries) {
      task.retries = 0;
    }
    return task.retries < this.MAX_RETRIES;
  }

  /**
   * 清除任务超时计时器
   * @param taskId 任务ID
   */
  private clearTaskTimer(taskId: string): void {
    const timer = this.taskTimers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.taskTimers.delete(taskId);
    }
  }
}