# API文档

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
- [API集成规范](api-integration-spec.md)

### 关联模块
- [API集成规范](api-integration-spec.md)
- [WebSocket集成设计](websocket-integration.md)

### 依赖关系
- [API集成规范](api-integration-spec.md)

## 1. 概述

本文档是AI Voice Interaction App前端与后端之间的API契约文档，详细定义了所有API的请求格式、响应格式、参数说明和错误码。

## 2. API版本控制

- **当前版本**：v1
- **版本策略**：通过URL路径进行版本控制，如 `/api/v1/resource`
- **向后兼容性**：确保API版本升级时保持向后兼容

## 3. 认证API

### 3.1 登录

**请求**
- 方法：POST
- URL：`/api/v1/sessions`
- 权限：无
- 请求体：
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "accessToken": "string",
      "refreshToken": "string",
      "user": {
        "id": "string",
        "username": "string",
        "email": "string",
        "avatar": "string"
      }
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Success"
    }
  }
  ```

**错误响应**
- 400 Bad Request：请求参数无效
- 401 Unauthorized：邮箱或密码错误

### 3.2 注册

**请求**
- 方法：POST
- URL：`/api/v1/users`
- 权限：无
- 请求体：
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```

**响应**
- 状态码：201 Created
- 响应体：
  ```json
  {
    "data": {
      "id": "string",
      "username": "string",
      "email": "string"
    },
    "meta": {
      "requestId": "string",
      "code": 201,
      "message": "User registered successfully"
    }
  }
  ```

**错误响应**
- 400 Bad Request：请求参数无效
- 409 Conflict：邮箱已被注册

### 3.3 刷新Token

**请求**
- 方法：POST
- URL：`/api/v1/tokens/refresh`
- 权限：无
- 请求体：
  ```json
  {
    "refreshToken": "string"
  }
  ```

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "accessToken": "string",
      "tokenType": "Bearer",
      "expiresIn": 3600
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Token refreshed successfully"
    }
  }
  ```

**错误响应**
- 400 Bad Request：请求参数无效
- 401 Unauthorized：RefreshToken无效或过期

## 4. 认知模型API

### 4.1 获取认知模型列表

**请求**
- 方法：GET
- URL：`/api/v1/models`
- 权限：已认证用户
- 查询参数：
  - `page`：页码，默认1
  - `limit`：每页数量，默认10
  - `name`：模型名称搜索

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "items": [
        {
          "id": "string",
          "modelName": "string",
          "isPrimary": false,
          "healthScore": 100.0,
          "conceptCount": 0,
          "relationCount": 0,
          "createdAt": "string",
          "updatedAt": "string"
        }
      ],
      "total": 0,
      "page": 0,
      "limit": 0
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Cognitive models retrieved successfully"
    }
  }
  ```

**错误响应**
- 401 Unauthorized：未认证
- 403 Forbidden：无权限

### 4.2 获取认知模型详情

**请求**
- 方法：GET
- URL：`/api/v1/models/{modelId}`
- 权限：已认证用户
- 路径参数：
  - `modelId`：认知模型ID

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "id": "string",
      "modelName": "string",
      "isPrimary": false,
      "healthScore": 100.0,
      "conceptCount": 5,
      "relationCount": 3,
      "createdAt": "string",
      "updatedAt": "string",
      "lastAnalyzedAt": "string"
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Cognitive model retrieved successfully"
    }
  }
  ```

**错误响应**
- 401 Unauthorized：未认证
- 403 Forbidden：无权限
- 404 Not Found：认知模型不存在

### 4.3 创建认知模型

**请求**
- 方法：POST
- URL：`/api/v1/models`
- 权限：已认证用户
- 请求体：
  ```json
  {
    "modelName": "string",
    "description": "string"
  }
  ```

**响应**
- 状态码：201 Created
- 响应体：
  ```json
  {
    "data": {
      "id": "string",
      "modelName": "string",
      "isPrimary": false,
      "healthScore": 100.0,
      "conceptCount": 0,
      "relationCount": 0,
      "createdAt": "string",
      "updatedAt": "string"
    },
    "meta": {
      "requestId": "string",
      "code": 201,
      "message": "Cognitive model created successfully"
    }
  }
  ```

**错误响应**
- 400 Bad Request：请求参数无效
- 401 Unauthorized：未认证

### 4.4 更新认知模型

**请求**
- 方法：PUT
- URL：`/api/v1/models/{modelId}`
- 权限：已认证用户
- 路径参数：
  - `modelId`：认知模型ID
- 请求体：
  ```json
  {
    "modelName": "string",
    "description": "string"
  }
  ```

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "id": "string",
      "modelName": "string",
      "isPrimary": false,
      "healthScore": 100.0,
      "conceptCount": 0,
      "relationCount": 0,
      "createdAt": "string",
      "updatedAt": "string"
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Cognitive model updated successfully"
    }
  }
  ```

**错误响应**
- 400 Bad Request：请求参数无效
- 401 Unauthorized：未认证
- 403 Forbidden：无权限
- 404 Not Found：认知模型不存在

### 4.5 删除认知模型

**请求**
- 方法：DELETE
- URL：`/api/v1/models/{modelId}`
- 权限：已认证用户
- 路径参数：
  - `modelId`：认知模型ID

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "success": true
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Cognitive model deleted successfully"
    }
  }
  ```

**错误响应**
- 401 Unauthorized：未认证
- 403 Forbidden：无权限
- 404 Not Found：认知模型不存在

## 5. 语音交互API

### 5.1 语音转文本

**请求**
- 方法：POST
- URL：`/api/v1/speech/transcriptions`
- 权限：已认证用户
- 请求体：
  ```json
  {
    "audio": "string",
    "language": "string"
  }
  ```

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "text": "string",
      "segments": [
        {
          "text": "string",
          "start": 0.0,
          "end": 5.0
        }
      ]
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Speech transcribed successfully"
    }
  }
  ```

**错误响应**
- 400 Bad Request：请求参数无效
- 401 Unauthorized：未认证
- 500 Internal Server Error：语音识别失败

### 5.2 文本转语音

**请求**
- 方法：POST
- URL：`/api/v1/speech/syntheses`
- 权限：已认证用户
- 请求体：
  ```json
  {
    "text": "string",
    "voice": "string"
  }
  ```

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "audio": "string"
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Text synthesized to speech successfully"
    }
  }
  ```

**错误响应**
- 400 Bad Request：请求参数无效
- 401 Unauthorized：未认证
- 500 Internal Server Error：语音合成失败

### 5.3 AI对话生成

**请求**
- 方法：POST
- URL：`/api/v1/ai-tasks`
- 权限：已认证用户
- 请求体：
  ```json
  {
    "type": "conversation",
    "inputType": "text",
    "inputId": "string",
    "priority": "medium",
    "params": {
      "input": "string",
      "context": "object",
      "modelId": "string"
    }
  }
  ```

**响应**
- 状态码：201 Created
- 响应体：
  ```json
  {
    "data": {
      "taskId": "string",
      "type": "conversation",
      "status": "pending",
      "priority": "medium",
      "createdAt": "string"
    },
    "meta": {
      "requestId": "string",
      "code": 201,
      "message": "AI task created successfully"
    }
  }
  ```

**错误响应**
- 400 Bad Request：请求参数无效
- 401 Unauthorized：未认证
- 404 Not Found：认知模型不存在
- 500 Internal Server Error：AI生成失败

## 6. 分析API

### 6.1 获取多维度分析结果

**请求**
- 方法：GET
- URL：`/api/v1/models/{modelId}/analyses`
- 权限：已认证用户
- 路径参数：
  - `modelId`：认知模型ID

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "modelId": "string",
      "visualizationType": "concept-map",
      "createdAt": "string",
      "thinkingType": {
        "modelId": "string",
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
        }
      },
      "statistics": {
        "modelId": "string",
        "conceptCount": 5,
        "relationCount": 3,
        "averageConceptImportance": 0.75,
        "averageRelationStrength": 0.8,
        "conceptGrowthRate": 0.2,
        "relationGrowthRate": 0.15,
        "modelHealthScore": 8.5
      }
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Visualization data retrieved successfully"
    }
  }
  ```

**错误响应**
- 401 Unauthorized：未认证
- 403 Forbidden：无权限
- 404 Not Found：认知模型不存在

### 6.2 触发思维类型分析

**请求**
- 方法：POST
- URL：`/api/v1/models/{modelId}/analyses/thinking-type`
- 权限：已认证用户
- 路径参数：
  - `modelId`：认知模型ID

