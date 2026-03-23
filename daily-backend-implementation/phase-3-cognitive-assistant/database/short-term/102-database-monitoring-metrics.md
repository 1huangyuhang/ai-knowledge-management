# 102-数据库监控指标设计

## 1. 监控指标体系概述

### 1.1 指标体系设计原则

- **全面性**：覆盖数据库服务器、数据库实例、数据库对象等各个层面
- **实时性**：实时采集和更新监控指标
- **可操作性**：指标设计要具有可操作性，能够指导问题解决
- **告警实用性**：告警阈值设置合理，避免误告警和漏告警
- **可扩展性**：指标体系能够适应业务发展和技术变化

### 1.2 指标分类

| 指标类别 | 包含子类别 | 主要监控对象 |
|----------|------------|--------------|
| 服务器指标 | CPU、内存、磁盘、网络、系统负载 | 数据库服务器 |
| 数据库实例指标 | 连接数、查询性能、事务性能、缓存性能、锁等待、复制状态 | PostgreSQL数据库实例 |
| 数据库对象指标 | 表大小、索引使用情况、表碎片 | 数据库表、索引等对象 |
| 应用性能指标 | 响应时间、吞吐量、错误率 | 数据库应用程序 |

## 2. 服务器监控指标

### 2.1 CPU指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| cpu_usage_total | CPU总使用率 | node_exporter | 1分钟 | ≥80%持续5分钟 | % |
| cpu_usage_user | 用户态CPU使用率 | node_exporter | 1分钟 | ≥70%持续5分钟 | % |
| cpu_usage_system | 系统态CPU使用率 | node_exporter | 1分钟 | ≥20%持续5分钟 | % |
| cpu_usage_iowait | I/O等待CPU使用率 | node_exporter | 1分钟 | ≥30%持续5分钟 | % |
| cpu_load1 | 1分钟系统负载 | node_exporter | 1分钟 | ≥CPU核心数持续5分钟 | 无 |
| cpu_load5 | 5分钟系统负载 | node_exporter | 1分钟 | ≥CPU核心数*0.8持续5分钟 | 无 |
| cpu_load15 | 15分钟系统负载 | node_exporter | 1分钟 | ≥CPU核心数*0.7持续5分钟 | 无 |

### 2.2 内存指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| memory_usage_total | 内存总使用率 | node_exporter | 1分钟 | ≥85%持续5分钟 | % |
| memory_used | 已使用内存大小 | node_exporter | 1分钟 | 根据服务器配置调整 | bytes |
| memory_free | 空闲内存大小 | node_exporter | 1分钟 | ≤1GB持续5分钟 | bytes |
| memory_buffers | 缓冲区内存大小 | node_exporter | 1分钟 | - | bytes |
| memory_cached | 缓存内存大小 | node_exporter | 1分钟 | - | bytes |
| memory_swap_usage | 交换分区使用率 | node_exporter | 1分钟 | ≥50%持续5分钟 | % |

### 2.3 磁盘指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| disk_usage_total | 磁盘总使用率 | node_exporter | 5分钟 | ≥90% | % |
| disk_used | 已使用磁盘空间 | node_exporter | 5分钟 | 根据磁盘大小调整 | bytes |
| disk_free | 空闲磁盘空间 | node_exporter | 5分钟 | ≤10GB | bytes |
| disk_read_bytes | 磁盘读取速率 | node_exporter | 1分钟 | - | bytes/s |
| disk_write_bytes | 磁盘写入速率 | node_exporter | 1分钟 | - | bytes/s |
| disk_read_iops | 磁盘读取IOPS | node_exporter | 1分钟 | - | ops/s |
| disk_write_iops | 磁盘写入IOPS | node_exporter | 1分钟 | - | ops/s |
| disk_read_time | 磁盘读取响应时间 | node_exporter | 1分钟 | ≥100ms持续5分钟 | ms |
| disk_write_time | 磁盘写入响应时间 | node_exporter | 1分钟 | ≥100ms持续5分钟 | ms |

### 2.4 网络指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| network_receive_bytes | 网络接收速率 | node_exporter | 1分钟 | - | bytes/s |
| network_transmit_bytes | 网络发送速率 | node_exporter | 1分钟 | - | bytes/s |
| network_receive_packets | 网络接收数据包速率 | node_exporter | 1分钟 | - | packets/s |
| network_transmit_packets | 网络发送数据包速率 | node_exporter | 1分钟 | - | packets/s |
| network_receive_errors | 网络接收错误数 | node_exporter | 1分钟 | ≥10个/分钟 | errors/s |
| network_transmit_errors | 网络发送错误数 | node_exporter | 1分钟 | ≥10个/分钟 | errors/s |

