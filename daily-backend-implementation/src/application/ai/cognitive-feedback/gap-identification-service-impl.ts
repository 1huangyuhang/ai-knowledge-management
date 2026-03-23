/**
 * 差距识别服务实现
 * 用于识别认知模型中的差距
 */
import { GapIdentificationService } from './gap-identification-service';
import { Gap, GapIdentificationResult, GapIdentificationOptions } from '../../../domain/ai/cognitive-feedback/cognitive-feedback';
import { CognitiveModelRepository } from '../../repositories/cognitive-model.repository';
import { v4 as uuidv4 } from 'uuid';

/**
 * 差距识别服务实现类
 */
export class GapIdentificationServiceImpl implements GapIdentificationService {
  constructor(
    private readonly cognitiveModelRepository: CognitiveModelRepository
  ) {}

  /**
   * 识别认知模型中的差距
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param options 识别选项
   * @returns 差距识别结果
   */
  async identifyGaps(
    userId: string,
    modelId: string,
    options?: GapIdentificationOptions
  ): Promise<GapIdentificationResult> {
    // 获取认知模型
    const model = await this.cognitiveModelRepository.getById(userId, modelId);
    if (!model) {
      throw new Error(`Cognitive model not found: ${modelId}`);
    }

    // 获取模型中的概念和关系
    const concepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
    const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);

    // 识别不同类型的差距
    const gaps: Gap[] = [];

    // 检测概念覆盖差距
    const conceptCoverageGaps = this.detectConceptCoverageGaps(concepts, relations);
    gaps.push(...conceptCoverageGaps);

    // 检测关系差距
    const relationGaps = this.detectRelationGaps(concepts, relations);
    gaps.push(...relationGaps);

    // 检测层次结构差距
    const hierarchyGaps = this.detectHierarchyGaps(concepts, relations);
    gaps.push(...hierarchyGaps);

    // 检测演化差距
    const evolutionGaps = this.detectEvolutionGaps(concepts, relations);
    gaps.push(...evolutionGaps);

    // 应用过滤选项
    const filteredGaps = this.filterGaps(gaps, options);

    // 计算差距分布
    const gapDistribution = this.calculateGapDistribution(filteredGaps);

    // 生成识别结果
    const result: GapIdentificationResult = {
      id: uuidv4(),
      gaps: filteredGaps,
      gapDistribution,
      summary: this.generateIdentificationSummary(filteredGaps, gapDistribution),
      recommendations: this.generateRecommendations(filteredGaps),
      createdAt: new Date()
    };

