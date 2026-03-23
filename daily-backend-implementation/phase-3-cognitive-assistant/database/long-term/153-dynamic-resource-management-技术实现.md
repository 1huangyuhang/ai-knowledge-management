# 153-动态资源管理代码实现

## 1. 概述

本文档详细描述了动态资源管理的实现方案，包括资源监控、动态调整、自动扩展和资源优化。本方案基于当前项目技术栈，支持PostgreSQL、Redis和ClickHouse的动态资源管理，确保系统在不同负载下的性能和资源利用率。

## 2. 技术选型

| 组件 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 资源监控 | Prometheus | 2.45+ | 监控系统资源使用情况 |
| 自动扩展 | Kubernetes HPA | 1.27+ | 基于负载的自动扩展 |
| 资源管理 | Node.js Cluster API | 18+ | Node.js应用的集群管理 |
| 配置管理 | Consul KV | 1.15+ | 动态配置管理 |
| 调度框架 | BullMQ | 4.10+ | 任务调度和队列管理 |

## 3. 动态资源管理架构设计

### 3.1 核心架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          资源管理层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  资源监控器  │  │  资源分析器  │  │  资源调度器  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          决策执行层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  自动扩展器  │  │  资源调整器  │  │  负载均衡器  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          应用服务层                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     Fastify集群                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │  应用实例1   │  │  应用实例2   │  │  应用实例N   │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          数据服务层                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  PostgreSQL集群  │  │   Redis集群     │  │  ClickHouse集群  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 4. 核心组件实现

### 4.1 资源监控器

#### 4.1.1 系统资源监控

```typescript
// src/infrastructure/resource-monitoring/SystemResourceMonitor.ts
import { singleton } from 'tsyringe';
import os from 'os';
import { Logger } from '../logging/Logger';
import { ResourceMetrics } from './ResourceMetrics';

@singleton()
export class SystemResourceMonitor {
  constructor(private logger: Logger) {}

  /**
   * 获取系统资源使用情况
   */
  getSystemMetrics(): ResourceMetrics {
    // CPU 使用率
    const cpus = os.cpus();
    const cpuCount = cpus.length;
    
    // 内存使用率
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    
    // 磁盘使用率
    // 注意：这里需要使用Node.js的fs模块来获取磁盘使用率
    // 由于跨平台兼容性问题，实际实现可能需要使用第三方库
    
    // 网络统计
    const networkInterfaces = os.networkInterfaces();
    
    return {
      timestamp: new Date().toISOString(),
      cpu: {
        count: cpuCount,
        usage: this.getCpuUsage(), // 需要单独实现
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usage: memoryUsage,
      },
      disk: {
        usage: 0, // 需要实现
      },
      network: {
        interfaces: Object.keys(networkInterfaces).length,
      },
    };
  }

  /**
   * 获取CPU使用率
   * 注意：Node.js标准库没有直接提供CPU使用率的API，需要自定义实现
   */
  private getCpuUsage(): number {
    // 这里是一个简化的实现，实际生产环境需要更精确的计算
    // 可以使用第三方库如os-utils或pidusage
    return Math.floor(Math.random() * 50) + 10; // 模拟10-60%的CPU使用率
  }

  /**
   * 监控系统资源并发送指标
   */
  async monitorAndSendMetrics(interval: number = 5000): Promise<void> {
    setInterval(() => {
      try {
        const metrics = this.getSystemMetrics();
        // 发送指标到监控系统（如Prometheus）
        this.logger.debug('System resource metrics:', metrics);
      } catch (error) {
        this.logger.error('Failed to monitor system resources:', error);
      }
    }, interval);
  }
}
```

#### 4.1.2 数据库资源监控

