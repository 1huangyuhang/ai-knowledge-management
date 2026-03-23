# 83-监控告警技术实现文档

## 1. 架构设计

### 1.1 分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│ Presentation Layer (API层)                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ MonitoringController (监控管理API控制器)                      │ │
│ │ AlertController (告警管理API控制器)                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Application Layer (应用层)                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ MonitoringService (监控服务)                                 │ │
│ │ ├── MetricCollectionService (指标收集服务)                  │ │
│ │ ├── AlertService (告警服务)                                 │ │
│ │ ├── AlertRuleService (告警规则服务)                         │ │
│ │ ├── AlertNotificationService (告警通知服务)                 │ │
│ │ └── DashboardService (仪表盘服务)                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Domain Layer (领域层)                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Monitoring (监控领域模型)                                     │ │
│ │ ├── Metric (监控指标)                                        │ │
│ │ ├── Alert (告警)                                            │ │
│ │ ├── AlertRule (告警规则)                                     │ │
│ │ ├── AlertNotification (告警通知)                             │ │
│ │ └── Dashboard (仪表盘)                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Infrastructure Layer (基础设施层)                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ MonitoringRepository (监控仓库)                               │ │
│ │ ├── PrometheusRepository (Prometheus存储实现)                │ │
│ │ ├── InfluxDBRepository (InfluxDB存储实现)                  │ │
│ │ └── AlertRepository (告警存储实现)                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 核心依赖关系

- **Prometheus**: 监控指标收集和存储
- **Grafana**: 监控数据可视化
- **Alertmanager**: 告警管理和通知
- **PromClient**: Node.js应用指标暴露
- **Winston**: 日志记录
- **Loki**: 日志聚合
- **Jaeger**: 分布式追踪
- **Slack**: 告警通知
- **Email**: 告警通知
- **Webhook**: 自定义告警通知

## 2. 核心组件

### 2.1 MonitoringService

```typescript
// src/application/monitoring/MonitoringService.ts
export interface MonitoringService {
  /**
   * 获取监控指标
   * @param query 指标查询语句
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param step 时间步长
   * @returns 监控指标数据
   */
  getMetrics(
    query: string,
    startTime: Date,
    endTime: Date,
    step: number
  ): Promise<MetricData[]>;

  /**
   * 获取所有告警规则
   * @returns 告警规则列表
   */
  getAlertRules(): Promise<AlertRule[]>;

  /**
   * 创建告警规则
   * @param rule 告警规则
   * @returns 创建的告警规则
   */
  createAlertRule(rule: AlertRuleCreateDto): Promise<AlertRule>;

  /**
   * 更新告警规则
   * @param id 告警规则ID
   * @param rule 告警规则更新内容
   * @returns 更新后的告警规则
   */
  updateAlertRule(id: string, rule: AlertRuleUpdateDto): Promise<AlertRule>;

  /**
   * 删除告警规则
   * @param id 告警规则ID
   * @returns 删除结果
   */
  deleteAlertRule(id: string): Promise<boolean>;

  /**
   * 获取告警历史
   * @param limit 限制数量
   * @returns 告警历史列表
   */
  getAlertHistory(limit?: number): Promise<Alert[]>;

  /**
   * 触发测试告警
   * @param ruleId 告警规则ID
   * @returns 触发结果
   */
  triggerTestAlert(ruleId: string): Promise<boolean>;

  /**
   * 静音告警
   * @param alertId 告警ID
   * @param duration 静音时长 (分钟)
   * @returns 静音结果
   */
  muteAlert(alertId: string, duration: number): Promise<boolean>;

  /**
   * 解决告警
   * @param alertId 告警ID
   * @returns 解决结果
   */
  resolveAlert(alertId: string): Promise<boolean>;
}
```

### 2.2 MetricCollectionService

```typescript
// src/application/monitoring/MetricCollectionService.ts
export interface MetricCollectionService {
  /**
   * 注册指标
   * @param metric 监控指标
   * @returns 注册结果
   */
  registerMetric(metric: Metric): Promise<boolean>;

  /**
   * 收集指标
   * @param metricName 指标名称
   * @param value 指标值
   * @param labels 指标标签
   * @returns 收集结果
   */
  collectMetric(metricName: string, value: number, labels?: Record<string, string>): Promise<boolean>;

  /**
   * 获取指标列表
   * @returns 指标列表
   */
  getMetrics(): Promise<Metric[]>;

  /**
   * 移除指标
   * @param metricName 指标名称
   * @returns 移除结果
   */
  removeMetric(metricName: string): Promise<boolean>;
}
```

