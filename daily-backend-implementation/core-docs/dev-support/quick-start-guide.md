# AI认知辅助系统 - 快速入门指南
#快速入门 #开发支持 #环境配置 #开发流程 #最佳实践

## 1. 文档概述

本文档是AI认知辅助系统的快速入门指南，旨在帮助新开发者快速搭建开发环境、了解开发流程，并开始系统开发。通过本文档，开发者可以快速上手系统开发，避免常见的配置问题和开发陷阱。

### 1.1 相关文档

- [项目概述](project-overview.md) - 系统整体概述
- [开发环境设置](development-environment-setup.md) - 详细的开发环境配置指南
- [开发规范](development-standards.md) - 系统开发规范
- [API设计](../core-features/api-design.md) - API设计规范
- [领域模型设计](../layered-design/domain-model-design.md) - 领域模型详细设计

## 2. 环境准备

### 2.1 硬件要求

- **CPU**：至少4核处理器
- **内存**：至少8GB RAM
- **存储**：至少50GB可用磁盘空间
- **网络**：稳定的互联网连接（用于安装依赖和访问外部服务）

### 2.2 软件要求

| 软件名称 | 版本要求 | 用途 | 安装方式 |
|----------|----------|------|----------|
| Node.js | LTS (≥18.0.0) | 运行环境 | [Node.js官网](https://nodejs.org/) |
| npm | ≥9.0.0 | 包管理工具 | 随Node.js安装 |
| Git | ≥2.30.0 | 版本控制 | [Git官网](https://git-scm.com/) |
| Docker | 最新稳定版 | 容器化部署 | [Docker官网](https://www.docker.com/) |
| Docker Compose | ≥2.0.0 | 容器编排 | 随Docker安装或单独安装 |
| PostgreSQL | ≥14.0 | 关系型数据库 | Docker或直接安装 |
| Redis | ≥7.0 | 缓存数据库 | Docker或直接安装 |
| Qdrant | ≥1.0 | 向量数据库 | Docker或直接安装 |

### 2.3 软件安装

#### 2.3.1 Node.js和npm安装

1. 访问Node.js官网（https://nodejs.org/）下载对应操作系统的LTS版本
2. 运行安装程序，按照提示完成安装
3. 验证安装：
   ```bash
   node --version
   npm --version
   ```

#### 2.3.2 Git安装

1. 访问Git官网（https://git-scm.com/）下载对应操作系统的版本
2. 运行安装程序，按照提示完成安装
3. 验证安装：
   ```bash
   git --version
   ```

#### 2.3.3 Docker安装

1. 访问Docker官网（https://www.docker.com/）下载对应操作系统的版本
2. 运行安装程序，按照提示完成安装
3. 验证安装：
   ```bash
   docker --version
   docker-compose --version
   ```

## 3. 项目克隆与配置

### 3.1 项目克隆

1. 克隆项目代码：
   ```bash
   git clone <项目仓库地址>
   cd daily-backend-implementation
   ```

2. 查看项目结构：
   ```bash
   ls -la
   ```

### 3.2 依赖安装

1. 安装项目依赖：
   ```bash
   npm install
   ```

2. 安装开发依赖：
   ```bash
   npm install --save-dev
   ```

### 3.3 配置文件

1. 复制配置模板文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑`.env`文件，配置以下关键参数：
   ```dotenv
   # 服务器配置
   PORT=3000
   HOST=0.0.0.0
   NODE_ENV=development
   
   # 数据库配置
   DATABASE_URL=postgresql://user:password@localhost:5432/cognitive_assistant
   
   # Redis配置
   REDIS_URL=redis://localhost:6379
   
   # Qdrant配置
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=
   
   # JWT配置
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   
   # OpenAI配置
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_MODEL=gpt-3.5-turbo
   
   # 日志配置
   LOG_LEVEL=info
   ```

## 4. 数据库配置

### 4.1 使用Docker启动数据库

1. 启动PostgreSQL、Redis和Qdrant：
   ```bash
   docker-compose up -d
   ```

2. 验证数据库服务是否正常运行：
   ```bash
   docker ps
   ```

### 4.2 数据库初始化

1. 运行数据库迁移：
   ```bash
   npm run migrate
   ```

2. 初始化测试数据（可选）：
   ```bash
   npm run seed
   ```

## 5. 开发流程

### 5.1 启动开发服务器

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 验证服务器是否正常运行：
   - 访问 http://localhost:3000
   - 查看控制台输出，确保没有错误

### 5.2 API文档访问

1. 启动开发服务器后，可以访问API文档：
   - Swagger UI：http://localhost:3000/documentation
   - OpenAPI JSON：http://localhost:3000/openapi.json

### 5.3 开发规范

1. **代码风格**：遵循ESLint和Prettier配置
   - 运行代码检查：
     ```bash
     npm run lint
     ```
   - 自动修复代码风格问题：
     ```bash
     npm run lint:fix
     ```

2. **类型检查**：使用TypeScript进行类型检查
   ```bash
   npm run typecheck
   ```

3. **测试**：编写单元测试和集成测试
   - 运行单元测试：
     ```bash
     npm run test:unit
     ```
   - 运行集成测试：
     ```bash
     npm run test:integration
     ```
   - 运行所有测试：
     ```bash
     npm run test
     ```

### 5.4 提交代码

1. 查看修改的文件：
   ```bash
   git status
   ```

2. 添加修改的文件：
   ```bash
   git add .
   ```

3. 提交代码：
   ```bash
   git commit -m "feat: add new feature" # 遵循Conventional Commits规范
   ```

4. 推送代码：
   ```bash
   git push origin <branch-name>
   ```

### 5.5 分支管理

- **main/master**：主分支，用于发布生产版本
- **develop**：开发分支，用于集成新功能
- **feature/**：功能分支，用于开发新功能
- **bugfix/**：bug修复分支，用于修复bug
- **hotfix/**：紧急修复分支，用于修复生产环境的紧急bug

## 6. 核心功能开发示例

### 6.1 创建新的API端点

1. 在`src/presentation/routes/`目录下创建新的路由文件
2. 在`src/presentation/controllers/`目录下创建新的控制器
3. 在`src/application/use-cases/`目录下创建新的用例
4. 在`src/domain/repositories/`目录下定义新的仓库接口
5. 在`src/infrastructure/repositories/`目录下实现仓库接口

### 6.2 开发新的领域实体

1. 在`src/domain/entities/`目录下创建新的实体类
2. 在`src/domain/value-objects/`目录下创建相关的值对象（如果需要）
3. 在`src/domain/repositories/`目录下定义新的仓库接口
4. 实现相关的领域服务（如果需要）

### 6.3 集成AI功能

1. 在`src/ai/`目录下创建新的AI服务
2. 在应用层或领域层中使用AI服务
3. 确保AI服务的调用是可配置和可替换的

## 7. 常见问题与解决方案

### 7.1 依赖安装失败

**问题**：npm install 失败，出现依赖冲突

**解决方案**：
1. 清除npm缓存：
   ```bash
   npm cache clean --force
   ```
2. 删除node_modules目录和package-lock.json：
   ```bash
   rm -rf node_modules package-lock.json
   ```
3. 重新安装依赖：
   ```bash
   npm install
   ```

### 7.2 数据库连接失败

**问题**：无法连接到PostgreSQL数据库

**解决方案**：
1. 确保PostgreSQL服务正在运行：
   ```bash
   docker ps | grep postgres
   ```
2. 检查数据库连接配置是否正确：
   - 验证数据库URL格式
   - 检查用户名和密码是否正确
   - 检查数据库是否存在
3. 查看数据库日志：
   ```bash
   docker logs <postgres-container-id>
   ```

### 7.3 开发服务器启动失败

**问题**：npm run dev 启动失败

**解决方案**：
1. 检查端口是否被占用：
   ```bash
   lsof -i :3000
   ```
2. 检查配置文件是否正确：
   - 验证.env文件中的配置
   - 检查tsconfig.json配置
3. 查看错误日志，定位具体问题

### 7.4 测试失败

**问题**：单元测试或集成测试失败

**解决方案**：
1. 查看测试输出，定位失败的测试用例
2. 检查测试代码和被测试代码
3. 确保测试环境配置正确
4. 运行单个测试用例进行调试：
   ```bash
   npm run test:unit -- <test-file-path>
   ```

## 8. 开发工具推荐

### 8.1 代码编辑器

- **VS Code**：推荐使用VS Code作为主要编辑器
  - 安装以下插件：
    - ESLint
    - Prettier
    - TypeScript Hero
    - GitLens
    - Docker

### 8.2 数据库管理工具

- **pgAdmin**：PostgreSQL数据库管理工具
- **RedisInsight**：Redis数据库管理工具
- **Qdrant Web UI**：Qdrant向量数据库管理工具（内置）

### 8.3 API测试工具

- **Postman**：API测试和调试工具
- **Insomnia**：API测试和调试工具
- **curl**：命令行API测试工具

## 9. 学习资源

### 9.1 技术文档

- [Fastify Documentation](https://www.fastify.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

### 9.2 架构设计

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://domainlanguage.com/ddd/)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)

### 9.3 开发实践

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## 10. 团队协作

### 10.1 沟通渠道

- **Slack/Microsoft Teams**：日常沟通和讨论
- **Jira/Confluence**：项目管理和文档共享
- **GitHub/GitLab**：代码管理和代码审查
- **Daily Standup**：每日15分钟站会，同步工作进度

### 10.2 代码审查

- 所有代码变更都需要经过代码审查
- 使用Pull Request/Merge Request进行代码审查
- 代码审查重点关注：
  - 代码质量和可读性
  - 业务逻辑正确性
  - 性能和安全性
  - 测试覆盖率

### 10.3 持续集成

- 使用CI/CD流水线自动运行测试和构建
- 确保所有测试通过后才能合并代码
- 自动部署到测试环境

## 11. 下一步

1. 阅读项目概述文档，深入了解项目背景和目标
2. 学习架构设计文档，理解系统架构和设计原则
3. 熟悉数据模型定义，了解系统的数据结构
4. 查看API规范文档，了解系统的API接口
5. 开始开发第一个功能或修复第一个bug

## 12. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |