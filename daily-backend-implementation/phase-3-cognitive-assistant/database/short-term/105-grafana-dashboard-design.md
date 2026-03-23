# 105-Grafana仪表盘设计

## 1. Grafana概述

Grafana是一个开源的可视化和监控平台，它可以将来自各种数据源的数据转化为直观、美观的仪表盘。Grafana支持多种数据源，包括Prometheus、InfluxDB、Elasticsearch、MySQL等，并且提供了丰富的可视化组件和强大的查询编辑器。

### 1.1 Grafana核心功能

- 支持多种数据源
- 丰富的可视化组件（图表、仪表盘、表格等）
- 强大的查询编辑器
- 告警管理
- 仪表盘共享和导出
- 插件系统
- 权限管理
- 支持多种认证方式

### 1.2 Grafana架构

```
+---------------------+     +---------------------+     +---------------------+
|                     |     |                     |     |                     |
|  Data Sources       |-----|     Grafana          |-----|  Web Browser        |
|  (Prometheus, etc.) |     |                     |     |  (Dashboard View)   |
|                     |     |                     |     |                     |
+---------------------+     +---------------------+     +---------------------+
```

## 2. 仪表盘设计原则

### 2.1 设计原则

- **清晰性**：仪表盘应该清晰易读，避免信息过载
- **相关性**：将相关的指标放在一起，便于分析
- **层次结构**：从概览到细节，便于用户导航
- **实时性**：显示实时数据，及时反映系统状态
- **告警性**：突出显示异常情况，便于快速发现问题
- **可定制性**：允许用户根据需要自定义仪表盘

### 2.2 仪表盘布局

| 区域 | 内容 | 目的 |
|------|------|------|
| 顶部 | 系统概览 | 显示系统的关键指标，如CPU使用率、内存使用率、连接数等 |
| 左侧 | 导航菜单 | 允许用户切换不同的监控视图 |
| 中间 | 主要监控面板 | 显示详细的监控指标，如服务器监控、数据库监控等 |
| 右侧 | 告警状态 | 显示当前的告警状态，便于快速发现问题 |
| 底部 | 时间范围选择 | 允许用户调整时间范围，查看历史数据 |

## 3. 认知辅助系统数据库监控仪表盘设计

### 3.1 仪表盘概览

认知辅助系统数据库监控仪表盘包括以下几个主要面板：

1. **系统概览**：显示系统的关键指标，如CPU使用率、内存使用率、磁盘使用率、连接数等
2. **服务器监控**：监控服务器的CPU、内存、磁盘、网络等指标
3. **数据库实例监控**：监控数据库的连接数、查询性能、事务性能、缓存性能等指标
4. **数据库对象监控**：监控表大小、索引使用情况等指标
5. **SQL性能监控**：监控慢查询、查询执行时间等指标
6. **告警状态**：显示当前的告警状态

### 3.2 系统概览面板

#### 3.2.1 设计目标

显示系统的关键指标，让用户能够快速了解系统的整体状态。

#### 3.2.2 面板设计

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 | 告警阈值 |
|----------|------------|--------|------------|----------|
| CPU使用率 | 仪表盘 | Prometheus | 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) | ≥80% |
| 内存使用率 | 仪表盘 | Prometheus | 100 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100) | ≥85% |
| 磁盘使用率 | 仪表盘 | Prometheus | 100 - (node_filesystem_free_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100) | ≥90% |
| 数据库连接数 | 仪表盘 | Prometheus | sum by(instance) (pg_stat_database_numbackends) | ≥最大连接数*0.8 |
| 慢查询数 | 仪表盘 | Prometheus | rate(slow_queries_total[5m]) | ≥5个/分钟 |
| 事务回滚率 | 仪表盘 | Prometheus | sum by(instance) (pg_stat_database_xact_rollback) / sum by(instance) (pg_stat_database_xact_commit + pg_stat_database_xact_rollback) * 100 | ≥10% |
| 缓存命中率 | 仪表盘 | Prometheus | 100 * sum by(instance) (pg_stat_database_blks_hit) / sum by(instance) (pg_stat_database_blks_hit + pg_stat_database_blks_read) | ≤90% |

#### 3.2.3 面板截图

