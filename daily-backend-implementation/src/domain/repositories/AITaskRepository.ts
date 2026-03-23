/**
 * AI任务仓库接口
 * 定义AI任务数据的访问方法
 */
import { UUID } from '../value-objects/UUID';
import { AITask } from '../entities/AITask';
import { AITaskStatus, AITaskPriority, AITaskType } from '../entities/AITask';

export interface AITaskRepository {
  /**
   * 保存AI任务
   * @param task AI任务实体
   * @returns 保存后的AI任务实体
   */
  save(task: AITask): Promise<AITask>;

  /**
   * 根据ID查找AI任务
   * @param id AI任务ID
   * @returns AI任务实体或null
   */
  findById(id: UUID): Promise<AITask | null>;

  /**
   * 查找所有AI任务
   * @returns AI任务实体列表
   */
  findAll(): Promise<AITask[]>;

  /**
   * 根据状态查找AI任务
   * @param status AI任务状态
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns AI任务实体列表
   */
  findByStatus(status: AITaskStatus, limit?: number, offset?: number): Promise<AITask[]>;

  /**
   * 根据优先级查找AI任务
   * @param priority AI任务优先级
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns AI任务实体列表
   */
  findByPriority(priority: AITaskPriority, limit?: number, offset?: number): Promise<AITask[]>;

  /**
   * 根据类型查找AI任务
   * @param type AI任务类型
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns AI任务实体列表
   */
  findByType(type: AITaskType, limit?: number, offset?: number): Promise<AITask[]>;

  /**
   * 根据用户ID查找AI任务
   * @param userId 用户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns AI任务实体列表
   */
  findByUserId(userId: UUID, limit?: number, offset?: number): Promise<AITask[]>;

  /**
   * 根据认知模型ID查找AI任务
   * @param cognitiveModelId 认知模型ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns AI任务实体列表
   */
  findByCognitiveModelId(cognitiveModelId: UUID, limit?: number, offset?: number): Promise<AITask[]>;

  /**
   * 根据ID列表查找AI任务
   * @param ids AI任务ID列表
   * @returns AI任务实体列表
   */
  findByIds(ids: UUID[]): Promise<AITask[]>;

  /**
   * 更新AI任务状态
   * @param id AI任务ID
   * @param status 新状态
   * @returns 更新后的AI任务实体
   */
  updateStatus(id: UUID, status: AITaskStatus): Promise<AITask>;

  /**
   * 更新AI任务优先级
   * @param id AI任务ID
   * @param priority 新优先级
   * @returns 更新后的AI任务实体
   */
  updatePriority(id: UUID, priority: AITaskPriority): Promise<AITask>;

  /**
   * 删除AI任务
   * @param id AI任务ID
   * @returns 是否删除成功
   */
  delete(id: UUID): Promise<boolean>;

  /**
   * 删除所有AI任务
   * @returns 删除的任务数量
   */
  deleteAll(): Promise<number>;

  /**
   * 删除指定状态的AI任务
   * @param status AI任务状态
   * @returns 删除的任务数量
   */
  deleteByStatus(status: AITaskStatus): Promise<number>;

  /**
   * 统计AI任务数量
   * @returns AI任务数量
   */
  count(): Promise<number>;

  /**
   * 根据状态统计AI任务数量
   * @param status AI任务状态
   * @returns AI任务数量
   */
  countByStatus(status: AITaskStatus): Promise<number>;

  /**
   * 根据类型统计AI任务数量
   * @param type AI任务类型
   * @returns AI任务数量
   */
  countByType(type: AITaskType): Promise<number>;

  /**
   * 查找过期的AI任务
   * @param threshold 过期阈值（毫秒）
   * @returns AI任务实体列表
   */
  findExpiredTasks(threshold: number): Promise<AITask[]>;

  /**
   * 查找待执行的AI任务
   * @param limit 限制数量
   * @returns AI任务实体列表
   */
  findPendingTasks(limit?: number): Promise<AITask[]>;
}