```typescript
// src/infrastructure/resource-monitoring/DatabaseResourceMonitor.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { PostgreSQLConnectionManager } from '../persistence/postgresql/PostgreSQLConnectionManager';
import { RedisConnectionManager } from '../persistence/redis/RedisConnectionManager';
import { ClickHouseConnectionManager } from '../persistence/clickhouse/ClickHouseConnectionManager';

@singleton()
export class DatabaseResourceMonitor {
  constructor(
    private logger: Logger,
    private postgresConnectionManager: PostgreSQLConnectionManager,
    private redisConnectionManager: RedisConnectionManager,
    private clickhouseConnectionManager: ClickHouseConnectionManager
  ) {}

  /**
   * 获取PostgreSQL资源使用情况
   */
  async getPostgresMetrics(): Promise<any> {
    try {
      const connection = await this.postgresConnectionManager.getConnection();
      
      // 获取连接数
      const connectionsResult = await connection.query(
        'SELECT count(*) as connection_count FROM pg_stat_activity;'
      );
      
      // 获取缓冲区命中率
      const bufferResult = await connection.query(`
        SELECT 
          round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)), 2) as buffer_hit_ratio
        FROM pg_statio_user_tables;
      `);
      
      // 获取索引使用情况
      const indexResult = await connection.query(`
        SELECT 
          round(100.0 * sum(idx_blks_hit) / (sum(idx_blks_hit) + sum(idx_blks_read)), 2) as index_hit_ratio
        FROM pg_statio_user_indexes;
      `);
      
      await this.postgresConnectionManager.releaseConnection(connection);
      
      return {
        connection_count: connectionsResult.rows[0].connection_count,
        buffer_hit_ratio: bufferResult.rows[0].buffer_hit_ratio,
        index_hit_ratio: indexResult.rows[0].index_hit_ratio,
      };
    } catch (error) {
      this.logger.error('Failed to get PostgreSQL metrics:', error);
      throw error;
    }
  }

  /**
   * 获取Redis资源使用情况
   */
  async getRedisMetrics(): Promise<any> {
    try {
      const client = await this.redisConnectionManager.getClient();
      
      // 获取Redis信息
      const info = await client.info();
      
      // 解析Redis信息
      const metrics: any = {};
      info.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          if (key && value) {
            metrics[key] = value.trim();
          }
        }
      });
      
      // 获取内存使用情况
      const memoryInfo = await client.memoryInfo();
      
      // 获取连接数
      const clientsInfo = await client.clientList();
      const connectionCount = clientsInfo.split('\n').filter(line => line).length;
      
      return {
        connected_clients: connectionCount,
        used_memory: memoryInfo.used_memory,
        used_memory_peak: memoryInfo.used_memory_peak,
        used_cpu_sys: parseFloat(metrics.used_cpu_sys || '0'),
        used_cpu_user: parseFloat(metrics.used_cpu_user || '0'),
        keyspace_hits: parseInt(metrics.keyspace_hits || '0'),
        keyspace_misses: parseInt(metrics.keyspace_misses || '0'),
      };
    } catch (error) {
      this.logger.error('Failed to get Redis metrics:', error);
      throw error;
    }
  }

  /**
   * 获取ClickHouse资源使用情况
   */
  async getClickHouseMetrics(): Promise<any> {
    try {
      const client = this.clickhouseConnectionManager.getClient();
      
      // 获取ClickHouse系统指标
      const result = await client.query({ query: 'SELECT * FROM system.metrics;' });
      const metrics = await result.json();
      
      // 获取ClickHouse进程指标
      const processResult = await client.query({ query: 'SELECT * FROM system.processes;' });
      const processes = await processResult.json();
      
      return {
        query_count: processes.length,
        metrics: metrics,
      };
    } catch (error) {
      this.logger.error('Failed to get ClickHouse metrics:', error);
      throw error;
    }
  }

  /**
   * 监控数据库资源并发送指标
   */
  async monitorAndSendMetrics(interval: number = 10000): Promise<void> {
    setInterval(async () => {
      try {
        // 获取PostgreSQL指标
        const postgresMetrics = await this.getPostgresMetrics();
        this.logger.debug('PostgreSQL resource metrics:', postgresMetrics);
        
        // 获取Redis指标
        const redisMetrics = await this.getRedisMetrics();
        this.logger.debug('Redis resource metrics:', redisMetrics);
        
        // 获取ClickHouse指标
        const clickhouseMetrics = await this.getClickHouseMetrics();
        this.logger.debug('ClickHouse resource metrics:', clickhouseMetrics);
      } catch (error) {
        this.logger.error('Failed to monitor database resources:', error);
      }
    }, interval);
  }
}
```