### 2.3 AlertService

```typescript
// src/application/monitoring/AlertService.ts
export interface AlertService {
  /**
   * 检查告警规则
   * @returns 检查结果
   */
  checkAlertRules(): Promise<Alert[]>;

  /**
   * 获取当前活跃告警
   * @returns 活跃告警列表
   */
  getActiveAlerts(): Promise<Alert[]>;

  /**
   * 根据ID获取告警
   * @param id 告警ID
   * @returns 告警信息
   */
  getAlertById(id: string): Promise<Alert | null>;

  /**
   * 根据规则ID获取告警
   * @param ruleId 规则ID
   * @returns 告警列表
   */
  getAlertsByRuleId(ruleId: string): Promise<Alert[]>;

  /**
   * 处理告警通知
   * @param alert 告警信息
   * @returns 处理结果
   */
  processAlertNotification(alert: Alert): Promise<boolean>;
}
```

## 3. 数据模型

### 3.1 Metric (监控指标)

```typescript
// src/domain/monitoring/Metric.ts
export interface Metric {
  /** 指标名称 */
  name: string;
  /** 指标描述 */
  description: string;
  /** 指标类型 */
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  /** 指标标签 */
  labels: string[];
  /** 指标单位 */
  unit?: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}
```

### 3.2 AlertRule (告警规则)

```typescript
// src/domain/monitoring/AlertRule.ts
export interface AlertRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 指标查询语句 */
  query: string;
  /** 告警级别 */
  severity: 'info' | 'warning' | 'critical';
  /** 持续时间 (秒) */
  for: number;
  /** 告警标签 */
  labels: Record<string, string>;
  /** 告警注释 */
  annotations: Record<string, string>;
  /** 是否启用 */
  enabled: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 通知渠道 */
  notificationChannels: AlertNotificationChannel[];
}
```

### 3.3 Alert (告警)

```typescript
// src/domain/monitoring/Alert.ts
export interface Alert {
  /** 告警ID */
  id: string;
  /** 告警规则ID */
  ruleId: string;
  /** 告警名称 */
  name: string;
  /** 告警级别 */
  severity: 'info' | 'warning' | 'critical';
  /** 告警状态 */
  status: 'firing' | 'resolved' | 'muted';
  /** 告警开始时间 */
  startsAt: Date;
  /** 告警结束时间 */
  endsAt?: Date;
  /** 告警标签 */
  labels: Record<string, string>;
  /** 告警注释 */
  annotations: Record<string, string>;
  /** 告警值 */
  value: number;
  /** 通知状态 */
  notificationStatus: 'pending' | 'sent' | 'failed';
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}
```

### 3.4 AlertNotification (告警通知)

```typescript
// src/domain/monitoring/AlertNotification.ts
export interface AlertNotification {
  /** 通知ID */
  id: string;
  /** 告警ID */
  alertId: string;
  /** 通知渠道 */
  channel: AlertNotificationChannel;
  /** 通知内容 */
  content: string;
  /** 通知状态 */
  status: 'pending' | 'sent' | 'failed';
  /** 重试次数 */
  retryCount: number;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}
```

### 3.5 AlertNotificationChannel (告警通知渠道)

```typescript
// src/domain/monitoring/AlertNotificationChannel.ts
export type AlertNotificationChannel = 
  | { type: 'email'; recipients: string[] }
  | { type: 'slack'; webhookUrl: string; channel?: string }
  | { type: 'webhook'; url: string; headers?: Record<string, string> }
  | { type: 'sms'; phoneNumbers: string[] }
  | { type: 'pagerduty'; integrationKey: string };
```

## 4. API设计

### 4.1 监控管理API

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/monitoring/metrics | 获取监控指标列表 | - | { metrics: Metric[] } |
| POST | /api/monitoring/metrics | 注册新指标 | MetricCreateDto | { metric: Metric } |
| GET | /api/monitoring/metrics/:name | 获取特定指标 | - | { metric: Metric } |
| DELETE | /api/monitoring/metrics/:name | 移除指标 | - | { success: boolean } |
| POST | /api/monitoring/metrics/collect | 收集指标数据 | { name: string, value: number, labels?: Record<string, string> } | { success: boolean } |
| GET | /api/monitoring/dashboards | 获取仪表盘列表 | - | { dashboards: Dashboard[] } |
| POST | /api/monitoring/dashboards | 创建仪表盘 | DashboardCreateDto | { dashboard: Dashboard } |
| GET | /api/monitoring/dashboards/:id | 获取特定仪表盘 | - | { dashboard: Dashboard } |
| PUT | /api/monitoring/dashboards/:id | 更新仪表盘 | DashboardUpdateDto | { dashboard: Dashboard } |
| DELETE | /api/monitoring/dashboards/:id | 删除仪表盘 | - | { success: boolean } |