```
+---------------------+---------------------+---------------------+
|                     |                     |                     |
|  CPU使用率          |  内存使用率         |  磁盘使用率         |
|  65%                |  72%                |  68%                |
|                     |                     |                     |
+---------------------+---------------------+---------------------+
|                     |                     |                     |
|  数据库连接数       |  慢查询数           |  事务回滚率         |
|  128/200            |  2个/分钟           |  2.5%               |
|                     |                     |                     |
+---------------------+---------------------+---------------------+
|                     |                     |                     |
|  缓存命中率         |                     |                     |
|  96.8%              |                     |                     |
|                     |                     |                     |
+---------------------+---------------------+---------------------+
```

### 3.3 服务器监控面板

#### 3.3.1 设计目标

监控服务器的CPU、内存、磁盘、网络等指标，帮助用户了解服务器的运行状态。

#### 3.3.2 CPU监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| CPU使用率趋势 | 折线图 | Prometheus | 100 - (avg by(instance, mode) (irate(node_cpu_seconds_total[5m])) * 100) |
| CPU使用率分布 | 堆叠面积图 | Prometheus | 100 - (avg by(instance, mode) (irate(node_cpu_seconds_total[5m])) * 100) |
| 系统负载 | 折线图 | Prometheus | node_load1, node_load5, node_load15 |

#### 3.3.3 内存监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 内存使用趋势 | 折线图 | Prometheus | node_memory_MemTotal_bytes, node_memory_MemAvailable_bytes |
| 内存使用率 | 折线图 | Prometheus | 100 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100) |
| 内存分布 | 饼图 | Prometheus | node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes, node_memory_MemAvailable_bytes |

#### 3.3.4 磁盘监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 磁盘使用率 | 柱状图 | Prometheus | 100 - (node_filesystem_free_bytes{mountpoint!~".*shm|.*tmpfs"} / node_filesystem_size_bytes{mountpoint!~".*shm|.*tmpfs"} * 100) |
| 磁盘I/O速率 | 折线图 | Prometheus | irate(node_disk_read_bytes_total[5m]), irate(node_disk_written_bytes_total[5m]) |
| 磁盘IOPS | 折线图 | Prometheus | irate(node_disk_reads_completed_total[5m]), irate(node_disk_writes_completed_total[5m]) |

#### 3.3.5 网络监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 网络流量 | 折线图 | Prometheus | irate(node_network_receive_bytes_total{device!~"lo"}[5m]), irate(node_network_transmit_bytes_total{device!~"lo"}[5m]) |
| 网络数据包 | 折线图 | Prometheus | irate(node_network_receive_packets_total{device!~"lo"}[5m]), irate(node_network_transmit_packets_total{device!~"lo"}[5m]) |
| 网络错误 | 折线图 | Prometheus | irate(node_network_receive_errs_total{device!~"lo"}[5m]), irate(node_network_transmit_errs_total{device!~"lo"}[5m]) |

### 3.4 数据库实例监控面板

#### 3.4.1 设计目标

监控数据库实例的关键指标，如连接数、查询性能、事务性能、缓存性能等。

#### 3.4.2 连接数监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 连接数趋势 | 折线图 | Prometheus | sum by(instance) (pg_stat_database_numbackends) |
| 连接状态分布 | 饼图 | Prometheus | sum by(instance, state) (pg_stat_activity_count) |
| 连接使用率 | 仪表盘 | Prometheus | sum by(instance) (pg_stat_database_numbackends) / pg_settings_max_connections * 100 |

#### 3.4.3 查询性能监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 查询速率 | 折线图 | Prometheus | irate(pg_stat_database_xact_commit[5m]), irate(pg_stat_database_xact_rollback[5m]) |
| 查询执行时间 | 直方图 | Prometheus | pg_stat_statements_mean_time |
| 慢查询数 | 折线图 | Prometheus | rate(slow_queries_total[5m]) |

#### 3.4.4 事务性能监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 事务提交/回滚率 | 折线图 | Prometheus | irate(pg_stat_database_xact_commit[5m]), irate(pg_stat_database_xact_rollback[5m]) |
| 事务回滚率 | 仪表盘 | Prometheus | sum by(instance) (pg_stat_database_xact_rollback) / sum by(instance) (pg_stat_database_xact_commit + pg_stat_database_xact_rollback) * 100 |

#### 3.4.5 缓存性能监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 缓存命中率 | 折线图 | Prometheus | 100 * sum by(instance) (pg_stat_database_blks_hit) / sum by(instance) (pg_stat_database_blks_hit + pg_stat_database_blks_read) |
| 缓冲区使用情况 | 折线图 | Prometheus | pg_stat_bgwriter_buffers_checkpoint, pg_stat_bgwriter_buffers_clean, pg_stat_bgwriter_buffers_backend |
| 缓冲区命中率 | 仪表盘 | Prometheus | pg_buffercache_hit_ratio |

