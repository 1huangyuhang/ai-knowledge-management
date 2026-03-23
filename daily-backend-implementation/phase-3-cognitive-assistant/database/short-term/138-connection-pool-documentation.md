# 138-connection-pool-documentation.md

# 连接池文档

## 1. 简介

连接池是数据库访问层的核心组件，用于管理和复用数据库连接，提高系统性能和可靠性。本文档详细介绍了AI认知辅助系统中连接池的设计、配置、使用和最佳实践。

## 2. 架构设计

### 2.1 分层架构

连接池实现遵循Clean Architecture原则，位于Infrastructure层，与Domain层完全解耦：

```
+-------------------+    +-------------------+    +-------------------+
|   Application     |    |   Domain          |    |   AI Capability   |
+-------------------+    +-------------------+    +-------------------+
          |                          |                          |
          v                          v                          v
+-------------------+    +-------------------+    +-------------------+
|   Infrastructure  |----|   Infrastructure  |----|   Infrastructure  |
|  - Connection Pool|    |  - Cache Layer    |    |  - LLM Interface  |
|  - Monitoring     |    |  - Storage        |    |  - Embedding      |
+-------------------+    +-------------------+    +-------------------+
```

### 2.2 核心组件

| 组件名称 | 描述 | 所在文件 |
|---------|------|---------|
| ConnectionPoolFactory | 连接池工厂，负责创建和管理连接池实例 | src/infrastructure/database/pool/ConnectionPoolFactory.ts |
| DynamicConnectionPool | 动态连接池实现，支持根据负载自动调整连接数 | src/infrastructure/database/pool/DynamicConnectionPool.ts |
| ConnectionPoolConfig | 连接池配置定义和验证 | src/infrastructure/database/pool/ConnectionPoolConfig.ts |
| ConnectionPoolStats | 连接池统计信息 | src/infrastructure/database/pool/ConnectionPoolStats.ts |
| ConnectionPoolMetricsCollector | 连接池指标收集器 | src/infrastructure/database/monitoring/ConnectionPoolMetricsCollector.ts |
| ConnectionPoolMonitoringService | 连接池监控服务 | src/infrastructure/database/monitoring/ConnectionPoolMonitoringService.ts |

## 3. 配置指南

### 3.1 基本配置

连接池配置通过`ConnectionPoolConfig`接口定义，支持以下参数：

| 参数名称 | 类型 | 默认值 | 描述 |
|---------|------|--------|------|
| host | string | localhost | 数据库主机地址 |
| port | number | 5432 | 数据库端口 |
| database | string | cognitive_assistant | 数据库名称 |
| user | string | postgres | 数据库用户名 |
| password | string | - | 数据库密码 |
| maxConnections | number | 10 | 最大连接数 |
| minConnections | number | 2 | 最小连接数 |
| idleTimeout | number | 30000 | 连接空闲超时时间（毫秒） |
| connectionTimeout | number | 10000 | 连接获取超时时间（毫秒） |
| queryTimeout | number | 30000 | 查询超时时间（毫秒） |
| retryAttempts | number | 3 | 连接重试次数 |
| retryDelay | number | 1000 | 连接重试延迟（毫秒） |
| enableDynamicScaling | boolean | true | 是否启用动态连接数调整 |
| scalingFactor | number | 0.5 | 连接数调整因子 |
| monitoringEnabled | boolean | true | 是否启用监控 |

### 3.2 动态配置

连接池支持动态配置更新，无需重启应用即可调整参数：

```typescript
// 更新连接池配置
await connectionPool.updateConfig({
  maxConnections: 20,
  idleTimeout: 60000
});
```

### 3.3 环境变量配置

可以通过环境变量配置连接池：

| 环境变量 | 对应配置 |
|---------|---------|
| DB_HOST | host |
| DB_PORT | port |
| DB_NAME | database |
| DB_USER | user |
| DB_PASSWORD | password |
| DB_MAX_CONNECTIONS | maxConnections |
| DB_MIN_CONNECTIONS | minConnections |

