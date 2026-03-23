"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThoughtFragmentProcessedEvent = exports.ThoughtFragmentCreatedEvent = void 0;
const event_1 = require("../../infrastructure/events/event");
class ThoughtFragmentCreatedEvent extends event_1.DomainEvent {
    userId;
    content;
    constructor(aggregateId, userId, content) {
        super(aggregateId);
        this.userId = userId;
        this.content = content;
    }
}
exports.ThoughtFragmentCreatedEvent = ThoughtFragmentCreatedEvent;
class ThoughtFragmentProcessedEvent extends event_1.DomainEvent {
    userId;
    processedAt;
    constructor(aggregateId, userId, processedAt) {
        super(aggregateId);
        this.userId = userId;
        this.processedAt = processedAt;
    }
}
exports.ThoughtFragmentProcessedEvent = ThoughtFragmentProcessedEvent;
//# sourceMappingURL=thought-fragment-events.js.map