import { AITask } from '../../domain/entities/AITask';
export interface IAITaskMonitor {
    monitorTask(task: AITask): void;
    onTaskComplete(task: AITask): void;
    onTaskFailed(task: AITask): void;
    onTaskTimeout(task: AITask): void;
    retryTask(task: AITask): Promise<boolean>;
}
export declare class AITaskMonitor implements IAITaskMonitor {
    private readonly maxRetries;
    private readonly taskTimeouts;
    private readonly taskRetryCounts;
    private readonly timeoutDuration;
    monitorTask(task: AITask): void;
    onTaskComplete(task: AITask): void;
    onTaskFailed(task: AITask): void;
    onTaskTimeout(task: AITask): void;
    retryTask(task: AITask): Promise<boolean>;
    private clearTaskMonitoring;
}
//# sourceMappingURL=AITaskMonitor.d.ts.map