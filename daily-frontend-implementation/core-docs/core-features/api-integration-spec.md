# API集成规范

## 模块关联索引

### 所属环节
- **阶段**：第一阶段：基础架构搭建
- **周次**：第1周
- **天数**：第2天
- **开发主题**：API服务和数据模型

### 对应文档
- [第2天：API服务和数据模型](../../phase-1-foundation/week-1-setup/02-api-service-and-models-技术实现.md)

### 相关核心文档
- [前端架构设计](../architecture-design/frontend-architecture.md)
- [技术栈选型](../dev-support/tech-stack-selection.md)
- [API文档](api-documentation.md)

### 关联模块
- [API文档](api-documentation.md)
- [WebSocket集成设计](websocket-integration.md)

### 依赖关系
- [前端架构设计](../architecture-design/frontend-architecture.md)
- [技术栈选型](../dev-support/tech-stack-selection.md)

## 1. 概述

本文档定义了AI Voice Interaction App前端与后端API的集成规范，包括API请求/响应格式、认证方式、错误处理等，确保前后端之间的通信一致性和可靠性。

## 2. 基础规范

### 2.1 API基础URL
- **开发环境**：`http://localhost:3000/api/v1`
- **测试环境**：`https://test-api.example.com/api/v1`
- **生产环境**：`https://api.example.com/api/v1`

### 2.2 请求格式
- **协议**：HTTPS
- **方法**：GET, POST, PUT, DELETE
- **数据格式**：JSON
- **字符编码**：UTF-8
- **请求头**：
  ```
  Content-Type: application/json
  Authorization: Bearer <token> (如果需要认证)
  ```

### 2.3 响应格式
- **数据格式**：JSON
- **统一响应结构**：
  
  成功响应：
  ```json
  {
    "data": {},
    "meta": {
      "message": "Success",
      "requestId": "uuid-1234-5678",
      "timestamp": "2023-10-01T12:00:00.000Z"
    }
  }
  ```
  
  列表响应：
  ```json
  {
    "data": [],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "requestId": "uuid-1234-5678",
      "timestamp": "2023-10-01T12:00:00.000Z"
    }
  }
  ```
  
  错误响应：
  ```json
  {
    "data": null,
    "meta": {
      "error": {
        "code": "ERROR_CODE",
        "message": "错误描述",
        "details": [],
        "type": "errorType"
      },
      "requestId": "uuid-1234-5678",
      "timestamp": "2023-10-01T12:00:00.000Z"
    }
  }
  ```

## 3. 认证与授权

### 3.1 认证方式
- **JWT Token**：使用JSON Web Token进行认证
- **Token存储**：敏感数据（如JWT Token）存储在Keychain中
- **Token刷新**：实现Token自动刷新机制

### 3.2 认证流程
1. 用户登录，获取AccessToken和RefreshToken
2. 将AccessToken和RefreshToken存储在Keychain中
3. 每次API请求时，在请求头中携带AccessToken
4. 当AccessToken过期时，使用RefreshToken获取新的AccessToken
5. 如果RefreshToken也过期，提示用户重新登录

### 3.3 授权策略
- **最小权限原则**：只请求必要的权限
- **权限检查**：后端会检查用户是否有权限访问请求的资源
- **权限错误**：返回403 Forbidden错误

## 4. 核心API集成

### 4.1 认证相关API

