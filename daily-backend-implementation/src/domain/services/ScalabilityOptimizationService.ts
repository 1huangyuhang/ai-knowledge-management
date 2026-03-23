/**
 * 可扩展性优化服务接口
 * 定义可扩展性优化相关的业务逻辑方法
 */

import { ScalabilityConfig, ScalabilityMetric, ScalabilityEvent, ScalabilityReport, ScalabilityTestResult, ScalabilityLevel } from '../entities/ScalabilityConfig';

export interface ScalabilityOptimizationService {
  /**
   * 获取当前可扩展性配置
   * @returns 当前可扩展性配置
   */
  getCurrentScalabilityConfig(): Promise<ScalabilityConfig>;

  /**
   * 更新可扩展性配置
   * @param config 可扩展性配置
   * @returns 更新后的可扩展性配置
   */
  updateScalabilityConfig(config: Partial<ScalabilityConfig>): Promise<ScalabilityConfig>;

  /**
   * 应用可扩展性配置
   * @param configId 可扩展性配置ID
   * @returns 应用结果
   */
  applyScalabilityConfig(configId: string): Promise<boolean>;

  /**
   * 获取可扩展性指标
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param resourceType 资源类型（可选）
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性指标列表
   */
  getScalabilityMetrics(startTime: Date, endTime: Date, resourceType?: string, limit?: number, offset?: number): Promise<ScalabilityMetric[]>;

  /**
   * 记录可扩展性指标
   * @param metric 可扩展性指标
   * @returns 记录结果
   */
  recordScalabilityMetric(metric: ScalabilityMetric): Promise<boolean>;

  /**
   * 获取可扩展性事件
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param eventType 事件类型（可选）
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性事件列表
   */
  getScalabilityEvents(startTime: Date, endTime: Date, eventType?: string, limit?: number, offset?: number): Promise<ScalabilityEvent[]>;

  /**
   * 记录可扩展性事件
   * @param event 可扩展性事件
   * @returns 记录结果
   */
  recordScalabilityEvent(event: ScalabilityEvent): Promise<boolean>;

  /**
   * 标记可扩展性事件为已处理
   * @param eventId 可扩展性事件ID
   * @returns 处理结果
   */
  markScalabilityEventAsProcessed(eventId: string): Promise<boolean>;

  /**
   * 生成可扩展性报告
   * @param reportPeriod 报告期间（秒）
   * @returns 可扩展性报告
   */
  generateScalabilityReport(reportPeriod: number): Promise<ScalabilityReport>;

  /**
   * 获取可扩展性报告历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性报告历史列表
   */
  getScalabilityReportHistory(limit: number, offset: number): Promise<ScalabilityReport[]>;

  /**
   * 执行可扩展性测试
   * @param testName 测试名称
   * @param testDescription 测试描述
   * @param loadConfig 测试负载配置
   * @returns 测试结果
   */
  runScalabilityTest(testName: string, testDescription: string, loadConfig: {
    initialUsers: number;
    targetUsers: number;
    rampUpRate: number;
    duration: number;
  }): Promise<ScalabilityTestResult>;

  /**
   * 获取可扩展性测试历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性测试历史列表
   */
  getScalabilityTestHistory(limit: number, offset: number): Promise<ScalabilityTestResult[]>;

  /**
   * 优化可扩展性配置
   * @param targetLevel 目标可扩展性级别
   * @returns 优化建议和结果
   */
  optimizeScalabilityConfig(targetLevel: ScalabilityLevel): Promise<{ optimizedConfig: ScalabilityConfig; changes: string[] }>;

  /**
   * 获取可扩展性最佳实践建议
   * @returns 可扩展性最佳实践建议列表
   */
  getScalabilityRecommendations(): Promise<string[]>;

  /**
   * 检查可扩展性合规性
   * @returns 合规性检查结果
   */
  checkScalabilityCompliance(): Promise<{ compliant: boolean; issues: string[] }>;

  /**
   * 触发手动扩展
   * @param scaleDirection 扩展方向（UP/DOWN）
   * @param instanceCount 实例数量
   * @returns 扩展结果
   */
  triggerManualScaling(scaleDirection: 'UP' | 'DOWN', instanceCount: number): Promise<boolean>;

  /**
   * 获取当前实例状态
   * @returns 当前实例状态
   */
  getCurrentInstanceStatus(): Promise<{
    instanceCount: number;
    activeInstances: number;
    pendingInstances: number;
    scalingInProgress: boolean;
  }>;
}
