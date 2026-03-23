# 151-数据归档机制实现代码

## 1. 概述

本文档详细描述了AI认知辅助系统数据归档机制的实现代码，包括归档策略设计、归档流程实现、归档管理工具以及相关测试和部署方案。数据归档是优化存储使用、提高系统性能的重要手段，通过将不常用的数据从生产环境迁移到归档存储，可以降低存储成本、提高查询性能并确保数据的长期可用性。

## 2. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| PostgreSQL | 14.x | 业务数据库 |
| ClickHouse | 24.x | 分析数据库 |
| AWS S3 | - | 归档存储 |
| MinIO | 2024.x | 本地归档存储 |
| Node.js | 18.x | 应用服务器 |
| TypeScript | 5.x | 开发语言 |
| Fastify | 5.x | Web框架，提供API接口 |
| Docker | 24.x | 容器化部署 |

## 3. 数据归档策略设计

### 3.1 归档类型

1. **热数据**：最近30天的数据，存储在生产数据库中，提供快速访问
2. **温数据**：30天到180天的数据，存储在分析数据库中，提供批量查询
3. **冷数据**：超过180天的数据，存储在归档存储中，提供长期保留

### 3.2 归档策略

| 数据类型 | 归档阈值 | 归档目标 | 归档频率 | 恢复时间目标 |
|----------|----------|----------|----------|--------------|
| 用户认知模型 | 180天 | S3/MinIO | 每月 | < 1小时 |
| 认知概念 | 180天 | S3/MinIO | 每月 | < 1小时 |
| 认知关系 | 180天 | S3/MinIO | 每月 | < 1小时 |
| 思维片段 | 90天 | S3/MinIO | 每周 | < 2小时 |
| 认知洞察 | 180天 | S3/MinIO | 每月 | < 1小时 |

### 3.3 归档流程

1. **数据识别**：识别符合归档条件的数据
2. **数据导出**：将数据从生产数据库导出
3. **数据压缩**：对导出的数据进行压缩
4. **数据加密**：对压缩后的数据进行加密
5. **数据上传**：将加密后的数据上传到归档存储
6. **数据验证**：验证归档数据的完整性
7. **数据清理**：从生产数据库中删除已归档的数据
8. **元数据更新**：更新归档元数据

## 4. 数据归档实现

### 4.1 归档元数据设计

```sql
-- 创建归档元数据表
CREATE TABLE IF NOT EXISTS archiving_metadata (
    id UUID DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    archive_id VARCHAR(255) NOT NULL,
    archive_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
    data_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    compression_ratio FLOAT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- 创建归档任务表
CREATE TABLE IF NOT EXISTS archiving_tasks (
    id UUID DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    schedule VARCHAR(100) NOT NULL, -- cron表达式
    archive_threshold_days INT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_run_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- 创建归档恢复记录表
CREATE TABLE IF NOT EXISTS archiving_restores (
    id UUID DEFAULT gen_random_uuid(),
    archive_id VARCHAR(255) NOT NULL,
    restore_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
    data_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
```

### 4.2 归档服务实现

