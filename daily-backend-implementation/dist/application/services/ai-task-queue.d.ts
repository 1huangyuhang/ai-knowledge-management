import { AITask } from '../../domain/entities/ai-task';
export declare class AITaskQueue {
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
//# sourceMappingURL=ai-task-queue.d.ts.map