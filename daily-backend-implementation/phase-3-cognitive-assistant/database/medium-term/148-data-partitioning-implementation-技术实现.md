# 148-数据分区实现代码

## 1. 概述

本文档详细描述了AI认知辅助系统数据分区策略的实现代码，包括分区表设计、分区管理工具、数据迁移脚本以及相关测试和部署方案。数据分区是提高系统性能和可扩展性的重要手段，通过将大型表分割成更小、更易于管理的部分，可以显著提高查询性能、简化数据管理并优化存储使用。

## 2. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| ClickHouse | 24.x | 分析数据库，实现分区表 |
| PostgreSQL | 14.x | 业务数据库，实现分区表 |
| Node.js | 18.x | 应用服务器 |
| TypeScript | 5.x | 开发语言 |
| Fastify | 5.x | Web框架，提供API接口 |
| Docker | 24.x | 容器化部署 |

## 3. 数据分区策略设计

### 3.1 分区类型

1. **范围分区**：根据连续的数值范围进行分区，如时间范围、数值范围等
2. **列表分区**：根据离散值列表进行分区，如用户ID、概念类型等
3. **哈希分区**：根据哈希函数的结果进行分区，用于均匀分布数据
4. **复合分区**：结合多种分区策略，如先按时间范围分区，再按用户ID哈希分区

### 3.2 分区键选择

| 表名 | 分区键 | 分区类型 | 分区粒度 |
|------|--------|----------|----------|
| user_cognitive_models | updated_at | 范围分区 | 月 |
| cognitive_concepts | created_at | 范围分区 | 周 |
| cognitive_relations | created_at | 范围分区 | 周 |
| thought_fragments | created_at | 范围分区 | 日 |
| cognitive_insights | created_at | 范围分区 | 日 |

### 3.3 分区管理策略

1. **自动创建分区**：根据分区键自动创建未来的分区
2. **自动合并分区**：合并过小的分区，提高查询性能
3. **自动删除分区**：删除过期的分区数据，优化存储使用
4. **分区监控**：监控分区状态，及时调整分区策略

## 4. ClickHouse 分区实现

### 4.1 分区表创建

```sql
-- 用户认知模型分区表
CREATE TABLE IF NOT EXISTS user_cognitive_models_partitioned (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    model_name String,
    model_description String,
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    model_data JSON,
    PRIMARY KEY (user_id, updated_at)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(updated_at)
ORDER BY (user_id, updated_at)
TTL updated_at + INTERVAL 1 YEAR;

-- 认知概念分区表
CREATE TABLE IF NOT EXISTS cognitive_concepts_partitioned (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    concept_name String,
    concept_description String,
    concept_type String,
    importance Float32,
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    PRIMARY KEY (user_id, concept_name, created_at)
) ENGINE = MergeTree()
PARTITION BY toYearWeek(created_at)
ORDER BY (user_id, concept_name, created_at)
TTL created_at + INTERVAL 6 MONTH;

-- 认知关系分区表
CREATE TABLE IF NOT EXISTS cognitive_relations_partitioned (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    source_concept_id UUID,
    target_concept_id UUID,
    relation_type String,
    strength Float32,
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    PRIMARY KEY (user_id, source_concept_id, target_concept_id, created_at)
) ENGINE = MergeTree()
PARTITION BY toYearWeek(created_at)
ORDER BY (user_id, source_concept_id, target_concept_id, created_at)
TTL created_at + INTERVAL 6 MONTH;

-- 思维片段分区表
CREATE TABLE IF NOT EXISTS thought_fragments_partitioned (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    content String,
    concept_ids Array(UUID),
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    PRIMARY KEY (user_id, created_at)
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(created_at)
ORDER BY (user_id, created_at)
TTL created_at + INTERVAL 3 MONTH;

-- 认知洞察分区表
CREATE TABLE IF NOT EXISTS cognitive_insights_partitioned (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    insight_type String,
    insight_content String,
    related_concepts Array(UUID),
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    PRIMARY KEY (user_id, created_at)
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(created_at)
ORDER BY (user_id, created_at)
TTL created_at + INTERVAL 3 MONTH;
```

### 4.2 分区管理函数

```sql
-- 获取分区列表
CREATE OR REPLACE FUNCTION get_partitions(table_name String) 
RETURNS TABLE (partition String, rows UInt64, data_compressed UInt64, data_uncompressed UInt64)
LANGUAGE SQL
AS $$
SELECT 
    partition,
    sum(rows) AS rows,
    sum(data_compressed_bytes) AS data_compressed,
    sum(data_uncompressed_bytes) AS data_uncompressed
FROM system.parts
WHERE table = table_name AND active = 1
GROUP BY partition
ORDER BY partition;
$$;

-- 合并分区
CREATE OR REPLACE PROCEDURE merge_partitions(table_name String, partition1 String, partition2 String)
LANGUAGE SQL
AS $$
ALTER TABLE {table_name} MERGE PARTITIONS '{partition1}' AND '{partition2}';
$$;

-- 删除分区
CREATE OR REPLACE PROCEDURE drop_partition(table_name String, partition String)
LANGUAGE SQL
AS $$
ALTER TABLE {table_name} DROP PARTITION '{partition}';
$$;

-- 创建未来分区
CREATE OR REPLACE PROCEDURE create_future_partitions(table_name String, months Int32)
LANGUAGE SQL
AS $$
DECLARE 
    current_date DateTime = now();
    future_date DateTime;
BEGIN
    FOR i IN 1..months DO
        future_date = addMonths(current_date, i);
        -- 插入一条临时数据来创建分区
        INSERT INTO {table_name} 
        SELECT 
            generateUUIDv4(),
            generateUUIDv4(),
            'temp',
            'temp',
            future_date,
            future_date,
            JSONParse('{}')
        WHERE 1=0;
    END FOR;
END
$$;
```

### 4.3 分区数据迁移

```sql
-- 创建分区表
CREATE TABLE IF NOT EXISTS user_cognitive_models_partitioned AS user_cognitive_models ENGINE = MergeTree()
PARTITION BY toYYYYMM(updated_at)
ORDER BY (user_id, updated_at)
TTL updated_at + INTERVAL 1 YEAR;

-- 迁移数据到分区表
INSERT INTO user_cognitive_models_partitioned
SELECT * FROM user_cognitive_models;

-- 重命名表
RENAME TABLE user_cognitive_models TO user_cognitive_models_old;
RENAME TABLE user_cognitive_models_partitioned TO user_cognitive_models;

-- 创建视图兼容旧表名
CREATE VIEW user_cognitive_models_old AS SELECT * FROM user_cognitive_models;
```

## 5. PostgreSQL 分区实现

### 5.1 分区表创建

```sql
-- 用户认知模型主表
CREATE TABLE IF NOT EXISTS user_cognitive_models (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    model_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    model_data JSONB,
    PRIMARY KEY (id, updated_at)
) PARTITION BY RANGE (updated_at);

-- 创建分区
CREATE TABLE IF NOT EXISTS user_cognitive_models_202401 PARTITION OF user_cognitive_models
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE IF NOT EXISTS user_cognitive_models_202402 PARTITION OF user_cognitive_models
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE IF NOT EXISTS user_cognitive_models_202403 PARTITION OF user_cognitive_models
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- 为分区创建索引
CREATE INDEX IF NOT EXISTS idx_user_cognitive_models_202401_user_id ON user_cognitive_models_202401 (user_id);
CREATE INDEX IF NOT EXISTS idx_user_cognitive_models_202402_user_id ON user_cognitive_models_202402 (user_id);
CREATE INDEX IF NOT EXISTS idx_user_cognitive_models_202403_user_id ON user_cognitive_models_202403 (user_id);

-- 认知概念主表
CREATE TABLE IF NOT EXISTS cognitive_concepts (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    concept_name VARCHAR(255) NOT NULL,
    concept_description TEXT,
    concept_type VARCHAR(50),
    importance FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建分区
CREATE TABLE IF NOT EXISTS cognitive_concepts_2024w01 PARTITION OF cognitive_concepts
    FOR VALUES FROM ('2024-01-01') TO ('2024-01-08');

CREATE TABLE IF NOT EXISTS cognitive_concepts_2024w02 PARTITION OF cognitive_concepts
    FOR VALUES FROM ('2024-01-08') TO ('2024-01-15');

-- 为分区创建索引
CREATE INDEX IF NOT EXISTS idx_cognitive_concepts_2024w01_user_id ON cognitive_concepts_2024w01 (user_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_concepts_2024w01_concept_type ON cognitive_concepts_2024w01 (concept_type);
```

### 5.2 分区管理函数

```sql
-- 创建月分区
CREATE OR REPLACE FUNCTION create_monthly_partition(
    table_name TEXT,
    partition_name TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
BEGIN
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date
    );
    
    -- 为分区创建索引
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%I_user_id ON %I (user_id)',
        partition_name, partition_name
    );
END;
$$ LANGUAGE plpgsql;

-- 创建未来分区
CREATE OR REPLACE FUNCTION create_future_partitions(
    table_name TEXT,
    months INT
) RETURNS VOID AS $$
DECLARE
    current_date TIMESTAMP WITH TIME ZONE := date_trunc('month', CURRENT_TIMESTAMP);
    partition_start TIMESTAMP WITH TIME ZONE;
    partition_end TIMESTAMP WITH TIME ZONE;
    partition_name TEXT;
BEGIN
    FOR i IN 0..months LOOP
        partition_start := current_date + INTERVAL '1 month' * i;
        partition_end := partition_start + INTERVAL '1 month';
        partition_name := table_name || '_' || to_char(partition_start, 'YYYYMM');
        
        PERFORM create_monthly_partition(
            table_name,
            partition_name,
            partition_start,
            partition_end
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 删除旧分区
CREATE OR REPLACE FUNCTION drop_old_partitions(
    table_name TEXT,
    retention_months INT
) RETURNS VOID AS $$
DECLARE
    partition RECORD;
BEGIN
    FOR partition IN
        SELECT 
            inhrelid::regclass::text AS partition_name,
            pg_get_expr(pgpartitionbound.pbound_exprs, inhrelid) AS partition_bound
        FROM pg_inherits
        JOIN pg_class ON pg_inherits.inhparent = pg_class.oid
        JOIN pg_partitioned_table ON pg_class.oid = pg_partitioned_table.partrelid
        JOIN pg_partition_bound ON inhrelid = pg_partition_bound.boundrelid
        WHERE pg_class.relname = table_name
    LOOP
        -- 解析分区边界，获取分区开始时间
        -- 这里需要根据实际的分区边界格式进行解析
        -- 简化处理，假设分区名格式为 table_name_YYYYMM
        IF partition.partition_name ~ '\\d{6}$' THEN
            DECLARE
                partition_date TEXT := substring(partition.partition_name FROM '.+_(\\d{6})$');
                partition_year INT := substring(partition_date FROM 1 FOR 4)::INT;
                partition_month INT := substring(partition_date FROM 5 FOR 2)::INT;
                partition_timestamp TIMESTAMP WITH TIME ZONE := make_timestamp(partition_year, partition_month, 1, 0, 0, 0);
            BEGIN
                IF partition_timestamp < date_trunc('month', CURRENT_TIMESTAMP) - INTERVAL '1 month' * retention_months THEN
                    EXECUTE format('DROP TABLE %I', partition.partition_name);
                END IF;
            END;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 5.3 分区自动化任务

```sql
-- 创建分区维护函数
CREATE OR REPLACE FUNCTION partition_maintenance() RETURNS VOID AS $$
BEGIN
    -- 为所有分区表创建未来3个月的分区
    PERFORM create_future_partitions('user_cognitive_models', 3);
    PERFORM create_future_partitions('cognitive_concepts', 3);
    PERFORM create_future_partitions('cognitive_relations', 3);
    PERFORM create_future_partitions('thought_fragments', 3);
    PERFORM create_future_partitions('cognitive_insights', 3);
    
    -- 删除超过12个月的旧分区
    PERFORM drop_old_partitions('user_cognitive_models', 12);
    PERFORM drop_old_partitions('cognitive_concepts', 12);
    PERFORM drop_old_partitions('cognitive_relations', 12);
    PERFORM drop_old_partitions('thought_fragments', 12);
    PERFORM drop_old_partitions('cognitive_insights', 12);
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务，每月1号执行分区维护
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 设置时区
SET TIME ZONE 'Asia/Shanghai';

-- 创建定时任务
SELECT cron.schedule(
    'monthly-partition-maintenance',
    '0 0 1 * *', -- 每月1号0点0分执行
    'SELECT partition_maintenance();'
);
```

## 6. 分区管理服务实现

### 6.1 分区管理服务

```typescript
import { injectable, singleton } from 'tsyringe';
import { ClickHouseClient } from '@clickhouse/client';
import { Logger } from '../../src/infrastructure/logging/Logger';

@singleton()
@injectable()
export class PartitionManagementService {
  private clickhouseClient: ClickHouseClient;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.clickhouseClient = new ClickHouseClient({
      url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USERNAME || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || 'password',
      database: 'cognitive_analytics'
    });
  }

  /**
   * 获取分区列表
   */
  public async getPartitions(tableName: string): Promise<any[]> {
    this.logger.info('Getting partitions for table', { tableName });

    const query = `
      SELECT 
          partition,
          sum(rows) AS rows,
          sum(data_compressed_bytes) AS data_compressed,
          sum(data_uncompressed_bytes) AS data_uncompressed
      FROM system.parts
      WHERE table = ? AND active = 1
      GROUP BY partition
      ORDER BY partition;
    `;

    const result = await this.clickhouseClient.query({
      query,
      values: [tableName],
      format: 'JSONEachRow'
    });

    return await result.json();
  }

  /**
   * 创建未来分区
   */
  public async createFuturePartitions(tableName: string, months: number): Promise<void> {
    this.logger.info('Creating future partitions', { tableName, months });

    const query = `
      CREATE OR REPLACE PROCEDURE create_future_partitions(table_name String, months Int32)
      LANGUAGE SQL
      AS $$
      DECLARE 
          current_date DateTime = now();
          future_date DateTime;
      BEGIN
          FOR i IN 1..months DO
              future_date = addMonths(current_date, i);
              -- 插入一条临时数据来创建分区
              INSERT INTO {table_name} 
              SELECT 
                  generateUUIDv4(),
                  generateUUIDv4(),
                  'temp',
                  'temp',
                  future_date,
                  future_date,
                  JSONParse('{}')
              WHERE 1=0;
          END FOR;
      END
      $$;
      
      CALL create_future_partitions(?, ?);
    `;

    await this.clickhouseClient.execute({ query, values: [tableName, months] });
  }

  /**
   * 删除旧分区
   */
  public async dropOldPartitions(tableName: string, retentionMonths: number): Promise<void> {
    this.logger.info('Dropping old partitions', { tableName, retentionMonths });

    // 计算要删除的分区
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);
    const cutoffPartition = cutoffDate.toISOString().slice(0, 7).replace('-', '');

    const query = `
      ALTER TABLE ? DROP PARTITION ID 
      WHERE partition < ?;
    `;

    await this.clickhouseClient.execute({ query, values: [tableName, cutoffPartition] });
  }

  /**
   * 合并分区
   */
  public async mergePartitions(tableName: string, partition1: string, partition2: string): Promise<void> {
    this.logger.info('Merging partitions', { tableName, partition1, partition2 });

    const query = `
      ALTER TABLE ? MERGE PARTITIONS ? AND ?;
    `;

    await this.clickhouseClient.execute({ query, values: [tableName, partition1, partition2] });
  }
}
```

### 6.2 分区监控服务

```typescript
import { injectable, singleton } from 'tsyringe';
import { ClickHouseClient } from '@clickhouse/client';
import { Logger } from '../../src/infrastructure/logging/Logger';

@singleton()
@injectable()
export class PartitionMonitoringService {
  private clickhouseClient: ClickHouseClient;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.clickhouseClient = new ClickHouseClient({
      url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USERNAME || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || 'password',
      database: 'cognitive_analytics'
    });
  }

  /**
   * 监控分区状态
   */
  public async monitorPartitions(): Promise<any[]> {
    this.logger.info('Monitoring partitions');

    const query = `
      SELECT 
          table,
          partition,
          sum(rows) AS rows,
          sum(data_compressed_bytes) AS data_compressed,
          sum(data_uncompressed_bytes) AS data_uncompressed,
          max(modified) AS last_modified
      FROM system.parts
      WHERE active = 1
      GROUP BY table, partition
      ORDER BY table, partition;
    `;

    const result = await this.clickhouseClient.query({
      query,
      format: 'JSONEachRow'
    });

    const partitions = await result.json();

    // 检查异常分区
    const alerts = this.checkPartitionAlerts(partitions);
    
    // 如果有异常分区，记录告警
    if (alerts.length > 0) {
      this.logger.warn('Partition alerts detected', { alerts });
      // 这里可以添加告警通知逻辑，如发送邮件、短信等
    }

    return partitions;
  }

  /**
   * 检查分区异常
   */
  private checkPartitionAlerts(partitions: any[]): any[] {
    const alerts: any[] = [];
    
    // 按表分组
    const partitionsByTable = partitions.reduce((acc, partition) => {
      if (!acc[partition.table]) {
        acc[partition.table] = [];
      }
      acc[partition.table].push(partition);
      return acc;
    }, {} as Record<string, any[]>);

    // 检查每个表的分区
    for (const [tableName, tablePartitions] of Object.entries(partitionsByTable)) {
      // 检查分区数量
      if (tablePartitions.length > 100) {
        alerts.push({
          table: tableName,
          type: 'too_many_partitions',
          message: `Table ${tableName} has too many partitions (${tablePartitions.length})`,
          severity: 'warning'
        });
      }

      // 检查分区大小
      for (const partition of tablePartitions) {
        if (partition.data_compressed > 1024 * 1024 * 1024) { // 大于1GB
          alerts.push({
            table: tableName,
            partition: partition.partition,
            type: 'large_partition',
            message: `Partition ${partition.partition} in table ${tableName} is too large (${Math.round(partition.data_compressed / (1024 * 1024))} MB)`,
            severity: 'warning'
          });
        }
      }
    }

    return alerts;
  }
}
```

## 7. 分区API接口

### 7.1 Fastify路由配置

```typescript
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PartitionManagementService } from './services/PartitionManagementService';
import { PartitionMonitoringService } from './services/PartitionMonitoringService';
import { container } from 'tsyringe';
import { z } from 'zod';

// 分区管理参数验证
const partitionManagementSchema = z.object({
  tableName: z.string().min(1),
  months: z.number().int().min(1).max(12)
});

const partitionMergeSchema = z.object({
  tableName: z.string().min(1),
  partition1: z.string().min(1),
  partition2: z.string().min(1)
});

export async function partitionRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // 解析依赖
  const partitionService = container.resolve(PartitionManagementService);
  const monitoringService = container.resolve(PartitionMonitoringService);

  // 获取分区列表
  fastify.get('/api/partitions/:tableName', async (request, reply) => {
    const { tableName } = request.params as any;
    
    const partitions = await partitionService.getPartitions(tableName);
    
    return reply.send(partitions);
  });

  // 创建未来分区
  fastify.post('/api/partitions/create', async (request, reply) => {
    const body = partitionManagementSchema.parse(request.body);
    
    await partitionService.createFuturePartitions(body.tableName, body.months);
    
    return reply.code(204).send();
  });

  // 删除旧分区
  fastify.post('/api/partitions/drop-old', async (request, reply) => {
    const body = partitionManagementSchema.parse(request.body);
    
    await partitionService.dropOldPartitions(body.tableName, body.months);
    
    return reply.code(204).send();
  });

  // 合并分区
  fastify.post('/api/partitions/merge', async (request, reply) => {
    const body = partitionMergeSchema.parse(request.body);
    
    await partitionService.mergePartitions(body.tableName, body.partition1, body.partition2);
    
    return reply.code(204).send();
  });

  // 监控分区
  fastify.get('/api/partitions/monitor', async (request, reply) => {
    const partitions = await monitoringService.monitorPartitions();
    
    return reply.send(partitions);
  });
}
```

## 8. 部署和维护

### 8.1 Docker Compose 配置

```yaml
version: '3.8'

