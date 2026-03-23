import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { PerformanceTestEntity } from './performance-test.entity';

/**
 * 测试结果实体
 */
@Entity('test_results')
export class TestResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  test_id: string;

  @Column('json')
  summary_json: any;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => PerformanceTestEntity, (test) => test.results)
  performance_test: PerformanceTestEntity;

  @OneToMany(() => TestMetricEntity, (metric) => metric.test_result)
  metrics: TestMetricEntity[];
}

/**
 * 测试指标实体
 */
@Entity('test_metrics')
export class TestMetricEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  result_id: string;

  @Column()
  name: string;

  @Column()
  value: string;

  @Column()
  unit: string;

  @Column()
  timestamp: Date;

  @Column({ nullable: true })
  endpoint: string;

  @ManyToOne(() => TestResultEntity, (result) => result.metrics)
  test_result: TestResultEntity;
}
