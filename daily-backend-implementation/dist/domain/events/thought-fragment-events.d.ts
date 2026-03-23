import { DomainEvent } from '../../infrastructure/events/event';
export declare class ThoughtFragmentCreatedEvent extends DomainEvent {
    readonly userId: string;
    readonly content: string;
    constructor(aggregateId: string, userId: string, content: string);
}
export declare class ThoughtFragmentProcessedEvent extends DomainEvent {
    readonly userId: string;
    readonly processedAt: Date;
    constructor(aggregateId: string, userId: string, processedAt: Date);
}
//# sourceMappingURL=thought-fragment-events.d.ts.map