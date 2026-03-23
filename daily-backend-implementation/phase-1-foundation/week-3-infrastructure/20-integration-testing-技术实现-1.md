# Day 20: 集成测试框架 - 代码实现（第一部分）

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
