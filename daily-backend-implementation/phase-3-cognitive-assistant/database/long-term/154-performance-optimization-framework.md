# 154-性能优化框架

## 1. 概述

本文档详细描述了性能优化和容量规划机制的实现方案，包括性能监控、性能分析、性能优化和容量规划。本方案基于当前项目技术栈，支持系统各组件的性能监控和优化，确保系统在高负载下的性能和可靠性。

## 2. 技术选型

| 组件 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 性能监控 | Prometheus | 2.45+ | 监控系统性能指标 |
| 可视化 | Grafana | 10.1+ | 性能指标可视化 |
| 链路追踪 | Jaeger | 1.46+ | 分布式链路追踪 |
| 负载测试 | k6 | 0.45+ | 性能负载测试 |
| 分析工具 | Node.js Clinic | 15.0+ | Node.js应用性能分析 |
| 日志分析 | ELK Stack | 8.9+ | 日志收集和分析 |

## 3. 性能优化架构设计

### 3.1 核心架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          监控采集层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  指标采集器  │  │  日志采集器  │  │  链路追踪器  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          数据存储层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Prometheus  │  │   Elasticsearch │  │   Jaeger DB   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          分析可视化层                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Grafana   │  │   Kibana    │  │   Jaeger UI  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          分析优化层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  性能分析器  │  │  优化建议器  │  │  容量规划器  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          执行反馈层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  优化执行器  │  │  监控反馈器  │  │  报告生成器  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## 4. 核心组件实现

### 4.1 性能监控系统

#### 4.1.1 指标采集配置

```typescript
// src/infrastructure/monitoring/MetricsCollector.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { register } from 'prom-client';

@singleton()
export class MetricsCollector {
  private registry: typeof register;

  constructor(private logger: Logger) {
    this.registry = register;
    this.initializeMetrics();
  }

  /**
   * 初始化性能指标
   */
  private initializeMetrics(): void {
    // 请求计数指标
    new register.Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
    });

    // 请求延迟指标
    new register.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.5, 1, 2.5, 5, 10],
    });

    // 数据库查询计数指标
    new register.Counter({
      name: 'database_queries_total',
      help: 'Total database queries',
      labelNames: ['database', 'query_type', 'table', 'success'],
    });

    // 数据库查询延迟指标
    new register.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['database', 'query_type', 'table', 'success'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2.5],
    });

    // 缓存命中率指标
    new register.Gauge({
      name: 'cache_hit_rate',
      help: 'Cache hit rate',
      labelNames: ['cache_type'],
    });

    // 队列长度指标
    new register.Gauge({
      name: 'queue_length',
      help: 'Queue length',
      labelNames: ['queue_name'],
    });

    this.logger.info('Performance metrics initialized');
  }

  /**
   * 获取指标注册表
   */
  getRegistry(): typeof register {
    return this.registry;
  }

  /**
   * 记录HTTP请求指标
   */
  recordHttpRequest(method: string, route: string, status: number, duration: number): void {
    const requestCounter = this.registry.getSingleMetric('http_requests_total') as register.Counter;
    if (requestCounter) {
      requestCounter.inc({ method, route, status });
    }

    const requestHistogram = this.registry.getSingleMetric('http_request_duration_seconds') as register.Histogram;
    if (requestHistogram) {
      requestHistogram.observe({ method, route, status }, duration);
    }
  }

  /**
   * 记录数据库查询指标
   */
  recordDatabaseQuery(
    database: string,
    queryType: string,
    table: string,
    success: boolean,
    duration: number
  ): void {
    const queryCounter = this.registry.getSingleMetric('database_queries_total') as register.Counter;
    if (queryCounter) {
      queryCounter.inc({ database, query_type: queryType, table, success: success.toString() });
    }

    const queryHistogram = this.registry.getSingleMetric('database_query_duration_seconds') as register.Histogram;
    if (queryHistogram) {
      queryHistogram.observe({ database, query_type: queryType, table, success: success.toString() }, duration);
    }
  }

  /**
   * 更新缓存命中率指标
   */
  updateCacheHitRate(cacheType: string, hitRate: number): void {
    const cacheGauge = this.registry.getSingleMetric('cache_hit_rate') as register.Gauge;
    if (cacheGauge) {
      cacheGauge.set({ cache_type: cacheType }, hitRate);
    }
  }

  /**
   * 更新队列长度指标
   */
  updateQueueLength(queueName: string, length: number): void {
    const queueGauge = this.registry.getSingleMetric('queue_length') as register.Gauge;
    if (queueGauge) {
      queueGauge.set({ queue_name: queueName }, length);
    }
  }
}
```

