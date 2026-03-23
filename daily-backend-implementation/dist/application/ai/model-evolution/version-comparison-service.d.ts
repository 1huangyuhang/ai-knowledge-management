import { ModelVersionDiff } from './types/model-version-diff';
import { ConceptDiff } from './types/concept-diff';
import { RelationDiff } from './types/relation-diff';
import { VersionComparisonReport } from './types/version-comparison-report';
export interface VersionComparisonService {
    compareVersions(userId: string, version1: string, version2: string): Promise<ModelVersionDiff>;
    getConceptDiff(userId: string, version1: string, version2: string): Promise<ConceptDiff>;
    getRelationDiff(userId: string, version1: string, version2: string): Promise<RelationDiff>;
    generateComparisonReport(userId: string, version1: string, version2: string): Promise<VersionComparisonReport>;
}
//# sourceMappingURL=version-comparison-service.d.ts.map