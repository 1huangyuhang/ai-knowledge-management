# Day 20: 集成测试框架 - 代码实现

## 测试数据生成器

```typescript
// src/__test__/test-data-generator.ts
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { ThoughtFragment } from '../domain/thought/ThoughtFragment';
import { CognitiveConcept } from '../domain/cognitive-model/CognitiveConcept';

/**
 * 测试数据生成器
 */
export class TestDataGenerator {
  /**
   * 生成思维片段测试数据
   */
  public static generateThoughtFragment(overrides?: Partial<ThoughtFragment>): ThoughtFragment {
    return {
      id: uuidv4(),
      content: faker.lorem.paragraph(),
      timestamp: new Date(),
      metadata: {
        source: faker.internet.domainName(),
        tags: [faker.lorem.word(), faker.lorem.word()],
      },
      ...overrides,
    };
  }

  /**
   * 生成认知概念测试数据
   */
  public static generateCognitiveConcept(overrides?: Partial<CognitiveConcept>): CognitiveConcept {
    return {
      id: uuidv4(),
      name: faker.lorem.word(),
      description: faker.lorem.sentence(),
      importance: Math.random() * 10,
      relatedConcepts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * 生成多个思维片段
   */
  public static generateThoughtFragments(count: number): ThoughtFragment[] {
    return Array.from({ length: count }, () => this.generateThoughtFragment());
  }

  /**
   * 生成多个认知概念
   */
  public static generateCognitiveConcepts(count: number): CognitiveConcept[] {
    return Array.from({ length: count }, () => this.generateCognitiveConcept());
  }
}
```

## 测试资源管理器

```typescript
// src/__test__/resource-manager.ts
import { DatabaseClient } from '../infrastructure/database/DatabaseClient';

/**
 * 测试资源管理器
 * 用于管理测试过程中的资源创建和清理
 */
export class ResourceManager {
  private createdResources: Array<() => Promise<void>> = [];
  private databaseClient: DatabaseClient;

  constructor(databaseClient: DatabaseClient) {
    this.databaseClient = databaseClient;
  }

  /**
   * 注册资源清理函数
   * @param cleanupFn 资源清理函数
   */
  public registerCleanup(cleanupFn: () => Promise<void>): void {
    this.createdResources.push(cleanupFn);
  }

  /**
   * 清理所有注册的资源
   */
  public async cleanup(): Promise<void> {
    // 逆序执行清理函数，确保依赖关系正确
    for (const cleanupFn of this.createdResources.reverse()) {
      try {
        await cleanupFn();
      } catch (error) {
        console.error('Error cleaning up resource:', error);
      }
    }
    
    // 清空资源列表
    this.createdResources = [];
  }

  /**
   * 清理数据库表
   * @param tableName 表名
   */
  public async cleanupTable(tableName: string): Promise<void> {
    await this.databaseClient.execute(`DELETE FROM ${tableName}`);
  }

  /**
   * 清理所有数据库表
   */
  public async cleanupAllTables(): Promise<void> {
    const tables = ['thought_fragments', 'cognitive_concepts', 'cognitive_relations', 'events'];
    
    for (const table of tables) {
      await this.cleanupTable(table);
    }
  }
}
```

## 测试工具函数

```typescript
// src/__test__/test-utils.ts
import { DatabaseClient } from '../infrastructure/database/DatabaseClient';
import { EventSystem } from '../infrastructure/event-system/EventSystem';
import { LoggingSystem } from '../infrastructure/logging/LoggingSystem';
import { ErrorHandler } from '../infrastructure/error-handling/ErrorHandler';
import { ResourceManager } from './resource-manager';

/**
 * 测试工具函数
 */
export class TestUtils {
  /**
   * 创建测试环境
   */
  public static async createTestEnvironment() {
    // 创建数据库客户端
    const databaseClient = new DatabaseClient(':memory:');
    await databaseClient.connect();
    
    // 初始化数据库表
    await databaseClient.initializeTables();
    
    // 创建其他基础设施组件
    const eventSystem = new EventSystem();
    const loggingSystem = new LoggingSystem();
    const errorHandler = new ErrorHandler();
    
    // 创建资源管理器
    const resourceManager = new ResourceManager(databaseClient);
    
    return {
      databaseClient,
      eventSystem,
      loggingSystem,
      errorHandler,
      resourceManager,
    };
  }

  /**
   * 清理测试环境
   */
  public static async cleanupTestEnvironment(environment: ReturnType<typeof TestUtils.createTestEnvironment> extends Promise<infer T> ? T : never) {
    await environment.resourceManager.cleanup();
    await environment.databaseClient.disconnect();
  }

  /**
   * 等待指定时间
   * @param ms 毫秒数
   */
  public static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 捕获异步函数的错误
   * @param fn 异步函数
   */
  public static async catchError<T extends (...args: any[]) => Promise<any>>(fn: T): Promise<Error | null> {
    try {
      await fn();
      return null;
    } catch (error) {
      return error as Error;
    }
  }
}
```