#### 3.4.6 复制状态监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 复制延迟 | 折线图 | Prometheus | pg_stat_replication_lag_seconds |
| 复制状态 | 表格 | Prometheus | pg_stat_replication_sent_location, pg_stat_replication_write_location, pg_stat_replication_flush_location, pg_stat_replication_replay_location |

### 3.5 数据库对象监控面板

#### 3.5.1 设计目标

监控数据库对象的关键指标，如表大小、索引使用情况等。

#### 3.5.2 表大小监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 表大小排行 | 柱状图 | Prometheus | pg_table_size_bytes{schemaname!~"pg_catalog|information_schema"} |
| 表大小趋势 | 折线图 | Prometheus | pg_table_size_bytes{schemaname!~"pg_catalog|information_schema"} |
| 最大的10张表 | 表格 | Prometheus | pg_table_size_bytes{schemaname!~"pg_catalog|information_schema"} |

#### 3.5.3 索引监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 索引使用情况 | 表格 | Prometheus | pg_stat_user_indexes_idx_scan, pg_stat_user_indexes_idx_tup_read, pg_stat_user_indexes_idx_tup_fetch |
| 未使用索引 | 表格 | Prometheus | pg_stat_user_indexes_idx_scan == 0 |
| 索引大小排行 | 柱状图 | Prometheus | pg_indexes_size_bytes{schemaname!~"pg_catalog|information_schema"} |

#### 3.5.4 表碎片监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 表碎片率排行 | 柱状图 | Prometheus | table_fragmentation_ratio{schemaname!~"pg_catalog|information_schema"} |
| 碎片率过高的表 | 表格 | Prometheus | table_fragmentation_ratio{schemaname!~"pg_catalog|information_schema"} > 30 |

### 3.6 SQL性能监控面板

#### 3.6.1 设计目标

监控SQL查询的性能，如慢查询、查询执行时间等。

#### 3.6.2 慢查询监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 慢查询数趋势 | 折线图 | Prometheus | rate(slow_queries_total[5m]) |
| 慢查询列表 | 表格 | Loki | {job="postgres"} |= "duration" |= "log_line_prefix" |

#### 3.6.3 查询执行时间监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 查询执行时间分布 | 直方图 | Prometheus | pg_stat_statements_mean_time |
| 最长执行时间的查询 | 表格 | Prometheus | pg_stat_statements_max_time |
| 查询执行次数排行 | 柱状图 | Prometheus | pg_stat_statements_calls |

### 3.7 告警状态面板

#### 3.7.1 设计目标

显示当前的告警状态，让用户能够快速发现和解决问题。

#### 3.7.2 告警状态监控

| 指标名称 | 可视化组件 | 数据源 | 指标表达式 |
|----------|------------|--------|------------|
| 告警概览 | 统计卡片 | Prometheus | ALERTS{alertstate="firing"} |
| 告警列表 | 表格 | Prometheus | ALERTS{alertstate="firing"} |
| 告警历史 | 表格 | Prometheus | ALERTS |

## 4. Grafana配置

### 4.1 数据源配置

#### 4.1.1 添加Prometheus数据源

1. 登录Grafana，点击左侧导航栏的"Configuration" > "Data Sources"
2. 点击"Add data source"
3. 选择"Prometheus"
4. 配置Prometheus数据源：
   - **Name**: Prometheus
   - **URL**: http://localhost:9090
   - **Access**: Server
   - **Scrape Interval**: 15s
   - **HTTP Method**: GET
5. 点击"Save & Test"，验证数据源是否配置成功

#### 4.1.2 添加Loki数据源

1. 登录Grafana，点击左侧导航栏的"Configuration" > "Data Sources"
2. 点击"Add data source"
3. 选择"Loki"
4. 配置Loki数据源：
   - **Name**: Loki
   - **URL**: http://localhost:3100
   - **Access**: Server
5. 点击"Save & Test"，验证数据源是否配置成功

### 4.2 仪表盘导入和导出

#### 4.2.1 导入仪表盘

1. 登录Grafana，点击左侧导航栏的"+" > "Import"
2. 在"Import via grafana.com"输入仪表盘ID，或上传JSON文件
3. 选择数据源
4. 点击"Import"，完成仪表盘导入

#### 4.2.2 导出仪表盘

