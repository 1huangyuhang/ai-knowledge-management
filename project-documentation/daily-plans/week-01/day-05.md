# Day 05: 建立项目目录结构

## 当日主题

建立符合 Clean Architecture 的项目目录结构，为后续开发做好准备。

## 技术要点

- Clean Architecture 目录结构
- 模块划分原则
- 项目配置文件
- TypeScript 项目初始化
- 依赖管理

## 开发任务

1. 建立项目基础目录结构：
   ```
   src/
   ├── domain/              # 领域层
   │   ├── entities/        # 实体
   │   ├── services/        # 领域服务
   │   └── value-objects/   # 值对象
   ├── application/         # 应用层
   │   ├── usecases/        # 用例
   │   ├── ports/           # 接口定义
   │   └── dtos/            # 数据传输对象
   ├── infrastructure/      # 基础设施层
   │   ├── ai/              # AI 实现
   │   ├── persistence/     # 持久化
   │   └── event/           # 事件处理
   └── interfaces/          # 交互层
       └── http/            # HTTP API
   ```

2. 初始化项目配置文件：
   - package.json：项目依赖和脚本
   - tsconfig.json：TypeScript 配置
   - .env.example：环境变量示例
   - .gitignore：Git 忽略文件
   - eslint.config.js：ESLint 配置
   - jest.config.js：Jest 测试配置

3. 安装必要的依赖：
   - TypeScript
   - Fastify
   - SQLite 相关库
   - 测试框架
   - 代码质量工具

4. 配置开发环境：
   - 设置 TypeScript 编译选项
   - 配置 ESLint 规则
   - 设置 Jest 测试环境

## 验收标准

- 项目目录结构符合 Clean Architecture 原则
- 所有必要的配置文件已创建
- 项目能正常编译
- 代码质量工具能正常运行

## 交付物

- 完整的项目目录结构
- 初始化的配置文件
- 安装的依赖列表
- 可运行的开发环境

## 学习资源

- Clean Architecture 目录结构最佳实践
- TypeScript 项目配置指南
- Fastify 项目初始化文档
- 代码质量工具配置文档