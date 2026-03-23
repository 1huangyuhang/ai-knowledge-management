"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceRepositoryImpl = void 0;
const Resource_1 = require("../../domain/entities/Resource");
const UUID_1 = require("../../core/domain/UUID");
class ResourceRepositoryImpl {
    dbClient;
    logger;
    constructor(dbClient, logger) {
        this.dbClient = dbClient;
        this.logger = logger;
    }
    async initialize() {
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
        }
        catch (error) {
            this.logger.error('Failed to initialize resources table', error);
            throw error;
        }
    }
    async save(resource) {
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
        }
        catch (error) {
            this.logger.error(`Failed to save resource ${resource.id.value}`, error);
            throw error;
        }
    }
    async findById(id) {
        const sql = 'SELECT * FROM resources WHERE id = ?';
        try {
            const result = await this.dbClient.get(sql, [id.value]);
            if (!result) {
                return null;
            }
            return this.mapToEntity(result);
        }
        catch (error) {
            this.logger.error(`Failed to find resource by id ${id.value}`, error);
            throw error;
        }
    }
    async findByName(name) {
        const sql = 'SELECT * FROM resources WHERE name = ?';
        try {
            const result = await this.dbClient.get(sql, [name]);
            if (!result) {
                return null;
            }
            return this.mapToEntity(result);
        }
        catch (error) {
            this.logger.error(`Failed to find resource by name ${name}`, error);
            throw error;
        }
    }
    async findByType(type) {
        const sql = 'SELECT * FROM resources WHERE type = ?';
        try {
            const results = await this.dbClient.all(sql, [type]);
            return results.map(this.mapToEntity);
        }
        catch (error) {
            this.logger.error(`Failed to find resources by type ${type}`, error);
            throw error;
        }
    }
    async findByStatus(status) {
        const sql = 'SELECT * FROM resources WHERE status = ?';
        try {
            const results = await this.dbClient.all(sql, [status]);
            return results.map(this.mapToEntity);
        }
        catch (error) {
            this.logger.error(`Failed to find resources by status ${status}`, error);
            throw error;
        }
    }
    async findAll() {
        const sql = 'SELECT * FROM resources';
        try {
            const results = await this.dbClient.all(sql);
            return results.map(this.mapToEntity);
        }
        catch (error) {
            this.logger.error('Failed to find all resources', error);
            throw error;
        }
    }
    async findAvailableResources(type) {
        let sql = 'SELECT * FROM resources WHERE status IN (?, ?)';
        const params = [Resource_1.ResourceStatus.AVAILABLE, Resource_1.ResourceStatus.IN_USE];
        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }
        try {
            const results = await this.dbClient.all(sql, params);
            return results.map(this.mapToEntity);
        }
        catch (error) {
            this.logger.error('Failed to find available resources', error);
            throw error;
        }
    }
    async update(resource) {
        return this.save(resource);
    }
    async delete(id) {
        const sql = 'DELETE FROM resources WHERE id = ?';
        try {
            const result = await this.dbClient.execute(sql, [id.value]);
            this.logger.debug(`Resource deleted: ${id.value}`);
            return result.changes > 0;
        }
        catch (error) {
            this.logger.error(`Failed to delete resource ${id.value}`, error);
            throw error;
        }
    }
    async getResourceUsageStatistics(type) {
        let whereClause = '';
        const params = [];
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
                this.dbClient.get(availableSql, [Resource_1.ResourceStatus.AVAILABLE, ...params]),
                this.dbClient.get(inUseSql, [Resource_1.ResourceStatus.IN_USE, ...params]),
                this.dbClient.get(maintenanceSql, [Resource_1.ResourceStatus.MAINTENANCE, ...params]),
                this.dbClient.get(unavailableSql, [Resource_1.ResourceStatus.UNAVAILABLE, ...params]),
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
        }
        catch (error) {
            this.logger.error('Failed to get resource usage statistics', error);
            throw error;
        }
    }
    async batchUpdateStatus(ids, status) {
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
        }
        catch (error) {
            this.logger.error('Failed to batch update resource status', error);
            throw error;
        }
    }
    mapToEntity(record) {
        const resource = new Resource_1.Resource(UUID_1.UUID.fromString(record.id), record.name, record.type, record.description, record.status, record.capacity, record.used_capacity, record.config ? JSON.parse(record.config) : {}, record.metadata ? JSON.parse(record.metadata) : {}, new Date(record.created_at), new Date(record.updated_at));
        return resource;
    }
}
exports.ResourceRepositoryImpl = ResourceRepositoryImpl;
//# sourceMappingURL=ResourceRepositoryImpl.js.map