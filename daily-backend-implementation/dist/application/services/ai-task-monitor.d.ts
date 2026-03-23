import { AITask } from '../../domain/entities/ai-task';
export declare class AITaskMonitor {
    private readonly taskTimers;
    private readonly MAX_EXECUTION_TIME;
    private readonly MAX_RETRIES;
    monitorTask(task: AITask): void;
    onTaskComplete(task: AITask): void;
    onTaskFailed(task: AITask): void;
    onTaskTimeout(task: AITask): void;
    canRetry(task: AITask): boolean;
    private clearTaskTimer;
}
//# sourceMappingURL=ai-task-monitor.d.ts.map