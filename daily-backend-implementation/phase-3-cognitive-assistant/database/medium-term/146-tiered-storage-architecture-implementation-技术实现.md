# 146-分层存储架构实现代码

## 1. 概述

本文档详细描述了AI认知辅助系统分层存储架构的实现代码，包括分析数据库部署和数据同步机制的具体实现。分层存储架构将业务数据库和分析数据库分离，提高系统的性能、可扩展性和可维护性。

## 2. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| PostgreSQL | 14.x | 业务数据库 |
| ClickHouse | 24.x | 分析数据库 |
| Debezium | 2.5.x | 数据变更捕获 |
| Kafka | 3.6.x | 数据传输中间件 |
| Vector | 0.1.0 | 向量存储 |
| Node.js | 18.x | 应用服务器 |
| TypeScript | 5.x | 开发语言 |
| Docker | 24.x | 容器化部署 |

## 3. 分层存储架构设计

### 3.1 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                       应用层                                     │
├───────────────┬───────────────┬─────────────────────────────────┤
│ 业务服务层    │ 分析服务层    │ 向量服务层                       │
├───────────────┼───────────────┼─────────────────────────────────┤
│ PostgreSQL    │ ClickHouse    │ Qdrant                          │
│ (业务数据库)  │ (分析数据库)  │ (向量数据库)                     │
└───────────────┴───────────────┴─────────────────────────────────┘
         ▲               ▲                    ▲
         │               │                    │
         └───────────────┼────────────────────┘
                         │
                ┌─────────────────┐
                │   数据同步层    │
                ├─────────────────┤
                │ Debezium + Kafka│
                └─────────────────┘
```

### 3.2 核心组件

1. **业务数据库（PostgreSQL）**：存储核心业务数据，包括用户认知模型、概念、关系等。
2. **分析数据库（ClickHouse）**：存储历史数据和分析数据，支持复杂查询和报表生成。
3. **向量数据库（Qdrant）**：存储向量数据，支持相似度搜索和向量匹配。
4. **数据同步层（Debezium + Kafka）**：捕获业务数据库的变更，实时同步到分析数据库和向量数据库。

## 4. 分析数据库部署

### 4.1 Docker Compose 配置

```yaml
version: '3.8'

services:
  # ClickHouse 服务
  clickhouse:
    image: clickhouse/clickhouse-server:24.3
    container_name: clickhouse
    ports:
      - "8123:8123"  # HTTP 接口
      - "9000:9000"  # TCP 接口
      - "9009:9009"  # 用于 ClickHouse 节点间通信
    volumes:
      - ./clickhouse/data:/var/lib/clickhouse
      - ./clickhouse/config:/etc/clickhouse-server
      - ./clickhouse/logs:/var/log/clickhouse-server
    environment:
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_PASSWORD=password
      - CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8123/ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Kafka 服务
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092
      - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
    depends_on:
      - zookeeper

  # Zookeeper 服务
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: zookeeper
    ports:
      - "2181:2181"
    environment:
      - ZOOKEEPER_CLIENT_PORT=2181

  # Debezium 服务
  debezium:
    image: debezium/connect:2.5.0.Final
    container_name: debezium
    ports:
      - "8083:8083"
    environment:
      - BOOTSTRAP_SERVERS=kafka:9092
      - GROUP_ID=debezium-group
      - CONFIG_STORAGE_TOPIC=debezium-configs
      - OFFSET_STORAGE_TOPIC=debezium-offsets
      - STATUS_STORAGE_TOPIC=debezium-status
    depends_on:
      - kafka
      - postgres

  # PostgreSQL 服务（业务数据库）
  postgres:
    image: postgres:14
    container_name: postgres
    ports:
      - "5432:5432"
    volumes:
      - ./postgres/data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cognitive_assistant
    command: ["postgres", "-c", "wal_level=logical"]
