import { UUID } from '../value-objects/UUID';
import { SuggestionType } from '../enums/SuggestionType';
import { SuggestionCategory } from '../enums/SuggestionCategory';

/**
 * 简单的Entity基类，用于临时替代核心Domain的Entity模块
 */
abstract class Entity {
  constructor(protected _id: UUID) {
  }
  
  get id(): UUID {
    return this._id;
  }
}

/**
 * 建议实体
 * 表示系统生成的认知改进建议
 */
export class Suggestion extends Entity {
  private _type: SuggestionType;
  private _content: string;
  private _description: string;
  private _priority: number;
  private _confidence: number;
  private _relatedConcepts: string[];
  private _actionItems: string[];
  private _category: SuggestionCategory;
  private _metadata: Record<string, any>;
  private _userId: string;
  private _cognitiveModelId: string;
  private _context?: string;

  constructor(
    id: UUID,
    type: SuggestionType,
    content: string,
    description: string,
    priority: number,
    confidence: number,
    relatedConcepts: string[],
    actionItems: string[],
    category: SuggestionCategory,
    userId: string,
    cognitiveModelId: string,
    context?: string,
    metadata: Record<string, any> = {}
  ) {
    super(id);
    this._type = type;
    this._content = content;
    this._description = description;
    this._priority = priority;
    this._confidence = confidence;
    this._relatedConcepts = relatedConcepts;
    this._actionItems = actionItems;
    this._category = category;
    this._metadata = metadata;
    this._userId = userId;
    this._cognitiveModelId = cognitiveModelId;
    this._context = context;
  }

  /**
   * 获取建议类型
   */
  public get type(): SuggestionType {
    return this._type;
  }

  /**
   * 获取建议内容
   */
  public get content(): string {
    return this._content;
  }

  /**
   * 获取建议描述
   */
  public get description(): string {
    return this._description;
  }

  /**
   * 获取建议优先级
   */
  public get priority(): number {
    return this._priority;
  }

  /**
   * 获取建议置信度
   */
  public get confidence(): number {
    return this._confidence;
  }

  /**
   * 获取相关概念列表
   */
  public get relatedConcepts(): string[] {
    return [...this._relatedConcepts];
  }

  /**
   * 获取行动项列表
   */
  public get actionItems(): string[] {
    return [...this._actionItems];
  }

  /**
   * 获取建议类别
   */
  public get category(): SuggestionCategory {
    return this._category;
  }

  /**
   * 获取元数据
   */
  public get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  /**
   * 获取用户ID
   */
  public get userId(): string {
    return this._userId;
  }

  /**
   * 获取认知模型ID
   */
  public get cognitiveModelId(): string {
    return this._cognitiveModelId;
  }

  /**
   * 获取上下文信息
   */
  public get context(): string | undefined {
    return this._context;
  }

  /**
   * 设置建议优先级
   */
  public setPriority(priority: number): void {
    if (priority < 0 || priority > 10) {
      throw new Error('优先级必须在0-10之间');
    }
    this._priority = priority;
  }

  /**
   * 设置建议置信度
   */
  public setConfidence(confidence: number): void {
    if (confidence < 0 || confidence > 1) {
      throw new Error('置信度必须在0-1之间');
    }
    this._confidence = confidence;
  }

  /**
   * 添加相关概念
   */
  public addRelatedConcept(concept: string): void {
    if (!this._relatedConcepts.includes(concept)) {
      this._relatedConcepts.push(concept);
    }
  }

  /**
   * 添加行动项
   */
  public addActionItem(actionItem: string): void {
    if (!this._actionItems.includes(actionItem)) {
      this._actionItems.push(actionItem);
    }
  }

  /**
   * 更新元数据
   */
  public updateMetadata(key: string, value: any): void {
    this._metadata[key] = value;
  }
}