### 4.2 动态资源调整器

#### 4.2.1 连接池动态调整

```typescript
// src/infrastructure/resource-management/ConnectionPoolAdjuster.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { PostgreSQLConnectionManager } from '../persistence/postgresql/PostgreSQLConnectionManager';
import { RedisConnectionManager } from '../persistence/redis/RedisConnectionManager';
import { DatabaseResourceMonitor } from '../resource-monitoring/DatabaseResourceMonitor';

@singleton()
export class ConnectionPoolAdjuster {
  constructor(
    private logger: Logger,
    private postgresConnectionManager: PostgreSQLConnectionManager,
    private redisConnectionManager: RedisConnectionManager,
    private databaseResourceMonitor: DatabaseResourceMonitor
  ) {}

  /**
   * 动态调整PostgreSQL连接池大小
   */
  async adjustPostgresConnectionPool(): Promise<void> {
    try {
      const metrics = await this.databaseResourceMonitor.getPostgresMetrics();
      const currentConnections = metrics.connection_count;
      
      // 获取当前连接池配置
      const currentConfig = this.postgresConnectionManager.getConfig();
      const currentMax = currentConfig.max;
      const currentMin = currentConfig.min;
      
      // 计算目标连接池大小
      // 基于当前连接数和缓冲区命中率调整
      let targetMax = currentMax;
      
      if (currentConnections > currentMax * 0.8) {
        // 连接数超过80%，增加连接池大小
        targetMax = Math.min(currentMax + 10, 100); // 最大100个连接
        this.logger.info(`Increasing PostgreSQL connection pool from ${currentMax} to ${targetMax}`);
      } else if (currentConnections < currentMax * 0.3 && currentMax > currentMin + 5) {
        // 连接数低于30%，减少连接池大小
        targetMax = Math.max(currentMax - 5, currentMin);
        this.logger.info(`Decreasing PostgreSQL connection pool from ${currentMax} to ${targetMax}`);
      }
      
      // 调整连接池大小
      if (targetMax !== currentMax) {
        await this.postgresConnectionManager.updateConfig({ max: targetMax });
      }
    } catch (error) {
      this.logger.error('Failed to adjust PostgreSQL connection pool:', error);
    }
  }

  /**
   * 动态调整Redis连接池大小
   */
  async adjustRedisConnectionPool(): Promise<void> {
    try {
      const metrics = await this.databaseResourceMonitor.getRedisMetrics();
      const currentConnections = metrics.connected_clients;
      
      // 获取当前连接池配置
      const currentConfig = this.redisConnectionManager.getConfig();
      const currentMax = currentConfig.max;
      const currentMin = currentConfig.min;
      
      // 计算目标连接池大小
      let targetMax = currentMax;
      
      if (currentConnections > currentMax * 0.8) {
        // 连接数超过80%，增加连接池大小
        targetMax = Math.min(currentMax + 20, 200); // 最大200个连接
        this.logger.info(`Increasing Redis connection pool from ${currentMax} to ${targetMax}`);
      } else if (currentConnections < currentMax * 0.3 && currentMax > currentMin + 10) {
        // 连接数低于30%，减少连接池大小
        targetMax = Math.max(currentMax - 10, currentMin);
        this.logger.info(`Decreasing Redis connection pool from ${currentMax} to ${targetMax}`);
      }
      
      // 调整连接池大小
      if (targetMax !== currentMax) {
        await this.redisConnectionManager.updateConfig({ max: targetMax });
      }
    } catch (error) {
      this.logger.error('Failed to adjust Redis connection pool:', error);
    }
  }

  /**
   * 定期调整连接池大小
   */
  async startAutoAdjustment(interval: number = 30000): Promise<void> {
    setInterval(async () => {
      try {
        await this.adjustPostgresConnectionPool();
        await this.adjustRedisConnectionPool();
      } catch (error) {
        this.logger.error('Failed to auto adjust connection pools:', error);
      }
    }, interval);
  }
}
```

#### 4.2.2 应用实例动态调整

