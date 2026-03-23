# 数据迁移指南

索引标签：#部署运维 #数据迁移 #数据库 #向量数据库 #Prisma

## 相关文档

- [配置管理](config-management.md) - 系统配置管理
- [部署指南](deployment-guide.md) - 系统部署流程
- [数据库设计与实现](../dev-support/database-design-implementation.md) - 数据库设计详情
- [基础设施层设计](../layered-design/infrastructure-layer-design.md) - 基础设施层设计

## 1. 文档概述

本文档详细描述了AI认知辅助系统的数据迁移策略和具体步骤，包括初始数据库设置、增量迁移、数据导入导出、回滚策略等内容。数据迁移是系统开发和维护的重要组成部分，确保数据的完整性、一致性和安全性是迁移过程的核心目标。

## 2. 迁移工具选型

### 2.1 关系型数据库迁移

系统使用 **Prisma** 作为ORM和数据库迁移工具，主要基于以下考虑：

- **类型安全**：与TypeScript深度集成，提供类型安全的数据库访问
- **自动迁移生成**：根据数据模型变更自动生成迁移脚本
- **支持多环境**：支持开发、测试、生产等多环境配置
- **回滚机制**：支持迁移的回滚操作，便于错误恢复
- **广泛支持**：支持PostgreSQL、MySQL、SQLite等多种数据库

### 2.2 向量数据库迁移

对于Qdrant向量数据库，系统使用 **自定义脚本** 进行迁移，主要考虑：

- **向量数据特性**：向量数据的迁移需要特殊处理，包括向量维度、索引结构等
- **自定义迁移逻辑**：根据业务需求定制迁移逻辑
- **批量操作优化**：支持批量导入导出，提高迁移效率

## 3. 迁移环境配置

