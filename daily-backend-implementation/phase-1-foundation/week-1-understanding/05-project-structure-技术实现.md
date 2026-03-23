# Day 05: 项目目录结构建立 - 代码实现文档

## 1. 项目目录结构设计

### 1.1 Clean Architecture 目录结构

```
├── src/                    # 源代码目录
│   ├── domain/             # 领域层
│   │   ├── entities/       # 实体定义
│   │   ├── value-objects/  # 值对象定义
│   │   ├── services/       # 领域服务
│   │   └── interfaces/     # 领域接口
│   ├── application/        # 应用层
│   │   ├── usecases/       # 用例实现
│   │   ├── dtos/           # 数据传输对象
│   │   ├── interfaces/     # 应用接口
│   │   └── events/         # 事件定义
│   ├── infrastructure/     # 基础设施层
│   │   ├── persistence/    # 数据持久化
│   │   ├── ai/             # AI服务集成
│   │   ├── http/           # HTTP API实现
│   │   ├── event-bus/      # 事件总线实现
│   │   └── logging/        # 日志系统
│   ├── presentation/       # 表现层
│   │   ├── controllers/    # 控制器
│   │   ├── routes/         # 路由定义
│   │   └── middleware/     # 中间件
│   └── shared/             # 共享组件
│       ├── utils/          # 工具函数
│       ├── errors/         # 错误定义
│       └── types/          # 共享类型
├── test/                   # 测试目录
│   ├── unit/               # 单元测试
│   ├── integration/        # 集成测试
│   └── e2e/                # 端到端测试
├── scripts/                # 脚本目录
├── config/                 # 配置文件目录
├── .gitignore              # Git忽略文件
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── tsconfig.build.json     # TypeScript构建配置
├── eslint.config.js        # ESLint配置
├── prettier.config.js      # Prettier配置
├── jest.config.js          # Jest配置
├── fastify.config.ts       # Fastify配置
├── docker-compose.yml      # Docker配置
└── Dockerfile              # Dockerfile
```

### 1.2 目录创建命令

```bash
# 创建src目录结构
mkdir -p src/domain/entities
mkdir -p src/domain/value-objects
mkdir -p src/domain/services
mkdir -p src/domain/interfaces
mkdir -p src/application/usecases
mkdir -p src/application/dtos
mkdir -p src/application/interfaces
mkdir -p src/application/events
mkdir -p src/infrastructure/persistence
mkdir -p src/infrastructure/ai
mkdir -p src/infrastructure/http
mkdir -p src/infrastructure/event-bus
mkdir -p src/infrastructure/logging
mkdir -p src/presentation/controllers
mkdir -p src/presentation/routes
mkdir -p src/presentation/middleware
mkdir -p src/shared/utils
mkdir -p src/shared/errors
mkdir -p src/shared/types

# 创建测试目录
mkdir -p test/unit
mkdir -p test/integration
mkdir -p test/e2e

# 创建其他目录
mkdir -p scripts
mkdir -p config
```

## 2. 项目初始化

### 2.1 package.json 创建

```bash
npm init -y
```

### 2.2 package.json 配置

```json
{
  "name": "cognitive-assistant-backend",
  "version": "1.0.0",
  "description": "Cognitive Assistant Backend",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "dev": "tsx watch src/infrastructure/http/server.ts",
    "start": "node dist/infrastructure/http/server.js",
    "test": "jest",
    "test:unit": "jest test/unit",
    "test:integration": "jest test/integration",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "prepare": "husky install",
    "migrate": "node dist/infrastructure/persistence/migrations/run-migrations.js"
  },
  "keywords": [
    "cognitive",
    "assistant",
    "ai",
    "clean-architecture"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "fastify": "^4.26.0",
    "fastify-cors": "^9.0.1",
    "fastify-helmet": "^11.1.1",
    "fastify-swagger": "^8.14.0",
    "pino": "^8.19.0",
    "pino-pretty": "^10.3.1",
    "sqlite3": "^5.1.7",
    "typeorm": "^0.3.20",
    "uuid": "^9.0.1",
    "@qdrant/js-client-rest": "^1.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.16",
    "@types/uuid": "^9.0.8",
    "@types/jest": "^29.5.12",
    "@types/supertest": "^6.0.2",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "husky": "^9.0.10",
    "jest": "^29.7.0",
    "prettier": "^3.2.5",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.2",
    "tsx": "^4.7.1",
    "typescript": "^5.3.3"
  }
}
```

### 2.3 依赖安装

```bash
npm install
```

## 3. TypeScript 配置

### 3.1 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["./src/domain/*"],
      "@application/*": ["./src/application/*"],
      "@infrastructure/*": ["./src/infrastructure/*"],
      "@presentation/*": ["./src/presentation/*"],
      "@shared/*": ["./src/shared/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.2 tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

## 4. 代码质量工具配置

### 4.1 ESLint 配置

```javascript
// eslint.config.js
import { ESLint } from 'eslint';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default [
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier: prettier
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:prettier/recommended'
    ],
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
];
```

### 4.2 Prettier 配置

```javascript
// prettier.config.js
export default {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  endOfLine: 'lf'
};
```

### 4.3 Jest 配置

```javascript
// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapping: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1'
  },
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  roots: ['<rootDir>/src', '<rootDir>/test']
};
```

## 5. 项目配置文件

### 5.1 .gitignore

```
# Dependencies
node_modules/

# Build output
dist/
build/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Testing
coverage/
.nyc_output/

# Configuration
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Temporary files
*.tmp
*.temp
.cache/
```

### 5.2 Docker配置

#### 5.2.1 Dockerfile

```dockerfile
# Use the official Node.js image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/infrastructure/http/server.js"]
```

#### 5.2.2 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=sqlite:///app/data/db.sqlite
      - QDRANT_URL=http://qdrant:6333
    volumes:
      - ./data:/app/data
    depends_on:
      - qdrant

  qdrant:
    image: qdrant/qdrant:v1.7.3
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_data:/qdrant/storage
    restart: unless-stopped
```

## 6. 项目初始化脚本

### 6.1 初始化脚本

```javascript
// scripts/init-project.js
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 创建目录结构
const directories = [
  'src/domain/entities',
  'src/domain/value-objects',
  'src/domain/services',
  'src/domain/interfaces',
  'src/application/usecases',
  'src/application/dtos',
  'src/application/interfaces',
  'src/application/events',
  'src/infrastructure/persistence',
  'src/infrastructure/ai',
  'src/infrastructure/http',
  'src/infrastructure/event-bus',
  'src/infrastructure/logging',
  'src/presentation/controllers',
  'src/presentation/routes',
  'src/presentation/middleware',
  'src/shared/utils',
  'src/shared/errors',
  'src/shared/types',
  'test/unit',
  'test/integration',
  'test/e2e',
  'scripts',
  'config',
  'data',
  'qdrant_data'
];

directories.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`Created directory: ${dir}`);
});

// 创建基础配置文件
const packageJson = {
  name: 'cognitive-assistant-backend',
  version: '1.0.0',
  description: 'Cognitive Assistant Backend',
  type: 'module',
  main: 'dist/index.js',
  scripts: {
    build: 'tsc -p tsconfig.build.json',
    dev: 'tsx watch src/infrastructure/http/server.ts',
    start: 'node dist/infrastructure/http/server.js',
    test: 'jest',
    lint: 'eslint src/**/*.ts',
    format: 'prettier --write src/**/*.ts'
  },
  keywords: ['cognitive', 'assistant', 'ai', 'clean-architecture'],
  author: '',
  license: 'MIT'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Created package.json');

// 创建.gitignore
const gitignore = `node_modules/
dist/
build/
logs
*.log
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
*.tmp
*.temp
.cache/
coverage/
.nyc_output/
`;

fs.writeFileSync('.gitignore', gitignore);
console.log('Created .gitignore');

// 安装依赖
console.log('Installing dependencies...');
execSync('npm install fastify fastify-cors fastify-helmet fastify-swagger pino pino-pretty sqlite3 typeorm uuid @qdrant/js-client-rest', { stdio: 'inherit' });

console.log('Installing dev dependencies...');
execSync('npm install -D @types/node @types/uuid @types/jest @types/supertest @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-prettier husky jest prettier supertest ts-jest tsx typescript', { stdio: 'inherit' });

console.log('Project initialized successfully!');
```

### 6.2 执行初始化脚本

```bash
chmod +x scripts/init-project.js
node scripts/init-project.js
```

## 7. 基础文件创建

### 7.1 主服务器文件

```typescript
// src/infrastructure/http/server.ts
import Fastify from 'fastify';
import cors from 'fastify-cors';
import helmet from 'fastify-helmet';
import swagger from 'fastify-swagger';
import pino from 'pino';
import { registerRoutes } from '../../presentation/routes';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
      ignore: 'pid,hostname'
    }
  }
});

const fastify = Fastify({
  logger,
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: true
    }
  }
});

// 注册插件
fastify.register(helmet);
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});
fastify.register(swagger, {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Cognitive Assistant API',
      description: 'API documentation for Cognitive Assistant',
      version: '1.0.0'
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  },
  exposeRoute: true
});

// 注册路由
registerRoutes(fastify);

// 健康检查路由
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});

// 启动服务器
const start = async () => {
  try {
    await fastify.listen(3000, '0.0.0.0');
    fastify.log.info(`Server listening on http://localhost:3000`);
    fastify.log.info(`Documentation available at http://localhost:3000/documentation`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

### 7.2 路由注册文件

```typescript
// src/presentation/routes/index.ts
import { FastifyInstance } from 'fastify';

// 注册所有路由
export const registerRoutes = (fastify: FastifyInstance) => {
  // 在这里注册各个模块的路由
  // 例如：fastify.register(thoughtRoutes);
};
```

## 8. 项目构建与测试

### 8.1 构建项目

```bash
npm run build
```

### 8.2 运行开发服务器

```bash
npm run dev
```

### 8.3 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration
```

### 8.4 代码质量检查

```bash
# 运行ESLint检查
npm run lint

# 自动修复ESLint错误
npm run lint:fix

# 运行Prettier格式化
npm run format
```

## 9. 总结

Day 05的核心任务是建立符合Clean Architecture的项目目录结构，为后续开发做好准备。通过今天的实现，我们已经完成了：

1. **完整的项目目录结构**：按照Clean Architecture原则创建了清晰的目录结构
2. **项目配置文件**：包括package.json、tsconfig.json、ESLint、Prettier和Jest配置
3. **依赖管理**：安装了必要的生产和开发依赖
4. **基础代码文件**：创建了主服务器文件和路由注册文件
5. **Docker配置**：配置了Dockerfile和docker-compose.yml

这些工作为后续开发打下了坚实的基础，确保了项目的可维护性、可扩展性和可测试性。在后续的开发中，我们将基于这个结构实现具体的业务逻辑，包括Domain层的实体实现、Application层的用例实现和Infrastructure层的技术实现。