# 137-connection-pool-monitoring-code.md

## 连接池监控实现代码

### 1. 监控指标定义

```typescript
// src/infrastructure/database/monitoring/ConnectionPoolMetrics.ts
/**
 * 连接池监控指标定义
 */
export interface ConnectionPoolMetrics {
  /** 总连接数 */
  totalConnections: number;
  /** 活跃连接数 */
  activeConnections: number;
  /** 空闲连接数 */
  idleConnections: number;
  /** 等待连接的请求数 */
  waitingRequests: number;
  /** 连接获取延迟（毫秒） */
  connectionAcquireDelay: number;
  /** 连接创建时间（毫秒） */
  connectionCreateTime: number;
  /** 连接关闭时间（毫秒） */
  connectionCloseTime: number;
  /** 连接池使用率（%） */
  poolUsageRate: number;
  /** 连接超时次数 */
  connectionTimeouts: number;
  /** 连接错误次数 */
  connectionErrors: number;
  /** 连接复用次数 */
  connectionReuses: number;
  /** 连接池配置最大连接数 */
  maxConnections: number;
  /** 连接池配置最小连接数 */
  minConnections: number;
}
```

### 2. 监控指标收集器

```typescript
// src/infrastructure/database/monitoring/ConnectionPoolMetricsCollector.ts
import { singleton } from 'tsyringe';
import { ConnectionPoolMetrics } from './ConnectionPoolMetrics';
import { Counter, Gauge, Histogram, Summary } from 'prom-client';

@singleton()
export class ConnectionPoolMetricsCollector {
  // Prometheus指标定义
  private readonly totalConnections = new Gauge({
    name: 'database_connection_pool_total_connections',
    help: 'Total connections in the pool',
    labelNames: ['database'],
  });

  private readonly activeConnections = new Gauge({
    name: 'database_connection_pool_active_connections',
    help: 'Active connections in the pool',
    labelNames: ['database'],
  });

  private readonly idleConnections = new Gauge({
    name: 'database_connection_pool_idle_connections',
    help: 'Idle connections in the pool',
    labelNames: ['database'],
  });

  private readonly waitingRequests = new Gauge({
    name: 'database_connection_pool_waiting_requests',
    help: 'Number of requests waiting for a connection',
    labelNames: ['database'],
  });

  private readonly connectionAcquireDelay = new Histogram({
    name: 'database_connection_pool_acquire_delay_seconds',
    help: 'Time taken to acquire a connection from the pool',
    labelNames: ['database'],
    buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
  });

  private readonly connectionCreateTime = new Histogram({
    name: 'database_connection_pool_create_time_seconds',
    help: 'Time taken to create a new connection',
    labelNames: ['database'],
    buckets: [0.01, 0.1, 0.5, 1, 2, 5],
  });

  private readonly connectionCloseTime = new Histogram({
    name: 'database_connection_pool_close_time_seconds',
    help: 'Time taken to close a connection',
    labelNames: ['database'],
    buckets: [0.001, 0.01, 0.05, 0.1],
  });

  private readonly poolUsageRate = new Gauge({
    name: 'database_connection_pool_usage_rate',
    help: 'Connection pool usage rate (0-1)',
    labelNames: ['database'],
  });

  private readonly connectionTimeouts = new Counter({
    name: 'database_connection_pool_timeouts_total',
    help: 'Total number of connection timeouts',
    labelNames: ['database'],
  });

  private readonly connectionErrors = new Counter({
    name: 'database_connection_pool_errors_total',
    help: 'Total number of connection errors',
    labelNames: ['database', 'error_type'],
  });

  private readonly connectionReuses = new Counter({
    name: 'database_connection_pool_reuses_total',
    help: 'Total number of connection reuses',
    labelNames: ['database'],
  });

  private readonly maxConnections = new Gauge({
    name: 'database_connection_pool_config_max_connections',
    help: 'Configured maximum connections',
    labelNames: ['database'],
  });

  private readonly minConnections = new Gauge({
    name: 'database_connection_pool_config_min_connections',
    help: 'Configured minimum connections',
    labelNames: ['database'],
  });

  /**
   * 更新连接池指标
   * @param dbName 数据库名称
   * @param metrics 连接池指标
   */
  updateMetrics(dbName: string, metrics: ConnectionPoolMetrics): void {
    this.totalConnections.set({ database: dbName }, metrics.totalConnections);
    this.activeConnections.set({ database: dbName }, metrics.activeConnections);
    this.idleConnections.set({ database: dbName }, metrics.idleConnections);
    this.waitingRequests.set({ database: dbName }, metrics.waitingRequests);
    this.connectionAcquireDelay.observe({ database: dbName }, metrics.connectionAcquireDelay / 1000);
    this.connectionCreateTime.observe({ database: dbName }, metrics.connectionCreateTime / 1000);
    this.connectionCloseTime.observe({ database: dbName }, metrics.connectionCloseTime / 1000);
    this.poolUsageRate.set({ database: dbName }, metrics.poolUsageRate / 100);
    this.maxConnections.set({ database: dbName }, metrics.maxConnections);
    this.minConnections.set({ database: dbName }, metrics.minConnections);
  }

  /**
   * 记录连接超时
   * @param dbName 数据库名称
   */
  recordConnectionTimeout(dbName: string): void {
    this.connectionTimeouts.inc({ database: dbName });
  }

  /**
   * 记录连接错误
   * @param dbName 数据库名称
   * @param errorType 错误类型
   */
  recordConnectionError(dbName: string, errorType: string): void {
    this.connectionErrors.inc({ database: dbName, error_type: errorType });
  }

  /**
   * 记录连接复用
   * @param dbName 数据库名称
   */
  recordConnectionReuse(dbName: string): void {
    this.connectionReuses.inc({ database: dbName });
  }

  /**
   * 记录连接获取延迟
   * @param dbName 数据库名称
   * @param delayMs 延迟毫秒数
   */
  recordConnectionAcquireDelay(dbName: string, delayMs: number): void {
    this.connectionAcquireDelay.observe({ database: dbName }, delayMs / 1000);
  }
}
```

