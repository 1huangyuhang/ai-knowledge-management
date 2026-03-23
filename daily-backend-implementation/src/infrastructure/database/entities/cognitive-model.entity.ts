/**
 * CognitiveModel实体
 * TypeORM实体类，用于映射到数据库的cognitive_models表
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('cognitive_models')
@Index(['userId', 'isActive']) // 复合索引，用于优化"获取用户活跃模型"查询
export class CognitiveModelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', index: true })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: true, index: true })
  isActive: boolean;

  @CreateDateColumn({ index: true })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'integer', default: 1 })
  version: number;
}
