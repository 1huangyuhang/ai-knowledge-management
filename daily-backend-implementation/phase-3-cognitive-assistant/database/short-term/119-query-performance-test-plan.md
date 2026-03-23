# 119-查询性能测试计划

## 1. 测试概述

### 1.1 测试目标

本测试计划旨在验证117-index-optimization-design.md中设计的索引优化方案的有效性，具体目标包括：

1. 验证索引优化后核心查询的执行时间是否降低50%以上
2. 验证核心表的全表扫描次数是否减少80%以上
3. 验证新增索引的使用率是否达到80%以上
4. 验证数据库I/O负载是否降低30%以上
5. 确保索引优化不会对数据更新操作造成显著性能影响

### 1.2 测试范围

本次测试覆盖以下核心表的主要查询场景：

1. cognitive_model表
2. cognitive_concept表
3. cognitive_relation表
4. thought_fragment表
5. cognitive_insight表

### 1.3 测试类型

1. **性能测试**：测试查询执行时间、索引使用率、I/O负载等性能指标
2. **对比测试**：比较索引优化前后的性能差异
3. **回归测试**：确保索引优化不会引入新的性能问题
4. **稳定性测试**：测试长时间运行下的性能稳定性

## 2. 测试环境

### 2.1 硬件环境

| 组件 | 配置 | 数量 |
|------|------|------|
| CPU | 8核 | 1 |
| 内存 | 16GB | 1 |
| 存储 | SSD 512GB | 1 |
| 网络 | 千兆以太网 | 1 |

### 2.2 软件环境

| 软件 | 版本 | 用途 |
|------|------|------|
| PostgreSQL | 14 | 数据库服务器 |
| pgBench | 14 | 性能测试工具 |
| Prometheus | 2.37 | 监控工具 |
| Grafana | 9.0 | 监控可视化 |
| pgBadger | 12.0 | 日志分析工具 |
| psql | 14 | 数据库客户端 |

### 2.3 测试数据

1. **测试数据规模**：
   - cognitive_model表：100,000条记录
   - cognitive_concept表：500,000条记录
   - cognitive_relation表：1,000,000条记录
   - thought_fragment表：200,000条记录
   - cognitive_insight表：300,000条记录

2. **测试数据生成**：
   - 使用pgBench生成模拟数据
   - 确保数据分布均匀，具有代表性
   - 模拟真实业务场景的数据分布

## 3. 测试工具和方法

### 3.1 测试工具

1. **pgBench**：用于执行基准测试，生成负载
2. **EXPLAIN ANALYZE**：用于分析查询执行计划
3. **pg_stat_user_indexes**：用于监控索引使用率
4. **pg_stat_statements**：用于统计查询执行情况
5. **Prometheus + Grafana**：用于监控数据库性能指标
6. **pgBadger**：用于分析慢查询日志

### 3.2 测试方法

1. **基准测试**：
   - 执行标准查询集，记录执行时间
   - 比较索引优化前后的性能差异

2. **执行计划分析**：
   - 使用EXPLAIN ANALYZE分析查询执行计划
   - 验证索引是否被正确使用
   - 检查是否存在全表扫描等低效操作

3. **性能监控**：
   - 监控数据库CPU、内存、I/O使用率
   - 监控索引使用率和缓存命中率
   - 监控查询执行时间和吞吐量

4. **压力测试**：
   - 模拟并发用户访问
   - 测试系统在高负载下的性能表现
   - 测试系统的最大吞吐量

## 4. 测试用例设计

### 4.1 基本查询测试

