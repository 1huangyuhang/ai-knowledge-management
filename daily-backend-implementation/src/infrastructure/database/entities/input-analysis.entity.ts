/**
 * 输入分析数据库实体
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { AnalysisStatus } from '../../../domain/entities/InputAnalysis';

@Entity('input_analyses')
@Index(['inputId'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class InputAnalysisEntity {
  /** 主键ID */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 关联的输入ID */
  @Column('uuid')
  inputId: string;

  /** 分析类型 */
  @Column('varchar', { length: 50 })
  type: string;

  /** 分析结果（JSON格式） */
  @Column('json')
  result: Record<string, any>;

  /** 分析状态 */
  @Column('varchar', { length: 20 })
  status: AnalysisStatus;

  /** 置信度 */
  @Column('decimal', { precision: 4, scale: 3 })
  confidence: number;

  /** 创建时间 */
  @CreateDateColumn()
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn()
  updatedAt: Date;
}