### 4.2 告警管理API

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/alerts/rules | 获取告警规则列表 | - | { rules: AlertRule[] } |
| POST | /api/alerts/rules | 创建告警规则 | AlertRuleCreateDto | { rule: AlertRule } |
| GET | /api/alerts/rules/:id | 获取特定告警规则 | - | { rule: AlertRule } |
| PUT | /api/alerts/rules/:id | 更新告警规则 | AlertRuleUpdateDto | { rule: AlertRule } |
| DELETE | /api/alerts/rules/:id | 删除告警规则 | - | { success: boolean } |
| POST | /api/alerts/rules/:id/enable | 启用告警规则 | - | { success: boolean } |
| POST | /api/alerts/rules/:id/disable | 禁用告警规则 | - | { success: boolean } |
| GET | /api/alerts | 获取告警列表 | status, limit | { alerts: Alert[] } |
| GET | /api/alerts/active | 获取活跃告警 | - | { alerts: Alert[] } |
| GET | /api/alerts/:id | 获取特定告警 | - | { alert: Alert } |
| POST | /api/alerts/:id/mute | 静音告警 | { duration: number } | { success: boolean } |
| POST | /api/alerts/:id/resolve | 解决告警 | - | { success: boolean } |
| POST | /api/alerts/rules/:id/test | 测试告警规则 | - | { success: boolean, alert: Alert } |
| GET | /api/alerts/history | 获取告警历史 | limit | { history: Alert[] } |
| GET | /api/alerts/notifications | 获取告警通知 | limit | { notifications: AlertNotification[] } |

## 5. 核心业务流程

### 5.1 指标收集流程

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ 应用程序           │    │ MetricCollectionService │    │ Prometheus         │
└───────────┬─────────┘    └───────────┬─────────┘    └───────────┬─────────┘
            │                          │                          │
            │ 1. 调用collectMetric     │                          │
            ├──────────────────────────►                          │
            │                          │ 2. 验证指标数据         │
            │                          │                          │
            │                          │ 3. 更新指标值           │
            │                          │                          │
            │                          │ 4. 暴露指标给Prometheus │
            │                          ├──────────────────────────►
            │                          │                          │
            │                          │ 5. Prometheus拉取指标   │
            │                          ◄──────────────────────────┘
            │                          │                          │
            │ 6. 返回收集结果          │                          │
            ◄──────────────────────────┘                          │
┌───────────┴─────────┐                                           │
│ 应用程序继续执行     │                                           │
└─────────────────────┘                                           │
```

### 5.2 告警触发流程

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ Prometheus         │    │ AlertService       │    │ AlertNotificationService │
└───────────┬─────────┘    └───────────┬─────────┘    └───────────┬─────────┘
            │                          │                          │
            │ 1. 执行告警规则查询     │                          │
            ├──────────────────────────►                          │
            │                          │ 2. 检查指标是否满足告警条件 │
            │                          │                          │
            │                          │ 3. 生成告警事件         │
            │                          │                          │
            │                          │ 4. 保存告警到数据库     │
            │                          │                          │
            │                          │ 5. 调用告警通知服务     │
            │                          ├──────────────────────────►
            │                          │                          │
            │                          │ 6. 发送告警通知         │
            │                          │                          │
            │                          │ 7. 返回通知结果         │
            │                          ◄──────────────────────────┘
            │                          │                          │
            │                          │ 8. 更新告警状态         │
            │                          │                          │
            │ 9. 返回告警结果          │                          │
            ◄──────────────────────────┘                          │
┌───────────┴─────────┐                                           │
│ Prometheus记录告警   │                                           │
└─────────────────────┘                                           │
```

## 6. 技术实现

### 6.1 监控服务实现

