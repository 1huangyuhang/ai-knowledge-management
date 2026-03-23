# 苹果后端开发指南

索引标签：#开发指南 #苹果集成 #认证 #推送通知 #API开发

## 1. 文档概述

本文档详细描述了认知辅助系统苹果后端功能的开发指南，包括开发环境搭建、代码结构、核心功能实现、开发流程和最佳实践等。苹果后端功能主要包括苹果认证（Sign in with Apple）和苹果推送通知服务（APNs）的集成，旨在为iOS客户端提供完整的后端支持。

### 1.1 相关文档

- [苹果后端集成架构设计](../architecture-design/apple-backend-integration.md)：详细描述苹果后端集成的架构设计
- [API设计](../core-features/api-design.md)：详细描述苹果后端API的设计
- [苹果认证设计](../core-features/apple-authentication.md)：详细描述苹果认证的设计
- [苹果推送通知设计](../core-features/apple-push-notification.md)：详细描述苹果推送通知的设计
- [基础设施层设计](../layered-design/infrastructure-layer-design.md)：详细描述基础设施层的设计
- [苹果端到端集成](../integration-guides/apple-end-to-end-integration.md)：苹果端到端集成流程
- [iOS客户端集成](../integration-guides/ios-client-integration.md)：iOS客户端集成指南
- [苹果后端测试策略](../testing/apple-backend-testing-strategy.md)：苹果后端测试策略

## 2. 开发环境搭建

### 2.1 系统要求

- Node.js LTS (≥18)
- npm 或 yarn 包管理工具
- TypeScript (≥5.0)
- 苹果开发者账号（用于获取Apple ID认证和APNs相关证书）

### 2.2 依赖安装

1. 安装核心依赖：

```bash
npm install --save node-apn apple-jwt-generator jsonwebtoken
```

2. 安装开发依赖：

```bash
npm install --save-dev @types/node-apn @types/jsonwebtoken
```

### 2.3 配置文件设置

在项目根目录创建 `.env` 文件，添加苹果相关配置：

```env
# 苹果认证配置
APPLE_CLIENT_ID=com.example.app
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\nAPPLE_REDIRECT_URI=https://example.com/api/v1/auth/apple/callback

# APNs配置
APNs_KEY_ID=YOUR_APNS_KEY_ID
APNs_TEAM_ID=YOUR_TEAM_ID
APNs_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_APNS_PRIVATE_KEY\n-----END PRIVATE KEY-----\nAPNs_BUNDLE_ID=com.example.app
APNs_ENV=development
```

## 3. 代码结构

苹果后端功能采用模块化设计，遵循Clean Architecture原则，代码结构如下：

```
src/
├── apple/
│   ├── authentication/         # 苹果认证相关代码
│   │   ├── AppleAuthService.ts        # 苹果认证服务接口
│   │   ├── AppleAuthServiceImpl.ts    # 苹果认证服务实现
│   │   ├── AppleAuthController.ts     # 苹果认证控制器
│   │   └── AppleAuthMiddleware.ts     # 苹果认证中间件
│   ├── apns/                   # APNs相关代码
│   │   ├── APNsService.ts             # APNs服务接口
│   │   ├── APNsServiceImpl.ts         # APNs服务实现
│   │   ├── APNsController.ts          # APNs控制器
│   │   └── APNsValidationMiddleware.ts # APNs验证中间件
│   ├── repository/             # 苹果相关数据访问
│   │   ├── AppleAuthRepository.ts     # 苹果认证仓库接口
│   │   └── DeviceTokenRepository.ts   # 设备令牌仓库接口
│   └── types/                  # 苹果相关类型定义
│       ├── AppleAuthTypes.ts          # 苹果认证类型
│       └── APNsTypes.ts               # APNs类型
├── config/                     # 配置管理
├── domain/                     # 领域层
├── infrastructure/             # 基础设施层
└── presentation/               # 表示层
```

## 4. 核心功能开发

### 4.1 苹果认证开发

#### 4.1.1 生成认证URL

