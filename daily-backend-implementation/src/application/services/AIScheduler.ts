/**
 * AI调度器服务
 * 负责管理和调度所有AI任务
 */
import { injectable, inject } from 'inversify';
import { AITask } from '../../domain/entities/AITask';
import { AITaskQueue } from './AITaskQueue';
import { AITaskExecutor } from './AITaskExecutor';
import { AITaskMonitor } from './AITaskMonitor';
import { AITaskRepository } from '../../infrastructure/repositories/AITaskRepository';

export interface IAIScheduler {
  /**
   * 调度新任务
   * @param task AI任务
   * @returns 调度结果
   */
  scheduleTask(task: AITask): Promise<AITask>;

  /**
   * 重新调度任务
   * @param taskId 任务ID
   * @param newPriority 新优先级
   * @returns 更新后的任务
   */
  rescheduleTask(taskId: string, newPriority: string): Promise<AITask>;

  /**
   * 取消任务
   * @param taskId 任务ID
   * @returns 取消结果
   */
  cancelTask(taskId: string): Promise<AITask>;

  /**
   * 处理任务队列
   */
  processTaskQueue(): Promise<void>;
}

@injectable()
export class AIScheduler implements IAIScheduler {
  constructor(
    @inject(AITaskQueue) private readonly taskQueue: AITaskQueue,
    @inject(AITaskExecutor) private readonly taskExecutor: AITaskExecutor,
    @inject(AITaskMonitor) private readonly taskMonitor: AITaskMonitor,
    @inject(AITaskRepository) private readonly taskRepository: AITaskRepository
  ) {}

  /**
   * 调度新任务
   * @param task AI任务
   * @returns 调度结果
   */
  public async scheduleTask(task: AITask): Promise<AITask> {
    // 1. 保存任务到数据库
    const savedTask = await this.taskRepository.save(task);
    
    // 2. 将任务加入队列
    this.taskQueue.enqueue(savedTask);
    
    // 3. 启动任务处理
    this.processTaskQueue();
    
    return savedTask;
  }

  /**
   * 重新调度任务
   * @param taskId 任务ID
   * @param newPriority 新优先级
   * @returns 更新后的任务
   */
  public async rescheduleTask(taskId: string, newPriority: string): Promise<AITask> {
    // 1. 从数据库获取任务
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }
    
    // 2. 更新任务优先级
    task.priority = newPriority;
    task.updatedAt = new Date();
    
    // 3. 保存更新后的任务
    const updatedTask = await this.taskRepository.save(task);
    
    // 4. 如果任务处于待执行状态，重新加入队列
    if (task.status === 'PENDING') {
      this.taskQueue.remove(taskId);
      this.taskQueue.enqueue(updatedTask);
    }
    
    return updatedTask;
  }

  /**
   * 取消任务
   * @param taskId 任务ID
   * @returns 取消结果
   */
  public async cancelTask(taskId: string): Promise<AITask> {
    // 1. 从数据库获取任务
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }
    
    // 2. 更新任务状态为取消
    task.cancel();
    
    // 3. 保存更新后的任务
    const cancelledTask = await this.taskRepository.save(task);
    
    // 4. 从队列中移除任务
    this.taskQueue.remove(taskId);
    
    return cancelledTask;
  }

  /**
   * 处理任务队列
   */
  public async processTaskQueue(): Promise<void> {
    // 1. 获取下一个要执行的任务
    const task = this.taskQueue.dequeue();
    if (!task) {
      return;
    }
    
    // 2. 更新任务状态为运行中
    task.start();
    await this.taskRepository.save(task);
    
    // 3. 监控任务执行
    this.taskMonitor.monitorTask(task);
    
    try {
      // 4. 执行任务
      const result = await this.taskExecutor.executeTask(task);
      
      // 5. 更新任务状态为成功
      task.succeed(result);
      await this.taskRepository.save(task);
      
      // 6. 任务完成回调
      this.taskMonitor.onTaskComplete(task);
    } catch (error: any) {
      // 7. 更新任务状态为失败
      task.fail(error.message);
      await this.taskRepository.save(task);
      
      // 8. 任务失败回调
      this.taskMonitor.onTaskFailed(task);
    }
    
    // 9. 继续处理下一个任务
    this.processTaskQueue();
  }
}