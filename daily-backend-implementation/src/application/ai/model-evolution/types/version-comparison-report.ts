import { ModelVersionDiff } from './model-version-diff';

/**
 * 版本对比摘要
 */
export interface VersionComparisonSummary {
  /**
   * 版本1
   */
  version1: string;
  /**
   * 版本2
   */
  version2: string;
  /**
   * 比较时间
   */
  comparisonTime: Date;
  /**
   * 总变化数
   */
  totalChanges: number;
  /**
   * 变化类型分布
   */
  changeDistribution: {
    /**
     * 新增项数量
     */
    added: number;
    /**
     * 更新项数量
     */
    updated: number;
    /**
     * 删除项数量
     */
    removed: number;
  };
  /**
   * 变化百分比
   */
  changePercentage: number;
}

/**
 * 变化趋势分析
 */
export interface ChangeTrendAnalysis {
  /**
   * 趋势类型
   */
  trendType: string;
  /**
   * 趋势描述
   */
  description: string;
  /**
   * 趋势强度
   */
  strength: 'low' | 'medium' | 'high';
  /**
   * 影响范围
   */
  impact: 'low' | 'medium' | 'high';
}

/**
 * 版本对比报告
 */
export interface VersionComparisonReport {
  /**
   * 报告ID
   */
  reportId: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 报告生成时间
   */
  generatedAt: Date;
  /**
   * 对比摘要
   */
  summary: VersionComparisonSummary;
  /**
   * 详细差异
   */
  detailedDiff: ModelVersionDiff;
  /**
   * 变化趋势分析
   */
  trendAnalysis: ChangeTrendAnalysis[];
  /**
   * 影响评估
   */
  impactAssessment: {
    /**
     * 对模型结构的影响
     */
    structuralImpact: 'low' | 'medium' | 'high';
    /**
     * 对模型质量的影响
     */
    qualityImpact: 'low' | 'medium' | 'high';
    /**
     * 对后续演化的影响
     */
    evolutionImpact: 'low' | 'medium' | 'high';
  };
  /**
   * 建议
   */
  recommendations: string[];
  /**
   * 报告版本
   */
  reportVersion: string;
}