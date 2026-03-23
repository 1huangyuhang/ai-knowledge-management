// src/infrastructure/repositories/AITaskRepositoryImpl.ts
import { injectable } from 'inversify';
import { AITaskRepository } from '../../domain/repositories/AITaskRepository';
import { AITask } from '../../domain/entities/AITask';
import { DatabaseConnection } from '../database/connection/DatabaseConnection';

@injectable()
export class AITaskRepositoryImpl implements AITaskRepository {
  constructor(private readonly databaseConnection: DatabaseConnection) {}

  /**
   * 初始化AI任务表
   */
  private async initTable(): Promise<void> {
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

  /**
   * 保存AI任务
   * @param task AI任务实体
   * @returns 保存后的AI任务
   */
  public async save(task: AITask): Promise<AITask> {
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

  /**
   * 根据ID查找AI任务
   * @param id 任务ID
   * @returns AI任务或null
   */
  public async findById(id: string): Promise<AITask | null> {
    await this.initTable();
    const db = await this.databaseConnection.getConnection();
    
    const sql = 'SELECT * FROM ai_tasks WHERE id = ?';
    const row = await db.get(sql, [id]);
    
    if (!row) {
      return null;
    }
    
    return this.mapRowToTask(row);
  }

  /**
   * 根据状态查找AI任务
   * @param status 任务状态
   * @returns AI任务列表
   */
  public async findByStatus(status: string): Promise<AITask[]> {
    await this.initTable();
    const db = await this.databaseConnection.getConnection();
    
    const sql = 'SELECT * FROM ai_tasks WHERE status = ? ORDER BY priority ASC, createdAt ASC';
    const rows = await db.all(sql, [status]);
    
    return rows.map(this.mapRowToTask);
  }

  /**
   * 根据类型查找AI任务
   * @param type 任务类型
   * @returns AI任务列表
   */
  public async findByType(type: string): Promise<AITask[]> {
    await this.initTable();
    const db = await this.databaseConnection.getConnection();
    
    const sql = 'SELECT * FROM ai_tasks WHERE type = ? ORDER BY createdAt DESC';
    const rows = await db.all(sql, [type]);
    
    return rows.map(this.mapRowToTask);
  }

  /**
   * 获取所有AI任务
   * @returns AI任务列表
   */
  public async findAll(): Promise<AITask[]> {
    await this.initTable();
    const db = await this.databaseConnection.getConnection();
    
    const sql = 'SELECT * FROM ai_tasks ORDER BY updatedAt DESC';
    const rows = await db.all(sql);
    
    return rows.map(this.mapRowToTask);
  }

  /**
   * 删除AI任务
   * @param id 任务ID
   * @returns 删除结果
   */
  public async delete(id: string): Promise<boolean> {
    await this.initTable();
    const db = await this.databaseConnection.getConnection();
    
    const sql = 'DELETE FROM ai_tasks WHERE id = ?';
    const result = await db.run(sql, [id]);
    
    return result.changes > 0;
  }

  /**
   * 更新AI任务
   * @param task AI任务实体
   * @returns 更新后的AI任务
   */
  public async update(task: AITask): Promise<AITask> {
    return this.save(task);
  }

  /**
   * 将数据库行映射为AI任务实体
   * @param row 数据库行
   * @returns AI任务实体
   */
  private mapRowToTask(row: any): AITask {
    return new AITask({
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
}