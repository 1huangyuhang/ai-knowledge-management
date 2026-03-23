import { ModelVersionDiff } from './types/model-version-diff';
import { ConceptDiff } from './types/concept-diff';
import { RelationDiff } from './types/relation-diff';
import { VersionComparisonReport } from './types/version-comparison-report';

/**
 * 版本对比服务接口
 * 负责比较不同版本的模型
 */
export interface VersionComparisonService {
  /**
   * 比较两个版本的模型
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 版本差异
   */
  compareVersions(userId: string, version1: string, version2: string): Promise<ModelVersionDiff>;

  /**
   * 获取版本之间的概念差异
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 概念差异
   */
  getConceptDiff(userId: string, version1: string, version2: string): Promise<ConceptDiff>;

  /**
   * 获取版本之间的关系差异
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 关系差异
   */
  getRelationDiff(userId: string, version1: string, version2: string): Promise<RelationDiff>;

  /**
   * 生成版本对比报告
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 对比报告
   */
  generateComparisonReport(userId: string, version1: string, version2: string): Promise<VersionComparisonReport>;
}