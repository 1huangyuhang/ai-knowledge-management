/**
 * AI任务实体
 * 表示一个需要执行的AI任务
 */
import { UUID } from '../value-objects/UUID';

/**
 * 任务类型枚举
 */
export enum AITaskType {
  /** 文件处理任务 */
  FILE_PROCESSING = 'FILE_PROCESSING',
  /** 语音处理任务 */
  SPEECH_PROCESSING = 'SPEECH_PROCESSING',
  /** 认知分析任务 */
  COGNITIVE_ANALYSIS = 'COGNITIVE_ANALYSIS',
  /** 嵌入生成任务 */
  EMBEDDING_GENERATION = 'EMBEDDING_GENERATION',
  /** 关系推断任务 */
  RELATION_INFERENCE = 'RELATION_INFERENCE',
  /** 洞察生成任务 */
  INSIGHT_GENERATION = 'INSIGHT_GENERATION',
  /** 主题分析任务 */
  THEME_ANALYSIS = 'THEME_ANALYSIS',
  /** 盲点检测任务 */
  BLINDSPOT_DETECTION = 'BLINDSPOT_DETECTION',
  /** 差距识别任务 */
  GAP_IDENTIFICATION = 'GAP_IDENTIFICATION'
}

/**
 * 任务优先级枚举
 */
export enum AITaskPriority {
  /** 紧急 */
  URGENT = 'urgent',
  /** 高 */
  HIGH = 'high',
  /** 中 */
  MEDIUM = 'medium',
  /** 低 */
  LOW = 'low'
}

/**
 * 任务状态枚举
 */
export enum AITaskStatus {
  /** 待执行 */
  PENDING = 'pending',
  /** 运行中 */
  RUNNING = 'running',
  /** 成功 */
  SUCCEEDED = 'succeeded',
  /** 失败 */
  FAILED = 'failed',
  /** 取消 */
  CANCELLED = 'cancelled',
  /** 超时 */
  TIMEOUT = 'timeout'
}

/**
 * AI任务实体
 */
export class AITask {
  /** 任务ID */
  readonly id: UUID;
  /** 任务类型 */
  type: AITaskType;
  /** 任务优先级 */
  priority: AITaskPriority;
  /** 任务状态 */
  status: AITaskStatus;
  /** 输入数据 */
  inputData: Record<string, any>;
  /** 执行结果 */
  result: Record<string, any> | null;
  /** 错误信息 */
  error: string | null;
  /** 重试次数 */
  retryCount: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 创建时间 */
  readonly createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 开始执行时间 */
  startedAt: Date | null;
  /** 完成时间 */
  completedAt: Date | null;
  /** 预计执行时间（毫秒） */
  estimatedExecutionTime: number | null;
  /** 实际执行时间（毫秒） */
  actualExecutionTime: number | null;
  /** 关联的用户ID */
  userId: UUID | null;
  /** 关联的认知模型ID */
  cognitiveModelId: UUID | null;
  /** 依赖的任务ID列表 */
  dependsOn: UUID[];

  /**
   * 构造函数
   * @param props 任务属性
   */
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
  }) {
    this.id = props.id || UUID.generate();
    this.type = props.type;
    this.priority = props.priority;
    this.status = props.status || AITaskStatus.PENDING;
    this.inputData = props.inputData;
    this.result = props.result || null;
    this.error = props.error || null;
    this.retryCount = props.retryCount || 0;
    this.maxRetries = props.maxRetries || 3;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.startedAt = props.startedAt || null;
    this.completedAt = props.completedAt || null;
    this.estimatedExecutionTime = props.estimatedExecutionTime || null;
    this.actualExecutionTime = props.actualExecutionTime || null;
    this.userId = props.userId || null;
    this.cognitiveModelId = props.cognitiveModelId || null;
    this.dependsOn = props.dependsOn || [];
  }

  /**
   * 启动任务
   */
  public start(): void {
    this.status = AITaskStatus.RUNNING;
    this.startedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * 任务执行成功
   * @param result 执行结果
   */
  public succeed(result: Record<string, any>): void {
    this.status = AITaskStatus.SUCCEEDED;
    this.result = result;
    this.completedAt = new Date();
    this.actualExecutionTime = this.startedAt 
      ? this.completedAt.getTime() - this.startedAt.getTime()
      : null;
    this.updatedAt = new Date();
  }

  /**
   * 任务执行失败
   * @param error 错误信息
   */
  public fail(error: string): void {
    this.status = AITaskStatus.FAILED;
    this.error = error;
    this.completedAt = new Date();
    this.actualExecutionTime = this.startedAt 
      ? this.completedAt.getTime() - this.startedAt.getTime()
      : null;
    this.retryCount += 1;
    this.updatedAt = new Date();
  }

  /**
   * 取消任务
   */
  public cancel(): void {
    this.status = AITaskStatus.CANCELLED;
    this.completedAt = new Date();
    this.actualExecutionTime = this.startedAt 
      ? this.completedAt.getTime() - this.startedAt.getTime()
      : null;
    this.updatedAt = new Date();
  }

  /**
   * 任务超时
   */
  public timeout(): void {
    this.status = AITaskStatus.TIMEOUT;
    this.error = 'Task execution timed out';
    this.completedAt = new Date();
    this.actualExecutionTime = this.startedAt 
      ? this.completedAt.getTime() - this.startedAt.getTime()
      : null;
    this.retryCount += 1;
    this.updatedAt = new Date();
  }

  /**
   * 重试任务
   */
  public retry(): void {
    this.status = AITaskStatus.PENDING;
    this.updatedAt = new Date();
    this.startedAt = null;
    this.completedAt = null;
    this.actualExecutionTime = null;
  }

  /**
   * 是否可以重试
   * @returns 是否可以重试
   */
  public canRetry(): boolean {
    return this.retryCount < this.maxRetries;
  }
}
