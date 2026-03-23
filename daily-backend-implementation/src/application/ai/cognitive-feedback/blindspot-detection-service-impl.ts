/**
 * 盲点检测服务实现
 * 用于检测认知模型中的盲点
 */
import { BlindspotDetectionService } from './blindspot-detection-service';
import { Blindspot, BlindspotDetectionResult, BlindspotDetectionOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { CognitiveModelRepository } from '../../repositories/cognitive-model.repository';
import { v4 as uuidv4 } from 'uuid';

/**
 * 盲点检测服务实现类
 */
export class BlindspotDetectionServiceImpl implements BlindspotDetectionService {
  constructor(
    private readonly cognitiveModelRepository: CognitiveModelRepository
  ) {}

  /**
   * 检测认知模型中的盲点
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param options 检测选项
   * @returns 盲点检测结果
   */
  async detectBlindspots(
    userId: string,
    modelId: string,
    options?: BlindspotDetectionOptions
  ): Promise<BlindspotDetectionResult> {
    // 获取认知模型
    const model = await this.cognitiveModelRepository.getById(userId, modelId);
    if (!model) {
      throw new Error(`Cognitive model not found: ${modelId}`);
    }

    // 获取模型中的概念和关系
    const concepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
    const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);

    // 检测不同类型的盲点
    const blindspots: Blindspot[] = [];

    // 检测概念连接盲点
    const conceptConnectionBlindspots = this.detectConceptConnectionBlindspots(concepts, relations);
    blindspots.push(...conceptConnectionBlindspots);

    // 检测主题覆盖盲点
    const themeCoverageBlindspots = this.detectThemeCoverageBlindspots(concepts, relations);
    blindspots.push(...themeCoverageBlindspots);

    // 检测层次结构盲点
    const hierarchyBlindspots = this.detectHierarchyBlindspots(concepts, relations);
    blindspots.push(...hierarchyBlindspots);

    // 应用过滤选项
    const filteredBlindspots = this.filterBlindspots(blindspots, options);

    // 计算盲点分布
    const blindspotDistribution = this.calculateBlindspotDistribution(filteredBlindspots);

    // 生成检测结果
    const result: BlindspotDetectionResult = {
      id: uuidv4(),
      blindspots: filteredBlindspots,
      blindspotDistribution,
      summary: this.generateDetectionSummary(filteredBlindspots, blindspotDistribution),
      recommendations: this.generateRecommendations(filteredBlindspots),
      createdAt: new Date()
    };

    return result;
  }

  /**
   * 从主题中检测盲点
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param themeIds 主题ID列表
   * @param options 检测选项
   * @returns 盲点检测结果
   */
  async detectBlindspotsFromThemes(
    userId: string,
    modelId: string,
    themeIds: string[],
    options?: BlindspotDetectionOptions
  ): Promise<BlindspotDetectionResult> {
    // 获取认知模型
    const model = await this.cognitiveModelRepository.getById(userId, modelId);
    if (!model) {
      throw new Error(`Cognitive model not found: ${modelId}`);
    }

    // 获取模型中的概念和关系
    const concepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
    const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);

    // 这里简化实现，实际应该根据主题ID过滤相关概念
    const blindspots: Blindspot[] = [];

    // 检测主题覆盖盲点
    const themeCoverageBlindspots = this.detectThemeCoverageBlindspots(concepts, relations);
    blindspots.push(...themeCoverageBlindspots);

    // 应用过滤选项
    const filteredBlindspots = this.filterBlindspots(blindspots, options);

    // 计算盲点分布
    const blindspotDistribution = this.calculateBlindspotDistribution(filteredBlindspots);

    // 生成检测结果
    const result: BlindspotDetectionResult = {
      id: uuidv4(),
      blindspots: filteredBlindspots,
      blindspotDistribution,
      summary: this.generateDetectionSummary(filteredBlindspots, blindspotDistribution),
      recommendations: this.generateRecommendations(filteredBlindspots),
      createdAt: new Date()
    };

    return result;
  }

  /**
   * 从概念中检测盲点
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param conceptIds 概念ID列表
   * @param options 检测选项
   * @returns 盲点检测结果
   */
  async detectBlindspotsFromConcepts(
    userId: string,
    modelId: string,
    conceptIds: string[],
    options?: BlindspotDetectionOptions
  ): Promise<BlindspotDetectionResult> {
    // 获取认知模型
    const model = await this.cognitiveModelRepository.getById(userId, modelId);
    if (!model) {
      throw new Error(`Cognitive model not found: ${modelId}`);
    }

    // 获取指定概念
    const concepts = await Promise.all(
      conceptIds.map(conceptId => 
        this.cognitiveModelRepository.getConceptById(userId, modelId, conceptId)
      )
    );

    // 过滤掉不存在的概念
    const validConcepts = concepts.filter(concept => concept !== null) as any[];

    // 获取模型中的关系
    const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);

    // 检测概念连接盲点
    const blindspots = this.detectConceptConnectionBlindspots(validConcepts, relations);

    // 应用过滤选项
    const filteredBlindspots = this.filterBlindspots(blindspots, options);

    // 计算盲点分布
    const blindspotDistribution = this.calculateBlindspotDistribution(filteredBlindspots);

    // 生成检测结果
    const result: BlindspotDetectionResult = {
      id: uuidv4(),
      blindspots: filteredBlindspots,
      blindspotDistribution,
      summary: this.generateDetectionSummary(filteredBlindspots, blindspotDistribution),
      recommendations: this.generateRecommendations(filteredBlindspots),
      createdAt: new Date()
    };

    return result;
  }

  /**
   * 检测特定类型的盲点
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param blindspotTypes 盲点类型列表
   * @param options 检测选项
   * @returns 盲点检测结果
   */
  async detectBlindspotsByType(
    userId: string,
    modelId: string,
    blindspotTypes: string[],
    options?: BlindspotDetectionOptions
  ): Promise<BlindspotDetectionResult> {
    // 获取认知模型
    const model = await this.cognitiveModelRepository.getById(userId, modelId);
    if (!model) {
      throw new Error(`Cognitive model not found: ${modelId}`);
    }

    // 获取模型中的概念和关系
    const concepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
    const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);

    // 检测不同类型的盲点
    const blindspots: Blindspot[] = [];

    // 根据类型检测盲点
    if (blindspotTypes.includes('CONCEPT_CONNECTION')) {
      const conceptConnectionBlindspots = this.detectConceptConnectionBlindspots(concepts, relations);
      blindspots.push(...conceptConnectionBlindspots);
    }

    if (blindspotTypes.includes('THEME_COVERAGE')) {
      const themeCoverageBlindspots = this.detectThemeCoverageBlindspots(concepts, relations);
      blindspots.push(...themeCoverageBlindspots);
    }

    if (blindspotTypes.includes('HIERARCHY')) {
      const hierarchyBlindspots = this.detectHierarchyBlindspots(concepts, relations);
      blindspots.push(...hierarchyBlindspots);
    }

    // 应用过滤选项
    const filteredBlindspots = this.filterBlindspots(blindspots, options);

    // 计算盲点分布
    const blindspotDistribution = this.calculateBlindspotDistribution(filteredBlindspots);

    // 生成检测结果
    const result: BlindspotDetectionResult = {
      id: uuidv4(),
      blindspots: filteredBlindspots,
      blindspotDistribution,
      summary: this.generateDetectionSummary(filteredBlindspots, blindspotDistribution),
      recommendations: this.generateRecommendations(filteredBlindspots),
      createdAt: new Date()
    };

    return result;
  }

  /**
   * 分析盲点的影响
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param blindspotId 盲点ID
   * @returns 盲点影响分析
   */
  async analyzeBlindspotImpact(
    userId: string,
    modelId: string,
    blindspotId: string
  ): Promise<{ impact: number; potentialRisks: string[]; }> {
    // 这里简化实现，实际应该根据盲点ID获取盲点并分析其影响
    return {
      impact: 7.5, // 影响程度（0-10）
      potentialRisks: [
        '可能导致对相关概念的理解不完整',
        '可能影响决策质量',
        '可能导致认知模型的不一致性'
      ]
    };
  }

  /**
   * 检测概念连接盲点
   * @param concepts 概念列表
   * @param relations 关系列表
   * @returns 概念连接盲点列表
   */
  private detectConceptConnectionBlindspots(concepts: any[], relations: any[]): Blindspot[] {
    const blindspots: Blindspot[] = [];

    // 计算每个概念的连接数量
    const conceptConnectionCounts = new Map<string, number>();
    concepts.forEach(concept => {
      conceptConnectionCounts.set(concept.id, 0);
    });

    // 统计每个概念的连接数量
    relations.forEach(relation => {
      const sourceCount = conceptConnectionCounts.get(relation.sourceConceptId) || 0;
      conceptConnectionCounts.set(relation.sourceConceptId, sourceCount + 1);

      const targetCount = conceptConnectionCounts.get(relation.targetConceptId) || 0;
      conceptConnectionCounts.set(relation.targetConceptId, targetCount + 1);
    });

    // 检测连接数量较少的概念（潜在盲点）
    conceptConnectionCounts.forEach((count, conceptId) => {
      if (count < 2) { // 连接数量少于2个的概念可能是盲点
        const concept = concepts.find(c => c.id === conceptId);
        if (concept) {
          blindspots.push({
            id: uuidv4(),
            description: `概念 "${concept.name}" 连接数量较少，可能存在理解盲点`,
            type: 'CONCEPT_CONNECTION',
            impact: 5.0,
            relatedThemes: [], // 这里简化实现，实际应该关联相关主题
            potentialRisks: [
              '可能导致对该概念的理解不完整',
              '可能影响与其他概念的关联理解'
            ]
          });
        }
      }
    });

    return blindspots;
  }

  /**
   * 检测主题覆盖盲点
   * @param concepts 概念列表
   * @param relations 关系列表
   * @returns 主题覆盖盲点列表
   */
  private detectThemeCoverageBlindspots(concepts: any[], relations: any[]): Blindspot[] {
    const blindspots: Blindspot[] = [];

    // 简化实现，实际应该基于主题分析结果检测
    blindspots.push({
      id: uuidv4(),
      description: '检测到主题覆盖不完整，可能存在认知盲点',
      type: 'THEME_COVERAGE',
      impact: 6.0,
      relatedThemes: [],
      potentialRisks: [
        '可能遗漏重要主题',
        '可能导致认知模型的片面性'
      ]
    });

    return blindspots;
  }

  /**
   * 检测层次结构盲点
   * @param concepts 概念列表
   * @param relations 关系列表
   * @returns 层次结构盲点列表
   */
  private detectHierarchyBlindspots(concepts: any[], relations: any[]): Blindspot[] {
    const blindspots: Blindspot[] = [];

    // 简化实现，实际应该检测层次结构中的缺口
    blindspots.push({
      id: uuidv4(),
      description: '检测到层次结构不完整，可能存在认知盲点',
      type: 'HIERARCHY',
      impact: 5.5,
      relatedThemes: [],
      potentialRisks: [
        '可能导致概念间的层次关系不清晰',
        '可能影响对概念重要性的判断'
      ]
    });

    return blindspots;
  }

  /**
   * 过滤盲点
   * @param blindspots 盲点列表
   * @param options 过滤选项
   * @returns 过滤后的盲点列表
   */
  private filterBlindspots(blindspots: Blindspot[], options?: BlindspotDetectionOptions): Blindspot[] {
    let filtered = [...blindspots];

    // 按影响程度过滤
    if (options?.impactThreshold !== undefined) {
      filtered = filtered.filter(blindspot => blindspot.impact >= options.impactThreshold!);
    }

    // 按类型过滤
    if (options?.blindspotTypes && options.blindspotTypes.length > 0) {
      filtered = filtered.filter(blindspot => options.blindspotTypes!.includes(blindspot.type));
    }

    return filtered;
  }

  /**
   * 计算盲点分布
   * @param blindspots 盲点列表
   * @returns 盲点分布
   */
  private calculateBlindspotDistribution(blindspots: Blindspot[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    blindspots.forEach(blindspot => {
      distribution[blindspot.type] = (distribution[blindspot.type] || 0) + 1;
    });

    return distribution;
  }

  /**
   * 生成检测摘要
   * @param blindspots 盲点列表
   * @param distribution 盲点分布
   * @returns 检测摘要
   */
  private generateDetectionSummary(blindspots: Blindspot[], distribution: Record<string, number>): string {
    const totalBlindspots = blindspots.length;
    if (totalBlindspots === 0) {
      return '未检测到明显的认知盲点';
    }

    const typeSummary = Object.entries(distribution)
      .map(([type, count]) => `${type}: ${count}个`)
      .join(', ');

    return `共检测到 ${totalBlindspots} 个认知盲点，分布情况：${typeSummary}`;
  }

  /**
   * 生成改进建议
   * @param blindspots 盲点列表
   * @returns 改进建议
   */
  private generateRecommendations(blindspots: Blindspot[]): string[] {
    if (blindspots.length === 0) {
      return ['您的认知模型较为完整，继续保持'];
    }

    const recommendations: string[] = [
      '针对检测到的盲点，建议进一步深入学习相关概念',
      '尝试建立更多的概念连接，完善认知模型结构',
      '定期回顾认知模型，及时发现和弥补新的盲点'
    ];

    return recommendations;
  }
}
