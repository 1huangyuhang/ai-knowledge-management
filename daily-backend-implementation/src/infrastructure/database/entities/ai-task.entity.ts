/**
 * AI任务数据库实体
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { AITaskStatus, AITaskPriority, AITaskType } from '../../../domain/entities/AITask';

@Entity('ai_tasks')
@Index(['status'])
@Index(['priority'])
@Index(['type'])
@Index(['userId'])
@Index(['cognitiveModelId'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class AITaskEntity {
  /** 主键ID */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 任务类型 */
  @Column('varchar', { length: 50 })
  type: AITaskType;

  /** 任务优先级 */
  @Column('varchar', { length: 20 })
  priority: AITaskPriority;

  /** 任务状态 */
  @Column('varchar', { length: 20 })
  status: AITaskStatus;

  /** 输入数据（JSON格式） */
  @Column('json')
  inputData: Record<string, any>;

  /** 执行结果（JSON格式） */
  @Column('json', { nullable: true })
  result: Record<string, any> | null;

  /** 错误信息 */
  @Column('text', { nullable: true })
  error: string | null;

  /** 重试次数 */
  @Column('int', { default: 0 })
  retryCount: number;

  /** 最大重试次数 */
  @Column('int', { default: 3 })
  maxRetries: number;

  /** 创建时间 */
  @CreateDateColumn()
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn()
  updatedAt: Date;

  /** 开始执行时间 */
  @Column('datetime', { nullable: true })
  startedAt: Date | null;

  /** 完成时间 */
  @Column('datetime', { nullable: true })
  completedAt: Date | null;

  /** 预计执行时间（毫秒） */
  @Column('bigint', { nullable: true })
  estimatedExecutionTime: number | null;

  /** 实际执行时间（毫秒） */
  @Column('bigint', { nullable: true })
  actualExecutionTime: number | null;

  /** 关联的用户ID */
  @Column('uuid', { nullable: true })
  userId: string | null;

  /** 关联的认知模型ID */
  @Column('uuid', { nullable: true })
  cognitiveModelId: string | null;

  /** 依赖的任务ID列表（JSON格式） */
  @Column('json', { default: '[]' })
  dependsOn: string[];
}
