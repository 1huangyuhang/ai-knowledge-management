# 85-备份恢复技术实现文档

## 1. 架构设计

### 1.1 分层架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Presentation Layer                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  BackupApiController│  │  RecoveryApiController│ │ BackupAdminController│ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Application Layer                               │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  BackupService      │  │  RecoveryService    │  │  BackupAdminService│ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Domain Layer                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  Backup             │  │  RecoveryJob        │  │  BackupPolicy     │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Infrastructure Layer                           │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  LocalBackupStorage │  │  S3BackupStorage    │  │  BackupScheduler  │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           AI Capability Layer                           │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  BackupOptimizer    │  │  RecoveryPredictor  │  │  BackupValidator  │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 核心组件

| 组件 | 职责 | 分层 |
|------|------|------|
| BackupService | 备份管理核心服务 | Application |
| RecoveryService | 数据恢复核心服务 | Application |
| BackupAdminService | 备份策略管理服务 | Application |
| BackupRepository | 备份存储接口 | Domain |
| LocalBackupStorage | 本地备份存储实现 | Infrastructure |
| S3BackupStorage | S3云存储备份实现 | Infrastructure |
| BackupScheduler | 备份任务调度器 | Infrastructure |
| BackupOptimizer | 备份策略优化 | AI Capability |
| BackupValidator | 备份完整性验证 | AI Capability |

## 2. 领域模型设计

### 2.1 核心实体

```typescript
// src/domain/entities/Backup.ts
export interface Backup {
  id: string;
  type: BackupType;
  status: BackupStatus;
  startTime: Date;
  endTime?: Date;
  size: number;
  path: string;
  storageType: StorageType;
  metadata: Record<string, any>;
  checksum: string;
  version: string;
  createdBy: string;
}

// src/domain/enums/BackupType.ts
export enum BackupType {
  FULL = 'FULL',
  INCREMENTAL = 'INCREMENTAL',
  DIFFERENTIAL = 'DIFFERENTIAL'
}

// src/domain/enums/BackupStatus.ts
export enum BackupStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// src/domain/enums/StorageType.ts
export enum StorageType {
  LOCAL = 'LOCAL',
  S3 = 'S3',
  GCS = 'GCS',
  AZURE = 'AZURE'
}

// src/domain/entities/BackupPolicy.ts
export interface BackupPolicy {
  id: string;
  name: string;
  type: BackupType;
  schedule: string; // Cron表达式
  retentionDays: number;
  storageType: StorageType;
  storageConfig: Record<string, any>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// src/domain/entities/RecoveryJob.ts
export interface RecoveryJob {
  id: string;
  backupId: string;
  status: RecoveryStatus;
  startTime: Date;
  endTime?: Date;
  targetPath: string;
  metadata: Record<string, any>;
  createdBy: string;
}

// src/domain/enums/RecoveryStatus.ts
export enum RecoveryStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}
```

## 3. Application层设计

### 3.1 服务接口

```typescript
// src/application/services/BackupService.ts
export interface BackupService {
  createBackup(type: BackupType, storageType: StorageType): Promise<Backup>;
  getBackupById(id: string): Promise<Backup>;
  listBackups(filter: BackupFilter, pagination: Pagination): Promise<PaginatedResult<Backup>>;
  cancelBackup(id: string): Promise<Backup>;
  verifyBackup(id: string): Promise<BackupVerificationResult>;
  deleteBackup(id: string): Promise<void>;
}

// src/application/services/RecoveryService.ts
export interface RecoveryService {
  createRecoveryJob(backupId: string, targetPath: string): Promise<RecoveryJob>;
  getRecoveryJobById(id: string): Promise<RecoveryJob>;
  listRecoveryJobs(filter: RecoveryJobFilter, pagination: Pagination): Promise<PaginatedResult<RecoveryJob>>;
  cancelRecoveryJob(id: string): Promise<RecoveryJob>;
  getRecoveryPreview(backupId: string): Promise<BackupContentPreview>;
}

// src/application/services/BackupAdminService.ts
export interface BackupAdminService {
  createBackupPolicy(policy: BackupPolicyCreateDto): Promise<BackupPolicy>;
  getBackupPolicyById(id: string): Promise<BackupPolicy>;
  listBackupPolicies(filter: BackupPolicyFilter, pagination: Pagination): Promise<PaginatedResult<BackupPolicy>>;
  updateBackupPolicy(id: string, policy: Partial<BackupPolicy>): Promise<BackupPolicy>;
  deleteBackupPolicy(id: string): Promise<void>;
  enableBackupPolicy(id: string): Promise<BackupPolicy>;
  disableBackupPolicy(id: string): Promise<BackupPolicy>;
  executeBackupPolicy(id: string): Promise<Backup>;
}
```

