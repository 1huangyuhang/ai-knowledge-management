# 业务流程流程图文档

## 模块关联索引

### 所属环节
- **阶段**：文档优化
- **开发主题**：业务流程可视化

### 相关核心文档
- [前端架构设计](frontend-architecture.md)
- [API集成规范](../core-features/api-integration-spec.md)
- [WebSocket集成](../core-features/websocket-integration.md)

## 1. 概述

本文档使用Mermaid图表描述AI认知辅助系统的核心业务流程，包括认证流程、认知模型管理流程、思想片段处理流程等，帮助开发团队理解和实现业务逻辑。

## 2. 认证流程

### 2.1 邮箱密码登录流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 移动应用
    participant API as 后端API
    participant DB as 数据库
    
    User->>App: 输入邮箱和密码
    App->>API: POST /api/v1/sessions
    API->>DB: 查询用户信息
    DB-->>API: 返回用户数据
    API->>API: 验证密码
    alt 密码正确
        API->>API: 生成JWT令牌
        API-->>App: 返回登录成功和JWT令牌
        App->>App: 存储JWT令牌到Keychain
        App-->>User: 登录成功
    else 密码错误
        API-->>App: 返回登录失败
        App-->>User: 显示登录错误
    end
```

### 2.2 Apple登录流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 移动应用
    participant Apple as Apple ID服务
    participant API as 后端API
    participant DB as 数据库
    
    User->>App: 选择Apple登录
    App->>Apple: 请求Apple授权
    Apple-->>User: 显示授权界面
    User->>Apple: 授权登录
    Apple-->>App: 返回授权码
    App->>API: POST /api/v1/auth/apple/callback
    API->>Apple: 验证授权码
    Apple-->>API: 返回用户信息
    API->>DB: 查询或创建用户
    DB-->>API: 返回用户数据
    API->>API: 生成JWT令牌
    API-->>App: 返回登录成功和JWT令牌
    App->>App: 存储JWT令牌到Keychain
    App-->>User: 登录成功
```

## 3. 认知模型管理流程

### 3.1 创建认知模型流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 移动应用
    participant API as 后端API
    participant DB as 数据库
    
    User->>App: 点击"创建认知模型"
    User->>App: 输入模型名称和描述
    App->>API: POST /api/v1/models
    API->>API: 验证请求参数
    API->>DB: 创建认知模型记录
    DB-->>API: 返回创建的模型
    API-->>App: 返回创建成功
    App-->>User: 显示创建成功
    App->>App: 刷新模型列表
```

### 3.2 认知模型更新流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 移动应用
    participant API as 后端API
    participant DB as 数据库
    participant WS as WebSocket服务
    
    User->>App: 编辑认知模型
    User->>App: 保存修改
    App->>API: PUT /api/v1/models/{modelId}
    API->>API: 验证请求参数
    API->>DB: 更新模型记录
    DB-->>API: 返回更新后的模型
    API-->>App: 返回更新成功
    API->>WS: 推送模型更新事件
    WS-->>App: 接收模型更新通知
    App->>App: 更新本地模型数据
    App-->>User: 显示更新成功
```

## 4. 思想片段处理流程

### 4.1 文本思想片段处理流程

```mermaid
flowchart TD
    A[用户输入文本] --> B[应用验证输入]
    B --> C[发送API请求 POST /api/v1/thoughts]
    C --> D{API响应}
    D -->|成功| E[保存到本地Core Data]
    D -->|失败| F[显示错误信息]
    E --> G[触发AI分析任务]
    G --> H[发送API请求 POST /api/v1/ai-tasks]
    H --> I[接收WebSocket事件: ai_task_completed]
    I --> J[更新思想片段状态]
    J --> K[更新认知模型]
    K --> L[推送模型更新通知]
```

### 4.2 语音思想片段处理流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 移动应用
    participant Speech as Speech Framework
    participant API as 后端API
    participant AI as AI服务
    
    User->>App: 点击"语音输入"
    App->>Speech: 请求语音识别
    Speech-->>User: 开始录音
    User->>Speech: 语音输入
    Speech-->>App: 返回识别文本
    App-->>User: 显示识别文本
    User->>App: 确认输入
    App->>API: POST /api/v1/thoughts
    API->>AI: 请求AI分析
    AI-->>API: 返回分析结果
    API-->>App: 返回思想片段创建成功
    App-->>User: 显示创建成功
```

## 5. AI任务处理流程

### 5.1 AI认知模型构建流程

```mermaid
flowchart TD
    A[创建AI任务] --> B[任务队列]
    B --> C[AI分析服务]
    C --> D[文本解析]
    D --> E[概念提取]
    E --> F[关系构建]
    F --> G[认知模型生成]
    G --> H[更新数据库]
    H --> I[发送WebSocket通知]
    I --> J[前端更新模型]
