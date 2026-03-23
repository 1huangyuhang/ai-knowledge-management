/**
 * 认知建议实体
 * 代表AI从思想片段中提取的认知建议，用于更新用户的认知模型
 */
export interface CognitiveProposal {
  /**
   * 建议唯一标识符
   */
  readonly id: string;

  /**
   * 关联的思想片段ID
   */
  readonly thoughtId: string;

  /**
   * 建议中包含的概念
   */
  concepts: Array<{
    semanticIdentity: string;
    abstractionLevel: number;
    confidenceScore: number;
    description: string;
  }>;

  /**
   * 建议中包含的关系
   */
  relations: Array<{
    sourceSemanticIdentity: string;
    targetSemanticIdentity: string;
    type: string;
    confidenceScore: number;
    description: string;
  }>;

  /**
   * 建议的整体置信度（0-1，1为最可信）
   */
  confidence: number;

  /**
   * 建议的推理轨迹
   */
  reasoningTrace: string[];

  /**
   * 建议的创建时间
   */
  readonly createdAt: Date;

  /**
   * 建议是否已应用到认知模型
   */
  isApplied: boolean;

  /**
   * 应用建议的时间
   */
  appliedAt: Date | null;

  /**
   * 应用建议的用户ID
   */
  appliedBy: string | null;

  /**
   * 标记建议为已应用
   * @param userId 应用建议的用户ID
   */
  markAsApplied(userId: string): void;

  /**
   * 验证建议的有效性
   * @returns 如果建议有效返回true，否则返回false
   */
  validate(): boolean;
}

/**
 * CognitiveProposal实体的具体实现
 */
export class CognitiveProposalImpl implements CognitiveProposal {
  /**
   * 建议唯一标识符
   */
  public readonly id: string;

  /**
   * 关联的思想片段ID
   */
  public readonly thoughtId: string;

  /**
   * 建议中包含的概念
   */
  public concepts: Array<{
    semanticIdentity: string;
    abstractionLevel: number;
    confidenceScore: number;
    description: string;
  }>;

  /**
   * 建议中包含的关系
   */
  public relations: Array<{
    sourceSemanticIdentity: string;
    targetSemanticIdentity: string;
    type: string;
    confidenceScore: number;
    description: string;
  }>;

  /**
   * 建议的整体置信度（0-1，1为最可信）
   */
  public confidence: number;

  /**
   * 建议的推理轨迹
   */
  public reasoningTrace: string[];

  /**
   * 建议的创建时间
   */
  public readonly createdAt: Date;

  /**
   * 建议是否已应用到认知模型
   */
  public isApplied: boolean;

  /**
   * 应用建议的时间
   */
  public appliedAt: Date | null;

  /**
   * 应用建议的用户ID
   */
  public appliedBy: string | null;

  /**
   * 创建认知建议实例
   * @param id 建议ID
   * @param thoughtId 关联的思想片段ID
   * @param concepts 建议中包含的概念
   * @param relations 建议中包含的关系
   * @param confidence 建议的整体置信度
   * @param reasoningTrace 建议的推理轨迹
   * @param createdAt 创建时间
   */
  constructor(
    id: string,
    thoughtId: string,
    concepts: CognitiveProposal['concepts'],
    relations: CognitiveProposal['relations'],
    confidence: number,
    reasoningTrace: string[],
    createdAt: Date = new Date(),
  ) {
    this.id = id;
    this.thoughtId = thoughtId;
    this.concepts = concepts;
    this.relations = relations;
    this.confidence = Math.max(0, Math.min(1, confidence)); // 确保在0-1范围内
    this.reasoningTrace = reasoningTrace;
    this.createdAt = createdAt;
    this.isApplied = false;
    this.appliedAt = null;
    this.appliedBy = null;
  }

  /**
   * 标记建议为已应用
   * @param userId 应用建议的用户ID
   */
  public markAsApplied(userId: string): void {
    this.isApplied = true;
    this.appliedAt = new Date();
    this.appliedBy = userId;
  }

  /**
   * 验证建议的有效性
   * @returns 如果建议有效返回true，否则返回false
   */
  public validate(): boolean {
    // 基本验证：建议必须包含概念或关系
    if (this.concepts.length === 0 && this.relations.length === 0) {
      return false;
    }

    // 验证概念的有效性
    for (const concept of this.concepts) {
      if (!concept.semanticIdentity || concept.semanticIdentity.trim() === '') {
        return false;
      }
      if (concept.abstractionLevel < 1 || concept.abstractionLevel > 5) {
        return false;
      }
      if (concept.confidenceScore < 0 || concept.confidenceScore > 1) {
        return false;
      }
    }

    // 验证关系的有效性
    for (const relation of this.relations) {
      if (!relation.sourceSemanticIdentity || !relation.targetSemanticIdentity) {
        return false;
      }
      if (relation.confidenceScore < 0 || relation.confidenceScore > 1) {
        return false;
      }
    }

    // 验证整体置信度
    if (this.confidence < 0 || this.confidence > 1) {
      return false;
    }

    return true;
  }
}
