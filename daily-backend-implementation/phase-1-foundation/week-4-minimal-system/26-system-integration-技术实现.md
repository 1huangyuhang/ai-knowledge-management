# Day 26: 第一阶段 - 系统地基期 - Week 4 - 第26天 代码实现

## 系统整合实现

### 1. 系统启动器

```typescript
// src/infrastructure/system/SystemBootstrapper.ts
import { SystemIntegrator } from './SystemIntegrator';
import { ExpressApp } from '../../application/ExpressApp';
import { LoggingSystem } from '../logging/LoggingSystem';
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
  private loggingSystem: LoggingSystem | null = null;

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

      this.loggingSystem.logInfo('System initialization completed successfully');

      // 创建并启动Express应用
      const port = this.config.port || components.configManager.get<number>('PORT', 3000);
      const expressApp = new ExpressApp({
        components,
        port,
      });

      expressApp.start();
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
   * 配置优雅关闭
   */
  private configureGracefulShutdown(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGQUIT'];

    signals.forEach(signal => {
      process.on(signal, async () => {
        this.loggingSystem?.logInfo(`Received ${signal} signal, shutting down gracefully...`);
        await this.shutdown();
        process.exit(0);
      });
    });
  }

  /**
   * 关闭系统
   */
  public async shutdown(): Promise<void> {
    this.loggingSystem?.logInfo('Shutting down system...');
    
    try {
      await this.systemIntegrator.shutdown();
      this.loggingSystem?.logInfo('System shutdown completed successfully');
    } catch (error: any) {
      this.loggingSystem?.logError('Error during system shutdown', error);
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
```

### 2. 依赖注入容器

```typescript
// src/infrastructure/dependency-injection/DependencyContainer.ts

/**
 * 依赖注入容器接口
 */
export interface DependencyContainer {
  /**
   * 注册依赖
   * @param key 依赖键
   * @param factory 依赖工厂函数
   */
  register<T>(key: string, factory: () => T): void;

  /**
   * 注册单例依赖
   * @param key 依赖键
   * @param factory 依赖工厂函数
   */
  registerSingleton<T>(key: string, factory: () => T): void;

  /**
   * 解析依赖
   * @param key 依赖键
   * @returns 依赖实例
   */
  resolve<T>(key: string): T;

  /**
   * 检查依赖是否已注册
   * @param key 依赖键
   * @returns 是否已注册
   */
  has(key: string): boolean;

  /**
   * 清除所有依赖
   */
  clear(): void;
}

/**
 * 简单的依赖注入容器实现
 */
export class SimpleDependencyContainer implements DependencyContainer {
  private readonly dependencies: Map<string, any> = new Map();
  private readonly singletonInstances: Map<string, any> = new Map();

  /**
   * 注册依赖
   * @param key 依赖键
   * @param factory 依赖工厂函数
   */
  public register<T>(key: string, factory: () => T): void {
    this.dependencies.set(key, factory);
  }

  /**
   * 注册单例依赖
   * @param key 依赖键
   * @param factory 依赖工厂函数
   */
  public registerSingleton<T>(key: string, factory: () => T): void {
    this.dependencies.set(key, factory);
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
    if (this.singletonInstances.has(key)) {
      return this.singletonInstances.get(key) as T;
    }

    const factory = this.dependencies.get(key);
    const instance = factory();

    // 如果是单例，保存实例
    this.singletonInstances.set(key, instance);

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
  }
}

/**
 * 全局依赖注入容器实例
 */
export const globalContainer = new SimpleDependencyContainer();
```

### 3. 依赖注入配置