### 3. 连接池监控服务

```typescript
// src/infrastructure/database/monitoring/ConnectionPoolMonitoringService.ts
import { singleton } from 'tsyringe';
import { ConnectionPoolMetrics } from './ConnectionPoolMetrics';
import { ConnectionPoolMetricsCollector } from './ConnectionPoolMetricsCollector';
import { IConnectionPool } from '../pool/IConnectionPool';

@singleton()
export class ConnectionPoolMonitoringService {
  constructor(
    private readonly metricsCollector: ConnectionPoolMetricsCollector
  ) {}

  /**
   * 监控连接池
   * @param pool 连接池实例
   * @param dbName 数据库名称
   * @param intervalMs 监控间隔（毫秒）
   */
  monitorPool(pool: IConnectionPool, dbName: string, intervalMs: number = 5000): void {
    setInterval(() => {
      this.collectAndReportMetrics(pool, dbName);
    }, intervalMs);
  }

  /**
   * 收集并报告连接池指标
   * @param pool 连接池实例
   * @param dbName 数据库名称
   */
  private collectAndReportMetrics(pool: IConnectionPool, dbName: string): void {
    const poolStats = pool.getStats();
    const metrics: ConnectionPoolMetrics = {
      totalConnections: poolStats.totalConnections,
      activeConnections: poolStats.activeConnections,
      idleConnections: poolStats.idleConnections,
      waitingRequests: poolStats.waitingRequests,
      connectionAcquireDelay: poolStats.averageAcquireDelay,
      connectionCreateTime: poolStats.averageCreateTime,
      connectionCloseTime: poolStats.averageCloseTime,
      poolUsageRate: (poolStats.activeConnections / poolStats.maxConnections) * 100,
      connectionTimeouts: poolStats.timeouts,
      connectionErrors: poolStats.errors,
      connectionReuses: poolStats.reuses,
      maxConnections: poolStats.maxConnections,
      minConnections: poolStats.minConnections
    };

    this.metricsCollector.updateMetrics(dbName, metrics);
  }

  /**
   * 记录连接事件
   * @param eventType 事件类型
   * @param dbName 数据库名称
   * @param data 事件数据
   */
  recordConnectionEvent(eventType: string, dbName: string, data?: any): void {
    switch (eventType) {
      case 'timeout':
        this.metricsCollector.recordConnectionTimeout(dbName);
        break;
      case 'error':
        this.metricsCollector.recordConnectionError(dbName, data?.errorType || 'unknown');
        break;
      case 'reuse':
        this.metricsCollector.recordConnectionReuse(dbName);
        break;
      case 'acquire':
        if (data?.delayMs) {
          this.metricsCollector.recordConnectionAcquireDelay(dbName, data.delayMs);
        }
        break;
    }
  }
}
```

