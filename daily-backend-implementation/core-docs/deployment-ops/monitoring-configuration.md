# 监控配置文档

## 1. 监控系统架构

监控系统采用 Prometheus + Alertmanager + Grafana 的架构，实现对系统的实时监控和告警。

## 2. Prometheus 配置

### 2.1 基本配置

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerting_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'cognitive_service'
    static_configs:
      - targets: ['localhost:3000']
```

### 2.2 告警规则配置

```yaml
groups:
- name: cognitive_service_alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }}% for the last 5 minutes"

  - alert: HighLatency
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High latency detected"
      description: "95th percentile latency is {{ $value }}s for the last 5 minutes"
```

## 3. Alertmanager 配置

### 3.1 基本配置

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'email-notifications'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'

receivers:
- name: 'email-notifications'
  email_configs:
  - to: 'admin@example.com'
    send_resolved: true

- name: 'slack-notifications'
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK_URL'
    channel: '#alerts'
    send_resolved: true
    username: 'Alertmanager'
    icon_emoji: ':warning:'
    title: '{{ .Status | toUpper }}: {{ .GroupLabels.SortedPairs.Values | join " " }}'
    text: '{{ range .Alerts }}{{ .Annotations.Summary }}: {{ .Annotations.Description }}{{ end }}'

- name: 'critical-alerts'
  email_configs:
  - to: 'oncall@example.com'
    send_resolved: true
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK_URL'
    channel: '#critical-alerts'
    send_resolved: true
    username: 'Alertmanager'
    icon_emoji: ':critical:'
    title: '{{ .Status | toUpper }}: {{ .GroupLabels.SortedPairs.Values | join " " }}'
    text: '{{ range .Alerts }}{{ .Annotations.Summary }}: {{ .Annotations.Description }}{{ end }}'
```

## 4. Grafana 配置

### 4.1 数据源配置

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    url: http://localhost:9090
    access: proxy
    isDefault: true
```

### 4.2 仪表板配置

Grafana 仪表板可以通过 UI 导出为 JSON 文件，然后导入到其他 Grafana 实例中。

## 5. 部署与维护

### 5.1 部署步骤

1. 安装 Prometheus、Alertmanager 和 Grafana
2. 配置 Prometheus 采集目标和告警规则
3. 配置 Alertmanager 接收者和路由规则
4. 配置 Grafana 数据源和仪表板
5. 启动所有服务并验证监控系统正常运行

### 5.2 维护建议

- 定期检查监控系统的健康状态
- 根据系统负载调整采集间隔
- 定期更新告警规则以适应系统变化
- 备份监控配置和历史数据

## 6. 故障排除

### 6.1 常见问题

- **Prometheus 无法采集数据**：检查网络连接和目标服务状态
- **告警未触发**：检查告警规则配置和数据采集情况
- **告警未发送**：检查 Alertmanager 配置和接收者设置
- **Grafana 无数据**：检查数据源配置和网络连接

### 6.2 日志和调试

- Prometheus 日志：`/var/log/prometheus/prometheus.log`
- Alertmanager 日志：`/var/log/alertmanager/alertmanager.log`
- Grafana 日志：`/var/log/grafana/grafana.log`