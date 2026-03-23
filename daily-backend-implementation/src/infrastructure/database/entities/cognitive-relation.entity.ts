/**
 * CognitiveRelation实体
 * TypeORM实体类，用于映射到数据库的cognitive_relations表
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CognitiveModelEntity } from './cognitive-model.entity';
import { CognitiveConceptEntity } from './cognitive-concept.entity';

@Entity('cognitive_relations')
@Index(['modelId', 'sourceConceptId'])
@Index(['modelId', 'targetConceptId'])
@Index(['sourceConceptId', 'targetConceptId'])
export class CognitiveRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  modelId: string;

  @ManyToOne(() => CognitiveModelEntity, (model) => model.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modelId' })
  model: CognitiveModelEntity;

  @Column({ type: 'uuid' })
  @Index()
  sourceConceptId: string;

  @ManyToOne(() => CognitiveConceptEntity, (concept) => concept.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceConceptId' })
  sourceConcept: CognitiveConceptEntity;

  @Column({ type: 'uuid' })
  @Index()
  targetConceptId: string;

  @ManyToOne(() => CognitiveConceptEntity, (concept) => concept.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetConceptId' })
  targetConcept: CognitiveConceptEntity;

  @Column({ type: 'varchar', length: 50, index: true })
  type: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, index: true })
  confidenceScore: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json' })
  metadata: Record<string, any>;

  @CreateDateColumn({ index: true })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'text', default: '' })
  sourceThoughtIds: string;
}