### 4. Prometheus 集成

```typescript
// src/infrastructure/monitoring/PrometheusServer.ts
import { createServer } from 'http';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { singleton } from 'tsyringe';

@singleton()
export class PrometheusServer {
  private registry: Registry;
  private server: ReturnType<typeof createServer> | null = null;

  constructor() {
    // 创建新的注册表
    this.registry = new Registry();
    // 收集默认的 Node.js 指标
    collectDefaultMetrics({ register: this.registry });
  }

  /**
   * 启动 Prometheus 服务器
   * @param port 监听端口
   * @param path 指标路径
   */
  start(port: number, path: string = '/metrics'): void {
    this.server = createServer((req, res) => {
      if (req.url === path) {
        res.setHeader('Content-Type', this.registry.contentType);
        this.registry.metrics().then(metrics => {
          res.end(metrics);
        }).catch(err => {
          res.statusCode = 500;
          res.end(`Error getting metrics: ${err.message}`);
        });
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });

    this.server.listen(port, () => {
      console.log(`Prometheus metrics server started at http://localhost:${port}${path}`);
    });
  }

  /**
   * 停止 Prometheus 服务器
   */
  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      console.log('Prometheus metrics server stopped');
    }
  }

  /**
   * 获取注册表
   */
  getRegistry(): Registry {
    return this.registry;
  }
}
```

### 5. 连接池监控中间件

```typescript
// src/infrastructure/database/middleware/ConnectionPoolMonitoringMiddleware.ts
import { IConnectionPool } from '../pool/IConnectionPool';
import { ConnectionPoolMonitoringService } from '../monitoring/ConnectionPoolMonitoringService';
import { singleton } from 'tsyringe';

export interface ConnectionPoolMiddleware {
  beforeAcquire(): void;
  afterAcquire(connection: any, delayMs: number): void;
  beforeRelease(connection: any): void;
  afterRelease(delayMs: number): void;
  onError(error: Error): void;
  onTimeout(): void;
}

@singleton()
export class ConnectionPoolMonitoringMiddleware implements ConnectionPoolMiddleware {
  private acquireStartTimes: Map<string, number> = new Map();

  constructor(
    private readonly monitoringService: ConnectionPoolMonitoringService
  ) {}

  /**
   * 获取连接前调用
   */
  beforeAcquire(): void {
    const requestId = this.generateRequestId();
    this.acquireStartTimes.set(requestId, Date.now());
    return requestId;
  }

  /**
   * 获取连接后调用
   * @param connection 数据库连接
   * @param delayMs 获取延迟（毫秒）
   */
  afterAcquire(connection: any, delayMs: number): void {
    const requestId = this.getRequestId(connection);
    if (requestId) {
      this.acquireStartTimes.delete(requestId);
      this.monitoringService.recordConnectionEvent('acquire', 'default', { delayMs });
      this.monitoringService.recordConnectionEvent('reuse', 'default');
    }
  }

  /**
   * 释放连接前调用
   * @param connection 数据库连接
   */
  beforeRelease(connection: any): void {
    // 可以在这里添加释放前的监控逻辑
  }

  /**
   * 释放连接后调用
   * @param delayMs 释放延迟（毫秒）
   */
  afterRelease(delayMs: number): void {
    // 可以在这里添加释放后的监控逻辑
  }

  /**
   * 连接错误时调用
   * @param error 错误对象
   */
  onError(error: Error): void {
    this.monitoringService.recordConnectionEvent('error', 'default', {
      errorType: error.name || 'unknown'
    });
  }

