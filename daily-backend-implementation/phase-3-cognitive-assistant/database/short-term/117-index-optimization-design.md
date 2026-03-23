# 117-索引优化设计

## 1. 索引优化概述

### 1.1 优化背景

根据前期的索引使用情况分析（115-index-usage-analysis.md）和慢查询分析（116-slow-query-analysis.md），我们发现了当前数据库存在以下索引相关问题：

1. 部分核心表缺少必要索引，导致全表扫描频繁
2. 存在未使用或低效索引，浪费存储和维护资源
3. 索引设计不符合查询模式，导致索引失效
4. 复合索引顺序不合理，影响查询效率

### 1.2 优化目标

- 降低核心查询的执行时间，提高系统响应速度
- 减少全表扫描次数，降低数据库I/O负载
- 优化索引结构，提高索引利用率
- 移除冗余索引，减少存储和维护成本
- 确保索引设计符合查询模式，提高索引命中率

## 2. 索引优化原则

### 2.1 核心原则

1. **查询优先原则**：根据实际查询模式设计索引，优先优化高频查询
2. **选择性原则**：选择高选择性的列作为索引列，提高索引效率
3. **复合索引顺序原则**：将选择性高的列放在复合索引前面
4. **覆盖查询原则**：设计能够覆盖常用查询的索引，减少回表操作
5. **避免冗余原则**：定期清理未使用或重复的索引
6. **考虑数据更新原则**：平衡查询性能和更新性能

### 2.2 优化策略

1. **添加必要索引**：为高频查询的过滤条件、连接条件和排序字段添加索引
2. **优化复合索引**：调整复合索引的列顺序，提高索引利用率
3. **移除冗余索引**：删除未使用或重复的索引
4. **设计覆盖索引**：减少回表操作，提高查询效率
5. **使用部分索引**：对于大表，考虑使用部分索引减少索引大小
6. **使用表达式索引**：对于频繁使用的表达式查询，设计表达式索引

## 3. 索引优化方案

### 3.1 用户认知模型相关表

#### 3.1.1 cognitive_model表

**当前索引情况**：
- 主键：id
- 唯一索引：user_id, model_type

**问题分析**：
- 缺少基于user_id的单独索引，虽然有复合索引，但在仅查询user_id时效率不高
- 缺少基于created_at的索引，无法高效支持按时间范围查询

**优化方案**：
1. 添加索引：`CREATE INDEX idx_cognitive_model_user_id ON cognitive_model(user_id);`
2. 添加索引：`CREATE INDEX idx_cognitive_model_created_at ON cognitive_model(created_at);`
3. 保留现有复合索引，用于同时查询user_id和model_type的场景

#### 3.1.2 cognitive_concept表

**当前索引情况**：
- 主键：id
- 外键索引：model_id

**问题分析**：
- 缺少基于name的索引，无法高效支持按名称查询
- 缺少基于type的索引，无法高效支持按类型查询
- 缺少基于model_id和type的复合索引，无法高效支持按模型和类型查询

**优化方案**：
1. 添加索引：`CREATE INDEX idx_cognitive_concept_name ON cognitive_concept(name);`
2. 添加索引：`CREATE INDEX idx_cognitive_concept_type ON cognitive_concept(type);`
3. 添加复合索引：`CREATE INDEX idx_cognitive_concept_model_type ON cognitive_concept(model_id, type);`
4. 添加复合索引：`CREATE INDEX idx_cognitive_concept_model_name ON cognitive_concept(model_id, name);`

#### 3.1.3 cognitive_relation表

**当前索引情况**：
- 主键：id
- 外键索引：model_id, source_concept_id, target_concept_id

**问题分析**：
- 缺少基于relation_type的索引，无法高效支持按关系类型查询
- 缺少基于model_id和relation_type的复合索引，无法高效支持按模型和关系类型查询
- 缺少基于source_concept_id和relation_type的复合索引，无法高效支持按源概念和关系类型查询

**优化方案**：
1. 添加索引：`CREATE INDEX idx_cognitive_relation_type ON cognitive_relation(relation_type);`
2. 添加复合索引：`CREATE INDEX idx_cognitive_relation_model_type ON cognitive_relation(model_id, relation_type);`
3. 添加复合索引：`CREATE INDEX idx_cognitive_relation_source_type ON cognitive_relation(source_concept_id, relation_type);`
4. 添加复合索引：`CREATE INDEX idx_cognitive_relation_target_type ON cognitive_relation(target_concept_id, relation_type);`

### 3.2 思考片段相关表

#### 3.2.1 thought_fragment表

**当前索引情况**：
- 主键：id
- 外键索引：user_id

**问题分析**：
- 缺少基于created_at的索引，无法高效支持按时间范围查询
- 缺少基于status的索引，无法高效支持按状态查询
- 缺少基于user_id和created_at的复合索引，无法高效支持按用户和时间范围查询

**优化方案**：
1. 添加索引：`CREATE INDEX idx_thought_fragment_created_at ON thought_fragment(created_at);`
2. 添加索引：`CREATE INDEX idx_thought_fragment_status ON thought_fragment(status);`
3. 添加复合索引：`CREATE INDEX idx_thought_fragment_user_created ON thought_fragment(user_id, created_at DESC);`
4. 添加复合索引：`CREATE INDEX idx_thought_fragment_user_status ON thought_fragment(user_id, status);`

#### 3.2.2 cognitive_insight表

**当前索引情况**：
- 主键：id
- 外键索引：model_id, thought_fragment_id

**问题分析**：
- 缺少基于insight_type的索引，无法高效支持按洞察类型查询
- 缺少基于model_id和insight_type的复合索引，无法高效支持按模型和洞察类型查询
- 缺少基于created_at的索引，无法高效支持按时间范围查询

**优化方案**：
1. 添加索引：`CREATE INDEX idx_cognitive_insight_type ON cognitive_insight(insight_type);`
2. 添加索引：`CREATE INDEX idx_cognitive_insight_created_at ON cognitive_insight(created_at);`
3. 添加复合索引：`CREATE INDEX idx_cognitive_insight_model_type ON cognitive_insight(model_id, insight_type);`

### 3.3 移除冗余索引

根据索引使用情况分析，以下索引未被使用或重复，可以考虑移除：

1. **cognitive_model表**：无冗余索引
2. **cognitive_concept表**：无冗余索引
3. **cognitive_relation表**：无冗余索引
4. **thought_fragment表**：无冗余索引
5. **cognitive_insight表**：无冗余索引

### 3.4 优化现有索引

1. **cognitive_concept表**：
   - 现有索引：无需要优化的索引

2. **cognitive_relation表**：
   - 现有索引：无需要优化的索引

3. **thought_fragment表**：
   - 现有索引：无需要优化的索引

4. **cognitive_insight表**：
   - 现有索引：无需要优化的索引

## 4. 索引优化实施步骤

### 4.1 实施前准备

1. 备份当前数据库结构：`pg_dump -s -d <database_name> > database_schema_backup.sql`
2. 记录当前索引使用情况：使用115-index-usage-analysis.md中的脚本生成索引使用报告
3. 记录当前查询性能：使用EXPLAIN ANALYZE分析核心查询的执行计划和性能
4. 通知相关团队：提前通知开发和测试团队，避免在实施过程中进行大量数据操作

### 4.2 实施顺序

1. 首先添加新索引：避免影响现有查询性能
2. 然后移除冗余索引：减少存储和维护成本
3. 最后优化现有索引：调整索引结构，提高索引利用率

### 4.3 实施时间

- 建议在业务低峰期实施，减少对业务的影响
- 预计实施时间：约30分钟，具体取决于表的大小

## 5. 索引优化验证

### 5.1 验证方法

1. 使用EXPLAIN ANALYZE分析核心查询的执行计划，确认索引是否被正确使用
2. 监控查询性能：比较实施前后的查询执行时间
3. 监控索引使用率：使用pg_stat_user_indexes视图监控索引使用情况
4. 监控数据库负载：观察实施前后的数据库I/O负载变化

### 5.2 验证指标

1. 查询执行时间：核心查询执行时间降低50%以上
2. 全表扫描次数：核心表的全表扫描次数减少80%以上
3. 索引使用率：新增索引的使用率达到80%以上
4. 数据库负载：I/O等待时间降低30%以上

## 6. 风险评估

### 6.1 实施风险

1. **性能影响**：添加索引可能会影响数据更新操作的性能
2. **空间占用**：新增索引会增加数据库的存储空间占用
3. **实施时间**：对于大表，添加索引可能需要较长时间

### 6.2 风险应对措施

1. **分批实施**：对于大表，考虑分批实施索引优化
2. **监控性能**：实施过程中实时监控数据库性能，发现问题及时回滚
3. **准备回滚方案**：提前准备回滚脚本，以便在出现问题时快速恢复
4. **充分测试**：在测试环境充分测试后再在生产环境实施

## 7. 总结

本索引优化设计方案基于前期的索引使用情况分析和慢查询分析结果，针对用户认知模型相关表设计了合理的索引优化方案。通过添加必要索引、优化复合索引顺序、设计覆盖索引等措施，可以提高查询性能，降低数据库负载，减少全表扫描次数。

实施本方案后，预计核心查询的执行时间将降低50%以上，全表扫描次数将减少80%以上，数据库I/O负载将降低30%以上。同时，通过移除冗余索引，可以减少存储和维护成本，提高数据库的整体性能。

本方案的实施风险较低，通过合理的实施步骤和风险应对措施，可以确保实施过程的顺利进行。实施后，需要进行充分的验证，确认优化效果符合预期。