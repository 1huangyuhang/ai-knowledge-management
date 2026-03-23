// src/infrastructure/monitoring/SystemMonitor.ts
import { LoggerService } from '../logging/logger.service';

/**
 * 系统监控指标
 */
export interface SystemMetrics {
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  database: {
    connected: boolean;
    queryCount: number;
    errorCount: number;
  };
  events: {
    published: number;
    processed: number;
    failed: number;
  };
  requests: {
    total: number;
    errors: number;
    averageResponseTime: number;
  };
}

/**
 * 系统监控器
 */
export class SystemMonitor {
  private readonly loggingSystem: LoggerService;
  private readonly metrics: SystemMetrics;
  private requestStartTimeMap: Map<string, number> = new Map();

  /**
   * 创建系统监控器
   * @param loggingSystem 日志系统
   */
  constructor(
    loggingSystem: LoggerService
  ) {
    this.loggingSystem = loggingSystem;
    
    this.metrics = {
      timestamp: new Date().toISOString(),
      uptime: 0,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      database: {
        connected: false,
        queryCount: 0,
        errorCount: 0,
      },
      events: {
        published: 0,
        processed: 0,
        failed: 0,
      },
      requests: {
        total: 0,
        errors: 0,
        averageResponseTime: 0,
      },
    };

    // 定期更新指标
    this.startMetricsUpdate();
  }

  /**
   * 开始定期更新指标
   */
  private startMetricsUpdate(): void {
    setInterval(() => {
      this.updateMetrics();
    }, 10000); // 每10秒更新一次
  }

  /**
   * 更新指标
   */
  private updateMetrics(): void {
    this.metrics.timestamp = new Date().toISOString();
    this.metrics.uptime = process.uptime();
    this.metrics.memory = process.memoryUsage();
    this.metrics.cpu = process.cpuUsage();
  }

  /**
   * 记录请求开始
   * @param requestId 请求ID
   */
  public recordRequestStart(requestId: string): void {
    this.metrics.requests.total++;
    this.requestStartTimeMap.set(requestId, Date.now());
  }

  /**
   * 记录请求结束
   * @param requestId 请求ID
   * @param error 是否是错误请求
   */
  public recordRequestEnd(requestId: string, error: boolean = false): void {
    const startTime = this.requestStartTimeMap.get(requestId);
    if (startTime) {
      const responseTime = Date.now() - startTime;
      // 更新平均响应时间（简单实现）
      this.metrics.requests.averageResponseTime = 
        (this.metrics.requests.averageResponseTime * (this.metrics.requests.total - 1) + responseTime) / this.metrics.requests.total;
      
      this.requestStartTimeMap.delete(requestId);
    }
    
    if (error) {
      this.metrics.requests.errors++;
    }
  }

  /**
   * 获取当前指标
   */
  public getMetrics(): SystemMetrics {
    // 更新当前指标
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * 记录系统事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  public logSystemEvent(eventName: string, data: any = {}): void {
    this.loggingSystem.info(`System Event: ${eventName}`, data);
  }

  /**
   * 检查系统健康状态
   */
  public async checkHealth(): Promise<{
    status: 'ok' | 'degraded' | 'error';
    components: {
      database: 'ok' | 'error';
      events: 'ok' | 'error';
      memory: 'ok' | 'warning' | 'error';
      cpu: 'ok' | 'warning' | 'error';
    };
  }> {
    // 检查数据库连接
    const databaseStatus = 'ok'; // 简单实现
    
    // 检查事件系统
    const eventsStatus = 'ok'; // 简单实现
    
    // 检查内存使用情况
    const memoryStatus = this.checkMemoryUsage();
    
    // 检查CPU使用情况
    const cpuStatus = this.checkCpuUsage();
    
    // 确定整体状态
    let overallStatus: 'ok' | 'degraded' | 'error' = 'ok';
    if (memoryStatus === 'error' || cpuStatus === 'error') {
      overallStatus = 'degraded';
    } else if (memoryStatus === 'warning' || cpuStatus === 'warning') {
      overallStatus = 'degraded';
    }
    
    return {
      status: overallStatus,
      components: {
        database: databaseStatus,
        events: eventsStatus,
        memory: memoryStatus,
        cpu: cpuStatus,
      },
    };
  }

  /**
   * 检查内存使用情况
   */
  private checkMemoryUsage(): 'ok' | 'warning' | 'error' {
    const memoryUsage = process.memoryUsage();
    const rssMB = memoryUsage.rss / 1024 / 1024;
    
    if (rssMB > 1024) { // 超过1GB
      return 'error';
    } else if (rssMB > 512) { // 超过512MB
      return 'warning';
    }
    return 'ok';
  }

  /**
   * 检查CPU使用情况
   */
  private checkCpuUsage(): 'ok' | 'warning' | 'error' {
    // 简单实现，实际应该使用更复杂的CPU使用率计算
    return 'ok';
  }
}
