import { UUID } from '../value-objects/uuid';
export declare enum AITaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum AITaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum AITaskType {
    FILE_PROCESSING = "file_processing",
    SPEECH_PROCESSING = "speech_processing",
    COGNITIVE_ANALYSIS = "cognitive_analysis",
    INSIGHT_GENERATION = "insight_generation",
    MODEL_UPDATE = "model_update"
}
export declare class AITask {
    private _id;
    private _type;
    private _status;
    private _priority;
    private _input;
    private _output?;
    private _error?;
    private _createdAt;
    private _updatedAt;
    private _completedAt?;
    private _userId;
    constructor(props: {
        id?: UUID;
        type: AITaskType;
        status?: AITaskStatus;
        priority?: AITaskPriority;
        input: Record<string, any>;
        output?: Record<string, any>;
        error?: string;
        createdAt?: Date;
        updatedAt?: Date;
        completedAt?: Date;
        userId: UUID;
    });
    get id(): UUID;
    get type(): AITaskType;
    get status(): AITaskStatus;
    get priority(): AITaskPriority;
    get input(): Record<string, any>;
    get output(): Record<string, any> | undefined;
    get error(): string | undefined;
    get createdAt(): Date;
    get updatedAt(): Date;
    get completedAt(): Date | undefined;
    get userId(): UUID;
    start(): void;
    complete(output: Record<string, any>): void;
    fail(error: string): void;
    updatePriority(priority: AITaskPriority): void;
}
//# sourceMappingURL=ai-task.d.ts.map