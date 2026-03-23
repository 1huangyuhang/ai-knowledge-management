# 144-data-partitioning-strategy.md

# 数据分区策略设计

## 1. 设计概述

本文档详细设计了AI认知辅助系统的数据库数据分区策略。针对系统中的业务数据库（PostgreSQL）和分析数据库（ClickHouse），设计了不同的分区方案，以优化查询性能、提高数据管理效率和支持系统的可扩展性。

## 2. 设计原则

### 2.1 核心原则

- **性能优化**：通过分区减少查询扫描的数据量，提高查询性能
- **可管理性**：简化数据管理，便于数据归档、清理和维护
- **可扩展性**：支持数据量的持续增长，提高系统的扩展性
- **可用性**：减少单个分区的故障影响范围，提高系统可用性
- **兼容性**：与现有系统和应用程序兼容，降低迁移成本
- **灵活性**：支持多种分区策略，适应不同的数据类型和查询模式

### 2.2 技术选型原则

- **PostgreSQL分区**：利用PostgreSQL 14的原生分区功能，支持范围分区、列表分区和哈希分区
- **ClickHouse分区**：利用ClickHouse的分区和排序功能，优化分析查询性能
- **分区键选择**：基于查询模式选择合适的分区键，提高查询性能
- **分区粒度**：根据数据量和查询需求选择合适的分区粒度
- **自动化管理**：实现分区的自动创建、维护和清理

## 3. 数据分区需求分析

### 3.1 业务数据特征

1. **认知事件数据**：
   - 高写入频率，每天生成大量事件
   - 查询主要按时间范围和用户ID进行
   - 数据量大，需要长期存储
   - 历史数据访问频率较低

2. **概念关系数据**：
   - 中等写入频率
   - 查询主要按概念ID和关系类型进行
   - 数据量随时间增长
   - 需要支持复杂的图查询

3. **洞察生成数据**：
   - 低写入频率
   - 查询主要按用户ID、洞察类型和生成时间进行
   - 数据量相对较小，但需要支持复杂分析

4. **用户认知模型数据**：
   - 中等写入频率
   - 查询主要按用户ID进行
   - 数据与用户强关联
   - 需要支持频繁更新

### 3.2 查询模式分析

| 查询类型 | 主要查询条件 | 数据量 | 响应时间要求 |
|---------|-------------|-------|-------------|
| 实时监控查询 | 时间范围（最近几分钟/几小时）、用户ID | 小 | 秒级 |
| 定期报表查询 | 时间范围（日/周/月）、维度筛选 | 中 | 秒级至分钟级 |
| 历史数据查询 | 时间范围（月/年）、多维度筛选 | 大 | 分钟级 |
| 复杂分析查询 | 多维度组合查询、聚合计算 | 大 | 分钟级至小时级 |

## 4. PostgreSQL分区策略

### 4.1 分区类型选择

PostgreSQL支持三种分区类型，根据业务需求选择合适的分区类型：

| 分区类型 | 适用场景 | 优势 | 劣势 |
|---------|---------|------|------|
| 范围分区 | 时间序列数据、数值范围数据 | 查询性能好，便于数据管理 | 不适合离散值 |
| 列表分区 | 离散值数据、分类数据 | 灵活性高，支持复杂筛选 | 查询性能相对较低 |
| 哈希分区 | 均匀分布数据、负载均衡 | 数据分布均匀，提高并发性能 | 不适合范围查询 |

### 4.2 核心表分区设计

#### 4.2.1 认知事件表 (cognitive_events)

```sql
-- 创建主表
CREATE TABLE cognitive_events (
    event_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    concept_id UUID,
    event_type_id INTEGER NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- 创建索引
CREATE INDEX idx_cognitive_events_user_id ON cognitive_events (user_id);
CREATE INDEX idx_cognitive_events_concept_id ON cognitive_events (concept_id);
CREATE INDEX idx_cognitive_events_event_type_id ON cognitive_events (event_type_id);

-- 创建分区表（按月分区）
CREATE TABLE cognitive_events_202301 PARTITION OF cognitive_events
    FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');

CREATE TABLE cognitive_events_202302 PARTITION OF cognitive_events
    FOR VALUES FROM ('2023-02-01') TO ('2023-03-01');

-- 自动创建分区的触发器函数
CREATE OR REPLACE FUNCTION create_cognitive_events_partition()
RETURNS TRIGGER AS $$
BEGIN
    DECLARE
        partition_date TEXT;
        partition_name TEXT;
        start_date TIMESTAMP;
        end_date TIMESTAMP;
    BEGIN
        partition_date := TO_CHAR(NEW.created_at, 'YYYYMM');
        partition_name := 'cognitive_events_' || partition_date;
        start_date := DATE_TRUNC('month', NEW.created_at);
        end_date := start_date + INTERVAL '1 month';
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = partition_name
        ) THEN
            EXECUTE format(
                'CREATE TABLE public.%I PARTITION OF public.cognitive_events
                FOR VALUES FROM (%L) TO (%L)',
                partition_name, start_date, end_date
            );
        END IF;
        
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trg_create_cognitive_events_partition
BEFORE INSERT ON cognitive_events
FOR EACH ROW EXECUTE FUNCTION create_cognitive_events_partition();
```

