"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_NAMES = exports.EventBusImpl = void 0;
class EventBusImpl {
    eventHandlers = new Map();
    publish(eventName, data) {
        const handlers = this.eventHandlers.get(eventName);
        if (!handlers) {
            return;
        }
        handlers.forEach(handler => {
            try {
                handler(data);
            }
            catch (error) {
                console.error(`Error handling event ${eventName}:`, error);
            }
        });
    }
    subscribe(eventName, handler) {
        let handlers = this.eventHandlers.get(eventName);
        if (!handlers) {
            handlers = new Set();
            this.eventHandlers.set(eventName, handlers);
        }
        handlers.add(handler);
        return () => this.unsubscribe(eventName, handler);
    }
    unsubscribe(eventName, handler) {
        const handlers = this.eventHandlers.get(eventName);
        if (!handlers) {
            return;
        }
        handlers.delete(handler);
        if (handlers.size === 0) {
            this.eventHandlers.delete(eventName);
        }
    }
}
exports.EventBusImpl = EventBusImpl;
exports.EVENT_NAMES = {
    THOUGHT_INGESTED: 'ThoughtIngested',
    COGNITIVE_PROPOSAL_GENERATED: 'CognitiveProposalGenerated',
    COGNITIVE_MODEL_UPDATED: 'CognitiveModelUpdated',
    INSIGHT_GENERATED: 'InsightGenerated'
};
//# sourceMappingURL=event-bus.service.js.map