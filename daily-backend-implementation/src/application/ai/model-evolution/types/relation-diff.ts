import { CognitiveRelation } from '../../../../domain/entities/cognitive-relation';

/**
 * 关系更新信息
 */
export interface RelationUpdate {
  /**
   * 关系ID
   */
  id: string;
  /**
   * 更新前的关系
   */
  before: CognitiveRelation;
  /**
   * 更新后的关系
   */
  after: CognitiveRelation;
  /**
   * 更新的字段列表
   */
  updatedFields: string[];
}

/**
 * 关系差异
 */
export interface RelationDiff {
  /**
   * 新增关系
   */
  added: CognitiveRelation[];
  /**
   * 更新的关系
   */
  updated: RelationUpdate[];
  /**
   * 删除的关系ID列表
   */
  removed: string[];
}