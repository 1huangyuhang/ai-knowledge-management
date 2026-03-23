# 104-PostgreSQL Exporter配置代码实现

## 1. PostgreSQL Exporter概述

PostgreSQL Exporter是一个用于监控PostgreSQL数据库的Prometheus exporter，它可以收集PostgreSQL数据库的各种指标，如连接数、查询性能、事务性能、缓存性能等，并将这些指标暴露给Prometheus进行采集。

### 1.1 PostgreSQL Exporter核心功能

- 支持PostgreSQL 9.4及以上版本
- 收集数据库级别的指标（连接数、查询性能、事务性能等）
- 收集表级别的指标（表大小、索引使用情况等）
- 支持自定义查询指标
- 支持多个数据库实例监控
- 支持TLS连接
- 支持身份验证

### 1.2 PostgreSQL Exporter架构

```
+---------------------+     +---------------------+     +---------------------+
|                     |     |                     |     |                     |
|  PostgreSQL Database|-----|  PostgreSQL Exporter |-----|    Prometheus       |
|                     |     |                     |     |                     |
+---------------------+     +---------------------+     +---------------------+
```

## 2. PostgreSQL Exporter安装方式

### 2.1 二进制安装

#### 2.1.1 下载PostgreSQL Exporter

```bash
# 创建安装目录
mkdir -p /opt/postgres_exporter
cd /opt/postgres_exporter

# 下载PostgreSQL Exporter二进制包
wget https://github.com/prometheus-community/postgres_exporter/releases/download/v0.15.0/postgres_exporter-0.15.0.linux-amd64.tar.gz

# 解压二进制包
tar -xzf postgres_exporter-0.15.0.linux-amd64.tar.gz
mv postgres_exporter-0.15.0.linux-amd64/* .
rm -rf postgres_exporter-0.15.0.linux-amd64 postgres_exporter-0.15.0.linux-amd64.tar.gz
```

#### 2.1.2 创建PostgreSQL Exporter用户

```bash
# 创建postgres_exporter用户和组
useradd -r -M -s /bin/false postgres_exporter

# 设置文件权限
chown -R postgres_exporter:postgres_exporter /opt/postgres_exporter
chmod -R 755 /opt/postgres_exporter
```

#### 2.1.3 创建数据库用户和权限

```bash
# 连接到PostgreSQL数据库
psql -h localhost -U postgres

# 创建监控用户
CREATE USER pg_exporter WITH PASSWORD 'pg_exporter_password';

# 授予监控权限
GRANT SELECT ON pg_stat_database TO pg_exporter;
GRANT SELECT ON pg_stat_bgwriter TO pg_exporter;
GRANT SELECT ON pg_stat_replication TO pg_exporter;
GRANT SELECT ON pg_stat_wal_receiver TO pg_exporter;
GRANT SELECT ON pg_stat_user_tables TO pg_exporter;
GRANT SELECT ON pg_stat_user_indexes TO pg_exporter;
GRANT SELECT ON pg_stat_user_indexes TO pg_exporter;
GRANT SELECT ON pg_stat_statements TO pg_exporter; -- 如果启用了pg_stat_statements扩展

# 退出PostgreSQL
\q
```

### 2.2 Docker部署

```bash
# 拉取PostgreSQL Exporter镜像
docker pull prometheuscommunity/postgres-exporter:v0.15.0

# 运行PostgreSQL Exporter容器
docker run -d \
  --name postgres_exporter \
  -p 9187:9187 \
  -e DATA_SOURCE_NAME="postgresql://pg_exporter:pg_exporter_password@localhost:5432/cognitive_assistant?sslmode=disable" \
  prometheuscommunity/postgres-exporter:v0.15.0
```

## 3. PostgreSQL Exporter配置文件设计

### 3.1 数据源配置

PostgreSQL Exporter支持多种方式配置数据源，包括环境变量、命令行参数和配置文件。

#### 3.1.1 环境变量配置

```bash
# 单个数据库实例
export DATA_SOURCE_NAME="postgresql://pg_exporter:pg_exporter_password@localhost:5432/cognitive_assistant?sslmode=disable"

# 多个数据库实例（使用逗号分隔）
export DATA_SOURCE_NAME="postgresql://pg_exporter:pg_exporter_password@localhost:5432/cognitive_assistant?sslmode=disable,postgresql://pg_exporter:pg_exporter_password@localhost:5433/another_database?sslmode=disable"
```

