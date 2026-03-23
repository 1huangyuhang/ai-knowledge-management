import { DataSource } from 'typeorm';
import { UUID } from '../../../domain/value-objects/uuid';
import {
  PerformanceTestRepository,
  TestScenarioRepository,
  TestResultRepository,
  PerformanceReportRepository
} from '../../../domain/repositories/PerformanceTestRepository';
import {
  PerformanceTest,
  TestScenario,
  TestResult,
  PerformanceReport,
  TestType,
  TestStatus,
  TestEndpoint,
  ScenarioConfig
} from '../../../domain/entities/PerformanceTest';
import { PerformanceTestEntity, TestScenarioEntity } from '../entities/performance-test.entity';
import { TestResultEntity } from '../entities/test-result.entity';
import { PerformanceReportEntity } from '../entities/performance-report.entity';

/**
 * 性能测试SQLite仓库实现
 */
export class PerformanceTestRepositoryImpl implements PerformanceTestRepository {
  private performanceTestRepository: any;
  private testResultRepository: any;
  private testScenarioRepository: any;
  private performanceReportRepository: any;

  constructor(private readonly dataSource: DataSource) {
    this.performanceTestRepository = dataSource.getRepository(PerformanceTestEntity);
    this.testResultRepository = dataSource.getRepository(TestResultEntity);
    this.testScenarioRepository = dataSource.getRepository(TestScenarioEntity);
    this.performanceReportRepository = dataSource.getRepository(PerformanceReportEntity);
  }

  async create(test: PerformanceTest): Promise<void> {
    const performanceTestEntity = this.performanceTestRepository.create({
      id: test.id.value,
      name: test.name,
      description: test.description,
      test_type: test.testType,
      scenario_id: test.scenarioId.value,
      status: test.status,
      created_at: test.createdAt,
      executed_at: test.executedAt,
      completed_at: test.completedAt
    });
    await this.performanceTestRepository.save(performanceTestEntity);
  }

  async update(test: PerformanceTest): Promise<void> {
    const performanceTestEntity = await this.performanceTestRepository.findOneBy({ id: test.id.value });
    if (!performanceTestEntity) {
      throw new Error(`Performance test with ID ${test.id.value} not found`);
    }

    performanceTestEntity.name = test.name;
    performanceTestEntity.description = test.description;
    performanceTestEntity.test_type = test.testType;
    performanceTestEntity.scenario_id = test.scenarioId.value;
    performanceTestEntity.status = test.status;
    performanceTestEntity.executed_at = test.executedAt;
    performanceTestEntity.completed_at = test.completedAt;

    await this.performanceTestRepository.save(performanceTestEntity);
  }

  async findById(id: UUID): Promise<PerformanceTest | null> {
    const performanceTestEntity = await this.performanceTestRepository.findOneBy({ id: id.value });
    if (!performanceTestEntity) {
      return null;
    }

    return this.mapToPerformanceTest(performanceTestEntity);
  }

  async findAll(): Promise<PerformanceTest[]> {
    const performanceTestEntities = await this.performanceTestRepository.find({
      order: { created_at: 'DESC' }
    });
    return performanceTestEntities.map(entity => this.mapToPerformanceTest(entity));
  }

  async findByStatus(status: string): Promise<PerformanceTest[]> {
    const performanceTestEntities = await this.performanceTestRepository.find({
      where: { status },
      order: { created_at: 'DESC' }
    });
    return performanceTestEntities.map(entity => this.mapToPerformanceTest(entity));
  }

  async delete(id: UUID): Promise<void> {
    await this.performanceTestRepository.delete({ id: id.value });
  }

  private mapToPerformanceTest(entity: PerformanceTestEntity): PerformanceTest {
    return new PerformanceTest(
      UUID.fromString(entity.id),
      entity.name,
      entity.description,
      entity.test_type as TestType,
      UUID.fromString(entity.scenario_id),
      entity.created_at,
      entity.executed_at,
      entity.completed_at,
      entity.status as TestStatus
    );
  }
}

/**
 * 测试场景SQLite仓库实现
 */
export class TestScenarioRepositoryImpl implements TestScenarioRepository {
  private testScenarioRepository: any;

  constructor(private readonly dataSource: DataSource) {
    this.testScenarioRepository = dataSource.getRepository(TestScenarioEntity);
  }

  async create(scenario: TestScenario): Promise<void> {
    const testScenarioEntity = this.testScenarioRepository.create({
      id: scenario.id.value,
      name: scenario.name,
      description: scenario.description,
      endpoints_json: scenario.endpoints,
      config_json: scenario.config,
      created_at: scenario.createdAt,
      updated_at: scenario.updatedAt
    });
    await this.testScenarioRepository.save(testScenarioEntity);
  }

  async update(scenario: TestScenario): Promise<void> {
    const testScenarioEntity = await this.testScenarioRepository.findOneBy({ id: scenario.id.value });
    if (!testScenarioEntity) {
      throw new Error(`Test scenario with ID ${scenario.id.value} not found`);
    }

    testScenarioEntity.name = scenario.name;
    testScenarioEntity.description = scenario.description;
    testScenarioEntity.endpoints_json = scenario.endpoints;
    testScenarioEntity.config_json = scenario.config;
    testScenarioEntity.updated_at = scenario.updatedAt;

    await this.testScenarioRepository.save(testScenarioEntity);
  }

