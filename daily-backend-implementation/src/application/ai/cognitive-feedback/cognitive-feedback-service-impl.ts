import { v4 as uuidv4 } from 'uuid';
import {
  CognitiveFeedbackService,
  InsightGenerationService,
  ThemeAnalysisService,
  BlindspotDetectionService,
  GapIdentificationService,
  FeedbackFormattingService,
  InsightGenerationResult,
  ThemeAnalysisResult,
  BlindspotDetectionResult,
  GapIdentificationResult,
  FeedbackFormattingResult,
  CoreTheme,
  ThemeRelation,
  Blindspot,
  Gap,
  FormattedFeedback,
  ActionItem,
  BlindspotType,
  ImpactScope,
  SeverityLevel,
  GapType,
  FeedbackType,
  PriorityLevel,
  ActionItemType
} from './cognitive-feedback-service';
import { UserCognitiveModel, CognitiveInsight } from '@/domain/entities/user-cognitive-model';
import { CognitiveConcept, CognitiveRelation as DomainCognitiveRelation } from '@/domain/entities/cognitive-concept';
import { CognitiveModelService } from '@/domain/services/cognitive-model.service';
import { CognitiveInsightRepository } from '@/domain/repositories/cognitive-insight-repository';

/**
 * 洞察生成服务实现类
 */
export class InsightGenerationServiceImpl implements InsightGenerationService {
  constructor(
    private cognitiveModelService: CognitiveModelService,
    private cognitiveInsightRepository: CognitiveInsightRepository
  ) {}

  /**
   * 生成认知洞察
   * @param userId 用户ID
   * @param model 用户认知模型
   * @returns 洞察生成结果
   */
  async generateInsights(userId: string, model: UserCognitiveModel): Promise<InsightGenerationResult> {
    // 使用领域服务生成洞察
    const insight = this.cognitiveModelService.generateInsight(model);
    
    // 保存洞察到仓库
    await this.cognitiveInsightRepository.createCognitiveInsight(userId, insight);
    
    return {
      id: `insight-result-${uuidv4()}`,
      insights: [insight],
      generatedAt: new Date(),
      confidence: insight.confidence || 0.8
    };
  }

  /**
   * 基于特定主题生成洞察
   * @param userId 用户ID
   * @param model 用户认知模型
   * @param themeId 主题ID
   * @returns 洞察生成结果
   */
  async generateInsightsByTheme(userId: string, model: UserCognitiveModel, themeId: string): Promise<InsightGenerationResult> {
    // 简化实现：基于主题过滤概念后生成洞察
    const themeConcepts = model.concepts.filter(concept => concept.id === themeId || 
      model.relations.some(relation => relation.sourceConceptId === themeId || relation.targetConceptId === themeId));
    
    // 创建临时模型用于生成洞察
    const themeModel = {
      ...model,
      concepts: themeConcepts
    };
    
    const insight = this.cognitiveModelService.generateInsight(themeModel);
    
    await this.cognitiveInsightRepository.createCognitiveInsight(userId, insight);
    
    return {
      id: `insight-result-${uuidv4()}`,
      insights: [insight],
      generatedAt: new Date(),
      confidence: insight.confidence || 0.8
    };
  }

  /**
   * 批量生成洞察
   * @param userId 用户ID
   * @param models 用户认知模型列表
   * @returns 洞察生成结果列表
   */
  async generateBatchInsights(userId: string, models: UserCognitiveModel[]): Promise<InsightGenerationResult[]> {
    const results: InsightGenerationResult[] = [];
    
    for (const model of models) {
      const result = await this.generateInsights(userId, model);
      results.push(result);
    }
    
    return results;
  }
}

/**
 * 主题分析服务实现类
 */
export class ThemeAnalysisServiceImpl implements ThemeAnalysisService {
  /**
   * 分析认知模型的核心主题
   * @param userId 用户ID
   * @param model 用户认知模型
   * @returns 主题分析结果
   */
  async analyzeCoreThemes(userId: string, model: UserCognitiveModel): Promise<ThemeAnalysisResult> {
    // 分析核心主题：基于概念的置信度和关系数量
    const conceptRelationCount = new Map<string, number>();
    
    // 统计每个概念的关系数量
    model.relations.forEach(relation => {
      // 更新源概念的关系计数
      const sourceCount = conceptRelationCount.get(relation.sourceConceptId) || 0;
      conceptRelationCount.set(relation.sourceConceptId, sourceCount + 1);
      
      // 更新目标概念的关系计数
      const targetCount = conceptRelationCount.get(relation.targetConceptId) || 0;
      conceptRelationCount.set(relation.targetConceptId, targetCount + 1);
    });
    
    // 基于关系数量和置信度评分排序概念
    const sortedConcepts = [...model.concepts]
      .sort((a, b) => {
        const aScore = a.confidenceScore * 0.6 + (conceptRelationCount.get(a.id) || 0) * 0.4;
        const bScore = b.confidenceScore * 0.6 + (conceptRelationCount.get(b.id) || 0) * 0.4;
        return bScore - aScore;
      })
      .slice(0, 5); // 取前5个作为核心主题
    
    // 创建核心主题
    const coreThemes: CoreTheme[] = sortedConcepts.map(concept => {
      // 查找与该概念相关的其他概念
      const relatedConcepts = model.concepts.filter(relatedConcept => 
        relatedConcept.id !== concept.id &&
        model.relations.some(relation => 
          (relation.sourceConceptId === concept.id && relation.targetConceptId === relatedConcept.id) ||
          (relation.targetConceptId === concept.id && relation.sourceConceptId === relatedConcept.id)
        )
      );
      
      return {
        id: concept.id,
        name: concept.semanticIdentity,
        description: `核心主题：${concept.semanticIdentity}`,
        relatedConcepts,
        weight: concept.confidenceScore * 0.8 + (conceptRelationCount.get(concept.id) || 0) * 0.2,
        confidence: concept.confidenceScore
      };
    });
    
    // 构建主题关系网络
    const themeNetwork = await this.buildThemeNetwork(userId, coreThemes, model.relations);
    
    return {
      id: `theme-analysis-${uuidv4()}`,
      coreThemes,
      themeNetwork,
      analyzedAt: new Date()
    };
  }