## 4. 使用指南

### 4.1 基本使用

```typescript
// 1. 导入必要的类
import { container } from 'tsyringe';
import { DatabaseConnectionManager } from './infrastructure/database/DatabaseConnectionManager';

// 2. 获取数据库连接管理器
const dbManager = container.resolve(DatabaseConnectionManager);

// 3. 获取连接池
const connectionPool = await dbManager.getConnectionPool();

// 4. 获取数据库连接
const client = await connectionPool.acquire();

try {
  // 5. 执行SQL查询
  const result = await client.query('SELECT * FROM cognitive_concepts WHERE id = $1', [1]);
  console.log(result.rows);
} finally {
  // 6. 释放连接回连接池
  await connectionPool.release(client);
}
```

### 4.2 使用事务

```typescript
const client = await connectionPool.acquire();

try {
  // 开始事务
  await client.query('BEGIN');
  
  // 执行多个SQL语句
  await client.query('INSERT INTO cognitive_concepts (name) VALUES ($1)', ['test']);
  await client.query('UPDATE cognitive_concepts SET description = $1 WHERE name = $2', ['test description', 'test']);
  
  // 提交事务
  await client.query('COMMIT');
} catch (error) {
  // 回滚事务
  await client.query('ROLLBACK');
  throw error;
} finally {
  await connectionPool.release(client);
}
```

### 4.3 使用连接池工厂

```typescript
import { container } from 'tsyringe';
import { ConnectionPoolFactory } from './infrastructure/database/pool/ConnectionPoolFactory';
import { ConnectionPoolConfig } from './infrastructure/database/pool/ConnectionPoolConfig';

// 获取连接池工厂
const poolFactory = container.resolve(ConnectionPoolFactory);

// 创建自定义配置
const customConfig: ConnectionPoolConfig = {
  host: 'localhost',
  port: 5432,
  database: 'custom_db',
  user: 'custom_user',
  password: 'custom_password',
  maxConnections: 15,
  minConnections: 3
};

// 创建连接池
const customPool = await poolFactory.createConnectionPool(customConfig);
```

## 5. 动态连接池特性

### 5.1 自动扩展和收缩

动态连接池会根据以下指标自动调整连接数：

- 活跃连接数
- 等待连接的请求数
- 连接获取延迟
- 系统负载（CPU、内存使用率）

### 5.2 调整策略

连接池使用以下算法调整连接数：

```
newConnectionCount = currentConnections + (targetUsage - currentUsage) * scalingFactor
```

其中：
- `targetUsage`：目标连接池使用率（默认80%）
- `currentUsage`：当前连接池使用率
- `scalingFactor`：调整因子（默认0.5）

### 5.3 配置动态特性

```typescript
const config: ConnectionPoolConfig = {
  // 其他配置...
  enableDynamicScaling: true,
  scalingFactor: 0.3,
  maxConnections: 50,
  minConnections: 5
};
```

## 6. 监控与指标

### 6.1 监控指标

连接池暴露以下Prometheus指标：

| 指标名称 | 类型 | 描述 |
|---------|------|------|
| database_connection_pool_total_connections | Gauge | 连接池中的总连接数 |
| database_connection_pool_active_connections | Gauge | 活跃连接数 |
| database_connection_pool_idle_connections | Gauge | 空闲连接数 |
| database_connection_pool_waiting_requests | Gauge | 等待连接的请求数 |
| database_connection_pool_acquire_delay_seconds | Histogram | 获取连接的延迟（秒） |
| database_connection_pool_timeouts_total | Counter | 连接超时总数 |
| database_connection_pool_errors_total | Counter | 连接错误总数 |
| database_connection_pool_reuses_total | Counter | 连接复用总数 |

### 6.2 Grafana仪表板

连接池提供了预配置的Grafana仪表板，包含以下面板：

