import { ModelEvolutionEvent } from './model-evolution-event';
import { ModelSnapshot } from './model-snapshot';
import { EvolutionStatistics } from './evolution-statistics';
export interface ExportedHistory {
    exportId: string;
    exportTime: Date;
    format: string;
    userId: string;
    eventCount: number;
    snapshotCount: number;
    dataSize: number;
    events?: ModelEvolutionEvent[];
    snapshots?: ModelSnapshot[];
    statistics?: EvolutionStatistics;
    metadata: {
        systemVersion: string;
        exportConfig: {
            includeEvents: boolean;
            includeSnapshots: boolean;
            includeStatistics: boolean;
            timeRange?: {
                startTime?: Date;
                endTime?: Date;
            };
        };
    };
}
//# sourceMappingURL=exported-history.d.ts.map