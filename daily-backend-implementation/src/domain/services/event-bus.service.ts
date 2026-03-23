// 事件总线服务接口

/**
 * 事件处理函数类型
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * 事件总线接口
 * 用于模块间的事件通信
 */
export interface EventBus {
  /**
   * 发布事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  publish<T = any>(eventName: string, data: T): void;
  
  /**
   * 订阅事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @returns 取消订阅函数
   */
  subscribe<T = any>(eventName: string, handler: EventHandler<T>): () => void;
  
  /**
   * 取消订阅事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   */
  unsubscribe<T = any>(eventName: string, handler: EventHandler<T>): void;
}

// 事件总线实现类
export class EventBusImpl implements EventBus {
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  
  /**
   * 发布事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  publish<T = any>(eventName: string, data: T): void {
    const handlers = this.eventHandlers.get(eventName);
    if (!handlers) {
      return;
    }
    
    // 调用所有订阅者的处理函数
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error handling event ${eventName}:`, error);
      }
    });
  }
  
  /**
   * 订阅事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @returns 取消订阅函数
   */
  subscribe<T = any>(eventName: string, handler: EventHandler<T>): () => void {
    let handlers = this.eventHandlers.get(eventName);
    if (!handlers) {
      handlers = new Set();
      this.eventHandlers.set(eventName, handlers);
    }
    
    handlers.add(handler as EventHandler);
    
    // 返回取消订阅函数
    return () => this.unsubscribe(eventName, handler);
  }
  
  /**
   * 取消订阅事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   */
  unsubscribe<T = any>(eventName: string, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(eventName);
    if (!handlers) {
      return;
    }
    
    handlers.delete(handler as EventHandler);
    
    // 如果该事件没有订阅者了，移除事件条目
    if (handlers.size === 0) {
      this.eventHandlers.delete(eventName);
    }
  }
}

// 领域事件定义
export interface DomainEvent {
  /**
   * 事件唯一标识符
   */
  id: string;
  
  /**
   * 事件名称
   */
  name: string;
  
  /**
   * 事件发生时间
   */
  timestamp: Date;
}

// 思想片段摄入事件
export interface ThoughtIngestedEvent extends DomainEvent {
  thoughtId: string;
  content: string;
  userId: string;
}

// 认知建议生成事件
export interface CognitiveProposalGeneratedEvent extends DomainEvent {
  proposalId: string;
  thoughtId: string;
  userId: string;
}

// 认知模型更新事件
export interface CognitiveModelUpdatedEvent extends DomainEvent {
  modelId: string;
  userId: string;
  changes: {
    proposalId: string;
    addedConcepts: number;
    addedRelations: number;
  };
}

// 认知洞察生成事件
export interface InsightGeneratedEvent extends DomainEvent {
  insightId: string;
  modelId: string;
  userId: string;
}

// 事件名称常量
export const EVENT_NAMES = {
  THOUGHT_INGESTED: 'ThoughtIngested',
  COGNITIVE_PROPOSAL_GENERATED: 'CognitiveProposalGenerated',
  COGNITIVE_MODEL_UPDATED: 'CognitiveModelUpdated',
  INSIGHT_GENERATED: 'InsightGenerated'
} as const;