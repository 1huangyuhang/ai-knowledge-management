# Day 21: 第一阶段 - 系统地基期 - Week 3 - 第21天 代码实现（第一部分）

## 系统集成器实现

### 1. 系统集成器设计

系统集成器负责初始化和管理所有系统组件，确保它们按照正确的顺序启动和关闭，处理组件之间的依赖关系。

```typescript
// src/infrastructure/system/SystemIntegrator.ts
import { DatabaseClient } from '../database/DatabaseClient';
import { EventSystem } from '../event-system/EventSystem';
import { LoggingSystem } from '../logging/LoggingSystem';
import { ErrorHandler } from '../error-handling/ErrorHandler';
import { ConfigManager } from './ConfigManager';

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
  loggingSystem: LoggingSystem;
  errorHandler: ErrorHandler;
  configManager: ConfigManager;
}

/**
 * 系统集成器
 * 负责初始化和管理所有系统组件
 */
export class SystemIntegrator {
  private config: SystemIntegratorConfig;
  private configManager: ConfigManager;
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
      this.configManager = new ConfigManager({
        configPath: this.config.configPath!,
        environment: this.config.environment!,
      });
      await this.configManager.load();
      this.components.configManager = this.configManager;

      // 2. 初始化日志系统
      const loggingSystem = new LoggingSystem({
        logLevel: this.configManager.get<string>('LOG_LEVEL', 'info'),
        logFormat: this.configManager.get<string>('LOG_FORMAT', 'json'),
      });
      this.components.loggingSystem = loggingSystem;
      loggingSystem.logInfo('Logging system initialized');

      // 3. 初始化错误处理器
      const errorHandler = new ErrorHandler({
        logger: loggingSystem,
      });
      this.components.errorHandler = errorHandler;
      loggingSystem.logInfo('Error handling system initialized');

      // 4. 初始化事件系统
      const eventSystem = new EventSystem();
      this.components.eventSystem = eventSystem;
      loggingSystem.logInfo('Event system initialized');

      // 5. 初始化数据库客户端
      const databaseUrl = this.configManager.get<string>('DATABASE_URL', ':memory:');
      const databaseClient = new DatabaseClient(databaseUrl);
      await databaseClient.connect();
      await databaseClient.initializeTables();
      this.components.databaseClient = databaseClient;
      loggingSystem.logInfo('Database client initialized');

      // 6. 设置全局错误处理
      process.on('uncaughtException', (error) => {
        errorHandler.handle(error, { context: 'global-uncaught-exception' });
        process.exit(1);
      });

      process.on('unhandledRejection', (reason) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        errorHandler.handle(error, { context: 'global-unhandled-rejection' });
      });

      this.isInitialized = true;
      loggingSystem.logInfo('System initialized successfully');

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
        loggingSystem?.logInfo('Database client disconnected');
      } catch (error) {
        loggingSystem?.logError('Error disconnecting database client', error as Error);
      }
    }

    if (this.components.eventSystem) {
      try {
        await this.components.eventSystem.shutdown();
        loggingSystem?.logInfo('Event system shut down');
      } catch (error) {
        loggingSystem?.logError('Error shutting down event system', error as Error);
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
```

## 配置管理器实现

### 1. 配置管理器设计

配置管理器负责加载和管理系统配置，支持多环境配置文件和环境变量覆盖。

