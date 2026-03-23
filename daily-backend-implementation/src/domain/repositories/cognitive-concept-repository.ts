/**
 * 认知概念仓库接口
 * 定义认知概念数据的访问方式
 */
import { CognitiveConcept } from '../entities/cognitive-concept';

/**
 * 认知概念仓库接口
 */
export interface CognitiveConceptRepository {
  /**
   * 创建认知概念
   * @param concept 认知概念实体
   * @returns 创建的认知概念实体
   */
  create(concept: CognitiveConcept): Promise<CognitiveConcept>;

  /**
   * 根据ID获取认知概念
   * @param id 认知概念ID
   * @returns 认知概念实体，如果不存在则返回null
   */
  getById(id: string): Promise<CognitiveConcept | null>;

  /**
   * 根据认知模型ID获取所有认知概念
   * @param modelId 认知模型ID
   * @returns 认知概念实体列表
   */
  getByModelId(modelId: string): Promise<CognitiveConcept[]>;

  /**
   * 根据思想片段ID获取相关的认知概念
   * @param thoughtId 思想片段ID
   * @returns 认知概念实体列表
   */
  getByThoughtId(thoughtId: string): Promise<CognitiveConcept[]>;

  /**
   * 更新认知概念
   * @param concept 认知概念实体
   * @returns 更新后的认知概念实体
   */
  update(concept: CognitiveConcept): Promise<CognitiveConcept>;

  /**
   * 删除认知概念
   * @param id 认知概念ID
   * @returns 是否删除成功
   */
  delete(id: string): Promise<boolean>;

  /**
   * 根据认知模型ID删除所有认知概念
   * @param modelId 认知模型ID
   * @returns 删除的数量
   */
  deleteByModelId(modelId: string): Promise<number>;

  /**
   * 检查认知概念是否存在
   * @param id 认知概念ID
   * @returns 是否存在
   */
  existsById(id: string): Promise<boolean>;

  /**
   * 批量创建认知概念
   * @param concepts 认知概念实体列表
   * @returns 创建的认知概念实体列表
   */
  createMany(concepts: CognitiveConcept[]): Promise<CognitiveConcept[]>;

  /**
   * 批量更新认知概念
   * @param concepts 认知概念实体列表
   * @returns 更新后的认知概念实体列表
   */
  updateMany(concepts: CognitiveConcept[]): Promise<CognitiveConcept[]>;
}