import { AITaskStatus, AITaskPriority, AITaskType } from '../../../domain/entities/AITask';
export declare class AITaskEntity {
    id: string;
    type: AITaskType;
    priority: AITaskPriority;
    status: AITaskStatus;
    inputData: Record<string, any>;
    result: Record<string, any> | null;
    error: string | null;
    retryCount: number;
    maxRetries: number;
    createdAt: Date;
    updatedAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    estimatedExecutionTime: number | null;
    actualExecutionTime: number | null;
    userId: string | null;
    cognitiveModelId: string | null;
    dependsOn: string[];
}
//# sourceMappingURL=ai-task.entity.d.ts.map