```typescript
// AppleAuthServiceImpl.ts
async generateAuthURL(state: string): Promise<string> {
  const clientId = this.configService.get('APPLE_CLIENT_ID');
  const redirectUri = this.configService.get('APPLE_REDIRECT_URI');
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    scope: 'email name',
    response_mode: 'form_post'
  });
  
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}
```

#### 4.1.2 生成客户端密钥

```typescript
// AppleAuthServiceImpl.ts
generateClientSecret(): string {
  const teamId = this.configService.get('APPLE_TEAM_ID');
  const clientId = this.configService.get('APPLE_CLIENT_ID');
  const keyId = this.configService.get('APPLE_KEY_ID');
  const privateKey = this.configService.get('APPLE_PRIVATE_KEY');
  
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 3600 * 24 * 180; // 6个月
  
  const payload = {
    iss: teamId,
    iat: now,
    exp: expires,
    aud: 'https://appleid.apple.com',
    sub: clientId
  };
  
  return jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    keyid: keyId
  });
}
```

#### 4.1.3 交换授权码获取令牌

```typescript
// AppleAuthServiceImpl.ts
async exchangeCodeForToken(code: string): Promise<AppleTokenResponse> {
  const url = 'https://appleid.apple.com/auth/token';
  const clientId = this.configService.get('APPLE_CLIENT_ID');
  const clientSecret = this.generateClientSecret();
  
  const data = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: this.configService.get('APPLE_REDIRECT_URI')
  });
  
  return this.httpClient.post<AppleTokenResponse>(url, data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}
```

### 4.2 APNs开发

#### 4.2.1 初始化APNs提供者

```typescript
// APNsServiceImpl.ts
constructor(private readonly configService: ConfigService) {
  const env = this.configService.get('APNs_ENV') as 'development' | 'production';
  const keyId = this.configService.get('APNs_KEY_ID');
  const teamId = this.configService.get('APNs_TEAM_ID');
  const privateKey = this.configService.get('APNs_PRIVATE_KEY');
  const bundleId = this.configService.get('APNs_BUNDLE_ID');
  
  this.apnProvider = new apn.Provider({
    token: {
      key: privateKey,
      keyId: keyId,
      teamId: teamId
    },
    production: env === 'production',
    bundleId: bundleId
  });
}
```

#### 4.2.2 发送推送通知

```typescript
// APNsServiceImpl.ts
async sendNotification(
  deviceToken: string,
  payload: APNsPayload,
  options?: APNsOptions
): Promise<APNsResponse> {
  try {
    const note = new apn.Notification({
      alert: payload.aps.alert,
      badge: payload.aps.badge,
      sound: payload.aps.sound,
      contentAvailable: payload.aps.contentAvailable,
      mutableContent: payload.aps.mutableContent,
      category: payload.aps.category,
      threadId: payload.aps.threadId,
      payload: payload,
      expiration: options?.expiration || 0,
      priority: options?.priority || 10,
      collapseId: options?.collapseId,
      topic: options?.topic || this.configService.get('APNs_BUNDLE_ID'),
      pushType: options?.pushType || 'alert'
    });
    
    const result = await this.apnProvider.send(note, deviceToken);
    
    if (result.failed.length > 0) {
      return {
        success: false,
        error: result.failed[0].response?.reason || 'Unknown error'
      };
    }
    
    return {
      success: true,
      messageId: result.sent[0]?.messageId
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### 4.3 设备令牌管理

#### 4.3.1 注册设备令牌

```typescript
// DeviceTokenRepository.ts
export interface DeviceTokenRepository {
  save(token: DeviceToken): Promise<DeviceToken>;
  findByUserIdAndDeviceToken(userId: string, deviceToken: string): Promise<DeviceToken | null>;
  findByUserId(userId: string): Promise<DeviceToken[]>;
  delete(id: string): Promise<void>;
  deleteByDeviceToken(deviceToken: string): Promise<void>;
}
```

#### 4.3.2 实现设备令牌仓库

```typescript
// PostgreSQLDeviceTokenRepository.ts
export class PostgreSQLDeviceTokenRepository implements DeviceTokenRepository {
  constructor(private readonly connection: DatabaseConnection) {}
  
