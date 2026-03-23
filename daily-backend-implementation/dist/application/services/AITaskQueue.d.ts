import { AITask } from '../../domain/entities/AITask';
export interface IAITaskQueue {
    enqueue(task: AITask): void;
    dequeue(): AITask | undefined;
    peek(): AITask | undefined;
    remove(taskId: string): void;
    size(): number;
    clear(): void;
}
export declare class AITaskQueue implements IAITaskQueue {
    private readonly queue;
    private readonly priorityOrder;
    enqueue(task: AITask): void;
    dequeue(): AITask | undefined;
    peek(): AITask | undefined;
    remove(taskId: string): void;
    size(): number;
    clear(): void;
    private sortQueue;
}
//# sourceMappingURL=AITaskQueue.d.ts.map