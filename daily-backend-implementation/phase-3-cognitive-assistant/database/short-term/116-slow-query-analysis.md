# 116-慢查询分析

## 1. 慢查询概述

慢查询是指执行时间超过预设阈值的SQL查询语句。慢查询会导致数据库性能下降，影响系统的响应速度和用户体验。慢查询分析是指对慢查询进行监控、分析和优化，以提高数据库的性能和响应速度。

## 2. 慢查询分析目标

1. **识别慢查询**：找出执行时间超过阈值的SQL查询语句
2. **分析慢查询原因**：分析慢查询的执行计划、索引使用情况和资源消耗
3. **优化慢查询**：提出慢查询的优化建议，如添加索引、修改查询语句等
4. **监控慢查询趋势**：监控慢查询的数量和执行时间变化，及时发现性能问题
5. **建立慢查询基准**：建立慢查询的基准指标，用于评估优化效果

## 3. 慢查询分析工具

### 3.1 PostgreSQL内置工具

| 工具名称 | 类型 | 用途 |
|----------|------|------|
| **慢查询日志** | 日志文件 | 记录执行时间超过阈值的SQL查询语句 |
| **pg_stat_statements** | 扩展 | 提供SQL语句的执行统计信息，包括执行时间、调用次数等 |
| **EXPLAIN** | SQL命令 | 显示SQL查询的执行计划 |
| **EXPLAIN ANALYZE** | SQL命令 | 显示SQL查询的实际执行计划和执行时间 |
| **pg_stat_user_tables** | 系统视图 | 提供用户表的统计信息，包括全表扫描次数 |
| **pg_stat_user_indexes** | 系统视图 | 提供用户表索引的使用统计信息 |

### 3.2 第三方工具

| 工具名称 | 类型 | 用途 |
|----------|------|------|
| **pgBadger** | 日志分析工具 | 分析PostgreSQL日志，生成可视化的慢查询报告 |
| **pg_stat_kcache** | 扩展 | 提供SQL语句的操作系统级I/O和CPU统计信息 |
| **pganalyze** | 监控工具 | 提供慢查询的可视化分析和优化建议 |
| **Datadog** | 监控工具 | 提供慢查询的监控和告警 |
| **New Relic** | 监控工具 | 提供慢查询的监控和性能分析 |

### 3.3 推荐工具

**推荐工具组合**：
- 慢查询日志：记录慢查询的详细信息
- pg_stat_statements扩展：提供SQL语句的执行统计信息
- EXPLAIN ANALYZE：分析SQL查询的执行计划
- pgBadger：生成可视化的慢查询报告

## 4. 慢查询分析实现

### 4.1 启用慢查询日志

修改PostgreSQL配置文件`postgresql.conf`：

```ini
# 启用慢查询日志
log_min_duration_statement = 500  # 记录执行时间超过500毫秒的查询
log_statement = 'none'  # 不记录所有语句，只记录慢查询
log_duration = off  # 关闭所有查询的执行时间记录

# 配置慢查询日志格式
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_timezone = 'Asia/Shanghai'

# 配置日志文件
log_destination = 'stderr,csvlog'
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 0

# 启用详细的慢查询日志
log_min_error_statement = error
log_min_messages = warning
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0  # 记录所有临时文件的使用情况
log_autovacuum_min_duration = 0  # 记录所有自动 vacuum 操作
```

重启PostgreSQL服务：

```bash
systemctl restart postgresql-14
```

### 4.2 启用pg_stat_statements扩展

```bash
# 启用pg_stat_statements扩展
psql -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"

# 配置pg_stat_statements
# 修改postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all
pg_stat_statements.track_utility = off
```

重启PostgreSQL服务：

```bash
systemctl restart postgresql-14
```

### 4.3 慢查询分析脚本

#### 4.3.1 查看慢查询统计信息

创建慢查询分析脚本`analyze_slow_queries.sh`：

```bash
#!/bin/bash

# 慢查询分析脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
DB_NAME="cognitive_assistant"
OUTPUT_FILE="/tmp/slow_query_analysis_$(date +%Y%m%d_%H%M%S).txt"

# 执行分析
echo "开始执行慢查询分析，时间：$(date)" > $OUTPUT_FILE

echo "\n1. 慢查询统计信息（按总执行时间）：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    queryid,
    substr(query, 1, 200) AS query_sample,
    calls,
    total_time,
    mean_time,
    max_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    idx_blks_hit,
    idx_blks_read
FROM pg_stat_statements
WHERE mean_time > 100  -- 平均执行时间超过100毫秒
ORDER BY total_time DESC
LIMIT 20;
" >> $OUTPUT_FILE

echo "\n2. 慢查询统计信息（按调用次数）：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    queryid,
    substr(query, 1, 200) AS query_sample,
    calls,
    total_time,
    mean_time,
    max_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    idx_blks_hit,
    idx_blks_read
FROM pg_stat_statements
WHERE calls > 100  -- 调用次数超过100次
ORDER BY calls DESC
LIMIT 20;
" >> $OUTPUT_FILE

echo "\n3. 无索引的慢查询：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    queryid,
    substr(query, 1, 200) AS query_sample,
    calls,
    total_time,
    mean_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    idx_blks_hit,
    idx_blks_read
FROM pg_stat_statements
WHERE idx_blks_hit + idx_blks_read = 0 AND shared_blks_read > 0
ORDER BY total_time DESC
LIMIT 20;
" >> $OUTPUT_FILE

echo "\n4. 全表扫描的查询：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    relname AS table_name,
    seq_scan AS sequential_scans,
    seq_tup_read AS tuples_read,
    idx_scan AS index_scans
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_scan DESC;
" >> $OUTPUT_FILE

echo "\n5. 慢查询的执行计划示例：" >> $OUTPUT_FILE
# 这里可以添加具体的慢查询示例和执行计划分析

echo "\n慢查询分析完成，时间：$(date)" >> $OUTPUT_FILE

echo "分析结果已保存到：$OUTPUT_FILE"
```

#### 4.3.2 设置脚本权限并执行

```bash
# 设置脚本执行权限
chmod +x analyze_slow_queries.sh

# 执行脚本
./analyze_slow_queries.sh
```

### 4.4 使用pgBadger分析慢查询日志

#### 4.4.1 安装pgBadger

```bash
# Ubuntu/Debian
apt-get update
apt-get install -y pgbadger

# CentOS/RHEL
yum install -y pgbadger

# macOS
brew install pgbadger
```

#### 4.4.2 生成慢查询报告

创建pgBadger报告生成脚本`generate_slow_query_report.sh`：

```bash
#!/bin/bash

# 生成慢查询报告脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
LOG_DIR="/var/lib/postgresql/14/main/pg_log"
OUTPUT_DIR="/tmp/slow_query_reports"
REPORT_NAME="slow_query_report_$(date +%Y%m%d_%H%M%S)"

# 创建输出目录
mkdir -p $OUTPUT_DIR

# 生成HTML报告
echo "开始生成慢查询报告，时间：$(date)"
pgbadger -f csvlog -o $OUTPUT_DIR/$REPORT_NAME.html $LOG_DIR/postgresql-$(date +%Y-%m-%d)*.csv

# 生成文本报告
pgbadger -f csvlog -o $OUTPUT_DIR/$REPORT_NAME.txt $LOG_DIR/postgresql-$(date +%Y-%m-%d)*.csv

echo "慢查询报告已生成："
echo "HTML报告：$OUTPUT_DIR/$REPORT_NAME.html"
echo "文本报告：$OUTPUT_DIR/$REPORT_NAME.txt"
```

#### 4.4.3 设置脚本权限并执行

```bash
# 设置脚本执行权限
chmod +x generate_slow_query_report.sh

# 执行脚本
./generate_slow_query_report.sh
```

## 5. 慢查询日志分析

### 5.1 慢查询日志格式

启用慢查询日志后，PostgreSQL会将慢查询记录到日志文件中，格式如下：

```
2026-01-08 10:00:00.123 CST [12345]: [1-1] user=cognitive_assistant,db=cognitive_assistant,app=psql,client=127.0.0.1 LOG:  duration: 1234.567 ms  execute <unnamed>: SELECT * FROM user_cognitive_model WHERE user_id = $1 AND created_at > $2
```

### 5.2 慢查询日志内容解读

- **时间戳**：慢查询执行的时间
- **进程ID**：执行慢查询的进程ID
- **用户**：执行慢查询的数据库用户
- **数据库**：执行慢查询的数据库
- **应用**：执行慢查询的应用程序
- **客户端**：执行慢查询的客户端IP地址
- **执行时间**：慢查询的执行时间，单位为毫秒
- **查询语句**：慢查询的SQL语句

### 5.3 慢查询分析步骤

1. **收集慢查询日志**：收集一定时间内的慢查询日志
2. **统计慢查询**：统计慢查询的数量、执行时间、调用次数等
3. **分析执行计划**：使用EXPLAIN ANALYZE分析慢查询的执行计划
4. **识别瓶颈**：识别慢查询的性能瓶颈，如全表扫描、缺失索引等
5. **提出优化建议**：根据分析结果提出优化建议
6. **实施优化**：实施优化建议，如添加索引、修改查询语句等
7. **验证优化效果**：验证优化后的效果，如执行时间是否减少

## 6. 慢查询优化建议

### 6.1 添加索引