## Jest配置文件

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  setupFilesAfterEnv: ['<rootDir>/src/__test__/setup.ts'],
  globalSetup: '<rootDir>/src/__test__/global-setup.ts',
  globalTeardown: '<rootDir>/src/__test__/global-teardown.ts',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

## 测试环境变量配置

```
NODE_ENV=test
DATABASE_URL=:memory:  # 使用内存数据库进行测试
LOG_LEVEL=error  # 测试环境只记录错误日志
TEST_TIMEOUT=10000  # 测试超时时间
```

## 数据库-Repository集成测试

```typescript
// src/infrastructure/database/tests/repository-integration.test.ts
import { DatabaseClient } from '../DatabaseClient';
import { ThoughtFragmentRepository } from '../repositories/ThoughtFragmentRepository';
import { TestDataGenerator } from '../../../__test__/test-data-generator';
import { TestUtils } from '../../../__test__/test-utils';

describe('ThoughtFragmentRepository Integration Tests', () => {
  let databaseClient: DatabaseClient;
  let thoughtFragmentRepository: ThoughtFragmentRepository;

  beforeEach(async () => {
    // 创建测试环境
    const environment = await TestUtils.createTestEnvironment();
    databaseClient = environment.databaseClient;
    thoughtFragmentRepository = new ThoughtFragmentRepository(databaseClient);
  });

  afterEach(async () => {
    // 清理测试环境
    await databaseClient.disconnect();
  });

  test('should save and retrieve a thought fragment', async () => {
    // Arrange
    const thoughtFragment = TestDataGenerator.generateThoughtFragment();

    // Act
    await thoughtFragmentRepository.save(thoughtFragment);
    const retrievedFragment = await thoughtFragmentRepository.findById(thoughtFragment.id);

    // Assert
    expect(retrievedFragment).not.toBeNull();
    expect(retrievedFragment?.id).toBe(thoughtFragment.id);
    expect(retrievedFragment?.content).toBe(thoughtFragment.content);
  });

  test('should save multiple thought fragments', async () => {
    // Arrange
    const thoughtFragments = TestDataGenerator.generateThoughtFragments(5);

    // Act
    for (const fragment of thoughtFragments) {
      await thoughtFragmentRepository.save(fragment);
    }
    const allFragments = await thoughtFragmentRepository.findAll();

    // Assert
    expect(allFragments.length).toBe(5);
    expect(allFragments.map(f => f.id)).toEqual(expect.arrayContaining(thoughtFragments.map(f => f.id)));
  });

  test('should update a thought fragment', async () => {
    // Arrange
    const thoughtFragment = TestDataGenerator.generateThoughtFragment();
    await thoughtFragmentRepository.save(thoughtFragment);

    // Act
    const updatedFragment = { ...thoughtFragment, content: 'Updated content' };
    await thoughtFragmentRepository.update(updatedFragment);
    const retrievedFragment = await thoughtFragmentRepository.findById(thoughtFragment.id);

    // Assert
    expect(retrievedFragment?.content).toBe('Updated content');
  });

  test('should delete a thought fragment', async () => {
    // Arrange
    const thoughtFragment = TestDataGenerator.generateThoughtFragment();
    await thoughtFragmentRepository.save(thoughtFragment);

    // Act
    await thoughtFragmentRepository.delete(thoughtFragment.id);
    const retrievedFragment = await thoughtFragmentRepository.findById(thoughtFragment.id);

    // Assert
    expect(retrievedFragment).toBeNull();
  });

  test('should find thought fragments by tag', async () => {
    // Arrange
    const fragment1 = TestDataGenerator.generateThoughtFragment({
      metadata: { tags: ['test', 'tag1'] },
    });
    const fragment2 = TestDataGenerator.generateThoughtFragment({
      metadata: { tags: ['test', 'tag2'] },
    });
    const fragment3 = TestDataGenerator.generateThoughtFragment({
      metadata: { tags: ['tag3'] },
    });

    await thoughtFragmentRepository.save(fragment1);
    await thoughtFragmentRepository.save(fragment2);
    await thoughtFragmentRepository.save(fragment3);

    // Act
    const fragmentsWithTestTag = await thoughtFragmentRepository.findByTag('test');

    // Assert
    expect(fragmentsWithTestTag.length).toBe(2);
    expect(fragmentsWithTestTag.map(f => f.id)).toEqual(expect.arrayContaining([fragment1.id, fragment2.id]));
  });
});
```

## 事件系统集成测试

```typescript
// src/infrastructure/event-system/tests/event-system-integration.test.ts
import { EventSystem } from '../EventSystem';
import { ThoughtFragmentCreatedEvent } from '../../event-types/ThoughtFragmentCreatedEvent';
import { TestDataGenerator } from '../../../__test__/test-data-generator';

describe('EventSystem Integration Tests', () => {
  let eventSystem: EventSystem;

  beforeEach(() => {
    eventSystem = new EventSystem();
  });

  test('should publish and subscribe to events', async () => {
    // Arrange
    const event = new ThoughtFragmentCreatedEvent(TestDataGenerator.generateThoughtFragment());
    const receivedEvents: any[] = [];

    // Act
    eventSystem.subscribe('ThoughtFragmentCreated', (e) => {
      receivedEvents.push(e);
    });

    await eventSystem.publish(event);

    // Assert
    expect(receivedEvents.length).toBe(1);
    expect(receivedEvents[0]).toBeInstanceOf(ThoughtFragmentCreatedEvent);
    expect(receivedEvents[0].thoughtFragment.id).toBe(event.thoughtFragment.id);
  });

  test('should support multiple subscribers for the same event', async () => {
    // Arrange
    const event = new ThoughtFragmentCreatedEvent(TestDataGenerator.generateThoughtFragment());
    const receivedEvents1: any[] = [];
    const receivedEvents2: any[] = [];

    // Act
    eventSystem.subscribe('ThoughtFragmentCreated', (e) => {
      receivedEvents1.push(e);
    });

    eventSystem.subscribe('ThoughtFragmentCreated', (e) => {
      receivedEvents2.push(e);
    });

    await eventSystem.publish(event);

    // Assert
    expect(receivedEvents1.length).toBe(1);
    expect(receivedEvents2.length).toBe(1);
    expect(receivedEvents1[0].thoughtFragment.id).toBe(event.thoughtFragment.id);
    expect(receivedEvents2[0].thoughtFragment.id).toBe(event.thoughtFragment.id);
  });

  test('should support unsubscribe functionality', async () => {
    // Arrange
    const event = new ThoughtFragmentCreatedEvent(TestDataGenerator.generateThoughtFragment());
    const receivedEvents: any[] = [];

    const subscriber = (e: any) => {
      receivedEvents.push(e);
    };

    // Act
    eventSystem.subscribe('ThoughtFragmentCreated', subscriber);
    eventSystem.unsubscribe('ThoughtFragmentCreated', subscriber);
    await eventSystem.publish(event);

    // Assert
    expect(receivedEvents.length).toBe(0);
  });

  test('should support wildcard subscribers', async () => {
    // Arrange
    const thoughtEvent = new ThoughtFragmentCreatedEvent(TestDataGenerator.generateThoughtFragment());
    const receivedEvents: any[] = [];

    // Act
    eventSystem.subscribe('*', (e) => {
      receivedEvents.push(e);
    });

    await eventSystem.publish(thoughtEvent);

    // Assert
    expect(receivedEvents.length).toBe(1);
    expect(receivedEvents[0]).toBeInstanceOf(ThoughtFragmentCreatedEvent);
  });
});
```

