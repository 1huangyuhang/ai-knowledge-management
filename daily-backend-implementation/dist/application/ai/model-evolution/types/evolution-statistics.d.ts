import { ModelEvolutionEventType } from './model-evolution-event';
export interface EvolutionEventStats {
    eventType: ModelEvolutionEventType;
    count: number;
    percentage: number;
}
export interface ConceptStats {
    totalCount: number;
    addedCount: number;
    updatedCount: number;
    removedCount: number;
    growthRate: number;
}
export interface RelationStats {
    totalCount: number;
    addedCount: number;
    updatedCount: number;
    removedCount: number;
    growthRate: number;
}
export interface EvolutionStatistics {
    statsId: string;
    userId: string;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    generatedAt: Date;
    totalEvents: number;
    eventTypeStats: EvolutionEventStats[];
    versionCount: number;
    snapshotCount: number;
    conceptStats: ConceptStats;
    relationStats: RelationStats;
    averageChangeFrequency: number;
    maxDaysWithoutChange: number;
    modelComplexityTrend: {
        date: Date;
        complexity: number;
    }[];
}
//# sourceMappingURL=evolution-statistics.d.ts.map