```typescript
// src/infrastructure/system/ConfigManager.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * 配置管理器配置
 */
export interface ConfigManagerConfig {
  configPath: string;
  environment: string;
}

/**
 * 配置管理器
 * 负责加载和管理系统配置
 */
export class ConfigManager {
  private config: Record<string, any> = {};
  private readonly configPath: string;
  private readonly environment: string;

  /**
   * 创建配置管理器
   * @param config 配置管理器配置
   */
  constructor(config: ConfigManagerConfig) {
    this.configPath = config.configPath;
    this.environment = config.environment;
  }

  /**
   * 加载配置
   */
  public async load(): Promise<void> {
    // 1. 加载默认配置
    const defaultConfig = this.loadConfigFile('default.json');
    
    // 2. 加载环境配置
    const envConfig = this.loadConfigFile(`${this.environment}.json`);
    
    // 3. 合并配置
    this.config = { ...defaultConfig, ...envConfig };
    
    // 4. 环境变量覆盖配置
    this.applyEnvironmentVariables();
  }

  /**
   * 加载配置文件
   */
  private loadConfigFile(filename: string): Record<string, any> {
    const filePath = path.join(this.configPath, filename);
    
    if (!fs.existsSync(filePath)) {
      return {};
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Error loading config file ${filePath}:`, error);
      return {};
    }
  }

  /**
   * 应用环境变量覆盖
   */
  private applyEnvironmentVariables(): void {
    // 遍历所有配置项，检查是否有对应的环境变量
    for (const [key, value] of Object.entries(this.config)) {
      const envKey = key.toUpperCase();
      
      if (process.env[envKey] !== undefined) {
        // 根据值的类型转换环境变量
        if (typeof value === 'number') {
          this.config[key] = Number(process.env[envKey]);
        } else if (typeof value === 'boolean') {
          this.config[key] = process.env[envKey]?.toLowerCase() === 'true';
        } else {
          this.config[key] = process.env[envKey];
        }
      }
    }
    
    // 直接添加所有未在默认配置中定义的环境变量
    for (const [key, value] of Object.entries(process.env)) {
      if (!this.config[key] && !key.startsWith('npm_')) {
        this.config[key] = value;
      }
    }
  }

  /**
   * 获取配置值
   */
  public get<T>(key: string, defaultValue?: T): T {
    const value = this.config[key];
    
    if (value === undefined) {
      if (defaultValue === undefined) {
        throw new Error(`Config key "${key}" not found and no default value provided`);
      }
      return defaultValue;
    }
    
    return value as T;
  }

  /**
   * 设置配置值
   */
  public set<T>(key: string, value: T): void {
    this.config[key] = value;
  }

  /**
   * 获取所有配置
   */
  public getAll(): Record<string, any> {
    return { ...this.config };
  }
}
```

### 2. 配置文件示例

**default.json**
```json
{
  "PORT": 3000,
  "LOG_LEVEL": "info",
  "LOG_FORMAT": "json",
  "DATABASE_URL": ":memory:",
  "NODE_ENV": "development",
  "CORS_ORIGINS": ["*"],
  "METRICS_ENABLED": true,
  "HEALTH_CHECK_ENABLED": true
}
```

**production.json**
```json
{
  "PORT": 80,
  "LOG_LEVEL": "error",
  "LOG_FORMAT": "json",
  "DATABASE_URL": "./data/production.db",
  "NODE_ENV": "production",
  "CORS_ORIGINS": ["https://yourdomain.com"],
  "METRICS_ENABLED": true,
  "HEALTH_CHECK_ENABLED": true
}
```

## Express应用集成

### 1. Express应用配置

```typescript
// src/application/ExpressApp.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { SystemComponents } from '../infrastructure/system/SystemIntegrator';
import { createErrorMiddleware } from '../infrastructure/error-handling/error-middleware';
import { ThoughtController } from './controllers/ThoughtController';
import { InsightController } from './controllers/InsightController';
import { HealthController } from './controllers/HealthController';
import { MetricsController } from './controllers/MetricsController';

/**
 * Express应用配置
 */
export interface ExpressAppConfig {
  components: SystemComponents;
  port?: number;
}

/**
 * Express应用
 */
export class ExpressApp {
  private app: express.Application;
  private port: number;
  private components: SystemComponents;

  /**
   * 创建Express应用
   * @param config Express应用配置
   */
  constructor(config: ExpressAppConfig) {
    this.app = express();
    this.port = config.port || 3000;
    this.components = config.components;
    
    this.initializeMiddleware();
    this.initializeControllers();
    this.initializeErrorHandling();
  }

  /**
   * 初始化中间件
   */
  private initializeMiddleware(): void {
    // 安全中间件
    this.app.use(helmet());
    
    // CORS中间件
    const corsOrigins = this.components.configManager.get<string[]>('CORS_ORIGINS', ['*']);
    this.app.use(cors({
      origin: corsOrigins,
      credentials: true,
    }));
    
    // 压缩中间件
    this.app.use(compression());
    
    // JSON解析中间件
    this.app.use(express.json({
      limit: '1mb',
    }));
    
    // URL编码中间件
    this.app.use(express.urlencoded({
      extended: true,
    }));
    
    // 日志中间件
    const logLevel = this.components.configManager.get<string>('LOG_LEVEL', 'info');
    if (logLevel !== 'error') {
      this.app.use(morgan('combined'));
    }
  }

  /**
   * 初始化控制器
   */
  private initializeControllers(): void {
    const router = express.Router();
    
    // 初始化控制器
    const thoughtController = new ThoughtController(this.components);
    const insightController = new InsightController(this.components);
    const healthController = new HealthController(this.components);
    const metricsController = new MetricsController(this.components);
    
    // 注册路由
    router.use('/thoughts', thoughtController.getRoutes());
    router.use('/insights', insightController.getRoutes());
    router.use('/health', healthController.getRoutes());
    router.use('/metrics', metricsController.getRoutes());
    
    // API根路由
    router.get('/api', (req, res) => {
      res.json({
        name: 'AI Cognitive Assistant API',
        version: '1.0.0',
        status: 'running',
      });
    });
    
    // 注册API路由
    this.app.use('/api', router);
  }

  /**
   * 初始化错误处理
   */
  private initializeErrorHandling(): void {
    // 404处理
    this.app.use((req, res, next) => {
      const error = new Error(`Route not found: ${req.originalUrl}`);
      res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'NOT_FOUND',
          type: 'notFound',
        },
      });
    });
    
    // 错误中间件
    const errorMiddleware = createErrorMiddleware(this.components.errorHandler);
    this.app.use(errorMiddleware);
  }

  /**
   * 启动Express应用
   */
  public start(): void {
    this.app.listen(this.port, () => {
      this.components.loggingSystem.logInfo(`Server is running on port ${this.port}`);
      this.components.loggingSystem.logInfo(`Environment: ${this.components.configManager.get<string>('NODE_ENV')}`);
    });
  }

  /**
   * 获取Express应用实例
   */
  public getApp(): express.Application {
    return this.app;
  }
}
```

### 2. 健康检查控制器

```typescript
// src/application/controllers/HealthController.ts
import { Router, Request, Response } from 'express';
import { SystemComponents } from '../../infrastructure/system/SystemIntegrator';

/**
 * 健康检查控制器
 */
export class HealthController {
  private components: SystemComponents;

  /**
   * 创建健康检查控制器
   * @param components 系统组件
   */
  constructor(components: SystemComponents) {
    this.components = components;
  }

  /**
   * 获取路由
   */
  public getRoutes(): Router {
    const router = Router();
    
    // 健康检查端点
    router.get('/', this.checkHealth.bind(this));
    
    // 详细健康检查端点
    router.get('/detailed', this.checkDetailedHealth.bind(this));
    
    return router;
  }