  async save(token: DeviceToken): Promise<DeviceToken> {
    const existingToken = await this.findByUserIdAndDeviceToken(token.userId, token.deviceToken);
    
    if (existingToken) {
      // 更新现有令牌
      const query = `
        UPDATE device_tokens
        SET device_type = $1, device_model = $2, os_version = $3, is_active = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;
      
      const result = await this.connection.query(query, [
        token.deviceType,
        token.deviceModel,
        token.osVersion,
        token.isActive,
        existingToken.id
      ]);
      
      return this.mapToEntity(result.rows[0]);
    } else {
      // 创建新令牌
      const query = `
        INSERT INTO device_tokens (user_id, device_token, device_type, device_model, os_version, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await this.connection.query(query, [
        token.userId,
        token.deviceToken,
        token.deviceType,
        token.deviceModel,
        token.osVersion,
        token.isActive
      ]);
      
      return this.mapToEntity(result.rows[0]);
    }
  }
  
  // 其他方法实现...
}
```

## 5. 开发流程

### 5.1 开发前准备

1. 获取苹果开发者账号
2. 创建App ID和Service ID
3. 生成认证密钥和APNs密钥
4. 配置重定向URI
5. 设置环境变量

### 5.2 编码规范

- 遵循TypeScript严格模式
- 使用ESLint和Prettier进行代码检查和格式化
- 函数级注释必须包含参数、返回值和功能描述
- 核心逻辑必须包含错误处理
- 使用依赖注入（tsyringe）管理依赖关系

### 5.3 测试流程

1. **单元测试**：为每个服务和组件编写单元测试
2. **集成测试**：测试组件之间的集成
3. **端到端测试**：测试完整的苹果认证和推送流程
4. **模拟测试**：使用模拟数据测试苹果服务集成

### 5.4 部署流程

1. 构建项目：`npm run build`
2. 运行测试：`npm run test`
3. 部署到服务器
4. 配置环境变量
5. 监控服务状态

## 6. 最佳实践

### 6.1 安全性

- 存储苹果私钥和密钥时使用环境变量或安全的密钥管理服务
- 验证苹果ID令牌的签名和有效性
- 使用HTTPS加密所有通信
- 实现适当的速率限制和防止暴力攻击

### 6.2 性能优化

- 缓存苹果客户端密钥以减少计算开销
- 批量发送推送通知以提高效率
- 实现令牌刷新机制以避免频繁请求苹果服务器
- 使用连接池管理数据库连接

### 6.3 可靠性

- 实现重试机制处理临时网络故障
- 添加适当的日志记录以便调试和监控
- 实现健康检查端点
- 定期备份数据库

### 6.4 可维护性

- 遵循模块化设计原则
- 使用清晰的命名约定
- 编写详细的文档
- 定期更新依赖库

## 7. 常见问题和解决方案

### 7.1 苹果认证问题

**问题**：获取授权码失败
**解决方案**：
- 检查App ID和Service ID配置
- 验证重定向URI是否匹配
- 确保scope参数正确设置

**问题**：验证ID令牌失败
**解决方案**：
- 检查苹果公钥是否正确获取
- 验证令牌的iss、aud和exp字段
- 确保使用正确的算法验证签名

### 7.2 APNs问题

**问题**：推送通知发送失败
**解决方案**：
- 检查APNs密钥和配置是否正确
- 验证设备令牌是否有效
- 检查推送通知负载格式是否符合APNs要求
- 查看APNs错误响应并根据错误码进行调试

**问题**：设备令牌失效
**解决方案**：
- 实现设备令牌刷新机制
- 定期清理失效的设备令牌
- 监控APNs反馈服务获取失效令牌

### 7.3 性能问题

**问题**：推送通知发送延迟
**解决方案**：
- 优化推送通知队列
- 实现批量发送
- 考虑使用第三方推送服务

**问题**：数据库查询缓慢
**解决方案**：
- 添加适当的索引
- 优化查询语句
- 考虑使用缓存

## 8. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |
