// src/infrastructure/system/SystemBootstrapper.ts
import { SystemIntegrator } from './SystemIntegrator';
import { LoggerService } from '../logging/logger.service';
import { ConfigManager } from './ConfigManager';

/**
 * 系统启动器配置
 */
export interface SystemBootstrapperConfig {
  configPath?: string;
  environment?: string;
  port?: number;
  enableGracefulShutdown?: boolean;
  enableHealthCheck?: boolean;
  enableMetrics?: boolean;
}

/**
 * 系统启动器
 * 负责初始化和启动整个系统
 */
export class SystemBootstrapper {
  private readonly config: SystemBootstrapperConfig;
  private systemIntegrator: SystemIntegrator;
  private loggingSystem: LoggerService | null = null;

  /**
   * 创建系统启动器
   * @param config 启动器配置
   */
  constructor(config: SystemBootstrapperConfig = {}) {
    this.config = {
      environment: process.env.NODE_ENV || 'development',
      configPath: './config',
      port: parseInt(process.env.PORT || '3000'),
      enableGracefulShutdown: true,
      enableHealthCheck: true,
      enableMetrics: true,
      ...config,
    };

    this.systemIntegrator = new SystemIntegrator({
      configPath: this.config.configPath,
      environment: this.config.environment,
    });
  }

  /**
   * 启动系统
   */
  public async start(): Promise<void> {
    try {
      // 初始化系统集成器
      const components = await this.systemIntegrator.initialize();
      this.loggingSystem = components.loggingSystem;

      this.loggingSystem.info('System initialization completed successfully');

      // 创建并启动Express应用
      const port = this.config.port || 3000;
      
      // 导入ExpressApp（延迟导入避免循环依赖）
      const { ExpressApp } = await import('../../application/ExpressApp');
      const expressApp = new ExpressApp({
        components,
        port,
      });

      expressApp.start();
      this.loggingSystem.info(`Express application started on port ${port}`);

      // 配置优雅关闭
      if (this.config.enableGracefulShutdown) {
        this.configureGracefulShutdown();
      }

      this.loggingSystem.info('System startup completed successfully');
    } catch (error: any) {
      // 如果已经初始化了日志系统，使用日志系统记录错误
      if (this.loggingSystem) {
        this.loggingSystem.error('Failed to start system', error);
      } else {
        // 否则使用控制台记录错误
        console.error('Failed to start system:', error);
      }
      
      // 尝试关闭系统
      await this.shutdown();
      process.exit(1);
    }
  }

  /**
   * 配置优雅关闭
   */
  private configureGracefulShutdown(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGQUIT'];

    signals.forEach(signal => {
      process.on(signal, async () => {
        this.loggingSystem?.info(`Received ${signal} signal, shutting down gracefully...`);
        await this.shutdown();
        process.exit(0);
      });
    });
  }

  /**
   * 关闭系统
   */
  public async shutdown(): Promise<void> {
    this.loggingSystem?.info('Shutting down system...');
    
    try {
      await this.systemIntegrator.shutdown();
      this.loggingSystem?.info('System shutdown completed successfully');
    } catch (error: any) {
      this.loggingSystem?.error('Error during system shutdown', error);
      console.error('Error during system shutdown:', error);
    }
  }

  /**
   * 获取系统集成器
   */
  public getSystemIntegrator(): SystemIntegrator {
    return this.systemIntegrator;
  }
}