#### 4.1.1 登录
- **请求**：POST /api/v1/sessions
- **参数**：
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **响应**：
  ```json
  {
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "123",
        "username": "johndoe",
        "email": "user@example.com"
      }
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.1.2 注册
- **请求**：POST /api/v1/users
- **参数**：
  ```json
  {
    "username": "johndoe",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **响应**：
  ```json
  {
    "data": {
      "id": "123",
      "username": "johndoe",
      "email": "user@example.com"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.1.3 刷新Token
- **请求**：POST /api/v1/tokens/refresh
- **参数**：
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **响应**：
  ```json
  {
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.2 认知模型相关API

#### 4.2.1 获取认知模型列表
- **请求**：GET /api/v1/models
- **参数**：
  - `page`：页码，默认1
  - `limit`：每页数量，默认10
- **响应**：
  ```json
  {
    "data": [
      {
        "id": "123",
        "name": "My Cognitive Model",
        "description": "A description of my cognitive model",
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-02T00:00:00Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.2.2 获取认知模型详情
- **请求**：GET /api/v1/models/{modelId}
- **参数**：模型ID
- **响应**：
  ```json
  {
    "data": {
      "id": "123",
      "name": "My Cognitive Model",
      "description": "A description of my cognitive model",
      "concepts": [
        {
          "id": "456",
          "name": "Concept 1",
          "description": "A description of concept 1",
          "importance": 0.8,
          "type": "general"
        }
      ],
      "relations": [
        {
          "id": "789",
          "sourceId": "456",
          "targetId": "012",
          "type": "related",
          "strength": 0.7
        }
      ],
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-02T00:00:00Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.3 文件处理相关API

#### 4.3.1 上传文件
- **请求**：POST /api/v1/files/upload
- **请求内容类型**：`multipart/form-data`
- **参数**：
  - `file`：文件（FormData）
  - `type`：文件类型（自动检测，可选值：document, image, audio）
  - `tags`：文件标签，逗号分隔
- **响应**：
  ```json
  {
    "data": {
      "fileId": "f123456789",
      "name": "example.pdf",
      "type": "document",
      "size": 102400,
      "uploadDate": "2024-01-08T12:00:00Z",
      "status": "pending"
    },
    "meta": {
      "requestId": "uuid-1234-5678",
      "message": "File uploaded successfully"
    }
  }
  ```

#### 4.3.2 获取文件列表
- **请求**：GET /api/v1/files
- **参数**：
  - `type`：文件类型筛选
  - `status`：文件状态筛选
  - `page`：页码，默认1
  - `limit`：每页数量，默认10
- **响应**：
  ```json
  {
    "data": [
      {
        "fileId": "f123456789",
        "name": "example.pdf",
        "type": "document",
        "size": 102400,
        "uploadDate": "2024-01-08T12:00:00Z",
        "status": "processed"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.3.3 获取文件详情
- **请求**：GET /api/v1/files/{fileId}
- **参数**：文件ID
- **响应**：
  ```json
  {
    "data": {
      "fileId": "f123456789",
      "name": "example.pdf",
      "type": "document",
      "size": 102400,
      "uploadDate": "2024-01-08T12:00:00Z",
      "status": "processed",
      "content": "文件内容摘要...",
      "aiTasks": [
        {
          "taskId": "t123456789",
          "type": "cognitive_analysis",
          "status": "completed"
        }
      ]
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.4 语音交互相关API

#### 4.4.1 语音转文本
- **请求**：POST /api/v1/speech/transcriptions
- **参数**：
  - `audio`：音频文件（base64编码）
  - `language`：语言代码，默认"zh-CN"
- **响应**：
  ```json
  {
    "data": {
      "text": "这是转换后的文本"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.4.2 文本转语音
- **请求**：POST /api/v1/speech/syntheses
- **参数**：
  - `text`：要转换的文本
  - `voice`：语音类型，默认"default"
- **响应**：
  ```json
  {
    "data": {
      "audio": "base64编码的音频数据"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.4.3 AI对话生成
- **请求**：POST /api/v1/ai-tasks
- **参数**：
  - `type`: "conversation",
  - `inputType`: "text",
  - `inputId`: "string",
  - `priority`: "medium",
  - `params`: {
      "input": "用户输入文本",
      "context": "上下文信息",
      "modelId": "认知模型ID"
    }
- **响应**：
  ```json
  {
    "data": {
      "taskId": "task-123",
      "type": "conversation",
      "status": "pending",
      "priority": "medium",
      "createdAt": "2024-01-08T12:00:00Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.5 认知模型管理API

#### 4.5.1 创建认知模型
- **请求**：POST /api/v1/models
- **参数**：
  - `modelName`：模型名称
  - `isPrimary`：是否为主模型
- **响应**：
  ```json
  {
    "data": {
      "id": "model123",
      "userId": "user123",
      "modelName": "My Cognitive Model",
      "isPrimary": false,
      "healthScore": 100.0,
      "conceptCount": 0,
      "relationCount": 0,
      "createdAt": "2024-01-08T12:00:00Z",
      "updatedAt": "2024-01-08T12:00:00Z",
      "lastAnalyzedAt": null
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.5.2 更新认知模型
- **请求**：PUT /api/v1/models/{modelId}
- **参数**：
  - `modelName`：模型名称（可选）
  - `isPrimary`：是否为主模型（可选）
- **响应**：
  ```json
  {
    "data": {
      "id": "model123",
      "userId": "user123",
      "modelName": "Updated Cognitive Model",
      "isPrimary": true,
      "healthScore": 100.0,
      "conceptCount": 5,
      "relationCount": 3,
      "createdAt": "2024-01-08T12:00:00Z",
      "updatedAt": "2024-01-09T12:00:00Z",
      "lastAnalyzedAt": "2024-01-08T12:30:00Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.5.3 删除认知模型
- **请求**：DELETE /api/v1/models/{modelId}
- **参数**：模型ID
- **响应**：
  ```json
  {
    "data": {
      "message": "认知模型已成功删除"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.6 认知概念和关系管理API

#### 4.6.1 创建认知概念
- **请求**：POST /api/v1/models/{modelId}/concepts
- **参数**：
  - `name`：概念名称
  - `description`：概念描述
  - `importance`：概念重要性 (low/medium/high)
- **响应**：
  ```json
  {
    "data": {
      "id": "concept123",
      "modelId": "model123",
      "name": "Concept Name",
      "description": "Concept description",
      "importance": "high",
      "occurrenceCount": 1,
      "createdAt": "2024-01-08T12:00:00Z",
      "updatedAt": "2024-01-08T12:00:00Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.6.2 创建认知关系
- **请求**：POST /api/v1/models/{modelId}/relations
- **参数**：
  - `sourceConceptId`：源概念ID
  - `targetConceptId`：目标概念ID
  - `relationType`：关系类型
  - `strength`：关系强度 (weak/medium/strong)
- **响应**：
  ```json
  {
    "data": {
      "id": "relation123",
      "modelId": "model123",
      "sourceConceptId": "concept123",
      "targetConceptId": "concept456",
      "relationType": "is-a",
      "strength": "strong",
      "occurrenceCount": 1,
      "createdAt": "2024-01-08T12:00:00Z",
      "updatedAt": "2024-01-08T12:00:00Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.7 AI任务管理API

#### 4.7.1 创建AI任务
- **请求**：POST /api/v1/ai-tasks
- **参数**：
  - `type`：任务类型
  - `inputType`：输入类型
  - `inputId`：输入ID
  - `modelId`：认知模型ID
  - `priority`：优先级
- **响应**：
  ```json
  {
    "data": {
      "id": "task123",
      "userId": "user123",
      "modelId": "model123",
      "type": "cognitive_analysis",
      "inputType": "text",
      "inputId": "text123",
      "status": "pending",
      "priority": "medium",
      "createdAt": "2024-01-08T12:00:00Z",
      "updatedAt": "2024-01-08T12:00:00Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.7.2 获取AI任务状态
- **请求**：GET /api/v1/ai-tasks/{id}
- **参数**：任务ID
- **响应**：
  ```json
  {
    "data": {
      "id": "task123",
      "status": "completed",
      "result": {
        "analysis": {}
      },
      "completedAt": "2024-01-08T12:05:00Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  }
  ```

### 4.8 思想片段模块

#### 4.8.1 创建思想片段
- **请求**：POST /api/v1/thoughts
- **参数**：
  - `content`：思想内容
  - `thoughtType`：思想类型（text/audio/image）
  - `source`：来源（manual-input/voice-input/file-upload）
  - `modelId`：认知模型ID
- **响应**：
  ```json
  {
    "data": {
      "id": "thought-123",
      "userId": "user-123",
      "modelId": "model-123",
      "content": "今天学习了人工智能的基本概念",
      "thoughtType": "text",
      "source": "manual-input",
      "isAnalyzed": false,
      "createdAt": "2023-10-05T18:00:00.000Z",
      "updatedAt": "2023-10-05T18:00:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.8.2 获取思想片段列表
- **请求**：GET /api/v1/thoughts
- **参数**：
  - `modelId`：可选，按认知模型过滤
  - `thoughtType`：可选，按思想类型过滤
  - `isAnalyzed`：可选，按是否已分析过滤
  - `startDate`：可选，按开始日期过滤
  - `endDate`：可选，按结束日期过滤
  - `page`：可选，页码，默认1
  - `limit`：可选，每页数量，默认10
- **响应**：
  ```json
  {
    "items": [
      {
        "id": "thought-123",
        "content": "今天学习了人工智能的基本概念",
        "thoughtType": "text",
        "source": "manual-input",
        "isAnalyzed": true,
        "createdAt": "2023-10-05T18:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.8.3 获取思想片段详情
- **请求**：GET /api/v1/thoughts/{thoughtId}
- **参数**：思想片段ID
- **响应**：
  ```json
  {
    "data": {
      "id": "thought-123",
      "userId": "user-123",
      "modelId": "model-123",
      "content": "今天学习了人工智能的基本概念",
      "thoughtType": "text",
      "source": "manual-input",
      "isAnalyzed": true,
      "createdAt": "2023-10-05T18:00:00.000Z",
      "updatedAt": "2023-10-05T18:15:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.8.4 更新思想片段
- **请求**：PUT /api/v1/thoughts/{thoughtId}
- **参数**：
  - `content`：思想内容（可选）
  - `thoughtType`：思想类型（可选）
  - `source`：来源（可选）
- **响应**：
  ```json
  {
    "data": {
      "id": "thought-123",
      "userId": "user-123",
      "modelId": "model-123",
      "content": "今天深入学习了人工智能的基本概念和应用",
      "thoughtType": "text",
      "source": "manual-input",
      "isAnalyzed": false,
      "createdAt": "2023-10-05T18:00:00.000Z",
      "updatedAt": "2023-10-05T18:30:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.8.5 删除思想片段
- **请求**：DELETE /api/v1/thoughts/{thoughtId}
- **参数**：思想片段ID
- **响应**：
  ```json
  {
    "data": {
      "message": "思想片段已成功删除"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.9 苹果认证相关API

#### 4.9.1 获取Apple认证URL
- **请求**：GET /api/v1/auth/apple/url
- **参数**：
  - `redirectUri`：可选，重定向URI
- **响应**：
  ```json
  {
    "data": {
      "authorizationUrl": "https://appleid.apple.com/auth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=email%20name&state=...",
      "state": "random-state-value"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.9.2 Apple认证回调
- **请求**：POST /api/v1/auth/apple/callback
- **参数**：
  - `code`：Apple授权码
  - `state`：随机状态值
- **响应**：
  ```json
  {
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 3600,
      "user": {
        "id": "user-123",
        "username": "appleuser",
        "email": "user@example.com",
        "appleId": "apple-user-id"
      }
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.9.3 使用Apple ID令牌登录
- **请求**：POST /api/v1/auth/apple/login
- **参数**：
  - `idToken`：Apple ID令牌
  - `nonce`：随机nonce值
- **响应**：
  ```json
  {
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 3600,
      "user": {
        "id": "user-123",
        "username": "appleuser",
        "email": "user@example.com",
        "appleId": "apple-user-id"
      }
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.10 用户信息相关API

#### 4.10.1 获取当前用户信息
- **请求**：GET /api/v1/users/me
- **参数**：无
- **响应**：
  ```json
  {
    "data": {
      "id": "user-123",
      "username": "testuser",
      "email": "test@example.com",
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-01T12:00:00.000Z",
      "lastLoginAt": "2023-10-05T14:30:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.10.2 更新用户信息
- **请求**：PUT /api/v1/users/me
- **参数**：
  - `username`：用户名（可选）
  - `email`：邮箱（可选）
- **响应**：
  ```json
  {
    "data": {
      "id": "user-123",
      "username": "newusername",
      "email": "newemail@example.com",
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-05T15:00:00.000Z",
      "lastLoginAt": "2023-10-05T14:30:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.11 概念管理相关API

#### 4.11.1 获取认知模型的所有概念
- **请求**：GET /api/v1/models/{modelId}/concepts
- **参数**：
  - `importance`：可选，按重要性过滤（low/medium/high）
  - `page`：可选，页码，默认1
  - `limit`：可选，每页数量，默认10
- **响应**：
  ```json
  {
    "items": [
      {
        "id": "concept-123",
        "name": "人工智能",
        "description": "人工智能是计算机科学的一个分支",
        "importance": "high",
        "occurrenceCount": 1,
        "createdAt": "2023-10-05T16:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.11.2 获取概念详情
- **请求**：GET /api/v1/models/{modelId}/concepts/{conceptId}
- **参数**：概念ID
- **响应**：
  ```json
  {
    "data": {
      "id": "concept-123",
      "modelId": "model-123",
      "name": "人工智能",
      "description": "人工智能是计算机科学的一个分支",
      "importance": "high",
      "occurrenceCount": 1,
      "createdAt": "2023-10-05T16:00:00.000Z",
      "updatedAt": "2023-10-05T16:00:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.11.3 更新概念
- **请求**：PUT /api/v1/models/{modelId}/concepts/{conceptId}
- **参数**：
  - `name`：概念名称（可选）
  - `description`：概念描述（可选）
  - `importance`：概念重要性（可选）
- **响应**：
  ```json
  {
    "data": {
      "id": "concept-123",
      "modelId": "model-123",
      "name": "人工智能（AI）",
      "description": "人工智能（AI）是计算机科学的一个分支，研究如何使计算机模拟人类智能",
      "importance": "high",
      "occurrenceCount": 1,
      "createdAt": "2023-10-05T16:00:00.000Z",
      "updatedAt": "2023-10-05T16:45:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.11.4 删除概念
- **请求**：DELETE /api/v1/models/{modelId}/concepts/{conceptId}
- **参数**：概念ID
- **响应**：
  ```json
  {
    "data": {
      "message": "认知概念已成功删除"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.12 关系管理相关API

#### 4.12.1 获取认知模型的所有关系
- **请求**：GET /api/v1/models/{modelId}/relations
- **参数**：
  - `sourceConceptId`：可选，按源概念过滤
  - `targetConceptId`：可选，按目标概念过滤
  - `relationType`：可选，按关系类型过滤
  - `strength`：可选，按强度过滤（weak/medium/strong）
  - `page`：可选，页码，默认1
  - `limit`：可选，每页数量，默认10
- **响应**：
  ```json
  {
    "items": [
      {
        "id": "relation-123",
        "sourceConceptId": "concept-123",
        "targetConceptId": "concept-456",
        "relationType": "is-a",
        "strength": "strong",
        "occurrenceCount": 1,
        "createdAt": "2023-10-05T17:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.12.2 获取关系详情
- **请求**：GET /api/v1/models/{modelId}/relations/{relationId}
- **参数**：关系ID
- **响应**：
  ```json
  {
    "data": {
      "id": "relation-123",
      "modelId": "model-123",
      "sourceConceptId": "concept-123",
      "targetConceptId": "concept-456",
      "relationType": "is-a",
      "strength": "strong",
      "occurrenceCount": 1,
      "createdAt": "2023-10-05T17:00:00.000Z",
      "updatedAt": "2023-10-05T17:00:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.12.3 更新关系
- **请求**：PUT /api/v1/models/{modelId}/relations/{relationId}
- **参数**：
  - `relationType`：关系类型（可选）
  - `strength`：关系强度（可选）
- **响应**：
  ```json
  {
    "data": {
      "id": "relation-123",
      "modelId": "model-123",
      "sourceConceptId": "concept-123",
      "targetConceptId": "concept-456",
      "relationType": "part-of",
      "strength": "medium",
      "occurrenceCount": 1,
      "createdAt": "2023-10-05T17:00:00.000Z",
      "updatedAt": "2023-10-05T17:30:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.12.4 删除关系
- **请求**：DELETE /api/v1/models/{modelId}/relations/{relationId}
- **参数**：关系ID
- **响应**：
  ```json
  {
    "data": {
      "message": "认知关系已成功删除"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.13 洞察模块

#### 4.13.1 获取认知模型的所有洞察
- **请求**：GET /api/v1/models/{modelId}/insights
- **参数**：
  - `insightType`：可选，按洞察类型过滤
  - `severity`：可选，按严重程度过滤（low/medium/high）
  - `isResolved`：可选，按是否已解决过滤
  - `page`：可选，页码，默认1
  - `limit`：可选，每页数量，默认10
- **响应**：
  ```json
  {
    "items": [
      {
        "id": "insight-123",
        "insightType": "concept-gap",
        "title": "缺少相关概念",
        "description": "您的认知模型中缺少与人工智能相关的重要概念",
        "severity": "medium",
        "isResolved": false,
        "createdAt": "2023-10-05T18:45:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.13.2 获取洞察详情
- **请求**：GET /api/v1/models/{modelId}/insights/{insightId}
- **参数**：洞察ID
- **响应**：
  ```json
  {
    "data": {
      "id": "insight-123",
      "modelId": "model-123",
      "insightType": "concept-gap",
      "title": "缺少相关概念",
      "description": "您的认知模型中缺少与人工智能相关的重要概念，如机器学习、深度学习等",
      "severity": "medium",
      "isResolved": false,
      "resolvedAt": null,
      "createdAt": "2023-10-05T18:45:00.000Z",
      "updatedAt": "2023-10-05T18:45:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.13.3 标记洞察为已解决
- **请求**：PUT /api/v1/models/{modelId}/insights/{insightId}/resolve
- **参数**：无
- **响应**：
  ```json
  {
    "data": {
      "id": "insight-123",
      "modelId": "model-123",
      "insightType": "concept-gap",
      "title": "缺少相关概念",
      "description": "您的认知模型中缺少与人工智能相关的重要概念，如机器学习、深度学习等",
      "severity": "medium",
      "isResolved": true,
      "resolvedAt": "2023-10-05T19:00:00.000Z",
      "createdAt": "2023-10-05T18:45:00.000Z",
      "updatedAt": "2023-10-05T19:00:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.14 建议模块

#### 4.14.1 获取认知模型的所有建议
- **请求**：GET /api/v1/models/{modelId}/suggestions
- **参数**：
  - `priority`：可选，按优先级过滤（low/medium/high）
  - `isTreated`：可选，按是否已处理过滤
  - `page`：可选，页码，默认1
  - `limit`：可选，每页数量，默认10
- **响应**：
  ```json
  {
    "items": [
      {
        "id": "suggestion-123",
        "title": "添加相关概念",
        "description": "建议添加机器学习和深度学习等概念到您的认知模型中",
        "priority": "high",
        "isTreated": false,
        "createdAt": "2023-10-05T19:15:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.14.2 获取建议详情
- **请求**：GET /api/v1/models/{modelId}/suggestions/{suggestionId}
- **参数**：建议ID
- **响应**：
  ```json
  {
    "data": {
      "id": "suggestion-123",
      "modelId": "model-123",
      "insightId": "insight-123",
      "title": "添加相关概念",
      "description": "建议添加机器学习和深度学习等概念到您的认知模型中，这些是人工智能领域的重要组成部分",
      "priority": "high",
      "isTreated": false,
      "treatedAt": null,
      "createdAt": "2023-10-05T19:15:00.000Z",
      "updatedAt": "2023-10-05T19:15:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.14.3 标记建议为已处理
- **请求**：PUT /api/v1/models/{modelId}/suggestions/{suggestionId}/treat
- **参数**：无
- **响应**：
  ```json
  {
    "data": {
      "id": "suggestion-123",
      "modelId": "model-123",
      "insightId": "insight-123",
      "title": "添加相关概念",
      "description": "建议添加机器学习和深度学习等概念到您的认知模型中，这些是人工智能领域的重要组成部分",
      "priority": "high",
      "isTreated": true,
      "treatedAt": "2023-10-05T19:30:00.000Z",
      "createdAt": "2023-10-05T19:15:00.000Z",
      "updatedAt": "2023-10-05T19:30:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

### 4.15 可视化模块

#### 4.15.1 生成认知模型可视化数据
- **请求**：GET /api/v1/models/{modelId}/analyses
- **参数**：
  - `visualizationType`：可选，可视化类型（concept-map/hierarchy/network/timeline/cluster），默认concept-map
  - `includeInsights`：可选，是否包含洞察，默认false
  - `depth`：可选，深度，默认3
  - `conceptLimit`：可选，概念数量限制，默认50
  - `page`：可选，页码，默认1
  - `limit`：可选，每页大小，默认50
  - `filterByImportance`：可选，按重要性过滤，默认0
  - `includeRelations`：可选，是否包含关系，默认true
- **响应**：
  ```json
  {
    "data": {
      "modelId": "model-123",
      "visualizationType": "concept-map",
      "createdAt": "2023-10-05T20:00:00.000Z",
      "data": {
        "nodes": [
          {
            "id": "concept-123",
            "type": "concept",
            "label": "人工智能",
            "properties": {
              "name": "人工智能",
              "importance": 0.8,
              "description": "人工智能是计算机科学的一个分支"
            }
          }
        ],
        "edges": [
          {
            "id": "relation-123",
            "source": "concept-123",
            "target": "concept-456",
            "type": "is-a",
            "properties": {
              "strength": 0.9,
              "relationType": "is-a"
            }
          }
        ],
        "metadata": {
          "conceptCount": 5,
          "relationCount": 3,
          "insightCount": 0,
          "suggestionCount": 0,
          "layout": "force-directed"
        }
      },
      "thinkingType": {
        "modelId": "model-123",
        "dominantThinkingTypes": ["analytical", "logical", "sequential"],
        "thinkingTypeScores": {
          "analytical": 8.5,
          "creative": 6.2,
          "practical": 7.1,
          "critical": 7.8,
          "holistic": 5.9,
          "sequential": 8.2,
          "spatial": 6.5,
          "logical": 8.7,
          "intuitive": 5.3,
          "experimental": 6.8
        },
        "description": "您的认知模型显示出较强的分析性和逻辑性思维倾向，善于系统化思考和推理。",
        "suggestions": [
          "可以尝试增加创造性思维的训练，例如发散性思考练习。",
          "考虑从更整体的角度分析概念之间的关系。"
        ]
      },
      "statistics": {
        "modelId": "model-123",
        "conceptCount": 5,
        "relationCount": 3,
        "averageConceptImportance": 0.75,
        "averageRelationStrength": 0.8,
        "conceptGrowthRate": 0.2,
        "relationGrowthRate": 0.15,
        "insightDistribution": {},
        "suggestionDistribution": {},
        "modelHealthScore": 8.5
      }
    },
    "meta": {
      "requestId": "uuid-1234-5678",
      "pagination": {
        "page": 1,
        "limit": 50,
        "total": 120,
        "hasNextPage": true,
        "nextPage": 2,
        "prevPage": null,
        "totalPages": 3
      }
    }
  }
  ```

#### 4.15.2 生成概念图数据
- **请求**：GET /api/v1/models/{modelId}/analyses/concept-graph
- **参数**：
  - `layout`：可选，布局类型（force-directed/hierarchical/circular/grid），默认force-directed
  - `filterByImportance`：可选，按重要性过滤，默认0
  - `includeRelatedInsights`：可选，是否包含相关洞察，默认false
  - `page`：可选，页码，默认1
  - `limit`：可选，每页大小，默认50
  - `sortBy`：可选，排序字段（importance/occurrenceCount/name），默认importance
  - `sortOrder`：可选，排序顺序（asc/desc），默认desc
- **响应**：
  ```json
  {
    "data": {
      "modelId": "model-123",
      "nodes": [
        {
          "id": "concept-123",
          "name": "人工智能",
          "importance": 0.8,
          "description": "人工智能是计算机科学的一个分支",
          "occurrenceCount": 5
        }
      ],
      "edges": [
        {
          "id": "relation-123",
          "sourceId": "concept-123",
          "targetId": "concept-456",
          "relationType": "is-a",
          "strength": 0.9,
          "occurrenceCount": 3
        }
      ],
      "layout": "force-directed",
      "metadata": {
        "totalNodes": 5,
        "totalEdges": 3,
        "generatedAt": "2023-10-05T20:15:00.000Z"
      }
    },
    "meta": {
      "requestId": "uuid-1234-5678",
      "pagination": {
        "page": 1,
        "limit": 50,
        "totalNodes": 120,
        "totalEdges": 80,
        "hasNextPage": true,
        "nextPage": 2,
        "prevPage": null,
        "totalPages": 3
      }
    }
  }
  ```

### 4.16 APNs模块

#### 4.16.1 注册设备令牌
- **请求**：POST /api/v1/apns/tokens
- **参数**：
  - `deviceToken`：设备令牌
  - `bundleId`：应用Bundle ID
  - `deviceType`：设备类型
  - `deviceName`：设备名称
  - `osVersion`：操作系统版本
- **响应**：
  ```json
  {
    "data": {
      "id": "token-123",
      "userId": "user-123",
      "deviceToken": "abc123def456...",
      "bundleId": "com.example.ai-cognitive-assistant",
      "deviceType": "iphone",
      "deviceName": "My iPhone",
      "osVersion": "16.1",
      "isActive": true,
      "createdAt": "2023-10-05T19:45:00.000Z",
      "updatedAt": "2023-10-05T19:45:00.000Z"
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

#### 4.16.2 获取用户设备令牌列表
- **请求**：GET /api/v1/apns/tokens
- **参数**：
  - `isActive`: 可选，按是否活跃过滤
  - `deviceType`: 可选，按设备类型过滤
- **响应**：
  ```json
  {
    "items": [
      {
        "id": "token-123",
        "deviceToken": "abc123def456...",
        "bundleId": "com.example.ai-cognitive-assistant",
        "deviceType": "iphone",
        "deviceName": "My iPhone",
        "osVersion": "16.1",
        "isActive": true,
        "createdAt": "2023-10-05T19:45:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "requestId": "uuid-1234-5678"
    }
  }
  ```

## 5. WebSocket集成

### 5.1 WebSocket URL
- **开发环境**：`ws://localhost:3000/ws`
- **测试环境**：`wss://test-api.example.com/ws`
- **生产环境**：`wss://api.example.com/ws`

### 5.2 连接管理
- **自动重连**：实现WebSocket自动重连机制，重连间隔指数退避
- **心跳机制**：定期发送心跳包（每30秒），保持连接活跃
- **连接状态监控**：监控WebSocket连接状态，及时处理连接异常
- **认证机制**：连接建立后立即发送认证令牌

### 5.3 事件类型

#### 5.3.1 WebSocket事件枚举
```typescript
export enum WebSocketEvent {
  // 客户端发送事件
  AUTH = 'auth',
  PING = 'ping',
  SUBSCRIBE_MODEL = 'subscribe_model',
  UNSUBSCRIBE_MODEL = 'unsubscribe_model',
  
  // 服务端推送事件
  CONNECTION_ESTABLISHED = 'connection_established',
  SUBSCRIPTION_CONFIRMED = 'subscription_confirmed',
  UNSUBSCRIPTION_CONFIRMED = 'unsubscription_confirmed',
  MODEL_UPDATED = 'model_updated',
  VISUALIZATION_UPDATED = 'visualization_updated',
  AI_TASK_COMPLETED = 'ai_task_completed',
  PONG = 'pong'
}
```

#### 5.3.2 客户端发送事件

##### 5.3.2.1 认证事件
- **事件类型**：`auth`
- **用途**：建立WebSocket连接后进行认证
- **数据格式**：
  ```json
  {
    "event": "auth",
    "data": {
      "token": "JWT Token"
    }
  }
  ```

##### 5.3.2.2 心跳事件
- **事件类型**：`ping`
- **用途**：保持WebSocket连接活跃
- **数据格式**：
  ```json
  {
    "event": "ping"
  }
  ```

##### 5.3.2.3 订阅模型事件
- **事件类型**：`subscribe_model`
- **用途**：订阅特定认知模型的实时更新
- **数据格式**：
  ```json
  {
    "event": "subscribe_model",
    "data": {
      "modelId": "model-123"
    }
  }
  ```

##### 5.3.2.4 取消订阅模型事件
- **事件类型**：`unsubscribe_model`
- **用途**：取消订阅特定认知模型的实时更新
- **数据格式**：
  ```json
  {
    "event": "unsubscribe_model",
    "data": {
      "modelId": "model-123"
    }
  }
  ```

#### 5.3.3 服务端推送事件

##### 5.3.3.1 连接建立事件
- **事件类型**：`connection_established`
- **用途**：通知客户端WebSocket连接已建立
- **数据格式**：
  ```json
  {
    "event": "connection_established",
    "data": {
      "message": "WebSocket connection established",
      "connectionId": "conn-123"
    }
  }
  ```

##### 5.3.3.2 订阅确认事件
- **事件类型**：`subscription_confirmed`
- **用途**：确认客户端成功订阅了特定模型
- **数据格式**：
  ```json
  {
    "event": "subscription_confirmed",
    "data": {
      "modelId": "model-123",
      "message": "Successfully subscribed to model updates"
    }
  }
  ```

##### 5.3.3.3 取消订阅确认事件
- **事件类型**：`unsubscription_confirmed`
- **用途**：确认客户端成功取消订阅了特定模型
- **数据格式**：
  ```json
  {
    "event": "unsubscription_confirmed",
    "data": {
      "modelId": "model-123",
      "message": "Successfully unsubscribed from model updates"
    }
  }
  ```

##### 5.3.3.4 认知模型更新事件
- **事件类型**：`model_updated`
- **用途**：通知客户端认知模型已更新
- **数据格式**：
  ```json
  {
    "event": "model_updated",
    "data": {
      "modelId": "model-123",
      "updates": {
        "conceptCount": 10,
        "relationCount": 8,
        "lastUpdatedAt": "2023-10-05T20:00:00.000Z"
      }
    }
  }
  ```

##### 5.3.3.5 可视化更新事件
- **事件类型**：`visualization_updated`
- **用途**：通知客户端可视化数据已更新
- **数据格式**：
  ```json
  {
    "event": "visualization_updated",
    "data": {
      "modelId": "model-123",
      "visualizationType": "concept-map",
      "data": {
        "nodes": [/* 节点数据 */],
        "edges": [/* 边数据 */]
      }
    }
  }
  ```

##### 5.3.3.6 AI任务完成事件
- **事件类型**：`ai_task_completed`
- **用途**：通知客户端AI任务已完成
- **数据格式**：
  ```json
  {
    "event": "ai_task_completed",
    "data": {
      "taskId": "task-123",
      "modelId": "model-123",
      "result": {
        "analysis": {/* 分析结果 */}
      }
    }
  }
  ```

##### 5.3.3.7 心跳响应事件
- **事件类型**：`pong`
- **用途**：响应客户端心跳请求
- **数据格式**：
  ```json
  {
    "event": "pong"
  }
  ```

### 5.4 WebSocket消息格式

#### 5.4.1 消息结构
```typescript
export interface WebSocketMessage {
  event: WebSocketEvent;
  data?: any;
  timestamp?: string;
}
```

#### 5.4.2 错误处理
- **认证失败**：服务端返回认证失败消息，客户端需要重新认证
- **订阅失败**：服务端返回订阅失败消息，客户端需要处理失败原因
- **连接断开**：客户端自动重连，重连次数有限制

### 5.5 WebSocket连接流程

1. **建立连接**：客户端连接到WebSocket服务器
2. **发送认证**：客户端发送认证令牌
3. **认证响应**：服务端验证令牌，返回连接建立事件
4. **订阅模型**：客户端订阅感兴趣的认知模型
5. **接收更新**：客户端接收服务端推送的模型更新、可视化更新等事件
6. **保持连接**：客户端定期发送心跳，服务端返回pong响应
7. **断开连接**：客户端或服务端断开连接，客户端尝试自动重连

## 6. 错误处理

### 6.1 错误码规范

| 错误码 | 含义 | HTTP状态码 |
|--------|------|------------|
| INVALID_REQUEST | 请求参数无效 | 400 |
| UNAUTHORIZED | 未认证 | 401 |
| FORBIDDEN | 无权限 | 403 |
| NOT_FOUND | 资源不存在 | 404 |
| METHOD_NOT_ALLOWED | 请求方法不允许 | 405 |
| CONFLICT | 资源冲突 | 409 |
| INTERNAL_SERVER_ERROR | 服务器内部错误 | 500 |
| SERVICE_UNAVAILABLE | 服务不可用 | 503 |

### 6.2 客户端错误处理
- 统一处理API错误
- 向用户显示友好的错误信息
- 记录错误日志，便于调试
- 实现重试机制，处理临时网络错误

## 7. 性能优化

### 7.1 请求优化
- **请求合并**：减少不必要的API请求
- **缓存策略**：合理使用缓存，减少重复请求
- **分页加载**：对大量数据使用分页加载
- **延迟加载**：按需加载数据，提高初始加载速度

### 7.2 响应优化
- **压缩数据**：使用gzip压缩响应数据
- **精简响应**：只返回必要的数据字段
- **合理的响应时间**：API响应时间应控制在2秒以内

## 8. 安全考虑

### 8.1 数据安全
- **传输加密**：使用HTTPS加密传输数据
- **敏感数据加密**：敏感数据在传输和存储时进行加密
- **输入验证**：对所有用户输入进行验证，防止注入攻击

### 8.2 防止滥用
- **请求限流**：实现API请求限流，防止滥用
- **验证码**：对敏感操作使用验证码
- **日志监控**：监控异常请求，及时发现滥用行为

## 9. 测试与调试

### 9.1 API测试工具
- **Postman**：用于手动测试API
- **Swagger/OpenAPI**：用于API文档和自动测试
- **Mock Server**：用于模拟API响应，便于前端开发

### 9.2 调试技巧
- 使用Xcode的Network Inspector调试网络请求
- 记录详细的请求和响应日志
- 使用Charles或Wireshark进行网络抓包

## 10. API版本管理

### 10.1 版本控制策略

- **API版本号**：使用`/api/v1/`前缀标识API版本
- **版本更新策略**：
  - 向后兼容的变更：在当前版本内更新
  - 不兼容的变更：创建新的API版本（如`/api/v2/`）
- **版本支持**：至少支持当前版本和前一个版本
- **版本弃用**：提前6个月通知版本弃用，确保平滑过渡

### 10.2 版本迁移指南

- 提供详细的版本迁移文档，包括变更内容和迁移步骤
- 实现版本转换中间件，帮助用户平滑迁移
- 监控不同版本的API使用情况，合理规划版本生命周期

## 11. 错误处理详细说明

### 11.1 常见错误类型

| 错误码 | 含义 | HTTP状态码 | 处理建议 |
|--------|------|------------|----------|
| INVALID_REQUEST | 请求参数无效 | 400 | 检查请求参数格式和必填字段 |
| UNAUTHORIZED | 未认证或认证过期 | 401 | 重新登录或刷新令牌 |
| FORBIDDEN | 无权限访问资源 | 403 | 检查用户权限或联系管理员 |
| NOT_FOUND | 资源不存在 | 404 | 检查资源ID是否正确 |
| METHOD_NOT_ALLOWED | 请求方法不允许 | 405 | 检查HTTP方法是否正确 |
| CONFLICT | 资源冲突 | 409 | 检查资源是否已存在或已被修改 |
| INTERNAL_SERVER_ERROR | 服务器内部错误 | 500 | 记录错误日志，联系后端团队 |
| SERVICE_UNAVAILABLE | 服务不可用 | 503 | 稍后重试或检查服务状态 |

### 11.2 错误处理最佳实践

- **统一错误处理**：实现全局错误处理中间件，统一处理API错误
- **友好错误信息**：向用户展示友好的错误信息，避免技术术语
- **错误日志记录**：详细记录错误信息，包括请求参数、时间、错误码等
- **重试机制**：对临时性错误（如503）实现自动重试机制
- **错误监控**：集成错误监控工具，实时监控API错误情况

### 11.3 错误处理代码示例

```swift
// 全局错误处理示例
class APIClient {
    func send<T: Decodable>(_ request: APIRequest) async throws -> T {
        // 构建URLRequest
        var urlRequest = URLRequest(url: request.url)
        urlRequest.httpMethod = request.method.rawValue
        
        // 设置请求头
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // 发送请求
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        
        // 处理响应
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        // 检查状态码
        switch httpResponse.statusCode {
        case 200...299:
            // 成功响应
            let decoder = JSONDecoder()
            return try decoder.decode(T.self, from: data)
        case 400:
            throw APIError.invalidRequest
        case 401:
            throw APIError.unauthorized
        case 403:
            throw APIError.forbidden
        case 404:
            throw APIError.notFound
        case 500:
            throw APIError.internalServerError
        case 503:
            throw APIError.serviceUnavailable
        default:
            throw APIError.unknown(httpResponse.statusCode)
        }
    }
}

// API错误枚举
enum APIError: Error, LocalizedError {
    case invalidResponse
    case invalidRequest
    case unauthorized
    case forbidden
    case notFound
    case internalServerError
    case serviceUnavailable
    case unknown(Int)
    
    var localizedDescription: String {
        switch self {
        case .invalidResponse:
            return "无效的响应格式"
        case .invalidRequest:
            return "请求参数无效，请检查输入"
        case .unauthorized:
            return "登录已过期，请重新登录"
        case .forbidden:
            return "无权限访问该资源"
        case .notFound:
            return "请求的资源不存在"
        case .internalServerError:
            return "服务器内部错误，请稍后重试"
        case .serviceUnavailable:
            return "服务暂时不可用，请稍后重试"
        case .unknown(let code):
            return "请求失败，错误码：\(code)"
        }
    }
}
```

## 12. API测试用例示例

### 12.1 认证API测试用例

#### 12.1.1 登录API测试

**测试用例1：正常登录**
- **测试目标**：验证正确的用户名和密码能成功登录
- **请求**：
  ```http
  POST /api/v1/sessions
  Content-Type: application/json
  
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **预期响应**：
  ```json
  {
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "123",
        "name": "Test User",
        "email": "test@example.com"
      }
    },
    "meta": {
      "requestId": "uuid-1234-5678"
    }
  }
  ```

**测试用例2：无效密码登录**
- **测试目标**：验证无效密码返回正确的错误信息
- **请求**：
  ```http
  POST /api/v1/sessions
  Content-Type: application/json
  
  {
    "email": "test@example.com",
    "password": "wrongpassword"
  }
  ```
- **预期响应**：
  ```json
  {
    "error": {
      "code": "INVALID_REQUEST",
      "message": "邮箱或密码错误",
      "details": [],
      "requestId": "uuid-1234-5679",
      "timestamp": "2023-10-01T12:00:00.000Z"
    }
  }
  ```

### 12.2 认知模型API测试用例

#### 12.2.1 创建认知模型测试

**测试用例1：正常创建**
- **测试目标**：验证能成功创建认知模型
- **请求**：
  ```http
  POST /api/v1/models
  Content-Type: application/json
  Authorization: Bearer <token>
  
  {
    "modelName": "测试模型",
    "isPrimary": false
  }
  ```
- **预期响应**：201 Created，返回创建的模型信息

**测试用例2：未授权创建**
- **测试目标**：验证未授权不能创建模型
- **请求**：
  ```http
  POST /api/v1/models
  Content-Type: application/json
  
  {
    "modelName": "测试模型",
    "isPrimary": false
  }
  ```
- **预期响应**：401 Unauthorized

## 13. 相关文档

- [API文档](api-documentation.md) - 前后端API契约文档
- [WebSocket集成](websocket-integration.md) - WebSocket集成设计
