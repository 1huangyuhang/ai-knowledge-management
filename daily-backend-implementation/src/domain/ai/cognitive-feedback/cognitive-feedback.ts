/**
 * 认知反馈生成类型定义
 */

/**
 * 认知洞察类型
 */
export enum CognitiveInsightType {
  /**
   * 概念洞察
   */
  CONCEPT_INSIGHT = 'CONCEPT_INSIGHT',
  /**
   * 关系洞察
   */
  RELATION_INSIGHT = 'RELATION_INSIGHT',
  /**
   * 结构洞察
   */
  STRUCTURE_INSIGHT = 'STRUCTURE_INSIGHT',
  /**
   * 演化洞察
   */
  EVOLUTION_INSIGHT = 'EVOLUTION_INSIGHT',
  /**
   * 主题洞察
   */
  THEME_INSIGHT = 'THEME_INSIGHT',
  /**
   * 盲点洞察
   */
  BLINDSPOT_INSIGHT = 'BLINDSPOT_INSIGHT',
  /**
   * 差距洞察
   */
  GAP_INSIGHT = 'GAP_INSIGHT'
}

/**
 * 认知洞察
 */
export interface CognitiveInsight {
  /**
   * 洞察ID
   */
  id: string;
  /**
   * 洞察类型
   */
  type: CognitiveInsightType;
  /**
   * 洞察标题
   */
  title: string;
  /**
   * 洞察描述
   */
  description: string;
  /**
   * 洞察重要性
   */
  importance: number;
  /**
   * 洞察置信度
   */
  confidence: number;
  /**
   * 相关概念ID列表
   */
  relatedConceptIds?: string[];
  /**
   * 相关关系ID列表
   */
  relatedRelationIds?: string[];
  /**
   * 建议
   */
  suggestions: string[];
  /**
   * 创建时间
   */
  createdAt: Date;
}

/**
 * 主题分析结果
 */
export interface ThemeAnalysisResult {
  /**
   * 分析ID
   */
  id: string;
  /**
   * 主题列表
   */
  themes: Theme[];
  /**
   * 主题分布
   */
  themeDistribution: Record<string, number>;
  /**
   * 主导主题
   */
  dominantTheme: Theme;
  /**
   * 分析摘要
   */
  summary: string;
  /**
   * 分析建议
   */
  recommendations: string[];
  /**
   * 创建时间
   */
  createdAt: Date;
}

/**
 * 主题
 */
export interface Theme {
  /**
   * 主题ID
   */
  id: string;
  /**
   * 主题名称
   */
  name: string;
  /**
   * 主题描述
   */
  description: string;
  /**
   * 主题强度
   */
  strength: number;
  /**
   * 相关概念
   */
  relatedConcepts: string[];
  /**
   * 主题类型
   */
  type: string;
}

/**
 * 盲点检测结果
 */
export interface BlindspotDetectionResult {
  /**
   * 检测ID
   */
  id: string;
  /**
   * 盲点列表
   */
  blindspots: Blindspot[];
  /**
   * 盲点分布
   */
  blindspotDistribution: Record<string, number>;
  /**
   * 分析摘要
   */
  summary: string;
  /**
   * 改进建议
   */
  recommendations: string[];
  /**
   * 创建时间
   */
  createdAt: Date;
}

/**
 * 盲点
 */
export interface Blindspot {
  /**
   * 盲点ID
   */
  id: string;
  /**
   * 盲点描述
   */
  description: string;
  /**
   * 盲点类型
   */
  type: string;
  /**
   * 影响程度
   */
  impact: number;
  /**
   * 相关主题
   */
  relatedThemes: string[];
  /**
   * 潜在风险
   */
  potentialRisks: string[];
}

/**
 * 差距识别结果
 */
export interface GapIdentificationResult {
  /**
   * 识别ID
   */
  id: string;
  /**
   * 差距列表
   */
  gaps: Gap[];
  /**
   * 差距分布
   */
  gapDistribution: Record<string, number>;
  /**
   * 分析摘要
   */
  summary: string;
  /**
   * 改进建议
   */
  recommendations: string[];
  /**
   * 创建时间
   */
  createdAt: Date;
}

/**
 * 差距
 */
export interface Gap {
  /**
   * 差距ID
   */
  id: string;
  /**
   * 差距描述
   */
  description: string;
  /**
   * 差距类型
   */
  type: string;
  /**
   * 差距大小
   */
  size: number;
  /**
   * 相关概念
   */
  relatedConcepts: string[];
  /**
   * 相关关系
   */
  relatedRelations: string[];
  /**
   * 改进方向
   */
  improvementDirection: string;
}

/**
 * 认知反馈格式
 */
export interface CognitiveFeedback {
  /**
   * 反馈ID
   */
  id: string;
  /**
   * 反馈标题
   */
  title: string;
  /**
   * 反馈类型
   */
  type: string;
  /**
   * 反馈内容
   */
  content: string;
  /**
   * 反馈格式
   */
  format: FeedbackFormat;
  /**
   * 相关洞察ID
   */
  relatedInsightIds: string[];
  /**
   * 创建时间
   */
  createdAt: Date;
}

/**
 * 反馈格式
 */
export enum FeedbackFormat {
  /**
   * 文本格式
   */
  TEXT = 'TEXT',
  /**
   * 结构化格式
   */
  STRUCTURED = 'STRUCTURED',
  /**
   * 可视化格式
   */
  VISUAL = 'VISUAL',
  /**
   * 交互式格式
   */
  INTERACTIVE = 'INTERACTIVE'
}

/**
 * 洞察生成选项
 */
export interface InsightGenerationOptions {
  /**
   * 洞察类型
   */
  insightTypes?: CognitiveInsightType[];
  /**
   * 重要性阈值
   */
  importanceThreshold?: number;
  /**
   * 置信度阈值
   */
  confidenceThreshold?: number;
  /**
   * 最大洞察数量
   */
  maxInsights?: number;
  /**
   * 是否包含建议
   */
  includeSuggestions?: boolean;
}

/**
 * 主题分析选项
 */
export interface ThemeAnalysisOptions {
  /**
   * 最大主题数量
   */
  maxThemes?: number;
  /**
   * 主题强度阈值
   */
  themeStrengthThreshold?: number;
  /**
   * 是否包含相关概念
   */
  includeRelatedConcepts?: boolean;
}

/**
 * 盲点检测选项
 */
export interface BlindspotDetectionOptions {
  /**
   * 盲点类型
   */
  blindspotTypes?: string[];
  /**
   * 影响程度阈值
   */
  impactThreshold?: number;
  /**
   * 是否包含潜在风险
   */
  includePotentialRisks?: boolean;
}

/**
 * 差距识别选项
 */
export interface GapIdentificationOptions {
  /**
   * 差距类型
   */
  gapTypes?: string[];
  /**
   * 差距大小阈值
   */
  gapSizeThreshold?: number;
  /**
   * 是否包含改进方向
   */
  includeImprovementDirection?: boolean;
}

/**
 * 反馈格式化选项
 */
export interface FeedbackFormattingOptions {
  /**
   * 反馈格式
   */
  format: FeedbackFormat;
  /**
   * 语言
   */
  language?: string;
  /**
   * 复杂度级别
   */
  complexityLevel?: string;
  /**
   * 是否包含可视化
   */
  includeVisualization?: boolean;
  /**
   * 是否包含交互式元素
   */
  includeInteractiveElements?: boolean;
}
