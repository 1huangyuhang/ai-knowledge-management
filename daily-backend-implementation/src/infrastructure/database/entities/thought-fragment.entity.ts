/**
 * ThoughtFragment实体
 * TypeORM实体类，用于映射到数据库的thought_fragments表
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('thought_fragments')
export class ThoughtFragmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 100, default: 'manual' })
  source: string;

  @Column({ type: 'boolean', default: false })
  isProcessed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
