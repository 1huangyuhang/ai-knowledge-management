# 147-报表模型实现代码

## 1. 概述

本文档详细描述了AI认知辅助系统报表模型的实现代码，包括报表数据模型设计、报表生成服务实现、报表API接口定义以及相关测试和部署方案。报表模型用于支持复杂的数据分析需求，帮助用户理解和分析认知模型的结构和变化。

## 2. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| ClickHouse | 24.x | 分析数据库，存储报表数据 |
| Node.js | 18.x | 应用服务器 |
| TypeScript | 5.x | 开发语言 |
| Fastify | 5.x | Web框架，提供API接口 |
| Chart.js | 4.x | 图表库，用于报表可视化 |
| JWT | - | API认证 |
| Docker | 24.x | 容器化部署 |

## 3. 报表模型设计

### 3.1 核心概念

1. **报表模板**：定义报表的结构、数据源和可视化方式
2. **报表实例**：基于报表模板生成的具体报表
3. **报表数据**：报表的实际数据内容
4. **可视化配置**：定义报表的图表类型、样式和交互方式
5. **调度任务**：定期生成报表的任务配置

### 3.2 报表数据模型

```typescript
// 报表模板数据模型
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'cognitive' | 'user' | 'system';
  dataSource: {
    type: 'clickhouse' | 'postgresql' | 'api';
    query: string;
    parameters: ReportParameter[];
  };
  visualization: {
    type: 'table' | 'line' | 'bar' | 'pie' | 'scatter';
    config: any;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 报表参数数据模型
export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'enum';
  defaultValue?: any;
  required: boolean;
  options?: string[];
}

// 报表实例数据模型
export interface ReportInstance {
  id: string;
  templateId: string;
  name: string;
  parameters: Record<string, any>;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  data: any;
  createdAt: Date;
  completedAt?: Date;
  generatedBy: string;
}

// 调度任务数据模型
export interface ReportSchedule {
  id: string;
  templateId: string;
  name: string;
  parameters: Record<string, any>;
  cronExpression: string;
  nextRunAt: Date;
  lastRunAt?: Date;
  lastRunStatus?: 'success' | 'failure';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 报表结果数据模型
export interface ReportResult {
  id: string;
  instanceId: string;
  data: any;
  format: 'json' | 'csv' | 'pdf';
  url: string;
  createdAt: Date;
  expiresAt: Date;
}
```

## 4. ClickHouse 报表表结构