  /**
   * 构建主题关系网络
   * @param userId 用户ID
   * @param themes 核心主题列表
   * @param relations 认知关系列表
   * @returns 主题关系网络
   */
  async buildThemeNetwork(userId: string, themes: CoreTheme[], relations: DomainCognitiveRelation[]): Promise<ThemeRelation[]> {
    const themeRelations: ThemeRelation[] = [];
    
    // 统计主题之间的关系强度
    const themeRelationStrength = new Map<string, number>();
    
    // 遍历所有认知关系，检查是否连接了两个核心主题
    relations.forEach(relation => {
      const sourceTheme = themes.find(theme => theme.id === relation.sourceConceptId);
      const targetTheme = themes.find(theme => theme.id === relation.targetConceptId);
      
      if (sourceTheme && targetTheme) {
        const key = `${sourceTheme.id}-${targetTheme.id}`;
        const strength = themeRelationStrength.get(key) || 0;
        themeRelationStrength.set(key, strength + relation.confidenceScore);
      }
    });
    
    // 创建主题关系
    themeRelationStrength.forEach((strength, key) => {
      const [sourceThemeId, targetThemeId] = key.split('-');
      
      themeRelations.push({
        sourceThemeId,
        targetThemeId,
        relationType: 'RELATED',
        strength: Math.min(strength, 1.0)
      });
    });
    
    return themeRelations;
  }

  /**
   * 更新主题权重
   * @param userId 用户ID
   * @param themeId 主题ID
   * @param weight 新权重
   * @returns 更新后的主题
   */
  async updateThemeWeight(userId: string, themeId: string, weight: number): Promise<CoreTheme> {
    // 简化实现：返回更新后的主题（实际应从数据库获取并更新）
    return {
      id: themeId,
      name: 'Updated Theme',
      description: 'Updated theme description',
      relatedConcepts: [],
      weight: Math.min(Math.max(weight, 0), 1),
      confidence: 0.8
    };
  }
}

/**
 * 盲点检测服务实现类
 */
export class BlindspotDetectionServiceImpl implements BlindspotDetectionService {
  constructor(
    private cognitiveModelService: CognitiveModelService
  ) {}

  /**
   * 检测认知模型中的盲点
   * @param userId 用户ID
   * @param model 用户认知模型
   * @returns 盲点检测结果
   */
  async detectBlindspots(userId: string, model: UserCognitiveModel): Promise<BlindspotDetectionResult> {
    const blindspots: Blindspot[] = [];
    
    // 检测概念缺失
    if (model.concepts.length < 5) {
      blindspots.push(await this.detectConceptMissingBlindspot(model));
    }
    
    // 检测关系缺失
    if (model.relations.length < model.concepts.length) {
      blindspots.push(await this.detectRelationMissingBlindspot(model));
    }
    
    // 检测层次结构缺失
    if (!this.hasHierarchyStructure(model)) {
      blindspots.push(await this.detectHierarchyMissingBlindspot(model));
    }
    
    // 检测平衡缺失
    if (!this.isModelBalanced(model)) {
      blindspots.push(await this.detectBalanceMissingBlindspot(model));
    }
    
    // 检测深度缺失
    if (!this.hasAdequateDepth(model)) {
      blindspots.push(await this.detectDepthMissingBlindspot(model));
    }
    
    // 计算总置信度
    const totalConfidence = blindspots.length > 0 
      ? blindspots.reduce((sum, blindspot) => sum + blindspot.confidence, 0) / blindspots.length 
      : 1.0;
    
    return {
      id: `blindspot-detection-${uuidv4()}`,
      blindspots,
      detectedAt: new Date(),
      confidence: totalConfidence
    };
  }

  /**
   * 检测特定类型的盲点
   * @param userId 用户ID
   * @param model 用户认知模型
   * @param blindspotType 盲点类型
   * @returns 盲点检测结果
   */
  async detectSpecificBlindspot(userId: string, model: UserCognitiveModel, blindspotType: BlindspotType): Promise<BlindspotDetectionResult> {
    let blindspot: Blindspot | undefined;
    
    switch (blindspotType) {
      case BlindspotType.CONCEPT_MISSING:
        if (model.concepts.length < 5) {
          blindspot = await this.detectConceptMissingBlindspot(model);
        }
        break;
      case BlindspotType.RELATION_MISSING:
        if (model.relations.length < model.concepts.length) {
          blindspot = await this.detectRelationMissingBlindspot(model);
        }
        break;
      case BlindspotType.HIERARCHY_MISSING:
        if (!this.hasHierarchyStructure(model)) {
          blindspot = await this.detectHierarchyMissingBlindspot(model);
        }
        break;
      case BlindspotType.BALANCE_MISSING:
        if (!this.isModelBalanced(model)) {
          blindspot = await this.detectBalanceMissingBlindspot(model);
        }
        break;
      case BlindspotType.DEPTH_MISSING:
        if (!this.hasAdequateDepth(model)) {
          blindspot = await this.detectDepthMissingBlindspot(model);
        }
        break;
    }
    
    return {
      id: `blindspot-detection-${uuidv4()}`,
      blindspots: blindspot ? [blindspot] : [],
      detectedAt: new Date(),
      confidence: blindspot ? blindspot.confidence : 1.0
    };
  }

