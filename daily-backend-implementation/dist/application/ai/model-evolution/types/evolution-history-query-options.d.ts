import { ModelEvolutionEventType } from './model-evolution-event';
export interface EvolutionHistoryQueryOptions {
    startTime?: Date;
    endTime?: Date;
    eventTypes?: ModelEvolutionEventType[];
    versionRange?: {
        fromVersion?: string;
        toVersion?: string;
    };
    pagination?: {
        page: number;
        pageSize: number;
    };
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    conceptIds?: string[];
    relationIds?: string[];
}
//# sourceMappingURL=evolution-history-query-options.d.ts.map