```sql
-- 创建报表相关表
CREATE DATABASE IF NOT EXISTS cognitive_reports;

USE cognitive_reports;

-- 报表模板表
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID DEFAULT generateUUIDv4(),
    name String,
    description String,
    type Enum8('cognitive' = 1, 'user' = 2, 'system' = 3),
    data_source JSON,
    visualization JSON,
    created_by String,
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    PRIMARY KEY (id)
) ENGINE = MergeTree()
ORDER BY (created_at);

-- 报表实例表
CREATE TABLE IF NOT EXISTS report_instances (
    id UUID DEFAULT generateUUIDv4(),
    template_id UUID,
    name String,
    parameters JSON,
    status Enum8('pending' = 1, 'generating' = 2, 'completed' = 3, 'failed' = 4),
    data JSON,
    created_at DateTime64(3) DEFAULT now(),
    completed_at DateTime64(3),
    generated_by String,
    PRIMARY KEY (id)
) ENGINE = MergeTree()
ORDER BY (created_at);

-- 调度任务表
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID DEFAULT generateUUIDv4(),
    template_id UUID,
    name String,
    parameters JSON,
    cron_expression String,
    next_run_at DateTime64(3),
    last_run_at DateTime64(3),
    last_run_status Enum8('success' = 1, 'failure' = 2),
    created_by String,
    created_at DateTime64(3) DEFAULT now(),
    updated_at DateTime64(3) DEFAULT now(),
    PRIMARY KEY (id)
) ENGINE = MergeTree()
ORDER BY (next_run_at);

-- 报表结果表
CREATE TABLE IF NOT EXISTS report_results (
    id UUID DEFAULT generateUUIDv4(),
    instance_id UUID,
    data JSON,
    format Enum8('json' = 1, 'csv' = 2, 'pdf' = 3),
    url String,
    created_at DateTime64(3) DEFAULT now(),
    expires_at DateTime64(3),
    PRIMARY KEY (id)
) ENGINE = MergeTree()
ORDER BY (created_at);

-- 认知模型分析视图
CREATE VIEW IF NOT EXISTS cognitive_model_analysis AS
SELECT 
    user_id,
    COUNT(DISTINCT id) AS model_count,
    AVG(JSONExtractFloat(model_data, 'complexity')) AS avg_complexity,
    MAX(updated_at) AS last_updated
FROM cognitive_analytics.user_cognitive_models
GROUP BY user_id;

-- 认知概念分析视图
CREATE VIEW IF NOT EXISTS cognitive_concept_analysis AS
SELECT 
    user_id,
    COUNT(DISTINCT id) AS concept_count,
    concept_type,
    AVG(importance) AS avg_importance,
    DATE_TRUNC('day', created_at) AS created_date
FROM cognitive_analytics.cognitive_concepts
GROUP BY user_id, concept_type, DATE_TRUNC('day', created_at);

-- 认知关系分析视图
CREATE VIEW IF NOT EXISTS cognitive_relation_analysis AS
SELECT 
    user_id,
    COUNT(DISTINCT id) AS relation_count,
    relation_type,
    AVG(strength) AS avg_strength,
    DATE_TRUNC('week', created_at) AS created_week
FROM cognitive_analytics.cognitive_relations
GROUP BY user_id, relation_type, DATE_TRUNC('week', created_at);
```

## 5. 报表服务实现

### 5.1 报表模板服务

```typescript
import { injectable, singleton } from 'tsyringe';
import { ClickHouseClient } from '@clickhouse/client';
import { ReportTemplate, ReportParameter } from './types';
import { Logger } from '../../src/infrastructure/logging/Logger';

@singleton()
@injectable()
export class ReportTemplateService {
  private clickhouseClient: ClickHouseClient;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.clickhouseClient = new ClickHouseClient({
      url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USERNAME || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || 'password',
      database: 'cognitive_reports'
    });
  }

  /**
   * 创建报表模板
   */
  public async createTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> {
    this.logger.info('Creating report template', { templateName: template.name });

    const id = crypto.randomUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    const query = `
      INSERT INTO report_templates (id, name, description, type, data_source, visualization, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.clickhouseClient.execute({
      query,
      values: [
        id,
        template.name,
        template.description,
        template.type,
        JSON.stringify(template.dataSource),
        JSON.stringify(template.visualization),
        template.createdBy,
        createdAt.toISOString(),
        updatedAt.toISOString()
      ]
    });

    return {
      ...template,
      id,
      createdAt,
      updatedAt
    };
  }

  /**
   * 获取报表模板列表
   */
  public async getTemplates(filter?: {
    type?: ReportTemplate['type'];
    createdBy?: string;
  }): Promise<ReportTemplate[]> {
    this.logger.info('Getting report templates', { filter });

    let whereClause = '';
    const params: any[] = [];

    if (filter?.type) {
      whereClause = `WHERE type = ?`;
      params.push(filter.type);
    }

    if (filter?.createdBy) {
      whereClause = whereClause ? `${whereClause} AND created_by = ?` : `WHERE created_by = ?`;
      params.push(filter.createdBy);
    }

    const query = `
      SELECT * FROM report_templates
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const result = await this.clickhouseClient.query({
      query,
      values: params,
      format: 'JSONEachRow'
    });

    const rows = await result.json();
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      dataSource: JSON.parse(row.data_source),
      visualization: JSON.parse(row.visualization),
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  /**
   * 获取报表模板详情
   */
  public async getTemplateById(id: string): Promise<ReportTemplate | null> {
    this.logger.info('Getting report template by id', { templateId: id });

    const query = `
      SELECT * FROM report_templates
      WHERE id = ?
    `;

    const result = await this.clickhouseClient.query({
      query,
      values: [id],
      format: 'JSONEachRow'
    });

    const rows = await result.json();
    
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      dataSource: JSON.parse(row.data_source),
      visualization: JSON.parse(row.visualization),
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  /**
   * 更新报表模板
   */
  public async updateTemplate(id: string, template: Partial<Omit<ReportTemplate, 'id' | 'createdAt' | 'createdBy'>>): Promise<ReportTemplate | null> {
    this.logger.info('Updating report template', { templateId: id, updates: Object.keys(template) });

    const existingTemplate = await this.getTemplateById(id);
    if (!existingTemplate) {
      return null;
    }

    const updatedAt = new Date();
    const updates = {
      ...existingTemplate,
      ...template,
      updatedAt
    };

    const query = `
      ALTER TABLE report_templates UPDATE
        name = ?, description = ?, type = ?, 
        data_source = ?, visualization = ?, updated_at = ?
      WHERE id = ?
    `;

    await this.clickhouseClient.execute({
      query,
      values: [
        updates.name,
        updates.description,
        updates.type,
        JSON.stringify(updates.dataSource),
        JSON.stringify(updates.visualization),
        updatedAt.toISOString(),
        id
      ]
    });

    return updates;
  }

  /**
   * 删除报表模板
   */
  public async deleteTemplate(id: string): Promise<boolean> {
    this.logger.info('Deleting report template', { templateId: id });

    const query = `
      ALTER TABLE report_templates DELETE WHERE id = ?
    `;

    await this.clickhouseClient.execute({
      query,
      values: [id]
    });

    return true;
  }
}
```

### 5.2 报表生成服务

```typescript
import { injectable, singleton } from 'tsyringe';
import { ClickHouseClient } from '@clickhouse/client';
import { ReportInstance, ReportTemplate } from './types';
import { ReportTemplateService } from './ReportTemplateService';
import { Logger } from '../../src/infrastructure/logging/Logger';

@singleton()
@injectable()
export class ReportGenerationService {
  private clickhouseClient: ClickHouseClient;
  private templateService: ReportTemplateService;
  private logger: Logger;

  constructor(templateService: ReportTemplateService, logger: Logger) {
    this.templateService = templateService;
    this.logger = logger;
    this.clickhouseClient = new ClickHouseClient({
      url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USERNAME || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || 'password',
      database: 'cognitive_analytics'
    });
  }

  /**
   * 生成报表
   */
  public async generateReport(templateId: string, parameters: Record<string, any>, userId: string): Promise<ReportInstance> {
    this.logger.info('Generating report', { templateId, parameters, userId });

    // 获取报表模板
    const template = await this.templateService.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Report template ${templateId} not found`);
    }

    // 创建报表实例
    const instance: Omit<ReportInstance, 'id' | 'status' | 'data' | 'completedAt'> = {
      templateId,
      name: `${template.name} - ${new Date().toISOString()}`,
      parameters,
      generatedBy: userId,
      createdAt: new Date()
    };

    const instanceId = crypto.randomUUID();
    
    // 保存报表实例（状态：generating）
    await this.saveReportInstance({
      ...instance,
      id: instanceId,
      status: 'generating',
      data: null
    });

    try {
      // 执行查询获取数据
      const data = await this.executeReportQuery(template, parameters);

      // 更新报表实例（状态：completed）
      const completedInstance = {
        ...instance,
        id: instanceId,
        status: 'completed',
        data,
        completedAt: new Date()
      };

      await this.saveReportInstance(completedInstance);
      this.logger.info('Report generated successfully', { instanceId });

      return completedInstance;
    } catch (error) {
      // 更新报表实例（状态：failed）
      await this.saveReportInstance({
        ...instance,
        id: instanceId,
        status: 'failed',
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      
      this.logger.error('Failed to generate report', { instanceId, error });
      throw error;
    }
  }

  /**
   * 执行报表查询
   */
  private async executeReportQuery(template: ReportTemplate, parameters: Record<string, any>): Promise<any> {
    // 替换查询中的参数
    let query = template.dataSource.query;
    
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `:${key}`;
      if (typeof value === 'string') {
        query = query.replace(placeholder, `'${value}'`);
      } else {
        query = query.replace(placeholder, String(value));
      }
    }

    this.logger.debug('Executing report query', { query });

    const result = await this.clickhouseClient.query({
      query,
      format: 'JSONEachRow'
    });

    return await result.json();
  }

  /**
   * 保存报表实例
   */
  private async saveReportInstance(instance: ReportInstance): Promise<void> {
    const query = `
      INSERT INTO report_instances 
      (id, template_id, name, parameters, status, data, created_at, completed_at, generated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.clickhouseClient.execute({
      query,
      values: [
        instance.id,
        instance.templateId,
        instance.name,
        JSON.stringify(instance.parameters),
        instance.status,
        instance.data ? JSON.stringify(instance.data) : null,
        instance.createdAt.toISOString(),
        instance.completedAt?.toISOString() || null,
        instance.generatedBy
      ]
    });
  }

  /**
   * 获取报表实例
   */
  public async getReportInstance(id: string): Promise<ReportInstance | null> {
    this.logger.info('Getting report instance', { instanceId: id });

    const query = `
      SELECT * FROM report_instances
      WHERE id = ?
    `;

    const result = await this.clickhouseClient.query({
      query,
      values: [id],
      format: 'JSONEachRow'
    });

    const rows = await result.json();
    
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    
    return {
      id: row.id,
      templateId: row.template_id,
      name: row.name,
      parameters: JSON.parse(row.parameters),
      status: row.status,
      data: row.data ? JSON.parse(row.data) : null,
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      generatedBy: row.generated_by
    };
  }
}
```

### 5.3 报表调度服务

```typescript
import { injectable, singleton } from 'tsyringe';
import { ClickHouseClient } from '@clickhouse/client';
import { ReportSchedule } from './types';
import { ReportGenerationService } from './ReportGenerationService';
import { Logger } from '../../src/infrastructure/logging/Logger';
import * as cron from 'node-cron';

@singleton()
@injectable()
export class ReportSchedulingService {
  private clickhouseClient: ClickHouseClient;
  private generationService: ReportGenerationService;
  private logger: Logger;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor(generationService: ReportGenerationService, logger: Logger) {
    this.generationService = generationService;
    this.logger = logger;
    this.clickhouseClient = new ClickHouseClient({
      url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USERNAME || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || 'password',
      database: 'cognitive_reports'
    });

    // 启动时加载所有调度任务
    this.loadSchedules();
  }

  /**
   * 创建调度任务
   */
  public async createSchedule(schedule: Omit<ReportSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportSchedule> {
    this.logger.info('Creating report schedule', { name: schedule.name });

    const id = crypto.randomUUID();
    const now = new Date();
    
    const newSchedule: ReportSchedule = {
      ...schedule,
      id,
      createdAt: now,
      updatedAt: now
    };

    // 保存调度任务
    await this.saveSchedule(newSchedule);

    // 启动调度任务
    this.startSchedule(newSchedule);

    return newSchedule;
  }

  /**
   * 加载所有调度任务
   */
  private async loadSchedules(): Promise<void> {
    this.logger.info('Loading report schedules');

    const query = `
      SELECT * FROM report_schedules
      ORDER BY created_at DESC
    `;

    const result = await this.clickhouseClient.query({
      query,
      format: 'JSONEachRow'
    });

    const rows = await result.json();
    
    for (const row of rows) {
      const schedule: ReportSchedule = {
        id: row.id,
        templateId: row.template_id,
        name: row.name,
        parameters: JSON.parse(row.parameters),
        cronExpression: row.cron_expression,
        nextRunAt: new Date(row.next_run_at),
        lastRunAt: row.last_run_at ? new Date(row.last_run_at) : undefined,
        lastRunStatus: row.last_run_status,
        createdBy: row.created_by,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };

      this.startSchedule(schedule);
    }

    this.logger.info(`Loaded ${rows.length} report schedules`);
  }

  /**
   * 启动调度任务
   */
  private startSchedule(schedule: ReportSchedule): void {
    this.logger.info('Starting report schedule', { scheduleId: schedule.id, cron: schedule.cronExpression });

    // 创建 cron 任务
    const job = cron.schedule(schedule.cronExpression, async () => {
      await this.executeSchedule(schedule);
    });

    // 保存任务引用
    this.jobs.set(schedule.id, job);
  }

  /**
   * 执行调度任务
   */
  private async executeSchedule(schedule: ReportSchedule): Promise<void> {
    this.logger.info('Executing report schedule', { scheduleId: schedule.id });

    try {
      // 生成报表
      await this.generationService.generateReport(
        schedule.templateId,
        schedule.parameters,
        schedule.createdBy
      );

      // 更新调度任务状态（成功）
      await this.updateScheduleStatus(schedule.id, 'success');
      this.logger.info('Report schedule executed successfully', { scheduleId: schedule.id });
    } catch (error) {
      // 更新调度任务状态（失败）
      await this.updateScheduleStatus(schedule.id, 'failure');
      this.logger.error('Failed to execute report schedule', { scheduleId: schedule.id, error });
    }
  }

  /**
   * 更新调度任务状态
   */
  private async updateScheduleStatus(scheduleId: string, status: 'success' | 'failure'): Promise<void> {
    const query = `
      ALTER TABLE report_schedules UPDATE
        last_run_at = ?, 
        last_run_status = ?, 
        updated_at = ?
      WHERE id = ?
    `;

    const now = new Date();

    await this.clickhouseClient.execute({
      query,
      values: [
        now.toISOString(),
        status,
        now.toISOString(),
        scheduleId
      ]
    });
  }

  /**
   * 保存调度任务
   */
  private async saveSchedule(schedule: ReportSchedule): Promise<void> {
    const query = `
      INSERT INTO report_schedules 
      (id, template_id, name, parameters, cron_expression, next_run_at, last_run_at, last_run_status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.clickhouseClient.execute({
      query,
      values: [
        schedule.id,
        schedule.templateId,
        schedule.name,
        JSON.stringify(schedule.parameters),
        schedule.cronExpression,
        schedule.nextRunAt.toISOString(),
        schedule.lastRunAt?.toISOString() || null,
        schedule.lastRunStatus,
        schedule.createdBy,
        schedule.createdAt.toISOString(),
        schedule.updatedAt.toISOString()
      ]
    });
  }

  /**
   * 删除调度任务
   */
  public async deleteSchedule(id: string): Promise<boolean> {
    this.logger.info('Deleting report schedule', { scheduleId: id });

    // 停止调度任务
    const job = this.jobs.get(id);
    if (job) {
      job.stop();
      this.jobs.delete(id);
    }

    // 删除调度任务记录
    const query = `
      ALTER TABLE report_schedules DELETE WHERE id = ?
    `;

    await this.clickhouseClient.execute({
      query,
      values: [id]
    });

    return true;
  }
}
```

## 6. 报表API接口

### 6.1 Fastify路由配置

```typescript
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ReportTemplateService } from './services/ReportTemplateService';
import { ReportGenerationService } from './services/ReportGenerationService';
import { ReportSchedulingService } from './services/ReportSchedulingService';
import { container } from 'tsyringe';
import { z } from 'zod';

// 报表模板参数验证
const reportTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['cognitive', 'user', 'system']),
  dataSource: z.object({
    type: z.enum(['clickhouse', 'postgresql', 'api']),
    query: z.string().min(1),
    parameters: z.array(z.object({
      name: z.string().min(1),
      type: z.enum(['string', 'number', 'date', 'enum']),
      defaultValue: z.any().optional(),
      required: z.boolean(),
      options: z.array(z.string()).optional()
    }))
  }),
  visualization: z.object({
    type: z.enum(['table', 'line', 'bar', 'pie', 'scatter']),
    config: z.any()
  })
});

// 报表生成参数验证
const reportGenerationSchema = z.object({
  templateId: z.string().uuid(),
  parameters: z.record(z.any())
});

// 调度任务参数验证
const reportScheduleSchema = z.object({
  templateId: z.string().uuid(),
  name: z.string().min(1),
  parameters: z.record(z.any()),
  cronExpression: z.string().min(1)
});

export async function reportRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // 解析依赖
  const templateService = container.resolve(ReportTemplateService);
  const generationService = container.resolve(ReportGenerationService);
  const schedulingService = container.resolve(ReportSchedulingService);

  // 报表模板路由
  fastify.post('/api/reports/templates', async (request, reply) => {
    const body = reportTemplateSchema.parse(request.body);
    const userId = request.user?.id || 'system';
    
    const template = await templateService.createTemplate({
      ...body,
      createdBy: userId
    });
    
    return reply.code(201).send(template);
  });

  fastify.get('/api/reports/templates', async (request, reply) => {
    const { type, createdBy } = request.query as any;
    
    const templates = await templateService.getTemplates({
      type: type as any,
      createdBy
    });
    
    return reply.send(templates);
  });

  fastify.get('/api/reports/templates/:id', async (request, reply) => {
    const { id } = request.params as any;
    
    const template = await templateService.getTemplateById(id);
    if (!template) {
      return reply.code(404).send({ error: 'Report template not found' });
    }
    
    return reply.send(template);
  });

  fastify.put('/api/reports/templates/:id', async (request, reply) => {
    const { id } = request.params as any;
    const body = reportTemplateSchema.partial().parse(request.body);
    
    const template = await templateService.updateTemplate(id, body);
    if (!template) {
      return reply.code(404).send({ error: 'Report template not found' });
    }
    
    return reply.send(template);
  });

  fastify.delete('/api/reports/templates/:id', async (request, reply) => {
    const { id } = request.params as any;
    
    await templateService.deleteTemplate(id);
    
    return reply.code(204).send();
  });

  // 报表生成路由
  fastify.post('/api/reports/generate', async (request, reply) => {
    const body = reportGenerationSchema.parse(request.body);
    const userId = request.user?.id || 'system';
    
    const report = await generationService.generateReport(
      body.templateId,
      body.parameters,
      userId
    );
    
    return reply.code(201).send(report);
  });

  fastify.get('/api/reports/instances/:id', async (request, reply) => {
    const { id } = request.params as any;
    
    const report = await generationService.getReportInstance(id);
    if (!report) {
      return reply.code(404).send({ error: 'Report instance not found' });
    }
    
    return reply.send(report);
  });

  // 报表调度路由
  fastify.post('/api/reports/schedules', async (request, reply) => {
    const body = reportScheduleSchema.parse(request.body);
    const userId = request.user?.id || 'system';
    
    const schedule = await schedulingService.createSchedule({
      ...body,
      createdBy: userId,
      nextRunAt: new Date() // 初始化为当前时间，实际应该根据cron表达式计算
    });
    
    return reply.code(201).send(schedule);
  });

  fastify.delete('/api/reports/schedules/:id', async (request, reply) => {
    const { id } = request.params as any;
    
    await schedulingService.deleteSchedule(id);
    
    return reply.code(204).send();
  });
}
```

## 7. 报表可视化组件

### 7.1 前端组件设计

```typescript
import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { ReportInstance } from './types';

