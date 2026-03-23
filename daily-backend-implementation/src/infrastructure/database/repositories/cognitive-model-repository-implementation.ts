/**
 * 认知模型仓库实现
 * 使用TypeORM实现CognitiveModelRepository接口
 */
import { Repository } from 'typeorm';
import { CognitiveModel } from '../../../domain/entities/cognitive-model';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { UUID } from '../../../domain/value-objects/uuid';
import { CognitiveModelEntity } from '../entities/cognitive-model.entity';

/**
 * 认知模型仓库实现类
 */
export class CognitiveModelRepositoryImpl implements CognitiveModelRepository {
  /**
   * 构造函数
   * @param cognitiveModelEntityRepository TypeORM的CognitiveModelEntity仓库
   */
  constructor(
    private readonly cognitiveModelEntityRepository: Repository<CognitiveModelEntity>
  ) {}

  /**
   * 将领域实体转换为数据库实体
   * @param model 领域实体
   * @returns 数据库实体
   */
  private toEntity(model: CognitiveModel): CognitiveModelEntity {
    const entity = new CognitiveModelEntity();
    entity.id = model.getId().toString();
    entity.userId = model.getUserId().toString();
    entity.name = model.getName();
    entity.description = model.getDescription();
    entity.isActive = model.getIsActive();
    entity.createdAt = model.getCreatedAt();
    entity.updatedAt = model.getUpdatedAt();
    entity.version = model.getVersion();
    return entity;
  }

  /**
   * 将数据库实体转换为领域实体
   * @param entity 数据库实体
   * @returns 领域实体
   */
  private toDomain(entity: CognitiveModelEntity): CognitiveModel {
    return new CognitiveModel({
      id: UUID.fromString(entity.id),
      userId: UUID.fromString(entity.userId),
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      version: entity.version
    });
  }

  /**
   * 创建认知模型
   * @param model 认知模型实体
   * @returns 创建的认知模型实体
   */
  async create(model: CognitiveModel): Promise<CognitiveModel> {
    const entity = this.toEntity(model);
    const savedEntity = await this.cognitiveModelEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 根据ID获取认知模型
   * @param id 认知模型ID
   * @returns 认知模型实体，如果不存在则返回null
   */
  async getById(id: string): Promise<CognitiveModel | null> {
    const entity = await this.cognitiveModelEntityRepository.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * 根据用户ID获取所有认知模型
   * @param userId 用户ID
   * @returns 认知模型实体列表
   */
  async getByUserId(userId: string): Promise<CognitiveModel[]> {
    const entities = await this.cognitiveModelEntityRepository.findBy({ userId });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 更新认知模型
   * @param model 认知模型实体
   * @returns 更新后的认知模型实体
   */
  async update(model: CognitiveModel): Promise<CognitiveModel> {
    const entity = this.toEntity(model);
    const savedEntity = await this.cognitiveModelEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 删除认知模型
   * @param id 认知模型ID
   * @returns 是否删除成功
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.cognitiveModelEntityRepository.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  /**
   * 检查认知模型是否存在
   * @param id 认知模型ID
   * @returns 是否存在
   */
  async existsById(id: string): Promise<boolean> {
    const count = await this.cognitiveModelEntityRepository.countBy({ id });
    return count > 0;
  }

  /**
   * 获取用户的活跃认知模型
   * @param userId 用户ID
   * @returns 活跃的认知模型实体，如果不存在则返回null
   */
  async getActiveModelByUserId(userId: string): Promise<CognitiveModel | null> {
    const entity = await this.cognitiveModelEntityRepository.findOneBy({
      userId,
      isActive: true
    });
    return entity ? this.toDomain(entity) : null;
  }
}
