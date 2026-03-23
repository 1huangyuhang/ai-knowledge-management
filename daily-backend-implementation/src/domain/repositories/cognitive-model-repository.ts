/**
 * 认知模型仓库接口
 * 定义认知模型数据的访问方式
 */
import { CognitiveModel } from '../entities/cognitive-model';

export interface CognitiveModelRepository {
  /**
   * 创建认知模型
   * @param model 认知模型实体
   * @returns 创建的认知模型实体
   */
  create(model: CognitiveModel): Promise<CognitiveModel>;

  /**
   * 根据ID获取认知模型
   * @param id 认知模型ID
   * @returns 认知模型实体，如果不存在则返回null
   */
  getById(id: string): Promise<CognitiveModel | null>;

  /**
   * 根据用户ID获取所有认知模型
   * @param userId 用户ID
   * @returns 认知模型实体列表
   */
  getByUserId(userId: string): Promise<CognitiveModel[]>;

  /**
   * 更新认知模型
   * @param model 认知模型实体
   * @returns 更新后的认知模型实体
   */
  update(model: CognitiveModel): Promise<CognitiveModel>;

  /**
   * 删除认知模型
   * @param id 认知模型ID
   * @returns 是否删除成功
   */
  delete(id: string): Promise<boolean>;

  /**
   * 检查认知模型是否存在
   * @param id 认知模型ID
   * @returns 是否存在
   */
  existsById(id: string): Promise<boolean>;

  /**
   * 获取用户的活跃认知模型
   * @param userId 用户ID
   * @returns 活跃的认知模型实体，如果不存在则返回null
   */
  getActiveModelByUserId(userId: string): Promise<CognitiveModel | null>;
}
