// src/domain/entities/ai-task.ts
import { UUID } from '../value-objects/uuid';

/**
 * AI任务状态枚举
 */
export enum AITaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * AI任务优先级枚举
 */
export enum AITaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * AI任务类型枚举
 */
export enum AITaskType {
  FILE_PROCESSING = 'file_processing',
  SPEECH_PROCESSING = 'speech_processing',
  COGNITIVE_ANALYSIS = 'cognitive_analysis',
  INSIGHT_GENERATION = 'insight_generation',
  MODEL_UPDATE = 'model_update'
}

/**
 * AI任务实体
 */
export class AITask {
  private _id: UUID;
  private _type: AITaskType;
  private _status: AITaskStatus;
  private _priority: AITaskPriority;
  private _input: Record<string, any>;
  private _output?: Record<string, any>;
  private _error?: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _completedAt?: Date;
  private _userId: UUID;

  constructor(
    props: {
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
    }
  ) {
    this._id = props.id || UUID.create();
    this._type = props.type;
    this._status = props.status || AITaskStatus.PENDING;
    this._priority = props.priority || AITaskPriority.MEDIUM;
    this._input = props.input;
    this._output = props.output;
    this._error = props.error;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._completedAt = props.completedAt;
    this._userId = props.userId;
  }

  // Getters
  get id(): UUID {
    return this._id;
  }

  get type(): AITaskType {
    return this._type;
  }

  get status(): AITaskStatus {
    return this._status;
  }

  get priority(): AITaskPriority {
    return this._priority;
  }

  get input(): Record<string, any> {
    return this._input;
  }

  get output(): Record<string, any> | undefined {
    return this._output;
  }

  get error(): string | undefined {
    return this._error;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get userId(): UUID {
    return this._userId;
  }

  // Setters and methods for changing state
  start(): void {
    this._status = AITaskStatus.IN_PROGRESS;
    this._updatedAt = new Date();
  }

  complete(output: Record<string, any>): void {
    this._status = AITaskStatus.COMPLETED;
    this._output = output;
    this._completedAt = new Date();
    this._updatedAt = new Date();
  }

  fail(error: string): void {
    this._status = AITaskStatus.FAILED;
    this._error = error;
    this._updatedAt = new Date();
  }

  updatePriority(priority: AITaskPriority): void {
    this._priority = priority;
    this._updatedAt = new Date();
  }
}