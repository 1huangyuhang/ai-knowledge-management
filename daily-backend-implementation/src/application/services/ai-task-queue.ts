import { injectable } from 'inversify';
import { AITask } from '../../domain/entities/ai-task';
import { AITaskPriority } from '../../domain/entities/ai-task';

@injectable()
export class AITaskQueue {
  private readonly queue: AITask[] = [];
  private readonly priorityOrder: Record<AITaskPriority, number> = {
    [AITaskPriority.URGENT]: 0,
    [AITaskPriority.HIGH]: 1,
    [AITaskPriority.MEDIUM]: 2,
    [AITaskPriority.LOW]: 3
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