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
   * 详细信息（可选）
   */
  details?: Record<string, any>;
  /**
   * 错误信息（可选）
   */
  error?: string;
}

/**
 * 健康状态接口
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
   * 系统信息（可选）
   */
  systemInfo?: Record<string, any>;
}

/**
 * 健康指示器接口
 */
export interface HealthIndicator {
  /**
   * 模块ID
   */
  moduleId: string;
  /**
   * 执行健康检查
   */
  check(): Promise<HealthCheckResult>;
}

/**
 * 健康检查器接口
 */
export interface HealthChecker {
  /**
   * 执行完整健康检查
   */
  checkHealth(): Promise<HealthStatus>;
  
  /**
   * 注册健康指示器
   * @param indicator 健康指示器
   */
  registerHealthIndicator(indicator: HealthIndicator): Promise<void>;
  
  /**
   * 注销健康指示器
   * @param moduleId 模块ID
   */
  unregisterHealthIndicator(moduleId: string): Promise<void>;
  
  /**
   * 检查单个模块健康状态
   * @param moduleId 模块ID
   */
  checkModuleHealth(moduleId: string): Promise<HealthCheckResult | null>;
}

/**
 * 默认健康检查器实现
 */
export class DefaultHealthChecker implements HealthChecker {
  /**
   * 存储健康指示器的映射
   */
  private indicators: Map<string, HealthIndicator> = new Map();
  
  /**
   * 执行完整健康检查
   */
  async checkHealth(): Promise<HealthStatus> {
    const moduleResults: Record<string, HealthCheckResult> = {};
    let overallStatus = HealthStatusType.UP;
    
    // 并行检查所有模块
    const results = await Promise.allSettled(
      Array.from(this.indicators.values()).map(async (indicator) => {
        try {
          const result = await indicator.check();
          moduleResults[indicator.moduleId] = result;
          
          // 更新整体状态
          if (result.status === HealthStatusType.DOWN) {
            overallStatus = HealthStatusType.DOWN;
          } else if (result.status === HealthStatusType.DEGRADED && overallStatus === HealthStatusType.UP) {
            overallStatus = HealthStatusType.DEGRADED;
          }
        } catch (error) {
          moduleResults[indicator.moduleId] = {
            status: HealthStatusType.DOWN,
            error: error instanceof Error ? error.message : String(error)
          };
          overallStatus = HealthStatusType.DOWN;
        }
      })
    );
    
    return {
      status: overallStatus,
      timestamp: Date.now(),
      modules: moduleResults,
      systemInfo: {
        nodeVersion: process.version,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };
  }
  
  /**
   * 注册健康指示器
   * @param indicator 健康指示器
   */
  async registerHealthIndicator(indicator: HealthIndicator): Promise<void> {
    this.indicators.set(indicator.moduleId, indicator);
  }
  
  /**
   * 注销健康指示器
   * @param moduleId 模块ID
   */
  async unregisterHealthIndicator(moduleId: string): Promise<void> {
    this.indicators.delete(moduleId);
  }
  
  /**
   * 检查单个模块健康状态
   * @param moduleId 模块ID
   */
  async checkModuleHealth(moduleId: string): Promise<HealthCheckResult | null> {
    const indicator = this.indicators.get(moduleId);
    if (!indicator) {
      return null;
    }
    
    try {
      return await indicator.check();
    } catch (error) {
      return {
        status: HealthStatusType.DOWN,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

/**
 * 健康检查器实例
 */
export const healthChecker = new DefaultHealthChecker();
