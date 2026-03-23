import { DatabaseConnection } from '../infrastructure/database/database-connection';
import { InMemoryEventBus } from '../infrastructure/events/event-bus';
import { PinoLoggerService } from '../infrastructure/logging/pino-logger.service';
import { ResourceManager } from './resource-manager';
import { DefaultErrorHandler as ErrorHandler } from '../infrastructure/error/error-handler';

/**
 * 测试工具函数
 */
export class TestUtils {
  /**
   * 创建测试环境
   */
  public static async createTestEnvironment() {
    // 获取数据库连接单例实例
    const databaseConnection = DatabaseConnection.getInstance();
    await databaseConnection.initialize();
    
    // 创建其他基础设施组件
    const eventBus = new InMemoryEventBus();
    const logger = new PinoLoggerService();
    const errorHandler = new ErrorHandler(logger, false);
    
    // 创建资源管理器
    const resourceManager = new ResourceManager();
    
    return {
      databaseConnection,
      eventBus,
      logger,
      errorHandler,
      resourceManager,
    };
  }

  /**
   * 清理测试环境
   */
  public static async cleanupTestEnvironment(environment: ReturnType<typeof TestUtils.createTestEnvironment> extends Promise<infer T> ? T : never) {
    await environment.resourceManager.cleanup();
    await environment.databaseConnection.close();
  }

  /**
   * 等待指定时间
   * @param ms 毫秒数
   */
  public static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 捕获异步函数的错误
   * @param fn 异步函数
   */
  public static async catchError<T extends (...args: any[]) => Promise<any>>(fn: T): Promise<Error | null> {
    try {
      await fn();
      return null;
    } catch (error) {
      return error as Error;
    }
  }
}