/**
 * AI任务仓库实现
 * 使用TypeORM实现AITaskRepository接口
 */
import { Repository } from 'typeorm';
import { AITask } from '../../../domain/entities/AITask';
import { AITaskRepository } from '../../../domain/repositories/AITaskRepository';
import { AITaskEntity } from '../entities/ai-task.entity';
import { UUID } from '../../../domain/value-objects/UUID';
import { AITaskStatus, AITaskPriority, AITaskType } from '../../../domain/entities/AITask';

/**
 * AI任务仓库实现类
 */
export class AITaskRepositoryImpl implements AITaskRepository {
  /**
   * 构造函数
   * @param aiTaskEntityRepository TypeORM的AITaskEntity仓库
   */
  constructor(
    private readonly aiTaskEntityRepository: Repository<AITaskEntity>
  ) {}

  /**
   * 将领域实体转换为数据库实体
   * @param task 领域实体
   * @returns 数据库实体
   */
  private toEntity(task: AITask): AITaskEntity {
    const entity = new AITaskEntity();
    entity.id = task.id.toString();
    entity.type = task.type;
    entity.priority = task.priority;
    entity.status = task.status;
    entity.inputData = task.inputData;
    entity.result = task.result;
    entity.error = task.error;
    entity.retryCount = task.retryCount;
    entity.maxRetries = task.maxRetries;
    entity.createdAt = task.createdAt;
    entity.updatedAt = task.updatedAt;
    entity.startedAt = task.startedAt;
    entity.completedAt = task.completedAt;
    entity.estimatedExecutionTime = task.estimatedExecutionTime;
    entity.actualExecutionTime = task.actualExecutionTime;
    entity.userId = task.userId?.toString() || null;
    entity.cognitiveModelId = task.cognitiveModelId?.toString() || null;
    entity.dependsOn = task.dependsOn.map(id => id.toString());
    return entity;
  }

  /**
   * 将数据库实体转换为领域实体
   * @param entity 数据库实体
   * @returns 领域实体
   */
  private toDomain(entity: AITaskEntity): AITask {
    return new AITask({
      id: UUID.fromString(entity.id),
      type: entity.type,
      priority: entity.priority,
      status: entity.status,
      inputData: entity.inputData,
      result: entity.result,
      error: entity.error,
      retryCount: entity.retryCount,
      maxRetries: entity.maxRetries,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      startedAt: entity.startedAt,
      completedAt: entity.completedAt,
      estimatedExecutionTime: entity.estimatedExecutionTime,
      actualExecutionTime: entity.actualExecutionTime,
      userId: entity.userId ? UUID.fromString(entity.userId) : null,
      cognitiveModelId: entity.cognitiveModelId ? UUID.fromString(entity.cognitiveModelId) : null,
      dependsOn: entity.dependsOn.map(id => UUID.fromString(id))
    });
  }

