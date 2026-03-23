# Day 27: 第一阶段 - 系统地基期 - Week 4 - 第27天 代码实现

## Bug 修复实现

### 1. 依赖注入容器修复

```typescript
// src/infrastructure/dependency-injection/DependencyContainer.ts (修复)

/**
 * 简单的依赖注入容器实现
 */
export class SimpleDependencyContainer implements DependencyContainer {
  private readonly dependencies: Map<string, any> = new Map();
  private readonly singletonInstances: Map<string, any> = new Map();
  private readonly isSingleton: Set<string> = new Set();

  /**
   * 注册依赖
   * @param key 依赖键
   * @param factory 依赖工厂函数
   */
  public register<T>(key: string, factory: () => T): void {
    this.dependencies.set(key, factory);
    this.isSingleton.delete(key);
  }

  /**
   * 注册单例依赖
   * @param key 依赖键
   * @param factory 依赖工厂函数
   */
  public registerSingleton<T>(key: string, factory: () => T): void {
    this.dependencies.set(key, factory);
    this.isSingleton.add(key);
  }

  /**
   * 解析依赖
   * @param key 依赖键
   * @returns 依赖实例
   */
  public resolve<T>(key: string): T {
    if (!this.dependencies.has(key)) {
      throw new Error(`Dependency not found: ${key}`);
    }

    // 如果是单例，检查是否已经创建了实例
    if (this.isSingleton.has(key) && this.singletonInstances.has(key)) {
      return this.singletonInstances.get(key) as T;
    }

    const factory = this.dependencies.get(key);
    const instance = factory();

    // 如果是单例，保存实例
    if (this.isSingleton.has(key)) {
      this.singletonInstances.set(key, instance);
    }

    return instance;
  }

  /**
   * 检查依赖是否已注册
   * @param key 依赖键
   * @returns 是否已注册
   */
  public has(key: string): boolean {
    return this.dependencies.has(key);
  }

  /**
   * 清除所有依赖
   */
  public clear(): void {
    this.dependencies.clear();
    this.singletonInstances.clear();
    this.isSingleton.clear();
  }
}
```

### 2. 系统配置加载器修复

```typescript
// src/infrastructure/system/SystemConfigLoader.ts (修复)

/**
 * 系统配置加载器
 */
export class SystemConfigLoader {
  private configManager: ConfigManager;
  private loggingSystem: LoggingSystem | null = null;

  /**
   * 创建系统配置加载器
   * @param configPath 配置文件路径
   * @param environment 环境
   */
  constructor(configPath: string, environment: string) {
    this.configManager = new ConfigManager({
      configPath,
      environment,
    });
  }

  /**
   * 加载系统配置
   */
  public async load(): Promise<SystemConfig> {
    // 加载配置文件
    await this.configManager.load();

    // 初始化日志系统
    const logLevel = this.configManager.get<string>('LOG_LEVEL', 'info');
    const logFormat = this.configManager.get<string>('LOG_FORMAT', 'json');
    this.loggingSystem = new LoggingSystem({
      logLevel,
      logFormat,
    });

    // 验证配置
    const config = this.validateConfig();

    this.loggingSystem.logInfo('System configuration loaded successfully', {
      environment: config.NODE_ENV,
      port: config.PORT,
      databaseUrl: config.DATABASE_URL,
      logLevel: config.LOG_LEVEL,
      metricsEnabled: config.METRICS_ENABLED,
      healthCheckEnabled: config.HEALTH_CHECK_ENABLED,
    });

    return config;
  }

  /**
   * 验证配置
   */
  private validateConfig(): SystemConfig {
    // 从配置管理器获取配置，支持环境变量覆盖
    const config: SystemConfig = {
      PORT: this.configManager.get<number>('PORT', 3000),
      NODE_ENV: this.configManager.get<string>('NODE_ENV', 'development'),
      LOG_LEVEL: this.configManager.get<string>('LOG_LEVEL', 'info'),
      LOG_FORMAT: this.configManager.get<string>('LOG_FORMAT', 'json'),
      DATABASE_URL: this.configManager.get<string>('DATABASE_URL', ':memory:'),
      CORS_ORIGINS: this.parseCorsOrigins(),
      METRICS_ENABLED: this.configManager.get<boolean>('METRICS_ENABLED', true),
      HEALTH_CHECK_ENABLED: this.configManager.get<boolean>('HEALTH_CHECK_ENABLED', true),
      REQUEST_LOGGING_ENABLED: this.configManager.get<boolean>('REQUEST_LOGGING_ENABLED', true),
      ERROR_DETAILS_ENABLED: this.configManager.get<boolean>('ERROR_DETAILS_ENABLED', false),
    };

    // 验证必填配置
    if (!config.NODE_ENV) {
      throw new Error('NODE_ENV is required');
    }

    if (!config.PORT || isNaN(config.PORT)) {
      throw new Error('PORT must be a valid number');
    }

    return config;
  }

  /**
   * 解析CORS来源
   */
  private parseCorsOrigins(): string[] {
    const corsOrigins = this.configManager.get<string>('CORS_ORIGINS', '*');
    
    if (corsOrigins === '*') {
      return ['*'];
    }
    
    try {
      return JSON.parse(corsOrigins);
    } catch (error) {
      return corsOrigins.split(',').map(origin => origin.trim());
    }
  }

  /**
   * 获取配置管理器
   */
  public getConfigManager(): ConfigManager {
    return this.configManager;
  }

  /**
   * 获取日志系统
   */
  public getLoggingSystem(): LoggingSystem {
    if (!this.loggingSystem) {
      throw new Error('LoggingSystem not initialized yet');
    }
    return this.loggingSystem;
  }
}
```

