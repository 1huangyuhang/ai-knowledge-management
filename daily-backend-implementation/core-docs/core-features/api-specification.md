# API规范文档

索引标签：#API设计 #API规范 #RESTful #认证 #错误处理

## 相关文档

- [API设计](api-design.md)：详细描述API的设计原则和理念
- [表示层设计](../layered-design/presentation-layer-design.md)：详细描述表示层的设计和实现
- [安全策略](security-strategy.md)：详细描述API的安全策略
- [API使用示例](../dev-support/api-usage-examples.md)：提供API的使用示例和代码片段

## 1. 文档概述

本文档详细定义了认知辅助系统的所有API接口，包括请求/响应格式、参数说明、错误码等。系统采用RESTful API设计风格，使用JSON格式进行数据交换。

## 2. 基础信息

### 2.1  API版本
- 当前版本：v1
- 版本控制：通过URL路径中的版本号进行控制，例如：`/api/v1/files`

### 2.2  基础URL
- 开发环境：`http://localhost:3000/api/v1`
- 生产环境：`https://api.cognitive-assistant.example.com/api/v1`

### 2.3  认证方式
- 采用JWT认证，通过`Authorization`头传递token
- 格式：`Authorization: Bearer <token>`

### 2.4  响应格式

所有API响应遵循统一格式：

```json
{
  "data": {},               // 响应数据（成功时返回）
  "meta": {                 // 元数据
    "requestId": "uuid-1234-5678", // 请求ID
    "code": 200,            // 状态码
    "message": "Success"    // 状态消息
  }
}

错误响应格式：

```json
{
  "data": null,
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 400,
    "message": "Bad Request",
    "error": {
      "code": "INVALID_REQUEST", // 错误码
      "message": "请求参数无效",    // 错误消息
      "details": []              // 详细错误信息
    }
  }
}
```

## 3. 核心API接口

### 3.1 认证模块

#### 3.1.1 用户注册

**接口路径**：`/api/v1/users`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：不需要认证

**请求参数**：
| 参数名 | 类型 | 位置 | 必填 | 描述 |
|--------|------|------|------|------|
| `username` | string | Body | 是 | 用户名 |
| `email` | string | Body | 是 | 邮箱地址 |
| `password` | string | Body | 是 | 密码 |

**响应示例**：
```json
{
  "data": {
    "id": "user-123",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2023-10-01T12:00:00Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 201,
    "message": "User registered successfully"
  }
}
```

#### 3.1.2 用户登录

**接口路径**：`/api/v1/sessions`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：不需要认证

**请求参数**：
| 参数名 | 类型 | 位置 | 必填 | 描述 |
|--------|------|------|------|------|
| `email` | string | Body | 是 | 邮箱地址 |
| `password` | string | Body | 是 | 密码 |

**响应示例**：
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "user-123",
      "username": "testuser",
      "email": "test@example.com"
    }
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Login successful"
  }
}
```

#### 3.1.3 刷新令牌

**接口路径**：`/api/v1/tokens/refresh`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证（使用refreshToken）

**请求体**：
```json
{
  "refreshToken": "string"
}
```

**响应示例**：
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Token refreshed successfully"
  }
}
```

#### 3.1.4 Sign in with Apple - 获取认证URL

**接口路径**：`/api/v1/auth/apple/url`
**请求方法**：`GET`
**认证要求**：不需要认证

**请求参数**：
| 参数名 | 类型 | 位置 | 必填 | 描述 |
|--------|------|------|------|------|
| `redirectUri` | string | Query | 否 | 重定向URI，默认使用配置的重定向URI |

**响应示例**：
```json
{
  "data": {
    "authorizationUrl": "https://appleid.apple.com/auth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=email%20name&state=...",
    "state": "random-state-value"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Authorization URL generated successfully"
  }
}
```

#### 3.1.5 Sign in with Apple - 回调处理

**接口路径**：`/api/v1/auth/apple/callback`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：不需要认证

**请求参数**：
| 参数名 | 类型 | 位置 | 必填 | 描述 |
|--------|------|------|------|------|
| `code` | string | Body | 是 | Apple授权码 |
| `state` | string | Body | 是 | 随机状态值 |

**响应示例**：
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
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Apple authentication successful"
  }
}
```

### 3.2 文件处理模块

#### 3.2.1 上传文件

**接口路径**：`/api/v1/files/upload`
**请求方法**：`POST`
**请求内容类型**：`multipart/form-data`
**认证要求**：需要认证

**请求参数**：
| 参数名 | 类型 | 位置 | 必填 | 描述 |
|--------|------|------|------|------|
| `file` | 文件 | FormData | 是 | 要上传的文件 |
| `type` | string | FormData | 否 | 文件类型（自动检测，可选值：document, image, audio） |
| `tags` | string | FormData | 否 | 文件标签，逗号分隔 |

**响应示例**：
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
    "code": 200,
    "message": "File uploaded successfully"
  }
}
```

#### 3.2.2 获取文件列表

**接口路径**：`/api/v1/files`
**请求方法**：`GET`
**认证要求**：需要认证

**查询参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `type` | string | 否 | 文件类型筛选 |
| `status` | string | 否 | 文件状态筛选 |
| `page` | number | 否 | 页码，默认1 |
| `limit` | number | 否 | 每页数量，默认10 |

**响应示例**：
```json
{
  "data": {
    "files": [
      {
        "fileId": "f123456789",
        "name": "example.pdf",
        "type": "document",
        "size": 102400,
        "uploadDate": "2024-01-08T12:00:00Z",
        "status": "processed"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Success"
  }
}
```

#### 3.2.3 获取文件详情

**接口路径**：`/api/v1/files/{fileId}`
**请求方法**：`GET`
**认证要求**：需要认证

**路径参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `fileId` | string | 是 | 文件ID |

**响应示例**：
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
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Success"
  }
}
```

### 3.3 语音处理模块

#### 3.3.1 上传语音文件

**接口路径**：`/api/v1/speech/audio`
**请求方法**：`POST`
**请求内容类型**：`multipart/form-data`
**认证要求**：需要认证

**请求参数**：
| 参数名 | 类型 | 位置 | 必填 | 描述 |
|--------|------|------|------|------|
| `audio` | 文件 | FormData | 是 | 语音文件，支持mp3、wav等格式 |
| `language` | string | FormData | 否 | 语言代码，默认auto |

**响应示例**：
```json
{
  "data": {
    "audioId": "a123456789",
    "name": "recording.mp3",
    "duration": 120,
    "uploadDate": "2024-01-08T12:00:00Z",
    "status": "pending"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Audio uploaded successfully"
  }
}
```

#### 3.3.2 语音转文字

**接口路径**：`/api/v1/speech/transcriptions`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "audio": "string",
  "language": "string"
}
```

**响应示例**：
```json
{
  "data": {
    "text": "这是语音转文字的结果...",
    "segments": [
      {
        "text": "这是第一段",
        "start": 0.0,
        "end": 5.0
      },
      {
        "text": "这是第二段",
        "start": 5.1,
        "end": 10.0
      }
    ]
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Speech transcribed successfully"
  }
}
```

#### 3.3.3 文本转语音

**接口路径**：`/api/v1/speech/syntheses`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "text": "string",
  "voice": "string"
}
```

**响应示例**：
```json
{
  "data": {
    "audio": "string"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Text synthesized to speech successfully"
  }
}
```

### 3.4 AI调度模块

#### 3.4.1 创建AI任务

**接口路径**：`/api/v1/ai-tasks`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "type": "cognitive_analysis",  // 任务类型
  "inputType": "file",           // 输入类型：file, speech, text
  "inputId": "f123456789",       // 输入ID
  "priority": "medium",          // 优先级：low, medium, high
  "params": {                     // 任务参数（根据任务类型不同而不同）
    "analysisDepth": "deep"
  }
}
```

**响应示例**：
```json
{
  "data": {
    "taskId": "t123456789",
    "type": "cognitive_analysis",
    "status": "pending",
    "priority": "medium",
    "createdAt": "2024-01-08T12:00:00Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 201,
    "message": "AI task created successfully"
  }
}
```

#### 3.4.2 获取任务状态

**接口路径**：`/api/v1/ai-tasks/{taskId}`
**请求方法**：`GET`
**认证要求**：需要认证

**路径参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `taskId` | string | 是 | 任务ID |

**响应示例**：
```json
{
  "data": {
    "taskId": "t123456789",
    "type": "cognitive_analysis",
    "status": "completed",
    "priority": "medium",
    "createdAt": "2024-01-08T12:00:00Z",
    "startedAt": "2024-01-08T12:00:30Z",
    "completedAt": "2024-01-08T12:05:00Z",
    "result": {
      "insights": [
        "这是一个关键洞察..."
      ],
      "concepts": ["概念1", "概念2"]
    }
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Success"
  }
}
```

#### 3.4.3 获取任务列表

**接口路径**：`/api/v1/ai-tasks`
**请求方法**：`GET`
**认证要求**：需要认证

**查询参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `status` | string | 否 | 任务状态筛选：pending, running, completed, failed |
| `type` | string | 否 | 任务类型筛选 |
| `page` | number | 否 | 页码，默认1 |
| `limit` | number | 否 | 每页数量，默认10 |

**响应示例**：
```json
{
  "data": {
    "tasks": [
      {
        "taskId": "t123456789",
        "type": "cognitive_analysis",
        "status": "completed",
        "createdAt": "2024-01-08T12:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Success"
  }
}
```

### 3.5 输入整合模块

#### 3.5.1 提交文本输入

**接口路径**：`/api/v1/input/text`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "text": "这是一段文本输入...",
  "type": "thought",           // 输入类型：thought, question, feedback
  "tags": ["tag1", "tag2"]   // 标签
}
```

**响应示例**：
```json
{
  "data": {
    "inputId": "i123456789",
    "type": "thought",
    "status": "processed",
    "createdAt": "2024-01-08T12:00:00Z",
    "taskId": "t123456789"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 201,
    "message": "Text input submitted successfully"
  }
}
```

#### 3.5.2 获取输入列表

**接口路径**：`/api/v1/input`
**请求方法**：`GET`
**认证要求**：需要认证

**查询参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `type` | string | 否 | 输入类型筛选 |
| `status` | string | 否 | 状态筛选 |
| `page` | number | 否 | 页码，默认1 |
| `limit` | number | 否 | 每页数量，默认10 |

**响应示例**：
```json
{
  "data": {
    "inputs": [
      {
        "inputId": "i123456789",
        "type": "thought",
        "status": "processed",
        "createdAt": "2024-01-08T12:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Success"
  }
}
```

### 3.6 推送通知模块

#### 3.6.1 注册设备令牌

**接口路径**：`/api/v1/notifications/register`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "deviceToken": "device-token-123",
  "deviceType": "ios",
  "deviceName": "iPhone 14",
  "appVersion": "1.0.0"
}
```

**响应示例**：
```json
{
  "data": {
    "deviceId": "dev-123456789",
    "deviceToken": "device-token-123",
    "registeredAt": "2024-01-08T12:00:00Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 201,
    "message": "Device token registered successfully"
  }
}
```

#### 3.6.2 取消注册设备令牌

**接口路径**：`/api/v1/notifications/unregister`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "deviceToken": "device-token-123"
}
```

**响应示例**：
```json
{
  "data": {
    "success": true
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Device token unregistered successfully"
  }
}
```

#### 3.6.3 发送测试推送通知

**接口路径**：`/api/v1/notifications/test`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "title": "测试通知",
  "body": "这是一条测试推送通知",
  "data": {
    "type": "test",
    "payload": {}
  }
}
```

**响应示例**：
```json
{
  "data": {
    "notificationId": "notif-123456789",
    "status": "sent"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Test notification sent successfully"
  }
}
```

### 3.7 iOS特定功能模块

#### 3.7.1 获取iOS设备配置

**接口路径**：`/api/v1/ios/config`
**请求方法**：`GET`
**认证要求**：需要认证

**响应示例**：
```json
{
  "data": {
    "pushEnabled": true,
    "backgroundRefreshEnabled": true,
    "icloudSyncEnabled": true,
    "appVersion": "1.0.0",
    "minimumOsVersion": "15.0"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "iOS config retrieved successfully"
  }
}
```

#### 3.7.2 注册iOS设备信息

**接口路径**：`/api/v1/ios/device/register`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "deviceId": "ios-device-123",
  "deviceName": "iPhone 14",
  "osVersion": "17.0",
  "appVersion": "1.0.0",
  "screenSize": "1179x2556",
  "locale": "zh-CN"
}
```

