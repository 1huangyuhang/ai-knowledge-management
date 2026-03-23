# Day 28: 第一阶段 - 系统地基期 - Week 4 - 第28天 APNs技术实现

## APNs技术实现

### 1. 概述

本文档详细描述了AI认知辅助系统中苹果推送通知服务（APNs）的技术实现方案。APNs是苹果提供的推送通知服务，允许服务器向iOS、macOS、watchOS和tvOS设备发送推送通知。本实现方案旨在为系统提供可靠、高效的推送通知功能，支持iOS客户端接收系统生成的认知反馈和思考方向。

### 2. 核心设计思想

APNs实现遵循Clean Architecture原则，将推送通知逻辑分为以下层次：

- **Domain层**：定义推送通知相关的领域模型和接口
- **Application层**：实现推送通知业务逻辑
- **Infrastructure层**：处理与APNs服务器的通信和设备令牌管理
- **Presentation层**：提供API接口供客户端和内部服务调用

### 3. 目录结构

```typescript
/src
├── apple/
│   ├── apns/                   # APNs相关代码
│   │   ├── APNsService.ts             # APNs服务接口
│   │   ├── APNsServiceImpl.ts         # APNs服务实现
│   │   ├── APNsController.ts          # APNs控制器
│   │   └── APNsValidationMiddleware.ts # APNs验证中间件
│   ├── repository/             # 苹果相关数据访问
│   │   ├── DeviceTokenRepository.ts   # 设备令牌仓库接口
│   │   └── PostgreSQLDeviceTokenRepository.ts # 设备令牌PostgreSQL实现
│   └── types/                  # 苹果相关类型定义
│       └── APNsTypes.ts               # APNs类型
└── ...
```

### 4. 核心组件实现

#### 4.1 APNs类型定义

```typescript
// src/apple/types/APNsTypes.ts

/**
 * APNs负载
 */
export interface APNsPayload {
  aps: {
    alert?: string | APNsAlert;
    badge?: number;
    sound?: string;
    contentAvailable?: boolean;
    mutableContent?: boolean;
    category?: string;
    threadId?: string;
  };
  [key: string]: any;
}

/**
 * APNs警告
 */
export interface APNsAlert {
  title?: string;
  subtitle?: string;
  body?: string;
  titleLocKey?: string;
  titleLocArgs?: string[];
  subtitleLocKey?: string;
  subtitleLocArgs?: string[];
  locKey?: string;
  locArgs?: string[];
  actionLocKey?: string;
  launchImage?: string;
}

/**
 * APNs选项
 */
export interface APNsOptions {
  expiration?: number;
  priority?: 5 | 10;
  collapseId?: string;
  topic?: string;
  pushType?: 'alert' | 'background' | 'voip' | 'complication' | 'fileprovider' | 'mdm';
}

/**
 * APNs响应
 */
export interface APNsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * APNs批量响应
 */
export interface APNsBatchResponse {
  successCount: number;
  failureCount: number;
  results: Array<{
    deviceToken: string;
    response: APNsResponse;
  }>;
}

/**
 * 设备令牌
 */
export interface DeviceToken {
  id: string;
  userId: string;
  deviceToken: string;
  deviceType: string;
  deviceModel?: string;
  osVersion?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 批量发送结果
 */
export interface BatchSendResult {
  batchId: string;
  totalDevices: number;
  sentCount: number;
  failedCount: number;
}

/**
 * 推送通知请求
 */
export interface PushNotificationRequest {
  userId?: string;
  deviceToken?: string;
  payload: APNsPayload;
  options?: APNsOptions;
}
```

#### 4.2 APNs服务接口

```typescript
// src/apple/apns/APNsService.ts

import { APNsPayload, APNsResponse, APNsBatchResponse, APNsOptions } from '../types/APNsTypes';

/**
 * APNs服务接口
 */
export interface APNsService {
  /**
   * 发送推送通知
   * @param deviceToken 设备令牌
   * @param payload 通知负载
   * @param options 通知选项
   * @returns 发送结果
   */
  sendNotification(
    deviceToken: string,
    payload: APNsPayload,
    options?: APNsOptions
  ): Promise<APNsResponse>;

  /**
   * 批量发送推送通知
   * @param notifications 通知列表
   * @returns 批量发送结果
   */
  sendBatchNotifications(
    notifications: Array<{
      deviceToken: string;
      payload: APNsPayload;
      options?: APNsOptions;
    }>
  ): Promise<APNsBatchResponse>;

  /**
   * 向特定用户发送推送通知
   * @param userId 用户ID
   * @param payload 通知负载
   * @param options 通知选项
   * @returns 批量发送结果
   */
  sendNotificationToUser(
    userId: string,
    payload: APNsPayload,
    options?: APNsOptions
  ): Promise<APNsBatchResponse>;

  /**
   * 验证设备令牌
   * @param deviceToken 设备令牌
   * @returns 验证结果
   */
  verifyDeviceToken(deviceToken: string): Promise<boolean>;
}
```

#### 4.3 APNs服务实现

```typescript
// src/apple/apns/APNsServiceImpl.ts

import { APNsService } from './APNsService';
import { APNsPayload, APNsResponse, APNsBatchResponse, APNsOptions } from '../types/APNsTypes';
import { ConfigManager } from '../../infrastructure/config/ConfigManager';
import { DeviceTokenRepository } from '../repository/DeviceTokenRepository';
import { Logger } from '../../infrastructure/logger/Logger';
import * as apn from 'apn';

/**
 * APNs服务实现
 */
export class APNsServiceImpl implements APNsService {
  private readonly configManager: ConfigManager;
  private readonly deviceTokenRepository: DeviceTokenRepository;
  private readonly logger: Logger;
  private readonly apnProvider: apn.Provider;

  /**
   * 创建APNs服务实例
   * @param configManager 配置管理器
   * @param deviceTokenRepository 设备令牌仓库
   * @param logger 日志记录器
   */
  constructor(
    configManager: ConfigManager,
    deviceTokenRepository: DeviceTokenRepository,
    logger: Logger
  ) {
    this.configManager = configManager;
    this.deviceTokenRepository = deviceTokenRepository;
    this.logger = logger;
    
    // 初始化APNs提供者
    const env = this.configManager.get<string>('APNs_ENV') as 'development' | 'production';
    const keyId = this.configManager.get<string>('APNs_KEY_ID');
    const teamId = this.configManager.get<string>('APNs_TEAM_ID');
    const privateKey = this.configManager.get<string>('APNs_PRIVATE_KEY').replace(/\\n/g, '\n');
    const bundleId = this.configManager.get<string>('APNs_BUNDLE_ID');
    
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

  /**
   * 发送推送通知
   */
  async sendNotification(
    deviceToken: string,
    payload: APNsPayload,
    options?: APNsOptions
  ): Promise<APNsResponse> {
    try {
      // 验证设备令牌
      if (!await this.verifyDeviceToken(deviceToken)) {
        this.logger.logWarning('Invalid device token', { deviceToken });
        return {
          success: false,
          error: 'Invalid device token'
        };
      }
      
      // 构建APNs通知
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
        topic: options?.topic || this.configManager.get<string>('APNs_BUNDLE_ID'),
        pushType: options?.pushType || 'alert'
      });
      
      const result = await this.apnProvider.send(note, deviceToken);
      
      if (result.failed.length > 0) {
        const error = result.failed[0].response?.reason || 'Unknown error';
        this.logger.logError('APNs notification failed', { deviceToken, error, payload });
        
        // 处理失效的设备令牌
        if (['BadDeviceToken', 'Unregistered'].includes(error)) {
          await this.deviceTokenRepository.markAsInvalid(deviceToken);
        }
        
        return {
          success: false,
          error: error
        };
      }
      
      this.logger.logInfo('APNs notification sent successfully', { 
        deviceToken, 
        messageId: result.sent[0]?.messageId, 
        payload 
      });
      
      return {
        success: true,
        messageId: result.sent[0]?.messageId
      };
    } catch (error) {
      this.logger.logError('APNs notification exception', { deviceToken, error: (error as Error).message, payload });
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * 批量发送推送通知
   */
  async sendBatchNotifications(
    notifications: Array<{
      deviceToken: string;
      payload: APNsPayload;
      options?: APNsOptions;
    }>
  ): Promise<APNsBatchResponse> {
    const results: Array<{
      deviceToken: string;
      response: APNsResponse;
    }> = [];
    
    for (const notification of notifications) {
      const response = await this.sendNotification(
        notification.deviceToken,
        notification.payload,
        notification.options
      );
      
      results.push({
        deviceToken: notification.deviceToken,
        response
      });
    }
    
    return {
      successCount: results.filter(r => r.response.success).length,
      failureCount: results.filter(r => !r.response.success).length,
      results
    };
  }

  /**
   * 向特定用户发送推送通知
   */
  async sendNotificationToUser(
    userId: string,
    payload: APNsPayload,
    options?: APNsOptions
  ): Promise<APNsBatchResponse> {
    // 获取用户的所有活跃设备令牌
    const deviceTokens = await this.deviceTokenRepository.findByUserId(userId);
    
    if (deviceTokens.length === 0) {
      this.logger.logWarning('No active device tokens found for user', { userId });
      return {
        successCount: 0,
        failureCount: 0,
        results: []
      };
    }
    
    // 构建通知列表
    const notifications = deviceTokens.map(token => ({
      deviceToken: token.deviceToken,
      payload,
      options
    }));
    
    // 批量发送通知
    return this.sendBatchNotifications(notifications);
  }

  /**
   * 验证设备令牌
   */
  async verifyDeviceToken(deviceToken: string): Promise<boolean> {
    // 验证设备令牌格式
    if (!/^[0-9a-f]{64}$/i.test(deviceToken)) {
      return false;
    }
    
    // 检查设备令牌是否存在且活跃
    const token = await this.deviceTokenRepository.findByToken(deviceToken);
    return token?.isActive || false;
  }
}
```

