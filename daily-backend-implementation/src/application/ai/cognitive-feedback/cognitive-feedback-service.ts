// 认知反馈生成服务接口
import { CognitiveInsight, UserCognitiveModel } from '@/domain/entities/user-cognitive-model';
import { CognitiveConcept, CognitiveRelation } from '@/domain/entities/cognitive-concept';

/**
 * 洞察生成结果
 */
export interface InsightGenerationResult {
  /** 洞察ID */
  id: string;
  /** 洞察内容 */
  insights: CognitiveInsight[];
  /** 生成时间 */
  generatedAt: Date;
  /** 置信度 */
  confidence: number;
}

/**
 * 主题分析结果
 */
export interface ThemeAnalysisResult {
  /** 分析ID */
  id: string;
  /** 核心主题列表 */
  coreThemes: CoreTheme[];
  /** 主题关系网络 */
  themeNetwork: ThemeRelation[];
  /** 生成时间 */
  analyzedAt: Date;
}

/**
 * 核心主题
 */
export interface CoreTheme {
  /** 主题ID */
  id: string;
  /** 主题名称 */
  name: string;
  /** 主题描述 */
  description: string;
  /** 主题相关概念 */
  relatedConcepts: CognitiveConcept[];
  /** 主题权重 */
  weight: number;
  /** 置信度 */
  confidence: number;
}

/**
 * 主题关系
 */
export interface ThemeRelation {
  /** 源主题ID */
  sourceThemeId: string;
  /** 目标主题ID */
  targetThemeId: string;
  /** 关系类型 */
  relationType: string;
  /** 关系强度 */
  strength: number;
}

/**
 * 盲点检测结果
 */
export interface BlindspotDetectionResult {
  /** 检测ID */
  id: string;
  /** 盲点列表 */
  blindspots: Blindspot[];
  /** 检测时间 */
  detectedAt: Date;
  /** 总置信度 */
  confidence: number;
}

/**
 * 认知盲点
 */
export interface Blindspot {
  /** 盲点ID */
  id: string;
  /** 盲点类型 */
  type: BlindspotType;
  /** 盲点描述 */
  description: string;
  /** 相关概念 */
  relatedConcepts: CognitiveConcept[];
  /** 影响范围 */
  impactScope: ImpactScope;
  /** 严重程度 */
  severity: SeverityLevel;
  /** 置信度 */
  confidence: number;
  /** 建议改进措施 */
  suggestions: string[];
}

/**
 * 盲点类型
 */
export enum BlindspotType {
  /** 概念缺失 */
  CONCEPT_MISSING = 'CONCEPT_MISSING',
  /** 关系缺失 */
  RELATION_MISSING = 'RELATION_MISSING',
  /** 层次结构缺失 */
  HIERARCHY_MISSING = 'HIERARCHY_MISSING',
  /** 平衡缺失 */
  BALANCE_MISSING = 'BALANCE_MISSING',
  /** 深度缺失 */
  DEPTH_MISSING = 'DEPTH_MISSING'
}

/**
 * 影响范围
 */
export enum ImpactScope {
  /** 局部影响 */
  LOCAL = 'LOCAL',
  /** 全局影响 */
  GLOBAL = 'GLOBAL',
  /** 关键影响 */
  CRITICAL = 'CRITICAL'
}

/**
 * 严重程度
 */
export enum SeverityLevel {
  /** 低严重程度 */
  LOW = 'LOW',
  /** 中严重程度 */
  MEDIUM = 'MEDIUM',
  /** 高严重程度 */
  HIGH = 'HIGH'
}

/**
 * 差距识别结果
 */
export interface GapIdentificationResult {
  /** 识别ID */
  id: string;
  /** 差距列表 */
  gaps: Gap[];
  /** 识别时间 */
  identifiedAt: Date;
  /** 总置信度 */
  confidence: number;
}

/**
 * 认知差距
 */
export interface Gap {
  /** 差距ID */
  id: string;
  /** 差距类型 */
  type: GapType;
  /** 差距描述 */
  description: string;
  /** 差距来源 */
  source: string;
  /** 差距目标 */
  target: string;
  /** 差距大小 */
  magnitude: number;
  /** 影响范围 */
  impactScope: ImpactScope;
  /** 严重程度 */
  severity: SeverityLevel;
  /** 置信度 */
  confidence: number;
  /** 建议改进措施 */
  suggestions: string[];
}

/**
 * 差距类型
 */
export enum GapType {
  /** 知识差距 */
  KNOWLEDGE_GAP = 'KNOWLEDGE_GAP',
  /** 理解差距 */
  UNDERSTANDING_GAP = 'UNDERSTANDING_GAP',
  /** 应用差距 */
  APPLICATION_GAP = 'APPLICATION_GAP',
  /** 关联差距 */
  CONNECTION_GAP = 'CONNECTION_GAP',
  /** 视角差距 */
  PERSPECTIVE_GAP = 'PERSPECTIVE_GAP'
}

/**
 * 反馈格式化结果
 */
export interface FeedbackFormattingResult {
  /** 格式化ID */
  id: string;
  /** 原始反馈内容 */
  rawFeedback: any;
  /** 格式化后的反馈 */
  formattedFeedback: FormattedFeedback;
  /** 格式化时间 */
  formattedAt: Date;
}

/**
 * 格式化后的反馈
 */
export interface FormattedFeedback {
  /** 反馈标题 */
  title: string;
  /** 反馈摘要 */
  summary: string;
  /** 核心洞察列表 */
  insights: CognitiveInsight[];
  /** 核心主题分析 */
  themeAnalysis: ThemeAnalysisResult;
  /** 认知盲点检测 */
  blindspotDetection: BlindspotDetectionResult;
  /** 认知差距识别 */
  gapIdentification: GapIdentificationResult;
  /** 建议行动项 */
  actionItems: ActionItem[];
  /** 反馈类型 */
  feedbackType: FeedbackType;
  /** 优先级 */
  priority: PriorityLevel;
  /** 推荐分享渠道 */
  recommendedChannels: string[];
}

/**
 * 反馈类型
 */
export enum FeedbackType {
  /** 洞察型反馈 */
  INSIGHT = 'INSIGHT',
  /** 建议型反馈 */
  SUGGESTION = 'SUGGESTION',
  /** 警告型反馈 */
  WARNING = 'WARNING',
  /** 总结型反馈 */
  SUMMARY = 'SUMMARY'
}

/**
 * 优先级级别
 */
export enum PriorityLevel {
  /** 低优先级 */
  LOW = 'LOW',
  /** 中优先级 */
  MEDIUM = 'MEDIUM',
  /** 高优先级 */
  HIGH = 'HIGH',
  /** 紧急优先级 */
  URGENT = 'URGENT'
}

/**
 * 行动项
 */
export interface ActionItem {
  /** 行动项ID */
  id: string;
  /** 行动项描述 */
  description: string;
  /** 行动项类型 */
  type: ActionItemType;
  /** 优先级 */
  priority: PriorityLevel;
  /** 建议执行时间 */
  suggestedTimeframe: string;
  /** 预期效果 */
  expectedOutcome: string;
  /** 相关资源 */
  relatedResources: string[];
}

/**
 * 行动项类型
 */
export enum ActionItemType {
  /** 探索型行动 */
  EXPLORE = 'EXPLORE',
  /** 学习型行动 */
  LEARN = 'LEARN',
  /** 连接型行动 */
  CONNECT = 'CONNECT',
  /** 反思型行动 */
  REFLECT = 'REFLECT',
  /** 应用型行动 */
  APPLY = 'APPLY'
}

/**
 * 洞察生成服务接口
 */
export interface InsightGenerationService {
  /**
   * 生成认知洞察
   * @param userId 用户ID
   * @param model 用户认知模型
   * @returns 洞察生成结果
   */
  generateInsights(userId: string, model: UserCognitiveModel): Promise<InsightGenerationResult>;

  /**
   * 基于特定主题生成洞察
   * @param userId 用户ID
   * @param model 用户认知模型
   * @param themeId 主题ID
   * @returns 洞察生成结果
   */
  generateInsightsByTheme(userId: string, model: UserCognitiveModel, themeId: string): Promise<InsightGenerationResult>;

  /**
   * 批量生成洞察
   * @param userId 用户ID
   * @param models 用户认知模型列表
   * @returns 洞察生成结果列表
   */
  generateBatchInsights(userId: string, models: UserCognitiveModel[]): Promise<InsightGenerationResult[]>;
}

/**
 * 主题分析服务接口
 */
export interface ThemeAnalysisService {
  /**
   * 分析认知模型的核心主题
   * @param userId 用户ID
   * @param model 用户认知模型
   * @returns 主题分析结果
   */
  analyzeCoreThemes(userId: string, model: UserCognitiveModel): Promise<ThemeAnalysisResult>;

