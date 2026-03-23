/**
 * 认知概念仓库实现
 * 使用TypeORM实现CognitiveConceptRepository接口
 */
import { Repository } from 'typeorm';
import { CognitiveConcept, CognitiveConceptImpl } from '../../../domain/entities/cognitive-concept';
import { CognitiveConceptRepository } from '../../../domain/repositories/cognitive-concept-repository';
import { CognitiveConceptEntity } from '../entities/cognitive-concept.entity';

/**
 * 认知概念仓库实现类
 */
export class CognitiveConceptRepositoryImpl implements CognitiveConceptRepository {
  /**
   * 构造函数
   * @param cognitiveConceptEntityRepository TypeORM的CognitiveConceptEntity仓库
   */
  constructor(
    private readonly cognitiveConceptEntityRepository: Repository<CognitiveConceptEntity>
  ) {}

  /**
   * 将领域实体转换为数据库实体
   * @param concept 领域实体
   * @returns 数据库实体
   */
  private toEntity(concept: CognitiveConcept): CognitiveConceptEntity {
    const entity = new CognitiveConceptEntity();
    entity.id = concept.id;
    entity.modelId = concept.modelId;
    entity.semanticIdentity = concept.semanticIdentity;
    entity.abstractionLevel = concept.abstractionLevel;
    entity.confidenceScore = concept.confidenceScore;
    entity.description = concept.description;
    entity.metadata = concept.metadata;
    entity.createdAt = concept.createdAt;
    entity.updatedAt = concept.updatedAt;
    entity.sourceThoughtIds = concept.sourceThoughtIds;
    return entity;
  }

  /**
   * 将数据库实体转换为领域实体
   * @param entity 数据库实体
   * @returns 领域实体
   */
  private toDomain(entity: CognitiveConceptEntity): CognitiveConcept {
    return new CognitiveConceptImpl(
      entity.id,
      entity.semanticIdentity,
      entity.abstractionLevel,
      entity.confidenceScore,
      entity.description,
      entity.metadata,
      entity.sourceThoughtIds,
      entity.createdAt
    );
  }

  /**
   * 创建认知概念
   * @param concept 认知概念实体
   * @returns 创建的认知概念实体
   */
  async create(concept: CognitiveConcept): Promise<CognitiveConcept> {
    const entity = this.toEntity(concept);
    const savedEntity = await this.cognitiveConceptEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 根据ID获取认知概念
   * @param id 认知概念ID
   * @returns 认知概念实体，如果不存在则返回null
   */
  async getById(id: string): Promise<CognitiveConcept | null> {
    const entity = await this.cognitiveConceptEntityRepository.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * 根据认知模型ID获取所有认知概念
   * @param modelId 认知模型ID
   * @returns 认知概念实体列表
   */
  async getByModelId(modelId: string): Promise<CognitiveConcept[]> {
    const entities = await this.cognitiveConceptEntityRepository.findBy({ modelId });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 根据思想片段ID获取相关的认知概念
   * @param thoughtId 思想片段ID
   * @returns 认知概念实体列表
   */
  async getByThoughtId(thoughtId: string): Promise<CognitiveConcept[]> {
    const entities = await this.cognitiveConceptEntityRepository
      .createQueryBuilder('concept')
      .where('concept.sourceThoughtIds LIKE :thoughtId', { thoughtId: `%${thoughtId}%` })
      .getMany();
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 更新认知概念
   * @param concept 认知概念实体
   * @returns 更新后的认知概念实体
   */
  async update(concept: CognitiveConcept): Promise<CognitiveConcept> {
    const entity = this.toEntity(concept);
    const savedEntity = await this.cognitiveConceptEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 删除认知概念
   * @param id 认知概念ID
   * @returns 是否删除成功
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.cognitiveConceptEntityRepository.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  /**
   * 根据认知模型ID删除所有认知概念
   * @param modelId 认知模型ID
   * @returns 删除的数量
   */
  async deleteByModelId(modelId: string): Promise<number> {
    const result = await this.cognitiveConceptEntityRepository.delete({ modelId });
    return result.affected ?? 0;
  }

  /**
   * 检查认知概念是否存在
   * @param id 认知概念ID
   * @returns 是否存在
   */
  async existsById(id: string): Promise<boolean> {
    const count = await this.cognitiveConceptEntityRepository.countBy({ id });
    return count > 0;
  }

  /**
   * 批量创建认知概念
   * @param concepts 认知概念实体列表
   * @returns 创建的认知概念实体列表
   */
  async createMany(concepts: CognitiveConcept[]): Promise<CognitiveConcept[]> {
    const entities = concepts.map(concept => this.toEntity(concept));
    const savedEntities = await this.cognitiveConceptEntityRepository.save(entities);
    return savedEntities.map(entity => this.toDomain(entity));
  }

  /**
   * 批量更新认知概念
   * @param concepts 认知概念实体列表
   * @returns 更新后的认知概念实体列表
   */
  async updateMany(concepts: CognitiveConcept[]): Promise<CognitiveConcept[]> {
    const entities = concepts.map(concept => this.toEntity(concept));
    const savedEntities = await this.cognitiveConceptEntityRepository.save(entities);
    return savedEntities.map(entity => this.toDomain(entity));
  }
}