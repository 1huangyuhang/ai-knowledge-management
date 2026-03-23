export interface EventHandler<T> {
    handle(event: T): Promise<void>;
}
export interface EventBus {
    publish<T>(event: T): Promise<void>;
    subscribe<T>(eventType: string, handler: EventHandler<T>): void;
    unsubscribe<T>(eventType: string, handler: EventHandler<T>): void;
    unsubscribeAll(): void;
}
export declare class InMemoryEventBus implements EventBus {
    private handlers;
    publish<T>(event: T): Promise<void>;
    subscribe<T>(eventType: string, handler: EventHandler<T>): void;
    unsubscribe<T>(eventType: string, handler: EventHandler<T>): void;
    unsubscribeAll(): void;
}
export declare const eventBus: InMemoryEventBus;
//# sourceMappingURL=event-bus.d.ts.map