  /**
   * 评估盲点影响
   * @param userId 用户ID
   * @param blindspot 盲点
   * @returns 影响评估结果
   */
  async evaluateBlindspotImpact(userId: string, blindspot: Blindspot): Promise<{ impactScore: number; impactDescription: string }> {
    let impactScore = 0;
    let impactDescription = '';
    
    // 基于盲点类型和严重程度计算影响分数
    switch (blindspot.type) {
      case BlindspotType.CONCEPT_MISSING:
      case BlindspotType.RELATION_MISSING:
        impactScore = 0.7;
        impactDescription = '影响认知模型的完整性和连接性';
        break;
      case BlindspotType.HIERARCHY_MISSING:
        impactScore = 0.8;
        impactDescription = '影响认知模型的结构清晰度和逻辑关系';
        break;
      case BlindspotType.BALANCE_MISSING:
        impactScore = 0.6;
        impactDescription = '影响认知模型的平衡性和全面性';
        break;
      case BlindspotType.DEPTH_MISSING:
        impactScore = 0.5;
        impactDescription = '影响认知模型的深度和详细程度';
        break;
    }
    
    // 根据严重程度调整影响分数
    switch (blindspot.severity) {
      case SeverityLevel.HIGH:
        impactScore *= 1.2;
        break;
      case SeverityLevel.MEDIUM:
        impactScore *= 1.0;
        break;
      case SeverityLevel.LOW:
        impactScore *= 0.8;
        break;
    }
    
    // 根据影响范围调整影响分数
    switch (blindspot.impactScope) {
      case ImpactScope.CRITICAL:
        impactScore *= 1.3;
        break;
      case ImpactScope.GLOBAL:
        impactScore *= 1.1;
        break;
      case ImpactScope.LOCAL:
        impactScore *= 0.9;
        break;
    }
    
    // 确保分数在0-1之间
    impactScore = Math.min(Math.max(impactScore, 0), 1);
    
    return {
      impactScore,
      impactDescription
    };
  }

  // 辅助方法

  /**
   * 检测概念缺失盲点
   * @param model 用户认知模型
   * @returns 概念缺失盲点
   */
  private async detectConceptMissingBlindspot(model: UserCognitiveModel): Promise<Blindspot> {
    return {
      id: uuidv4(),
      type: BlindspotType.CONCEPT_MISSING,
      description: '认知模型概念数量较少，建议增加更多概念',
      relatedConcepts: [],
      impactScope: ImpactScope.GLOBAL,
      severity: model.concepts.length === 0 ? SeverityLevel.HIGH : SeverityLevel.MEDIUM,
      confidence: 0.9,
      suggestions: [
        '尝试添加与核心主题相关的新概念',
        '考虑从不同角度扩展现有概念',
        '通过思想片段记录添加更多相关概念'
      ]
    };
  }

  /**
   * 检测关系缺失盲点
   * @param model 用户认知模型
   * @returns 关系缺失盲点
   */
  private async detectRelationMissingBlindspot(model: UserCognitiveModel): Promise<Blindspot> {
    return {
      id: uuidv4(),
      type: BlindspotType.RELATION_MISSING,
      description: '认知模型关系数量较少，建议增加更多关系',
      relatedConcepts: [],
      impactScope: ImpactScope.GLOBAL,
      severity: SeverityLevel.MEDIUM,
      confidence: 0.85,
      suggestions: [
        '思考现有概念之间的潜在联系',
        '添加不同概念之间的关系',
        '强化核心概念之间的连接'
      ]
    };
  }

  /**
   * 检测层次结构缺失盲点
   * @param model 用户认知模型
   * @returns 层次结构缺失盲点
   */
  private async detectHierarchyMissingBlindspot(model: UserCognitiveModel): Promise<Blindspot> {
    return {
      id: uuidv4(),
      type: BlindspotType.HIERARCHY_MISSING,
      description: '认知模型缺乏清晰的层次结构，建议建立概念之间的层级关系',
      relatedConcepts: [],
      impactScope: ImpactScope.GLOBAL,
      severity: SeverityLevel.HIGH,
      confidence: 0.9,
      suggestions: [
        '识别核心概念作为父概念',
        '建立子概念与父概念之间的关系',
        '形成清晰的概念层级结构'
      ]
    };
  }

  /**
   * 检测平衡缺失盲点
   * @param model 用户认知模型
   * @returns 平衡缺失盲点
   */
  private async detectBalanceMissingBlindspot(model: UserCognitiveModel): Promise<Blindspot> {
    return {
      id: uuidv4(),
      type: BlindspotType.BALANCE_MISSING,
      description: '认知模型各部分发展不平衡，建议平衡各概念领域',
      relatedConcepts: [],
      impactScope: ImpactScope.GLOBAL,
      severity: SeverityLevel.MEDIUM,
      confidence: 0.8,
      suggestions: [
        '识别发展不足的概念领域',
        '增加对薄弱领域的关注',
        '平衡各概念之间的关系'
      ]
    };
  }