#### 4.2.2 概念关系表 (cognitive_relations)

```sql
-- 创建主表
CREATE TABLE cognitive_relations (
    relation_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    source_concept_id UUID NOT NULL,
    target_concept_id UUID NOT NULL,
    relation_type_id INTEGER NOT NULL,
    strength FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- 创建索引
CREATE INDEX idx_cognitive_relations_user_id ON cognitive_relations (user_id);
CREATE INDEX idx_cognitive_relations_source_concept ON cognitive_relations (source_concept_id);
CREATE INDEX idx_cognitive_relations_target_concept ON cognitive_relations (target_concept_id);
CREATE INDEX idx_cognitive_relations_type ON cognitive_relations (relation_type_id);

-- 创建分区表（按月分区）
-- 类似cognitive_events表，创建自动分区触发器
```

#### 4.2.3 洞察生成表 (cognitive_insights)

```sql
-- 创建主表
CREATE TABLE cognitive_insights (
    insight_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    insight_type_id INTEGER NOT NULL,
    confidence_score FLOAT DEFAULT 0.0,
    content TEXT NOT NULL,
    metadata JSONB,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_response INTEGER DEFAULT 0
) PARTITION BY RANGE (generated_at);

-- 创建索引
CREATE INDEX idx_cognitive_insights_user_id ON cognitive_insights (user_id);
CREATE INDEX idx_cognitive_insights_type ON cognitive_insights (insight_type_id);
CREATE INDEX idx_cognitive_insights_confidence ON cognitive_insights (confidence_score);

-- 创建分区表（按月分区）
-- 类似cognitive_events表，创建自动分区触发器
```

#### 4.2.4 用户认知模型表 (user_cognitive_models)

```sql
-- 此表按用户ID哈希分区，提高并发性能
CREATE TABLE user_cognitive_models (
    model_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    model_data JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY HASH (user_id);

-- 创建8个哈希分区
CREATE TABLE user_cognitive_models_p0 PARTITION OF user_cognitive_models
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);

CREATE TABLE user_cognitive_models_p1 PARTITION OF user_cognitive_models
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);

-- ... 创建剩余6个分区 ...

-- 创建索引
CREATE INDEX idx_user_cognitive_models_version ON user_cognitive_models (version);
```

### 4.3 分区管理策略

1. **自动分区创建**：
   - 使用触发器自动创建新分区
   - 支持提前创建未来分区
   - 定期检查和创建分区

2. **分区维护**：
   - 定期收集分区统计信息
   - 定期重建分区索引
   - 监控分区大小和性能

3. **分区清理**：
   - 自动归档过期分区数据
   - 支持分区数据的快速删除
   - 实现数据生命周期管理

## 5. ClickHouse分区策略

### 5.1 ClickHouse分区特性

- **列式存储**：按列存储数据，提高查询性能
- **分区和排序**：支持按任意字段分区，按任意字段排序
- **数据压缩**：高效的数据压缩算法，降低存储成本
- **分布式支持**：支持分布式表和本地表
- **实时数据**：支持实时数据摄入和查询

### 5.2 核心表分区设计

#### 5.2.1 认知事件事实表 (cognitive_events)

```sql
CREATE TABLE analytics.cognitive_events (
    event_id UUID DEFAULT generateUUIDv4() PRIMARY KEY,
    user_id UUID NOT NULL,
    concept_id UUID,
    event_type_id UInt8 NOT NULL,
    event_data JSON,
    event_time DateTime64(3) DEFAULT now64(3),
    processed_at DateTime64(3) DEFAULT now64(3),
    duration_ms UInt32 DEFAULT 0,
    interaction_strength Float32 DEFAULT 0
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(event_time) -- 按天分区
ORDER BY (user_id, event_time, event_type_id) -- 按用户ID、时间、事件类型排序
TTL event_time + INTERVAL 1 YEAR -- 数据保留1年
SETTINGS index_granularity = 8192;
```

