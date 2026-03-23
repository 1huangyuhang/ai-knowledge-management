# 苹果推送通知设计文档

索引标签：#苹果集成 #推送通知 #API设计 #基础设施

## 1. 文档概述

本文档详细描述了AI认知辅助系统中苹果推送通知服务（Apple Push Notification service，简称APNs）的集成设计和实现方案。APNs是苹果提供的一项服务，允许开发者向iOS、iPadOS、macOS、watchOS和tvOS设备发送推送通知。本设计方案旨在将APNs集成到现有系统中，为iOS用户提供及时、个性化的推送通知服务，同时确保系统的安全性和可靠性。

相关文档包括：
- [API设计](api-design.md)：API设计规范和实现
- [安全策略](security-strategy.md)：系统安全策略
- [苹果后端集成架构设计](../architecture-design/apple-backend-integration.md)：苹果后端集成架构设计
- [基础设施层设计](../layered-design/infrastructure-layer-design.md)：基础设施层设计和实现
- [苹果认证设计](apple-authentication.md)：Sign in with Apple设计
- [苹果后端开发指南](../development-guides/apple-backend-development.md)：苹果后端开发指导
- [苹果端到端集成](../integration-guides/apple-end-to-end-integration.md)：苹果端到端集成流程
- [苹果后端测试策略](../testing/apple-backend-testing-strategy.md)：苹果后端测试策略

## 2. 设计原则

### 2.1 核心原则

- **可靠性优先**：确保推送通知能够可靠地送达设备
- **安全性**：遵循苹果安全最佳实践，保护推送通知内容和设备令牌
- **可扩展性**：设计支持大规模设备和高并发推送
- **个性化**：支持向不同用户发送个性化的推送通知
- **效率**：优化推送通知的发送效率，减少延迟
- **可监控性**：提供完善的监控和日志机制，便于排查问题

### 2.2 设计目标

1. **支持APNs集成**：实现完整的APNs集成方案
2. **支持多种通知类型**：支持远程通知、静默通知等多种通知类型
3. **支持个性化推送**：支持向特定用户或设备组发送个性化通知
4. **确保通知可靠性**：实现重试机制，确保通知可靠送达
5. **保护用户隐私**：确保推送通知内容和设备令牌的安全
6. **支持大规模推送**：支持向大量设备发送批量通知
7. **提供监控和日志**：提供完善的监控和日志机制

## 3. 推送通知流程

### 3.1 整体流程

APNs推送通知的整体流程包括以下主要步骤：

1. **设备注册**：iOS设备向APNs注册，获取设备令牌
2. **令牌上报**：iOS设备将设备令牌上报给后端服务器
3. **存储令牌**：后端服务器存储设备令牌，关联到具体用户
4. **构建通知**：后端服务器根据业务逻辑构建推送通知内容
5. **发送通知**：后端服务器向APNs发送推送通知请求
6. **APNs转发**：APNs将通知转发到目标设备
7. **设备接收**：iOS设备接收通知并显示给用户

### 3.2 详细流程图

```mermaid
sequenceDiagram
    participant iOSApp as iOS应用
    participant APNs as Apple Push Notification service
    participant Server as 后端服务器
    participant DB as 数据库
    participant User as 用户

    %% 步骤1-3：设备注册和令牌上报
    iOSApp->>APNs: 注册推送通知
    APNs->>iOSApp: 返回设备令牌
    iOSApp->>Server: 上报设备令牌
    Server->>DB: 存储设备令牌（关联用户）
    DB-->>Server: 存储成功
    Server-->>iOSApp: 确认接收

    %% 步骤4-7：发送和接收通知
    User->>Server: 触发业务事件
    Server->>Server: 构建推送通知
    Server->>APNs: 发送推送通知请求
    APNs->>iOSApp: 推送通知
    iOSApp->>User: 显示通知
    User->>iOSApp: 点击通知
    iOSApp->>Server: 请求相关数据
    Server->>DB: 查询数据
    DB-->>Server: 返回数据
    Server-->>iOSApp: 返回数据
    iOSApp->>User: 显示内容
```

### 3.3 批量推送流程

```mermaid
sequenceDiagram
    participant Admin as 管理员
    participant Server as 后端服务器
    participant APNs as Apple Push Notification service
    participant DB as 数据库
    participant Devices as 多台iOS设备

    %% 步骤1-3：管理员触发批量推送
    Admin->>Server: 请求批量推送
    Server->>DB: 查询目标用户设备令牌
    DB-->>Server: 返回设备令牌列表

    %% 步骤4-6：发送批量通知
    Server->>Server: 构建批量推送通知
    Server->>APNs: 发送批量推送请求
    APNs->>Devices: 推送通知到多台设备
```

## 4. 技术实现

### 4.1 技术栈

| 技术类别 | 技术选型 | 用途 | 版本 |
|----------|----------|------|------|
| **APNs客户端库** | node-apn | 与APNs服务器通信 | ^5.0.0 |
| **Web框架** | Fastify | 构建API服务 | ^4.0.0 |
| **数据库** | SQLite/PostgreSQL | 存储设备令牌和用户关联 | - |
| **缓存** | Redis | 缓存APNs连接和设备令牌 | ^7.0.0 |
| **日志** | Winston | 记录推送通知日志 | ^3.0.0 |
| **监控** | Prometheus + Grafana | 监控推送通知指标 | - |

### 4.2 核心组件

#### 4.2.1 APNs配置

| 配置项 | 描述 | 示例值 |
|--------|------|--------|
| **teamId** | Apple开发者账号中的团队ID | ABCDE12345 |
| **keyId** | APNs认证密钥ID | ABC123DEF45 |
| **privateKey** | APNs认证密钥私钥 | -----BEGIN PRIVATE KEY-----... |
| **bundleId** | 应用的Bundle ID | com.example.ai-cognitive-assistant |
| **environment** | APNs环境 | development/production |
| **server** | APNs服务器地址 | api.development.push.apple.com:443 |

#### 4.2.2 设备令牌管理服务

设备令牌管理服务负责处理设备令牌的注册、更新、删除和查询，包括：

- 注册新设备令牌
- 更新现有设备令牌状态
- 删除无效设备令牌
- 查询用户的设备令牌列表
- 验证设备令牌的有效性

#### 4.2.3 推送通知服务

推送通知服务负责构建和发送推送通知，包括：

- 构建推送通知内容
- 向APNs发送推送通知请求
- 处理APNs响应
- 实现重试机制
- 支持批量推送

#### 4.2.4 APNs客户端

APNs客户端负责与APNs服务器通信，包括：

- 建立和维护与APNs服务器的连接
- 发送推送通知请求
- 处理APNs响应和错误
- 管理连接池

### 4.3 代码示例

#### 4.3.1 初始化APNs客户端

```typescript
// 初始化APNs客户端
import * as apn from 'apn';
import { config } from '../config';

const apnProvider = new apn.Provider({
  token: {
    key: Buffer.from(config.apns.privateKey.replace(/\\n/g, '\n'), 'utf8'),
    keyId: config.apns.keyId,
    teamId: config.apns.teamId
  },
  production: config.apns.environment === 'production'
});

export { apnProvider };
```

#### 4.3.2 注册设备令牌

```typescript
// 注册设备令牌
export const registerDeviceToken = async (
  userId: string,
  deviceToken: string,
  bundleId: string,
  deviceType: string,
  deviceName: string,
  osVersion: string
): Promise<DeviceToken> => {
  // 验证设备令牌格式
  if (!isValidDeviceToken(deviceToken)) {
    throw new Error('Invalid device token format');
  }

  // 检查设备令牌是否已存在
  const existingToken = await deviceTokenRepository.findByToken(deviceToken);
  if (existingToken) {
    // 更新现有令牌
    existingToken.userId = userId;
    existingToken.bundleId = bundleId;
    existingToken.deviceType = deviceType;
    existingToken.deviceName = deviceName;
    existingToken.osVersion = osVersion;
    existingToken.isActive = true;
    existingToken.updatedAt = new Date();
    return await deviceTokenRepository.save(existingToken);
  }

  // 创建新令牌
  const newToken = {
    id: `token-${uuidv4()}`,
    userId,
    deviceToken,
    bundleId,
    deviceType,
    deviceName,
    osVersion,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return await deviceTokenRepository.save(newToken);
};
```

#### 4.3.3 发送推送通知

```typescript
// 发送推送通知
export const sendPushNotification = async (
  deviceTokens: string[],
  notification: PushNotification
): Promise<SendNotificationResult> => {
  // 构建APNs通知
  const apnNotification = new apn.Notification({
    alert: {
      title: notification.title,
      body: notification.body
    },
    badge: notification.badge,
    sound: notification.sound || 'default',
    data: notification.data,
    topic: config.apns.bundleId,
    mutableContent: notification.mutableContent || false,
    contentAvailable: notification.contentAvailable || false
  });

  // 发送通知到多个设备
  const result: SendNotificationResult = {
    successCount: 0,
    failedCount: 0,
    failedTokens: [],
    notificationId: `notification-${uuidv4()}`
  };

  for (const deviceToken of deviceTokens) {
    try {
      const apnResult = await apnProvider.send(apnNotification, deviceToken);
      
      if (apnResult.failed.length > 0) {
        // 处理失败情况
        result.failedCount++;
        result.failedTokens.push({
          deviceToken,
          error: apnResult.failed[0].response.reason
        });
        
        // 如果是无效令牌，标记为无效
        if (apnResult.failed[0].response.reason === 'BadDeviceToken') {
          await deviceTokenRepository.markAsInvalid(deviceToken);
        }
      } else {
        // 发送成功
        result.successCount++;
      }
    } catch (error) {
      // 处理异常情况
      result.failedCount++;
      result.failedTokens.push({
        deviceToken,
        error: (error as Error).message
      });
    }
  }

  return result;
};
```

#### 4.3.4 批量发送推送通知

```typescript
// 批量发送推送通知
export const sendBatchPushNotification = async (
  userIds: string[],
  notification: PushNotification
): Promise<BatchSendResult> => {
  // 查询用户设备令牌
  const deviceTokens = await deviceTokenRepository.findByUserIds(userIds);
  
  if (deviceTokens.length === 0) {
    return {
      batchId: `batch-${uuidv4()}`,
      totalDevices: 0,
      sentCount: 0,
      failedCount: 0
    };
  }

  // 去重设备令牌
  const uniqueTokens = [...new Set(deviceTokens.map(token => token.deviceToken))];
  
  // 发送通知
  const result = await sendPushNotification(uniqueTokens, notification);
  
  return {
    batchId: `batch-${uuidv4()}`,
    totalDevices: uniqueTokens.length,
    sentCount: result.successCount,
    failedCount: result.failedCount
  };
};
```

## 5. 安全考虑

### 5.1 证书和密钥管理

- **使用认证密钥（推荐）**：使用APNs认证密钥（.p8文件）而不是证书，认证密钥有效期更长，管理更简单
- **安全存储密钥**：APNs私钥必须安全存储，建议使用环境变量或密钥管理服务
- **定期轮换密钥**：定期轮换APNs密钥，提高安全性
- **区分开发和生产环境**：为开发环境和生产环境使用不同的密钥和配置

### 5.2 设备令牌安全

- **加密存储**：设备令牌必须加密存储在数据库中
- **传输安全**：设备令牌必须通过HTTPS传输，防止中间人攻击
- **验证令牌格式**：接收设备令牌时，必须验证令牌格式的有效性
- **定期清理无效令牌**：定期清理无效的设备令牌，提高推送效率