  async findById(id: UUID): Promise<TestScenario | null> {
    const testScenarioEntity = await this.testScenarioRepository.findOneBy({ id: id.value });
    if (!testScenarioEntity) {
      return null;
    }

    return this.mapToTestScenario(testScenarioEntity);
  }

  async findAll(): Promise<TestScenario[]> {
    const testScenarioEntities = await this.testScenarioRepository.find({
      order: { updated_at: 'DESC' }
    });
    return testScenarioEntities.map(entity => this.mapToTestScenario(entity));
  }

  async delete(id: UUID): Promise<void> {
    await this.testScenarioRepository.delete({ id: id.value });
  }

  private mapToTestScenario(entity: TestScenarioEntity): TestScenario {
    return new TestScenario(
      UUID.fromString(entity.id),
      entity.name,
      entity.description,
      entity.endpoints_json as TestEndpoint[],
      entity.config_json as ScenarioConfig,
      entity.created_at,
      entity.updated_at
    );
  }
}

/**
 * 测试结果SQLite仓库实现
 */
export class TestResultRepositoryImpl implements TestResultRepository {
  private testResultRepository: any;

  constructor(private readonly dataSource: DataSource) {
    this.testResultRepository = dataSource.getRepository(TestResultEntity);
  }

  async create(result: TestResult): Promise<void> {
    // 注意：这里简化了实现，没有处理测试指标，需要根据实际数据库结构调整
    const testResultEntity = this.testResultRepository.create({
      id: result.id.value,
      test_id: result.testId.value,
      summary_json: result.summary,
      created_at: result.createdAt
    });
    await this.testResultRepository.save(testResultEntity);
  }

  async findByTestId(testId: UUID): Promise<TestResult[]> {
    const testResultEntities = await this.testResultRepository.find({
      where: { test_id: testId.value },
      order: { created_at: 'DESC' }
    });
    return testResultEntities.map(entity => this.mapToTestResult(entity));
  }

  async findById(id: UUID): Promise<TestResult | null> {
    const testResultEntity = await this.testResultRepository.findOneBy({ id: id.value });
    if (!testResultEntity) {
      return null;
    }

    return this.mapToTestResult(testResultEntity);
  }

  async delete(id: UUID): Promise<void> {
    await this.testResultRepository.delete({ id: id.value });
  }

  private mapToTestResult(entity: TestResultEntity): TestResult {
    return new TestResult(
      UUID.fromString(entity.id),
      UUID.fromString(entity.test_id),
      [], // 简化实现，没有处理测试指标
      entity.summary_json,
      entity.created_at
    );
  }
}

/**
 * 性能报告SQLite仓库实现
 */
export class PerformanceReportRepositoryImpl implements PerformanceReportRepository {
  private performanceReportRepository: any;

  constructor(private readonly dataSource: DataSource) {
    this.performanceReportRepository = dataSource.getRepository(PerformanceReportEntity);
  }

  async create(report: PerformanceReport): Promise<void> {
    const performanceReportEntity = this.performanceReportRepository.create({
      id: report.id.value,
      test_id: report.testId.value,
      test_name: report.testName,
      test_type: report.testType,
      executed_at: report.executedAt,
      summary_json: report.summary,
      analysis_json: report.analysis,
      recommendations: report.recommendations,
      created_at: report.createdAt
    });
    await this.performanceReportRepository.save(performanceReportEntity);
  }

  async findByTestId(testId: UUID): Promise<PerformanceReport | null> {
    const performanceReportEntity = await this.performanceReportRepository.findOneBy({ test_id: testId.value });
    if (!performanceReportEntity) {
      return null;
    }

    return this.mapToPerformanceReport(performanceReportEntity);
  }

  async findById(id: UUID): Promise<PerformanceReport | null> {
    const performanceReportEntity = await this.performanceReportRepository.findOneBy({ id: id.value });
    if (!performanceReportEntity) {
      return null;
    }

    return this.mapToPerformanceReport(performanceReportEntity);
  }

  async findAll(): Promise<PerformanceReport[]> {
    const performanceReportEntities = await this.performanceReportRepository.find({
      order: { created_at: 'DESC' }
    });
    return performanceReportEntities.map(entity => this.mapToPerformanceReport(entity));
  }

  async delete(id: UUID): Promise<void> {
    await this.performanceReportRepository.delete({ id: id.value });
  }

  private mapToPerformanceReport(entity: PerformanceReportEntity): PerformanceReport {
    return new PerformanceReport(
      UUID.fromString(entity.id),
      UUID.fromString(entity.test_id),
      entity.test_name,
      entity.test_type as TestType,
      entity.executed_at,
      entity.summary_json,
      [], // 简化实现，没有处理测试指标
      entity.analysis_json,
      entity.recommendations,
      entity.created_at
    );
  }
}
