# 数据模型定义文档

索引标签：#数据模型 #数据库设计 #领域模型 #向量数据库 #数据安全

## 相关文档

- [领域模型设计](../layered-design/domain-model-design.md)：详细描述领域模型的设计
- [数据库设计实现](../dev-support/database-design-implementation.md)：详细描述数据库的设计和实现
- [基础设施层设计](../layered-design/infrastructure-layer-design.md)：详细描述基础设施层的设计，包括数据库连接
- [仓库接口定义](../layered-design/repository-interface-definition.md)：详细描述数据访问层的接口定义

## 1. 文档概述

本文档详细描述了认知辅助系统的数据模型，包括数据实体、关系、属性和约束。数据模型是系统的核心，定义了系统如何存储和管理用户的认知数据、思想片段、AI任务等信息。

系统采用关系型数据库（PostgreSQL）存储结构化数据，使用向量数据库（Qdrant）存储向量嵌入数据，实现了结构化数据和非结构化数据的高效存储和查询。

## 2. 数据模型架构

### 2.1 核心实体关系图

```
┌─────────────────┐     ┌───────────────────────┐
│    User         │     │ UserCognitiveModel    │
├─────────────────┤     ├───────────────────────┤
│ id (PK)         │1    │ id (PK)               │
│ email           │─────│ userId (FK)           │
│ passwordHash    │     │ version               │
│ createdAt       │     │ createdAt             │
│ updatedAt       │     │ updatedAt             │
└─────────────────┘     └───────────────────────┘
                              │
                              │1
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           │                  │                  │
┌──────────▼─────────┐  ┌─────▼─────────────┐  ┌▼──────────────┐
│ CognitiveConcept   │  │ CognitiveRelation  │  │ ThoughtFragment│
├────────────────────┤  ├───────────────────┤  ├───────────────┤
│ id (PK)            │  │ id (PK)            │  │ id (PK)        │
│ modelId (FK)       │  │ modelId (FK)       │  │ inputId        │
│ name               │  │ sourceId (FK)      │  │ inputType      │
│ description        │  │ targetId (FK)      │  │ content        │
│ importance         │  │ type               │  │ createdAt      │
│ createdAt          │  │ strength           │  │ updatedAt      │
│ updatedAt          │  │ createdAt          │  │ modelId (FK)   │
└────────────────────┘  └───────────────────┘  └───────────────┘
           │                  │                  │
           │                  │                  │
           └──────────────────┼──────────────────┘
                              │
                              │
                        ┌─────▼─────────────┐
                        │ CognitiveInsight  │
                        ├───────────────────┤
                        │ id (PK)            │
                        │ modelId (FK)       │
                        │ type               │
                        │ description        │
                        │ severity           │
                        │ createdAt          │
                        │ updatedAt          │
                        └───────────────────┘
                                  │
                                  │1
                                  │
                          ┌───────▼───────────┐
                          │    Suggestion     │
                          ├───────────────────┤
                          │ id (PK)            │
                          │ modelId (FK)       │
                          │ type               │
                          │ content            │
                          │ priority           │
                          │ status             │
                          │ relatedInsightIds  │
                          │ createdAt          │
                          │ updatedAt          │
                          └───────────────────┘
                                  │
                                  │1
                                  │
                          ┌───────▼───────────┐
                          │ SuggestionFeedback│
                          ├───────────────────┤
                          │ id (PK)            │
                          │ suggestionId (FK)  │
                          │ userId (FK)        │
                          │ rating             │
                          │ feedback           │
                          │ action             │
                          │ createdAt          │
                          │ updatedAt          │
                          └───────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   FileInput     │     │  SpeechInput    │     │   TextInput     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ name            │     │ name            │     │ content         │
│ type            │     │ duration        │     │ title           │
│ size            │     │ audioUrl        │     │ tags            │
│ filePath        │     │ transcript      │     │ processed       │
│ content         │     │ createdAt       │     │ createdAt       │
│ createdAt       │     │ updatedAt       │     │ updatedAt       │
│ updatedAt       │     │ modelId (FK)    │     │ userId (FK)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
          │                        │                        │
          └──────────────┬─────────┘──────────────┬─────────┘
                         │                        │
                         │1                       │
                         │                        │
                         └──────────┬─────────────┘
                                    │
                                    │
                               ┌────▼─────────┐
                               │    AITask    │
                               ├───────────────┤
                               │ id (PK)       │
                               │ type          │
                               │ inputType     │
                               │ inputId       │
                               │ status        │
                               │ priority      │
                               │ result        │
                               │ createdAt     │
                               │ updatedAt     │
                               │ completedAt   │
                               └───────────────┘
```

