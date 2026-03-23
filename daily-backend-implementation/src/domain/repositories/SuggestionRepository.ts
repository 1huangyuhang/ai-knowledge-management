import { Suggestion } from '../entities/Suggestion';
import { UUID } from '../value-objects/UUID';
import { SuggestionType } from '../enums/SuggestionType';
import { SuggestionCategory } from '../enums/SuggestionCategory';

/**
 * 建议仓库接口
 * 定义建议实体的持久化操作
 */
export interface SuggestionRepository {
  /**
   * 创建建议
   * @param suggestion 建议实体
   * @returns 创建的建议实体
   */
  create(suggestion: Suggestion): Promise<Suggestion>;
  
  /**
   * 根据ID获取建议
   * @param id 建议ID
   * @returns 建议实体或null
   */
  getById(id: UUID): Promise<Suggestion | null>;
  
  /**
   * 根据用户ID获取建议列表
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 建议列表
   */
  getByUserId(userId: string, page: number, limit: number): Promise<Suggestion[]>;
  
  /**
   * 根据认知模型ID获取建议列表
   * @param cognitiveModelId 认知模型ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 建议列表
   */
  getByCognitiveModelId(cognitiveModelId: string, page: number, limit: number): Promise<Suggestion[]>;
  
  /**
   * 根据类型获取建议列表
   * @param type 建议类型
   * @param userId 用户ID
   * @returns 建议列表
   */
  getByType(type: SuggestionType, userId: string): Promise<Suggestion[]>;
  
  /**
   * 根据类别获取建议列表
   * @param category 建议类别
   * @param userId 用户ID
   * @returns 建议列表
   */
  getByCategory(category: SuggestionCategory, userId: string): Promise<Suggestion[]>;
  
  /**
   * 更新建议
   * @param suggestion 建议实体
   * @returns 更新后的建议实体
   */
  update(suggestion: Suggestion): Promise<Suggestion>;
  
  /**
   * 删除建议
   * @param id 建议ID
   * @returns 删除是否成功
   */
  delete(id: UUID): Promise<boolean>;
  
  /**
   * 获取用户的建议总数
   * @param userId 用户ID
   * @returns 建议总数
   */
  getTotalCountByUserId(userId: string): Promise<number>;
  
  /**
   * 获取用户高优先级建议数量
   * @param userId 用户ID
   * @param priorityThreshold 优先级阈值
   * @returns 高优先级建议数量
   */
  getHighPriorityCountByUserId(userId: string, priorityThreshold: number): Promise<number>;
}