## 3. 数据库实例监控指标

### 3.1 连接数指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| pg_stat_database_numbackends | 当前连接数 | postgres_exporter | 1分钟 | ≥最大连接数*0.8持续5分钟 | 个 |
| pg_settings_max_connections | 最大连接数 | postgres_exporter | 1分钟 | - | 个 |
| connection_usage_ratio | 连接使用率 | 计算指标（numbackends/max_connections） | 1分钟 | ≥80%持续5分钟 | % |
| pg_stat_activity_count_idle | 空闲连接数 | postgres_exporter | 1分钟 | ≥当前连接数*0.7持续5分钟 | 个 |
| pg_stat_activity_count_active | 活跃连接数 | postgres_exporter | 1分钟 | - | 个 |
| pg_stat_activity_count_waiting | 等待连接数 | postgres_exporter | 1分钟 | ≥5个/分钟 | 个 |

### 3.2 查询性能指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| pg_stat_database_xact_commit | 事务提交数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_database_xact_rollback | 事务回滚数 | postgres_exporter | 1分钟 | ≥事务提交数*0.1持续5分钟 | 个/秒 |
| pg_stat_database_blks_read | 物理块读取数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_database_blks_hit | 缓冲区命中块数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_database_tup_returned | 返回行数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_database_tup_fetched | 提取行数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_database_tup_inserted | 插入行数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_database_tup_updated | 更新行数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_database_tup_deleted | 删除行数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_statements_mean_time | 查询平均响应时间 | postgres_exporter（需启用pg_stat_statements扩展） | 1分钟 | ≥500ms持续5分钟 | ms |
| pg_stat_statements_max_time | 查询最大响应时间 | postgres_exporter（需启用pg_stat_statements扩展） | 1分钟 | ≥5000ms持续5分钟 | ms |
| slow_queries_total | 慢查询总数 | 日志解析（Loki+Promtail） | 1分钟 | ≥5个/分钟 | 个/分钟 |

### 3.3 缓存性能指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| shared_buffers_hit_ratio | 共享缓冲区命中率 | 计算指标（blks_hit/(blks_hit+blks_read)） | 5分钟 | ≤90%持续10分钟 | % |
| pg_buffercache_hit_ratio | 缓冲区缓存命中率 | postgres_exporter（需启用pg_buffercache扩展） | 5分钟 | ≤95%持续10分钟 | % |
| pg_stat_bgwriter_buffers_checkpoint | 检查点写入缓冲区数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_bgwriter_buffers_clean | 后台写入器写入缓冲区数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_bgwriter_maxwritten_clean | 后台写入器停止写入次数 | postgres_exporter | 1分钟 | ≥10次/分钟 | 次/分钟 |

### 3.4 锁等待指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| pg_stat_activity_count_locked | 锁等待连接数 | postgres_exporter | 1分钟 | ≥5个/分钟 | 个/分钟 |
| pg_locks_count | 当前锁数量 | postgres_exporter | 1分钟 | ≥100个持续5分钟 | 个 |
| lock_wait_time_seconds | 锁等待时间 | 计算指标 | 1分钟 | ≥5秒持续5分钟 | 秒 |

### 3.5 复制状态指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| pg_stat_replication_lag_seconds | 主从复制延迟 | postgres_exporter | 1分钟 | ≥30秒 | 秒 |
| pg_stat_replication_sent_location | 主库已发送位置 | postgres_exporter | 1分钟 | - | 字节 |
| pg_stat_replication_write_location | 从库已写入位置 | postgres_exporter | 1分钟 | - | 字节 |
| pg_stat_replication_flush_location | 从库已刷新位置 | postgres_exporter | 1分钟 | - | 字节 |
| pg_stat_replication_replay_location | 从库已回放位置 | postgres_exporter | 1分钟 | - | 字节 |
| pg_stat_wal_receiver_status | WAL接收状态 | postgres_exporter | 1分钟 | 状态异常 | - |

### 3.6 数据库大小指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| pg_database_size_bytes | 数据库大小 | postgres_exporter | 5分钟 | - | bytes |
| pg_table_size_bytes | 表大小 | postgres_exporter | 5分钟 | - | bytes |
| pg_indexes_size_bytes | 索引大小 | postgres_exporter | 5分钟 | - | bytes |
| pg_total_relation_size_bytes | 表和索引总大小 | postgres_exporter | 5分钟 | - | bytes |

## 4. 数据库对象监控指标

