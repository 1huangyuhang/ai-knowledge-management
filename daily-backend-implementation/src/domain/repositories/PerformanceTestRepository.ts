import { UUID } from '../value-objects/uuid';
import {
  PerformanceTest,
  TestScenario,
  TestResult,
  PerformanceReport
} from '../entities/PerformanceTest';

/**
 * 性能测试仓库接口
 */
export interface PerformanceTestRepository {
  /**
   * 创建性能测试
   * @param test 性能测试实体
   */
  create(test: PerformanceTest): Promise<void>;

  /**
   * 更新性能测试
   * @param test 性能测试实体
   */
  update(test: PerformanceTest): Promise<void>;

  /**
   * 根据ID获取性能测试
   * @param id 性能测试ID
   */
  findById(id: UUID): Promise<PerformanceTest | null>;

  /**
   * 获取所有性能测试
   */
  findAll(): Promise<PerformanceTest[]>;

  /**
   * 根据状态获取性能测试
   * @param status 测试状态
   */
  findByStatus(status: string): Promise<PerformanceTest[]>;

  /**
   * 删除性能测试
   * @param id 性能测试ID
   */
  delete(id: UUID): Promise<void>;
}

/**
 * 测试场景仓库接口
 */
export interface TestScenarioRepository {
  /**
   * 创建测试场景
   * @param scenario 测试场景实体
   */
  create(scenario: TestScenario): Promise<void>;

  /**
   * 更新测试场景
   * @param scenario 测试场景实体
   */
  update(scenario: TestScenario): Promise<void>;

  /**
   * 根据ID获取测试场景
   * @param id 测试场景ID
   */
  findById(id: UUID): Promise<TestScenario | null>;

  /**
   * 获取所有测试场景
   */
  findAll(): Promise<TestScenario[]>;

  /**
   * 删除测试场景
   * @param id 测试场景ID
   */
  delete(id: UUID): Promise<void>;
}

/**
 * 测试结果仓库接口
 */
export interface TestResultRepository {
  /**
   * 创建测试结果
   * @param result 测试结果实体
   */
  create(result: TestResult): Promise<void>;

  /**
   * 根据测试ID获取测试结果
   * @param testId 测试ID
   */
  findByTestId(testId: UUID): Promise<TestResult[]>;

  /**
   * 根据ID获取测试结果
   * @param id 测试结果ID
   */
  findById(id: UUID): Promise<TestResult | null>;

  /**
   * 删除测试结果
   * @param id 测试结果ID
   */
  delete(id: UUID): Promise<void>;
}

/**
 * 性能报告仓库接口
 */
export interface PerformanceReportRepository {
  /**
   * 创建性能报告
   * @param report 性能报告实体
   */
  create(report: PerformanceReport): Promise<void>;

  /**
   * 根据测试ID获取性能报告
   * @param testId 测试ID
   */
  findByTestId(testId: UUID): Promise<PerformanceReport | null>;

  /**
   * 根据ID获取性能报告
   * @param id 性能报告ID
   */
  findById(id: UUID): Promise<PerformanceReport | null>;

  /**
   * 获取所有性能报告
   */
  findAll(): Promise<PerformanceReport[]>;

  /**
   * 删除性能报告
   * @param id 性能报告ID
   */
  delete(id: UUID): Promise<void>;
}