  /**
   * 检测深度缺失盲点
   * @param model 用户认知模型
   * @returns 深度缺失盲点
   */
  private async detectDepthMissingBlindspot(model: UserCognitiveModel): Promise<Blindspot> {
    return {
      id: uuidv4(),
      type: BlindspotType.DEPTH_MISSING,
      description: '认知模型缺乏足够的深度，建议深入探索核心概念',
      relatedConcepts: [],
      impactScope: ImpactScope.LOCAL,
      severity: SeverityLevel.LOW,
      confidence: 0.75,
      suggestions: [
        '深入探索核心概念的细节',
        '添加更具体的子概念',
        '丰富概念的属性和特征'
      ]
    };
  }

  /**
   * 检查模型是否有层次结构
   * @param model 用户认知模型
   * @returns 是否有层次结构
   */
  private hasHierarchyStructure(model: UserCognitiveModel): boolean {
    // 简化实现：检查是否存在父-子关系
    return model.relations.some(relation => relation.relationType === 'PARENT_CHILD');
  }

  /**
   * 检查模型是否平衡
   * @param model 用户认知模型
   * @returns 是否平衡
   */
  private isModelBalanced(model: UserCognitiveModel): boolean {
    // 简化实现：检查概念数量和关系数量的比例
    if (model.concepts.length === 0) return true;
    const relationToConceptRatio = model.relations.length / model.concepts.length;
    return relationToConceptRatio >= 0.8 && relationToConceptRatio <= 2.0;
  }

  /**
   * 检查模型是否有足够的深度
   * @param model 用户认知模型
   * @returns 是否有足够的深度
   */
  private hasAdequateDepth(model: UserCognitiveModel): boolean {
    // 简化实现：检查是否有足够的层级关系
    if (model.concepts.length < 3) return true;
    
    // 计算平均每个概念的关系数量
    const avgRelationsPerConcept = model.relations.length / model.concepts.length;
    return avgRelationsPerConcept >= 1.5;
  }
}

/**
 * 差距识别服务实现类
 */
export class GapIdentificationServiceImpl implements GapIdentificationService {
  constructor(
    private cognitiveModelService: CognitiveModelService
  ) {}

  /**
   * 识别认知模型中的差距
   * @param userId 用户ID
   * @param model 用户认知模型
   * @returns 差距识别结果
   */
  async identifyGaps(userId: string, model: UserCognitiveModel): Promise<GapIdentificationResult> {
    const gaps: Gap[] = [];
    
    // 识别知识差距
    if (model.concepts.length < 5) {
      gaps.push(await this.identifyKnowledgeGap(model));
    }
    
    // 识别理解差距
    if (model.relations.length < model.concepts.length) {
      gaps.push(await this.identifyUnderstandingGap(model));
    }
    
    // 识别应用差距
    if (!this.hasApplicationRelations(model)) {
      gaps.push(await this.identifyApplicationGap(model));
    }
    
    // 识别关联差距
    if (!this.hasDiverseRelations(model)) {
      gaps.push(await this.identifyConnectionGap(model));
    }
    
    // 识别视角差距
    if (!this.hasDiverseConcepts(model)) {
      gaps.push(await this.identifyPerspectiveGap(model));
    }
    
    // 计算总置信度
    const totalConfidence = gaps.length > 0 
      ? gaps.reduce((sum, gap) => sum + gap.confidence, 0) / gaps.length 
      : 1.0;
    
    return {
      id: `gap-identification-${uuidv4()}`,
      gaps,
      identifiedAt: new Date(),
      confidence: totalConfidence
    };
  }

  /**
   * 比较两个认知模型之间的差距
   * @param userId 用户ID
   * @param sourceModel 源认知模型
   * @param targetModel 目标认知模型
   * @returns 差距识别结果
   */
  async compareModelGaps(userId: string, sourceModel: UserCognitiveModel, targetModel: UserCognitiveModel): Promise<GapIdentificationResult> {
    const gaps: Gap[] = [];
    
    // 识别概念数量差距
    if (sourceModel.concepts.length < targetModel.concepts.length) {
      gaps.push({
        id: uuidv4(),
        type: GapType.KNOWLEDGE_GAP,
        description: `源模型比目标模型少${targetModel.concepts.length - sourceModel.concepts.length}个概念`,
        source: `源模型：${sourceModel.concepts.length}个概念`,
        target: `目标模型：${targetModel.concepts.length}个概念`,
        magnitude: (targetModel.concepts.length - sourceModel.concepts.length) / targetModel.concepts.length,
        impactScope: ImpactScope.GLOBAL,
        severity: SeverityLevel.MEDIUM,
        confidence: 0.95,
        suggestions: [
          '添加缺失的核心概念',
          '考虑从目标模型中迁移相关概念',
          '分析目标模型的概念结构'
        ]
      });
    }
    
    // 识别关系数量差距
    if (sourceModel.relations.length < targetModel.relations.length) {
      gaps.push({
        id: uuidv4(),
        type: GapType.CONNECTION_GAP,
        description: `源模型比目标模型少${targetModel.relations.length - sourceModel.relations.length}个关系`,
        source: `源模型：${sourceModel.relations.length}个关系`,
        target: `目标模型：${targetModel.relations.length}个关系`,
        magnitude: (targetModel.relations.length - sourceModel.relations.length) / targetModel.relations.length,
        impactScope: ImpactScope.GLOBAL,
        severity: SeverityLevel.MEDIUM,
        confidence: 0.9,
        suggestions: [
          '添加缺失的关键关系',
          '分析目标模型的关系网络',
          '加强概念之间的连接'
        ]
      });
    }
    
    // 计算总置信度
    const totalConfidence = gaps.length > 0 
      ? gaps.reduce((sum, gap) => sum + gap.confidence, 0) / gaps.length 
      : 1.0;
    
    return {
      id: `gap-identification-${uuidv4()}`,
      gaps,
      identifiedAt: new Date(),
      confidence: totalConfidence
    };
  }

