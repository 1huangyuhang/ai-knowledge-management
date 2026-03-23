/**
 * 认知洞察仓库实现
 * 使用TypeORM实现CognitiveInsightRepository接口
 */
import { Repository } from 'typeorm';
import { CognitiveInsight } from '../../../domain/entities/cognitive-insight';
import { CognitiveInsightRepository } from '../../../domain/repositories/cognitive-insight-repository';
import { UUID } from '../../../domain/value-objects/uuid';
import { CognitiveInsightEntity } from '../entities/cognitive-insight.entity';

/**
 * 认知洞察仓库实现类
 */
export class CognitiveInsightRepositoryImpl implements CognitiveInsightRepository {
  /**
   * 构造函数
   * @param cognitiveInsightEntityRepository TypeORM的CognitiveInsightEntity仓库
   */
  constructor(
    private readonly cognitiveInsightEntityRepository: Repository<CognitiveInsightEntity>
  ) {}

  /**
   * 将领域实体转换为数据库实体
   * @param insight 领域实体
   * @returns 数据库实体
   */
  private toEntity(insight: CognitiveInsight): CognitiveInsightEntity {
    const entity = new CognitiveInsightEntity();
    entity.id = insight.getId().toString();
    entity.userId = insight.getUserId().toString();
    entity.type = insight.getType();
    entity.isRead = insight.getIsRead();
    // 使用title和description作为content
    entity.content = {
      title: insight.getTitle(),
      description: insight.getDescription()
    };
    entity.confidence = 1.0; // 默认置信度
    entity.createdAt = insight.getCreatedAt();
    entity.updatedAt = insight.getUpdatedAt();
    return entity;
  }

  /**
   * 将数据库实体转换为领域实体
   * @param entity 数据库实体
   * @returns 领域实体
   */
  private toDomain(entity: CognitiveInsightEntity): CognitiveInsight {
    return new CognitiveInsight({
      id: UUID.fromString(entity.id),
      userId: UUID.fromString(entity.userId),
      title: entity.content['title'] || 'Untitled Insight',
      description: entity.content['description'] || '',
      type: entity.type,
      priority: 1,
      isRead: entity.isRead,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  /**
   * 创建认知洞察
   * @param insight 认知洞察实体
   * @returns 创建的认知洞察实体
   */
  async create(insight: CognitiveInsight): Promise<CognitiveInsight> {
    const entity = this.toEntity(insight);
    const savedEntity = await this.cognitiveInsightEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 根据ID获取认知洞察
   * @param id 认知洞察ID
   * @returns 认知洞察实体，如果不存在则返回null
   */
  async getById(id: UUID): Promise<CognitiveInsight | null> {
    const entity = await this.cognitiveInsightEntityRepository.findOneBy({ id: id.toString() });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * 根据用户ID获取所有认知洞察
   * @param userId 用户ID
   * @returns 认知洞察实体列表
   */
  async getByUserId(userId: UUID): Promise<CognitiveInsight[]> {
    const entities = await this.cognitiveInsightEntityRepository.findBy({
      userId: userId.toString()
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 获取用户未读的认知洞察
   * @param userId 用户ID
   * @returns 未读的认知洞察实体列表
   */
  async getUnreadByUserId(userId: UUID): Promise<CognitiveInsight[]> {
    const entities = await this.cognitiveInsightEntityRepository.findBy({
      userId: userId.toString(),
      isRead: false
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 更新认知洞察
   * @param insight 认知洞察实体
   * @returns 更新后的认知洞察实体
   */
  async update(insight: CognitiveInsight): Promise<CognitiveInsight> {
    const entity = this.toEntity(insight);
    const savedEntity = await this.cognitiveInsightEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 删除认知洞察
   * @param id 认知洞察ID
   * @returns 是否删除成功
   */
  async delete(id: UUID): Promise<boolean> {
    const result = await this.cognitiveInsightEntityRepository.delete({ id: id.toString() });
    return (result.affected ?? 0) > 0;
  }

  /**
   * 批量删除认知洞察
   * @param ids 认知洞察ID列表
   * @returns 删除的数量
   */
  async deleteMany(ids: UUID[]): Promise<number> {
    const idStrings = ids.map(id => id.toString());
    const result = await this.cognitiveInsightEntityRepository.delete({
      id: {
        $in: idStrings
      } as any
    });
    return result.affected ?? 0;
  }

  /**
   * 标记认知洞察为已读
   * @param id 认知洞察ID
   * @returns 是否更新成功
   */
  async markAsRead(id: UUID): Promise<boolean> {
    const result = await this.cognitiveInsightEntityRepository.update(
      { id: id.toString() },
      { isRead: true, updatedAt: new Date() }
    );
    return (result.affected ?? 0) > 0;
  }

  /**
   * 批量标记认知洞察为已读
   * @param ids 认知洞察ID列表
   * @returns 更新的数量
   */
  async markManyAsRead(ids: UUID[]): Promise<number> {
    const idStrings = ids.map(id => id.toString());
    const result = await this.cognitiveInsightEntityRepository.update(
      {
        id: {
          $in: idStrings
        } as any
      },
      { isRead: true, updatedAt: new Date() }
    );
    return result.affected ?? 0;
  }

  /**
   * 根据类型获取认知洞察
   * @param userId 用户ID
   * @param type 洞察类型
   * @returns 认知洞察实体列表
   */
  async getByTypeAndUserId(userId: UUID, type: string): Promise<CognitiveInsight[]> {
    const entities = await this.cognitiveInsightEntityRepository.findBy({
      userId: userId.toString(),
      type
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 获取用户最近的认知洞察
   * @param userId 用户ID
   * @param limit 限制数量
   * @returns 最近的认知洞察实体列表
   */
  async getRecentByUserId(userId: UUID, limit: number): Promise<CognitiveInsight[]> {
    const entities = await this.cognitiveInsightEntityRepository.find({
      where: { userId: userId.toString() },
      order: { createdAt: 'DESC' },
      take: limit
    });
    return entities.map(entity => this.toDomain(entity));
  }
}