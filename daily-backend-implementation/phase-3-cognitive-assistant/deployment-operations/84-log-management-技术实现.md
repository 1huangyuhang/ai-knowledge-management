# 84-日志管理技术实现文档

## 1. 架构设计

### 1.1 分层架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Presentation Layer                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  LogApiController   │  │  LogQueryController │  │  LogAdminController│ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Application Layer                               │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  LogService         │  │  LogQueryService    │  │  LogAdminService  │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Domain Layer                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  Log                │  │  LogLevel           │  │  LogFilter        │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Infrastructure Layer                           │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  LokiLogRepository  │  │  FileLogRepository  │  │  LogAggregator    │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           AI Capability Layer                           │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  LogAnomalyDetector │  │  LogPatternAnalyzer │  │  LogSummarizer    │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 核心组件

| 组件 | 职责 | 分层 |
|------|------|------|
| LogService | 日志记录核心服务 | Application |
| LogQueryService | 日志查询和分析服务 | Application |
| LogAdminService | 日志管理服务 | Application |
| LogRepository | 日志存储接口 | Domain |
| LokiLogRepository | Loki日志存储实现 | Infrastructure |
| FileLogRepository | 文件日志存储实现 | Infrastructure |
| LogAggregator | 日志聚合服务 | Infrastructure |
| LogAnomalyDetector | 日志异常检测 | AI Capability |

## 2. 领域模型设计

### 2.1 核心实体

```typescript
// src/domain/entities/Log.ts
export interface Log {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  metadata: Record<string, any>;
  source: string;
  correlationId: string;
  traceId: string;
  userId?: string;
  service: string;
  environment: string;
}

// src/domain/enums/LogLevel.ts
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

// src/domain/entities/LogFilter.ts
export interface LogFilter {
  startTime?: Date;
  endTime?: Date;
  level?: LogLevel[];
  source?: string;
  service?: string;
  correlationId?: string;
  traceId?: string;
  userId?: string;
  searchTerm?: string;
  metadata?: Record<string, any>;
}

// src/domain/entities/LogAggregation.ts
export interface LogAggregation {
  field: string;
  value: string;
  count: number;
  minTimestamp: Date;
  maxTimestamp: Date;
}
```

## 3. Application层设计

### 3.1 服务接口

```typescript
// src/application/services/LogService.ts
export interface LogService {
  debug(message: string, metadata?: Record<string, any>): Promise<void>;
  info(message: string, metadata?: Record<string, any>): Promise<void>;
  warn(message: string, metadata?: Record<string, any>): Promise<void>;
  error(message: string, error?: Error, metadata?: Record<string, any>): Promise<void>;
  fatal(message: string, error?: Error, metadata?: Record<string, any>): Promise<void>;
  log(level: LogLevel, message: string, error?: Error, metadata?: Record<string, any>): Promise<void>;
}

// src/application/services/LogQueryService.ts
export interface LogQueryService {
  queryLogs(filter: LogFilter, pagination: Pagination): Promise<PaginatedResult<Log>>;
  aggregateLogs(filter: LogFilter, groupBy: string): Promise<LogAggregation[]>;
  getLogStatistics(filter: LogFilter): Promise<LogStatistics>;
  exportLogs(filter: LogFilter, format: 'json' | 'csv' | 'txt'): Promise<Blob>;
}

// src/application/services/LogAdminService.ts
export interface LogAdminService {
  createLogRetentionPolicy(policy: LogRetentionPolicy): Promise<LogRetentionPolicy>;
  getLogRetentionPolicies(): Promise<LogRetentionPolicy[]>;
  updateLogRetentionPolicy(id: string, policy: Partial<LogRetentionPolicy>): Promise<LogRetentionPolicy>;
  deleteLogRetentionPolicy(id: string): Promise<void>;
  archiveLogs(filter: LogFilter): Promise<void>;
  deleteLogs(filter: LogFilter): Promise<void>;
}
```

