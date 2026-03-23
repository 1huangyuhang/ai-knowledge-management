/**
 * CognitiveConcept实体
 * TypeORM实体类，用于映射到数据库的cognitive_concepts表
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CognitiveModelEntity } from './cognitive-model.entity';

@Entity('cognitive_concepts')
@Index(['modelId', 'semanticIdentity']) // 复合索引，用于快速查找特定模型中的特定概念
@Index(['modelId', 'abstractionLevel']) // 复合索引，用于按抽象级别过滤特定模型的概念
@Index(['modelId', 'confidenceScore']) // 复合索引，用于按置信度排序特定模型的概念
export class CognitiveConceptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  modelId: string;

  @ManyToOne(() => CognitiveModelEntity, (model) => model.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modelId' })
  model: CognitiveModelEntity;

  @Column({ type: 'varchar', length: 255 })
  @Index() // 为语义标识添加索引，用于快速查询特定概念
  semanticIdentity: string;

  @Column({ type: 'integer' })
  @Index() // 为抽象级别添加索引，用于按抽象级别过滤
  abstractionLevel: number;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  @Index() // 为置信度添加索引，用于按置信度排序或过滤
  confidenceScore: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json' })
  metadata: Record<string, any>;

  @CreateDateColumn({ index: true }) // 为创建时间添加索引，用于按时间排序
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'text', default: '' })
  sourceThoughtIds: string;
}