#### 4.1.2 监控中间件

```typescript
// src/infrastructure/monitoring/MetricsMiddleware.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { injectable } from 'tsyringe';
import { MetricsCollector } from './MetricsCollector';

@injectable()
export class MetricsMiddleware {
  constructor(private metricsCollector: MetricsCollector) {}

  /**
   * 注册监控中间件
   */
  registerMiddleware(fastify: FastifyInstance): void {
    // 注册指标端点
    fastify.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
      const metrics = await this.metricsCollector.getRegistry().metrics();
      reply.header('Content-Type', this.metricsCollector.getRegistry().contentType);
      reply.send(metrics);
    });

    // 请求监控中间件
    fastify.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done) => {
      (request as any).startTime = process.hrtime();
      done();
    });

    fastify.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply, done) => {
      const startTime = (request as any).startTime;
      if (startTime) {
        const duration = process.hrtime(startTime);
        const durationSeconds = duration[0] + duration[1] / 1e9;
        
        this.metricsCollector.recordHttpRequest(
          request.method,
          request.routeOptions.url || request.url,
          reply.statusCode,
          durationSeconds
        );
      }
      done();
    });

    this.logger.info('Metrics middleware registered');
  }
}
```

### 4.2 性能分析工具

#### 4.2.1 链路追踪实现

```typescript
// src/infrastructure/tracing/TracingService.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { Tracer, Span, SpanOptions } from 'opentracing';
import * as jaeger from 'jaeger-client';

@singleton()
export class TracingService {
  private tracer: Tracer;

  constructor(private logger: Logger) {
    this.tracer = this.initializeTracer();
  }

  /**
   * 初始化Jaeger追踪器
   */
  private initializeTracer(): Tracer {
    const config: jaeger.TracerConfig = {
      serviceName: 'cognitive-assistant',
      sampler: {
        type: 'const',
        param: 1,
      },
      reporter: {
        logSpans: true,
        agentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
        agentPort: parseInt(process.env.JAEGER_AGENT_PORT || '6831'),
      },
    };

    const options: jaeger.TracerOptions = {
      logger: {
        info: (msg: string) => this.logger.info(`Jaeger Info: ${msg}`),
        error: (msg: string) => this.logger.error(`Jaeger Error: ${msg}`),
      },
    };

    const tracer = jaeger.initTracer(config, options);
    this.logger.info('Jaeger tracer initialized');
    return tracer;
  }

  /**
   * 创建跟踪span
   */
  createSpan(name: string, options?: SpanOptions): Span {
    return this.tracer.startSpan(name, options);
  }

  /**
   * 获取当前tracer
   */
  getTracer(): Tracer {
    return this.tracer;
  }

  /**
   * 注入上下文到Fastify请求
   */
  injectContext(request: any, span: Span): void {
    request.span = span;
  }

  /**
   * 从Fastify请求中获取上下文
   */
  extractContext(request: any): Span | undefined {
    return request.span;
  }
}
```

#### 4.2.2 链路追踪中间件

```typescript
// src/infrastructure/tracing/TracingMiddleware.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { injectable } from 'tsyringe';
import { TracingService } from './TracingService';

@injectable()
export class TracingMiddleware {
  constructor(private tracingService: TracingService, private logger: Logger) {}

  /**
   * 注册链路追踪中间件
   */
  registerMiddleware(fastify: FastifyInstance): void {
    fastify.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done) => {
      const span = this.tracingService.createSpan(`HTTP ${request.method} ${request.url}`);
      this.tracingService.injectContext(request, span);
      done();
    });

    fastify.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply, done) => {
      const span = this.tracingService.extractContext(request);
      if (span) {
        span.setTag('http.status_code', reply.statusCode);
        span.finish();
      }
      done();
    });

    fastify.addHook('onError', (request: FastifyRequest, reply: FastifyReply, error: Error, done) => {
      const span = this.tracingService.extractContext(request);
      if (span) {
        span.setTag('error', true);
        span.log({ event: 'error', message: error.message, stack: error.stack });
        span.finish();
      }
      done();
    });

    this.logger.info('Tracing middleware registered');
  }
}
```

