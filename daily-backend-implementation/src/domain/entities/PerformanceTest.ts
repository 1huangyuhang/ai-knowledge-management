import { UUID } from '../value-objects/uuid';

/**
 * 测试类型枚举
 */
export enum TestType {
  LOAD_TEST = 'LOAD_TEST',
  STRESS_TEST = 'STRESS_TEST',
  SPIKE_TEST = 'SPIKE_TEST',
  ENDURANCE_TEST = 'ENDURANCE_TEST',
  CONFIG_TEST = 'CONFIG_TEST',
  ISOLATION_TEST = 'ISOLATION_TEST'
}

/**
 * 测试状态枚举
 */
export enum TestStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * 测试端点模型
 */
export interface TestEndpoint {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  weight?: number;
}

/**
 * 测试场景配置
 */
export interface ScenarioConfig {
  concurrentUsers: number;
  rampUpTime: number;
  duration: number;
  delay?: number;
  timeout?: number;
  thinkTime?: number;
}

/**
 * 测试指标模型
 */
export interface TestMetric {
  name: string;
  value: number | string;
  unit: string;
  timestamp: Date;
  endpoint?: string;
}

/**
 * 测试摘要模型
 */
export interface TestSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

/**
 * 测试分析模型
 */
export interface TestAnalysis {
  performanceScore: number;
  bottlenecks: string[];
  trends: Record<string, any>;
  recommendations: string[];
}

/**
 * 性能测试实体
 */
export class PerformanceTest {
  private constructor(
    public readonly id: UUID,
    public readonly name: string,
    public readonly description: string,
    public readonly testType: TestType,
    public readonly scenarioId: UUID,
    public readonly createdAt: Date,
    public executedAt?: Date,
    public completedAt?: Date,
    public status: TestStatus = TestStatus.CREATED
  ) {}

  /**
   * 创建性能测试实例
   */
  public static create(
    name: string,
    description: string,
    testType: TestType,
    scenarioId: UUID
  ): PerformanceTest {
    return new PerformanceTest(
      UUID.generate(),
      name,
      description,
      testType,
      scenarioId,
      new Date()
    );
  }

  /**
   * 开始执行测试
   */
  public startExecution(): void {
    this.executedAt = new Date();
    this.status = TestStatus.RUNNING;
  }

  /**
   * 完成测试
   */
  public completeExecution(): void {
    this.completedAt = new Date();
    this.status = TestStatus.COMPLETED;
  }

  /**
   * 标记测试失败
   */
  public failExecution(): void {
    this.completedAt = new Date();
    this.status = TestStatus.FAILED;
  }
}

/**
 * 测试场景实体
 */
export class TestScenario {
  private constructor(
    public readonly id: UUID,
    public name: string,
    public description: string,
    public endpoints: TestEndpoint[],
    public config: ScenarioConfig,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * 创建测试场景实例
   */
  public static create(
    name: string,
    description: string,
    endpoints: TestEndpoint[],
    config: ScenarioConfig
  ): TestScenario {
    const now = new Date();
    return new TestScenario(
      UUID.generate(),
      name,
      description,
      endpoints,
      config,
      now,
      now
    );
  }

  /**
   * 更新测试场景
   */
  public update(
    name?: string,
    description?: string,
    endpoints?: TestEndpoint[],
    config?: ScenarioConfig
  ): void {
    if (name) this.name = name;
    if (description) this.description = description;
    if (endpoints) this.endpoints = endpoints;
    if (config) this.config = config;
    this.updatedAt = new Date();
  }
}

/**
 * 测试结果实体
 */
export class TestResult {
  private constructor(
    public readonly id: UUID,
    public readonly testId: UUID,
    public readonly metrics: TestMetric[],
    public readonly summary: TestSummary,
    public readonly createdAt: Date
  ) {}

  /**
   * 创建测试结果实例
   */
  public static create(
    testId: UUID,
    metrics: TestMetric[],
    summary: TestSummary
  ): TestResult {
    return new TestResult(
      UUID.generate(),
      testId,
      metrics,
      summary,
      new Date()
    );
  }
}

/**
 * 性能报告实体
 */
export class PerformanceReport {
  private constructor(
    public readonly id: UUID,
    public readonly testId: UUID,
    public readonly testName: string,
    public readonly testType: TestType,
    public readonly executedAt: Date,
    public readonly summary: TestSummary,
    public readonly metrics: TestMetric[],
    public readonly analysis: TestAnalysis,
    public readonly recommendations: string[],
    public readonly createdAt: Date
  ) {}

  /**
   * 创建性能报告实例
   */
  public static create(
    testId: UUID,
    testName: string,
    testType: TestType,
    executedAt: Date,
    summary: TestSummary,
    metrics: TestMetric[],
    analysis: TestAnalysis,
    recommendations: string[]
  ): PerformanceReport {
    return new PerformanceReport(
      UUID.generate(),
      testId,
      testName,
      testType,
      executedAt,
      summary,
      metrics,
      analysis,
      recommendations,
      new Date()
    );
  }
}