### 3.2 服务实现

```typescript
// src/application/services/impl/LogServiceImpl.ts
import { LogService } from '../LogService';
import { LogRepository } from '../../domain/repositories/LogRepository';
import { LogLevel } from '../../domain/enums/LogLevel';
import { CorrelationIdGenerator } from '../../infrastructure/utils/CorrelationIdGenerator';

export class LogServiceImpl implements LogService {
  constructor(
    private readonly logRepository: LogRepository,
    private readonly correlationIdGenerator: CorrelationIdGenerator
  ) {}

  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.DEBUG, message, undefined, metadata);
  }

  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.INFO, message, undefined, metadata);
  }

  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.WARN, message, undefined, metadata);
  }

  async error(message: string, error?: Error, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.ERROR, message, error, metadata);
  }

  async fatal(message: string, error?: Error, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.FATAL, message, error, metadata);
  }

  async log(level: LogLevel, message: string, error?: Error, metadata?: Record<string, any>): Promise<void> {
    const log = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message,
      metadata: {
        ...metadata,
        ...(error && { error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }})
      },
      source: process.env.SERVICE_NAME || 'unknown',
      correlationId: this.correlationIdGenerator.getCurrentCorrelationId() || this.correlationIdGenerator.generate(),
      traceId: this.correlationIdGenerator.getCurrentTraceId(),
      service: process.env.SERVICE_NAME || 'unknown',
      environment: process.env.NODE_ENV || 'development'
    };

    await this.logRepository.save(log);
  }
}
```

## 4. Infrastructure层设计

### 4.1 日志存储实现

```typescript
// src/infrastructure/repositories/LokiLogRepository.ts
import { LogRepository } from '../../domain/repositories/LogRepository';
import { Log } from '../../domain/entities/Log';
import { LogFilter } from '../../domain/entities/LogFilter';
import { LokiClient } from './clients/LokiClient';

export class LokiLogRepository implements LogRepository {
  constructor(private readonly lokiClient: LokiClient) {}

  async save(log: Log): Promise<void> {
    const lokiEntry = {
      stream: {
        level: log.level,
        source: log.source,
        service: log.service,
        environment: log.environment
      },
      values: [[
        (log.timestamp.getTime() * 1000000).toString(),
        JSON.stringify({
          message: log.message,
          metadata: log.metadata,
          correlationId: log.correlationId,
          traceId: log.traceId,
          userId: log.userId
        })
      ]]
    };

    await this.lokiClient.pushLogEntries([lokiEntry]);
  }

  async find(filter: LogFilter, pagination: Pagination): Promise<PaginatedResult<Log>> {
    // 实现Loki日志查询逻辑
    // ...
  }

  async aggregate(filter: LogFilter, groupBy: string): Promise<LogAggregation[]> {
    // 实现Loki日志聚合逻辑
    // ...
  }

  // 其他方法实现
}
```

### 4.2 日志聚合服务

```typescript
// src/infrastructure/services/LogAggregator.ts
import { LogService } from '../../application/services/LogService';
import { LogLevel } from '../../domain/enums/LogLevel';

export class LogAggregator {
  constructor(private readonly logService: LogService) {}

  async aggregateLogs(logs: Log[]): Promise<void> {
    // 实现日志聚合逻辑
    // 例如：按时间窗口、服务、级别等聚合日志
    // ...
    
    // 记录聚合结果
    await this.logService.info('Log aggregation completed', {
      aggregatedCount: logs.length,
      // 其他聚合统计信息
    });
  }
}
```

## 5. Presentation层设计

### 5.1 API控制器

