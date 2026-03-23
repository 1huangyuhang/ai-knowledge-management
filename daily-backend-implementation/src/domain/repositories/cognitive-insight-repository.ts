/**
 * 认知洞察仓库接口
 * 定义认知洞察数据的访问方式
 */
import { CognitiveInsight } from '../entities/cognitive-insight';
import { UUID } from '../value-objects/uuid';

export interface CognitiveInsightRepository {
  /**
   * 创建认知洞察
   * @param insight 认知洞察实体
   * @returns 创建的认知洞察实体
   */
  create(insight: CognitiveInsight): Promise<CognitiveInsight>;

  /**
   * 根据ID获取认知洞察
   * @param id 认知洞察ID
   * @returns 认知洞察实体，如果不存在则返回null
   */
  getById(id: UUID): Promise<CognitiveInsight | null>;

  /**
   * 根据用户ID获取所有认知洞察
   * @param userId 用户ID
   * @returns 认知洞察实体列表
   */
  getByUserId(userId: UUID): Promise<CognitiveInsight[]>;

  /**
   * 获取用户未读的认知洞察
   * @param userId 用户ID
   * @returns 未读的认知洞察实体列表
   */
  getUnreadByUserId(userId: UUID): Promise<CognitiveInsight[]>;

  /**
   * 更新认知洞察
   * @param insight 认知洞察实体
   * @returns 更新后的认知洞察实体
   */
  update(insight: CognitiveInsight): Promise<CognitiveInsight>;

  /**
   * 删除认知洞察
   * @param id 认知洞察ID
   * @returns 是否删除成功
   */
  delete(id: UUID): Promise<boolean>;

  /**
   * 批量删除认知洞察
   * @param ids 认知洞察ID列表
   * @returns 删除的数量
   */
  deleteMany(ids: UUID[]): Promise<number>;

  /**
   * 标记认知洞察为已读
   * @param id 认知洞察ID
   * @returns 是否更新成功
   */
  markAsRead(id: UUID): Promise<boolean>;

  /**
   * 批量标记认知洞察为已读
   * @param ids 认知洞察ID列表
   * @returns 更新的数量
   */
  markManyAsRead(ids: UUID[]): Promise<number>;

  /**
   * 根据类型获取认知洞察
   * @param userId 用户ID
   * @param type 洞察类型
   * @returns 认知洞察实体列表
   */
  getByTypeAndUserId(userId: UUID, type: string): Promise<CognitiveInsight[]>;

  /**
   * 获取用户最近的认知洞察
   * @param userId 用户ID
   * @param limit 限制数量
   * @returns 最近的认知洞察实体列表
   */
  getRecentByUserId(userId: UUID, limit: number): Promise<CognitiveInsight[]>;
}
