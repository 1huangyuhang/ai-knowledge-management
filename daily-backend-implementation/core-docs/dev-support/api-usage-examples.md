# AI认知辅助系统 - API使用示例文档

索引标签：#API使用 #开发支持 #示例代码 #最佳实践 #错误处理

## 相关文档

- [API设计](../core-features/api-design.md)：API设计规范和实现
- [API规范](../core-features/api-specification.md)：详细的API规范文档
- [安全策略](../core-features/security-strategy.md)：API安全策略
- [表示层设计](../layered-design/presentation-layer-design.md)：表示层API设计
- [苹果认证设计](../core-features/apple-authentication.md)：Sign in with Apple设计

## 1. 文档概述

本文档提供了AI认知辅助系统API的详细使用示例，包括多种编程语言的调用示例和最佳实践。通过本文档，开发者可以快速掌握如何调用系统API，实现各种功能，同时了解API使用的最佳实践，避免常见的错误和问题。

## 2. 基础信息

### 2.1 认证方式

系统采用JWT认证，所有需要认证的API接口都需要在请求头中添加`Authorization`头，格式为：

```
Authorization: Bearer <token>
```

### 2.2 响应格式

所有API响应遵循统一格式：

#### 成功响应
```json
{
  "data": {},               // 响应数据（成功时返回）
  "meta": {
    "code": 200,              // 状态码
    "message": "Success"      // 状态消息
  }
}
```

#### 错误响应
```json
{
  "data": null,             // 响应数据为null（失败时返回）
  "meta": {
    "code": 400,              // 状态码
    "error": {
      "code": "ERROR_CODE",  // 错误码
      "message": "错误消息",    // 错误消息
      "details": []           // 错误详情
    }
  }
}
```

#### 列表响应
```json
{
  "data": [],               // 响应数据为数组（列表请求时返回）
  "meta": {
    "code": 200,              // 状态码
    "message": "Success",     // 状态消息
    "page": 1,                // 当前页码
    "limit": 10,              // 每页数量
    "total": 100              // 总数量
  }
}
```

### 2.3 错误处理

API调用可能返回以下常见错误状态码：

| 状态码 | 错误码 | 描述 |
|--------|--------|------|
| 400 | BAD_REQUEST | 请求参数错误 |
| 401 | UNAUTHORIZED | 未授权或认证失败 |
| 403 | FORBIDDEN | 禁止访问 |
| 404 | NOT_FOUND | 请求资源不存在 |
| 429 | TOO_MANY_REQUESTS | 请求过于频繁 |
| 500 | INTERNAL_SERVER_ERROR | 服务器内部错误 |

## 3. API调用示例

### 3.1 获取认证令牌

在调用需要认证的API之前，需要先获取认证令牌。以下是获取令牌的示例：

#### 3.1.1 使用curl

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

#### 3.1.2 使用JavaScript (Fetch API)

```javascript
async function login() {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  if (data.meta.error) {
    // 处理错误
    throw new Error(data.meta.error.message);
  } else {
    const token = data.data.token;
    // 保存令牌，用于后续API调用
    localStorage.setItem('token', token);
    return token;
  }
}
```

#### 3.1.3 使用Python (requests)

```python
import requests

url = 'http://localhost:3000/api/v1/auth/login'
headers = {
    'Content-Type': 'application/json'
}
data = {
    'email': 'user@example.com',
    'password': 'password123'
}

response = requests.post(url, headers=headers, json=data)
response_data = response.json()

if 'error' in response_data['meta'] and response_data['meta']['error']:
    print(f'登录失败: {response_data['meta']['error']['message']}')
else:
    token = response_data['data']['token']
    # 保存令牌，用于后续API调用
    print(f'获取到令牌: {token}')
```

### 3.2 文件处理模块

#### 3.2.1 上传文件

##### 使用curl

```bash
token="your-token-here"
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer $token" \
  -F "file=@/path/to/your/file.pdf" \
  -F "type=document" \
  -F "tags=tag1,tag2"
```

##### 使用JavaScript (Fetch API)

