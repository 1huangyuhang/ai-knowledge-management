// src/infrastructure/system/SystemIntegrator.ts
import { DatabaseClient } from '../database/database-connection';
import { EventSystem } from '../events/event-bus';
import { LoggerService } from '../logging/logger.service';
import { ErrorHandler } from '../error/error-handler';
import { ConfigManager } from './ConfigManager';
import { SystemMonitor } from '../monitoring/SystemMonitor';
import { configureDependencyInjection } from '../dependency-injection/DependencyConfig';
import { PinoLoggerService } from '../logging/pino-logger.service';
import { HealthChecker, healthChecker } from '../monitoring/HealthChecker';
import { ModuleRegistry, moduleRegistry } from './ModuleRegistry';
import { DataFlowManager, dataFlowManager } from './DataFlowManager';

/**
 * 系统集成器配置
 */
export interface SystemIntegratorConfig {
  configPath?: string;
  environment?: string;
}

/**
 * 系统组件类型
 */
export interface SystemComponents {
  databaseClient: DatabaseClient;
  eventSystem: EventSystem;
  loggingSystem: LoggerService;
  errorHandler: ErrorHandler;
  configManager: ConfigManager;
  systemMonitor: SystemMonitor;
  healthChecker: HealthChecker;
  moduleRegistry: ModuleRegistry;
  dataFlowManager: DataFlowManager;
}

/**
 * 系统集成器
 * 负责初始化和管理所有系统组件
 */
export class SystemIntegrator {
  private config: SystemIntegratorConfig;
  private components: Partial<SystemComponents> = {};
  private isInitialized = false;

  /**
   * 创建系统集成器
   * @param config 系统集成器配置
   */
  constructor(config: SystemIntegratorConfig = {}) {
    this.config = {
      environment: process.env.NODE_ENV || 'development',
      configPath: './config',
      ...config,
    };
  }

  /**
   * 初始化系统
   */
  public async initialize(): Promise<SystemComponents> {
    if (this.isInitialized) {
      return this.components as SystemComponents;
    }

    try {
      // 1. 初始化配置管理器
      this.components.configManager = new ConfigManager({
        configPath: this.config.configPath!,
        environment: this.config.environment!,
      });
      await this.components.configManager.load();

      // 2. 初始化日志系统
      const logLevel = this.components.configManager.get<string>('LOG_LEVEL', 'info');
      const logFormat = this.components.configManager.get<string>('LOG_FORMAT', 'json');
      this.components.loggingSystem = new PinoLoggerService({ logLevel, logFormat });
      this.components.loggingSystem.info('Logging system initialized');

      // 3. 初始化错误处理器
      this.components.errorHandler = new ErrorHandler(this.components.loggingSystem);
      this.components.loggingSystem.info('Error handling system initialized');

      // 4. 初始化事件系统
      this.components.eventSystem = new EventSystem();
      this.components.loggingSystem.info('Event system initialized');

      // 5. 初始化数据库客户端
      const databaseUrl = this.components.configManager.get<string>('DATABASE_URL', ':memory:');
      this.components.databaseClient = new DatabaseClient(databaseUrl);
      await this.components.databaseClient.connect();
      await this.components.databaseClient.initializeTables();
      this.components.loggingSystem.info('Database client initialized');

      // 6. 初始化系统监控器
      this.components.systemMonitor = new SystemMonitor(
        this.components.loggingSystem,
        this.components.databaseClient,
        this.components.eventSystem
      );
      this.components.loggingSystem.info('System monitor initialized');

      // 7. 初始化模块注册表
      this.components.moduleRegistry = moduleRegistry;
      this.components.loggingSystem.info('Module registry initialized');

      // 8. 初始化健康检查器
      this.components.healthChecker = healthChecker;
      this.components.loggingSystem.info('Health checker initialized');

      // 9. 初始化数据流转管理器
      this.components.dataFlowManager = dataFlowManager;
      this.components.loggingSystem.info('Data flow manager initialized');

      // 10. 配置依赖注入
      configureDependencyInjection(this.components.configManager, this.components.loggingSystem);
      this.components.loggingSystem.info('Dependency injection configured');

      // 8. 设置全局错误处理
      process.on('uncaughtException', (error) => {
        this.components.errorHandler!.handle(error, { context: 'global-uncaught-exception' });
        process.exit(1);
      });

      process.on('unhandledRejection', (reason) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        this.components.errorHandler!.handle(error, { context: 'global-unhandled-rejection' });
      });

      this.isInitialized = true;
      this.components.loggingSystem.info('System initialized successfully');

      return this.components as SystemComponents;
    } catch (error) {
      // 如果初始化失败，清理已初始化的组件
      await this.shutdown();
      throw error;
    }
  }

  /**
   * 关闭系统
   */
  public async shutdown(): Promise<void> {
    const loggingSystem = this.components.loggingSystem;

    if (this.components.databaseClient) {
      try {
        await this.components.databaseClient.disconnect();
        loggingSystem?.info('Database client disconnected');
      } catch (error) {
        loggingSystem?.error('Error disconnecting database client', error as Error);
      }
    }

    if (this.components.eventSystem) {
      try {
        await this.components.eventSystem.shutdown();
        loggingSystem?.info('Event system shut down');
      } catch (error) {
        loggingSystem?.error('Error shutting down event system', error as Error);
      }
    }

    if (this.components.loggingSystem) {
      try {
        await this.components.loggingSystem.shutdown();
      } catch (error) {
        console.error('Error shutting down logging system:', error);
      }
    }

    this.isInitialized = false;
    this.components = {};
  }

  /**
   * 获取系统组件
   */
  public getComponents(): Partial<SystemComponents> {
    return this.components;
  }

  /**
   * 检查系统是否已初始化
   */
  public getIsInitialized(): boolean {
    return this.isInitialized;
  }
}