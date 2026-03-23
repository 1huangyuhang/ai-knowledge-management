# 96-数据库设计技术实现文档

## 1. 数据库概述

本文档描述了认知辅助系统的数据库设计，包括现有表结构和新增表结构，用于支持用户输入的文件处理、语音处理和AI任务调度等功能。数据库采用SQLite，支持系统的所有核心业务需求。

## 2. 数据库架构

### 2.1 数据库类型

- **主数据库**：SQLite
- **存储位置**：本地文件系统
- **连接方式**：通过SQLite连接池管理
- **迁移策略**：使用SQL脚本进行数据库迁移

### 2.2 现有表结构

| 表名 | 主要功能 |
|------|----------|
| thought_fragments | 存储用户输入的思维片段 |
| cognitive_concepts | 存储认知概念 |
| cognitive_relations | 存储认知概念之间的关系 |
| user_cognitive_models | 存储用户认知模型 |
| model_concepts | 模型与概念的关联表 |
| model_relations | 模型与关系的关联表 |
| cognitive_proposals | 存储认知建议 |
| proposal_concept_candidates | 存储建议的概念候选 |
| proposal_relation_candidates | 存储建议的关系候选 |
| cognitive_insights | 存储认知洞察 |
| evolution_history | 存储模型演化历史 |

## 3. 新增表结构设计

### 3.1 文件输入表 (file_inputs)

**功能**：存储用户上传的文件信息和提取的内容

**表结构**：

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | TEXT | PRIMARY KEY | 文件输入ID |
| name | TEXT | NOT NULL | 文件名 |
| type | TEXT | NOT NULL | 文件类型（MIME类型） |
| size | INTEGER | NOT NULL | 文件大小（字节） |
| content | TEXT | NOT NULL | 提取的文件内容 |
| metadata | TEXT | | 附加元数据（JSON格式） |
| user_id | TEXT | NOT NULL | 关联的用户ID |
| created_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**：
- `idx_file_inputs_user_id`：按用户ID查询文件输入
- `idx_file_inputs_created_at`：按创建时间查询文件输入

### 3.2 语音输入表 (speech_inputs)

**功能**：存储用户的语音输入和转录文本

**表结构**：

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | TEXT | PRIMARY KEY | 语音输入ID |
| audio_url | TEXT | NOT NULL | 音频文件URL |
| transcription | TEXT | NOT NULL | 语音转录文本 |
| confidence | REAL | NOT NULL | 转录置信度（0-1） |
| language | TEXT | NOT NULL | 语音语言 |
| duration | INTEGER | NOT NULL | 音频时长（秒） |
| metadata | TEXT | | 附加元数据（JSON格式） |
| user_id | TEXT | NOT NULL | 关联的用户ID |
| created_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**：
- `idx_speech_inputs_user_id`：按用户ID查询语音输入
- `idx_speech_inputs_created_at`：按创建时间查询语音输入

### 3.3 AI任务表 (ai_tasks)

**功能**：存储AI任务的信息和执行状态

**表结构**：

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | TEXT | PRIMARY KEY | 任务ID |
| type | TEXT | NOT NULL | 任务类型 |
| status | TEXT | NOT NULL | 任务状态（pending, running, success, failed, cancelled） |
| priority | TEXT | NOT NULL | 任务优先级（low, medium, high, urgent） |
| input | TEXT | NOT NULL | 任务输入数据（JSON格式） |
| output | TEXT | | 任务输出数据（JSON格式） |
| error | TEXT | | 任务错误信息 |
| user_id | TEXT | NOT NULL | 关联的用户ID |
| created_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| completed_at | DATETIME | | 完成时间 |

**索引**：
- `idx_ai_tasks_user_id`：按用户ID查询AI任务
- `idx_ai_tasks_status`：按状态查询AI任务
- `idx_ai_tasks_priority`：按优先级查询AI任务
- `idx_ai_tasks_created_at`：按创建时间查询AI任务

### 3.4 用户表 (users)

**功能**：存储系统用户信息

**表结构**：

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | TEXT | PRIMARY KEY | 用户ID |
| username | TEXT | NOT NULL UNIQUE | 用户名 |
| email | TEXT | NOT NULL UNIQUE | 电子邮件 |
| password_hash | TEXT | NOT NULL | 密码哈希 |
| metadata | TEXT | | 用户元数据（JSON格式） |
| created_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_users_username`：按用户名查询用户
- `idx_users_email`：按电子邮件查询用户

### 3.5 输入关联表 (input_relations)

**功能**：存储不同输入之间的关联关系

**表结构**：

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | TEXT | PRIMARY KEY | 关联ID |
| source_input_id | TEXT | NOT NULL | 源输入ID |
| source_input_type | TEXT | NOT NULL | 源输入类型（file, speech, text） |
| target_input_id | TEXT | NOT NULL | 目标输入ID |
| target_input_type | TEXT | NOT NULL | 目标输入类型（file, speech, text） |
| relation_type | TEXT | NOT NULL | 关联类型 |
| metadata | TEXT | | 附加元数据（JSON格式） |
| created_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**：
- `idx_input_relations_source`：按源输入查询关联
- `idx_input_relations_target`：按目标输入查询关联

## 4. 表关系设计

```
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   users       │     │ thought_fragments│     │ cognitive_models│
└──────┬────────┘     └────────┬────────┘     └────────┬────────┘
       │                       │                       │
       │ 1:N                   │ 1:N                   │ 1:N
       │                       │                       │
┌──────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
│  file_inputs  │     │ speech_inputs   │     │    ai_tasks     │
└──────┬────────┘     └────────┬────────┘     └────────┬────────┘
       │                       │                       │
       │ N:M                   │ N:M                   │
       │                       │                       │
       └────────────┬──────────┘                       │
                    │                                  │
                    ▼                                  │
              ┌───────────────┐                        │
              │input_relations│                        │
              └───────────────┘                        │
                                                       │
┌───────────────┐     ┌─────────────────┐             │
│cognitive_concepts│   │cognitive_relations│             │
└──────┬────────┘     └────────┬────────┘             │
       │                       │                       │
       │ N:M                   │ N:M                   │
       │                       │                       │
       └────────────┬──────────┘                       │
                    │                                  │
                    ▼                                  │
              ┌───────────────┐                        │
              │model_concepts │                        │
              └───────────────┘                        │
                                                       │
              ┌───────────────┐                        │
              │model_relations│                        │
              └───────────────┘                        │
                                                       │
┌───────────────┐     ┌─────────────────┐             │
│cognitive_proposals│   │cognitive_insights│             │
└──────┬────────┘     └────────┬────────┘             │
       │                       │                       │
       │ 1:N                   │ 1:N                   │
       │                       │                       │
┌──────▼────────┐     ┌────────▼────────┐             │
│proposal_concept_candidates││evolution_history│◄─────────┘
└───────────────┘     └───────────────┘

┌─────────────────────────┐
│proposal_relation_candidates│
└─────────────────────────┘
```

## 5. 新增表的SQL创建脚本

### 5.1 用户表

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  metadata TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### 5.2 文件输入表

```sql
CREATE TABLE IF NOT EXISTS file_inputs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  user_id TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 文件输入表索引
CREATE INDEX IF NOT EXISTS idx_file_inputs_user_id ON file_inputs(user_id);
CREATE INDEX IF NOT EXISTS idx_file_inputs_created_at ON file_inputs(created_at);
```

### 5.3 语音输入表

```sql
CREATE TABLE IF NOT EXISTS speech_inputs (
  id TEXT PRIMARY KEY,
  audio_url TEXT NOT NULL,
  transcription TEXT NOT NULL,
  confidence REAL NOT NULL,
  language TEXT NOT NULL,
  duration INTEGER NOT NULL,
  metadata TEXT,
  user_id TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 语音输入表索引
CREATE INDEX IF NOT EXISTS idx_speech_inputs_user_id ON speech_inputs(user_id);
CREATE INDEX IF NOT EXISTS idx_speech_inputs_created_at ON speech_inputs(created_at);
```

### 5.4 AI任务表

```sql
CREATE TABLE IF NOT EXISTS ai_tasks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT,
  error TEXT,
  user_id TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI任务表索引
CREATE INDEX IF NOT EXISTS idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_priority ON ai_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_created_at ON ai_tasks(created_at);
```

### 5.5 输入关联表

```sql
CREATE TABLE IF NOT EXISTS input_relations (
  id TEXT PRIMARY KEY,
  source_input_id TEXT NOT NULL,
  source_input_type TEXT NOT NULL,
  target_input_id TEXT NOT NULL,
  target_input_type TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  metadata TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 输入关联表索引
CREATE INDEX IF NOT EXISTS idx_input_relations_source ON input_relations(source_input_id, source_input_type);
CREATE INDEX IF NOT EXISTS idx_input_relations_target ON input_relations(target_input_id, target_input_type);
```

## 6. 数据迁移策略

### 6.1 迁移脚本

- **迁移文件位置**：`src/infrastructure/persistence/migrations/`
- **迁移文件命名**：`{version}_{description}.sql`
- **迁移执行顺序**：按版本号升序执行

### 6.2 初始迁移脚本

```sql
-- src/infrastructure/persistence/migrations/002_add_new_tables.sql

-- 执行新增表的创建脚本
```

### 6.3 迁移执行机制

- **应用启动时**：检查数据库版本，执行未执行的迁移脚本
- **迁移状态管理**：使用专用表记录已执行的迁移
- **回滚机制**：支持迁移回滚（仅开发环境）

## 7. 数据访问层设计

### 7.1 仓库接口

| 仓库名称 | 主要功能 | 核心方法 |
|----------|----------|----------|
| UserRepository | 用户数据访问 | save(), findById(), findByUsername(), findByEmail() |
| FileInputRepository | 文件输入数据访问 | save(), findById(), findByUserId(), delete() |
| SpeechInputRepository | 语音输入数据访问 | save(), findById(), findByUserId(), delete() |
| AITaskRepository | AI任务数据访问 | save(), findById(), findByUserId(), findByStatus(), updateStatus() |
| InputRelationRepository | 输入关联数据访问 | save(), findBySource(), findByTarget(), delete() |

### 7.2 仓库实现

所有仓库实现继承自`BaseRepositoryImpl`，使用SQLite连接池进行数据库操作，支持事务管理和错误处理。

## 8. 性能优化

### 8.1 索引策略

- **主键索引**：所有表的主键字段自动创建索引
- **外键索引**：所有外键字段创建索引
- **查询字段索引**：频繁用于查询条件的字段创建索引
- **联合索引**：针对常用的多字段查询创建联合索引

### 8.2 缓存策略

- **热点数据缓存**：使用Redis缓存频繁访问的数据
- **查询结果缓存**：缓存复杂查询的结果
- **缓存失效机制**：数据更新时自动失效相关缓存

### 8.3 查询优化

- **避免全表扫描**：确保所有查询都使用索引
- **限制结果集大小**：使用LIMIT关键字限制返回记录数
- **优化JOIN查询**：减少JOIN表的数量，优化JOIN顺序
- **使用预编译语句**：提高查询执行效率

## 9. 数据安全性

### 9.1 数据加密

- **敏感数据加密**：用户密码使用bcrypt进行哈希处理
- **传输加密**：使用HTTPS协议传输数据
- **存储加密**：敏感数据在存储时加密

### 9.2 访问控制

- **最小权限原则**：数据库用户只授予必要的权限
- **访问日志**：记录所有数据库访问操作
- **审计机制**：定期审计数据库访问记录

### 9.3 数据备份与恢复

- **定期备份**：自动定期备份数据库
- **备份存储**：备份文件存储在安全位置
- **恢复测试**：定期测试数据恢复流程

## 10. 测试策略

### 10.1 单元测试

- **测试框架**：Jest
- **测试范围**：所有数据访问方法
- **测试策略**：使用内存数据库进行测试
- **测试覆盖率**：目标覆盖率≥90%

### 10.2 集成测试

- **测试内容**：数据库连接、迁移、事务处理
- **测试环境**：测试数据库实例
- **测试数据**：使用测试数据填充数据库

### 10.3 性能测试

- **测试工具**：使用专门的性能测试工具
- **测试场景**：高并发查询、大数据量插入
- **性能指标**：响应时间、吞吐量、资源使用率

## 11. 总结

本数据库设计文档描述了认知辅助系统的完整数据库架构，包括现有表结构和新增表结构。新增的表结构支持用户输入的文件处理、语音处理和AI任务调度等功能，满足系统的核心业务需求。

数据库设计遵循了以下原则：
- 清晰的表结构和关系设计
- 合理的索引策略
- 完善的数据访问层
- 有效的性能优化
- 严格的数据安全性
- 全面的测试策略

该设计确保了系统的可扩展性、高性能和可靠性，能够支持系统的长期发展。