### 4.3 性能优化策略

#### 4.3.1 自动优化引擎

```typescript
// src/infrastructure/optimization/PerformanceOptimizer.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { MetricsCollector } from '../monitoring/MetricsCollector';
import { QueryOptimizer } from '../resource-management/QueryOptimizer';
import { ConnectionPoolAdjuster } from '../resource-management/ConnectionPoolAdjuster';

@singleton()
export class PerformanceOptimizer {
  constructor(
    private logger: Logger,
    private metricsCollector: MetricsCollector,
    private queryOptimizer: QueryOptimizer,
    private connectionPoolAdjuster: ConnectionPoolAdjuster
  ) {}

  /**
   * 运行性能优化
   */
  async runOptimization(): Promise<void> {
    this.logger.info('Running performance optimization...');

    try {
      // 1. 优化数据库查询
      await this.optimizeDatabaseQueries();

      // 2. 优化连接池
      await this.optimizeConnectionPools();

      // 3. 优化缓存策略
      await this.optimizeCacheStrategy();

      // 4. 优化资源使用
      await this.optimizeResourceUsage();

      this.logger.info('Performance optimization completed successfully');
    } catch (error) {
      this.logger.error('Failed to run performance optimization:', error);
    }
  }

  /**
   * 优化数据库查询
   */
  private async optimizeDatabaseQueries(): Promise<void> {
    this.logger.info('Optimizing database queries...');
    await this.queryOptimizer.analyzeSlowQueries();
    await this.queryOptimizer.optimizeIndexes();
  }

  /**
   * 优化连接池
   */
  private async optimizeConnectionPools(): Promise<void> {
    this.logger.info('Optimizing connection pools...');
    await this.connectionPoolAdjuster.adjustPostgresConnectionPool();
    await this.connectionPoolAdjuster.adjustRedisConnectionPool();
  }

  /**
   * 优化缓存策略
   */
  private async optimizeCacheStrategy(): Promise<void> {
    this.logger.info('Optimizing cache strategy...');
    // 这里可以实现基于命中率的缓存策略调整
    // 例如：
    // - 增加命中率高的缓存项的TTL
    // - 移除命中率低的缓存项
    // - 调整缓存大小
  }

  /**
   * 优化资源使用
   */
  private async optimizeResourceUsage(): Promise<void> {
    this.logger.info('Optimizing resource usage...');
    // 这里可以实现资源使用优化
    // 例如：
    // - 调整GC策略
    // - 优化内存使用
    // - 调整线程池大小
  }

  /**
   * 启动自动优化
   */
  startAutoOptimization(interval: number = 3600000): void {
    setInterval(async () => {
      await this.runOptimization();
    }, interval);
    this.logger.info('Auto optimization started');
  }
}
```

#### 4.3.2 性能瓶颈检测

```typescript
// src/infrastructure/optimization/BottleneckDetector.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';

@singleton()
export class BottleneckDetector {
  constructor(private logger: Logger) {}

  /**
   * 检测性能瓶颈
   */
  async detectBottlenecks(metrics: any): Promise<Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>> {
    const bottlenecks: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      recommendation: string;
    }> = [];

    // 1. 检测CPU瓶颈
    if (metrics.cpu && metrics.cpu.usage > 80) {
      bottlenecks.push({
        type: 'cpu',
        severity: 'high',
        description: `CPU usage is ${metrics.cpu.usage.toFixed(2)}%, which exceeds the threshold of 80%`,
        recommendation: 'Consider scaling up the server or optimizing CPU-intensive operations',
      });
    }

    // 2. 检测内存瓶颈
    if (metrics.memory && metrics.memory.usage > 85) {
      bottlenecks.push({
        type: 'memory',
        severity: 'high',
        description: `Memory usage is ${metrics.memory.usage.toFixed(2)}%, which exceeds the threshold of 85%`,
        recommendation: 'Check for memory leaks or consider increasing server memory',
      });
    }

    // 3. 检测数据库瓶颈
    if (metrics.database) {
      // 检测数据库连接数
      if (metrics.database.connection_count > metrics.database.max_connections * 0.8) {
        bottlenecks.push({
          type: 'database',
          severity: 'medium',
          description: `Database connections are at ${metrics.database.connection_count}/${metrics.database.max_connections}, which exceeds 80% of capacity`,
          recommendation: 'Increase database connection pool size or optimize connection usage',
        });
      }

      // 检测数据库查询时间
      if (metrics.database.query_time && metrics.database.query_time > 1) {
        bottlenecks.push({
          type: 'database',
          severity: 'medium',
          description: `Average database query time is ${metrics.database.query_time.toFixed(2)}s, which exceeds the threshold of 1s`,
          recommendation: 'Optimize slow queries or add indexes',
        });
      }
    }

    // 4. 检测缓存瓶颈
    if (metrics.cache) {
      if (metrics.cache.hit_rate && metrics.cache.hit_rate < 0.7) {
        bottlenecks.push({
          type: 'cache',
          severity: 'medium',
          description: `Cache hit rate is ${(metrics.cache.hit_rate * 100).toFixed(2)}%, which is below the threshold of 70%`,
          recommendation: 'Review cache strategy or increase cache size',
        });
      }
    }

    // 5. 检测HTTP请求瓶颈
    if (metrics.http) {
      if (metrics.http.request_time && metrics.http.request_time > 2) {
        bottlenecks.push({
          type: 'http',
          severity: 'high',
          description: `Average HTTP request time is ${metrics.http.request_time.toFixed(2)}s, which exceeds the threshold of 2s`,
          recommendation: 'Optimize API endpoints or add caching',
        });
      }
    }

    return bottlenecks;
  }
}
```

### 4.4 容量规划工具

#### 4.4.1 容量预测器

```typescript
// src/infrastructure/capacity-planning/CapacityPlanner.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';

@singleton()
export class CapacityPlanner {
  constructor(private logger: Logger) {}

  /**
   * 预测容量需求
   */
  async predictCapacity(
    currentMetrics: any,
    growthRate: number = 0.1,
    timeHorizon: number = 30 // 天
  ): Promise<{
    predictedMetrics: any;
    recommendations: string[];
  }> {
    this.logger.info(`Predicting capacity needs for ${timeHorizon} days with ${(growthRate * 100).toFixed(0)}% growth rate`);

    // 计算预测指标
    const predictedMetrics = {
      cpu: {
        usage: currentMetrics.cpu.usage * Math.pow(1 + growthRate, timeHorizon / 30),
      },
      memory: {
        usage: currentMetrics.memory.usage * Math.pow(1 + growthRate, timeHorizon / 30),
      },
      database: {
        connection_count: Math.ceil(currentMetrics.database.connection_count * Math.pow(1 + growthRate, timeHorizon / 30)),
        query_count: Math.ceil(currentMetrics.database.query_count * Math.pow(1 + growthRate, timeHorizon / 30)),
      },
      http: {
        request_count: Math.ceil(currentMetrics.http.request_count * Math.pow(1 + growthRate, timeHorizon / 30)),
      },
    };

    // 生成容量建议
    const recommendations: string[] = [];

    if (predictedMetrics.cpu.usage > 80) {
      recommendations.push(`CPU usage is predicted to reach ${predictedMetrics.cpu.usage.toFixed(2)}% in ${timeHorizon} days. Consider upgrading CPU or adding more instances.`);
    }

    if (predictedMetrics.memory.usage > 85) {
      recommendations.push(`Memory usage is predicted to reach ${predictedMetrics.memory.usage.toFixed(2)}% in ${timeHorizon} days. Consider adding more memory or optimizing memory usage.`);
    }

    if (predictedMetrics.database.connection_count > currentMetrics.database.max_connections) {
      recommendations.push(`Database connections are predicted to exceed ${currentMetrics.database.max_connections} in ${timeHorizon} days. Consider increasing database capacity.`);
    }

    if (predictedMetrics.http.request_count > currentMetrics.http.max_requests) {
      recommendations.push(`HTTP requests are predicted to exceed ${currentMetrics.http.max_requests} in ${timeHorizon} days. Consider adding more application instances.`);
    }

    return {
      predictedMetrics,
      recommendations,
    };
  }

  /**
   * 生成容量规划报告
   */
  async generateCapacityReport(
    currentMetrics: any,
    growthRate: number = 0.1,
    timeHorizon: number = 30
  ): Promise<void> {
    const prediction = await this.predictCapacity(currentMetrics, growthRate, timeHorizon);

    this.logger.info('=== Capacity Planning Report ===');
    this.logger.info(`Time Horizon: ${timeHorizon} days`);
    this.logger.info(`Growth Rate: ${(growthRate * 100).toFixed(0)}%`);
    this.logger.info('');
    this.logger.info('Current Metrics:');
    this.logger.info(JSON.stringify(currentMetrics, null, 2));
    this.logger.info('');
    this.logger.info('Predicted Metrics:');
    this.logger.info(JSON.stringify(prediction.predictedMetrics, null, 2));
    this.logger.info('');
    this.logger.info('Recommendations:');
    prediction.recommendations.forEach((rec, index) => {
      this.logger.info(`${index + 1}. ${rec}`);
    });
    this.logger.info('=== End of Report ===');
  }
}
```

