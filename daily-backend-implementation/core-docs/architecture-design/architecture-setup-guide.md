# 架构搭建指南

索引标签：#架构设计 #搭建指南 #目录结构 #依赖配置 #自动化脚本

## 相关文档

- [架构对齐](architecture-alignment.md)：详细描述架构的一致性调整
- [依赖对齐](dependency-alignment.md)：详细描述依赖的对齐和管理
- [功能模块对齐](feature-module-alignment.md)：详细描述功能模块的对齐和实现
- [开发环境设置](../dev-support/development-environment-setup.md)：详细描述开发环境的设置
- [package.json配置示例](../dev-support/package-json-example.md)：详细描述package.json的配置
- [tsconfig.json配置示例](../dev-support/tsconfig-example.md)：详细描述tsconfig.json的配置

## 1. 文档概述

本文档详细说明AI认知辅助系统的后端架构搭建过程，包括目录结构设计、依赖配置和自动化脚本使用。通过本文档，开发者可以快速了解系统的架构设计和搭建方法，便于后续的开发和维护工作。

## 2. 目录结构设计

### 2.1 核心架构分层

系统采用Clean Architecture的5层设计，确保依赖倒置和高内聚、低耦合的设计原则。目录结构如下：

```
src/
├── presentation/     # 表示层
│   ├── controllers/  # API控制器
│   ├── middlewares/  # 中间件
│   └── routes/       # 路由定义
├── application/      # 应用层
│   ├── services/     # 应用服务
│   ├── use-cases/    # 用例
│   └── workflows/    # 工作流
├── domain/           # 领域层
│   ├── entities/     # 领域实体
│   ├── repositories/ # 仓库接口
│   └── value-objects/# 值对象
├── infrastructure/   # 基础设施层
│   ├── database/     # 数据库实现
│   ├── logging/      # 日志系统
│   ├── external/     # 外部服务集成
│   └── cache/        # 缓存实现
└── ai/               # AI能力层
    ├── llm/          # 大语言模型
    ├── embedding/    # 嵌入服务
    └── cognitive/    # 认知分析
```

### 2.2 系统整体架构图

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   客户端请求      │──────▶│   表示层 API      │──────▶│   应用层服务     │
│ Client Request  │       │ Presentation API │       │ Application Service │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        ▲                           ▲                           ▲
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                     │
                                     ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   领域层核心       │       │   AI能力层       │       │   基础设施层      │
│ Domain Core     │       │ AI Capability   │       │ Infrastructure  │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        ▲                           ▲                           ▲
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                     │
                                     ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   外部系统集成      │       │   数据库服务      │       │   缓存与消息队列   │
│ External Systems │       │ Database Service │       │ Cache & MQ      │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### 2.3 核心流程流程图

#### 2.3.1 用户请求处理流程

```
1. 用户发起请求 → 2. 表示层API接收请求 → 3. 中间件处理（认证、授权） → 4. 控制器处理请求 → 5. 调用应用层服务 → 6. 应用层协调领域层和AI能力层 → 7. 领域层执行业务规则 → 8. AI能力层提供AI服务 → 9. 基础设施层处理外部依赖 → 10. 返回处理结果 → 11. 表示层格式化响应 → 12. 返回响应给用户
```

#### 2.3.2 AI任务处理流程

```
1. 应用层创建AI任务 → 2. AI调度模块接收任务 → 3. 任务队列存储任务 → 4. 任务执行器获取任务 → 5. 调用AI能力层 → 6. LLM处理请求 → 7. 嵌入服务生成向量 → 8. 向量存储存储向量 → 9. 认知解析处理结果 → 10. 返回处理结果 → 11. 更新任务状态 → 12. 通知应用层 → 13. 应用层处理结果 → 14. 存储到数据库 → 15. 返回最终结果
```

### 2.4 目录结构说明

#### 2.4.1 表示层 (Presentation Layer)
- **controllers/**：处理HTTP请求和响应，调用应用层服务
- **middlewares/**：实现认证、授权、日志等横切关注点
- **routes/**：定义API路由和端点

#### 2.4.2 应用层 (Application Layer)
- **services/**：实现业务流程和协调各层交互
- **use-cases/**：实现具体的业务用例
- **workflows/**：编排复杂的业务流程

#### 2.4.3 领域层 (Domain Layer)
- **entities/**：核心业务实体，包含业务规则
- **repositories/**：数据访问抽象接口
- **value-objects/**：不可变的值对象，如Email、Password等

#### 2.4.4 基础设施层 (Infrastructure Layer)
- **database/**：数据库连接和访问实现
- **logging/**：日志系统实现
- **external/**：外部服务（如Redis、Qdrant）集成
- **cache/**：缓存实现

#### 2.4.5 AI能力层 (AI Capability Layer)
- **llm/**：大语言模型集成
- **embedding/**：文本嵌入生成服务
- **cognitive/**：认知分析算法实现

## 3. 依赖配置

### 3.1 核心依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| typescript | ^5.9.3 | TypeScript语言支持 |
| fastify | ^5.6.2 | Web框架 |
| tsyringe | ^4.8.0 | 依赖注入容器 |
| reflect-metadata | ^0.2.2 | TypeScript反射支持 |
| zod | ^4.3.5 | 数据验证库 |
| pino | ^10.1.0 | 日志库 |
| bull | ^4.16.0 | 任务队列 |
| ioredis | ^5.4.1 | Redis客户端 |
| qdrant-client | ^1.12.0 | Qdrant向量数据库客户端 |

### 3.2 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| @types/node | ^25.0.3 | Node.js类型定义 |
| @types/jest | ^29.5.13 | Jest类型定义 |
| @types/bull | ^4.16.0 | Bull类型定义 |
| @types/ioredis | ^5.0.0 | Redis类型定义 |
| jest | ^29.7.0 | 测试框架 |
| ts-jest | ^29.2.5 | TypeScript Jest转换器 |
| tsup | ^8.5.1 | TypeScript打包工具 |
| tsx | ^4.19.1 | TypeScript执行引擎 |

### 3.3 依赖安装命令

```bash
# 核心依赖
npm install typescript fastify tsyringe reflect-metadata zod pino bull ioredis qdrant-client

# 开发依赖
npm install --save-dev @types/node @types/jest @types/bull @types/ioredis jest ts-jest tsup tsx
```

## 4. 配置文件

### 4.1 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4.2 package.json脚本配置

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --out-dir dist",
    "start": "node dist/index.js",
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:all": "jest --testPathPattern=__tests__",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  }
}
```

## 5. 自动化脚本使用

### 5.1 开发环境启动

```bash
npm run dev
```

该命令使用`tsx watch`启动开发服务器，支持热重载，便于开发者进行实时开发和测试。

### 5.2 代码构建

```bash
npm run build
```

该命令使用`tsup`构建TypeScript代码，输出到`dist`目录。

### 5.3 生产环境启动

```bash
npm run start
```

该命令启动生产环境服务器，使用构建后的代码。

### 5.4 测试执行

```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行所有测试（包括单元测试和集成测试）
npm run test:all
```

### 5.5 代码质量检查

```bash
# 类型检查
npm run typecheck

# ESLint检查
npm run lint
```

## 6. 依赖注入配置

### 6.1 配置文件

创建`src/infrastructure/dependency-injection.ts`文件，配置依赖注入容器：

```typescript
import { container } from 'tsyringe';
import { ConfigService } from './config/ConfigService';
import { EnvironmentConfigService } from './config/EnvironmentConfigService';
import { CacheService } from './cache/CacheService';
import { RedisCacheService } from './cache/RedisCacheService';
import { MemoryCacheService } from './cache/MemoryCacheService';

// 注册配置服务
container.registerSingleton<ConfigService>(EnvironmentConfigService);

// 注册缓存服务
container.registerSingleton<CacheService>({
  useFactory: (c) => {
    const config = c.resolve<ConfigService>(ConfigService);
    const cacheType = config.get('CACHE_TYPE', 'memory');
    
    if (cacheType === 'redis') {
      const redis = new Redis({
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        password: config.get('REDIS_PASSWORD')
      });
      return new RedisCacheService(redis);
    } else {
      return new MemoryCacheService();
    }
  }
});

// 注册其他服务...
```

### 6.2 使用依赖注入

在应用层和表示层使用依赖注入：

```typescript
import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

@injectable()
export class UserService {
  constructor(
    @inject('UserRepository') private userRepository: UserRepository
  ) {}
  
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.userRepository.create(user);
  }
  
  // 其他方法...
}
```

## 7. 日志系统配置

### 7.1 配置文件

创建`src/infrastructure/logging/Logger.ts`文件，配置日志系统：

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  prettyPrint: process.env.NODE_ENV !== 'production',
});

export default logger;
```

### 7.2 使用日志系统

在代码中使用日志系统：

```typescript
import logger from '../infrastructure/logging/Logger';

logger.info('Application started');
logger.error('An error occurred', { error: error.message });
logger.debug('Debug information', { data: someData });
```

## 8. 配置管理

### 8.1 配置服务接口

创建`src/infrastructure/config/ConfigService.ts`文件，定义配置服务接口：

```typescript
export interface ConfigService {
  get<T = string>(key: string, defaultValue?: T): T;
  has(key: string): boolean;
}
```

### 8.2 环境变量配置实现

创建`src/infrastructure/config/EnvironmentConfigService.ts`文件，实现环境变量配置服务：

```typescript
import { ConfigService } from './ConfigService';

export class EnvironmentConfigService implements ConfigService {
  get<T = string>(key: string, defaultValue?: T): T {
    const value = process.env[key];
    if (value === undefined) {
      if (defaultValue === undefined) {
        throw new Error(`Configuration key ${key} is required`);
      }
      return defaultValue;
    }
    return value as unknown as T;
  }
  
  has(key: string): boolean {
    return process.env[key] !== undefined;
  }
}
```

## 9. 架构搭建步骤

### 9.1 步骤1：创建目录结构

```bash
mkdir -p src/presentation/{controllers,middlewares,routes}
mkdir -p src/application/{services,use-cases,workflows}
mkdir -p src/domain/{entities,repositories,value-objects}
mkdir -p src/infrastructure/{database,logging,external,cache,config}
mkdir -p src/ai/{llm,embedding,cognitive}
mkdir -p __tests__/{unit,integration}
```

### 9.2 步骤2：初始化项目

```bash
npm init -y
npm install typescript --save-dev
tsc --init
```

### 9.3 步骤3：安装依赖

参考3.3节的依赖安装命令，安装核心依赖和开发依赖。

### 9.4 步骤4：配置文件

创建并配置`tsconfig.json`、`package.json`脚本和其他配置文件。

### 9.5 步骤5：实现核心组件

实现依赖注入、日志系统、配置管理等核心组件。

### 9.6 步骤6：编写示例代码

编写示例代码，验证架构搭建是否成功。

## 10. 架构优化建议

1. **分层依赖严格控制**：确保内层不依赖外层，各层之间通过接口通信
2. **模块化设计**：每个模块职责单一，避免跨模块耦合
3. **测试驱动开发**：在实现功能前编写测试用例，确保代码质量
4. **持续集成**：配置CI/CD流水线，实现自动化测试和部署
5. **监控和告警**：集成监控系统，及时发现和解决问题

## 11. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |
