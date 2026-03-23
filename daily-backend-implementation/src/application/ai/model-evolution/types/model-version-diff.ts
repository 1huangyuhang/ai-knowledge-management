import { ConceptDiff } from './concept-diff';
import { RelationDiff } from './relation-diff';

/**
 * 模型版本差异
 */
export interface ModelVersionDiff {
  /**
   * 差异ID
   */
  id: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 起始版本
   */
  fromVersion: string;
  /**
   * 结束版本
   */
  toVersion: string;
  /**
   * 差异计算时间
   */
  calculatedAt: Date;
  /**
   * 概念差异
   */
  conceptDiff: ConceptDiff;
  /**
   * 关系差异
   */
  relationDiff: RelationDiff;
  /**
   * 统计信息
   */
  statistics: {
    /**
     * 总变化数
     */
    totalChanges: number;
    /**
     * 概念变化数
     */
    conceptChanges: number;
    /**
     * 关系变化数
     */
    relationChanges: number;
    /**
     * 变化百分比
     */
    changePercentage: number;
  };
}