services:
  # PostgreSQL 服务
  postgres:
    image: postgres:14
    container_name: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cognitive_assistant
    command: ["postgres", "-c", "shared_preload_libraries=pg_cron"]
    restart: unless-stopped

  # ClickHouse 服务
  clickhouse:
    image: clickhouse/clickhouse-server:24.3
    container_name: clickhouse
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse-data:/var/lib/clickhouse
      - clickhouse-config:/etc/clickhouse-server
      - clickhouse-logs:/var/log/clickhouse-server
    environment:
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_PASSWORD=password
      - CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1
    restart: unless-stopped

  # 分区管理服务
  partition-service:
    image: cognitive-assistant-partition-service:latest
    container_name: partition-service
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - CLICKHOUSE_URL=http://clickhouse:8123
      - CLICKHOUSE_USERNAME=default
      - CLICKHOUSE_PASSWORD=password
      - POSTGRES_URL=postgres://postgres:password@postgres:5432/cognitive_assistant
      - JWT_SECRET=your-jwt-secret
      - LOG_LEVEL=info
    depends_on:
      - postgres
      - clickhouse
    restart: unless-stopped

volumes:
  postgres-data:
  clickhouse-data:
  clickhouse-config:
  clickhouse-logs:
```

### 8.2 部署脚本

```bash
#!/bin/bash

# 分区管理服务部署脚本

echo "Deploying partition management service..."

# 检查 Docker 和 Docker Compose 是否安装
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# 构建 Docker 镜像
echo "Building Docker image..."
docker build -t cognitive-assistant-partition-service:latest .

# 启动 Docker Compose 服务
echo "Starting Docker Compose services..."
docker-compose up -d

# 等待服务启动
echo "Waiting for services to start..."
sleep 30

# 检查服务状态
echo "Checking service status..."
docker-compose ps

# 运行数据库迁移
echo "Running database migrations..."
docker exec -it postgres psql -U postgres -d cognitive_assistant -f /docker-entrypoint-initdb.d/init-partitions.sql

# 检查 API 状态
echo "Checking API status..."
curl -s http://localhost:3002/health

if [ $? -eq 0 ]; then
    echo "Partition management service deployed successfully!"
else
    echo "Failed to deploy partition management service. Please check the logs."
    docker-compose logs partition-service
    exit 1
fi
```

### 8.3 监控和日志

```json
{
  "level": "info",
  "transports": [
    {
      "type": "file",
      "path": "./logs/partition-service.log",
      "maxSize": "10m",
      "maxFiles": 5
    },
    {
      "type": "console"
    }
  ],
  "format": "json"
}
```

## 9. 测试和验证

### 9.1 功能测试

```typescript
import { PartitionManagementService } from './services/PartitionManagementService';
import { container } from 'tsyringe';
import { Logger } from '../../src/infrastructure/logging/Logger';

describe('PartitionManagementService', () => {
  let partitionService: PartitionManagementService;
  let logger: Logger;

  beforeEach(() => {
    // 重置容器
    container.clearInstances();
    
    // 解析依赖
    logger = container.resolve(Logger);
    partitionService = container.resolve(PartitionManagementService);
  });

  describe('getPartitions', () => {
    it('should get partitions for a table', async () => {
      // 模拟 ClickHouse 查询结果
      const mockPartitions = [
        {
          partition: '202301',
          rows: 1000,
          data_compressed: 1024 * 1024 * 10, // 10MB
          data_uncompressed: 1024 * 1024 * 100 // 100MB
        }
      ];

      const querySpy = jest.spyOn(partitionService['clickhouseClient'], 'query').mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockPartitions)
      } as any);

      const result = await partitionService.getPartitions('user_cognitive_models');

      expect(result).toEqual(mockPartitions);
      expect(querySpy).toHaveBeenCalled();
    });
  });

  describe('createFuturePartitions', () => {
    it('should create future partitions', async () => {
      // 模拟 ClickHouse 执行
      const executeSpy = jest.spyOn(partitionService['clickhouseClient'], 'execute').mockResolvedValue({});

      await partitionService.createFuturePartitions('user_cognitive_models', 3);

      expect(executeSpy).toHaveBeenCalled();
    });
  });

  describe('dropOldPartitions', () => {
    it('should drop old partitions', async () => {
      // 模拟 ClickHouse 执行
      const executeSpy = jest.spyOn(partitionService['clickhouseClient'], 'execute').mockResolvedValue({});

      await partitionService.dropOldPartitions('user_cognitive_models', 12);

      expect(executeSpy).toHaveBeenCalled();
    });
  });
});
```

### 9.2 性能测试

```bash
#!/bin/bash