```typescript
// src/infrastructure/dependency-injection/DependencyConfig.ts
import { globalContainer } from './DependencyContainer';
import { DatabaseClient } from '../database/DatabaseClient';
import { EventSystem } from '../event-system/EventSystem';
import { LoggingSystem } from '../logging/LoggingSystem';
import { ErrorHandler } from '../error-handling/ErrorHandler';
import { ConfigManager } from '../system/ConfigManager';
import { ThoughtRepositoryImpl } from '../repositories/ThoughtRepositoryImpl';
import { CognitiveModelRepositoryImpl } from '../repositories/CognitiveModelRepositoryImpl';
import { IngestThoughtUseCase } from '../../application/usecases/IngestThoughtUseCase';
import { GenerateProposalUseCase } from '../../application/usecases/GenerateProposalUseCase';
import { UpdateCognitiveModelUseCase } from '../../application/usecases/UpdateCognitiveModelUseCase';
import { ModelSummaryGenerator } from '../../application/services/ModelSummaryGenerator';
import { CognitiveStructureVisualizationService } from '../../application/services/CognitiveStructureVisualizationService';
import { OutputFormattingService } from '../../application/services/OutputFormattingService';
import { ModelExportService } from '../../application/services/ModelExportService';
import { CognitiveModelUpdateService } from '../../application/services/CognitiveModelUpdateService';
import { ConceptRelationProcessor } from '../../application/services/ConceptRelationProcessor';
import { ModelConsistencyChecker } from '../../application/services/ModelConsistencyChecker';
import { CognitiveGraphGenerator } from '../../application/services/CognitiveGraphGenerator';

/**
 * 配置依赖注入
 * @param configManager 配置管理器
 * @param loggingSystem 日志系统
 */
export const configureDependencyInjection = (
  configManager: ConfigManager,
  loggingSystem: LoggingSystem
): void => {
  // 注册配置管理器和日志系统（已创建）
  globalContainer.registerSingleton('ConfigManager', () => configManager);
  globalContainer.registerSingleton('LoggingSystem', () => loggingSystem);

  // 注册数据库客户端
  globalContainer.registerSingleton('DatabaseClient', () => {
    const databaseUrl = configManager.get<string>('DATABASE_URL', ':memory:');
    return new DatabaseClient(databaseUrl);
  });

  // 注册事件系统
  globalContainer.registerSingleton('EventSystem', () => {
    return new EventSystem();
  });

  // 注册错误处理器
  globalContainer.registerSingleton('ErrorHandler', () => {
    return new ErrorHandler({ logger: loggingSystem });
  });

  // 注册仓库
  globalContainer.registerSingleton('ThoughtRepository', () => {
    const databaseClient = globalContainer.resolve<DatabaseClient>('DatabaseClient');
    const eventSystem = globalContainer.resolve<EventSystem>('EventSystem');
    return new ThoughtRepositoryImpl(databaseClient, eventSystem);
  });

  globalContainer.registerSingleton('CognitiveModelRepository', () => {
    const databaseClient = globalContainer.resolve<DatabaseClient>('DatabaseClient');
    const eventSystem = globalContainer.resolve<EventSystem>('EventSystem');
    return new CognitiveModelRepositoryImpl(databaseClient, eventSystem);
  });

  // 注册用例
  globalContainer.registerSingleton('IngestThoughtUseCase', () => {
    const thoughtRepository = globalContainer.resolve<any>('ThoughtRepository');
    return new IngestThoughtUseCase(thoughtRepository);
  });

  globalContainer.registerSingleton('GenerateProposalUseCase', () => {
    const thoughtRepository = globalContainer.resolve<any>('ThoughtRepository');
    return new GenerateProposalUseCase(thoughtRepository);
  });

  globalContainer.registerSingleton('UpdateCognitiveModelUseCase', () => {
    const cognitiveModelRepository = globalContainer.resolve<any>('CognitiveModelRepository');
    return new UpdateCognitiveModelUseCase(cognitiveModelRepository);
  });

  // 注册服务
  globalContainer.registerSingleton('ModelSummaryGenerator', () => {
    return new ModelSummaryGenerator();
  });

  globalContainer.registerSingleton('CognitiveStructureVisualizationService', () => {
    return new CognitiveStructureVisualizationService();
  });

  globalContainer.registerSingleton('OutputFormattingService', () => {
    return new OutputFormattingService();
  });

  globalContainer.registerSingleton('ModelExportService', () => {
    return new ModelExportService();
  });

  globalContainer.registerSingleton('CognitiveModelUpdateService', () => {
    return new CognitiveModelUpdateService();
  });

  globalContainer.registerSingleton('ConceptRelationProcessor', () => {
    return new ConceptRelationProcessor();
  });

  globalContainer.registerSingleton('ModelConsistencyChecker', () => {
    return new ModelConsistencyChecker();
  });

  globalContainer.registerSingleton('CognitiveGraphGenerator', () => {
    return new CognitiveGraphGenerator();
  });
};
```

### 4. 系统配置整合