interface ReportVisualizationProps {
  report: ReportInstance;
}

export const ReportVisualization: React.FC<ReportVisualizationProps> = ({ report }) => {
  const [chart, setChart] = useState<Chart | null>(null);
  const chartRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!report.data || !chartRef.current) return;

    // 销毁现有图表
    if (chart) {
      chart.destroy();
    }

    // 根据报表类型创建不同的图表
    switch (report.visualization?.type) {
      case 'line':
        createLineChart();
        break;
      case 'bar':
        createBarChart();
        break;
      case 'pie':
        createPieChart();
        break;
      case 'table':
        // 表格渲染逻辑
        break;
      default:
        console.error('Unsupported visualization type:', report.visualization?.type);
    }

    function createLineChart() {
      const ctx = chartRef.current!.getContext('2d');
      if (!ctx) return;

      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: report.data.map((item: any) => item.label),
          datasets: [{
            label: report.name,
            data: report.data.map((item: any) => item.value),
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      setChart(newChart);
    }

    function createBarChart() {
      const ctx = chartRef.current!.getContext('2d');
      if (!ctx) return;

      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: report.data.map((item: any) => item.label),
          datasets: [{
            label: report.name,
            data: report.data.map((item: any) => item.value),
            backgroundColor: '#FF6384'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      setChart(newChart);
    }

    function createPieChart() {
      const ctx = chartRef.current!.getContext('2d');
      if (!ctx) return;

      const newChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: report.data.map((item: any) => item.label),
          datasets: [{
            data: report.data.map((item: any) => item.value),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF'
            ]
          }]
        },
        options: {
          responsive: true
        }
      });

      setChart(newChart);
    }

    // 清理函数
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [report, chart]);

  return (
    <div className="report-visualization">
      <h3>{report.name}</h3>
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
      {report.status === 'failed' && (
        <div className="error-message">
          Failed to generate report: {report.data?.error}
        </div>
      )}
    </div>
  );
};
```

## 8. 部署和维护

### 8.1 Docker Compose 配置

```yaml
version: '3.8'

services:
  # 报表服务
  report-service:
    image: cognitive-assistant-report-service:latest
    container_name: report-service
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - CLICKHOUSE_URL=http://clickhouse:8123
      - CLICKHOUSE_USERNAME=default
      - CLICKHOUSE_PASSWORD=password
      - JWT_SECRET=your-jwt-secret
      - LOG_LEVEL=info
    depends_on:
      - clickhouse
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

volumes:
  clickhouse-data:
  clickhouse-config:
  clickhouse-logs:
```

### 8.2 部署脚本

```bash
#!/bin/bash

# 报表服务部署脚本

echo "Deploying report service..."

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
docker build -t cognitive-assistant-report-service:latest .

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
docker exec -it report-service npm run migrate

# 检查 API 状态
echo "Checking API status..."
curl -s http://localhost:3001/health

if [ $? -eq 0 ]; then
    echo "Report service deployed successfully!"
else
    echo "Failed to deploy report service. Please check the logs."
    docker-compose logs
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
      "path": "./logs/report-service.log",
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

### 9.1 单元测试

```typescript
import { ReportTemplateService } from './services/ReportTemplateService';
import { container } from 'tsyringe';
import { Logger } from '../../src/infrastructure/logging/Logger';

describe('ReportTemplateService', () => {
  let templateService: ReportTemplateService;
  let logger: Logger;

  beforeEach(() => {
    // 重置容器
    container.clearInstances();
    
    // 解析依赖
    logger = container.resolve(Logger);
    templateService = container.resolve(ReportTemplateService);
  });

  describe('createTemplate', () => {
    it('should create a new report template', async () => {
      // 模拟 ClickHouse 执行
      const executeSpy = jest.spyOn(templateService['clickhouseClient'], 'execute').mockResolvedValue({});

      const template = {
        name: 'Test Template',
        description: 'Test Description',
        type: 'cognitive' as const,
        dataSource: {
          type: 'clickhouse' as const,
          query: 'SELECT * FROM cognitive_model_analysis',
          parameters: []
        },
        visualization: {
          type: 'line' as const,
          config: {}
        },
        createdBy: 'test-user'
      };

      const result = await templateService.createTemplate(template);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(template.name);
      expect(executeSpy).toHaveBeenCalled();
    });
  });

  describe('getTemplates', () => {
    it('should return report templates with filter', async () => {
      // 模拟 ClickHouse 查询结果
      const mockTemplates = [
        {
          id: '123',
          name: 'Test Template',
          description: 'Test Description',
          type: 'cognitive',
          data_source: JSON.stringify({ type: 'clickhouse', query: 'SELECT * FROM test' }),
          visualization: JSON.stringify({ type: 'line', config: {} }),
          created_by: 'test-user',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z'
        }
      ];

      const querySpy = jest.spyOn(templateService['clickhouseClient'], 'query').mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockTemplates)
      } as any);

      const result = await templateService.getTemplates({ type: 'cognitive' });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('cognitive');
      expect(querySpy).toHaveBeenCalled();
    });
  });
});
```

### 9.2 集成测试

```typescript
import request from 'supertest';
import { FastifyInstance } from 'fastify';
import { buildFastifyApp } from '../src/app';

describe('Report API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildFastifyApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/reports/templates', () => {
    it('should create a new report template', async () => {
      const response = await request(app.server)
        .post('/api/reports/templates')
        .send({
          name: 'Integration Test Template',
          description: 'Integration Test Description',
          type: 'cognitive',
          dataSource: {
            type: 'clickhouse',
            query: 'SELECT * FROM cognitive_model_analysis',
            parameters: []
          },
          visualization: {
            type: 'line',
            config: {}
          }
        })
        .set('Authorization', 'Bearer test-token')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Integration Test Template');
    });
  });

  describe('GET /api/reports/templates', () => {
    it('should return report templates', async () => {
      const response = await request(app.server)
        .get('/api/reports/templates')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/reports/generate', () => {
    it('should generate a report', async () => {
      // 先创建一个报表模板
      const templateResponse = await request(app.server)
        .post('/api/reports/templates')
        .send({
          name: 'Test Template for Generation',
          description: 'Test Description',
          type: 'cognitive',
          dataSource: {
            type: 'clickhouse',
            query: 'SELECT * FROM cognitive_model_analysis',
            parameters: []
          },
          visualization: {
            type: 'line',
            config: {}
          }
        })
        .set('Authorization', 'Bearer test-token')
        .expect(201);

      // 生成报表
      const response = await request(app.server)
        .post('/api/reports/generate')
        .send({
          templateId: templateResponse.body.id,
          parameters: {}
        })
        .set('Authorization', 'Bearer test-token')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('generating');
    });
  });
});
```

## 10. 总结

本文档详细描述了AI认知辅助系统报表模型的实现代码，包括：

1. 报表数据模型设计，包括报表模板、报表实例和调度任务的数据结构
2. ClickHouse分析数据库的表结构设计和视图定义
3. 报表服务的TypeScript实现，包括模板管理、报表生成和调度功能
4. Fastify API接口定义和路由配置
5. 前端可视化组件设计
6. Docker部署配置和脚本
7. 测试和验证方案

通过实现报表模型，可以为AI认知辅助系统提供强大的数据分析和可视化能力，帮助用户更好地理解和分析认知模型的结构和变化，从而提供更有价值的认知洞察和反馈。