```typescript
// src/application/monitoring/MonitoringServiceImpl.ts
import { MonitoringService } from './MonitoringService';
import { MonitoringRepository } from '../../infrastructure/monitoring/MonitoringRepository';
import { AlertService } from './AlertService';
import { AlertRuleService } from './AlertRuleService';
import { MetricData } from '../../domain/monitoring/MetricData';
import { AlertRule } from '../../domain/monitoring/AlertRule';
import { Alert } from '../../domain/monitoring/Alert';
import { AlertRuleCreateDto } from '../../presentation/dto/AlertRuleCreateDto';
import { AlertRuleUpdateDto } from '../../presentation/dto/AlertRuleUpdateDto';

export class MonitoringServiceImpl implements MonitoringService {
  constructor(
    private monitoringRepository: MonitoringRepository,
    private alertService: AlertService,
    private alertRuleService: AlertRuleService
  ) {}

  async getMetrics(
    query: string,
    startTime: Date,
    endTime: Date,
    step: number
  ): Promise<MetricData[]> {
    return this.monitoringRepository.queryMetrics(query, startTime, endTime, step);
  }

  async getAlertRules(): Promise<AlertRule[]> {
    return this.alertRuleService.getAlertRules();
  }

  async createAlertRule(rule: AlertRuleCreateDto): Promise<AlertRule> {
    return this.alertRuleService.createAlertRule(rule);
  }

  async updateAlertRule(id: string, rule: AlertRuleUpdateDto): Promise<AlertRule> {
    return this.alertRuleService.updateAlertRule(id, rule);
  }

  async deleteAlertRule(id: string): Promise<boolean> {
    return this.alertRuleService.deleteAlertRule(id);
  }

  async getAlertHistory(limit: number = 100): Promise<Alert[]> {
    return this.alertService.getAlertHistory(limit);
  }

  async triggerTestAlert(ruleId: string): Promise<boolean> {
    return this.alertService.triggerTestAlert(ruleId);
  }

  async muteAlert(alertId: string, duration: number): Promise<boolean> {
    return this.alertService.muteAlert(alertId, duration);
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    return this.alertService.resolveAlert(alertId);
  }
}
```

### 6.2 指标收集服务实现

```typescript
// src/application/monitoring/MetricCollectionServiceImpl.ts
import { MetricCollectionService } from './MetricCollectionService';
import { prometheusClient } from '../../infrastructure/monitoring/prometheusClient';
import { Metric } from '../../domain/monitoring/Metric';
import { Counter, Gauge, Histogram, Summary } from 'prom-client';

export class MetricCollectionServiceImpl implements MetricCollectionService {
  private metrics: Map<string, any> = new Map();

  async registerMetric(metric: Metric): Promise<boolean> {
    try {
      let promMetric;

      switch (metric.type) {
        case 'counter':
          promMetric = new Counter({
            name: metric.name,
            help: metric.description,
            labelNames: metric.labels
          });
          break;
        case 'gauge':
          promMetric = new Gauge({
            name: metric.name,
            help: metric.description,
            labelNames: metric.labels
          });
          break;
        case 'histogram':
          promMetric = new Histogram({
            name: metric.name,
            help: metric.description,
            labelNames: metric.labels
          });
          break;
        case 'summary':
          promMetric = new Summary({
            name: metric.name,
            help: metric.description,
            labelNames: metric.labels
          });
          break;
        default:
          return false;
      }

      this.metrics.set(metric.name, promMetric);
      return true;
    } catch (error) {
      console.error(`Failed to register metric ${metric.name}:`, error);
      return false;
    }
  }

  async collectMetric(metricName: string, value: number, labels?: Record<string, string>): Promise<boolean> {
    try {
      const metric = this.metrics.get(metricName);
      if (!metric) {
        return false;
      }

      switch (metric.type) {
        case 'Counter':
          metric.inc(labels, value);
          break;
        case 'Gauge':
          metric.set(labels, value);
          break;
        case 'Histogram':
          metric.observe(labels, value);
          break;
        case 'Summary':
          metric.observe(labels, value);
          break;
        default:
          return false;
      }

      return true;
    } catch (error) {
      console.error(`Failed to collect metric ${metricName}:`, error);
      return false;
    }
  }

  async getMetrics(): Promise<Metric[]> {
    // 实现获取指标列表的逻辑
    // ...
    return [];
  }

  async removeMetric(metricName: string): Promise<boolean> {
    try {
      this.metrics.delete(metricName);
      return true;
    } catch (error) {
      console.error(`Failed to remove metric ${metricName}:`, error);
      return false;
    }
  }
}
```

### 6.3 告警通知服务实现

