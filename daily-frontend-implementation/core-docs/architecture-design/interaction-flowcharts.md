# 交互流程图文档

## 模块关联索引

### 所属环节
- **阶段**：文档优化
- **开发主题**：交互流程可视化

### 相关核心文档
- [前端架构设计](frontend-architecture.md)
- [业务流程流程图](business-process-flowcharts.md)
- [API集成规范](../core-features/api-integration-spec.md)
- [WebSocket集成](../core-features/websocket-integration.md)

## 1. 概述

本文档使用Mermaid图表描述AI认知辅助系统的用户交互流程，包括语音交互流程、认知模型可视化操作流程、思想片段输入流程等，明确前后端数据流转路径，帮助设计和开发团队理解用户交互设计。

## 2. 语音交互流程

### 2.1 语音输入与分析流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 应用界面
    participant Voice as 语音处理服务
    participant API as 后端API
    participant AI as AI分析服务
    participant DB as 数据库
    
    User->>UI: 点击语音输入按钮
    UI->>Voice: 启动语音识别
    Voice-->>UI: 显示录音状态
    Voice-->>User: 播放提示音
    User->>Voice: 语音输入
    Voice-->>UI: 实时显示识别文本
    User->>UI: 点击确认按钮
    UI->>API: POST /api/v1/thoughts (包含语音识别文本)
    API->>DB: 保存思想片段
    DB-->>API: 返回思想片段ID
    API->>AI: 请求AI分析
    AI->>DB: 查询相关认知模型
    DB-->>AI: 返回模型数据
    AI->>AI: 分析思想片段，更新认知模型
    AI->>DB: 保存分析结果
    DB-->>AI: 保存成功
    AI-->>API: 返回分析结果
    API-->>UI: 返回思想片段创建成功
    UI-->>User: 显示成功提示
    UI->>UI: 更新思想片段列表
```

### 2.2 语音输出流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 应用界面
    participant TextToSpeech as 文字转语音服务
    participant API as 后端API
    participant AI as AI生成服务
    
    User->>UI: 点击生成语音按钮
    UI->>API: POST /api/v1/speech/syntheses (包含文本内容)
    API->>AI: 请求文字转语音
    AI-->>API: 返回音频数据
    API-->>UI: 返回音频数据
    UI->>TextToSpeech: 播放音频
    TextToSpeech-->>User: 播放语音
    UI-->>User: 显示播放状态
```

## 3. 认知模型可视化交互流程

### 3.1 概念图交互流程

```mermaid
flowchart TD
    A[用户选择认知模型] --> B[加载模型数据]
    B --> C[渲染概念图]
    C --> D{用户操作}
    D -->|查看概念详情| E[显示概念详情面板]
    D -->|调整概念位置| F[更新本地概念位置]
    D -->|添加新关系| G[显示关系创建面板]
    D -->|删除概念| H[显示删除确认]
    D -->|筛选概念| I[过滤显示概念]
    D -->|放大/缩小| J[调整视图缩放]
    D -->|切换布局| K[重新渲染概念图]
    
    E --> D
    F --> L[保存位置更改]
    G --> M[创建新关系]
    H --> N[删除概念]
    I --> C
    J --> C
    K --> C
    
    L --> O[发送API请求保存位置]
    M --> P[发送API请求创建关系]
    N --> Q[发送API请求删除概念]
    
    O --> R[后端更新数据库]
    P --> R
    Q --> R
    
    R --> S[推送WebSocket更新]
    S --> T[前端接收更新]
    T --> U[更新本地数据]
    U --> C
```

### 3.2 概念详情查看流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 应用界面
    participant API as 后端API
    participant DB as 数据库
    
    User->>UI: 点击概念节点
    UI->>UI: 显示概念详情面板
    UI->>API: GET /api/v1/models/{modelId}/concepts/{conceptId}
    API->>DB: 查询概念详情
    DB-->>API: 返回概念数据
    API-->>UI: 返回概念详情
    UI->>UI: 更新详情面板内容
    User->>UI: 编辑概念信息
    User->>UI: 点击保存按钮
    UI->>API: PUT /api/v1/models/{modelId}/concepts/{conceptId}
    API->>DB: 更新概念数据
    DB-->>API: 更新成功
    API-->>UI: 返回更新成功
    UI->>UI: 更新概念节点显示
    UI-->>User: 显示保存成功
```

## 4. 思想片段管理流程

### 4.1 思想片段输入与编辑流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 应用界面
    participant API as 后端API
    participant DB as 数据库
    
    User->>UI: 点击"添加思想片段"
    UI->>UI: 显示思想片段输入界面
    User->>UI: 输入思想内容
    User->>UI: 选择思想类型
    User->>UI: 点击保存按钮
    UI->>API: POST /api/v1/thoughts
    API->>DB: 保存思想片段
    DB-->>API: 返回思想片段ID
    API-->>UI: 返回保存成功
    UI->>UI: 更新思想片段列表
    UI-->>User: 显示保存成功
    
    User->>UI: 点击思想片段
    UI->>UI: 显示思想片段详情
    User->>UI: 点击编辑按钮
    UI->>UI: 显示编辑界面
    User->>UI: 修改思想内容
    User->>UI: 点击保存按钮
    UI->>API: PUT /api/v1/thoughts/{thoughtId}
    API->>DB: 更新思想片段
    DB-->>API: 返回更新成功
    API-->>UI: 返回更新成功
    UI->>UI: 更新思想片段列表
    UI-->>User: 显示更新成功
```

### 4.2 思想片段分析结果查看流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 应用界面
    participant API as 后端API
    participant DB as 数据库
    
    User->>UI: 选择思想片段
    UI->>UI: 显示思想片段详情
    User->>UI: 点击"查看分析结果"
    UI->>API: GET /api/v1/thoughts/{thoughtId}/analysis
    API->>DB: 查询分析结果
    DB-->>API: 返回分析数据
    API-->>UI: 返回分析结果
    UI->>UI: 渲染分析结果图表
    UI-->>User: 显示分析结果
    User->>UI: 点击"查看影响的概念"
    UI->>API: GET /api/v1/thoughts/{thoughtId}/related-concepts
    API->>DB: 查询相关概念
    DB-->>API: 返回概念数据
    API-->>UI: 返回相关概念
    UI->>UI: 显示相关概念列表
    User->>UI: 点击相关概念
    UI->>UI: 导航到概念详情页面
```

## 5. 认知模型管理流程

### 5.1 认知模型创建与配置流程

```mermaid
flowchart TD
    A[用户点击"创建模型"] --> B[显示创建模型表单]
    B --> C[用户输入模型名称和描述]
    C --> D[选择模型类型]
    D --> E[点击"创建"按钮]
    E --> F[发送API请求 POST /api/v1/models]
    F --> G[后端创建模型记录]
    G --> H[返回模型ID]
    H --> I[显示模型创建成功]
    I --> J[导航到模型详情页面]
    J --> K[显示模型配置选项]
    K --> L{用户配置操作}
    L -->|添加概念| M[显示添加概念表单]
    L -->|导入数据| N[显示数据导入选项]
    L -->|调整模型设置| O[显示模型设置表单]
    
    M --> P[用户输入概念信息]
    N --> Q[用户选择导入源]
    O --> R[用户调整设置]
    
    P --> S[发送API请求创建概念]
    Q --> T[发送API请求导入数据]
    R --> U[发送API请求更新设置]
    
    S --> V[后端保存概念]
    T --> W[后端处理数据导入]
    U --> X[后端更新模型设置]
    
    V --> Y[返回创建成功]
    W --> Y
    X --> Y
    
    Y --> Z[更新模型详情视图]
```

### 5.2 认知模型切换与比较流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 应用界面
    participant API as 后端API
    participant DB as 数据库
    
    User->>UI: 点击模型切换按钮
    UI->>UI: 显示模型列表
    User->>UI: 选择目标模型
    UI->>API: GET /api/v1/models/{modelId}
    API->>DB: 查询模型详情
    DB-->>API: 返回模型数据
    API-->>UI: 返回模型详情
    UI->>UI: 切换当前显示的模型
    UI-->>User: 显示模型切换成功
    
    User->>UI: 点击"比较模型"按钮
    UI->>UI: 显示模型比较界面
    UI->>API: GET /api/v1/models/{modelId1}/compare/{modelId2}
    API->>DB: 查询两个模型数据
    DB-->>API: 返回模型数据
    API->>API: 比较两个模型
    API-->>UI: 返回比较结果
    UI->>UI: 渲染模型比较视图
    UI-->>User: 显示比较结果
```

## 6. 洞察与建议流程

### 6.1 认知洞察查看与处理流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 应用界面
    participant API as 后端API
    participant DB as 数据库
    
    User->>UI: 点击"洞察"标签
    UI->>API: GET /api/v1/models/{modelId}/insights
    API->>DB: 查询洞察列表
    DB-->>API: 返回洞察数据
    API-->>UI: 返回洞察列表
    UI->>UI: 渲染洞察列表
    UI-->>User: 显示洞察列表
    
    User->>UI: 点击洞察项
    UI->>UI: 显示洞察详情
    User->>UI: 点击"标记为已解决"
    UI->>API: PUT /api/v1/models/{modelId}/insights/{insightId}/resolve
    API->>DB: 更新洞察状态
    DB-->>API: 更新成功
    API-->>UI: 返回更新成功
    UI->>UI: 更新洞察列表
    UI-->>User: 显示更新成功
    
    User->>UI: 点击"查看相关建议"
    UI->>API: GET /api/v1/models/{modelId}/insights/{insightId}/suggestions
    API->>DB: 查询相关建议
    DB-->>API: 返回建议数据
    API-->>UI: 返回建议列表
    UI->>UI: 显示相关建议
```

### 6.2 建议处理与反馈流程

```mermaid
flowchart TD
    A[用户查看建议列表] --> B[选择建议项]
    B --> C[显示建议详情]
    C --> D{用户操作}
    D -->|标记为已处理| E[更新建议状态]
    D -->|实施建议| F[显示实施选项]
    D -->|忽略建议| G[更新建议状态]
    
    E --> H[发送API请求]
    F --> I[用户选择实施方式]
    G --> J[发送API请求]
    
    I --> K[执行实施操作]
    K --> L[更新认知模型]
    L --> H
    
    H --> M[后端更新建议状态]
    J --> M
    
    M --> N[返回更新结果]
    N --> O[更新界面显示]
    O --> P[显示操作结果]
```

## 7. 应用设置与个性化流程

### 7.1 用户偏好设置流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 应用界面
    participant API as 后端API
    participant DB as 数据库
    
    User->>UI: 点击"设置"图标
    UI->>UI: 显示设置界面
    User->>UI: 选择"偏好设置"
    UI->>API: GET /api/v1/users/me/preferences
    API->>DB: 查询用户偏好
    DB-->>API: 返回偏好数据
    API-->>UI: 返回偏好设置
    UI->>UI: 渲染偏好设置表单
    UI-->>User: 显示偏好设置
    
    User->>UI: 调整偏好设置
    User->>UI: 点击"保存"按钮
    UI->>API: PUT /api/v1/users/me/preferences
    API->>DB: 更新用户偏好
    DB-->>API: 更新成功
    API-->>UI: 返回更新成功
    UI->>UI: 更新本地设置
    UI-->>User: 显示保存成功
```

### 7.2 个性化推荐流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 应用界面
    participant API as 后端API
    participant AI as AI推荐服务
    participant DB as 数据库
    
    User->>UI: 打开应用
    UI->>API: GET /api/v1/users/me
    API->>DB: 查询用户数据
    DB-->>API: 返回用户数据
    API-->>UI: 返回用户信息
    
    UI->>API: GET /api/v1/models/{modelId}/suggestions?priority=high
    API->>AI: 请求个性化推荐
    AI->>DB: 查询用户认知模型
    DB-->>AI: 返回模型数据
    AI->>DB: 查询用户历史行为
    DB-->>AI: 返回历史数据
    AI->>AI: 生成个性化推荐
    AI->>DB: 保存推荐结果
    DB-->>AI: 保存成功
    AI-->>API: 返回推荐结果
    API-->>UI: 返回推荐列表
    UI->>UI: 渲染推荐列表
    UI-->>User: 显示个性化推荐
    
    User->>UI: 点击推荐项
    UI->>UI: 显示推荐详情
    User->>UI: 点击"实施推荐"
    UI->>API: POST /api/v1/models/{modelId}/suggestions/{suggestionId}/implement
    API->>DB: 更新推荐状态
    DB-->>API: 更新成功
    API-->>UI: 返回更新成功
    UI->>UI: 更新推荐列表
    UI-->>User: 显示操作结果
```

## 8. 数据导入与导出流程

### 8.1 数据导入流程

```mermaid
flowchart TD
    A[用户点击"导入数据"] --> B[显示导入选项]
    B --> C{选择导入类型}
    C -->|文件导入| D[显示文件选择器]
    C -->|手动输入| E[显示输入表单]
    C -->|第三方导入| F[显示第三方服务列表]
    
    D --> G[用户选择文件]
    E --> H[用户输入数据]
    F --> I[用户选择第三方服务]
    
    G --> J[上传文件到服务器]
    H --> K[发送API请求保存数据]
    I --> L[授权第三方服务]
    
    J --> M[后端处理文件]
    L --> M
    
    M --> N[解析数据]
    N --> O[验证数据格式]
    
    O --> P{数据有效?}
    P -->|是| Q[保存到数据库]
    P -->|否| R[返回错误信息]
    
    Q --> S[返回导入成功]
    R --> T[显示错误信息]
    
    K --> Q
    
    S --> U[更新界面显示]
    T --> U
    
    U --> V[显示导入结果]
```

## 9. 流程图使用指南

### 9.1 阅读和理解流程

1. **从左到右**：流程通常从左侧开始，向右流动
2. **参与者角色**：每个参与者代表系统的一个组件或角色
3. **交互方向**：箭头表示消息或数据的流动方向
4. **关键操作**：重点关注用户操作和系统响应
5. **数据流转**：注意前后端数据的传递路径

### 9.2 更新和维护流程

1. **流程变更**：当交互设计发生变化时，及时更新相应的流程图
2. **版本控制**：为流程图添加版本号，便于跟踪变更
3. **定期审查**：定期审查流程图，确保与实际产品一致
4. **反馈收集**：收集用户和开发团队的反馈，优化流程图

### 9.3 设计参考

- 使用流程图指导UI设计，确保界面元素与流程匹配
- 流程图可作为用户测试的参考，验证交互设计的合理性
- 开发团队可根据流程图理解前后端数据流转，实现相应功能

## 10. 参考资料

- [Mermaid Documentation](https://mermaid-js.github.io/mermaid/)
- [User Experience Design Process](https://www.nngroup.com/articles/ux-design-process/)
- [Interaction Design Principles](https://www.interaction-design.org/literature/topics/interaction-design)
