import { UUID } from '../value-objects/UUID';
import { InputAnalysis } from '../entities/InputAnalysis';
import { AnalysisStatus, AnalysisType } from '../entities/InputAnalysis';

/**
 * 输入分析仓库接口
 * 定义输入分析数据的访问方法
 */
export interface InputAnalysisRepository {
  /**
   * 保存输入分析结果
   * @param analysis 输入分析实体
   * @returns 保存后的输入分析实体
   */
  save(analysis: InputAnalysis): Promise<InputAnalysis>;

  /**
   * 根据ID获取输入分析结果
   * @param id 分析ID
   * @returns 输入分析实体，如果不存在则返回null
   */
  getById(id: UUID): Promise<InputAnalysis | null>;

  /**
   * 根据输入ID获取所有分析结果
   * @param inputId 输入ID
   * @returns 输入分析实体列表
   */
  getByInputId(inputId: UUID): Promise<InputAnalysis[]>;

  /**
   * 根据状态获取分析结果
   * @param status 分析状态
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 输入分析实体列表
   */
  getByStatus(status: AnalysisStatus, limit: number, offset: number): Promise<InputAnalysis[]>;

  /**
   * 根据类型获取分析结果
   * @param type 分析类型
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 输入分析实体列表
   */
  getByType(type: AnalysisType, limit: number, offset: number): Promise<InputAnalysis[]>;

  /**
   * 更新分析状态
   * @param id 分析ID
   * @param status 新的分析状态
   * @returns 更新后的输入分析实体
   */
  updateStatus(id: UUID, status: AnalysisStatus): Promise<InputAnalysis>;

  /**
   * 删除分析结果
   * @param id 分析ID
   * @returns 删除成功返回true，否则返回false
   */
  delete(id: UUID): Promise<boolean>;

  /**
   * 删除输入相关的所有分析结果
   * @param inputId 输入ID
   * @returns 删除的记录数
   */
  deleteByInputId(inputId: UUID): Promise<number>;

  /**
   * 批量获取分析结果
   * @param ids 分析ID列表
   * @returns 输入分析实体列表
   */
  getByIds(ids: UUID[]): Promise<InputAnalysis[]>;
}