### 3.1 开发环境

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 数据模型定义...
```

### 3.2 环境变量配置

```env
# .env.development
DATABASE_URL="postgresql://user:password@localhost:5432/daily-backend?schema=public"
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY=""
```

## 4. 迁移流程

### 4.1 初始迁移流程

1. **创建数据库**
   ```bash
   # 创建PostgreSQL数据库
   createdb -h localhost -U postgres daily-backend
   
   # 创建Qdrant集合
   curl -X PUT http://localhost:6333/collections/thought_fragments -H "Content-Type: application/json" -d '{"vectors": {"size": 1536, "distance": "Cosine"}}'
   curl -X PUT http://localhost:6333/collections/concepts -H "Content-Type: application/json" -d '{"vectors": {"size": 1536, "distance": "Cosine"}}'
   ```

2. **生成初始迁移**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **应用迁移**
   ```bash
   npx prisma migrate deploy
   ```

4. **生成Prisma客户端**
   ```bash
   npx prisma generate
   ```

### 4.2 增量迁移流程

1. **修改数据模型**
   - 在`prisma/schema.prisma`中修改数据模型
   - 例如：添加字段、修改字段类型、添加关系等

2. **生成迁移脚本**
   ```bash
   npx prisma migrate dev --name <migration-name>
   ```

3. **查看迁移脚本**
   ```bash
   cat prisma/migrations/<timestamp>-<migration-name>/migration.sql
   ```

4. **测试迁移**
   - 在测试环境中应用迁移
   - 验证数据完整性和应用功能

5. **部署迁移**
   ```bash
   npx prisma migrate deploy
   ```

6. **更新Prisma客户端**
   ```bash
   npx prisma generate
   ```

### 4.3 向量数据库迁移流程

1. **导出向量数据**
   ```bash
   # 导出思想片段向量
   curl -X POST http://localhost:6333/collections/thought_fragments/points/scroll -H "Content-Type: application/json" -d '{"limit": 1000}' > thought_fragments.json
   
   # 导出概念向量
   curl -X POST http://localhost:6333/collections/concepts/points/scroll -H "Content-Type: application/json" -d '{"limit": 1000}' > concepts.json
   ```

2. **导入向量数据**
   ```bash
   # 导入思想片段向量
   curl -X PUT http://localhost:6333/collections/thought_fragments/points -H "Content-Type: application/json" -d @thought_fragments.json
   
   # 导入概念向量
   curl -X PUT http://localhost:6333/collections/concepts/points -H "Content-Type: application/json" -d @concepts.json
   ```

## 5. 迁移最佳实践

### 5.1 迁移前准备

1. **备份数据**
   ```bash
   # 备份PostgreSQL数据库
   pg_dump -h localhost -U postgres -d daily-backend > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # 备份Qdrant向量数据
   # 使用自定义脚本或Qdrant CLI工具
   ```

2. **检查依赖版本**
   - 确保Prisma版本与数据库版本兼容
   - 检查迁移工具的版本更新

3. **制定迁移计划**
   - 确定迁移时间窗口
   - 分配迁移负责人
   - 制定回滚策略

### 5.2 迁移执行

1. **在非峰值时段执行迁移**
   - 选择系统负载较低的时间段
   - 提前通知用户可能的服务中断

2. **监控迁移过程**
   - 实时监控数据库性能
   - 记录迁移日志
   - 及时处理迁移过程中的错误

3. **验证迁移结果**
   - 检查数据完整性
   - 验证应用功能是否正常
   - 运行测试套件

### 5.3 迁移后处理

1. **更新文档**
   - 更新数据模型定义文档
   - 更新相关的技术文档

2. **监控系统性能**
   - 观察数据库性能变化
   - 检查应用响应时间
   - 监控错误日志

3. **清理旧数据**
   - 按照数据保留策略清理过期数据
   - 优化数据库索引

## 6. 回滚策略

### 6.1 数据库回滚

1. **使用Prisma回滚**
   ```bash
   # 回滚到指定迁移
   npx prisma migrate deploy --rollback <migration-id>
   ```

2. **使用备份恢复**
   ```bash
   # 恢复PostgreSQL数据库
   psql -h localhost -U postgres -d daily-backend < backup.sql
   ```

### 6.2 向量数据库回滚

1. **使用导出数据恢复**
   ```bash
   # 清除当前集合
   curl -X DELETE http://localhost:6333/collections/thought_fragments
   curl -X DELETE http://localhost:6333/collections/concepts
   
   # 重新创建集合
   curl -X PUT http://localhost:6333/collections/thought_fragments -H "Content-Type: application/json" -d '{"vectors": {"size": 1536, "distance": "Cosine"}}'
   curl -X PUT http://localhost:6333/collections/concepts -H "Content-Type: application/json" -d '{"vectors": {"size": 1536, "distance": "Cosine"}}'
   
   # 导入备份数据
   curl -X PUT http://localhost:6333/collections/thought_fragments/points -H "Content-Type: application/json" -d @backup_thought_fragments.json
   curl -X PUT http://localhost:6333/collections/concepts/points -H "Content-Type: application/json" -d @backup_concepts.json
   ```

## 7. 常见迁移问题及解决方案

### 7.1 迁移失败

**问题**：迁移脚本执行失败，提示约束冲突或数据类型不兼容

**解决方案**：
1. 检查迁移脚本中的SQL语句
2. 分析错误日志，确定具体失败原因
3. 修改迁移脚本或数据，解决冲突
4. 重新执行迁移

### 7.2 数据丢失

**问题**：迁移过程中数据丢失

**解决方案**：
1. 立即停止迁移
2. 使用备份恢复数据
3. 分析数据丢失原因
4. 重新制定迁移计划

### 7.3 性能下降

**问题**：迁移后系统性能下降

**解决方案**：
1. 分析数据库查询性能
2. 优化数据库索引
3. 调整数据库配置
4. 考虑分库分表或其他性能优化措施

## 8. 迁移工具命令参考

### 8.1 Prisma命令

| 命令 | 描述 | 示例 |
|------|------|------|
| `prisma migrate dev` | 在开发环境中生成和应用迁移 | `npx prisma migrate dev --name add-user-field` |
| `prisma migrate deploy` | 在生产环境中应用迁移 | `npx prisma migrate deploy` |
| `prisma migrate status` | 查看迁移状态 | `npx prisma migrate status` |
| `prisma migrate reset` | 重置数据库并重新应用所有迁移 | `npx prisma migrate reset` |
| `prisma generate` | 生成Prisma客户端 | `npx prisma generate` |
| `prisma studio` | 启动Prisma Studio可视化工具 | `npx prisma studio` |

### 8.2 Qdrant API

| API端点 | 方法 | 描述 |
|---------|------|------|
| `/collections/{collection_name}` | PUT | 创建集合 |
| `/collections/{collection_name}` | DELETE | 删除集合 |
| `/collections/{collection_name}/points` | PUT | 导入向量数据 |
| `/collections/{collection_name}/points/scroll` | POST | 导出向量数据 |
| `/collections/{collection_name}/points/{id}` | GET | 获取单个向量 |
| `/collections/{collection_name}/points/{id}` | DELETE | 删除单个向量 |

## 9. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |