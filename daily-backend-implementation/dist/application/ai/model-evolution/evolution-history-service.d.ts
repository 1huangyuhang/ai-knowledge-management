import { ModelEvolutionEvent } from './types/model-evolution-event';
import { ModelSnapshot } from './types/model-snapshot';
import { ModelVersionDiff } from './types/model-version-diff';
import { EvolutionHistoryQueryOptions } from './types/evolution-history-query-options';
import { HistoryRetentionPolicy } from './types/history-retention-policy';
import { HistoryCleanupResult } from './types/history-cleanup-result';
import { ExportFormat } from './types/export-format';
import { ExportOptions } from './types/export-options';
import { ExportedHistory } from './types/exported-history';
import { TimeRange } from './types/time-range';
import { EvolutionStatistics } from './types/evolution-statistics';
export interface EvolutionHistoryService {
    recordEvolutionEvent(event: ModelEvolutionEvent): Promise<boolean>;
    getEvolutionHistory(userId: string, options?: EvolutionHistoryQueryOptions): Promise<ModelEvolutionEvent[]>;
    getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null>;
    getVersionDiff(userId: string, fromVersion: string, toVersion: string): Promise<ModelVersionDiff>;
    cleanupOldHistory(userId: string, retentionPolicy: HistoryRetentionPolicy): Promise<HistoryCleanupResult>;
    exportEvolutionHistory(userId: string, format: ExportFormat, options?: ExportOptions): Promise<ExportedHistory>;
    getEvolutionStatistics(userId: string, timeRange: TimeRange): Promise<EvolutionStatistics>;
}
//# sourceMappingURL=evolution-history-service.d.ts.map