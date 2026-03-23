import { UUID } from '../value-objects/UUID';
export declare enum AITaskType {
    FILE_PROCESSING = "FILE_PROCESSING",
    SPEECH_PROCESSING = "SPEECH_PROCESSING",
    COGNITIVE_ANALYSIS = "COGNITIVE_ANALYSIS",
    EMBEDDING_GENERATION = "EMBEDDING_GENERATION",
    RELATION_INFERENCE = "RELATION_INFERENCE",
    INSIGHT_GENERATION = "INSIGHT_GENERATION",
    THEME_ANALYSIS = "THEME_ANALYSIS",
    BLINDSPOT_DETECTION = "BLINDSPOT_DETECTION",
    GAP_IDENTIFICATION = "GAP_IDENTIFICATION"
}
export declare enum AITaskPriority {
    URGENT = "urgent",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum AITaskStatus {
    PENDING = "pending",
    RUNNING = "running",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    CANCELLED = "cancelled",
    TIMEOUT = "timeout"
}
export declare class AITask {
    readonly id: UUID;
    type: AITaskType;
    priority: AITaskPriority;
    status: AITaskStatus;
    inputData: Record<string, any>;
    result: Record<string, any> | null;
    error: string | null;
    retryCount: number;
    maxRetries: number;
    readonly createdAt: Date;
    updatedAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    estimatedExecutionTime: number | null;
    actualExecutionTime: number | null;
    userId: UUID | null;
    cognitiveModelId: UUID | null;
    dependsOn: UUID[];
    constructor(props: {
        id?: UUID;
        type: AITaskType;
        priority: AITaskPriority;
        status?: AITaskStatus;
        inputData: Record<string, any>;
        result?: Record<string, any> | null;
        error?: string | null;
        retryCount?: number;
        maxRetries?: number;
        createdAt?: Date;
        updatedAt?: Date;
        startedAt?: Date | null;
        completedAt?: Date | null;
        estimatedExecutionTime?: number | null;
        actualExecutionTime?: number | null;
        userId?: UUID | null;
        cognitiveModelId?: UUID | null;
        dependsOn?: UUID[];
    });
    start(): void;
    succeed(result: Record<string, any>): void;
    fail(error: string): void;
    cancel(): void;
    timeout(): void;
    retry(): void;
    canRetry(): boolean;
}
//# sourceMappingURL=AITask.d.ts.map