```

### 4.2 ClickHouse 表结构设计

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS cognitive_analytics;

-- 切换到分析数据库
USE cognitive_analytics;

-- 用户认知模型表
CREATE TABLE IF NOT EXISTS user_cognitive_models (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    model_name String,
    model_description String,
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    model_data JSON,
    PRIMARY KEY (user_id, created_at)
) ENGINE = MergeTree()
ORDER BY (user_id, created_at);

-- 认知概念表
CREATE TABLE IF NOT EXISTS cognitive_concepts (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    concept_name String,
    concept_description String,
    concept_type String,
    importance Float32,
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    PRIMARY KEY (user_id, concept_name)
) ENGINE = MergeTree()
ORDER BY (user_id, concept_name);

-- 认知关系表
CREATE TABLE IF NOT EXISTS cognitive_relations (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    source_concept_id UUID,
    target_concept_id UUID,
    relation_type String,
    strength Float32,
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    PRIMARY KEY (user_id, source_concept_id, target_concept_id)
) ENGINE = MergeTree()
ORDER BY (user_id, source_concept_id, target_concept_id);

-- 思维片段表
CREATE TABLE IF NOT EXISTS thought_fragments (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    content String,
    concept_ids Array(UUID),
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    PRIMARY KEY (user_id, created_at)
) ENGINE = MergeTree()
ORDER BY (user_id, created_at);

-- 认知洞察表
CREATE TABLE IF NOT EXISTS cognitive_insights (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    insight_type String,
    insight_content String,
    related_concepts Array(UUID),
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    PRIMARY KEY (user_id, created_at)
) ENGINE = MergeTree()
ORDER BY (user_id, created_at);
```

## 5. 数据同步机制实现

### 5.1 Debezium 配置

```json
{
  "name": "cognitive-assistant-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "postgres",
    "database.password": "password",
    "database.dbname": "cognitive_assistant",
    "database.server.name": "cognitive_assistant",
    "table.include.list": "public.user_cognitive_models,public.cognitive_concepts,public.cognitive_relations,public.thought_fragments,public.cognitive_insights",
    "plugin.name": "pgoutput",
    "slot.name": "debezium_slot",
    "publication.name": "debezium_publication",
    "key.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "key.converter.schemas.enable": "false",
    "value.converter.schemas.enable": "false",
    "transforms": "unwrap",
    "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
    "transforms.unwrap.drop.tombstones": "false"
  }
}
```

### 5.2 Kafka 消费者实现

```typescript
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { ClickHouseClient } from '@clickhouse/client';
import { Logger } from '../../../src/infrastructure/logging/Logger';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class DataSyncService {
  private kafka: Kafka;
  private consumer: Consumer;
  private clickhouseClient: ClickHouseClient;
  private logger: Logger;
  private isRunning: boolean = false;

  constructor(logger: Logger) {
    this.logger = logger;
    
    // 初始化 Kafka 客户端
    this.kafka = new Kafka({
      clientId: 'cognitive-assistant-sync',
      brokers: ['localhost:9092']
    });

    // 初始化 Kafka 消费者
    this.consumer = this.kafka.consumer({
      groupId: 'cognitive-assistant-sync-group'
    });

    // 初始化 ClickHouse 客户端
    this.clickhouseClient = new ClickHouseClient({
      url: 'http://localhost:8123',
      username: 'default',
      password: 'password',
      database: 'cognitive_analytics'
    });
  }

  /**
   * 启动数据同步服务
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Data sync service already running');
      return;
    }

    this.logger.info('Starting data sync service');

    // 连接 Kafka 消费者
    await this.consumer.connect();

    // 订阅主题
    await this.consumer.subscribe({
      topics: [
        'cognitive_assistant.public.user_cognitive_models',
        'cognitive_assistant.public.cognitive_concepts',
        'cognitive_assistant.public.cognitive_relations',
        'cognitive_assistant.public.thought_fragments',
        'cognitive_assistant.public.cognitive_insights'
      ],
      fromBeginning: true
    });

    // 开始消费消息
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.processMessage(payload);
      }
    });

    this.isRunning = true;
    this.logger.info('Data sync service started successfully');
  }

  /**
   * 停止数据同步服务
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Data sync service not running');
      return;
    }

    this.logger.info('Stopping data sync service');

    // 停止消费消息
    await this.consumer.stop();

    // 断开连接
    await this.consumer.disconnect();

    this.isRunning = false;
    this.logger.info('Data sync service stopped successfully');
  }

  /**
   * 处理 Kafka 消息
   */
  private async processMessage(payload: EachMessagePayload): Promise<void> {
    try {
      const topic = payload.topic;
      const message = payload.message;
      const value = message.value ? JSON.parse(message.value.toString()) : null;

      if (!value) {
        this.logger.warn('Received empty message');
        return;
      }

      this.logger.debug(`Processing message from topic: ${topic}`, { value });

      // 根据主题处理不同的数据
      switch (topic) {
        case 'cognitive_assistant.public.user_cognitive_models':
          await this.syncUserCognitiveModel(value);
          break;
        case 'cognitive_assistant.public.cognitive_concepts':
          await this.syncCognitiveConcept(value);
          break;
        case 'cognitive_assistant.public.cognitive_relations':
          await this.syncCognitiveRelation(value);
          break;
        case 'cognitive_assistant.public.thought_fragments':
          await this.syncThoughtFragment(value);
          break;
        case 'cognitive_assistant.public.cognitive_insights':
          await this.syncCognitiveInsight(value);
          break;
        default:
          this.logger.warn(`Unknown topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Error processing message: ${error instanceof Error ? error.message : String(error)}`, {
        error,
        topic: payload.topic,
        offset: payload.message.offset
      });
    }
  }

  /**
   * 同步用户认知模型
   */
  private async syncUserCognitiveModel(data: any): Promise<void> {
    const query = `
      INSERT INTO user_cognitive_models (id, user_id, model_name, model_description, created_at, updated_at, model_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        model_name = EXCLUDED.model_name,
        model_description = EXCLUDED.model_description,
        updated_at = EXCLUDED.updated_at,
        model_data = EXCLUDED.model_data
    `;

    await this.clickhouseClient.execute({
      query,
      values: [
        data.id,
        data.user_id,
        data.model_name,
        data.model_description,
        data.created_at,
        data.updated_at,
        JSON.stringify(data.model_data)
      ]
    });

    this.logger.debug(`Synced user cognitive model: ${data.id}`);
  }

  /**
   * 同步认知概念
   */
  private async syncCognitiveConcept(data: any): Promise<void> {
    const query = `
      INSERT INTO cognitive_concepts (id, user_id, concept_name, concept_description, concept_type, importance, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        concept_name = EXCLUDED.concept_name,
        concept_description = EXCLUDED.concept_description,
        concept_type = EXCLUDED.concept_type,
        importance = EXCLUDED.importance,
        updated_at = EXCLUDED.updated_at
    `;

    await this.clickhouseClient.execute({
      query,
      values: [
        data.id,
        data.user_id,
        data.concept_name,
        data.concept_description,
        data.concept_type,
        data.importance,
        data.created_at,
        data.updated_at
      ]
    });

    this.logger.debug(`Synced cognitive concept: ${data.id}`);
  }

  /**
   * 同步认知关系
   */
  private async syncCognitiveRelation(data: any): Promise<void> {
    const query = `
      INSERT INTO cognitive_relations (id, user_id, source_concept_id, target_concept_id, relation_type, strength, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        source_concept_id = EXCLUDED.source_concept_id,
        target_concept_id = EXCLUDED.target_concept_id,
        relation_type = EXCLUDED.relation_type,
        strength = EXCLUDED.strength,
        updated_at = EXCLUDED.updated_at
    `;

    await this.clickhouseClient.execute({
      query,
      values: [
        data.id,
        data.user_id,
        data.source_concept_id,
        data.target_concept_id,
        data.relation_type,
        data.strength,
        data.created_at,
        data.updated_at
      ]
    });

    this.logger.debug(`Synced cognitive relation: ${data.id}`);
  }

  /**
   * 同步思维片段
   */
  private async syncThoughtFragment(data: any): Promise<void> {
    const query = `
      INSERT INTO thought_fragments (id, user_id, content, concept_ids, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        content = EXCLUDED.content,
        concept_ids = EXCLUDED.concept_ids,
        updated_at = EXCLUDED.updated_at
    `;

    await this.clickhouseClient.execute({
      query,
      values: [
        data.id,
        data.user_id,
        data.content,
        JSON.stringify(data.concept_ids),
        data.created_at,
        data.updated_at
      ]
    });

    this.logger.debug(`Synced thought fragment: ${data.id}`);
  }

  /**
   * 同步认知洞察
   */
  private async syncCognitiveInsight(data: any): Promise<void> {
    const query = `
      INSERT INTO cognitive_insights (id, user_id, insight_type, insight_content, related_concepts, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        insight_type = EXCLUDED.insight_type,
        insight_content = EXCLUDED.insight_content,
        related_concepts = EXCLUDED.related_concepts,
        updated_at = EXCLUDED.updated_at
    `;

    await this.clickhouseClient.execute({
      query,
      values: [
        data.id,
        data.user_id,
        data.insight_type,
        data.insight_content,
        JSON.stringify(data.related_concepts),
        data.created_at,
        data.updated_at
      ]
    });

    this.logger.debug(`Synced cognitive insight: ${data.id}`);
  }
}
```

### 5.3 同步服务配置

```typescript
import { DataSyncService } from './DataSyncService';
import { container } from 'tsyringe';
import { Logger } from '../../../src/infrastructure/logging/Logger';

/**
 * 启动数据同步服务
 */
export async function startDataSyncService(): Promise<void> {
  const logger = container.resolve(Logger);
  const dataSyncService = container.resolve(DataSyncService);

  try {
    await dataSyncService.start();
    logger.info('Data sync service started successfully');
  } catch (error) {
    logger.error(`Failed to start data sync service: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * 停止数据同步服务
 */
export async function stopDataSyncService(): Promise<void> {
  const logger = container.resolve(Logger);
  const dataSyncService = container.resolve(DataSyncService);

  try {
    await dataSyncService.stop();
    logger.info('Data sync service stopped successfully');
  } catch (error) {
    logger.error(`Failed to stop data sync service: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
```

## 6. 部署脚本

### 6.1 Docker Compose 启动脚本

```bash
#!/bin/bash

# 分层存储架构部署脚本

echo "Starting tiered storage architecture..."

# 检查 Docker 和 Docker Compose 是否安装
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# 创建必要的目录
echo "Creating necessary directories..."
mkdir -p clickhouse/data clickhouse/config clickhouse/logs
mkdir -p postgres/data postgres/init

# 启动 Docker Compose 服务
echo "Starting Docker Compose services..."
docker-compose up -d

# 等待服务启动
echo "Waiting for services to start..."
sleep 30

# 检查服务状态
echo "Checking service status..."
docker-compose ps

# 配置 Debezium 连接器
echo "Configuring Debezium connector..."
curl -X POST -H "Content-Type: application/json" \
  http://localhost:8083/connectors \
  -d '{"name":"cognitive-assistant-connector","config":{"connector.class":"io.debezium.connector.postgresql.PostgresConnector","database.hostname":"postgres","database.port":"5432","database.user":"postgres","database.password":"password","database.dbname":"cognitive_assistant","database.server.name":"cognitive_assistant","table.include.list":"public.user_cognitive_models,public.cognitive_concepts,public.cognitive_relations,public.thought_fragments,public.cognitive_insights","plugin.name":"pgoutput","slot.name":"debezium_slot","publication.name":"debezium_publication","key.converter":"org.apache.kafka.connect.json.JsonConverter","value.converter":"org.apache.kafka.connect.json.JsonConverter","key.converter.schemas.enable":"false","value.converter.schemas.enable":"false","transforms":"unwrap","transforms.unwrap.type":"io.debezium.transforms.ExtractNewRecordState","transforms.unwrap.drop.tombstones":"false"}}'

# 检查 Debezium 连接器状态
echo "Checking Debezium connector status..."
sleep 10
curl -X GET http://localhost:8083/connectors/cognitive-assistant-connector/status

echo "Tiered storage architecture deployment completed successfully!"
```

### 6.2 服务停止脚本

```bash
#!/bin/bash

# 分层存储架构停止脚本

echo "Stopping tiered storage architecture..."

# 停止 Docker Compose 服务
docker-compose down

# 删除临时文件
echo "Cleaning up temporary files..."
rm -rf clickhouse/logs/*

# 删除 Debezium 连接器配置（可选）
# curl -X DELETE http://localhost:8083/connectors/cognitive-assistant-connector

echo "Tiered storage architecture stopped successfully!"
```

## 7. 监控和维护

### 7.1 监控指标

| 指标名称 | 指标类型 | 描述 |
|----------|----------|------|
| sync_messages_processed | Counter | 处理的同步消息数量 |
| sync_messages_failed | Counter | 处理失败的同步消息数量 |
| sync_latency | Histogram | 消息同步延迟 |
| clickhouse_queries_executed | Counter | ClickHouse 查询执行次数 |
| clickhouse_query_errors | Counter | ClickHouse 查询错误次数 |
| kafka_consumer_lag | Gauge | Kafka 消费者滞后 |

### 7.2 日志配置

```json
{
  "level": "info",
  "transports": [
    {
      "type": "file",
      "path": "./logs/data-sync.log",
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

## 8. 测试和验证

### 8.1 功能测试

```typescript
import { DataSyncService } from './DataSyncService';
import { container } from 'tsyringe';
import { Logger } from '../../../src/infrastructure/logging/Logger';

describe('DataSyncService', () => {
  let dataSyncService: DataSyncService;
  let logger: Logger;

  beforeEach(() => {
    // 重置容器
    container.clearInstances();
    
    // 解析依赖
    logger = container.resolve(Logger);
    dataSyncService = container.resolve(DataSyncService);
  });

  describe('start', () => {
    it('should start the data sync service successfully', async () => {
      // 模拟 Kafka 连接
      jest.spyOn(dataSyncService['consumer'], 'connect').mockResolvedValue();
      jest.spyOn(dataSyncService['consumer'], 'subscribe').mockResolvedValue();
      jest.spyOn(dataSyncService['consumer'], 'run').mockResolvedValue();

      await expect(dataSyncService.start()).resolves.not.toThrow();
    });

    it('should not start if already running', async () => {
      // 设置服务为运行状态
      (dataSyncService as any).isRunning = true;

      // 模拟日志警告
      const warnSpy = jest.spyOn(logger, 'warn');

      await dataSyncService.start();

      expect(warnSpy).toHaveBeenCalledWith('Data sync service already running');
    });
  });

  describe('stop', () => {
    it('should stop the data sync service successfully', async () => {
      // 设置服务为运行状态
      (dataSyncService as any).isRunning = true;
      
      // 模拟 Kafka 断开连接
      jest.spyOn(dataSyncService['consumer'], 'stop').mockResolvedValue();
      jest.spyOn(dataSyncService['consumer'], 'disconnect').mockResolvedValue();

      await expect(dataSyncService.stop()).resolves.not.toThrow();
    });

    it('should not stop if not running', async () => {
      // 设置服务为非运行状态
      (dataSyncService as any).isRunning = false;

      // 模拟日志警告
      const warnSpy = jest.spyOn(logger, 'warn');

      await dataSyncService.stop();

      expect(warnSpy).toHaveBeenCalledWith('Data sync service not running');
    });
  });

  describe('processMessage', () => {
    it('should process user cognitive model messages', async () => {
      // 模拟 ClickHouse 执行
      const executeSpy = jest.spyOn(dataSyncService['clickhouseClient'], 'execute').mockResolvedValue({});

      const payload = {
        topic: 'cognitive_assistant.public.user_cognitive_models',
        message: {
          value: Buffer.from(JSON.stringify({
            id: '123e4567-e89b-12d3-a456-426614174000',
            user_id: '123e4567-e89b-12d3-a456-426614174001',
            model_name: 'Test Model',
            model_description: 'Test Description',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
            model_data: { test: 'data' }
          }))
        }
      } as any;

      await (dataSyncService as any).processMessage(payload);

      expect(executeSpy).toHaveBeenCalled();
    });

    it('should handle empty messages gracefully', async () => {
      // 模拟日志警告
      const warnSpy = jest.spyOn(logger, 'warn');

      const payload = {
        topic: 'cognitive_assistant.public.user_cognitive_models',
        message: {
          value: null
        }
      } as any;

      await (dataSyncService as any).processMessage(payload);

      expect(warnSpy).toHaveBeenCalledWith('Received empty message');
    });
  });
});
```

### 8.2 性能测试

```bash
#!/bin/bash

# 数据同步性能测试脚本

echo "Starting data sync performance test..."

# 1. 生成测试数据
echo "Generating test data..."
node ./scripts/generate-test-data.js --count 10000

# 2. 清空 ClickHouse 表
echo "Clearing ClickHouse tables..."
curl -X POST 'http://localhost:8123/' \
  --data-urlencode 'query=TRUNCATE TABLE cognitive_analytics.user_cognitive_models'

# 3. 开始计时
echo "Starting test..."
start_time=$(date +%s)

# 4. 导入测试数据到 PostgreSQL
echo "Importing test data to PostgreSQL..."
psql -h localhost -U postgres -d cognitive_assistant -f ./data/test-data.sql

# 5. 等待数据同步完成
echo "Waiting for data sync to complete..."
sleep 60

# 6. 验证数据同步
echo "Verifying data sync..."
clickhouse_rows=$(curl -s -X POST 'http://localhost:8123/' \
  --data-urlencode 'query=SELECT COUNT(*) FROM cognitive_analytics.user_cognitive_models')

# 7. 结束计时
end_time=$(date +%s)
elapsed_time=$((end_time - start_time))

# 8. 输出测试结果
echo "Test Results:"
echo "- Total rows generated: 10000"
echo "- Rows in ClickHouse: $clickhouse_rows"
echo "- Elapsed time: $elapsed_time seconds"
echo "- Sync rate: $((10000 / elapsed_time)) rows/second"

echo "Performance test completed!"
```

## 9. 总结

本文档详细描述了AI认知辅助系统分层存储架构的实现代码，包括：

1. 分层存储架构的Docker Compose配置，包括PostgreSQL、ClickHouse、Kafka和Debezium等服务的部署
2. ClickHouse分析数据库的表结构设计
3. 基于Debezium和Kafka的数据同步机制实现
4. 数据同步服务的TypeScript实现代码
5. 部署和维护脚本
6. 测试和验证方案

通过实现分层存储架构，可以将业务数据库和分析数据库分离，提高系统的性能、可扩展性和可维护性，支持AI认知辅助系统的长期发展。