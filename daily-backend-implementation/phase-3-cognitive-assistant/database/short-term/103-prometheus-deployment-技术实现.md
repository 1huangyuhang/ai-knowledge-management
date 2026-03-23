# 103-Prometheus部署代码实现

## 1. Prometheus概述

Prometheus是一个开源的监控和告警系统，专为云原生环境设计。它使用时间序列数据库存储监控数据，通过HTTP协议采集指标，并提供强大的查询语言PromQL用于数据分析和可视化。

### 1.1 Prometheus核心功能

- 多维数据模型（使用指标名和键值对标签）
- 灵活的查询语言（PromQL）
- 不依赖分布式存储，单个服务器节点即可工作
- 基于HTTP的拉取方式采集时序数据
- 支持通过中间网关推送时序数据
- 支持服务发现和静态配置
- 多种可视化和仪表盘支持（Grafana）
- 精确的告警规则
- 高效的存储策略

## 2. Prometheus安装方式

### 2.1 二进制安装

#### 2.1.1 下载Prometheus

```bash
# 创建安装目录
mkdir -p /opt/prometheus
cd /opt/prometheus

# 下载Prometheus二进制包
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz

# 解压二进制包
tar -xzf prometheus-2.45.0.linux-amd64.tar.gz
mv prometheus-2.45.0.linux-amd64/* .
rm -rf prometheus-2.45.0.linux-amd64 prometheus-2.45.0.linux-amd64.tar.gz
```

#### 2.1.2 创建Prometheus用户

```bash
# 创建prometheus用户和组
useradd -r -M -s /bin/false prometheus

# 设置文件权限
chown -R prometheus:prometheus /opt/prometheus
chmod -R 755 /opt/prometheus
```

### 2.2 Docker部署

```bash
# 拉取Prometheus镜像
docker pull prom/prometheus:v2.45.0

# 运行Prometheus容器
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /opt/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  -v /opt/prometheus/data:/prometheus \
  prom/prometheus:v2.45.0 \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.console.templates=/etc/prometheus/consoles \
  --web.enable-lifecycle
```

## 3. Prometheus配置文件设计

### 3.1 主配置文件（prometheus.yml）

```yaml
# 全局配置
global:
  scrape_interval:     15s  # 全局抓取间隔，默认15秒
  evaluation_interval: 15s  # 全局规则评估间隔，默认15秒
  external_labels:      # 外部标签，用于联邦集群
    monitor: 'cognitive-assistant-monitor'

# Alertmanager配置
alerting:
  alertmanagers:
  - static_configs:
    - targets: ['localhost:9093']

# 规则文件配置
rule_files:
  - "rules/*.yml"  # 告警规则文件目录

# 抓取配置
scrape_configs:
  # Prometheus自身监控
  - job_name: 'prometheus'
    static_configs:
    - targets: ['localhost:9090']

  # 服务器监控（node_exporter）
  - job_name: 'node'
    static_configs:
    - targets: ['localhost:9100']  # node_exporter监听地址
    metrics_path: /metrics
    scrape_interval: 10s
    scrape_timeout: 5s

  # PostgreSQL数据库监控（postgres_exporter）
  - job_name: 'postgres'
    static_configs:
    - targets: ['localhost:9187']  # postgres_exporter监听地址
    metrics_path: /metrics
    scrape_interval: 10s
    scrape_timeout: 5s
    params:
      format: ['prometheus']

  # 业务应用监控
  - job_name: 'cognitive-assistant-app'
    static_configs:
    - targets: ['localhost:3000']  # 应用程序监控端点
    metrics_path: /metrics
    scrape_interval: 10s
    scrape_timeout: 5s

  # Redis监控（可选，如需监控Redis）
  # - job_name: 'redis'
  #   static_configs:
  #   - targets: ['localhost:9121']  # redis_exporter监听地址
  #   metrics_path: /metrics
  #   scrape_interval: 10s
  #   scrape_timeout: 5s
```

### 3.2 告警规则文件（rules/alerts.yml）