  /**
   * 评估差距大小
   * @param userId 用户ID
   * @param gap 认知差距
   * @returns 差距评估结果
   */
  async evaluateGapMagnitude(userId: string, gap: Gap): Promise<{ magnitudeScore: number; magnitudeDescription: string }> {
    let magnitudeScore = gap.magnitude;
    let magnitudeDescription = '';
    
    // 根据差距类型调整分数
    switch (gap.type) {
      case GapType.KNOWLEDGE_GAP:
        magnitudeDescription = '知识差距';
        magnitudeScore *= 1.2;
        break;
      case GapType.UNDERSTANDING_GAP:
        magnitudeDescription = '理解差距';
        magnitudeScore *= 1.1;
        break;
      case GapType.APPLICATION_GAP:
        magnitudeDescription = '应用差距';
        magnitudeScore *= 1.0;
        break;
      case GapType.CONNECTION_GAP:
        magnitudeDescription = '关联差距';
        magnitudeScore *= 0.9;
        break;
      case GapType.PERSPECTIVE_GAP:
        magnitudeDescription = '视角差距';
        magnitudeScore *= 0.8;
        break;
    }
    
    // 根据严重程度调整分数
    switch (gap.severity) {
      case SeverityLevel.HIGH:
        magnitudeScore *= 1.3;
        break;
      case SeverityLevel.MEDIUM:
        magnitudeScore *= 1.1;
        break;
      case SeverityLevel.LOW:
        magnitudeScore *= 0.9;
        break;
    }
    
    // 确保分数在0-1之间
    magnitudeScore = Math.min(Math.max(magnitudeScore, 0), 1);
    
    return {
      magnitudeScore,
      magnitudeDescription
    };
  }

  // 辅助方法

  /**
   * 识别知识差距
   * @param model 用户认知模型
   * @returns 知识差距
   */
  private async identifyKnowledgeGap(model: UserCognitiveModel): Promise<Gap> {
    return {
      id: uuidv4(),
      type: GapType.KNOWLEDGE_GAP,
      description: '认知模型概念数量不足，存在知识差距',
      source: `当前概念数量：${model.concepts.length}`,
      target: '建议概念数量：至少5个',
      magnitude: model.concepts.length > 0 ? (5 - model.concepts.length) / 5 : 1.0,
      impactScope: ImpactScope.GLOBAL,
      severity: model.concepts.length === 0 ? SeverityLevel.HIGH : SeverityLevel.MEDIUM,
      confidence: 0.95,
      suggestions: [
        '添加与核心主题相关的新概念',
        '从不同角度扩展现有概念',
        '通过研究和学习补充相关知识'
      ]
    };
  }

  /**
   * 识别理解差距
   * @param model 用户认知模型
   * @returns 理解差距
   */
  private async identifyUnderstandingGap(model: UserCognitiveModel): Promise<Gap> {
    return {
      id: uuidv4(),
      type: GapType.UNDERSTANDING_GAP,
      description: '认知模型关系数量不足，存在理解差距',
      source: `当前关系数量：${model.relations.length}`,
      target: `建议关系数量：至少${model.concepts.length}个`,
      magnitude: model.concepts.length > 0 ? (model.concepts.length - model.relations.length) / model.concepts.length : 0,
      impactScope: ImpactScope.GLOBAL,
      severity: SeverityLevel.MEDIUM,
      confidence: 0.9,
      suggestions: [
        '思考概念之间的逻辑关系',
        '建立概念之间的联系',
        '通过思维导图可视化概念关系'
      ]
    };
  }

  /**
   * 识别应用差距
   * @param model 用户认知模型
   * @returns 应用差距
   */
  private async identifyApplicationGap(model: UserCognitiveModel): Promise<Gap> {
    return {
      id: uuidv4(),
      type: GapType.APPLICATION_GAP,
      description: '认知模型缺乏应用相关的关系，存在应用差距',
      source: '当前应用关系：0',
      target: '建议：添加应用相关关系',
      magnitude: 0.7,
      impactScope: ImpactScope.LOCAL,
      severity: SeverityLevel.MEDIUM,
      confidence: 0.85,
      suggestions: [
        '添加概念的应用场景关系',
        '思考概念在实际中的应用方式',
        '记录概念的实际应用案例'
      ]
    };
  }

  /**
   * 识别关联差距
   * @param model 用户认知模型
   * @returns 关联差距
   */
  private async identifyConnectionGap(model: UserCognitiveModel): Promise<Gap> {
    return {
      id: uuidv4(),
      type: GapType.CONNECTION_GAP,
      description: '认知模型关系类型单一，存在关联差距',
      source: '当前关系类型：有限',
      target: '建议：添加多样化的关系类型',
      magnitude: 0.6,
      impactScope: ImpactScope.LOCAL,
      severity: SeverityLevel.LOW,
      confidence: 0.8,
      suggestions: [
        '添加不同类型的关系（因果、相似、对比等）',
        '建立跨领域的概念联系',
        '探索概念之间的间接关系'
      ]
    };
  }

