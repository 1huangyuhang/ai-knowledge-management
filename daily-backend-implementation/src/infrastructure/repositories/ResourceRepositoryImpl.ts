//
// ResourceRepositoryImpl.ts
//

import { ResourceRepository } from '../../application/repositories/ResourceRepository';
import { Resource, ResourceStatus, ResourceType } from '../../domain/entities/Resource';
import { UUID } from '../../core/domain/UUID';
import { DatabaseClient } from '../database/DatabaseClient';
import { LoggerService } from '../logging/LoggerService';

/**
 * 资源仓库实现
 */
export class ResourceRepositoryImpl implements ResourceRepository {
  /**
   * 构造函数
   * @param dbClient 数据库客户端
   * @param logger 日志服务
   */
  constructor(
    private readonly dbClient: DatabaseClient,
    private readonly logger: LoggerService
  ) {}

  /**
   * 初始化资源表
   */
  async initialize(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        used_capacity INTEGER NOT NULL,
        config TEXT,
        metadata TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
      CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
      CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name);
    `;
    
    try {
      await this.dbClient.execute(sql);
      this.logger.info('Resources table initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize resources table', error as Error);
      throw error;
    }
  }

  /**
   * 保存资源
   * @param resource 资源
   * @returns 保存后的资源
   */
  async save(resource: Resource): Promise<Resource> {
    const sql = `
      INSERT OR REPLACE INTO resources (
        id, name, type, description, status, capacity, used_capacity, config, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      resource.id.value,
      resource.name,
      resource.type,
      resource.description,
      resource.status,
      resource.capacity,
      resource.usedCapacity,
      JSON.stringify(resource.config),
      JSON.stringify(resource.metadata),
      resource.createdAt.toISOString(),
      resource.updatedAt.toISOString()
    ];
    
