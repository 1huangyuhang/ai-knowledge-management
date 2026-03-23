"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.InMemoryEventBus = void 0;
class InMemoryEventBus {
    handlers = new Map();
    async publish(event) {
        const eventObj = event;
        const eventType = eventObj.type || (eventObj.constructor?.name || 'UnknownEvent');
        const eventHandlers = this.handlers.get(eventType) || [];
        await Promise.all(eventHandlers.map(handler => {
            try {
                return handler.handle(event);
            }
            catch (error) {
                console.error(`Error handling event ${eventType}:`, error);
                return Promise.resolve();
            }
        }));
    }
    subscribe(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)?.push(handler);
    }
    unsubscribe(eventType, handler) {
        const eventHandlers = this.handlers.get(eventType);
        if (!eventHandlers) {
            return;
        }
        const index = eventHandlers.indexOf(handler);
        if (index !== -1) {
            eventHandlers.splice(index, 1);
        }
        if (eventHandlers.length === 0) {
            this.handlers.delete(eventType);
        }
    }
    unsubscribeAll() {
        this.handlers.clear();
    }
}
exports.InMemoryEventBus = InMemoryEventBus;
exports.eventBus = new InMemoryEventBus();
//# sourceMappingURL=event-bus.js.map