# 0. 文档定位（非常重要）

## 0.1 文档是什么

这是一个**可以直接作为 AI 项目总输入文件**的软件设计与实施文档。

它的作用不是“介绍想法”，而是：

* 作为 **项目最高设计约束**
* 作为 **AI 规划、拆解、生成代码的依据**
* 作为 **你在 3 个月内逐日执行的行动蓝图**

> 你可以把这份文档理解为： **“一个中大型 AI 软件项目，在立项阶段就写好的完整蓝图”**

---

## 0.2 项目开发假设

* 开发者：**单人 / 新手**
* 开发周期：**3 个月（90 天）**
* 项目目标：

  * 做成一个**真实可用**的 AI 认知辅助软件
  * 在过程中系统性学习：

    * 软件工程
    * AI 应用架构
    * 主流 AI 技术栈

---

# 1. 项目本质定义（最高约束）

## 1.1 项目不是“知识管理工具”

本项目**明确不以 CRUD（增删改查）为核心目标**。

## 1.2 项目真正要做的事情

> **持续构建、更新、分析用户的「认知结构模型」，并基于该模型给出结构性反馈与思考建议。**

### 系统关注的不是：

* 你记了什么

### 而是：

* 你反复在想什么
* 你的思考主干在哪里
* 你的概念结构是否完整
* 你下一步“最值得思考”的方向

---

# 2. 系统总体架构设计

## 2.1 架构原则

* Clean Architecture
* 高内聚、低耦合
* AI 能力通过接口注入
* Domain 永远不依赖 AI

---

## 2.2 总体分层

```
Presentation Layer  —— 交互与展示
Application Layer   —— 用例与工作流
Domain Layer        —— 认知模型与规则（最稳定）
Infrastructure      —— 存储 / AI / 外部系统
AI Capability       —— 模型与推理能力（可替换）
```

---

# 3. 核心系统对象（Domain 设计摘要）

## 3.1 核心对象不是 Knowledge，而是 Cognitive Model

### UserCognitiveModel（用户认知模型）

系统中最重要的对象，用于描述：

* 核心概念集合
* 概念层级
* 思考路径
* 认知空洞与断裂

---

## 3.2 其他关键对象

* CognitiveConcept（认知概念）
* CognitiveRelation（认知关系）
* ThoughtFragment（思维片段，原始输入）
* CognitiveInsight（系统生成的结构性反馈）

---

# 4. 功能模块设计（系统级）

## 4.1 输入模块（Thought Ingestion）

* 接受任意文本输入
* 不要求结构
* 记录为 ThoughtFragment

技术要点：

* 简单 HTTP API
* 原始文本存储

---

## 4.2 认知解析模块（Cognitive Parsing）

* AI 提取概念候选
* AI 提取潜在关系
* 输出 Proposal（不直接生效）

技术要点：

* LLM Prompt Engineering
* 输出结构化 JSON

---

## 4.3 认知结构建模模块（Cognitive Modeling）

* 接收 AI Proposal
* 根据规则更新 UserCognitiveModel
* 保证模型一致性

技术要点：

* Domain Service
* 不依赖 AI

---

## 4.4 认知反馈模块（Cognitive Mirror）

* 定期分析认知模型
* 生成结构性反馈

示例输出：

* 你的核心主题
* 你的思维盲点

---

## 4.5 认知建议模块（Cognitive Coach）

* 基于模型生成“下一步思考建议”
* 不给答案，只给方向

---

# 5. 技术栈选型（新手友好 + 行业主流）

## 后端

* TypeScript
* Node.js
* Express / Fastify

## AI

* LLM（云端模型）
* Embedding 模型

## 数据

* SQLite（初期）
* 向量数据库（Qdrant）

---

# 6. 三个月开发规划（核心部分）

> 每个月 = 一个清晰的系统阶段 每一天 = 一个明确的工程目标

---

## 第一阶段（第 1–30 天）：系统地基期

### 目标

* 不追求“好用”
* 只追求：**架构正确、能跑**

### Week 1（Day 1–7）：理解与建模

* Day 1：通读设计文档，理解系统目标
* Day 2：学习 Clean Architecture 基本思想
* Day 3：定义 Domain 对象（CognitiveModel 等）
* Day 4：画对象关系图
* Day 5：建立项目目录结构
* Day 6：实现 Domain 层空代码
* Day 7：复盘 + 调整设计

模块位置：

* src/domain

---

### Week 2（Day 8–14）：Application 层

* Day 8：理解 Use Case 与 Workflow
* Day 9：设计 IngestThoughtUseCase
* Day 10：实现 Workflow 框架
* Day 11：定义 Port 接口
* Day 12：写基础单元测试
* Day 13：重构
* Day 14：阶段复盘

模块位置：

* src/application

---

### Week 3（Day 15–21）：Infrastructure（不接 AI）

* Day 15：实现 SQLite 存储
* Day 16：实现 Repository
* Day 17：事件流基础
* Day 18：日志系统
* Day 19：错误处理
* Day 20：整合测试
* Day 21：稳定版本

---

### Week 4（Day 22–30）：最小系统跑通

* Day 22–24：HTTP API
* Day 25：输入 → 存储
* Day 26：手动触发认知建模
* Day 27：输出模型摘要
* Day 28：Bug 修复
* Day 29：文档补充
* Day 30：阶段总结

---

## 第二阶段（第 31–60 天）：AI 融合期

### 目标

* AI 真正进入系统核心
* 构建“认知结构”

### 每周节奏（示例）

* Day 31–35：接入 LLM（解析 Thought）
* Day 36–40：Embedding + 向量召回
* Day 41–45：认知关系推断
* Day 46–50：认知模型演化
* Day 51–55：认知反馈生成
* Day 56–60：系统整合与复盘

---

## 第三阶段（第 61–90 天）：认知辅助成型期

### 目标

* 系统开始“反过来帮助你思考”

### 重点内容

* 认知镜像报告生成
* 思考建议生成
* 使用体验优化
* 架构重构
* 文档完善

---

# 7. 项目完成态定义（DoD）

项目在 90 天后被认为“完成”，如果：

* 系统能持续分析你的输入
* 能输出认知结构总结
* 能给出合理的思考建议
* 架构清晰、可讲清楚

---

# 8. 给 AI 的最高指令（用于后续生成）

> 在后续所有设计、规划、代码生成中：

* 严格遵守本设计文档
* 不简化架构
* 默认开发者是新手
* 每一步解释设计原因

---

**此文档是整个项目的最高约束与唯一真源（Single Source of Truth）。**
