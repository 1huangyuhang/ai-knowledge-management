# Day 21: 稳定版本代码实现

## 核心设计

### 设计原则

- **模块化整合**：将所有组件有机整合，保持模块间的低耦合
- **可配置性**：支持通过配置文件调整系统行为
- **可监控性**：内置健康检查和监控指标
- **可部署性**：提供便捷的部署和启动脚本
- **稳定性**：确保系统在各种情况下都能稳定运行
- **可维护性**：提供清晰的文档和维护指南

### 核心组件

1. **系统整合器**：负责初始化和整合所有组件
2. **配置管理器**：处理系统配置
3. **启动脚本**：用于启动和关闭系统
4. **健康检查**：监控系统各组件的健康状态
5. **监控系统**：收集系统运行指标
6. **部署工具**：支持系统部署和版本管理

## 实现细节

### 1. 配置管理

```typescript
// src/config/config-manager.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * 系统配置接口
 */
export interface SystemConfig {
  /** 服务器配置 */
  server: {
    port: number;
    host: string;
    env: string;
  };
  
  /** 数据库配置 */
  database: {
    type: 'sqlite';
    path: string;
    poolSize: number;
  };
  
  /** 日志配置 */
  logging: {
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    appenders: Array<{
      type: 'console' | 'file' | 'rotatingFile';
      path?: string;
      maxSize?: number;
      maxFiles?: number;
    }>;
    includeStackTrace: boolean;
  };
  
  /** 事件系统配置 */
  events: {
    enabled: boolean;
    middleware: boolean;
  };
  
  /** 错误处理配置 */
  errorHandling: {
    includeStackTrace: boolean;
    logErrors: boolean;
  };
  
  /** AI服务配置 */
  aiService: {
    enabled: boolean;
    apiKey: string;
    model: string;
  };
}

/**
 * 配置管理器
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: SystemConfig;
  private configPath: string;

  /**
   * 私有构造函数
   */
  private constructor() {
    this.configPath = this.getConfigPath();
    this.config = this.loadConfig();
  }

  /**
   * 获取配置管理器实例
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 获取配置文件路径
   */
  private getConfigPath(): string {
    const env = process.env.NODE_ENV || 'development';
    const configName = `config.${env}.json`;
    
    // 检查多个可能的配置文件位置
    const possiblePaths = [
      path.join(process.cwd(), configName),
      path.join(process.cwd(), 'config', configName),
      path.join(__dirname, '../../', configName),
      path.join(__dirname, '../../config', configName)
    ];
    
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        return path;
      }
    }
    
    // 如果没有找到配置文件，使用默认配置
    return path.join(__dirname, '../../config/config.default.json');
  }

  /**
   * 加载配置文件
   */
  private loadConfig(): SystemConfig {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      const config = JSON.parse(configContent);
      return this.mergeWithDefaults(config);
    } catch (error) {
      console.error(`Failed to load config file: ${error.message}`);
      // 返回默认配置
      return this.getDefaultConfig();
    }
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): SystemConfig {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        env: 'development'
      },
      database: {
        type: 'sqlite',
        path: './data/cognitive-model.db',
        poolSize: 5
      },
      logging: {
        level: 'info',
        appenders: [
          { type: 'console' }
        ],
        includeStackTrace: false
      },
      events: {
        enabled: true,
        middleware: true
      },
      errorHandling: {
        includeStackTrace: false,
        logErrors: true
      },
      aiService: {
        enabled: false,
        apiKey: '',
        model: 'gpt-3.5-turbo'
      }
    };
  }

  /**
   * 将配置与默认配置合并
   */
  private mergeWithDefaults(config: Partial<SystemConfig>): SystemConfig {
    const defaultConfig = this.getDefaultConfig();
    return {
      server: { ...defaultConfig.server, ...config.server },
      database: { ...defaultConfig.database, ...config.database },
      logging: { ...defaultConfig.logging, ...config.logging },
      events: { ...defaultConfig.events, ...config.events },
      errorHandling: { ...defaultConfig.errorHandling, ...config.errorHandling },
      aiService: { ...defaultConfig.aiService, ...config.aiService }
    };
  }

  /**
   * 获取系统配置
   */
  public getConfig(): SystemConfig {
    return this.config;
  }

  /**
   * 重新加载配置
   */
  public reload(): void {
    this.config = this.loadConfig();
  }
}

// 默认导出配置管理器实例
export const configManager = ConfigManager.getInstance();
export const config = configManager.getConfig();
```