**响应示例**：
```json
{
  "data": {
    "deviceId": "ios-device-123",
    "registeredAt": "2024-01-08T12:00:00Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 201,
    "message": "iOS device registered successfully"
  }
}
```

#### 3.7.3 获取iOS特定功能状态

**接口路径**：`/api/v1/ios/features/status`
**请求方法**：`GET`
**认证要求**：需要认证

**响应示例**：
```json
{
  "data": {
    "appleSignInEnabled": true,
    "widgetEnabled": true,
    "siriIntegrationEnabled": false,
    "quickActionsEnabled": true
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "iOS features status retrieved successfully"
  }
}
```

### 3.8 用户模块

#### 3.8.1 获取当前用户信息

**接口路径**：`/api/v1/users/me`
**请求方法**：`GET`
**认证要求**：需要认证

**响应示例**：
```json
{
  "data": {
    "id": "user-123",
    "username": "testuser",
    "email": "test@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2023-10-01T12:00:00Z",
    "updatedAt": "2023-10-05T15:30:00Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "User info retrieved successfully"
  }
}
```

#### 3.8.2 更新用户信息

**接口路径**：`/api/v1/users/me`
**请求方法**：`PUT`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "username": "newusername",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**响应示例**：
```json
{
  "data": {
    "id": "user-123",
    "username": "newusername",
    "email": "test@example.com",
    "avatar": "https://example.com/new-avatar.jpg",
    "updatedAt": "2023-10-06T10:00:00Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "User info updated successfully"
  }
}
```

