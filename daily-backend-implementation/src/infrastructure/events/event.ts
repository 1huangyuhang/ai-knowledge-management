/**
 * 事件基类
 * 所有领域事件和集成事件的基类
 */
export interface Event {
  /**
   * 事件唯一标识符
   */
  readonly id: string;

  /**
   * 事件发生时间
   */
  readonly timestamp: Date;

  /**
   * 事件类型
   */
  readonly type: string;
}

/**
 * 领域事件基类
 * 用于域内通信的事件
 */
export abstract class DomainEvent implements Event {
  /**
   * 事件唯一标识符
   */
  public readonly id: string;

  /**
   * 事件发生时间
   */
  public readonly timestamp: Date;

  /**
   * 事件类型
   */
  public readonly type: string;

  /**
   * 构造函数
   * @param aggregateId 聚合根ID
   */
  constructor(
    public readonly aggregateId: string
  ) {
    this.id = this.generateId();
    this.timestamp = new Date();
    this.type = this.constructor.name;
  }

  /**
   * 生成事件ID
   * @returns 唯一事件ID
   */
  private generateId(): string {
    return `${this.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * 集成事件基类
 * 用于跨域或跨服务通信的事件
 */
export abstract class IntegrationEvent implements Event {
  /**
   * 事件唯一标识符
   */
  public readonly id: string;

  /**
   * 事件发生时间
   */
  public readonly timestamp: Date;

  /**
   * 事件类型
   */
  public readonly type: string;

  /**
   * 构造函数
   */
  constructor() {
    this.id = this.generateId();
    this.timestamp = new Date();
    this.type = this.constructor.name;
  }

  /**
   * 生成事件ID
   * @returns 唯一事件ID
   */
  private generateId(): string {
    return `${this.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