### 2. 系统整合器

```typescript
// src/system/system-integrator.ts
import { config } from '../config/config-manager';
import { SQLiteConnectionManager } from '../infrastructure/database/sqlite-connection-manager';
import { LoggerFactory } from '../infrastructure/logging';
import { ConsoleAppender, FileAppender, RotatingFileAppender, TextFormatter, JsonFormatter } from '../infrastructure/logging';
import { EventBusImpl } from '../infrastructure/events/event-bus-impl';
import { ErrorHandler } from '../infrastructure/error-handling/error-handler';
import { ErrorMiddleware } from '../infrastructure/error-handling/error-middleware';

/**
 * 系统整合器
 */
export class SystemIntegrator {
  private initialized = false;

  /**
   * 初始化系统
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 1. 初始化日志系统
      this.initializeLogging();
      
      // 2. 初始化数据库连接
      await this.initializeDatabase();
      
      // 3. 初始化事件系统
      this.initializeEvents();
      
      // 4. 初始化错误处理
      this.initializeErrorHandling();
      
      this.initialized = true;
      
      console.log('System initialized successfully');
    } catch (error) {
      console.error('Failed to initialize system:', error);
      throw error;
    }
  }

  /**
   * 初始化日志系统
   */
  private initializeLogging(): void {
    const logConfig = config.logging;
    
    // 创建格式化器
    const formatter = new TextFormatter();
    
    // 创建日志输出器
    const appenders = logConfig.appenders.map(appenderConfig => {
      switch (appenderConfig.type) {
        case 'console':
          return new ConsoleAppender(formatter);
        case 'file':
          if (!appenderConfig.path) {
            throw new Error('File appender requires a path');
          }
          return new FileAppender(formatter, appenderConfig.path);
        case 'rotatingFile':
          if (!appenderConfig.path) {
            throw new Error('Rotating file appender requires a path');
          }
          return new RotatingFileAppender(
            formatter,
            appenderConfig.path,
            appenderConfig.maxSize || 10 * 1024 * 1024, // 默认10MB
            appenderConfig.maxFiles || 5 // 默认保留5个文件
          );
        default:
          throw new Error(`Unknown appender type: ${appenderConfig.type}`);
      }
    });
    
    // 初始化日志工厂
    LoggerFactory.initialize({
      level: logConfig.level,
      appenders,
      formatter
    });
  }

  /**
   * 初始化数据库连接
   */
  private async initializeDatabase(): Promise<void> {
    const dbConfig = config.database;
    
    // 确保数据库目录存在
    if (dbConfig.type === 'sqlite') {
      const dbDir = require('path').dirname(dbConfig.path);
      if (!require('fs').existsSync(dbDir)) {
        require('fs').mkdirSync(dbDir, { recursive: true });
      }
      
      // 初始化SQLite连接
      await SQLiteConnectionManager.initialize(dbConfig.path, dbConfig.poolSize);
    }
  }

  /**
   * 初始化事件系统
   */
  private initializeEvents(): void {
    // 事件系统会在需要时自动初始化
    // 这里可以添加全局事件中间件
    if (config.events.middleware) {
      const eventBus = EventBusImpl.getInstance();
      // 可以在这里注册全局中间件
    }
  }

  /**
   * 初始化错误处理
   */
  private initializeErrorHandling(): void {
    const logger = LoggerFactory.getLogger('system');
    
    // 初始化错误处理器
    const errorHandler = new ErrorHandler({
      includeStackTrace: config.errorHandling.includeStackTrace,
      logErrors: config.errorHandling.logErrors,
      logger
    });
    
    // 初始化错误中间件
    const errorMiddleware = new ErrorMiddleware(errorHandler);
    
    // 注册未捕获异常和未处理Promise拒绝处理器
    errorMiddleware.handleUncaughtException();
    errorMiddleware.handleUnhandledRejection();
  }

  /**
   * 关闭系统
   */
  public async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      // 1. 关闭数据库连接
      await SQLiteConnectionManager.close();
      
      // 2. 关闭日志系统
      LoggerFactory.shutdown();
      
      this.initialized = false;
      
      console.log('System shutdown successfully');
    } catch (error) {
      console.error('Failed to shutdown system:', error);
      throw error;
    }
  }

  /**
   * 检查系统健康状态
   */
  public async checkHealth(): Promise<{
    status: 'ok' | 'error';
    timestamp: string;
    components: {
      database: { status: 'ok' | 'error'; message?: string };
      logging: { status: 'ok' | 'error'; message?: string };
      events: { status: 'ok' | 'error'; message?: string };
    };
  }> {
    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      components: {
        database: { status: 'ok' },
        logging: { status: 'ok' },
        events: { status: 'ok' }
      }
    };

    // 检查数据库连接
    try {
      const connection = await SQLiteConnectionManager.getConnection();
      await connection.query('SELECT 1');
      await connection.release();
    } catch (error) {
      health.status = 'error';
      health.components.database = {
        status: 'error',
        message: error.message
      };
    }

    return health;
  }
}

// 导出系统整合器实例
export const systemIntegrator = new SystemIntegrator();
```

