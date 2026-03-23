/**
 * AI任务监控服务
 * 监控任务执行状态，处理任务超时和失败重试
 */
import { injectable } from 'inversify';
import { AITask } from '../../domain/entities/AITask';

export interface IAITaskMonitor {
  /**
   * 监控任务
   * @param task AI任务
   */
  monitorTask(task: AITask): void;

  /**
   * 任务完成回调
   * @param task AI任务
   */
  onTaskComplete(task: AITask): void;

  /**
   * 任务失败回调
   * @param task AI任务
   */
  onTaskFailed(task: AITask): void;

  /**
   * 任务超时回调
   * @param task AI任务
   */
  onTaskTimeout(task: AITask): void;

  /**
   * 重试任务
   * @param task AI任务
   * @returns 重试结果
   */
  retryTask(task: AITask): Promise<boolean>;
}

@injectable()
export class AITaskMonitor implements IAITaskMonitor {
  private readonly maxRetries = 3;
  private readonly taskTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly taskRetryCounts = new Map<string, number>();
  private readonly timeoutDuration = 300000; // 5分钟

  /**
   * 监控任务
   * @param task AI任务
   */
  public monitorTask(task: AITask): void {
    // 设置任务超时监控
    const timeoutId = setTimeout(() => {
      this.onTaskTimeout(task);
    }, this.timeoutDuration);

    this.taskTimeouts.set(task.id, timeoutId);
  }

  /**
   * 任务完成回调
   * @param task AI任务
   */
  public onTaskComplete(task: AITask): void {
    // 清除超时监控
    this.clearTaskMonitoring(task.id);
    console.log(`任务完成: ${task.id} - ${task.type}`);
    // 可以在这里添加任务完成后的后续处理逻辑
  }

  /**
   * 任务失败回调
   * @param task AI任务
   */
  public onTaskFailed(task: AITask): void {
    // 清除超时监控
    this.clearTaskMonitoring(task.id);
    console.error(`任务失败: ${task.id} - ${task.type} - ${task.error}`);
    
    // 尝试重试任务
    this.retryTask(task).catch(error => {
      console.error(`任务重试失败: ${task.id} - ${error.message}`);
    });
  }

  /**
   * 任务超时回调
   * @param task AI任务
   */
  public onTaskTimeout(task: AITask): void {
    // 清除超时监控
    this.clearTaskMonitoring(task.id);
    console.error(`任务超时: ${task.id} - ${task.type}`);
    
    // 尝试重试任务
    this.retryTask(task).catch(error => {
      console.error(`任务超时后重试失败: ${task.id} - ${error.message}`);
    });
  }

  /**
   * 重试任务
   * @param task AI任务
   * @returns 重试结果
   */
  public async retryTask(task: AITask): Promise<boolean> {
    const retryCount = this.taskRetryCounts.get(task.id) || 0;
    
    if (retryCount >= this.maxRetries) {
      console.error(`任务达到最大重试次数: ${task.id} - ${task.type}`);
      return false;
    }
    
    this.taskRetryCounts.set(task.id, retryCount + 1);
    
    console.log(`任务重试: ${task.id} - ${task.type} (第${retryCount + 1}次)`);
    
    // TODO: 实现任务重试逻辑
    // 这里需要重新将任务加入调度队列
    
    return true;
  }

  /**
   * 清除任务监控
   * @param taskId 任务ID
   */
  private clearTaskMonitoring(taskId: string): void {
    // 清除超时定时器
    const timeoutId = this.taskTimeouts.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.taskTimeouts.delete(taskId);
    }
    
    // 清除重试计数
    this.taskRetryCounts.delete(taskId);
  }
}