```typescript
// src/presentation/controllers/LogApiController.ts
import { Request, Response } from 'express';
import { LogService } from '../../application/services/LogService';
import { Controller, Post, Get, UseMiddleware } from '../decorators/Controller';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

@Controller('/api/logs')
export class LogApiController {
  constructor(private readonly logService: LogService) {}

  @Post('/')
  @UseMiddleware(AuthMiddleware)
  async createLog(req: Request, res: Response): Promise<void> {
    const { level, message, error, metadata } = req.body;
    await this.logService.log(level, message, error, metadata);
    res.status(201).json({ message: 'Log created successfully' });
  }

  @Get('/statistics')
  @UseMiddleware(AuthMiddleware)
  async getLogStatistics(req: Request, res: Response): Promise<void> {
    // 实现日志统计查询
    // ...
  }
}
```

## 6. AI Capability层设计

### 6.1 日志异常检测

```typescript
// src/ai/services/LogAnomalyDetector.ts
import { Log } from '../../domain/entities/Log';
import { AIService } from './AIService';

export class LogAnomalyDetector {
  constructor(private readonly aiService: AIService) {}

  async detectAnomalies(logs: Log[]): Promise<AnomalyDetectionResult[]> {
    // 使用AI服务检测日志异常
    const result = await this.aiService.analyzeLogs({
      logs: logs.map(log => ({
        level: log.level,
        message: log.message,
        timestamp: log.timestamp.toISOString(),
        metadata: log.metadata
      })),
      model: 'gpt-4'
    });

    return result.anomalies;
  }
}
```

## 7. API设计

### 7.1 日志记录API

| 端点 | 方法 | 认证 | 描述 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| `/api/logs` | POST | 是 | 创建日志记录 | `{ level: string, message: string, metadata?: object }` | `201 Created` |
| `/api/logs/search` | GET | 是 | 查询日志 | 查询参数：`startTime`, `endTime`, `level`, `source`, `service`, `correlationId`, `traceId`, `userId`, `searchTerm`, `page`, `limit` | `200 OK` with paginated logs |
| `/api/logs/aggregate` | GET | 是 | 聚合日志 | 查询参数：`startTime`, `endTime`, `level`, `source`, `service`, `groupBy` | `200 OK` with aggregated results |
| `/api/logs/statistics` | GET | 是 | 获取日志统计 | 查询参数：`startTime`, `endTime`, `level`, `source`, `service` | `200 OK` with statistics |
| `/api/logs/export` | GET | 是 | 导出日志 | 查询参数：`startTime`, `endTime`, `level`, `source`, `service`, `format` | `200 OK` with file download |

### 7.2 日志管理API

| 端点 | 方法 | 认证 | 描述 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| `/api/admin/logs/policies` | GET | 管理员 | 获取日志保留策略 | N/A | `200 OK` with policies |
| `/api/admin/logs/policies` | POST | 管理员 | 创建日志保留策略 | `{ name: string, retentionDays: number, filters: object }` | `201 Created` |
| `/api/admin/logs/policies/:id` | PUT | 管理员 | 更新日志保留策略 | `{ name?: string, retentionDays?: number, filters?: object }` | `200 OK` |
| `/api/admin/logs/policies/:id` | DELETE | 管理员 | 删除日志保留策略 | N/A | `204 No Content` |
| `/api/admin/logs/archive` | POST | 管理员 | 归档日志 | `{ filters: object }` | `200 OK` |
| `/api/admin/logs/delete` | POST | 管理员 | 删除日志 | `{ filters: object }` | `200 OK` |

## 8. 数据库设计

### 8.1 日志存储方案

| 存储类型 | 用途 | 配置 |
|----------|------|------|
| Loki | 主要日志存储 | 单节点/集群部署，配置适当的存储后端（如S3、MinIO） |
| 本地文件 | 应急日志存储 | 按日期和服务分割的日志文件，定期归档 |
| 归档存储 | 历史日志归档 | 低成本对象存储，如S3 Glacier |

### 8.2 日志索引设计

