/**
 * 可用性优化服务接口
 * 定义可用性优化相关的业务逻辑方法
 */

import { AvailabilityConfig, AvailabilityMetric, AvailabilityEvent, AvailabilityReport, AvailabilityTestResult, AvailabilityLevel, HealthCheckResult } from '../entities/AvailabilityConfig';

export interface AvailabilityOptimizationService {
  /**
   * 获取当前可用性配置
   * @returns 当前可用性配置
   */
  getCurrentAvailabilityConfig(): Promise<AvailabilityConfig>;

  /**
   * 更新可用性配置
   * @param config 可用性配置
   * @returns 更新后的可用性配置
   */
  updateAvailabilityConfig(config: Partial<AvailabilityConfig>): Promise<AvailabilityConfig>;

  /**
   * 应用可用性配置
   * @param configId 可用性配置ID
   * @returns 应用结果
   */
  applyAvailabilityConfig(configId: string): Promise<boolean>;

  /**
   * 执行健康检查
   * @param healthCheckConfigId 健康检查配置ID（可选）
   * @returns 健康检查结果列表
   */
  runHealthChecks(healthCheckConfigId?: string): Promise<HealthCheckResult[]>;

  /**
   * 获取健康检查结果
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param healthCheckConfigId 健康检查配置ID（可选）
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 健康检查结果列表
   */
  getHealthCheckResults(startTime: Date, endTime: Date, healthCheckConfigId?: string, limit?: number, offset?: number): Promise<HealthCheckResult[]>;

  /**
   * 获取可用性指标
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param metricType 指标类型（可选）
   * @param serviceName 服务名称（可选）
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可用性指标列表
   */
  getAvailabilityMetrics(startTime: Date, endTime: Date, metricType?: string, serviceName?: string, limit?: number, offset?: number): Promise<AvailabilityMetric[]>;

  /**
   * 记录可用性指标
   * @param metric 可用性指标
   * @returns 记录结果
   */
  recordAvailabilityMetric(metric: AvailabilityMetric): Promise<boolean>;

  /**
   * 获取可用性事件
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param eventType 事件类型（可选）
   * @param serviceName 服务名称（可选）
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可用性事件列表
   */
  getAvailabilityEvents(startTime: Date, endTime: Date, eventType?: string, serviceName?: string, limit?: number, offset?: number): Promise<AvailabilityEvent[]>;

  /**
   * 记录可用性事件
   * @param event 可用性事件
   * @returns 记录结果
   */
  recordAvailabilityEvent(event: AvailabilityEvent): Promise<boolean>;

  /**
   * 标记可用性事件为已处理
   * @param eventId 可用性事件ID
   * @returns 处理结果
   */
  markAvailabilityEventAsProcessed(eventId: string): Promise<boolean>;

  /**
   * 生成可用性报告
   * @param reportPeriod 报告期间（秒）
   * @returns 可用性报告
   */
  generateAvailabilityReport(reportPeriod: number): Promise<AvailabilityReport>;

  /**
   * 获取可用性报告历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可用性报告历史列表
   */
  getAvailabilityReportHistory(limit: number, offset: number): Promise<AvailabilityReport[]>;

  /**
   * 执行可用性测试
   * @param testName 测试名称
   * @param testDescription 测试描述
   * @param testConfig 测试配置
   * @returns 测试结果
   */
  runAvailabilityTest(testName: string, testDescription: string, testConfig: {
    type: 'FAILURE_SIMULATION' | 'LOAD_TEST' | 'STRESS_TEST' | 'RECOVERY_TEST';
    parameters: Record<string, any>;
  }): Promise<AvailabilityTestResult>;

  /**
   * 获取可用性测试历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可用性测试历史列表
   */
  getAvailabilityTestHistory(limit: number, offset: number): Promise<AvailabilityTestResult[]>;

  /**
   * 优化可用性配置
   * @param targetLevel 目标可用性级别
   * @returns 优化建议和结果
   */
  optimizeAvailabilityConfig(targetLevel: AvailabilityLevel): Promise<{ optimizedConfig: AvailabilityConfig; changes: string[] }>;

  /**
   * 获取可用性最佳实践建议
   * @returns 可用性最佳实践建议列表
   */
  getAvailabilityRecommendations(): Promise<string[]>;

  /**
   * 检查可用性合规性
   * @returns 合规性检查结果
   */
  checkAvailabilityCompliance(): Promise<{ compliant: boolean; issues: string[] }>;

  /**
   * 触发故障转移
   * @param serviceName 服务名称
   * @returns 故障转移结果
   */
  triggerFailover(serviceName?: string): Promise<boolean>;

  /**
   * 触发恢复
   * @param serviceName 服务名称
   * @returns 恢复结果
   */
  triggerRecovery(serviceName?: string): Promise<boolean>;

  /**
   * 获取当前服务状态
   * @returns 当前服务状态
   */
  getCurrentServiceStatus(): Promise<{
    serviceName: string;
    status: 'UP' | 'DOWN' | 'WARNING' | 'UNKNOWN';
    availabilityPercentage: number;
    lastCheckTime: Date;
  }[]>;
}