  /**
   * 构建主题关系网络
   * @param userId 用户ID
   * @param themes 核心主题列表
   * @param relations 认知关系列表
   * @returns 主题关系网络
   */
  buildThemeNetwork(userId: string, themes: CoreTheme[], relations: CognitiveRelation[]): Promise<ThemeRelation[]>;

  /**
   * 更新主题权重
   * @param userId 用户ID
   * @param themeId 主题ID
   * @param weight 新权重
   * @returns 更新后的主题
   */
  updateThemeWeight(userId: string, themeId: string, weight: number): Promise<CoreTheme>;
}

/**
 * 盲点检测服务接口
 */
export interface BlindspotDetectionService {
  /**
   * 检测认知模型中的盲点
   * @param userId 用户ID
   * @param model 用户认知模型
   * @returns 盲点检测结果
   */
  detectBlindspots(userId: string, model: UserCognitiveModel): Promise<BlindspotDetectionResult>;

  /**
   * 检测特定类型的盲点
   * @param userId 用户ID
   * @param model 用户认知模型
   * @param blindspotType 盲点类型
   * @returns 盲点检测结果
   */
  detectSpecificBlindspot(userId: string, model: UserCognitiveModel, blindspotType: BlindspotType): Promise<BlindspotDetectionResult>;

  /**
   * 评估盲点影响
   * @param userId 用户ID
   * @param blindspot 盲点
   * @returns 影响评估结果
   */
  evaluateBlindspotImpact(userId: string, blindspot: Blindspot): Promise<{ impactScore: number; impactDescription: string }>;
}

/**
 * 差距识别服务接口
 */
export interface GapIdentificationService {
  /**
   * 识别认知模型中的差距
   * @param userId 用户ID
   * @param model 用户认知模型
   * @returns 差距识别结果
   */
  identifyGaps(userId: string, model: UserCognitiveModel): Promise<GapIdentificationResult>;

  /**
   * 比较两个认知模型之间的差距
   * @param userId 用户ID
   * @param sourceModel 源认知模型
   * @param targetModel 目标认知模型
   * @returns 差距识别结果
   */
  compareModelGaps(userId: string, sourceModel: UserCognitiveModel, targetModel: UserCognitiveModel): Promise<GapIdentificationResult>;

  /**
   * 评估差距大小
   * @param userId 用户ID
   * @param gap 认知差距
   * @returns 差距评估结果
   */
  evaluateGapMagnitude(userId: string, gap: Gap): Promise<{ magnitudeScore: number; magnitudeDescription: string }>;
}

/**
 * 反馈格式化服务接口
 */
export interface FeedbackFormattingService {
  /**
   * 格式化认知反馈
   * @param userId 用户ID
   * @param rawFeedback 原始反馈内容
   * @returns 格式化后的反馈
   */
  formatFeedback(userId: string, rawFeedback: any): Promise<FeedbackFormattingResult>;

  /**
   * 生成反馈报告
   * @param userId 用户ID
   * @param formattedFeedback 格式化后的反馈
   * @returns 反馈报告
   */
  generateFeedbackReport(userId: string, formattedFeedback: FormattedFeedback): Promise<any>;

  /**
   * 导出反馈为指定格式
   * @param userId 用户ID
   * @param formattedFeedback 格式化后的反馈
   * @param format 导出格式
   * @returns 导出内容
   */
  exportFeedback(userId: string, formattedFeedback: FormattedFeedback, format: string): Promise<any>;
}

/**
 * 认知反馈生成服务接口
 */
export interface CognitiveFeedbackService {
  /** 洞察生成服务 */
  insightGenerationService: InsightGenerationService;
  /** 主题分析服务 */
  themeAnalysisService: ThemeAnalysisService;
  /** 盲点检测服务 */
  blindspotDetectionService: BlindspotDetectionService;
  /** 差距识别服务 */
  gapIdentificationService: GapIdentificationService;
  /** 反馈格式化服务 */
  feedbackFormattingService: FeedbackFormattingService;

  /**
   * 生成完整认知反馈
   * @param userId 用户ID
   * @param model 用户认知模型
   * @returns 完整的认知反馈
   */
  generateCompleteFeedback(userId: string, model: UserCognitiveModel): Promise<FeedbackFormattingResult>;
}
