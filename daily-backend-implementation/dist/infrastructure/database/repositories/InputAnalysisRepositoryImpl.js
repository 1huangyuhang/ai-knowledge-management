"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputAnalysisRepositoryImpl = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const InputAnalysis_1 = require("../../../domain/entities/InputAnalysis");
const UUID_1 = require("../../../domain/value-objects/UUID");
const SQLiteConnection_1 = require("../connection/SQLiteConnection");
const LoggerService_1 = require("../../logging/LoggerService");
const LoggerTypes_1 = require("../../logging/LoggerTypes");
let InputAnalysisRepositoryImpl = class InputAnalysisRepositoryImpl {
    dbConnection;
    logger;
    constructor(dbConnection, logger) {
        this.dbConnection = dbConnection;
        this.logger = logger;
        this.initializeTable();
    }
    async initializeTable() {
        try {
            const db = await this.dbConnection.getConnection();
            await db.exec(`
        CREATE TABLE IF NOT EXISTS input_analyses (
          id TEXT PRIMARY KEY,
          input_id TEXT NOT NULL,
          type TEXT NOT NULL,
          result TEXT NOT NULL,
          status TEXT NOT NULL,
          confidence REAL NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (input_id) REFERENCES inputs(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_input_analyses_input_id ON input_analyses(input_id);
        CREATE INDEX IF NOT EXISTS idx_input_analyses_status ON input_analyses(status);
        CREATE INDEX IF NOT EXISTS idx_input_analyses_type ON input_analyses(type);
      `);
            this.logger.info('InputAnalysis table initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize InputAnalysis table', error);
            throw error;
        }
    }
    async save(analysis) {
        try {
            const db = await this.dbConnection.getConnection();
            const result = await db.run(`INSERT OR REPLACE INTO input_analyses (
          id, input_id, type, result, status, confidence, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                analysis.id.toString(),
                analysis.inputId.toString(),
                analysis.type,
                JSON.stringify(analysis.result),
                analysis.status,
                analysis.confidence,
                analysis.createdAt.toISOString(),
                analysis.updatedAt.toISOString()
            ]);
            this.logger.info('Input analysis saved successfully', { analysisId: analysis.id.toString() });
            return analysis;
        }
        catch (error) {
            this.logger.error('Failed to save input analysis', error, { analysisId: analysis.id.toString() });
            throw error;
        }
    }
    async getById(id) {
        try {
            const db = await this.dbConnection.getConnection();
            const row = await db.get('SELECT * FROM input_analyses WHERE id = ?', [id.toString()]);
            if (!row) {
                return null;
            }
            return this.mapRowToEntity(row);
        }
        catch (error) {
            this.logger.error('Failed to get input analysis by ID', error, { id: id.toString() });
            throw error;
        }
    }
    async getByInputId(inputId) {
        try {
            const db = await this.dbConnection.getConnection();
            const rows = await db.all('SELECT * FROM input_analyses WHERE input_id = ?', [inputId.toString()]);
            return rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error('Failed to get input analyses by input ID', error, { inputId: inputId.toString() });
            throw error;
        }
    }
    async getByStatus(status, limit, offset) {
        try {
            const db = await this.dbConnection.getConnection();
            const rows = await db.all('SELECT * FROM input_analyses WHERE status = ? LIMIT ? OFFSET ?', [status, limit, offset]);
            return rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error('Failed to get input analyses by status', error, { status, limit, offset });
            throw error;
        }
    }
    async getByType(type, limit, offset) {
        try {
            const db = await this.dbConnection.getConnection();
            const rows = await db.all('SELECT * FROM input_analyses WHERE type = ? LIMIT ? OFFSET ?', [type, limit, offset]);
            return rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error('Failed to get input analyses by type', error, { type, limit, offset });
            throw error;
        }
    }
    async updateStatus(id, status) {
        try {
            const db = await this.dbConnection.getConnection();
            await db.run('UPDATE input_analyses SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), id.toString()]);
            const updatedAnalysis = await this.getById(id);
            if (!updatedAnalysis) {
                throw new Error(`Input analysis with ID ${id.toString()} not found`);
            }
            this.logger.info('Input analysis status updated successfully', { id: id.toString(), status });
            return updatedAnalysis;
        }
        catch (error) {
            this.logger.error('Failed to update input analysis status', error, { id: id.toString(), status });
            throw error;
        }
    }
    async delete(id) {
        try {
            const db = await this.dbConnection.getConnection();
            const result = await db.run('DELETE FROM input_analyses WHERE id = ?', [id.toString()]);
            const success = result.changes > 0;
            if (success) {
                this.logger.info('Input analysis deleted successfully', { id: id.toString() });
            }
            return success;
        }
        catch (error) {
            this.logger.error('Failed to delete input analysis', error, { id: id.toString() });
            throw error;
        }
    }
    async deleteByInputId(inputId) {
        try {
            const db = await this.dbConnection.getConnection();
            const result = await db.run('DELETE FROM input_analyses WHERE input_id = ?', [inputId.toString()]);
            const deletedCount = result.changes;
            this.logger.info('Input analyses deleted by input ID', { inputId: inputId.toString(), deletedCount });
            return deletedCount;
        }
        catch (error) {
            this.logger.error('Failed to delete input analyses by input ID', error, { inputId: inputId.toString() });
            throw error;
        }
    }
    async getByIds(ids) {
        try {
            if (ids.length === 0) {
                return [];
            }
            const db = await this.dbConnection.getConnection();
            const placeholders = ids.map(() => '?').join(',');
            const values = ids.map(id => id.toString());
            const rows = await db.all(`SELECT * FROM input_analyses WHERE id IN (${placeholders})`, values);
            return rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error('Failed to get input analyses by IDs', error, { ids: ids.map(id => id.toString()) });
            throw error;
        }
    }
    mapRowToEntity(row) {
        return new InputAnalysis_1.InputAnalysis({
            id: new UUID_1.UUID(row.id),
            inputId: new UUID_1.UUID(row.input_id),
            type: row.type,
            result: JSON.parse(row.result),
            status: row.status,
            confidence: row.confidence,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        });
    }
};
exports.InputAnalysisRepositoryImpl = InputAnalysisRepositoryImpl;
exports.InputAnalysisRepositoryImpl = InputAnalysisRepositoryImpl = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__param(0, (0, inversify_1.inject)(SQLiteConnection_1.DatabaseConnection)),
    tslib_1.__param(1, (0, inversify_1.inject)(LoggerTypes_1.LoggerType)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof SQLiteConnection_1.DatabaseConnection !== "undefined" && SQLiteConnection_1.DatabaseConnection) === "function" ? _a : Object, typeof (_b = typeof LoggerService_1.LoggerService !== "undefined" && LoggerService_1.LoggerService) === "function" ? _b : Object])
], InputAnalysisRepositoryImpl);
//# sourceMappingURL=InputAnalysisRepositoryImpl.js.map