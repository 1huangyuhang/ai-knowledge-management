import { inject, injectable } from 'inversify';
import { InputAnalysisRepository } from '../../../domain/repositories/InputAnalysisRepository';
import { InputAnalysis, AnalysisStatus } from '../../../domain/entities/InputAnalysis';
import { UUID } from '../../../domain/value-objects/UUID';
import { DatabaseConnection } from '../connection/SQLiteConnection';
import { LoggerService } from '../../logging/LoggerService';
import { LoggerType } from '../../logging/LoggerTypes';

/**
 * 输入分析仓库实现类
 * 使用SQLite数据库存储输入分析结果
 */
@injectable()
export class InputAnalysisRepositoryImpl implements InputAnalysisRepository {
  constructor(
    @inject(DatabaseConnection) private readonly dbConnection: DatabaseConnection,
    @inject(LoggerType) private readonly logger: LoggerService
  ) {
    this.initializeTable();
  }

  /**
   * 初始化输入分析表
   */
  private async initializeTable(): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to initialize InputAnalysis table', error as Error);
      throw error;
    }
  }

  /**
   * 保存输入分析结果
   * @param analysis 输入分析实体
   * @returns 保存后的输入分析实体
   */
  async save(analysis: InputAnalysis): Promise<InputAnalysis> {
    try {
      const db = await this.dbConnection.getConnection();
      const result = await db.run(
        `INSERT OR REPLACE INTO input_analyses (
          id, input_id, type, result, status, confidence, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          analysis.id.toString(),
          analysis.inputId.toString(),
          analysis.type,
          JSON.stringify(analysis.result),
          analysis.status,
          analysis.confidence,
          analysis.createdAt.toISOString(),
          analysis.updatedAt.toISOString()
        ]
      );

      this.logger.info('Input analysis saved successfully', { analysisId: analysis.id.toString() });
      return analysis;
    } catch (error) {
      this.logger.error('Failed to save input analysis', error as Error, { analysisId: analysis.id.toString() });
      throw error;
    }
  }

  /**
   * 根据ID获取输入分析结果
   * @param id 分析ID
   * @returns 输入分析实体，如果不存在则返回null
   */
  async getById(id: UUID): Promise<InputAnalysis | null> {
    try {
      const db = await this.dbConnection.getConnection();
      const row = await db.get<InputAnalysisRow>(
        'SELECT * FROM input_analyses WHERE id = ?',
        [id.toString()]
      );

      if (!row) {
        return null;
      }

      return this.mapRowToEntity(row);
    } catch (error) {
      this.logger.error('Failed to get input analysis by ID', error as Error, { id: id.toString() });
      throw error;
    }
  }

  /**
   * 根据输入ID获取所有分析结果
   * @param inputId 输入ID
   * @returns 输入分析实体列表
   */
  async getByInputId(inputId: UUID): Promise<InputAnalysis[]> {
    try {
      const db = await this.dbConnection.getConnection();
      const rows = await db.all<InputAnalysisRow[]>(
        'SELECT * FROM input_analyses WHERE input_id = ?',
        [inputId.toString()]
      );

      return rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error('Failed to get input analyses by input ID', error as Error, { inputId: inputId.toString() });
      throw error;
    }
  }

  /**
   * 根据状态获取分析结果
   * @param status 分析状态
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 输入分析实体列表
   */
  async getByStatus(status: AnalysisStatus, limit: number, offset: number): Promise<InputAnalysis[]> {
    try {
      const db = await this.dbConnection.getConnection();
      const rows = await db.all<InputAnalysisRow[]>(
        'SELECT * FROM input_analyses WHERE status = ? LIMIT ? OFFSET ?',
        [status, limit, offset]
      );

      return rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error('Failed to get input analyses by status', error as Error, { status, limit, offset });
      throw error;
    }
  }

  /**
   * 根据类型获取分析结果
   * @param type 分析类型
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 输入分析实体列表
   */
  async getByType(type: string, limit: number, offset: number): Promise<InputAnalysis[]> {
    try {
      const db = await this.dbConnection.getConnection();
      const rows = await db.all<InputAnalysisRow[]>(
        'SELECT * FROM input_analyses WHERE type = ? LIMIT ? OFFSET ?',
        [type, limit, offset]
      );

      return rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error('Failed to get input analyses by type', error as Error, { type, limit, offset });
      throw error;
    }
  }

  /**
   * 更新分析状态
   * @param id 分析ID
   * @param status 新的分析状态
   * @returns 更新后的输入分析实体
   */
  async updateStatus(id: UUID, status: AnalysisStatus): Promise<InputAnalysis> {
    try {
      const db = await this.dbConnection.getConnection();
      await db.run(
        'UPDATE input_analyses SET status = ?, updated_at = ? WHERE id = ?',
        [status, new Date().toISOString(), id.toString()]
      );

      const updatedAnalysis = await this.getById(id);
      if (!updatedAnalysis) {
        throw new Error(`Input analysis with ID ${id.toString()} not found`);
      }

      this.logger.info('Input analysis status updated successfully', { id: id.toString(), status });
      return updatedAnalysis;
    } catch (error) {
      this.logger.error('Failed to update input analysis status', error as Error, { id: id.toString(), status });
      throw error;
    }
  }

  /**
   * 删除分析结果
   * @param id 分析ID
   * @returns 删除成功返回true，否则返回false
   */
  async delete(id: UUID): Promise<boolean> {
    try {
      const db = await this.dbConnection.getConnection();
      const result = await db.run('DELETE FROM input_analyses WHERE id = ?', [id.toString()]);
      const success = result.changes > 0;

      if (success) {
        this.logger.info('Input analysis deleted successfully', { id: id.toString() });
      }

      return success;
    } catch (error) {
      this.logger.error('Failed to delete input analysis', error as Error, { id: id.toString() });
      throw error;
    }
  }

  /**
   * 删除输入相关的所有分析结果
   * @param inputId 输入ID
   * @returns 删除的记录数
   */
  async deleteByInputId(inputId: UUID): Promise<number> {
    try {
      const db = await this.dbConnection.getConnection();
      const result = await db.run('DELETE FROM input_analyses WHERE input_id = ?', [inputId.toString()]);
      const deletedCount = result.changes;

      this.logger.info('Input analyses deleted by input ID', { inputId: inputId.toString(), deletedCount });
      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to delete input analyses by input ID', error as Error, { inputId: inputId.toString() });
      throw error;
    }
  }

  /**
   * 批量获取分析结果
   * @param ids 分析ID列表
   * @returns 输入分析实体列表
   */
  async getByIds(ids: UUID[]): Promise<InputAnalysis[]> {
    try {
      if (ids.length === 0) {
        return [];
      }

      const db = await this.dbConnection.getConnection();
      const placeholders = ids.map(() => '?').join(',');
      const values = ids.map(id => id.toString());
      const rows = await db.all<InputAnalysisRow[]>(
        `SELECT * FROM input_analyses WHERE id IN (${placeholders})`,
        values
      );

      return rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error('Failed to get input analyses by IDs', error as Error, { ids: ids.map(id => id.toString()) });
      throw error;
    }
  }

  /**
   * 将数据库行映射为输入分析实体
   * @param row 数据库行
   * @returns 输入分析实体
   */
  private mapRowToEntity(row: InputAnalysisRow): InputAnalysis {
    return new InputAnalysis({
      id: new UUID(row.id),
      inputId: new UUID(row.input_id),
      type: row.type,
      result: JSON.parse(row.result),
      status: row.status as AnalysisStatus,
      confidence: row.confidence,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }
}

/**
 * 输入分析数据库行接口
 */
interface InputAnalysisRow {
  id: string;
  input_id: string;
  type: string;
  result: string;
  status: string;
  confidence: number;
  created_at: string;
  updated_at: string;
}
