import { UpdateSource } from '../model-update-service';

/**
 * 模型演化事件类型
 */
export enum ModelEvolutionEventType {
  /**
   * 模型创建
   */
  MODEL_CREATED = 'MODEL_CREATED',
  /**
   * 模型更新
   */
  MODEL_UPDATED = 'MODEL_UPDATED',
  /**
   * 概念添加
   */
  CONCEPT_ADDED = 'CONCEPT_ADDED',
  /**
   * 概念更新
   */
  CONCEPT_UPDATED = 'CONCEPT_UPDATED',
  /**
   * 概念删除
   */
  CONCEPT_REMOVED = 'CONCEPT_REMOVED',
  /**
   * 关系添加
   */
  RELATION_ADDED = 'RELATION_ADDED',
  /**
   * 关系更新
   */
  RELATION_UPDATED = 'RELATION_UPDATED',
  /**
   * 关系删除
   */
  RELATION_REMOVED = 'RELATION_REMOVED',
  /**
   * 模型重构
   */
  MODEL_RESTRUCTURED = 'MODEL_RESTRUCTURED',
  /**
   * 模型版本化
   */
  MODEL_VERSIONED = 'MODEL_VERSIONED'
}

/**
 * 模型演化事件
 */
export interface ModelEvolutionEvent {
  /**
   * 事件ID
   */
  id: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 事件类型
   */
  type: ModelEvolutionEventType;
  /**
   * 当前模型版本
   */
  version: string;
  /**
   * 事件发生时间
   */
  timestamp: Date;
  /**
   * 事件详细数据
   */
  data: {
    /**
     * 相关概念ID（如果有）
     */
    conceptIds?: string[];
    /**
     * 相关关系ID（如果有）
     */
    relationIds?: string[];
    /**
     * 更新前版本（如果是更新事件）
     */
    fromVersion?: string;
    /**
     * 更新后版本（如果是更新事件）
     */
    toVersion?: string;
    /**
     * 更新来源
     */
    source?: UpdateSource;
    /**
     * 更新置信度
     */
    confidenceScore?: number;
    /**
     * 相关思维片段ID
     */
    relatedThoughtIds?: string[];
    /**
     * 事件描述
     */
    description?: string;
  };
  /**
   * 事件元数据
   */
  metadata: {
    /**
     * 系统版本
     */
    systemVersion: string;
    /**
     * 处理节点ID
     */
    nodeId: string;
    /**
     * 是否为系统事件
     */
    isSystemEvent: boolean;
  };
}