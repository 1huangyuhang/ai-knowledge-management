import { VersionComparisonService } from './interfaces/evolution-history.interface';
import { ModelVersionDiff, ConceptDiff, RelationDiff, VersionComparisonReport } from './types/evolution-history.types';
export declare class VersionComparisonServiceImpl implements VersionComparisonService {
    private modelSnapshotService;
    private evolutionEventRepository;
    constructor(modelSnapshotService: any, evolutionEventRepository: any);
    compareVersions(userId: string, version1: string, version2: string): Promise<ModelVersionDiff>;
    getConceptDiff(userId: string, version1: string, version2: string): Promise<ConceptDiff>;
    getRelationDiff(userId: string, version1: string, version2: string): Promise<RelationDiff>;
    generateComparisonReport(userId: string, version1: string, version2: string): Promise<VersionComparisonReport>;
    private compareConcepts;
    private compareRelations;
    private areConceptsDifferent;
    private areRelationsDifferent;
    private generateChangeSummary;
    private generateRecommendations;
}
//# sourceMappingURL=version-comparison-service-impl.d.ts.map