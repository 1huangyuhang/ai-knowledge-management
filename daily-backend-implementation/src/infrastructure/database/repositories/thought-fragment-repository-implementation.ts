/**
 * 思想片段仓库实现
 * 使用TypeORM实现ThoughtFragmentRepository接口
 */
import { Repository, In } from 'typeorm';
import { ThoughtFragment, ThoughtFragmentImpl } from '../../../domain/entities/thought-fragment';
import { ThoughtFragmentRepository } from '../../../domain/repositories/thought-fragment-repository';
import { UUID } from '../../../domain/value-objects/uuid';
import { ThoughtFragmentEntity } from '../entities/thought-fragment.entity';

/**
 * 思想片段仓库实现类
 */
export class ThoughtFragmentRepositoryImpl implements ThoughtFragmentRepository {
  /**
   * 构造函数
   * @param thoughtFragmentEntityRepository TypeORM的ThoughtFragmentEntity仓库
   */
  constructor(
    private readonly thoughtFragmentEntityRepository: Repository<ThoughtFragmentEntity>
  ) {}

  /**
   * 将领域实体转换为数据库实体
   * @param fragment 领域实体
   * @returns 数据库实体
   */
  private toEntity(fragment: ThoughtFragment): ThoughtFragmentEntity {
    const entity = new ThoughtFragmentEntity();
    entity.id = fragment.id;
    entity.userId = fragment.userId;
    entity.content = fragment.content;
    entity.source = fragment.metadata?.['source'] || 'manual';
    entity.isProcessed = fragment.isProcessed;
    entity.createdAt = fragment.createdAt;
    entity.updatedAt = fragment.updatedAt || new Date();
    return entity;
  }

  /**
   * 将数据库实体转换为领域实体
   * @param entity 数据库实体
   * @returns 领域实体
   */
  private toDomain(entity: ThoughtFragmentEntity): ThoughtFragment {
    return new ThoughtFragmentImpl(
      entity.id,
      entity.content,
      entity.userId,
      { source: entity.source },
      entity.isProcessed,
      0,
      null,
      entity.createdAt
    );
  }

  /**
   * 创建思想片段
   * @param fragment 思想片段实体
   * @returns 创建的思想片段实体
   */
  async create(fragment: ThoughtFragment): Promise<ThoughtFragment> {
    const entity = this.toEntity(fragment);
    const savedEntity = await this.thoughtFragmentEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 根据ID获取思想片段
   * @param id 思想片段ID
   * @returns 思想片段实体，如果不存在则返回null
   */
  async getById(id: UUID): Promise<ThoughtFragment | null> {
    const entity = await this.thoughtFragmentEntityRepository.findOneBy({ id: id.toString() });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * 根据用户ID获取所有思想片段
   * @param userId 用户ID
   * @returns 思想片段实体列表
   */
  async getByUserId(userId: UUID): Promise<ThoughtFragment[]> {
    const entities = await this.thoughtFragmentEntityRepository.findBy({
      userId: userId.toString()
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 获取用户未处理的思想片段
   * @param userId 用户ID
   * @returns 未处理的思想片段实体列表
   */
  async getUnprocessedByUserId(userId: UUID): Promise<ThoughtFragment[]> {
    const entities = await this.thoughtFragmentEntityRepository.findBy({
      userId: userId.toString(),
      isProcessed: false
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 根据ID列表批量获取思想片段
   * @param ids 思想片段ID列表
   * @returns 思想片段实体列表
   */
  async getByIds(ids: UUID[]): Promise<ThoughtFragment[]> {
    const idStrings = ids.map(id => id.toString());
    const entities = await this.thoughtFragmentEntityRepository.findBy({
      id: In(idStrings)
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 更新思想片段
   * @param fragment 思想片段实体
   * @returns 更新后的思想片段实体
   */
  async update(fragment: ThoughtFragment): Promise<ThoughtFragment> {
    const entity = this.toEntity(fragment);
    const savedEntity = await this.thoughtFragmentEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 删除思想片段
   * @param id 思想片段ID
   * @returns 是否删除成功
   */
  async delete(id: UUID): Promise<boolean> {
    const result = await this.thoughtFragmentEntityRepository.delete({ id: id.toString() });
    return (result.affected ?? 0) > 0;
  }

  /**
   * 批量删除思想片段
   * @param ids 思想片段ID列表
   * @returns 删除的数量
   */
  async deleteMany(ids: UUID[]): Promise<number> {
    const idStrings = ids.map(id => id.toString());
    const result = await this.thoughtFragmentEntityRepository.delete({
      id: In(idStrings)
    });
    return result.affected ?? 0;
  }

  /**
   * 标记思想片段为已处理
   * @param id 思想片段ID
   * @returns 是否更新成功
   */
  async markAsProcessed(id: UUID): Promise<boolean> {
    const result = await this.thoughtFragmentEntityRepository.update(
      { id: id.toString() },
      { isProcessed: true, updatedAt: new Date() }
    );
    return (result.affected ?? 0) > 0;
  }

  /**
   * 批量标记思想片段为已处理
   * @param ids 思想片段ID列表
   * @returns 更新的数量
   */
  async markManyAsProcessed(ids: UUID[]): Promise<number> {
    const idStrings = ids.map(id => id.toString());
    const result = await this.thoughtFragmentEntityRepository.update(
      {
        id: In(idStrings)
      },
      { isProcessed: true, updatedAt: new Date() }
    );
    return result.affected ?? 0;
  }
}