#### 5.2.2 概念交互事实表 (concept_interactions)

```sql
CREATE TABLE analytics.concept_interactions (
    interaction_id UUID DEFAULT generateUUIDv4() PRIMARY KEY,
    user_id UUID NOT NULL,
    source_concept_id UUID NOT NULL,
    target_concept_id UUID NOT NULL,
    relation_type_id UInt8 NOT NULL,
    interaction_time DateTime64(3) DEFAULT now64(3),
    interaction_strength Float32 DEFAULT 0,
    interaction_count UInt32 DEFAULT 1
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(interaction_time) -- 按月分区
ORDER BY (user_id, interaction_time, source_concept_id) -- 按用户ID、时间、源概念ID排序
TTL interaction_time + INTERVAL 2 YEAR -- 数据保留2年
SETTINGS index_granularity = 8192;
```

#### 5.2.3 洞察生成事实表 (insight_generations)

```sql
CREATE TABLE analytics.insight_generations (
    insight_id UUID DEFAULT generateUUIDv4() PRIMARY KEY,
    user_id UUID NOT NULL,
    insight_type_id UInt8 NOT NULL,
    generated_at DateTime64(3) DEFAULT now64(3),
    confidence_score Float32 DEFAULT 0,
    impact_score Float32 DEFAULT 0,
    implementation_ease Float32 DEFAULT 0,
    user_response UInt8 DEFAULT 0
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(generated_at) -- 按月分区
ORDER BY (user_id, generated_at, insight_type_id) -- 按用户ID、时间、洞察类型排序
TTL generated_at + INTERVAL 3 YEAR -- 数据保留3年
SETTINGS index_granularity = 8192;
```

#### 5.2.4 维度表分区设计

维度表一般不进行分区，或按主键排序：

```sql
CREATE TABLE analytics.dim_users (
    user_id UUID PRIMARY KEY,
    user_name String,
    user_email String,
    user_type String,
    registration_date Date,
    last_active_date Date,
    created_at DateTime64(3) DEFAULT now64(3),
    updated_at DateTime64(3) DEFAULT now64(3)
) ENGINE = MergeTree()
ORDER BY user_id -- 按用户ID排序
SETTINGS index_granularity = 8192;
```

### 5.3 ClickHouse分区优化策略

1. **分区键选择**：
   - 基于查询模式选择分区键，优先选择时间字段
   - 分区粒度根据数据量和查询需求确定
   - 避免过多分区，影响性能

2. **排序键选择**：
   - 结合查询条件选择排序键
   - 将常用的过滤字段放在排序键前面
   - 考虑数据压缩效果

3. **TTL策略**：
   - 为不同类型的数据设置不同的TTL
   - 自动清理过期数据，降低存储成本
   - 结合分区策略，优化TTL性能

4. **索引优化**：
   - 为常用查询字段创建二级索引
   - 合理设置索引粒度
   - 避免创建过多索引

## 6. 分区迁移与同步策略

### 6.1 数据迁移策略

1. **初始数据迁移**：
   - 使用批量迁移工具（如pg_dump、COPY命令）
   - 按分区批量迁移，减少迁移时间
   - 验证迁移数据的完整性和一致性

2. **增量数据同步**：
   - 使用CDC工具（如Debezium）实现实时数据同步
   - 确保分区数据的一致性
   - 监控同步延迟和数据质量

3. **跨数据库同步**：
   - 从PostgreSQL同步数据到ClickHouse
   - 保持分区策略的一致性
   - 实现数据格式转换和优化

### 6.2 分区同步机制

| 同步类型 | 工具/技术 | 频率 | 一致性保证 |
|---------|-----------|------|-----------|
| PostgreSQL内部分区同步 | 触发器/定期任务 | 实时/定期 | 强一致性 |
| PostgreSQL到ClickHouse | Debezium + Kafka | 实时 | 最终一致性 |
| 历史数据迁移 | 批量导入工具 | 一次性 | 强一致性 |
| 跨集群同步 | ClickHouse复制 | 实时 | 最终一致性 |

## 7. 性能优化与监控

### 7.1 性能优化

1. **查询优化**：
   - 使用分区键进行过滤，减少扫描的数据量
   - 优化查询计划，避免跨分区查询
   - 利用预聚合数据和物化视图

2. **存储优化**：
   - 选择合适的压缩算法
   - 优化分区大小，避免过大或过小的分区
   - 实现数据分层存储

3. **资源优化**：
   - 调整内存配置，提高查询性能
   - 优化CPU使用，提高并行查询能力
   - 调整IO配置，提高数据读写性能

