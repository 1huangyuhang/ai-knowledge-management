/**
 * 可扩展性优化仓库接口
 * 定义可扩展性优化相关的数据访问方法
 */

import { ScalabilityConfig, ScalabilityMetric, ScalabilityEvent, ScalabilityReport, ScalabilityTestResult } from '../entities/ScalabilityConfig';

export interface ScalabilityOptimizationRepository {
  /**
   * 获取当前可扩展性配置
   * @returns 当前可扩展性配置
   */
  getCurrentConfig(): Promise<ScalabilityConfig | null>;

  /**
   * 保存可扩展性配置
   * @param config 可扩展性配置
   * @returns 保存后的可扩展性配置
   */
  saveConfig(config: ScalabilityConfig): Promise<ScalabilityConfig>;

  /**
   * 获取所有可扩展性配置
   * @returns 可扩展性配置列表
   */
  getAllConfigs(): Promise<ScalabilityConfig[]>;

  /**
   * 根据ID获取可扩展性配置
   * @param id 可扩展性配置ID
   * @returns 可扩展性配置
   */
  getConfigById(id: string): Promise<ScalabilityConfig | null>;

  /**
   * 删除可扩展性配置
   * @param id 可扩展性配置ID
   * @returns 删除结果
   */
  deleteConfig(id: string): Promise<boolean>;

  /**
   * 保存可扩展性指标
   * @param metric 可扩展性指标
   * @returns 保存后的可扩展性指标
   */
  saveMetric(metric: ScalabilityMetric): Promise<ScalabilityMetric>;

  /**
   * 获取可扩展性指标
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param resourceType 资源类型（可选）
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性指标列表
   */
  getMetrics(startTime: Date, endTime: Date, resourceType?: string, limit?: number, offset?: number): Promise<ScalabilityMetric[]>;

  /**
   * 保存可扩展性事件
   * @param event 可扩展性事件
   * @returns 保存后的可扩展性事件
   */
  saveEvent(event: ScalabilityEvent): Promise<ScalabilityEvent>;

  /**
   * 获取可扩展性事件
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param eventType 事件类型（可选）
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性事件列表
   */
  getEvents(startTime: Date, endTime: Date, eventType?: string, limit?: number, offset?: number): Promise<ScalabilityEvent[]>;

  /**
   * 标记可扩展性事件为已处理
   * @param eventId 可扩展性事件ID
   * @returns 处理结果
   */
  markEventAsProcessed(eventId: string): Promise<boolean>;

  /**
   * 保存可扩展性报告
   * @param report 可扩展性报告
   * @returns 保存后的可扩展性报告
   */
  saveReport(report: ScalabilityReport): Promise<ScalabilityReport>;

  /**
   * 获取可扩展性报告历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性报告历史列表
   */
  getReportHistory(limit: number, offset: number): Promise<ScalabilityReport[]>;

  /**
   * 保存可扩展性测试结果
   * @param testResult 可扩展性测试结果
   * @returns 保存后的可扩展性测试结果
   */
  saveTestResult(testResult: ScalabilityTestResult): Promise<ScalabilityTestResult>;

  /**
   * 获取可扩展性测试历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性测试历史列表
   */
  getTestHistory(limit: number, offset: number): Promise<ScalabilityTestResult[]>;

  /**
   * 根据ID获取可扩展性测试结果
   * @param id 可扩展性测试结果ID
   * @returns 可扩展性测试结果
   */
  getTestResultById(id: string): Promise<ScalabilityTestResult | null>;

  /**
   * 获取未处理的可扩展性事件
   * @returns 未处理的可扩展性事件列表
   */
  getUnprocessedEvents(): Promise<ScalabilityEvent[]>;

  /**
   * 删除过期的可扩展性指标
   * @param olderThan 过期时间
   * @returns 删除的指标数量
   */
  deleteExpiredMetrics(olderThan: Date): Promise<number>;

  /**
   * 删除过期的可扩展性事件
   * @param olderThan 过期时间
   * @returns 删除的事件数量
   */
  deleteExpiredEvents(olderThan: Date): Promise<number>;
}