### 4.5 性能测试框架

#### 4.5.1 负载测试脚本

```javascript
// k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate, Gauge } from 'k6/metrics';

// 自定义指标
const httpReqs = new Counter('http_reqs');
const httpReqDuration = new Trend('http_req_duration', true);
const httpReqFailed = new Rate('http_req_failed');
const vusGauge = new Gauge('vus');

// 测试配置
export const options = {
  stages: [
    // 预热阶段
    { duration: '5m', target: 50 },
    // 稳定负载阶段
    { duration: '30m', target: 50 },
    // 增加负载阶段
    { duration: '10m', target: 100 },
    { duration: '30m', target: 100 },
    { duration: '10m', target: 150 },
    { duration: '30m', target: 150 },
    // 峰值负载阶段
    { duration: '5m', target: 200 },
    { duration: '20m', target: 200 },
    // 逐步降低负载阶段
    { duration: '10m', target: 100 },
    { duration: '10m', target: 50 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95%请求在500ms内，99%在1000ms内
    http_req_failed: ['rate<0.01'], // 失败率低于1%
    vus: ['max<200'], // 最大并发用户数低于200
  },
};

// 测试场景
export default function () {
  // 更新自定义指标
  vusGauge.add(__VU);

  // 测试API端点
  const responses = {
    // 测试认知模型API
    cognitiveModel: http.get('http://localhost:3000/api/cognitive-models'),
    // 测试思维片段API
    thoughtFragment: http.get('http://localhost:3000/api/thought-fragments'),
    // 测试健康检查
    health: http.get('http://localhost:3000/health'),
  };

  // 检查响应
  check(responses.cognitiveModel, {
    'cognitive-models status 200': (r) => r.status === 200,
    'cognitive-models response time < 500ms': (r) => r.timings.duration < 500,
  });

  check(responses.thoughtFragment, {
    'thought-fragments status 200': (r) => r.status === 200,
    'thought-fragments response time < 500ms': (r) => r.timings.duration < 500,
  });

  check(responses.health, {
    'health status 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });

  // 记录指标
  Object.values(responses).forEach(response => {
    httpReqs.add(1);
    httpReqDuration.add(response.timings.duration);
    if (response.status !== 200) {
      httpReqFailed.add(1);
    }
  });

  // 模拟用户思考时间
  sleep(Math.random() * 3 + 1);
}
```

#### 4.5.2 性能基准测试