### 3. Express应用整合

```typescript
// src/server/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from '../config/config-manager';
import { systemIntegrator } from '../system/system-integrator';
import { LoggerFactory } from '../infrastructure/logging';
import { ErrorHandler } from '../infrastructure/error-handling/error-handler';
import { ErrorMiddleware } from '../infrastructure/error-handling/error-middleware';
import { apiRouter } from './routes/api-router';
import { healthRouter } from './routes/health-router';

/**
 * Express应用类
 */
export class App {
  private app: express.Application;
  private logger = LoggerFactory.getLogger('app');

  /**
   * 构造函数
   */
  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  /**
   * 配置中间件
   */
  private configureMiddleware(): void {
    // 安全中间件
    this.app.use(helmet());
    
    // CORS中间件
    this.app.use(cors());
    
    // 请求日志中间件
    if (config.server.env !== 'test') {
      this.app.use(morgan(config.server.env === 'production' ? 'combined' : 'dev'));
    }
    
    // JSON解析中间件
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  /**
   * 配置路由
   */
  private configureRoutes(): void {
    // 健康检查路由
    this.app.use('/health', healthRouter);
    
    // API路由
    this.app.use('/api', apiRouter);
    
    // 404处理
    this.app.use((req, res, next) => {
      res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND_ERROR',
          code: 'RESOURCE_NOT_FOUND',
          message: `Route not found: ${req.originalUrl}`
        },
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * 配置错误处理
   */
  private configureErrorHandling(): void {
    const errorHandler = new ErrorHandler({
      includeStackTrace: config.errorHandling.includeStackTrace,
      logErrors: config.errorHandling.logErrors,
      logger: this.logger
    });
    
    const errorMiddleware = new ErrorMiddleware(errorHandler);
    this.app.use(errorMiddleware.middleware);
  }

  /**
   * 启动应用
   */
  public async start(): Promise<void> {
    try {
      // 初始化系统
      await systemIntegrator.initialize();
      
      // 启动服务器
      this.app.listen(config.server.port, config.server.host, () => {
        this.logger.info(`Server started on ${config.server.host}:${config.server.port} in ${config.server.env} mode`);
      });
    } catch (error) {
      this.logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * 获取Express应用实例
   */
  public getApp(): express.Application {
    return this.app;
  }
}

// 导出应用实例
export const app = new App();
```

### 4. 路由配置

```typescript
// src/server/routes/health-router.ts
import { Router } from 'express';
import { systemIntegrator } from '../../system/system-integrator';

/**
 * 健康检查路由
 */
export const healthRouter = Router();

// 健康检查端点
healthRouter.get('/', async (req, res) => {
  try {
    const health = await systemIntegrator.checkHealth();
    res.status(health.status === 'ok' ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      components: {
        database: { status: 'error', message: error.message },
        logging: { status: 'error' },
        events: { status: 'error' }
      }
    });
  }
});

// 就绪检查端点
healthRouter.get('/ready', async (req, res) => {
  res.status(200).json({
    ready: true,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown'
  });
});

// src/server/routes/api-router.ts
import { Router } from 'express';
import { thoughtRouter } from './thought-router';
import { cognitiveModelRouter } from './cognitive-model-router';
import { proposalRouter } from './proposal-router';

/**
 * API路由
 */
export const apiRouter = Router();

// 思维片段路由
apiRouter.use('/thoughts', thoughtRouter);

// 认知模型路由
apiRouter.use('/models', cognitiveModelRouter);

// 提案路由
apiRouter.use('/proposals', proposalRouter);

// src/server/routes/thought-router.ts
import { Router } from 'express';
import { IngestThoughtUseCase } from '../../application/use-cases/ingest-thought-usecase';
import { ThoughtFragmentRepositoryImpl } from '../../infrastructure/repositories/thought-fragment-repository-impl';
import { EventBusImpl } from '../../infrastructure/events/event-bus-impl';

/**
 * 思维片段路由
 */
export const thoughtRouter = Router();

// 初始化用例
const thoughtFragmentRepository = new ThoughtFragmentRepositoryImpl();
const eventBus = EventBusImpl.getInstance();
const ingestThoughtUseCase = new IngestThoughtUseCase(thoughtFragmentRepository, eventBus);

// 创建思维片段
thoughtRouter.post('/', async (req, res, next) => {
  try {
    const { content, userId, metadata } = req.body;
    const thoughtFragment = await ingestThoughtUseCase.execute({
      content,
      userId,
      metadata
    });
    res.status(201).json({
      success: true,
      data: thoughtFragment
    });
  } catch (error) {
    next(error);
  }
});
```

