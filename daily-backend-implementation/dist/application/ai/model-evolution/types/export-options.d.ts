import { ModelEvolutionEventType } from './model-evolution-event';
export interface ExportOptions {
    includeEvents: boolean;
    includeSnapshots: boolean;
    eventTypes?: ModelEvolutionEventType[];
    startTime?: Date;
    endTime?: Date;
    includeStatistics: boolean;
    includeVersionDiffs: boolean;
    versionRange?: {
        fromVersion?: string;
        toVersion?: string;
    };
}
//# sourceMappingURL=export-options.d.ts.map