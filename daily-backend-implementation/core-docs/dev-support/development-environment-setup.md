# 开发环境配置文档

索引标签：#开发支持 #环境配置 #Docker #数据库 #开发流程

## 相关文档

- [项目概述](project-overview.md) - 项目整体介绍
- [配置管理](../deployment-ops/config-management.md) - 系统配置管理
- [数据库设计与实现](database-design-implementation.md) - 数据库设计详情
- [API使用示例](api-usage-examples.md) - API使用示例和最佳实践
- [开发标准](development-standards.md) - 开发规范和标准

## 1. 文档概述

本文档详细说明AI认知辅助系统后端开发环境的搭建过程，包括开发环境要求、安装步骤、环境变量配置、项目初始化和常见问题解决。通过本文档，开发者可以快速搭建开发环境，开始系统的开发工作。

## 2. 开发环境要求

### 2.1 硬件要求

| 配置项 | 最低要求 | 推荐配置 |
|--------|----------|----------|
| CPU | 4核 | 8核及以上 |
| 内存 | 8GB | 16GB及以上 |
| 磁盘空间 | 50GB | 100GB及以上 |
| 网络 | 稳定的互联网连接 | 稳定的互联网连接 |

### 2.2 软件要求

| 软件 | 版本 | 用途 |
|------|------|------|
| Node.js | LTS (≥18) | 运行环境 |
| npm | ≥9.0.0 | 包管理器 |
| Docker | ≥20.10.0 | 容器化部署 |
| Git | ≥2.30.0 | 版本控制 |
| IDE | VS Code / WebStorm | 代码编辑 |
| PostgreSQL | ≥14.0 | 关系型数据库 |
| Redis | ≥7.0 | 缓存和任务队列 |
| Qdrant | ≥1.0 | 向量数据库 |

## 3. 软件安装步骤

### 3.1 Node.js和npm安装

#### 3.1.1 Windows系统

1. 访问Node.js官网：https://nodejs.org/
2. 下载LTS版本的Node.js安装包
3. 运行安装包，按照向导完成安装
4. 打开命令提示符，验证安装：
   ```bash
   node -v
   npm -v
   ```

#### 3.1.2 macOS系统

1. 使用Homebrew安装：
   ```bash
   brew install node
   ```
2. 验证安装：
   ```bash
   node -v
   npm -v
   ```

#### 3.1.3 Linux系统

1. 使用包管理器安装（以Ubuntu为例）：
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   ```
2. 验证安装：
   ```bash
   node -v
   npm -v
   ```

### 3.2 Docker安装

1. 访问Docker官网：https://www.docker.com/
2. 下载并安装Docker Desktop
3. 启动Docker Desktop
4. 验证安装：
   ```bash
   docker --version
   docker-compose --version
   ```

### 3.3 Git安装

1. 访问Git官网：https://git-scm.com/
2. 下载并安装Git
3. 验证安装：
   ```bash
   git --version
   ```

### 3.4 IDE安装

#### 3.4.1 VS Code

1. 访问VS Code官网：https://code.visualstudio.com/
2. 下载并安装VS Code
3. 安装推荐插件：
   - TypeScript ESLint
   - Prettier - Code formatter
   - Docker
   - GitLens
   - REST Client

#### 3.4.2 WebStorm

1. 访问WebStorm官网：https://www.jetbrains.com/webstorm/
2. 下载并安装WebStorm
3. 安装推荐插件：
   - Docker
   - GitToolBox
   - REST Client

### 3.5 数据库安装（使用Docker）

#### 3.5.1 PostgreSQL安装

1. 使用Docker启动PostgreSQL：
   ```bash
   docker run --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=ai_cognitive_db -d postgres:14
   ```
2. 验证PostgreSQL是否运行：
   ```bash
   docker ps
   ```

#### 3.5.2 Redis安装

1. 使用Docker启动Redis：
   ```bash
   docker run --name redis -p 6379:6379 -d redis:7
   ```
2. 验证Redis是否运行：
   ```bash
   docker ps
   ```

#### 3.5.3 Qdrant安装

1. 使用Docker启动Qdrant：
   ```bash
   docker run -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_storage:/qdrant/storage:z qdrant/qdrant:latest
   ```
2. 验证Qdrant是否运行：
   ```bash
   docker ps
   ```

## 4. 环境变量配置

### 4.1 环境变量列表

| 环境变量 | 描述 | 默认值 | 必须 |
|----------|------|--------|------|
| NODE_ENV | 运行环境 | development | 否 |
| PORT | 服务器端口 | 3000 | 否 |
| DATABASE_URL | PostgreSQL连接URL | postgresql://postgres:your_password@localhost:5432/ai_cognitive_db | 是 |
| REDIS_URL | Redis连接URL | redis://localhost:6379 | 否 |
| QDRANT_URL | Qdrant连接URL | http://localhost:6333 | 否 |
| OPENAI_API_KEY | OpenAI API密钥 | - | 是（AI功能） |
| LOG_LEVEL | 日志级别 | info | 否 |
| CACHE_TYPE | 缓存类型 | memory | 否 |
| JWT_SECRET | JWT密钥 | - | 是 |
| JWT_EXPIRES_IN | JWT过期时间 | 24h | 否 |

### 4.2 环境变量配置方法

#### 4.2.1 创建.env文件

在项目根目录创建`.env`文件，添加以下内容：

```env
# 运行环境
NODE_ENV=development
PORT=3000

