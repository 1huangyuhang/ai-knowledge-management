export interface Event {
    readonly id: string;
    readonly timestamp: Date;
    readonly type: string;
}
export declare abstract class DomainEvent implements Event {
    readonly aggregateId: string;
    readonly id: string;
    readonly timestamp: Date;
    readonly type: string;
    constructor(aggregateId: string);
    private generateId;
}
export declare abstract class IntegrationEvent implements Event {
    readonly id: string;
    readonly timestamp: Date;
    readonly type: string;
    constructor();
    private generateId;
}
//# sourceMappingURL=event.d.ts.map