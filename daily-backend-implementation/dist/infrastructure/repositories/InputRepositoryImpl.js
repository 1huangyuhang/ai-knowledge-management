"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputRepositoryImpl = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const file_input_1 = require("../../domain/entities/file-input");
const speech_input_1 = require("../../domain/entities/speech-input");
const uuid_1 = require("../../domain/value-objects/uuid");
const DatabaseConnection_1 = require("../database/connection/DatabaseConnection");
let InputRepositoryImpl = class InputRepositoryImpl {
    databaseConnection;
    constructor(databaseConnection) {
        this.databaseConnection = databaseConnection;
    }
    async initFileInputTable() {
        const db = await this.databaseConnection.getConnection();
        await db.exec(`
      CREATE TABLE IF NOT EXISTS file_inputs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        userId TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
    }
    async initSpeechInputTable() {
        const db = await this.databaseConnection.getConnection();
        await db.exec(`
      CREATE TABLE IF NOT EXISTS speech_inputs (
        id TEXT PRIMARY KEY,
        audioUrl TEXT NOT NULL,
        transcription TEXT NOT NULL,
        confidence REAL NOT NULL,
        language TEXT NOT NULL,
        duration REAL NOT NULL,
        metadata TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        userId TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
    }
    async saveFileInput(fileInput) {
        await this.initFileInputTable();
        const db = await this.databaseConnection.getConnection();
        const metadataString = JSON.stringify(fileInput.metadata || {});
        const sql = `
      INSERT OR REPLACE INTO file_inputs (
        id, name, type, size, content, metadata, createdAt, updatedAt, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await db.run(sql, [
            fileInput.id.value,
            fileInput.name,
            fileInput.type,
            fileInput.size,
            fileInput.content,
            metadataString,
            fileInput.createdAt.getTime(),
            fileInput.updatedAt.getTime(),
            fileInput.userId.value
        ]);
        return fileInput;
    }
    async saveSpeechInput(speechInput) {
        await this.initSpeechInputTable();
        const db = await this.databaseConnection.getConnection();
        const metadataString = JSON.stringify(speechInput.metadata || {});
        const sql = `
      INSERT OR REPLACE INTO speech_inputs (
        id, audioUrl, transcription, confidence, language, duration, 
        metadata, createdAt, updatedAt, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await db.run(sql, [
            speechInput.id.value,
            speechInput.audioUrl,
            speechInput.transcription,
            speechInput.confidence,
            speechInput.language,
            speechInput.duration,
            metadataString,
            speechInput.createdAt.getTime(),
            speechInput.updatedAt.getTime(),
            speechInput.userId.value
        ]);
        return speechInput;
    }
    async getFileInputById(id) {
        await this.initFileInputTable();
        const db = await this.databaseConnection.getConnection();
        const sql = 'SELECT * FROM file_inputs WHERE id = ?';
        const row = await db.get(sql, [id.value]);
        if (!row) {
            return null;
        }
        return this.mapRowToFileInput(row);
    }
    async getSpeechInputById(id) {
        await this.initSpeechInputTable();
        const db = await this.databaseConnection.getConnection();
        const sql = 'SELECT * FROM speech_inputs WHERE id = ?';
        const row = await db.get(sql, [id.value]);
        if (!row) {
            return null;
        }
        return this.mapRowToSpeechInput(row);
    }
    async getUserInputHistory(userId, limit, offset) {
        await Promise.all([
            this.initFileInputTable(),
            this.initSpeechInputTable()
        ]);
        const db = await this.databaseConnection.getConnection();
        const fileInputsSql = `
      SELECT 'file' as type, * FROM file_inputs 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
        const fileRows = await db.all(fileInputsSql, [userId.value, limit, offset]);
        const speechInputsSql = `
      SELECT 'speech' as type, * FROM speech_inputs 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
        const speechRows = await db.all(speechInputsSql, [userId.value, limit, offset]);
        const allInputs = [
            ...fileRows.map(row => ({ type: 'file', data: this.mapRowToFileInput(row) })),
            ...speechRows.map(row => ({ type: 'speech', data: this.mapRowToSpeechInput(row) }))
        ];
        return allInputs
            .sort((a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime())
            .map(item => item.data);
    }
    async getUserFileInputHistory(userId, limit, offset) {
        await this.initFileInputTable();
        const db = await this.databaseConnection.getConnection();
        const sql = `
      SELECT * FROM file_inputs 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
        const rows = await db.all(sql, [userId.value, limit, offset]);
        return rows.map(this.mapRowToFileInput);
    }
    async getUserSpeechInputHistory(userId, limit, offset) {
        await this.initSpeechInputTable();
        const db = await this.databaseConnection.getConnection();
        const sql = `
      SELECT * FROM speech_inputs 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
        const rows = await db.all(sql, [userId.value, limit, offset]);
        return rows.map(this.mapRowToSpeechInput);
    }
    async getUserInputStatistics(userId) {
        await Promise.all([
            this.initFileInputTable(),
            this.initSpeechInputTable()
        ]);
        const db = await this.databaseConnection.getConnection();
        const fileStatsSql = `
      SELECT COUNT(*) as count, SUM(size) as totalSize 
      FROM file_inputs 
      WHERE userId = ?
    `;
        const fileStats = await db.get(fileStatsSql, [userId.value]);
        const speechStatsSql = `
      SELECT COUNT(*) as count 
      FROM speech_inputs 
      WHERE userId = ?
    `;
        const speechStats = await db.get(speechStatsSql, [userId.value]);
        const latestFileInputSql = `
      SELECT MAX(createdAt) as latest 
      FROM file_inputs 
      WHERE userId = ?
    `;
        const latestFileInput = await db.get(latestFileInputSql, [userId.value]);
        const latestSpeechInputSql = `
      SELECT MAX(createdAt) as latest 
      FROM speech_inputs 
      WHERE userId = ?
    `;
        const latestSpeechInput = await db.get(latestSpeechInputSql, [userId.value]);
        const fileCount = fileStats.count || 0;
        const speechCount = speechStats.count || 0;
        const totalInputs = fileCount + speechCount;
        const totalSize = fileStats.totalSize || 0;
        const averageInputSize = totalInputs > 0 ? totalSize / totalInputs : 0;
        const latestFileTime = latestFileInput.latest;
        const latestSpeechTime = latestSpeechInput.latest;
        const latestInputTime = Math.max(latestFileTime || 0, latestSpeechTime || 0);
        const latestInputAt = latestInputTime > 0 ? new Date(latestInputTime) : null;
        return {
            totalInputs,
            fileInputs: fileCount,
            speechInputs: speechCount,
            totalSize,
            averageInputSize,
            latestInputAt
        };
    }
    async deleteInput(id) {
        await Promise.all([
            this.initFileInputTable(),
            this.initSpeechInputTable()
        ]);
        const db = await this.databaseConnection.getConnection();
        const fileDeleteSql = 'DELETE FROM file_inputs WHERE id = ?';
        const fileResult = await db.run(fileDeleteSql, [id.value]);
        if (fileResult.changes > 0) {
            return true;
        }
        const speechDeleteSql = 'DELETE FROM speech_inputs WHERE id = ?';
        const speechResult = await db.run(speechDeleteSql, [id.value]);
        return speechResult.changes > 0;
    }
    async deleteInputs(ids) {
        await Promise.all([
            this.initFileInputTable(),
            this.initSpeechInputTable()
        ]);
        const db = await this.databaseConnection.getConnection();
        const idValues = ids.map(id => id.value);
        const placeholders = ids.map(() => '?').join(',');
        const fileDeleteSql = `DELETE FROM file_inputs WHERE id IN (${placeholders})`;
        const fileResult = await db.run(fileDeleteSql, idValues);
        const speechDeleteSql = `DELETE FROM speech_inputs WHERE id IN (${placeholders})`;
        const speechResult = await db.run(speechDeleteSql, idValues);
        return fileResult.changes + speechResult.changes;
    }
    async searchUserInputs(userId, keyword, limit, offset) {
        await Promise.all([
            this.initFileInputTable(),
            this.initSpeechInputTable()
        ]);
        const db = await this.databaseConnection.getConnection();
        const searchKeyword = `%${keyword}%`;
        const fileSearchSql = `
      SELECT 'file' as type, * FROM file_inputs 
      WHERE userId = ? AND (name LIKE ? OR type LIKE ? OR content LIKE ?) 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
        const fileRows = await db.all(fileSearchSql, [
            userId.value,
            searchKeyword,
            searchKeyword,
            searchKeyword,
            limit,
            offset
        ]);
        const speechSearchSql = `
      SELECT 'speech' as type, * FROM speech_inputs 
      WHERE userId = ? AND (transcription LIKE ? OR language LIKE ?) 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
        const speechRows = await db.all(speechSearchSql, [
            userId.value,
            searchKeyword,
            searchKeyword,
            limit,
            offset
        ]);
        const allInputs = [
            ...fileRows.map(row => ({ type: 'file', data: this.mapRowToFileInput(row) })),
            ...speechRows.map(row => ({ type: 'speech', data: this.mapRowToSpeechInput(row) }))
        ];
        return allInputs
            .sort((a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime())
            .map(item => item.data);
    }
    mapRowToFileInput(row) {
        return new file_input_1.FileInput({
            id: uuid_1.UUID.fromString(row.id),
            name: row.name,
            type: row.type,
            size: row.size,
            content: row.content,
            metadata: JSON.parse(row.metadata),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            userId: uuid_1.UUID.fromString(row.userId)
        });
    }
    mapRowToSpeechInput(row) {
        return new speech_input_1.SpeechInput({
            id: uuid_1.UUID.fromString(row.id),
            audioUrl: row.audioUrl,
            transcription: row.transcription,
            confidence: row.confidence,
            language: row.language,
            duration: row.duration,
            metadata: JSON.parse(row.metadata),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            userId: uuid_1.UUID.fromString(row.userId)
        });
    }
};
exports.InputRepositoryImpl = InputRepositoryImpl;
exports.InputRepositoryImpl = InputRepositoryImpl = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof DatabaseConnection_1.DatabaseConnection !== "undefined" && DatabaseConnection_1.DatabaseConnection) === "function" ? _a : Object])
], InputRepositoryImpl);
//# sourceMappingURL=InputRepositoryImpl.js.map