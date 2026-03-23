# 118-索引优化实现代码

## 1. 索引优化实施概述

本文档包含了根据117-index-optimization-design.md中设计的索引优化方案的具体实现代码。实施内容包括：

1. 添加必要索引
2. 移除冗余索引
3. 优化现有索引
4. 实施验证脚本
5. 回滚方案

所有操作均遵循安全、可靠的原则，确保在生产环境实施时不会对业务造成重大影响。

## 2. 实施前准备

### 2.1 环境检查

在实施前，需要检查数据库环境是否符合要求：

```bash
# 检查PostgreSQL版本
psql -c "SELECT version();"

# 检查数据库连接
psql -c "\l"

# 检查当前索引使用情况
psql -c "SELECT * FROM pg_stat_user_indexes;"
```

### 2.2 备份数据库结构

在实施前，需要备份当前数据库结构，以便在出现问题时能够快速回滚：

```bash
# 备份数据库结构
pg_dump -s -d <database_name> > database_schema_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2.3 记录当前索引状态

在实施前，需要记录当前索引状态，以便比较实施前后的变化：

```bash
# 记录当前索引状态
psql -c "\di" <database_name> > current_indexes_$(date +%Y%m%d_%H%M%S).txt

# 记录索引使用情况
psql -c "SELECT schemaname, relname, indexrelname, idx_scan, idx_tup_read, idx_tup_fetch FROM pg_stat_user_indexes;" <database_name> > current_index_usage_$(date +%Y%m%d_%H%M%S).txt
```

## 3. 索引优化实施代码

### 3.1 连接到数据库

```bash
# 连接到数据库
psql -d <database_name>
```

### 3.2 添加必要索引

#### 3.2.1 cognitive_model表

```sql
-- 添加基于user_id的索引
CREATE INDEX idx_cognitive_model_user_id ON cognitive_model(user_id);

-- 添加基于created_at的索引
CREATE INDEX idx_cognitive_model_created_at ON cognitive_model(created_at);
```

#### 3.2.2 cognitive_concept表

```sql
-- 添加基于name的索引
CREATE INDEX idx_cognitive_concept_name ON cognitive_concept(name);

-- 添加基于type的索引
CREATE INDEX idx_cognitive_concept_type ON cognitive_concept(type);

-- 添加基于model_id和type的复合索引
CREATE INDEX idx_cognitive_concept_model_type ON cognitive_concept(model_id, type);

-- 添加基于model_id和name的复合索引
CREATE INDEX idx_cognitive_concept_model_name ON cognitive_concept(model_id, name);
```

#### 3.2.3 cognitive_relation表

```sql
-- 添加基于relation_type的索引
CREATE INDEX idx_cognitive_relation_type ON cognitive_relation(relation_type);

-- 添加基于model_id和relation_type的复合索引
CREATE INDEX idx_cognitive_relation_model_type ON cognitive_relation(model_id, relation_type);

-- 添加基于source_concept_id和relation_type的复合索引
CREATE INDEX idx_cognitive_relation_source_type ON cognitive_relation(source_concept_id, relation_type);

-- 添加基于target_concept_id和relation_type的复合索引
CREATE INDEX idx_cognitive_relation_target_type ON cognitive_relation(target_concept_id, relation_type);
```

#### 3.2.4 thought_fragment表

```sql
-- 添加基于created_at的索引
CREATE INDEX idx_thought_fragment_created_at ON thought_fragment(created_at);

-- 添加基于status的索引
CREATE INDEX idx_thought_fragment_status ON thought_fragment(status);

-- 添加基于user_id和created_at的复合索引
CREATE INDEX idx_thought_fragment_user_created ON thought_fragment(user_id, created_at DESC);

-- 添加基于user_id和status的复合索引
CREATE INDEX idx_thought_fragment_user_status ON thought_fragment(user_id, status);
```

#### 3.2.5 cognitive_insight表

```sql
-- 添加基于insight_type的索引
CREATE INDEX idx_cognitive_insight_type ON cognitive_insight(insight_type);