```yaml
groups:
- name: server-alerts
  rules:
  # CPU使用率过高告警
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage on {{ $labels.instance }}"
      description: "CPU usage is {{ $value }}% for more than 5 minutes"

  # 内存使用率过高告警
  - alert: HighMemoryUsage
    expr: 100 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100) > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage on {{ $labels.instance }}"
      description: "Memory usage is {{ $value }}% for more than 5 minutes"

  # 磁盘空间不足告警
  - alert: DiskSpaceRunningOut
    expr: 100 - (node_filesystem_free_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100) > 90
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Disk space running out on {{ $labels.instance }}"
      description: "Disk usage is {{ $value }}% for more than 5 minutes"

- name: postgres-alerts
  rules:
  # 数据库连接数过高告警
  - alert: PostgresTooManyConnections
    expr: sum by(instance) (pg_stat_database_numbackends) / pg_settings_max_connections * 100 > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Too many connections on {{ $labels.instance }}"
      description: "Connection usage is {{ $value }}% for more than 5 minutes"

  # 慢查询过多告警
  - alert: PostgresTooManySlowQueries
    expr: increase(pg_stat_database_xact_rollback[5m]) > 10
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Too many slow queries on {{ $labels.instance }}"
      description: "{{ $value }} slow queries detected in the last 5 minutes"

  # 复制延迟过大告警
  - alert: PostgresReplicationLag
    expr: pg_stat_replication_lag_seconds > 30
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Replication lag on {{ $labels.instance }}"
      description: "Replication lag is {{ $value }} seconds for more than 5 minutes"
```

## 3. 系统服务配置

### 3.1 Systemd服务配置

```bash
# 创建systemd服务文件
cat > /etc/systemd/system/prometheus.service << EOF
[Unit]
Description=Prometheus Monitoring System
Documentation=https://prometheus.io/docs/
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=prometheus
Group=prometheus
ExecStart=/opt/prometheus/prometheus \
  --config.file=/opt/prometheus/prometheus.yml \
  --storage.tsdb.path=/opt/prometheus/data \
  --storage.tsdb.retention.time=15d \
  --web.console.templates=/opt/prometheus/consoles \
  --web.console.libraries=/opt/prometheus/console_libraries \
  --web.listen-address=0.0.0.0:9090 \
  --web.enable-lifecycle

ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

### 3.2 启动和管理Prometheus服务

```bash
# 重载systemd配置
systemctl daemon-reload

# 启动Prometheus服务
systemctl start prometheus

# 设置Prometheus服务开机自启
systemctl enable prometheus

# 查看Prometheus服务状态
systemctl status prometheus

# 查看Prometheus服务日志
journalctl -u prometheus -f

# 重启Prometheus服务
systemctl restart prometheus

# 停止Prometheus服务
systemctl stop prometheus
```

## 4. Docker Compose部署

### 4.1 Docker Compose配置文件

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.45.0
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./rules:/etc/prometheus/rules
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.listen-address=0.0.0.0:9090'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  node_exporter:
    image: prom/node-exporter:v1.6.0
    container_name: node_exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

  postgres_exporter:
    image: prometheuscommunity/postgres-exporter:v0.15.0
    container_name: postgres_exporter
    restart: unless-stopped
    ports:
      - "9187:9187"
    environment:
      - DATA_SOURCE_NAME=postgresql://postgres:password@localhost:5432/cognitive_assistant?sslmode=disable
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
    driver: local
```

### 4.2 Docker Compose启动脚本

```bash
#!/bin/bash

# 创建必要的目录
mkdir -p /opt/monitoring/prometheus/rules

# 复制配置文件
cp prometheus.yml /opt/monitoring/prometheus/
cp -r rules/ /opt/monitoring/prometheus/

# 启动Docker Compose服务
docker-compose -f docker-compose.yml up -d

# 查看服务状态
docker-compose -f docker-compose.yml ps

# 查看日志
docker-compose -f docker-compose.yml logs -f
```

## 5. Prometheus API使用

### 5.1 重新加载配置

```bash
# 使用API重新加载配置
curl -X POST http://localhost:9090/-/reload
```

### 5.2 查询指标

