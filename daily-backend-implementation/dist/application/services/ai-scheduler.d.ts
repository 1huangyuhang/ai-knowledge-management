import { AITask } from '../../domain/entities/ai-task';
import { AITaskQueue } from './ai-task-queue';
import { AITaskExecutor } from './ai-task-executor';
import { AITaskMonitor } from './ai-task-monitor';
import { AITaskRepository } from '../../domain/repositories/ai-task-repository';
import { ResourceManager } from './ResourceManager';
export declare class AIScheduler {
    private readonly taskQueue;
    private readonly taskExecutor;
    private readonly taskMonitor;
    private readonly taskRepository;
    private readonly resourceManager;
    constructor(taskQueue: AITaskQueue, taskExecutor: AITaskExecutor, taskMonitor: AITaskMonitor, taskRepository: AITaskRepository, resourceManager: ResourceManager);
    scheduleTask(task: AITask): Promise<AITask>;
    rescheduleTask(taskId: string, newPriority: AITask['priority']): Promise<AITask>;
    cancelTask(taskId: string): Promise<AITask>;
    processTaskQueue(): Promise<void>;
    private getResourceTypeForTask;
}
//# sourceMappingURL=ai-scheduler.d.ts.map