#### 3.1.2 命令行参数配置

```bash
# 单个数据库实例
/opt/postgres_exporter/postgres_exporter --web.listen-address=:9187 --web.telemetry-path=/metrics --log.level=info --log.format=logger:stderr --disable-default-metrics=false --disable-settings-metrics=false --extend.query-path=/opt/postgres_exporter/queries.yaml

# 多个数据库实例
/opt/postgres_exporter/postgres_exporter --web.listen-address=:9187 --web.telemetry-path=/metrics --log.level=info --log.format=logger:stderr --disable-default-metrics=false --disable-settings-metrics=false --extend.query-path=/opt/postgres_exporter/queries.yaml --collector.dbs="cognitive_assistant,another_database"
```

#### 3.1.3 配置文件配置

创建一个`queries.yaml`文件，用于定义自定义查询指标：

```yaml
global:
  scrape_timeout: 10s
  min_interval: 10s

queries:
  # 自定义查询：数据库连接数
  - name: pg_database_connections
    help: "Number of connections per database"
    query: "SELECT datname, numbackends FROM pg_stat_database"
    metrics:
      - datname: 
          usage: "LABEL"
          description: "Name of the database"
      - numbackends:
          usage: "GAUGE"
          description: "Number of connections to the database"

  # 自定义查询：表大小
  - name: pg_table_size_bytes
    help: "Size of tables in bytes"
    query: "SELECT schemaname, tablename, pg_table_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) AS size FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')"
    metrics:
      - schemaname:
          usage: "LABEL"
          description: "Schema name"
      - tablename:
          usage: "LABEL"
          description: "Table name"
      - size:
          usage: "GAUGE"
          description: "Size of the table in bytes"

  # 自定义查询：索引大小
  - name: pg_index_size_bytes
    help: "Size of indexes in bytes"
    query: "SELECT schemaname, tablename, indexname, pg_indexes_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) AS size FROM pg_indexes WHERE schemaname NOT IN ('pg_catalog', 'information_schema')"
    metrics:
      - schemaname:
          usage: "LABEL"
          description: "Schema name"
      - tablename:
          usage: "LABEL"
          description: "Table name"
      - indexname:
          usage: "LABEL"
          description: "Index name"
      - size:
          usage: "GAUGE"
          description: "Size of the index in bytes"
```

## 4. PostgreSQL Exporter系统服务配置

### 4.1 Systemd服务配置

```bash
# 创建systemd服务文件
cat > /etc/systemd/system/postgres_exporter.service << EOF
[Unit]
Description=PostgreSQL Exporter
Documentation=https://github.com/prometheus-community/postgres_exporter
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=postgres_exporter
Group=postgres_exporter
Environment="DATA_SOURCE_NAME=postgresql://pg_exporter:pg_exporter_password@localhost:5432/cognitive_assistant?sslmode=disable"
ExecStart=/opt/postgres_exporter/postgres_exporter \
  --web.listen-address=:9187 \
  --web.telemetry-path=/metrics \
  --log.level=info \
  --log.format=logger:stderr \
  --disable-default-metrics=false \
  --disable-settings-metrics=false \
  --extend.query-path=/opt/postgres_exporter/queries.yaml

ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

### 4.2 启动和管理PostgreSQL Exporter服务

```bash
# 重载systemd配置
systemctl daemon-reload

# 启动PostgreSQL Exporter服务
systemctl start postgres_exporter

# 设置PostgreSQL Exporter服务开机自启
systemctl enable postgres_exporter

# 查看PostgreSQL Exporter服务状态
systemctl status postgres_exporter

# 查看PostgreSQL Exporter服务日志
journalctl -u postgres_exporter -f

# 重启PostgreSQL Exporter服务
systemctl restart postgres_exporter

# 停止PostgreSQL Exporter服务
systemctl stop postgres_exporter
```

## 5. PostgreSQL Exporter Docker Compose部署

### 5.1 Docker Compose配置文件

```yaml
version: '3.8'

services:
  postgres_exporter:
    image: prometheuscommunity/postgres-exporter:v0.15.0
    container_name: postgres_exporter
    restart: unless-stopped
    ports:
      - "9187:9187"
    environment:
      - DATA_SOURCE_NAME=postgresql://pg_exporter:pg_exporter_password@postgres:5432/cognitive_assistant?sslmode=disable
    volumes:
      - ./queries.yaml:/etc/postgres_exporter/queries.yaml
    command:
      - '--web.listen-address=0.0.0.0:9187'
      - '--web.telemetry-path=/metrics'
      - '--log.level=info'
      - '--log.format=logger:stderr'
      - '--disable-default-metrics=false'
      - '--disable-settings-metrics=false'
      - '--extend.query-path=/etc/postgres_exporter/queries.yaml'
    networks:
      - monitoring
    depends_on:
      - postgres

  postgres:
    image: postgres:14-alpine
    container_name: postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=cognitive_assistant
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres_password
      - POSTGRES_HOST_AUTH_METHOD=scram-sha-256
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  postgres_data:
    driver: local
```

### 5.2 初始化脚本（init.sql）

```sql
-- 创建监控用户
CREATE USER pg_exporter WITH PASSWORD 'pg_exporter_password';

-- 授予监控权限
GRANT SELECT ON pg_stat_database TO pg_exporter;
GRANT SELECT ON pg_stat_bgwriter TO pg_exporter;
GRANT SELECT ON pg_stat_replication TO pg_exporter;
GRANT SELECT ON pg_stat_wal_receiver TO pg_exporter;
GRANT SELECT ON pg_stat_user_tables TO pg_exporter;
GRANT SELECT ON pg_stat_user_indexes TO pg_exporter;
GRANT SELECT ON pg_stat_user_indexes TO pg_exporter;

-- 启用扩展
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_buffercache;

-- 授予扩展权限
GRANT SELECT ON pg_stat_statements TO pg_exporter;
GRANT SELECT ON pg_buffercache TO pg_exporter;
```

### 5.3 Docker Compose启动脚本

```bash
#!/bin/bash

# 创建必要的目录
mkdir -p /opt/monitoring/postgres_exporter

# 复制配置文件
cp queries.yaml /opt/monitoring/postgres_exporter/
cp init.sql /opt/monitoring/postgres_exporter/
cp docker-compose.yml /opt/monitoring/postgres_exporter/

# 进入部署目录
cd /opt/monitoring/postgres_exporter

# 启动Docker Compose服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 6. PostgreSQL Exporter API使用

### 6.1 获取监控指标

```bash
# 获取所有监控指标
curl http://localhost:9187/metrics

# 获取特定指标
curl -s http://localhost:9187/metrics | grep pg_stat_database_numbackends
```

### 6.2 健康检查

```bash
# 健康检查
curl http://localhost:9187/-/healthy

# 就绪检查
curl http://localhost:9187/-/ready
```

## 7. PostgreSQL Exporter监控和告警

### 7.1 监控指标分类

PostgreSQL Exporter收集的指标可以分为以下几类：

| 指标类别 | 包含指标 |
|----------|----------|
| 数据库级别指标 | 连接数、查询性能、事务性能、缓存性能等 |
| 表级别指标 | 表大小、索引使用情况等 |
| 自定义查询指标 | 根据业务需求自定义的指标 |

### 7.2 关键监控指标

| 指标名称 | 指标描述 | 告警阈值 |
|----------|----------|----------|
| pg_stat_database_numbackends | 当前连接数 | ≥最大连接数*0.8持续5分钟 |
| pg_stat_database_xact_rollback | 事务回滚数 | ≥事务提交数*0.1持续5分钟 |
| pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read) | 缓存命中率 | ≤90%持续10分钟 |
| pg_stat_replication_lag_seconds | 主从复制延迟 | ≥30秒 |
| pg_stat_activity_count_locked | 锁等待连接数 | ≥5个/分钟 |

### 7.3 告警规则示例

在Prometheus的告警规则文件中添加以下规则，用于监控PostgreSQL数据库：

```yaml
groups:
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

  # 事务回滚率过高告警
  - alert: PostgresHighRollbackRate
    expr: sum by(instance) (pg_stat_database_xact_rollback) / sum by(instance) (pg_stat_database_xact_commit + pg_stat_database_xact_rollback) * 100 > 10
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High rollback rate on {{ $labels.instance }}"
      description: "Rollback rate is {{ $value }}% for more than 5 minutes"

  # 缓存命中率过低告警
  - alert: PostgresLowCacheHitRate
    expr: 100 * sum by(instance) (pg_stat_database_blks_hit) / sum by(instance) (pg_stat_database_blks_hit + pg_stat_database_blks_read) < 90
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Low cache hit rate on {{ $labels.instance }}"
      description: "Cache hit rate is {{ $value }}% for more than 10 minutes"

  # 主从复制延迟过大告警
  - alert: PostgresReplicationLag
    expr: pg_stat_replication_lag_seconds > 30
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Replication lag on {{ $labels.instance }}"
      description: "Replication lag is {{ $value }} seconds for more than 5 minutes"

  # 锁等待过多告警
  - alert: PostgresLockWaits
    expr: pg_stat_activity_count_locked > 5
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Lock waits on {{ $labels.instance }}"
      description: "There are {{ $value }} lock waits for more than 5 minutes"
```

## 8. PostgreSQL Exporter健康检查脚本

### 8.1 PostgreSQL Exporter健康检查

```bash
#!/bin/bash

# PostgreSQL Exporter健康检查脚本

POSTGRES_EXPORTER_URL="http://localhost:9187"

# 检查PostgreSQL Exporter是否可访问
if curl -s -f "$POSTGRES_EXPORTER_URL/-/healthy" > /dev/null; then
  echo "PostgreSQL Exporter is healthy"
  exit 0
else
  echo "PostgreSQL Exporter is unhealthy"
  exit 1
fi
```

### 8.2 PostgreSQL数据库连接检查

```bash
#!/bin/bash

# PostgreSQL数据库连接检查脚本

PG_USER="pg_exporter"
PG_PASSWORD="pg_exporter_password"
PG_HOST="localhost"
PG_PORT="5432"
PG_DATABASE="cognitive_assistant"

# 检查数据库连接
if psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DATABASE" -c "SELECT 1" > /dev/null 2>&1; then
  echo "PostgreSQL database connection is healthy"
  exit 0
else
  echo "PostgreSQL database connection is unhealthy"
  exit 1
fi
```

## 9. PostgreSQL Exporter常见问题排查

### 9.1 无法连接到PostgreSQL数据库

```bash
# 检查数据库连接参数
echo $DATA_SOURCE_NAME

# 检查数据库是否可访问
telnet localhost 5432

# 检查数据库用户权限
psql -h localhost -U postgres -c "\du pg_exporter"

# 检查PostgreSQL Exporter日志
systemctl status postgres_exporter
journalctl -u postgres_exporter -f
```

### 9.2 某些指标缺失

```bash
# 检查PostgreSQL Exporter配置
cat /opt/postgres_exporter/queries.yaml

# 检查PostgreSQL扩展是否启用
psql -h localhost -U postgres -c "SELECT * FROM pg_extension;"

# 检查PostgreSQL Exporter日志，查找错误信息
journalctl -u postgres_exporter -f

# 检查特定指标是否存在
curl -s http://localhost:9187/metrics | grep pg_stat_statements --color
```

### 9.3 PostgreSQL Exporter性能问题

```bash
# 检查PostgreSQL Exporter内存使用情况
top -p $(pgrep postgres_exporter)

# 检查PostgreSQL Exporter CPU使用情况
top -p $(pgrep postgres_exporter)

# 检查PostgreSQL Exporter日志，查找性能相关信息
journalctl -u postgres_exporter -f

# 优化建议：
# 1. 减少自定义查询的数量和复杂度
# 2. 增加查询间隔，减少采集频率
# 3. 过滤不必要的指标
# 4. 增加PostgreSQL Exporter服务器的资源
```

## 10. 总结

本文档详细介绍了PostgreSQL Exporter的部署和配置，包括二进制安装、Docker部署、系统服务配置、Docker Compose部署、API使用、监控和告警、健康检查脚本以及常见问题排查等方面。通过按照本文档的步骤进行部署和配置，可以建立一个完善的PostgreSQL数据库监控系统，用于监控认知辅助系统的PostgreSQL数据库，及时发现和解决问题，确保数据库系统的稳定运行。

PostgreSQL Exporter是一个强大的PostgreSQL监控工具，它可以收集PostgreSQL数据库的各种指标，并将这些指标暴露给Prometheus进行采集。结合Prometheus和Grafana，可以创建直观、美观的监控仪表盘，实时监控PostgreSQL数据库的运行状态和性能，为认知辅助系统的稳定运行提供可靠的保障。