```typescript
// src/infrastructure/system/SystemConfig.ts
import { ConfigManager } from './ConfigManager';
import { LoggingSystem } from '../logging/LoggingSystem';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 系统配置定义
 */
export interface SystemConfig {
  PORT: number;
  NODE_ENV: string;
  LOG_LEVEL: string;
  LOG_FORMAT: string;
  DATABASE_URL: string;
  CORS_ORIGINS: string[];
  METRICS_ENABLED: boolean;
  HEALTH_CHECK_ENABLED: boolean;
  REQUEST_LOGGING_ENABLED: boolean;
  ERROR_DETAILS_ENABLED: boolean;
}

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

### 5. 集成测试

```typescript
// src/integration-tests/system-integration.test.ts
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
  });

  afterAll(async () => {
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

### 6. 系统监控

```typescript
// src/infrastructure/monitoring/SystemMonitor.ts
import { LoggingSystem } from '../logging/LoggingSystem';
import { DatabaseClient } from '../database/DatabaseClient';
import { EventSystem } from '../event-system/EventSystem';

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
  private readonly loggingSystem: LoggingSystem;
  private readonly databaseClient: DatabaseClient;
  private readonly eventSystem: EventSystem;
  private readonly metrics: SystemMetrics;
  private readonly startTime: number;
  private requestStartTimeMap: Map<string, number> = new Map();

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
   * 注册事件监听器
   */
  private registerEventListeners(): void {
    this.eventSystem.subscribe('database.query', () => {
      this.metrics.database.queryCount++;
    });

    this.eventSystem.subscribe('database.error', () => {
      this.metrics.database.errorCount++;
    });

    this.eventSystem.subscribe('event.published', () => {
      this.metrics.events.published++;
    });

    this.eventSystem.subscribe('event.processed', () => {
      this.metrics.events.processed++;
    });

    this.eventSystem.subscribe('event.failed', () => {
      this.metrics.events.failed++;
    });
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
    
    // 检查数据库连接状态
    this.databaseClient.ping().then(connected => {
      this.metrics.database.connected = connected;
    }).catch(() => {
      this.metrics.database.connected = false;
    });
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
    this.loggingSystem.logInfo(`System Event: ${eventName}`, data);
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
    const databaseStatus = await this.databaseClient.ping() ? 'ok' : 'error';
    
    // 检查事件系统
    const eventsStatus = 'ok'; // 简单实现
    
    // 检查内存使用情况
    const memoryStatus = this.checkMemoryUsage();
    
    // 检查CPU使用情况
    const cpuStatus = this.checkCpuUsage();
    
    // 确定整体状态
    let overallStatus: 'ok' | 'degraded' | 'error' = 'ok';
    if (databaseStatus === 'error' || eventsStatus === 'error') {
      overallStatus = 'error';
    } else if (memoryStatus === 'error' || cpuStatus === 'error') {
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
```

### 7. 系统健康检查

```typescript
// src/application/controllers/SystemHealthController.ts
import { Router, Request, Response } from 'express';
import { SystemComponents } from '../../infrastructure/system/SystemIntegrator';
import { SystemMonitor } from '../../infrastructure/monitoring/SystemMonitor';

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
   * 初始化路由
   */
  private initializeRoutes(): void {
    // 基本健康检查
    this.router.get('/', this.checkHealth.bind(this));
    
    // 详细健康检查
    this.router.get('/detailed', this.checkDetailedHealth.bind(this));
    
    // 系统指标
    this.router.get('/metrics', this.getMetrics.bind(this));
    
    // 系统状态
    this.router.get('/status', this.getSystemStatus.bind(this));
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
        error: (error as Error).message,
      });
    }
  }

  /**
   * 检查详细健康状态
   */
  private async checkDetailedHealth(req: Request, res: Response): Promise<void> {
    try {
      // 使用系统监控器检查健康状态
      const healthStatus = await this.systemMonitor.checkHealth();
      
      // 获取系统指标
      const metrics = this.systemMonitor.getMetrics();
      
      res.status(200).json({
        status: healthStatus.status,
        timestamp: new Date().toISOString(),
        service: 'ai-cognitive-assistant',
        components: healthStatus.components,
        metrics: {
          uptime: metrics.uptime,
          memory: {
            rss: metrics.memory.rss,
            heapUsed: metrics.memory.heapUsed,
          },
          database: metrics.database,
          requests: metrics.requests,
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

  /**
   * 获取系统指标
   */
  private getMetrics(req: Request, res: Response): void {
    try {
      const metrics = this.systemMonitor.getMetrics();
      
      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: '获取系统指标失败',
          code: 'METRICS_FETCH_FAILED',
          type: 'systemError',
        },
      });
    }
  }

  /**
   * 获取系统状态
   */
  private getSystemStatus(req: Request, res: Response): void {
    try {
      const components = this.components;
      
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
              connected: true, // 简化实现
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

  /**
   * 获取路由
   */
  public getRoutes(): Router {
    return this.router;
  }
}
```

### 7. 系统整合器更新

```typescript
// src/infrastructure/system/SystemIntegrator.ts (更新)
import { DatabaseClient } from '../database/DatabaseClient';
import { EventSystem } from '../event-system/EventSystem';
import { LoggingSystem } from '../logging/LoggingSystem';
import { ErrorHandler } from '../error-handling/ErrorHandler';
import { ConfigManager } from './ConfigManager';
import { SystemMonitor } from '../monitoring/SystemMonitor';
import { configureDependencyInjection } from '../dependency-injection/DependencyConfig';

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
  systemMonitor: SystemMonitor;
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

      // 6. 初始化系统监控器
      const systemMonitor = new SystemMonitor(loggingSystem, databaseClient, eventSystem);
      this.components.systemMonitor = systemMonitor;
      loggingSystem.logInfo('System monitor initialized');

      // 7. 配置依赖注入
      configureDependencyInjection(this.configManager, loggingSystem);
      loggingSystem.logInfo('Dependency injection configured');

      // 8. 设置全局错误处理
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

### 8. 应用入口更新

```typescript
// src/main.ts (更新)
import { SystemBootstrapper } from './infrastructure/system/SystemBootstrapper';

/**
 * 主应用入口
 */
async function main() {
  const systemBootstrapper = new SystemBootstrapper({
    environment: process.env.NODE_ENV || 'development',
    configPath: './config',
    enableGracefulShutdown: true,
    enableHealthCheck: true,
    enableMetrics: true,
  });
  
  try {
    // 启动系统
    await systemBootstrapper.start();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// 启动应用
main();
```
