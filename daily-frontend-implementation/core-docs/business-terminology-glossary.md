# 业务术语表

## 模块关联索引

### 所属环节
- **阶段**：文档优化
- **开发主题**：前后端统一业务术语

### 相关核心文档
- [前端架构设计](architecture-design/frontend-architecture.md)
- [API集成规范](core-features/api-integration-spec.md)

## 1. 概述

本文档定义了AI认知辅助系统的核心业务术语，确保前后端团队使用统一的语言，避免术语混淆和理解偏差。

## 2. 核心业务术语

### 2.1 领域模型术语

| 术语 | 英文 | 定义 | 前后端对应关系 |
|------|------|------|----------------|
| 用户认知模型 | UserCognitiveModel | 用于描述和分析用户认知结构的核心模型，包含概念、关系和相关元数据 | 前端：`CognitiveModel` 结构体<br>后端：`UserCognitiveModel` 实体 |
| 认知概念 | CognitiveConcept | 认知模型中的基本单位，代表用户认知结构中的一个概念 | 前端：`CognitiveConcept` 结构体<br>后端：`CognitiveConcept` 实体 |
| 认知关系 | CognitiveRelation | 描述两个认知概念之间的联系，包含关系类型和强度 | 前端：`CognitiveRelation` 结构体<br>后端：`CognitiveRelation` 实体 |
| 思想片段 | ThoughtFragment | 用户输入的原始思想内容，可以是文本、语音或其他形式 | 前端：`ThoughtFragment` 结构体<br>后端：`ThoughtFragment` 实体 |
| 认知洞察 | CognitiveInsight | 系统通过分析用户认知模型生成的洞察和发现，如概念缺口、关系强度等 | 前端：`CognitiveInsight` 结构体<br>后端：`CognitiveInsight` 实体 |
| 建议 | Suggestion | 基于认知洞察生成的改进建议，帮助用户优化认知结构 | 前端：`Suggestion` 结构体<br>后端：`Suggestion` 实体 |
| AI任务 | AITask | 系统执行的AI分析任务，如认知模型构建、洞察生成等 | 前端：`AITask` 结构体<br>后端：`AITask` 实体 |

### 2.2 业务流程术语

| 术语 | 英文 | 定义 | 前后端对应关系 |
|------|------|------|----------------|
| 认知建模 | CognitiveModeling | 将用户输入转换为认知模型的过程，包括解析、提取概念和关系 | 前端：触发建模请求<br>后端：执行建模逻辑 |
| 多维分析 | MultiDimensionalAnalysis | 从多个维度分析用户认知模型，如概念重要性、关系强度、思维类型等 | 前端：展示分析结果<br>后端：执行多维分析 |
| 可视化 | Visualization | 将认知模型以图形化方式展示，如概念图、层次图、网络图等 | 前端：渲染可视化视图<br>后端：提供可视化数据 |
| 语音交互 | VoiceInteraction | 用户通过语音与系统交互，包括语音输入和语音输出 | 前端：处理语音输入/输出<br>后端：提供语音处理服务 |
| 个性化 | Personalization | 根据用户认知模型提供个性化的反馈和建议 | 前端：展示个性化内容<br>后端：生成个性化建议 |

### 2.3 API和技术术语

| 术语 | 英文 | 定义 | 前后端对应关系 |
|------|------|------|----------------|
| JWT令牌 | JSON Web Token | 用于前后端认证的安全令牌，包含用户身份信息 | 前端：存储和发送JWT令牌<br>后端：生成和验证JWT令牌 |
| WebSocket | WebSocket | 实现前后端实时通信的协议，用于推送模型更新、任务完成等事件 | 前端：建立和管理WebSocket连接<br>后端：提供WebSocket服务 |
| APNs | Apple Push Notification service | 苹果推送通知服务，用于向iOS设备发送推送通知 | 前端：注册设备令牌<br>后端：发送推送通知 |
| 模型订阅 | Model Subscription | 前端订阅特定认知模型的更新，当模型发生变化时，后端通过WebSocket推送更新 | 前端：发送订阅请求<br>后端：处理订阅和推送更新 |
| 思想输入 | Thought Input | 用户向系统输入思想内容的过程，可以是手动输入、语音输入或文件上传 | 前端：提供输入界面<br>后端：处理输入数据 |
| 分析结果 | Analysis Result | 系统对用户认知模型进行分析后生成的结果，包含思维类型、概念重要性等 | 前端：展示分析结果<br>后端：生成分析结果 |

### 2.4 系统状态术语

| 术语 | 英文 | 定义 | 前后端对应关系 |
|------|------|------|----------------|
| 模型健康分数 | Model Health Score | 评估认知模型完整性和质量的分数，范围0-100 | 前端：展示健康分数<br>后端：计算健康分数 |
| 任务状态 | Task Status | AI任务的执行状态，如 pending（待处理）、processing（处理中）、completed（已完成）、failed（失败） | 前端：展示任务状态<br>后端：管理任务状态 |
| 连接状态 | Connection Status | WebSocket连接的状态，如 connected（已连接）、connecting（连接中）、disconnected（已断开） | 前端：管理连接状态<br>后端：维护连接状态 |
| 认证状态 | Authentication Status | 用户的认证状态，如 authenticated（已认证）、unauthenticated（未认证）、refreshing（刷新中） | 前端：管理认证状态<br>后端：验证认证状态 |

## 3. 术语使用规范

1. **统一使用**：所有前后端文档、代码和沟通中必须使用本术语表中定义的术语
2. **术语扩展**：新术语必须经过前后端团队评审后，添加到本术语表中
3. **术语变更**：术语变更必须通知所有相关团队，并更新本术语表
4. **英文对应**：所有术语必须有明确的英文对应，确保代码中使用一致的命名

## 4. 术语维护

- **维护责任人**：前后端架构师共同维护
- **更新频率**：每月至少审查一次，根据业务发展和需求变化更新
- **变更通知**：术语变更后，通过团队会议或邮件通知所有相关人员

## 5. 参考资料

- 后端领域模型设计文档
- 前端数据模型设计文档
- API文档
