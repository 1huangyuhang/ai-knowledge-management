/**
 * 可扩展性优化仓库实现
 * 使用内存存储来保存可扩展性配置、指标、事件、报告和测试结果
 */

import { ScalabilityOptimizationRepository } from '../../domain/repositories/ScalabilityOptimizationRepository';
import { ScalabilityConfig, ScalabilityMetric, ScalabilityEvent, ScalabilityReport, ScalabilityTestResult } from '../../domain/entities/ScalabilityConfig';

/**
 * 可扩展性优化仓库实现类
 */
export class ScalabilityOptimizationRepositoryImpl implements ScalabilityOptimizationRepository {
  private configs: Map<string, ScalabilityConfig> = new Map();
  private metrics: ScalabilityMetric[] = [];
  private events: Map<string, ScalabilityEvent> = new Map();
  private reports: ScalabilityReport[] = [];
  private testResults: Map<string, ScalabilityTestResult> = new Map();

  /**
   * 获取当前可扩展性配置
   * @returns 当前可扩展性配置
   */
  async getCurrentConfig(): Promise<ScalabilityConfig | null> {
    // 返回最新的可扩展性配置
    const sortedConfigs = Array.from(this.configs.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return sortedConfigs[0] || null;
  }

  /**
   * 保存可扩展性配置
   * @param config 可扩展性配置
   * @returns 保存后的可扩展性配置
   */
  async saveConfig(config: ScalabilityConfig): Promise<ScalabilityConfig> {
    this.configs.set(config.id, config);
    return config;
  }

  /**
   * 获取所有可扩展性配置
   * @returns 可扩展性配置列表
   */
  async getAllConfigs(): Promise<ScalabilityConfig[]> {
    return Array.from(this.configs.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * 根据ID获取可扩展性配置
   * @param id 可扩展性配置ID
   * @returns 可扩展性配置
   */
  async getConfigById(id: string): Promise<ScalabilityConfig | null> {
    return this.configs.get(id) || null;
  }

  /**
   * 删除可扩展性配置
   * @param id 可扩展性配置ID
   * @returns 删除结果
   */
  async deleteConfig(id: string): Promise<boolean> {
    return this.configs.delete(id);
  }

  /**
   * 保存可扩展性指标
   * @param metric 可扩展性指标
   * @returns 保存后的可扩展性指标
   */
  async saveMetric(metric: ScalabilityMetric): Promise<ScalabilityMetric> {
    this.metrics.push(metric);
    return metric;
  }

  /**
   * 获取可扩展性指标
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param resourceType 资源类型（可选）
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性指标列表
   */
  async getMetrics(startTime: Date, endTime: Date, resourceType?: string, limit?: number, offset?: number): Promise<ScalabilityMetric[]> {
    let filteredMetrics = this.metrics.filter(metric => {
      const metricTime = new Date(metric.timestamp);
      const inTimeRange = metricTime >= startTime && metricTime <= endTime;
      const matchesResourceType = !resourceType || metric.resourceType === resourceType;
      return inTimeRange && matchesResourceType;
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
   * 保存可扩展性事件
   * @param event 可扩展性事件
   * @returns 保存后的可扩展性事件
   */
  async saveEvent(event: ScalabilityEvent): Promise<ScalabilityEvent> {
    this.events.set(event.id, event);
    return event;
  }

  /**
   * 获取可扩展性事件
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param eventType 事件类型（可选）
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性事件列表
   */
  async getEvents(startTime: Date, endTime: Date, eventType?: string, limit?: number, offset?: number): Promise<ScalabilityEvent[]> {
    let filteredEvents = Array.from(this.events.values()).filter(event => {
      const eventTime = new Date(event.timestamp);
      const inTimeRange = eventTime >= startTime && eventTime <= endTime;
      const matchesEventType = !eventType || event.type === eventType;
      return inTimeRange && matchesEventType;
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
   * 标记可扩展性事件为已处理
   * @param eventId 可扩展性事件ID
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
   * 保存可扩展性报告
   * @param report 可扩展性报告
   * @returns 保存后的可扩展性报告
   */
  async saveReport(report: ScalabilityReport): Promise<ScalabilityReport> {
    this.reports.push(report);
    return report;
  }

  /**
   * 获取可扩展性报告历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性报告历史列表
   */
  async getReportHistory(limit: number, offset: number): Promise<ScalabilityReport[]> {
    const sortedReports = [...this.reports].sort(
      (a, b) => new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime()
    );

    return sortedReports.slice(offset, offset + limit);
  }

  /**
   * 保存可扩展性测试结果
   * @param testResult 可扩展性测试结果
   * @returns 保存后的可扩展性测试结果
   */
  async saveTestResult(testResult: ScalabilityTestResult): Promise<ScalabilityTestResult> {
    this.testResults.set(testResult.id, testResult);
    return testResult;
  }

  /**
   * 获取可扩展性测试历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 可扩展性测试历史列表
   */
  async getTestHistory(limit: number, offset: number): Promise<ScalabilityTestResult[]> {
    const sortedTestResults = Array.from(this.testResults.values()).sort(
      (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    );

    return sortedTestResults.slice(offset, offset + limit);
  }

  /**
   * 根据ID获取可扩展性测试结果
   * @param id 可扩展性测试结果ID
   * @returns 可扩展性测试结果
   */
  async getTestResultById(id: string): Promise<ScalabilityTestResult | null> {
    return this.testResults.get(id) || null;
  }

  /**
   * 获取未处理的可扩展性事件
   * @returns 未处理的可扩展性事件列表
   */
  async getUnprocessedEvents(): Promise<ScalabilityEvent[]> {
    return Array.from(this.events.values()).filter(event => !event.processed);
  }

  /**
   * 删除过期的可扩展性指标
   * @param olderThan 过期时间
   * @returns 删除的指标数量
   */
  async deleteExpiredMetrics(olderThan: Date): Promise<number> {
    const initialCount = this.metrics.length;
    this.metrics = this.metrics.filter(metric => new Date(metric.timestamp) >= olderThan);
    return initialCount - this.metrics.length;
  }

  /**
   * 删除过期的可扩展性事件
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
