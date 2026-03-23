/**
 * 输入分析仓库实现
 * 使用TypeORM实现InputAnalysisRepository接口
 */
import { Repository } from 'typeorm';
import { InputAnalysis } from '../../../domain/entities/InputAnalysis';
import { InputAnalysisRepository } from '../../../domain/repositories/InputAnalysisRepository';
import { InputAnalysisEntity } from '../entities/input-analysis.entity';
import { UUID } from '../../../domain/value-objects/UUID';
import { AnalysisStatus } from '../../../domain/entities/InputAnalysis';

/**
 * 输入分析仓库实现类
 */
export class InputAnalysisRepositoryImpl implements InputAnalysisRepository {
  /**
   * 构造函数
   * @param inputAnalysisEntityRepository TypeORM的InputAnalysisEntity仓库
   */
  constructor(
    private readonly inputAnalysisEntityRepository: Repository<InputAnalysisEntity>
  ) {}

  /**
   * 将领域实体转换为数据库实体
   * @param analysis 领域实体
   * @returns 数据库实体
   */
  private toEntity(analysis: InputAnalysis): InputAnalysisEntity {
    const entity = new InputAnalysisEntity();
    entity.id = analysis.id.toString();
    entity.inputId = analysis.inputId.toString();
    entity.type = analysis.type;
    entity.result = analysis.result;
    entity.status = analysis.status;
    entity.confidence = analysis.confidence;
    entity.createdAt = analysis.createdAt;
    entity.updatedAt = analysis.updatedAt;
    return entity;
  }

  /**
   * 将数据库实体转换为领域实体
   * @param entity 数据库实体
   * @returns 领域实体
   */
  private toDomain(entity: InputAnalysisEntity): InputAnalysis {
    return new InputAnalysis({
      id: UUID.fromString(entity.id),
      inputId: UUID.fromString(entity.inputId),
      type: entity.type,
      result: entity.result,
      status: entity.status,
      confidence: entity.confidence,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  /**
   * 保存输入分析结果
   * @param analysis 输入分析实体
   * @returns 保存后的输入分析实体
   */
  async save(analysis: InputAnalysis): Promise<InputAnalysis> {
    const entity = this.toEntity(analysis);
    const savedEntity = await this.inputAnalysisEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 根据ID获取输入分析结果
   * @param id 分析ID
   * @returns 输入分析实体，如果不存在则返回null
   */
  async getById(id: UUID): Promise<InputAnalysis | null> {
    const entity = await this.inputAnalysisEntityRepository.findOneBy({ id: id.toString() });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * 根据输入ID获取所有分析结果
   * @param inputId 输入ID
   * @returns 输入分析实体列表
   */
  async getByInputId(inputId: UUID): Promise<InputAnalysis[]> {
    const entities = await this.inputAnalysisEntityRepository.findBy({ inputId: inputId.toString() });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 根据状态获取分析结果
   * @param status 分析状态
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 输入分析实体列表
   */
  async getByStatus(status: AnalysisStatus, limit: number, offset: number): Promise<InputAnalysis[]> {
    const entities = await this.inputAnalysisEntityRepository.find({
      where: { status },
      take: limit,
      skip: offset
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 根据类型获取分析结果
   * @param type 分析类型
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 输入分析实体列表
   */
  async getByType(type: string, limit: number, offset: number): Promise<InputAnalysis[]> {
    const entities = await this.inputAnalysisEntityRepository.find({
      where: { type },
      take: limit,
      skip: offset
    });
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 更新分析状态
   * @param id 分析ID
   * @param status 新的分析状态
   * @returns 更新后的输入分析实体
   */
  async updateStatus(id: UUID, status: AnalysisStatus): Promise<InputAnalysis> {
    await this.inputAnalysisEntityRepository.update(
      { id: id.toString() },
      { status }
    );
    const updatedEntity = await this.inputAnalysisEntityRepository.findOneBy({ id: id.toString() });
    if (!updatedEntity) {
      throw new Error(`InputAnalysis with ID ${id.toString()} not found`);
    }
    return this.toDomain(updatedEntity);
  }

  /**
   * 删除分析结果
   * @param id 分析ID
   * @returns 删除成功返回true，否则返回false
   */
  async delete(id: UUID): Promise<boolean> {
    const result = await this.inputAnalysisEntityRepository.delete({ id: id.toString() });
    return (result.affected ?? 0) > 0;
  }

  /**
   * 删除输入相关的所有分析结果
   * @param inputId 输入ID
   * @returns 删除的记录数
   */
  async deleteByInputId(inputId: UUID): Promise<number> {
    const result = await this.inputAnalysisEntityRepository.delete({ inputId: inputId.toString() });
    return result.affected ?? 0;
  }

  /**
   * 批量获取分析结果
   * @param ids 分析ID列表
   * @returns 输入分析实体列表
   */
  async getByIds(ids: UUID[]): Promise<InputAnalysis[]> {
    const idStrings = ids.map(id => id.toString());
    const entities = await this.inputAnalysisEntityRepository.findBy({ id: { $in: idStrings } });
    return entities.map(entity => this.toDomain(entity));
  }
}
