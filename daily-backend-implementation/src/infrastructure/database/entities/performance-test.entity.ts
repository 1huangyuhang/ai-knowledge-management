import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TestResultEntity } from './test-result.entity';

/**
 * 性能测试实体
 */
@Entity('performance_tests')
export class PerformanceTestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  test_type: string;

  @Column()
  scenario_id: string;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  executed_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @OneToMany(() => TestResultEntity, (result) => result.performance_test)
  results: TestResultEntity[];
}

/**
 * 测试场景实体
 */
@Entity('test_scenarios')
export class TestScenarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('json')
  endpoints_json: any[];

  @Column('json')
  config_json: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