### 4.1 表指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| table_size_growth_rate | 表大小增长率 | 计算指标 | 1小时 | ≥10%/天 | %/天 |
| pg_stat_user_tables_seq_scan | 全表扫描次数 | postgres_exporter | 1天 | ≥1000次/天 | 次/天 |
| pg_stat_user_tables_idx_scan | 索引扫描次数 | postgres_exporter | 1天 | - | 次/天 |
| pg_stat_user_tables_n_tup_ins | 插入行数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_user_tables_n_tup_upd | 更新行数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_user_tables_n_tup_del | 删除行数 | postgres_exporter | 1分钟 | - | 个/秒 |
| pg_stat_user_tables_n_tup_hot_upd | 热更新行数 | postgres_exporter | 1分钟 | - | 个/秒 |
| table_fragmentation_ratio | 表碎片率 | 计算指标 | 1天 | ≥30% | % |

### 4.2 索引指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| pg_stat_user_indexes_idx_scan | 索引扫描次数 | postgres_exporter | 1天 | - | 次/天 |
| pg_stat_user_indexes_idx_tup_read | 索引读取行数 | postgres_exporter | 1天 | - | 个/天 |
| pg_stat_user_indexes_idx_tup_fetch | 索引提取行数 | postgres_exporter | 1天 | - | 个/天 |
| index_hit_ratio | 索引命中率 | 计算指标（idx_tup_fetch/(idx_tup_fetch+seq_scan*row_count)） | 1天 | ≤90% | % |
| unused_indexes_count | 未使用索引数 | 计算指标 | 1天 | ≥5个 | 个 |
| index_size_ratio | 索引大小占比 | 计算指标（indexes_size/table_size） | 1天 | ≥200% | % |

## 5. 应用性能指标

### 5.1 响应时间指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| http_request_duration_seconds | HTTP请求响应时间 | 应用程序埋点 | 1分钟 | ≥500ms持续5分钟 | ms |
| database_query_duration_seconds | 数据库查询响应时间 | 应用程序埋点 | 1分钟 | ≥200ms持续5分钟 | ms |
| api_response_time_p95 | API响应时间P95 | 应用程序埋点 | 1分钟 | ≥1000ms持续5分钟 | ms |
| api_response_time_p99 | API响应时间P99 | 应用程序埋点 | 1分钟 | ≥2000ms持续5分钟 | ms |

### 5.2 吞吐量指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| http_requests_total | HTTP请求总数 | 应用程序埋点 | 1分钟 | - | 个/秒 |
| database_queries_total | 数据库查询总数 | 应用程序埋点 | 1分钟 | - | 个/秒 |
| api_requests_success_total | 成功API请求数 | 应用程序埋点 | 1分钟 | - | 个/秒 |
| api_requests_error_total | 错误API请求数 | 应用程序埋点 | 1分钟 | ≥成功请求数*0.01持续5分钟 | 个/秒 |

### 5.3 错误率指标

| 指标名称 | 指标描述 | 采集方式 | 监控频率 | 告警阈值 | 单位 |
|----------|----------|----------|----------|----------|------|
| http_requests_error_rate | HTTP请求错误率 | 计算指标（错误请求数/总请求数） | 1分钟 | ≥1%持续5分钟 | % |
| database_queries_error_rate | 数据库查询错误率 | 计算指标（错误查询数/总查询数） | 1分钟 | ≥0.5%持续5分钟 | % |
| api_requests_error_rate | API请求错误率 | 计算指标（错误API请求数/总API请求数） | 1分钟 | ≥1%持续5分钟 | % |
| database_connection_errors_total | 数据库连接错误数 | 应用程序埋点 | 1分钟 | ≥5个/分钟 | 个/分钟 |

## 6. 监控指标采集与存储

### 6.1 采集方式

| 指标类别 | 采集工具 | 采集频率 | 数据格式 |
|----------|----------|----------|----------|
| 服务器指标 | node_exporter | 1分钟 | Prometheus格式 |
| 数据库实例指标 | postgres_exporter | 1分钟 | Prometheus格式 |
| 数据库对象指标 | postgres_exporter | 5分钟/1天 | Prometheus格式 |
| 应用性能指标 | 应用程序埋点 | 1分钟 | Prometheus格式 |
| 日志指标 | Promtail + Loki | 实时 | 日志格式 |

### 6.2 存储策略

| 数据类型 | 存储工具 | 保留时间 | 存储方式 |
|----------|----------|----------|----------|
| 指标数据 | Prometheus | 原始数据：7天<br>聚合数据（小时）：30天<br>聚合数据（天）：1年 | 本地磁盘 |
| 日志数据 | Loki | 原始日志：7天<br>聚合日志：30天 | 本地磁盘 |
| 历史数据 | 对象存储 | 永久 | 对象存储 |

## 7. 告警规则设计

### 7.1 告警规则分类