1. 打开要导出的仪表盘
2. 点击仪表盘右上角的"Share" > "Export"
3. 选择"Export for sharing externally"
4. 点击"Save to file"，下载JSON文件

### 4.3 仪表盘变量配置

#### 4.3.1 添加实例变量

1. 打开仪表盘，点击右上角的"Dashboard settings" > "Variables"
2. 点击"Add variable"
3. 配置变量：
   - **Name**: instance
   - **Type**: Query
   - **Data source**: Prometheus
   - **Query**: label_values(instance)
   - **Refresh**: On Dashboard Load
   - **Sort**: Alphabetical (asc)
4. 点击"Add"，完成变量添加

#### 4.3.2 添加数据库变量

1. 打开仪表盘，点击右上角的"Dashboard settings" > "Variables"
2. 点击"Add variable"
3. 配置变量：
   - **Name**: database
   - **Type**: Query
   - **Data source**: Prometheus
   - **Query**: label_values(pg_database_size_bytes, datname)
   - **Refresh**: On Dashboard Load
   - **Sort**: Alphabetical (asc)
4. 点击"Add"，完成变量添加

## 5. 仪表盘优化

### 5.1 性能优化

- **减少查询数量**：每个仪表盘的查询数量不应超过20个
- **优化查询语句**：使用高效的PromQL查询，避免复杂的聚合操作
- **增加查询间隔**：对于不频繁变化的指标，增加查询间隔
- **使用变量**：使用变量过滤数据，减少查询的数据量
- **启用查询缓存**：在Grafana配置中启用查询缓存

### 5.2 用户体验优化

- **清晰的标题和描述**：为每个面板添加清晰的标题和描述
- **合理的时间范围**：设置合理的默认时间范围，便于用户查看数据
- **统一的配色方案**：使用统一的配色方案，提高仪表盘的美观度
- **响应式设计**：确保仪表盘在不同设备上都能正常显示
- **添加帮助信息**：为复杂的指标添加帮助信息，便于用户理解

### 5.3 告警优化

- **合理的告警阈值**：设置合理的告警阈值，避免误告警和漏告警
- **明确的告警描述**：为每个告警添加明确的描述和解决建议
- **适当的告警级别**：根据告警的严重程度设置适当的告警级别
- **告警分组**：对相关的告警进行分组，便于用户管理

## 6. 仪表盘示例代码

### 6.1 系统概览面板JSON

```json
{
  "dashboard": {
    "id": null,
    "title": "认知辅助系统数据库监控",
    "tags": ["database", "postgres"],
    "timezone": "browser",
    "schemaVersion": 26,
    "version": 1,
    "refresh": "1m",
    "panels": [
      {
        "id": 1,
        "title": "CPU使用率",
        "type": "gauge",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{instance}}",
            "refId": "A"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 8,
          "x": 0,
          "y": 0
        },
        "gauge": {
          "minValue": 0,
          "maxValue": 100,
          "thresholdLabels": true,
          "thresholdMarkers": true,
          "thresholds": "80,90"
        }
      },
      {
        "id": 2,
        "title": "内存使用率",
        "type": "gauge",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "100 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100)",
            "legendFormat": "{{instance}}",
            "refId": "A"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 8,
          "x": 8,
          "y": 0
        },
        "gauge": {
          "minValue": 0,
          "maxValue": 100,
          "thresholdLabels": true,
          "thresholdMarkers": true,
          "thresholds": "85,90"
        }
      },
      {
        "id": 3,
        "title": "磁盘使用率",
        "type": "gauge",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "100 - (node_filesystem_free_bytes{mountpoint=\"/\"} / node_filesystem_size_bytes{mountpoint=\"/\"} * 100)",
            "legendFormat": "{{instance}}",
            "refId": "A"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 8,
          "x": 16,
          "y": 0
        },
        "gauge": {
          "minValue": 0,
          "maxValue": 100,
          "thresholdLabels": true,
          "thresholdMarkers": true,
          "thresholds": "90,95"
        }
      }
    ]
  }
}
```

## 7. 总结

本文档详细设计了认知辅助系统数据库监控仪表盘，包括系统概览、服务器监控、数据库实例监控、数据库对象监控、SQL性能监控和告警状态等面板。通过使用Grafana和Prometheus，可以实现对数据库的全面监控，及时发现和解决问题，确保系统的稳定运行。

在实际使用过程中，可以根据业务需求和系统特点，对仪表盘进行进一步的定制和优化，以提高监控效果和用户体验。同时，还可以结合Alertmanager等工具，实现更完善的告警管理和通知机制。