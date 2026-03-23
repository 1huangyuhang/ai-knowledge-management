import { DatabaseClient } from '../infrastructure/database/connection/sqlite.connection';

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
    const tables = ['thought_fragments', 'cognitive_concepts', 'cognitive_relations', 'cognitive_insights'];
    
    for (const table of tables) {
      await this.cleanupTable(table);
    }
  }
}