/**
 * 思想片段仓库接口
 * 定义思想片段数据的访问方式
 */
import { ThoughtFragment } from '../entities/thought-fragment';
import { UUID } from '../value-objects/uuid';

export interface ThoughtFragmentRepository {
  /**
   * 创建思想片段
   * @param fragment 思想片段实体
   * @returns 创建的思想片段实体
   */
  create(fragment: ThoughtFragment): Promise<ThoughtFragment>;

  /**
   * 根据ID获取思想片段
   * @param id 思想片段ID
   * @returns 思想片段实体，如果不存在则返回null
   */
  getById(id: UUID): Promise<ThoughtFragment | null>;

  /**
   * 根据用户ID获取所有思想片段
   * @param userId 用户ID
   * @returns 思想片段实体列表
   */
  getByUserId(userId: UUID): Promise<ThoughtFragment[]>;

  /**
   * 获取用户未处理的思想片段
   * @param userId 用户ID
   * @returns 未处理的思想片段实体列表
   */
  getUnprocessedByUserId(userId: UUID): Promise<ThoughtFragment[]>;

  /**
   * 更新思想片段
   * @param fragment 思想片段实体
   * @returns 更新后的思想片段实体
   */
  update(fragment: ThoughtFragment): Promise<ThoughtFragment>;

  /**
   * 删除思想片段
   * @param id 思想片段ID
   * @returns 是否删除成功
   */
  delete(id: UUID): Promise<boolean>;

  /**
   * 批量删除思想片段
   * @param ids 思想片段ID列表
   * @returns 删除的数量
   */
  deleteMany(ids: UUID[]): Promise<number>;

  /**
   * 标记思想片段为已处理
   * @param id 思想片段ID
   * @returns 是否更新成功
   */
  markAsProcessed(id: UUID): Promise<boolean>;

  /**
   * 批量标记思想片段为已处理
   * @param ids 思想片段ID列表
   * @returns 更新的数量
   */
  markManyAsProcessed(ids: UUID[]): Promise<number>;

  /**
   * 根据ID列表批量获取思想片段
   * @param ids 思想片段ID列表
   * @returns 思想片段实体列表
   */
  getByIds(ids: UUID[]): Promise<ThoughtFragment[]>;
}
