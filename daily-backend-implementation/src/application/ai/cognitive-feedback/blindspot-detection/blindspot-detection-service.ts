/**
 * 盲点检测服务接口定义
 */
import {
  BlindspotDetectionResult,
  Blindspot,
  BlindspotDetectionOptions
} from '@/domain/ai/cognitive-feedback/cognitive-feedback';

/**
 * 盲点检测服务接口
 */
export interface BlindspotDetectionService {
  /**
   * 检测认知模型中的盲点
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param options 盲点检测选项
   * @returns 盲点检测结果
   */
  detectBlindspots(
    userId: string,
    modelId: string,
    options?: BlindspotDetectionOptions
  ): Promise<BlindspotDetectionResult>;

  /**
   * 获取指定盲点的详细信息
   * @param userId 用户ID
   * @param blindspotId 盲点ID
   * @returns 盲点详情
   */
  getBlindspotById(
    userId: string,
    blindspotId: string
  ): Promise<Blindspot | null>;

  /**
   * 获取认知模型的盲点列表
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param options 筛选选项
   * @returns 盲点列表
   */
  getBlindspotsByModelId(
    userId: string,
    modelId: string,
    options?: {
      blindspotTypes?: string[];
      impactThreshold?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<Blindspot[]>;

  /**
   * 更新盲点信息
   * @param userId 用户ID
   * @param blindspotId 盲点ID
   * @param updateData 更新数据
   * @returns 更新后的盲点
   */
  updateBlindspot(
    userId: string,
    blindspotId: string,
    updateData: Partial<Blindspot>
  ): Promise<Blindspot>;

  /**
   * 删除盲点
   * @param userId 用户ID
   * @param blindspotId 盲点ID
   * @returns 删除结果
   */
  deleteBlindspot(
    userId: string,
    blindspotId: string
  ): Promise<boolean>;
}
