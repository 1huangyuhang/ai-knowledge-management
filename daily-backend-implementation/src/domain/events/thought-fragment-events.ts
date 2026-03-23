/**
 * 思想片段创建事件
 * 当思想片段被创建时触发
 */
import { DomainEvent } from '../../infrastructure/events/event';

/**
 * 思想片段创建事件
 */
export class ThoughtFragmentCreatedEvent extends DomainEvent {
  /**
   * 构造函数
   * @param aggregateId 思想片段ID
   * @param userId 用户ID
   * @param content 思想片段内容
   */
  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly content: string
  ) {
    super(aggregateId);
  }
}

/**
 * 思想片段处理事件
 * 当思想片段被处理时触发
 */
export class ThoughtFragmentProcessedEvent extends DomainEvent {
  /**
   * 构造函数
   * @param aggregateId 思想片段ID
   * @param userId 用户ID
   * @param processedAt 处理时间
   */
  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly processedAt: Date
  ) {
    super(aggregateId);
  }
}