  /**
   * 连接超时时调用
   */
  onTimeout(): void {
    this.monitoringService.recordConnectionEvent('timeout', 'default');
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * 从连接获取请求ID
   * @param connection 数据库连接
   */
  private getRequestId(connection: any): string | undefined {
    // 这里需要根据实际连接对象的结构来获取请求ID
    // 实际实现中可能需要扩展连接对象或使用其他方式关联请求
    return undefined;
  }
}
```

### 6. Grafana 仪表板配置

```json
{
  "dashboard": {
    "id": null,
    "title": "Database Connection Pool Monitoring",
    "tags": ["database", "connection-pool"],
    "timezone": "browser",
    "schemaVersion": 38,
    "version": 1,
    "refresh": "5s",
    "panels": [
      {
        "id": 1,
        "title": "Connection Pool Overview",
        "type": "stat",
        "datasource": "Prometheus",
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "yellow",
                  "value": 75
                },
                {
                  "color": "red",
                  "value": 90
                }
              ]
            }
          },
          "overrides": []
        },
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 0
        },
        "options": {
          "reduceOptions": {
            "values": false,
            "calcs": ["last"],
            "fields": ""
          },
          "orientation": "auto",
          "textMode": "auto",
          "colorMode": "value",
          "graphMode": "area",
          "justifyMode": "auto"
        },
        "targets": [
          {
            "expr": "database_connection_pool_total_connections",
            "legendFormat": "Total Connections",
            "refId": "A"
          },
          {
            "expr": "database_connection_pool_active_connections",
            "legendFormat": "Active Connections",
            "refId": "B"
          },
          {
            "expr": "database_connection_pool_idle_connections",
            "legendFormat": "Idle Connections",
            "refId": "C"
          }
        ]
      },
      {
        "id": 2,
        "title": "Connection Pool Usage Rate",
        "type": "gauge",
        "datasource": "Prometheus",
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "yellow",
                  "value": 0.75
                },
                {
                  "color": "red",
                  "value": 0.9
                }
              ]
            },
            "unit": "percent"
          },
          "overrides": []
        },
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 0
        },
        "options": {
          "minVizHeight": 100,
          "minVizWidth": 100,
          "orientation": "auto",
          "reduceOptions": {
            "calcs": ["last"],
            "fields": "",
            "values": false
          },
          "showThresholdLabels": false,
          "showThresholdMarkers": true
        },
        "targets": [
          {
            "expr": "database_connection_pool_usage_rate",
            "legendFormat": "Usage Rate",
            "refId": "A"
          }
        ]
      },
      {
        "id": 3,
        "title": "Connection Acquisition Delay",
        "type": "graph",
        "datasource": "Prometheus",
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "palette-classic"
            },
            "custom": {
              "drawStyle": "line",
              "lineInterpolation": "linear",
              "pointSize": 5,
              "fillOpacity": 10,
              "gradientMode": "opacity"
            },
            "unit": "ms"
          },
          "overrides": []
        },
        "gridPos": {
          "h": 8,
          "w": 24,
          "x": 0,
          "y": 8
        },
        "options": {
          "legend": {
            "showLegend": true
          },
          "tooltip": {
            "mode": "single",
            "sort": "none"
          }
        },
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(database_connection_pool_acquire_delay_seconds_bucket[5m])) by (le)) * 1000",
            "legendFormat": "95th Percentile (ms)",
            "refId": "A"
          },
          {
            "expr": "histogram_quantile(0.5, sum(rate(database_connection_pool_acquire_delay_seconds_bucket[5m])) by (le)) * 1000",
            "legendFormat": "50th Percentile (ms)",
            "refId": "B"
          }
        ]
      },
      {
        "id": 4,
        "title": "Connection Timeouts and Errors",
        "type": "graph",
        "datasource": "Prometheus",
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "palette-classic"
            },
            "custom": {
              "drawStyle": "line",
              "lineInterpolation": "linear",
              "pointSize": 5,
              "fillOpacity": 10,
              "gradientMode": "opacity"
            }
          },
          "overrides": []
        },
        "gridPos": {
          "h": 8,
          "w": 24,
          "x": 0,
          "y": 16
        },
        "options": {
          "legend": {
            "showLegend": true
          },
          "tooltip": {
            "mode": "single",
            "sort": "none"
          }
        },
        "targets": [
          {
            "expr": "rate(database_connection_pool_timeouts_total[5m])",
            "legendFormat": "Timeouts / sec",
            "refId": "A"
          },
          {
            "expr": "rate(database_connection_pool_errors_total[5m])",
            "legendFormat": "Errors / sec",
            "refId": "B"
          }
        ]
      },
      {
        "id": 5,
        "title": "Connection Reuses",
        "type": "graph",
        "datasource": "Prometheus",
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "palette-classic"
            },
            "custom": {
              "drawStyle": "line",
              "lineInterpolation": "linear",
              "pointSize": 5,
              "fillOpacity": 10,
              "gradientMode": "opacity"
            }
          },
          "overrides": []
        },
        "gridPos": {
          "h": 8,
          "w": 24,
          "x": 0,
          "y": 24
        },
        "options": {
          "legend": {
            "showLegend": true
          },
          "tooltip": {
            "mode": "single",
            "sort": "none"
          }
        },
        "targets": [
          {
            "expr": "rate(database_connection_pool_reuses_total[5m])",
            "legendFormat": "Reuses / sec",
            "refId": "A"
          }
        ]
      }
    ]
  }
}
```

### 7. 监控配置

```typescript
// src/config/MonitoringConfig.ts
export interface MonitoringConfig {
  /** 是否启用监控 */
  enabled: boolean;
  /** Prometheus 服务器端口 */
  prometheusPort: number;
  /** 指标路径 */
  metricsPath: string;
  /** 监控间隔（毫秒） */
  monitoringInterval: number;
  /** 是否启用详细监控 */
  detailedMonitoring: boolean;
}

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  enabled: true,
  prometheusPort: 9100,
  metricsPath: '/metrics',
  monitoringInterval: 5000,
  detailedMonitoring: false
};
```

### 8. 连接池监控集成

```typescript
// src/infrastructure/database/pool/DynamicConnectionPool.ts
import { IConnectionPool } from './IConnectionPool';
import { ConnectionPoolConfig } from './ConnectionPoolConfig';
import { ConnectionPoolStats } from './ConnectionPoolStats';
import { ConnectionPoolMonitoringMiddleware } from '../middleware/ConnectionPoolMonitoringMiddleware';