| 测试用例ID | 测试表 | 查询类型 | 查询语句 | 预期结果 |
|------------|--------|----------|----------|----------|
| QP-001 | cognitive_model | 单条件查询 | `SELECT * FROM cognitive_model WHERE user_id = 1;` | 执行时间<10ms，使用idx_cognitive_model_user_id索引 |
| QP-002 | cognitive_model | 排序查询 | `SELECT * FROM cognitive_model WHERE user_id = 1 ORDER BY created_at DESC;` | 执行时间<15ms，使用idx_cognitive_model_user_created索引 |
| QP-003 | cognitive_concept | 多条件查询 | `SELECT * FROM cognitive_concept WHERE model_id = 1 AND type = 'core';` | 执行时间<20ms，使用idx_cognitive_concept_model_type索引 |
| QP-004 | cognitive_concept | 按名称查询 | `SELECT * FROM cognitive_concept WHERE model_id = 1 AND name = 'test';` | 执行时间<15ms，使用idx_cognitive_concept_model_name索引 |
| QP-005 | cognitive_relation | 按关系类型查询 | `SELECT * FROM cognitive_relation WHERE model_id = 1 AND relation_type = 'is_a';` | 执行时间<25ms，使用idx_cognitive_relation_model_type索引 |
| QP-006 | cognitive_relation | 按源概念查询 | `SELECT * FROM cognitive_relation WHERE source_concept_id = 1 AND relation_type = 'is_a';` | 执行时间<20ms，使用idx_cognitive_relation_source_type索引 |
| QP-007 | thought_fragment | 按用户和时间查询 | `SELECT * FROM thought_fragment WHERE user_id = 1 ORDER BY created_at DESC;` | 执行时间<30ms，使用idx_thought_fragment_user_created索引 |
| QP-008 | thought_fragment | 按用户和状态查询 | `SELECT * FROM thought_fragment WHERE user_id = 1 AND status = 'processed';` | 执行时间<25ms，使用idx_thought_fragment_user_status索引 |
| QP-009 | cognitive_insight | 按洞察类型查询 | `SELECT * FROM cognitive_insight WHERE model_id = 1 AND insight_type = 'gap';` | 执行时间<20ms，使用idx_cognitive_insight_model_type索引 |
| QP-010 | cognitive_insight | 按时间查询 | `SELECT * FROM cognitive_insight WHERE model_id = 1 ORDER BY created_at DESC;` | 执行时间<25ms，使用idx_cognitive_insight_created_at索引 |

### 4.2 关联查询测试

| 测试用例ID | 测试场景 | 查询语句 | 预期结果 |
|------------|----------|----------|----------|
| QP-011 | 查询用户的认知模型和概念 | `SELECT cm.*, cc.* FROM cognitive_model cm JOIN cognitive_concept cc ON cm.id = cc.model_id WHERE cm.user_id = 1 AND cc.type = 'core' ORDER BY cm.created_at DESC;` | 执行时间<50ms，使用相关索引 |
| QP-012 | 查询用户的思考片段和洞察 | `SELECT tf.*, ci.* FROM thought_fragment tf JOIN cognitive_insight ci ON tf.id = ci.thought_fragment_id WHERE tf.user_id = 1 AND ci.insight_type = 'gap' ORDER BY tf.created_at DESC;` | 执行时间<60ms，使用相关索引 |
| QP-013 | 查询认知概念及其关系 | `SELECT cc1.*, cr.*, cc2.* FROM cognitive_concept cc1 JOIN cognitive_relation cr ON cc1.id = cr.source_concept_id JOIN cognitive_concept cc2 ON cr.target_concept_id = cc2.id WHERE cc1.model_id = 1 AND cr.relation_type = 'is_a';` | 执行时间<80ms，使用相关索引 |

### 4.3 更新操作测试

| 测试用例ID | 测试表 | 操作类型 | 操作语句 | 预期结果 |
|------------|--------|----------|----------|----------|
| QP-014 | cognitive_model | 插入 | `INSERT INTO cognitive_model (user_id, model_type, created_at, updated_at) VALUES (1, 'personal', NOW(), NOW());` | 执行时间<5ms |
| QP-015 | cognitive_concept | 更新 | `UPDATE cognitive_concept SET name = 'updated' WHERE id = 1;` | 执行时间<5ms |
| QP-016 | cognitive_relation | 删除 | `DELETE FROM cognitive_relation WHERE id = 1;` | 执行时间<5ms |
| QP-017 | thought_fragment | 批量插入 | `INSERT INTO thought_fragment (user_id, content, status, created_at, updated_at) VALUES (1, 'test content', 'processed', NOW(), NOW()), (1, 'test content 2', 'processed', NOW(), NOW());` | 执行时间<10ms |
| QP-018 | cognitive_insight | 批量更新 | `UPDATE cognitive_insight SET insight_type = 'updated' WHERE model_id = 1 AND insight_type = 'gap';` | 执行时间<50ms（取决于记录数） |

