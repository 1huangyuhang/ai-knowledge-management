"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionRepositoryImpl = void 0;
const Suggestion_1 = require("../../../domain/entities/Suggestion");
const UUID_1 = require("../../../domain/value-objects/UUID");
class SuggestionRepositoryImpl {
    databaseConnection;
    constructor(databaseConnection) {
        this.databaseConnection = databaseConnection;
    }
    async create(suggestion) {
        const db = await this.databaseConnection.getConnection();
        await db.run(`INSERT INTO suggestions (
        id, type, content, description, priority, confidence, 
        related_concepts, action_items, category, metadata, 
        user_id, cognitive_model_id, context
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            suggestion.id.value,
            suggestion.type,
            suggestion.content,
            suggestion.description,
            suggestion.priority,
            suggestion.confidence,
            JSON.stringify(suggestion.relatedConcepts),
            JSON.stringify(suggestion.actionItems),
            suggestion.category,
            JSON.stringify(suggestion.metadata),
            suggestion.userId,
            suggestion.cognitiveModelId,
            suggestion.context
        ]);
        return suggestion;
    }
    async getById(id) {
        const db = await this.databaseConnection.getConnection();
        const row = await db.get(`SELECT * FROM suggestions WHERE id = ?`, [id.value]);
        if (!row) {
            return null;
        }
        return this.mapRowToSuggestion(row);
    }
    async getByUserId(userId, page, limit) {
        const db = await this.databaseConnection.getConnection();
        const offset = (page - 1) * limit;
        const rows = await db.all(`SELECT * FROM suggestions WHERE user_id = ? ORDER BY priority DESC LIMIT ? OFFSET ?`, [userId, limit, offset]);
        return rows.map(row => this.mapRowToSuggestion(row));
    }
    async getByCognitiveModelId(cognitiveModelId, page, limit) {
        const db = await this.databaseConnection.getConnection();
        const offset = (page - 1) * limit;
        const rows = await db.all(`SELECT * FROM suggestions WHERE cognitive_model_id = ? ORDER BY priority DESC LIMIT ? OFFSET ?`, [cognitiveModelId, limit, offset]);
        return rows.map(row => this.mapRowToSuggestion(row));
    }
    async getByType(type, userId) {
        const db = await this.databaseConnection.getConnection();
        const rows = await db.all(`SELECT * FROM suggestions WHERE type = ? AND user_id = ? ORDER BY priority DESC`, [type, userId]);
        return rows.map(row => this.mapRowToSuggestion(row));
    }
    async getByCategory(category, userId) {
        const db = await this.databaseConnection.getConnection();
        const rows = await db.all(`SELECT * FROM suggestions WHERE category = ? AND user_id = ? ORDER BY priority DESC`, [category, userId]);
        return rows.map(row => this.mapRowToSuggestion(row));
    }
    async update(suggestion) {
        const db = await this.databaseConnection.getConnection();
        await db.run(`UPDATE suggestions SET
        type = ?, content = ?, description = ?, priority = ?, confidence = ?, 
        related_concepts = ?, action_items = ?, category = ?, metadata = ?, 
        user_id = ?, cognitive_model_id = ?, context = ?
      WHERE id = ?`, [
            suggestion.type,
            suggestion.content,
            suggestion.description,
            suggestion.priority,
            suggestion.confidence,
            JSON.stringify(suggestion.relatedConcepts),
            JSON.stringify(suggestion.actionItems),
            suggestion.category,
            JSON.stringify(suggestion.metadata),
            suggestion.userId,
            suggestion.cognitiveModelId,
            suggestion.context,
            suggestion.id.value
        ]);
        return suggestion;
    }
    async delete(id) {
        const db = await this.databaseConnection.getConnection();
        const result = await db.run(`DELETE FROM suggestions WHERE id = ?`, [id.value]);
        return result.changes > 0;
    }
    async getTotalCountByUserId(userId) {
        const db = await this.databaseConnection.getConnection();
        const result = await db.get(`SELECT COUNT(*) as count FROM suggestions WHERE user_id = ?`, [userId]);
        return result?.count || 0;
    }
    async getHighPriorityCountByUserId(userId, priorityThreshold) {
        const db = await this.databaseConnection.getConnection();
        const result = await db.get(`SELECT COUNT(*) as count FROM suggestions WHERE user_id = ? AND priority >= ?`, [userId, priorityThreshold]);
        return result?.count || 0;
    }
    mapRowToSuggestion(row) {
        return new Suggestion_1.Suggestion(new UUID_1.UUID(row.id), row.type, row.content, row.description, row.priority, row.confidence, JSON.parse(row.related_concepts), JSON.parse(row.action_items), row.category, row.user_id, row.cognitive_model_id, row.context, JSON.parse(row.metadata));
    }
}
exports.SuggestionRepositoryImpl = SuggestionRepositoryImpl;
//# sourceMappingURL=SuggestionRepositoryImpl.js.map