- **时间索引**：按时间戳建立索引，支持快速时间范围查询
- **级别索引**：按日志级别建立索引，支持快速过滤
- **服务索引**：按服务名称建立索引，支持按服务查询
- **关联ID索引**：按correlationId建立索引，支持分布式追踪
- **用户ID索引**：按userId建立索引，支持按用户查询

## 9. 部署与集成

### 9.1 Docker配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 应用服务
  app:
    # ...
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    depends_on:
      - loki
      - promtail

  # Loki服务
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml

  # Promtail服务
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yaml:/etc/promtail/config.yaml
    command: -config.file=/etc/promtail/config.yaml
    depends_on:
      - loki

  # Grafana服务（用于日志可视化）
  grafana:
    # ...
    depends_on:
      - loki

volumes:
  loki-data:
```

### 9.2 Promtail配置

```yaml
# promtail-config.yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
    - targets:
        - localhost
      labels:
        job: varlogs
        __path__: /var/log/*log

  - job_name: docker
    docker_sd_configs:
    - host: unix:///var/run/docker.sock
      refresh_interval: 5s
    relabel_configs:
    - source_labels: [__meta_docker_container_name]
      regex: /(.*)
      target_label: container
    - source_labels: [__meta_docker_container_log_stream]
      target_label: stream
    - source_labels: [__meta_docker_container_label_com_docker_compose_service]
      target_label: service
```

## 10. 性能优化

### 10.1 日志记录优化

1. **异步日志记录**：使用异步IO和消息队列提高日志记录性能
2. **批处理**：将多条日志合并为批次发送，减少网络开销
3. **采样机制**：对高频低价值日志进行采样，降低存储成本
4. **压缩**：对日志数据进行压缩，减少存储和传输成本
5. **分级存储**：根据日志级别和时间采用不同的存储策略

### 10.2 日志查询优化

1. **索引优化**：合理设计索引，提高查询性能
2. **缓存**：对频繁查询的日志结果进行缓存
3. **查询分页**：限制每次查询返回的日志数量
4. **并行查询**：对复杂查询进行并行处理
5. **预聚合**：对常用聚合查询结果进行预计算

## 11. 监控与告警

### 11.1 日志系统监控

| 指标 | 描述 | 告警阈值 |
|------|------|----------|
| 日志写入速率 | 每秒写入的日志条数 | > 1000条/秒 |
| 日志查询延迟 | 日志查询响应时间 | > 500ms |
| 日志存储使用率 | 日志存储占用率 | > 80% |
| 日志错误率 | 日志记录失败率 | > 1% |
| 日志丢失率 | 日志丢失数量 | > 0 |

### 11.2 告警规则

```yaml
# prometheus-alert-rules.yml
groups:
- name: log-system-alerts
  rules:
  - alert: HighLogWriteRate
    expr: sum(rate(loki_distributor_lines_processed_total[5m])) by (service) > 1000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High log write rate for {{ $labels.service }}"
      description: "{{ $labels.service }} is writing logs at {{ $value }} lines per second"

  - alert: HighLogQueryLatency
    expr: histogram_quantile(0.95, sum(rate(loki_query_frontend_request_duration_seconds_bucket[5m])) by (le, service)) > 0.5
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High log query latency for {{ $labels.service }}"
      description: "95th percentile query latency is {{ $value }} seconds"

  - alert: LogSystemError
    expr: sum(rate(loki_process_errors_total[5m])) by (service) > 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Log system errors for {{ $labels.service }}"
      description: "{{ $labels.service }} has {{ $value }} log processing errors per second"
```

## 12. 测试策略

### 12.1 单元测试

```typescript
// src/application/services/impl/LogServiceImpl.test.ts
import { LogServiceImpl } from './LogServiceImpl';
import { LogRepository } from '../../../domain/repositories/LogRepository';
import { CorrelationIdGenerator } from '../../../infrastructure/utils/CorrelationIdGenerator';
import { LogLevel } from '../../../domain/enums/LogLevel';

describe('LogServiceImpl', () => {
  let logService: LogServiceImpl;
  let mockLogRepository: jest.Mocked<LogRepository>;
  let mockCorrelationIdGenerator: jest.Mocked<CorrelationIdGenerator>;

  beforeEach(() => {
    mockLogRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      // 其他方法
    } as any;

    mockCorrelationIdGenerator = {
      generate: jest.fn().mockReturnValue('test-correlation-id'),
      getCurrentCorrelationId: jest.fn().mockReturnValue(null),
      getCurrentTraceId: jest.fn().mockReturnValue('test-trace-id'),
    } as any;

    logService = new LogServiceImpl(mockLogRepository, mockCorrelationIdGenerator);
  });

  it('should log info message correctly', async () => {
    const message = 'Test info message';
    const metadata = { key: 'value' };

    await logService.info(message, metadata);

    expect(mockLogRepository.save).toHaveBeenCalledTimes(1);
    expect(mockLogRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      level: LogLevel.INFO,
      message,
      metadata,
      correlationId: 'test-correlation-id',
      traceId: 'test-trace-id',
    }));
  });

  // 其他测试用例
});
```

### 12.2 集成测试

```typescript
// src/infrastructure/repositories/LokiLogRepository.test.ts
import { LokiLogRepository } from './LokiLogRepository';
import { LokiClient } from './clients/LokiClient';
import { LogLevel } from '../../domain/enums/LogLevel';

describe('LokiLogRepository', () => {
  let lokiLogRepository: LokiLogRepository;
  let mockLokiClient: jest.Mocked<LokiClient>;

  beforeEach(() => {
    mockLokiClient = {
      pushLogEntries: jest.fn().mockResolvedValue(undefined),
      queryLogs: jest.fn().mockResolvedValue({ logs: [], total: 0 }),
      // 其他方法
    } as any;

    lokiLogRepository = new LokiLogRepository(mockLokiClient);
  });

  it('should save log to Loki correctly', async () => {
    const log = {
      id: 'test-id',
      timestamp: new Date(),
      level: LogLevel.INFO,
      message: 'Test message',
      metadata: { key: 'value' },
      source: 'test-source',
      correlationId: 'test-correlation-id',
      traceId: 'test-trace-id',
      service: 'test-service',
      environment: 'test-environment'
    };

    await lokiLogRepository.save(log);

    expect(mockLokiClient.pushLogEntries).toHaveBeenCalledTimes(1);
    // 验证Loki客户端调用参数
  });

  // 其他测试用例
});
```

## 13. 代码质量保证

### 13.1 代码规范

- 使用TypeScript严格模式
- 遵循ESLint和Prettier规范
- 函数级注释覆盖率100%
- 核心逻辑单元测试覆盖率≥90%

### 13.2 静态代码分析

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    // 日志相关规则
    "no-console": "warn",
    // 其他规则
  }
}
```

## 14. 维护与演进

### 14.1 日志系统维护

- 定期检查日志存储使用情况
- 调整日志保留策略
- 更新日志收集和分析工具
- 优化日志查询性能
- 监控日志系统健康状况

### 14.2 系统演进

1. **阶段1**：基础日志记录和查询
2. **阶段2**：日志聚合和可视化
3. **阶段3**：AI驱动的日志异常检测
4. **阶段4**：预测性日志分析和告警
5. **阶段5**：日志智能关联和根因分析

## 15. 总结

本技术实现文档详细设计了一个基于Clean Architecture的日志管理系统，包括：

- 完整的分层架构设计
- 核心领域模型和服务接口
- 多存储后端支持（Loki和文件存储）
- 强大的日志查询和分析能力
- AI驱动的日志异常检测
- 详细的API设计和部署配置
- 全面的性能优化和监控方案
- 完善的测试策略

该设计遵循了项目的架构原则和技术约束，同时提供了良好的可扩展性和可维护性，能够满足认知辅助系统的日志管理需求。