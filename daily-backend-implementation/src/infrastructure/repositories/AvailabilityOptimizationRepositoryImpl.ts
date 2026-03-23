/**
 * 可用性优化仓库实现
 * 使用内存存储来保存可用性配置、健康检查结果、指标、事件、报告和测试结果
 */

import { AvailabilityOptimizationRepository } from '../../domain/repositories/AvailabilityOptimizationRepository';
import { AvailabilityConfig, AvailabilityMetric, AvailabilityEvent, AvailabilityReport, AvailabilityTestResult, HealthCheckResult } from '../../domain/entities/AvailabilityConfig';

/**
 * 可用性优化仓库实现类
 */
export class AvailabilityOptimizationRepositoryImpl implements AvailabilityOptimizationRepository {
  private configs: Map<string, AvailabilityConfig> = new Map();
  private healthCheckResults: HealthCheckResult[] = [];
  private metrics: AvailabilityMetric[] = [];
  private events: Map<string, AvailabilityEvent> = new Map();
  private reports: AvailabilityReport[] = [];
  private testResults: Map<string, AvailabilityTestResult> = new Map();

  /**
   * 获取当前可用性配置
   * @returns 当前可用性配置
   */
  async getCurrentConfig(): Promise<AvailabilityConfig | null> {
    // 返回最新的可用性配置
    const sortedConfigs = Array.from(this.configs.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return sortedConfigs[0] || null;
  }

  /**
   * 保存可用性配置
   * @param config 可用性配置
   * @returns 保存后的可用性配置
   */
  async saveConfig(config: AvailabilityConfig): Promise<AvailabilityConfig> {
    this.configs.set(config.id, config);
    return config;
  }

  /**
   * 获取所有可用性配置
   * @returns 可用性配置列表
   */
  async getAllConfigs(): Promise<AvailabilityConfig[]> {
    return Array.from(this.configs.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * 根据ID获取可用性配置
   * @param id 可用性配置ID
   * @returns 可用性配置
   */
  async getConfigById(id: string): Promise<AvailabilityConfig | null> {
    return this.configs.get(id) || null;
  }

  /**
   * 删除可用性配置
   * @param id 可用性配置ID
   * @returns 删除结果
   */
  async deleteConfig(id: string): Promise<boolean> {
    return this.configs.delete(id);
  }

  /**
   * 保存健康检查结果
   * @param result 健康检查结果
   * @returns 保存后的健康检查结果
   */
  async saveHealthCheckResult(result: HealthCheckResult): Promise<HealthCheckResult> {
    this.healthCheckResults.push(result);
    return result;
  }

  /**
   * 获取健康检查结果
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param healthCheckConfigId 健康检查配置ID（可选）
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 健康检查结果列表
   */
  async getHealthCheckResults(startTime: Date, endTime: Date, healthCheckConfigId?: string, limit?: number, offset?: number): Promise<HealthCheckResult[]> {
    let filteredResults = this.healthCheckResults.filter(result => {
      const resultTime = new Date(result.checkTime);
      const inTimeRange = resultTime >= startTime && resultTime <= endTime;
      const matchesConfigId = !healthCheckConfigId || result.healthCheckConfigId === healthCheckConfigId;
      return inTimeRange && matchesConfigId;
    });

    // 按时间倒序排序
    filteredResults = filteredResults.sort(
      (a, b) => new Date(b.checkTime).getTime() - new Date(a.checkTime).getTime()
    );

    // 应用分页
    if (offset !== undefined) {
      filteredResults = filteredResults.slice(offset);
    }
    if (limit !== undefined) {
      filteredResults = filteredResults.slice(0, limit);
    }

    return filteredResults;
  }

  /**
   * 保存可用性指标
   * @param metric 可用性指标
   * @returns 保存后的可用性指标
   */
  async saveMetric(metric: AvailabilityMetric): Promise<AvailabilityMetric> {
    this.metrics.push(metric);
    return metric;
  }

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
  async getMetrics(startTime: Date, endTime: Date, metricType?: string, serviceName?: string, limit?: number, offset?: number): Promise<AvailabilityMetric[]> {
    let filteredMetrics = this.metrics.filter(metric => {
      const metricTime = new Date(metric.timestamp);
      const inTimeRange = metricTime >= startTime && metricTime <= endTime;
      const matchesMetricType = !metricType || metric.type === metricType;
      const matchesServiceName = !serviceName || metric.serviceName === serviceName;
      return inTimeRange && matchesMetricType && matchesServiceName;
    });

    // 按时间倒序排序
    filteredMetrics = filteredMetrics.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // 应用分页
    if (offset !== undefined) {
      filteredMetrics = filteredMetrics.slice(offset);
    }
    if (limit !== undefined) {
      filteredMetrics = filteredMetrics.slice(0, limit);
    }

    return filteredMetrics;
  }

  /**
   * 保存可用性事件
   * @param event 可用性事件
   * @returns 保存后的可用性事件
   */
  async saveEvent(event: AvailabilityEvent): Promise<AvailabilityEvent> {
    this.events.set(event.id, event);
    return event;
  }

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
  async getEvents(startTime: Date, endTime: Date, eventType?: string, serviceName?: string, limit?: number, offset?: number): Promise<AvailabilityEvent[]> {
    let filteredEvents = Array.from(this.events.values()).filter(event => {
      const eventTime = new Date(event.timestamp);
      const inTimeRange = eventTime >= startTime && eventTime <= endTime;
      const matchesEventType = !eventType || event.type === eventType;
      const matchesServiceName = !serviceName || event.serviceName === serviceName;
      return inTimeRange && matchesEventType && matchesServiceName;
    });

    // 按时间倒序排序
    filteredEvents = filteredEvents.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // 应用分页
    if (offset !== undefined) {
      filteredEvents = filteredEvents.slice(offset);
    }
    if (limit !== undefined) {
      filteredEvents = filteredEvents.slice(0, limit);
    }

    return filteredEvents;
  }

  /**
   * 标记可用性事件为已处理
   * @param eventId 可用性事件ID
   * @returns 处理结果
   */
  async markEventAsProcessed(eventId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) {
      return false;
    }
    event.processed = true;
    this.events.set(eventId, event);
    return true;
  }

  /**
   * 保存可用性报告
   * @param report 可用性报告
   * @returns 保存后的可用性报告
   */
  async saveReport(report: AvailabilityReport): Promise<AvailabilityReport> {
    this.reports.push(report);
    return report;
  }

  /**
   * 获取可用性报告历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可用性报告历史列表
   */
  async getReportHistory(limit: number, offset: number): Promise<AvailabilityReport[]> {
    const sortedReports = [...this.reports].sort(
      (a, b) => new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime()
    );

    return sortedReports.slice(offset, offset + limit);
  }

  /**
   * 保存可用性测试结果
   * @param testResult 可用性测试结果
   * @returns 保存后的可用性测试结果
   */
  async saveTestResult(testResult: AvailabilityTestResult): Promise<AvailabilityTestResult> {
    this.testResults.set(testResult.id, testResult);
    return testResult;
  }

  /**
   * 获取可用性测试历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可用性测试历史列表
   */
  async getTestHistory(limit: number, offset: number): Promise<AvailabilityTestResult[]> {
    const sortedTestResults = Array.from(this.testResults.values()).sort(
      (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    );

    return sortedTestResults.slice(offset, offset + limit);
  }

  /**
   * 根据ID获取可用性测试结果
   * @param id 可用性测试结果ID
   * @returns 可用性测试结果
   */
  async getTestResultById(id: string): Promise<AvailabilityTestResult | null> {
    return this.testResults.get(id) || null;
  }

  /**
   * 获取未处理的可用性事件
   * @returns 未处理的可用性事件列表
   */
  async getUnprocessedEvents(): Promise<AvailabilityEvent[]> {
    return Array.from(this.events.values()).filter(event => !event.processed);
  }

  /**
   * 删除过期的健康检查结果
   * @param olderThan 过期时间
   * @returns 删除的结果数量
   */
  async deleteExpiredHealthCheckResults(olderThan: Date): Promise<number> {
    const initialCount = this.healthCheckResults.length;
    this.healthCheckResults = this.healthCheckResults.filter(result => new Date(result.checkTime) >= olderThan);
    return initialCount - this.healthCheckResults.length;
  }

  /**
   * 删除过期的可用性指标
   * @param olderThan 过期时间
   * @returns 删除的指标数量
   */
  async deleteExpiredMetrics(olderThan: Date): Promise<number> {
    const initialCount = this.metrics.length;
    this.metrics = this.metrics.filter(metric => new Date(metric.timestamp) >= olderThan);
    return initialCount - this.metrics.length;
  }

  /**
   * 删除过期的可用性事件
   * @param olderThan 过期时间
   * @returns 删除的事件数量
   */
  async deleteExpiredEvents(olderThan: Date): Promise<number> {
    const initialCount = this.events.size;
    for (const [id, event] of this.events.entries()) {
      if (new Date(event.timestamp) < olderThan) {
        this.events.delete(id);
      }
    }
    return initialCount - this.events.size;
  }
}
