// 认知模型实体接口定义
export interface UserCognitiveModel {
  /**
   * 认知模型唯一标识符
   */
  id: string;
  
  /**
   * 用户唯一标识符
   */
  userId: string;
  
  /**
   * 认知概念集合
   */
  concepts: CognitiveConcept[];
  
  /**
   * 认知关系集合
   */
  relations: CognitiveRelation[];
  
  /**
   * 演化历史记录
   */
  evolutionHistory: EvolutionHistory[];
  
  /**
   * 创建时间
   */
  createdAt: Date;
  
  /**
   * 更新时间
   */
  updatedAt: Date;
  
  /**
   * 添加认知概念
   * @param concept 认知概念
   */
  addConcept(concept: CognitiveConcept): void;
  
  /**
   * 移除认知概念
   * @param conceptId 认知概念ID
   */
  removeConcept(conceptId: string): void;
  
  /**
   * 更新认知概念
   * @param concept 认知概念
   */
  updateConcept(concept: CognitiveConcept): void;
  
  /**
   * 添加认知关系
   * @param relation 认知关系
   */
  addRelation(relation: CognitiveRelation): void;
  
  /**
   * 移除认知关系
   * @param relationId 认知关系ID
   */
  removeRelation(relationId: string): void;
  
  /**
   * 应用认知建议
   * @param proposal 认知建议
   */
  applyProposal(proposal: CognitiveProposal): void;
}

// 认知概念接口定义
export interface CognitiveConcept {
  /**
   * 认知概念唯一标识符
   */
  id: string;
  
  /**
   * 语义标识
   */
  semanticIdentity: string;
  
  /**
   * 抽象层级
   */
  abstractionLevel: number;
  
  /**
   * 置信度评分
   */
  confidenceScore: number;
  
  /**
   * 描述
   */
  description: string;
  
  /**
   * 元数据
   */
  metadata?: Record<string, any>;
}

// 认知关系接口定义
export interface CognitiveRelation {
  /**
   * 认知关系唯一标识符
   */
  id: string;
  
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
  relationType: CognitiveRelationType;
  
  /**
   * 关系强度
   */
  strength: number;
  
  /**
   * 置信度
   */
  confidence: number;
  
  /**
   * 描述
   */
  description?: string;
}

// 认知关系类型枚举
export enum CognitiveRelationType {
  /**
   * 父子关系
   */
  PARENT_CHILD = 'PARENT_CHILD',
  
  /**
   * 关联关系
   */
  ASSOCIATION = 'ASSOCIATION',
  
  /**
   * 因果关系
   */
  CAUSAL = 'CAUSAL',
  
  /**
   * 对比关系
   */
  CONTRAST = 'CONTRAST',
  
  /**
   * 依赖关系
   */
  DEPENDENCY = 'DEPENDENCY'
}

// 演化历史接口定义
export interface EvolutionHistory {
  /**
   * 演化记录唯一标识符
   */
  id: string;
  
  /**
   * 变更类型
   */
  changeType: string;
  
  /**
   * 变更内容
   */
  changeContent: Record<string, any>;
  
  /**
   * 变更时间
   */
  changedAt: Date;
  
  /**
   * 触发源
   */
  trigger: string;
}

// 认知建议接口定义
export interface CognitiveProposal {
  /**
   * 建议唯一标识符
   */
  id: string;
  
  /**
   * 关联的思想片段ID
   */
  thoughtId: string;
  
  /**
   * 建议包含的认知概念
   */
  concepts: CognitiveConcept[];
  
  /**
   * 建议包含的认知关系
   */
  relations: CognitiveRelation[];
  
  /**
   * 建议置信度
   */
  confidence: number;
  
  /**
   * 推理痕迹
   */
  reasoningTrace: string[];
  
  /**
   * 创建时间
   */
  createdAt: Date;
  
  /**
   * 用户ID
   */
  userId: string;
}

// 认知洞察接口定义
export interface CognitiveInsight {
  /**
   * 洞察唯一标识符
   */
  id: string;
  
  /**
   * 关联的认知模型ID
   */
  modelId: string;
  
  /**
   * 核心主题
   */
  coreThemes: string[];
  
  /**
   * 认知盲点
   */
  blindSpots: string[];
  
  /**
   * 概念缺口
   */
  conceptGaps: string[];
  
  /**
   * 结构总结
   */
  structureSummary: string;
  
  /**
   * 创建时间
   */
  createdAt: Date;
  
  /**
   * 置信度
   */
  confidence: number;
}

// 思想片段接口定义
export interface ThoughtFragment {
  /**
   * 思想片段唯一标识符
   */
  id: string;
  
  /**
   * 思想内容
   */
  content: string;
  
  /**
   * 元数据
   */
  metadata: Record<string, any>;
  
  /**
   * 用户ID
   */
  userId: string;
  
  /**
   * 创建时间
   */
  createdAt: Date;
  
  /**
   * 更新时间
   */
  updatedAt: Date;
}