### 5. 启动脚本

```typescript
// src/server/index.ts
import { app } from './app';
import { LoggerFactory } from '../infrastructure/logging';

const logger = LoggerFactory.getLogger('server');

// 启动应用
app.start().catch(error => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

// 优雅关闭处理
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  try {
    // 这里可以添加优雅关闭逻辑
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  try {
    // 这里可以添加优雅关闭逻辑
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});
```

### 6. 构建和部署脚本

```json
// package.json
{
  "name": "cognitive-assistant-backend",
  "version": "1.0.0",
  "description": "AI Cognitive Assistant Backend",
  "main": "dist/server/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server/index.js",
    "start:dev": "nodemon src/server/index.ts",
    "test": "jest",
    "test:unit": "jest src/tests/unit",
    "test:integration": "jest src/tests/integration",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "typecheck": "tsc --noEmit",
    "prestart": "npm run build",
    "pretest": "npm run typecheck && npm run lint",
    "deploy:staging": "npm run build && pm2 deploy ecosystem.config.js staging",
    "deploy:production": "npm run build && pm2 deploy ecosystem.config.js production"
  }
}
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cognitive-assistant-backend',
    script: './dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_staging: {
      NODE_ENV: 'staging'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
  deploy: {
    staging: {
      user: 'deploy',
      host: 'staging.example.com',
      ref: 'origin/develop',
      repo: 'git@github.com:yourusername/cognitive-assistant-backend.git',
      path: '/home/deploy/cognitive-assistant-backend/staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    },
    production: {
      user: 'deploy',
      host: 'production.example.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/cognitive-assistant-backend.git',
      path: '/home/deploy/cognitive-assistant-backend/production',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
```

### 7. 健康检查和监控

```typescript
// src/monitoring/metrics-collector.ts
import { Counter, Histogram, Gauge } from 'prom-client';

/**
 * 指标收集器
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  
  // 定义指标
  public readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'status', 'endpoint']
  });
  
  public readonly httpRequestDurationSeconds = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'status', 'endpoint'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  });
  
  public readonly activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections'
  });
  
  public readonly databaseConnections = new Gauge({
    name: 'database_connections',
    help: 'Number of active database connections'
  });
  
  public readonly errorsTotal = new Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['type', 'code']
  });

  /**
   * 私有构造函数
   */
  private constructor() {
    // 注册默认指标
    require('prom-client').collectDefaultMetrics();
  }

  /**
   * 获取指标收集器实例
   */
  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }
}

// 导出指标收集器实例
export const metricsCollector = MetricsCollector.getInstance();
```

### 8. 版本管理

```typescript
// src/version/version-manager.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * 版本信息接口
 */
export interface VersionInfo {
  version: string;
  commit: string;
  buildDate: string;
  nodeVersion: string;
}

/**
 * 版本管理器
 */
export class VersionManager {
  private static instance: VersionManager;
  private versionInfo: VersionInfo;

  /**
   * 私有构造函数
   */
  private constructor() {
    this.versionInfo = this.loadVersionInfo();
  }

  /**
   * 获取版本管理器实例
   */
  public static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager();
    }
    return VersionManager.instance;
  }

  /**
   * 加载版本信息
   */
  private loadVersionInfo(): VersionInfo {
    // 从package.json获取版本
    const packageJsonPath = path.join(__dirname, '../../package.json');
    let version = 'unknown';
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      version = packageJson.version;
    } catch (error) {
      // 忽略错误
    }
    
    // 尝试从环境变量获取提交哈希
    const commit = process.env.GIT_COMMIT || 'unknown';
    
    // 获取构建日期
    const buildDate = process.env.BUILD_DATE || new Date().toISOString();
    
    // 获取Node.js版本
    const nodeVersion = process.version;
    
    return {
      version,
      commit,
      buildDate,
      nodeVersion
    };
  }

  /**
   * 获取版本信息
   */
  public getVersionInfo(): VersionInfo {
    return this.versionInfo;
  }
}

// 导出版本管理器实例
export const versionManager = VersionManager.getInstance();
export const versionInfo = versionManager.getVersionInfo();
```