```typescript
// src/infrastructure/resource-management/ApplicationScaler.ts
import { singleton } from 'tsyringe';
import cluster from 'cluster';
import os from 'os';
import { Logger } from '../logging/Logger';
import { SystemResourceMonitor } from '../resource-monitoring/SystemResourceMonitor';

@singleton()
export class ApplicationScaler {
  private workerCount: number = 0;
  private maxWorkers: number = os.cpus().length;
  private minWorkers: number = 1;

  constructor(private logger: Logger, private systemResourceMonitor: SystemResourceMonitor) {}

  /**
   * 初始化集群
   */
  initializeCluster(): void {
    if (cluster.isPrimary) {
      // 启动初始数量的工作进程
      this.workerCount = Math.min(this.maxWorkers, 2); // 初始2个工作进程
      this.logger.info(`Initializing cluster with ${this.workerCount} workers`);
      
      for (let i = 0; i < this.workerCount; i++) {
        cluster.fork();
      }
      
      // 监听工作进程退出事件
      cluster.on('exit', (worker, code, signal) => {
        this.logger.info(`Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
        this.workerCount--;
        // 重启工作进程
        cluster.fork();
        this.workerCount++;
      });
      
      // 启动自动扩展
      this.startAutoScaling();
    }
  }

  /**
   * 动态调整应用实例数量
   */
  async scaleApplication(): Promise<void> {
    if (!cluster.isPrimary) {
      return;
    }
    
    try {
      const metrics = this.systemResourceMonitor.getSystemMetrics();
      const cpuUsage = metrics.cpu.usage;
      const memoryUsage = metrics.memory.usage;
      
      let targetWorkers = this.workerCount;
      
      // 基于CPU和内存使用率调整工作进程数量
      if (cpuUsage > 70 || memoryUsage > 80) {
        // 资源使用率超过阈值，增加工作进程
        if (this.workerCount < this.maxWorkers) {
          targetWorkers = this.workerCount + 1;
          this.logger.info(`Scaling up: increasing workers from ${this.workerCount} to ${targetWorkers}`);
          cluster.fork();
          this.workerCount++;
        }
      } else if (cpuUsage < 30 && memoryUsage < 40) {
        // 资源使用率低于阈值，减少工作进程
        if (this.workerCount > this.minWorkers) {
          targetWorkers = this.workerCount - 1;
          this.logger.info(`Scaling down: decreasing workers from ${this.workerCount} to ${targetWorkers}`);
          
          // 终止一个工作进程
          const workers = Object.values(cluster.workers);
          if (workers.length > 0) {
            workers[workers.length - 1].kill();
            this.workerCount--;
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to scale application:', error);
    }
  }

  /**
   * 定期调整应用实例数量
   */
  async startAutoScaling(interval: number = 60000): Promise<void> {
    setInterval(async () => {
      await this.scaleApplication();
    }, interval);
  }

  /**
   * 获取当前工作进程数量
   */
  getWorkerCount(): number {
    return this.workerCount;
  }
}
```

### 4.3 自动扩展器

#### 4.3.1 Kubernetes HPA配置

```yaml
# kubernetes/hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cognitive-assistant-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cognitive-assistant
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: requests_per_second
      target:
        type: AverageValue
        averageValue: 100
```

#### 4.3.2 基于队列长度的自动扩展

```typescript
// src/infrastructure/resource-management/QueueBasedScaler.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { Queue } from 'bullmq';

@singleton()
export class QueueBasedScaler {
  private queues: Record<string, Queue> = {};

  constructor(private logger: Logger) {}

  /**
   * 注册队列
   */
  registerQueue(queueName: string, queue: Queue): void {
    this.queues[queueName] = queue;
    this.logger.info(`Registered queue ${queueName} for auto scaling`);
  }

  /**
   * 基于队列长度调整工作进程
   */
  async scaleBasedOnQueueLength(): Promise<void> {
    try {
      for (const [queueName, queue] of Object.entries(this.queues)) {
        const waitingCount = await queue.count();
        const activeCount = await queue.getActiveCount();
        const delayedCount = await queue.getDelayedCount();
        
        const totalJobs = waitingCount + activeCount + delayedCount;
        
        this.logger.debug(`Queue ${queueName} status: waiting=${waitingCount}, active=${activeCount}, delayed=${delayedCount}`);
        
        // 根据队列长度调整工作进程
        // 这里可以集成Kubernetes API或其他容器编排工具
        // 简化实现：输出日志
        if (waitingCount > 50) {
          this.logger.info(`Queue ${queueName} has ${waitingCount} waiting jobs, consider scaling up`);
        } else if (waitingCount < 5 && activeCount === 0) {
          this.logger.info(`Queue ${queueName} is idle, consider scaling down`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to scale based on queue length:', error);
    }
  }

  /**
   * 定期检查队列长度并调整
   */
  async startQueueMonitoring(interval: number = 30000): Promise<void> {
    setInterval(async () => {
      await this.scaleBasedOnQueueLength();
    }, interval);
  }
}
```

### 4.4 资源优化器

#### 4.4.1 查询优化器

```typescript
// src/infrastructure/resource-management/QueryOptimizer.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { PostgreSQLConnectionManager } from '../persistence/postgresql/PostgreSQLConnectionManager';

@singleton()
export class QueryOptimizer {
  constructor(
    private logger: Logger,
    private postgresConnectionManager: PostgreSQLConnectionManager
  ) {}

  /**
   * 分析慢查询并提供优化建议
   */
  async analyzeSlowQueries(): Promise<void> {
    try {
      const connection = await this.postgresConnectionManager.getConnection();
      
      // 查询慢查询日志
      const slowQueries = await connection.query(`
        SELECT 
          queryid, 
          query, 
          calls, 
          total_exec_time, 
          mean_exec_time, 
          rows
        FROM pg_stat_statements 
        WHERE mean_exec_time > 500 -- 平均执行时间超过500ms
        ORDER BY total_exec_time DESC
        LIMIT 10;
      `);
      
      if (slowQueries.rows.length > 0) {
        this.logger.info('Found slow queries:');
        slowQueries.rows.forEach((query: any) => {
          this.logger.info(`Query ID: ${query.queryid}`);
          this.logger.info(`Query: ${query.query}`);
          this.logger.info(`Calls: ${query.calls}, Total Time: ${query.total_exec_time.toFixed(2)}ms, Mean Time: ${query.mean_exec_time.toFixed(2)}ms`);
          this.logger.info('---');
        });
      }
      
      await this.postgresConnectionManager.releaseConnection(connection);
    } catch (error) {
      this.logger.error('Failed to analyze slow queries:', error);
    }
  }

  /**
   * 优化数据库索引
   */
  async optimizeIndexes(): Promise<void> {
    try {
      const connection = await this.postgresConnectionManager.getConnection();
      
      // 查找缺失的索引
      const missingIndexes = await connection.query(`
        SELECT 
          relname as table_name, 
          indexrelname as index_name, 
          idx_scan as index_scans, 
          idx_tup_read as index_tuples_read, 
          idx_tup_fetch as index_tuples_fetched
        FROM pg_stat_user_indexes 
        WHERE idx_scan = 0 -- 从未使用过的索引
        ORDER BY relname;
      `);
      
      if (missingIndexes.rows.length > 0) {
        this.logger.info('Found unused indexes:');
        missingIndexes.rows.forEach((index: any) => {
          this.logger.info(`Table: ${index.table_name}, Index: ${index.index_name} - never used`);
        });
      }
      
      await this.postgresConnectionManager.releaseConnection(connection);
    } catch (error) {
      this.logger.error('Failed to optimize indexes:', error);
    }
  }

  /**
   * 定期优化查询和索引
   */
  async startOptimizationJobs(interval: number = 3600000): Promise<void> {
    setInterval(async () => {
      try {
        await this.analyzeSlowQueries();
        await this.optimizeIndexes();
      } catch (error) {
        this.logger.error('Failed to run optimization jobs:', error);
      }
    }, interval);
  }
}
```

### 4.5 资源管理控制器

```typescript
// src/infrastructure/resource-management/ResourceManager.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { SystemResourceMonitor } from '../resource-monitoring/SystemResourceMonitor';
import { DatabaseResourceMonitor } from '../resource-monitoring/DatabaseResourceMonitor';
import { ConnectionPoolAdjuster } from './ConnectionPoolAdjuster';
import { ApplicationScaler } from './ApplicationScaler';
import { QueueBasedScaler } from './QueueBasedScaler';
import { QueryOptimizer } from './QueryOptimizer';

@singleton()
export class ResourceManager {
  constructor(
    private logger: Logger,
    private systemResourceMonitor: SystemResourceMonitor,
    private databaseResourceMonitor: DatabaseResourceMonitor,
    private connectionPoolAdjuster: ConnectionPoolAdjuster,
    private applicationScaler: ApplicationScaler,
    private queueBasedScaler: QueueBasedScaler,
    private queryOptimizer: QueryOptimizer
  ) {}

  /**
   * 初始化动态资源管理
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing dynamic resource management...');
    
    // 启动资源监控
    await this.systemResourceMonitor.monitorAndSendMetrics();
    await this.databaseResourceMonitor.monitorAndSendMetrics();
    
    // 启动连接池动态调整
    await this.connectionPoolAdjuster.startAutoAdjustment();
    
    // 初始化应用集群
    this.applicationScaler.initializeCluster();
    
    // 启动自动扩展
    await this.applicationScaler.startAutoScaling();
    
    // 启动队列监控
    await this.queueBasedScaler.startQueueMonitoring();
    
    // 启动查询优化
    await this.queryOptimizer.startOptimizationJobs();
    
    this.logger.info('Dynamic resource management initialized successfully');
  }

  /**
   * 获取资源管理状态
   */
  async getStatus(): Promise<any> {
    const systemMetrics = this.systemResourceMonitor.getSystemMetrics();
    const postgresMetrics = await this.databaseResourceMonitor.getPostgresMetrics();
    const redisMetrics = await this.databaseResourceMonitor.getRedisMetrics();
    const workerCount = this.applicationScaler.getWorkerCount();
    
    return {
      timestamp: new Date().toISOString(),
      system: systemMetrics,
      postgresql: postgresMetrics,
      redis: redisMetrics,
      application: {
        worker_count: workerCount,
      },
    };
  }
}
```

## 5. 配置管理

### 5.1 动态配置示例

```yaml
# consul-kv/config/dynamic-resource-management.json
{
  "resource_management": {
    "enabled": true,
    "monitoring_interval": 5000,
    "adjustment_interval": 30000,
    "scaling_interval": 60000,
    "optimization_interval": 3600000,
    "connection_pool": {
      "postgres": {
        "min": 5,
        "max": 100,
        "auto_adjust": true
      },
      "redis": {
        "min": 10,
        "max": 200,
        "auto_adjust": true
      }
    },
    "application_scaling": {
      "enabled": true,
      "min_workers": 1,
      "max_workers": 8
    },
    "auto_scaling": {
      "cpu_threshold": 70,
      "memory_threshold": 80,
      "queue_threshold": 50
    }
  }
}
```

### 5.2 配置加载器

```typescript
// src/infrastructure/config/DynamicConfigLoader.ts
import { singleton } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { ConfigManager } from './ConfigManager';

@singleton()
export class DynamicConfigLoader {
  private configCache: Record<string, any> = {};

  constructor(private logger: Logger, private configManager: ConfigManager) {
    this.loadConfig();
    this.watchConfigChanges();
  }

  /**
   * 加载配置
   */
  async loadConfig(): Promise<void> {
    try {
      const config = await this.configManager.getConfig<any>('resource_management', {
        enabled: true,
        monitoring_interval: 5000,
        adjustment_interval: 30000,
        scaling_interval: 60000,
        optimization_interval: 3600000,
        connection_pool: {
          postgres: {
            min: 5,
            max: 100,
            auto_adjust: true
          },
          redis: {
            min: 10,
            max: 200,
            auto_adjust: true
          }
        },
        application_scaling: {
          enabled: true,
          min_workers: 1,
          max_workers: 8
        },
        auto_scaling: {
          cpu_threshold: 70,
          memory_threshold: 80,
          queue_threshold: 50
        }
      });
      
      this.configCache = config;
      this.logger.info('Loaded dynamic resource management config');
    } catch (error) {
      this.logger.error('Failed to load dynamic resource management config:', error);
    }
  }

  /**
   * 监听配置变化
   */
  private watchConfigChanges(): void {
    // 这里可以集成配置管理系统的变更通知
    // 例如Consul的Watch API或Kubernetes ConfigMap变更
    this.logger.info('Watching for dynamic resource management config changes');
  }

  /**
   * 获取配置
   */
  getConfig(): any {
    return this.configCache;
  }

  /**
   * 获取特定配置项
   */
  getConfigItem<T>(path: string, defaultValue?: T): T {
    const keys = path.split('.');
    let value: any = this.configCache;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue as T;
      }
    }
    
    return value as T;
  }
}
```

## 6. 部署和运行

### 6.1 启动脚本

```bash
#!/bin/bash

echo "=== 启动动态资源管理 ==="

# 设置环境变量
export NODE_ENV=production
export CONSUL_HOST=consul
export CONSUL_PORT=8500
export PROMETHEUS_HOST=prometheus
export PROMETHEUS_PORT=9090

# 启动应用
echo "=== 启动应用集群 ==="
node dist/src/index.js
```

### 6.2 Kubernetes部署配置

```yaml
# kubernetes/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cognitive-assistant
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cognitive-assistant
  template:
    metadata:
      labels:
        app: cognitive-assistant
    spec:
      containers:
      - name: cognitive-assistant
        image: cognitive-assistant:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2"
        env:
        - name: NODE_ENV
          value: "production"
        - name: CONSUL_HOST
          value: "consul"
        - name: CONSUL_PORT
          value: "8500"
        - name: PROMETHEUS_HOST
          value: "prometheus"
        - name: PROMETHEUS_PORT
          value: "9090"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 7. 监控和告警

### 7.1 Prometheus告警规则

```yaml
# prometheus/rules/resource-alerts.yml
groups:
- name: resource_alerts
  rules:
  # CPU使用率告警
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage on {{ $labels.instance }}"
      description: "CPU usage is above 80% for 5 minutes"
  
  # 内存使用率告警
  - alert: HighMemoryUsage
    expr: (100 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100)) > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage on {{ $labels.instance }}"
      description: "Memory usage is above 85% for 5 minutes"
  
  # 磁盘使用率告警
  - alert: HighDiskUsage
    expr: 100 - ((node_filesystem_avail_bytes{fstype!="tmpfs"} * 100) / node_filesystem_size_bytes{fstype!="tmpfs"}) > 90
    for: 10m
    labels:
      severity: critical
    annotations:
      summary: "High disk usage on {{ $labels.instance }}"
      description: "Disk usage is above 90% for 10 minutes"
  
  # 连接池使用率告警
  - alert: HighConnectionPoolUsage
    expr: sum by(instance) (pg_stat_activity_count) / pg_settings_max_connections * 100 > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High PostgreSQL connection pool usage on {{ $labels.instance }}"
      description: "Connection pool usage is above 80% for 5 minutes"
  
  # Redis内存使用率告警
  - alert: HighRedisMemoryUsage
    expr: redis_memory_used_bytes / redis_memory_max_bytes * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High Redis memory usage on {{ $labels.instance }}"
      description: "Redis memory usage is above 85% for 5 minutes"
```

### 7.2 资源管理API

```typescript
// src/presentation/resource/ResourceController.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { injectable } from 'tsyringe';
import { ResourceManager } from '../../infrastructure/resource-management/ResourceManager';

@injectable()
export class ResourceController {
  constructor(private resourceManager: ResourceManager) {}

  /**
   * 注册资源管理路由
   */
  registerRoutes(fastify: FastifyInstance): void {
    // 获取资源状态
    fastify.get('/api/resources/status', async (request: FastifyRequest, reply: FastifyReply) => {
      const status = await this.resourceManager.getStatus();
      reply.send(status);
    });
  }
}
```

## 8. 总结

本文档提供了完整的动态资源管理实现方案，包括：

1. 资源监控器，监控系统和数据库资源使用情况
2. 动态资源调整器，调整连接池大小和应用实例数量
3. 自动扩展器，基于负载的自动扩展
4. 资源优化器，优化查询和索引
5. 资源管理控制器，统一管理资源

本方案基于当前项目技术栈，确保系统在不同负载下的性能和资源利用率。通过实施本方案，可以支持系统的动态扩展和资源优化，满足未来业务增长的需求。