```bash
# 查询CPU使用率
curl -g 'http://localhost:9090/api/v1/query?query=100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'

# 查询内存使用率
curl -g 'http://localhost:9090/api/v1/query?query=100 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100)'

# 查询数据库连接数
curl -g 'http://localhost:9090/api/v1/query?query=pg_stat_database_numbackends'
```

## 6. Prometheus存储优化

### 6.1 调整存储保留时间

```yaml
# 在prometheus.yml中添加或修改以下配置
global:
  # 其他配置...

# 或在启动参数中指定
--storage.tsdb.retention.time=15d  # 保留15天数据
--storage.tsdb.retention.size=100GB  # 保留100GB数据（优先使用）
```

### 6.2 调整压缩配置

```yaml
# 在prometheus.yml中添加或修改以下配置
tsdb:
  wal:
    # WAL段大小，默认64MB
    segment-size: 64MB
    # WAL压缩，默认false
    compression: true
  # 块压缩，默认snappy
  block-compression: snappy
```

## 7. Prometheus升级

### 7.1 二进制升级

```bash
# 停止Prometheus服务
systemctl stop prometheus

# 备份数据和配置
cp -r /opt/prometheus/data /opt/prometheus/data_backup_$(date +%Y%m%d)
cp /opt/prometheus/prometheus.yml /opt/prometheus/prometheus.yml_backup_$(date +%Y%m%d)

# 下载新版本Prometheus
cd /opt/prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.46.0/prometheus-2.46.0.linux-amd64.tar.gz

# 解压新版本
tar -xzf prometheus-2.46.0.linux-amd64.tar.gz

# 替换二进制文件
cp prometheus-2.46.0.linux-amd64/prometheus /opt/prometheus/
cp prometheus-2.46.0.linux-amd64/promtool /opt/prometheus/

# 更新控制台和库文件
rm -rf /opt/prometheus/consoles
rm -rf /opt/prometheus/console_libraries
cp -r prometheus-2.46.0.linux-amd64/consoles /opt/prometheus/
cp -r prometheus-2.46.0.linux-amd64/console_libraries /opt/prometheus/

# 清理临时文件
rm -rf prometheus-2.46.0.linux-amd64 prometheus-2.46.0.linux-amd64.tar.gz

# 启动Prometheus服务
systemctl start prometheus

# 验证升级
systemctl status prometheus
/opt/prometheus/prometheus --version
```

### 7.2 Docker升级

```bash
# 停止并移除旧容器
docker-compose -f docker-compose.yml down

# 拉取新版本镜像
docker pull prom/prometheus:v2.46.0

# 更新docker-compose.yml中的镜像版本
# 将image: prom/prometheus:v2.45.0改为image: prom/prometheus:v2.46.0

# 启动新容器
docker-compose -f docker-compose.yml up -d

# 验证升级
docker-compose -f docker-compose.yml logs -f prometheus
```

## 8. Prometheus监控和告警

### 8.1 监控Prometheus自身

Prometheus会自动监控自身的运行状态，主要指标包括：

| 指标名称 | 描述 |
|----------|------|
| prometheus_tsdb_head_samples_appended_total | 每秒添加到TSDB头部的样本数 |
| prometheus_tsdb_head_series | 当前存储的时间序列数 |
| prometheus_tsdb_compactions_total | 完成的压缩次数 |
| prometheus_tsdb_wal_fsync_duration_seconds | WAL文件同步持续时间 |
| prometheus_http_requests_total | HTTP请求总数 |
| prometheus_http_request_duration_seconds | HTTP请求持续时间 |

### 8.2 Prometheus告警规则

在rules/alerts.yml中添加以下规则，用于监控Prometheus自身：

