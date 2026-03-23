/**
 * 仓库集成测试工具函数
 * 提供集成测试所需的工具方法
 */
import { DataSource } from 'typeorm';
import { DatabaseConnection } from '../../src/infrastructure/database/database-connection';
import { UserEntity } from '../../src/infrastructure/database/entities/user.entity';
import { CognitiveModelEntity } from '../../src/infrastructure/database/entities/cognitive-model.entity';
import { ThoughtFragmentEntity } from '../../src/infrastructure/database/entities/thought-fragment.entity';
import { CognitiveInsightEntity } from '../../src/infrastructure/database/entities/cognitive-insight.entity';
import { User, UserRole } from '../../src/domain/entities/user';
import { UUID } from '../../src/domain/value-objects/uuid';
import { CognitiveModel, UserCognitiveModel } from '../../src/domain/entities/cognitive-model';
import { ThoughtFragment } from '../../src/domain/entities/thought-fragment';
import { CognitiveInsight } from '../../src/domain/entities/cognitive-insight';

/**
 * 测试工具类
 */
export class RepositoryTestUtils {
  private dataSource: DataSource;

  /**
   * 构造函数
   * @param dataSource 数据库连接实例
   */
  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  /**
   * 清理数据库
   */
  async cleanupDatabase(): Promise<void> {
    // 按依赖顺序删除数据
    await this.dataSource.getRepository(CognitiveInsightEntity).clear();
    await this.dataSource.getRepository(ThoughtFragmentEntity).clear();
    await this.dataSource.getRepository(CognitiveModelEntity).clear();
    await this.dataSource.getRepository(UserEntity).clear();
  }

  /**
   * 创建测试用户
   */
  async createTestUser(): Promise<User> {
    const id = UUID.generate().value;
    const now = new Date();
    
    // 直接创建符合User接口的对象，避免使用UserImpl
    return {
      id,
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'test-password-hash',
      role: UserRole.USER,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      
      async validatePassword(password: string): Promise<boolean> {
        return false;
      },
      
      update(updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'>>): void {
        if (updates.username) {
          this.username = updates.username;
        }
        if (updates.email) {
          this.email = updates.email;
        }
        if (updates.role) {
          this.role = updates.role;
        }
        if (updates.isActive !== undefined) {
          this.isActive = updates.isActive;
        }
        this.updatedAt = new Date();
      },
      
      activate(): void {
        this.isActive = true;
        this.updatedAt = new Date();
      },
      
      deactivate(): void {
        this.isActive = false;
        this.updatedAt = new Date();
      }
    };
  }

  /**
   * 创建测试认知模型
   */
  async createTestCognitiveModel(userId: UUID): Promise<CognitiveModel> {
    return new UserCognitiveModel({
      id: UUID.generate(),
      userId: userId,
      name: 'Test Model',
      description: 'A test cognitive model',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      concepts: [],
      relations: []
    });
  }

  /**
   * 创建测试思想片段
   */
  async createTestThoughtFragment(userId: UUID): Promise<ThoughtFragment> {
    const id = UUID.generate().value;
    const now = new Date();
    
    // 直接创建符合ThoughtFragment接口的对象，避免使用ThoughtFragmentImpl
    return {
      id,
      content: 'This is a test thought fragment',
      metadata: { source: 'test' },
      userId: userId.value,
      createdAt: now,
      updatedAt: now,
      isProcessed: false,
      processingAttempts: 0,
      lastProcessedAt: null,
      
      updateContent(content: string): void {
        this.content = content;
        this.updatedAt = new Date();
      },
      
      updateMetadata(metadata: Record<string, any>): void {
        this.metadata = { ...this.metadata, ...metadata };
        this.updatedAt = new Date();
      },
      
      markAsProcessed(): void {
        this.isProcessed = true;
        this.lastProcessedAt = new Date();
        this.updatedAt = new Date();
      },
      
      incrementProcessingAttempts(): void {
        this.processingAttempts++;
        this.updatedAt = new Date();
      }
    };
  }

  /**
   * 创建测试认知洞察
   */
  async createTestCognitiveInsight(userId: UUID): Promise<CognitiveInsight> {
    return new CognitiveInsight({
      id: UUID.generate(),
      userId: userId,
      title: 'Test Insight',
      description: 'This is a test cognitive insight',
      type: 'TEST_INSIGHT',
      priority: 3,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

/**
 * 获取数据库连接实例
 */
export async function getDatabaseConnection(): Promise<DataSource> {
  const databaseConnection = DatabaseConnection.getInstance();
  return await databaseConnection.initialize();
}
