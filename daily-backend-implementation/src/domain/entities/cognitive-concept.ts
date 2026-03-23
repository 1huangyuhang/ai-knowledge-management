/**
 * 认知概念实体
 * 代表用户认知模型中的一个概念节点
 */
export interface CognitiveConcept {
  /**
   * 概念唯一标识符
   */
  readonly id: string;

  /**
   * 所属认知模型ID
   */
  modelId: string;

  /**
   * 概念的语义标识
   */
  semanticIdentity: string;

  /**
   * 概念的抽象级别（1-5，5为最高抽象级别）
   */
  abstractionLevel: number;

  /**
   * 概念的置信度评分（0-1，1为最可信）
   */
  confidenceScore: number;

  /**
   * 概念的描述
   */
  description: string;

  /**
   * 概念的元数据
   */
  metadata: Record<string, any>;

  /**
   * 概念的创建时间
   */
  readonly createdAt: Date;

  /**
   * 概念的更新时间
   */
  updatedAt: Date;

  /**
   * 概念的来源思想片段ID
   */
  sourceThoughtIds: string[];

  /**
   * 更新概念信息
   * @param updates 要更新的概念信息
   */
  update(updates: Partial<Omit<CognitiveConcept, 'id' | 'createdAt'>>): void;

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
   * 更新概念的置信度评分
   * @param score 新的置信度评分
   */
  updateConfidenceScore(score: number): void;
}

/**
 * CognitiveConcept实体的具体实现
 */
export class CognitiveConceptImpl implements CognitiveConcept {
  /**
   * 概念唯一标识符
   */
  public readonly id: string;

  /**
   * 所属认知模型ID
   */
  public modelId: string;

  /**
   * 概念的语义标识
   */
  public semanticIdentity: string;

  /**
   * 概念的抽象级别（1-5，5为最高抽象级别）
   */
  public abstractionLevel: number;

  /**
   * 概念的置信度评分（0-1，1为最可信）
   */
  public confidenceScore: number;

  /**
   * 概念的描述
   */
  public description: string;

  /**
   * 概念的元数据
   */
  public metadata: Record<string, any>;

  /**
   * 概念的创建时间
   */
  public readonly createdAt: Date;

  /**
   * 概念的更新时间
   */
  public updatedAt: Date;

  /**
   * 概念的来源思想片段ID
   */
  public sourceThoughtIds: string[];

  /**
   * 创建认知概念实例
   * @param id 概念ID
   * @param modelId 所属认知模型ID
   * @param semanticIdentity 概念的语义标识
   * @param abstractionLevel 概念的抽象级别（1-5）
   * @param confidenceScore 概念的置信度评分（0-1）
   * @param description 概念的描述
   * @param metadata 概念的元数据
   * @param sourceThoughtIds 概念的来源思想片段ID列表
   * @param createdAt 概念的创建时间
   */
  constructor(
    id: string,
    modelId: string,
    semanticIdentity: string,
    abstractionLevel: number,
    confidenceScore: number,
    description: string,
    metadata: Record<string, any> = {},
    sourceThoughtIds: string[] = [],
    createdAt: Date = new Date(),
  ) {
    this.id = id;
    this.modelId = modelId;
    this.semanticIdentity = semanticIdentity;
    this.abstractionLevel = Math.max(1, Math.min(5, abstractionLevel)); // 确保在1-5范围内
    this.confidenceScore = Math.max(0, Math.min(1, confidenceScore)); // 确保在0-1范围内
    this.description = description;
    this.metadata = metadata;
    this.sourceThoughtIds = sourceThoughtIds;
    this.createdAt = createdAt;
    this.updatedAt = new Date();
  }

  /**
   * 更新概念信息
   * @param updates 要更新的概念信息
   */
  public update(updates: Partial<Omit<CognitiveConcept, 'id' | 'createdAt'>>): void {
    if (updates.modelId !== undefined) {
      this.modelId = updates.modelId;
    }
    if (updates.semanticIdentity !== undefined) {
      this.semanticIdentity = updates.semanticIdentity;
    }
    if (updates.abstractionLevel !== undefined) {
      this.abstractionLevel = Math.max(1, Math.min(5, updates.abstractionLevel));
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
   * 更新概念的置信度评分
   * @param score 新的置信度评分
   */
  public updateConfidenceScore(score: number): void {
    this.confidenceScore = Math.max(0, Math.min(1, score));
    this.updatedAt = new Date();
  }
}