# 数据库配置
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_cognitive_db

# Redis配置
REDIS_URL=redis://localhost:6379

# Qdrant配置
QDRANT_URL=http://localhost:6333

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key

# 日志配置
LOG_LEVEL=info

# 缓存配置
CACHE_TYPE=memory

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

#### 4.2.2 不同环境的.env文件

根据不同的运行环境，可以创建不同的.env文件：

- `.env.development`：开发环境
- `.env.test`：测试环境
- `.env.production`：生产环境

启动应用时，可以通过`--env`参数指定使用哪个环境文件，例如：

```bash
npm run dev --env development
```

## 5. 项目初始化

### 5.1 克隆项目

1. 克隆项目代码：
   ```bash
   git clone https://github.com/your-username/ai-cognitive-assistant.git
   ```
2. 进入项目目录：
   ```bash
   cd ai-cognitive-assistant/backend
   ```

### 5.2 安装依赖

```bash
npm install
```

### 5.3 数据库初始化

1. 运行数据库迁移：
   ```bash
   npm run migrate:up
   ```
2. （可选）填充测试数据：
   ```bash
   npm run seed:dev
   ```

### 5.4 启动开发服务器

```bash
npm run dev
```

开发服务器启动后，访问 http://localhost:3000 可以查看API文档。

## 6. 开发工具推荐

### 6.1 IDE推荐

#### 6.1.1 VS Code

推荐插件：
- TypeScript ESLint：TypeScript代码检查
- Prettier - Code formatter：代码格式化
- Docker：Docker容器管理
- GitLens：Git增强功能
- REST Client：API测试
- Thunder Client：API测试
- Jest Runner：Jest测试运行器
- Dependency Cruiser：依赖关系可视化

#### 6.1.2 WebStorm

推荐插件：
- Docker：Docker容器管理
- GitToolBox：Git增强功能
- REST Client：API测试
- Prettier：代码格式化
- ESLint：代码检查
- Jest：Jest测试支持

### 6.2 命令行工具

- **nvm**：Node.js版本管理
- **npm-check-updates**：检查依赖更新
- **httpie**：命令行HTTP客户端
- **prisma**：数据库ORM（如果使用）

### 6.3 测试工具

- **Jest**：单元测试和集成测试
- **Supertest**：API测试
- **Postman**：API测试和文档
- **Insomnia**：API测试

## 7. 开发流程

### 7.1 代码规范

- 使用TypeScript严格模式
- 遵循ESLint和Prettier规则
- 代码注释清晰，特别是公共API和复杂逻辑
- 函数和变量命名清晰，遵循驼峰命名法

### 7.2 提交规范

使用Conventional Commits规范，提交信息格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

常见type：
- feat：新功能
- fix：bug修复
- docs：文档更新
- style：代码样式修改
- refactor：代码重构
- test：测试相关
- chore：构建或工具变更

### 7.3 测试流程

- 编写单元测试覆盖核心业务逻辑
- 编写集成测试覆盖模块间交互
- 编写API测试覆盖主要接口
- 提交代码前运行所有测试

### 7.4 代码审查

- 所有代码变更都需要经过代码审查
- 至少有一个reviewer批准后才能合并
- 审查重点：代码质量、业务逻辑、安全性、性能

## 8. 常见问题解决

### 8.1 Node.js版本问题

**问题**：安装依赖时出现版本不兼容错误

**解决方案**：
1. 使用nvm安装正确版本的Node.js：
   ```bash
   nvm install 18
   nvm use 18
   ```
2. 清除node_modules和package-lock.json，重新安装：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 8.2 数据库连接问题

**问题**：无法连接到数据库

**解决方案**：
1. 检查数据库是否运行：
   ```bash
   docker ps
   ```
2. 检查数据库连接URL是否正确
3. 检查防火墙设置，确保数据库端口开放

### 8.3 端口占用问题

**问题**：端口被占用，无法启动服务器

**解决方案**：
1. 查找占用端口的进程：
   ```bash
   lsof -i :3000
   ```
2. 终止占用端口的进程：
   ```bash
   kill -9 <pid>
   ```
3. 或修改配置文件，使用其他端口

### 8.4 依赖安装失败

**问题**：npm install失败

**解决方案**：
1. 检查网络连接
2. 清除npm缓存：
   ```bash
   npm cache clean --force
   ```
3. 尝试使用yarn安装：
   ```bash
   yarn install
   ```

## 9. 开发环境优化

### 9.1 使用Docker Compose管理服务

创建`docker-compose.dev.yml`文件，管理开发环境的所有服务：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: ai_cognitive_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  postgres_data:
  redis_data:
  qdrant_data:
```

启动所有服务：

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 9.2 使用npm scripts简化开发流程

在`package.json`中添加有用的脚本：

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
    "typecheck": "tsc --noEmit",
    "migrate:up": "prisma migrate deploy",
    "migrate:down": "prisma migrate reset",
    "seed:dev": "prisma db seed",
    "generate": "prisma generate",
    "docker:up": "docker-compose -f docker-compose.dev.yml up -d",
    "docker:down": "docker-compose -f docker-compose.dev.yml down"
  }
}
```

## 10. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |
