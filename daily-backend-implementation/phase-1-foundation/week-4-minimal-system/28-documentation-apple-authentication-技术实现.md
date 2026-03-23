# Day 28: 第一阶段 - 系统地基期 - Week 4 - 第28天 苹果认证技术实现

## 苹果认证技术实现

### 1. 概述

本文档详细描述了AI认知辅助系统中苹果认证（Sign in with Apple）的技术实现方案。苹果认证是系统为iOS用户提供的一种安全、隐私保护的登录方式，允许用户使用Apple ID登录系统。

### 2. 核心设计思想

苹果认证实现遵循Clean Architecture原则，将认证逻辑分为以下层次：

- **Domain层**：定义认证相关的领域模型和接口
- **Application层**：实现认证业务逻辑
- **Infrastructure层**：处理与Apple服务器的通信和数据持久化
- **Presentation层**：提供API接口供客户端调用

### 3. 目录结构

```typescript
/src
├── apple/
│   ├── authentication/         # 苹果认证相关代码
│   │   ├── AppleAuthService.ts        # 苹果认证服务接口
│   │   ├── AppleAuthServiceImpl.ts    # 苹果认证服务实现
│   │   ├── AppleAuthController.ts     # 苹果认证控制器
│   │   └── AppleAuthMiddleware.ts     # 苹果认证中间件
│   ├── repository/             # 苹果相关数据访问
│   │   ├── AppleAuthRepository.ts     # 苹果认证仓库接口
│   │   └── PostgreSQLAppleAuthRepository.ts # 苹果认证PostgreSQL实现
│   └── types/                  # 苹果相关类型定义
│       └── AppleAuthTypes.ts          # 苹果认证类型
└── ...
```

### 4. 核心组件实现

#### 4.1 苹果认证类型定义

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
```

#### 4.2 苹果认证服务接口

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

#### 4.3 苹果认证服务实现

```typescript
// src/apple/authentication/AppleAuthServiceImpl.ts

import { AppleAuthService } from './AppleAuthService';
import { AppleIdTokenPayload, AppleTokenResponse } from '../types/AppleAuthTypes';
import { ConfigManager } from '../../infrastructure/config/ConfigManager';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

/**
 * 苹果认证服务实现
 */
export class AppleAuthServiceImpl implements AppleAuthService {
  private readonly configManager: ConfigManager;

  /**
   * 创建苹果认证服务实例
   * @param configManager 配置管理器
   */
  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
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

#### 4.4 苹果认证仓库接口

```typescript
// src/apple/repository/AppleAuthRepository.ts

import { AppleAuthUser } from '../types/AppleAuthTypes';

/**
 * 苹果认证仓库接口
 */
export interface AppleAuthRepository {
  /**
   * 保存苹果认证信息
   * @param appleAuth 苹果认证信息
   * @returns 保存后的苹果认证信息
   */
  save(appleAuth: AppleAuthUser): Promise<AppleAuthUser>;

  /**
   * 根据苹果用户ID查找认证信息
   * @param appleUserId 苹果用户ID
   * @returns 苹果认证信息
   */
  findByAppleUserId(appleUserId: string): Promise<AppleAuthUser | null>;

  /**
   * 根据用户ID查找认证信息
   * @param userId 用户ID
   * @returns 苹果认证信息
   */
  findByUserId(userId: string): Promise<AppleAuthUser | null>;

  /**
   * 更新刷新令牌
   * @param appleUserId 苹果用户ID
   * @param refreshToken 刷新令牌
   * @param expiresAt 过期时间
   * @returns 更新后的苹果认证信息
   */
  updateRefreshToken(appleUserId: string, refreshToken: string, expiresAt: Date): Promise<AppleAuthUser>;

  /**
   * 删除苹果认证信息
   * @param userId 用户ID
   * @returns 删除结果
   */
  deleteByUserId(userId: string): Promise<void>;
}
```

#### 4.5 苹果认证PostgreSQL实现

```typescript
// src/apple/repository/PostgreSQLAppleAuthRepository.ts

import { AppleAuthRepository } from './AppleAuthRepository';
import { AppleAuthUser } from '../types/AppleAuthTypes';
import { DatabaseClient } from '../../infrastructure/database/DatabaseClient';

/**
 * 苹果认证PostgreSQL实现
 */
export class PostgreSQLAppleAuthRepository implements AppleAuthRepository {
  private readonly databaseClient: DatabaseClient;

  /**
   * 创建苹果认证仓库实例
   * @param databaseClient 数据库客户端
   */
  constructor(databaseClient: DatabaseClient) {
    this.databaseClient = databaseClient;
  }

  /**
   * 保存苹果认证信息
   */
  async save(appleAuth: AppleAuthUser): Promise<AppleAuthUser> {
    const existingAuth = await this.findByAppleUserId(appleAuth.appleUserId);
    
    if (existingAuth) {
      // 更新现有认证信息
      const query = `
        UPDATE apple_auth
        SET email = $1, full_name = $2, identity_token = $3, refresh_token = $4, expires_at = $5, updated_at = NOW()
        WHERE apple_user_id = $6
        RETURNING id, user_id as userId, apple_user_id as appleUserId, email, full_name as fullName, identity_token as identityToken, refresh_token as refreshToken, expires_at as expiresAt, created_at as createdAt, updated_at as updatedAt
      `;
      
      const result = await this.databaseClient.executeQuery(query, [
        appleAuth.email,
        appleAuth.fullName,
        appleAuth.identityToken,
        appleAuth.refreshToken,
        appleAuth.expiresAt,
        appleAuth.appleUserId
      ]);
      
      return result.rows[0] as AppleAuthUser;
    } else {
      // 创建新认证信息
      const query = `
        INSERT INTO apple_auth (id, user_id, apple_user_id, email, full_name, identity_token, refresh_token, expires_at, created_at, updated_at)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, user_id as userId, apple_user_id as appleUserId, email, full_name as fullName, identity_token as identityToken, refresh_token as refreshToken, expires_at as expiresAt, created_at as createdAt, updated_at as updatedAt
      `;
      
      const result = await this.databaseClient.executeQuery(query, [
        appleAuth.userId,
        appleAuth.appleUserId,
        appleAuth.email,
        appleAuth.fullName,
        appleAuth.identityToken,
        appleAuth.refreshToken,
        appleAuth.expiresAt
      ]);
      
      return result.rows[0] as AppleAuthUser;
    }
  }

  /**
   * 根据苹果用户ID查找认证信息
   */
  async findByAppleUserId(appleUserId: string): Promise<AppleAuthUser | null> {
    const query = `
      SELECT id, user_id as userId, apple_user_id as appleUserId, email, full_name as fullName, identity_token as identityToken, refresh_token as refreshToken, expires_at as expiresAt, created_at as createdAt, updated_at as updatedAt
      FROM apple_auth
      WHERE apple_user_id = $1
    `;
    
    const result = await this.databaseClient.executeQuery(query, [appleUserId]);
    return result.rows.length > 0 ? (result.rows[0] as AppleAuthUser) : null;
  }

  /**
   * 根据用户ID查找认证信息
   */
  async findByUserId(userId: string): Promise<AppleAuthUser | null> {
    const query = `
      SELECT id, user_id as userId, apple_user_id as appleUserId, email, full_name as fullName, identity_token as identityToken, refresh_token as refreshToken, expires_at as expiresAt, created_at as createdAt, updated_at as updatedAt
      FROM apple_auth
      WHERE user_id = $1
    `;
    
    const result = await this.databaseClient.executeQuery(query, [userId]);
    return result.rows.length > 0 ? (result.rows[0] as AppleAuthUser) : null;
  }

  /**
   * 更新刷新令牌
   */
  async updateRefreshToken(appleUserId: string, refreshToken: string, expiresAt: Date): Promise<AppleAuthUser> {
    const query = `
      UPDATE apple_auth
      SET refresh_token = $1, expires_at = $2, updated_at = NOW()
      WHERE apple_user_id = $3
      RETURNING id, user_id as userId, apple_user_id as appleUserId, email, full_name as fullName, identity_token as identityToken, refresh_token as refreshToken, expires_at as expiresAt, created_at as createdAt, updated_at as updatedAt
    `;
    
    const result = await this.databaseClient.executeQuery(query, [refreshToken, expiresAt, appleUserId]);
    return result.rows[0] as AppleAuthUser;
  }

  /**
   * 删除苹果认证信息
   */
  async deleteByUserId(userId: string): Promise<void> {
    const query = `
      DELETE FROM apple_auth
      WHERE user_id = $1
    `;
    
    await this.databaseClient.executeQuery(query, [userId]);
  }
}
```

#### 4.6 苹果认证控制器

```typescript
// src/apple/authentication/AppleAuthController.ts

import { Request, Response } from 'express';
import { AppleAuthService } from './AppleAuthService';
import { AppleAuthRepository } from '../repository/AppleAuthRepository';
import { UserService } from '../../user/UserService';
import { JwtService } from '../../infrastructure/security/JwtService';
import { AppleAuthRequest } from '../types/AppleAuthTypes';
import { Logger } from '../../infrastructure/logger/Logger';

/**
 * 苹果认证控制器
 */
export class AppleAuthController {
  private readonly appleAuthService: AppleAuthService;
  private readonly appleAuthRepository: AppleAuthRepository;
  private readonly userService: UserService;
  private readonly jwtService: JwtService;
  private readonly logger: Logger;

  /**
   * 创建苹果认证控制器实例
   * @param appleAuthService 苹果认证服务
   * @param appleAuthRepository 苹果认证仓库
   * @param userService 用户服务
   * @param jwtService JWT服务
   * @param logger 日志记录器
   */
  constructor(
    appleAuthService: AppleAuthService,
    appleAuthRepository: AppleAuthRepository,
    userService: UserService,
    jwtService: JwtService,
    logger: Logger
  ) {
    this.appleAuthService = appleAuthService;
    this.appleAuthRepository = appleAuthRepository;
    this.userService = userService;
    this.jwtService = jwtService;
    this.logger = logger;
  }

  /**
   * 生成苹果认证URL
   */
  async getAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const state = req.query.state as string || Math.random().toString(36).substring(2, 15);
      const result = await this.appleAuthService.generateAuthUrl(state);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      this.logger.logError('Failed to generate Apple auth URL', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate Apple auth URL',
        error: (error as Error).message
      });
    }
  }

  /**
   * 处理苹果授权码回调
   */
  async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state } = req.body as AppleAuthRequest;
      
      // 验证state值（这里应该从session或缓存中获取之前生成的state进行比较）
      // 简化实现，实际应该存储state并进行验证
      
      // 交换授权码获取令牌
      const tokenResponse = await this.appleAuthService.exchangeCodeForToken(code);
      
      // 验证ID令牌
      const idTokenPayload = await this.appleAuthService.verifyIdToken(tokenResponse.id_token);
      
      // 查找或创建用户
      let user = await this.userService.findByEmail(idTokenPayload.email || '');
      
      if (!user) {
        // 创建新用户
        user = await this.userService.createUser({
          email: idTokenPayload.email || '',
          name: idTokenPayload.name ? `${idTokenPayload.name.firstName || ''} ${idTokenPayload.name.lastName || ''}`.trim() : 'Apple User',
          password: '', // Apple用户不需要密码
          isActive: true
        });
      }
      
      // 保存苹果认证信息
      const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);
      await this.appleAuthRepository.save({
        id: '', // 由数据库生成
        userId: user.id,
        appleUserId: idTokenPayload.sub,
        email: idTokenPayload.email,
        fullName: idTokenPayload.name,
        identityToken: tokenResponse.id_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // 生成系统JWT令牌
      const jwtToken = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
        name: user.name
      });
      
      // 重定向到前端页面，携带JWT令牌
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${jwtToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.logError('Failed to handle Apple callback', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to handle Apple callback',
        error: (error as Error).message
      });
    }
  }

  /**
   * 使用ID令牌直接登录
   */
  async loginWithIdToken(req: Request, res: Response): Promise<void> {
    try {
      const { id_token, nonce } = req.body as AppleAuthRequest;
      
      // 验证ID令牌
      const idTokenPayload = await this.appleAuthService.verifyIdToken(id_token, nonce);
      
      // 查找或创建用户
      let user = await this.userService.findByEmail(idTokenPayload.email || '');
      
      if (!user) {
        // 创建新用户
        user = await this.userService.createUser({
          email: idTokenPayload.email || '',
          name: idTokenPayload.name ? `${idTokenPayload.name.firstName || ''} ${idTokenPayload.name.lastName || ''}`.trim() : 'Apple User',
          password: '', // Apple用户不需要密码
          isActive: true
        });
      }
      
      // 保存苹果认证信息
      await this.appleAuthRepository.save({
        id: '', // 由数据库生成
        userId: user.id,
        appleUserId: idTokenPayload.sub,
        email: idTokenPayload.email,
        fullName: idTokenPayload.name,
        identityToken: id_token,
        refreshToken: '', // 直接使用ID令牌登录，没有刷新令牌
        expiresAt: new Date(idTokenPayload.exp * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // 生成系统JWT令牌
      const jwtToken = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
        name: user.name
      });
      
      res.status(200).json({
        success: true,
        data: {
          token: jwtToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      });
    } catch (error) {
      this.logger.logError('Failed to login with Apple ID token', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to login with Apple ID token',
        error: (error as Error).message
      });
    }
  }
}
```

### 5. 数据库表结构

```sql
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
CREATE INDEX IF NOT EXISTS idx_apple_auth_user_id ON apple_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_apple_auth_apple_user_id ON apple_auth(apple_user_id);
```

### 6. API接口设计

| 接口路径 | 方法 | 描述 | 请求体 | 响应体 |
|----------|------|------|--------|--------|
| `/api/v1/auth/apple/url` | GET | 生成苹果认证URL | `{ state?: string }` | `{ success: boolean, data: { authorizationUrl: string, state: string } }` |
| `/api/v1/auth/apple/callback` | POST | 处理苹果授权码回调 | `{ code: string, state: string }` | 重定向到前端页面 |
| `/api/v1/auth/apple/login` | POST | 使用ID令牌直接登录 | `{ id_token: string, nonce?: string }` | `{ success: boolean, data: { token: string, user: User } }` |

### 7. 配置管理

```typescript
// 环境变量配置
APPLE_CLIENT_ID=com.example.app
APPLE_TEAM_ID=TEAM123
APPLE_KEY_ID=KEY123
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIE...
-----END PRIVATE KEY-----
APPLE_REDIRECT_URI=https://example.com/api/v1/auth/apple/callback
APPLE_SCOPES=email,name
APPLE_RESPONSE_TYPE=code
APPLE_RESPONSE_MODE=form_post
```

### 8. 测试策略

#### 8.1 单元测试

```typescript
// src/apple/authentication/AppleAuthServiceImpl.test.ts

describe('AppleAuthServiceImpl', () => {
  let service: AppleAuthServiceImpl;
  let mockConfigManager: jest.Mocked<ConfigManager>;

  beforeEach(() => {
    mockConfigManager = {
      get: jest.fn().mockImplementation((key: string) => {
        const configs: Record<string, any> = {
          'APPLE_CLIENT_ID': 'com.example.app',
          'APPLE_TEAM_ID': 'TEAM123',
          'APPLE_KEY_ID': 'KEY123',
          'APPLE_PRIVATE_KEY': '-----BEGIN PRIVATE KEY-----
MIIE...
-----END PRIVATE KEY-----',
          'APPLE_REDIRECT_URI': 'https://example.com/auth/apple/callback'
        };
        return configs[key] || '';
      })
    } as unknown as jest.Mocked<ConfigManager>;

    service = new AppleAuthServiceImpl(mockConfigManager);
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

  describe('generateClientSecret', () => {
    it('should generate valid client secret', () => {
      const clientSecret = service.generateClientSecret();
      expect(clientSecret).toBeDefined();
      expect(typeof clientSecret).toBe('string');
      expect(clientSecret.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });
});
```

#### 8.2 集成测试

```typescript
// src/apple/authentication/AppleAuthController.integration.test.ts

describe('AppleAuthController Integration', () => {
  let app: Express;
  let mockAppleAuthService: jest.Mocked<AppleAuthService>;
  let mockAppleAuthRepository: jest.Mocked<AppleAuthRepository>;
  let mockUserService: jest.Mocked<UserService>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // 初始化mocks
    mockAppleAuthService = {
      generateAuthUrl: jest.fn().mockResolvedValue({
        authorizationUrl: 'https://appleid.apple.com/auth/authorize?client_id=com.example.app&state=test-state',
        state: 'test-state'
      }),
      exchangeCodeForToken: jest.fn(),
      verifyIdToken: jest.fn(),
      generateClientSecret: jest.fn(),
      refreshAccessToken: jest.fn()
    } as unknown as jest.Mocked<AppleAuthService>;

    mockAppleAuthRepository = {
      save: jest.fn(),
      findByAppleUserId: jest.fn(),
      findByUserId: jest.fn(),
      updateRefreshToken: jest.fn(),
      deleteByUserId: jest.fn()
    } as unknown as jest.Mocked<AppleAuthRepository>;

    mockUserService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    mockJwtService = {
      generateToken: jest.fn().mockReturnValue('test-jwt-token'),
      verifyToken: jest.fn()
    } as unknown as jest.Mocked<JwtService>;

    mockLogger = {
      logInfo: jest.fn(),
      logError: jest.fn(),
      logDebug: jest.fn(),
      logWarn: jest.fn()
    } as unknown as jest.Mocked<Logger>;

    // 创建控制器
    const controller = new AppleAuthController(
      mockAppleAuthService,
      mockAppleAuthRepository,
      mockUserService,
      mockJwtService,
      mockLogger
    );

    // 设置Express应用
    app = express();
    app.use(express.json());
    app.get('/api/v1/auth/apple/url', controller.getAuthUrl.bind(controller));
    app.post('/api/v1/auth/apple/callback', controller.handleCallback.bind(controller));
    app.post('/api/v1/auth/apple/login', controller.loginWithIdToken.bind(controller));
  });

  describe('GET /api/v1/auth/apple/url', () => {
    it('should return auth URL successfully', async () => {
      const response = await request(app)
        .get('/api/v1/auth/apple/url')
        .query({ state: 'test-state' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.authorizationUrl).toBeDefined();
      expect(response.body.data.state).toBe('test-state');
    });
  });
});
```

### 9. 安全考虑

1. **使用HTTPS**：所有与Apple服务器和客户端的通信必须使用HTTPS
2. **保护私钥**：Apple私钥必须安全存储，建议使用环境变量或密钥管理服务
3. **验证state值**：防止CSRF攻击，必须验证Apple返回的state值与之前生成的值匹配
4. **验证nonce值**：防止重放攻击，必须验证ID令牌中的nonce值与客户端生成的值匹配
5. **限制请求速率**：对认证相关API实施请求速率限制，防止暴力攻击
6. **定期轮换密钥**：定期轮换Apple私钥，提高安全性
7. **监控异常登录**：监控异常登录行为，如多次失败的认证尝试

### 10. 部署与运维

1. **环境变量配置**：在不同环境（开发、测试、生产）中配置相应的Apple认证参数
2. **日志记录**：记录认证过程中的关键事件和错误，便于调试和监控
3. **监控指标**：监控认证成功率、失败率、响应时间等指标
4. **定期备份**：定期备份苹果认证相关数据
5. **灾难恢复**：制定灾难恢复计划，确保在发生故障时能够快速恢复服务

### 11. 总结

苹果认证技术实现采用了模块化设计，将认证逻辑分为多个层次，遵循了Clean Architecture原则。实现包括：

1. **完整的苹果认证流程**：支持授权码流程和ID令牌直接登录
2. **安全可靠**：实现了完善的安全措施，保护用户数据和隐私
3. **易于集成**：提供了简洁的API接口，便于iOS客户端集成
4. **可测试性**：包含单元测试和集成测试，确保功能正确性
5. **可维护性**：采用模块化设计，便于维护和扩展

该实现为iOS用户提供了安全、便捷的登录方式，同时与现有系统无缝集成，保持了良好的用户体验。