### 3.2 服务实现

```typescript
// src/application/services/impl/BackupServiceImpl.ts
import { BackupService } from '../BackupService';
import { BackupRepository } from '../../domain/repositories/BackupRepository';
import { BackupType } from '../../domain/enums/BackupType';
import { StorageType } from '../../domain/enums/StorageType';
import { BackupStatus } from '../../domain/enums/BackupStatus';
import { FileSystemService } from '../../infrastructure/services/FileSystemService';
import { ChecksumService } from '../../infrastructure/services/ChecksumService';

export class BackupServiceImpl implements BackupService {
  constructor(
    private readonly backupRepository: BackupRepository,
    private readonly fileSystemService: FileSystemService,
    private readonly checksumService: ChecksumService
  ) {}

  async createBackup(type: BackupType, storageType: StorageType): Promise<Backup> {
    // 创建备份记录
    const backup: Backup = {
      id: crypto.randomUUID(),
      type,
      status: BackupStatus.PENDING,
      startTime: new Date(),
      size: 0,
      path: '',
      storageType,
      metadata: {},
      checksum: '',
      version: '1.0.0',
      createdBy: 'system'
    };

    // 保存备份记录
    await this.backupRepository.save(backup);

    try {
      // 更新备份状态为运行中
      backup.status = BackupStatus.RUNNING;
      await this.backupRepository.update(backup);

      // 执行备份逻辑
      const backupResult = await this.executeBackup(type, storageType);
      
      // 更新备份信息
      backup.status = BackupStatus.COMPLETED;
      backup.endTime = new Date();
      backup.size = backupResult.size;
      backup.path = backupResult.path;
      backup.checksum = backupResult.checksum;
      backup.metadata = {
        ...backup.metadata,
        filesCount: backupResult.filesCount
      };

      await this.backupRepository.update(backup);
      return backup;
    } catch (error) {
      // 更新备份状态为失败
      backup.status = BackupStatus.FAILED;
      backup.endTime = new Date();
      backup.metadata = {
        ...backup.metadata,
        error: (error as Error).message
      };
      await this.backupRepository.update(backup);
      throw error;
    }
  }

  private async executeBackup(type: BackupType, storageType: StorageType): Promise<BackupResult> {
    // 实现具体的备份逻辑
    // 1. 确定备份源和目标
    // 2. 根据备份类型执行不同的备份策略
    // 3. 计算备份文件的校验和
    // 4. 返回备份结果
    // ...
  }

  // 其他方法实现
}
```

## 4. Infrastructure层设计

### 4.1 备份存储实现

```typescript
// src/infrastructure/repositories/S3BackupStorage.ts
import { BackupRepository } from '../../domain/repositories/BackupRepository';
import { Backup } from '../../domain/entities/Backup';
import { S3Client } from '@aws-sdk/client-s3';
import { BackupPolicy } from '../../domain/entities/BackupPolicy';

export class S3BackupStorage implements BackupRepository {
  constructor(private readonly s3Client: S3Client, private readonly bucketName: string) {}

  async save(backup: Backup): Promise<void> {
    // 将备份记录保存到数据库
    // ...
  }

  async update(backup: Backup): Promise<void> {
    // 更新数据库中的备份记录
    // ...
  }

  async findById(id: string): Promise<Backup | null> {
    // 从数据库中查找备份记录
    // ...
  }

  async uploadBackupFile(filePath: string, backupId: string): Promise<string> {
    // 将备份文件上传到S3
    const key = `backups/${backupId}/${new Date().toISOString().split('T')[0]}.tar.gz`;
    
    await this.s3Client.putObject({
      Bucket: this.bucketName,
      Key: key,
      Body: await fs.promises.readFile(filePath)
    });
    
    return key;
  }

  async downloadBackupFile(backup: Backup, targetPath: string): Promise<void> {
    // 从S3下载备份文件到目标路径
    const params = {
      Bucket: this.bucketName,
      Key: backup.path
    };
    
    const data = await this.s3Client.getObject(params);
    if (data.Body) {
      await fs.promises.writeFile(targetPath, data.Body as ReadableStream);
    }
  }

  // 其他方法实现
}
```

### 4.2 备份调度服务

```typescript
// src/infrastructure/services/BackupScheduler.ts
import { CronJob } from 'cron';
import { BackupService } from '../../application/services/BackupService';
import { BackupPolicy } from '../../domain/entities/BackupPolicy';
import { BackupPolicyRepository } from '../../domain/repositories/BackupPolicyRepository';

export class BackupScheduler {
  private jobs: Map<string, CronJob> = new Map();
  
  constructor(
    private readonly backupService: BackupService,
    private readonly backupPolicyRepository: BackupPolicyRepository
  ) {}

  async start(): Promise<void> {
    // 获取所有启用的备份策略
    const policies = await this.backupPolicyRepository.find({
      enabled: true
    });
    
    // 为每个策略创建调度任务
    for (const policy of policies) {
      this.schedulePolicy(policy);
    }
  }

  private schedulePolicy(policy: BackupPolicy): void {
    // 创建Cron任务
    const job = new CronJob(
      policy.schedule,
      async () => {
        try {
          await this.backupService.createBackup(policy.type, policy.storageType);
        } catch (error) {
          // 记录调度错误
          console.error(`Failed to execute backup policy ${policy.id}:`, error);
        }
      },
      null,
      true,
      'UTC'
    );
    
    this.jobs.set(policy.id, job);
  }

  async reschedulePolicy(policy: BackupPolicy): Promise<void> {
    // 取消现有任务
    if (this.jobs.has(policy.id)) {
      this.jobs.get(policy.id)?.stop();
      this.jobs.delete(policy.id);
    }
    
    // 如果策略已启用，创建新任务
    if (policy.enabled) {
      this.schedulePolicy(policy);
    }
  }

  async stop(): Promise<void> {
    // 停止所有调度任务
    for (const job of this.jobs.values()) {
      job.stop();
    }
    this.jobs.clear();
  }
}
```

## 5. Presentation层设计

### 5.1 API控制器

```typescript
// src/presentation/controllers/BackupApiController.ts
import { Request, Response } from 'express';
import { BackupService } from '../../application/services/BackupService';
import { Controller, Post, Get, Delete, UseMiddleware } from '../decorators/Controller';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { BackupType } from '../../domain/enums/BackupType';
import { StorageType } from '../../domain/enums/StorageType';

@Controller('/api/backups')
export class BackupApiController {
  constructor(private readonly backupService: BackupService) {}

  @Post('/')
  @UseMiddleware(AuthMiddleware)
  async createBackup(req: Request, res: Response): Promise<void> {
    const { type, storageType } = req.body;
    const backup = await this.backupService.createBackup(type as BackupType, storageType as StorageType);
    res.status(201).json(backup);
  }

  @Get('/:id')
  @UseMiddleware(AuthMiddleware)
  async getBackup(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const backup = await this.backupService.getBackupById(id);
    res.status(200).json(backup);
  }

  @Get('/')
  @UseMiddleware(AuthMiddleware)
  async listBackups(req: Request, res: Response): Promise<void> {
    const { type, status, storageType, page = 1, limit = 10 } = req.query;
    const filter = {
      type: type as BackupType,
      status: status as BackupStatus,
      storageType: storageType as StorageType
    };
    const pagination = { page: parseInt(page as string), limit: parseInt(limit as string) };
    const result = await this.backupService.listBackups(filter, pagination);
    res.status(200).json(result);
  }

  @Delete('/:id')
  @UseMiddleware(AuthMiddleware)
  async deleteBackup(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.backupService.deleteBackup(id);
    res.status(204).send();
  }

  @Post('/:id/verify')
  @UseMiddleware(AuthMiddleware)
  async verifyBackup(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await this.backupService.verifyBackup(id);
    res.status(200).json(result);
  }
}
```

