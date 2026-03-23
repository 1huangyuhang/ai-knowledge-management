# package.json 配置示例

索引标签：#配置管理 #package.json #依赖管理 #构建脚本 #TypeScript

## 相关文档

- [开发环境设置](development-environment-setup.md)：详细描述开发环境的配置和设置
- [开发规范](development-standards.md)：详细描述开发规范和最佳实践
- [tsconfig.json配置示例](tsconfig-example.md)：详细描述TypeScript配置示例
- [多环境实现](../deployment-ops/multi-environment-implementation.md)：详细描述多环境的构建和管理
- [配置管理](../deployment-ops/config-management.md)：详细描述系统的配置管理设计

## 1. 文档概述

本文档提供了AI认知辅助系统的package.json配置示例，包含了所有必要的依赖和脚本，用于支持多环境构建和运行。

## 2. 完整配置示例

```json
{
  "name": "ai-cognitive-assistant",
  "version": "1.0.0",
  "description": "AI认知辅助系统后端",
  "main": "dist/index.js",
  "scripts": {
    "dev": "NODE_ENV=development tsx watch src/index.ts",
    "build:dev": "NODE_ENV=development tsup src/index.ts --minify false",
    "build:test": "NODE_ENV=test tsup src/index.ts --minify true",
    "build:prod": "NODE_ENV=production tsup src/index.ts --minify true",
    "start:dev": "NODE_ENV=development node dist/index.js",
    "start:test": "NODE_ENV=test node dist/index.js",
    "start:prod": "NODE_ENV=production node dist/index.js",
    "test": "NODE_ENV=test jest",
    "test:unit": "NODE_ENV=test jest --testPathPattern=__tests__/unit",
    "test:integration": "NODE_ENV=test jest --testPathPattern=__tests__/integration",
    "test:coverage": "NODE_ENV=test jest --coverage",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit",
    "prebuild": "npm run lint && npm run typecheck",
    "postinstall": "npm run build:dev"
  },
  "keywords": ["ai", "cognitive", "assistant", "typescript", "nodejs"],
  "author": "AI认知辅助系统开发团队",
  "license": "MIT",
  "dependencies": {
    "@fastify/cors": "^11.2.0",
    "@fastify/swagger": "^9.6.1",
    "better-sqlite3": "^12.5.0",
    "bull": "^4.16.0",
    "dotenv": "^16.4.5",
    "fastify": "^5.6.2",
    "fluent-ffmpeg": "^2.1.3",
    "ffmpeg-static": "^5.2.0",
    "ioredis": "^5.4.1",
    "mammoth": "^1.8.0",
    "multer": "^1.4.5-lts.1",
    "openai": "^4.58.2",
    "pdf-parse": "^1.1.1",
    "pino": "^10.1.0",
    "prom-client": "^15.1.2",
    "qdrant-client": "^1.15.1",
    "reflect-metadata": "^0.2.2",
    "redis": "^4.6.14",
    "sharp": "^0.33.5",
    "tsyringe": "^4.8.0",
    "tesseract.js": "^5.1.0",
    "wav": "^1.0.2",
    "xlsx": "^0.18.5",
    "zod": "^4.3.5"
  },
  "devDependencies": {
    "@types/bull": "^4.10.0",
    "@types/fluent-ffmpeg": "^2.1.36",
    "@types/ioredis": "^5.0.0",
    "@types/jest": "^29.5.13",
    "@types/mammoth": "^1.4.4",
    "@types/multer": "^1.4.11",
    "@types/node": "^25.0.3",
    "@types/pdf-parse": "^1.1.4",
    "@types/prom-client": "^15.1.0",
    "@types/redis": "^4.0.11",
    "@types/reflect-metadata": "^0.1.0",
    "@types/sharp": "^0.32.0",
    "@types/supertest": "^6.0.3",
    "@types/wav": "^1.0.4",
    "@types/xlsx": "^0.0.35",
    "@typescript-eslint/eslint-plugin": "^8.5.0",
    "@typescript-eslint/parser": "^8.5.0",
    "eslint": "^9.10.0",
    "jest": "^29.7.0",
    "supertest": "^7.2.2",
    "ts-jest": "^29.2.5",
    "tsx": "^4.15.6",
    "tsup": "^8.5.1",
    "typescript": "^5.9.3"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/ai-cognitive-assistant.git"
  },
  "bugs": {
    "url": "https://github.com/your-org/ai-cognitive-assistant/issues"
  },
  "homepage": "https://github.com/your-org/ai-cognitive-assistant#readme"
}
```

## 3. 配置说明

### 3.1 核心配置

- **name**: 项目名称，用于npm包管理
- **version**: 项目版本，遵循语义化版本规范
- **description**: 项目描述
- **main**: 项目主入口文件，指向编译后的dist/index.js

### 3.2 脚本配置

#### 3.2.1 开发脚本

| 脚本名称 | 功能描述 | 环境 |
|---------|---------|------|
| `dev` | 开发模式运行，支持热重载 | 开发环境 |
| `build:dev` | 开发环境构建，不压缩代码 | 开发环境 |
| `start:dev` | 启动开发环境服务 | 开发环境 |

#### 3.2.2 测试脚本

| 脚本名称 | 功能描述 | 环境 |
|---------|---------|------|
| `test` | 运行所有测试用例 | 测试环境 |
| `test:unit` | 仅运行单元测试 | 测试环境 |
| `test:integration` | 仅运行集成测试 | 测试环境 |
| `test:coverage` | 运行测试并生成覆盖率报告 | 测试环境 |
| `build:test` | 测试环境构建，压缩代码 | 测试环境 |
| `start:test` | 启动测试环境服务 | 测试环境 |

#### 3.2.3 生产脚本

| 脚本名称 | 功能描述 | 环境 |
|---------|---------|------|
| `build:prod` | 生产环境构建，压缩代码 | 生产环境 |
| `start:prod` | 启动生产环境服务 | 生产环境 |

#### 3.2.4 质量保证脚本

| 脚本名称 | 功能描述 | 环境 |
|---------|---------|------|
| `lint` | 运行ESLint检查代码质量 | 开发环境 |
| `typecheck` | 运行TypeScript类型检查 | 开发环境 |
| `prebuild` | 构建前检查，包括lint和typecheck | 开发环境 |

### 3.3 依赖配置

#### 3.3.1 核心依赖

| 依赖类别 | 主要依赖 | 用途 |
|---------|---------|------|
| Web框架 | fastify | 高性能Node.js Web框架 |
| API文档 | @fastify/swagger | 自动生成API文档 |
| CORS支持 | @fastify/cors | 处理跨域请求 |
| 数据库 | better-sqlite3 | SQLite数据库驱动 |
| 向量数据库 | qdrant-client | Qdrant向量数据库客户端 |
| 依赖注入 | tsyringe, reflect-metadata | 依赖注入容器 |
| 任务队列 | bull | 分布式任务队列 |
| Redis客户端 | ioredis, redis | Redis客户端 |
| 监控 | prom-client | Prometheus客户端 |
| AI服务 | openai | OpenAI API客户端 |
| 日志 | pino | 高性能日志库 |
| 数据验证 | zod | 类型安全的数据验证库 |
| 环境变量 | dotenv | 加载环境变量 |

#### 3.3.2 工具类依赖

| 依赖类别 | 主要依赖 | 用途 |
|---------|---------|------|
| 文件上传 | multer | 处理文件上传 |
| PDF解析 | pdf-parse | 解析PDF文件 |
| DOCX解析 | mammoth | 解析Word文档 |
| Excel解析 | xlsx | 解析Excel文件 |
| OCR识别 | tesseract.js | 光学字符识别 |
| 图像处理 | sharp | 高性能图像处理 |
| 音频处理 | fluent-ffmpeg, ffmpeg-static, wav | 音频处理 |

#### 3.3.3 开发依赖

| 依赖类别 | 主要依赖 | 用途 |
|---------|---------|------|
| 类型定义 | @types/* | TypeScript类型定义 |
| 测试框架 | jest, supertest, ts-jest | 测试框架和工具 |
| TypeScript工具 | tsx, tsup, typescript | TypeScript执行和构建工具 |
| 代码质量 | eslint, @typescript-eslint/* | 代码质量检查工具 |

### 3.4 其他配置

- **engines**: 定义项目支持的Node.js和npm版本
- **repository**: Git仓库信息
- **bugs**: 项目bug跟踪地址
- **homepage**: 项目主页地址

## 4. 使用说明

### 4.1 安装依赖

```bash
npm install
```

### 4.2 开发模式运行

```bash
npm run dev
```

### 4.3 构建生产版本

```bash
npm run build:prod
```

### 4.4 启动生产服务

```bash
npm run start:prod
```

### 4.5 运行测试

```bash
npm test
```

### 4.6 代码质量检查

```bash
npm run lint
npm run typecheck
```

## 5. 依赖管理最佳实践

1. **定期更新依赖**: 使用`npm outdated`检查过时依赖，定期更新到最新稳定版本
2. **锁定依赖版本**: 使用`package-lock.json`锁定依赖版本，确保团队开发环境一致
3. **检查依赖安全**: 使用`npm audit`定期检查依赖安全漏洞
4. **移除无用依赖**: 使用`npm prune`移除未使用的依赖
5. **按需引入**: 对于大型依赖，考虑按需引入，减少项目体积

## 6. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |
