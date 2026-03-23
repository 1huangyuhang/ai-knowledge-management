import { CognitiveConcept } from '../../../../domain/entities/cognitive-concept';

/**
 * 概念更新信息
 */
export interface ConceptUpdate {
  /**
   * 概念ID
   */
  id: string;
  /**
   * 更新前的概念
   */
  before: CognitiveConcept;
  /**
   * 更新后的概念
   */
  after: CognitiveConcept;
  /**
   * 更新的字段列表
   */
  updatedFields: string[];
}

/**
 * 概念差异
 */
export interface ConceptDiff {
  /**
   * 新增概念
   */
  added: CognitiveConcept[];
  /**
   * 更新的概念
   */
  updated: ConceptUpdate[];
  /**
   * 删除的概念ID列表
   */
  removed: string[];
}