  /**
   * 保存AI任务
   * @param task AI任务实体
   * @returns 保存后的AI任务实体
   */
  async save(task: AITask): Promise<AITask> {
    const entity = this.toEntity(task);
    const savedEntity = await this.aiTaskEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 根据ID查找AI任务
   * @param id AI任务ID
   * @returns AI任务实体或null
   */
  async findById(id: UUID): Promise<AITask | null> {
    const entity = await this.aiTaskEntityRepository.findOneBy({ id: id.toString() });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * 查找所有AI任务
   * @returns AI任务实体列表
   */
  async findAll(): Promise<AITask[]> {
    const entities = await this.aiTaskEntityRepository.find();
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 根据状态查找AI任务
   * @param status AI任务状态
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns AI任务实体列表
   */
  async findByStatus(status: AITaskStatus, limit?: number, offset?: number): Promise<AITask[]> {
    const entities = await this.aiTaskEntityRepository.find({
      where: { status },
      take: limit,
      skip: offset
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 根据优先级查找AI任务
   * @param priority AI任务优先级
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns AI任务实体列表
   */
  async findByPriority(priority: AITaskPriority, limit?: number, offset?: number): Promise<AITask[]> {
    const entities = await this.aiTaskEntityRepository.find({
      where: { priority },
      take: limit,
      skip: offset
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 根据类型查找AI任务
   * @param type AI任务类型
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns AI任务实体列表
   */
  async findByType(type: AITaskType, limit?: number, offset?: number): Promise<AITask[]> {
    const entities = await this.aiTaskEntityRepository.find({
      where: { type },
      take: limit,
      skip: offset
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 根据用户ID查找AI任务
   * @param userId 用户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns AI任务实体列表
   */
  async findByUserId(userId: UUID, limit?: number, offset?: number): Promise<AITask[]> {
    const entities = await this.aiTaskEntityRepository.find({
      where: { userId: userId.toString() },
      take: limit,
      skip: offset
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 根据认知模型ID查找AI任务
   * @param cognitiveModelId 认知模型ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns AI任务实体列表
   */
  async findByCognitiveModelId(cognitiveModelId: UUID, limit?: number, offset?: number): Promise<AITask[]> {
    const entities = await this.aiTaskEntityRepository.find({
      where: { cognitiveModelId: cognitiveModelId.toString() },
      take: limit,
      skip: offset
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 根据ID列表查找AI任务
   * @param ids AI任务ID列表
   * @returns AI任务实体列表
   */
  async findByIds(ids: UUID[]): Promise<AITask[]> {
    const idStrings = ids.map(id => id.toString());
    const entities = await this.aiTaskEntityRepository.findBy({ id: { $in: idStrings } });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 更新AI任务状态
   * @param id AI任务ID
   * @param status 新状态
   * @returns 更新后的AI任务实体
   */
  async updateStatus(id: UUID, status: AITaskStatus): Promise<AITask> {
    await this.aiTaskEntityRepository.update(
      { id: id.toString() },
      { status }
    );
    const updatedEntity = await this.aiTaskEntityRepository.findOneBy({ id: id.toString() });
    if (!updatedEntity) {
      throw new Error(`AITask with ID ${id.toString()} not found`);
    }
    return this.toDomain(updatedEntity);
  }

  /**
   * 更新AI任务优先级
   * @param id AI任务ID
   * @param priority 新优先级
   * @returns 更新后的AI任务实体
   */
  async updatePriority(id: UUID, priority: AITaskPriority): Promise<AITask> {
    await this.aiTaskEntityRepository.update(
      { id: id.toString() },
      { priority }
    );
    const updatedEntity = await this.aiTaskEntityRepository.findOneBy({ id: id.toString() });
    if (!updatedEntity) {
      throw new Error(`AITask with ID ${id.toString()} not found`);
    }
    return this.toDomain(updatedEntity);
  }

  /**
   * 删除AI任务
   * @param id AI任务ID
   * @returns 是否删除成功
   */
  async delete(id: UUID): Promise<boolean> {
    const result = await this.aiTaskEntityRepository.delete({ id: id.toString() });
    return (result.affected ?? 0) > 0;
  }

  /**
   * 删除所有AI任务
   * @returns 删除的任务数量
   */
  async deleteAll(): Promise<number> {
    const result = await this.aiTaskEntityRepository.delete({});
    return result.affected ?? 0;
  }

  /**
   * 删除指定状态的AI任务
   * @param status AI任务状态
   * @returns 删除的任务数量
   */
  async deleteByStatus(status: AITaskStatus): Promise<number> {
    const result = await this.aiTaskEntityRepository.delete({ status });
    return result.affected ?? 0;
  }

  /**
   * 统计AI任务数量
   * @returns AI任务数量
   */
  async count(): Promise<number> {
    return this.aiTaskEntityRepository.count();
  }

  /**
   * 根据状态统计AI任务数量
   * @param status AI任务状态
   * @returns AI任务数量
   */
  async countByStatus(status: AITaskStatus): Promise<number> {
    return this.aiTaskEntityRepository.countBy({ status });
  }

  /**
   * 根据类型统计AI任务数量
   * @param type AI任务类型
   * @returns AI任务数量
   */
  async countByType(type: AITaskType): Promise<number> {
    return this.aiTaskEntityRepository.countBy({ type });
  }

  /**
   * 查找过期的AI任务
   * @param threshold 过期阈值（毫秒）
   * @returns AI任务实体列表
   */
  async findExpiredTasks(threshold: number): Promise<AITask[]> {
    const now = new Date();
    const expiredTime = new Date(now.getTime() - threshold);
    
    const entities = await this.aiTaskEntityRepository.find({
      where: {
        status: AITaskStatus.RUNNING,
        startedAt: { $lt: expiredTime }
      }
    });
    
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 查找待执行的AI任务
   * @param limit 限制数量
   * @returns AI任务实体列表
   */
  async findPendingTasks(limit?: number): Promise<AITask[]> {
    const entities = await this.aiTaskEntityRepository.find({
      where: { status: AITaskStatus.PENDING },
      order: {
        priority: 'ASC',
        createdAt: 'ASC'
      },
      take: limit
    });
    return entities.map(entity => this.toDomain(entity));
  }
}
