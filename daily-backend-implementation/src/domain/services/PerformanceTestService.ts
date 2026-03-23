import { UUID } from '../value-objects/uuid';
import {
  PerformanceTest,
  TestScenario,
  TestResult,
  PerformanceReport,
  TestType,
  TestStatus
} from '../entities/PerformanceTest';

/**
 * 性能测试服务接口
 */
export interface PerformanceTestService {
  /**
   * 创建性能测试
   * @param name 测试名称
   * @param description 测试描述
   * @param testType 测试类型
   * @param scenarioId 场景ID
   */
  createTest(
    name: string,
    description: string,
    testType: TestType,
    scenarioId: UUID
  ): Promise<PerformanceTest>;

  /**
   * 执行性能测试
   * @param testId 测试ID
   */
  runTest(testId: UUID): Promise<PerformanceTest>;

  /**
   * 获取测试结果
   * @param testId 测试ID
   */
  getTestResults(testId: UUID): Promise<TestResult[]>;

  /**
   * 获取测试详情
   * @param testId 测试ID
   */
  getTestDetails(testId: UUID): Promise<PerformanceTest>;

  /**
   * 获取所有测试
   */
  getAllTests(): Promise<PerformanceTest[]>;

  /**
   * 获取性能报告
   * @param testId 测试ID
   */
  getPerformanceReport(testId: UUID): Promise<PerformanceReport>;
}

/**
 * 测试场景服务接口
 */
export interface TestScenarioService {
  /**
   * 创建测试场景
   * @param name 场景名称
   * @param description 场景描述
   * @param endpoints 测试端点
   * @param config 场景配置
   */
  createScenario(
    name: string,
    description: string,
    endpoints: any[],
    config: any
  ): Promise<TestScenario>;

  /**
   * 更新测试场景
   * @param id 场景ID
   * @param name 场景名称
   * @param description 场景描述
   * @param endpoints 测试端点
   * @param config 场景配置
   */
  updateScenario(
    id: UUID,
    name?: string,
    description?: string,
    endpoints?: any[],
    config?: any
  ): Promise<TestScenario>;

  /**
   * 获取场景详情
   * @param id 场景ID
   */
  getScenarioDetails(id: UUID): Promise<TestScenario>;

  /**
   * 获取所有场景
   */
  getAllScenarios(): Promise<TestScenario[]>;
}

/**
 * 测试分析服务接口
 */
export interface TestAnalyzerService {
  /**
   * 分析测试结果
   * @param testResult 测试结果
   */
  analyzeTestResult(testResult: TestResult): Promise<any>;

  /**
   * 识别性能瓶颈
   * @param metrics 测试指标
   */
  identifyBottlenecks(metrics: any[]): Promise<string[]>;

  /**
   * 生成优化建议
   * @param analysis 测试分析
   */
  generateRecommendations(analysis: any): Promise<string[]>;

  /**
   * 计算性能评分
   * @param metrics 测试指标
   */
  calculatePerformanceScore(metrics: any[]): Promise<number>;
}

/**
 * 报告生成服务接口
 */
export interface ReportGeneratorService {
  /**
   * 生成性能报告
   * @param test 性能测试
   * @param results 测试结果
   * @param analysis 测试分析
   * @param recommendations 优化建议
   */
  generateReport(
    test: PerformanceTest,
    results: TestResult[],
    analysis: any,
    recommendations: string[]
  ): Promise<PerformanceReport>;

  /**
   * 生成HTML报告
   * @param report 性能报告
   */
  generateHtmlReport(report: PerformanceReport): Promise<string>;

  /**
   * 生成JSON报告
   * @param report 性能报告
   */
  generateJsonReport(report: PerformanceReport): Promise<string>;
}
