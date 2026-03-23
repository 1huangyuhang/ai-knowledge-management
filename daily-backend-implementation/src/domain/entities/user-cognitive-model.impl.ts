// 认知模型实体实现类
import {
  CognitiveConcept,
  CognitiveInsight,
  CognitiveProposal,
  CognitiveRelation,
  CognitiveRelationType,
  EvolutionHistory,
  ThoughtFragment,
  UserCognitiveModel
} from './user-cognitive-model';

// 认知模型实现类
export class UserCognitiveModelImpl implements UserCognitiveModel {
  id: string;
  userId: string;
  concepts: CognitiveConcept[];
  relations: CognitiveRelation[];
  evolutionHistory: EvolutionHistory[];
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, userId: string) {
    this.id = id;
    this.userId = userId;
    this.concepts = [];
    this.relations = [];
    this.evolutionHistory = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addConcept(concept: CognitiveConcept): void {
    // 检查概念是否已存在
    const existingConcept = this.concepts.find(c => c.id === concept.id);
    if (existingConcept) {
      throw new Error(`Concept with id ${concept.id} already exists`);
    }
    
    this.concepts.push(concept);
    this.updatedAt = new Date();
    
    // 记录演化历史
    this.evolutionHistory.push({
      id: `${this.id}-${Date.now()}`,
      changeType: 'ADD_CONCEPT',
      changeContent: { concept },
      changedAt: new Date(),
      trigger: 'USER_ACTION'
    });
  }

  removeConcept(conceptId: string): void {
    const conceptIndex = this.concepts.findIndex(c => c.id === conceptId);
    if (conceptIndex === -1) {
      throw new Error(`Concept with id ${conceptId} not found`);
    }
    
    // 移除相关的关系
    this.relations = this.relations.filter(r => 
      r.sourceConceptId !== conceptId && r.targetConceptId !== conceptId
    );
    
    const removedConcept = this.concepts.splice(conceptIndex, 1)[0];
    this.updatedAt = new Date();
    
    // 记录演化历史
    this.evolutionHistory.push({
      id: `${this.id}-${Date.now()}`,
      changeType: 'REMOVE_CONCEPT',
      changeContent: { conceptId, removedConcept },
      changedAt: new Date(),
      trigger: 'USER_ACTION'
    });
  }

  updateConcept(concept: CognitiveConcept): void {
    const conceptIndex = this.concepts.findIndex(c => c.id === concept.id);
    if (conceptIndex === -1) {
      throw new Error(`Concept with id ${concept.id} not found`);
    }
    
    const oldConcept = this.concepts[conceptIndex];
    this.concepts[conceptIndex] = concept;
    this.updatedAt = new Date();
    
    // 记录演化历史
    this.evolutionHistory.push({
      id: `${this.id}-${Date.now()}`,
      changeType: 'UPDATE_CONCEPT',
      changeContent: { oldConcept, newConcept: concept },
      changedAt: new Date(),
      trigger: 'USER_ACTION'
    });
  }

  addRelation(relation: CognitiveRelation): void {
    // 检查关系是否已存在
    const existingRelation = this.relations.find(r => r.id === relation.id);
    if (existingRelation) {
      throw new Error(`Relation with id ${relation.id} already exists`);
    }
    
    // 检查源概念和目标概念是否存在
    const sourceConceptExists = this.concepts.some(c => c.id === relation.sourceConceptId);
    const targetConceptExists = this.concepts.some(c => c.id === relation.targetConceptId);
    
    if (!sourceConceptExists) {
      throw new Error(`Source concept with id ${relation.sourceConceptId} not found`);
    }
    
    if (!targetConceptExists) {
      throw new Error(`Target concept with id ${relation.targetConceptId} not found`);
    }
    
    this.relations.push(relation);
    this.updatedAt = new Date();
    
    // 记录演化历史
    this.evolutionHistory.push({
      id: `${this.id}-${Date.now()}`,
      changeType: 'ADD_RELATION',
      changeContent: { relation },
      changedAt: new Date(),
      trigger: 'USER_ACTION'
    });
  }

  removeRelation(relationId: string): void {
    const relationIndex = this.relations.findIndex(r => r.id === relationId);
    if (relationIndex === -1) {
      throw new Error(`Relation with id ${relationId} not found`);
    }
    
    const removedRelation = this.relations.splice(relationIndex, 1)[0];
    this.updatedAt = new Date();
    
    // 记录演化历史
    this.evolutionHistory.push({
      id: `${this.id}-${Date.now()}`,
      changeType: 'REMOVE_RELATION',
      changeContent: { relationId, removedRelation },
      changedAt: new Date(),
      trigger: 'USER_ACTION'
    });
  }

  applyProposal(proposal: CognitiveProposal): void {
    // 应用认知建议到认知模型
    
    // 1. 添加或更新概念
    proposal.concepts.forEach(concept => {
      try {
        this.addConcept(concept);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          // 概念已存在，尝试更新
          this.updateConcept(concept);
        } else {
          throw error;
        }
      }
    });
    
    // 2. 添加或更新关系
    proposal.relations.forEach(relation => {
      try {
        this.addRelation(relation);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          // 关系已存在，暂时忽略，因为关系更新逻辑复杂
          console.warn(`Relation ${relation.id} already exists, skipping`);
        } else {
          throw error;
        }
      }
    });
    
    // 记录演化历史
    this.evolutionHistory.push({
      id: `${this.id}-${Date.now()}`,
      changeType: 'APPLY_PROPOSAL',
      changeContent: { proposalId: proposal.id, conceptsCount: proposal.concepts.length, relationsCount: proposal.relations.length },
      changedAt: new Date(),
      trigger: 'AI_PROPOSAL'
    });
  }
}

// 认知概念实现类
export class CognitiveConceptImpl implements CognitiveConcept {
  id: string;
  semanticIdentity: string;
  abstractionLevel: number;
  confidenceScore: number;
  description: string;
  metadata?: Record<string, any>;

  constructor(
    id: string,
    semanticIdentity: string,
    abstractionLevel: number,
    confidenceScore: number,
    description: string,
    metadata?: Record<string, any>
  ) {
    this.id = id;
    this.semanticIdentity = semanticIdentity;
    this.abstractionLevel = abstractionLevel;
    this.confidenceScore = confidenceScore;
    this.description = description;
    this.metadata = metadata;
  }
}

// 认知关系实现类
export class CognitiveRelationImpl implements CognitiveRelation {
  id: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationType: CognitiveRelationType;
  strength: number;
  confidence: number;
  description?: string;

  constructor(
    id: string,
    sourceConceptId: string,
    targetConceptId: string,
    relationType: CognitiveRelationType,
    strength: number,
    confidence: number,
    description?: string
  ) {
    this.id = id;
    this.sourceConceptId = sourceConceptId;
    this.targetConceptId = targetConceptId;
    this.relationType = relationType;
    this.strength = strength;
    this.confidence = confidence;
    this.description = description;
  }
}

// 思想片段实现类
export class ThoughtFragmentImpl implements ThoughtFragment {
  id: string;
  content: string;
  metadata: Record<string, any>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    content: string,
    metadata: Record<string, any>,
    userId: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.content = content;
    this.metadata = metadata;
    this.userId = userId;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}

// 认知建议实现类
export class CognitiveProposalImpl implements CognitiveProposal {
  id: string;
  thoughtId: string;
  concepts: CognitiveConcept[];
  relations: CognitiveRelation[];
  confidence: number;
  reasoningTrace: string[];
  createdAt: Date;
  userId: string;

  constructor(
    id: string,
    thoughtId: string,
    concepts: CognitiveConcept[],
    relations: CognitiveRelation[],
    confidence: number,
    reasoningTrace: string[],
    userId: string,
    createdAt?: Date
  ) {
    this.id = id;
    this.thoughtId = thoughtId;
    this.concepts = concepts;
    this.relations = relations;
    this.confidence = confidence;
    this.reasoningTrace = reasoningTrace;
    this.createdAt = createdAt || new Date();
    this.userId = userId;
  }
}

// 认知洞察实现类
export class CognitiveInsightImpl implements CognitiveInsight {
  id: string;
  modelId: string;
  coreThemes: string[];
  blindSpots: string[];
  conceptGaps: string[];
  structureSummary: string;
  createdAt: Date;
  confidence: number;

  constructor(
    id: string,
    modelId: string,
    coreThemes: string[],
    blindSpots: string[],
    conceptGaps: string[],
    structureSummary: string,
    confidence: number,
    createdAt?: Date
  ) {
    this.id = id;
    this.modelId = modelId;
    this.coreThemes = coreThemes;
    this.blindSpots = blindSpots;
    this.conceptGaps = conceptGaps;
    this.structureSummary = structureSummary;
    this.createdAt = createdAt || new Date();
    this.confidence = confidence;
  }
}

// 演化历史实现类
export class EvolutionHistoryImpl implements EvolutionHistory {
  id: string;
  changeType: string;
  changeContent: Record<string, any>;
  changedAt: Date;
  trigger: string;

  constructor(
    id: string,
    changeType: string,
    changeContent: Record<string, any>,
    changedAt: Date,
    trigger: string
  ) {
    this.id = id;
    this.changeType = changeType;
    this.changeContent = changeContent;
    this.changedAt = changedAt;
    this.trigger = trigger;
  }
}