### 4.4 并发测试

| 测试用例ID | 测试场景 | 并发用户数 | 测试时长 | 预期结果 |
|------------|----------|------------|----------|----------|
| QP-019 | 混合读写负载 | 50 | 30分钟 | 平均查询执行时间<100ms，错误率<0.1% |
| QP-020 | 高并发查询 | 100 | 15分钟 | 平均查询执行时间<150ms，错误率<0.1% |
| QP-021 | 高并发更新 | 20 | 10分钟 | 平均更新执行时间<10ms，错误率<0.1% |

## 5. 测试执行步骤

### 5.1 测试准备

1. **环境准备**：
   - 搭建测试环境，安装必要的软件
   - 配置数据库参数
   - 部署监控工具

2. **数据准备**：
   - 生成测试数据
   - 验证数据质量和分布
   - 备份初始数据

3. **测试脚本准备**：
   - 编写测试用例脚本
   - 准备监控脚本
   - 准备数据生成脚本

### 5.2 测试执行流程

1. **基线测试**（索引优化前）：
   - 执行所有测试用例
   - 记录测试结果
   - 分析执行计划
   - 监控性能指标

2. **索引优化实施**：
   - 执行索引优化脚本
   - 验证索引创建成功
   - 收集索引创建过程的性能影响

3. **优化后测试**：
   - 执行所有测试用例
   - 记录测试结果
   - 分析执行计划
   - 监控性能指标

4. **对比分析**：
   - 比较优化前后的测试结果
   - 分析性能提升情况
   - 验证测试目标是否达成

5. **稳定性测试**：
   - 执行长时间运行测试
   - 监控系统稳定性
   - 分析性能变化趋势

### 5.3 测试注意事项

1. 测试前确保数据库缓存已预热
2. 每个测试用例执行多次，取平均值
3. 测试过程中避免其他负载干扰
4. 详细记录测试环境和配置
5. 测试结果要可重现

## 6. 测试指标和验收标准

### 6.1 核心测试指标

| 指标 | 单位 | 验收标准 |
|------|------|----------|
| 查询执行时间 | 毫秒 | 核心查询执行时间降低50%以上 |
| 全表扫描次数 | 次/分钟 | 核心表的全表扫描次数减少80%以上 |
| 索引使用率 | % | 新增索引的使用率达到80%以上 |
| I/O等待时间 | 毫秒 | I/O等待时间降低30%以上 |
| 缓存命中率 | % | 缓存命中率提高10%以上 |
| 更新操作延迟 | 毫秒 | 更新操作延迟增加不超过10% |
| 系统吞吐量 | QPS | 系统吞吐量提高50%以上 |

### 6.2 次要测试指标

| 指标 | 单位 | 验收标准 |
|------|------|----------|
| CPU使用率 | % | 峰值CPU使用率降低20%以上 |
| 内存使用率 | % | 内存使用率变化不超过10% |
| 磁盘空间占用 | GB | 新增索引空间占用不超过总数据量的20% |
| 错误率 | % | 测试过程中错误率<0.1% |

## 7. 测试结果分析和报告

### 7.1 测试结果分析

1. **性能对比分析**：
   - 对比优化前后的各项性能指标
   - 分析性能提升的原因
   - 识别仍存在的性能瓶颈

2. **执行计划分析**：
   - 分析优化前后的查询执行计划
   - 验证索引是否被正确使用
   - 识别执行计划的变化

3. **资源使用分析**：
   - 分析CPU、内存、I/O等资源的使用情况
   - 识别资源瓶颈
   - 提出资源优化建议

