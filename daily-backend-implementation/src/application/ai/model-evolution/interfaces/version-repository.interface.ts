/**
 * 版本仓库接口
 * 负责版本数据的持久化和查询
 */
import { ModelVersion, VersionQueryOptions } from '../version-management/version-management-service';

/**
 * 版本仓库接口
 */
export interface VersionRepository {
  /**
   * 查找用户的所有模型版本
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 版本列表
   */
  find(userId: string, options?: VersionQueryOptions): Promise<ModelVersion[]>;

  /**
   * 根据版本ID查找版本
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 版本信息
   */
  findById(userId: string, versionId: string): Promise<ModelVersion | null>;

  /**
   * 保存版本信息
   * @param version 版本信息
   * @returns 保存的版本信息
   */
  save(version: ModelVersion): Promise<ModelVersion>;

  /**
   * 删除版本
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 是否删除成功
   */
  delete(userId: string, versionId: string): Promise<boolean>;

  /**
   * 获取最新版本
   * @param userId 用户ID
   * @returns 最新版本
   */
  findLatest(userId: string): Promise<ModelVersion | null>;

  /**
   * 根据模型ID查找版本
   * @param userId 用户ID
   * @param modelId 模型ID
   * @returns 版本列表
   */
  findByModelId(userId: string, modelId: string): Promise<ModelVersion[]>;

  /**
   * 按时间范围查找版本
   * @param userId 用户ID
   * @param startDate 开始时间
   * @param endDate 结束时间
   * @returns 版本列表
   */
  findByTimeRange(userId: string, startDate: Date, endDate: Date): Promise<ModelVersion[]>;
}