    try {
      await this.dbClient.execute(sql, params);
      this.logger.debug(`Resource saved successfully: ${resource.id.value}`);
      return resource;
    } catch (error) {
      this.logger.error(`Failed to save resource ${resource.id.value}`, error as Error);
      throw error;
    }
  }

  /**
   * 根据ID获取资源
   * @param id 资源ID
   * @returns 资源，如果不存在则返回null
   */
  async findById(id: UUID): Promise<Resource | null> {
    const sql = 'SELECT * FROM resources WHERE id = ?';
    
    try {
      const result = await this.dbClient.get(sql, [id.value]);
      if (!result) {
        return null;
      }
      
      return this.mapToEntity(result);
    } catch (error) {
      this.logger.error(`Failed to find resource by id ${id.value}`, error as Error);
      throw error;
    }
  }

  /**
   * 根据名称获取资源
   * @param name 资源名称
   * @returns 资源，如果不存在则返回null
   */
  async findByName(name: string): Promise<Resource | null> {
    const sql = 'SELECT * FROM resources WHERE name = ?';
    
    try {
      const result = await this.dbClient.get(sql, [name]);
      if (!result) {
        return null;
      }
      
      return this.mapToEntity(result);
    } catch (error) {
      this.logger.error(`Failed to find resource by name ${name}`, error as Error);
      throw error;
    }
  }

  /**
   * 根据类型获取资源
   * @param type 资源类型
   * @returns 资源列表
   */
  async findByType(type: ResourceType): Promise<Resource[]> {
    const sql = 'SELECT * FROM resources WHERE type = ?';
    
    try {
      const results = await this.dbClient.all(sql, [type]);
      return results.map(this.mapToEntity);
    } catch (error) {
      this.logger.error(`Failed to find resources by type ${type}`, error as Error);
      throw error;
    }
  }

  /**
   * 根据状态获取资源
   * @param status 资源状态
   * @returns 资源列表
   */
  async findByStatus(status: ResourceStatus): Promise<Resource[]> {
    const sql = 'SELECT * FROM resources WHERE status = ?';
    
    try {
      const results = await this.dbClient.all(sql, [status]);
      return results.map(this.mapToEntity);
    } catch (error) {
      this.logger.error(`Failed to find resources by status ${status}`, error as Error);
      throw error;
    }
  }

  /**
   * 获取所有资源
   * @returns 资源列表
   */
  async findAll(): Promise<Resource[]> {
    const sql = 'SELECT * FROM resources';
    
    try {
      const results = await this.dbClient.all(sql);
      return results.map(this.mapToEntity);
    } catch (error) {
      this.logger.error('Failed to find all resources', error as Error);
      throw error;
    }
  }

  /**
   * 获取可用资源
   * @param type 可选的资源类型
   * @returns 可用资源列表
   */
  async findAvailableResources(type?: ResourceType): Promise<Resource[]> {
    let sql = 'SELECT * FROM resources WHERE status IN (?, ?)';
    const params: any[] = [ResourceStatus.AVAILABLE, ResourceStatus.IN_USE];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    try {
      const results = await this.dbClient.all(sql, params);
      return results.map(this.mapToEntity);
    } catch (error) {
      this.logger.error('Failed to find available resources', error as Error);
      throw error;
    }
  }

  /**
   * 更新资源
   * @param resource 资源
   * @returns 更新后的资源
   */
  async update(resource: Resource): Promise<Resource> {
    return this.save(resource);
  }

  /**
   * 删除资源
   * @param id 资源ID
   * @returns 是否删除成功
   */
  async delete(id: UUID): Promise<boolean> {
    const sql = 'DELETE FROM resources WHERE id = ?';
    
    try {
      const result = await this.dbClient.execute(sql, [id.value]);
      this.logger.debug(`Resource deleted: ${id.value}`);
      return result.changes > 0;
    } catch (error) {
      this.logger.error(`Failed to delete resource ${id.value}`, error as Error);
      throw error;
    }
  }

  /**
   * 获取资源使用统计
   * @param type 可选的资源类型
   * @returns 资源使用统计
   */
  async getResourceUsageStatistics(type?: ResourceType): Promise<{
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    unavailable: number;
    averageUsageRate: number;
  }> {
    let whereClause = '';
    const params: any[] = [];
    
    if (type) {
      whereClause = ' WHERE type = ?';
      params.push(type);
    }
    
    const totalSql = `SELECT COUNT(*) as count FROM resources${whereClause}`;
    const availableSql = `SELECT COUNT(*) as count FROM resources WHERE status = ?${whereClause}`;
    const inUseSql = `SELECT COUNT(*) as count FROM resources WHERE status = ?${whereClause}`;
    const maintenanceSql = `SELECT COUNT(*) as count FROM resources WHERE status = ?${whereClause}`;
    const unavailableSql = `SELECT COUNT(*) as count FROM resources WHERE status = ?${whereClause}`;
    const avgUsageSql = `SELECT AVG(CASE WHEN capacity > 0 THEN used_capacity / CAST(capacity AS REAL) ELSE 0 END) as avg_usage FROM resources${whereClause}`;
    
    try {
      const [totalResult, availableResult, inUseResult, maintenanceResult, unavailableResult, avgUsageResult] = await Promise.all([
        this.dbClient.get(totalSql, params),
        this.dbClient.get(availableSql, [ResourceStatus.AVAILABLE, ...params]),
        this.dbClient.get(inUseSql, [ResourceStatus.IN_USE, ...params]),
        this.dbClient.get(maintenanceSql, [ResourceStatus.MAINTENANCE, ...params]),
        this.dbClient.get(unavailableSql, [ResourceStatus.UNAVAILABLE, ...params]),
        this.dbClient.get(avgUsageSql, params)
      ]);
      
      return {
        total: totalResult.count || 0,
        available: availableResult.count || 0,
        inUse: inUseResult.count || 0,
        maintenance: maintenanceResult.count || 0,
        unavailable: unavailableResult.count || 0,
        averageUsageRate: avgUsageResult.avg_usage || 0
      };
    } catch (error) {
      this.logger.error('Failed to get resource usage statistics', error as Error);
      throw error;
    }
  }

  /**
   * 批量更新资源状态
   * @param ids 资源ID列表
   * @param status 资源状态
   * @returns 更新成功的资源数量
   */
  async batchUpdateStatus(ids: UUID[], status: ResourceStatus): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const sql = `
      UPDATE resources 
      SET status = ?, updated_at = ? 
      WHERE id IN (${placeholders})
    `;
    
    const params = [
      status,
      new Date().toISOString(),
      ...ids.map(id => id.value)
    ];
    
    try {
      const result = await this.dbClient.execute(sql, params);
      this.logger.debug(`Batch updated ${result.changes} resources to status ${status}`);
      return result.changes;
    } catch (error) {
      this.logger.error('Failed to batch update resource status', error as Error);
      throw error;
    }
  }

  /**
   * 将数据库记录映射为资源实体
   * @param record 数据库记录
   * @returns 资源实体
   */
  private mapToEntity(record: any): Resource {
    const resource = new Resource(
      UUID.fromString(record.id),
      record.name,
      record.type as ResourceType,
      record.description,
      record.status as ResourceStatus,
      record.capacity,
      record.used_capacity,
      record.config ? JSON.parse(record.config) : {},
      record.metadata ? JSON.parse(record.metadata) : {},
      new Date(record.created_at),
      new Date(record.updated_at)
    );
    
    return resource;
  }
}
