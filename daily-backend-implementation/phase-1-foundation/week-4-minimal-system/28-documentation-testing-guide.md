# Day 28: 第一阶段 - 系统地基期 - Week 4 - 第28天 代码实现

## 测试指南

```typescript
// src/documentation/TestingGuide.md

# 测试指南

## 1. 测试概述

本项目使用以下测试框架和工具：

- **Jest**：JavaScript 测试框架
- **Supertest**：HTTP API 测试工具
- **Testcontainers**：Docker 容器测试工具（可选）

## 2. 测试类型

### 2.1 单元测试

单元测试用于测试单个函数、类或组件的功能。

**运行单元测试**：

```bash
npm run test:unit
```

**单元测试文件命名**：

单元测试文件应与被测试文件位于同一目录，命名格式为 `*.test.ts`。

### 2.2 集成测试

集成测试用于测试多个组件之间的交互。

**运行集成测试**：

```bash
npm run test:integration
```

**集成测试文件命名**：

集成测试文件位于 `src/integration-tests` 目录，命名格式为 `*.test.ts`。

### 2.3 端到端测试

端到端测试用于测试整个系统的功能，从用户的角度出发。

**运行端到端测试**：

```bash
npm run test:e2e
```

**端到端测试文件命名**：

端到端测试文件位于 `src/e2e-tests` 目录，命名格式为 `*.test.ts`。

## 3. 测试最佳实践

### 3.1 测试覆盖

目标覆盖率：

- 单元测试：90% 以上
- 集成测试：80% 以上
- 端到端测试：覆盖核心功能

**查看覆盖率报告**：

```bash
npm run test:coverage
```

### 3.2 测试命名

测试用例名称应清晰描述测试的功能和预期结果：

```typescript
describe('ThoughtController', () => {
  it('should create a new thought fragment with valid input', async () => {
    // 测试逻辑
  });

  it('should return 400 error with invalid input', async () => {
    // 测试逻辑
  });
});
```

### 3.3 测试数据

使用模拟数据进行测试，避免依赖外部系统：

```typescript
const mockThought = {
  id: '1',
  content: '测试思维片段',
  tags: ['测试', '单元测试'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

### 3.4 测试清理

确保测试之间相互独立，使用 `beforeAll`、`afterAll`、`beforeEach` 和 `afterEach` 钩子函数进行测试设置和清理：

```typescript
describe('DatabaseClient', () => {
  let databaseClient: DatabaseClient;

  beforeAll(async () => {
    databaseClient = new DatabaseClient(':memory:');
    await databaseClient.connect();
    await databaseClient.initializeTables();
  });

  afterAll(async () => {
    await databaseClient.disconnect();
  });

  beforeEach(async () => {
    // 测试前清理数据
    await databaseClient.executeQuery('DELETE FROM thoughts');
  });

  // 测试用例
});
```

## 4. CI/CD 集成

本项目配置了 CI/CD 流水线，自动运行测试：

- 当代码推送到 `develop` 分支时，运行单元测试和集成测试
- 当代码推送到 `main` 分支时，运行所有测试并构建项目
- 当创建拉取请求时，运行所有测试

## 5. 常见测试问题

### 5.1 测试失败

如果测试失败，首先查看错误信息，然后检查：

- 测试用例逻辑是否正确
- 模拟数据是否符合预期
- 依赖的组件是否正常工作
- 环境配置是否正确

### 5.2 测试速度慢

- 减少测试中的外部依赖
- 使用内存数据库进行测试
```