"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveModelActivatedEvent = exports.CognitiveModelUpdatedEvent = exports.CognitiveModelCreatedEvent = void 0;
const event_1 = require("../../infrastructure/events/event");
class CognitiveModelCreatedEvent extends event_1.DomainEvent {
    userId;
    name;
    constructor(aggregateId, userId, name) {
        super(aggregateId);
        this.userId = userId;
        this.name = name;
    }
}
exports.CognitiveModelCreatedEvent = CognitiveModelCreatedEvent;
class CognitiveModelUpdatedEvent extends event_1.DomainEvent {
    userId;
    name;
    version;
    constructor(aggregateId, userId, name, version) {
        super(aggregateId);
        this.userId = userId;
        this.name = name;
        this.version = version;
    }
}
exports.CognitiveModelUpdatedEvent = CognitiveModelUpdatedEvent;
class CognitiveModelActivatedEvent extends event_1.DomainEvent {
    userId;
    constructor(aggregateId, userId) {
        super(aggregateId);
        this.userId = userId;
    }
}
exports.CognitiveModelActivatedEvent = CognitiveModelActivatedEvent;
//# sourceMappingURL=cognitive-model-events.js.map