/**
 * CognitiveInsight实体
 * TypeORM实体类，用于映射到数据库的cognitive_insights表
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('cognitive_insights')
export class CognitiveInsightEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  modelId: string | null;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'json' })
  content: Record<string, any>;

  @Column({ type: 'float' })
  confidence: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}