#### 4.4 设备令牌仓库接口

```typescript
// src/apple/repository/DeviceTokenRepository.ts

import { DeviceToken } from '../types/APNsTypes';

/**
 * 设备令牌仓库接口
 */
export interface DeviceTokenRepository {
  /**
   * 保存设备令牌
   * @param token 设备令牌
   * @returns 保存后的设备令牌
   */
  save(token: DeviceToken): Promise<DeviceToken>;

  /**
   * 根据用户ID和设备令牌查找
   * @param userId 用户ID
   * @param deviceToken 设备令牌
   * @returns 设备令牌
   */
  findByUserIdAndDeviceToken(userId: string, deviceToken: string): Promise<DeviceToken | null>;

  /**
   * 根据用户ID查找设备令牌列表
   * @param userId 用户ID
   * @returns 设备令牌列表
   */
  findByUserId(userId: string): Promise<DeviceToken[]>;

  /**
   * 根据设备令牌查找
   * @param deviceToken 设备令牌
   * @returns 设备令牌
   */
  findByToken(deviceToken: string): Promise<DeviceToken | null>;

  /**
   * 根据用户ID列表查找设备令牌
   * @param userIds 用户ID列表
   * @returns 设备令牌列表
   */
  findByUserIds(userIds: string[]): Promise<DeviceToken[]>;

  /**
   * 删除设备令牌
   * @param id 设备令牌ID
   * @returns 删除结果
   */
  delete(id: string): Promise<void>;

  /**
   * 标记设备令牌为无效
   * @param deviceToken 设备令牌
   * @returns 更新结果
   */
  markAsInvalid(deviceToken: string): Promise<void>;
}
```

#### 4.5 设备令牌PostgreSQL实现

```typescript
// src/apple/repository/PostgreSQLDeviceTokenRepository.ts

import { DeviceTokenRepository } from './DeviceTokenRepository';
import { DeviceToken } from '../types/APNsTypes';
import { DatabaseClient } from '../../infrastructure/database/DatabaseClient';

/**
 * 设备令牌PostgreSQL实现
 */
export class PostgreSQLDeviceTokenRepository implements DeviceTokenRepository {
  private readonly databaseClient: DatabaseClient;

  /**
   * 创建设备令牌仓库实例
   * @param databaseClient 数据库客户端
   */
  constructor(databaseClient: DatabaseClient) {
    this.databaseClient = databaseClient;
  }

  /**
   * 保存设备令牌
   */
  async save(token: DeviceToken): Promise<DeviceToken> {
    const existingToken = await this.findByUserIdAndDeviceToken(token.userId, token.deviceToken);
    
    if (existingToken) {
      // 更新现有令牌
      const query = `
        UPDATE device_tokens
        SET device_type = $1, device_model = $2, os_version = $3, is_active = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING id, user_id as userId, device_token as deviceToken, device_type as deviceType, device_model as deviceModel, os_version as osVersion, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      `;
      
      const result = await this.databaseClient.executeQuery(query, [
        token.deviceType,
        token.deviceModel,
        token.osVersion,
        token.isActive,
        existingToken.id
      ]);
      
      return result.rows[0] as DeviceToken;
    } else {
      // 创建新令牌
      const query = `
        INSERT INTO device_tokens (id, user_id, device_token, device_type, device_model, os_version, is_active, created_at, updated_at)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, user_id as userId, device_token as deviceToken, device_type as deviceType, device_model as deviceModel, os_version as osVersion, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      `;
      
      const result = await this.databaseClient.executeQuery(query, [
        token.userId,
        token.deviceToken,
        token.deviceType,
        token.deviceModel,
        token.osVersion,
        token.isActive
      ]);
      
      return result.rows[0] as DeviceToken;
    }
  }

  /**
   * 根据用户ID和设备令牌查找
   */
  async findByUserIdAndDeviceToken(userId: string, deviceToken: string): Promise<DeviceToken | null> {
    const query = `
      SELECT id, user_id as userId, device_token as deviceToken, device_type as deviceType, device_model as deviceModel, os_version as osVersion, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM device_tokens
      WHERE user_id = $1 AND device_token = $2
    `;
    
    const result = await this.databaseClient.executeQuery(query, [userId, deviceToken]);
    return result.rows.length > 0 ? (result.rows[0] as DeviceToken) : null;
  }

  /**
   * 根据用户ID查找设备令牌列表
   */
  async findByUserId(userId: string): Promise<DeviceToken[]> {
    const query = `
      SELECT id, user_id as userId, device_token as deviceToken, device_type as deviceType, device_model as deviceModel, os_version as osVersion, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM device_tokens
      WHERE user_id = $1 AND is_active = true
      ORDER BY updated_at DESC
    `;
    
    const result = await this.databaseClient.executeQuery(query, [userId]);
    return result.rows as DeviceToken[];
  }

  /**
   * 根据设备令牌查找
   */
  async findByToken(deviceToken: string): Promise<DeviceToken | null> {
    const query = `
      SELECT id, user_id as userId, device_token as deviceToken, device_type as deviceType, device_model as deviceModel, os_version as osVersion, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM device_tokens
      WHERE device_token = $1
    `;
    
    const result = await this.databaseClient.executeQuery(query, [deviceToken]);
    return result.rows.length > 0 ? (result.rows[0] as DeviceToken) : null;
  }

  /**
   * 根据用户ID列表查找设备令牌
   */
  async findByUserIds(userIds: string[]): Promise<DeviceToken[]> {
    const query = `
      SELECT id, user_id as userId, device_token as deviceToken, device_type as deviceType, device_model as deviceModel, os_version as osVersion, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM device_tokens
      WHERE user_id = ANY($1::uuid[]) AND is_active = true
    `;
    
    const result = await this.databaseClient.executeQuery(query, [userIds]);
    return result.rows as DeviceToken[];
  }

  /**
   * 删除设备令牌
   */
  async delete(id: string): Promise<void> {
    const query = `
      DELETE FROM device_tokens
      WHERE id = $1
    `;
    
    await this.databaseClient.executeQuery(query, [id]);
  }

  /**
   * 标记设备令牌为无效
   */
  async markAsInvalid(deviceToken: string): Promise<void> {
    const query = `
      UPDATE device_tokens
      SET is_active = false, updated_at = NOW()
      WHERE device_token = $1
    `;
    
    await this.databaseClient.executeQuery(query, [deviceToken]);
  }
}
```

#### 4.6 APNs控制器

```typescript
// src/apple/apns/APNsController.ts

import { Request, Response } from 'express';
import { APNsService } from './APNsService';
import { DeviceTokenRepository } from '../repository/DeviceTokenRepository';
import { PushNotificationRequest, DeviceToken } from '../types/APNsTypes';
import { Logger } from '../../infrastructure/logger/Logger';
import { authenticateMiddleware } from '../../infrastructure/security/AuthenticateMiddleware';

/**
 * APNs控制器
 */
export class APNsController {
  private readonly apnsService: APNsService;
  private readonly deviceTokenRepository: DeviceTokenRepository;
  private readonly logger: Logger;

  /**
   * 创建APNs控制器实例
   * @param apnsService APNs服务
   * @param deviceTokenRepository 设备令牌仓库
   * @param logger 日志记录器
   */
  constructor(
    apnsService: APNsService,
    deviceTokenRepository: DeviceTokenRepository,
    logger: Logger
  ) {
    this.apnsService = apnsService;
    this.deviceTokenRepository = deviceTokenRepository;
    this.logger = logger;
  }

  /**
   * 注册设备令牌
   */
  async registerToken(req: Request, res: Response): Promise<void> {
    try {
      const { deviceToken, deviceType, deviceModel, osVersion } = req.body as {
        deviceToken: string;
        deviceType: string;
        deviceModel?: string;
        osVersion?: string;
      };
      
      // 获取当前用户ID（从认证中间件设置）
      const userId = (req as any).userId;
      
      // 保存设备令牌
      const token = await this.deviceTokenRepository.save({
        id: '', // 由数据库生成
        userId,
        deviceToken,
        deviceType,
        deviceModel,
        osVersion,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.status(200).json({
        success: true,
        data: token
      });
    } catch (error) {
      this.logger.logError('Failed to register device token', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to register device token',
        error: (error as Error).message
      });
    }
  }

  /**
   * 删除设备令牌
   */
  async deleteToken(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.deviceTokenRepository.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Device token deleted successfully'
      });
    } catch (error) {
      this.logger.logError('Failed to delete device token', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete device token',
        error: (error as Error).message
      });
    }
  }

  /**
   * 发送推送通知
   */
  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, deviceToken, payload, options } = req.body as PushNotificationRequest;
      
      let result;
      
      if (deviceToken) {
        // 向特定设备发送通知
        result = await this.apnsService.sendNotification(deviceToken, payload, options);
        res.status(200).json({
          success: true,
          data: result
        });
      } else if (userId) {
        // 向特定用户发送通知
        result = await this.apnsService.sendNotificationToUser(userId, payload, options);
        res.status(200).json({
          success: true,
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Either userId or deviceToken is required'
        });
      }
    } catch (error) {
      this.logger.logError('Failed to send notification', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: (error as Error).message
      });
    }
  }

  /**
   * 批量发送推送通知
   */
  async sendBatchNotifications(req: Request, res: Response): Promise<void> {
    try {
      const notifications = req.body as Array<{
        deviceToken: string;
        payload: any;
        options?: any;
      }>;
      
      const result = await this.apnsService.sendBatchNotifications(notifications);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      this.logger.logError('Failed to send batch notifications', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to send batch notifications',
        error: (error as Error).message
      });
    }
  }

  /**
   * 获取用户设备令牌列表
   */
  async getUserTokens(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      
      const tokens = await this.deviceTokenRepository.findByUserId(userId);
      
      res.status(200).json({
        success: true,
        data: tokens
      });
    } catch (error) {
      this.logger.logError('Failed to get user device tokens', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user device tokens',
        error: (error as Error).message
      });
    }
  }
}
```

### 5. 数据库表结构

```sql
-- 设备令牌表
CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_token VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, device_token)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(device_token);
CREATE INDEX IF NOT EXISTS idx_device_tokens_active ON device_tokens(is_active);
```

### 6. API接口设计

| 接口路径 | 方法 | 描述 | 请求体 | 响应体 | 权限 |
|----------|------|------|--------|--------|------|
| `/api/v1/apns/tokens` | POST | 注册设备令牌 | `{ deviceToken: string, deviceType: string, deviceModel?: string, osVersion?: string }` | `{ success: boolean, data: DeviceToken }` | 已认证用户 |
| `/api/v1/apns/tokens/:id` | DELETE | 删除设备令牌 | N/A | `{ success: boolean, message: string }` | 已认证用户 |
| `/api/v1/apns/tokens` | GET | 获取用户设备令牌列表 | N/A | `{ success: boolean, data: DeviceToken[] }` | 已认证用户 |
| `/api/v1/apns/notifications` | POST | 发送推送通知 | `{ userId?: string, deviceToken?: string, payload: APNsPayload, options?: APNsOptions }` | `{ success: boolean, data: APNsResponse | APNsBatchResponse }` | 管理员或系统服务 |
| `/api/v1/apns/notifications/batch` | POST | 批量发送推送通知 | `[{ deviceToken: string, payload: APNsPayload, options?: APNsOptions }]` | `{ success: boolean, data: APNsBatchResponse }` | 管理员或系统服务 |

### 7. 配置管理

```typescript
// 环境变量配置
APNs_KEY_ID=YOUR_APNS_KEY_ID
APNs_TEAM_ID=YOUR_TEAM_ID
APNs_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
YOUR_APNS_PRIVATE_KEY
-----END PRIVATE KEY-----
APNs_BUNDLE_ID=com.example.app
APNs_ENV=development
APNs_SERVER=api.development.push.apple.com:443
```

### 8. 测试策略

#### 8.1 单元测试

```typescript
// src/apple/apns/APNsServiceImpl.test.ts

describe('APNsServiceImpl', () => {
  let service: APNsServiceImpl;
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let mockDeviceTokenRepository: jest.Mocked<DeviceTokenRepository>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockConfigManager = {
      get: jest.fn().mockImplementation((key: string) => {
        const configs: Record<string, any> = {
          'APNs_ENV': 'development',
          'APNs_KEY_ID': 'TEST_KEY_ID',
          'APNs_TEAM_ID': 'TEST_TEAM_ID',
          'APNs_PRIVATE_KEY': '-----BEGIN PRIVATE KEY-----
MIIE...
-----END PRIVATE KEY-----',
          'APNs_BUNDLE_ID': 'com.example.app'
        };
        return configs[key] || '';
      })
    } as unknown as jest.Mocked<ConfigManager>;

    mockDeviceTokenRepository = {
      save: jest.fn(),
      findByUserIdAndDeviceToken: jest.fn(),
      findByUserId: jest.fn().mockResolvedValue([]),
      findByToken: jest.fn().mockResolvedValue({
        id: 'test-token-id',
        userId: 'test-user-id',
        deviceToken: '00fc13adff785122b4ad28809a3420982341241421348097878e577c991de8f0',
        deviceType: 'ios',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as DeviceToken),
      findByUserIds: jest.fn(),
      delete: jest.fn(),
      markAsInvalid: jest.fn()
    } as unknown as jest.Mocked<DeviceTokenRepository>;

    mockLogger = {
      logInfo: jest.fn(),
      logError: jest.fn(),
      logWarning: jest.fn(),
      logDebug: jest.fn()
    } as unknown as jest.Mocked<Logger>;

    service = new APNsServiceImpl(
      mockConfigManager,
      mockDeviceTokenRepository,
      mockLogger
    );
  });

  describe('verifyDeviceToken', () => {
    it('should return true for valid device token', async () => {
      const validToken = '00fc13adff785122b4ad28809a3420982341241421348097878e577c991de8f0';
      const result = await service.verifyDeviceToken(validToken);
      expect(result).toBe(true);
    });

    it('should return false for invalid device token format', async () => {
      const invalidToken = 'invalid-token';
      const result = await service.verifyDeviceToken(invalidToken);
      expect(result).toBe(false);
    });
  });

  describe('sendNotificationToUser', () => {
    it('should return empty results when no device tokens found', async () => {
      mockDeviceTokenRepository.findByUserId.mockResolvedValue([]);
      
      const result = await service.sendNotificationToUser('test-user-id', {
        aps: {
          alert: 'Test notification'
        }
      });
      
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });
});
```

#### 8.2 集成测试

```typescript
// src/apple/apns/APNsController.integration.test.ts

describe('APNsController Integration', () => {
  let app: Express;
  let mockAPNsService: jest.Mocked<APNsService>;
  let mockDeviceTokenRepository: jest.Mocked<DeviceTokenRepository>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // 初始化mocks
    mockAPNsService = {
      sendNotification: jest.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
      sendBatchNotifications: jest.fn().mockResolvedValue({
        successCount: 1,
        failureCount: 0,
        results: [{ deviceToken: 'test-token', response: { success: true, messageId: 'test-message-id' } }]
      }),
      sendNotificationToUser: jest.fn().mockResolvedValue({
        successCount: 1,
        failureCount: 0,
        results: [{ deviceToken: 'test-token', response: { success: true, messageId: 'test-message-id' } }]
      }),
      verifyDeviceToken: jest.fn().mockResolvedValue(true)
    } as unknown as jest.Mocked<APNsService>;

    mockDeviceTokenRepository = {
      save: jest.fn().mockResolvedValue({
        id: 'test-token-id',
        userId: 'test-user-id',
        deviceToken: 'test-token',
        deviceType: 'ios',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as DeviceToken),
      findByUserIdAndDeviceToken: jest.fn(),
      findByUserId: jest.fn().mockResolvedValue([{
        id: 'test-token-id',
        userId: 'test-user-id',
        deviceToken: 'test-token',
        deviceType: 'ios',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as DeviceToken]),
      findByToken: jest.fn(),
      findByUserIds: jest.fn(),
      delete: jest.fn(),
      markAsInvalid: jest.fn()
    } as unknown as jest.Mocked<DeviceTokenRepository>;

    mockLogger = {
      logInfo: jest.fn(),
      logError: jest.fn(),
      logWarning: jest.fn(),
      logDebug: jest.fn()
    } as unknown as jest.Mocked<Logger>;

    // 创建控制器
    const controller = new APNsController(
      mockAPNsService,
      mockDeviceTokenRepository,
      mockLogger
    );

    // 设置Express应用
    app = express();
    app.use(express.json());
    
    // 模拟认证中间件
    const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
      (req as any).userId = 'test-user-id';
      next();
    };
    
    app.post('/api/v1/apns/tokens', mockAuthMiddleware, controller.registerToken.bind(controller));
    app.delete('/api/v1/apns/tokens/:id', mockAuthMiddleware, controller.deleteToken.bind(controller));
    app.get('/api/v1/apns/tokens', mockAuthMiddleware, controller.getUserTokens.bind(controller));
    app.post('/api/v1/apns/notifications', mockAuthMiddleware, controller.sendNotification.bind(controller));
    app.post('/api/v1/apns/notifications/batch', mockAuthMiddleware, controller.sendBatchNotifications.bind(controller));
  });

  describe('POST /api/v1/apns/tokens', () => {
    it('should register device token successfully', async () => {
      const response = await request(app)
        .post('/api/v1/apns/tokens')
        .send({
          deviceToken: 'test-token',
          deviceType: 'ios',
          deviceModel: 'iPhone 14',
          osVersion: 'iOS 17.0'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.deviceToken).toBe('test-token');
    });
  });

  describe('GET /api/v1/apns/tokens', () => {
    it('should get user device tokens successfully', async () => {
      const response = await request(app)
        .get('/api/v1/apns/tokens')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
```

### 9. 安全考虑

1. **使用HTTPS**：所有与APNs服务器和客户端的通信必须使用HTTPS
2. **保护私钥**：APNs私钥必须安全存储，建议使用环境变量或密钥管理服务
3. **验证设备令牌**：必须验证设备令牌的格式和有效性
4. **限制API访问**：推送通知发送API必须限制为管理员或系统服务访问
5. **监控异常推送**：监控异常推送行为，如大量失败的推送尝试
6. **定期轮换密钥**：定期轮换APNs私钥，提高安全性

### 10. 部署与运维

1. **环境变量配置**：在不同环境（开发、测试、生产）中配置相应的APNs参数
2. **日志记录**：记录推送通知发送结果和设备令牌管理事件，便于调试和监控
3. **监控指标**：监控推送成功率、失败率、响应时间等指标
4. **定期清理**：定期清理无效或过期的设备令牌
5. **灾难恢复**：制定灾难恢复计划，确保在发生故障时能够快速恢复服务
6. **灰度发布**：支持灰度发布推送通知，降低风险

### 11. 总结

APNs技术实现采用了模块化设计，将推送通知逻辑分为多个层次，遵循了Clean Architecture原则。实现包括：

1. **完整的APNs功能**：支持单设备推送、批量推送和用户定向推送
2. **设备令牌管理**：实现了设备令牌的注册、查询和失效处理
3. **安全可靠**：实现了完善的安全措施，保护APNs私钥和设备令牌
4. **易于集成**：提供了简洁的API接口，便于iOS客户端和内部服务调用
5. **可测试性**：包含单元测试和集成测试，确保功能正确性
6. **可维护性**：采用模块化设计，便于维护和扩展

该实现为iOS用户提供了可靠、高效的推送通知服务，能够及时向用户发送系统生成的认知反馈和思考方向，提升用户体验。