  /**
   * 识别视角差距
   * @param model 用户认知模型
   * @returns 视角差距
   */
  private async identifyPerspectiveGap(model: UserCognitiveModel): Promise<Gap> {
    return {
      id: uuidv4(),
      type: GapType.PERSPECTIVE_GAP,
      description: '认知模型概念视角单一，存在视角差距',
      source: '当前视角：有限',
      target: '建议：添加多样化的视角',
      magnitude: 0.5,
      impactScope: ImpactScope.LOCAL,
      severity: SeverityLevel.LOW,
      confidence: 0.75,
      suggestions: [
        '从不同角度审视现有概念',
        '添加对立或互补的概念',
        '考虑不同人群的视角'
      ]
    };
  }

  /**
   * 检查模型是否有应用相关关系
   * @param model 用户认知模型
   * @returns 是否有应用相关关系
   */
  private hasApplicationRelations(model: UserCognitiveModel): boolean {
    // 简化实现：检查是否存在应用相关的关系类型
    return model.relations.some(relation => 
      relation.relationType === 'APPLICATION' || relation.relationType === 'USE_CASE'
    );
  }

  /**
   * 检查模型是否有关系类型
   * @param model 用户认知模型
   * @returns 是否有关系类型
   */
  private hasDiverseRelations(model: UserCognitiveModel): boolean {
    // 简化实现：检查是否有多种关系类型
    const relationTypes = new Set(model.relations.map(relation => relation.relationType));
    return relationTypes.size >= 2;
  }

  /**
   * 检查模型是否有多样化的概念
   * @param model 用户认知模型
   * @returns 是否有多样化的概念
   */
  private hasDiverseConcepts(model: UserCognitiveModel): boolean {
    // 简化实现：检查概念数量和置信度分布
    if (model.concepts.length < 3) return false;
    
    // 检查置信度分布是否多样化
    const confidenceValues = model.concepts.map(concept => concept.confidenceScore);
    const minConfidence = Math.min(...confidenceValues);
    const maxConfidence = Math.max(...confidenceValues);
    
    return maxConfidence - minConfidence >= 0.3;
  }
}

/**
 * 反馈格式化服务实现类
 */
export class FeedbackFormattingServiceImpl implements FeedbackFormattingService {
  constructor() {}

  /**
   * 格式化认知反馈
   * @param userId 用户ID
   * @param rawFeedback 原始反馈内容
   * @returns 格式化后的反馈
   */
  async formatFeedback(userId: string, rawFeedback: any): Promise<FeedbackFormattingResult> {
    // 提取原始反馈内容
    const insights = rawFeedback.insights || [];
    const themeAnalysis = rawFeedback.themeAnalysis || null;
    const blindspotDetection = rawFeedback.blindspotDetection || null;
    const gapIdentification = rawFeedback.gapIdentification || null;
    
    // 生成行动项
    const actionItems = this.generateActionItems(blindspotDetection?.blindspots || [], gapIdentification?.gaps || []);
    
    // 确定反馈类型和优先级
    const feedbackType = this.determineFeedbackType(blindspotDetection?.blindspots || [], gapIdentification?.gaps || []);
    const priority = this.determinePriority(blindspotDetection?.blindspots || [], gapIdentification?.gaps || []);
    
    // 生成反馈摘要
    const summary = this.generateFeedbackSummary(insights, themeAnalysis, blindspotDetection, gapIdentification);
    
    // 创建格式化后的反馈
    const formattedFeedback: FormattedFeedback = {
      title: `认知反馈报告 - ${new Date().toISOString().split('T')[0]}`,
      summary,
      insights,
      themeAnalysis: themeAnalysis || {
        id: uuidv4(),
        coreThemes: [],
        themeNetwork: [],
        analyzedAt: new Date()
      },
      blindspotDetection: blindspotDetection || {
        id: uuidv4(),
        blindspots: [],
        detectedAt: new Date(),
        confidence: 1.0
      },
      gapIdentification: gapIdentification || {
        id: uuidv4(),
        gaps: [],
        identifiedAt: new Date(),
        confidence: 1.0
      },
      actionItems,
      feedbackType,
      priority,
      recommendedChannels: ['应用内通知', '邮件', 'PDF报告']
    };
    
    return {
      id: `feedback-formatting-${uuidv4()}`,
      rawFeedback,
      formattedFeedback,
      formattedAt: new Date()
    };
  }

  /**
   * 生成反馈报告
   * @param userId 用户ID
   * @param formattedFeedback 格式化后的反馈
   * @returns 反馈报告
   */
  async generateFeedbackReport(userId: string, formattedFeedback: FormattedFeedback): Promise<any> {
    // 简化实现：生成JSON格式的报告
    return {
      id: `feedback-report-${uuidv4()}`,
      userId,
      generatedAt: new Date(),
      content: formattedFeedback,
      format: 'json',
      version: '1.0.0'
    };
  }

  /**
   * 导出反馈为指定格式
   * @param userId 用户ID
   * @param formattedFeedback 格式化后的反馈
   * @param format 导出格式
   * @returns 导出内容
   */
  async exportFeedback(userId: string, formattedFeedback: FormattedFeedback, format: string): Promise<any> {
    // 简化实现：根据格式返回不同的导出内容
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(formattedFeedback, null, 2);
      case 'text':
        return this.generateTextReport(formattedFeedback);
      case 'pdf':
        return this.generatePdfReport(formattedFeedback);
      default:
        return JSON.stringify(formattedFeedback, null, 2);
    }
  }

  // 辅助方法

  /**
   * 生成行动项
   * @param blindspots 盲点列表
   * @param gaps 差距列表
   * @returns 行动项列表
   */
  private generateActionItems(blindspots: Blindspot[], gaps: Gap[]): ActionItem[] {
    const actionItems: ActionItem[] = [];
    
    // 从盲点生成行动项
    blindspots.forEach(blindspot => {
      blindspot.suggestions.forEach((suggestion, index) => {
        actionItems.push({
          id: `action-item-${uuidv4()}`,
          description: suggestion,
          type: this.mapBlindspotTypeToActionItemType(blindspot.type),
          priority: this.mapSeverityToPriority(blindspot.severity),
          suggestedTimeframe: '1-2周',
          expectedOutcome: `解决${blindspot.description}问题`,
          relatedResources: []
        });
      });
    });
    
    // 从差距生成行动项
    gaps.forEach(gap => {
      gap.suggestions.forEach((suggestion, index) => {
        actionItems.push({
          id: `action-item-${uuidv4()}`,
          description: suggestion,
          type: this.mapGapTypeToActionItemType(gap.type),
          priority: this.mapSeverityToPriority(gap.severity),
          suggestedTimeframe: '2-4周',
          expectedOutcome: `缩小${gap.description}差距`,
          relatedResources: []
        });
      });
    });
    
    // 按优先级排序
    return actionItems.sort((a, b) => {
      const priorityOrder = { [PriorityLevel.URGENT]: 0, [PriorityLevel.HIGH]: 1, [PriorityLevel.MEDIUM]: 2, [PriorityLevel.LOW]: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * 确定反馈类型
   * @param blindspots 盲点列表
   * @param gaps 差距列表
   * @returns 反馈类型
   */
  private determineFeedbackType(blindspots: Blindspot[], gaps: Gap[]): FeedbackType {
    // 检查是否有高严重程度的盲点或差距
    const hasHighSeverity = blindspots.some(b => b.severity === SeverityLevel.HIGH) || 
                           gaps.some(g => g.severity === SeverityLevel.HIGH);
    
    if (hasHighSeverity) {
      return FeedbackType.WARNING;
    }
    
    // 检查是否有中等严重程度的盲点或差距
    const hasMediumSeverity = blindspots.some(b => b.severity === SeverityLevel.MEDIUM) || 
                             gaps.some(g => g.severity === SeverityLevel.MEDIUM);
    
    if (hasMediumSeverity) {
      return FeedbackType.SUGGESTION;
    }
    
    // 其他情况
    return FeedbackType.INSIGHT;
  }

  /**
   * 确定反馈优先级
   * @param blindspots 盲点列表
   * @param gaps 差距列表
   * @returns 优先级
   */
  private determinePriority(blindspots: Blindspot[], gaps: Gap[]): PriorityLevel {
    // 检查是否有高严重程度的盲点或差距
    const hasHighSeverity = blindspots.some(b => b.severity === SeverityLevel.HIGH) || 
                           gaps.some(g => g.severity === SeverityLevel.HIGH);
    
    if (hasHighSeverity) {
      return PriorityLevel.HIGH;
    }
    
    // 检查是否有中等严重程度的盲点或差距
    const hasMediumSeverity = blindspots.some(b => b.severity === SeverityLevel.MEDIUM) || 
                             gaps.some(g => g.severity === SeverityLevel.MEDIUM);
    
    if (hasMediumSeverity) {
      return PriorityLevel.MEDIUM;
    }
    
    // 其他情况
    return PriorityLevel.LOW;
  }

  /**
   * 生成反馈摘要
   * @param insights 洞察列表
   * @param themeAnalysis 主题分析
   * @param blindspotDetection 盲点检测
   * @param gapIdentification 差距识别
   * @returns 反馈摘要
   */
  private generateFeedbackSummary(insights: CognitiveInsight[], themeAnalysis: any, blindspotDetection: any, gapIdentification: any): string {
    let summary = '';
    
    // 添加洞察摘要
    if (insights.length > 0) {
      summary += `本次分析生成了${insights.length}个认知洞察。`;
    }
    
    // 添加主题分析摘要
    if (themeAnalysis && themeAnalysis.coreThemes && themeAnalysis.coreThemes.length > 0) {
      summary += ` 识别出${themeAnalysis.coreThemes.length}个核心主题，`;
    }
    
    // 添加盲点检测摘要
    if (blindspotDetection && blindspotDetection.blindspots && blindspotDetection.blindspots.length > 0) {
      summary += ` 发现${blindspotDetection.blindspots.length}个认知盲点，`;
    }
    
    // 添加差距识别摘要
    if (gapIdentification && gapIdentification.gaps && gapIdentification.gaps.length > 0) {
      summary += ` 识别出${gapIdentification.gaps.length}个认知差距。`;
    }
    
    // 如果没有内容，添加默认摘要
    if (summary === '') {
      summary = '您的认知模型整体健康，未发现明显的盲点或差距。';
    }
    
    return summary;
  }

  /**
   * 生成文本报告
   * @param formattedFeedback 格式化后的反馈
   * @returns 文本报告
   */
  private generateTextReport(formattedFeedback: FormattedFeedback): string {
    let report = `# 认知反馈报告\n\n`;
    report += `## 报告信息\n`;
    report += `标题：${formattedFeedback.title}\n`;
    report += `类型：${formattedFeedback.feedbackType}\n`;
    report += `优先级：${formattedFeedback.priority}\n\n`;
    
    report += `## 摘要\n`;
    report += `${formattedFeedback.summary}\n\n`;
    
    // 添加核心洞察
    if (formattedFeedback.insights.length > 0) {
      report += `## 核心洞察\n`;
      formattedFeedback.insights.forEach((insight, index) => {
        report += `${index + 1}. ${insight.title}\n`;
        report += `   ${insight.description}\n\n`;
      });
    }
    
    // 添加行动项
    if (formattedFeedback.actionItems.length > 0) {
      report += `## 建议行动项\n`;
      formattedFeedback.actionItems.forEach((actionItem, index) => {
        report += `${index + 1}. [${actionItem.priority}] ${actionItem.description}\n`;
        report += `   类型：${actionItem.type}\n`;
        report += `   建议执行时间：${actionItem.suggestedTimeframe}\n`;
        report += `   预期效果：${actionItem.expectedOutcome}\n\n`;
      });
    }
    
    return report;
  }

  /**
   * 生成PDF报告
   * @param formattedFeedback 格式化后的反馈
   * @returns PDF报告（简化实现）
   */
  private generatePdfReport(formattedFeedback: FormattedFeedback): any {
    // 简化实现：返回PDF报告的基本信息
    return {
      type: 'pdf',
      content: formattedFeedback,
      metadata: {
        title: formattedFeedback.title,
        author: 'AI认知辅助系统',
        created: new Date()
      }
    };
  }

  /**
   * 将盲点类型映射到行动项类型
   * @param blindspotType 盲点类型
   * @returns 行动项类型
   */
  private mapBlindspotTypeToActionItemType(blindspotType: BlindspotType): ActionItemType {
    switch (blindspotType) {
      case BlindspotType.CONCEPT_MISSING:
      case BlindspotType.RELATION_MISSING:
        return ActionItemType.LEARN;
      case BlindspotType.HIERARCHY_MISSING:
        return ActionItemType.REFLECT;
      case BlindspotType.BALANCE_MISSING:
        return ActionItemType.CONNECT;
      case BlindspotType.DEPTH_MISSING:
        return ActionItemType.EXPLORE;
      default:
        return ActionItemType.LEARN;
    }
  }

  /**
   * 将差距类型映射到行动项类型
   * @param gapType 差距类型
   * @returns 行动项类型
   */
  private mapGapTypeToActionItemType(gapType: GapType): ActionItemType {
    switch (gapType) {
      case GapType.KNOWLEDGE_GAP:
        return ActionItemType.LEARN;
      case GapType.UNDERSTANDING_GAP:
        return ActionItemType.REFLECT;
      case GapType.APPLICATION_GAP:
        return ActionItemType.APPLY;
      case GapType.CONNECTION_GAP:
        return ActionItemType.CONNECT;
      case GapType.PERSPECTIVE_GAP:
        return ActionItemType.EXPLORE;
      default:
        return ActionItemType.LEARN;
    }
  }

  /**
   * 将严重程度映射到优先级
   * @param severity 严重程度
   * @returns 优先级
   */
  private mapSeverityToPriority(severity: SeverityLevel): PriorityLevel {
    switch (severity) {
      case SeverityLevel.HIGH:
        return PriorityLevel.HIGH;
      case SeverityLevel.MEDIUM:
        return PriorityLevel.MEDIUM;
      case SeverityLevel.LOW:
        return PriorityLevel.LOW;
      default:
        return PriorityLevel.MEDIUM;
    }
  }
}

/**
 * 认知反馈生成服务实现类
 */
export class CognitiveFeedbackServiceImpl implements CognitiveFeedbackService {
  constructor(
    public insightGenerationService: InsightGenerationService,
    public themeAnalysisService: ThemeAnalysisService,
    public blindspotDetectionService: BlindspotDetectionService,
    public gapIdentificationService: GapIdentificationService,
    public feedbackFormattingService: FeedbackFormattingService
  ) {}

  /**
   * 生成完整认知反馈
   * @param userId 用户ID
   * @param model 用户认知模型
   * @returns 完整的认知反馈
   */
  async generateCompleteFeedback(userId: string, model: UserCognitiveModel): Promise<FeedbackFormattingResult> {
    // 1. 生成认知洞察
    const insightResult = await this.insightGenerationService.generateInsights(userId, model);
    
    // 2. 分析核心主题
    const themeResult = await this.themeAnalysisService.analyzeCoreThemes(userId, model);
    
    // 3. 检测认知盲点
    const blindspotResult = await this.blindspotDetectionService.detectBlindspots(userId, model);
    
    // 4. 识别认知差距
    const gapResult = await this.gapIdentificationService.identifyGaps(userId, model);
    
    // 5. 格式化反馈
    const rawFeedback = {
      insights: insightResult.insights,
      themeAnalysis: themeResult,
      blindspotDetection: blindspotResult,
      gapIdentification: gapResult
    };
    
    return await this.feedbackFormattingService.formatFeedback(userId, rawFeedback);
  }
}
