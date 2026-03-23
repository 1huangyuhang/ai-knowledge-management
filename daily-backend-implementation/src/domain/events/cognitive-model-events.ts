/**
 * 认知模型事件
 */
import { DomainEvent } from '../../infrastructure/events/event';

/**
 * 认知模型创建事件
 */
export class CognitiveModelCreatedEvent extends DomainEvent {
  /**
   * 构造函数
   * @param aggregateId 认知模型ID
   * @param userId 用户ID
   * @param name 认知模型名称
   */
  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly name: string
  ) {
    super(aggregateId);
  }
}

/**
 * 认知模型更新事件
 */
export class CognitiveModelUpdatedEvent extends DomainEvent {
  /**
   * 构造函数
   * @param aggregateId 认知模型ID
   * @param userId 用户ID
   * @param name 认知模型名称
   * @param version 认知模型版本
   */
  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly version: number
  ) {
    super(aggregateId);
  }
}

/**
 * 认知模型激活事件
 */
export class CognitiveModelActivatedEvent extends DomainEvent {
  /**
   * 构造函数
   * @param aggregateId 认知模型ID
   * @param userId 用户ID
   */
  constructor(
    aggregateId: string,
    public readonly userId: string
  ) {
    super(aggregateId);
  }
}
