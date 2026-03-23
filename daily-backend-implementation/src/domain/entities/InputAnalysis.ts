import { UUID } from '../value-objects/UUID';

/**
 * 输入分析实体
 * 表示对输入内容的分析结果
 */
export class InputAnalysis {
  /** 分析ID */
  readonly id: UUID;
  /** 关联的输入ID */
  readonly inputId: UUID;
  /** 分析类型 */
  readonly type: string;
  /** 分析结果 */
  readonly result: Record<string, any>;
  /** 分析状态 */
  readonly status: AnalysisStatus;
  /** 置信度 */
  readonly confidence: number;
  /** 创建时间 */
  readonly createdAt: Date;
  /** 更新时间 */
  readonly updatedAt: Date;

  constructor(props: {
    id?: UUID;
    inputId: UUID;
    type: string;
    result: Record<string, any>;
    status: AnalysisStatus;
    confidence: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id || UUID.generate();
    this.inputId = props.inputId;
    this.type = props.type;
    this.result = props.result;
    this.status = props.status;
    this.confidence = props.confidence;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * 更新分析结果
   * @param result 新的分析结果
   * @param confidence 置信度
   * @param status 分析状态
   * @returns 更新后的输入分析实体
   */
  update(
    result: Record<string, any>,
    confidence: number,
    status: AnalysisStatus
  ): InputAnalysis {
    return new InputAnalysis({
      ...this,
      result,
      confidence,
      status,
      updatedAt: new Date()
    });
  }
}

/**
 * 分析状态枚举
 */
export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * 分析类型枚举
 */
export enum AnalysisType {
  KEYWORD_EXTRACTION = 'keyword_extraction',
  TOPIC_RECOGNITION = 'topic_recognition',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  CONTENT_CLASSIFICATION = 'content_classification',
  SUMMARIZATION = 'summarization',
  ENTITY_RECOGNITION = 'entity_recognition',
  RELATION_EXTRACTION = 'relation_extraction',
  READABILITY_ANALYSIS = 'readability_analysis'
}
