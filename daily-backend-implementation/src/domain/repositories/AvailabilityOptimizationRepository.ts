/**
 * 可用性优化仓库接口
 * 定义可用性优化相关的数据访问方法
 */

import { AvailabilityConfig, AvailabilityMetric, AvailabilityEvent, AvailabilityReport, AvailabilityTestResult, HealthCheckResult } from '../entities/AvailabilityConfig';

export interface AvailabilityOptimizationRepository {
  /**
   * 获取当前可用性配置
   * @returns 当前可用性配置
   */
  getCurrentConfig(): Promise<AvailabilityConfig | null>;

  /**
   * 保存可用性配置
   * @param config 可用性配置
   * @returns 保存后的可用性配置
   */
  saveConfig(config: AvailabilityConfig): Promise<AvailabilityConfig>;

  /**
   * 获取所有可用性配置
   * @returns 可用性配置列表
   */
  getAllConfigs(): Promise<AvailabilityConfig[]>;

  /**
   * 根据ID获取可用性配置
   * @param id 可用性配置ID
   * @returns 可用性配置
   */
  getConfigById(id: string): Promise<AvailabilityConfig | null>;

  /**
   * 删除可用性配置
   * @param id 可用性配置ID
   * @returns 删除结果
   */
  deleteConfig(id: string): Promise<boolean>;

  /**
   * 保存健康检查结果
   * @param result 健康检查结果
   * @returns 保存后的健康检查结果
   */
  saveHealthCheckResult(result: HealthCheckResult): Promise<HealthCheckResult>;

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
   * 保存可用性指标
   * @param metric 可用性指标
   * @returns 保存后的可用性指标
   */
  saveMetric(metric: AvailabilityMetric): Promise<AvailabilityMetric>;

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
  getMetrics(startTime: Date, endTime: Date, metricType?: string, serviceName?: string, limit?: number, offset?: number): Promise<AvailabilityMetric[]>;

  /**
   * 保存可用性事件
   * @param event 可用性事件
   * @returns 保存后的可用性事件
   */
  saveEvent(event: AvailabilityEvent): Promise<AvailabilityEvent>;

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
  getEvents(startTime: Date, endTime: Date, eventType?: string, serviceName?: string, limit?: number, offset?: number): Promise<AvailabilityEvent[]>;

  /**
   * 标记可用性事件为已处理
   * @param eventId 可用性事件ID
   * @returns 处理结果
   */
  markEventAsProcessed(eventId: string): Promise<boolean>;

  /**
   * 保存可用性报告
   * @param report 可用性报告
   * @returns 保存后的可用性报告
   */
  saveReport(report: AvailabilityReport): Promise<AvailabilityReport>;

  /**
   * 获取可用性报告历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可用性报告历史列表
   */
  getReportHistory(limit: number, offset: number): Promise<AvailabilityReport[]>;

  /**
   * 保存可用性测试结果
   * @param testResult 可用性测试结果
   * @returns 保存后的可用性测试结果
   */
  saveTestResult(testResult: AvailabilityTestResult): Promise<AvailabilityTestResult>;

  /**
   * 获取可用性测试历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可用性测试历史列表
   */
  getTestHistory(limit: number, offset: number): Promise<AvailabilityTestResult[]>;

  /**
   * 根据ID获取可用性测试结果
   * @param id 可用性测试结果ID
   * @returns 可用性测试结果
   */
  getTestResultById(id: string): Promise<AvailabilityTestResult | null>;

  /**
   * 获取未处理的可用性事件
   * @returns 未处理的可用性事件列表
   */
  getUnprocessedEvents(): Promise<AvailabilityEvent[]>;

  /**
   * 删除过期的健康检查结果
   * @param olderThan 过期时间
   * @returns 删除的结果数量
   */
  deleteExpiredHealthCheckResults(olderThan: Date): Promise<number>;

  /**
   * 删除过期的可用性指标
   * @param olderThan 过期时间
   * @returns 删除的指标数量
   */
  deleteExpiredMetrics(olderThan: Date): Promise<number>;

  /**
   * 删除过期的可用性事件
   * @param olderThan 过期时间
   * @returns 删除的事件数量
   */
  deleteExpiredEvents(olderThan: Date): Promise<number>;
}
