import { Suggestion } from '../../../domain/entities/Suggestion';
import { UUID } from '../../../domain/value-objects/UUID';
import { SuggestionRepository } from '../../../domain/repositories/SuggestionRepository';
import { SuggestionType } from '../../../domain/enums/SuggestionType';
import { SuggestionCategory } from '../../../domain/enums/SuggestionCategory';
import { DatabaseConnection } from '../connection/DatabaseConnection';

/**
 * 建议仓库实现
 * 基于SQLite数据库的建议实体持久化实现
 */
export class SuggestionRepositoryImpl implements SuggestionRepository {
  constructor(private readonly databaseConnection: DatabaseConnection) {}
  
  /**
   * 创建建议
   * @param suggestion 建议实体
   * @returns 创建的建议实体
   */
  async create(suggestion: Suggestion): Promise<Suggestion> {
    const db = await this.databaseConnection.getConnection();
    
    await db.run(
      `INSERT INTO suggestions (
        id, type, content, description, priority, confidence, 
        related_concepts, action_items, category, metadata, 
        user_id, cognitive_model_id, context
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );
    
    return suggestion;
  }
  
  /**
   * 根据ID获取建议
   * @param id 建议ID
   * @returns 建议实体或null
   */
  async getById(id: UUID): Promise<Suggestion | null> {
    const db = await this.databaseConnection.getConnection();
    
    const row = await db.get(`SELECT * FROM suggestions WHERE id = ?`, [id.value]);
    
    if (!row) {
      return null;
    }
    
    return this.mapRowToSuggestion(row);
  }
  
  /**
   * 根据用户ID获取建议列表
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 建议列表
   */
  async getByUserId(userId: string, page: number, limit: number): Promise<Suggestion[]> {
    const db = await this.databaseConnection.getConnection();
    const offset = (page - 1) * limit;
    
    const rows = await db.all(
      `SELECT * FROM suggestions WHERE user_id = ? ORDER BY priority DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    return rows.map(row => this.mapRowToSuggestion(row));
  }
  
  /**
   * 根据认知模型ID获取建议列表
   * @param cognitiveModelId 认知模型ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 建议列表
   */
  async getByCognitiveModelId(cognitiveModelId: string, page: number, limit: number): Promise<Suggestion[]> {
    const db = await this.databaseConnection.getConnection();
    const offset = (page - 1) * limit;
    
    const rows = await db.all(
      `SELECT * FROM suggestions WHERE cognitive_model_id = ? ORDER BY priority DESC LIMIT ? OFFSET ?`,
      [cognitiveModelId, limit, offset]
    );
    
    return rows.map(row => this.mapRowToSuggestion(row));
  }
  
  /**
   * 根据类型获取建议列表
   * @param type 建议类型
   * @param userId 用户ID
   * @returns 建议列表
   */
  async getByType(type: SuggestionType, userId: string): Promise<Suggestion[]> {
    const db = await this.databaseConnection.getConnection();
    
    const rows = await db.all(
      `SELECT * FROM suggestions WHERE type = ? AND user_id = ? ORDER BY priority DESC`,
      [type, userId]
    );
    
    return rows.map(row => this.mapRowToSuggestion(row));
  }
  
  /**
   * 根据类别获取建议列表
   * @param category 建议类别
   * @param userId 用户ID
   * @returns 建议列表
   */
  async getByCategory(category: SuggestionCategory, userId: string): Promise<Suggestion[]> {
    const db = await this.databaseConnection.getConnection();
    
    const rows = await db.all(
      `SELECT * FROM suggestions WHERE category = ? AND user_id = ? ORDER BY priority DESC`,
      [category, userId]
    );
    
    return rows.map(row => this.mapRowToSuggestion(row));
  }
  
  /**
   * 更新建议
   * @param suggestion 建议实体
   * @returns 更新后的建议实体
   */
  async update(suggestion: Suggestion): Promise<Suggestion> {
    const db = await this.databaseConnection.getConnection();
    
    await db.run(
      `UPDATE suggestions SET
        type = ?, content = ?, description = ?, priority = ?, confidence = ?, 
        related_concepts = ?, action_items = ?, category = ?, metadata = ?, 
        user_id = ?, cognitive_model_id = ?, context = ?
      WHERE id = ?`,
      [
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
      ]
    );
    
    return suggestion;
  }
  
  /**
   * 删除建议
   * @param id 建议ID
   * @returns 删除是否成功
   */
  async delete(id: UUID): Promise<boolean> {
    const db = await this.databaseConnection.getConnection();
    
    const result = await db.run(`DELETE FROM suggestions WHERE id = ?`, [id.value]);
    
    return result.changes > 0;
  }
  
  /**
   * 获取用户的建议总数
   * @param userId 用户ID
   * @returns 建议总数
   */
  async getTotalCountByUserId(userId: string): Promise<number> {
    const db = await this.databaseConnection.getConnection();
    
    const result = await db.get(`SELECT COUNT(*) as count FROM suggestions WHERE user_id = ?`, [userId]);
    
    return result?.count || 0;
  }
  
  /**
   * 获取用户高优先级建议数量
   * @param userId 用户ID
   * @param priorityThreshold 优先级阈值
   * @returns 高优先级建议数量
   */
  async getHighPriorityCountByUserId(userId: string, priorityThreshold: number): Promise<number> {
    const db = await this.databaseConnection.getConnection();
    
    const result = await db.get(
      `SELECT COUNT(*) as count FROM suggestions WHERE user_id = ? AND priority >= ?`,
      [userId, priorityThreshold]
    );
    
    return result?.count || 0;
  }
  
  /**
   * 将数据库行映射为建议实体
   * @param row 数据库行
   * @returns 建议实体
   */
  private mapRowToSuggestion(row: any): Suggestion {
    return new Suggestion(
      new UUID(row.id),
      row.type as SuggestionType,
      row.content,
      row.description,
      row.priority,
      row.confidence,
      JSON.parse(row.related_concepts),
      JSON.parse(row.action_items),
      row.category as SuggestionCategory,
      row.user_id,
      row.cognitive_model_id,
      row.context,
      JSON.parse(row.metadata)
    );
  }
}