### 7.2 监控与告警

1. **分区监控指标**：
   - 分区数量和大小
   - 分区创建和删除频率
   - 分区查询性能
   - 分区数据分布

2. **监控工具**：
   - PostgreSQL：pg_stat_statements、pg_stat_partitions
   - ClickHouse：system.parts、system.partitions
   - 第三方监控：Prometheus + Grafana

3. **告警规则**：
   - 分区数量异常增长
   - 单个分区过大
   - 分区查询性能下降
   - 分区同步延迟过高

## 8. 数据生命周期管理

### 8.1 数据生命周期策略

| 数据类型 | 存储阶段 | 存储位置 | 保留期限 | 访问频率 |
|---------|---------|---------|---------|---------|
| 热数据 | 实时访问 | PostgreSQL + ClickHouse | 最近30天 | 高频 |
| 温数据 | 定期访问 | PostgreSQL + ClickHouse | 30天至1年 | 中频 |
| 冷数据 | 历史归档 | ClickHouse + 归档存储 | 1年以上 | 低频 |
| 过期数据 | 数据清理 | - | 超过保留期限 | 无 |

### 8.2 数据归档与清理

1. **PostgreSQL数据归档**：
   - 使用pg_dump归档过期分区
   - 将归档数据存储到低成本存储
   - 实现归档数据的快速恢复

2. **ClickHouse数据清理**：
   - 利用TTL自动清理过期数据
   - 手动清理不再需要的分区
   - 实现数据的分层存储

3. **自动化管理**：
   - 编写定期任务，自动归档和清理数据
   - 监控数据生命周期执行情况
   - 记录数据归档和清理日志

## 9. 实施计划

### 9.1 阶段1：分区策略设计与验证 (7天)

- 完成分区策略设计
- 验证分区设计的性能和可行性
- 制定详细的实施计划

### 9.2 阶段2：PostgreSQL分区实施 (14天)

- 修改现有表结构，实现分区
- 迁移历史数据到分区表
- 测试分区查询性能
- 实现分区自动化管理

### 9.3 阶段3：ClickHouse分区实施 (7天)

- 创建分区表结构
- 实现数据同步和分区
- 测试分析查询性能
- 优化分区和排序策略

### 9.4 阶段4：监控与优化 (7天)

- 部署分区监控系统
- 配置告警规则
- 进行性能测试和优化
- 完善文档和培训

### 9.5 阶段5：上线与运维 (7天)

- 正式上线分区系统
- 监控系统运行状态
- 优化分区策略
- 建立运维流程

## 10. 成本评估

### 10.1 实施成本

| 阶段 | 人力成本 | 时间 | 总计 |
|------|---------|------|------|
| 设计与验证 | 数据库工程师 × 1 | 7天 | $5,600 |
| PostgreSQL实施 | 数据库工程师 × 2 | 14天 | $22,400 |
| ClickHouse实施 | 数据库工程师 × 1 | 7天 | $5,600 |
| 监控与优化 | 数据库工程师 × 1 + 运维工程师 × 1 | 7天 | $11,200 |
| 上线与运维 | 数据库工程师 × 1 + 运维工程师 × 1 | 7天 | $11,200 |
| 总计 | - | 42天 | $56,000 |

### 10.2 运营成本

| 成本项 | 预估成本/月 | 说明 |
|--------|-----------|------|
| 存储成本 | $2,000 | 分区后的数据存储成本 |
| 计算成本 | $3,000 | 查询和维护所需的计算资源 |
| 运维成本 | $5,000 | 分区管理和监控所需的人力成本 |
| 总计 | $10,000 | 每月运营成本 |

### 10.3 ROI分析

| 指标 | 预期值 | 说明 |
|------|--------|------|
| 查询性能提升 | 5-10倍 | 特别是历史数据查询和分析查询 |
| 存储成本降低 | 30% | 通过数据压缩和分层存储 |
| 运维效率提升 | 50% | 通过自动化分区管理 |
| 系统扩展性提高 | 10倍 | 支持更大的数据量和更高的并发 |
| 投资回收期 | 18个月 | 基于实施和运营成本 |

## 11. 风险评估

| 风险 | 可能性 | 影响程度 | 应对措施 |
|------|--------|----------|----------|
| 性能退化 | 低 | 高 | 充分测试分区设计，制定回滚计划 |
| 数据不一致 | 低 | 高 | 实现严格的数据验证和监控 |
| 迁移复杂度 | 中 | 中 | 分阶段迁移，验证迁移数据 |
| 应用兼容性 | 低 | 中 | 测试现有应用程序的兼容性 |
| 运维复杂度 | 中 | 中 | 实现自动化管理，提供培训 |
| 成本超支 | 低 | 中 | 制定详细的成本预算和监控 |