# 分区性能测试脚本

echo "Starting partition performance test..."

# 1. 生成测试数据
echo "Generating test data..."
node ./scripts/generate-test-data.js --count 1000000

# 2. 创建非分区表和分区表
echo "Creating test tables..."
curl -X POST 'http://localhost:8123/' \
  --data-urlencode 'query=CREATE TABLE IF NOT EXISTS test_table_non_partitioned (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    value Float32,
    created_at DateTime64(3) DEFAULT now()
  ) ENGINE = MergeTree()
  ORDER BY (user_id, created_at);'

curl -X POST 'http://localhost:8123/' \
  --data-urlencode 'query=CREATE TABLE IF NOT EXISTS test_table_partitioned (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    value Float32,
    created_at DateTime64(3) DEFAULT now()
  ) ENGINE = MergeTree()
  PARTITION BY toYYYYMM(created_at)
  ORDER BY (user_id, created_at);'

# 3. 导入测试数据
echo "Importing test data..."
curl -X POST 'http://localhost:8123/' \
  --data-urlencode 'query=INSERT INTO test_table_non_partitioned
  SELECT 
    generateUUIDv4(),
    generateUUIDv4(),
    rand() % 1000 / 10.0,
    now() - INTERVAL rand() % 365 DAY
  FROM numbers(1000000);'

curl -X POST 'http://localhost:8123/' \
  --data-urlencode 'query=INSERT INTO test_table_partitioned
  SELECT 
    generateUUIDv4(),
    generateUUIDv4(),
    rand() % 1000 / 10.0,
    now() - INTERVAL rand() % 365 DAY
  FROM numbers(1000000);'

# 4. 执行查询性能测试
echo "Running query performance test..."

# 非分区表查询时间
start_time=$(date +%s.%N)
curl -s -X POST 'http://localhost:8123/' \
  --data-urlencode 'query=SELECT user_id, avg(value) FROM test_table_non_partitioned WHERE created_at > now() - INTERVAL 30 DAY GROUP BY user_id;'
non_partitioned_time=$(echo "$(date +%s.%N) - $start_time" | bc)

# 分区表查询时间
start_time=$(date +%s.%N)
curl -s -X POST 'http://localhost:8123/' \
  --data-urlencode 'query=SELECT user_id, avg(value) FROM test_table_partitioned WHERE created_at > now() - INTERVAL 30 DAY GROUP BY user_id;'
partitioned_time=$(echo "$(date +%s.%N) - $start_time" | bc)

# 5. 输出测试结果
echo "Test Results:"
echo "- Total rows: 1,000,000"
echo "- Non-partitioned table query time: $non_partitioned_time seconds"
echo "- Partitioned table query time: $partitioned_time seconds"
echo "- Performance improvement: $(echo "scale=2; ($non_partitioned_time - $partitioned_time) / $non_partitioned_time * 100" | bc) %"

echo "Performance test completed!"
```

## 10. 总结

本文档详细描述了AI认知辅助系统数据分区策略的实现代码，包括：

1. 数据分区策略设计，包括分区类型、分区键选择和分区管理策略
2. ClickHouse分区实现，包括分区表创建、分区管理函数和数据迁移
3. PostgreSQL分区实现，包括分区表创建、分区管理函数和自动化任务
4. 分区管理服务实现，包括分区管理和监控功能
5. 分区API接口，提供分区管理的RESTful接口
6. 部署和维护脚本，包括Docker配置和部署流程
7. 测试和验证方案，包括功能测试和性能测试

通过实现数据分区策略，可以显著提高系统的查询性能、简化数据管理并优化存储使用，支持AI认知辅助系统的长期发展和扩展。