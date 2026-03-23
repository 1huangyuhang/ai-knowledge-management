/**
 * 认知关系类型枚举
 */
export enum CognitiveRelationType {
  /**
   * 子概念关系（A是B的子概念）
   */
  SUBCONCEPT = 'subconcept',
  /**
   * 父概念关系（A是B的父概念）
   */
  SUPERCONCEPT = 'superconcept',
  /**
   * 关联关系（A与B相关）
   */
  ASSOCIATION = 'association',
  /**
   * 因果关系（A导致B）
   */
  CAUSALITY = 'causality',
  /**
   * 对比关系（A与B对比）
   */
  CONTRAST = 'contrast',
  /**
   * 示例关系（A是B的示例）
   */
  EXAMPLE = 'example',
  /**
   * 组成关系（A由B组成）
   */
  COMPOSITION = 'composition',
  /**
   * 属性关系（A具有B属性）
   */
  PROPERTY = 'property',
}

/**
 * 认知关系实体
 * 代表用户认知模型中概念之间的关系
 */
export interface CognitiveRelation {
  /**
   * 关系唯一标识符
   */
  readonly id: string;

  /**
   * 所属认知模型ID
   */
  modelId: string;

  /**
   * 源概念ID
   */
  sourceConceptId: string;

  /**
   * 目标概念ID
   */
  targetConceptId: string;

  /**
   * 关系类型
   */
  type: CognitiveRelationType;

  /**
   * 关系的置信度评分（0-1，1为最可信）
   */
  confidenceScore: number;

  /**
   * 关系的描述
   */
  description: string;

  /**
   * 关系的元数据
   */
  metadata: Record<string, any>;

  /**
   * 关系的创建时间
   */
  readonly createdAt: Date;

  /**
   * 关系的更新时间
   */
  updatedAt: Date;

  /**
   * 关系的来源思想片段ID
   */
  sourceThoughtIds: string[];

  /**
   * 更新关系信息
   * @param updates 要更新的关系信息
   */
  update(updates: Partial<Omit<CognitiveRelation, 'id' | 'createdAt'>>): void;

  /**
   * 添加来源思想片段
   * @param thoughtId 思想片段ID
   */
  addSourceThought(thoughtId: string): void;

  /**
   * 移除来源思想片段
   * @param thoughtId 思想片段ID
   */
  removeSourceThought(thoughtId: string): void;

  /**
   * 更新关系的置信度评分
   * @param score 新的置信度评分
   */
  updateConfidenceScore(score: number): void;
}

/**
 * CognitiveRelation实体的具体实现
 */
export class CognitiveRelationImpl implements CognitiveRelation {
  /**
   * 关系唯一标识符
   */
  public readonly id: string;

  /**
   * 所属认知模型ID
   */
  public modelId: string;

  /**
   * 源概念ID
   */
  public sourceConceptId: string;

  /**
   * 目标概念ID
   */
  public targetConceptId: string;

  /**
   * 关系类型
   */
  public type: CognitiveRelationType;

  /**
   * 关系的置信度评分（0-1，1为最可信）
   */
  public confidenceScore: number;

  /**
   * 关系的描述
   */
  public description: string;

  /**
   * 关系的元数据
   */
  public metadata: Record<string, any>;

  /**
   * 关系的创建时间
   */
  public readonly createdAt: Date;

  /**
   * 关系的更新时间
   */
  public updatedAt: Date;

  /**
   * 关系的来源思想片段ID
   */
  public sourceThoughtIds: string[];

  /**
   * 创建认知关系实例
   * @param id 关系ID
   * @param modelId 所属认知模型ID
   * @param sourceConceptId 源概念ID
   * @param targetConceptId 目标概念ID
   * @param type 关系类型
   * @param confidenceScore 关系的置信度评分（0-1）
   * @param description 关系的描述
   * @param metadata 关系的元数据
   * @param sourceThoughtIds 关系的来源思想片段ID列表
   * @param createdAt 关系的创建时间
   */
  constructor(
    id: string,
    modelId: string,
    sourceConceptId: string,
    targetConceptId: string,
    type: CognitiveRelationType,
    confidenceScore: number,
    description: string,
    metadata: Record<string, any> = {},
    sourceThoughtIds: string[] = [],
    createdAt: Date = new Date(),
  ) {
    this.id = id;
    this.modelId = modelId;
    this.sourceConceptId = sourceConceptId;
    this.targetConceptId = targetConceptId;
    this.type = type;
    this.confidenceScore = Math.max(0, Math.min(1, confidenceScore)); // 确保在0-1范围内
    this.description = description;
    this.metadata = metadata;
    this.sourceThoughtIds = sourceThoughtIds;
    this.createdAt = createdAt;
    this.updatedAt = new Date();
  }

  /**
   * 更新关系信息
   * @param updates 要更新的关系信息
   */
  public update(updates: Partial<Omit<CognitiveRelation, 'id' | 'createdAt'>>): void {
    if (updates.modelId !== undefined) {
      this.modelId = updates.modelId;
    }
    if (updates.sourceConceptId !== undefined) {
      this.sourceConceptId = updates.sourceConceptId;
    }
    if (updates.targetConceptId !== undefined) {
      this.targetConceptId = updates.targetConceptId;
    }
    if (updates.type !== undefined) {
      this.type = updates.type;
    }
    if (updates.confidenceScore !== undefined) {
      this.confidenceScore = Math.max(0, Math.min(1, updates.confidenceScore));
    }
    if (updates.description !== undefined) {
      this.description = updates.description;
    }
    if (updates.metadata !== undefined) {
      this.metadata = { ...this.metadata, ...updates.metadata };
    }
    if (updates.sourceThoughtIds !== undefined) {
      this.sourceThoughtIds = updates.sourceThoughtIds;
    }
    this.updatedAt = new Date();
  }

  /**
   * 添加来源思想片段
   * @param thoughtId 思想片段ID
   */
  public addSourceThought(thoughtId: string): void {
    if (!this.sourceThoughtIds.includes(thoughtId)) {
      this.sourceThoughtIds.push(thoughtId);
      this.updatedAt = new Date();
    }
  }

  /**
   * 移除来源思想片段
   * @param thoughtId 思想片段ID
   */
  public removeSourceThought(thoughtId: string): void {
    const index = this.sourceThoughtIds.indexOf(thoughtId);
    if (index > -1) {
      this.sourceThoughtIds.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * 更新关系的置信度评分
   * @param score 新的置信度评分
   */
  public updateConfidenceScore(score: number): void {
    this.confidenceScore = Math.max(0, Math.min(1, score));
    this.updatedAt = new Date();
  }
}