    return result;
  }

  /**
   * 识别概念间的差距
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param conceptIds 概念ID列表
   * @param options 识别选项
   * @returns 差距识别结果
   */
  async identifyGapsBetweenConcepts(
    userId: string,
    modelId: string,
    conceptIds: string[],
    options?: GapIdentificationOptions
  ): Promise<GapIdentificationResult> {
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

    // 仅保留与指定概念相关的关系
    const relevantRelations = relations.filter(relation => 
      conceptIds.includes(relation.sourceConceptId) || conceptIds.includes(relation.targetConceptId)
    );

    // 检测概念间的差距
    const gaps: Gap[] = [];

    // 检测概念覆盖差距
    const conceptCoverageGaps = this.detectConceptCoverageGaps(validConcepts, relevantRelations);
    gaps.push(...conceptCoverageGaps);

    // 检测关系差距
    const relationGaps = this.detectRelationGaps(validConcepts, relevantRelations);
    gaps.push(...relationGaps);

    // 应用过滤选项
    const filteredGaps = this.filterGaps(gaps, options);

    // 计算差距分布
    const gapDistribution = this.calculateGapDistribution(filteredGaps);

    // 生成识别结果
    const result: GapIdentificationResult = {
      id: uuidv4(),
      gaps: filteredGaps,
      gapDistribution,
      summary: this.generateIdentificationSummary(filteredGaps, gapDistribution),
      recommendations: this.generateRecommendations(filteredGaps),
      createdAt: new Date()
    };

    return result;
  }

  /**
   * 识别特定类型的差距
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param gapTypes 差距类型列表
   * @param options 识别选项
   * @returns 差距识别结果
   */
  async identifyGapsByType(
    userId: string,
    modelId: string,
    gapTypes: string[],
    options?: GapIdentificationOptions
  ): Promise<GapIdentificationResult> {
    // 获取认知模型
    const model = await this.cognitiveModelRepository.getById(userId, modelId);
    if (!model) {
      throw new Error(`Cognitive model not found: ${modelId}`);
    }

    // 获取模型中的概念和关系
    const concepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
    const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);

    // 识别不同类型的差距
    const gaps: Gap[] = [];

    // 根据类型识别差距
    if (gapTypes.includes('CONCEPT_COVERAGE')) {
      const conceptCoverageGaps = this.detectConceptCoverageGaps(concepts, relations);
      gaps.push(...conceptCoverageGaps);
    }

    if (gapTypes.includes('RELATION')) {
      const relationGaps = this.detectRelationGaps(concepts, relations);
      gaps.push(...relationGaps);
    }

    if (gapTypes.includes('HIERARCHY')) {
      const hierarchyGaps = this.detectHierarchyGaps(concepts, relations);
      gaps.push(...hierarchyGaps);
    }

    if (gapTypes.includes('EVOLUTION')) {
      const evolutionGaps = this.detectEvolutionGaps(concepts, relations);
      gaps.push(...evolutionGaps);
    }

    // 应用过滤选项
    const filteredGaps = this.filterGaps(gaps, options);

    // 计算差距分布
    const gapDistribution = this.calculateGapDistribution(filteredGaps);

    // 生成识别结果
    const result: GapIdentificationResult = {
      id: uuidv4(),
      gaps: filteredGaps,
      gapDistribution,
      summary: this.generateIdentificationSummary(filteredGaps, gapDistribution),
      recommendations: this.generateRecommendations(filteredGaps),
      createdAt: new Date()
    };

    return result;
  }

  /**
   * 识别与参考模型的差距
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param referenceModelId 参考模型ID
   * @param options 识别选项
   * @returns 差距识别结果
   */
  async identifyGapsFromReferenceModel(
    userId: string,
    modelId: string,
    referenceModelId: string,
    options?: GapIdentificationOptions
  ): Promise<GapIdentificationResult> {
    // 获取当前认知模型
    const model = await this.cognitiveModelRepository.getById(userId, modelId);
    if (!model) {
      throw new Error(`Cognitive model not found: ${modelId}`);
    }

    // 获取参考认知模型
    const referenceModel = await this.cognitiveModelRepository.getById(userId, referenceModelId);
    if (!referenceModel) {
      throw new Error(`Reference cognitive model not found: ${referenceModelId}`);
    }

    // 获取当前模型的概念和关系
    const currentConcepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
    const currentRelations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);

    // 获取参考模型的概念和关系
    const referenceConcepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, referenceModelId);
    const referenceRelations = await this.cognitiveModelRepository.getRelationsByModelId(userId, referenceModelId);

    // 识别与参考模型的差距
    const gaps: Gap[] = [];

    // 检测概念覆盖差距
    const conceptCoverageGaps = this.detectConceptCoverageGapWithReference(
      currentConcepts, 
      referenceConcepts,
      currentRelations,
      referenceRelations
    );
    gaps.push(...conceptCoverageGaps);

    // 应用过滤选项
    const filteredGaps = this.filterGaps(gaps, options);

    // 计算差距分布
    const gapDistribution = this.calculateGapDistribution(filteredGaps);

    // 生成识别结果
    const result: GapIdentificationResult = {
      id: uuidv4(),
      gaps: filteredGaps,
      gapDistribution,
      summary: this.generateIdentificationSummary(filteredGaps, gapDistribution),
      recommendations: this.generateRecommendations(filteredGaps),
      createdAt: new Date()
    };

    return result;
  }

  /**
   * 分析差距的影响
   * @param userId 用户ID
   * @param modelId 模型ID
   * @param gapId 差距ID
   * @returns 差距影响分析
   */
  async analyzeGapImpact(
    userId: string,
    modelId: string,
    gapId: string
  ): Promise<{ size: number; improvementDirection: string; }> {
    // 这里简化实现，实际应该根据差距ID获取差距并分析其影响
    return {
      size: 8.0, // 差距大小（0-10）
      improvementDirection: '建议深入学习相关概念，建立更多的概念连接，完善认知模型结构'
    };
  }

  /**
   * 检测概念覆盖差距
   * @param concepts 概念列表
   * @param relations 关系列表
   * @returns 概念覆盖差距列表
   */
  private detectConceptCoverageGaps(concepts: any[], relations: any[]): Gap[] {
    const gaps: Gap[] = [];

    // 简化实现，实际应该检测概念覆盖的完整性
    if (concepts.length < 5) {
      gaps.push({
        id: uuidv4(),
        description: '概念覆盖不足，认知模型可能不够完整',
        type: 'CONCEPT_COVERAGE',
        size: 6.5,
        relatedConcepts: [],
        relatedRelations: [],
        improvementDirection: '建议添加更多相关概念，丰富认知模型'
      });
    }

    return gaps;
  }

  /**
   * 检测关系差距
   * @param concepts 概念列表
   * @param relations 关系列表
   * @returns 关系差距列表
   */
  private detectRelationGaps(concepts: any[], relations: any[]): Gap[] {
    const gaps: Gap[] = [];

    // 计算概念数量和关系数量的比例
    const expectedRelations = concepts.length * 2; // 每个概念平均应该有2个关系
    if (relations.length < expectedRelations * 0.5) { // 如果关系数量少于预期的50%
      gaps.push({
        id: uuidv4(),
        description: '概念间关系不足，认知模型结构较为松散',
        type: 'RELATION',
        size: 7.0,
        relatedConcepts: [],
        relatedRelations: [],
        improvementDirection: '建议建立更多概念间的关系，加强认知模型的结构完整性'
      });
    }

    return gaps;
  }

  /**
   * 检测层次结构差距
   * @param concepts 概念列表
   * @param relations 关系列表
   * @returns 层次结构差距列表
   */
  private detectHierarchyGaps(concepts: any[], relations: any[]): Gap[] {
    const gaps: Gap[] = [];

    // 简化实现，实际应该检测层次结构的完整性
    const hierarchyRelations = relations.filter((relation: any) => 
      relation.type === 'IS_A' || relation.type === 'PART_OF'
    );

    if (hierarchyRelations.length < 2) {
      gaps.push({
        id: uuidv4(),
        description: '层次结构不清晰，缺乏明确的概念层级关系',
        type: 'HIERARCHY',
        size: 5.5,
        relatedConcepts: [],
        relatedRelations: [],
        improvementDirection: '建议建立明确的概念层级关系，如父子关系、部分整体关系等'
      });
    }

    return gaps;
  }

  /**
   * 检测演化差距
   * @param concepts 概念列表
   * @param relations 关系列表
   * @returns 演化差距列表
   */
  private detectEvolutionGaps(concepts: any[], relations: any[]): Gap[] {
    const gaps: Gap[] = [];

    // 简化实现，实际应该检测演化过程中的差距
    gaps.push({
      id: uuidv4(),
      description: '演化记录不足，难以追踪认知模型的发展变化',
      type: 'EVOLUTION',
      size: 4.5,
      relatedConcepts: [],
      relatedRelations: [],
      improvementDirection: '建议定期更新认知模型，记录概念和关系的演化过程'
    });

    return gaps;
  }

  /**
   * 检测与参考模型的概念覆盖差距
   * @param currentConcepts 当前概念列表
   * @param referenceConcepts 参考概念列表
   * @param currentRelations 当前关系列表
   * @param referenceRelations 参考关系列表
   * @returns 概念覆盖差距列表
   */
  private detectConceptCoverageGapWithReference(
    currentConcepts: any[],
    referenceConcepts: any[],
    currentRelations: any[],
    referenceRelations: any[]
  ): Gap[] {
    const gaps: Gap[] = [];

    // 获取参考模型中的概念名称集合
    const referenceConceptNames = new Set(referenceConcepts.map(concept => concept.name));
    const currentConceptNames = new Set(currentConcepts.map(concept => concept.name));

    // 找出参考模型中有而当前模型中没有的概念
    const missingConcepts = referenceConcepts.filter(concept => 
      !currentConceptNames.has(concept.name)
    );

    if (missingConcepts.length > 0) {
      gaps.push({
        id: uuidv4(),
        description: `与参考模型相比，缺少 ${missingConcepts.length} 个重要概念`,
        type: 'CONCEPT_COVERAGE',
        size: 7.5,
        relatedConcepts: [],
        relatedRelations: [],
        improvementDirection: `建议参考模型，添加缺失的概念：${missingConcepts.map(c => c.name).join(', ')}`
      });
    }

    return gaps;
  }

  /**
   * 过滤差距
   * @param gaps 差距列表
   * @param options 过滤选项
   * @returns 过滤后的差距列表
   */
  private filterGaps(gaps: Gap[], options?: GapIdentificationOptions): Gap[] {
    let filtered = [...gaps];

    // 按差距大小过滤
    if (options?.gapSizeThreshold !== undefined) {
      filtered = filtered.filter(gap => gap.size >= options.gapSizeThreshold!);
    }

    // 按类型过滤
    if (options?.gapTypes && options.gapTypes.length > 0) {
      filtered = filtered.filter(gap => options.gapTypes!.includes(gap.type));
    }

    return filtered;
  }

  /**
   * 计算差距分布
   * @param gaps 差距列表
   * @returns 差距分布
   */
  private calculateGapDistribution(gaps: Gap[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    gaps.forEach(gap => {
      distribution[gap.type] = (distribution[gap.type] || 0) + 1;
    });

    return distribution;
  }

  /**
   * 生成识别摘要
   * @param gaps 差距列表
   * @param distribution 差距分布
   * @returns 识别摘要
   */
  private generateIdentificationSummary(gaps: Gap[], distribution: Record<string, number>): string {
    const totalGaps = gaps.length;
    if (totalGaps === 0) {
      return '未检测到明显的认知差距';
    }

    const typeSummary = Object.entries(distribution)
      .map(([type, count]) => `${type}: ${count}个`)
      .join(', ');

    return `共识别到 ${totalGaps} 个认知差距，分布情况：${typeSummary}`;
  }

  /**
   * 生成改进建议
   * @param gaps 差距列表
   * @returns 改进建议
   */
  private generateRecommendations(gaps: Gap[]): string[] {
    if (gaps.length === 0) {
      return ['您的认知模型较为完善，继续保持'];
    }

    const recommendations: string[] = [
      '针对识别到的差距，建议进一步完善认知模型',
      '根据改进方向，添加缺失的概念和关系',
      '定期与参考模型进行比较，发现和弥补新的差距'
    ];

    return recommendations;
  }
}
