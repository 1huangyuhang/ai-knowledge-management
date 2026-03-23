// src/infrastructure/repositories/InputRepositoryImpl.ts
import { injectable } from 'inversify';
import { InputRepository } from '../../domain/repositories/input-repository';
import { FileInput } from '../../domain/entities/file-input';
import { SpeechInput } from '../../domain/entities/speech-input';
import { UUID } from '../../domain/value-objects/uuid';
import { DatabaseConnection } from '../database/connection/DatabaseConnection';

@injectable()
export class InputRepositoryImpl implements InputRepository {
  constructor(private readonly databaseConnection: DatabaseConnection) {}

  /**
   * 初始化文件输入表
   */
  private async initFileInputTable(): Promise<void> {
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

  /**
   * 初始化语音输入表
   */
  private async initSpeechInputTable(): Promise<void> {
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

  /**
   * 保存文件输入
   * @param fileInput 文件输入实体
   * @returns 保存后的文件输入
   */
  public async saveFileInput(fileInput: FileInput): Promise<FileInput> {
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

  /**
   * 保存语音输入
   * @param speechInput 语音输入实体
   * @returns 保存后的语音输入
   */
  public async saveSpeechInput(speechInput: SpeechInput): Promise<SpeechInput> {
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

  /**
   * 根据ID获取文件输入
   * @param id 文件输入ID
   * @returns 文件输入实体或null
   */
  public async getFileInputById(id: UUID): Promise<FileInput | null> {
    await this.initFileInputTable();
    const db = await this.databaseConnection.getConnection();
    
    const sql = 'SELECT * FROM file_inputs WHERE id = ?';
    const row = await db.get(sql, [id.value]);
    
    if (!row) {
      return null;
    }
    
    return this.mapRowToFileInput(row);
  }

  /**
   * 根据ID获取语音输入
   * @param id 语音输入ID
   * @returns 语音输入实体或null
   */
  public async getSpeechInputById(id: UUID): Promise<SpeechInput | null> {
    await this.initSpeechInputTable();
    const db = await this.databaseConnection.getConnection();
    
    const sql = 'SELECT * FROM speech_inputs WHERE id = ?';
    const row = await db.get(sql, [id.value]);
    
    if (!row) {
      return null;
    }
    
    return this.mapRowToSpeechInput(row);
  }

  /**
   * 获取用户的所有输入历史
   * @param userId 用户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 输入历史列表
   */
  public async getUserInputHistory(
    userId: UUID,
    limit: number,
    offset: number
  ): Promise<Array<FileInput | SpeechInput>> {
    await Promise.all([
      this.initFileInputTable(),
      this.initSpeechInputTable()
    ]);
    
    const db = await this.databaseConnection.getConnection();
    
    // 获取文件输入
    const fileInputsSql = `
      SELECT 'file' as type, * FROM file_inputs 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    const fileRows = await db.all(fileInputsSql, [userId.value, limit, offset]);
    
    // 获取语音输入
    const speechInputsSql = `
      SELECT 'speech' as type, * FROM speech_inputs 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    const speechRows = await db.all(speechInputsSql, [userId.value, limit, offset]);
    
    // 合并并按创建时间排序
    const allInputs = [
      ...fileRows.map(row => ({ type: 'file', data: this.mapRowToFileInput(row) })),
      ...speechRows.map(row => ({ type: 'speech', data: this.mapRowToSpeechInput(row) }))
    ];
    
    return allInputs
      .sort((a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime())
      .map(item => item.data);
  }

  /**
   * 获取用户的文件输入历史
   * @param userId 用户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 文件输入历史列表
   */
  public async getUserFileInputHistory(
    userId: UUID,
    limit: number,
    offset: number
  ): Promise<FileInput[]> {
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

  /**
   * 获取用户的语音输入历史
   * @param userId 用户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 语音输入历史列表
   */
  public async getUserSpeechInputHistory(
    userId: UUID,
    limit: number,
    offset: number
  ): Promise<SpeechInput[]> {
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

  /**
   * 获取用户的输入统计信息
   * @param userId 用户ID
   * @returns 输入统计信息
   */
  public async getUserInputStatistics(userId: UUID): Promise<{
    totalInputs: number;
    fileInputs: number;
    speechInputs: number;
    totalSize: number;
    averageInputSize: number;
    latestInputAt: Date | null;
  }> {
    await Promise.all([
      this.initFileInputTable(),
      this.initSpeechInputTable()
    ]);
    
    const db = await this.databaseConnection.getConnection();
    
    // 获取文件输入统计
    const fileStatsSql = `
      SELECT COUNT(*) as count, SUM(size) as totalSize 
      FROM file_inputs 
      WHERE userId = ?
    `;
    const fileStats = await db.get(fileStatsSql, [userId.value]);
    
    // 获取语音输入统计
    const speechStatsSql = `
      SELECT COUNT(*) as count 
      FROM speech_inputs 
      WHERE userId = ?
    `;
    const speechStats = await db.get(speechStatsSql, [userId.value]);
    
    // 获取最新输入时间
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

  /**
   * 删除输入
   * @param id 输入ID
   * @returns 是否删除成功
   */
  public async deleteInput(id: UUID): Promise<boolean> {
    await Promise.all([
      this.initFileInputTable(),
      this.initSpeechInputTable()
    ]);
    
    const db = await this.databaseConnection.getConnection();
    
    // 尝试删除文件输入
    const fileDeleteSql = 'DELETE FROM file_inputs WHERE id = ?';
    const fileResult = await db.run(fileDeleteSql, [id.value]);
    
    if (fileResult.changes > 0) {
      return true;
    }
    
    // 尝试删除语音输入
    const speechDeleteSql = 'DELETE FROM speech_inputs WHERE id = ?';
    const speechResult = await db.run(speechDeleteSql, [id.value]);
    
    return speechResult.changes > 0;
  }

  /**
   * 批量删除输入
   * @param ids 输入ID列表
   * @returns 删除成功的数量
   */
  public async deleteInputs(ids: UUID[]): Promise<number> {
    await Promise.all([
      this.initFileInputTable(),
      this.initSpeechInputTable()
    ]);
    
    const db = await this.databaseConnection.getConnection();
    const idValues = ids.map(id => id.value);
    const placeholders = ids.map(() => '?').join(',');
    
    // 删除文件输入
    const fileDeleteSql = `DELETE FROM file_inputs WHERE id IN (${placeholders})`;
    const fileResult = await db.run(fileDeleteSql, idValues);
    
    // 删除语音输入
    const speechDeleteSql = `DELETE FROM speech_inputs WHERE id IN (${placeholders})`;
    const speechResult = await db.run(speechDeleteSql, idValues);
    
    return fileResult.changes + speechResult.changes;
  }

  /**
   * 搜索用户的输入
   * @param userId 用户ID
   * @param keyword 搜索关键词
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 匹配的输入列表
   */
  public async searchUserInputs(
    userId: UUID,
    keyword: string,
    limit: number,
    offset: number
  ): Promise<Array<FileInput | SpeechInput>> {
    await Promise.all([
      this.initFileInputTable(),
      this.initSpeechInputTable()
    ]);
    
    const db = await this.databaseConnection.getConnection();
    const searchKeyword = `%${keyword}%`;
    
    // 搜索文件输入
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
    
    // 搜索语音输入
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
    
    // 合并并按创建时间排序
    const allInputs = [
      ...fileRows.map(row => ({ type: 'file', data: this.mapRowToFileInput(row) })),
      ...speechRows.map(row => ({ type: 'speech', data: this.mapRowToSpeechInput(row) }))
    ];
    
    return allInputs
      .sort((a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime())
      .map(item => item.data);
  }

  /**
   * 将数据库行映射为文件输入实体
   * @param row 数据库行
   * @returns 文件输入实体
   */
  private mapRowToFileInput(row: any): FileInput {
    return new FileInput({
      id: UUID.fromString(row.id),
      name: row.name,
      type: row.type,
      size: row.size,
      content: row.content,
      metadata: JSON.parse(row.metadata),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      userId: UUID.fromString(row.userId)
    });
  }

  /**
   * 将数据库行映射为语音输入实体
   * @param row 数据库行
   * @returns 语音输入实体
   */
  private mapRowToSpeechInput(row: any): SpeechInput {
    return new SpeechInput({
      id: UUID.fromString(row.id),
      audioUrl: row.audioUrl,
      transcription: row.transcription,
      confidence: row.confidence,
      language: row.language,
      duration: row.duration,
      metadata: JSON.parse(row.metadata),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      userId: UUID.fromString(row.userId)
    });
  }
}