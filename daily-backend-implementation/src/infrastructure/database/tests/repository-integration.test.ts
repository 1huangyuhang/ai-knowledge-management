import { ThoughtFragmentRepositoryImpl } from '../repositories/thought-fragment-repository-implementation';
import { TestDataGenerator } from '../../../__test__/test-data-generator';
import { TestUtils } from '../../../__test__/test-utils';
import { ThoughtFragmentImpl } from '../../../domain/entities/thought-fragment';
import { UUID } from '../../../domain/value-objects/uuid';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { ThoughtFragmentEntity } from '../entities/thought-fragment.entity';
import { UserImpl } from '../../../domain/entities/user';
import { Email } from '../../../domain/value-objects/email';
import { Password } from '../../../domain/value-objects/password';

describe('ThoughtFragmentRepository Integration Tests', () => {
  let repository: ThoughtFragmentRepositoryImpl;
  let testEnv: any;

  beforeEach(async () => {
    // 创建测试环境
    testEnv = await TestUtils.createTestEnvironment();
    const dataSource = testEnv.databaseConnection.getConnection();
    
    if (!dataSource) {
      throw new Error('Failed to get database connection');
    }
    
    // 获取UserEntity的Repository
    const userEntityRepository = dataSource.getRepository(UserEntity);
    // 获取ThoughtFragmentEntity的Repository
    const thoughtFragmentEntityRepository = dataSource.getRepository(ThoughtFragmentEntity);
    
    // 创建ThoughtFragmentRepositoryImpl实例
    repository = new ThoughtFragmentRepositoryImpl(thoughtFragmentEntityRepository);
    
    // 保存Repository实例到testEnv以便测试中使用
    (testEnv as any).userEntityRepository = userEntityRepository;
    (testEnv as any).thoughtFragmentEntityRepository = thoughtFragmentEntityRepository;
  });

  afterEach(async () => {
    // 清理测试环境
    await TestUtils.cleanupTestEnvironment(testEnv);
  });

  test('should create and retrieve a thought fragment', async () => {
    // Arrange
    // 先创建用户，让TypeORM自动生成UUID
    const user = await (testEnv as any).userEntityRepository.save({
      email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
      password: 'test-password',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true
    });
    
    // 直接使用实体创建思想片段
    const createdEntity = await (testEnv as any).thoughtFragmentEntityRepository.save({
      userId: user.id,
      content: 'Test thought content',
      source: 'test-source',
      isProcessed: false
    });
    
    // Act
    const retrievedFragment = await repository.getById(UUID.fromString(createdEntity.id));

    // Assert
    expect(retrievedFragment).not.toBeNull();
    expect(retrievedFragment?.id).toBe(createdEntity.id);
    expect(retrievedFragment?.content).toBe(createdEntity.content);
    expect(retrievedFragment?.userId).toBe(createdEntity.userId);
  });

  test('should get thought fragments by user ID', async () => {
    // Arrange
    // 先创建用户，让TypeORM自动生成UUID
    const user1 = await (testEnv as any).userEntityRepository.save({
      email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
      password: 'test-password1',
      firstName: 'Test1',
      lastName: 'User1',
      role: 'USER',
      isActive: true
    });
    
    const user2 = await (testEnv as any).userEntityRepository.save({
      email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
      password: 'test-password2',
      firstName: 'Test2',
      lastName: 'User2',
      role: 'USER',
      isActive: true
    });
    
    // 使用实际保存的用户ID创建思想片段
    const fragment1 = new ThoughtFragmentImpl(
      UUID.generate().toString(),
      'Test thought 1',
      user1.id,
      { source: 'test-source' },
      false,
      0,
      null,
      new Date()
    );
    
    const fragment2 = new ThoughtFragmentImpl(
      UUID.generate().toString(),
      'Test thought 2',
      user1.id,
      { source: 'test-source' },
      false,
      0,
      null,
      new Date()
    );
    
    // 创建属于用户2的一个思想片段
    const fragment3 = new ThoughtFragmentImpl(
      UUID.generate().toString(),
      'Test thought 3',
      user2.id,
      { source: 'test-source' },
      false,
      0,
      null,
      new Date()
    );
    
    await repository.create(fragment1);
    await repository.create(fragment2);
    await repository.create(fragment3);

    // Act
    const user1Fragments = await repository.getByUserId(UUID.fromString(user1.id));
    const user2Fragments = await repository.getByUserId(UUID.fromString(user2.id));

    // Assert
    expect(user1Fragments.length).toBe(2);
    expect(user2Fragments.length).toBe(1);
    expect(user1Fragments.map(f => f.content)).toEqual(expect.arrayContaining(['Test thought 1', 'Test thought 2']));
  });

  test('should update a thought fragment', async () => {
    // Arrange
    // 先创建用户，让TypeORM自动生成UUID
    const user = await (testEnv as any).userEntityRepository.save({
      email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
      password: 'test-password',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true
    });
    
    // 直接使用实体创建思想片段
    const createdEntity = await (testEnv as any).thoughtFragmentEntityRepository.save({
      userId: user.id,
      content: 'Original content',
      source: 'test-source',
      isProcessed: false
    });
    
    // 获取已创建的思想片段
    const createdFragment = await repository.getById(UUID.fromString(createdEntity.id));
    expect(createdFragment).not.toBeNull();
    
    // 更新内容
    const updatedFragment = new ThoughtFragmentImpl(
      createdFragment!.id,
      'Updated content',
      user.id,
      { source: 'test-source' },
      true, // 标记为已处理
      0,
      null,
      createdFragment!.createdAt
    );

    // Act
    const result = await repository.update(updatedFragment);
    const retrievedFragment = await repository.getById(UUID.fromString(createdEntity.id));

    // Assert
    expect(result.content).toBe('Updated content');
    expect(result.isProcessed).toBe(true);
    expect(retrievedFragment?.content).toBe('Updated content');
    expect(retrievedFragment?.isProcessed).toBe(true);
  });

  test('should delete a thought fragment', async () => {
    // Arrange
    // 先创建用户，让TypeORM自动生成UUID
    const user = await (testEnv as any).userEntityRepository.save({
      email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
      password: 'test-password',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true
    });
    
    // 直接使用实体创建思想片段
    const createdEntity = await (testEnv as any).thoughtFragmentEntityRepository.save({
      userId: user.id,
      content: 'Test thought content',
      source: 'test-source',
      isProcessed: false
    });

    // Act
    const deleteResult = await repository.delete(UUID.fromString(createdEntity.id));
    const retrievedFragment = await repository.getById(UUID.fromString(createdEntity.id));

    // Assert
    expect(deleteResult).toBe(true);
    expect(retrievedFragment).toBeNull();
  });

  test('should get unprocessed thought fragments', async () => {
    // Arrange
    // 先创建用户，让TypeORM自动生成UUID
    const user = await (testEnv as any).userEntityRepository.save({
      email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
      password: 'test-password',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true
    });
    
    // 直接使用实体创建思想片段，确保数据正确保存
    const unprocessedEntity = await (testEnv as any).thoughtFragmentEntityRepository.save({
      userId: user.id,
      content: 'Unprocessed thought',
      source: 'test-source',
      isProcessed: false
    });
    
    const processedEntity = await (testEnv as any).thoughtFragmentEntityRepository.save({
      userId: user.id,
      content: 'Processed thought',
      source: 'test-source',
      isProcessed: true
    });

    // Act
    const unprocessedFragments = await repository.getUnprocessedByUserId(UUID.fromString(user.id));

    // Assert
    expect(unprocessedFragments.length).toBe(1);
    expect(unprocessedFragments[0].content).toBe('Unprocessed thought');
    expect(unprocessedFragments[0].isProcessed).toBe(false);
  });
});