**响应**
- 状态码：200 OK
- 响应体：
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

**错误响应**
- 401 Unauthorized：未认证
- 403 Forbidden：无权限
- 404 Not Found：认知模型不存在
- 500 Internal Server Error：分析失败

### 6.3 获取分析历史

**请求**
- 方法：GET
- URL：`/api/v1/ai-tasks?modelId={modelId}`
- 权限：已认证用户
- 路径参数：
  - `modelId`：认知模型ID
- 查询参数：
  - `page`：页码，默认1
  - `limit`：每页数量，默认10
  - `type`：任务类型过滤

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "tasks": [
        {
          "taskId": "string",
          "type": "cognitive_analysis",
          "status": "completed",
          "priority": "medium",
          "createdAt": "string",
          "startedAt": "string",
          "completedAt": "string",
          "result": {
            "insights": ["string"],
            "concepts": ["string"]
          }
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "AI tasks retrieved successfully"
    }
  }
  ```

**错误响应**
- 401 Unauthorized：未认证
- 403 Forbidden：无权限
- 404 Not Found：认知模型不存在

## 7. 个性化API

### 7.1 获取个性化配置

**请求**
- 方法：GET
- URL：`/api/v1/users/me/preferences`
- 权限：已认证用户

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "theme": "string",
      "fontSize": "string",
      "voiceSettings": {
        "language": "string",
        "voice": "string"
      },
      "notificationSettings": {
        "enabled": true,
        "frequency": "string"
      },
      "analysisPreferences": {
        "preferredDimensions": ["string"],
        "reportFormat": "string"
      }
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Preferences retrieved successfully"
    }
  }
  ```

**错误响应**
- 401 Unauthorized：未认证

### 7.2 更新个性化配置

**请求**
- 方法：PUT
- URL：`/api/v1/users/me/preferences`
- 权限：已认证用户
- 请求体：
  ```json
  {
    "theme": "string",
    "fontSize": "string",
    "voiceSettings": {
      "language": "string",
      "voice": "string"
    },
    "notificationSettings": {
      "enabled": true,
      "frequency": "string"
    },
    "analysisPreferences": {
      "preferredDimensions": ["string"],
      "reportFormat": "string"
    }
  }
  ```

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "theme": "string",
      "fontSize": "string",
      "voiceSettings": {
        "language": "string",
        "voice": "string"
      },
      "notificationSettings": {
        "enabled": true,
        "frequency": "string"
      },
      "analysisPreferences": {
        "preferredDimensions": ["string"],
        "reportFormat": "string"
      }
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Preferences updated successfully"
    }
  }
  ```

**错误响应**
- 400 Bad Request：请求参数无效
- 401 Unauthorized：未认证

### 7.3 恢复默认配置

**请求**
- 方法：DELETE
- URL：`/api/v1/users/me/preferences`
- 权限：已认证用户

**响应**
- 状态码：200 OK
- 响应体：
  ```json
  {
    "data": {
      "success": true
    },
    "meta": {
      "requestId": "string",
      "code": 200,
      "message": "Preferences reset to default"
    }
  }
  ```

**错误响应**
- 401 Unauthorized：未认证

## 8. WebSocket事件

### 8.1 连接认证

**事件类型**：`auth`
**发送方**：客户端
**数据**：
```json
{
  "token": "string"
}
```

### 8.2 心跳

**事件类型**：`ping`
**发送方**：客户端
**数据**：无

### 8.3 心跳响应

**事件类型**：`pong`
**发送方**：服务端
**数据**：无

### 8.4 认知模型更新

**事件类型**：`model_updated`
**发送方**：服务端
**数据**：
```json
{
  "modelId": "string",
  "updates": {
    "concepts": ["string"],
    "relations": ["string"]
  }
}
```

### 8.5 分析结果推送

**事件类型**：`ai_task_completed`
**发送方**：服务端
**数据**：
```json
{
  "taskId": "string",
  "type": "cognitive_analysis",
  "status": "completed",
  "modelId": "string",
  "result": {
    "insights": ["string"],
    "concepts": ["string"]
  }
}
```

## 9. 错误码

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

## 10. 相关文档

- [API集成规范](api-integration-spec.md) - 与后端API集成的规范
- [WebSocket集成](websocket-integration.md) - WebSocket集成设计
