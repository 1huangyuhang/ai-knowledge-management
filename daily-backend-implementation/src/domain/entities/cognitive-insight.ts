/**
 * 认知洞察实体
 * 代表从用户认知模型分析中生成的洞察
 */
import { UUID } from '../value-objects/uuid';

export class CognitiveInsight {
  private readonly id: UUID;
  private readonly userId: UUID;
  private title: string;
  private description: string;
  private type: string;
  private priority: number;
  private isRead: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  /**
   * 创建CognitiveInsight实例
   * @param params CognitiveInsight参数
   */
  constructor(params: {
    id?: UUID;
    userId: UUID;
    title: string;
    description: string;
    type: string;
    priority?: number;
    isRead?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    if (!params.title || params.title.trim().length === 0) {
      throw new Error('Insight title cannot be empty');
    }

    this.id = params.id || UUID.generate();
    this.userId = params.userId;
    this.title = params.title;
    this.description = params.description;
    this.type = params.type;
    this.priority = this.validatePriority(params.priority || 1);
    this.isRead = params.isRead !== undefined ? params.isRead : false;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  /**
   * 获取认知洞察ID
   */
  getId(): UUID {
    return this.id;
  }

  /**
   * 获取用户ID
   */
  getUserId(): UUID {
    return this.userId;
  }

  /**
   * 获取认知洞察标题
   */
  getTitle(): string {
    return this.title;
  }

  /**
   * 设置认知洞察标题
   * @param title 新洞察标题
   */
  setTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Insight title cannot be empty');
    }
    this.title = title;
    this.updatedAt = new Date();
  }

  /**
   * 获取认知洞察描述
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * 设置认知洞察描述
   * @param description 新洞察描述
   */
  setDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  /**
   * 获取认知洞察类型
   */
  getType(): string {
    return this.type;
  }

  /**
   * 设置认知洞察类型
   * @param type 新洞察类型
   */
  setType(type: string): void {
    this.type = type;
    this.updatedAt = new Date();
  }

  /**
   * 获取认知洞察优先级
   */
  getPriority(): number {
    return this.priority;
  }

  /**
   * 设置认知洞察优先级
   * @param priority 新优先级（1-5）
   */
  setPriority(priority: number): void {
    this.priority = this.validatePriority(priority);
    this.updatedAt = new Date();
  }

  /**
   * 验证优先级是否在1-5之间
   * @param priority 要验证的优先级
   * @returns 验证后的优先级
   */
  private validatePriority(priority: number): number {
    if (priority < 1 || priority > 5) {
      throw new Error('Priority must be between 1 and 5');
    }
    return priority;
  }

  /**
   * 获取认知洞察是否已读
   */
  getIsRead(): boolean {
    return this.isRead;
  }

  /**
   * 标记认知洞察为已读
   */
  markAsRead(): void {
    this.isRead = true;
    this.updatedAt = new Date();
  }

  /**
   * 标记认知洞察为未读
   */
  markAsUnread(): void {
    this.isRead = false;
    this.updatedAt = new Date();
  }

  /**
   * 获取认知洞察创建时间
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * 获取认知洞察更新时间
   */
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * 比较两个CognitiveInsight是否相等
   * @param other 另一个CognitiveInsight实例
   * @returns 是否相等
   */
  equals(other: CognitiveInsight): boolean {
    return this.id.equals(other.getId());
  }
}