- 连接池概览（总连接数、活跃连接数、空闲连接数）
- 连接池使用率
- 连接获取延迟
- 连接超时和错误
- 连接复用率

### 6.3 启用监控

```typescript
// src/app.ts
import { container } from 'tsyringe';
import { PrometheusServer } from './infrastructure/monitoring/PrometheusServer';
import { DEFAULT_MONITORING_CONFIG } from './config/MonitoringConfig';

// 启动Prometheus服务器
const prometheusServer = container.resolve(PrometheusServer);
prometheusServer.start(DEFAULT_MONITORING_CONFIG.prometheusPort, DEFAULT_MONITORING_CONFIG.metricsPath);
```

## 7. 最佳实践

### 7.1 连接池大小配置

- **CPU核心数法则**：初始maxConnections设置为CPU核心数的2-4倍
- **负载测试调整**：根据实际负载测试结果调整连接数
- **监控驱动优化**：根据监控指标（如连接获取延迟、使用率）动态调整
- **考虑数据库限制**：不超过数据库实例的最大连接数限制

### 7.2 连接使用最佳实践

- **始终释放连接**：使用try-finally块确保连接被释放
- **避免长时间占用连接**：尽量缩短连接持有时间
- **使用事务时保持连接**：在事务期间保持同一连接
- **避免连接泄漏**：确保所有连接都被正确释放

### 7.3 性能优化

- **使用Prepared Statements**：减少SQL解析开销
- **批量操作**：将多个小操作合并为批量操作
- **合理设置超时**：避免长时间阻塞
- **监控慢查询**：识别和优化慢查询

### 7.4 可靠性设计

- **启用连接验证**：定期验证连接有效性
- **配置适当的超时**：避免无限等待
- **实现重试机制**：对临时错误进行重试
- **监控连接池健康状态**：及时发现和处理问题

## 8. 故障排除

### 8.1 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 连接超时 | 连接池满、数据库负载高、网络问题 | 增加maxConnections、优化数据库性能、检查网络 |
| 连接泄漏 | 代码中未释放连接 | 检查代码，确保所有连接都在finally块中释放 |
| 连接被拒绝 | 数据库连接数达到上限 | 减少连接池maxConnections或增加数据库最大连接数 |
| 慢查询 | SQL语句效率低、索引问题 | 优化SQL、添加适当索引、监控慢查询 |
| 连接池使用率低 | 连接池过大 | 降低maxConnections或启用动态缩放 |

### 8.2 日志与调试

连接池提供详细的日志信息：

```typescript
// 设置日志级别
process.env.LOG_LEVEL = 'debug';

// 或在代码中设置
import { logger } from './infrastructure/logger';
logger.level = 'debug';
```

### 8.3 性能分析

使用以下命令分析连接池性能：

```bash
# 查看连接池统计信息
curl http://localhost:9100/metrics | grep database_connection_pool

# 使用pg_stat_activity查看数据库连接状态
psql -c "SELECT * FROM pg_stat_activity WHERE datname = 'cognitive_assistant'"
```

## 9. 迁移指南

### 9.1 从静态连接池迁移

1. **更新依赖**：
   ```bash
   npm install pg-pool@^3.6.0
   ```

2. **替换连接池实现**：
   ```typescript
   // 旧代码
   import { Pool } from 'pg';
   const pool = new Pool(config);
   
   // 新代码
   import { container } from 'tsyringe';
   import { DatabaseConnectionManager } from './infrastructure/database/DatabaseConnectionManager';
   const dbManager = container.resolve(DatabaseConnectionManager);
   const pool = await dbManager.getConnectionPool();
   ```

3. **更新连接使用方式**：
   ```typescript
   // 旧代码
   const client = await pool.connect();
   
   // 新代码
   const client = await pool.acquire();
   // 使用后
   await pool.release(client);
   ```

### 9.2 配置迁移