```yaml
groups:
- name: prometheus-alerts
  rules:
  # Prometheus目标抓取失败告警
  - alert: PrometheusTargetDown
    expr: up == 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Prometheus target down {{ $labels.instance }}"
      description: "Target {{ $labels.instance }} of job {{ $labels.job }} has been down for more than 5 minutes."

  # Prometheus样本接收率低告警
  - alert: PrometheusSampleLimit
    expr: rate(prometheus_tsdb_head_samples_appended_total[5m]) < 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Prometheus sample rate low"
      description: "Prometheus is receiving fewer than 1 sample per second for 5 minutes."

  # Prometheus存储容量不足告警
  - alert: PrometheusStorageSpaceLow
    expr: (prometheus_tsdb_storage_blocks_bytes / 1024 / 1024 / 1024) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Prometheus storage space low"
      description: "Prometheus storage is using more than 80GB."
```

## 9. 健康检查脚本

### 9.1 Prometheus健康检查

```bash
#!/bin/bash

# Prometheus健康检查脚本

PROMETHEUS_URL="http://localhost:9090"

# 检查Prometheus是否可访问
if curl -s -f "$PROMETHEUS_URL/-/healthy" > /dev/null; then
  echo "Prometheus is healthy"
  exit 0
else
  echo "Prometheus is unhealthy"
  exit 1
fi
```

### 9.2 监控目标健康检查

```bash
#!/bin/bash

# 监控目标健康检查脚本

PROMETHEUS_URL="http://localhost:9090"

# 获取所有监控目标
TARGETS=$(curl -s "$PROMETHEUS_URL/api/v1/targets" | jq -r '.data.activeTargets[] | \(.labels.job + " " + .labels.instance + " " + .health)')

echo "监控目标健康状态："
echo "=================="

# 打印健康状态
echo "$TARGETS"

# 检查是否有不健康的目标
UNHEALTHY=$(echo "$TARGETS" | grep -v "up" | wc -l)

if [ $UNHEALTHY -gt 0 ]; then
  echo "\n发现 $UNHEALTHY 个不健康的监控目标"
  exit 1
else
  echo "\n所有监控目标均健康"
  exit 0
fi
```

## 10. 常见问题排查

### 10.1 监控目标抓取失败

```bash
# 检查监控目标是否可达
telnet localhost 9100

# 检查监控目标的metrics端点
curl http://localhost:9100/metrics

# 检查Prometheus日志
systemctl status prometheus
journalctl -u prometheus -f

# 检查Prometheus配置
grep -A 10 "job_name: 'node'" /opt/prometheus/prometheus.yml
```

### 10.2 告警规则不生效

```bash
# 检查告警规则文件是否正确加载
curl -s http://localhost:9090/api/v1/rules | jq '.data.groups[] | \(.name + " " + (.rules | length | tostring) + " rules")'

# 检查告警规则语法
/opt/prometheus/promtool check rules /opt/prometheus/rules/alerts.yml

# 检查Alertmanager是否正常运行
systemctl status alertmanager
curl http://localhost:9093/-/healthy
```

### 10.3 Prometheus性能问题

```bash
# 检查Prometheus内存使用情况
top -p $(pgrep prometheus)

# 检查时间序列数量
curl -s http://localhost:9090/api/v1/query?query=prometheus_tsdb_head_series | jq '.data.result[0].value[1]'

# 检查每秒样本数
curl -s http://localhost:9090/api/v1/query?query=rate(prometheus_tsdb_head_samples_appended_total[5m]) | jq '.data.result[0].value[1]'

# 优化建议：
# 1. 增加Prometheus服务器的内存和CPU资源
# 2. 调整存储保留时间，减少数据量
# 3. 优化告警规则，减少不必要的计算
# 4. 增加抓取间隔，减少样本生成速率
# 5. 使用relabel_configs过滤不必要的标签和时间序列
```

## 11. 总结

本文档详细介绍了Prometheus的部署和配置，包括二进制安装、Docker部署、系统服务配置、告警规则设计、存储优化、升级和维护等方面。通过按照本文档的步骤进行部署和配置，可以建立一个完善的Prometheus监控系统，用于监控认知辅助系统的各个组件，及时发现和解决问题，确保系统的稳定运行。

Prometheus是一个强大的监控工具，但其真正的价值在于与Grafana等可视化工具的结合使用。在后续的文档中，我们将介绍如何使用Grafana创建直观、美观的监控仪表盘，以及如何配置Alertmanager进行告警管理。