### 3. 集成测试修复

```typescript
// src/integration-tests/system-integration.test.ts (修复)
import request from 'supertest';
import { SystemBootstrapper } from '../infrastructure/system/SystemBootstrapper';
import { ExpressApp } from '../application/ExpressApp';
import { SystemIntegrator } from '../infrastructure/system/SystemIntegrator';
import { DatabaseClient } from '../infrastructure/database/DatabaseClient';

describe('System Integration Tests', () => {
  let systemBootstrapper: SystemBootstrapper;
  let systemIntegrator: SystemIntegrator;
  let databaseClient: DatabaseClient;
  let expressApp: ExpressApp;
  let server: any;

  beforeAll(async () => {
    // 初始化系统集成器
    systemIntegrator = new SystemIntegrator({
      environment: 'test',
    });
    
    const components = await systemIntegrator.initialize();
    databaseClient = components.databaseClient;
    
    // 创建Express应用
    expressApp = new ExpressApp({
      components,
      port: 0, // 使用随机端口
    });
    
    // 启动Express应用
    server = expressApp.start();
  });

  afterAll(async () => {
    // 关闭Express服务器
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    // 关闭系统集成器
    await systemIntegrator.shutdown();
  });

  describe('API Integration', () => {
    it('should handle health check endpoint', async () => {
      const response = await request(expressApp.getApp()).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'ai-cognitive-assistant');
    });

    it('should handle thoughts endpoint', async () => {
      // 创建一个思维片段
      const createResponse = await request(expressApp.getApp())
        .post('/api/thoughts')
        .send({
          content: '测试思维片段',
          tags: ['测试', '集成测试'],
        });
      
      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('success', true);
      expect(createResponse.body.data).toHaveProperty('id');
      expect(createResponse.body.data).toHaveProperty('content', '测试思维片段');
      
      // 获取思维片段列表
      const listResponse = await request(expressApp.getApp()).get('/api/thoughts');
      expect(listResponse.status).toBe(200);
      expect(listResponse.body).toHaveProperty('success', true);
      expect(listResponse.body.data).toHaveProperty('thoughts');
      expect(Array.isArray(listResponse.body.data.thoughts)).toBe(true);
    });

    it('should handle insights endpoint', async () => {
      const response = await request(expressApp.getApp()).get('/api/insights/themes');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Database Integration', () => {
    it('should be able to connect to database', async () => {
      const pingResult = await databaseClient.ping();
      expect(pingResult).toBe(true);
    });

    it('should be able to execute queries', async () => {
      // 测试数据库查询
      const result = await databaseClient.executeQuery('SELECT 1 AS test');
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
      expect(Array.isArray(result.rows)).toBe(true);
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('System Components Integration', () => {
    it('should have all required components initialized', async () => {
      const components = systemIntegrator.getComponents();
      expect(components).toHaveProperty('databaseClient');
      expect(components).toHaveProperty('eventSystem');
      expect(components).toHaveProperty('loggingSystem');
      expect(components).toHaveProperty('errorHandler');
      expect(components).toHaveProperty('configManager');
      expect(components).toHaveProperty('systemMonitor');
    });

    it('should be able to log messages', async () => {
      const loggingSystem = systemIntegrator.getComponents().loggingSystem;
      if (loggingSystem) {
        // 测试日志系统
        loggingSystem.logInfo('Test log message from integration test');
        // 这里我们只能验证日志系统不会抛出错误，实际日志内容的验证需要更复杂的设置
        expect(true).toBe(true);
      } else {
        fail('LoggingSystem not available');
      }
    });
  });
});
```

### 4. 系统监控器修复