```typescript
// src/application/monitoring/AlertNotificationServiceImpl.ts
import { AlertNotificationService } from './AlertNotificationService';
import { Alert } from '../../domain/monitoring/Alert';
import { AlertNotificationChannel } from '../../domain/monitoring/AlertNotificationChannel';
import * as nodemailer from 'nodemailer';
import * as axios from 'axios';

export class AlertNotificationServiceImpl implements AlertNotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // 初始化邮件传输器
    this.emailTransporter = nodemailer.createTransport({
      // 邮件配置
    });
  }

  async sendNotification(alert: Alert, channels: AlertNotificationChannel[]): Promise<boolean> {
    try {
      // 并行发送所有通知
      await Promise.all(
        channels.map(async (channel) => {
          switch (channel.type) {
            case 'email':
              await this.sendEmailNotification(alert, channel);
              break;
            case 'slack':
              await this.sendSlackNotification(alert, channel);
              break;
            case 'webhook':
              await this.sendWebhookNotification(alert, channel);
              break;
            case 'sms':
              await this.sendSmsNotification(alert, channel);
              break;
            case 'pagerduty':
              await this.sendPagerDutyNotification(alert, channel);
              break;
          }
        })
      );

      return true;
    } catch (error) {
      console.error('Failed to send notifications:', error);
      return false;
    }
  }

  private async sendEmailNotification(alert: Alert, channel: { type: 'email'; recipients: string[] }): Promise<void> {
    // 实现邮件通知逻辑
    // ...
  }

  private async sendSlackNotification(alert: Alert, channel: { type: 'slack'; webhookUrl: string; channel?: string }): Promise<void> {
    // 实现Slack通知逻辑
    const message = {
      channel: channel.channel,
      text: `🚨 告警通知: ${alert.name}`,
      attachments: [
        {
          color: alert.severity === 'critical' ? '#ff0000' : alert.severity === 'warning' ? '#ffcc00' : '#00ff00',
          title: alert.name,
          fields: [
            { title: '级别', value: alert.severity, short: true },
            { title: '状态', value: alert.status, short: true },
            { title: '值', value: alert.value.toString(), short: true },
            { title: '时间', value: alert.startsAt.toISOString(), short: true }
          ],
          footer: '监控告警系统'
        }
      ]
    };

    await axios.post(channel.webhookUrl, message);
  }

  private async sendWebhookNotification(alert: Alert, channel: { type: 'webhook'; url: string; headers?: Record<string, string> }): Promise<void> {
    // 实现Webhook通知逻辑
    await axios.post(channel.url, alert, { headers: channel.headers });
  }

  private async sendSmsNotification(alert: Alert, channel: { type: 'sms'; phoneNumbers: string[] }): Promise<void> {
    // 实现SMS通知逻辑
    // ...
  }

  private async sendPagerDutyNotification(alert: Alert, channel: { type: 'pagerduty'; integrationKey: string }): Promise<void> {
    // 实现PagerDuty通知逻辑
    // ...
  }
}
```

## 7. 测试策略

### 7.1 单元测试

| 模块 | 测试重点 | 测试框架 |
|------|----------|----------|
| MonitoringService | 监控数据获取、告警规则管理 | Jest |
| MetricCollectionService | 指标注册、收集、移除逻辑 | Jest |
| AlertService | 告警触发、检查、处理逻辑 | Jest |
| AlertRuleService | 告警规则CRUD操作 | Jest |
| AlertNotificationService | 告警通知发送逻辑 | Jest + Mock |

### 7.2 集成测试

| 测试场景 | 测试重点 | 测试框架 |
|----------|----------|----------|
| 完整监控流程 | 从指标收集到告警触发的完整流程 | Jest |
| 告警规则验证 | 告警规则是否能正确触发告警 | Jest |
| 告警通知验证 | 告警通知是否能正确发送 | Jest |
| Prometheus集成 | 与Prometheus的集成是否正常 | Jest |
| 仪表盘功能 | 仪表盘的创建、更新、删除功能 | Jest |

### 7.3 端到端测试

| 测试场景 | 测试重点 | 测试框架 |
|----------|----------|----------|
| 告警完整流程 | 从指标异常到收到告警通知的完整流程 | Cypress |
| 管理后台监控功能 | 管理后台的监控管理功能 | Cypress |
| 告警规则管理 | 告警规则的创建、更新、删除功能 | Cypress |
| 告警历史查询 | 告警历史的查询和过滤功能 | Cypress |

## 8. 部署与集成

### 8.1 监控系统部署

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.47.0
    container_name: cognitive-assistant-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    restart: unless-stopped
    networks:
      - cognitive-assistant-network

  grafana:
    image: grafana/grafana:10.2.0
    container_name: cognitive-assistant-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    depends_on:
      - prometheus
      - loki
    restart: unless-stopped
    networks:
      - cognitive-assistant-network

  alertmanager:
    image: prom/alertmanager:v0.25.0
    container_name: cognitive-assistant-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    restart: unless-stopped
    networks:
      - cognitive-assistant-network

  loki:
    image: grafana/loki:2.9.0
    container_name: cognitive-assistant-loki
    ports:
      - "3100:3100"
    volumes:
      - ./loki/loki.yml:/etc/loki/loki.yml
      - loki-data:/loki
    restart: unless-stopped
    networks:
      - cognitive-assistant-network

  promtail:
    image: grafana/promtail:2.9.0
    container_name: cognitive-assistant-promtail
    volumes:
      - ./promtail/promtail.yml:/etc/promtail/config.yml
      - ./logs:/var/log/app
    restart: unless-stopped
    networks:
      - cognitive-assistant-network

volumes:
  prometheus-data:
  grafana-data:
  loki-data:

networks:
  cognitive-assistant-network:
    driver: bridge
```

### 8.2 应用集成

```typescript
// src/infrastructure/monitoring/prometheusClient.ts
import client from 'prom-client';

// 初始化默认指标
client.collectDefaultMetrics();

// 创建自定义指标
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDurationHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const activeConnectionsGauge = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const errorCounter = new client.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'service']
});

export const prometheusClient = {
  client,
  httpRequestCounter,
  httpRequestDurationHistogram,
  activeConnectionsGauge,
  errorCounter
};
```

### 8.3 Express中间件集成

```typescript
// src/infrastructure/middleware/monitoringMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { prometheusClient } from '../monitoring/prometheusClient';

export const monitoringMiddleware = {
  /**
   * HTTP请求监控中间件
   */
  httpMonitoring: (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, originalUrl } = req;

    // 增加活跃连接数
    prometheusClient.activeConnectionsGauge.inc();

    // 监听响应完成事件
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const status = res.statusCode.toString();

      // 更新指标
      prometheusClient.httpRequestCounter.inc({ method, route: originalUrl, status });
      prometheusClient.httpRequestDurationHistogram.observe({ method, route: originalUrl, status }, duration);
      prometheusClient.activeConnectionsGauge.dec();
    });

    next();
  },

  /**
   * 错误监控中间件
   */
  errorMonitoring: (error: Error, req: Request, res: Response, next: NextFunction) => {
    // 记录错误指标
    prometheusClient.errorCounter.inc({ type: error.name, service: 'api' });
    next(error);
  },

  /**
   * 指标暴露中间件
   */
  exposeMetrics: async (req: Request, res: Response) => {
    res.set('Content-Type', prometheusClient.client.register.contentType);
    res.end(await prometheusClient.client.register.metrics());
  }
};
```

## 9. 性能优化

### 9.1 指标收集优化

```typescript
// src/application/monitoring/MetricCollectionOptimizer.ts
export class MetricCollectionOptimizer {
  private readonly batchSize = 100;
  private metricBatch: Array<{ name: string; value: number; labels?: Record<string, string> }> = [];
  private flushTimeout: NodeJS.Timeout | null = null;

  /**
   * 批量收集指标，减少频繁IO操作
   * @param metricName 指标名称
   * @param value 指标值
   * @param labels 指标标签
   */
  batchCollectMetric(metricName: string, value: number, labels?: Record<string, string>): void {
    this.metricBatch.push({ name: metricName, value, labels });

    // 如果批量大小达到阈值，立即刷新
    if (this.metricBatch.length >= this.batchSize) {
      this.flushMetrics();
    } else if (!this.flushTimeout) {
      // 设置超时自动刷新
      this.flushTimeout = setTimeout(() => this.flushMetrics(), 1000);
    }
  }