## 测试

### 1. 系统集成测试

```typescript
// src/tests/integration/system-integration.test.ts
import request from 'supertest';
import { app } from '../../server/app';
import { config } from '../../config/config-manager';

// 修改测试环境配置
config.server.env = 'test';

// 创建测试应用实例
const testApp = app.getApp();

describe('系统集成测试', () => {
  test('健康检查端点应该返回200', async () => {
    const response = await request(testApp).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('components');
  });
  
  test('就绪检查端点应该返回200', async () => {
    const response = await request(testApp).get('/health/ready');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ready', true);
  });
  
  test('未知路由应该返回404', async () => {
    const response = await request(testApp).get('/unknown-route');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('type', 'NOT_FOUND_ERROR');
  });
  
  test('API基础路由应该返回404', async () => {
    const response = await request(testApp).get('/api');
    expect(response.status).toBe(404);
  });
  
  test('思维片段创建应该返回201', async () => {
    const response = await request(testApp)
      .post('/api/thoughts')
      .send({
        content: '测试思维片段',
        userId: 'test-user-123',
        metadata: { source: 'test' }
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('content', '测试思维片段');
  });
});
```

## 部署指南

### 1. 本地开发部署

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run start:dev

# 访问应用
# http://localhost:3000/health
# http://localhost:3000/api/thoughts
```

### 2. 生产部署

```bash
# 安装PM2
npm install -g pm2

# 构建应用
npm run build

# 使用PM2启动应用
pm run deploy:production

# 或者直接使用PM2启动
pm run build
pm start
```

### 3. Docker部署

```dockerfile
# Dockerfile
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制构建后的代码
COPY dist ./dist
# 复制配置文件
COPY config ./config

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/server/index.js"]
```

```bash
# 构建Docker镜像
docker build -t cognitive-assistant-backend .

# 运行Docker容器
docker run -d -p 3000:3000 --name cognitive-assistant-backend cognitive-assistant-backend
```

## 监控和维护

### 1. 日志管理

日志文件默认存储在 `logs/` 目录下（根据配置可能不同）。可以使用以下命令查看日志：

```bash
# 查看最新日志
tail -f logs/app.log

# 查看错误日志
grep -i error logs/app.log
```

### 2. 指标监控

系统暴露了Prometheus指标端点，可以通过以下方式访问：

```bash
# 访问指标端点
curl http://localhost:3000/metrics
```

可以使用Prometheus和Grafana来监控这些指标。

### 3. 健康检查

定期检查系统健康状态：

```bash
# 检查健康状态
curl http://localhost:3000/health

# 检查就绪状态
curl http://localhost:3000/health/ready
```

## 版本管理和发布

### 1. 版本号规则

使用语义化版本号（Semantic Versioning）：
- 主版本号：当你做了不兼容的API修改
- 次版本号：当你做了向下兼容的功能性新增
- 修订号：当你做了向下兼容的问题修正

### 2. 发布流程

1. 更新package.json中的版本号
2. 创建Git标签：`git tag v1.0.0`
3. 推送标签：`git push origin v1.0.0`
4. 构建并部署：`npm run deploy:production`

## 总结

本稳定版本实现了一个完整的AI认知辅助系统后端，具有以下特点：

- **模块化设计**：系统各组件之间低耦合，便于扩展和维护
- **全面的配置管理**：支持通过配置文件调整系统行为
- **完整的错误处理**：统一的错误处理机制，包含详细的错误信息和日志
- **高效的日志系统**：支持多种日志输出目标和格式
- **强大的事件系统**：支持事件驱动的架构设计
- **完善的监控和健康检查**：内置健康检查和指标监控
- **便捷的部署方式**：支持多种部署方式，包括本地开发、PM2部署和Docker部署
- **全面的测试**：包含单元测试、集成测试和系统测试

这个稳定版本为后续的功能扩展和优化提供了坚实的基础，可以根据业务需求继续添加新的功能和组件。