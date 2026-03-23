//
// ResourceRepository.ts
//

import { Resource, ResourceStatus, ResourceType } from '../domain/entities/Resource';
import { UUID } from '../core/domain/UUID';

/**
 * 资源仓库接口
 */
export interface ResourceRepository {
  /**
   * 保存资源
   * @param resource 资源
   * @returns 保存后的资源
   */
  save(resource: Resource): Promise<Resource>;

  /**
   * 根据ID获取资源
   * @param id 资源ID
   * @returns 资源，如果不存在则返回null
   */
  findById(id: UUID): Promise<Resource | null>;

  /**
   * 根据名称获取资源
   * @param name 资源名称
   * @returns 资源，如果不存在则返回null
   */
  findByName(name: string): Promise<Resource | null>;

  /**
   * 根据类型获取资源
   * @param type 资源类型
   * @returns 资源列表
   */
  findByType(type: ResourceType): Promise<Resource[]>;

  /**
   * 根据状态获取资源
   * @param status 资源状态
   * @returns 资源列表
   */
  findByStatus(status: ResourceStatus): Promise<Resource[]>;

  /**
   * 获取所有资源
   * @returns 资源列表
   */
  findAll(): Promise<Resource[]>;

  /**
   * 获取可用资源
   * @param type 可选的资源类型
   * @returns 可用资源列表
   */
  findAvailableResources(type?: ResourceType): Promise<Resource[]>;

  /**
   * 更新资源
   * @param resource 资源
   * @returns 更新后的资源
   */
  update(resource: Resource): Promise<Resource>;

  /**
   * 删除资源
   * @param id 资源ID
   * @returns 是否删除成功
   */
  delete(id: UUID): Promise<boolean>;

  /**
   * 获取资源使用统计
   * @param type 可选的资源类型
   * @returns 资源使用统计
   */
  getResourceUsageStatistics(type?: ResourceType): Promise<{
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    unavailable: number;
    averageUsageRate: number;
  }>;

  /**
   * 批量更新资源状态
   * @param ids 资源ID列表
   * @param status 资源状态
   * @returns 更新成功的资源数量
   */
  batchUpdateStatus(ids: UUID[], status: ResourceStatus): Promise<number>;
}