### 5.3 通知内容安全

- **加密敏感内容**：如果通知包含敏感内容，必须进行加密
- **最小化通知内容**：通知内容应尽量简洁，敏感信息应通过后续API请求获取
- **使用静默通知**：对于敏感信息，可使用静默通知，在应用内部处理和显示

### 5.4 访问控制

- **限制API访问**：推送通知相关的API端点必须进行认证和授权
- **实施请求速率限制**：对推送通知API实施请求速率限制，防止滥用
- **监控异常行为**：监控异常的推送通知请求，如大量失败的推送尝试

## 6. 错误处理

### 6.1 常见错误类型

| 错误类型 | 描述 | 处理方式 |
|----------|------|----------|
| **BadDeviceToken** | 设备令牌无效或已过期 | 标记设备令牌为无效，不再向该令牌发送通知 |
| **DeviceTokenNotForTopic** | 设备令牌与指定的bundleId不匹配 | 验证bundleId和设备令牌的对应关系 |
| **ExpiredProviderToken** | APNs提供程序令牌已过期 | 重新生成提供程序令牌 |
| **MismatchedProviderToken** | 提供程序令牌与APNs环境不匹配 | 检查APNs环境配置（开发/生产） |
| **PayloadTooLarge** | 通知负载过大（超过4KB） | 减小通知负载大小 |
| **TooManyProviderTokenUpdates** | 频繁更新提供程序令牌 | 减少提供程序令牌的更新频率 |
| **TooManyRequests** | 推送请求频率超过限制 | 实现重试机制，降低请求频率 |
| **InternalServerError** | APNs服务器内部错误 | 实现重试机制，稍后重试 |
| **ServiceUnavailable** | APNs服务不可用 | 实现重试机制，稍后重试 |

### 6.2 重试机制

- **指数退避重试**：对于可重试的错误，实现指数退避重试机制
- **最大重试次数**：设置最大重试次数，避免无限重试
- **重试间隔**：初始重试间隔设置为1秒，每次重试后间隔翻倍
- **分开处理不同错误**：根据错误类型决定是否重试和重试策略

### 6.3 错误日志和监控

- **记录详细日志**：记录推送通知的发送结果和错误信息
- **监控失败率**：监控推送通知的失败率，设置阈值告警
- **分析失败原因**：定期分析推送失败的原因，优化推送策略
- **通知管理员**：当推送失败率超过阈值时，通知管理员

## 7. 通知类型和使用场景

### 7.1 远程通知

- **用途**：向用户显示通知内容
- **特点**：包含通知标题、正文、声音和徽章等
- **使用场景**：
  - 新的认知洞察通知
  - AI建议通知
  - 系统更新通知
  - 活动提醒

### 7.2 静默通知

- **用途**：在后台更新应用数据，不向用户显示通知
- **特点**：包含`content-available: 1`字段
- **使用场景**：
  - 后台同步数据
  - 预加载内容
  - 更新应用配置

### 7.3 交互式通知

- **用途**：允许用户直接在通知上进行操作
- **特点**：包含操作按钮
- **使用场景**：
  - 快速回复消息
  - 接受/拒绝邀请
  - 执行简单操作

### 7.4 自定义通知UI

- **用途**：显示自定义样式的通知
- **特点**：包含`mutable-content: 1`字段，允许应用扩展通知
- **使用场景**：
  - 显示富媒体内容
  - 自定义通知布局
  - 显示动态内容

## 8. 测试策略

### 8.1 测试类型

- **单元测试**：测试各个组件的单个功能，如设备令牌管理、通知构建等
- **集成测试**：测试与APNs服务器的集成，如发送通知、处理响应等
- **端到端测试**：测试完整的推送通知流程，从触发事件到设备接收通知
- **性能测试**：测试大规模推送的性能和可靠性
- **安全测试**：测试推送通知的安全性，如设备令牌保护、内容加密等

### 8.2 测试工具

| 测试类型 | 工具 | 用途 |
|----------|------|------|
| **单元测试** | Jest | 测试各个组件的单个功能 |
| **集成测试** | Supertest | 测试API端点与APNs的集成 |
| **端到端测试** | Detox | 测试iOS应用接收通知的完整流程 |
| **性能测试** | Artillery | 测试大规模推送的性能 |
| **APNs测试工具** | apn-tester-cli | 测试APNs连接和通知发送 |

### 8.3 测试场景

- **成功发送通知**：测试向单个设备成功发送通知
- **发送通知到无效令牌**：测试向无效设备令牌发送通知的处理
- **发送批量通知**：测试向多个设备发送批量通知
- **发送不同类型的通知**：测试发送远程通知、静默通知等不同类型的通知
- **处理APNs错误**：测试处理各种APNs错误情况
- **重试机制测试**：测试重试机制的正确性
- **性能测试**：测试大规模推送的性能和可靠性

## 9. 实施步骤

### 9.1 准备工作

1. **注册Apple开发者账号**：如果还没有Apple开发者账号，需要注册一个
2. **创建App ID**：在Apple开发者控制台创建App ID，启用推送通知服务
3. **创建APNs密钥**：在Apple开发者控制台创建APNs认证密钥
4. **配置Xcode项目**：在Xcode项目中启用推送通知功能
5. **获取配置信息**：获取teamId、keyId、privateKey和bundleId

### 9.2 后端实施

1. **安装依赖**：安装node-apn、redis等依赖
2. **配置APNs**：在后端配置APNs相关的参数
3. **实现设备令牌管理**：实现设备令牌的注册、更新、删除和查询功能
4. **实现推送通知服务**：实现通知构建、发送和重试机制
5. **实现API端点**：实现推送通知相关的API端点
6. **集成现有系统**：将APNs集成到现有业务逻辑中
7. **编写测试用例**：编写单元测试和集成测试
8. **设置监控和日志**：设置推送通知的监控和日志机制

### 9.3 前端实施

1. **配置推送通知权限**：在iOS应用中请求推送通知权限
2. **实现设备注册**：实现向APNs注册设备并获取设备令牌的逻辑
3. **上报设备令牌**：将设备令牌上报给后端服务器
4. **处理推送通知**：实现接收和处理推送通知的逻辑
5. **支持不同类型的通知**：支持远程通知、静默通知等不同类型的通知
6. **测试通知接收**：测试iOS应用能否正确接收和处理通知

### 9.4 测试和部署

1. **开发环境测试**：在开发环境中测试推送通知功能
2. **生产环境测试**：在生产环境中测试推送通知功能
3. **性能测试**：测试大规模推送的性能和可靠性
4. **部署到生产环境**：将代码部署到生产环境
5. **监控和维护**：持续监控推送通知的发送情况，及时处理问题

## 10. 总结

本文档详细描述了AI认知辅助系统中APNs的集成设计和实现方案，包括推送通知流程、技术实现、安全考虑、错误处理、测试策略和实施步骤。该方案遵循了苹果安全最佳实践，确保了推送通知的可靠性、安全性和效率，同时支持大规模设备和高并发推送。

通过实施这个设计方案，可以为iOS用户提供及时、个性化的推送通知服务，提高用户体验和系统的竞争力。同时，该方案具有良好的可扩展性和可维护性，能够支持未来业务的发展和苹果生态的新功能。

## 11. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 1. 初始创建苹果推送通知设计文档<br>2. 定义了设计原则和推送通知流程<br>3. 详细描述了技术实现和代码示例<br>4. 制定了安全考虑和错误处理方案<br>5. 规划了测试策略和实施步骤 | 系统架构师 |