## 3. 核心数据实体

### 3.1 User（用户）

**描述**：存储系统用户信息，包括认证凭证和基本信息。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 用户唯一标识符 |
| `email` | VARCHAR(255) | UNIQUE NOT NULL | 用户邮箱，用于登录 |
| `passwordHash` | VARCHAR(255) | NOT NULL | 密码哈希值 |
| `name` | VARCHAR(255) | NULL | 用户名 |
| `role` | VARCHAR(50) | DEFAULT 'user' | 用户角色：user, admin |
| `lastLoginAt` | TIMESTAMP | NULL | 最后登录时间 |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3.2 UserCognitiveModel（用户认知模型）

**描述**：存储用户的认知模型信息，包括版本和基本元数据。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 认知模型唯一标识符 |
| `userId` | UUID | NOT NULL REFERENCES User(id) ON DELETE CASCADE | 关联的用户ID |
| `version` | VARCHAR(50) | NOT NULL | 模型版本号 |
| `description` | TEXT | NULL | 模型描述 |
| `isActive` | BOOLEAN | NOT NULL DEFAULT true | 是否为当前活跃模型 |
| `conceptCount` | INTEGER | NOT NULL DEFAULT 0 | 概念数量 |
| `relationCount` | INTEGER | NOT NULL DEFAULT 0 | 关系数量 |
| `dominantThinkingTypes` | VARCHAR(50)[] | NULL | 主导思维类型列表 |
| `thinkingTypeScores` | JSONB | NULL | 各种思维类型的得分 |
| `lastThinkingTypeAnalyzedAt` | TIMESTAMP | NULL | 最后分析思维类型的时间 |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_user_cognitive_model_user_id` (userId)
- `idx_user_cognitive_model_active` (userId, isActive)

### 3.3 CognitiveConcept（认知概念）

**描述**：存储认知模型中的概念，是认知模型的基本构建块。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 概念唯一标识符 |
| `modelId` | UUID | NOT NULL REFERENCES UserCognitiveModel(id) ON DELETE CASCADE | 关联的认知模型ID |
| `name` | VARCHAR(255) | NOT NULL | 概念名称 |
| `description` | TEXT | NULL | 概念描述 |
| `importance` | DECIMAL(5,4) | NOT NULL DEFAULT 0.5 | 概念重要性 (0-1) |
| `occurrenceCount` | INTEGER | NOT NULL DEFAULT 1 | 出现次数 |
| `lastOccurredAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 最后出现时间 |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_cognitive_concept_model_id` (modelId)
- `idx_cognitive_concept_name` (modelId, name)
- `idx_cognitive_concept_importance` (modelId, importance DESC)

### 3.4 CognitiveRelation（认知关系）

**描述**：存储认知概念之间的关系，定义概念之间的连接。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 关系唯一标识符 |
| `modelId` | UUID | NOT NULL REFERENCES UserCognitiveModel(id) ON DELETE CASCADE | 关联的认知模型ID |
| `sourceId` | UUID | NOT NULL REFERENCES CognitiveConcept(id) ON DELETE CASCADE | 源概念ID |
| `targetId` | UUID | NOT NULL REFERENCES CognitiveConcept(id) ON DELETE CASCADE | 目标概念ID |
| `type` | VARCHAR(50) | NOT NULL | 关系类型：related_to, part_of, causes, etc. |
| `strength` | DECIMAL(5,4) | NOT NULL DEFAULT 0.5 | 关系强度 (0-1) |
| `occurrenceCount` | INTEGER | NOT NULL DEFAULT 1 | 出现次数 |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_cognitive_relation_model_id` (modelId)
- `idx_cognitive_relation_source_target` (modelId, sourceId, targetId)
- `idx_cognitive_relation_strength` (modelId, strength DESC)