## 12. 结论与建议

### 12.1 设计结论

本数据分区策略设计充分考虑了AI认知辅助系统的数据特征和查询模式，为PostgreSQL和ClickHouse数据库设计了不同的分区方案。PostgreSQL采用范围分区和哈希分区相结合的方式，优化业务交易查询性能；ClickHouse采用按时间分区和合理的排序键，优化分析查询性能。

通过实施该分区策略，可以显著提高系统的查询性能、可扩展性和可管理性，降低存储成本，支持系统的长期发展。

### 12.2 实施建议

1. **分阶段实施**：按照实施计划分阶段部署，降低风险
2. **充分测试**：在正式上线前进行全面的性能测试
3. **监控优先**：建立完善的分区监控体系
4. **自动化管理**：实现分区的自动创建、维护和清理
5. **持续优化**：根据实际运行情况持续优化分区策略

### 12.3 后续工作

1. 开始分区策略的实施和部署
2. 迁移现有数据到分区表
3. 部署分区监控系统
4. 优化分区查询性能
5. 建立数据生命周期管理机制

## 13. 附录

### 13.1 分区查询示例

#### 13.1.1 PostgreSQL分区查询

```sql
-- 查询最近7天的认知事件
SELECT * FROM cognitive_events 
WHERE created_at BETWEEN NOW() - INTERVAL '7 days' AND NOW();

-- 查询特定用户的认知事件
SELECT * FROM cognitive_events 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- 查询特定类型的认知事件
SELECT * FROM cognitive_events 
WHERE event_type_id = 1 AND created_at BETWEEN '2023-01-01' AND '2023-01-31';
```

#### 13.1.2 ClickHouse分区查询

```sql
-- 查询最近24小时的认知事件
SELECT * FROM analytics.cognitive_events 
WHERE event_time >= now() - INTERVAL '24 hours';

-- 查询特定用户的认知事件统计
SELECT 
    toDate(event_time) AS event_date,
    COUNT(*) AS event_count,
    AVG(duration_ms) AS avg_duration
FROM analytics.cognitive_events 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY event_date
ORDER BY event_date;

-- 查询热门概念
SELECT 
    concept_id,
    COUNT(*) AS interaction_count
FROM analytics.concept_interactions 
WHERE interaction_time >= now() - INTERVAL '30 days'
GROUP BY concept_id
ORDER BY interaction_count DESC
LIMIT 10;
```

### 13.2 分区管理脚本示例

#### 13.2.1 PostgreSQL分区创建脚本

```bash
#!/bin/bash
# 创建未来3个月的分区

DB_NAME="cognitive_assistant"
TABLE_NAME="cognitive_events"
MONTHS_AHEAD=3

for ((i=0; i<$MONTHS_AHEAD; i++)); do
    # 计算分区日期
    PARTITION_DATE=$(date -d "+$i months" +"%Y-%m-01")
    PARTITION_NAME=$(date -d "$PARTITION_DATE" +"${TABLE_NAME}_%Y%m")
    NEXT_MONTH=$(date -d "$PARTITION_DATE +1 month" +"%Y-%m-01")
    
    # 执行SQL语句
    psql -d $DB_NAME -c "
        CREATE TABLE IF NOT EXISTS $PARTITION_NAME PARTITION OF $TABLE_NAME
        FOR VALUES FROM ('$PARTITION_DATE') TO ('$NEXT_MONTH');
    "
    
    echo "Created partition $PARTITION_NAME for $PARTITION_DATE to $NEXT_MONTH"
done
```

#### 13.2.2 ClickHouse分区清理脚本

```bash
#!/bin/bash
# 清理超过1年的分区

DB_NAME="analytics"
TABLE_NAME="cognitive_events"
RETENTION_DAYS=365

# 获取需要清理的分区
PARTITIONS=$(clickhouse-client -q "
    SELECT partition 
    FROM system.parts 
    WHERE database = '$DB_NAME' 
    AND table = '$TABLE_NAME' 
    AND toDate(partition) < now() - INTERVAL $RETENTION_DAYS DAY
    AND active = 1
    GROUP BY partition
")

# 清理分区
for PARTITION in $PARTITIONS; do
    clickhouse-client -q "
        ALTER TABLE $DB_NAME.$TABLE_NAME DROP PARTITION '$PARTITION';
    "
    echo "Dropped partition $PARTITION from $DB_NAME.$TABLE_NAME"
done
```