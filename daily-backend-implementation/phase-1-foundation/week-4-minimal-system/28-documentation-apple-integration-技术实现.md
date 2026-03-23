# Day 28: 第一阶段 - 系统地基期 - Week 4 - 第28天 苹果后端集成技术实现

## 苹果后端集成实现

### 1. 系统架构概述

苹果后端集成采用 Clean Architecture 设计原则，将苹果相关功能作为独立模块添加到现有系统中，保持与现有架构的一致性。集成模块包括苹果认证（Sign in with Apple）和苹果推送通知服务（APNs），为iOS客户端提供完整的后端支持。

### 2. 核心目录结构

```typescript
// 苹果后端集成核心目录结构
/src
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
│   │   ├── PostgreSQLAppleAuthRepository.ts # 苹果认证PostgreSQL实现
│   │   ├── DeviceTokenRepository.ts   # 设备令牌仓库接口
│   │   └── PostgreSQLDeviceTokenRepository.ts # 设备令牌PostgreSQL实现
│   └── types/                  # 苹果相关类型定义
│       ├── AppleAuthTypes.ts          # 苹果认证类型
│       └── APNsTypes.ts               # APNs类型
├── config/                     # 配置管理
├── domain/                     # 领域层
├── infrastructure/             # 基础设施层
└── presentation/               # 表示层
```

### 3. 苹果认证实现

#### 3.1 苹果认证服务接口

```typescript
// src/apple/authentication/AppleAuthService.ts

import { AppleIdTokenPayload, AppleTokenResponse } from '../types/AppleAuthTypes';

/**
 * 苹果认证服务接口
 */
export interface AppleAuthService {
  /**
   * 生成Apple认证URL
   * @param state 状态参数，用于防止CSRF攻击
   * @returns 认证URL和状态参数
   */
  generateAuthUrl(state: string): Promise<{ authorizationUrl: string; state: string }>;

  /**
   * 交换授权码获取访问令牌和ID令牌
   * @param code 授权码
   * @returns 令牌响应
   */
  exchangeCodeForToken(code: string): Promise<AppleTokenResponse>;

  /**
   * 验证Apple ID令牌
   * @param idToken Apple ID令牌
   * @param nonce 随机数，用于防止重放攻击
   * @returns ID令牌载荷
   */
  verifyIdToken(idToken: string, nonce?: string): Promise<AppleIdTokenPayload>;

  /**
   * 生成Apple客户端密钥
   * @returns 客户端密钥
   */
  generateClientSecret(): string;

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 新的令牌响应
   */
  refreshAccessToken(refreshToken: string): Promise<AppleTokenResponse>;
}
```

#### 3.2 苹果认证服务实现

