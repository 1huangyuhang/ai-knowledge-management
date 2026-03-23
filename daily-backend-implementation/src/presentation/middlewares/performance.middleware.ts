/**
 * 性能监控中间件
 * 用于记录API响应时间、状态码等指标
 */
import { FastifyMiddleware } from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * 性能指标接口
 */
export interface MetricStats {
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  lastUpdated: number;
}

/**
 * 指标类
 */
export class Metric {
  private name: string;
  private values: number[] = [];
  private windowSize: number = 1000;
  
  constructor(name: string) {
    this.name = name;
  }
  
  addValue(value: number): void {
    this.values.push(value);
    
    // 保持固定窗口大小
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }
  }
  
  getStats(): MetricStats {
    const count = this.values.length;
    const sum = this.values.reduce((a, b) => a + b, 0);
    const avg = count > 0 ? sum / count : 0;
    const min = count > 0 ? Math.min(...this.values) : 0;
    const max = count > 0 ? Math.max(...this.values) : 0;
    
    // 计算百分位数
    const sorted = [...this.values].sort((a, b) => a - b);
    const p50 = this.getPercentile(sorted, 50);
    const p95 = this.getPercentile(sorted, 95);
    const p99 = this.getPercentile(sorted, 99);
    
    return {
      name: this.name,
      count,
      sum,
      avg,
      min,
      max,
      p50,
      p95,
      p99,
      lastUpdated: Date.now()
    };
  }
  
  private getPercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics: Map<string, Metric> = new Map();
  
  /**
   * 记录性能指标
   * @param name 指标名称
   * @param value 指标值
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, new Metric(name));
    }
    
    this.metrics.get(name)!.addValue(value);
  }
  
  /**
   * 获取指标统计信息
   * @param name 指标名称
   * @returns 指标统计信息，如果不存在则返回null
   */
  getMetricStats(name: string): MetricStats | null {
    const metric = this.metrics.get(name);
    return metric ? metric.getStats() : null;
  }
  
  /**
   * 获取所有指标
   * @returns 所有指标的统计信息
   */
  getAllMetrics(): Record<string, MetricStats> {
    const result: Record<string, MetricStats> = {};
    
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = metric.getStats();
    }
    
    return result;
  }
}

/**
 * 创建性能监控中间件
 * @param monitor 性能监控器
 * @returns Fastify中间件
 */
export function createPerformanceMiddleware(monitor: PerformanceMonitor): FastifyMiddleware {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const start = process.hrtime.bigint();
    
    reply.raw.on('finish', () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1e6; // 转换为毫秒
      
      // 记录响应时间指标
      monitor.recordMetric('response_time', duration);
      monitor.recordMetric(`response_time_${request.routeOptions.url}`, duration);
      
      // 记录状态码指标
      monitor.recordMetric(`status_${reply.statusCode}`, 1);
    });
  };
}
