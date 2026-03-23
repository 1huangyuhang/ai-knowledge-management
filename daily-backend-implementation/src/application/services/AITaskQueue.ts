/**
 * AI任务队列服务
 * 管理任务队列，实现优先级排序和队列管理
 */
import { injectable } from 'inversify';
import { AITask } from '../../domain/entities/AITask';

export interface IAITaskQueue {
  /**
   * 将任务加入队列
   * @param task AI任务
   */
  enqueue(task: AITask): void;

  /**
   * 获取下一个要执行的任务
   * @returns AI任务或undefined
   */
  dequeue(): AITask | undefined;

  /**
   * 查看队列头部任务
   * @returns AI任务或undefined
   */
  peek(): AITask | undefined;

  /**
   * 从队列中移除任务
   * @param taskId 任务ID
   */
  remove(taskId: string): void;

  /**
   * 获取队列大小
   * @returns 队列大小
   */
  size(): number;

  /**
   * 清空队列
   */
  clear(): void;
}

@injectable()
export class AITaskQueue implements IAITaskQueue {
  private readonly queue: AITask[] = [];
  private readonly priorityOrder: Record<string, number> = {
    'URGENT': 0,
    'HIGH': 1,
    'MEDIUM': 2,
    'LOW': 3
  };

  /**
   * 将任务加入队列
   * @param task AI任务
   */
  public enqueue(task: AITask): void {
    this.queue.push(task);
    this.sortQueue();
  }

  /**
   * 获取下一个要执行的任务
   * @returns AI任务或undefined
   */
  public dequeue(): AITask | undefined {
    return this.queue.shift();
  }

  /**
   * 查看队列头部任务
   * @returns AI任务或undefined
   */
  public peek(): AITask | undefined {
    return this.queue[0];
  }

  /**
   * 从队列中移除任务
   * @param taskId 任务ID
   */
  public remove(taskId: string): void {
    const index = this.queue.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * 获取队列大小
   * @returns 队列大小
   */
  public size(): number {
    return this.queue.length;
  }

  /**
   * 清空队列
   */
  public clear(): void {
    this.queue.length = 0;
  }

  /**
   * 根据优先级排序队列
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // 首先按优先级排序
      const priorityCompare = this.priorityOrder[a.priority] - this.priorityOrder[b.priority];
      if (priorityCompare !== 0) {
        return priorityCompare;
      }
      
      // 优先级相同则按创建时间排序（先进先出）
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }
}