-- 添加基于created_at的索引
CREATE INDEX idx_cognitive_insight_created_at ON cognitive_insight(created_at);

-- 添加基于model_id和insight_type的复合索引
CREATE INDEX idx_cognitive_insight_model_type ON cognitive_insight(model_id, insight_type);
```

### 3.3 移除冗余索引

根据索引使用情况分析，当前没有需要移除的冗余索引。如果后续分析发现冗余索引，可以使用以下命令移除：

```sql
-- 移除冗余索引的通用命令
DROP INDEX IF EXISTS <index_name>;
```

### 3.4 优化现有索引

当前没有需要优化的现有索引结构。如果需要调整现有索引，可以使用以下命令：

```sql
-- 优化现有索引的通用命令
-- 1. 先创建新索引
CREATE INDEX <new_index_name> ON <table_name>(<column1>, <column2>, ...);

-- 2. 然后移除旧索引
DROP INDEX IF EXISTS <old_index_name>;
```

## 4. 实施验证脚本

### 4.1 验证索引是否创建成功

```sql
-- 验证所有索引是否创建成功
SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- 验证特定表的索引
\di cognitive_model*
\di cognitive_concept*
\di cognitive_relation*
\di thought_fragment*
\di cognitive_insight*
```

### 4.2 验证索引是否被正确使用

```sql
-- 执行一些常见查询，然后检查索引使用情况

-- 1. 查询用户的认知模型
EXPLAIN ANALYZE SELECT * FROM cognitive_model WHERE user_id = 1;

-- 2. 查询用户的认知模型按时间排序
EXPLAIN ANALYZE SELECT * FROM cognitive_model WHERE user_id = 1 ORDER BY created_at DESC;

-- 3. 查询特定类型的认知概念
EXPLAIN ANALYZE SELECT * FROM cognitive_concept WHERE model_id = 1 AND type = 'core';

-- 4. 查询用户的思考片段按时间排序
EXPLAIN ANALYZE SELECT * FROM thought_fragment WHERE user_id = 1 ORDER BY created_at DESC;

-- 5. 查询特定类型的认知洞察
EXPLAIN ANALYZE SELECT * FROM cognitive_insight WHERE model_id = 1 AND insight_type = 'gap';

-- 检查索引使用情况
SELECT schemaname, relname, indexrelname, idx_scan, idx_tup_read, idx_tup_fetch FROM pg_stat_user_indexes WHERE indexrelname LIKE 'idx_%';
```

### 4.3 验证查询性能提升

```sql
-- 记录查询执行时间的脚本
\timing

-- 执行常见查询并记录执行时间
SELECT * FROM cognitive_model WHERE user_id = 1;
SELECT * FROM cognitive_model WHERE user_id = 1 ORDER BY created_at DESC;
SELECT * FROM cognitive_concept WHERE model_id = 1 AND type = 'core';
SELECT * FROM thought_fragment WHERE user_id = 1 ORDER BY created_at DESC;
SELECT * FROM cognitive_insight WHERE model_id = 1 AND insight_type = 'gap';

\timing
```

## 5. 回滚方案

### 5.1 回滚添加的索引

如果实施过程中出现问题，可以使用以下命令回滚添加的索引：

```sql
-- 回滚cognitive_model表的索引
DROP INDEX IF EXISTS idx_cognitive_model_user_id;
DROP INDEX IF EXISTS idx_cognitive_model_created_at;

-- 回滚cognitive_concept表的索引
DROP INDEX IF EXISTS idx_cognitive_concept_name;
DROP INDEX IF EXISTS idx_cognitive_concept_type;
DROP INDEX IF EXISTS idx_cognitive_concept_model_type;
DROP INDEX IF EXISTS idx_cognitive_concept_model_name;

-- 回滚cognitive_relation表的索引
DROP INDEX IF EXISTS idx_cognitive_relation_type;
DROP INDEX IF EXISTS idx_cognitive_relation_model_type;
DROP INDEX IF EXISTS idx_cognitive_relation_source_type;
DROP INDEX IF EXISTS idx_cognitive_relation_target_type;

-- 回滚thought_fragment表的索引
DROP INDEX IF EXISTS idx_thought_fragment_created_at;
DROP INDEX IF EXISTS idx_thought_fragment_status;
DROP INDEX IF EXISTS idx_thought_fragment_user_created;
DROP INDEX IF EXISTS idx_thought_fragment_user_status;

-- 回滚cognitive_insight表的索引
DROP INDEX IF EXISTS idx_cognitive_insight_type;
DROP INDEX IF EXISTS idx_cognitive_insight_created_at;
DROP INDEX IF EXISTS idx_cognitive_insight_model_type;
```

### 5.2 从备份恢复数据库结构

如果回滚索引操作后仍有问题，可以从之前备份的数据库结构中恢复：

```bash
# 从备份恢复数据库结构
psql -d <database_name> -f database_schema_backup_<timestamp>.sql
```

## 6. 自动化实施脚本

为了方便实施，可以使用以下自动化脚本来执行索引优化：

```bash
#!/bin/bash

# 索引优化实施脚本

# 配置数据库连接信息
DB_NAME="<database_name>"
DB_USER="<database_user>"
DB_HOST="<database_host>"
DB_PORT="<database_port>"

# 备份当前时间戳
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 日志函数
log() {
    echo "[$(date +%Y-%m-%d%H:%M:%S)] $1"
}

# 备份数据库结构
log "备份数据库结构..."
pq_dump -s -d $DB_NAME -U $DB_USER -h $DB_HOST -p $DB_PORT > database_schema_backup_$TIMESTAMP.sql
if [ $? -eq 0 ]; then
    log "数据库结构备份成功: database_schema_backup_$TIMESTAMP.sql"
else
    log "数据库结构备份失败，退出脚本"
    exit 1
fi

# 记录当前索引状态
log "记录当前索引状态..."
psql -d $DB_NAME -U $DB_USER -h $DB_HOST -p $DB_PORT -c "\di" > current_indexes_$TIMESTAMP.txt
psql -d $DB_NAME -U $DB_USER -h $DB_HOST -p $DB_PORT -c "SELECT schemaname, relname, indexrelname, idx_scan, idx_tup_read, idx_tup_fetch FROM pg_stat_user_indexes;" > current_index_usage_$TIMESTAMP.txt
log "当前索引状态记录完成"

# 执行索引优化
log "开始执行索引优化..."

# 创建SQL文件
cat > index_optimization_$TIMESTAMP.sql << EOF
-- 索引优化实施SQL

-- cognitive_model表
CREATE INDEX idx_cognitive_model_user_id ON cognitive_model(user_id);
CREATE INDEX idx_cognitive_model_created_at ON cognitive_model(created_at);

-- cognitive_concept表
CREATE INDEX idx_cognitive_concept_name ON cognitive_concept(name);
CREATE INDEX idx_cognitive_concept_type ON cognitive_concept(type);
CREATE INDEX idx_cognitive_concept_model_type ON cognitive_concept(model_id, type);
CREATE INDEX idx_cognitive_concept_model_name ON cognitive_concept(model_id, name);

-- cognitive_relation表
CREATE INDEX idx_cognitive_relation_type ON cognitive_relation(relation_type);
CREATE INDEX idx_cognitive_relation_model_type ON cognitive_relation(model_id, relation_type);
CREATE INDEX idx_cognitive_relation_source_type ON cognitive_relation(source_concept_id, relation_type);
CREATE INDEX idx_cognitive_relation_target_type ON cognitive_relation(target_concept_id, relation_type);

-- thought_fragment表
CREATE INDEX idx_thought_fragment_created_at ON thought_fragment(created_at);
CREATE INDEX idx_thought_fragment_status ON thought_fragment(status);
CREATE INDEX idx_thought_fragment_user_created ON thought_fragment(user_id, created_at DESC);
CREATE INDEX idx_thought_fragment_user_status ON thought_fragment(user_id, status);

-- cognitive_insight表
CREATE INDEX idx_cognitive_insight_type ON cognitive_insight(insight_type);
CREATE INDEX idx_cognitive_insight_created_at ON cognitive_insight(created_at);
CREATE INDEX idx_cognitive_insight_model_type ON cognitive_insight(model_id, insight_type);
EOF

# 执行SQL文件
psql -d $DB_NAME -U $DB_USER -h $DB_HOST -p $DB_PORT -f index_optimization_$TIMESTAMP.sql
if [ $? -eq 0 ]; then
    log "索引优化实施成功"
else
    log "索引优化实施失败，退出脚本"
    exit 1
fi

# 验证索引创建成功
log "验证索引创建成功..."
psql -d $DB_NAME -U $DB_USER -h $DB_HOST -p $DB_PORT -c "SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;" > new_indexes_$TIMESTAMP.txt
log "索引验证完成，新索引列表保存在new_indexes_$TIMESTAMP.txt"

# 执行性能测试
log "执行性能测试..."
cat > performance_test_$TIMESTAMP.sql << EOF
\timing

-- 测试查询1: 查询用户的认知模型
SELECT * FROM cognitive_model WHERE user_id = 1;

-- 测试查询2: 查询用户的认知模型按时间排序
SELECT * FROM cognitive_model WHERE user_id = 1 ORDER BY created_at DESC;

-- 测试查询3: 查询特定类型的认知概念
SELECT * FROM cognitive_concept WHERE model_id = 1 AND type = 'core';

-- 测试查询4: 查询用户的思考片段按时间排序
SELECT * FROM thought_fragment WHERE user_id = 1 ORDER BY created_at DESC;

-- 测试查询5: 查询特定类型的认知洞察
SELECT * FROM cognitive_insight WHERE model_id = 1 AND insight_type = 'gap';

\timing
EOF

psql -d $DB_NAME -U $DB_USER -h $DB_HOST -p $DB_PORT -f performance_test_$TIMESTAMP.sql > performance_test_results_$TIMESTAMP.txt
log "性能测试完成，结果保存在performance_test_results_$TIMESTAMP.txt"

log "索引优化实施完成！"
log "实施日志和备份文件："
log "  - 数据库结构备份: database_schema_backup_$TIMESTAMP.sql"
log "  - 当前索引状态: current_indexes_$TIMESTAMP.txt"
log "  - 当前索引使用情况: current_index_usage_$TIMESTAMP.txt"
log "  - 索引优化SQL: index_optimization_$TIMESTAMP.sql"
log "  - 新索引列表: new_indexes_$TIMESTAMP.txt"
log "  - 性能测试结果: performance_test_results_$TIMESTAMP.txt"
```

## 7. 实施注意事项

1. **实施时间**：建议在业务低峰期实施，减少对业务的影响
2. **监控性能**：实施过程中实时监控数据库性能，发现问题及时回滚
3. **分批实施**：对于大表，可以考虑分批实施索引优化
4. **充分测试**：在测试环境充分测试后再在生产环境实施
5. **准备回滚方案**：提前准备回滚脚本，以便在出现问题时快速恢复
6. **通知相关团队**：实施前通知开发和测试团队，避免在实施过程中进行大量数据操作

## 8. 总结

本文档提供了详细的索引优化实施代码，包括添加必要索引、验证索引使用情况、性能测试和回滚方案。通过自动化脚本的方式，可以方便地在生产环境实施索引优化，提高数据库查询性能，降低数据库负载。

实施完成后，建议定期监控索引使用情况，根据业务需求和查询模式的变化，持续优化索引设计，确保数据库始终保持良好的性能。