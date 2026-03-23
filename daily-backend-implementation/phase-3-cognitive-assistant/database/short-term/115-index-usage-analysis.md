# 115-索引使用情况分析

## 1. 索引使用情况分析概述

索引使用情况分析是指对数据库中索引的使用情况进行监控和分析，以识别索引使用效率低下、冗余或缺失的情况。通过索引使用情况分析，可以优化索引设计，提高查询性能，减少数据库负载。

## 2. 索引使用情况分析目标

1. **识别未使用的索引**：找出从未被使用的索引，考虑删除以减少维护成本
2. **识别低效使用的索引**：找出使用频率低或效率低的索引，考虑优化或替换
3. **识别缺失的索引**：找出应该创建但尚未创建的索引，提高查询性能
4. **分析索引使用模式**：了解索引的使用模式，为索引优化提供依据
5. **评估索引维护成本**：评估索引的维护成本，包括存储空间和写入性能影响

## 3. 索引使用情况分析工具

### 3.1 PostgreSQL内置工具

| 工具名称 | 类型 | 用途 |
|----------|------|------|
| **pg_stat_user_indexes** | 系统视图 | 提供用户表索引的使用统计信息 |
| **pg_stat_all_indexes** | 系统视图 | 提供所有表索引的使用统计信息，包括系统表 |
| **pg_statio_user_indexes** | 系统视图 | 提供用户表索引的I/O统计信息 |
| **pg_statio_all_indexes** | 系统视图 | 提供所有表索引的I/O统计信息，包括系统表 |
| **pg_index** | 系统目录 | 提供索引的定义和结构信息 |
| **pg_indexes** | 系统视图 | 提供索引的创建语句和基本信息 |
| **pg_stat_statements** | 扩展 | 提供SQL语句的执行统计信息，包括索引使用情况 |

### 3.2 第三方工具

| 工具名称 | 类型 | 用途 |
|----------|------|------|
| **pgBadger** | 日志分析工具 | 分析PostgreSQL日志，提供索引使用情况分析 |
| **pg_stat_kcache** | 扩展 | 提供SQL语句的操作系统级I/O和CPU统计信息 |
| **pganalyze** | 监控工具 | 提供索引使用情况的可视化分析和建议 |
| **Datadog** | 监控工具 | 提供索引使用情况的监控和告警 |

### 3.3 推荐工具

**推荐工具组合**：
- PostgreSQL内置视图（pg_stat_user_indexes, pg_statio_user_indexes）：基础索引使用统计信息
- pg_stat_statements扩展：SQL语句级别的索引使用情况
- pgBadger：日志级别的索引使用情况分析

## 4. 索引使用情况分析实现

### 4.1 启用必要的扩展

```bash
# 启用pg_stat_statements扩展
psql -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"

# 启用pg_stat_kcache扩展（可选）
psql -c "CREATE EXTENSION IF NOT EXISTS pg_stat_kcache;"
```

### 4.2 配置PostgreSQL收集统计信息

修改PostgreSQL配置文件`postgresql.conf`：

```ini
# 启用查询统计收集
pg_stat_statements.max = 10000
pg_stat_statements.track = all
pg_stat_statements.track_utility = off

# 调整统计收集参数
track_activities = on
track_counts = on
track_io_timing = on
track_functions = all

# 调整自动统计收集频率
autovacuum = on
```

重启PostgreSQL服务：

```bash
systemctl restart postgresql-14
```

### 4.3 索引使用情况分析脚本

#### 4.3.1 查看索引使用统计信息

创建索引使用情况分析脚本`analyze_index_usage.sh`：

```bash
#!/bin/bash

# 索引使用情况分析脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
DB_NAME="cognitive_assistant"
OUTPUT_FILE="/tmp/index_usage_analysis_$(date +%Y%m%d_%H%M%S).txt"

# 执行分析
echo "开始执行索引使用情况分析，时间：$(date)" > $OUTPUT_FILE

echo "\n1. 索引使用统计信息：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS index_scans,
    idx_tup_read AS index_tuples_read,
    idx_tup_fetch AS index_tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
" >> $OUTPUT_FILE

echo "\n2. 索引I/O统计信息：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_blks_read AS index_blocks_read,
    idx_blks_hit AS index_blocks_hit,
    CASE
        WHEN idx_blks_read + idx_blks_hit = 0 THEN 0
        ELSE idx_blks_hit::numeric / (idx_blks_read + idx_blks_hit) * 100
    END AS index_hit_rate
FROM pg_statio_user_indexes
ORDER BY index_hit_rate ASC;
" >> $OUTPUT_FILE

echo "\n3. 未使用的索引：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
" >> $OUTPUT_FILE

echo "\n4. 表和索引大小统计：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    n.nspname AS schemaname,
    c.relname AS table_name,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS total_table_size,
    pg_size_pretty(pg_relation_size(c.oid)) AS table_size,
    COALESCE(pg_size_pretty(pg_total_indexes_size(c.oid)), '0 bytes') AS total_index_size,
    CASE
        WHEN pg_total_indexes_size(c.oid) = 0 THEN 0
        ELSE pg_total_indexes_size(c.oid)::numeric / pg_total_relation_size(c.oid) * 100
    END AS index_ratio
FROM pg_class c
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(c.oid) DESC;
" >> $OUTPUT_FILE

echo "\n5. 最常使用的索引：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC
LIMIT 20;
" >> $OUTPUT_FILE

echo "\n6. 查询执行统计（按索引使用）：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    queryid,
    substr(query, 1, 200) AS query_sample,
    calls,
    total_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    idx_blks_hit,
    idx_blks_read
FROM pg_stat_statements
WHERE idx_blks_hit + idx_blks_read > 0
ORDER BY calls DESC
LIMIT 20;
" >> $OUTPUT_FILE

echo "\n7. 缺失索引的查询：" >> $OUTPUT_FILE
psql -d $DB_NAME -c "
SELECT
    queryid,
    substr(query, 1, 200) AS query_sample,
    calls,
    total_time,
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

echo "\n索引使用情况分析完成，时间：$(date)" >> $OUTPUT_FILE

echo "分析结果已保存到：$OUTPUT_FILE"
```

#### 4.3.2 设置脚本权限并执行

```bash
# 设置脚本执行权限
chmod +x analyze_index_usage.sh

# 执行脚本
./analyze_index_usage.sh
```

### 4.4 索引使用情况分析报告

#### 4.4.1 生成HTML格式报告

创建生成HTML报告的脚本`generate_index_report.sh`：

```bash
#!/bin/bash

# 生成索引使用情况HTML报告脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
DB_NAME="cognitive_assistant"
OUTPUT_HTML="/tmp/index_usage_report_$(date +%Y%m%d_%H%M%S).html"

# 生成HTML报告
cat > $OUTPUT_HTML << EOF
<!DOCTYPE html>
<html>
<head>
    <title>PostgreSQL索引使用情况分析报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        h2 { color: #555; margin-top: 30px; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .warning { background-color: #fff3cd; }
        .danger { background-color: #f8d7da; }
        .success { background-color: #d4edda; }
        .container { max-width: 1200px; margin: 0 auto; }
        .summary { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>PostgreSQL索引使用情况分析报告</h1>
        <div class="summary">
            <p><strong>报告生成时间：</strong>$(date)</p>
            <p><strong>数据库：</strong>$DB_NAME</p>
        </div>
EOF

# 添加索引使用统计信息
echo "        <h2>1. 索引使用统计信息</h2>" >> $OUTPUT_HTML
psql -d $DB_NAME -t -A -F',' -c "
SELECT '            <table><tr><th>Schema</th><th>Table</th><th>Index</th><th>Scans</th><th>Tuples Read</th><th>Tuples Fetched</th></tr>' as html
UNION ALL
SELECT format('            <tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>', 
    schemaname, relname, indexrelname, idx_scan, idx_tup_read, idx_tup_fetch) as html
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC
UNION ALL
SELECT '            </table>' as html;
" | tr -d '\n' >> $OUTPUT_HTML

# 添加未使用的索引
echo "        <h2>2. 未使用的索引 <span style='color: red; font-weight: normal;'>(建议考虑删除)</span></h2>" >> $OUTPUT_HTML
psql -d $DB_NAME -t -A -F',' -c "
SELECT '            <table><tr><th>Schema</th><th>Table</th><th>Index</th><th>Scans</th><th>Size</th></tr>' as html
UNION ALL
SELECT format('            <tr class=\"danger\"><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>', 
    schemaname, relname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))) as html
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC
UNION ALL
SELECT '            </table>' as html;
" | tr -d '\n' >> $OUTPUT_HTML

# 添加索引命中率
echo "        <h2>3. 索引命中率</h2>" >> $OUTPUT_HTML
psql -d $DB_NAME -t -A -F',' -c "
SELECT '            <table><tr><th>Schema</th><th>Table</th><th>Index</th><th>Blocks Read</th><th>Blocks Hit</th><th>Hit Rate</th></tr>' as html
UNION ALL
SELECT format('            <tr%s><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%.2f%%</td></tr>', 
    CASE 
        WHEN idx_blks_read + idx_blks_hit = 0 THEN ' class=\"warning\"' 
        WHEN idx_blks_hit::numeric / (idx_blks_read + idx_blks_hit) * 100 < 90 THEN ' class=\"warning\"' 
        ELSE '' 
    END, 
    schemaname, relname, indexrelname, idx_blks_read, idx_blks_hit, 
    CASE 
        WHEN idx_blks_read + idx_blks_hit = 0 THEN 0 
        ELSE idx_blks_hit::numeric / (idx_blks_read + idx_blks_hit) * 100 
    END) as html
FROM pg_statio_user_indexes
ORDER BY CASE 
    WHEN idx_blks_read + idx_blks_hit = 0 THEN 0 
    ELSE idx_blks_hit::numeric / (idx_blks_read + idx_blks_hit) * 100 
END ASC
UNION ALL
SELECT '            </table>' as html;
" | tr -d '\n' >> $OUTPUT_HTML

# 添加表和索引大小
echo "        <h2>4. 表和索引大小统计</h2>" >> $OUTPUT_HTML
psql -d $DB_NAME -t -A -F',' -c "
SELECT '            <table><tr><th>Schema</th><th>Table</th><th>Total Table Size</th><th>Table Size</th><th>Total Index Size</th><th>Index Ratio</th></tr>' as html
UNION ALL
SELECT format('            <tr%s><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%.2f%%</td></tr>', 
    CASE 
        WHEN pg_total_indexes_size(c.oid)::numeric / pg_total_relation_size(c.oid) * 100 > 50 THEN ' class=\"warning\"' 
        ELSE '' 
    END, 
    n.nspname, c.relname, 
    pg_size_pretty(pg_total_relation_size(c.oid)), 
    pg_size_pretty(pg_relation_size(c.oid)), 
    COALESCE(pg_size_pretty(pg_total_indexes_size(c.oid)), '0 bytes'), 
    CASE 
        WHEN pg_total_indexes_size(c.oid) = 0 THEN 0 
        ELSE pg_total_indexes_size(c.oid)::numeric / pg_total_relation_size(c.oid) * 100 
    END) as html
FROM pg_class c
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(c.oid) DESC
UNION ALL
SELECT '            </table>' as html;
" | tr -d '\n' >> $OUTPUT_HTML

# 添加最常使用的索引
echo "        <h2>5. 最常使用的索引</h2>" >> $OUTPUT_HTML
psql -d $DB_NAME -t -A -F',' -c "
SELECT '            <table><tr><th>Schema</th><th>Table</th><th>Index</th><th>Scans</th><th>Size</th></tr>' as html
UNION ALL
SELECT format('            <tr class=\"success\"><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>', 
    schemaname, relname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))) as html
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC
LIMIT 20
UNION ALL
SELECT '            </table>' as html;
" | tr -d '\n' >> $OUTPUT_HTML

echo "        <h2>6. 分析时间</h2>" >> $OUTPUT_HTML
echo "        <p>报告生成时间：$(date)</p>" >> $OUTPUT_HTML

echo "    </div>" >> $OUTPUT_HTML
echo "</body>" >> $OUTPUT_HTML
echo "</html>" >> $OUTPUT_HTML

echo "索引使用情况HTML报告已生成：$OUTPUT_HTML"
```

#### 4.3.3 设置脚本权限并执行

```bash
# 设置脚本执行权限
chmod +x generate_index_report.sh

# 执行脚本
./generate_index_report.sh
```

## 5. 索引使用情况分析结果解读

### 5.1 索引使用统计信息

- **索引扫描次数（idx_scan）**：索引被扫描的次数，次数越多表示索引使用越频繁
- **索引读取的元组数量（idx_tup_read）**：通过索引读取的元组数量
- **索引获取的元组数量（idx_tup_fetch）**：通过索引获取的元组数量，即实际返回给客户端的元组数量

### 5.2 索引I/O统计信息

- **索引块读取次数（idx_blks_read）**：从磁盘读取的索引块数量
- **索引块命中次数（idx_blks_hit）**：从缓存读取的索引块数量
- **索引命中率**：索引块命中次数 / (索引块读取次数 + 索引块命中次数)，命中率越高表示索引使用效率越高

### 5.3 未使用的索引

- 索引扫描次数为0的索引，表示从未被使用
- 这些索引增加了存储空间和写入成本，但没有带来查询性能提升
- 建议考虑删除这些索引，或分析为什么没有被使用

### 5.4 表和索引大小统计

- **总表大小**：表数据和索引的总大小
- **表大小**：表数据的大小
- **总索引大小**：所有索引的总大小
- **索引比例**：索引大小 / 总表大小，比例过高表示索引维护成本较高

### 5.5 最常使用的索引

- 扫描次数最多的索引，表示这些索引对查询性能至关重要
- 应该重点关注这些索引的维护和优化

## 6. 索引使用情况分析的最佳实践

1. **定期分析**：定期执行索引使用情况分析，建议每周或每月执行一次
2. **结合慢查询分析**：结合慢查询日志和pg_stat_statements分析，找出需要优化的查询
3. **关注索引命中率**：索引命中率低于90%的索引可能需要优化
4. **删除未使用的索引**：删除长期未使用的索引，减少维护成本
5. **监控索引维护成本**：监控索引对写入性能的影响，特别是在高写入负载的表上
6. **分析查询模式**：了解查询模式，为不同的查询类型设计合适的索引
7. **考虑索引覆盖**：对于频繁执行的查询，考虑使用覆盖索引，减少I/O操作

## 7. 索引使用情况分析的常见问题

### 7.1 索引未被使用的原因

1. **索引设计不合理**：索引列的顺序或类型不符合查询需求
2. **统计信息过时**：PostgreSQL的统计信息过时，导致查询优化器选择了错误的执行计划
3. **查询条件不匹配**：查询条件与索引定义不匹配，无法使用索引
4. **全表扫描更高效**：表数据量较小，全表扫描比使用索引更高效
5. **索引被忽略**：查询优化器认为全表扫描更高效，忽略了索引

### 7.2 如何解决索引未被使用的问题

1. **重新设计索引**：根据查询模式重新设计索引
2. **更新统计信息**：执行`ANALYZE`命令更新统计信息
3. **修改查询语句**：调整查询语句，使其能够使用索引
4. **强制使用索引**：在查询中使用`INDEX`提示，但谨慎使用
5. **考虑删除或重构索引**：如果索引确实不需要，考虑删除或重构

## 8. 总结

索引使用情况分析是数据库性能优化的重要组成部分，通过定期分析索引使用情况，可以识别未使用的索引、低效使用的索引和缺失的索引，为索引优化提供依据。

本文档介绍了索引使用情况分析的目标、工具、实现方法和结果解读，通过实施这些方法，可以优化索引设计，提高查询性能，减少数据库负载，为认知辅助系统的稳定运行提供保障。