### 3.9 思想片段模块

#### 3.9.1 创建思想片段

**接口路径**：`/api/v1/thoughts`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "content": "这是一个思想片段...",
  "tags": ["tag1", "tag2"],
  "modelId": "model-123"
}
```

**响应示例**：
```json
{
  "data": {
    "id": "thought-123",
    "content": "这是一个思想片段...",
    "tags": ["tag1", "tag2"],
    "modelId": "model-123",
    "createdAt": "2023-10-05T15:30:00Z",
    "updatedAt": "2023-10-05T15:30:00Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 201,
    "message": "Thought fragment created successfully"
  }
}
```

#### 3.9.2 获取思想片段列表

**接口路径**：`/api/v1/thoughts`
**请求方法**：`GET`
**认证要求**：需要认证

**查询参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `modelId` | string | 否 | 认知模型ID |
| `tags` | string | 否 | 标签筛选，逗号分隔 |
| `page` | number | 否 | 页码，默认1 |
| `limit` | number | 否 | 每页数量，默认10 |

**响应示例**：
```json
{
  "data": {
    "items": [
      {
        "id": "thought-123",
        "content": "这是一个思想片段...",
        "tags": ["tag1", "tag2"],
        "modelId": "model-123",
        "createdAt": "2023-10-05T15:30:00Z",
        "updatedAt": "2023-10-05T15:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Thought fragments retrieved successfully"
  }
}
```

## 4. 认知模型模块

### 4.1 获取用户的所有认知模型

**接口路径**：`/api/v1/models`
**请求方法**：`GET`
**认证要求**：需要认证

**响应示例**：
```json
{
  "data": {
    "items": [
      {
        "id": "model-123",
        "modelName": "我的认知模型",
        "isPrimary": false,
        "healthScore": 100.0,
        "conceptCount": 0,
        "relationCount": 0,
        "createdAt": "2023-10-05T15:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Cognitive models retrieved successfully"
  }
}
```

### 4.2 获取认知模型详情

**接口路径**：`/api/v1/models/{modelId}`
**请求方法**：`GET`
**认证要求**：需要认证

**响应示例**：
```json
{
  "data": {
    "id": "model-123",
    "userId": "user-123",
    "modelName": "我的认知模型",
    "isPrimary": false,
    "healthScore": 100.0,
    "conceptCount": 5,
    "relationCount": 3,
    "createdAt": "2023-10-05T15:30:00.000Z",
    "updatedAt": "2023-10-05T16:00:00.000Z",
    "lastAnalyzedAt": "2023-10-05T15:45:00.000Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Cognitive model retrieved successfully"
  }
}
```

### 4.3 获取认知洞察

**接口路径**：`/api/v1/models/{modelId}/insights`
**请求方法**：`GET`
**认证要求**：需要认证

**查询参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `type` | string | 否 | 洞察类型：gap, blindspot, connection |
| `limit` | number | 否 | 返回数量，默认10 |

**响应示例**：
```json
{
  "data": {
    "insights": [
      {
        "insightId": "in123456789",
        "type": "gap",
        "description": "发现了一个知识缺口...",
        "severity": "medium",
        "createdAt": "2024-01-08T12:00:00Z"
      }
    ]
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Success"
  }
}
```

## 5. 概念模块

### 5.1 获取认知模型的概念列表

**接口路径**：`/api/v1/models/{modelId}/concepts`
**请求方法**：`GET`
**认证要求**：需要认证

**查询参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `page` | number | 否 | 页码，默认1 |
| `limit` | number | 否 | 每页数量，默认20 |
| `filterByImportance` | number | 否 | 按重要性过滤，默认0 |
| `search` | string | 否 | 搜索关键词 |

**响应示例**：
```json
{
  "data": {
    "items": [
      {
        "id": "concept-123",
        "name": "人工智能",
        "importance": 0.8,
        "description": "人工智能是计算机科学的一个分支",
        "modelId": "model-123",
        "createdAt": "2023-10-05T15:30:00Z",
        "updatedAt": "2023-10-05T15:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Concepts retrieved successfully"
  }
}
```

### 5.2 创建新概念

**接口路径**：`/api/v1/models/{modelId}/concepts`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "name": "新概念",
  "description": "新概念的描述",
  "importance": 0.5,
  "tags": ["tag1", "tag2"]
}
```

**响应示例**：
```json
{
  "data": {
    "id": "concept-456",
    "name": "新概念",
    "importance": 0.5,
    "description": "新概念的描述",
    "tags": ["tag1", "tag2"],
    "modelId": "model-123",
    "createdAt": "2023-10-05T15:30:00Z",
    "updatedAt": "2023-10-05T15:30:00Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 201,
    "message": "Concept created successfully"
  }
}
```

## 6. 关系模块

### 6.1 获取认知模型的关系列表

**接口路径**：`/api/v1/models/{modelId}/relations`
**请求方法**：`GET`
**认证要求**：需要认证

**查询参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `page` | number | 否 | 页码，默认1 |
| `limit` | number | 否 | 每页数量，默认20 |
| `relationType` | string | 否 | 关系类型过滤 |

**响应示例**：
```json
{
  "data": {
    "items": [
      {
        "id": "relation-123",
        "sourceConceptId": "concept-123",
        "targetConceptId": "concept-456",
        "relationType": "is-a",
        "strength": 0.9,
        "description": "人工智能是计算机科学的一个分支",
        "modelId": "model-123",
        "createdAt": "2023-10-05T15:30:00Z",
        "updatedAt": "2023-10-05T15:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Relations retrieved successfully"
  }
}
```

### 6.2 创建新关系

**接口路径**：`/api/v1/models/{modelId}/relations`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**请求体**：
```json
{
  "sourceConceptId": "concept-123",
  "targetConceptId": "concept-456",
  "relationType": "is-a",
  "strength": 0.9,
  "description": "人工智能是计算机科学的一个分支"
}
```

**响应示例**：
```json
{
  "data": {
    "id": "relation-456",
    "sourceConceptId": "concept-123",
    "targetConceptId": "concept-456",
    "relationType": "is-a",
    "strength": 0.9,
    "description": "人工智能是计算机科学的一个分支",
    "modelId": "model-123",
    "createdAt": "2023-10-05T15:30:00Z",
    "updatedAt": "2023-10-05T15:30:00Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 201,
    "message": "Relation created successfully"
  }
}
```

## 7. 可视化模块

### 7.1 获取认知模型多维度分析结果

**接口路径**：`/api/v1/models/{modelId}/analyses`
**请求方法**：`GET`
**认证要求**：需要认证

**查询参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `visualizationType` | string | 否 | 可视化类型（concept-map/hierarchy/network/timeline/cluster），默认concept-map |
| `includeInsights` | boolean | 否 | 是否包含洞察，默认false |
| `depth` | number | 否 | 深度，默认3 |
| `conceptLimit` | number | 否 | 概念数量限制，默认50 |
| `page` | number | 否 | 页码，默认1 |
| `limit` | number | 否 | 每页大小，默认50 |
| `filterByImportance` | number | 否 | 按重要性过滤，默认0 |
| `includeRelations` | boolean | 否 | 是否包含关系，默认true |

**响应示例**：
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

### 7.2 触发思维类型分析

**接口路径**：`/api/v1/models/{modelId}/analyses/thinking-type`
**请求方法**：`POST`
**认证要求**：需要认证

**路径参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `modelId` | string | 是 | 认知模型ID |

**响应示例**：
```json
{
  "data": {
    "modelId": "string",
    "thinkingType": {
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
      "description": "您的认知模型显示出较强的分析性和逻辑性思维倾向，善于系统化思考和推理。"
    }
  },
  "meta": {
    "requestId": "string",
    "code": 200,
    "message": "Thinking type analysis retrieved successfully"
  }
}
```

### 7.3 获取概念图数据

**接口路径**：`/api/v1/models/{modelId}/analyses/concept-graph`
**请求方法**：`GET`
**认证要求**：需要认证

**查询参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `layout` | string | 否 | 布局类型（force-directed/hierarchical/circular/grid），默认force-directed |
| `filterByImportance` | number | 否 | 按重要性过滤，默认0 |
| `includeRelatedInsights` | boolean | 否 | 是否包含相关洞察，默认false |
| `page` | number | 否 | 页码，默认1 |
| `limit` | number | 否 | 每页大小，默认50 |
| `sortBy` | string | 否 | 排序字段（importance/occurrenceCount/name），默认importance |
| `sortOrder` | string | 否 | 排序顺序（asc/desc），默认desc |

**响应示例**：
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

## 6. 建议生成模块

### 6.1 获取个性化建议

**接口路径**：`/api/v1/suggestions`
**请求方法**：`GET`
**认证要求**：需要认证

**查询参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `category` | string | 否 | 建议类别：learning, connection, refinement |
| `limit` | number | 否 | 返回数量，默认5 |

**响应示例**：
```json
{
  "data": {
    "suggestions": [
      {
        "suggestionId": "s123456789",
        "category": "learning",
        "title": "建议标题",
        "description": "建议详细描述...",
        "priority": "high",
        "createdAt": "2024-01-08T12:00:00Z"
      }
    ]
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Success"
  }
}
```

### 6.2 反馈建议

**接口路径**：`/api/v1/suggestions/{suggestionId}/feedback`
**请求方法**：`POST`
**请求内容类型**：`application/json`
**认证要求**：需要认证

**路径参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `suggestionId` | string | 是 | 建议ID |

**请求体**：
```json
{
  "rating": 5,               // 评分：1-5
  "feedback": "很好的建议",  // 反馈内容
  "action": "accepted"      // 操作：accepted, rejected, implemented
}
```

**响应示例**：
```json
{
  "data": {
    "suggestionId": "s123456789",
    "feedbackId": "fb123456789",
    "rating": 5,
    "feedback": "很好的建议",
    "action": "accepted",
    "createdAt": "2024-01-08T12:00:00Z"
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 201,
    "message": "Feedback submitted successfully"
  }
}
```

## 7. 健康检查模块

### 7.1 服务健康检查

**接口路径**：`/api/v1/health`
**请求方法**：`GET`
**认证要求**：不需要认证

**响应示例**：
```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-08T12:00:00Z",
    "services": {
      "database": "connected",
      "redis": "connected",
      "aiService": "available",
      "websocket": "running"
    },
    "version": "1.0.0",
    "uptime": 3600
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Service is healthy"
  }
}
```

### 7.2 详细健康检查

**接口路径**：`/api/v1/health/details`
**请求方法**：`GET`
**认证要求**：不需要认证

**响应示例**：
```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-08T12:00:00Z",
    "services": {
      "database": {
        "status": "connected",
        "responseTime": 15,
        "connectionCount": 10
      },
      "redis": {
        "status": "connected",
        "responseTime": 2,
        "memoryUsage": "128MB"
      },
      "aiService": {
        "status": "available",
        "responseTime": 200,
        "queueSize": 0
      },
      "websocket": {
        "status": "running",
        "connectionCount": 50
      }
    },
    "version": "1.0.0",
    "uptime": 3600,
    "memoryUsage": {
      "heapTotal": "512MB",
      "heapUsed": "256MB",
      "rss": "1GB"
    },
    "cpuUsage": 0.1
  },
  "meta": {
    "requestId": "uuid-1234-5678",
    "code": 200,
    "message": "Service is healthy"
  }
}
```

## 8. 统一错误码定义

| 状态码 | 错误码 | 描述 |
|--------|--------|------|
| 400 | INVALID_REQUEST | 请求参数无效或格式错误 |
| 400 | MISSING_REQUIRED_FIELD | 缺少必需的请求字段 |
| 400 | INVALID_EMAIL_FORMAT | 电子邮件格式无效 |
| 400 | INVALID_PASSWORD | 密码不符合要求 |
| 400 | USERNAME_ALREADY_EXISTS | 用户名已存在 |
| 400 | EMAIL_ALREADY_EXISTS | 电子邮件已被注册 |
| 401 | UNAUTHORIZED | 未授权或认证失败 |
| 401 | INVALID_TOKEN | 无效的认证令牌 |
| 401 | EXPIRED_TOKEN | 认证令牌已过期 |
| 401 | INVALID_CREDENTIALS | 无效的用户名或密码 |
| 403 | FORBIDDEN | 禁止访问该资源 |
| 403 | PERMISSION_DENIED | 权限不足 |
| 404 | NOT_FOUND | 请求的资源不存在 |
| 404 | USER_NOT_FOUND | 用户不存在 |
| 404 | MODEL_NOT_FOUND | 认知模型不存在 |
| 404 | FILE_NOT_FOUND | 文件不存在 |
| 405 | METHOD_NOT_ALLOWED | 不允许使用该HTTP方法 |
| 409 | CONFLICT | 请求与当前资源状态冲突 |
| 429 | TOO_MANY_REQUESTS | 请求过于频繁，请稍后重试 |
| 500 | INTERNAL_SERVER_ERROR | 服务器内部错误 |
| 500 | DATABASE_ERROR | 数据库操作失败 |
| 500 | AI_SERVICE_ERROR | AI服务调用失败 |
| 500 | EXTERNAL_SERVICE_ERROR | 外部服务调用失败 |
| 503 | SERVICE_UNAVAILABLE | 服务暂时不可用 |
| 503 | MAINTENANCE_MODE | 服务正在维护中 |


## 9. API变更历史

| 版本 | 变更日期 | 变更内容 |
|------|----------|----------|
| v1.0 | 2024-01-08 | 初始版本发布 |

## 10. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2024-01-08 | 初始创建 | 系统架构师 |
