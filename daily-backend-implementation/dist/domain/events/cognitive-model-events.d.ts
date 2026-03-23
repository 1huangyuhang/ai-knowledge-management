import { DomainEvent } from '../../infrastructure/events/event';
export declare class CognitiveModelCreatedEvent extends DomainEvent {
    readonly userId: string;
    readonly name: string;
    constructor(aggregateId: string, userId: string, name: string);
}
export declare class CognitiveModelUpdatedEvent extends DomainEvent {
    readonly userId: string;
    readonly name: string;
    readonly version: number;
    constructor(aggregateId: string, userId: string, name: string, version: number);
}
export declare class CognitiveModelActivatedEvent extends DomainEvent {
    readonly userId: string;
    constructor(aggregateId: string, userId: string);
}
//# sourceMappingURL=cognitive-model-events.d.ts.map