```typescript
// src/infrastructure/monitoring/SystemMonitor.ts (修复)

/**
 * 系统监控器
 */
export class SystemMonitor {
  private readonly loggingSystem: LoggingSystem;
  private readonly databaseClient: DatabaseClient;
  private readonly eventSystem: EventSystem;
  private readonly metrics: SystemMetrics;
  private readonly startTime: number;
  private requestStartTimeMap: Map<string, number> = new Map();
  private lastCpuUsage: NodeJS.CpuUsage;
  private lastCpuCheckTime: number;

  /**
   * 创建系统监控器
   * @param loggingSystem 日志系统
   * @param databaseClient 数据库客户端
   * @param eventSystem 事件系统
   */
  constructor(
    loggingSystem: LoggingSystem,
    databaseClient: DatabaseClient,
    eventSystem: EventSystem
  ) {
    this.loggingSystem = loggingSystem;
    this.databaseClient = databaseClient;
    this.eventSystem = eventSystem;
    this.startTime = Date.now();
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuCheckTime = Date.now();
    
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

    // 注册事件监听器
    this.registerEventListeners();
    
    // 定期更新指标
    this.startMetricsUpdate();
  }

  /**
   * 检查CPU使用情况
   */
  private checkCpuUsage(): 'ok' | 'warning' | 'error' {
    const currentTime = Date.now();
    const currentCpuUsage = process.cpuUsage();
    const timeDiff = (currentTime - this.lastCpuCheckTime) / 1000; // 转换为秒
    
    // 计算CPU使用率
    const cpuUserDiff = currentCpuUsage.user - this.lastCpuUsage.user;
    const cpuSystemDiff = currentCpuUsage.system - this.lastCpuUsage.system;
    const cpuTotalDiff = cpuUserDiff + cpuSystemDiff;
    
    // CPU使用率 = (CPU时间差 / (时间差 * 1000000)) * 100
    // 1000000是因为process.cpuUsage()返回的是微秒
    const cpuUsagePercent = (cpuTotalDiff / (timeDiff * 1000000)) * 100;
    
    // 更新上次检查时间和CPU使用率
    this.lastCpuUsage = currentCpuUsage;
    this.lastCpuCheckTime = currentTime;
    
    if (cpuUsagePercent > 90) {
      return 'error';
    } else if (cpuUsagePercent > 70) {
      return 'warning';
    }
    return 'ok';
  }
}
```

### 5. 系统健康检查控制器修复

```typescript
// src/application/controllers/SystemHealthController.ts (修复)

/**
 * 系统健康检查控制器
 */
export class SystemHealthController {
  private readonly router: Router;
  private readonly components: SystemComponents;
  private readonly systemMonitor: SystemMonitor;

  /**
   * 创建系统健康检查控制器
   * @param components 系统组件
   * @param systemMonitor 系统监控器
   */
  constructor(components: SystemComponents, systemMonitor: SystemMonitor) {
    this.router = Router();
    this.components = components;
    this.systemMonitor = systemMonitor;
    
    this.initializeRoutes();
  }

  /**
   * 获取系统状态
   */
  private async getSystemStatus(req: Request, res: Response): Promise<void> {
    try {
      const components = this.components;
      
      // 检查数据库连接状态
      const isDatabaseConnected = await components.databaseClient.ping();
      
      res.status(200).json({
        success: true,
        data: {
          system: {
            status: 'running',
            version: '1.0.0',
            environment: components.configManager.get<string>('NODE_ENV'),
            uptime: process.uptime(),
          },
          components: {
            database: {
              type: 'sqlite',
              connected: isDatabaseConnected,
            },
            eventSystem: {
              status: 'running',
            },
            loggingSystem: {
              status: 'running',
              logLevel: components.configManager.get<string>('LOG_LEVEL', 'info'),
            },
            configManager: {
              status: 'running',
            },
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: '获取系统状态失败',
          code: 'STATUS_FETCH_FAILED',
          type: 'systemError',
        },
      });
    }
  }
}
```

### 6. Express应用修复

```typescript
// src/application/ExpressApp.ts (修复)

/**
 * Express应用
 */
export class ExpressApp {
  private readonly app: Express;
  private readonly config: ExpressAppConfig;
  private server: any = null;

  /**
   * 创建Express应用
   * @param config Express应用配置
   */
  constructor(config: ExpressAppConfig) {
    this.config = {
      port: 3000,
      ...config,
    };

    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * 启动Express应用
   * @returns 服务器实例
   */
  public start(): any {
    if (this.server) {
      return this.server;
    }

    this.server = this.app.listen(this.config.port, () => {
      this.config.components.loggingSystem.logInfo(
        `Express application started on port ${this.config.port}`
      );
    });

    return this.server;
  }

  /**
   * 关闭Express应用
   */
  public async shutdown(): Promise<void> {
    if (!this.server) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      this.server.close((error: any) => {
        if (error) {
          this.config.components.loggingSystem.logError(
            'Error shutting down Express server',
            error
          );
          reject(error);
        } else {
          this.config.components.loggingSystem.logInfo(
            'Express server shut down successfully'
          );
          this.server = null;
          resolve();
        }
      });
    });
  }
}
```