export class DynamicConnectionPool implements IConnectionPool {
  // 现有代码...
  
  constructor(
    private readonly pool: any,
    private readonly config: ConnectionPoolConfig,
    private readonly monitoringMiddleware?: ConnectionPoolMonitoringMiddleware
  ) {
    // 现有初始化代码...
    
    // 连接池事件监听
    this.pool.on('error', (err: Error) => {
      if (this.monitoringMiddleware) {
        this.monitoringMiddleware.onError(err);
      }
    });
    
    this.pool.on('acquire', (client: any) => {
      if (this.monitoringMiddleware) {
        // 这里需要获取实际的延迟时间
        this.monitoringMiddleware.afterAcquire(client, 0);
      }
    });
    
    this.pool.on('timeout', () => {
      if (this.monitoringMiddleware) {
        this.monitoringMiddleware.onTimeout();
      }
    });
  }
  
  // 现有方法...
  
  async acquire(): Promise<any> {
    const startTime = Date.now();
    const requestId = this.monitoringMiddleware?.beforeAcquire();
    
    try {
      const client = await this.pool.connect();
      const delayMs = Date.now() - startTime;
      
      if (this.monitoringMiddleware) {
        this.monitoringMiddleware.afterAcquire(client, delayMs);
      }
      
      return client;
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        if (this.monitoringMiddleware) {
          this.monitoringMiddleware.onTimeout();
        }
      } else if (error instanceof Error) {
        if (this.monitoringMiddleware) {
          this.monitoringMiddleware.onError(error);
        }
      }
      throw error;
    }
  }
  
  // 现有方法...
}
```

### 9. 监控服务注册

```typescript
// src/infrastructure/database/container.ts
import { container } from 'tsyringe';
import { ConnectionPoolFactory } from './pool/ConnectionPoolFactory';
import { DynamicConnectionPool } from './pool/DynamicConnectionPool';
import { ConnectionPoolConfig } from './pool/ConnectionPoolConfig';
import { ConnectionPoolMetricsCollector } from './monitoring/ConnectionPoolMetricsCollector';
import { ConnectionPoolMonitoringService } from './monitoring/ConnectionPoolMonitoringService';
import { ConnectionPoolMonitoringMiddleware } from './middleware/ConnectionPoolMonitoringMiddleware';
import { PrometheusServer } from '../monitoring/PrometheusServer';

// 注册监控相关服务
container.registerSingleton(ConnectionPoolMetricsCollector);
container.registerSingleton(ConnectionPoolMonitoringService);
container.registerSingleton(ConnectionPoolMonitoringMiddleware);
container.registerSingleton(PrometheusServer);

// 注册连接池工厂
container.registerSingleton(ConnectionPoolFactory);
```

### 10. 主应用集成

```typescript
// src/app.ts
import { container } from 'tsyringe';
import { DatabaseConnectionManager } from './infrastructure/database/DatabaseConnectionManager';
import { ConnectionPoolMonitoringService } from './infrastructure/database/monitoring/ConnectionPoolMonitoringService';
import { PrometheusServer } from './infrastructure/monitoring/PrometheusServer';
import { DEFAULT_MONITORING_CONFIG } from './config/MonitoringConfig';

async function startApp() {
  // 现有应用启动代码...
  
  // 启动 Prometheus 服务器
  const prometheusServer = container.resolve(PrometheusServer);
  prometheusServer.start(DEFAULT_MONITORING_CONFIG.prometheusPort, DEFAULT_MONITORING_CONFIG.metricsPath);
  
  // 获取数据库连接管理器
  const dbManager = container.resolve(DatabaseConnectionManager);
  
  // 获取监控服务
  const monitoringService = container.resolve(ConnectionPoolMonitoringService);
  
  // 获取连接池并开始监控
  const pool = await dbManager.getConnectionPool();
  monitoringService.monitorPool(pool, 'default', DEFAULT_MONITORING_CONFIG.monitoringInterval);
  
  // 现有应用启动代码...
}

startApp().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
```

## 使用说明

1. **安装依赖**：
   ```bash
   npm install prom-client
   ```

2. **配置监控**：
   - 修改 `src/config/MonitoringConfig.ts` 中的配置参数
   - 启用或禁用监控功能
   - 调整监控间隔和详细程度

3. **启动应用**：
   ```bash
   npm start
   ```

4. **访问监控指标**：
   - Prometheus 指标：http://localhost:9100/metrics
   - 可以使用 Prometheus 服务器抓取这些指标
   - 导入提供的 Grafana 仪表板配置以查看可视化监控数据

5. **扩展监控**：
   - 可以添加更多的监控指标
   - 可以实现自定义的监控中间件
   - 可以集成其他监控系统

## 监控指标说明

| 指标名称 | 类型 | 描述 |
|---------|------|------|
| database_connection_pool_total_connections | Gauge | 连接池中的总连接数 |
| database_connection_pool_active_connections | Gauge | 活跃连接数 |
| database_connection_pool_idle_connections | Gauge | 空闲连接数 |
| database_connection_pool_waiting_requests | Gauge | 等待连接的请求数 |
| database_connection_pool_acquire_delay_seconds | Histogram | 获取连接的延迟（秒） |
| database_connection_pool_create_time_seconds | Histogram | 创建连接的时间（秒） |
| database_connection_pool_close_time_seconds | Histogram | 关闭连接的时间（秒） |
| database_connection_pool_usage_rate | Gauge | 连接池使用率（0-1） |
| database_connection_pool_timeouts_total | Counter | 连接超时总数 |
| database_connection_pool_errors_total | Counter | 连接错误总数 |
| database_connection_pool_reuses_total | Counter | 连接复用总数 |
| database_connection_pool_config_max_connections | Gauge | 配置的最大连接数 |
| database_connection_pool_config_min_connections | Gauge | 配置的最小连接数 |

## 最佳实践

1. **合理设置监控间隔**：
   - 监控间隔过短会增加系统开销
   - 监控间隔过长会导致监控数据不及时
   - 建议设置为 5-15 秒

2. **根据负载调整监控级别**：
   - 低负载时可以启用详细监控
   - 高负载时建议使用基本监控
   - 可以根据系统负载动态调整监控级别

3. **设置合理的告警阈值**：
   - 连接池使用率超过 80% 时告警
   - 连接获取延迟超过 500ms 时告警
   - 连接超时次数突然增加时告警

4. **定期分析监控数据**：
   - 分析连接池使用趋势
   - 识别性能瓶颈
   - 优化连接池配置参数

5. **结合其他监控数据**：
   - 将连接池监控与应用性能监控结合
   - 将连接池监控与数据库性能监控结合
   - 综合分析系统性能问题

通过实现以上连接池监控代码，可以全面监控连接池的运行状态，及时发现和解决性能问题，提高系统的可靠性和可用性。