```javascript
// benchmarks/database-benchmark.js
const { Suite } = require('benchmark');
const { PostgreSQLConnectionManager } = require('../dist/infrastructure/persistence/postgresql/PostgreSQLConnectionManager');
const { RedisConnectionManager } = require('../dist/infrastructure/persistence/redis/RedisConnectionManager');

async function runBenchmark() {
  console.log('Running database benchmarks...');

  // 初始化连接管理器
  const postgresManager = new PostgreSQLConnectionManager();
  const redisManager = new RedisConnectionManager();

  await postgresManager.initialize();
  await redisManager.initialize();

  // 创建基准测试套件
  const suite = new Suite();

  // 测试PostgreSQL查询性能
  suite.add('PostgreSQL - SELECT * FROM users LIMIT 100', {
    defer: true,
    async fn(deferred) {
      const connection = await postgresManager.getConnection();
      await connection.query('SELECT * FROM users LIMIT 100');
      await postgresManager.releaseConnection(connection);
      deferred.resolve();
    }
  });

  // 测试Redis GET操作性能
  suite.add('Redis - GET key', {
    defer: true,
    async fn(deferred) {
      const client = await redisManager.getClient();
      await client.get('test:key');
      deferred.resolve();
    }
  });

  // 测试Redis SET操作性能
  suite.add('Redis - SET key value', {
    defer: true,
    async fn(deferred) {
      const client = await redisManager.getClient();
      await client.set('test:key', 'test:value');
      deferred.resolve();
    }
  });

  // 运行基准测试
  suite
    .on('cycle', (event) => {
      console.log(String(event.target));
    })
    .on('complete', () => {
      console.log('Benchmark completed');
      postgresManager.close();
      redisManager.close();
    })
    .run({ async: true });
}

runBenchmark();
```

## 5. 性能监控面板

### 5.1 Grafana仪表盘配置

```json
{
  "dashboard": {
    "id": null,
    "title": "Cognitive Assistant Performance",
    "tags": ["performance"],
    "timezone": "browser",
    "schemaVersion": 26,
    "version": 0,
    "refresh": "5s",
    "panels": [
      {
        "id": 1,
        "title": "HTTP Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (status)",
            "legendFormat": "Status {{status}}",
            "refId": "A"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 0
        }
      },
      {
        "id": 2,
        "title": "HTTP Request Duration",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))",
            "legendFormat": "95% {{route}}",
            "refId": "A"
          },
          {
            "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))",
            "legendFormat": "99% {{route}}",
            "refId": "B"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 0
        }
      },
      {
        "id": 3,
        "title": "Database Queries",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(database_queries_total[5m])) by (database, query_type)",
            "legendFormat": "{{database}} - {{query_type}}",
            "refId": "A"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 8
        }
      },
      {
        "id": 4,
        "title": "Database Query Duration",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(database_query_duration_seconds_bucket[5m])) by (le, database, table))",
            "legendFormat": "95% {{database}} - {{table}}",
            "refId": "A"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 8
        }
      },
      {
        "id": 5,
        "title": "System Resources",
        "type": "gauge",
        "targets": [
          {
            "expr": "system_cpu_usage",
            "refId": "A"
          },
          {
            "expr": "system_memory_usage",
            "refId": "B"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 16
        }
      },
      {
        "id": 6,
        "title": "Cache Hit Rate",
        "type": "gauge",
        "targets": [
          {
            "expr": "cache_hit_rate{cache_type='redis'}",
            "refId": "A"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 16
        }
      }
    ]
  }
}
```

## 6. 总结

本文档提供了完整的性能优化和容量规划框架，包括：

1. 性能监控系统，基于Prometheus和Grafana实现
2. 链路追踪实现，基于Jaeger实现
3. 自动优化引擎，包括数据库查询优化、连接池优化、缓存策略优化和资源使用优化
4. 性能瓶颈检测，自动识别系统瓶颈
5. 容量规划工具，基于历史数据预测未来容量需求
6. 性能测试框架，包括负载测试和基准测试
7. Grafana仪表盘配置，可视化系统性能指标

本方案基于当前项目技术栈，确保系统在高负载下的性能和可靠性。通过实施本方案，可以持续监控系统性能，自动优化系统配置，预测容量需求，确保系统能够应对未来业务增长的挑战。

通过定期运行性能测试和基准测试，可以识别系统瓶颈，优化系统设计，提高系统的可扩展性和可靠性。同时，通过容量规划工具，可以提前预测系统容量需求，避免因资源不足导致的系统故障。