- 对于频繁使用的查询条件，添加适当的索引
- 考虑使用复合索引，根据查询条件的顺序设计索引列的顺序
- 避免在索引列上使用函数或表达式，否则索引可能无法使用
- 定期检查索引的使用情况，删除未使用的索引

### 6.2 修改查询语句

- 只查询需要的列，避免使用SELECT *
- 限制返回的行数，使用LIMIT子句
- 避免在WHERE子句中使用NOT IN、<>等操作符，否则索引可能无法使用
- 避免在WHERE子句中使用OR操作符，考虑使用UNION替代
- 避免在WHERE子句中使用LIKE '%xxx'，否则索引可能无法使用
- 使用JOIN替代子查询，提高查询效率
- 避免在ORDER BY子句中使用函数或表达式

### 6.3 优化表结构

- 合理设计表结构，避免冗余字段
- 使用适当的数据类型，避免使用过大的数据类型
- 考虑使用分区表，对于大表可以提高查询效率
- 定期执行VACUUM和ANALYZE操作，更新表的统计信息

### 6.4 调整PostgreSQL配置

- 调整shared_buffers参数，增加内存缓冲区
- 调整work_mem参数，增加查询工作内存
- 调整maintenance_work_mem参数，增加维护操作的内存
- 调整effective_cache_size参数，提高查询优化器的缓存估计

## 7. 慢查询分析示例

### 7.1 慢查询示例

假设有以下慢查询：

```sql
SELECT * FROM user_cognitive_model WHERE user_id = 123 AND created_at > '2026-01-01'
```

### 7.2 分析执行计划

使用EXPLAIN ANALYZE分析执行计划：

```sql
EXPLAIN ANALYZE SELECT * FROM user_cognitive_model WHERE user_id = 123 AND created_at > '2026-01-01';
```

执行结果：

```
Seq Scan on user_cognitive_model  (cost=0.00..1234.56 rows=123 width=456) (actual time=0.012..123.456 rows=123 loops=1)
  Filter: ((user_id = 123) AND (created_at > '2026-01-01 00:00:00+00'::timestamp with time zone))
  Rows Removed by Filter: 9876
Planning Time: 0.123 ms
Execution Time: 123.567 ms
```

### 7.3 优化建议

从执行计划可以看出，该查询使用了全表扫描（Seq Scan），过滤了9876行数据，只返回了123行数据。执行时间为123.567毫秒，属于慢查询。

优化建议：

1. **添加复合索引**：在user_id和created_at列上添加复合索引
   ```sql
   CREATE INDEX idx_user_cognitive_model_user_id_created_at ON user_cognitive_model (user_id, created_at);
   ```

2. **修改查询语句**：只查询需要的列，避免使用SELECT *
   ```sql
   SELECT id, user_id, model_data, created_at FROM user_cognitive_model WHERE user_id = 123 AND created_at > '2026-01-01';
   ```

### 7.4 验证优化效果

优化后，再次使用EXPLAIN ANALYZE分析执行计划：

```
Index Scan using idx_user_cognitive_model_user_id_created_at on user_cognitive_model  (cost=0.29..45.67 rows=123 width=456) (actual time=0.008..1.234 rows=123 loops=1)
  Index Cond: ((user_id = 123) AND (created_at > '2026-01-01 00:00:00+00'::timestamp with time zone))
Planning Time: 0.111 ms
Execution Time: 1.345 ms
```

可以看到，优化后查询使用了索引扫描（Index Scan），执行时间从123.567毫秒减少到1.345毫秒，性能提升了约99倍。

## 8. 慢查询分析的最佳实践

1. **设置合理的慢查询阈值**：根据业务需求设置合理的慢查询阈值，一般建议为500毫秒
2. **定期分析慢查询**：定期分析慢查询，建议每天或每周执行一次
3. **关注高频慢查询**：重点关注调用次数多、总执行时间长的慢查询
4. **结合索引使用情况分析**：结合索引使用情况分析，识别缺失的索引
5. **验证优化效果**：实施优化后，验证优化效果，确保性能得到提升
6. **建立慢查询基线**：建立慢查询的基线指标，用于评估优化效果
7. **监控慢查询趋势**：监控慢查询的数量和执行时间变化，及时发现性能问题
8. **记录优化过程**：记录慢查询的优化过程，包括优化前的执行时间、优化措施和优化后的执行时间

## 9. 总结

慢查询分析是数据库性能优化的重要组成部分，通过定期分析慢查询，可以识别性能瓶颈，提出优化建议，提高数据库的性能和响应速度。

本文档介绍了慢查询分析的目标、工具、实现方法和优化建议，通过实施这些方法，可以优化慢查询，提高数据库的性能，为认知辅助系统的稳定运行提供保障。

慢查询分析是一个持续的过程，需要定期执行，不断优化，以适应业务的发展和数据量的增加。