```javascript
async function uploadFile(file, type, tags) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  if (type) formData.append('type', type);
  if (tags) formData.append('tags', tags.join(','));
  
  const response = await fetch('http://localhost:3000/api/v1/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const result = await response.json();
  if (result.meta.error) {
    // 处理错误
    throw new Error(result.meta.error.message);
  }
  return result;
}

// 使用示例
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  try {
    const result = await uploadFile(file, 'document', ['tag1', 'tag2']);
    console.log('上传结果:', result);
  } catch (error) {
    console.error('上传失败:', error.message);
  }
});
```

##### 使用Python (requests)

```python
import requests

url = 'http://localhost:3000/api/v1/files/upload'
token = 'your-token-here'
headers = {
    'Authorization': f'Bearer {token}'
}
files = {
    'file': open('/path/to/your/file.pdf', 'rb')
}
data = {
    'type': 'document',
    'tags': 'tag1,tag2'
}

response = requests.post(url, headers=headers, files=files, data=data)
response_data = response.json()
print(response_data)
```

#### 3.2.2 获取文件列表

##### 使用curl

```bash
token="your-token-here"
curl -X GET "http://localhost:3000/api/v1/files?type=document&page=1&limit=10" \
  -H "Authorization: Bearer $token"
```

##### 使用JavaScript (Fetch API)

```javascript
async function getFiles(type, page = 1, limit = 10) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const response = await fetch(`http://localhost:3000/api/v1/files?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 使用示例
getFiles('document', 1, 10)
  .then(result => console.log('文件列表:', result))
  .catch(error => console.error('获取文件列表失败:', error));
```

### 3.3 文本输入模块

#### 3.3.1 提交文本输入

##### 使用curl

```bash
token="your-token-here"
curl -X POST http://localhost:3000/api/v1/input/text \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d '{"text": "这是一段测试文本", "type": "thought", "tags": ["tag1", "tag2"]}'
```

##### 使用JavaScript (Fetch API)

```javascript
async function submitTextInput(text, type = 'thought', tags = []) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/v1/input/text', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      type,
      tags
    })
  });
  
  return await response.json();
}

// 使用示例
submitTextInput('这是一段测试文本', 'thought', ['tag1', 'tag2'])
  .then(result => console.log('提交结果:', result))
  .catch(error => console.error('提交失败:', error));
```

##### 使用Python (requests)

```python
import requests

url = 'http://localhost:3000/api/v1/input/text'
token = 'your-token-here'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}
data = {
    'text': '这是一段测试文本',
    'type': 'thought',
    'tags': ['tag1', 'tag2']
}

response = requests.post(url, headers=headers, json=data)
response_data = response.json()
print(response_data)
```

### 3.4 认知模型模块

#### 3.4.1 获取用户认知模型

##### 使用curl

```bash
token="your-token-here"
curl -X GET http://localhost:3000/api/v1/cognitive-model \
  -H "Authorization: Bearer $token"
```

##### 使用JavaScript (Fetch API)

```javascript
async function getCognitiveModel() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/v1/cognitive-model', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 使用示例
getCognitiveModel()
  .then(result => console.log('认知模型:', result))
  .catch(error => console.error('获取认知模型失败:', error));
```

#### 3.4.2 获取认知洞察

##### 使用curl

```bash
token="your-token-here"
curl -X GET "http://localhost:3000/api/v1/cognitive-model/insights?type=gap&limit=5" \
  -H "Authorization: Bearer $token"
```

##### 使用JavaScript (Fetch API)

```javascript
async function getCognitiveInsights(type, limit = 10) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  params.append('limit', limit.toString());
  
  const response = await fetch(`http://localhost:3000/api/v1/cognitive-model/insights?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 使用示例
getCognitiveInsights('gap', 5)
  .then(result => console.log('认知洞察:', result))
  .catch(error => console.error('获取认知洞察失败:', error));
```

### 3.5 建议生成模块

#### 3.5.1 获取个性化建议

##### 使用curl

```bash
token="your-token-here"
curl -X GET "http://localhost:3000/api/v1/suggestions?category=learning&limit=5" \
  -H "Authorization: Bearer $token"
```

##### 使用JavaScript (Fetch API)

```javascript
async function getSuggestions(category, limit = 5) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  params.append('limit', limit.toString());
  
  const response = await fetch(`http://localhost:3000/api/v1/suggestions?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 使用示例
getSuggestions('learning', 5)
  .then(result => console.log('个性化建议:', result))
  .catch(error => console.error('获取个性化建议失败:', error));
```

#### 3.5.2 反馈建议

##### 使用curl

```bash
token="your-token-here"
suggestionId="your-suggestion-id"
curl -X POST http://localhost:3000/api/v1/suggestions/$suggestionId/feedback \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "feedback": "很好的建议", "action": "accepted"}'
```

##### 使用JavaScript (Fetch API)

```javascript
async function submitSuggestionFeedback(suggestionId, rating, feedback, action) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/v1/suggestions/${suggestionId}/feedback`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rating,
      feedback,
      action
    })
  });
  
  return await response.json();
}

// 使用示例
submitSuggestionFeedback('suggestion-123', 5, '很好的建议', 'accepted')
  .then(result => console.log('反馈结果:', result))
  .catch(error => console.error('提交反馈失败:', error));
```

### 3.6 AI调度模块

#### 3.6.1 创建AI任务

##### 使用curl

```bash
token="your-token-here"
curl -X POST http://localhost:3000/api/v1/ai-tasks \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d '{"type": "cognitive_analysis", "inputType": "file", "inputId": "file-123", "priority": "medium", "params": {"analysisDepth": "deep"}}'
```

##### 使用JavaScript (Fetch API)

```javascript
async function createAITask(type, inputType, inputId, priority = 'medium', params = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/v1/ai-tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type,
      inputType,
      inputId,
      priority,
      params
    })
  });
  
  return await response.json();
}

// 使用示例
createAITask('cognitive_analysis', 'file', 'file-123', 'medium', { analysisDepth: 'deep' })
  .then(result => console.log('AI任务创建结果:', result))
  .catch(error => console.error('创建AI任务失败:', error));
```

#### 3.6.2 获取任务状态

##### 使用curl

```bash
token="your-token-here"
taskId="your-task-id"
curl -X GET http://localhost:3000/api/v1/ai-tasks/$taskId \
  -H "Authorization: Bearer $token"
```

##### 使用JavaScript (Fetch API)

```javascript
async function getTaskStatus(taskId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/v1/ai-tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 使用示例
getTaskStatus('task-123')
  .then(result => console.log('任务状态:', result))
  .catch(error => console.error('获取任务状态失败:', error));
```

## 4. API使用最佳实践

### 4.1 认证管理

1. **安全存储令牌**：不要将令牌硬编码在代码中，应使用环境变量或安全的配置管理系统存储
2. **定期刷新令牌**：令牌有过期时间，应定期刷新令牌，避免因令牌过期导致API调用失败
3. **使用HTTPS**：在生产环境中，所有API调用都应使用HTTPS，确保令牌在传输过程中不被窃取
4. **权限最小化**：为不同的客户端分配最小必要的权限，避免权限过大导致安全风险

### 4.2 错误处理

1. **全面捕获错误**：在API调用代码中全面捕获错误，包括网络错误、超时错误和业务错误
2. **详细记录错误**：记录详细的错误信息，包括错误码、错误消息和请求上下文，便于调试和分析
3. **合理重试机制**：对于临时性错误（如网络波动、服务繁忙），实现合理的重试机制，避免因瞬时错误导致失败
4. **优雅降级**：当API调用失败时，实现优雅降级机制，提供备选方案或友好的错误提示

### 4.3 性能优化

1. **批量操作**：对于支持批量操作的API，尽量使用批量操作，减少API调用次数
2. **合理设置分页参数**：根据实际需求设置合理的分页大小，避免一次性获取过多数据
3. **缓存结果**：对于频繁调用且数据变化不频繁的API，实现客户端缓存，减少API调用次数
4. **异步处理**：对于耗时的API调用，使用异步处理方式，避免阻塞主线程
5. **压缩请求和响应**：使用gzip等压缩方式，减少网络传输数据量

### 4.4 请求设计

1. **明确API用途**：在调用API之前，仔细阅读API文档，明确API的用途和参数要求
2. **验证输入数据**：在客户端对输入数据进行验证，避免因无效数据导致API调用失败
3. **使用正确的HTTP方法**：根据RESTful API设计原则，使用正确的HTTP方法（GET、POST、PUT、DELETE等）
4. **设置合理的超时时间**：根据API的响应时间，设置合理的超时时间，避免长时间等待
5. **避免过度请求**：遵循API的速率限制，避免因过度请求导致429错误

### 4.5 数据处理

1. **验证响应数据**：在使用API响应数据之前，验证数据的完整性和正确性
2. **处理大数据量**：对于返回大量数据的API，实现流式处理或分页处理，避免内存溢出
3. **保护敏感数据**：不要在日志中记录敏感数据，如令牌、密码等
4. **数据脱敏**：对于返回的用户数据，进行适当的脱敏处理，保护用户隐私

## 5. 常见问题与解决方案

### 5.1 认证失败

**问题**：API调用返回401 UNAUTHORIZED错误

**解决方案**：
1. 检查令牌是否正确
2. 检查令牌是否过期
3. 检查请求头中的Authorization格式是否正确
4. 检查用户是否有访问该API的权限

### 5.2 请求参数错误

**问题**：API调用返回400 BAD_REQUEST错误

**解决方案**：
1. 检查请求参数是否完整
2. 检查请求参数类型是否正确
3. 检查请求参数格式是否符合要求
4. 检查必填参数是否都已提供

### 5.3 请求过于频繁

**问题**：API调用返回429 TOO_MANY_REQUESTS错误

**解决方案**：
1. 减少API调用频率
2. 实现请求队列，控制请求速率
3. 对于非实时数据，增加缓存时间
4. 联系管理员，了解API的速率限制

### 5.4 资源不存在

**问题**：API调用返回404 NOT_FOUND错误

**解决方案**：
1. 检查请求的资源ID是否正确
2. 检查资源是否已被删除
3. 检查API路径是否正确
4. 检查请求的HTTP方法是否正确

### 5.5 服务器内部错误

**问题**：API调用返回500 INTERNAL_SERVER_ERROR错误

**解决方案**：
1. 检查请求参数是否合法
2. 检查是否有特殊字符或格式问题
3. 查看服务器日志，了解具体错误原因
4. 联系管理员，报告问题

### 5.6 网络超时

**问题**：API调用超时

**解决方案**：
1. 检查网络连接是否正常
2. 检查服务器是否正常运行
3. 增加超时时间设置
4. 实现重试机制
5. 优化API调用，减少数据传输量

## 6. API客户端库

### 6.1 JavaScript客户端库

```javascript
// 简单的API客户端库示例
class CognitiveAssistantClient {
  constructor(baseUrl, token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }
  
  setToken(token) {
    this.token = token;
  }
  
  async request(method, endpoint, data = null, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // 添加查询参数
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // 添加认证头
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const options = {
      method,
      headers
    };
    
    // 添加请求体
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url.toString(), options);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'API请求失败');
      }
      
      return result;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }
  
  // 常用API方法封装
  async login(email, password) {
    const result = await this.request('POST', '/auth/login', { email, password });
    this.setToken(result.data.token);
    return result;
  }
  
  async uploadFile(file, type = null, tags = []) {
    const formData = new FormData();
    formData.append('file', file);
    if (type) formData.append('type', type);
    if (tags.length > 0) formData.append('tags', tags.join(','));
    
    const headers = {
      'Authorization': `Bearer ${this.token}`
    };
    
    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    return await response.json();
  }
  
  async getCognitiveModel() {
    return this.request('GET', '/cognitive-model');
  }
  
  async getSuggestions(category = null, limit = 5) {
    return this.request('GET', '/suggestions', null, { category, limit });
  }
  
  async createAITask(type, inputType, inputId, priority = 'medium', params = {}) {
    return this.request('POST', '/ai-tasks', {
      type,
      inputType,
      inputId,
      priority,
      params
    });
  }
}

// 使用示例
const client = new CognitiveAssistantClient('http://localhost:3000/api/v1');

// 登录
client.login('user@example.com', 'password123')
  .then(() => {
    // 获取认知模型
    return client.getCognitiveModel();
  })
  .then(model => {
    console.log('认知模型:', model);
    // 获取个性化建议
    return client.getSuggestions('learning', 5);
  })
  .then(suggestions => {
    console.log('个性化建议:', suggestions);
  })
  .catch(error => {
    console.error('错误:', error);
  });
```

## 7. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |