export type EventHandler<T = any> = (event: T) => void;
export interface EventBus {
    publish<T = any>(eventName: string, data: T): void;
    subscribe<T = any>(eventName: string, handler: EventHandler<T>): () => void;
    unsubscribe<T = any>(eventName: string, handler: EventHandler<T>): void;
}
export declare class EventBusImpl implements EventBus {
    private eventHandlers;
    publish<T = any>(eventName: string, data: T): void;
    subscribe<T = any>(eventName: string, handler: EventHandler<T>): () => void;
    unsubscribe<T = any>(eventName: string, handler: EventHandler<T>): void;
}
export interface DomainEvent {
    id: string;
    name: string;
    timestamp: Date;
}
export interface ThoughtIngestedEvent extends DomainEvent {
    thoughtId: string;
    content: string;
    userId: string;
}
export interface CognitiveProposalGeneratedEvent extends DomainEvent {
    proposalId: string;
    thoughtId: string;
    userId: string;
}
export interface CognitiveModelUpdatedEvent extends DomainEvent {
    modelId: string;
    userId: string;
    changes: {
        proposalId: string;
        addedConcepts: number;
        addedRelations: number;
    };
}
export interface InsightGeneratedEvent extends DomainEvent {
    insightId: string;
    modelId: string;
    userId: string;
}
export declare const EVENT_NAMES: {
    readonly THOUGHT_INGESTED: "ThoughtIngested";
    readonly COGNITIVE_PROPOSAL_GENERATED: "CognitiveProposalGenerated";
    readonly COGNITIVE_MODEL_UPDATED: "CognitiveModelUpdated";
    readonly INSIGHT_GENERATED: "InsightGenerated";
};
//# sourceMappingURL=event-bus.service.d.ts.map