### 7. 系统启动器修复

```typescript
// src/infrastructure/system/SystemBootstrapper.ts (修复)

/**
 * 系统启动器
 * 负责初始化和启动整个系统
 */
export class SystemBootstrapper {
  private readonly config: SystemBootstrapperConfig;
  private systemIntegrator: SystemIntegrator;
  private loggingSystem: LoggingSystem | null = null;
  private expressApp: ExpressApp | null = null;
  private server: any = null;

  /**
   * 启动系统
   */
  public async start(): Promise<void> {
    try {
      // 初始化系统集成器
      const components = await this.systemIntegrator.initialize();
      this.loggingSystem = components.loggingSystem;

      this.loggingSystem.logInfo('System initialization completed successfully');

      // 创建并启动Express应用
      const port = this.config.port || components.configManager.get<number>('PORT', 3000);
      this.expressApp = new ExpressApp({
        components,
        port,
      });

      this.server = this.expressApp.start();
      this.loggingSystem.logInfo(`Express application started on port ${port}`);

      // 配置优雅关闭
      if (this.config.enableGracefulShutdown) {
        this.configureGracefulShutdown();
      }

      this.loggingSystem.logInfo('System startup completed successfully');
    } catch (error: any) {
      // 如果已经初始化了日志系统，使用日志系统记录错误
      if (this.loggingSystem) {
        this.loggingSystem.logError('Failed to start system', error);
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
   * 关闭系统
   */
  public async shutdown(): Promise<void> {
    this.loggingSystem?.logInfo('Shutting down system...');
    
    try {
      // 关闭Express应用
      if (this.expressApp) {
        await this.expressApp.shutdown();
      }
      
      // 关闭系统集成器
      await this.systemIntegrator.shutdown();
      this.loggingSystem?.logInfo('System shutdown completed successfully');
    } catch (error: any) {
      this.loggingSystem?.logError('Error during system shutdown', error);
      console.error('Error during system shutdown:', error);
    }
  }
}
```

### 8. 数据库客户端修复

```typescript
// src/infrastructure/database/DatabaseClient.ts (修复)

/**
 * 数据库客户端
 */
export class DatabaseClient {
  private readonly dbPath: string;
  private db: Database | null = null;
  private pool: DatabasePool | null = null;
  private isConnected: boolean = false;

  /**
   * 执行查询
   * @param query 查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  public async executeQuery(query: string, params: any[] = []): Promise<any> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // 使用数据库连接池执行查询
      if (this.pool) {
        return await this.pool.execute(query, params);
      } else if (this.db) {
        return await this.db.execute(query, params);
      } else {
        throw new Error('Database not connected');
      }
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * 断开数据库连接
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      if (this.pool) {
        await this.pool.close();
        this.pool = null;
      }
      
      if (this.db) {
        await this.db.close();
        this.db = null;
      }
      
      this.isConnected = false;
    } catch (error) {
      throw new Error(`Failed to disconnect from database: ${(error as Error).message}`);
    }
  }
}
```

### 9. 事件系统修复

```typescript
// src/infrastructure/event-system/EventSystem.ts (修复)

/**
 * 事件系统
 */
export class EventSystem {
  private readonly subscribers: Map<string, Set<EventListener>> = new Map();
  private readonly queue: EventQueueItem[] = [];
  private processingQueue: boolean = false;
  private isRunning: boolean = true;

  /**
   * 关闭事件系统
   */
  public async shutdown(): Promise<void> {
    this.isRunning = false;
    
    // 等待队列处理完成
    while (this.processingQueue || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 清空所有订阅者
    this.subscribers.clear();
  }

  /**
   * 发布事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  public publish(eventName: string, data: any): void {
    if (!this.isRunning) {
      return;
    }

    // 将事件添加到队列
    this.queue.push({ eventName, data });
    
    // 处理队列
    this.processQueue();
  }
}
```

## 修复总结

1. **依赖注入容器修复**：修复了registerSingleton方法的实现，确保单例依赖被正确处理。
2. **系统配置加载器修复**：确保配置验证考虑了环境变量的优先级。
3. **集成测试修复**：确保Express应用在测试中正确启动和关闭。
4. **系统监控器修复**：实现了更准确的CPU使用率检查。
5. **系统健康检查控制器修复**：修复了数据库连接状态检查，不再硬编码为true。
6. **Express应用修复**：添加了shutdown方法，确保服务器能正确关闭。
7. **系统启动器修复**：确保Express应用和服务器能正确关闭。
8. **数据库客户端修复**：修复了连接状态管理和断开连接逻辑。
9. **事件系统修复**：确保事件系统在关闭时能正确处理队列和订阅者。

这些修复确保了系统的稳定性、可靠性和正确性，为后续的开发和部署打下了坚实的基础。