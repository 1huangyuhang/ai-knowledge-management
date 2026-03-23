import { EvolutionHistoryService, EvolutionEventRepository, ModelSnapshotService, VersionComparisonService } from '../interfaces/evolution-history.interface';
import { ModelEvolutionEvent, EvolutionHistoryQueryOptions, ModelVersionDiff, HistoryRetentionPolicy, HistoryCleanupResult, ExportFormat, ExportOptions, ExportedHistory, TimeRange, EvolutionStatistics } from '../types/evolution-history.types';
export declare class EvolutionHistoryServiceImpl implements EvolutionHistoryService {
    private evolutionEventRepository;
    private modelSnapshotService;
    private versionComparisonService;
    constructor(evolutionEventRepository: EvolutionEventRepository, modelSnapshotService: ModelSnapshotService, versionComparisonService: VersionComparisonService);
    recordEvolutionEvent(event: ModelEvolutionEvent): Promise<boolean>;
    getEvolutionHistory(userId: string, options?: EvolutionHistoryQueryOptions): Promise<ModelEvolutionEvent[]>;
    getModelSnapshot(userId: string, versionId: string): Promise<any>;
    getVersionDiff(userId: string, fromVersion: string, toVersion: string): Promise<ModelVersionDiff>;
    cleanupOldHistory(userId: string, retentionPolicy: HistoryRetentionPolicy): Promise<HistoryCleanupResult>;
    exportEvolutionHistory(userId: string, format: ExportFormat, options?: ExportOptions): Promise<ExportedHistory>;
    getEvolutionStatistics(userId: string, timeRange: TimeRange): Promise<EvolutionStatistics>;
    private validateEvolutionEvent;
    private buildEvolutionEventQuery;
    private calculateEventTypeDistribution;
    private calculateSnapshotTypeDistribution;
    private calculateDailyAverage;
    private exportToCsv;
    private exportToXml;
}
//# sourceMappingURL=evolution-history-service-impl.d.ts.map