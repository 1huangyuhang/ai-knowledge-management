## 修复API实现与设计文档不一致问题

### 问题分析
1. **API路径前缀**：当前实现使用`/api`前缀，而设计文档要求使用`/api/v1/`
2. **响应格式**：当前实现使用`success: true/false`格式，而设计文档要求使用`data`和`meta`结构
3. **路由配置**：缺少版本号前缀配置
4. **API根路由**：返回的endpoints信息路径不正确

### 修复计划

#### 1. 更新API路径前缀
- **文件**：`src/application/ExpressApp.ts`
- **修改**：将第835行的`/api`改为`/api/v1`
- **影响**：所有API端点将使用正确的版本前缀

#### 2. 统一响应格式
- **文件**：
  - `src/application/middleware/validation-middleware.ts`
  - `src/application/controllers/ThoughtController.ts`
  - `src/application/controllers/InsightController.ts`
- **修改**：
  - 将所有响应从`{ success: true/false, data: ..., error: ... }`格式改为`{ data: ..., meta: ... }`格式
  - 成功响应：`{ data: result, meta: { message: '成功消息', timestamp: new Date().toISOString() } }`
  - 错误响应：`{ data: null, meta: { error: { message: '错误消息', code: 'ERROR_CODE', details: ... } } }`

#### 3. 更新路由配置文档
- **文件**：`src/application/routes/index.ts`
- **修改**：
  - 更新API根路由返回的endpoints信息，添加`/v1`版本号
  - 将第737-740行的路径从`/api/thoughts`改为`/api/v1/thoughts`

#### 4. 更新OpenAPI文档配置
- **文件**：`src/config/openapi.config.yml`
- **修改**：
  - 更新servers.url配置，添加`/v1`版本号
  - 更新响应格式定义，移除`success`字段，添加`data`和`meta`结构

### 验证方法
- 检查所有API响应格式是否统一为`data`和`meta`结构
- 验证所有API路径是否使用`/api/v1/`前缀
- 检查API根路由返回的endpoints信息是否正确

### 预期结果
- API实现与设计文档完全一致
- 所有API端点使用`/api/v1/`前缀
- 所有响应使用统一的`data`和`meta`格式
- 符合API设计原则和最佳实践