  /**
   * 刷新指标批处理
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricBatch.length === 0) return;

    try {
      // 处理指标批处理
      // ...
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    } finally {
      // 清空批处理
      this.metricBatch = [];
      // 清除超时
      if (this.flushTimeout) {
        clearTimeout(this.flushTimeout);
        this.flushTimeout = null;
      }
    }
  }
}
```

### 9.2 告警规则优化

```yaml
# prometheus/rules/optimized-alerts.yml
groups:
- name: optimized-alerts
  rules:
  # 使用for子句减少告警抖动
  - alert: HighErrorRate
    expr: sum(rate(errors_total[5m])) by (service) > 0.5
    for: 2m  # 持续2分钟才触发告警
    labels:
      severity: warning
    annotations:
      summary: "High error rate for {{ $labels.service }}"
      description: "Error rate is {{ $value }} errors per second for {{ $labels.service }}"

  # 使用rate函数计算速率，避免瞬时值影响
  - alert: HighRequestLatency
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)) > 1
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "High request latency for {{ $labels.route }}"
      description: "95th percentile latency is {{ $value }} seconds for {{ $labels.route }}"

  # 使用sum by聚合，减少告警数量
  - alert: HighCPUUsage
    expr: sum(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance) / sum(rate(node_cpu_seconds_total[5m])) by (instance) > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage on {{ $labels.instance }}"
      description: "CPU usage is {{ $value | humanizePercentage }} for {{ $labels.instance }}"
```

## 10. 监控与日志

### 10.1 监控系统自身监控

```yaml
# prometheus/rules/self-monitoring.yml
groups:
- name: self-monitoring
  rules:
  - alert: PrometheusDown
    expr: up{job="prometheus"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Prometheus is down"
      description: "Prometheus has been down for more than 1 minute"

  - alert: GrafanaDown
    expr: up{job="grafana"} == 0
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "Grafana is down"
      description: "Grafana has been down for more than 1 minute"

  - alert: AlertmanagerDown
    expr: up{job="alertmanager"} == 0
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "Alertmanager is down"
      description: "Alertmanager has been down for more than 1 minute"

  - alert: HighAlertmanagerNotificationsFailed
    expr: rate(alertmanager_notifications_failed_total[5m]) > 0
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "Alertmanager notifications are failing"
      description: "Alertmanager has failed to send {{ $value }} notifications per second"
```

### 10.2 日志记录

```typescript
// src/infrastructure/logger/monitoringLogger.ts
export interface MonitoringLogger {
  /**
   * 记录指标收集事件
   * @param metricName 指标名称
   * @param value 指标值
   * @param labels 指标标签
   */
  logMetricCollection(metricName: string, value: number, labels?: Record<string, string>): void;

  /**
   * 记录告警触发事件
   * @param alert 告警信息
   */
  logAlertTrigger(alert: Alert): void;

  /**
   * 记录告警通知事件
   * @param notification 告警通知
   * @param status 通知状态
   */
  logAlertNotification(notification: AlertNotification, status: 'success' | 'failed'): void;

  /**
   * 记录告警规则变更事件
   * @param rule 告警规则
   * @param action 变更动作
   */
  logAlertRuleChange(rule: AlertRule, action: 'create' | 'update' | 'delete'): void;
}
```

## 11. 未来发展方向

### 11.1 增强功能

1. **智能告警降噪**: 使用机器学习算法减少误报和重复告警
2. **根因分析**: 自动分析告警的根本原因
3. **预测性告警**: 基于历史数据预测可能的告警
4. **告警聚合**: 自动聚合相关告警，减少告警数量
5. **告警升级策略**: 实现告警升级机制，确保告警被及时处理
6. **多租户支持**: 支持多租户环境下的监控隔离
7. **分布式追踪集成**: 与Jaeger、Zipkin等分布式追踪系统集成
8. **日志关联**: 实现告警与日志的关联分析
9. **自定义仪表盘**: 支持用户自定义监控仪表盘
10. **移动端支持**: 提供移动端告警通知和监控查看

### 11.2 性能优化

1. **指标采样**: 对高频指标进行采样，减少存储和处理压力
2. **分布式存储**: 支持分布式存储监控数据，提高扩展性
3. **查询优化**: 优化监控数据查询，提高查询性能
4. **缓存机制**: 实现监控数据缓存，减少数据库压力
5. **异步处理**: 异步处理告警通知，提高系统响应性

### 11.3 扩展性

1. **插件系统**: 支持通过插件扩展监控指标和告警规则
2. **API扩展**: 提供开放API，支持与第三方系统集成
3. **云原生支持**: 优化设计，支持在云原生环境中部署和扩展
4. **多集群支持**: 支持监控多个Kubernetes集群
5. **边缘监控**: 支持边缘计算环境的监控

## 12. 代码组织

```
src/
├── application/
│   └── monitoring/
│       ├── MonitoringService.ts
│       ├── MonitoringServiceImpl.ts
│       ├── MetricCollectionService.ts
│       ├── MetricCollectionServiceImpl.ts
│       ├── AlertService.ts
│       ├── AlertServiceImpl.ts
│       ├── AlertRuleService.ts
│       ├── AlertRuleServiceImpl.ts
│       ├── AlertNotificationService.ts
│       ├── AlertNotificationServiceImpl.ts
│       └── DashboardService.ts
│       └── DashboardServiceImpl.ts
├── domain/
│   └── monitoring/
│       ├── Metric.ts
│       ├── Alert.ts
│       ├── AlertRule.ts
│       ├── AlertNotification.ts
│       ├── AlertNotificationChannel.ts
│       └── Dashboard.ts
├── infrastructure/
│   ├── monitoring/
│   │   ├── prometheusClient.ts
│   │   ├── MonitoringRepository.ts
│   │   ├── PrometheusRepository.ts
│   │   ├── AlertRepository.ts
│   │   └── AlertNotificationRepository.ts
│   ├── middleware/
│   │   └── monitoringMiddleware.ts
│   ├── logger/
│   │   └── monitoringLogger.ts
│   └── config/
│       └── monitoringConfig.ts
├── presentation/
│   ├── controller/
│   │   ├── MonitoringController.ts
│   │   └── AlertController.ts
│   └── dto/
│       ├── MetricCreateDto.ts
│       ├── AlertRuleCreateDto.ts
│       ├── AlertRuleUpdateDto.ts
│       └── DashboardCreateDto.ts
└── utils/
    └── monitoring/
        ├── MetricFormatter.ts
        ├── AlertFormatter.ts
        └── DashboardUtils.ts
```

## 13. 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 核心框架 | TypeScript | 5.x | 类型安全的JavaScript |
| 监控系统 | Prometheus | 2.47.x | 指标收集和存储 |
| 可视化 | Grafana | 10.2.x | 监控数据可视化 |
| 告警管理 | Alertmanager | 0.25.x | 告警管理和通知 |
| 日志聚合 | Loki | 2.9.x | 日志聚合 |
| 日志收集 | Promtail | 2.9.x | 日志收集 |
| 指标客户端 | prom-client | 14.x | Node.js应用指标暴露 |
| HTTP客户端 | axios | 1.x | HTTP请求 |
| 邮件发送 | nodemailer | 6.x | 邮件通知 |
| 单元测试 | Jest | 29.x | 单元测试框架 |
| API测试 | Supertest | 6.x | API集成测试 |
| E2E测试 | Cypress | 13.x | 端到端测试 |
| 日志 | Winston | 3.x | 日志记录 |

## 14. 最佳实践

1. **监控关键指标**: 只监控对业务有意义的关键指标，避免监控过多无关指标
2. **设置合理的告警阈值**: 根据业务需求设置合理的告警阈值，避免误报和漏报
3. **使用多级告警**: 根据告警的严重程度设置不同的告警级别
4. **实现告警通知**: 确保告警能够及时通知到相关人员
5. **定期审查告警规则**: 定期审查和优化告警规则，减少误报
6. **实现告警历史记录**: 记录所有告警历史，便于分析和审计
7. **监控系统自身**: 监控监控系统本身，确保其正常运行
8. **使用可视化仪表盘**: 创建直观的可视化仪表盘，便于查看监控数据
9. **实现日志关联**: 将告警与日志关联，便于故障排查
10. **定期进行演练**: 定期进行告警演练，确保告警机制正常工作

## 15. 总结

监控告警系统是现代应用运维的重要组成部分，它能够帮助团队及时发现和处理系统问题，提高系统的可靠性和可用性。本技术实现文档详细介绍了基于Prometheus和Grafana的监控告警方案，包括监控指标收集、告警规则管理、告警通知、仪表盘管理等核心功能。

该实现采用了分层架构，确保了系统的可维护性和可扩展性。通过集成Prometheus、Grafana、Alertmanager等成熟的监控工具，能够提供高效、可靠的监控告警服务。同时，该实现还支持多种告警通知渠道，包括邮件、Slack、Webhook等，确保告警能够及时通知到相关人员。

未来，该监控告警系统可以进一步增强智能告警降噪、根因分析、预测性告警等功能，以适应不断变化的业务需求和技术发展。通过持续优化和改进，监控告警系统将成为应用运维的重要支撑，帮助团队快速、可靠地发现和处理系统问题。