  /**
   * 检查系统健康状态
   */
  private async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      // 检查数据库连接
      await this.components.databaseClient.ping();
      
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'ai-cognitive-assistant',
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'ai-cognitive-assistant',
      });
    }
  }

  /**
   * 检查详细健康状态
   */
  private async checkDetailedHealth(req: Request, res: Response): Promise<void> {
    try {
      // 检查数据库连接
      const dbPingResult = await this.components.databaseClient.ping();
      
      // 检查事件系统状态
      const eventSystemStatus = this.components.eventSystem.getStatus();
      
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'ai-cognitive-assistant',
        components: {
          database: {
            status: 'ok',
            ping: dbPingResult,
          },
          eventSystem: {
            status: eventSystemStatus.isRunning ? 'ok' : 'error',
            subscribersCount: eventSystemStatus.subscribersCount,
            eventsCount: eventSystemStatus.eventsCount,
          },
          logging: {
            status: 'ok',
          },
          errorHandling: {
            status: 'ok',
          },
        },
        environment: this.components.configManager.get<string>('NODE_ENV'),
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'ai-cognitive-assistant',
        error: (error as Error).message,
      });
    }
  }
}
```

### 3. 指标控制器

```typescript
// src/application/controllers/MetricsController.ts
import { Router, Request, Response } from 'express';
import { SystemComponents } from '../../infrastructure/system/SystemIntegrator';

/**
 * 性能指标类型
 */
export interface PerformanceMetrics {
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
  requestCount: number;
  errorCount: number;
}

/**
 * 指标控制器
 */
export class MetricsController {
  private components: SystemComponents;
  private requestCount: number = 0;
  private errorCount: number = 0;

  /**
   * 创建指标控制器
   * @param components 系统组件
   */
  constructor(components: SystemComponents) {
    this.components = components;
    
    // 注册请求计数中间件
    this.components.loggingSystem.logInfo('Metrics controller initialized');
  }

  /**
   * 获取路由
   */
  public getRoutes(): Router {
    const router = Router();
    
    // 性能指标端点
    router.get('/', this.getMetrics.bind(this));
    
    // Prometheus格式指标端点
    router.get('/prometheus', this.getPrometheusMetrics.bind(this));
    
    return router;
  }

  /**
   * 获取性能指标
   */
  private getMetrics(req: Request, res: Response): void {
    // 获取内存使用情况
    const memoryUsage = process.memoryUsage();
    
    // 获取CPU使用情况
    const cpuUsage = process.cpuUsage();
    
    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      requestCount: this.requestCount,
      errorCount: this.errorCount,
    };
    
    res.status(200).json(metrics);
  }

  /**
   * 获取Prometheus格式指标
   */
  private getPrometheusMetrics(req: Request, res: Response): void {
    // 获取内存使用情况
    const memoryUsage = process.memoryUsage();
    
    // 获取CPU使用情况
    const cpuUsage = process.cpuUsage();
    
    // 构建Prometheus格式指标
    const prometheusMetrics = `
# HELP process_uptime_seconds System uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${process.uptime()}

# HELP process_memory_rss_bytes Resident set size in bytes
# TYPE process_memory_rss_bytes gauge
process_memory_rss_bytes ${memoryUsage.rss}

# HELP process_memory_heap_total_bytes Total heap size in bytes
# TYPE process_memory_heap_total_bytes gauge
process_memory_heap_total_bytes ${memoryUsage.heapTotal}

# HELP process_memory_heap_used_bytes Used heap size in bytes
# TYPE process_memory_heap_used_bytes gauge
process_memory_heap_used_bytes ${memoryUsage.heapUsed}

# HELP process_cpu_user_seconds_total Total user CPU time in seconds
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total ${cpuUsage.user / 1000000}

# HELP process_cpu_system_seconds_total Total system CPU time in seconds
# TYPE process_cpu_system_seconds_total counter
process_cpu_system_seconds_total ${cpuUsage.system / 1000000}

# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${this.requestCount}

# HELP http_errors_total Total number of HTTP errors
# TYPE http_errors_total counter
http_errors_total ${this.errorCount}
`;
    
    res.set('Content-Type', 'text/plain');
    res.status(200).send(prometheusMetrics);
  }

  /**
   * 增加请求计数
   */
  public incrementRequestCount(): void {
    this.requestCount++;
  }

  /**
   * 增加错误计数
   */
  public incrementErrorCount(): void {
    this.errorCount++;
  }
}
```