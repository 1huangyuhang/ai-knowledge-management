import { AITask } from '../../domain/entities/AITask';
import { AITaskQueue } from './AITaskQueue';
import { AITaskExecutor } from './AITaskExecutor';
import { AITaskMonitor } from './AITaskMonitor';
import { AITaskRepository } from '../../infrastructure/repositories/AITaskRepository';
export interface IAIScheduler {
    scheduleTask(task: AITask): Promise<AITask>;
    rescheduleTask(taskId: string, newPriority: string): Promise<AITask>;
    cancelTask(taskId: string): Promise<AITask>;
    processTaskQueue(): Promise<void>;
}
export declare class AIScheduler implements IAIScheduler {
    private readonly taskQueue;
    private readonly taskExecutor;
    private readonly taskMonitor;
    private readonly taskRepository;
    constructor(taskQueue: AITaskQueue, taskExecutor: AITaskExecutor, taskMonitor: AITaskMonitor, taskRepository: AITaskRepository);
    scheduleTask(task: AITask): Promise<AITask>;
    rescheduleTask(taskId: string, newPriority: string): Promise<AITask>;
    cancelTask(taskId: string): Promise<AITask>;
    processTaskQueue(): Promise<void>;
}
//# sourceMappingURL=AIScheduler.d.ts.map