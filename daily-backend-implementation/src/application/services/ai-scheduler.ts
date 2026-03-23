import { injectable, inject } from 'inversify';
import { AITask } from '../../domain/entities/ai-task';
import { AITaskQueue } from './ai-task-queue';
import { AITaskExecutor } from './ai-task-executor';
import { AITaskMonitor } from './ai-task-monitor';
import { AITaskRepository } from '../../domain/repositories/ai-task-repository';
import { ResourceManager } from './ResourceManager';
import { ResourceType } from '../../domain/entities/Resource';

@injectable()
export class AIScheduler {
  constructor(
    @inject(AITaskQueue) private readonly taskQueue: AITaskQueue,
    @inject(AITaskExecutor) private readonly taskExecutor: AITaskExecutor,
    @inject(AITaskMonitor) private readonly taskMonitor: AITaskMonitor,
    @inject(AITaskRepository) private readonly taskRepository: AITaskRepository,
    @inject(ResourceManager) private readonly resourceManager: ResourceManager
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
  public async rescheduleTask(taskId: string, newPriority: AITask['priority']): Promise<AITask> {
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
    task.status = 'CANCELLED';
    task.updatedAt = new Date();
    
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
    
    // 2. 根据任务类型确定所需资源类型
    const resourceType = this.getResourceTypeForTask(task);
    let allocatedResource = null;
    
    try {
      // 3. 尝试分配资源
      allocatedResource = await this.resourceManager.allocateResource(resourceType, 1);
      
      if (!allocatedResource) {
        // 资源不足，将任务重新加入队列
        task.status = 'PENDING';
        task.updatedAt = new Date();
        task.error = '资源不足，任务等待中';
        await this.taskRepository.save(task);
        
        // 将任务重新加入队列，稍后重试
        this.taskQueue.enqueue(task);
        return;
      }
      
      // 4. 更新任务状态为运行中
      task.status = 'RUNNING';
      task.updatedAt = new Date();
      task.metadata = {
        ...task.metadata,
        allocatedResourceId: allocatedResource.id.value,
        allocatedResourceName: allocatedResource.name
      };
      await this.taskRepository.save(task);
      
      // 5. 监控任务执行
      this.taskMonitor.monitorTask(task);
      
      // 6. 执行任务
      const result = await this.taskExecutor.executeTask(task);
      
      // 7. 更新任务状态为成功
      task.status = 'SUCCESS';
      task.result = result;
      task.completedAt = new Date();
      await this.taskRepository.save(task);
      
      // 8. 任务完成回调
      this.taskMonitor.onTaskComplete(task);
    } catch (error: any) {
      // 9. 更新任务状态为失败
      task.status = 'FAILED';
      task.error = error.message;
      task.completedAt = new Date();
      await this.taskRepository.save(task);
      
      // 10. 任务失败回调
      this.taskMonitor.onTaskFailed(task);
    } finally {
      // 11. 释放资源
      if (allocatedResource) {
        await this.resourceManager.releaseResource(allocatedResource.id, 1);
      }
    }
    
    // 12. 继续处理下一个任务
    this.processTaskQueue();
  }
  
  /**
   * 根据任务类型获取所需资源类型
   * @param task AI任务
   * @returns 资源类型
   */
  private getResourceTypeForTask(task: AITask): ResourceType {
    switch (task.type) {
      case 'FILE_PROCESSING':
        return ResourceType.FILE_PROCESSING;
      case 'SPEECH_PROCESSING':
        return ResourceType.SPEECH_PROCESSING;
      case 'COGNITIVE_ANALYSIS':
        return ResourceType.LLM;
      case 'EMBEDDING_GENERATION':
        return ResourceType.EMBEDDING;
      default:
        return ResourceType.LLM;
    }
  }
}