### 3.5 ThoughtFragment（思想片段）

**描述**：存储用户的思想片段，是认知模型的输入来源。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 思想片段唯一标识符 |
| `modelId` | UUID | NOT NULL REFERENCES UserCognitiveModel(id) ON DELETE CASCADE | 关联的认知模型ID |
| `inputId` | UUID | NOT NULL | 输入源ID，根据inputType关联不同的输入表：
  - inputType = 'file' → 关联FileInput.id
  - inputType = 'speech' → 关联SpeechInput.id
  - inputType = 'text' → 关联TextInput.id |
| `inputType` | VARCHAR(50) | NOT NULL | 输入类型：file, speech, text |
| `content` | TEXT | NOT NULL | 思想片段内容 |
| `embeddingId` | VARCHAR(255) | NULL | 向量嵌入ID（存储在Qdrant中） |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_thought_fragment_model_id` (modelId)
- `idx_thought_fragment_input` (inputType, inputId)
- `idx_thought_fragment_created_at` (modelId, createdAt DESC)

**应用层约束**：
- 确保inputId与对应inputType的输入表中的记录存在
- 实现方式：使用数据库触发器或应用层验证

### 3.6 CognitiveInsight（认知洞察）

**描述**：存储系统生成的认知洞察，帮助用户理解其认知结构。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 洞察唯一标识符 |
| `modelId` | UUID | NOT NULL REFERENCES UserCognitiveModel(id) ON DELETE CASCADE | 关联的认知模型ID |
| `type` | VARCHAR(50) | NOT NULL | 洞察类型：gap, blindspot, connection, etc. |
| `description` | TEXT | NOT NULL | 洞察描述 |
| `severity` | VARCHAR(50) | NOT NULL DEFAULT 'medium' | 严重程度：low, medium, high |
| `relatedConceptIds` | UUID[] | NULL | 相关概念ID列表 |
| `isResolved` | BOOLEAN | NOT NULL DEFAULT false | 是否已解决 |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_cognitive_insight_model_id` (modelId)
- `idx_cognitive_insight_type` (modelId, type)
- `idx_cognitive_insight_resolved` (modelId, isResolved, severity)

### 3.7 Suggestion（改进建议）

**描述**：存储系统生成的改进建议，基于认知洞察为用户提供具体的改进方向和行动建议。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 建议唯一标识符 |
| `modelId` | UUID | NOT NULL REFERENCES UserCognitiveModel(id) ON DELETE CASCADE | 关联的认知模型ID |
| `type` | VARCHAR(50) | NOT NULL | 建议类型：learning, practice, reflection, connection, exploration, organization |
| `content` | TEXT | NOT NULL | 建议内容 |
| `priority` | VARCHAR(50) | NOT NULL DEFAULT 'medium' | 优先级：low, medium, high |
| `status` | VARCHAR(50) | NOT NULL DEFAULT 'new' | 状态：new, accepted, rejected, implemented |
| `relevance` | DECIMAL(5,4) | NOT NULL DEFAULT 0.5 | 相关性评分 (0-1) |
| `expectedOutcome` | TEXT | NULL | 预期效果 |
| `effortLevel` | VARCHAR(50) | NOT NULL DEFAULT 'medium' | 努力程度：low, medium, high |
| `timeEstimate` | INTEGER | NULL | 预计完成时间（分钟） |
| `relatedInsightIds` | UUID[] | NULL | 相关洞察ID列表 |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_suggestion_model_id` (modelId)
- `idx_suggestion_type` (modelId, type)
- `idx_suggestion_priority` (modelId, priority)
- `idx_suggestion_status` (modelId, status)

### 3.8 SuggestionFeedback（建议反馈）

**描述**：存储用户对系统生成建议的反馈，用于优化建议生成算法和模型。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 反馈唯一标识符 |
| `suggestionId` | UUID | NOT NULL REFERENCES Suggestion(id) ON DELETE CASCADE | 关联的建议ID |
| `userId` | UUID | NOT NULL REFERENCES User(id) ON DELETE CASCADE | 反馈用户ID |
| `rating` | INTEGER | NULL | 评分（1-5星） |
| `feedback` | TEXT | NULL | 详细反馈内容 |
| `action` | VARCHAR(50) | NOT NULL | 用户操作：accepted, rejected, implemented |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_suggestion_feedback_suggestion_id` (suggestionId)
- `idx_suggestion_feedback_user_id` (userId)
- `idx_suggestion_feedback_action` (suggestionId, action)

### 3.9 AITask（AI任务）

**描述**：存储系统执行的AI任务，包括认知分析、洞察生成等。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 任务唯一标识符 |
| `userId` | UUID | NOT NULL REFERENCES User(id) ON DELETE CASCADE | 关联的用户ID |
| `modelId` | UUID | NULL REFERENCES UserCognitiveModel(id) ON DELETE CASCADE | 关联的认知模型ID |
| `type` | VARCHAR(50) | NOT NULL | 任务类型：cognitive_analysis, insight_generation, etc. |
| `inputType` | VARCHAR(50) | NOT NULL | 输入类型：file, speech, text |
| `inputId` | UUID | NOT NULL | 输入源ID |
| `status` | VARCHAR(50) | NOT NULL DEFAULT 'pending' | 任务状态：pending, running, completed, failed |
| `priority` | VARCHAR(50) | NOT NULL DEFAULT 'medium' | 任务优先级：low, medium, high |
| `params` | JSONB | NULL | 任务参数 |
| `result` | JSONB | NULL | 任务结果 |
| `error` | TEXT | NULL | 错误信息（如果任务失败） |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `startedAt` | TIMESTAMP | NULL | 开始执行时间 |
| `completedAt` | TIMESTAMP | NULL | 完成时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_ai_task_user_id` (userId)
- `idx_ai_task_status` (status)
- `idx_ai_task_priority_created` (priority, createdAt)
- `idx_ai_task_model_id` (modelId)

### 3.8 FileInput（文件输入）

**描述**：存储用户上传的文件信息。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 文件唯一标识符 |
| `userId` | UUID | NOT NULL REFERENCES User(id) ON DELETE CASCADE | 关联的用户ID |
| `name` | VARCHAR(255) | NOT NULL | 文件名 |
| `type` | VARCHAR(50) | NOT NULL | 文件类型：document, image, audio |
| `mimeType` | VARCHAR(255) | NOT NULL | MIME类型 |
| `size` | BIGINT | NOT NULL | 文件大小（字节） |
| `filePath` | VARCHAR(255) | NOT NULL | 文件存储路径 |
| `content` | TEXT | NULL | 提取的文件内容 |
| `processed` | BOOLEAN | NOT NULL DEFAULT false | 是否已处理 |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_file_input_user_id` (userId)
- `idx_file_input_type` (userId, type)
- `idx_file_input_processed` (processed, userId)

### 3.9 SpeechInput（语音输入）

**描述**：存储用户上传的语音信息。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 语音唯一标识符 |
| `userId` | UUID | NOT NULL REFERENCES User(id) ON DELETE CASCADE | 关联的用户ID |
| `name` | VARCHAR(255) | NOT NULL | 语音文件名 |
| `mimeType` | VARCHAR(255) | NOT NULL | MIME类型 |
| `size` | BIGINT | NOT NULL | 文件大小（字节） |
| `duration` | INTEGER | NOT NULL | 音频时长（秒） |
| `audioUrl` | VARCHAR(255) | NOT NULL | 音频文件URL |
| `transcript` | TEXT | NULL | 语音转文字结果 |
| `processed` | BOOLEAN | NOT NULL DEFAULT false | 是否已处理 |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_speech_input_user_id` (userId)
- `idx_speech_input_processed` (processed, userId)

### 3.10 TextInput（文本输入）

**描述**：存储用户直接输入的文本信息，包括打字输入的内容。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 文本输入唯一标识符 |
| `userId` | UUID | NOT NULL REFERENCES User(id) ON DELETE CASCADE | 关联的用户ID |
| `content` | TEXT | NOT NULL | 文本内容 |
| `title` | VARCHAR(255) | NULL | 文本标题 |
| `tags` | VARCHAR(50)[] | NULL | 标签列表 |
| `processed` | BOOLEAN | NOT NULL DEFAULT false | 是否已处理 |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_text_input_user_id` (userId)
- `idx_text_input_processed` (processed, userId)
- `idx_text_input_created_at` (userId, createdAt DESC)

## 4. 向量数据库模型

### 4.1 Qdrant集合设计

系统使用Qdrant向量数据库存储思想片段的向量嵌入，便于进行相似性搜索和聚类分析。

#### 4.1.1 思想片段集合（thought_fragments）

**配置**：
- 向量维度：1536（使用OpenAI text-embedding-ada-002模型）
- 距离度量：cosine
- 索引类型：HNSW（Hierarchical Navigable Small World）

**向量负载**：
```json
{
  "id": "thought_fragment_id",
  "vector": [0.1, 0.2, ..., 0.9],
  "payload": {
    "modelId": "model_id",
    "inputType": "text",
    "createdAt": "2024-01-08T12:00:00Z",
    "content": "思想片段内容摘要"
  }
}
```

#### 4.1.2 概念集合（concepts）

**配置**：
- 向量维度：1536
- 距离度量：cosine
- 索引类型：HNSW

**向量负载**：
```json
{
  "id": "concept_id",
  "vector": [0.1, 0.2, ..., 0.9],
  "payload": {
    "modelId": "model_id",
    "name": "概念名称",
    "importance": 0.8
  }
}
```

## 5. 数据关系约束

### 5.1 外键约束

| 表名 | 外键列 | 引用表 | 引用列 | 删除行为 | 更新行为 |
|------|--------|--------|--------|----------|----------|
| UserCognitiveModel | userId | User | id | CASCADE | NO ACTION |
| CognitiveConcept | modelId | UserCognitiveModel | id | CASCADE | NO ACTION |
| CognitiveRelation | modelId | UserCognitiveModel | id | CASCADE | NO ACTION |
| CognitiveRelation | sourceId | CognitiveConcept | id | CASCADE | NO ACTION |
| CognitiveRelation | targetId | CognitiveConcept | id | CASCADE | NO ACTION |
| ThoughtFragment | modelId | UserCognitiveModel | id | CASCADE | NO ACTION |
| CognitiveInsight | modelId | UserCognitiveModel | id | CASCADE | NO ACTION |
| Suggestion | modelId | UserCognitiveModel | id | CASCADE | NO ACTION |
| SuggestionFeedback | suggestionId | Suggestion | id | CASCADE | NO ACTION |
| SuggestionFeedback | userId | User | id | CASCADE | NO ACTION |
| AITask | userId | User | id | CASCADE | NO ACTION |
| AITask | modelId | UserCognitiveModel | id | CASCADE | NO ACTION |
| FileInput | userId | User | id | CASCADE | NO ACTION |
| SpeechInput | userId | User | id | CASCADE | NO ACTION |
| TextInput | userId | User | id | CASCADE | NO ACTION |

