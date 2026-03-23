/**
 * 健康状态类型枚举
 */
export enum HealthStatusType {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED'
}

/**
 * 健康检查结果接口
 */
export interface HealthCheckResult {
  /**
   * 健康状态
   */
  status: HealthStatusType;
  
  /**
   * 详细信息
   */
  details?: Record<string, any>;
  
  /**
   * 检查时间
   */
  timestamp: string;
}

/**
 * 健康检查指示器接口
 */
export interface HealthIndicator {
  /**
   * 执行健康检查
   */
  check(): Promise<HealthCheckResult>;
}

/**
 * 系统健康状态接口
 */
export interface HealthStatus {
  /**
   * 整体健康状态
   */
  status: HealthStatusType;
  
  /**
   * 检查时间戳
   */
  timestamp: number;
  
  /**
   * 各模块健康状态
   */
  modules: Record<string, HealthCheckResult>;
  
  /**
   * 系统指标
   */
  metrics?: {
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
  };
}

/**
 * 健康检查器接口
 */
export interface HealthChecker {
  /**
   * 执行全面健康检查
   */
  checkHealth(): Promise<HealthStatus>;
  
  /**
   * 为模块注册健康检查指示器
   * @param moduleId 模块ID
   * @param indicator 健康检查指示器
   */
  registerHealthIndicator(moduleId: string, indicator: HealthIndicator): Promise<void>;
  
  /**
   * 移除模块的健康检查指示器
   * @param moduleId 模块ID
   */
  removeHealthIndicator(moduleId: string): Promise<void>;
}

/**
 * 健康检查器实现
 */
export class DefaultHealthChecker implements HealthChecker {
  private healthIndicators: Map<string, HealthIndicator> = new Map();
  
  /**
   * 执行全面健康检查
   */
  async checkHealth(): Promise<HealthStatus> {
    const moduleResults: Record<string, HealthCheckResult> = {};
    let overallStatus = HealthStatusType.UP;
    
    // 并行检查所有模块
    await Promise.all(
      Array.from(this.healthIndicators.entries()).map(async ([moduleId, indicator]) => {
        try {
          const result = await indicator.check();
          moduleResults[moduleId] = result;
          
          // 更新整体状态
          if (result.status === HealthStatusType.DOWN) {
            overallStatus = HealthStatusType.DOWN;
          } else if (result.status === HealthStatusType.DEGRADED && overallStatus === HealthStatusType.UP) {
            overallStatus = HealthStatusType.DEGRADED;
          }
        } catch (error) {
          moduleResults[moduleId] = {
            status: HealthStatusType.DOWN,
            details: { error: String(error) },
            timestamp: new Date().toISOString()
          };
          overallStatus = HealthStatusType.DOWN;
        }
      })
    );
    
    // 添加系统指标
    const systemMetrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
    
    return {
      status: overallStatus,
      timestamp: Date.now(),
      modules: moduleResults,
      metrics: systemMetrics
    };
  }
  
  /**
   * 为模块注册健康检查指示器
   * @param moduleId 模块ID
   * @param indicator 健康检查指示器
   */
  async registerHealthIndicator(moduleId: string, indicator: HealthIndicator): Promise<void> {
    this.healthIndicators.set(moduleId, indicator);
  }
  
  /**
   * 移除模块的健康检查指示器
   * @param moduleId 模块ID
   */
  async removeHealthIndicator(moduleId: string): Promise<void> {
    this.healthIndicators.delete(moduleId);
  }
}

/**
 * 健康检查器实例
 */
export const healthChecker = new DefaultHealthChecker();