| 旧配置 | 新配置 | 说明 |
|-------|-------|------|
| PoolConfig.max | ConnectionPoolConfig.maxConnections | 最大连接数 |
| PoolConfig.min | ConnectionPoolConfig.minConnections | 最小连接数 |
| PoolConfig.idleTimeoutMillis | ConnectionPoolConfig.idleTimeout | 空闲超时时间 |
| PoolConfig.connectionTimeoutMillis | ConnectionPoolConfig.connectionTimeout | 连接超时时间 |

## 10. API参考

### 10.1 ConnectionPoolFactory

```typescript
class ConnectionPoolFactory {
  /**
   * 创建连接池
   * @param config 连接池配置
   * @returns 连接池实例
   */
  createConnectionPool(config: ConnectionPoolConfig): Promise<IConnectionPool>;
  
  /**
   * 获取默认连接池
   * @returns 默认连接池实例
   */
  getDefaultConnectionPool(): Promise<IConnectionPool>;
  
  /**
   * 关闭所有连接池
   */
  closeAll(): Promise<void>;
}
```

### 10.2 IConnectionPool

```typescript
interface IConnectionPool {
  /**
   * 获取数据库连接
   * @returns 数据库连接
   */
  acquire(): Promise<any>;
  
  /**
   * 释放数据库连接
   * @param connection 数据库连接
   */
  release(connection: any): Promise<void>;
  
  /**
   * 执行SQL查询
   * @param text SQL语句
   * @param values 查询参数
   * @returns 查询结果
   */
  query(text: string, values?: any[]): Promise<any>;
  
  /**
   * 关闭连接池
   */
  close(): Promise<void>;
  
  /**
   * 获取连接池统计信息
   * @returns 连接池统计信息
   */
  getStats(): ConnectionPoolStats;
  
  /**
   * 更新连接池配置
   * @param config 新的连接池配置
   */
  updateConfig(config: Partial<ConnectionPoolConfig>): Promise<void>;
}
```

### 10.3 ConnectionPoolStats

```typescript
interface ConnectionPoolStats {
  /** 总连接数 */
  totalConnections: number;
  /** 活跃连接数 */
  activeConnections: number;
  /** 空闲连接数 */
  idleConnections: number;
  /** 等待连接的请求数 */
  waitingRequests: number;
  /** 平均连接获取延迟（毫秒） */
  averageAcquireDelay: number;
  /** 平均连接创建时间（毫秒） */
  averageCreateTime: number;
  /** 平均连接关闭时间（毫秒） */
  averageCloseTime: number;
  /** 连接超时次数 */
  timeouts: number;
  /** 连接错误次数 */
  errors: number;
  /** 连接复用次数 */
  reuses: number;
  /** 最大连接数 */
  maxConnections: number;
  /** 最小连接数 */
  minConnections: number;
}
```

## 11. 高级特性

### 11.1 连接池集群

连接池支持集群模式，可以配置多个数据库实例：

```typescript
const clusterConfig = {
  hosts: [
    { host: 'db1.example.com', port: 5432 },
    { host: 'db2.example.com', port: 5432 },
    { host: 'db3.example.com', port: 5432 }
  ],
  loadBalancing: 'round-robin', // 或 'least-connections'
  // 其他配置...
};
```

### 11.2 连接池预热

可以在应用启动时预热连接池：

```typescript
const pool = await dbManager.getConnectionPool();

// 预热10个连接
await pool.warmup(10);
```

### 11.3 连接验证

连接池支持定期验证连接有效性：

```typescript
const config: ConnectionPoolConfig = {
  // 其他配置...
  connectionValidationInterval: 30000, // 每30秒验证一次连接
  connectionValidationQuery: 'SELECT 1' // 验证查询
};
```

## 12. 总结

连接池是AI认知辅助系统的重要组件，通过合理配置和使用连接池，可以提高系统性能、可靠性和可扩展性。本文档提供了连接池的全面指南，包括架构设计、配置、使用方法、监控和最佳实践。

建议定期监控连接池性能，根据实际负载调整配置，并遵循最佳实践以确保连接池的高效运行。