```typescript
import { injectable, singleton } from 'tsyringe';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';
import { Logger } from '../../src/infrastructure/logging/Logger';
import { Pool } from 'pg';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

interface ArchiveConfig {
  tableName: string;
  archiveThresholdDays: number;
  partitionKey: string;
  batchSize: number;
}

interface ArchiveResult {
  archiveId: string;
  tableName: string;
  dataRangeStart: Date;
  dataRangeEnd: Date;
  fileSize: number;
  compressionRatio: number;
}

@singleton()
@injectable()
export class DataArchivingService {
  private s3Client: S3Client;
  private pgPool: Pool;
  private logger: Logger;
  private archiveConfig: Record<string, ArchiveConfig> = {
    user_cognitive_models: {
      tableName: 'user_cognitive_models',
      archiveThresholdDays: 180,
      partitionKey: 'updated_at',
      batchSize: 1000
    },
    cognitive_concepts: {
      tableName: 'cognitive_concepts',
      archiveThresholdDays: 180,
      partitionKey: 'created_at',
      batchSize: 1000
    },
    cognitive_relations: {
      tableName: 'cognitive_relations',
      archiveThresholdDays: 180,
      partitionKey: 'created_at',
      batchSize: 1000
    },
    thought_fragments: {
      tableName: 'thought_fragments',
      archiveThresholdDays: 90,
      partitionKey: 'created_at',
      batchSize: 5000
    },
    cognitive_insights: {
      tableName: 'cognitive_insights',
      archiveThresholdDays: 180,
      partitionKey: 'created_at',
      batchSize: 1000
    }
  };

  constructor(logger: Logger) {
    this.logger = logger;
    
    // 初始化 S3 客户端
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin'
      },
      forcePathStyle: true
    });

    // 初始化 PostgreSQL 连接池
    this.pgPool = new Pool({
      connectionString: process.env.POSTGRES_URL || 'postgres://postgres:password@localhost:5432/cognitive_assistant'
    });
  }

  /**
   * 执行数据归档
   */
  public async archiveData(tableName: string): Promise<ArchiveResult> {
    this.logger.info('Starting data archiving', { tableName });

    const config = this.archiveConfig[tableName];
    if (!config) {
      throw new Error(`No archive configuration found for table ${tableName}`);
    }

    // 计算归档阈值日期
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - config.archiveThresholdDays);

    // 识别符合归档条件的数据
    const dataRange = await this.identifyDataToArchive(config, thresholdDate);
    if (!dataRange) {
      this.logger.info('No data to archive', { tableName });
      throw new Error(`No data to archive for table ${tableName}`);
    }

    // 导出数据
    const exportResult = await this.exportData(config, dataRange);

    // 压缩数据
    const compressedData = await gzipAsync(exportResult.data);

    // 生成归档ID
    const archiveId = `${tableName}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    // 上传数据到 S3
    const uploadResult = await this.uploadToS3(archiveId, compressedData);

    // 验证归档数据
    await this.verifyArchive(archiveId, compressedData.length);

    // 删除已归档的数据
    await this.deleteArchivedData(config, dataRange);

    // 更新归档元数据
    const archiveResult: ArchiveResult = {
      archiveId,
      tableName,
      dataRangeStart: dataRange.start,
      dataRangeEnd: dataRange.end,
      fileSize: compressedData.length,
      compressionRatio: exportResult.data.length / compressedData.length
    };

    await this.updateArchiveMetadata(archiveResult);

    this.logger.info('Data archiving completed', { archiveResult });

    return archiveResult;
  }

  /**
   * 识别符合归档条件的数据
   */
  private async identifyDataToArchive(config: ArchiveConfig, thresholdDate: Date): Promise<{ start: Date; end: Date } | null> {
    const query = `
      SELECT 
        MIN(${config.partitionKey}) as start_date,
        MAX(${config.partitionKey}) as end_date
      FROM ${config.tableName}
      WHERE ${config.partitionKey} < $1
    `;

    const result = await this.pgPool.query(query, [thresholdDate]);

    if (result.rows.length === 0 || !result.rows[0].start_date) {
      return null;
    }

    return {
      start: result.rows[0].start_date,
      end: result.rows[0].end_date
    };
  }

  /**
   * 导出数据
   */
  private async exportData(config: ArchiveConfig, dataRange: { start: Date; end: Date }): Promise<{ data: Buffer }> {
    const query = `
      COPY (SELECT * FROM ${config.tableName} 
           WHERE ${config.partitionKey} BETWEEN $1 AND $2)
      TO STDOUT WITH (FORMAT JSON, DELIMITER '\n')
    `;

    const client = await this.pgPool.connect();
    let data = Buffer.alloc(0);

    try {
      await client.query(query, [dataRange.start, dataRange.end], (err, res) => {
        if (err) {
          throw err;
        }
        // 处理查询结果
        // 注意：实际实现中需要正确处理 COPY 命令的输出流
      });

      // 简化实现，实际应该使用流处理大量数据
      const selectQuery = `
        SELECT * FROM ${config.tableName}
        WHERE ${config.partitionKey} BETWEEN $1 AND $2
      `;
      const result = await client.query(selectQuery, [dataRange.start, dataRange.end]);
      
      return {
        data: Buffer.from(JSON.stringify(result.rows))
      };
    } finally {
      client.release();
    }
  }

  /**
   * 上传数据到 S3
   */
  private async uploadToS3(archiveId: string, data: Buffer): Promise<void> {
    const bucketName = process.env.S3_BUCKET_NAME || 'cognitive-archive';
    const key = `${archiveId}.json.gz`;

    await this.s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: data,
      ContentType: 'application/json',
      ContentEncoding: 'gzip',
      Metadata: {
        archiveId,
        archivedAt: new Date().toISOString()
      }
    }));
  }

  /**
   * 验证归档数据
   */
  private async verifyArchive(archiveId: string, expectedSize: number): Promise<void> {
    const bucketName = process.env.S3_BUCKET_NAME || 'cognitive-archive';
    const key = `${archiveId}.json.gz`;

    const result = await this.s3Client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    }));

    if (!result.Body) {
      throw new Error('Archive data not found');
    }

    const data = await this.streamToBuffer(result.Body as Readable);
    if (data.length !== expectedSize) {
      throw new Error(`Archive verification failed: expected size ${expectedSize}, got ${data.length}`);
    }
  }

  /**
   * 删除已归档的数据
   */
  private async deleteArchivedData(config: ArchiveConfig, dataRange: { start: Date; end: Date }): Promise<void> {
    const query = `
      DELETE FROM ${config.tableName}
      WHERE ${config.partitionKey} BETWEEN $1 AND $2
    `;

    await this.pgPool.query(query, [dataRange.start, dataRange.end]);
  }

  /**
   * 更新归档元数据
   */
  private async updateArchiveMetadata(result: ArchiveResult): Promise<void> {
    const query = `
      INSERT INTO archiving_metadata (
        table_name, archive_id, archive_date, 
        data_range_start, data_range_end, file_path, 
        file_size, compression_ratio, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const file_path = `${result.tableName}/${result.archiveId}.json.gz`;

    await this.pgPool.query(query, [
      result.tableName,
      result.archiveId,
      new Date(),
      result.dataRangeStart,
      result.dataRangeEnd,
      file_path,
      result.fileSize,
      result.compressionRatio,
      'completed'
    ]);
  }

  /**
   * 恢复归档数据
   */
  public async restoreArchive(archiveId: string): Promise<void> {
    this.logger.info('Starting data restoration', { archiveId });

    // 获取归档元数据
    const metadataQuery = `
      SELECT * FROM archiving_metadata WHERE archive_id = $1
    `;
    const metadataResult = await this.pgPool.query(metadataQuery, [archiveId]);

    if (metadataResult.rows.length === 0) {
      throw new Error(`Archive metadata not found for archive ID ${archiveId}`);
    }

    const metadata = metadataResult.rows[0];

    // 从 S3 下载数据
    const bucketName = process.env.S3_BUCKET_NAME || 'cognitive-archive';
    const key = `${archiveId}.json.gz`;

    const downloadResult = await this.s3Client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    }));

    if (!downloadResult.Body) {
      throw new Error('Archive data not found');
    }

    // 解压缩数据
    const compressedData = await this.streamToBuffer(downloadResult.Body as Readable);
    const decompressedData = await gunzipAsync(compressedData);
    const data = JSON.parse(decompressedData.toString());

    // 恢复数据到数据库
    const tableName = metadata.table_name;
    
    // 分批插入数据
    const batchSize = 1000;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      if (batch.length === 0) {
        continue;
      }

      // 构建插入查询
      const columns = Object.keys(batch[0]);
      const placeholders = batch.map((_, idx) => 
        `(${columns.map((_, colIdx) => `$${idx * columns.length + colIdx + 1}`).join(', ')})`
      ).join(', ');

      const values = batch.flatMap(row => columns.map(col => row[col]));

      const insertQuery = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES ${placeholders}
        ON CONFLICT DO NOTHING
      `;

      await this.pgPool.query(insertQuery, values);
    }

    // 更新恢复记录
    await this.updateRestoreRecord(archiveId);

    this.logger.info('Data restoration completed', { archiveId });
  }

  /**
   * 更新恢复记录
   */
  private async updateRestoreRecord(archiveId: string): Promise<void> {
    const query = `
      INSERT INTO archiving_restores (
        archive_id, restore_date, status
      ) VALUES ($1, $2, $3)
    `;

    await this.pgPool.query(query, [archiveId, new Date(), 'completed']);
  }

  /**
   * 将流转换为缓冲区
   */
  private streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * 获取归档列表
   */
  public async getArchiveList(tableName?: string): Promise<any[]> {
    let query = `SELECT * FROM archiving_metadata`;
    const params: any[] = [];

    if (tableName) {
      query += ` WHERE table_name = $1`;
      params.push(tableName);
    }

    query += ` ORDER BY archive_date DESC`;

    const result = await this.pgPool.query(query, params);
    return result.rows;
  }

  /**
   * 删除归档
   */
  public async deleteArchive(archiveId: string): Promise<void> {
    // 删除 S3 中的归档文件
    const bucketName = process.env.S3_BUCKET_NAME || 'cognitive-archive';
    const key = `${archiveId}.json.gz`;

    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    }));

    // 删除归档元数据
    await this.pgPool.query(`DELETE FROM archiving_metadata WHERE archive_id = $1`, [archiveId]);

    this.logger.info('Archive deleted', { archiveId });
  }
}
```

### 4.3 归档调度服务

```typescript
import { injectable, singleton } from 'tsyringe';
import { DataArchivingService } from './DataArchivingService';
import { Logger } from '../../src/infrastructure/logging/Logger';
import * as cron from 'node-cron';

@singleton()
@injectable()
export class ArchivingScheduler {
  private dataArchivingService: DataArchivingService;
  private logger: Logger;
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private schedules: Record<string, string> = {
    user_cognitive_models: '0 0 1 * *', // 每月1号0点执行
    cognitive_concepts: '0 0 1 * *', // 每月1号0点执行
    cognitive_relations: '0 0 1 * *', // 每月1号0点执行
    thought_fragments: '0 0 * * 0', // 每周日0点执行
    cognitive_insights: '0 0 1 * *' // 每月1号0点执行
  };

  constructor(dataArchivingService: DataArchivingService, logger: Logger) {
    this.dataArchivingService = dataArchivingService;
    this.logger = logger;

    // 启动时加载所有归档任务
    this.startAllJobs();
  }

  /**
   * 启动所有归档任务
   */
  private startAllJobs(): void {
    for (const [tableName, schedule] of Object.entries(this.schedules)) {
      this.startJob(tableName, schedule);
    }

    this.logger.info(`Started ${this.jobs.size} archiving jobs`);
  }

  /**
   * 启动单个归档任务
   */
  private startJob(tableName: string, schedule: string): void {
    this.logger.info('Starting archiving job', { tableName, schedule });

    const job = cron.schedule(schedule, async () => {
      try {
        await this.dataArchivingService.archiveData(tableName);
      } catch (error) {
        this.logger.error('Archiving job failed', { tableName, error });
      }
    });

    this.jobs.set(tableName, job);
  }

  /**
   * 停止所有归档任务
   */
  public stopAllJobs(): void {
    for (const [tableName, job] of this.jobs.entries()) {
      job.stop();
      this.logger.info('Stopped archiving job', { tableName });
    }

    this.jobs.clear();
  }

  /**
   * 手动触发归档任务
   */
  public async triggerArchive(tableName: string): Promise<void> {
    this.logger.info('Manually triggering archiving job', { tableName });
    await this.dataArchivingService.archiveData(tableName);
  }
}
```

## 5. 归档管理API

### 5.1 Fastify路由配置

```typescript
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DataArchivingService } from './services/DataArchivingService';
import { ArchivingScheduler } from './services/ArchivingScheduler';
import { container } from 'tsyringe';
import { z } from 'zod';

// 归档参数验证
const archiveTriggerSchema = z.object({
  tableName: z.string().min(1)
});

const restoreSchema = z.object({
  archiveId: z.string().min(1)
});

export async function archivingRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // 解析依赖
  const archivingService = container.resolve(DataArchivingService);
  const scheduler = container.resolve(ArchivingScheduler);

  // 获取归档列表
  fastify.get('/api/archiving/archives', async (request, reply) => {
    const { tableName } = request.query as any;
    
    const archives = await archivingService.getArchiveList(tableName);
    
    return reply.send(archives);
  });

  // 手动触发归档
  fastify.post('/api/archiving/trigger', async (request, reply) => {
    const body = archiveTriggerSchema.parse(request.body);
    
    const result = await archivingService.archiveData(body.tableName);
    
    return reply.send(result);
  });

  // 恢复归档
  fastify.post('/api/archiving/restore', async (request, reply) => {
    const body = restoreSchema.parse(request.body);
    
    await archivingService.restoreArchive(body.archiveId);
    
    return reply.code(204).send();
  });

  // 删除归档
  fastify.delete('/api/archiving/archives/:archiveId', async (request, reply) => {
    const { archiveId } = request.params as any;
    
    await archivingService.deleteArchive(archiveId);
    
    return reply.code(204).send();
  });

  // 获取归档统计信息
  fastify.get('/api/archiving/stats', async (request, reply) => {
    // 这里可以添加获取归档统计信息的逻辑
    const stats = {
      totalArchives: 0,
      totalArchivedDataSize: 0,
      totalStorageSaved: 0
    };
    
    return reply.send(stats);
  });
}
```

## 6. 归档管理工具

### 6.1 命令行工具

```typescript
#!/usr/bin/env node

import { DataArchivingService } from './services/DataArchivingService';
import { container } from 'tsyringe';
import { Logger } from '../src/infrastructure/logging/Logger';

// 解析命令行参数
const args = process.argv.slice(2);
const command = args[0];

// 初始化容器
const logger = container.resolve(Logger);
const archivingService = container.resolve(DataArchivingService);

async function main() {
  switch (command) {
    case 'archive':
      // 归档命令：node archiving-cli.js archive <tableName>
      const tableName = args[1];
      if (!tableName) {
        logger.error('Missing table name');
        process.exit(1);
      }
      await archivingService.archiveData(tableName);
      break;
      
    case 'restore':
      // 恢复命令：node archiving-cli.js restore <archiveId>
      const archiveId = args[1];
      if (!archiveId) {
        logger.error('Missing archive ID');
        process.exit(1);
      }
      await archivingService.restoreArchive(archiveId);
      break;
      
    case 'list':
      // 列出归档：node archiving-cli.js list [tableName]
      const listTableName = args[1];
      const archives = await archivingService.getArchiveList(listTableName);
      logger.info('Archives:', archives);
      break;
      
    case 'delete':
      // 删除归档：node archiving-cli.js delete <archiveId>
      const deleteArchiveId = args[1];
      if (!deleteArchiveId) {
        logger.error('Missing archive ID');
        process.exit(1);
      }
      await archivingService.deleteArchive(deleteArchiveId);
      break;
      
    default:
      logger.error('Unknown command. Available commands: archive, restore, list, delete');
      process.exit(1);
  }
}

main().catch(error => {
  logger.error('Command failed:', error);
  process.exit(1);
});
```

## 7. 部署和维护

### 7.1 Docker Compose 配置

```yaml
version: '3.8'

services:
  # 归档服务
  archiving-service:
    image: cognitive-assistant-archiving-service:latest
    container_name: archiving-service
    ports:
      - "3003:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - POSTGRES_URL=postgres://postgres:password@postgres:5432/cognitive_assistant
      - AWS_REGION=us-east-1
      - S3_ENDPOINT=http://minio:9000
      - AWS_ACCESS_KEY_ID=minioadmin
      - AWS_SECRET_ACCESS_KEY=minioadmin
      - S3_BUCKET_NAME=cognitive-archive
      - LOG_LEVEL=info
    depends_on:
      - postgres
      - minio
    restart: unless-stopped

  # MinIO 服务
  minio:
    image: minio/minio:latest
    container_name: minio
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    restart: unless-stopped

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
    restart: unless-stopped

volumes:
  postgres-data:
  minio-data:
```

### 7.2 部署脚本

```bash
#!/bin/bash

# 数据归档服务部署脚本

echo "Deploying data archiving service..."

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
docker build -t cognitive-assistant-archiving-service:latest .

# 启动 Docker Compose 服务
echo "Starting Docker Compose services..."
docker-compose up -d

# 等待服务启动
echo "Waiting for services to start..."
sleep 30

# 检查服务状态
echo "Checking service status..."
docker-compose ps

# 创建 MinIO 存储桶
echo "Creating MinIO bucket..."
docker exec -it minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec -it minio mc mb local/cognitive-archive

# 运行数据库迁移
echo "Running database migrations..."
docker exec -it postgres psql -U postgres -d cognitive_assistant -f /docker-entrypoint-initdb.d/init-archiving.sql

# 检查 API 状态
echo "Checking API status..."
curl -s http://localhost:3003/health

if [ $? -eq 0 ]; then
    echo "Data archiving service deployed successfully!"
else
    echo "Failed to deploy data archiving service. Please check the logs."
    docker-compose logs archiving-service
    exit 1
fi
```

### 7.3 监控和日志

```json
{
  "level": "info",
  "transports": [
    {
      "type": "file",
      "path": "./logs/archiving-service.log",
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
import { DataArchivingService } from './services/DataArchivingService';
import { container } from 'tsyringe';
import { Logger } from '../../src/infrastructure/logging/Logger';

describe('DataArchivingService', () => {
  let archivingService: DataArchivingService;
  let logger: Logger;

  beforeEach(() => {
    // 重置容器
    container.clearInstances();
    
    // 解析依赖
    logger = container.resolve(Logger);
    archivingService = container.resolve(DataArchivingService);
  });

  describe('archiveData', () => {
    it('should archive data for a table', async () => {
      // 模拟各步骤
      const identifySpy = jest.spyOn(archivingService as any, 'identifyDataToArchive').mockResolvedValue({
        start: new Date('2023-01-01'),
        end: new Date('2023-02-01')
      });

      const exportSpy = jest.spyOn(archivingService as any, 'exportData').mockResolvedValue({
        data: Buffer.from(JSON.stringify([{ id: '1', name: 'test' }]))
      });

      const uploadSpy = jest.spyOn(archivingService as any, 'uploadToS3').mockResolvedValue();
      const verifySpy = jest.spyOn(archivingService as any, 'verifyArchive').mockResolvedValue();
      const deleteSpy = jest.spyOn(archivingService as any, 'deleteArchivedData').mockResolvedValue();
      const updateSpy = jest.spyOn(archivingService as any, 'updateArchiveMetadata').mockResolvedValue();

      const result = await archivingService.archiveData('test_table');

      expect(result).toHaveProperty('archiveId');
      expect(result.tableName).toBe('test_table');
      expect(identifySpy).toHaveBeenCalled();
      expect(exportSpy).toHaveBeenCalled();
      expect(uploadSpy).toHaveBeenCalled();
      expect(verifySpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('restoreArchive', () => {
    it('should restore archived data', async () => {
      // 模拟各步骤
      const metadataSpy = jest.spyOn(archivingService['pgPool'], 'query').mockResolvedValue({
        rows: [{ table_name: 'test_table' }]
      });

      const downloadSpy = jest.spyOn(archivingService['s3Client'], 'send').mockResolvedValue({
        Body: {
          on: jest.fn(),
          pipe: jest.fn()
        }
      } as any);

      const gunzipSpy = jest.spyOn(archivingService as any, 'gunzipAsync').mockResolvedValue(Buffer.from(JSON.stringify([{ id: '1', name: 'test' }])));
      const updateSpy = jest.spyOn(archivingService as any, 'updateRestoreRecord').mockResolvedValue();

      await archivingService.restoreArchive('test_archive_id');

      expect(metadataSpy).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalled();
      expect(gunzipSpy).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
```

### 8.2 性能测试

```bash
#!/bin/bash

# 数据归档性能测试脚本

echo "Starting data archiving performance test..."

# 1. 生成测试数据
echo "Generating test data..."
node ./scripts/generate-test-data.js --count 100000 --table thought_fragments

# 2. 记录开始时间
echo "Starting archiving..."
start_time=$(date +%s.%N)

# 3. 执行归档
node ./archiving-cli.js archive thought_fragments

# 4. 记录结束时间
end_time=$(date +%s.%N)
elapsed_time=$(echo "$end_time - $start_time" | bc)

# 5. 检查归档结果
echo "Checking archive result..."
archives=$(node -e "
const { DataArchivingService } = require('./dist/services/DataArchivingService');
const service = new DataArchivingService();
const result = await service.getArchiveList('thought_fragments');
console.log(JSON.stringify(result));
")

# 6. 输出测试结果
echo "Test Results:"
echo "- Total rows archived: 100,000"
echo "- Elapsed time: $elapsed_time seconds"
echo "- Archives created: $(echo $archives | jq '. | length')"

echo "Performance test completed!"
```

## 9. 总结

本文档详细描述了AI认知辅助系统数据归档机制的实现代码，包括：

1. 数据归档策略设计，包括归档类型、归档策略和归档流程
2. 数据归档服务实现，包括数据识别、导出、压缩、上传和验证
3. 归档调度服务，支持自动归档任务
4. 归档管理API，提供归档管理的RESTful接口
5. 归档管理命令行工具，方便手动操作
6. 部署和维护脚本，包括Docker配置和部署流程
7. 测试和验证方案，包括功能测试和性能测试

通过实现数据归档机制，可以优化存储使用、提高系统性能并确保数据的长期可用性，支持AI认知辅助系统的长期发展和扩展。