```

### 5.2 认知洞察生成流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 移动应用
    participant API as 后端API
    participant AI as AI分析服务
    participant DB as 数据库
    
    User->>App: 请求生成洞察
    App->>API: POST /api/v1/ai-tasks
    API->>DB: 创建AI任务记录
    DB-->>API: 返回任务ID
    API-->>App: 返回任务创建成功
    API->>AI: 请求生成认知洞察
    AI->>DB: 查询认知模型数据
    DB-->>AI: 返回模型数据
    AI->>AI: 分析模型生成洞察
    AI->>DB: 保存洞察结果
    DB-->>AI: 保存成功
    AI-->>API: 返回洞察生成完成
    API->>API: 发送WebSocket事件
    API-->>App: 推送洞察更新
    App-->>User: 显示新的认知洞察
```

## 6. 建议生成与处理流程

### 6.1 建议生成流程

```mermaid
flowchart TD
    A[认知洞察生成完成] --> B[触发建议生成]
    B --> C[AI建议服务]
    C --> D[分析洞察数据]
    D --> E[生成改进建议]
    E --> F[保存建议到数据库]
    F --> G[发送WebSocket通知]
    G --> H[前端显示建议]
```

### 6.2 建议处理流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 移动应用
    participant API as 后端API
    participant DB as 数据库
    
    User->>App: 查看建议
    User->>App: 标记建议为已处理
    App->>API: PUT /api/v1/models/{modelId}/suggestions/{suggestionId}/treat
    API->>DB: 更新建议状态
    DB-->>API: 更新成功
    API-->>App: 返回处理成功
    App->>App: 更新本地建议状态
    App-->>User: 显示处理成功
```

## 7. 认知模型可视化流程

### 7.1 概念图生成流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 移动应用
    participant API as 后端API
    
    User->>App: 选择认知模型
    User->>App: 点击"查看概念图"
    App->>API: GET /api/v1/models/{modelId}/analyses
    API->>API: 生成概念图数据
    API-->>App: 返回可视化数据
    App->>App: 渲染概念图
    App-->>User: 显示概念图
    User->>App: 调整可视化参数
    App->>API: GET /api/v1/models/{modelId}/analyses?type=concept-map&params=...
    API-->>App: 返回更新后的可视化数据
    App->>App: 更新概念图
    App-->>User: 显示更新后的概念图
```

## 8. 通知流程

### 8.1 系统通知发送流程

```mermaid
sequenceDiagram
    participant API as 后端API
    participant APNs as Apple Push Notification Service
    participant App as 移动应用
    participant User as 用户
    
    API->>API: 生成通知
    API->>APNs: 发送推送通知请求
    APNs-->>App: 推送通知
    App-->>User: 显示通知
    User->>App: 点击通知
    App->>App: 跳转到相应页面
    App-->>User: 显示相关内容
```

## 9. 数据同步流程

### 9.1 本地数据与服务器同步流程

```mermaid
flowchart TD
    A[应用启动] --> B{网络可用?}
    B -->|是| C[检查本地数据版本]
    B -->|否| D[使用本地数据]
    C --> E[发送同步请求]
    E --> F[后端比较版本]
    F --> G{数据有更新?}
    G -->|是| H[返回更新数据]
    G -->|否| I[返回无更新]
    H --> J[更新本地数据]
    I --> K[结束同步]
    J --> K
    K --> L[显示最新数据]
```

## 10. 用户偏好设置流程

### 10.1 更新用户偏好流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 移动应用
    participant API as 后端API
    participant DB as 数据库
    
    User->>App: 进入设置页面
    User->>App: 修改偏好设置
    App->>App: 保存临时偏好
    User->>App: 确认保存
    App->>API: PUT /api/v1/users/me/preferences
    API->>DB: 更新用户偏好
    DB-->>API: 更新成功
    API-->>App: 返回更新成功
    App->>App: 更新本地偏好设置
    App-->>User: 显示保存成功
```

## 11. Mermaid图表使用说明

### 11.1 图表类型

- **Sequence Diagram**：用于描述对象之间的交互流程
- **Flow Chart**：用于描述流程的决策和分支

### 11.2 图表语法

- 使用Mermaid语法编写图表
- 支持嵌套图表和复杂逻辑
- 可以在Markdown文档中直接使用

### 11.3 查看方式

- 使用支持Mermaid的Markdown编辑器查看
- 在GitHub、GitLab等平台直接查看
- 使用Mermaid Live Editor在线查看：https://mermaid.live/

## 12. 流程维护

- **流程更新**：当业务流程发生变化时，及时更新相应的流程图
- **流程评审**：定期评审流程图，确保与实际业务逻辑一致
- **流程培训**：使用流程图对新团队成员进行培训

## 13. 参考资料

- [Mermaid Documentation](https://mermaid-js.github.io/mermaid/)
- [Sequence Diagram Syntax](https://mermaid-js.github.io/mermaid/syntax/sequenceDiagram.html)
- [Flow Chart Syntax](https://mermaid-js.github.io/mermaid/syntax/flowchart.html)
