"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationEvent = exports.DomainEvent = void 0;
class DomainEvent {
    aggregateId;
    id;
    timestamp;
    type;
    constructor(aggregateId) {
        this.aggregateId = aggregateId;
        this.id = this.generateId();
        this.timestamp = new Date();
        this.type = this.constructor.name;
    }
    generateId() {
        return `${this.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
}
exports.DomainEvent = DomainEvent;
class IntegrationEvent {
    id;
    timestamp;
    type;
    constructor() {
        this.id = this.generateId();
        this.timestamp = new Date();
        this.type = this.constructor.name;
    }
    generateId() {
        return `${this.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
}
exports.IntegrationEvent = IntegrationEvent;
//# sourceMappingURL=event.js.map