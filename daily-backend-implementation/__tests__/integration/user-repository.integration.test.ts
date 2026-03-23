/**
 * 用户仓库集成测试
 * 测试用户仓库的实现是否正确
 */
import { DataSource } from 'typeorm';
import { UserRepositoryImpl } from '../../src/infrastructure/database/repositories/user-repository-implementation';
import { UserRepository } from '../../src/domain/repositories/user-repository';
import { User } from '../../src/domain/entities/user';
import { UUID } from '../../src/domain/value-objects/uuid';
import { Email } from '../../src/domain/value-objects/email';
import { Password } from '../../src/domain/value-objects/password';
import { RepositoryTestUtils, getDatabaseConnection } from './repository-test-utils';

describe('User Repository Integration Tests', () => {
  let dataSource: DataSource;
  let userRepository: UserRepository;
  let testUtils: RepositoryTestUtils;

  beforeAll(async () => {
    // 获取数据库连接
    dataSource = await getDatabaseConnection();
    
    // 初始化测试工具
    testUtils = new RepositoryTestUtils(dataSource);
    
    // 创建用户仓库实例
    userRepository = new UserRepositoryImpl(
      dataSource.getRepository('UserEntity')
    );
  });

  beforeEach(async () => {
    // 清理数据库
    await testUtils.cleanupDatabase();
  });

  afterAll(async () => {
    // 清理数据库并关闭连接
    await testUtils.cleanupDatabase();
    await dataSource.destroy();
  });

  describe('create()', () => {
    it('should successfully create a user', async () => {
      // 创建测试用户
      const user = await testUtils.createTestUser();
      
      // 保存用户到数据库
      const savedUser = await userRepository.create(user);
      
      // 验证用户被成功保存
      expect(savedUser).toBeDefined();
      expect(savedUser.id).toBe(user.id);
      expect(savedUser.email).toBe(user.email);
      expect(savedUser.passwordHash).toBe(user.passwordHash);
    });
  });

  describe('getById()', () => {
    it('should return a user when the user exists', async () => {
      // 创建并保存测试用户
      const user = await testUtils.createTestUser();
      await userRepository.create(user);
      
      // 根据ID查询用户
      const foundUser = await userRepository.getById(user.id);
      
      // 验证用户被成功找到
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
    });

    it('should return null when the user does not exist', async () => {
      // 查询不存在的用户，使用有效的UUID格式
      const nonExistentId = UUID.generate().value;
      const foundUser = await userRepository.getById(nonExistentId);
      
      // 验证返回null
      expect(foundUser).toBeNull();
    });
  });

  describe('getByEmail()', () => {
    it('should return a user when the email exists', async () => {
      // 创建并保存测试用户
      const user = await testUtils.createTestUser();
      await userRepository.create(user);
      
      // 根据邮箱查询用户
      const foundUser = await userRepository.getByEmail(user.email);
      
      // 验证用户被成功找到
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(user.email);
    });

    it('should return null when the email does not exist', async () => {
      // 查询不存在的邮箱
      const foundUser = await userRepository.getByEmail('non-existent@example.com');
      
      // 验证返回null
      expect(foundUser).toBeNull();
    });
  });

  describe('update()', () => {
    it('should successfully update a user', async () => {
      // 创建并保存测试用户
      const user = await testUtils.createTestUser();
      await userRepository.create(user);
      
      // 更新用户信息
      user.update({
        username: 'updateduser',
        email: 'updated@example.com'
      });
      
      // 保存更新后的用户
      const updatedUser = await userRepository.update(user);
      
      // 验证用户被成功更新
      expect(updatedUser).toBeDefined();
      expect(updatedUser.username).toBe('updateduser');
      expect(updatedUser.email).toBe('updated@example.com');
    });
  });

  describe('delete()', () => {
    it('should successfully delete a user', async () => {
      // 创建并保存测试用户
      const user = await testUtils.createTestUser();
      await userRepository.create(user);
      
      // 删除用户
      const result = await userRepository.delete(user.id);
      
      // 验证用户被成功删除
      expect(result).toBe(true);
      
      // 验证用户不再存在
      const foundUser = await userRepository.getById(user.id);
      expect(foundUser).toBeNull();
    });

    it('should return false when deleting a non-existent user', async () => {
      // 删除不存在的用户，使用有效的UUID格式
      const nonExistentId = UUID.generate().value;
      const result = await userRepository.delete(nonExistentId);
      
      // 验证返回false
      expect(result).toBe(false);
    });
  });

  describe('getAll()', () => {
    it('should return all users', async () => {
      // 创建并保存多个测试用户
      const user1 = await testUtils.createTestUser();
      const user2 = await testUtils.createTestUser();
      user2.username = 'testuser2';
      user2.email = 'test2@example.com';
      
      await userRepository.create(user1);
      await userRepository.create(user2);
      
      // 获取所有用户
      const users = await userRepository.getAll();
      
      // 验证返回所有用户
      expect(users).toHaveLength(2);
    });

    it('should return an empty array when no users exist', async () => {
      // 获取所有用户（此时数据库为空）
      const users = await userRepository.getAll();
      
      // 验证返回空数组
      expect(users).toEqual([]);
    });
  });

  describe('existsByEmail()', () => {
    it('should return true when the email exists', async () => {
      // 创建并保存测试用户
      const user = await testUtils.createTestUser();
      await userRepository.create(user);
      
      // 检查邮箱是否存在
      const exists = await userRepository.existsByEmail(user.email);
      
      // 验证返回true
      expect(exists).toBe(true);
    });

    it('should return false when the email does not exist', async () => {
      // 检查不存在的邮箱
      const exists = await userRepository.existsByEmail('non-existent@example.com');
      
      // 验证返回false
      expect(exists).toBe(false);
    });
  });
});