### 5.2 业务规则

1. **用户只能有一个活跃的认知模型**：通过`UserCognitiveModel.isActive`字段确保
2. **概念名称在模型内唯一**：通过唯一索引`idx_cognitive_concept_name`确保
3. **关系不能自引用**：通过触发器确保`sourceId != targetId`
4. **任务优先级只能是low、medium或high**：通过检查约束确保
5. **洞察严重程度只能是low、medium或high**：通过检查约束确保
6. **建议优先级只能是low、medium或high**：通过检查约束确保
7. **建议状态只能是new、accepted、rejected或implemented**：通过检查约束确保
8. **建议类型只能是预定义值**：learning, practice, reflection, connection, exploration, organization
9. **建议反馈评分只能是1-5星**：通过检查约束确保
10. **建议反馈操作只能是accepted、rejected或implemented**：通过检查约束确保
11. **文本输入内容不能为空**：通过检查约束确保
12. **思想片段的inputType必须与输入源匹配**：通过应用层验证确保
13. **每个用户只能对同一个建议反馈一次**：通过唯一索引确保

## 6. 数据迁移策略

### 6.1 初始迁移

- 使用Prisma或TypeORM进行数据库迁移
- 初始迁移包括所有表的创建和初始数据的插入
- 迁移文件版本控制，确保可追溯和可回滚

### 6.2 增量迁移

- 每次架构变更都创建新的迁移文件
- 迁移文件包含向上迁移和向下迁移逻辑
- 迁移前进行数据备份
- 迁移后验证数据完整性

### 6.3 数据导入导出

- 支持JSON格式的数据导入导出
- 导出包括用户数据、认知模型、概念、关系和思想片段
- 导入前验证数据格式和完整性
- 支持部分导入（如仅导入思想片段）

## 7. 数据安全与隐私

### 7.1 数据加密

- 用户密码使用bcrypt或Argon2进行哈希加密
- 敏感数据在传输过程中使用TLS 1.3加密
- 存储的文件和语音数据使用AES-256加密

### 7.2 数据访问控制

- 实现基于角色的访问控制（RBAC）
- 每个用户只能访问自己的数据
- 管理员只能访问系统配置和统计数据
- 所有数据访问都记录审计日志

### 7.3 数据保留策略

- 思想片段保留期限：永久
- AI任务日志保留期限：1年
- 系统日志保留期限：6个月
- 用户可以请求删除所有个人数据

## 8. 性能优化

### 8.1 数据库优化

- 为频繁查询的列创建索引
- 使用分区表存储历史数据
- 定期清理过期数据
- 优化查询语句，避免全表扫描

### 8.2 向量数据库优化

- 调整HNSW索引参数（M=16, ef_construct=200）
- 对向量数据进行批处理操作
- 使用适当的向量维度（1536）
- 定期优化向量索引

### 8.3 缓存策略

- 使用Redis缓存频繁访问的数据
- 缓存热点概念和关系
- 缓存AI任务结果
- 实现合理的缓存过期策略

## 9. 数据模型版本控制

### 9.1 版本管理

- 认知模型版本化，支持回滚到之前的版本
- 每次模型更新都创建新的版本
- 版本历史记录包括更新时间、更新内容和更新者

### 9.2 变更跟踪

- 跟踪概念和关系的变更历史
- 记录思想片段的来源和处理过程
- 记录AI任务的执行过程和结果

## 10. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 1. 增强了与核心文档和阶段文档的交叉引用<br>2. 添加Suggestion表定义<br>3. 添加TextInput实体<br>4. 添加SuggestionFeedback实体<br>5. 完善ThoughtFragment实体的外键约束<br>6. 更新实体关系图，包含所有新增实体<br>7. 完善业务规则，为新增实体添加规则定义<br>8. 优化了文档结构和格式 | 系统架构师 |
| 2024-01-08 | 初始创建 | 系统架构师 |
