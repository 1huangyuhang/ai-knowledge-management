/**
 * 事件处理程序接口
 * 用于处理特定类型的事件
 */
export interface EventHandler<T> {
  /**
   * 处理事件
   * @param event 要处理的事件
   * @returns 处理结果的Promise
   */
  handle(event: T): Promise<void>;
}

/**
 * 事件总线接口
 * 用于发布和订阅事件
 */
export interface EventBus {
  /**
   * 发布事件
   * @param event 要发布的事件
   * @returns 发布结果的Promise
   */
  publish<T>(event: T): Promise<void>;

  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理程序
   */
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;

  /**
   * 取消订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理程序
   */
  unsubscribe<T>(eventType: string, handler: EventHandler<T>): void;

  /**
   * 取消所有订阅
   */
  unsubscribeAll(): void;
}

/**
 * 事件总线实现
 * 使用内存存储事件订阅和处理程序
 */
export class InMemoryEventBus implements EventBus {
  /**
   * 事件处理程序映射
   * 键：事件类型
   * 值：该事件类型的所有处理程序
   */
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  /**
   * 发布事件
   * @param event 要发布的事件
   * @returns 发布结果的Promise
   */
  async publish<T>(event: T): Promise<void> {
    const eventObj = event as any;
    const eventType = eventObj.type || (eventObj.constructor?.name || 'UnknownEvent');
    const eventHandlers = this.handlers.get(eventType) || [];

    // 并行处理所有事件处理程序
    await Promise.all(
      eventHandlers.map(handler => {
        try {
          return handler.handle(event);
        } catch (error) {
          console.error(`Error handling event ${eventType}:`, error);
          return Promise.resolve();
        }
      })
    );
  }

  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理程序
   */
  subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  /**
   * 取消订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理程序
   */
  unsubscribe<T>(eventType: string, handler: EventHandler<T>): void {
    const eventHandlers = this.handlers.get(eventType);
    if (!eventHandlers) {
      return;
    }
    const index = eventHandlers.indexOf(handler as any);
    if (index !== -1) {
      eventHandlers.splice(index, 1);
    }
    if (eventHandlers.length === 0) {
      this.handlers.delete(eventType);
    }
  }

  /**
   * 取消所有订阅
   */
  unsubscribeAll(): void {
    this.handlers.clear();
  }
}

/**
 * 事件总线单例实例
 */
export const eventBus = new InMemoryEventBus();
