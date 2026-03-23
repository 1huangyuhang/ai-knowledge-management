AI 认知辅助系统｜项目总设计蓝图（最小约束版）

0. 文档定位

本文件是 AI 项目的唯一总约束，用于设计、代码生成与单人 90 天执行。
Single Source of Truth。

1. 项目本质

非 CRUD / 非知识管理工具。
目标：持续建模并分析用户认知结构，输出结构反馈与思考方向。
关注：概念主干、层级、断裂与空洞。

2. 架构原则
	•	Clean Architecture
	•	AI 能力接口化
	•	Domain 永不依赖 AI / Infrastructure

分层：Presentation / Application / Domain / Infrastructure / AI Capability

3. 核心 Domain
	•	UserCognitiveModel
	•	CognitiveConcept / CognitiveRelation
	•	ThoughtFragment / CognitiveInsight

4. 核心流程

输入 → 解析（LLM Proposal）→ 建模（Domain 规则）→ 反馈 → 建议

5. 技术与版本约束
	•	Node.js LTS（≥18）
	•	TypeScript（严格模式）
	•	Express 或 Fastify（二选一）
	•	LLM + Embedding（接口封装）
	•	SQLite → Qdrant

6. 测试要求
	•	Jest 或 Vitest（二选一）
	•	Domain：纯单元测试（无 AI / DB）
	•	Application：Mock Infrastructure
	•	核心逻辑必须有测试

7. 禁止项
	•	Domain 使用任何 AI / 外部 SDK / ORM / HTTP
	•	AI 直接修改认知模型
	•	破坏分层的实现

8. 最高指令
在所有后续设计与代码生成中：
	1.	严格遵循本文件
	2.	默认开发者为单人新手并解释设计决策
	3.	AI 输出仅作为 Proposal
	4.	长代码拆分，禁止在设计文档中直接生成代码
	5.	认知结构正确性 > 功能好用
	6.	每次增改文件后，检查项目结构是否变化，如有变化，同步更新蓝图文件，保持项目结构一致性
