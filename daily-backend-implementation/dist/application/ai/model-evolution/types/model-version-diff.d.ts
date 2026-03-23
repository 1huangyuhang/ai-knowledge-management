import { ConceptDiff } from './concept-diff';
import { RelationDiff } from './relation-diff';
export interface ModelVersionDiff {
    id: string;
    userId: string;
    fromVersion: string;
    toVersion: string;
    calculatedAt: Date;
    conceptDiff: ConceptDiff;
    relationDiff: RelationDiff;
    statistics: {
        totalChanges: number;
        conceptChanges: number;
        relationChanges: number;
        changePercentage: number;
    };
}
//# sourceMappingURL=model-version-diff.d.ts.map