| 告警类别 | 包含告警 | 告警级别 |
|----------|----------|----------|
| 服务器告警 | CPU使用率过高、内存使用率过高、磁盘空间不足、磁盘I/O异常、网络错误 | 严重/警告 |
| 数据库实例告警 | 连接数过高、慢查询过多、事务回滚率过高、缓存命中率过低、锁等待过多、复制延迟过大 | 紧急/严重/警告 |
| 数据库对象告警 | 表碎片率过高、未使用索引过多、索引大小占比过高 | 警告 |
| 应用性能告警 | 响应时间过长、错误率过高、吞吐量异常 | 严重/警告 |

### 7.2 告警规则示例

```yaml
# CPU使用率过高告警
- alert: HighCPUUsage
  expr: cpu_usage_total > 80
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High CPU usage on {{ $labels.instance }}"
    description: "CPU usage is {{ $value }}% for more than 5 minutes"

# 连接数过高告警
- alert: HighConnectionUsage
  expr: connection_usage_ratio > 80
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High connection usage on {{ $labels.instance }}"
    description: "Connection usage is {{ $value }}% for more than 5 minutes"

# 慢查询过多告警
- alert: TooManySlowQueries
  expr: rate(slow_queries_total[1m]) > 5
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Too many slow queries on {{ $labels.instance }}"
    description: "{{ $value }} slow queries per minute for more than 5 minutes"

# 复制延迟过大告警
- alert: ReplicationLagTooHigh
  expr: pg_stat_replication_lag_seconds > 30
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Replication lag too high on {{ $labels.instance }}"
    description: "Replication lag is {{ $value }} seconds for more than 5 minutes"
```

## 8. 监控指标可视化设计

### 8.1 仪表盘分类

| 仪表盘名称 | 主要内容 | 面向角色 |
|------------|----------|----------|
| 服务器监控仪表盘 | CPU、内存、磁盘、网络等服务器指标 | 运维工程师 |
| 数据库实例监控仪表盘 | 连接数、查询性能、事务性能、缓存性能等数据库实例指标 | DBA、开发工程师 |
| 数据库对象监控仪表盘 | 表大小、索引使用情况、表碎片等数据库对象指标 | DBA、开发工程师 |
| 应用性能监控仪表盘 | 响应时间、吞吐量、错误率等应用性能指标 | 开发工程师、产品经理 |
| 综合监控仪表盘 | 关键指标概览、告警状态、系统健康度 | 管理层、运维负责人 |

### 8.2 关键指标可视化组件

| 组件类型 | 适用指标 | 示例 |
|----------|----------|------|
| 折线图 | 时间序列数据，如CPU使用率、内存使用率、查询响应时间等 | CPU使用率趋势图 |
| 柱状图 | 对比数据，如不同表的大小、不同时间段的请求数等 | 各数据库大小对比图 |
| 饼图 | 占比数据，如连接状态分布、查询类型分布等 | 连接状态分布图 |
| 仪表盘 | 单值指标，如CPU使用率、内存使用率、连接使用率等 | CPU使用率仪表盘 |
| 热力图 | 矩阵数据，如查询响应时间分布、错误率分布等 | 时间-响应时间热力图 |
| 表格 | 详细数据列表，如慢查询列表、未使用索引列表等 | 慢查询详情表 |

## 9. 监控指标优化建议

### 9.1 指标精简

- 定期评估指标使用情况，删除无用或冗余指标
- 合并相似指标，减少指标数量
- 优先保留能够反映系统健康状况和性能瓶颈的关键指标

### 9.2 指标粒度优化

- 根据指标重要性调整采集频率，关键指标提高采集频率
- 对高频采集的指标进行聚合，减少存储和查询压力
- 对历史数据进行降采样，优化存储效率

### 9.3 告警规则优化

- 定期评估告警规则效果，调整告警阈值和持续时间
- 合并相似告警，减少告警噪音
- 优化告警通知策略，确保告警能够及时送达相关人员

### 9.4 可视化优化

- 根据用户角色和需求，设计个性化的监控仪表盘
- 突出显示关键指标和异常情况
- 提供交互式查询和钻取功能，方便问题定位和分析

## 10. 总结

本文档详细设计了数据库监控指标体系，包括服务器监控指标、数据库实例监控指标、数据库对象监控指标和应用性能指标。通过建立完善的监控指标体系，能够实时监控数据库的运行状态和性能，及时发现和解决问题，确保数据库系统的稳定运行。

监控指标体系是一个动态发展的系统，需要根据业务发展和技术变化不断优化和完善。在实际使用过程中，应定期评估指标使用情况，调整指标采集频率和告警阈值，优化监控仪表盘设计，确保监控系统能够持续有效地支持数据库管理和维护工作。