/**
 * 数据库连接集成测试
 * 测试数据库连接的初始化、健康检查和断开连接功能
 */
import { DatabaseConnection } from '../../src/infrastructure/database/database-connection';

describe('Database Connection Integration Tests', () => {
  let databaseConnection: DatabaseConnection;

  beforeAll(async () => {
    // 创建数据库连接实例
    databaseConnection = DatabaseConnection.getInstance();
  });

  afterAll(async () => {
    // 确保数据库连接已断开
    if (databaseConnection.isConnected()) {
      await databaseConnection.getConnection()?.destroy();
    }
  });

  describe('initialize()', () => {
    it('should successfully initialize the database connection', async () => {
      // 初始化数据库连接
      const dataSource = await databaseConnection.initialize();
      
      // 验证连接成功
      expect(dataSource).toBeDefined();
      expect(dataSource.isInitialized).toBe(true);
      expect(databaseConnection.isConnected()).toBe(true);
    });

    it('should return the existing connection when initialize is called multiple times', async () => {
      // 第一次初始化
      const dataSource1 = await databaseConnection.initialize();
      
      // 第二次初始化，应该返回相同的连接
      const dataSource2 = await databaseConnection.initialize();
      
      // 验证是同一个连接实例
      expect(dataSource1).toBe(dataSource2);
    });
  });

  describe('healthCheck()', () => {
    it('should return true when the database connection is healthy', async () => {
      // 确保连接已初始化
      await databaseConnection.initialize();
      
      // 执行健康检查
      const health = await databaseConnection.healthCheck();
      
      // 验证健康检查通过
      expect(health).toBe(true);
    });
  });

  describe('isConnected()', () => {
    it('should return true when the database is connected', async () => {
      // 确保连接已初始化
      await databaseConnection.initialize();
      
      // 验证连接状态
      expect(databaseConnection.isConnected()).toBe(true);
    });

    it('should return false when the database is disconnected', async () => {
      // 确保连接已初始化
      await databaseConnection.initialize();
      
      // 断开连接
      await databaseConnection.getConnection()?.destroy();
      
      // 验证连接状态
      expect(databaseConnection.isConnected()).toBe(false);
    });
  });

  describe('reconnect()', () => {
    it('should reconnect successfully after disconnection', async () => {
      // 确保连接已初始化
      await databaseConnection.initialize();
      
      // 断开连接
      await databaseConnection.getConnection()?.destroy();
      
      // 验证连接已断开
      expect(databaseConnection.isConnected()).toBe(false);
      
      // 重新连接
      const dataSource = await databaseConnection.reconnect();
      
      // 验证重新连接成功
      expect(dataSource).toBeDefined();
      expect(dataSource.isInitialized).toBe(true);
      expect(databaseConnection.isConnected()).toBe(true);
    });
  });

  describe('getStatus()', () => {
    it('should return the correct status when connected', async () => {
      // 确保连接已初始化
      await databaseConnection.initialize();
      
      // 获取连接状态
      const status = databaseConnection.getStatus();
      
      // 验证状态信息
      expect(status).toBeDefined();
      expect(status.connected).toBe(true);
      expect(status.databaseType).toBeDefined();
      expect(status.initialized).toBe(true);
    });
  });
});