```typescript
// src/apple/authentication/AppleAuthServiceImpl.ts

import { AppleAuthService } from './AppleAuthService';
import { AppleIdTokenPayload, AppleTokenResponse } from '../types/AppleAuthTypes';
import { ConfigManager } from '../../infrastructure/config/ConfigManager';
import { HttpClient } from '../../infrastructure/http/HttpClient';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import axios from 'axios';

/**
 * 苹果认证服务实现
 */
export class AppleAuthServiceImpl implements AppleAuthService {
  private readonly configManager: ConfigManager;
  private readonly httpClient: HttpClient;

  /**
   * 创建苹果认证服务实例
   * @param configManager 配置管理器
   * @param httpClient HTTP客户端
   */
  constructor(configManager: ConfigManager, httpClient: HttpClient) {
    this.configManager = configManager;
    this.httpClient = httpClient;
  }

  /**
   * 生成Apple认证URL
   */
  async generateAuthUrl(state: string): Promise<{ authorizationUrl: string; state: string }> {
    const clientId = this.configManager.get<string>('APPLE_CLIENT_ID');
    const redirectUri = this.configManager.get<string>('APPLE_REDIRECT_URI');
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      scope: 'email name',
      response_mode: 'form_post'
    });
    
    const authorizationUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
    
    return { authorizationUrl, state };
  }

  /**
   * 交换授权码获取访问令牌和ID令牌
   */
  async exchangeCodeForToken(code: string): Promise<AppleTokenResponse> {
    const url = 'https://appleid.apple.com/auth/token';
    const clientId = this.configManager.get<string>('APPLE_CLIENT_ID');
    const clientSecret = this.generateClientSecret();
    
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: this.configManager.get<string>('APPLE_REDIRECT_URI')
    });
    
    const response = await axios.post<AppleTokenResponse>(url, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    return response.data;
  }

  /**
   * 验证Apple ID令牌
   */
  async verifyIdToken(idToken: string, nonce?: string): Promise<AppleIdTokenPayload> {
    try {
      // 获取Apple公钥
      const publicKeysResponse = await axios.get('https://appleid.apple.com/auth/keys');
      const publicKeys = publicKeysResponse.data.keys;
      
      // 解码ID令牌头
      const header = JSON.parse(Buffer.from(idToken.split('.')[0], 'base64').toString());
      
      // 查找对应的公钥
      const publicKey = publicKeys.find((key: any) => key.kid === header.kid && key.alg === header.alg);
      if (!publicKey) {
        throw new Error('Invalid Apple ID token: no matching public key found');
      }
      
      // 构建公钥
      const jwk = {
        kty: publicKey.kty,
        crv: publicKey.crv,
        x: publicKey.x,
        y: publicKey.y
      };
      
      // 使用jsonwebtoken库验证ID令牌
      const payload = jwt.verify(idToken, jwk, {
        algorithms: ['ES256'],
        audience: this.configManager.get<string>('APPLE_CLIENT_ID'),
        issuer: 'https://appleid.apple.com'
      }) as AppleIdTokenPayload;
      
      // 验证nonce（如果提供）
      if (nonce && payload.nonce !== nonce) {
        throw new Error('Invalid Apple ID token: nonce mismatch');
      }
      
      return payload;
    } catch (error) {
      throw new Error(`Failed to verify Apple ID token: ${(error as Error).message}`);
    }
  }

  /**
   * 生成Apple客户端密钥
   */
  generateClientSecret(): string {
    const teamId = this.configManager.get<string>('APPLE_TEAM_ID');
    const clientId = this.configManager.get<string>('APPLE_CLIENT_ID');
    const keyId = this.configManager.get<string>('APPLE_KEY_ID');
    const privateKey = this.configManager.get<string>('APPLE_PRIVATE_KEY').replace(/\\n/g, '\n');
    
    const now = Math.floor(Date.now() / 1000);
    const expires = now + 3600 * 24 * 180; // 6个月有效期
    
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

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(refreshToken: string): Promise<AppleTokenResponse> {
    const url = 'https://appleid.apple.com/auth/token';
    const clientId = this.configManager.get<string>('APPLE_CLIENT_ID');
    const clientSecret = this.generateClientSecret();
    
    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    });
    
    const response = await axios.post<AppleTokenResponse>(url, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    return response.data;
  }
}
```

### 4. APNs实现

#### 4.1 APNs服务接口

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
   * 验证设备令牌
   * @param deviceToken 设备令牌
   * @returns 验证结果
   */
  verifyDeviceToken(deviceToken: string): Promise<boolean>;
}
```

#### 4.2 APNs服务实现

```typescript
// src/apple/apns/APNsServiceImpl.ts

import { APNsService } from './APNsService';
import { APNsPayload, APNsResponse, APNsBatchResponse, APNsOptions } from '../types/APNsTypes';
import { ConfigManager } from '../../infrastructure/config/ConfigManager';
import * as apn from 'apn';
import * as uuidv4 from 'uuid';

/**
 * APNs服务实现
 */
export class APNsServiceImpl implements APNsService {
  private readonly configManager: ConfigManager;
  private readonly apnProvider: apn.Provider;

  /**
   * 创建APNs服务实例
   * @param configManager 配置管理器
   */
  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    
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
   * 验证设备令牌
   */
  async verifyDeviceToken(deviceToken: string): Promise<boolean> {
    // 简单验证设备令牌格式
    return /^[0-9a-f]{64}$/i.test(deviceToken);
  }
}
```

### 5. 设备令牌管理实现

#### 5.1 设备令牌仓库接口

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

#### 5.2 设备令牌PostgreSQL实现

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

### 6. 数据库表结构

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

-- 苹果认证表
CREATE TABLE IF NOT EXISTS apple_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    apple_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    full_name JSONB,
    identity_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (apple_user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(device_token);
CREATE INDEX IF NOT EXISTS idx_apple_auth_user_id ON apple_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_apple_auth_apple_user_id ON apple_auth(apple_user_id);
```

### 7. 配置管理

```typescript
// src/config/ConfigManager.ts 扩展

/**
 * 配置管理器
 */
export class ConfigManager {
  // 现有代码...

  /**
   * 获取苹果认证配置
   * @returns 苹果认证配置
   */
  getAppleAuthConfig(): AppleAuthConfig {
    return {
      clientId: this.get<string>('APPLE_CLIENT_ID'),
      teamId: this.get<string>('APPLE_TEAM_ID'),
      keyId: this.get<string>('APPLE_KEY_ID'),
      privateKey: this.get<string>('APPLE_PRIVATE_KEY'),
      redirectUris: this.get<string[]>('APPLE_REDIRECT_URIS'),
      scopes: this.get<string[]>('APPLE_SCOPES'),
      responseType: this.get<string>('APPLE_RESPONSE_TYPE'),
      responseMode: this.get<string>('APPLE_RESPONSE_MODE')
    };
  }

  /**
   * 获取APNs配置
   * @returns APNs配置
   */
  getAPNsConfig(): APNsConfig {
    return {
      teamId: this.get<string>('APNs_TEAM_ID'),
      keyId: this.get<string>('APNs_KEY_ID'),
      privateKey: this.get<string>('APNs_PRIVATE_KEY'),
      bundleId: this.get<string>('APNs_BUNDLE_ID'),
      environment: this.get<string>('APNs_ENV') as 'development' | 'production',
      server: this.get<string>('APNs_SERVER')
    };
  }
}

/**
 * 苹果认证配置
 */
export interface AppleAuthConfig {
  clientId: string;
  teamId: string;
  keyId: string;
  privateKey: string;
  redirectUris: string[];
  scopes: string[];
  responseType: string;
  responseMode: string;
}

/**
 * APNs配置
 */
export interface APNsConfig {
  teamId: string;
  keyId: string;
  privateKey: string;
  bundleId: string;
  environment: 'development' | 'production';
  server: string;
}
```

### 8. 类型定义

```typescript
// src/apple/types/AppleAuthTypes.ts

/**
 * Apple认证请求参数
 */
export interface AppleAuthRequest {
  code: string;
  state?: string;
  id_token?: string;
  user?: AppleUserInfo;
}

/**
 * Apple用户信息
 */
export interface AppleUserInfo {
  name?: {
    firstName?: string;
    lastName?: string;
  };
  email?: string;
}

/**
 * Apple令牌响应
 */
export interface AppleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  id_token: string;
}

/**
 * Apple ID令牌载荷
 */
export interface AppleIdTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email?: string;
  email_verified?: string;
  is_private_email?: string;
  auth_time?: number;
  nonce?: string;
  nonce_supported?: boolean;
  c_hash?: string;
  at_hash?: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
}

/**
 * Apple认证用户
 */
export interface AppleAuthUser {
  id: string;
  userId: string;
  appleUserId: string;
  email?: string;
  fullName?: {
    firstName?: string;
    lastName?: string;
  };
  identityToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
```

### 9. 集成到现有系统

#### 9.1 依赖注入配置

```typescript
// src/infrastructure/dependency/DependencyContainer.ts 扩展

import { container } from 'tsyringe';
import { AppleAuthService } from '../../apple/authentication/AppleAuthService';
import { AppleAuthServiceImpl } from '../../apple/authentication/AppleAuthServiceImpl';
import { APNsService } from '../../apple/apns/APNsService';
import { APNsServiceImpl } from '../../apple/apns/APNsServiceImpl';
import { DeviceTokenRepository } from '../../apple/repository/DeviceTokenRepository';
import { PostgreSQLDeviceTokenRepository } from '../../apple/repository/PostgreSQLDeviceTokenRepository';
import { AppleAuthRepository } from '../../apple/repository/AppleAuthRepository';
import { PostgreSQLAppleAuthRepository } from '../../apple/repository/PostgreSQLAppleAuthRepository';

// 注册苹果认证服务
container.registerSingleton<AppleAuthService>(AppleAuthServiceImpl);

// 注册APNs服务
container.registerSingleton<APNsService>(APNsServiceImpl);

// 注册设备令牌仓库
container.register<DeviceTokenRepository>(DeviceTokenRepository, { useClass: PostgreSQLDeviceTokenRepository });

// 注册苹果认证仓库
container.register<AppleAuthRepository>(AppleAuthRepository, { useClass: PostgreSQLAppleAuthRepository });
```

#### 9.2 API路由配置

```typescript
// src/presentation/ExpressApp.ts 扩展

import { AppleAuthController } from '../apple/authentication/AppleAuthController';
import { APNsController } from '../apple/apns/APNsController';

// 注册苹果认证路由
const appleAuthController = container.resolve(AppleAuthController);
app.get('/api/v1/auth/apple/url', appleAuthController.getAuthUrl.bind(appleAuthController));
app.post('/api/v1/auth/apple/callback', appleAuthController.handleCallback.bind(appleAuthController));
app.post('/api/v1/auth/apple/login', appleAuthController.loginWithIdToken.bind(appleAuthController));

// 注册APNs路由
const apnsController = container.resolve(APNsController);
app.post('/api/v1/apns/tokens', authenticateMiddleware, apnsController.registerToken.bind(apnsController));
app.delete('/api/v1/apns/tokens/:id', authenticateMiddleware, apnsController.deleteToken.bind(apnsController));
app.post('/api/v1/apns/notifications', authenticateMiddleware, apnsController.sendNotification.bind(apnsController));
app.post('/api/v1/apns/notifications/batch', authenticateMiddleware, apnsController.sendBatchNotifications.bind(apnsController));
```

### 10. 测试策略

#### 10.1 单元测试

```typescript
// src/apple/authentication/AppleAuthServiceImpl.test.ts

describe('AppleAuthServiceImpl', () => {
  let service: AppleAuthServiceImpl;
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockConfigManager = {
      get: jest.fn().mockImplementation((key: string) => {
        const configs: Record<string, any> = {
          'APPLE_CLIENT_ID': 'com.example.app',
          'APPLE_TEAM_ID': 'TEAM123',
          'APPLE_KEY_ID': 'KEY123',
          'APPLE_PRIVATE_KEY': '-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----',
          'APPLE_REDIRECT_URI': 'https://example.com/auth/apple/callback'
        };
        return configs[key] || '';
      })
    } as unknown as jest.Mocked<ConfigManager>;

    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    } as unknown as jest.Mocked<HttpClient>;

    service = new AppleAuthServiceImpl(mockConfigManager, mockHttpClient);
  });

  describe('generateAuthUrl', () => {
    it('should generate correct auth URL', async () => {
      const state = 'test-state-123';
      const result = await service.generateAuthUrl(state);
      
      expect(result.authorizationUrl).toContain('appleid.apple.com/auth/authorize');
      expect(result.authorizationUrl).toContain('client_id=com.example.app');
      expect(result.authorizationUrl).toContain(`state=${state}`);
      expect(result.state).toBe(state);
    });
  });

  // 其他测试用例...
});
```

#### 10.2 集成测试

```typescript
// src/apple/apns/APNsServiceImpl.integration.test.ts

describe('APNsServiceImpl Integration', () => {
  let service: APNsServiceImpl;
  let mockConfigManager: jest.Mocked<ConfigManager>;

  beforeEach(() => {
    mockConfigManager = {
      get: jest.fn().mockImplementation((key: string) => {
        const configs: Record<string, any> = {
          'APNs_ENV': 'development',
          'APNs_KEY_ID': 'TEST_KEY_ID',
          'APNs_TEAM_ID': 'TEST_TEAM_ID',
          'APNs_PRIVATE_KEY': '-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----',
          'APNs_BUNDLE_ID': 'com.example.app'
        };
        return configs[key] || '';
      })
    } as unknown as jest.Mocked<ConfigManager>;

    service = new APNsServiceImpl(mockConfigManager);
  });

  describe('verifyDeviceToken', () => {
    it('should return true for valid device token', async () => {
      const validToken = '00fc13adff785122b4ad28809a3420982341241421348097878e577c991de8f0';
      const result = await service.verifyDeviceToken(validToken);
      expect(result).toBe(true);
    });

    it('should return false for invalid device token', async () => {
      const invalidToken = 'invalid-token';
      const result = await service.verifyDeviceToken(invalidToken);
      expect(result).toBe(false);
    });
  });

  // 其他测试用例...
});
```

### 11. 部署与运维

#### 11.1 环境变量配置

```env
# 苹果认证配置
APPLE_CLIENT_ID=com.example.app
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY
-----END PRIVATE KEY-----
APPLE_REDIRECT_URI=https://example.com/api/v1/auth/apple/callback
APPLE_SCOPES=email,name
APPLE_RESPONSE_TYPE=code
APPLE_RESPONSE_MODE=form_post

# APNs配置
APNs_KEY_ID=YOUR_APNS_KEY_ID
APNs_TEAM_ID=YOUR_TEAM_ID
APNs_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
YOUR_APNS_PRIVATE_KEY
-----END PRIVATE KEY-----
APNs_BUNDLE_ID=com.example.app
APNs_ENV=development
APNs_SERVER=api.development.push.apple.com:443
```

#### 11.2 监控与日志

```typescript
// 添加APNs发送结果日志
async sendNotification(
  deviceToken: string,
  payload: APNsPayload,
  options?: APNsOptions
): Promise<APNsResponse> {
  try {
    // 发送通知逻辑...
    
    if (result.success) {
      this.logger.logInfo('APNs notification sent successfully', {
        deviceToken,
        messageId: result.messageId,
        payload: JSON.stringify(payload)
      });
    } else {
      this.logger.logError('APNs notification failed', {
        deviceToken,
        error: result.error,
        payload: JSON.stringify(payload)
      });
    }
    
    return result;
  } catch (error) {
    this.logger.logError('APNs notification exception', {
      deviceToken,
      error: (error as Error).message,
      payload: JSON.stringify(payload)
    });
    
    throw error;
  }
}
```

### 12. 总结

苹果后端集成实现采用了模块化设计，将苹果认证和APNs功能作为独立模块添加到现有系统中，保持了与原有Clean Architecture的一致性。实现包括：

1. **苹果认证模块**：完整实现了Sign in with Apple流程，包括授权码流程和ID令牌直接登录
2. **APNs模块**：实现了推送通知发送、设备令牌管理和批量发送功能
3. **数据库支持**：创建了设备令牌表和苹果认证表，支持PostgreSQL数据库
4. **API接口**：提供了完整的RESTful API，支持iOS客户端集成
5. **测试支持**：包含单元测试和集成测试，确保功能正确性
6. **监控与日志**：实现了完善的日志记录，便于监控和调试

该实现遵循了高内聚、低耦合的设计原则，便于维护和扩展，能够为iOS客户端提供可靠的后端支持。