4. **稳定性分析**：
   - 分析长时间运行下的性能稳定性
   - 识别性能衰减情况
   - 提出稳定性优化建议

### 7.2 测试报告模板

**测试报告**

| 字段 | 内容 |
|------|------|
| 报告名称 | 数据库索引优化查询性能测试报告 |
| 测试时间 | YYYY-MM-DD |
| 测试环境 | 硬件配置、软件版本 |
| 测试人员 | 姓名 |
| 测试目标 | 简要描述测试目标 |
| 测试范围 | 简要描述测试范围 |
| 测试结果摘要 | 核心测试指标的对比结果 |
| 详细测试结果 | 每个测试用例的执行结果 |
| 性能对比分析 | 优化前后的性能差异分析 |
| 执行计划分析 | 查询执行计划的变化分析 |
| 资源使用分析 | 资源使用情况分析 |
| 稳定性分析 | 长时间运行的稳定性分析 |
| 问题和建议 | 发现的问题和改进建议 |
| 结论 | 测试结论和验收结果 |

## 8. 风险评估和应对措施

### 8.1 测试风险

1. **测试数据不真实**：测试数据与生产数据分布差异较大，导致测试结果不准确
2. **测试环境与生产环境差异**：测试环境的硬件、软件配置与生产环境不同，导致测试结果无法反映生产环境的真实情况
3. **测试负载设计不合理**：测试负载与实际业务负载差异较大，导致测试结果不准确
4. **测试工具局限性**：测试工具本身的局限性，导致测试结果不准确
5. **测试执行过程中的干扰**：测试过程中受到其他负载的干扰，导致测试结果不准确

### 8.2 应对措施

1. **使用真实数据样本**：从生产环境导出真实数据样本，确保测试数据的真实性
2. **模拟生产环境配置**：尽量使测试环境的硬件、软件配置与生产环境一致
3. **设计合理的测试负载**：根据实际业务负载设计测试负载，确保测试负载的代表性
4. **使用多种测试工具**：结合使用多种测试工具，交叉验证测试结果
5. **隔离测试环境**：确保测试环境与其他环境隔离，避免测试过程中的干扰

## 9. 测试交付物

1. **测试计划文档**：本测试计划文档
2. **测试脚本**：包含所有测试用例的执行脚本
3. **测试数据生成脚本**：用于生成测试数据的脚本
4. **测试结果报告**：详细的测试结果报告
5. **性能对比分析报告**：优化前后的性能对比分析报告
6. **执行计划分析报告**：查询执行计划的变化分析报告

## 10. 测试进度安排

| 阶段 | 时间 | 任务 | 负责人 |
|------|------|------|--------|
| 测试准备 | 1天 | 环境搭建、数据准备、脚本编写 | 测试工程师 |
| 基线测试 | 1天 | 执行索引优化前的测试 | 测试工程师 |
| 索引优化实施 | 0.5天 | 执行索引优化脚本 | DBA |
| 优化后测试 | 1天 | 执行索引优化后的测试 | 测试工程师 |
| 并发测试 | 0.5天 | 执行并发测试 | 测试工程师 |
| 稳定性测试 | 1天 | 执行稳定性测试 | 测试工程师 |
| 结果分析和报告 | 1天 | 分析测试结果，编写测试报告 | 测试工程师 |
| 总计 | 5天 | | |

## 11. 总结

本测试计划详细描述了数据库索引优化后的查询性能测试方案，包括测试目标、测试范围、测试环境、测试用例设计、测试执行步骤、测试指标和验收标准等内容。通过执行本测试计划，可以全面验证索引优化的效果，确保索引优化能够达到预期的性能提升目标，同时不会对数据更新操作造成显著影响。

测试过程中，需要严格按照测试计划执行，详细记录测试结果，进行全面的分析和评估，确保测试结果的准确性和可靠性。测试完成后，需要编写详细的测试报告，总结测试结果，提出改进建议，为后续的数据库优化工作提供参考。