## 6. AI Capability层设计

### 6.1 备份优化器

```typescript
// src/ai/services/BackupOptimizer.ts
import { BackupPolicy } from '../../domain/entities/BackupPolicy';
import { AIService } from './AIService';

export class BackupOptimizer {
  constructor(private readonly aiService: AIService) {}

  async optimizeBackupPolicy(policy: BackupPolicy, usageData: BackupUsageData): Promise<BackupPolicyOptimization> {
    // 使用AI服务优化备份策略
    const result = await this.aiService.optimizeBackupPolicy({
      policy: {
        type: policy.type,
        schedule: policy.schedule,
        retentionDays: policy.retentionDays
      },
      usageData: {
        backupFrequency: usageData.backupFrequency,
        recoveryRate: usageData.recoveryRate,
        dataGrowthRate: usageData.dataGrowthRate,
        storageCost: usageData.storageCost
      }
    });

    return {
      optimalType: result.optimalType,
      optimalSchedule: result.optimalSchedule,
      optimalRetentionDays: result.optimalRetentionDays,
      estimatedCostSavings: result.estimatedCostSavings,
      estimatedRecoveryTimeImprovement: result.estimatedRecoveryTimeImprovement
    };
  }
}
```

### 6.2 备份验证器

```typescript
// src/ai/services/BackupValidator.ts
import { Backup } from '../../domain/entities/Backup';
import { AIService } from './AIService';

export class BackupValidator {
  constructor(private readonly aiService: AIService) {}

  async validateBackup(backup: Backup): Promise<BackupValidationResult> {
    // 使用AI服务验证备份完整性
    const result = await this.aiService.validateBackup({
      backupId: backup.id,
      checksum: backup.checksum,
      metadata: backup.metadata,
      type: backup.type
    });

    return {
      isValid: result.isValid,
      confidenceScore: result.confidenceScore,
      issues: result.issues || [],
      recommendations: result.recommendations || []
    };
  }
}
```

## 7. API设计

### 7.1 备份管理API

| 端点 | 方法 | 认证 | 描述 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| `/api/backups` | POST | 是 | 创建备份 | `{ type: string, storageType: string }` | `201 Created` with backup |
| `/api/backups/:id` | GET | 是 | 获取备份详情 | N/A | `200 OK` with backup |
| `/api/backups` | GET | 是 | 列出备份 | 查询参数：`type`, `status`, `storageType`, `page`, `limit` | `200 OK` with paginated backups |
| `/api/backups/:id` | DELETE | 是 | 删除备份 | N/A | `204 No Content` |
| `/api/backups/:id/verify` | POST | 是 | 验证备份 | N/A | `200 OK` with verification result |

### 7.2 恢复管理API

| 端点 | 方法 | 认证 | 描述 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| `/api/recoveries` | POST | 是 | 创建恢复任务 | `{ backupId: string, targetPath: string }` | `201 Created` with recovery job |
| `/api/recoveries/:id` | GET | 是 | 获取恢复任务 | N/A | `200 OK` with recovery job |
| `/api/recoveries` | GET | 是 | 列出恢复任务 | 查询参数：`status`, `backupId`, `page`, `limit` | `200 OK` with paginated recovery jobs |
| `/api/recoveries/:id/cancel` | POST | 是 | 取消恢复任务 | N/A | `200 OK` with updated recovery job |
| `/api/backups/:id/preview` | GET | 是 | 获取备份内容预览 | N/A | `200 OK` with backup content preview |

### 7.3 备份策略管理API

| 端点 | 方法 | 认证 | 描述 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| `/api/admin/backup-policies` | GET | 管理员 | 获取备份策略列表 | N/A | `200 OK` with paginated policies |
| `/api/admin/backup-policies` | POST | 管理员 | 创建备份策略 | `{ name: string, type: string, schedule: string, retentionDays: number, storageType: string, storageConfig: object }` | `201 Created` with policy |
| `/api/admin/backup-policies/:id` | PUT | 管理员 | 更新备份策略 | `{ name?: string, type?: string, schedule?: string, retentionDays?: number, storageConfig?: object }` | `200 OK` with updated policy |
| `/api/admin/backup-policies/:id` | DELETE | 管理员 | 删除备份策略 | N/A | `204 No Content` |
| `/api/admin/backup-policies/:id/enable` | POST | 管理员 | 启用备份策略 | N/A | `200 OK` with updated policy |
| `/api/admin/backup-policies/:id/disable` | POST | 管理员 | 禁用备份策略 | N/A | `200 OK` with updated policy |
| `/api/admin/backup-policies/:id/execute` | POST | 管理员 | 立即执行备份策略 | N/A | `201 Created` with backup |

## 8. 数据库设计

### 8.1 备份系统表结构

```sql
-- 备份表
CREATE TABLE backups (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    size BIGINT NOT NULL,
    path VARCHAR(255) NOT NULL,
    storage_type VARCHAR(20) NOT NULL,
    metadata JSONB,
    checksum VARCHAR(64) NOT NULL,
    version VARCHAR(20) NOT NULL,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 备份策略表
CREATE TABLE backup_policies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    schedule VARCHAR(50) NOT NULL,
    retention_days INTEGER NOT NULL,
    storage_type VARCHAR(20) NOT NULL,
    storage_config JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 恢复任务表
CREATE TABLE recovery_jobs (
    id VARCHAR(36) PRIMARY KEY,
    backup_id VARCHAR(36) REFERENCES backups(id),
    status VARCHAR(20) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    target_path VARCHAR(255) NOT NULL,
    metadata JSONB,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_backups_status ON backups(status);
CREATE INDEX idx_backups_type ON backups(type);
CREATE INDEX idx_backups_storage_type ON backups(storage_type);
CREATE INDEX idx_backup_policies_enabled ON backup_policies(enabled);
CREATE INDEX idx_recovery_jobs_status ON recovery_jobs(status);
CREATE INDEX idx_recovery_jobs_backup_id ON recovery_jobs(backup_id);
```

## 9. 部署与集成

### 9.1 Docker配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 应用服务
  app:
    # ...
    depends_on:
      - postgres
      - redis
    environment:
      # 备份配置
      BACKUP_ENABLED: "true"
      BACKUP_TYPE: "FULL"
      BACKUP_SCHEDULE: "0 2 * * *"  # 每天凌晨2点
      BACKUP_RETENTION_DAYS: "30"
      STORAGE_TYPE: "S3"
      S3_BUCKET_NAME: "cognitive-assistant-backups"
      AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}"
      AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}"
      AWS_REGION: "us-east-1"

  # 数据库服务
  postgres:
    # ...
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backup-scripts:/backup-scripts
    command: >
      postgres -c shared_preload_libraries=pg_stat_statements

  # 备份服务（可选，用于独立运行备份任务）
  backup-service:
    build: ./backup-service
    depends_on:
      - app
      - postgres
    environment:
      # 备份配置
      BACKUP_API_URL: "http://app:3000/api"
      # 其他环境变量
    volumes:
      - backup-logs:/var/log/backup

volumes:
  postgres-data:
  backup-logs:
```

### 9.2 备份脚本

```bash
#!/bin/bash
# backup-script.sh

# 设置环境变量
set -e

echo "Starting backup at $(date)"

# 执行数据库备份
docker exec -t postgres pg_dump -U postgres cognitive_assistant > /backup/cognitive_assistant_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份文件
gzip /backup/cognitive_assistant_$(date +%Y%m%d_%H%M%S).sql

# 清理旧备份文件（保留30天）
find /backup -name "cognitive_assistant_*.sql.gz" -mtime +30 -delete

echo "Backup completed at $(date)"
```

## 10. 性能优化

### 10.1 备份性能优化

1. **并行备份**：对不同数据集合进行并行备份，提高备份速度
2. **增量备份**：只备份自上次全量备份以来发生变化的数据
3. **压缩优化**：使用高效的压缩算法（如zstd）减少备份文件大小
4. **备份窗口优化**：在系统负载低的时间段执行备份
5. **存储分层**：将不同重要性的数据存储在不同的存储介质上

### 10.2 恢复性能优化

1. **并行恢复**：并行恢复多个数据集合，提高恢复速度
2. **增量恢复优化**：优化增量备份的恢复流程，减少恢复时间
3. **恢复验证**：定期验证恢复流程，确保恢复的可靠性和速度
4. **热备机制**：实现热备机制，减少系统停机时间
5. **恢复测试自动化**：自动化恢复测试，确保恢复流程的可靠性

## 11. 监控与告警

### 11.1 备份系统监控

| 指标 | 描述 | 告警阈值 |
|------|------|----------|
| 备份成功率 | 成功完成的备份任务百分比 | < 99% |
| 备份执行时间 | 备份任务执行时间 | > 1小时 |
| 备份大小增长 | 备份大小增长率 | > 20%/周 |
| 恢复测试成功率 | 恢复测试成功百分比 | < 95% |
| 备份存储使用率 | 备份存储占用率 | > 80% |

### 11.2 告警规则

```yaml
# prometheus-alert-rules.yml
groups:
- name: backup-system-alerts
  rules:
  - alert: BackupFailure
    expr: backup_jobs_status{status="FAILED"} > 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Backup job failed"
      description: "Backup job has failed. Check backup logs for details."

  - alert: BackupJobLate
    expr: time() - backup_job_last_run_time > 86400  # 超过24小时
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "Backup job is late"
      description: "Backup job has not run in over 24 hours."

  - alert: HighBackupStorageUsage
    expr: backup_storage_used / backup_storage_total * 100 > 80
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "High backup storage usage"
      description: "Backup storage usage is above 80% (current: {{ $value }}%)."

  - alert: SlowBackupJob
    expr: backup_job_duration_seconds > 3600  # 超过1小时
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "Slow backup job"
      description: "Backup job duration is above 1 hour (current: {{ $value }} seconds)."
```

## 12. 测试策略

### 12.1 单元测试

```typescript
// src/application/services/impl/BackupServiceImpl.test.ts
import { BackupServiceImpl } from './BackupServiceImpl';
import { BackupRepository } from '../../../domain/repositories/BackupRepository';
import { FileSystemService } from '../../../infrastructure/services/FileSystemService';
import { ChecksumService } from '../../../infrastructure/services/ChecksumService';
import { BackupType } from '../../../domain/enums/BackupType';
import { StorageType } from '../../../domain/enums/StorageType';

describe('BackupServiceImpl', () => {
  let backupService: BackupServiceImpl;
  let mockBackupRepository: jest.Mocked<BackupRepository>;
  let mockFileSystemService: jest.Mocked<FileSystemService>;
  let mockChecksumService: jest.Mocked<ChecksumService>;

  beforeEach(() => {
    mockBackupRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      // 其他方法
    } as any;

    mockFileSystemService = {
      createDirectory: jest.fn().mockResolvedValue(undefined),
      copyDirectory: jest.fn().mockResolvedValue(undefined),
      getFileSize: jest.fn().mockResolvedValue(1024),
      // 其他方法
    } as any;

    mockChecksumService = {
      calculate: jest.fn().mockResolvedValue('test-checksum'),
      verify: jest.fn().mockResolvedValue(true),
    } as any;

    backupService = new BackupServiceImpl(
      mockBackupRepository,
      mockFileSystemService,
      mockChecksumService
    );
  });

  it('should create a full backup successfully', async () => {
    const backup = await backupService.createBackup(BackupType.FULL, StorageType.LOCAL);

    expect(backup).toBeDefined();
    expect(backup.type).toBe(BackupType.FULL);
    expect(backup.status).toBe('COMPLETED');
    expect(mockBackupRepository.save).toHaveBeenCalledTimes(1);
    expect(mockBackupRepository.update).toHaveBeenCalledTimes(2);
  });

  // 其他测试用例
});
```

### 12.2 集成测试

```typescript
// src/infrastructure/repositories/S3BackupStorage.test.ts
import { S3BackupStorage } from './S3BackupStorage';
import { S3Client } from '@aws-sdk/client-s3';
import { Backup } from '../../domain/entities/Backup';
import { BackupType } from '../../domain/enums/BackupType';
import { StorageType } from '../../domain/enums/StorageType';
import { BackupStatus } from '../../domain/enums/BackupStatus';

describe('S3BackupStorage', () => {
  let s3BackupStorage: S3BackupStorage;
  let mockS3Client: jest.Mocked<S3Client>;

  beforeEach(() => {
    mockS3Client = {
      putObject: jest.fn().mockResolvedValue({}),
      getObject: jest.fn().mockResolvedValue({
        Body: Buffer.from('test content')
      } as any),
      // 其他方法
    } as any;

    s3BackupStorage = new S3BackupStorage(mockS3Client, 'test-bucket');
  });

  it('should upload backup file to S3', async () => {
    const backup: Backup = {
      id: 'test-backup-id',
      type: BackupType.FULL,
      status: BackupStatus.COMPLETED,
      startTime: new Date(),
      endTime: new Date(),
      size: 1024,
      path: '',
      storageType: StorageType.S3,
      metadata: {},
      checksum: 'test-checksum',
      version: '1.0.0',
      createdBy: 'system'
    };

    const filePath = '/tmp/test-backup.tar.gz';
    const key = await s3BackupStorage.uploadBackupFile(filePath, backup.id);

    expect(key).toContain('backups/test-backup-id/');
    expect(mockS3Client.putObject).toHaveBeenCalledTimes(1);
    expect(mockS3Client.putObject).toHaveBeenCalledWith(expect.objectContaining({
      Bucket: 'test-bucket',
      Key: key
    }));
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
- 定期进行代码审查

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
    // 备份相关规则
    "no-unsafe-fs-operations": "warn",
    // 其他规则
  }
}
```

## 14. 维护与演进

### 14.1 备份系统维护

- 定期检查备份策略执行情况
- 定期验证备份文件的完整性
- 定期测试恢复流程
- 监控备份存储使用情况
- 调整备份策略以适应数据增长

### 14.2 系统演进

1. **阶段1**：基础备份恢复功能
2. **阶段2**：自动化备份策略和调度
3. **阶段3**：AI驱动的备份策略优化
4. **阶段4**：智能恢复预测和优化
5. **阶段5**：灾难恢复自动化和演练

## 15. 总结

本技术实现文档详细设计了一个基于Clean Architecture的备份恢复系统，包括：

- 完整的分层架构设计
- 核心领域模型和服务接口
- 多存储后端支持（本地存储和S3云存储）
- 自动化备份调度和策略管理
- 强大的数据恢复功能
- AI驱动的备份优化和验证
- 详细的API设计和部署配置
- 全面的性能优化和监控方案
- 完善的测试策略

该设计遵循了项目的架构原则和技术约束，同时提供了良好的可扩展性和可维护性，能够满足认知辅助系统的备份恢复需求。系统设计考虑了数据安全性、可靠性和可用性，确保在各种情况下都能有效地保护和恢复数据。