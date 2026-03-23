/**
 * 认知关系仓库接口
 * 定义认知关系数据的访问方式
 */
import { CognitiveRelation } from '../entities/cognitive-relation';
import { CognitiveRelationType } from '../entities/cognitive-relation';

/**
 * 认知关系仓库接口
 */
export interface CognitiveRelationRepository {
  /**
   * 创建认知关系
   * @param relation 认知关系实体
   * @returns 创建的认知关系实体
   */
  create(relation: CognitiveRelation): Promise<CognitiveRelation>;

  /**
   * 根据ID获取认知关系
   * @param id 认知关系ID
   * @returns 认知关系实体，如果不存在则返回null
   */
  getById(id: string): Promise<CognitiveRelation | null>;

  /**
   * 根据认知模型ID获取所有认知关系
   * @param modelId 认知模型ID
   * @returns 认知关系实体列表
   */
  getByModelId(modelId: string): Promise<CognitiveRelation[]>;

  /**
   * 根据认知概念ID获取相关的认知关系
   * @param conceptId 认知概念ID
   * @returns 认知关系实体列表
   */
  getByConceptId(conceptId: string): Promise<CognitiveRelation[]>;

  /**
   * 根据认知概念ID和关系类型获取相关的认知关系
   * @param conceptId 认知概念ID
   * @param type 认知关系类型
   * @returns 认知关系实体列表
   */
  getByConceptIdAndType(conceptId: string, type: CognitiveRelationType): Promise<CognitiveRelation[]>;

  /**
   * 根据思想片段ID获取相关的认知关系
   * @param thoughtId 思想片段ID
   * @returns 认知关系实体列表
   */
  getByThoughtId(thoughtId: string): Promise<CognitiveRelation[]>;

  /**
   * 更新认知关系
   * @param relation 认知关系实体
   * @returns 更新后的认知关系实体
   */
  update(relation: CognitiveRelation): Promise<CognitiveRelation>;

  /**
   * 删除认知关系
   * @param id 认知关系ID
   * @returns 是否删除成功
   */
  delete(id: string): Promise<boolean>;

  /**
   * 根据认知模型ID删除所有认知关系
   * @param modelId 认知模型ID
   * @returns 删除的数量
   */
  deleteByModelId(modelId: string): Promise<number>;

  /**
   * 根据认知概念ID删除所有相关的认知关系
   * @param conceptId 认知概念ID
   * @returns 删除的数量
   */
  deleteByConceptId(conceptId: string): Promise<number>;

  /**
   * 检查认知关系是否存在
   * @param id 认知关系ID
   * @returns 是否存在
   */
  existsById(id: string): Promise<boolean>;

  /**
   * 批量创建认知关系
   * @param relations 认知关系实体列表
   * @returns 创建的认知关系实体列表
   */
  createMany(relations: CognitiveRelation[]): Promise<CognitiveRelation[]>;

  /**
   * 批量更新认知关系
   * @param relations 认知关系实体列表
   * @returns 更新后的认知关系实体列表
   */
  updateMany(relations: CognitiveRelation[]): Promise<CognitiveRelation[]>;
}