# Alertmanager 配置技术实现

## 1. 技术选型

- **Alertmanager 版本**：0.25.0
- **部署方式**：容器化部署
- **配置管理**：ConfigMap（Kubernetes）或配置文件

## 2. 核心配置

### 2.1 全局配置

```yaml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts'
  smtp_auth_password: 'password'
  smtp_require_tls: true
```

### 2.2 路由配置

```yaml
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default-receiver'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
  - match:
      service: cognitive-api
    receiver: 'api-alerts'
```

### 2.3 接收者配置

```yaml
receivers:
# 默认接收者
- name: 'default-receiver'
  email_configs:
  - to: 'alerts@example.com'
    send_resolved: true

# 关键告警接收者
- name: 'critical-alerts'
  email_configs:
  - to: 'oncall@example.com'
    send_resolved: true
  # 添加Slack通知
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK_URL'
    channel: '#critical-alerts'
    send_resolved: true
    text: |-
      *Alert:* {{ .CommonAnnotations.summary }}
      *Description:* {{ .CommonAnnotations.description }}
      *Severity:* {{ .CommonLabels.severity }}
      *Status:* {{ .Status }}
      *Service:* {{ .CommonLabels.service }}
      *Instance:* {{ .CommonLabels.instance }}
      *URL:* {{ .CommonAnnotations.runbook_url }}

# API 服务告警接收者
- name: 'api-alerts'
  email_configs:
  - to: 'api-team@example.com'
    send_resolved: true
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK_URL'
    channel: '#api-alerts'
    send_resolved: true
    text: |-
      *Alert:* {{ .CommonAnnotations.summary }}
      *Description:* {{ .CommonAnnotations.description }}
      *Severity:* {{ .CommonLabels.severity }}
      *Status:* {{ .Status }}
      *Service:* {{ .CommonLabels.service }}
      *Instance:* {{ .CommonLabels.instance }}
```

## 3. 抑制规则

```yaml
inhibit_rules:
  # 当有更严重的告警时，抑制较低级别的告警
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster', 'service']

  # 当服务不可用时，抑制该服务的其他告警
  - source_match:
      alertname: 'ServiceDown'
    target_match_re:
      alertname: '.*'
    equal: ['cluster', 'service']
```

## 4. 集群配置

### 4.1 高可用部署

```yaml
alertmanager:
  replicas: 3
  cluster:
    peer_timeout: 15s
    port: 9094
```

### 4.2 配置同步

使用 ConfigMap 或配置文件同步机制确保所有 Alertmanager 实例使用相同的配置。

## 5. 告警模板

### 5.1 自定义模板

创建自定义告警模板，提高告警信息的可读性：

```go
{{ define "slack.default.text" }}
{{ range .Alerts }}
*Alert:* {{ .Annotations.summary }}
*Description:* {{ .Annotations.description }}
*Severity:* {{ .Labels.severity }}
*Status:* {{ .Status }}
*Service:* {{ .Labels.service }}
*Instance:* {{ .Labels.instance }}
*Time:* {{ .StartsAt.Format "2006-01-02 15:04:05" }}
{{ if .Annotations.runbook_url }}
*Runbook:* {{ .Annotations.runbook_url }}
{{ end }}
{{ end }}
{{ end }}
```

## 6. 部署与集成

### 6.1 Kubernetes 部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: alertmanager
  namespace: monitoring
spec:
  replicas: 3
  selector:
    matchLabels:
      app: alertmanager
  template:
    metadata:
      labels:
        app: alertmanager
    spec:
      containers:
      - name: alertmanager
        image: prom/alertmanager:v0.25.0
        ports:
        - containerPort: 9093
        volumeMounts:
        - name: config
          mountPath: /etc/alertmanager
        - name: templates
          mountPath: /etc/alertmanager/templates
      volumes:
      - name: config
        configMap:
          name: alertmanager-config
      - name: templates
        configMap:
          name: alertmanager-templates
```

### 6.2 Prometheus 集成

在 Prometheus 配置中添加 Alertmanager 地址：

```yaml
alerting:
  alertmanagers:
  - static_configs:
    - targets: ['alertmanager:9093']
```

## 7. 监控与维护

### 7.1 自监控

Alertmanager 暴露自身的指标，可以通过 Prometheus 采集：

```yaml
scrape_configs:
  - job_name: 'alertmanager'
    static_configs:
    - targets: ['alertmanager:9093']
```

### 7.2 常见问题

- **告警未发送**：检查网络连接、接收者配置和路由规则
- **告警重复**：检查 group_by 配置和 repeat_interval 设置
- **告警风暴**：使用抑制规则和分组配置减少告警数量

## 8. 最佳实践

1. **分层告警**：根据告警级别设置不同的接收者和通知方式
2. **告警分组**：使用 group_by 合理分组告警，减少告警噪音
3. **抑制规则**：使用抑制规则避免告警风暴
4. **自定义模板**：使用自定义模板提高告警信息的可读性
5. **高可用部署**：部署多个 Alertmanager 实例确保可靠性
6. **配置管理**：使用版本控制管理配置文件，便于回滚和审计

## 9. 参考资源

- [Alertmanager 官方文档](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Prometheus 告警最佳实践](https://prometheus.io/docs/alerting/latest/best_practices/)
- [Kubernetes 监控指南](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-metrics-pipeline/)