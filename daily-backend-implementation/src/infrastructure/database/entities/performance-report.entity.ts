import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * 性能报告实体
 */
@Entity('performance_reports')
export class PerformanceReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  test_id: string;

  @Column()
  test_name: string;

  @Column()
  test_type: string;

  @Column()
  executed_at: Date;

  @Column('json')
  summary_json: any;

  @Column('json')
  analysis_json: any;

  @Column('json')
  recommendations: string[];

  @CreateDateColumn()
  created_at: Date;
}