## 日志系统集成测试

```typescript
// src/infrastructure/logging/tests/logging-integration.test.ts
import { LoggingSystem } from '../LoggingSystem';
import { ThoughtFragmentCreatedEvent } from '../../event-types/ThoughtFragmentCreatedEvent';
import { TestDataGenerator } from '../../../__test__/test-data-generator';

describe('LoggingSystem Integration Tests', () => {
  let loggingSystem: LoggingSystem;
  let originalConsoleLog: typeof console.log;
  let logs: string[] = [];

  beforeEach(() => {
    // 保存原始console.log
    originalConsoleLog = console.log;
    
    // 重写console.log以捕获日志
    console.log = (...args: any[]) => {
      logs.push(JSON.stringify(args));
      originalConsoleLog(...args);
    };
    
    loggingSystem = new LoggingSystem();
    logs = [];
  });

  afterEach(() => {
    // 恢复原始console.log
    console.log = originalConsoleLog;
  });

  test('should log events', async () => {
    // Arrange
    const event = new ThoughtFragmentCreatedEvent(TestDataGenerator.generateThoughtFragment());

    // Act
    loggingSystem.logEvent(event);

    // Assert
    expect(logs.length).toBeGreaterThan(0);
    const logEntry = logs[0];
    expect(logEntry).toContain('ThoughtFragmentCreated');
    expect(logEntry).toContain(event.thoughtFragment.id);
  });

  test('should log errors', async () => {
    // Arrange
    const error = new Error('Test error');

    // Act
    loggingSystem.logError(error, { context: 'test' });

    // Assert
    expect(logs.length).toBeGreaterThan(0);
    const logEntry = logs[0];
    expect(logEntry).toContain('ERROR');
    expect(logEntry).toContain('Test error');
    expect(logEntry).toContain('test');
  });

  test('should log info messages', async () => {
    // Arrange
    const message = 'Test info message';

    // Act
    loggingSystem.logInfo(message, { context: 'test' });

    // Assert
    expect(logs.length).toBeGreaterThan(0);
    const logEntry = logs[0];
    expect(logEntry).toContain('INFO');
    expect(logEntry).toContain('Test info message');
    expect(logEntry).toContain('test');
  });

  test('should support different log levels', async () => {
    // Arrange
    const debugMessage = 'Test debug message';
    const warnMessage = 'Test warn message';

    // Act
    loggingSystem.logDebug(debugMessage);
    loggingSystem.logWarn(warnMessage);

    // Assert
    expect(logs.length).toBe(2);
    expect(logs[0]).toContain('DEBUG');
    expect(logs[0]).toContain('Test debug message');
    expect(logs[1]).toContain('WARN');
    expect(logs[1]).toContain('Test warn message');
  });
});
```

## 错误处理集成测试

```typescript
// src/infrastructure/error-handling/tests/error-handling-integration.test.ts
import { ErrorHandler } from '../ErrorHandler';
import { SystemError, DatabaseError, ErrorCode } from '../custom-error';
import { DatabaseClient } from '../../database/DatabaseClient';

describe('ErrorHandling Integration Tests', () => {
  let errorHandler: ErrorHandler;
  let originalConsoleError: typeof console.error;
  let errorLogs: string[] = [];

  beforeEach(() => {
    // 保存原始console.error
    originalConsoleError = console.error;
    
    // 重写console.error以捕获错误日志
    console.error = (...args: any[]) => {
      errorLogs.push(JSON.stringify(args));
      originalConsoleError(...args);
    };
    
    errorHandler = new ErrorHandler();
    errorLogs = [];
  });

  afterEach(() => {
    // 恢复原始console.error
    console.error = originalConsoleError;
  });

  test('should handle system errors', async () => {
    // Arrange
    const error = new SystemError('Test system error', ErrorCode.SYSTEM_ERROR);

    // Act
    errorHandler.handle(error);

    // Assert
    expect(errorLogs.length).toBeGreaterThan(0);
    const logEntry = errorLogs[0];
    expect(logEntry).toContain('SYSTEM_ERROR');
    expect(logEntry).toContain('Test system error');
    expect(logEntry).toContain(ErrorCode.SYSTEM_ERROR);
  });

  test('should handle database errors', async () => {
    // Arrange
    const error = new DatabaseError('Test database error', ErrorCode.DATABASE_QUERY_ERROR);

    // Act
    errorHandler.handle(error);

    // Assert
    expect(errorLogs.length).toBeGreaterThan(0);
    const logEntry = errorLogs[0];
    expect(logEntry).toContain('SYSTEM_ERROR');
    expect(logEntry).toContain('Test database error');
    expect(logEntry).toContain(ErrorCode.DATABASE_QUERY_ERROR);
  });

  test('should normalize regular errors', async () => {
    // Arrange
    const regularError = new Error('Test regular error');

    // Act
    const normalizedError = errorHandler.normalizeError(regularError);

    // Assert
    expect(normalizedError).toBeInstanceOf(SystemError);
    expect(normalizedError.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
  });

  test('should generate client response', async () => {
    // Arrange
    const error = new SystemError('Test error', ErrorCode.SYSTEM_ERROR);

    // Act
    const response = errorHandler.getClientResponse(error);

    // Assert
    expect(response.success).toBe(false);
    expect(response.error).toHaveProperty('message', 'Test error');
    expect(response.error).toHaveProperty('code', ErrorCode.SYSTEM_ERROR);
    expect(response.error).toHaveProperty('type', 'system');
  });

  test('should handle database connection errors', async () => {
    // Arrange
    const databaseClient = new DatabaseClient('invalid-database-path');

    // Act
    try {
      await databaseClient.connect();
      fail('Should have thrown an error');
    } catch (error) {
      errorHandler.handle(error as Error, { context: 'database-connection' });
    }

    // Assert
    expect(errorLogs.length).toBeGreaterThan(0);
    const logEntry = errorLogs[0];
    expect(logEntry).toContain('SYSTEM_ERROR');
    expect(logEntry).toContain('database-connection');
  });
});
```

## 完整系统集成测试

```typescript
// src/application/tests/system-integration.test.ts
import { Application } from '../Application';
import { TestDataGenerator } from '../../__test__/test-data-generator';
import { TestUtils } from '../../__test__/test-utils';

describe('System Integration Tests', () => {
  let application: Application;

  beforeEach(async () => {
    // 创建测试环境
    const testEnv = await TestUtils.createTestEnvironment();
    
    // 创建应用实例
    application = new Application({
      databaseClient: testEnv.databaseClient,
      eventSystem: testEnv.eventSystem,
      loggingSystem: testEnv.loggingSystem,
      errorHandler: testEnv.errorHandler,
    });
  });

  test('should handle complete thought processing flow', async () => {
    // Arrange
    const thoughtFragment = TestDataGenerator.generateThoughtFragment();

    // Act
    // 1. 摄入思维片段
    const ingestedFragment = await application.ingestThought(thoughtFragment);
    
    // 2. 解析思维片段（模拟AI解析）
    const parsingResult = await application.parseThought(ingestedFragment.id);
    
    // 3. 更新认知模型
    const updateResult = await application.updateCognitiveModel(parsingResult.proposal);

    // Assert
    expect(ingestedFragment).toBeDefined();
    expect(ingestedFragment.id).toBe(thoughtFragment.id);
    
    expect(parsingResult).toBeDefined();
    expect(parsingResult.proposal).toBeDefined();
    expect(parsingResult.proposal.concepts).toBeInstanceOf(Array);
    
    expect(updateResult).toBeDefined();
    expect(updateResult.success).toBe(true);
  });

  test('should handle error in processing flow', async () => {
    // Arrange
    const invalidThoughtFragment = TestDataGenerator.generateThoughtFragment({
      content: '', // 无效的空内容
    });

    // Act & Assert
    await expect(application.ingestThought(invalidThoughtFragment)).rejects.toThrow();
  });

  test('should generate cognitive insights', async () => {
    // Arrange
    // 摄入多个相关思维片段
    const fragment1 = TestDataGenerator.generateThoughtFragment({
      content: 'AI is transforming the world of technology.',
      metadata: { tags: ['ai', 'technology'] },
    });
    
    const fragment2 = TestDataGenerator.generateThoughtFragment({
      content: 'Machine learning is a subset of AI that enables systems to learn from data.',
      metadata: { tags: ['ai', 'machine-learning'] },
    });
    
    const fragment3 = TestDataGenerator.generateThoughtFragment({
      content: 'Deep learning uses neural networks to process complex data.',
      metadata: { tags: ['ai', 'deep-learning'] },
    });
    
    await application.ingestThought(fragment1);
    await application.ingestThought(fragment2);
    await application.ingestThought(fragment3);

    // Act
    const insights = await application.generateCognitiveInsights();

    // Assert
    expect(insights).toBeInstanceOf(Array);
    expect(insights.length).toBeGreaterThan(0);
    
    // 检查是否包含AI相关的洞察
    const aiInsight = insights.find(insight => insight.topic.toLowerCase().includes('ai'));
    expect(aiInsight).toBeDefined();
  });
});
```

## API集成测试

```typescript
// src/application/tests/api-integration.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createExpressApp } from '../express-app';
import { TestUtils } from '../../__test__/test-utils';
import { TestDataGenerator } from '../../__test__/test-data-generator';

describe('API Integration Tests', () => {
  let app: Express;

  beforeEach(async () => {
    // 创建测试环境
    const testEnv = await TestUtils.createTestEnvironment();
    
    // 创建Express应用
    app = createExpressApp({
      databaseClient: testEnv.databaseClient,
      eventSystem: testEnv.eventSystem,
      loggingSystem: testEnv.loggingSystem,
      errorHandler: testEnv.errorHandler,
    });
  });

  test('should create a thought fragment via API', async () => {
    // Arrange
    const thoughtData = {
      content: 'Test thought via API',
      metadata: {
        tags: ['api-test', 'integration'],
      },
    };

    // Act
    const response = await request(app)
      .post('/api/thoughts')
      .send(thoughtData)
      .set('Accept', 'application/json');

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.content).toBe(thoughtData.content);
  });

  test('should get all thought fragments via API', async () => {
    // Arrange
    // 先创建一些测试数据
    const thought1 = TestDataGenerator.generateThoughtFragment();
    const thought2 = TestDataGenerator.generateThoughtFragment();
    
    await request(app)
      .post('/api/thoughts')
      .send(thought1)
      .set('Accept', 'application/json');
    
    await request(app)
      .post('/api/thoughts')
      .send(thought2)
      .set('Accept', 'application/json');

    // Act
    const response = await request(app)
      .get('/api/thoughts')
      .set('Accept', 'application/json');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  test('should get a thought fragment by ID via API', async () => {
    // Arrange
    const thought = TestDataGenerator.generateThoughtFragment();
    
    const createResponse = await request(app)
      .post('/api/thoughts')
      .send(thought)
      .set('Accept', 'application/json');
    
    const thoughtId = createResponse.body.id;

    // Act
    const getResponse = await request(app)
      .get(`/api/thoughts/${thoughtId}`)
      .set('Accept', 'application/json');

    // Assert
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(thoughtId);
    expect(getResponse.body.content).toBe(thought.content);
  });

  test('should return 404 for non-existent thought fragment', async () => {
    // Act
    const response = await request(app)
      .get('/api/thoughts/non-existent-id')
      .set('Accept', 'application/json');

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty('message');
  });

  test('should generate cognitive insights via API', async () => {
    // Arrange
    // 创建一些测试数据
    const thought = TestDataGenerator.generateThoughtFragment({
      content: 'AI is transforming the world.',
      metadata: { tags: ['ai'] },
    });
    
    await request(app)
      .post('/api/thoughts')
      .send(thought)
      .set('Accept', 'application/json');

    // Act
    const response = await request(app)
      .get('/api/insights')
      .set('Accept', 'application/json');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
```

## 测试执行脚本

```json
{
  "scripts": {
    "test": "jest",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

## 性能测试脚本

```bash
#!/bin/bash

# 使用autocannon进行API性能测试
npx autocannon -c 100 -d 30 http://localhost:3000/api/health
```

## 安全测试脚本

```bash
#!/bin/bash

# 使用OWASP ZAP进行安全测试
zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' http://localhost:3000
```