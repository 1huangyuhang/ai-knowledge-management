"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITaskRepositoryImpl = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const AITask_1 = require("../../domain/entities/AITask");
const DatabaseConnection_1 = require("../database/connection/DatabaseConnection");
let AITaskRepositoryImpl = class AITaskRepositoryImpl {
    databaseConnection;
    constructor(databaseConnection) {
        this.databaseConnection = databaseConnection;
    }
    async initTable() {
        const db = await this.databaseConnection.getConnection();
        await db.exec(`
      CREATE TABLE IF NOT EXISTS ai_tasks (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        priority INTEGER NOT NULL,
        status TEXT NOT NULL,
        input TEXT NOT NULL,
        result TEXT,
        retryCount INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        startedAt INTEGER,
        completedAt INTEGER,
        updatedAt INTEGER NOT NULL,
        metadata TEXT
      )
    `);
    }
    async save(task) {
        await this.initTable();
        const db = await this.databaseConnection.getConnection();
        const metadataString = JSON.stringify(task.metadata || {});
        const sql = `
      INSERT OR REPLACE INTO ai_tasks (
        id, type, priority, status, input, result, retryCount, 
        createdAt, startedAt, completedAt, updatedAt, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await db.run(sql, [
            task.id,
            task.type,
            task.priority,
            task.status,
            JSON.stringify(task.input),
            JSON.stringify(task.result),
            task.retryCount,
            task.createdAt.getTime(),
            task.startedAt?.getTime() || null,
            task.completedAt?.getTime() || null,
            task.updatedAt.getTime(),
            metadataString
        ]);
        return task;
    }
    async findById(id) {
        await this.initTable();
        const db = await this.databaseConnection.getConnection();
        const sql = 'SELECT * FROM ai_tasks WHERE id = ?';
        const row = await db.get(sql, [id]);
        if (!row) {
            return null;
        }
        return this.mapRowToTask(row);
    }
    async findByStatus(status) {
        await this.initTable();
        const db = await this.databaseConnection.getConnection();
        const sql = 'SELECT * FROM ai_tasks WHERE status = ? ORDER BY priority ASC, createdAt ASC';
        const rows = await db.all(sql, [status]);
        return rows.map(this.mapRowToTask);
    }
    async findByType(type) {
        await this.initTable();
        const db = await this.databaseConnection.getConnection();
        const sql = 'SELECT * FROM ai_tasks WHERE type = ? ORDER BY createdAt DESC';
        const rows = await db.all(sql, [type]);
        return rows.map(this.mapRowToTask);
    }
    async findAll() {
        await this.initTable();
        const db = await this.databaseConnection.getConnection();
        const sql = 'SELECT * FROM ai_tasks ORDER BY updatedAt DESC';
        const rows = await db.all(sql);
        return rows.map(this.mapRowToTask);
    }
    async delete(id) {
        await this.initTable();
        const db = await this.databaseConnection.getConnection();
        const sql = 'DELETE FROM ai_tasks WHERE id = ?';
        const result = await db.run(sql, [id]);
        return result.changes > 0;
    }
    async update(task) {
        return this.save(task);
    }
    mapRowToTask(row) {
        return new AITask_1.AITask({
            id: row.id,
            type: row.type,
            priority: row.priority,
            status: row.status,
            input: JSON.parse(row.input),
            result: row.result ? JSON.parse(row.result) : undefined,
            retryCount: row.retryCount,
            createdAt: new Date(row.createdAt),
            startedAt: row.startedAt ? new Date(row.startedAt) : undefined,
            completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
            updatedAt: new Date(row.updatedAt),
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined
        });
    }
};
exports.AITaskRepositoryImpl = AITaskRepositoryImpl;
exports.AITaskRepositoryImpl = AITaskRepositoryImpl = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof DatabaseConnection_1.DatabaseConnection !== "undefined" && DatabaseConnection_1.DatabaseConnection) === "function" ? _a : Object])
], AITaskRepositoryImpl);
//# sourceMappingURL=AITaskRepositoryImpl.js.map